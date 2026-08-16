import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Unit suites only. Browser-dependent assertions live in tests/e2e/ under Playwright.
    include: ['tests/*.spec.ts'],
    environment: 'node',
    reporters: ['default'],
  },
});
