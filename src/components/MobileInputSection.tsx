import { useState } from "react";
import submitButtonSvg from "../assets/submit-button.svg?raw";
import textfieldBorder from "../assets/textfield-border.svg?raw";
import styles from "./MobileInputSection.module.css";

interface MobileInputSectionProps {
  onSubmit: (url: string) => void;
}

// 데스크탑 InputSection/SubmitButton과 같은 손그림 외곽선(SVG)을 그대로
// 쓰되, 회피 애니메이션 같은 데스크탑 전용 물리 연출은 뺐다 — 두 SVG 모두
// 원본이 고정 픽셀(528x98, 160x65)이라 카드 폭에 맞춰 aspect-ratio 로
// 비율만 유지한 채 줄어들게 CSS 에서 새로 사이징했다.
export default function MobileInputSection({ onSubmit }: MobileInputSectionProps) {
  const [value, setValue] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [showError, setShowError] = useState(false);
  const hasValue = value.trim().length > 0;

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
          autoComplete="off"
        />
        {showError && <p className={styles.errorText}>X Not a link address type</p>}
      </div>
      <button
        type="button"
        className={`${styles.submitWrap} ${hasValue ? "" : styles.submitInactive}`}
        aria-label="Submit"
        onClick={submit}
        dangerouslySetInnerHTML={{ __html: submitButtonSvg }}
      />
    </div>
  );
}
