"use client";

import Link from "next/link";
import { useChamakFlow } from "../../../lib/hooks/useChamakFlow";
import ChamakPickerStep from "./ChamakPickerStep";
import ChamakProgressStep from "./ChamakProgressStep";
import ChamakSliderForm from "./ChamakSliderForm";
import ChamakResultStep from "./ChamakResultStep";
import ChamakGalleryStep from "./ChamakGalleryStep";
import ChamakFeedbackModal from "./ChamakFeedbackModal";
import InsufficientCreditsModal from "./InsufficientCreditsModal";
import CreditBadge from "../CreditBadge";
import { CHAMAK_PIPELINES } from "../../../lib/api/chamak";

// OpenAI is the default renderer. Nanobana's path only ever received one of
// the two designs, so its fusions came back looking like Design 1 whatever
// the sliders said; OpenAI receives both. The Nanobana route is kept intact
// and reachable at /dashboard/wholesaler/chamak-legacy for comparison, but
// nothing in the navigation points at it.
export default function ChamakPage({
  wholesalerId,
  userId,
  pipeline = CHAMAK_PIPELINES.OPENAI,
}) {
  const flow = useChamakFlow(wholesalerId, userId, pipeline);
  const isLegacy = pipeline === CHAMAK_PIPELINES.NANOBANA;

  return (
    <div className="min-h-screen bg-[#FEFEFE] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-celestique-taupe/80 px-4 md:px-10 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/wholesaler"
            className="flex items-center gap-2 text-xs font-bold text-celestique-dark hover:opacity-75 transition-opacity"
            title="Exit Chamak"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-celestique-taupe hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <span className="font-cirka font-bold text-base md:text-lg text-celestique-dark">
              Chamak AI
            </span>
            {/* Only the hidden legacy route is badged. The customer-facing
                page names no vendor — which model renders the image is an
                implementation detail, not a product feature. */}
            {isLegacy && (
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#92400E] border border-[#F59E0B]/30">
                Legacy · Nanobana
              </span>
            )}
          </div>
        </div>

        {/* Step-aware Right Actions */}
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
              <span>Gallery</span>
            </button>
          )}

          {flow.step !== "picker" && flow.step !== "gallery" && (
            <button
              type="button"
              onClick={flow.resetToPicker}
              className="px-3 py-1.5 rounded-lg bg-celestique-cream text-xs font-semibold text-celestique-dark hover:bg-celestique-taupe transition-all"
            >
              New Fusion
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full px-4 py-6 md:px-10 md:py-8 max-w-7xl mx-auto flex flex-col justify-start">
        {/* Step 1: Picker */}
        {flow.step === "picker" && (
          <ChamakPickerStep
            selectedDesign1={flow.selectedDesign1}
            selectedDesign2={flow.selectedDesign2}
            catalogProducts={flow.catalogProducts}
            isLoadingProducts={flow.isLoadingProducts}
            onSelectProduct={flow.selectProduct}
            onCustomImageChange={flow.setCustomImage}
            onStartAnalysis={flow.startVisionAnalysis}
            canStartAnalysis={flow.canStartAnalysis}
            uploadError={flow.uploadError}
            errorMessage={flow.errorMessage}
            isQuotaUnlimited={flow.isQuotaUnlimited}
            remainingQuota={flow.remainingQuota}
            totalQuota={flow.totalQuota}
            onViewGallery={() => flow.setStep("gallery")}
            galleryCount={flow.galleryGenerations.length}
          />
        )}

        {/* Step 2 or 4: In-Progress Wait Screen */}
        {(flow.step === "analyzing" || flow.step === "generating") && (
          <ChamakProgressStep
            step={flow.step}
            selectedDesign1={flow.selectedDesign1}
            selectedDesign2={flow.selectedDesign2}
            currentGeneration={flow.currentGeneration}
          />
        )}

        {/* Step 3: Slider Tuning Form */}
        {flow.step === "sliderForm" && (
          <ChamakSliderForm
            currentGeneration={flow.currentGeneration}
            sliderValues={flow.sliderValues}
            setSliderValues={flow.setSliderValues}
            noteText={flow.noteText}
            setNoteText={flow.setNoteText}
            onSubmitAndGenerate={flow.submitFormAndGenerate}
            onBackToPicker={flow.resetToPicker}
            isSubmitting={flow.isSubmitting}
            errorMessage={flow.errorMessage}
            isQuotaUnlimited={flow.isQuotaUnlimited}
            remainingQuota={flow.remainingQuota}
          />
        )}

        {/* Step 5: Result Showcase or Failure Error */}
        {(flow.step === "result" || flow.step === "failed") && (
          <ChamakResultStep
            step={flow.step}
            currentGeneration={flow.currentGeneration}
            signedOutputImageUrl={flow.signedOutputImageUrl}
            onReviseAndRetry={flow.reviseAndRetry}
            onStartNew={flow.resetToPicker}
            onOpenFeedback={flow.openFeedbackModal}
            errorMessage={flow.errorMessage}
          />
        )}

        {/* Step 6: Gallery Grid */}
        {flow.step === "gallery" && (
          <ChamakGalleryStep
            galleryGenerations={flow.galleryGenerations}
            onOpenItem={flow.openGalleryItem}
            onStartNew={flow.resetToPicker}
          />
        )}
      </main>

      {/* Feedback Modal */}
      <ChamakFeedbackModal
        isOpen={flow.feedbackState.isOpen}
        onClose={flow.closeFeedbackModal}
        onSubmit={flow.submitFeedback}
        isSubmitting={flow.feedbackState.isSubmitting}
        error={flow.feedbackState.error}
        submitted={flow.feedbackState.submitted}
      />

      {/* Insufficient Credits 402 Modal */}
      <InsufficientCreditsModal
        isOpen={flow.insufficientCredits.isOpen}
        onClose={flow.closeInsufficientCreditsModal}
        required={flow.insufficientCredits.required}
        balance={flow.insufficientCredits.balance}
        shortBy={flow.insufficientCredits.shortBy}
      />
    </div>
  );
}
