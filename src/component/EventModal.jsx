// src/components/EventModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MapPin,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Link as LinkIcon,
  Copy,
} from "lucide-react";

const DEFAULT_VARS = {
  "--bg-start": "#07102a",
  "--bg-end": "#0b2740",
  "--accent-from": "#ffd966",
  "--accent-to": "#ff8a4b",
  "--glass": "rgba(255,255,255,0.88)",
};

const splitSentences = (text) =>
  (text || "")
    .split(/(?<=[.!?])\s+/g)
    .map((s) => s.trim())
    .filter(Boolean);

const fallbackSVG = (title = "Sự kiện") =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='700'><defs><linearGradient id='g' x1='0' x2='1'><stop offset='0' stop-color='#07102a'/><stop offset='1' stop-color='#08243b'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)' rx='18' /><text x='60' y='110' font-size='40' fill='#ffd966' font-family='Arial, sans-serif' font-weight='700'>${String(
      title
    ).replace(/&/g, "&amp;")}</text></svg>`
  )}`;

export default function EventModal({
  show,
  onClose,
  events = [],
  startIndex = 0,
  onIndexChange,
}) {
  const total = events.length;
  const [index, setIndex] = useState(startIndex || 0);
  const [playing, setPlaying] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [toast, setToast] = useState(null);
  const [thumbTilt, setThumbTilt] = useState({ x: 0, y: 0 });
  const autoplayRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => setIndex(startIndex || 0), [startIndex]);

  // focus trap nhẹ
  useEffect(() => {
    if (containerRef.current) containerRef.current.focus();
  }, []);

  // phím tắt
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total]);

  // autoplay chuyển mốc (UI Play/Pause ở header)
  useEffect(() => {
    if (!playing) {
      clearInterval(autoplayRef.current);
      return;
    }
    autoplayRef.current = setInterval(() => {
      setIndex((i) => {
        const ni = Math.min(i + 1, total - 1);
        onIndexChange?.(ni);
        if (ni === total - 1) setPlaying(false);
        return ni;
      });
    }, 4200);
    return () => clearInterval(autoplayRef.current);
  }, [playing, total, onIndexChange]);

  // reveal bullets dần khi đổi mốc
  useEffect(() => {
    setRevealed(0);
    const s = splitSentences(events[index]?.description || "");
    const timers = s.map((_, i) =>
      setTimeout(() => setRevealed((r) => Math.max(r, i + 1)), 200 + i * 200)
    );
    return () => timers.forEach((t) => clearTimeout(t));
  }, [index, events]);

  // thông báo parent
  useEffect(() => onIndexChange?.(index), [index, onIndexChange]);

  if (!show) return null;

  const ev = events[index] || {};
  const bullets = ev.bullets?.length
    ? ev.bullets
    : splitSentences(ev.description || "");

  const goPrev = () => {
    setPlaying(false);
    setIndex((i) => Math.max(0, i - 1));
  };
  const goNext = () => {
    setPlaying(false);
    setIndex((i) => Math.min(total - 1, i + 1));
  };

  const copyShare = async () => {
    try {
      const url = new URL(window.location.href);
      url.hash = `event-${index}`;
      await navigator.clipboard.writeText(url.toString());
      showToast("Đã sao chép liên kết");
    } catch {
      showToast("Không copy được — cho phép clipboard?");
    }
  };

  const showToast = (txt) => {
    setToast(txt);
    setTimeout(() => setToast(null), 1400);
  };

  const onThumbMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setThumbTilt({ x: x * 8, y: y * -6 });
  };
  const onThumbLeave = () => setThumbTilt({ x: 0, y: 0 });

  const vars = { ...DEFAULT_VARS };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      ref={containerRef}
      tabIndex={-1}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background:
          "linear-gradient(180deg, rgba(2,6,23,0.5), rgba(2,6,23,0.72))",
        backdropFilter: "blur(6px) brightness(0.92)",
        ...vars,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(920px, 96%)",
          maxHeight: "84vh",
          borderRadius: 16,
          overflow: "hidden",
          background: "linear-gradient(180deg,#fff,#fbfdff)",
          boxShadow: "0 30px 80px rgba(2,6,23,0.6)",
          border: "1px solid rgba(2,6,23,0.06)",
          display: "flex",
          flexDirection: "column",
          transformOrigin: "center",
          animation: "modalIn 360ms cubic-bezier(.22,1,.36,1)",
          position: "relative",
        }}
        aria-label={`Modal sự kiện ${index + 1} trên ${total}`}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            gap: 12,
            background: `linear-gradient(90deg, ${vars["--bg-start"]}, ${vars["--bg-end"]})`,
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, rgba(255,217,102,0.12), rgba(255,140,75,0.06))",
                boxShadow: "0 8px 22px rgba(2,6,23,0.18)",
                fontSize: 22,
              }}
            >
              🏛️
            </div>
            <div>
              <div
                style={{ fontSize: 17, fontWeight: 900, letterSpacing: 0.1 }}
              >
                {ev.title}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginTop: 6,
                  opacity: 0.95,
                }}
              >
                <MapPin size={14} />{" "}
                <span style={{ fontSize: 13 }}>
                  {ev.place || "Hà Nội, Việt Nam"}
                </span>
                <span style={{ opacity: 0.55 }}>・</span>
                <span style={{ fontSize: 13 }}>{ev.year}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={copyShare}
              title="Copy link"
              aria-label="Copy link"
              style={ICON_BTN}
            >
              <LinkIcon size={16} />
            </button>

            <button
              onClick={() => setPlaying((p) => !p)}
              title={playing ? "Pause autoplay" : "Autoplay"}
              aria-pressed={playing}
              style={{
                ...ICON_BTN,
                background: playing
                  ? "linear-gradient(90deg,#ffd966,#ff8a4b)"
                  : ICON_BTN.background,
                color: playing ? "#07102a" : ICON_BTN.color,
                fontWeight: 800,
              }}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>

            <button onClick={onClose} aria-label="Close modal" style={ICON_BTN}>
              <X size={18} />
            </button>
          </div>

          {/* accent shape */}
          <svg
            viewBox="0 0 200 50"
            style={{
              position: "absolute",
              right: -20,
              bottom: -10,
              opacity: 0.12,
            }}
          >
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0" stopColor="#ffd966" />
                <stop offset="1" stopColor="#ff8a4b" />
              </linearGradient>
            </defs>
            <path
              d="M0 30 Q40 0 80 30 T200 30 L200 60 L0 60 Z"
              fill="url(#g1)"
            />
          </svg>
        </div>

        {/* progress */}
        <div style={{ height: 6, background: "rgba(11,20,30,0.04)" }}>
          <div
            style={{
              width: `${((index + 1) / Math.max(1, total)) * 100}%`,
              height: 6,
              background: "linear-gradient(90deg,#ffd966,#ff8a4b)",
              transition: "width 420ms cubic-bezier(.2,1,.3,1)",
            }}
          />
        </div>

        {/* body */}
        <div
          style={{
            display: "flex",
            gap: 0,
            minHeight: 220,
            maxHeight: "64vh",
            overflow: "hidden",
          }}
        >
          {/* timeline */}
          <div
            style={{
              width: 120,
              padding: 14,
              borderRight: "1px solid rgba(2,6,23,0.03)",
              overflowY: "auto",
            }}
          >
            {events.map((e, i) => {
              const active = i === index;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setPlaying(false);
                    setIndex(i);
                    onIndexChange?.(i);
                  }}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    padding: "8px 6px",
                    width: "100%",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: active
                      ? "linear-gradient(90deg,#fff,#fbfbfe)"
                      : "transparent",
                    border: "none",
                    marginBottom: 8,
                    boxShadow: active ? "0 8px 22px rgba(2,6,23,0.06)" : "none",
                    textAlign: "left",
                  }}
                  aria-current={active ? "true" : undefined}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 999,
                      background: active
                        ? "var(--accent-from)"
                        : "rgba(7,12,20,0.12)",
                      boxShadow: active
                        ? "0 6px 16px rgba(255,217,102,0.12)"
                        : "none",
                      border: active
                        ? "2px solid rgba(7,12,20,0.06)"
                        : "1px solid rgba(2,6,23,0.03)",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: active ? 800 : 600,
                      color: active ? "#07102a" : "rgba(11,20,30,0.68)",
                    }}
                  >
                    {e.year}
                  </div>
                </button>
              );
            })}
          </div>

          {/* main */}
          <div
            style={{
              display: "flex",
              gap: 16,
              padding: 16,
              flex: 1,
              overflowY: "auto",
            }}
          >
            {/* image */}
            <div
              style={{
                minWidth: 320,
                height: 220,
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 12px 40px rgba(2,6,23,0.12)",
                transform: `rotateX(${thumbTilt.y}deg) rotateY(${thumbTilt.x}deg) translateZ(0)`,
                transition: "transform 220ms ease",
                willChange: "transform",
                position: "relative",
              }}
              onMouseMove={onThumbMove}
              onMouseLeave={onThumbLeave}
            >
              <img
                src={ev.image || fallbackSVG(ev.title)}
                alt={ev.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transform: "translateZ(0)",
                }}
                draggable={false}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  left: 12,
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: "rgba(0,0,0,0.36)",
                  color: "#fff",
                  fontWeight: 700,
                }}
              >
                {ev.title}
              </div>
            </div>

            {/* content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    color: "#0b1220",
                  }}
                >
                  <Calendar size={14} color="#c2410c" />{" "}
                  <strong style={{ fontWeight: 800 }}>{ev.year}</strong>
                </div>
                <div style={{ color: "#64748b", fontSize: 13 }}>
                  {ev.source ? (
                    <a href={ev.source} target="_blank" rel="noreferrer">
                      Nguồn
                    </a>
                  ) : (
                    "Nguồn: tài liệu lịch sử"
                  )}
                </div>
              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#07102a",
                  lineHeight: 1.18,
                }}
              >
                {ev.title}
              </h3>

              <p
                style={{
                  marginTop: 10,
                  color: "#334155",
                  fontSize: 15,
                  lineHeight: 1.6,
                }}
              >
                {ev.description}
              </p>

              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    padding: 8,
                    background: "linear-gradient(180deg,#fff7e6,#fff3d6)",
                    borderRadius: 10,
                    border: "1px solid rgba(255,206,84,0.12)",
                  }}
                >
                  <strong style={{ color: "#b45309" }}>Did you know?</strong>
                </div>
                <div style={{ color: "#475569", fontSize: 14 }}>
                  {ev.fact ||
                    "Một mốc quan trọng giúp hoàn thiện bộ máy nhà nước và mở đường cho chính sách sau này."}
                </div>
              </div>

              {/* bullets */}
              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {bullets.map((b, i) => {
                  const active = i < revealed;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        if (i < revealed) setRevealed(i);
                        else setRevealed(i + 1);
                      }}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: active
                          ? "linear-gradient(90deg,rgba(255,250,235,0.9),rgba(255,249,240,0.95))"
                          : "#fff",
                        border: active
                          ? `1px solid rgba(255,196,60,0.12)`
                          : "1px solid rgba(2,6,23,0.04)",
                        boxShadow: active
                          ? "0 10px 30px rgba(255,170,60,0.06)"
                          : "none",
                        cursor: "pointer",
                        transition: "all 240ms cubic-bezier(.2,1,.3,1)",
                        opacity: active ? 1 : 0.86,
                      }}
                    >
                      <div
                        style={{
                          minWidth: 36,
                          height: 36,
                          borderRadius: 10,
                          background: active
                            ? "linear-gradient(90deg,#ffd966,#ff8a4b)"
                            : "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          color: active ? "#07102a" : "#475569",
                        }}
                      >
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#07102a",
                            marginBottom: 6,
                          }}
                        >
                          {b}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* footer */}
              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <button
                  onClick={copyShare}
                  style={{
                    ...PLAY_BTN,
                    background: "linear-gradient(90deg,#ffd966,#ff8a4b)",
                    color: "#07102a",
                  }}
                >
                  <Copy size={14} />{" "}
                  <span style={{ marginLeft: 8, fontWeight: 800 }}>
                    Copy link
                  </span>
                </button>

                <div style={{ flex: 1 }} />

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={goPrev} style={ICON_SMALL}>
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setPlaying((p) => !p)}
                    style={ICON_SMALL}
                  >
                    {playing ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button onClick={goNext} style={ICON_SMALL}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* toast */}
        {toast && (
          <div
            style={{
              position: "fixed",
              right: 24,
              bottom: 28,
              padding: "10px 14px",
              borderRadius: 10,
              background: "linear-gradient(90deg,#ffd966,#ff8a4b)",
              color: "#07102a",
              fontWeight: 800,
              boxShadow: "0 14px 40px rgba(2,6,23,0.18)",
              zIndex: 999999,
            }}
          >
            {toast}
          </div>
        )}

        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: translateY(8px) scale(.995); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @media (max-width: 900px) { .modal-stack { flex-direction: column; } }
        `}</style>
      </div>
    </div>,
    document.body
  );
}

/* shared style objects */
const ICON_BTN = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.06)",
  padding: 8,
  borderRadius: 10,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#fff",
};
const PLAY_BTN = {
  padding: "8px 12px",
  borderRadius: 10,
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  border: "none",
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(2,6,23,0.06)",
};
const ICON_SMALL = {
  width: 44,
  height: 44,
  borderRadius: 10,
  background: "linear-gradient(180deg,#fff,#f8fafc)",
  border: "1px solid rgba(2,6,23,0.06)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(2,6,23,0.06)",
};
