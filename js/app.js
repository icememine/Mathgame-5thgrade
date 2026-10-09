/* Game shell: onboarding, learning path, lesson engine, practice, quests, profile.
   Progress is kept in localStorage (per device); everything else is generated fresh each round. */
(function (MG) {
'use strict';
const { LESSONS, UNITS, buildRound, nextQuestion, checkInput, answerHTML, fmtInt, fmtDec, R } = MG;

/* ---------- icons ---------- */
const I = {
  flame: '<path d="M12 2.5c.8 3.2 4.8 5.3 4.8 10a4.8 4.8 0 0 1-9.6 0c0-2 .9-3.4 1.9-4.4.1 1.4.8 2.4 1.9 2.8-.2-3 .2-5.6 1-8.4z" fill="currentColor"/>',
  heart: '<path d="M12 20.5s-7.2-4.4-9.1-8.8C1.6 8.6 3.6 5 7 5c2 0 3.3 1.1 4.1 2.3h1.8C13.7 6.1 15 5 17 5c3.4 0 5.4 3.6 4.1 6.7C19.2 16.1 12 20.5 12 20.5z" fill="currentColor"/>',
  bolt: '<path d="M13.2 2 4.5 13.6h6.6L10 22l9.5-12.2h-6.9L13.2 2z" fill="currentColor"/>',
  check: '<path d="M5 12.5l4.6 4.6L19 7.6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  x: '<path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2.4"/>',
  star: '<path d="M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z" fill="currentColor"/>',
  chest: '<rect x="3" y="9" width="18" height="11" rx="2.5" fill="currentColor"/><path d="M3 11V8.5A3.5 3.5 0 0 1 6.5 5h11A3.5 3.5 0 0 1 21 8.5V11" fill="currentColor" opacity=".7"/><rect x="10" y="10" width="4" height="5" rx="1" fill="var(--surface)"/>',
  trophy: '<path d="M7 3h10v5a5 5 0 0 1-10 0V3z" fill="currentColor"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" fill="none" stroke="currentColor" stroke-width="2"/><rect x="10.5" y="12.5" width="3" height="4" fill="currentColor"/><rect x="7.5" y="16.5" width="9" height="3.5" rx="1.2" fill="currentColor"/>',
  home: '<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1v-9.5z" fill="currentColor"/>',
  target: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/>',
  user: '<circle cx="12" cy="8" r="4.2" fill="currentColor"/><path d="M4 20.5c.8-4 4-6.2 8-6.2s7.2 2.2 8 6.2" fill="currentColor"/>',
  book: '<path d="M4 4.5h6a2 2 0 0 1 2 2V20a2 2 0 0 0-2-2H4V4.5zM20 4.5h-6a2 2 0 0 0-2 2V20a2 2 0 0 1 2-2h6V4.5z" fill="currentColor"/>',
  dumbbell: '<rect x="2" y="9" width="3" height="6" rx="1" fill="currentColor"/><rect x="5" y="7" width="3" height="10" rx="1" fill="currentColor"/><rect x="16" y="7" width="3" height="10" rx="1" fill="currentColor"/><rect x="19" y="9" width="3" height="6" rx="1" fill="currentColor"/><rect x="8" y="11" width="8" height="2" fill="currentColor"/>',
  sparkle: '<path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z" fill="currentColor"/>',
  flag: '<path d="M5 21V4M5 4.5h11l-2 3.5 2 3.5H5" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  clock: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M12 7v5.5l3.5 2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  chev: '<path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  doc: '<path d="M6 2.5h8l4.5 4.5V20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V4A1.5 1.5 0 0 1 6 2.5z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 12h8M8 16h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  undo: '<path d="M9 7H4V2M4.5 7A8 8 0 1 1 4 13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  sound: '<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
};
const ic = (n, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* Mascot: Bi the elephant, a nod to the textbook's elephant friend. */
const mascot = (size = 96, mood = 'happy') => `
<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
  <ellipse cx="20" cy="44" rx="18" ry="22" fill="#8CC4F2"/><ellipse cx="80" cy="44" rx="18" ry="22" fill="#8CC4F2"/>
  <ellipse cx="21" cy="45" rx="10" ry="14" fill="#F6B3C4"/><ellipse cx="79" cy="45" rx="10" ry="14" fill="#F6B3C4"/>
  <ellipse cx="50" cy="48" rx="30" ry="29" fill="#64AEEA"/>
  <path d="M43 60c0 14-2 22-9 27-3 2-1 6 3 5 9-3 14-13 15-31z" fill="#64AEEA"/>
  <circle cx="39" cy="42" r="8" fill="#fff"/><circle cx="61" cy="42" r="8" fill="#fff"/>
  ${mood === 'sad'
    ? '<circle cx="39" cy="45" r="4" fill="#17304A"/><circle cx="61" cy="45" r="4" fill="#17304A"/><path d="M31 31l13 4M69 31l-13 4" stroke="#17304A" stroke-width="3" stroke-linecap="round"/><path d="M53 70q6-4 11 0" fill="none" stroke="#17304A" stroke-width="3" stroke-linecap="round"/>'
    : '<circle cx="40" cy="43" r="4.5" fill="#17304A"/><circle cx="62" cy="43" r="4.5" fill="#17304A"/><circle cx="41.5" cy="41.5" r="1.5" fill="#fff"/><circle cx="63.5" cy="41.5" r="1.5" fill="#fff"/><path d="M54 66q6 6 12 0" fill="none" stroke="#17304A" stroke-width="3" stroke-linecap="round"/>'}
  <circle cx="30" cy="56" r="4" fill="#F27E8E" opacity=".45"/><circle cx="70" cy="56" r="4" fill="#F27E8E" opacity=".45"/>
  <path d="M42 20q8-8 16 0" fill="none" stroke="#3D8BCB" stroke-width="3" stroke-linecap="round"/>
</svg>`;

/* ---------- persistence ---------- */
const KEY = 'toan5-chuong1.v1';
const fresh = () => ({ name: '', goal: 20, xp: 0, streak: 0, lastDay: null, days: [], lessons: {}, chests: {}, trophy: 0, wrong: {}, today: null, sound: true, unlockAll: false, onboarded: false });
let P = fresh();
try { const raw = localStorage.getItem(KEY); if (raw) P = Object.assign(fresh(), JSON.parse(raw)); } catch (e) { /* storage blocked: play without saving */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { /* ignore */ } };

const dayKey = (off = 0) => { const d = new Date(); d.setDate(d.getDate() + off); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const streakNow = () => (P.lastDay === dayKey() || P.lastDay === dayKey(-1)) ? P.streak : 0;
function today() { if (!P.today || P.today.day !== dayKey()) P.today = { day: dayKey(), xp: 0, perfect: 0, correct: 0 }; return P.today; }
function touchStreak() {
  const t = dayKey(); if (P.lastDay === t) return;
  P.streak = P.lastDay === dayKey(-1) ? P.streak + 1 : 1; P.lastDay = t;
  P.days = [...P.days.filter(d => d !== t), t].slice(-60);
}

/* ---------- sound ---------- */
let AC = null;
function beep(notes) {
  if (!P.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    let t = AC.currentTime;
    notes.forEach(([f, d, type = 'sine']) => {
      const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + .02); t += d * .8;
    });
  } catch (e) { /* no audio */ }
}
const SFX = { right: () => beep([[660, .12], [990, .18]]), wrong: () => beep([[220, .22, 'square']]), done: () => beep([[523, .14], [659, .14], [784, .14], [1047, .3]]) };

/* ---------- path model ---------- */
const NODES = [];
UNITS.forEach((u, ui) => {
  LESSONS.filter(l => l.unit === ui).forEach(l => NODES.push({ key: 'L' + l.id, kind: 'lesson', id: l.id, unit: ui }));
  NODES.push({ key: 'C' + ui, kind: 'chest', unit: ui });
});
NODES.push({ key: 'T', kind: 'trophy', unit: UNITS.length - 1 });
const lessonById = id => LESSONS.find(l => l.id === id);
const unitLessonIds = ui => LESSONS.filter(l => l.unit === ui).map(l => l.id);
const isDone = n => n.kind === 'lesson' ? (P.lessons[n.id]?.stars || 0) > 0 : n.kind === 'chest' ? !!P.chests[n.unit] : P.trophy > 0;
const isOpen = i => P.unlockAll || i === 0 || isDone(NODES[i - 1]);
const currentIdx = () => { const i = NODES.findIndex((n, k) => isOpen(k) && !isDone(n)); return i; };
function nodeInfo(n) {
  if (n.kind === 'lesson') { const L = lessonById(n.id); return { title: `Bài ${L.id} · ${L.title}`, sub: `SGK trang ${L.page} · 8 câu`, ids: [L.id], count: 8, xp: isDone(n) ? 5 : 10 }; }
  if (n.kind === 'chest') { const ids = unitLessonIds(n.unit); return { title: `Rương ôn tập ${UNITS[n.unit].title.split(' · ')[0]}`, sub: `8 câu trộn từ bài ${ids[0]}–${ids[ids.length - 1]}`, ids, count: 8, xp: isDone(n) ? 10 : 20 }; }
  return { title: 'Kiểm tra Chương I', sub: '12 câu trộn từ bài 6–19', ids: LESSONS.map(l => l.id), count: 12, xp: isDone(n) ? 15 : 30 };
}

/* ---------- runtime state ---------- */
const S = { screen: P.onboarded ? 'main' : 'welcome', tab: 'learn', popover: null, modal: null, sess: null, result: null, nameDraft: P.name, goalDraft: P.goal, tipLesson: null };
const app = document.getElementById('app');

/* ---------- onboarding ---------- */
function vWelcome() {
  return `<div class="ob"><div class="welcome">${mascot(150)}
      <h1>Toán 5 vui</h1>
      <p>Học Toán lớp 5 mỗi ngày một chút cùng voi Bi. Câu hỏi bám sát SGK Toán 5 – Cánh Diều, Chương I, bài 6–19.</p></div>
    <div class="stack"><button class="btn" data-go="name">Bắt đầu</button></div></div>`;
}
const obTop = (pct, back) => `<div class="ob-top"><button class="iconbtn" data-go="${back}" aria-label="Quay lại">${ic('chev')}</button><div class="bar"><i style="width:${pct}%"></i></div></div>`;
function vName() {
  return `<div class="ob">${obTop(40, 'welcome')}
    <div class="mascot-row">${mascot(72)}<div class="bubble">Chào bạn! Bạn tên là gì?</div></div>
    <input class="name-in" id="nameIn" maxlength="24" autocomplete="off" placeholder="Tên của em" value="${esc(S.nameDraft)}">
    <div class="ob-foot"><button class="btn" data-go="goal" ${S.nameDraft.trim() ? '' : 'disabled'}>Tiếp tục</button></div></div>`;
}
function vGoal() {
  const goals = [[10, 'Nhẹ nhàng', 'khoảng 1 bài'], [20, 'Đều đặn', 'khoảng 2 bài'], [30, 'Chăm chỉ', 'khoảng 3 bài'], [50, 'Siêu sao', 'khoảng 5 bài']];
  return `<div class="ob">${obTop(80, 'name')}
    <div class="mascot-row">${mascot(72)}<div class="bubble">Mỗi ngày ${esc(S.nameDraft.trim())} muốn đạt bao nhiêu điểm?</div></div>
    <div class="choices">${goals.map(([x, t, d]) => `<button class="choice" data-goal="${x}" aria-pressed="${S.goalDraft === x}"><span>${t}<small>${d}</small></span><span class="right">${x} XP / ngày</span></button>`).join('')}</div>
    <div class="ob-foot"><button class="btn" data-act="finish-ob">Vào học thôi!</button></div></div>`;
}

/* ---------- main chrome ---------- */
function statusBar() {
  const st = streakNow();
  return `<div class="status">
    <span class="course-chip"><span class="badge">T5</span>Chương I · Bài 6–19</span>
    <div style="display:flex;gap:2px">
      <span class="stat fire ${st ? '' : 'off'}" title="Chuỗi ngày học">${ic('flame')}${st}</span>
      <span class="stat xp" title="Tổng điểm XP">${ic('bolt')}${fmtInt(P.xp)}</span>
    </div></div>`;
}
const TABS = [['learn', 'Học', 'home'], ['practice', 'Luyện', 'dumbbell'], ['quests', 'Nhiệm vụ', 'target'], ['profile', 'Hồ sơ', 'user']];
const tabBar = () => `<nav class="tabs">${TABS.map(([k, l, i]) => `<button class="tab" data-tab="${k}" aria-current="${S.tab === k}">${ic(i)}${l}</button>`).join('')}</nav>`;
const starsHTML = (n, cls) => `<span class="${cls}">${[1, 2, 3].map(i => `<span class="${i <= n ? '' : 'off'}">${ic('star')}</span>`).join('')}</span>`;

/* ---------- learning path ---------- */
function vLearn() {
  const zig = [0, -60, -84, -60, 0, 60, 84, 60], cur = currentIdx();
  let html = '', k = 0;
  UNITS.forEach((u, ui) => {
    const unitNodes = NODES.map((n, i) => [n, i]).filter(([n]) => n.unit === ui && (n.kind !== 'trophy'));
    if (ui === UNITS.length - 1) unitNodes.push([NODES[NODES.length - 1], NODES.length - 1]);
    const unitOpen = isOpen(unitNodes[0][1]);
    html += `<div class="unit ${u.color} ${unitOpen ? '' : 'locked'}"><div><h3>${u.title}</h3><p>${u.sub}</p></div><button class="guide" data-unit-tip="${ui}" aria-label="Ghi nhớ ${u.title}">${ic('book')}</button></div><div class="path">`;
    unitNodes.forEach(([n, i]) => {
      const st = isDone(n) ? 'done' : isOpen(i) ? 'current' : 'locked', open = S.popover === n.key, z = zig[k++ % zig.length], info = nodeInfo(n);
      const label = n.kind === 'lesson' ? (st === 'locked' ? ic('lock') : n.id) : ic(n.kind);
      const stars = n.kind === 'lesson' && st === 'done' ? starsHTML(P.lessons[n.id].stars, 'node-stars') : '';
      const dx = `--dx:${-z}px;`;
      const pop = !open ? '' : st === 'locked'
        ? `<div class="pop locked" style="${dx}--pop-arrow:var(--surface)"><h4>${info.title}</h4><p style="color:var(--muted)">Hoàn thành các bài phía trên để mở khoá.</p><button class="btn" disabled>Đang khoá</button></div>`
        : `<div class="pop ${st === 'done' ? 'done' : ''}" style="${dx}--pop-arrow:var(--${st === 'done' ? 'gold' : 'jade'})"><h4>${info.title}</h4><p>${info.sub}${st === 'done' && n.kind === 'lesson' ? ' · đã xong, ôn lại để lấy 3 sao' : ''}</p>
           <button class="btn" data-start="${n.key}">${st === 'done' ? 'Học lại' : 'Bắt đầu'} · +${info.xp} XP</button>${n.kind === 'lesson' ? `<button class="linkbtn" data-tip="${n.id}">Xem ghi nhớ</button>` : ''}</div>`;
      html += `<div class="node-wrap ${i === cur && !open ? 'is-current' : ''}" style="transform:translateX(${z}px);${open ? 'z-index:4' : ''}">
        ${i === cur && !open ? '<div class="start-tip">BẮT ĐẦU</div><div class="ring"></div>' : ''}
        <button class="node ${st} ${n.kind === 'lesson' ? '' : n.kind}" data-node="${n.key}" aria-label="${esc(info.title)}">${label}</button>${stars}${pop}</div>`;
    });
    html += `${ui === 0 ? `<div class="path-mascot">${mascot(84)}</div>` : ''}</div>`;
  });
  return `${statusBar()}<div class="scroll" data-keep-scroll>${html}<div style="height:24px"></div></div>${tabBar()}`;
}

/* ---------- session engine ---------- */
function prep(q) { if (q.type === 'match') q._r = R.shuffle(q.right.map((_, i) => i)); return q; }
function startSession(opts) {
  const qs = opts.endless ? [prep(nextQuestion(opts.ids))] : buildRound(opts.ids, opts.count).map(prep);
  S.sess = Object.assign({ queue: qs, total: qs.length, pos: 0, hearts: opts.endless ? Infinity : 5, mistakes: new Set(), wrongCount: 0, solved: new Set(), answered: 0, correct: 0,
    combo: 0, maxCombo: 0, t0: Date.now(), checked: null, flash: null }, opts);
  resetAnswer(); S.screen = 'lesson'; S.modal = null; S.popover = null;
}
function resetAnswer() { const L = S.sess; L.answer = null; L.vals = []; L.seq = []; L.match = { sel: null, done: {}, bad: null, errors: 0 }; L.checked = null; }
const curQ = () => S.sess.queue[S.sess.pos];

function vQuestion(q) {
  const L = S.sess, lock = L.checked ? 'disabled' : '';
  const optCls = i => !L.checked ? '' : i === q.answer ? 'right' : L.answer === i ? 'wrong' : '';
  const ctx = q.ctx ? `<div class="ctx">${q.ctx}</div>` : '';
  if (q.type === 'select') return `<h2>${q.prompt}</h2>${ctx}<div class="opts">${q.options.map((o, i) => `<button class="opt ${optCls(i)}" data-ans="${i}" aria-pressed="${L.answer === i}" ${lock}><span class="key">${i + 1}</span><span>${o}</span></button>`).join('')}</div>`;
  if (q.type === 'tf') {
    const c = v => !L.checked ? '' : v === q.answer ? 'right' : L.answer === v ? 'wrong' : '';
    return `<div class="ctx" style="font-size:18px">${q.prompt}${q.ctx || ''}</div><div class="tf">
      <button class="opt ${c(true)}" data-ans="true" aria-pressed="${L.answer === true}" ${lock} style="color:var(--jade)">${ic('check')}Đúng</button>
      <button class="opt ${c(false)}" data-ans="false" aria-pressed="${L.answer === false}" ${lock} style="color:var(--coral)">${ic('x')}Sai</button></div>`;
  }
  if (q.type === 'compare') {
    const shown = L.answer === null ? '?' : q.options[L.answer];
    return `<h2>${q.prompt}</h2>${ctx}<div class="cmp-line"><span class="num">${fmtDec(q.a)}</span><span class="slot">${shown}</span><span class="num">${fmtDec(q.b)}</span></div>
      <div class="cmp">${q.options.map((o, i) => `<button class="opt ${optCls(i)}" data-ans="${i}" aria-pressed="${L.answer === i}" ${lock} aria-label="${['lớn hơn', 'bé hơn', 'bằng'][i]}">${o.replace('<', '&lt;').replace('>', '&gt;')}</button>`).join('')}</div>`;
  }
  if (q.type === 'input') {
    const s = q.spec, v = i => esc(L.vals[i] ?? '');
    const box = (i, cls, mode) => `<input class="box ${cls || ''}" data-box="${i}" inputmode="${mode}" autocomplete="off" enterkeyhint="done" aria-label="Ô trả lời ${i + 1}" value="${v(i)}" ${lock}>`;
    let a;
    if (s.mode === 'num') a = `<div class="ans num">${box(0, '', 'decimal')}${s.unit ? `<span class="unit-l">${s.unit}</span>` : ''}<p class="hint">Dùng dấu phẩy cho số thập phân, ví dụ 0,25.</p></div>`;
    else if (s.mode === 'frac') a = `<div class="ans"><div class="fracbox">${box(0, '', 'numeric')}<hr>${box(1, '', 'numeric')}</div><p class="hint">Điền tử số ở trên, mẫu số ở dưới.</p></div>`;
    else a = `<div class="ans">${box(0, 'wholebox', 'numeric')}<div class="fracbox">${box(1, '', 'numeric')}<hr>${box(2, '', 'numeric')}</div><p class="hint">Phần nguyên bên trái, phần phân số bên phải.</p></div>`;
    return `<h2>${q.prompt}</h2>${ctx}${a}`;
  }
  if (q.type === 'match') {
    const M = L.match, doneR = Object.values(M.done);
    return `<h2>${q.prompt}</h2><div class="match"><div class="col">${q.left.map((t, i) => `<button class="tile ${M.done[i] !== undefined ? 'ok' : ''} ${M.bad && M.bad[0] === i ? 'bad' : ''}" data-ml="${i}" aria-pressed="${M.sel === i}" ${M.done[i] !== undefined ? 'disabled' : ''}>${t}</button>`).join('')}</div>
      <div class="col">${q._r.map(j => `<button class="tile ${doneR.includes(j) ? 'ok' : ''} ${M.bad && M.bad[1] === j ? 'bad' : ''}" data-mr="${j}" ${doneR.includes(j) ? 'disabled' : ''}>${q.right[j]}</button>`).join('')}</div></div>
      <p class="src">Chọn một ô bên trái, rồi chọn ô tương ứng bên phải.</p>`;
  }
  if (q.type === 'order') {
    return `<h2>${q.prompt}</h2>${ctx}<div class="order-slots" aria-label="Thứ tự em chọn">${L.seq.length ? L.seq.map((i, k) => `<button class="tile" data-unseq="${k}" ${lock}>${q.items[i]}</button>`).join('') : '<span class="ph">Chạm vào các số bên dưới theo thứ tự…</span>'}</div>
      <div class="order-pool">${q.items.map((t, i) => `<button class="tile ${L.seq.includes(i) ? 'used' : ''}" data-seq="${i}" ${lock}>${t}</button>`).join('')}</div>
      ${L.seq.length && !L.checked ? `<button class="linkbtn" data-act="clear-seq">${ic('undo')} Làm lại</button>` : ''}`;
  }
  return '';
}
function ready(q) {
  const L = S.sess;
  if (q.type === 'input') { const n = q.spec.mode === 'num' ? 1 : q.spec.mode === 'frac' ? 2 : 3; for (let i = 0; i < n; i++) if (!String(L.vals[i] ?? '').trim()) return false; return true; }
  if (q.type === 'match') return Object.keys(L.match.done).length === q.left.length;
  if (q.type === 'order') return L.seq.length === q.items.length;
  return L.answer !== null;
}
function correctText(q) {
  if (q.type === 'tf') return q.answer ? 'Đúng' : 'Sai';
  if (q.type === 'input') return answerHTML(q.spec);
  if (q.type === 'order') return q.answer.map(i => q.items[i]).join(' ; ');
  if (q.type === 'compare') return `${fmtDec(q.a)} ${q.options[q.answer].replace('<', '&lt;').replace('>', '&gt;')} ${fmtDec(q.b)}`;
  return q.options[q.answer];
}
function vFoot(q) {
  const L = S.sess;
  if (!L.checked) return `<div class="foot"><button class="btn" data-act="check" ${ready(q) ? '' : 'disabled'}>Kiểm tra</button></div>`;
  const ok = L.checked === 'right', praise = R.pick(['Chính xác!', 'Tuyệt vời!', 'Giỏi quá!', 'Đúng rồi!']);
  return `<div class="foot ${ok ? 'right' : 'wrong'}" role="status">
    <div class="fb-head"><span class="dot">${ic(ok ? 'check' : 'x')}</span>${ok ? praise : 'Chưa đúng rồi'}</div>
    <div class="fb-body">${ok ? '' : `<p>Đáp án đúng: <b>${correctText(q)}</b></p>`}<p>${q.explain}</p></div>
    <div class="src">${ic('doc')}${q.src}</div>
    <button class="btn" data-act="next">Tiếp tục</button></div>`;
}
function vLesson() {
  const L = S.sess, q = curQ(), retry = L.mistakes.has(q) && !L.checked && !L.endless;
  const pct = L.endless ? Math.min(100, (L.combo % 10) * 10) : Math.round(L.solved.size / L.total * 100);
  const right = L.endless ? `<span class="stat combo" title="Chuỗi câu đúng">${ic('bolt')}${L.combo}</span>` : `<span class="stat heart" title="Số tim">${ic('heart')}${L.hearts}</span>`;
  return `<div class="lesson-top"><button class="iconbtn" data-act="quit" aria-label="Thoát">${ic('x')}</button>
      <div class="bar"><i style="width:${Math.max(pct, 3)}%"></i></div>${right}
      <button class="iconbtn" data-tip="${q.lesson}" aria-label="Xem ghi nhớ">${ic('book')}</button></div>
    <div class="scroll"><div class="q"><div class="q-kind ${retry ? 'retry' : ''}">${retry ? 'Làm lại câu sai' : q.kind}</div>${vQuestion(q)}</div></div>
    ${vFoot(q)}${L.flash ? `<div class="combo-pop">${L.flash}</div>` : ''}`;
}
function grade() {
  const L = S.sess, q = curQ(); let ok;
  if (q.type === 'input') ok = checkInput(q.spec, L.vals);
  else if (q.type === 'match') ok = L.match.errors === 0;
  else if (q.type === 'order') ok = L.seq.every((v, i) => v === q.answer[i]);
  else ok = L.answer === q.answer;
  L.checked = ok ? 'right' : 'wrong'; L.answered++; L.flash = null;
  const day = today();
  if (ok) {
    L.correct++; L.combo++; L.maxCombo = Math.max(L.maxCombo, L.combo); L.solved.add(q); day.correct++;
    if (L.combo > 0 && L.combo % 5 === 0) L.flash = `${L.combo} câu đúng liên tiếp!`;
    SFX.right();
  } else {
    L.combo = 0; L.mistakes.add(q); L.wrongCount++; P.wrong[q.lesson] = (P.wrong[q.lesson] || 0) + 1;
    if (q.type === 'match') L.solved.add(q);      // pairs end up matched anyway; count it as a mistake, no replay
    else if (!L.endless) { L.hearts--; L.queue.push(q); }
    SFX.wrong();
  }
  save();
}
function next() {
  const L = S.sess;
  if (!L.endless && L.hearts <= 0) { S.modal = 'hearts'; return; }
  L.pos++; resetAnswer();
  if (L.endless) { if (L.pos >= L.queue.length) L.queue.push(prep(nextQuestion(L.ids))); return; }
  if (L.pos >= L.queue.length) finish();
}
function finish() {
  const L = S.sess, secs = Math.round((Date.now() - L.t0) / 1000), time = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  const acc = L.answered ? Math.round(L.correct / L.answered * 100) : 0, day = today();
  let xp, stars = 0, perfect = false;
  if (L.endless) xp = L.correct;
  else {
    perfect = L.mistakes.size === 0; stars = perfect ? 3 : L.mistakes.size <= 2 ? 2 : 1;
    xp = L.xp + (perfect ? 5 : 0);
    if (L.node.kind === 'lesson') { const prev = P.lessons[L.node.id] || { stars: 0, plays: 0 }; P.lessons[L.node.id] = { stars: Math.max(prev.stars, stars), plays: prev.plays + 1 }; }
    else if (L.node.kind === 'chest') P.chests[L.node.unit] = 1;
    else P.trophy = Math.max(P.trophy, acc);
    if (perfect) day.perfect = 1;
  }
  P.xp += xp; day.xp += xp; if (L.answered) touchStreak(); save();
  S.result = { xp, acc, time, stars, perfect, endless: L.endless, correct: L.correct, answered: L.answered, maxCombo: L.maxCombo, title: L.title };
  S.screen = 'result'; S.sess = null; SFX.done();
}

/* ---------- result ---------- */
function vResult() {
  const Rr = S.result, labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const week = [...Array(7)].map((_, i) => { const off = i - 6, d = new Date(); d.setDate(d.getDate() + off); return { lab: labels[d.getDay()], on: P.days.includes(dayKey(off)), today: off === 0 }; });
  const head = Rr.endless ? `Luyện tập xong!` : Rr.perfect ? 'Hoàn hảo, không sai câu nào!' : 'Hoàn thành!';
  return `<div class="result">${mascot(120)}<h2>${head}</h2>
    ${Rr.endless ? `<p style="color:var(--muted);font-weight:700">${Rr.title} · đúng ${Rr.correct}/${Rr.answered} câu · chuỗi dài nhất ${Rr.maxCombo}</p>` : starsHTML(Rr.stars, 'big-stars')}
    <div class="tiles">
      <div class="rt g"><div class="lab">Điểm XP</div><div class="val">${ic('bolt')}${Rr.xp}</div></div>
      <div class="rt j"><div class="lab">Chính xác</div><div class="val">${ic('target')}${Rr.acc}%</div></div>
      <div class="rt s"><div class="lab">Thời gian</div><div class="val">${ic('clock')}${Rr.time}</div></div></div>
    <div class="card" style="margin:0;width:100%;align-items:center">
      <div style="display:flex;align-items:center;gap:8px;font-family:var(--f-display);font-size:20px;font-weight:800;color:var(--gold-deep)">${ic('flame')}Chuỗi ${streakNow()} ngày</div>
      <div class="streak-week">${week.map(d => `<div class="day ${d.on ? 'on' : ''} ${d.today ? 'today' : ''}"><i>${d.on ? ic('check') : ''}</i>${d.lab}</div>`).join('')}</div></div></div>
  <div class="foot"><button class="btn" data-go="main">Tiếp tục</button><button class="linkbtn" data-go="quests">Xem nhiệm vụ hôm nay</button></div>
  <canvas class="confetti" id="confetti"></canvas>`;
}
function confetti() {
  const c = document.getElementById('confetti'); if (!c || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = c.getBoundingClientRect(); c.width = r.width; c.height = r.height; const x = c.getContext('2d');
  const cs = getComputedStyle(document.documentElement), cols = ['--jade', '--gold', '--sky', '--coral', '--grape'].map(v => cs.getPropertyValue(v).trim());
  const Pt = Array.from({ length: 90 }, () => ({ x: r.width / 2, y: r.height * .3, vx: (Math.random() - .5) * 9, vy: Math.random() * -9 - 3, s: Math.random() * 6 + 4, c: cols[Math.random() * cols.length | 0], a: Math.random() * 6 }));
  let f = 0; (function t() { x.clearRect(0, 0, c.width, c.height); Pt.forEach(p => { p.vy += .28; p.x += p.vx; p.y += p.vy; p.a += .15; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); }); if (++f < 110 && document.getElementById('confetti') === c) requestAnimationFrame(t); })();
}

/* ---------- practice ---------- */
const UNIT_COL = ['var(--jade)', 'var(--sky)', 'var(--grape)'];
function vPractice() {
  const learned = LESSONS.filter(l => P.lessons[l.id]?.stars).map(l => l.id);
  return `${statusBar()}<div class="scroll"><div class="page-h"><h2>Luyện tập tự do</h2><p>Câu hỏi mới liên tục, không mất tim. Mỗi câu đúng +1 XP. Chạm dấu × để kết thúc.</p></div>
    <div class="prac-list">
      <button class="prac mix" data-prac="mix" ${learned.length ? '' : 'disabled style="opacity:.6"'}><span class="no" style="background:rgba(255,255,255,.2)">${ic('sparkle')}</span><span class="body">Trộn các bài đã học<small>${learned.length ? `${learned.length} bài` : 'Học xong ít nhất 1 bài để mở'}</small></span></button>
      ${LESSONS.map(l => `<button class="prac" data-prac="${l.id}"><span class="no" style="background:${UNIT_COL[l.unit]}">${l.id}</span><span class="body">${l.title}<small>SGK trang ${l.page}</small></span>${starsHTML(P.lessons[l.id]?.stars || 0, 'stars')}</button>`).join('')}
    </div></div>${tabBar()}`;
}

/* ---------- quests ---------- */
const qbar = (v, max, fill) => `<div class="qbar"><i style="width:${Math.min(1, v / max) * 100}%;${fill ? `background:${fill}` : ''}"></i><span>${Math.min(v, max)} / ${max}</span></div>`;
function vQuests() {
  const d = today(), done = NODES.filter(n => n.kind === 'lesson' && isDone(n)).length, total = LESSONS.length;
  const qs = [['bolt', `Đạt mục tiêu ${P.goal} XP`, d.xp, P.goal, 'var(--gold)'], ['target', 'Hoàn thành 1 bài không sai câu nào', d.perfect, 1, 'var(--jade)'], ['check', 'Trả lời đúng 20 câu', d.correct, 20, 'var(--sky)']];
  return `${statusBar()}<div class="scroll">
    <div class="card goal-card"><span class="chip" style="background:rgba(255,255,255,.2);color:#fff;align-self:flex-start">Chương I</span>
      <h3 style="color:#fff">Chinh phục bài 6–19</h3><p style="font-weight:600;font-size:14px;opacity:.95">Hoàn thành ${total} bài, 3 rương ôn tập và bài kiểm tra để nhận cúp Chương I.</p>${qbar(done, total, '#fff')}<span class="count">Đã xong ${done} / ${total} bài</span></div>
    <div class="section-label">Nhiệm vụ hôm nay · làm mới lúc 0 giờ</div>
    <div class="card">${qs.map(([i, t, v, m, c]) => `<div class="quest"><span class="qi" style="background:${c}">${ic(i)}</span><div class="body">${t}${qbar(v, m)}</div><span style="color:${v >= m ? 'var(--gold-deep)' : 'var(--locked-deep)'}">${ic('chest')}</span></div>`).join('')}</div>
    <div class="section-label">Thành tích</div>
    <div class="card">${[[`Rương ôn tập`, `${Object.keys(P.chests).length} / ${UNITS.length}`, 'chest'], ['Bài kiểm tra Chương I', P.trophy ? `Đã làm · ${P.trophy}% đúng` : 'Chưa làm', 'trophy']].map(([t, s, i]) => `<div class="row"><span style="color:var(--gold-deep)">${ic(i)}</span><div class="body"><b>${t}</b><small>${s}</small></div></div>`).join('')}</div>
  </div>${tabBar()}`;
}

/* ---------- profile ---------- */
function vProfile() {
  const done = LESSONS.filter(l => P.lessons[l.id]?.stars).length, stars = LESSONS.reduce((s, l) => s + (P.lessons[l.id]?.stars || 0), 0);
  const weak = Object.entries(P.wrong).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, n]) => [lessonById(+id), n]).filter(x => x[0]);
  return `${statusBar()}<div class="scroll">
    <div class="prof-head"><span class="avatar">${esc((P.name || 'B').trim().charAt(0).toUpperCase())}</span><div><h2 style="font-size:22px">${esc(P.name || 'Bạn nhỏ')}</h2><small>Lớp 5 · Mục tiêu ${P.goal} XP mỗi ngày</small></div></div>
    <div class="statgrid">
      <div class="sg"><span style="color:var(--gold-deep)">${ic('flame')}</span><div><b>${streakNow()}</b><small>Ngày liên tiếp</small></div></div>
      <div class="sg"><span style="color:var(--sky)">${ic('bolt')}</span><div><b>${fmtInt(P.xp)}</b><small>Tổng XP</small></div></div>
      <div class="sg"><span style="color:var(--jade)">${ic('book')}</span><div><b>${done} / ${LESSONS.length}</b><small>Bài đã học</small></div></div>
      <div class="sg"><span style="color:var(--gold)">${ic('star')}</span><div><b>${stars} / ${LESSONS.length * 3}</b><small>Ngôi sao</small></div></div></div>
    <div class="section-label">Cần ôn lại</div>
    <div class="card">${weak.length ? weak.map(([l, n]) => `<div class="row"><span style="color:var(--coral)">${ic('flag')}</span><div class="body"><b>Bài ${l.id} · ${l.title}</b><small>Đã trả lời sai ${n} lần</small></div><button class="btn sky" style="width:auto;padding:8px 12px;font-size:12px" data-prac="${l.id}">Luyện</button></div>`).join('') : '<p class="empty">Chưa có câu sai nào. Cố lên nhé!</p>'}</div>
    <div class="section-label">Cài đặt</div>
    <div class="card">
      <div class="row"><span style="color:var(--sky)">${ic('sound')}</span><div class="body"><b>Âm thanh</b></div><button class="switch" role="switch" aria-checked="${P.sound}" data-toggle="sound" aria-label="Âm thanh"></button></div>
      <div class="row"><span style="color:var(--gold-deep)">${ic('lock')}</span><div class="body"><b>Mở khoá tất cả bài</b><small>Dành cho phụ huynh, thầy cô</small></div><button class="switch" role="switch" aria-checked="${P.unlockAll}" data-toggle="unlockAll" aria-label="Mở khoá tất cả bài"></button></div>
      <button class="btn ghost" data-act="rename">Đổi tên, mục tiêu</button>
      <button class="linkbtn" style="color:var(--coral)" data-modal="reset">Xoá toàn bộ tiến độ</button>
    </div>
    <p class="src" style="justify-content:center;padding:0 20px 20px;text-align:center">Nội dung bám theo SGK Toán 5, tập một (Cánh Diều), Chương I, bài 6–19.</p>
  </div>${tabBar()}`;
}

