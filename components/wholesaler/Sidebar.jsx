"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from "../../lib/actions/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoClick = () => {
    setIsLogoutModalOpen(true);
  };

  const navItems = [
    {
      name: "Home",
      icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777013959/home_logo_q3xekq.svg",
      href: "/dashboard/wholesaler",
    },
    {
      name: "Add/Upload",
      icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777013959/upload_logo_hfdz8a.svg",
      href: "/dashboard/wholesaler/add-product",
    },
    {
      name: "Add Retailer",
      icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777013959/add_retailer_logo_aonkud.svg",
      href: "/dashboard/wholesaler/add-retailer",
    },
    {
      name: "Catalogue",
      icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777013959/catalogue_logo_baed4n.svg",
      href: "/dashboard/wholesaler/catalogue",
    },
    {
      name: "Orders",
      icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777013960/PACKAGE_LOGO_ekya2x.svg",
      href: "/dashboard/wholesaler/orders",
    },
    {
      name: "Chat",
      icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777013960/chatLOGO_j1mnkx.svg",
      href: "/dashboard/wholesaler/queries",
    },
  ];

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "70px",
        backgroundColor: "#f5f5f3",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 0",
        overflow: "hidden",
        boxSizing: "border-box",
        zIndex: 50,
      }}
    >
      <div className="sidebar-icon-stack" style={{ display: "flex", flexDirection: "column", marginTop: "96px", marginBottom: "auto" }}>
        {navItems.map((item) => {
          // Exact match for home to prevent it from being active on all sub-routes
          const isActive =
            item.href === "/dashboard/wholesaler"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              title={item.name}
              style={{
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                transition: "all 0.15s ease",
                backgroundColor: "transparent",
                opacity: isActive ? 1 : 0.35,
                filter: isActive ? "brightness(0)" : "grayscale(1)",
              }}
              className="sidebar-item"
            >
              <Image
                src={item.icon}
                alt={item.name}
                width={28}
                height={28}
                style={{ objectFit: "contain" }}
              />
            </Link>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "8px" }}>
        <button
          onClick={handleLogoClick}
          style={{
            width: "44px",
            height: "44px",
            backgroundColor: "#2e2833",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
            padding: 0,
            outline: "none",
            transition: "transform 0.15s ease, opacity 0.15s ease",
          }}
          className="logo-logout-btn"
          title="Logout"
        >
          <Image
            src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777013959/jewel_logo_rhgin9.svg"
            alt="Product Logo"
            width={28}
            height={28}
          />
        </button>
      </div>

      {isLogoutModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={() => setIsLogoutModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "32px",
              width: "360px",
              maxWidth: "90%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              animation: "scaleUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning logout icon */}
            <div
              style={{
                width: "56px",
                height: "56px",
                backgroundColor: "#fef2f2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#111827",
                margin: "0 0 8px 0",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Confirm Logout
            </h3>

            {/* Description */}
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                margin: "0 0 24px 0",
                lineHeight: "1.5",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Are you sure you want to logout?
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px", width: "100%" }}>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "background-color 0.15s ease",
                  outline: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsLogoutModalOpen(false);
                  await signOut();
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#2e2833",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "opacity 0.15s ease",
                  outline: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sidebar-icon-stack {
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .sidebar-icon-stack {
            gap: 32px;
          }
        }
        @media (max-height: 680px) {
          .sidebar-icon-stack {
            margin-top: 32px !important;
            gap: 16px !important;
          }
        }
        .sidebar-item:hover {
          opacity: 0.7 !important;
          background-color: rgba(0, 0, 0, 0.06) !important;
        }
        .logo-logout-btn:hover {
          opacity: 0.9 !important;
          transform: scale(1.05);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </aside>
  );
}
