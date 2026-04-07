"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Product Detail Modal ──────────────────────────────────────────────────────
function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  const images = Array.from(new Set([
    product.processed_image_url,
    product.image_url,
    product.raw_image_url,
    ...(product.generated_image_urls || []),
  ].filter(Boolean)));

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [isPublished, setIsPublished] = useState(product.is_published ?? true);
  const [isInStock, setIsInStock] = useState(product.stock_available ?? false);

  // Editable wholesale fields
  const [editFields, setEditFields] = useState({
    price: product.wholesale_price || product.price || "",
    moq: product.moq || "",
    availableQty: product.available_qty || "",
    bulkDiscount: product.bulk_discount || "",
    restockDate: product.restock_date || "",
  });
  const [savedFields, setSavedFields] = useState({ ...editFields });

  const title = product.title || (product.jewellery_type ? product.jewellery_type.charAt(0).toUpperCase() + product.jewellery_type.slice(1) : "Jewelry Piece");
  
  // Data fallbacks/parsing
  const sku = product.sku || `JWL-${(product.id || "0000").slice(-6).toUpperCase()}`;
  const studioName = product.studio_name || "Jewel India";
  const artisanName = product.crafted_by || product.studio_name || "Unknown Artisan";
  const purity = product.purity || "24K";
  const addedOnStr = product.created_at ? new Date(product.created_at).toLocaleDateString("en-GB", {day: "numeric", month: "long", year: "numeric"}) : "7 April 2026";
  const moq = savedFields.moq ? `${savedFields.moq} pcs` : "5 pcs";
  const price = savedFields.price ? `₹${savedFields.price}` : "₹4,200";
  const availableQty = savedFields.availableQty ? `${savedFields.availableQty} pcs` : "42 pcs";
  const bulkDiscount = savedFields.bulkDiscount || "10+ = 5% off";
  const restockDateStr = savedFields.restockDate ? new Date(savedFields.restockDate).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"}) : "Unknown";

  const handlePublishToggle = () => setIsPublished(!isPublished);
  const handleStockToggle = () => setIsInStock(!isInStock);
  const handleEditInfo = () => setIsEditing(true);
  const handleEditCancel = () => {
    setEditFields({ ...savedFields });
    setIsEditing(false);
  };
  const handleEditSave = () => {
    setSavedFields({ ...editFields });
    setIsEditing(false);
  };
  const handleEditChange = (field, value) => {
    setEditFields(prev => ({ ...prev, [field]: value }));
  };
  const handleRemoveClick = () => setShowRemoveConfirm(true);
  const confirmRemove = () => {
      console.log("Product removed");
      onClose();
  };
  const cancelRemove = () => setShowRemoveConfirm(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.6)] p-4" onClick={onClose}>
      <div 
        className="relative bg-white rounded-[16px] w-full max-w-[850px] p-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.15)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row gap-[32px]">
          {/* Left Column */}
          <div className="w-full md:w-[40%] flex flex-col gap-[16px] shrink-0">
            <div className="relative w-full h-[400px] bg-[#f9f9f9] rounded-[12px] overflow-hidden border border-[#eee]">
              {/* Badges */}
              <div className="absolute top-[12px] left-[12px] z-10 flex gap-2">
                <span className={`px-2.5 py-1 rounded-[6px] text-[12px] font-medium leading-none ${isInStock ? 'bg-[#e6f4ea] text-[#1e8e3e]' : 'bg-[#fce8e6] text-[#c5221f]'}`}>
                  {isInStock ? 'In stock' : 'Out of stock'}
                </span>
                <span className={`px-2.5 py-1 rounded-[6px] text-[12px] font-medium leading-none ${isPublished ? 'bg-[#e8f0fe] text-[#1967d2]' : 'bg-[#f1f3f4] text-[#5f6368]'}`}>
                  {isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              
              {images[activeImageIndex] ? (
                <img 
                  src={images[activeImageIndex]} 
                  alt={title} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#999]">
                  No Image
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex flex-wrap gap-[8px]">
                {images.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx}`}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`shrink-0 w-[60px] h-[60px] object-cover rounded-[8px] cursor-pointer box-border transition-colors ${activeImageIndex === idx ? 'border-[2px] border-[#111]' : 'border-[2px] border-transparent'}`}
                  />
                ))}
              </div>
            )}
            
            <div className="text-[13px] text-[#666] mt-2 font-medium">
              SKU: {sku}
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full md:w-[60%] flex flex-col flex-1 shrink-0">
            <div className="flex justify-between items-start mb-[8px]">
              <span className="text-[13px] text-[#666] font-medium">/ {studioName}</span>
              <button 
                onClick={onClose}
                className="text-[#999] hover:text-[#111] text-[24px] bg-transparent border-none cursor-pointer leading-none transition-colors"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            
            <h2 className="text-[28px] font-bold text-[#111] m-0 mb-[24px] leading-tight">{title}</h2>

            {/* SPECIFICATIONS */}
            <div className="mb-[24px]">
              <h3 className="text-[12px] font-bold text-[#999] uppercase tracking-wider mb-[12px]">Specifications</h3>
              <div className="flex flex-col border-t border-[#eee]">
                {(product.design_style || product.style) && (
                  <div className="flex justify-between items-center py-[10px] border-b border-[#eee] text-[14px]">
                    <span className="text-[#666]">Style</span>
                    <span className="text-[#111] font-medium">{product.design_style || product.style}</span>
                  </div>
                )}
                {product.size && (
                  <div className="flex justify-between items-center py-[10px] border-b border-[#eee] text-[14px]">
                    <span className="text-[#666]">Size</span>
                    <span className="text-[#111] font-medium">{product.size}</span>
                  </div>
                )}
                {purity && (
                  <div className="flex justify-between items-center py-[10px] border-b border-[#eee] text-[14px]">
                    <span className="text-[#666]">Metal purity</span>
                    <span className="text-[#111] font-medium">{purity}</span>
                  </div>
                )}
                {product.gross_weight && (
                  <div className="flex justify-between items-center py-[10px] border-b border-[#eee] text-[14px]">
                    <span className="text-[#666]">Gross weight</span>
                    <span className="text-[#111] font-medium">{product.gross_weight}g</span>
                  </div>
                )}
                {product.stone_weight && (
                  <div className="flex justify-between items-center py-[10px] border-b border-[#eee] text-[14px]">
                    <span className="text-[#666]">Stone weight</span>
                    <span className="text-[#111] font-medium">{product.stone_weight}g</span>
                  </div>
                )}
                {product.net_weight && (
                  <div className="flex justify-between items-center py-[10px] border-b border-[#eee] text-[14px]">
                    <span className="text-[#666]">Net weight</span>
                    <span className="text-[#111] font-medium">{product.net_weight}g</span>
                  </div>
                )}
              </div>
            </div>

            {/* WHOLESALE INFO */}
            <div className="mb-[24px]">
              <div className="flex items-center justify-between mb-[12px]">
                <h3 className="text-[12px] font-bold text-[#999] uppercase tracking-wider">Wholesale Info</h3>
                {isEditing && (
                  <span className="text-[11px] text-[#1967d2] bg-[#e8f0fe] px-2 py-0.5 rounded-full font-medium">Editing</span>
                )}
              </div>

              {isEditing ? (
                /* ── Edit Form ── */
                <div className="flex flex-col gap-[14px]">
                  <div className="grid grid-cols-2 gap-[12px]">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] text-[#666] font-medium">Price / piece (₹)</label>
                      <input
                        type="number"
                        value={editFields.price}
                        onChange={e => handleEditChange('price', e.target.value)}
                        placeholder="e.g. 4200"
                        className="border border-[#ddd] focus:border-[#111] outline-none rounded-[8px] px-3 py-2 text-[14px] text-[#111] bg-white transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] text-[#666] font-medium">MOQ (pcs)</label>
                      <input
                        type="number"
                        value={editFields.moq}
                        onChange={e => handleEditChange('moq', e.target.value)}
                        placeholder="e.g. 5"
                        className="border border-[#ddd] focus:border-[#111] outline-none rounded-[8px] px-3 py-2 text-[14px] text-[#111] bg-white transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] text-[#666] font-medium">Available qty (pcs)</label>
                      <input
                        type="number"
                        value={editFields.availableQty}
                        onChange={e => handleEditChange('availableQty', e.target.value)}
                        placeholder="e.g. 42"
                        className="border border-[#ddd] focus:border-[#111] outline-none rounded-[8px] px-3 py-2 text-[14px] text-[#111] bg-white transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] text-[#666] font-medium">Bulk discount</label>
                      <input
                        type="text"
                        value={editFields.bulkDiscount}
                        onChange={e => handleEditChange('bulkDiscount', e.target.value)}
                        placeholder="e.g. 10+ = 5% off"
                        className="border border-[#ddd] focus:border-[#111] outline-none rounded-[8px] px-3 py-2 text-[14px] text-[#111] bg-white transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[#666] font-medium">Restock date <span className="text-[#999] font-normal">(shown when out of stock)</span></label>
                    <input
                      type="date"
                      value={editFields.restockDate}
                      onChange={e => handleEditChange('restockDate', e.target.value)}
                      className="border border-[#ddd] focus:border-[#111] outline-none rounded-[8px] px-3 py-2 text-[14px] text-[#111] bg-white transition-colors w-full"
                    />
                  </div>
                  <div className="flex gap-[10px] pt-1">
                    <button
                      onClick={handleEditSave}
                      className="flex-1 bg-[#111] hover:bg-[#333] text-white font-medium py-[10px] px-[16px] rounded-[8px] transition-colors text-[14px]"
                    >
                      Save changes
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="flex-1 bg-white hover:bg-[#f9f9f9] border border-[#ccc] text-[#111] font-medium py-[10px] px-[16px] rounded-[8px] transition-colors text-[14px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Display Grid ── */
                <div className="grid grid-cols-2 gap-[12px]">
                  <div className="bg-[#f9f9f9] border border-[#eee] rounded-[8px] p-[12px] flex flex-col gap-1">
                    <span className="text-[12px] text-[#666]">Price / piece</span>
                    <span className="text-[16px] font-semibold text-[#111]">{price}</span>
                  </div>
                  <div className="bg-[#f9f9f9] border border-[#eee] rounded-[8px] p-[12px] flex flex-col gap-1">
                    <span className="text-[12px] text-[#666]">MOQ</span>
                    <span className="text-[16px] font-semibold text-[#111]">{moq}</span>
                  </div>
                  <div className="bg-[#f9f9f9] border border-[#eee] rounded-[8px] p-[12px] flex flex-col gap-1">
                    <span className="text-[12px] text-[#666]">Available qty</span>
                    <span className="text-[16px] font-semibold text-[#111]">{availableQty}</span>
                  </div>
                  <div className="bg-[#f9f9f9] border border-[#eee] rounded-[8px] p-[12px] flex flex-col gap-1">
                    <span className="text-[12px] text-[#666]">Bulk discount</span>
                    <span className="text-[16px] font-semibold text-[#111]">{bulkDiscount}</span>
                  </div>
                  {!isInStock && (
                    <div className="bg-[#fcf4f4] border border-[#facdcd] rounded-[8px] p-[12px] flex flex-col gap-1 col-span-2">
                      <span className="text-[12px] text-[#d93025]">Restock date</span>
                      <span className="text-[16px] font-semibold text-[#c5221f]">{restockDateStr}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Meta Row */}
            <div className="flex justify-between items-center text-[13px] mb-[24px] bg-[#f9f9f9] border border-[#eee] rounded-[8px] p-3">
              <div className="flex flex-col gap-1">
                <span className="text-[#666]">Crafted by</span>
                <span className="text-[#111] font-medium">{artisanName}</span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span className="text-[#666]">Added on</span>
                <span className="text-[#111] font-medium">{addedOnStr}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-auto flex flex-col gap-[12px]">
              <div className="flex gap-[12px]">
                <button 
                  onClick={handlePublishToggle}
                  className="flex-1 bg-[#111] hover:bg-[#333] text-white font-medium py-[12px] px-[16px] rounded-[8px] transition-colors"
                >
                  {isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button 
                  onClick={handleEditInfo}
                  disabled={isEditing}
                  className="flex-1 bg-white hover:bg-[#f9f9f9] border border-[#ccc] text-[#111] font-medium py-[12px] px-[16px] rounded-[8px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Edit info
                </button>
              </div>
              <div className="flex gap-[12px]">
                <button 
                  onClick={handleStockToggle}
                  className="flex-1 bg-white hover:bg-[#f9f9f9] border border-[#ccc] text-[#111] font-medium py-[12px] px-[16px] rounded-[8px] transition-colors"
                >
                  {isInStock ? 'Mark out of stock' : 'Mark in stock'}
                </button>
                <button 
                  onClick={handleRemoveClick}
                  className="flex-1 bg-white hover:bg-[#fcf4f4] border border-[#ff4d4f] text-[#ff4d4f] font-medium py-[12px] px-[16px] rounded-[8px] transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal Overlay */}
        {showRemoveConfirm && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-[2px] flex items-center justify-center rounded-[16px] p-6">
            <div className="bg-white border border-[#eee] shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-xl p-6 max-w-[400px] w-full text-center">
              <h3 className="text-[20px] font-bold text-[#111] mb-2">Remove Product</h3>
              <p className="text-[14px] text-[#666] mb-6">
                Are you sure you want to remove this product from your catalogue? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={cancelRemove}
                  className="px-6 py-2.5 bg-white border border-[#ccc] hover:bg-[#f9f9f9] rounded-lg text-[#111] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRemove}
                  className="px-6 py-2.5 bg-[#ff4d4f] hover:bg-[#ff7875] text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
export function CatalogueCardSkeleton() {
  return (
    <div className="flex flex-col bg-white border border-[#eee] rounded-xl overflow-hidden min-h-[300px]">
      <div className="catalogue-skeleton-bg w-full aspect-square relative" />
      <div className="p-3 space-y-3">
        <div className="catalogue-skeleton-bg h-4 rounded" style={{ width: "80%" }} />
        <div className="catalogue-skeleton-bg h-3 rounded" style={{ width: "50%" }} />
        <div className="flex justify-between items-center pt-2">
          <div className="catalogue-skeleton-bg h-5 w-16 rounded-full" />
          <div className="catalogue-skeleton-bg h-3 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function CatalogueProductCard({ product, onClick }) {
  const [imgError, setImgError] = useState(false);
  const [isInStock, setIsInStock] = useState(product.stock_available ?? false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Use the best available image URL
  const imgUrl = product.processed_image_url || product.image_url || product.raw_image_url || product.generated_image_urls?.[0];

  const title = product.title || (product.jewellery_type ? product.jewellery_type.charAt(0).toUpperCase() + product.jewellery_type.slice(1) : "Jewelry Piece");
  const weight = product.net_weight ? `${product.net_weight}g` : "";

  // Mock likes & orders per prompt
  const likes = product.likes ?? 0; // TODO: wire to retailer phase
  const orders = product.order_count ?? 0; // TODO: wire to retailer phase

  const handleToggle = async (e) => {
    e.stopPropagation(); // prevent card click if we add one later
    if (isUpdating) return;

    const newValue = !isInStock;
    setIsInStock(newValue); // Optimistic UI
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ in_stock: newValue }),
      });
      if (!res.ok) {
        throw new Error("Failed to update stock");
      }
    } catch (err) {
      console.error(err);
      setIsInStock(!newValue); // Revert on failure
    } finally {
      setIsUpdating(false);
    }
  };

  return <article 
    onClick={() => onClick && onClick(product)}
    className="cursor-pointer group flex flex-col bg-[#ffffff] rounded-xl border border-[#eee] transition-all duration-200 ease shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-[2px]"
  >
    <div className="w-full aspect-square bg-[#f9f9f9] rounded-t-xl overflow-hidden relative">
      {imgUrl && !imgError ? (
        <img
          src={imgUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[#999]">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.5 2h11l4 6-9.5 14L2.5 8l4-6z" />
          </svg>
        </div>
      )}
    </div>

    <div className="border-t border-[#eee] p-3 md:p-4 flex flex-col gap-2">
      <div className="flex flex-col">
        <h3 className="font-bold text-[14px] text-[#111] leading-tight truncate">
          {title}
        </h3>
        {product.jewellery_type && (
          <span className="text-[11px] text-[#aaaaaa] mt-0.5">
            {product.jewellery_type.charAt(0).toUpperCase() + product.jewellery_type.slice(1)}
          </span>
        )}
      </div>

      <div className="text-[13px] text-[#666] flex items-center gap-2">
        <span>
          <span className="text-red-500 mr-1">❤</span>
          {likes}
        </span>
        <span className="text-[#e0e0e0]">|</span>
        <span>{orders} orders</span>
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            disabled={isUpdating}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#111] ${isInStock ? 'bg-[#22c55e]' : 'bg-[#e0e0e0]'}`}
          >
            <span
              className={`absolute top-[2px] left-[2px] bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${isInStock ? 'translate-x-4' : 'translate-x-0'}`}
            />
          </button>
          <span className="text-[12px] text-[#999]">
            {isInStock ? "In stock" : "Out of stock"}
          </span>
        </div>
        {weight && (
          <span className="text-[12px] text-[#999]">{weight}</span>
        )}
      </div>
    </div>
  </article>
    ;
}

// ── CatalogueGrid ─────────────────────────────────────────────────────────────
export default function CatalogueGrid({
  products = [],
  isLoading = false,
  isError = false,
  onRetry,
  activeCategory = "All",
}) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState(null);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <p className="text-[14px] text-[#666]">Something went wrong. Please try again.</p>
        <button
          onClick={onRetry}
          className="text-[#111] text-[14px] font-medium border border-[#ddd] px-4 py-2 rounded-full hover:bg-[#f9f9f9] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <CatalogueCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    const isFiltered = activeCategory !== "all" && activeCategory !== "All";
    const displayName = isFiltered ? activeCategory : "jewelry";

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center w-full">
        <img
          src="https://res.cloudinary.com/dcs0vuzwg/image/upload/v1775076102/image_1613_bslbzg.png"
          alt="No products"
          className="w-[220px] h-auto mb-6"
        />
        <h3 className="font-bold text-[18px] text-[#111] mb-2">
          Nothing here yet
        </h3>
        <p className="text-[14px] text-[#666] max-w-sm mb-6">
          You haven't added any {displayName} to your catalogue. Upload your first design.
        </p>
        <button
          onClick={() => router.push("/dashboard/wholesaler/add-product")}
          className="bg-[#111] text-white text-[14px] rounded-full px-[28px] py-[12px] hover:bg-[#333] transition-colors"
        >
          Upload design
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px]">
        {products.map((product) => (
          <CatalogueProductCard 
            key={product.id} 
            product={product} 
            onClick={() => setSelectedProduct(product)}
          />
        ))}
      </div>
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </>
  );
}
