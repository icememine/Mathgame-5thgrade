/* Run: node tests/generators.test.js
   Fuzzes every question generator and checks the Vietnamese reading / rounding helpers against SGK examples. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = vm.createContext({ console });
for (const f of ['js/core.js', 'js/lessons.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
const MG = ctx.MG;

let failures = 0;
const check = (name, fn) => { try { fn(); } catch (e) { failures++; console.error(`✗ ${name}\n  ${e.message}`); } };

/* ---------- helpers vs. textbook examples ---------- */
check('readDec', () => {
  const cases = {
    '0.1': 'không phẩy một', '0.01': 'không phẩy không một', '0.23': 'không phẩy hai mươi ba', '0.001': 'không phẩy không không một',
    '0.249': 'không phẩy hai trăm bốn mươi chín', '10.082': 'mười phẩy không trăm tám mươi hai', '0.109': 'không phẩy một trăm linh chín',
    '0.008': 'không phẩy không không tám', '2.47': 'hai phẩy bốn mươi bảy', '1.3': 'một phẩy ba', '5.126': 'năm phẩy một trăm hai mươi sáu',
    '256.73': 'hai trăm năm mươi sáu phẩy bảy mươi ba', '15.6': 'mười lăm phẩy sáu', '3.008': 'ba phẩy không không tám', '0.31': 'không phẩy ba mươi mốt',
    '25.25': 'hai mươi lăm phẩy hai mươi lăm'
  };
  for (const [k, v] of Object.entries(cases)) assert.strictEqual(MG.readDec(k), v, k);
});
check('readInt', () => {
  assert.strictEqual(MG.readInt(1005), 'một nghìn không trăm linh năm');
  assert.strictEqual(MG.readInt(7004), 'bảy nghìn không trăm linh bốn');
  assert.strictEqual(MG.readInt(21), 'hai mươi mốt');
  assert.strictEqual(MG.readInt(11), 'mười một');
  assert.strictEqual(MG.readInt(105), 'một trăm linh năm');
});
check('readFrac/readMixed', () => {
  assert.strictEqual(MG.readMixed(2, 3, 4), 'hai và ba phần tư');
  assert.strictEqual(MG.readMixed(4, 6, 7), 'bốn và sáu phần bảy');
  assert.strictEqual(MG.readFrac(72, 100), 'bảy mươi hai phần trăm');
  assert.strictEqual(MG.readFrac(300, 1000), 'ba trăm phần nghìn');
  assert.strictEqual(MG.readFrac(9, 1000000), 'chín phần triệu');
  assert.strictEqual(MG.readFrac(5, 10), 'năm phần mười');
});
check('roundDec', () => {
  const cases = [['6.2', 0, '6'], ['6.7', 0, '7'], ['6.5', 0, '7'], ['3.63', 1, '3.6'], ['3.68', 1, '3.7'], ['3.65', 1, '3.7'],
    ['3.172', 2, '3.17'], ['3.176', 2, '3.18'], ['3.175', 2, '3.18'], ['9.96', 1, '10.0'], ['36.738', 0, '37'], ['265.865', 2, '265.87'], ['2.4', 1, '2.4']];
  for (const [s, k, r] of cases) assert.strictEqual(MG.roundDec(s, k), r, `${s} → ${k}`);
});
check('parseNum', () => {
  assert.strictEqual(MG.parseNum('0,5'), 0.5);
  assert.strictEqual(MG.parseNum('0.5'), 0.5);
  assert.strictEqual(MG.parseNum('350 000', true), 350000);
  assert.strictEqual(MG.parseNum('350.000', true), 350000);
  assert.strictEqual(MG.parseNum('1.500,25'), 1500.25);
  assert.strictEqual(MG.parseNum('abc'), null);
  assert.strictEqual(MG.parseNum(''), null);
  assert.strictEqual(MG.parseNum('1,2,3'), null);
});
check('checkInput', () => {
  assert.ok(MG.checkInput({ mode: 'frac', num: 3, den: 4, check: 'value' }, ['6', '8']));
  assert.ok(!MG.checkInput({ mode: 'frac', num: 3, den: 4, check: 'exact' }, ['6', '8']));
  assert.ok(MG.checkInput({ mode: 'frac', num: 75, den: 100, check: 'decfrac' }, ['750', '1000']));
  assert.ok(!MG.checkInput({ mode: 'frac', num: 75, den: 100, check: 'decfrac' }, ['3', '4']));
  assert.ok(!MG.checkInput({ mode: 'frac', num: 3, den: 4, check: 'value' }, ['4', '3']));
  assert.ok(MG.checkInput({ mode: 'mixed', w: 2, num: 3, den: 4, check: 'exact' }, ['2', '3', '4']));
  assert.ok(!MG.checkInput({ mode: 'mixed', w: 2, num: 3, den: 4, check: 'exact' }, ['2', '6', '8']));
  assert.ok(MG.checkInput({ mode: 'num', n: 0.25 }, ['0,25']));
  assert.ok(MG.checkInput({ mode: 'num', n: 0.25 }, ['0,250']));
  assert.ok(!MG.checkInput({ mode: 'num', n: 0.25 }, ['0,025']));
});

