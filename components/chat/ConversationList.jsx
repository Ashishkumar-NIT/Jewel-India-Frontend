"use client";

import { useState } from "react";

function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minute${Math.floor(diffInSeconds / 60) > 1 ? "s" : ""} ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? "s" : ""} ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  currentUserType
}) {
  const [filter, setFilter] = useState("all");

  const unreadConvs = (conversations || []).filter(c => c.has_unread);

  const displayedConvs = filter === "unread"
    ? unreadConvs
    : (conversations || []);

  const panelLabel = currentUserType === "wholesaler" ? "Queries" : "Queries";
  const panelSubtitle = currentUserType === "wholesaler"
    ? "Manage retailer inquiries and respond to potential leads."
    : "Messages from wholesalers regarding your product requests.";

  return (
    <div className="w-full md:w-[320px] shrink-0 border-r border-gray-200 bg-white flex flex-col h-full">
      {/* Panel Header */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
        <h2 className="text-[16px] font-bold text-[#111827] mb-0.5">{panelLabel}</h2>
        <p className="text-[11px] text-gray-400 leading-snug">{panelSubtitle}</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-4 py-2.5 border-b border-gray-100 shrink-0">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
            filter === "all"
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
            filter === "unread"
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
          }`}
        >
          Unread
          {unreadConvs.length > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
              filter === "unread" ? "bg-white text-gray-900" : "bg-gray-200 text-gray-600"
            }`}>
              {unreadConvs.length}
            </span>
          )}
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {displayedConvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
            <svg className="w-8 h-8 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-[13px] font-semibold text-gray-600 mb-1">No queries yet</p>
            <p className="text-[11px] text-gray-400">
              {currentUserType === "employee"
                ? "Start a chat from the product detail page."
                : "Queries from retailers will appear here."}
            </p>
          </div>
        ) : (
          displayedConvs.map((conv) => {
            const isActive = conv.id === activeId;

            // Product title is the primary heading
            const productTitle = conv.product?.title || "Product Enquiry";

            // "From" label — depends on user type
            let fromLabel = "";
            if (currentUserType === "wholesaler") {
              // From: retailer business name
              fromLabel = conv.retailer?.business_name || conv.employee?.full_name || "Retailer";
            } else if (currentUserType === "employee") {
              // From: wholesaler
              fromLabel = conv.wholesaler_profile?.full_name || conv.wholesaler_profile?.email?.split("@")[0] || "Wholesaler";
            } else {
              fromLabel = conv.employee?.full_name || "Employee";
            }

            const hasUnread = conv.has_unread;
            const lastMessage = conv.last_message || "";

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`w-full flex flex-col gap-1 px-5 py-4 border-b border-gray-100 text-left transition-colors ${
                  isActive
                    ? "bg-gray-50"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {/* Title row */}
                <div className="flex items-center gap-2 w-full">
                  <span className={`flex-1 text-[13px] font-semibold truncate ${isActive ? "text-black" : "text-[#1a1a1a]"}`}>
                    {productTitle}
                  </span>
                  {hasUnread && (
                    <span className="shrink-0 text-[10px] font-bold text-white bg-blue-600 px-1.5 py-0.5 rounded-sm tracking-wide">
                      new
                    </span>
                  )}
                </div>

                {/* From label */}
                <p className="text-[11px] text-gray-400">
                  from: <span className="font-medium text-gray-600">{fromLabel}</span>
                </p>

                {/* Last message preview */}
                {lastMessage && (
                  <p className="text-[12px] text-gray-500 truncate leading-snug mt-0.5">
                    {lastMessage}
                  </p>
                )}

                {/* Time */}
                <span className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {formatTimeAgo(conv.updated_at)}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
