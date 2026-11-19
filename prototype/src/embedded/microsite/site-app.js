
/* =====================================================================
   CLIENT MICROSITE (the one page a client sees on Google Sites or a website)
   Tabs: the proposal deck and the calculator, each in its own frame so nothing collides, then the
   team scoping survey, the enrol page and a contact page, which are part of this page.
   The calculator tells this page about every change (postMessage), so the enrol page and its Excel
   file always follow the plan the client last looked at. The survey posts to the consultant's Google
   Sheet when a link is set, and always offers email, WhatsApp and copy as a backup. Personal details
   for enrolment are never typed here: the client downloads an Excel file and fills it in offline.
   The same file also makes the survey-only page (one tab, no tab bar).
   ===================================================================== */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const txt = id => { const el = $(id); return el ? el.textContent : ''; };
const CFG = JSON.parse(txt('site-cfg'));
const ME = CFG.consultant || {};
const FIRST = ME.first || 'us';
const TABS = ['deck', 'calc0', 'calc', 'scope', 'enrol', 'contact'].filter(k => CFG.tabs && CFG.tabs[k]);
const NF2 = new Intl.NumberFormat('en-SG', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const money = c => 'S$' + NF2.format((c || 0) / 100);
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const nowText = () => { const d = new Date(); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() + ', ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };

/* Fonts: the same embedded files the deck uses, under the names the calculator and this page ask for */
const FONT_CSS = (typeof FONT_FILES === 'object' && FONT_FILES)
  ? [['B',400,'normal','Lato'],['BB',700,'normal','Lato'],['BI',400,'italic','Lato'],['BBI',700,'italic','Lato'],['HB',900,'normal','Merriweather']]
      .filter(x => FONT_FILES[x[0]])
      .map(([k, w, s, f]) => "@font-face{font-family:'" + f + "';src:url(data:font/ttf;base64," + FONT_FILES[k] + ") format('truetype');font-weight:" + w + ';font-style:' + s + ';font-display:swap}').join('\n')
  : '';
{ const st = document.createElement('style'); st.id = 'vi-font-css'; st.textContent = FONT_CSS; document.head.appendChild(st); }

const IC = {
  deck:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2.5" y="4" width="15" height="10" rx="1.6" stroke="currentColor" stroke-width="1.7"/><path d="M7 17h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  calc:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="4" y="2.5" width="12" height="15" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M7 6.5h6M7 10h1.5M11.5 10H13M7 13.5h1.5M11.5 13.5H13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  scope:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10.5l3.5 3.5L16 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  enrol:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="7.5" cy="7" r="3" stroke="currentColor" stroke-width="1.7"/><path d="M2.5 16.5c.6-2.8 2.5-4.2 5-4.2s4.4 1.4 5 4.2M15 6.5v5M12.5 9h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  contact:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h11A1.5 1.5 0 0 1 17 5.5v7a1.5 1.5 0 0 1-1.5 1.5H9l-4 3v-3h-.5A1.5 1.5 0 0 1 3 12.5v-7z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  wa:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 1 1-4.3 15.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 0 1 12 3.800zm-3.200 4c-.2 0-.5 0-.7.300-.3.300-1 .9-1 2.300s1 2.700 1.200 2.900c.1.200 2 3.200 5 4.400 2.400 1 2.900.800 3.400.700.600-.1 1.700-.7 1.900-1.400.3-.6.3-1.200.2-1.400-.1-.1-.3-.2-.6-.4l-2-1c-.3-.1-.5-.1-.7.200l-.9 1.100c-.2.200-.3.200-.6.100-.3-.2-1.200-.5-2.300-1.400-.9-.800-1.400-1.700-1.600-2-.2-.300 0-.5.100-.600l.5-.5.300-.5v-.5l-.9-2.200c-.2-.5-.4-.5-.6-.5h-.7z"/></svg>',
  mail:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2.5" y="4" width="15" height="12" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M3 5.5l7 5.5 7-5.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  gmail:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 15.5v-10l7 5.300 7-5.300v10" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 15.5h2.500M14.500 15.500H17" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
  call:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5.5 3h2.200l1.300 3.500-1.700 1.200a8.500 8.500 0 0 0 4.900 4.900l1.200-1.700 3.600 1.300v2.300a1.500 1.500 0 0 1-1.600 1.500A12.500 12.500 0 0 1 4 4.600 1.500 1.500 0 0 1 5.500 3z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  card:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2.5" y="4" width="15" height="12" rx="2" stroke="currentColor" stroke-width="1.7"/><circle cx="7.300" cy="9" r="1.800" stroke="currentColor" stroke-width="1.500"/><path d="M4.800 13.200c.5-1.200 1.400-1.700 2.500-1.700s2 .5 2.500 1.700M12.500 8.500h3M12.500 11.500h3" stroke="currentColor" stroke-width="1.500" stroke-linecap="round"/></svg>',
  web:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.700"/><path d="M3 10h14M10 3c2.300 2.300 2.300 11.700 0 14M10 3c-2.300 2.300-2.300 11.700 0 14" stroke="currentColor" stroke-width="1.500"/></svg>',
  ok:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.500 10.500l3.500 3.500 7.500-8" stroke="currentColor" stroke-width="2.300" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  warn:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 5.500v5.500" stroke="currentColor" stroke-width="2.300" stroke-linecap="round"/><circle cx="10" cy="14.300" r="1.300" fill="currentColor"/></svg>',
  guide:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7.2" stroke="currentColor" stroke-width="1.7"/><path d="M7.9 8a2.2 2.2 0 1 1 3.3 1.9c-.7.4-1.2.9-1.2 1.7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="10" cy="14" r="1" fill="currentColor"/></svg>',
  x:'<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.800" stroke-linecap="round"/></svg>',
  dl:'<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 3.500v9M6 9l4 4 4-4M4 16.500h12" stroke="currentColor" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
const LABEL = {deck:['Proposal deck','Proposal'], calc:['Interactive calculator','Calculator'], scope:['Team scoping','Scoping'], enrol:['Enrol','Enrol'], contact:['Contact','Contact']};
/* A draft with a Current SFEC calculator gets two calculator tabs, named by scheme */
IC.calc0 = IC.calc;
LABEL.calc0 = ['Nov 2026','Nov 2026'];
if (CFG.tabs && CFG.tabs.calc0) LABEL.calc = ['Dec 2026 &amp; onwards','Dec 2026 on'];
const isFrame = k => k === 'deck' || k === 'calc' || k === 'calc0';

/* ---------- the plan: the proposal's baseline until the calculator reports something else ---------- */
let plan = CFG.baseline || {entities: []};
let planAdjusted = false;
const ENTS = (CFG.baseline && CFG.baseline.entities) || [];
const multiEnt = ENTS.length > 1;
const planEnts = () => (plan.entities || []).filter(e => e.lines && e.lines.length);

/* ---------- unsent form drafts: kept in this browser where it allows ---------- */
const STORE_KEY = 'vi-site-' + String(CFG.id || 'x');
let D = {survey: {}, msg: null};
try { const raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); if (raw && typeof raw === 'object') D = {survey: raw.survey, msg: typeof raw.msg === 'string' ? raw.msg : null}; } catch (e) {}
if (!D.survey || typeof D.survey !== 'object' || Array.isArray(D.survey)) D.survey = {};
let saveT = 0;
const saveDraft = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(D)); } catch (e) {} }, 400); };

