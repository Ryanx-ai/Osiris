
/* =====================================================================
   SLIDE TEMPLATES & FUNDING / COHORT / MULTI-UEN ENGINE (v3)
   Reinstated exact Proposal Deck Creator v2 color scheme (K & HP)
   ===================================================================== */
const K = {BG:'2340B8', BRAND:'0055FF', PILL:'2B47C9', NAVY:'1A2A6C', INK:'1A2240', MUTED:'5A6384', LAV1:'EEF1FD', LAV2:'DCE3FA',
  LINE:'C9D2F2', PALE:'A9B8F2', MID:'2F4DC4', GREEN_BG:'E2F4E4', GREEN:'2E7D32', GOLD:'8A5A00', GREY:'6B7280', RED:'D93025',
  AMB:'FFF1C2', HL:'E7EBFC', ZEBRA:'F6F7FB', BORDER:'DDE2F0', SLATE:'4A5068', E4:'E4E9FB', C9:'C9D2F2', DC:'DCE3FA', WHITE:'FFFFFF', RULE:'3A4C94'};
const M = 0.55;
// Constants CONSULTANT, VERIFIED, SFEC_DEADLINE, C, IND, CASE_KEYS, GROUPS are defined in assets_block above

const money0 = n => 'S$' + Math.round(n).toLocaleString('en-US');
function money(cents){
  const v = Math.round(cents) / 100;
  return 'S$' + (Math.abs(v - Math.round(v)) < 0.005 ? Math.round(v).toLocaleString('en-US') : v.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}));
}
const minus = c => '– ' + money(c);
const plus = c => '+ ' + money(c);
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : '';
const poss = s => /s$/i.test(s) ? s + '’' : s + '’s';
const hrsText = h => (h === Math.floor(h) ? h : h.toFixed(1)) + ' hours';
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function parseISO(iso){ const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim()); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
function fmtLong(iso){
  const d = parseISO(iso);
  if (d) return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  return String(iso || '').trim();
}
function fmtShortDate(iso){
  const d = parseISO(iso);
  if (d) return d.getDate() + ' ' + SHORT_MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  return String(iso || '').trim();
}
function fmtDayMonth(iso){
  const d = parseISO(iso);
  if (d) return d.getDate() + ' ' + SHORT_MONTHS[d.getMonth()];
  return String(iso || '').trim();
}
function fmtDay(iso){ const d = parseISO(iso); return d ? DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] : String(iso || '').trim(); }
function monthYear(iso){ const d = parseISO(iso); return d ? MONTHS[d.getMonth()] + ' ' + d.getFullYear() : 'October 2026'; }
function daysFor(h){ const d = h <= 8 ? 1 : h <= 17 ? 2 : 3; return {d, text: d === 1 ? '1 full day or 2 half days' : d + ' full days or ' + (2 * d) + ' half days'}; }
const titleCase = s => String(s).replace(/\b([a-z])([a-z]*)/g, (m, a, b) => (['and','of','the','for','in','on','at','to','a'].includes(m) ? m : a.toUpperCase() + b));

function rich(str, base){
  const out = [];
  String(str).split(/(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/g).forEach(part => {
    if (!part) return;
    if (part.startsWith('**')) out.push(Object.assign({}, base, {s:part.slice(2, -2), b:true}));
    else if (part.startsWith('[[')){ const [t, u] = part.slice(2, -2).split('|'); out.push(Object.assign({}, base, {s:t, link:u})); }
    else out.push(Object.assign({}, base, {s:part}));
  });
  return out;
}

/* ---------- Funding Math (current SFEC = reimbursed after the course; redesigned SFEC = offset upfront) ----------
   All amounts in cents. Per participant:
     up       payable at enrolment          net (+ GST) less SFEC when SFEC is offset upfront
     sfecBack SFEC claimed back afterwards   current scheme only
     gstBack  GST claimed as input tax       GST-registered companies
     netCost  course-fee cost after funding, SFEC and the GST claim (= net - SFEC)
     ap       Absentee Payroll               salary support, weekdays, Singapore Citizens and PRs
     eis      tax saving from the 400% EIS deduction on netCost at 17% */
function per(c, rate, ctx){
  const fee = Math.round(c.fee * 100);
  const base = rate > 0 ? Math.round(fee * 0.5) : 0;
  const add = rate === 70 ? Math.round(fee * 0.2) : 0;
  const net = fee - base - add;
  const gst = Math.round(fee * 0.09);
  // v2.1: a course flagged for the current SFEC (completed by 30 Nov 2026) keeps the current rules in a redesigned-SFEC deck:
  // up to 90% of the nett fee after funding, before GST, claimed back after the course
  const byCourse = !!c.legacySfec && ctx.sfecMode !== 'legacy';
  const isLegacy = ctx.sfecMode === 'legacy' || byCourse;
  const sfecRate = (byCourse ? SFEC_LEGACY_RATE : (ctx.sfecRate != null ? ctx.sfecRate : SFEC_DEFAULT_RATE)) / 100;
  // Pass holders (rate 0): the current SFEC still reimburses their nett fee, but the redesigned SFEC covers only Singapore Citizens and PRs
  const sfec = ctx.sfecOn && (isLegacy || rate > 0) ? Math.round(net * sfecRate) : 0;
  const upBeforeSfec = net + gst;
  const up = isLegacy ? (net + gst) : (net - sfec + gst);
  const ap = rate > 0 && ctx.weekday ? c.ap * 450 : 0;
  const sfecBack = isLegacy ? sfec : 0;
  const reimb = sfecBack + ap + gst;
  const netCost = net - sfec;
  const eis = Math.round(netCost * 0.68);
  return {fee, base, add, fund: base + add, net, gst, upBeforeSfec, up, sfec, sfecBack, gstBack: gst, netCost, ap, reimb, eis, rate, isLegacy};
}
/* Client-facing names for the two SFEC schemes, kept in one place so every slide says the same thing. */
function sfecWords(ctx){
  const rate = ctx.sfecRate != null ? ctx.sfecRate : SFEC_DEFAULT_RATE, pct = rate + '%';
  const full = !ctx.isLegacySfec && rate >= 100;
  const cover = full ? 'the full nett fee, before GST' : ctx.isLegacySfec ? 'up to ' + pct + ' of the nett fee, before GST' : 'up to ' + pct + ' of the remaining fee';
  return ctx.isLegacySfec
    ? {pct, full, cover, badge:'SFEC CLAIMED BACK AFTER THE COURSE', short:'Current SFEC', scheme:'current SFEC scheme (until 30 Nov 2026)',
       how:'claimed back after the course', row:'SFEC claimed back (current scheme)', verb:'claimed back'}
    : {pct, full, cover, badge:'SFEC OFFSET UPFRONT', short:'SFEC (from 1 Dec 2026)', scheme:'redesigned SFEC (from 1 Dec 2026)',
       how:'offset upfront at enrolment', row:'SFEC offset upfront', verb:'offset upfront'};
}
const paxWord = n => n + ' participant' + (n === 1 ? '' : 's');
function paxStatus(c){ return c.paxConfirmed ? 'confirmed' : 'proposed'; }
function sumPer(a, b){ const o = {}; Object.keys(a).forEach(k => { o[k] = typeof a[k] === 'number' ? a[k] + b[k] : a[k]; }); return o; }
function sumPerList(list){
  if (!list.length) return {};
  return list.slice(1).reduce((acc, item) => sumPer(acc, item), Object.assign({}, list[0]));
}
function groupsFor(S, exactHas50, exactHas70, exactHasPass){
  const g = [];
  if (S.tier === '70'){
    // SME-sponsored: one 70% rate for every Singapore Citizen and PR, whatever their age
    g.push({key:'70', rate:70, h1:'Singapore Citizens and PRs', h2:'70% course-fee funding', label:'Singapore Citizens and PRs (70% funding)', fill:K.NAVY});
  } else if (S.tier === '50'){
    g.push({key:'50', rate:50, h1:'Singapore Citizens below 40, and PRs', h2:'50% baseline funding', label:'Singapore Citizens below 40, and PRs (50% funding)', fill:K.BRAND});
    g.push({key:'70', rate:70, h1:'Singapore Citizens aged 40 and above', h2:'70% with the additional 20%', label:'Singapore Citizens aged 40 and above (70% funding)', fill:K.NAVY});
  } else {
    g.push({key:'50', rate:50, h1:'Singapore Citizens below 40, and PRs', h2:'50% baseline funding', label:'Singapore Citizens below 40, and PRs (50% baseline)', fill:K.BRAND});
    g.push({key:'70', rate:70, h1:'Singapore Citizens aged 40+ / SME', h2:'70%: SME-sponsored, or Citizens aged 40+', label:'Singapore Citizens aged 40+ / SME (70% enhanced)', fill:K.NAVY});
  }
  if (S.pass || exactHasPass){
    g.push({key:'pass', rate:0, pass:true, h1:'Pass holders', h2:'EP, S Pass and Work Permit (no SkillsFuture funding)', label:'Pass holders: EP, S Pass, Work Permit (no SkillsFuture funding)', fill:K.SLATE});
  }
  return g;
}

/* ---------- Cohort Makeup Helpers ---------- */
function parseMakeup(n50, n70, npass){
  const a = Math.max(0, parseInt(n50, 10) || 0);
  const b = Math.max(0, parseInt(n70, 10) || 0);
  const c = Math.max(0, parseInt(npass, 10) || 0);
  return {n50:a, n70:b, npass:c, qty:a + b + c};
}
/* Under the 70% option (SME-sponsored), every Singapore Citizen and PR gets 70% whatever their age,
   so any places entered at 50% count at 70%. */
function makeupForTier(S, m){
  if (!m || !S || S.tier !== '70' || !m.n50) return m;
  return {n50:0, n70:m.n50 + m.n70, npass:m.npass, qty:m.qty};
}
function fmtMakeupShort(m){
  if (!m || !m.qty) return '0 pax';
  const parts = [];
  if (m.n50) parts.push(m.n50 + '×50%');
  if (m.n70) parts.push(m.n70 + '×70%');
  if (m.npass) parts.push(m.npass + '×Pass');
  return parts.join(', ');
}
function fmtMakeupLong(m){
  if (!m || !m.qty) return '0 participants';
  const parts = [];
  if (m.n50) parts.push(m.n50 + ' at 50% (Citizens under 40, PRs)');
  if (m.n70) parts.push(m.n70 + ' at 70% (Citizens 40+, SME)');
  if (m.npass) parts.push(m.npass + (m.npass === 1 ? ' pass holder (no funding)' : ' pass holders (no funding)'));
  return parts.join(' · ');
}
/* A cohort's funding mix in plain words. sme: the 70% places are SME-sponsored Citizens and PRs rather than Citizens aged 40+. */
function makeupText(m, sme, short){
  if (!m) return '';
  const parts = [];
  if (m.n50) parts.push(m.n50 + ' at 50%' + (short ? '' : ' (Citizens under 40, PRs)'));
  if (m.n70) parts.push(m.n70 + ' at 70%' + (short ? '' : sme ? ' (SME-sponsored Citizens and PRs)' : ' (Citizens aged 40+)'));
  if (m.npass) parts.push(m.npass + (m.npass === 1 ? ' pass holder' : ' pass holders') + (short ? '' : ' (no funding)'));
  return parts.join(' · ') || '0 participants';
}
/* Changes a cohort's size but keeps its funding mix: new places go to the largest group, and places come off the largest group first. */
function resizeMakeup(mk, n, rate){
  const m = {n50:(mk && mk.n50) || 0, n70:(mk && mk.n70) || 0, npass:(mk && mk.npass) || 0};
  n = Math.max(0, Math.round(+n || 0));
  let q = m.n50 + m.n70 + m.npass;
  if (q === 0) return uniformMakeup(n, rate == null ? 50 : rate);
  const top = () => ['n50', 'n70', 'npass'].reduce((a, k) => m[k] > m[a] ? k : a, 'n50');
  while (q < n){ m[top()]++; q++; }
  while (q > n){ m[top()]--; q--; }
  return m;
}
const sameMakeup = (a, b) => a.n50 === b.n50 && a.n70 === b.n70 && a.npass === b.npass;

/* ---------- v7: teams and headcounts from "Team being trained" ----------
   The field takes one team ("project team"), a list ("Admin, HR and QS") or a list with headcounts ("Finance 4, HR 3,
   Ops 5"). Each named team becomes a part: the pathway slide follows every part through the courses it is on. */
const TEAM_ORDINAL = /^(team|shift|phase|batch|cohort|group|tier|level|class|run|intake|stage|unit|zone|site|plant|line|outlet|branch|floor|block|grade|year|section|wave|round|day|week)$/i;
const TEAM_COUNT_WORD = '(?:pax|people|persons?|staff|participants?|learners?|employees?|headcount)';
const TEAM_TRAIL = new RegExp('^(.+?)\\s*(?:[:(\\-–—]\\s*|\\s[x×]\\s*|\\s)(\\d{1,3})\\s*' + TEAM_COUNT_WORD + '?\\s*\\)?$', 'i');
const TEAM_LEAD = new RegExp('^\\(?(\\d{1,3})\\s*(?:[x×]|' + TEAM_COUNT_WORD + ')?\\)?\\s+(?:from |in |of |for )?(.+)$', 'i');
function teamPart(bit){
  let s = String(bit || '').trim().replace(/^(?:and|&)\s+/i, ''), n = null, m;
  if ((m = TEAM_TRAIL.exec(s)) && !TEAM_ORDINAL.test(m[1].trim())){ s = m[1]; n = +m[2]; }
  else if ((m = TEAM_LEAD.exec(s))){ s = m[2]; n = +m[1]; }
  s = s.replace(/[\s:(\-–—]+$/, '').replace(/^the\s+/i, '').trim();
  return {name:s, n};
}
const teamKey = s => String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/\b(the|team|teams|department|departments|dept|depts)\b/g, ' ').replace(/[^a-z0-9]+/g, '') || '*';
/* Words that mark a phrase as a description rather than a team name ("joining a public cohort", "any F&B leads") */
const TEAM_PROSE = /^(joining|join|joins|optional|tbc|tba|any|all|other|others|some|various|mixed|across|including|incl|plus|with|from|to|be|is|are|will|who|that|which|a|an|per|each|every|public|private|cohort|class|session|sessions|later|first|then|about|around|approx|up|if|or|not|only|curriculum|reviewed)$/i;
const TEAM_COMPOUND = /\b(learning|research)\s+and\s+development\b|\bhealth\s+and\s+safety\b|\bfood\s+and\s+beverage\b/i;
function teamParts(raw){
  const s = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!s) return [];
  const words = t => t.split(/\s+/).filter(Boolean);
  const bits = s.split(/\s*[,;]\s*/).filter(Boolean), list = [];
  bits.forEach((b, i) => {
    const sub = b.split(/\s+and\s+/i), both = b.split(/\s+(?:and|&)\s+/i);
    // "Finance 4 and HR 3" names two teams, each with its own headcount; "A, B and C" ends a comma list
    if (both.length > 1 && both.every(x => teamPart(x).n != null)) both.forEach(x => list.push(teamPart(x)));
    else if (bits.length > 1 && i === bits.length - 1 && sub.length === 2 && !TEAM_COMPOUND.test(b) && words(sub[0]).length <= 2) sub.forEach(x => list.push(teamPart(x)));
    else list.push(teamPart(b));
  });
  // a list only when it reads as one: short names, or a headcount on every team. Anything else stays one team, as typed.
  const named = list.filter(p => p.name);
  const reads = named.length > 1 && (named.every(p => p.n != null) ||
    named.every((p, i) => words(p.name).length <= (i === named.length - 1 ? 5 : 3) && !words(p.name).some(w => TEAM_PROSE.test(w))));
  if (!reads){ const one = teamPart(s); return [{name: one.n != null && bits.length === 1 ? one.name : s, key: teamKey(one.n != null && bits.length === 1 ? one.name : s), n: bits.length === 1 ? one.n : null}]; }
  const last = named[named.length - 1];
  last.name = last.name.replace(/\s+(teams|departments|depts)$/i, '') || last.name;
  const out = [];
  named.forEach(p => {
    const key = teamKey(p.name), have = out.find(o => o.key === key);
    if (!have) out.push({name:p.name, key, n:p.n});
    else if (p.n != null) have.n = (have.n || 0) + p.n;
  });
  return out;
}
/* The teams in prose, without their headcounts: "Finance, HR and Ops teams" */
function teamProse(parts){
  const names = parts.map(p => p.name), s = joinList(names);
  return names.length > 1 && teamNoun(s) !== s ? s + ' teams' : teamNoun(s);
}
/* Shares a course's headcount among its teams: a typed number is kept; teams without one share what is left. */
function teamShares(parts, pax){
  if (!parts.length) return [{key:'*', name:'', n:null, w:pax, exact:true}];
  const open = parts.filter(p => p.n == null), sum = parts.reduce((a, p) => a + (p.n || 0), 0);
  const rest = Math.max(0, pax - sum), base = open.length ? Math.floor(rest / open.length) : 0;
  let extra = open.length ? rest - base * open.length : 0;
  return parts.map(p => p.n != null ? {key:p.key, name:p.name, n:p.n, w:p.n, exact:true}
    : {key:p.key, name:p.name, n:null, w:base + (extra-- > 0 ? 1 : 0), exact:open.length === 1 && sum <= pax});
}

/* ---------- Context Builder ---------- */
function courseWith(k, fee, hrs){
  const base = C[k] || C.genai;
  const c = Object.assign({}, base);
  if (fee && +fee > 0) c.fee = +fee;
  if (hrs && +hrs > 0){ c.hrs = +hrs; c.ap = k === 'genai' ? Math.min(21, Math.floor(+hrs)) : Math.floor(+hrs); }
  return c;
}
function shortName(n){
  let s = String(n || '').trim(), prev;
  do {
    prev = s;
    s = s.replace(/\s*\((?:singapore|s)\)\s*$/i, '').replace(/[,\s]+(?:pte\.?\s*ltd\.?|private\s+limited|pte\.?|ltd\.?|limited|inc\.?|llp|llc)$/i, '').trim();
  } while (s !== prev);
  return s || String(n || '').trim();
}
function ref(c, full){
  let n = full ? c.full : c.name;
  if (n.includes(':')) n = (full && c.wsq ? 'WSQ ' : '') + c.short;
  return {n, tail: /(bootcamp|course)$/i.test(n) ? '' : ' course'};
}
/* "the **Generative AI Workflow Automation** course": the article and the trailing noun, in one place */
function courseRef(c, full, bold){
  const r = ref(c, full);
  return 'the ' + (bold ? '**' + r.n + '**' : r.n) + r.tail;
}
function joinList(items){ return items.length <= 1 ? (items[0] || '') : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]; }
/* Tries each candidate text in turn and keeps the first that fits without heavy shrinking. */
function fitFirst(cands, make, o, min){
  let el = null, firstFit = null;
  const opts = Object.assign({}, o, {ellipsis:false});
  for (const c of cands){
    el = fit(make(c), opts);
    if (el._fits && el._scale >= (min || 0.8)) return el;
    if (el._fits && !firstFit) firstFit = el;
  }
  if (firstFit) return firstFit;
  return fit(make(cands[cands.length - 1]), o);
}

/* "finance" reads as "the finance team" in prose; names that already say team, department, managers etc. stay as typed */
function teamNoun(t){
  t = String(t || '').trim();
  if (!t) return '';
  return /\b(team|teams|department|dept|division|unit|staff|group|managers|leaders|leadership|crew|squad|office|function|employees|engineers|executives|secretariat|committee|cohort)\b/i.test(t) ? t : t + ' team';
}
function makeCtx(S){
  syncCustomCases(S);
  const rawList = Array.isArray(S.courses) && S.courses.length ? S.courses : [{id:'c1', k:'genai', delivery:'private', uenId:'', team:S.team || '', pax:'12', date:'', pilot:true, fee:'', hrs:'', m50:'6', m70:'6', mpass:'0'}];
  const defaultParts = teamParts(S.team);
  const defaultTeam = defaultParts.length > 1 || defaultParts.some(p => p.n != null) ? teamProse(defaultParts) : teamNoun(S.team);
  const exactMakeupOn = !!S.exactMakeup;

  // Normalize UENs if Multi-UEN is enabled
  const sfecOn = S.sfec !== 'none';
  const rawUens = Array.isArray(S.uens) && S.uens.length ? S.uens : [];
  const multiUen = !!(S.multiUen && sfecOn && rawUens.length > 0);
  const legacyMode = S.sfecMode === 'legacy';
  const uens = multiUen ? rawUens.map((u, idx) => {
    const balDollars = legacyMode ? Math.max(0, parseFloat(String(u.bal == null ? '10000' : u.bal).replace(/[^0-9.]/g, '')) || 0) : freshBal(u.balNew);
    const name = (u.name || '').trim() || ('Entity ' + (idx + 1));
    const uenCode = (u.uen || '').trim() || '';
    return {
      id: u.id || ('u_' + (idx + 1)),
      idx,
      badge: 'U' + (idx + 1),
      name,
      uen: uenCode,
      label: name + (uenCode ? ' (' + uenCode + ')' : ''),
      balDollars,
      balCents: Math.round(balDollars * 100)
    };
  }) : [];

  const courses = rawList.map((item, idx) => {
    const base = courseWith(item.k || 'genai', item.fee, item.hrs);
    const m = makeupForTier(S, parseMakeup(item.m50, item.m70, item.mpass));
    const delivery = item.delivery || S.delivery || 'private';
    const cPriv = delivery !== 'public';
    const cVenue = delivery === 'private-client' ? 'at your office' : delivery === 'private-vi' ? 'at our Paya Lebar campus' : delivery === 'private-online' ? 'online, as a live virtual class' : 'at your office or ours';
    const cVenueChoice = delivery === 'private-client' ? 'at your office' : delivery === 'private-vi' ? 'at our Paya Lebar campus' : delivery === 'private-online' ? 'online, as a live virtual class' : 'at your office or our Paya Lebar campus';
    const cDeliveryShort = delivery === 'private-client' ? 'Private (office)' : delivery === 'private-vi' ? 'Private (VI campus)' : delivery === 'private-online' ? 'Private (online)' : delivery === 'public' ? 'Public run' : 'Private class';
    const rawPax = Math.max(0, parseInt(item.pax, 10) || 0);
    const pax = (exactMakeupOn && m.qty > 0) ? m.qty : (rawPax || (cPriv ? 12 : 5));
    const dateRaw = (item.date || '').trim();
    const dateFmt = fmtLong(dateRaw);
    const dateShort = fmtShortDate(dateRaw);
    const ownParts = teamParts(item.team);
    const team = ownParts.length > 1 || ownParts.some(p => p.n != null) ? teamProse(ownParts) : (teamNoun(item.team) || defaultTeam);
    const parts = teamShares(ownParts.length ? ownParts : defaultParts, pax);
    const splitSum = parts.every(p => p.n != null) ? parts.reduce((a, p) => a + p.n, 0) : null;
    const uenId = (multiUen && uens.some(u => u.id === item.uenId)) ? item.uenId : '';
    const assignedUen = uenId ? uens.find(u => u.id === uenId) : null;
    return Object.assign({}, base, {
      idx,
      slotId: item.id || ('c' + (idx + 1)),
      cKey: 'c' + (idx + 1),
      delivery,
      priv: cPriv,
      venue: cVenue,
      venueChoice: cVenueChoice,
      deliveryShort: cDeliveryShort,
      uenId,
      assignedUen,
      team,
      parts,
      splitSum,
      pax,
      rawPax,
      date: dateRaw,
      dateFmt,
      dateShort,
      pilot: !!item.pilot,
      paxConfirmed: !!item.paxConfirmed,
      m,
      feeOverride: item.fee || '',
      hrsOverride: item.hrs || '',
      train: schedTrain(item.k || 'genai', item.hrs),
      sessionsPref: Math.max(0, Math.min(7, parseInt(item.sessions, 10) || 0)),
      asmtOverride: Math.max(0, parseFloat(item.asmt) || 0),
      // v2.1 per-course settings: current-SFEC course, own stage label, milestone badge, duration options, public class times
      legacySfec: !legacyMode && sfecOn && !!item.legacySfec,
      stageLabel: String(item.stageLabel || '').trim(),
      deadline: String(item.deadline || '').trim(),
      formatOpts: parseFormatOpts(item.formatOpts),
      timesText: String(item.timesText || '').trim()
    });
  });

  // Ensure at most one pilot course
  let foundPilot = false;
  courses.forEach(c => {
    if (c.pilot && !foundPilot) foundPilot = true;
    else c.pilot = false;
  });

  const c1 = courses[0];
  const c2 = courses[1] || null;
  const multi = courses.length > 1;
  const multiMode = S.multiMode === 'standalone' ? 'standalone' : 'pathway';
  const pathway = multi && multiMode === 'pathway';
  const standalone = multi && multiMode === 'standalone';
  const pilotCourse = courses.find(c => c.pilot) || null;
  const nonPilotCourses = pilotCourse ? courses.filter(c => !c.pilot) : courses.slice(1);

  const ind = IND[S.industry] || IND.general;
  const clientFull = (S.client || '').trim() || 'Your Company';
  const client = shortName(clientFull);
  const team = c1.team || defaultTeam;
  const today = S.date || new Date().toISOString().slice(0, 10);

  const allPriv = courses.every(c => c.priv);
  const allPub = courses.every(c => !c.priv);
  const mixedDelivery = !allPriv && !allPub;
  const priv = !allPub;
  const venue = c1.venue;
  const venueChoice = c1.venueChoice;
  const weekday = S.schedule !== 'weekend';
  const sfecMode = S.sfecMode === 'legacy' ? 'legacy' : 'enhanced';
  const isLegacySfec = sfecMode === 'legacy';
  const deadlineActive = isLegacySfec || today <= SFEC_DEADLINE;
  const sfecRate = isLegacySfec ? SFEC_LEGACY_RATE : redesignedRate(S);
  const consultant = Object.assign({}, CONSULTANT_DEFAULT, S.consultant || {});
  // Current SFEC: the balance left, or unknown. Redesigned SFEC: a fresh S$10,000 wallet per entity (less anything already used), never unlimited.
  const singleBal = isLegacySfec ? (S.sfec === 'known' ? parseFloat(String(S.sfecBal || '').replace(/[^0-9.]/g, '')) || 0 : 0) : freshBal(S.sfecBalNew);
  const multiBalTotal = multiUen ? uens.reduce((sum, u) => sum + u.balDollars, 0) : 0;
  const bal = multiUen ? multiBalTotal : singleBal;
  const sfecKnown = sfecOn && (isLegacySfec ? (multiUen ? multiBalTotal > 0 : (S.sfec === 'known' && singleBal > 0)) : true);

  const aiPath = multi && courses.every(c => c.g === 'ai');
  const prog = courses.map(c => c.short).join(' + ');
  const progFull = !multi ? c1.short
    : standalone ? (courses.length + '-Course Capability Programme (' + courses.map(c => c.short).join(', ') + ')')
    : (aiPath ? 'AI Capability Pathway' : courses.map(c => c.short).join(' + ') + ' Pathway');
  const totalHrs = courses.reduce((sum, c) => sum + c.hrs, 0);
  const totalFeePerPax = courses.reduce((sum, c) => sum + c.fee, 0);
  const wsqAll = courses.every(c => c.wsq);

  const exactMakeup = exactMakeupOn && courses.some(c => c.m.qty > 0);
  const pax = c1.pax;
  const pax2 = c2 ? c2.pax : pax;
  const totalSeats = courses.reduce((sum, c) => sum + c.pax, 0);
  const diffCoursePax = multi && courses.some(c => c.pax !== c1.pax);
  const diffCourseMakeup = exactMakeup && multi && courses.some(c => c.m.n50 !== c1.m.n50 || c.m.n70 !== c1.m.n70 || c.m.npass !== c1.m.npass);
  const exactHas50 = exactMakeup && courses.some(c => c.m.n50 > 0);
  const exactHas70 = exactMakeup && courses.some(c => c.m.n70 > 0);
  const exactHasPass = exactMakeup && courses.some(c => c.m.npass > 0);

  const distinctTeams = courses.reduce((a, c) => { c.parts.forEach(p => { const nm = p.name.replace(/\s+teams?$/i, ''); if (nm && !a.some(x => teamKey(x) === teamKey(nm))) a.push(nm); }); return a; }, []);
  const coursesWithDates = courses.filter(c => c.date);
  const trainingDate = (pilotCourse && pilotCourse.date) || c1.date || (coursesWithDates[0] && coursesWithDates[0].date) || '';
  const trainingDateFmt = fmtLong(trainingDate);

  const ctx = {
    S, courses, c1, c2, multi, multiMode, pathway, standalone, pilotCourse, nonPilotCourses,
    ind, client, clientFull, team, distinctTeams, today, trainingDate, trainingDateFmt, coursesWithDates,
    priv, allPriv, allPub, mixedDelivery, venue, venueChoice, weekday,
    sfecMode, isLegacySfec, deadlineActive, sfecRate, consultant, sfecOn, sfecKnown, bal, multiUen, uens,
    aiPath, prog, progFull, totalHrs, totalFeePerPax, wsqAll,
    pax, pax2, totalSeats, m1: c1.m, m2: c2 ? c2.m : null,
    exactMakeup, diffCoursePax, diffCourseMakeup, exactHas50, exactHas70, exactHasPass
  };
  ctx.groups = groupsFor(S, exactHas50, exactHas70, exactHasPass);
  ctx.teamPhrase = distinctTeams.length > 1
    ? (poss(client) + ' ' + joinList(distinctTeams) + ' teams')
    : (team ? poss(client) + ' ' + team : client);
  ctx.fam = c1.fam;
  // v2.1: courses kept on the current SFEC, and the current balance they draw on
  ctx.legacyCourses = courses.filter(c => c.legacySfec);
  ctx.legacyBal = ctx.legacyCourses.length ? (parseFloat(String((S.legacyCalc && S.legacyCalc.bal) || S.sfecBal || '').replace(/[^0-9.]/g, '')) || 0) : 0;
  return ctx;
}

/* ---------- v2.1: current-SFEC courses, stage labels and duration options ----------
   A course flagged legacySfec in a redesigned-SFEC deck (one completed by 30 Nov 2026) is left out of the combined
   funding and calculator views and shown on its own under the current SFEC rules. A course with its own stage label is
   left out of the stage numbers, so the next course becomes Stage 1. */
function legacyCtx(ctx){
  if (ctx.isLegacySfec) return ctx;
  const b = ctx.legacyBal || 0;
  return Object.assign({}, ctx, {sfecMode:'legacy', isLegacySfec:true, sfecRate:SFEC_LEGACY_RATE, deadlineActive:true, bal:b, sfecKnown:b > 0, legacyView:true});
}
/* The courses a combined view adds up: the redesigned-SFEC ones when the deck has both kinds */
const mainCourses = list => { const m = list.filter(c => !c.legacySfec); return m.length ? m : list; };
function stageNo(ctx, c){
  const list = ctx.courses.filter(x => !x.stageLabel);
  const i = list.findIndex(x => x.slotId === c.slotId);
  return i >= 0 ? i + 1 : c.idx + 1;
}
/* Duration options typed per course: "3-7" (3 to 7 days), "3,4" (3 or 4 days), "2,6x3" (2 days, or 6 sessions of 3 hours) */
function parseFormatOpts(raw){
  const out = [], seen = new Set();
  String(raw || '').split(/[,;]+/).forEach(tok => {
    const t = tok.replace(/\s+/g, '').toLowerCase();
    let m;
    const add = o => { if (o.n >= 1 && o.n <= 12 && !seen.has(o.n)){ seen.add(o.n); out.push(o); } };
    if ((m = /^(\d+)-(\d+)$/.exec(t))) { for (let n = +m[1]; n <= +m[2]; n++) add({n}); }
    else if ((m = /^(\d+)[x\u00d7](\d+(?:\.\d+)?)h?$/.exec(t))) add({n:+m[1], sess:+m[2]});
    else if ((m = /^(\d+)(?:d|days?)?$/.exec(t))) add({n:+m[1]});
  });
  return out;
}

function themesFor(ctx){
  if (ctx.aiPath) return ['docs','lean','coordination','customers','compliance','data','growth'];
  return ctx.c1.themes ? ctx.c1.themes.concat(FAMILY_THEMES[ctx.c1.fam].filter(t => !ctx.c1.themes.includes(t))) : FAMILY_THEMES[ctx.c1.fam];
}
function benefitFor(ctx, theme){
  if (ctx.aiPath){
    const hasWfa = ctx.courses.some(c => c.k === 'wfa');
    const hasGaicc = ctx.courses.some(c => c.k === 'gaicc');
    if (hasGaicc && ['customers','growth'].includes(theme) && COURSE_BENEFITS.gaicc[theme]) return COURSE_BENEFITS.gaicc[theme];
    if (hasWfa && ['lean','coordination','data'].includes(theme)) return BENEFITS.auto[theme];
    return BENEFITS.ai[theme];
  }
  const ov = COURSE_BENEFITS[ctx.c1.k];
  if (ov && ov[theme]) return ov[theme];
  return BENEFITS[ctx.c1.fam][theme];
}
function solutionFor(ctx){
  const k = ctx.aiPath ? 'pathway_ai' : (SOLUTION[ctx.c1.k] ? ctx.c1.k : ctx.c1.fam);
  return SOLUTION[k].replace('{focus}', ctx.ind.focus);
}
function leadReality(ctx){
  const fam = ctx.c1.fam, ind = ctx.ind, th = themesFor(ctx).filter(t => ind.real[t]);
  if (!ctx.aiPath && fam === 'cyber') return {text:'Teams in the sector typically handle ' + ind.sensitive + ', and many incidents start with a phishing email, a weak password or a misdirected file.', why:th.slice(0, 3)};
  if (!ctx.aiPath && fam === 'carbon') return {text:'Customers, investors and regulators increasingly ask for emissions data, typically covering ' + ind.carbon + '.', why:th.slice(0, 3)};
  return {text:ind.real[th[0]], why:th.slice(1, 4)};
}

/* ---------- Client talking points (v6) ----------
   S.pains: what the client's teams said in the call, one entry each: {team, tools, text, head, body, theme, link}.
   link says where the point is answered: '' (the programme as a whole), 'm:<course>:<lesson>' (a lesson of a proposed
   course) or 'c:<course>' (a whole course; when that course is not in the proposal it leads the Other courses slide).
   head / body are the benefit shown beside the point; left blank, the benefit for the point's theme is used. */
const PAIN_MAX = 5;
const PAIN_THEMES = [['docs', 'Documents and correspondence'], ['data', 'Reports and figures'], ['coordination', 'Hand-offs between teams'], ['compliance', 'Compliance and records'], ['customers', 'Customer replies'], ['lean', 'Time and admin load'], ['growth', 'Sales and growth']];
/* A point's theme when none is chosen: the theme whose words it uses most (ties go to the earlier theme) */
const THEME_WORDS = {
  data:/reports?\b|exports?\b|figures?\b|dashboards?|spreadsheets?|excel|\bdata\b|numbers|stock|reconcil|month-end|forecast|ledger|kpis?\b|analys/g,
  compliance:/audits?\b|complian|safety|certif|records?\b|checklists?|permits?\b|regulat|\bsops?\b|errors?\b|mistakes?|missing|inconsisten/g,
  customers:/customers?|clients?\b|enquir|repl(y|ies)|complain|service requests?|guests?/g,
  coordination:/hand-?offs?|between (teams|departments)|coordinat|follow[- ]?ups?|chas(e|ing)|meetings?|minutes|threads?|updates?|approvals?/g,
  growth:/tenders?|proposals?|quotations?|\bsales\b|leads?\b|marketing|grow|campaigns?/g,
  lean:/by hand|manual|admin|time-consuming|takes (too )?long|hours|repetitive|retyp|re-?enter|small team|short-staffed|stretched/g,
  docs:/draft|writ(e|ten|ing)|from scratch|faqs?\b|announcements?|emails?\b|letters?|documents?|templates?|memos?|polic(y|ies)|paperwork|invoices?|orders?\b/g
};
/* Every theme the words point to, most first (ties keep the THEME_WORDS order) */
function guessThemes(text){
  const t = String(text || '').toLowerCase();
  return Object.keys(THEME_WORDS).map((k, i) => ({k, i, n:(t.match(THEME_WORDS[k]) || []).length})).filter(x => x.n > 0).sort((a, b) => b.n - a.n || a.i - b.i).map(x => x.k);
}
function guessTheme(text){ return guessThemes(text)[0] || 'docs'; }
/* Tools typed with commas, semicolons or slashes become separate tags ("Xero, AutoCount"); "Xero and AutoCount" stays one */
const toolTags = s => String(s || '').split(/\s*[,;\/]\s*/).map(x => x.trim()).filter(Boolean);
const endStop = s => { s = String(s || '').trim(); return !s ? '' : /[.!?…]$/.test(s) ? s : s + '.'; };
const noStop = s => String(s || '').trim().replace(/[.!?]+$/, '');
/* The client's points, with their links resolved against this proposal */
function painsOf(ctx){
  if (ctx._pains) return ctx._pains;
  const S = ctx.S || {}, taken = new Set(ctx.courses.map(c => c.k));
  ctx._pains = (Array.isArray(S.pains) ? S.pains : []).filter(p => p && String(p.text || '').trim()).slice(0, PAIN_MAX).map((p, i) => {
    const text = String(p.text).trim().replace(/\s+/g, ' ');
    const auto = !PAIN_THEMES.some(t => t[0] === p.theme);
    const themes = auto ? guessThemes(text + ' ' + (p.tools || '')) : [p.theme];
    const theme = themes[0] || 'docs';
    const link = String(p.link || '');
    let kind = 'prog', course = null, mod = 0, other = '', m;
    if ((m = /^m:(\w+):(\d+)$/.exec(link)) && taken.has(m[1])){
      course = ctx.courses.find(c => c.k === m[1]);
      const n = +m[2], L = (course.lessons || course.areas || []).length;
      if (n >= 1 && n <= L) mod = n;
    } else if ((m = /^c:(\w+)$/.exec(link)) && C[m[1]]){
      if (taken.has(m[1])) course = ctx.courses.find(c => c.k === m[1]);
      else { kind = 'other'; other = m[1]; }
    }
    return {i, raw: S.pains.indexOf(p), team: String(p.team || '').trim(), tools: String(p.tools || '').trim(), text, head: String(p.head || '').trim(), body: String(p.body || '').trim(), theme, themes, auto, kind, course, mod, other};
  });
  return ctx._pains;
}
const progPains = ctx => painsOf(ctx).filter(p => p.kind === 'prog');
const otherPains = ctx => painsOf(ctx).filter(p => p.kind === 'other');
/* The benefit shown beside a point: the one typed with it, else the course's (or programme's) benefit for its theme.
   used holds headlines already on the slide: a point with an automatic theme moves on to its next theme rather than
   repeat one. */
function painBenefit(ctx, p, used){
  const c = p.course;
  const pick = th => (c && ((COURSE_BENEFITS[c.k] && COURSE_BENEFITS[c.k][th]) || (BENEFITS[c.fam] && BENEFITS[c.fam][th]))) || benefitFor(ctx, th) || BENEFITS.ai[th] || null;
  if (p.head && p.body) return [p.head, p.body];
  let base = null;
  const order = p.auto === false ? [p.theme] : (p.themes && p.themes.length ? p.themes : [p.theme]).concat(themesFor(ctx));
  for (const th of order){ const b = pick(th); if (b && !(used && used.has(b[0]))){ base = b; break; } }
  if (!base) base = pick(p.theme) || BENEFITS.ai.docs;
  return [p.head || base[0], p.body || base[1]];
}
/* Every point's benefit, in order, with no headline repeated (keyed by the point's position in the draft) */
function painBenefitMap(ctx){
  if (ctx._pbm) return ctx._pbm;
  const used = new Set(), m = new Map();
  progPains(ctx).forEach(p => { const b = painBenefit(ctx, p, used); used.add(b[0]); m.set(p.raw, b); });
  otherPains(ctx).forEach(p => m.set(p.raw, painOutcome(C[p.other], p, courseOutcome(ctx, C[p.other]))));
  return (ctx._pbm = m);
}
/* "Finance · Xero and AutoCount" */
const painTag = p => [p.team, p.tools].filter(Boolean).join('  ·  ');
/* Where a point is answered, as words: "Lesson 4: Advanced Reasoning…", or the course */
function painWhere(ctx, p){
  if (p.course && p.mod){
    const L = (p.course.lessons || p.course.areas)[p.mod - 1];
    return {label: (p.course.lessons ? 'Lesson ' : 'Area ') + p.mod + ': ' + L[0], short: (p.course.lessons ? 'Lesson ' : 'Area ') + p.mod + (ctx.multi ? ' of ' + p.course.short : ''), to: 'md_' + p.course.k + '_' + p.mod};
  }
  if (p.course && ctx.multi) return {label: 'The ' + p.course.short + ' course', short: p.course.short, to: 'course_' + p.course.k};
  return null;
}
/* One sentence for the executive summary: typed in the draft, or built from the first two points */
function heardLine(ctx){
  const typed = String((ctx.S && ctx.S.heard) || '').trim();
  if (typed) return endStop(typed);
  const ps = progPains(ctx).slice(0, 2);
  if (!ps.length) return '';
  const keepCase = p => { const w = (p.text.match(/^[A-Za-z][\w'’-]*/) || [''])[0]; return !w || /[A-Z].*[A-Z]/.test(w) || /\d/.test(w) || (p.tools + ' ' + ctx.client).toLowerCase().split(/\W+/).includes(w.toLowerCase()); };
  const item = p => {
    const t = noStop(keepCase(p) ? p.text : p.text[0].toLowerCase() + p.text.slice(1));
    const where = [p.team, p.tools ? 'in ' + joinList(toolTags(p.tools)) : ''].filter(Boolean).join(', ');
    return t + (where ? ' (' + where + ')' : '');
  };
  return 'Your teams told us: ' + ps.map(item).join('; ') + '.';
}

/* ---------- Lesson detail (v6): the lesson slides brought over from the Consultation Deck Creator ---------- */
const modData = (c, i) => (typeof MODULE_DETAIL !== 'undefined' && MODULE_DETAIL && MODULE_DETAIL[c.k] && MODULE_DETAIL[c.k][i]) || null;
const hasLessonSlides = c => !!(c && typeof MODULE_DETAIL !== 'undefined' && MODULE_DETAIL && MODULE_DETAIL[c.k] && MODULE_DETAIL[c.k].length && (c.lessons || c.areas));
function detailLevel(ctx){ const l = ctx.S && ctx.S.detailLevel; return ['simple', 'detailed', 'technical'].includes(l) ? l : 'detailed'; }
/* The layout a lesson slide uses: the chosen level, where this lesson has content for it */
function lessonMode(ctx, c, i){
  const D = modData(c, i), lvl = detailLevel(ctx);
  if (lvl === 'technical' && D && D.tech && D.tech.length) return 'technical';
  if (lvl !== 'simple' && D && D.learn && D.learn.length) return 'detailed';
  return 'simple';
}
/* The client's own workplace example for a lesson, typed in the draft */
const lessonApp = (ctx, c, n) => String(((ctx.S && ctx.S.modApps) || {})[c.k + ':' + n] || '').trim();
/* Points from the call answered by this lesson */
const lessonPains = (ctx, c, n) => progPains(ctx).filter(p => p.course && p.course.k === c.k && p.mod === n);

/* ---------- Shared slide furniture ---------- */
function header(els, eyebrow, title, dark){
  els.push(fitFirst([].concat(eyebrow), t => T(M, 0.42, dark ? 12.2 : 10.4, 0.3, t, {size:11, b:true, c: dark ? K.PALE : K.BRAND, cs:2}), {lines:1, box:false}, 0.82));
  els.push(fitFirst([].concat(title), t => T(M, 0.72, dark ? 12.2 : 10.75, 0.65, t, {size:28, f:'h', c: dark ? K.WHITE : K.INK}), {lines:1, box:false, min:0.64}, 0.78));
  if (!dark) els.push(IMGEL('lockup', SW - M - 1.36, 0.42, 1.36, 1.36 * 122 / 410));
}
function addFooters(slides, ctx, tocAt, total){
  slides.forEach((s, i) => {
    if (s.slideKey === 'cover' || s._footed || s.detail) return;
    s._footed = true;
    const dark = s.dark;
    const c = dark ? K.C9 : '7C849F';
    const pos = (s.num || i + 1) - 1;
    const back = tocAt >= 0 && pos !== tocAt;
    const prog = ctx.multi ? (ctx.standalone ? ctx.courses.length + '-course programme' : (ctx.aiPath ? 'AI Capability Pathway' : ctx.courses.length + '-course pathway')) : ctx.c1.short;
    const foot = ['verticalinstitute.com   ·   ' + ctx.progFull + '   ·   ' + ctx.client, 'verticalinstitute.com   ·   ' + prog + '   ·   ' + ctx.client, 'verticalinstitute.com   ·   ' + ctx.client];
    s.els.push(fitFirst(foot.map(t => t.toUpperCase()), t => T(M, 7.06, back ? 8.9 : 9.6, 0.26, t, {size:8.5, c, cs:1}), {lines:1, box:false, floor:8.5}, 0.99));
    s.els.push(T(SW - M - 1, 7.06, 1, 0.26, (s.num || i + 1) + ' / ' + total, {size:8.5, c, align:'right'}));
    if (back) backButton(s.els, dark, tocAt);
  });
}
function backButton(els, dark, to){
  const w = 1.42, h = 0.32, x = SW - M - 0.7 - w, y = 7.03;
  els.push(RRECT(x, y, w, h, dark ? K.MID : K.LAV1, h / 2, {line:{c: dark ? '4A66D6' : K.LINE, w:0.75}}));
  els.push(T(x, y, w, h, '←  CONTENTS', {size:8.5, b:true, c: dark ? K.WHITE : K.BRAND, align:'center', valign:'middle', cs:1}));
  els.push(Object.assign(GO(x - 0.03, y - 0.03, w + 0.06, h + 0.06, to, 'Back to contents', (h + 0.06) / 2), {toc:true}));
}
function circleNum(els, n, x, y, d, fill, color, size){
  els.push(OVAL(x, y, d, d, fill));
  els.push(T(x, y, d, d, String(n), {size:size || 12, b:true, c:color, align:'center', valign:'middle'}));
}
function pill(els, text, x, y, w, fill, color, h, size, cs){
  h = h || 0.3;
  els.push(RRECT(x, y, w, h, fill, h / 2));
  els.push(T(x, y, w, h, text, {size:size || 8.5, b:true, c:color, align:'center', valign:'middle', cs: cs == null ? 0.5 : cs}));
}
function table(els, x, y, colW, rows, o){
  o = o || {};
  const padX = o.padX == null ? 0.1 : o.padX, padY = o.padY == null ? 0.04 : o.padY;
  const border = o.border || K.BORDER;
  let cy = y;
  rows.forEach(row => {
    let h = row.h || 0.3;
    let cx = x, ci = 0;
    const cells = [];
    row.cells.forEach(cell => {
      const span = cell.span || 1;
      const w = colW.slice(ci, ci + span).reduce((a, b) => a + b, 0);
      const el = T(cx + padX, cy, w - 2 * padX, 1, cell.content, Object.assign({size:10, c:K.INK, valign:'middle'}, cell.o || {}));
      const need = textHeight(el) + 2 * padY;
      if (need > h) h = need;
      cells.push({cell, el, cx, w});
      cx += w; ci += span;
    });
    cells.forEach(({cell, el, cx, w}) => {
      els.push(RECT(cx, cy, w, h, cell.fill || row.fill || null, {line:{c:border, w:0.5}}));
      el.y = cy + padY; el.h = h - 2 * padY;
      els.push(el);
    });
    cy += h;
  });
  return cy;
}

/* ---------- Slide 1: Cover ---------- */
function coverTheme(ctx){
  const {c1, courses} = ctx;
  if (!ctx.multi) return c1.theme;
  if (ctx.aiPath) return 'The AI Capability Pathway';
  if (ctx.standalone) return courses.length === 2 ? (courses[0].theme + ' & ' + courses[1].theme) : 'Multi-Function Capability Programme';
  return courses.length === 2 ? (courses[0].theme + ' and ' + courses[1].theme) : 'Corporate Capability Pathway';
}
function coverTitles(ctx){
  const theme = coverTheme(ctx);
  return [
    'Corporate Capability Proposal: ' + theme + (ctx.distinctTeams.length === 1 && ctx.team ? ' for the ' + titleCase(ctx.team) : ''),
    'Corporate Capability Proposal: ' + theme,
    'Corporate Capability Proposal'
  ];
}
function coverSub(ctx){
  const {c1, courses, pilotCourse} = ctx;
  const tail = 'with examples drawn from the work ' + ctx.ind.noun + ' handle every day.';
  if (pilotCourse && ctx.multi){
    const othersTxt = joinList(ctx.nonPilotCourses.map(c => courseRef(c, false)));
    const pTeam = pilotCourse.team ? ' for the ' + pilotCourse.team : '';
    return 'Starting with a ' + (pilotCourse.priv ? 'private ' : '') + 'pilot cohort of ' + courseRef(pilotCourse, true) + pTeam + ' before any wider commitment, followed by ' + othersTxt + ' ' + (ctx.standalone ? 'across target functions' : 'as the next stage of the pathway') + ', ' + tail;
  }
  if (pilotCourse) return 'A ' + (pilotCourse.priv ? 'private ' : '') + 'pilot cohort of ' + courseRef(pilotCourse, true) + ' for ' + ctx.teamPhrase + ' before any wider commitment, ' + tail;
  if (ctx.multi){
    const joined = joinList(courses.map(c => courseRef(c, false)));
    return (ctx.standalone ? 'Targeted training in ' + joined + ' across ' + ctx.teamPhrase : cap(joined) + ', structured as one capability pathway for ' + ctx.teamPhrase) + ', ' + tail;
  }
  if (c1.priv) return 'A private class of ' + courseRef(c1, true) + ' for ' + ctx.teamPhrase + ', ' + tail;
  return 'Places in a public run of ' + courseRef(c1, true) + ' for ' + ctx.teamPhrase + ', ' + tail;
}
function slideCover(ctx){
  const {c1, courses, client, S, pilotCourse} = ctx;
  const els = [];
  els.push(IMGEL('icon', M, 0.5, 0.5, 0.5));
  els.push(T(M + 0.62, 0.5, 3, 0.5, 'Vertical Institute', {size:16, b:true, c:K.WHITE, valign:'middle'}));
  const eyePilot = pilotCourse ? '  ·  PILOT & CAPABILITY ROLLOUT' : '';
  els.push(fitFirst(['PREPARED FOR ' + client.toUpperCase() + eyePilot, 'PREPARED FOR ' + client.toUpperCase(), 'TRAINING PROPOSAL' + eyePilot, 'TRAINING PROPOSAL'], t => T(M, 1.55, 6.5, 0.3, t, {size:12, b:true, c:K.PALE, cs:2.5}), {lines:1, box:false}, 0.9));
  els.push(fitFirst(coverTitles(ctx), t => T(M, 1.95, 6.3, 1.9, t, {size:36, f:'h', c:K.WHITE}), {lines:3}, 0.8));
  els.push(fit(T(M, 4.0, 6.4, 1.05, coverSub(ctx), {size:13.5, c:K.E4}), {}));
  els.push(IMGEL('group', 7.45, 1.0, 5.33, 5.33 * 521 / 825));

  const progLines = !ctx.multi ? [c1.name]
    : courses.length === 2 ? [courses[0].short + (courses[0].pilot ? ' (pilot) +' : ' +'), courses[1].short + (courses[1].pilot ? ' (pilot)' : '')]
    : [courses.length + ' courses (' + (ctx.standalone ? 'by function' : 'pathway') + ')', courses.map(c => c.short).join(' · ')];

  const delivPrefix = ctx.mixedDelivery ? 'Private & public' : (ctx.priv ? 'Private class' : 'Public run');
  const delivLine1 = delivPrefix + ' · ' + (ctx.multi ? (ctx.totalSeats + ' seats in total') : paxWord(ctx.pax));
  const delivLine2 = pilotCourse
    ? ('Pilot: ' + pilotCourse.short + (pilotCourse.dateShort ? ' (' + pilotCourse.dateShort + ')' : ''))
    : (ctx.trainingDateFmt ? 'From ' + ctx.trainingDateFmt : (ctx.multi ? (ctx.standalone ? 'Targeted by function' : 'Courses in sequence') : 'Full or half days'));

  const prepLines = [ctx.clientFull];
  if (S.contact) prepLines.push('Attention: ' + S.contact.trim());
  else if (ctx.multiUen && ctx.uens.length > 1) prepLines.push(ctx.uens.length + ' sponsoring entities');
  else if (ctx.distinctTeams.length) prepLines.push('Teams: ' + ctx.distinctTeams.join(', '));

  const progAlt = !ctx.multi ? [c1.short] : [courses.length + ' courses (' + (ctx.standalone ? 'by function' : 'pathway') + ')', courses.slice(0, 3).map(c => c.short).join(' · ') + (courses.length > 3 ? ' +' + (courses.length - 3) : '')];
  const items = [
    ['PREPARED FOR', [prepLines, [client].concat(prepLines.slice(1)), [client]]],
    ['PROGRAMME', [progLines, progAlt, [progAlt[0]]]],
    ['DELIVERY', [[delivLine1, delivLine2], [delivLine1]]],
    ['PREPARED BY', [[ctx.consultant.name, ctx.consultant.title], [ctx.consultant.name]]]
  ];
  const bw = (SW - 2 * M - 3 * 0.25) / 4;
  items.forEach((it, i) => {
    const x = M + i * (bw + 0.25);
    els.push(RRECT(x, 5.2, bw, 1.25, K.MID, 0.12, {line:{c:'4A66D6', w:0.75}}));
    els.push(T(x + 0.25, 5.38, bw - 0.5, 0.25, it[0], {size:9, b:true, c:K.PALE, cs:2}));
    els.push(fitFirst(it[1], ls => T(x + 0.25, 5.66, bw - 0.5, 0.74, ls.map(l => para([run(l, {size:12.5, b:true, c:K.WHITE})])), {}), {lines:3}, 0.8));
  });
  const sw = sfecWords(ctx);
  els.push(fit(T(M, 6.85, 12.2, 0.3, ('verticalinstitute.com   ·   ' + monthYear(ctx.today) + (ctx.sfecOn ? '   ·   ' + sw.short : '')).toUpperCase(), {size:9, c:K.C9, cs:2}), {lines:1, box:false}));
  return {bg:K.BG, els, dark:true, name:'Cover', slideKey:'cover'};
}

/* ---------- Slide 2: Executive Summary ---------- */
function summaryTitles(ctx){
  return summaryTitlesFor(ctx).concat(ctx.pilotCourse ? ['A ' + ctx.pilotCourse.short + ' pilot cohort', 'A pilot-first programme'] : ctx.multi ? ['A ' + ctx.courses.length + '-course programme', 'The proposed programme'] : ['A first ' + ctx.c1.short + ' cohort', 'The proposed programme']);
}
function summaryTitlesFor(ctx){
  const {c1, courses, client, pilotCourse} = ctx;
  if (pilotCourse && ctx.multi) return [
    'A ' + pilotCourse.short + ' pilot and ' + (ctx.standalone ? 'multi-team programme' : 'capability pathway') + ' for ' + client,
    'Starting with a ' + pilotCourse.short + ' pilot for ' + client,
    'A pilot-first capability programme for ' + client];
  if (pilotCourse) return ['A ' + pilotCourse.short + ' pilot cohort for ' + client, 'A pilot ' + pilotCourse.short + ' cohort for ' + client];
  if (ctx.multi) return ctx.standalone
    ? ['Targeted capability courses across ' + poss(client) + ' teams', 'A multi-function training programme for ' + client]
    : ['A ' + courses.length + '-course capability pathway for ' + client, 'A capability pathway for ' + client];
  if (c1.priv) return ['A first ' + c1.short + ' cohort for ' + client, 'A first ' + c1.short + ' cohort'];
  return [c1.short + ' for ' + client + ', in a public run', 'Starting with a public run'];
}
/* The three paragraphs of the executive summary (with **bold** marks), shared by the slide and the mobile reader. */
function summaryParas(ctx){
  const {c1, courses, client, S, ind, pilotCourse} = ctx;
  const who = ctx.teamPhrase;
  const deadline = ctx.isLegacySfec && ctx.sfecOn ? ', completed before **30 November 2026**' : '';
  let p1;
  if (pilotCourse && ctx.multi){
    const pTeam = pilotCourse.team ? ' for the **' + pilotCourse.team + '** (' + paxWord(pilotCourse.pax) + ')' : ' (' + paxWord(pilotCourse.pax) + ')';
    const pDate = pilotCourse.dateFmt ? ', targeted for **' + pilotCourse.dateFmt + '**' : deadline;
    const restList = joinList(ctx.nonPilotCourses.map(c => courseRef(c, false, true) + (c.team ? ' (' + c.team + ')' : '') + (c.dateShort ? ' on ' + c.dateShort : '')));
    p1 = 'We propose a **' + (pilotCourse.priv ? 'private ' : 'public ') + 'pilot cohort** of ' + courseRef(pilotCourse, true, true) + pTeam + pDate + ', as the first stage before any wider commitment, with ' + restList + ' as the ' + (ctx.standalone ? 'targeted courses for your other functions.' : 'next stage of the capability pathway.');
  } else if (pilotCourse){
    const pDate = pilotCourse.dateFmt ? ', targeted for **' + pilotCourse.dateFmt + '**' : deadline;
    p1 = 'We propose a **' + (pilotCourse.priv ? 'private ' : 'public ') + 'pilot cohort** of ' + courseRef(pilotCourse, true, true) + ' for ' + who + pDate + ', positioned as a practical pilot before any wider commitment.';
  } else if (ctx.multi){
    const joined = joinList(courses.map(c => courseRef(c, false, true) + (c.team ? ' for the ' + c.team : '') + (c.dateShort ? ' (' + c.dateShort + ')' : '')));
    p1 = ctx.standalone
      ? 'We propose ' + joined + ', as standalone courses for different functions across ' + client + '.'
      : 'We propose ' + joined + ', structured as a sequential capability pathway for ' + who + ', starting with the first cohort before any wider commitment.';
  } else {
    const tDatePhrase = ctx.trainingDateFmt ? ', targeted for **' + ctx.trainingDateFmt + '**' : deadline;
    p1 = c1.priv
      ? 'We propose a **private class** of ' + courseRef(c1, true, true) + ' for ' + who + tDatePhrase + ', as a first cohort before any wider commitment.'
      : 'We propose that ' + who + ' join a **public run** of ' + courseRef(c1, true, true) + tDatePhrase + ', a practical first step before any wider commitment.';
  }
  // v6: what the client's teams said (typed, or built from their points) takes the place of the industry example
  const heard = heardLine(ctx);
  const p2 = cap(ind.noun) + ' ' + ind.core + '. ' + (heard || leadReality(ctx).text) + ' ' + solutionFor(ctx);
  let p3 = '';
  if (S.priority && S.priority.trim()) p3 += 'As your team shared, the priority is **' + S.priority.trim().replace(/\.$/, '') + '**. ';
  if (pilotCourse){
    p3 += 'Positioning **' + pilotCourse.short + '** as the pilot establishes the framework and internal examples with ' + (pilotCourse.team ? 'the ' + pilotCourse.team : 'the first group') + ' before extending to wider cohorts or later courses.';
  } else {
    p3 += ctx.priv ? 'This first cohort establishes the framework and internal examples for later cohorts to build on. The only immediate decision is the headcount and make-up of this first group.'
                   : 'Starting with a few participants builds familiarity before any wider roll-out, and a private class becomes available from eight participants.';
  }
  if (ctx.multiUen && ctx.uens.length > 1){
    p3 += ' The ' + ctx.uens.length + ' sponsoring entities each have their own cohort and calculator page, using their own SFEC balance.';
  }
  return [p1, p2, p3];
}
/* Cohort upfront payment for the whole proposal at the proposed headcounts. */
function proposalPlan(ctx){ return planFor(ctx, {all:true}); }
function summaryTiles(ctx){
  const {c1, courses, pilotCourse} = ctx;
  const days = daysFor(ctx.totalHrs);
  let t1;
  if (ctx.multi){
    const teamStr = [courses.slice(0, 3).map(c => c.short + (c.pilot ? ' (pilot)' : '') + ': ' + c.pax).join(' · ') + (courses.length > 3 ? ' · …' : ''),
      courses.map(c => c.pax).join(' + ') + ' across the ' + courses.length + ' courses', ctx.diffCoursePax ? 'Headcount differs by course' : 'The same cohort on each course'];
    t1 = [ctx.diffCoursePax ? String(ctx.totalSeats) : String(ctx.pax), ctx.diffCoursePax ? ('Seats across ' + courses.length + ' courses') : 'Participants per cohort', teamStr];
  } else {
    t1 = [String(ctx.pax), (ctx.pax === 1 ? 'Participant' : 'Participants') + (c1.paxConfirmed ? '' : ' (proposed)'), (pilotCourse ? 'Pilot cohort · ' : '') + (c1.priv ? 'Private class ' + c1.venue : 'In a public run')];
  }
  const pd = courses.reduce((s, c) => s + daysFor(c.hrs).d, 0);
  const t2 = [
    hrsText(ctx.totalHrs),
    ctx.multi ? (courses.length + (ctx.wsqAll ? ' WSQ courses' : ' courses') + (ctx.standalone ? ' (by function)' : ' (pathway)')) : (c1.wsq ? 'One WSQ course' : 'One course'),
    ctx.multi ? (pd + ' full days or ' + (2 * pd) + ' half days in total') : days.text
  ];
  const plan = proposalPlan(ctx);
  const lead = ctx.exactMakeup ? 'After funding' : ctx.S.tier === '70' ? 'After 70% funding' : 'After 50% funding';
  const sub = lead + (ctx.sfecOn && !ctx.isLegacySfec ? ' and SFEC' : '') + ', incl. GST' + (ctx.sfecOn && ctx.isLegacySfec ? '. SFEC is claimed back after the course' : '');
  let t3 = [money0(plan.up / 100), 'Upfront for the cohort', sub];
  /* A proposal that spans both SFEC schemes shows the upfront payment split: courses before 1 Dec 2026, then the rest */
  const isEarly = l => !!(l.c && l.c.date && String(l.c.date) < '2026-12-01');
  const early = (plan.lines || []).filter(isEarly), late = (plan.lines || []).filter(l => !isEarly(l));
  if (early.length && late.length){
    const upEarly = early.reduce((s, l) => s + (l.up || 0), 0);
    t3 = [money0(upEarly / 100), 'Upfront for the Nov cohort', 'Dec 2026 onwards: ' + money0((plan.up - upEarly) / 100) + ' · incl. GST'];
  }
  return [t1, t2, t3];
}
function slideSummary(ctx){
  const {c1, courses, pilotCourse} = ctx;
  const els = [];
  header(els, 'EXECUTIVE SUMMARY', summaryTitles(ctx));
  const base = {size:13.2, c:K.INK};
  const [p1, p2, p3] = summaryParas(ctx);
  const box = T(M, 1.66, 7.4, 3.72, [para(rich(p1, base)), para(rich(p2, base)), para(rich(p3, base))], {after:11, mult:1.05});
  els.push(fit(box, {min:0.75}));

  summaryTiles(ctx).forEach((t, i) => {
    const y = 1.62 + i * 1.28;
    const hot = i === 2;
    els.push(RRECT(8.45, y, 4.33, 1.1, hot ? K.HL : K.LAV1, 0.12, hot ? {line:{c:K.PALE, w:1}} : {}));
    els.push(fit(T(8.62, y + 0.14, 1.95, 0.8, t[0], {size: 25, f:'h', c:K.BRAND, valign:'middle'}), {lines:1, box:false, min:0.48}));
    els.push(fit(T(10.62, y + 0.14, 2.05, 0.44, t[1], {size:11.5, b:true, c:K.INK, valign:'bottom'}), {lines:2}));
    els.push(fitFirst([].concat(t[2]), x => T(10.62, y + 0.6, 2.05, 0.44, x, {size:9.5, c:K.MUTED}), {lines:2}, 0.95));
  });

  // Bottom navy band: one row for up to four courses, two rows of three for five or six
  els.push(RRECT(M, 5.55, SW - 2 * M, 1.38, K.NAVY));
  if (ctx.multi){
    const n = courses.length, twoRows = n > 4;
    const perRow = twoRows ? Math.ceil(n / 2) : n;
    const sepW = twoRows ? 0.3 : 0.34;
    const cw = (SW - 2 * M - 0.5 - (perRow - 1) * sepW) / perRow;
    courses.forEach((c, i) => {
      const row = twoRows ? Math.floor(i / perRow) : 0, col = twoRows ? i % perRow : i;
      const x = M + 0.25 + col * (cw + sepW);
      const y0 = twoRows ? 5.62 + row * 0.64 : 5.68;
      const own = !ctx.standalone && c.stageLabel;
      const stage = ctx.standalone ? 'TRACK ' + (i + 1) : own ? c.stageLabel.toUpperCase() : 'STAGE ' + stageNo(ctx, c) + (c.lvl ? ' · LEVEL ' + c.lvl : '');
      const tagCands = own ? [stage] : [(c.pilot ? 'PILOT  ·  ' : '') + stage + (ctx.standalone && c.team ? ' · ' + c.team.toUpperCase() : ''), (c.pilot ? 'PILOT · ' : '') + stage];
      els.push(fitFirst(tagCands, t => T(x, y0, cw, 0.2, t, {size:8.5, b:true, c: (c.pilot || own) ? K.AMB : K.PALE, cs: own ? 0.6 : 1.2}), {lines:1, box:false}, 0.95));
      if (twoRows){
        els.push(fitFirst([c.name, c.short], t => T(x, y0 + 0.17, cw, 0.26, [run(t, {link:c.url})], {size:11.5, f:'h', c:K.WHITE}), {lines:1, box:false, min:0.9}, 0.9));
        els.push(fitFirst([hrsText(c.hrs) + ' · ' + c.pax + ' pax' + (c.dateShort ? ' · from ' + c.dateShort : ''), hrsText(c.hrs) + ' · ' + c.pax + ' pax'],
          t => T(x, y0 + 0.42, cw, 0.2, t, {size:9, c:K.E4}), {lines:1, box:false}, 0.95));
      } else {
        els.push(fitFirst([c.name, c.short], t => T(x, y0 + 0.24, cw, 0.38, [run(t, {link:c.url})], {size: n >= 3 ? 13 : 14.5, f:'h', c:K.WHITE}), {lines:1, box:false, min:0.8}, 0.8));
        const m1 = [hrsText(c.hrs) + '  ·  ' + c.pax + ' pax  ·  ' + c.deliveryShort, hrsText(c.hrs) + '  ·  ' + c.pax + ' pax'];
        els.push(fitFirst(m1, t => T(x, 6.33, cw, 0.24, t, {size:9.5, c:K.E4}), {lines:1, box:false}, 0.95));
        const m2 = [(c.dateShort ? 'From ' + c.dateShort : daysFor(c.hrs).text) + (c.team ? ' · ' + c.team : '') + (c.assignedUen ? ' · ' + c.assignedUen.name : ''),
                    (c.dateShort ? 'From ' + c.dateShort : daysFor(c.hrs).text) + (c.assignedUen ? ' · ' + c.assignedUen.name : ''),
                    c.dateShort ? 'From ' + c.dateShort : daysFor(c.hrs).text];
        els.push(fitFirst(m2, t => T(x, 6.58, cw, 0.22, t, {size:9, b:!!c.dateShort, c: c.dateShort ? K.AMB : K.C9}), {lines:1, box:false}, 0.95));
        if (i < n - 1) els.push(T(x + cw, 5.86, sepW, 0.7, ctx.standalone ? '·' : '→', {size:20, b:true, c:K.PALE, align:'center', valign:'middle'}));
      }
    });
  } else {
    const days = daysFor(c1.hrs);
    const tag = (c1.pilot ? 'PILOT PROGRAMME  ·  ' : '') + (c1.lvl ? 'LEVEL ' + c1.lvl + '  ·  ' : '') + (c1.priv ? 'THE RECOMMENDED COURSE' : 'THE COURSE');
    els.push(fit(T(M + 0.3, 5.72, 5.6, 0.22, tag, {size:9, b:true, c: c1.pilot ? K.AMB : K.PALE, cs:2}), {lines:1, box:false}));
    els.push(fit(T(M + 0.3, 5.98, 5.6, 0.4, [run(c1.name, {link:c1.url})], {size:15, f:'h', c:K.WHITE}), {lines:1, box:false}));
    els.push(fitFirst([hrsText(c1.hrs) + '   ·   ' + c1.pax + ' pax' + (c1.team ? ' (' + c1.team + ')' : '') + '   ·   ' + money0(c1.fee) + ' before funding', hrsText(c1.hrs) + '   ·   ' + c1.pax + ' pax   ·   ' + money0(c1.fee) + ' before funding'],
      t => T(M + 0.3, 6.44, 5.6, 0.26, t, {size:10, c:K.E4}), {lines:1, box:false}, 0.92));
    els.push(LINE(6.55, 5.78, 6.55, 6.73, K.RULE, 1));
    const cx0 = 6.8, cw = (SW - M - 0.25 - cx0 - 0.16) / 2;
    els.push(T(cx0, 5.66, 5.8, 0.22, 'HOW IT RUNS', {size:9, b:true, c:K.PALE, cs:1.5}));
    const cards = [
      [c1.priv ? (c1.pilot ? 'Private pilot class' : 'Private class') : 'Public run', (c1.priv ? days.text + ', ' + c1.venue : (ctx.weekday ? 'Weekday classes' : 'Weekend classes')) + (ctx.trainingDateFmt ? ' · from ' + ctx.trainingDateFmt : '')],
      [c1.wsq ? 'WSQ Statement of Attainment' : 'Vertical Institute certificate', 'At least 75% attendance and the assessment completed']
    ];
    cards.forEach((cd, i) => {
      const x = cx0 + i * (cw + 0.16), y = 5.94;
      els.push(RRECT(x, y, cw, 0.82, K.MID, 0.08));
      els.push(fit(T(x + 0.16, y + 0.07, cw - 0.3, 0.28, cd[0], {size:11, b:true, c:K.WHITE, valign:'middle'}), {lines:1, box:false}));
      els.push(fit(T(x + 0.16, y + 0.36, cw - 0.3, 0.44, cd[1], {size:9.5, c:K.C9}), {lines:2}));
    });
  }
  return {bg:K.WHITE, els, name:'Executive summary', slideKey:'summary', toc:{g:'proposal', t:'Executive summary', d:['What we propose' + (pilotCourse ? ', starting with the ' + pilotCourse.short + ' pilot' : '') + ', and the upfront cost', 'What we propose, and the upfront cost', 'What we propose']}};
}

/* ---------- Slide 3: Why This Matters ---------- */
/* Slide 3 (v6): the client's own points lead, each tagged with the team and tools and paired with what the training
   changes (and, where it is answered by one lesson, a link to that lesson's slide). Industry operating realities fill
   any rows left, so the slide always argues from three points. */
const slideHas = (ctx, k) => !!k && ((ctx.detailKeys && ctx.detailKeys.has(k)) || (ctx.mainKeys && ctx.mainKeys.has(k)));
function painTagEls(els, p, x, y, w, dark){
  const team = p.team ? p.team.toUpperCase() : '';
  const tools = toolTags(p.tools);
  const tSt = {size:8.5, b:true, cs:1}, cSt = {size:8.5, b:true};
  const teamW = team ? measure(tSt, team) / PT + 0.04 : 0;
  const chipW = tools.map(t => measure(cSt, t) / PT + 0.26);
  const need = teamW + (team && tools.length ? 0.14 : 0) + chipW.reduce((a, b) => a + b, 0) + Math.max(0, tools.length - 1) * 0.08;
  if (need > w){
    els.push(fit(T(x, y, w, 0.24, painTag(p).toUpperCase(), Object.assign({c: dark ? K.PALE : K.BRAND, valign:'middle'}, tSt)), {lines:1, box:false, min:0.85}));
    return;
  }
  let cx = x;
  if (team){ els.push(T(cx, y, teamW + 0.1, 0.24, team, Object.assign({c: dark ? K.PALE : K.BRAND, valign:'middle'}, tSt))); cx += teamW + 0.14; }
  tools.forEach((t, k) => {
    els.push(RRECT(cx, y, chipW[k], 0.24, dark ? K.MID : K.WHITE, 0.12, {line:{c: dark ? K.RULE : K.LINE, w:0.75}}));
    els.push(T(cx, y, chipW[k], 0.24, t, Object.assign({c: dark ? K.WHITE : K.INK, align:'center', valign:'middle'}, cSt)));
    cx += chipW[k] + 0.08;
  });
}
function slideWhy(ctx){
  const {client, ind, pilotCourse} = ctx;
  const els = [];
  header(els, 'WHY THIS MATTERS', ['Where ' + ctx.prog + ' can make the greatest difference', 'Where this training can make the greatest difference']);
  const pains = progPains(ctx).slice(0, 3);
  let realThemes;
  if (!pains.length) realThemes = leadReality(ctx).why;
  else {
    const skip = new Set(pains.map(p => p.theme)), heads = new Set(pains.map(p => painBenefitMap(ctx).get(p.raw)[0]));
    realThemes = themesFor(ctx).filter(t => ind.real[t] && !skip.has(t) && !heads.has((benefitFor(ctx, t) || [])[0])).slice(0, 3 - pains.length);
  }
  const rows = pains.map(p => ({p})).concat(realThemes.map(t => ({t})));
  const mixed = pains.length > 0 && realThemes.length > 0;
  const sub = !pains.length ? 'Three characteristics common to ' + ind.noun + ' shape where this training can help ' + client + ' most.'
    : mixed ? 'What your teams told us, and what is typical for ' + ind.noun + ', shape where this training can help ' + client + ' most.'
    : 'What your teams told us shapes where this training can help ' + client + ' most.';
  els.push(fit(T(M, 1.4, 11.8, 0.3, sub, {size:12, c:K.MUTED}), {lines:1, box:false}));
  const lx = M, lw = 5.75, rx = 6.95, rw = SW - M - rx;
  const labelL = (y, t) => els.push(T(lx + 0.62, y, lw - 0.6, 0.22, t, {size:8.5, b:true, c:K.BRAND, cs:1.5}));
  labelL(1.86, pains.length ? 'WHAT YOUR TEAMS TOLD US' : 'INDUSTRY OPERATING REALITIES');
  els.push(fit(T(rx, 1.86, rw, 0.22, ('How ' + client + ' can benefit').toUpperCase(), {size:8.5, b:true, c:K.BRAND, cs:1.5}), {lines:1, box:false}));
  const gap = 0.16, y0 = 2.16, yMax = 6.52, subGap = mixed ? 0.36 : 0;
  const rh = Math.min(1.36, (yMax - y0 - gap * (rows.length - 1) - subGap) / Math.max(1, rows.length));
  let y = y0;
  rows.forEach((row, i) => {
    if (row.t && mixed && i === pains.length){ labelL(y + 0.04, 'INDUSTRY OPERATING REALITIES'); y += subGap; }
    if (row.p){
      const p = row.p, where = painWhere(ctx, p), [bh, bb] = painBenefitMap(ctx).get(p.raw);
      els.push(RRECT(lx, y, lw, rh, K.HL, 0.12, {line:{c:K.PALE, w:1}}));
      circleNum(els, i + 1, lx + 0.2, y + rh / 2 - 0.18, 0.36, K.NAVY, K.WHITE, 11);
      const hasTag = !!(p.team || p.tools);
      els.push(fit(T(lx + 0.75, y + 0.1, lw - 0.95, rh - (hasTag ? 0.48 : 0.2), p.text, {size:12, c:K.INK, valign:'middle'}), {}));
      if (hasTag) painTagEls(els, p, lx + 0.75, y + rh - 0.36, lw - 0.95, false);
      els.push(CHEV(6.5, y + rh / 2 - 0.2, 0.17, 0.4, K.BRAND));
      els.push(RRECT(rx, y, rw, rh, K.WHITE, 0.12, {line:{c:K.LINE, w:1}}));
      const linked = where && slideHas(ctx, where.to);
      const bt = T(rx + 0.25, y + 0.1, rw - 0.5, rh - (where ? 0.46 : 0.2), [para([run(bh, {size:13.5, b:true, c:K.INK})], {after:4})].concat(bb ? [para([run(bb, {size:10.5, c:K.MUTED})])] : []), {valign:'middle'});
      els.push(fit(bt, {}));
      if (where){
        els.push(fit(T(rx + 0.25, y + rh - 0.36, rw - 0.5, 0.26, (linked ? where.label + '  →' : 'Covered in ' + where.label), {size:9.5, b:true, c: linked ? K.BRAND : K.MUTED, valign:'middle'}), {lines:1, box:false, min:0.85}));
        if (linked) els.push(GO(rx, y, rw, rh, where.to, 'Open ' + where.label, 0.12));
      }
    } else {
      const th = row.t;
      els.push(RRECT(lx, y, lw, rh, K.LAV1));
      circleNum(els, i + 1, lx + 0.2, y + rh / 2 - 0.18, 0.36, K.BRAND, K.WHITE, 11);
      els.push(fit(T(lx + 0.75, y + 0.12, lw - 0.95, rh - 0.24, ind.real[th], {size:12, c:K.INK, valign:'middle'}), {}));
      els.push(CHEV(6.5, y + rh / 2 - 0.2, 0.17, 0.4, K.PALE));
      const b = benefitFor(ctx, th);
      els.push(RRECT(rx, y, rw, rh, K.WHITE, 0.12, {line:{c:K.LINE, w:1}}));
      const bt = T(rx + 0.25, y + 0.12, rw - 0.5, rh - 0.24, [para([run(b[0], {size:13.5, b:true, c:K.INK})], {after:4}), para([run(b[1], {size:10.5, c:K.MUTED})])], {valign:'middle'});
      els.push(fit(bt, {}));
    }
    y += rh + gap;
  });
  const footCopy = pilotCourse
    ? ('This is why we suggest viewing the pilot (' + pilotCourse.short + ') as a first step rather than a one-off programme: an approach proven with the first group extends to the second' + (ctx.multi ? (ctx.standalone ? ', and across other functions,' : ', and on to the next course in the pathway,') : '') + ' without redesigning the programme.')
    : 'This is why we suggest viewing the first cohort as a first step rather than a one-off programme: the habits and examples it builds carry into the cohorts that follow.';
  els.push(fit(T(M, 6.64, SW - 2 * M, 0.34, footCopy, {size:10.2, i:true, c:K.MUTED}), {lines:2}));
  return {bg:K.WHITE, els, name:'Why this matters', slideKey:'why', toc:{g:'proposal', t:'Why this matters', d: pains.length ? ['What your teams told us, and how ' + client + ' can benefit', 'What your teams told us'] : ['Where ' + ctx.prog + ' can help ' + client + ' most', 'Where this training can help most']}};
}

/* ---------- Slide 4: Capability Pathway / Standalone Multi-Course Overview ---------- */
/* v6: a "Lessons" button on a course card, opening that course's detail slide. Returns the width it takes from the right. */
function lessonsPill(els, c, xr, y, h, dark){
  const t = (c.lessons ? 'LESSONS' : 'LEARNING AREAS') + '  →', st = {size:8, b:true, cs:1};
  const w = measure(st, t) / PT + 0.3;
  els.push(RRECT(xr - w, y, w, h, dark ? K.PALE : K.BRAND, h / 2));
  els.push(T(xr - w, y, w, h, t, Object.assign({c: dark ? K.NAVY : K.WHITE, align:'center', valign:'middle'}, st)));
  els.push(GO(xr - w, y, w, h, 'course_' + c.k, 'Open the ' + c.name + ' ' + (c.lessons ? 'lessons' : 'learning areas'), h / 2));
  return w + 0.12;
}
/* ---------- Slide 4 (v7): Proposed Pathway For Your Organization ----------
   One picture of who goes where, brought over from the Consultation Deck Creator. Each team follows the courses it is
   on, in the order the courses are listed. Teams on the same course at the same step share a block; where their next
   courses differ the pathway branches, and blocks in one column can run at the same time. A block's height follows
   its headcount. It replaces both the capability pathway cards and the standalone programme tracks.
   Teams come from each course's "Team being trained": one name, a list ("Admin, HR and QS") or a list with headcounts
   ("Finance 4, HR 3, Ops 5"), read by teamParts() in the context builder. */
const PW_COL = {genai:'7146CE', gaicc:'7146CE', wfa:'38428C', da:'D85745', ada:'D85745', pbi:'168A96', ds:'168A96', ux:'34836A', dm:'D86B35', seo:'C75D3C',
  ga4:'D86B35', gyt:'C75D3C', ecom:'D86B35', cyber:'38428C', carbon:'34836A', chain:'0054FF'};
const pwCol = c => PW_COL[c.k] || '38428C';
const pwHx = c => [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
const pwHex = a => a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
const pwTint = (c, t) => pwHex(pwHx(c).map(v => 255 - (255 - v) * t));
function pwLum(c){ return pwHx(c).reduce((a, v, i) => { v /= 255; v = v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); return a + v * [0.2126, 0.7152, 0.0722][i]; }, 0); }
const PW_DEEP = {};
/* The colour darkened just enough to carry white text, or to be read as small coloured text on a pale tint (4.5:1) */
function pwDeep(c){
  if (PW_DEEP[c]) return PW_DEEP[c];
  let d = c;
  for (let i = 0; i < 14 && 1.05 / (pwLum(d) + 0.05) < 5; i++) d = pwHex(pwHx(d).map(v => v * 0.93));
  return (PW_DEEP[c] = d);
}
/* One block per course in the proposal. A team's steps are the courses that name it, in the order they are listed; a
   line joins each step to the next. A course sits one column after the latest course any of its teams comes from, so
   every line runs left to right. */
/* A pathway plotted by hand in the builder: which course each one follows ('' starts a track) and the order of the
   blocks. Returns null while the pathway is still drawn from the team names. Links to a course that has since been
   removed pass to the course before it; a loop is cut. */
function pathPlanFor(S, ids){
  const plan = S && S.pathPlan;
  if (!plan || !plan.after) return null;
  const has = new Set(ids), after = {};
  ids.forEach(id => {
    let p = plan.after[id] || '', guard = 0;
    while (p && !has.has(p) && guard++ < 20) p = plan.after[p] || '';
    after[id] = p && p !== id && has.has(p) ? p : '';
  });
  ids.forEach(id => { const seen = new Set([id]); let p = after[id]; while (p){ if (seen.has(p)){ after[id] = ''; break; } seen.add(p); p = after[p]; } });
  const order = (plan.order || []).filter(id => has.has(id));
  ids.forEach(id => { if (!order.includes(id)) order.push(id); });
  return {after, order};
}
function pwGraph(ctx){
  const plan = pathPlanFor(ctx.S, ctx.courses.map(c => c.slotId));
  const nodes = ctx.courses.map(c => ({c, wt:Math.max(0, c.pax), layer:0, ins:[], outs:[], enders:[],
    names:(c.parts || []).map(p => p.name ? cap(p.name) : '').filter((v, i, a) => v && a.indexOf(v) === i)}));
  const units = [], seen = {};
  ctx.courses.forEach((c, i) => (c.parts || []).forEach(p => {
    let u = seen[p.key];
    if (!u){ u = seen[p.key] = {key:p.key, name:p.name, steps:[]}; units.push(u); }
    u.steps.push({n:nodes[i], p});
  }));
  nodes.forEach((n, i) => { n.idx = plan ? plan.order.indexOf(n.c.slotId) : i; });
  if (plan){
    // plotted by hand: each course follows the one it was dropped on
    const byId = {};
    nodes.forEach(n => { byId[n.c.slotId] = n; });
    nodes.slice().sort((a, b) => a.idx - b.idx).forEach(n => { const p = byId[plan.after[n.c.slotId]]; if (p){ p.outs.push(n); n.ins.push(p); } });
  } else units.forEach(u => u.steps.forEach((s, i) => {
    const nx = u.steps[i + 1];
    if (!nx) s.n.enders.push({u, p:s.p});
    else if (!s.n.outs.includes(nx.n)){ s.n.outs.push(nx.n); nx.n.ins.push(s.n); }
  }));
  const lay = n => n.layer_ != null ? n.layer_ : (n.layer_ = n.ins.length ? 1 + Math.max(...n.ins.map(lay)) : 0);
  nodes.forEach(n => { n.layer = lay(n); });
  const D = 1 + Math.max(0, ...nodes.map(n => n.layer));
  const layers = Array.from({length:D}, () => []);
  nodes.forEach(n => { n.kind = 0; n.par = n.ins.filter(p => p.layer === n.layer - 1); layers[n.layer].push(n); });
  const edges = [];
  nodes.forEach(n => {
    n.outs.forEach(to => {
      // a line that skips a column keeps a lane of its own there, so it never crosses a block
      const via = [];
      let prev = n;
      for (let l = n.layer + 1; l < to.layer; l++){ const d = {kind:1, idx:to.idx, par:[prev]}; layers[l].push(d); via.push(d); prev = d; }
      if (via.length) to.par.push(prev);
      edges.push({from:n, to, via});
    });
    // a team whose pathway ends here, while others carry on
    if (n.outs.length && n.enders.length){
      n.end = {kind:2, idx:n.idx, par:[n], names:n.enders.map(e => e.u.name ? cap(e.u.name) : '').filter(Boolean),
        pax:n.enders.every(e => e.p.exact) ? Math.round(n.enders.reduce((a, e) => a + e.p.w, 0)) : 0};
      layers[n.layer + 1].push(n.end);
    }
  });
  const lone = layers.every(l => l.length === 1), parallel = !edges.length && nodes.length > 1;
  const split = nodes.some(n => n.outs.length > 1 || n.end);
  return {nodes, layers, edges, cols:D, units, lone, parallel, split, plotted: !!plan, order: nodes.slice().sort((a, b) => a.idx - b.idx)};
}
/* Heights and positions. A block is as tall as its headcount asks and never shorter than it needs to be read. What
   follows a block sits to its right, starting level with its top, and stacks downwards. */
function pwLayout(P, H, gap){
  const END = 0.34, LANE = 0.2;
  let minH = 0.7;
  const flow = (u, g) => {
    let ext = 0;
    P.layers.forEach((items, i) => {
      items.forEach(it => { it.h = it.kind === 0 ? Math.max(minH, it.wt * u) : it.kind === 1 ? LANE : END; it.want = i ? Math.min(...it.par.map(p => p.y)) : 0; });
      items.sort((a, b) => (a.want - b.want) || (a.kind - b.kind) || (a.idx - b.idx));
      let cy = 0;
      items.forEach(it => { it.y = Math.max(it.want, cy); cy = it.y + it.h + g; });
      ext = Math.max(ext, cy - g);
    });
    return ext;
  };
  while (flow(0, gap) > H + 1e-6 && minH > 0.34) minH -= 0.04;
  // a pathway that never branches keeps moderate blocks; one that branches may use the whole height
  const top = Math.max(1e-6, ...P.nodes.map(n => n.wt));
  let lo = 0, hi = (P.lone ? Math.min(H, 2.5) : H) / top;
  if (flow(hi, gap) <= H) lo = hi;
  else for (let i = 0; i < 40; i++){ const mid = (lo + hi) / 2; if (flow(mid, gap) <= H) lo = mid; else hi = mid; }
  let used = flow(lo, gap), f = 1;
  if (used > H + 1e-6){
    f = H / used;
    P.layers.forEach(items => items.forEach(it => { it.y *= f; it.h *= f; }));
    used = H;
  }
  return {used, f};
}
function pwArrow(els, x1, y, x2, c){
  els.push(LINE(x1, y, x2 - 0.07, y, c, 1.6));
  els.push(CHEV(x2 - 0.13, y - 0.085, 0.13, 0.17, c));
}
/* A white tick in a circle of diameter d at (x, y), drawn as lines so every export shows it */
function pwTick(els, x, y, d){
  const w = Math.max(1.1, d * 5.2);
  els.push(OVAL(x, y, d, d, K.GREEN));
  els.push(LINE(x + 0.27 * d, y + 0.53 * d, x + 0.44 * d, y + 0.69 * d, K.WHITE, w));
  els.push(LINE(x + 0.42 * d, y + 0.70 * d, x + 0.74 * d, y + 0.34 * d, K.WHITE, w));
}
/* One block of the pathway: a course, the teams on it and its headcount. It shows more as it grows taller. */
function pwBlock(els, peeks, ctx, n, x, y, w, h){
  const c = n.c, col = pwCol(c), dk = pwDeep(col), solid = n.layer === 0;
  const ink = solid ? K.WHITE : K.INK, acc = solid ? K.WHITE : dk, mut = solid ? K.E4 : K.MUTED;
  const hAll = h, r = Math.min(0.14, hAll / 4);
  // v2.1: a milestone badge ("To be completed before 30 Nov 2026") across the foot of the block; the content keeps above it
  const dlH = c.deadline && hAll >= 0.9 ? 0.38 : 0;
  h = hAll - dlH;
  const on = slideHas(ctx, 'course_' + c.k), pad = Math.min(0.2, h * 0.22);
  const what = c.lessons ? 'lessons' : 'learning areas';
  els.push(RRECT(x, y, w, hAll, solid ? dk : pwTint(col, 0.1), r));
  if (dlH){
    const bx = x + 0.12, bw = w - 0.24, by = y + hAll - 0.34, bh = 0.26;
    els.push(RRECT(bx, by, bw, bh, K.AMB, 0.13, {line:{c: solid ? K.WHITE : 'E0B84A', w:1}}));
    const dot = 0.11;
    els.push(OVAL(bx + 0.1, by + (bh - dot) / 2, dot, dot, K.RED));
    els.push(fit(T(bx + 0.25, by, bw - 0.31, bh, c.deadline.toUpperCase(), {size:8, b:true, c:K.GOLD, cs:0.2, valign:'middle'}), {lines:1, box:false, min:0.6}));
  }
  const hasIcon = !!IMG['ci_' + c.k];
  const badge = (bx, by, d) => {
    if (!hasIcon) return;
    if (solid){ els.push(RRECT(bx, by, d, d, K.WHITE, d * 0.18)); els.push(IMGEL('ci_' + c.k, bx + d * 0.05, by + d * 0.05, d * 0.9, d * 0.9)); }
    else els.push(IMGEL('ci_' + c.k, bx, by, d, d));
  };
  const who = joinList(n.names);
  const tag = !ctx.standalone && c.stageLabel ? c.stageLabel : c.pilot ? 'Pilot' + (c.lvl ? ' · Level ' + c.lvl : '') : ctx.standalone ? 'Track ' + (c.idx + 1) + (c.lvl ? ' · Level ' + c.lvl : '') : 'Stage ' + stageNo(ctx, c) + (c.lvl ? ' · Level ' + c.lvl : '');
  const when = c.dateShort ? 'from ' + c.dateShort : c.deliveryShort;
  const nameC = solid ? K.WHITE : dk;
  let spot = null, footOn = false;
  const narrow = w < 3.3;
  // the pilot wears its tag on the top edge, whatever the block's size
  const pilotTag = () => { if (!c.pilot) return; els.push(RRECT(x + w - 0.84, y - 0.11, 0.68, 0.24, K.AMB, 0.12, {line:{c:K.WHITE, w:1.5}})); els.push(T(x + w - 0.84, y - 0.11, 0.68, 0.24, 'PILOT', {size:9, b:true, c:K.GOLD, cs:0.8, align:'center', valign:'middle'})); };
  if (h >= 1.15 && !(narrow && h < 1.6)){
    const bd = h >= 1.5 ? 0.46 : 0.4, numW = narrow ? 0 : 0.95;
    badge(x + pad, y + pad, bd);
    let cy;
    if (narrow){
      // a narrow column: the headcount sits beside the icon and the name takes the full width beneath
      els.push(T(x + pad + (hasIcon ? bd + 0.1 : 0), y + pad, w - 2 * pad - (hasIcon ? bd + 0.1 : 0), bd, [run(String(c.pax), {size:19, f:'h', c:acc}), run(' PAX', {size:9, b:true, c:mut, cs:1.2})], {align:'right', valign:'middle'}));
      const two = h >= 1.9, nh = two ? 0.5 : Math.min(0.28, h - 2 * pad - bd - 0.08);
      els.push(two ? fitFirst(w >= 2.2 ? [c.name, c.short] : [c.short], t => T(x + pad, y + pad + bd + 0.08, w - 2 * pad, nh, t, {size:13.5, f:'h', c:nameC, valign:'middle'}), {lines:2}, 0.85)
        : fit(T(x + pad, y + pad + bd + 0.08, w - 2 * pad, nh, c.short, {size:13.5, f:'h', c:nameC}), {lines:1, box:false}));
      cy = y + pad + bd + 0.08 + nh + 0.07;
    } else {
      const nx = x + pad + (hasIcon ? bd + 0.14 : 0), nw = w - (nx - x) - pad - numW;
      els.push(fitFirst([c.name, c.short], t => T(nx, y + pad - 0.03, nw, bd + 0.06, t, {size:15, f:'h', c:nameC, valign:'middle'}), {lines:2}, 0.8));
      els.push(T(x + w - pad - numW, y + pad - 0.08, numW, 0.42, String(c.pax), {size:24, f:'h', c:acc, align:'right', valign:'middle'}));
      els.push(T(x + w - pad - numW, y + pad + 0.32, numW, 0.2, 'PAX', {size:9, b:true, c:mut, cs:1.4, align:'right', valign:'middle'}));
      cy = y + pad + bd + (h >= 1.5 ? 0.14 : 0.08);
    }
    // who goes comes first; the buttons and then the hours line join as the block grows
    const whoH = who ? 0.2 : 0;
    footOn = h >= 1.9 && y + h - 0.5 - cy >= whoH;
    const foot = footOn ? 0.5 : pad;
    if (y + h - foot - cy >= 0.3 + whoH){
      const lx = x + pad;
      const st = {size:10, b:true}, hours = hrsText(c.hrs), full = hours + '  ·  ' + when, room = x + w - pad - lx;
      const wOf = t => measure(st, t) / PT + 0.04, feeT = money0(c.fee) + ' before funding';
      // hours, the start date and the fee when all three fit; a start date outranks the fee, the fee outranks the class type
      const pick = [[full, feeT]].concat(c.dateShort ? [] : [[hours, feeT]], [[full, ''], [hours, '']]).find(([a, b]) => wOf(a) + (b ? wOf(b) + 0.15 : 0) <= room) || [hours, ''];
      if (pick[1]) els.push(T(x + w - pad - wOf(pick[1]), cy, wOf(pick[1]), 0.24, pick[1], Object.assign({c:acc, align:'right', valign:'middle'}, st)));
      els.push(fit(T(lx, cy, room - (pick[1] ? wOf(pick[1]) + 0.15 : 0), 0.24, pick[0], Object.assign({c:acc, valign:'middle'}, st)), {lines:1, box:false}));
      cy += 0.3;
    }
    const space = y + h - foot - cy;
    if (space >= 0.2 && who) els.push(fit(T(x + pad, cy, w - 2 * pad - (!footOn && !narrow ? 0.34 : 0), space, [run('Who goes: ', {b:true, c:ink}), run(who)], {size:11, c:mut}), {lines: Math.max(1, Math.floor(space / 0.19))}));
    if (footOn){
      // lessons on the left, the course overview on the right
      let used = 0;
      if (on){
        const t = (w < 2.5 && !c.lessons ? 'AREAS' : what.toUpperCase()) + '  →', pw = measure({size:9, b:true, cs:1}, t) / PT + 0.34;
        pill(els, t, x + pad, y + h - 0.44, pw, solid ? K.WHITE : dk, solid ? dk : K.WHITE, 0.3, 9, 1);
        els.push(GO(x + pad, y + h - 0.44, pw, 0.3, 'course_' + c.k, 'Open the ' + c.name + ' ' + what, 0.15));
        used = pw + 0.1;
      }
      const left = w - 2 * pad - used;
      if (left >= 0.3) spot = peekBadge(els, x + w - pad, y + h - 0.44, 0.3, left, solid, ctx.hover, c.url);
    } else if (ctx.hover){
      if (!narrow) spot = peekBadge(els, x + w - pad, y + h - pad - 0.26, 0.26, 0.26, solid, true, c.url);
    } else if (on && !narrow){
      els.push(T(x + w - pad - 0.26, y + h - pad - 0.26, 0.26, 0.26, '→', {size:13, b:true, c:acc, align:'center', valign:'middle'}));
    }
  } else {
    // a short block: one row with the course, who goes and the headcount
    const two = h >= 0.6, bd = Math.max(0.2, Math.min(0.4, h - 2 * pad)), icon = hasIcon && w >= 2.2;
    if (icon) badge(x + pad, y + (h - bd) / 2, bd);
    const tx = x + pad + (icon ? bd + 0.12 : 0);
    const px = String(c.pax), pw = Math.max(0.34, 0.16 * px.length + 0.14), mk = Math.min(0.24, h - 0.12), sub = who;
    const draw = aw => {
      const tw = w - (tx - x) - pad - pw - aw, out = [];
      let ok = true;
      if (two){
        const one = fitFirst([c.name, c.short], t => T(tx, y + h / 2 - (sub ? 0.3 : 0.15), tw, 0.3, t, {size:12.5, f:'h', c:nameC, valign: sub ? 'bottom' : 'middle'}), {lines:1, box:false}, 0.8);
        if (one._fits && !one._cut) out.push(one);
        else if (h >= 0.95){
          // a long name in a narrow column takes two lines
          const el = fit(T(tx, y + h / 2 - (sub ? 0.4 : 0.22), tw, 0.44, c.short, {size:12, f:'h', c:nameC, valign: sub ? 'bottom' : 'middle'}), {lines:2});
          ok = el._fits; out.push(el);
        } else { ok = false; out.push(one); }
        if (sub) out.push(fit(T(tx, y + h / 2 + (out[0] === one ? 0.02 : 0.07), tw, 0.24, sub, {size:9.5, c:mut}), {lines:1, box:false}));
      } else {
        const el = fit(T(tx, y, tw, h, [run(c.short, {b:true, c:nameC}), run(sub ? '   ' + sub : '', {c:mut})], {size:10, valign:'middle'}), {lines:1, box:false});
        ok = el._fits && !el._cut; out.push(el);
      }
      return {ok, out};
    };
    // the marker at the right gives way when the name needs its room
    let aw = ctx.hover ? (w >= 2.2 ? mk + 0.08 : 0) : (on ? 0.26 : 0), D = draw(aw);
    if (!D.ok && aw){ const D2 = draw(0); if (D2.ok){ D = D2; aw = 0; } }
    D.out.forEach(el => els.push(el));
    els.push(T(x + w - pad - aw - pw, y, pw, h, px, {size: two ? 16 : 11.5, f:'h', c:acc, align:'right', valign:'middle'}));
    if (aw && ctx.hover) spot = peekBadge(els, x + w - pad, y + (h - mk) / 2, mk, mk, solid, true, c.url);
    else if (aw) els.push(T(x + w - pad - 0.22, y, 0.22, h, '→', {size:12, b:true, c:acc, align:'center', valign:'middle'}));
  }
  pilotTag();
  if (ctx.hover) peeks.push({x, y, w, h:hAll, spot, card:pathwayPeek(ctx, c, tag)});
  else if (on && !footOn) els.push(GO(x, y, w, hAll, 'course_' + c.k, 'Open the ' + c.name + ' ' + what, r));
}
function slidePathway(ctx){
  const {courses, pilotCourse, standalone} = ctx;
  const els = [], peeks = [], n = courses.length, CWI = SW - 2 * M;
  const P = pwGraph(ctx);
  const eye = standalone ? 'MULTI-FUNCTION TRAINING PROGRAMME' : (ctx.aiPath ? 'YOUR AI CAPABILITY PATHWAY' : 'YOUR CAPABILITY PATHWAY');
  header(els, [eye + '  ·  WHO GOES WHERE', eye], ['Proposed Pathway For Your Organization', 'Proposed Pathway']);
  const lead = pilotCourse ? 'The ' + pilotCourse.short + ' pilot cohort comes first, before any wider commitment. ' : '';
  const body = P.lone ? 'Each course builds on the one before it, on the same accreditation and funding model.'
    : P.parallel ? 'Each team takes the course that fits its work, and the courses can run at the same time.'
    : !P.split ? 'Each track builds from one course to the next, and the tracks can run at the same time.'
    : 'Teams that share a course train together. Where their next course differs the pathway splits, and those tracks can run at the same time.';
  const tall = ' Taller blocks mean more participants.';
  els.push(fitFirst([lead + body + tall, lead + body, body], t => T(M, 1.36, 12.2, 0.5, t, {size:12, c:K.MUTED}), {lines:2}, 0.88));

  // under the picture: the totals, then the question to settle together
  const by = 6.14, bh = 0.68, noteY = by - 0.42, bottom = noteY - 0.08;
  const teams = P.units.filter(u => u.name).length;
  const note = [run(ctx.totalSeats + ' training places', {b:true, c:K.INK}), run(' across ' + n + ' courses' + (teams > 1 ? ' and ' + teams + ' teams' : '') +
    (courses.some(c => !c.paxConfirmed) ? '. Headcounts are proposed until you confirm them.' : '. Headcounts as confirmed.'))];
  els.push(fit(T(M, noteY, CWI, 0.28, note, {size:11.5, c:K.MUTED, valign:'middle'}), {lines:1, box:false}));
  els.push(RRECT(M, by, CWI, bh, K.NAVY, 0.12));
  const ask = P.lone ? 'Does this pathway fit how your team works? The order and the headcount can still change before enrolment.'
    : P.parallel ? 'Does this fit how your teams work? These courses can run at the same time.'
    : !P.split ? 'Does this pathway fit how your teams work? The tracks can run at the same time.'
    : 'Does this pathway fit how your teams work? Tracks that split can run at the same time.';
  els.push(fit(T(M + 0.35, by, CWI - 0.7, bh, ask, {size:14, f:'h', c:K.WHITE, valign:'middle'}), {lines:2}));

  const labY = 1.98, top = 2.3, Hh = bottom - top, gy = 0.14;
  if (P.parallel){
    // separate teams, separate courses: the tracks stand side by side, each as tall as its headcount
    const gt = n > 4 ? 0.26 : 0.36, tw = Math.min(4.3, (CWI - (n - 1) * gt) / n), tx0 = M + (CWI - (n * tw + (n - 1) * gt)) / 2;
    const most = Math.max(1, ...P.nodes.map(nd => nd.wt)), same = P.nodes.every(nd => nd.wt === P.nodes[0].wt);
    P.order.forEach((nd, i) => {
      const x = tx0 + i * (tw + gt), h = Math.min(Hh, (same ? Math.min(Hh, 2.6) : Math.max(1.65, Hh * nd.wt / most)) + (nd.c.deadline ? 0.38 : 0));
      circleNum(els, i + 1, x, labY, 0.24, K.NAVY, K.WHITE, 9);
      els.push(T(x + 0.32, labY, tw - 0.32, 0.24, 'TRACK ' + (i + 1), {size:9, b:true, c:K.MUTED, cs:1.6, valign:'middle'}));
      pwBlock(els, peeks, ctx, nd, x, top, tw, h);
    });
    return {bg:K.WHITE, els, peeks, name:'Proposed pathway', slideKey:'pathway', toc:{g:'programme', t:'Proposed Pathway For Your Organization', d:[courses.map(c => c.short + (c.pilot ? ' (pilot)' : '')).join(' · '), n + ' courses']}};
  }
  // the columns are steps; blocks in one column can run at the same time
  const D = P.cols, gx = D > 4 ? 0.36 : 0.46;
  const cw = Math.min(4.3, (CWI - (D - 1) * gx) / D), W = D * cw + (D - 1) * gx, x0 = M + (CWI - W) / 2;
  const steps = ['START HERE', 'THEN', 'NEXT', 'LATER'];
  for (let d = 0; d < D; d++){
    const x = x0 + d * (cw + gx);
    circleNum(els, d + 1, x, labY, 0.24, d ? K.LAV2 : K.NAVY, d ? K.NAVY : K.WHITE, 9);
    els.push(T(x + 0.32, labY, cw - 0.32, 0.24, steps[Math.min(d, steps.length - 1)], {size:9, b:true, c:K.MUTED, cs:1.6, valign:'middle'}));
  }
  const L = pwLayout(P, Hh, gy), y0 = top + Math.max(0, (Hh - L.used) / 2);
  const colX = l => x0 + l * (cw + gx);
  /* A line from the right edge of one item to the left edge of the next. Where the two overlap in height it runs
     straight across; otherwise it steps up or down in the gap between the columns. f and t: {top, h} (h 0 for a point). */
  const link = (fx, f, t, head, dash) => {
    const tx = fx + gx, mx = fx + gx / 2, wd = dash ? 1.2 : 1.6, start = fx + (f.h ? 0.06 : 0), end = t.h ? tx - 0.05 : tx - (dash ? 0.08 : 0);
    const fi = Math.min(0.2, f.h / 2), ti = Math.min(0.2, t.h / 2), mid = t.top + t.h / 2;
    const lo = Math.max(f.top + fi, t.top + ti), hi = Math.min(f.top + f.h - fi, t.top + t.h - ti);
    const seg = (x1, y1, x2, y2, tip) => { if (tip && head) pwArrow(els, x1, y1, x2, K.PALE); else els.push(LINE(x1, y1, x2, y2, K.PALE, wd, !!dash)); };
    if (lo <= hi + 1e-6){ const y = Math.max(lo, Math.min(hi, mid)); seg(start, y, end, y, true); return y; }
    const sy = Math.max(f.top + fi, Math.min(f.top + f.h - fi, mid));
    seg(start, sy, mx, sy); seg(mx, sy, mx, mid); seg(mx, mid, end, mid, true);
    return mid;
  };
  const span = it => ({top:y0 + it.y, h:it.h});
  P.edges.forEach(e => {
    let fx = colX(e.from.layer) + cw, f = span(e.from);
    e.via.forEach((d, i) => {
      // the lane across a column this line skips
      const dx = colX(e.from.layer + 1 + i), y = link(fx, f, {top:y0 + d.y + d.h / 2, h:0}, false);
      els.push(LINE(dx - 0.01, y, dx + cw, y, K.PALE, 1.6));
      fx = dx + cw; f = {top:y, h:0};
    });
    link(fx, f, span(e.to), true);
  });
  P.nodes.forEach(nd => {
    const x = colX(nd.layer), y = y0 + nd.y;
    pwBlock(els, peeks, ctx, nd, x, y, cw, nd.h);
    if (!nd.end) return;
    const ey = y0 + nd.end.y, eh = nd.end.h, d = Math.min(0.2, eh - 0.06), nx = x + cw + gx;
    link(x + cw, span(nd), {top:ey + eh / 2, h:0}, false, true);
    pwTick(els, nx, ey + (eh - d) / 2, d);
    els.push(fit(T(nx + d + 0.1, ey, cw - d - 0.1, eh, [run((joinList(nd.end.names) || 'This team') + (nd.end.pax ? ' (' + nd.end.pax + ')' : ''), {b:true, c:K.INK}), run(': pathway complete')], {size:10.5, c:K.MUTED, valign:'middle'}), {lines:1, box:false}));
  });

  return {bg:K.WHITE, els, peeks, name:'Proposed pathway', slideKey:'pathway', toc:{g:'programme', t:'Proposed Pathway For Your Organization', d:[courses.map(c => c.short + (c.pilot ? ' (pilot)' : '')).join(' → '), courses.map(c => c.short).join(' → '), n + ' courses']}};
}

/* ---------- Course overviews (hover cards in the web deck and the builder preview) ----------
   A slide may carry peeks: [{x, y, w, h, spot:{x, y, w, h}, card}], in inches. The web deck opens the card when the
   pointer rests on the region, or when the spot (the Overview marker) is tapped or pressed. PDF and PowerPoint ignore
   peeks; there the marker becomes a "Full details" link to the course page instead. */
function upfrontText(ctx, c, rates){
  const ps = rates.map(r => per(c, r, ctx)), ups = ps.map(p => p.up);
  const lo = Math.min(...ups), hi = Math.max(...ups);
  if (ps.every(p => p.up === p.gst)) return money(lo) + ' per participant, the 9% GST only';
  return (lo === hi ? money(lo) : money(lo) + ' to ' + money(hi)) + ' upfront per participant, incl. GST';
}
/* What a course can change for this client: the benefit whose theme ranks highest for both the course and the industry
   (the industry's themes are listed most relevant first). A course's own benefits come before its family's, and any
   headline in used (already on the slide) is skipped, so two cards never lead with the same line. */
function courseOutcome(ctx, c, used){
  const own = c.themes || [];
  const order = own.concat((FAMILY_THEMES[c.fam] || []).filter(t => !own.includes(t)));
  const ind = Object.keys((ctx.ind && ctx.ind.real) || {});
  const cands = [];
  order.forEach((t, i) => {
    const j = ind.indexOf(t);
    const mine = COURSE_BENEFITS[c.k] && COURSE_BENEFITS[c.k][t];
    const src = mine || (BENEFITS[c.fam] && BENEFITS[c.fam][t]);
    if (j < 0 || !src) return;
    cands.push({theme:t, head:src[0], body:src[1], rank:(mine ? 0 : 100) + i + j});
  });
  cands.sort((a, b) => a.rank - b.rank);
  const pick = cands.find(o => !(used && used.has(o.head))) || cands[0];
  return pick ? {theme:pick.theme, head:pick.head, body:pick.body} : {theme:'', head:c.pos, body:c.one};
}
function courseOutcomes(ctx, keys){
  const used = new Set(), out = {};
  keys.forEach(k => { const o = courseOutcome(ctx, C[k], used); used.add(o.head); out[k] = o; });
  return out;
}
function courseFacts(ctx, c, rates, format){
  const sfec = ctx.sfecOn && !ctx.isLegacySfec;
  return [
    ['Duration', hrsText(c.hrs) + ', ' + c.count],
    ['Format', format],
    ['Course fee', money0(c.fee) + ' per participant, before funding'],
    [sfec ? 'After funding and SFEC' : 'After funding', upfrontText(ctx, c, rates)],
    ['Certificate', c.wsq ? 'WSQ Statement of Attainment' : 'Vertical Institute certificate']
  ];
}
/* Overview of a course in this proposal (pathway and standalone programmes) */
function pathwayPeek(ctx, c, tag){
  const rates = ctx.groups.filter(g => !g.pass).map(g => g.rate);
  const d = daysFor(c.hrs);
  const here = [c.team ? titleCase(c.team) : '', paxWord(c.pax) + (c.paxConfirmed ? '' : ' (proposed)'), c.deliveryShort, c.dateFmt ? 'from ' + c.dateFmt : '', c.assignedUen ? c.assignedUen.name : ''].filter(Boolean).join(' · ');
  const secs = [];
  if (c.whoLong) secs.push({h:'Best for', p:c.whoLong, col:1});
  secs.push({h:'In this proposal', p:here, col:1});
  secs.push({h:'What participants will be able to do', list:c.learn.slice(0, ctx.pathway && c.idx > 0 && c.carry ? 3 : 4), col:2});
  if (ctx.pathway && c.idx > 0 && c.carry) secs.push({h:'How it builds on the earlier stages', p:c.carry, col:2});
  const format = c.priv ? 'Private class, ' + d.text + ', ' + c.venue : 'Scheduled public run, on ' + (ctx.weekday ? 'weekdays' : 'weekends');
  const lp = progPains(ctx).filter(p => p.course && p.course.k === c.k);
  if (lp.length) secs.unshift({h:'What your team raised', list:lp.map(p => noStop(p.text) + (p.mod ? ' (' + (c.lessons ? 'lesson ' : 'area ') + p.mod + ')' : ''))});
  return {wide:true, tag, pilot:!!c.pilot, title:c.name, lead:c.one, secs, facts:courseFacts(ctx, c, rates.length ? rates : [50], format), link:{label:'See full course details', url:c.url},
    go: slideHas(ctx, 'course_' + c.k) ? {label:'See the ' + (c.lessons ? 'lessons' : 'learning areas') + ' in this deck', to:'course_' + c.k} : null};
}
/* Overview of a course on the "Other courses" slide */
function othersPeek(ctx, c, out){
  const grp = (GROUPS.find(g => g[0] === c.g) || [])[1] || '';
  out = out || courseOutcome(ctx, c);
  const secs = [];
  if (c.whoLong) secs.push({h:'Best for', p:c.whoLong});
  const lp = otherPains(ctx).filter(p => p.other === c.k);
  if (lp.length) secs.push({h:'What your team raised', p:lp.map(p => endStop(p.text) + (painTag(p) ? ' (' + painTag(p).replace(/\s+·\s+/g, ', ') + ')' : '')).join(' ')});
  const po = lp.length ? painOutcome(c, lp[0], out) : [out.head, out.body];
  secs.push({h:'Why it matters for ' + ctx.client, b:po[0] + '.', p:po[1]});
  secs.push({h:'What participants will be able to do', list:c.learn.slice(0, 3)});
  const format = 'Private class for your team (' + daysFor(c.hrs).text + '), or a seat on a public run';
  return {tag:(c.lvl ? 'Level ' + c.lvl + ' · ' : '') + grp, title:c.name, lead:c.one, secs, facts:courseFacts(ctx, c, [70, 50], format), link:{label:'See full course details', url:c.url}};
}
/* The marker at a course card's top right: "Overview" in web decks, a "Full details" link in PDF and PowerPoint.
   xr is the marker's right edge and room the width it may take. Returns the marker's box, or null when nothing is drawn. */
function peekBadge(els, xr, y, h, room, dark, hover, url){
  const st = {size:8.5, b:true, cs:0.8};
  const word = hover ? 'OVERVIEW' : 'FULL DETAILS';
  const tw = measure(st, word) / PT, d = h - 0.1;
  const full = (hover ? d + 0.1 : 0) + tw + 0.26;
  const fill = dark ? K.RULE : K.WHITE, ink = dark ? K.WHITE : K.BRAND, edge = dark ? {} : {line:{c:K.LINE, w:0.75}};
  if (hover){
    if (full <= room){
      const x = xr - full;
      els.push(RRECT(x, y, full, h, fill, h / 2, edge));
      els.push(OVAL(x + 0.05, y + 0.05, d, d, dark ? K.PALE : K.BRAND));
      els.push(T(x + 0.05, y + 0.05, d, d, 'i', {size:8.5, b:true, c: dark ? K.NAVY : K.WHITE, align:'center', valign:'middle'}));
      els.push(T(x + 0.05 + d + 0.08, y, tw + 0.1, h, word, Object.assign({c:ink, valign:'middle'}, st)));
      return {x, y, w:full, h};
    }
    const x = xr - h;
    els.push(OVAL(x, y, h, h, dark ? K.PALE : K.BRAND));
    els.push(T(x, y, h, h, 'i', {size:9.5, b:true, c: dark ? K.NAVY : K.WHITE, align:'center', valign:'middle'}));
    return {x, y, w:h, h};
  }
  if (!url || full > room) return null;
  const x = xr - full;
  els.push(RRECT(x, y, full, h, fill, h / 2, edge));
  els.push(T(x, y, full, h, word, Object.assign({c:ink, align:'center', valign:'middle'}, st)));
  els.push(HREF(x, y, full, h, url, 'Full course details', h / 2));
  return {x, y, w:full, h};
}
function tick(els, x, y, c){
  els.push(LINE(x, y + 0.075, x + 0.06, y + 0.135, c, 1.8));
  els.push(LINE(x + 0.06, y + 0.135, x + 0.17, y, c, 1.8));
}

/* ---------- Slide 5+: Individual Course Slide ---------- */
/* Client-tailored lesson focus (v5.1). Returns null unless the draft sets S.focus and the course has a lesson list. */
function focusFor(ctx, c){
  const f = ctx.S && ctx.S.focus;
  if (!f || !c.lessons || ctx.multi) return null;
  const n = c.lessons.length;
  const mods = (Array.isArray(f.mods) ? f.mods : []).map(Number).filter(x => x >= 1 && x <= n);
  const notes = {};
  Object.keys(f.notes || {}).forEach(k => { const v = String(f.notes[k] || '').trim(); if (v && +k >= 1 && +k <= n) notes[+k] = v; });
  if (!mods.length && !Object.keys(notes).length) return null;
  return {mods, notes};
}
function rangeText(mods){
  const m = mods.slice().sort((a, b) => a - b);
  if (!m.length) return '';
  const contiguous = m.every((x, i) => i === 0 || x === m[i - 1] + 1);
  if (m.length === 1) return 'Lesson ' + m[0];
  if (contiguous) return 'Lessons ' + m[0] + ' to ' + m[m.length - 1];
  return 'Lessons ' + m.slice(0, -1).join(', ') + ' and ' + m[m.length - 1];
}
/* opts.detail (v6): drawn as a detail slide for a multi-course deck, opened from the pathway slide */
function slideCourse(ctx, c, idx, opts){
  opts = opts || {};
  const els = [];
  const lessons = c.lessons || c.areas;
  const F = focusFor(ctx, c);
  const LP = (c.lessons || c.areas || []).map((l, i) => lessonPains(ctx, c, i + 1));   // v6.1: points from the call each lesson answers
  const PILLW = (F && F.mods.length) || LP.some(a => a.length) ? 1.12 : 0;
  // v6: each lesson opens its own slide when the deck has them
  const LINKW = slideHas(ctx, 'md_' + c.k + '_1') ? 0.34 : 0;
  const lvlNum = c.lvl || 0;
  const stageTxt = c.lvl ? 'LEVEL ' + c.lvl : (ctx.pathway ? (c.stageLabel ? c.stageLabel.toUpperCase() : 'STAGE ' + stageNo(ctx, c)) : (ctx.standalone ? 'TRACK ' + (idx + 1) : ''));
  const pilotPrefix = c.pilot ? 'PILOT PROGRAMME  ·  ' : '';
  const eyebrow = pilotPrefix + (stageTxt ? stageTxt + '  ·  ' : 'THE COURSE  ·  ') + (c.team ? c.team.toUpperCase() + '  ·  ' : '') + hrsText(c.hrs).toUpperCase();
  header(els, [eyebrow, pilotPrefix + (stageTxt ? stageTxt + '  ·  ' : '') + hrsText(c.hrs).toUpperCase()], ['Inside the ' + c.name, 'Inside ' + c.short]);

  const cx = M, cw = 3.7, cy = 1.62, ch = 5.24;
  els.push(RRECT(cx, cy, cw, ch, K.NAVY, 0.15));
  const badgeTxt = c.pilot ? ('PILOT' + (stageTxt ? ' · ' + stageTxt : '')) : (stageTxt || 'THE COURSE');
  pill(els, badgeTxt, cx + 0.28, cy + 0.26, c.pilot ? 1.7 : 1.45, c.pilot ? K.AMB : K.PALE, c.pilot ? K.GOLD : K.NAVY, 0.3, 8.5, 1);

  const nameEl = fit(T(cx + 0.28, cy + 0.64, cw - 0.5, 0.8, [run(c.name, {link:c.url})], {size:18, f:'h', c:K.WHITE}), {lines:2});
  nameEl.h = textHeight(nameEl);
  els.push(nameEl);

  const days = daysFor(c.hrs);
  const p = ctx.groups.filter(g => !g.pass).map(g => per(c, g.rate, ctx));
  const sfecNote = (ctx.sfecOn && !ctx.isLegacySfec) ? ' and SFEC' : '';
  const fees = p.length === 1 ? money(p[0].up) + ' upfront after ' + p[0].rate + '% funding' + sfecNote + ', incl. GST' : money(Math.min(...p.map(x => x.up))) + ' to ' + money(Math.max(...p.map(x => x.up))) + ' upfront after funding' + sfecNote + ', incl. GST';
  const cohortLine = (c.team ? titleCase(c.team) + ' · ' : '') + paxWord(c.pax) + (c.pilot ? ' (pilot cohort' + (c.paxConfirmed ? ')' : ', proposed)') : (c.paxConfirmed ? '' : ' (proposed)')) + (c.assignedUen ? ' · ' + c.assignedUen.label : '');
  const facts = [
    ['TEAM & COHORT', cohortLine],
    ['DURATION & TARGET DATE', hrsText(c.hrs) + ' (' + c.count + ')' + (c.dateFmt ? ' · from ' + c.dateFmt : '')],
    ['FORMAT & DELIVERY', (c.priv ? 'Private class (' + days.text + ', ' + c.venue + ')' : 'Scheduled public run (' + (ctx.weekday ? 'weekdays' : 'weekends') + ')')],
    ['CERTIFICATION', c.wsq ? 'WSQ Statement of Attainment & Vertical Institute Certificate' : 'Vertical Institute certificate on completion'],
    ['COURSE FEE', money0(c.fee) + ' before funding; ' + fees]
  ];
  const fTop = cy + 0.64 + nameEl.h + 0.22, fBottom = cy + ch - 0.6;
  let vals, fGap = 0.06, labSize = 8.5;
  for (const vs of [10, 9.5, 9]){
    vals = facts.map(f => { const v = T(cx + 0.28, 0, cw - 0.5, 1, f[1], {size:vs, c:K.WHITE}); v.h = textHeight(v); return v; });
    const used = vals.reduce((a, v) => a + 0.21 + v.h, 0);
    fGap = (fBottom - fTop - used) / Math.max(1, facts.length - 1);
    if (fGap >= 0.06) break;
  }
  fGap = Math.max(0.04, Math.min(0.24, fGap));
  let fy = fTop;
  facts.forEach((f, k) => {
    els.push(T(cx + 0.28, fy, cw - 0.5, 0.19, f[0], {size:labSize, b:true, c:K.PALE, cs:1.2}));
    vals[k].y = fy + 0.21;
    els.push(vals[k]);
    fy += 0.21 + vals[k].h + fGap;
  });
  if (ctx.weekday) pill(els, 'Absentee Payroll eligible on weekdays', cx + 0.28, cy + ch - 0.5, 2.75, K.GREEN_BG, K.GREEN, 0.3, 8.5, 0);
  else pill(els, 'Absentee Payroll applies to weekday classes', cx + 0.28, cy + ch - 0.5, 2.95, '3A4C94', K.C9, 0.3, 8.5, 0);

  const rx = cx + cw + 0.35, rw = SW - M - rx;
  const listHead = (c.lessons ? c.count : 'key learning areas, then the assessment') + (F && F.mods.length ? '  ·  most practice time in ' + rangeText(F.mods) : '');
  const pick = LINKW ? '  ·  select ' + (c.lessons ? 'a lesson' : 'an area') + ' for detail' : '';
  els.push(fitFirst([(listHead + pick).toUpperCase(), listHead.toUpperCase()], t => T(rx, 1.62, rw, 0.22, t, {size:9, b:true, c:K.BRAND, cs:1.5}), {lines:1, box:false, min:0.8}, 0.9));
  let rows, assess, ah, gap, cd = 0.32;
  const sizeSteps = F ? [[13, 10.5, 0.36], [12.5, 10, 0.34], [12, 10, 0.33], [11.5, 9.5, 0.32], [11, 9.5, 0.3], [10.5, 9, 0.3]]
                      : [[13.5, 11, 0.38], [13, 10.5, 0.36], [12.5, 10, 0.34], [12, 10, 0.33], [11.5, 9.5, 0.32]];
  for (const [ts, ps, d] of sizeSteps){
    rows = lessons.map((l, li) => {
      const desc = (F && F.notes[li + 1]) || l[1];
      const tt = T(rx + 0.55, 0, rw - 0.6 - PILLW - LINKW, 1, [para([run(l[0], {size:ts, b:true, c:K.INK})], {after:2}), para([run(desc, {size:ps, c:K.MUTED})])]);
      return {tt, h: textHeight(tt)};
    });
    assess = T(rx + 0.2, 0, rw - 0.4, 1, [run('Assessment: ', {size:Math.min(ps, 10), b:true, c:K.INK}), run(c.assess + ' Successful participants receive ' + (c.wsq ? 'a WSQ Statement of Attainment.' : 'a Vertical Institute certificate.'), {size:Math.min(ps, 10), c:K.MUTED})]);
    ah = textHeight(assess);
    const avail = 6.86 - 1.95 - (ah + 0.2) - 0.12;
    gap = (avail - rows.reduce((a, r) => a + r.h, 0)) / Math.max(1, rows.length);
    cd = d;
    if (gap >= (F ? 0.12 : 0.1)) break;
  }
  gap = Math.max(0.06, Math.min(0.42, gap));
  let y = 1.95;
  rows.forEach((r, i) => {
    if (LP[i].length){
      const pb = Math.min(0.07, gap / 2), tg = (LP[i][0].team || 'Your point').toUpperCase();
      els.push(RRECT(rx - 0.1, y - pb, rw + 0.2, r.h + 2 * pb, K.HL, 0.08));
      els.push(RECT(rx - 0.1, y - pb, 0.05, r.h + 2 * pb, K.BRAND));
      pill(els, tg.length > 14 ? tg.slice(0, 13) + '…' : tg, rx + rw - PILLW - LINKW + 0.08, y + (r.h - 0.26) / 2, PILLW - 0.08, K.NAVY, K.WHITE, 0.26, 7.5, 1);
    } else if (F && F.mods.includes(i + 1)){
      const pb = Math.min(0.07, gap / 2);
      els.push(RRECT(rx - 0.1, y - pb, rw + 0.2, r.h + 2 * pb, K.HL, 0.08));
      els.push(RECT(rx - 0.1, y - pb, 0.05, r.h + 2 * pb, K.BRAND));
      pill(els, c.pilot ? 'PILOT FOCUS' : 'FOCUS', rx + rw - PILLW - LINKW + 0.08, y + (r.h - 0.26) / 2, PILLW - 0.08, K.AMB, K.GOLD, 0.26, 7.5, 1);
    }
    circleNum(els, i + 1, rx, y + 0.02, cd, K.BRAND, K.WHITE, 10.5);
    r.tt.y = y; r.tt.h = r.h;
    els.push(r.tt);
    if (LINKW && slideHas(ctx, 'md_' + c.k + '_' + (i + 1))){
      els.push(T(rx + rw - LINKW + 0.02, y, LINKW, r.h, '→', {size:14, b:true, c:K.BRAND, align:'center', valign:'middle'}));
      const pb = Math.min(0.07, gap / 2);
      els.push(GO(rx - 0.1, y - pb, rw + 0.2, r.h + 2 * pb, 'md_' + c.k + '_' + (i + 1), 'Open ' + (c.lessons ? 'lesson ' : 'area ') + (i + 1) + ': ' + lessons[i][0], 0.08));
    }
    y += r.h + gap;
  });
  els.push(RRECT(rx, y + 0.02, rw, ah + 0.2, K.LAV1, 0.08));
  assess.y = y + 0.12; assess.h = ah;
  els.push(assess);
  const tocSuffix = (c.pilot ? ' (pilot)' : (c.lvl ? ' (Level ' + c.lvl + ')' : ''));
  if (opts.detail){
    const backTo = slideHas(ctx, 'pathway') ? 'pathway' : slideHas(ctx, 'modmap') ? 'modmap' : '';
    if (backTo === 'pathway') backPill(els, '←  THE PATHWAY', M, 6.98, 2.2, 'pathway', 'Back to the pathway');
    else if (backTo) backPill(els, '←  ALL LESSONS', M, 6.98, 2.0, 'modmap', 'Back to Inside the programme');
    detailFoot(els, ctx, 'Course detail', M + 2.4);
    return {bg:K.WHITE, els, name:'Inside ' + c.short, slideKey:'course_' + c.k, detail:true, parentKey:backTo || 'pathway', group:'courses'};
  }
  return {bg:K.WHITE, els, name:'Inside ' + c.short, slideKey:'course_' + c.k, toc:{g:'programme', t:'Inside ' + c.short + tocSuffix, d:[cap(c.count) + (c.team ? ' · ' + titleCase(c.team) : ''), cap(c.count)]}};
}

/* ---------- Lesson slides (v6): detail slides brought over from the Consultation Deck Creator ----------
   One per lesson of each proposed course that has lesson detail, opened from that lesson's row on the course slide.
   Simple shows the capability practised and a workplace application; Detailed adds key learning points and hands-on
   practice; Technical adds topics and techniques, tools and what participants build. The client's own example for the
   lesson, and any point from the call that it answers, replace the illustrative ones. */
function backPill(els, label, x, y, w, to, tip, dark){
  pill(els, label, x, y, w, dark ? K.WHITE : K.LAV1, dark ? K.NAVY : K.BRAND, 0.36, 9, 1);
  els.push(GO(x, y, w, 0.36, to, tip, 0.18));
}
function detailFoot(els, ctx, what, x){
  els.push(fit(T(x, 7.06, SW - M - x, 0.26, ('verticalinstitute.com   ·   ' + what + '   ·   ' + ctx.client).toUpperCase(), {size:8.5, c:'7C849F', cs:1, align:'right'}), {lines:1, box:false}));
}
/* Bullets in two columns; the type steps down until they fit the height. Returns the height used. */
function bulletCols(els, items, x, y, w, h, dot, size){
  const gap = 0.35, cw = (w - gap) / 2, half = Math.ceil(items.length / 2);
  const cols = [items.slice(0, half), items.slice(half)];
  for (let s = size; s >= size - 3; s -= 0.5){
    const laid = cols.map(list => { let yy = 0; return list.map(t => { const el = T(0, 0, cw - 0.22, 3, t, {size:s, c:K.INK}); const hh = textHeight(el); const r = {el, yy, hh}; yy += hh + 0.13; return r; }); });
    const need = Math.max(...laid.map(l => l.length ? l[l.length - 1].yy + l[l.length - 1].hh : 0));
    if (need <= h + 1e-6 || s - 0.5 < size - 3){
      laid.forEach((l, ci) => l.forEach(({el, yy, hh}) => {
        const bx = x + ci * (cw + gap);
        els.push(OVAL(bx, y + yy + s * 1.22 / 144 - 0.04, 0.08, 0.08, dot));
        el.x = bx + 0.22; el.y = y + yy; el.h = hh + 0.02;
        els.push(el);
      }));
      return need;
    }
  }
  return 0;
}
/* Pill chips that wrap; returns the height used (dry runs only measure) */
function chipRow(els, items, x, y, w, dry){
  let cx = x, cy = y;
  const h = 0.32, gap = 0.1, st = {size:10, b:true};
  items.forEach(t => {
    const tw = measure(st, t) / PT + 0.3;
    if (cx + tw > x + w + 1e-6 && cx > x){ cx = x; cy += h + 0.1; }
    if (!dry){
      els.push(RRECT(cx, cy, tw, h, K.LAV1, h / 2, {line:{c:K.LINE, w:0.75}}));
      els.push(T(cx, cy, tw, h, t, Object.assign({c:K.NAVY, align:'center', valign:'middle'}, st)));
    }
    cx += tw + gap;
  });
  return cy + h - y;
}
function courseIcon(els, c, x, y, d, tile){
  if (tile) els.push(RRECT(x, y, d, d, K.WHITE, 0.12));
  const pad = tile ? d * 0.1 : 0;
  if (IMG['ci_' + c.k]) els.push(IMGEL('ci_' + c.k, x + pad, y + pad, d - 2 * pad, d - 2 * pad));
  else {
    els.push(RRECT(x + d * 0.15, y + d * 0.15, d * 0.7, d * 0.7, K.WHITE, 0.08, {line:{c:c.color, w:1.5}}));
    els.push(fit(T(x + d * 0.15, y + d * 0.15, d * 0.7, d * 0.7, c.abbr, {size:Math.max(8, d * 16), b:true, c:c.color, align:'center', valign:'middle'}), {lines:1, box:false, min:0.6}));
  }
}
function slideLesson(ctx, c, i){
  const els = [], n = i + 1, list = c.lessons || c.areas, L = list[i], D = modData(c, i) || {};
  const mode = lessonMode(ctx, c, i);
  const word = c.lessons ? 'LESSON' : 'AREA';
  const F = focusFor(ctx, c);
  const pw = 3.15;
  // Left panel: the course, the lesson number, and what the client told us that this lesson answers
  els.push(RECT(0, 0, pw, SH, K.NAVY));
  courseIcon(els, c, M, 0.5, 0.66, true);
  let nameEl = fit(T(M, 1.32, pw - 2 * M + 0.1, 0.9, c.name, {size:16, f:'h', c:K.WHITE}), {lines:3, min:0.7});
  els.push(nameEl);
  els.push(T(M, 2.45, 2, 0.25, word, {size:10, b:true, c:K.PALE, cs:2.5}));
  els.push(T(M, 2.7, 2.4, 1.2, String(n).padStart(2, '0'), {size:64, f:'h', c:K.WHITE}));
  const ps = lessonPains(ctx, c, n);
  if (ps.length){
    const p = ps[0];
    els.push(T(M, 4.02, pw - 2 * M, 0.24, 'WHAT YOUR TEAM TOLD US', {size:9, b:true, c:K.PALE, cs:1.4}));
    const tag = painTag(p);
    const q = fit(T(M, 4.3, pw - 2 * M + 0.05, tag ? 1.05 : 1.3, '“' + noStop(p.text) + '”', {size:11.5, i:true, c:K.WHITE}), {min:0.75});
    els.push(q);
    let ty = 4.3 + Math.min(q.h, textHeight(q)) + 0.12;
    if (tag){ const te = fit(T(M, ty, pw - 2 * M + 0.05, 0.42, tag, {size:9, b:true, c:K.C9}), {lines:2}); els.push(te); ty += textHeight(te) + 0.1; }
    if (ps.length > 1) els.push(T(M, Math.min(ty, 5.84), pw - 2 * M, 0.22, '+ ' + (ps.length - 1) + ' more point' + (ps.length > 2 ? 's' : '') + ' from the call', {size:8.5, c:K.PALE}));
  } else {
    els.push(T(M, 4.15, 2.3, 0.95, [para([run('Learn it.')]), para([run('Practise it.')]), para([run('Apply it at work.')])], {size:13, c:K.C9}));
  }
  if (slideHas(ctx, 'course_' + c.k)) backPill(els, '←  BACK TO THE COURSE', M, 6.2, 2.05, 'course_' + c.k, 'Back to ' + c.name, true);
  // Right side
  const x = pw + 0.6, w = SW - M - x;
  const focus = !!(F && F.mods.includes(n));
  const eyeW = focus ? w - 1.25 : w;
  els.push(fit(T(x, 0.5, eyeW, 0.28, word + ' ' + n + ' OF ' + list.length + '  ·  ' + c.name.toUpperCase(), {size:10, b:true, c:K.BRAND, cs:2}), {lines:1, box:false, min:0.8}));
  if (focus) pill(els, c.pilot ? 'PILOT FOCUS' : 'FOCUS', x + w - 1.15, 0.49, 1.15, K.AMB, K.GOLD, 0.28, 8, 1);
  const title = fit(T(x, 0.85, w, 0.95, L[0], {size:26, f:'h', c:K.INK}), {lines:2, min:0.7});
  els.push(title);
  const covers = (F && F.notes[n]) || L[1] || '';
  const own = lessonApp(ctx, c, n);
  const appLab = own ? 'AT ' + ctx.client.toUpperCase() : (mode === 'simple' ? 'ILLUSTRATIVE WORKPLACE APPLICATION' : 'WORKPLACE APPLICATION');
  const appText = own || D.app || '';
  const label = (t, yy) => els.push(T(x, yy, w, 0.25, t, {size:10, b:true, c:K.BRAND, cs:1.5}));
  const box = (bx, by, bw, bh, lab, text, fill, line) => {
    els.push(RRECT(bx, by, bw, bh, fill, 0.12, line ? {line:{c:line, w:0.75}} : null));
    els.push(fit(T(bx + 0.25, by + 0.16, bw - 0.5, 0.24, lab, {size:9.5, b:true, c:K.BRAND, cs:1.5}), {lines:1, box:false, min:0.75}));
    els.push(fit(T(bx + 0.25, by + 0.46, bw - 0.5, bh - 0.56, text || '', {size:12.5, c:K.INK}), {}));
  };
  const ownFill = own ? K.HL : K.ZEBRA, ownLine = own ? K.PALE : K.BORDER;
  // v6.1: how this lesson answers what the client's team said
  const hp = ps[0], help = hp ? painBenefitMap(ctx).get(hp.raw) : null;
  const helpLab = hp ? ('HOW THIS HELPS ' + (hp.team ? hp.team.toUpperCase() : 'YOUR TEAM')) : '';
  const helpRuns = help ? [run(noStop(help[0]) + '. ', {b:true, c:K.INK})].concat(help[1] ? [run(help[1], {c:K.MUTED})] : []) : null;
  if (mode === 'simple'){
    label('WHAT THIS ' + word + ' COVERS', 2.05);
    els.push(fit(T(x, 2.35, w, 0.75, covers, {size:14, c:K.INK}), {lines:2}));
    if (D.cap){
      label('CAPABILITY PARTICIPANTS PRACTISE', 3.35);
      els.push(fit(T(x, 3.65, w, 0.85, D.cap, {size:17, f:'h', c:K.INK}), {lines:2}));
    }
    if (help){
      const bw = appText ? (w - 0.25) / 2 : w;
      els.push(RRECT(x, 4.7, bw, 1.75, K.HL, 0.12, {line:{c:K.BRAND, w:1}}));
      els.push(fit(T(x + 0.25, 4.84, bw - 0.5, 0.24, helpLab, {size:9.5, b:true, c:K.BRAND, cs:1.5}), {lines:1, box:false, min:0.7}));
      els.push(fit(T(x + 0.25, 5.14, bw - 0.5, 1.2, helpRuns, {size:12.5}), {min:0.75}));
      if (appText){
        els.push(RRECT(x + bw + 0.25, 4.7, bw, 1.75, ownFill, 0.12, {line:{c:ownLine, w:0.75}}));
        els.push(fit(T(x + bw + 0.5, 4.84, bw - 0.5, 0.24, appLab, {size:9.5, b:true, c:K.BRAND, cs:1.5}), {lines:1, box:false, min:0.7}));
        els.push(fit(T(x + bw + 0.5, 5.14, bw - 0.5, 1.2, appText, {size:12.5, c:K.INK}), {min:0.75}));
      }
    } else if (appText){
      els.push(RRECT(x, 4.85, w, 1.3, ownFill, 0.12, {line:{c:ownLine, w:0.75}}));
      els.push(T(x + 0.3, 5.0, w - 0.6, 0.24, appLab, {size:9.5, b:true, c:K.BRAND, cs:1.5}));
      els.push(fit(T(x + 0.3, 5.3, w - 0.6, 0.75, appText, {size:13, c:K.INK}), {lines:2}));
    }
  } else {
    let y = 0.85 + Math.min(textHeight(title), 0.95) + 0.1;
    const sub = fit(T(x, y, w, 0.5, covers, {size:12, c:K.MUTED}), {lines:2});
    els.push(sub);
    y += Math.min(0.5, textHeight(sub)) + 0.24;
    const boxTop = 5.2, bw = (w - 0.25) / 2, bh = 6.8 - boxTop;
    const helpH = help ? 0.62 : 0;
    if (help){
      const hy = boxTop - helpH - 0.12;
      els.push(RRECT(x, hy, w, helpH, K.HL, 0.1, {line:{c:K.BRAND, w:1}}));
      els.push(fit(T(x + 0.22, hy + 0.04, w - 0.44, helpH - 0.08, [run(helpLab + '   ', {size:9, b:true, c:K.BRAND, cs:1.2})].concat(helpRuns), {size:11, valign:'middle'}), {lines:2, min:0.75}));
    }
    if (mode === 'detailed'){
      label('KEY LEARNING POINTS', y);
      y += 0.34;
      const capRoom = D.cap ? 1.0 : 0, lim = boxTop - 0.22 - (helpH ? helpH + 0.12 : 0);
      const need = bulletCols(els, D.learn, x, y, w, lim - y - capRoom, K.BRAND, 14);
      if (D.cap && lim - (y + need) >= 0.95){
        const cy = y + need + Math.min(0.42, (lim - (y + need) - 0.95) / 2 + 0.2);
        label('CAPABILITY PARTICIPANTS PRACTISE', cy);
        els.push(fit(T(x, cy + 0.3, w, 0.6, D.cap, {size:15, f:'h', c:K.INK}), {lines:2}));
      }
      box(x, boxTop, bw, bh, 'HANDS-ON PRACTICE', D.practice, K.LAV1, K.LINE);
      box(x + bw + 0.25, boxTop, bw, bh, appLab, appText, ownFill, ownLine);
    } else {
      const chipsH = D.tools && D.tools.length ? chipRow(els, D.tools, x, 0, w, true) : 0;
      const chipsTop = chipsH ? boxTop - 0.24 - chipsH - (helpH ? helpH + 0.12 : 0) : boxTop - (helpH ? helpH + 0.12 : 0);
      label('TOPICS AND TECHNIQUES', y);
      y += 0.34;
      bulletCols(els, D.tech, x, y, w, (chipsH ? chipsTop - 0.32 - 0.16 : chipsTop - 0.22) - y, K.BRAND, 13.5);
      if (chipsH){
        label('TOOLS AND FRAMEWORKS', chipsTop - 0.32);
        chipRow(els, D.tools, x, chipsTop, w, false);
      }
      box(x, boxTop, bw, bh, 'WHAT PARTICIPANTS BUILD', D.build, K.LAV1, K.LINE);
      box(x + bw + 0.25, boxTop, bw, bh, appLab, appText, ownFill, ownLine);
    }
  }
  els.push(fit(T(x, 7.06, w, 0.26, ('verticalinstitute.com   ·   ' + (c.lessons ? 'lesson' : 'area') + ' detail   ·   curriculum checked ' + CURRICULUM_CHECKED).toUpperCase(), {size:8.5, c:'7C849F', cs:1}), {lines:1, box:false}));
  return {bg:K.WHITE, els, name:c.short + ' · ' + (c.lessons ? 'lesson ' : 'area ') + n, slideKey:'md_' + c.k + '_' + n, detail:true, parentKey:'course_' + c.k, group:'md_' + c.k};
}

/* ---------- Slide (v6.1): the lesson map, for multi-course decks ----------
   Every lesson of every course on one slide, each opening its lesson slide (or the course's detail slide). Lessons
   that answer a point from the call are highlighted with the team and the point. */
function slideLessonMap(ctx){
  const els = [], cs = ctx.courses, pains = progPains(ctx);
  const any = pains.some(p => p.mod);
  header(els, 'INSIDE THE PROGRAMME', any ? ['Every lesson, and where it meets what your teams told us', 'Where the lessons meet your teams’ points'] : ['Every lesson in the programme', 'Every lesson']);
  const linkable = cs.some(c => slideHas(ctx, 'md_' + c.k + '_1') || slideHas(ctx, 'course_' + c.k));
  const sub = (any ? 'Highlighted lessons answer a point your teams raised. ' : '') + (linkable ? 'Select any lesson for what it covers, the capability practised and how it applies at work.' : 'Each course runs as its own cohort, in the order shown.');
  els.push(fit(T(M, 1.36, 12.2, 0.3, sub, {size:12, c:K.MUTED}), {lines:1, box:false}));
  const n = cs.length, perRow = n <= 4 ? n : 3, bands = Math.ceil(n / perRow);
  const gx = 0.3, cw = (SW - 2 * M - gx * (perRow - 1)) / perRow;
  const top = 1.9, bottom = 6.82, bandGap = 0.22, bh = (bottom - top - bandGap * (bands - 1)) / bands;
  const compact = bands > 1;
  cs.forEach((c, ci) => {
    const x = M + (ci % perRow) * (cw + gx), y0 = top + Math.floor(ci / perRow) * (bh + bandGap);
    const L = c.lessons || c.areas || [];
    const hh = compact ? 0.42 : 0.56;
    // Course header
    els.push(RRECT(x, y0, cw, hh, c.pilot ? K.NAVY : K.LAV1, 0.1));
    courseIcon(els, c, x + 0.1, y0 + (hh - (compact ? 0.28 : 0.36)) / 2, compact ? 0.28 : 0.36, true);
    const tx = x + (compact ? 0.48 : 0.56), courseTo = slideHas(ctx, 'course_' + c.k) ? 'course_' + c.k : '';
    els.push(fit(T(tx, y0 + 0.04, cw - (tx - x) - (courseTo ? 0.36 : 0.12), compact ? 0.2 : 0.26, c.short + (c.pilot ? '  ·  PILOT' : ''), {size:compact ? 10 : 11.5, b:true, c:c.pilot ? K.WHITE : K.INK, valign:'middle'}), {lines:1, box:false, min:0.75}));
    if (!compact) els.push(fit(T(tx, y0 + 0.29, cw - (tx - x) - 0.36, 0.22, L.length + (c.lessons ? ' lessons' : ' learning areas') + '  ·  ' + hrsText(c.hrs), {size:9, c:c.pilot ? K.C9 : K.MUTED, valign:'middle'}), {lines:1, box:false}));
    else els.push(fit(T(tx, y0 + 0.22, cw - (tx - x) - 0.36, 0.16, L.length + (c.lessons ? ' lessons' : ' areas') + '  ·  ' + hrsText(c.hrs), {size:8, c:c.pilot ? K.C9 : K.MUTED, valign:'middle'}), {lines:1, box:false}));
    if (courseTo){
      els.push(T(x + cw - 0.34, y0, 0.3, hh, '→', {size:13, b:true, c:c.pilot ? K.PALE : K.BRAND, align:'center', valign:'middle'}));
      els.push(GO(x, y0, cw, hh, courseTo, 'Open ' + c.name, 0.1));
    }
    // Lesson rows: linked ones take a second line for the point
    const ry0 = y0 + hh + 0.08, avail = y0 + bh - ry0;
    const lp = L.map((l, i) => pains.filter(p => p.course && p.course.k === c.k && p.mod === i + 1));
    const extra = compact ? 0 : 0.34;
    const units = L.length + lp.filter(a => a.length).length * (extra / 0.5);
    const base = Math.min(compact ? 0.3 : 0.52, (avail - 0.04 * (L.length - 1)) / Math.max(1, units));
    let y = ry0;
    L.forEach((l, i) => {
      const hit = lp[i], h = base + (hit.length && !compact ? base * extra / 0.5 : 0);
      const to = slideHas(ctx, 'md_' + c.k + '_' + (i + 1)) ? 'md_' + c.k + '_' + (i + 1) : courseTo;
      els.push(RRECT(x, y, cw, h, hit.length ? K.HL : K.WHITE, 0.08, {line:{c: hit.length ? K.BRAND : K.LINE, w: hit.length ? 1 : 0.75}}));
      const d = Math.min(0.26, base - 0.1);
      circleNum(els, i + 1, x + 0.08, y + (Math.min(h, base) - d) / 2, d, hit.length ? K.NAVY : K.BRAND, K.WHITE, compact ? 7.5 : 9);
      const lx = x + 0.12 + d + 0.08, lw = cw - (lx - x) - (to ? 0.3 : 0.1);
      els.push(fit(T(lx, y + 0.02, lw, Math.min(h, base) - 0.04, l[0], {size:compact ? 8.5 : 10, b:!!hit.length, c:K.INK, valign:'middle'}), {lines:compact ? 1 : 2, min:0.7}));
      if (hit.length && !compact){
        const p = hit[0];
        els.push(fit(T(lx, y + base - 0.04, lw, h - base, [run((p.team ? p.team : 'Your team') + ': ', {b:true, c:K.BRAND}), run(noStop(p.text) + (hit.length > 1 ? ' (+' + (hit.length - 1) + ')' : ''), {c:K.INK})], {size:9, valign:'top'}), {lines:2, min:0.75}));
      }
      if (to){
        els.push(T(x + cw - 0.3, y, 0.26, Math.min(h, base), '→', {size:11, b:true, c:K.BRAND, align:'center', valign:'middle'}));
        els.push(GO(x, y, cw, h, to, 'Open ' + (c.lessons ? 'lesson ' : 'area ') + (i + 1) + ' of ' + c.short + ': ' + l[0], 0.08));
      }
      y += h + 0.04;
    });
  });
  return {bg:K.WHITE, els, name:'Inside the programme', slideKey:'modmap', toc:{g:'proposal', t:'Inside the programme', d: any ? ['Every lesson, and where it meets your teams’ points', 'Every lesson'] : ['Every lesson, course by course', 'Every lesson']}};
}

/* ---------- Slide: In Practice ---------- */
const GAICC_PRACTICE = [
  'Turn briefs into persuasive proposals, capability decks and visual summaries tailored to the audience.',
  'Produce clear visual guides, infographics and short explainer video concepts from internal notes.',
  'Draft multi-channel updates, social posts and visual highlights with a consistent brand voice.',
  'Adapt announcements, emails and client communications across formats with human quality checks.',
  'Build a repeatable no-code content workflow that turns new briefs into publication-ready copy and visuals.'
];
function aiCourseColHead(c, multi){
  const pTag = c.pilot ? ', PILOT' : '';
  if (c.k === 'wfa') return 'IN LEVEL 3 (WORKFLOW AUTOMATION' + pTag + '), PARTICIPANTS BUILD';
  if (c.k === 'gaicc') return 'IN LEVEL 2 (CONTENT CREATION' + pTag + '), PARTICIPANTS PRODUCE';
  if (c.g === 'ai') return 'IN LEVEL 1 (GENERATIVE AI' + pTag + '), PARTICIPANTS PRACTISE';
  return 'IN ' + c.short.toUpperCase() + (c.pilot ? ' (PILOT)' : '') + ', PARTICIPANTS APPLY';
}
function aiCourseColText(c, w, idx){
  if (c.k === 'wfa') return w[2];
  if (c.k === 'gaicc') return GAICC_PRACTICE[idx % GAICC_PRACTICE.length];
  if (c.g === 'ai') return w[1];
  return (c.learn && c.learn[idx % c.learn.length]) || w[1];
}

function slidePractice(ctx){
  const {c1, courses, ind, client} = ctx;
  const els = [];
  const anyAi = courses.some(c => c.g === 'ai');
  const custom = (Array.isArray(ctx.S && ctx.S.practice) ? ctx.S.practice : []).filter(r => r && String(r.work || '').trim() && String(r.text || '').trim()).slice(0, 5);
  if (anyAi){
    header(els, 'IN PRACTICE', [ctx.prog + ', set in your team’s work', 'Set in your team’s work']);
    const intro = custom.length
      ? (ctx.priv ? 'Set in the work each team described. Accreditation fixes the learning outcomes and assessment; we agree the exercises with you before delivery, using sample or anonymised material.'
                  : 'Set in the work each team described. In a public run the class examples are general, and participants apply each technique to these tasks as they go.')
      : ctx.priv
      ? 'Examples typical of ' + ind.noun + '. Accreditation fixes the learning outcomes and assessment; in a private class, we set the exercises in each team’s own work, agreed with you before delivery.'
      : 'Examples typical of ' + ind.noun + '. In a public run the class examples are general, and participants apply each technique to their own work as they go.';
    els.push(fit(T(M, 1.36, 12.2, 0.5, intro, {size:12, c:K.MUTED}), {lines:2}));
    const shown = courses.slice(0, 3);
    const nC = shown.length;
    const hd = (t, al) => ({content:[run(t, {size: nC >= 3 ? 8.5 : 9.5, b:true, c:K.WHITE, cs:1})], fill:K.NAVY, o:{align:al || 'left'}});
    const colW = nC === 1 ? [3.7, SW - 2 * M - 3.7]
               : nC === 2 ? [3.1, 4.56, 4.57]
               : [2.53, 3.23, 3.23, 3.24];
    const hdrCells = [hd('WORK HANDLED')].concat(shown.map(c => hd(aiCourseColHead(c, nC > 1))));
    const rows = [{h:0.44, cells:hdrCells}];
    const src = custom.length ? custom.map(r => [String(r.work).trim(), String(r.text).trim(), String(r.text).trim(), String(r.tools || '').trim()]) : ind.ai;
    const rowH = custom.length ? Math.min(0.86, 4.1 / custom.length) : 0.76;
    src.forEach((w, i) => {
      const fill = i % 2 ? K.ZEBRA : K.WHITE;
      const workRuns = [para([run(w[0], {size: nC >= 3 ? 11 : 12, b:true, c:K.INK})])];
      if (w[3]) workRuns.push(para([run(w[3], {size: nC >= 3 ? 9.5 : 10, c:K.MUTED})]));
      const cells = [{content: w[3] ? workRuns : [run(w[0], {size: nC >= 3 ? 11 : 12, b:true, c:K.INK})], fill}];
      shown.forEach(c => {
        cells.push({content:[run(custom.length ? w[1] : aiCourseColText(c, w, i), {size: nC >= 3 ? 10 : 11, c:K.INK})], fill});
      });
      rows.push({h:rowH, cells});
    });
    const yEnd = table(els, M, 2.0, colW, rows, {padX:0.15, padY:0.05});
    els.push(fit(T(M, Math.max(yEnd + 0.14, 6.3), SW - 2 * M, 0.5, 'Exercises use fictionalised or anonymised material as sandbox practice; connecting any workflow to live ' + client + ' systems is a separate internal step after the course.', {size:9.5, i:true, c:K.MUTED}), {lines:2}));
    return {bg:K.WHITE, els, name:'In practice', slideKey:'practice', toc:{g:'programme', t:'In practice', d: custom.length ? ['Set in ' + custom.map(r => String(r.work).trim()).slice(0, 3).join(', ') + ' work'] : (ctx.priv ? ['Exercises set in your team’s own work'] : ['Examples typical of ' + ind.noun])}};
  }
  header(els, 'IN PRACTICE', 'What participants learn to do, and where it applies');
  const lx = M, lw = 6.3, rx = lx + lw + 0.35, rw = SW - M - rx;
  els.push(T(lx, 1.5, lw, 0.22, 'WHAT PARTICIPANTS LEARN TO DO', {size:8.5, b:true, c:K.BRAND, cs:1.5}));
  const learn = c1.learn.slice(0, 5);
  const rh = 0.82, gap = 0.12;
  learn.forEach((l, i) => {
    const y = 1.84 + i * (rh + gap);
    els.push(RRECT(lx, y, lw, rh, K.LAV1, 0.1));
    circleNum(els, i + 1, lx + 0.2, y + rh / 2 - 0.17, 0.34, K.BRAND, K.WHITE, 10);
    els.push(fit(T(lx + 0.72, y + 0.08, lw - 0.95, rh - 0.16, l, {size:13, b:true, c:K.INK, valign:'middle'}), {}));
  });
  const fam = c1.fam;
  let list, head;
  if (fam === 'data'){ list = ind.data; head = 'Reports and data ' + ind.noun + ' typically work with'; }
  else if (fam === 'mkt'){ list = ind.mkt; head = 'Where ' + ind.noun + ' typically apply it'; }
  else if (fam === 'people'){ list = ind.people; head = 'Situations ' + ind.noun + ' typically face'; }
  else if (fam === 'ux'){ list = ['Website enquiry and booking journeys','Customer and member portals','Online forms and self-service','Mobile experiences','Internal tools staff use every day']; head = 'Digital journeys this applies to'; }
  else if (fam === 'cyber'){ list = ['Phishing and scam emails aimed at staff','Handling ' + ind.sensitive,'Access by vendors, contractors and former staff','Lost devices and files shared by mistake','Responding to a suspected breach']; head = 'Risks ' + ind.noun + ' typically manage'; }
  else if (fam === 'carbon'){ list = ['Emissions from ' + ind.carbon,'Carbon questions in customer and tender questionnaires','Sustainability and annual reporting','Reduction targets and initiatives','Engaging suppliers on their emissions']; head = 'Where ' + ind.noun + ' typically apply it'; }
  else { list = ['Evaluating blockchain and digital asset proposals','Client questions on digital assets','Assessing exchange and custody risk','Understanding tokenisation use cases','Briefing management on developments']; head = 'Where teams typically apply it'; }
  els.push(RRECT(rx, 1.5, rw, 1.84 + 5 * rh + 4 * gap - 1.5, K.NAVY, 0.15));
  els.push(fit(T(rx + 0.32, 1.72, rw - 0.64, 0.5, head.toUpperCase(), {size:8.5, b:true, c:K.PALE, cs:1.5}), {lines:2}));
  list.slice(0, 5).forEach((t, i) => {
    const y = 2.34 + i * 0.84;
    els.push(OVAL(rx + 0.36, y + 0.13, 0.12, 0.12, K.PALE));
    els.push(fit(T(rx + 0.62, y, rw - 0.95, 0.38, t, {size:13, c:K.WHITE, valign:'middle'}), {lines:1, box:false, min:0.75}));
    if (i < 4) els.push(LINE(rx + 0.32, y + 0.6, rx + rw - 0.32, y + 0.6, K.RULE, 0.75));
  });
  els.push(fit(T(M, 6.62, SW - 2 * M, 0.34, ctx.priv
    ? 'Accreditation fixes the learning outcomes and the assessment. In a private class, we set the examples and exercises in your team’s work, agreed with you before delivery.'
    : 'Accreditation fixes the learning outcomes and the assessment. In a public run, participants apply each technique to their own work as they go.', {size:9.5, i:true, c:K.MUTED}), {lines:2}));
  return {bg:K.WHITE, els, name:'In practice', slideKey:'practice', toc:{g:'programme', t:'In practice', d:['What participants learn to do, and where it applies']}};
}

/* ---------- Slide: Delivery ---------- */
function slideDeliveryClassic(ctx){
  const {client, courses} = ctx;
  const els = [];
  const days = daysFor(Math.max(...courses.map(c => c.hrs)));
  const eyeDelivery = ctx.mixedDelivery ? 'PRIVATE CLASS & PUBLIC RUN' : (ctx.priv ? 'PRIVATE CLASS' : 'PUBLIC RUN');
  const titleDelivery = ctx.mixedDelivery
    ? 'Tailored delivery for each course in your programme'
    : (ctx.priv ? 'Why a private class, rather than a public run' : 'Starting with a public run');
  header(els, 'DELIVERY  ·  ' + eyeDelivery, titleDelivery);

  const subDelivery = ctx.mixedDelivery
    ? ['Delivery set per course for ' + client + ': ' + courses.map(c => c.short + ' (' + c.deliveryShort + ')').join(' · ') + '.', 'Delivery is set per course: private classes and public runs side by side.']
    : [ctx.priv ? 'A private class lets ' + (ctx.team ? 'the ' + ctx.team : 'your teams') + ' learn together, on your schedule, with examples drawn from your own work.' : 'A public run is the quickest way to start with a few participants, on dates already in the timetable.'];
  els.push(fitFirst(subDelivery, t => T(M, 1.4, 12.2, 0.3, t, {size:12, c:K.MUTED}), {lines:1, box:false}, 0.9));

  const recP = ctx.priv;
  const hdr = (t, rec) => ({content:[run(t, {size:11, b:true, c: rec ? K.WHITE : K.INK})], fill: rec ? K.NAVY : 'E3E7F4'});
  const lab = t => ({content:[run(t, {size:10.5, b:true, c:K.INK})], fill:'F6F7FB'});
  const cell = (t, rec) => ({content:[run(t, {size:10.5, c: rec ? K.INK : K.MUTED})], fill: rec ? K.LAV1 : K.WHITE});
  const venueDesc = courses.some(c => c.delivery === 'private') ? 'Your office or our Paya Lebar campus' : cap(ctx.venue.replace(/^at /, ''));
  const priv = ['Only ' + (ctx.distinctTeams.length > 1 ? poss(client) + ' functional teams' : (ctx.team ? poss(client) + ' ' + ctx.team : client + ' staff')), 'Set in your team’s work, agreed with you before delivery', 'Open discussion of internal processes, colleagues only', (ctx.multi ? 'Full or half days for each course' : days.text) + (ctx.trainingDateFmt ? ', starting ' + ctx.trainingDateFmt : ', on dates you choose'), venueDesc, 'From eight participants per cohort', 'Same course fee and SkillsFuture funding per participant'];
  const pub = ['Learners from other organisations', 'General examples for a mixed class', 'Kept general, with outside learners present', 'Fixed dates from the public timetable', 'Our campus, or online', 'Any number, from one', 'Same course fee and SkillsFuture funding per participant'];
  const labels = ['Who is in the room', 'Examples and exercises', 'Discussion', 'Schedule', 'Venue', 'Class size', 'Fee and funding'];
  const rows = [{h:0.4, cells:[{content:[run('', {size:10})], fill:'F6F7FB'}, hdr('Private class for ' + client, recP), hdr('Public run', !recP || ctx.mixedDelivery)]}];
  labels.forEach((l, i) => rows.push({h:0.42, cells:[lab(l), cell(priv[i], recP), cell(pub[i], !recP || ctx.mixedDelivery)]}));
  const tw = 8.1, ty = 1.9;
  const yEnd = table(els, M, ty, [1.9, 3.15, 3.05], rows, {padX:0.12, padY:0.05});
  els.push(fit(T(M, yEnd + 0.12, tw, 0.4, 'In both, WSQ accreditation fixes the learning outcomes and assessment, which is what unlocks SkillsFuture funding and the SkillsFuture Enterprise Credit (SFEC).', {size:9.5, i:true, c:K.MUTED}), {lines:2}));
  const rx = M + tw + 0.3, rw = SW - M - rx, rh = yEnd - ty;
  els.push(RRECT(rx, ty, rw, rh, K.LAV1));
  if (ctx.priv){
    els.push(T(rx + 0.25, ty + 0.18, rw - 0.5, 0.24, ctx.multi ? 'PER-COURSE DELIVERY & SCHEDULE' : 'YOUR FORMAT, YOUR CHOICE', {size:9, b:true, c:K.BRAND, cs:2}));
    if (ctx.multi){
      const shown = courses.slice(0, courses.length > 4 ? 3 : 4);
      const lh = 0.23, b1h = 0.36 + shown.length * lh + (courses.length > shown.length ? lh : 0) + 0.06;
      let y = ty + 0.5;
      els.push(RRECT(rx + 0.25, y, rw - 0.5, b1h, K.WHITE, 0.08));
      els.push(T(rx + 0.42, y + 0.06, rw - 0.84, 0.26, 'Delivery by course', {size:12.5, f:'h', c:K.INK}));
      shown.forEach((c, i) => {
        const t = [c.short + ': ' + c.deliveryShort + ' · ' + c.pax + ' pax', c.short + ': ' + c.deliveryShort, c.short];
        els.push(fitFirst(t, x => T(rx + 0.42, y + 0.36 + i * lh, rw - 0.84, lh, x, {size:9.5, c:K.MUTED, valign:'middle'}), {lines:1, box:false}, 0.95));
      });
      if (courses.length > shown.length) els.push(T(rx + 0.42, y + 0.36 + shown.length * lh, rw - 0.84, lh, '+ ' + (courses.length - shown.length) + ' more', {size:9.5, i:true, c:K.MUTED, valign:'middle'}));
      y += b1h + 0.08;
      const dl = courses.map(c => daysFor(c.hrs).d);
      const dTxt = ['Full days: ' + courses.map((c, i) => dl[i] + (dl[i] === 1 ? ' day' : ' days') + ' for ' + c.short).join(', ') + '. Or split into half days, so half of each day stays free for desk work.',
                    'Full days (' + dl.reduce((a, b) => a + b, 0) + ' in total), or half days so half of each day stays free for desk work.'];
      els.push(RRECT(rx + 0.25, y, rw - 0.5, 0.82, K.WHITE, 0.08));
      els.push(T(rx + 0.42, y + 0.06, rw - 0.84, 0.26, 'Full or half days', {size:12.5, f:'h', c:K.INK}));
      els.push(fitFirst(dTxt, t => T(rx + 0.42, y + 0.34, rw - 0.84, 0.44, t, {size:9.5, c:K.MUTED}), {lines:2}, 0.95));
      y += 0.9;
      const smallPriv = courses.filter(c => c.priv && c.pax < 8);
      const note = smallPriv.length ? ['Class size: ', 'a private class needs at least eight participants; ' + joinList(smallPriv.map(c => c.short)) + (smallPriv.length === 1 ? ' has' : ' have') + ' fewer.']
                                    : ['Absentee Payroll: ', ctx.weekday ? 'weekday classes qualify, for Singapore Citizens and PRs.' : 'it applies only to weekday classes.'];
      els.push(fit(T(rx + 0.25, y, rw - 0.5, Math.max(0.3, ty + rh - y - 0.06), [run(note[0], {size:9.5, b:true, c:K.INK}), run(note[1], {size:9.5, c:K.MUTED})]), {}));
    } else {
      const fm = [[days.d === 1 ? '1 full day' : days.d + ' full days', 'Done within one week, with fewer days to schedule.'], [(2 * days.d) + ' half days', 'Participants are back at their desks for the rest of each day, with time to apply each lesson.']];
      fm.forEach((f, i) => {
        const y = ty + 0.5 + i * 0.92;
        els.push(RRECT(rx + 0.25, y, rw - 0.5, 0.84, K.WHITE, 0.08));
        els.push(T(rx + 0.42, y + 0.07, rw - 0.84, 0.28, f[0], {size:13.5, f:'h', c:K.INK}));
        els.push(fit(T(rx + 0.42, y + 0.37, rw - 0.84, 0.44, f[1], {size:9.5, c:K.MUTED}), {}));
      });
      const notes = [['Class size: ', 'a private class needs at least eight participants' + (ctx.pax >= 8 ? ', so a cohort of ' + ctx.pax + ' qualifies.' : '.')],
                     ['Absentee Payroll: ', ctx.weekday ? 'weekday classes qualify, for Singapore Citizens and PRs.' : 'it applies only to weekday classes, so it is not claimable on weekends.']];
      notes.forEach((n, i) => els.push(fit(T(rx + 0.25, ty + 2.4 + i * 0.46, rw - 0.5, 0.44, [run(n[0], {size:9.5, b:true, c:K.INK}), run(n[1], {size:9.5, c:K.MUTED})]), {})));
    }
  } else {
    els.push(T(rx + 0.25, ty + 0.18, rw - 0.5, 0.24, 'HOW A PUBLIC RUN WORKS', {size:9, b:true, c:K.BRAND, cs:2}));
    const steps = [['Choose a run', 'Weekday or weekend, online or in person, from the published timetable.'], ['We hold places', 'Once you confirm, we reserve seats and handle enrolment.'], ['Funding as usual', ctx.weekday ? 'Weekday runs also qualify for Absentee Payroll.' : 'Absentee Payroll applies to weekday runs only.']];
    steps.forEach((s, i) => {
      const y = ty + 0.56 + i * 0.86;
      circleNum(els, i + 1, rx + 0.25, y, 0.32, K.BRAND, K.WHITE, 10);
      els.push(T(rx + 0.68, y - 0.02, rw - 0.9, 0.28, s[0], {size:11.5, b:true, c:K.INK}));
      els.push(fit(T(rx + 0.68, y + 0.26, rw - 0.9, 0.5, s[1], {size:9.5, c:K.MUTED}), {}));
    });
    els.push(fit(T(rx + 0.25, ty + rh - 0.6, rw - 0.5, 0.5, [run('From eight participants, ', {size:9.5, b:true, c:K.INK}), run('a private class becomes available, with examples set in your team’s work.', {size:9.5, c:K.MUTED})]), {}));
  }
  return {bg:K.WHITE, els, name:'Delivery', slideKey:'delivery', toc:{g:'programme', t: ctx.mixedDelivery ? 'Per-course delivery format' : (ctx.priv ? 'Private class or public run' : 'Starting with a public run'), d: ctx.priv ? ['Format, schedule and venue per course'] : ['How joining a public run works']}};
}

/* ---------- Private class training schedule ----------
   A port of the Training Schedule tab in the Fees & Scheduler workbook (V0411). For a course's training hours and a
   cohort, it compares 1 to 7 sessions (one a day), keeps those that fit the class hours, and lays out the chosen one:
   - assessment: the cohort estimate rounds (30 min written + 5 min questioning per participant + 15 min buffer) up to
     the next 30 minutes, unless the trainer's confirmed hours are entered; it runs at the end of the final day;
   - the final day takes ceil(total / days, 30 min) less the assessment as training, leaving at least 3 hours for each
     earlier day; the earlier days share the rest in 30-minute blocks, the first days taking any extra;
   - a 1-hour lunch on days of 5.5+ hours of activity (Auto), every day (Include) or never (Skip), 3 hours after the
     start (halfway through days of 3 hours or less);
   - a format fits when no day has more than the longest-day limit of activity, every day ends by the latest finish,
     and no day averages under 3 hours of training.
   Defaults follow the Fees & Scheduler copy (9:00 am to 7:00 pm, up to 11 hours a day), which keeps each course to
   the full days the rest of the deck states; the Scheduler Calculator copy's 6:00 pm and 8 hours are builder settings. */
const SCHED_DEFAULTS = {start:9, end:19, lunch:1, minAvg:3, maxAct:11, pref:'auto', written:30, perPax:5, buffer:15, lunchAt:5.5, beforeLunch:3};
/* Singapore public holidays as gazetted by MOM (with Monday holidays for Sunday ones), so class dates skip them.
   Add each new year when MOM announces it (usually in June). */
const SG_HOLIDAYS = {
  '2026-01-01':'New Year’s Day', '2026-02-17':'Chinese New Year', '2026-02-18':'Chinese New Year', '2026-03-21':'Hari Raya Puasa',
  '2026-04-03':'Good Friday', '2026-05-01':'Labour Day', '2026-05-27':'Hari Raya Haji', '2026-05-31':'Vesak Day', '2026-06-01':'Vesak Day (in lieu)',
  '2026-08-09':'National Day', '2026-08-10':'National Day (in lieu)', '2026-11-08':'Deepavali', '2026-11-09':'Deepavali (in lieu)', '2026-12-25':'Christmas Day',
  '2027-01-01':'New Year’s Day', '2027-02-06':'Chinese New Year', '2027-02-07':'Chinese New Year', '2027-02-08':'Chinese New Year (in lieu)',
  '2027-03-10':'Hari Raya Puasa', '2027-03-26':'Good Friday', '2027-05-01':'Labour Day', '2027-05-17':'Hari Raya Haji', '2027-05-20':'Vesak Day',
  '2027-08-09':'National Day', '2027-10-28':'Deepavali', '2027-12-25':'Christmas Day'};
const SG_HOLIDAYS_TO = '2027-12-31';
const SCHED_DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const schedCeil = x => Math.ceil(x * 2 - 1e-9) / 2;
const schedFloor = x => Math.floor(x * 2 + 1e-9) / 2;
function schedClock(h, short){
  let hh = Math.floor(h + 1e-9), mm = Math.round((h - hh) * 60);
  if (mm === 60){ hh++; mm = 0; }
  const h12 = ((hh % 12) + 12) % 12 || 12;
  return h12 + ':' + String(mm).padStart(2, '0') + (short ? '' : (hh % 24 >= 12 ? ' pm' : ' am'));
}
const schedRange = (a, b, short) => schedClock(a, short) + '–' + schedClock(b, short);
const schedHrs = h => (Math.round(h * 10) / 10) + 'h';
const schedDays = n => n + (n === 1 ? ' day' : ' days');
function schedHourLabel(h){ const h12 = ((h % 12) + 12) % 12 || 12; return h12 + (h % 24 >= 12 ? ' pm' : ' am'); }
function schedDateLabel(iso){ const d = parseISO(iso); return d ? SCHED_DOW[d.getDay()] + ' ' + d.getDate() + ' ' + SHORT_MONTHS[d.getMonth()] : ''; }
/* Training hours to schedule: the workbook's figure, or an edited course length less the course's own assessment allowance */
function schedTrain(k, hrsOverride){
  const b = C[k] || C.genai;
  return hrsOverride && +hrsOverride > 0 ? Math.max(0.5, +hrsOverride - Math.max(0, b.hrs - b.train)) : b.train;
}
function schedOpts(S, view){
  view = view || {};
  const num = (v, d) => { const n = parseFloat(v); return isNaN(n) ? d : n; };
  const o = Object.assign({}, SCHED_DEFAULTS);
  o.start = Math.max(5, Math.min(14, num(view.start != null ? view.start : S.schedStart, SCHED_DEFAULTS.start)));
  o.end = Math.max(o.start + 2, Math.min(23.5, num(view.end != null ? view.end : S.schedEnd, SCHED_DEFAULTS.end)));
  const pref = view.pref || S.schedLunch;
  o.pref = ['auto', 'include', 'skip'].includes(pref) ? pref : 'auto';
  o.maxAct = Math.max(3, Math.min(11, num(S.schedMax, SCHED_DEFAULTS.maxAct)));
  return o;
}
function schedAssess(pax, o){ return pax >= 1 ? schedCeil((o.written + pax * o.perPax + o.buffer) / 60) : 0; }
function schedFormat(train, assess, n, o){
  const total = train + assess;
  const P = n === 1 ? train : Math.max(0, Math.min(train - o.minAvg * (n - 1), schedCeil(total / n) - assess));
  const rem = train - P, base = n > 1 ? schedFloor(rem / (n - 1)) : 0, extra = n > 1 ? Math.round((rem - base * (n - 1)) / 0.5) : 0;
  const days = [];
  for (let d = 1; d <= n; d++){
    const tr = d === n ? P : base + (d <= extra ? 0.5 : 0);
    const a = d === n ? assess : 0, act = tr + a;
    const lunch = act <= 0 || o.pref === 'skip' ? 0 : (o.pref === 'include' || act >= o.lunchAt) ? o.lunch : 0;
    days.push({d, train:tr, assess:a, act, lunch, span:act + lunch});
  }
  const sumT = days.reduce((x, y) => x + y.train, 0);
  const maxAct = Math.max(...days.map(x => x.act)), span = Math.max(...days.map(x => x.span));
  const maxN = Math.max(1, Math.min(7, Math.floor(train / o.minAvg + 1e-9)));
  let status = 'fits', why = '';
  if (train <= 0){ status = 'none'; why = 'No hours set'; }
  else if (n > maxN){ status = 'short'; why = 'Under ' + schedHrs(o.minAvg) + ' a day'; }
  else if (maxAct > o.maxAct + 1e-9){ status = 'long'; why = 'Over ' + schedHrs(o.maxAct) + ' a day'; }
  else if (span > Math.round((o.end - o.start) * 1e6) / 1e6 + 1e-9){ status = 'late'; why = 'Past ' + schedClock(o.end); }
  else if (Math.abs(sumT - train) > 1e-5){ status = 'split'; why = 'Hours do not split'; }
  return {n, days, status, why, fits: status === 'fits', maxAct, span, finish: o.start + span};
}
/* One day's blocks in clock hours: training, then the assessment, with lunch inserted where it falls */
function schedDay(day, o){
  const L = day.act > 3 ? o.beforeLunch : day.act / 2, has = day.lunch > 0;
  const at = (x, isEnd) => o.start + x + (has && (isEnd ? x > L : x >= L) ? day.lunch : 0);
  const blocks = [];
  const add = (kind, a, b) => {
    if (b - a <= 1e-9) return;
    if (has && a < L && b > L){ blocks.push({kind, from:at(a, false), to:o.start + L}); blocks.push({kind, from:o.start + L + day.lunch, to:at(b, true)}); }
    else blocks.push({kind, from:at(a, false), to:at(b, true)});
  };
  add('train', 0, day.train);
  add('assess', day.train, day.train + day.assess);
  if (has) blocks.push({kind:'lunch', from:o.start + L, to:o.start + L + day.lunch});
  blocks.sort((p, q) => p.from - q.from);
  return {blocks, finish:o.start + day.span};
}
/* Class dates: consecutive weekdays (or weekend days) from the course's start date, skipping public holidays */
const schedIso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
function schedDates(startIso, n, weekday){
  const d = parseISO(startIso);
  if (!d) return [];
  const out = [schedIso(d)];
  const ok = x => (weekday ? (x.getDay() !== 0 && x.getDay() !== 6) : (x.getDay() === 0 || x.getDay() === 6)) && !SG_HOLIDAYS[schedIso(x)];
  for (let i = 1; i < n; i++){
    let guard = 0;
    do { d.setDate(d.getDate() + 1); } while (!ok(d) && ++guard < 60);
    out.push(schedIso(d));
  }
  return out;
}
/* The courses a client can pick: those added to this proposal */
function schedCourses(ctx){
  const out = [], seen = new Set();
  const pref = ctx.courses.find(c => c.pilot && c.priv) || ctx.courses.find(c => c.priv) || ctx.c1;
  ctx.courses.forEach(c => {
    if (seen.has(c.k)) return;
    seen.add(c.k);
    out.push({k:c.k, c, inProposal:true, def: c === pref, priv:c.priv, pax:c.pax, n:c.sessionsPref, asmt:c.asmtOverride, train:c.train, date:c.date, short:c.short,
      label:(ctx.multi ? 'Course ' + (c.idx + 1) + (c.pilot ? ' (pilot)' : '') + ': ' : '') + c.name});
  });
  return out;   // only the courses added in the builder
}
/* v2.1: duration options per course. A private course keeps the 1-7 day comparison, limited to the days typed in its
   duration options ("3-7"); a public intake shows only its published formats ("3,4" days, or "2,6x3" for 2 full days or
   6 sessions of 3 hours), with hours per day rather than clock times, since the intake schedule sets those. */
const schedPubOpts = o => Object.assign({}, o, {pref:'skip', maxAct:24, end:o.start + 24, minAvg:0.5});
/* A course's own assessment allowance (listed hours less training hours), used for public intakes */
function schedStdAssess(c){
  if (c.asmtOverride > 0) return c.asmtOverride;
  return Math.max(0, Math.round((c.hrs - c.train) * 2) / 2);
}
function schedPubFormat(train, assess, op, po){
  let f;
  if (op.sess){
    const L = op.sess, days = [];
    for (let d = 1; d <= op.n; d++){
      const a = d === op.n ? Math.min(assess, L) : 0, tr = d === op.n ? Math.max(0, L - a) : L;
      days.push({d, train:tr, assess:a, act:tr + a, lunch:0, span:tr + a});
    }
    f = {n:op.n, days, status:'fits', why:'', fits:true, maxAct:L, span:L, finish:po.start + L};
  } else {
    f = schedFormat(train, assess, op.n, po);
    if (f.status !== 'split' && f.status !== 'none'){ f.status = 'fits'; f.why = ''; f.fits = true; }
  }
  const acts = f.days.map(d => d.act), lo = Math.min(...acts), hi = Math.max(...acts);
  f.pub = true;
  f.sess = op.sess || 0;
  f.top = op.sess ? op.n + ' sessions' : schedDays(op.n);
  f.sub = op.sess ? op.sess + ' hours each' : hi >= 7 ? 'Full day' : (lo === hi ? schedHrs(hi) : (Math.round(lo * 10) / 10) + '–' + schedHrs(hi)) + ' a day';
  f.label = op.sess ? op.n + ' sessions (' + op.sess + ' hours each)' : schedDays(op.n) + (hi >= 7 ? ' (full day)' : ', ' + f.sub);
  return f;
}
/* The formats a course offers on the Delivery slide */
function schedFormatsFor(c, assess, o){
  const opts = c.formatOpts || [];
  if (c.priv === false){
    const po = schedPubOpts(o);
    return (opts.length ? opts : [{n:daysFor(c.hrs).d}]).map(op => schedPubFormat(c.train, assess, op, po));
  }
  const all = [1, 2, 3, 4, 5, 6, 7].map(n => schedFormat(c.train, assess, n, o));
  if (!opts.length) return all;
  const allow = new Set(opts.filter(x => !x.sess).map(x => x.n));
  const list = all.filter(f => allow.has(f.n));
  return list.length ? list : all;
}
/* One line for a format, in selectors */
const schedOptLabel = (f, short) => f.label || (schedDays(f.n) + (f.fits ? (short ? ', by ' : ', finishing by ') + schedClock(f.finish) : ': ' + f.why.toLowerCase()));
/* view = {k (course), pax, n (days), start, end, pref (lunch)} */
function schedView(ctx, view){
  view = view || {};
  const list = schedCourses(ctx);
  const def = list.find(x => x.def) || list[0];
  const sel = list.find(x => x.k === view.k) || def;
  const o = schedOpts(ctx.S, view);
  const pax = Math.max(1, Math.min(500, Math.round(view.pax != null ? +view.pax : sel.pax) || 1));
  const pub = !!(sel.c && !sel.priv);
  const override = !pub && sel.asmt > 0 && (view.pax == null || pax === sel.pax);
  const assess = pub ? schedStdAssess(sel.c) : override ? sel.asmt : schedAssess(pax, o);
  const formats = schedFormatsFor(sel.c || {train:sel.train, hrs:sel.train, priv:true}, assess, o);
  const fmtN = n => formats.find(f => f.n === n) || null;
  const firstFit = formats.find(f => f.fits) || null;
  const wanted = view.n != null ? +view.n : sel.n;
  const chosenOk = !!(wanted && fmtN(wanted) && fmtN(wanted).fits);
  const n = chosenOk ? wanted : (firstFit ? firstFit.n : 0);
  const plan = n ? fmtN(n) : null;
  const seq0 = plan && !pub && sel.inProposal && sel.date ? schedDates(sel.date, plan.n, ctx.weekday) : [];
  const custom = !!(plan && !pub && Array.isArray(view.dates) && view.dates.some(Boolean));
  let dates = seq0;
  if (custom){
    // Chosen dates win; any day left blank follows on from Day 1 in sequence
    const d1 = view.dates[0] || seq0[0] || '';
    const seq = d1 ? schedDates(d1, plan.n, ctx.weekday) : [];
    dates = Array.from({length:plan.n}, (_, i) => view.dates[i] || seq[i] || '');
  }
  const oo = pub ? schedPubOpts(o) : o;
  const days = plan ? plan.days.map((d, i) => Object.assign({}, d, schedDay(d, oo), {date: dates[i] || ''})) : [];
  const scale = pub ? Math.max(3, ...formats.map(f => f.span || 0)) : 0;
  return {list, def, sel, o, pax, assess, override, formats, firstFit, wanted, chosenOk, n, plan, days, customDates:custom, pub, scale};
}
function schedNote(ctx, V){
  if (V.pub){
    const c = V.sel.c;
    return 'Public intake: participants join a scheduled class with other companies. ' + (c && c.timesText ? 'Class times as published for this run; ' : 'Dates and class times follow the published schedule for each run; ') + 'we confirm seats with you before enrolment. The same course fee and SkillsFuture funding apply.';
  }
  if (!V.plan) return 'No split fits ' + schedRange(V.o.start, V.o.end) + ' with up to ' + schedHrs(V.o.maxAct) + ' of class a day. Extend the class hours, or ask us about a different arrangement.';
  const parts = [V.override ? 'Assessment time as confirmed with the trainer.' : 'Assessment time is an estimate for ' + paxWord(V.pax) + ' (written work and individual questioning), confirmed with the trainer.'];
  if (V.pax < 8) parts.push('A private class usually starts at eight participants, so we confirm the arrangements with you.');
  if (V.firstFit && V.n > V.firstFit.n && !(V.sel.c && V.sel.c.delivery === 'private-online')) parts.push('Modular delivery over shorter sessions is online only, subject to confirmation.');
  const ds = V.days.map(d => d.date).filter(Boolean);
  const ph = V.days.filter(d => d.date && SG_HOLIDAYS[d.date]);
  if (ph.length) parts.push(ph.map(d => 'Day ' + d.d + ' falls on ' + SG_HOLIDAYS[d.date]).join('; ') + '.');
  if (ds.some((x, i) => i && x <= ds[i - 1])) parts.push('The dates are not in order.');
  if (V.customDates && ds.length) parts.push('Dates as chosen; we confirm them with you.');
  else if (V.days[0] && V.days[0].date) parts.push('Dates assume consecutive ' + (ctx.weekday ? 'weekdays' : 'weekend days') + (V.days[V.days.length - 1].date <= SG_HOLIDAYS_TO ? ', skipping public holidays' : '') + '; we agree the exact dates with you.');
  if (V.sel.inProposal && !V.sel.priv) parts.push('This course is planned as a public run; this shows how it would run as a private class.');
  return parts.join(' ');
}
const schedDayList = nums => nums.length === 1 ? 'Day ' + nums[0] : 'Days ' + nums.slice(0, -1).join(', ') + ' and ' + nums[nums.length - 1];
/* Class times in a line: "9:00 am–5:30 pm; Day 3 to 6:00 pm" */
function schedTimesText(V){
  const counts = {};
  V.days.forEach(d => { const k = d.finish.toFixed(2); counts[k] = (counts[k] || 0) + 1; });
  const usual = +Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a - b)[0];
  const odd = V.days.filter(d => Math.abs(d.finish - usual) > 1e-6);
  if (!odd.length) return schedRange(V.o.start, usual) + (V.days.length > 1 ? ' each day' : '');
  const oddEnds = Array.from(new Set(odd.map(d => d.finish.toFixed(2))));
  if (oddEnds.length <= 2) return schedRange(V.o.start, usual) + '; ' + oddEnds.map(e => schedDayList(odd.filter(d => d.finish.toFixed(2) === e).map(d => d.d)) + ' to ' + schedClock(+e)).join(', ');
  const fins = V.days.map(d => d.finish);
  return 'From ' + schedClock(V.o.start) + ', finishing between ' + schedClock(Math.min(...fins)) + ' and ' + schedClock(Math.max(...fins));
}
function schedLunchText(V){
  const withL = V.days.filter(d => d.lunch > 0);
  if (!withL.length) return 'No lunch break';
  const b = withL[0].blocks.find(x => x.kind === 'lunch'), r = schedRange(b.from, b.to);
  return withL.length === V.days.length ? r + (V.days.length > 1 ? ' each day' : '') : r + ' on ' + schedDayList(withL.map(d => d.d));
}
function schedDateSpan(a, b){
  const da = parseISO(a), db = parseISO(b);
  if (!da) return '';
  if (!db || a === b) return schedDateLabel(a) + ' ' + da.getFullYear();
  if (da.getFullYear() !== db.getFullYear()) return schedDateLabel(a) + ' ' + da.getFullYear() + ' – ' + schedDateLabel(b) + ' ' + db.getFullYear();
  if (da.getMonth() === db.getMonth()) return SCHED_DOW[da.getDay()] + ' ' + da.getDate() + ' – ' + schedDateLabel(b) + ' ' + db.getFullYear();
  return schedDateLabel(a) + ' – ' + schedDateLabel(b) + ' ' + db.getFullYear();
}

/* ---------- Slide: Delivery, with the private class training schedule ----------
   Live decks lay real selectors over the course, participants and number-of-days boxes and the day chips; the clickable
   PowerPoint links them to hidden views (view.linkCourse / view.linkN); PDF shows the proposal's schedule. */
function slideDelivery(ctx, view){
  if (!ctx.priv) return slideDeliveryClassic(ctx);
  view = view || {};
  const {client} = ctx;
  const mode = view.mode || 'live', live = mode !== 'static', ppt = !!view.linkCourse;
  const V = schedView(ctx, view);
  const {sel, o, plan} = V, pub = V.pub;
  const flex = ctx.mixedDelivery;   // v2.1: private and public courses in one proposal
  const els = [], controls = [];
  header(els, [flex ? 'DELIVERY  ·  DEDICATED COHORT OR PUBLIC SCHEDULE' : 'DELIVERY  ·  PRIVATE CLASS  ·  TRAINING SCHEDULE', 'DELIVERY  ·  TRAINING SCHEDULE'],
    flex ? ['Flexible Delivery Models: Dedicated Corporate Cohort vs. Public Schedule']
         : ['A private class, scheduled around your team', 'Your training schedule, day by day', 'Your training schedule']);
  const who = ctx.distinctTeams.length > 1 ? poss(client) + ' teams' : (ctx.team ? 'the ' + ctx.team : 'your team');
  const lead = flex ? 'Each course runs either as a dedicated cohort for ' + client + ' only, or in a public intake with other companies.'
    : 'Only ' + who + ' in the room, with exercises set in your own work.';
  const subs = live ? [lead + ' Choose a course and ' + (flex ? 'a duration' : 'the number of days') + ' to see how the hours split.', 'Choose a course and ' + (flex ? 'a duration' : 'the number of days') + ' to see how the hours split.']
    : [lead + (plan ? ' Here is the ' + sel.short + ' course over ' + (plan.top || schedDays(plan.n)) + '.' : ''), lead];
  els.push(fitFirst(subs, t => T(M, 1.36, 12.2, 0.32, t, {size:11.5, c:K.MUTED}), {lines:1, box:false}, 0.9));

  // Left: selectors, the duration comparison and the day-by-day calendar
  const lx = M, ly = 1.8, lw = 8.45, lh = 5.12;
  els.push(RRECT(lx, ly, lw, lh, K.LAV1, 0.15));
  const ix = lx + 0.2, iw = lw - 0.4;
  const sy = ly + 0.17, sh = 0.52, g = 0.12, paxW = 1.6, nW = 2.3, cW = iw - paxW - nW - 2 * g;
  const pList = V.list.filter(x => x.inProposal);
  const pi = pList.findIndex(x => x.k === sel.k), nextK = pList[(pi + 1) % pList.length];
  const courseLive = live && pList.length > 1;
  selectorBox(els, {x:ix, y:sy, w:cW, h:sh, label:'COURSE', value:[sel.label, sel.short], mode: courseLive ? mode : 'static', accent:K.GOLD,
    link: ppt && pList.length > 1 ? view.linkCourse(nextK.k) : null, tip:'Show ' + nextK.short});
  if (live && !ppt && pList.length > 1) controls.push({id:'schedCourse', kind:'select', label:'Course', x:ix, y:sy, w:cW, h:sh, value:sel.k,
    options:V.list.map(x => ({value:x.k, label:x.label, group: null}))});
  const px = ix + cW + g;
  selectorBox(els, {x:px, y:sy, w:paxW, h:sh, label:'PARTICIPANTS', value:[paxWord(V.pax), String(V.pax)], mode: ppt ? 'static' : mode, accent:K.BRAND});
  if (live && !ppt){
    const opts = [];
    for (let n = 1; n <= Math.max(40, 2 * V.pax); n++) opts.push({value:String(n), label:paxWord(n)});
    controls.push({id:'schedPax', kind:'select', label:'Participants', x:px, y:sy, w:paxW, h:sh, value:String(V.pax), options:opts});
  }
  const nx = px + paxW + g;
  const fits = V.formats.filter(f => f.fits);
  const fi = plan ? fits.findIndex(f => f.n === plan.n) : -1, nextF = fits.length ? fits[(fi + 1) % fits.length] : null, nextN = nextF ? nextF.n : null;
  const nLabel = pub ? 'DURATION  ·  PUBLIC INTAKE' : flex ? 'DURATION' : 'NUMBER OF DAYS';
  const nValue = !plan ? ['No split fits'] : pub ? [plan.label, plan.top] : [schedDays(plan.n) + '  ·  by ' + schedClock(plan.finish), schedDays(plan.n)];
  selectorBox(els, {x:nx, y:sy, w:nW, h:sh, label:nLabel, value:nValue,
    mode: fits.length > 1 ? mode : 'static', accent:K.BRAND, link: ppt && fits.length > 1 ? view.linkN(nextN) : null, tip:'Show ' + (nextF ? (nextF.top || schedDays(nextF.n)) : '')});
  if (live && !ppt && fits.length > 1) controls.push({id:'schedSessions', kind:'select', label: pub ? 'Duration' : 'Number of days', x:nx, y:sy, w:nW, h:sh, value:String(V.n),
    options:V.formats.map(f => ({value:String(f.n), label:schedOptLabel(f), disabled:!f.fits}))});

  // The duration chips: the course's own options only
  const cy = sy + sh + 0.14, chH = 0.5, cg = 0.08, nCh = V.formats.length;
  const chW = Math.min(pub ? 2.4 : 2.0, (iw - (Math.max(nCh, 1) - 1) * cg) / Math.max(nCh, 1));
  V.formats.forEach((f, i) => {
    const x = ix + i * (chW + cg), on = !!(plan && f.n === plan.n);
    els.push(RRECT(x, cy, chW, chH, on ? K.NAVY : f.fits ? K.WHITE : K.ZEBRA, 0.08, on ? {} : {line:{c: f.fits ? K.LINE : K.BORDER, w:0.75}}));
    els.push(fit(T(x + 0.05, cy + 0.05, chW - 0.1, 0.22, f.top || schedDays(f.n), {size:10, b:true, c: on ? K.WHITE : f.fits ? K.INK : K.GREY, align:'center'}), {lines:1, box:false}));
    els.push(fit(T(x + 0.05, cy + 0.27, chW - 0.1, 0.19, f.pub ? f.sub : f.fits ? 'by ' + schedClock(f.finish) : f.why, {size:8.5, i:!f.fits, c: on ? K.PALE : f.fits ? K.MUTED : K.GREY, align:'center'}), {lines:1, box:false}));
    if (f.fits && !on){
      if (live && !ppt) controls.push({id:'schedN' + f.n, kind:'button', label:'Show ' + (f.top || schedDays(f.n)), x, y:cy, w:chW, h:chH, enabled:true});
      else if (ppt) els.push(GO(x, cy, chW, chH, view.linkN(f.n), 'Show ' + (f.top || schedDays(f.n)), 0.08));
    }
  });
  if (flex && nCh < 6){
    // the delivery model of the course on show, beside its chips
    const bx = ix + nCh * (chW + cg) + 0.1, bw = ix + iw - bx;
    if (bw > 1.6){
      els.push(RRECT(bx, cy + 0.08, bw, chH - 0.16, pub ? K.WHITE : K.HL, 0.17, {line:{c: pub ? K.LINE : K.PALE, w:0.75}}));
      els.push(fit(T(bx + 0.14, cy + 0.08, bw - 0.28, chH - 0.16, pub ? 'Public intake only' : 'Dedicated private cohort only', {size:9.5, b:true, c: pub ? K.INK : K.NAVY, align:'center', valign:'middle'}), {lines:1, box:false}));
    }
  }

  const gy = cy + chH + 0.16, axW = 0.58, headH = 0.44;
  const tTop = gy + headH, gBottom = ly + lh - 0.4, tH = gBottom - tTop;
  // Private: clock hours. Public intake: hours of class, since the intake schedule sets the clock times.
  const t0 = pub ? 0 : o.start, t1 = pub ? V.scale : o.end, hours = t1 - t0;
  const yAt = h => tTop + (h - t0) / hours * tH;
  const ax = ix + axW, aw = iw - axW;
  const unit = pub && plan && plan.sess ? 'Session ' : 'Day ';
  if (plan){
    const n = plan.n, colG = n > 6 ? 0.07 : 0.1, colW = Math.min(2.45, (aw - (n - 1) * colG) / n);
    const x0 = ax + (aw - n * colW - (n - 1) * colG) / 2;
    V.days.forEach((d, i) => els.push(RRECT(x0 + i * (colW + colG), tTop, colW, tH, K.WHITE, 0.06)));
    const step = pub && hours > 9 ? 2 : 1;
    for (let h = Math.ceil(t0 - 1e-9); h <= t1 + 1e-9; h += step){
      const y = yAt(h);
      els.push(LINE(ax - 0.04, y, ix + iw, y, K.LINE, 0.5));
      els.push(T(ix, y - 0.09, axW - 0.1, 0.18, pub ? h + 'h' : schedHourLabel(h), {size:8.5, c:K.MUTED, align:'right', valign:'middle'}));
    }
    V.days.forEach((d, i) => {
      const x = x0 + i * (colW + colG);
      els.push(fitFirst([unit + d.d + (d.date ? '  ·  ' + schedDateLabel(d.date) : ''), unit + d.d, (pub && plan.sess ? 'S' : 'D') + d.d], t => T(x, gy, colW, 0.22, t, {size:10, b:true, c:K.INK, align:'center'}), {lines:1, box:false}, 0.9));
      els.push(fitFirst([schedHrs(d.train) + ' training' + (d.assess ? ' + ' + schedHrs(d.assess) + ' assessment' : ''), schedHrs(d.train) + (d.assess ? ' + ' + schedHrs(d.assess) + ' assess.' : ''), schedHrs(d.act)],
        t => T(x, gy + 0.21, colW, 0.19, t, {size:8.5, c:K.MUTED, align:'center'}), {lines:1, box:false}, 0.95));
      // public intakes: blocks stacked from the top, sized by hours
      const blocks = pub ? (() => { const out = []; let at = 0; d.blocks.filter(b => b.kind !== 'lunch').forEach(b => { const len = b.to - b.from; out.push({kind:b.kind, from:at, to:at + len}); at += len; }); return out; })() : d.blocks;
      blocks.forEach(b => {
        const y1 = yAt(b.from), y2 = yAt(b.to), bh = y2 - y1;
        const st = b.kind === 'train' ? {fill:K.MID, c:K.WHITE, name:'Training'} : b.kind === 'lunch' ? {fill:K.E4, c:K.MUTED, name:'Lunch'} : {fill:K.AMB, c:K.GOLD, name:'Assessment'};
        els.push(RRECT(x + 0.04, y1 + 0.012, colW - 0.08, Math.max(0.02, bh - 0.024), st.fill, 0.05, b.kind === 'assess' ? {line:{c:'E0B84A', w:0.75}} : {}));
        const tw = colW - 0.18, ranges = pub ? [schedHrs(b.to - b.from), schedHrs(b.to - b.from)] : [schedRange(b.from, b.to), schedRange(b.from, b.to, true)];
        if (bh >= 0.4 && b.kind !== 'lunch'){
          els.push(fit(T(x + 0.1, y1 + 0.06, tw, 0.18, st.name, {size:8.5, b:true, c:st.c}), {lines:1, box:false}));
          els.push(fitFirst(ranges, t => T(x + 0.1, y1 + 0.23, tw, 0.18, t, {size:8.5, c:st.c}), {lines:1, box:false}, 0.9));
        } else if (bh >= 0.2){
          const one = b.kind === 'train' ? ranges : [st.name + '  ·  ' + ranges[0], st.name + '  ·  ' + ranges[1], b.kind === 'lunch' ? st.name : ranges[1]];
          els.push(fitFirst(one, t => T(x + 0.1, y1, tw, bh, t, {size:8.5, b: b.kind !== 'train', c:st.c, valign:'middle'}), {lines:1, box:false}, 0.9));
        }
      });
    });
    // Key and totals
    const ky = gBottom + 0.12;
    const keys = pub ? [['Training', K.MID], ['Assessment', K.AMB]] : [['Training', K.MID], ['Lunch', K.E4], ['Assessment', K.AMB]];
    keys.forEach((k, i) => {
      const kx = ax + i * 1.05;
      els.push(RRECT(kx, ky + 0.04, 0.14, 0.14, k[1], 0.03, k[0] === 'Assessment' ? {line:{c:'E0B84A', w:0.75}} : {}));
      els.push(T(kx + 0.2, ky, 0.85, 0.22, k[0], {size:8.5, c:K.MUTED, valign:'middle'}));
    });
    const tot = pub
      ? (plan.sess ? [plan.n + ' sessions × ' + plan.sess + ' hours, with the assessment in the final session', plan.n + ' × ' + plan.sess + ' hours'] : [schedHrs(sel.train) + ' training + ' + schedHrs(V.assess) + ' assessment (public intake)', schedHrs(sel.train) + ' training + ' + schedHrs(V.assess) + ' assessment'])
      : [schedHrs(sel.train) + ' training + ' + schedHrs(V.assess) + ' assessment' + (V.override ? ' (confirmed)' : ' (estimate for ' + paxWord(V.pax) + ')'), schedHrs(sel.train) + ' training + ' + schedHrs(V.assess) + ' assessment'];
    els.push(fitFirst(tot, t => T(ax + keys.length * 1.05 + 0.1, ky, aw - keys.length * 1.05 - 0.1, 0.22, t, {size:8.5, b:true, c:K.INK, align:'right', valign:'middle'}), {lines:1, box:false}, 0.95));
  } else {
    els.push(RRECT(ax, tTop, aw, tH, K.WHITE, 0.06));
    els.push(fit(T(ax + 0.4, tTop + tH / 2 - 0.4, aw - 0.8, 0.8, schedNote(ctx, V), {size:11, c:K.MUTED, align:'center', valign:'middle'}), {}));
  }

  // Right: the schedule at a glance, each course in the proposal, why this delivery model
  const rx = lx + lw + 0.25, rw = SW - M - rx;
  els.push(RRECT(rx, ly, rw, lh, K.WHITE, 0.15, {line:{c:K.LINE, w:1}}));
  const jx = rx + 0.25, jw = rw - 0.5;
  let y = ly + 0.2;
  els.push(T(jx, y, jw, 0.22, 'AT A GLANCE', {size:9, b:true, c:K.BRAND, cs:1.5}));
  y += 0.28;
  els.push(fit(T(jx, y, jw, 0.44, plan ? (plan.top || schedDays(plan.n)) : 'No split fits', {size:20, f:'h', c:K.INK, valign:'middle'}), {lines:1, box:false}));
  y += 0.5;
  if (plan){
    const leadRuns = pub
      ? [run(schedHrs(sel.train) + ' of training', {b:true, c:K.INK}), run(V.assess ? ', with a ' + (Math.round(V.assess * 10) / 10) + '-hour assessment in the final ' + (plan.sess ? 'session.' : 'day.') : '.')]
      : [run(schedHrs(sel.train) + ' of training', {b:true, c:K.INK}), run(V.assess ? ', then a ' + (Math.round(V.assess * 10) / 10) + '-hour assessment at the end of Day ' + plan.n + '.' : '.')];
    const leadEl = T(jx, y, jw, 0.5, leadRuns, {size:10, c:K.MUTED});
    fit(leadEl, {});
    els.push(leadEl);
    y += Math.min(0.5, textHeight(leadEl)) + 0.14;
    const rows = [];
    if (flex) rows.push(['FORMAT', pub ? 'Public intake only' : 'Dedicated private cohort only']);
    if (pub){
      rows.push(['CLASS TIMES', sel.c && sel.c.timesText ? sel.c.timesText : 'As published for each intake']);
      rows.push(['DATES', sel.c && sel.c.dateFmt ? (sel.c.timesText ? 'Public run from ' : 'Intake from ') + sel.c.dateShort : 'Next available intake']);
    } else {
      rows.push(['CLASS TIMES', schedTimesText(V)], ['LUNCH', schedLunchText(V)]);
      if (V.days[0].date) rows.push(['DATES', schedDateSpan(V.days[0].date, V.days[V.days.length - 1].date)]);
    }
    rows.forEach(r => {
      els.push(T(jx, y + 0.02, 0.92, 0.2, r[0], {size:8.5, b:true, c:K.BRAND, cs:1}));
      const v = T(jx + 0.95, y, jw - 0.95, 0.44, r[1], {size:10, c:K.INK});
      fit(v, {lines:2});
      els.push(v);
      y += Math.min(0.44, textHeight(v)) + 0.07;
    });
    y += 0.08;
  }
  els.push(LINE(jx, y, jx + jw, y, K.BORDER, 1));
  y += 0.14;
  const noteEl = T(jx, 0, jw, 1.2, schedNote(ctx, V), {size:9, i:true, c:K.MUTED, valign:'bottom'});
  fit(noteEl, {});
  const noteH = Math.min(1.2, textHeight(noteEl) + 0.04), noteTop = ly + lh - 0.18 - noteH;
  noteEl.y = noteTop; noteEl.h = noteH;
  if (pList.length > 1){
    els.push(T(jx, y, jw, 0.2, 'EACH COURSE IN THIS PROPOSAL', {size:8.5, b:true, c:K.BRAND, cs:1.3}));
    y += 0.27;
    const room = Math.max(1, Math.floor((noteTop - 0.1 - y) / 0.3));
    const shown = pList.length > room ? pList.slice(0, Math.max(1, room - 1)) : pList.slice();
    if (sel.inProposal && !shown.some(x => x.k === sel.k)) shown[shown.length - 1] = sel;
    const rcw = flex ? 1.3 : 0.95;
    shown.forEach(x => {
      const on = x.k === sel.k, Vx = on ? V : schedView(ctx, {k:x.k});
      const right = !x.priv ? (flex && Vx.plan ? 'Public · ' + Vx.plan.top : 'Public run') : Vx.plan ? (flex ? 'Private · ' : '') + schedDays(Vx.n) : 'No fit';
      if (on) els.push(RRECT(jx - 0.08, y - 0.02, jw + 0.16, 0.28, K.HL, 0.06));
      els.push(fit(T(jx, y, jw - rcw, 0.24, x.short, {size:10, b:on, c:K.INK, valign:'middle'}), {lines:1, box:false}));
      els.push(fit(T(jx + jw - rcw, y, rcw, 0.24, right, {size:10, b:on, c: on ? K.BRAND : K.MUTED, align:'right', valign:'middle'}), {lines:1, box:false}));
      if (!on){
        if (live && !ppt) controls.push({id:'schedK:' + x.k, kind:'button', label:'Show ' + x.short, x:jx - 0.08, y:y - 0.02, w:jw + 0.16, h:0.28, enabled:true});
        else if (ppt) els.push(GO(jx - 0.08, y - 0.02, jw + 0.16, 0.28, view.linkCourse(x.k), 'Show ' + x.short, 0.06));
      }
      y += 0.3;
    });
    if (shown.length < pList.length){
      els.push(T(jx, y, jw, 0.24, '+ ' + (pList.length - shown.length) + ' more in the Course selector', {size:9.5, i:true, c:K.MUTED, valign:'middle'}));
      y += 0.3;
    }
    y += 0.1;
  }
  const venue = sel.inProposal && sel.c.venueChoice ? cap(sel.c.venueChoice) : 'At your office or our Paya Lebar campus';
  // As many reasons as there is room for (the subtitle already covers the first two of the original table's points)
  const why = pub
    ? ['Join a scheduled class with other companies', 'Same course fee and SkillsFuture funding', 'Send one or a few staff at a time', 'Choose the run that suits each person']
    : [venue, 'Same course fee and SkillsFuture funding', 'Open discussion, with colleagues only', 'Exercises set in your own work', 'Only your team in the room'];
  const whyN = Math.min(why.length, Math.floor((noteTop - 0.1 - y - 0.28) / 0.25 + 1e-6));
  if (whyN >= 2){
    els.push(T(jx, y, jw, 0.2, pub ? 'WHY A PUBLIC INTAKE' : flex ? 'WHY A DEDICATED COHORT' : 'WHY A PRIVATE CLASS', {size:8.5, b:true, c:K.BRAND, cs:1.3}));
    y += 0.28;
    why.slice(0, whyN).forEach(w => {
      els.push(OVAL(jx + 0.02, y + 0.08, 0.08, 0.08, K.BRAND));
      els.push(fit(T(jx + 0.18, y, jw - 0.18, 0.23, w, {size:10, c:K.INK, valign:'middle'}), {lines:1, box:false}));
      y += 0.25;
    });
  }
  els.push(noteEl);

  return {bg:K.WHITE, els, name:'Delivery', slideKey:'delivery', sched:true, schedK:sel.k, schedN:V.n, controls,
    toc:{g:'programme', t: flex ? 'Delivery models and training schedule' : 'Delivery and training schedule', d: flex ? ['Dedicated cohort or public intake, and how the hours split', 'Training schedule'] : ['How the training splits across days', 'Training schedule']}};
}

/* ---------- Optional Slide: Training Timeline ---------- */
function parseFlexDate(str, fallbackDate){
  if (!str) return fallbackDate || new Date(2026, 9, 27);
  const iso = parseISO(str);
  if (iso) return iso;
  const m = String(str).match(/(\d{1,2})(?:\s*[–\-to]+\s*(\d{1,2}))?\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s*(\d{4}))?/i);
  if (m){
    const day = +m[1];
    const monIdx = SHORT_MONTHS.findIndex(x => x.toLowerCase() === m[3].slice(0, 3).toLowerCase());
    const yr = m[4] ? +m[4] : 2026;
    if (monIdx >= 0) return new Date(yr, monIdx, day);
  }
  return fallbackDate || new Date(2026, 9, 27);
}
function startOfMondayWeek(d){
  const res = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = res.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  res.setDate(res.getDate() + diff);
  return res;
}
function addDays(d, n){
  const res = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  res.setDate(res.getDate() + n);
  return res;
}

function slideTimeline(ctx){
  const {courses, client, S, pilotCourse, isLegacySfec} = ctx;
  const els = [];
  const eye = 'TIMELINE  ·  ' + (pilotCourse ? 'PILOT & ROLLOUT SCHEDULE' : 'PROPOSED TRAINING SCHEDULE');
  const headCandidates = pilotCourse
    ? ['From the ' + pilotCourse.short + ' pilot to full programme rollout', 'Proposed training timeline for ' + client, 'Proposed training timeline']
    : ['Reconciling training dates across ' + (ctx.multi ? 'courses and teams' : poss(client) + ' cohort'), 'Proposed training timeline'];
  header(els, eye, headCandidates);

  const subText = pilotCourse
    ? ['How approval, the ' + pilotCourse.short + ' pilot cohort' + (pilotCourse.dateShort ? ' (' + pilotCourse.dateShort + ')' : '') + ' and later courses fit into one coordinated schedule.',
       'How approval, the pilot cohort and later courses fit into one coordinated schedule.']
    : ['A clear schedule reconciling ' + (ctx.multi ? 'all ' + courses.length + ' courses across your teams' : 'review, approval and class delivery') + ', so teams can plan around their workload.'];
  els.push(fitFirst(subText, t => T(M, 1.38, 12.2, 0.30, t, {size:11.5, c:K.MUTED}), {lines:1, box:false}, 0.9));

  const propDate = parseISO(S.date) || new Date(2026, 9, 8);
  const decDate = parseISO(S.decision) || addDays(propDate, 5);
  const parsedCourseDates = courses.map((c, idx) => {
    const defStart = addDays(decDate, 10 + idx * 14);
    const startD = parseFlexDate(c.date, defStart);
    const spanDays = daysFor(c.hrs).d <= 1 ? 3 : daysFor(c.hrs).d === 2 ? 9 : 12;
    const endD = addDays(startD, spanDays);
    const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    return {c, idx, startD, endD, label: c.dateShort || (fmtDayMonth(iso(startD)) + '–' + fmtDayMonth(iso(endD)))};
  });

  const earliest = parsedCourseDates.reduce((min, x) => x.startD < min ? x.startD : min, propDate);
  const latest = parsedCourseDates.reduce((max, x) => x.endD > max ? x.endD : max, propDate);
  const wk0 = startOfMondayWeek(earliest);
  const numWeeks = 8;
  const weeksNeeded = Math.ceil((latest.getTime() - wk0.getTime()) / (7 * 86400000)) + 1;
  const step = weeksNeeded <= 8 ? 1 : weeksNeeded <= 16 ? 2 : 4;   // columns of one, two or four weeks
  const dm = d => d.getDate() + ' ' + SHORT_MONTHS[d.getMonth()];
  const weeks = [];
  for (let w = 0; w < numWeeks; w++){
    const wd = addDays(wk0, w * 7 * step);
    weeks.push({start: wd, label: step === 1 ? 'Wk of ' + dm(wd) : step === 2 ? dm(wd) + '–' + dm(addDays(wd, 13)) : 'From ' + dm(wd)});
  }
  const timelineSpanMs = numWeeks * 7 * step * 86400000;
  const rawFrac = d => (d.getTime() - wk0.getTime()) / timelineSpanMs;
  const posFrac = d => Math.max(0.01, Math.min(0.98, rawFrac(d)));

  const mx = M, mw = SW - 2 * M, my = 1.74;
  const stage1Title = '1. Review & approval';
  const stage1Sub = fmtDayMonth(S.date) + ' to ' + fmtDayMonth(S.decision) + ': approval by ' + (fmtDayMonth(S.decision) || 'agreed date');
  const pItem = pilotCourse || courses[0];
  const pParsed = parsedCourseDates.find(x => x.c === pItem) || parsedCourseDates[0];
  const stage2Title = pilotCourse ? ('2. The pilot: ' + pItem.short) : ('2. ' + (ctx.multi ? 'Stage 1: ' : '') + pItem.short);
  const stage2Sub = [pParsed.label + ', ' + daysFor(pItem.hrs).text + (pItem.team ? ' (' + pItem.team + ')' : ''), pParsed.label + ', ' + daysFor(pItem.hrs).text];
  const nextCourses = courses.filter(c => c !== pItem);
  const nextParsed = parsedCourseDates.filter(x => x.c !== pItem);
  const stage3Title = nextCourses.length
    ? ['3. ' + (ctx.standalone ? 'Later functional tracks' : 'Next pathway stages (' + nextCourses.map(c => c.short).join(' + ') + ')'), '3. ' + (ctx.standalone ? 'Later functional tracks' : 'Next pathway stages')]
    : ['3. Time for a second cohort or another course'];
  const stage3Sub = nextCourses.length
    ? [nextParsed.map(x => x.c.short + ': ' + x.label).join(' · '), nextCourses.length + ' more course' + (nextCourses.length > 1 ? 's' : '') + ', from ' + nextParsed[0].label]
    : ['Follow-on cohort or a Level 2 course' + (isLegacySfec && ctx.sfecOn ? ', before the 30 Nov SFEC deadline' : '')];

  const sCols = [
    {x: mx, w: mw * 0.25, title: [stage1Title], sub: [stage1Sub], fill: K.PALE, tc: K.INK, dashed: false},
    {x: mx + mw * 0.29, w: mw * 0.33, title: [stage2Title], sub: stage2Sub, fill: K.NAVY, tc: K.INK, dashed: false},
    {x: mx + mw * 0.66, w: mw * 0.34, title: stage3Title, sub: stage3Sub, fill: K.LAV1, tc: K.BRAND, dashed: true}
  ];
  sCols.forEach(st => {
    els.push(fitFirst(st.title, t => T(st.x, my - 0.02, st.w, 0.22, t, {size:10.5, b:true, c:st.tc}), {lines:1, box:false}, 0.92));
    els.push(fitFirst(st.sub, t => T(st.x, my + 0.19, st.w, 0.2, t, {size:9, c:K.MUTED}), {lines:1, box:false}, 0.95));
    els.push(RRECT(st.x, my + 0.42, st.w, 0.26, st.fill, 0.07, st.dashed ? {line:{c:K.BRAND, w:1.3, dash:true}} : {}));
  });
  const axY = my + 0.76;
  els.push(LINE(mx, axY, mx + mw, axY, K.LINE, 1.5));
  weeks.forEach((wk, wi) => {
    const tx = mx + (wi / numWeeks) * mw;
    els.push(LINE(tx, axY - 0.05, tx, axY + 0.05, K.LINE, 1.2));
  });

  const gx = 3.65, gw = mx + mw - gx, gy = 2.64, gh = 2.68;
  const colW = gw / numWeeks;
  weeks.forEach((wk, wi) => {
    const wx = gx + wi * colW;
    els.push(RECT(wx, gy, colW, gh, wi % 2 === 0 ? K.ZEBRA : K.WHITE));
    els.push(fit(T(wx + 0.04, gy + 0.06, colW - 0.08, 0.22, wk.label, {size:9, b:true, c:K.MUTED, align:'center', valign:'middle'}), {lines:1, box:false}));
  });

  // SFEC change-over marker, drawn at its real date when it falls inside the weeks shown (its label sits in the legend)
  let markLabel = '', markX = 0;
  if (ctx.sfecOn){
    const mark = isLegacySfec ? new Date(2026, 10, 30, 23, 59) : new Date(2026, 11, 1);
    const f = rawFrac(mark);
    if (f > 0.02 && f < 0.97){
      const lx = gx + f * gw;
      els.push(LINE(lx, gy + 0.3, lx, gy + gh - 0.3, isLegacySfec ? K.RED : K.BRAND, 1.6, true));
      markX = lx;
      markLabel = isLegacySfec ? '30 Nov: current SFEC ends' : '1 Dec: redesigned SFEC starts';
    }
  }

  const n = parsedCourseDates.length, compact = n > 4;
  const rTop = gy + 0.34;
  const rAvail = gh - 0.62;
  const rowStep = rAvail / Math.max(1, n);

  parsedCourseDates.forEach((item, ri) => {
    const c = item.c;
    const ry = rTop + ri * rowStep;
    const isPilot = !!c.pilot;
    const isSolid = isPilot || (!pilotCourse && ri === 0);
    const bh = compact ? Math.min(0.26, rowStep * 0.72) : Math.min(0.32, rowStep * 0.58);
    const by = compact ? ry + (rowStep - bh) / 2 : ry + 0.08;
    if (compact){
      const lab = [(isPilot ? 'Pilot: ' : (ri + 1) + '. ') + c.name + ' (' + c.pax + ' pax)', (isPilot ? 'Pilot: ' : (ri + 1) + '. ') + c.short + ' (' + c.pax + ' pax)', (isPilot ? 'Pilot: ' : (ri + 1) + '. ') + c.short];
      els.push(fitFirst(lab, t => T(M, by, gx - M - 0.15, bh, t, {size:9.5, b:true, c: isPilot ? K.GOLD : K.INK, valign:'middle'}), {lines:1, box:false}, 0.95));
    } else {
      const stg = !ctx.standalone && c.stageLabel ? c.stageLabel.toUpperCase() : null;
      const trackLabel = stg ? [stg + '  ·  ' + c.pax + ' PAX', stg] : [(isPilot ? 'PILOT COHORT' : (ctx.standalone ? 'FUNCTIONAL TRACK ' + (ri + 1) : 'STAGE ' + stageNo(ctx, c))) + (c.team ? '  ·  ' + c.team.toUpperCase() : '') + '  ·  ' + c.pax + ' PAX',
                          (isPilot ? 'PILOT COHORT' : (ctx.standalone ? 'TRACK ' + (ri + 1) : 'STAGE ' + stageNo(ctx, c))) + '  ·  ' + c.pax + ' PAX'];
      els.push(fitFirst(trackLabel, t => T(M, ry - 0.02, gx - M - 0.15, 0.19, t, {size:8.5, b:true, c: isPilot ? K.GOLD : K.BRAND, cs:1}), {lines:1, box:false}, 0.95));
      els.push(fitFirst([(isSolid ? '' : '+ ') + c.name, (isSolid ? '' : '+ ') + c.short], t => T(M, ry + 0.16, gx - M - 0.15, 0.24, t, {size:10.5, b:true, c:K.INK, valign:'middle'}), {lines:1, box:false}, 0.9));
    }
    const fStart = posFrac(item.startD);
    const fEnd = Math.max(fStart + 0.11, posFrac(item.endD));
    const bx = gx + fStart * gw;
    const bw = Math.min(gw - (bx - gx) - 0.06, Math.max(0.75, (fEnd - fStart) * gw));
    if (isSolid){
      els.push(RRECT(bx, by, bw, bh, isPilot ? K.NAVY : K.BRAND, 0.06));
      if (isPilot && bw > 0.9) els.push(T(bx + 0.1, by, bw - 0.2, bh, 'PILOT', {size:8.5, b:true, c:K.AMB, valign:'middle', cs:1}));
    } else {
      els.push(RRECT(bx, by, bw, bh, K.WHITE, 0.06, {line:{c:K.BRAND, w:1.4, dash:true}}));
    }
    const sched = [(ctx.weekday ? 'Weekday sessions' : 'Weekend sessions') + ' · ' + (c.priv ? c.venue.replace(/^at /, '') : 'public run') + ' · ' + item.label + ' (' + hrsText(c.hrs) + ')',
                   item.label + ' · ' + hrsText(c.hrs), item.label];
    const rightRoom = (gx + gw) - (bx + bw + 0.10);
    if (rightRoom >= 2.0){
      els.push(fitFirst(sched, t => T(bx + bw + 0.10, by, rightRoom - 0.05, bh, t, {size:9, c:K.MUTED, valign:'middle'}), {lines:1, box:false}, 0.95));
    } else {
      const clearMark = markX && markX < bx && markX > bx - Math.max(1.5, bx - gx - 0.10) - 0.08;
      const leftRoom = clearMark ? Math.max(0.5, bx - markX - 0.2) : Math.max(1.5, bx - gx - 0.10);
      els.push(fitFirst(sched, t => T(bx - leftRoom - 0.08, by, leftRoom, bh, t, {size:9, c:K.MUTED, align:'right', valign:'middle'}), {lines:1, box:false}, 0.95));
    }
  });

  const legY = gy + gh - 0.25;
  els.push(RRECT(gx + 0.08, legY + 0.03, 0.34, 0.16, pilotCourse ? K.NAVY : K.BRAND, 0.04));
  els.push(T(gx + 0.48, legY, 2.5, 0.22, pilotCourse ? 'Pilot cohort (first commitment)' : 'First cohort', {size:9, c:K.MUTED, valign:'middle'}));
  els.push(RRECT(gx + 2.95, legY + 0.03, 0.34, 0.16, K.WHITE, 0.04, {line:{c:K.BRAND, w:1.2, dash:true}}));
  els.push(T(gx + 3.35, legY, 2.9, 0.22, 'Later pathway or functional courses', {size:9, c:K.MUTED, valign:'middle'}));
  if (markLabel){
    els.push(LINE(gx + 6.35, legY + 0.02, gx + 6.35, legY + 0.2, isLegacySfec ? K.RED : K.BRAND, 1.6, true));
    els.push(fit(T(gx + 6.47, legY, gw - 6.5, 0.22, markLabel, {size:9, b:true, c: isLegacySfec ? K.RED : K.BRAND, valign:'middle'}), {lines:1, box:false}));
  }

  const cy = 5.46, ch = 1.36, cGap = 0.24, cw = (SW - 2 * M - 2 * cGap) / 3;
  const decTxt = fmtLong(S.decision) || 'your preferred date';
  const cards = [
    [
      pilotCourse ? 'Pilot first, before wider commitment' : 'Structured, low-disruption rollout',
      pilotCourse
        ? ('Launching with ' + pilotCourse.short + (pilotCourse.team ? ' for the ' + pilotCourse.team : '') + ' (' + pilotCourse.pax + ' pax) lets ' + client + ' validate real workplace outputs before committing to later courses.')
        : ('Courses are spaced across weeks so participants can apply each module to their desk work without overwhelming any single team.')
    ],
    [
      ctx.distinctTeams.length > 1 ? 'Coordinated across functional teams' : 'Flexible full-day or half-day sessions',
      ctx.distinctTeams.length > 1
        ? ('Each track (' + ctx.distinctTeams.join(', ') + ') is scheduled around team availability, so no department is out of the office at the same time.')
        : ('Sessions can run as full days or as half days (' + (ctx.weekday ? 'mornings or afternoons on weekdays' : 'on weekends') + '), keeping the rest of each day free for core work.')
    ],
    !ctx.sfecOn
      ? ['Lock in trainer dates', 'Approval by ' + decTxt + ' locks in trainer availability for ' + (ctx.trainingDateFmt || 'your target dates') + '.']
      : isLegacySfec
      ? ['Confirm early: SFEC ends 30 Nov', 'Approval by ' + decTxt + ' secures trainers so every cohort completes, and is claimed, before the current SFEC closes on 30 November 2026.']
      : ctx.legacyCourses && ctx.legacyCourses.length
      ? ['Current SFEC first, then the new credit', 'Approval by ' + decTxt + ' secures ' + joinList(ctx.legacyCourses.map(c => c.short + (c.dateShort ? ' (' + c.dateShort + ')' : ''))) + ', completed and claimed under the current SFEC before it lapses on 30 November 2026. Later courses use the new credit, offset upfront from 1 December.']
      : ['Lock in dates and upfront SFEC', 'Approval by ' + decTxt + ' locks in trainer availability for ' + (ctx.trainingDateFmt || 'your target dates') + ', with SFEC offset upfront under the scheme that starts on 1 December 2026.']
  ];
  cards.forEach((cd, i) => {
    const x = M + i * (cw + cGap);
    els.push(RRECT(x, cy, cw, ch, K.LAV1, 0.12));
    els.push(fit(T(x + 0.22, cy + 0.14, cw - 0.44, 0.28, cd[0], {size:11.5, b:true, c:K.INK}), {lines:1, box:false}));
    els.push(fit(T(x + 0.22, cy + 0.44, cw - 0.44, ch - 0.54, cd[1], {size:9.5, c:K.MUTED}), {lines:4}));
  });

  return {
    bg: K.WHITE, els, name: 'Training timeline', slideKey: 'timeline',
    toc: {g:'programme', t:'Training timeline', d:['Reconciled schedule across ' + (pilotCourse ? 'the pilot and later courses' : 'courses and teams')]}
  };
}

/* ---------- Slide: Government Support (per participant) ---------- */
function fundCourses(ctx){
  const {courses} = ctx;
  if (courses.length > 1 && ctx.legacyCourses && ctx.legacyCourses.length){
    // v2.1: the combined view adds up the redesigned-SFEC courses only; a current-SFEC course is shown on its own
    const main = mainCourses(courses), list = [];
    const legTag = ' (current SFEC)';
    if (main.length > 1){
      const fee = main.reduce((a, c) => a + c.fee, 0), hrs = main.reduce((a, c) => a + c.hrs, 0);
      list.push({key:'comb', label:'All ' + main.length + ' courses from 1 Dec 2026: ' + main.map(c => c.short).join(' + '), title:'All ' + main.length + ' courses from 1 Dec combined',
                 sub:money0(fee) + ' before GST · ' + hrsText(hrs), courses:main});
    }
    courses.forEach((c, idx) => {
      const t = c.legacySfec ? legTag : (c.pilot ? ' (pilot)' : '');
      list.push({key:'c' + (idx + 1), label:'Course ' + (idx + 1) + (c.legacySfec ? legTag : c.pilot ? ' (pilot)' : (c.lvl ? ' (Level ' + c.lvl + ')' : '')) + ': ' + c.name + (c.team ? ' · ' + c.team : ''),
                 title:'Course ' + (idx + 1) + ': ' + c.short + t, sub:money0(c.fee) + ' before GST · ' + hrsText(c.hrs), courses:[c], legacy:!!c.legacySfec});
    });
    return list;
  }
  if (courses.length === 1){
    const c1 = courses[0];
    return [{key:'c1', label:(c1.lvl ? 'Level ' + c1.lvl + ': ' : '') + c1.name + (c1.pilot ? ' (pilot)' : ''), title:c1.short + (c1.pilot ? ' (pilot)' : ''),
             sub:money0(c1.fee) + ' before GST · ' + hrsText(c1.hrs), courses:[c1]}];
  }
  const list = [{key:'comb', label:'All ' + courses.length + ' courses: ' + courses.map(c => c.short).join(' + '), title:'All ' + courses.length + ' courses combined',
                 sub:money0(ctx.totalFeePerPax) + ' before GST · ' + hrsText(ctx.totalHrs), courses}];
  courses.forEach((c, idx) => {
    list.push({key:'c' + (idx + 1), label:'Course ' + (idx + 1) + (c.pilot ? ' (pilot)' : (c.lvl ? ' (Level ' + c.lvl + ')' : '')) + ': ' + c.name + (c.team ? ' · ' + c.team : ''),
               title:'Course ' + (idx + 1) + ': ' + c.short + (c.pilot ? ' (pilot)' : ''), sub:money0(c.fee) + ' before GST · ' + hrsText(c.hrs), courses:[c]});
  });
  return list;
}

/* A labelled selector box. Live decks lay a real <select> over it (slide.controls); the PowerPoint export
   links it to the next view; PDF and printed copies show it as a plain label without the arrow. */
function selectorBox(els, o){
  const live = o.mode !== 'static';
  const accent = o.accent || K.BRAND;
  els.push(RRECT(o.x, o.y, o.w, o.h, live ? K.WHITE : K.ZEBRA, 0.07, {line:{c: live ? accent : K.BORDER, w: live ? 1.2 : 0.75}}));
  const tw = o.w - (live ? 0.52 : 0.24);
  els.push(fit(T(o.x + 0.12, o.y + 0.05, tw, 0.18, o.label, {size:8.5, b:true, c: accent === K.GOLD ? K.GOLD : K.BRAND, cs:1}), {lines:1, box:false}));
  els.push(fitFirst([].concat(o.value), t => T(o.x + 0.12, o.y + 0.21, tw, o.h - 0.24, t, {size:10.5, b:true, c:K.INK, valign:'middle'}), {lines:1, box:false}, 0.92));
  if (live){
    const bx = o.x + o.w - 0.36, by = o.y + 0.08, bw = 0.28, bh = o.h - 0.16;
    els.push(RRECT(bx, by, bw, bh, accent, 0.05));
    els.push(LINE(bx + 0.07, by + bh / 2 - 0.035, bx + 0.14, by + bh / 2 + 0.035, K.WHITE, 1.6));
    els.push(LINE(bx + 0.14, by + bh / 2 + 0.035, bx + 0.21, by + bh / 2 - 0.035, K.WHITE, 1.6));
    if (o.link != null) els.push(GO(o.x, o.y, o.w, o.h, o.link, o.tip || o.label, 0.07));
  }
}
function stepButton(els, x, y, w, h, sign, enabled, link, tip){
  els.push(RRECT(x, y, w, h, enabled ? K.WHITE : K.ZEBRA, 0.07, {line:{c: enabled ? K.C9 : K.LINE, w:1}}));
  els.push(T(x, y, w, h, sign, {size:14, b:true, c: enabled ? K.INK : K.GREY, align:'center', valign:'middle'}));
  if (enabled && link != null) els.push(GO(x, y, w, h, link, tip, 0.07));
}
/* One row of a money table: a bold label and a muted note on the left, the amount on the right. */
function moneyRow(els, x, y, w, h, row){
  if (row.kind === 'sec'){
    els.push(RECT(x, y, w, h, K.ZEBRA));
    els.push(fit(T(x + 0.12, y, w - 0.24, h, row.label, {size:8.5, b:true, c: row.c || K.BRAND, cs:1.3, valign:'middle'}), {lines:1, box:false}));
    return;
  }
  const total = row.kind === 'total' || row.kind === 'good';
  const fill = row.kind === 'total' ? K.HL : row.kind === 'good' ? K.GREEN_BG : null;
  if (fill) els.push(RRECT(x, y + 0.025, w, h - 0.05, fill, 0.06));
  else els.push(LINE(x + 0.12, y + h, x + w - 0.12, y + h, K.BORDER, 0.6));
  const vw = 2.05;
  const mk = note => {
    const runs = [run(row.label, {size: total ? 11 : 10.5, b:true, c: row.kind === 'good' ? K.GREEN : K.INK})];
    if (note) runs.push(run('   ' + note, {size:9.5, c:K.MUTED}));
    return T(x + 0.12, y, w - vw - 0.28, h, runs, {valign:'middle'});
  };
  els.push(fitFirst([].concat(row.note || ''), mk, {lines:1, box:false}, 0.95));
  els.push(fit(T(x + w - vw - 0.12, y, vw, h, row.value, {size: total ? 13.5 : 11, f: total ? 'h' : null, b: !total && !!row.bold, i: !!row.na,
    c: row.na ? K.GREY : (row.kind === 'good' ? K.GREEN : (row.vc || (total ? K.BRAND : K.INK))), align:'right', valign:'middle'}), {lines:1, box:false}));
}
function moneyRows(els, x, y, w, rows, hs){
  hs = hs || {sec:0.27, row:0.3, total:0.37};
  rows.forEach(r => {
    const h = r.kind === 'sec' ? hs.sec : (r.kind === 'total' || r.kind === 'good') ? hs.total : hs.row;
    moneyRow(els, x, y, w, h, r);
    y += h;
  });
  return y;
}
const NA = (label, note, value) => ({label, note, value, na:true});
const TERMS_LINE = 'Terms: SFEC = SkillsFuture Enterprise Credit · EIS = Enterprise Innovation Scheme · PR = Singapore Permanent Resident · UEN = company registration number.';

function slideFunding(ctx, fView){
  fView = fView || {};
  const cList = fView.cList || fundCourses(ctx);
  const groups = fView.groups || ctx.groups;
  const cKey = cList.some(c => c.key === fView.cKey) ? fView.cKey : cList[0].key;
  const gIdx = (fView.gIdx != null && groups[fView.gIdx]) ? +fView.gIdx : 0;
  const cObj = cList.find(c => c.key === cKey) || cList[0];
  // v2.1: a current-SFEC course chosen on its own is shown under the current scheme's rules
  const legView = !ctx.isLegacySfec && cObj.courses.length > 0 && cObj.courses.every(c => c.legacySfec);
  if (legView) ctx = legacyCtx(ctx);
  const {c1, client, S, isLegacySfec} = ctx;
  const sw = sfecWords(ctx);
  const g = groups[gIdx] || groups[0];
  const mode = fView.mode || 'live', live = mode !== 'static';
  const hasCourseDrop = cList.length > 1, hasResDrop = groups.length > 1;
  const els = [], controls = [];

  header(els, ['INVESTMENT  ·  PER PARTICIPANT  ·  ' + (ctx.sfecOn ? sw.badge : 'SKILLSFUTURE FUNDING'), 'INVESTMENT  ·  PER PARTICIPANT'], 'Available government support');
  const legC = legView ? cObj.courses[0] : null;
  const lead = legView
    ? legC.short + ' finishes before 30 November 2026, so it uses the current SFEC: up to ' + sw.pct + ' of the nett fee, before GST, claimed back after the course. Figures are per participant.'
    : ctx.legacyCourses && ctx.legacyCourses.length && !isLegacySfec && cObj.courses.length > 1
    ? 'The courses from 1 December 2026 are SkillsFuture-funded, with the SkillsFuture Enterprise Credit (SFEC) ' + sw.how + '. Figures are per participant.'
    : (ctx.multi ? 'All the courses are' : 'The course is') + ' SkillsFuture-funded' + (ctx.sfecOn ? ', with the SkillsFuture Enterprise Credit (SFEC) ' + sw.how : '') + '. Figures are per participant.';
  const hint = live && (hasCourseDrop || hasResDrop) ? (hasCourseDrop && hasResDrop ? ' Use the selectors to change the course and residency.' : hasCourseDrop ? ' Use the selector to see each course.' : ' Use the selector to change the residency.') : '';
  els.push(fitFirst([lead + hint, lead], t => T(M, 1.36, 12.2, 0.32, t, {size:11.5, c:K.MUTED}), {lines:1, box:false}, 0.9));

  const lx = M, lw = 7.95, selY = 1.8, selH = 0.52, courseW = 4.7;
  const nextC = cList[(cList.findIndex(c => c.key === cKey) + 1) % cList.length];
  selectorBox(els, {x:lx, y:selY, w:courseW, h:selH, label: hasCourseDrop ? 'COURSE' : 'FEES FOR', value:[cObj.title + '  ·  ' + cObj.sub, cObj.title],
    mode: hasCourseDrop ? mode : 'static', accent:K.GOLD, link: hasCourseDrop && fView.linkCourse ? fView.linkCourse(nextC.key) : null, tip:'Show ' + nextC.label});
  if (hasCourseDrop) controls.push({id:'fundCourse', kind:'select', label:'Course', x:lx, y:selY, w:courseW, h:selH, value:cKey, options:cList.map(c => ({value:c.key, label:c.label}))});
  const resX = lx + courseW + 0.15, resW = lw - courseW - 0.15;
  const nextG = (gIdx + 1) % groups.length;
  selectorBox(els, {x:resX, y:selY, w:resW, h:selH, label:'PARTICIPANT', value:[g.h1 + '  ·  ' + g.h2, g.h1 + '  ·  ' + (g.pass ? 'no funding' : g.rate + '% funding'), g.h1], mode: hasResDrop ? mode : 'static', accent:K.BRAND,
    link: hasResDrop && fView.linkGroup ? fView.linkGroup(nextG) : null, tip:'Show ' + groups[nextG].label});
  if (hasResDrop) controls.push({id:'fundGroup', kind:'select', label:'Residency', x:resX, y:selY, w:resW, h:selH, value:String(gIdx), options:groups.map((x, i) => ({value:String(i), label:x.label}))});

  const p = sumPerList(cObj.courses.map(c => per(c, g.rate, ctx)));
  const apHrs = cObj.courses.reduce((s, c) => s + c.ap, 0);
  const pass = !!g.pass;
  const has50Group = groups.some(x => x.rate === 50);
  const rows = [{kind:'sec', label:'PAYABLE AT ENROLMENT'}];
  rows.push({label:'Course fee', note: cObj.courses.length === 1 ? 'before GST' : [cObj.courses.map(c => c.short).join(' + ') + ', before GST', cObj.courses.length + ' courses, before GST'], value:money(p.fee), bold:true});
  if (pass) rows.push(NA('SkillsFuture funding', 'not available to pass holders', 'Not eligible'));
  else if (g.rate === 70 && has50Group){
    rows.push({label:'SkillsFuture funding', note:'50% baseline', value:minus(p.base)});
    rows.push({label:'Extra 20% funding', note: S.tier === 'unknown' ? 'SME-sponsored staff, or Citizens aged 40+' : 'Singapore Citizens aged 40 and above', value:minus(p.add)});
  } else rows.push({label:'SkillsFuture funding', note:g.rate + '% of the course fee', value:minus(p.fund)});
  if (ctx.sfecOn && !isLegacySfec) rows.push(pass ? NA('SFEC offset upfront', 'not available to pass holders', 'Not eligible') : {label:'SFEC offset upfront', note:sw.cover, value:minus(p.sfec)});
  rows.push({label:'GST', note:'9% of the full course fee', value:plus(p.gst)});
  rows.push({kind:'total', label:'Upfront payment', note:'payable at enrolment', value:money(p.up)});
  rows.push({kind:'sec', label:'CLAIMED BACK AFTER THE COURSE*'});
  if (ctx.sfecOn && isLegacySfec) rows.push({label:'SFEC claimed back', note:sw.cover, value:'up to ' + money(p.sfec), vc:K.GREEN, bold:true});
  rows.push({label:'GST claimed back', note:'as input tax, if GST-registered', value:'up to ' + money(p.gst)});
  rows.push({kind:'good', label:'Net course cost', note:'after funding' + (ctx.sfecOn ? ', SFEC' : '') + ' and the GST claim', value:money(p.netCost)});
  rows.push({kind:'sec', label:'ALSO AVAILABLE, NOT DEDUCTED ABOVE*', c:K.GREEN});
  rows.push(pass ? NA('Absentee Payroll', 'not available to pass holders', 'Not eligible')
    : ctx.weekday ? {label:'Absentee Payroll', note:'salary support, S$4.50/hr × ' + apHrs + ' hrs', value:'up to ' + money(p.ap)} : NA('Absentee Payroll', 'weekday classes only', 'Weekdays only'));
  rows.push(p.eis > 0 ? {label:'EIS tax saving', note:'400% tax deduction at 17%', value:'up to ' + money(p.eis)} : NA('EIS tax saving', 'no nett fee left after SFEC', 'Nothing to deduct'));
  const yEnd = moneyRows(els, lx, selY + selH + 0.1, lw, rows);

  const rx = lx + lw + 0.3, rw = SW - M - rx, ry = selY, rh = yEnd - ry;
  els.push(RRECT(rx, ry, rw, rh, K.LAV1));
  els.push(fitFirst([('What this means for ' + client).toUpperCase(), 'WHAT THIS MEANS FOR YOUR TEAM'], t => T(rx + 0.25, ry + 0.18, rw - 0.5, 0.24, t, {size:9, b:true, c:K.BRAND, cs:1.6}), {lines:1, box:false}, 0.9));
  const pts = [];
  if (S.tier === '70') pts.push(['70% course-fee funding', 'A Training Partners Gateway check indicates 70% funding for every Singapore Citizen and PR at ' + client + ', whatever their age. We re-check it against the sponsoring company’s UEN at enrolment.']);
  else if (S.tier === '50') pts.push(['50% baseline, 70% from age 40', 'A Training Partners Gateway check shows 50% funding for Citizens below 40 and PRs, and 70% for Singapore Citizens aged 40 and above.']);
  else pts.push(['Your funding level', 'We confirm whether 50% or 70% applies with a Training Partners Gateway check against ' + poss(client) + ' UEN, before any commitment.']);
  if (ctx.sfecOn){
    if (ctx.multiUen && ctx.uens.length > 1) pts.push(['SFEC across ' + ctx.uens.length + ' entities', 'Each sponsoring entity uses its own SFEC balance (' + money0(ctx.bal) + ' in total), ' + (live ? 'chosen with the entity selector on the calculator slide.' : 'shown on its own calculator page.')]);
    else if (legView) pts.push(['SFEC claimed back (current scheme)', client + ' pays the fee after SkillsFuture funding at enrolment, then claims up to ' + sw.pct + ' of that nett fee (before GST) from its current SFEC balance' + (ctx.legacyBal > 0 ? ' of about ' + money0(ctx.legacyBal) : '') + ' once the course is completed. The balance lapses on 30 November 2026.']);
    else if (isLegacySfec) pts.push(['SFEC claimed back (current scheme)', client + ' pays the fee after SkillsFuture funding at enrolment, then claims up to ' + sw.pct + ' of the remaining fee from its SFEC balance after the course, by 30 November 2026.']);
    else pts.push(['SFEC offset upfront', sw.full
      ? 'From 1 December 2026, the redesigned SFEC covers the full nett course fee at enrolment, from a fresh S$10,000 credit valid to ' + SFEC_NEW_EXPIRY + ', so ' + client + ' pays only the 9% GST while the credit lasts.'
      : 'From 1 December 2026, the redesigned SFEC offsets ' + sw.pct + ' of the nett course fee at enrolment, from a fresh S$10,000 credit.']);
  } else {
    pts.push(ctx.weekday ? ['Absentee Payroll on weekdays', 'Weekday classes add S$4.50 per hour attended for each Singapore Citizen and PR, paid to the employer.'] : ['Weekend classes', 'Absentee Payroll applies only to weekday classes, so it is not claimable for a weekend run.']);
  }
  pts.push(['After the course', 'GST is claimed back in ' + poss(client) + ' GST return' + (ctx.weekday ? ', Absentee Payroll is paid to the employer once the course is completed,' : '') + ' and the EIS deduction is claimed in the tax filing.']);
  const slot = (rh - 0.55) / 3;
  pts.forEach((pItem, i) => {
    const y = ry + 0.56 + i * slot;
    circleNum(els, i + 1, rx + 0.25, y, 0.34, K.BRAND, K.WHITE, 10);
    els.push(fit(T(rx + 0.72, y - 0.01, rw - 0.95, 0.28, pItem[0], {size:11, b:true, c:K.INK}), {lines:1, box:false}));
    els.push(fit(T(rx + 0.72, y + 0.28, rw - 0.95, slot - 0.34, pItem[1], {size:10, c:K.MUTED}), {}));
  });
  const n1 = '*Subject to course completion (at least 75% attendance and the assessment) and to the sponsoring company’s GST registration and tax position. Figures are illustrative and confirmed at enrolment.' + (ctx.sfecOn && !isLegacySfec ? ' The redesigned SFEC does not cover GST and is subject to SWDA’s guidelines and the credit balance.' : '');
  els.push(fit(T(M, yEnd + 0.07, SW - 2 * M, Math.max(0.3, 6.98 - yEnd - 0.07), [para([run(n1, {size:9, i:true, c:K.INK})], {after:1}), para([run(TERMS_LINE, {size:9, c:K.MUTED})])]), {}));
  return {
    bg:K.WHITE, els, name:'Government support', slideKey:'funding', fund:true, fCourse:cKey, fGroup:gIdx, controls,
    toc:{g:'investment', t:'Government support', d:[ctx.sfecOn ? (isLegacySfec ? 'SkillsFuture funding, SFEC claimed back and other claims' : 'SkillsFuture funding, SFEC upfront and other claims') : 'SkillsFuture funding and other claims']}
  };
}

/* ---------- Slide: Cohort investment & calculator (one per sponsoring entity) ---------- */
const HP = {LEFT:'2254F6', USED:'C84031', R50:'2253F6', R70:'1D2968'};
function fmtSize(b){ return b >= 1048576 ? (Math.round(b / 104857.6) / 10) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }

/* Which courses belong to a sponsoring entity's calculator page */
function coursesForUen(ctx, uenObj){
  if (!uenObj) return ctx.courses;
  const assigned = ctx.courses.filter(c => c.uenId === uenObj.id);
  if (assigned.length) return assigned;
  const unassigned = ctx.courses.filter(c => !c.uenId);
  return unassigned.length ? unassigned : ctx.courses;
}
function calcCourseOptions(ctx, uenObj){
  const scoped = coursesForUen(ctx, uenObj);
  const multi = ctx.courses.length > 1;
  const opt = c => ({key:c.cKey, label:(multi ? 'Course ' + (c.idx + 1) + (c.pilot ? ' (pilot)' : '') + ': ' : '') + c.name + ' (' + c.pax + ' pax)',
    title:(multi ? 'Course ' + (c.idx + 1) + ': ' + c.short : c.name) + (c.pilot ? ' (pilot)' : ''), short:c.short + (c.pilot ? ' (pilot)' : ''), courses:[c]});
  if (scoped.length <= 1) return [opt(scoped[0] || ctx.c1)];
  if (scoped.some(c => c.legacySfec)){
    // v2.1: the combined view adds up the redesigned-SFEC courses; each current-SFEC course is its own option
    const main = mainCourses(scoped);
    const legOpt = c => Object.assign(opt(c), {label:(multi ? 'Course ' + (c.idx + 1) + ' (current SFEC): ' : '') + c.name + ' (' + c.pax + ' pax)',
      title:(multi ? 'Course ' + (c.idx + 1) + ': ' + c.short : c.name) + ' (current SFEC)', short:c.short + ' (current SFEC)', legacy:true});
    const comb = main.length > 1 ? [{key:'comb', label:'All ' + main.length + ' courses from 1 Dec 2026: ' + main.map(c => c.short).join(' + '), title:'All ' + main.length + ' courses from 1 Dec combined', short:'Courses from 1 Dec', courses:main}] : [];
    return comb.concat(scoped.map(c => c.legacySfec ? legOpt(c) : opt(c)));
  }
  return [{key:'comb', label:'All ' + scoped.length + ' courses: ' + scoped.map(c => c.short).join(' + '), title:'All ' + scoped.length + ' courses combined', short:'All courses', courses:scoped}]
    .concat(scoped.map(opt));
}
function defaultBalCents(ctx, uenObj){
  if (!ctx.sfecOn) return null;
  if (uenObj) return uenObj.balCents;
  return (ctx.sfecKnown && ctx.bal > 0) ? Math.round(ctx.bal * 100) : null;
}
function uniformMakeup(q, rate){ q = Math.max(0, Math.round(+q || 0)); return rate === 70 ? {n50:0, n70:q, npass:0} : rate === 0 ? {n50:0, n70:0, npass:q} : {n50:q, n70:0, npass:0}; }
function defaultRate(ctx){ return ctx.S.tier === '70' ? 70 : 50; }
/* SME-sponsored: every Singapore Citizen and PR gets 70%. */
function defaultSme(ctx){ return ctx.S.tier === '70'; }
/* True when a plan has more than one funding group on a course, or a group other than the proposal's default. */
function planMixed(ctx, plan){
  const def = defaultRate(ctx) === 70 ? 'n70' : 'n50';
  return plan.lines.some(l => ['n50', 'n70', 'npass'].filter(k => l.mk[k] > 0).length > 1 || (l.qty > 0 && !l.mk[def]));
}
function baseMakeup(ctx, c, rate){
  if (rate == null && ctx.exactMakeup && c.m && c.m.qty > 0) return {n50:c.m.n50, n70:c.m.n70, npass:c.m.npass};
  return uniformMakeup(c.pax, rate != null ? rate : defaultRate(ctx));
}
/* Cohort plan. o = {uenObj, cKey ('comb' | 'c1'...), mk: {c1:{n50,n70,npass}} per-course overrides, rate (50|70|0), balCents (null = unknown)}
   Amounts in cents. SFEC is drawn from the balance course by course, in order. */
function planFor(ctx, o){
  o = o || {};
  const uenObj = o.uenObj || null;
  const scopedAll = coursesForUen(ctx, uenObj);
  const scoped = o.only ? scopedAll.filter(c => o.only.has(c.cKey)) : scopedAll;   // the combined view counts a shared course once
  // v2.1: 'comb' adds up the redesigned-SFEC courses; o.all (the whole proposal) keeps every course, each on its own scheme
  const combSet = o.all ? scoped : mainCourses(scoped);
  const valid = k => k === 'comb' ? combSet.length > 1 : scoped.some(c => c.cKey === k);
  const cKey = (o.cKey && valid(o.cKey)) ? o.cKey : (combSet.length > 1 ? 'comb' : combSet[0].cKey);
  const active = cKey === 'comb' ? combSet : scoped.filter(c => c.cKey === cKey);
  const allLeg = !ctx.isLegacySfec && active.length > 0 && active.every(c => c.legacySfec);
  const legacy = ctx.isLegacySfec || allLeg;
  const balMain = o.balCents !== undefined && !allLeg ? o.balCents : defaultBalCents(ctx, uenObj);
  const balLeg = o.balCents !== undefined && allLeg ? o.balCents : (ctx.legacyBal > 0 ? Math.round(ctx.legacyBal * 100) : null);
  const bal = allLeg ? balLeg : balMain;
  let leftM = balMain == null ? Infinity : balMain, leftL = balLeg == null ? Infinity : balLeg;
  const lines = active.map(c => {
    const mk = (o.mk && o.mk[c.cKey]) || baseMakeup(ctx, c, o.rate);
    const q = mk.n50 + mk.n70 + mk.npass;
    const p50 = per(c, 50, ctx), p70 = per(c, 70, ctx), p0 = per(c, 0, ctx);
    const fee = p50.fee * q;
    const fund50 = p50.fund * mk.n50, fund70 = p70.fund * mk.n70;
    const net = p50.net * mk.n50 + p70.net * mk.n70 + p0.net * mk.npass;
    const gst = p50.gst * q;
    const sfec = p50.sfec * mk.n50 + p70.sfec * mk.n70 + p0.sfec * mk.npass;
    const lg = legacy || c.legacySfec, useL = !ctx.isLegacySfec && !!c.legacySfec, pool = useL ? balLeg : balMain;
    const sfecUsed = Math.max(0, Math.min(sfec, useL ? leftL : leftM));
    if (pool != null){ if (useL) leftL -= sfecUsed; else leftM -= sfecUsed; }
    const up = net + gst - (lg ? 0 : sfecUsed);
    const netCost = net - sfecUsed;
    return {n:c.idx + 1, c, mk, qty:q, fee, fund:fund50 + fund70, fund50, fund70, net, gst, sfec, sfecUsed, up,
            sfecBack: lg ? sfecUsed : 0, gstBack:gst, netCost, ap:p50.ap * mk.n50 + p70.ap * mk.n70, eis:Math.round(netCost * 0.68),
            capped: pool != null && sfecUsed < sfec, legacy:lg};
  });
  const left = allLeg ? leftL : leftM;
  const plan = {cKey, uenObj, active, lines, bal, legacy, exact: !o.mk && o.rate == null && !!ctx.exactMakeup};
  ['qty','fee','fund','fund50','fund70','net','gst','sfec','sfecUsed','up','sfecBack','gstBack','netCost','ap','eis'].forEach(f => { plan[f] = lines.reduce((a, l) => a + l[f], 0); });
  plan.n50 = lines.reduce((a, l) => a + l.mk.n50, 0);
  plan.n70 = lines.reduce((a, l) => a + l.mk.n70, 0);
  plan.npass = lines.reduce((a, l) => a + l.mk.npass, 0);
  plan.left = bal == null ? null : Math.max(0, left);
  plan.over = bal == null ? 0 : lines.reduce((a, l) => a + (l.capped ? l.sfec - l.sfecUsed : 0), 0);
  plan.capped = plan.over > 0;
  const perHead = lines.reduce((a, l) => a + (l.qty ? l.sfec / l.qty : 0), 0);
  plan.covers = (bal != null && perHead > 0) ? Math.floor(bal / perHead) : null;
  plan.passPer = active.reduce((a, c) => a + per(c, 0, ctx).up, 0);
  plan.uniform = lines.every(l => l.qty === lines[0].qty);
  plan.qtyText = plan.uniform ? paxWord(lines[0].qty) + (lines.length > 1 ? ' × ' + lines.length + ' courses' : '')
                              : lines.map(l => l.c.short + ' ' + l.qty).join(', ') + ' participants';
  plan.qtyShort = plan.uniform ? plan.qtyText : plan.qty + ' seats across ' + lines.length + ' courses';
  plan.rateText = plan.n50 && plan.n70 ? '50% and 70% tiers' : plan.n70 ? '70% of the course fee' : plan.n50 ? '50% of the course fee' : '';
  return plan;
}
/* Headcount choices for the participants selector (live decks) and a short run for PowerPoint views. */
function headcounts(ctx, cKey, uenObj){
  const scoped = coursesForUen(ctx, uenObj);
  const target = (cKey && cKey !== 'comb') ? scoped.find(c => c.cKey === cKey) : null;
  const P = target ? target.pax : (scoped[0] ? scoped[0].pax : ctx.pax);
  const top = Math.max(40, 2 * Math.max(P, ...scoped.map(c => c.pax)));
  const list = [];
  for (let n = 1; n <= top; n++) list.push(n);
  return {P, list};
}
function pptxHeadcounts(ctx, cKey, uenObj, count){
  const scoped = coursesForUen(ctx, uenObj);
  const target = (cKey && cKey !== 'comb') ? scoped.find(c => c.cKey === cKey) : null;
  const P = target ? target.pax : (scoped[0] ? scoped[0].pax : ctx.pax);
  const priv = target ? target.priv : scoped.some(c => c.priv);
  const k = count || 7;
  const lo = priv ? Math.max(1, Math.min(8, P)) : 1;
  const a = Math.max(lo, P - Math.floor((k - 1) / 2));
  const list = [];
  for (let n = a; n < a + k; n++) list.push(n);
  return {P, list};
}
function barSeg(els, x, y, w, h, fill, roundL, roundR){
  if (w <= 0.001) return;
  const r = h / 2;
  if (!roundL && !roundR){ els.push(RECT(x, y, w, h, fill)); return; }
  els.push(RRECT(x, y, w, h, fill, r));
  const k = Math.min(r, w / 2);
  if (roundL && !roundR) els.push(RECT(x + k, y, w - k, h, fill));
  if (roundR && !roundL) els.push(RECT(x, y, w - k, h, fill));
}
/* view = {cKey, pax (same headcount on every course in view), mk (per-course makeups), rate, balCents, mode, linkCourse(k), linkPax(n)} */
function calcView(ctx, view, uenObj){
  view = view || {};
  const scoped = coursesForUen(ctx, uenObj);
  const cList = calcCourseOptions(ctx, uenObj);
  const defKey = cList[0].key;
  const cKey = cList.some(c => c.key === view.cKey) ? view.cKey : defKey;
  const active = cKey === 'comb' ? mainCourses(scoped) : scoped.filter(c => c.cKey === cKey);
  let mk = view.mk ? Object.assign({}, view.mk) : null;
  if (view.pax != null){
    mk = mk || {};
    const r = view.rate != null ? view.rate : defaultRate(ctx);
    active.forEach(c => { mk[c.cKey] = uniformMakeup(view.pax, r); });
  }
  return {cKey, cList, active, mk, plan: planFor(ctx, {uenObj, cKey, mk, rate:view.rate, balCents:view.balCents})};
}
/* The cohort money table, shared by the calculator slide and the mobile page view. */
function calcRows(ctx, plan){
  const sw = sfecWords(ctx), legacy = ctx.isLegacySfec;
  const rows = [{kind:'sec', label:'PAYABLE AT ENROLMENT'}];
  rows.push({label:'Course fee', note:[plan.qtyText + ', before GST', plan.qtyShort + ', before GST', plan.qtyShort], value:money(plan.fee), bold:true});
  if (plan.n50 + plan.n70 === 0) rows.push(NA('SkillsFuture funding', 'not available to pass holders', 'Not eligible'));
  else rows.push({label:'SkillsFuture funding', note:plan.rateText + (plan.npass ? '; none for pass holders' : ''), value:minus(plan.fund)});
  if (ctx.sfecOn && !legacy) rows.push({label:'SFEC offset upfront', note: (plan.capped ? 'limited by the SFEC balance' : sw.cover) + (plan.npass ? '; none for pass holders' : ''), value:minus(plan.sfecUsed)});
  rows.push({label:'GST', note:'9% of the full course fee', value:plus(plan.gst)});
  rows.push({kind:'total', label:'Upfront payment', note:'payable at enrolment', value:money(plan.up)});
  rows.push({kind:'sec', label:'CLAIMED BACK AFTER THE COURSE*'});
  if (ctx.sfecOn && legacy) rows.push({label:'SFEC claimed back', note: plan.capped ? 'limited by the SFEC balance' : sw.cover, value:'up to ' + money(plan.sfecBack), vc:K.GREEN, bold:true});
  rows.push({label:'GST claimed back', note:'as input tax, if GST-registered', value:'up to ' + money(plan.gstBack)});
  // Absentee Payroll is claimed back too, but it offsets wages paid for class time, not the course fee, so the net course cost leaves it out
  if (!ctx.weekday) rows.push(NA('Absentee Payroll', 'weekday classes only', 'Weekdays only'));
  else if (plan.ap > 0) rows.push({label:'Absentee Payroll', note:'towards wages for class hours, not the fee', value:'up to ' + money(plan.ap)});
  else rows.push(NA('Absentee Payroll', 'Singapore Citizens and PRs only', 'Not eligible'));
  rows.push({kind:'good', label:'Net course cost', note:'after funding' + (ctx.sfecOn ? ', SFEC' : '') + ' and the GST claim', value:money(plan.netCost)});
  rows.push({kind:'sec', label:'ALSO AVAILABLE, NOT DEDUCTED ABOVE*', c:K.GREEN});
  rows.push(plan.eis > 0 ? {label:'EIS tax saving', note:'400% deduction at 17%', value:'up to ' + money(plan.eis)} : NA('EIS tax saving', 'no nett fee left after SFEC', 'Nothing to deduct'));
  return rows;
}
function slideCohortCalc(ctx, view, uenObj){
  view = view || {};
  const V = calcView(ctx, view, uenObj);
  const {cKey, cList, plan} = V;
  // v2.1: a current-SFEC course chosen on its own uses the current scheme's rules and balance
  const legView = plan.legacy && !ctx.isLegacySfec;
  if (legView) ctx = legacyCtx(ctx);
  const {client, isLegacySfec} = ctx;
  const sw = sfecWords(ctx);
  const mode = view.mode || 'live', live = mode !== 'static';
  const cObj = cList.find(c => c.key === cKey) || cList[0];
  const hc = headcounts(ctx, cKey, uenObj);
  const custom = !!(view.mk || view.pax != null || view.rate != null || view.balCents !== undefined);
  const els = [], controls = [];
  const multiUenPage = !!(uenObj && ctx.multiUen && ctx.uens.length > 1);
  const switcher = multiUenPage && !!view.uenSwitch && live;   // one slide for every entity, with an entity selector
  const headPax = plan.uniform ? paxWord(plan.lines[0].qty) : plan.lines.length <= 2 ? plan.lines.map(l => l.qty).join(' + ') + ' participants' : plan.qty + ' seats across ' + plan.lines.length + ' courses';
  header(els, ['INVESTMENT  ·  COHORT CALCULATOR  ·  ' + (multiUenPage ? uenObj.name.toUpperCase() + '  ·  ' : '') + (ctx.sfecOn ? sw.short.toUpperCase() : 'SKILLSFUTURE FUNDING'), 'INVESTMENT  ·  COHORT CALCULATOR'],
    multiUenPage ? ['What ' + uenObj.name + ' invests for ' + headPax, 'Cohort calculator: ' + uenObj.name] : ['What ' + client + ' invests for ' + headPax, 'What ' + client + ' invests', 'Cohort investment calculator']);
  const uenLead = uenObj ? (uenObj.name + (uenObj.uen ? ' (UEN ' + uenObj.uen + ')' : '') + ', SFEC balance ' + money0(uenObj.balDollars) + '. ') : '';
  const sub = uenLead + 'Totals for the whole cohort, including 9% GST' + (ctx.sfecOn ? ', with SFEC ' + sw.how : '') + '.';
  els.push(fitFirst([sub + (live ? (switcher ? ' Switch the entity, course or headcount with the selectors.' : ' Change the course or headcount with the selectors.') : ''), sub], t => T(M, 1.36, 12.2, 0.32, t, {size:11.5, c:K.MUTED}), {lines:1, box:false}, 0.9));

  // Left: the cohort breakdown
  const lx = M, ly = 1.8, lw = 6.4, lh = 5.12;
  els.push(RRECT(lx, ly, lw, lh, K.LAV1, 0.15));
  const ix = lx + 0.2, iw = lw - 0.4;
  const sy = ly + 0.17, sh = 0.52, gapS = 0.12;
  const stepW = live ? 0.4 : 0, paxW = 1.95;
  const courseW = iw - paxW - gapS - (live ? 2 * stepW + 2 * 0.08 : 0);
  const idx = cList.findIndex(c => c.key === cKey), nextC = cList[(idx + 1) % cList.length];
  selectorBox(els, {x:ix, y:sy, w:courseW, h:sh, label:'COURSE', value:[cObj.title, cObj.short], mode: cList.length > 1 ? mode : 'static', accent:K.GOLD,
    link: cList.length > 1 && view.linkCourse ? view.linkCourse(nextC.key) : null, tip:'Show ' + nextC.label});
  if (cList.length > 1) controls.push({id:'calcCourse', kind:'select', label:'Course', x:ix, y:sy, w:courseW, h:sh, value:cKey, options:cList.map(c => ({value:c.key, label:c.label}))});
  const allConfirmed = plan.active.every(c => c.paxConfirmed);
  const mixed = planMixed(ctx, plan);
  const sme = view.sme != null ? !!view.sme : defaultSme(ctx);
  const yours = custom && !!view.mk && (mixed || !plan.uniform);   // the client typed their own figures
  const status = plan.exact ? 'exact makeup' : yours ? (mixed ? 'your mix' : 'your figures') : (allConfirmed ? 'confirmed' : 'proposed');
  const q0 = plan.lines[0].qty;
  const paxVal = plan.uniform ? (q0 + (custom && !yours ? '' : ' (' + status + ')')) : (yours ? cap(status) : custom ? 'Per course' : 'As ' + status);
  const px = ix + courseW + gapS;
  const list = view.paxList || hc.list;
  const at = list.indexOf(q0);
  const nextPax = plan.uniform ? list[(at + 1) % list.length] : hc.P;
  selectorBox(els, {x:px, y:sy, w:paxW, h:sh, label:'PARTICIPANTS', value:[paxVal, String(q0)], mode, link: view.linkPax && nextPax != null ? view.linkPax(nextPax) : null, tip:'Show ' + paxWord(nextPax || q0)});
  const lineSum = p => p.lines.length > 1 ? p.lines.map(l => l.c.short + ' ' + l.qty).join(', ') : makeupText(p.lines[0].mk, sme, true);
  const paxOpts = hc.list.map(n => ({value:String(n), label:paxWord(n) + (n === hc.P && !custom ? ' (' + status + ')' : '')}));
  let paxSel = plan.uniform ? String(q0) : '';
  if (yours){ paxOpts.unshift({value:'mix', label:cap(status) + ': ' + lineSum(plan)}); paxSel = 'mix'; }
  const proposal = custom ? planFor(ctx, {uenObj, cKey}) : plan;
  if (custom || !plan.uniform) paxOpts.unshift({value:'', label:'As ' + (proposal.exact ? 'in the proposal' : allConfirmed ? 'confirmed' : 'proposed') + ': ' + lineSum(proposal)});
  controls.push({id:'calcPax', kind:'select', label:'Participants', x:px, y:sy, w:paxW, h:sh, value:paxSel, options:paxOpts});
  if (live){
    const bx1 = px + paxW + 0.08, bx2 = bx1 + stepW + 0.08;
    // PowerPoint views step through a fixed run of headcounts; live decks can step any cohort, keeping its funding mix
    const prev = view.linkPax ? (plan.uniform ? list[at - 1] : null) : (Math.min(...plan.lines.map(l => l.qty)) > 1 ? q0 - 1 : null);
    const next = view.linkPax ? (plan.uniform ? list[at + 1] : null) : (Math.max(...plan.lines.map(l => l.qty)) < 500 ? q0 + 1 : null);
    stepButton(els, bx1, sy, stepW, sh, '−', prev != null, view.linkPax && prev != null ? view.linkPax(prev) : null, 'Decrease to ' + paxWord(prev || 0));
    stepButton(els, bx2, sy, stepW, sh, '+', next != null, view.linkPax && next != null ? view.linkPax(next) : null, 'Increase to ' + paxWord(next || 0));
    controls.push({id:'calcMinus', kind:'button', label:'Fewer participants', x:bx1, y:sy, w:stepW, h:sh, enabled: prev != null});
    controls.push({id:'calcPlus', kind:'button', label:'More participants', x:bx2, y:sy, w:stepW, h:sh, enabled: next != null});
  }
  let ty = sy + sh + 0.1;
  if (mixed){
    const head = plan.exact ? 'Makeup: ' : 'Funding mix: ';
    const mixOf = l => makeupText(l.mk, sme, true).split(' · ').join(', ');
    const allSame = plan.lines.every(l => sameMakeup(l.mk, plan.lines[0].mk));
    const cands = plan.lines.length > 1
      ? [allSame ? 'Funding mix on each course: ' + makeupText(plan.lines[0].mk, sme, false) : head + plan.lines.map(l => l.c.short + ': ' + mixOf(l)).join('; '),
         allSame ? 'Funding mix on each course: ' + makeupText(plan.lines[0].mk, sme, true) : head + plan.lines.map(l => mixOf(l)).join('; '),
         head + [plan.n50 ? plan.n50 + ' at 50%' : '', plan.n70 ? plan.n70 + ' at 70%' : '', plan.npass ? plan.npass + ' pass holder' + (plan.npass === 1 ? '' : 's') : ''].filter(Boolean).join(' · ') + ' across ' + plan.lines.length + ' courses']
      : [head + makeupText(plan.lines[0].mk, sme, false), head + makeupText(plan.lines[0].mk, sme, true)];
    els.push(fitFirst(cands, t => T(ix, ty, iw, 0.2, t, {size:9, b:true, c:K.BRAND}), {lines:1, box:false}, 0.95));
    ty += 0.24;
  }
  const rows = calcRows(ctx, plan);
  const yEnd = moneyRows(els, ix, ty, iw, rows, {sec:0.26, row:0.29, total:0.35});
  const passTxt = 'Pass holders (EP, S Pass, Work Permit): ' + money(plan.passPer) + ' upfront per participant incl. GST' + (ctx.sfecOn && isLegacySfec ? ', with SFEC claimed back afterwards' : '') + '. No SkillsFuture funding' + (ctx.sfecOn && !isLegacySfec ? ', SFEC offset' : '') + ' or Absentee Payroll.';
  els.push(fit(T(ix, yEnd + 0.05, iw, Math.max(0.3, ly + lh - yEnd - 0.1), passTxt, {size:9, i:true, c:K.MUTED}), {lines:2}));

  // Right: SFEC balance, per-participant figures, per-course lines
  const rx = lx + lw + 0.25, rw = SW - M - rx;
  els.push(RRECT(rx, ly, rw, lh, K.WHITE, 0.15, {line:{c:K.LINE, w:1}}));
  const jx = rx + 0.26, jw = rw - 0.52;
  let y = ly + 0.2;
  if (switcher){
    const ui = ctx.uens.findIndex(u => u.id === uenObj.id), lastU = ui === ctx.uens.length - 1, nextU = ctx.uens[(ui + 1) % ctx.uens.length], eh = 0.48;
    // The selector steps through the entities and then back to all of them combined
    selectorBox(els, {x:jx, y, w:jw, h:eh, label:'SPONSORING ENTITY  ·  ' + (ui + 1) + ' OF ' + ctx.uens.length, value:[uenObj.label, uenObj.name], mode, accent:K.NAVY,
      link: view.linkUen ? view.linkUen(lastU ? UEN_ALL : nextU.id) : null, tip: lastU ? 'Show all entities combined' : 'Show ' + nextU.name});
    controls.push({id:'calcUen', kind:'select', label:'Sponsoring entity', x:jx, y, w:jw, h:eh, value:uenObj.id,
      options: [{value:UEN_ALL, label:'All ' + ctx.uens.length + ' entities combined'}].concat(ctx.uens.map(u => ({value:u.id, label:u.label + ' · ' + money0(u.balDollars) + ' SFEC'})))});
    y += eh + 0.1;
  } else {
    els.push(fit(T(jx, y, jw, 0.22, ctx.sfecOn ? 'YOUR SFEC' + (multiUenPage ? '  ·  ' + uenObj.name.toUpperCase() : '') : 'PER PARTICIPANT', {size:9, b:true, c:K.BRAND, cs:1.5}), {lines:1, box:false}));
    y += 0.32;
  }
  if (ctx.sfecOn && plan.bal != null){
    els.push(fit(T(jx, y, jw * 0.55, 0.42, money(plan.left) + ' left', {size:19, f:'h', c:K.INK, valign:'middle'}), {lines:1, box:false}));
    els.push(fit(T(jx + jw * 0.55, y, jw * 0.45, 0.42, 'of ' + money0(plan.bal / 100) + ' balance', {size:10, c:K.MUTED, align:'right', valign:'middle'}), {lines:1, box:false}));
    y += 0.5;
    const bh = 0.3, usedW = plan.bal > 0 ? Math.min(1, plan.sfecUsed / plan.bal) * jw : 0;
    barSeg(els, jx, y, usedW, bh, HP.USED, true, usedW >= jw - 0.001);
    barSeg(els, jx + usedW, y, jw - usedW, bh, HP.LEFT, usedW <= 0.001, true);
    if (usedW > 0.001 && usedW < jw - 0.001) els.push(LINE(jx + usedW, y, jx + usedW, y + bh, K.WHITE, 1.5));
    y += bh + 0.1;
    const key = (kx, fill, t) => { els.push(RRECT(kx, y + 0.05, 0.12, 0.12, fill, 0.02)); els.push(T(kx + 0.18, y, 2.4, 0.22, t, {size:9, c:K.MUTED, valign:'middle'})); };
    key(jx, HP.USED, 'SFEC used: ' + money(plan.sfecUsed));
    key(jx + jw / 2, HP.LEFT, 'Left after this cohort');
    y += 0.32;
    const cov = plan.covers == null ? '' : plan.covers >= 1
      ? 'The balance covers up to ' + paxWord(plan.covers) + ' on this course mix' + (plan.capped ? '; the rest pay the full remaining fee.' : '.')
      : 'The balance covers less than one participant on this course mix.';
    if (cov) els.push(fit(T(jx, y, jw, 0.42, cov, {size:10, b:true, c:K.BRAND}), {lines:2}));
    y += 0.5;
  } else if (ctx.sfecOn){
    els.push(fit(T(jx, y, jw, 0.42, money(plan.sfecUsed) + ' of SFEC', {size:19, f:'h', c:K.INK, valign:'middle'}), {lines:1, box:false}));
    y += 0.48;
    els.push(fit(T(jx, y, jw, 0.62, 'Assumes the SFEC balance covers it. Please confirm the balance on the Business Grants Portal: a lower balance means a higher net cost.', {size:10, c:K.MUTED}), {lines:3}));
    y += 0.72;
  } else {
    els.push(fit(T(jx, y, jw, 0.4, 'No SFEC is applied in these figures.', {size:11, b:true, c:K.INK}), {lines:2}));
    y += 0.5;
  }
  els.push(LINE(jx, y, jx + jw, y, K.BORDER, 1));
  y += 0.14;
  const q = Math.max(1, plan.qty);
  const kpis = [['Upfront per participant', money(Math.round(plan.up / q)), K.BRAND], ['Net cost per participant', money(Math.round(plan.netCost / q)), K.GREEN], ['Claimed back in total', 'up to ' + money(plan.sfecBack + plan.gstBack + plan.ap), K.INK]];
  const kg = 0.18, kw = (jw - 2 * kg) / 3;
  kpis.forEach((k, i) => {
    const kx = jx + i * (kw + kg);
    els.push(fit(T(kx, y, kw, 0.36, k[0], {size:9, b:true, c:K.MUTED}), {lines:2}));
    els.push(fit(T(kx, y + 0.38, kw, 0.36, k[1], {size:15, f:'h', c:k[2], valign:'middle'}), {lines:1, box:false, min:0.7}));
    if (i < 2) els.push(LINE(kx + kw + kg / 2, y + 0.04, kx + kw + kg / 2, y + 0.72, K.BORDER, 1));
  });
  y += 0.88;
  if (plan.ap > 0){
    // Make clear the wage support is not a return on the course: it only offsets salaries paid while staff are in class
    els.push(fit(T(jx, y - 0.12, jw, 0.3, 'Includes up to ' + money(plan.ap) + ' Absentee Payroll: wage support for the hours staff spend in class, not a refund of the course fee.', {size:8.5, i:true, c:K.MUTED}), {lines:2}));
    y += 0.24;
  }
  // The by-course list only when at least two rows fit; otherwise the totals stand alone
  if (plan.lines.length > 1 && ly + lh - 0.6 - (y + 0.36) >= 0.55){
    els.push(LINE(jx, y, jx + jw, y, K.BORDER, 1));
    y += 0.12;
    els.push(T(jx, y, jw, 0.2, 'BY COURSE', {size:8.5, b:true, c:K.BRAND, cs:1.3}));
    y += 0.24;
    const room = Math.max(1, Math.floor((ly + lh - 0.6 - y) / 0.3));
    const shown = plan.lines.slice(0, plan.lines.length > room ? room - 1 : room);
    shown.forEach(l => {
      circleNum(els, l.n, jx, y + 0.03, 0.22, ctx.sfecOn ? HP.USED : K.BRAND, K.WHITE, 9);
      const lbl = [l.c.short + (l.c.pilot ? ' (pilot)' : '') + ' · ' + l.qty + ' pax', l.c.short];
      els.push(fitFirst(lbl, t => T(jx + 0.3, y, jw - 2.3, 0.28, t, {size:10, b:true, c:K.INK, valign:'middle'}), {lines:1, box:false}, 0.95));
      els.push(fit(T(jx + jw - 2.0, y, 2.0, 0.28, 'upfront ' + money(l.up), {size:10, c:K.MUTED, align:'right', valign:'middle'}), {lines:1, box:false}));
      y += 0.3;
    });
    if (plan.lines.length > shown.length) els.push(T(jx + 0.3, y, jw - 0.3, 0.24, '+ ' + (plan.lines.length - shown.length) + ' more course' + (plan.lines.length - shown.length > 1 ? 's' : '') + ' in the totals', {size:9, i:true, c:K.MUTED}));
  }
  const note = !ctx.sfecOn ? 'Figures are illustrative and confirmed at enrolment.'
    : legView ? 'Current SFEC: the course is completed before the balance lapses on 30 November 2026. The fee after SkillsFuture funding is paid at enrolment, and up to 90% of it (before GST) is claimed back after the course.'
    : isLegacySfec ? 'Current SFEC: pay the fee after SkillsFuture funding at enrolment, then claim SFEC back after the course. Claims close on 30 November 2026.'
    : 'Redesigned SFEC (from 1 December 2026): a fresh S$10,000 credit, valid to ' + SFEC_NEW_EXPIRY + ', offsets ' + (sw.full ? 'the full nett course fee' : sw.pct + ' of the nett course fee') + ' at enrolment, applied within ' + SFEC_NEW_CLAIM_DAYS + ' days of the course start. GST is not covered.';
  els.push(fit(T(jx, ly + lh - 0.62, jw, 0.5, note, {size:9, i:true, c:K.MUTED, valign:'bottom'}), {lines:3}));

  const perEntityPage = multiUenPage && !switcher;
  const slideName = perEntityPage ? ('Cohort & calculator (' + uenObj.name + ')') : 'Cohort & calculator';
  const tocTitle = perEntityPage ? ('Cohort & calculator: ' + uenObj.name) : 'Cohort investment & calculator';
  const tocDesc = switcher ? ['For each of the ' + ctx.uens.length + ' sponsoring entities, with its own SFEC balance', 'By sponsoring entity']
    : perEntityPage ? [uenObj.name + (uenObj.uen ? ' (' + uenObj.uen + ')' : '') + ' · ' + money0(uenObj.balDollars) + ' SFEC balance', uenObj.name]
    : ['Upfront payment, net cost and what is claimed back afterwards', 'Upfront payment and net cost'];
  return {
    bg:K.WHITE, els, name:slideName, slideKey: perEntityPage ? ('cohort_' + uenObj.id) : 'cohort', controls,
    calc:true, calcUenId: uenObj ? uenObj.id : 'default', uenObj: uenObj || null, uenSwitch: switcher, cCourse:cKey, pax: plan.uniform ? q0 : null,
    toc:{g:'investment', t:tocTitle, d:tocDesc}
  };
}

/* Multi-entity calculator: one slide with an entity selector. Its view is {uen, byUen:{[entity id]: view}}, so each
   entity keeps the figures the client set for it while they switch back and forth. Other calculator slides use the view as is. */
function calcScope(ctx, base, view){
  view = view || {};
  if (!base || !base.uenSwitch || !ctx.uens.length) return {uenObj:(base && base.uenObj) || null, sub:view, id:null};
  // No entity chosen yet: the slide opens on all entities combined
  const id = ctx.uens.some(u => u.id === view.uen) ? view.uen : UEN_ALL;
  if (id === UEN_ALL) return {uenObj:null, sub:{}, id, all:true, byUen:view.byUen || {}};
  return {uenObj:ctx.uens.find(u => u.id === id), sub:(view.byUen && view.byUen[id]) || {}, id};
}
function calcWithSub(base, view, id, sub){
  if (!base || !base.uenSwitch) return sub;
  if (id === UEN_ALL) return view || {};
  const v = Object.assign({}, view || {});
  v.byUen = Object.assign({}, v.byUen || {});
  if (sub && Object.keys(sub).length) v.byUen[id] = sub; else delete v.byUen[id];
  v.uen = id;
  return v;
}

/* ---------- Microsite builder v1.1: all sponsoring entities combined ----------
   The entity selector on the calculator slide gains "All entities combined", and the slide opens on it. The combined
   view adds up every entity's own plan (with whatever the client has changed on that entity) and lists each entity's
   SFEC balance beneath the combined one. A course with no sponsoring entity shows on more than one entity's view, so
   here it is counted once, under the first entity that takes it. */
const UEN_ALL = '__all';
function combinedPlan(ctx, byUen){
  const taken = new Set();
  let deduped = false;
  const parts = ctx.uens.map(u => {
    const scoped = coursesForUen(ctx, u), mine = scoped.filter(c => !taken.has(c.cKey));
    if (mine.length < scoped.length) deduped = true;
    mine.forEach(c => taken.add(c.cKey));
    const sub = (byUen && byUen[u.id]) || {};
    const bal = sub.balCents !== undefined ? sub.balCents : defaultBalCents(ctx, u);
    if (!mine.length) return {u, plan:null, bal, used:0, left:bal == null ? null : bal, qty:0};
    let mk = sub.mk ? Object.assign({}, sub.mk) : null;
    if (sub.pax != null){
      mk = mk || {};
      const r = sub.rate != null ? sub.rate : defaultRate(ctx);
      (sub.cKey && sub.cKey !== 'comb' ? mine.filter(c => c.cKey === sub.cKey) : mine).forEach(c => { mk[c.cKey] = uniformMakeup(sub.pax, r); });
    }
    const plan = planFor(ctx, {uenObj:u, cKey:'comb', mk, rate:sub.rate, balCents:sub.balCents, only:new Set(mine.map(c => c.cKey))});
    return {u, plan, bal:plan.bal, used:plan.sfecUsed, left:plan.left, qty:plan.qty};
  });
  const plans = parts.map(p => p.plan).filter(Boolean);
  const total = {lines:[].concat(...plans.map(p => p.lines)), legacy:ctx.isLegacySfec, exact:false, uniform:false};
  ['qty','fee','fund','fund50','fund70','net','gst','sfec','sfecUsed','up','sfecBack','gstBack','netCost','ap','eis','n50','n70','npass','over'].forEach(f => { total[f] = plans.reduce((a, p) => a + (p[f] || 0), 0); });
  total.capped = plans.some(p => p.capped);
  total.bal = parts.every(p => p.bal != null) ? parts.reduce((a, p) => a + p.bal, 0) : null;
  total.left = total.bal == null ? null : parts.reduce((a, p) => a + (p.left || 0), 0);
  const n = ctx.uens.length;
  total.qtyText = total.qty + ' participants across ' + n + ' entities';
  total.qtyShort = total.qty + ' participants, ' + n + ' entities';
  total.rateText = total.n50 && total.n70 ? '50% and 70% tiers' : total.n70 ? '70% of the course fee' : total.n50 ? '50% of the course fee' : '';
  return {parts, total, deduped};
}
function slideCohortAll(ctx, view){
  view = view || {};
  const sw = sfecWords(ctx), mode = view.mode || 'live', live = mode !== 'static', n = ctx.uens.length;
  const switcher = !!view.uenSwitch && live;
  const C = combinedPlan(ctx, view.byUen), A = C.total;
  const els = [], controls = [];
  header(els, ['INVESTMENT  ·  COHORT CALCULATOR  ·  ALL ' + n + ' ENTITIES  ·  ' + (ctx.sfecOn ? sw.short.toUpperCase() : 'SKILLSFUTURE FUNDING'), 'INVESTMENT  ·  COHORT CALCULATOR'],
    ['What ' + ctx.client + ' invests across ' + n + ' entities', 'What ' + ctx.client + ' invests', 'Cohort investment calculator']);
  const sub = 'Combined totals for all ' + n + ' sponsoring entities, including 9% GST' + (ctx.sfecOn ? ', with SFEC ' + sw.how : '') + '. Each entity draws on its own SFEC balance.';
  els.push(fitFirst([sub + (switcher ? ' Choose an entity to change its course or headcount.' : ''), sub], t => T(M, 1.36, 12.2, 0.32, t, {size:11.5, c:K.MUTED}), {lines:1, box:false}, 0.9));

  // Left: the combined breakdown
  const lx = M, ly = 1.8, lw = 6.4, lh = 5.12;
  els.push(RRECT(lx, ly, lw, lh, K.LAV1, 0.15));
  const ix = lx + 0.2, iw = lw - 0.4, sy = ly + 0.17, sh = 0.52, gapS = 0.12, paxW = 1.95, viewW = iw - paxW - gapS;
  selectorBox(els, {x:ix, y:sy, w:viewW, h:sh, label:'VIEW', value:['All ' + n + ' entities combined', 'All entities'], mode:'static', accent:K.GOLD});
  selectorBox(els, {x:ix + viewW + gapS, y:sy, w:paxW, h:sh, label:'PARTICIPANTS', value:[A.qty + ' in total', String(A.qty)], mode:'static'});
  const yEnd = moneyRows(els, ix, sy + sh + 0.1, iw, calcRows(ctx, A), {sec:0.26, row:0.29, total:0.35});
  const foot = (C.deduped ? 'A course with no sponsoring entity is counted once, under the first entity that takes it. ' : '') + 'Each entity’s own figures are on its view' + (switcher ? ': choose it in the selector.' : live ? '.' : ', on the pages that follow.');
  els.push(fit(T(ix, yEnd + 0.05, iw, Math.max(0.3, ly + lh - yEnd - 0.1), foot, {size:9, i:true, c:K.MUTED}), {lines:2}));

  // Right: the combined SFEC balance, then each entity's own
  const rx = lx + lw + 0.25, rw = SW - M - rx;
  els.push(RRECT(rx, ly, rw, lh, K.WHITE, 0.15, {line:{c:K.LINE, w:1}}));
  const jx = rx + 0.26, jw = rw - 0.52;
  let y = ly + 0.2;
  if (switcher){
    const eh = 0.48, first = ctx.uens[0];
    selectorBox(els, {x:jx, y, w:jw, h:eh, label:'SPONSORING ENTITY  ·  ALL ' + n, value:['All entities combined', 'All entities'], mode, accent:K.NAVY,
      link: view.linkUen ? view.linkUen(first.id) : null, tip:'Show ' + first.name});
    controls.push({id:'calcUen', kind:'select', label:'Sponsoring entity', x:jx, y, w:jw, h:eh, value:UEN_ALL,
      options:[{value:UEN_ALL, label:'All ' + n + ' entities combined'}].concat(ctx.uens.map(u => ({value:u.id, label:u.label + ' · ' + money0(u.balDollars) + ' SFEC'})))});
    y += eh + 0.1;
  } else {
    els.push(fit(T(jx, y, jw, 0.22, 'COMBINED SFEC  ·  ALL ' + n + ' ENTITIES', {size:9, b:true, c:K.BRAND, cs:1.5}), {lines:1, box:false}));
    y += 0.32;
  }
  if (A.bal != null){
    els.push(fit(T(jx, y, jw * 0.55, 0.42, money(A.left) + ' left', {size:19, f:'h', c:K.INK, valign:'middle'}), {lines:1, box:false}));
    els.push(fit(T(jx + jw * 0.55, y, jw * 0.45, 0.42, 'of ' + money0(A.bal / 100) + ' combined', {size:10, c:K.MUTED, align:'right', valign:'middle'}), {lines:1, box:false}));
    y += 0.48;
    const bh = 0.26, usedW = A.bal > 0 ? Math.min(1, A.sfecUsed / A.bal) * jw : 0;
    barSeg(els, jx, y, usedW, bh, HP.USED, true, usedW >= jw - 0.001);
    barSeg(els, jx + usedW, y, jw - usedW, bh, HP.LEFT, usedW <= 0.001, true);
    if (usedW > 0.001 && usedW < jw - 0.001) els.push(LINE(jx + usedW, y, jx + usedW, y + bh, K.WHITE, 1.5));
    y += bh + 0.08;
    const key = (kx, fill, t) => { els.push(RRECT(kx, y + 0.05, 0.12, 0.12, fill, 0.02)); els.push(T(kx + 0.18, y, 2.6, 0.22, t, {size:9, c:K.MUTED, valign:'middle'})); };
    key(jx, HP.USED, 'SFEC used: ' + money(A.sfecUsed));
    key(jx + jw / 2, HP.LEFT, 'Left across all entities');
    y += 0.3;
  } else {
    els.push(fit(T(jx, y, jw, 0.42, money(A.sfecUsed) + ' of SFEC', {size:19, f:'h', c:K.INK, valign:'middle'}), {lines:1, box:false}));
    y += 0.5;
  }
  els.push(LINE(jx, y, jx + jw, y, K.BORDER, 1));
  y += 0.1;
  els.push(T(jx, y, jw, 0.2, 'EACH ENTITY’S OWN SFEC BALANCE', {size:8.5, b:true, c:K.BRAND, cs:1.3}));
  y += 0.26;
  // The KPI strip and the closing note keep their place at the bottom; the entity rows share what is left
  const kpiH = 0.86, noteTop = ly + lh - 0.62, room = noteTop - kpiH - 0.12 - y;
  const rowH = Math.max(0.3, Math.min(0.5, room / C.parts.length));
  const fitN = Math.max(1, Math.floor(room / rowH + 0.001));
  const shown = C.parts.slice(0, C.parts.length > fitN ? fitN - 1 : fitN);
  shown.forEach((p, i) => {
    circleNum(els, i + 1, jx, y + 0.02, 0.22, K.NAVY, K.WHITE, 9);
    const right = p.bal == null ? money(p.used) + ' of SFEC' : money(p.left) + ' left of ' + money0(p.bal / 100);
    els.push(fitFirst([p.u.name + (p.qty ? ' · ' + p.qty + ' pax' : ' · no courses'), p.u.name], t => T(jx + 0.3, y, jw - 2.75, 0.26, t, {size:10, b:true, c:K.INK, valign:'middle'}), {lines:1, box:false}, 0.85));
    els.push(fit(T(jx + jw - 2.4, y, 2.4, 0.26, right, {size:10, c:K.MUTED, align:'right', valign:'middle'}), {lines:1, box:false}));
    if (p.bal != null && rowH >= 0.4){
      const by = y + 0.3, bh2 = 0.08, bx = jx + 0.3, bw = jw - 0.3, uw = p.bal > 0 ? Math.min(1, p.used / p.bal) * bw : 0;
      barSeg(els, bx, by, uw, bh2, HP.USED, true, uw >= bw - 0.001);
      barSeg(els, bx + uw, by, bw - uw, bh2, HP.LEFT, uw <= 0.001, true);
    }
    y += rowH;
  });
  if (C.parts.length > shown.length) els.push(T(jx + 0.3, y, jw - 0.3, 0.24, '+ ' + (C.parts.length - shown.length) + ' more entities in the totals', {size:9, i:true, c:K.MUTED}));
  y = noteTop - kpiH - 0.06;
  els.push(LINE(jx, y, jx + jw, y, K.BORDER, 1));
  y += 0.12;
  const q = Math.max(1, A.qty);
  const kpis = [['Upfront per participant', money(Math.round(A.up / q)), K.BRAND], ['Net cost per participant', money(Math.round(A.netCost / q)), K.GREEN], ['Claimed back in total', 'up to ' + money(A.sfecBack + A.gstBack + A.ap), K.INK]];
  const kg = 0.18, kw = (jw - 2 * kg) / 3;
  kpis.forEach((k, i) => {
    const kx = jx + i * (kw + kg);
    els.push(fit(T(kx, y, kw, 0.3, k[0], {size:9, b:true, c:K.MUTED}), {lines:2}));
    els.push(fit(T(kx, y + 0.32, kw, 0.34, k[1], {size:15, f:'h', c:k[2], valign:'middle'}), {lines:1, box:false, min:0.7}));
    if (i < 2) els.push(LINE(kx + kw + kg / 2, y + 0.04, kx + kw + kg / 2, y + 0.66, K.BORDER, 1));
  });
  const note = ctx.isLegacySfec ? 'Current SFEC: pay the fee after SkillsFuture funding at enrolment, then claim SFEC back after the course. Claims close on 30 November 2026.'
    : 'Redesigned SFEC (from 1 December 2026): each entity has its own fresh S$10,000 credit, valid to ' + SFEC_NEW_EXPIRY + ', and draws only on its own. GST is not covered.';
  els.push(fit(T(jx, noteTop, jw, 0.5, note, {size:9, i:true, c:K.MUTED, valign:'bottom'}), {lines:3}));
  return {
    bg:K.WHITE, els, name: switcher || live ? 'Cohort & calculator' : 'Cohort & calculator (all entities)', slideKey: switcher || live ? 'cohort' : 'cohort_all', controls,
    calc:true, calcUenId:'all', uenObj:null, uenSwitch:switcher, uenAll:true, cCourse:'comb', pax:null,
    toc:{g:'investment', t: switcher || live ? 'Cohort investment & calculator' : 'Cohort & calculator: all entities',
      d: switcher ? ['All ' + n + ' sponsoring entities combined, then each with its own SFEC balance', 'Combined and by sponsoring entity'] : ['Combined totals for the ' + n + ' sponsoring entities', 'All entities combined']}
  };
}

/* ---------- Slide (optional): Current vs redesigned SFEC ---------- */
/* The same cohort under both SFEC schemes. A current-scheme deck with a known balance compares that balance with the
   fresh S$10,000 credit; otherwise both columns use the same balance, so the comparison is like for like. */
function sfecCompare(ctx){
  const S = ctx.S;
  const cur = makeCtx(Object.assign({}, S, {sfecMode:'legacy'}));
  const red = makeCtx(Object.assign({}, S, {sfecMode:'enhanced'}));
  // v2.1: S.compareFocus (a course key) compares one participant on that course rather than the whole cohort
  const fc = S.compareFocus ? ctx.courses.find(c => c.k === S.compareFocus && !c.legacySfec) : null;
  if (fc){
    const rate = defaultRate(ctx), cc = cur.courses[fc.idx], cr = red.courses[fc.idx];
    const pc = per(cc, rate, cur), pr = per(cr, rate, red);
    const alt = S.tier === '50' ? {cur:per(cc, 70, cur), red:per(cr, 70, red)} : null;
    const datedF = ctx.coursesWithDates.map(c => c.date);
    const timingF = !datedF.length ? 'none' : datedF.every(d => d >= SFEC_NEW_START) ? 'new' : datedF.every(d => d <= SFEC_DEADLINE) ? 'old' : 'both';
    return {perPax:true, course:fc, rate, cur:pc, red:pr, alt, nU:1, fresh:SFEC_NEW_CREDIT * 100, curBal:null, redBal:null, freshCompare:true, timing:timingF,
            upSaving: pc.up - pr.up, netDiff: pc.netCost - pr.netCost};
  }
  const nU = ctx.multiUen ? Math.max(1, ctx.uens.length) : 1;
  const fresh = SFEC_NEW_CREDIT * 100 * nU;
  // Current SFEC with no confirmed balance: at most the original S$10,000 per entity, never unlimited
  const curBal = defaultBalCents(cur, null) != null ? defaultBalCents(cur, null) : fresh, redBal = defaultBalCents(red, null);   // current: balance left (or unknown); redesigned: the fresh wallet
  const freshCompare = true;
  const pc = planFor(cur, {balCents:curBal}), pr = planFor(red, {balCents:redBal});
  const dated = ctx.coursesWithDates.map(c => c.date);
  const timing = !dated.length ? 'none' : dated.every(d => d >= SFEC_NEW_START) ? 'new' : dated.every(d => d <= SFEC_DEADLINE) ? 'old' : 'both';
  return {cur:pc, red:pr, nU, fresh, curBal, redBal, freshCompare, timing, upSaving: pc.up - pr.up, netDiff: pc.netCost - pr.netCost};
}
const cmpName = c => c.short + (c.lvl && !/level/i.test(c.short) ? ' Level ' + c.lvl : '');
function sfecCompareRows(ctx, C){
  const pc = C.cur, pr = C.red;
  if (C.perPax) return [
    {label:'Baseline course fee', note:'before GST', a:money(pc.fee), b:money(pr.fee)},
    {label:'SkillsFuture funding', note:C.rate + '% of the course fee', a:minus(pc.fund), b:minus(pr.fund)},
    {label:'Nett fee after funding', note:'grant-subsidised, before GST', a:money(pc.net), b:money(pr.net)},
    {label:'GST', note:'9% of the full fee', a:plus(pc.gst), b:plus(pr.gst)},
    {label:'SFEC at enrolment', a:'Not applied', na:true, b:minus(pr.sfec), bc:K.GREEN},
    {kind:'total', label:'Paid at enrolment', a:money(pc.up), b:money(pr.up)},
    {label:'SFEC claimed back later', note:'after the course', a:'up to ' + money(pc.sfecBack), b:'Nothing to claim', nb:true},
    {label:'GST claimed back', note:'if GST-registered', a:'up to ' + money(pc.gstBack), b:'up to ' + money(pr.gstBack)},
    {kind:'good', label:'Net out-of-pocket', note:'after all claims', a:money(pc.netCost), b:money(pr.netCost)}
  ];
  const freshTxt = money0(10000) + (C.nU > 1 ? ' for each entity' : '');
  return [
    {label:'SFEC credit', a: C.curBal != null ? money0(C.curBal / 100) + ' left' : 'Current balance', an:'expires 30 Nov 2026', b: C.redBal != null && C.redBal < C.fresh ? money0(C.redBal / 100) + ' left' : 'Fresh ' + freshTxt, bn:'valid to 30 Nov 2029'},
    {label:'Fees after SkillsFuture funding', note:'before GST', a:money(pc.net), b:money(pr.net)},
    {label:'GST', note:'9% of the full fee', a:plus(pc.gst), b:plus(pr.gst)},
    {label:'SFEC at enrolment', a:'Not applied', na:true, b:minus(pr.sfecUsed), bc:K.GREEN},
    {kind:'total', label:'Paid at enrolment', a:money(pc.up), b:money(pr.up)},
    {label:'SFEC claimed back later', note:'after the course', a:'up to ' + money(pc.sfecBack), b:'Nothing to claim', nb:true},
    {label:'GST claimed back', note:'if GST-registered', a:'up to ' + money(pc.gstBack), b:'up to ' + money(pr.gstBack)},
    {kind:'good', label:'Net cost after claims', a:money(pc.netCost), b:money(pr.netCost)}
  ];
}
function sfecComparePoints(ctx, C){
  const {client} = ctx;
  const leg = ctx.legacyCourses || [];
  const when = leg.length && C.timing !== 'new'
    ? joinList(leg.map(c => c.short)) + ', completed by 30 November 2026, uses the current balance; ' + (C.perPax ? C.course.short + ' and the later courses use' : 'the courses from 1 December use') + ' the new credit.'
    : C.timing === 'new' ? (ctx.multi ? 'All the courses in this proposal run' : 'This course runs') + ' from 1 December 2026, so ' + client + ' gets the upfront offset from the first cohort.'
    : C.timing === 'old' ? (ctx.multi ? 'These courses finish' : 'This course finishes') + ' before 1 December 2026, so ' + client + ' can still use the current balance before it expires. Later cohorts use the new credit.'
    : C.timing === 'both' ? 'Courses completed and claimed by 30 November 2026 use the current balance; courses from 1 December use the new credit.'
    : 'Courses completed and claimed by 30 November 2026 use the current balance; courses from 1 December 2026 use the new credit.';
  return [
    ['Offset upfront, not claimed back', redesignedRate(ctx.S) >= 100
      ? 'Today, ' + client + ' pays the fee after SkillsFuture funding and claims up to 90% of it back after the course. From 1 December 2026, SFEC covers the full nett fee at enrolment, so only the GST is paid.'
      : 'Today, ' + client + ' pays the fee after SkillsFuture funding and claims SFEC back after the course. From 1 December 2026, SFEC comes off the bill at enrolment.'],
    ['A fresh S$10,000 credit', 'Eligible employers receive a new S$10,000 credit in an online wallet, valid to ' + SFEC_NEW_EXPIRY + '. Any current balance expires on 30 November 2026 and does not carry over.'],
    ['Less cash tied up, less admin', 'SWDA pays the SFEC portion to the training provider, so there is no reimbursement to wait for. The SFEC is applied within ' + SFEC_NEW_CLAIM_DAYS + ' days of the course start.'],
    ['Your dates', when]
  ];
}
function sfecCompareSummary(ctx, C){
  const save = C.upSaving, nd = C.netDiff;
  if (C.perPax){
    const rr = redesignedRate(ctx.S), nm = cmpName(C.course);
    const head = save > 0 ? money(save) + ' less to pay at enrolment, per participant' : 'The same amount at enrolment, per participant';
    const tail = save <= 0 ? 'SFEC does not cover this participant, so both schemes cost the same.'
      : nd > 50 ? 'With the redesigned SFEC, each ' + nm + ' participant ' + (rr >= 100 ? 'pays only the GST upfront, and the net out-of-pocket is ' : 'costs ') + money(nd) + ' lower' + (rr >= 100 ? '' : ' after claims') + ', as it covers ' + (rr >= 100 ? 'the full nett fee' : rr + '% of the nett fee') + ' rather than up to 90%.'
      : 'With the redesigned SFEC, for the same net out-of-pocket: the gain is cash flow, with no claim to file or payout to wait for.';
    const who = ctx.S.tier === '70' ? 'every Singapore Citizen and PR (70% funding, SME-sponsored)' : 'a Singapore Citizen below 40 or PR (50% funding)';
    const altTxt = C.alt ? ' Citizens aged 40 and above (70% funding): ' + money(C.alt.cur.up) + ' / ' + money(C.alt.red.up) + ' at enrolment and ' + money(C.alt.cur.netCost) + ' / ' + money(C.alt.red.netCost) + ' net out-of-pocket (current / redesigned).' : '';
    const note = 'Per participant: ' + who + '.' + altTxt + ' Assumes the SFEC balance covers the participant. The current SFEC covers up to 90% of the nett fee; the redesigned SFEC ' + (rr >= 100 ? 'covers the full nett fee' : 'covers ' + rr + '% of it') + '. Neither covers GST. Figures are illustrative and confirmed at enrolment.';
    return {head, tail, note};
  }
  const head = save > 0 ? money(save) + ' less to pay at enrolment' : 'The same amount at enrolment';
  const tail = save <= 0 ? 'SFEC does not cover the participants in this cohort, so both schemes cost the same.'
    : nd > 50 ? 'With the redesigned SFEC, and ' + money(nd) + ' lower net cost, because ' + (redesignedRate(ctx.S) > SFEC_LEGACY_RATE ? 'it covers ' + (redesignedRate(ctx.S) >= 100 ? 'the full nett course fee' : redesignedRate(ctx.S) + '% of the nett fee') + ' rather than up to 90%' + (C.freshCompare ? ', from a fresh credit' : '') : 'the fresh credit covers more of the cohort') + '.'
    : nd < -50 ? 'With the redesigned SFEC. The fresh S$10,000 covers less of this cohort than the current balance, so the net cost is ' + money(-nd) + ' higher.'
    : 'With the redesigned SFEC, for the same net cost: the gain is cash flow, with no claim to file or payout to wait for.';
  const rr = redesignedRate(ctx.S);
  const balNote = 'Current-scheme figures use ' + (defaultBalCents(makeCtx(Object.assign({}, ctx.S, {sfecMode:'legacy'})), null) != null ? 'the ' + money0(C.curBal / 100) + ' balance left' : 'the full S$10,000' + (C.nU > 1 ? ' per entity' : '') + ', as the current balance is not confirmed') + '; redesigned figures use the fresh S$10,000 credit' + (C.nU > 1 ? ' for each entity' : '') + '. ';
  const note = balNote + 'The current SFEC covers up to 90% of the nett fee; the redesigned SFEC ' + (rr >= 100 ? 'covers the full nett fee' : 'covers ' + rr + '% of it') + '. Neither covers GST. Claims depend on course completion and the company’s GST position. Figures are illustrative and confirmed at enrolment.';
  return {head, tail, note};
}
function slideSfecCompare(ctx){
  const {client} = ctx;
  const C = sfecCompare(ctx);
  const els = [];
  header(els, C.perPax ? ['INVESTMENT  ·  PER PARTICIPANT  ·  SFEC: CURRENT VS REDESIGNED', 'INVESTMENT  ·  SFEC COMPARED'] : ['INVESTMENT  ·  SFEC: CURRENT VS REDESIGNED', 'INVESTMENT  ·  SFEC COMPARED'],
    ['How the redesigned SFEC works in ' + poss(client) + ' favour', 'How the redesigned SFEC works for ' + client, 'Current vs redesigned SFEC']);
  const pr = C.red;
  const who = C.perPax ? '' : (pr.uniform ? pr.qtyText : pr.qtyShort);
  const sub = C.perPax
    ? 'The SkillsFuture Enterprise Credit (SFEC) changes on 1 December 2026. Here is one ' + cmpName(C.course) + ' participant under both schemes, including 9% GST.'
    : 'The SkillsFuture Enterprise Credit (SFEC) changes on 1 December 2026. Here is the same cohort (' + who + ') under both schemes, including 9% GST.';
  els.push(fitFirst([sub, C.perPax ? 'The SFEC changes on 1 December 2026. One ' + C.course.short + ' participant under both schemes, including 9% GST.' : 'The SFEC changes on 1 December 2026. The same cohort under both schemes, including 9% GST.'], t => T(M, 1.36, 12.2, 0.32, t, {size:11.5, c:K.MUTED}), {lines:1, box:false}, 0.9));

  // Left: what changes
  const lx = M, ly = 1.85, lw = 4.95, lh = 4.6;
  els.push(RRECT(lx, ly, lw, lh, K.LAV1, 0.15));
  els.push(T(lx + 0.25, ly + 0.2, lw - 0.5, 0.24, 'WHAT CHANGES ON 1 DECEMBER 2026', {size:9, b:true, c:K.BRAND, cs:1.6}));
  const pts = sfecComparePoints(ctx, C);
  const slot = (lh - 0.62) / pts.length;
  pts.forEach((p, i) => {
    const y = ly + 0.6 + i * slot;
    circleNum(els, i + 1, lx + 0.25, y, 0.34, i === 3 ? K.GOLD : K.BRAND, K.WHITE, 10);
    els.push(fit(T(lx + 0.72, y - 0.01, lw - 0.95, 0.28, p[0], {size:11, b:true, c:K.INK}), {lines:1, box:false}));
    els.push(fit(T(lx + 0.72, y + 0.28, lw - 0.95, slot - 0.36, p[1], {size:10, c:K.MUTED}), {}));
  });

  // Right: the two schemes side by side
  const rx = lx + lw + 0.3, rw = SW - M - rx;
  const labW = rw - 2 * 1.95, cw = 1.95, ax = rx + labW, bx = ax + cw;
  const cmpRows = sfecCompareRows(ctx, C);
  const hy = ly, hh = 0.62, rowH = cmpRows.length > 8 ? 0.33 : 0.37;
  els.push(RRECT(bx, hy, cw, hh + cmpRows.length * rowH + 0.1, K.HL, 0.12));
  els.push(T(ax, hy + 0.08, cw, 0.24, 'CURRENT SFEC', {size:9, b:true, c:K.MUTED, cs:1.2, align:'center'}));
  els.push(T(ax, hy + 0.32, cw, 0.22, 'claimed back, until 30 Nov', {size:9.5, c:K.MUTED, align:'center'}));
  els.push(T(bx, hy + 0.08, cw, 0.24, 'REDESIGNED SFEC', {size:9, b:true, c:K.BRAND, cs:1.2, align:'center'}));
  els.push(T(bx, hy + 0.32, cw, 0.22, 'offset upfront, from 1 Dec', {size:9.5, b:true, c:K.BRAND, align:'center'}));
  let y = hy + hh + 0.02;
  cmpRows.forEach(r => {
    const h = rowH, total = r.kind === 'total', good = r.kind === 'good';
    if (total) els.push(RRECT(rx, y + 0.03, rw, h - 0.06, K.NAVY, 0.06));
    else if (good) els.push(RRECT(rx, y + 0.03, rw, h - 0.06, K.GREEN_BG, 0.06));
    else els.push(LINE(rx + 0.1, y + h, rx + rw - 0.1, y + h, K.BORDER, 0.6));
    const lc = total ? K.WHITE : good ? K.GREEN : K.INK;
    const runs = [run(r.label, {size: total || good ? 11 : 10.5, b:true, c:lc})];
    if (r.note) runs.push(run('   ' + r.note, {size:9, c: total ? K.PALE : K.MUTED}));
    els.push(fitFirst([runs, [runs[0]]], rr => T(rx + 0.12, y, labW - 0.18, h, rr, {valign:'middle'}), {lines:1, box:false}, 0.95));
    const cell = (x, v, n, c, it) => {
      if (n) {
        els.push(fit(T(x + 0.06, y + 0.02, cw - 0.12, 0.2, v, {size:10, b:true, c, align:'center'}), {lines:1, box:false}));
        els.push(fit(T(x + 0.06, y + 0.2, cw - 0.12, 0.16, n, {size:8.5, c:K.MUTED, align:'center'}), {lines:1, box:false}));
      } else els.push(fit(T(x + 0.06, y, cw - 0.12, h, v, {size: total || good ? 13 : 10.5, f: total || good ? 'h' : null, i:!!it, b:!total && !good && !it, c, align:'center', valign:'middle'}), {lines:1, box:false}));
    };
    cell(ax, r.a, r.an, total ? K.WHITE : good ? K.GREEN : (r.na ? K.GREY : K.INK), r.na);
    cell(bx, r.b, r.bn, total ? K.WHITE : good ? K.GREEN : (r.nb ? K.GREY : (r.bc || K.INK)), r.nb);
    y += h;
  });

  // The result in one line
  y += 0.16;
  const R = sfecCompareSummary(ctx, C);
  const bh = ly + lh - y;
  els.push(RRECT(rx, y, rw, bh, K.WHITE, 0.12, {line:{c:K.LINE, w:1}}));
  els.push(fit(T(rx + 0.22, y + 0.1, rw - 0.44, 0.36, R.head, {size:16, f:'h', c:K.BRAND, valign:'middle'}), {lines:1, box:false}));
  els.push(fit(T(rx + 0.22, y + 0.48, rw - 0.44, bh - 0.56, R.tail, {size:10, c:K.INK}), {lines:2}));
  els.push(fit(T(M, ly + lh + 0.1, SW - 2 * M, 6.98 - ly - lh - 0.1, '*' + R.note, {size:9, i:true, c:K.INK}), {lines:2}));
  return {bg:K.WHITE, els, name:'Current vs redesigned SFEC', slideKey:'sfeccompare',
    toc:{g:'investment', t:'Current vs redesigned SFEC', d:[C.perPax ? 'What changes on 1 December 2026, per ' + C.course.short + ' participant' : 'What changes on 1 December 2026, in your numbers', 'What changes on 1 December 2026']}};
}

/* ---------- Slide: Why Vertical Institute (Trust & Case Studies) ---------- */
function suggestedCases(ctx){
  const order = (ctx.ind.cases || []).filter(k => CASES[k]);
  BUILTIN_CASE_KEYS.forEach(k => { if (!order.includes(k)) order.push(k); });
  const fam = ctx.aiPath ? 'ai' : ctx.c1.fam;
  const fits = order.filter(k => CASES[k].fams.includes(fam));
  return fits.concat(order.filter(k => !fits.includes(k))).slice(0, 2);
}
function pickCases(ctx){
  const S = ctx.S;
  if (S.casesMode === 'custom' && Array.isArray(S.casesList)){
    const list = S.casesList.filter((k, i, a) => CASES[k] && a.indexOf(k) === i).slice(0, 2);
    if (list.length) return list;
  }
  return suggestedCases(ctx);
}
function slideTrust(ctx){
  const els = [];
  header(els, 'WHY VERTICAL INSTITUTE', 'An accredited partner with a track record');
  const lw = 4.7;
  TRUST_STATS.forEach((s, i) => {
    const x = M + (i % 2) * (lw / 2 + 0.06), y = 1.6 + Math.floor(i / 2) * 1.12;
    const w = lw / 2 - 0.06;
    els.push(RRECT(x, y, w, 1.0, K.LAV1, 0.1));
    els.push(fit(T(x + 0.2, y + 0.1, w - 0.4, 0.46, s[0], {size:22, f:'h', c:K.BRAND, valign:'middle'}), {lines:1, box:false, min:0.6}));
    els.push(fit(T(x + 0.2, y + 0.56, w - 0.4, 0.4, s[1], {size:10, c:K.MUTED}), {lines:2}));
  });
  const ih = lw * 317 / 825;
  els.push(IMGEL('cna', M, 3.94, lw, ih));
  els.push(fit(T(M, 3.94 + ih + 0.1, lw, 0.6, 'Trainers are working practitioners, with experience at organisations such as Google, Grab, Gojek and Alibaba.', {size:10, i:true, c:K.MUTED}), {}));
  const picks = pickCases(ctx);
  const rx = M + lw + 0.35, rw = SW - M - rx;
  els.push(T(rx, 1.6, rw, 0.22, picks.length === 1 ? 'SUCCESS STORY' : 'SUCCESS STORIES', {size:9, b:true, c:K.BRAND, cs:1.5}));
  const one = picks.length === 1;
  const ch = one ? 4.82 : 2.33;
  picks.forEach((k, i) => {
    const cs = CASES[k];
    const y = 1.9 + i * (ch + 0.16);
    els.push(RRECT(rx, y, rw, ch, K.WHITE, 0.12, {line:{c:K.LINE, w:1}}));
    els.push(fit(T(rx + 0.28, y + (one ? 0.3 : 0.2), rw - 2.4, one ? 0.44 : 0.36, [run(cs.name, {link:cs.url})], {size:one ? 18 : 15, f:'h', c:K.INK}), {lines:1, box:false}));
    els.push(fit(T(rx + rw - 2.3, y + (one ? 0.38 : 0.24), 2.02, 0.26, cs.sector.toUpperCase(), {size:8.5, b:true, c:K.GREY, cs:1, align:'right', valign:'middle'}), {lines:1, box:false}));
    if (!one){
      const body = T(rx + 0.28, y + 0.64, rw - 0.56, ch - 0.8, [para([run(cs.what, {size:11, c:K.INK})], {after:5})].concat(
        cs.why ? [para([run('Why it is relevant: ', {size:11, b:true, c:K.INK}), run(cs.why, {size:11, c:K.INK})], {after:5})] : [],
        cs.quote ? [para([run(cs.quote, {size:11, i:true, c:K.MUTED})], {after:3})] : [],
        cs.who ? [para([run(cs.who, {size:9.5, b:true, c:K.GREY})])] : []));
      els.push(fit(body, {min:0.7}));
      return;
    }
    const body = fit(T(rx + 0.28, y + 0.98, rw - 0.56, 1.7, [para([run(cs.what, {size:13, c:K.INK})], {after:cs.why ? 10 : 0})].concat(
      cs.why ? [para([run('Why it is relevant: ', {size:13, b:true, c:K.INK}), run(cs.why, {size:13, c:K.INK})])] : [])), {min:0.75});
    body.h = textHeight(body);
    els.push(body);
    if (!cs.quote){ els.push(T(rx + 0.28, y + 0.98 + body.h + 0.24, rw - 0.56, 0.3, cs.who, {size:10.5, b:true, c:K.GREY})); return; }
    const qy = y + 0.98 + body.h + 0.32, qh = y + ch - 0.28 - qy;
    els.push(RRECT(rx + 0.28, qy, rw - 0.56, qh, K.LAV1, 0.1));
    els.push(fit(T(rx + 0.56, qy + 0.2, rw - 1.12, qh - 0.4, [
      para([run(cs.quote, {size:17, i:true, c:K.INK})], {after:8}),
      para([run(cs.who, {size:10.5, b:true, c:K.GREY})])], {valign:'middle'}), {min:0.7}));
  });
  if (picks.some(k => CASES[k].url)) els.push(T(rx, 1.9 + 2 * 2.33 + 0.16 + 0.06, rw, 0.26, picks.length === 1 ? 'The client name links to the full published case study.' : 'Client names link to the full published case studies.', {size:9, i:true, c:K.MUTED}));
  const names = picks.map(k => CASES[k].name.replace(/ (Singapore|South East Asia|Limited)$/, ''));
  return {bg:K.WHITE, els, name:'Why Vertical Institute', slideKey:'trust', toc:{g:'about', t:'Why Vertical Institute', d:['Our track record, with ' + names.join(' and ')]}};
}

/* ---------- Slide: Other Courses ---------- */
const DEFAULT_OTHERS = ['genai','gaicc','wfa','da','ds','dm','ux','seo','pbi','cyber','carbon','pres','lead','people','conflict','ct','crm','ga4','gyt','ada','pg','stress','ecom','chain'];
/* v6: what a course changes for a point the client raised: the benefit typed with the point, else the course's benefit
   for the point's theme, else its usual outcome for the industry */
function painOutcome(c, p, out){
  if (p.head) return [p.head, p.body || out.body];
  const b = (COURSE_BENEFITS[c.k] && COURSE_BENEFITS[c.k][p.theme]) || (BENEFITS[c.fam] && BENEFITS[c.fam][p.theme]);
  return b ? [b[0], p.body || b[1]] : [out.head, p.body || out.body];
}
/* v6: courses that answer a point from the call come first, then the consultant's choice or the industry's suggestions */
function linkedOthers(ctx){
  const out = [];
  otherPains(ctx).forEach(p => { if (!out.includes(p.other)) out.push(p.other); });
  return out;
}
function pickOthers(ctx){
  const S = ctx.S, taken = new Set(ctx.courses.map(c => c.k)), linked = linkedOthers(ctx);
  let base;
  if (S.othersMode === 'custom' && Array.isArray(S.othersList) && S.othersList.length) base = S.othersList.filter(k => C[k] && !taken.has(k));
  else { base = []; ctx.ind.others.concat(DEFAULT_OTHERS).forEach(k => { if (!taken.has(k) && !base.includes(k)) base.push(k); }); }
  return linked.concat(base.filter(k => !linked.includes(k))).slice(0, 6);
}
function slideOthers(ctx){
  const {client} = ctx;
  const els = [], peeks = [];
  header(els, 'MORE WAYS WE CAN HELP', 'Other Courses You Can Consider');
  const from = ctx.pilotCourse ? ctx.pilotCourse.short + ' pilot' : (ctx.multi ? 'programme' : ctx.c1.short + ' course');
  const list = pickOthers(ctx), outs = courseOutcomes(ctx, list);
  const nLinked = list.filter(k => otherPains(ctx).some(p => p.other === k)).length;
  const intro = 'Once the ' + from + ' is in place, the same accreditation and funding model extends to these SkillsFuture-funded courses' +
    (nLinked ? '. ' + (nLinked === 1 ? 'The first answers a point' : 'The first ' + nLinked + ' answer points') + ' your team raised; the others are picked for ' + ctx.ind.noun + '.'
             : ', picked for ' + ctx.ind.noun + '. Each shows who it suits and what it can change for ' + client + '.');
  els.push(fit(T(M, 1.36, 12.2, 0.5, intro, {size:12, c:K.MUTED}), {lines:2}));
  const n = list.length, cols = n <= 3 ? Math.max(1, n) : n === 4 ? 2 : 3, gx = 0.3, gy = 0.22, cw = (SW - 2 * M - (cols - 1) * gx) / cols, ch = 2.0;
  list.forEach((k, i) => {
    const c = C[k];
    const row = Math.floor(i / cols), inRow = Math.min(cols, n - row * cols);
    const x0 = M + (cols - inRow) * (cw + gx) / 2;
    const x = x0 + (i % cols) * (cw + gx), y = 1.98 + row * (ch + gy);
    const lp = otherPains(ctx).filter(p => p.other === k);
    els.push(RRECT(x, y, cw, ch, lp.length ? K.HL : K.LAV1, 0.14, lp.length ? {line:{c:K.BRAND, w:1.25}} : {}));
    const tile = !!(ctx.S && ctx.S.iconTile);
    if (tile) els.push(RRECT(x + 0.22, y + 0.22, 0.64, 0.64, K.WHITE, 0.12));
    if (IMG['ci_' + k]) els.push(tile ? IMGEL('ci_' + k, x + 0.29, y + 0.29, 0.5, 0.5) : IMGEL('ci_' + k, x + 0.2, y + 0.2, 0.68, 0.68));
    else {
      // No icon in the set yet: a badge drawn in the same style
      els.push(RRECT(x + 0.3, y + 0.3, 0.48, 0.48, K.WHITE, 0.1, {line:{c:c.color, w:2}}));
      els.push(fit(T(x + 0.3, y + 0.3, 0.48, 0.48, c.abbr, {size:11, b:true, c:c.color, align:'center', valign:'middle'}), {lines:1, box:false, min:0.6}));
    }
    let spot = null;
    if (ctx.hover){
      const d = 0.28, sx = x + cw - 0.2 - d, sy = y + 0.2;
      els.push(OVAL(sx, sy, d, d, K.WHITE, {line:{c:K.LINE, w:0.75}}));
      els.push(T(sx, sy, d, d, 'i', {size:10, b:true, c:K.BRAND, align:'center', valign:'middle'}));
      spot = {x:sx, y:sy, w:d, h:d};
    }
    els.push(fit(T(x + 0.98, y + 0.24, cw - 1.18 - (spot ? 0.36 : 0), 0.58, [run(c.short, {link:c.url})], {size:13, b:true, c:K.INK, valign:'middle'}), {lines:2}));
    // Who it suits, or (v6) the point from the call it answers
    if (lp.length) els.push(fit(T(x + 0.24, y + 0.93, cw - 0.48, 0.42, [run('You told us: ', {b:true, c:K.BRAND}), run(endStop(lp[0].text), {c:K.INK})], {size:10}), {lines:2, min:0.85}));
    else els.push(fitFirst([c.who, c.pos].filter(Boolean), t => T(x + 0.24, y + 0.93, cw - 0.48, 0.42, [run('Best for: ', {b:true, c:K.INK}), run(t, {c:K.MUTED})], {size:10}), {lines:2}, 0.85));
    // What it can change for this client, matched to the industry (or the benefit typed with the point)
    const out = outs[k];
    tick(els, x + 0.27, y + 1.465, K.GREEN);
    els.push(fit(T(x + 0.52, y + 1.39, cw - 0.76, 0.26, lp.length ? painOutcome(c, lp[0], out)[0] : out.head, {size:10.5, b:true, c:K.INK, valign:'middle'}), {lines:1, box:false}));
    // Time and cost
    const lo = money(per(c, 70, ctx).up), dd = daysFor(c.hrs).d, days = dd === 1 ? '1 day' : dd + ' days';
    const aft = ctx.sfecOn && !ctx.isLegacySfec ? ' after funding and SFEC' : ' after funding';
    els.push(fitFirst([hrsText(c.hrs) + ' (' + days + ')  ·  from ' + lo + ' upfront per participant' + aft, hrsText(c.hrs) + '  ·  from ' + lo + ' per participant' + aft, hrsText(c.hrs) + '  ·  from ' + lo + aft, hrsText(c.hrs) + '  ·  from ' + lo + ' after funding'],
      t => T(x + 0.24, y + 1.69, cw - 0.48, 0.22, t, {size:9.5, b:true, c:K.BRAND}), {lines:1, box:false}, 0.95));
    if (ctx.hover) peeks.push({x, y, w:cw, h:ch, spot, card:othersPeek(ctx, c, out)});
  });
  const rowsN = Math.ceil(list.length / cols);
  const by = Math.max(1.98 + rowsN * (ch + gy) + 0.02, 6.4);
  els.push(RRECT(M, by, SW - 2 * M, 0.5, K.NAVY, 0.1));
  // v6: the full course list, a detail slide behind this one
  const catOn = slideHas(ctx, 'catalogue'), catW = catOn ? 2.45 : 0;
  const note = ctx.hover
    ? 'Hover over a course, or tap it, for who it suits, what participants learn and the cost after funding. All listed programmes are accredited by SkillsFuture Singapore (SSG, part of SWDA) and follow this proposal’s funding model.'
    : 'All listed programmes are accredited by SkillsFuture Singapore (SSG, part of SWDA) and follow the funding model in this proposal.' + (catOn ? '' : ' Ask us for the full catalogue and a funding breakdown for any team.');
  els.push(fit(T(M + 0.3, by, SW - 2 * M - 0.6 - catW, 0.5, note, {size:10.5, c:K.WHITE, valign:'middle'}), {lines:2}));
  if (catOn){
    const px = SW - M - 0.14 - catW, py = by + 0.09;
    pill(els, 'SEE ALL ' + COURSES.length + ' COURSES  →', px, py, catW, K.WHITE, K.BRAND, 0.32, 9, 1);
    els.push(GO(px, py, catW, 0.32, 'catalogue', 'See all ' + COURSES.length + ' courses', 0.16));
  }
  return {bg:K.WHITE, els, peeks, name:'Other courses', slideKey:'others', toc:{g:'about', t:'Other courses', d:['Who each suits, and the cost after funding', 'More programmes on the same funding model']}};
}

/* ---------- Detail slide (v6): the full course list, opened from Other courses ---------- */
function slideCatalogue(ctx){
  const els = [];
  header(els, 'COURSE CATALOGUE', ['All ' + COURSES.length + ' Programmes We Run', 'All ' + COURSES.length + ' Programmes']);
  const sfecTail = ctx.sfecOn && !ctx.isLegacySfec ? ' and SFEC' : '';
  els.push(fit(T(M, 1.36, 12.2, 0.3, 'Each is SkillsFuture-funded and runs as a private class for your team or as seats on a public run. Prices are per participant after 70% funding' + sfecTail + ', incl. GST.', {size:12, c:K.MUTED}), {lines:1, box:false}));
  const inDeck = new Set(ctx.courses.map(c => c.k));
  const shown = new Set(slideHas(ctx, 'others') ? pickOthers(ctx) : []);
  const raised = new Set(otherPains(ctx).map(p => p.other));
  const colsDef = [['ai', 'data'], ['dm', 'tech'], ['people']];
  const gx = 0.38, cw = (SW - 2 * M - 2 * gx) / 3, rowH = 0.355, headH = 0.44;
  colsDef.forEach((gs, ci) => {
    const x = M + ci * (cw + gx);
    let y = 1.92;
    gs.forEach(g => {
      const label = (GROUPS.find(G => G[0] === g) || [g, g])[1];
      els.push(T(x, y, cw, 0.3, label.toUpperCase(), {size:9.5, b:true, c:K.BRAND, cs:1.5, valign:'middle'}));
      els.push(LINE(x, y + 0.34, x + cw, y + 0.34, K.LINE, 0.9));
      y += headH;
      COURSES.filter(c => c.g === g).forEach(c => {
        const mine = inDeck.has(c.k), sug = shown.has(c.k), yours = raised.has(c.k);
        if (mine) els.push(RRECT(x - 0.06, y + 0.02, cw + 0.12, rowH - 0.04, K.HL, 0.06));
        courseIcon(els, c, x, y + 0.045, 0.27, false);
        const right = (c.hrs === Math.floor(c.hrs) ? c.hrs : c.hrs.toFixed(1)) + ' h  ·  from ' + money(per(c, 70, ctx).up);
        const rw = measure({size:9}, right) / PT + 0.05;
        const tag = mine ? 'IN THIS PROPOSAL' : yours ? 'YOU RAISED THIS' : '';
        const tagW = tag ? measure({size:7, b:true, cs:0.6}, tag) / PT + 0.2 : 0;
        els.push(fit(T(x + 0.36, y, cw - 0.42 - rw - (tag ? tagW + 0.08 : 0), rowH, [run(c.short, {link:c.url})], {size:10.5, b: mine || sug || yours, c: mine || sug || yours ? K.INK : K.SLATE, valign:'middle'}), {lines:1, box:false, min:0.8}));
        if (tag) pill(els, tag, x + cw - rw - tagW - 0.06, y + (rowH - 0.2) / 2, tagW, mine ? K.BRAND : K.AMB, mine ? K.WHITE : K.GOLD, 0.2, 7, 0.6);
        els.push(T(x + cw - rw, y, rw, rowH, right, {size:9, c:K.MUTED, align:'right', valign:'middle'}));
        y += rowH;
      });
      y += 0.22;
    });
    if (ci === 2){
      const by = Math.max(y + 0.05, 5.3);
      els.push(RRECT(x, by, cw, 1.4, K.NAVY, 0.12));
      els.push(T(x + 0.25, by + 0.14, cw - 0.5, 0.42, COURSES.length + ' programmes', {size:19, f:'h', c:K.WHITE}));
      els.push(fit(T(x + 0.25, by + 0.6, cw - 0.5, 0.7, (inDeck.size ? 'Highlighted: ' + (inDeck.size === 1 ? 'the course' : 'the ' + inDeck.size + ' courses') + ' in this proposal. ' : '') + (shown.size ? 'Bold: also on the previous slide. ' : '') + 'Select a course for its full details.', {size:10.5, c:K.E4}), {lines:3}));
    }
  });
  if (slideHas(ctx, 'others')) backPill(els, '←  OTHER COURSES', M, 6.98, 2.0, 'others', 'Back to Other courses');
  detailFoot(els, ctx, 'Course catalogue', M + 2.2);
  return {bg:K.WHITE, els, name:'All ' + COURSES.length + ' courses', slideKey:'catalogue', detail:true, parentKey:'others', group:'catalogue'};
}

/* ---------- Slide: Next Steps ---------- */
function nextItems(ctx){
  const {S, pilotCourse} = ctx;
  const items = [];
  const days = daysFor(Math.max(...ctx.courses.map(c => c.hrs)));
  if (pilotCourse){
    items.push(['Pilot cohort', 'Confirm the ' + pilotCourse.pax + ' participants for the ' + pilotCourse.short + ' pilot' + (pilotCourse.team ? ' (' + pilotCourse.team + ')' : '') + ', so we can tailor the exercises to their roles before wider commitment.']);
  } else if (ctx.priv){
    items.push(['Participants', 'The participants for the first cohort' + (ctx.pax ? ' (around ' + ctx.pax + ')' : '') + ', and each person’s role, so we can set the examples in their work.']);
  } else {
    items.push(['Participants and dates', 'Who will join' + (ctx.pax ? ' (around ' + ctx.pax + ')' : '') + ', and the public run dates that suit them.']);
  }
  items.push(['Participant details', 'Each person’s citizenship and age band, which sets their funding level.']);
  if (ctx.priv) items.push(['Format and schedule', (ctx.multi ? 'Full or half days for each course' : cap(days.text)) + ', ' + ctx.venueChoice + (ctx.trainingDateFmt ? ' (starting ' + ctx.trainingDateFmt + ').' : '.')]);
  if (ctx.multiUen && ctx.uens.length > 0){
    const uList = ctx.uens.map(u => u.name + (u.uen ? ' (' + u.uen + ')' : '') + ': ' + money0(u.balDollars)).join(', ');
    items.push(['Sponsoring entities (' + ctx.uens.length + ')', 'Confirm how participants are split across ' + uList + ' (' + money0(ctx.bal) + ' SFEC in total).']);
  } else if (ctx.sfecOn && !ctx.isLegacySfec){
    items.push(['SFEC (Enhanced) credit', 'Complete the workforce questionnaire on the OurWorkforce Portal to unlock the fresh S$10,000, so we can apply it at enrolment (within ' + SFEC_NEW_CLAIM_DAYS + ' days of the course start).']);
  } else if (S.sfec === 'unknown'){
    items.push(['SFEC balance', 'Your SFEC balance on the Business Grants Portal (claimed back after the course).']);
  } else if (S.sfec === 'known' && ctx.bal > 0){
    items.push(['SFEC allocation', 'Confirm applying your ' + money0(ctx.bal) + ' SFEC balance (' + (ctx.isLegacySfec ? 'claimed back after the course' : 'offset upfront at billing') + ').']);
  }
  if (!ctx.multiUen){
    items.push(['Sponsoring company', 'The UEN (company registration number) of the employer, so we can check funding and SFEC against it.']);
  }
  const tail = ctx.trainingDateFmt ? ' for ' + ctx.trainingDateFmt : '';
  items.push(['Approval', 'Approval by ' + (fmtDay(S.decision) || 'your preferred date') + ', so we can ' + (ctx.priv ? 'secure trainers and dates' + tail : 'hold places in your preferred run') + '.']);
  if (items.length > 5){
    const i = items.findIndex(x => x[0] === 'Sponsoring company'); if (i >= 0) items.splice(i, 1);
    items[1] = ['Participant & UEN details', 'Each person’s citizenship and age band, and the employer’s UEN (company registration number), so we can check funding.'];
  }
  if (items.length < 5) items.splice(items.length - 1, 0, ['Format', 'Weekday or weekend, online or in person, whichever suits the team.']);
  return items.slice(0, 5);
}
function slideNext(ctx){
  const els = [];
  header(els, 'NEXT STEPS', 'From this proposal to a trained team', true);
  els.push(fit(T(M, 1.4, 12.2, 0.3, ctx.pilotCourse ? ('To launch the ' + ctx.pilotCourse.short + ' pilot cohort and hold your schedule, please confirm the following.') : (ctx.priv ? 'To secure a trainer and dates, it would help to confirm the following.' : 'To hold places in a public run, it would help to confirm the following.'), {size:12.5, c:K.E4}), {lines:1, box:false}));
  const items = nextItems(ctx);
  const cw = (SW - 2 * M - 4 * 0.22) / 5;
  items.forEach((c, i) => {
    const x = M + i * (cw + 0.22), y = 2.0;
    els.push(RRECT(x, y, cw, 3.0, K.WHITE));
    circleNum(els, i + 1, x + 0.25, y + 0.28, 0.55, K.BRAND, K.WHITE, 15);
    els.push(fit(T(x + 0.25, y + 1.0, cw - 0.5, 0.62, c[0], {size:15, f:'h', c:K.INK}), {lines:2}));
    els.push(fit(T(x + 0.25, y + 1.62, cw - 0.5, 1.28, c[1], {size:10.5, c:K.INK}), {}));
  });
  els.push(T(M, 5.12, 12.2, 0.3, 'Once confirmed, we verify funding eligibility, issue the quotation and confirm the class dates.', {size:11.5, i:true, c:K.E4}));
  els.push(RRECT(M, 5.6, SW - 2 * M, 1.0, K.MID, 0.12, {line:{c:'4A66D6', w:0.75}}));
  els.push(IMGEL('icon', M + 0.3, 5.8, 0.6, 0.6));
  const P_ = ctx.consultant;
  els.push(fit(T(M + 1.1, 5.77, 11, 0.32, P_.name + '  ·  ' + P_.title + ', ' + P_.org, {size:14, b:true, c:K.WHITE}), {lines:1, box:false}));
  const contact = [run(P_.email, {link:'mailto:' + P_.email, u:false})];
  if (P_.phones) contact.push(run('   ·   ' + P_.phones));
  if (P_.web) contact.push(run('   ·   '), run(P_.web, {link:'https://' + String(P_.web).replace(/^https?:\/\//, ''), u:false}));
  els.push(fit(T(M + 1.1, 6.11, 11, 0.3, contact, {size:11.5, c:K.E4}), {lines:1, box:false}));
  return {bg:K.BG, els, dark:true, name:'Next steps', slideKey:'next', toc:{g:'next', t:'Next steps', d:[ctx.pilotCourse ? 'Confirming the pilot cohort and target dates' : (ctx.priv ? 'What we need to secure a trainer and dates' : 'What we need to hold your places')]}};
}

/* ---------- Contents ---------- */
const TOC_GROUPS = [['proposal','THE PROPOSAL'],['programme','THE PROGRAMME'],['investment','INVESTMENT'],['about','ABOUT VERTICAL INSTITUTE'],['next','TO GET STARTED']];
function tocRow(els, x, y, w, h, it, compact){
  const t = it.s.toc;
  els.push(RRECT(x, y, w, h, K.WHITE, 0.1, {line:{c:K.LINE, w:1}}));
  const d = Math.min(0.36, h - 0.1);
  circleNum(els, it.n, x + 0.16, y + (h - d) / 2, d, K.BRAND, K.WHITE, d < 0.3 ? 9 : 10);
  const tx = x + 0.16 + d + 0.16, tw = w - (tx - x) - 0.5;
  if (compact){
    els.push(fit(T(tx, y, tw, h, t.t, {size:11, b:true, c:K.INK, valign:'middle'}), {lines:1, box:false}));
  } else {
    const title = fit(T(tx, 0, tw, 0.28, t.t, {size:12, b:true, c:K.INK}), {lines:1, box:false, min:0.8});
    const desc = fitFirst([].concat(t.d), str => T(tx, 0, tw, 0.22, str, {size:9.5, c:K.MUTED}), {lines:1, box:false}, 0.95);
    const th = textHeight(title), dh = textHeight(desc), gap = 0.02;
    const ty = y + (h - th - gap - dh) / 2;
    title.y = ty; title.h = th; desc.y = ty + th + gap; desc.h = dh;
    els.push(title, desc);
  }
  els.push(T(x + w - 0.42, y, 0.28, h, '→', {size:12.5, b:true, c:K.BRAND, align:'center', valign:'middle'}));
  els.push(GO(x, y, w, h, it.n - 1, 'Go to ' + t.t, 0.1));
}
function slideContents(ctx, items){
  const els = [];
  header(els, 'CONTENTS', 'What this proposal covers');
  els.push(fit(T(M, 1.36, 12.2, 0.3, 'Select a section to go straight to it. The Contents button at the foot of every slide brings you back here.', {size:12, c:K.MUTED}), {lines:1, box:false}));
  const groups = TOC_GROUPS.map(([k, label]) => ({label, items: items.filter(it => it.s.toc && it.s.toc.g === k)})).filter(g => g.items.length);
  // Flatten into labels and rows, then split into two columns of similar height; a long group continues in the second column.
  const LBL = 0.3, GG = 0.16, GAP = 0.07, TOP = 1.92, AVAIL = 6.92 - TOP;
  const seq = [];
  groups.forEach((g, gi) => { seq.push({lab:g.label, first: gi === 0}); g.items.forEach(it => seq.push({it, label:g.label})); });
  const rowsTotal = seq.filter(x => x.it).length;
  const target = Math.ceil(rowsTotal / 2);
  let cut = 0, rowsSeen = 0;
  for (let i = 0; i < seq.length; i++){ if (seq[i].it){ rowsSeen++; if (rowsSeen === target){ cut = i + 1; break; } } }
  if (groups.length === 1 && rowsTotal <= 6) cut = seq.length;
  let colA = seq.slice(0, cut), colB = seq.slice(cut);
  if (colB.length && colB[0].it) colB.unshift({lab: colB[0].label + '  (CONTINUED)', first:true});
  if (colB.length && colB[0].lab) colB[0].first = true;
  const cols = colB.length ? [colA, colB] : [colA];
  const fixedOf = col => col.reduce((a, x) => a + (x.lab ? LBL + (x.first ? 0 : GG) : 0), 0);
  const rowsOf = col => col.filter(x => x.it).length;
  const gapsOf = col => Math.max(0, rowsOf(col) - col.filter(x => x.lab).length);
  const rh = Math.min(0.6, ...cols.map(col => (AVAIL - fixedOf(col) - gapsOf(col) * GAP) / Math.max(1, rowsOf(col))));
  const compact = rh < 0.46;
  const cw = cols.length > 1 ? (SW - 2 * M - 0.4) / 2 : SW - 2 * M;
  cols.forEach((col, ci) => {
    const x = M + ci * (cw + 0.4);
    let y = TOP, prevRow = false;
    col.forEach(item => {
      if (item.lab){
        if (!item.first) y += GG;
        els.push(T(x, y, cw, 0.22, item.lab, {size:9, b:true, c:K.BRAND, cs:1.5}));
        y += LBL; prevRow = false;
        return;
      }
      if (prevRow) y += GAP;
      tocRow(els, x, y, cw, rh, item.it, compact);
      y += rh; prevRow = true;
    });
  });
  return {bg:K.WHITE, els, name:'Contents', slideKey:'contents'};
}

/* ---------- Slide Removal & Full Deck Builder (with Per-UEN Cohort Slides, Decoupled Pax & Auto-Renumbering) ---------- */
const OPTIONAL_SLIDE_MAP = {contents:'contents', timeline:'timeline', cohort:'cohort', trust:'trust', others:'others', sfeccompare:'compare'};
/* Optional slides that stay out unless ticked. */
const OPTIONAL_OFF_BY_DEFAULT = {compare:true};

function isSlideKeyRemoved(S, key){
  const removed = Array.isArray(S.removedSlides) ? S.removedSlides : [];
  if (removed.includes(key)) return true;
  const opt = OPTIONAL_SLIDE_MAP[key];
  if (opt && OPTIONAL_OFF_BY_DEFAULT[opt] && !(S.slides && S.slides[opt] === true)) return true;
  if (opt && S.slides && S.slides[opt] === false) return true;
  if (key.startsWith('cohort_') && S.slides && S.slides.cohort === false) return true;
  return false;
}

/* ---------- v6: slide order, detail slides and links by name ---------- */
/* The key a slide keeps in a custom order: per-entity calculator pages move together, and the programme slide keeps its
   place whether it is the pathway (several courses) or the course (one) */
const orderKey = k => /^cohort/.test(k) ? 'cohort' : (/^course_/.test(k) || k === 'pathway') ? 'programme' : k;
function applyOrder(list, order){
  if (!Array.isArray(order) || !order.length) return list;
  const pos = new Map(order.map((k, i) => [k, i]));
  const has = m => pos.has(orderKey(m.slideKey));
  const res = list.filter(has).sort((a, b) => pos.get(orderKey(a.slideKey)) - pos.get(orderKey(b.slideKey)));
  list.forEach((m, i) => {
    if (has(m)) return;
    let j = i - 1;
    while (j >= 0 && res.indexOf(list[j]) < 0) j--;
    res.splice(j < 0 ? 0 : res.indexOf(list[j]) + 1, 0, m);
  });
  const ci = res.findIndex(m => m.slideKey === 'cover');
  if (ci > 0) res.unshift(res.splice(ci, 1)[0]);
  return res;
}
/* Detail slides, opened from buttons rather than in the slide order: lesson slides for each proposed course that has
   lesson detail (behind the course slide, or behind a course detail slide on a multi-course deck) and the full course
   list behind Other courses. A detail slide is left out when the slide that opens it is removed. */
function detailPlan(S, ctx, opts){
  const out = [];
  if (opts && opts.details === false) return out;
  const on = k => !isSlideKeyRemoved(S, k);
  const off = S.detailOff && typeof S.detailOff === 'object' ? S.detailOff : {};
  const lessonsOn = S.details !== false;
  ctx.courses.forEach(c => {
    if (ctx.multi){
      if (!(on('pathway') || on('modmap')) || off['course_' + c.k]) return;
      out.push({key:'course_' + c.k, kind:'course', c});
    } else if (!on('course_' + c.k)) return;
    if (!lessonsOn || !hasLessonSlides(c) || off['md_' + c.k]) return;
    (c.lessons || c.areas).forEach((l, i) => { if (modData(c, i)) out.push({key:'md_' + c.k + '_' + (i + 1), kind:'lesson', c, i}); });
  });
  if (on('others') && !(S.slides && S.slides.catalogue === false)) out.push({key:'catalogue', kind:'catalogue'});
  return out;
}
function drawDetail(ctx, d){
  if (d.kind === 'course') return slideCourse(ctx, d.c, d.c.idx, {detail:true});
  if (d.kind === 'lesson') return slideLesson(ctx, d.c, d.i);
  if (d.kind === 'catalogue') return slideCatalogue(ctx);
  return null;
}
/* Links drawn with a slide key (GO(..., 'md_genai_4')) become slide numbers; links to slides not in the deck go. */
function resolveLinks(slide, keyIdx){
  (slide.peeks || []).forEach(p => { if (p.card && p.card.go && typeof p.card.go.to === 'string') p.card.go = keyIdx[p.card.go.to] != null ? {label:p.card.go.label, to:keyIdx[p.card.go.to]} : null; });
  slide.els = slide.els.filter(el => {
    if (el.t !== 'go' || typeof el.to !== 'string') return true;
    if (keyIdx[el.to] == null) return false;
    el.to = keyIdx[el.to];
    return true;
  });
}

/* Builds the deck. opts.mode: 'live' (selectors drawn for interactive decks) or 'static' (PDF / print, no selector arrows).
   opts.variants: true adds hidden PowerPoint slides behind every selector, so the funding and calculator views stay
   clickable in PowerPoint. Interactive web decks never need these: they re-render the slide on demand. */
function buildDeck(S, opts){
  opts = opts || {};
  const variants = !!opts.variants;
  const mode = opts.mode === 'static' && !variants ? 'static' : 'live';
  const ctx = makeCtx(S);
  ctx.hover = mode === 'live' && !variants;   // web deck and builder preview: course overviews open on hover
  // v6: the detail slides are planned first, so the main slides know which buttons to draw
  const plan = detailPlan(S, ctx, opts);
  ctx.detailKeys = new Set(plan.map(d => d.key));
  ctx.mainKeys = new Set();
  const fCourses = fundCourses(ctx);
  const fGroups = ctx.groups;
  const defFundCKey = fCourses[0].key;

  const candidates = [];
  candidates.push(slideCover(ctx));
  candidates.push({slideKey:'contents', name:'Contents', isContentsPlaceholder:true});
  candidates.push(slideSummary(ctx));
  candidates.push(slideWhy(ctx));
  /* Several courses: the pathway slide carries each course's overview (on hover in web decks, as a link to the course
     page in PDF and PowerPoint), so there is no separate slide per course. A single course keeps its own slide. */
  if (ctx.multi){ candidates.push(slidePathway(ctx)); candidates.push(slideLessonMap(ctx)); }
  else candidates.push(slideCourse(ctx, ctx.c1, 0));
  candidates.push(slidePractice(ctx));
  candidates.push(slideDelivery(ctx, {mode}));
  candidates.push(slideTimeline(ctx));
  candidates.push(slideFunding(ctx, {cKey:defFundCKey, gIdx:0, cList:fCourses, groups:fGroups, mode}));
  /* Several sponsoring entities: one calculator slide with an entity selector in web decks and the clickable PowerPoint.
     PDF and picture-only PowerPoint print a page per entity, since nothing can be switched there. */
  if (ctx.multiUen && ctx.uens.length > 1 && mode !== 'static') candidates.push(slideCohortAll(ctx, {mode, uenSwitch:true}));
  else {
    const uenEntities = (ctx.multiUen && ctx.uens.length > 1) ? ctx.uens : [ctx.multiUen && ctx.uens.length === 1 ? ctx.uens[0] : null];
    if (uenEntities.length > 1) candidates.push(slideCohortAll(ctx, {mode}));   // PDF and picture slides: the combined page, then one per entity
    uenEntities.forEach(uenObj => candidates.push(slideCohortCalc(ctx, {mode}, uenObj)));
  }
  if (ctx.sfecOn) candidates.push(slideSfecCompare(ctx));
  candidates.push(slideTrust(ctx));
  candidates.push(slideOthers(ctx));
  candidates.push(slideNext(ctx));

  const offOptional = k => { const o = OPTIONAL_SLIDE_MAP[k]; return !!(o && OPTIONAL_OFF_BY_DEFAULT[o] && !(S.slides && S.slides[o] === true)); };
  const ordered = applyOrder(candidates, S.order);
  const slideInventory = ordered.map(s => ({key:s.slideKey, orderKey:orderKey(s.slideKey), name:s.name, removed:isSlideKeyRemoved(S, s.slideKey), optionalOff:offOptional(s.slideKey)}));
  let activeSlides = ordered.filter(s => !isSlideKeyRemoved(S, s.slideKey));
  if (!activeSlides.length) activeSlides = [candidates[0]];
  const tocAt = activeSlides.findIndex(s => s.slideKey === 'contents');
  if (tocAt >= 0){
    const tocItems = [];
    activeSlides.forEach((s, idx) => { if (idx !== tocAt && s.toc) tocItems.push({s, n:idx + 1}); });
    activeSlides[tocAt] = slideContents(ctx, tocItems);
  }
  const slides = activeSlides;
  const main = slides.length;
  slides.forEach((s, i) => { s.num = i + 1; });
  let runNum = 0;
  slideInventory.forEach(item => { item.num = item.removed ? null : ++runNum; });
  // v6: detail slides go straight after the main slides (PDF appendix pages, hidden slides in PowerPoint)
  slides.forEach(s => ctx.mainKeys.add(s.slideKey));
  const details = plan.map(d => drawDetail(ctx, d)).filter(Boolean);
  const nDet = details.length;
  const detailInventory = plan.map(d => ({key:d.key, kind:d.kind, course:d.c ? d.c.k : '', name: d.kind === 'course' ? 'Inside ' + d.c.short : d.kind === 'lesson' ? d.c.short + ' · ' + (d.c.lessons ? 'lesson ' : 'area ') + (d.i + 1) : 'All ' + COURSES.length + ' courses'}));

  const fi = slides.findIndex(s => s.fund);
  const calcIndices = [];
  slides.forEach((s, idx) => { if (s.calc) calcIndices.push(idx); });
  const views = [];

  if (variants && fi >= 0 && (fCourses.length > 1 || fGroups.length > 1)){
    const combos = [];
    fCourses.forEach(c => fGroups.forEach((g, gi) => { if (!(c.key === defFundCKey && gi === 0)) combos.push({cKey:c.key, gIdx:gi}); }));
    const start = main + nDet + views.length;
    const idxFor = (cKey, gIdx) => {
      if (cKey === defFundCKey && gIdx === 0) return fi;
      const k = combos.findIndex(x => x.cKey === cKey && x.gIdx === gIdx);
      return k >= 0 ? start + k : fi;
    };
    const fv = (cKey, gIdx) => ({cKey, gIdx, cList:fCourses, groups:fGroups, mode:'live', linkCourse: k => idxFor(k, gIdx), linkGroup: g => idxFor(cKey, g)});
    slides[fi] = Object.assign(slideFunding(ctx, fv(defFundCKey, 0)), {num:fi + 1});
    combos.forEach(fc => views.push(Object.assign(slideFunding(ctx, fv(fc.cKey, fc.gIdx)), {num:fi + 1, hidden:true, of:fi})));
  }
  if (variants){
    // Training schedule: one hidden view per course in the proposal and number of days that fits (headcount fixed);
    // built before the calculator views so they come out of the same size budget
    const di = slides.findIndex(s => s.sched);
    if (di >= 0){
      const V0 = schedView(ctx, {});
      const defN = k => schedView(ctx, {k}).n;
      const combos = [];
      V0.list.filter(x => x.inProposal).forEach(x => schedView(ctx, {k:x.k}).formats.forEach(f => { if (f.fits && !(x.k === V0.sel.k && f.n === V0.n)) combos.push({k:x.k, n:f.n}); }));
      combos.sort((a, b) => (defN(b.k) === b.n) - (defN(a.k) === a.n));   // each course's own default first
      combos.splice(10);
      const start = main + nDet + views.length;
      const idxFor = (k, n) => { if (n == null) n = defN(k); if (k === V0.sel.k && n === V0.n) return di; const j = combos.findIndex(c => c.k === k && c.n === n); return j >= 0 ? start + j : di; };
      const sv = (k, n) => ({k, n, mode:'live', linkCourse: kk => idxFor(kk, null), linkN: nn => idxFor(k, nn)});
      slides[di] = Object.assign(slideDelivery(ctx, sv(V0.sel.k, V0.n)), {num:di + 1});
      combos.forEach(c => views.push(Object.assign(slideDelivery(ctx, sv(c.k, c.n)), {num:di + 1, hidden:true, of:di})));
    }
  }
  if (variants){
    // Keep the PowerPoint under about 15 MB: roughly 36 hidden views in total, so fewer headcounts per course when there are many
    const entsOf = s => s.uenSwitch ? ctx.uens : [s.uenObj || null];
    const optCount = calcIndices.reduce((a, ci) => a + entsOf(slides[ci]).reduce((b, u) => b + calcCourseOptions(ctx, u).length, 0), 0);
    const perN = Math.max(3, Math.min(7, Math.floor((36 - views.length) / Math.max(1, optCount))));
    calcIndices.forEach(ci => {
      const base = slides[ci];
      // One plan per entity (one for an ordinary calculator). The first entity's default view is the visible slide;
      // every other entity's default view and every course / headcount combination is a hidden slide.
      const plans = entsOf(base).map(uenObj => {
        const scoped = coursesForUen(ctx, uenObj);
        const defCKey = calcCourseOptions(ctx, uenObj)[0].key;
        const defPlan = calcView(ctx, {}, uenObj).plan;
        const defPax = defPlan.uniform ? defPlan.lines[0].qty : null;
        const lists = {}, combos = [];
        calcCourseOptions(ctx, uenObj).forEach(o => {
          const hl = pptxHeadcounts(ctx, o.key, uenObj, perN);
          lists[o.key] = hl;
          hl.list.forEach(n => { if (!(o.key === defCKey && n === defPax)) combos.push({cKey:o.key, pax:n}); });
        });
        return {uenObj, defCKey, defPax, lists, combos};
      });
      let pos = main + nDet + views.length;
      // With an entity selector the visible slide is all entities combined, so every entity's default view is a hidden slide
      plans.forEach((p, ei) => { p.defIdx = ei === 0 && !base.uenSwitch ? ci : pos++; p.start = pos; pos += p.combos.length; });
      const idxFor = (p, cKey, pax) => {
        if (pax == null){ if (cKey === p.defCKey) return p.defIdx; pax = p.lists[cKey] ? p.lists[cKey].P : null; }
        if (cKey === p.defCKey && pax === p.defPax) return p.defIdx;
        const k = p.combos.findIndex(x => x.cKey === cKey && x.pax === pax);
        return k >= 0 ? p.start + k : p.defIdx;
      };
      const uenIdx = id => { const q = plans.find(x => x.uenObj && x.uenObj.id === id); return q ? q.defIdx : ci; };
      const cv = (p, cKey, pax) => ({cKey, pax, mode:'live', uenSwitch:!!base.uenSwitch, paxList:(p.lists[cKey] || p.lists[p.defCKey]).list,
        linkCourse: k => idxFor(p, k, null), linkPax: n => idxFor(p, cKey, n), linkUen: plans.length > 1 ? uenIdx : null});
      if (base.uenSwitch) slides[ci] = Object.assign(slideCohortAll(ctx, {mode:'live', uenSwitch:true, linkUen:uenIdx}), {num:ci + 1});
      plans.forEach((p, ei) => {
        if (ei === 0 && !base.uenSwitch) slides[ci] = Object.assign(slideCohortCalc(ctx, cv(p, p.defCKey, null), p.uenObj), {num:ci + 1});
        else views.push(Object.assign(slideCohortCalc(ctx, cv(p, p.defCKey, null), p.uenObj), {num:ci + 1, hidden:true, of:ci}));
        p.combos.forEach(cc => views.push(Object.assign(slideCohortCalc(ctx, cv(p, cc.cKey, cc.pax), p.uenObj), {num:ci + 1, hidden:true, of:ci})));
      });
    });
  }

  const all = slides.concat(details, views);
  // v6: links by slide key, and where each detail slide sits (its parent, and the other slides in its group)
  const keyIdx = {};
  all.forEach((s, i) => { if (i < main + nDet && s.slideKey && keyIdx[s.slideKey] == null) keyIdx[s.slideKey] = i; });
  all.forEach(s => resolveLinks(s, keyIdx));
  details.forEach((s, j) => {
    const i = main + j;
    s.parentIdx = keyIdx[s.parentKey] != null ? keyIdx[s.parentKey] : -1;
    s.siblings = details.map((d, k) => d.group === s.group ? main + k : -1).filter(k => k >= 0);
    s.num = null;
    s.idx = i;
  });
  addFooters(all, ctx, tocAt, main);
  all.forEach(s => { s.hotspots = extractHotspots(s); });
  return {slides:all, main, details:nDet, keyIdx, ctx, tocAt, fundAt:fi, calcIndices, calcAt: calcIndices.length ? calcIndices[0] : -1, slideInventory, detailInventory, mode, variants};
}

/* Re-renders one interactive slide (funding or calculator) for a view chosen in a live deck. */
function renderViewSlide(deck, idx, view){
  const base = deck.slides[idx];
  if (!base || !view) return base;
  let s = null;
  if (base.fund) s = slideFunding(deck.ctx, Object.assign({cList:fundCourses(deck.ctx), groups:deck.ctx.groups, mode:deck.mode}, view));
  else if (base.sched) s = slideDelivery(deck.ctx, Object.assign({}, view, {mode:deck.mode}));
  else if (base.calc){
    const sc = calcScope(deck.ctx, base, view);
    s = sc.all ? slideCohortAll(deck.ctx, {mode:deck.mode, uenSwitch:true, byUen:sc.byUen})
      : slideCohortCalc(deck.ctx, Object.assign({mode:deck.mode}, sc.sub, {uenSwitch:!!base.uenSwitch}), sc.uenObj);
  }
  if (!s) return base;
  s.num = base.num; s.slideKey = base.slideKey;
  if (deck.keyIdx) resolveLinks(s, deck.keyIdx);
  addFooters([s], deck.ctx, deck.tocAt, deck.main);
  s.hotspots = extractHotspots(s);
  return s;
}

function deckMeta(ctx){
  const safe = s => String(s).replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const base = safe(ctx.client) + '_' + safe(ctx.multi ? ctx.progFull : ctx.c1.short) + '_Proposal';
  return {base, title: (ctx.multi ? ctx.progFull : ctx.c1.name) + ' for ' + ctx.client, author: ctx.consultant.name + ', ' + ctx.consultant.org, subject:'Corporate training proposal'};
}

/* ---------- Pre-export checklist ----------
   Returns [{level:'error'|'warn'|'info', id, msg, fix:{label, act}}]. Errors block export until fixed or overridden. */
function isoToday(){ const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
/* Last class day if the course runs on consecutive weekdays (or weekend days) from its start date. */
function estimateEnd(iso, sessions, weekday){
  const d = parseISO(iso); if (!d) return iso;
  let left = Math.max(0, sessions - 1);
  while (left > 0){ d.setDate(d.getDate() + 1); const w = d.getDay(); if (weekday ? (w !== 0 && w !== 6) : (w === 0 || w === 6)) left--; }
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function isoAddDays(iso, n){ const d = parseISO(iso); if (!d) return iso; d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function preflightIssues(S, today){
  const out = [];
  const add = (level, id, msg, fix) => out.push({level, id, msg, fix: fix || null});
  today = today || isoToday();
  const ctx = makeCtx(S);
  const same = (v, list) => list.some(x => String(v || '').trim().toLowerCase() === x.toLowerCase());
  if (S.example) add('error', 'example', 'This is the example draft. Start a new draft (or replace every example detail) before sending it to a client.', {label:'New blank draft', act:'newDraft'});
  if (!(S.client || '').trim()) add('error', 'client', 'Add the client’s company name.', {label:'Add name', act:'focus:client'});
  else if (same(S.client, EXAMPLE_VALUES.client)) add('error', 'client-example', 'The company name is still the example (“' + S.client.trim() + '”).', {label:'Edit', act:'focus:client'});
  if (same(S.contact, EXAMPLE_VALUES.contact)) add('error', 'contact-example', 'The contact is still the example (“' + S.contact.trim() + '”).', {label:'Edit', act:'focus:contact'});
  if (S.focus && (S.focus.mods || []).length && Array.isArray(S.courses) && S.courses.length > 1) add('warn', 'focus-multi', 'Curriculum focus only shows on a single-course deck; the pathway slide ignores it.', {label:'Edit', act:'focus:priority'});
  if (same(S.priority, EXAMPLE_VALUES.priority)) add('warn', 'priority-example', 'The client priority is still the example text (“' + S.priority.trim() + '”).', {label:'Edit', act:'focus:priority'});
  // v6: points from the call
  const pains = painsOf(ctx), progP = pains.filter(p => p.kind === 'prog');
  if (pains.some(p => same(p.text, EXAMPLE_VALUES.pain))) add('error', 'pain-example', 'A point from the call is still the example text.', {label:'Edit', act:'focus:pains-wrap'});
  if (S.draftedFrom) add('warn', 'drafted', 'The points and examples were drafted by Claude from your notes. Read each one against what the client said before sending.', {label:'Checked', act:'draftChecked'});
  if (progP.length > 3) add('warn', 'pains-overflow', 'Only three points fit on “Why this matters”, so ' + joinList(progP.slice(3).map(p => 'point ' + (p.i + 1))) + (progP.length > 4 ? ' are' : ' is') + ' left off. Put the three that matter most first, or link the others to another course.', {label:'Edit', act:'focus:pains-wrap'});
  const noSlide = progP.filter(p => p.mod && (S.details === false || !hasLessonSlides(p.course)));
  if (noSlide.length) add('info', 'pain-noslide', joinList(noSlide.map(p => 'Point ' + (p.i + 1))) + ' ' + (noSlide.length > 1 ? 'are' : 'is') + ' answered by a lesson without its own slide, so “Why this matters” names the lesson without a link.');
  const otherOff = pains.filter(p => p.kind === 'other');
  if (otherOff.length && isSlideKeyRemoved(S, 'others')) add('warn', 'pain-others-off', joinList(otherOff.map(p => 'Point ' + (p.i + 1))) + ' ' + (otherOff.length > 1 ? 'lead' : 'leads') + ' the Other courses slide, which is removed, so ' + (otherOff.length > 1 ? 'they do' : 'it does') + ' not show.', {label:'Edit', act:'focus:pains-wrap'});
  if (S.details !== false && S.detailLevel && S.detailLevel !== 'simple'){
    const flat = ctx.courses.filter(c => hasLessonSlides(c) && !MODULE_DETAIL[c.k].some(m => m.learn));
    if (flat.length) add('info', 'level-flat', joinList(flat.map(c => c.short)) + ' lesson slides show the Simple content in PowerPoint too: the lesson materials behind the ' + S.detailLevel + ' level cover Generative AI and Workflow Automation only.');
  }
  if (ctx.multiUen){
    ctx.uens.forEach((u, i) => {
      if (same(u.uen, EXAMPLE_VALUES.uen)) add('error', 'uen-example-' + i, 'Entity ' + (i + 1) + ' still has the example UEN ' + u.uen + '.', {label:'Edit', act:'focus:uen-' + i});
      else if (!u.uen) add('warn', 'uen-missing-' + i, 'Entity ' + (i + 1) + ' (' + u.name + ') has no UEN yet.', {label:'Edit', act:'focus:uen-' + i});
      if (same(u.name, EXAMPLE_VALUES.uenName)) add('error', 'uen-name-example-' + i, 'Entity ' + (i + 1) + ' still has the example name “' + u.name + '”.', {label:'Edit', act:'focus:uen-' + i});
    });
  }
  if (ctx.sfecOn && !ctx.isLegacySfec) add('info', 'sfec-enh-rules', 'SFEC (Enhanced): figures use the fresh S$10,000 per entity (valid to ' + SFEC_NEW_EXPIRY + '). The client must complete the OurWorkforce workforce questionnaire to unlock it, and the SFEC must be applied within ' + SFEC_NEW_CLAIM_DAYS + ' days of the course start.');
  if (ctx.sfecOn && ctx.isLegacySfec && S.sfec === 'known' && !ctx.multiUen && !S.balConfirmed)
    add('warn', 'bal-default', 'The SFEC balance (' + money0(ctx.bal) + ') has not been edited. Confirm it against the client’s Business Grants Portal account.', {label:'Confirm', act:'confirmBal'});
  if (ctx.multiUen && ctx.isLegacySfec && !S.balConfirmed)
    add('warn', 'bal-default-multi', 'Confirm each entity’s SFEC balance against its Business Grants Portal account.', {label:'Confirm', act:'confirmBal'});

  // SFEC scheme against the course dates
  if (ctx.sfecOn){
    const dated = ctx.courses.filter(c => parseISO(c.date));
    const before = dated.filter(c => c.date < SFEC_NEW_START), after = dated.filter(c => c.date >= SFEC_NEW_START);
    const nm = c => 'Course ' + (c.idx + 1) + ' (' + c.short + ', ' + fmtShortDate(c.date) + ')';
    const byCourse = !ctx.isLegacySfec && ctx.legacyCourses && ctx.legacyCourses.length > 0;
    const early = ctx.isLegacySfec ? before : before.filter(c => !c.legacySfec);
    if (byCourse && !early.length && before.length){
      add('info', 'sfec-by-course', joinList(before.map(nm)) + (before.length === 1 ? ' uses' : ' use') + ' the current SFEC (up to 90% of the nett fee before GST, claimed back after the course) and ' + (before.length === 1 ? 'is' : 'are') + ' shown on its own on the funding and calculator slides. The other courses use the redesigned SFEC.');
    } else if (early.length && after.length){
      add('error', 'sfec-straddle', 'The course dates straddle the SFEC change: ' + joinList(before.map(nm)) + ' fall' + (before.length === 1 ? 's' : '') + ' under the current SFEC (claimed back, ends 30 Nov 2026) and ' + joinList(after.map(nm)) + ' under the redesigned SFEC (offset upfront, from 1 Dec 2026). Tick “Current SFEC for this course” (Pathway & delivery options) on the courses before 1 Dec, split the proposal, or move a date.');
    } else if (!ctx.isLegacySfec && early.length){
      add('error', 'sfec-enhanced-early', 'Upfront SFEC starts on 1 Dec 2026, but ' + joinList(early.map(nm)) + ' start' + (early.length === 1 ? 's' : '') + ' earlier. Use the current SFEC (claimed back after the course) or move the date.', {label:'Use current SFEC', act:'sfec:legacy'});
    } else if (ctx.isLegacySfec && after.length){
      add('error', 'sfec-legacy-late', 'The current SFEC ends on 30 Nov 2026, but ' + joinList(after.map(nm)) + ' start' + (after.length === 1 ? 's' : '') + ' later. Switch to the redesigned SFEC (offset upfront).', {label:'Use redesigned SFEC', act:'sfec:enhanced'});
    }
    if (byCourse){
      const late = ctx.legacyCourses.filter(c => parseISO(c.date) && c.date >= SFEC_NEW_START);
      if (late.length) add('error', 'sfec-course-late', joinList(late.map(nm)) + (late.length === 1 ? ' is' : ' are') + ' set to the current SFEC, which ends on 30 Nov 2026, but start' + (late.length === 1 ? 's' : '') + ' later. Untick “Current SFEC for this course” or move the date.');
    }
    if (ctx.isLegacySfec || byCourse){
      (ctx.isLegacySfec ? before : before.filter(c => c.legacySfec)).forEach(c => {
        const d = daysFor(c.hrs).d;
        const endFull = estimateEnd(c.date, d, ctx.weekday), endHalf = estimateEnd(c.date, 2 * d, ctx.weekday);
        if (endFull > SFEC_DEADLINE) add('error', 'sfec-finish-' + c.idx, nm(c) + ' cannot finish by 30 Nov 2026, when the current SFEC closes. Move the date or switch scheme.');
        else if (endHalf > SFEC_DEADLINE) add('warn', 'sfec-finish-' + c.idx, nm(c) + ' only finishes by 30 Nov 2026 if it runs as full days. The training must be completed, and the SFEC claimed, by then.');
        else if (isoAddDays(endFull, 7) > SFEC_DEADLINE) add('warn', 'sfec-tight-' + c.idx, nm(c) + ' ends close to 30 Nov 2026. Leave time to submit the SFEC claim before the scheme closes.');
      });
    }
    if (!dated.length){
      if (ctx.isLegacySfec) add('warn', 'sfec-nodate', 'No training dates yet. The current SFEC only applies to training completed and claimed by 30 Nov 2026.');
      else if (today < SFEC_NEW_START) add('info', 'sfec-nodate', 'No training dates yet. The deck assumes training from 1 Dec 2026, when the redesigned SFEC starts.');
    }
    if (!ctx.isLegacySfec) add('info', 'sfec-provisional', 'Redesigned SFEC figures assume ' + (ctx.sfecRate >= 100 ? 'the full nett course fee (100%, before GST)' : ctx.sfecRate + '% of the nett course fee') + ', as the OurWorkforce training subsidies page describes for SWDA-funded courses. SWDA’s EWTP FAQ says the rate depends on the programme type, so re-check that page before sending (last checked ' + SFEC_RULES_CHECKED + ').');
  }
  // Headcounts, dates, fees
  const unconfirmed = ctx.courses.filter(c => !c.paxConfirmed);
  if (unconfirmed.length) add('warn', 'pax-proposed', 'Headcount shown as “proposed” for ' + joinList(unconfirmed.map(c => 'Course ' + (c.idx + 1) + ' (' + c.pax + ' pax)')) + '. Tick “Headcount confirmed” once the client confirms the numbers.', {label:'Mark all confirmed', act:'confirmPax'});
  ctx.courses.forEach(c => {
    if (c.splitSum != null && c.splitSum !== c.pax) add('warn', 'team-split-' + c.idx, 'Course ' + (c.idx + 1) + ': the team headcounts add up to ' + c.splitSum + ', but Participants says ' + c.pax + '. Every slide, the costs included, uses Participants.', {label:'Edit', act:'focus:team-' + c.idx});
    if (c.priv && c.pax < 8) add('warn', 'pax-small-' + c.idx, 'Course ' + (c.idx + 1) + ' is a private class with ' + paxWord(c.pax) + '; private classes start at eight.');
    if (c.date && parseISO(c.date) && c.date < today) add('warn', 'date-past-' + c.idx, 'Course ' + (c.idx + 1) + ' is dated ' + fmtShortDate(c.date) + ', which has already passed.', {label:'Edit', act:'focus:date-' + c.idx});
    if (c.feeOverride && +c.feeOverride > 0 && C[c.k] && +c.feeOverride !== C[c.k].fee) add('warn', 'fee-edit-' + c.idx, 'Course ' + (c.idx + 1) + ' uses an edited fee (' + money0(+c.feeOverride) + ' instead of ' + money0(C[c.k].fee) + ').');
  });
  if (S.decision && S.decision < today) add('warn', 'decision-past', 'The approval date (' + fmtShortDate(S.decision) + ') has already passed.', {label:'Edit', act:'focus:decision'});
  else if (S.decision && S.date && S.decision < S.date) add('warn', 'decision-before', 'The approval date is before the proposal date.', {label:'Edit', act:'focus:decision'});
  // Training schedule on the Delivery slide
  let schedEstimate = false;
  ctx.courses.forEach(c => {
    if (!c.priv) return;
    const V = schedView(ctx, {k:c.k});
    if (V.sel.c !== c) return;
    if (!V.firstFit) add('warn', 'sched-nofit-' + c.idx, 'Course ' + (c.idx + 1) + ' (' + c.short + ') does not fit the class hours: no split keeps every day within ' + schedHrs(V.o.maxAct) + ' and finishing by ' + schedClock(V.o.end) + '. Change the class hours under Programme & Courses.');
    else if (c.sessionsPref && !V.chosenOk) add('warn', 'sched-pick-' + c.idx, 'Course ' + (c.idx + 1) + ' is set to ' + schedDays(c.sessionsPref) + ', which does not fit the class hours, so the Delivery slide shows ' + schedDays(V.n) + '.');
    else if (!c.sessionsPref && V.n > daysFor(c.hrs).d) add('warn', 'sched-days-' + c.idx, 'At these class hours, Course ' + (c.idx + 1) + ' (' + c.short + ') needs ' + schedDays(V.n) + ' on the Delivery slide, while other slides describe it as ' + daysFor(c.hrs).text + '. A later finish or a longer day (Programme & Courses) can shorten it.');
    if (c.date && SG_HOLIDAYS[c.date]) add('warn', 'sched-ph-' + c.idx, 'Course ' + (c.idx + 1) + ' starts on ' + fmtShortDate(c.date) + ', a public holiday (' + SG_HOLIDAYS[c.date] + ').', {label:'Edit', act:'focus:date-' + c.idx});
    if (!c.asmtOverride) schedEstimate = true;
  });
  if (schedEstimate) add('info', 'sched-asmt', 'Assessment times on the Delivery slide are estimates: 30 minutes of written work, 5 minutes of questioning per participant and a 15-minute buffer. Enter the trainer’s confirmed hours under Edit fee & hours.');
  const ageDays = (parseISO(today) - parseISO(VERIFIED_ISO)) / 86400000;
  if (ageDays > 45) add('warn', 'fees-stale', 'Course fees and hours were last checked on ' + VERIFIED + '. Re-check them on verticalinstitute.com before sending.');
  return out;
}

