import { fileURLToPath } from 'node:url';

export default function coverManager() {
  return {
    name: 'local-cover-manager',
    hooks: {
      'astro:config:setup': ({ command, injectRoute, updateConfig }) => {
        if (command !== 'dev' || process.env.PORTFOLIO_COVER_MANAGER !== '1') return;
        updateConfig({ vite: { server: { strictPort: true }, cacheDir: 'node_modules/.vite-cover-manager' } });
        for (const [pattern, file] of [['/manage/covers', 'Manager.astro'], ['/manage/covers/preview', 'Preview.astro'], ['/manage/covers/save', 'save.ts']]) {
          injectRoute({ pattern, entrypoint: fileURLToPath(new URL(file, import.meta.url)), prerender: false });
        }
      },
    },
  };
}
