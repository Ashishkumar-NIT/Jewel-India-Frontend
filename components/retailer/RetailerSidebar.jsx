"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from "../../lib/actions/auth";
import { memo, useMemo } from "react";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard/retailer",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="8" height="8" rx="1.5"/>
        <rect x="13" y="3" width="8" height="8" rx="1.5"/>
        <rect x="3" y="13" width="8" height="8" rx="1.5"/>
        <rect x="13" y="13" width="8" height="8" rx="1.5"/>
      </svg>
    ),
  },
  {
    name: "Employees",
    href: "/dashboard/retailer/employees",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    name: "Catalogue",
    href: "/dashboard/retailer/catalogue",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    name: "Your Taste",
    href: "/dashboard/retailer/your-taste",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    name: "Store Theme",
    href: "/dashboard/retailer/theme",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
        <path d="M19.07 4.93L4.93 19.07"/>
      </svg>
    ),
  },
];

function RetailerSidebar({ retailer }) {
  const pathname = usePathname();

  const navItems = useMemo(
    () =>
      NAV_ITEMS.map((item) => ({
        ...item,
        isActive:
          item.href === "/dashboard/retailer"
            ? pathname === item.href
            : pathname.startsWith(item.href),
      })),
    [pathname]
  );

  const retailerName = retailer?.full_name || "User";
  const businessName = retailer?.business_name || "Business";
  const logoUrl =
    retailer?.business_logo_url ||
    "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777013959/jewel_logo_rhgin9.svg";

  return (
    <aside className="fixed top-0 left-0 h-screen z-50 flex flex-col w-[200px] bg-white border-r border-gray-100" style={{ padding: "20px 16px 24px 16px" }}>

      {/* New Employee Button */}
      <Link
        href="?modal=add-employee"
        scroll={false}
        className="w-full h-[44px] rounded-[10px] flex items-center justify-center text-[14px] font-semibold text-[#3B82F6] hover:opacity-90 transition-opacity mb-6 shrink-0"
        style={{ backgroundColor: "#DBEAFE" }}
      >
        New Employee
      </Link>

      {/* User Profile */}
      <div className="flex items-center gap-2.5 mb-7 px-1">
        <div className="w-[36px] h-[36px] rounded-full overflow-hidden bg-gray-200 shrink-0 border-2 border-gray-100">
          <Image src={logoUrl} alt="Logo" width={36} height={36} className="object-cover w-full h-full" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[14px] font-bold text-[#111111] truncate leading-tight">{retailerName}</span>
          <span className="text-[12px] text-[#6B7280] truncate leading-tight">{businessName}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 h-[42px] rounded-[10px] px-3 transition-all ${
              item.isActive
                ? "bg-[#F3F4F6] text-[#111111]"
                : "text-[#6B7280] hover:bg-gray-50 hover:text-[#374151]"
            }`}
          >
            <span className={item.isActive ? "text-[#111111]" : "text-[#9CA3AF]"}>
              {item.icon}
            </span>
            <span className={`text-[14px] ${item.isActive ? "font-semibold" : "font-medium"}`}>
              {item.name}
            </span>
          </Link>
        ))}
      </nav>

      {/* Bottom: Illustration + Logout */}
      <div className="shrink-0">
        <div className="flex justify-center mb-5 pointer-events-none">
          <Image
            src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777301517/retailer_profile_gucmsl.svg"
            alt="3D Illustration"
            width={110}
            height={110}
            className="object-contain"
          />
        </div>

        {/* Toggle Context Button */}
        <button
          onClick={async () => {
            try {
              const res = await fetch("/api/auth/toggle-view", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode: "employee" }),
              });
              if (res.ok) {
                window.location.href = "/dashboard/employee";
              } else {
                const errData = await res.json().catch(() => ({}));
                console.error("Failed to switch context:", errData.error || res.statusText);
              }
            } catch (err) {
              console.error("Error switching view context:", err);
            }
          }}
          className="flex items-center gap-2.5 w-full px-1 py-2 text-[#6B7280] hover:text-[#3B82F6] transition-colors group mb-2 border-none bg-transparent cursor-pointer outline-none text-left"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-100 group-hover:text-[#3B82F6]">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span className="text-[13px] font-bold tracking-wider">EMPLOYEE VIEW</span>
        </button>

        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-2.5 w-full px-1 py-2 text-[#6B7280] hover:text-[#111111] transition-colors group"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-100">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span className="text-[13px] font-bold tracking-wider">LOG OUT</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

export default memo(RetailerSidebar, (prev, next) => prev.retailer === next.retailer);
