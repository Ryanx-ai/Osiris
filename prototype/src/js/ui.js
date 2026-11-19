
/* =====================================================================
   BUILDER UI: drafts, form, live preview, checklist and exports (v4), plus the client microsite (v1)
   ===================================================================== */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const OSIRIS_HEAD = '<title>Osiris - VI</title><link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,@@b64:assets/favicon.svg@@">';
const DRAFTS_KEY = 'vi-proposal-drafts-v4';
const LEGACY_KEY = 'vi-proposal-deck-v3';
const ME_KEY = 'vi-consultant-v1';
const MAX_COURSES = 6;
const pad = n => String(n).padStart(2, '0');
const isoOf = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const todayISO = () => isoOf(new Date());
function addBusinessDays(iso, n){
  const d = parseISO(iso) || new Date();
  let k = 0;
  while (k < n){ d.setDate(d.getDate() + 1); const w = d.getDay(); if (w !== 0 && w !== 6) k++; }
  return isoOf(d);
}
function nextWeekday(iso, dow){ const d = parseISO(iso) || new Date(); while (d.getDay() !== dow) d.setDate(d.getDate() + 1); return isoOf(d); }
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const num = v => parseFloat(String(v == null ? '' : v).replace(/[^0-9.]/g, '')) || 0;
VI.initAssets();

/* ---------- State factories ---------- */
let nextCourseId = 10;
const makeCourseItem = o => Object.assign({id:'c_' + (++nextCourseId) + '_' + Date.now().toString(36), k:'genai', delivery:'private', uenId:'', team:'', pax:'12', paxConfirmed:false, date:'', pilot:false, fee:'', hrs:'', sessions:'', asmt:'', m50:'6', m70:'6', mpass:'0'}, o || {});
let nextUenId = 10;
const makeUenItem = o => Object.assign({id:'u_' + (++nextUenId) + '_' + Date.now().toString(36), name:'Entity', uen:'', bal:'10,000', balNew:'10,000'}, o || {});
const uenBal = u => S && S.sfecMode !== 'legacy' ? freshBal(u.balNew) : num(u.bal);
const SLIDES = () => ({contents:true, timeline:true, cohort:true, compare:false, trust:true, others:true, catalogue:true});
/* v6 fields: talking points from the call, lesson slides and the slide order */
const V6 = () => ({pains:[], heard:'', modApps:{}, details:true, detailLevel:'detailed', detailsPdf:true, detailOff:{}, order:[], draftedFrom:false});
function EXAMPLE(){
  const d1 = nextWeekday(isoAddDays(todayISO(), 35), 2), d2 = isoAddDays(d1, 14);
  return {
    client:'Example Engineering', contact:'Jamie Tan', team:'project team', industry:'construction', multiMode:'pathway',
    courses:[
      makeCourseItem({id:'c_1', k:'genai', team:'project & ops team', pax:'12', date:d1, pilot:true, m50:'6', m70:'6'}),
      makeCourseItem({id:'c_2', k:'wfa', team:'project & ops team', pax:'8', date:d2, m50:'4', m70:'4'})
    ],
    exactMakeup:false, schedule:'weekday', sfecMode: d1 >= SFEC_NEW_START ? 'enhanced' : 'legacy', sfecRate:'', tier:'50', pass:false, sfec:'known', sfecBal:'10,000', balConfirmed:false,
    multiUen:false, uens:[makeUenItem({id:'u_1', name:'Example Engineering (HQ)', uen:'201812345K', bal:'10,000'}), makeUenItem({id:'u_2', name:'Example Civil Works Pte Ltd', uen:'202098765M', bal:'6,500'})],
    priority:'faster tender documentation', decision:addBusinessDays(todayISO(), 5), date:todayISO(),
    schedStart:'9', schedEnd:'19', schedLunch:'auto', schedMax:'11', slides:SLIDES(), removedSlides:[], othersMode:'auto', othersList:[], casesMode:'auto', casesList:[], customCases:[], iconTile:false, example:true,
    ...V6(),
    pains:[
      {team:'Project team', tools:'Excel, WhatsApp', text:'Weekly progress reports are pieced together by hand from site diaries and photos', link:'m:genai:2'},
      {team:'QS', tools:'Tender portal', text:'Tender clarifications take days because past answers are hard to find', link:'m:genai:5'},
      {team:'Admin', tools:'Excel', text:'Manpower and cost spreadsheets are rebuilt every month for management', link:'c:pbi'}
    ],
    modApps:{'genai:2':'Turn a week of site diary notes into a progress report with actions, owners and dates, ready for the project manager to check.'}
  };
}
function BLANK(){
  return {
    client:'', contact:'', team:'', industry:'general', multiMode:'pathway',
    courses:[makeCourseItem({id:'c_1', k:'genai', pax:'12', pilot:true})],
    exactMakeup:false, schedule:'weekday', sfecMode: todayISO() >= isoAddDays(SFEC_NEW_START, -45) ? 'enhanced' : 'legacy', sfecRate:'', tier:'unknown', pass:false, sfec:'unknown', sfecBal:'', balConfirmed:false,
    multiUen:false, uens:[makeUenItem({id:'u_1', name:'Entity 1'}), makeUenItem({id:'u_2', name:'Entity 2'})],
    priority:'', decision:addBusinessDays(todayISO(), 5), date:todayISO(),
    schedStart:'9', schedEnd:'19', schedLunch:'auto', schedMax:'11', slides:SLIDES(), removedSlides:[], othersMode:'auto', othersList:[], casesMode:'auto', casesList:[], customCases:[], iconTile:false, example:false,
    focus:{mods:[], notes:{}}, practice:[], ...V6()
  };
}
/* Brings any saved or imported state up to the current shape */
function normalise(saved){
  const S = Object.assign(BLANK(), saved || {}, {slides:Object.assign(SLIDES(), (saved && saved.slides) || {})});
  S.courses = (Array.isArray(S.courses) && S.courses.length ? S.courses : BLANK().courses).slice(0, MAX_COURSES).map(c => makeCourseItem(Object.assign({delivery:(saved && saved.delivery) || 'private'}, c)));
  S.uens = (Array.isArray(S.uens) && S.uens.length ? S.uens : BLANK().uens).map(u => makeUenItem(u));
  if (!Array.isArray(S.removedSlides)) S.removedSlides = [];
  if (!IND[S.industry]) S.industry = 'general';
  if (!['enhanced','legacy'].includes(S.sfecMode)) S.sfecMode = 'enhanced';
  if (!['pathway','standalone'].includes(S.multiMode)) S.multiMode = 'pathway';
  if (!S.pathPlan || typeof S.pathPlan !== 'object' || !S.pathPlan.after) S.pathPlan = null;
  if (!['70','50','unknown'].includes(S.tier)) S.tier = 'unknown';
  if (!['known','unknown','none'].includes(S.sfec)) S.sfec = 'unknown';
  if (!Array.isArray(S.casesList)){ S.casesList = []; S.casesMode = 'auto'; }
  S.customCases = cleanCustomCases(S.customCases);
  S.iconTile = !!S.iconTile;
  if (!S.focus || typeof S.focus !== 'object') S.focus = {mods:[], notes:{}};
  S.focus = {mods:(Array.isArray(S.focus.mods) ? S.focus.mods : []).map(Number).filter(n => n >= 1 && n <= 12), notes:Object.assign({}, S.focus.notes || {})};
  if (!Array.isArray(S.practice)) S.practice = [];
  S.practice = S.practice.filter(r => r && typeof r === 'object').slice(0, 5).map(r => ({work:String(r.work || ''), tools:String(r.tools || ''), text:String(r.text || '')}));
  if (!Array.isArray(S.othersList)){ S.othersList = []; S.othersMode = 'auto'; }
  // v6
  S.pains = (Array.isArray(S.pains) ? S.pains : []).filter(r => r && typeof r === 'object').slice(0, PAIN_MAX)
    .map(r => ({team:String(r.team || ''), tools:String(r.tools || ''), text:String(r.text || ''), head:String(r.head || ''), body:String(r.body || ''), theme:String(r.theme || ''), link:String(r.link || '')}));
  S.heard = String(S.heard || '');
  S.modApps = S.modApps && typeof S.modApps === 'object' && !Array.isArray(S.modApps) ? Object.fromEntries(Object.entries(S.modApps).filter(([k, v]) => /^\w+:\d+$/.test(k) && typeof v === 'string')) : {};
  S.details = S.details !== false;
  if (!['simple', 'detailed', 'technical'].includes(S.detailLevel)) S.detailLevel = 'detailed';
  S.detailsPdf = S.detailsPdf !== false;
  S.detailOff = S.detailOff && typeof S.detailOff === 'object' && !Array.isArray(S.detailOff) ? S.detailOff : {};
  S.order = Array.isArray(S.order) ? S.order.filter(k => typeof k === 'string') : [];
  S.draftedFrom = !!S.draftedFrom;
  if (!S.date || S.date < todayISO()) S.date = todayISO();
  if (!S.decision || S.decision < todayISO()) S.decision = addBusinessDays(todayISO(), 5);
  if (saved && saved.balConfirmed == null) S.balConfirmed = !!(String(S.sfecBal || '').trim() && num(S.sfecBal) !== 10000);
  S.courses.forEach((c, i) => { const o = saved && saved.courses && saved.courses[i]; if (o && o.paxConfirmed == null) c.paxConfirmed = false; });
  normaliseSite(S);
  delete S.consultant; delete S.__host;
  return S;
}

/* ---------- Consultant details (one set per computer) ---------- */
let ME = Object.assign({}, CONSULTANT_DEFAULT);
try { Object.assign(ME, JSON.parse(localStorage.getItem(ME_KEY) || '{}') || {}); } catch (e) {}
const deckState = () => Object.assign({}, S, {consultant: ME});

/* ---------- Drafts ---------- */
let store = {v:4, current:null, drafts:{}};
const newId = () => 'd_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const autoName = st => ((st.client || '').trim() || (st.example ? 'Example (demo)' : 'Untitled proposal'));
/* ---------- Saved client drafts (published with the tool, so they load on any computer) ----------
   Added by Claude per client. Each seed is added to the Draft list once if missing; edits stay local. */
const SEED_DRAFTS = [
@@seeds@@
];
/* A seed with a higher rev than this browser last applied replaces that draft (used when Claude corrects a saved client). */
const SEED_REV_KEY = "vi-seed-revs";
function mergeSeedDrafts(){
  let changed = false, revs = {};
  try { revs = JSON.parse(localStorage.getItem(SEED_REV_KEY) || "{}") || {}; } catch (e) {}
  SEED_DRAFTS.forEach(sd => {
    if (sd.retired) return;
    const rev = sd.rev || 1, have = store.drafts[sd.id];
    if (have && (revs[sd.id] || 1) >= rev) return;
    store.drafts[sd.id] = {id:sd.id, name:sd.name, custom:false, updated:Date.parse(sd.added) || Date.now(), state:Object.assign(normalise(JSON.parse(JSON.stringify(sd.state))),
      /* a corrected seed keeps the slides this browser removed or reordered */
      have && have.state ? {removedSlides: Array.isArray(have.state.removedSlides) ? have.state.removedSlides : [], order: Array.isArray(have.state.order) ? have.state.order : [], slides: Object.assign(SLIDES(), have.state.slides || {})} : {})};
    revs[sd.id] = rev; changed = true;
  });
  try { localStorage.setItem(SEED_REV_KEY, JSON.stringify(revs)); } catch (e) {}
  if (changed) saveStore();
}
function loadStore(){
  try { const raw = JSON.parse(localStorage.getItem(DRAFTS_KEY) || 'null'); if (raw && raw.drafts && typeof raw.drafts === 'object') store = raw; } catch (e) {}
  if (!Object.keys(store.drafts).length){
    let legacy = null;
    try { legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null'); } catch (e) {}
    const st = legacy && typeof legacy === 'object' ? normalise(legacy) : EXAMPLE();
    const id = newId();
    store.drafts[id] = {id, name:autoName(st), custom:false, updated:Date.now(), state:st};
    store.current = id;
  }
  if (!store.drafts[store.current]) store.current = Object.keys(store.drafts).sort((a, b) => store.drafts[b].updated - store.drafts[a].updated)[0];
  Object.values(store.drafts).forEach(d => { d.state = normalise(d.state); });
}
let saveT = 0, savedT = 0;
function saveStore(){
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(store));
    $('draft-saved').textContent = '· saved';
    clearTimeout(savedT); savedT = setTimeout(() => { $('draft-saved').textContent = ''; }, 1800);
  } catch (e) {
    status('This draft could not be saved on this computer (browser storage is full or blocked). Use More → Export draft to keep a copy.', 'error');
  }
}
function persist(){
  const d = store.drafts[store.current];
  if (d){
    d.state = S; d.updated = Date.now();
    if (!d.custom) d.name = autoName(S);
  }
  clearTimeout(saveT);
  saveT = setTimeout(() => { saveStore(); renderDraftSelect(); }, 300);
}
function renderDraftSelect(){
  const sel = $('draft-sel');
  const list = Object.values(store.drafts).sort((a, b) => b.updated - a.updated);
  const when = t => { const d = new Date(t); return d.getDate() + ' ' + SHORT_MONTHS[d.getMonth()]; };
  sel.innerHTML = list.map(d => '<option value="' + esc(d.id) + '"' + (d.id === store.current ? ' selected' : '') + '>' + esc(d.name) + ' · ' + when(d.updated) + '</option>').join('');
  $('draft-delete').disabled = list.length < 2;
}
function switchDraft(id){
  if (!store.drafts[id]) return;
  clearTimeout(saveT); saveStore();
  store.current = id;
  S = store.drafts[id].state;
  pviews = {};
  saveStore(); syncForm(); render(); renderDraftSelect();
}
function addDraft(state, name){
  const id = newId();
  store.drafts[id] = {id, name: name || autoName(state), custom: !!name, updated: Date.now(), state};
  switchDraft(id);
  return id;
}
loadStore();
try { mergeSeedDrafts(); } catch (e) {}
let S = store.drafts[store.current].state;

/* ---------- Form building blocks ---------- */
function courseOptionsHtml(selectedKey){
  return GROUPS.map(([g, label]) => '<optgroup label="' + esc(label) + '">' + COURSES.filter(c => c.g === g).map(c =>
    '<option value="' + c.k + '"' + (c.k === selectedKey ? ' selected' : '') + '>' + esc(c.lvl ? 'Level ' + c.lvl + ': ' + c.name : c.name) + '</option>').join('') + '</optgroup>').join('');
}
function deliveryOptionsHtml(cur){
  return [['private', 'Private class, venue to be agreed'], ['private-client', 'Private class at their office'], ['private-vi', 'Private class at our Paya Lebar campus'], ['private-online', 'Private class, online (live virtual class)'], ['public', 'Public run']]
    .map(([v, l]) => '<option value="' + v + '"' + (v === (cur || 'private') ? ' selected' : '') + '>' + esc(l) + '</option>').join('');
}
function uenOptionsHtml(selectedUenId){
  let h = '<option value=""' + (!selectedUenId ? ' selected' : '') + '>All entities (shared)</option>';
  (S.uens || []).forEach((u, i) => {
    const lbl = 'U' + (i + 1) + ': ' + ((u.name || '').trim() || 'Entity ' + (i + 1)) + ((u.uen || '').trim() ? ' (' + u.uen.trim() + ')' : '') + ' · ' + money0(uenBal(u));
    h += '<option value="' + esc(u.id) + '"' + (u.id === selectedUenId ? ' selected' : '') + '>' + esc(lbl) + '</option>';
  });
  return h;
}
$('industry').innerHTML = INDUSTRIES.map(i => '<option value="' + i.k + '">' + esc(i.label) + '</option>').join('');
$('rules-checked').textContent = SFEC_RULES_CHECKED;
const halfHours = (a, b) => { const out = []; for (let t = a; t <= b + 1e-9; t += 0.5) out.push(t); return out; };
$('schedStart').innerHTML = halfHours(7, 11).map(t => '<option value="' + t + '">' + schedClock(t) + '</option>').join('');
$('schedEnd').innerHTML = halfHours(15, 21).map(t => '<option value="' + t + '">' + schedClock(t) + '</option>').join('');
$('schedMax').innerHTML = halfHours(6, 11).map(t => '<option value="' + t + '">' + schedHrs(t) + ' of class' + (t === SCHED_DEFAULTS.maxAct ? ' (default)' : '') + '</option>').join('');
/* Each course's Training days choices, and its assessment estimate, follow the headcount and class hours */
function refreshSchedFields(){
  const ctx = makeCtx(deckState());
  document.querySelectorAll('#course-list select[data-field="sessions"]').forEach(sel => {
    const idx = +sel.dataset.idx, item = S.courses[idx], c = ctx.courses[idx];
    if (!item || !c) return;
    const o = schedOpts(S), assess = c.priv ? (c.asmtOverride > 0 ? c.asmtOverride : schedAssess(c.pax, o)) : schedStdAssess(c);
    const formats = schedFormatsFor(c, assess, o);
    const first = formats.find(f => f.fits);
    sel.innerHTML = '<option value="">' + esc(first ? (c.priv ? 'Shortest that fits: ' + schedDays(first.n) : 'First option: ' + (first.top || schedDays(first.n))) : 'No split fits the class hours') + '</option>' +
      formats.map(f => '<option value="' + f.n + '"' + (f.fits ? '' : ' disabled') + '>' + esc(schedOptLabel(f, true)) + '</option>').join('');
    const want = item.sessions || '';
    const wf = want ? formats.find(f => f.n === +want) : null;
    sel.value = wf && wf.fits ? want : '';
    sel.closest('label').hidden = item.delivery === 'public' && !c.formatOpts.length;
    const asIn = document.querySelector('#course-list input[data-field="asmt"][data-idx="' + idx + '"]');
    if (asIn) asIn.placeholder = 'auto: ' + schedHrs(schedAssess(c.pax, o));
  });
}

function renderUenCards(){
  const sfecOn = S.sfec !== 'none';
  $('multi-uen-wrap').hidden = !sfecOn;
  $('uen-panel').hidden = !(sfecOn && S.multiUen);
  if (!sfecOn || !S.multiUen) return;
  const n = S.uens.length;
  $('uen-list').innerHTML = S.uens.map((u, idx) => `
    <div class="uen-item" data-uen-idx="${idx}">
      <div class="uen-item-head">
        <span>Entity ${idx + 1} (U${idx + 1}): in the calculator’s entity selector</span>
        ${n > 1 ? `<button type="button" class="link-btn danger" data-act="remove-uen" data-uen-idx="${idx}">Remove</button>` : ''}
      </div>
      <div class="row2">
        <label class="f"><span>Entity name</span><input type="text" data-uen-field="name" data-uen-idx="${idx}" placeholder="e.g. Acme Holdings" value="${esc(u.name)}"></label>
        <label class="f"><span>UEN</span><input type="text" data-uen-field="uen" data-uen-idx="${idx}" placeholder="Company registration number" value="${esc(u.uen)}"></label>
      </div>
      <label class="f"><span>${S.sfecMode === 'legacy' ? 'Current SFEC balance left' : 'SFEC (Enhanced) balance <em>(fresh S$10,000)</em>'}</span><span class="money"><span aria-hidden="true">S$</span><input type="text" data-uen-field="${S.sfecMode === 'legacy' ? 'bal' : 'balNew'}" data-uen-idx="${idx}" inputmode="decimal" placeholder="10,000" value="${esc(S.sfecMode === 'legacy' ? u.bal : (u.balNew == null ? '10,000' : u.balNew))}"></span></label>
    </div>`).join('');
  updateUenSummary();
}
function updateUenSummary(){
  const total = S.uens.reduce((s, u) => s + uenBal(u), 0);
  $('uen-summary-note').textContent = S.uens.length + ' sponsoring ' + (S.uens.length === 1 ? 'entity' : 'entities') + ' (' + money0(total) + ' SFEC in total). The client switches between them with the selector on the calculator slide.';
}

