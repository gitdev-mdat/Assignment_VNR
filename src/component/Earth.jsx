import React, { useEffect, useRef, useState, useMemo } from "react";
import Globe from "globe.gl";
import EventModal from "./EventModal";
import TourControls from "./TourControls";
import Dragon from "./Dragon";
import { hanoiEvents } from "../data/hanoiEvents";
import styles from "../styles/Earth.module.css";
import {
  buildControlledSteps,
  getNarrationForIndex,
  getPlaylistForIndex,
} from "../content/tour.control";

const HANOI = { lat: 21.0285, lng: 105.8542 };
const DEFAULT_DRAGON_TYPING_MS_PER_CHAR = 26;
const DRAGON_TO_MODAL_DELAY_MS = 3000; // 2 giây giữa Dragon -> EventModal

// Bật demo tự động zoom sự kiện đầu? Nên để false để chờ user.
const ENABLE_AUTO_DEMO = false;

const Earth = () => {
  const globeRef = useRef(null);
  const globeInstanceRef = useRef(null);

  // state/refs
  const dragonPlaylistRef = useRef(null);
  const isGuidedRef = useRef(false); // chỉ true khi flow đến từ marker/guide
  const cameraBusyRef = useRef(false); // đang bay -> chặn double zoom

  const initialPOVTimerRef = useRef(null);
  const spawnTimerRef = useRef(null);
  const markerFallbackTimerRef = useRef(null);
  const labelTimerRef = useRef(null);
  const postZoomModalTimerRef = useRef(null);
  const initializedRef = useRef(false);
  const dragonFinishTimerRef = useRef(null);
  const pendingModalIndexRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  // dragon state
  const [showDragon, setShowDragon] = useState(false);
  const [dragonText, setDragonText] = useState(
    "Xin chào! Mình là Rồng - hôm nay mình sẽ cho bạn biết: Đảng lãnh đạo cả nước quá độ lên chủ nghĩa xã hội và tiến hành công cuộc đổi mới (1975 - 2018) như thế nào nhé!"
  );

  // Data control (1 nguồn dữ liệu thống nhất)
  const controlledSteps = useMemo(
    () =>
      buildControlledSteps(hanoiEvents, {
        defaultLat: HANOI.lat,
        defaultLng: HANOI.lng,
      }),
    [hanoiEvents]
  );
  const tourSteps = controlledSteps;

  // helper số hợp lệ
  const fin = (v) => (Number.isFinite(v) ? v : undefined);

  useEffect(() => {
    if (!globeRef.current || initializedRef.current) return;
    initializedRef.current = true;

    while (globeRef.current.firstChild)
      globeRef.current.removeChild(globeRef.current.firstChild);

    const globe = Globe()(globeRef.current)
      .globeImageUrl(
        "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      )
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png");

    globeInstanceRef.current = globe;

    const initialPOVDuration = 3000;
    globe.pointOfView(
      { lat: HANOI.lat, lng: HANOI.lng, altitude: 0.6 },
      initialPOVDuration
    );

    initialPOVTimerRef.current = setTimeout(() => {
      // Intro rồng – KHÔNG guided
      isGuidedRef.current = false;
      setShowDragon(true);
    }, initialPOVDuration + 80);

    return () => {
      if (initialPOVTimerRef.current) clearTimeout(initialPOVTimerRef.current);
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      if (markerFallbackTimerRef.current)
        clearTimeout(markerFallbackTimerRef.current);
      if (labelTimerRef.current) clearTimeout(labelTimerRef.current);
      if (postZoomModalTimerRef.current)
        clearTimeout(postZoomModalTimerRef.current);
      if (dragonFinishTimerRef.current)
        clearTimeout(dragonFinishTimerRef.current);

      try {
        globe.htmlElementsData?.([]);
      } catch (e) {}
      if (globeRef.current) {
        while (globeRef.current.firstChild)
          globeRef.current.removeChild(globeRef.current.firstChild);
      }
      globeInstanceRef.current = null;
      initializedRef.current = false;
      pendingModalIndexRef.current = null;
      isGuidedRef.current = false;
      dragonPlaylistRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bay 1 lần có debounce
  const flyOnce = (lat, lng, altitude = 0.16, duration = 1100) => {
    const globe = globeInstanceRef.current;
    if (!globe) return false;
    if (cameraBusyRef.current) return false;
    cameraBusyRef.current = true;
    try {
      globe.pointOfView({ lat, lng, altitude }, duration);
    } catch (e) {}
    setTimeout(() => {
      cameraBusyRef.current = false;
    }, duration + 80);
    return true;
  };

  // Chỉ mở modal sau khi rồng xong nếu flow là guided
  const requestModalAfterDragon = (indexToOpen) => {
    isGuidedRef.current = true;

    if (dragonFinishTimerRef.current) {
      clearTimeout(dragonFinishTimerRef.current);
      dragonFinishTimerRef.current = null;
    }

    const playlist = getPlaylistForIndex(controlledSteps, indexToOpen);
    const narration = getNarrationForIndex(controlledSteps, indexToOpen) || "";

    pendingModalIndexRef.current = indexToOpen;

    if (playlist.length > 1) {
      // Multi segment: để Dragon tự gọi onAllFinished
      setDragonText("");
      dragonPlaylistRef.current = playlist;
      setShowDragon(true);
      return;
    }

    // Single segment: ước lượng + delay 2s
    setDragonText(narration);
    setShowDragon(true);

    const estimatedTypingMs = Math.max(
      700,
      (narration.length || 0) * DEFAULT_DRAGON_TYPING_MS_PER_CHAR
    );
    const extraPauseAfterDragonMs = DRAGON_TO_MODAL_DELAY_MS;

    dragonFinishTimerRef.current = setTimeout(() => {
      if (isGuidedRef.current) {
        const idx = pendingModalIndexRef.current ?? indexToOpen;
        setModalIndex(idx);
        setShowModal(true);
        pendingModalIndexRef.current = null;
      }
      dragonFinishTimerRef.current = null;
      isGuidedRef.current = false;
      dragonPlaylistRef.current = null;
    }, estimatedTypingMs + extraPauseAfterDragonMs);
  };

  // Single-step zoom rồi gọi rồng
  const zoomToMarkerOnce = (
    target,
    { altitude = 0.16, duration = 1100 } = {}
  ) => {
    const lat = fin(target?.lat) ?? HANOI.lat;
    const lng = fin(target?.lng) ?? HANOI.lng;

    if (postZoomModalTimerRef.current) {
      clearTimeout(postZoomModalTimerRef.current);
      postZoomModalTimerRef.current = null;
    }

    const started = flyOnce(lat, lng, altitude, duration);
    if (!started) return;

    postZoomModalTimerRef.current = setTimeout(() => {
      const idx = Number.isInteger(target?.stepIndex) ? target.stepIndex : 0;
      requestModalAfterDragon(idx);
    }, duration + 60);
  };

  // Tạo markers (mặc định KHÔNG auto demo)
  const createMarkersAndMaybeAutoDemo = () => {
    const globe = globeInstanceRef.current;
    if (!globe || !globeRef.current) return;

    const markers = tourSteps.map((s) => ({
      id: s.id,
      lat: fin(s.lat) ?? HANOI.lat,
      lng: fin(s.lng) ?? HANOI.lng,
      name: s.title ?? "Sự kiện",
      stepIndex: s.index,
    }));

    globe.htmlElementsData(markers).htmlElement((d) => {
      const wrapper = document.createElement("div");
      wrapper.classList.add(styles.markerWrapper);
      wrapper.style.pointerEvents = "auto";

      const marker = document.createElement("div");
      marker.classList.add(styles.marker);
      const pulse = document.createElement("span");
      pulse.classList.add(styles.pulse);
      const dot = document.createElement("span");
      dot.classList.add(styles.dot);
      marker.appendChild(pulse);
      marker.appendChild(dot);

      const label = document.createElement("div");
      label.classList.add(styles.markerLabel);
      label.textContent = d.name;

      wrapper.appendChild(marker);
      wrapper.appendChild(label);

      wrapper.addEventListener("click", (evClick) => {
        evClick.stopPropagation();
        zoomToMarkerOnce(
          { lat: d.lat, lng: d.lng, stepIndex: d.stepIndex },
          { altitude: 0.16, duration: 1100 }
        );
      });

      wrapper.addEventListener("pointerdown", (ev2) => ev2.stopPropagation());
      return wrapper;
    });

    // spawn + (optional) auto demo
    const spawnDelay = 180;
    spawnTimerRef.current = setTimeout(() => {
      const domMarkers = globeRef.current.querySelectorAll(`.${styles.marker}`);
      if (!domMarkers || domMarkers.length === 0) return;
      domMarkers.forEach((m) => m.classList.add(styles.show));

      if (!ENABLE_AUTO_DEMO) return;

      const first = tourSteps[0];
      if (!first) return;
      const finalTarget = {
        lat: fin(first.lat) ?? HANOI.lat,
        lng: fin(first.lng) ?? HANOI.lng,
        stepIndex: 0,
      };

      // show nhãn êm ái chút rồi bay
      const firstMarker = domMarkers[0];
      const firstWrapper = firstMarker && firstMarker.parentElement;
      const firstLabel =
        firstWrapper && firstWrapper.querySelector(`.${styles.markerLabel}`);

      let handled = false;
      const markerTransitionDuration = 360;

      const cleanupListener = () => {
        try {
          firstMarker.removeEventListener("transitionend", onTransitionEnd);
        } catch (e) {}
        if (markerFallbackTimerRef.current) {
          clearTimeout(markerFallbackTimerRef.current);
          markerFallbackTimerRef.current = null;
        }
      };

      const onTransitionEnd = (ev) => {
        if (!ev.propertyName) return;
        if (
          ev.propertyName.includes("transform") ||
          ev.propertyName.includes("opacity")
        ) {
          if (handled) return;
          handled = true;
          cleanupListener();

          const stableDelay = 2000;
          labelTimerRef.current = setTimeout(() => {
            if (firstLabel) {
              firstLabel.classList.add(styles.labelVisible || "");
              firstLabel.style.opacity = "1";
              firstLabel.style.transform = "translateY(0) scale(1)";
            }
            const tooltipShowMs = 1600;
            labelTimerRef.current = setTimeout(() => {
              zoomToMarkerOnce(finalTarget, { altitude: 0.16, duration: 1100 });
            }, tooltipShowMs);
          }, stableDelay);
        }
      };

      firstMarker.addEventListener("transitionend", onTransitionEnd);

      markerFallbackTimerRef.current = setTimeout(() => {
        if (handled) return;
        handled = true;
        try {
          firstMarker.removeEventListener("transitionend", onTransitionEnd);
        } catch (e) {}

        const stableDelay = 2000;
        labelTimerRef.current = setTimeout(() => {
          if (firstLabel) {
            firstLabel.classList.add(styles.labelVisible || "");
            firstLabel.style.opacity = "1";
            firstLabel.style.transform = "translateY(0) scale(1)";
          }
          const tooltipShowMs = 1600;
          labelTimerRef.current = setTimeout(() => {
            zoomToMarkerOnce(finalTarget, { altitude: 0.16, duration: 1100 });
          }, tooltipShowMs);
        }, stableDelay);
      }, markerTransitionDuration + 160);
    }, spawnDelay);
  };

  // Dragon confirm: show markers
  const onDragonConfirm = () => {
    isGuidedRef.current = false;
    setShowDragon(false);
    createMarkersAndMaybeAutoDemo();
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (dragonFinishTimerRef.current) {
      clearTimeout(dragonFinishTimerRef.current);
      dragonFinishTimerRef.current = null;
    }
    pendingModalIndexRef.current = null;
    isGuidedRef.current = false;
    dragonPlaylistRef.current = null;
  };

  const onSeekCamera = (i) => {
    const idx = Number.isInteger(i)
      ? Math.max(0, Math.min(i, tourSteps.length - 1))
      : 0;
    const s = tourSteps[idx];
    if (s && globeInstanceRef.current) {
      const lat = fin(s.lat) ?? HANOI.lat;
      const lng = fin(s.lng) ?? HANOI.lng;
      const alt = fin(s.altitude) ?? 0.28;
      flyOnce(lat, lng, alt, 1200);
    }
  };

  return (
    <div className={styles.earthContainer}>
      {/* Fade layer khi camera đang bay (opacity mượt) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(2,6,23,0.12), transparent 70%), linear-gradient(180deg, rgba(2,6,23,0.08), rgba(2,6,23,0))",
          zIndex: 80,
          pointerEvents: "none",
          opacity: cameraBusyRef.current ? 1 : 0,
          transition: "opacity 220ms ease",
        }}
      />
      <div ref={globeRef} className={styles.globeCanvas} />

      <div className={styles.controlsOverlay}>
        <TourControls
          steps={tourSteps}
          current={0}
          playing={false}
          onPlay={() => {}}
          onNext={() => {}}
          onPrev={() => {}}
          onSeek={onSeekCamera}
        />
      </div>

      <Dragon
        visible={showDragon}
        text={dragonText}
        playlist={dragonPlaylistRef.current || undefined}
        typingSpeed={DEFAULT_DRAGON_TYPING_MS_PER_CHAR}
        autoAdvance={true}
        gapMs={2200}
        onAllFinished={
          isGuidedRef.current
            ? () => {
                const idx = pendingModalIndexRef.current ?? 0;
                setTimeout(() => {
                  setModalIndex(idx);
                  setShowModal(true);
                  pendingModalIndexRef.current = null;
                  isGuidedRef.current = false;
                  dragonPlaylistRef.current = null;
                }, DRAGON_TO_MODAL_DELAY_MS);
              }
            : undefined
        }
        onConfirm={() => {
          if (isGuidedRef.current) {
            setShowDragon(false);
            const idx = pendingModalIndexRef.current ?? 0;
            setTimeout(() => {
              setModalIndex(idx);
              setShowModal(true);
              pendingModalIndexRef.current = null;
              isGuidedRef.current = false;
              dragonPlaylistRef.current = null;
            }, DRAGON_TO_MODAL_DELAY_MS);
            return;
          }
          onDragonConfirm(); // intro flow
        }}
        onClose={() => {
          setShowDragon(false);
          isGuidedRef.current = false;
          dragonPlaylistRef.current = null;
        }}
      />

      <div
        className={`${styles.modalLayer} ${
          showModal ? styles.modalVisible : ""
        }`}
      >
        {showModal && (
          <EventModal
            show={showModal}
            onClose={handleModalClose}
            events={controlledSteps}
            startIndex={modalIndex}
            onIndexChange={(i) => setModalIndex(i)}
            onRequestGuide={(text) => {
              // Gọi rồng từ trong modal => coi như guided
              isGuidedRef.current = true;
              dragonPlaylistRef.current = Array.isArray(text)
                ? text
                : undefined;
              setDragonText(Array.isArray(text) ? "" : text);
              setShowDragon(true);
            }}
            guideInModal={true}
            bottomOffset={20}
          />
        )}
      </div>
    </div>
  );
};

export default Earth;
