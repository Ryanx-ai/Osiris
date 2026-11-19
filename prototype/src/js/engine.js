
/* =====================================================================
   SLIDE ENGINE & RASTER-IMAGE INTERACTIVE PPTX EXPORTER
   Geometry is in inches; font sizes in points. The slide is 13.333 x 7.5 in.
   ===================================================================== */
const SW = 13.333, SH = 7.5, PT = 72;
const FACES = {B:['VIBody','normal'], BB:['VIBody','bold'], BI:['VIBody','italic'], BBI:['VIBody','bolditalic'], HB:['VIHead','bold']};
const VM = {body:{asc:0.952, desc:0.269}, head:{asc:0.950, desc:0.222}};
const EPS = 0.02;
const IMG_URL = {};

function runFace(r){ return r.f === 'h' ? 'HB' : r.b ? (r.i ? 'BBI' : 'BB') : (r.i ? 'BI' : 'B'); }
function measure(r, s){
  const t = FONT_W[runFace(r)];
  let em = 0, n = 0;
  for (const ch of s){ const v = t[ch.codePointAt(0)]; em += (v != null ? v : (t[63] || 500)); n++; }
  return em / 1000 * r.size + (r.cs || 0) * n;
}

function atomize(runs){
  const atoms = [];
  let a = {segs:[], w:0, sp:0, spR:null};
  for (const r of runs){
    const text = String(r.s == null ? '' : r.s);
    let buf = '';
    const flush = () => { if (buf){ const w = measure(r, buf); a.segs.push({s:buf, r, w}); a.w += w; buf = ''; } };
    for (const ch of text){
      if (ch === ' '){
        flush();
        if (a.segs.length){ a.sp = measure(r, ' '); a.spR = r; atoms.push(a); a = {segs:[], w:0, sp:0, spR:null}; }
        else if (atoms.length){ const p = atoms[atoms.length - 1]; p.sp += measure(r, ' '); if (!p.spR) p.spR = r; }
      } else if (ch === '-' && buf.length){
        buf += ch; flush(); atoms.push(a); a = {segs:[], w:0, sp:0, spR:null};
      } else buf += ch;
    }
    flush();
  }
  if (a.segs.length) atoms.push(a);
  return atoms;
}
function splitAtom(at, avail){
  const out = [];
  let cur = {segs:[], w:0, sp:0, spR:null};
  for (const sg of at.segs){
    let buf = '';
    for (const ch of sg.s){
      const cw = measure(sg.r, ch);
      if (cur.w + measure(sg.r, buf) + cw > avail + EPS && (cur.segs.length || buf)){
        if (buf){ const w = measure(sg.r, buf); cur.segs.push({s:buf, r:sg.r, w}); cur.w += w; buf = ''; }
        out.push(cur); cur = {segs:[], w:0, sp:0, spR:null};
      }
      buf += ch;
    }
    if (buf){ const w = measure(sg.r, buf); cur.segs.push({s:buf, r:sg.r, w}); cur.w += w; }
  }
  cur.sp = at.sp; cur.spR = at.spR;
  out.push(cur);
  return out;
}
function buildLines(atoms, avail){
  const lines = [];
  let L = {items:[], w:0};
  for (let i = 0; i < atoms.length; i++){
    const at = atoms[i];
    const prev = L.items[L.items.length - 1];
    const gap = prev ? prev.sp : 0;
    if (L.items.length && L.w + gap + at.w > avail + EPS){ lines.push(L); L = {items:[], w:0}; i--; continue; }
    if (!L.items.length && at.w > avail + EPS){
      const parts = splitAtom(at, avail);
      parts.forEach((p, j) => { if (j < parts.length - 1) lines.push({items:[p], w:p.w}); else L = {items:[p], w:p.w}; });
      continue;
    }
    L.w += gap + at.w; L.items.push(at);
  }
  if (L.items.length || !lines.length) lines.push(L);
  return lines;
}
function placeLine(line){
  const segs = [];
  let x = 0;
  line.items.forEach((at, idx) => {
    if (idx > 0){
      const prev = line.items[idx - 1];
      if (prev.sp > 0){ segs.push({s:' ', r:prev.spR, x, w:prev.sp}); x += prev.sp; }
    }
    at.segs.forEach(sg => { segs.push({s:sg.s, r:sg.r, x, w:sg.w}); x += sg.w; });
  });
  const out = [];
  segs.forEach(sg => {
    const last = out[out.length - 1];
    if (last && last.r === sg.r){ last.s += sg.s; last.w += sg.w; }
    else out.push({s:sg.s, r:sg.r, x:sg.x, w:sg.w});
  });
  return out;
}
function layoutText(el){
  const boxW = el.w * PT, boxH = el.h * PT;
  const lines = [];
  let y = 0;
  el.paras.forEach((p, pi) => {
    const ind = p.bullet || 0;
    const avail = boxW - ind;
    const atoms = atomize(p.runs);
    const built = atoms.length ? buildLines(atoms, avail) : [{items:[], w:0}];
    const mult = p.mult || 1;
    built.forEach((ln, li) => {
      const segs = placeLine(ln);
      let asc = 0, desc = 0;
      const rs = segs.length ? segs.map(s => s.r) : [p.runs[0] || {size:12}];
      rs.forEach(r => { const k = r.f === 'h' ? VM.head : VM.body; asc = Math.max(asc, r.size * k.asc); desc = Math.max(desc, r.size * k.desc); });
      const lh = (asc + desc) * mult;
      const al = p.align || 'left';
      const off = al === 'center' ? (avail - ln.w) / 2 : al === 'right' ? (avail - ln.w) : 0;
      lines.push({base: y + lh - desc, top: y, lh, asc, desc, x: ind + off, w: ln.w, segs, bullet: (p.bullet && li === 0) ? (p.runs[0] || null) : null});
      y += lh;
    });
    if (pi < el.paras.length - 1) y += (p.after || 0);
  });
  const va = el.valign || 'top';
  const dy = va === 'middle' ? (boxH - y) / 2 : va === 'bottom' ? (boxH - y) : 0;
  lines.forEach(l => { l.base += dy; l.top += dy; });
  return {lines, h:y, dy};
}
/* Text floor: fit() never shrinks a run below TEXT_FLOOR points (about 11 px on a 1200 px-wide slide).
   Text that still does not fit on its single line is shortened with an ellipsis rather than shrunk further;
   el._fits / el._cut record the outcome so layouts can be tested. */
