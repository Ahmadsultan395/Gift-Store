"use client";
import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  ChevronDown,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useWebsiteStore } from "@/stores/useWebsiteStore";

// ── Quick reply options ─────────────────────────────────────────────
const QUICK_REPLIES = [
  { label: "🚚 Delivery Time", text: "Delivery kitne din mein hoti hai?" },
  { label: "💳 Payment", text: "Payment ke kya options hain?" },
  { label: "📦 Track Order", text: "Main apna order kaise track karun?" },
  { label: "🔄 Return", text: "Return policy kya hai?" },
  { label: "📞 Contact", text: "Store ka contact number kya hai?" },
  { label: "🏷️ Offers", text: "Koi discount ya special offer hai?" },
  {
    label: "🛒 Order Kaise Karein?",
    text: "Website se order kaise place karun?",
  },
  { label: "📍 Store Address", text: "Store ka address kya hai?" },
  { label: "💸 Delivery Charges", text: "Delivery charges kitne hain?" },
  { label: "🚀 Free Delivery", text: "Free delivery kis order par milti hai?" },
  { label: "🏦 Bank Transfer", text: "Bank transfer available hai?" },
  { label: "💵 Cash on Delivery", text: "Cash on Delivery available hai?" },
  { label: "📦 Product Available?", text: "Ye product stock mein hai?" },
  { label: "❌ Order Cancel", text: "Order cancel kaise kar sakta hoon?" },
  { label: "🔁 Exchange", text: "Product exchange ho sakta hai?" },
  { label: "📄 Invoice", text: "Invoice kaise milega?" },
  { label: "🧾 Bulk Order", text: "Bulk order par discount milta hai?" },
  { label: "🌿 Organic Products", text: "Organic products available hain?" },
  { label: "🧂 Best Selling", text: "Best selling products kaun se hain?" },
  { label: "⭐ New Arrivals", text: "New products kaun se aaye hain?" },
  { label: "📅 Delivery Today", text: "Kya same day delivery available hai?" },
  { label: "🌍 Other Cities", text: "Doosre cities mein delivery hoti hai?" },
  { label: "📲 WhatsApp", text: "WhatsApp support available hai?" },
  { label: "🕒 Working Hours", text: "Store timing kya hai?" },
  { label: "🎁 Gift Packing", text: "Gift packing available hai?" },
  { label: "🧺 Categories", text: "Store mein kaun kaun si categories hain?" },
  { label: "🥜 Dry Fruits", text: "Dry fruits available hain?" },
  { label: "🌾 Spices", text: "Masalay aur herbs available hain?" },
  { label: "📋 Minimum Order", text: "Minimum order amount kitna hai?" },
  {
    label: "🤝 Customer Support",
    text: "Customer support se kaise baat karun?",
  },
];

