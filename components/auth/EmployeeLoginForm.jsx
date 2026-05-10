"use client";

import { useState } from "react";
import { signIn } from "../../lib/actions/auth";

export function EmployeeLoginForm() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isFormValid = email.trim() !== "" && password.trim() !== "";

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
      className="flex flex-col w-full"
      onSubmit={handleSubmit}
      style={{ fontFamily: "'Gilroy', 'SF Pro', system-ui, sans-serif" }}
    >
      {/* Heading */}
      <div className="w-full flex justify-center mb-[160px]">
        <h1
          className="text-[#111111] text-left text-[1.6rem] md:text-[1.8rem] lg:text-[2.5rem]"
          style={{
            fontFamily: "Georgia, 'Bodoni Moda', serif",
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
        >
          The catalogue
          <br />
          is waiting.
        </h1>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5 mb-[24px]">
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="employee-login-input w-full h-[48px] border-[1.5px] border-[#E5E7EB] rounded-[6px] px-[14px] text-[15px] text-[#111827] bg-white outline-none transition-colors focus:border-[#111]"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5 mb-[32px]">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full h-[48px] border-[1.5px] border-[#E5E7EB] rounded-[6px] pl-[14px] pr-[44px] text-[15px] text-[#111827] bg-white outline-none transition-colors focus:border-[#111]"
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
            marginBottom: "16px",
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
        disabled={loading || !isFormValid}
        className={`w-full flex items-center justify-center text-center font-semibold tracking-[0.02em] rounded-[8px] transition-all duration-200 h-[44px] text-[15px] ${
          loading || !isFormValid
            ? "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
            : "bg-black text-white cursor-pointer hover:bg-[#222222] hover:shadow-md"
        }`}
      >
        {loading ? "Signing in..." : "Get Started"}
      </button>
    </form>
  );
}
