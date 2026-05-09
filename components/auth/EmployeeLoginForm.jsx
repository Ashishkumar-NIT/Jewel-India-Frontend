"use client";

import { useState } from "react";
import { signIn } from "../../lib/actions/auth";

export function EmployeeLoginForm() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.target);

    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success, signIn server action redirects to /dashboard/employee
  }

  return (
    <form
      className="flex flex-col gap-6 w-full max-w-[340px]"
      onSubmit={handleSubmit}
      style={{ fontFamily: "'Gilroy', 'SF Pro', system-ui, sans-serif" }}
    >
      {/* Heading */}
      <h1
        style={{
          fontFamily: "Georgia, 'Bodoni Moda', serif",
          fontSize: "clamp(32px, 4.5vw, 44px)",
          fontWeight: 400,
          color: "#111111",
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          margin: "0 0 8px",
        }}
      >
        The catalogue
        <br />
        is waiting.
      </h1>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="emp-email"
          style={{
            fontSize: "13px",
            color: "#6B7280",
            fontWeight: 500,
            letterSpacing: "0.01em",
          }}
        >
          Email
        </label>
        <input
          id="emp-email"
          name="email"
          type="email"
          placeholder="Enter"
          required
          autoComplete="email"
          className="employee-login-input"
          style={{
            height: "48px",
            width: "100%",
            border: "1.5px solid #E5E7EB",
            borderRadius: "6px",
            padding: "0 14px",
            fontSize: "15px",
            color: "#111827",
            background: "#fff",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#111")}
          onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="emp-password"
          style={{
            fontSize: "13px",
            color: "#6B7280",
            fontWeight: 500,
            letterSpacing: "0.01em",
          }}
        >
          Password
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="emp-password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            required
            autoComplete="current-password"
            style={{
              height: "48px",
              width: "100%",
              border: "1.5px solid #E5E7EB",
              borderRadius: "6px",
              padding: "0 44px 0 14px",
              fontSize: "15px",
              color: "#111827",
              background: "#fff",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#111")}
            onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
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
              justifyContent: "center",
              color: "#9CA3AF",
            }}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <circle cx="12" cy="12" r="3" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.638 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "8px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#EF4444",
              flexShrink: 0,
            }}
          />
          <p style={{ fontSize: "13px", color: "#DC2626", margin: 0 }}>
            {error}
          </p>
        </div>
      )}

      {/* Get Started Button */}
      <button
        type="submit"
        id="employee-login-btn"
        disabled={loading}
        style={{
          width: "100%",
          height: "50px",
          background: loading ? "#374151" : "#111111",
          color: "#fff",
          fontSize: "15px",
          fontWeight: 600,
          letterSpacing: "0.02em",
          borderRadius: "8px",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          opacity: loading ? 0.8 : 1,
          marginTop: "4px",
        }}
        onMouseEnter={(e) => {
          if (!loading) e.target.style.background = "#000";
        }}
        onMouseLeave={(e) => {
          if (!loading) e.target.style.background = "#111111";
        }}
      >
        {loading ? "Signing in..." : "Get Started"}
      </button>
    </form>
  );
}
