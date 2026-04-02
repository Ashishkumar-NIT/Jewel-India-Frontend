"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function CategoryCard({ category }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/dashboard/wholesaler/catalogue?category=${category.slug}`} className="block">
      <div className="group relative w-[280px] h-[339px] cursor-pointer overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Image or gradient fallback */}
        {!imgError ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="280px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`h-full w-full bg-linear-to-br ${category.gradient ?? "from-amber-100 to-yellow-200"} transition-transform duration-500 group-hover:scale-105`}
          />
        )}

        {/* Category name */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-celestique-dark/30 to-transparent pointer-events-none" />
        <div className="absolute top-6 left-4 right-4">
          <p className="font-serif font-medium text-xl text-white tracking-wide text-center w-full">
            {category.name}
          </p>
        </div>
      </div>
    </Link>
  );
}
