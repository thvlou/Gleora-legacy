import AddFlow from "./components/AddFlow";
import HoverImageReveal from "./components/HoverImageReveal";
import MobileAddFlow from "./components/MobileAddFlow";
import TexturedBackground from "./components/TexturedBackground";
import { REFS } from "./data/refs";
import { MOBILE_QUERY, useMediaQuery } from "./lib/useMediaQuery";
import styles from "./App.module.css";

export default function App() {
  // 데스크탑/터치 레이어와 같은 기준으로 제출 플로우도 완전히 다른
  // 컴포넌트를 쓴다 — 모바일은 화면을 떠다니는 버튼·손그림 SVG 필드 같은
  // 데스크탑 전용 물리 연출 없이 색·폰트만 같은 단순한 버전.
  const isMobile = useMediaQuery(MOBILE_QUERY);

  return (
    <div className={styles.app}>
      <TexturedBackground />
      <main className={styles.main}>
        <div className={styles.desktopLayer}>
          <HoverImageReveal items={REFS} />
        </div>
        <div className={styles.touchLayer}>
          <HoverImageReveal items={REFS} inputMode="touch" />
        </div>
      </main>
      {isMobile ? <MobileAddFlow /> : <AddFlow />}
    </div>
  );
}
