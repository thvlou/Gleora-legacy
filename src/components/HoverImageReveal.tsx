/* Source: Originkit — Hover Image Reveal
   https://www.originkit.dev/components/hover-image-reveal
   이 프로젝트에 맞게 수정됨 */
"use client";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  type MotionValue,
  type Transition as MotionTransition,
} from "framer-motion";
import type { Ref } from "../data/refs";
import ExtrudedLogoPanel from "./ExtrudedLogoPanel";
import styles from "./HoverImageReveal.module.css";

interface FontValue {
  fontSize?: number | string;
  letterSpacing?: number | string;
  lineHeight?: number | string;
  [key: string]: unknown;
}
interface HoverImageRevealProps {
  items: Ref[];
  font?: FontValue;
  textColor?: string;
  dimColor?: string;
  align?: "left" | "center" | "right";
  rowGap?: number;
  imageWidth?: number; // 로고 카드의 최소 너비. 긴 이름은 실제 텍스트 폭에 맞춰 이보다 넓어진다
  imageHeight?: number;
  rounded?: number;
  offsetX?: number;
  offsetY?: number;
  followStrength?: number;
  transition?: MotionTransition;
  backgroundColor?: string;
  style?: CSSProperties;
  onHoverChange?: (index: number | null) => void;
  // "wheel"(기본, 데스크탑) = 휠 이벤트 한 칸씩 + 커서를 따라다니는 로고 카드.
  // "touch"(모바일) = 손가락 드래그 + 관성 스크롤 + 롱프레스로 화면 중앙에
  // 로고 카드. 캐러셀 자체(무한 벨트, 폰트 크기, 색 전환)는 완전히 동일한
  // 컴포넌트를 그대로 재사용하고 입력 방식과 카드 표시 위치만 다르다.
  inputMode?: "wheel" | "touch";
}

const MIN_FONT_PX = 28;
const MAX_FONT_PX = 61;
const LINE_HEIGHT_RATIO = 0.9;
const CONTAINER_PADDING = 24;

// 캐러셀은 실제 레퍼런스 개수와 무관하게 항상 이만큼만 화면에 보여준다 —
// 레퍼런스가 늘어나도 섹션 크기·폰트 크기가 계속 줄어들지 않도록 하기 위함.
const VISIBLE = 10;
// 화면에 보이는 10개 위아래로 몇 개를 더 마운트해둘지. 스크롤이 빨라도
// 화면 경계에서 내용이 "팝인"하지 않도록 미리 렌더해두는 여유분이다.
const BUFFER = 2;
const SLOT_COUNT = VISIBLE + BUFFER * 2;

const DEFAULT_FONT_BASE: Omit<FontValue, "fontSize"> = {
  fontFamily: '"PP Palma Fizzy Heavy", "Inter", sans-serif',
  fontWeight: 400,
  lineHeight: "0.9em",
  letterSpacing: "-0.05em",
  textAlign: "left",
};

// 실제 레퍼런스 개수(list.length)가 아니라 고정된 VISIBLE(10) 기준으로
// 폰트 크기를 계산한다 — 레퍼런스가 늘어나도 항상 "10개가 꽉 찬" 크기를 유지한다.
function computeFitFontPx(itemCount: number, rowGap: number, width: number, height: number): number {
  if (width <= 0 || height <= 0) return MAX_FONT_PX;
  const verticalGaps = Math.max(itemCount - 1, 0) * rowGap;
  const heightTerm = (height - CONTAINER_PADDING * 2 - verticalGaps) / (itemCount * LINE_HEIGHT_RATIO);
  const widthTerm = width * 0.062;
  return Math.min(MAX_FONT_PX, Math.max(MIN_FONT_PX, Math.min(widthTerm, heightTerm)));
}

