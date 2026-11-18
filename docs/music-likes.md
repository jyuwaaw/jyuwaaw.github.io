# Music likes

The record shelf reuses Photography's anonymous shared likes. A playlist has a
heart beside its shelf caption and beside its title in the open sleeve. Each
selected song has its own heart. These controls share one state so both playlist
buttons agree, and a recording appearing in several playlists shares one total.
Song links remain separate controls; a like never opens a song or a record.

The existing `benji-photo-likes` Worker and D1 database serve the votes with no
schema changes. Its 2026-11-17 all-selected snapshot registers 119 playlist IDs
and 7,145 unique known recording IDs (8,301 selected song appearances, including
two search links) alongside the previous 110 photo/toy IDs. All
previous IDs remain accepted; their counters and the existing visitor secret are
retained. No counts are initialized with fabricated likes.

## Identities

`lib/music-like-id.mjs` uses the existing 32-character SHA-256 scheme in separate
`music-playlist` and `music-song` namespaces. A playlist uses its stable public
record ID, independent of title, cover, category or ordering. A recording uses
its exact Apple Music catalogue song ID, independent of URL slug or storefront.
Different catalogue recordings/versions have different totals. Search links do
not get guessed recording identities or like buttons.

`withMusicLikeIds()` decorates the public catalogue at the Astro route and the
local preview API. It never exports native Music persistent IDs. The existing
visitor key/identity, desired-state PUT writes, database uniqueness, count
validation, retry, timeout, and rate limit semantics are reused unchanged.
One vote per browser identity, reversible; another device/browser is another
identity. No account login or fingerprinting is introduced.

Only a confirmed backend response shows a heart; zero counts are not printed.
Pending clicks are disabled. A failure never claims success or invents a count;
Retry reloads authoritative state in case a timed-out write actually succeeded.
Requests are batched up to 80 unique IDs, including songs repeated in playlists.
Playlist totals load once for the shelf; song totals load only for the open
playlist. Independent hooks keep the shelf stable while changing playlists and
avoid fetching thousands of song totals on initial page load.

## Preview and publishing

The local A preview at <http://127.0.0.1:4324/shelf/> uses the real shared service
through a fixed-destination, same-origin `/api/music-likes` proxy. It accepts only
currently public playlist/selected-song IDs and forwards only the visitor ID,
item IDs and desired vote. No account data, full library, admin session token or
unselected song metadata leaves the Mac. Public origins on the Worker remain
unchanged; the proxy does not expose private admin actions.

The static Astro route uses the existing `PUBLIC_PHOTO_LIKES_API` setting already
provided by the GitHub Pages workflow. An empty setting disables likes, matching
Photography's behavior. The Music page itself is still an unpublished prototype.

After exporting a new public music snapshot:

1. Run `npm run likes:catalog` to refresh the allowlist, retaining photo/toy IDs.
2. Run `npm test`, `npm run music:test`, and `npm run likes:check`.
3. Deploy the existing Worker with its existing configuration. Do not rotate its
   visitor secret or recreate D1.
4. Publish the corresponding website snapshot when ready. Until then, unknown
   IDs have no heart rather than a fake zero; already-known items keep working.

## Verification

Tests execute actual Worker SQL with separate voters, idempotent writes and
cancellation, and check identity stability, cross-playlist song sharing, photo
isolation, public-only forwarding and local admin protection. Browser checks
cover card/detail agreement, song votes, reload persistence, shared recordings,
cancellation, and narrow-screen controls. Browser test votes are withdrawn.
