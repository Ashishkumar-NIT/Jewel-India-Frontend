import Image from "next/image";

export function AuthLayout({ children, imageSrc, title, subtitle }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", background: "#FFFFFF" }}>
      
      {/* Left Side — Jewellery Photo (~62%) */}
      <div style={{ position: "relative", width: "62%", flexShrink: 0 }} className="hidden md:block">
        <Image
          src={imageSrc || "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1774883373/authImg_ivftu7.png"}
          alt="Jewellery"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      {/* Right Side — White Form Panel (~38%) */}
      <div style={{
        width: "38%",
        minWidth: "320px",
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "48px 48px",
        boxSizing: "border-box",
        flexGrow: 1,
      }}>
        <div style={{ maxWidth: "400px", width: "100%" }}>

          {/* Logo Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
            <div style={{
              width: "34px",
              height: "34px",
              background: "#6B4F4F",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "13px", letterSpacing: "0.02em" }}>JI</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: "17px", color: "#111111", letterSpacing: "0.01em" }}>
              Jewels India
            </span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontFamily: "Georgia, serif",
            fontSize: "48px",
            fontWeight: 700,
            color: "#111111",
            lineHeight: 1.1,
            margin: "0 0 10px",
          }}>
            {title}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: "16px",
            color: "#888888",
            margin: "0 0 32px",
            lineHeight: 1.5,
            fontWeight: 400,
          }}>
            {subtitle}
          </p>

          {/* Form content */}
          {children}
        </div>
      </div>
    </div>
  );
}