const DEFAULT_TRANSITION: MotionTransition = {
  type: "spring",
  stiffness: 400,
  damping: 40,
  mass: 1,
};
const alignToText: Record<string, CSSProperties["textAlign"]> = {
  left: "left",
  center: "center",
  right: "right",
};
// 행 전체(100% 너비) 어디를 눌러도 호버가 발동하던 문제 수정용 — 실제
// 텍스트 폭만큼만 히트 영역이 생기도록, 정렬을 flex justify-content로도
// 매핑해서 링크(<a>)를 텍스트 크기에 맞춰(fit-content) 정렬한다.
const alignToJustify: Record<string, CSSProperties["justifyContent"]> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

// 로고 카드 너비 = 측정된 텍스트 폭 + 여유. 회전 중엔 압출된 입체가 살짝
// 더 넓어 보일 수 있어 배율(1.15)로 조금 더 여유를 둔다. 짧은 이름(GODLY 등)
// 은 imageWidth(prop, 기본 300) 를 최소 너비로 써서 카드가 옹색해지지 않게 한다.
const CARD_WIDTH_MARGIN = 48;
const CARD_WIDTH_SAFETY_SCALE = 1.15;

// 터치 모드에서 커서 호버를 대신하는 롱프레스 트리거. 이 시간 이상 누르고
// 있으면 카드가 뜨고, 그 전에 이 거리 이상 손가락이 움직이면 스크롤 의도로
// 보고 취소한다 — 컨테이너 레벨의 드래그 판정도 같은 거리 기준을 쓴다.
const LONG_PRESS_MS = 450;
const MOVE_CANCEL_PX = 10;

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

// 로고 카드 너비를 각 레퍼런스의 실제 텍스트 폭에 맞추기 위한 측정. 폰트를
// 고정 크기(300px)에 억지로 욱여넣으면 "CALL TO INSPIRATION" 같은 긴 이름은
// 원래 40px 크기 그대로 회전하지 못하고 카드 overflow:hidden 에 잘린다.
// 캔버스 measureText 는 레이아웃을 건드리지 않고도 실제 렌더 폭을 알려준다.
let measureCanvasCtx: CanvasRenderingContext2D | null = null;
function measureTextWidth(text: string, font: string): number {
  if (!measureCanvasCtx) {
    measureCanvasCtx = document.createElement("canvas").getContext("2d");
  }
  if (!measureCanvasCtx) return 0;
  measureCanvasCtx.font = font;
  return measureCanvasCtx.measureText(text).width;
}

// wheel 이벤트의 deltaY "크기"는 브라우저/장치/deltaMode(픽셀·줄·페이지)에
// 따라 제각각이라 이동 거리 계산에 쓰기엔 신뢰할 수 없다 (실제로 트랙패드와
// 일반 마우스 휠 사이에서 값이 크게 달라 문제가 됐었다). 대신 방향(부호)만
// 쓰고, 휠 이벤트 하나당 정확히 한 행만 이동시킨다 — 이러면 어떤 장치든
// "한 클릭 = 한 칸"이 항상 보장되고, 빠르게 여러 번 돌리면 이벤트가 그만큼
// 여러 번 들어와 자연스럽게 더 빨리 움직인다.
function wheelDirection(e: WheelEvent): -1 | 0 | 1 {
  return Math.sign(e.deltaY) as -1 | 0 | 1;
}

interface CarouselSlotProps {
  slotIndex: number;
  offset: MotionValue<number>;
  rowPitch: number;
  baseIndex: number;
  items: Ref[];
  hovered: number | null;
  align: "left" | "center" | "right";
  textColor: string;
  dimColor: string;
  transition: MotionTransition;
  touchMode: boolean;
  suppressClickRef: React.MutableRefObject<boolean>;
  onHoverItem: (index: number) => void;
  onLeaveItem: () => void;
  onFocusItem: (index: number, e: React.FocusEvent<HTMLAnchorElement>) => void;
  onBlurItem: (index: number) => void;
}

