# Photo likes

Photography has anonymous shared likes in the grid and full-size viewer. Garage is unchanged. Counts and pressed state come from a Cloudflare Worker backed by D1. The static GitHub Pages site still serves every page and image.

**Deployment status:** backend not provisioned. With `NEXT_PUBLIC_PHOTO_LIKES_API` unset, the site hides like buttons and makes no likes requests. Merging this code alone does not enable shared likes.

## Set up a personal backend

Use your personal Cloudflare account. All commands below run from the repository root with Node 22.13+ and `npm ci` installed. Wrangler is pinned in devDependencies. Never put tokens or the visitor secret in GitHub Pages variables, public source, or a `NEXT_PUBLIC_` variable.

1. Authenticate with `npx wrangler login`, verify the account with `npx wrangler whoami`, then create the database:

   ```sh
   npx wrangler d1 create benji-photo-likes
   ```

2. Put the returned database ID into `workers/photo-likes/wrangler.jsonc`. Set `ALLOWED_ORIGINS` to the exact website origin (no path or trailing slash). Multiple origins are comma-separated. Add a custom domain here when moving the site. Choose a rate-limit namespace ID not used by another Worker in this personal account.

3. Generate a random secret of at least 32 bytes in a password manager and store it using the interactive prompt:

   ```sh
   npx wrangler secret put VISITOR_SECRET --config workers/photo-likes/wrangler.jsonc
   ```

   Keep this secret stable and backed up privately. Changing it makes existing visitors appear new and prevents them from cancelling their old likes. No secret belongs in this repository.

4. Prepare the current catalog, migrate the personal database and deploy:

   ```sh
   npm run likes:catalog
   npx wrangler d1 migrations apply benji-photo-likes --remote --config workers/photo-likes/wrangler.jsonc
   npx wrangler deploy --config workers/photo-likes/wrangler.jsonc
   ```

5. In this GitHub repository, Settings → Secrets and variables → Actions → **Variables**, create `NEXT_PUBLIC_PHOTO_LIKES_API` with the deployed HTTPS Worker origin, such as `https://benji-photo-likes.YOUR-SUBDOMAIN.workers.dev` (no trailing path). This URL is public, not a secret. Re-run the **Deploy to GitHub Pages** workflow; Next.js reads it at build time.

6. On Photography, like one photo, reload, open its viewer and unlike it. In another browser verify the shared total. Verify a network failure shows a retry message rather than a fabricated count. Verify Garage has no like controls.

No automatic Worker deployment or cloud credentials are configured by this PR. Deployments above are deliberately explicit.

## Future photos

Run the normal `npm run gallery:prepare`; it also updates `workers/photo-likes/catalog.json`. Commit the generated catalog with the image changes, and redeploy the Worker before deploying the corresponding site. Already-published photos keep their likes because IDs depend on collection + filename, not metadata, order or image encoding. Renaming a source file creates a new identity. Removed photos cannot receive new votes once the new Worker catalog is deployed. Their historical rows stay in D1.

If site and Worker catalogs briefly differ, known photos continue working and unrecognized photos have no like button. No whole-gallery failure occurs.

## Local verification

```sh
npm test
npm run likes:check
npm run build
npx wrangler d1 migrations apply benji-photo-likes --local --config workers/photo-likes/wrangler.jsonc
npx wrangler dev --config workers/photo-likes/wrangler.jsonc --port 8787 --var ALLOWED_ORIGINS:http://127.0.0.1:3112 --var VISITOR_SECRET:local-development-only
```

In another terminal:

```sh
NEXT_PUBLIC_PHOTO_LIKES_API=http://127.0.0.1:8787 npm run dev -- --hostname 127.0.0.1 --port 3112
```

The literal local-development value is only for the isolated local database. `.wrangler` and `.dev.vars*` are ignored. Unit tests execute actual SQL against in-memory SQLite and check API validation, idempotency, separate voters, rate limits, network failure, storage failure and catalog consistency. `likes:check` bundles the Worker without deploying or requiring an account.

## Semantics and limits

- One vote per photo per browser identity, with cancellation. A random ID lives in localStorage; D1 stores only its HMAC plus the photo ID. The app does not store names, emails or raw IP addresses. The Worker uses a keyed hash of Cloudflare's client IP for a coarse abuse limit; Cloudflare may process its own service logs.
- This is not verified-person voting. Clearing storage, private browsing or another device creates another voter. No login, cookies or fingerprinting.
- IP rate limits are approximate and per Cloudflare location; shared networks may share the allowance. CORS and the catalog limit casual misuse, not determined bots. This is a small personal-gallery feature, not a contest or trustworthy popularity metric.
- Counts refresh on page load, after a successful vote or Retry; they are not live subscriptions across viewers. PUT writes the desired state, so retries do not add duplicates. A timed-out write may have reached the database; Retry reads the authoritative state.
- Reads are batched in groups of 80 (below D1's bound-parameter limit). Buttons appear only for confirmed responses. Requests time out after eight seconds, and duplicate in-flight clicks are blocked.
- D1/Worker usage is subject to your account's quotas. Review usage in Cloudflare after enabling. To disable likes, remove the GitHub variable and rebuild; the database is preserved.

Reference: [D1 batch transactions](https://developers.cloudflare.com/d1/worker-api/d1-database/) and [Worker rate limits](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).
