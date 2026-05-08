import Image from "next/image";
import { BottomStatCard } from "./StatCard";

export default function OverviewSection({ productCount = 0 }) {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-cirka text-4xl text-celestique-dark mb-6">Insights</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <BottomStatCard
            icon={<Image src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777024605/live_products_nfjmtr.svg" alt="Live Products" width={16} height={16} loading="lazy" />}
            title="Live Products"
            value={productCount}
          />
        </div>
      </div>
    </section>
  );
}
