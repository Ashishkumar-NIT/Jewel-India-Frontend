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
    <aside className="fixed top-4 left-4 h-[calc(100vh-32px)] z-50 flex flex-col gap-3 w-[70px] md:w-[240px] transition-all duration-300">
      
      {/* Top Button - Separated from main sidebar box */}
      <Link 
        href="?modal=add-employee" 
        scroll={false} 
        className="w-full h-[48px] bg-[#E0E7FF] text-[#4338CA] rounded-[12px] flex items-center justify-center hover:bg-[#C7D2FE] transition-colors overflow-hidden shrink-0 shadow-sm"
      >
        <span className="hidden md:inline text-[14px] font-bold">New Employee</span>
        <span className="md:hidden text-lg font-bold">+</span>
      </Link>

      {/* Main Sidebar Container */}
      <div className="flex-1 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[20px] flex flex-col p-4 overflow-hidden">
        <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
          {/* User Profile */}
          <div className="flex items-center gap-3 mb-6 bg-[#FAFAFA] border border-[#F3F4F6] rounded-[16px] p-3">
            <div className="w-[42px] h-[42px] rounded-[12px] overflow-hidden bg-gray-100 shrink-0 shadow-sm">
              <Image src={retailerProfile.logoUrl} alt="Logo" width={42} height={42} loading="lazy" className="object-cover w-full h-full" />
            </div>
            <div className="hidden md:flex flex-col min-w-0">
              <span className="text-[14px] font-bold text-[#111827] truncate">{retailerProfile.retailerName}</span>
              <span className="text-[12px] text-[#6B7280] truncate">{retailerProfile.businessName}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch
                  className={`flex items-center gap-3 h-[48px] rounded-[12px] px-3.5 transition-colors ${
                    item.isActive ? "bg-[#F3F4F6] text-[#111827]" : "text-[#4B5563] hover:bg-gray-50"
                  }`}
                  title={item.name}
                >
                  <div className="w-[20px] h-[20px] shrink-0 flex items-center justify-center opacity-80">
                    <Image src={item.icon} alt={item.name} width={20} height={20} loading="lazy" className="object-contain" />
                  </div>
                  <span className={`hidden md:inline text-[14px] ${item.isActive ? "font-bold" : "font-medium"}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center mt-auto">
          <div className="hidden md:flex w-[140px] mb-6 relative justify-center pointer-events-none">
            <Image
              src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777301517/retailer_profile_gucmsl.svg"
              alt="3D Illustration"
              width={140}
              height={140}
              loading="lazy"
              className="object-contain"
            />
          </div>
          
          <form action={signOut} className="w-full border-t border-[#F3F4F6] pt-3">
            <button type="submit" className="flex items-center justify-center md:justify-start gap-3 w-full px-3 py-2 text-[#6B7280] hover:text-[#111827] hover:bg-gray-50 rounded-[10px] transition-colors">
              <Image
                src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777306237/retailerProfile_LOGOUT_xkyr9u.svg"
                alt="Logout"
                width={20}
                height={20}
                loading="lazy"
                className="shrink-0 opacity-80"
              />
              <span className="hidden md:inline text-[13px] font-bold uppercase tracking-wide">Log out</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

export default memo(RetailerSidebar, (prevProps, nextProps) => {
  // Only rerender if retailer data actually changes
  return prevProps.retailer === nextProps.retailer;
});
