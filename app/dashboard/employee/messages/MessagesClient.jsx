"use client";
import { useState, useEffect, useRef } from "react";
import { ConversationList } from "../../../../components/chat/ConversationList";
import { ChatWindow } from "../../../../components/chat/ChatWindow";

// Module-level cache that persists across navigation
const messagesCache = {
  activeConversationId: null,
  conversations: []
};

export default function MessagesClient({ initialConversations, currentUserType, openProductId }) {
  const [conversations, setConversations] = useState(() => {
    return (initialConversations && initialConversations.length > 0) 
      ? initialConversations 
      : (messagesCache.conversations || []);
  });
  const [activeConversation, setActiveConversation] = useState(() => {
    return messagesCache.activeConversationId ? { id: messagesCache.activeConversationId } : null;
  });
  const [isCreating, setIsCreating] = useState(false);
  const hasHandledProductId = useRef(false);

  useEffect(() => {
    messagesCache.conversations = conversations;
  }, [conversations]);

  useEffect(() => {
    messagesCache.activeConversationId = activeConversation?.id || null;
    
    // Optimistically mark the opened conversation as read in the sidebar
    if (activeConversation?.id) {
      setConversations(prev => prev.map(c => 
        c.id === activeConversation.id ? { ...c, has_unread: false } : c
      ));
    }
  }, [activeConversation]);

  // Auto-create or open conversation when coming from "Chat with us"
  useEffect(() => {
    if (!openProductId || hasHandledProductId.current) return;
    hasHandledProductId.current = true;

    const handleOpenProduct = async () => {
      // First check if a conversation already exists for this product
      const existing = conversations.find(c => c.product_id === openProductId);
      if (existing) {
        setActiveConversation(existing);
        return;
      }

      // Create new conversation
      setIsCreating(true);
      try {
        const res = await fetch("/api/chat/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: openProductId }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to create conversation");

        const newConvId = json.data.id;

        // Refetch the full conversation list to get joined data (product, wholesaler_profile etc.)
        const listRes = await fetch("/api/chat/conversations");
        const listJson = await listRes.json();
        const freshConversations = listJson.data || [];

        setConversations(freshConversations);

        // Find the newly created conversation from the fresh list
        const created = freshConversations.find(c => c.id === newConvId);
        if (created) setActiveConversation(created);
        
      } catch (err) {
        console.error("[MessagesClient] Failed to open conversation:", err.message);
        alert("Could not open chat: " + err.message);
      } finally {
        setIsCreating(false);
      }
    };

    handleOpenProduct();
  }, [openProductId, conversations]);

  if (isCreating) {
    return (
      <div className="flex-1 w-full flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[14px] text-gray-500 font-medium">Opening conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-white h-screen overflow-hidden">
      {/* Page Header */}
      <div className="relative flex items-center justify-center px-6 py-4 border-b border-gray-100 shrink-0">
        <button
          onClick={() => window.history.back()}
          className="absolute left-6 w-9 h-9 rounded-full bg-gradient-to-b from-gray-50 to-gray-200 border border-gray-300 flex items-center justify-center text-gray-500 hover:text-black transition-colors shadow-sm"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[24px] md:text-[30px] font-serif text-[#111827] tracking-wide">Queries</h1>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 min-h-0 flex w-full max-w-6xl mx-auto px-2 md:px-8 py-4 md:py-6 overflow-hidden">
        <div className="flex w-full h-full bg-white rounded-[16px] shadow-sm border border-gray-200 overflow-hidden">
          {/* Left Sidebar */}
          <ConversationList
            conversations={conversations}
            activeId={activeConversation?.id}
            onSelect={setActiveConversation}
            currentUserType={currentUserType}
          />

          {/* Right Chat Area */}
          <ChatWindow
            conversation={activeConversation}
            currentUserType={currentUserType}
          />
        </div>
      </div>
    </div>
  );
}
