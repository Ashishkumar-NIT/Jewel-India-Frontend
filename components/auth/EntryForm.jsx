"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { GoogleButton } from "../ui/GoogleButton";
import { signInWithGoogle } from "../../lib/actions/auth";

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
      // It's a phone. Strip all non-digit and non-plus chars
      let phoneNum = normalizedIdentity.replace(/[^\d+]/g, '');
      
      // Auto-append +91 for 10-digit Indian numbers
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
      // Step 1: Check if user exists
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
        // Existing user — go to login page with identity pre-filled
        sessionStorage.setItem("auth_identity", normalizedIdentity);
        router.push(`/entry_page/signin?identity=${encodeURIComponent(normalizedIdentity)}`);
        return;
      }

      // Step 2: Send OTP
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

      // Store identity + OTP send timestamp for the OTP page
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
    const result = await signInWithGoogle();
    if (result?.error) {
      setError(result.error);
      setGoogleLoading(false);
    }
    // On success, Supabase redirects to /auth/callback which handles routing
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.trim());
  const isPhone = /^\+?[0-9\s\-().]{7,15}$/.test(identity.trim()) && !isEmail;
  const isValid = isEmail || isPhone;

  return (
    <form className="mt-10 space-y-7" onSubmit={handleContinue}>
      {/* Identity Input */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="identity"
          className="text-[10px] uppercase tracking-[0.2em] font-bold text-celestique-dark/60"
        >
          Email Address or Phone Number
        </label>
        <div className="relative">
          <input
            id="identity"
            type="text"
            autoComplete="username"
            placeholder="you@example.com or +91 98765 43210"
            value={identity}
            onChange={(e) => {
              setIdentity(e.target.value);
              setError(null);
            }}
            className="h-14 w-full border-b-2 bg-transparent border-celestique-taupe px-0 text-[15px] text-celestique-dark placeholder:text-celestique-dark/30 focus:outline-none focus:border-celestique-dark transition-colors duration-300 font-light tracking-wide"
            required
          />
          {/* Live type indicator */}
          {identity.trim() && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-widest text-celestique-dark/40">
              {isEmail ? "Email" : isPhone ? "Phone" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 animate-fade-in">
          <span className="mt-0.5 shrink-0 w-1 h-1 rounded-full bg-red-500 mt-1.5" />
          <p className="text-[10px] uppercase tracking-[0.1em] text-red-600">{error}</p>
        </div>
      )}

      {/* Continue */}
      <Button
        type="submit"
        variant="primary"
        loading={loading}
        disabled={!identity.trim()}
        id="entry-continue-btn"
      >
        Continue
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-celestique-taupe" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
          <span className="bg-celestique-cream px-4 text-celestique-dark/40">OR</span>
        </div>
      </div>

      {/* Google Auth */}
      <GoogleButton
        onClick={handleGoogle}
        text={googleLoading ? "Redirecting…" : "Continue with Google"}
        disabled={googleLoading}
      />

      <p className="text-center text-[9px] uppercase tracking-[0.15em] text-celestique-dark/40 leading-relaxed">
        By continuing, you agree to Celestique&apos;s{" "}
        <span className="border-b border-celestique-dark/30 pb-0.5 cursor-pointer">Terms</span>{" "}
        &amp;{" "}
        <span className="border-b border-celestique-dark/30 pb-0.5 cursor-pointer">
          Privacy Policy
        </span>
      </p>
    </form>
  );
}