/* ---------- modals ---------- */
function vModal() {
  if (S.modal === 'quit') return `<div class="scrim" data-close><div class="sheet">${mascot(90, 'sad')}<h3>${S.sess?.endless ? 'Kết thúc luyện tập?' : 'Khoan đã, đừng bỏ cuộc!'}</h3><p>${S.sess?.endless ? 'Kết quả các câu đã làm sẽ được tính.' : 'Bạn sẽ mất tiến độ của lượt học này.'}</p><div class="wide"><button class="btn" data-close>Học tiếp</button><button class="linkbtn" style="color:var(--coral)" data-act="quit-confirm">${S.sess?.endless ? 'Kết thúc' : 'Thoát'}</button></div></div></div>`;
  if (S.modal === 'hearts') return `<div class="scrim"><div class="sheet">${mascot(90, 'sad')}<h3>Bạn đã hết tim</h3><p>Không sao cả! Xem lại phần ghi nhớ rồi thử lại nhé.</p><div class="wide"><button class="btn sky" data-act="retry">Thử lại từ đầu</button><button class="linkbtn" data-act="quit-confirm">Về lộ trình</button></div></div></div>`;
  if (S.modal === 'tip') { const L = lessonById(S.tipLesson); return `<div class="scrim" data-close><div class="sheet left"><h3>Ghi nhớ · Bài ${L.id}</h3><p style="margin-top:-8px">${L.title} · SGK trang ${L.page}</p>${L.tip}<button class="btn" data-close>Đã hiểu</button></div></div>`; }
  if (S.modal === 'unit-tip') { const ls = LESSONS.filter(l => l.unit === S.tipUnit); return `<div class="scrim" data-close><div class="sheet left"><h3>${UNITS[S.tipUnit].title}</h3>${ls.map(l => `<h4 style="font-size:16px;margin-top:6px">Bài ${l.id} · ${l.title}</h4>${l.tip}`).join('')}<button class="btn" data-close>Đã hiểu</button></div></div>`; }
  if (S.modal === 'reset') return `<div class="scrim" data-close><div class="sheet">${mascot(90, 'sad')}<h3>Xoá toàn bộ tiến độ?</h3><p>Điểm XP, ngôi sao, chuỗi ngày học sẽ về 0. Không thể hoàn tác.</p><div class="wide"><button class="btn coral" data-act="reset-confirm">Xoá hết</button><button class="linkbtn" data-close>Huỷ</button></div></div></div>`;
  return '';
}