function renderCourseCards(){
  renderPathPlot();
  const mkNote = $('exact-makeup-note');
  if (mkNote) mkNote.textContent = S.tier === '70' ? 'Split each course’s participants into Citizens and PRs (70%) and pass holders' : 'Split each course\'s participants by funding tier (50% / 70% / pass holders)';
  const n = S.courses.length;
  const showUenAssign = !!(S.multiUen && S.sfec !== 'none' && S.uens.length);
  $('multi-mode-wrap').hidden = n < 2;
  document.querySelectorAll('#multi-mode button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === S.multiMode)));
  $('add-course').disabled = n >= MAX_COURSES;
  $('course-cap-note').hidden = n < MAX_COURSES;
  $('course-list').innerHTML = S.courses.map((item, idx) => {
    const c = C[item.k] || C.genai;
    const hasOv = !!(item.fee || item.hrs || item.asmt);
    const m = parseMakeup(item.m50, item.m70, item.mpass);
    const paxVal = S.exactMakeup ? String(m.qty) : (item.pax == null ? '' : item.pax);
    const slotTitle = n > 1 ? (S.multiMode === 'standalone' ? 'Track ' : 'Course ') + (idx + 1) : 'Course';
    return `
      <div class="course-item${item.pilot ? ' is-pilot' : ''}" data-idx="${idx}">
        <div class="course-item-head">
          <div class="course-item-title"><span>${esc(slotTitle)}</span>${c.lvl ? '<span class="lvl-pill">Level ' + c.lvl + '</span>' : ''}${item.pilot ? '<span class="pilot-pill">★ Pilot</span>' : ''}</div>
          ${n > 1 ? `<button type="button" class="link-btn danger" data-act="remove-course" data-idx="${idx}" aria-label="Remove course ${idx + 1}">Remove</button>` : ''}
        </div>
        <label class="f"><span>Programme</span><select data-field="k" data-idx="${idx}" aria-label="Course ${idx + 1}">${courseOptionsHtml(item.k)}</select></label>
        <p class="meta">
          <span><b>${money0(item.fee ? +item.fee : c.fee)}</b> before GST</span>
          <span>· <b>${hrsText(item.hrs ? +item.hrs : c.hrs)}</b></span>
          <span>· <a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">Course page</a></span>
          <button type="button" class="link-btn" data-act="toggle-ov" data-idx="${idx}">${hasOv ? 'Edited · change' : 'Edit fee & hours'}</button>
        </p>
        <div class="override" id="ov-${idx}" ${hasOv ? '' : 'hidden'}>
          <label class="f"><span>Fee before GST (S$)</span><input type="number" data-field="fee" data-idx="${idx}" min="0" step="1" placeholder="${c.fee}" value="${esc(item.fee)}"></label>
          <label class="f"><span>Hours</span><input type="number" data-field="hrs" data-idx="${idx}" min="1" step="0.5" placeholder="${c.hrs}" value="${esc(item.hrs)}"></label>
          <label class="f" style="grid-column:1/-1"><span>Assessment hours <em>(as confirmed by the trainer; blank uses the estimate)</em></span><input type="number" data-field="asmt" data-idx="${idx}" min="0.5" step="0.5" placeholder="auto" value="${esc(item.asmt)}"></label>
        </div>
        <label class="f"><span>Course delivery</span><select data-field="delivery" data-idx="${idx}" aria-label="Course ${idx + 1} delivery">${deliveryOptionsHtml(item.delivery)}</select></label>
        <label class="f" ${item.delivery === 'public' ? 'hidden' : ''}><span>Training days <em>(Delivery slide)</em></span><select data-field="sessions" data-idx="${idx}" aria-label="Course ${idx + 1} training days"><option value="">Shortest that fits</option></select></label>
        <div class="row2">
          <label class="f"><span>Team being trained</span><input type="text" data-field="team" data-idx="${idx}" placeholder="e.g. ${n > 1 ? (idx === 0 ? 'Finance, HR, Ops' : 'Finance, Ops') : 'project team'}" title="One team, or several separated by commas. Use the same names on each course so the pathway slide can follow them." value="${esc(item.team)}"></label>
          <label class="f"><span>Participants</span><input type="number" data-field="pax" data-idx="${idx}" min="1" max="200" step="1" placeholder="e.g. 12" value="${esc(paxVal)}" ${S.exactMakeup ? 'disabled' : ''}></label>
        </div>
        <label class="check"><input type="checkbox" data-field="paxConfirmed" data-idx="${idx}" ${item.paxConfirmed ? 'checked' : ''}><span>Headcount confirmed<small>Otherwise the deck labels the number as proposed</small></span></label>
        <div class="row2">
          <label class="f"><span>Training start date</span><input type="date" data-field="date" data-idx="${idx}" value="${esc(item.date)}"></label>
          <div class="f" style="justify-content:flex-end">
            <label class="check" style="padding-bottom:4px"><input type="checkbox" data-field="pilot" data-idx="${idx}" ${item.pilot ? 'checked' : ''}><span>Pilot programme<small>A pilot before wider commitment</small></span></label>
          </div>
        </div>
        <details class="adv course-opts"${(item.legacySfec || item.stageLabel || item.deadline || item.formatOpts || item.timesText) ? ' open' : ''}>
          <summary>Pathway &amp; delivery options${item.legacySfec ? ' · current SFEC' : ''}</summary>
          ${S.sfecMode !== 'legacy' && S.sfec !== 'none' ? `<label class="check"><input type="checkbox" data-field="legacySfec" data-idx="${idx}" ${item.legacySfec ? 'checked' : ''}><span>Current SFEC for this course<small>Completed by 30 Nov 2026: shown on its own on the funding and calculator slides, with up to 90% of the nett fee (before GST) claimed back after the course, and left out of the combined views</small></span></label>` : ''}
          <label class="f"><span>Stage label <em>(optional; replaces “Stage N”, and the next course becomes Stage 1)</em></span><input type="text" data-field="stageLabel" data-idx="${idx}" maxlength="60" placeholder="e.g. Utilize SFEC before it lapses on 30 Nov" value="${esc(item.stageLabel || '')}"></label>
          <label class="f"><span>Milestone badge <em>(optional; on its pathway card)</em></span><input type="text" data-field="deadline" data-idx="${idx}" maxlength="60" placeholder="e.g. To be completed before 30 Nov 2026" value="${esc(item.deadline || '')}"></label>
          <label class="f"><span>Duration options <em>(Delivery slide)</em></span><input type="text" data-field="formatOpts" data-idx="${idx}" maxlength="40" placeholder="${item.delivery === 'public' ? 'e.g. 3,4 (days) or 2,6x3 (6 sessions of 3h)' : 'e.g. 3-7 (days)'}" value="${esc(item.formatOpts || '')}"></label>
          ${item.delivery === 'public' ? `<label class="f"><span>Class times <em>(optional; public run)</em></span><input type="text" data-field="timesText" data-idx="${idx}" maxlength="80" placeholder="e.g. 9:00 am–5:00 pm" value="${esc(item.timesText || '')}"></label>` : ''}
        </details>
        ${showUenAssign ? `<label class="f"><span>Sponsoring entity</span><select data-field="uenId" data-idx="${idx}" aria-label="Course ${idx + 1} sponsoring entity">${uenOptionsHtml(item.uenId)}</select></label>` : ''}
        <div class="makeup-course" ${S.exactMakeup ? '' : 'hidden'}>
          <div class="makeup-head"><b>Exact cohort makeup (${esc(c.short)})</b><span class="makeup-tot"><span id="mk-tot-${idx}">${m.qty} pax</span>${idx > 0 ? ` · <button type="button" class="link-btn" data-act="copy-makeup" data-idx="${idx}">Copy course 1</button>` : ''}</span></div>
          ${S.tier === '70' ? `<div class="row2">
            <label class="f"><span title="Every Singapore Citizen and PR: 70% funding when SME-sponsored">Citizens &amp; PRs <em>(70%)</em></span><input type="number" data-field="m70" data-idx="${idx}" min="0" step="1" value="${m.n50 + m.n70}"></label>
            <label class="f"><span title="Pass holders (no funding)">Pass holders <em>(0%)</em></span><input type="number" data-field="mpass" data-idx="${idx}" min="0" step="1" value="${esc(item.mpass)}"></label>
          </div>` : `<div class="row3">
            <label class="f"><span title="Singapore Citizens below 40 and PRs (50% funding)">Under 40 / PR <em>(50%)</em></span><input type="number" data-field="m50" data-idx="${idx}" min="0" step="1" value="${esc(item.m50)}"></label>
            <label class="f"><span title="Singapore Citizens aged 40+ or SME-sponsored (70% funding)">40+ / SME <em>(70%)</em></span><input type="number" data-field="m70" data-idx="${idx}" min="0" step="1" value="${esc(item.m70)}"></label>
            <label class="f"><span title="Pass holders (no funding)">Pass holders <em>(0%)</em></span><input type="number" data-field="mpass" data-idx="${idx}" min="0" step="1" value="${esc(item.mpass)}"></label>
          </div>`}
        </div>
      </div>`;
  }).join('');
}

/* ---------- Slide inclusion ---------- */
function toggleSlideIncluded(slideKey, include){
  if (!Array.isArray(S.removedSlides)) S.removedSlides = [];
  if (OPTIONAL_SLIDE_MAP[slideKey]){
    const optKey = OPTIONAL_SLIDE_MAP[slideKey];
    S.slides[optKey] = !!include;
    const cb = $('sl-' + optKey); if (cb) cb.checked = !!include;
    S.removedSlides = S.removedSlides.filter(k => k !== slideKey);
  } else if (include){
    S.removedSlides = S.removedSlides.filter(k => k !== slideKey);
    if (slideKey.startsWith('cohort_') && !S.slides.cohort){ S.slides.cohort = true; $('sl-cohort').checked = true; }
  } else if (!S.removedSlides.includes(slideKey)) S.removedSlides.push(slideKey);
  changed(false);
}
function restoreAllRemovedSlides(){
  S.removedSlides = [];
  Object.keys(OPTIONAL_SLIDE_MAP).forEach(k => { const o = OPTIONAL_SLIDE_MAP[k]; if (OPTIONAL_OFF_BY_DEFAULT[o]) return; S.slides[o] = true; const cb = $('sl-' + o); if (cb) cb.checked = true; });
  changed(false);
}
/* v6: the slide list can be reordered (drag, or the arrows); detail slides are switched on and off below it */
let pendingFocus = null;
const uniq = a => a.filter((x, i) => a.indexOf(x) === i);
function renderSlideManager(b){
  const inventory = b.slideInventory;
  const removed = inventory.filter(x => x.removed && !x.optionalOff);
  $('restore-all-slides').hidden = !removed.length;
  $('reset-order').hidden = !(S.order && S.order.length);
  const last = inventory.length - 1;
  let h = inventory.map((item, i) => {
    const pinned = item.key === 'cover';
    return '<div class="slide-mgr-item' + (item.removed ? ' is-removed' : '') + '" data-key="' + esc(item.key) + '" data-okey="' + esc(item.orderKey) + '"' + (pinned ? '' : ' draggable="true"') + '>' +
      '<span class="slide-mgr-grip" aria-hidden="true">' + (pinned ? '' : '⋮⋮') + '</span>' +
      '<label class="slide-mgr-main"><input type="checkbox" data-slide-toggle="' + esc(item.key) + '"' + (item.removed ? '' : ' checked') + '><span class="slide-mgr-num">' + (item.num != null ? item.num : '–') + '</span><span class="slide-mgr-name">' + esc(item.name) + '</span></label>' +
      '<span class="slide-mgr-state">' + (item.optionalOff ? 'Optional' : item.removed ? 'Removed' : '') + '</span>' +
      (pinned ? '' : '<span class="slide-mgr-move"><button type="button" class="icon-btn sm" data-move="-1" aria-label="Move ' + esc(item.name) + ' up"' + (i <= 1 ? ' disabled' : '') + '>↑</button><button type="button" class="icon-btn sm" data-move="1" aria-label="Move ' + esc(item.name) + ' down"' + (i >= last ? ' disabled' : '') + '>↓</button></span>') +
      '</div>';
  }).join('');
  // Detail slides: one switch per course (its detail slide on a multi-course deck, its lesson slides) and the course list
  const ctx = b.ctx, on = k => !isSlideKeyRemoved(S, k), off = S.detailOff || {};
  const rows = [];
  ctx.courses.forEach(c => {
    const multiOn = on('pathway') || on('modmap');
    if (ctx.multi && multiOn) rows.push(['course_' + c.k, 'Inside ' + c.short + ' (from the pathway and lesson map)', !off['course_' + c.k]]);
    if (hasLessonSlides(c) && S.details !== false && (ctx.multi ? multiOn && !off['course_' + c.k] : on('course_' + c.k)))
      rows.push(['md_' + c.k, c.short + ': ' + (c.lessons || c.areas).length + (c.lessons ? ' lesson slides' : ' learning-area slides'), !off['md_' + c.k]]);
  });
  if (on('others')) rows.push(['catalogue', 'All ' + COURSES.length + ' courses (from Other courses)', !(S.slides && S.slides.catalogue === false)]);
  if (rows.length) h += '<div class="slide-mgr-sec">Detail slides, opened from buttons</div>' + rows.map(([k, label, ok]) =>
    '<div class="slide-mgr-item' + (ok ? '' : ' is-removed') + '"><span class="slide-mgr-grip" aria-hidden="true"></span><label class="slide-mgr-main"><input type="checkbox" data-detail-toggle="' + esc(k) + '"' + (ok ? ' checked' : '') + '><span class="slide-mgr-num">↳</span><span class="slide-mgr-name">' + esc(label) + '</span></label></div>').join('');
  $('slide-mgr-list').innerHTML = h;
  if (pendingFocus){
    const row = document.querySelector('#slide-mgr-list [data-okey="' + pendingFocus.okey + '"]');
    const btn = row && (row.querySelector('[data-move="' + pendingFocus.delta + '"]:not(:disabled)') || row.querySelector('[data-move]:not(:disabled)'));
    if (btn) btn.focus();
    pendingFocus = null;
  }
  const bar = $('removed-bar');
  if (removed.length){
    bar.hidden = false;
    bar.innerHTML = '<b>Removed slides (' + removed.length + '):</b> ' + removed.map(item => `<button type="button" class="restore-pill" data-restore-slide="${esc(item.key)}" title="Restore ${esc(item.name)}">+ ${esc(item.name)}</button>`).join('') + '<button type="button" class="link-btn" data-restore-all="1" style="margin-left:auto">Restore all</button>';
  } else { bar.hidden = true; bar.innerHTML = ''; }
}
const currentOrder = () => uniq((built ? built.slideInventory : []).map(x => x.orderKey));
function setOrder(order){
  const def = uniq(buildDeck(Object.assign({}, deckState(), {order:[]})).slideInventory.map(x => x.orderKey));
  S.order = order.join('|') === def.join('|') ? [] : order;
  changed(false);
}
function moveSlide(okey, delta){
  const order = currentOrder(), i = order.indexOf(okey), j = i + delta;
  if (i < 1 || j < 1 || j >= order.length) return;
  order.splice(i, 1); order.splice(j, 0, okey);
  pendingFocus = {okey, delta};
  setOrder(order);
}
function moveSlideTo(okey, target, after){
  const order = currentOrder();
  if (okey === target || order.indexOf(okey) < 1) return;
  order.splice(order.indexOf(okey), 1);
  const at = Math.max(1, order.indexOf(target) + (after ? 1 : 0));
  order.splice(at, 0, okey);
  setOrder(order);
}

/* ---------- Form <-> state ---------- */
const TEXT = ['client','contact','team','priority','sfecRate','heard'];
$('sfecBal').addEventListener('input', () => {
  if (S.sfecMode === 'legacy'){ S.sfecBal = $('sfecBal').value; S.balConfirmed = true; } else S.sfecBalNew = $('sfecBal').value;
  pviews = {};
  changed(false);
});
const SELECT = ['industry','tier','sfec','schedStart','schedEnd','schedLunch','schedMax'];
const OPTIONAL = [['sl-contents','contents'],['sl-timeline','timeline'],['sl-cohort','cohort'],['sl-compare','sfeccompare'],['sl-trust','trust'],['sl-others','others']];
function syncForm(){
  TEXT.forEach(k => { $(k).value = S[k] == null ? '' : S[k]; });
  SELECT.forEach(k => { $(k).value = S[k]; });
  $('decision').value = S.decision; $('date').value = S.date;
  $('pass').checked = !!S.pass; $('exact-makeup').checked = !!S.exactMakeup; $('multi-uen').checked = !!S.multiUen;
  document.querySelectorAll('#schedule button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === S.schedule)));
  document.querySelectorAll('#sfec-mode button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === S.sfecMode)));
  document.querySelectorAll('[data-me]').forEach(inp => { inp.value = ME[inp.dataset.me] || ''; });
  renderUenCards(); renderCourseCards(); renderSide();
  syncTailoring();
  $('sl-catalogue').checked = !(S.slides && S.slides.catalogue === false);
  syncSiteForm();
}
/* v5.1 client tailoring: lesson focus and team/tool rows */
function syncTailoring(){
  const f = S.focus || {mods:[], notes:{}};
  const first = S.courses && S.courses[0];
  const meta = first ? COURSES.find(x => x.k === first.k) : null;
  const ls = meta && meta.lessons ? meta.lessons : [];
  $('focus-mods').innerHTML = ls.length ? ls.map((l, i) => '<label><input type="checkbox" data-focus-mod="' + (i + 1) + '"' + (f.mods.includes(i + 1) ? ' checked' : '') + '><span>' + (i + 1) + '. ' + esc(l[0]) + '</span></label>').join('') : '<p class="note">This course has no lesson list.</p>';
  const fn = $('focus-notes'); if (document.activeElement !== fn) fn.value = Object.keys(f.notes || {}).sort((a, b) => a - b).map(k => k + ' | ' + f.notes[k]).join('\n');
  const pr = $('practice-rows'); if (document.activeElement !== pr) pr.value = (S.practice || []).map(r => [r.work, r.tools, r.text].join(' | ')).join('\n');
}
document.addEventListener('change', e => {
  const m = e.target && e.target.dataset && e.target.dataset.focusMod; if (!m) return;
  S.focus = S.focus || {mods:[], notes:{}};
  const n = +m; S.focus.mods = S.focus.mods.filter(x => x !== n); if (e.target.checked) S.focus.mods.push(n);
  S.focus.mods.sort((a, b) => a - b);
  changed(false);
});
document.addEventListener('input', e => {
  if (!e.target) return;
  if (e.target.id === 'focus-notes'){
    S.focus = S.focus || {mods:[], notes:{}}; const notes = {};
    e.target.value.split('\n').forEach(line => { const mm = line.match(/^\s*(\d+)\s*\|\s*(.+)$/); if (mm) notes[mm[1]] = mm[2].trim(); });
    S.focus.notes = notes; changed(false);
  } else if (e.target.id === 'practice-rows'){
    S.practice = e.target.value.split('\n').map(line => line.split('|').map(x => x.trim())).filter(p => p[0])
      .slice(0, 5).map(p => p.length >= 3 ? {work:p[0], tools:p[1], text:p.slice(2).join(' | ')} : {work:p[0], tools:'', text:p[1] || ''});
    changed(false);
  }
});
function sfecSuggestion(){
  if (S.sfec === 'none') return null;
  const dated = S.courses.map((c, i) => ({c, i})).filter(x => parseISO(x.c.date));
  if (!dated.length) return null;
  const before = dated.filter(x => x.c.date < SFEC_NEW_START), after = dated.filter(x => x.c.date >= SFEC_NEW_START);
  if (before.length && after.length) return {mixed:true};
  return {mode: before.length ? 'legacy' : 'enhanced'};
}
function renderSide(){
  $('multi-mode-wrap').hidden = S.courses.length < 2;
  const enh = S.sfecMode !== 'legacy';
  const showSingleBal = !S.multiUen && (enh ? S.sfec !== 'none' : S.sfec === 'known');
  $('bal-wrap').hidden = !showSingleBal;
  $('bal-wrap').querySelector('span').innerHTML = enh ? 'SFEC (Enhanced) balance <em>(fresh S$10,000)</em>' : 'Current SFEC balance left';
  const balIn = $('sfecBal');
  if (document.activeElement !== balIn) balIn.value = enh ? (S.sfecBalNew == null ? '10,000' : S.sfecBalNew) : (S.sfecBal || '');
  const so = $('sfec').options;
  so[0].text = enh ? 'Eligibility not confirmed' : 'Balance not confirmed';
  so[1].text = enh ? 'Eligible (questionnaire done)' : 'Balance confirmed';
  so[2].text = enh ? 'Not eligible' : 'No SFEC available';
  $('sfec-row').classList.toggle('one', !showSingleBal);
  renderUenCards();
  OPTIONAL.forEach(([id, k]) => { $(id).checked = !isSlideKeyRemoved(S, k); });
  const ctx = makeCtx(deckState());
  const pct = ctx.sfecRate + '%';
  $('sfec-mode-note').textContent = S.sfec === 'none' ? 'No SFEC is applied in this deck.' : S.sfecMode === 'legacy'
    ? 'Current SFEC: the client pays the fee after SkillsFuture funding, then claims up to ' + pct + ' of the remaining fee back after the course. Training must be completed and claimed by 30 Nov 2026.'
    : 'Redesigned SFEC (from 1 Dec 2026): a fresh S$10,000 credit in an online wallet offsets ' + (ctx.sfecRate >= 100 ? 'the full nett course fee' : pct + ' of the nett course fee') + ' at enrolment, for Singapore Citizens and PRs. The client pays only the 9% GST while the credit lasts. Change the rate under Assumptions if SWDA’s guidance differs.';
  const sug = sfecSuggestion(), hint = $('sfec-hint');
  if (sug && sug.mixed){
    hint.hidden = false;
    hint.innerHTML = 'The course dates fall on both sides of 1 Dec 2026. One deck can show only one SFEC scheme: split the proposal, or move a date.';
  } else if (sug && sug.mode !== S.sfecMode){
    hint.hidden = false;
    hint.innerHTML = (sug.mode === 'legacy' ? 'The training dates are before 1 Dec 2026, so the current SFEC applies.' : 'The training dates are from 1 Dec 2026, so the redesigned SFEC applies.') +
      ' <button type="button" class="link-btn" data-sfec-fix="' + sug.mode + '">Switch to the ' + (sug.mode === 'legacy' ? 'current' : 'redesigned') + ' SFEC</button>';
  } else hint.hidden = true;
  const priv = ctx.courses.filter(c => c.priv), pub = ctx.courses.filter(c => !c.priv);
  let note = '';
  if (priv.length && Math.min(...priv.map(c => c.pax)) < 8) note = 'A private class needs at least eight participants per cohort. With fewer, a public run may suit better.';
  else if (priv.length && Math.max(...priv.map(c => c.pax)) > 20) note = 'With more than 20 participants in a private cohort, plan for two or more classes.';
  else if (pub.length && Math.max(...pub.map(c => c.pax)) >= 8) note = 'From eight participants in a course, a private class becomes available, with examples set in their work.';
  $('pax-note').hidden = !note; $('pax-note').textContent = note;
  $('timeline-note').textContent = ctx.coursesWithDates.length > 1
    ? 'Reconciling ' + ctx.coursesWithDates.length + ' training dates across ' + ctx.courses.length + ' courses' + (ctx.pilotCourse ? ', starting with the ' + ctx.pilotCourse.short + ' pilot' : '')
    : 'Approval, pilot cohort and follow-on courses on one schedule';
  $('compare-note').textContent = !ctx.sfecOn ? 'Needs SFEC in this deck: set the SFEC balance under Funding & SFEC first.'
    : 'Explains the redesigned SFEC and puts this cohort\u2019s numbers under both schemes';
  $('sl-compare').disabled = !ctx.sfecOn;
  {
    const cf = $('cmp-focus'), list = ctx.courses.filter(c => !c.legacySfec);
    cf.innerHTML = '<option value="">The whole cohort</option>' + list.map(c => '<option value="' + esc(c.k) + '">One participant: ' + esc(c.short) + (c.lvl ? ' (Level ' + c.lvl + ')' : '') + '</option>').join('');
    cf.value = list.some(c => c.k === S.compareFocus) ? S.compareFocus : '';
    $('cmp-focus-wrap').hidden = !ctx.sfecOn || !(S.slides && S.slides.compare);
  }
  $('cohort-note').textContent = (ctx.exactMakeup ? 'Exact makeup per course · ' : '') + 'Upfront payment, net cost and what is claimed back' + (ctx.multiUen && ctx.uens.length > 1 ? ' · one slide, with an entity selector' : '');
  renderPick(); renderCasePick(); refreshSchedFields();
  renderPains(); renderLessonSettings();
  renderSiteSide();
}
function renderPick(){
  const ctx = makeCtx(deckState()), chosen = pickOthers(ctx), taken = new Set(ctx.courses.map(c => c.k)), linked = linkedOthers(ctx);
  $('pick-list').innerHTML = GROUPS.map(([g, label]) => {
    const list = COURSES.filter(c => c.g === g && !taken.has(c.k));
    return list.length ? '<p class="gh">' + esc(label) + '</p>' + list.map(c => linked.includes(c.k)
      ? '<label title="A point from the call leads to this course; change the point to remove it"><input type="checkbox" checked disabled>' + esc((c.lvl ? 'Level ' + c.lvl + ': ' : '') + c.short) + ' <small>· from a point in the call</small></label>'
      : '<label><input type="checkbox" data-k="' + c.k + '"' + (chosen.includes(c.k) ? ' checked' : '') + (!chosen.includes(c.k) && chosen.length >= 6 ? ' disabled' : '') + '>' + esc((c.lvl ? 'Level ' + c.lvl + ': ' : '') + c.short) + '</label>').join('') : '';
  }).join('');
  $('pick-count').textContent = chosen.length + ' of 6 chosen' + (S.othersMode === 'custom' ? '' : ', suggested for ' + IND[S.industry].label.toLowerCase()) + (chosen.length >= 6 ? '. Untick one to swap it.' : '');
  $('pick-sum').textContent = S.othersMode === 'custom' ? 'Your choice of courses (' + chosen.length + ')' : 'Choose the six yourself';
  $('pick').hidden = isSlideKeyRemoved(S, 'others');
}
const caseShort = k => CASES[k].name.replace(/ (Singapore|South East Asia|Limited)$/, '');
function renderCasePick(){
  const chosen = pickCases(makeCtx(deckState())), custom = S.casesMode === 'custom';
  $('cpick-list').innerHTML = CASE_KEYS.map(k => '<label><input type="checkbox" data-c="' + k + '"' + (chosen.includes(k) ? ' checked' : '') + (!chosen.includes(k) && chosen.length >= 2 ? ' disabled' : '') + '><span>' + esc(CASES[k].name) + '<small>' + esc(CASES[k].topic) + '</small></span></label>').join('');
  $('cpick-count').textContent = (custom ? chosen.length + ' of 2 chosen' : 'Suggested for this course and industry') + (chosen.length >= 2 ? '. Untick one to swap it.' : '');
  $('cpick-sum').textContent = 'Success stories: ' + chosen.map(caseShort).join(' and ');
  $('cpick-auto').hidden = !custom;
  $('icon-tile').checked = !!S.iconTile;
  renderCustomCases();
  $('cpick').hidden = isSlideKeyRemoved(S, 'trust');
}

/* ---------- Live preview ---------- */
let lastSVG = [], renderT = 0, built = null, pviews = {};
function capHtml(num, titleHtml, slideKey){
  return `<span class="slide-cap-text"><b>${num}</b> · ${titleHtml}</span><button type="button" class="slide-remove-btn" data-remove-slide="${esc(slideKey)}" title="Remove this slide (the deck and Contents renumber)" aria-label="Remove slide ${num}">✕ Remove</button>`;
}
function ensureCornerRemoveBtn(frameEl, slideKey, n){
  let b = frameEl.querySelector('button.slide-corner-x');
  if (!b){ b = document.createElement('button'); b.type = 'button'; b.className = 'slide-corner-x'; b.textContent = '✕'; frameEl.appendChild(b); }
  b.setAttribute('data-remove-slide', slideKey || ''); b.title = 'Remove slide ' + n; b.setAttribute('aria-label', 'Remove slide ' + n);
}
function schedule(){ clearTimeout(renderT); renderT = setTimeout(render, 60); }
function paintSlide(i){
  const b = built, base = b.slides[i];
  const fig = $('slide-' + (i + 1)); if (!fig) return;
  const view = pviews[base.slideKey];
  const s = view ? renderViewSlide(b, i, view) : base;
  const frameEl = fig.querySelector('.frame');
  const svg = slideSVG(s, (i + 1) + '. ' + s.name, {links:false});
  if (lastSVG[i] !== svg){ frameEl.innerHTML = svg; lastSVG[i] = svg; }
  ensureCornerRemoveBtn(frameEl, base.slideKey, i + 1);
  VI.mountControls(frameEl, s, (id, value) => { pviews[base.slideKey] = VI.applyPick(b, i, pviews[base.slideKey], id, value); paintSlide(i); });
  VI.mountLinks(frameEl, s, to => goToSlide(to + 1), b);
  VI.mountPeeks(frameEl, s, to => goToSlide(to + 1));
  let cap = esc(s.name);
  if (view && (base.fund || base.calc || base.sched)) cap += ' · <i>preview view</i> <button type="button" class="link-btn" data-reset-view="' + esc(base.slideKey) + '">Reset</button>';
  fig.querySelector('figcaption').innerHTML = capHtml(i + 1, cap, base.slideKey);
}
function render(){
  let b;
  try { b = buildDeck(deckState()); }
  catch (e){ status('The preview could not be built: ' + e.message, 'error'); console.error(e); return; }
  built = b;
  renderSlideManager(b);
  const host = $('slides');
  while (host.children.length > b.main) host.lastElementChild.remove();
  for (let i = 0; i < b.main; i++){
    let fig = host.children[i];
    if (!fig){ fig = document.createElement('figure'); fig.className = 'slide'; fig.innerHTML = '<figcaption></figcaption><div class="frame"></div>'; host.appendChild(fig); }
    fig.id = 'slide-' + (i + 1);
    fig.setAttribute('data-slide-key', b.slides[i].slideKey || '');
    paintSlide(i);
  }
  lastSVG.length = b.main;
  $('chips').innerHTML = b.slides.slice(0, b.main).map((s, i) => '<a href="#slide-' + (i + 1) + '" data-i="' + (i + 1) + '"><b>' + (i + 1) + '</b>' + esc(s.name) + '</a>').join('');
  renderDetailBlock(b);
  const meta = deckMeta(b.ctx);
  $('deck-h').textContent = meta.base.replace(/_/g, ' ');
  $('deck-sub').textContent = b.main + ' slides' + (b.details ? ' + ' + b.details + ' detail' : '') + ' · ' + b.ctx.progFull + ' · ' + (b.ctx.sfecOn ? sfecWords(b.ctx).short : 'no SFEC') + (b.ctx.multiUen ? ' · ' + b.ctx.uens.length + ' entities' : '');
  renderChecklist();
  siteDirty();
}

/* ---------- Before-you-send checklist ---------- */
let checkAll = false;
function issuesNow(){ return preflightIssues(deckState(), todayISO()).concat(siteIssues()); }
function issueLi(it){
  return '<li class="' + it.level + '"><span class="dot" aria-hidden="true">' + (it.level === 'error' ? '!' : it.level === 'warn' ? '?' : 'i') + '</span><span class="msg"><span class="sr">' + (it.level === 'error' ? 'Must fix: ' : it.level === 'warn' ? 'Check: ' : 'Note: ') + '</span>' + esc(it.msg) + '</span>' +
    (it.fix ? '<button type="button" class="fix" data-act="' + esc(it.fix.act) + '">' + esc(it.fix.label) + '</button>' : '') + '</li>';
}
function renderChecklist(){
  const all = issuesNow();
  const order = {error:0, warn:1, info:2};
  all.sort((a, b) => order[a.level] - order[b.level]);
  const errs = all.filter(x => x.level === 'error').length, warns = all.filter(x => x.level === 'warn').length;
  const card = $('check');
  card.classList.toggle('is-error', errs > 0); card.classList.toggle('is-warn', !errs && warns > 0); card.classList.toggle('is-ok', !errs && !warns);
  $('check-sum').textContent = errs ? errs + ' to fix' + (warns ? ' · ' + warns + ' to check' : '') : warns ? warns + ' to check · ready once checked' : 'Ready to send';
  const shown = checkAll ? all : all.slice(0, 5);
  $('check-list').innerHTML = shown.map(issueLi).join('') || '<li class="info"><span class="dot">✓</span><span class="msg">No problems found. Give the slides a final read, then send.</span></li>';
  $('check-more').hidden = all.length <= 5;
  $('check-more').textContent = checkAll ? 'Show fewer' : 'Show all ' + all.length;
  $('mtab-flag').textContent = errs ? '(' + errs + ' to fix)' : warns ? '(' + warns + ' to check)' : '';
}
function runFix(act){
  if (!act) return;
  if (act === 'newDraft'){ newDraft(); return; }
  if (act === 'sfec:legacy' || act === 'sfec:enhanced'){ S.sfecMode = act.split(':')[1]; syncForm(); changed(false); status('Switched to the ' + (S.sfecMode === 'legacy' ? 'current SFEC (claimed back after the course).' : 'redesigned SFEC (offset upfront from 1 Dec 2026).'), 'ok'); return; }
  if (act === 'confirmBal'){ S.balConfirmed = true; changed(false); return; }
  if (act === 'draftChecked'){ S.draftedFrom = false; changed(false); return; }
  if (act === 'confirmPax'){ S.courses.forEach(c => { c.paxConfirmed = true; }); changed(true); return; }
  if (act.startsWith('focus:')){
    closeGate();
    setTab('edit');
    const key = act.slice(6);
    let el = null;
    if (/^date-\d+$/.test(key)) el = document.querySelector('#course-list input[data-field="date"][data-idx="' + key.split('-')[1] + '"]');
    else if (/^team-\d+$/.test(key)) el = document.querySelector('#course-list input[data-field="team"][data-idx="' + key.split('-')[1] + '"]');
    else if (/^uen-\d+$/.test(key)) el = document.querySelector('#uen-list input[data-uen-field="uen"][data-uen-idx="' + key.split('-')[1] + '"]');
    else el = $(key);
    if (el){ el.scrollIntoView({behavior: reduceMotion() ? 'auto' : 'smooth', block:'center'}); setTimeout(() => el.focus(), 250); }
  }
}
document.addEventListener('click', e => {
  const f = e.target.closest('button.fix[data-act]');
  if (f){ e.preventDefault(); runFix(f.dataset.act); if ($('gate-modal') && !$('gate-modal').hidden) refreshGate(); }
});
$('check-more').addEventListener('click', () => { checkAll = !checkAll; renderChecklist(); });

/* Export gate: errors must be fixed, or the consultant confirms they have checked them */
let gateRun = null;
function refreshGate(){
  const errs = issuesNow().filter(x => x.level === 'error');
  if (!errs.length && gateRun){ const go = gateRun; closeGate(); go(); return; }
  $('gate-list').innerHTML = errs.map(issueLi).join('');
}
function gate(run){
  const errs = issuesNow().filter(x => x.level === 'error');
  if (!errs.length){ run(); return; }
  gateRun = run;
  $('gate-list').innerHTML = errs.map(issueLi).join('');
  $('gate-override').checked = false; $('gate-go').disabled = true;
  $('gate-modal').hidden = false;
  $('gate-cancel').focus();
}
function closeGate(){ $('gate-modal').hidden = true; gateRun = null; }
$('gate-override').addEventListener('change', () => { $('gate-go').disabled = !$('gate-override').checked; });
$('gate-go').addEventListener('click', () => { const go = gateRun; closeGate(); if (go) go(); });
$('gate-cancel').addEventListener('click', closeGate);
$('gate-close').addEventListener('click', closeGate);
$('gate-modal').addEventListener('click', e => { if (e.target === $('gate-modal')) closeGate(); });

/* ---------- Events ---------- */
function changed(reRenderCards){
  if (S.example) S.example = false;
  persist();
  if (reRenderCards) renderCourseCards();
  renderPathPlot();
  renderSide();
  schedule();
}
TEXT.forEach(k => $(k).addEventListener('input', () => {
  S[k] = $(k).value;
  if (k === 'sfecBal') S.balConfirmed = true;
  changed(false);
}));
SELECT.forEach(k => $(k).addEventListener('change', () => {
  S[k] = $(k).value;
  if (k === 'sfec' || k === 'tier') renderCourseCards();
  pviews = {};
  changed(false);
}));
$('multi-uen').addEventListener('change', () => {
  S.multiUen = $('multi-uen').checked;
  if (S.multiUen && S.sfec === 'unknown'){ S.sfec = 'known'; $('sfec').value = 'known'; }
  pviews = {};
  changed(true);
});
$('uen-list').addEventListener('input', e => {
  const t = e.target, idx = +t.getAttribute('data-uen-idx'), field = t.getAttribute('data-uen-field');
  if (isNaN(idx) || !S.uens[idx] || !field) return;
  S.uens[idx][field] = t.value;
  if (field === 'bal') S.balConfirmed = true;
  if (field === 'bal' || field === 'balNew') pviews = {};
  document.querySelectorAll('#course-list select[data-field="uenId"]').forEach((sel, cIdx) => { sel.innerHTML = uenOptionsHtml(S.courses[cIdx] ? S.courses[cIdx].uenId : ''); });
  updateUenSummary();
  if (S.example) S.example = false;
  persist(); schedule();
});
$('uen-list').addEventListener('click', e => {
  const b = e.target.closest('button[data-act="remove-uen"]');
  if (!b || S.uens.length <= 1) return;
  const removed = S.uens.splice(+b.getAttribute('data-uen-idx'), 1)[0];
  if (removed) S.courses.forEach(c => { if (c.uenId === removed.id) c.uenId = ''; });
  pviews = {};
  changed(true);
});
$('add-uen').addEventListener('click', () => { S.uens.push(makeUenItem({name:'Entity ' + (S.uens.length + 1)})); pviews = {}; changed(true); });

$('course-list').addEventListener('input', e => {
  const t = e.target, idx = +t.getAttribute('data-idx'), field = t.getAttribute('data-field');
  if (isNaN(idx) || !S.courses[idx] || !field || ['k','delivery','pilot','uenId','paxConfirmed','sessions','legacySfec'].includes(field)) return;
  const item = S.courses[idx];
  item[field] = t.value;
  // 70% option: one count for every Citizen and PR, so nothing is left at 50%
  if (field === 'm70' && S.tier === '70') item.m50 = '0';
  if (['m50','m70','mpass'].includes(field) && S.exactMakeup){
    const m = parseMakeup(item.m50, item.m70, item.mpass);
    item.pax = String(m.qty);
    const tot = $('mk-tot-' + idx); if (tot) tot.textContent = m.qty + ' pax';
    const paxInp = $('course-list').querySelector(`input[data-field="pax"][data-idx="${idx}"]`); if (paxInp) paxInp.value = String(m.qty);
  }
  if (['pax','m50','m70','mpass','fee','hrs','asmt','formatOpts'].includes(field)) pviews = {};
  if (field === 'date' && S.courses.filter(c => (c.date || '').trim()).length >= 2 && !S.slides.timeline){ S.slides.timeline = true; $('sl-timeline').checked = true; }
  changed(false);
});
$('course-list').addEventListener('change', e => {
  const t = e.target, idx = +t.getAttribute('data-idx'), field = t.getAttribute('data-field');
  if (isNaN(idx) || !S.courses[idx] || !field) return;
  const item = S.courses[idx];
  if (field === 'k'){ item.k = t.value; item.fee = ''; item.hrs = ''; pviews = {}; changed(true); }
  else if (field === 'delivery'){ item.delivery = t.value; pviews = {}; changed(true); }
  else if (field === 'sessions'){ item.sessions = t.value; pviews = {}; changed(false); }
  else if (field === 'uenId'){ item.uenId = t.value; pviews = {}; changed(false); }
  else if (field === 'pilot'){ const on = t.checked; S.courses.forEach((c, i) => { c.pilot = i === idx ? on : false; }); changed(true); }
  else if (field === 'paxConfirmed'){ item.paxConfirmed = t.checked; changed(false); }
  else if (field === 'legacySfec'){ item.legacySfec = t.checked; pviews = {}; changed(true); }
  else if (field === 'date'){ item.date = t.value; changed(false); }
});
$('course-list').addEventListener('click', e => {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const act = b.getAttribute('data-act'), idx = +b.getAttribute('data-idx');
  if (act === 'remove-course' && S.courses.length > 1){ S.courses.splice(idx, 1); pviews = {}; changed(true); }
  else if (act === 'toggle-ov'){ const ov = $('ov-' + idx); if (ov) ov.hidden = !ov.hidden; }
  else if (act === 'copy-makeup' && idx > 0){ const c0 = S.courses[0], ci = S.courses[idx]; ci.m50 = c0.m50; ci.m70 = c0.m70; ci.mpass = c0.mpass; ci.pax = String(parseMakeup(ci.m50, ci.m70, ci.mpass).qty); pviews = {}; changed(true); }
});
$('add-course').addEventListener('click', () => {
  if (S.courses.length >= MAX_COURSES) return;
  const used = new Set(S.courses.map(c => c.k));
  const nextKey = ['gaicc','wfa','da','cyber','carbon','dm','pbi','ux','lead'].find(k => !used.has(k)) || (COURSES.find(c => !used.has(c.k)) || {}).k || 'gaicc';
  const prev = S.courses[S.courses.length - 1];
  let nextDate = '';
  if (prev && parseISO(prev.date)) nextDate = isoAddDays(prev.date, 14);
  S.courses.push(makeCourseItem({k:nextKey, delivery:prev ? prev.delivery : 'private', team:S.multiMode === 'standalone' ? '' : (prev ? prev.team : ''), pax:prev ? prev.pax : '12', date:nextDate, m50:prev ? prev.m50 : '6', m70:prev ? prev.m70 : '6', mpass:prev ? prev.mpass : '0'}));
  pviews = {};
  changed(true);
});
$('cmp-focus').addEventListener('change', e => { S.compareFocus = e.target.value; changed(false); });
$('multi-mode').addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (!b) return; S.multiMode = b.dataset.v; changed(true); });
/* ---------- v7.1: plot the pathway by moving blocks ----------
   The board mirrors the pathway slide. Drag a course onto the course it follows, or onto "Start a new track"; courses
   that follow the same course branch from it. Until a block is moved the pathway is drawn from the team names; the
   first move keeps that picture as the starting point (S.pathPlan = {after:{courseId: courseId | ''}, order:[ids]}). */
var ppSel = '', ppDrag = '';
function ppShape(){
  // the pathway as it stands now: plotted, or drawn from the team names
  const ctx = makeCtx(deckState()), P = pwGraph(ctx), after = {}, order = P.order.map(n => n.c.slotId);
  P.nodes.forEach(n => { after[n.c.slotId] = n.ins.length ? n.ins[0].c.slotId : ''; });
  return {P, after, order, plotted:P.plotted};
}
function ppPlan(){
  if (!S.pathPlan || !S.pathPlan.after){ const sh = ppShape(); S.pathPlan = {after:sh.after, order:sh.order}; }
  const ids = S.courses.map(c => c.id), clean = pathPlanFor(S, ids);
  S.pathPlan = {after:clean.after, order:clean.order};
  return S.pathPlan;
}
function ppUnder(plan, id, maybe){ let p = maybe, g = 0; while (p && g++ < 20){ if (p === id) return true; p = plan.after[p] || ''; } return false; }
/* Makes a course follow another ('' starts a new track). A course cannot follow one that comes after it. */
function ppMove(id, parent){
  if (!id || id === parent) return;
  const plan = ppPlan();
  if (parent && ppUnder(plan, id, parent)){ status('That course comes after the one you are moving. Move it out first.', 'err'); return; }
  plan.after[id] = parent || '';
  plan.order = plan.order.filter(x => x !== id).concat(id);
  ppSel = id;
  changed(false);
}
function ppShift(id, dir){
  const plan = ppPlan(), sibs = plan.order.filter(x => (plan.after[x] || '') === (plan.after[id] || '')), i = sibs.indexOf(id), j = i + dir;
  if (i < 0 || j < 0 || j >= sibs.length) return;
  const a = plan.order.indexOf(id), b = plan.order.indexOf(sibs[j]);
  plan.order[a] = sibs[j]; plan.order[b] = id;
  changed(false);
}
function renderPathPlot(){
  const wrap = $('path-plot'); if (!wrap) return;
  if (S.courses.length < 2){ wrap.hidden = true; return; }
  wrap.hidden = false;
  let sh;
  try { sh = ppShape(); } catch (e) { $('pp-board').innerHTML = ''; return; }
  const byId = {}; S.courses.forEach((c, i) => { byId[c.id] = {c, i}; });
  if (!byId[ppSel]) ppSel = '';
  const kids = p => sh.order.filter(id => (sh.after[id] || '') === p && byId[id]);
  const node = id => {
    const it = byId[id], cc = C[it.c.k] || {}, k = kids(id);
    return '<div class="pp-node"><div class="pp-block' + (id === ppSel ? ' is-sel' : '') + (it.c.pilot ? ' is-pilot' : '') + '" draggable="true" tabindex="0" role="button" data-id="' + esc(id) + '" aria-pressed="' + (id === ppSel) + '" title="Drag onto the course this one follows">' +
      '<b>' + esc(cc.short || it.c.k) + '</b><small>' + esc(String(it.c.pax || 0)) + ' pax' + (it.c.pilot ? ' · pilot' : '') + '</small></div>' +
      (k.length ? '<div class="pp-kids">' + k.map(node).join('') + '</div>' : '') + '</div>';
  };
  $('pp-board').innerHTML = '<div class="pp-col">' + kids('').map(node).join('') + '<div class="pp-drop" data-id="">Drop on any empty space to start a new track</div></div>';
  $('pp-mode').textContent = sh.plotted ? 'Plotted by you' : 'Automatic, from the team names';
  $('pp-reset').hidden = !sh.plotted; $('pp-reset2').disabled = !sh.plotted;
  if (!$('pp-modal').hidden){
    // the slide itself, under the board, so each move shows at once
    try { const sl = buildDeck(deckState(), {mode:'static'}).slides.find(x => x.slideKey === 'pathway'); $('pp-view').innerHTML = sl ? slideSVG(sl, 'Proposed pathway slide') : ''; } catch (e) { $('pp-view').innerHTML = ''; }
  }
  // the selected block can also be moved without dragging
  const tools = $('pp-tools');
  if (!ppSel){ tools.hidden = false; tools.innerHTML = '<span class="pp-mode">Select a block to move it with a menu instead of dragging.</span>'; return; }
  const plan = {after:sh.after};
  const opts = ['<option value="">Starts a track</option>'].concat(sh.order.filter(id => id !== ppSel && byId[id] && !ppUnder(plan, ppSel, id))
    .map(id => '<option value="' + esc(id) + '"' + ((sh.after[ppSel] || '') === id ? ' selected' : '') + '>Follows ' + esc((C[byId[id].c.k] || {}).short || byId[id].c.k) + ' (course ' + (byId[id].i + 1) + ')</option>'));
  tools.hidden = false;
  tools.innerHTML = '<span><b>' + esc((C[byId[ppSel].c.k] || {}).short || '') + '</b></span><select class="sel" id="pp-after" aria-label="Which course this one follows">' + opts.join('') + '</select>' +
    '<button type="button" class="btn" data-pp="-1" title="Move up among the courses beside it" aria-label="Move up">↑</button><button type="button" class="btn" data-pp="1" title="Move down among the courses beside it" aria-label="Move down">↓</button>';
}
$('pp-board').addEventListener('click', e => { const b = e.target.closest('.pp-block'); if (!b) return; ppSel = ppSel === b.dataset.id ? '' : b.dataset.id; renderPathPlot(); });
$('pp-board').addEventListener('keydown', e => { const b = e.target.closest('.pp-block'); if (b && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); ppSel = b.dataset.id; renderPathPlot(); const s2 = $('pp-after'); if (s2) s2.focus(); } });
$('pp-board').addEventListener('dragstart', e => { const b = e.target.closest('.pp-block'); if (!b) return; ppDrag = b.dataset.id; try { e.dataTransfer.setData('text/plain', ppDrag); e.dataTransfer.effectAllowed = 'move'; } catch (err) {} b.classList.add('is-drag'); });
$('pp-board').addEventListener('dragend', () => { ppDrag = ''; document.querySelectorAll('#pp-board .is-over, #pp-board .is-drag').forEach(el => el.classList.remove('is-over', 'is-drag')); });
/* A block is a target for the course that should follow it; anywhere else on the board starts a new track */
const ppTarget = e => { const t = e.target.closest('.pp-block') || $('pp-board').querySelector('.pp-drop'); return t && ppDrag && t.dataset.id !== ppDrag ? t : null; };
$('pp-board').addEventListener('dragover', e => { const t = ppTarget(e); if (!t) return; e.preventDefault(); document.querySelectorAll('#pp-board .is-over').forEach(el => { if (el !== t) el.classList.remove('is-over'); }); t.classList.add('is-over'); });
$('pp-board').addEventListener('dragleave', e => { if (!$('pp-board').contains(e.relatedTarget)) document.querySelectorAll('#pp-board .is-over').forEach(el => el.classList.remove('is-over')); });
$('pp-board').addEventListener('drop', e => { const t = ppTarget(e); if (!t) return; e.preventDefault(); const id = ppDrag; ppDrag = ''; ppMove(id, t.dataset.id || ''); });
$('pp-tools').addEventListener('change', e => { if (e.target.id === 'pp-after') ppMove(ppSel, e.target.value); });
$('pp-tools').addEventListener('click', e => { const b = e.target.closest('button[data-pp]'); if (b) ppShift(ppSel, +b.dataset.pp); });
const ppReset = () => { S.pathPlan = null; ppSel = ''; changed(false); status('The pathway follows the team names again.', 'ok'); };
$('pp-reset').addEventListener('click', ppReset);
$('pp-reset2').addEventListener('click', ppReset);
$('pp-open').addEventListener('click', () => { $('pp-modal').hidden = false; renderPathPlot(); });
$('pp-close').addEventListener('click', () => { $('pp-modal').hidden = true; });
$('pp-done').addEventListener('click', () => { $('pp-modal').hidden = true; });
$('pp-modal').addEventListener('click', e => { if (e.target === $('pp-modal')) $('pp-modal').hidden = true; });

