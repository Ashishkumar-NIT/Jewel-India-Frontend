"use client";

import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
    </svg>
  );
}

const tabs = [
  { id: "home", label: "Home", icon: <HomeIcon />, href: "/dashboard/wholesaler" },
  { id: "upload", label: "Upload", icon: <UploadIcon />, href: "/dashboard/wholesaler/add-product" },
  { id: "catalogue", label: "My Catalogue", icon: "/image/Vector.png", href: "/dashboard/wholesaler/catalogue" },
];

export default function NavigationTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const active = tabs.find((tab) => tab.href === pathname)?.id ?? "home";

  function handleTabClick(tab) {
    router.push(tab.href);
  }

  return (
    <div className="px-6 py-3 flex justify-center">
      {/* Pill container */}
      <div className="flex flex-row items-center gap-1 rounded-full bg-gray-100 p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab)}
            className={`font-manrope flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium cursor-pointer transition-all duration-200 ease-in-out ${
              active === tab.id
                ? "bg-white text-gray-900 shadow-md"
                : "bg-transparent text-gray-500 hover:text-gray-700 hover:shadow-sm hover:bg-white/50 active:scale-95"
            }`}
          >
            {tab.icon && (
              <span className="w-4 h-4 flex items-center justify-center">
                {typeof tab.icon === "string" ? (
                  <NextImage src={tab.icon} alt="" width={16} height={16} />
                ) : (
                  tab.icon
                )}
              </span>
            )}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
