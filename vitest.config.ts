import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envPrefix: ['NEXT_PUBLIC_'],
  test: {
    environment: 'jsdom',
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
