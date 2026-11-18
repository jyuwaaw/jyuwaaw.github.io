# Record shelf prototype

Question: how should all 119 playlists feel like physical vinyl records on shelves, while each opens its owner-selected songs?

Run `npm run dev` and open `/music-prototype/`. This route has no navigation entry and is marked noindex. It is a local visual prototype, not a published Music page.

The selected A layout is published through `/music/`, linked in the main
navigation with the standard site layout. Its variant switcher is disabled.
The comparison route stays noindex and is excluded from the sitemap; private
local management endpoints are not included in the static website.

- A: front-facing sleeves on a full wooden cabinet; selecting one opens its inner sleeve and track picks.
- B: nine thematic record crates, each browsed sideways.
- C: dense spine-facing shelves beside an always-visible listening desk.

The development-only bottom switcher and left/right keys cycle layouts. `?variant=A`, `?variant=B`, and `?variant=C` preserve the choice in the URL.

Content as of 2026-11-17: all 119 actual playlists and their custom covers. The owner selected every currently present song: 8,301 song appearances across playlists, with exact known recording links and explicitly marked search links where an ID is unavailable. Native duplicate occurrences share one selection. No account identifiers, private library URLs, Apple credentials, or audio files are included.

Choosing a song opens its public Apple Music page. Audio streaming and complete-playlist sharing are outside this visual prototype. Production integration needs verified public links for the jyuwaaw playlists.

The static data is an exported snapshot. Shelf browsing stays in memory and URL parameters; selections persist through the separate local manager. Likes use the shared service. Neither browsing nor curation modifies Apple Music.

The owner chose **A**. A separate, persistent local selection manager now lives
in `tools/record-shelf/`; see its README. It reads the current Mac Music library,
keeps manual choices across syncs, and serves its own A preview. It can explicitly
export a curated public snapshot back to this Astro prototype. No private full
library or management endpoint is part of this static route.

Playlist and selected-song hearts now use the existing shared Photography likes
service. A recording repeated across playlists has one total; playlist title and
cover edits preserve its own total. See `docs/music-likes.md`. The music route is
still a prototype, while the shared backend accepts its registered music IDs.

Opening a record now transfers its sleeve from the shelf to the paper detail
sheet, then slides out the vinyl and reveals the picks (about 740ms overall).
Closing retracts and returns it in 460ms. The native fullscreen dialog owns the
focus trap; a separate, non-interactive record inside its top layer performs the
flight without clipping at the paper edge. Close, Escape and backdrop use the
same interruptible return path, with source visibility, body scrolling and focus
restored on completion or unmount. Offscreen/random sources fade from the center
instead of flying across the whole page. Reduced-motion preferences skip the
flight and stagger. No playback or sound is triggered.

Each existing cover has a “下载封面” link below its artwork, downloading a
1254×1254 JPEG from `public/music-prototype/downloads/`. These full-size, high
quality derivatives are about 70.5MB together and are requested only on download;
the shelf still displays 640px WebPs. Original 1254px generated PNGs remain in the
private source folder. Regenerate downloads with `scripts/prepare-record-downloads.mjs`
and the original cover manifest path. The local installed service copies these
files independently of the checkout. The download link sits outside the artwork
box measured by the flight animation, preserving the existing motion.
