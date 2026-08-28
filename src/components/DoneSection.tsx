import { motion } from "framer-motion";
import styles from "./DoneSection.module.css";

// Figma node 10181:618. "Done complete!" + 안내 문구는 실제로는 즉시 완료가
// 아니라(등록은 나중에 검토 후 처리) "며칠 걸릴 수 있다"는 문구로 되어
// 있다 — 로딩 화면 얘기할 때 나온 것과 같은 이유.
//
// 텍스트는 폭죽 터지듯 튕겨 나오는 스프링 팝인으로 등장한다. 떨어지는
// 이모지(FallingEmojis)는 이 카드 안이 아니라 화면 전체를 덮도록
// AddFlow에서 별도 풀스크린 레이어로 띄운다.
const POP_TRANSITION = { type: "spring" as const, stiffness: 320, damping: 11 };

export default function DoneSection() {
  return (
    <div className={styles.panel}>
      <div className={styles.content}>
        <motion.p
          className={styles.title}
          initial={{ scale: 0, rotate: -14, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={POP_TRANSITION}
        >
          Done complete!
        </motion.p>
        <motion.div
          className={styles.subtextWrap}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...POP_TRANSITION, delay: 0.15 }}
        >
          <p className={styles.subtext}>Registration may take a few hours or a few days.</p>
          <span className={styles.underline} aria-hidden />
        </motion.div>
      </div>
    </div>
  );
}