/* ---------- page skeleton ---------- */
const site = $('site');
const iconSrc = (typeof IMG === 'object' && IMG && IMG.icon && IMG.icon.src) || '';
site.innerHTML =
  '<header class="site-head">' +
    '<div class="brand">' + (iconSrc ? '<img src="' + esc(iconSrc) + '" alt="">' : '') +
      '<div class="brand-t"><b>' + esc((ME.org || 'Vertical Institute') + (CFG.client ? ' × ' + CFG.client : '')) + '</b><span>' + esc(CFG.title || 'Training proposal') + '</span></div></div>' +
    '<nav class="tabs" id="tabs" role="tablist" aria-label="Sections"' + (TABS.length < 2 ? ' hidden' : '') + '>' +
      TABS.map(k => '<button type="button" class="tab" role="tab" id="tab-' + k + '" data-tab="' + k + '" aria-controls="p-' + k + '" aria-selected="false" tabindex="-1">' + IC[k] +
        '<span class="t-l">' + LABEL[k][0] + '</span><span class="t-s">' + LABEL[k][1] + '</span>' + (k === 'enrol' ? '<span class="dot" id="plan-dot" hidden title="The plan was adjusted in the calculator"></span>' : '') + '</button>').join('') +
    '</nav>' +
    (CFG.tabs.deck && !CFG.lite ? '<button type="button" class="btn btn-sm hd-act" id="hd-dl">' + IC.dl + 'Download PDF</button>' : '') +
    (CFG.coach && TABS.length > 1 ? '<button type="button" class="btn btn-sm hd-guide" id="hd-guide" aria-label="Show the guided tour" title="Show the guided tour">' + IC.guide + '<span class="t-l">Guide</span></button>' : '') +
  '</header>' +
  '<main class="panels" id="panels">' +
    TABS.map(k => '<section class="panel' + (isFrame(k) ? '' : ' page') + '" id="p-' + k + '" role="tabpanel" aria-labelledby="tab-' + k + '"' + (isFrame(k) ? '' : ' tabindex="-1"') + '></section>').join('') +
  '</main><div class="sr" id="site-live" aria-live="polite"></div>';

let cur = null;
function show(tab, focus){
  if (!TABS.includes(tab)) tab = TABS[0];
  cur = tab;
  TABS.forEach(k => {
    const on = k === tab;
    $('p-' + k).classList.toggle('is-on', on);
    const b = $('tab-' + k); b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1;
    if (on) { try { b.scrollIntoView({block: 'nearest', inline: 'nearest'}); } catch (e) {} }
  });
  const hd = $('hd-dl'); if (hd) hd.hidden = tab !== 'deck';
  if (tab === 'enrol') { askCalc(); renderPlan(); }
  if (CFG.preview) { try { window.parent.postMessage({viSite: 1, type: 'tab', tab}, '*'); } catch (e) {} }
  if (focus) $('tab-' + tab).focus();
}
$('tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) show(b.dataset.tab); });
$('tabs').addEventListener('keydown', e => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
  e.preventDefault();
  const i = TABS.indexOf(cur), n = TABS.length;
  show(TABS[e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (i + (e.key === 'ArrowRight' ? 1 : n - 1)) % n], true);
});
document.addEventListener('click', e => { const g = e.target.closest('[data-goto]'); if (g) { e.preventDefault(); show(g.dataset.goto, true); } });
function toast(msg){
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 4200);
}
async function copyText(text, okMsg){
  let ok = false;
  try { if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); ok = true; } } catch (e) { ok = false; }
  if (!ok) {
    try { const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.focus(); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch (e) { ok = false; }
  }
  toast(ok ? okMsg : 'Copying is blocked here. Select the text in the box and copy it.');
  return ok;
}

/* ---------- frames: the deck and the calculator are whole pages of their own, built here from the parts this file carries ---------- */
const SC = '<' + '/script>';
const inline = s => '<script>' + s + SC;
const DECK_BRIDGE = 'window.addEventListener("message",function(e){var m=e.data;if(!m||m.viSite!==1||e.source!==window.parent)return;if(m.type==="deck-download"){var b=document.getElementById("b-dl");if(b){b.click();var p=document.querySelector("[data-x=pdf]");if(p)p.click();}}});';
function deckDoc(){
  return ['<!doctype html>', '<html lang="en">', '<head>', '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
    '<title>' + esc(CFG.title) + ' · Vertical Institute</title>',
    '<style>' + txt('d-hosted-css') + '</style>', '</head>',
    '<body class="vi-host">',
    '<div class="app" id="app"><p class="boot">Loading the proposal…</p></div>',
    inline(txt('vi-fonts')), inline(txt('vi-images')), inline(txt('d-content')), inline(txt('d-consts')),
    inline(txt('d-engine')), inline(txt('d-templates')), inline(txt('d-runtime')),
    '<script type="application/json" id="vi-state">' + txt('d-state') + SC,
    inline(txt('d-hosted-app')), inline(DECK_BRIDGE),
    '</body>', '</html>'].join('\n');
}
function calcDoc(cfgId){
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    + '<title>Corporate Training Calculator' + (CFG.client ? ' · ' + esc(CFG.client) : '') + '</title>\n'
    + '<script>(function(){var d=document.documentElement;try{if(window.self===window.top)return;}catch(e){}d.setAttribute("data-theme","light");d.classList.add("is-embedded");})();' + SC + '\n'
    + '<style id="vi-font-css">' + FONT_CSS + '</style>\n'
    + '<style id="app-css">' + txt('c-css') + '</style>\n</head>\n<body>\n'
    + '<div class="wrap is-client" id="wrap"><div class="app" id="app-root"></div></div>\n'
    + '<template id="app-shell">' + txt('c-shell') + '</template>\n'
    + '<script>window.CTC_CONFIG = ' + txt(cfgId || 'c-cfg') + ';' + SC + '\n'
    + '<script id="app-js">' + txt('c-app') + SC + '\n</body>\n</html>\n';
}
let calcFrame = null, deckFrame = null;
function mountFrame(tab, title, doc){
  const f = document.createElement('iframe');
  f.title = title;
  f.setAttribute('allow', 'fullscreen *; clipboard-write *');
  f.setAttribute('allowfullscreen', '');
  f.srcdoc = doc;
  $('p-' + tab).appendChild(f);
  return f;
}
if (CFG.tabs.deck) {
  if (CFG.lite) $('p-deck').innerHTML = '<div class="deck-off"><div><b>The proposal deck shows here in the client’s microsite.</b>This preview leaves it out so it stays quick. See it under Proposal slides, or press Preview for the whole site.</div></div>';
  else deckFrame = mountFrame('deck', 'Proposal deck', deckDoc());
}
const post = (frame, type) => { try { if (frame && frame.contentWindow) frame.contentWindow.postMessage({viSite: 1, type}, '*'); } catch (e) {} };
const askCalc = () => post(calcFrame, 'calc-request');
if (CFG.tabs.calc) {
  calcFrame = mountFrame('calc', 'Interactive fee and SFEC calculator', calcDoc());
  calcFrame.addEventListener('load', askCalc);
}
window.addEventListener('message', e => {
  const m = e.data;
  if (!m || m.viSite !== 1) return;
  if (calcFrame && e.source === calcFrame.contentWindow && m.type === 'calc-state' && m.data && Array.isArray(m.data.entities)) {
    plan = m.data; planAdjusted = !!m.data.changed;
    const dot = $('plan-dot'); if (dot) dot.hidden = !planAdjusted;
    if (CFG.tabs.enrol) renderPlan();
  } else if (CFG.preview && e.source === window.parent && m.type === 'goto' && typeof m.tab === 'string') show(m.tab);
});
{ const hd = $('hd-dl'); if (hd) hd.addEventListener('click', () => post(deckFrame, 'deck-download')); }