const TEXT_FLOOR = 9;
function fit(el, o){
  o = o || {};
  const base = el.paras.map(p => p.runs.map(r => r.size));
  const min = o.min || 0.62;
  const floor = o.floor != null ? o.floor : TEXT_FLOOR;
  const ok = L => (!o.lines || L.lines.length <= o.lines) && (o.box === false || L.h <= el.h * PT + 0.5);
  let scale = 1, L = layoutText(el), sig = '';
  for (let k = 0; k < 60 && !ok(L) && scale > min; k++){
    scale = Math.max(min, scale - 0.025);
    let s2 = '';
    el.paras.forEach((p, i) => p.runs.forEach((r, j) => {
      const b = base[i][j];
      r.size = b <= floor ? b : Math.max(floor, Math.round(b * scale * 4) / 4);
      s2 += r.size + ',';
    }));
    if (s2 === sig) break;
    sig = s2;
    L = layoutText(el);
  }
  el._scale = scale;
  el._fits = ok(L);
  if (!el._fits && o.lines === 1 && o.ellipsis !== false) truncateToFit(el, ok);
  return el;
}
/* Shortens the last run(s) of a one-line element, word by word then letter by letter, and adds an ellipsis. */
function truncateToFit(el, ok){
  const runs = [].concat(...el.paras.map(p => p.runs));
  const body = x => String(x.s == null ? '' : x.s).replace(/…$/, '');
  for (let guard = 0; guard < 400; guard++){
    let idx = -1;
    for (let i = runs.length - 1; i >= 0; i--){ if (body(runs[i]).trim().length){ idx = i; break; } }
    if (idx < 0) break;
    const r = runs[idx];
    let s = body(r);
    const cut = s.replace(/\s*\S+\s*$/, '');
    s = (cut.trim().length >= 3 && cut.length < s.length - 1) ? cut : s.slice(0, -1);
    s = s.replace(/[\s,·:;(–-]+$/, '');
    if (!s.trim().length){ r.s = ''; continue; }
    r.s = s + '…';
    if (ok(layoutText(el))){ el._fits = true; break; }
  }
  el._cut = true;
}
function textHeight(el){ return layoutText(el).h / PT; }

/* ---------- Scene builders ---------- */
function run(s, o){ return Object.assign({s}, o || {}); }
function para(runs, o){ return Object.assign({runs: Array.isArray(runs) ? runs : [runs]}, o || {}); }
function T(x, y, w, h, content, o){
  o = o || {};
  const style = {size:o.size || 12, c:o.c || '1A2240'};
  ['b','i','f','cs','link','u'].forEach(k => { if (o[k] != null) style[k] = o[k]; });
  let paras;
  const mk = (r) => typeof r === 'string' ? Object.assign({s:r}, style) : Object.assign({}, style, r);
  if (typeof content === 'string') paras = content.split('\n').map(line => ({runs:[mk(line)]}));
  else if (Array.isArray(content) && content.length && content[0] && content[0].runs) paras = content.map(p => Object.assign({}, p, {runs:p.runs.map(mk)}));
  else if (Array.isArray(content)) paras = [{runs:content.map(mk)}];
  else paras = [{runs:[mk(content)]}];
  paras.forEach(p => {
    if (o.align && !p.align) p.align = o.align;
    if (o.after != null && p.after == null) p.after = o.after;
    if (o.mult && !p.mult) p.mult = o.mult;
    if (o.bullet && p.bullet == null) p.bullet = o.bullet;
  });
  return {t:'text', x, y, w, h, valign:o.valign || 'top', paras};
}
const RECT = (x, y, w, h, fill, o) => Object.assign({t:'rect', x, y, w, h, fill}, o || {});
const RRECT = (x, y, w, h, fill, r, o) => Object.assign({t:'rect', x, y, w, h, fill, r: r == null ? 0.12 : r}, o || {});
const OVAL = (x, y, w, h, fill, o) => Object.assign({t:'oval', x, y, w, h, fill}, o || {});
const LINE = (x1, y1, x2, y2, c, w, dash) => ({t:'line', x1, y1, x2, y2, c, w:w || 1, dash:!!dash});
const CHEV = (x, y, w, h, fill) => ({t:'chev', x, y, w, h, fill});
const IMGEL = (k, x, y, w, h) => ({t:'img', k, x, y, w, h});
const HIT = {go:1, href:1, attach:1};
const GO = (x, y, w, h, to, tip, r) => ({t:'go', x, y, w, h, to, tip:tip || '', r:r || 0});
const HREF = (x, y, w, h, url, tip, r) => ({t:'href', x, y, w, h, url, tip:tip || '', r:r || 0});
const paintOrder = els => els.filter(e => !HIT[e.t]).concat(els.filter(e => HIT[e.t]));

/* Extracts all interactive hotspots (both GO internal slide jumps and HREF / inline text hyperlinks) in inches */
function extractHotspots(slide){
  const spots = [];
  slide.els.forEach(el => {
    if (el.t === 'go'){
      spots.push({t:'go', x:el.x, y:el.y, w:el.w, h:el.h, to:el.to, tip:el.tip || '', toc:!!el.toc});
    } else if (el.t === 'href'){
      spots.push({t:'href', x:el.x, y:el.y, w:el.w, h:el.h, url:el.url, tip:el.tip || ''});
    } else if (el.t === 'text'){
      const L = layoutText(el);
      const X0 = el.x * PT, Y0 = el.y * PT;
      L.lines.forEach(line => {
        const by = Y0 + line.base;
        line.segs.forEach(sg => {
          const r = sg.r;
          if (r.link){
            const xPt = X0 + line.x + sg.x;
            const twPt = Math.max(8, sg.w - (/ $/.test(sg.s) ? measure(r, ' ') : 0));
            const yPt = by - r.size * 0.9;
            const hPt = r.size * 1.15;
            spots.push({
              t:'href',
              x: Math.round((xPt / PT) * 1000) / 1000,
              y: Math.round((yPt / PT) * 1000) / 1000,
              w: Math.round((twPt / PT) * 1000) / 1000,
              h: Math.round((hPt / PT) * 1000) / 1000,
              url: r.link,
              tip: sg.s || r.link
            });
          }
        });
      });
    }
  });
  return spots;
}

/* ---------- SVG (preview & rasterizer) ---------- */
const f2 = n => (Math.round(n * 100) / 100).toString();
const xmlEsc = s => String(s).replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
function svgFont(r){
  const fk = runFace(r);
  const fam = fk === 'HB' ? 'VIHead' : 'VIBody';
  const wt = (fk === 'BB' || fk === 'BBI' || fk === 'HB') ? 700 : 400;
  const st = (fk === 'BI' || fk === 'BBI') ? 'italic' : 'normal';
  return `font-family="${fam}" font-weight="${wt}" font-style="${st}" font-size="${f2(r.size)}" fill="#${r.c}"` + (r.cs ? ` letter-spacing="${f2(r.cs)}"` : '');
}
function svgEl(el, opts){
  const X = v => f2(v * PT);
  switch (el.t){
    case 'rect': {
      const r = el.r ? Math.min(el.r * PT, el.w * PT / 2, el.h * PT / 2) : 0;
      const stroke = el.line ? ` stroke="#${el.line.c}" stroke-width="${f2(el.line.w || 0.75)}"` + (el.line.dash ? ` stroke-dasharray="${f2(4 * (el.line.w || 1))} ${f2(3 * (el.line.w || 1))}"` : '') : '';
      return `<rect x="${X(el.x)}" y="${X(el.y)}" width="${X(el.w)}" height="${X(el.h)}"${r ? ` rx="${f2(r)}"` : ''} fill="${el.fill ? '#' + el.fill : 'none'}"${stroke}/>`;
    }
    case 'oval':
      return `<ellipse cx="${f2((el.x + el.w / 2) * PT)}" cy="${f2((el.y + el.h / 2) * PT)}" rx="${f2(el.w * PT / 2)}" ry="${f2(el.h * PT / 2)}" fill="${el.fill ? '#' + el.fill : 'none'}"${el.line ? ` stroke="#${el.line.c}" stroke-width="${f2(el.line.w || 0.75)}"` : ''}/>`;
    case 'line':
      return `<line x1="${X(el.x1)}" y1="${X(el.y1)}" x2="${X(el.x2)}" y2="${X(el.y2)}" stroke="#${el.c}" stroke-width="${f2(el.w)}"${el.dash ? ` stroke-dasharray="${f2(4 * el.w)} ${f2(3 * el.w)}"` : ''}/>`;
    case 'chev': {
      const x = el.x * PT, y = el.y * PT, w = el.w * PT, h = el.h * PT, d = Math.min(w, h) * 0.5;
      const pts = [[x, y], [x + w - d, y], [x + w, y + h / 2], [x + w - d, y + h], [x, y + h], [x + d, y + h / 2]];
      return `<polygon points="${pts.map(p => f2(p[0]) + ',' + f2(p[1])).join(' ')}" fill="#${el.fill}"/>`;
    }
    case 'img':
      return `<image href="${IMG_URL[el.k] || IMG[el.k].src}" x="${X(el.x)}" y="${X(el.y)}" width="${X(el.w)}" height="${X(el.h)}" preserveAspectRatio="none"/>`;
    case 'text': return svgText(el, opts);
    case 'go': case 'href': {
      if (opts && opts.links === false) return '';
      const r = el.r ? ` rx="${f2(Math.min(el.r * PT, el.w * PT / 2, el.h * PT / 2))}"` : '';
      const box = `<title>${xmlEsc(el.tip)}</title><rect class="hit" x="${X(el.x)}" y="${X(el.y)}" width="${X(el.w)}" height="${X(el.h)}"${r} fill="#2254F6" fill-opacity="0.001" stroke="#2254F6" stroke-opacity="0" stroke-width="2" pointer-events="all" style="pointer-events:all;cursor:pointer"/>`;
      const lab = ` aria-label="${xmlEsc(el.tip)}"`;
      if (el.t === 'go') return `<a href="#slide-${el.to + 1}" xlink:href="#slide-${el.to + 1}" data-go="${el.to + 1}" class="hit-a"${lab}>${box}</a>`;
      return `<a href="${xmlEsc(el.url)}" xlink:href="${xmlEsc(el.url)}" data-href="${xmlEsc(el.url)}" target="_blank" rel="noopener noreferrer" class="hit-a"${lab}>${box}</a>`;
    }
  }
  return '';
}
function svgText(el, opts){
  const links = !(opts && opts.links === false);
  const L = layoutText(el);
  const X0 = el.x * PT, Y0 = el.y * PT;
  let o = '';
  L.lines.forEach(line => {
    const by = Y0 + line.base;
    if (line.bullet){
      const r = Object.assign({}, line.bullet, {b:false, i:false, f:null, cs:0});
      o += `<text x="${f2(X0)}" y="${f2(by)}" ${svgFont(r)}>●</text>`;
    }
    line.segs.forEach(sg => {
      const r = sg.r, x = X0 + line.x + sg.x;
      let t = `<text x="${f2(x)}" y="${f2(by)}" ${svgFont(r)} xml:space="preserve">${xmlEsc(sg.s)}</text>`;
      if (r.link || r.u){
        const tw = sg.w - (/ $/.test(sg.s) ? measure(r, ' ') : 0);
        t += `<rect x="${f2(x)}" y="${f2(by + r.size * 0.06)}" width="${f2(Math.max(0, tw))}" height="${f2(Math.max(0.5, r.size * 0.06))}" fill="#${r.c}"/>`;
      }
      if (r.link && links){
        const tw = Math.max(4, sg.w - (/ $/.test(sg.s) ? measure(r, ' ') : 0));
        const hitRect = `<rect class="ext-hit" x="${f2(x)}" y="${f2(by - r.size * 0.9)}" width="${f2(tw)}" height="${f2(r.size * 1.15)}" fill="#2254F6" fill-opacity="0.001" pointer-events="all" style="pointer-events:all;cursor:pointer"/>`;
        t = `<a href="${xmlEsc(r.link)}" xlink:href="${xmlEsc(r.link)}" data-href="${xmlEsc(r.link)}" target="_blank" rel="noopener noreferrer" class="ext-a">${hitRect}${t}</a>`;
      }
      o += t;
    });
  });
  return o;
}
/* opts.links === false: no SVG links (web views lay HTML links over the slide instead, see VI.mountLinks) */
function slideSVG(slide, label, opts){
  /* role=group (not img) so screen readers can reach the real text inside each slide */
  let o = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 960 540" class="slide-svg" role="group" aria-roledescription="slide" aria-label="${xmlEsc(label || 'Slide')}"><rect width="960" height="540" fill="#${slide.bg}"/>`;
  paintOrder(slide.els).forEach(el => { o += svgEl(el, opts); });
  return o + '</svg>';
}
/* Reading-order plain text of a slide (used for accessibility transcripts and tests). */
function slidePlainText(slide){
  const out = [];
  slide.els.forEach(el => {
    if (el.t !== 'text') return;
    const t = el.paras.map(p => p.runs.map(r => r.s).join('')).join(' ').replace(/\s+/g, ' ').trim();
    if (t) out.push(t);
  });
  return out.join('\n');
}

/* ---------- Export helpers: embedded fonts, rasterising, PowerPoint and PDF ---------- */
function getEmbeddedFontCss(){
  return [['B',400,'normal','VIBody'],['BB',700,'normal','VIBody'],['BI',400,'italic','VIBody'],['BBI',700,'italic','VIBody'],['HB',700,'normal','VIHead']]
    .map(([k, w, s, f]) => "@font-face{font-family:'" + f + "';src:url(data:font/ttf;base64," + FONT_FILES[k] + ") format('truetype');font-weight:" + w + ";font-style:" + s + ";}").join('\n');
}
function svgToStandaloneRasterSvg(rawSvg, fontCss, imgDict, w, h){
  let s = rawSvg;
  Object.keys(imgDict).forEach(k => {
    const src = imgDict[k].src || imgDict[k];
    if (typeof IMG_URL !== 'undefined' && IMG_URL[k]){
      s = s.split('href="' + IMG_URL[k] + '"').join('href="' + src + '"');
    }
    s = s.split('data-vi-img="' + k + '"').join('href="' + src + '"');
  });
  s = s.replace('<svg ', '<svg width="' + (w || 1920) + '" height="' + (h || 1080) + '" ');
  s = s.replace(/(<svg[^>]*>)/, '$1<defs><style>' + fontCss + '</style></defs>');   // after the opening tag, whatever its attributes
  return s;
}
/* Draws an SVG string onto a canvas and returns it as PNG and/or JPEG data URLs. */
function rasterizeSvg(svgMarkup, w, h, types){
  types = types || ['png'];
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'sync';
    const url = URL.createObjectURL(new Blob([svgMarkup], {type: 'image/svg+xml;charset=utf-8'}));
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = w || 1920; canvas.height = h || 1080;
        const g = canvas.getContext('2d');
        g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, canvas.width, canvas.height);
        g.drawImage(img, 0, 0, canvas.width, canvas.height);
        const out = {};
        if (types.includes('png')) out.png = canvas.toDataURL('image/png');
        if (types.includes('jpeg')) out.jpeg = canvas.toDataURL('image/jpeg', 0.9);
        URL.revokeObjectURL(url);
        resolve(out);
      } catch (err) { URL.revokeObjectURL(url); reject(err); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to rasterise slide')); };
    img.src = url;
  });
}
function rasterizeSvgToPng(svgMarkup, w, h){ return rasterizeSvg(svgMarkup, w, h, ['png']).then(r => r.png); }
const dataUrlBytes = u => Math.round((u.length - u.indexOf(',') - 1) * 3 / 4);

