# 배치 01 — Design 계열 (검수용)

> 원본 시드 Design 페이지 156개 중 첫 40개를 검토하여 **34개 채택 / 6개 제외**.
> `note`는 메타데이터를 근거로 작성했으나, 확신이 낮은 항목은 `⚠️확인필요`로 표시했다.

---

## ⚠️ 먼저 — 분류 체계에 구멍 발견

작업 중 확인된 문제. `prd-v1.md`의 `Feature` 타입에 **`ui`가 빠져 있다.**

```ts
// 현재 (PRD v1)
type Feature = "web" | "graphic" | "type" | "motion" | "photo" | "color" | "icon" | "code";

// 제안 — ui 추가
type Feature = "web" | "ui" | "graphic" | "type" | "motion" | "photo" | "color" | "icon" | "code";
```

**근거:** Empty States, Little Big Details, UI Garage, Patternindex, Baymard, Craftwork 등
**UI/UX 특화 사이트가 이 배치에서만 6개**. `web`으로 뭉뚱그리면
"웹사이트 비주얼 갤러리"와 "UI 패턴 사전"이 같은 칸에 들어가 필터가 무의미해진다.

`web` = 웹사이트 전체의 비주얼·레이아웃 / `ui` = 화면 단위 패턴·컴포넌트로 구분.

---

## ❌ 제외 6건

| 사이트 | 사유 |
|---|---|
| `blackformat.com` | 도메인 매물(HugeDomains) |
| `28blacks.com` | 🚨 태국어 도박 사이트로 탈취됨 |
| `archizines.com` | 🚨 그리스어 카지노 사이트로 탈취됨 |
| `womenwhodraw.com` | 서비스 종료 ("former home of") |
| `99u.adobe.com` | 99u 폐간 — Behance 블로그로 리다이렉트. 별도 항목 가치 없음 |
| `videocassettes.ru` | 러시아 빈티지 비디오카세트 카탈로그 — 디자인 레퍼런스로 보기 어려움 |

---

## ✅ 채택 34건

### inspiration (14)

| # | name | note (한 줄 설명) | features | tagline |
|---|---|---|---|---|
| 1 | BRUTALIST WEBSITES | 브루탈리즘 웹만 모은 갤러리. 규칙을 깨는 레이아웃이 필요할 때 | web | brutalist web |
| 2 | DOSE OF DESIGN | 2010년부터 이어온 매일 한 컷 그래픽 디자인 큐레이션 | graphic | daily graphic dose |
| 3 | EMPTY STATES | 데이터가 없을 때의 화면만 모은 갤러리. 놓치기 쉬운 상태 설계 참고 | ui | empty state patterns |
| 4 | HALLO INTERNET | 동시대 인터넷 감각을 모으는 실험적 플랫폼 | web | contemporary internet |
| 5 | LITTLE BIG DETAILS | UI의 사소하지만 인상적인 디테일만 수집. 마이크로 인터랙션 아이디어 | ui | tiny ui details |
| 6 | MINIMAL GALLERY | 미니멀한 웹사이트만 손으로 골라 담는 갤러리 | web | minimal web |
| 7 | THE RESPONSIVE | 반응형 디자인이 잘 된 사이트만 추린 갤러리 | web | responsive showcase |
| 8 | TREND LIST | 2011년부터 그래픽 디자인의 시각적 유행을 기록해온 아카이브 | graphic | visual trend archive |
| 9 | UI GARAGE | 화면 유형별로 정리된 실제 앱 UI 패턴 모음 | ui | ui pattern library |
| 10 | SITES WE LIKE | 독일 디자인 매체가 매일 북마크하는 웹사이트 모음 | web | daily bookmarks |
| 11 | BP&O | 브랜딩·패키지 디자인 리뷰. 왜 좋은지까지 짚어주는 게 강점 | graphic | branding + packaging |
| 12 | BEST WEBSITE GALLERY | 2008년부터 이어온 웹 디자인 갤러리. 축적된 양이 압도적 | web | web design since 2008 |
| 13 | CARI | 인터넷 미학(aesthetics)을 분류하고 이름 붙인 아카이브 | graphic | internet aesthetics |
| 14 | PATTERNINDEX | 유명 사이트와 책에서 뽑은 UI 디자인 패턴 레퍼런스 | ui | ui pattern reference |

### tool (8)

