# Reference Vault

개인용 디자인 레퍼런스 갤러리. 좋은 레퍼런스 사이트를 한 줄 설명과 함께 모아두고,
방문자가 새 링크를 제안하면 운영자에게 Slack DM으로 알림이 간다.

**배포**: https://refvault-app.vercel.app

---

## 무엇이 다른가

레퍼런스 아카이브는 이미 많다. 이 프로젝트가 다르게 잡은 지점은 셋이다.

| | |
|---|---|
| **한 줄 설명** | 모든 항목에 한글 설명이 붙는다. 이름만 보고 판단하지 않아도 된다. |
| **인터랙션** | 화면을 떠다니는 버튼, 4번 때려야 열리는 제출 폼 등 — 도구가 아니라 사물처럼 다룬다. |
| **사람이 개입하는 큐레이션** | 제출은 자동 등록이 아니라 알림까지만. 직접 확인한 뒤 손으로 추가한다. |

---

## 기술 스택

| 영역 | 선택 |
|---|---|
| 빌드 | Vite 8 |
| 프레임워크 | React 19 + TypeScript 6 |
| 스타일 | **CSS Modules only** (Tailwind 미사용) |
| 애니메이션 | framer-motion 13 |
| 라우터 · 상태관리 | **없음** — 단일 페이지, `useState` 로 충분 |
| 백엔드 | Vercel Edge Function 1개 (`api/notify.ts`) |
| 알림 | Slack Incoming Webhook |

> 라우터·상태관리·CSS 프레임워크를 의도적으로 넣지 않았다.
> 이 규모에서는 불필요하고, 손그림 톤의 커스텀 인터랙션을 오히려 방해했다.

---

## 구조

```
src/
├─ components/
│  ├─ HoverImageReveal.tsx   메인 캐러셀 — 무한 벨트 + 커서 추적 3D 로고
│  │                          (데스크탑=휠 / 모바일=드래그+관성, inputMode 로 분기)
│  ├─ ExtrudedLogoPanel.tsx  CSS 3D(perspective+translateZ) 14레이어 가짜 입체 로고
│  ├─ TexturedBackground.tsx 떠다니는 블롭 + 그레인 배경
│  │
│  ├─ AddFlow.tsx            데스크탑 제출 플로우 상태 머신
│  ├─ AddButton.tsx          "Hit me !" — 4타 타격 → 차오름 → 드립
│  ├─ Wanderer.tsx           화면을 떠다니며 벽에 반사되는 래퍼
│  ├─ InputSection.tsx       URL 입력 + 인라인 에러
│  ├─ SubmitButton.tsx       바운스 / 잘못된 URL이면 랜덤 4방향 회피
│  │
│  ├─ MobileAddFlow.tsx      모바일 제출 플로우 (물리 연출 없이 단순화)
│  ├─ MobileInputSection.tsx 모바일 입력 — 손그림 SVG 외곽선은 동일 적용
│  │
│  ├─ LoadingSection.tsx     회전하는 눈 2개 + 점 순환
│  ├─ DoneSection.tsx        스프링 팝인
│  ├─ ErrorSection.tsx       재시도
│  └─ FallingEmojis.tsx      전체 화면 낙하 이모지
│
├─ data/refs.ts              레퍼런스 데이터
└─ index.css                 @font-face, 전역 키프레임

api/notify.ts                URL 검증 → Slack 웹훅 전송 (Edge Runtime)
```

---

## 실행

```bash
npm install
npm run dev
```

Slack 알림까지 확인하려면 `.env.example` 을 참고해 환경변수를 설정하고 `vercel dev` 로 실행한다.

| 명령 | 용도 |
|---|---|
| `npm run dev` | 프론트만 (API 라우트 미동작) |
| `vercel dev` | API 라우트 포함 |
| `npm run build` | 타입체크 + 프로덕션 빌드 |
| `npm run lint` | oxlint |

---

## 문서

| 파일 | 내용 |
|---|---|
| `PROJECT_LOG.md` | 제작 과정 기록 — 구현 핵심, 겪은 문제와 해결 |
| `devlog.md` | 작업 로그와 트러블슈팅 |
| `PRD-v1.md` | 리디자인 기획서 (진행 중) |
| `pattern-research.md` | 피쳐별 패턴 설계 근거 |

---

## 상태

이 커밋은 **리디자인 착수 이전 시점의 스냅샷**이다.
`public/` 안의 `*-preview.html`, `hit-me-demo.html` 은 디자인 검토용 독립 파일로,
앱 번들에 포함되지 않으며 실제 사이트 동작과 무관하다.
