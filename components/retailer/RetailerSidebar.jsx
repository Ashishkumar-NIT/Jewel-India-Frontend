"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from "../../lib/actions/auth";
import { memo, useMemo } from "react";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306237/retailerProfile_DASHBOARD_puhhge.svg",
    href: "/dashboard/retailer",
  },
  {
    name: "Employees",
    icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306238/retailerProfile_EMPLOYEE_auk71p.svg",
    href: "/dashboard/retailer/employees",
  },
  {
    name: "Catalogue",
    icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306237/retailerProfile_CATALOGUE_icjpw6.svg",
    href: "/dashboard/retailer/catalogue",
  },
  {
    name: "Your Taste",
    icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777351888/saved_logo_bscslf.svg",
    href: "/dashboard/retailer/your-taste",
  },
  {
    name: "Store Theme",
    icon: "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306237/retailerProfile_DASHBOARD_puhhge.svg", // Fallback icon
    href: "/dashboard/retailer/theme",
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

  const retailerProfile = useMemo(
    () => ({
      retailerName: retailer?.full_name || "User",
      businessName: retailer?.business_name || "Business",
      logoUrl:
        retailer?.business_logo_url ||
        "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777013959/jewel_logo_rhgin9.svg",
    }),
    [retailer?.full_name, retailer?.business_name, retailer?.business_logo_url]
  );

  return (
    <aside className="fixed top-0 left-0 h-screen z-50 flex flex-col w-[260px] bg-white border-r border-gray-100 p-6">
      
      {/* Brand/Top Button */}
      <Link 
        href="?modal=add-employee" 
        scroll={false} 
        className="w-full h-[52px] bg-[#D1D5DB] bg-opacity-30 text-[#4338CA] rounded-[14px] flex items-center justify-center hover:bg-opacity-40 transition-colors mb-8"
        style={{ backgroundColor: "#E0E7FF" }}
      >
        <span className="text-[15px] font-bold text-[#4F46E5]">New Employee</span>
      </Link>

      {/* User Profile */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-[48px] h-[48px] rounded-[14px] overflow-hidden bg-gray-100 shrink-0">
          <Image src={retailerProfile.logoUrl} alt="Logo" width={48} height={48} loading="lazy" className="object-cover w-full h-full" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[16px] font-bold text-[#111111] truncate">{retailerProfile.retailerName}</span>
          <span className="text-[13px] text-[#6B7280] truncate">{retailerProfile.businessName}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 h-[48px] rounded-[14px] px-4 transition-all ${
                item.isActive ? "bg-[#F3F4F6] text-[#111111]" : "text-[#6B7280] hover:bg-gray-50"
              }`}
            >
              <div className={`w-[20px] h-[20px] shrink-0 flex items-center justify-center ${item.isActive ? "opacity-100" : "opacity-60"}`}>
                <Image src={item.icon} alt={item.name} width={20} height={20} loading="lazy" className="object-contain" />
              </div>
              <span className={`text-[15px] ${item.isActive ? "font-bold" : "font-medium"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto">
        <div className="flex w-full mb-8 justify-center pointer-events-none px-4">
          <Image
            src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777301517/retailer_profile_gucmsl.svg"
            alt="3D Illustration"
            width={140}
            height={140}
            loading="lazy"
            className="object-contain"
          />
        </div>
        
        <form action={signOut} className="w-full pt-4 border-t border-gray-50">
          <button type="submit" className="flex items-center gap-3 w-full px-4 py-2 text-[#6B7280] hover:text-[#111111] transition-colors group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-100">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span className="text-[14px] font-bold tracking-wider">LOG OUT</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

export default memo(RetailerSidebar, (prevProps, nextProps) => {
  return prevProps.retailer === nextProps.retailer;
});
