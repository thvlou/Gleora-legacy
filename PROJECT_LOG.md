# Reference Vault — 제작 기록

개인용 디자인 레퍼런스 갤러리 사이트. 기획부터 인터랙션 최종 조정까지의 전 과정 기록.

- **작업 폴더**: `C:\Users\user\Desktop\ref_prototype`
- **기록 시점**: 2026-08-15
- **현재 상태**: 디자인 / 링크 1차 수집(26개) / 링크 신청 URL 창 / 각 인터랙션 포인트 최종 수정 완료
- **다음 단계**: 링크 추가 수집 및 등록, 배포

---

## 1. 기술 스택과 제약

| 항목 | 선택 | 비고 |
|---|---|---|
| 빌드 | Vite 8 | 미리보기 base 경로 자동 설정 |
| 프레임워크 | React 19 | |
| 언어 | TypeScript 6 | 프로젝트 레퍼런스 방식 |
| 스타일 | CSS Modules **only** | Tailwind 미사용 |
| 애니메이션 | framer-motion 13 | 일부는 순수 CSS / rAF |
| 라우터 · 상태관리 | **없음** | 단일 페이지, `useState` 로 충분 |
| 린트 | oxlint | |
| 백엔드 | Vercel Edge Function | `api/notify.ts` 단 하나 |
| 알림 | Slack Incoming Webhook | 개인 DM |

**의도적으로 지킨 제약**: 라우터·상태관리 라이브러리·CSS 프레임워크를 일절 넣지 않았다. 단일 페이지 + 소수 컴포넌트 규모에서는 `useState` 와 CSS Modules 만으로 충분하고, 의존성이 늘수록 손그림 톤의 커스텀 인터랙션을 오히려 방해했다.

---

## 2. 최종 파일 구조

```
ref_prototype/
├─ api/
│  └─ notify.ts                    Edge Function — URL 검증 후 Slack 웹훅 전송
├─ public/
│  ├─ fonts/                       PP Palma 4종 (FizzyHeavy/FizzyLight/FizzyMediumItalic/Medium)
│  └─ hit-me-demo.html             Hit me 효과 후보 3안 데모 (작업용)
├─ src/
│  ├─ components/
│  │  ├─ HoverImageReveal.tsx      메인 캐러셀 + 커서 추적 3D 로고 카드
│  │  ├─ RefList.tsx               터치 환경용 리스트 뷰
│  │  ├─ TexturedBackground.tsx    떠다니는 블롭 + 그레인 텍스처 배경
│  │  ├─ AddFlow.tsx               제출 플로우 상태 머신 (idle→input→loading→done/error)
│  │  ├─ AddButton.tsx             "Hit me !" 타격 버튼
│  │  ├─ Wanderer.tsx              화면을 떠다니며 벽에 튕기는 범용 래퍼
│  │  ├─ PaintText.tsx             브러시 리빌 텍스트 (현재 미사용, 보존)
│  │  ├─ InputSection.tsx          URL 입력 + 인라인 에러
│  │  ├─ SubmitButton.tsx          바운스 / 회피 동작 버튼
│  │  ├─ LoadingSection.tsx        회전하는 눈 2개 + 점 애니메이션
│  │  ├─ DoneSection.tsx           스프링 팝인 텍스트
│  │  ├─ ErrorSection.tsx          재시도 유도
│  │  └─ FallingEmojis.tsx         전체 화면 낙하 이모지
│  ├─ data/refs.ts                 레퍼런스 26개 데이터
│  ├─ assets/                      Figma 원본 SVG 3종
│  └─ index.css                    @font-face, 전역 키프레임
└─ tsconfig.{json,app,node,api}.json
```

---

## 3. 시각 언어

전체가 **두 색의 전환**이라는 하나의 규칙 위에 서 있다.

| 토큰 | 값 | 역할 |
|---|---|---|
| dim | `#8A8A8A` | 평상시 / 비활성 |
| point | `#FFE345` | 활성 / 강조 / 확정 |
| danger | `#FF3B30` | 에러 |

이 회색↔노랑 전환이 캐러셀 호버, Hit me 타격 게이지, Submit 버튼 활성화, 텍스트 필드 테두리까지 전부 동일하게 적용된다. 새 인터랙션을 넣을 때마다 "이 사이트의 색 언어로 표현 가능한가"를 기준으로 판단했고, 그래서 **글로우·네온 계열은 전부 기각**했다.

**폰트**: PP Palma 패밀리. Fizzy Heavy(제목·로고), Fizzy Medium Italic(보조 문구), Medium(에러 메시지처럼 담백해야 하는 곳).

---

