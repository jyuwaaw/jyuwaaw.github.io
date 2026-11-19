import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import coverManager from './tools/cover-manager/integration.mjs';
import { siteTypefaces } from './lib/type-proof.mjs';

// Static site for GitHub Pages (user site → no `base`).
// Permalinks keep the trailing slash the old Next.js export used.
export default defineConfig({
  site: 'https://jyuwaaw.github.io',
  trailingSlash: 'always',
  // Same port the site has always used locally, so the homescreen Worker's
  // development ALLOWED_ORIGINS keeps matching.
  server: { port: 3000 },
  integrations: [react(), coverManager(), sitemap({ filter: page => !new URL(page).pathname.startsWith('/music-prototype/') })],
  // /writing/ used to be a second index over the same posts.
  redirects: { '/writing': '/blog/' },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
  fonts: siteTypefaces(process.env.PORTFOLIO_TYPE_PROOF === '1').map(face => ({
    provider: fontProviders.fontsource(),
    name: face.name,
    cssVariable: `--font-${face.id}`,
    weights: face.weights,
    styles: face.styles,
    subsets: ['latin'],
    fallbacks: face.serif ? ['Songti SC', 'Georgia', 'serif'] : ['PingFang SC', 'Microsoft YaHei', 'Arial', 'sans-serif'],
  })),
});
