// Opt-in model regression: node --env-file=.env.local scripts/check-homescreen-mbti.mjs
// Use --live instead to check the deployed Worker. Each run sends three synthetic reviews.
import assert from 'node:assert/strict';
import sharp from 'sharp';
import worker from '../workers/homescreen/index.mjs';

const origin = 'https://jyuwaaw.github.io';
const endpoint = 'https://homescreen-review.rentmac.workers.dev/review';
const live = process.argv.includes('--live');
if (!live && !process.env.OPENAI_API_KEY) throw new Error('Set OPENAI_API_KEY to test the local Worker.');

async function screen(appNames = []) {
  const icons = appNames.map((name, i) => {
    const x = 32 + i % 4 * 96, y = 330 + Math.floor(i / 4) * 100;
    return `<g transform="translate(${x} ${y})"><rect width="60" height="60" rx="14" fill="#436893"/>
      <text x="30" y="38" text-anchor="middle">${name[0]}</text><text x="30" y="80" text-anchor="middle">${name}</text></g>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="840" font-family="sans-serif" font-size="16" fill="white">
    <rect width="420" height="840" fill="#243953"/><text x="24" y="34">9:41</text><text x="330" y="34">5G 82%</text>
    <rect x="208" y="91" width="185" height="186" rx="24" fill="#f8f7fb"/><text x="226" y="140" fill="#5c56ad">Sleep</text>
    <path fill="#5c56ad" d="M228 188v-32h14v32zm26 4v-42h14v42zm26-4v-16h14v16zm24 8v-37h14v37z"/>
    ${icons}<rect x="25" y="720" width="370" height="78" rx="24" fill="#465771"/>
    <text x="82" y="765">Phone　　　　 Safari　　　　 Photos</text></svg>`;
  return 'data:image/jpeg;base64,' + (await sharp(Buffer.from(svg)).jpeg().toBuffer()).toString('base64');
}

const [sparse, mixed] = await Promise.all([screen(), screen(['Discord','Maps','Camera','WeChat','Notes','Instagram','Calculator','Files'])]);
const env = { ALLOWED_ORIGINS: origin, OPENAI_MODEL: 'gpt-5.4-mini', OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  REVIEW_LIMIT: { limit: async () => ({ success: true }) } };
const cases = [['one widget', [sparse], false], ['one mixed page', [mixed], true], ['sparse then mixed', [sparse, mixed], true]];
const results = await Promise.allSettled(cases.map(async ([name, images, expectType]) => {
  const req = new Request(endpoint, { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify({ images }) });
  const response = live ? await fetch(req) : await worker.fetch(req, env);
  const data = await response.json();
  assert.equal(response.status, 200, name + ': ' + (data.error || response.status));
  console.log(name + ': ' + data.mbti + (data.reason ? ' · ' + data.reason : ''));
  if (expectType) {
    assert.match(data.mbti, /^[EI][NS][TF][JP]$/, name);
    assert.ok(data.reason?.trim(), name + ': missing explanation');
  } else {
    assert.equal(data.mbti, '线索不足', name);
    assert.deepEqual(data.traits, [], name);
  }
}));
for (const result of results) if (result.status === 'rejected') { console.error(result.reason); process.exitCode = 1; }
