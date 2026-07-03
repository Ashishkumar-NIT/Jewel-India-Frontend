import Image from "next/image";
import { BottomStatCard } from "./StatCard";

export default function OverviewSection({
  productCount = 0,
  pendingCount = 0,
  hasNewOrders = false,
  chatsCount = 0,
  hasNewChats = false,
  usedUploads = 0,
  uploadLimit = Infinity,
}) {
  const uploadValue = uploadLimit && uploadLimit !== Infinity
    ? `${usedUploads}/${uploadLimit}`
    : `${usedUploads}`;

  return (
    <section className="px-4 md:px-6 py-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-cirka text-4xl text-celestique-dark mb-6">Insights</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <BottomStatCard
            icon={<Image src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777024605/live_products_nfjmtr.svg" alt="Live Products" width={16} height={16} loading="lazy" />}
            title="Live Products"
            value={productCount}
            href="/dashboard/wholesaler/catalogue"
          />
          <BottomStatCard
            icon={<svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 10-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>}
            title="New Orders"
            value={pendingCount}
            href="/dashboard/wholesaler/orders?tab=new"
            showBadge={hasNewOrders}
          />
          <BottomStatCard
            icon={<svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>}
            title="New Chat"
            value={chatsCount}
            href="/dashboard/wholesaler/queries"
            showBadge={hasNewChats}
          />
          <BottomStatCard
            icon={<svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>}
            title="Uploads Today"
            value={uploadValue}
            href="/dashboard/wholesaler/upload-history"
          />
        </div>

        {/* Chamak Coming Soon Elongated Card */}
        <div className="mt-6 w-full">
          <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#bb8651] to-[#f6e0a7] p-6 md:p-8 flex flex-row items-center justify-between border border-[#e4cc8f]/30 transition-all duration-200 hover:shadow-lg hover:scale-[1.01] min-h-[220px] md:min-h-[200px]">
            {/* Left Side: Content */}
            <div className="flex flex-col gap-3 z-10 max-w-[60%] sm:max-w-[65%] md:max-w-[70%]">
              <h3 className="font-cirka text-3xl md:text-4xl text-white font-bold leading-none tracking-normal">
                Chamak
              </h3>
              <p className="font-manrope text-xs md:text-sm text-white/95 leading-relaxed font-medium">
                Review products with low engagement and Replace with better designs
              </p>
              <div className="mt-2 self-start">
                <div className="relative border border-[#e4cc8f] bg-black px-5 py-2.5 rounded-lg shadow-[0px_4px_4px_rgba(0,0,0,0.25)] flex items-center justify-center">
                  <span className="font-manrope text-sm font-semibold text-white tracking-wide">
                    Coming soon
                  </span>
                  <div className="absolute inset-0 pointer-events-none rounded-lg shadow-[inset_2px_2px_4px_rgba(228,204,143,0.3)]" />
                </div>
              </div>
            </div>

            {/* Right Side: Masked Necklace Image */}
            <div className="absolute right-0 top-0 bottom-0 w-[45%] md:w-[35%] overflow-hidden pointer-events-none select-none z-0">
              <div
                className="absolute right-[-10px] md:right-[-20px] top-1/2 -translate-y-1/2 w-[180px] h-[220px] md:w-[220px] md:h-[260px] lg:w-[240px] lg:h-[280px]"
                style={{
                  maskImage: "url('/image/chamak_mask.svg')",
                  WebkitMaskImage: "url('/image/chamak_mask.svg')",
                  maskSize: "100% 100%",
                  WebkitMaskSize: "100% 100%",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                }}
              >
                <Image
                  src="/image/chamak_necklace.png"
                  alt="Chamak Necklace"
                  fill
                  className="object-cover object-right"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
