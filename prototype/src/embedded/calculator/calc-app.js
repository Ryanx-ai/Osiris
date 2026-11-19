
(() => {
'use strict';

/* A client file or embed sets window.CTC_CONFIG before this script runs; without it, this is your setup page. */
const CFG = window.CTC_CONFIG || null;
const MODE = CFG ? 'client' : 'builder';
const FRAMED = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
/* Embedded: a client copy shown inside another page, such as Google Sites. It stays light to match the host page. */
const EMBEDDED = MODE === 'client' && FRAMED;
const docEl = document.documentElement;
if (MODE === 'client') docEl.classList.add('is-client');
if (EMBEDDED) { docEl.setAttribute('data-theme', 'light'); docEl.classList.add('is-embedded'); }

/* Course fees and hours as listed on verticalinstitute.com on 4 Nov 2026. ap: the hours counted for Absentee Payroll,
   the same figures the Proposal Deck Creator uses. */
const COURSES = [
  {k:'genai', g:'ai', name:'Generative AI Level 1 (Foundational Bootcamp)', fee:1650, hrs:21, ap:21, url:'https://verticalinstitute.com/generative-ai-course/'},
  {k:'content', g:'ai', name:'Generative AI Level 2 (AI for Content Creation)', fee:1300, hrs:13, ap:13, url:'https://verticalinstitute.com/courses/generative-ai-for-content-creation-course/'},
  {k:'wfa', g:'ai', name:'Generative AI Level 3 (Workflow Automation)', fee:1300, hrs:17, ap:17, url:'https://verticalinstitute.com/short-courses/ai-workflow-automation-course/'},
  {k:'da', g:'data', name:'Data Analytics', fee:1950, hrs:21.5, ap:21, url:'https://verticalinstitute.com/data-analytics/'},
  {k:'ada', g:'data', name:'Advanced Data Analytics', fee:2000, hrs:21, ap:21, url:'https://verticalinstitute.com/advanced-data-analytics/'},
  {k:'pbi', g:'data', name:'Data Analytics Using Power BI', fee:1300, hrs:22, ap:22, url:'https://verticalinstitute.com/courses/power-bi-course/'},
  {k:'ds', g:'data', name:'Data Science & AI', fee:1650, hrs:21.5, ap:21, url:'https://verticalinstitute.com/data-science/'},
  {k:'ux', g:'dm', name:'UI/UX Design', fee:1650, hrs:21.5, ap:21, url:'https://verticalinstitute.com/user-experience/'},
  {k:'dm', g:'dm', name:'Digital Marketing', fee:1650, hrs:21.5, ap:21, url:'https://verticalinstitute.com/digital-marketing-course/'},
  {k:'seo', g:'dm', name:'SEO Marketing', fee:1300, hrs:16, ap:16, url:'https://verticalinstitute.com/short-courses/seo-marketing/'},
  {k:'ga4', g:'dm', name:'Mastering Google Analytics 4', fee:1300, hrs:15, ap:15, url:'https://verticalinstitute.com/short-courses/google-analytics-course/'},
  {k:'gyt', g:'dm', name:'Google & YouTube Marketing', fee:1300, hrs:15, ap:15, url:'https://verticalinstitute.com/short-courses/google-youtube-marketing-course/'},
  {k:'ecom', g:'dm', name:'E-commerce and Gig Platforms', fee:600, hrs:8, ap:8, url:'https://verticalinstitute.com/short-courses/ecommerce-and-gig-platform-course/'},
  {k:'cyber', g:'tech', name:'Cybersecurity', fee:1650, hrs:22, ap:22, url:'https://verticalinstitute.com/cybersecurity/'},
  {k:'chain', g:'tech', name:'Blockchain & Cryptocurrency', fee:2000, hrs:21, ap:21, url:'https://verticalinstitute.com/blockchain-course/'},
  {k:'carbon', g:'tech', name:'Carbon Reporting & GHG Measurement', fee:1300, hrs:17, ap:17, url:'https://verticalinstitute.com/short-courses/carbon-reporting-ghg-measurement-course/'},
  {k:'lead', g:'people', name:'Leading with Clarity', fee:1200, hrs:16, ap:16, url:'https://verticalinstitute.com/short-courses/strategy-to-team-results-course/'},
  {k:'people', g:'people', name:'Effective People & Relationship Management', fee:1100, hrs:15, ap:15, url:'https://verticalinstitute.com/short-courses/effective-people-relationship-management-course/'},
  {k:'conflict', g:'people', name:'Managing Conflict in the Workplace', fee:1200, hrs:16, ap:16, url:'https://verticalinstitute.com/short-courses/managing-conflict-in-the-workplace/'},
  {k:'ct', g:'people', name:'Critical Thinking & Problem-Solving', fee:1100, hrs:16, ap:16, url:'https://verticalinstitute.com/short-courses/critical-thinking-and-problem-solving-course/'},
  {k:'pres', g:'people', name:'Effective Presentation and Storytelling', fee:1300, hrs:16, ap:16, url:'https://verticalinstitute.com/short-courses/effective-presentation-storytelling-course/'},
  {k:'crm', g:'people', name:'Manage and Strengthen Customer Relationships', fee:600, hrs:8, ap:8, url:'https://verticalinstitute.com/short-courses/manage-and-strengthen-customer-relationships/'},
  {k:'stress', g:'people', name:'Manage Stress and Build Mental Resilience', fee:600, hrs:8, ap:8, url:'https://verticalinstitute.com/short-courses/manage-stress-build-mental-resilience-course/'},
  {k:'pg', g:'people', name:'Enhance Personal Growth & Increase Productivity', fee:1100, hrs:16, ap:16, url:'https://verticalinstitute.com/short-courses/enhance-personal-growth-increase-productivity/'}
];
/* Microsite: where the proposal edits a course's fee or hours, the calculator uses the same figures */
if (CFG && CFG.catalog && typeof CFG.catalog === 'object') COURSES.forEach(c => { const o = CFG.catalog[c.k]; if (!o) return; ['fee', 'hrs', 'ap'].forEach(f => { const v = Number(o[f]); if (v > 0) c[f] = v; }); });
const GROUPS = [['ai','AI & automation'],['data','Data'],['dm','Design & marketing'],['tech','Governance, risk & compliance'],['people','People & workplace skills']];
/* The course overview: one line on each course and what participants learn, from each course page */
const ABOUT = {
  genai: {d: 'Use generative AI tools to work faster and get reliable results.', o: ['Write structured prompts that give consistent answers', 'Work through complex problems step by step', 'Automate routine reports and tasks', 'Spot misuse and apply safeguards']},
  content: {d: 'Turn content briefs into publication-ready writing with AI, no coding needed.', o: ['Turn a brief into clear prompts and usable drafts', 'Settle the audience, key message and format first', 'Edit AI drafts for accuracy, clarity and tone', 'Deliver content that meets publication requirements']},
  wfa: {d: 'Build AI workflows and agents that take repetitive work off your team.', o: ['Automate repetitive business tasks', 'Connect AI to documents, spreadsheets, email and chat', 'Build agents that find information and complete tasks', 'Keep workflows safe with governance and approvals']},
  da: {d: 'Go from raw data to dashboards with Excel, SQL and Tableau.', o: ['Analyse data in Excel', 'Query databases with SQL', 'Build Tableau dashboards that tell a story', 'Finish a capstone project on business data']},
  ada: {d: 'Deeper Excel, SQL and Tableau skills for data-driven decisions.', o: ['Organise data and spot patterns in Excel', 'Find and combine data with SQL', 'Turn data into clear Tableau charts and dashboards']},
  pbi: {d: 'Analyse and visualise business data in Power BI.', o: ['Structure data for reporting', 'Write DAX calculations', 'Build interactive Power BI reports']},
  ds: {d: 'Python and machine learning for predictive analysis.', o: ['Program in Python with NumPy and Pandas', 'Clean, explore and visualise data', 'Build and evaluate classification models']},
  ux: {d: 'Design user-friendly digital products, from research to prototype.', o: ['Run user research with design thinking', 'Create wireframes and prototypes', 'Test usability and improve designs']},
  dm: {d: 'Plan, run and measure digital marketing campaigns.', o: ['Build a focused digital marketing strategy', 'Create content for social media and search', 'Use campaign data to improve results']},
  seo: {d: 'AI-driven SEO to lift search rankings and organic traffic.', o: ['Align SEO with business goals', 'Learn from what works for competitors', 'Plan, track and refine your SEO']},
  ga4: {d: 'Set up Google Analytics 4 and turn website data into decisions.', o: ['Set up GA4 to collect the right data', 'Analyse channel and campaign performance', 'Build custom reports and dashboards']},
  gyt: {d: 'Plan, launch and manage ads on Google and YouTube.', o: ['Set up campaigns, budgets and keywords', 'Test creatives before they run', 'Analyse results and research competitors']},
  ecom: {d: 'Navigate marketplaces and gig platforms in retail and services.', o: ['Understand Singapore’s retail landscape and rules', 'Compare retail formats and target markets', 'Weigh the key issues behind retail strategy']},
  cyber: {d: 'Practical cybersecurity for everyday work, from scams to cyber risk.', o: ['Cybersecurity fundamentals', 'Detect and prevent scams', 'Manage cyber risk']},
  chain: {d: 'How blockchain, Bitcoin, cryptocurrencies and NFTs work.', o: ['Blockchain fundamentals', 'Bitcoin and other cryptocurrencies', 'NFTs and other blockchain uses']},
  carbon: {d: 'Prepare climate disclosures and measure emissions to recognised standards.', o: ['ESG reporting with GRI, ISSB and TCFD', 'Carbon accounting with GHG protocols', 'Plan reductions with cost-benefit and ROI analysis']},
  lead: {d: 'Turn organisational strategy into team goals and results.', o: ['Set team goals that support company direction', 'Turn goals into team performance', 'Communicate clearly and track results']},
  people: {d: 'Build trust, communicate clearly and engage your team.', o: ['Communicate clearly across roles', 'Build trust and stronger working relationships', 'Manage performance and engage employees']},
  conflict: {d: 'Handle workplace conflict calmly and solve problems at the root.', o: ['Communicate well under pressure', 'Find root causes and practical fixes', 'Spot risks early and plan for them']},
  ct: {d: 'Structured thinking for better workplace decisions.', o: ['Break down problems with proven frameworks', 'Spot faulty logic and weak arguments', 'Use root-cause analysis to decide well']},
  pres: {d: 'Present with confidence and tell stories that win support.', o: ['Tailor your message to the audience', 'Build engaging stories', 'Deliver with a confident voice and body language']},
  crm: {d: 'Keep customers satisfied and coming back.', o: ['Build stronger client relationships', 'Track satisfaction and lift retention', 'Organise records and follow-ups efficiently']},
  stress: {d: 'Plan workplace wellness initiatives that support well-being.', o: ['Communicate wellness programmes', 'Assess how well programmes work', 'Spot trends and roll out initiatives']},
  pg: {d: 'Build better habits and use simple tools to get more done.', o: ['Align habits with goals that matter', 'Plan with the Eisenhower Matrix, Pomodoro and OKRs', 'Track progress and keep improving']}
};
/* SFEC (Enhanced), as the Proposal Deck Creator applies it: from 1 Dec 2026 each company gets a fresh S$10,000 in an online
   wallet, valid to 30 Nov 2029. At enrolment it offsets the fee left after SkillsFuture funding, before GST (100% for
   SWDA-funded courses), for Singapore Citizens and PRs only, until the credit runs out. The company completes the
   workforce questionnaire on the OurWorkforce Portal to unlock it, and it must be applied within 14 days of the course
   start. GST is never covered. */
/* Legacy scheme (set by the microsite's Nov 2026 calculator tab): the same calculator on the current SFEC's mechanics.
   Fees and GST are paid upfront; the current SFEC reimburses 90% of the fee after funding on a claim after the course,
   pass holders included, up to the balance. The scheme's name is swapped wherever the page prints it. */
const LG = !!(window.CTC_CONFIG && window.CTC_CONFIG.scheme === 'legacy');
if (LG) {
  const fix = n => { const t = n.nodeValue; if (t && t.indexOf('SFEC (Enhanced)') >= 0) n.nodeValue = t.replace(/SFEC \(Enhanced\)/g, (m, i) => (/(^|[.:·])\s*$/.test(t.slice(0, i)) ? 'Current SFEC' : 'current SFEC')); };
  const walk = el => { if (el.nodeType === 3) { fix(el); return; } if (el.nodeType !== 1 && el.nodeType !== 11) return; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) fix(n); };
  new MutationObserver(ms => ms.forEach(m => { if (m.type === 'characterData') fix(m.target); else m.addedNodes.forEach(walk); })).observe(document.documentElement, {childList: true, subtree: true, characterData: true});
}
const SFEC = {start: '1 Dec 2026', expiry: LG ? '30 Nov 2026' : '30 Nov 2029', credit: 10000, days: 14, rate: 100};
const FEES_CHECKED = '4 Nov 2026';
const CONTACT = {first: 'Izzat', name: 'Izzat Amin', title: 'Corporate Solutions Consultant, Vertical Institute', phone: '+65 9726 5192', email: 'izzat@verticalinstitute.com'};
/* Microsite: the consultant's details come from the builder */
if (CFG && CFG.contact && typeof CFG.contact === 'object') ['first', 'name', 'title', 'phone', 'email'].forEach(k => { if (typeof CFG.contact[k] === 'string' && CFG.contact[k].trim()) CONTACT[k] = CFG.contact[k].trim(); });
/* Microsite copies carry their fonts with them (the embedded files the deck uses); a copy opened in a new tab keeps them */
const FONTS_WEB = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;0,900;1,400&family=Merriweather:wght@900&display=swap">';
const FONTS = (() => { const st = document.getElementById('vi-font-css'); return st ? '<style id="vi-font-css">' + st.textContent + '</' + 'style>' : FONTS_WEB; })();
const LIBS = {
  h2c: {ready: () => typeof window.html2canvas === 'function', urls: ['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js']},
  pdf: {ready: () => !!(window.jspdf && window.jspdf.jsPDF), urls: ['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js']}
};
const BUILDER_KEY = 'vi-ctc-enhanced-builder-v1';
const CLIENT_KEY = CFG ? 'vi-ctc-enhanced-' + String(CFG.id || 'file') : '';

/* Residency statuses. At 50% funding, Citizens below 40 and PRs share a row at 50% and Citizens aged 40+ have their own
   at 70% (Mid-Career Enhanced Subsidy). At 70% funding every Citizen and PR gets 70%, so the two rows merge into one. */
const RKEYS = ['scpr', 'sc40', 'pass'];
const RES_DEFAULT = ['scpr', 'sc40', 'pass'];
function rateFor(k, tier){ return k === 'pass' ? 0 : k === 'sc40' ? 70 : (tier === 70 ? 70 : 50); }
function resLabel(k, tier){
  if (k === 'scpr') return tier === 70 ? 'Singapore Citizens and PRs' : 'Singapore Citizens below 40, and PRs';
  return k === 'sc40' ? 'Singapore Citizens aged 40 and above' : 'Pass holders (EP, S Pass, Work Permit)';
}
function resCount(k, tier, n){
  const one = n === 1;
  if (k === 'scpr') return n + ' ' + (tier === 70 ? (one ? 'Citizen or PR' : 'Citizens & PRs') : (one ? 'Citizen below 40 or PR' : 'Citizens below 40 & PRs'));
  return n + ' ' + (k === 'sc40' ? (one ? 'Citizen 40+' : 'Citizens 40+') : (one ? 'pass holder' : 'pass holders'));
}
const C = Object.fromEntries(COURSES.map(c => [c.k, c]));
const ALL = COURSES.map(c => c.k);

const NF2 = new Intl.NumberFormat('en-SG', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const NF0 = new Intl.NumberFormat('en-SG', {maximumFractionDigits: 0});
const money = cents => 'S$' + NF2.format(cents / 100);
const money0 = n => 'S$' + NF0.format(n);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const str = v => (typeof v === 'string' ? v : v == null ? '' : String(v));
const $ = id => document.getElementById(id);
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
const joinList = a => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const MINUS = '− ';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function todayISO(){ const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function fmtDate(iso){ const p = String(iso).split('-').map(Number); return p.length === 3 && p[1] ? p[2] + ' ' + MONTHS[p[1] - 1] + ' ' + p[0] : ''; }
const TODAY = todayISO();
const fmtSize = b => (b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');

const SVG_X = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const SVG_CHECK = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SVG_ALERT = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.6"/><path d="M8 4.8v3.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="11.1" r="1" fill="currentColor"/></svg>';
const SVG_REDO = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M12.8 6.2A5 5 0 1 0 13 9.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M13.2 3v3.4H9.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ---------- Funding rules ----------
   50% funding: 50% for Citizens below 40 and PRs; Citizens aged 40+ get 70% (Mid-Career Enhanced Subsidy).
   70% funding: 70% for every Citizen and PR. Pass holders get no course fee funding at either level.
   SFEC (Enhanced): the coverage rate (100% unless changed in setup) of the fee after funding, excluding GST, offset at
   enrolment for Citizens and PRs, drawn from the UEN's credit course by course until it runs out.
   Absentee Payroll: S$4.50 per hour, Citizens and PRs, weekday daytime classes only.
   EIS: 400% deduction at 17% on the fee left after funding and SFEC. GST: 9% of the full fee.
   All money is held in cents. Each UEN has its own S$10,000 credit and funding level. */
const sfecRate = () => { const r = Number(S.setup.sfecRate); return r >= 1 && r <= 100 ? r : SFEC.rate; };
function per(k, res, tier, sfecOn){
  const c = C[k], rate = rateFor(res, tier);
  const fee = Math.round(c.fee * 100);
  const base = rate > 0 ? Math.round(fee * 0.5) : 0;
  const add = rate === 70 ? Math.round(fee * 0.2) : 0;
  const net = fee - base - add;
  const gst = Math.round(fee * 0.09);
  const sfec = LG ? (sfecOn ? Math.round(net * 0.9) : 0) : (sfecOn && rate > 0 ? Math.round(net * sfecRate() / 100) : 0);
  const ap = rate > 0 ? c.ap * 450 : null;
  return {rate, fee, base, add, net, gst, sfec, up: LG ? net + gst : net - sfec + gst, ap, eis: Math.round((net - sfec) * 0.68)};
}

/* ---------- State: every UEN keeps its own course lines and calculation ---------- */
let seq = 0;
const rid = p => p + Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 7);
const qn = v => { const n = Number(v); return Number.isInteger(n) && n > 0 ? Math.min(n, 999) : 0; };
function mk(o){
  o = o || {};
  const course = o.course && C[o.course] ? o.course : '';
  const q = {scpr: '', sc40: '', pass: ''};
  if (course && o.q && typeof o.q === 'object') RKEYS.forEach(k => { const v = qn(o.q[k]); if (v) q[k] = String(v); });
  return {id: 'l' + (++seq), course, type: o.type === 'private' ? 'private' : 'public', time: o.time === 'eve' ? 'eve' : 'day', q};
}
const ELIG = {tbc: 'Eligibility not confirmed', yes: 'Eligible (questionnaire done)', no: 'Not eligible'};
function mkEnt(o){
  o = o || {};
  return {id: typeof o.id === 'string' && /^[\w-]{1,40}$/.test(o.id) ? o.id : rid('e'), name: str(o.name), uen: str(o.uen),
    balance: o.balance == null ? NF2.format(SFEC.credit) : str(o.balance), tier: Number(o.tier) === 70 ? 70 : 50, elig: ELIG[o.elig] ? o.elig : 'tbc'};
}
const S = {
  setup: {client: '', sfecRate: SFEC.rate, entities: [mkEnt()], courses: new Set(ALL), residencies: new Set(RES_DEFAULT), showEIS: true, showGST: true, showReimb: true, showSave: true, includeStart: true},
  ent: {}, active: '', example: false
};
const allowed = k => S.setup.courses.has(k);
const resShown = (k, tier) => k === 'scpr' || (S.setup.residencies.has(k) && !(k === 'sc40' && tier === 70));
const orderedRes = tier => RKEYS.filter(k => resShown(k, tier));
/* Citizens aged 40+ count in the shared row whenever their own row isn't shown */
function lineQ(l, k, tier){
  if (k === 'scpr') return Math.min(999, qn(l.q.scpr) + (resShown('sc40', tier) ? 0 : qn(l.q.sc40)));
  return resShown(k, tier) ? qn(l.q[k]) : 0;
}
const lineTotal = (l, tier) => orderedRes(tier).reduce((a, k) => a + lineQ(l, k, tier), 0);
function foldSc40(st){
  if (!st) return;
  st.lines.forEach(l => { const a = Math.min(999, qn(l.q.scpr) + qn(l.q.sc40)); l.q.scpr = a ? String(a) : ''; l.q.sc40 = ''; });
}
/* Private runs: 10 participants are filled in when a course is switched to private with nobody entered yet; fewer than 8 shows a warning */
const PRIVATE_MIN = 8, PRIVATE_DEFAULT = 10;
const MIN_HTML = SVG_ALERT + '<span>Private runs need at least ' + PRIVATE_MIN + ' participants. For a smaller group, choose Public run.</span>';
function mkEntState(src, drop){
  src = src || {};
  let lines = (Array.isArray(src.lines) ? src.lines : []).map(mk);
  lines = drop ? lines.filter(l => !l.course || allowed(l.course)) : lines.map(l => (l.course && !allowed(l.course) ? mk() : l));
  return {lines: lines.length ? lines : [mk()], calc: null, stale: false, reimbOpen: false};
}
const ES = () => S.setup.entities.find(e => e.id === S.active) || S.setup.entities[0];
const E = () => { const es = ES(); if (!S.ent[es.id]) S.ent[es.id] = mkEntState({}); return S.ent[es.id]; };
const tierNow = () => ES().tier;
const entIndex = id => S.setup.entities.findIndex(e => e.id === id);
const multi = () => S.setup.entities.length > 1;
function entLabel(e){
  const uen = e.uen.trim().toUpperCase(), name = e.name.trim();
  if (name && uen) return name + ' · UEN ' + uen;
  return name || (uen ? 'UEN ' + uen : 'UEN ' + (entIndex(e.id) + 1));
}
const entShort = e => e.name.trim() || (e.uen.trim() ? 'UEN ' + e.uen.trim().toUpperCase() : 'UEN ' + (entIndex(e.id) + 1));
const complete = l => !!(l.course && allowed(l.course) && lineTotal(l, tierNow()) > 0);
const belowMin = l => l.type === 'private' && lineTotal(l, tierNow()) < PRIVATE_MIN;
function applyPrivateDefault(l){ if (l.course && l.type === 'private' && lineTotal(l, tierNow()) === 0) l.q.scpr = String(PRIVATE_DEFAULT); }
const lineById = id => E().lines.find(l => l.id === id);
function parseMoney(s){
  const t = String(s == null ? '' : s).trim().replace(/^s\$/i, '').replace(/[,\s]/g, '');
  if (t === '' || t === '.' || !/^\d*\.?\d*$/.test(t)) return null;
  const v = parseFloat(t);
  if (!isFinite(v) || v < 0) return null;
  return Math.round(v * 100);
}
/* The UEN's SFEC (Enhanced) credit in cents: null when it isn't eligible; blank means the fresh S$10,000 */
function balState(es){
  if (es.elig === 'no') return {on: false, cents: 0, bad: ''};
  const t = es.balance.trim();
  if (!t) return {on: true, cents: SFEC.credit * 100, bad: ''};
  const c = parseMoney(t);
  if (c == null) return {on: true, cents: SFEC.credit * 100, bad: 'Enter an amount, for example 10,000.00.'};
  if (c > SFEC.credit * 100) return {on: true, cents: SFEC.credit * 100, bad: 'SFEC (Enhanced) is ' + money0(SFEC.credit) + ' per company, so the balance can’t be higher.'};
  return {on: true, cents: c, bad: ''};
}
function applySetup(src){
  const st = S.setup;
  src = src || {};
  st.client = str(src.client);
  st.sfecRate = Number(src.sfecRate) >= 1 && Number(src.sfecRate) <= 100 ? Math.round(Number(src.sfecRate)) : SFEC.rate;
  const list = Array.isArray(src.entities) && src.entities.length ? src.entities : [{}];
  const seen = new Set();
  st.entities = list.map(mkEnt).map(e => { while (seen.has(e.id)) e.id = rid('e'); seen.add(e.id); return e; });
  st.courses = new Set(Array.isArray(src.courses) ? src.courses.filter(k => C[k]) : ALL);
  st.residencies = new Set(['scpr'].concat(Array.isArray(src.residencies) ? src.residencies.filter(k => k === 'sc40' || k === 'pass') : RES_DEFAULT));
  st.showEIS = src.showEIS !== false;
  st.showGST = src.showGST !== false;
  st.showReimb = src.showReimb !== false;
  st.showSave = src.showSave !== false;
  st.includeStart = src.includeStart !== false;
}
const pickLine = l => ({course: l.course, type: l.type, time: l.time, q: Object.assign({}, l.q)});
const setupForSave = () => Object.assign({}, S.setup, {entities: S.setup.entities.map(e => Object.assign({}, e)), courses: [...S.setup.courses], residencies: [...S.setup.residencies]});
function exampleBuilder(){
  const ex = window.CTC_EXAMPLE;
  if (!ex) return {v: 1, example: false, setup: {}, ent: {}};
  return {v: 1, example: true, active: 'e1',
    setup: {client: ex.client, entities: [{id: 'e1', name: '', uen: ex.uen, balance: ex.balance, tier: ex.tier, elig: ex.elig}]},
    ent: {e1: {lines: ex.lines, calculated: true}}};
}
const payer = () => ES().name.trim() || S.setup.client.trim() || 'your company';
const poss = s => (s === 'your company' ? 'your company’s' : /s$/i.test(s) ? s + '’' : s + '’s');

/* ---------- Calculation ---------- */
const apOK = (l, rate) => rate > 0 && l.time === 'day';
function computeCalc(st, es){
  const tier = es.tier, on = balState(es).on, lines = [], incomplete = [];
  st.lines.forEach((l, i) => {
    const n = i + 1;
    if (!(l.course && allowed(l.course) && lineTotal(l, tier) > 0)) { if (l.course) incomplete.push(n); return; }
    const subs = orderedRes(tier).filter(k => lineQ(l, k, tier) > 0).map(k => {
      const qty = lineQ(l, k, tier), p = per(l.course, k, tier, on), ap = apOK(l, p.rate);
      return {res: k, qty, p, ap, fee: p.fee * qty, fund: (p.base + p.add) * qty, net: p.net * qty, sfec: p.sfec * qty, gst: p.gst * qty, apAmt: ap ? p.ap * qty : 0};
    });
    const sum = f => subs.reduce((a, s) => a + s[f], 0);
    lines.push({n, course: l.course, priv: l.type === 'private', time: l.time, subs, qty: sum('qty'), fee: sum('fee'), fund: sum('fund'), net: sum('net'), sfec: sum('sfec'), gst: sum('gst'), apAmt: sum('apAmt')});
  });
  if (!lines.length) return null;
  const tsum = f => lines.reduce((a, x) => a + x[f], 0);
  return {tier, on, lines, incomplete, totals: {qty: tsum('qty'), fee: tsum('fee'), fund: tsum('fund'), net: tsum('net'), sfec: tsum('sfec'), gst: tsum('gst'), apAmt: tsum('apAmt')}};
}
/* The credit is drawn in course order until it runs out; it never goes below zero. */
function allocate(calc, bal){
  let left = bal;
  const parts = calc.lines.map(x => {
    const d = Math.max(0, Math.min(x.sfec, left));
    left -= d;
    return {n: x.n, d, claim: x.sfec, capped: d < x.sfec};
  });
  return {parts, remaining: left, drawn: bal - left, over: Math.max(0, calc.totals.sfec - bal)};
}
const lineUp = (x, p) => x.net - (!LG && p ? p.d : 0) + x.gst;
const totalUp = (calc, a) => calc.totals.net - (!LG && a ? a.drawn : 0) + calc.totals.gst;
function eisTotal(calc, a){ return calc.lines.reduce((sum, x) => { const p = a ? a.parts.find(q => q.n === x.n) : null; return sum + Math.round((x.net - (p ? p.d : 0)) * 0.68); }, 0); }
function claims(calc){
  const gst = S.setup.showGST ? calc.totals.gst : 0;
  return {ap: calc.totals.apAmt, gst, total: calc.totals.apAmt + gst};
}
function calculate(opts){
  opts = opts || {};
  const st = E();
  const calc = computeCalc(st, ES());
  if (!calc) return false;
  st.calc = calc; st.stale = false;
  renderGlance(); renderSheet(); renderCalc(); queueSave();
  if (!opts.silent) {
    const b = balState(ES());
    if (b.on) {
      const a = allocate(calc, b.cents);
      announce('Calculated. ' + money(a.drawn) + ' of SFEC (Enhanced) used, ' + money(a.remaining) + ' left. Upfront payment ' + money(totalUp(calc, a)) + '.');
    } else announce('Calculated. Upfront payment ' + money(totalUp(calc, null)) + '.');
    toTop();
  }
  return true;
}
/* After a calculation, bring the top of the calculator back into view so At a glance is the first thing seen */
function toTop(){
  const behavior = reduceMotion.matches ? 'auto' : 'smooth';
  if (MODE !== 'builder') window.scrollTo({top: 0, behavior});
  else root.scrollIntoView({behavior, block: 'start'});
}
function overText(calc, a, bal){
  if (LG) return 'This selection could claim ' + money(calc.totals.sfec) + ' from the current SFEC, which is ' + money(a.over) + ' above the ' + money(bal) + ' balance, so ' + money(a.over) + ' is not reimbursed.';
  return 'This selection’s SFEC (Enhanced) offset adds up to ' + money(calc.totals.sfec) + ', which is ' + money(a.over) + ' above the ' + money(bal) + ' balance. The credit only offsets up to the balance, so ' + esc(payer()) + ' pays the remaining ' + money(a.over) + ' upfront.';
}
function mixText(x, tier){
  return x.subs.map(s => resCount(s.res, tier, s.qty) + ' (' + (s.p.rate ? s.p.rate + '%' : 'no funding') + ')').join(', ');
}
const runText = x => (x.priv ? 'Private run' : 'Public run') + ', ' + (x.time === 'day' ? 'weekday daytime' : 'evenings or weekends');

/* ---------- At a glance: health bar (blue is credit left, red is credit used), upfront total, claims ---------- */
const tips = new Map();
function chip(kind, icon, text){ return '<span class="chip chip-' + kind + '">' + icon + '<span>' + text + '</span></span>'; }
function reconcile(hp, want){
  if (hp.classList.contains('is-empty')) { hp.classList.remove('is-empty'); hp.textContent = ''; }
  const existing = new Map([...hp.children].map(el => [el.dataset.k, el]));
  const keep = new Set(want.map(w => w.key));
  existing.forEach((el, k) => { if (!keep.has(k)) el.remove(); });
  tips.clear();
  want.forEach((w, i) => {
    let el = existing.get(w.key);
    if (!el) { el = document.createElement('div'); el.dataset.k = w.key; el.style.flexGrow = '0'; el.setAttribute('aria-hidden', 'true'); }
    el.className = w.cls;
    el.innerHTML = w.html;
    tips.set(w.key, w.tip);
    if (hp.children[i] !== el) hp.insertBefore(el, hp.children[i] || null);
  });
  void hp.offsetWidth;
  want.forEach(w => { const el = hp.querySelector('[data-k="' + w.key + '"]'); if (el) el.style.flexGrow = String(w.grow); });
}
function renderGlance(){
  const st = E(), es = ES(), hp = $('hp'), calc = st.calc, b = balState(es);
  renderBalField(b);
  const big = $('hp-big'), of = $('hp-of'), chips = $('hp-chips'), legend = $('legend'), foot = $('hp-foot'), key = $('hp-key');
  const stale = !!(calc && st.stale);
  $('glance').classList.toggle('is-stale', stale);
  hp.classList.toggle('is-stale', stale);
  const a = calc && b.on ? allocate(calc, b.cents) : null;
  const upBig = $('up-big'), upSub = $('up-sub');
  if (calc) {
    upBig.textContent = money(totalUp(calc, a)); upBig.classList.remove('is-muted');
    upSub.textContent = plural(calc.totals.qty, 'participant', 'participants') + ', after SkillsFuture funding' + (b.on ? (LG ? ', before the current SFEC is claimed back' : ' and SFEC (Enhanced)') : '') + ', including 9% GST';
  } else {
    upBig.textContent = 'S$0.00'; upBig.classList.add('is-muted');
    upSub.textContent = 'Choose courses and press Calculate';
  }
  renderReimb(calc, a);
  if (!b.on) {
    hp.hidden = true; key.hidden = true; legend.hidden = true; legend.innerHTML = ''; foot.hidden = true; tips.clear();
    $('hp-lab').textContent = 'SFEC (Enhanced)';
    big.textContent = 'Not available'; big.classList.add('is-muted');
    of.textContent = (multi() ? entShort(es) : 'This company') + ' isn’t eligible, so no credit is applied';
    chips.innerHTML = '';
    return;
  }
  hp.hidden = false;
  $('hp-lab').textContent = 'SFEC (Enhanced) left';
  const bal = b.cents;
  if (!bal) {
    hp.className = 'hp is-empty';
    hp.textContent = 'No SFEC (Enhanced) credit left to draw from';
    tips.clear();
    big.textContent = 'S$0.00'; big.classList.add('is-muted');
    of.textContent = 'No credit left';
    chips.innerHTML = '';
    legend.hidden = true; legend.innerHTML = ''; foot.hidden = true; key.hidden = true;
    hp.setAttribute('aria-valuemax', '0'); hp.setAttribute('aria-valuenow', '0'); hp.setAttribute('aria-valuetext', 'No credit left');
    return;
  }
  big.classList.remove('is-muted');
  const scale = v => Math.max(0.0001, v / bal * 1000);
  const want = [];
  if (!calc) {
    want.push({key: 'fill', cls: 'hp-seg hp-fill', grow: 1000, html: '<span class="hp-lab">' + money(bal) + ' available</span>', tip: '<b>' + money(bal) + ' available</b>Choose courses and press Calculate'});
    reconcile(hp, want);
    big.textContent = money(bal); of.textContent = 'available to use';
    chips.innerHTML = es.elig === 'tbc' ? chip('warn', SVG_ALERT, 'Eligibility not confirmed') : chip('plain', '', 'Not calculated yet');
    legend.hidden = true; legend.innerHTML = ''; foot.hidden = true; key.hidden = true;
    hp.setAttribute('aria-valuemax', String(bal / 100)); hp.setAttribute('aria-valuenow', String(bal / 100)); hp.setAttribute('aria-valuetext', money(bal) + ' available');
    return;
  }
  if (a.remaining > 0) want.push({key: 'fill', cls: 'hp-seg hp-fill', grow: scale(a.remaining), html: '<span class="hp-lab">' + money(a.remaining) + ' left</span>', tip: '<b>' + money(a.remaining) + ' left</b>of the ' + money(bal) + ' SFEC (Enhanced) balance'});
  a.parts.forEach(p => {
    if (p.d <= 0) return;
    const x = calc.lines.find(l => l.n === p.n);
    want.push({
      key: 'c' + p.n, cls: 'hp-seg hp-chunk', grow: scale(p.d),
      html: '<span class="num">' + p.n + '</span><span class="hp-amt">' + money(p.d) + (p.capped ? '<sup>1</sup>' : '') + '</span>',
      tip: '<b>' + p.n + '. ' + esc(C[x.course].name) + '</b>' + esc(runText(x)) + '<br>' + esc(mixText(x, calc.tier)) + '<br>' + money(p.d) + ' used' + (p.capped ? ' of ' + money(p.claim) + ' eligible' : '')
    });
  });
  if (!want.length) want.push({key: 'fill', cls: 'hp-seg hp-fill', grow: 1000, html: '<span class="hp-lab">' + money(bal) + ' left</span>', tip: '<b>' + money(bal) + ' left</b>None of these courses draw on the credit'});
  reconcile(hp, want);
  big.textContent = money(a.remaining);
  const pct = Math.round(a.drawn / bal * 1000) / 10;
  of.innerHTML = 'left of ' + money(bal) + (a.over ? '<sup>1</sup>' : '') + ' · <b>' + money(a.drawn) + '</b> used (' + pct + '%)';
  let c = '';
  if (a.remaining === 0) c += chip('ok', SVG_CHECK, 'Fully used');
  else if (a.remaining <= bal * 0.05) c += chip('ok', SVG_CHECK, 'Almost fully used');
  else c += chip('warn', SVG_ALERT, 'Not fully used');
  if (a.over) c += chip('warn', SVG_ALERT, money(a.over) + ' above the balance<sup>1</sup>');
  if (es.elig === 'tbc') c += chip('warn', SVG_ALERT, 'Eligibility not confirmed');
  if (st.stale) c += chip('warn', SVG_REDO, 'Changes not calculated');
  chips.innerHTML = c;
  legend.innerHTML = calc.lines.map(x => {
    const p = a.parts.find(q => q.n === x.n);
    const v = !x.sfec ? '<small>No SFEC</small>' : p.capped ? money(p.d) + ' <small>of ' + money(p.claim) + '</small><sup>1</sup>' : money(p.claim);
    return '<li><span class="num">' + x.n + '</span><span class="lg-t"><b>' + esc(C[x.course].name) + '</b> · ' + plural(x.qty, 'participant', 'participants') + '</span><span class="lg-v">' + v + '</span></li>';
  }).join('');
  legend.hidden = false; key.hidden = false;
  if (a.over) { foot.innerHTML = '<sup>1</sup> ' + overText(calc, a, bal); foot.hidden = false; }
  else foot.hidden = true;
  hp.setAttribute('aria-valuemax', String(bal / 100)); hp.setAttribute('aria-valuenow', String(a.remaining / 100));
  hp.setAttribute('aria-valuetext', money(a.remaining) + ' left of ' + money(bal));
}
/* The balance field: the client can lower their own credit if some of it is already used */
function renderBalField(b){
  const inp = $('bal-in'); if (!inp) return;
  const es = ES();
  b = b || balState(es);
  $('bal-f').hidden = !b.on;
  const ns = $('no-sfec');
  ns.hidden = b.on;
  ns.textContent = b.on ? '' : 'SFEC (Enhanced) isn’t available for ' + (multi() ? entShort(es) : 'this company') + ', so the figures show the fee after SkillsFuture funding, plus GST.';
  if (!b.on) return;
  if (document.activeElement !== inp) inp.value = es.balance;
  inp.setAttribute('aria-invalid', String(!!b.bad));
  $('bal-lab').textContent = multi() ? 'SFEC (Enhanced) balance · ' + entShort(es) : 'Your SFEC (Enhanced) balance';
  const help = $('bal-help');
  help.classList.toggle('is-error', !!b.bad);
  help.textContent = b.bad || (LG ? 'What is left of your current SFEC. It can only be used for training completed by 30 Nov 2026.' : MODE === 'builder'
    ? 'Starts at the fresh ' + money0(SFEC.credit) + '. Your client can lower it if they have used some.'
    : 'A fresh ' + money0(SFEC.credit) + ' per company from ' + SFEC.start + '. Lower it only if you’ve already used some.');
}
function balChanged(){
  renderGlance(); if (E().calc) renderSheet(); renderEntityBar();
  if (MODE === 'builder') { const f = $('eb-' + ES().id); if (f && document.activeElement !== f) f.value = ES().balance; if (onBalChange) onBalChange(); }
  queueSave();
}
let onBalChange = null;
function renderReimb(calc, a){
  const st = E(), box = $('reimb');
  const show = S.setup.showReimb && !!calc;
  box.hidden = !show;
  if (!show) return;
  const open = st.reimbOpen;
  $('reimb-btn').setAttribute('aria-expanded', String(open));
  $('reimb-btn-text').textContent = open ? 'Hide claims after the course' : 'Show claims after the course';
  $('reimb-body').hidden = !open;
  const r = claims(calc), parts = [];
  if (LG && a && a.drawn) parts.push('<li>Current SFEC reimbursed <b>up to ' + money(a.drawn) + '</b></li>');
  if (r.ap) parts.push('<li>Absentee Payroll <b>up to ' + money(r.ap) + '</b></li>');
  if (r.gst) parts.push('<li>GST claimable <b>up to ' + money(r.gst) + '</b></li>');
  if (S.setup.showEIS) { const e = eisTotal(calc, a); if (e) parts.push('<li>EIS tax saving <b>up to ' + money(e) + '</b></li>'); }
  if (!parts.length) parts.push('<li>No claims after the course for this selection</li>');
  $('reimb-val').textContent = 'Up to ' + money(r.total + (LG && a ? a.drawn : 0));
  $('reimb-parts').innerHTML = parts.join('');
  $('reimb-note').textContent = (balState(ES()).on ? (LG ? 'The current SFEC is claimed back after the course, so it is not taken off the upfront payment. ' : 'SFEC (Enhanced) is already taken off the upfront payment. ') : '')
    + (S.setup.showEIS ? 'The total leaves out EIS, which comes through the tax return. ' : '')
    + 'Claimed after the course and subject to eligibility.';
}

/* ---------- Header, UEN picker, funding panel, footer, help ---------- */
function renderHead(){
  const client = S.setup.client.trim();
  $('app-eyebrow').textContent = 'Vertical Institute' + (client ? ' · Prepared for ' + client : '');
  const made = CFG && CFG.created ? fmtDate(CFG.created) : fmtDate(TODAY);
  $('app-foot').innerHTML = '<p><b>' + esc(CONTACT.name) + '</b>, ' + esc(CONTACT.title) + ' · ' + esc(CONTACT.phone) + ' · ' + esc(CONTACT.email) + '</p>'
    + '<p>Prepared on ' + esc(made) + '. Figures are indicative and subject to eligibility and SWDA’s approval. Course fees as listed on verticalinstitute.com on ' + FEES_CHECKED + '.</p>';
  if (MODE === 'builder') $('preview-name').textContent = client || 'your client';
}
function renderEntityBar(){
  const box = $('ent-pick');
  box.hidden = !multi();
  syncToolbar();
  if (!multi()) return;
  $('ent-sel').innerHTML = S.setup.entities.map(e => {
    const st = S.ent[e.id], n = st ? st.lines.filter(l => l.course).length : 0;
    return '<option value="' + esc(e.id) + '"' + (e.id === S.active ? ' selected' : '') + '>' + esc(entLabel(e) + (n ? ' · ' + plural(n, 'course', 'courses') : '')) + '</option>';
  }).join('');
  const es = ES(), b = balState(es);
  $('ent-meta').innerHTML = (b.on ? '<b>' + money(b.cents) + '</b> SFEC (Enhanced) · ' : 'No SFEC (Enhanced) · ') + '<b>' + es.tier + '%</b> course fee funding. Each UEN has its own credit and keeps its own courses.';
}
function renderTier(){
  const es = ES(), t = es.tier, uen = es.uen.trim().toUpperCase(), name = es.name.trim();
  $('uen-line').hidden = !uen && !name;
  $('ent-name').hidden = !name; $('ent-name').textContent = name;
  $('uen-val').parentElement.hidden = !uen; $('uen-val').textContent = uen;
  $('tier-pct').textContent = t + '%';
  $('rates').innerHTML = orderedRes(t).map(k => {
    const rate = rateFor(k, t);
    return '<li><span>' + esc(resLabel(k, t)) + '</span><span class="rate r' + rate + '">' + (rate ? rate + '%' : 'None') + '</span></li>';
  }).join('');
  const tn = [];
  if (t === 70) tn.push('Every Singapore Citizen and PR receives 70%, whatever their age.');
  else if (resShown('sc40', t)) tn.push('Citizens aged 40 and above receive 70% under the Mid-Career Enhanced Subsidy.');
  if (resShown('pass', t)) tn.push('Pass holders don’t receive course fee funding' + (LG ? ' or Absentee Payroll, but the current SFEC still covers them.' : ', SFEC (Enhanced) or Absentee Payroll.'));
  $('tier-note').textContent = tn.join(' ');
  $('tier-note').hidden = !tn.length;
  const b = balState(es), rate = sfecRate();
  $('sfec-chip').innerHTML = es.elig === 'yes' ? chip('ok', SVG_CHECK, 'Eligible') : es.elig === 'tbc' ? chip('warn', SVG_ALERT, 'Eligibility not confirmed') : chip('plain', '', 'Not eligible');
  $('sfec-facts').innerHTML = b.on
    ? (LG ? ['For training completed by 30 Nov 2026', 'Reimburses 90% of the fee after funding, before GST, on a claim after the course', 'Covers Singapore Citizens, PRs and pass holders; GST is not covered', 'Any balance left lapses after 30 Nov 2026'] : ['A fresh ' + money0(SFEC.credit) + ' per company from ' + SFEC.start + ', valid to ' + SFEC.expiry,
       'Offsets ' + (rate >= 100 ? 'the full fee' : rate + '% of the fee') + ' after funding, before GST, at enrolment',
       'For Singapore Citizens and PRs; GST isn’t covered',
       'Applied within ' + SFEC.days + ' days of each course’s start']).map(x => '<li>' + esc(x) + '</li>').join('')
    : '<li>' + esc('No credit is applied for ' + (multi() ? entShort(es) : 'this company') + '.') + '</li>';
  $('sfec-note').textContent = es.elig === 'tbc' ? 'To unlock the credit, complete the workforce questionnaire on the OurWorkforce Portal.' : es.elig === 'yes' ? 'Workforce questionnaire done.' : '';
  $('sfec-note').hidden = LG || es.elig === 'no';
}
const stepsHTML = list => '<ol class="steps">' + list.map((s, i) => '<li class="step"><span class="step-n" aria-hidden="true">' + (i + 1) + '</span><h3>' + s[0] + '</h3><p>' + s[1] + '</p></li>').join('') + '</ol>';
function renderHowto(){
  const box = $('howto-body');
  if (!box) return;
  const t = tierNow(), steps = [];
  if (multi()) steps.push(['Choose the UEN', 'Pick the company you’re planning for under <b>Planning for</b>. Each UEN has its own SFEC (Enhanced) credit and funding, and keeps its own courses.']);
  steps.push(LG ? ['Check your current SFEC balance', 'Enter what is left of your current SFEC. It can only be used for training completed by 30 Nov 2026.'] : ['Check your SFEC (Enhanced) balance', 'It starts at a fresh <b>' + money0(SFEC.credit) + '</b> per company from ' + SFEC.start + '. Lower it only if you’ve already used some of the new credit.']);
  steps.push(['Add each course', 'Choose <b>Public run</b> to join a scheduled class, or <b>Private run</b> for a class just for your team (at least ' + PRIVATE_MIN + ' participants). Then choose when the classes run: weekday daytime classes also qualify for Absentee Payroll.']);
  steps.push(['Enter who’s attending', t === 70
    ? 'Enter how many participants of each residency status will attend. Every Singapore Citizen and PR gets 70% funding, so they’re counted together.'
    : 'Enter how many participants of each residency status will attend. Citizens aged 40 and above are counted separately because they get 70% funding.']);
  steps.push(['Press Calculate', '<b>At a glance</b> shows how much of the credit your courses use and what you pay upfront. <b>Funding &amp; investment</b> below breaks it down by course and by participant.']);
  steps.push(['Keep your plan', 'Press <b>Save or load plan</b> to copy a plan code. Paste it back in later to pick up where you left off, even on another device.']);
  const terms = [LG ? ['Current SFEC', 'The SkillsFuture Enterprise Credit until 30 Nov 2026. It reimburses 90% of the fee after funding, on a claim after the course, pass holders included.'] : ['SFEC (Enhanced)', 'The SkillsFuture Enterprise Credit from ' + SFEC.start + ': ' + money0(SFEC.credit) + ' per company, taken off the fee at enrolment. Unlock it by completing the workforce questionnaire on the OurWorkforce Portal.'],
    ['SkillsFuture funding', 'Course fee funding of 50% or 70%, depending on the company and the participant.'],
    ['Absentee Payroll', 'S$4.50 per training hour for Singapore Citizens and PRs on weekday daytime classes, claimed after the course.']];
  if (S.setup.showEIS) terms.push(['Enterprise Innovation Scheme (EIS)', 'A 400% tax deduction on qualifying training costs the company pays, shown as the tax saved at 17%.']);
  if (S.setup.showGST) terms.push(['GST claimable', 'GST-registered companies claim back the 9% GST as input tax.']);
  box.innerHTML = '<div>' + stepsHTML(steps) + '</div><div><dl class="terms">' + terms.map(x => '<div><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd></div>').join('') + '</dl>'
    + '<p class="contact"><b>Questions? ' + esc(CONTACT.name) + '</b><span>' + esc(CONTACT.phone) + '</span><span>' + esc(CONTACT.email) + '</span></p></div>';
}

/* ---------- Course lines ---------- */
function courseOptions(sel){
  return GROUPS.map(([g, label]) => {
    const list = COURSES.filter(x => x.g === g && allowed(x.k));
    if (!list.length) return '';
    return '<optgroup label="' + esc(label) + '">' + list.map(x => '<option value="' + x.k + '"' + (x.k === sel ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</optgroup>';
  }).join('');
}
const totalText = l => { const n = lineTotal(l, tierNow()); return n ? plural(n, 'participant', 'participants') : 'None yet'; };
function lineHTML(l, i, revealed){
  const n = i + 1, c = C[l.course], many = E().lines.length > 1, tier = tierNow();
  const anim = id => (revealed && revealed.has(id) ? ' reveal' : '');
  let a = '<label class="f" for="course-' + l.id + '"><span>Course</span><select id="course-' + l.id + '" data-f="course"><option value=""' + (l.course ? '' : ' selected') + '>Choose a course</option>' + courseOptions(l.course) + '</select></label>';
  let b = '';
  if (c) {
    a += '<p class="line-about">' + esc((ABOUT[c.k] || {}).d || '') + ' <button type="button" class="link-btn inline" data-act="about">What it covers</button></p>'
      + '<p class="line-meta">' + money0(c.fee) + ' per participant, before GST · ' + c.hrs + ' hours · <a href="' + c.url + '" target="_blank" rel="noopener">Course page and run dates</a></p>'
      + '<span class="opt-lab" id="tl-' + l.id + '">How it runs</span>'
      + '<div class="seg-sm' + anim('opts-' + l.id) + '" role="group" aria-labelledby="tl-' + l.id + '">'
      + '<button type="button" id="pub-' + l.id + '" data-act="type" data-v="public" aria-pressed="' + (l.type === 'public') + '">Public run</button>'
      + '<button type="button" id="pri-' + l.id + '" data-act="type" data-v="private" aria-pressed="' + (l.type === 'private') + '">Private run</button></div>'
      + '<p class="line-note">' + (l.type === 'public' ? 'Your participants join a scheduled class. The course page lists the run dates.' : 'A class just for your team, at least ' + PRIVATE_MIN + ' participants. Dates and venue are arranged with Vertical Institute.') + '</p>'
      + '<span class="opt-lab" id="ml-' + l.id + '">When the classes run</span>'
      + '<div class="seg-sm' + anim('opts-' + l.id) + '" role="group" aria-labelledby="ml-' + l.id + '">'
      + '<button type="button" id="day-' + l.id + '" data-act="time" data-v="day" aria-pressed="' + (l.time === 'day') + '">Weekday daytime</button>'
      + '<button type="button" id="eve-' + l.id + '" data-act="time" data-v="eve" aria-pressed="' + (l.time === 'eve') + '">Evenings or weekends</button></div>'
      + '<p class="line-note">' + (l.time === 'day' ? '<span class="ok">Absentee Payroll claimable</span> for Singapore Citizens and PRs' : '<span class="no">Absentee Payroll not claimable</span> for evening or weekend classes') + '</p>';
    b = '<div class="pax' + anim('pax-' + l.id) + '" role="group" aria-labelledby="paxh-' + l.id + '">'
      + '<div class="pax-head"><span id="paxh-' + l.id + '">Participants by residency status</span><span class="pax-total" id="tot-' + l.id + '">' + totalText(l) + '</span></div>'
      + orderedRes(tier).map(k => {
        const rate = rateFor(k, tier), v = lineQ(l, k, tier), zero = !v, lab = esc(resLabel(k, tier));
        return '<div class="pax-row' + (zero ? ' is-zero' : '') + '" data-res="' + k + '">'
          + '<label for="q-' + k + '-' + l.id + '">' + lab + '</label>'
          + '<span class="rate r' + rate + '">' + (rate ? rate + '%' : 'None') + '</span>'
          + '<span class="stepper"><button type="button" data-act="dec" data-res="' + k + '" aria-label="One fewer: ' + lab + '"' + (zero ? ' disabled' : '') + '>−</button>'
          + '<input type="number" id="q-' + k + '-' + l.id + '" data-f="q" data-res="' + k + '" inputmode="numeric" min="0" max="999" step="1" placeholder="0" value="' + (v || '') + '">'
          + '<button type="button" data-act="inc" data-res="' + k + '" aria-label="One more: ' + lab + '">+</button></span></div>';
      }).join('')
      + (l.type === 'private' ? '<p class="pax-min" id="min-' + l.id + '" aria-live="polite" data-on="' + belowMin(l) + '">' + (belowMin(l) ? MIN_HTML : '') + '</p>' : '')
      + '</div>';
  }
  return '<div class="line" data-id="' + l.id + '" id="line-' + l.id + '">'
    + '<div class="line-head"><span class="line-num"><span class="num">' + n + '</span>Course ' + n + '</span>'
    + '<button type="button" class="icon-btn" data-act="remove" aria-label="' + (many ? 'Remove' : 'Clear') + ' course ' + n + '" title="' + (many ? 'Remove' : 'Clear') + '">' + SVG_X + '</button></div>'
    + '<div class="line-body"><div class="line-a">' + a + '</div>' + (b ? '<div class="line-b">' + b + '</div>' : '') + '</div></div>';
}
function renderLines(focusId, revealed){
  $('lines').innerHTML = E().lines.map((l, i) => lineHTML(l, i, revealed)).join('');
  renderOverview();
  if (focusId) { const el = $(focusId); if (el) el.focus(); }
}
function syncPaxRow(line, res){
  const box = document.querySelector('#lines .line[data-id="' + line.id + '"]'); if (!box) return;
  const row = box.querySelector('.pax-row[data-res="' + res + '"]');
  const zero = !lineQ(line, res, tierNow());
  if (row) { row.classList.toggle('is-zero', zero); const dec = row.querySelector('[data-act="dec"]'); if (dec) dec.disabled = zero; }
  const tot = $('tot-' + line.id); if (tot) tot.textContent = totalText(line);
  const mn = $('min-' + line.id);
  if (mn) { const on = String(belowMin(line)); if (mn.dataset.on !== on) { mn.dataset.on = on; mn.innerHTML = on === 'true' ? MIN_HTML : ''; } }
}
function renderCalc(){
  const st = E();
  $('calc-row').hidden = !st.lines.some(complete);
  const stale = !!(st.calc && st.stale);
  $('calc').textContent = stale ? 'Recalculate' : 'Calculate';
  $('stale-note').hidden = !stale;
}

/* ---------- The sheet ---------- */
function groupLabel(set, tier){
  if (set.has('pass')) return 'Pass holders (EP, S Pass, Work Permit)';
  if (tier === 70) return 'Singapore Citizens and PRs';
  if (set.has('scpr') && set.has('sc40')) return 'Singapore Citizens and PRs';
  return set.has('sc40') ? 'Singapore Citizens aged 40 and above' : 'Singapore Citizens below 40, and PRs';
}
function groupSub(rate, tier){
  if (rate === 0) return 'No SkillsFuture funding';
  if (rate === 50) return '50% baseline funding';
  return tier === 70 ? '70% course fee funding' : '70% with the additional 20%';
}
function summaryHTML(calc, a, bal){
  const on = calc.on;
  const rows = calc.lines.map(x => {
    const p = a ? a.parts.find(q => q.n === x.n) : null;
    const sfecSub = x.subs.filter(s => s.p.sfec > 0).map(s => s.qty + ' × ' + money(s.p.sfec)).join(' + ');
    const sfecCell = !on ? '' : p && p.capped
      ? '<td>' + (LG ? '' : MINUS) + money(p.d) + '<sup>1</sup><small>of ' + money(x.sfec) + '</small></td>'
      : '<td>' + (x.sfec ? (LG ? '' : MINUS) + money(x.sfec) : money(0)) + '<small>' + (sfecSub || 'Not eligible') + '</small></td>';
    return '<tr>'
      + '<td class="c-n"><span class="num">' + x.n + '</span></td>'
      + '<th scope="row" class="c-name">' + esc(C[x.course].name) + '<small>' + esc(runText(x)) + ' · ' + esc(mixText(x, calc.tier)) + '</small></th>'
      + '<td>' + x.qty + '</td>'
      + '<td class="c-fee">' + money(x.fee) + '</td>'
      + '<td>' + (x.fund ? MINUS + money(x.fund) : money(0)) + '</td>'
      + (LG ? '' : sfecCell)
      + '<td>+ ' + money(x.gst) + '</td>'
      + '<td class="c-up">' + money(lineUp(x, p)) + (!LG && p && p.capped ? '<sup>1</sup>' : '') + '</td>' + (LG ? sfecCell : '')
      + '</tr>';
  }).join('');
  const t = calc.totals, span = on ? 6 : 5;
  const totSfec = !on ? '' : '<td>' + (LG ? '' : MINUS) + money(a.drawn) + (a.over ? '<sup>1</sup>' : '') + '</td>';
  const left = on ? '<tr class="left"><td></td><th scope="row" class="c-name" colspan="' + span + '">SFEC (Enhanced) left from the ' + money(bal) + ' balance</th><td>' + money(a.remaining) + (a.over ? '<sup>1</sup>' : '') + '</td></tr>' : '';
  return '<p class="sec-label">This selection</p>'
    + '<div class="tbl-wrap" tabindex="0" role="region" aria-label="Summary of this selection"><table class="sum"' + (on ? '' : ' style="min-width:700px"') + '>'
    + '<thead><tr><th scope="col" class="c-n"><span class="sr-only">Line</span></th><th scope="col" class="c-name">Course and participants</th><th scope="col">Pax</th>'
    + '<th scope="col">Course fee<small>before GST</small></th><th scope="col">Funding<small>SkillsFuture</small></th>'
    + (on && !LG ? '<th scope="col">SFEC (Enhanced)<small>offset at enrolment</small></th>' : '')
    + '<th scope="col">GST<small>9% of the fee</small></th><th scope="col">Upfront<small>what you pay</small></th>' + (on && LG ? '<th scope="col">Current SFEC<small>reimbursed after the course</small></th>' : '') + '</tr></thead>'
    + '<tbody>' + rows
    + '<tr class="tot"><td></td><th scope="row" class="c-name">Total</th><td>' + t.qty + '</td><td class="c-fee">' + money(t.fee) + '</td><td>' + MINUS + money(t.fund) + '</td>' + (LG ? '' : totSfec) + '<td>+ ' + money(t.gst) + '</td><td class="c-up">' + money(totalUp(calc, a)) + (!LG && a && a.over ? '<sup>1</sup>' : '') + '</td>' + (LG ? totSfec : '') + '</tr>'
    + left + '</tbody></table></div>';
}
function feeTableHTML(k, xs, tier, on){
  const c = C[k], who = payer();
  const g = new Map();
  xs.forEach(x => {
    const noAP = x.p.rate > 0 && !x.ap;
    const key = x.p.rate + (noAP ? 'n' : '');
    if (!g.has(key)) g.set(key, {rate: x.p.rate, noAP, res: new Set(), idx: 99, p: x.p});
    const e = g.get(key);
    e.res.add(x.res); e.idx = Math.min(e.idx, RKEYS.indexOf(x.res) + (noAP ? 0.5 : 0));
  });
  const cols = [...g.values()].sort((a, b) => a.idx - b.idx);
  const span = cols.length + 1;
  const cells = fn => cols.map(fn).join('');
  const td = (v, cls) => '<td' + (cls ? ' class="' + cls + '"' : '') + '>' + v + '</td>';
  const row = (cls, label, sub, html) => '<tr' + (cls ? ' class="' + cls + '"' : '') + '><th scope="row">' + label + (sub ? '<small>' + sub + '</small>' : '') + '</th>' + html + '</tr>';
  const anyAdd = cols.some(e => e.p.add > 0);
  const addLabel = tier === 70 ? ['Additional funding', 'a further 20% of the course fee'] : ['Additional funding for Citizens aged 40 and above', 'a further 20% (Mid-Career Enhanced Subsidy)'];
  const rate = sfecRate();
  return '<div class="tbl-wrap" tabindex="0" role="region" aria-label="Fees for ' + esc(c.name) + ', per participant">'
    + '<table class="ft" style="min-width:' + (300 + cols.length * 165) + 'px">'
    + '<thead><tr><th scope="col" class="corner"><span class="eyb">Fees for</span><span class="cname">' + esc(c.name) + '</span><span class="cfee">' + money0(c.fee) + ' per participant, before GST</span></th>'
    + cells(e => '<th scope="col" class="gcol r' + e.rate + '">' + groupLabel(e.res, tier) + '<small>' + groupSub(e.rate, tier) + (e.noAP ? '<br>evening or weekend classes' : '') + '</small></th>')
    + '</tr></thead><tbody>'
    + '<tr class="sec"><th colspan="' + span + '" scope="colgroup">What ' + esc(who) + ' pays upfront, per participant</th></tr>'
    + row('fee-row', 'Course fee', esc(c.name) + ', before GST', cells(e => td(money(e.p.fee))))
    + row('', 'Baseline SkillsFuture funding', '50% of the course fee', cells(e => (e.rate ? td(MINUS + money(e.p.base)) : td('Not eligible', 'ne'))))
    + (anyAdd ? row('', addLabel[0], addLabel[1], cells(e => (e.p.add ? td(MINUS + money(e.p.add)) : (e.rate ? td('–', 'na') : td('Not eligible', 'ne'))))) : '')
    + (on && !LG ? row('', 'SFEC (Enhanced)', (rate >= 100 ? 'the full fee' : rate + '% of the fee') + ' after funding, before GST, from ' + esc(poss(who)) + ' credit', cells(e => (e.rate ? td(MINUS + money(e.p.sfec)) : td('Not eligible', 'ne')))) : '')
    + row('', 'GST', '9%, charged on the full course fee', cells(e => td('+ ' + money(e.p.gst))))
    + row('up-row', 'Upfront payment', on && !LG ? 'while the credit lasts' : '', cells(e => td(money(e.p.up))))
    + '<tr class="sec"><th colspan="' + span + '" scope="colgroup">Support claimable after the course*</th></tr>'
    + (on && LG ? row('', 'Current SFEC', '90% of the fee after funding, before GST, reimbursed on a claim while the balance lasts', cells(e => td('up to ' + money(e.p.sfec)))) : '')
    + row('', 'Absentee Payroll', 'S$4.50 per hour attended, ' + c.ap + ' hours, weekday daytime classes', cells(e => (e.rate === 0 ? td('Not eligible', 'ne') : e.noAP ? td('Weekday daytime only', 'ne') : td('up to ' + money(e.p.ap)))))
    + (S.setup.showEIS ? row('', 'Enterprise Innovation Scheme (EIS)', 'tax saved from a 400% deduction on the fee left after funding' + (on ? ' and SFEC' : '') + ', at 17%', cells(e => (e.p.eis ? td('up to ' + money(e.p.eis)) : td('–', 'na')))) : '')
    + (S.setup.showGST ? row('', 'GST claimable', 'the 9% GST paid, claimed back as input tax', cells(e => td('up to ' + money(e.p.gst)))) : '')
    + '</tbody></table></div>';
}
function notesHTML(calc, a, bal){
  const on = calc.on, rate = sfecRate(), client = payer();
  const hasPass = calc.lines.some(x => x.subs.some(s => s.res === 'pass'));
  let star = '* Claimable after the course, subject to eligibility. Absentee Payroll covers Singapore Citizens and PRs on weekday daytime classes.';
  if (S.setup.showGST) star += ' GST is claimable by GST-registered companies.';
  if (S.setup.showEIS) star += ' EIS depends on the company’s tax position' + (on ? ', and shows a dash where SFEC (Enhanced) covers the whole fee after funding' : '') + '.';
  let s = '<div class="notes-block">'
    + '<p class="notes">Course fee is before GST. ' + (on && LG ? 'The current SFEC reimburses 90% of the fee left after SkillsFuture funding, before GST, on a claim after the course, up to the balance left. ' : on ? 'SFEC (Enhanced) offsets ' + (rate >= 100 ? 'the full fee' : rate + '% of the fee') + ' left after SkillsFuture funding, before GST, at enrolment, up to the credit left. ' : '') + 'GST of 9% is charged on the full course fee' + (on ? ' and isn’t covered by SFEC' : '') + '.</p>'
    + '<p class="notes">' + star + '</p>';
  if (on && LG) s += '<p class="notes">The current SFEC covers training completed by 30 November 2026. Any balance left lapses after that date.</p>';
  else if (on) s += '<p class="notes">SFEC (Enhanced) applies to courses starting from ' + SFEC.start + '. It is a fresh ' + money0(SFEC.credit) + ' per company, valid to ' + SFEC.expiry + ': ' + esc(client === 'your company' ? 'your company completes' : client + ' completes') + ' the workforce questionnaire on the OurWorkforce Portal to unlock it, and it must be applied within ' + SFEC.days + ' days of each course’s start.</p>';
  if (hasPass) s += '<p class="notes">Pass holders (EP, S Pass and Work Permit holders) aren’t eligible for SkillsFuture funding' + (LG ? ' or Absentee Payroll. The current SFEC still reimburses 90% of their fee.' : ', SFEC (Enhanced) or Absentee Payroll.') + '</p>';
  if (a && a.over) s += '<p class="notes"><sup>1</sup> ' + overText(calc, a, bal) + '</p>';
  if (calc.incomplete.length) {
    const list = calc.incomplete.map(String), names = joinList(list);
    s += '<p class="notes">' + (list.length === 1 ? 'Course ' + names + ' has no participants yet, so it isn’t included.' : 'Courses ' + names + ' have no participants yet, so they aren’t included.') + '</p>';
  }
  return s + '<p class="notes">Course fees as listed on verticalinstitute.com on ' + FEES_CHECKED + '. Figures are indicative and subject to SWDA’s approval.</p></div>';
}
function minWarnHTML(calc){
  const small = calc.lines.filter(x => x.priv && x.qty < PRIVATE_MIN);
  if (!small.length) return '';
  const text = small.length === 1
    ? 'Course ' + small[0].n + ' is a private run for ' + plural(small[0].qty, 'participant', 'participants') + '. Private runs need at least ' + PRIVATE_MIN + ' participants.'
    : 'Courses ' + joinList(small.map(x => String(x.n))) + ' are private runs with fewer than ' + PRIVATE_MIN + ' participants. Private runs need at least ' + PRIVATE_MIN + ' participants.';
  return '<p class="sheet-warn">' + SVG_ALERT + '<span>' + text + '</span></p>';
}
function renderSheet(){
  const st = E(), sheet = $('sheet'), body = $('sheet-body'), meta = $('sheet-meta'), calc = st.calc;
  const stale = !!(calc && st.stale);
  sheet.classList.toggle('is-stale', stale);
  $('sheet-stale').hidden = !stale;
  if (!calc) {
    meta.textContent = '';
    body.innerHTML = '<div class="sheet-empty"><b>Your funding and investment breakdown appears here.</b><p>Add a course, choose how and when it runs and enter the participants, then press Calculate.</p></div>';
    return;
  }
  const es = ES(), b = balState(es), client = S.setup.client.trim();
  const a = calc.on ? allocate(calc, b.cents) : null;
  meta.textContent = [client, multi() ? entShort(es) : '', calc.on ? money(b.cents) + ' SFEC (Enhanced)' : 'No SFEC (Enhanced)', calc.tier + '% baseline funding', plural(calc.totals.qty, 'participant', 'participants')].filter(Boolean).join(' · ');
  const order = [], by = {};
  calc.lines.forEach(x => { if (!by[x.course]) { by[x.course] = []; order.push(x.course); } by[x.course].push(...x.subs); });
  body.innerHTML = summaryHTML(calc, a, b.cents)
    + minWarnHTML(calc)
    + '<p class="sec-label">Per participant</p>'
    + order.map(k => feeTableHTML(k, by[k], calc.tier, calc.on)).join('')
    + notesHTML(calc, a, b.cents);
}

/* ---------- Course overview: what each course covers, its hours and fee; Add to plan puts it in the course menu ---------- */
let ovMode = 'plan';
function renderOverview(){
  const body = $('ov-body'); if (!body) return;
  const st = E(), inPlan = k => st.lines.some(l => l.course === k);
  const offered = COURSES.filter(c => allowed(c.k)), planned = offered.filter(c => inPlan(c.k));
  const list = ovMode === 'all' ? offered : planned;
  ['plan', 'all'].forEach(m => $('ov-' + m).setAttribute('aria-pressed', String(ovMode === m)));
  if (!list.length) { body.innerHTML = '<p class="ov-empty">No courses in your plan yet. Choose a course above, or press All courses to browse them.</p>'; return; }
  let rows = '';
  GROUPS.forEach(([g, label]) => {
    const cs = list.filter(c => c.g === g); if (!cs.length) return;
    rows += '<tr class="ov-g"><th colspan="4" scope="colgroup">' + esc(label) + '</th></tr>';
    cs.forEach(c => {
      const a = ABOUT[c.k] || {d: '', o: []}, on = inPlan(c.k);
      rows += '<tr id="ovr-' + c.k + '"><th scope="row" class="ov-c"><span class="ov-name"><a href="' + c.url + '" target="_blank" rel="noopener">' + esc(c.name) + '</a></span>' + (a.d ? '<span class="ov-d">' + esc(a.d) + '</span>' : '') + '</th>'
        + '<td>' + (a.o && a.o.length ? '<ul class="ov-learn">' + a.o.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') + '</td>'
        + '<td><span class="ov-num">' + c.hrs + ' hours<small>in total</small></span><span class="ov-num">' + money0(c.fee) + '<small>per participant, before GST and funding</small></span></td>'
        + '<td>' + (on ? '<button type="button" class="ov-btn is-in" data-ov="find" data-k="' + c.k + '">' + SVG_CHECK + 'In your plan</button>' : '<button type="button" class="ov-btn" data-ov="add" data-k="' + c.k + '">+ Add to plan</button>') + '</td></tr>';
    });
  });
  body.innerHTML = '<div class="ov-tw" tabindex="0" role="region" aria-label="Course overview"><table class="ovt"><thead><tr><th scope="col">Course</th><th scope="col">What you’ll learn</th><th scope="col">Hours and fee</th><th scope="col"><span class="sr-only">Plan</span></th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}
function flashLine(l, focusId){
  const el = $('line-' + l.id); if (!el) return;
  el.scrollIntoView({behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center'});
  const f = focusId && $(focusId); if (f) setTimeout(() => f.focus({preventScroll: true}), reduceMotion.matches ? 0 : 350);
}
function addCourseToPlan(k){
  const st = E(); if (!C[k] || !allowed(k)) return;
  let l = st.lines.find(x => !x.course);
  if (!l) { l = mk(); st.lines.push(l); }
  l.course = k;
  renderLines(null, new Set(['opts-' + l.id, 'pax-' + l.id])); dirty(); renderEntityBar();
  flashLine(l, 'q-scpr-' + l.id);
  announce('Added ' + C[k].name + ' as course ' + (st.lines.indexOf(l) + 1) + '. Enter who’s attending.');
}

/* ---------- Plan codes: a short text that carries the plan, for pages that can't remember it (such as Google Sites embeds) ---------- */
const PLAN_V = 'P1';
function planCode(){
  const ents = S.setup.entities.map(e => {
    const st = S.ent[e.id] || {lines: []}, b = balState(e);
    const lines = st.lines.filter(l => l.course).map(l => ALL.indexOf(l.course).toString(36) + (l.type === 'private' ? 'r' : 'p') + (l.time === 'eve' ? 'e' : 'd') + RKEYS.map(k => qn(l.q[k])).join('.')).join('_');
    return (b.on ? String(b.cents / 100) : '') + '~' + lines;
  });
  return PLAN_V + '-' + Math.max(0, entIndex(S.active)) + '-' + ents.join('!');
}
function loadPlan(raw){
  const t = String(raw || '').trim().replace(/\s+/g, '');
  const m = /^P1-(\d+)-(.*)$/.exec(t);
  if (!m) return 'That isn’t a plan code. It starts with P1-.';
  const parts = m[2].split('!');
  if (parts.length !== S.setup.entities.length) return 'This code is from a calculator with a different number of UENs, so it can’t be loaded here.';
  const next = [], skipped = [];
  for (const part of parts) {
    const [bal, ls] = part.split('~');
    if (ls == null) return 'Part of this code is missing. Copy the whole code and try again.';
    const lines = [];
    for (const x of (ls ? ls.split('_') : [])) {
      const mm = /^([0-9a-z])([pr])([de])(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(x);
      if (!mm) return 'Part of this code is damaged. Copy the whole code and try again.';
      const k = ALL[parseInt(mm[1], 36)];
      if (!k || !allowed(k)) { skipped.push(k ? C[k].name : 'a course'); continue; }
      lines.push(mk({course: k, type: mm[2] === 'r' ? 'private' : 'public', time: mm[3] === 'e' ? 'eve' : 'day', q: {scpr: mm[4], sc40: mm[5], pass: mm[6]}}));
    }
    next.push({bal, lines});
  }
  S.setup.entities.forEach((e, i) => {
    const n = next[i], st = S.ent[e.id] = mkEntState({});
    if (n.lines.length) st.lines = n.lines;
    if (n.bal !== '' && e.elig !== 'no') { const c = parseMoney(n.bal); if (c != null && c <= SFEC.credit * 100) e.balance = NF2.format(c / 100); }
    if (e.tier === 70 || !S.setup.residencies.has('sc40')) foldSc40(st);
    if (st.lines.some(l => l.course)) st.calc = computeCalc(st, e);
  });
  const ai = Number(m[1]); if (S.setup.entities[ai]) S.active = S.setup.entities[ai].id;
  renderForEntity(); save();
  return skipped.length ? '!Loaded. ' + joinList(skipped) + ' isn’t offered here, so it was left out.' : '';
}
function renderPlanCode(){ const f = $('plan-code'); if (f) f.value = planCode(); }

/* ---------- Glue ---------- */
function announce(msg){ const live = $('live'); live.textContent = ''; setTimeout(() => { live.textContent = msg; }, 30); }
function renderExample(){ if (MODE === 'builder') $('example-note').hidden = !S.example; }
function dirty(){
  S.example = false;
  const st = E();
  if (st.calc) st.stale = true;
  renderExample(); renderCalc(); renderGlance();
  const s = !!(st.calc && st.stale);
  $('sheet').classList.toggle('is-stale', s); $('sheet-stale').hidden = !s;
  queueSave();
}
let saveTimer = null;
function queueSave(){ clearTimeout(saveTimer); saveTimer = setTimeout(() => { save(); renderPlanCode(); }, 200); }
function snapshot(){
  const ent = {};
  S.setup.entities.forEach(e => { const st = S.ent[e.id]; if (st) ent[e.id] = {lines: st.lines.map(pickLine), calculated: !!st.calc, balance: e.balance, preset: e.preset == null ? null : e.preset}; });
  return {v: 1, active: S.active, ent};
}
function save(){
  try {
    if (MODE === 'builder') localStorage.setItem(BUILDER_KEY, JSON.stringify(Object.assign(snapshot(), {setup: setupForSave(), example: S.example})));
    else localStorage.setItem(CLIENT_KEY, JSON.stringify(snapshot()));
  } catch (e) { /* storage unavailable: everything still works for this visit */ }
  hostChanged();
}
/* ---------- Microsite bridge ----------
   Inside the client microsite the page around this calculator (its Confirm and Enrol tabs) hears every change, and
   can put the proposed plan back. The proposed plan is the setup the builder baked in: CFG's balances and lines. */
const cfgEntOf = (e, i) => { const list = CFG && Array.isArray(CFG.entities) ? CFG.entities : []; return list.find(x => x && x.id === e.id) || list[i] || {}; };
function planKeyOf(e, balance, lines){
  const b = balState(Object.assign({}, e, {balance: str(balance)}));
  return (b.on ? b.cents : 'x') + '~' + lines.filter(l => l.course && allowed(l.course) && lineTotal(l, e.tier) > 0)
    .map(l => l.course + (l.type === 'private' ? 'r' : 'p') + (l.time === 'eve' ? 'e' : 'd') + RKEYS.map(k => lineQ(l, k, e.tier)).join('.')).join('_');
}
const planKeyNow = () => S.setup.entities.map(e => planKeyOf(e, e.balance, (S.ent[e.id] || {lines: []}).lines)).join('!');
const planKeyBase = () => S.setup.entities.map((e, i) => planKeyOf(e, e.preset == null ? e.balance : e.preset, (Array.isArray(cfgEntOf(e, i).lines) ? cfgEntOf(e, i).lines : []).map(mk))).join('!');
const atBaseline = () => planKeyNow() === planKeyBase();
function resetToBaseline(){
  S.setup.entities.forEach((e, i) => {
    const src = cfgEntOf(e, i);
    if (e.preset != null) e.balance = e.preset;
    const st = S.ent[e.id] = mkEntState({lines: Array.isArray(src.lines) ? src.lines : []}, true);
    if (e.tier === 70 || !S.setup.residencies.has('sc40')) foldSc40(st);
    if (st.lines.some(l => l.course && allowed(l.course) && lineTotal(l, e.tier) > 0)) st.calc = computeCalc(st, e);
  });
  S.active = S.setup.entities[0].id;
  renderForEntity(); save(); renderPlanCode();
  announce('Back to the proposed plan.');
}
/* The plan as the forms need it: every UEN's courses with their figures, worked out fresh from what is entered now */
function hostSummary(){
  return {client: S.setup.client, active: S.active, changed: !atBaseline(), entities: S.setup.entities.map(e => {
    const st = S.ent[e.id] || mkEntState({}), b = balState(e), calc = computeCalc(st, e), a = calc && b.on ? allocate(calc, b.cents) : null;
    const part = x => (a ? a.parts.find(q => q.n === x.n) : null);
    return {id: e.id, name: e.name.trim(), uen: e.uen.trim().toUpperCase(), label: entLabel(e), tier: e.tier, elig: e.elig, sfecOn: b.on, balance: b.on ? b.cents : null,
      lines: calc ? calc.lines.map(x => ({k: x.course, name: C[x.course].name, priv: x.priv, time: x.time, qty: x.qty, mixText: mixText(x, calc.tier), runText: runText(x),
        fee: x.fee, fund: x.fund, gst: x.gst, sfec: part(x) ? part(x).d : 0, up: lineUp(x, part(x))})) : [],
      totals: calc ? {qty: calc.totals.qty, fee: calc.totals.fee, fund: calc.totals.fund, gst: calc.totals.gst, sfec: a ? a.drawn : 0, left: a ? a.remaining : null, up: totalUp(calc, a)} : null};
  })};
}
function hostChanged(){
  if (MODE !== 'client') return;
  const btn = document.getElementById('base-reset');
  if (btn && !btn.classList.contains('is-confirm')) {
    const same = atBaseline();
    btn.disabled = same;
    const note = document.getElementById('base-status'); if (note) note.textContent = same ? 'Showing the proposed plan.' : 'Changed from the proposed plan.';
  }
  if (!CFG.bridge || !FRAMED) return;
  try { window.parent.postMessage({viSite: 1, type: 'calc-state', data: hostSummary()}, '*'); } catch (e) { /* no page around it */ }
}
if (MODE === 'client' && CFG.bridge && FRAMED) window.addEventListener('message', e => {
  const m = e.data;
  if (!m || m.viSite !== 1 || e.source !== window.parent) return;
  if (m.type === 'calc-request') hostChanged();
  else if (m.type === 'calc-reset') resetToBaseline();
});
function loadRaw(key){ try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; } }
function twoStep(btn, idleText, askText, onConfirm){
  let timer = null;
  btn.addEventListener('click', () => {
    if (!btn.classList.contains('is-confirm')) {
      btn.classList.add('is-confirm'); btn.textContent = typeof askText === 'function' ? askText() : askText;
      timer = setTimeout(() => { btn.classList.remove('is-confirm'); btn.textContent = idleText; }, 4000);
      return;
    }
    clearTimeout(timer); btn.classList.remove('is-confirm'); btn.textContent = idleText;
    onConfirm();
  });
}

/* ---------- Saving files: the claude.ai downloads capability on the setup page, a normal download in the client copy ---------- */
let downloadsP = null;
function getDownloads(){
  if (!downloadsP) {
    downloadsP = (async () => {
      try { return window.claude && typeof window.claude.use === 'function' ? await window.claude.use('downloads') : null; }
      catch (e) { return null; }
    })();
  }
  return downloadsP;
}
async function deliver(blob, filename){
  const dl = await getDownloads();
  if (dl) { await dl.save({filename, data: blob}); return; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
function loadScript(url){
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url; s.async = true;
    s.onload = () => resolve(); s.onerror = () => { s.remove(); reject(new Error('load')); };
    document.head.appendChild(s);
  });
}
async function need(name){
  const lib = LIBS[name];
  if (lib.ready()) return;
  for (const url of lib.urls) {
    try { await loadScript(url); if (lib.ready()) return; } catch (e) { /* try the next source */ }
  }
  const err = new Error('lib'); err.code = 'lib'; throw err;
}

/* ---------- Boot the client view ---------- */
const root = $('app-root');
root.classList.add('no-anim');
root.innerHTML = $('app-shell').innerHTML;
if (MODE === 'builder') {
  const h = root.querySelector('h1.app-title');
  if (h) { const h2 = document.createElement('h2'); h2.className = h.className; h2.textContent = h.textContent; h.replaceWith(h2); }
  let saved = loadRaw(BUILDER_KEY);
  if (!(saved && saved.v === 1 && saved.setup)) saved = exampleBuilder();
  applySetup(saved.setup);
  const se = saved.ent || {};
  S.setup.entities.forEach(e => { S.ent[e.id] = mkEntState(se[e.id], false); S.ent[e.id].wantCalc = !!(se[e.id] && se[e.id].calculated); });
  S.active = saved.active && S.ent[saved.active] ? saved.active : S.setup.entities[0].id;
  S.example = !!saved.example;
} else {
  applySetup(CFG);
  /* An "open in new tab" copy carries the plan with it; otherwise this browser's saved plan wins, and the setup's starting lines come last */
  const handed = CFG.state && CFG.state.ent ? CFG.state : null;
  const saved = handed || loadRaw(CLIENT_KEY), ok = saved && saved.v === 1 && saved.ent && typeof saved.ent === 'object';
  const cfgEnts = Array.isArray(CFG.entities) ? CFG.entities : [];
  S.setup.entities.forEach((e, i) => {
    const sv = ok ? saved.ent[e.id] : null, cfgE = cfgEnts.find(x => x && x.id === e.id) || cfgEnts[i] || {};
    e.preset = e.balance;
    /* The client's own balance wins unless you have changed the preset since they saved it */
    if (sv && typeof sv.balance === 'string' && (handed || sv.preset === e.preset)) e.balance = sv.balance.slice(0, 40);
    S.ent[e.id] = mkEntState(sv || {lines: Array.isArray(cfgE.lines) ? cfgE.lines : []}, true);
    S.ent[e.id].wantCalc = sv ? !!sv.calculated : true;
  });
  S.active = ok && saved.active && S.ent[saved.active] ? saved.active : S.setup.entities[0].id;
}
/* At 70% funding the 40+ row merges into the shared row */
S.setup.entities.forEach(e => { if (e.tier === 70 || !S.setup.residencies.has('sc40')) foldSc40(S.ent[e.id]); });
/* Work out each UEN's figures up front, so switching between them shows their last calculation */
S.setup.entities.forEach(e => {
  const st = S.ent[e.id];
  if (st.wantCalc && st.lines.some(l => l.course && allowed(l.course) && lineTotal(l, e.tier) > 0)) st.calc = computeCalc(st, e);
  delete st.wantCalc;
});

// UEN picker
function switchEntity(id){
  if (!S.ent[id] || id === S.active) return;
  S.active = id;
  renderForEntity();
  queueSave();
  announce('Planning for ' + entLabel(ES()) + '.');
}
let onEntitySwitch = null;
function renderForEntity(){
  renderEntityBar(); renderTier(); renderLines(); renderGlance(); renderSheet(); renderCalc(); renderHead(); renderHowto();
  saveStatus('');
  if (onEntitySwitch) onEntitySwitch();
}
$('ent-sel').addEventListener('change', e => switchEntity(e.target.value));
// SFEC (Enhanced) balance: the client's own figure
{
  const bi = $('bal-in');
  bi.addEventListener('input', () => { ES().balance = bi.value; balChanged(); });
  bi.addEventListener('focus', () => requestAnimationFrame(() => bi.select()));
  bi.addEventListener('blur', () => { const c = parseMoney(bi.value); if (c != null && c <= SFEC.credit * 100) { bi.value = NF2.format(c / 100); ES().balance = bi.value; balChanged(); } else renderBalField(); });
  bi.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); bi.blur(); } });
}

// Course menu
$('lines').addEventListener('change', e => {
  const t = e.target, f = t.dataset.f;
  if (f !== 'course') return;
  const line = lineById(t.closest('.line').dataset.id); if (!line) return;
  const first = !line.course, revealed = new Set();
  let focus = t.id;
  line.course = t.value;
  if (!line.course) RKEYS.forEach(k => { line.q[k] = ''; });
  else if (first) { revealed.add('opts-' + line.id); revealed.add('pax-' + line.id); focus = 'q-scpr-' + line.id; }
  applyPrivateDefault(line);
  renderLines(focus, revealed); dirty(); renderEntityBar();
});
$('lines').addEventListener('input', e => {
  const t = e.target; if (t.dataset.f !== 'q') return;
  const line = lineById(t.closest('.line').dataset.id); if (!line) return;
  line.q[t.dataset.res] = t.value;
  syncPaxRow(line, t.dataset.res); dirty();
});
$('lines').addEventListener('click', e => {
  const lineEl = e.target.closest('.line'); if (!lineEl) return;
  const line = lineById(lineEl.dataset.id); if (!line) return;
  const step = e.target.closest('[data-act="inc"], [data-act="dec"]');
  if (step) {
    const res = step.dataset.res, cur = qn(line.q[res]);
    const next = step.dataset.act === 'inc' ? Math.min(cur + 1, 999) : Math.max(cur - 1, 0);
    line.q[res] = next ? String(next) : '';
    const input = $('q-' + res + '-' + line.id); if (input) input.value = line.q[res];
    syncPaxRow(line, res); dirty();
    if (step.disabled) { const inc = step.parentElement.querySelector('[data-act="inc"]'); if (inc) inc.focus(); }
    return;
  }
  const opt = e.target.closest('[data-act="type"], [data-act="time"]');
  if (opt) {
    const isType = opt.dataset.act === 'type';
    const v = isType ? (opt.dataset.v === 'private' ? 'private' : 'public') : (opt.dataset.v === 'eve' ? 'eve' : 'day');
    if (line[isType ? 'type' : 'time'] === v) return;
    line[isType ? 'type' : 'time'] = v;
    if (isType && v === 'private') applyPrivateDefault(line);
    renderLines(opt.id); dirty();
    return;
  }
  if (e.target.closest('[data-act="about"]')) {
    if (line.course) { ovMode = 'all'; renderOverview(); const r = $('ovr-' + line.course); if (r) { r.classList.add('is-flash'); r.scrollIntoView({behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center'}); setTimeout(() => r.classList.remove('is-flash'), 1600); } }
    return;
  }
  const rm = e.target.closest('[data-act="remove"]');
  if (rm) {
    const st = E(), i = st.lines.indexOf(line), hadContent = !!line.course;
    if (st.lines.length > 1) st.lines.splice(i, 1); else st.lines[0] = mk();
    const next = st.lines[Math.min(i, st.lines.length - 1)];
    renderLines('course-' + next.id);
    if (hadContent) dirty(); else { renderCalc(); queueSave(); }
    renderEntityBar();
  }
});
$('add').addEventListener('click', () => {
  const l = mk(); E().lines.push(l); S.example = false; renderExample();
  renderLines('course-' + l.id); renderCalc(); queueSave();
});
twoStep($('clear-lines'), 'Clear all', 'Clear all courses?', () => {
  const st = E();
  st.lines = [mk()]; st.calc = null; st.stale = false; S.example = false;
  renderExample(); renderLines('course-' + st.lines[0].id); renderGlance(); renderSheet(); renderCalc(); renderEntityBar(); save();
  announce('Courses cleared.');
});
/* Calculate is a plain button rather than a form submit: Slack and email previews block form submissions */
$('lines').addEventListener('keydown', e => {
  if (e.key !== 'Enter' || e.isComposing || !e.target.matches('input')) return;
  e.preventDefault();
  if (E().lines.some(complete)) calculate();
});
$('calc').addEventListener('click', () => { if (E().lines.some(complete)) calculate(); });
$('sheet-recalc').addEventListener('click', () => calculate());
$('reimb-btn').addEventListener('click', () => {
  E().reimbOpen = !E().reimbOpen;
  const st = E(), b = balState(ES());
  renderReimb(st.calc, st.calc && b.on ? allocate(st.calc, b.cents) : null);
});

// Course overview
$('ovp').addEventListener('click', e => {
  const m = e.target.closest('[data-ovm]'); if (m) { ovMode = m.dataset.ovm; renderOverview(); return; }
  const b = e.target.closest('[data-ov]'); if (!b) return;
  if (b.dataset.ov === 'add') addCourseToPlan(b.dataset.k);
  else { const l = E().lines.find(x => x.course === b.dataset.k); if (l) flashLine(l, 'course-' + l.id); }
});
// Save or load a plan
const planMsg = (msg, kind) => { const m = $('plan-msg'); m.textContent = msg; m.classList.toggle('is-ok', kind === 'ok'); m.classList.toggle('is-error', kind === 'error'); };
$('plan-btn').addEventListener('click', () => {
  const p = $('plan-panel'), open = p.hidden;
  p.hidden = !open; $('plan-btn').setAttribute('aria-expanded', String(open));
  if (open) { renderPlanCode(); planMsg(''); $('plan-copy').focus(); }
});
$('plan-copy').addEventListener('click', async () => {
  const f = $('plan-code'); renderPlanCode();
  let ok = false;
  try { if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(f.value); ok = true; } } catch (e) { ok = false; }
  if (!ok) { try { f.focus(); f.select(); ok = document.execCommand('copy'); } catch (e) { ok = false; } }
  if (ok) planMsg('Copied. Keep it somewhere safe, such as an email to yourself.', 'ok');
  else { f.focus(); f.select(); planMsg('The code is selected. Press Ctrl+C, or Cmd+C on a Mac, to copy it.'); }
});
$('plan-load').addEventListener('click', () => {
  const err = loadPlan($('plan-in').value);
  if (err && err[0] !== '!') { planMsg(err, 'error'); return; }
  $('plan-in').value = ''; renderPlanCode();
  planMsg(err ? err.slice(1) : 'Plan loaded.', 'ok');
  announce('Plan loaded.');
});
$('plan-in').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('plan-load').click(); } });
$('plan-hint').hidden = !EMBEDDED;

// Tooltip on the health bar
const tip = $('tip'), hpEl = $('hp');
hpEl.addEventListener('pointermove', e => {
  const seg = e.target.closest('.hp-seg'), html = seg && tips.get(seg.dataset.k);
  if (!html) { tip.hidden = true; return; }
  tip.innerHTML = html; tip.hidden = false;
  const r = tip.getBoundingClientRect();
  let x = e.clientX + 14, y = e.clientY + 18;
  if (x + r.width > window.innerWidth - 8) x = e.clientX - r.width - 14;
  if (y + r.height > window.innerHeight - 8) y = e.clientY - r.height - 14;
  tip.style.left = Math.max(8, x) + 'px'; tip.style.top = Math.max(8, y) + 'px';
});
hpEl.addEventListener('pointerleave', () => { tip.hidden = true; });
window.addEventListener('scroll', () => { tip.hidden = true; }, {passive: true});

/* ---------- Save a copy as PNG or PDF: a fixed-width light report of the UEN in view, rendered off the live page ---------- */
function buildExport(){
  const client = S.setup.client.trim(), es = ES(), b = balState(es);
  const who = [client, multi() && es.name.trim() && es.name.trim() !== client ? es.name.trim() : ''].filter(Boolean).join(' · ');
  const ex = document.createElement('div');
  ex.className = 'export';
  ex.innerHTML = '<header class="app-head"><div class="head-text"><p class="eyebrow">' + esc('Vertical Institute' + (who ? ' · Prepared for ' + who : '')) + '</p>'
    + '<p class="app-title">Corporate Training Calculator</p><p class="ex-saved">Saved on ' + esc(fmtDate(TODAY)) + '</p></div></header>';
  const top = root.querySelector('.top').cloneNode(true);
  const g = top.querySelector('.glance');
  g.classList.remove('is-stale');
  const hb = g.querySelector('.hp'); if (hb) hb.classList.remove('is-stale');
  const bf = g.querySelector('.bal-f');
  if (bf) { const p = document.createElement('p'); p.className = 'ex-bal'; p.innerHTML = b.on ? 'SFEC (Enhanced) balance: <b>' + money(b.cents) + '</b>' : ''; bf.replaceWith(p); }
  const rb = g.querySelector('.reimb-btn'); if (rb) rb.remove();
  const showR = S.setup.showReimb && !!E().calc;
  const rbox = g.querySelector('.reimb'); if (rbox) rbox.hidden = !showR;
  const rbody = g.querySelector('.reimb-body'); if (rbody) rbody.hidden = !showR;
  g.querySelectorAll('.chip').forEach(ch => { if (/Changes not calculated/.test(ch.textContent)) ch.remove(); });
  const sh = $('sheet').cloneNode(true);
  sh.classList.remove('is-stale');
  const sst = sh.querySelector('.sheet-stale'); if (sst) sst.remove();
  const pc = document.createElement('p'); pc.className = 'ex-code'; pc.textContent = 'Plan code: ' + planCode() + '. Paste it under Save or load plan to reopen this plan.';
  ex.append(top, sh, pc, $('app-foot').cloneNode(true));
  ex.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  ex.querySelectorAll('[tabindex]').forEach(el => el.removeAttribute('tabindex'));
  ex.setAttribute('aria-hidden', 'true');
  return ex;
}
async function capture(){
  await need('h2c');
  const ex = buildExport();
  document.body.appendChild(ex);
  ex.querySelectorAll('svg').forEach(s => { s.style.color = getComputedStyle(s).color; });
  const sx = window.scrollX, sy = window.scrollY;
  window.scrollTo(0, 0);
  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const box = ex.getBoundingClientRect();
    const breakable = [...ex.querySelectorAll('.top, .sheet-head, .sec-label, .tbl-wrap, .notes-block, .app-foot')].filter(el => !(el.classList.contains('tbl-wrap') && el.previousElementSibling && el.previousElementSibling.classList.contains('sec-label')));
    const marks = breakable.map(el => el.getBoundingClientRect().top - box.top);
    const canvas = await window.html2canvas(ex, {scale: 2, backgroundColor: '#F2F4F9', windowWidth: 1280, logging: false, useCORS: true, scrollX: 0, scrollY: 0});
    return {canvas, marks, cssWidth: box.width};
  } finally {
    ex.remove();
    window.scrollTo(sx, sy);
  }
}
async function toPDF(shot){
  await need('pdf');
  const {jsPDF} = window.jspdf;
  const pdf = new jsPDF({unit: 'mm', format: 'a4', orientation: 'portrait', compress: true});
  const W = 210, H = 297, topGap = 10;
  const cv = shot.canvas, pxPerMm = cv.width / W, k = cv.width / shot.cssWidth;
  const cuts = shot.marks.map(m => Math.round(m * k)).filter(c => c > 0).sort((a, b) => a - b);
  let start = 0, page = 0;
  while (start < cv.height - 2) {
    const offset = page === 0 ? 0 : topGap;
    const room = Math.floor((H - offset) * pxPerMm);
    let end = Math.min(start + room, cv.height);
    if (end < cv.height) {
      const fits = cuts.filter(c => c > start + room * 0.3 && c <= end);
      if (fits.length) end = fits[fits.length - 1];
    }
    const h = end - start;
    const part = document.createElement('canvas');
    part.width = cv.width; part.height = h;
    const ctx = part.getContext('2d');
    ctx.fillStyle = '#F2F4F9'; ctx.fillRect(0, 0, part.width, h);
    ctx.drawImage(cv, 0, start, cv.width, h, 0, 0, cv.width, h);
    if (page > 0) pdf.addPage();
    pdf.setFillColor(242, 244, 249); pdf.rect(0, 0, W, H, 'F');
    pdf.addImage(part.toDataURL('image/jpeg', 0.92), 'JPEG', 0, offset, W, h / pxPerMm);
    start = end; page++;
  }
  return pdf.output('blob');
}
const cleanName = s => String(s).replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim();
function saveName(ext){
  const name = cleanName(S.setup.client), en = multi() ? cleanName(ES().name) : '';
  return 'Corporate Training Calculator' + (name ? ' - ' + name : '') + (en && en !== name ? ' - ' + en : '') + ' - ' + fmtDate(TODAY) + '.' + ext;
}
function saveStatus(msg, isError){ const s = $('save-status'); if (!s) return; s.textContent = msg; s.classList.toggle('is-error', !!isError); }
async function saveCopy(kind){
  const st = E();
  if (st.lines.some(complete) && (!st.calc || st.stale)) calculate({silent: true});
  if (!st.calc) { saveStatus('Add a course and its participants first, then save.', true); return; }
  const btns = [...root.querySelectorAll('[data-save]')];
  btns.forEach(b => { b.disabled = true; });
  const veil = document.createElement('div');
  veil.className = 'saving'; veil.setAttribute('role', 'status');
  veil.textContent = 'Preparing your ' + (kind === 'pdf' ? 'PDF' : 'image') + '…';
  document.body.appendChild(veil);
  saveStatus('');
  try {
    const shot = await capture();
    const blob = kind === 'pdf' ? await toPDF(shot) : await new Promise(res => shot.canvas.toBlob(res, 'image/png'));
    if (!blob) throw new Error('blob');
    veil.remove();
    await deliver(blob, saveName(kind));
    saveStatus(EMBEDDED ? 'If nothing downloaded, this page may block saving. Press Open in new tab and save from there.' : 'Saved. Send it to ' + CONTACT.first + ' at ' + CONTACT.email + ' or ' + CONTACT.phone + '.');
  } catch (err) {
    const code = err && err.code;
    saveStatus(code === 'declined' ? 'Save cancelled.'
      : code === 'lib' ? 'Couldn’t load the saving tool. Check your internet connection and try again.'
      : code === 'unavailable' ? 'Saving isn’t available in this view.'
      : code === 'rate_limited' ? 'A save prompt is already open. Finish that one first.'
      : 'Something went wrong while saving. Try again.', code !== 'declined');
  } finally {
    veil.remove();
    btns.forEach(b => { b.disabled = false; });
  }
}
root.querySelectorAll('[data-save]').forEach(b => b.addEventListener('click', () => saveCopy(b.dataset.save)));

/* ---------- Files: a client copy is this same page with the setup baked in ---------- */
const jsonForScript = o => JSON.stringify(o).replace(/</g, '\\u003c');
function buildFile(cfg, title){
  const closeScript = '<' + '/script>';
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    + '<title>' + esc(title) + '</title>\n'
    + '<script>(function(){var d=document.documentElement;try{if(window.self===window.top)return;}catch(e){}d.setAttribute("data-theme","light");d.classList.add("is-embedded");})();' + '<' + '/script>\n'
    + FONTS + '\n'
    + '<style id="app-css">' + $('app-css').textContent + '</style>\n</head>\n<body>\n'
    + '<div class="wrap is-client" id="wrap"><div class="app" id="app-root"></div></div>\n'
    + '<template id="app-shell">' + $('app-shell').innerHTML + '</template>\n'
    + '<script>window.CTC_CONFIG = ' + jsonForScript(cfg) + ';' + closeScript + '\n'
    + '<script id="app-js">' + $('app-js').textContent + closeScript + '\n</body>\n</html>\n';
}
/* Open in new tab: inside an embed, a full page where saving works, carrying the plan with it */
function openInTab(){
  const cfg = Object.assign({}, CFG, {state: snapshot()});
  const html = buildFile(cfg, document.title || 'Corporate Training Calculator');
  let w = null;
  try { w = window.open('', '_blank'); } catch (e) { w = null; }
  if (w) {
    try { w.document.open(); w.document.write(html); w.document.close(); saveStatus('Opened in a new tab. Save your copy from there.'); return; }
    catch (e) { try { w.close(); } catch (e2) { /* ignore */ } }
  }
  saveStatus('Your browser blocked the new tab. Allow pop-ups for this page, or ask ' + CONTACT.first + ' for the calculator file.', true);
}
$('open-tab').hidden = !EMBEDDED;
$('open-tab').addEventListener('click', openInTab);
function syncToolbar(){ $('toolbar').hidden = false; }
function renderSave(){ $('save-box').hidden = !S.setup.showSave; syncToolbar(); }

/* ---------- Setup (yours only) ---------- */
if (MODE === 'builder') {
  const ci = $('client'), rows = $('ent-rows');
  const uenHint = u => { const v = u.replace(/\s+/g, '').toUpperCase(); return v && !/^[0-9A-Z]{9,10}$/.test(v) ? 'UENs have 9 or 10 letters and digits.' : ''; };
  function entRowHTML(e, i){
    const many = S.setup.entities.length > 1, act = e.id === S.active, id = esc(e.id), b = balState(e);
    return '<div class="ent-row' + (act ? ' is-active' : '') + '" data-eid="' + id + '">'
      + '<div class="ent-row-head"><span class="num">' + (i + 1) + '</span>'
      + (many ? (act ? '<span class="ent-live">In preview</span>' : '<button type="button" class="link-btn" data-act="preview">Show in preview</button>') : '<span class="ent-live">In preview</span>')
      + '<span class="grow"></span>'
      + (many ? '<button type="button" class="icon-btn" id="ex-' + id + '" data-act="remove" aria-label="Remove ' + esc(entLabel(e)) + '" title="Remove this UEN">' + SVG_X + '</button>' : '')
      + '</div><div class="ent-fields">'
      + '<label class="f" for="eu-' + id + '"><span>UEN</span><input type="text" id="eu-' + id + '" data-f="uen" autocomplete="off" spellcheck="false" placeholder="9 or 10 letters and digits" value="' + esc(e.uen) + '"><small class="f-hint" id="euh-' + id + '">' + uenHint(e.uen) + '</small></label>'
      + '<div class="f"><span id="etl-' + id + '">Course fee funding <em>(Training Partners Gateway)</em></span><div class="seg" role="group" aria-labelledby="etl-' + id + '">'
      + '<button type="button" id="et50-' + id + '" data-tier="50" aria-pressed="' + (e.tier === 50) + '">50%</button><button type="button" id="et70-' + id + '" data-tier="70" aria-pressed="' + (e.tier === 70) + '">70%</button></div></div>'
      + '<label class="f" for="ee-' + id + '"><span>SFEC (Enhanced)</span><select id="ee-' + id + '" data-f="elig">'
      + Object.keys(ELIG).map(k => '<option value="' + k + '"' + (e.elig === k ? ' selected' : '') + '>' + ELIG[k] + '</option>').join('') + '</select></label>'
      + '<label class="f" for="eb-' + id + '"' + (b.on ? '' : ' hidden') + '><span>SFEC (Enhanced) balance <em>(fresh S$10,000)</em></span><span class="money"><span aria-hidden="true">S$</span><input type="text" id="eb-' + id + '" data-f="balance" inputmode="decimal" autocomplete="off" placeholder="10,000.00" value="' + esc(e.balance) + '" aria-invalid="' + (!!b.bad) + '"></span><small class="f-hint" id="ebh-' + id + '">' + esc(b.bad) + '</small></label>'
      + '<label class="f" for="en-' + id + '"><span>Entity name <em>(optional)</em></span><input type="text" id="en-' + id + '" data-f="name" autocomplete="off" placeholder="e.g. Walkers Engineering Pte Ltd" value="' + esc(e.name) + '"></label>'
      + '</div></div>';
  }
  const renderEntRows = focusId => { rows.innerHTML = S.setup.entities.map(entRowHTML).join(''); if (focusId) { const el = $(focusId); if (el) el.focus(); } };
  onEntitySwitch = () => { renderEntRows(); };
  const syncInputs = () => {
    ci.value = S.setup.client;
    $('sfec-rate').value = String(S.setup.sfecRate);
    $('show-eis').checked = S.setup.showEIS; $('show-gst').checked = S.setup.showGST; $('show-reimb').checked = S.setup.showReimb; $('show-save').checked = S.setup.showSave;
    $('include-start').checked = S.setup.includeStart;
    renderEntRows();
  };
  const renderPicks = () => {
    const box = $('pick-groups');
    if (!box.dataset.built) {
      box.innerHTML = GROUPS.map(([g, label]) => '<div class="pick-group"><label class="check" for="pickg-' + g + '"><input type="checkbox" id="pickg-' + g + '" data-group="' + g + '"><span>' + esc(label) + '</span></label>'
        + COURSES.filter(x => x.g === g).map(x => '<label class="pick" for="pick-' + x.k + '"><input type="checkbox" id="pick-' + x.k + '" data-course="' + x.k + '"><span>' + esc(x.name) + ' <small>' + money0(x.fee) + '</small></span></label>').join('')
        + '</div>').join('');
      box.dataset.built = '1';
    }
    box.querySelectorAll('input[data-course]').forEach(i => { i.checked = allowed(i.dataset.course); });
    GROUPS.forEach(([g]) => {
      const ks = COURSES.filter(x => x.g === g).map(x => x.k), on = ks.filter(allowed).length, gi = $('pickg-' + g);
      gi.checked = on === ks.length; gi.indeterminate = on > 0 && on < ks.length;
    });
    $('pick-count').textContent = S.setup.courses.size + ' of ' + COURSES.length + ' courses selected';
    renderDownload();
  };
  const renderResPicks = () => {
    const r = S.setup.residencies;
    $('res-checks').innerHTML = '<label class="check" for="resp-scpr"><input type="checkbox" id="resp-scpr" checked disabled><span>Singapore Citizens and PRs (always shown)</span></label>'
      + '<label class="check" for="resp-sc40"><input type="checkbox" id="resp-sc40" data-res="sc40"' + (r.has('sc40') ? ' checked' : '') + '><span>Singapore Citizens aged 40 and above <span class="rate r70">70%</span> <em class="f-help">(shown only for 50% funding)</em></span></label>'
      + '<label class="check" for="resp-pass"><input type="checkbox" id="resp-pass" data-res="pass"' + (r.has('pass') ? ' checked' : '') + '><span>Pass holders (EP, S Pass, Work Permit) <span class="rate r0">None</span></span></label>';
  };
  $('res-checks').addEventListener('change', e => {
    const k = e.target.dataset.res; if (!k) return;
    if (e.target.checked) S.setup.residencies.add(k);
    else {
      S.setup.residencies.delete(k);
      Object.values(S.ent).forEach(st => {
        if (k === 'sc40') foldSc40(st); else st.lines.forEach(l => { l.q.pass = ''; });
        if (st.calc) st.stale = true;
      });
    }
    renderTier(); renderLines(); renderHowto(); dirty(); renderDownload();
    const again = $('resp-' + k); if (again) again.focus();
  });
  const coursesChanged = () => {
    let touched = false;
    Object.values(S.ent).forEach(st => {
      st.lines = st.lines.map(l => { if (l.course && !allowed(l.course)) { if (st === E()) touched = true; else if (st.calc) st.stale = true; return mk(); } return l; });
    });
    renderPicks(); renderLines(); renderEntityBar();
    if (touched) dirty(); else { S.example = false; renderExample(); renderCalc(); queueSave(); }
  };
  const setupChanged = () => { S.example = false; renderExample(); queueSave(); renderDownload(); };
  onBalChange = () => { const es = ES(), b = balState(es), f = $('eb-' + es.id), h = $('ebh-' + es.id); if (f) f.setAttribute('aria-invalid', String(!!b.bad)); if (h) h.textContent = b.bad; setupChanged(); };
  /* Anything that changes every UEN's figures: recalculate the ones that had figures */
  const recalcAll = () => {
    S.setup.entities.forEach(ent => { const st = S.ent[ent.id]; if (st && st.calc && !st.stale) st.calc = computeCalc(st, ent); });
    renderForEntity();
  };

  ci.addEventListener('input', () => { S.setup.client = ci.value; renderHead(); renderGlance(); if (E().calc) renderSheet(); setupChanged(); });
  $('sfec-rate').addEventListener('change', e => {
    const v = Math.round(Number(e.target.value));
    S.setup.sfecRate = v >= 1 && v <= 100 ? v : SFEC.rate;
    e.target.value = String(S.setup.sfecRate);
    recalcAll(); setupChanged();
    announce('SFEC (Enhanced) coverage set to ' + S.setup.sfecRate + '%.');
  });
  rows.addEventListener('input', e => {
    const t = e.target, f = t.dataset.f, row = t.closest('.ent-row');
    if (!f || !row || f === 'elig') return;
    const ent = S.setup.entities.find(x => x.id === row.dataset.eid); if (!ent) return;
    ent[f] = t.value;
    const isActive = ent.id === S.active;
    if (f === 'uen') { const h = $('euh-' + ent.id); if (h) h.textContent = uenHint(ent.uen); }
    if (f === 'balance') {
      const b = balState(ent), h = $('ebh-' + ent.id);
      t.setAttribute('aria-invalid', String(!!b.bad)); if (h) h.textContent = b.bad;
      if (isActive) { renderGlance(); renderTier(); if (E().calc) renderSheet(); }
    }
    if (isActive && (f === 'uen' || f === 'name')) { renderTier(); renderGlance(); if (E().calc) renderSheet(); }
    renderEntityBar();
    const x = $('ex-' + ent.id); if (x) x.setAttribute('aria-label', 'Remove ' + entLabel(ent));
    setupChanged();
  });
  rows.addEventListener('change', e => {
    const t = e.target; if (t.dataset.f !== 'elig') return;
    const ent = S.setup.entities.find(x => x.id === t.closest('.ent-row').dataset.eid); if (!ent) return;
    ent.elig = ELIG[t.value] ? t.value : 'tbc';
    const st = S.ent[ent.id];
    if (st && st.calc) st.calc = computeCalc(st, ent);
    if (ent.id === S.active) renderForEntity(); else renderEntRows();
    const again = $('ee-' + ent.id); if (again) again.focus();
    setupChanged();
  });
  rows.addEventListener('focusin', e => { if (e.target.dataset.f === 'balance') { const i = e.target; requestAnimationFrame(() => i.select()); } });
  rows.addEventListener('focusout', e => {
    const t = e.target; if (t.dataset.f !== 'balance') return;
    const ent = S.setup.entities.find(x => x.id === t.closest('.ent-row').dataset.eid); if (!ent) return;
    const c = parseMoney(t.value); if (c != null && c <= SFEC.credit * 100) { t.value = NF2.format(c / 100); ent.balance = t.value; renderEntityBar(); queueSave(); if (ent.id === S.active) renderGlance(); }
  });
  rows.addEventListener('click', e => {
    const row = e.target.closest('.ent-row'); if (!row) return;
    const ent = S.setup.entities.find(x => x.id === row.dataset.eid); if (!ent) return;
    const tierBtn = e.target.closest('[data-tier]');
    if (tierBtn) {
      const v = Number(tierBtn.dataset.tier); if (v === ent.tier) return;
      ent.tier = v;
      const st = S.ent[ent.id];
      if (v === 70) foldSc40(st);
      if (st && st.calc) st.calc = computeCalc(st, ent);
      if (ent.id === S.active) renderForEntity(); else renderEntRows();
      const again = $(tierBtn.id); if (again) again.focus();
      setupChanged();
      announce(entShort(ent) + ' set to ' + v + '% funding.' + (v === 70 ? ' Citizens aged 40 and above now share the Citizens and PRs row.' : ''));
      return;
    }
    const act = e.target.closest('[data-act]'); if (!act) return;
    if (act.dataset.act === 'preview') { switchEntity(ent.id); const f = $('eu-' + ent.id); if (f) f.focus(); return; }
    if (act.dataset.act === 'remove') {
      const st = S.ent[ent.id], used = st && st.lines.some(l => l.course);
      if (used && act.dataset.armed !== '1') {
        act.dataset.armed = '1'; act.classList.add('is-confirm'); act.textContent = 'Remove?';
        setTimeout(() => { if (act.isConnected && act.dataset.armed === '1') { act.dataset.armed = ''; act.classList.remove('is-confirm'); act.innerHTML = SVG_X; } }, 4000);
        return;
      }
      const i = S.setup.entities.indexOf(ent), gone = entLabel(ent);
      S.setup.entities.splice(i, 1); delete S.ent[ent.id];
      if (S.active === ent.id) S.active = S.setup.entities[Math.min(i, S.setup.entities.length - 1)].id;
      renderForEntity();
      const next = S.setup.entities[Math.min(i, S.setup.entities.length - 1)];
      const f = $('eu-' + next.id); if (f) f.focus();
      setupChanged();
      announce('Removed ' + gone + '.');
    }
  });
  $('ent-add').addEventListener('click', () => {
    const e = mkEnt();
    S.setup.entities.push(e);
    S.ent[e.id] = mkEntState({});
    S.active = e.id;
    renderForEntity();
    const f = $('eu-' + e.id); if (f) f.focus();
    setupChanged();
    announce('Added UEN ' + S.setup.entities.length + ', with its own fresh S$10,000. Its course menu starts empty.');
  });
  $('show-eis').addEventListener('change', e => { S.setup.showEIS = e.target.checked; renderGlance(); if (E().calc) renderSheet(); renderHowto(); setupChanged(); });
  $('show-gst').addEventListener('change', e => { S.setup.showGST = e.target.checked; renderGlance(); if (E().calc) renderSheet(); renderHowto(); setupChanged(); });
  $('show-reimb').addEventListener('change', e => { S.setup.showReimb = e.target.checked; renderGlance(); setupChanged(); });
  $('show-save').addEventListener('change', e => { S.setup.showSave = e.target.checked; renderSave(); setupChanged(); });
  $('include-start').addEventListener('change', e => { S.setup.includeStart = e.target.checked; setupChanged(); });
  $('pick-groups').addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.course) { if (t.checked) S.setup.courses.add(t.dataset.course); else S.setup.courses.delete(t.dataset.course); }
    else if (t.dataset.group) { COURSES.filter(x => x.g === t.dataset.group).forEach(x => { if (t.checked) S.setup.courses.add(x.k); else S.setup.courses.delete(x.k); }); }
    else return;
    coursesChanged();
  });
  $('pick-all').addEventListener('click', () => { S.setup.courses = new Set(ALL); coursesChanged(); });
  $('pick-none').addEventListener('click', () => { S.setup.courses = new Set(); coursesChanged(); });

  twoStep($('reset'), 'Start over', 'Clear everything?', () => {
    applySetup({});
    S.ent = {}; S.setup.entities.forEach(e => { S.ent[e.id] = mkEntState({}); });
    S.active = S.setup.entities[0].id; S.example = false;
    syncInputs(); renderPicks(); renderResPicks(); renderForEntity(); renderExample(); renderSave(); save();
    announce('Cleared. Enter the client’s details to start.');
    ci.focus();
  });

  // The client copy: this same page with the setup baked in and the setup panel left out
  let downloads = null, downloadsChecked = false;
  const status = (msg, kind) => { const s = $('dl-status'); s.textContent = msg; s.classList.toggle('is-error', kind === 'error'); s.classList.toggle('is-ok', kind === 'ok'); };
  const problem = () => {
    const ents = S.setup.entities;
    for (const e of ents) { const b = balState(e); if (b.bad) return 'Check the SFEC (Enhanced) balance for ' + entLabel(e) + ': ' + b.bad; }
    const seen = new Set();
    for (const e of ents) { const u = e.uen.replace(/\s+/g, '').toUpperCase(); if (!u) continue; if (seen.has(u)) return 'UEN ' + u + ' is entered twice. Remove one of them first.'; seen.add(u); }
    if (!S.setup.courses.size) return 'Select at least one course for the client to choose from.';
    return '';
  };
  function renderDownload(){
    const p = problem();
    $('embed-open').disabled = !!p;
    $('download').disabled = !!p || !downloadsChecked || !downloads;
    const n = S.setup.entities.length, who = S.setup.client.trim() || 'your client';
    if (p) { status(p, 'error'); return; }
    if (downloadsChecked && !downloads) { status('Downloads aren’t available in this view. Use Get Google Sites embed code, which also lets you copy the code.', 'error'); return; }
    status('Ready for ' + who + (n > 1 ? ', with all ' + n + ' UENs in its dropdown' : '') + '. The embed code and the file are the same calculator.');
  }
  /* A steady id per client, so replacing the embed keeps the plan a client has already saved in their browser */
  const stableId = () => {
    const key = (S.setup.client.trim().toLowerCase() || 'client') + '|' + S.setup.entities.map(e => e.uen.replace(/\s+/g, '').toUpperCase() || e.id).join(',');
    let h = 5381;
    for (let i = 0; i < key.length; i++) h = ((h << 5) + h + key.charCodeAt(i)) >>> 0;
    return h.toString(36);
  };
  const fileName = () => { const name = cleanName(S.setup.client); return 'Corporate Training Calculator' + (name ? ' - ' + name : '') + '.html'; };
  function buildClientFile(){
    const st = S.setup;
    const cfg = {
      v: 1, id: stableId(), created: TODAY, client: st.client.trim(), sfecRate: st.sfecRate,
      entities: st.entities.map(e => ({id: e.id, name: e.name.trim(), uen: e.uen.replace(/\s+/g, '').toUpperCase(), balance: e.balance.trim() || NF2.format(SFEC.credit), tier: e.tier, elig: e.elig,
        lines: st.includeStart ? (S.ent[e.id] ? S.ent[e.id].lines : []).filter(l => l.course && allowed(l.course)).map(pickLine) : []})),
      courses: ALL.filter(allowed), residencies: [...st.residencies],
      showEIS: st.showEIS, showGST: st.showGST, showReimb: st.showReimb, showSave: st.showSave
    };
    return buildFile(cfg, 'Corporate Training Calculator' + (cfg.client ? ' · ' + cfg.client : ''));
  }
  async function saveClientFile(fromDialog){
    const p = problem(); if (p) { status(p, 'error'); return; }
    const filename = fileName(), report = fromDialog ? gsMsg : status;
    if (!downloads) { report('Downloads aren’t available in this view. Copy the embed code instead.', 'error'); return; }
    $('download').disabled = true; $('gs-file').disabled = true;
    report('Confirm the download to save ' + filename + '.');
    try {
      await downloads.save({filename, data: buildClientFile()});
      report('Saved ' + filename + '. Email it to ' + (S.setup.client.trim() || 'your client') + ', or paste the embed code into their Google Site.', 'ok');
    } catch (err) {
      const code = err && err.code;
      report(code === 'declined' ? 'Download cancelled.'
        : code === 'rate_limited' ? 'A download prompt is already open. Finish that one first.'
        : code === 'extension_not_enabled' ? 'HTML downloads are switched off in this view. Copy the embed code instead.'
        : 'The download didn’t go through. Try again.', code === 'declined' ? '' : 'error');
    } finally {
      $('gs-file').disabled = false;
      renderDownload();
      if (fromDialog) $('gs-file').focus();
    }
  }
  $('download').addEventListener('click', () => saveClientFile(false));
  getDownloads().then(dl => { downloads = dl; downloadsChecked = true; renderDownload(); });

  // Google Sites embed code
  const gs = $('gs');
  const gsMsg = (msg, kind) => { const m = $('gs-msg'); m.textContent = msg || ''; m.classList.toggle('is-ok', kind === 'ok'); m.classList.toggle('is-error', kind === 'error'); };
  function openGs(){
    const p = problem(); if (p) { status(p, 'error'); return; }
    const html = buildClientFile(), who = S.setup.client.trim();
    $('gs-code').value = html;
    $('gs-sub').textContent = (who ? 'For ' + who + '. ' : '') + 'One code holds the whole calculator with this setup' + (multi() ? ', including all ' + S.setup.entities.length + ' UENs' : '') + '.';
    $('gs-meta').textContent = fmtSize(new Blob([html]).size) + ' · ' + plural(S.setup.courses.size, 'course', 'courses') + ' · ' + plural(S.setup.entities.length, 'UEN', 'UENs');
    gsMsg('');
    $('gs-file').hidden = !downloads;
    if (typeof gs.showModal === 'function') { if (!gs.open) gs.showModal(); } else gs.setAttribute('open', '');
    $('gs-copy').focus();
  }
  function closeGs(){ if (typeof gs.close === 'function') gs.close(); else gs.removeAttribute('open'); $('embed-open').focus(); }
  $('embed-open').addEventListener('click', openGs);
  $('gs-x').addEventListener('click', closeGs);
  $('gs-select').addEventListener('click', () => { const ta = $('gs-code'); ta.focus(); ta.select(); gsMsg('Selected. Press Ctrl+C, or Cmd+C on a Mac, to copy.'); });
  $('gs-file').addEventListener('click', () => saveClientFile(true));
  $('gs-copy').addEventListener('click', async () => {
    const ta = $('gs-code');
    let ok = false;
    try { if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(ta.value); ok = true; } } catch (e) { ok = false; }
    if (!ok) { try { ta.focus(); ta.select(); ok = document.execCommand('copy'); } catch (e) { ok = false; } }
    if (ok) gsMsg('Copied. Paste it into Google Sites as the steps above describe.', 'ok');
    else { ta.focus(); ta.select(); gsMsg('The code is selected. Press Ctrl+C, or Cmd+C on a Mac, to copy it.'); }
  });

  syncInputs(); renderPicks(); renderResPicks();
}

/* Reset to proposed baseline: shown where the builder filled the plan in */
if (MODE === 'client' && CFG.baseline) {
  const box = document.createElement('div');
  box.className = 'save-box'; box.id = 'base-box';
  box.innerHTML = '<div class="save-btns"><button type="button" class="btn" id="base-reset">Reset to proposed baseline</button></div><p class="save-status" id="base-status" role="status"></p>';
  box.style.marginLeft = '0'; box.style.alignItems = 'flex-start';
  box.querySelector('.save-status').style.textAlign = 'left';
  $('toolbar').insertBefore(box, $('plan-box'));
  twoStep($('base-reset'), 'Reset to proposed baseline', 'Put the proposed plan back?', resetToBaseline);
}
renderHead(); renderTier(); renderEntityBar(); renderLines(); renderExample(); renderHowto(); renderSave();
renderGlance(); renderSheet(); renderCalc(); renderPlanCode();
hostChanged();
requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('no-anim')));
})();
