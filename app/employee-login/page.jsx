import { Suspense } from "react";
import Image from "next/image";
import { EmployeeLoginForm } from "../../components/auth/EmployeeLoginForm";

export const metadata = {
  title: "Employee Login — Jewels India",
  description: "Employee access to catalogue and order management.",
};

export default function EmployeeLoginPage() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {/* Left Side — Jewellery Photo (hidden on mobile) */}
      <div
        style={{
          position: "relative",
          width: "50%",
          height: "100%",
          flexShrink: 0,
          overflow: "hidden",
        }}
        className="hidden md:block"
      >
        <Image
          src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1774883373/authImg_ivftu7.png"
          alt="Jewellery"
          fill
          style={{ objectFit: "cover", objectPosition: "center top" }}
          priority
        />

        {/* Subtle gradient overlay at the edge for a polished bleed */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "80px",
            height: "100%",
            background:
              "linear-gradient(to right, transparent, rgba(255,255,255,0.05))",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Right Side — Login Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 32px",
          minHeight: "100vh",
          background: "#fff",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "380px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Suspense>
            <EmployeeLoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
