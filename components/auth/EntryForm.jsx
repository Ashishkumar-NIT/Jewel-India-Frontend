"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { initiateGoogleOAuth } from "../../lib/actions/oauth";

/**
 * EntryForm — unified entry for new auth flow.
 * User enters email (or phone — UI only; phone OTP pending setup).
 * On Continue:
 *   → existing user: redirect to /entry_page/signin?identity=...
 *   → new user: send OTP, redirect to /entry_page/signup/verify-otp
 */
export function EntryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [identity, setIdentity] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "banned") {
      setError("Your account has been banned. Please use a different number or email.");
    } else if (urlError) {
      try {
        setError(decodeURIComponent(urlError));
      } catch {
        setError(urlError);
      }
    }
  }, [searchParams]);

  async function handleContinue(e) {
    e.preventDefault();
    if (!identity.trim()) return;

    setError(null);
    setLoading(true);

    let normalizedIdentity = identity.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentity);

    if (!isEmail) {
      let phoneNum = normalizedIdentity.replace(/[^\d+]/g, '');
      if (/^\d{10}$/.test(phoneNum)) {
        phoneNum = '+91' + phoneNum;
      } else if (/^91\d{10}$/.test(phoneNum)) {
        phoneNum = '+' + phoneNum;
      } else if (!phoneNum.startsWith('+')) {
        phoneNum = '+' + phoneNum;
      }
      if (phoneNum.length < 10 || phoneNum.length > 16) {
        setError("Please enter a valid 10-digit mobile number.");
        setLoading(false);
        return;
      }
      normalizedIdentity = phoneNum;
    }

    try {
      const checkRes = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity: normalizedIdentity }),
      });
      const checkData = await checkRes.json();

      if (!checkRes.ok) {
        setError(checkData.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      if (checkData.exists) {
        sessionStorage.setItem("auth_identity", normalizedIdentity);
        router.push(`/entry_page/signin?identity=${encodeURIComponent(normalizedIdentity)}`);
        return;
      }

      const otpRes = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity: normalizedIdentity }),
      });
      const otpData = await otpRes.json();

      if (!otpRes.ok) {
        setError(otpData.error || "Failed to send OTP. Please try again.");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("auth_identity", normalizedIdentity);
      sessionStorage.setItem("otp_sent_at", new Date().toISOString());
      router.push("/entry_page/signup/verify-otp");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    // Use window.location.origin so the redirectTo is always the current domain
    // (localhost in dev, production URL on Vercel) — no env var needed.
    const redirectTo = `${window.location.origin}/auth/callback`;
    const result = await initiateGoogleOAuth(redirectTo);
    if (result?.error) {
      setError(result.error);
      setGoogleLoading(false);
    }
  }

  return (
    <form style={{ display: "flex", flexDirection: "column", flex: 1 }} onSubmit={handleContinue}>

      {/* ── Top cluster: label, input, error, divider, Google ── */}
      <div>
        <label
          htmlFor="identity"
          style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333333", marginBottom: "8px", letterSpacing: "0.01em" }}
        >
          Email or Phone number
        </label>

        <input
          id="identity"
          type="text"
          autoComplete="username"
          placeholder="Enter"
          value={identity}
          onChange={(e) => { setIdentity(e.target.value); setError(null); }}
          style={{
            width: "100%",
            height: "52px",
            border: "1.5px solid #D9D0C5",
            borderRadius: "8px",
            padding: "0 14px",
            fontSize: "14px",
            color: "#111111",
            background: "#FAFAFA",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
            marginBottom: "20px",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#111111")}
          onBlur={(e) => (e.target.style.borderColor = "#D9D0C5")}
          required
        />

        {error && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "12px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#EF4444", flexShrink: 0, marginTop: "5px" }} />
            <p style={{ fontSize: "12px", color: "#DC2626", fontWeight: 500, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* OR Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "#E0E0E0" }} />
          <span style={{ fontSize: "11px", color: "#999999", fontWeight: 500, letterSpacing: "0.05em" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "#E0E0E0" }} />
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          style={{
            width: "100%",
            height: "52px",
            border: "1px solid #E0E0E0",
            borderRadius: "8px",
            background: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#111111",
            cursor: googleLoading ? "not-allowed" : "pointer",
            opacity: googleLoading ? 0.6 : 1,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => { if (!googleLoading) e.currentTarget.style.background = "#F5F5F5"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M47.52 24.552c0-1.636-.148-3.21-.424-4.728H24v8.948h13.204c-.568 3.068-2.292 5.668-4.884 7.412v6.16h7.908C44.164 38.028 47.52 31.836 47.52 24.552z" fill="#4285F4"/>
            <path d="M24 48c6.636 0 12.204-2.2 16.268-5.968l-7.908-6.16c-2.196 1.472-5.004 2.34-8.36 2.34-6.428 0-11.872-4.34-13.824-10.172H2.04v6.36C6.084 42.916 14.46 48 24 48z" fill="#34A853"/>
            <path d="M10.176 28.04A14.41 14.41 0 0 1 9.6 24c0-1.404.24-2.768.576-4.04v-6.36H2.04A23.956 23.956 0 0 0 0 24c0 3.864.928 7.516 2.04 10.4l8.136-6.36z" fill="#FBBC05"/>
            <path d="M24 9.552c3.624 0 6.872 1.248 9.428 3.696l7.076-7.076C36.196 2.392 30.628 0 24 0 14.46 0 6.084 5.084 2.04 13.6l8.136 6.36C12.128 13.892 17.572 9.552 24 9.552z" fill="#EA4335"/>
          </svg>
          {googleLoading ? "Redirecting..." : "Google"}
        </button>
      </div>

      {/* ── Flex spacer: pushes Continue button toward the bottom ── */}
      <div style={{ flex: 1 }} />

      {/* ── Bottom anchor: Continue button + Terms ── */}
      <div>
        <button
          type="submit"
          disabled={loading || !identity.trim()}
          style={{
            width: "100%",
            height: "56px",
            background: loading || !identity.trim() ? "#BBBBBB" : "#1A1A1A",
            color: "#FFFFFF",
            borderRadius: "8px",
            border: "none",
            fontSize: "15px",
            fontWeight: 600,
            cursor: loading || !identity.trim() ? "not-allowed" : "pointer",
            letterSpacing: "0.02em",
            transition: "background 0.2s",
            marginBottom: "16px",
          }}
          onMouseEnter={(e) => { if (!loading && identity.trim()) e.currentTarget.style.background = "#333333"; }}
          onMouseLeave={(e) => { if (!loading && identity.trim()) e.currentTarget.style.background = "#1A1A1A"; }}
        >
          {loading ? "Checking..." : "Continue"}
        </button>

        <p style={{ fontSize: "13px", color: "#888888", lineHeight: 1.5, margin: "0 0 32px" }}>
          By continuing, you agree to our{" "}
          <span style={{ fontWeight: 700, color: "#333333", cursor: "pointer", textDecoration: "underline" }}>Terms of Service</span>{" "}
          and{" "}
          <span style={{ fontWeight: 700, color: "#333333", cursor: "pointer", textDecoration: "underline" }}>Privacy Policy</span>
        </p>
      </div>
    </form>
  );
}