/* Image-based PowerPoint: each slide is one picture plus invisible link shapes over every hotspot.
   Each picture is stored as PNG or JPEG, whichever is smaller (photos compress far better as JPEG). */
async function buildImagePptx(slides, meta, onProgress, opts){
  opts = opts || {};
  const W = opts.width || 1920;
  const pres = new window.PptxGenJS();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = meta.title;
  pres.author = meta.author;
  pres.subject = meta.subject;
  pres.company = 'Vertical Institute';
  const SH_ = pres.shapes;
  const fontCss = getEmbeddedFontCss();
  let bytes = 0;
  for (let i = 0; i < slides.length; i++){
    const sl = slides[i];
    if (onProgress) onProgress(i + 1, slides.length);
    const rawSvg = slideSVG(sl, (sl.num || i + 1) + '. ' + sl.name);
    const w = sl.hidden ? Math.round(W * 5 / 6) : W, h = Math.round(w * 9 / 16);   // hidden calculator views at 1600 px keep the file smaller
    const r = await rasterizeSvg(svgToStandaloneRasterSvg(rawSvg, fontCss, IMG, w, h), w, h, ['png', 'jpeg']);
    const pick = dataUrlBytes(r.png) <= dataUrlBytes(r.jpeg) * 1.15 ? r.png : r.jpeg;
    bytes += dataUrlBytes(pick);
    const s = pres.addSlide();
    s.background = {color: sl.bg};
    if (sl.hidden || sl.detail) s.hidden = true;   // calculator views and (v6) detail slides open from their buttons in Slide Show
    s.addImage({data: pick, x: 0, y: 0, w: SW, h: SH, altText: slidePlainText(sl).slice(0, 1500)});
    const spots = sl.hotspots || extractHotspots(sl);
    spots.forEach((sp, idx) => {
      if (sp.t === 'go' && sp.to != null && sp.to >= 0 && sp.to < slides.length){
        s.addShape(SH_.RECTANGLE, {x: sp.x, y: sp.y, w: sp.w, h: sp.h, fill: {color: 'FFFFFF', transparency: 100}, line: {type: 'none'},
          objectName: 'HotspotSlide_' + (sp.to + 1) + '_' + idx, hyperlink: {slide: sp.to + 1, tooltip: sp.tip || ('Go to slide ' + (sp.to + 1))}});
      } else if (sp.t === 'href' && sp.url){
        s.addShape(SH_.RECTANGLE, {x: sp.x, y: sp.y, w: sp.w, h: sp.h, fill: {color: 'FFFFFF', transparency: 100}, line: {type: 'none'},
          objectName: 'HotspotUrl_' + idx, hyperlink: {url: sp.url, tooltip: sp.tip || sp.url}});
      }
    });
  }
  const buf = await pres.write({outputType:'arraybuffer'});
  return new Blob([buf], {type:'application/vnd.openxmlformats-officedocument.presentationml.presentation'});
}

