"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function GetAppPage() {
  const [deviceOS, setDeviceOS] = useState("unknown"); // "ios" | "android" | "desktop" | "unknown"
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Detect OS
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/.test(ua);
    
    if (isIOS) {
      setDeviceOS("ios");
    } else if (isAndroid) {
      setDeviceOS("android");
    } else {
      setDeviceOS("desktop");
    }

    // Intercept beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    const handleAppInstalled = () => {
      setShowInstallBtn(false);
      setInstallSuccess(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallSuccess(true);
        setShowInstallBtn(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#FAF9F6] via-[#F5F2EB] to-[#EAE5D9] text-[#2c1f18] font-sans flex flex-col items-center justify-between py-12 px-6">
      {/* Header / Logo */}
      <header className="flex flex-col items-center text-center gap-4 shrink-0">
        <Link href="/" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#3D3232] to-[#A38686] flex items-center justify-center shadow-md">
            <span className="text-white font-extrabold text-[15px] tracking-widest">JI</span>
          </div>
          <span className="text-[20px] font-bold text-[#111111] tracking-wide font-serif">Jewels India</span>
        </Link>
      </header>

      {/* Main Container Card */}
      <main className="w-full max-w-[500px] bg-white/60 backdrop-blur-lg border border-white/80 shadow-2xl rounded-[32px] p-8 md:p-10 my-8 flex flex-col items-center gap-8 relative overflow-hidden transition-all duration-300">
        {/* Decorative ambient background blur */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#A38686]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#6B4F4F]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Title */}
        <div className="text-center space-y-2 relative z-10">
          <span className="text-[10px] tracking-[0.3em] font-extrabold text-[#6B4F4F] uppercase">PROGRESIVE WEB APP</span>
          <h1 className="text-[26px] md:text-[30px] font-serif font-bold text-[#111111] leading-tight">
            Install Jewel India
          </h1>
          <p className="text-[13.5px] text-gray-500 max-w-[340px] mx-auto leading-relaxed">
            Get full standalone access right from your home screen. Fast, secure, and offline-ready.
          </p>
        </div>

        {/* Dynamic Instruction Panels */}
        <div className="w-full relative z-10">
          {installSuccess ? (
            <div className="text-center p-6 bg-emerald-50 border border-emerald-200/60 rounded-[20px] flex flex-col items-center gap-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="font-bold text-emerald-950 text-[16px]">App Installed Successfully!</h3>
              <p className="text-[13px] text-emerald-800/80 leading-relaxed">
                Jewel India has been added to your home screen. You can close this browser page and launch the app now.
              </p>
            </div>
          ) : (
            <>
              {/* iOS Panel */}
              {deviceOS === "ios" && (
                <div className="flex flex-col gap-5 animate-fade-in w-full">
                  <div className="flex justify-center mb-1">
                    <div className="p-3 bg-amber-50 rounded-2xl text-amber-700 border border-amber-200/50 flex items-center gap-2.5">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12V20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V12" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                      <span className="text-[12px] font-bold uppercase tracking-wider">Use Safari Browser</span>
                    </div>
                  </div>

                  <ul className="flex flex-col gap-4 text-[13.5px]">
                    <li className="flex gap-4 items-start bg-white/40 p-4 border border-white/50 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-[#6B4F4F]/10 text-[#6B4F4F] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">1</div>
                      <p className="text-gray-700 leading-relaxed">Open this page in the **Safari browser** on your iPhone/iPad.</p>
                    </li>
                    <li className="flex gap-4 items-start bg-white/40 p-4 border border-white/50 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-[#6B4F4F]/10 text-[#6B4F4F] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">2</div>
                      <p className="text-gray-700 leading-relaxed">Tap the **Share button** at the bottom (the square icon with an upward-pointing arrow).</p>
                    </li>
                    <li className="flex gap-4 items-start bg-white/40 p-4 border border-white/50 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-[#6B4F4F]/10 text-[#6B4F4F] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">3</div>
                      <p className="text-gray-700 leading-relaxed">Scroll down the menu list and tap **&apos;Add to Home Screen&apos;**.</p>
                    </li>
                    <li className="flex gap-4 items-start bg-white/40 p-4 border border-white/50 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-[#6B4F4F]/10 text-[#6B4F4F] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">4</div>
                      <p className="text-gray-700 leading-relaxed">Tap **&apos;Add&apos;** in the top-right corner to complete the install.</p>
                    </li>
                  </ul>
                </div>
              )}

              {/* Android Panel */}
              {deviceOS === "android" && (
                <div className="flex flex-col gap-6 animate-fade-in w-full">
                  {showInstallBtn && (
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-4 bg-gradient-to-tr from-[#3D3232] to-[#6B4F4F] text-white rounded-2xl text-[14px] font-bold tracking-wider uppercase hover:opacity-95 shadow-lg active:scale-[0.98] transition-all duration-200"
                    >
                      Install App Now
                    </button>
                  )}

                  <ul className="flex flex-col gap-4 text-[13.5px]">
                    <li className="flex gap-4 items-start bg-white/40 p-4 border border-white/50 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-[#6B4F4F]/10 text-[#6B4F4F] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">1</div>
                      <p className="text-gray-700 leading-relaxed">Ensure you are using **Chrome browser** for the best installation experience.</p>
                    </li>
                    <li className="flex gap-4 items-start bg-white/40 p-4 border border-white/50 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-[#6B4F4F]/10 text-[#6B4F4F] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">2</div>
                      <p className="text-gray-700 leading-relaxed">Tap the **Install App Now** button above or click the 3-dot menu (⋮) in the top right.</p>
                    </li>
                    <li className="flex gap-4 items-start bg-white/40 p-4 border border-white/50 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-[#6B4F4F]/10 text-[#6B4F4F] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">3</div>
                      <p className="text-gray-700 leading-relaxed">Select **&apos;Add to Home Screen&apos;** or **&apos;Install app&apos;**.</p>
                    </li>
                    <li className="flex gap-4 items-start bg-white/40 p-4 border border-white/50 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-[#6B4F4F]/10 text-[#6B4F4F] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">4</div>
                      <p className="text-gray-700 leading-relaxed">Confirm by clicking **&apos;Add&apos;** and find the app icon on your home screen.</p>
                    </li>
                  </ul>
                </div>
              )}

              {/* Desktop Panel */}
              {deviceOS === "desktop" && (
                <div className="flex flex-col gap-6 animate-fade-in w-full items-center">
                  <div className="w-full text-[13.5px] flex flex-col gap-4">
                    <div className="flex gap-4 items-start bg-white/40 p-4 border border-white/50 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-[#6B4F4F]/10 text-[#6B4F4F] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">1</div>
                      <p className="text-gray-700 leading-relaxed">Look for the install icon **(⊕)** in your browser&apos;s address bar at the top right.</p>
                    </div>
                    <div className="flex gap-4 items-start bg-white/40 p-4 border border-white/50 rounded-2xl">
                      <div className="w-6 h-6 rounded-full bg-[#6B4F4F]/10 text-[#6B4F4F] font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5">2</div>
                      <p className="text-gray-700 leading-relaxed">Click it and follow the prompt to install **Jewel India** as a standalone desktop app.</p>
                    </div>
                  </div>

                  {/* QR Code Segment */}
                  <div className="border-t border-[#6B4F4F]/10 pt-6 w-full flex flex-col items-center gap-4">
                    <h4 className="text-[12.5px] font-bold uppercase tracking-wider text-gray-500">Scan to Install on Mobile</h4>
                    
                    {/* Simulated SVG QR Code */}
                    <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-md">
                      <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="text-[#3D3232]">
                        {/* Position Markers */}
                        <rect x="10" y="10" width="35" height="35" stroke="currentColor" strokeWidth="5" fill="none" />
                        <rect x="18" y="18" width="19" height="19" fill="currentColor" />
                        
                        <rect x="95" y="10" width="35" height="35" stroke="currentColor" strokeWidth="5" fill="none" />
                        <rect x="103" y="18" width="19" height="19" fill="currentColor" />
                        
                        <rect x="10" y="95" width="35" height="35" stroke="currentColor" strokeWidth="5" fill="none" />
                        <rect x="18" y="103" width="19" height="19" fill="currentColor" />

                        {/* QR Data Noise Patterns */}
                        <rect x="55" y="15" width="10" height="10" fill="currentColor" />
                        <rect x="75" y="10" width="10" height="15" fill="currentColor" />
                        <rect x="65" y="30" width="15" height="10" fill="currentColor" />
                        
                        <rect x="15" y="55" width="15" height="10" fill="currentColor" />
                        <rect x="35" y="65" width="10" height="15" fill="currentColor" />
                        
                        <rect x="55" y="55" width="30" height="30" fill="currentColor" />
                        <rect x="60" y="60" width="20" height="20" fill="white" />
                        <rect x="67" y="67" width="6" height="6" fill="currentColor" />
                        
                        <rect x="95" y="55" width="10" height="20" fill="currentColor" />
                        <rect x="115" y="65" width="15" height="10" fill="currentColor" />
                        
                        <rect x="55" y="95" width="15" height="10" fill="currentColor" />
                        <rect x="65" y="115" width="10" height="15" fill="currentColor" />
                        
                        <rect x="95" y="95" width="20" height="10" fill="currentColor" />
                        <rect x="110" y="110" width="15" height="15" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="text-[12px] text-gray-500 font-medium">Point your camera at the screen to open download link</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer link to go back */}
      <footer className="shrink-0 text-center">
        <Link href="/" className="text-[12px] tracking-[0.2em] font-semibold text-[#6B4F4F] hover:text-[#111111] transition-colors uppercase underline underline-offset-4 decoration-[#6B4F4F]/30 hover:decoration-[#111111]">
          Back to Storefront
        </Link>
      </footer>
    </div>
  );
}
