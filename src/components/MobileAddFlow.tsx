import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DoneSection from "./DoneSection";
import ErrorSection from "./ErrorSection";
import FallingEmojis from "./FallingEmojis";
import LoadingSection from "./LoadingSection";
import MobileInputSection from "./MobileInputSection";
import styles from "./MobileAddFlow.module.css";

type Stage = "idle" | "input" | "loading" | "done" | "error";

// 로딩 화면(스피너)이 너무 짧게 반짝이고 사라지면 어색해서, 실제 요청이
// 이보다 빨리 끝나도 최소 이만큼은 보여준다 — AddFlow와 동일.
const MIN_LOADING_MS = 1200;

// 모바일 전용 제출 플로우. API 호출·상태 흐름(idle→input→loading→
// done/error)은 데스크탑 AddFlow와 완전히 같지만, 화면을 떠다니는 Hit me
// 버튼·손그림 SVG 필드·회피 애니메이션 같은 데스크탑 전용 물리 연출은
// 없다 — 좁은 화면에 그대로 욱여넣으면 여러 인터랙션이 한 화면에 밀집돼
// 오히려 어색해지기 때문에(실제로 그렇게 보였다), 색·폰트·배경 같은
// 디자인 값은 데스크탑과 동일하게 유지한 채 트리거는 고정 버튼 탭 한 번,
// 카드는 화면 중앙에 뜨는 단순한 페이드+스케일로 다시 만들었다.
export default function MobileAddFlow() {
  const [stage, setStage] = useState<Stage>("idle");

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
        <button
          type="button"
          className={styles.trigger}
          aria-label="Hit me !"
          onClick={() => setStage("input")}
        >
          Hit me !
        </button>
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
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {stage === "input" && <MobileInputSection onSubmit={submitUrl} />}
              {stage === "loading" && <LoadingSection />}
              {stage === "done" && <DoneSection />}
              {stage === "error" && <ErrorSection onRetry={() => setStage("input")} />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {stage === "done" && (
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