// 캐러셀 한 줄(슬롯). 화면에 보이는 위치(y)는 스프링으로 부드러워진 offset 을
// 그대로 구독해 프레임마다 리렌더 없이 매끄럽게 움직이고, 그 위치에 어떤 실제
// 레퍼런스를 보여줄지(realIndex)는 baseIndex 가 한 칸 넘어갈 때만(리렌더 시)
// 바뀐다. 이 둘의 조합이 "무한 벨트" 착시를 만든다: 슬롯이 한 칸 아래로
// 밀려나는 순간 정확히 그 슬롯의 내용도 한 칸 아래 레퍼런스로 바뀌어 이어붙는다.
function CarouselSlot({
  slotIndex,
  offset,
  rowPitch,
  baseIndex,
  items,
  hovered,
  align,
  textColor,
  dimColor,
  transition,
  touchMode,
  suppressClickRef,
  onHoverItem,
  onLeaveItem,
  onFocusItem,
  onBlurItem,
}: CarouselSlotProps) {
  const y = useTransform(offset, (v) => (slotIndex - BUFFER) * rowPitch - (v - baseIndex * rowPitch));
  const n = items.length;
  const realIndex = mod(baseIndex + (slotIndex - BUFFER), n);
  const item = items[realIndex];
  const isHovered = hovered === realIndex;
  const anyActive = hovered != null;
  const color = anyActive ? (isHovered ? textColor : dimColor) : textColor;
  const copyStyle: CSSProperties = {
    display: "block",
    color,
    transition: "color 0.2s ease",
    whiteSpace: "pre",
    textAlign: alignToText[align],
  };

  // 터치 모드에서 커서 호버를 대신하는 롱프레스. 짧은 탭은 그대로 링크
  // 이동으로 남겨두고, 이 이상 눌러야만 카드가 뜬다(iOS 링크 미리보기와
  // 같은 패턴) — 그래서 "탭 = 이동"이라는 기존 기대를 깨지 않는다.
  const pressTimerRef = useRef<number | undefined>(undefined);
  const pressStartRef = useRef<{ x: number; y: number } | null>(null);

  const clearPressTimer = () => {
    if (pressTimerRef.current !== undefined) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = undefined;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    pressStartRef.current = { x: touch.clientX, y: touch.clientY };
    clearPressTimer();
    pressTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = true;
      onHoverItem(realIndex);
    }, LONG_PRESS_MS);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const start = pressStartRef.current;
    if (!start) return;
    const touch = e.touches[0];
    const moved = Math.hypot(touch.clientX - start.x, touch.clientY - start.y);
    if (moved > MOVE_CANCEL_PX) {
      clearPressTimer();
      onLeaveItem();
    }
  };

  const endPress = () => {
    clearPressTimer();
    onLeaveItem();
    pressStartRef.current = null;
  };

  // 롱프레스가 실제로 발동했으면(suppressClickRef=true), 손을 뗀 뒤
  // 뒤따라오는 click 이벤트에서 링크 이동을 막는다.
  const handleClick = (e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      e.preventDefault();
      suppressClickRef.current = false;
    }
  };

  return (
    <motion.div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        y,
        display: "flex",
        justifyContent: alignToJustify[align],
        // 이 행(100% 너비) 자체는 히트 영역이 아니다 — 실제 텍스트 폭만큼만
        // 아래 <a>가 차지하고, 그 바깥 빈 공간은 클릭/호버를 그냥 통과시킨다.
        pointerEvents: "none",
      }}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
        onMouseEnter={touchMode ? undefined : () => onHoverItem(realIndex)}
        onMouseLeave={touchMode ? undefined : onLeaveItem}
        onTouchStart={touchMode ? handleTouchStart : undefined}
        onTouchMove={touchMode ? handleTouchMove : undefined}
        onTouchEnd={touchMode ? endPress : undefined}
        onTouchCancel={touchMode ? endPress : undefined}
        onClick={touchMode ? handleClick : undefined}
        onFocus={(e) => onFocusItem(realIndex, e)}
        onBlur={() => onBlurItem(realIndex)}
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "block",
          overflow: "hidden",
          // <a> 폭이 텍스트 advance폭에 딱 맞게(fit-content) 잡히는데, 폰트의
          // 실제 잉크 폭은 그보다 살짝 넘치는 경우가 있다(특히 O·S·G 같은
          // 둥근 글자, 최대 약 2px 확인됨). overflow-x 만 visible 로 분리하면
          // CSS 스펙상 브라우저가 그 값을 강제로 auto 로 바꿔버려("한쪽이
          // visible 이고 다른 쪽이 아니면 visible 쪽을 auto 로 계산") auto도
          // 박스 경계에서 그대로 잘려 효과가 없다. 대신 overflow 클립 영역이
          // content box 가 아니라 padding box 라는 점을 이용해, 오른쪽에
          // 잉크 오버슈트보다 넉넉한 여유 패딩을 둬서 그 안에서 잘리지 않게
          // 한다(REFERO 의 O 끝이 잘려 보이던 버그).
          paddingRight: 4,
          cursor: "pointer",
          pointerEvents: "auto",
        }}
      >
        <motion.div
          style={{ position: "relative" }}
          animate={{ y: isHovered ? "-100%" : "0%" }}
          transition={transition}
        >
          <span style={copyStyle}>{item.name}</span>
          <span
            aria-hidden
            style={{
              ...copyStyle,
              position: "absolute",
              top: "100%",
              left: 0,
              width: "100%",
            }}
          >
            {item.name}
          </span>
        </motion.div>
      </a>
    </motion.div>
  );
}

