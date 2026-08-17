// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  // No SSR adapter, deliberately. Static output means /sabhi-card, /card/* and /madad
  // prerender to plain HTML with zero hydration, so the phone numbers survive JavaScript
  // being off (UF-15) — and there is no server request log to leak, which the no-tracking
  // principle depends on.
  output: 'static',

  site: process.env.SITE_URL || 'https://merahaq.pages.dev',

  vite: {
    plugins: [tailwind()],
    server: {
      host: '0.0.0.0',
      allowedHosts: true,
    },
  },

  build: {
    // The shell must paint in one round trip on a throttled 2G evening (UF-13).
    // Total CSS is small enough to inline, so it does.
    inlineStylesheets: 'always',
  },

  compressHTML: true,

  // No locale detection, ever (F-112). Language is always an explicit, visible choice.
  i18n: undefined,
});
