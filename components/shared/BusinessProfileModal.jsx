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
          
          {locationStr && (
            <div className="flex items-start gap-4">
              <div className="mt-0.5 text-gray-500 shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <p className="text-[14px] text-gray-700 font-medium">{locationStr}</p>
            </div>
          )}

          {business.email && (
            <div className="flex items-start gap-4">
              <div className="mt-0.5 text-gray-500 shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <p className="text-[14px] text-gray-700 font-medium">{business.email}</p>
            </div>
          )}

          {business.full_name && (
            <div className="flex items-start gap-4">
              <div className="mt-0.5 text-gray-500 shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <p className="text-[14px] text-gray-700 font-medium">Contact: {business.full_name}</p>
            </div>
          )}

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
