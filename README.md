# Personal Site

A Next.js (App Router) personal site + blog, styled after the dark Vercel/Geist
aesthetic. Static-exported for GitHub Pages.

## Quick start (local)

```bash
npm install
npm run dev        # http://localhost:3000
```

## Make it yours

1. **`lib/site.js`** — your name, role, email, GitHub, LinkedIn, résumé link.
2. **`app/page.jsx`** — the `projects` array (homepage "Selected work").
3. **`app/about/page.jsx`** — your bio and the `timeline` array.
4. **`posts/*.md`** — blog posts. Add a `.md` file with frontmatter
   (`title`, `date`, `tag`, `excerpt`) and it appears automatically.
5. Optional: drop `resume.pdf` (and any images) into **`public/`**.

## Deploy to GitHub Pages

### One-time setup

1. **Set the base path** in `next.config.mjs`:
   - Repo named `<username>.github.io` → leave `basePath = ''`.
   - Any other repo name → set `basePath = '/your-repo-name'`.
2. Push this project to your repo's `main` branch (see commands below).
3. In your repo on GitHub: **Settings → Pages → Build and deployment →
   Source → "GitHub Actions"**.

That's it. Every push to `main` triggers `.github/workflows/deploy.yml`,
which builds the static site and publishes it. First deploy takes ~1–2 min;
watch progress under the repo's **Actions** tab.

### Push commands

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

(If you already created the repo with a README, run `git pull origin main --rebase`
before pushing, or just `git push -u origin main --force` on a fresh repo.)

## Notes

- Built static (`output: 'export'`) — no server needed, works anywhere.
- `trailingSlash: true` and `images.unoptimized` are set for Pages compatibility.
- The workflow adds `.nojekyll` so GitHub doesn't strip the `_next` folder.