$('sfec-mode').addEventListener('click', e => {
  const b = e.target.closest('button[data-v]'); if (!b) return;
  S.sfecMode = b.dataset.v;
  document.querySelectorAll('#sfec-mode button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  changed(false);
});
$('sfec-hint').addEventListener('click', e => { const b = e.target.closest('[data-sfec-fix]'); if (b) runFix('sfec:' + b.dataset.sfecFix); });
$('exact-makeup').addEventListener('change', () => {
  S.exactMakeup = $('exact-makeup').checked;
  if (S.exactMakeup){
    S.courses.forEach(c => {
      if (parseMakeup(c.m50, c.m70, c.mpass).qty === 0){
        const p = Math.max(1, parseInt(c.pax, 10) || 12);
        if (S.tier === '70'){ c.m50 = '0'; c.m70 = String(p); } else { c.m50 = String(Math.ceil(p / 2)); c.m70 = String(Math.floor(p / 2)); }
        c.mpass = '0';
      }
      c.pax = String(parseMakeup(c.m50, c.m70, c.mpass).qty);
    });
  }
  pviews = {};
  changed(true);
});
$('decision').addEventListener('change', () => { S.decision = $('decision').value; changed(false); });
$('date').addEventListener('change', () => { S.date = $('date').value || todayISO(); changed(false); });
$('pass').addEventListener('change', () => { S.pass = $('pass').checked; pviews = {}; changed(false); });
OPTIONAL.forEach(([id, k]) => $(id).addEventListener('change', () => toggleSlideIncluded(k, $(id).checked)));
$('slide-mgr-list').addEventListener('change', e => { const cb = e.target.closest('input[data-slide-toggle]'); if (cb) toggleSlideIncluded(cb.getAttribute('data-slide-toggle'), cb.checked); });
$('restore-all-slides').addEventListener('click', restoreAllRemovedSlides);
$('removed-bar').addEventListener('click', e => {
  const b = e.target.closest('button[data-restore-slide]');
  if (b){ toggleSlideIncluded(b.getAttribute('data-restore-slide'), true); return; }
  if (e.target.closest('button[data-restore-all]')) restoreAllRemovedSlides();
});
$('schedule').addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (!b) return; S.schedule = b.dataset.v; document.querySelectorAll('#schedule button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); changed(false); });
$('brief').addEventListener('submit', e => e.preventDefault());
$('pick-list').addEventListener('change', e => {
  const cb = e.target.closest('input[data-k]'); if (!cb) return;
  let list = S.othersMode === 'custom' ? S.othersList.slice() : pickOthers(makeCtx(deckState()));
  if (cb.checked){ if (!list.includes(cb.dataset.k) && list.length < 6) list.push(cb.dataset.k); } else list = list.filter(k => k !== cb.dataset.k);
  S.othersMode = list.length ? 'custom' : 'auto'; S.othersList = list; changed(false);
});
$('pick-auto').addEventListener('click', () => { S.othersMode = 'auto'; S.othersList = []; changed(false); });
$('cpick-list').addEventListener('change', e => {
  const cb = e.target.closest('input[data-c]'); if (!cb) return;
  let list = S.casesMode === 'custom' ? S.casesList.slice() : pickCases(makeCtx(deckState())).slice();
  if (cb.checked){ if (!list.includes(cb.dataset.c) && list.length < 2) list.push(cb.dataset.c); } else list = list.filter(k => k !== cb.dataset.c);
  S.casesMode = list.length ? 'custom' : 'auto'; S.casesList = list; changed(false);
});
$('cpick-auto').addEventListener('click', () => { S.casesMode = 'auto'; S.casesList = []; changed(false); });
$('icon-tile').addEventListener('change', () => { S.iconTile = $('icon-tile').checked; pviews = {}; changed(false); });

/* ---------- Custom success stories ---------- */
const CS_FIELDS = ['name', 'sector', 'url', 'what', 'why', 'quote', 'who'];
let csEditId = null;
function csShow(show){ $('cs-form').hidden = !show; $('cs-open').hidden = show; $('cs-msg').textContent = ''; }
function renderCustomCases(){
  const list = Array.isArray(S.customCases) ? S.customCases : [];
  $('cs-list').innerHTML = list.map(c => '<div class="cs-row"><span>' + esc(c.name) + '</span><span><button type="button" class="link-btn" data-cs-edit="' + esc(c.id) + '">Edit</button><button type="button" class="link-btn" data-cs-del="' + esc(c.id) + '">Remove</button></span></div>').join('');
  const full = list.length >= CUSTOM_CASE_MAX;
  $('cs-open').disabled = full;
  $('cs-open').textContent = full ? 'Story limit reached (' + CUSTOM_CASE_MAX + ')' : '+ Add your own success story';
}
$('cs-open').addEventListener('click', () => { csEditId = null; CS_FIELDS.forEach(f => { $('cs-' + f).value = ''; }); csShow(true); $('cs-name').focus(); });
$('cs-cancel').addEventListener('click', () => { csEditId = null; csShow(false); });
$('cs-list').addEventListener('click', e => {
  const ed = e.target.closest('[data-cs-edit]'), del = e.target.closest('[data-cs-del]');
  if (ed){
    const c = (S.customCases || []).find(x => x.id === ed.dataset.csEdit); if (!c) return;
    csEditId = c.id; CS_FIELDS.forEach(f => { $('cs-' + f).value = c[f] || ''; }); csShow(true); $('cs-name').focus();
  } else if (del){
    if (del.dataset.armed !== '1'){ del.dataset.armed = '1'; del.textContent = 'Confirm remove'; return; }
    const id = del.dataset.csDel;
    S.customCases = (S.customCases || []).filter(x => x.id !== id);
    S.casesList = S.casesList.filter(k => k !== id);
    if (!S.casesList.length) S.casesMode = 'auto';
    pviews = {}; changed(false);
  }
});
$('cs-save').addEventListener('click', () => {
  const v = {}; CS_FIELDS.forEach(f => { v[f] = $('cs-' + f).value; });
  let u = v.url.trim();
  if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u;
  if (u && !/^https?:\/\/[^\s"<>]+\.[^\s"<>]+$/i.test(u)){ $('cs-msg').textContent = 'That link does not look right.'; return; }
  v.url = u;
  const clean = cleanCustomCases([Object.assign({id: csEditId || ''}, v)]);
  if (!clean.length){ $('cs-msg').textContent = 'Add a client name and what we did.'; return; }
  const item = clean[0];
  if (!Array.isArray(S.customCases)) S.customCases = [];
  const at = S.customCases.findIndex(x => x.id === csEditId);
  if (at >= 0){ item.id = csEditId; S.customCases[at] = item; }
  else {
    if (S.customCases.length >= CUSTOM_CASE_MAX) return;
    S.customCases.push(item);
    const cur = pickCases(makeCtx(deckState())).filter(k => k !== item.id).slice(0, 2);
    S.casesMode = 'custom';
    S.casesList = (cur.length >= 2 ? cur.slice(0, 1) : cur).concat(item.id);
  }
  csEditId = null; csShow(false); pviews = {}; changed(false);
});
document.querySelectorAll('[data-me]').forEach(inp => inp.addEventListener('input', () => {
  ME[inp.dataset.me] = inp.value;
  try { localStorage.setItem(ME_KEY, JSON.stringify(ME)); } catch (e) {}
  schedule();
}));
$('me-reset').addEventListener('click', () => {
  ME = Object.assign({}, CONSULTANT_DEFAULT);
  try { localStorage.removeItem(ME_KEY); } catch (e) {}
  syncForm(); schedule();
});

function goToSlide(n){
  setTab('preview'); setView('slides');
  if (built && n > built.main && !detailsOpen){ detailsOpen = true; renderDetailBlock(built); }
  const el = $('slide-' + n); if (!el) return;
  el.scrollIntoView({behavior: reduceMotion() ? 'auto' : 'smooth', block:'start'});
  el.classList.add('is-target'); setTimeout(() => el.classList.remove('is-target'), 1200);
}
$('chips').addEventListener('click', e => { const a = e.target.closest('a[data-i]'); if (!a) return; e.preventDefault(); goToSlide(+a.dataset.i); });
$('slides').addEventListener('click', e => {
  const rem = e.target.closest('button[data-remove-slide]');
  if (rem){ e.preventDefault(); e.stopPropagation(); const k = rem.getAttribute('data-remove-slide'); if (k){ toggleSlideIncluded(k, false); status('Slide removed. The remaining slides and the Contents page renumbered.', 'ok'); } return; }
  const rv = e.target.closest('button[data-reset-view]');
  if (rv){ delete pviews[rv.getAttribute('data-reset-view')]; render(); return; }
  const a = e.target.closest('a'); if (!a) return;
  const goAttr = a.getAttribute('data-go');
  if (goAttr){ e.preventDefault(); goToSlide(+goAttr); return; }
  const url = a.getAttribute('data-href') || a.getAttribute('href');
  if (url && /^(https?:|mailto:|tel:)/i.test(url)){ e.preventDefault(); window.open(url, '_blank', 'noopener,noreferrer'); }
});

/* =====================================================================
   v6: TALKING POINTS FROM THE CALL, LESSON SLIDES, SLIDE ORDER
   ===================================================================== */
/* ---------- What their teams told you ---------- */
const BLANK_PAIN = () => ({team:'', tools:'', text:'', head:'', body:'', theme:'', link:''});
function linkOptionsHtml(sel, ctx){
  let h = '<option value=""' + (!sel ? ' selected' : '') + '>The programme as a whole</option>';
  ctx.courses.forEach(c => {
    const L = c.lessons || c.areas || [];
    h += '<optgroup label="' + esc(c.short + (ctx.multi ? ' (course ' + (c.idx + 1) + ')' : '')) + '">';
    if (ctx.multi) h += '<option value="c:' + c.k + '"' + (sel === 'c:' + c.k ? ' selected' : '') + '>The whole ' + esc(c.short) + ' course</option>';
    L.forEach((l, i) => { const v = 'm:' + c.k + ':' + (i + 1); h += '<option value="' + v + '"' + (sel === v ? ' selected' : '') + '>' + (c.lessons ? 'Lesson ' : 'Area ') + (i + 1) + ': ' + esc(l[0]) + '</option>'; });
    h += '</optgroup>';
  });
  const taken = new Set(ctx.courses.map(c => c.k));
  h += '<optgroup label="Another course (leads Other courses)">' + COURSES.filter(c => !taken.has(c.k)).map(c => '<option value="c:' + c.k + '"' + (sel === 'c:' + c.k ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') + '</optgroup>';
  if (sel && h.indexOf('value="' + sel + '"') < 0) h = '<option value="' + esc(sel) + '" selected>No longer in this proposal: choose again</option>' + h;
  return h;
}
/* Where each typed point goes, as shown on its card */
function painDests(ctx){
  const taken = new Set(ctx.courses.map(c => c.k));
  let prog = 0;
  return (S.pains || []).map(p => {
    if (!String(p.text || '').trim()) return {label:'Not shown until it has text', off:true};
    const m = /^c:(\w+)$/.exec(p.link || '');
    if (m && C[m[1]] && !taken.has(m[1])) return isSlideKeyRemoved(S, 'others') ? {label:'Other courses (slide removed)', off:true, other:true} : {label:'Other courses', other:true};
    prog++;
    return prog <= 3 ? {label:'Why this matters'} : {label:'Does not fit (3 shown)', off:true};
  });
}
/* The benefit a point gets when its own is left blank (shown as placeholder text) */
function autoBenefit(ctx, p){
  const theme = PAIN_THEMES.some(t => t[0] === p.theme) ? p.theme : guessTheme((p.text || '') + ' ' + (p.tools || ''));
  const m = /^(?:m|c):(\w+)/.exec(p.link || ''), k = m ? m[1] : '';
  const course = ctx.courses.find(c => c.k === k) || null;
  if (k && !course && C[k]) return painOutcome(C[k], {theme, head:'', body:''}, courseOutcome(ctx, C[k]));
  return painBenefit(ctx, {theme, course, head:'', body:''});
}
function renderPains(){
  const host = $('pain-list');
  if (host.contains(document.activeElement)) { updatePainHeads(); return; }
  const open = Array.from(host.querySelectorAll('details.pain-more[open]')).map(d => d.closest('[data-pi]').dataset.pi);
  const ctx = makeCtx(deckState()), dests = painDests(ctx), list = S.pains || [], n = list.length;
  const bmap = painBenefitMap(ctx);
  host.innerHTML = list.map((p, i) => {
    const d = dests[i], auto = bmap.get(i) && !p.head ? bmap.get(i) : autoBenefit(ctx, p);
    const guess = guessTheme((p.text || '') + ' ' + (p.tools || ''));
    const themeOpts = '<option value="">Automatic: ' + esc((PAIN_THEMES.find(t => t[0] === guess) || PAIN_THEMES[0])[1].toLowerCase()) + '</option>' +
      PAIN_THEMES.map(t => '<option value="' + t[0] + '"' + (p.theme === t[0] ? ' selected' : '') + '>' + esc(t[1]) + '</option>').join('');
    const edited = !!(p.head || p.body || p.theme);
    return '<div class="pain-item' + (d.other ? ' is-other' : '') + '" data-pi="' + i + '">' +
      '<div class="pain-head"><span>Point ' + (i + 1) + '<span class="pain-dest' + (d.off ? ' off' : '') + '">' + esc(d.label) + '</span></span>' +
      '<span class="pain-acts"><button type="button" class="icon-btn sm" data-pa="up" aria-label="Move point ' + (i + 1) + ' up"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
      '<button type="button" class="icon-btn sm" data-pa="down" aria-label="Move point ' + (i + 1) + ' down"' + (i >= n - 1 ? ' disabled' : '') + '>↓</button>' +
      '<button type="button" class="link-btn danger" data-pa="remove" aria-label="Remove point ' + (i + 1) + '">Remove</button></span></div>' +
      '<label class="f"><span>What they said</span><textarea class="ta" rows="2" data-pf="text" maxlength="220" placeholder="e.g. Month-end commentary is drafted by hand from report exports">' + esc(p.text) + '</textarea></label>' +
      '<div class="row2"><label class="f"><span>Team</span><input type="text" data-pf="team" maxlength="40" placeholder="e.g. Finance" value="' + esc(p.team) + '"></label>' +
      '<label class="f"><span>Tools</span><input type="text" data-pf="tools" maxlength="80" placeholder="e.g. Xero, AutoCount" title="Separate tools with commas to show each as its own tag" value="' + esc(p.tools) + '"></label></div>' +
      '<label class="f"><span>Answered by</span><select data-pf="link">' + linkOptionsHtml(p.link, ctx) + '</select></label>' +
      '<details class="pain-more"' + (edited || open.includes(String(i)) ? ' open' : '') + '><summary>Benefit shown beside it' + ((p.head || p.body) ? ' (edited)' : '') + '</summary>' +
      '<label class="f"><span>Headline <em>(blank: from the theme)</em></span><input type="text" data-pf="head" maxlength="70" placeholder="' + esc(auto[0]) + '" value="' + esc(p.head) + '"></label>' +
      '<label class="f"><span>Detail <em>(blank: from the theme)</em></span><textarea class="ta" rows="2" data-pf="body" maxlength="240" placeholder="' + esc(auto[1] || '') + '">' + esc(p.body) + '</textarea></label>' +
      '<label class="f"><span>Theme</span><select data-pf="theme">' + themeOpts + '</select></label></details></div>';
  }).join('');
  $('add-pain').disabled = n >= PAIN_MAX;
  $('add-pain').textContent = n >= PAIN_MAX ? 'Five points is the most a deck shows' : '+ Add a point from the call';
}
function updatePainHeads(){
  const dests = painDests(makeCtx(deckState()));
  document.querySelectorAll('#pain-list [data-pi]').forEach(el => {
    const d = dests[+el.dataset.pi]; if (!d) return;
    const tag = el.querySelector('.pain-dest');
    tag.textContent = d.label; tag.classList.toggle('off', !!d.off);
    el.classList.toggle('is-other', !!d.other);
  });
}
$('pain-list').addEventListener('input', e => {
  const t = e.target, f = t.dataset && t.dataset.pf, it = t.closest('[data-pi]');
  if (!f || !it || t.tagName === 'SELECT') return;
  const p = S.pains[+it.dataset.pi]; if (!p) return;
  p[f] = t.value;
  changed(false);
});
$('pain-list').addEventListener('change', e => {
  const t = e.target, f = t.dataset && t.dataset.pf, it = t.closest('[data-pi]');
  if (!f || !it) return;
  const p = S.pains[+it.dataset.pi]; if (!p) return;
  p[f] = t.value;
  if (t.tagName === 'SELECT'){ t.blur(); changed(false); renderPains(); }
  else { changed(false); if (f === 'text' || f === 'tools') { const fo = document.activeElement; if (!fo || !it.contains(fo)) renderPains(); } }
});
$('pain-list').addEventListener('click', e => {
  const b = e.target.closest('button[data-pa]'); if (!b) return;
  const i = +b.closest('[data-pi]').dataset.pi, a = b.dataset.pa, L = S.pains;
  if (a === 'remove') L.splice(i, 1);
  else { const j = i + (a === 'up' ? -1 : 1); if (j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; }
  b.blur();
  changed(false); renderPains();
  const again = document.querySelector('#pain-list [data-pi="' + Math.max(0, Math.min(L.length - 1, a === 'remove' ? i : i + (a === 'up' ? -1 : 1))) + '"] [data-pa="' + a + '"]:not(:disabled)');
  if (again && a !== 'remove') again.focus();
});
$('add-pain').addEventListener('click', () => {
  if ((S.pains || []).length >= PAIN_MAX) return;
  S.pains = (S.pains || []).concat([BLANK_PAIN()]);
  changed(false); renderPains();
  const ta = document.querySelector('#pain-list [data-pi="' + (S.pains.length - 1) + '"] textarea[data-pf="text"]');
  if (ta) ta.focus();
});

/* ---------- Lesson slides ---------- */
const LEVEL_TEXT = {simple:'Simple: what the lesson covers, the capability practised and a workplace example.', detailed:'Detailed: adds the key learning points and the hands-on practice. The PDF and web deck always show Simple.', technical:'Technical: adds topics and techniques, the tools used and what participants build. The PDF and web deck always show Simple.'};
function renderLessonSettings(){
  const ctx = makeCtx(deckState());
  $('details-on').checked = S.details !== false;
  $('details-pdf').checked = S.detailsPdf !== false;
  document.querySelectorAll('#detail-level button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === S.detailLevel)));
  const withSlides = ctx.courses.filter(hasLessonSlides), without = ctx.courses.filter(c => !hasLessonSlides(c));
  const deep = withSlides.filter(c => MODULE_DETAIL[c.k].some(m => m.learn));
  let note = '';
  if (!withSlides.length) note = 'None of the courses in this proposal has lesson slides yet; ' + (without.length === 1 ? 'its course slide keeps' : 'their course slides keep') + ' the lesson list.';
  else {
    note = LEVEL_TEXT[S.detailLevel] || LEVEL_TEXT.detailed;
    const flat = withSlides.filter(c => !deep.includes(c));
    if (S.detailLevel !== 'simple' && flat.length) note += ' ' + joinList(flat.map(c => c.short)) + (flat.length === 1 ? ' has' : ' have') + ' Simple content only.';
    if (without.length) note += ' ' + joinList(without.map(c => c.short)) + (without.length === 1 ? ' has' : ' have') + ' no lesson slides yet.';
  }
  $('level-note').textContent = note;
  const live = S.details !== false && withSlides.length > 0;
  $('level-wrap').hidden = !live;
  $('details-pdf').closest('label').hidden = !live;
  $('details-on').closest('label').classList.toggle('is-off', !withSlides.length);
  $('apps-wrap').hidden = !live;
  if (!$('apps-list').contains(document.activeElement)){
    $('apps-list').innerHTML = withSlides.map(c => '<div class="apps-course"><b>' + esc(c.short) + '</b>' + (c.lessons || c.areas).map((l, i) => {
      const key = c.k + ':' + (i + 1), D = modData(c, i);
      return '<label class="f"><span>' + (i + 1) + '. ' + esc(l[0]) + '</span><input type="text" data-app="' + esc(key) + '" maxlength="220" placeholder="' + esc(D && D.app ? 'Illustrative: ' + D.app : 'Their example (optional)') + '" value="' + esc((S.modApps || {})[key] || '') + '"></label>';
    }).join('') + '</div>').join('');
  }
}
$('details-on').addEventListener('change', () => { S.details = $('details-on').checked; changed(false); });
$('details-pdf').addEventListener('change', () => { S.detailsPdf = $('details-pdf').checked; changed(false); });
$('detail-level').addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (!b) return; S.detailLevel = b.dataset.v; changed(false); });
$('apps-list').addEventListener('input', e => {
  const t = e.target, k = t.dataset && t.dataset.app; if (!k) return;
  S.modApps = S.modApps || {};
  if (t.value.trim()) S.modApps[k] = t.value; else delete S.modApps[k];
  changed(false);
});
$('sl-catalogue').addEventListener('change', () => { S.slides.catalogue = $('sl-catalogue').checked; changed(false); });

/* ---------- Slide order and detail slide switches ---------- */
$('slide-mgr-list').addEventListener('change', e => {
  const t = e.target.closest('input[data-detail-toggle]'); if (!t) return;
  const k = t.dataset.detailToggle;
  if (k === 'catalogue'){ S.slides.catalogue = t.checked; $('sl-catalogue').checked = t.checked; }
  else { S.detailOff = Object.assign({}, S.detailOff); if (t.checked) delete S.detailOff[k]; else S.detailOff[k] = true; }
  changed(false);
});
$('slide-mgr-list').addEventListener('click', e => {
  const b = e.target.closest('[data-move]'); if (!b) return;
  e.preventDefault();
  moveSlide(b.closest('[data-okey]').dataset.okey, +b.dataset.move);
});
(() => {
  const list = $('slide-mgr-list');
  let drag = null;
  const clear = () => list.querySelectorAll('.drop-before,.drop-after,.is-drag').forEach(x => x.classList.remove('drop-before', 'drop-after', 'is-drag'));
  list.addEventListener('dragstart', e => {
    const it = e.target.closest && e.target.closest('[data-okey]');
    if (!it || it.dataset.key === 'cover'){ e.preventDefault(); return; }
    drag = it.dataset.okey; it.classList.add('is-drag');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', drag); } catch (x) {}
  });
  list.addEventListener('dragover', e => {
    if (!drag) return;
    const it = e.target.closest('[data-okey]');
    if (!it || it.dataset.key === 'cover' || it.dataset.okey === drag) return;
    e.preventDefault();
    const r = it.getBoundingClientRect(), after = e.clientY > r.top + r.height / 2;
    list.querySelectorAll('.drop-before,.drop-after').forEach(x => x.classList.remove('drop-before', 'drop-after'));
    it.classList.add(after ? 'drop-after' : 'drop-before');
  });
  list.addEventListener('drop', e => {
    if (!drag) return;
    e.preventDefault();
    const it = e.target.closest('[data-okey]'), k = drag;
    if (it && it.dataset.key !== 'cover' && it.dataset.okey !== k){
      const r = it.getBoundingClientRect();
      moveSlideTo(k, it.dataset.okey, e.clientY > r.top + r.height / 2);
      status('Slide moved. Use Reset order in the slide list to go back to the standard order.', 'ok');
    }
    drag = null; clear();
  });
  list.addEventListener('dragend', () => { drag = null; clear(); });
})();
$('reset-order').addEventListener('click', () => { S.order = []; changed(false); status('Slides are back in the standard order.', 'ok'); });

/* ---------- Detail slides in the preview ---------- */
let detailsOpen = false, lastDetailSig = '';
function renderDetailBlock(b){
  const nd = b.details || 0;
  $('details-block').hidden = !nd;
  if (!nd){ $('detail-grid').innerHTML = ''; lastDetailSig = ''; return; }
  const ds = b.slides.slice(b.main, b.main + nd);
  const lessons = ds.filter(x => /^md_/.test(x.slideKey)).length, courses = ds.filter(x => /^course_/.test(x.slideKey)).length, cat = ds.some(x => x.slideKey === 'catalogue');
  const parts = [];
  if (courses) parts.push(courses + ' course slide' + (courses > 1 ? 's' : ''));
  if (lessons) parts.push(lessons + ' lesson slide' + (lessons > 1 ? 's' : ''));
  if (cat) parts.push('the full course list');
  $('details-note').textContent = cap(joinList(parts)) + '. They open from buttons on the slides above, and are not in the slide order. ' +
    (S.detailsPdf === false ? 'The PDF leaves them out; ' : 'In the PDF they follow the main slides; ') + 'in PowerPoint they are hidden slides.' +
    (S.detailLevel !== 'simple' ? ' The PDF and web deck show the Simple version of each lesson.' : '');
  $('details-toggle').textContent = detailsOpen ? 'Hide detail slides' : 'Show detail slides (' + nd + ')';
  $('details-toggle').setAttribute('aria-expanded', String(detailsOpen));
  $('detail-grid').hidden = !detailsOpen;
  if (!detailsOpen) return;
  const host = $('detail-grid');
  while (host.children.length > nd) host.lastElementChild.remove();
  ds.forEach((s, k) => {
    const i = b.main + k;
    let fig = host.children[k];
    if (!fig){ fig = document.createElement('figure'); fig.className = 'slide'; fig.innerHTML = '<figcaption></figcaption><div class="frame"></div>'; host.appendChild(fig); }
    fig.id = 'slide-' + (i + 1);
    const svg = slideSVG(s, s.name, {links:false}), frameEl = fig.querySelector('.frame');
    if (frameEl._svg !== svg){ frameEl.innerHTML = svg; frameEl._svg = svg; }
    VI.mountLinks(frameEl, s, to => goToSlide(to + 1), b);
    const parent = s.parentIdx >= 0 ? b.slides[s.parentIdx] : null;
    fig.querySelector('figcaption').innerHTML = '<span class="slide-cap-text"><b>↳</b> ' + esc(s.name) + (parent ? ' <span style="font-weight:400">· from ' + esc(parent.name) + '</span>' : '') + '</span>';
  });
}
$('details-toggle').addEventListener('click', () => { detailsOpen = !detailsOpen; if (built) renderDetailBlock(built); });
$('detail-grid').addEventListener('click', e => {
  const a = e.target.closest('a'); if (!a) return;
  const goAttr = a.getAttribute('data-go');
  if (goAttr){ e.preventDefault(); goToSlide(+goAttr); }
});

/* ---------- Draft from call notes, with Claude (the sample capability; hidden where it is not available) ---------- */
let sampleNs = null, notesAbort = null, notesDraft = null;
(function lookForClaude(){
  try {
    if (!window.claude || typeof window.claude.use !== 'function') return;
    Promise.race([Promise.resolve(window.claude.use('sample')), new Promise(r => setTimeout(() => r(null), 10000))])
      .then(ns => { sampleNs = ns || null; $('notes-open').hidden = !sampleNs; }).catch(() => {});
  } catch (e) {}
})();
function notesStatus(msg, kind){ const el = $('notes-status'); el.textContent = msg || ''; el.classList.toggle('is-error', kind === 'error'); el.classList.toggle('is-ok', kind === 'ok'); }
function openNotes(){
  $('notes-modal').hidden = false;
  $('notes-result').hidden = true; $('notes-apply-row').hidden = true; notesDraft = null;
  notesStatus('');
  countNotes();
  $('notes-text').focus();
}
function closeNotes(){ if (notesAbort) notesAbort.abort(); $('notes-modal').hidden = true; }
function countNotes(){ const n = $('notes-text').value.trim().split(/\s+/).filter(Boolean).length; $('notes-count').textContent = n ? n + ' words' : ''; }
$('notes-text').addEventListener('input', countNotes);
$('notes-open').addEventListener('click', openNotes);
$('notes-close').addEventListener('click', closeNotes);
$('notes-cancel').addEventListener('click', closeNotes);
$('notes-modal').addEventListener('click', e => { if (e.target === $('notes-modal')) closeNotes(); });
/* What Claude is told: the proposal's courses and lessons, the courses it could point to, and the shape to answer in */
function notesPrompt(notes){
  const ctx = makeCtx(deckState()), taken = new Set(ctx.courses.map(c => c.k));
  const courses = ctx.courses.map(c => '- ' + c.k + ': ' + c.name + (c.team ? ' (for ' + c.team + ')' : '') + '\n' + (c.lessons || c.areas || []).map((l, i) => '    ' + c.k + ':' + (i + 1) + ' ' + l[0] + ' (' + l[1] + ')').join('\n')).join('\n');
  const others = COURSES.filter(c => !taken.has(c.k)).map(c => '- ' + c.k + ': ' + c.name + ' (' + c.one + ')').join('\n');
  return [
    'You help ' + (ME.name || 'a consultant') + ', a corporate training consultant at Vertical Institute in Singapore, turn notes from a call with a client into talking points for a training proposal deck.',
    'Rules: use only what the notes say. Never invent facts, figures, people, tools, systems or quotes. If the notes do not support a field, leave it empty. Write in plain British English, short and concrete, in the client\'s own terms where possible. Do not use em dashes.',
    '',
    'The proposal is for ' + (ctx.clientFull || 'the client') + ' (' + ctx.ind.label + ').',
    'Courses in the proposal, with their lessons as course:lesson codes:',
    courses,
    '',
    'Other courses the client could take later (use only when no lesson above answers a point):',
    others,
    '',
    'Answer with JSON only, in this shape:',
    '{"priority":"their main priority as a short phrase in lower case, or empty",',
    ' "heard":"one or two sentences for the executive summary on what their teams told us, naming the tools or systems they use; empty if the notes say too little",',
    ' "pains":[{"team":"team or role, e.g. Finance","tools":"tools or systems named for this point, separated by commas, or empty","text":"the problem as the client described it, one sentence without a full stop","link":"course:lesson code from the list above that best answers it, or c:<course key> for a whole course (another course only when nothing in the proposal fits), or empty","head":"what changes for them, at most seven words","body":"one sentence on what participants learn that addresses it"}],',
    ' "practice":[{"work":"team","tools":"tools, or empty","text":"what that team would practise in class with sample or anonymised material, one sentence"}],',
    ' "modApps":{"course:lesson":"a workplace example for this client for that lesson, one sentence"},',
    ' "focus":[lesson numbers of the first course that deserve the most practice time]}',
    'Limits: pains at most 5, most important first; practice at most 5; modApps at most 6, only for lessons the notes clearly relate to; focus at most 4.',
    '',
    'The notes:',
    '"""',
    notes,
    '"""'
  ].join('\n');
}
/* Keeps only what fits the draft: known lesson codes and courses, sensible lengths */
function cleanDraft(raw){
  const ctx = makeCtx(deckState()), taken = new Set(ctx.courses.map(c => c.k));
  const str = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').replace(/\s*[—–]\s*/g, ', ').trim().slice(0, n);
  const okLink = l => {
    l = str(l, 40);
    let m = /^(\w+):(\d+)$/.exec(l);
    if (m && taken.has(m[1])){ const c = C[m[1]]; return +m[2] >= 1 && +m[2] <= (c.lessons || c.areas || []).length ? 'm:' + m[1] + ':' + m[2] : ''; }
    m = /^m:(\w+):(\d+)$/.exec(l); if (m && taken.has(m[1])) return okLink(m[1] + ':' + m[2]);
    m = /^c:(\w+)$/.exec(l); if (m && C[m[1]]) return l;
    return '';
  };
  const d = raw && typeof raw === 'object' ? raw : {};
  const out = {
    priority: str(d.priority, 120).replace(/\.$/, ''),
    heard: str(d.heard, 420),
    pains: (Array.isArray(d.pains) ? d.pains : []).map(p => p && typeof p === 'object' ? {team:str(p.team, 40), tools:str(p.tools, 80), text:str(p.text, 220).replace(/\.$/, ''), head:str(p.head, 70), body:str(p.body, 240), theme:'', link:okLink(p.link)} : null).filter(p => p && p.text).slice(0, PAIN_MAX),
    practice: (Array.isArray(d.practice) ? d.practice : []).map(r => r && typeof r === 'object' ? {work:str(r.work, 40), tools:str(r.tools, 80), text:str(r.text, 240)} : null).filter(r => r && r.work && r.text).slice(0, 5),
    modApps: {},
    focus: (Array.isArray(d.focus) ? d.focus : []).map(Number).filter(n => n >= 1 && n <= ((ctx.c1.lessons || []).length || 0)).slice(0, 4)
  };
  Object.entries(d.modApps && typeof d.modApps === 'object' ? d.modApps : {}).slice(0, 6).forEach(([k, v]) => {
    const m = /^(?:m:)?(\w+):(\d+)$/.exec(k);
    if (m && taken.has(m[1]) && str(v, 220)) out.modApps[m[1] + ':' + m[2]] = str(v, 220);
  });
  return out;
}
function showDraft(d){
  const ctx = makeCtx(deckState());
  const where = l => { const m = /^m:(\w+):(\d+)$/.exec(l); if (m){ const c = C[m[1]]; return (c.lessons ? 'Lesson ' : 'Area ') + m[2] + (ctx.multi ? ' of ' + c.short : '') + ': ' + (c.lessons || c.areas)[+m[2] - 1][0]; } const k = /^c:(\w+)$/.exec(l); return k ? (ctx.courses.some(c => c.k === k[1]) ? 'The ' + C[k[1]].short + ' course' : 'Other courses: ' + C[k[1]].name) : 'The programme as a whole'; };
  const sec = (k, label, body) => '<div class="nr-sec"><label><input type="checkbox" data-apply="' + k + '" checked>' + esc(label) + '</label>' + body + '</div>';
  let h = '';
  if (d.pains.length) h += sec('pains', 'Points from the call (' + d.pains.length + ')', '<ul>' + d.pains.map(p => '<li>' + esc(p.text) + '<small>' + esc([p.team, p.tools].filter(Boolean).join(' · ') + (p.team || p.tools ? '  →  ' : '') + where(p.link)) + (p.head ? ' · ' + esc(p.head) : '') + '</small></li>').join('') + '</ul>');
  if (d.heard) h += sec('heard', 'Executive summary line', '<p>' + esc(d.heard) + '</p>');
  if (d.priority) h += sec('priority', 'Their priority', '<p>' + esc(d.priority) + '</p>');
  if (d.practice.length) h += sec('practice', 'Teams and tools (In practice slide)', '<ul>' + d.practice.map(r => '<li><b>' + esc(r.work) + '</b>' + (r.tools ? ' · ' + esc(r.tools) : '') + '<small>' + esc(r.text) + '</small></li>').join('') + '</ul>');
  const apps = Object.entries(d.modApps);
  if (apps.length) h += sec('modApps', 'Their example on lesson slides (' + apps.length + ')', '<ul>' + apps.map(([k, v]) => '<li>' + esc(where('m:' + k)) + '<small>' + esc(v) + '</small></li>').join('') + '</ul>');
  if (d.focus.length && !ctx.multi) h += sec('focus', 'Lessons with the most practice time', '<p>' + esc(rangeText(d.focus)) + ' of ' + esc(ctx.c1.short) + '</p>');
  $('notes-result').innerHTML = h || '<p class="note">Claude found nothing in these notes to add to the deck.</p>';
  $('notes-result').hidden = false;
  $('notes-apply-row').hidden = !h;
}
$('notes-run').addEventListener('click', async () => {
  const notes = $('notes-text').value.trim();
  if (notes.split(/\s+/).length < 8){ notesStatus('Paste a little more from the call first.', 'error'); $('notes-text').focus(); return; }
  if (!sampleNs){ notesStatus('Claude is not available on this page.', 'error'); return; }
  notesAbort = new AbortController();
  $('notes-run').disabled = true; $('notes-stop').hidden = false;
  $('notes-result').hidden = true; $('notes-apply-row').hidden = true;
  notesStatus('Claude is reading the notes…');
  try {
    const raw = await sampleNs.json(notesPrompt(notes), {signal: notesAbort.signal, modelTier:'default'});
    notesDraft = cleanDraft(raw);
    showDraft(notesDraft);
    notesStatus('Here is the draft. Untick anything you do not want, then apply it.', 'ok');
  } catch (e){
    const c = e && e.code;
    if (c === 'not_granted'){ sampleNs = null; $('notes-open').hidden = true; notesStatus('Claude was not allowed on this page, so drafting is switched off. You can still type the points yourself.', 'error'); }
    else if (c === 'rate_limited') notesStatus('Claude is busy. Wait a minute, then try again.', 'error');
    else if (e && e.name === 'AbortError') notesStatus('Stopped.');
    else notesStatus('The draft could not be made' + (e && e.message ? ': ' + e.message : '.'), 'error');
  } finally { $('notes-run').disabled = false; $('notes-stop').hidden = true; notesAbort = null; }
});
$('notes-stop').addEventListener('click', () => { if (notesAbort) notesAbort.abort(); });
$('notes-apply').addEventListener('click', () => {
  if (!notesDraft) return;
  const want = k => { const cb = document.querySelector('#notes-result input[data-apply="' + k + '"]'); return !!(cb && cb.checked); };
  const d = notesDraft;
  if (want('pains')) S.pains = d.pains.map(p => Object.assign(BLANK_PAIN(), p));
  if (want('heard')) S.heard = d.heard;
  if (want('priority')) S.priority = d.priority;
  if (want('practice')) S.practice = d.practice;
  if (want('modApps')) S.modApps = Object.assign({}, d.modApps);
  if (want('focus')) S.focus = Object.assign({notes:{}}, S.focus || {}, {mods:d.focus.slice()});
  S.draftedFrom = true;
  closeNotes();
  syncForm(); changed(false);
  status('Applied the draft from your notes. Check each point against what the client said before sending.', 'ok');
});

/* ---------- Drafts UI ---------- */
function newDraft(){ addDraft(BLANK()); closeMenus(); status('New blank draft started. Your other drafts are still in the Draft list.', 'ok'); setTab('edit'); $('client').focus(); }
$('draft-new').addEventListener('click', newDraft);
$('draft-dup').addEventListener('click', () => {
  const copy = normalise(JSON.parse(JSON.stringify(S)));
  copy.example = false;
  addDraft(copy, (store.drafts[store.current].name || 'Draft') + ' (copy)');
  status('Duplicated. Change the client details before sending this copy.', 'ok');
});
$('draft-sel').addEventListener('change', () => switchDraft($('draft-sel').value));
$('draft-example').addEventListener('click', () => { addDraft(EXAMPLE(), 'Example (demo)'); closeMenus(); });
$('draft-rename').addEventListener('click', () => {
  closeMenus();
  const d = store.drafts[store.current];
  const lab = document.querySelector('.drafts-pick');
  if (document.getElementById('rename-in')) return;
  const wrap = document.createElement('span');
  wrap.style.cssText = 'display:flex;gap:6px';
  wrap.innerHTML = '<input type="text" id="rename-in" aria-label="Draft name"><button type="button" class="btn btn-primary" id="rename-ok">Save</button>';
  lab.appendChild(wrap);
  $('draft-sel').hidden = true;
  const inp = $('rename-in'); inp.value = d.name; inp.focus(); inp.select();
  const done = save => {
    if (save && inp.value.trim()){ d.name = inp.value.trim(); d.custom = true; saveStore(); }
    wrap.remove(); $('draft-sel').hidden = false; renderDraftSelect();
  };
  $('rename-ok').addEventListener('click', () => done(true));
  inp.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); done(true); } else if (e.key === 'Escape') done(false); });
});
$('draft-export').addEventListener('click', async () => {
  closeMenus();
  const d = store.drafts[store.current];
  const data = {format:'vi-proposal-draft', version:7, from:XFER_TOOL, sid:d.sid || d.id, name:d.name, exported:new Date().toISOString(), state:S};
  const safe = String(d.name).replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Proposal';
  const res = await VI.deliver(new Blob([JSON.stringify(data, null, 1)], {type:'application/json'}), safe + '_draft.json');
  if (res !== 'saved'){ status(VI.deliverMsg(res), res === 'declined' ? '' : 'error'); return; }
  status('Exported ' + safe + '_draft.json. Import it on any computer to carry on.', 'ok');
});
$('draft-import').addEventListener('click', () => { closeMenus(); $('draft-file').value = ''; $('draft-file').click(); });
/* ---------- v7: drafts move between the Proposal Deck Creator and the Microsite Builder ----------
   The two tools are separate pages with separate browser storage, so a draft travels as text: copied here, pasted
   there. Each draft keeps one share id (sid) in both tools, so a draft that comes back updates its own copy. The text
   is the same as an exported .json draft. */
