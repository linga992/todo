import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages では https://linga992.github.io/todo/ の下に配信されるため、
  // ビルド時はリポジトリ名をベースパスにする。開発サーバーはルートのままにして、
  // http://localhost:5173/ でそのまま開けるようにしておく。
  base: command === 'build' ? '/todo/' : '/',
  plugins: [react()],
  test: {
    // ロジックだけを対象にしているので DOM は不要。
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}))