export default function HoverImageReveal({
  items,
  font,
  textColor = "#FFE345",
  dimColor = "#8A8A8A",
  align = "center",
  rowGap = 30,
  imageWidth = 300,
  imageHeight = 400,
  rounded = 16,
  offsetX = 200,
  offsetY = 0,
  followStrength = 0,
  transition = DEFAULT_TRANSITION,
  backgroundColor = "transparent",
  style,
  onHoverChange,
  inputMode = "wheel",
}: HoverImageRevealProps) {
  const touchMode = inputMode === "touch";
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  // 롱프레스가 발동했는지(터치 모드) — CarouselSlot 들이 공유하는 단일
  // ref. 터치포인트는 한 번에 하나뿐이라 항목별로 나눌 필요가 없다.
  const suppressClickRef = useRef(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  // 각 레퍼런스의 이름(40px)·강조 태그라인(18px) 중 더 넓은 쪽의 실제 렌더
  // 폭 — 로고 카드 너비를 여기에 맞춰서 긴 이름이 잘리지 않게 한다.
  const [nameWidths, setNameWidths] = useState<number[]>(() => items.map(() => 0));
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const stiffness = 60 + followStrength * 5;
  const springCfg = { stiffness, damping: 28, mass: 0.5 };
  const x = useSpring(rawX, springCfg);
  const y = useSpring(rawY, springCfg);

  // rawOffset 은 입력을 즉시(1:1) 누적하는 값이고, offset 은 그걸 스프링으로
  // 뒤쫓아가는 값이다 — 화면에는 offset 만 쓴다. 마우스 휠(특히 트랙패드가
  // 아닌 일반 휠)은 한 "노치"당 delta 가 크게 뚝뚝 끊겨서 들어오는데, rawOffset
  // 을 그대로 그리면 그 뚝뚝 끊김이 그대로 화면에 보여 딱딱하게 느껴진다.
  // 커서 추적 카드(x, y)와 같은 방식으로, 입력은 즉시 반영하되 화면 표현만
  // 스프링으로 매끄럽게 잇는다.
  const rawOffset = useMotionValue(0);
  const offset = useSpring(rawOffset, { stiffness: 420, damping: 38, mass: 0.6 });
  const [baseIndex, setBaseIndex] = useState(0);
  const baseIndexRef = useRef(0);
  const gateReleaseTimerRef = useRef<number | undefined>(undefined);
  // 스크롤이 진행 중인 동안은 정지된 커서 아래로 항목들이 지나가면서
  // onMouseEnter 가 계속 발동해 로고 카드가 깜빡이는 걸 막기 위한 플래그.
  // 리렌더가 필요 없는 값이라 state 대신 ref 로 둔다.
  const isScrollingRef = useRef(false);

  const list = items;
  const anyActive = hovered != null;
  // 지금 호버된 항목의 실제 텍스트 폭에 맞춘 카드 너비. 항목마다 이름 길이가
  // 다르므로(예: GODLY vs CALL TO INSPIRATION) 고정폭 대신 매번 다시 계산한다.
  const measuredWidth = hovered != null ? (nameWidths[hovered] ?? 0) : 0;
  const activeCardWidth = Math.max(imageWidth, measuredWidth * CARD_WIDTH_SAFETY_SCALE + CARD_WIDTH_MARGIN);
  const fontSizePx = computeFitFontPx(VISIBLE, rowGap, containerSize.width, containerSize.height);
  const rowPitch = fontSizePx * LINE_HEIGHT_RATIO + rowGap;
  const resolvedFont: FontValue =
    font ?? {
      ...DEFAULT_FONT_BASE,
      fontSize: `${fontSizePx}px`,
    };

  // 컨테이너 크기를 측정해 VISIBLE(10) 기준 폰트 크기를 계산한다.
  // getBoundingClientRect 로 동기 측정을 먼저 해두는 이유: ResizeObserver 의
  // 콜백은 브라우저가 실제로 페인트를 도는 시점에 맞춰 배달되는데, 탭이
  // 백그라운드(숨김) 상태면 이 배달 자체가 지연되어 크기가 0으로 멈춰있는
  // 것처럼 보일 수 있다. useLayoutEffect + 동기 측정은 그 지연과 무관하게
  // 커밋 직후 바로 값을 구해온다. ResizeObserver/윈도우 리사이즈는 이후
  // 실제 크기 변화에 대응하기 위한 용도로 계속 둔다.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // 각 항목의 이름/태그라인 실제 폭을 측정한다. 폰트가 아직 로드되기 전엔
  // 폴백 폰트로 측정되어 실제보다 좁게 나올 수 있으므로, document.fonts.ready
  // 이후 한 번 더 재측정해 정확한 값으로 갱신한다.
  useEffect(() => {
    let cancelled = false;
    const measureAll = () =>
      items.map((item) => {
        const nameW = measureTextWidth(item.name, '40px "PP Palma Fizzy Heavy"');
        const tagW = item.taglineEmphasis
          ? measureTextWidth(item.taglineEmphasis, '18px "PP Palma Fizzy Heavy"')
          : 0;
        return Math.max(nameW, tagW);
      });
    setNameWidths(measureAll());
    document.fonts?.ready.then(() => {
      if (!cancelled) setNameWidths(measureAll());
    });
    return () => {
      cancelled = true;
    };
  }, [items]);

  // baseIndex 는 offset(화면에 실제로 쓰는, 스프링으로 매끄러워진 값)이
  // 한 행(rowPitch)을 넘어갈 때만 갱신한다 — 스크롤 중 매 프레임 리렌더하지
  // 않고, 실제로 보여줄 레퍼런스가 바뀌는 시점에만 리렌더한다. rawOffset이
  // 아니라 offset 을 기준으로 삼는 이유는, 화면 위치와 그 위치에 표시되는
  // 내용(realIndex)이 항상 서로 어긋나지 않고 같이 움직이게 하기 위해서다.
  useMotionValueEvent(offset, "change", (v) => {
    if (rowPitch <= 0) return;
    const next = Math.round(v / rowPitch);
    if (next !== baseIndexRef.current) {
      baseIndexRef.current = next;
      setBaseIndex(next);
    }
  });

  const setHoveredAndNotify = (index: number | null) => {
    setHovered(index);
    onHoverChange?.(index);
  };
  // 휠 이펙트 안에서 최신 setHoveredAndNotify 를 쓰기 위한 ref — 이 함수를
  // 이펙트의 의존성 배열에 직접 넣으면 매 렌더(스크롤 중이면 매 행마다)마다
  // 리스너를 떼었다 다시 붙이게 되어 스크롤이 끊길 수 있다. 렌더마다 그냥
  // 대입만 해두면(부수효과 없음) 이펙트는 항상 최신 함수를 참조할 수 있다.
  const setHoveredAndNotifyRef = useRef(setHoveredAndNotify);
  setHoveredAndNotifyRef.current = setHoveredAndNotify;

  // 마우스 휠로 위/아래 회전 — 무한 루프(끝이 없음). 이벤트 하나당 정확히
  // 한 행(rowPitch)만 이동시킨다(속도 추정·관성 예측 없음) — 그래서 rawOffset
  // 은 항상 그리드에 딱 맞는 값만 갖고, 별도로 스냅할 필요가 없다. 화면에
  // 쓰는 offset 은 스프링이 부드럽게 뒤따라가므로, 빠르게 여러 번 돌리면
  // 이벤트가 그만큼 여러 번 들어와 자연스럽게 더 빨리 움직인다.
  useEffect(() => {
    if (touchMode) return;
    const el = listRef.current;
    if (!el || rowPitch <= 0) return;

    // 마지막 휠 이벤트 후 이 시간이 지나면 스크롤이 끝난 것으로 보고
    // 호버 카드가 다시 뜰 수 있게 푼다.
    const GATE_RELEASE_MS = 260;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      isScrollingRef.current = true;
      setHoveredAndNotifyRef.current(null);

      const direction = wheelDirection(e);
      if (direction !== 0) {
        rawOffset.set(rawOffset.get() + direction * rowPitch);
      }

      if (gateReleaseTimerRef.current !== undefined) window.clearTimeout(gateReleaseTimerRef.current);
      gateReleaseTimerRef.current = window.setTimeout(() => {
        isScrollingRef.current = false;
      }, GATE_RELEASE_MS);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [touchMode, rowPitch, rawOffset]);

  // 터치 모드: 손가락 드래그로 같은 rawOffset 을 직접 움직이고, 손을 뗀
  // 뒤에는 속도를 그대로 이어받아 마찰로 감속하는 관성 스크롤을 rAF로
  // 직접 돌린다(Wanderer.tsx 와 같은 패턴 — state 대신 motion value를 매
  // 프레임 갱신). 무한 벨트 좌표계(rawOffset/offset/baseIndex)는 휠과
  // 완전히 동일하게 재사용한다 — 입력 방식만 다르다.
  useEffect(() => {
    if (!touchMode) return;
    const el = listRef.current;
    if (!el || rowPitch <= 0) return;

    const GATE_RELEASE_MS = 260;
    const FRICTION = 0.94;
    const STOP_THRESHOLD = 0.02;
    const FRAME_MS = 16.67;

    let dragging = false;
    let hasMoved = false;
    let startY = 0;
    let startOffset = 0;
    let lastY = 0;
    let lastT = 0;
    let velocityPerMs = 0;
    let momentumFrame: number | undefined;

    const stopMomentum = () => {
      if (momentumFrame !== undefined) {
        cancelAnimationFrame(momentumFrame);
        momentumFrame = undefined;
      }
    };

    const releaseGateSoon = () => {
      if (gateReleaseTimerRef.current !== undefined) window.clearTimeout(gateReleaseTimerRef.current);
      gateReleaseTimerRef.current = window.setTimeout(() => {
        isScrollingRef.current = false;
      }, GATE_RELEASE_MS);
    };

    const onTouchStart = (e: TouchEvent) => {
      stopMomentum();
      const touch = e.touches[0];
      dragging = true;
      hasMoved = false;
      startY = touch.clientY;
      startOffset = rawOffset.get();
      lastY = touch.clientY;
      lastT = performance.now();
      velocityPerMs = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging) return;
      const touch = e.touches[0];

      if (!hasMoved) {
        // 아직 롱프레스 후보 범위(같은 기준을 CarouselSlot 도 쓴다) —
        // 여기선 아무것도 하지 않아 개별 항목의 롱프레스 타이머가 살아있게 둔다.
        if (Math.abs(startY - touch.clientY) <= MOVE_CANCEL_PX) return;
        hasMoved = true;
        isScrollingRef.current = true;
        setHoveredAndNotifyRef.current(null);
      }

      e.preventDefault();
      const delta = startY - touch.clientY;
      rawOffset.set(startOffset + delta);

      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) velocityPerMs = (lastY - touch.clientY) / dt;
      lastY = touch.clientY;
      lastT = now;
    };

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      if (!hasMoved) return; // 롱프레스/짧은 탭이었을 뿐, 드래그가 아니었다.

      let velocityPerFrame = velocityPerMs * FRAME_MS;
      let last = performance.now();

      const step = (now: number) => {
        const dt = Math.min(48, now - last);
        last = now;
        const scale = dt / FRAME_MS;
        rawOffset.set(rawOffset.get() + velocityPerFrame * scale);
        velocityPerFrame *= Math.pow(FRICTION, scale);

        if (Math.abs(velocityPerFrame) > STOP_THRESHOLD) {
          momentumFrame = requestAnimationFrame(step);
        } else {
          momentumFrame = undefined;
          releaseGateSoon();
        }
      };
      momentumFrame = requestAnimationFrame(step);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", endDrag);
    el.addEventListener("touchcancel", endDrag);
    return () => {
      stopMomentum();
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", endDrag);
      el.removeEventListener("touchcancel", endDrag);
    };
  }, [touchMode, rowPitch, rawOffset]);

  // 뷰포트 클램프: 카드가 컨테이너 밖으로 나가지 않게 한다.
  // 예전엔 오른쪽 공간이 부족해지면(spaceRight < halfW + offsetX) offsetX 부호를
  // 그 자리에서 -offsetX 로 뒤집었는데, 그 전환 지점에서 targetX 가 정확히
  // 2*offsetX(기본값 400px)만큼 순간 이동해버렸다 — 커서가 우측 끝에 가까워질
  // 때마다 로고가 "투명 벽에 튕기는" 것처럼 보이던 원인이 이거였다. 카드 폭과
  // 무관하게 모든 항목(짧은 이름 포함)에서 커서가 그 지점을 지날 때마다 매번
  // 발생했다. 부호를 뒤집는 대신 항상 +offsetX 로 두고 min/max 클램프에만
  // 맡기면, 커서가 오른쪽 끝에 가까워질수록 값이 자연스럽게 rectWidth - halfW
  // 로 수렴해 멈추고(끊김 없음), 카드가 컨테이너보다 넓은 경우(긴 이름)엔
  // min/max 를 각각 작은/큰 값으로 명시해 두 경계가 같은 값으로 붕괴해
  // 고정돼버리는 것도 함께 막는다.
  const moveCardTo = (cursorX: number, cursorY: number, rectWidth: number, rectHeight: number) => {
    const halfW = activeCardWidth / 2;
    const halfH = imageHeight / 2;

    let targetX = cursorX + offsetX;
    let targetY = cursorY + offsetY;

    const minX = Math.min(halfW, rectWidth - halfW);
    const maxX = Math.max(halfW, rectWidth - halfW);
    const minY = Math.min(halfH, rectHeight - halfH);
    const maxY = Math.max(halfH, rectHeight - halfH);
    targetX = Math.min(Math.max(targetX, minX), maxX);
    targetY = Math.min(Math.max(targetY, minY), maxY);

    rawX.set(targetX);
    rawY.set(targetY);
  };

  const onMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    moveCardTo(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
  };

  const onFocusItem = (index: number, e: React.FocusEvent<HTMLAnchorElement>) => {
    setHoveredAndNotify(index);
    const rect = containerRef.current?.getBoundingClientRect();
    const target = e.currentTarget.getBoundingClientRect();
    if (!rect) return;
    moveCardTo(
      target.left - rect.left + target.width / 2,
      target.top - rect.top + target.height / 2,
      rect.width,
      rect.height
    );
  };

  const onBlurItem = (index: number) => {
    if (hovered === index) setHoveredAndNotify(null);
  };

  const hoveredItem = hovered != null ? list[hovered] : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={touchMode ? undefined : onMove}
      onMouseLeave={touchMode ? undefined : () => setHoveredAndNotify(null)}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: CONTAINER_PADDING,
        boxSizing: "border-box",
        cursor: "default",
        ...(resolvedFont as CSSProperties),
        ...style,
      }}
    >
      {touchMode ? (
        // 터치엔 "커서"가 없으므로 카드를 따라다니게 할 기준점이 없다 —
        // 대신 화면 중앙 고정 위치에 딤 배경과 함께 띄운다(iOS 링크
        // 미리보기와 같은 패턴).
        <AnimatePresence>
          {hoveredItem && (
            <motion.div
              className={styles.touchPreviewBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              aria-hidden
            >
              <motion.div
                className={styles.touchPreviewCard}
                style={{ width: activeCardWidth, height: imageHeight, borderRadius: rounded }}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <ExtrudedLogoPanel item={hoveredItem} active />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            x,
            y,
            translateX: "-50%",
            translateY: "-50%",
            width: activeCardWidth,
            height: imageHeight,
            borderRadius: rounded,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 2,
            boxShadow: "none",
          }}
          animate={{ opacity: anyActive ? 1 : 0 }}
          transition={transition}
        >
          {hoveredItem && <ExtrudedLogoPanel item={hoveredItem} active />}
        </motion.div>
      )}

      <div
        ref={listRef}
        style={{
          position: "relative",
          width: "100%",
          // VISIBLE 개 행 + 그 사이 (VISIBLE-1)개의 gap 만큼만 높이를 잡는다.
          // rowPitch 는 "gap 포함 한 칸"이라 그대로 VISIBLE 배 하면 맨 끝에
          // 없어야 할 gap 하나가 더 들어가 부모 flex 가 그만큼 잘라낸다.
          height: rowPitch > 0 ? VISIBLE * rowPitch - rowGap : "auto",
          overflow: "hidden",
        }}
      >
        {Array.from({ length: SLOT_COUNT }).map((_, s) => (
          <CarouselSlot
            key={s}
            slotIndex={s}
            offset={offset}
            rowPitch={rowPitch}
            baseIndex={baseIndex}
            items={list}
            hovered={hovered}
            align={align}
            textColor={textColor}
            dimColor={dimColor}
            transition={transition}
            touchMode={touchMode}
            suppressClickRef={suppressClickRef}
            onHoverItem={(index) => {
              // 스크롤이 진행 중일 땐 멈춰있는 커서 아래로 항목들이 지나가며
              // onMouseEnter 가 계속 발동해 로고 카드가 깜빡이므로 무시한다.
              if (isScrollingRef.current) return;
              setHoveredAndNotify(index);
            }}
            onLeaveItem={() => setHoveredAndNotify(null)}
            onFocusItem={onFocusItem}
            onBlurItem={onBlurItem}
          />
        ))}
      </div>
    </div>
  );
}
