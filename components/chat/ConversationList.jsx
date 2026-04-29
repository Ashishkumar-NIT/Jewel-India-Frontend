"use client";

function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}
export function ConversationList({ 
  conversations, 
  activeId, 
  onSelect, 
  currentUserType 
}) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="w-full md:w-[320px] shrink-0 border-r border-gray-200 bg-white flex flex-col p-6 items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-[14px] font-semibold text-gray-900 mb-1">No conversations</p>
        <p className="text-[12px] text-gray-500">
          {currentUserType === "employee" 
            ? "Start a chat from the wholesaler gallery." 
            : "Conversations will appear here."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[320px] shrink-0 border-r border-gray-200 bg-white flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 shrink-0">
        <h2 className="text-[18px] font-extrabold text-[#111827]">Messages</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {conversations.map((conv) => {
          const isActive = conv.id === activeId;
          
          let partnerName = "";
          let subText = conv.product?.title || "Product";
          
          if (currentUserType === "employee") {
            // Partner is Wholesaler
            partnerName = conv.wholesaler_profile?.full_name || conv.wholesaler_profile?.email?.split('@')[0] || "Wholesaler";
          } else if (currentUserType === "wholesaler") {
            // Partner is Employee
            partnerName = conv.employee?.full_name || "Employee";
            subText = `${conv.retailer?.business_name} - ${subText}`;
          } else {
            // Retailer viewing
            partnerName = `${conv.employee?.full_name}`;
            subText = `With Wholesaler re: ${subText}`;
          }

          const productImageUrl = conv.product?.processed_image_url || conv.product?.raw_image_url;

          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`w-full flex items-start gap-3 p-4 border-b border-gray-50 transition-colors text-left ${
                isActive 
                  ? "bg-blue-50/50 hover:bg-blue-50/80" 
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {/* Product Thumbnail / Avatar */}
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                {productImageUrl ? (
                  <img src={productImageUrl} alt={subText} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 text-[14px]">
                    {partnerName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 flex flex-col pt-0.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-[14px] font-bold text-[#111827] truncate">
                    {partnerName}
                  </h4>
                  <span className="text-[10px] font-medium text-gray-400 shrink-0">
                    {formatTimeAgo(conv.updated_at)}
                  </span>
                </div>
                <p className={`text-[12px] truncate ${isActive ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                  {subText}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
