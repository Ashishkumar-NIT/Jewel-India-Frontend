"use client";
import { useState, useRef, useEffect } from "react";
import { useRealtimeMessages } from "../../lib/hooks/useRealtimeMessages";
import { MessageBubble } from "./MessageBubble";

export function ChatWindow({ conversation, currentUserType }) {
  const { messages, isLoading, error } = useRealtimeMessages(conversation?.id);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when viewing them
  // Use ref to track previous count — avoid re-firing when `messages` array
  // reference changes but count is unchanged (avoids unnecessary PATCH churn).
  const prevUnreadRef = useRef(0);
  const unreadCount = messages.filter(
    (m) => !m.is_read && m.sender_type !== currentUserType
  ).length;

  useEffect(() => {
    if (!conversation?.id) return;
    if (unreadCount === prevUnreadRef.current) return;
    prevUnreadRef.current = unreadCount;
    if (unreadCount === 0) return;

    fetch("/api/chat/messages/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: conversation.id }),
    }).catch(console.error);
  }, [conversation?.id, unreadCount]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending || !conversation?.id) return;

    const content = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversation.id,
          content,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send message. Please try again.");
      setInputValue(content); // Restore input on failure
    } finally {
      setIsSending(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-r-[16px] text-center p-8 border-l border-gray-200">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-400 mb-4">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-[18px] font-bold text-[#111827] mb-2">Your Messages</h3>
        <p className="text-[14px] text-gray-500 max-w-[280px]">
          Select a conversation from the sidebar to view your messages.
        </p>
      </div>
    );
  }

  // Determine chat partner details based on current user type
  let partnerName = "";
  let partnerSub = "";

  if (currentUserType === "employee") {
    // Partner is Wholesaler
    partnerName = conversation.wholesaler_profile?.full_name || conversation.wholesaler_profile?.email?.split('@')[0] || "Wholesaler";
    partnerSub = "Wholesaler";
  } else if (currentUserType === "wholesaler") {
    // Partner is Employee
    partnerName = conversation.employee?.full_name || "Employee";
    partnerSub = conversation.retailer?.business_name || "Retailer";
  } else {
    // Retailer viewing (read-only usually)
    partnerName = `${conversation.employee?.full_name} ↔ Wholesaler`;
    partnerSub = "Conversation";
  }

  const productImageUrl = conversation.product?.processed_image_url || conversation.product?.raw_image_url;

  return (
    <div className="flex-1 flex flex-col bg-[#FAFAFA] rounded-r-[16px] overflow-hidden border-l border-gray-200">
      {/* Header */}
      <div className="h-[72px] shrink-0 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-[14px] font-bold text-blue-600 shrink-0">
            {partnerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h3 className="text-[15px] font-bold text-[#111827] leading-tight truncate max-w-[200px]">
              {partnerName}
            </h3>
            <span className="text-[12px] text-gray-500 leading-tight">
              {partnerSub}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Product context mini-card */}
          {conversation.product && (
            <div className="hidden sm:flex items-center gap-3 bg-gray-50 rounded-lg pr-3 pl-1 py-1 border border-gray-100">
              <div className="w-8 h-8 rounded bg-gray-200 overflow-hidden shrink-0">
                {productImageUrl ? (
                  <img src={productImageUrl} alt={conversation.product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">No Img</div>
                )}
              </div>
              <div className="flex flex-col max-w-[150px]">
                <span className="text-[10px] uppercase text-gray-400 font-semibold leading-none">Regarding</span>
                <span className="text-[12px] font-medium text-gray-900 truncate leading-tight">
                  {conversation.product.title || "Product"}
                </span>
              </div>
            </div>
          )}

          {currentUserType === "wholesaler" && (
            <button
              onClick={async () => {
                if (confirm("Are you sure you want to delete this conversation?")) {
                  try {
                    await fetch(`/api/chat/conversation/${conversation.id}`, { method: "DELETE" });
                    window.location.reload();
                  } catch (e) {
                    console.error(e);
                  }
                }
              }}
              className="text-red-500 hover:bg-red-50 p-2 rounded-md text-[13px] font-medium transition-colors border border-transparent hover:border-red-200"
              title="Delete conversation"
            >
              Delete Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 scroll-smooth flex flex-col"
      >
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-500 text-[13px] font-medium">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
            <p className="text-[14px] font-semibold text-gray-900 mb-1">No messages yet</p>
            <p className="text-[12px] text-gray-500">Send a message to start the conversation.</p>
          </div>
        ) : (
          <div className="flex flex-col mt-auto">
            {messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isOwnMessage={msg.sender_type === currentUserType} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      {currentUserType !== "retailer" && (
        <div className="shrink-0 p-4 bg-white border-t border-gray-200">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-end gap-3"
          >
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-[16px] p-2 focus-within:ring-2 focus-within:ring-black/5 focus-within:border-gray-300 transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type a message..."
                className="w-full bg-transparent border-none outline-none resize-none max-h-[120px] min-h-[40px] px-3 py-2 text-[14px] text-gray-900 placeholder-gray-400 scrollbar-hide"
                rows={1}
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className="shrink-0 w-[48px] h-[48px] rounded-full bg-[#111827] text-white flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 ml-0.5">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </form>
          <div className="mt-2 text-center">
            <span className="text-[10px] text-gray-400">Press Enter to send, Shift+Enter for new line</span>
          </div>
        </div>
      )}
    </div>
  );
}
