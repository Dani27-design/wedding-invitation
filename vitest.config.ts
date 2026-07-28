import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  envPrefix: ['NEXT_PUBLIC_'],
  test: {
    environment: 'jsdom',
    exclude: ['functions/**', 'node_modules/**'],
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    env: {
      // Load .env vars into process.env for tests
      ...Object.fromEntries(
        Object.entries(process.env).filter(([k]) => k.startsWith('NEXT_PUBLIC_'))
      ),
    },
  },
});
