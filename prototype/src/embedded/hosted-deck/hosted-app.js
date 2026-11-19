
/* =====================================================================
   HOSTED WEB DECK (the page clients see on Google Sites or a website)
   Rebuilds the deck from the frozen proposal state, so the file stays small
   and the calculator works for any headcount or SFEC balance.
   Layouts: 'player' (one slide, scaled to fit the box), 'scroll' (all slides),
   'reader' (a readable page for phones and small embed boxes).
   ===================================================================== */
(() => {
'use strict';
const SRC = '<!doctype html>\n' + document.documentElement.outerHTML;
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const STATE = JSON.parse($('vi-state').textContent);
const HOST = STATE.__host || {};
VI.initAssets();
const deck = buildDeck(STATE);
const ctx = deck.ctx;
const meta = deckMeta(ctx);
const MAIN = deck.main;
const LAST = MAIN + (deck.details || 0) - 1;   // v6: detail slides (lessons, the course list) follow the main slides
const isDetail = i => i >= MAIN && i <= LAST;
const inFrame = VI.inFrame();
if (inFrame) document.body.classList.add('in-frame');   // embeds such as Google Sites put their own button at the bottom-left
const touch = window.matchMedia('(pointer: coarse)').matches;

let init = {};
try { init = JSON.parse(document.body.getAttribute('data-init') || '{}') || {}; } catch (e) { init = {}; }
const theatre = document.body.classList.contains('is-theatre');
const views = init.views || {};
let cur = Math.max(0, Math.min(LAST, +init.slide || 0));
const prefer = HOST.mode === 'scroll' ? 'scroll' : 'player';
let forced = init.layout || null;
let layout = null;

const app = $('app');
const ICON = {
  menu:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  prev:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  next:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7.5 4.5 13 10l-5.5 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  dl:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3.5v9M6 9l4 4 4-4M4 16.5h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  fs:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3.5 8V3.5H8M12 3.5h4.5V8M16.5 12v4.5H12M8 16.5H3.5V12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  page:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="5" y="2.5" width="10" height="15" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M7.5 7h5M7.5 10h5M7.5 13h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  slides:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2.5" y="4.5" width="15" height="10" rx="1.6" stroke="currentColor" stroke-width="1.7"/><path d="M7 17.5h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  calc:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="4" y="2.5" width="12" height="15" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M7 6.5h6M7 10h1.5M11.5 10H13M7 13.5h1.5M11.5 13.5H13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  close:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};
const btn = (id, icon, label, cls, extra, shortLabel) => '<button type="button" class="btn ' + (cls || '') + '" id="' + id + '" aria-label="' + esc(label) + '" title="' + esc(label) + '"' + (extra || '') + '>' + ICON[icon] + '<span class="lbl">' + esc(shortLabel || label) + '</span></button>';
const viewSlide = i => views[i] ? renderViewSlide(deck, i, views[i]) : deck.slides[i];

/* ---------- layout choice ---------- */
function autoLayout(){
  if (forced) return forced;
  const w = window.innerWidth, h = window.innerHeight;
  if (prefer === 'scroll') return w < 700 ? 'reader' : 'scroll';
  const slideW = Math.min(w - 16, (h - 66) * 16 / 9);
  return slideW < 600 || w < 640 ? 'reader' : 'player';
}
function setLayout(next, userChoice){
  if (userChoice) forced = next;
  if (next === layout){ if (layout === 'player') fitFrame(); return; }
  layout = next;
  closePops();
  VI.closePeek(false);
  document.body.classList.remove('m-player', 'm-scroll', 'm-reader');
  document.body.classList.add('m-' + layout);
  if (layout === 'player') buildPlayer();
  else if (layout === 'scroll') buildScroll();
  else buildReader();
  window.scrollTo(0, 0);
}

/* ---------- toolbar pieces ---------- */
function rightButtons(where){
  const out = [];
  if (where === 'player') out.push(btn('b-adjust', 'calc', 'Adjust figures', 'btn-primary', ' hidden'));
  if (where === 'reader') out.push(btn('b-slides', 'slides', 'Slides'));
  else out.push(btn('b-page', 'page', 'Page view'));
  out.push(btn('b-dl', 'dl', 'Download'));
  if (theatre && window.opener) out.push(btn('b-close', 'close', 'Close'));
  else if (!theatre || where === 'player') out.push(btn('b-fs', 'fs', 'Full screen'));
  return out.join('');
}
function wireCommon(){
  const on = (id, f) => { const el = $(id); if (el) el.addEventListener('click', f); };
  on('b-page', () => setLayout('reader', true));
  on('b-slides', () => setLayout(prefer === 'scroll' ? 'scroll' : 'player', true));
  on('b-dl', e => openDownloads(e.currentTarget));
  on('b-fs', fullScreen);
  on('b-close', () => { try { window.close(); } catch (e) {} });
}

/* ---------- player ---------- */
function buildPlayer(){
  app.innerHTML =
    '<main class="stage" id="stage" aria-roledescription="slide deck" aria-label="' + esc(meta.title) + '"><div class="frame" id="frame"></div></main>' +
    '<nav class="bar" id="bar" aria-label="Slide controls">' +
      btn('b-list', 'menu', 'All slides', 'btn-ghost', '', 'Slides') + btn('b-prev', 'prev', 'Previous slide', '', '', 'Back') +
      '<span class="count" id="count" aria-live="off"></span>' + btn('b-next', 'next', 'Next slide', '', '', 'Next') +
      '<span class="title" id="slide-title"></span>' + rightButtons('player') +
    '</nav><div class="sr" id="live" aria-live="polite"></div>';
  $('b-prev').addEventListener('click', () => step(-1));
  $('b-next').addEventListener('click', () => step(1));
  $('b-list').addEventListener('click', e => openSlideList(e.currentTarget));
  $('b-adjust').addEventListener('click', () => openAdjust(cur));
  wireCommon();
  wireFrameLinks($('stage'));
  wireSwipe($('stage'));
  showSlide();
}
function fitFrame(){
  const st = $('stage'), fr = $('frame');
  if (!st || !fr) return;
  const cs = getComputedStyle(st);
  const pw = st.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const ph = st.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const w = Math.max(160, Math.floor(Math.min(pw, ph * 16 / 9)));
  fr.style.width = w + 'px';
  fr.style.height = Math.round(w * 9 / 16) + 'px';
  const fs = $('b-fs');
  if (fs) fs.classList.toggle('btn-primary', w < 900 && !document.body.classList.contains('is-theatre'));
}
function showSlide(){
  const fr = $('frame');
  if (!fr) return;
  const s = viewSlide(cur);
  fr.innerHTML = slideSVG(s, slideLabel(cur) + ': ' + s.name, {links:false});
  VI.mountControls(fr, s, (id, value) => { views[cur] = VI.applyPick(deck, cur, views[cur], id, value); showSlide(); refreshAdjust(); });
  VI.mountLinks(fr, s, n => go(n), deck);
  VI.mountPeeks(fr, s, n => go(n));
  $('count').textContent = slideCount(cur);
  $('slide-title').textContent = s.name;
  $('b-prev').disabled = !isDetail(cur) && cur === 0;
  $('b-next').disabled = !isDetail(cur) && cur === MAIN - 1;
  [['b-prev', isDetail(cur) ? 'Previous detail slide, or back' : 'Previous slide'], ['b-next', isDetail(cur) ? 'Next detail slide, or back' : 'Next slide']]
    .forEach(([id, t]) => { $(id).title = t; $(id).setAttribute('aria-label', t); });
  const adj = deck.slides[cur].calc || deck.slides[cur].sched;
  $('b-adjust').hidden = !adj;
  if (adj){
    const lab = deck.slides[cur].sched ? 'Adjust schedule' : 'Adjust figures', ab = $('b-adjust');
    ab.title = lab; ab.setAttribute('aria-label', lab);
    const l = ab.querySelector('.lbl'); if (l) l.textContent = lab;
  }
  $('live').textContent = slideLabel(cur) + ': ' + s.name;
  fitFrame();
}
/* v6: a detail slide counts within its group ("5 › 2 of 7": the second of seven lesson slides behind slide 5) */
function slideCount(i){
  if (!isDetail(i)) return (i + 1) + ' / ' + MAIN;
  const s = deck.slides[i], sib = s.siblings || [i];
  return (s.parentIdx >= 0 && s.parentIdx < MAIN ? (s.parentIdx + 1) + ' › ' : '') + (sib.indexOf(i) + 1) + ' of ' + sib.length;
}
function slideLabel(i){ return isDetail(i) ? 'Detail slide ' + slideCount(i).replace(' › ', ' of slide set ') : 'Slide ' + (i + 1) + ' of ' + MAIN; }
function go(i){
  const n = Math.max(0, Math.min(LAST, i));
  if (n === cur && $('frame') && $('frame').firstChild) return;
  cur = n;
  closePops();
  showSlide();
}
/* Back and Next: through the main slides; on a detail slide, through the others in its group, then back to the slide
   that opened them */
function step(d){
  if (isDetail(cur)){
    const s = deck.slides[cur], sib = s.siblings || [cur], k = sib.indexOf(cur) + d;
    go(k >= 0 && k < sib.length ? sib[k] : (s.parentIdx >= 0 ? s.parentIdx : 0));
    return;
  }
  const n = cur + d;
  if (n >= 0 && n < MAIN) go(n);
}

/* ---------- all slides on one page ---------- */
function buildScroll(){
  app.innerHTML = '<nav class="bar" id="bar" aria-label="Deck controls">' + btn('b-list', 'menu', 'Slides', 'btn-ghost') +
    '<span class="title">' + esc(meta.title) + '</span>' + rightButtons('scroll') + '</nav>' +
    '<main class="scroll" id="stage">' + deck.slides.slice(0, MAIN).map((s, i) =>
      '<figure class="sfig" id="s-' + (i + 1) + '"><figcaption><b>' + (i + 1) + '</b> · ' + esc(s.name) + '</figcaption><div class="frame" data-i="' + i + '"></div></figure>').join('') +
      (LAST >= MAIN ? '<h2 class="sdet">More detail</h2><p>Opened from the buttons on the slides above.</p>' + deck.slides.slice(MAIN, LAST + 1).map((s, k) =>
        '<figure class="sfig" id="s-' + (MAIN + k + 1) + '"><figcaption>' + esc(s.name) + '</figcaption><div class="frame" data-i="' + (MAIN + k) + '"></div></figure>').join('') : '') + '</main>';
  for (let i = 0; i <= LAST; i++) paintScroll(i);
  $('b-list').addEventListener('click', e => openSlideList(e.currentTarget));
  wireCommon();
  wireFrameLinks($('stage'));
}
function paintScroll(i){
  const fr = app.querySelector('.frame[data-i="' + i + '"]');
  if (!fr) return;
  const s = viewSlide(i);
  fr.innerHTML = slideSVG(s, slideLabel(i) + ': ' + s.name, {links:false});
  VI.mountControls(fr, s, (id, value) => { views[i] = VI.applyPick(deck, i, views[i], id, value); paintScroll(i); });
  VI.mountLinks(fr, s, n => scrollToSlide(n), deck);
  VI.mountPeeks(fr, s, n => scrollToSlide(n));
}

/* Scrolls the all-slides page to slide n, below the sticky toolbar (works inside embeds where scrollIntoView may not) */
function scrollToSlide(n){
  const el = $('s-' + (n + 1));
  if (!el) return;
  const bar = $('bar'), off = (bar ? bar.offsetHeight : 0) + 8;
  const top = Math.max(0, el.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0) - off);
  try { window.scrollTo({top, behavior:'smooth'}); } catch (e) { window.scrollTo(0, top); }
}

/* ---------- links drawn on slides (fallback; web views lay HTML links over each slide) ---------- */
function wireFrameLinks(host){
  host.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a');
    if (!a || !host.contains(a)) return;
    const goAttr = a.getAttribute('data-go');
    if (goAttr){
      e.preventDefault();
      const n = +goAttr - 1;
      if (layout === 'player') go(n);
      else scrollToSlide(n);
      return;
    }
    const url = a.getAttribute('data-href') || a.getAttribute('href');
    if (url && /^(https?:|mailto:|tel:)/i.test(url)){
      e.preventDefault();
      const w = window.open(url, '_blank', 'noopener,noreferrer');
      if (!w && /^mailto:|^tel:/i.test(url)) window.location.href = url;
    }
  });
  host.addEventListener('keydown', e => {
    const a = e.target.closest && e.target.closest('a');
    if (a && e.key === ' '){ e.preventDefault(); a.dispatchEvent(new MouseEvent('click', {bubbles:true})); }
  });
}
function wireSwipe(el){
  let x0 = null, y0 = 0;
  el.addEventListener('pointerdown', e => { if (e.pointerType === 'touch'){ x0 = e.clientX; y0 = e.clientY; } });
  el.addEventListener('pointerup', e => {
    if (x0 == null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dy) < 60) step(dx < 0 ? 1 : -1);
  });
}

