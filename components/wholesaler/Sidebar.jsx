"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from "../../lib/actions/auth";

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogoClick = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      await signOut();
    }
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
          opacity: 0.7 !important;
          background-color: rgba(0, 0, 0, 0.06) !important;
        }
        .logo-logout-btn:hover {
          opacity: 0.9 !important;
          transform: scale(1.05);
        }
      `}</style>
    </aside>
  );
}
