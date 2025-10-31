import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  Suspense,
} from "react";
import PropTypes from "prop-types";
import EventModal from "./EventModal";
import Dragon from "./Dragon";
import { stages as defaultStages } from "../data/hanoiStages";
import styles from "../styles/TimelineWithDragon.module.css";

export default function TimelineWithDragon({
  stages = defaultStages,
  initialStage = 0,
  dragonIntro = "Xin chào — mình là Rồng dẫn chuyện. Mình sẽ dẫn bạn qua các mốc lịch sử.",
  autoStart = true,
  dragonTypingSpeed = 26,
  dragonGapMs = 1200,
  dragonDock = "left",
  dragonOffsetY = "16vh",
}) {
  const clampIdx = (i, s) =>
    Math.max(0, Math.min(i ?? 0, Math.max(0, (s || []).length - 1)));

  const [currentStageIdx, setCurrentStageIdx] = useState(() =>
    clampIdx(initialStage, stages)
  );
  const [showDragon, setShowDragon] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [dragonPlaylist, setDragonPlaylist] = useState(() => {
    const s = stages[clampIdx(currentStageIdx, stages)] ?? stages[0];
    return [
      dragonIntro,
      `Giai đoạn: ${s?.title || ""}. ${s?.summary || ""}`,
    ].filter(Boolean);
  });

  const isGuidedRef = useRef(false);
  const timersRef = useRef([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => clearAllTimers, [clearAllTimers]);

  // 🐉 Chuẩn bị nội dung cho 1 giai đoạn
  const prepareDragonForStage = useCallback(
    (stageIdx) => {
      const s = stages[clampIdx(stageIdx, stages)] ?? stages[0];
      const playlist = [
        dragonIntro,
        `Giai đoạn ${s.range || s.title}. ${s.summary || ""}`,
      ].filter(Boolean);

      setDragonPlaylist(playlist);
      setShowModal(false);
      isGuidedRef.current = true;

      const t = setTimeout(() => setShowDragon(true), 180);
      timersRef.current.push(t);
    },
    [dragonIntro, stages]
  );

  // 🧭 Khi rồng nói xong hết
  const handleDragonAllFinished = useCallback(() => {
    if (!isGuidedRef.current) return;
    setShowDragon(false);
    const t = setTimeout(() => {
      setShowModal(true);
      isGuidedRef.current = false;
    }, 260);
    timersRef.current.push(t);
  }, []);

  // 🔁 Khi người dùng muốn qua giai đoạn tiếp theo
  const handleRequestAdvanceStage = useCallback(() => {
    const next = Math.min(currentStageIdx + 1, stages.length - 1);
    if (next === currentStageIdx) {
      setShowModal(false);
      return;
    }
    setShowModal(false);
    const t = setTimeout(() => {
      setCurrentStageIdx(next);
      prepareDragonForStage(next);
    }, 220);
    timersRef.current.push(t);
  }, [currentStageIdx, stages.length, prepareDragonForStage]);

  // 🧙 Khi người dùng nhấn "Dẫn chuyện" từ modal
  const handleRequestGuideFromModal = useCallback(
    (narration) => {
      const playlist = Array.isArray(narration)
        ? narration.filter(Boolean)
        : [
            dragonIntro,
            narration || `Giai đoạn ${stages[currentStageIdx]?.title || ""}`,
          ].filter(Boolean);

      setShowModal(false);
      const t = setTimeout(() => {
        setDragonPlaylist(playlist);
        isGuidedRef.current = true;
        setShowDragon(true);
      }, 160);
      timersRef.current.push(t);
    },
    [currentStageIdx, dragonIntro, stages]
  );

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    isGuidedRef.current = false;
  }, []);

  // 🧩 FIX BUG: không auto update playlist khi rồng đang nói
  useEffect(() => {
    if (showDragon) return; // tránh reset khi đang typing
    const s = stages[clampIdx(currentStageIdx, stages)] ?? stages[0];
    setDragonPlaylist(
      [
        dragonIntro,
        `Giai đoạn: ${s?.title || s?.range || ""}. ${s?.summary || ""}`,
      ].filter(Boolean)
    );
  }, [currentStageIdx, stages, dragonIntro, showDragon]);

  // ⚡ Auto start ngay khi load
  useEffect(() => {
    if (!autoStart) return;
    const t = setTimeout(() => prepareDragonForStage(currentStageIdx), 700);
    timersRef.current.push(t);
    return () => clearTimeout(t);
  }, [autoStart, prepareDragonForStage, currentStageIdx]);

  // ⎋ Nút Escape để thoát
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (showModal) handleModalClose();
        else if (showDragon) {
          setShowDragon(false);
          setTimeout(() => setShowModal(true), 160);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal, showDragon, handleModalClose]);

  const currentStage = stages[clampIdx(currentStageIdx, stages)] || {
    events: [],
  };

  return (
    <>
      <Suspense fallback={null}>
        <Dragon
          visible={showDragon}
          playlist={dragonPlaylist}
          typingSpeed={dragonTypingSpeed}
          gapMs={dragonGapMs}
          autoAdvance={true}
          onAllFinished={handleDragonAllFinished}
          onClose={() => {
            setShowDragon(false);
            isGuidedRef.current = false;
            const t = setTimeout(() => setShowModal(true), 180);
            timersRef.current.push(t);
          }}
          onConfirm={() => {
            setShowDragon(false);
            isGuidedRef.current = false;
            const t = setTimeout(() => setShowModal(true), 160);
            timersRef.current.push(t);
          }}
          dock={dragonDock}
          offsetY={dragonOffsetY}
        />
      </Suspense>

      <Suspense fallback={null}>
        <EventModal
          show={showModal}
          onClose={handleModalClose}
          events={currentStage.events || []}
          startIndex={0}
          onIndexChange={() => {}}
          onRequestGuide={(narration) => handleRequestGuideFromModal(narration)}
          onRequestStageAdvance={handleRequestAdvanceStage}
          bottomOffset={20}
        />
      </Suspense>
    </>
  );
}

TimelineWithDragon.propTypes = {
  stages: PropTypes.array,
  initialStage: PropTypes.number,
  dragonIntro: PropTypes.string,
  autoStart: PropTypes.bool,
  dragonTypingSpeed: PropTypes.number,
  dragonGapMs: PropTypes.number,
  dragonDock: PropTypes.oneOf(["left", "center", "right"]),
  dragonOffsetY: PropTypes.string,
};
