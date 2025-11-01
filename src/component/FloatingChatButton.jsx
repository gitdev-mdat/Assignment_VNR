import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send } from "lucide-react";
// IMPORT: adjust path if your component lives in a different folder
import { stages } from "../data/hanoiStages";

/**
 * FloatingChatButton + local Hanoistage search integration
 *
 * - When user gửi câu hỏi, component sẽ tìm trong `stages` và trả về
 *   các event / stage khớp (title, description, narrationParts).
 * - Nếu không tìm thấy, fallback vẫn trả demo reply.
 * - Keep UX: typing indicator, unread count, responsive.
 */

const FloatingChatButton = ({ startOpen = false }) => {
  const [isOpen, setIsOpen] = useState(startOpen);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào — tôi có thể giúp gì cho bạn?",
      isUser: false,
      time: new Date().toISOString(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const chatWindowRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const lastSeenRef = useRef(messages.length);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 640 : false
  );

  // handle responsive
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleChat = () => {
    setIsOpen((s) => {
      const next = !s;
      if (next) {
        lastSeenRef.current = messages.length;
        setUnreadCount(0);
      }
      return next;
    });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!isOpen) {
      const newCount = Math.max(0, messages.length - lastSeenRef.current);
      setUnreadCount(newCount);
    } else {
      lastSeenRef.current = messages.length;
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatWindowRef.current &&
        !chatWindowRef.current.contains(event.target) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const TypingDots = () => (
    <div style={inlineStyles.typingDotsWrap}>
      <span style={{ ...inlineStyles.dot, animationDelay: "0s" }} />
      <span style={{ ...inlineStyles.dot, animationDelay: "0.08s" }} />
      <span style={{ ...inlineStyles.dot, animationDelay: "0.16s" }} />
    </div>
  );

  // simple local search over stages/events
  const searchHanoi = (query, limit = 4) => {
    if (!query || !query.trim()) return [];
    const q = query.toLowerCase().trim();

    const results = [];

    // search events inside stages
    for (const stage of stages) {
      // check stage-level
      const stageText =
        `${stage.title} ${stage.summary} ${stage.range}`.toLowerCase();
      if (stageText.includes(q)) {
        results.push({
          type: "stage",
          stageId: stage.id,
          title: stage.title,
          snippet: stage.summary,
        });
      }

      if (!Array.isArray(stage.events)) continue;
      for (const ev of stage.events) {
        const hay = `${ev.title} ${ev.description} ${ev.detail} ${ev.year} ${
          ev.narrationParts?.join(" ") || ""
        }`.toLowerCase();
        if (hay.includes(q)) {
          results.push({
            type: "event",
            stageTitle: stage.title,
            id: ev.id,
            year: ev.year,
            title: ev.title,
            snippet:
              (ev.description && ev.description.split(".")[0]) ||
              ev.narrationParts?.[0] ||
              "",
          });
        }
      }
      if (results.length >= limit) break;
    }
    // If nothing matched, try fuzzy by checking words token-wise
    if (results.length === 0) {
      const tokens = q.split(/\s+/).filter(Boolean);
      if (tokens.length) {
        for (const stage of stages) {
          for (const ev of stage.events || []) {
            const hay = `${ev.title} ${ev.description} ${ev.detail} ${
              ev.year
            } ${ev.narrationParts?.join(" ") || ""}`.toLowerCase();
            let score = 0;
            for (const t of tokens) if (hay.includes(t)) score++;
            if (score > 0) {
              results.push({
                type: "event",
                stageTitle: stage.title,
                id: ev.id,
                year: ev.year,
                title: ev.title,
                snippet:
                  (ev.description && ev.description.split(".")[0]) ||
                  ev.narrationParts?.[0] ||
                  "",
              });
            }
            if (results.length >= limit) break;
          }
          if (results.length >= limit) break;
        }
      }
    }

    return results.slice(0, limit);
  };

  // send message + search
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const text = newMessage.trim();
    if (!text || isSending) return;

    const userMessage = {
      id: Date.now(),
      text,
      isUser: true,
      time: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsSending(true);

    // typing placeholder
    const typingId = `typing-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: typingId, text: "", isUser: false, typing: true },
    ]);

    // perform local search
    const results = searchHanoi(text, 5);

    // prepare reply
    let replyText = "";
    if (/^(danh sách|list|show stages|show stage)$/i.test(text)) {
      // show stages list
      replyText =
        "Các giai đoạn trong dữ liệu:\n" +
        stages.map((s) => `• ${s.range} — ${s.title}`).join("\n");
    } else if (results.length > 0) {
      // format results
      replyText = results
        .map((r) => {
          if (r.type === "stage") {
            return `Giai đoạn ${r.title}: ${r.snippet}`;
          }
          return `${r.year} — ${r.title}${
            r.stageTitle ? ` (${r.stageTitle})` : ""
          }${r.snippet ? `\n↳ ${r.snippet}` : ""}`;
        })
        .join("\n\n");
      replyText =
        "Mình tìm thấy 1 số tài liệu phù hợp trong data:\n\n" + replyText;
    } else {
      // fallback: demo reply
      replyText = `Bạn hỏi: "${text}". Mình search trong data nhưng không thấy kết quả rõ ràng. Bạn thử hỏi cụ thể hơn (ví dụ: "30-4-1975" hoặc "Đại hội V 1982") hoặc viết keyword ngắn.`;
    }

    // simulate typing delay based on reply length
    const simulatedDelay = 500 + Math.min(replyText.length * 8, 1600);

    setTimeout(() => {
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== typingId)
          .concat({
            id: Date.now() + 1,
            text: replyText,
            isUser: false,
            time: new Date().toISOString(),
          })
      );
      setIsSending(false);
    }, simulatedDelay);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const fmtTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div
      style={isMobile ? inlineStyles.containerMobile : inlineStyles.container}
    >
      {/* inject keyframes & small helper css via style tag so animations work inline */}
      <style>
        {`
          @keyframes pulse-inline {
            0% { transform: scale(0.9); opacity: 0.6; }
            70% { transform: scale(1.6); opacity: 0; }
            100% { transform: scale(1.8); opacity: 0; }
          }
          @keyframes bounce-inline {
            0% { transform: translateY(0); opacity: 0.9; }
            50% { transform: translateY(-4px); opacity: 1; }
            100% { transform: translateY(0); opacity: 0.9; }
          }
        `}
      </style>

      {/* chat window (appears to the right of button on desktop, above on mobile) */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          style={{
            ...inlineStyles.chatWindow,
            ...(isMobile ? inlineStyles.chatWindowMobile : {}),
          }}
        >
          {/* header */}
          <div style={inlineStyles.header}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={inlineStyles.avatarAI}>AI</div>
              <div>
                <div style={inlineStyles.headerTitle}>Trợ lý AI</div>
                <div style={inlineStyles.headerSubtitle}>
                  Connected: Hanoistage (local)
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {unreadCount > 0 && (
                <div style={inlineStyles.unreadBadge}>{unreadCount}</div>
              )}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Đóng chat"
                style={inlineStyles.iconBtn}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* messages */}
          <div style={inlineStyles.messages} aria-live="polite">
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: m.isUser ? "flex-end" : "flex-start",
                  alignItems: "flex-end",
                }}
              >
                {!m.isUser && (
                  <div style={{ marginRight: 8 }}>
                    <div style={inlineStyles.avatarAiSmall}>AI</div>
                  </div>
                )}

                <div
                  style={{
                    maxWidth: "80%",
                    textAlign: m.isUser ? "right" : "left",
                  }}
                >
                  <div
                    style={{
                      ...inlineStyles.bubble,
                      ...(m.isUser
                        ? inlineStyles.bubbleUser
                        : inlineStyles.bubbleAi),
                    }}
                  >
                    {m.typing ? <TypingDots /> : m.text}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 11,
                      color: m.isUser ? "#cbd5e1" : "#94a3b8",
                    }}
                  >
                    {m.time ? fmtTime(m.time) : ""}
                  </div>
                </div>

                {m.isUser && (
                  <div style={{ marginLeft: 8 }}>
                    <div style={inlineStyles.avatarUserSmall}>T</div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* input */}
          <form onSubmit={handleSendMessage} style={inlineStyles.inputRow}>
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Gõ câu hỏi... (ví dụ: '30-4-1975', 'Đại hội V', 'Giá - Lương - Tiền')"
              style={inlineStyles.textarea}
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              aria-label="Gửi tin nhắn"
              style={{
                ...inlineStyles.sendBtn,
                ...(isSending || !newMessage.trim()
                  ? inlineStyles.sendBtnDisabled
                  : {}),
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={toggleChat}
        aria-label={isOpen ? "Đóng chat" : "Mở chat (Trợ lý AI)"}
        style={{
          ...inlineStyles.toggle,
          backgroundColor: isOpen ? "#ef4444" : "#4f46e5",
          ...(isMobile ? inlineStyles.toggleMobile : {}),
        }}
      >
        {isOpen ? (
          <X size={20} color="#fff" />
        ) : (
          <MessageSquare size={20} color="#fff" />
        )}

        {/* AI badge */}
        {!isOpen && <span style={inlineStyles.aiBadge}>AI</span>}

        {/* unread pulse */}
        {!isOpen && unreadCount > 0 && (
          <span style={inlineStyles.unreadPulse} />
        )}
      </button>
    </div>
  );
};

/* Inline style objects (same as before) */
const inlineStyles = {
  container: {
    position: "fixed",
    left: 16,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 1200,
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    pointerEvents: "none", // children override with pointerEvents:auto
    width: 480,
  },
  containerMobile: {
    position: "fixed",
    left: 12,
    bottom: 16,
    top: "auto",
    transform: "none",
    zIndex: 1200,
    display: "flex",
    flexDirection: "row-reverse",
    gap: 8,
    pointerEvents: "none",
    width: 480,
  },
  chatWindow: {
    pointerEvents: "auto",
    minWidth: 500,
    maxHeight: "70vh",
    marginLeft: 64,
    display: "flex",
    flexDirection: "column",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 20px 50px rgba(2,6,23,0.45)",
    border: "1px solid rgba(2,6,23,0.06)",
    background: "#ffffff",
  },
  chatWindowMobile: {
    width: "92vw",
    marginLeft: 8,
    marginBottom: 8,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: "12px 14px",
    background: "linear-gradient(90deg,#0f1724,#04102a)",
    color: "#fff",
  },
  avatarAI: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg,#6366f1,#06b6d4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
  },
  headerTitle: { fontSize: 14, fontWeight: 700, color: "#fff" },
  headerSubtitle: { fontSize: 12, color: "rgba(241,245,249,0.8)" },
  unreadBadge: {
    background: "#f59e0b",
    color: "#111827",
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 8,
    fontWeight: 700,
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    padding: 6,
    borderRadius: 8,
    cursor: "pointer",
    color: "#fff",
  },
  messages: {
    padding: 12,
    overflowY: "auto",
    flex: "1 1 auto",
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), transparent)",
  },
  avatarAiSmall: {
    width: 32,
    height: 32,
    borderRadius: 999,
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#0f1724",
    fontSize: 12,
    fontWeight: 700,
  },
  avatarUserSmall: {
    width: 32,
    height: 32,
    borderRadius: 999,
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#4f46e5",
    fontSize: 12,
    fontWeight: 700,
  },
  bubble: {
    display: "inline-block",
    padding: "10px 12px",
    borderRadius: 12,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: 14,
  },
  bubbleAi: {
    background: "#f1f5f9",
    color: "#0f1724",
    borderTopLeftRadius: 6,
  },
  bubbleUser: {
    background: "#4f46e5",
    color: "#fff",
    borderTopRightRadius: 6,
  },
  inputRow: {
    padding: 10,
    borderTop: "1px solid rgba(2,6,23,0.06)",
    display: "flex",
    gap: 8,
    alignItems: "center",
    background: "#fff",
  },
  textarea: {
    flex: "1 1 auto",
    minHeight: 38,
    maxHeight: 120,
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #e6eef8",
    resize: "none",
    outline: "none",
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#4f46e5",
    color: "#fff",
  },
  sendBtnDisabled: { backgroundColor: "#d1d5db", cursor: "not-allowed" },
  toggle: {
    pointerEvents: "auto",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 52,
    height: 52,
    borderRadius: 12,
    boxShadow: "0 12px 30px rgba(15,23,42,0.18)",
    cursor: "pointer",
    transition: "transform 160ms ease, background 160ms ease",
    border: "none",
    color: "#fff",
    position: "relative",
  },
  toggleMobile: {
    width: 48,
    height: 48,
    borderRadius: 999,
  },
  aiBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    background: "#f59e0b",
    color: "#0b1220",
    fontSize: 11,
    padding: "2px 6px",
    borderRadius: 8,
    fontWeight: 700,
    pointerEvents: "none",
  },
  unreadPulse: {
    position: "absolute",
    left: -8,
    top: -8,
    width: 10,
    height: 10,
    borderRadius: 20,
    background: "rgba(99,102,241,0.28)",
    animation: "pulse-inline 1.5s infinite",
    pointerEvents: "none",
  },

  /* typing dots */
  typingDotsWrap: {
    display: "inline-flex",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    background: "#94a3b8",
    display: "inline-block",
    animation: "bounce-inline 900ms infinite",
  },
};

export default FloatingChatButton;
