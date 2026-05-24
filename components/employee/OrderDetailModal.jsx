"use client";

import { useEffect, useState } from "react";

function ToggleSwitch({ isOn, onToggle }) {
  return (
    <div 
      className={`w-11 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${isOn ? 'bg-green-500' : 'bg-gray-300'}`}
      onClick={onToggle}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  );
}

export function OrderDetailModal({ order, onClose }) {
  const [inStock, setInStock] = useState(true);
  const [published, setPublished] = useState(true);

  // Prevent scrolling when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  if (!order) return null;

  const p = order.products || {};
  const imgUrl = p.generated_image_urls?.[0] || p.processed_image_url || p.raw_image_url || "https://images.unsplash.com/photo-1599643478514-4a1101859efc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  const sku = order.id ? order.id.split("-")[0].toUpperCase() : "JK65-JI-1983844";
  const title = p.jewellery_type ? p.jewellery_type.charAt(0).toUpperCase() + p.jewellery_type.slice(1) : "Necklace";
  const purity = p.metal_purity || "18 KT";
  const netWeight = p.net_weight ? `${p.net_weight}g` : "9.8g";
  const grossWeight = p.gross_weight ? `${p.gross_weight}g` : "10g";
  const stoneWeight = p.stone_weight ? `${p.stone_weight}g` : "0.2g";

  // Mock recommendations
  const recommendations = [
    "https://images.unsplash.com/photo-1599643478514-4a1101859efc?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1601121141499-136debcbd924?auto=format&fit=crop&w=400&q=80",
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 md:p-12">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="bg-white w-full max-w-5xl rounded-[16px] shadow-2xl relative z-10 animate-fade-in-up max-h-[95vh] overflow-y-auto flex flex-col no-scrollbar pb-10">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row p-8 md:p-10 gap-10">
          
          {/* Left Column (Images) */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="w-full aspect-[4/3] bg-[#f9f9f9] rounded-[12px] overflow-hidden flex items-center justify-center p-4">
              <img src={imgUrl} alt={title} className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            {/* Thumbnails */}
            <div className="flex justify-between gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-1 aspect-square bg-[#f9f9f9] rounded-[8px] overflow-hidden border border-transparent hover:border-gray-200 cursor-pointer p-2">
                  <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (Details) */}
          <div className="w-full md:w-1/2 flex flex-col pt-2 relative">
            
            {/* Top Right Action Buttons */}
            <div className="absolute top-0 right-0 flex gap-2">
              <button className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-[10px] text-gray-400 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-[10px] text-gray-400 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              </button>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-[10px] text-gray-400 transition-colors ml-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Title & SKU */}
            <div className="mt-2 mb-4">
              <h2 className="text-[18px] text-gray-500 font-medium mb-1">
                SKU <span className="font-bold text-[#111827] ml-2">#{sku}</span>
              </h2>
              <p className="text-[14px] text-gray-400">{title}</p>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-5 text-[13px] text-gray-500 mb-6">
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                <span>40</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <span>5k</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <span>1.2M</span>
              </div>
            </div>

            {/* In Stock Row */}
            <div className="flex items-center gap-3 text-[13px] mb-8">
              <div className="flex items-center gap-1.5 text-green-600 font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                In stock
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-gray-400">{grossWeight}</span>
            </div>

            {/* Toggles and Specs */}
            <div className="flex flex-col gap-6">
              {/* Available in stock */}
              <div className="flex justify-between items-center pr-2">
                <span className="text-[14px] text-gray-700 font-medium">Available in stock</span>
                <ToggleSwitch isOn={inStock} onToggle={() => setInStock(!inStock)} />
              </div>

              {/* Specifications Box */}
              <div className="bg-[#f8f9fa] rounded-[16px] p-6 pr-8">
                <h3 className="text-[14px] font-medium text-gray-700 mb-4">Specifications</h3>
                <div className="flex flex-col gap-3 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Purity</span>
                    <span className="text-gray-800 font-medium">{purity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gross weight</span>
                    <span className="text-gray-800 font-medium">{grossWeight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Net weight</span>
                    <span className="text-gray-800 font-medium">{netWeight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stone weight</span>
                    <span className="text-gray-800 font-medium">{stoneWeight}</span>
                  </div>
                </div>
              </div>

              {/* Publish to Collection */}
              <div className="flex justify-between items-center pr-2">
                <span className="text-[14px] text-gray-700 font-medium">Publish to Collection</span>
                <ToggleSwitch isOn={published} onToggle={() => setPublished(!published)} />
              </div>
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-dashed border-blue-400/40 my-2"></div>

        {/* Explore new ideas Section */}
        <div className="px-8 md:px-10 pt-6">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-[24px] font-serif text-gray-700 mb-1">Explore new ideas</h3>
              <p className="text-[13px] text-gray-400">AI curated recommendations based on your style</p>
            </div>
            
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-[8px] bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
              <button className="w-8 h-8 rounded-[8px] bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map((recImg, idx) => (
              <div key={idx} className="relative aspect-[4/5] bg-gray-100 rounded-[12px] overflow-hidden group border border-gray-100">
                <img src={recImg} alt="Recommendation" className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                <button className="absolute top-3 right-3 w-7 h-7 bg-white rounded-md flex items-center justify-center text-gray-500 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
