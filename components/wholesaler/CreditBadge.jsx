"use client";

import Link from "next/link";
import { useCredits } from "../../context/CreditsContext";

export default function CreditBadge({ className = "" }) {
  const { wallet, isLoading } = useCredits();

  // If loading or wallet not yet loaded, render a fixed-width shimmer placeholder (never "0")
  if (isLoading || !wallet) {
    return (
      <div
        className={`h-8 w-24 rounded-full bg-celestique-taupe/40 skeleton-shimmer border border-celestique-taupe/60 ${className}`}
      />
    );
  }

  const isLowBalance = Boolean(wallet.low_balance);
  const available = wallet.available ?? 0;

  return (
    <Link
      href="/dashboard/wholesaler/treasure-chest"
      title={`Treasure Chest: ${available} credits available`}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-2xs ${
        isLowBalance
          ? "bg-[#FFFBEB] border-[#FDE68A] text-[#B45309] hover:bg-[#FEF3C7]"
          : "bg-white border-celestique-taupe text-celestique-dark hover:bg-celestique-cream hover:border-celestique-dark/60"
      } ${className}`}
    >
      <span className="text-sm">🪙</span>
      <span className="font-sans font-bold">{available}</span>
      <span className="hidden sm:inline font-normal text-[11px] opacity-80">credits</span>
    </Link>
  );
}
