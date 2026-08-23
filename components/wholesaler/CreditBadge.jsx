"use client";

import Link from "next/link";
import { useCredits } from "../../context/CreditsContext";

export default function CreditBadge({ className = "" }) {
  const { wallet, isLoading } = useCredits();

  // Show shimmer only while actively loading, not forever when wallet is null
  if (isLoading) {
    return (
      <div
        className={`h-8 w-24 rounded-full bg-celestique-taupe/40 animate-pulse border border-celestique-taupe/60 ${className}`}
      />
    );
  }

  // If wallet couldn't load (backend not ready), show a muted placeholder instead of crashing
  if (!wallet) {
    return (
      <Link
        href="/dashboard/wholesaler/treasure-chest"
        title="Treasure Chest"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-celestique-taupe/60 text-xs font-semibold tracking-wide text-celestique-muted bg-white hover:bg-celestique-cream transition-all ${className}`}
      >
        <span className="text-sm">🪙</span>
        <span className="font-sans font-bold opacity-50">—</span>
        <span className="hidden sm:inline font-normal text-[11px] opacity-50">credits</span>
      </Link>
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
