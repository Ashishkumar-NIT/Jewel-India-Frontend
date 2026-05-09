"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductInfoModal } from "./ProductInfoModal";

const VERTICAL_IMAGES = [
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1599643478514-4a1101859efc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

export default function DesignerCollectionSection({ employee, businessName, designs }) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const templateIndex = useMemo(() => {
    if (!employee?.id) return 0;
    const sum = employee.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return sum % 4;
  }, [employee?.id]);

  const verticalImage = VERTICAL_IMAGES[templateIndex];

  const shuffledDesigns = useMemo(() => {
    const arr = [...(designs || [])];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 6);
  }, [designs]);

  if (!shuffledDesigns || shuffledDesigns.length === 0) return null;

  return (
    <section className="w-full px-4 pt-16 pb-40 bg-white">

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
      <div className="flex gap-8 items-stretch">

        {/* LEFT: 2-column grid — only actual designs */}
        <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-20">
          {shuffledDesigns.map((design) => (
            <div 
              key={design.id} 
              className="flex flex-col cursor-pointer group/card"
              onClick={() => setSelectedProduct(design)}
            >
              {/* Image Container with whitespace padding */}
              <div className="w-full bg-[#f8f8f8] p-8 flex items-center justify-center overflow-hidden" style={{ aspectRatio: "5/4" }}>
                <img
                  src={design.image_url}
                  alt={design.title || businessName}
                  className="w-full h-full object-cover shadow-sm transition-transform group-hover/card:scale-105 duration-700"
                />
              </div>
              {/* Label */}
              <span className="text-[12px] font-serif text-gray-500 text-center mt-4 italic tracking-wide">
                {businessName}
              </span>
            </div>
          ))}
        </div>

        {/* RIGHT: Super tall vertical image — doubled height, reduced width */}
        <div
          className="shrink-0 overflow-hidden relative shadow-2xl"
          style={{ width: "22%" }}
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

    </section>
  );
}
