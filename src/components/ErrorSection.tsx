import styles from "./ErrorSection.module.css";

interface ErrorSectionProps {
  onRetry: () => void;
}

// Figma엔 없는 화면 — 백엔드 연동을 실제로 하면서 실패 케이스가 생겨서
// 최소한의 형태로 만들었다. 카드 전체를 누르면 다시 Input으로 돌아간다.
export default function ErrorSection({ onRetry }: ErrorSectionProps) {
  return (
    <button type="button" className={styles.panel} onClick={onRetry}>
      <p className={styles.title}>Something went wrong</p>
      <p className={styles.subtext}>Couldn&rsquo;t send the notification. Tap to try again.</p>
    </button>
  );
}
