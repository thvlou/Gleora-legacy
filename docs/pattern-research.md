# 피쳐별 패턴·텍스처 설계 근거

> 코버플로 카드 9장의 면(face)을 무엇으로 채울지 조사한 결과.
> 색만으로는 UI/TYPE/CODE 세 피쳐가 모두 근검정이라 구분되지 않아,
> **색 외의 구분축(패턴)** 을 추가하기 위한 조사.

## 구현 방식 결정: 순수 CSS / 인라인 SVG

| 방식 | 판단 |
|---|---|
| 외부 이미지(PNG/JPG) | ❌ 로딩 지연, 확대 시 깨짐, 배포 시 용량 |
| **CSS 그라디언트 조합** | ✅ 무게 0, 무한 확대, 색 변수만 바꿔 재활용 |
| **인라인 SVG data URI** | ✅ 그레인처럼 CSS로 불가능한 것만 제한적으로 |

### 확보한 기법
- `repeating-conic-gradient` — 체커·부채꼴 패턴을 극도로 짧은 코드로 (CSS-Tricks)
- `radial-gradient` + `background-repeat: space` — 하프톤 점을 축마다 정수 개로 배치 (Frontend Masters)
- `feTurbulence` (SVG 필터, data URI 인라인) — 필름 그레인. `baseFrequency` 낮을수록 거칠어짐, `numOctaves`로 복잡도, `stitchTiles="stitch"`로 타일 이음
- `repeating-linear-gradient` — 격자·스캔라인·베이스라인 그리드

## 피쳐별 모티프

각 분야에서 **실무자가 매일 보는 시각 요소**를 골랐다. 장식이 아니라 그 분야의 도구·규격에서 온 것이어야 한 눈에 읽힌다.

| Feature | 모티프 | 근거 | CSS 기법 |
|---|---|---|---|
| **WEB** | 컬럼 그리드 + 뷰포트 | 웹 레이아웃의 기본 단위 | `repeating-linear-gradient` 세로 컬럼 + 거터 |
| **UI** | 8pt 격자 + 컴포넌트 블록 | UI 설계의 기본 그리드가 8px 단위 | 교차 `repeating-linear-gradient` + 라운드 블록 |
| **GRAPHIC** | CMYK 하프톤 + 레지스트레이션 마크 | 인쇄 교정의 핵심. 색 정합을 맞추는 십자 표식, 22.5° 각도의 원형 점이 모아레를 막는다 | `radial-gradient` 점 + `conic-gradient` 십자 |
| **TYPE** | 베이스라인 그리드 + 글자 윤곽 | 조판의 기준선. 활자 설계의 좌표계 | 수평 `repeating-linear-gradient` + 대형 글리프 |
| **MOTION** | 이징 곡선 + 타임라인 프레임 | 모션 설계는 곡선과 프레임으로 기술된다 | 인라인 SVG 베지어 곡선 + 프레임 눈금 |
| **PHOTO** | 필름 그레인 + 스프로킷 홀 | 필름의 물성. 사진 매체의 정체성 | `feTurbulence` 그레인 + 좌우 구멍 |
| **COLOR** | 색상환(원형 스펙트럼) + 스와치 | 색 선택의 기본 도구 | `conic-gradient` 색상환 |
| **ICON** | 24px 키라인 그리드 + 키셰이프 | Material 기준 캔버스 24×24px, 원·정사각·직사각 키셰이프로 시각 균형을 잡는다 | 격자 + 원·사각 키라인 오버레이 |
| **CODE** | 들여쓰기 계단 + 커서 | 코드의 시각적 리듬은 인덴트에서 온다 | 계단형 블록 + 블링킹 커서 |

## 색 재조정

패턴을 넣어도 근검정 3개는 여전히 뭉개지므로, 명도를 벌린다.

| Feature | 기존 | 변경 | 이유 |
|---|---|---|---|
| UI | `#26292B` | `#3E4A57` 슬레이트 | 검정 3개 중 하나를 중명도로 |
| TYPE | `#1A1A1A` | `#171512` 잉크(웜) | 잉크의 따뜻한 검정 — 조판 뉘앙스 |
| CODE | `#111827` | `#0E1116` 터미널 블랙 | 가장 어두운 자리를 CODE가 차지 |

나머지 6개는 유지.

## 출처
- CSS-Tricks — Background Patterns, Simplified by Conic Gradients
- CSS-Tricks — Grainy Gradients (feTurbulence)
- Frontend Masters — Pure CSS Halftone Effect in 3 Declarations
- Material Design — Icons / Keyline shapes (24px 캔버스, 키셰이프)
- 인쇄 레지스트레이션·CMYK 하프톤 자료 (22.5° 원형 점, 색 정합 십자 표식)
