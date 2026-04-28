"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UploadDesignPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  
  // Basic states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [material, setMaterial] = useState("");
  const [styleAesthetic, setStyleAesthetic] = useState("");
  const [size, setSize] = useState("");
  const [purity, setPurity] = useState("");
  const [grossWeight, setGrossWeight] = useState("");
  const [stoneWeight, setStoneWeight] = useState("");
  const [netWeight, setNetWeight] = useState("");
  const [inStock, setInStock] = useState(false);
  const [productionTime, setProductionTime] = useState("");
  
  // Multiple images state
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const remainingSlots = 5 - files.length;
      const filesToAdd = newFiles.slice(0, remainingSlots);
      
      if (filesToAdd.length > 0) {
        setFiles(prev => [...prev, ...filesToAdd]);
        const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
      }
    }
    // Reset input so the same file can be selected again if needed
    e.target.value = null;
  };

  const removeFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setPreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAdd = async () => {
    if (!title || !category || !material || files.length === 0) {
      alert("Please provide at least a title, category, material, and 1 image.");
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append("images", file);
      });
      
      const tags = [material, category, styleAesthetic, size, purity].filter(Boolean);
      
      const payload = {
        title,
        type: category,
        category: material,
        style_aesthetic: styleAesthetic,
        size,
        purity,
        gross_weight: grossWeight,
        stone_weight: stoneWeight,
        net_weight: netWeight,
        is_in_stock: inStock,
        production_time_days: productionTime,
        is_archived: false,
        tags
      };
      
      formData.append("payload", JSON.stringify(payload));
      
      const res = await fetch("/api/designs/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      
      router.push("/dashboard/retailer/catalogue/upload/success");
    } catch (err) {
      alert(err.message);
      setIsUploading(false);
    }
  };

  return (
    <>
      <style>{`
        aside { display: none !important; }
        main { margin-left: 0 !important; max-width: 100% !important; background: white !important; }
      `}</style>
      
      <div className="bg-white min-h-screen w-full relative pb-24 font-sans">
        <div className="absolute top-6 left-6 md:top-10 md:left-10 z-10">
          <Link 
            href="/dashboard/retailer"
            className="flex items-center gap-2 text-[14px] font-semibold text-[#4B5563] hover:text-[#111827] transition-colors"
          >
            <span>←</span> Back to dashboard
          </Link>
        </div>

        <div className="max-w-[860px] mx-auto pt-20 md:pt-28 px-4 md:px-8">
          <div className="text-center mb-16">
            <h1 className="text-[clamp(28px,4vw,32px)] font-extrabold text-[#111827] tracking-tight">Add new product</h1>
            <p className="text-[14px] text-[#6B7280] mt-2">Enter the details below to create a sparkling new listing.</p>
          </div>

          <div className="flex flex-col gap-16">
            {/* Section 1 */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[13px] font-bold shrink-0">1</div>
                  <h2 className="text-[22px] font-extrabold text-[#111827]">Product image</h2>
                </div>
                <p className="text-[14px] text-[#6B7280] mb-6 leading-relaxed">
                  Upload a clear image. We'll remove the background first, then enhance it.
                </p>
                
                <h3 className="text-[13px] font-bold text-[#111827] mb-3">Get the best result from your photo</h3>
                <ol className="text-[13px] text-[#6B7280] space-y-2 list-decimal pl-4">
                  <li className="pl-1">Place the jewellery on a background that contrasts with the product.</li>
                  <li className="pl-1">You can add multiple image with max 5*</li>
                  <li className="pl-1">Keep only the product in the frame</li>
                </ol>
              </div>
              
              <div className="w-full md:w-[320px] shrink-0">
                <div className="flex flex-wrap gap-3">
                  {previews.map((preview, idx) => (
                    <div key={idx} className="relative w-[100px] h-[100px] rounded-[12px] border border-gray-200 overflow-hidden group shrink-0">
                      <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-sm"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  ))}
                  
                  {previews.length === 0 ? (
                    <label className="flex flex-col items-center justify-center w-full aspect-[4/3] md:h-[200px] border-2 border-dashed border-[#93C5FD] bg-[#EFF6FF] rounded-[16px] cursor-pointer hover:bg-blue-50 transition-colors">
                      <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileChange} />
                      <div className="w-12 h-12 rounded-full border-2 border-[#3B82F6] flex items-center justify-center text-[#3B82F6]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </div>
                    </label>
                  ) : previews.length < 5 ? (
                    <label className="flex flex-col items-center justify-center w-[100px] h-[100px] border-2 border-dashed border-[#93C5FD] bg-[#EFF6FF] rounded-[12px] cursor-pointer hover:bg-blue-50 transition-colors shrink-0">
                      <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileChange} />
                      <div className="w-8 h-8 rounded-full border-2 border-[#3B82F6] flex items-center justify-center text-[#3B82F6]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </div>
                    </label>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[13px] font-bold shrink-0">2</div>
                <h2 className="text-[22px] font-extrabold text-[#111827]">Essential Details</h2>
              </div>
              <p className="text-[14px] text-[#6B7280] mb-8 leading-relaxed">
                Add the key information that helps retailers understand and find this piece.
              </p>
              
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#4B5563]">Product Title</label>
                  <input
                    type="text"
                    placeholder="eg. Vintage gold Necklace"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-[48px] bg-[#F9FAFB] rounded-[8px] px-4 text-[14px] text-[#111827] outline-none focus:ring-2 focus:ring-black/5"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#4B5563]">Type</label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-[48px] bg-[#F9FAFB] rounded-[8px] px-4 pr-10 text-[14px] text-[#111827] outline-none focus:ring-2 focus:ring-black/5 appearance-none"
                      >
                        <option value="" disabled hidden>select</option>
                        <option value="Necklace">Necklace</option>
                        <option value="Earrings">Earrings</option>
                        <option value="Ring">Ring</option>
                        <option value="Bracelet">Bracelet</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#4B5563]">Material category</label>
                    <div className="relative">
                      <select
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        className="w-full h-[48px] bg-[#F9FAFB] rounded-[8px] px-4 pr-10 text-[14px] text-[#111827] outline-none focus:ring-2 focus:ring-black/5 appearance-none"
                      >
                        <option value="" disabled hidden>select</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Diamond">Diamond</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#4B5563]">Style Aesthetic</label>
                    <div className="relative">
                      <select
                        value={styleAesthetic}
                        onChange={(e) => setStyleAesthetic(e.target.value)}
                        className="w-full h-[48px] bg-[#F9FAFB] rounded-[8px] px-4 pr-10 text-[14px] text-[#111827] outline-none focus:ring-2 focus:ring-black/5 appearance-none"
                      >
                        <option value="" disabled hidden>select</option>
                        <option value="Vintage">Vintage</option>
                        <option value="Modern">Modern</option>
                        <option value="Classic">Classic</option>
                        <option value="Minimal">Minimal</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#4B5563]">Size</label>
                    <div className="relative">
                      <select
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full h-[48px] bg-[#F9FAFB] rounded-[8px] px-4 pr-10 text-[14px] text-[#111827] outline-none focus:ring-2 focus:ring-black/5 appearance-none"
                      >
                        <option value="" disabled hidden>select</option>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                        <option value="Adjustable">Adjustable</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#4B5563]">Purity</label>
                    <div className="relative">
                      <select
                        value={purity}
                        onChange={(e) => setPurity(e.target.value)}
                        className="w-full h-[48px] bg-[#F9FAFB] rounded-[8px] px-4 pr-10 text-[14px] text-[#111827] outline-none focus:ring-2 focus:ring-black/5 appearance-none"
                      >
                        <option value="" disabled hidden>select</option>
                        <option value="18K">18K</option>
                        <option value="22K">22K</option>
                        <option value="24K">24K</option>
                        <option value="925 Sterling">925 Sterling</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[13px] font-bold shrink-0">3</div>
                <h2 className="text-[22px] font-extrabold text-[#111827]">Specifications</h2>
              </div>
              <p className="text-[14px] text-[#6B7280] mb-8 leading-relaxed">
                Add weight and stone details so retailers know exactly what they're getting.
              </p>

              <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#4B5563]">Gross weight</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.0"
                        value={grossWeight}
                        onChange={(e) => setGrossWeight(e.target.value)}
                        className="w-full h-[48px] bg-[#F9FAFB] rounded-[8px] pl-4 pr-8 text-[14px] text-[#111827] outline-none focus:ring-2 focus:ring-black/5"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[#9CA3AF] font-bold pointer-events-none">g</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#4B5563]">Stone weight</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.0"
                        value={stoneWeight}
                        onChange={(e) => setStoneWeight(e.target.value)}
                        className="w-full h-[48px] bg-[#F9FAFB] rounded-[8px] pl-4 pr-8 text-[14px] text-[#111827] outline-none focus:ring-2 focus:ring-black/5"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[#9CA3AF] font-bold pointer-events-none">g</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-[#4B5563]">Net Weight</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.0"
                        value={netWeight}
                        onChange={(e) => setNetWeight(e.target.value)}
                        className="w-full h-[48px] bg-[#F9FAFB] rounded-[8px] pl-4 pr-8 text-[14px] text-[#111827] outline-none focus:ring-2 focus:ring-black/5"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[#9CA3AF] font-bold pointer-events-none">g</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-bold text-[#111827]">Available in Stock</span>
                    <span className="text-[12px] text-[#6B7280]">Is this piece ready to ship right away?</span>
                  </div>
                  <div 
                    onClick={() => setInStock(!inStock)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${inStock ? "bg-[#34D399]" : "bg-gray-200"}`}
                  >
                    <div 
                      className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${inStock ? "translate-x-6" : "translate-x-0"}`} 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 w-full md:w-[320px]">
                  <label className="text-[13px] font-bold text-[#4B5563]">Production time</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="eg. 14"
                      value={productionTime}
                      onChange={(e) => setProductionTime(e.target.value)}
                      className="w-full h-[48px] bg-[#F9FAFB] rounded-[8px] pl-4 pr-12 text-[14px] text-[#111827] outline-none focus:ring-2 focus:ring-black/5"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-[#9CA3AF] pointer-events-none">days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions & Footer */}
            <div className="flex flex-col gap-16 mt-8">
              <div className="flex justify-end pt-8 border-t border-gray-100">
                <button
                  onClick={handleAdd}
                  disabled={isUploading}
                  className="bg-black text-white rounded-[10px] h-[48px] px-10 text-[16px] font-bold hover:bg-gray-800 transition-colors shadow-[0_4px_14px_rgba(0,0,0,0.15)] disabled:opacity-70 flex items-center gap-2"
                >
                  {isUploading ? "UPLOADING..." : "ADD"}
                </button>
              </div>

              <div className="flex items-center justify-between text-[12px] text-[#9CA3AF] pt-4">
                <span>All Rights Reserved © Jewels India</span>
                <span className="flex items-center gap-1">Crafted with <span className="text-pink-400">❤️</span> in blr</span>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}