| # | name | note | features | tagline |
|---|---|---|---|---|
| 15 | GRID CALCULATOR | 웹·인쇄용 그리드를 계산하고 AI/PSD로 내보내는 도구 | web, graphic | grid calculator |
| 16 | MECHANIC | 커스텀 웹 기반 디자인 툴을 직접 만들 수 있는 오픈소스 프레임워크 | code, graphic | build design tools |
| 17 | PATTERNICO | 심리스 패턴과 배경을 무료로 만드는 생성기 | graphic | seamless pattern maker |
| 18 | ARTBOARD STUDIO | 브라우저에서 목업을 만드는 에디터. 기기·의류·패키지까지 | graphic | online mockup editor |
| 19 | BARCODE GENERATOR | 1D·2D 바코드를 무료로 생성하고 내려받는 도구 | graphic | barcode generator |
| 20 | BROWSER FRAME | 스크린샷을 브라우저 창 프레임에 끼워주는 도구 | web | screenshot framing |
| 21 | CLEANMOCK | 최신 기기 프레임과 배경으로 목업을 빠르게 만드는 도구 | graphic | device mockups |
| 22 | PRATT GENERATOR | ⚠️확인필요 — Pratt 디자인 스쿨 관련 생성 도구로 추정 | graphic | — |

### asset (3)

| # | name | note | features | tagline |
|---|---|---|---|---|
| 23 | STAMEN MAPS | Toner·Terrain·Watercolor 지도 스타일을 무료로 제공 | graphic | free map styles |
| 24 | UI GOODIES | 아이콘·UI킷·타이포까지 디자인 리소스를 한곳에 모은 디렉토리 | ui, icon | design resource hub |
| 25 | CRAFTWORK | UI킷·일러스트·목업·폰트를 함께 다루는 리소스 마켓 | ui, graphic | ui kits + illustration |

### reading (5)

| # | name | note | features | tagline |
|---|---|---|---|---|
| 26 | THE PUDDING | 데이터를 비주얼 에세이로 풀어내는 매체. 인터랙티브 스토리텔링 참고 | web | visual essays |
| 27 | DESIGN KIT | IDEO.org의 인간 중심 디자인 방법론 학습 자료 | ui | human-centered design |
| 28 | BAYMARD | 20만 시간 분량의 이커머스 UX 연구. 근거가 필요할 때 | ui | ecommerce ux research |
| 29 | A BETTER SOURCE | 환경을 고려한 디자인 자원만 골라 모은 디렉토리 | graphic | eco-conscious sources |
| 30 | SHORTCUTS.DESIGN | ⚠️확인필요 — 디자인 툴 단축키를 한곳에 모은 사이트로 추정 | ui | — |

### community (4)

| # | name | note | features | tagline |
|---|---|---|---|---|
| 31 | STUDIO-INDEX | 전 세계 디자인 스튜디오를 모은 디렉토리 | graphic | studio directory |
| 32 | BADASS LADY CREATIVES | 여성 크리에이터 디렉토리 | graphic | women creatives |
| 33 | BLACKS WHO DESIGN | 흑인 디자이너 디렉토리 | graphic | black designers |
| 34 | OPEN DIRECTORY | 디자인 스튜디오·디렉터를 모은 성장형 디렉토리 | graphic | growing directory |

---

## ⚠️ 확인 필요 4건 (사이트 직접 방문 후 확정)

| 사이트 | 메타데이터 | 문제 |
|---|---|---|
| `camp.mumu.cz` | "CAMP - prototyp" | 설명 없음, 용도 불명 |
| `klikkentheke.com` | "Klikkenthéke" | 설명 없음, 용도 불명 |
| `prattgenerator.org` | "Pratt Generator" | 설명 없음, 무엇을 생성하는지 불명 |
| `shortcuts.design` | "Every shortcut for designers in one place" | 제목만으로 추정 작성함 |

---

## 검수 요청 사항

1. **`ui` feature 추가**에 동의하는지
2. 제외 6건 판단이 적절한지 (특히 `videocassettes.ru` — 취향에 따라 남길 수도 있음)
3. `note` 문체가 기존 26개와 어울리는지
   - 기존 예: "포트폴리오 전량. 그래픽·브랜딩 물량이 압도적이라 스타일 탐색용"
   - 이번 배치: "브루탈리즘 웹만 모은 갤러리. 규칙을 깨는 레이아웃이 필요할 때"
4. `⚠️확인필요` 4건을 직접 방문해 확정할지, 그냥 제외할지
