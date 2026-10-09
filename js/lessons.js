/* Curriculum: SGK Toán 5 (Cánh Diều), tập một, Chương I, bài 6–19.
   Each lesson has a list of generators; every call returns a fresh question with new numbers. */
(function (MG) {
'use strict';
const { R, gcd, coprimePair, fmtInt, fmtDec, decStr, val, unitsToDec, trimDec, roundDec,
  readInt, readDec, readFrac, readMixed, cap, F, M, D, RT, NB,
  vStrip, vGrid, vPies, vDots, vSeg, vLine, vRuler, vTable } = MG;

/* ---------- question builders ---------- */
function sel({ kind = 'Chọn đáp án đúng', prompt, ctx, correct, wrong, explain }) {
  const seen = new Set([correct]), opts = [correct];
  for (const w of wrong) { if (opts.length >= 4) break; if (!seen.has(w)) { seen.add(w); opts.push(w); } }
  const order = R.shuffle(opts.map((_, i) => i));
  return { type: 'select', kind, prompt, ctx, options: order.map(i => opts[i]), answer: order.indexOf(0), explain };
}
const tf = ({ prompt, answer, explain, ctx }) => ({ type: 'tf', kind: 'Đúng hay sai?', prompt, ctx, answer, explain });
function cmp({ a, b, explain, prompt = 'Chọn dấu thích hợp', ctx }) {
  const d = val(a) - val(b), sign = Math.abs(d) < 1e-12 ? '=' : d > 0 ? '>' : '<';
  return { type: 'compare', kind: 'So sánh', prompt, ctx, a, b, options: ['>', '<', '='], answer: ['>', '<', '='].indexOf(sign), explain: explain(sign) };
}
const inp = ({ kind = 'Điền số', prompt, ctx, spec, explain }) => ({ type: 'input', kind, prompt, ctx, spec, explain });
const match = ({ prompt = 'Nối cặp phù hợp', pairs, explain }) => ({ type: 'match', kind: 'Nối cặp', prompt, left: pairs.map(p => p[0]), right: pairs.map(p => p[1]), explain });
function order({ prompt, items, dir, explain, ctx }) {
  const sorted = items.map((v, i) => i).sort((i, j) => dir === 'asc' ? val(items[i]) - val(items[j]) : val(items[j]) - val(items[i]));
  return { type: 'order', kind: 'Sắp xếp', prompt, ctx, items: items.map(fmtDec), answer: sorted, explain };
}
const num = (n, unit, str) => ({ mode: 'num', n, unit, str });
const frac = (n, d, check = 'value') => ({ mode: 'frac', num: n, den: d, check });
const mixed = (w, n, d, check = 'exact') => ({ mode: 'mixed', w, num: n, den: d, check });

/* ---------- shared numeric helpers ---------- */
const distinctPair = (a, b) => { let x, y; do { x = R.int(a, b); y = R.int(a, b); } while (x === y); return [x, y]; };
/* A random decimal string with `ip` integer range and exactly `dp` decimal digits (last one non-zero). */
function randDec(lo, hi, dp) {
  const i = R.int(lo, hi); if (!dp) return String(i);
  let f = ''; for (let k = 0; k < dp - 1; k++) f += R.int(0, 9); f += R.int(1, 9);
  return `${i}.${f}`;
}
const lt = x => String(x).replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* Hiệu–tỉ problems are dull when n − m = 1 (one part = the difference), so make that rare. */
const gapPair = (max, minM = 1) => { let p; do { p = coprimePair(max, minM); } while (p[1] - p[0] === 1 && R.chance(.8)); return p; };
const uniqBy = (arr, key) => { const s = new Set(); return arr.filter(x => { const k = key(x); if (s.has(k)) return false; s.add(k); return true; }); };

/* =====================================================================
   Bài 6 · Giới thiệu về tỉ số
   ===================================================================== */
const L6 = [
  () => { const [a, b] = distinctPair(1, 20);
    return inp({ kind: 'Viết tỉ số', prompt: `Viết tỉ số của ${a} và ${b}.`, spec: frac(a, b),
      explain: `Tỉ số của ${a} và ${b} là ${RT(a, b)} hay ${F(a, b)}. Viết đúng thứ tự: số thứ nhất ở trên, số thứ hai ở dưới.` }); },
  () => { const [a, b] = distinctPair(1, 19); const shown = R.chance(.5) ? F(a, b) : RT(a, b);
    return sel({ prompt: `Tỉ số ${shown} được đọc là:`, correct: `Tỉ số của ${a} và ${b}`,
      wrong: [`Tỉ số của ${b} và ${a}`, `Tỉ số của ${a} và ${a + b}`, `Hiệu của ${a} và ${b}`],
      explain: `${shown} đọc là “tỉ số của ${a} và ${b}”.` }); },
  () => { const x = R.int(2, 6), y = R.int(2, 6), k = R.int(0, 2);
    const ask = [['số cúc màu xanh và số cúc màu đỏ', x, y], ['số cúc màu đỏ và số cúc màu xanh', y, x], ['số cúc màu xanh và tổng số chiếc cúc', x, x + y]][k];
    return inp({ kind: 'Viết tỉ số', prompt: `Viết tỉ số của ${ask[0]}.`,
      ctx: `<p>Có ${x} chiếc cúc màu xanh, ${y} chiếc cúc màu đỏ:</p>${vDots([{ n: x, color: 'var(--sky)' }, { n: y, color: 'var(--coral)' }])}`,
      spec: frac(ask[1], ask[2]), explain: `Tỉ số của ${ask[0]} là ${RT(ask[1], ask[2])} hay ${F(ask[1], ask[2])}.` }); },
  () => { const [a, b] = distinctPair(2, 15);
    return sel({ prompt: `Cách viết nào biểu diễn đúng tỉ số của ${a} và ${b}?`, correct: R.chance(.5) ? RT(a, b) : F(a, b),
      wrong: [RT(b, a), F(b, a), `${Math.max(a, b)} − ${Math.min(a, b)}`],
      explain: `Tỉ số của hai số a và b phải được viết theo đúng thứ tự là a : b hay ${F('a', 'b')}.` }); },
  () => { const [a, b] = distinctPair(2, 12), k = R.int(0, 2);
    const s = [[`Tỉ số của ${a} và ${b} viết là ${RT(b, a)}.`, false], [`Tỉ số của ${a} và ${b} viết là ${F(a, b)}.`, true], [`${RT(a, b)} và ${F(a, b)} là hai cách viết của cùng một tỉ số.`, true]][k];
    return tf({ prompt: s[0], answer: s[1], explain: `Tỉ số của ${a} và ${b} là ${RT(a, b)} hay ${F(a, b)} (đúng thứ tự: ${a} trước, ${b} sau).` }); },
  () => { const T = R.pick([
      { a: 'Châu', b: 'Nguyên', what: 'Số tiền tiết kiệm', both: 'cả hai bạn' }, { a: 'Khôi', b: 'Minh', what: 'Số vở', both: 'cả hai bạn' }, { a: 'đội A', b: 'đội B', what: 'Số bàn thắng', both: 'cả hai đội' }]);
    const k = R.int(2, 5), ask = R.int(0, 2);
    const qs = [[`của ${T.b} và của ${T.a}`, 1, k], [`của ${T.a} và của ${T.b}`, k, 1], [`của ${T.b} và tổng ${T.what.toLowerCase()} của ${T.both}`, 1, k + 1]][ask];
    return inp({ kind: 'Quan sát sơ đồ', prompt: `Viết tỉ số giữa ${T.what.toLowerCase()} ${qs[0]}.`,
      ctx: `<p>${T.what} của ${T.a} gấp ${k} lần ${T.what.toLowerCase()} của ${T.b}.</p>${vSeg(1, k, 'none', '', [cap(T.b), cap(T.a)])}`,
      spec: frac(qs[1], qs[2]), explain: `${cap(T.b)} ứng với 1 phần, ${T.a} ứng với ${k} phần như thế${ask === 2 ? `, cả hai ứng với 1 + ${k} = ${k + 1} phần` : ''}. Tỉ số cần tìm là ${RT(qs[1], qs[2])} hay ${F(qs[1], qs[2])}.` }); },
  () => { let a, b, c, d; do { [a, b] = distinctPair(2, 15); [c, d] = distinctPair(2, 15); } while (new Set([a, b, c, d]).size < 4);
    return match({ prompt: 'Nối mỗi tỉ số với cách viết đúng', pairs: R.shuffle([[`Tỉ số của ${a} và ${b}`, RT(a, b)], [`Tỉ số của ${b} và ${a}`, RT(b, a)], [`Tỉ số của ${c} và ${d}`, RT(c, d)], [`Tỉ số của ${d} và ${c}`, RT(d, c)]]),
      explain: 'Chú ý thứ tự: tỉ số của a và b viết là a : b, khác với tỉ số của b và a.' }); }
];

/* =====================================================================
   Bài 7 · Tìm hai số khi biết tổng và tỉ số
   Bài 8 · Tìm hai số khi biết hiệu và tỉ số
   small = m phần, big = n phần, u = giá trị một phần
   ===================================================================== */
function sumTemplate() {
  const t = R.int(0, 5);
  if (t === 0) { const rev = R.chance(.4), [m, n] = coprimePair(7, rev ? 2 : 1), u = R.int(2, 60), S = u * (m + n);
    return { m, n, u, unit: '', names: ['Số bé', 'Số lớn'], text: `Tổng của hai số là ${fmtInt(S)}. Tỉ số của hai số là ${rev ? F(n, m) : F(m, n)}.`, ask: ['Tìm số bé.', 'Tìm số lớn.'] }; }
  if (t === 1) { const [m, n] = coprimePair(5), u = R.int(2, 12);
    return { m, n, u, unit: 'l', names: ['Sơn xanh', 'Sơn trắng'], text: `Anh Toàn dùng ${fmtInt(u * (m + n))} l sơn xanh và sơn trắng để sơn căn phòng. Số lít sơn xanh bằng ${F(m, n)} số lít sơn trắng.`, ask: ['Tính số lít sơn xanh.', 'Tính số lít sơn trắng.'] }; }
  if (t === 2) { const [m, n] = coprimePair(8, 2), u = R.int(10, 60);
    return { m, n, u, unit: 'tấn', names: ['Gạo nếp', 'Gạo tẻ'], text: `Một kho chứa ${fmtInt(u * (m + n))} tấn gạo gồm gạo nếp và gạo tẻ. Số tấn gạo tẻ bằng ${F(n, m)} số tấn gạo nếp.`, ask: ['Tính số tấn gạo nếp.', 'Tính số tấn gạo tẻ.'] }; }
  if (t === 3) { const n = R.int(2, 5), u = R.int(5, 20) * 10000;
    return { m: 1, n, u, unit: 'đồng', names: ['Phúc', 'Chị Linh'], text: `Phúc và chị Linh tiết kiệm được ${fmtInt(u * (n + 1))} đồng. Số tiền tiết kiệm của chị Linh gấp ${n} lần số tiền tiết kiệm của Phúc.`, ask: ['Tính số tiền tiết kiệm của Phúc.', 'Tính số tiền tiết kiệm của chị Linh.'] }; }
  if (t === 4) { const n = R.int(2, 5), u = R.int(20, 200);
    return { m: 1, n, u, unit: 'm²', names: ['Nhà ở', 'Vườn cây'], text: `Tổng diện tích của một khu đất là ${fmtInt(u * (n + 1))} m² gồm nhà ở và vườn cây. Diện tích vườn cây gấp ${n} lần diện tích nhà ở.`, ask: ['Tính diện tích nhà ở.', 'Tính diện tích vườn cây.'] }; }
  const [m, n] = coprimePair(5), u = R.int(2, 8);
  return { m, n, u, unit: 'quả', names: ['Bóng xanh', 'Bóng đỏ'], text: `Có tất cả ${u * (m + n)} quả bóng màu xanh và màu đỏ. Tỉ số giữa số quả bóng xanh và số quả bóng đỏ là ${F(m, n)}.`, ask: ['Có bao nhiêu quả bóng xanh?', 'Có bao nhiêu quả bóng đỏ?'] };
}
function diffTemplate() {
  const t = R.int(0, 4);
  if (t === 0) { const rev = R.chance(.6), [m, n] = gapPair(8, rev ? 2 : 1), u = R.int(2, 40);
    return { m, n, u, unit: '', names: ['Số bé', 'Số lớn'], text: `Hiệu của hai số là ${fmtInt(u * (n - m))}. Tỉ số của hai số là ${rev ? F(n, m) : F(m, n)}.`, ask: ['Tìm số bé.', 'Tìm số lớn.'] }; }
  if (t === 1) { const [m, n] = gapPair(8, 2), u = R.int(3, 15);
    return { m, n, u, unit: 'chiếc', names: ['Hộp nhỏ', 'Hộp to'], text: `Hộp to có nhiều hơn hộp nhỏ ${u * (n - m)} chiếc bút màu. Tỉ số giữa số bút màu của hộp to và số bút màu của hộp nhỏ là ${F(n, m)}.`, ask: ['Hộp nhỏ có bao nhiêu chiếc bút màu?', 'Hộp to có bao nhiêu chiếc bút màu?'] }; }
  if (t === 2) { const [m, n] = gapPair(8), u = R.int(2, 12);
    return { m, n, u, unit: 'm', names: ['Dây xanh', 'Dây đỏ'], text: `Cuộn dây màu đỏ dài hơn cuộn dây màu xanh ${u * (n - m)} m. Biết rằng cuộn dây màu xanh dài bằng ${F(m, n)} cuộn dây màu đỏ.`, ask: ['Tính độ dài cuộn dây màu xanh.', 'Tính độ dài cuộn dây màu đỏ.'] }; }
  if (t === 3) { const [m, n] = gapPair(8, 2), u = R.int(3, 16);
    return { m, n, u, unit: 'cây', names: ['Cây cam', 'Cây xoài'], text: `Số cây cam trong vườn ít hơn số cây xoài là ${u * (n - m)} cây. Tỉ số của số cây xoài và số cây cam là ${F(n, m)}.`, ask: ['Trong vườn có bao nhiêu cây cam?', 'Trong vườn có bao nhiêu cây xoài?'] }; }
  const n = R.chance(.8) ? R.int(3, 5) : 2, u = R.int(8, 40);
  return { m: 1, n, u, unit: 'chiếc', names: ['Trực tiếp', 'Trực tuyến'], text: `Trong một quý, số ti vi bán trực tiếp tại cửa hàng ít hơn số ti vi bán trực tuyến là ${u * (n - 1)} chiếc. Số ti vi bán trực tuyến gấp ${n} lần số ti vi bán trực tiếp.`, ask: ['Tính số ti vi bán trực tiếp.', 'Tính số ti vi bán trực tuyến.'] };
}
const unitTxt = u => u ? NB + u : '';
function sumExplain(T, which) {
  const S = T.u * (T.m + T.n), ans = T.u * (which ? T.n : T.m);
  return `Tổng số phần bằng nhau: ${T.m} + ${T.n} = ${T.m + T.n} (phần).<br>Giá trị một phần: ${fmtInt(S)} : ${T.m + T.n} = ${fmtInt(T.u)}.<br>${T.names[which]}: ${fmtInt(T.u)} × ${which ? T.n : T.m} = <b>${fmtInt(ans)}${unitTxt(T.unit)}</b>.`;
}
function diffExplain(T, which) {
  const Dv = T.u * (T.n - T.m), ans = T.u * (which ? T.n : T.m);
  return `Hiệu số phần bằng nhau: ${T.n} − ${T.m} = ${T.n - T.m} (phần).<br>Giá trị một phần: ${fmtInt(Dv)} : ${T.n - T.m} = ${fmtInt(T.u)}.<br>${T.names[which]}: ${fmtInt(T.u)} × ${which ? T.n : T.m} = <b>${fmtInt(ans)}${unitTxt(T.unit)}</b>.`;
}
const L7 = [
  () => { const T = sumTemplate(), w = R.int(0, 1);
    return inp({ kind: 'Giải toán', prompt: T.ask[w], ctx: `<p>${T.text}</p>${vSeg(T.m, T.n, 'sum', fmtInt(T.u * (T.m + T.n)), T.names)}`,
      spec: num(T.u * (w ? T.n : T.m), T.unit), explain: sumExplain(T, w) }); },
  () => { const T = sumTemplate(), w = R.int(0, 1);
    return inp({ kind: 'Giải toán', prompt: T.ask[w], ctx: `<p>${T.text}</p>`, spec: num(T.u * (w ? T.n : T.m), T.unit), explain: sumExplain(T, w) }); },
  () => { const T = sumTemplate(), step = R.int(0, 1);
    return inp({ kind: 'Từng bước', prompt: step ? 'Theo sơ đồ, giá trị của một phần bằng bao nhiêu?' : 'Theo sơ đồ, tổng số phần bằng nhau là bao nhiêu?',
      ctx: `<p>${T.text}</p>${vSeg(T.m, T.n, 'sum', fmtInt(T.u * (T.m + T.n)), T.names)}`, spec: num(step ? T.u : T.m + T.n, step ? T.unit : 'phần'),
      explain: `Tổng số phần bằng nhau: ${T.m} + ${T.n} = ${T.m + T.n} (phần).` + (step ? `<br>Giá trị một phần: ${fmtInt(T.u * (T.m + T.n))} : ${T.m + T.n} = ${fmtInt(T.u)}.` : '') }); },
  () => { const [m, n] = coprimePair(6), u = R.int(2, 9), S = u * (m + n);
    return sel({ prompt: `Tổng hai số là ${S}, tỉ số của hai số là ${F(m, n)}. Hai số đó là:`,
      correct: `${u * m} và ${u * n}`, wrong: [`${m} và ${n}`, `${u * m + 1} và ${u * n - 1}`, `${u * (n - m)} và ${S - u * (n - m)}`, `${u * m - 1} và ${u * n + 1}`],
      explain: `Tổng số phần: ${m} + ${n} = ${m + n}. Một phần: ${S} : ${m + n} = ${u}. Số bé: ${u} × ${m} = ${u * m}; số lớn: ${u} × ${n} = ${u * n}.` }); }
];
const L8 = [
  () => { const T = diffTemplate(), w = R.int(0, 1);
    return inp({ kind: 'Giải toán', prompt: T.ask[w], ctx: `<p>${T.text}</p>${vSeg(T.m, T.n, 'diff', fmtInt(T.u * (T.n - T.m)), T.names)}`,
      spec: num(T.u * (w ? T.n : T.m), T.unit), explain: diffExplain(T, w) }); },
  () => { const T = diffTemplate(), w = R.int(0, 1);
    return inp({ kind: 'Giải toán', prompt: T.ask[w], ctx: `<p>${T.text}</p>`, spec: num(T.u * (w ? T.n : T.m), T.unit), explain: diffExplain(T, w) }); },
  () => { const T = diffTemplate(), step = R.int(0, 1);
    return inp({ kind: 'Từng bước', prompt: step ? 'Theo sơ đồ, giá trị của một phần bằng bao nhiêu?' : 'Theo sơ đồ, hiệu số phần bằng nhau là bao nhiêu?',
      ctx: `<p>${T.text}</p>${vSeg(T.m, T.n, 'diff', fmtInt(T.u * (T.n - T.m)), T.names)}`, spec: num(step ? T.u : T.n - T.m, step ? T.unit : 'phần'),
      explain: `Hiệu số phần bằng nhau: ${T.n} − ${T.m} = ${T.n - T.m} (phần).` + (step ? `<br>Giá trị một phần: ${fmtInt(T.u * (T.n - T.m))} : ${T.n - T.m} = ${fmtInt(T.u)}.` : '') }); },
  () => { const [m, n] = gapPair(6), u = R.int(2, 6), w = u * m, l = u * n;
    return inp({ kind: 'Giải toán', prompt: 'Tính diện tích mảnh vườn đó.',
      ctx: `<p>Một mảnh vườn hình chữ nhật có chiều rộng ngắn hơn chiều dài ${u * (n - m)} m. Chiều rộng bằng ${F(m, n)} chiều dài.</p>`,
      spec: num(w * l, 'm²'), explain: `Hiệu số phần: ${n} − ${m} = ${n - m}. Một phần: ${u * (n - m)} : ${n - m} = ${u} (m).<br>Chiều rộng: ${u} × ${m} = ${w} (m); chiều dài: ${u} × ${n} = ${l} (m).<br>Diện tích: ${w} × ${l} = <b>${fmtInt(w * l)} m²</b>.` }); },
  () => { const kind = R.int(0, 1), [m, n] = coprimePair(6), u = R.int(3, 9);
    return sel({ prompt: kind ? 'Bài toán nào là dạng “tìm hai số khi biết hiệu và tỉ số”?' : 'Bài toán nào là dạng “tìm hai số khi biết tổng và tỉ số”?',
      correct: kind ? `Hai số có hiệu là ${u * (n - m)}, tỉ số là ${F(m, n)}.` : `Hai số có tổng là ${u * (n + m)}, tỉ số là ${F(m, n)}.`,
      wrong: [kind ? `Hai số có tổng là ${u * (n + m)}, tỉ số là ${F(m, n)}.` : `Hai số có hiệu là ${u * (n - m)}, tỉ số là ${F(m, n)}.`, `Hai số có tổng là ${u * (n + m)}, hiệu là ${u * (n - m)}.`, `Tính tỉ số của ${m} và ${n}.`],
      explain: kind ? 'Đề cho hiệu và tỉ số của hai số → dùng hiệu số phần bằng nhau.' : 'Đề cho tổng và tỉ số của hai số → dùng tổng số phần bằng nhau.' }); }
];

/* =====================================================================
   Bài 9 · Bài toán liên quan đến quan hệ phụ thuộc
   ===================================================================== */
const L9 = [
  () => { const T = R.pick([['Số can mật ong', 'Số lít mật ong', '', 'l'], ['Số hộp bút', 'Số chiếc bút', '', 'chiếc'], ['Thời gian nước chảy (phút)', 'Chiều cao cột nước (cm)', '', 'cm']]);
    const x1 = R.int(1, 5), k = R.int(2, 12), xs = [x1, 2 * x1, 3 * x1, 4 * x1], hide = R.int(1, 3);
    return inp({ kind: 'Quan sát bảng', prompt: 'Số thích hợp thay cho dấu ? là bao nhiêu?',
      ctx: vTable([[T[0], ...xs.map(fmtInt)], [T[1], ...xs.map((x, i) => i === hide ? '<b class="qm">?</b>' : fmtInt(x * k))]]),
      spec: num(xs[hide] * k), explain: `${xs[hide]} gấp ${xs[hide] / x1} lần ${x1}, nên số tương ứng cũng gấp lên bấy nhiêu lần: ${fmtInt(x1 * k)} × ${xs[hide] / x1} = ${fmtInt(xs[hide] * k)}.` }); },
  () => { const x1 = R.int(1, 4), k = R.int(2, 9), table = vTable([['Số can mật ong', x1, 2 * x1, 4 * x1].map(String), ['Số lít mật ong', x1 * k, 2 * x1 * k, 4 * x1 * k].map(String)]);
    if (R.chance(.5)) { const t = R.pick([2, 4]), dec = R.chance(.4);
      return inp({ kind: 'Quan sát bảng', prompt: dec ? `Khi số can mật ong giảm đi ${t} lần thì số lít mật ong giảm đi bao nhiêu lần?` : `Khi số can mật ong gấp lên ${t} lần thì số lít mật ong gấp lên bao nhiêu lần?`, ctx: table,
        spec: num(t, 'lần'), explain: dec ? `Từ ${4 * x1} can còn ${4 * x1 / t} can (giảm ${t} lần) thì số lít từ ${4 * x1 * k} còn ${4 * x1 * k / t} (cũng giảm ${t} lần).` : `Từ ${x1} can lên ${x1 * t} can (gấp ${t} lần) thì số lít từ ${x1 * k} lên ${x1 * k * t} (cũng gấp ${t} lần).` }); }
    const t = R.pick([3, 5, 6, 8]);
    return inp({ kind: 'Quan sát bảng', prompt: `Nếu có ${x1 * t} can mật ong như thế thì có bao nhiêu lít mật ong?`, ctx: table,
      spec: num(x1 * k * t, 'l'), explain: `${x1 * t} can gấp ${x1} can số lần là ${x1 * t} : ${x1} = ${t} (lần). Số lít mật ong: ${x1 * k} × ${t} = <b>${x1 * k * t} l</b>.` }); },
  () => { const it = R.pick([['quyển vở', 500], ['cái bút', 500], ['hộp sữa', 500], ['quyển truyện', 1000]]);
    const a = R.int(2, 6), p = R.int(it[1] === 500 ? 6 : 8, it[1] === 500 ? 24 : 30) * it[1], t = R.int(2, 5), b = R.chance(.6) ? a * t : R.int(a + 1, 15);
    const two = b % a === 0;
    return inp({ kind: 'Giải toán', prompt: `Hỏi nếu mua ${b} ${it[0]} như thế thì hết bao nhiêu tiền?`, ctx: `<p>Mua ${a} ${it[0]} cùng loại hết ${fmtInt(a * p)} đồng.</p>`,
      spec: num(b * p, 'đồng'), explain: `<b>Rút về đơn vị:</b> mua 1 ${it[0]} hết ${fmtInt(a * p)} : ${a} = ${fmtInt(p)} (đồng); mua ${b} ${it[0]} hết ${fmtInt(p)} × ${b} = ${fmtInt(b * p)} (đồng).` + (two ? `<br><b>Tìm tỉ số:</b> ${b} : ${a} = ${b / a} (lần), ${fmtInt(a * p)} × ${b / a} = ${fmtInt(b * p)} (đồng).` : '') }); },
  () => { const q = R.pick([100, 150, 200, 250]), c = R.int(4, 9), c2 = R.int(2, c - 1);
    return inp({ kind: 'Giải toán', prompt: `Hỏi có ${fmtInt(q * c2)} ml dầu dừa thì rót được mấy chai như vậy?`, ctx: `<p>Chia đều ${fmtInt(q * c)} ml dầu dừa được ${c} chai.</p>`,
      spec: num(c2, 'chai'), explain: `Mỗi chai chứa: ${fmtInt(q * c)} : ${c} = ${q} (ml). Số chai: ${fmtInt(q * c2)} : ${q} = ${c2} (chai).` }); },
  () => { const r = R.int(55, 70), T = R.int(1, 5);
    return inp({ kind: 'Giải toán', prompt: `Hỏi ${T} tấn thóc thì cho bao nhiêu ki-lô-gam gạo?`, ctx: `<p>Cứ 100 kg thóc thì cho ${r} kg gạo.</p>`,
      spec: num(T * 10 * r, 'kg'), explain: `Đổi ${T} tấn = ${fmtInt(T * 1000)} kg. ${fmtInt(T * 1000)} kg gấp 100 kg số lần là: ${fmtInt(T * 1000)} : 100 = ${T * 10} (lần).<br>Số gạo: ${r} × ${T * 10} = <b>${fmtInt(T * 10 * r)} kg</b>.` }); },
  () => { const k = R.int(2, 6), it = R.pick(['quyển vở', 'ki-lô-gam gạo', 'hộp bút', 'mét vải']), up = R.chance(.6), v = up ? 'gấp lên' : 'giảm đi', o = up ? 'giảm đi' : 'gấp lên';
    return sel({ prompt: `Mua ${it} cùng loại. Khi số ${it} mua ${v} ${k} lần thì số tiền phải trả:`, correct: `Cũng ${v} ${k} lần`,
      wrong: [`${cap(o)} ${k} lần`, 'Không thay đổi', `${cap(v)} ${k + 1} lần`], explain: `Số tiền phụ thuộc vào số ${it} mua: số ${it} ${v} ${k} lần thì số tiền cũng ${v} ${k} lần.` }); }
];

/* =====================================================================
   Bài 10 · Luyện tập (bài 6–9 + các bài toán “cứ … thì …”)
   ===================================================================== */
const L10extra = [
  () => { const a = R.int(3, 6), b = R.int(1, a - 1), t = R.int(3, 10);
    return inp({ kind: 'Giải toán', prompt: `Hỏi nếu bán được ${a * t} máy tính thì cửa hàng bán được bao nhiêu máy in?`, ctx: `<p>Một cửa hàng cứ bán được ${a} máy tính thì bán được ${b} máy in.</p>`,
      spec: num(b * t, 'máy in'), explain: `${a * t} máy tính gấp ${a} máy tính số lần là: ${a * t} : ${a} = ${t} (lần).<br>Số máy in: ${b} × ${t} = <b>${b * t}</b>.` }); },
  () => { const w = R.int(10, 30), m = R.int(2, 6);
    return inp({ kind: 'Giải toán', prompt: `Hỏi trong ${m} phút cô Hà gõ được bao nhiêu từ? (Tốc độ gõ không thay đổi.)`, ctx: `<p>Cô Hà gõ được ${w} từ trên máy tính trong vòng 30 giây.</p>`,
      spec: num(w * 2 * m, 'từ'), explain: `1 phút = 60 giây, gấp 30 giây 2 lần → 1 phút gõ được ${w} × 2 = ${w * 2} từ.<br>${m} phút gõ được: ${w * 2} × ${m} = <b>${w * 2 * m} từ</b>.` }); },
  () => { const a = R.int(5, 9), b = R.int(1, 3), t = R.int(3, 8);
    return inp({ kind: 'Giải toán', prompt: `Anh Nam thực hiện động tác gập bụng ${a * t} lần thì lên xà bao nhiêu lượt?`, ctx: `<p>Anh Nam tập thể dục: cứ gập bụng ${a} lần thì lên xà ${b} lượt.</p>`,
      spec: num(b * t, 'lượt'), explain: `${a * t} : ${a} = ${t} (lần). Số lượt lên xà: ${b} × ${t} = <b>${b * t}</b>.` }); },
  () => { const s = R.pick([3, 6, 9]), t = R.int(2, 6);
    return inp({ kind: 'Giải toán', prompt: `Cô Hiền cần tiết kiệm mấy tháng thì đủ tiền mua chiếc xe máy giá ${s * t} triệu đồng?`, ctx: `<p>Cứ 3 tháng cô Hiền tiết kiệm được ${s} triệu đồng.</p>`,
      spec: num(3 * t, 'tháng'), explain: `${s * t} triệu gấp ${s} triệu số lần là ${s * t} : ${s} = ${t} (lần).<br>Số tháng: 3 × ${t} = <b>${3 * t} tháng</b>.` }); },
  () => { const a = R.int(1, 5), k = R.int(2, 4), per = R.chance(.5);
    return inp({ kind: 'Viết tỉ số', prompt: per ? 'Viết tỉ số giữa chu vi hình vuông ABCD và chu vi hình vuông MNPQ.' : 'Viết tỉ số giữa độ dài cạnh hình vuông ABCD và độ dài cạnh hình vuông MNPQ.',
      ctx: `<p>Hình vuông ABCD có cạnh ${a} cm. Hình vuông MNPQ có cạnh ${a * k} cm.</p>`, spec: frac(per ? 4 * a : a, per ? 4 * a * k : a * k),
      explain: per ? `Chu vi ABCD: ${a} × 4 = ${4 * a} (cm); chu vi MNPQ: ${a * k} × 4 = ${4 * a * k} (cm). Tỉ số là ${F(4 * a, 4 * a * k)} = ${F(1, k)}. Cạnh gấp ${k} lần thì chu vi cũng gấp ${k} lần.` : `Tỉ số là ${F(a, a * k)} = ${F(1, k)}.` }); }
];

/* =====================================================================
   Bài 11 · Hỗn số
   ===================================================================== */
const mixedRand = (wMax = 9, dMax = 9) => { const d = R.int(2, dMax), n = R.int(1, d - 1), w = R.int(1, wMax); return [w, n, d]; };
const L11 = [
  () => { const d = R.int(2, 8), n = R.int(1, d - 1), w = R.int(1, 3);
    return inp({ kind: 'Viết hỗn số', prompt: 'Viết hỗn số chỉ phần đã tô màu.', ctx: vPies(w, n, d), spec: mixed(w, n, d),
      explain: `Có ${w} hình tròn tô màu đủ và ${F(n, d)} hình tròn → ${M(w, n, d)}, đọc là “${readMixed(w, n, d)}”.` }); },
  () => { const [w, n, d] = mixedRand();
    return sel({ prompt: `Hỗn số ${M(w, n, d)} đọc là:`, correct: cap(readMixed(w, n, d)),
      wrong: [cap(readMixed(n, w, d)), cap(`${readInt(w)} phần ${readInt(n)} và ${readInt(d)}`), cap(readMixed(w, d, n)), cap(`${readInt(w)} nhân ${readFrac(n, d)}`)],
      explain: `Đọc phần nguyên trước, rồi “và”, rồi đọc phần phân số: ${readMixed(w, n, d)}.` }); },
  () => { const [w, n, d] = mixedRand();
    return inp({ kind: 'Viết hỗn số', prompt: `Viết hỗn số: <i>${readMixed(w, n, d)}</i>.`, spec: mixed(w, n, d), explain: `${cap(readMixed(w, n, d))} viết là ${M(w, n, d)}.` }); },
  () => { const [w, n, d] = mixedRand(), part = R.int(0, 1);
    return sel({ prompt: `Hỗn số ${M(w, n, d)} có ${part ? 'phần phân số' : 'phần nguyên'} là:`, correct: part ? F(n, d) : String(w),
      wrong: part ? [String(w), F(w, d), F(d, n), F(n, w + d)] : [F(n, d), String(n), String(d), String(w + 1), String(w * d + n)],
      explain: `${M(w, n, d)} có phần nguyên là ${w}, phần phân số là ${F(n, d)}.` }); },
  () => { const [w, n, d] = mixedRand(9, 10);
    return inp({ kind: 'Chuyển thành phân số', prompt: `Chuyển hỗn số ${M(w, n, d)} thành phân số.`, spec: frac(w * d + n, d),
      explain: `${M(w, n, d)} = ${F(`${w} × ${d} + ${n}`, d)} = ${F(w * d + n, d)}.` }); },
  () => { const [w, n, d] = mixedRand(4, 6), k = R.int(0, 3);
    const s = [[`Phần phân số của một hỗn số bao giờ cũng bé hơn đơn vị.`, true], [`${M(w, d + n, d)} là một hỗn số viết đúng.`, false], [`${M(w, n, d)} = ${w} + ${F(n, d)}`, true], [`${M(w, n, d)} = ${F(w * n, d)}`, false]][k];
    return tf({ prompt: s[0], answer: s[1], explain: k === 1 ? `Sai vì ${F(d + n, d)} > 1, mà phần phân số của hỗn số phải bé hơn đơn vị.` : `Hỗn số ${M(w, n, d)} = ${w} + ${F(n, d)} = ${F(w * d + n, d)}. Phần phân số của hỗn số luôn bé hơn 1.` }); },
  () => { const seen = new Set(), pairs = [];
    while (pairs.length < 4) { const [w, n, d] = mixedRand(5, 8), key = (w * d + n) + '/' + d; if (seen.has(key) || gcd(n, d) !== 1) continue; seen.add(key); pairs.push([M(w, n, d), F(w * d + n, d)]); }
    return match({ prompt: 'Nối hỗn số với phân số bằng nó', pairs, explain: `Cách chuyển: ${M('a', 'b', 'c')} = ${F('a × c + b', 'c')}.` }); }
];

/* =====================================================================
   Bài 12 · Phân số thập phân
   ===================================================================== */
const L12 = [
  () => { const T = R.pick([10, 100, 1000]), n = R.int(1, T === 10 ? 99 : 999);
    const wrong = R.shuffle([F(R.int(1, 50), R.pick([3, 7, 12, 25, 52])), F(T, R.pick([3, 7, 12, 25, 52, 75])), F(R.int(1, 9), R.pick([3000, 200, 50, 20])), F(R.int(11, 99), R.pick([15, 30, 110]))]);
    return sel({ prompt: 'Phân số nào dưới đây là phân số thập phân?', correct: F(n, T), wrong,
      explain: `Phân số có mẫu số là 10, 100, 1 000, … gọi là phân số thập phân. ${F(n, T)} có mẫu số ${fmtInt(T)}.` }); },
  () => { const pool = [[1, 2], [3, 2], [3, 4], [1, 4], [2, 5], [7, 5], [18, 25], [7, 20], [9, 50], [3, 8], [7, 40], [21, 250], [42, 60], [32, 80], [72, 400], [425, 5000], [9, 30], [12, 200]];
    const [n, d] = R.pick(pool);
    let T = 10; while ((n * T) % d) T *= 10; const N = n * T / d;
    return inp({ kind: 'Phân số thập phân', prompt: `Chuyển ${F(n, d)} thành phân số thập phân.`, spec: frac(N, T, 'decfrac'),
      explain: (T % d === 0 ? `${F(n, d)} = ${F(`${n} × ${T / d}`, `${d} × ${T / d}`)}` : `${F(n, d)} = ${F(`${n} : ${d / T}`, `${d} : ${d / T}`)}`) + ` = ${F(N, T)}.` }); },
  () => { const T = R.pick([10, 100, 1000, 1000000]), n = R.int(1, T === 10 ? 9 : T === 100 ? 99 : 999);
    return inp({ kind: 'Viết phân số', prompt: `Viết phân số thập phân: <i>${cap(readFrac(n, T))}</i>.`, spec: frac(n, T, 'exact'), explain: `${cap(readFrac(n, T))} viết là ${F(n, T)}.` }); },
  () => { const k = R.int(1, 29), L = ['0', '1', '2', '3'];
    return sel({ prompt: 'Phân số thập phân nào ở vị trí được đánh dấu trên tia số?', ctx: vLine({ from: '0', to: '3', ticks: 30, labels: L, points: [{ v: String(k / 10), label: '?' }] }),
      correct: F(k, 10), wrong: [...R.shuffle([F(k + 1, 10), F(k - 1 || k + 2, 10), F(k, 100), F(10, k)]), F(k + 2, 10)],
      explain: `Từ 0 đến 1 chia thành 10 phần bằng nhau, mỗi vạch là ${F(1, 10)}. Điểm đánh dấu ở vạch thứ ${k} → ${F(k, 10)}.` }); },
  () => { const seen = new Set(), pairs = [];
    while (pairs.length < 4) { const T = R.pick([10, 100]), w = R.int(1, 9), n = R.int(1, T - 1); if (T === 100 && n % 10 === 0) continue;
      if (seen.has(w * T + n) || seen.has('n' + n)) continue; seen.add(w * T + n); seen.add('n' + n); pairs.push([F(w * T + n, T), M(w, n, T)]); }
    return match({ prompt: 'Trò chơi “Ghép thẻ”: nối phân số thập phân với hỗn số', pairs, explain: `Ví dụ: ${F(23, 10)} = ${M(2, 3, 10)}, ${F(723, 100)} = ${M(7, 23, 100)}.` }); }
];

/* =====================================================================
   Bài 13–16 · Số thập phân
   ===================================================================== */
const readDecCap = s => cap(readDec(s));
function decReadSel(s) {
  const [i, f] = s.split('.'), alt = new Set([readDec(s)]), wrongs = [];
  const tryAdd = t => { if (!t || alt.has(t)) return; alt.add(t); wrongs.push(cap(t)); };
  tryAdd(readDec(`${i}.0${f}`)); tryAdd(readDec(`${f.replace(/^0+/, '') || '0'}.${i}`));
  tryAdd(`${readInt(+i)} phần ${readInt(+f)}`); tryAdd(readDec(`${i}${f[0]}.${f.slice(1) || '0'}`));
  return sel({ prompt: `Số thập phân ${D(s)} đọc là:`, correct: readDecCap(s), wrong: wrongs.slice(0, 3),
    explain: `Đọc phần nguyên, đọc “phẩy”, rồi đọc phần thập phân: ${D(s)} đọc là “${readDec(s)}”.` });
}
const L13 = [
  () => { const k = R.int(1, 9);
    return inp({ kind: 'Viết số thập phân', prompt: 'Viết số thập phân chỉ phần đã tô màu của băng giấy.', ctx: vStrip(k), spec: num(k / 10, '', `0.${k}`),
      explain: `Băng giấy chia 10 phần, tô ${k} phần → ${F(k, 10)} = ${D('0.' + k)}.` }); },
  () => { const k = R.int(1, 9);
    return inp({ kind: 'Viết số thập phân', prompt: `Chuyển ${F(k, 10)} thành số thập phân.`, spec: num(k / 10, '', `0.${k}`), explain: `${F(k, 10)} viết thành ${D('0.' + k)}, đọc là “${readDec('0.' + k)}”.` }); },
  () => { const k = R.int(1, 9);
    return inp({ kind: 'Phân số thập phân', prompt: `Chuyển ${D('0.' + k)} thành phân số thập phân.`, spec: frac(k, 10, 'decfrac'), explain: `${D('0.' + k)} = ${F(k, 10)}.` }); },
  () => decReadSel(`0.${R.int(1, 9)}`),
  () => { const k = R.int(1, 9);
    return inp({ kind: 'Viết số thập phân', prompt: `Viết số thập phân: <i>${readDec('0.' + k)}</i>.`, spec: num(k / 10, '', `0.${k}`), explain: `${readDecCap('0.' + k)} viết là ${D('0.' + k)}.` }); },
  () => { const k = R.int(2, 9), bug = R.pick(['con kiến', 'con bọ dừa', 'con sâu']);
    return inp({ kind: 'Đo độ dài', prompt: `Chiều dài của ${bug} là ${F(k, 10)} cm, ta viết thành bao nhiêu xăng-ti-mét?`, ctx: vRuler(k, 3, 'var(--coral)'), spec: num(k / 10, 'cm', `0.${k}`),
      explain: `${F(k, 10)} cm = ${D('0.' + k)} cm.` }); },
  () => { const k = R.int(1, 9);
    return sel({ prompt: 'Số thập phân nào ở vị trí được đánh dấu trên tia số?', ctx: vLine({ from: '0', to: '1', ticks: 10, labels: ['0', '1'], points: [{ v: `0.${k}`, label: '?' }] }),
      correct: fmtDec(`0.${k}`), wrong: R.shuffle([fmtDec(`0.0${k}`), fmtDec(String(k)), fmtDec(`0.${k === 9 ? 8 : k + 1}`), fmtDec(`0.${k === 1 ? 2 : k - 1}`)]),
      explain: `Đoạn từ 0 đến 1 chia 10 phần bằng nhau, mỗi phần là 0,1. Điểm đánh dấu là ${D('0.' + k)}.` }); }
];
const L14 = [
  () => { const k = R.int(1, 99), s = unitsToDec(k, 2);
    return inp({ kind: 'Viết số thập phân', prompt: 'Viết số thập phân chỉ phần đã tô màu của hình vuông (hình vuông gồm 100 ô).', ctx: vGrid(k), spec: num(k / 100, '', s),
      explain: `Tô ${k} ô trên 100 ô → ${F(k, 100)} = ${D(s)}.` }); },
  () => { const k = R.chance(.3) ? R.int(1, 9) : R.int(11, 99), s = unitsToDec(k, 2);
    return inp({ kind: 'Viết số thập phân', prompt: `Chuyển ${F(k, 100)} thành số thập phân.`, spec: num(k / 100, '', s), explain: `${F(k, 100)} viết thành ${D(s)}, đọc là “${readDec(s)}”.` }); },
  () => { const k = R.int(1, 99), s = unitsToDec(k, 2);
    return inp({ kind: 'Phân số thập phân', prompt: `Chuyển ${D(trimDec(s))} thành phân số thập phân.`, spec: frac(k, 100, 'decfrac'), explain: `${D(trimDec(s))} = ${F(k, 100)}${k % 10 === 0 ? ` = ${F(k / 10, 10)}` : ''}.` }); },
  () => decReadSel(unitsToDec(R.chance(.3) ? R.int(1, 9) : R.int(11, 99), 2).replace(/0$/, '1')),
  () => { let k; do { k = R.int(11, 89); } while (k % 10 === 0); const s = unitsToDec(k, 2);
    return sel({ prompt: 'Số thập phân nào ứng với điểm được đánh dấu trên tia số?', ctx: vLine({ from: (Math.floor(k / 10) / 10).toFixed(1), to: ((Math.floor(k / 10) + 1) / 10).toFixed(1), ticks: 10, labels: [(Math.floor(k / 10) / 10).toFixed(1), ((Math.floor(k / 10) + 1) / 10).toFixed(1)], points: [{ v: s, label: '?' }] }),
      correct: fmtDec(trimDec(s)), wrong: R.shuffle([fmtDec(`0.${String(k).split('').reverse().join('')}`), fmtDec(trimDec(unitsToDec(k, 1))), fmtDec(trimDec(unitsToDec(k, 3))), fmtDec(trimDec(unitsToDec(k + 1, 2)))]).concat(fmtDec(trimDec(unitsToDec(k - 1, 2)))),
      explain: `Giữa hai vạch dài chia 10 phần, mỗi phần là 0,01. Điểm đánh dấu là ${D(trimDec(s))}.` }); },
  () => { let k; do { k = R.int(1, 99); } while (k % 10 === 0); const s = unitsToDec(k, 2);
    return inp({ kind: 'Viết số thập phân', prompt: `Viết số thập phân: <i>${readDec(s)}</i>.`, spec: num(k / 100, '', s), explain: `${readDecCap(s)} viết là ${D(s)}.` }); }
];
const L15 = [
  () => { const k = R.pick([R.int(1, 9), R.int(10, 99), R.int(100, 999)]), s = unitsToDec(k, 3);
    return inp({ kind: 'Viết số thập phân', prompt: `Chuyển ${F(k, 1000)} về dạng số thập phân.`, spec: num(k / 1000, '', s), explain: `${F(k, 1000)} = ${D(s)} (phần thập phân có 3 chữ số).` }); },
  () => { const k = R.pick([R.int(1, 9), R.int(10, 99), R.int(100, 999)]), s = unitsToDec(k, 3);
    return inp({ kind: 'Phân số thập phân', prompt: `Chuyển ${D(s)} về dạng phân số thập phân.`, spec: frac(k, 1000, 'decfrac'), explain: `${D(s)} = ${F(k, 1000)}.` }); },
  () => decReadSel(unitsToDec(R.pick([R.int(1, 9), R.int(11, 99), R.int(101, 999)]), 3).replace(/0$/, '7')),
  () => { const k = R.int(101, 999), s = unitsToDec(k, 3);
    return inp({ kind: 'Viết số thập phân', prompt: `Viết số thập phân: <i>${readDec(s)}</i>.`, spec: num(k / 1000, '', s), explain: `${readDecCap(s)} viết là ${D(s)}.` }); },
  () => { const fruit = R.pick(['Chùm nho', 'Quả măng cụt', 'Quả na', 'Quả bơ']), k = R.int(201, 989);
    return inp({ kind: 'Cân nặng', prompt: `${fruit} cân nặng ${F(k, 1000)} kg. Viết cân nặng đó dưới dạng số thập phân.`, spec: num(k / 1000, 'kg', unitsToDec(k, 3)), explain: `${F(k, 1000)} kg = ${D(unitsToDec(k, 3))} kg, đọc là “${readDec(unitsToDec(k, 3))} ki-lô-gam”.` }); }
];
const PLACES = { '-3': 'hàng trăm', '-2': 'hàng chục', '-1': 'hàng đơn vị', '1': 'hàng phần mười', '2': 'hàng phần trăm', '3': 'hàng phần nghìn' };
const L16 = [
  () => { const T = R.pick([10, 100, 1000]), w = R.int(1, 20), n = R.int(1, T - 1), s = decStr(w, String(n).padStart(String(T).length - 1, '0'));
    return inp({ kind: 'Viết số thập phân', prompt: `Chuyển hỗn số ${M(w, n, T)} thành số thập phân.`, spec: num(val(s), '', s), explain: `${M(w, n, T)} = ${D(s)}, đọc là “${readDec(s)}”.` }); },
  () => { const digits = R.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 6);
    const ip = R.int(1, 3), fp = R.int(1, 3), I = digits.slice(0, ip).join(''), Fd = digits.slice(ip, ip + fp).join(''), s = `${I}.${Fd}`;
    const pos = R.int(0, ip + fp - 1), d = (I + Fd)[pos], place = pos < ip ? String(pos - ip) : String(pos - ip + 1);
    return sel({ prompt: `Chữ số ${d} trong số ${D(s)} thuộc hàng nào?`, correct: cap(PLACES[place]),
      wrong: R.shuffle(Object.values(PLACES).filter(p => p !== PLACES[place]).map(cap)),
      explain: `${D(s)}: phần nguyên ${I}, phần thập phân ${Fd}. Chữ số ${d} thuộc ${PLACES[place]}.` }); },
  () => { const s = randDec(1, 99, R.int(1, 3)), [I, Fd] = s.split('.'), part = R.int(0, 1);
    return sel({ prompt: `Số thập phân ${D(s)} có ${part ? 'phần thập phân gồm các chữ số' : 'phần nguyên là'}:`, correct: part ? Fd.split('').join(', ') : I,
      wrong: part ? [I.split('').join(', '), (I + Fd).split('').join(', '), Fd.slice(0, -1).split('').join(', ') || '0', Fd.split('').reverse().join(', ') + ', 0'] : [Fd, I + Fd, I.slice(0, -1) || '0', String(+I + 1)],
      explain: `Những chữ số bên trái dấu phẩy thuộc phần nguyên (${I}), bên phải dấu phẩy thuộc phần thập phân (${Fd}).` }); },
  () => { const ip = R.int(0, 99), dp = R.int(1, 3), fr = R.int(1, Math.pow(10, dp) - 1), s = decStr(ip, String(fr).padStart(dp, '0'));
    return inp({ kind: 'Viết số thập phân', prompt: `Viết số thập phân có: <i>${cap(readInt(ip))} đơn vị, ${readFrac(fr, Math.pow(10, dp))}</i>.`, spec: num(val(s), '', s),
      explain: `${cap(readInt(ip))} đơn vị → phần nguyên ${ip}; ${F(fr, Math.pow(10, dp))} → phần thập phân có ${dp} chữ số. Số đó là ${D(s)}.` }); },
  () => decReadSel(randDec(2, 60, R.int(1, 3))),
  () => { const s = randDec(10, 299, R.int(1, 3));
    return inp({ kind: 'Viết số thập phân', prompt: `Viết số thập phân: <i>${readDec(s)}</i>.`, spec: num(val(s), '', s), explain: `${readDecCap(s)} viết là ${D(s)}.` }); },
  () => { let mm; do { mm = R.int(21, 79); } while (mm % 10 === 0); const cm = mm / 10;
    return inp({ kind: 'Đo độ dài', prompt: 'Chiếc bút màu dài bao nhiêu xăng-ti-mét?', ctx: vRuler(mm, 8, 'var(--jade)'), spec: num(cm, 'cm', unitsToDec(mm, 1)),
      explain: `Bút màu dài ${Math.floor(mm / 10)} cm và ${mm % 10} mm, tức là ${M(Math.floor(mm / 10), mm % 10, 10)} cm = ${D(trimDec(unitsToDec(mm, 1)))} cm.` }); }
];

/* =====================================================================
   Bài 17 · Số thập phân bằng nhau
   ===================================================================== */
const L17 = [
  () => { const s = randDec(1, 30, R.int(1, 2)), [I, Fd] = s.split('.');
    const eq = `${I}.${Fd}${'0'.repeat(R.int(1, 2))}`;
    const wrong = uniqBy([`${I}.0${Fd}`, `${I}.${Fd[0]}0${Fd.slice(1)}`, `${I}0.${Fd}`, `${I}.00${Fd}`, `${I}${Fd}`].filter(x => Math.abs(val(x) - val(s)) > 1e-12), x => fmtDec(x)).map(fmtDec);
    return sel({ prompt: `Số thập phân nào bằng ${D(s)}?`, correct: fmtDec(eq), wrong: R.shuffle(wrong),
      explain: `Viết thêm chữ số 0 vào <b>bên phải</b> phần thập phân thì được số thập phân bằng nó: ${D(s)} = ${D(eq)}. Thêm 0 ngay sau dấu phẩy sẽ làm số thay đổi.` }); },
  () => { const s = randDec(0, 50, R.int(1, 2)), [I, Fd] = s.split('.'), ok = R.chance(.5);
    const other = ok ? `${I}.${Fd}0` : `${I}.0${Fd}`, flip = R.chance(.5);
    return tf({ prompt: `${D(flip ? other : s)} = ${D(flip ? s : other)}`, answer: ok,
      explain: ok ? `Đúng. Thêm (hoặc bỏ) chữ số 0 ở tận cùng bên phải phần thập phân, giá trị không đổi.` : `Sai. ${D(other)} khác ${D(s)} vì chữ số 0 nằm ngay sau dấu phẩy, làm thay đổi giá trị các hàng.` }); },
  () => { const s = randDec(1, 99, R.int(1, 2)), z = `${s}${'0'.repeat(R.int(1, 3))}`, s2 = s.includes('.') ? s : s;
    return sel({ prompt: `Bỏ các chữ số 0 ở tận cùng bên phải phần thập phân, số ${D(z)} viết gọn là:`, correct: fmtDec(s2),
      wrong: uniqBy([fmtDec(s2.replace('.', '')), fmtDec(`${s2.split('.')[0]}.0${s2.split('.')[1]}`), fmtDec(String(Math.floor(val(s2))))], x => x).filter(x => x !== fmtDec(s2)),
      explain: `${D(z)} = ${D(s2)}. Bỏ các chữ số 0 tận cùng bên phải phần thập phân thì số không đổi.` }); },
  () => { const w = R.int(1, 99), k = R.int(1, 3);
    return sel({ prompt: `Viết số tự nhiên ${w} thành số thập phân có ${k} chữ số ở phần thập phân:`, correct: fmtDec(`${w}.${'0'.repeat(k)}`),
      wrong: [fmtDec(`0.${String(w).padStart(k, '0')}`), fmtDec(`${w}.${'0'.repeat(k - 1)}1`), fmtDec(`${w * 10}.${'0'.repeat(k)}`), fmtDec(`${w}0`)],
      explain: `Mọi số tự nhiên viết được thành số thập phân có phần thập phân là các chữ số 0: ${w} = ${D(`${w}.${'0'.repeat(k)}`)}.` }); },
  () => { const claims = [[F(1, 2), true], [F(5, 10), true], ['0,5', true], ['0,50', true], ['0,05', false], [F(5, 100), false], [F(1, 5), false], ['5,0', false]], c = R.pick(R.chance(.5) ? claims.slice(0, 4) : claims.slice(4)), who = R.pick(['Hoa', 'Linh', 'Đan', 'Dũng']);
    return tf({ prompt: `Hình vuông gồm 100 ô, đã tô màu 50 ô. Bạn ${who} nói: “Đã tô màu vào ${c[0]} hình.” ${who} nói đúng hay sai?`, ctx: vGrid(50, 'var(--gold)'), answer: c[1],
      explain: `Đã tô 50 ô trên 100 ô: ${F(50, 100)} = ${F(5, 10)} = ${F(1, 2)} = 0,50 = 0,5 hình. Còn 0,05 = ${F(5, 100)}, chỉ là 5 ô.` }); },
  () => { const d = R.int(1, 9), i = R.int(0, 9), who = R.pick(['Lan', 'Minh', 'Khôi', 'Mai']), v = R.int(0, 2);
    const a = `${i}.${d}0`, b = `${i}.${d}`, c = `${i}.0${d}`;
    if (v === 0) return tf({ prompt: `${who} nói rằng: “${D(a)} lớn hơn ${D(b)} vì ${d}0 lớn hơn ${d}.” ${who} nói đúng hay sai?`, answer: false,
      explain: `Sai. ${D(a)} = ${D(b)} vì viết thêm chữ số 0 vào bên phải phần thập phân thì số không thay đổi.` });
    if (v === 1) return tf({ prompt: `${who} nói rằng: “${D(a)} = ${D(b)} vì bỏ chữ số 0 ở tận cùng bên phải phần thập phân thì số không đổi.” ${who} nói đúng hay sai?`, answer: true,
      explain: `Đúng. ${D(a)} = ${D(b)}.` });
    return tf({ prompt: `${who} nói rằng: “${D(c)} = ${D(b)} vì chỉ thêm một chữ số 0.” ${who} nói đúng hay sai?`, answer: false,
      explain: `Sai. Chữ số 0 nằm ngay sau dấu phẩy làm ${d} chuyển từ hàng phần mười sang hàng phần trăm: ${D(c)} &lt; ${D(b)}.` }); }
];

/* =====================================================================
   Bài 18 · So sánh các số thập phân
   ===================================================================== */
function trickyPair() {
  const t = R.int(0, 5);
  if (t === 0) { const a = R.int(1, 50), b = randDec(a - 1, a - 1, 2); return [String(a), b]; }       // 7 ? 6,99
  if (t === 1) { const i = R.int(1, 30), x = randDec(i, i, 3), y = randDec(i, i, 2); return [x, y]; }                                 // 17,183 ? 17,09
  if (t === 2) { const s = randDec(1, 60, 1); return [s, s + '0']; }                                                                // 29,5 ? 29,50
  if (t === 3) { const a = R.int(10, 99); return [`0.0${a}`, `0.0${R.int(1, 9)}`]; }                                                // 0,041 ? 0,05
  if (t === 4) { const i = R.int(1, 30); return [randDec(i, i, 1), randDec(i - 1 < 1 ? 1 : i - 1, i + 1, 2)]; }
  const a = randDec(1, 99, 2); return [a, a.replace(/(\d)$/, d => String((+d + R.int(1, 8)) % 10))];
}
function compareExplain(a, b) {
  return sign => {
    const [ia] = a.split('.'), [ib] = b.split('.');
    if (sign === '=') return `${D(a)} = ${D(b)}: phần nguyên bằng nhau, phần thập phân bằng nhau (thêm hay bỏ chữ số 0 tận cùng không đổi giá trị).`;
    if (ia !== ib) return `Phần nguyên khác nhau: ${ia} ${+ia > +ib ? '&gt;' : '&lt;'} ${ib}, nên ${D(a)} ${lt(sign)} ${D(b)}.`;
    return `Phần nguyên bằng nhau (${ia}). So sánh lần lượt từng hàng ở phần thập phân, từ trái sang phải, đến khi gặp cặp chữ số khác nhau → ${D(a)} ${lt(sign)} ${D(b)}.`;
  };
}
const L18 = [
  () => { let [a, b] = trickyPair(); if (R.chance(.5)) [a, b] = [b, a]; return cmp({ a, b, explain: compareExplain(a, b) }); },
  () => { let [a, b] = trickyPair(); if (R.chance(.5)) [a, b] = [b, a]; return cmp({ a, b, explain: compareExplain(a, b) }); },
  () => { const ds = R.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 3).map(String);
    const it = uniqBy([`${ds[0]}.${ds[1]}${ds[2]}`, `${ds[0]}.${ds[2]}${ds[1]}`, `${ds[1] === '0' ? ds[2] : ds[1]}.${ds[0]}${ds[2]}`, `${ds[0]}${ds[1]}.${ds[2]}`, `${ds[0]}.0${ds[1]}${ds[2]}`].filter(x => !/^0\d/.test(x)), x => val(x));
    const items = R.sample(it, 4), big = R.chance(.5), target = items.reduce((p, c) => (big ? val(c) > val(p) : val(c) < val(p)) ? c : p);
    return sel({ prompt: `Số ${big ? 'lớn nhất' : 'bé nhất'} trong các số sau là:`, correct: fmtDec(target), wrong: items.filter(x => x !== target).map(fmtDec),
      explain: `So sánh phần nguyên trước, rồi so sánh lần lượt hàng phần mười, phần trăm, phần nghìn. Số ${big ? 'lớn nhất' : 'bé nhất'} là ${D(target)}.` }); },
  () => { const i = R.int(1, 40); let items;
    do { items = uniqBy([randDec(i, i + 1, 2), randDec(i, i, 3), randDec(i, i + 1, 2), randDec(i - 1 < 1 ? 1 : i - 1, i, 2)], x => val(x)); } while (items.length < 4);
    const dir = R.chance(.5) ? 'asc' : 'desc';
    return order({ prompt: `Sắp xếp các số theo thứ tự từ ${dir === 'asc' ? 'bé đến lớn' : 'lớn đến bé'}. Chạm lần lượt từng số.`, items, dir,
      explain: `Thứ tự đúng: ${items.slice().sort((x, y) => dir === 'asc' ? val(x) - val(y) : val(y) - val(x)).map(D).join(dir === 'asc' ? ' &lt; ' : ' &gt; ')}.` }); },
  () => { const variant = R.int(0, 1), ip = R.int(1, 20), t = R.int(0, 9);
    if (variant === 0) { const z = R.int(2, 9), w = R.int(0, z - 1), A = `${ip},${t}<b class="qm">?</b>${z}`, B = `${ip}.${t}1${w}`;
      return inp({ kind: 'Tìm chữ số', prompt: `Tìm chữ số thích hợp cho ô ? : <span class="num">${A}</span> &lt; ${D(B)}`, spec: num(0),
        explain: `Hai số có phần nguyên và hàng phần mười giống nhau. Nếu ? = 1 thì ${D(`${ip}.${t}1${z}`)} > ${D(B)} (vì ${z} > ${w}). Vậy ? = 0: ${D(`${ip}.${t}0${z}`)} < ${D(B)}.` }); }
    const z = R.int(0, 7), w = R.int(z + 1, 9), A = `${ip},${t}<b class="qm">?</b>${w}`, B = `${ip}.${t}9${z}`;
    return inp({ kind: 'Tìm chữ số', prompt: `Tìm chữ số thích hợp cho ô ? : <span class="num">${A}</span> &gt; ${D(B)}`, spec: num(9),
      explain: `Muốn lớn hơn ${D(B)} thì hàng phần trăm phải ≥ 9, nên ? = 9; khi đó ${D(`${ip}.${t}9${w}`)} > ${D(B)} vì ${w} > ${z}.` }); },
  () => { const n = R.int(1, 99), a = unitsToDec(n * 100 - R.int(1, 30) * (R.chance(.5) ? 1 : 3), 2), b = unitsToDec(n * 100 + R.int(1, 40), 2);
    return inp({ kind: 'Tìm số tự nhiên', prompt: `Tìm số tự nhiên thích hợp cho ô ? : ${D(a)} &lt; <b class="qm">?</b> &lt; ${D(b)}`, spec: num(n),
      explain: `Số tự nhiên nằm giữa ${D(a)} và ${D(b)} là ${n}.` }); },
  () => { const names = R.sample(['Khoa', 'Châu', 'Thư', 'Nam', 'Mai', 'Hùng'], 3), base = R.int(1500, 1800);
    let ts; do { ts = [0, 1, 2].map(() => unitsToDec(base + R.int(0, 40), 2)); } while (new Set(ts.map(val)).size < 3);
    const best = ts.indexOf(ts.reduce((p, c) => val(c) < val(p) ? c : p));
    return sel({ prompt: 'Ai là người về đích đầu tiên?', ctx: `<p>Thời gian chạy hết 100 m của ba bạn: ${names.map((n, i) => `${n}: ${D(ts[i])} giây`).join('; ')}.</p>`,
      correct: names[best], wrong: names.filter((_, i) => i !== best), explain: `Về đích đầu tiên là người chạy hết ít thời gian nhất. ${D(ts[best])} giây là bé nhất → ${names[best]}.` }); },
  () => { const data = [['Trung Quốc', '72.71'], ['Pháp', '81.00'], ['Ấn Độ', '64.19'], ['Nhật Bản', '82.73'], ['Lào', '66.06'], ['Singapore', '80.60'], ['Thái Lan', '73.56'], ['Việt Nam', '74.35']];
    const rows = R.sample(data, 4), big = R.chance(.5), t = rows.reduce((p, c) => (big ? val(c[1]) > val(p[1]) : val(c[1]) < val(p[1])) ? c : p);
    return sel({ prompt: `Trong bảng, nước nào có tuổi thọ trung bình ${big ? 'cao nhất' : 'thấp nhất'}?`, ctx: vTable([['Tên nước', ...rows.map(r => r[0])], ['Tuổi thọ', ...rows.map(r => fmtDec(r[1]))]]) + '<p class="src-note">Số liệu năm 2022 trong SGK.</p>',
      correct: t[0], wrong: rows.filter(r => r !== t).map(r => r[0]), explain: `So sánh các số thập phân: ${rows.map(r => D(r[1])).join(', ')}. ${big ? 'Lớn nhất' : 'Bé nhất'} là ${D(t[1])} (${t[0]}).` }); }
];

