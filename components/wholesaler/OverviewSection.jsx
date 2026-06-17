import Image from "next/image";
import { BottomStatCard } from "./StatCard";

export default function OverviewSection({ productCount = 0, pendingCount = 0, hasNewOrders = false, chatsCount = 0, hasNewChats = false }) {
  return (
    <section className="px-4 md:px-6 py-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-cirka text-4xl text-celestique-dark mb-6">Insights</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
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
        </div>
      </div>
    </section>
  );
}
