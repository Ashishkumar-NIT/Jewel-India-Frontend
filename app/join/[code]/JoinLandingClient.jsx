"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

/**
 * JoinLandingClient
 *
 * Client component rendered on /join/[code].
 * Shows the wholesaler's business info and a "Get Started" CTA that
 * routes the user to the entry page pre-tagged with the referral code
 * and role=retailer.
 *
 * The referral code is also stored in sessionStorage so it survives
 * the OTP → set-password navigation and is read during onboarding submission.
 */
export default function JoinLandingClient({
  code,
  businessName,
  wholesalerName,
  businessLogoUrl,
}) {
  const router = useRouter();

  // Store the code in sessionStorage on mount so it's available
  // throughout the entire signup + onboarding flow.
  useEffect(() => {
    sessionStorage.setItem("referral_code", code);
    sessionStorage.setItem("referral_role", "retailer");
  }, [code]);

  function handleGetStarted() {
    // Persist again in case of page refresh
    sessionStorage.setItem("referral_code", code);
    sessionStorage.setItem("referral_role", "retailer");
    router.push(`/entry_page/signup?ref=${encodeURIComponent(code)}&role=retailer`);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F2EB",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "var(--font-jost, sans-serif)",
      }}
    >
      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: "4px", background: "linear-gradient(90deg, #1A1A1A, #6B6B6B)" }} />

        <div style={{ padding: "40px 36px 36px" }}>
          {/* Brand mark */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
            {businessLogoUrl ? (
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid #E6DFD3",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={businessLogoUrl}
                  alt={`${businessName} logo`}
                  width={48}
                  height={48}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  backgroundColor: "#1A1A1A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "18px",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {businessName?.charAt(0)?.toUpperCase() || "J"}
              </div>
            )}
            <div>
              <p
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#9CA3AF",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                Invitation from
              </p>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#111111",
                  margin: 0,
                  marginTop: "2px",
                }}
              >
                {businessName}
              </p>
            </div>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "#111111",
              lineHeight: 1.25,
              marginBottom: "12px",
            }}
          >
            You&apos;re invited to join as a Retailer
          </h1>

          <p
            style={{
              fontSize: "14px",
              color: "#6B7280",
              lineHeight: 1.65,
              marginBottom: "32px",
            }}
          >
            <strong style={{ color: "#374151" }}>{wholesalerName}</strong> from{" "}
            <strong style={{ color: "#374151" }}>{businessName}</strong> has invited you to
            onboard as a retailer partner on Jewel India. Create your account and complete
            a quick verification to get started.
          </p>

          {/* Referral code badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#F5F2EB",
              border: "1px solid #E6DFD3",
              borderRadius: "8px",
              padding: "8px 14px",
              marginBottom: "28px",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>
              Referral code:
            </span>
            <code
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#111111",
                letterSpacing: "0.05em",
              }}
            >
              {code}
            </code>
          </div>

          {/* What happens next */}
          <div
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "28px",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#9CA3AF",
                fontWeight: 600,
                marginBottom: "10px",
              }}
            >
              What happens next
            </p>
            {[
              "Create your account with email or phone",
              "Complete a quick 3-step business verification",
              "Get approved and access your retailer dashboard",
            ].map((step, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: i < 2 ? "8px" : 0 }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#1A1A1A",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  {i + 1}
                </div>
                <p style={{ fontSize: "13px", color: "#374151", margin: 0, lineHeight: 1.5 }}>
                  {step}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleGetStarted}
            style={{
              width: "100%",
              height: "52px",
              backgroundColor: "#1A1A1A",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.02em",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#333333")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1A1A1A")}
          >
            Get Started →
          </button>

          <p
            style={{
              fontSize: "12px",
              color: "#9CA3AF",
              textAlign: "center",
              marginTop: "16px",
              lineHeight: 1.5,
            }}
          >
            Already have an account?{" "}
            <a
              href="/entry_page/signin"
              style={{ color: "#374151", fontWeight: 600, textDecoration: "underline" }}
            >
              Sign in
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p
        style={{
          marginTop: "24px",
          fontSize: "11px",
          color: "#9CA3AF",
          textAlign: "center",
          letterSpacing: "0.05em",
        }}
      >
        © {new Date().getFullYear()} Jewel India · Powered by trust
      </p>
    </div>
  );
}