/* =====================================================================
   Bài 19 · Làm tròn số thập phân
   ===================================================================== */
const ROUND_TO = [[0, 'hàng đơn vị'], [1, 'hàng phần mười'], [2, 'hàng phần trăm']];
const L19 = [
  () => { const [k, name] = R.pick(ROUND_TO), s = randDec(1, 300, k + R.int(1, 2)), r = roundDec(s, k);
    return inp({ kind: 'Làm tròn', prompt: `Làm tròn số ${D(s)} đến ${name}.`, spec: num(val(r), '', r),
      explain: `Xét chữ số ngay sau ${name}: ${s.split('.')[1][k]}. ${+s.split('.')[1][k] >= 5 ? 'Chữ số đó ≥ 5 nên làm tròn lên' : 'Chữ số đó &lt; 5 nên làm tròn xuống'} → ${D(r)}.` }); },
  () => { const k = R.int(1, 2), base = R.int(10, 99), units = base * 10 + R.int(1, 9), s = unitsToDec(units, k + 1), lo = unitsToDec(base, k), hi = unitsToDec(base + 1, k), r = roundDec(s, k);
    return sel({ prompt: `Quan sát tia số. Làm tròn ${D(s)} đến ${k === 1 ? 'hàng phần mười' : 'hàng phần trăm'} ta được số nào?`,
      ctx: vLine({ from: lo, to: hi, ticks: 10, labels: [lo, hi], points: [{ v: s, label: fmtDec(s) }] }),
      correct: fmtDec(r), wrong: uniqBy([r === lo ? hi : lo, s, roundDec(s, k - 1), unitsToDec(base + 2, k), unitsToDec(base - 1, k)].filter(x => val(x) !== val(r)), val).map(fmtDec),
      explain: units % 10 === 5 ? `${D(s)} cách đều ${D(lo)} và ${D(hi)}. Quy ước: làm tròn lên → ${D(r)}.` : `${D(s)} gần ${D(r)} hơn → ${D(r)}.` }); },
  () => { const i = R.int(1, 40), dg = R.pick([3, 4, 5, 5, 6, 7]), s = `${i}.${dg}`, r = +roundDec(s, 0), claim = R.chance(.5) ? r : (r === i ? i + 1 : i), ok = claim === r;
    return tf({ prompt: `Làm tròn ${D(s)} đến hàng đơn vị được ${claim}.`, answer: ok,
      explain: `Chữ số hàng phần mười là ${dg} ${dg >= 5 ? '≥ 5 nên làm tròn lên' : '&lt; 5 nên làm tròn xuống'}: ${D(s)} → ${r}.${dg === 5 ? ` (${D(s)} cách đều ${i} và ${i + 1}; quy ước làm tròn lên.)` : ''}` }); },
  () => { const T = R.pick([['Quãng đường từ khu A đến khu B dài', 'km', 0], ['Bạn Minh cao', 'm', 1], ['Quả dưa hấu cân nặng', 'kg', 0], ['Bể nước chứa', 'l', 0], ['Mẹ của Hà cao', 'm', 1]]);
    const s = T[2] ? randDec(1, 1, 2) : randDec(2, 30, R.int(1, 2)), r = roundDec(s, T[2]), place = T[2] ? 'hàng phần mười' : 'hàng đơn vị';
    return inp({ kind: 'Làm tròn', prompt: `${T[0]} ${D(s)} ${T[1]}. Làm tròn số đo đó đến ${place}.`, spec: num(val(r), T[1], r), explain: `${D(s)} làm tròn đến ${place} được ${D(r)} ${T[1]}.` }); },
  () => { const target = R.int(2, 30); let cands = [];
    for (let tries = 0; cands.length < 8 && tries < 100; tries++) cands.push(R.pick([`${target - 1}.${R.int(5, 9)}`, `${target}.${R.int(0, 4)}`, `${target - 1}.4${R.int(0, 9)}`, `${target}.5${R.int(0, 9)}`, `${target}.${R.int(5, 9)}`, `${target - 1}.${R.int(0, 4)}`]));
    cands = uniqBy(cands, x => x); const good = cands.filter(c => +roundDec(c, 0) === target), bad = cands.filter(c => +roundDec(c, 0) !== target);
    if (!good.length || bad.length < 3) return L19[0]();
    const g = R.pick(good);
    return sel({ prompt: `Số nào khi làm tròn đến hàng đơn vị được ${target}?`, correct: fmtDec(g), wrong: R.sample(bad, 3).map(fmtDec),
      explain: `${D(g)} → ${target}. Số làm tròn được ${target} phải từ ${D(`${target - 1}.5`)} đến dưới ${D(`${target}.5`)}.` }); }
];