/* ---------- words for messages ---------- */
const greet = () => 'Hi ' + FIRST + ',';
const enc = encodeURIComponent;
const mailto = (subject, body) => 'mailto:' + enc(ME.email || '').replace(/%40/g, '@') + '?subject=' + enc(subject) + '&body=' + enc(body);
const gmail = (subject, body) => 'https://mail.google.com/mail/?view=cm&fs=1&to=' + enc(ME.email || '') + '&su=' + enc(subject) + '&body=' + enc(body);
const waLink = text => 'https://wa.me/' + enc(ME.wa || '') + (text ? '?text=' + enc(text) : '');
/* Mail links carry a limited length in some mail apps, so a long message is trimmed there and the full text offered to copy */
const clip = (s, n) => (s.length > n ? s.slice(0, n - 40).replace(/\s+\S*$/, '') + '\n[…shortened: the full details are in the copied summary]' : s);

/* ---------- sending: to the consultant's Sheet when a link is set; never claims more than it knows ---------- */
async function send(payload){
  if (CFG.preview) return 'preview';
  if (!CFG.hook) return 'none';
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = ctl ? setTimeout(() => ctl.abort(), 20000) : 0;
  try {
    await fetch(CFG.hook, {method: 'POST', mode: 'no-cors', redirect: 'follow', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify(payload), signal: ctl ? ctl.signal : undefined});
    // An opaque no-cors response cannot confirm that Apps Script stored the answer.
    return 'unconfirmed';
  } catch (e) { return 'failed'; }
  finally { clearTimeout(timer); }
}
const baseInfo = type => ({type, v: 1, sent: new Date().toISOString(), siteId: CFG.id, client: CFG.client || '', proposal: CFG.title || '', consultant: ME.name || ''});
function doneHTML(kind, res, sentHead){
  const good = res === 'sent' || res === 'preview';
  const head = res === 'unconfirmed' ? ['Response sent for processing', 'This browser cannot confirm delivery to the Google Sheet. Keep your copy below, or send it directly to your consultant.']
    : res === 'sent' ? (sentHead || ['Sent to ' + esc(FIRST), 'Keep a copy below in case you need it.'])
    : res === 'preview' ? ['This is where a participant sees “Thank you”', 'Preview only: nothing was sent. In the published page each response goes to your Google Sheet' + (CFG.hook ? '.' : ' once you add the link; without one, the participant sends it by email or WhatsApp.')]
    : res === 'failed' ? ['It couldn’t be sent automatically', 'Your network may block it. Nothing is lost: send it with one of the buttons below.']
    : ['One more step: send it to ' + esc(FIRST), 'Choose how to send it. Your answers are filled in already.'];
  return '<div class="card done' + (good ? '' : ' warn') + '" id="' + kind + '-done" tabindex="-1">' +
    '<div class="done-head"><span class="done-ic">' + (good ? IC.ok : IC.warn) + '</span><div><h2>' + head[0] + '</h2><p>' + head[1] + '</p></div></div>' +
    '<label class="f"><span>' + (good ? 'Your copy' : 'What will be sent') + '</span><textarea class="sum" id="' + kind + '-sum" readonly spellcheck="false"></textarea></label>' +
    '<div class="acts" style="margin-top:12px">' +
      (ME.email ? '<a class="btn' + (good ? '' : ' btn-primary') + '" id="' + kind + '-mail" target="_blank" rel="noopener">' + IC.mail + 'Send by email</a>' : '') +
      (ME.wa ? '<a class="btn' + (good ? '' : ' btn-wa') + '" id="' + kind + '-wa" target="_blank" rel="noopener">' + IC.wa + 'Send on WhatsApp</a>' : '') +
      '<button type="button" class="btn" id="' + kind + '-copy">Copy summary</button>' +
      '<button type="button" class="link" id="' + kind + '-again">Edit and send again</button>' +
      '<button type="button" class="link" id="' + kind + '-new">Start another response</button>' +
    '</div>' + (ME.email ? '<p class="fine">Email goes to ' + esc(ME.email) + (ME.wa ? ', WhatsApp to +' + esc(ME.wa.replace(/^(\d{2})(\d{4})(\d{4})$/, '$1 $2 $3')) : '') + '.</p>' : '') + '</div>';
}
function wireDone(kind, summary, subject, onAgain, onNew){
  $(kind + '-sum').value = summary;
  const m = $(kind + '-mail'); if (m) m.href = mailto(subject, clip(summary, 1700));
  const w = $(kind + '-wa'); if (w) w.href = waLink(clip(summary, 3500));
  $(kind + '-copy').addEventListener('click', () => copyText(summary, 'Summary copied.'));
  $(kind + '-again').addEventListener('click', onAgain);
  $(kind + '-new').addEventListener('click', onNew);
  const box = $(kind + '-done'); box.focus({preventScroll: true}); box.scrollIntoView({block: 'start'});
}
/* =====================================================================
   TEAM SCOPING: the pre-training survey, one response per participant
   The course choices are the courses in this proposal.
   ===================================================================== */
