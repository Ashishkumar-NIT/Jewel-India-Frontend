"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    name: "Home",
    href: "/dashboard/employee",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[18px] h-[18px]">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: "Our Designs",
    href: "/dashboard/employee/designs",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[18px] h-[18px]">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: "Wholesaler Gallery",
    href: "/dashboard/employee/wholesaler-gallery",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[18px] h-[18px]">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    name: "Messages",
    href: "/dashboard/employee/messages",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-[18px] h-[18px]">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

/**
 * Horizontal tab navigation for the employee dashboard.
 * Renders below the header, above page content.
 */
export default function EmployeeTabs() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-[#E5E7EB] bg-white px-4 md:px-8">
      <div className="flex items-center gap-1 -mb-px overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/dashboard/employee"
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-[#111827] text-[#111827]"
                  : "border-transparent text-[#6B7280] hover:text-[#374151] hover:border-gray-300"
              }`}
            >
              <span className={isActive ? "text-[#111827]" : "text-[#9CA3AF]"}>
                {tab.icon}
              </span>
              {tab.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
