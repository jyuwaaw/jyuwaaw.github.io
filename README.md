# Personal Site

An [Astro](https://astro.build) personal site: projects, writing (essays and
notes, English with optional Chinese variants), two photo albums, and a small
toy. Fully static, deployed to GitHub Pages.

## Quick start (local)

Needs Node 22 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests for the gallery pipeline and theme bootstrap
npm run build      # static site in dist/
```

## Where things live

| Path | What it is |
|---|---|
| `posts/*.md` | Posts. Format is documented in `posts/add-a-post.md`. |
| `src/data/site.ts` | Name, role, email and profile links. |
| `src/data/projects.ts` | Projects for the home page and `/projects/`, grouped by shelf, filterable by track. |
| `src/data/timeline.ts` | The About timeline, the skills list, and the `signals` behind the timing diagram. |
| `src/content.config.ts` | Post schema. A misspelled `category` or malformed tag fails the build. |
| `src/lib/posts-loader.ts` | Reads `posts/`, splits each file at its `<!-- zh -->` marker into an English and a Chinese entry. |
| `src/pages/` | One file per route. |
| `src/components/` | Astro components, plus two React islands: `PhotoGallery.jsx` and `roast/`. |
| `src/styles/global.css` | Design tokens and all shared styles. `gallery.css` is loaded only by the two albums. |
| `lib/`, `scripts/` | Framework-independent gallery pipeline, theme bootstrap and their tests. |
| `workers/homescreen/` | Cloudflare Worker behind Roast My Homescreen. |

## Posts

Add a `.md` file to `posts/` with frontmatter (`title`, `date`, plus optional
`category`, `excerpt`, `section`, `tags`, `series`, `source`, and
`title_zh`/`excerpt_zh` + an `<!-- zh -->` body marker for a Chinese variant)
and it appears automatically. New posts are listed under Notes on `/blog/`;
`section: writing` lists a post under Essays and on the home page. `category`
is one of `learning` / `projects` / `meta` (defaults to `meta`); tags are
lowercase kebab-case and get pages at `/blog/tag/<tag>/`.

Permalinks are `/blog/<slug>/`, whatever the section. A post with a Chinese
variant also gets `/zh/blog/<slug>/`; the two pages link to each other and
declare each other as `hreflang` alternates. The marker has to be on its own
line, outside a code fence. `/writing/` redirects to `/blog/`. `/rss.xml` lists
the English posts.

Inline SVG diagrams in posts are styled with the site's CSS variables
(`--accent`, `--surface`, `--text`, `--muted`, `--faint`, `--border-2`,
`--accent-dim`, `--sans`, `--mono`). Those names are part of the content
contract: renaming one in `global.css` breaks existing diagrams.

## The timing diagram

The home and About pages draw the career path as a waveform: one signal per
line of work, high while it was active. It is generated at build time from
`signals` in `src/data/timeline.ts`; edit the dates there. A year-only start
(`from: '2024'`) is drawn as a hatched "started some time that year" stretch,
and `to: null` keeps the signal high up to the build date.

## Photography

Export selected photos into **`public/photography/`**. JPEG, PNG, WebP, and AVIF
files appear automatically on `/photography/` when the site rebuilds; no code edits
are needed. The default Style view follows the visitor’s local
time at page load: 06:00–10:59 favors soft light, 11:00–17:59 sunlight, and
18:00–05:59 night scenes and quiet shadows. It reorders all photos without hiding
any, and stays stable while browsing. Light groups are curated from the image
content, not inferred from capture timestamps. Date ↓ and Date ↑ sort by embedded
capture time, newest or oldest first, always with undated photos last. Export dates are never used.
The preparation command generates cached WebP previews (1440px) and large views
(2560px) in `public/photography/_web/`. Originals are unchanged. The generated
previews and a GPS-free source manifest in `lib/generated/` are committed.
Originals stay local and are ignored by Git; `postbuild` removes original-image
copies from `dist/` so deployment contains only the web versions. A clean checkout
builds from the manifest; caption edits still apply. Run `npm run gallery:prepare`
after adding or replacing photos, then commit its manifests and `_web/` assets.
Page requests, including in development, read only this prepared catalog; they
never scan or decode local originals. If dev is already running, run the preparation
command and refresh to see new photos. `npm run build` also runs preparation automatically.

### Add, replace, or remove photos

Use one PR per batch, starting from current `main`:

1. Create a branch (`git switch -c photos/autumn-trip`) and export the selected
   photos into `public/photography/` or `public/Mechanic/`. A fresh checkout only
   needs the **new** originals: existing manifest entries are preserved.
2. Add optional location, camera, date, alt text, and light/style overrides in
   `lib/photography.json` or `lib/mechanic.json`. Unknown values can stay blank.
3. Run `npm run gallery:prepare`, `npm test`, and `npm run build`. Check locally
   with `npm run dev`.
4. Commit the changed caption JSON, generated manifests, and `_web/` assets.
   Originals and temporary image files are ignored. Open a PR; check the diff
   and CI before merging. Merge to `main` publishes the site through Actions.

**Adding** merges by exact filename and never removes existing published photos.
Use distinct filenames for different images (phone cameras often reuse names).
**Replacing** uses the same filename with new image bytes; only that photo updates.
Preview identity uses a content hash, so changing a timestamp does not regenerate
an entire album. Existing preview URLs are adopted during the initial migration.
**Removing** is explicit: set `"exclude": true` on that filename in the caption
JSON, then run `gallery:prepare`. This removes its published entry and unused
previews but leaves the original intact; the exclusion also prevents accidental
re-import. Do not remove a photo merely by deleting its local original. To restore,
remove the exclusion and supply its original again, or revert the deletion commit.
To empty a collection, mark each published filename excluded and prepare it.

Only the compressed public versions belong in Git. Keep original/master files
in your photo library or backup. Replacing images repeatedly grows Git history;
if the gallery grows substantially, move image storage to an object store/CDN
and keep metadata and website code in Git. A PR remains useful in either setup.

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
A collection with no published or new non-excluded photos shows a coming-soon message. Development refreshes after files are
added; the static preview needs `npm run build` to show new exports.

## Benji’s Garage

Drop garage photos into **`public/Mechanic/`** (capital M). They appear on
`/mechanic/` in a light/dark garage journal with aligned photo rows. It shares image previews, metadata, and the large-image viewer
with Photography. Optional `label` fields set the journal captions; uncaptioned photos show “Garage notes” rather than filenames.
Optional captions, camera overrides, and ordering go in `lib/mechanic.json`, with
the same fields as Photography. Generated previews in `public/Mechanic/_web/`
are committed alongside its generated manifest, just like Photography.

## Deploy to GitHub Pages

Every push to `main` runs `.github/workflows/deploy.yml`: it installs with
Node 22, runs `npm run build`, and publishes `dist/`. Pull requests run
`validate.yml` (tests + build). In the repo settings, **Pages → Build and
deployment → Source** must be "GitHub Actions".

`astro.config.mjs` sets `site` to `https://jyuwaaw.github.io` and
`trailingSlash: 'always'`. This is a user site (`<username>.github.io`), so no
`base` is set; a project site would need one.

`npm run build` runs `gallery:prepare` first and `clean-gallery-export`
afterwards, so the deployed site contains only the prepared web images.

## Appearance and typography

The site follows the system color scheme by default. The header menu offers
System, Light and Dark; an explicit choice is remembered in
`benji-appearance-v2`, and a small validated script restores it before first
paint. Colors are defined once in `global.css` with `light-dark()`. Every page uses the same container width (`--maxw`), so the header sits in the same place on all of them.

Type is the IBM Plex family, self-hosted through Astro's Fonts API: Plex Sans
for reading, Plex Sans Condensed for page titles, Plex Mono for dates, labels
and code.

### Share a photograph

Opening a photograph updates the URL to `/photography/?photo=<stable-id>` (also supported by Garage). Opening that URL directly restores the full-size viewer. IDs depend on the collection and source filename, so reordering, metadata edits and image re-encoding do not break links; renaming or removing a source photo does. Next/Previous replace the current viewer URL, while browser Back returns to the wall and Forward restores the last frame. A directly opened shared link closes in place. The viewer's Copy link button copies the current URL, with a selectable-link fallback when clipboard access is blocked. These query URLs work with GitHub Pages static hosting; social previews still use the gallery page metadata.

## Home screen reviews

Open `/roastmyhomescreen/` for Roast My Homescreen. Choose screenshots or drop them on the page. The old `/play/homescreen/` link forwards here.
Private reviews send the full resized screenshots to OpenAI. Masks apply only in share mode.
A masked share card uses a separate review of the flattened redacted images. The PNG is
rendered locally from that review and those same images.

The review endpoint is a Cloudflare Worker in `workers/homescreen/`. From that directory,
use `npx wrangler secret put OPENAI_API_KEY` with the key for your API project and
`npx wrangler deploy`. Set `ALLOWED_ORIGINS` in its configuration to the site's exact origin.
Set the GitHub Actions repository variable `HOMESCREEN_API_URL` to the Worker's full HTTPS
URL ending in `/review` and rebuild Pages. For local development, set the same URL in the
environment variable `PUBLIC_HOMESCREEN_API_URL` (for example in `.env.local`) and include your local
site origin in the development Worker's `ALLOWED_ORIGINS`. Each new analysis calls OpenAI once; repeated downloads of the same share card reuse its review.