const SV = CFG.survey || {courses: []};
const SV_Q = [
  ['tasks', 'area', 'What are the top three daily or weekly tasks that take up most of your time?',
    'List each task on a separate line. Where possible, include how often you do it and how long it takes.',
    'Preparing client quotations — 30 minutes daily\nFollowing up on unpaid invoices — 1 hour weekly\nCompiling sales reports — 2 hours weekly'],
  ['tools', 'text', 'Which software or tools do you use most often at work?', 'For example: Excel, Outlook, Google Sheets, SAP or your company’s CRM.', ''],
  ['frustration', 'area', 'What is your biggest recurring frustration or bottleneck at work?', 'Describe what slows you down or causes repeated work.',
    '“I rewrite similar client follow-up emails every week because the names, prices and details change.”'],
  ['faster', 'area', 'What is one specific task you wish you could complete faster or more easily?',
    'Explain what you do, the steps involved and what you would like to improve. Include the time taken if you know it.',
    '“Every Friday, I export data from SAP, remove unnecessary columns and prepare a summary for my manager. It takes about 45 minutes. I would like to reduce the manual steps.”']
];
function buildSurvey(){
  const p = $('p-scope'); if (!p) return;
  const sv = D.survey, one = SV.courses.length === 1;
  const picked = k => (Array.isArray(sv.courses) ? sv.courses.includes(k) : one);
  const req = '<span class="req" aria-hidden="true">*</span>';
  p.innerHTML = '<div class="pg">' +
    '<div class="hero"><p class="eyb">' + esc(CFG.client || 'Your team') + ' · Pre-training survey</p><h1>Your work tasks and challenges</h1>' +
      '<p>Help us understand your day-to-day work so we can prepare relevant examples for your upcoming training. It takes about 5 minutes.</p></div>' +
    '<div id="sv-form-wrap">' +
    '<section class="card"><p class="lead">Please submit <b>one response per participant</b>. There are no right or wrong answers: specific examples, including small frustrations, are useful. Please avoid including confidential company or client information.</p>' +
      '<div class="grid2">' +
        '<label class="f" for="sv-name"><span>Name <em>(optional)</em></span><input type="text" id="sv-name" data-sv="name" autocomplete="name" value="' + esc(sv.name || '') + '"></label>' +
        '<label class="f" for="sv-dept"><span>Department ' + req + '</span><input type="text" id="sv-dept" data-sv="department" required aria-required="true" value="' + esc(sv.department || '') + '"><span class="err" id="sv-dept-e" hidden>Enter your department.</span></label>' +
      '</div>' +
      '<fieldset class="choices" id="sv-courses" style="margin-top:14px"><legend>Which course(s) will you be attending? ' + req + '</legend>' +
        SV.courses.map(c => '<label class="choice"><input type="checkbox" name="sv-course" value="' + esc(c.k) + '"' + (picked(c.k) ? ' checked' : '') + '><span>' + esc(c.name) + (c.meta ? '<small>' + esc(c.meta) + '</small>' : '') + '</span></label>').join('') +
        '<span class="err" id="sv-courses-e" hidden>Choose at least one course.</span></fieldset>' +
    '</section>' +
    '<section class="card" aria-labelledby="sv-h2"><h2 id="sv-h2">Your work tasks &amp; challenges</h2><div class="stack" style="margin-top:10px">' +
      SV_Q.map(([k, kind, q, help, ex]) => '<label class="f q" for="sv-' + k + '"><span>' + esc(q) + ' ' + req + '</span><small>' + esc(help) + '</small>' +
        (ex ? '<small class="ex"><b>Example</b>' + esc(ex).replace(/\n/g, '<br>') + '</small>' : '') +
        (kind === 'area' ? '<textarea id="sv-' + k + '" data-sv="' + k + '" rows="4" required aria-required="true">' + esc(sv[k] || '') + '</textarea>' : '<input type="text" id="sv-' + k + '" data-sv="' + k + '" required aria-required="true" value="' + esc(sv[k] || '') + '">') +
        '<span class="err" id="sv-' + k + '-e" hidden>This one is needed.</span></label>').join('') +
      '</div>' +
      '<input class="hp-field" type="text" id="sv-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<div class="send-row"><button type="button" class="btn btn-primary" id="sv-send">' + (CFG.hook || CFG.preview ? 'Submit' : 'Review and send') + '</button><p class="msg" id="sv-msg" role="status"></p></div>' +
    '</section></div><div id="sv-done-wrap"></div></div>';
  const clearErr = id => { const i = $(id), e = $(id + '-e'); if (i) i.removeAttribute('aria-invalid'); if (e) e.hidden = true; };
  p.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.sv; if (!k) return; D.survey[k] = e.target.value; clearErr(e.target.id); saveDraft(); });
  p.addEventListener('change', e => { if (e.target.name !== 'sv-course') return; D.survey.courses = [...p.querySelectorAll('input[name="sv-course"]:checked')].map(i => i.value); $('sv-courses-e').hidden = true; saveDraft(); });
  $('sv-send').addEventListener('click', submitSurvey);
}
const val = id => { const el = $(id); return el ? String(el.value || '').trim() : ''; };
function surveyData(){
  const keys = [...document.querySelectorAll('input[name="sv-course"]:checked')].map(i => i.value);
  return {name: val('sv-name'), department: val('sv-dept'), courseKeys: keys, courses: SV.courses.filter(c => keys.includes(c.k)).map(c => c.name),
    tasks: val('sv-tasks'), tools: val('sv-tools'), frustration: val('sv-frustration'), faster: val('sv-faster')};
}
function surveySummary(d){
  return [greet(), '', 'Here is my pre-training survey for ' + (CFG.title || 'our training') + '.', '',
    'NAME: ' + (d.name || 'Not given'), 'DEPARTMENT: ' + d.department, 'COURSE(S): ' + d.courses.join('; '), '',
    'TOP THREE TASKS', d.tasks, '', 'SOFTWARE OR TOOLS', d.tools, '', 'BIGGEST FRUSTRATION OR BOTTLENECK', d.frustration, '', 'ONE TASK TO DO FASTER OR MORE EASILY', d.faster, '',
    (CFG.client ? CFG.client + ' · ' : '') + 'Sent ' + nowText()].join('\n');
}
let sending = false;
async function submitSurvey(){
  if (sending) return;
  const msg = $('sv-msg'); msg.className = 'msg'; msg.textContent = '';
  const d = surveyData();
  let first = null;
  const bad = (id, isBad, focusEl) => { const i = $(id), er = $(id + '-e'); if (i && i.tagName !== 'FIELDSET') i.setAttribute('aria-invalid', String(isBad)); if (er) er.hidden = !isBad; if (isBad && !first) first = focusEl || i; };
  bad('sv-dept', !d.department);
  bad('sv-courses', !d.courseKeys.length, document.querySelector('input[name="sv-course"]'));
  SV_Q.forEach(([k]) => bad('sv-' + k, !d[k]));
  if (first) { msg.className = 'msg is-error'; msg.textContent = 'A few answers are still needed.'; first.focus(); return; }
  if (val('sv-hp')) return;
  const summary = surveySummary(d), subject = 'Pre-training survey: ' + (d.name || d.department) + (CFG.client ? ', ' + CFG.client : '');
  sending = true; $('sv-send').disabled = true; msg.textContent = CFG.hook && !CFG.preview ? 'Sending…' : '';
  const res = await send(Object.assign(baseInfo('survey'), {name: d.name, department: d.department, courses: d.courses, tasks: d.tasks, tools: d.tools, frustration: d.frustration, faster: d.faster, summary}));
  sending = false; $('sv-send').disabled = false; msg.textContent = '';
  $('sv-form-wrap').hidden = true;
  $('sv-done-wrap').innerHTML = doneHTML('sv', res, res === 'sent' ? ['Thank you, your response is in', 'Your answers help the trainer prepare examples from your own work. Colleagues can submit theirs from this page too.'] : null);
  wireDone('sv', summary, subject, () => { $('sv-done-wrap').innerHTML = ''; $('sv-form-wrap').hidden = false; $('sv-send').focus(); }, () => {
    // the next participant starts from a clean form
    D.survey = {}; saveDraft(); buildSurvey(); $('p-scope').scrollTop = 0; const n = $('sv-name'); if (n) n.focus();
  });
  $('site-live').textContent = res === 'sent' ? 'Submitted.' : res === 'failed' ? 'It could not be sent automatically. Use the buttons to send it.' : '';
}

/* =====================================================================
   ENROL: the plan, and the participant list as an Excel file to fill in offline
   Names, NRIC, dates of birth and phone numbers are never typed into this page.
   ===================================================================== */
