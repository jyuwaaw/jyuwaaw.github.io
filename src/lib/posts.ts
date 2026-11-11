import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export const CATEGORY_LABELS = { learning: 'Learning', projects: 'Projects', meta: 'Meta' } as const;

// YAML dates parse as UTC midnight, so format in UTC to keep the written day.
export const fmtDate = (date: Date) => date.toISOString().slice(0, 10);

export const postUrl = (post: Post) =>
  post.data.lang === 'zh' ? `/zh/blog/${post.data.slug}/` : `/blog/${post.data.slug}/`;

const newestFirst = (a: Post, b: Post) => b.data.date.valueOf() - a.data.date.valueOf();

export async function getPosts(lang: 'en' | 'zh' = 'en') {
  return (await getCollection('posts', (p) => p.data.lang === lang)).sort(newestFirst);
}

export async function getTags() {
  const tags = new Set<string>();
  for (const post of await getPosts()) post.data.tags.forEach((t) => tags.add(t));
  return [...tags].sort();
}

// Oldest first — a series reads in order.
export async function getSeries(series: string, lang: 'en' | 'zh' = 'en') {
  return (await getPosts(lang)).filter((p) => p.data.series === series).reverse();
}
