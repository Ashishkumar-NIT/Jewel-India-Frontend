"use client";

import { SignOutButton } from "../auth/SignOutButton";

export function MinimalHeader({ userEmail }) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-end bg-white border-b border-[#E5E5E5] h-[60px] md:h-[64px] lg:h-[68px] px-4 md:px-8 lg:px-12">
      <div className="flex items-center gap-4">
        {userEmail && (
          <span className="text-[14px] text-[#555] font-normal leading-none font-sans hidden md:block">
            {userEmail}
          </span>
        )}
        <SignOutButton />
      </div>
    </header>
  );
}