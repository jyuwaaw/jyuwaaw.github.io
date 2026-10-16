const ENTRY_KEY = '__benjiPhotoViewer';

export function galleryPhotoUrl(href, shareId) {
  const url = new URL(href);
  if (shareId) url.searchParams.set('photo', shareId);
  else url.searchParams.delete('photo');
  return url;
}

// Keep routing separate from the dialog: programmatic dialog.close() must not
// write another history entry when Back/Forward already changed the URL.
export function createGalleryNavigation(browser, photos, onChange, token) {
  const byShareId = new Map(photos.map(p => [p.shareId, p.id]));
  const byId = new Map(photos.map(p => [p.id, p.shareId]));
  let closing = false;
  const read = () => byShareId.get(new URL(browser.location.href).searchParams.get('photo')) ?? null;
  const sync = () => { closing = false; onChange(read()); };
  browser.addEventListener('popstate', sync);
  sync();
  return {
    open(id) {
      if (closing || !byId.has(id)) return;
      const url = galleryPhotoUrl(browser.location.href, byId.get(id));
      if (read()) {
        // Paging inside an open viewer replaces its URL; Back returns to the wall.
        browser.history.replaceState(browser.history.state, '', url.href);
      } else {
        browser.history.pushState({ ...browser.history.state, [ENTRY_KEY]: token }, '', url.href);
      }
      sync();
    },
    close() {
      if (closing) return;
      if (browser.history.state?.[ENTRY_KEY] === token && read()) {
        closing = true;
        browser.history.back();
      } else {
        // A shared URL opened directly must close in place, never leave the site.
        const state = { ...browser.history.state };
        delete state[ENTRY_KEY];
        browser.history.replaceState(state, '', galleryPhotoUrl(browser.location.href, null).href);
        sync();
      }
    },
    dispose() { browser.removeEventListener('popstate', sync); },
  };
}
