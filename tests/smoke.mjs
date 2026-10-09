/* Browser smoke test: plays through onboarding, every lesson node, a lost-hearts round and free practice.
   Run: node tests/smoke.mjs [screenshotDir]   (needs the `playwright` package and a Chromium build) */
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node-tools/node_modules/playwright'); }

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shots = process.argv[2];
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 400, height: 820 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
await page.goto('file://' + path.join(root, 'index.html'));

const snap = async name => { if (shots) await page.screenshot({ path: path.join(shots, name + '.png') }); };
const cur = () => page.evaluate(() => { const S = MG._state(); if (!S.sess) return null; const q = S.sess.queue[S.sess.pos]; return { type: q.type, answer: q.answer, spec: q.spec, n: (q.left || q.items || q.options || []).length, screen: S.screen }; });

async function answer(correct) {
  const q = await cur();
  if (q.type === 'select' || q.type === 'compare') await page.click(`[data-ans="${correct ? q.answer : (q.answer + 1) % q.n}"]`);
  else if (q.type === 'tf') await page.click(`[data-ans="${correct ? q.answer : !q.answer}"]`);
  else if (q.type === 'input') {
    const s = q.spec, vals = s.mode === 'num' ? [String(s.str ?? s.n).replace('.', ',')] : s.mode === 'frac' ? [s.num, s.den] : [s.w, s.num, s.den];
    if (!correct) vals[0] = '987654';
    for (let i = 0; i < vals.length; i++) await page.fill(`[data-box="${i}"]`, String(vals[i]));
  } else if (q.type === 'match') {
    if (!correct) { await page.click('[data-ml="0"]'); await page.click('[data-mr="1"]'); }
    for (let i = 0; i < q.n; i++) { await page.click(`[data-ml="${i}"]`); await page.click(`[data-mr="${i}"]`); }
  } else if (q.type === 'order') {
    const seq = correct ? q.answer : [...q.answer].reverse();
    for (const i of seq) await page.click(`[data-seq="${i}"]`);
  }
  await page.click('[data-act="check"]');
  const verdict = await page.evaluate(() => MG._state().sess.checked);
  if (q.type !== 'match' && verdict !== (correct ? 'right' : 'wrong')) throw new Error(`Expected ${correct ? 'right' : 'wrong'} for ${JSON.stringify(q)}`);
  return q.type;
}
const seenTypes = new Set();

/* onboarding */
await snap('01-welcome');
await page.click('[data-go="name"]');
await page.fill('#nameIn', 'Minh Anh');
await page.click('[data-go="goal"]');
await page.click('[data-goal="30"]');
await page.click('[data-act="finish-ob"]');
await snap('02-path');

/* play every node in order, all answers right except one wrong in the first lesson */
const keys = await page.evaluate(() => [...document.querySelectorAll('[data-node]')].map(b => b.dataset.node));
let first = true;
for (const key of keys) {
  await page.evaluate(k => document.querySelector(`[data-node="${k}"]`).scrollIntoView({ block: 'center' }), key);
  await page.click(`[data-node="${key}"]`);
  await page.click(`[data-start="${key}"]`);
  let guard = 0, wrongDone = !first;
  while ((await page.evaluate(() => MG._state().screen)) === 'lesson') {
    if (++guard > 40) throw new Error('lesson did not end: ' + key);
    const t = await answer(wrongDone || (await cur()).type === 'match');
    if (!wrongDone && t !== 'match') wrongDone = true;
    if (!seenTypes.has(t)) { seenTypes.add(t); await snap(`q-${t}`); }
    await page.click('[data-act="next"]');
  }
  if (first) await snap('03-result');
  await page.click('[data-go="main"]');
  first = false;
}
const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('toan5-chuong1.v1')));
if (Object.keys(progress.lessons).length !== 14 || !progress.trophy) throw new Error('progress not saved: ' + JSON.stringify(progress));
await snap('04-path-done');

/* losing all hearts */
await page.evaluate(() => document.querySelector('[data-node="L7"]').scrollIntoView({ block: 'center' }));
await page.click('[data-node="L7"]'); await page.click('[data-start="L7"]');
for (let i = 0; i < 5; i++) { const q = await cur(); if (q.type === 'match') { await answer(true); await page.click('[data-act="next"]'); i--; continue; } await answer(false); await page.click('[data-act="next"]'); }
if ((await page.evaluate(() => MG._state().modal)) !== 'hearts') throw new Error('hearts modal not shown');
await snap('05-hearts');
await page.click('[data-act="quit-confirm"]');

/* free practice */
await page.click('[data-tab="practice"]'); await snap('06-practice');
await page.click('[data-prac="18"]');
for (let i = 0; i < 6; i++) { await answer(true); await page.click('[data-act="next"]'); }
await page.click('[data-act="quit"]'); await page.click('[data-act="quit-confirm"]');
if ((await page.evaluate(() => MG._state().screen)) !== 'result') throw new Error('practice did not finish');
await page.click('[data-go="quests"]'); await snap('07-quests');
await page.click('[data-tab="profile"]'); await snap('08-profile');

await browser.close();
if (errors.length) { console.error('Page errors:\n' + errors.join('\n')); process.exit(1); }
console.log(`OK — played ${keys.length} nodes; question types seen: ${[...seenTypes].join(', ')}`);
