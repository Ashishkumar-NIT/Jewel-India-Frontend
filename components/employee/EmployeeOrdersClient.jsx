"use client";

import { useState } from "react";
import Link from "next/link";
import { BusinessProfileModal } from "../shared/BusinessProfileModal";

function HourglassIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 4H3M21 20H3M9 4v4l3 4-3 4v4M15 4v4l-3 4 3 4v4"/>
    </svg>
  );
}

function StatusBadge({ status }) {
  if (status === "pending" || status === "accepted") {
    return (
      <div className="flex items-center gap-1.5 text-amber-500 text-[12px] font-medium">
        <HourglassIcon className="w-3.5 h-3.5" />
        <span>Requested</span>
      </div>
    );
  }
  if (status === "in_production") {
    return (
      <div className="flex items-center gap-1.5 text-purple-600 text-[12px] font-medium">
        <HourglassIcon className="w-3.5 h-3.5" />
        <span>In production</span>
      </div>
    );
  }
  if (status === "packed") {
    return (
      <div className="flex items-center gap-1.5 text-orange-500 text-[12px] font-medium">
        <HourglassIcon className="w-3.5 h-3.5" />
        <span>Packed</span>
      </div>
    );
  }
  if (status === "dispatched") {
    return (
      <div className="flex items-center gap-1.5 text-emerald-600 text-[12px] font-medium">
        <HourglassIcon className="w-3.5 h-3.5" />
        <span>Dispatched from wholesaler end</span>
      </div>
    );
  }
  if (status === "received" || status === "completed") {
    return (
      <div className="flex items-center gap-1.5 text-emerald-600 text-[12px] font-medium">
        <HourglassIcon className="w-3.5 h-3.5" />
        <span>Order received</span>
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="flex items-center gap-1.5 text-red-500 text-[12px] font-medium">
        <HourglassIcon className="w-3.5 h-3.5" />
        <span>Rejected</span>
      </div>
    );
  }
  return null;
}

function NoteBox({ note }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = note && note.length > 100;
  const displayText = expanded || !isLong ? note : note.slice(0, 100) + "...";

  return (
    <div className="w-full max-w-[400px] bg-[#FAFAFA] border border-dashed border-gray-300 rounded-[4px] p-4 relative mb-5">
      <p className="text-[12px] text-gray-600 leading-relaxed pr-4">
        {note ? displayText : <span className="italic text-gray-400">No customization notes provided.</span>}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider hover:text-black mt-1"
        >
          {expanded ? "Show Less" : "Read More"}
        </button>
      )}
    </div>
  );
}

function OrderCard({ order, onUpdateStatus, onBusinessClick }) {
  const p = order.products || {};
  const w = order.wholesalers || {};
  const imgUrl = p.processed_image_url || p.raw_image_url;

  const typeLabel = p.jewellery_type
    ? p.jewellery_type.charAt(0).toUpperCase() + p.jewellery_type.slice(1)
    : "Jewellery";
  const categoryLabel = p.category
    ? p.category.charAt(0).toUpperCase() + p.category.slice(1)
    : "Item";
  const skuShort = order.id ? `#${order.id.split("-")[0].toUpperCase()} Q1` : "";

  const wholesalerName = w.business_name || "Wholesaler";
  const wholesalerAddress = [w.city, w.state].filter(Boolean).join(", ") || "Wholesalers address";

  return (
    <div className="flex flex-row gap-6 py-8 border-b border-gray-200 w-full items-start">

      {/* Left: Image */}
      <div className="w-[140px] h-[160px] shrink-0 bg-gray-100 overflow-hidden rounded-[2px] border border-gray-200">
        {imgUrl ? (
          <img src={imgUrl} alt={p.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-400">No Image</div>
        )}
      </div>

      {/* Right: Content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Title Row */}
        <div className="flex justify-between items-start mb-0.5">
          <h3 className="text-[22px] font-bold text-[#111827] leading-none">{typeLabel}</h3>
          <StatusBadge status={order.status} />
        </div>

        {/* Sub meta */}
        <p className="text-[11px] text-gray-400 mb-4">
          {categoryLabel} • SKU {skuShort}
        </p>

        {/* Note Box */}
        <NoteBox note={order.customization_note} />

        {/* Make to order + Wholesaler name */}
        <p className="text-[12px] text-gray-600 mb-1.5">
          Make to order{" "}
          <span className="font-semibold text-black">
            {p.make_to_order_days ? `${p.make_to_order_days} days` : "3-4 days"}
          </span>
          <span className="mx-2 text-gray-300">|</span>
          <button
            onClick={() => onBusinessClick(w)}
            className="underline decoration-gray-400 underline-offset-2 text-gray-600 hover:text-black transition-colors"
          >
            {wholesalerName}
          </button>
        </p>

        {/* Delivery from */}
        <p className="text-[12px] text-gray-600 mb-4">
          Delivery from: <span className="font-medium text-black">{wholesalerAddress}</span>
        </p>

        {/* Action buttons — right-aligned */}
        <div className="flex justify-end gap-3 mt-auto">
          {order.status === "dispatched" && (
            <button
              onClick={() => onUpdateStatus(order.id, "received")}
              className="px-5 py-2 bg-[#111827] text-white text-[12px] font-medium rounded-full hover:bg-black transition-colors shadow-sm"
            >
              Marked received
            </button>
          )}
          {(order.status === "received" || order.status === "completed") && (
            <button
              disabled
              className="px-5 py-2 bg-[#111827] text-white text-[12px] font-medium rounded-full opacity-60 cursor-default"
            >
              Order shipped
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EmployeeOrdersClient({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState("requested");
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const { data } = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data } : o));
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const tabs = [
    { id: "requested", label: "Requested", statuses: ["pending", "accepted"] },
    { id: "active",    label: "Active Orders", statuses: ["in_production", "packed"] },
    { id: "shipped",   label: "Shipped", statuses: ["dispatched", "received", "completed"] },
  ];

  const counts = tabs.reduce((acc, tab) => {
    acc[tab.id] = orders.filter(o => tab.statuses.includes(o.status)).length;
    return acc;
  }, {});

  const filteredOrders = orders.filter(o => {
    const tab = tabs.find(t => t.id === activeTab);
    return tab ? tab.statuses.includes(o.status) : false;
  });

  return (
    <div className="w-full bg-white min-h-screen pb-24">

      {/* Header */}
      <div className="w-full max-w-3xl mx-auto px-6 pt-8 pb-4 relative">
        <Link
          href="/dashboard/employee"
          className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-black transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-[34px] font-serif text-[#111827] tracking-wide mb-1.5">Orders</h1>
          <p className="text-[13px] text-gray-500">Review and respond to orders from retailers.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 border-b border-gray-200 mb-2">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-[13px] font-medium border-b-2 transition-all -mb-px ${
                  isActive
                    ? "border-black text-black"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab.label}
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  isActive ? "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-400"
                }`}>
                  {counts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders list */}
      <div className="w-full max-w-3xl mx-auto px-6">
        {filteredOrders.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-gray-400 text-[14px]">No orders in this category.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                onBusinessClick={(b) => setSelectedBusiness(b)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Business Profile Modal */}
      {selectedBusiness && (
        <BusinessProfileModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
        />
      )}

      {/* Loading overlay */}
      {isUpdating && (
        <div className="fixed inset-0 z-[100] bg-white/50 backdrop-blur-sm flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-black border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}
