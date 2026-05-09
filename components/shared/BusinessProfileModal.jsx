"use client";

import { useEffect } from "react";

export function BusinessProfileModal({ business, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  if (!business) return null;

  const name = business.business_name || business.full_name || "Unknown Business";
  
  // Format join date
  let joinedStr = "February 2026";
  if (business.created_at) {
    const d = new Date(business.created_at);
    joinedStr = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // Location
  let locationStr = "Bandra, Mumbai";
  if (business.city || business.state) {
    locationStr = [business.city, business.state].filter(Boolean).join(", ");
  }

  // Avatar initial
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="bg-white w-full max-w-[500px] rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative z-10 animate-fade-in-up overflow-hidden">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-6 flex items-center gap-5">
          {/* Avatar */}
          <div className="w-[80px] h-[80px] shrink-0 rounded-full bg-gradient-to-br from-[#e8dec9] to-[#c9b48a] shadow-inner flex items-center justify-center text-[#5c4a2e] text-[32px] font-serif overflow-hidden relative">
            <span className="relative z-10 font-bold tracking-widest">{initial}</span>
            {/* Subtle inner highlight */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 rounded-full blur-md"></div>
          </div>
          
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h2 className="text-[24px] font-medium text-gray-800 leading-tight tracking-tight">{name}</h2>
              <div className="flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase tracking-wide">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Verified
              </div>
            </div>
            <p className="text-[14px] text-gray-500 mt-1">Member since {joinedStr}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="px-8">
          <div className="w-full h-px bg-gray-200/80"></div>
        </div>

        {/* Info Rows */}
        <div className="px-8 py-6 flex flex-col gap-4">
          
          <div className="flex items-start gap-4">
            <div className="mt-0.5 text-gray-500 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <p className="text-[14px] text-gray-700 font-medium">{locationStr}</p>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-0.5 text-gray-500 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <p className="text-[14px] text-gray-700 font-medium">+91 98765 22222</p>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-0.5 text-gray-500 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <p className="text-[14px] text-gray-700 font-medium">Specialises in: Contemporary & Designer jewellery</p>
          </div>

        </div>

        {/* Divider */}
        <div className="px-8">
          <div className="w-full h-px bg-gray-200/80"></div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 flex justify-end bg-white">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-[#111827] text-white text-[13px] font-medium rounded-[8px] hover:bg-black transition-colors"
          >
            Back to orders
          </button>
        </div>

      </div>
    </div>
  );
}
