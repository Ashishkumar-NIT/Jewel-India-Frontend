import Link from "next/link";
import { categories } from "../../lib/config/catalogueCategories";
import CategoryCard from "./CategoryCard";

export default function CatalogueSection() {
  return (
    <section className="px-4 md:px-6 py-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-left">
          <h2 className="font-cirka text-4xl text-celestique-dark md:text-3xl">
            My Catalogue
          </h2>
          <p className="mt-2 text-s text-celestique-muted font-gilroy font-medium">
            See and manage all your catalogue categories from one place.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}

          {/* View All card */}
          <Link href="/dashboard/wholesaler/catalogue" className="block">
            <div className="group flex w-full h-[339px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-celestique-border bg-white hover:border-celestique-dark hover:bg-celestique-cream transition-all duration-200">
              <div className="text-center">
                <p className="text-3xl text-celestique-muted group-hover:text-celestique-dark transition-colors duration-200">
                  →
                </p>
                <p className="mt-1 text-sm font-gilroy font-medium text-celestique-muted group-hover:text-celestique-dark transition-colors duration-200">
                  View All
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
