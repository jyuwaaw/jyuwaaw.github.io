# Local record shelf manager

The public design is A (front-facing record sleeves). The manager is a separate,
loopback-only app and is not included in Astro's static build or GitHub Pages.

## Use

`npm run music:manage` opens the service at <http://127.0.0.1:4324/>.
The manager autosaves each checkbox to disk. `/shelf/` previews the current
choices; refocusing that tab refreshes its catalogue. These are local previews.
“保存待发布版本” writes only the curated public snapshot to
`src/data/prototypes/records.json`. It does not commit, push, or publish.

`npm run music:service:install` installs the per-user macOS LaunchAgent
`com.benji.record-shelf`, which starts this same loopback service on login and
restarts it on failure. `npm run music:service:remove` stops it and removes its
startup entry, retaining data. Do not start a second manual copy while it runs.
The installed service copies its reader, server, browser bundle, and covers into
the private application directory, so switching the website's Git branch does
not stop the manager. Reinstall after changing its source. Exporting a new public
snapshot still targets the original website checkout.
Change sync frequency in the manager (daily by default, also 6 hours, weekly,
manual). The timer checks every minute; sleeping/offline Macs catch up when
running again. A failed sync retries after 15 minutes and keeps the old data.
This reads the Mac's cached Music library; phone changes must reach that Mac
through Apple's Sync Library before the reader can see them. It is not a cloud
MusicKit cron job. No paid developer account or Apple credentials are required
on the verified Mac with Apple's Swift command-line tools installed.

## Data and recovery

Private state lives in `~/Library/Application Support/Benji Record Shelf/`,
outside the repository and static assets. `library.json` contains the current
state, native persistent IDs, full song metadata, and manual selections. The
initial bootstrap reconstructs the verified 119 playlists from the original
backup and the three verified merges, then binds them to the current Mac Music
library. Catalogue aliases in two initial draft selections are resolved only
when title, artist, and duration identify exactly one backup track. Localized
artist names can bind by an otherwise identical full ordered sequence (title,
album, duration); ambiguous matches are not guessed.

Subsequent syncs use playlist/track persistent IDs, with known catalogue URL
aliases to preserve a selection when Music recreates the same recording. New
tracks start unselected. Removed tracks/playlists remain as tombstones, keeping
their selections for recovery but hiding them in the public projection. A
removed track automatically returns to the public selection if it returns.
Duplicate occurrences of a known recording share one checkbox; different
recordings/versions remain separate. Renames and reorders preserve choices.
Large library changes (less than 80% of bound playlist IDs, or >30% track loss
from a large playlist) pause the entire sync for review. This is not Apple
account authentication: the confirmed account at setup was jyuwaaw, and the
anchor check prevents silently binding a different library later.

Each day gets one full recovery snapshot and each change gets a small selection
history in `backups/`. The “备份选曲” link downloads a complete backup. To restore
the full backup, stop the service, save the current library.json elsewhere, copy
the chosen complete backup to library.json, and restart. Choice-only history can
be applied to an appropriate full library backup by matching playlist key and
selected track IDs. Do not bootstrap again over existing selections.

Known catalogue URLs remain exact song links. New songs without a verified
catalogue ID use a clearly marked Apple Music search link; the native framework
does not expose a documented catalogue ID field. No private Music endpoints or
fuzzy track replacement is used. No audio or credentials are collected.

Only `publicCatalogue()` can export public data: selected present songs, covers,
and editorial metadata, with no account identifiers, native IDs, private library
URLs, or unselected tracks. No CORS access; mutating requests require same-origin
JSON plus a per-process session header. Host validation prevents DNS rebinding.
The service binds only to 127.0.0.1 and is not a remotely authenticated admin.
Remote management and publishing still need a separate deployment integration.

## Checks

`npm run music:test` covers sync invariants, recording versions, removal/recovery,
concurrent edits, stale revisions, durable save, public-data minimization, and
cross-origin/Host rejection. `npm test` covers the existing website.
Use `npx astro build` to check the site without invoking photo preparation.

Apple references: [iTunesLibrary](https://developer.apple.com/documentation/ituneslibrary),
[playlist export](https://support.apple.com/guide/music/mus27cd5060f/mac).
