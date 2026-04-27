"use client";

import { useState, useCallback } from "react";
import styles from "./referralManager.module.css";

export default function ReferralManager({ initialLinks = [] }) {
  const [links, setLinks] = useState(initialLinks);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [activeLink, setActiveLink] = useState("");

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
      setActiveLink(data.link);
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

  return (
    <div className={styles.container}>
      {/* Link to referral program section */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          Link to referral program
        </h2>
        <p className={styles.subtitle}>
          Create and share your referral link to start onboarding retailers instantly.
        </p>

        <div className={styles.inputRow}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              readOnly
              value={activeLink}
              placeholder="Generate a link to see it here..."
              className={`${styles.input} ${!activeLink ? styles.inputEmpty : ''}`}
            />
            
            {/* Action Buttons Container */}
            <div className={styles.actionButtons}>
              {copiedId === 'main' && (
                <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: 500, marginRight: "4px" }}>Copied!</span>
              )}
              <button
                onClick={() => activeLink && handleCopy('main', activeLink)}
                disabled={!activeLink}
                style={{
                  background: "none",
                  border: "none",
                  cursor: activeLink ? "pointer" : "not-allowed",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: activeLink ? 1 : 0.3
                }}
                title="Copy link"
              >
                <img src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306236/retailerProfile_COPY_szewo3.svg" alt="Copy" style={{ width: "20px", height: "20px" }} />
              </button>
              
              {activeLink && (
                <button
                  onClick={() => setActiveLink("")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9CA3AF"
                  }}
                  title="Clear link"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={styles.generateButton}
            >
              <img src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306661/link_logo_wtcyei.svg" alt="Link" style={{ width: "20px", height: "20px", filter: "brightness(0) invert(1)" }} />
              {generating ? "Generating..." : "Generate Link"}
            </button>
            <span className={styles.secureText}>
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
          <h3 className={styles.prevTitle}>
            PREVIOUS LINK
          </h3>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {links.map((link, index) => (
              <div
                key={link.id}
                className={styles.linkRow}
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

                <span className={styles.urlText}>
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

                <span className={styles.dateBadge} style={{
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
