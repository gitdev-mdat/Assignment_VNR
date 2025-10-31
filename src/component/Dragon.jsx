import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/Dragon.module.css";

const DEFAULT_TYPING_MS = 28;
const DEFAULT_GAP_MS = 1200;

const Dragon = ({
  visible,
  text = "",
  playlist,
  typingSpeed = DEFAULT_TYPING_MS,
  gapMs = DEFAULT_GAP_MS,
  autoAdvance = true,
  onConfirm,
  onClose,
  onAllFinished,
}) => {
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

  const cleanupAll = () => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    typingTimerRef.current = null;
    autoTimerRef.current = null;
  };

  const resetTyping = () => {
    setDisplay("");
    setFinishedTyping(false);
    idxRef.current = 0;
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
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

    resetTyping();
    if (!current) {
      setFinishedTyping(true);
      return;
    }

    typingTimerRef.current = setInterval(() => {
      idxRef.current += 1;
      setDisplay(current.slice(0, idxRef.current));
      if (idxRef.current >= (current?.length || 0)) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
        setTimeout(() => setFinishedTyping(true), 80);
      }
    }, typingSpeed);

    return () => cleanupAll();
  }, [visible, segmentIdx, current, typingSpeed]);

  // useEffect cập nhật segment hoặc kết thúc tất cả
  useEffect(() => {
    if (!visible || !finishedTyping) return;

    const isLast = segmentIdx >= segments.length - 1;

    if (isLast) {
      setAllDone(true); // đảm bảo nút Sẵn sàng hiển thị
      onAllFinished?.();
    } else if (autoAdvance) {
      autoTimerRef.current = setTimeout(
        () => setSegmentIdx((i) => i + 1),
        gapMs
      );
    }

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [
    finishedTyping,
    visible,
    segmentIdx,
    segments.length,
    autoAdvance,
    gapMs,
    onAllFinished,
  ]);

  const skipTyping = () => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setDisplay(current);
    setFinishedTyping(true);
  };

  const goNext = () => {
    if (segmentIdx >= segments.length - 1) return;
    setSegmentIdx((i) => i + 1);
  };

  if (!visible) return null;

  return (
    <div className={styles.centerOverlay} style={{ pointerEvents: "auto" }}>
      <div className={styles.dragonWrap}>
        <div className={styles.dragonOrb}>
          <span className={styles.orbGlow} />
          <span className={styles.orbEmoji}>🐉</span>
          <span className={`${styles.spark} ${styles.s1}`} />
          <span className={`${styles.spark} ${styles.s2}`} />
          <span className={`${styles.spark} ${styles.s3}`} />
        </div>

        <div
          className={`${styles.dragonBubble} ${styles.bubbleAppear}`}
          style={{ fontSize: "1.1rem" }}
        >
          <div className={styles.bubbleBorder} />
          <div className={styles.bubbleHeader}>
            <div className={styles.bubbleTitle}>Rồng dẫn chuyện</div>
            <button className={styles.bubbleClose} onClick={onClose}>
              ✕
            </button>
          </div>

          <div className={styles.bubbleBody}>
            <div className={styles.bubbleText}>
              {display}
              <span className={styles.caret}>
                {idxRef.current < (current?.length || 0) ? "▌" : ""}
              </span>
            </div>
          </div>

          <div className={styles.bubbleFooter}>
            <div className={styles.counter}>
              {segments.length > 1
                ? `Đoạn ${segmentIdx + 1}/${segments.length}`
                : ""}
            </div>
            <div className={styles.actions}>
              {!finishedTyping && (
                <button className={styles.smallBtn} onClick={skipTyping}>
                  Hiển thị nhanh
                </button>
              )}
              {finishedTyping && !allDone && !autoAdvance && (
                <button className={styles.smallBtn} onClick={goNext}>
                  Tiếp tục
                </button>
              )}
              {finishedTyping && allDone && (
                <button className={styles.primaryBtn} onClick={onConfirm}>
                  Sẵn sàng
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dragon;
