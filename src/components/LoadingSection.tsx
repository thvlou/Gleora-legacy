import { useEffect, useState } from "react";
import eyeIcon from "../assets/loading-eye.svg?raw";
import styles from "./LoadingSection.module.css";

// Figma node 10175:504. 손그림 동그라미 아이콘(loading-eye.svg) 두 개를 캐릭터의
// 눈처럼 각자 반대 방향으로 계속 돌리고("동글동글"), 하단 문구의 마지막
// 점만 ".." ↔ "..." 로 왔다갔다 하며 로딩 중임을 표현한다.
const DOT_STATES = ["..", "..."];
const DOT_INTERVAL_MS = 450;

export default function LoadingSection() {
  const [dotIndex, setDotIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setDotIndex((i) => (i + 1) % DOT_STATES.length);
    }, DOT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={styles.panel}>
      <div className={styles.eyes}>
        <span className={`${styles.eye} ${styles.eyeLeft}`} aria-hidden dangerouslySetInnerHTML={{ __html: eyeIcon }} />
        <span className={`${styles.eye} ${styles.eyeRight}`} aria-hidden dangerouslySetInnerHTML={{ __html: eyeIcon }} />
      </div>
      <p className={styles.text}>
        I&rsquo;m checking it {DOT_STATES[dotIndex]}
      </p>
    </div>
  );
}