const XFER_TOOL = 'microsite';
const xferSid = d => d.sid || d.id;
function xferCode(){
  const d = store.drafts[store.current];
  if (!d.sid) d.sid = d.id;
  return JSON.stringify({format:'vi-proposal-draft', version:7, from:XFER_TOOL, sid:d.sid, name:d.name, custom:!!d.custom, exported:new Date().toISOString(), state:S});
}
function xferParse(text){
  text = String(text || '').trim();
  if (text.length < 20 || text[0] !== '{') return null;
  try {
    const data = JSON.parse(text);
    return data && data.format === 'vi-proposal-draft' && data.state && Array.isArray(data.state.courses) ? data : null;
  } catch (e) { return null; }
}
let xferData = null;
function openXfer(){
  closeMenus();
  $('xfer-name').textContent = store.drafts[store.current].name;
  $('xfer-out').hidden = true; $('xfer-out').value = '';
  $('xfer-in').value = ''; $('xfer-found').hidden = true; xferData = null;
  $('xfer-copy-status').textContent = ''; $('xfer-in-status').textContent = '';
  $('xfer-modal').hidden = false;
}
function closeXfer(){ $('xfer-modal').hidden = true; xferData = null; }
function xferShow(data){
  xferData = data;
  const st = data.state, box = $('xfer-found');
  const match = Object.values(store.drafts).find(d => data.sid && xferSid(d) === data.sid);
  const name = String(data.name || autoName(st));
  const courses = (st.courses || []).map(c => (C[c.k] || {}).short || c.k).join(', ');
  const from = data.from === 'microsite' ? 'Microsite Builder' : data.from === 'deck' ? 'Proposal Deck Creator' : 'an exported draft';
  const when = data.exported && !isNaN(Date.parse(data.exported)) ? new Date(data.exported).toLocaleString('en-SG', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) : '';
  box.innerHTML = '<p><b>' + esc(name) + '</b><br><small>' + esc([courses, 'from the ' + from, when ? 'copied ' + when : ''].filter(Boolean).join(' · ')) + '</small></p>' +
    '<div class="xfer-row">' + (match
      ? '<button type="button" class="btn btn-primary" data-x="update">Update “' + esc(match.name) + '”</button><button type="button" class="btn" data-x="new">Add as a new draft</button>'
      : '<button type="button" class="btn btn-primary" data-x="new">Add to my drafts</button>') + '</div>' +
    (match ? '<p><small>Updating replaces the copy saved here, last changed ' + esc(new Date(match.updated).toLocaleString('en-SG', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})) + '.</small></p>' : '');
  box.hidden = false;
  $('xfer-in-status').textContent = '';
  const first = box.querySelector('button'); if (first) first.focus();
}
function xferApply(how){
  const data = xferData; if (!data) return;
  const st = normalise(JSON.parse(JSON.stringify(data.state)));
  st.example = false;
  const match = how === 'update' ? Object.values(store.drafts).find(d => data.sid && xferSid(d) === data.sid) : null;
  let name;
  if (match){
    match.state = st; match.updated = Date.now();
    if (data.custom && data.name){ match.name = String(data.name); match.custom = true; }
    else if (!match.custom) match.name = autoName(st);
    name = match.name;
    if (store.current === match.id){ S = st; pviews = {}; saveStore(); syncForm(); render(); renderDraftSelect(); }
    else switchDraft(match.id);
  } else {
    const id = addDraft(st, data.custom && data.name ? String(data.name) : '');
    // a second copy of a draft already here gets an id of its own
    store.drafts[id].sid = how === 'new' && Object.values(store.drafts).some(d => d.id !== id && data.sid && xferSid(d) === data.sid) ? id : (data.sid || id);
    name = store.drafts[id].name;
    saveStore(); renderDraftSelect();
  }
  closeXfer();
  status((match ? 'Updated “' : 'Added “') + name + '” from the Proposal Deck Creator.', 'ok');
}
$('draft-xfer').addEventListener('click', openXfer);
$('draft-xfer2').addEventListener('click', openXfer);
$('xfer-close').addEventListener('click', closeXfer);
$('xfer-modal').addEventListener('click', e => { if (e.target === $('xfer-modal')) closeXfer(); });
$('xfer-copy').addEventListener('click', async () => {
  const code = xferCode(), out = $('xfer-out');
  saveStore();
  let ok = false;
  if (navigator.clipboard && navigator.clipboard.writeText){ try { await navigator.clipboard.writeText(code); ok = true; } catch (e) {} }
  out.value = code;
  if (!ok){ out.hidden = false; out.focus(); out.select(); try { ok = document.execCommand('copy'); } catch (e) {} }
  const st = $('xfer-copy-status');
  st.textContent = ok ? 'Copied “' + store.drafts[store.current].name + '”. Open the Proposal Deck Creator, choose Transfer, and paste.' : 'Select all the text above and copy it (Ctrl+C), then paste it in the Proposal Deck Creator under Transfer.';
  st.classList.toggle('is-ok', ok);
});
function xferRead(text){
  const data = xferParse(text);
  if (data){ xferShow(data); return true; }
  $('xfer-found').hidden = true; xferData = null;
  $('xfer-in-status').textContent = String(text || '').trim() ? 'That is not a draft copied from the Proposal Deck Creator. Use Transfer → Copy this draft there, then paste here.' : '';
  return false;
}
$('xfer-in').addEventListener('input', () => xferRead($('xfer-in').value));
$('xfer-found').addEventListener('click', e => { const b = e.target.closest('button[data-x]'); if (b) xferApply(b.dataset.x); });
/* Pasting a copied draft anywhere on the page (outside a text box) opens the same choice */
document.addEventListener('paste', e => {
  const t = e.target;
  if (t && t.closest && t.closest('input, textarea, select, [contenteditable]')) return;
  const data = xferParse(e.clipboardData ? e.clipboardData.getData('text') : '');
  if (!data) return;
  e.preventDefault();
  if ($('xfer-modal').hidden) openXfer();
  xferShow(data);
});

