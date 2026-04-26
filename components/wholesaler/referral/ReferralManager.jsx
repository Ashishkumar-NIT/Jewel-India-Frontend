"use client";

import { useState, useCallback } from "react";

/**
 * ReferralManager
 *
 * Client component rendered inside the wholesaler's "Add Retailer" page.
 * Handles:
 *  - Generating new referral links (POST /api/referral/generate)
 *  - Listing existing links (fetched as prop, refreshed after generation)
 *  - Copying links to clipboard
 */
export default function ReferralManager({ initialLinks = [] }) {
  const [links, setLinks] = useState(initialLinks);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // ── Generate new link ────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setGenerateError(null);

    try {
      const res = await fetch("/api/referral/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenerateError(data.error || "Failed to generate link.");
        return;
      }

      // Prepend new link to local state (newest first)
      setLinks((prev) => [data, ...prev]);
    } catch {
      setGenerateError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, []);

  // ── Copy link to clipboard ───────────────────────────────────────
  const handleCopy = useCallback(async (id, link) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = link;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────
  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function usageLabel(link) {
    if (link.max_uses === null) return `${link.uses_count} uses`;
    return `${link.uses_count} / ${link.max_uses} uses`;
  }

  function isExhausted(link) {
    return link.max_uses !== null && link.uses_count >= link.max_uses;
  }

  return (
    <div style={{ width: "100%" }}>
      {/* ── Generate Button ──────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", margin: 0 }}>
            Referral Links
          </h2>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0" }}>
            Share these links to invite retailers to onboard.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            height: "42px",
            padding: "0 20px",
            backgroundColor: generating ? "#9CA3AF" : "#1A1A1A",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: generating ? "not-allowed" : "pointer",
            transition: "background 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => { if (!generating) e.currentTarget.style.background = "#333"; }}
          onMouseLeave={(e) => { if (!generating) e.currentTarget.style.background = "#1A1A1A"; }}
        >
          {/* Link icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          {generating ? "Generating…" : "Generate New Link"}
        </button>
      </div>

      {/* ── Error message ────────────────────────────────────────── */}
      {generateError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ fontSize: "13px", color: "#DC2626", margin: 0 }}>{generateError}</p>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────── */}
      {links.length === 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 24px",
            backgroundColor: "#F9FAFB",
            border: "1.5px dashed #E5E7EB",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D1D5DB"
            strokeWidth="1.5"
            style={{ marginBottom: "12px" }}
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0 }}>
            No referral links yet. Generate one to invite retailers.
          </p>
        </div>
      )}

      {/* ── Links list ───────────────────────────────────────────── */}
      {links.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {links.map((link) => {
            const exhausted = isExhausted(link);
            const inactive = !link.is_active || exhausted;

            return (
              <div
                key={link.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px 20px",
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${inactive ? "#F3F4F6" : "#E6DFD3"}`,
                  borderRadius: "10px",
                  opacity: inactive ? 0.6 : 1,
                  flexWrap: "wrap",
                }}
              >
                {/* Status dot */}
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: inactive ? "#D1D5DB" : "#22C55E",
                    flexShrink: 0,
                  }}
                />

                {/* Code + link */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <code
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#111111",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {link.code}
                    </code>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        backgroundColor: inactive ? "#F3F4F6" : "#F0FDF4",
                        color: inactive ? "#9CA3AF" : "#16A34A",
                        fontWeight: 600,
                      }}
                    >
                      {exhausted ? "Exhausted" : !link.is_active ? "Inactive" : "Active"}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#9CA3AF",
                      margin: "4px 0 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {link.link}
                  </p>
                </div>

                {/* Meta info */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "4px",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>
                    {usageLabel(link)}
                  </span>
                  <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
                    {formatDate(link.created_at)}
                  </span>
                </div>

                {/* Copy button */}
                <button
                  onClick={() => handleCopy(link.id, link.link)}
                  disabled={inactive}
                  title={inactive ? "Link is inactive" : "Copy to clipboard"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    height: "36px",
                    padding: "0 14px",
                    backgroundColor: copiedId === link.id ? "#F0FDF4" : "#F9FAFB",
                    border: `1px solid ${copiedId === link.id ? "#BBF7D0" : "#E5E7EB"}`,
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: copiedId === link.id ? "#16A34A" : "#374151",
                    cursor: inactive ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    flexShrink: 0,
                  }}
                >
                  {copiedId === link.id ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Info tip ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          padding: "12px 16px",
          backgroundColor: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          style={{ flexShrink: 0, marginTop: "1px" }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p style={{ fontSize: "12px", color: "#1E40AF", margin: 0, lineHeight: 1.5 }}>
          Each link is unique. When a retailer signs up using your link, they&apos;ll be
          automatically linked to your account for tracking.
        </p>
      </div>
    </div>
  );
}
