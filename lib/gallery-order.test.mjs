import test from 'node:test';
import assert from 'node:assert/strict';
import { getDaypart, orderPhotographs, photographGroup } from './gallery-order.mjs';

const photos = [
  { id: 'sun', order: 0, style: 'Landscapes', light: 'sunlit', capturedAt: '2024-06-01T12:00:00', date: '2024-06-01' },
  { id: 'night', order: 1, style: 'Street', light: 'night', capturedAt: '2025-01-01T21:00:00', date: '2025-01-01' },
  { id: 'soft', order: 2, style: 'Landscapes', light: 'soft', capturedAt: '2023-01-01T09:00:00', date: '2023-01-01' },
  { id: 'unknown', order: 3, style: 'Street', light: '', capturedAt: '', date: '' },
  { id: 'shadow', order: 4, style: 'Street', light: 'low', capturedAt: '', date: '' },
  { id: 'sunset', order: 5, style: 'Landscapes', light: 'golden', capturedAt: '2024-06-01T19:00:00', date: '2024-06-01' },
];
const ids = (items) => items.map((photo) => photo.id);

test('local-time boundaries cover morning, day, and the overnight interval', () => {
  for (const [hour, expected] of [[0,'night'],[5,'night'],[6,'morning'],[10,'morning'],[11,'day'],[17,'day'],[18,'night'],[23,'night']]) {
    assert.equal(getDaypart(hour), expected);
  }
});
test('ascending and descending use capture time and leave undated photos last', () => {
  assert.deepEqual(ids(orderPhotographs(photos, 'date-asc', 'night')), ['soft','sun','sunset','night','unknown','shadow']);
  assert.deepEqual(ids(orderPhotographs(photos, 'date-desc', 'day')), ['night','sunset','sun','soft','unknown','shadow']);
});
test('light-based ordering changes with visit time, not the original capture hour', () => {
  assert.deepEqual(ids(orderPhotographs(photos,'style','morning')), ['soft','sun','sunset','shadow','night','unknown']);
  assert.deepEqual(ids(orderPhotographs(photos,'style','day')), ['sun','soft','sunset','shadow','night','unknown']);
  assert.deepEqual(ids(orderPhotographs(photos,'style','night')), ['night','shadow','soft','sunset','sun','unknown']);
});
test('every view preserves every photo and does not mutate the source', () => {
  const original = structuredClone(photos);
  for (const mode of ['style','date-asc','date-desc']) for (const part of ['morning','day','night',null]) {
    assert.deepEqual(ids(orderPhotographs(photos,mode,part)).sort(), ids(photos).sort());
  }
  assert.deepEqual(photos, original);
});
test('nonadaptive galleries keep curated style groups and unknowns get a label', () => {
  assert.deepEqual(ids(orderPhotographs(photos,'style')), ['sun','soft','sunset','night','unknown','shadow']);
  assert.equal(photographGroup(photos[0],'style','day'),'In the sun');
  assert.equal(photographGroup(photos[3],'style','night'),'More photographs');
  assert.equal(photographGroup(photos[3],'date-asc','night'),'Undated');
});
test('empty and single-photo collections work in every order', () => {
  assert.deepEqual(orderPhotographs([],'style','morning'), []);
  assert.deepEqual(orderPhotographs([photos[3]],'date-asc'), [photos[3]]);
});
