import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readSelection, saveSelection } from '../tools/cover-manager/storage.mjs';

test('only selected gallery photos persist; stale windows cannot overwrite a newer selection', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'cover-selection-'));
  t.after(() => rm(dir, {recursive:true, force:true}));
  const file = join(dir,'covers.json');
  const available = new Set(['sea','snow','window']);
  await writeFile(file,'["sea"]');
  for (const ids of [[], ['unlisted'], ['sea','sea']]) {
    await assert.rejects(saveSelection({previous:['sea'], ids}, available, file), {status:400});
  }
  const updates = await Promise.allSettled([
    saveSelection({previous:['sea'], ids:['window','snow']}, available, file),
    saveSelection({previous:['sea'], ids:['sea','snow']}, available, file),
  ]);
  assert.equal(updates[0].status,'fulfilled');
  assert.equal(updates[1].reason.status,409);
  assert.deepEqual(await readSelection(file),['window','snow']);
  await saveSelection({previous:['window','snow'],ids:['snow']},available,file);
  assert.deepEqual(await readSelection(file),['snow']);
});
