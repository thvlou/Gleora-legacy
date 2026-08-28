import type { Ref } from "../data/refs";

// 실제 로고 이미지 대신, 사이트 이름 텍스트를 CSS 3D(perspective + translateZ)로
// 압출해 360도로 회전시키는 로고. Three.js 없이 순수 CSS만으로 만든 "가짜 입체" —
// 앞면(메인 옐로)부터 뒷면(어두운 올리브)까지 레이어를 겹쳐 두께처럼 보이게 한다.
// (크롬/리퀴드메탈 반사 느낌은 CSS만으로는 줄무늬 이상 나오지 않아 포기했다 —
// 실제 환경 반사가 필요한 효과라 Three.js 없이는 한계가 있다.)
// 데스크탑(HoverImageReveal, 커서 추적)과 모바일(RefList, 롱프레스) 양쪽에서
// 공유해서 쓴다 — 회전 로고 자체는 트리거 방식과 무관하게 동일하다.
const EXTRUDE_LAYERS = 14;
const EXTRUDE_FRONT_COLOR = "#FFE345";
const EXTRUDE_BACK_COLOR = "#6B5A12";

function lerpHexColor(from: string, to: string, t: number): string {
  const f = parseInt(from.slice(1), 16);
  const tt = parseInt(to.slice(1), 16);
  const channel = (shift: number) => {
    const a = (f >> shift) & 0xff;
    const b = (tt >> shift) & 0xff;
    return Math.round(a + (b - a) * t);
  };
  const r = channel(16);
  const g = channel(8);
  const b = channel(0);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function ExtrudedLogoPanel({ item, active }: { item: Ref; active: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 15,
      }}
    >
      <div style={{ perspective: 700 }}>
        <div
          style={{
            position: "relative",
            transformStyle: "preserve-3d",
            animation: active ? "refvault-spin3d 5s linear infinite" : undefined,
          }}
        >
          {Array.from({ length: EXTRUDE_LAYERS }).map((_, i) => {
            const isFront = i === 0;
            return (
              <div
                key={i}
                aria-hidden={!isFront}
                style={{
                  position: isFront ? "relative" : "absolute",
                  inset: 0,
                  // 앞면(z-index 1)이 항상 위에 그려지도록 명시한다 — preserve-3d
                  // 깊이 정렬을 지원하지 않는 브라우저/GPU 에서는 z-index 없이
                  // DOM 순서대로 쌓여서 제일 뒤(단색) 레이어가 앞면을 덮어버린다.
                  zIndex: isFront ? 1 : 0,
                  transform: `translateZ(${-i * 2}px)`,
                  fontFamily: '"PP Palma Fizzy Heavy", sans-serif',
                  fontSize: 40,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  textAlign: "center",
                  color: lerpHexColor(EXTRUDE_FRONT_COLOR, EXTRUDE_BACK_COLOR, i / (EXTRUDE_LAYERS - 1)),
                }}
              >
                {item.name}
              </div>
            );
          })}
        </div>
      </div>
      {item.taglineEmphasis && (
        // 각 사이트의 가장 도드라지는 특징 한 표현만 크게 강조해서 보여준다.
        // 로고(40px)와 주인공 자리를 다투지 않도록 18px(로고의 45%)로 절제했다.
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span
            style={{
              fontFamily: '"PP Palma Fizzy Heavy", sans-serif',
              fontSize: 18,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              textAlign: "center",
              color: "#FFE345",
            }}
          >
            {item.taglineEmphasis}
          </span>
          <span
            aria-hidden
            style={{
              width: 36,
              height: 3,
              borderRadius: 2,
              background: "#FFE345",
              marginTop: 4,
            }}
          />
        </div>
      )}
    </div>
  );
}
