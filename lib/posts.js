import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const POSTS_DIR = path.join(process.cwd(), 'posts');

// YAML parses bare dates into Date objects; normalize to a YYYY-MM-DD string.
function fmtDate(d) {
  if (!d) return '';
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d);
}

export function getAllPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { data } = matter(raw);
    return {
      slug,
      title: data.title ?? slug,
      date: fmtDate(data.date),
      excerpt: data.excerpt ?? '',
      tag: data.tag ?? 'Post',
    };
  });
  // newest first
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug) {
  const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.md`), 'utf8');
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    date: fmtDate(data.date),
    tag: data.tag ?? 'Post',
    html: marked.parse(content),
  };
}

export function getAllSlugs() {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}