/* ---------- fuzz every generator ---------- */
const RUNS = 400;
const bad = s => /undefined|NaN|null|\[object|Infinity/.test(s);
function validate(q, label) {
  const all = JSON.stringify(q);
  assert.ok(!bad(all), `${label}: bad token in ${all.slice(0, 300)}`);
  assert.ok(q.explain && q.prompt, `${label}: missing prompt/explain`);
  switch (q.type) {
    case 'select': case 'compare':
      assert.ok(q.options.length >= 2, `${label}: <2 options`);
      assert.strictEqual(new Set(q.options).size, q.options.length, `${label}: duplicate options ${q.options}`);
      assert.ok(q.answer >= 0 && q.answer < q.options.length, `${label}: answer index`);
      break;
    case 'tf': assert.strictEqual(typeof q.answer, 'boolean'); break;
    case 'input': {
      const s = q.spec;
      const vals = s.mode === 'num' ? [MG.fmtDec(s.str ?? String(s.n))] : s.mode === 'frac' ? [String(s.num), String(s.den)] : [String(s.w), String(s.num), String(s.den)];
      assert.ok(MG.checkInput(s, vals), `${label}: own answer rejected ${JSON.stringify(s)} via ${vals}`);
      if (s.mode === 'num') { assert.ok(Number.isFinite(s.n) && s.n >= 0, `${label}: n=${s.n}`); if (s.str) assert.ok(Math.abs(parseFloat(s.str) - s.n) < 1e-9, `${label}: str ${s.str} vs n ${s.n}`); }
      if (s.mode === 'frac') assert.ok(s.den > 0 && Number.isInteger(s.num) && Number.isInteger(s.den), `${label}: frac`);
      if (s.mode === 'frac' && s.check === 'decfrac') assert.ok(MG.isPow10(s.den), `${label}: decfrac den ${s.den}`);
      if (s.mode === 'mixed') assert.ok(s.num < s.den && s.num > 0, `${label}: mixed proper`);
      break;
    }
    case 'match':
      assert.strictEqual(q.left.length, q.right.length);
      assert.strictEqual(new Set(q.left).size, q.left.length, `${label}: dup left`);
      assert.strictEqual(new Set(q.right).size, q.right.length, `${label}: dup right`);
      break;
    case 'order':
      assert.strictEqual(JSON.stringify([...q.answer].sort()), JSON.stringify(q.items.map((_, i) => i)), `${label}: order perm`);
      assert.strictEqual(new Set(q.items).size, q.items.length, `${label}: dup items`);
      break;
    default: throw new Error(`${label}: unknown type ${q.type}`);
  }
}
for (const L of MG.LESSONS) {
  L.gens.forEach((g, gi) => {
    check(`Bài ${L.id} gen ${gi}`, () => { for (let i = 0; i < RUNS; i++) validate(g(), `Bài ${L.id} gen ${gi} run ${i}`); });
  });
}
/* Semantic spot checks on the trickier generators. */
check('Bài 18 compare signs', () => {
  for (let i = 0; i < RUNS; i++) {
    const q = MG._gens.L18[0](); const d = parseFloat(q.a) - parseFloat(q.b);
    assert.strictEqual(q.options[q.answer], Math.abs(d) < 1e-12 ? '=' : d > 0 ? '>' : '<');
  }
});
check('Bài 18 order', () => {
  for (let i = 0; i < RUNS; i++) {
    const q = MG._gens.L18[3](); const vals = q.answer.map(j => parseFloat(q.items[j].replace(/ /g, '').replace(',', '.')));
    for (let k = 1; k < vals.length; k++) assert.ok(q.prompt.includes('bé đến lớn') ? vals[k] > vals[k - 1] : vals[k] < vals[k - 1], `order ${q.items} ${q.answer}`);
  }
});
check('buildRound', () => {
  const qs = MG.buildRound([6, 7, 8], 10); assert.strictEqual(qs.length, 10); qs.forEach(q => assert.ok(q.src && q.lesson));
});

const total = MG.LESSONS.reduce((s, L) => s + L.gens.length, 0);
if (failures) { console.error(`\n${failures} check(s) failed.`); process.exit(1); }
console.log(`OK — ${total} generators × ${RUNS} runs, helpers verified.`);
