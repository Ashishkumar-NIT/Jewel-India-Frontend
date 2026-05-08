"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "../../lib/actions/auth";
import styles from "./employeeSidebar.module.css";
const navItems = [
  {
    name: "Home",
    icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777351889/home_logo_xseblh.svg",
    href: "/dashboard/employee",
  },
  {
    name: "Curated",
    icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777351889/curated_logo_jbemqf.svg",
    href: "/dashboard/employee/curated",
  },
  {
    name: "Liked",
    icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777351889/liked_logo_mnifye.svg",
    href: "/dashboard/employee/likes",
  },
  {
    name: "Orders",
    icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777351889/order_logo_lnaqrz.svg",
    href: "/dashboard/employee/orders",
  },
  {
    name: "Chat",
    icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777351888/chat_logo_xxvotf.svg",
    href: "/dashboard/employee/messages",
  },
  {
    name: "Saved",
    icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777351888/saved_logo_bscslf.svg",
    href: "/dashboard/employee/save",
  },
];

const JI_LOGO =
  "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777013959/jewel_logo_rhgin9.svg";

/**
 * Permanent narrow vertical sidebar for the employee dashboard.
 * 60 px wide, dark background, icon-only with tooltips.
 * JI logo pinned at the bottom.
 */
export default function EmployeeSidebar() {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <aside className={styles.sidebar} id="employee-sidebar">
      {/* ── Nav icons, vertically centered ─────────────────────────── */}
      <nav className={styles.navStack}>
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard/employee"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              id={`employee-nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.icon} alt={item.name} draggable={false} />
              <span className={styles.tooltip}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── JI logo pinned at bottom (acts as logout) ──────────────── */}
      <div 
        className={styles.logoWrap} 
        onClick={() => setShowLogoutModal(true)} 
        style={{ cursor: "pointer" }}
        title="Log out"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={JI_LOGO} alt="Jewel India" draggable={false} />
      </div>

      {/* ── Logout Confirmation Modal ──────────────────────────────── */}
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
    </aside>
  );
}
