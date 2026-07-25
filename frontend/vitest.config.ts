import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    globals: true,
    environment: 'jsdom',
    // http://localhost (sans port) : nécessaire pour que les URL relatives d'axios
    // (baseURL '/api/v1') se résolvent au même origin que les gestionnaires MSW
    // enregistrés avec des URL absolues dans les tests (voir http.test.ts).
    environmentOptions: { jsdom: { url: 'http://localhost/' } },
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/app/**', 'src/design/**', 'src/shell/**', 'src/lib/**', 'src/features/**'],
      exclude: ['**/*.test.{ts,tsx}', 'src/test/**'],
      thresholds: { lines: 75, functions: 75, branches: 70, statements: 75 },
    },
  },
})
