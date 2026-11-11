import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Static site for GitHub Pages (user site → no `base`).
// Permalinks keep the trailing slash the old Next.js export used.
export default defineConfig({
  site: 'https://jyuwaaw.github.io',
  trailingSlash: 'always',
  // Same port the site has always used locally, so the homescreen Worker's
  // development ALLOWED_ORIGINS keeps matching.
  server: { port: 3000 },
  integrations: [react(), sitemap()],
  // /writing/ used to be a second index over the same posts.
  redirects: { '/writing': '/blog/' },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'IBM Plex Sans',
      cssVariable: '--font-plex-sans',
      weights: [400, 500, 600],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['PingFang SC', 'Microsoft YaHei', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'IBM Plex Sans Condensed',
      cssVariable: '--font-plex-condensed',
      weights: [500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['PingFang SC', 'Microsoft YaHei', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'IBM Plex Mono',
      cssVariable: '--font-plex-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
});