function planHTML(){
  const ents = planEnts();
  if (!ents.length) return '<p class="plan-empty">No courses are selected' + (CFG.tabs.calc ? '. Add them in the <button type="button" class="link" data-goto="calc">calculator</button>, then come back here.' : ' yet.') + '</p>';
  return ents.map(e => {
    const rows = e.lines.map(l => '<tr><td><b>' + esc(l.name) + '</b><small>' + esc(l.runText) + '</small></td><td>' + l.qty + '<small>' + esc(l.mixText) + '</small></td><td class="n">' + money(l.up) + '</td></tr>').join('');
    const t = e.totals || {qty: 0, up: 0, sfec: 0};
    return '<div class="plan-ent">' + (multiEnt || e.uen || e.name ? '<h3>' + esc(e.name || e.label || CFG.client || '') + (e.uen ? ' <small>· UEN ' + esc(e.uen) + '</small>' : '') + '</h3>' : '') +
      '<div class="tw" tabindex="0" role="region" aria-label="Courses and participants"><table class="pt"><thead><tr><th scope="col">Course</th><th scope="col">Participants</th><th scope="col" class="n">Estimated upfront</th></tr></thead><tbody>' + rows +
      '<tr class="tot"><td>Total' + (e.sfecOn && t.sfec ? '<small>' + (CFG.sfecMode === 'legacy' ? 'SFEC claimable after the course: ' + money(t.sfec) : 'After ' + money(t.sfec) + ' of SFEC (Enhanced)') + '</small>' : '') + '</td><td>' + t.qty + '</td><td class="n">' + money(t.up) + '</td></tr></tbody></table></div></div>';
  }).join('');
}
const schedOf = l => { const m = (CFG.sched || {})[l.k]; return m ? m + ' ' + (l.time === 'eve' ? 'weekend' : 'weekday') : ''; };
const xlsxRows = e => [].concat(...e.lines.map(l => Array.from({length: l.qty}, () => ({course: VIX.courseName(l.k), schedule: schedOf(l)}))));
const xlsxName = e => 'Company_Sponsored_Learners_' + String((multiEnt && (e.name || e.label)) || CFG.client || 'Participants').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') + '.xlsx';
function renderPlan(){
  const box = $('en-plan'); if (!box) return;
  box.innerHTML = planHTML();
  const pill = $('en-pill');
  pill.className = 'pill' + (planAdjusted ? ' adj' : '');
  pill.textContent = planAdjusted ? 'Adjusted in the calculator' : 'As proposed';
  const rs = $('en-reset'); if (rs) rs.hidden = !planAdjusted;
  const ents = planEnts(), dl = $('en-dl');
  dl.innerHTML = ents.length ? ents.map(e => {
    const n = Math.min(VIX.MAX, e.totals ? e.totals.qty : 0);
    return '<button type="button" class="btn btn-primary" data-xlsx="' + esc(e.id) + '">' + IC.dl + 'Download Excel' + (multiEnt ? ': ' + esc(e.name || e.label) : '') + '</button><span class="dl-meta">' + esc(xlsxName(e)) + ' · ' + plural(n, 'row', 'rows') + ' ready, one per participant</span>';
  }).join('') : '<p class="plan-empty">The Excel file is ready once the plan has a course.</p>';
}
function downloadXlsx(id){
  const e = planEnts().find(x => x.id === id); if (!e) return;
  const name = xlsxName(e);
  if (CFG.preview) { toast('Preview: the published microsite downloads ' + name + ' here. To get the file now, use Download the enrolment Excel in the builder.'); return; }
  try {
    const url = URL.createObjectURL(new Blob([VIX.build(xlsxRows(e))], {type: VIX.MIME}));
    const a = document.createElement('a'); a.href = url; a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    $('en-dl-note').hidden = false;
    $('site-live').textContent = 'Downloading ' + name + '.';
  } catch (err) { toast('The file could not be made here. Please ask ' + FIRST + ' to email it to you.'); }
}
function buildEnrol(){
  const p = $('p-enrol'); if (!p) return;
  const subject = 'Participant list: ' + (CFG.title || 'training proposal');
  const body = greet() + '\n\nPlease find attached our completed participant list for ' + (CFG.title || 'the training') + '.\n\n' + (CFG.contactName ? CFG.contactName + (CFG.client ? ', ' + CFG.client : '') : (CFG.client || ''));
  p.innerHTML = '<div class="pg">' +
    '<div class="hero"><p class="eyb">' + esc(CFG.client || 'Your team') + ' · Enrolment</p><h1>Enrol your participants</h1><p>Download the participant list, fill it in on your own computer, and send it to ' + esc(FIRST) + '. Personal details such as NRIC numbers are never entered on this page.</p></div>' +
    '<section class="card" aria-labelledby="en-plan-h"><div class="card-head"><h2 id="en-plan-h">1. Check your plan</h2><span class="pill" id="en-pill">As proposed</span></div>' +
      '<div id="en-plan"></div>' +
      '<div class="acts" style="margin-top:12px"' + (CFG.tabs.calc ? '' : ' hidden') + '>' + (CFG.tabs.calc ? '<button type="button" class="btn btn-sm" data-goto="calc">' + IC.calc + 'Change courses or headcount</button><button type="button" class="link" id="en-reset" hidden>Reset to the proposal</button>' : '') + '</div>' +
      '<p class="plan-note">Figures are estimates, including 9% GST, and are confirmed against the sponsoring company’s UEN at enrolment.</p></section>' +
    '<section class="card" aria-labelledby="en-dl-h"><h2 id="en-dl-h">2. Download the participant list</h2>' +
      '<p>An Excel file with a row for each participant in your plan. Course and Course Schedule are filled in already' + (multiEnt ? ', and there is one file for each sponsoring company' : '') + '.</p>' +
      '<div class="dl-row" id="en-dl"></div>' +
      '<p class="fine" id="en-dl-note" hidden>If nothing was saved, your browser is blocking downloads on this page. Ask ' + esc(FIRST) + ' to email the file to you.</p>' +
      '<ol class="howto"><li>Fill in one row per learner: <b>Participant Name</b>, <b>Email</b>, <b>DOB</b> as DD/MM/YYYY, <b>NRIC/FIN/ID</b> and <b>Phone Number</b>. Leave the headers as they are.</li>' +
        '<li><b>Nationality</b> has a dropdown: Singapore Citizen, Singapore PR or Foreigner.</li>' +
        '<li><b>Course</b> and <b>Course Schedule</b> are set from your plan. Change them from the dropdown if someone moves course; learners with the same course and schedule go into one class.</li>' +
        '<li>Delete any rows you don’t need, or add rows for extra participants. The same person can be on two different courses.</li></ol></section>' +
    '<section class="card" aria-labelledby="en-send-h"><h2 id="en-send-h">3. Send it to ' + esc(FIRST) + '</h2><p>Email the completed file as an attachment. The buttons open a message addressed to ' + esc(FIRST) + '; attach the file before you send.</p>' +
      '<div class="acts">' + (ME.email ? '<a class="btn" id="en-mail" target="_blank" rel="noopener">' + IC.mail + 'Email ' + esc(FIRST) + '</a><a class="btn" id="en-gmail" target="_blank" rel="noopener">' + IC.gmail + 'Email with Gmail</a>' : '') + '</div>' +
      (ME.email ? '<p class="fine">Sends to ' + esc(ME.email) + '.</p>' : '') + '</section>' +
    (CFG.enrolUrl ? '<section class="card"><div class="card-head"><h2>Prefer our standard enrolment form?</h2><a class="btn btn-sm" href="' + esc(CFG.enrolUrl) + '" target="_blank" rel="noopener">Open the enrolment form</a></div></section>' : '') +
    '</div>';
  const m = $('en-mail'); if (m) m.href = mailto(subject, body);
  const g = $('en-gmail'); if (g) g.href = gmail(subject, body);
  $('en-dl').addEventListener('click', e => { const b = e.target.closest('[data-xlsx]'); if (b) downloadXlsx(b.dataset.xlsx); });
  const rs = $('en-reset'); if (rs) rs.addEventListener('click', () => { post(calcFrame, 'calc-reset'); toast('Back to the proposed plan.'); });
  renderPlan();
}

/* =====================================================================
   CONTACT: WhatsApp, email (their mail app, or Gmail in the browser), call, and a contact card to save
   ===================================================================== */
