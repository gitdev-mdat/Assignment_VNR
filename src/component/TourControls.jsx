import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import styles from "../styles/TourControls.module.css";

/**
 * Props:
 * - steps: array of steps (each may have .narration string)
 * - current: index
 * - playing: bool
 * - onPlay: toggle play/pause
 * - onNext, onPrev, onSeek(index), onStop
 */

const TourControls = ({
  steps = [],
  current = 0,
  playing = false,
  onPlay,
  onNext,
  onPrev,
  onSeek,
}) => {
  const total = steps.length;
  const pct = total ? Math.round(((current + 1) / total) * 100) : 0;

  // TTS state
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1.0); // 0.8..1.4
  const isInitialMount = useRef(true);
  const activeSpeakRef = useRef(null);

  // util: clamp
  const clampIndex = (i) =>
    Math.max(
      0,
      Math.min(Number.isInteger(i) ? i : 0, Math.max(0, steps.length - 1))
    );

  // Speak current step when playing or when current changes (if not muted)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }

    const step = steps[current];
    try {
      if (typeof tts.stop === "function") tts.stop();
    } catch (e) {}
    activeSpeakRef.current = null;

    if (!muted && playing && step && step.narration) {
      const delay = 600;
      const timeout = setTimeout(async () => {
        try {
          const p = tts?.speak?.(step.narration, { rate: speed });
          activeSpeakRef.current = p || true;
        } catch (err) {}
      }, delay);

      return () => {
        clearTimeout(timeout);
        try {
          if (typeof tts.stop === "function") tts.stop();
        } catch (e) {}
      };
    }

    return undefined;
  }, [playing, current, muted, speed, steps]);

  useEffect(() => {
    return () => {
      try {
        if (typeof tts.stop === "function") tts.stop();
      } catch (e) {}
    };
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (next) {
      try {
        if (typeof tts.stop === "function") tts.stop();
      } catch (e) {}
    } else {
      if (playing && steps[current]?.narration) {
        try {
          tts.speak?.(steps[current].narration, { rate: speed });
        } catch (e) {}
      }
    }
  };

  const onSpeedChange = (e) => {
    const v = Number(e.target.value);
    setSpeed(v);
    if (!muted && playing && steps[current]?.narration) {
      try {
        if (typeof tts.stop === "function") tts.stop();
        tts.speak?.(steps[current].narration, { rate: v });
      } catch (e) {}
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <button className={styles.iconBtn} onClick={onPrev} title="Previous">
          <ChevronLeft size={18} />
        </button>

        <button
          className={`${styles.playBtn} ${playing ? styles.playing : ""}`}
          onClick={() => {
            onPlay?.();
            if (playing) {
              try {
                if (typeof tts.stop === "function") tts.stop();
              } catch (e) {}
            }
          }}
          title={playing ? "Pause tour" : "Play tour"}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}{" "}
          <span>{playing ? "Pause" : "Play tour"}</span>
        </button>

        <button className={styles.iconBtn} onClick={onNext} title="Next">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className={styles.center}>
        <div
          className={styles.progressBar}
          onClick={(e) => {
            if (!steps.length) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const pctClick = Math.min(Math.max(x / rect.width, 0), 1); // clamp 0..1
            const idx = clampIndex(Math.floor(pctClick * steps.length));
            try {
              if (typeof tts.stop === "function") tts.stop();
            } catch {}
            onSeek?.(idx);
          }}
        >
          <div className={styles.progress} style={{ width: `${pct}%` }} />
        </div>
        <div className={styles.stepLabel}>
          <strong>{steps[current]?.title ?? "–"}</strong>
          <span className={styles.stepInfo}>
            {total ? `${current + 1} / ${total}` : "0 / 0"}
          </span>
        </div>
      </div>

      <div className={styles.right}>
        {/* TTS controls (mute + speed) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginRight: 8,
          }}
        >
          <button
            className={styles.iconBtn}
            onClick={toggleMute}
            title={muted ? "Unmute narration" : "Mute narration"}
            aria-pressed={muted}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 140,
            }}
          >
            <input
              aria-label="Narration speed"
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={speed}
              onChange={onSpeedChange}
              style={{ width: 120 }}
            />
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.9)",
                marginTop: 4,
              }}
            >
              tốc độ: <strong>{speed.toFixed(2)}×</strong>
            </div>
          </div>
        </div>

        {/* mini timeline thumbnails */}
        <div className={styles.thumbs}>
          {steps.map((s, i) => (
            <button
              key={s?.id ?? i}
              className={`${styles.thumb} ${
                i === current ? styles.activeThumb : ""
              }`}
              onClick={() => {
                try {
                  if (typeof tts.stop === "function") tts.stop();
                } catch {}
                onSeek?.(clampIndex(i));
              }}
              title={s?.title ?? `Bước ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TourControls;
