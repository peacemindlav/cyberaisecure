import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

import { generateSitemap } from './scripts/generate-sitemap.ts';

const sitemapPlugin = () => ({
  name: 'generate-sitemap',
  buildStart() {
    try {
      generateSitemap();
    } catch (e) {
      console.error('[sitemap] Error generating sitemap:', e);
    }
  },
});

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), sitemapPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
