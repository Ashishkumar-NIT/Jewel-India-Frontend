"use client";

import { useState, useCallback } from "react";

export default function ReferralManager({ initialLinks = [] }) {
  const [links, setLinks] = useState(initialLinks);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

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

      setLinks((prev) => [data, ...prev]);
    } catch {
      setGenerateError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleCopy = useCallback(async (id, link) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
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

  function formatDate(iso) {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-GB', { month: 'short' });
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const latestLink = links[0]?.link || "";

  return (
    <div style={{ width: "100%", fontFamily: "'Inter', sans-serif" }}>
      {/* Link to referral program section */}
      <div style={{ marginBottom: "64px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#111", margin: "0 0 8px 0", letterSpacing: "-0.01em" }}>
          Link to referral program
        </h2>
        <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 24px 0" }}>
          Create and share your referral link to start onboarding retailers instantly.
        </p>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="text"
              readOnly
              value={latestLink}
              placeholder="Generate a link to see it here..."
              style={{
                width: "100%",
                height: "56px",
                backgroundColor: "#F3F4F6",
                border: "none",
                borderRadius: "8px",
                padding: "0 48px 0 16px",
                fontSize: "15px",
                color: "#374151",
                outline: "none",
              }}
            />
            {latestLink && (
              <button
                onClick={() => handleCopy('main', latestLink)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Copy link"
              >
                <img src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306236/retailerProfile_COPY_szewo3.svg" alt="Copy" style={{ width: "20px", height: "20px" }} />
              </button>
            )}
            {copiedId === 'main' && (
              <span style={{ position: "absolute", right: "44px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#16A34A", fontWeight: 500 }}>Copied!</span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: "220px" }}>
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                height: "56px",
                width: "100%",
                backgroundColor: "#111",
                color: "#FFF",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: generating ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
                opacity: generating ? 0.7 : 1,
              }}
            >
              <img src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306661/link_logo_wtcyei.svg" alt="Link" style={{ width: "20px", height: "20px", filter: "brightness(0) invert(1)" }} />
              {generating ? "Generating..." : "Generate Link"}
            </button>
            <span style={{ fontSize: "11px", color: "#9CA3AF", fontStyle: "italic", marginTop: "8px", textAlign: "right", lineHeight: 1.4 }}>
              *Your links are secure and used only for<br/>tracking referrals.
            </span>
          </div>
        </div>
        {generateError && (
          <p style={{ fontSize: "13px", color: "#DC2626", marginTop: "12px" }}>{generateError}</p>
        )}
      </div>

      {/* PREVIOUS LINK Section */}
      {links.length > 0 && (
        <div>
          <h3 style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
            PREVIOUS LINK
          </h3>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {links.map((link, index) => (
              <div
                key={link.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "16px 0",
                  borderBottom: index < links.length - 1 ? "1px solid #E5E7EB" : "none",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22C55E", marginRight: "16px", marginLeft: "4px", flexShrink: 0 }}></div>
                
                <span style={{ 
                  padding: "4px 12px", 
                  backgroundColor: "#DCFCE7", 
                  color: "#16A34A", 
                  borderRadius: "16px", 
                  fontSize: "13px", 
                  fontWeight: 600,
                  marginRight: "24px",
                  flexShrink: 0
                }}>
                  Active
                </span>

                <span style={{ fontSize: "14px", color: "#4B5563", fontFamily: "monospace", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {link.link}
                </span>

                <button
                  onClick={() => handleCopy(link.id, link.link)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    marginLeft: "16px",
                    marginRight: "24px",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0
                  }}
                  title="Copy link"
                >
                  {copiedId === link.id ? (
                    <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: 500 }}>Copied!</span>
                  ) : (
                    <img src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306236/retailerProfile_COPY_szewo3.svg" alt="Copy" style={{ width: "20px", height: "20px" }} />
                  )}
                </button>

                <span style={{
                  padding: "6px 16px",
                  backgroundColor: "#F3F4F6",
                  color: "#6B7280",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 500,
                  flexShrink: 0
                }}>
                  {formatDate(link.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
