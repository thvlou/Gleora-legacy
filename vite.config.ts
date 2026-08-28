import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ThinkCode 컨테이너에서는 tc-dev 가 WORKSPACE_ID 를 주입한다.
// 그 경우 base·포트를 컨테이너 규칙(5173 고정)에 맞추고,
// 로컬에서 그냥 띄울 때는 루트('/') + 실행 환경이 준 PORT 를 따른다.
const workspaceId = process.env.WORKSPACE_ID

// https://vite.dev/config/
export default defineConfig({
  base: workspaceId ? `/preview/${workspaceId}` : '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    port: workspaceId ? 5173 : Number(process.env.PORT) || undefined,
    watch: {
      ignored: ['**/.apt/**', '**/.pw-tmp/**'],
    },
  },
})
