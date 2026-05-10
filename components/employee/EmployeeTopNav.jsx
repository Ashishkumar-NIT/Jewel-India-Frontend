"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { 
    name: "Home", 
    href: "/dashboard/employee",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    )
  },
  { 
    name: "Catalogue", 
    href: "/dashboard/employee/wholesaler-gallery",
    icon: (
      <div style={{
        width: "17px",
        height: "17px",
        backgroundColor: "currentColor",
        WebkitMaskImage: "url('https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778318363/catalogue_icon_rf0pjq.svg')",
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskImage: "url('https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778318363/catalogue_icon_rf0pjq.svg')",
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center"
      }} />
    )
  },
  { 
    name: "Queries", 
    href: "/dashboard/employee/messages",
    icon: (
      <div style={{
        width: "17px",
        height: "17px",
        backgroundColor: "currentColor",
        WebkitMaskImage: "url('https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778318363/query_icon_p7xfqk.svg')",
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskImage: "url('https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778318363/query_icon_p7xfqk.svg')",
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center"
      }} />
    )
  },
  { 
    name: "Orders", 
    href: "/dashboard/employee/orders",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    )
  },
];

export default function EmployeeBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2"
      style={{
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.45)",
        borderRadius: "100px",
        padding: "6px 6px",
        display: "flex",
        alignItems: "center",
        gap: "2px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 1.5px 4px rgba(0,0,0,0.06)",
      }}
    >
      {navItems.map((item) => {
        const isActive =
          item.href === "/dashboard/employee"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.name}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "100px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: isActive ? "600" : "500",
              color: isActive ? "#111827" : "#6b7280",
              background: isActive ? "rgba(255,255,255,0.85)" : "transparent",
              boxShadow: isActive ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.2s ease",
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ opacity: isActive ? 1 : 0.7, display: "flex" }}>{item.icon}</span>
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
