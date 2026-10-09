# Personal Site

A Next.js (App Router) personal site, casual blog, and curated Writing page, styled after the dark Vercel/Geist
aesthetic. Static-exported for GitHub Pages.

## Quick start (local)

```bash
npm install
npm run dev        # http://localhost:3000
```

## Make it yours

1. **`lib/site.js`** — your name, role, email, GitHub, LinkedIn, résumé link, and avatar path. The avatar uses `public/images/graduation.png` with its head-and-shoulders framing set by `.avatar img` in `app/globals.css`. About uses the full `public/images/graduation.png` photo. The supplied original photo is unchanged; CSS controls the avatar crop.
2. **`lib/projects.js`** — project data for the homepage and Projects page.
3. **`app/about/page.jsx`** — your bio and the `timeline` array.
4. **`posts/*.md`** — blog posts. Add a `.md` file with frontmatter
   (`title`, `date`, plus optional `category`, `excerpt`, `section`, `tags`, `series`,
   `source`, and `title_zh`/`excerpt_zh` + an `<!-- zh -->` body marker for a
   Chinese variant) and it appears automatically. New posts default to Blog;
   add `section: writing` for a polished article on `/writing/` and the homepage.
   `category` is one of `learning` / `projects` / `meta` (defaults to `meta`);
   tags are unrestricted and get pages at `/blog/tag/<tag>/` across both sections.
   All article permalinks remain `/blog/<slug>/`, so changing a section preserves
   shared links. Each article's back link returns to its section.
5. Optional: drop `resume.pdf` (and any images) into **`public/`**.

## Photography

Export selected photos into **`public/photography/`**. JPEG, PNG, WebP, and AVIF
files appear automatically on `/photography/` when the site rebuilds; no code edits
are needed. Photography uses Jost Light. The default Style view follows the visitor’s local
time at page load: 06:00–10:59 favors soft light, 11:00–17:59 sunlight, and
18:00–05:59 night scenes and quiet shadows. It reorders all photos without hiding
any, and stays stable while browsing. Light groups are curated from the image
content, not inferred from capture timestamps. Date ↓ and Date ↑ sort by embedded
capture time, newest or oldest first, always with undated photos last. Export dates are never used.
The page automatically generates cached WebP previews (1440px) and large views
(2560px) in `public/photography/_web/`. Originals are unchanged. The generated
previews and a GPS-free source manifest in `lib/generated/` are committed.
Originals stay local and are ignored by Git; `postbuild` removes original-image
copies from `out/` so deployment contains only the web versions. A clean checkout
builds from the manifest; caption edits still apply. Run `npm run gallery:prepare`
after changing the local photo selection, then commit its manifests and `_web/`
assets. To remove every photo, also clear that collection’s manifest.

Optional captions go in `lib/photography.json`, matched by filename:

```json
[
  {
    "filename": "01-coast.jpg",
    "title": "Coast",
    "alt": "A description of what is in the photograph",
    "location": "Optional display location",
    "year": "Optional year",
    "camera": "Sony A7M3",
    "style": "Open skies",
    "light": "sunlit",
    "order": 0,
    "capturedAt": "2024-06-17T20:22:06"
  }
]
```

The curated style and order live in this file. `light` is one of `soft`, `sunlit`,
`golden`, `night`, or `low`; photos without it appear under More photographs. New unclassified photos appear
under Unsorted. `capturedAt` optionally corrects missing or inaccurate camera dates.
Titles default to a shortened filename (repeated DJI export timestamps are omitted).
Original filenames remain intact and identify captions. Camera and exposure details
come from EXIF; optional `camera` overrides let you fill in missing models. Camera
codes are displayed as readable names, such as ILCE-7M3 → Sony A7M3.
Location appears on a separate line when available. An explicit `location` overrides
embedded IPTC/XMP City, State, and Country fields; an empty string hides it.
Location overrides derived from GPS are city-level labels with provenance in
`locationSource`; coordinates are not sent to the browser.
Images retain their original proportions in compact justified rows. Capture metadata overlays the lower image edge; filenames are hidden in both
the gallery and the large-image viewer; hover gently zooms within the frame.
Mobile uses a single column, and reduced-motion preferences disable the zoom. Click a photo to view it larger, browse with arrow keys or Previous/Next,
and press Escape to close. The gallery never reads the Photos library directly.
An empty folder shows a coming-soon message. Development refreshes after files are
added; the static preview needs `npm run build` to show new exports.

## Mechanic

Drop garage photos into **`public/Mechanic/`** (capital M). They appear on
`/mechanic/` in a dark American garage journal with painted-sign typography with a featured image and asymmetric
photo sequence. It shares image previews, metadata, and the large-image viewer
with Photography. Optional `label` fields set the journal captions.
Optional captions, camera overrides, and ordering go in `lib/mechanic.json`, with
the same fields as Photography. Generated previews in `public/Mechanic/_web/`
are committed alongside its generated manifest, just like Photography.

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
