import styles from "./TexturedBackground.module.css";

// 메인 그레이 배경 위에 화이트/블랙 블롭을 각기 다른 속도로 떠다니게 하고,
// 그 위에 그레인(노이즈) 텍스처를 얹어 살아 움직이는 듯한 질감을 만든다.
export default function TexturedBackground() {
  return (
    <div className={styles.root} aria-hidden>
      <div className={`${styles.blob} ${styles.blobWhite}`} />
      <div className={`${styles.blob} ${styles.blobBlack}`} />
      <div className={`${styles.blob} ${styles.blobBlack2}`} />
      <div className={`${styles.blob} ${styles.blobWhite2}`} />
      <div className={styles.grain} />
    </div>
  );
}
