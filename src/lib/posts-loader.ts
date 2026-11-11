import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import matter from 'gray-matter';
import type { Loader } from 'astro/loaders';

// A post body may carry a Chinese variant after an `<!-- zh -->` marker.
// Each variant becomes its own entry (`slug` and `slug.zh`) so both get a
// real page, a correct `lang`, and their own rendered HTML.
const ZH_MARKER = /^\s*<!--\s*zh\s*-->\s*$/;
const FENCE = /^\s*(```|~~~)/;

// Split on the first marker that sits on its own line outside a code fence,
// so a post can show the marker in an example without being cut in half.
function splitZh(content: string) {
  const lines = content.split('\n');
  let fenced = false;
  for (let i = 0; i < lines.length; i++) {
    if (FENCE.test(lines[i])) fenced = !fenced;
    else if (!fenced && ZH_MARKER.test(lines[i])) {
      return { en: lines.slice(0, i).join('\n'), zh: lines.slice(i + 1).join('\n') };
    }
  }
  return { en: content, zh: null };
}

export function postsLoader({ dir = 'posts' }: { dir?: string } = {}): Loader {
  return {
    name: 'posts-loader',
    async load({ store, parseData, renderMarkdown, generateDigest, config, watcher }) {
      const root = fileURLToPath(config.root);
      const base = path.resolve(root, dir);

      async function sync() {
        const files = (await fs.readdir(base)).filter((f) => f.endsWith('.md')).sort();
        const seen = new Set<string>();
        for (const file of files) {
          const absolute = path.join(base, file);
          const filePath = path.relative(root, absolute).split(path.sep).join('/');
          const raw = await fs.readFile(absolute, 'utf8');
          const { data: fm, content } = matter(raw);
          const slug = file.replace(/\.md$/, '');
          const bodies = splitZh(content);
          for (const lang of ['en', 'zh'] as const) {
            const body = bodies[lang];
            if (body == null) continue;
            const id = lang === 'en' ? slug : `${slug}.zh`;
            const data = await parseData({
              id,
              filePath,
              data: {
                slug,
                lang,
                bilingual: bodies.zh != null,
                title: (lang === 'zh' && fm.title_zh) || fm.title,
                excerpt: (lang === 'zh' && fm.excerpt_zh) || fm.excerpt,
                date: fm.date,
                section: fm.section,
                category: fm.category,
                tags: fm.tags,
                series: fm.series,
                source: fm.source,
              },
            });
            seen.add(id);
            store.set({
              id,
              data,
              body,
              filePath,
              digest: generateDigest(`${lang}\n${raw}`),
              rendered: await renderMarkdown(body, { fileURL: pathToFileURL(absolute) }),
            });
          }
        }
        for (const id of store.keys()) if (!seen.has(id)) store.delete(id);
      }

      await sync();
      if (watcher) {
        watcher.add(base);
        const onChange = (changed: string) => {
          if (changed.startsWith(base) && changed.endsWith('.md')) sync();
        };
        watcher.on('add', onChange).on('change', onChange).on('unlink', onChange);
      }
    },
  };
}
