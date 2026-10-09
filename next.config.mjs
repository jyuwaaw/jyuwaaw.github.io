/**
 * Next.js config for static export → GitHub Pages.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  BASE PATH — read this:                                              │
 * │                                                                     │
 * │  • If your repo is named  <username>.github.io  (a USER site),      │
 * │    leave basePath as ''  →  site lives at  username.github.io/      │
 * │                                                                     │
 * │  • If your repo has ANY OTHER name (a PROJECT site, e.g. "site"),   │
 * │    set basePath to  '/your-repo-name'                               │
 * │    →  site lives at  username.github.io/your-repo-name/            │
 * └─────────────────────────────────────────────────────────────────────┘
 */
const basePath = ''; // e.g. '/my-site' for a project repo. '' for <username>.github.io

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  output: 'export',          // produce a static ./out folder
  trailingSlash: true,       // makes GitHub Pages routing work cleanly
  images: { unoptimized: true }, // GitHub Pages can't run Next's image optimizer
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
