import react from '@vitejs/plugin-react';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      include: ['src/hooks/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {functions: 90, lines: 90, statements: 90},
    },
  },
});
