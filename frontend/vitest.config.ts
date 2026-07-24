import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    globals: true,
    environment: 'jsdom',
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
