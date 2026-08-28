import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import submitButtonSvg from "../assets/submit-button.svg?raw";
import styles from "./SubmitButton.module.css";

interface SubmitButtonProps {
  onClick: () => void;
  /** URL을 입력하기 전(빈 값)엔 플레이스홀더와 같은 60% 오퍼시티로 흐리게,
   *  값이 생기면 원래 색(100%)으로 활성화된다. */
  active: boolean;
  /** 값은 있지만 URL 형식이 아닐 때 — 누를 때마다 사방으로 도망친다. */
  evasive: boolean;
}

interface DodgeState {
  active: boolean;
  x: number;
  y: number;
}

// 좌우는 패널 안에 여유가 많아서 크게, 위아래는 텍스트 필드/에러 문구가
// 있는 100px 간격 안에서만 움직여야 해서 훨씬 작게 잡는다 — 필드 쪽으로
// 안 겹치도록. 데스크탑 전용 컴포넌트(AddFlow) — 모바일은 MobileAddFlow가
// 별도의 단순한 Submit 버튼을 쓴다.
const DODGE_X_DISTANCE = 150;
const DODGE_Y_DISTANCE = 55;
const DODGE_OFFSETS: ReadonlyArray<{ x: number; y: number }> = [
  { x: DODGE_X_DISTANCE, y: 0 },
  { x: -DODGE_X_DISTANCE, y: 0 },
  { x: 0, y: -DODGE_Y_DISTANCE },
  { x: 0, y: DODGE_Y_DISTANCE },
];
const DODGE_IDLE: DodgeState = { active: false, x: 0, y: 0 };

// Figma node 10176:568(default) / 10176:570(hover) export를 그대로 임베드한다 —
// AddButton과 같은 이유로 손그림 외곽선 벡터를 그대로 쓴다.
// src/assets/submit-button.svg 참고.
//
// active(입력값이 생김) 상태에선 "눌러달라"는 듯 위아래로 살짝 스프링처럼
// 계속 통통 튀고, 비활성 상태로 돌아가면 제자리(y:0)로 가라앉는다.
//
// evasive(값은 있는데 URL이 아님) 상태에선 "클릭할 때" 상하좌우 중 무작위
// 방향으로 홱 피한다(직전과 같은 방향은 다시 안 뽑히게). 원래는 호버로
// 트리거했는데 커서가 닿기만 해도 이동해버려 클릭 자체가 안 됐어서 클릭
// 트리거로 바꿨고, 도망가면서 동시에 onClick(부모의 submit)도 호출해
// 에러 문구가 뜨게 한다. evasive인 동안은 "눌러달라" 바운스는 잠깐 멈춘다
// (도망다니면서 동시에 위아래로 통통 튀면 두 모션이 섞여 헷갈린다).
export default function SubmitButton({ onClick, active, evasive }: SubmitButtonProps) {
  const [dodge, setDodge] = useState<DodgeState>(DODGE_IDLE);

  // URL이 유효해지거나 값이 비면 도망 상태를 풀고 제자리로 돌아온다.
  useEffect(() => {
    if (!evasive) setDodge(DODGE_IDLE);
  }, [evasive]);

  const handleClick = () => {
    if (evasive) {
      setDodge((prev) => {
        let next = DODGE_OFFSETS[Math.floor(Math.random() * DODGE_OFFSETS.length)];
        for (let guard = 0; next.x === prev.x && next.y === prev.y && guard < 5; guard++) {
          next = DODGE_OFFSETS[Math.floor(Math.random() * DODGE_OFFSETS.length)];
        }
        return { active: true, x: next.x, y: next.y };
      });
    }
    onClick();
  };

  const bouncing = active && !evasive;
  const dodging = evasive && dodge.active;

  return (
    <motion.button
      type="button"
      className={`${styles.root} ${active ? "" : styles.inactive}`}
      aria-label="Submit"
      onClick={handleClick}
      animate={{
        x: dodging ? dodge.x : 0,
        y: bouncing ? [0, -7, 0] : dodging ? dodge.y : 0,
      }}
      transition={{
        x: { type: "spring", stiffness: 500, damping: 20 },
        y: bouncing
          ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
          : { type: "spring", stiffness: 500, damping: 20 },
      }}
    >
      <span className={styles.svgWrap} dangerouslySetInnerHTML={{ __html: submitButtonSvg }} />
    </motion.button>
  );
}
