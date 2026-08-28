import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useAnimationControls } from "framer-motion";
import styles from "./AddButton.module.css";

// 글래스 배경도, 손그림/네온 외곽선도 없이 텍스트만 남겼다 — 사이트 전체가
// 쓰는 "dim 회색 ↔ 메인 옐로" 색 전환 언어(HoverImageReveal의 dimColor/
// textColor와 동일)를 그대로 가져와서, 텍스트 자체가 버튼처럼 보이고
// 작동하게 한다. 색 전환은 호버가 아니라 오직 "때린 횟수"로만 일어난다.
// 데스크탑 전용 컴포넌트 — 모바일은 MobileAddFlow 가 별도로 담당한다.
const LABEL = "Hit me !";
// 드립이 흘러내릴 글자 — "Hit me !" 의 m.
const DRIP_ANCHOR_INDEX = LABEL.indexOf("m");

const FONT: CSSProperties = {
  fontFamily: '"PP Palma Fizzy Heavy", "Inter", sans-serif',
  fontSize: "30px",
  fontWeight: 400,
  lineHeight: "0.9em",
  letterSpacing: "-0.02em",
};

// 드립(피가 흘러내리는) 애니메이션 길이 — CSS 의 rv-drip-run 과 맞춘다.
const DRIP_DURATION_MS = 1600;
// 네 대면 가득 찬다. 중간 단계는 딱 떨어지는 25% 간격 대신 살짝 불규칙하게
// 둬서 "정직하게 계산된" 느낌이 아니라 손맛으로 차오르는 느낌을 준다.
const FILL_STEPS = [0.29, 0.53, 0.79, 1];
// 매 타격마다 중간 단계에만 아주 약간의 흔들림을 준다(마지막 타격은 항상
// 가득 차야 하므로 제외) — 그래서 타격 횟수는 항상 4로 고정된다.
const STEP_JITTER = 0.04;

interface AddButtonProps {
  onClick: () => void;
  /** 마지막(4대째) 타격 순간 — 이때부터 버튼은 그 자리에 멈춘다. */
  onFinalHit?: () => void;
}

export default function AddButton({ onClick, onFinalHit }: AddButtonProps) {
  const [hits, setHits] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dripping, setDripping] = useState(false);
  const [dripLeft, setDripLeft] = useState<number | null>(null);
  const punchControls = useAnimationControls();
  const stageRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);

  // 드립이 정확히 "m" 글자 아래에서 떨어지도록, 실제 렌더된 글자 위치를
  // 재서 x를 구한다 — 폰트/자간에 따라 달라지므로 하드코딩하지 않는다.
  useLayoutEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      const anchor = anchorRef.current;
      if (!stage || !anchor) return;
      const stageRect = stage.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      setDripLeft(anchorRect.left - stageRect.left + anchorRect.width / 2);
    };
    measure();
    void document.fonts?.ready.then(measure);
  }, []);

  const handleHit = () => {
    if (dripping) return;

    const nextHits = Math.min(FILL_STEPS.length, hits + 1);
    const isFinal = nextHits >= FILL_STEPS.length;
    const base = FILL_STEPS[nextHits - 1];
    const next = isFinal ? 1 : Math.min(0.95, base + (Math.random() * 2 - 1) * STEP_JITTER);

    setHits(nextHits);
    setProgress(next);
    // 주변으로 튀는 스플래시 없이, 글자 자체가 눌렸다 튕겨나오는 스쿼시만.
    punchControls.start(
      {
        scaleX: [1, 1.22, 0.86, 1.04, 1],
        scaleY: [1, 0.6, 1.14, 0.96, 1],
      },
      { duration: 0.42, ease: "easeInOut" }
    );

    if (isFinal) {
      setDripping(true);
      onFinalHit?.();
      window.setTimeout(onClick, DRIP_DURATION_MS);
    }
  };

  return (
    <button type="button" className={styles.root} aria-label={LABEL} onClick={handleHit}>
      <motion.div ref={stageRef} className={styles.punchStage} animate={punchControls}>
        <p className={`${styles.label} ${styles.baseText}`} style={FONT} aria-hidden>
          {LABEL}
        </p>

        <div
          className={styles.fillOverlay}
          style={{ clipPath: `inset(${(1 - progress) * 100}% 0 0 0)` }}
          aria-hidden
        >
          <p className={`${styles.label} ${styles.fillText}`} style={FONT}>
            {Array.from(LABEL).map((character, index) => (
              <span key={index} ref={index === DRIP_ANCHOR_INDEX ? anchorRef : undefined}>
                {character}
              </span>
            ))}
          </p>
        </div>

        {dripping && dripLeft !== null && (
          <div className={styles.dripLayer} aria-hidden>
            <span className={styles.dripTrail} style={{ left: dripLeft }} />
          </div>
        )}
      </motion.div>
    </button>
  );
}
