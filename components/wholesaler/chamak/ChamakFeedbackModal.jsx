"use client";

import { useState } from "react";

export default function ChamakFeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  submitted,
}) {
  const [rating, setRating] = useState("satisfied"); // 'satisfied' | 'needs_work'
  const [feedbackText, setFeedbackText] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(rating, feedbackText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-celestique-taupe animate-scale-in">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-black text-lg p-1"
        >
          ✕
        </button>

        {submitted ? (
          /* Thank you state */
          <div className="flex flex-col items-center justify-center text-center py-6 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
              ✓
            </div>
            <h3 className="font-cirka text-2xl font-bold text-celestique-dark">
              Thank You!
            </h3>
            <p className="text-xs text-celestique-muted leading-relaxed max-w-xs">
              Your feedback helps fine-tune our generative jewelry synthesis models.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-full bg-celestique-dark text-white text-xs font-bold uppercase tracking-wider hover:bg-black"
            >
              Close
            </button>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                AI Fusion Feedback
              </span>
              <h3 className="font-cirka text-2xl font-bold text-celestique-dark">
                How did this design turn out?
              </h3>
              <p className="text-xs text-celestique-muted">
                Let us know if the synthesized piece met your expectations.
              </p>
            </div>

            {/* Error Message (Fix #3: Remains visible in modal upon failure) */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            {/* Satisfied / Needs Work Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRating("satisfied")}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  rating === "satisfied"
                    ? "border-celestique-dark bg-celestique-cream text-celestique-dark shadow-xs font-bold"
                    : "border-celestique-taupe text-celestique-muted hover:border-celestique-dark/50"
                }`}
              >
                <span className="text-xl">👍</span>
                <span className="text-xs">Satisfied</span>
              </button>

              <button
                type="button"
                onClick={() => setRating("needs_work")}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  rating === "needs_work"
                    ? "border-celestique-dark bg-celestique-cream text-celestique-dark shadow-xs font-bold"
                    : "border-celestique-taupe text-celestique-muted hover:border-celestique-dark/50"
                }`}
              >
                <span className="text-xl">👎</span>
                <span className="text-xs">Needs Work</span>
              </button>
            </div>

            {/* Optional text notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-celestique-dark font-sans">
                Additional Comments (Optional)
              </label>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What worked well or what should be improved (e.g. stones looked blurry, silhouette was warped)?"
                className="w-full text-xs text-celestique-dark bg-celestique-cream/30 border border-celestique-taupe rounded-xl p-3 focus:outline-none focus:border-celestique-dark font-sans"
              />
            </div>

            {/* Submit & Cancel buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-full border border-celestique-taupe text-celestique-dark text-xs font-bold uppercase tracking-wider hover:bg-celestique-cream transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-full bg-celestique-dark hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Send Feedback</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