/* ---------- pop-up menus ---------- */
let pop = null;
function closePops(){ if (pop){ pop.remove(); pop = null; } }
function placePop(el, anchor){
  document.body.appendChild(el);
  const r = anchor.getBoundingClientRect(), pw = el.offsetWidth, ph = el.offsetHeight;
  let left = Math.min(Math.max(8, r.left + r.width / 2 - pw / 2), window.innerWidth - pw - 8);
  let top = r.top - ph - 8;
  if (top < 8) top = Math.min(window.innerHeight - ph - 8, r.bottom + 8);
  el.style.left = left + 'px'; el.style.top = Math.max(8, top) + 'px';
  pop = el;
  const first = el.querySelector('button[aria-current="true"]') || el.querySelector('button');
  if (first) first.focus();
}
function openSlideList(anchor){
  if (pop){ closePops(); return; }
  const el = document.createElement('div');
  el.className = 'pop'; el.setAttribute('role', 'menu');
  const subOf = i => deck.slides.map((d, j) => j).filter(j => isDetail(j) && deck.slides[j].parentIdx === i);
  const item = (i, sub) => '<button type="button" role="menuitem" data-i="' + i + '"' + (sub ? ' class="sub"' : '') + (layout === 'player' && i === cur ? ' aria-current="true"' : '') + '>' +
    (sub ? '' : '<span class="num">' + (i + 1) + '</span>') + '<span>' + esc(deck.slides[i].name) + '</span></button>';
  const tree = i => item(i, isDetail(i)) + subOf(i).map(tree).join('');
  el.innerHTML = '<h3>Slides</h3>' + deck.slides.slice(0, MAIN).map((s, i) => tree(i)).join('');
  el.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]'); if (!b) return;
    const i = +b.dataset.i; closePops();
    if (layout === 'player') go(i);
    else scrollToSlide(i);
  });
  placePop(el, anchor);
}
function openDownloads(anchor){
  if (pop){ closePops(); return; }
  const el = document.createElement('div');
  el.className = 'pop'; el.setAttribute('role', 'menu');
  el.innerHTML = '<h3>Download this proposal</h3>' +
    '<button type="button" role="menuitem" data-x="pdf"><span>PDF<small>Best for email and printing. Links still work.</small></span></button>' +
    '<button type="button" role="menuitem" data-x="pptx"><span>PowerPoint<small>Picture slides for presenting</small></span></button>';
  el.addEventListener('click', e => { const b = e.target.closest('button[data-x]'); if (!b) return; closePops(); download(b.dataset.x); });
  placePop(el, anchor);
}
document.addEventListener('pointerdown', e => {
  if (pop && !pop.contains(e.target) && !(e.target.closest && e.target.closest('#b-list,#b-dl'))) closePops();
}, true);

