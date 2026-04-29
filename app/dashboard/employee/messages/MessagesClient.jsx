"use client";
import { useState, useEffect } from "react";
import { ConversationList } from "../../../../components/chat/ConversationList";
import { ChatWindow } from "../../../../components/chat/ChatWindow";

// Module-level cache that persists across navigation
const messagesCache = {
  activeConversationId: null,
  conversations: []
};

export default function MessagesClient({ initialConversations, currentUserType }) {
  // Restore state from cache on mount
  const [conversations, setConversations] = useState(() => {
    return messagesCache.conversations.length > 0 ? messagesCache.conversations : (initialConversations || []);
  });
  const [activeConversation, setActiveConversation] = useState(() => {
    return messagesCache.activeConversationId ? { id: messagesCache.activeConversationId } : null;
  });

  useEffect(() => {
    messagesCache.conversations = conversations;
  }, [conversations]);

  useEffect(() => {
    messagesCache.activeConversationId = activeConversation?.id || null;
  }, [activeConversation]);

  // In a full implementation, you might want to subscribe to changes in the conversations table as well
  // to update the updated_at time or show a new conversation when it's created.
  // For now, we use the initial list.

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 h-[calc(100vh-140px)] min-h-[500px]">
      <div className="flex w-full h-full bg-white rounded-[24px] shadow-sm border border-gray-200 overflow-hidden">
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
  );
}
