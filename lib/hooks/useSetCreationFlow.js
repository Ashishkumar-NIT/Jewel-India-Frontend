"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useCredits } from "../../context/CreditsContext";
import { triggerSetCreation } from "../api/setCreation";
import {
  createSetGeneration,
  fetchSetGeneration,
  fetchSetGallery,
  fetchCatalogueProducts,
  uploadSetSourceImage,
  getSignedOutputUrl,
  productImageUrl,
  DEFAULT_BACKDROP,
} from "../supabase/set-creation-queries";

const POLL_INTERVAL_MS = 3000;

// Measured against the live API on 2026-08-29: a two-image composition took
// ~95 seconds end to end. Chamak's poller allows 40 x 2500ms = 100s, which
// would have declared that run a failure with barely 5 seconds of headroom.
// 80 x 3000ms = 240s gives real room without leaving a wholesaler staring at
// a spinner forever.
const MAX_POLL_ATTEMPTS = 80;

export function useSetCreationFlow(wholesalerId, userId) {
  const effectiveUserId = userId || wholesalerId;
  const { wallet, costOf, refresh: refreshCredits } = useCredits();

  const [step, setStep] = useState("picker"); // picker | styling | generating | result | failed | gallery
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [galleryGenerations, setGalleryGenerations] = useState([]);
  const [selectedPiece1, setSelectedPiece1] = useState(null); // { imageUrl, label, productId?, file? }
  const [selectedPiece2, setSelectedPiece2] = useState(null);
  const [backdrop, setBackdrop] = useState(DEFAULT_BACKDROP);
  const [noteText, setNoteText] = useState("");
  const [currentGeneration, setCurrentGeneration] = useState(null);
  const [signedOutputImageUrl, setSignedOutputImageUrl] = useState("");

  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [insufficientCredits, setInsufficientCredits] = useState({
    isOpen: false,
    required: 8,
    balance: 0,
    shortBy: 8,
  });

  const pollRef = useRef(null);
  const idempotencyKeyRef = useRef(null);

  const cost = costOf?.("chamak.set_creation") ?? 8;

  // ── Load catalogue + past sets ────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!effectiveUserId) return;
    setIsLoadingProducts(true);
    try {
      const [prods, gallery] = await Promise.all([
        fetchCatalogueProducts(effectiveUserId),
        fetchSetGallery(effectiveUserId),
      ]);
      setCatalogProducts(prods);
      setGalleryGenerations(gallery);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [effectiveUserId]);

  useEffect(() => {
    loadData();
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [loadData]);

  // ── Selection ─────────────────────────────────────────────────────────────
  // Slot assignment needs to read the current state of both slots, so this
  // is a plain callback rather than functional setState.
  const pickProduct = useCallback(
    (product) => {
      const url = productImageUrl(product);
      if (!url) return;
      const item = {
        imageUrl: url,
        label: product.title || product.jewellery_type || "Catalogue piece",
        productId: product.id,
        file: null,
      };

      if (selectedPiece1?.productId === product.id) {
        setSelectedPiece1(null);
        return;
      }
      if (selectedPiece2?.productId === product.id) {
        setSelectedPiece2(null);
        return;
      }
      if (!selectedPiece1) {
        setSelectedPiece1(item);
        return;
      }
      setSelectedPiece2(item);
    },
    [selectedPiece1, selectedPiece2]
  );

  const setCustomFile = useCallback((file, slot) => {
    setUploadError("");
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      setUploadError("That file isn't an image. Please choose a photo.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("That photo is over 10 MB. Please choose a smaller one.");
      return;
    }
    const item = {
      imageUrl: URL.createObjectURL(file),
      label: slot === 1 ? "Your photo 1" : "Your photo 2",
      productId: null,
      file,
    };
    if (slot === 1) setSelectedPiece1(item);
    else setSelectedPiece2(item);
  }, []);

  const clearSlot = useCallback((slot) => {
    if (slot === 1) setSelectedPiece1(null);
    else setSelectedPiece2(null);
  }, []);

  const canProceed = Boolean(
    selectedPiece1?.imageUrl &&
      selectedPiece2?.imageUrl &&
      // Two catalogue picks must be different products. Two uploads always
      // differ by File object, so only the product id can collide.
      !(
        selectedPiece1.productId &&
        selectedPiece1.productId === selectedPiece2.productId
      )
  );

  // ── Polling ───────────────────────────────────────────────────────────────
  const startPolling = useCallback(
    (generationId) => {
      let attempts = 0;

      const tick = async () => {
        attempts += 1;
        try {
          const row = await fetchSetGeneration(generationId);
          setCurrentGeneration(row);

          if (row.status === "done") {
            if (row.output_image_url) {
              setSignedOutputImageUrl(await getSignedOutputUrl(row.output_image_url));
            }
            idempotencyKeyRef.current = null;
            setStep("result");
            refreshCredits?.();
            fetchSetGallery(effectiveUserId).then(setGalleryGenerations);
            return;
          }

          if (row.status === "failed") {
            setErrorMessage(
              "The set couldn't be generated. Your credits have been refunded."
            );
            setStep("failed");
            refreshCredits?.();
            return;
          }
        } catch {
          // Transient fetch failures are not fatal — keep polling.
        }

        if (attempts >= MAX_POLL_ATTEMPTS) {
          setErrorMessage(
            "This is taking longer than expected. Check your gallery in a few minutes — it may still finish."
          );
          setStep("failed");
          return;
        }
        pollRef.current = setTimeout(tick, POLL_INTERVAL_MS);
      };

      pollRef.current = setTimeout(tick, POLL_INTERVAL_MS);
    },
    [effectiveUserId, refreshCredits]
  );

  // ── Generate ──────────────────────────────────────────────────────────────
  const generate = useCallback(async () => {
    if (!canProceed || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setStep("generating");

    try {
      // Upload any of the wholesaler's own photos first. Catalogue picks
      // already have a public URL and are used as-is.
      let url1 = selectedPiece1.imageUrl;
      let url2 = selectedPiece2.imageUrl;

      if (selectedPiece1.file) {
        url1 = await uploadSetSourceImage(selectedPiece1.file, effectiveUserId, 1);
      }
      if (selectedPiece2.file) {
        url2 = await uploadSetSourceImage(selectedPiece2.file, effectiveUserId, 2);
      }

      const row = await createSetGeneration({
        wholesaler_id: effectiveUserId,
        source_image_1_url: url1,
        source_image_2_url: url2,
        set_backdrop: backdrop,
        note_text: noteText,
      });
      setCurrentGeneration(row);

      // Reused across retries of the SAME attempt so a network retry cannot
      // double-charge. Cleared on success, so a deliberate re-roll is a new
      // key and is charged as a re-roll.
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current =
          globalThis.crypto?.randomUUID?.() ?? `${row.id}-${Date.now()}`;
      }

      await triggerSetCreation(row.id, idempotencyKeyRef.current);
      startPolling(row.id);
    } catch (err) {
      if (err.status === 402 && err.insufficientCredits) {
        const d = err.insufficientCredits;
        setInsufficientCredits({
          isOpen: true,
          required: d.required ?? cost,
          balance: d.balance ?? wallet?.available ?? 0,
          shortBy: d.short_by ?? d.shortBy ?? cost,
        });
        setStep("styling"); // inputs preserved so nothing is retyped
      } else {
        setErrorMessage(err.message || "Something went wrong. Please try again.");
        setStep("failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    canProceed,
    isSubmitting,
    selectedPiece1,
    selectedPiece2,
    backdrop,
    noteText,
    effectiveUserId,
    cost,
    wallet,
    startPolling,
  ]);

  const reset = useCallback(() => {
    if (pollRef.current) clearTimeout(pollRef.current);
    setSelectedPiece1(null);
    setSelectedPiece2(null);
    setBackdrop(DEFAULT_BACKDROP);
    setNoteText("");
    setCurrentGeneration(null);
    setSignedOutputImageUrl("");
    setErrorMessage("");
    idempotencyKeyRef.current = null;
    setStep("picker");
  }, []);

  const openGalleryItem = useCallback(async (item) => {
    setCurrentGeneration(item);
    if (item.output_image_url) {
      setSignedOutputImageUrl(await getSignedOutputUrl(item.output_image_url));
    }
    setStep("result");
  }, []);

  return {
    step,
    setStep,
    catalogProducts,
    galleryGenerations,
    selectedPiece1,
    selectedPiece2,
    backdrop,
    setBackdrop,
    noteText,
    setNoteText,
    currentGeneration,
    signedOutputImageUrl,
    isLoadingProducts,
    isSubmitting,
    errorMessage,
    uploadError,
    insufficientCredits,
    closeInsufficientCredits: () =>
      setInsufficientCredits((s) => ({ ...s, isOpen: false })),
    cost,
    wallet,
    pickProduct,
    setCustomFile,
    clearSlot,
    canProceed,
    generate,
    reset,
    openGalleryItem,
    reload: loadData,
  };
}