/* ---------- lessons & units ---------- */
const tip = (...lines) => lines.map(l => `<div class="ctx">${l}</div>`).join('');
const LESSONS = [
  { id: 6, page: 17, unit: 0, title: 'Giới thiệu về tỉ số', gens: L6,
    tip: tip(`Tỉ số của hai số a và b (b khác 0) là thương trong phép chia a cho b. Kí hiệu: a : b hay ${F('a', 'b')}.`, `Viết đúng thứ tự: tỉ số của 3 và 4 là 3 : 4, khác với 4 : 3.`) },
  { id: 7, page: 20, unit: 0, title: 'Tìm hai số khi biết tổng và tỉ số', gens: L7,
    tip: tip('Vẽ sơ đồ đoạn thẳng.', '1. Tổng số phần bằng nhau. 2. Giá trị một phần = tổng : số phần. 3. Số bé = giá trị một phần × số phần của số bé; số lớn tương tự (hoặc lấy tổng − số bé).') },
  { id: 8, page: 23, unit: 0, title: 'Tìm hai số khi biết hiệu và tỉ số', gens: L8,
    tip: tip('Vẽ sơ đồ đoạn thẳng.', '1. Hiệu số phần bằng nhau. 2. Giá trị một phần = hiệu : hiệu số phần. 3. Tính số bé, số lớn (hoặc số lớn = số bé + hiệu).') },
  { id: 9, page: 26, unit: 0, title: 'Bài toán liên quan đến quan hệ phụ thuộc', gens: L9,
    tip: tip('Khi đại lượng này gấp lên (giảm đi) bao nhiêu lần thì đại lượng kia cũng gấp lên (giảm đi) bấy nhiêu lần.', '<b>Cách 1 – Rút về đơn vị:</b> tính giá trị của 1 đơn vị rồi nhân. <b>Cách 2 – Tìm tỉ số:</b> tìm xem gấp lên mấy lần rồi nhân.') },
  { id: 10, page: 29, unit: 0, title: 'Luyện tập', gens: [L6[2], L6[5], L7[1], L8[1], L9[2], L9[0], ...L10extra], tip: tip('Ôn lại tỉ số, bài toán tổng – tỉ, hiệu – tỉ và quan hệ phụ thuộc.') },
  { id: 11, page: 31, unit: 1, title: 'Hỗn số', gens: L11,
    tip: tip(`${M(2, 3, 4)} gọi là hỗn số, đọc là “hai và ba phần tư”. Phần nguyên là 2, phần phân số là ${F(3, 4)}.`, `Phần phân số của hỗn số bao giờ cũng bé hơn đơn vị. ${M(2, 3, 4)} = 2 + ${F(3, 4)} = ${F('2 × 4 + 3', 4)} = ${F(11, 4)}.`) },
  { id: 12, page: 33, unit: 1, title: 'Phân số thập phân', gens: L12,
    tip: tip(`Các phân số có mẫu số là 10, 100, 1 000, … gọi là phân số thập phân, ví dụ ${F(7, 10)}, ${F(8, 100)}, ${F(31, 1000)}.`, `Có thể nhân (hoặc chia) cả tử và mẫu với cùng một số để được phân số thập phân: ${F(3, 4)} = ${F(75, 100)}; ${F(42, 60)} = ${F(7, 10)}.`) },
  { id: 13, page: 35, unit: 1, title: 'Số thập phân', gens: L13,
    tip: tip(`${F(1, 10)} được viết thành 0,1, đọc là “không phẩy một”.`, `${F(3, 10)} = 0,3. Các số 0,1; 0,3; … gọi là số thập phân. Chữ số sau dấu phẩy thuộc hàng phần mười.`) },
  { id: 14, page: 37, unit: 1, title: 'Số thập phân (tiếp theo)', gens: L14,
    tip: tip(`${F(1, 100)} = 0,01, đọc là “không phẩy không một”.`, `${F(23, 100)} = 0,23, đọc là “không phẩy hai mươi ba”. Chữ số thứ hai sau dấu phẩy thuộc hàng phần trăm.`) },
  { id: 15, page: 39, unit: 1, title: 'Số thập phân (tiếp theo)', gens: L15,
    tip: tip(`${F(1, 1000)} = 0,001, đọc là “không phẩy không không một”.`, `${F(249, 1000)} = 0,249, đọc là “không phẩy hai trăm bốn mươi chín”. Chữ số thứ ba sau dấu phẩy thuộc hàng phần nghìn.`) },
  { id: 16, page: 41, unit: 1, title: 'Số thập phân (tiếp theo)', gens: L16,
    tip: tip('Mỗi số thập phân gồm phần nguyên và phần thập phân, phân cách bởi dấu phẩy. Ví dụ 123,567: phần nguyên 123, phần thập phân 567.', 'Mỗi đơn vị của một hàng bằng 10 đơn vị của hàng thấp hơn liền sau. Đọc (viết) từ hàng cao đến hàng thấp: phần nguyên, “phẩy”, phần thập phân.') },
  { id: 17, page: 44, unit: 2, title: 'Số thập phân bằng nhau', gens: L17,
    tip: tip('Viết thêm chữ số 0 vào bên phải phần thập phân thì được số thập phân bằng nó: 0,5 = 0,50 = 0,500.', 'Bỏ chữ số 0 ở tận cùng bên phải phần thập phân thì được số bằng nó: 0,9000 = 0,9. Số tự nhiên: 68 = 68,0 = 68,00.') },
  { id: 18, page: 46, unit: 2, title: 'So sánh các số thập phân', gens: L18,
    tip: tip('Phần nguyên khác nhau: số nào có phần nguyên lớn hơn thì lớn hơn.', 'Phần nguyên bằng nhau: so sánh lần lượt hàng phần mười, phần trăm, phần nghìn… đến khi gặp cặp chữ số khác nhau. Phần nguyên và phần thập phân đều bằng nhau thì hai số bằng nhau.') },
  { id: 19, page: 49, unit: 2, title: 'Làm tròn số thập phân', gens: L19,
    tip: tip('Xét chữ số ngay sau hàng cần làm tròn: bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên.', 'Ví dụ: 6,2 → 6; 6,7 → 7; 6,5 → 7 (quy ước). 3,63 → 3,6; 3,65 → 3,7; 3,175 → 3,18.') }
];
const UNITS = [
  { title: 'Phần 1 · Tỉ số và các bài toán', sub: 'Bài 6–10: tỉ số, tổng – tỉ, hiệu – tỉ, quan hệ phụ thuộc', color: 'u1' },
  { title: 'Phần 2 · Hỗn số và số thập phân', sub: 'Bài 11–16: hỗn số, phân số thập phân, số thập phân', color: 'u2' },
  { title: 'Phần 3 · So sánh và làm tròn', sub: 'Bài 17–19: số thập phân bằng nhau, so sánh, làm tròn', color: 'u3' }
];

/* Build a round of `n` questions for a lesson, cycling through its generators so every kind shows up. */
function buildRound(lessonIds, n) {
  const gens = [];
  lessonIds.forEach(id => { const L = LESSONS.find(l => l.id === id); L.gens.forEach(g => gens.push([g, L])); });
  const out = []; let bag = [];
  while (out.length < n) {
    if (!bag.length) bag = R.shuffle(gens);
    const [g, L] = bag.pop();
    out.push(makeQ(g, L));
  }
  return out;
}
function makeQ(g, L) {
  const q = g();
  q.src = `SGK Toán 5 · Bài ${L.id} · trang ${L.page}`;
  q.lesson = L.id;
  return q;
}
function nextQuestion(lessonIds) {
  const L = LESSONS.find(l => l.id === R.pick(lessonIds));
  return makeQ(R.pick(L.gens), L);
}

Object.assign(MG, { LESSONS, UNITS, buildRound, nextQuestion, _gens: { L6, L7, L8, L9, L10extra, L11, L12, L13, L14, L15, L16, L17, L18, L19 } });
})(typeof window !== 'undefined' ? window.MG : globalThis.MG);