// ── Typing indicator ────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ── Single message bubble ───────────────────────────────────────────
function MessageBubble({ msg }) {
  const isBot = msg.role === "bot";
  return (
    <div className={`flex gap-2 ${isBot ? "justify-start" : "justify-end"}`}>
      {isBot && (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-white mt-1">
          <Bot size={14} />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm
          ${
            isBot
              ? "rounded-tl-sm bg-white text-slate-800 border border-slate-100"
              : "rounded-tr-sm bg-primary-500 text-white"
          }`}
      >
        {msg.text}
        <p
          className={`mt-1 text-[10px] ${isBot ? "text-slate-400" : "text-primary-200"}`}
        >
          {msg.time}
        </p>
      </div>
      {!isBot && (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 mt-1">
          <User size={14} className="text-slate-600" />
        </div>
      )}
    </div>
  );
}

// ── Main Chat Widget ────────────────────────────────────────────────
export default function ChatWidget() {
  const { storeSettings, fetchStoreSettings } = useWebsiteStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const storeName = storeSettings?.storeName || "Store";

  // Load store settings once (storeName used in header/welcome/footer below)
  useEffect(() => {
    fetchStoreSettings();
  }, [fetchStoreSettings]);

  // Welcome message on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "bot",
          text: `Assalam o Alaikum! 👋 Main ${storeName} ka AI assistant hoon.\n\nMain aapki help kar sakta hoon:\n• Product prices & availability\n• Order tracking & delivery\n• Return & payment info\n• Aur bhi kuch bhi!\n\nKya poochna chahenge? 😊`,
          time: nowTime(),
        },
      ]);
    }
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, storeName]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function nowTime() {
    return new Date().toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function sendMessage(text) {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;

    setInput("");
    setShowQuick(false);

    const userMsg = { role: "user", text: trimmed, time: nowTime() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build history for context (last 10 messages)
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });
      const data = await res.json();
      const reply =
        data.data?.reply || "Koi jawab nahi mila. Dobara try karein! 🙏";

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: reply, time: nowTime() },
      ]);

      if (!open) setUnread((u) => u + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Connection issue! Please dobara try karein ya store pe call karein 📞",
          time: nowTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([]);
    setShowQuick(true);
    setTimeout(() => {
      setMessages([
        {
          role: "bot",
          text: "Chat reset ho gaya! Main phir se ready hoon 😊 Kya poochna chahenge?",
          time: nowTime(),
        },
      ]);
    }, 100);
  }

  return (
    <>
      {/* ── Floating Button ──────────────────────────────────── */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={`fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300
          ${
            open
              ? "bg-slate-700 rotate-90 scale-90"
              : "bg-primary-600 hover:bg-primary-700/90 hover:scale-110"
          }`}
        aria-label="Chat with us"
      >
        {open ? (
          <X size={22} className="text-white" />
        ) : (
          <MessageCircle size={24} className="text-white" />
        )}
        {!open && unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
        {/* Pulse ring when closed */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-30" />
        )}
      </button>

      {/* ── Chat Window ─────────────────────────────────────── */}
      <div
        className={`
        fixed bottom-24 right-5 z-50 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl
        transition-all duration-300 origin-bottom-right
        w-[350px] sm:w-[380px]
        ${open ? "scale-100 opacity-100 pointer-events-auto" : "scale-75 opacity-0 pointer-events-none"}
      `}
        style={{ maxHeight: "calc(100vh - 140px)", height: "520px" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 bg-primary-500 px-4 py-3 flex-shrink-0">
          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
            <Bot size={20} className="text-white" />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-primary-500 bg-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate font-bold text-white leading-tight">
              {storeName} AI Assistant
            </p>
            <p className="text-xs text-primary-100 flex items-center gap-1">
              <Sparkles size={10} /> Online — hamesha ready!
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={clearChat}
              className="rounded-lg px-2 py-1 text-[10px] font-medium text-white/70 hover:bg-white/20 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/20 transition-colors"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-3 space-y-3">
          {/* Quick replies — shown at top if no convo yet */}
          {showQuick && messages.length <= 1 && (
            <div className="pb-1">
              <p className="mb-2 text-center text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                Quick Questions
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_REPLIES.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(qr.text)}
                    className="rounded-full border border-primary-200 bg-white px-3 py-1.5 text-xs font-medium text-primary-500 hover:bg-primary-50 hover:border-primary-400 transition-colors shadow-sm"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
                <Bot size={14} />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-white border border-slate-100 shadow-sm">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick replies row — always visible at bottom */}
        {messages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-white px-3 py-2 flex-shrink-0 scrollbar-hide">
            {QUICK_REPLIES.map((qr, i) => (
              <button
                key={i}
                onClick={() => sendMessage(qr.text)}
                className="flex-shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-600 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-500 transition-colors"
              >
                {qr.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex items-end gap-2 border-t border-slate-100 bg-white px-3 py-3 flex-shrink-0">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Apna sawaal likhein..."
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-primary-400 focus:bg-white transition-colors disabled:opacity-50"
            style={{ maxHeight: "100px", overflowY: "auto" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 100) + "px";
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white hover:bg-primary-500/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="bg-white px-3 pb-2 text-center flex-shrink-0">
          <p className="text-[9px] text-slate-300">
            Powered by AI • {storeName}
          </p>
        </div>
      </div>
    </>
  );
}
