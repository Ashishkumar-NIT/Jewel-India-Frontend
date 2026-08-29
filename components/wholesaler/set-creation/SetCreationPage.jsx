"use client";

import Link from "next/link";
import { useSetCreationFlow } from "../../../lib/hooks/useSetCreationFlow";
import SetCreationPickerStep from "./SetCreationPickerStep";
import SetCreationStyleStep from "./SetCreationStyleStep";
import SetCreationProgressStep from "./SetCreationProgressStep";
import SetCreationResultStep from "./SetCreationResultStep";
import SetCreationGalleryStep from "./SetCreationGalleryStep";
import InsufficientCreditsModal from "../chamak/InsufficientCreditsModal";
import CreditBadge from "../CreditBadge";

export default function SetCreationPage({ wholesalerId, userId }) {
  const flow = useSetCreationFlow(wholesalerId, userId);

  return (
    <div className="min-h-screen bg-[#FEFEFE] flex flex-col">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-celestique-taupe/80 px-4 md:px-10 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/wholesaler"
            className="flex items-center gap-2 text-xs font-bold text-celestique-dark hover:opacity-75 transition-opacity"
            title="Exit Set Creation"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-celestique-taupe hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-base">💎</span>
            <span className="font-cirka font-bold text-base md:text-lg text-celestique-dark">
              Set Creation
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CreditBadge />
          {flow.step !== "gallery" && (
            <button
              type="button"
              onClick={() => flow.setStep("gallery")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-celestique-taupe text-xs font-semibold text-celestique-dark hover:bg-celestique-cream transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>My sets</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1">
        {flow.step === "picker" && <SetCreationPickerStep flow={flow} />}
        {flow.step === "styling" && <SetCreationStyleStep flow={flow} />}
        {flow.step === "generating" && <SetCreationProgressStep flow={flow} />}
        {(flow.step === "result" || flow.step === "failed") && (
          <SetCreationResultStep flow={flow} />
        )}
        {flow.step === "gallery" && <SetCreationGalleryStep flow={flow} />}
      </main>

      <InsufficientCreditsModal
        isOpen={flow.insufficientCredits.isOpen}
        onClose={flow.closeInsufficientCredits}
        required={flow.insufficientCredits.required}
        balance={flow.insufficientCredits.balance}
        shortBy={flow.insufficientCredits.shortBy}
      />
    </div>
  );
}
