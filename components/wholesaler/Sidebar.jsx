"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from "../../lib/actions/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

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
    {
      name: "Chamak",
      icon: "chamak",
      href: "/dashboard/wholesaler/chamak",
      isCustomIcon: true,
    },
  ];

  return (
    <>
      <aside
        className="wholesaler-sidebar"
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
                {item.isCustomIcon ? (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                    <path d="M20 3v4" />
                    <path d="M22 5h-4" />
                    <path d="M4 17v2" />
                    <path d="M5 18H3" />
                  </svg>
                ) : (
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={28}
                    height={28}
                    style={{ objectFit: "contain" }}
                  />
                )}
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
      </aside>

      {/* Floating Bottom Nav for Mobile */}
      <nav className="wholesaler-bottom-nav">
        {[
          navItems[0], // Home
          navItems[3], // Catalogue
          navItems[1], // Add/Upload
          navItems[4], // Orders
          navItems[5], // Chat
        ].map((item) => {
          const isActive =
            item.href === "/dashboard/wholesaler"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`bottom-nav-item ${isActive ? "active" : ""}`}
              title={item.name}
              style={{
                opacity: isActive ? 1 : 0.45,
                filter: isActive ? "brightness(0)" : "grayscale(1)",
              }}
            >
              <Image
                src={item.icon}
                alt={item.name}
                width={24}
                height={24}
                style={{ objectFit: "contain" }}
              />
            </Link>
          );
        })}

        {/* More Menu Trigger (using Jewel Logo) */}
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`bottom-nav-item ${isMoreOpen ? "active" : ""}`}
          style={{
            backgroundColor: "#2e2833",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            border: "none",
            outline: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="More Options"
        >
          <Image
            src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777013959/jewel_logo_rhgin9.svg"
            alt="More options logo"
            width={22}
            height={22}
          />
        </button>
      </nav>

      {/* More Popover Options Menu */}
      {isMoreOpen && (
        <div className="bottom-nav-popover" onClick={() => setIsMoreOpen(false)}>
          <div className="bottom-nav-popover-content" onClick={(e) => e.stopPropagation()}>
            <Link 
              href="/dashboard/wholesaler/chamak" 
              onClick={() => setIsMoreOpen(false)}
              className="popover-item"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
              <span>Chamak AI Fusion</span>
            </Link>
            <Link 
              href="/dashboard/wholesaler/add-retailer" 
              onClick={() => setIsMoreOpen(false)}
              className="popover-item"
            >
              <Image 
                src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777013959/add_retailer_logo_aonkud.svg" 
                alt="Add Retailer" 
                width={20} 
                height={20} 
                style={{ filter: "brightness(0)" }}
              />
              <span>Invite Retailer</span>
            </Link>
            <button 
              onClick={() => {
                setIsMoreOpen(false);
                setIsLogoutModalOpen(true);
              }}
              className="popover-item popover-logout"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

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

        /* Responsive Nav & Sidebar Styles */
        @media (max-width: 767px) {
          .wholesaler-sidebar {
            display: none !important;
          }
          .wholesaler-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 90vw;
            max-width: 400px;
            height: 60px;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 100px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1), 0 1.5px 4px rgba(0,0,0,0.06);
            align-items: center;
            justify-content: space-around;
            padding: 0 12px;
            z-index: 100;
          }
          .bottom-nav-item {
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
            position: relative;
          }
          .bottom-nav-item.active {
            background: rgba(0, 0, 0, 0.05);
            filter: brightness(0) !important;
          }
          .bottom-nav-popover {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
            z-index: 99;
          }
          .bottom-nav-popover-content {
            position: fixed;
            bottom: 90px;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            background: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.08);
            border-radius: 16px;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            animation: popoverFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .popover-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-radius: 10px;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            background: transparent;
            border: none;
            cursor: pointer;
            width: 100%;
            text-align: left;
            transition: background-color 0.15s ease;
          }
          .popover-item:hover {
            background: #f3f4f6;
          }
          .popover-logout {
            color: #ef4444;
          }
          .popover-logout:hover {
            background: #fef2f2;
          }
        }
        @keyframes popoverFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, 10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </>
  );
}
