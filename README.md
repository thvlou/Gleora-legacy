# Gleora

디자인 레퍼런스를 **피쳐별 폴더**로 모아 보는 개인용 갤러리.
[Reference Vault](https://github.com/thvlou/Reference_vault)를 처음부터 다시 디자인하는 프로젝트다.

> **지금 상태 — 디자인 프로토타입 단계**
> 새 디자인은 `public/prototype.html` 한 파일 안에서 만들고 있다.
> `src/` 의 React 앱은 아직 리디자인 이전의 Reference Vault 그대로이며,
> 프로토타입이 확정되면 그때 앱으로 옮긴다.

---

## 무엇이 바뀌나

| | Reference Vault | Gleora |
|---|---|---|
| 단위 | 사이트 한 줄 목록 | **9개 피쳐 폴더** (WEB · UI · GRAPHIC · TYPE · MOTION · PHOTO · COLOR · ICON · CODE) |
| 탐색 | 이름 위 커서로 이미지 미리보기 | 3D 링 커버플로 — 휠 한 칸 = 카드 한 장 |
| 카드 | — | 피쳐마다 그 성격을 직접 보여주는 인터랙션이 카드 안에 들어 있다 |

---

## 프로토타입 보기

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173/prototype.html` 을 연다.
앱 번들과 무관한 독립 HTML이다. 외부 라이브러리 없이 이 파일 하나로 동작하고,
웹폰트만 Google Fonts 에서 받는다.

| 조작 | 동작 |
|---|---|
| 휠 / ← → | 카드 한 장씩 이동. 빠르게 굴리면 그만큼 빠르게 넘어간다 |
| 옆 카드 클릭 | 그 카드로 이동 |
| 가운데 카드 클릭 | 피쳐 섹션으로 진입 (섹션은 아직 미구현) |

---

## 카드별 인터랙션

가운데에 온 카드에서만 동작한다. 옆 카드는 정지 상태로 보인다.

| 카드 | 내용 |
|---|---|
| **WEB** | 브라우저 페이지 3장이 겹쳐 천천히 깊이가 움직인다 |
| **UI** | 스위치 · 세그먼트 · 필터 칩 · 슬라이더 · 스테퍼 — 실제로 조작된다 |
| **GRAPHIC** | 스위스 포스터 레이어 패럴랙스. 선택하면 손이 카드 뒤에서 기어올라와 잡고, 그 무게에 카드가 내려앉는다 |
| **TYPE** | 큰 `Aa` 가 Sans → Editorial Serif → Mono 로 전환된다 |
| **MOTION** | 이징 커브 위를 점과 잔상이 따라간다 |
| **PHOTO** | 흑백 사진에서 커서 주변만 색이 돌아온다 |
| **COLOR** | 3D 데이지 두 송이. 줄기부터 자라 피어나고, 꽃잎에 올리면 빠지며 HEX 가 보인다 |
| **ICON** | 아이콘 독 — 가리킨 아이콘과 이웃이 단계적으로 올라온다 |
| **CODE** | 미니 터미널 — 코드가 한 줄씩 나타나고 캐럿이 깜빡인다 |

---

## 설계 메모

구현하며 정한 것 중 다시 보면 이유를 잊기 쉬운 것들. 자세한 과정은 `docs/devlog.md`.

- **카드 배치는 Originkit CoverflowGallery 의 계산식**을 그대로 가져오고,
  가장자리 카드가 링을 따라 뒤로 말려 들어가도록 곡률만 더했다.
- **헤더와 카드가 같은 기준선(100px)을 쓴다.** 커버플로는 고정 크기 중앙정렬이라
  뷰포트에 따라 여백이 달라지므로, 카드군을 스케일해서 기준선에 맞춘다.
- **카드 내부 효과는 `.feature-fx` 안에만** 들어간다. 카드 크기·배치·라벨·클릭 로직은
  건드리지 않는다는 원칙으로 붙였다.
- **카드 밖으로 나와야 하는 요소(GRAPHIC 의 손)는 트랙에 얹는다.** 카드는
  `overflow: hidden` 이라 안에 두면 잘린다.
- **카드에 연출을 더할 때는 캐러셀 transform 을 덮어쓰지 않고 더한다**
  (WAAPI `composite: 'add'`).
- 3D 컨텍스트 안에서 `filter` · `mask` 는 쓰지 않는다 — `preserve-3d` 를 평면화한다.
  변환하는 요소와 그림자/마스크를 거는 요소를 나눈다.

---

## 구조

```
gleora/
├─ public/                         정적 파일 (dev 서버 루트로 서빙)
│  ├─ prototype.html               리디자인 프로토타입 — 현재 작업 대상
│  ├─ gleora-logo.svg              로고
│  ├─ hand-knuckles.png            GRAPHIC 손 — 손등, 카드 뒤 레이어
│  ├─ hand-fingers.png             GRAPHIC 손 — 손가락, 카드 앞 레이어
│  └─ fonts/                       PP Palma
│
├─ src/                            React 앱 (리디자인 전 Reference Vault)
├─ api/notify.ts                   링크 제안 → Slack 알림 (Vercel Edge Function)
│
├─ design/                         앱에 들어가지 않는 디자인 자료
│  ├─ explorations/                지나온 탐색안 — 참고용
│  │  ├─ folder-accordion.html
│  │  ├─ folder-patterns.html
│  │  └─ hit-me-button.html
│  └─ assets/                      원본 소스
│     ├─ hand-source.png           손 원본 — public 의 두 장을 여기서 잘라냈다
│     └─ gleora-logo-figma-export.svg
│
└─ docs/                           기획 · 기록 문서
```

탐색안은 `http://localhost:5173/design/explorations/<파일명>` 으로 열 수 있다.

---

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프로토타입 | 단일 HTML + CSS + 바닐라 JS, 외부 라이브러리 없음 |
| 앱 | Vite 8 · React 19 · TypeScript 6 · **CSS Modules only** · framer-motion 13 |
| 라우터 · 상태관리 | 없음 |
| 백엔드 | Vercel Edge Function 1개 + Slack Incoming Webhook |

Slack 알림까지 확인하려면 `.env.example` 을 참고해 `.env.local` 에
`SLACK_WEBHOOK_URL` 을 넣고 `vercel dev` 로 실행한다. `.env*` 는 커밋되지 않는다.

---

## 문서

| 파일 | 내용 |
|---|---|
| `docs/devlog.md` | 작업 로그와 트러블슈팅 |
| `docs/prd-v1.md` | 리디자인 기획서 |
| `docs/pattern-research.md` | 피쳐별 패턴 설계 근거 |
| `docs/batch-01-design.md` | 첫 레퍼런스 배치 설계 |
| `docs/reference-vault-log.md` | Reference Vault 제작 기록 |

> `docs/devlog.md` 안의 파일 경로는 기록 당시 이름 그대로다
> (예: `folder-ui-preview.html` → 현재 `public/prototype.html`).

---

## 이력

첫 커밋은 리디자인 착수 직전 Reference Vault 스냅샷이고, 그 위로 Gleora 작업이 쌓인다.
리디자인 이전 버전은 [thvlou/Reference_vault](https://github.com/thvlou/Reference_vault)에 따로 보관한다.