const defaultMsg = () => greet() + ' ' + (CFG.contactName ? 'this is ' + CFG.contactName + (CFG.client ? ' from ' + CFG.client : '') + '. ' : (CFG.client ? 'I’m writing from ' + CFG.client + '. ' : '')) + 'I have a question about our training proposal' + (CFG.title ? ' (' + CFG.title + ')' : '') + '.';
const curMsg = () => (CFG.msg === false ? '' : (D.msg != null ? D.msg : defaultMsg()));
function vcard(){
  const parts = String(ME.name || '').trim().split(/\s+/), last = parts.length > 1 ? parts.pop() : '', v = s => String(s || '').replace(/([,;\\])/g, '\\$1');
  const L = ['BEGIN:VCARD', 'VERSION:3.0', 'N:' + v(last) + ';' + v(parts.join(' ')) + ';;;', 'FN:' + v(ME.name)];
  if (ME.org) L.push('ORG:' + v(ME.org));
  if (ME.title) L.push('TITLE:' + v(ME.title));
  (ME.tels || []).forEach(t => L.push('TEL;TYPE=' + (t.mobile ? 'CELL' : 'WORK') + ',VOICE:' + t.e164));
  if (ME.email) L.push('EMAIL;TYPE=WORK:' + ME.email);
  if (ME.web) L.push('URL:https://' + String(ME.web).replace(/^https?:\/\//, ''));
  L.push('END:VCARD');
  return L.join('\r\n');
}
function refreshContactLinks(){
  if (!$('ct-wa') && !$('ct-mail')) return;
  const text = curMsg(), subject = 'Training proposal' + (CFG.title ? ': ' + CFG.title : '');
  const a = $('ct-wa'); if (a) a.href = waLink(text);
  const b = $('ct-mail'); if (b) b.href = mailto(subject, text);
  const c = $('ct-gmail'); if (c) c.href = gmail(subject, text);
}
function buildContact(){
  const p = $('p-contact'); if (!p) return;
  const tels = ME.tels || [], initials = String(ME.name || 'VI').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const way = (id, cls, icon, title, sub, attrs) => '<a class="way' + (cls ? ' ' + cls : '') + '"' + (id ? ' id="' + id + '"' : '') + ' ' + attrs + '><span class="way-ic">' + icon + '</span><span><b>' + title + '</b><span>' + esc(sub) + '</span></span></a>';
  p.innerHTML = '<div class="pg">' +
    '<div class="hero"><p class="eyb">' + esc(CFG.client || 'Your team') + ' · Contact</p><h1>Talk to ' + esc(FIRST) + '</h1><p>Questions on the proposal, funding or dates? Pick whichever is easiest.</p></div>' +
    '<section class="card"><div class="who"><span class="who-av" aria-hidden="true">' + esc(initials) + '</span><div><h2>' + esc(ME.name || '') + '</h2><p>' + esc([ME.title, ME.org].filter(Boolean).join(', ')) + '</p></div></div>' +
      (CFG.msg === false ? '' : '<label class="f" for="ct-msg" style="margin-bottom:12px"><span>Your message <em>(WhatsApp and email open with this filled in; edit it first if you like)</em></span><textarea id="ct-msg" rows="3"></textarea></label>') +
      '<div class="ways">' +
        (ME.wa ? way('ct-wa', 'wa', IC.wa, 'WhatsApp', 'Chat with ' + FIRST + ' on +' + ME.wa.replace(/^(\d{2})(\d{4})(\d{4})$/, '$1 $2 $3'), 'target="_blank" rel="noopener"') : '') +
        (ME.email ? way('ct-mail', '', IC.mail, 'Email', 'Opens your mail app · ' + ME.email, 'target="_blank" rel="noopener"') : '') +
        (ME.email ? way('ct-gmail', '', IC.gmail, 'Email with Gmail', 'Opens Gmail in your browser', 'target="_blank" rel="noopener"') : '') +
        tels.map(t => way('', '', IC.call, 'Call ' + esc(t.text), t.mobile ? 'Mobile' : 'Office', 'href="tel:' + esc(t.e164) + '"')).join('') +
        way('ct-vcf', '', IC.card, 'Save contact', 'Adds ' + FIRST + ' to your phone or computer', 'download="' + esc(String(ME.name || 'Contact').replace(/[^\w .-]+/g, '')) + '.vcf"') +
        (ME.web ? way('', '', IC.web, 'Website', String(ME.web).replace(/^https?:\/\//, ''), 'href="https://' + esc(String(ME.web).replace(/^https?:\/\//, '')) + '" target="_blank" rel="noopener"') : '') +
      '</div>' +
      '<dl class="dl-list">' + (ME.email ? '<dt>Email</dt><dd>' + esc(ME.email) + '</dd>' : '') + tels.map(t => '<dt>' + (t.mobile ? 'Mobile' : 'Office') + '</dt><dd>' + esc(t.e164.replace(/^\+65/, '+65 ').replace(/(\d{4})(\d{4})$/, '$1 $2')) + '</dd>').join('') + '</dl>' +
      '<p class="fine">If a button doesn’t open anything, your browser is blocking it here: the details above work anywhere.</p>' +
    '</section></div>';
  $('ct-vcf').href = 'data:text/vcard;charset=utf-8,' + enc(vcard());
  const m = $('ct-msg');
  if (m) { m.value = curMsg(); m.addEventListener('input', () => { D.msg = m.value; saveDraft(); refreshContactLinks(); }); }
  refreshContactLinks();
}

/* =====================================================================
   GUIDED TOUR (experimental): coach marks that walk a first-time visitor through the tabs
   Starts once on a first visit, and again from the Guide button. Each step lights up one tab, shows
   that tab behind it and says what it is for. Skip, the Esc key or Done ends it.
   ===================================================================== */
const TOUR_KEY = 'vi-site-tour-' + String(CFG.id || 'x');
const TOUR_TEXT = {
  deck: ['Proposal deck', 'Start here. Use Next and Back at the bottom, or your arrow keys, to go through the slides. Page view turns it into one scrolling page, and Download saves a PDF or PowerPoint.'],
  calc: ['Interactive calculator', 'Try your own numbers: change the courses, the participants or your SFEC balance and press Calculate. Reset to proposed baseline brings the proposal’s figures back.'],
  scope: ['Team scoping', 'Each participant spends about 5 minutes telling us about their day-to-day work, so the trainer can prepare examples that fit. Share this page with your team when you are ready.'],
  enrol: ['Enrol', 'When you are ready to go ahead, download the participant list as an Excel file, fill it in on your own computer and email it back. It follows the plan in the calculator.'],
  contact: ['Contact', 'Questions at any point? WhatsApp, email or call ' + FIRST + ' from here.'],
  calc0: ['Nov 2026 calculator', 'For training completed by 30 November 2026, on the current SFEC. Change the participants or your SFEC balance and press Calculate to see what you pay upfront and what is reimbursed after the course.']
};
let tour = null;
function tourSteps(){
  const steps = [{title: 'Welcome' + (CFG.client ? ', ' + CFG.client : ''), text: 'Everything for ' + (CFG.title || 'your training proposal') + ' is on this one page. Here is a quick look at where things are. It takes under a minute.', target: null}];
  if (TABS.length > 1) steps.push({title: 'Move between sections', text: 'These tabs are always at the top. Whatever you change in the calculator carries into the Enrol tab.', target: 'tabs'});
  // On a phone the deck is a scrolling page, so its step says so
  const deckPhone = 'Start here: scroll down to read the proposal. Slides switches to the slide view, and Download saves a PDF or PowerPoint.';
  TABS.forEach(k => steps.push({title: TOUR_TEXT[k][0], text: k === 'deck' && window.innerWidth < 640 ? deckPhone : TOUR_TEXT[k][1], target: 'tab-' + k, tab: k}));
  return steps;
}
function tourSeen(){ try { return localStorage.getItem(TOUR_KEY) === '1'; } catch (e) { return false; } }
function endTour(){
  if (!tour) return;
  window.removeEventListener('resize', placeTour);
  document.removeEventListener('keydown', tourKeys, true);
  tour.root.remove();
  const back = tour.back; tour = null;
  try { localStorage.setItem(TOUR_KEY, '1'); } catch (e) {}
  show(back);
  const g = $('hd-guide'); if (g) g.focus();
}
function tourKeys(e){
  if (!tour) return;
  if (e.key === 'Escape') { e.preventDefault(); endTour(); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); stepTour(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); stepTour(-1); }
  else if (e.key === 'Tab') {
    // keep the keyboard inside the card while the tour is open
    const f = [...tour.card.querySelectorAll('button')], i = f.indexOf(document.activeElement);
    e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1) + f.length) % f.length].focus();
  }
}
function placeTour(){
  if (!tour) return;
  const s = tour.steps[tour.i], el = s.target ? $(s.target) : null, hole = tour.hole, card = tour.card;
  const vw = window.innerWidth, vh = window.innerHeight, pad = 5;
  if (!el) {
    hole.style.cssText = 'left:50%;top:50%;width:0;height:0';
    card.style.left = Math.max(8, (vw - card.offsetWidth) / 2) + 'px';
    card.style.top = Math.max(8, (vh - card.offsetHeight) / 2) + 'px';
    card.removeAttribute('data-arrow');
    return;
  }
  const r = el.getBoundingClientRect();
  const x = Math.max(2, r.left - pad), y = Math.max(2, r.top - pad), w = Math.min(vw - x - 2, r.width + 2 * pad), h = r.height + 2 * pad;
  hole.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px';
  const cw = card.offsetWidth, ch = card.offsetHeight;
  const left = Math.max(8, Math.min(vw - cw - 8, x + w / 2 - cw / 2));
  let top = y + h + 12;
  if (top + ch > vh - 8) top = Math.max(8, vh - ch - 8);
  card.style.left = left + 'px'; card.style.top = top + 'px';
  card.setAttribute('data-arrow', '1');
  card.style.setProperty('--ax', Math.max(18, Math.min(cw - 18, x + w / 2 - left)) + 'px');
}
function stepTour(d){
  if (!tour) return;
  const n = tour.steps.length, i = tour.i + d;
  if (i < 0) return;
  if (i >= n) { endTour(); return; }
  tour.i = i;
  const s = tour.steps[i];
  if (s.tab) show(s.tab);
  tour.card.innerHTML = '<p class="tour-n">' + (i ? 'Step ' + i + ' of ' + (n - 1) : 'Quick tour') + '</p><h2 id="tour-h">' + esc(s.title) + '</h2><p id="tour-p">' + esc(s.text) + '</p>' +
    '<div class="tour-acts">' + (i === n - 1 ? '' : '<button type="button" class="link" data-tour="skip">Skip</button>') + '<span class="grow"></span>' +
    (i > 0 ? '<button type="button" class="btn btn-sm" data-tour="back">Back</button>' : '') +
    '<button type="button" class="btn btn-sm btn-primary" data-tour="next">' + (i === 0 ? 'Show me' : i === n - 1 ? 'Done' : 'Next') + '</button></div>';
  placeTour();
  // a tab that has just been scrolled into view settles a moment later
  setTimeout(placeTour, 60);
  tour.card.querySelector('[data-tour="next"]').focus();
}
function startTour(){
  if (tour || !TABS.length) return;
  const root = document.createElement('div');
  root.className = 'tour';
  root.innerHTML = '<div class="tour-hole" aria-hidden="true"></div><div class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-h" aria-describedby="tour-p"></div>';
  document.body.appendChild(root);
  tour = {root, hole: root.firstChild, card: root.lastChild, steps: tourSteps(), i: 0, back: cur};
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-tour]'); if (!b) return;
    if (b.dataset.tour === 'skip') endTour(); else stepTour(b.dataset.tour === 'back' ? -1 : 1);
  });
  window.addEventListener('resize', placeTour);
  document.addEventListener('keydown', tourKeys, true);
  stepTour(0);
}

