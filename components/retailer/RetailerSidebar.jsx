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
    <aside className="fixed top-0 left-0 h-screen bg-white border-r border-[#E5E7EB] shadow-[2px_0_8px_rgba(0,0,0,0.02)] z-50 flex flex-col justify-between w-[70px] md:w-[200px] lg:w-[220px] transition-all duration-300">
      
      <div className="flex flex-col flex-1 px-3 md:px-4 pt-6 pb-4 overflow-y-auto overflow-x-hidden no-scrollbar">
        {/* Top Button */}
        <div className="mb-6 flex justify-center">
          <Link href="?modal=add-employee" scroll={false} className="w-full h-[40px] md:h-[44px] bg-[#E0E7FF] text-[#4338CA] rounded-full flex items-center justify-center hover:bg-[#C7D2FE] transition-colors overflow-hidden">
            <span className="hidden md:inline text-[13px] lg:text-[14px] font-bold truncate px-2">New Employee</span>
            <span className="md:hidden text-lg font-bold">+</span>
          </Link>
        </div>

        {/* User Profile */}
        <div className="flex items-center justify-center md:justify-start gap-3 mb-6 pb-6 border-b border-gray-100">
          <div className="w-[36px] h-[36px] rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
            <Image src={retailerProfile.logoUrl} alt="Logo" width={36} height={36} loading="lazy" className="object-cover w-full h-full" />
          </div>
          <div className="hidden md:flex flex-col min-w-0">
            <span className="text-[13px] lg:text-[14px] font-bold text-[#111827] truncate">{retailerProfile.retailerName}</span>
            <span className="text-[11px] lg:text-[12px] text-[#6B7280] truncate">{retailerProfile.businessName}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch
                className={`flex items-center gap-3 h-[44px] rounded-[10px] px-3 transition-colors ${
                  item.isActive ? "bg-[#F3F4F6] text-[#111827] font-bold" : "text-[#4B5563] hover:bg-gray-50"
                } ${item.isActive ? "md:bg-[#E5E7EB]" : ""}`}
                title={item.name}
              >
                <div className="w-[18px] h-[18px] shrink-0 flex items-center justify-center opacity-80">
                  <Image src={item.icon} alt={item.name} width={18} height={18} loading="lazy" className="object-contain" />
                </div>
                <span className={`hidden md:inline text-[13px] lg:text-[14px] ${item.isActive ? "font-bold" : "font-medium"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-3 md:px-4 pb-6 flex flex-col items-center">
        <div className="hidden md:flex w-[100px] lg:w-[120px] mb-4 relative justify-center pointer-events-none">
          <Image
            src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777301517/retailer_profile_gucmsl.svg"
            alt="3D Illustration"
            width={120}
            height={120}
            loading="lazy"
            className="object-contain"
          />
        </div>
        
        <form action={signOut} className="w-full">
          <button type="submit" className="flex items-center justify-center md:justify-start gap-3 w-full px-3 py-2 text-[#6B7280] hover:text-[#111827] hover:bg-gray-50 rounded-[10px] transition-colors">
            <Image
              src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306237/retailerProfile_LOGOUT_xkyr9u.svg"
              alt="Logout"
              width={18}
              height={18}
              loading="lazy"
              className="shrink-0 opacity-80"
            />
            <span className="hidden md:inline text-[12px] font-bold uppercase tracking-wide">Log out</span>
          </button>
        </form>
      </div>

    </aside>
  );
}

export default memo(RetailerSidebar, (prevProps, nextProps) => {
  // Only rerender if retailer data actually changes
  return prevProps.retailer === nextProps.retailer;
});
