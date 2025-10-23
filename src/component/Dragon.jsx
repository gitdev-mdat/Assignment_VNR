import React, { useEffect, useRef, useState, useMemo } from "react";

/**
 * Dragon component (supports multi-segment narration)
 * Props (backward-compatible):
 * - visible
 * - text: string (single segment)  ❗️or
 * - playlist: string[] (multi segments)
 * - typingSpeed (ms per char)
 * - gapMs: delay between finished segment -> next (default 1200ms) when autoAdvance = true
 * - autoAdvance: boolean (default true)
 * - onConfirm()        // called when user clicks "Sẵn sàng" (end CTA)
 * - onClose()
 * - onAllFinished()    // called automatically when all segments finished (useful to trigger modal)
 */

const Dragon = ({
  visible,
  text = "",
  playlist,
  typingSpeed = 28,
  gapMs = 1200,
  autoAdvance = true,
  onConfirm,
  onClose,
  onAllFinished,
}) => {
  // Normalize data to segments[]
  const segments = useMemo(() => {
    if (Array.isArray(playlist) && playlist.length)
      return playlist.filter(Boolean);
    if (typeof text === "string" && text.trim().length) return [text.trim()];
    return [];
  }, [playlist, text]);

  const [segmentIdx, setSegmentIdx] = useState(0);
  const [display, setDisplay] = useState("");
  const [finishedTyping, setFinishedTyping] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const idxRef = useRef(0);
  const typingTimerRef = useRef(null);
  const autoTimerRef = useRef(null);

  const current = segments[segmentIdx] || "";

  const resetTyping = () => {
    setDisplay("");
    setFinishedTyping(false);
    idxRef.current = 0;
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  };

  const cleanupAll = () => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!visible) {
      cleanupAll();
      setDisplay("");
      setFinishedTyping(false);
      setAllDone(false);
      setSegmentIdx(0);
      return;
    }
    // Start typing for current segment
    resetTyping();

    typingTimerRef.current = setInterval(() => {
      idxRef.current += 1;
      setDisplay(current.slice(0, idxRef.current));
      if (idxRef.current >= (current?.length || 0)) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
        setTimeout(() => setFinishedTyping(true), 100);
      }
    }, typingSpeed);

    return () => cleanupAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, segmentIdx, current, typingSpeed]);

  // Auto advance to next segment when finishedTyping=true (if autoAdvance)
  useEffect(() => {
    if (!visible) return;
    if (!finishedTyping) return;

    const isLast = segmentIdx >= segments.length - 1;
    if (isLast) {
      setAllDone(true);
      // gọi callback khi tất cả xong
      if (typeof onAllFinished === "function") onAllFinished();
      return;
    }

    if (autoAdvance) {
      autoTimerRef.current = setTimeout(() => {
        setSegmentIdx((i) => i + 1);
      }, gapMs);
    }

    return () => {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishedTyping, visible]);

  if (!visible) return null;

  const skipTyping = () => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setDisplay(current);
    setFinishedTyping(true);
  };

  const goNext = () => {
    const isLast = segmentIdx >= segments.length - 1;
    if (isLast) return;
    setSegmentIdx((i) => i + 1);
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 120,
        pointerEvents: "none",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(1200px 600px at 50% 90%, rgba(2,6,23,0.36), rgba(2,6,23,0.08) 45%, transparent 70%)",
      }}
      aria-hidden={!visible}
    >
      <div
        className="dragon-wrap"
        style={{
          pointerEvents: "auto",
          display: "flex",
          gap: 16,
          alignItems: "flex-end",
          transform: "translateY(-10px)",
          animation: "dragonEnter 520ms cubic-bezier(.16,.84,.44,1) both",
        }}
      >
        {/* Dragon orb */}
        <div
          className="dragon-orb"
          aria-hidden
          style={{
            position: "relative",
            width: 132,
            height: 132,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background:
              "radial-gradient(70% 70% at 40% 30%, #fff6, #fff0), conic-gradient(from 210deg, #ffedd5, #ffd966, #ff8a4b, #fb7185, #a78bfa, #60a5fa, #34d399, #ffd966)",
            boxShadow:
              "0 18px 50px rgba(251,113,133,0.22), 0 0 80px 20px rgba(255,138,75,0.18) inset",
            overflow: "visible",
            isolation: "isolate",
            animation: "dragonFloat 2400ms ease-in-out infinite",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              background:
                "radial-gradient(60% 60% at 50% 40%, rgba(255,216,102,0.4), transparent 70%)",
              filter: "blur(12px)",
              zIndex: -1,
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              fontSize: 58,
              transform: "translateY(3px)",
              filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.25))",
              userSelect: "none",
            }}
          >
            🐉
          </span>
          <span className="dragon-flame" />
          <span className="spark s1" />
          <span className="spark s2" />
          <span className="spark s3" />
          <span className="spark s4" />
        </div>

        {/* Speech bubble */}
        <div
          className="dragon-bubble"
          style={{
            minWidth: 380,
            maxWidth: "50vw",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,250,0.95))",
            borderRadius: 16,
            padding: "14px 16px 12px 16px",
            boxShadow:
              "0 14px 48px rgba(2,6,23,0.22), 0 1px 0 rgba(255,255,255,0.6) inset",
            border: "1px solid rgba(2,6,23,0.06)",
            position: "relative",
            backdropFilter: "saturate(1.2) blur(2px)",
          }}
        >
          <span
            aria-hidden
            style={{
              content: '""',
              position: "absolute",
              inset: 0,
              borderRadius: 16,
              padding: 1,
              background:
                "linear-gradient(90deg, rgba(255,217,102,0.9), rgba(255,138,75,0.9))",
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              pointerEvents: "none",
            }}
          />

          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontWeight: 850,
                color: "#0b1220",
                letterSpacing: 0.2,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                className="title-dot"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    "conic-gradient(from 0deg, #fb7185, #ffd966, #34d399, #60a5fa, #a78bfa, #fb7185)",
                  boxShadow: "0 0 10px rgba(255,138,75,0.7)",
                  animation: "dotPulse 1.8s ease-in-out infinite",
                }}
              />
              Rồng dẫn chuyện
            </div>

            <button
              onClick={() => {
                cleanupAll();
                setDisplay(current);
                setFinishedTyping(true);
                onClose?.();
              }}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontWeight: 700,
                color: "#64748b",
                padding: 6,
                borderRadius: 10,
              }}
              aria-label="Đóng"
              title="Đóng"
            >
              ✕
            </button>
          </div>

          {/* Content typing */}
          <div
            style={{
              color: "#344256",
              fontSize: 15.5,
              lineHeight: 1.6,
              minHeight: 72,
              whiteSpace: "pre-wrap",
            }}
          >
            {display}
            <span className="caret">
              {idxRef.current < (current?.length || 0) ? "▌" : ""}
            </span>
          </div>

          {/* Footer controls */}
          <div
            style={{
              marginTop: 10,
              display: "flex",
              gap: 8,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Progress indicator */}
            <div style={{ fontSize: 12.5, color: "#6b7280" }}>
              {segments.length > 1 ? (
                <span>
                  Đoạn {segmentIdx + 1}/{segments.length}
                </span>
              ) : (
                <span>&nbsp;</span>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {!finishedTyping && (
                <button
                  onClick={skipTyping}
                  className="btn-skip"
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(2,6,23,0.08)",
                    background: "white",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Hiển thị nhanh
                </button>
              )}

              {/* If finished but not last segment and autoAdvance=false => show "Tiếp tục" */}
              {finishedTyping && !allDone && !autoAdvance && (
                <button
                  onClick={goNext}
                  className="btn-next"
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(2,6,23,0.08)",
                    background: "white",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  Tiếp tục
                </button>
              )}

              {/* If all done -> "Sẵn sàng" */}
              {finishedTyping && allDone && (
                <button
                  onClick={() => onConfirm?.()}
                  className="btn-ready"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 850,
                    background: "linear-gradient(90deg,#ffd966,#ff8a4b)",
                    color: "#0b1220",
                    boxShadow:
                      "0 10px 30px rgba(255,138,75,0.35), 0 1px 0 rgba(255,255,255,0.7) inset",
                  }}
                >
                  Sẵn sàng
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .dragon-orb, .spark, .title-dot, .btn-ready { animation: none !important; }
        }
        @keyframes dragonEnter {
          0% { opacity: 0; transform: translateY(10px) scale(.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dragonFloat {
          0% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0); }
        }
        .dragon-flame {
          position: absolute; right: -14px; top: 50%;
          width: 34px; height: 18px;
          transform: translateY(-50%) rotate(-8deg);
          background: radial-gradient(60% 60% at 0% 50%, #ffd966, transparent 70%),
                      radial-gradient(60% 60% at 30% 50%, #ff8a4b, transparent 70%),
                      radial-gradient(60% 60% at 60% 50%, #fb7185, transparent 70%);
          filter: blur(0.8px) drop-shadow(0 0 10px rgba(255,138,75,0.6));
          border-top-right-radius: 100px 50px; border-bottom-right-radius: 100px 50px;
          opacity: .9; animation: flame 900ms ease-in-out infinite;
        }
        @keyframes flame {
          0%,100% { transform: translateY(-50%) rotate(-8deg) scaleX(1); opacity: .85; }
          50% { transform: translateY(-50%) rotate(-4deg) scaleX(1.12); opacity: 1; }
        }
        .spark {
          position: absolute; width: 6px; height: 6px; border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #fff, #ffd966 60%, transparent 70%);
          box-shadow: 0 0 12px rgba(255, 217, 102, .8); opacity: .9;
        }
        .spark.s1 { left: -10px; top: 14px; animation: sparkle 2.4s linear infinite; }
        .spark.s2 { left: 6px; bottom: -6px; animation: sparkle 2.1s 200ms linear infinite; }
        .spark.s3 { right: -8px; top: -4px; animation: sparkle 2.6s 120ms linear infinite; }
        .spark.s4 { right: -12px; bottom: 10px; animation: sparkle 2.2s 60ms linear infinite; }
        @keyframes sparkle {
          0% { transform: translate(0,0) scale(.8); opacity: .9; }
          50% { transform: translate(4px,-8px) scale(1); opacity: 1; }
          100% { transform: translate(8px,-16px) scale(.8); opacity: 0; }
        }
        @keyframes dotPulse {
          0%,100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.2); filter: brightness(1.2); }
        }
        .caret {
          opacity: 0.75; margin-left: 2px;
          background: linear-gradient(90deg, #94a3b8, #0ea5e9, #94a3b8);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: caretBlink 1s steps(2, start) infinite;
        }
        @keyframes caretBlink { 0%,49% { opacity: 0; } 50%,100% { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Dragon;