## 4. 주요 컴포넌트별 구현 핵심

### 4-1. HoverImageReveal — 메인 캐러셀

원본은 Originkit "Hover Image Reveal". 이 프로젝트에 맞춰 크게 개조했다.

**무한 벨트 구조**
- 실제 레퍼런스 개수와 무관하게 화면엔 항상 10개(`VISIBLE`)만 보이고, 위아래 버퍼 2개씩 더해 총 14개 슬롯만 마운트한다.
- 슬롯의 화면상 위치(`y`)는 스프링 `offset` 을 구독해 **리렌더 없이** 매끄럽게 움직이고, 그 자리에 어떤 레퍼런스를 표시할지(`realIndex`)는 `baseIndex` 가 한 칸 넘어갈 때만 바뀐다. 이 둘의 조합이 끝이 없는 벨트 착시를 만든다.
- 폰트 크기도 실제 개수가 아니라 고정 `VISIBLE` 기준으로 계산 — 레퍼런스가 늘어나도 화면 밀도가 변하지 않는다.

**휠 처리**
`deltaY` 의 *크기* 는 장치(트랙패드 vs 일반 휠)마다 제각각이라 이동 거리 계산에 쓸 수 없었다. 방향(부호)만 취하고 **이벤트 1회 = 정확히 1행** 으로 고정했다. 빠르게 돌리면 이벤트가 그만큼 많이 들어와 자연스럽게 빨라진다.

**CSS-only 3D 로고**
Three.js 없이 `perspective` + `translateZ` 로 같은 텍스트를 14겹 쌓고, 앞면(`#FFE345`)에서 뒷면(`#6B5A12`)까지 색을 보간해 두께를 흉내냈다. 앞면에 `zIndex: 1` 을 명시한 이유는, `preserve-3d` 깊이 정렬을 지원하지 않는 환경에서 DOM 순서대로 쌓여 제일 뒤 레이어가 앞면을 덮어버리기 때문.
(크롬/리퀴드메탈 반사는 실제 환경 반사가 필요해 CSS만으로는 줄무늬 이상 나오지 않아 포기)

**카드 폭 자동 계산**
이름 길이가 제각각(`GODLY` vs `SPACE TYPE GENERATOR`)이라 고정폭으로는 긴 이름이 잘렸다. 캔버스 `measureText` 로 레이아웃을 건드리지 않고 실제 렌더 폭을 재서 카드 폭을 매번 다시 계산한다. 폰트 로딩 전엔 폴백 폰트로 측정되므로 `document.fonts.ready` 이후 한 번 더 재측정.

### 4-2. AddFlow — 제출 플로우 상태 머신

```
idle ──(4대 타격)──> input ──(제출)──> loading ──> done
                       ↑                            └─> error ──(재시도)─┘
```

- 모달은 배경 딤(`rgba(0,0,0,0.35)`) + `backdrop-filter: blur(10px)`.
- 카드 등장/퇴장은 **CRT TV 전원 켜짐/꺼짐** 을 흉내낸 커스텀 variants: 가로로 먼저 쫙 펼쳐지고(`scaleX`) 세로가 뒤따라 열린다(`scaleY`, 오버슈트 이징). 닫힐 땐 역순.
- `loading` 단계에선 배경 클릭·ESC 로 닫을 수 없다(요청 진행 중 취소 방지).
- 실제 응답이 너무 빨라도 로딩 화면이 반짝하고 사라지지 않도록 최소 표시 시간 1200ms 보장.

### 4-3. AddButton — "Hit me !" 타격 버튼

가장 많이 반복 수정한 부분. 최종 사양:

| 요소 | 구현 |
|---|---|
| 색 차오름 | 회색 원본 위에 노란 레이어를 정확히 겹치고 `clip-path: inset()` 으로 아래부터 드러냄 |
| 타격 횟수 | 정확히 4대. `[0.29, 0.53, 0.79, 1]` 단계 + 중간 단계에만 ±0.04 지터 |
| 타격 반응 | 스쿼시만 (`scaleX/scaleY` 반대 위상). 주변 스플래시 없음 |
| 4대째 | 그 자리에 멈춤(`Wanderer frozen`) → 피가 흐름 → 1.6초 후 모달 |
| 드립 | 폭 4px 가는 줄기 하나, "m" 글자 아래에서 한 번에 주욱 |

드립 x좌표는 하드코딩이 아니라 실제 렌더된 "m" 글자 위치를 재서 잡는다(자간·폰트가 바뀌어도 따라감).

### 4-4. Wanderer — 떠다니는 래퍼

