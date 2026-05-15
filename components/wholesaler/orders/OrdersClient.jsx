"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { OrderDetailModal } from "../../../components/employee/OrderDetailModal";
import { BusinessProfileModal } from "../../../components/shared/BusinessProfileModal";
import { ConfirmationModal } from "../../../components/shared/ConfirmationModal";

function HourglassIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 4H3M21 20H3M9 4v4l3 4-3 4v4M15 4v4l-3 4 3 4v4"/>
    </svg>
  );
}

function WholesalerOrderCard({ order, onUpdateStatus, onReject, onDeleteOrder, onViewDetails, onBusinessClick }) {
  const p = order.products || {};
  const r = order.retailers || {};
  const imgUrl = p.processed_image_url || p.raw_image_url;

  // Derive time remaining or status text
  let statusBadge = null;
  if (order.status === "pending") {
    statusBadge = (
      <div className="flex items-center gap-1.5 text-[#d97706] font-medium text-[13px]">
        <HourglassIcon className="w-4 h-4" />
        <span>Respond in next 18 hours</span>
      </div>
    );
  } else if (order.status === "accepted" || order.status === "in_production") {
    statusBadge = (
      <div className="flex items-center gap-1.5 text-purple-600 font-medium text-[13px]">
        <span>In Production</span>
      </div>
    );
  } else if (order.status === "packed") {
    statusBadge = (
      <div className="flex items-center gap-1.5 text-orange-600 font-medium text-[13px]">
        <span>Packed</span>
      </div>
    );
  } else if (order.status === "dispatched") {
    statusBadge = (
      <div className="flex items-center gap-1.5 text-indigo-600 font-medium text-[13px]">
        <span>Dispatched</span>
      </div>
    );
  } else if (order.status === "received" || order.status === "completed") {
    statusBadge = (
      <div className="flex items-center gap-1.5 text-green-600 font-medium text-[13px]">
        <span>Completed</span>
      </div>
    );
  } else if (order.status === "rejected") {
    statusBadge = (
      <div className="flex items-center gap-1.5 text-red-600 font-medium text-[13px]">
        <span>Rejected</span>
      </div>
    );
  }

  const categoryLabel = p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : "Jewellery";
  const typeLabel = p.jewellery_type ? p.jewellery_type.charAt(0).toUpperCase() + p.jewellery_type.slice(1) : "Item";

  return (
    <div className="flex flex-col md:flex-row gap-8 py-10 border-b border-gray-200 w-full relative">
      
      {/* Left Image */}
      <div className="w-[240px] h-[240px] bg-gray-50 rounded-sm overflow-hidden shrink-0 border border-gray-100">
        {imgUrl ? (
          <img src={imgUrl} alt={p.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[12px] text-gray-400">No Image</div>
        )}
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col justify-start relative">
        
        {/* Header row */}
        <div className="flex justify-between items-start w-full mb-1">
          <h3 className="text-[26px] font-bold text-[#111827] leading-none">
            {typeLabel}
          </h3>
          <div className="mt-1">
            {statusBadge}
          </div>
        </div>

        {/* Sub-meta */}
        <p className="text-[12px] text-gray-500 mb-5">
          {categoryLabel} • SKU #{order.id.split("-")[0].toUpperCase()} Q1
        </p>

        {/* Customization Note Box */}
        {order.customization_note ? (
          <div className="w-full max-w-[480px] bg-[#fafafa] border border-dashed border-gray-300 rounded-[6px] p-4 relative mb-5">
            <p className="text-[13px] text-gray-600 pr-16 leading-relaxed">
              {order.customization_note}
            </p>
            <button className="absolute bottom-3 right-4 text-[10px] font-semibold text-gray-500 uppercase tracking-wider hover:text-black">
              Read More
            </button>
          </div>
        ) : (
          <div className="w-full max-w-[480px] bg-[#fafafa] border border-dashed border-gray-300 rounded-[6px] p-4 relative mb-5 flex items-center justify-center h-[80px]">
             <p className="text-[12px] text-gray-400 italic">No customization notes provided.</p>
          </div>
        )}

        {/* Order Meta details */}
        <p className="text-[13px] text-gray-600 mb-2">
          Make to order <span className="font-semibold text-black">{p.make_to_order_days ? `${p.make_to_order_days} days` : "N/A"}</span> <span className="mx-2 text-gray-300">|</span> <span onClick={() => onBusinessClick(r)} className="underline decoration-gray-300 underline-offset-4 hover:decoration-gray-500 cursor-pointer">{r.business_name || "Unknown Retailer"}</span>
        </p>
        
        <p className="text-[13px] text-gray-600 mb-8">
          Deliver to: <span className="font-bold text-black">{r.city || "Unknown City"}, {r.state || "State"}</span>
        </p>

        {/* Bottom Right Actions */}
        <div className="absolute bottom-0 right-0 flex items-center gap-3">
          {order.status === "pending" && (
            <>
              <button 
                onClick={() => onReject(order)}
                className="px-6 py-2.5 text-[13px] font-medium text-[#ef4444] border border-[#fca5a5] rounded-[6px] hover:bg-red-50 transition-colors"
              >
                Reject order
              </button>
              <button 
                onClick={() => onUpdateStatus(order.id, "in_production")}
                className="px-6 py-2.5 text-[13px] font-medium bg-[#111827] text-white rounded-[6px] hover:bg-black transition-colors"
              >
                Confirm order
              </button>
            </>
          )}


          {order.status === "in_production" && (
            <button 
              onClick={() => onUpdateStatus(order.id, "packed")}
              className="px-6 py-2.5 text-[13px] font-medium bg-orange-600 text-white rounded-[6px] hover:bg-orange-700 transition-colors"
            >
              Mark as Packed
            </button>
          )}

          {order.status === "packed" && (
            <button 
              onClick={() => onUpdateStatus(order.id, "dispatched")}
              className="px-6 py-2.5 text-[13px] font-medium bg-indigo-600 text-white rounded-[6px] hover:bg-indigo-700 transition-colors"
            >
              Dispatch Order
            </button>
          )}

          {/* Fallback View Details for other states */}
          {!["pending", "accepted", "in_production", "packed"].includes(order.status) && (
             <button 
               onClick={() => onViewDetails(order)}
               className="px-6 py-2.5 text-[13px] font-medium border border-gray-300 text-gray-700 rounded-[6px] hover:bg-gray-50 transition-colors"
             >
               View Details
             </button>
          )}

          {order.status === "rejected" && (
            <button 
              onClick={() => onDeleteOrder(order.id)}
              className="px-6 py-2.5 text-[13px] font-medium text-white bg-red-600 rounded-[6px] hover:bg-red-700 transition-colors shadow-sm"
            >
              Delete Order
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

const tabs = [
  { id: "new", label: "New Orders" },
  { id: "active", label: "Active Orders" },
  { id: "completed", label: "Completed" },
  { id: "rejected", label: "Rejected" },
];

export default function OrdersClient({ initialOrders }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const isValidTab = tabs.some(t => t.id === tabParam);

  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState(isValidTab ? tabParam : "new");
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  // Sync activeTab with URL
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Handle browser back/forward navigation
  useEffect(() => {
    if (tabParam && tabs.some(t => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  // Rejection modal
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleDeleteOrder = async (orderId) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete order");
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setOrderToDelete(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, reason = null) => {
    // If not already confirmed (via modal), show modal for specific transitions
    if (!reason && !pendingStatusChange) {
      if (newStatus === "in_production") {
        setPendingStatusChange({
          orderId, newStatus,
          title: "Confirm Order?",
          message: "Are you sure you want to accept and start production for this order?",
          variant: "primary"
        });
        return;
      }
      if (newStatus === "packed") {
        setPendingStatusChange({
          orderId, newStatus,
          title: "Mark as Packed?",
          message: "Has this order been fully packed and prepared for shipping?",
          variant: "primary"
        });
        return;
      }
      if (newStatus === "dispatched") {
        setPendingStatusChange({
          orderId, newStatus,
          title: "Dispatch Order?",
          message: "Are you sure you want to mark this order as dispatched?",
          variant: "success"
        });
        return;
      }
    }

    setIsUpdating(true);
    try {
      const payload = { status: newStatus };
      if (reason) payload.rejection_reason = reason;

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      const { data } = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data } : o));
      
      setRejectOrder(null);
      setRejectReason("");
      setPendingStatusChange(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const submitReject = () => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    handleUpdateStatus(rejectOrder.id, "rejected", rejectReason);
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === "new") return o.status === "pending";
    if (activeTab === "active") return ["accepted", "in_production", "packed", "dispatched"].includes(o.status);
    if (activeTab === "completed") return ["received", "completed"].includes(o.status);
    if (activeTab === "rejected") return o.status === "rejected";
    return true;
  });

  const counts = {
    new: orders.filter(o => o.status === "pending").length,
    active: orders.filter(o => ["accepted", "in_production", "packed", "dispatched"].includes(o.status)).length,
    completed: orders.filter(o => ["received", "completed"].includes(o.status)).length,
    rejected: orders.filter(o => o.status === "rejected").length,
  };

  return (
    <div className="w-full bg-white min-h-screen pb-24">
      
      {/* Header Area */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-10 pb-8 flex flex-col relative">
        <Link 
          href="/dashboard/wholesaler" 
          className="absolute left-6 top-12 flex items-center gap-2 text-[13px] font-medium text-gray-700 hover:text-black transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        <div className="w-full flex flex-col items-center mt-2">
          <h1 className="text-[36px] font-serif text-[#111827] tracking-wide mb-2">Orders</h1>
          <p className="text-[13px] text-gray-500">Review and respond to orders from retailers.</p>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-6">
        {/* Segmented Tabs */}
        <div className="inline-flex items-center bg-[#f4f5f7] rounded-full p-1 mb-8">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-medium transition-all ${
                  isActive 
                    ? "bg-white text-black shadow-[0_1px_3px_rgba(0,0,0,0.1)]" 
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
                <span className={`flex items-center justify-center min-w-[20px] h-[20px] rounded-full text-[10px] px-1.5 ${
                  isActive ? "bg-gray-100 text-gray-800" : "bg-gray-200/60 text-gray-500"
                }`}>
                  {counts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>

        {/* List */}
        {filteredOrders.length === 0 ? (
          <div className="py-24 text-center border-t border-gray-200 mt-4">
            <p className="text-gray-400 font-medium text-[14px]">No orders found in this category.</p>
          </div>
        ) : (
          <div className="flex flex-col border-t border-gray-200">
            {filteredOrders.map(order => (
              <WholesalerOrderCard 
                key={order.id} 
                order={order} 
                onUpdateStatus={handleUpdateStatus} 
                onReject={(o) => setRejectOrder(o)}
                onDeleteOrder={(orderId) => setOrderToDelete(orderId)}
                onViewDetails={(o) => setSelectedOrder(o)}
                onBusinessClick={(r) => setSelectedBusiness(r)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          isEmployee={false}
        />
      )}

      {/* Business Profile Modal */}
      {selectedBusiness && (
        <BusinessProfileModal 
          business={selectedBusiness} 
          onClose={() => setSelectedBusiness(null)} 
        />
      )}

      {/* Reject Modal */}
      {rejectOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRejectOrder(null)} />
          <div className="bg-white w-full max-w-md rounded-[20px] shadow-2xl relative z-10 p-6 animate-fade-in-up">
            <h2 className="text-[18px] font-extrabold text-[#111827] mb-2">Reject Order</h2>
            <p className="text-[13px] text-gray-500 mb-5">Please provide a reason for rejecting this request.</p>
            
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full h-32 border border-gray-200 rounded-[12px] p-4 text-[14px] focus:ring-2 focus:ring-black/10 outline-none resize-none mb-5"
              placeholder="E.g., Out of stock for this material..."
            ></textarea>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setRejectOrder(null)} className="px-5 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-50 rounded-[8px]">Cancel</button>
              <button onClick={submitReject} className="px-5 py-2.5 text-[13px] font-bold bg-red-600 text-white rounded-[8px] shadow-md hover:bg-red-700">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={() => handleDeleteOrder(orderToDelete)}
        title="Delete Order?"
        message="Are you sure you want to delete this rejected order? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="No, Keep it"
      />

      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!pendingStatusChange}
        onClose={() => setPendingStatusChange(null)}
        onConfirm={() => handleUpdateStatus(pendingStatusChange.orderId, pendingStatusChange.newStatus)}
        title={pendingStatusChange?.title}
        message={pendingStatusChange?.message}
        variant={pendingStatusChange?.variant}
        confirmText="Yes, Proceed"
        cancelText="Cancel"
      />

      {isUpdating && (
        <div className="fixed inset-0 z-[100] bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-black border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}