$('draft-file').addEventListener('change', async () => {
  const f = $('draft-file').files[0]; if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    const st = data && data.format === 'vi-proposal-draft' ? data.state : (data && data.courses ? data : null);
    if (!st) throw new Error('not a proposal draft');
    addDraft(normalise(st), (data.name || autoName(st)) + ' (imported)');
    status('Imported ' + f.name + ' as a new draft.', 'ok');
  } catch (e) { status('That file is not a proposal draft exported from this builder.', 'error'); }
});
let delArmed = 0;
$('draft-delete').addEventListener('click', () => {
  const b = $('draft-delete');
  if (Object.keys(store.drafts).length < 2) return;
  if (!delArmed){
    b.firstChild.textContent = 'Click again to delete “' + store.drafts[store.current].name + '”';
    delArmed = setTimeout(() => { delArmed = 0; b.firstChild.textContent = 'Delete this draft'; }, 4000);
    return;
  }
  clearTimeout(delArmed); delArmed = 0; b.firstChild.textContent = 'Delete this draft';
  const gone = store.drafts[store.current].name;
  delete store.drafts[store.current];
  const nextId = Object.values(store.drafts).sort((a, c) => c.updated - a.updated)[0].id;
  closeMenus(); switchDraft(nextId);
  status('Deleted “' + gone + '”.', 'ok');
});
function closeMenus(){ document.querySelectorAll('details.menu-btn[open]').forEach(d => d.removeAttribute('open')); }
document.addEventListener('click', e => { document.querySelectorAll('details.menu-btn[open]').forEach(d => { if (!d.contains(e.target)) d.removeAttribute('open'); }); });

