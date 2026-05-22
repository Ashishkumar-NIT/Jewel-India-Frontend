"use client";

import { useState, useEffect } from "react";
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
    name: "Dashboard",
    href: "/dashboard/employee/designs",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
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

export default function EmployeeBottomNav({ hasUnreadQueries = false, latestOrderUpdate = null, isRetailer = false }) {
  const pathname = usePathname();
  const [hasUnreadOrders, setHasUnreadOrders] = useState(false);

  // Check if we need to show the unread orders dot
  useEffect(() => {
    if (!latestOrderUpdate) {
      setHasUnreadOrders(false);
      return;
    }

    if (pathname === "/dashboard/employee/orders") {
      // If we're on the orders page, clear the dot and save the timestamp
      localStorage.setItem("employee_orders_last_checked", new Date().toISOString());
      setHasUnreadOrders(false);
    } else {
      // Check local storage against latest order update
      const lastChecked = localStorage.getItem("employee_orders_last_checked");
      if (!lastChecked || new Date(latestOrderUpdate) > new Date(lastChecked)) {
        setHasUnreadOrders(true);
      } else {
        setHasUnreadOrders(false);
      }
    }
  }, [pathname, latestOrderUpdate]);

  const handleSwitchToAdmin = async () => {
    try {
      const res = await fetch("/api/auth/toggle-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "retailer" }),
      });
      if (res.ok) {
        window.location.href = "/dashboard/retailer";
      } else {
        console.error("Failed to switch view context");
      }
    } catch (err) {
      console.error("Error switching view context:", err);
    }
  };

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
            
        // Check if this specific tab should show a notification dot
        const showDot = 
          (item.name === "Queries" && hasUnreadQueries) || 
          (item.name === "Orders" && hasUnreadOrders);

        return (
          <Link
            key={item.name}
            href={item.href}
            className="relative"
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
            <span style={{ opacity: isActive ? 1 : 0.7, display: "flex", position: "relative" }}>
              {item.icon}
              {/* Notification Dot */}
              {showDot && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 border border-white"></span>
                </span>
              )}
            </span>
            {item.name}
          </Link>
        );
      })}
      
      {isRetailer && (
        <button
          onClick={handleSwitchToAdmin}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            borderRadius: "100px",
            border: "none",
            outline: "none",
            background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
            color: "#FFFFFF",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(29, 78, 216, 0.2)",
            transition: "transform 0.15s ease, opacity 0.15s ease",
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
            marginLeft: "4px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Admin View
        </button>
      )}
    </nav>
  );
}