if (CFG.tabs.scope) buildSurvey();
if (CFG.tabs.enrol) buildEnrol();
if (CFG.tabs.contact) buildContact();
/* Nov 2026 tab: the same calculator on the current SFEC's mechanics; the simple page below is only a fallback */
if (CFG.tabs.calc0) { if (txt('c0-cfg') && txt('c-app')) mountFrame('calc0', 'Fee and SFEC calculator for November 2026', calcDoc('c0-cfg')); else { $('p-calc0').classList.add('page'); buildLegacyCalc(); } }
/* =====================================================================
   CURRENT SFEC CALCULATOR (v1): a second calculator tab, for training completed by 30 Nov 2026
   Fees and GST are paid upfront; the current SFEC reimburses a share of the nett fee after the course,
   pass holders included. Filled from the draft's legacyCalc setting (CFG.legacy).
   ===================================================================== */
function buildLegacyCalc(){
  const p = $('p-calc0'), L = CFG.legacy;
  if (!p || !L || !Array.isArray(L.rows)) return;
  const css = document.createElement('style');
  css.textContent = '.lc-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:22px;align-items:start}' +
    '@media (max-width:760px){.lc-grid{grid-template-columns:minmax(0,1fr)}}' +
    '.lc-course h2{margin:0 0 2px}.lc-course{margin-bottom:10px}' +
    '.lc-row{display:grid;grid-template-columns:minmax(0,1fr) auto 86px;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--line,#DCE1EE)}' +
    '.lc-row b{display:block;font-size:15px;line-height:1.25}.lc-row small{display:block;color:var(--muted,#5C6381);font-size:13px}' +
    '.lc-step{display:inline-flex;align-items:center;gap:6px}' +
    '.lc-step button{width:36px;height:36px;border:1px solid var(--line,#DCE1EE);background:#fff;border-radius:9px;font:inherit;font-size:18px;font-weight:700;color:var(--accent-2,#2254F6);cursor:pointer}' +
    '.lc-step button:disabled{opacity:.4;cursor:not-allowed}' +
    '.lc-step output{min-width:28px;text-align:center;font-weight:900;font-size:17px}' +
    '.lc-amt{text-align:right;font-weight:700}' +
    '.lc-wal{background:var(--soft,#ECEFF8);border-radius:14px;padding:16px}' +
    '.lc-bal{display:flex;align-items:center;justify-content:space-between;gap:10px;font-weight:700}' +
    '.lc-money{display:inline-flex;align-items:center;gap:6px;background:#fff;border:1px solid var(--line,#DCE1EE);border-radius:9px;padding:6px 10px}' +
    '.lc-money input{width:96px;border:0;outline:0;background:none;font:inherit;font-weight:900;text-align:right;color:inherit}' +
    '.lc-bar{height:14px;border-radius:999px;background:#fff;overflow:hidden;margin:12px 0 8px}.lc-bar i{display:block;height:100%;width:0;background:var(--accent,#2A3FB1)}' +
    '.lc-msg{font-weight:700;color:var(--accent-2,#2254F6);margin:0 0 12px}' +
    '.lc-fig{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 12px;margin:0;font-size:14.5px}.lc-fig dt{color:var(--muted,#5C6381)}.lc-fig dd{margin:0;font-weight:900;text-align:right}' +
    '.lc-fig .g{color:#2D7A2D}.lc-fig .t{border-top:1px solid var(--line,#DCE1EE);padding-top:8px}';
  document.head.appendChild(css);
  const r2 = n => Math.round(n * 100) / 100;
  const fm = n => { n = r2(n); return 'S$' + n.toLocaleString('en-SG', {minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2}); };
  const t70 = L.tier === 70;
  const KIND = (t70 ? [['scpr', 'Citizens and PRs', '70% SkillsFuture funding', 0.3]]
    : [['scpr', 'Citizens below 40 and PRs', '50% SkillsFuture funding', 0.5], ['sc40', 'Citizens aged 40 and above', '70% SkillsFuture funding', 0.3]])
    .concat([['pass', 'Pass holders', 'Full fee, no SkillsFuture funding', 1]]);
  const rows = L.rows.map(r => ({name: r.name, note: r.note, fee: r.fee, train: r.train, q: {scpr: (r.scpr || 0) + (t70 ? (r.sc40 || 0) : 0), sc40: t70 ? 0 : (r.sc40 || 0), pass: r.pass || 0}}));
  const base = rows.map(r => Object.assign({}, r.q));
  let bal = L.balance || 0;
  p.innerHTML = '<div class="pg">' +
    '<div class="hero"><p class="eyb">' + esc(CFG.client || 'Your team') + ' · Current SFEC, until 30 Nov 2026</p><h1>How far your current SFEC goes</h1>' +
      '<p>For training completed by 30 November 2026. The company pays the fees and GST upfront, and the current SFEC reimburses up to ' + Math.round(L.rate * 100) + '% of the nett course fee after the course. It covers pass holders too, which SFEC (Enhanced) from 1 December 2026 does not.</p></div>' +
    '<section class="card"><div class="lc-grid"><div>' +
      rows.map((r, i) => '<div class="lc-course"><h2>' + esc(r.name) + '</h2>' + (r.note ? '<p class="fine">' + esc(r.note) + '</p>' : '') +
        KIND.map(([k, lab, sub, sh]) => '<div class="lc-row"><span><b>' + lab + '</b><small>' + sub + ' · ' + fm(r.fee * sh) + ' nett per participant</small></span>' +
          '<span class="lc-step"><button type="button" data-lc="-1" data-i="' + i + '" data-k="' + k + '" aria-label="One fewer: ' + lab + '">−</button>' +
          '<output id="lc-q-' + i + '-' + k + '">0</output>' +
          '<button type="button" data-lc="1" data-i="' + i + '" data-k="' + k + '" aria-label="One more: ' + lab + '">+</button></span>' +
          '<span class="lc-amt" id="lc-a-' + i + '-' + k + '"></span></div>').join('') + '</div>').join('') +
      '<p class="fine">Nett fees are after SkillsFuture course fee funding and before GST. <button type="button" class="link" id="lc-reset">Reset to the proposed numbers</button></p>' +
    '</div><div class="lc-wal">' +
      '<label class="lc-bal" for="lc-bal"><span>Current SFEC balance</span><span class="lc-money">S$<input type="text" id="lc-bal" inputmode="decimal" autocomplete="off"></span></label>' +
      '<div class="lc-bar" aria-hidden="true"><i id="lc-bar"></i></div>' +
      '<p class="lc-msg" id="lc-msg" aria-live="polite"></p>' +
      '<dl class="lc-fig">' +
        '<dt>Paid upfront, before claims (fees and GST)</dt><dd id="lc-up"></dd>' +
        '<dt>Of which GST (' + Math.round(L.gst * 100) + '%)</dt><dd id="lc-gst"></dd>' +
        '<dt>SFEC reimbursed after the course</dt><dd class="g" id="lc-sfec"></dd>' +
        '<dt>Absentee Payroll claimable (Citizens and PRs)</dt><dd class="g" id="lc-ap"></dd>' +
        '<dt class="t">Nett cost after SFEC and claims</dt><dd class="t" id="lc-net"></dd>' +
        '<dt>If GST-registered, after claiming the GST as input tax</dt><dd id="lc-net2"></dd>' +
        '<dt>SFEC balance left unused</dt><dd id="lc-left"></dd>' +
      '</dl>' +
    '</div></div></section></div>';
  function paint(){
    let nett = 0, full = 0, hrs = 0, pax = 0;
    rows.forEach((r, i) => KIND.forEach(([k, lab, sub, sh]) => {
      const n = r.q[k] || 0;
      nett += n * r.fee * sh; full += n * r.fee; pax += n;
      if (k !== 'pass') hrs += n * r.train;
      $('lc-q-' + i + '-' + k).textContent = String(n);
      $('lc-a-' + i + '-' + k).textContent = n ? fm(n * r.fee * sh) : '';
      const minus = p.querySelector('[data-lc="-1"][data-i="' + i + '"][data-k="' + k + '"]');
      if (minus) minus.disabled = !n;
    }));
    const gst = r2(full * L.gst), up = nett + gst, claim = r2(nett * L.rate), sfec = Math.min(bal, claim), ap = hrs * L.ap, net = up - sfec - ap;
    $('lc-up').textContent = fm(up);
    $('lc-gst').textContent = fm(gst);
    $('lc-sfec').textContent = fm(sfec);
    $('lc-ap').textContent = fm(ap);
    $('lc-net').textContent = fm(net);
    $('lc-net2').textContent = fm(net - gst);
    $('lc-left').textContent = fm(Math.max(0, bal - sfec));
    $('lc-bar').style.width = (bal > 0 ? Math.min(100, sfec / bal * 100) : 0) + '%';
    $('lc-msg').textContent = !pax ? 'Add participants to see what the balance covers.'
      : claim > bal ? 'The balance reimburses ' + fm(sfec) + ' of the ' + fm(claim) + ' claimable, so ' + fm(claim - bal) + ' is not covered.'
      : 'The balance covers all ' + plural(pax, 'participant', 'participants') + '. The ' + fm(bal - sfec) + ' left lapses on 30 November 2026.';
  }
  p.addEventListener('click', e => {
    const b = e.target.closest('[data-lc]');
    if (b) { const r = rows[+b.dataset.i], k = b.dataset.k; r.q[k] = Math.max(0, Math.min(99, (r.q[k] || 0) + (+b.dataset.lc))); paint(); return; }
    if (e.target.closest('#lc-reset')) { rows.forEach((r, i) => { r.q = Object.assign({}, base[i]); }); bal = L.balance || 0; $('lc-bal').value = bal.toLocaleString('en-SG'); paint(); }
  });
  $('lc-bal').value = bal.toLocaleString('en-SG');
  $('lc-bal').addEventListener('input', () => { bal = parseFloat($('lc-bal').value.replace(/[^0-9.]/g, '')) || 0; paint(); });
  paint();
}
show(TABS.includes(CFG.start) ? CFG.start : TABS[0]);
{ const g = $('hd-guide'); if (g) g.addEventListener('click', startTour); }
/* First visit: the tour offers itself once. Never in the builder's preview, where the Guide button shows it. */
if (CFG.coach && TABS.length > 1 && !CFG.preview && !tourSeen()) setTimeout(startTour, 700);
})();