`position: fixed` 컨테이너 안에서 rAF 루프가 `style.transform` 을 직접 갱신한다. 위치를 React state 로 들지 않는 게 핵심 — 매 프레임 리렌더를 피한다. 벽에 닿으면 해당 축 속도만 반전(입사각=반사각). 초기 각도는 축에 딱 맞지 않는 대각선으로 시작해야 단조롭지 않다.

`frozen` 은 prop 이지만 **ref 로 읽는다**. 의존성 배열에 직접 넣으면 멈출 때마다 루프가 재시작되며 위치가 초기화되기 때문.

### 4-5. InputSection / SubmitButton

- 검증은 `<input type="url">` 의 **네이티브 유효성 검사**(`e.target.validity.valid`)를 그대로 활용.
- Submit 버튼: 입력이 있으면 밝아지고 1.2초 주기로 바운스. **URL 형식이 아닌데 누르면 랜덤 4방향으로 도망간다**(상하 이동 거리는 텍스트 필드를 침범하지 않도록 55px 로 제한).
- 에러 문구는 타이핑 중엔 안 뜨고 **실제 제출 시도 후에만** 표시. Fizzy 가 아닌 담백한 Medium 12px, ✕ 대신 같은 폰트의 대문자 `X` 를 써서 굵기·위계를 맞췄다.

### 4-6. Loading / Done / Error

- **Loading**: 손그림 원 SVG 2개를 서로 반대 방향·다른 속도(3.2s / 3.6s)로 회전 + `".."↔"..."` 점 순환.
- **Done**: 스프링(`stiffness:320, damping:11`)으로 튀어오르는 텍스트 + **전체 화면** 낙하 이모지. 처음엔 카드 안에만 있었으나 요청에 따라 뷰포트 전체를 덮는 별도 레이어(`z-index:30`)로 분리.
- **Error**: 카드 전체가 버튼. 탭하면 입력 단계로 복귀.

---

## 5. 백엔드 연동

**설계 의도**: 완전 자동화가 아니라 **사람이 개입하는 큐레이션**.

```
방문자가 URL 제출
   → Edge Function 이 형식 검증
   → 개인 Slack DM 으로 알림
   → 내가 직접 링크 확인
   → Claude 에게 전달 → refs.ts 에 큐레이션해서 추가
```

`api/notify.ts` 는 POST 만 허용하고, 길이(2048자)와 프로토콜(`http`/`https` 만)을 서버에서 한 번 더 검증한 뒤 웹훅으로 전달한다.

**설정 과정에서 걸렸던 것들**
- Vite SPA 라도 프로젝트 루트 `/api` 에 두면 Vercel 이 알아서 Edge Function 으로 인식한다(Next.js 불필요).
- `tsconfig.app.json` 이 `types: ["vite/client"]` 로 제한돼 있어 `process.env` 를 못 읽었다. `tsconfig.node.json` 패턴을 본떠 `tsconfig.api.json` 을 새로 만들고 루트에서 참조.
- `vercel dev` 는 `.env.local` 이 아니라 **등록된 Vercel 프로젝트의 환경변수**를 읽는다. `vercel env add` 로 Development/Preview/Production 세 곳에 모두 등록해야 로컬 테스트가 된다.

---

## 6. 겪은 문제와 해결 (교훈 위주)

### Figma 손그림 테두리는 Tailwind 번역으로 못 살린다
반복적으로 겪은 패턴. 흔들리는 손그림 테두리는 실제로 **수천 개의 작은 채움 폴리곤**이지 CSS border 가 아니다. Figma MCP 의 Tailwind 번역은 이걸 매끈한 `border` 로 뭉개버린다. → `download_assets` 로 **SVG 원본을 받아** `?raw` 로 인라인하는 방식으로 통일.

### CSS Modules 가 전역 키프레임 참조를 조용히 죽인다
`.module.css` 안의 `animation` 속성에 적힌 이름은, 그 파일에 `@keyframes` 정의가 없어도 **토큰 자체가 해시로 치환**된다. 전역에 정의해둔 키프레임을 참조하면 매칭되는 규칙이 없어 애니메이션이 조용히 무시된다.
→ 키프레임은 **참조하는 모듈 파일 안에 같이 정의**. 인라인 style 로 참조하는 것만 전역에 남긴다.

### 관련 state 를 쪼개면 배치 업데이트에서 새어나간다
Submit 버튼 회피 동작이 첫 클릭 이후 먹통이 됐다. `dodgeSide` 와 `dodging` 두 개의 `useState` 로 나눠둔 게 원인. → **하나의 객체 state 로 합치고 항상 새 참조를 반환**하도록 바꿔 해결.

