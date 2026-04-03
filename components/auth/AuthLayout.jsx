import Image from "next/image";

export function AuthLayout({ children, imageSrc, title, subtitle }) {
  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden" }}>

      {/* Left Side — Jewellery Photo (~62%), shown on md+ (768px+) */}
      <div style={{ position: "relative", width: "62%", height: "100%", flexShrink: 0 }} className="hidden md:block">
        <Image
          src={imageSrc || "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1774883373/authImg_ivftu7.png"}
          alt="Jewellery"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      {/* Right Side — White Form Panel, capped at 520px wide */}
      <div style={{
        flex: 1,
        minWidth: "320px",
        maxWidth: "520px",
        background: "#FFFFFF",
        height: "100vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        padding: "48px 48px 32px",
        boxSizing: "border-box",
      }}>

        {/* Logo Row */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            background: "#6B4F4F",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "15px", letterSpacing: "0.02em" }}>JI</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: "17px", color: "#111111", letterSpacing: "0.01em" }}>
            Jewels India
          </span>
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "Georgia, serif",
          fontSize: "44px",
          fontWeight: 700,
          color: "#111111",
          lineHeight: 1.1,
          margin: "0 0 8px",
        }}>
          {title}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: "15px",
          color: "#888888",
          margin: "0 0 36px",
          lineHeight: 1.5,
          fontWeight: 400,
        }}>
          {subtitle}
        </p>

        {/* Form — fills remaining height for internal flex spacer to work */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {children}
        </div>

      </div>
    </div>
  );
}
