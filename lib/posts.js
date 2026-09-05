import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const POSTS_DIR = path.join(process.cwd(), 'posts');

// Closed set — one category per post (the "shelf"). Tags are the open
// vocabulary (the "index"). Order here is the display order of the filters.
export const CATEGORIES = ['learning', 'projects', 'meta'];
export const CATEGORY_LABELS = { learning: 'Learning', projects: 'Projects', meta: 'Meta' };

// A post body may carry a Chinese variant after an `<!-- zh -->` marker.
const ZH_MARKER = /<!--\s*zh\s*-->/;

// YAML parses bare dates into Date objects; normalize to a YYYY-MM-DD string.
function fmtDate(d) {
  if (!d) return '';
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d);
}

function normCategory(data) {
  // Legacy posts used a free-form `tag`; fold anything unknown into `meta`.
  const raw = String(data.category ?? data.tag ?? 'meta').toLowerCase();
  return CATEGORIES.includes(raw) ? raw : 'meta';
}

function normTags(data) {
  if (!Array.isArray(data.tags)) return [];
  return data.tags.map((t) => String(t).toLowerCase());
}

function splitZh(content) {
  const m = content.match(ZH_MARKER);
  if (!m) return { en: content, zh: null };
  return {
    en: content.slice(0, m.index),
    zh: content.slice(m.index + m[0].length),
  };
}

function readMeta(file) {
  const slug = file.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
  const { data } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    titleZh: data.title_zh ?? null,
    date: fmtDate(data.date),
    excerpt: data.excerpt ?? '',
    section: data.section === 'writing' ? 'writing' : 'blog',
    category: normCategory(data),
    tags: normTags(data),
    series: data.series ?? null,
  };
}

export function getAllPosts(section) {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  const posts = files.map(readMeta).filter((post) => !section || post.section === section);
  // newest first
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug) {
  const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.md`), 'utf8');
  const { data, content } = matter(raw);
  const { en, zh } = splitZh(content);
  return {
    slug,
    title: data.title ?? slug,
    titleZh: data.title_zh ?? null,
    date: fmtDate(data.date),
    section: data.section === 'writing' ? 'writing' : 'blog',
    category: normCategory(data),
    tags: normTags(data),
    series: data.series ?? null,
    source: data.source ?? null,
    html: marked.parse(en),
    htmlZh: zh ? marked.parse(zh) : null,
  };
}

export function getAllSlugs() {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function getAllTags() {
  const tags = new Set();
  getAllPosts().forEach((p) => p.tags.forEach((t) => tags.add(t)));
  return [...tags].sort();
}

export function getPostsByTag(tag) {
  return getAllPosts().filter((p) => p.tags.includes(tag));
}

export function getSeriesPosts(series) {
  // oldest first — a series reads in order
  return getAllPosts()
    .filter((p) => p.series === series)
    .sort((a, b) => (a.date > b.date ? 1 : -1));
}