### 클램프 경계가 붕괴하면 커서 추적이 한 점에 고정된다
카드 폭이 컨테이너보다 넓어지면 `halfW > rectWidth - halfW` 가 되어, `Math.min(Math.max(x, halfW), Math.max(rectWidth - halfW, halfW))` 의 상·하한이 같은 값으로 무너진다. 로고가 커서를 놓치고 한 자리에 붙어버림.
→ 두 경계를 각각 `Math.min`/`Math.max` 로 명시해 범위를 항상 유효하게 유지.

### "투명 벽에 튕기는" 현상의 진짜 원인
처음엔 긴 이름만의 문제로 봤지만, 26개 전 항목을 커서 위치별로 스윕해보니 **전부** 동일한 396px 순간이동이 있었다. 원인은 "오른쪽 공간이 부족하면 카드를 커서 왼쪽으로 뒤집는" 로직 — 뒤집히는 지점에서 위치가 `2 × offsetX` 만큼 점프했다.
→ 부호 반전을 없애고 클램프에만 맡기니 전 항목 최대 변화량이 샘플 간격 수준(=완전히 매끄러움)으로 떨어졌다.
**교훈**: 증상이 특정 항목에서만 눈에 띈다고 원인도 그 항목에만 있는 건 아니다. 전수 조사가 빨랐다.

### overflow 클립은 padding box 기준
`<a>` 가 텍스트 폭에 fit-content 로 잡히는데 폰트의 실제 잉크 폭이 advance 폭을 최대 2px 초과했다(O·S·G 같은 둥근 글자). `overflow: hidden` 이 그걸 잘라 "마지막 글자 끝이 잘린" 것처럼 보임.
`overflow-x: visible` 로 축을 분리하려 했으나 **CSS 스펙상 한쪽이 visible 이면 다른 쪽이 강제로 auto 로 계산**되어 실패(auto 도 경계에서 잘림).
→ overflow 클립 영역이 content box 가 아니라 **padding box** 라는 점을 이용해 `padding-right: 4px` 로 해결.

### CSS 이징은 키프레임 구간마다 새로 적용된다
피가 3단계로 뚝뚝 끊겨 내려오던 원인. `0/35/70/92/100%` 다섯 구간으로 나눠뒀더니 ease-in 이 네 번 리셋됐다.
→ `from`/`to` 단일 구간으로 두고 이징을 한 번만 태워 해결.

### 브라우저 자동완성이 입력값을 바꿔치기한다
Slack 에 `http://localhost:3000` 이 도착한 사건. 코드엔 `window.location` 폴백이 없었고, 크롬이 `type="url"` 필드에 **현재 페이지 주소를 자동완성 후보로 제안**한 게 원인.
→ `autoComplete="off"`.

### 자동화 브라우저 검증의 한계
검증용 브라우저 창은 `document.hidden === true` 라 `requestAnimationFrame` 과 CSS 애니메이션이 억제된다. 위치가 안 변한다고 코드가 틀린 게 아니다.
→ **React Fiber 의 `memoizedProps` 를 직접 읽거나**, `getAnimations()` 로 키프레임을 확인하거나, 클릭을 프로그램적으로 반복해 state 전이만 검증하는 방식으로 우회. 시각 확인이 꼭 필요하면 실제 브라우저에서.

---

## 7. 데이터 구조

```ts
type Ref = {
  name: string;              // 화면에 뜨는 큰 텍스트
  url: string;
  note: string;              // 한 줄 설명 (한글)
  tint: [string, string];    // 커버 그라디언트 2색
  cover?: string;            // 실제 이미지 자리 (예약)
  taglineEmphasis?: string;  // 호버 시 로고 아래 강조되는 영문 한 표현
};
```

`taglineEmphasis` 는 각 사이트의 가장 도드라지는 특징 하나만 영문으로 뽑은 것. 로고(40px)와 주인공 자리를 다투지 않도록 18px(로고의 45%)로 절제했다.

**현재 26개** 수집 완료. 국내외 UI 패턴 아카이브, 타이포그래피 도구, 실험적 웹, 폰트 리소스 등.

---

## 8. 남은 작업

- [ ] 레퍼런스 추가 수집 및 등록
- [ ] 배포 (Vercel — 프로젝트 `jun-58f4/ref_prototype` 로 이미 링크됨)
- `public/hit-me-demo.html` 은 **배포 후에도 남겨둔다** — Hit me 인터랙션을 고를 때 후보 3안(펀치 임팩트 / 고무 도장 / 펀칭백)을 비교했던 참고 자료. `/hit-me-demo.html` 로 접근 가능
- [ ] 실제 커버 이미지 적용 (`Ref.cover` 필드는 이미 예약해둠)