/* Vector PDF straight from the slide scene graph: real, selectable text in the embedded fonts, crisp shapes,
   and working links (Contents, back buttons, course pages, email). Needs jsPDF (window.jspdf). */
const PDF_FONTS = {B:['VIBody','normal'], BB:['VIBody','bold'], BI:['VIBody','italic'], BBI:['VIBody','bolditalic'], HB:['VIHead','bold']};
function pdfDrawSlide(pdf, slide, pageOf){
  const P = v => v * PT;
  const hex = c => '#' + String(c || '000000').replace('#', '');
  const style = el => (el.fill && el.line) ? 'FD' : el.fill ? 'F' : 'S';
  const setLine = ln => {
    pdf.setDrawColor(hex(ln.c)); pdf.setLineWidth(ln.w || 0.75);
    pdf.setLineDashPattern(ln.dash ? [4 * (ln.w || 1), 3 * (ln.w || 1)] : [], 0);
  };
  pdf.setFillColor(hex(slide.bg)); pdf.rect(0, 0, 960, 540, 'F');
  paintOrder(slide.els).forEach(el => {
    switch (el.t){
      case 'rect': {
        if (!el.fill && !el.line) return;
        if (el.fill) pdf.setFillColor(hex(el.fill));
        if (el.line) setLine(el.line);
        const r = el.r ? Math.min(P(el.r), P(el.w) / 2, P(el.h) / 2) : 0;
        if (r > 0.01) pdf.roundedRect(P(el.x), P(el.y), P(el.w), P(el.h), r, r, style(el));
        else pdf.rect(P(el.x), P(el.y), P(el.w), P(el.h), style(el));
        if (el.line) pdf.setLineDashPattern([], 0);
        return;
      }
      case 'oval':
        if (el.fill) pdf.setFillColor(hex(el.fill));
        if (el.line) setLine(el.line);
        pdf.ellipse(P(el.x + el.w / 2), P(el.y + el.h / 2), P(el.w) / 2, P(el.h) / 2, style(el));
        return;
      case 'line':
        setLine({c: el.c, w: el.w, dash: el.dash});
        pdf.line(P(el.x1), P(el.y1), P(el.x2), P(el.y2));
        pdf.setLineDashPattern([], 0);
        return;
      case 'chev': {
        const x = P(el.x), y = P(el.y), w = P(el.w), h = P(el.h), d = Math.min(w, h) * 0.5;
        const pts = [[x, y], [x + w - d, y], [x + w, y + h / 2], [x + w - d, y + h], [x, y + h], [x + d, y + h / 2]];
        const rel = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]);
        pdf.setFillColor(hex(el.fill));
        pdf.lines(rel, pts[0][0], pts[0][1], [1, 1], 'F', true);
        return;
      }
      case 'img': {
        const im = IMG[el.k];
        pdf.addImage(im.src, im.type, P(el.x), P(el.y), P(el.w), P(el.h), 'vi_' + el.k, 'FAST');
        return;
      }
      case 'text': {
        const L = layoutText(el);
        const X0 = P(el.x), Y0 = P(el.y);
        L.lines.forEach(line => {
          const by = Y0 + line.base;
          if (line.bullet){
            const r = line.bullet;
            pdf.setFont('VIBody', 'normal'); pdf.setFontSize(r.size); pdf.setTextColor(hex(r.c));
            pdf.text('●', X0, by, {baseline:'alphabetic'});
          }
          line.segs.forEach(sg => {
            const r = sg.r, x = X0 + line.x + sg.x;
            const f = PDF_FONTS[runFace(r)];
            pdf.setFont(f[0], f[1]); pdf.setFontSize(r.size); pdf.setTextColor(hex(r.c));
            if (sg.s.trim()) pdf.text(sg.s, x, by, {baseline:'alphabetic', charSpace: r.cs || 0});
            const tw = sg.w - (/ $/.test(sg.s) ? measure(r, ' ') : 0);
            if (r.link || r.u){ pdf.setFillColor(hex(r.c)); pdf.rect(x, by + r.size * 0.06, Math.max(0, tw), Math.max(0.5, r.size * 0.06), 'F'); }
            if (r.link) pdf.link(x, by - r.size * 0.9, Math.max(4, tw), r.size * 1.15, {url: r.link});
          });
        });
        return;
      }
      case 'go': {
        const page = pageOf(el.to);
        if (page) pdf.link(P(el.x), P(el.y), P(el.w), P(el.h), {pageNumber: page});
        return;
      }
      case 'href':
        pdf.link(P(el.x), P(el.y), P(el.w), P(el.h), {url: el.url});
        return;
    }
  });
}
async function buildVectorPdf(slides, meta, onProgress){
  const {jsPDF} = window.jspdf;
  const pdf = new jsPDF({orientation:'landscape', unit:'pt', format:[960, 540], compress:true, putOnlyUsedFonts:true});
  Object.keys(PDF_FONTS).forEach(k => {
    pdf.addFileToVFS('vi-' + k + '.ttf', FONT_FILES[k]);
    pdf.addFont('vi-' + k + '.ttf', PDF_FONTS[k][0], PDF_FONTS[k][1]);
  });
  const pageOf = to => (to != null && to >= 0 && to < slides.length) ? to + 1 : 0;
  for (let i = 0; i < slides.length; i++){
    if (onProgress) onProgress(i + 1, slides.length);
    if (i) pdf.addPage([960, 540], 'landscape');
    pdfDrawSlide(pdf, slides[i], pageOf);
    if (i % 4 === 3) await new Promise(r => setTimeout(r, 0));
  }
  pdf.setProperties({title: meta.title, subject: meta.subject, author: meta.author, creator: 'Vertical Institute proposal builder'});
  return pdf.output('blob');
}

