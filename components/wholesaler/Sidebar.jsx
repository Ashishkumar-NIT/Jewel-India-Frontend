"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { memo, useMemo, useState } from "react";
import { signOut } from "../../lib/actions/auth";

const NAV_ITEMS = [
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

function Sidebar() {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems = useMemo(
    () =>
      NAV_ITEMS.map((item) => ({
        ...item,
        isActive:
          item.href === "/dashboard/wholesaler"
            ? pathname === item.href
            : pathname.startsWith(item.href),
      })),
    [pathname]
  );

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
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
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch
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
                  opacity: item.isActive ? 1 : 0.35,
                  filter: item.isActive ? "brightness(0)" : "grayscale(1)",
                }}
                className="sidebar-item"
              >
                <Image
                  src={item.icon}
                  alt={item.name}
                  width={28}
                  height={28}
                  loading="lazy"
                  style={{ objectFit: "contain" }}
                />
              </Link>
            );
          })}
        </div>

        {/* Logo at bottom — click to trigger logout confirmation */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
          <div
            onClick={() => setShowLogoutModal(true)}
            title="Log out"
            style={{
              width: "44px",
              height: "44px",
              backgroundColor: "#2e2833",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Image
              src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777013959/jewel_logo_rhgin9.svg"
              alt="Product Logo"
              width={28}
              height={28}
              loading="lazy"
            />
          </div>
        </div>

        <style>{`
          .sidebar-icon-stack {
            gap: 32px;
          }
          @media (max-width: 1024px) {
            .sidebar-icon-stack {
              gap: 32px;
            }
          }
          .sidebar-item:hover {
            opacity: 0.8 !important;
            background-color: rgba(0, 0, 0, 0.08) !important;
          }
        `}</style>
      </aside>

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[320px] shadow-xl flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-[18px] font-bold text-[#111827] mb-2">Sign Out</h3>
            <p className="text-[14px] text-[#6B7280] mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[#4B5563] font-bold hover:bg-gray-50 transition-colors"
              >
                No
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-[#DC2626] text-white font-bold hover:bg-[#B91C1C] transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(Sidebar);
