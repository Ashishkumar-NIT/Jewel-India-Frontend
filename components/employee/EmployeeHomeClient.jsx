"use client";

import { useRouter } from "next/navigation";
import DesignerCollectionSection from "./DesignerCollectionSection";
import EmployeeBottomNav from "./EmployeeTopNav";

export default function EmployeeHomeClient({ employee, businessName, designs }) {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col bg-white">
      {/* ── Hero Section — Full Viewport Height ── */}
      <section
        className="relative w-full flex flex-col items-center justify-start overflow-hidden"
        style={{ minHeight: "100dvh" }}
      >
        {/* Background Image (Archway) */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778318369/home_bg_ryyopk.svg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center"
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 pt-48">
          <h1 className="font-serif text-[42px] md:text-[54px] text-[#2c1f18] mb-3 leading-tight">
            {businessName}
          </h1>
          <p className="text-[13px] md:text-[15px] text-[#4a3b32] max-w-[320px] md:max-w-md mx-auto mb-8 leading-relaxed">
            Discover designs selected with precision, blending craftsmanship and ethnic style
          </p>

          {/* Interactive Card */}
          <div className="w-[85vw] max-w-[280px] md:max-w-[320px] lg:max-w-[380px] xl:max-w-[440px] rounded-[24px] overflow-hidden relative shadow-2xl flex flex-col" style={{ aspectRatio: "1/1" }}>
            {/* Full card background image */}
            <div className="absolute inset-0">
              <img
                src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778318370/home_fg_gtjkeu.svg"
                alt="Card Background"
                className="w-full h-full object-cover"
              />
            </div>

            {/* No overlays as requested */}

            {/* Content — full height flex */}
            <div className="relative z-10 flex flex-col h-full p-8 pb-6">
              {/* Top: large serif text left-aligned */}
              <h3
                className="font-serif text-white leading-[1.1] text-left"
                style={{ fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 400 }}
              >
                let&apos;s find out what you<br />are looking for
              </h3>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Bottom: button + skip */}
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => router.push('/dashboard/employee/questionnaire')}
                  className="w-full py-3.5 rounded-none bg-[#1a1a1a]/90 backdrop-blur-sm text-white text-[15px] font-medium tracking-wide border border-white/10 hover:bg-[#111] transition-all"
                >
                  Start with some question
                </button>
                <button
                  onClick={() => router.push('/dashboard/employee/playground')}
                  className="text-white/75 text-[14px] font-medium hover:text-white transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>


      </section>

      {/* ── Designer Collection Section ── */}
      <DesignerCollectionSection employee={employee} businessName={businessName} designs={designs} />
    </div>
  );
}
