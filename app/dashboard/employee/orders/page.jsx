export const metadata = {
  title: "Orders — Jewel India",
  description: "Track your jewellery orders.",
};

export default function OrdersPage() {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777351889/order_logo_lnaqrz.svg"
            alt="Orders"
            className="w-7 h-7 opacity-60"
          />
        </div>
        <h1 className="text-[22px] font-bold text-[#111827] tracking-tight">
          Orders
        </h1>
        <p className="text-[15px] text-[#6B7280] text-center max-w-xs">
          Your order history and tracking will live here. Coming soon.
        </p>
        <span className="inline-block mt-2 text-[12px] font-semibold text-white bg-[#1A1A1A] px-4 py-1.5 rounded-full tracking-wide uppercase">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
