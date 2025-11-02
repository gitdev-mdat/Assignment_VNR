import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  Suspense,
  lazy,
  useCallback,
} from "react";
import Globe from "globe.gl";
import { stages as rawHanoiStages } from "../data/hanoiStages";
import {
  buildControlledSteps,
  getNarrationForIndex,
  getPlaylistForIndex,
} from "../data/narration";
import styles from "../styles/Earth.module.css";

const EventModal = lazy(() => import("./EventModal"));
const Dragon = lazy(() => import("./Dragon"));
const FloatingChatButton = lazy(() => import("./FloatingChatButton"));
const QuizModal = lazy(() => import("./QuizModal"));

// IMPORTANT: put QR image at src/assets/qr-quiz.png or change path below
import qrQuiz from "../assets/qr-quiz.png";

const HANOI = { lat: 21.0285, lng: 105.8542 };
const DEFAULT_DRAGON_TYPING_MS_PER_CHAR = 26;
const DRAGON_TO_MODAL_DELAY_MS = 800;
const AUTO_KICK_FIRST_EVENT = true;
const DRAGON_LIFT_WHEN_MODAL = 140;

const Earth = () => {
  const globeRef = useRef(null);
  const globeInstanceRef = useRef(null);
  const [qrLightboxOpen, setQrLightboxOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [showDragon, setShowDragon] = useState(false);
  const [dragonText, setDragonText] = useState(
    "Xin chào! Mình là Rồng — hôm nay mình sẽ cho bạn biết Đảng đã lãnh đạo cả nước quá độ lên chủ nghĩa xã hội và tiến hành công cuộc đổi mới (1975-1986) như thế nào nhé!"
  );

  const isGuidedRef = useRef(false);
  const cameraBusyRef = useRef(false);
  const dragonPlaylistRef = useRef(null);
  const timersRef = useRef([]);

  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // chat / quiz controls
  const [showQuiz, setShowQuiz] = useState(false);

  const fin = (v) => (Number.isFinite(v) ? v : undefined);
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  // --- Build enriched stages
  const stagesWithEvents = useMemo(() => {
    return (rawHanoiStages || []).map((stage) => ({
      ...stage,
      events: buildControlledSteps(stage.events || [], {
        defaultLat: HANOI.lat,
        defaultLng: HANOI.lng,
      }),
    }));
  }, [rawHanoiStages]);

  // --- Flatten events
  const flattenedEvents = useMemo(() => {
    const arr = [];
    stagesWithEvents.forEach((stage, sIdx) => {
      (stage.events || []).forEach((ev, eIdx) => {
        arr.push({
          ...ev,
          stageIndex: sIdx,
          eventIndex: eIdx,
        });
      });
    });
    return arr;
  }, [stagesWithEvents]);

  const currentStage = stagesWithEvents[currentStageIdx] || { events: [] };

  // --- Fly camera helper ---
  const flyOnce = useCallback((lat, lng, altitude = 0.18, duration = 3000) => {
    const globe = globeInstanceRef.current;
    if (!globe || cameraBusyRef.current) return false;
    cameraBusyRef.current = true;
    globe.pointOfView({ lat, lng, altitude }, duration);
    setTimeout(() => (cameraBusyRef.current = false), duration + 80);
    return true;
  }, []);

  // --- Hiệu ứng bom ---
  const showBombEffect = useCallback((lat = HANOI.lat, lng = HANOI.lng) => {
    const globe = globeInstanceRef.current;
    if (!globe) return;

    const bomb = { id: `bomb-${Date.now()}`, lat, lng, kind: "bomb" };
    const existingData = globe.htmlElementsData() || [];
    globe.htmlElementsData([...existingData, bomb]).htmlElement((d) => {
      if (d.kind !== "bomb") return null;
      const el = document.createElement("div");
      el.classList.add(styles.bombEffect);
      return el;
    });

    setTimeout(() => {
      const dataAfter = (globe.htmlElementsData() || []).filter(
        (e) => e.id !== bomb.id
      );
      globe.htmlElementsData(dataAfter);
    }, 4000);
  }, []);

  // --- Guided stage logic (used by markers) ---
  const startGuidedStage = useCallback(
    (stageIdx, eventIdx = 0) => {
      const sIdx = Math.max(0, Math.min(stageIdx, stagesWithEvents.length - 1));
      const stage = stagesWithEvents[sIdx];
      if (!stage) return;

      const targetEvent = stage.events?.[eventIdx] ?? stage.events?.[0];
      const lat = fin(targetEvent?.lat) ?? HANOI.lat;
      const lng = fin(targetEvent?.lng) ?? HANOI.lng;
      const duration = targetEvent?.duration ?? 1100;

      setCurrentStepIndex(eventIdx);
      setModalIndex(eventIdx);
      setCurrentStageIdx(sIdx);
      isGuidedRef.current = true;

      flyOnce(lat, lng, targetEvent?.altitude ?? 0.18, duration);

      // 💥 Hiệu ứng bom đúng vị trí sau khi camera đến
      const tBomb = setTimeout(() => showBombEffect(lat, lng), duration);
      timersRef.current.push(tBomb);

      // Hiển thị dragon sau camera + bom
      const tDragon = setTimeout(() => {
        const playlist = getPlaylistForIndex(stage.events || [], eventIdx);
        const narration =
          getNarrationForIndex(stage.events || [], eventIdx) || "";

        if (Array.isArray(playlist) && playlist.length > 1) {
          dragonPlaylistRef.current = playlist;
          setDragonText("");
        } else {
          dragonPlaylistRef.current = null;
          setDragonText(narration);
        }

        setShowModal(false);
        setShowDragon(true);
      }, duration + 300);
      timersRef.current.push(tDragon);
    },
    [stagesWithEvents, flyOnce, showBombEffect]
  );

  // --- Create Markers ---
  const createMarkers = useCallback(() => {
    const globe = globeInstanceRef.current;
    if (!globe) return { hasAny: false };

    globe.htmlElementsData([]); // clear previous

    const markers = flattenedEvents.map((ev, i) => ({
      id: ev.id ?? `ev-${i}`,
      lat: fin(ev.lat) ?? HANOI.lat,
      lng: fin(ev.lng) ?? HANOI.lng,
      name: ev.title ?? "Sự kiện",
      stageIndex: ev.stageIndex,
      eventIndex: ev.eventIndex,
      kind: "event",
    }));

    globe.htmlElementsData(markers).htmlElement((d) => {
      const wrapper = document.createElement("div");
      wrapper.classList.add(styles.markerWrapper);

      const marker = document.createElement("div");
      marker.classList.add(styles.marker);
      marker.innerHTML = `<span class="${styles.pulse}"></span><span class="${styles.dot}"></span>`;

      const label = document.createElement("div");
      label.classList.add(styles.markerLabel);
      label.textContent = d.name;

      wrapper.append(marker, label);

      wrapper.onclick = (e) => {
        e.stopPropagation();
        startGuidedStage(d.stageIndex ?? 0, d.eventIndex ?? 0);
      };

      return wrapper;
    });

    return { hasAny: markers.length > 0 };
  }, [flattenedEvents, startGuidedStage]);

  // --- Dragon finished ---
  const handleDragonAllFinished = useCallback(() => {
    if (!isGuidedRef.current) return;
    setShowDragon(false);
    const t = setTimeout(() => {
      setShowModal(true);
      isGuidedRef.current = false;
      dragonPlaylistRef.current = null;
    }, DRAGON_TO_MODAL_DELAY_MS);
    timersRef.current.push(t);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    isGuidedRef.current = false;
    dragonPlaylistRef.current = null;
  }, []);

  const onDragonConfirm = useCallback(() => {
    isGuidedRef.current = false;
    setShowDragon(false);
    const res = createMarkers();
    if (AUTO_KICK_FIRST_EVENT && res && res.hasAny) {
      startGuidedStage(0, 0);
    }
  }, [createMarkers, startGuidedStage]);

  // --- Setup globe ---
  useEffect(() => {
    if (!globeRef.current) return;
    while (globeRef.current.firstChild)
      globeRef.current.removeChild(globeRef.current.firstChild);

    const globe = Globe()(globeRef.current)
      .globeImageUrl("/textures/earth-blue-marble.jpg")
      .bumpImageUrl("/textures/earth-topology.png")
      .backgroundImageUrl("/textures/night-sky.png")
      .showAtmosphere(false);

    globe.controls().autoRotate = false;
    globe.controls().enablePan = false;
    globe.controls().zoomSpeed = 0.6;

    globeInstanceRef.current = globe;

    const cameraDuration = 3000;
    globe.pointOfView(
      { lat: HANOI.lat, lng: HANOI.lng, altitude: 0.6 },
      cameraDuration
    );

    // show dragon intro **sau khi camera quay xong**
    const tIntro = setTimeout(() => setShowDragon(true), cameraDuration + 200);
    timersRef.current.push(tIntro);

    // markers
    const tMarkers = setTimeout(() => createMarkers(), cameraDuration + 400);
    timersRef.current.push(tMarkers);

    // hiệu ứng bom 2.5s sau khi render (tùy muốn)
    const tBomb = setTimeout(
      () => showBombEffect(HANOI.lat, HANOI.lng),
      cameraDuration + 500
    );
    timersRef.current.push(tBomb);

    return () => {
      clearAllTimers();
      try {
        globe.htmlElementsData([]);
      } catch {}
      if (globeRef.current) globeRef.current.innerHTML = "";
      globeInstanceRef.current = null;
    };
  }, [createMarkers, clearAllTimers, showBombEffect]);

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  // --- Handler for advancing to next stage (NO dragon) ---
  const handleAdvanceStageWithoutDragon = useCallback(() => {
    const next = Math.min(currentStageIdx + 1, stagesWithEvents.length - 1);
    if (next === currentStageIdx) return; // already last stage

    // switch stage and reset modal index to first event of next stage
    setCurrentStageIdx(next);
    setModalIndex(0);
    setCurrentStepIndex(0);

    // ensure modal remains open (if it was open)
    setShowModal(true);

    // center camera on first event of the new stage (light fly)
    const nextStage = stagesWithEvents[next];
    const targetEvent = nextStage?.events?.[0];
    if (targetEvent && globeInstanceRef.current) {
      const lat = fin(targetEvent.lat) ?? HANOI.lat;
      const lng = fin(targetEvent.lng) ?? HANOI.lng;
      try {
        flyOnce(lat, lng, targetEvent?.altitude ?? 0.18, 900);
      } catch {}
    }
  }, [currentStageIdx, stagesWithEvents, flyOnce]);

  // --- Handler for going back to previous stage (NO dragon) ---
  const handleBackStageWithoutDragon = useCallback(() => {
    const prev = Math.max(0, currentStageIdx - 1);
    if (prev === currentStageIdx) return; // already first stage

    // switch to prev stage, set modal index to 0
    setCurrentStageIdx(prev);
    setModalIndex(0);
    setCurrentStepIndex(0);

    setShowModal(true);

    // center camera on first event of the previous stage (light fly)
    const prevStage = stagesWithEvents[prev];
    const targetEvent = prevStage?.events?.[0];
    if (targetEvent && globeInstanceRef.current) {
      const lat = fin(targetEvent.lat) ?? HANOI.lat;
      const lng = fin(targetEvent.lng) ?? HANOI.lng;
      try {
        flyOnce(lat, lng, targetEvent?.altitude ?? 0.18, 900);
      } catch {}
    }
  }, [currentStageIdx, stagesWithEvents, flyOnce]);

  // quiz url (env fallback)
  const quizUrl = "https://quiz.com/4d426a94-bd67-4909-9b59-f96464a123fd";

  return (
    <div className={styles.earthContainer}>
      <div ref={globeRef} className={styles.globeCanvas} />

      <Suspense fallback={null}>
        <Dragon
          visible={showDragon}
          text={dragonText}
          playlist={dragonPlaylistRef.current || undefined}
          typingSpeed={DEFAULT_DRAGON_TYPING_MS_PER_CHAR}
          autoAdvance={true}
          gapMs={2000}
          onAllFinished={handleDragonAllFinished}
          onConfirm={onDragonConfirm}
          onClose={() => {
            setShowDragon(false);
            isGuidedRef.current = false;
            dragonPlaylistRef.current = null;
          }}
          dock="left"
          offsetY={showModal ? `${DRAGON_LIFT_WHEN_MODAL}px` : "14vh"}
        />
      </Suspense>

      <Suspense fallback={null}>
        {showModal && (
          <div
            className={`${styles.modalLayer} ${
              showModal ? styles.modalVisible : ""
            }`}
          >
            <EventModal
              key={currentStageIdx}
              show={showModal}
              onClose={handleModalClose}
              events={currentStage.events || []}
              startIndex={modalIndex}
              onIndexChange={(i) => {
                setModalIndex(i);
                setCurrentStepIndex(i);
              }}
              onRequestStageAdvance={handleAdvanceStageWithoutDragon}
              onRequestStageBack={handleBackStageWithoutDragon}
            />
          </div>
        )}
      </Suspense>

      {/* Left side buttons: Timeline, Quiz, AI Chat */}
      <div
        style={{
          position: "fixed",
          left: 16,
          top: "calc(50% - 120px)",
          zIndex: 61,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Timeline button */}
        <button
          onClick={() => {
            setCurrentStageIdx(0);
            setModalIndex(0);
            setShowModal(true);
          }}
          title="Mở Timeline"
          style={{
            padding: 10,
            borderRadius: 10,
            background: "linear-gradient(90deg, #ffd966, #ff8a4b)",
            color: "#07102a",
            boxShadow: "0 8px 20px rgba(255, 138, 75, 0.25)",
            border: "none",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          📜 Timeline
        </button>

        {/* Quiz button */}
        <button
          onClick={() => setShowQuiz(true)}
          title="Mở quiz"
          style={{
            padding: 10,
            borderRadius: 10,
            background: "#10b981",
            color: "white",
            boxShadow: "0 8px 20px rgba(16,185,129,0.15)",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Quiz
        </button>
      </div>

      {/* Floating chat - repositioned to align with other buttons */}
      <Suspense fallback={null}>
        <FloatingChatButton
          startOpen={false}
          customPosition={{
            left: 16,
            top: "calc(50% + 20px)",
            zIndex: 61,
          }}
        />
      </Suspense>

      {/* Quiz Modal */}
      <Suspense fallback={null}>
        <QuizModal visible={showQuiz} onClose={() => setShowQuiz(false)} />
      </Suspense>

      {/* QR / Quiz aside (bottom-right) */}
      <aside
        className={styles.qrAside}
        role="region"
        aria-label="Mã QR trò chơi câu hỏi"
      >
        <div className={styles.qrGlow} />
        <div className={styles.qrCard}>
          {/* click image để mở lightbox (không dùng <a> bọc ảnh nữa) */}
          <div
            onClick={() => setQrLightboxOpen(true)}
            style={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
            aria-hidden="true"
          >
            <img
              src={qrQuiz}
              alt="Mã QR trò chơi câu hỏi"
              className={styles.qrImg}
              loading="lazy"
            />

            <div style={{ textAlign: "center" }}>
              <p className={styles.qrTitle}>🎯 Quét để chơi Quiz</p>
              <p className={styles.qrSub}>Hoặc chạm để mở</p>
            </div>
          </div>

          {/* nhỏ: nút trực tiếp mở trang (nếu user muốn mở ngay) */}
          <div
            style={{
              marginTop: 6,
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <a
              href={quizUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                fontSize: 12,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              Mở trang quiz
            </a>
          </div>
        </div>
      </aside>

      {qrLightboxOpen && (
        <div
          className={styles.qrLightbox}
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setQrLightboxOpen(false);
          }}
        >
          <div className={styles.qrLightboxContent}>
            <button
              className={styles.qrLightboxClose}
              aria-label="Đóng"
              onClick={() => setQrLightboxOpen(false)}
            >
              ✕
            </button>

            <img
              src={qrQuiz}
              alt="Mã QR lớn"
              className={styles.qrLightboxImg}
            />

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <a
                href={quizUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.qrLightboxOpenBtn}
              >
                Mở trang quiz
              </a>
              <button
                onClick={() => setQrLightboxOpen(false)}
                className={styles.qrLightboxCloseBtn}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earth;
