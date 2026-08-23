"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useCredits } from "../../context/CreditsContext";
import { triggerAnalysis, triggerGenerate } from "../api/chamak";
import {
  createGeneration,
  fetchGeneration,
  fetchGallery,
  updateGenerationForm,
  uploadSourceImage,
  getSignedOutputUrl,
  insertFeedback,
} from "../supabase/chamak-queries";
import { createClient } from "../supabase/client";

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 40; // ~100 seconds

export function useChamakFlow(wholesalerId, userId) {
  const effectiveUserId = userId || wholesalerId;
  const { wallet, rateCard, costOf, refresh: refreshCredits, isLoading: creditsLoading } = useCredits();

  const [step, setStep] = useState("picker"); // picker | analyzing | sliderForm | generating | result | failed | gallery
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [galleryGenerations, setGalleryGenerations] = useState([]);
  const [selectedDesign1, setSelectedDesign1] = useState(null); // { product?, customFile?, imageUrl, label }
  const [selectedDesign2, setSelectedDesign2] = useState(null);
  const [currentGeneration, setCurrentGeneration] = useState(null);
  const [signedOutputImageUrl, setSignedOutputImageUrl] = useState("");
  const [sliderValues, setSliderValues] = useState({});
  const [noteText, setNoteText] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadError, setUploadError] = useState(""); // Fix #1: Surfaced for file pick/decode errors
  const [feedbackState, setFeedbackState] = useState({
    isOpen: false,
    isSubmitting: false,
    error: null,
    submitted: false,
  });

  // 402 Insufficient credits modal state (Preserves form inputs)
  const [insufficientCredits, setInsufficientCredits] = useState({
    isOpen: false,
    required: 10,
    balance: 0,
    shortBy: 10,
  });

  // Idempotency key stored across retries (Rule 2.3)
  const pendingGenerateKeyRef = useRef(null);
  const pollTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Clear polling timers on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // Fetch published catalogue products and gallery on mount
  const loadData = useCallback(async () => {
    if (!effectiveUserId) return;
    setIsLoadingProducts(true);
    const supabase = createClient();

    try {
      // 1. Fetch published catalogue products
      const { data: prods, error: prodsErr } = await supabase
        .from("products")
        .select(
          `id, title, jewellery_type, category, raw_image_url, processed_image_url, generated_image_urls, is_published, created_at`
        )
        .eq("wholesaler_id", effectiveUserId)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (prodsErr) {
        console.error("[useChamakFlow] Error loading products:", prodsErr);
      } else {
        setCatalogProducts(prods || []);
      }

      // 2. Fetch past generations for gallery
      const gallery = await fetchGallery(effectiveUserId).catch((err) => {
        console.error("[useChamakFlow] Error loading gallery:", err);
        return [];
      });
      setGalleryGenerations(gallery || []);
    } catch (err) {
      console.error("[useChamakFlow] Initial load failed:", err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [effectiveUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Slot Selection: From Catalogue
  const selectProduct = useCallback((slot, product) => {
    setUploadError("");
    setErrorMessage("");
    if (!product) {
      if (slot === 1) setSelectedDesign1(null);
      else setSelectedDesign2(null);
      return;
    }

    const imageUrl =
      (Array.isArray(product.generated_image_urls) && product.generated_image_urls[0]) ||
      product.processed_image_url ||
      product.raw_image_url ||
      "";

    const design = {
      product,
      customFile: null,
      imageUrl,
      label: product.title || product.jewellery_type || "Jewellery Piece",
    };

    if (slot === 1) setSelectedDesign1(design);
    else setSelectedDesign2(design);
  }, []);

  // Slot Selection: Custom Image Upload (Fix #1: Inline error handling)
  const setCustomImage = useCallback((slot, file) => {
    setUploadError("");
    setErrorMessage("");

    if (!file) {
      if (slot === 1) setSelectedDesign1(null);
      else setSelectedDesign2(null);
      return;
    }

    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Invalid file format. Please upload a JPG, PNG, or WebP image.");
      }

      // Validate size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Image file is too large. Maximum size is 10MB.");
      }

      const previewUrl = URL.createObjectURL(file);
      const design = {
        product: null,
        customFile: file,
        imageUrl: previewUrl,
        label: file.name ? file.name.replace(/\.[^/.]+$/, "") : "Custom Design",
      };

      if (slot === 1) setSelectedDesign1(design);
      else setSelectedDesign2(design);
    } catch (err) {
      console.error("[useChamakFlow] Custom image error:", err);
      setUploadError(err.message || "Failed to process selected image.");
    }
  }, []);

  // Can start analysis check
  const canStartAnalysis =
    Boolean(selectedDesign1?.imageUrl) &&
    Boolean(selectedDesign2?.imageUrl) &&
    !(
      selectedDesign1?.product &&
      selectedDesign2?.product &&
      selectedDesign1.product.id === selectedDesign2.product.id
    );

  // Polling loop runner
  const startPolling = useCallback(
    (generationId, targetStep) => {
      stopPolling();
      let attempts = 0;

      const poll = async () => {
        if (!isMountedRef.current) return;
        attempts++;

        try {
          const gen = await fetchGeneration(generationId);
          if (!isMountedRef.current) return;
          setCurrentGeneration(gen);

          if (targetStep === "analyzing") {
            // Check if analysis finished or failed
            if (gen.status === "awaiting_input" || gen.vision_analysis_json) {
              // Initialize default sliders from vision analysis attributes
              const analysis = gen.vision_analysis_json || {};
              const attributes = analysis.attributes || analysis.adjustable_attributes || [];
              const initSliders = {};
              if (Array.isArray(attributes) && attributes.length > 0) {
                attributes.forEach((attr) => {
                  const key = typeof attr === "string" ? attr : attr.name || attr.key;
                  if (key) initSliders[key] = 50; // default 50%
                });
              } else {
                // Fallback default attributes if generic
                initSliders["Overall Form & Silhouette"] = 50;
                initSliders["Gemstone & Stone Work"] = 50;
                initSliders["Metal Texture & Detailing"] = 50;
                initSliders["Motif & Pattern Influence"] = 50;
              }

              setSliderValues(initSliders);
              setStep("sliderForm");
              setIsSubmitting(false);
              return;
            }

            if (gen.status === "failed") {
              setErrorMessage(gen.error_message || "Vision analysis failed for the selected designs.");
              setStep("failed");
              setIsSubmitting(false);
              return;
            }
          } else if (targetStep === "generating") {
            // Check if generation finished or failed
            if (gen.status === "completed" || gen.status === "done") {
              const outputUrl = gen.output_image_url || gen.generated_image_url || "";
              if (outputUrl) {
                const signed = await getSignedOutputUrl(outputUrl);
                setSignedOutputImageUrl(signed);
              }
              // Clear stored idempotency key on confirmed success
              pendingGenerateKeyRef.current = null;

              setStep("result");
              setIsSubmitting(false);
              refreshCredits();
              // Update gallery in background
              fetchGallery(effectiveUserId)
                .then((gal) => setGalleryGenerations(gal || []))
                .catch(() => {});
              return;
            }

            if (gen.status === "failed") {
              setErrorMessage(gen.error_message || "AI image fusion failed. Please try again.");
              setStep("failed");
              setIsSubmitting(false);
              refreshCredits();
              return;
            }
          }
        } catch (err) {
          // Swallow transient network fetch errors mid-loop
          console.warn("[useChamakFlow] Poll tick transient error:", err.message);
        }

        if (attempts >= MAX_POLL_ATTEMPTS) {
          setErrorMessage(
            "The AI request took longer than expected. Please check the Gallery in a few minutes or retry."
          );
          setStep("failed");
          setIsSubmitting(false);
          return;
        }

        // Schedule next poll
        pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      };

      pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    },
    [stopPolling, effectiveUserId, refreshCredits]
  );

  // Step 1 -> Step 2: Start Vision Analysis
  const startVisionAnalysis = useCallback(async () => {
    if (!canStartAnalysis) {
      setErrorMessage("Please select two distinct designs to begin fusion.");
      return;
    }

    setErrorMessage("");
    setUploadError("");
    setIsSubmitting(true);
    setStep("analyzing");

    try {
      let url1 = selectedDesign1.imageUrl;
      let url2 = selectedDesign2.imageUrl;

      // If either slot is a custom uploaded file, upload to Supabase storage first
      if (selectedDesign1.customFile) {
        url1 = await uploadSourceImage(selectedDesign1.customFile, effectiveUserId, 1);
      }
      if (selectedDesign2.customFile) {
        url2 = await uploadSourceImage(selectedDesign2.customFile, effectiveUserId, 2);
      }

      // Create generation record in Supabase
      const newGen = await createGeneration({
        wholesaler_id: effectiveUserId,
        source_design_1_url: url1,
        source_design_1_product_id: selectedDesign1.product?.id || null,
        source_design_1_label: selectedDesign1.label,
        source_design_2_url: url2,
        source_design_2_product_id: selectedDesign2.product?.id || null,
        source_design_2_label: selectedDesign2.label,
      });

      setCurrentGeneration(newGen);

      // Trigger FastAPI AI pipeline for analysis
      await triggerAnalysis(newGen.id);

      // Start poll loop waiting for analysis to finish
      startPolling(newGen.id, "analyzing");
    } catch (err) {
      console.error("[useChamakFlow] startVisionAnalysis error:", err);
      setErrorMessage(err.message || "Failed to start vision analysis.");
      setStep("failed");
      setIsSubmitting(false);
    }
  }, [canStartAnalysis, selectedDesign1, selectedDesign2, effectiveUserId, startPolling]);

  // Step 3 -> Step 4: Submit Form and Generate Fusion
  const submitFormAndGenerate = useCallback(async () => {
    if (!currentGeneration) {
      setErrorMessage("No active generation session found.");
      return;
    }

    // Generate or reuse idempotency key for this user action (Rule 2.3)
    if (!pendingGenerateKeyRef.current) {
      pendingGenerateKeyRef.current =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    setErrorMessage("");
    setIsSubmitting(true);
    setStep("generating");

    try {
      // 1. Update Supabase record with slider form and note
      const updatedGen = await updateGenerationForm(currentGeneration.id, {
        wholesaler_form_json: sliderValues,
        note_text: noteText,
        wholesaler_id: effectiveUserId,
      });

      setCurrentGeneration(updatedGen);

      // 2. Trigger FastAPI AI pipeline for fusion generation with idempotency key
      await triggerGenerate(updatedGen.id, pendingGenerateKeyRef.current);

      // 3. Start poll loop waiting for image completion
      startPolling(updatedGen.id, "generating");
    } catch (err) {
      console.error("[useChamakFlow] submitFormAndGenerate error:", err);

      // Handle 402 Insufficient Credits (Rule 2.4 & 2.5: Do NOT mark failed, stay at sliderForm)
      if (err.status === 402 || err.insufficientCredits) {
        const info = err.insufficientCredits || {};
        setInsufficientCredits({
          isOpen: true,
          required: info.required ?? 10,
          balance: info.balance ?? (wallet?.available ?? 0),
          shortBy: info.short_by ?? Math.max(0, (info.required ?? 10) - (wallet?.available ?? 0)),
        });
        setStep("sliderForm");
        setIsSubmitting(false);
        return;
      }

      setErrorMessage(err.message || "Failed to submit fusion parameters.");
      setStep("failed");
      setIsSubmitting(false);
    }
  }, [currentGeneration, sliderValues, noteText, effectiveUserId, startPolling, wallet]);

  // Revise & Retry (from result or failure screen) -> new idempotency key for deliberate re-roll
  const reviseAndRetry = useCallback(() => {
    stopPolling();
    pendingGenerateKeyRef.current =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setErrorMessage("");
    setStep("sliderForm");
  }, [stopPolling]);

  // Reset back to picker step
  const resetToPicker = useCallback(() => {
    stopPolling();
    pendingGenerateKeyRef.current = null;
    setSelectedDesign1(null);
    setSelectedDesign2(null);
    setCurrentGeneration(null);
    setSignedOutputImageUrl("");
    setSliderValues({});
    setNoteText("");
    setErrorMessage("");
    setUploadError("");
    setStep("picker");
    refreshCredits();
    loadData();
  }, [stopPolling, refreshCredits, loadData]);

  // Open past gallery item (Fix #2: Accurately route to failed UI when status is 'failed')
  const openGalleryItem = useCallback(
    async (item) => {
      stopPolling();
      setErrorMessage("");
      setUploadError("");
      setCurrentGeneration(item);

      if (item.wholesaler_form_json) {
        setSliderValues(item.wholesaler_form_json);
      }
      if (item.note_text) {
        setNoteText(item.note_text);
      }

      // Fix #2: Check status explicitly
      if (item.status === "failed") {
        setErrorMessage(item.error_message || "This generation encountered an error.");
        setStep("failed");
        return;
      }

      if (item.status === "completed" || item.status === "done") {
        const outputUrl = item.output_image_url || item.generated_image_url || "";
        if (outputUrl) {
          const signed = await getSignedOutputUrl(outputUrl);
          setSignedOutputImageUrl(signed);
        }
        setStep("result");
        return;
      }

      if (item.status === "awaiting_input") {
        setStep("sliderForm");
        return;
      }

      if (item.status === "analyzing" || item.status === "generating") {
        setStep(item.status);
        startPolling(item.id, item.status);
        return;
      }

      // Default fallback
      setStep("result");
    },
    [stopPolling, startPolling]
  );

  // Submit Feedback (Fix #3: Awaits call, surfaces error without closing modal)
  const submitFeedback = useCallback(
    async (rating, feedbackText) => {
      if (!currentGeneration) return;
      setFeedbackState((prev) => ({ ...prev, isSubmitting: true, error: null }));

      try {
        await insertFeedback({
          generation_id: currentGeneration.id,
          wholesaler_id: effectiveUserId,
          rating,
          feedback_text: feedbackText,
        });

        setFeedbackState({
          isOpen: false,
          isSubmitting: false,
          error: null,
          submitted: true,
        });
      } catch (err) {
        console.error("[useChamakFlow] Feedback submit failed:", err);
        // Fix #3: Stay open and display error
        setFeedbackState((prev) => ({
          ...prev,
          isSubmitting: false,
          error: err.message || "Failed to submit feedback. Please try again.",
        }));
      }
    },
    [currentGeneration, effectiveUserId]
  );

  const openFeedbackModal = useCallback(() => {
    setFeedbackState({
      isOpen: true,
      isSubmitting: false,
      error: null,
      submitted: false,
    });
  }, []);

  const closeFeedbackModal = useCallback(() => {
    setFeedbackState((prev) => ({ ...prev, isOpen: false, error: null }));
  }, []);

  const closeInsufficientCreditsModal = useCallback(() => {
    setInsufficientCredits((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    step,
    setStep,
    catalogProducts,
    galleryGenerations,
    selectedDesign1,
    selectedDesign2,
    currentGeneration,
    signedOutputImageUrl,
    sliderValues,
    setSliderValues,
    noteText,
    setNoteText,
    wallet,
    rateCard,
    costOf,
    creditsLoading,
    isLoadingProducts,
    isSubmitting,
    errorMessage,
    uploadError,
    canStartAnalysis,
    feedbackState,
    insufficientCredits,
    closeInsufficientCreditsModal,
    loadData,
    selectProduct,
    setCustomImage,
    startVisionAnalysis,
    submitFormAndGenerate,
    reviseAndRetry,
    resetToPicker,
    openGalleryItem,
    submitFeedback,
    openFeedbackModal,
    closeFeedbackModal,
  };
}
