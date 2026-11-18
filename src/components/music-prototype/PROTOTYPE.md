# Record shelf prototype

Question: how should all 119 playlists feel like physical vinyl records on shelves, while each opens a small selection of songs?

Run `npm run dev` and open `/music-prototype/`. This route has no navigation entry and is marked noindex. It is a local visual prototype, not a published Music page.

- A: front-facing sleeves on a full wooden cabinet; selecting one opens its inner sleeve and track picks.
- B: nine thematic record crates, each browsed sideways.
- C: dense spine-facing shelves beside an always-visible listening desk.

The development-only bottom switcher and left/right keys cycle layouts. `?variant=A`, `?variant=B`, and `?variant=C` preserve the choice in the URL.

Content: all 119 actual playlist names, their existing custom covers, and 343 draft song selections. Each selection was chosen from tracks in the library backup and keeps its actual Apple Music song URL and recording version. Short playlists retain their actual one or two songs. This is an initial editorial selection, not a claim that the owner has approved every pick. No account identifiers, private library URLs, Apple credentials, or audio files are included.

Choosing a song opens its public Apple Music page. Audio streaming and complete-playlist sharing are outside this visual prototype. Production integration needs verified public links for the jyuwaaw playlists.

The data is a snapshot from 2026-11-17. Preview state stays in memory and URL parameters only; it never changes Apple Music or a remote service.

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
