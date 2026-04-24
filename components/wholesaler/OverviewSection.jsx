import Image from "next/image";
import { BottomStatCard } from "./StatCard";

export default function OverviewSection() {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-cirka text-4xl text-celestique-dark mb-6">Insights</h2>

        <div className="flex flex-row gap-4 w-full">
          <BottomStatCard
            icon={<Image src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777024605/live_products_nfjmtr.svg" alt="Live Products" width={16} height={16} />}
            title="Live Products"
            value={<>180<span className="text-gray-400 text-2xl font-sans">/200</span></>}
          />
          <BottomStatCard
            icon={<Image src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777024605/avg_likes_logo_s3zgi3.svg" alt="Avg. Daily Likes" width={16} height={16} />}
            title="Avg. Daily Likes"
            value="30k"
          />
          <BottomStatCard
            icon={<Image src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777024605/total_grams_sold_szlqpe.svg" alt="Total grams ordered" width={16} height={16} />}
            title="Total grams ordered"
            value="4.5k"
          />
          <BottomStatCard
            icon={<Image src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1777024605/response_time_logo_zpm43k.svg" alt="Query response time" width={16} height={16} />}
            title="Query response time"
            value="2hrs"
          />
        </div>
      </div>
    </section>
  );
}
