# ThinkCode Vibe — 미리보기 실행 규칙 (필독)

미리보기 화면은 **0.0.0.0:5173** 에서, base 경로 **/preview/264-2wm8tj-1785985502985** 로만 서빙됩니다.
dev 서버는 반드시 아래 한 줄로 실행하세요:

    tc-dev

- 직접 `npm run dev` · `next dev` · `vite` 를 다른 포트(예: 3000)나 localhost 로 띄우면
  미리보기가 "Bad Gateway / read ECONNRESET" 로 깨집니다. 포트는 **5173 고정**.
- **Vite 가 가장 쉽습니다** — base 가 자동 설정됩니다.
- **vite.config 를 새로 만들 때는 반드시 `server: { host: '0.0.0.0', allowedHosts: true }` 를
  포함하세요.** 없으면 미리보기가 "Blocked request. This host is not allowed" 로 차단됩니다.
- **Next.js** 는 next.config 에 `basePath: process.env.NEXT_BASE_PATH || ''` 를 넣고 `tc-dev` 로
  실행하세요 (tc-dev 가 NEXT_BASE_PATH 를 주입). next.config 가 없으면 tc-dev 가 자동 생성합니다.
