import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import AddButton from "./AddButton";
import DoneSection from "./DoneSection";
import ErrorSection from "./ErrorSection";
import FallingEmojis from "./FallingEmojis";
import InputSection from "./InputSection";
import LoadingSection from "./LoadingSection";
import Wanderer from "./Wanderer";
import styles from "./AddFlow.module.css";

type Stage = "idle" | "input" | "loading" | "done" | "error";

// 로딩 화면(스피너)이 너무 짧게(예: 100ms) 반짝이고 사라지면 어색해서,
// 실제 요청이 이보다 빨리 끝나도 최소 이만큼은 보여준다.
const MIN_LOADING_MS = 1200;

const CARD_SCALE = 1.2;

// 브라운관 TV 전원 온/오프 느낌: 켜질 때는 가로로 얇은 빛의 띠가 먼저 (거의)
// 순간적으로 펼쳐지고, 그 다음 그 띠가 위아래로 확 펼쳐지며 화면을 채운다
// (scaleX가 먼저 끝나고, scaleY가 살짝 늦게 시작해 튀듯이 펼쳐짐).
// 꺼질 때는 반대로 세로가 먼저 얇아져 가로 띠가 되고, 그 띠가 가로로
// 줄어들며 사라진다 — CRT 특유의 "그림 → 가로줄 → 점" 순서를 흉내낸다.
const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    scaleX: 0.04,
    scaleY: 0.02,
    transition: {
      scaleY: { duration: 0.18, ease: "easeIn" },
      scaleX: { duration: 0.14, delay: 0.16, ease: "easeIn" },
      opacity: { duration: 0.1, delay: 0.28 },
    },
  },
  visible: {
    opacity: 1,
    scaleX: CARD_SCALE,
    scaleY: CARD_SCALE,
    transition: {
      opacity: { duration: 0.08 },
      scaleX: { duration: 0.14, ease: "easeOut" },
      scaleY: { duration: 0.3, delay: 0.12, ease: [0.34, 1.4, 0.64, 1] },
    },
  },
};

// 5단계: URL 제출 → 실제로 api/notify(슬랙 웹훅)를 호출한다. "레퍼런스
// 등록" 자체는 이 요청이 하지 않는다 — 알림만 가고, 사람이 링크를 검토한
// 뒤 나중에 refs.ts에 직접 추가하는 워크플로(사용자가 정한 방식)라 이걸로
// 충분하다. 같은 카드(모달)를 유지한 채 안쪽 내용만 Input → Loading →
// Done/Error로 바꾼다 — 카드 자체가 매번 접혔다 펼쳐지지 않고 내용만
// 전환되는 게 자연스러워서, backdrop/card는 이 스테이지들 동안 계속
// 마운트 상태를 유지한다. Loading 중엔 배경 클릭/Escape로 닫히지 않는다
// (요청이 끝날 때까지 취소 못 하게).
export default function AddFlow() {
  const [stage, setStage] = useState<Stage>("idle");
  // 4대째 맞은 순간부터 버튼은 그 자리에 "죽은" 것처럼 멈춘 채 피를 흘린다.
  // 모달을 닫고 idle 로 돌아오면 AddButton 이 언마운트됐다 새로 뜨므로 여기서
  // 같이 풀어줘야 다시 떠다닌다.
  const [buttonDead, setButtonDead] = useState(false);

  // idle 로 돌아오면 버튼이 새로 마운트되므로 "죽은" 상태도 같이 푼다.
  useEffect(() => {
    if (stage === "idle") setButtonDead(false);
  }, [stage]);

  useEffect(() => {
    if (stage !== "input" && stage !== "done" && stage !== "error") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStage("idle");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stage]);

  const submitUrl = async (url: string) => {
    setStage("loading");
    const startedAt = Date.now();
    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) throw new Error(`notify failed: ${response.status}`);

      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((resolve) => window.setTimeout(resolve, MIN_LOADING_MS - elapsed));
      }
      setStage("done");
    } catch (err) {
      console.error("[ref-vault] failed to notify:", err);
      setStage("error");
    }
  };

  const modalOpen = stage !== "idle";
  const canDismiss = stage === "input" || stage === "done" || stage === "error";

  return (
    <>
      {stage === "idle" && (
        <Wanderer frozen={buttonDead}>
          <AddButton onClick={() => setStage("input")} onFinalHit={() => setButtonDead(true)} />
        </Wanderer>
      )}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={() => {
              if (canDismiss) setStage("idle");
            }}
          >
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {stage === "input" && <InputSection onSubmit={submitUrl} />}
              {stage === "loading" && <LoadingSection />}
              {stage === "done" && <DoneSection />}
              {stage === "error" && <ErrorSection onRetry={() => setStage("input")} />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {stage === "done" && (
        // Done 카드 안이 아니라 화면 전체를 덮는 별도 레이어 — 카드보다도
        // 위(backdrop보다 높은 z-index)에 떠 있고, 클릭은 그대로 아래로
        // 통과시킨다.
        <div className={styles.fullscreenConfetti} aria-hidden>
          <FallingEmojis
            text="🎉🎊✨💛😊🙌🎁👍✨🎉🎊💛"
            direction="top"
            amount={40}
            minSize={18}
            maxSize={34}
            minSpeed={16}
            maxSpeed={22}
            minShake={20}
            maxShake={50}
            coverage={100}
          />
        </div>
      )}
    </>
  );
}
