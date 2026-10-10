import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { appearanceScript, normalizeAppearance } from './appearance.mjs';

function boot(read) {
  const dataset = {};
  vm.runInNewContext(appearanceScript, {
    document: { documentElement: { dataset } },
    localStorage: { getItem: read },
  });
  return dataset;
}
test('first paint safely follows the system when preferences are missing, invalid, or storage is blocked', () => {
  for (const read of [() => null, () => '{bad', () => 'null', () => { throw new Error('Blocked'); }, () => JSON.stringify({theme:'sepia',font:'unknown',weight:900})]) {
    assert.deepEqual(boot(read), { theme: 'system', font: 'plex', weight: '400' });
  }
});
test('first paint restores each explicit theme and font without turning System into a fixed theme', () => {
  for (const theme of ['system','light','dark']) for (const font of ['geist','jost','manrope','barlow','plex']) {
    assert.deepEqual(boot(() => JSON.stringify({ theme, font, weight:300 })), {theme,font,weight:'300'});
  }
});
test('invalid fields fall back independently while valid choices survive', () => {
  assert.deepEqual(normalizeAppearance({theme:'dark',font:'not-a-font',weight:300}), {theme:'dark',font:'plex',weight:300});
  assert.deepEqual(normalizeAppearance({theme:'light',font:'plex',weight:'300'}), {theme:'light',font:'plex',weight:400});
});

test('migrates the prior theme while retiring the old trial font', () => {
  assert.deepEqual(boot(key => key === 'benji-appearance-v1' ? JSON.stringify({theme:'light',font:'jost',weight:300}) : null), {theme:'light',font:'plex',weight:'400'});
});
