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
  for (const read of [() => null, () => '{bad', () => 'null', () => { throw new Error('Blocked'); }, () => JSON.stringify({ theme: 'sepia' })]) {
    assert.deepEqual(boot(read), { theme: 'system' });
  }
});
test('first paint restores each explicit theme without turning System into a fixed theme', () => {
  for (const theme of ['system', 'light', 'dark']) {
    assert.deepEqual(boot(() => JSON.stringify({ theme })), { theme });
  }
});
test('a stored trial font or weight from the old type studio is ignored', () => {
  assert.deepEqual(boot(() => JSON.stringify({ theme: 'dark', font: 'jost', weight: 300 })), { theme: 'dark' });
  assert.deepEqual(normalizeAppearance({ theme: 'light', font: 'not-a-font' }), { theme: 'light' });
});
test('migrates the prior theme from the v1 key', () => {
  assert.deepEqual(boot(key => key === 'benji-appearance-v1' ? JSON.stringify({ theme: 'light', font: 'jost' }) : null), { theme: 'light' });
});