/* ---------- downloads ---------- */
let busy = false;
async function download(kind){
  if (busy) return;
  busy = true;
  toast(kind === 'pdf' ? 'Preparing the PDF…' : 'Preparing the PowerPoint…', null, 0);
  try {
    const r = kind === 'pdf'
      ? await VI.exportPdf(STATE, (i, n) => toast('Preparing the PDF… page ' + i + ' of ' + n, null, 0))
      : await VI.exportPptx(STATE, false, (i, n) => toast('Preparing the PowerPoint… slide ' + i + ' of ' + n, null, 0));
    const res = await VI.deliver(r.blob, r.filename);
    if (res !== 'saved') toast(VI.deliverMsg(res), null, 6000);
    else if (inFrame) toast('Download started: ' + r.filename + '. If nothing appears, this site may block downloads.', ['Open in new tab', popOut], 9000);
    else toast('Saved ' + r.filename + '.', null, 4000);
  } catch (e){
    toast((e && e.message) || 'The download could not be prepared.', inFrame ? ['Open in new tab', popOut] : null, 9000);
  } finally { busy = false; }
}
let toastT = 0;
function toast(msg, action, ms){
  let t = $('toast');
  if (!t){ t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.innerHTML = '<span>' + esc(msg) + '</span>' + (action ? '<button type="button">' + esc(action[0]) + '</button>' : '');
  if (action) t.querySelector('button').addEventListener('click', () => { t.remove(); action[1](); });
  clearTimeout(toastT);
  if (ms) toastT = setTimeout(() => { if (t.parentNode) t.remove(); }, ms);
}

/* ---------- full screen, or a separate full-screen tab when the embed does not allow it ---------- */
function popOut(){
  const st = {slide: cur, views, layout: layout === 'reader' ? 'reader' : null};
  const html = SRC.replace('<body class="vi-host"', '<body class="vi-host is-theatre" data-init="' + esc(JSON.stringify(st)) + '"');
  try {
    const w = window.open('', '_blank');
    if (w && w.document){ w.document.open(); w.document.write(html); w.document.close(); return true; }
  } catch (e) {}
  try {
    const w2 = window.open(URL.createObjectURL(new Blob([html], {type:'text/html'})), '_blank');
    if (w2) return true;
  } catch (e) {}
  toast('The browser blocked the new tab. Allow pop-ups for this page, or download the PDF.', null, 8000);
  return false;
}
function fullScreen(){
  const d = document, el = d.documentElement;
  if (d.fullscreenElement || d.webkitFullscreenElement){ (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
  const can = d.fullscreenEnabled || d.webkitFullscreenEnabled;
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (can && req){
    try {
      const p = req.call(el);
      if (p && p.catch) p.catch(() => popOut());
      return;
    } catch (e) {}
  }
  popOut();
}
['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.addEventListener(ev, () => {
  const on = !!(document.fullscreenElement || document.webkitFullscreenElement);
  document.body.classList.toggle('is-theatre', on || theatre);
  if (layout === 'player') setTimeout(fitFrame, 50);
}));

/* ---------- calculator (page view and the Adjust panel) ---------- */
/* The calculator form (Adjust panel and page view): the client sets the sponsoring entity (when there are several),
   the course, how many people attend in each funding group and the SFEC balance. Results update as they type.
   The funding groups follow the proposal (SME: 70% for every Citizen and PR; otherwise 50% and 70% by age), so the
   client cannot switch between the 50% and 70% figures here. Each entity keeps its own figures. */
function calcForm(host, idx, onChange){
  const base = deck.slides[idx];
  const sme = defaultSme(ctx);
  const clampN = v => Math.max(0, Math.min(500, Math.round(+String(v).replace(/[^0-9.]/g, '') || 0)));
  let drawnSame = false;
  const field = (k, title, sub, val) =>
    '<div class="mix-row"><span class="mix-lab">' + esc(title) + '<small>' + esc(sub) + '</small></span>' +
    '<span class="stepper"><button type="button" class="st" data-st="-1" aria-label="One fewer: ' + esc(title) + '">−</button>' +
    '<input type="number" inputmode="numeric" min="0" max="500" step="1" data-f="' + k + '" value="' + val + '" aria-label="' + esc(title) + '">' +
    '<button type="button" class="st" data-st="1" aria-label="One more: ' + esc(title) + '">+</button></span></div>';
  const scope = () => calcScope(ctx, base, views[idx]);
  const save = (sc, sub) => {
    if (base.uenSwitch) views[idx] = calcWithSub(base, views[idx], sc.id, sub);
    else if (sub && Object.keys(sub).length) views[idx] = sub;
    else delete views[idx];
  };
  const uenOptions = cur => '<option value="' + UEN_ALL + '"' + (cur === UEN_ALL ? ' selected' : '') + '>All ' + ctx.uens.length + ' entities combined</option>' +
    ctx.uens.map(u => '<option value="' + esc(u.id) + '"' + (u.id === cur ? ' selected' : '') + '>' + esc(u.label + ' · ' + money0(u.balDollars) + ' SFEC') + '</option>').join('');
  /* All entities combined: totals and each entity's own SFEC balance. Figures are changed on an entity's own view. */
  const drawAll = sc => {
    const C = combinedPlan(ctx, sc.byUen), A = C.total, q = Math.max(1, A.qty);
    let h = '<div class="calc"><div class="calc-grid"><label class="wide">Sponsoring entity<select data-k="uen">' + uenOptions(sc.id) + '</select></label></div>';
    h += '<div class="calc-out" aria-live="polite"><div class="calc-sum"><div><b>' + money(A.up) + '</b><span>Upfront payment, all ' + ctx.uens.length + ' entities (' + money(Math.round(A.up / q)) + ' each)</span></div>' +
         '<div class="good"><b>' + money(A.netCost) + '</b><span>Net course cost after claims (' + money(Math.round(A.netCost / q)) + ' each)</span></div></div>';
    h += '<table class="mt"><tbody><tr><th colspan="2">Each entity’s own SFEC balance</th></tr>' +
      C.parts.map(p => '<tr><td>' + esc(p.u.name) + '<small>' + esc(p.qty ? paxWord(p.qty) + ' · SFEC used ' + money(p.used) : 'No courses') + '</small></td><td>' + esc(p.bal == null ? money(p.used) + ' of SFEC' : money(p.left) + ' left') + '</td></tr>').join('') +
      (A.bal != null ? '<tr class="total"><td>All entities<small>' + esc('SFEC used ' + money(A.sfecUsed) + ' of ' + money(A.bal)) + '</small></td><td>' + esc(money(A.left) + ' left') + '</td></tr>' : '') +
      calcRows(ctx, A).map(r => {
        if (r.kind === 'sec') return '<tr><th colspan="2">' + esc(r.label.replace(/\*$/, '')) + '</th></tr>';
        const note = [].concat(r.note || '')[0];
        return '<tr class="' + (r.kind || '') + (r.na ? ' na' : '') + '"><td>' + esc(r.label) + (note ? '<small>' + esc(note) + '</small>' : '') + '</td><td>' + esc(r.value) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    h += '<p class="calc-note">Choose an entity above to change its participants or SFEC balance; these combined figures follow.' + (C.deduped ? ' A course with no sponsoring entity is counted once, under the first entity that takes it.' : '') + ' Totals include 9% GST and are confirmed at enrolment.</p></div>';
    host.innerHTML = h;
    const uenSel = host.querySelector('[data-k="uen"]');
    uenSel.addEventListener('change', () => { views[idx] = Object.assign({}, views[idx] || {}, {uen:uenSel.value}); onChange(); draw(); });
  };
  const draw = () => {
    const sc = scope(), uenObj = sc.uenObj, v = sc.sub;
    if (sc.all){ drawAll(sc); return; }
    const balDefault = defaultBalCents(ctx, uenObj);
    const V = calcView(ctx, v, uenObj);
    const plan = V.plan;
    const multiLines = plan.lines.length > 1;
    const same = multiLines && (v.same != null ? !!v.same : plan.lines.every(l => sameMakeup(l.mk, plan.lines[0].mk)));
    drawnSame = same;
    const balShown = v.balCents !== undefined ? v.balCents : balDefault;
    const top = [];
    if (base.uenSwitch) top.push('<label class="wide">Sponsoring entity<select data-k="uen">' + uenOptions(sc.id) + '</select></label>');
    if (V.cList.length > 1) top.push('<label class="wide">Course<select data-k="course">' + V.cList.map(c => '<option value="' + c.key + '"' + (c.key === V.cKey ? ' selected' : '') + '>' + esc(c.label) + '</option>').join('') + '</select></label>');
    if (multiLines) top.push('<label class="wide row"><input type="checkbox" data-k="same"' + (same ? ' checked' : '') + '><span>Same participants on every course</span></label>');
    let h = '<div class="calc">' + (top.length ? '<div class="calc-grid">' + top.join('') + '</div>' : '');
    const groups = (same || !multiLines) ? [{key:'all', title: multiLines ? 'Participants on each course' : 'Participants', mk:plan.lines[0].mk}]
      : plan.lines.map(l => ({key:l.c.cKey, title:l.c.short + (l.c.pilot ? ' (pilot)' : ''), mk:l.mk}));
    groups.forEach(g => {
      const q = g.mk.n50 + g.mk.n70 + g.mk.npass;
      h += '<fieldset class="mix" data-g="' + g.key + '"><legend>' + esc(g.title) + '<span class="mix-total" data-total>' + esc(paxWord(q)) + '</span></legend>';
      if (sme) h += field('sc', 'Singapore Citizens and PRs', '70% SkillsFuture funding (SME-sponsored)', g.mk.n50 + g.mk.n70);
      else h += field('n50', 'Citizens under 40, and PRs', '50% SkillsFuture funding', g.mk.n50) + field('n70', 'Citizens aged 40 and above', '70% SkillsFuture funding', g.mk.n70);
      h += field('npass', 'Foreign staff (EP, S Pass, Work Permit)', 'No SkillsFuture funding' + (ctx.sfecOn ? (ctx.isLegacySfec ? '; SFEC still applies' : ' or SFEC offset') : ''), g.mk.npass);
      h += '</fieldset>';
    });
    if (ctx.sfecOn) h += '<div class="calc-grid"><label class="wide">SFEC balance' + (uenObj ? ' (' + esc(uenObj.name) + ')' : '') + '<span class="money-in"><span>S$</span><input type="text" inputmode="decimal" data-k="bal" placeholder="Not known: full SFEC assumed" value="' + (balShown == null ? '' : (Math.round(balShown) / 100).toLocaleString('en-US')) + '"></span></label></div>';
    h += '<div class="calc-out" aria-live="polite"></div>';
    h += '<p class="calc-note">Totals include 9% GST. Claims depend on course completion (at least 75% attendance and the assessment) and on the company’s GST and tax position. Figures are illustrative and confirmed at enrolment.' +
         (ctx.sfecOn && !ctx.isLegacySfec ? ' The redesigned SFEC does not cover GST and is subject to SWDA’s guidelines and the credit balance.' : '') + '</p>';
    h += '<p class="calc-note"><button type="button" class="link" data-k="reset">' + (base.uenSwitch ? 'Reset ' + esc(uenObj.name) + ' to the proposal’s figures' : 'Reset to the proposal’s figures') + '</button></p></div>';
    host.innerHTML = h;
    const uenSel = host.querySelector('[data-k="uen"]');
    if (uenSel) uenSel.addEventListener('change', () => { views[idx] = Object.assign({}, views[idx] || {}, {uen:uenSel.value}); onChange(); draw(); });
    host.querySelectorAll('select[data-k="course"], input[type="checkbox"]').forEach(el => el.addEventListener('change', () => { save(sc, read(V, sc)); onChange(); draw(); }));
    host.querySelectorAll('input[data-f], input[data-k="bal"]').forEach(el => el.addEventListener('input', () => { save(sc, read(V, sc)); onChange(); results(); }));
    host.querySelectorAll('button[data-st]').forEach(b => b.addEventListener('click', () => {
      const inp = b.parentNode.querySelector('input');
      inp.value = clampN(+inp.value + (+b.dataset.st));
      save(sc, read(V, sc)); onChange(); results();
    }));
    host.querySelector('[data-k="reset"]').addEventListener('click', () => { save(sc, {}); onChange(); draw(); });
    results();
  };
  const results = () => {
    const out = host.querySelector('.calc-out');
    if (!out) return;
    host.querySelectorAll('fieldset.mix').forEach(fs => {
      let q = 0; fs.querySelectorAll('input[data-f]').forEach(i => { q += clampN(i.value); });
      fs.querySelector('[data-total]').textContent = paxWord(q);
    });
    const sc = scope();
    if (sc.all) return;
    const plan = calcView(ctx, sc.sub, sc.uenObj).plan;
    const q = Math.max(1, plan.qty);
    let h = '<div class="calc-sum"><div><b>' + money(plan.up) + '</b><span>Upfront payment (' + money(Math.round(plan.up / q)) + ' each)</span></div>' +
            '<div class="good"><b>' + money(plan.netCost) + '</b><span>Net course cost after claims (' + money(Math.round(plan.netCost / q)) + ' each)</span></div></div>';
    h += '<table class="mt"><tbody>' + calcRows(ctx, plan).map(r => {
      if (r.kind === 'sec') return '<tr><th colspan="2">' + esc(r.label.replace(/\*$/, '')) + '</th></tr>';
      const note = [].concat(r.note || '')[0];
      return '<tr class="' + (r.kind || '') + (r.na ? ' na' : '') + '"><td>' + esc(r.label) + (note ? '<small>' + esc(note) + '</small>' : '') + '</td><td>' + esc(r.value) + '</td></tr>';
    }).join('') + '</tbody></table>';
    out.innerHTML = h;
  };
  const read = (V, sc) => {
    const nv = {};
    const cs = host.querySelector('[data-k="course"]');
    nv.cKey = cs ? cs.value : V.cKey;
    const sameEl = host.querySelector('[data-k="same"]');
    if (sameEl) nv.same = sameEl.checked;
    const prev = scope().sub;
    if (nv.cKey === V.cKey){
      // A changed course starts from the proposal's figures; otherwise read the funding groups as typed
      const touched = prev.mk || [...host.querySelectorAll('input[data-f]')].some(i => String(clampN(i.value)) !== i.defaultValue) || (!!sameEl && sameEl.checked !== drawnSame);
      if (touched){
        nv.mk = {};
        const sets = [...host.querySelectorAll('fieldset.mix')];
        sets.forEach(fs => {
          const val = k => { const i = fs.querySelector('[data-f="' + k + '"]'); return i ? clampN(i.value) : 0; };
          const m = sme ? {n50:0, n70:val('sc'), npass:val('npass')} : {n50:val('n50'), n70:val('n70'), npass:val('npass')};
          const keys = fs.dataset.g === 'all' ? V.active.map(c => c.cKey) : [fs.dataset.g];
          keys.forEach(k => { nv.mk[k] = Object.assign({}, m); });
        });
        // Ticking "same participants" copies the first course's figures to the others
        if (nv.same && !drawnSame && sets.length > 1){ const first = nv.mk[V.active[0].cKey]; V.active.forEach(c => { nv.mk[c.cKey] = Object.assign({}, first); }); }
      }
    }
    const bi = host.querySelector('[data-k="bal"]');
    if (bi){
      const t = bi.value.trim();
      let val = t === '' ? (ctx.isLegacySfec ? null : defaultBalCents(ctx, sc.uenObj)) : Math.round((parseFloat(t.replace(/[^0-9.]/g, '')) || 0) * 100);
      if (!ctx.isLegacySfec && val != null) val = Math.min(val, SFEC_NEW_CREDIT * 100);
      if (val !== defaultBalCents(ctx, sc.uenObj)) nv.balCents = val;
    } else if (prev.balCents !== undefined) nv.balCents = prev.balCents;
    return nv;
  };
  draw();
}
let sheetIdx = -1;
function openAdjust(idx){
  closeAdjust();
  sheetIdx = idx;
  const el = document.createElement('section');
  el.className = 'sheet'; el.id = 'sheet'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-labelledby', 'sheet-h');
  const isSched = !!deck.slides[idx].sched;
  el.innerHTML = '<div class="sheet-head"><h2 id="sheet-h">' + (isSched ? 'Adjust the schedule' : 'Adjust the figures') + '</h2><button type="button" class="btn btn-ghost" id="sheet-x" aria-label="Close">' + ICON.close + '</button></div><div id="sheet-body"></div>';
  document.body.appendChild(el);
  $('sheet-x').addEventListener('click', closeAdjust);
  (isSched ? schedForm : calcForm)($('sheet-body'), idx, () => { if (layout === 'player' && cur === idx) showSlide(); });
  const f = el.querySelector('input,select'); if (f) f.focus();
}
function closeAdjust(){ const s = $('sheet'); if (s) s.remove(); sheetIdx = -1; }
function refreshAdjust(){ if (sheetIdx >= 0 && $('sheet-body')) (deck.slides[sheetIdx].sched ? schedForm : calcForm)($('sheet-body'), sheetIdx, () => { if (layout === 'player' && cur === sheetIdx) showSlide(); }); }

/* ---------- training schedule form (Adjust panel and page view) ---------- */
function schedTableHtml(V){
  if (V.pub && V.plan){
    const u = V.plan.sess ? 'Session ' : 'Day ';
    let t = '<div class="r-scroll"><table class="mt sched"><thead><tr><th>' + u.trim() + '</th><th>Hours of class</th></tr></thead><tbody>';
    V.days.forEach(d => { t += '<tr><td><b>' + u + d.d + '</b></td><td>' + schedHrs(d.train) + ' training' + (d.assess ? ' + ' + schedHrs(d.assess) + ' assessment' : '') + '</td></tr>'; });
    return t + '</tbody></table></div><p class="calc-note">Public intake: ' + esc(V.plan.label) + '. Dates and class times follow the published schedule for each run.</p>';
  }
  if (!V.plan) return '<p class="r-callout"><b>No split fits these class hours.</b> Try a later finish or a different lunch setting.</p>';
  const NAME = {train:'Training', lunch:'Lunch', assess:'Assessment'};
  let h = '<div class="r-scroll"><table class="mt sched"><thead><tr><th>Day and date</th><th>Timetable</th></tr></thead><tbody>';
  V.days.forEach(d => {
    h += '<tr><td><b>Day ' + d.d + '</b><input type="date" class="sd" data-day="' + (d.d - 1) + '" value="' + esc(d.date || '') + '" aria-label="Day ' + d.d + ' date">' +
      (d.date ? '<small' + (SG_HOLIDAYS[d.date] ? ' class="ph">Public holiday' : '>' + esc(schedDateLabel(d.date))) + '</small>' : '<small>Pick a date</small>') + '</td><td>' +
      d.blocks.map(b => '<span class="sb"><span class="tr"><i class="sk ' + b.kind + '" aria-hidden="true"></i>' + esc(schedRange(b.from, b.to)) + '</span> <span class="dim">' + NAME[b.kind] + '</span></span>').join('') +
      '<small class="hrs">' + schedHrs(d.act) + ' of class' + (d.assess ? ', with assessment' : '') + '</small></td></tr>';
  });
  return h + '</tbody></table></div><p class="calc-note">' + schedHrs(V.sel.train) + ' of training and ' + schedHrs(V.assess) + ' of assessment, all allocated.</p>';
}
function schedForm(host, idx, onChange){
  const opt = (list, val) => list.map(x => '<option value="' + esc(x[0]) + '"' + (String(x[0]) === String(val) ? ' selected' : '') + (x[2] ? ' disabled' : '') + '>' + esc(x[1]) + '</option>').join('');
  const half = (a, b) => { const out = []; for (let t = a; t <= b + 1e-9; t += 0.5) out.push([String(t), schedClock(t)]); return out; };
  let drawing = false;
  const draw = () => {
    if (drawing) return;
    drawing = true;
    try { paint(); } finally { drawing = false; }
  };
  const paint = () => {
    const V = schedView(ctx, views[idx] || {});
    const inP = V.list.filter(x => x.inProposal), other = V.list.filter(x => !x.inProposal);
    let h = '<div class="calc"><div class="calc-grid">';
    h += inP.length > 1 ? '<label class="wide">Course<select data-k="k">' + opt(inP.map(x => [x.k, x.label]), V.sel.k) + '</select></label>' : '<input type="hidden" data-k="k" value="' + esc(V.sel.k) + '"><p class="calc-note wide" style="grid-column:1/-1"><b>' + esc(V.sel.label) + '</b></p>';
    h += '<label>Participants<input type="number" inputmode="numeric" min="1" max="200" step="1" data-k="pax" value="' + V.pax + '"></label>';
    h += '<label>' + (V.pub ? 'Duration' : 'Number of days') + '<select data-k="n">' + opt(V.formats.map(f => [f.n, schedOptLabel(f, true), !f.fits]), V.n) + '</select></label>';
    h += '<label>Class starts<select data-k="start">' + opt(half(7, 11), V.o.start) + '</select></label>';
    h += '<label>Latest finish<select data-k="end">' + opt(half(15, 21).filter(x => +x[0] >= V.o.start + 3), V.o.end) + '</select></label>';
    h += '<label class="wide">Lunch<select data-k="pref">' + opt([['auto', 'A 1-hour lunch on days of 5.5 hours or more'], ['include', 'A 1-hour lunch every day'], ['skip', 'No lunch break']], V.o.pref) + '</select></label>';
    h += '</div><div class="calc-out" aria-live="polite">' + schedTableHtml(V) + '</div>';
    h += '<p class="calc-note">' + esc(schedNote(ctx, V)) + '</p>';
    h += '<p class="calc-note"><button type="button" class="link" data-k="reset">Reset to the proposal’s schedule</button></p></div>';
    host.innerHTML = h;
    host.querySelectorAll('select, input[data-k="pax"]').forEach(el => el.addEventListener('change', () => { if (drawing) return; views[idx] = read(); onChange(); draw(); }));
    host.querySelector('[data-k="reset"]').addEventListener('click', () => { if (drawing) return; delete views[idx]; onChange(); draw(); });
    host.querySelectorAll('input.sd').forEach(el => {
      // open the calendar on any click, not only on the small icon
      el.addEventListener('click', () => { try { if (el.showPicker) el.showPicker(); } catch (e) {} });
      el.addEventListener('change', () => {
        if (drawing) return;
        const i = +el.dataset.day, nv = read();
        if (i === 0) nv.dates = el.value ? [el.value] : [];            // a new Day 1 re-sequences the days after it
        else {
          const cur = V.days.map(d => d.date || '');
          cur[i] = el.value;
          nv.dates = cur;
        }
        if (!nv.dates.some(Boolean)) delete nv.dates;
        views[idx] = nv; onChange(); draw();
      });
    });
  };
  const read = () => {
    const prev = views[idx] || {}, V0 = schedView(ctx, prev);
    const val = k => host.querySelector('[data-k="' + k + '"]').value;
    const nv = {k:val('k'), start:+val('start'), end:+val('end'), pref:val('pref')};
    if (nv.k === V0.sel.k && prev.dates) nv.dates = prev.dates.slice();
    if (nv.k === V0.sel.k){
      const pax = Math.max(1, Math.min(500, Math.round(+val('pax')) || 1));
      if (pax !== V0.sel.pax || prev.pax != null) nv.pax = pax;
      nv.n = +val('n');
    }
    return nv;
  };
  draw();
}

/* ---------- page view (phones and small boxes) ---------- */
const richHtml = str => esc(str).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (m, t, u) => '<a href="' + u + '" target="_blank" rel="noopener">' + t + '</a>');
function buildReader(){
  const C_ = ctx.consultant;
  const titles = coverTitles(ctx);
  const tiles = summaryTiles(ctx);
  const paras = summaryParas(ctx);
  const phoneShaped = window.innerWidth <= 440 && window.innerHeight >= 560;
  const smallBox = inFrame && !touch && !forced && !phoneShaped;
  let h = '<nav class="bar" id="bar" aria-label="Proposal controls"><span class="title">' + esc(meta.title) + '</span>' + rightButtons('reader') + '</nav>';
  h += '<main class="reader">';
  h += '<header class="r-hero"><div class="r-brand"><img src="' + (IMG_URL.icon || IMG.icon.src) + '" alt=""><span>Vertical Institute</span></div>' +
       '<p class="r-eyebrow">Prepared for ' + esc(ctx.clientFull) + '</p><h1>' + esc(titles[1] || titles[0]) + '</h1><p class="r-sub">' + esc(coverSub(ctx)) + '</p>' +
       '<div class="r-tiles">' + tiles.map(t => '<div class="r-tile"><b>' + esc(t[0]) + '</b><span>' + esc(t[1]) + '</span><small>' + esc([].concat(t[2])[0]) + '</small></div>').join('') + '</div></header>';
  if (smallBox) h += '<div class="banner"><span>This box is small, so the proposal is shown as a page.</span><span><button type="button" class="btn" id="bn-slides">View slides</button> <button type="button" class="btn btn-primary" id="bn-fs">Full screen</button></span></div>';
  h += '<section class="r-sec"><p class="r-kicker">Executive summary</p><h2>' + esc(summaryTitles(ctx)[0]) + '</h2>' + paras.map(p => '<p>' + richHtml(p) + '</p>').join('') + '</section>';
  // v6: the points the client's teams raised, and what the training changes for each
  const heardPs = painsOf(ctx);
  if (heardPs.length){
    h += '<section class="r-sec"><p class="r-kicker">What we heard</p><h2>What your teams told us</h2><ul class="r-heard">' + heardPs.map(p => {
      const oc = p.kind === 'other' ? C[p.other] : null;
      const b = painBenefitMap(ctx).get(p.raw);
      const where = oc ? 'Answered by the ' + oc.name + ' course, under Other courses' : (painWhere(ctx, p) || {}).label;
      return '<li><span class="q">' + esc(endStop(p.text)) + '</span>' + (painTag(p) ? '<span class="t">' + esc(painTag(p)) + '</span>' : '') +
        '<span class="b"><b>' + esc(noStop(b[0])) + '.</b> ' + esc(b[1] || '') + (where ? ' <i>' + esc(endStop(where)) + '</i>' : '') + '</span></li>';
    }).join('') + '</ul></section>';
  }
  const lessonLi = (c, l, i) => {
    const D = ctx.S.details === false ? null : modData(c, i), own = lessonApp(ctx, c, i + 1), ps = lessonPains(ctx, c, i + 1), F = focusFor(ctx, c);
    let x = '';
    if (D && D.cap) x += '<span class="r-lesson-x"><b>Practise:</b> ' + esc(D.cap) + '</span>';
    if (own || (D && D.app)) x += '<span class="r-lesson-x"><b>' + (own ? 'At ' + esc(ctx.client) : 'At work') + ':</b> ' + esc(own || D.app) + '</span>';
    if (ps.length) x += '<span class="r-lesson-x"><b>You told us:</b> ' + esc(ps.map(p => endStop(p.text)).join(' ')) + '</span>';
    return '<li><b>' + esc(l[0]) + '.</b> ' + esc((F && F.notes[i + 1]) || l[1]) + x + '</li>';
  };
  h += '<section class="r-sec"><p class="r-kicker">The programme</p><h2>' + (ctx.multi ? esc(ctx.courses.length + ' courses' + (ctx.standalone ? ', by function' : ', as one pathway')) : 'The course') + '</h2>';
  ctx.courses.forEach(c => {
    const tag = (!ctx.standalone && c.stageLabel) ? c.stageLabel : ((c.pilot ? 'Pilot' : '') + (c.lvl ? (c.pilot ? ' · ' : '') + 'Level ' + c.lvl : '') || (ctx.multi ? (ctx.standalone ? 'Track ' : 'Stage ') + stageNo(ctx, c) : ''));
    const lessons = c.lessons || c.areas || [];
    h += '<article class="r-course' + (c.pilot ? ' pilot' : '') + '">' + (tag ? '<p class="r-tag' + (c.pilot ? ' pilot' : '') + '">' + esc(tag) + '</p>' : '') +
      '<h3><a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.name) + '</a></h3>' +
      '<p class="r-meta">' + esc([hrsText(c.hrs), paxWord(c.pax) + (c.paxConfirmed ? '' : ' (proposed)'), c.deliveryShort, c.dateShort ? 'from ' + c.dateShort : '', c.team].filter(Boolean).join(' · ')) + '</p>' +
      '<p>' + esc(c.one) + '</p>' + (c.whoLong ? '<p><b>Best for:</b> ' + esc(c.whoLong) + '</p>' : '') + '<ul>' + c.learn.map(l => '<li>' + esc(l) + '</li>').join('') + '</ul>' +
      '<details><summary>' + esc(cap(c.lessons ? c.count : 'Key learning areas')) + '</summary><ol>' + lessons.map((l, i) => lessonLi(c, l, i)).join('') + '</ol><p><b>Assessment:</b> ' + esc(c.assess) + '</p></details>' +
      '<p class="r-fee">' + money0(c.fee) + ' per participant before funding · ' + (c.wsq ? 'WSQ Statement of Attainment' : 'Vertical Institute certificate') + '</p></article>';
  });
  h += '</section>';
  const schedIdx = deck.slides.findIndex((s, i) => i < MAIN && s.sched);
  if (schedIdx >= 0) h += '<section class="r-sec" id="r-sched"><p class="r-kicker">Delivery</p><h2>Your training schedule</h2><p>A private class runs on your schedule, with only your team in the room. Choose a course and the number of days to see how the hours split.</p><div class="r-sched" data-i="' + schedIdx + '"></div></section>';
  const calcIdx = deck.calcIndices;
  if (calcIdx.length){
    h += '<section class="r-sec" id="r-invest"><p class="r-kicker">Investment</p><h2>What it costs, and what comes back</h2><p>Change the numbers to see your own figures. SkillsFuture funding' + (ctx.sfecOn ? ', the SkillsFuture Enterprise Credit (SFEC)' : '') + ' and GST are worked out for you.</p>';
    calcIdx.forEach(i => {
      const u = deck.slides[i].uenObj;
      h += (calcIdx.length > 1 && u ? '<h3 style="margin:14px 0 8px">' + esc(u.name) + '</h3>' : '') + '<div class="r-calc" data-i="' + i + '"></div>';
    });
    h += '</section>';
  }
  if (deck.slides.some(s => s.slideKey === 'sfeccompare')){
    const C = sfecCompare(ctx), R = sfecCompareSummary(ctx, C);
    const cellH = (v, n) => esc(v) + (n ? '<small>' + esc(n) + '</small>' : '');
    h += '<section class="r-sec" id="r-compare"><p class="r-kicker">Current vs redesigned SFEC</p><h2>How the redesigned SFEC works in ' + esc(poss(ctx.client)) + ' favour</h2>' +
      '<ol class="r-points">' + sfecComparePoints(ctx, C).map(p => '<li><b>' + esc(p[0]) + '.</b> ' + esc(p[1]) + '</li>').join('') + '</ol>' +
      '<div class="r-scroll"><table class="mt cmp"><thead><tr><th>Same cohort</th><th>Current SFEC<small>claimed back, until 30 Nov</small></th><th class="new">Redesigned SFEC<small>offset upfront, from 1 Dec</small></th></tr></thead><tbody>' +
      sfecCompareRows(ctx, C).map(r => '<tr class="' + (r.kind || '') + '"><td>' + cellH(r.label, r.note) + '</td><td' + (r.na ? ' class="na"' : '') + '>' + cellH(r.a, r.an) + '</td><td class="new' + (r.nb ? ' na' : '') + '">' + cellH(r.b, r.bn) + '</td></tr>').join('') +
      '</tbody></table></div><p class="r-callout"><b>' + esc(R.head) + '</b> ' + esc(R.tail) + '</p><p class="calc-note">' + esc(R.note) + '</p></section>';
  }
  const picks = pickCases(ctx);
  h += '<section class="r-sec"><p class="r-kicker">Why Vertical Institute</p><h2>An accredited partner with a track record</h2><div class="r-stats">' +
       TRUST_STATS.map(s => '<div><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>').join('') + '</div>' +
       picks.map(k => { const cs = CASES[k]; return '<div class="r-case"><h3>' + (cs.url ? '<a href="' + esc(cs.url) + '" target="_blank" rel="noopener">' + esc(cs.name) + '</a>' : esc(cs.name)) + '</h3><p>' + esc(cs.what) + '</p>' + (cs.quote ? '<blockquote>' + esc(cs.quote) + '</blockquote>' : '') + (cs.who ? '<small>' + esc(cs.who) + '</small>' : '') + '</div>'; }).join('') + '</section>';
  if (deck.slides.some(s => s.slideKey === 'others')){
    const oList = pickOthers(ctx), outs = courseOutcomes(ctx, oList), lpOf = k => otherPains(ctx).filter(p => p.other === k);
    h += '<section class="r-sec"><p class="r-kicker">More ways we can help</p><h2>Other courses you can consider</h2>' + oList.map(k => {
      const c = C[k], o = outs[k];
      return '<article class="r-course"><h3><a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.name) + '</a></h3>' +
        '<p class="r-meta">' + esc(hrsText(c.hrs) + ' · from ' + money(per(c, 70, ctx).up) + ' upfront per participant after funding' + (ctx.sfecOn && !ctx.isLegacySfec ? ' and SFEC' : '') + ', incl. GST') + '</p>' +
        (c.whoLong ? '<p><b>Best for:</b> ' + esc(c.whoLong) + '</p>' : '') + (lpOf(k).length ? '<p><b>You told us:</b> ' + esc(lpOf(k).map(p => endStop(p.text)).join(' ')) + '</p>' : '') +
        '<p><b>' + esc(lpOf(k).length ? painOutcome(c, lpOf(k)[0], o)[0] : o.head) + '.</b> ' + esc(lpOf(k).length ? painOutcome(c, lpOf(k)[0], o)[1] : o.body) + '</p></article>';
    }).join('') + '</section>';
  }
  h += '<section class="r-sec"><p class="r-kicker">Next steps</p><h2>From this proposal to a trained team</h2><ol class="r-steps">' + nextItems(ctx).map(x => '<li><b>' + esc(x[0]) + '.</b> ' + esc(x[1]) + '</li>').join('') + '</ol></section>';
  const web = String(C_.web || '').replace(/^https?:\/\//, '');
  const tel = String(C_.phones || '').split('/').map(s => s.trim()).filter(Boolean);
  h += '<section class="r-contact"><h2>' + esc(C_.name) + '</h2><p>' + esc(C_.title + ', ' + C_.org) + '</p><div class="acts">' +
       (C_.email ? '<a class="btn" href="mailto:' + esc(C_.email) + '">Email</a>' : '') +
       tel.map((n, i) => '<a class="btn" href="tel:+65' + esc(n.replace(/\s+/g, '')) + '">Call ' + esc(n) + '</a>').join('') +
       (web ? '<a class="btn" href="https://' + esc(web) + '" target="_blank" rel="noopener">' + esc(web) + '</a>' : '') + '</div></section>';
  h += '<details class="r-terms"><summary>Terms used in this proposal</summary><dl>' + GLOSSARY.map(g => '<dt>' + esc(g[0]) + '</dt><dd>' + esc(g[1]) + '</dd>').join('') + '</dl></details>';
  h += '<p class="r-foot">Prepared ' + esc(fmtLong(ctx.today)) + '. Course fees and hours as listed on verticalinstitute.com. Funding and SFEC are confirmed against the sponsoring company’s UEN at enrolment.</p></main>';
  app.innerHTML = h;
  app.querySelectorAll('.r-calc').forEach(el => calcForm(el, +el.dataset.i, () => {}));
  app.querySelectorAll('.r-sched').forEach(el => schedForm(el, +el.dataset.i, () => {}));
  wireCommon();
  const bs = $('bn-slides'); if (bs) bs.addEventListener('click', () => setLayout(prefer === 'scroll' ? 'scroll' : 'player', true));
  const bf = $('bn-fs'); if (bf) bf.addEventListener('click', fullScreen);
}

/* ---------- keyboard and resizing ---------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape'){ if (pop) { closePops(); return; } if ($('sheet')) { closeAdjust(); return; } }
  if (layout !== 'player') return;
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown'){ e.preventDefault(); step(1); }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp'){ e.preventDefault(); step(-1); }
  else if (e.key === 'Backspace' && isDetail(cur)){ e.preventDefault(); const s = deck.slides[cur]; go(s.parentIdx >= 0 ? s.parentIdx : 0); }
  else if (e.key === 'Home'){ e.preventDefault(); go(0); }
  else if (e.key === 'End'){ e.preventDefault(); go(MAIN - 1); }
});
let rT = 0;
window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => setLayout(autoLayout(), false), 80); });
document.title = meta.title + ' · Vertical Institute';
setLayout(autoLayout(), false);
})();

