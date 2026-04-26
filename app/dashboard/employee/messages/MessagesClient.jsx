"use client";
import { useState } from "react";
import { ConversationList } from "../../../../components/chat/ConversationList";
import { ChatWindow } from "../../../../components/chat/ChatWindow";

export default function MessagesClient({ initialConversations, currentUserType }) {
  const [conversations, setConversations] = useState(initialConversations || []);
  const [activeConversation, setActiveConversation] = useState(null);

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
