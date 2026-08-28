import { useLayoutEffect, useRef, type ReactNode } from "react";

interface WandererProps {
  /** 초당 이동 속도(px). 너무 빠르지 않게 — 기본값은 천천히 떠다니는 정도. */
  speed?: number;
  /** true 면 그 자리에 멈춘다(4대째 맞고 "죽은" 상태로 피가 흐르는 동안). */
  frozen?: boolean;
  children: ReactNode;
}

const DEFAULT_SPEED = 80;

// "힛미" 버튼이 화면 전방향으로 천천히 떠다니다가 모서리에 닿으면 자연스럽게
// 반사되어(입사각=반사각) 계속 돌아다니는 효과. 리액트 상태 대신 rAF 루프
// 안에서 위치를 ref로만 들고 style.transform을 직접 갱신한다 — 매 프레임
// 리렌더를 피하기 위해 이 프로젝트 곳곳(HoverImageReveal 등)에서 이미 쓰는
// 패턴과 동일하다. 데스크탑 전용(AddFlow) — 모바일(MobileAddFlow)의 트리거
// 버튼은 떠다니지 않는 고정 버튼이라 이 컴포넌트를 쓰지 않는다.
export default function Wanderer({ speed = DEFAULT_SPEED, frozen = false, children }: WandererProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // rAF 루프 안에서 최신 frozen 값을 읽기 위한 ref — 이펙트 의존성에 직접
  // 넣으면 멈출 때마다 루프가 통째로 재시작되면서 위치가 초기화된다.
  const frozenRef = useRef(frozen);
  frozenRef.current = frozen;

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const size = { w: 0, h: 0 };
    const measureSize = () => {
      const rect = el.getBoundingClientRect();
      size.w = rect.width;
      size.h = rect.height;
    };
    measureSize();
    const ro = new ResizeObserver(measureSize);
    ro.observe(el);

    const pos = {
      x: Math.random() * Math.max(1, window.innerWidth - size.w),
      y: Math.random() * Math.max(1, window.innerHeight - size.h),
    };
    // 축에 딱 맞지 않는(대각선) 초기 각도로 시작해야 전방향으로 돌아다니는
    // 느낌이 난다 — 위아래/좌우로만 튕기면 금방 단조로워 보인다.
    const angle = Math.random() * Math.PI * 2;
    const vel = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };

    el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

    let frameId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // 멈춘 동안엔 위치를 갱신하지 않는다. 루프 자체는 계속 돌려서, 다시
      // 풀렸을 때 dt 가 튀지 않고 그 자리에서 자연스럽게 이어지게 한다.
      if (frozenRef.current) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      pos.x += vel.x * dt;
      pos.y += vel.y * dt;

      const maxX = Math.max(0, window.innerWidth - size.w);
      const maxY = Math.max(0, window.innerHeight - size.h);

      if (pos.x <= 0) {
        pos.x = 0;
        vel.x = Math.abs(vel.x);
      } else if (pos.x >= maxX) {
        pos.x = maxX;
        vel.x = -Math.abs(vel.x);
      }

      if (pos.y <= 0) {
        pos.y = 0;
        vel.y = Math.abs(vel.y);
      } else if (pos.y >= maxY) {
        pos.y = maxY;
        vel.y = -Math.abs(vel.y);
      }

      el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    // 창 크기가 줄어들어도 화면 밖으로 나가있지 않도록 위치만 다시 클램프한다.
    const onResize = () => {
      pos.x = Math.min(pos.x, Math.max(0, window.innerWidth - size.w));
      pos.y = Math.min(pos.y, Math.max(0, window.innerHeight - size.h));
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [speed]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 10,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
