import test from 'node:test';
import assert from 'node:assert/strict';
import { createGalleryNavigation, galleryPhotoUrl } from './gallery-link.mjs';

const photos = [{ id: 'first.jpg', shareId: 'a1' }, { id: 'second.jpg', shareId: 'b2' }];
function browserAt(href) {
  const entries = [{ href, state: { __NA: true, tree: 'preserved' } }];
  let index = 0;
  const listeners = new Set();
  const queued = [];
  const browser = {
    location: { href },
    history: {
      get state() { return entries[index].state; },
      pushState(state, _, next) { entries.splice(index + 1); entries.push({ href: next, state }); index++; browser.location.href = next; },
      replaceState(state, _, next) { entries[index] = { href: next, state }; browser.location.href = next; },
      back() { queued.push(() => browser.go(-1)); },
    },
    addEventListener(_, listener) { listeners.add(listener); },
    removeEventListener(_, listener) { listeners.delete(listener); },
    go(step) { index += step; assert.ok(index >= 0 && index < entries.length); browser.location.href = entries[index].href; listeners.forEach(listener => listener()); },
    flush() { while (queued.length) queued.shift()(); },
    get length() { return entries.length; },
    get pendingBacks() { return queued.length; },
    get listenerCount() { return listeners.size; },
  };
  return browser;
}

test('photo URLs retain base paths, unrelated query parameters and fragments', () => {
  const url = galleryPhotoUrl('https://example.com/site/photography/?from=friend#gallery', 'a+b 中文');
  assert.equal(url.searchParams.get('photo'), 'a+b 中文');
  assert.equal(url.pathname, '/site/photography/');
  assert.equal(url.searchParams.get('from'), 'friend');
  assert.equal(url.hash, '#gallery');
  assert.equal(galleryPhotoUrl(url.href, null).href, 'https://example.com/site/photography/?from=friend#gallery');
});

test('opening, paging, Back and Forward keep the viewer and URL synchronized', () => {
  const browser = browserAt('https://example.com/photography/');
  let active;
  const nav = createGalleryNavigation(browser, photos, value => { active = value; }, 'session');
  assert.equal(active, null);
  nav.open('first.jpg');
  assert.equal(active, 'first.jpg');
  assert.equal(browser.history.state.tree, 'preserved');
  nav.open('second.jpg');
  assert.equal(active, 'second.jpg');
  assert.equal(browser.length, 2, 'paging does not fill browser history');
  assert.equal(new URL(browser.location.href).searchParams.get('photo'), 'b2');
  browser.go(-1);
  assert.equal(active, null);
  browser.go(1);
  assert.equal(active, 'second.jpg');
  nav.close();
  nav.close();
  assert.equal(browser.pendingBacks, 1, 'double close must not navigate away from the gallery');
  browser.flush();
  assert.equal(active, null);
  assert.equal(browser.location.href, 'https://example.com/photography/');
  nav.dispose();
  assert.equal(browser.listenerCount, 0);
});

test('direct links open by stable identity regardless of gallery order; closing stays on site', () => {
  const browser = browserAt('https://example.com/photography/?photo=b2&from=friend');
  let active;
  const nav = createGalleryNavigation(browser, [...photos].reverse(), value => { active = value; }, 'new-session');
  assert.equal(active, 'second.jpg');
  nav.close();
  assert.equal(active, null);
  assert.equal(browser.pendingBacks, 0);
  assert.equal(browser.location.href, 'https://example.com/photography/?from=friend');
  assert.equal(browser.history.state.__NA, true);
});

test('reload of an owned viewer entry closes in place instead of traversing old history', () => {
  const browser = browserAt('https://example.com/mechanic/');
  const oldNav = createGalleryNavigation(browser, photos, () => {}, 'old-session');
  oldNav.open('first.jpg');
  oldNav.dispose();
  let active;
  const nav = createGalleryNavigation(browser, photos, value => { active = value; }, 'reloaded-session');
  assert.equal(active, 'first.jpg');
  nav.close();
  assert.equal(browser.pendingBacks, 0);
  assert.equal(browser.location.href, 'https://example.com/mechanic/');
});

test('missing or deleted photo IDs leave the gallery usable without opening a wrong photo', () => {
  const browser = browserAt('https://example.com/photography/?photo=deleted');
  let active;
  const nav = createGalleryNavigation(browser, photos, value => { active = value; }, 'session');
  assert.equal(active, null);
  nav.open('unknown.jpg');
  assert.equal(browser.length, 1);
  nav.open('first.jpg');
  assert.equal(active, 'first.jpg');
  nav.dispose();
  const empty = createGalleryNavigation(browser, [], value => { active = value; }, 'empty');
  assert.equal(active, null);
  empty.dispose();
});
