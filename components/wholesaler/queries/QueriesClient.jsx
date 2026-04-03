"use client";

import { useState } from "react";
import s from "./queries.module.css";

/* ── Static Data ── */
const QUERIES = [
  {
    id: 1,
    product: "Emerald Cut Engagement Ring",
    from: "Sharma Jewellers",
    preview: "Interested in bulk order of 10 pieces. Can you provide better pricing?",
    status: "unread",
    contactName: "Rajesh Kumar",
    storeName: "Kumar Gold Palace, Delhi",
    messages: [
      { sender: "retailer", text: "Do you have this in different color variations? Need for wedding season.", time: "12:10pm" },
    ],
  },
  {
    id: 2,
    product: "Ring for the king",
    from: "Sharma Jewellers",
    preview: "Can we schedule a video call to see the clarity?",
    status: "replied",
    contactName: "Rajesh Kumar",
    storeName: "Kumar Gold Palace, Delhi",
    messages: [
      { sender: "retailer", text: "Can we schedule a video call to see the clarity?", time: "11:30am" },
      { sender: "wholesaler", text: "Sure, let us know your availability and we will arrange it.", time: "11:45am" },
    ],
  },
  {
    id: 3,
    product: "Queens necklace",
    from: "Sharma Jewellers",
    preview: "Interested in bulk order of 10 pieces. Can you provide better pricing?",
    status: "read",
    contactName: "Rajesh Kumar",
    storeName: "Kumar Gold Palace, Delhi",
    messages: [
      { sender: "retailer", text: "Interested in bulk order of 10 pieces. Can you provide better pricing?", time: "10:00am" },
    ],
  },
];

/* ── SVG Icons (inline) ── */
const ClockIcon = () => (
  <svg className={s.clockIcon} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 6v4.5l3 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChatBubbleIcon = () => (
  <svg className={s.emptyIcon} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="10" width="52" height="36" rx="8" stroke="#9CA3AF" strokeWidth="2.5"/>
    <path d="M20 52l8-6h0" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="22" cy="28" r="2.5" fill="#9CA3AF"/>
    <circle cx="32" cy="28" r="2.5" fill="#9CA3AF"/>
    <circle cx="42" cy="28" r="2.5" fill="#9CA3AF"/>
  </svg>
);

const PaperclipIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 9.16l-7.92 7.92a4.167 4.167 0 01-5.893-5.893l7.92-7.92a2.778 2.778 0 013.929 3.929l-7.93 7.908a1.389 1.389 0 01-1.964-1.964l7.321-7.308" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.333 1.667L9.167 10.833M18.333 1.667l-5.833 16.666-3.333-7.5-7.5-3.333 16.666-5.833z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BackArrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Status badge class helper ── */
function badgeClass(status) {
  if (status === "unread") return `${s.cardBadge} ${s.badgeUnread}`;
  if (status === "replied") return `${s.cardBadge} ${s.badgeReplied}`;
  return `${s.cardBadge} ${s.badgeRead}`;
}

/* ── Main Component ── */
export default function QueriesClient() {
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [localMessages, setLocalMessages] = useState({});

  const filtered = filter === "all" ? QUERIES : QUERIES.filter((q) => q.status === "unread");
  const selected = QUERIES.find((q) => q.id === selectedId);

  const currentMessages = selected
    ? localMessages[selected.id] || selected.messages
    : [];

  function handleSend() {
    if (!replyText.trim() || !selected) return;
    const newMsg = { sender: "wholesaler", text: replyText.trim(), time: "12:24pm" };
    setLocalMessages((prev) => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] || selected.messages), newMsg],
    }));
    setReplyText("");
  }

  function handleSelectCard(id) {
    setSelectedId(id);
  }

  function handleBack() {
    setSelectedId(null);
  }

  /* Mobile: if a query is selected, hide the left panel */
  const mobileDetailMode = selectedId !== null;

  return (
    <div className={s.page}>
      {/* ── Header (always visible) ── */}
      {(!mobileDetailMode || typeof window === "undefined" || window.innerWidth >= 768) && (
        <>
          <h1 className={s.title}>Queries</h1>
          <p className={s.subtitle}>Manage retailer inquiries and respond to potential leads</p>
          <div className={s.filters}>
            <button
              className={`${s.filterTab} ${filter === "all" ? s.filterTabActive : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`${s.filterTab} ${filter === "unread" ? s.filterTabActive : ""}`}
              onClick={() => setFilter("unread")}
            >
              Unread (12)
            </button>
          </div>
        </>
      )}

      {/* ── Split Panel ── */}
      <div className={s.splitPanel}>

        {/* ── Left: Card List ── */}
        <div className={`${s.leftPanel} ${mobileDetailMode ? s.leftPanelHidden : ""}`}>
          {filtered.map((q) => (
            <div
              key={q.id}
              className={`${s.card} ${selectedId === q.id ? s.cardSelected : ""}`}
              onClick={() => handleSelectCard(q.id)}
            >
              <span className={badgeClass(q.status)}>{q.status}</span>
              <p className={s.cardProduct}>{q.product}</p>
              <p className={s.cardFrom}>from : {q.from}</p>
              <p className={s.cardPreview}>{q.preview}</p>
              <div className={s.cardTimestamp}>
                <ClockIcon /> 3 days ago
              </div>
            </div>
          ))}
        </div>

        {/* ── Right: Detail / Empty ── */}
        <div className={`${s.rightPanel} ${!mobileDetailMode ? s.rightPanelHidden : ""}`}>
          {!selected ? (
            /* ── Empty State ── */
            <div className={s.emptyState}>
              <ChatBubbleIcon />
              <h2 className={s.emptyHeading}>Select a query to view details</h2>
              <p className={s.emptyCaption}>Click on a query from the list to read and respond</p>
            </div>
          ) : (
            /* ── Detail View ── */
            <>
              {/* Detail Header */}
              <div className={s.detailHeader}>
                <div>
                  <button className={s.backBtn} onClick={handleBack}>
                    <BackArrow /> Queries
                  </button>
                  <h2 className={s.detailProductName}>{selected.product}</h2>
                </div>
                <div className={s.detailContactArea}>
                  <p className={s.detailContactName}>
                    {selected.contactName}
                    <ClockIcon />
                    <span style={{ fontWeight: 400, color: "#9CA3AF", fontSize: "12px" }}>3 days ago</span>
                  </p>
                  <p className={s.detailStore}>{selected.storeName}</p>
                </div>
              </div>

              {/* Chat Area */}
              <div className={s.chatArea}>
                {currentMessages.map((msg, i) => (
                  <div key={i}>
                    <div className={s.chatTimestamp}>On {msg.time}</div>
                    <div className={msg.sender === "retailer" ? s.bubbleRetailer : s.bubbleWholesaler}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Bar */}
              <div className={s.replyBar}>
                <button className={s.paperclipBtn} type="button"><PaperclipIcon /></button>
                <input
                  className={s.replyInput}
                  type="text"
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                />
                <button className={s.sendBtn} type="button" onClick={handleSend}>
                  <SendIcon /> Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
