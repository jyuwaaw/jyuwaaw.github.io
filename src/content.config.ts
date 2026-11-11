import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { postsLoader } from './lib/posts-loader';

// Closed set — one category per post (the "shelf"). Tags are the open
// vocabulary (the "index"). A typo here fails the build instead of being
// silently filed under `meta`.
export const CATEGORIES = ['learning', 'projects', 'meta'] as const;

const posts = defineCollection({
  loader: postsLoader({ dir: 'posts' }),
  schema: z.object({
    slug: z.string(),
    lang: z.enum(['en', 'zh']),
    bilingual: z.boolean(),
    title: z.string().min(1),
    excerpt: z.string().default(''),
    date: z.coerce.date(),
    // `writing` = essays and worked-through articles; `blog` = quick notes.
    section: z.enum(['writing', 'blog']).default('blog'),
    category: z.enum(CATEGORIES).default('meta'),
    tags: z.array(z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'tags are lowercase kebab-case')).default([]),
    series: z.string().optional(),
    source: z.url().optional(),
  }),
});

export const collections = { posts };
