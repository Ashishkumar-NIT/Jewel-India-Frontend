"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductInfoModal } from "./ProductInfoModal";

const VERTICAL_IMAGES = [
  "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778318369/emp_static1_ywv9ro.svg",
  "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778318368/emp_static2_vijtdd.svg",
  "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778318368/emp_static3_xdapmt.svg",
  "https://res.cloudinary.com/dcs0vuzwg/image/upload/v1778318368/emp_static4_q0ysjt.svg"
];

export default function DesignerCollectionSection({ employee, businessName, designs }) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Use the randomly assigned image from the server, or fallback to the first one
  const verticalImage = employee?.assigned_bg_image || VERTICAL_IMAGES[0];

  // The designs are now pre-shuffled and sliced on the server to avoid hydration errors
  const shuffledDesigns = designs || [];

  if (!shuffledDesigns || shuffledDesigns.length === 0) return null;

  return (
    <section className="w-full bg-white pt-16 pb-40">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="font-serif text-[28px] text-[#111827] leading-tight mb-2">
            Designer collection
          </h2>
          <p className="text-[12px] text-gray-400 font-light">
            Crafted in house with the taste of the our own
          </p>
        </div>

      {/* Main Layout: left grid + right dynamic tall image */}
      <div className="flex flex-col md:flex-row gap-8 items-stretch">

        {/* LEFT: 2-column grid — only actual designs */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12 md:gap-y-16">
          {shuffledDesigns.map((design) => (
            <div 
              key={design.id} 
              className="flex flex-col cursor-pointer group/card"
              onClick={() => setSelectedProduct(design)}
            >
              {/* Image Container */}
              <div className="w-full bg-[#f8f8f8] p-0 flex items-center justify-center overflow-hidden" style={{ aspectRatio: "5/4" }}>
                <img
                  src={design.image_url}
                  alt={design.title || "Untitled design"}
                  className="w-full h-full object-contain mix-blend-multiply shadow-sm transition-transform group-hover/card:scale-105 duration-700"
                />
              </div>
              {/* Label */}
              <span className="text-[13px] font-serif text-gray-700 text-center mt-4 tracking-wide line-clamp-1 px-2">
                {design.title || "Untitled design"}
              </span>
            </div>
          ))}
        </div>

        {/* RIGHT: Super tall vertical image — hidden on mobile */}
        <div
          className="hidden md:block shrink-0 overflow-hidden relative shadow-2xl"
          style={{ width: "28%" }}
        >
          <img
            src={verticalImage}
            alt="Featured collection"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Subtle overlay to enhance premium feel */}
          <div className="absolute inset-0 bg-black/5" />
        </div>

      </div>

      {/* View All */}
      <div className="flex justify-center mt-12">
        <button
          onClick={() => router.push('/dashboard/employee/designs')}
          className="text-[11px] tracking-[0.25em] text-gray-500 underline underline-offset-8 decoration-gray-300 hover:text-black hover:decoration-black transition-all uppercase font-semibold"
        >
          view all
        </button>
      </div>

      {/* Product Detail Modal */}
      <ProductInfoModal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        product={selectedProduct} 
      />
      </div>
    </section>
  );
}
