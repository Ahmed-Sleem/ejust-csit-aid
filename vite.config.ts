import { defineConfig } from 'vitest/config';
export default defineConfig({
  base: './', server: { host: true, allowedHosts: true },
  build: { target: 'es2022', sourcemap: true },
  test: { exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'] }
});
