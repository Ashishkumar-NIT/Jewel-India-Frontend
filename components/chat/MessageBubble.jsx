"use client";

function formatTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function MessageBubble({ message, isOwnMessage }) {
  return (
    <div className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`flex flex-col max-w-[75%] md:max-w-[65%] ${
          isOwnMessage ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`px-4 py-2.5 rounded-[16px] text-[14px] leading-relaxed break-words shadow-sm ${
            isOwnMessage
              ? "bg-[#111827] text-white rounded-br-[4px]"
              : "bg-white border border-gray-100 text-[#111827] rounded-bl-[4px]"
          }`}
        >
          {message.content}
        </div>
        <div className="flex items-center gap-1 mt-1.5 px-1">
          <span className="text-[10px] text-gray-400 font-medium">
            {formatTime(message.created_at)}
          </span>
          {isOwnMessage && (
            <span className="text-[10px] text-gray-400">
              {message.is_read ? (
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-3 h-3 text-blue-500">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" />
                </svg>
              ) : (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3 text-gray-300">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
