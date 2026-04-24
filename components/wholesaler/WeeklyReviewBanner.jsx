import Image from "next/image";

export default function WeeklyReviewBanner() {
  return (
    <section className="px-6 pb-10">
      <div className="mx-auto max-w-7xl">
        <div className="w-full h-[160px] rounded-2xl px-8 py-6 flex items-center justify-between overflow-hidden relative bg-gradient-to-r from-[#B8895A] to-[#F5E6C8]">
          {/* Left Section */}
          <div className="flex flex-col justify-center gap-3 relative z-10">
            <h2 className="text-3xl font-semibold text-white">
              Weekly review
            </h2>
            <p className="text-sm text-white/80 max-w-md">
              Review products with low engagement and Replace with better designs
            </p>
            <button className="bg-black text-white px-5 py-2.5 rounded-lg font-medium shadow-md w-max flex items-center hover:scale-105 transition-all duration-200 mt-1">
              Review now
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 ml-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Right Section */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-end opacity-20 pointer-events-none">
            <Image
              src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777026561/arrow_logo_h8purb.svg"
              alt="Background Arrow"
              width={200}
              height={200}
              className="w-48 h-48 object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
