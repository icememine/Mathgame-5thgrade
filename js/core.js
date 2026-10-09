/* Core helpers: randomness, number formatting, Vietnamese number reading, answer checking, SVG visuals.
   Loaded as a classic script so index.html also works when opened straight from disk (file://). */
(function (MG) {
'use strict';

/* ---------- randomness ---------- */
const R = {
  int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  pick: a => a[Math.floor(Math.random() * a.length)],
  shuffle: a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  chance: p => Math.random() < p,
  sample: (a, n) => R.shuffle(a).slice(0, n)
};
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
/* Pairs m < n, coprime, n <= max — the ratios the textbook uses. */
const coprimePair = (max = 9, minM = 1) => { let m, n; do { n = R.int(minM + 1, max); m = R.int(minM, n - 1); } while (gcd(m, n) !== 1); return [m, n]; };

/* ---------- formatting (Vietnamese: decimal comma, space between thousands) ---------- */
const NB = ' ';
const fmtInt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
/* Decimals travel as strings with a dot ("5.329") so trailing zeros survive (0,50 vs 0,5). */
const fmtDec = s => { s = String(s); const [i, f] = s.split('.'); return fmtInt(i) + (f !== undefined ? ',' + f : ''); };
const decStr = (int, frac) => frac ? `${int}.${frac}` : String(int);
const val = s => parseFloat(s);
/* Exact decimal string from an integer count of 10^-dp units: unitsToDec(5329,3) -> "5.329". */
const unitsToDec = (units, dp) => {
  if (dp === 0) return String(units);
  const s = String(units).padStart(dp + 1, '0');
  return s.slice(0, -dp) + '.' + s.slice(-dp);
};
const trimDec = s => s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
/* Round a decimal string half-up to k places, using integer arithmetic (no float surprises at x,5). */
function roundDec(s, k) {
  const [i, f = ''] = String(s).split('.');
  if (f.length <= k) return String(s);
  const units = parseInt(i + f.slice(0, k), 10);
  const up = parseInt(f[k], 10) >= 5 ? 1 : 0;
  return unitsToDec(units + up, k);
}

/* ---------- Vietnamese number reading (rules as used in SGK Toán 5) ---------- */
const DIG = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
function read2(n) {
  const t = Math.floor(n / 10), u = n % 10;
  if (t === 0) return DIG[u];
  if (t === 1) return 'mười' + (u === 0 ? '' : ' ' + (u === 5 ? 'lăm' : DIG[u]));
  return DIG[t] + ' mươi' + (u === 0 ? '' : ' ' + (u === 1 ? 'mốt' : u === 5 ? 'lăm' : DIG[u]));
}
function read3(n, full) {
  const h = Math.floor(n / 100), r = n % 100;
  if (h === 0 && !full) return read2(r);
  const s = DIG[h] + ' trăm';
  if (r === 0) return s;
  return r < 10 ? `${s} linh ${DIG[r]}` : `${s} ${read2(r)}`;
}
function readInt(n) {
  if (n === 0) return 'không';
  const th = Math.floor(n / 1000), r = n % 1000, parts = [];
  if (th > 0) parts.push(read3(th) + ' nghìn');
  if (r > 0) parts.push(read3(r, th > 0));
  return parts.join(' ');
}
/* Digits after the comma: 0,01 "không một", 10,082 "không trăm tám mươi hai", 0,008 "không không tám". */
function readFracDigits(f) {
  if (f.length === 1) return DIG[+f];
  if (f.length === 2) return f[0] === '0' ? 'không ' + DIG[+f[1]] : read2(+f);
  if (f.length === 3) {
    if (f[0] !== '0') return read3(+f);
    if (f[1] === '0') return 'không không ' + DIG[+f[2]];
    return 'không trăm ' + read2(+f.slice(1));
  }
  return f.split('').map(d => DIG[+d]).join(' ');
}
function readDec(s) {
  const [i, f] = String(s).split('.');
  return readInt(+i) + (f ? ' phẩy ' + readFracDigits(f) : '');
}
const denWord = d => ({ 4: 'tư', 10: 'mười', 100: 'trăm', 1000: 'nghìn', 1000000: 'triệu' })[d] || readInt(d);
const readFrac = (n, d) => `${readInt(n)} phần ${denWord(d)}`;
const readMixed = (w, n, d) => `${readInt(w)} và ${readFrac(n, d)}`;
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- inline math HTML ---------- */
const F = (n, d) => `<span class="fr"><span>${typeof n === 'number' ? fmtInt(n) : n}</span><span>${typeof d === 'number' ? fmtInt(d) : d}</span></span>`;
const M = (w, n, d) => `<span class="mx">${fmtInt(w)}${F(n, d)}</span>`;
const D = s => `<span class="num">${fmtDec(s)}</span>`;
const RT = (a, b) => `${fmtInt(a)}${NB}:${NB}${fmtInt(b)}`;

/* ---------- answer parsing & checking ---------- */
function parseNum(raw, expectInt) {
  let s = String(raw ?? '').trim().replace(/[\s  ]/g, '');
  if (!s) return null;
  if (expectInt && /^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  if (/^\d{1,3}(\.\d{3})+,\d+$/.test(s)) s = s.replace(/\./g, '');
  s = s.replace(',', '.');
  if (!/^\d*\.?\d+$/.test(s) && !/^\d+\.?$/.test(s)) return null;
  return parseFloat(s);
}
const parseIntStrict = raw => { const s = String(raw ?? '').trim().replace(/[\s ]/g, ''); return /^\d+$/.test(s) ? parseInt(s, 10) : null; };
const isPow10 = d => /^10+$/.test(String(d));
/* spec: {mode:'num', n, dp?} | {mode:'frac', num, den, check:'exact'|'value'|'decfrac'} | {mode:'mixed', w, num, den, check} */
function checkInput(spec, vals) {
  if (spec.mode === 'num') {
    const v = parseNum(vals[0], Number.isInteger(spec.n));
    return v !== null && Math.abs(v - spec.n) < 1e-9;
  }
  if (spec.mode === 'frac') {
    const n = parseIntStrict(vals[0]), d = parseIntStrict(vals[1]);
    if (n === null || !d) return false;
    if (spec.check === 'exact') return n === spec.num && d === spec.den;
    const same = n * spec.den === spec.num * d;
    return spec.check === 'decfrac' ? same && isPow10(d) : same;
  }
  if (spec.mode === 'mixed') {
    const w = parseIntStrict(vals[0]), n = parseIntStrict(vals[1]), d = parseIntStrict(vals[2]);
    if (w === null || n === null || !d || n >= d || n === 0) return false;
    if (spec.check === 'exact') return w === spec.w && n === spec.num && d === spec.den;
    return w === spec.w && n * spec.den === spec.num * d;
  }
  return false;
}
function answerHTML(spec) {
  if (spec.mode === 'num') return fmtDec(spec.str ?? String(spec.n)) + (spec.unit ? NB + spec.unit : '');
  if (spec.mode === 'frac') return F(spec.num, spec.den);
  return M(spec.w, spec.num, spec.den);
}

/* ---------- SVG visuals (colors come from CSS variables so they follow the theme) ---------- */
const svg = (w, h, body, label) => `<svg class="viz" viewBox="0 0 ${w} ${h}" width="${w}" role="img" aria-label="${label || ''}">${body}</svg>`;

/* A strip of `total` cells with `k` shaded. */
function vStrip(k, total = 10, color = 'var(--gold)') {
  const cw = 26, h = 34; let b = '';
  for (let i = 0; i < total; i++) b += `<rect x="${1 + i * cw}" y="1" width="${cw}" height="${h}" fill="${i < k ? color : 'var(--surface)'}" stroke="var(--ink)" stroke-width="1.2"/>`;
  return svg(total * cw + 2, h + 2, b, `${k} trên ${total} ô được tô màu`);
}
/* 10×10 grid, shaded column by column as in the textbook. */
function vGrid(k, color = 'var(--coral)') {
  const c = 15; let b = '';
  for (let i = 0; i < 100; i++) {
    const col = Math.floor(i / 10), row = i % 10;
    b += `<rect x="${1 + col * c}" y="${1 + row * c}" width="${c}" height="${c}" fill="${i < k ? color : 'var(--surface)'}" stroke="var(--line-strong)" stroke-width=".8"/>`;
  }
  b += `<rect x="1" y="1" width="${c * 10}" height="${c * 10}" fill="none" stroke="var(--ink)" stroke-width="1.4"/>`;
  return svg(c * 10 + 2, c * 10 + 2, b, `${k} trên 100 ô được tô màu`);
}
/* `whole` full circles plus one circle cut into d sectors with k shaded. */
function vPies(whole, k, d, color = 'var(--sky)') {
  const r = 30, gap = 12, n = whole + (k > 0 ? 1 : 0);
  let b = '';
  const cx = i => r + 2 + i * (2 * r + gap), cy = r + 2;
  for (let i = 0; i < whole; i++) b += `<circle cx="${cx(i)}" cy="${cy}" r="${r}" fill="${color}" stroke="var(--ink)" stroke-width="1.5"/>`;
  if (k > 0) {
    const x = cx(whole);
    for (let s = 0; s < d; s++) {
      const a0 = -Math.PI / 2 + s * 2 * Math.PI / d, a1 = a0 + 2 * Math.PI / d;
      const p = (a) => `${(x + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
      b += `<path d="M${x} ${cy} L${p(a0)} A${r} ${r} 0 0 1 ${p(a1)} Z" fill="${s < k ? color : 'var(--surface)'}" stroke="var(--ink)" stroke-width="1.2"/>`;
    }
  }
  return svg(n * (2 * r + gap) - gap + 4, 2 * r + 4, b, 'Các hình tròn được tô màu');
}
/* Rows of colored buttons, e.g. [{n:4,color:'var(--sky)'},{n:5,color:'var(--coral)'}]. */
function vDots(groups) {
  const r = 14, step = 34; let x = r + 2, b = '';
  groups.forEach((g, gi) => {
    for (let i = 0; i < g.n; i++) {
      b += `<circle cx="${x}" cy="${r + 2}" r="${r}" fill="${g.color}"/><g fill="#fff" opacity=".85"><circle cx="${x - 4}" cy="${r - 2}" r="2.2"/><circle cx="${x + 4}" cy="${r - 2}" r="2.2"/><circle cx="${x - 4}" cy="${r + 6}" r="2.2"/><circle cx="${x + 4}" cy="${r + 6}" r="2.2"/></g>`;
      x += step;
    }
    if (gi < groups.length - 1) x += 14;
  });
  return svg(x - step + r + 4, 2 * r + 4, b, 'Các chiếc cúc');
}
/* Segment diagram for "tổng – tỉ" / "hiệu – tỉ": small = m units, big = n units. */
function vSeg(m, n, mode, label, names = ['Số bé', 'Số lớn']) {
  const unit = Math.min(30, Math.floor(200 / n)), x0 = 70, h = 64, y1 = 16, y2 = 46;
  let b = `<text x="0" y="${y1 + 4}" class="t">${names[0]}:</text><text x="0" y="${y2 + 4}" class="t">${names[1]}:</text>`;
  const seg = (y, k) => {
    let s = `<line x1="${x0}" y1="${y}" x2="${x0 + k * unit}" y2="${y}" stroke="var(--ink)" stroke-width="2"/>`;
    for (let i = 0; i <= k; i++) s += `<line x1="${x0 + i * unit}" y1="${y - 6}" x2="${x0 + i * unit}" y2="${y + 6}" stroke="var(--ink)" stroke-width="2"/>`;
    return s;
  };
  b += seg(y1, m) + seg(y2, n);
  let w = x0 + n * unit + 12;
  if (mode === 'sum') {
    const bx = x0 + n * unit + 10;
    b += `<path d="M${bx} ${y1 - 6} q8 0 8 8 v${(y2 - y1) / 2 - 4} l6 4 l-6 4 v${(y2 - y1) / 2 - 4} q0 8 -8 8" fill="none" stroke="var(--sky)" stroke-width="2"/><text x="${bx + 18}" y="${(y1 + y2) / 2 + 5}" class="t b">${label}</text>`;
    w = bx + 18 + label.length * 8 + 6;
  } else if (mode === 'diff') {
    const a = x0 + m * unit, c = x0 + n * unit;
    b += `<line x1="${a}" y1="${y1 + 2}" x2="${a}" y2="${y2 - 8}" stroke="var(--muted)" stroke-dasharray="3 3"/><path d="M${a} ${y2 + 10} q0 6 6 6 H${(a + c) / 2 - 6} l6 5 l6 -5 H${c - 6} q6 0 6 -6" fill="none" stroke="var(--coral)" stroke-width="2"/><text x="${(a + c) / 2}" y="${y2 + 34}" text-anchor="middle" class="t b">${label}</text>`;
    w = Math.max(w, (a + c) / 2 + label.length * 5);
  }
  return svg(Math.ceil(w), mode === 'diff' ? h + 24 : h, b, 'Sơ đồ đoạn thẳng');
}
/* Number line from a to b (decimal strings) with `ticks` sub-divisions; labels and marked points. */
function vLine({ from, to, ticks, labels = [], points = [], width = 320 }) {
  const a = val(from), z = val(to), x0 = 14, x1 = width - 14, X = v => x0 + (v - a) / (z - a) * (x1 - x0), y = 34;
  let b = `<line x1="${x0 - 6}" y1="${y}" x2="${x1 + 8}" y2="${y}" stroke="var(--ink)" stroke-width="2"/><path d="M${x1 + 8} ${y - 5} l8 5 l-8 5z" fill="var(--ink)"/>`;
  for (let i = 0; i <= ticks; i++) {
    const v = a + (z - a) * i / ticks, big = labels.some(l => Math.abs(val(l) - v) < 1e-9);
    b += `<line x1="${X(v)}" y1="${y - (big ? 8 : 5)}" x2="${X(v)}" y2="${y + (big ? 8 : 5)}" stroke="var(--ink)" stroke-width="${big ? 2 : 1.2}"/>`;
  }
  labels.forEach(l => { b += `<text x="${X(val(l))}" y="${y + 26}" text-anchor="middle" class="t">${fmtDec(l)}</text>`; });
  points.forEach(p => { b += `<circle cx="${X(val(p.v))}" cy="${y}" r="5" fill="var(--coral)"/><text x="${X(val(p.v))}" y="${y - 14}" text-anchor="middle" class="t b" fill="var(--coral)">${p.label}</text>`; });
  return svg(width + 4, 66, b, 'Tia số');
}
/* A ruler in cm with an object of length `mm` millimetres lying on it. */
function vRuler(mm, maxCm, color = 'var(--jade)') {
  const s = 3.2, x0 = 10, w = maxCm * 10 * s + 2 * x0, y = 34;
  let b = `<rect x="${x0}" y="12" width="${mm * s}" height="16" rx="5" fill="${color}"/>`;
  b += `<rect x="2" y="${y}" width="${w - 4}" height="34" rx="4" fill="var(--sky-soft)" stroke="var(--line-strong)"/>`;
  for (let i = 0; i <= maxCm * 10; i++) {
    const x = x0 + i * s, len = i % 10 === 0 ? 12 : i % 5 === 0 ? 9 : 5;
    b += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + len}" stroke="var(--ink)" stroke-width="${i % 10 === 0 ? 1.4 : .8}"/>`;
    if (i % 10 === 0) b += `<text x="${x}" y="${y + 28}" text-anchor="middle" class="t s">${i === 0 ? '0 cm' : i / 10}</text>`;
  }
  return svg(Math.ceil(w), y + 36, b, 'Thước đo độ dài');
}
/* A simple table: rows of cells (HTML), first column as header. */
function vTable(rows) {
  return `<table class="tbl">${rows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
}

Object.assign(MG, {
  R, gcd, coprimePair, NB, fmtInt, fmtDec, decStr, val, unitsToDec, trimDec, roundDec,
  readInt, readDec, readFrac, readMixed, readFracDigits, denWord, cap,
  F, M, D, RT, parseNum, checkInput, answerHTML, isPow10,
  vStrip, vGrid, vPies, vDots, vSeg, vLine, vRuler, vTable
});
})(typeof window !== 'undefined' ? (window.MG = window.MG || {}) : (globalThis.MG = globalThis.MG || {}));
