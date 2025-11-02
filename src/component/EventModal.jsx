// src/components/EventModal.jsx  (updated)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Play, Image as ImageIcon } from "lucide-react";
import styles from "../styles/EventModal.module.css";

/**
 * EventModal
 *
 * Props:
 * - show (bool)
 * - onClose ()
 * - events (array)
 * - startIndex (number)
 * - onIndexChange
 * - onRequestGuide (string|array)
 * - onRequestStageAdvance ()
 * - onRequestStageBack ()
 * - bottomOffset
 */

export default function EventModal({
  show = false,
  onClose,
  events = [],
  startIndex = 0,
  onIndexChange,
  onRequestGuide,
  onRequestStageAdvance,
  onRequestStageBack,
  bottomOffset = 20,
}) {
  const listRef = useRef(null);
  const sheetRef = useRef(null);

  const [idx, setIdx] = useState(startIndex || 0);
  const [panelTab, setPanelTab] = useState("detail");
  const [previewMedia, setPreviewMedia] = useState(null);

  // suppression + timing refs
  const suppressObserverRef = useRef(false);
  const suppressTimeoutRef = useRef(null);

  // IO / rAF / bookkeeping refs
  const rafRef = useRef(null);
  const lastObservedRef = useRef(-1);
  const ioRef = useRef(null);
  const ioDebounceTimeoutRef = useRef(null);

  useEffect(() => setIdx(startIndex || 0), [startIndex]);

  // when idx changes programmatically, scroll item into view.
  // suppress observer to avoid feedback loop.
  useEffect(() => {
    if (!show || !listRef.current) return;
    const container = listRef.current;
    const node = container.children[idx];
    if (node) {
      // suppress IO while programmatic scrolling
      suppressObserverRef.current = true;
      if (suppressTimeoutRef.current) {
        clearTimeout(suppressTimeoutRef.current);
        suppressTimeoutRef.current = null;
      }

      // center the item smoothly
      // prefer scrollIntoView with block: 'center' (browser handles smooth animation)
      node.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });

      // re-enable observer after animation estimated time
      suppressTimeoutRef.current = setTimeout(() => {
        suppressObserverRef.current = false;
        suppressTimeoutRef.current = null;
      }, 420); // tweak if needed

      onIndexChange?.(idx);
      setPanelTab("detail");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, show]);

  // IntersectionObserver to update idx while user scrolls / gestures.
  useEffect(() => {
    if (!show || !listRef.current) return;
    const container = listRef.current;
    const items = Array.from(container.children || []);
    if (!items.length) return;

    // cleanup existing observer if any
    if (ioRef.current) {
      ioRef.current.disconnect();
      ioRef.current = null;
    }

    // IO callback: pick the most intersecting entry, but throttle with rAF + small debounce
    const cb = (entries) => {
      if (suppressObserverRef.current) return;
      // find entry with largest intersectionRatio
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const i = items.indexOf(visible.target);
      if (i === -1) return;

      // debounce tiny spikes
      if (lastObservedRef.current === i) return; // same index, skip

      // clear previous debounce
      if (ioDebounceTimeoutRef.current) {
        clearTimeout(ioDebounceTimeoutRef.current);
        ioDebounceTimeoutRef.current = null;
      }

      // schedule update in next animation frame
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        // small guard: if user is interacting we may want to wait a bit more
        // but most of time rAF is enough to avoid jank
        lastObservedRef.current = i;
        // only set state if it's different
        setIdx((prev) => {
          if (prev === i) return prev;
          onIndexChange?.(i);
          return i;
        });
      });

      // small debounce to avoid rapid flipping between neighbors
      ioDebounceTimeoutRef.current = setTimeout(() => {
        ioDebounceTimeoutRef.current = null;
      }, 120); // tune: lower = more sensitive, higher = smoother
    };

    const io = new IntersectionObserver(cb, {
      root: container,
      threshold: [0.5], // simpler threshold — we care when 50% visible
      rootMargin: "0px",
    });
    ioRef.current = io;
    items.forEach((el) => io.observe(el));

    return () => {
      if (ioRef.current) {
        ioRef.current.disconnect();
        ioRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (ioDebounceTimeoutRef.current) {
        clearTimeout(ioDebounceTimeoutRef.current);
        ioDebounceTimeoutRef.current = null;
      }
      if (suppressTimeoutRef.current) {
        clearTimeout(suppressTimeoutRef.current);
        suppressTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, events, onIndexChange]);

  const notifyUserInteraction = (ms = 300) => {
    suppressObserverRef.current = true;
    if (suppressTimeoutRef.current) clearTimeout(suppressTimeoutRef.current);
    suppressTimeoutRef.current = setTimeout(() => {
      suppressObserverRef.current = false;
      suppressTimeoutRef.current = null;
    }, ms);
  };

  const items = useMemo(
    () =>
      events.map((ev, i) => ({
        i,
        id: ev?.id ?? `step-${i}`,
        year: ev?.year ?? "",
        title: ev?.title ?? "Sự kiện",
        description: ev?.description ?? "",
        detail: ev?.detail ?? ev?.content ?? "",
        pageNote: ev?.pageNote ?? ev?.note ?? "",
        place: ev?.place || "Việt Nam",
        images: Array.isArray(ev?.images)
          ? ev.images
          : ev?.image
          ? [ev.image]
          : [],
        videos: Array.isArray(ev?.videos)
          ? ev.videos
          : ev?.video
          ? [ev.video]
          : [],
        narrationParts: ev?.narrationParts,
        narration: ev?.narration ?? "",
        sourceLinks: ev?.sources ?? ev?.links ?? [],
      })),
    [events]
  );

  const active = items[idx] || null;

  if (!show) return null;

  return createPortal(
    <>
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
        data-testid="eventmodal-backdrop"
        style={{ zIndex: 1000, pointerEvents: "auto" }}
      />

      <section
        ref={sheetRef}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-label="Timeline Đổi mới"
        onClick={(e) => e.stopPropagation()}
        className={`${styles.sheet} ${styles.sheetRight}`}
        style={{
          "--sheet-w": "min(1400px, 98vw)",
          "--sheet-h": "clamp(520px, 85vh, 1000px)",
          "--sheet-pad-top": "64px",
          justifyContent: "flex-end",
          zIndex: 1010,
        }}
      >
        {/* HEADER */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h3 className={styles.title}>Timeline Đổi mới</h3>
            <span className={styles.sub}>
              kéo để duyệt mốc — dùng ← / → để điều hướng
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              className={styles.guideBtn}
              title="Rồng dẫn truyện mốc này"
              onClick={() => {
                notifyUserInteraction();
                onRequestGuide?.(active?.description);
              }}
              aria-label="Dẫn truyện mốc này"
            >
              <Play size={14} /> Dẫn mốc
            </button>

            <button
              type="button"
              className={styles.primaryBtn}
              title="Giai đoạn trước"
              onClick={() => {
                notifyUserInteraction();
                onRequestStageBack?.();
              }}
              aria-label="Giai đoạn trước"
              style={{ marginRight: 8 }}
            >
              ← Giai đoạn trước
            </button>

            <button
              type="button"
              className={styles.primaryBtn}
              title="Giai đoạn tiếp"
              onClick={() => {
                notifyUserInteraction();
                onRequestStageAdvance?.();
              }}
              aria-label="Giai đoạn tiếp"
            >
              <Play size={14} /> Giai đoạn tiếp →
            </button>

            {/* <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              title="Đóng"
              className={styles.closeBtn}
            >
              <X size={16} />
              <span className={styles.closeText}>Đóng</span>
            </button> */}
          </div>
        </header>

        <div className={styles.progressWrap} aria-hidden>
          <div
            className={styles.progressBar}
            style={{
              width: `${((idx + 1) / Math.max(1, items.length)) * 100}%`,
            }}
          />
        </div>

        <div
          className={styles.sheetInner}
          style={{ display: "flex", gap: 12, height: "100%" }}
        >
          {/* LEFT LIST */}
          <div
            className={styles.list}
            ref={listRef}
            aria-label="Danh sách mốc"
            style={{
              width: "42%",
              overflowY: "auto",
              paddingRight: 8,
              // enable scroll-snap + smooth native scrolling
              scrollSnapType: "y proximity",
              WebkitOverflowScrolling: "touch",
              scrollBehavior: "smooth",
            }}
            onPointerDown={() => notifyUserInteraction(350)}
          >
            {items.map((it) => {
              const activeClass = it.i === idx ? styles.active : "";
              return (
                <article
                  key={it.id}
                  className={`${styles.item} ${activeClass}`}
                  onClick={() => {
                    notifyUserInteraction();
                    setIdx(it.i);
                    onIndexChange?.(it.i);
                    setPanelTab("detail");
                  }}
                  // each item participates in scroll snapping & has stable size to avoid layout shifts
                  style={{
                    scrollSnapAlign: "center",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <div className={styles.thumb}>
                    {it.images && it.images.length ? (
                      <img
                        src={it.images[0]}
                        alt={it.title}
                        draggable={false}
                        className={styles.thumbImg}
                        // prevent image from causing layout shift (fixed aspect handled in CSS)
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.thumbFallback} aria-hidden>
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </div>
                  <div className={styles.content}>
                    <div className={styles.meta}>
                      <span
                        className={`${styles.year} ${
                          it.i === idx ? styles.yearActive : ""
                        }`}
                      >
                        {it.year || "Năm ..."}
                      </span>
                      <span className={styles.dot} />
                      <span className={styles.place}>{it.place}</span>
                    </div>
                    <h4 className={styles.itemTitle}>{it.title}</h4>
                    <p className={styles.desc}>
                      {it.description || "Không có mô tả."}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          {/* RIGHT PANEL */}
          <aside
            className={styles.detailPanel}
            aria-live="polite"
            style={{ width: "58%", padding: "18px 20px", overflowY: "auto" }}
          >
            {active ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>
                      <strong>{active.year}</strong> — {active.place}
                    </div>
                    <h2 style={{ margin: "8px 0 12px", color: "var(--text-on-dark)" }}>{active.title}</h2>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "var(--text-tertiary)", fontSize: 13 }}>
                      {active.pageNote}
                    </div>
                    <div style={{ marginTop: 8 }} />
                  </div>
                </div>

                {/* === Tabs (reordered) === */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className={`${styles.tabBtn} ${
                      panelTab === "evidence" ? styles.tabActive : ""
                    }`}
                    onClick={() => setPanelTab("evidence")}
                  >
                    Bằng chứng ({active.images.length + active.videos.length})
                  </button>
                  <button
                    type="button"
                    className={`${styles.tabBtn} ${
                      panelTab === "detail" ? styles.tabActive : ""
                    }`}
                    onClick={() => setPanelTab("detail")}
                  >
                    Chi tiết
                  </button>
                </div>

                {/* === Tab content === */}
                {panelTab === "evidence" && (
                  <div>
                    <h4>Bằng chứng</h4>

                    {active.videos?.length ? (
                      <div style={{ marginTop: 20 }}>
                        {active.videos.map((v, i) => {
                          const url = typeof v === "string" ? v : v.url;
                          const yt = url.match(
                            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/
                          );
                          return (
                            <div key={i} style={{ marginBottom: 16 }}>
                              <div className={styles.videoFrame}>
                                {yt ? (
                                  <iframe
                                    src={`https://www.youtube.com/embed/${yt[1]}`}
                                    title={`Video ${i + 1}`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <video
                                    src={url}
                                    controls
                                    style={{
                                      position: "absolute",
                                      inset: 0,
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : active.images?.length ? (
                      <div
                        style={{
                          marginTop: 12,
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(120px, 1fr))",
                          gap: 12,
                        }}
                      >
                        {active.images.map((src, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              setPreviewMedia({ type: "image", src })
                            }
                            className={styles.imageThumbBtn}
                            style={{
                              border: "none",
                              padding: 0,
                              background: "transparent",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <div
                              style={{
                                width: "100%",
                                paddingTop: "66%",
                                position: "relative",
                                overflow: "hidden",
                                borderRadius: 8,
                                background: "#f3f4f6",
                              }}
                            >
                              <img
                                src={src}
                                alt={`evidence-${i}`}
                                draggable={false}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                loading="lazy"
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: "var(--muted)", marginTop: 8 }}>
                        Không có bằng chứng đa phương tiện.
                      </div>
                    )}
                  </div>
                )}

                {panelTab === "detail" && (
                  <div>
                    <h4>Chi tiết</h4>
                    <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "var(--text-on-dark)" }}>
                      {active.detail || "Không có nội dung chi tiết."}
                    </p>
                  </div>
                )}

                {panelTab === "desc" && (
                  <div>
                    <h4>Mô tả ngắn</h4>
                    <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "var(--text-on-dark)" }}>
                      {active.description || "Không có mô tả."}
                    </p>
                  </div>
                )}

                {panelTab === "source" && (
                  <div>
                    <h4>Nguồn & Ghi chú</h4>
                    <div style={{ color: "var(--text-tertiary)", whiteSpace: "pre-wrap" }}>
                      {active.pageNote || "Không có chú thích trang."}
                    </div>
                    {active.sourceLinks?.length > 0 && (
                      <ul style={{ marginTop: 12 }}>
                        {active.sourceLinks.map((s, i) => (
                          <li key={i}>
                            <a href={s} target="_blank" rel="noreferrer">
                              {s}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: "var(--text-on-dark)" }}>Không có mốc được chọn.</div>
            )}
          </aside>
        </div>

        {/* FOOTER */}
        <div className={styles.footerBar}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className={styles.footerNav}
                onClick={() => {
                  notifyUserInteraction();
                  setIdx((s) => Math.max(0, s - 1));
                }}
              >
                ← Trước
              </button>
              <button
                type="button"
                className={styles.footerNav}
                onClick={() => {
                  notifyUserInteraction();
                  setIdx((s) => Math.min(items.length - 1, s + 1));
                }}
              >
                Tiếp →
              </button>
            </div>

            <div style={{ color: "var(--muted)" }}>
              {idx + 1} / {items.length}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className={styles.footerNav}
                onClick={() => {
                  notifyUserInteraction();
                  onRequestStageBack?.();
                }}
              >
                Giai đoạn trước ←
              </button>

              <button
                type="button"
                className={styles.footerNav}
                onClick={() => onRequestStageAdvance?.()}
              >
                Giai đoạn tiếp →
              </button>
              {/* <button
                type="button"
                className={styles.footerClose}
                onClick={onClose}
              >
                Đóng
              </button> */}
            </div>
          </div>
        </div>
      </section>

      {/* PREVIEW */}
      {previewMedia && (
        <div
          className={styles.previewOverlay}
          onClick={() => setPreviewMedia(null)}
          role="dialog"
          aria-modal="true"
          style={{ zIndex: 1200 }}
        >
          <div
            className={styles.previewCard}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.previewClose}
              onClick={() => setPreviewMedia(null)}
            >
              <X size={16} />
            </button>
            {previewMedia.type === "image" ? (
              <img
                src={previewMedia.src}
                alt="preview"
                style={{
                  maxWidth: "min(90vw, 1200px)",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />
            ) : (
              <video
                src={previewMedia.src}
                controls
                style={{ width: "80vw", height: "60vh" }}
              />
            )}
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
