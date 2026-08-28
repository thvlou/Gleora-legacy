import { useState } from "react";
import textfieldBorder from "../assets/textfield-border.svg?raw";
import SubmitButton from "./SubmitButton";
import styles from "./InputSection.module.css";

interface InputSectionProps {
  onSubmit: (url: string) => void;
}

// Figma node 10175:496. 텍스트 필드는 디자인상 정적 placeholder 텍스트지만
// 실제로는 URL을 입력받아야 하므로, 손그림 외곽선(Figma export SVG, 임의
// 수정 불가 영역)은 배경으로 그대로 두고 그 위에 진짜 <input>을 올렸다 —
// 사용자가 "텍스트 필드 레이아웃 설정은 임의로 수정해도 된다"고 허용한 부분.
export default function InputSection({ onSubmit }: InputSectionProps) {
  const [value, setValue] = useState("");
  // type="url" input의 네이티브 유효성 검사를 그대로 활용 — 비어있으면 valid,
  // URL 형식이 아닌 일반 텍스트면 invalid로 잡힌다.
  const [isValidUrl, setIsValidUrl] = useState(true);
  // "Not a link address type" 문구는 타이핑 중엔 안 뜨고, Submit을 실제로
  // 눌렀을 때만 뜬다 — 다시 입력을 고치기 시작하면 다음 시도 전까지 숨긴다.
  const [showError, setShowError] = useState(false);
  const hasValue = value.trim().length > 0;
  // 값은 있는데 URL 형식이 아닐 때만 "도망" 모드 — 빈 값이거나 제대로 된
  // URL이면 평범하게 눌린다.
  const evasive = hasValue && !isValidUrl;

  const submit = () => {
    const url = value.trim();
    if (!url) return;
    if (!isValidUrl) {
      setShowError(true);
      return;
    }
    onSubmit(url);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.fieldWrap}>
        <span
          className={`${styles.fieldBorder} ${hasValue ? "" : styles.fieldBorderDim}`}
          aria-hidden
          dangerouslySetInnerHTML={{ __html: textfieldBorder }}
        />
        <input
          type="url"
          className={styles.field}
          placeholder="Plz input urls.."
          aria-label="Reference URL"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setIsValidUrl(e.target.validity.valid);
            setShowError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          autoFocus
          autoComplete="off"
        />
        {showError && <p className={styles.errorText}>X Not a link address type</p>}
      </div>
      <SubmitButton onClick={submit} active={hasValue} evasive={evasive} />
    </div>
  );
}
