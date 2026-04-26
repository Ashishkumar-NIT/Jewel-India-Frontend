import Link from "next/link";

export default function JoinNotFound() {
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
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#FEE2E2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>
        Invalid or Expired Invite
      </h1>
      <p style={{ fontSize: "14px", color: "#6B7280", maxWidth: "340px", lineHeight: 1.6, marginBottom: "28px" }}>
        This referral link is no longer valid — it may have expired, been deactivated,
        or already reached its usage limit.
      </p>

      <Link
        href="/entry_page/signup"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          height: "44px",
          padding: "0 24px",
          backgroundColor: "#1A1A1A",
          color: "#FFFFFF",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Go to Sign Up
      </Link>
    </div>
  );
}