/* ---------- render ---------- */
function render() {
  const keep = app.querySelector('[data-keep-scroll]'), y = keep ? keep.scrollTop : 0;
  let html;
  if (S.screen === 'welcome') html = vWelcome();
  else if (S.screen === 'name') html = vName();
  else if (S.screen === 'goal') html = vGoal();
  else if (S.screen === 'lesson') html = vLesson();
  else if (S.screen === 'result') html = vResult();
  else html = { learn: vLearn, practice: vPractice, quests: vQuests, profile: vProfile }[S.tab]();
  app.innerHTML = html + vModal();
  const k2 = app.querySelector('[data-keep-scroll]'); if (k2 && keep) k2.scrollTop = y;
  if (S.screen === 'result') confetti();
  if (S.screen === 'name') { const n = document.getElementById('nameIn'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
  if (S.screen === 'lesson' && !S.sess.checked && !S.modal) { const b = [...app.querySelectorAll('[data-box]')].find(x => !x.value) || app.querySelector('[data-box]'); if (b) b.focus({ preventScroll: true }); }
}
function scrollToCurrent() {
  const sc = app.querySelector('[data-keep-scroll]'), n = app.querySelector('.node.current');
  if (sc && n) sc.scrollTop = Math.max(0, n.getBoundingClientRect().top - sc.getBoundingClientRect().top - sc.clientHeight / 3);
}

/* ---------- events ---------- */
app.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'nameIn') { S.nameDraft = t.value; const b = app.querySelector('[data-go="goal"]'); if (b) b.disabled = !t.value.trim(); return; }
  if (t.dataset.box !== undefined && S.sess) { S.sess.vals[+t.dataset.box] = t.value; const b = app.querySelector('[data-act="check"]'); if (b) b.disabled = !ready(curQ()); }
});
app.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (S.screen === 'name' && S.nameDraft.trim()) { e.preventDefault(); S.screen = 'goal'; render(); return; }
  if (S.screen === 'lesson' && !S.modal) { const b = app.querySelector('[data-act="check"]:not([disabled]),[data-act="next"]'); if (b) { e.preventDefault(); b.click(); } }
});
document.addEventListener('keydown', e => {
  if (S.screen !== 'lesson' || !S.sess || S.sess.checked || S.modal || e.target.tagName === 'INPUT') return;
  const q = curQ();
  if (q.type === 'select') { const n = +e.key; if (n >= 1 && n <= q.options.length) { S.sess.answer = n - 1; render(); } }
  if (q.type === 'compare') { const i = ['>', '<', '='].indexOf(e.key); if (i >= 0) { S.sess.answer = i; render(); } }
  if (e.key === 'Enter') { const b = app.querySelector('[data-act="check"]:not([disabled]),[data-act="next"]'); if (b) { e.preventDefault(); b.click(); } }
});
app.addEventListener('click', e => {
  const t = e.target.closest('button,[data-close]');
  if (!t) { if (S.popover) { S.popover = null; render(); } return; }
  const d = t.dataset;
  if (d.close !== undefined) { if (t.tagName === 'BUTTON' || e.target === t) { S.modal = null; render(); } return; }
  if (d.go) {
    S.modal = null; S.popover = null;
    if (d.go === 'main') { S.screen = 'main'; S.tab = 'learn'; render(); scrollToCurrent(); return; }
    if (d.go === 'quests') { S.screen = 'main'; S.tab = 'quests'; }
    else S.screen = d.go;
    return render();
  }
  if (d.goal) { S.goalDraft = +d.goal; return render(); }
  if (d.tab) { S.tab = d.tab; S.popover = null; render(); if (d.tab === 'learn') scrollToCurrent(); return; }
  if (d.modal) { S.modal = d.modal; return render(); }
  if (d.tip) { S.tipLesson = +d.tip; S.modal = 'tip'; return render(); }
  if (d.unitTip !== undefined) { S.tipUnit = +d.unitTip; S.modal = 'unit-tip'; return render(); }
  if (d.node) { S.popover = S.popover === d.node ? null : d.node; return render(); }
  if (d.start) { const n = NODES.find(x => x.key === d.start), info = nodeInfo(n); startSession({ node: n, ids: info.ids, count: info.count, xp: info.xp, title: info.title }); return render(); }
  if (d.prac) {
    const ids = d.prac === 'mix' ? LESSONS.filter(l => P.lessons[l.id]?.stars).map(l => l.id) : [+d.prac];
    if (!ids.length) return;
    startSession({ endless: true, ids, title: d.prac === 'mix' ? 'Trộn các bài đã học' : `Bài ${d.prac} · ${lessonById(+d.prac).title}` }); return render();
  }
  if (d.toggle) { P[d.toggle] = !P[d.toggle]; save(); return render(); }
  if (d.act === 'finish-ob') { P.name = S.nameDraft.trim(); P.goal = S.goalDraft; P.onboarded = true; save(); S.screen = 'main'; S.tab = 'learn'; return render(); }
  if (d.act === 'rename') { S.nameDraft = P.name; S.goalDraft = P.goal; S.screen = 'name'; return render(); }
  if (d.act === 'reset-confirm') { const keep = { sound: P.sound }; P = Object.assign(fresh(), keep); save(); S.modal = null; S.screen = 'welcome'; S.nameDraft = ''; return render(); }
  if (S.screen !== 'lesson' || !S.sess) return;
  const L = S.sess;
  if (d.act === 'quit') { if (L.endless && !L.answered) { S.sess = null; S.screen = 'main'; return render(); } S.modal = 'quit'; return render(); }
  if (d.act === 'quit-confirm') { S.modal = null; if (L.endless && L.answered) { finish(); return render(); } S.sess = null; S.screen = 'main'; return render(); }
  if (d.act === 'retry') { const o = { node: L.node, ids: L.ids, count: L.count, xp: L.xp, title: L.title }; startSession(o); return render(); }
  if (L.checked && d.act !== 'next') return;
  if (d.ans !== undefined) { L.answer = d.ans === 'true' ? true : d.ans === 'false' ? false : +d.ans; return render(); }
  if (d.ml !== undefined) { L.match.sel = +d.ml; L.match.bad = null; return render(); }
  if (d.mr !== undefined && L.match.sel !== null) {
    const l = L.match.sel, r = +d.mr;
    if (l === r) { L.match.done[l] = r; L.match.bad = null; if (P.sound) beep([[880, .08]]); }   // right[i] belongs to left[i]
    else { L.match.bad = [l, r]; L.match.errors++; SFX.wrong(); }
    L.match.sel = null; return render();
  }
  if (d.seq !== undefined) { const i = +d.seq; if (!L.seq.includes(i)) L.seq.push(i); return render(); }
  if (d.unseq !== undefined) { L.seq.splice(+d.unseq, 1); return render(); }
  if (d.act === 'clear-seq') { L.seq = []; return render(); }
  if (d.act === 'check') { grade(); return render(); }
  if (d.act === 'next') { next(); render(); if (S.screen === 'lesson') app.querySelector('.scroll')?.scrollTo(0, 0); }
});

render();
if (S.screen === 'main') scrollToCurrent();
/* Exposed for automated smoke tests only. */
MG._state = () => S;
})(window.MG);
