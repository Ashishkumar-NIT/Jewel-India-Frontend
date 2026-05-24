"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SelectionReviewClient() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({});
  const [viewingProduct, setViewingProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [individualFormData, setIndividualFormData] = useState({ quantity: 1, customization_notes: "" });

  const handleViewProduct = (product) => {
    setViewingProduct(product);
    if (product) {
      const defaultImg = product.generated_image_urls?.[0] || product.processed_image_url || product.raw_image_url;
      setActiveImage(defaultImg);
    } else {
      setActiveImage(null);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const stored = sessionStorage.getItem('employee_selected_products');
      if (!stored) {
        setIsLoading(false);
        return;
      }
      
      try {
        const ids = JSON.parse(stored);
        if (ids.length === 0) {
          setIsLoading(false);
          return;
        }

        const res = await fetch('/api/products/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids })
        });
        
        const json = await res.json();
        if (json.data) {
          setProducts(json.data);
          // Init form data
          const initialForm = {};
          json.data.forEach(p => {
            initialForm[p.id] = { quantity: 1, customization_notes: "" };
          });
          setFormData(initialForm);
        }
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleUpdateField = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleRemove = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setFormData(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    
    // update session storage
    const stored = JSON.parse(sessionStorage.getItem('employee_selected_products') || "[]");
    sessionStorage.setItem('employee_selected_products', JSON.stringify(stored.filter(x => x !== id)));
  };

  const handleSubmit = async () => {
    if (products.length === 0) return;
    setIsSubmitting(true);

    const items = products.map(p => ({
      product_id: p.id,
      wholesaler_id: p.wholesaler_id,
      quantity: 1,
      customization_notes: ""
    }));

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit request");

      // Success
      sessionStorage.removeItem('employee_selected_products');
      setSuccess(true);
      
      // Auto redirect after a few seconds
      setTimeout(() => {
        router.push('/dashboard/employee');
      }, 4000);

    } catch (err) {
      alert(err.message);
      setIsSubmitting(false);
    }
  };

  const handleIndividualSubmit = async (product) => {
    setIsSubmitting(true);
    const items = [{
      product_id: product.id,
      wholesaler_id: product.wholesaler_id,
      quantity: individualFormData.quantity,
      customization_notes: individualFormData.customization_notes
    }];

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit request");

      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        setIsSidebarOpen(false);
        handleViewProduct(null);
        handleRemove(product.id);
      }, 2000);

    } catch (err) {
      alert(err.message);
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex-1 w-full min-h-[80vh] flex flex-col items-center justify-center bg-white px-4 animate-fade-in-up">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1 className="text-[32px] font-extrabold text-[#111827] mb-2 tracking-tight text-center">
          Request Sent Successfully!
        </h1>
        <p className="text-[#6B7280] text-[15px] mb-8 text-center max-w-md">
          Your production requests have been forwarded to the respective wholesalers. You can track them in your Orders tab.
        </p>
        <Link 
          href="/dashboard/employee"
          className="bg-black text-white px-8 py-3 rounded-[10px] font-bold text-[14px] hover:bg-gray-800 transition-colors shadow-lg"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-12 py-8 relative max-w-[1400px] mx-auto">
        <button 
          onClick={() => {
            if (viewingProduct) handleViewProduct(null);
            else router.back();
          }}
          className="w-12 h-12 rounded-full bg-gradient-to-b from-gray-50 to-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-colors shadow-sm border border-gray-300 absolute left-6 md:left-12 z-10"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        
        <h1 className="text-[38px] font-serif tracking-wide text-[#1A1A1A] w-full text-center">
          Selected Items
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-32">
          <p className="text-gray-500 font-serif text-[18px]">No products selected.</p>
          <button onClick={() => router.back()} className="text-blue-600 text-[14px] font-sans mt-4 underline underline-offset-4">
            Return to selection
          </button>
        </div>
      ) : viewingProduct ? (
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 pb-32 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] gap-16 items-start">
             
             {/* Left: Images */}
             {(() => {
               let allImages = Array.from(new Set([
                 ...(viewingProduct.generated_image_urls || []),
                 viewingProduct.processed_image_url
               ].filter(Boolean)));

               if (allImages.length === 0 && viewingProduct.raw_image_url) {
                 allImages.push(viewingProduct.raw_image_url);
               }

               allImages = allImages.slice(0, 4);

               const thumbnailSlots = Array.from({ length: 4 }).map((_, idx) => allImages[idx] || null);

               return (
                 <div className="flex flex-col gap-4">
                    <div className="w-full aspect-[4/4.5] bg-[#343e4b] flex items-center justify-center overflow-hidden">
                      <img src={activeImage} className="w-full h-full object-cover" />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                       {thumbnailSlots.map((imgSrc, idx) => {
                         if (imgSrc) {
                           const isActive = imgSrc === activeImage;
                           return (
                             <button
                               key={idx}
                               onClick={() => setActiveImage(imgSrc)}
                               className={`aspect-square bg-white overflow-hidden transition-all relative rounded-sm ${
                                 isActive ? "border-2 border-transparent opacity-40" : "border-2 border-black ring-1 ring-black scale-[0.98] opacity-100"
                               }`}
                             >
                               <img src={imgSrc} className="w-full h-full object-cover" />
                             </button>
                           );
                         }
                         return (
                           <div key={idx} className="aspect-square bg-gray-50 opacity-40 border border-dashed border-gray-200 rounded-sm"></div>
                         );
                       })}
                    </div>
                 </div>
               );
             })()}

             {/* Right: Details */}
             <div className="flex flex-col pt-2">
                <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-6">HOME / DESIGN / NECKLACE / INFO</div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-bold tracking-widest text-black uppercase border border-gray-200 px-2 py-1 rounded-sm">NECKLACE</span>
                  <span className="text-[10px] text-gray-400 tracking-widest uppercase border border-gray-200 px-2 py-1 rounded-sm">Traditional</span>
                </div>

                <h1 className="text-[44px] font-serif leading-[1.15] text-gray-900 mb-10">
                  {viewingProduct.title || "Vintage Cuff half necklace"}
                </h1>

                {/* Details list */}
                <div className="flex flex-col gap-6 text-[14px]">
                   <div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 border-dashed pb-1.5">MATERIAL</div>
                      <div className="flex justify-between font-serif text-gray-800 px-1">
                         <span>Gold</span>
                         <span>{viewingProduct.metal_purity || "22k"}</span>
                      </div>
                   </div>

                   <div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 border-dashed pb-1.5">WEIGHT</div>
                      <div className="flex justify-between font-serif text-gray-800 px-1 mb-2">
                         <span className="text-gray-500">Net weight</span>
                         <span>{viewingProduct.net_weight || "24"}g</span>
                      </div>
                      <div className="flex justify-between font-serif text-gray-800 px-1 mb-2">
                         <span className="text-gray-500">Gross weight</span>
                         <span>{viewingProduct.gross_weight || "20"}g</span>
                      </div>
                      <div className="flex justify-between font-serif text-gray-800 px-1">
                         <span className="text-gray-500">Stone weight</span>
                         <span>{viewingProduct.stone_weight || "4"}g</span>
                      </div>
                   </div>

                   <div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 border-dashed pb-1.5">AVAILABILITY</div>
                      <div className="flex justify-between font-serif text-gray-800 px-1">
                         <span>Made to order</span>
                         <span>{viewingProduct.make_to_order_days || "12 to 14"} days</span>
                      </div>
                   </div>
                </div>

                <div className="mt-12 flex flex-col items-center">
                   <button 
                     onClick={() => setIsSidebarOpen(true)}
                     className="w-full bg-gradient-to-b from-[#222] to-[#000] text-white font-sans font-semibold tracking-widest text-[13px] py-4 shadow-lg hover:shadow-xl transition-all border border-black uppercase"
                     style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.15)" }}
                   >
                     Request Item
                   </button>
                   <Link href={`/dashboard/employee/messages?productId=${viewingProduct.id}`} className="mt-5 text-[12px] text-gray-500 hover:text-black font-semibold underline underline-offset-4 decoration-gray-300">
                     Chat with us
                   </Link>
                </div>
             </div>
          </div>

          {/* More you might like */}
          <div className="mt-32 pt-16 border-t border-gray-100">
             <h2 className="text-[32px] font-serif text-gray-800 mb-10">More, you might like from us</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-12">
                {products.filter(p => p.id !== viewingProduct.id).slice(0, 6).map(product => {
                  const imgUrl = product.generated_image_urls?.[0] || product.processed_image_url || product.raw_image_url;
                  return (
                    <div key={product.id} className="flex flex-col cursor-pointer hover:opacity-90 transition-opacity" onClick={() => handleViewProduct(product)}>
                      <div className="w-full aspect-[4/3.5] bg-[#F5F6F8] flex items-center justify-center p-8 overflow-hidden">
                         {imgUrl ? (
                           <img src={imgUrl} className="w-full h-full object-contain mix-blend-multiply" />
                         ) : (
                           <span className="text-gray-400 font-serif text-sm">No Image</span>
                         )}
                      </div>
                      <div className="bg-[#FAFAFA] py-5 text-center border-t border-white">
                         <span className="font-serif text-[16px] text-gray-800 tracking-wide">
                           {product.title || product.jewellery_type || "Jewellery"}
                         </span>
                      </div>
                    </div>
                  )
                })}
             </div>
          </div>

          {/* Sidebar Overlay */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-50 flex justify-end">
               <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setIsSidebarOpen(false)}></div>
               <div className="relative w-full max-w-[420px] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                  
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-[14px] font-sans text-gray-800">Request this Design</h3>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-black">✕</button>
                  </div>

                  <div className="p-8 flex-1 overflow-y-auto flex flex-col gap-10">
                     
                     {/* Product Snippet */}
                     <div className="flex gap-6">
                        <div className="flex-1">
                           <div className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">PRODUCT</div>
                           <div className="flex gap-2 mb-3">
                             <span className="text-[9px] uppercase border border-gray-200 px-2 py-0.5 text-gray-500 rounded-sm">Necklace</span>
                             <span className="text-[9px] uppercase text-gray-400 py-0.5">Traditional</span>
                           </div>
                           <h4 className="font-serif text-[20px] text-gray-900 leading-[1.2]">{viewingProduct.title || "Vintage Cuff half necklace"}</h4>
                        </div>
                        <div className="w-24 h-24 bg-[#343e4b] shrink-0 overflow-hidden">
                           <img src={activeImage} className="w-full h-full object-cover" />
                        </div>
                     </div>

                     {/* Quantity */}
                     <div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">QUANTITY</div>
                        <div className="flex items-center gap-5">
                           <button onClick={() => setIndividualFormData(p => ({...p, quantity: Math.max(1, p.quantity-1)}))} className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-lg transition-colors">-</button>
                           <span className="font-serif text-[20px] text-gray-800 w-4 text-center">{individualFormData.quantity}</span>
                           <button onClick={() => setIndividualFormData(p => ({...p, quantity: p.quantity+1}))} className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-lg transition-colors">+</button>
                        </div>
                     </div>

                     {/* Customization */}
                     <div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">CUSTOMIZATION NEEDS</div>
                        <textarea 
                          value={individualFormData.customization_notes}
                          onChange={e => setIndividualFormData(p => ({...p, customization_notes: e.target.value}))}
                          className="w-full h-32 bg-gray-50 border border-gray-100 rounded-[4px] p-5 text-[14px] text-gray-700 outline-none focus:ring-1 focus:ring-black/20 resize-none transition-shadow"
                          placeholder="Describe your customization requirements..."
                        ></textarea>
                     </div>
                  </div>

                  <div className="p-8 pt-4">
                     <button 
                       onClick={() => handleIndividualSubmit(viewingProduct)}
                       disabled={isSubmitting}
                       className="w-full bg-gradient-to-b from-[#2a2a2a] to-[#000] text-white text-[12px] uppercase tracking-[0.15em] font-bold py-5 hover:bg-black transition-all shadow-xl disabled:opacity-70"
                     >
                       {isSubmitting ? "SENDING..." : "SEND REQUEST"}
                     </button>
                  </div>

               </div>
            </div>
          )}

        </div>
      ) : (
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 pb-32 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {products.map(product => {
              const imgUrl = product.generated_image_urls?.[0] || product.processed_image_url || product.raw_image_url;
              return (
                <div key={product.id} className="flex flex-col relative group cursor-pointer hover:opacity-95 transition-opacity" onClick={() => handleViewProduct(product)}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRemove(product.id); }}
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                  >
                    ✕
                  </button>
                  <div className="w-full aspect-[4/3.5] bg-[#F5F6F8] flex items-center justify-center p-8 overflow-hidden">
                     {imgUrl ? (
                       <img src={imgUrl} alt={product.title} className="w-full h-full object-contain mix-blend-multiply pointer-events-none" />
                     ) : (
                       <span className="text-gray-400 font-serif text-sm">No Image</span>
                     )}
                  </div>
                  <div className="bg-[#FAFAFA] py-5 text-center border-t border-white">
                     <span className="font-serif text-[16px] text-gray-800 tracking-wide">
                       {product.title || product.jewellery_type || "Jewellery"}
                     </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-20 flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-black text-white px-16 py-5 text-[14px] uppercase tracking-[0.2em] font-semibold hover:bg-gray-800 transition-all shadow-xl disabled:opacity-70 flex items-center gap-4"
            >
              {isSubmitting ? "Sending Request..." : "Confirm Request"}
              {!isSubmitting && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