/* ---------- Mobile tabs ---------- */
function setTab(tab){
  $('bench').setAttribute('data-tab', tab);
  document.querySelectorAll('#mtabs button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tab === tab)));
}
$('mtabs').addEventListener('click', e => { const b = e.target.closest('button[data-tab]'); if (!b) return; setTab(b.dataset.tab); window.scrollTo({top:0}); });

/* ---------- Exports ---------- */
let busy = false;
function status(msg, kind){
  const el = $('status');
  el.textContent = msg || '';
  el.classList.toggle('is-error', kind === 'error'); el.classList.toggle('is-ok', kind === 'ok');
}
function needClient(){
  if ((S.client || '').trim()) return true;
  status('Add the company name first.', 'error'); setTab('edit'); $('client').focus();
  return false;
}
async function doPdf(){
  if (busy) return;
  busy = true;
  status('Preparing the PDF…');
  try {
    const r = await VI.exportPdf(deckState(), (i, n) => status('Preparing the PDF… page ' + i + ' of ' + n));
    const res = await VI.deliver(r.blob, r.filename);
    if (res !== 'saved'){ status(VI.deliverMsg(res), res === 'declined' ? '' : 'error'); return; }
    status('Saved ' + r.filename + ' (' + (r.details ? r.main + ' slides and ' + r.details + ' detail pages after them' : r.pages + ' pages') + ', ' + fmtSize(r.blob.size) + '). Text stays selectable and the links work.', 'ok');
  } catch (e){ status('Could not build the PDF: ' + ((e && e.message) || 'unknown error'), 'error'); console.error(e); }
  finally { busy = false; }
}
async function doPptx(withViews){
  if (busy) return;
  busy = true;
  status('Preparing the PowerPoint…');
  try {
    const r = await VI.exportPptx(deckState(), withViews, (i, n) => status('Preparing the PowerPoint… slide ' + i + ' of ' + n));
    const res = await VI.deliver(r.blob, r.filename);
    if (res !== 'saved'){ status(VI.deliverMsg(res), res === 'declined' ? '' : 'error'); return; }
    status('Saved ' + r.filename + ' (' + fmtSize(r.blob.size) + ', ' + r.main + ' slides' + (r.details ? ', ' + r.details + ' hidden detail slides' : '') + (withViews && r.slides - r.main - (r.details || 0) > 0 ? ', ' + (r.slides - r.main - (r.details || 0)) + ' hidden calculator views' : '') + '). Slides are pictures, so edit the deck here rather than in PowerPoint.', 'ok');
  } catch (e){ status('Could not build the PowerPoint: ' + ((e && e.message) || 'unknown error'), 'error'); console.error(e); }
  finally { busy = false; }
}
$('dl-pdf').addEventListener('click', () => { if (needClient()) gate(doPdf); });
$('pptx-menu').addEventListener('toggle', () => {
  if (!$('pptx-menu').open) return;
  try {
    const a = buildDeck(deckState(), {mode:'static'}).slides.length, b = buildDeck(deckState(), {variants:true}).slides.length;
    $('pptx-size-0').textContent = a + ' picture slides, about ' + Math.max(1, Math.round(a * 0.3)) + ' MB';
    $('pptx-size-1').textContent = a + ' slides plus ' + (b - a) + ' hidden views, about ' + Math.max(1, Math.round(b * 0.3)) + ' MB';
  } catch (e) {}
});
document.querySelectorAll('[data-pptx]').forEach(b => b.addEventListener('click', () => { closeMenus(); if (needClient()) gate(() => doPptx(b.dataset.pptx === '1')); }));

/* Hosted web deck: the builder's own engine scripts plus the frozen proposal, so the file stays small */
function scriptText(id){ return document.getElementById(id).textContent; }
/* v6: a client's web deck carries only the lesson detail its chosen level shows, for the courses in the proposal */
function moduleDetailFor(state){
  const keep = DETAIL_FIELDS[['simple', 'detailed', 'technical'].includes(state.detailLevel) ? state.detailLevel : 'detailed'];
  const out = {};
  if (state.details === false) return out;
  (state.courses || []).forEach(c => {
    const k = c && c.k;
    if (!k || out[k] || !MODULE_DETAIL[k]) return;
    out[k] = MODULE_DETAIL[k].map(m => Object.fromEntries(keep.filter(f => m[f] != null).map(f => [f, m[f]])));
  });
  return out;
}
function buildHostedHtml(state, mode){
  const st = JSON.parse(JSON.stringify(state));
  delete st.example;
  st.detailLevel = 'simple';   // v6.1: web decks always show the Simple lesson detail, whatever the builder's level
  st.__host = {mode: mode === 'scroll' ? 'scroll' : 'player'};
  const ctx = makeCtx(state), meta = deckMeta(ctx);
  const json = JSON.stringify(st).replace(/</g, '\\u003c');
  return [
    '<!doctype html>', '<html lang="en">', '<head>', '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
    OSIRIS_HEAD,
    '<style>' + scriptText('vi-hosted-css') + '</style>', '</head>',
    '<body class="vi-host">',
    '<div class="app" id="app"><p class="boot">Loading the proposal…</p></div>',
    '<noscript><p style="padding:16px;font-family:sans-serif">This interactive proposal needs JavaScript. Please ask ' + esc(ctx.consultant.name) + ' (' + esc(ctx.consultant.email) + ') for the PDF version.</p></noscript>',
    ...['vi-fonts', 'vi-images', 'vi-content'].map(id => '<script>' + scriptText(id) + '<' + '/script>'),
    '<script>const CURRICULUM_CHECKED = ' + JSON.stringify(CURRICULUM_CHECKED) + '; const MODULE_DETAIL = ' + JSON.stringify(moduleDetailFor(st)).replace(/</g, '\\u003c') + '; const DETAIL_LEVELS = ' + JSON.stringify(DETAIL_LEVELS) + '; const DETAIL_FIELDS = ' + JSON.stringify(DETAIL_FIELDS) + ';<' + '/script>',
    ...['vi-engine', 'vi-templates', 'vi-runtime'].map(id => '<script>' + scriptText(id) + '<' + '/script>'),
    '<script type="application/json" id="vi-state">' + json + '<' + '/script>',
    '<script>' + scriptText('vi-hosted-app') + '<' + '/script>',
    '</body>', '</html>'
  ].join('\n');
}
let gsitesMode = 'player';
function gsStatus(msg, kind){ const el = $('gsites-status'); el.textContent = msg || ''; el.classList.toggle('is-error', kind === 'error'); el.classList.toggle('is-ok', kind === 'ok'); }
function refreshGoogleSitesModal(){
  syncGsWhat();
  const html = exportHtml();
  $('gsites-code').value = html;
  $('gsites-meta').textContent = exportMeta(html);
  if (!$('gs-prev-host').hidden && prevKind) showPreview(prevKind);
}
function openGoogleSitesModal(){
  refreshGoogleSitesModal();
  gsStatus('Ready to copy.');
  $('gsites-modal').hidden = false;
  $('gsites-copy').focus();
}
function closeGoogleSitesModal(){ $('gsites-modal').hidden = true; showPreview(null); }
async function copyGoogleSitesEmbed(){
  const ta = $('gsites-code');
  let ok = false;
  if (navigator.clipboard && navigator.clipboard.writeText){ try { await navigator.clipboard.writeText(ta.value); ok = true; } catch (e) {} }
  if (!ok){ try { ta.focus(); ta.select(); ok = document.execCommand('copy'); } catch (e) {} }
  if (ok){ gsStatus('Copied. In Google Sites, paste it into a Full page embed (Pages → + → Full page embed), or Insert → Embed → Embed code.', 'ok'); status('Embed code copied.', 'ok'); }
  else { ta.focus(); ta.select(); gsStatus('The code is selected: press Ctrl+C (or Cmd+C) to copy it.'); }
  return ok;
}
let prevKind = null;
function showPreview(kind){
  const host = $('gs-prev-host');
  prevKind = kind;
  document.querySelector('[data-prev="none"]').hidden = !kind;
  if (!kind){ host.hidden = true; host.innerHTML = ''; return; }
  const sizes = {box:[880, 495], small:[420, 300], phone:[390, 720]};
  const [w, h] = sizes[kind];
  host.hidden = false;
  const avail = Math.max(280, host.clientWidth - 26 || 860);
  const scale = Math.min(1, avail / w);
  host.innerHTML = '<div style="width:' + Math.round(w * scale) + 'px;height:' + Math.round(h * scale) + 'px;position:relative"><iframe title="Embed preview" width="' + w + '" height="' + h + '" style="transform:scale(' + scale + ');transform-origin:0 0;position:absolute;left:0;top:0" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-downloads allow-same-origin"></iframe></div>';
  host.querySelector('iframe').srcdoc = $('gsites-code').value;
}
document.querySelectorAll('[data-prev]').forEach(b => b.addEventListener('click', () => showPreview(b.dataset.prev === 'none' ? null : b.dataset.prev)));
function previewHostedWebDeck(){
  const html = buildSiteHtml(deckState(), 'player');
  try {
    const w = window.open('', '_blank');
    if (w && w.document){ w.document.open(); w.document.write(html); w.document.close(); status('Opened the microsite in a new tab. Resize the window to see how it adapts; its forms send for real there, so use the Forms & contact preview to try them.', 'ok'); return; }
  } catch (e) {}
  status('The browser blocked the new tab. Use the Calculator and Forms & contact previews here, or Google Sites / website → Preview here.', 'error');
}
$('dl-gsites').addEventListener('click', () => { if (needClient()) gate(openGoogleSitesModal); });
$('preview-web').addEventListener('click', () => { if (needClient()) previewHostedWebDeck(); });
$('gsites-close').addEventListener('click', closeGoogleSitesModal);
$('gsites-modal').addEventListener('click', e => { if (e.target === $('gsites-modal')) closeGoogleSitesModal(); });
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('gate-modal').hidden) closeGate();
  else if (!$('gsites-modal').hidden) closeGoogleSitesModal();
  else if (!$('notes-modal').hidden) closeNotes();
  else if (!$('xfer-modal').hidden) closeXfer();
  else if (!$('pp-modal').hidden) $('pp-modal').hidden = true;
  else closeMenus();
});
$('gsites-mode').addEventListener('click', e => {
  const b = e.target.closest('button[data-mode]'); if (!b) return;
  gsitesMode = b.dataset.mode;
  document.querySelectorAll('#gsites-mode button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  refreshGoogleSitesModal();
  gsStatus('Embed code updated: ' + (gsitesMode === 'player' ? 'slide player.' : 'scrolling page.'));
});
$('gsites-select').addEventListener('click', () => { $('gsites-code').focus(); $('gsites-code').select(); });
$('gsites-copy').addEventListener('click', () => { copyGoogleSitesEmbed(); });
$('gsites-copy-open').addEventListener('click', async () => { await copyGoogleSitesEmbed(); window.open('https://sites.google.com/new', '_blank', 'noopener,noreferrer'); });
$('gsites-dl-html').addEventListener('click', async () => {
  const meta = deckMeta(built.ctx);
  const fn = meta.base + GS_WORDS[gsWhat][1];
  const res = await VI.deliver(new Blob([$('gsites-code').value || exportHtml()], {type:'text/html;charset=utf-8'}), fn);
  if (res !== 'saved'){ gsStatus(VI.deliverMsg(res), res === 'declined' ? '' : 'error'); return; }
  gsStatus('Saved ' + fn + '. Upload it to any web host, or open it directly in a browser.', 'ok');
});

/* =====================================================================
   CLIENT MICROSITE (v1)
   One export holding the proposal deck, the Corporate Training Calculator, the confirm and enrol forms
   and a contact page. Everything is filled from the same draft: this section maps the draft to the
   calculator's setup, builds the microsite file, and runs the Calculator and Forms previews.
   ===================================================================== */
function SITE_DEFAULT(){ return {calc:true, scope:true, enrol:true, contact:true, coach:true}; }
function CALC_DEFAULT(){ return {eis:true, gst:true, reimb:true, save:true, start:true, pass:true, menu:'all'}; }
function normaliseSite(st){
  const s = Object.assign(SITE_DEFAULT(), st.site && typeof st.site === 'object' ? st.site : {});
  st.site = {calc: s.calc !== false, scope: s.scope !== false, enrol: s.enrol !== false, contact: s.contact !== false, coach: s.coach !== false};
  const c = Object.assign(CALC_DEFAULT(), st.calcOpts && typeof st.calcOpts === 'object' ? st.calcOpts : {});
  st.calcOpts = {eis: c.eis !== false, gst: c.gst !== false, reimb: c.reimb !== false, save: c.save !== false, start: c.start !== false, pass: c.pass !== false, menu: ['proposal', 'plus'].includes(c.menu) ? c.menu : 'all'};
  st.uen = String(st.uen || '');
}
/* Where forms go and how the contact buttons behave: one set per computer, like the consultant details */
const SITE_KEY = 'vi-microsite-v1';
let SITECFG = {hook:'', enrolUrl:'', wa:'', msg:true};
try { Object.assign(SITECFG, JSON.parse(localStorage.getItem(SITE_KEY) || '{}') || {}); } catch (e) {}
function saveSiteCfg(){ try { localStorage.setItem(SITE_KEY, JSON.stringify(SITECFG)); } catch (e) {} }
const cleanUrl = v => { const u = String(v || '').trim(); return /^https:\/\/[^\s"<>]+\.[^\s"<>]+$/i.test(u) ? u : ''; };

/* Phone numbers as typed ("6460 2024 / 9726 5192") to dialable ones; Singapore mobiles start with 8 or 9 */
function telList(raw){
  return String(raw || '').split(/[\/,;]/).map(s => s.trim()).filter(Boolean).map(t => {
    let d = t.replace(/[^\d]/g, '');
    if (d.length === 8) d = '65' + d;
    if (!/^\d{9,15}$/.test(d)) return null;
    const local = d.length === 10 && d.slice(0, 2) === '65' ? d.slice(2) : '';
    return {text: t, e164: '+' + d, wa: d, mobile: local ? /^[89]/.test(local) : true};
  }).filter(Boolean);
}
function siteConsultant(){
  const tels = telList(ME.phones), own = telList(SITECFG.wa)[0];
  const wa = own || tels.find(t => t.mobile) || tels[0] || null;
  const name = String(ME.name || '').trim();
  return {name, first: name.split(/\s+/)[0] || '', title: String(ME.title || '').trim(), org: String(ME.org || '').trim(), email: String(ME.email || '').trim(),
    web: String(ME.web || '').trim().replace(/^https?:\/\//, ''), tels: tels.map(t => ({text: t.text, e164: t.e164, mobile: t.mobile})), wa: wa ? wa.wa : ''};
}

/* ---------- Draft → calculator setup ----------
   The calculator models the redesigned SFEC only, so it is left out of a draft that uses the current SFEC.
   Deck course keys match the calculator's except Generative AI Level 2. */
const CALC_KEY = {gaicc: 'content'};
const calcKey = k => CALC_KEY[k] || k;
const calcOn = st => !!(st.site && st.site.calc !== false) && st.sfecMode !== 'legacy';
const hashId = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36); };
const bal2 = d => (Math.round(d * 100) / 100).toLocaleString('en-SG', {minimumFractionDigits: 2, maximumFractionDigits: 2});
function calcConfig(state, bridge){
  const ctx = makeCtx(state), o = state.calcOpts || CALC_DEFAULT(), con = siteConsultant();
  const tier = state.tier === '70' ? 70 : 50;
  const elig = state.sfec === 'none' ? 'no' : state.sfec === 'known' ? 'yes' : 'tbc';
  const time = ctx.weekday ? 'day' : 'eve';
  let anyPass = false;
  const lineOf = c => {
    const m = baseMakeup(ctx, c, null);
    if (m.npass) anyPass = true;
    const q = tier === 70 ? {scpr: m.n50 + m.n70, sc40: 0, pass: m.npass} : {scpr: m.n50, sc40: m.n70, pass: m.npass};
    return {course: calcKey(c.k), type: c.priv ? 'private' : 'public', time, q: {scpr: q.scpr ? String(q.scpr) : '', sc40: q.sc40 ? String(q.sc40) : '', pass: q.pass ? String(q.pass) : ''}};
  };
  const entities = ctx.multiUen
    ? ctx.uens.map(u => ({id: u.id, name: u.name, uen: u.uen.replace(/\s+/g, '').toUpperCase(), balance: bal2(u.balDollars), tier, elig, lines: coursesForUen(ctx, u).map(lineOf)}))
    : [{id: 'e1', name: '', uen: String(state.uen || '').replace(/\s+/g, '').toUpperCase(), balance: bal2(freshBal(state.sfecBalNew)), tier, elig, lines: ctx.courses.map(lineOf)}];
  if (!o.start) entities.forEach(e => { e.lines = []; });
  /* calcPreset (set per draft, no form control yet): the lines the calculator opens with, in place of the proposal's own */
  if (o.start && !ctx.multiUen && Array.isArray(state.calcPreset)) entities[0].lines = state.calcPreset.filter(l => l && C[l.k]).map(l => ({course: calcKey(l.k), type: l.type === 'public' ? 'public' : 'private', time, q: {scpr: l.scpr ? String(l.scpr) : '', sc40: l.sc40 ? String(l.sc40) : '', pass: l.pass ? String(l.pass) : ''}}));
  const catalog = {};
  ctx.courses.forEach(c => { if (c.feeOverride || c.hrsOverride) catalog[calcKey(c.k)] = {fee: c.fee, hrs: c.hrs, ap: c.ap}; });
  const inProposal = ctx.courses.map(c => calcKey(c.k));
  // "Proposed + a few others": the proposal's courses and the ones on the Other courses slide
  const menu = o.menu === 'all' ? null : inProposal.concat(o.menu === 'plus' ? pickOthers(ctx).map(calcKey) : []);
  return {
    v: 1, id: 'ms' + hashId((state.client || 'client').trim().toLowerCase() + '|' + entities.map(e => e.uen || e.id).join(',')), created: todayISO(),
    client: (state.client || '').trim(), sfecRate: ctx.sfecRate, entities,
    courses: COURSES.map(c => calcKey(c.k)).filter(k => !menu || menu.includes(k)),
    residencies: ['sc40'].concat(o.pass || anyPass ? ['pass'] : []),
    showEIS: o.eis, showGST: o.gst, showReimb: o.reimb, showSave: o.save,
    contact: {first: con.first, name: con.name, title: [con.title, con.org].filter(Boolean).join(', '), phone: (con.tels.find(t => t.mobile) || con.tels[0] || {e164: ''}).e164.replace(/^\+65(\d{4})(\d{4})$/, '+65 $1 $2'), email: con.email},
    catalog, baseline: !!o.start, bridge: !!bridge
  };
}
/* The proposal's plan in the shape the calculator reports its own: what the confirm and enrol forms show until the
   client changes something, and all they show when the calculator tab is off. Amounts in cents. */
function siteBaseline(ctx){
  const tier70 = ctx.S.tier === '70';
  const mixWords = (m, exact) => {
    if (!exact) { const n = m.n50 + m.n70 + m.npass; return n + ' ' + (n === 1 ? 'participant' : 'participants') + ', ' + (tier70 ? 70 : 50) + '% funding assumed'; }
    const parts = [];
    if (tier70) { const n = m.n50 + m.n70; if (n) parts.push(n + ' ' + (n === 1 ? 'Citizen or PR' : 'Citizens & PRs') + ' (70%)'); }
    else {
      if (m.n50) parts.push(m.n50 + ' ' + (m.n50 === 1 ? 'Citizen below 40 or PR' : 'Citizens below 40 & PRs') + ' (50%)');
      if (m.n70) parts.push(m.n70 + ' ' + (m.n70 === 1 ? 'Citizen 40+' : 'Citizens 40+') + ' (70%)');
    }
    if (m.npass) parts.push(m.npass + ' ' + (m.npass === 1 ? 'pass holder' : 'pass holders') + ' (no funding)');
    return parts.join(', ');
  };
  const ents = ctx.multiUen ? ctx.uens : [null];
  return {entities: ents.map(u => {
    const p = planFor(ctx, {uenObj: u, all:true});
    return {
      id: u ? u.id : 'e1', name: u ? u.name : '', uen: (u ? u.uen : String(ctx.S.uen || '')).replace(/\s+/g, '').toUpperCase(), label: u ? u.label : ctx.clientFull,
      tier: tier70 ? 70 : 50, sfecOn: !!ctx.sfecOn, balance: ctx.sfecOn && p.bal != null ? p.bal : null,
      lines: p.lines.map(l => ({k: calcKey(l.c.k), name: l.c.name, priv: l.c.priv, time: ctx.weekday ? 'day' : 'eve', qty: l.qty,
        mixText: mixWords(l.mk, !!ctx.exactMakeup), runText: (l.c.priv ? 'Private run' : 'Public run') + ', ' + (ctx.weekday ? 'weekday daytime' : 'evenings or weekends'), up: l.up, sfec: l.sfecUsed})),
      totals: {qty: p.qty, up: p.up, sfec: p.sfecUsed, left: p.left}
    };
  })};
}
/* A second calculator tab for training under the current SFEC (claimed back, until 30 Nov 2026). Set per draft as
   legacyCalc: {bal:'9,000', rows:[{k:'people', scpr:0, sc40:0, pass:4, note:'...'}]}; there is no form control for it yet. */
function legacyTab(state){
  const L = state.legacyCalc;
  if (!L || typeof L !== 'object' || !Array.isArray(L.rows)) return null;
  const cnt = v => Math.max(0, parseInt(v, 10) || 0);
  const rows = L.rows.map(r => { const c = r && C[r.k]; return c ? {k: r.k, name: c.name, fee: c.fee, train: c.train || c.hrs, note: String(r.note || ''), scpr: cnt(r.scpr), sc40: cnt(r.sc40), pass: cnt(r.pass)} : null; }).filter(Boolean);
  return rows.length ? {balance: num(L.bal != null ? L.bal : state.sfecBal), tier: state.tier === '70' ? 70 : 50, rate: 0.9, gst: 0.09, ap: 4.5, rows} : null;
}
function siteConfig(state, ctx, meta, opts){
  const s = state.site || SITE_DEFAULT(), only = opts.only === 'survey';
  const seen = new Set(), sched = {};
  const courses = ctx.courses.filter(c => !seen.has(c.k) && seen.add(c.k)).map(c => ({k: calcKey(c.k), name: c.name}));
  ctx.courses.forEach(c => { const d = parseISO(c.date); if (d && !sched[calcKey(c.k)]) sched[calcKey(c.k)] = SHORT_MONTHS[d.getMonth()]; });
  return {
    v: 1, id: 'vs' + hashId((state.client || 'client').trim().toLowerCase() + '|' + meta.base), created: todayISO(),
    client: ctx.clientFull === 'Your Company' ? '' : ctx.clientFull, contactName: (state.contact || '').trim(), title: meta.title, base: meta.base,
    decisionText: parseISO(state.decision) ? fmtLong(state.decision) : '', schedule: ctx.weekday ? 'weekday' : 'weekend', sfecMode: state.sfecMode === 'legacy' ? 'legacy' : 'enhanced',
    consultant: siteConsultant(),
    tabs: only ? {deck: false, calc: false, scope: true, enrol: false, contact: false} : {deck: opts.deck !== false, calc0: !!legacyTab(state), calc: calcOn(state), scope: s.scope !== false, enrol: s.enrol !== false, contact: s.contact !== false}, legacy: only ? null : legacyTab(state),
    survey: {courses}, sched, coach: !only && s.coach !== false, only: only ? 'survey' : '',
    hook: cleanUrl(SITECFG.hook), enrolUrl: cleanUrl(SITECFG.enrolUrl), msg: SITECFG.msg !== false,
    baseline: siteBaseline(ctx), lite: !!opts.lite || only, preview: !!opts.preview, start: only ? 'scope' : (opts.start || 'deck')
  };
}

/* ---------- Files ---------- */
const jsonForScript = o => JSON.stringify(o).replace(/</g, '\\u003c');
let fontCssCache = '';
function latoFontCss(){
  if (!fontCssCache) fontCssCache = [['B',400,'normal','Lato'],['BB',700,'normal','Lato'],['BI',400,'italic','Lato'],['BBI',700,'italic','Lato'],['HB',900,'normal','Merriweather']]
    .map(([k, w, s, f]) => "@font-face{font-family:'" + f + "';src:url(data:font/ttf;base64," + FONT_FILES[k] + ") format('truetype');font-weight:" + w + ';font-style:' + s + ';font-display:swap}').join('\n');
  return fontCssCache;
}
/* The calculator by itself: the same page the microsite puts in its Calculator tab */
/* The Nov 2026 calculator tab: the calculator's setup again, on the current SFEC (scheme 'legacy'), opening on the draft's legacyCalc rows */
function calcConfigLegacy(state){
  const L = legacyTab(state);
  if (!L) return null;
  const cfg = calcConfig(state, false);
  const ent = Object.assign({}, cfg.entities[0], {id: 'e1', balance: bal2(L.balance), elig: 'yes',
    lines: L.rows.map(r => ({course: calcKey(r.k), type: 'public', time: 'day', q: {scpr: r.scpr ? String(r.scpr) : '', sc40: r.sc40 ? String(r.sc40) : '', pass: r.pass ? String(r.pass) : ''}}))});
  return Object.assign({}, cfg, {id: cfg.id + 'nov', scheme: 'legacy', entities: [ent], courses: L.rows.map(r => calcKey(r.k)), residencies: ['sc40', 'pass'], showEIS: false, baseline: true, bridge: false});
}
function buildCalcOnlyHtml(state){
  const cfg = calcConfig(state, false), close = '<' + '/script>';
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    + OSIRIS_HEAD + '\n'
    + '<script>(function(){var d=document.documentElement;try{if(window.self===window.top)return;}catch(e){}d.setAttribute("data-theme","light");d.classList.add("is-embedded");})();' + close + '\n'
    + '<style id="vi-font-css">' + latoFontCss() + '</style>\n'
    + '<style id="app-css">' + scriptText('vi-calc-css') + '</style>\n</head>\n<body>\n'
    + '<div class="wrap is-client" id="wrap"><div class="app" id="app-root"></div></div>\n'
    + '<template id="app-shell">' + scriptText('vi-calc-shell') + '</template>\n'
    + '<script>window.CTC_CONFIG = ' + jsonForScript(cfg) + ';' + close + '\n'
    + '<script id="app-js">' + scriptText('vi-calc-app') + close + '\n</body>\n</html>\n';
}
/* The microsite: a small shell page that carries the deck's and the calculator's parts once each and builds their
   frames when it opens. opts.lite leaves the deck out (the builder's quick preview). */
function buildSiteHtml(state, mode, opts){
  opts = opts || {};
  const st = JSON.parse(JSON.stringify(state));
  delete st.example;
  st.detailLevel = 'simple';
  st.__host = {mode: mode === 'scroll' ? 'scroll' : 'player'};
  const ctx = makeCtx(state), meta = deckMeta(ctx);
  const cfg = siteConfig(state, ctx, meta, opts);
  if (cfg.only) opts = Object.assign({}, opts, {lite: true});
  const close = '<' + '/script>';
  const plain = (id, text) => '<script type="text/plain" id="' + id + '">' + text + close;
  const out = [
    '<!doctype html>', '<html lang="en">', '<head>', '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
    OSIRIS_HEAD,
    '<style id="site-css">' + scriptText('vi-site-css') + '</style>', '</head>', '<body>',
    '<div class="site" id="site"><p class="site-boot">Loading…</p></div>',
    '<noscript><p style="padding:16px;font-family:sans-serif">This page needs JavaScript. Please ask ' + esc(ctx.consultant.name) + ' (' + esc(ctx.consultant.email) + ') for the PDF version.</p></noscript>',
    '<script id="vi-fonts">' + scriptText('vi-fonts') + close,
    '<script id="vi-images">' + (opts.lite ? 'const IMG = ' + jsonForScript({icon: IMG.icon}) + ';' : scriptText('vi-images')) + close
  ];
  if (cfg.tabs.deck && !opts.lite) out.push(
    plain('d-content', scriptText('vi-content')),
    plain('d-consts', 'const CURRICULUM_CHECKED = ' + JSON.stringify(CURRICULUM_CHECKED) + '; const MODULE_DETAIL = ' + jsonForScript(moduleDetailFor(st)) + '; const DETAIL_LEVELS = ' + JSON.stringify(DETAIL_LEVELS) + '; const DETAIL_FIELDS = ' + JSON.stringify(DETAIL_FIELDS) + ';'),
    plain('d-engine', scriptText('vi-engine')), plain('d-templates', scriptText('vi-templates')), plain('d-runtime', scriptText('vi-runtime')),
    plain('d-hosted-css', scriptText('vi-hosted-css')), plain('d-hosted-app', scriptText('vi-hosted-app')),
    '<script type="application/json" id="d-state">' + jsonForScript(st) + close);
  if (cfg.tabs.calc0 && cfg.tabs.calc) out.push('<script type="application/json" id="c0-cfg">' + jsonForScript(calcConfigLegacy(state)) + close);
  if (cfg.tabs.calc) out.push(
    plain('c-css', scriptText('vi-calc-css')), plain('c-shell', scriptText('vi-calc-shell')), plain('c-app', scriptText('vi-calc-app')),
    '<script type="application/json" id="c-cfg">' + jsonForScript(calcConfig(state, true)) + close);
  if (cfg.tabs.enrol) out.push('<script id="vi-xlsx">' + scriptText('vi-xlsx') + close);
  out.push('<script type="application/json" id="site-cfg">' + jsonForScript(cfg) + close, '<script>' + scriptText('vi-site-app') + close, '</body>', '</html>');
  return out.join('\n');
}

/* ---------- Settings in the brief ---------- */
const SITE_CHECKS = [['st-calc','calc'],['st-scope','scope'],['st-enrol','enrol'],['st-contact','contact'],['st-coach','coach']];
const CALC_CHECKS = [['co-start','start'],['co-pass','pass'],['co-reimb','reimb'],['co-eis','eis'],['co-gst','gst'],['co-save','save']];
function syncSiteForm(){
  normaliseSite(S);
  SITE_CHECKS.forEach(([id, k]) => { $(id).checked = !!S.site[k]; });
  CALC_CHECKS.forEach(([id, k]) => { $(id).checked = !!S.calcOpts[k]; });
  document.querySelectorAll('#co-menu button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === S.calcOpts.menu)));
  if (document.activeElement !== $('uen')) $('uen').value = S.uen || '';
  if (document.activeElement !== $('hook-url')) $('hook-url').value = SITECFG.hook || '';
  if (document.activeElement !== $('enrol-url')) $('enrol-url').value = SITECFG.enrolUrl || '';
  if (document.activeElement !== $('wa-num')) $('wa-num').value = SITECFG.wa || '';
  $('wa-msg').checked = SITECFG.msg !== false;
  renderSiteSide();
}
function renderSiteSide(){
  const legacy = S.sfecMode === 'legacy', con = siteConsultant();
  $('uen-wrap').hidden = !!S.multiUen && S.sfec !== 'none';
  $('st-calc').disabled = legacy;
  $('st-calc-note').textContent = legacy
    ? 'Left out of this draft: the calculator models the redesigned SFEC (from 1 Dec 2026) and this proposal uses the current SFEC'
    : 'Opens on this proposal’s courses, headcount, funding and SFEC balance. Its options are under Funding & SFEC';
  $('calc-bind-note').textContent = legacy
    ? 'The calculator models the redesigned SFEC only, so it is left out while this draft uses the current SFEC.'
    : 'Filled from this draft: client, courses, headcount, funding tier, ' + (S.multiUen && S.sfec !== 'none' ? 'each entity’s UEN and SFEC balance' : 'UEN and SFEC balance') + ', the SFEC rate under Assumptions and your contact details.';
  const hook = String(SITECFG.hook || '').trim(), note = $('hook-note');
  note.textContent = !hook ? 'Without a link, the survey hands each participant a filled-in email or WhatsApp message to send you instead.'
    : !cleanUrl(hook) ? 'This does not look like a web address starting with https://, so it will be left out.'
    : /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/i.test(hook) ? 'Survey responses post straight into your Google Sheet. Submit one test from the published site to check a row arrives.'
    : 'Survey responses will post to this address as JSON text. For a Google Sheet it should end in /exec.';
  // Calculator course menu: say which courses "a few others" adds
  const mctx = makeCtx(deckState()), others = pickOthers(mctx).map(k => C[k].short);
  $('co-menu-note').textContent = S.calcOpts.menu === 'all' ? 'The client can add any of the ' + COURSES.length + ' courses.'
    : S.calcOpts.menu === 'proposal' ? 'Only the ' + (mctx.courses.length === 1 ? 'course' : mctx.courses.length + ' courses') + ' in this proposal.'
    : 'This proposal’s courses, plus the ones on the Other courses slide: ' + joinList(others) + '. Change them under Slides in this deck → Choose the six yourself.';
  // The scoping survey lists this proposal's courses
  $('st-scope-note').textContent = 'One response per participant: department, tasks, tools and frustrations. Its course question lists ' + joinList(siteConfig(deckState(), mctx, deckMeta(mctx), {}).survey.courses.map(c => c.name)) + '.';
  // Enrolment Excel: one file per sponsoring entity
  const base = siteBaseline(mctx).entities.filter(e => e.lines.length), sel = $('xlsx-ent');
  sel.hidden = base.length < 2;
  const cur = sel.value;
  sel.innerHTML = base.map(e => '<option value="' + esc(e.id) + '">' + esc(e.name || e.label) + '</option>').join('');
  if (base.some(e => e.id === cur)) sel.value = cur;
  $('dl-xlsx').disabled = !base.length;
  $('wa-num').placeholder = con.wa ? 'Using +' + con.wa : 'e.g. 9726 5192';
  $('wa-msg-note').textContent = 'e.g. “Hi ' + (con.first || 'there') + ', ' + ((S.contact || '').trim() ? 'this is ' + S.contact.trim() + (S.client ? ' from ' + S.client.trim() : '') : 'I’m writing from ' + ((S.client || '').trim() || 'the client')) + '…” The client can edit it before sending';
}
SITE_CHECKS.forEach(([id, k]) => $(id).addEventListener('change', () => { S.site[k] = $(id).checked; changed(false); }));
CALC_CHECKS.forEach(([id, k]) => $(id).addEventListener('change', () => { S.calcOpts[k] = $(id).checked; changed(false); }));
$('co-menu').addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (!b) return; S.calcOpts.menu = b.dataset.v; document.querySelectorAll('#co-menu button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); changed(false); });
$('uen').addEventListener('input', () => { S.uen = $('uen').value; changed(false); });
[['hook-url','hook'],['enrol-url','enrolUrl'],['wa-num','wa']].forEach(([id, k]) => $(id).addEventListener('input', () => { SITECFG[k] = $(id).value.trim(); saveSiteCfg(); renderSiteSide(); schedule(); }));
$('wa-msg').addEventListener('change', () => { SITECFG.msg = $('wa-msg').checked; saveSiteCfg(); schedule(); });

/* Checklist lines for the microsite: reminders only, they never block an export */
function siteIssues(){
  const out = [], hook = String(SITECFG.hook || '').trim(), forms = S.site.scope, con = siteConsultant();
  if (forms && !hook) out.push({level:'info', id:'site-hook', msg:'The team scoping survey has no Google Sheet link, so participants send their answers to you by email or WhatsApp.', fix:{label:'Add the link', act:'focus:hook-url'}});
  if (forms && hook && !cleanUrl(hook)) out.push({level:'warn', id:'site-hook-bad', msg:'The Google Sheet link for the team scoping survey is not a web address starting with https://.', fix:{label:'Fix the link', act:'focus:hook-url'}});
  if (S.site.calc && S.sfecMode === 'legacy') out.push({level:'info', id:'site-calc-legacy', msg:'The microsite leaves out the Calculator tab: it models the redesigned SFEC, and this draft uses the current SFEC.'});
  if ((S.site.contact || forms) && !con.wa) out.push({level:'info', id:'site-wa', msg:'No phone number found for the microsite’s WhatsApp button. Add one under Your details.'});
  return out;
}

/* ---------- Google Sheet set-up dialog ---------- */
function hookStatus(msg, kind){ const el = $('hook-status'); el.textContent = msg || ''; el.classList.toggle('is-ok', kind === 'ok'); el.classList.toggle('is-error', kind === 'error'); }
function openHook(){ $('hook-code').value = scriptText('vi-apps-script').replace(/^\n+/, ''); hookStatus(''); $('hook-modal').hidden = false; $('hook-copy').focus(); }
function closeHook(){ $('hook-modal').hidden = true; }
$('hook-help').addEventListener('click', openHook);
$('hook-close').addEventListener('click', closeHook);
$('hook-done').addEventListener('click', () => { closeHook(); $('hook-url').focus(); });
$('hook-modal').addEventListener('click', e => { if (e.target === $('hook-modal')) closeHook(); });
$('hook-copy').addEventListener('click', async () => {
  const ta = $('hook-code'); let ok = false;
  if (navigator.clipboard && navigator.clipboard.writeText){ try { await navigator.clipboard.writeText(ta.value); ok = true; } catch (e) {} }
  if (!ok){ try { ta.focus(); ta.select(); ok = document.execCommand('copy'); } catch (e) {} }
  if (ok) hookStatus('Copied. Paste it into Apps Script, replacing what is there.', 'ok'); else { ta.focus(); ta.select(); hookStatus('The script is selected: press Ctrl+C (or Cmd+C) to copy it.'); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('hook-modal').hidden) closeHook(); });

/* ---------- Preview: slides, the calculator, or the forms and contact pages ---------- */
let view = 'slides', siteStale = true, siteT = 0, siteTab = 'calc', sitePainted = false, prevSize = 'desk';
const formTabs = () => ['scope', 'enrol', 'contact'].filter(k => S.site[k]);
function siteOffNote(v){
  if (v === 'calc') return calcOn(S) ? '' : (S.sfecMode === 'legacy'
    ? 'The Calculator tab is left out of this draft. It models the redesigned SFEC (from 1 Dec 2026), and this proposal uses the current SFEC. Switch the scheme under Funding & SFEC if the training starts from 1 Dec 2026.'
    : 'The Calculator tab is switched off. Tick Interactive calculator under Client microsite to include it.');
  return formTabs().length ? '' : 'Team scoping, Enrol and Contact are all switched off. Tick at least one under Client microsite to preview it.';
}
function paintSite(){
  clearTimeout(siteT);
  const off = siteOffNote(view);
  $('site-prev-off').hidden = !off; $('site-prev-off').textContent = off;
  $('site-prev-host').hidden = !!off;
  if (off) return;
  const tabs = formTabs();
  let tab = view === 'calc' ? 'calc' : (tabs.includes(siteTab) ? siteTab : tabs[0]);
  siteTab = tab;
  const f = $('site-frame');
  if (!siteStale && sitePainted){ try { f.contentWindow.postMessage({viSite: 1, type: 'goto', tab}, '*'); } catch (e) {} return; }
  try { f.srcdoc = buildSiteHtml(deckState(), 'player', {lite: true, preview: true, start: tab}); siteStale = false; sitePainted = true; }
  catch (e){ $('site-prev-off').hidden = false; $('site-prev-off').textContent = 'The preview could not be built: ' + e.message; $('site-prev-host').hidden = true; console.error(e); }
}
function siteDirty(){
  siteStale = true;
  if (view === 'slides') return;
  clearTimeout(siteT); siteT = setTimeout(paintSite, 450);
}
function setView(v){
  if (!['slides', 'calc', 'forms'].includes(v)) v = 'slides';
  if (v === view && v === 'slides') return;
  view = v;
  document.querySelectorAll('#view-seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
  $('view-slides').hidden = v !== 'slides';
  $('view-site').hidden = v === 'slides';
  if (v !== 'slides') paintSite();
}
$('view-seg').addEventListener('click', e => { const b = e.target.closest('button[data-view]'); if (!b) return; setTab('preview'); setView(b.dataset.view); });
document.querySelectorAll('[data-psize]').forEach(b => b.addEventListener('click', () => {
  prevSize = b.dataset.psize;
  document.querySelectorAll('[data-psize]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  $('site-prev-host').classList.toggle('is-phone', prevSize === 'phone');
}));
/* The preview says which of its tabs is showing, so a rebuild comes back to the same one */
window.addEventListener('message', e => {
  const m = e.data, f = $('site-frame');
  if (!m || m.viSite !== 1 || m.type !== 'tab' || !f || e.source !== f.contentWindow) return;
  if (m.tab === 'calc' || formTabs().includes(m.tab)){
    if (m.tab !== 'calc') siteTab = m.tab;
    const v = m.tab === 'calc' ? 'calc' : 'forms';
    if (v !== view && view !== 'slides'){ view = v; document.querySelectorAll('#view-seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v))); }
  }
});

/* ---------- Export dialog: the whole microsite, or one part ---------- */
let gsWhat = 'site';
const GS_WORDS = {site:['Client microsite','_Microsite.html'], deck:['Proposal deck only','_Web_Deck.html'], calc:['Calculator only','_Calculator.html'], survey:['Team scoping survey only','_Team_Survey.html']};
function exportHtml(){
  return gsWhat === 'deck' ? buildHostedHtml(deckState(), gsitesMode) : gsWhat === 'calc' ? buildCalcOnlyHtml(deckState())
    : gsWhat === 'survey' ? buildSiteHtml(deckState(), gsitesMode, {only:'survey'}) : buildSiteHtml(deckState(), gsitesMode);
}
function exportMeta(html){
  const size = fmtSize(new Blob([html]).size);
  if (gsWhat === 'calc') return 'Calculator only · ' + size + ' · opens on this proposal’s courses and SFEC balance';
  if (gsWhat === 'survey') return 'Team scoping survey only · ' + size + ' · no proposal, fees or calculator on the page';
  const deckPart = (gsitesMode === 'player' ? 'slide player' : 'scrolling page') + ', ' + built.main + ' slides';
  if (gsWhat === 'deck') return 'Proposal deck only · ' + deckPart + ' · ' + size;
  const tabs = ['Proposal deck'].concat(calcOn(S) ? ['Calculator'] : [], S.site.scope ? ['Team scoping'] : [], S.site.enrol ? ['Enrol'] : [], S.site.contact ? ['Contact'] : []);
  return 'Microsite · ' + tabs.join(', ') + ' · deck as ' + deckPart + ' · ' + size;
}
function syncGsWhat(){
  if ((gsWhat === 'calc' && !calcOn(S)) || (gsWhat === 'survey' && !S.site.scope)) gsWhat = 'site';
  document.querySelectorAll('#gsites-what button').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.what === gsWhat)); if (b.dataset.what === 'calc') b.disabled = !calcOn(S); if (b.dataset.what === 'survey') b.disabled = !S.site.scope; });
  $('gsites-mode-wrap').hidden = gsWhat === 'calc' || gsWhat === 'survey';
  $('gsites-what-note').textContent = gsWhat === 'site'
    ? 'One embed with a tab bar: the client moves between the proposal' + (calcOn(S) ? ', the calculator' : '') + ' and the pages ticked under Client microsite. Changes they make in the calculator carry into the Enrol tab and its Excel file.'
    : gsWhat === 'deck' ? 'The interactive deck by itself, exactly as before.' : gsWhat === 'calc' ? 'The calculator by itself, for a page of its own.'
    : 'Only the pre-training survey, for a page you share with the participants: they never see the proposal, the fees or the calculator.';
}
$('gsites-what').addEventListener('click', e => {
  const b = e.target.closest('button[data-what]'); if (!b || b.disabled) return;
  gsWhat = b.dataset.what; refreshGoogleSitesModal();
  gsStatus('Embed code updated: ' + GS_WORDS[gsWhat][0].toLowerCase() + '.');
});

/* ---------- The enrolment Excel, for you to send yourself: the same file the client downloads from the Enrol tab ---------- */
$('dl-xlsx').addEventListener('click', async () => {
  const ctx = makeCtx(deckState()), cfg = siteConfig(deckState(), ctx, deckMeta(ctx), {});
  const ents = cfg.baseline.entities.filter(e => e.lines.length), e = ents.find(x => x.id === $('xlsx-ent').value) || ents[0];
  if (!e) return;
  const rows = [].concat(...e.lines.map(l => Array.from({length: l.qty}, () => ({course: VIX.courseName(l.k), schedule: cfg.sched[l.k] ? cfg.sched[l.k] + ' ' + (l.time === 'eve' ? 'weekend' : 'weekday') : ''}))));
  const name = 'Company_Sponsored_Learners_' + String((ents.length > 1 && (e.name || e.label)) || cfg.client || 'Participants').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') + '.xlsx';
  const res = await VI.deliver(new Blob([VIX.build(rows)], {type: VIX.MIME}), name);
  if (res !== 'saved'){ status(VI.deliverMsg(res), res === 'declined' ? '' : 'error'); return; }
  status('Saved ' + name + ' with ' + Math.min(rows.length, VIX.MAX) + ' rows ready, one per planned participant.', 'ok');
});

/* ---------- Start ---------- */
$('foot').textContent = 'Fees and hours as listed on verticalinstitute.com on ' + VERIFIED + '. SFEC rules checked ' + SFEC_RULES_CHECKED + '. Drafts are saved in this browser only: use More → Export draft to keep a copy or move to another computer, and Transfer to move one to the Proposal Deck Creator.';
renderDraftSelect();
syncForm();
render();
/* Read-only access for automated checks of this builder (no effect on the page) */
window.__proposalBuilder = {state: () => JSON.parse(JSON.stringify(deckState())), hosted: mode => buildHostedHtml(deckState(), mode),
  site: (mode, opts) => buildSiteHtml(deckState(), mode, opts), calc: () => buildCalcOnlyHtml(deckState()), calcConfig: () => calcConfig(deckState(), false), baseline: () => siteBaseline(makeCtx(deckState())), setView};
if (S.example) status('This is the example draft. Start a new draft with + New for a real client.');
setTimeout(() => { VI.loadLib('pdf').catch(() => {}); }, 2500);
})();

