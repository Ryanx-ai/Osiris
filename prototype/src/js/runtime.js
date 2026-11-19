
/* =====================================================================
   SHARED RUNTIME (builder preview and hosted web deck)
   Fonts and images, the native controls laid over drawn selectors,
   on-demand views of the funding and calculator slides, and exports.
   ===================================================================== */
const VI = (() => {
  let assetsReady = false;
  function initAssets(){
    if (assetsReady) return;
    assetsReady = true;
    const css = [['B',400,'normal','VIBody'],['BB',700,'normal','VIBody'],['BI',400,'italic','VIBody'],['BBI',700,'italic','VIBody'],['HB',700,'normal','VIHead']]
      .map(([k, w, s, f]) => "@font-face{font-family:'" + f + "';src:url(data:font/ttf;base64," + FONT_FILES[k] + ") format('truetype');font-weight:" + w + ';font-style:' + s + ';font-display:block}').join('\n');
    const st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    Object.keys(IMG).forEach(k => {
      try {
        const [h, b64] = IMG[k].src.split(',');
        const bin = atob(b64), u8 = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        IMG_URL[k] = URL.createObjectURL(new Blob([u8], {type: h.slice(5).split(';')[0]}));
      } catch (e) { IMG_URL[k] = IMG[k].src; }
    });
  }

  /* Native <select>/<button> elements laid over a slide's drawn selectors (slide.controls, in inches). */
  function mountControls(frameEl, slide, onPick){
    frameEl.querySelectorAll('.vi-ctl').forEach(el => el.remove());
    (slide.controls || []).forEach(c => {
      const wrap = document.createElement('span');
      wrap.className = 'vi-ctl vi-ctl-' + c.kind;
      Object.assign(wrap.style, {left: (c.x / SW * 100) + '%', top: (c.y / SH * 100) + '%', width: (c.w / SW * 100) + '%', height: (c.h / SH * 100) + '%'});
      let el;
      if (c.kind === 'select'){
        el = document.createElement('select');
        const groups = {};
        c.options.forEach(o => {
          const op = document.createElement('option'); op.value = o.value; op.textContent = o.label;
          if (o.disabled) op.disabled = true;
          let parent = el;
          if (o.group){
            if (!groups[o.group]){ groups[o.group] = document.createElement('optgroup'); groups[o.group].label = o.group; el.appendChild(groups[o.group]); }
            parent = groups[o.group];
          }
          parent.appendChild(op);
        });
        el.value = c.value;
        el.addEventListener('change', e => { e.stopPropagation(); onPick(c.id, el.value); });
      } else {
        el = document.createElement('button');
        el.type = 'button';
        el.disabled = c.enabled === false;
        el.addEventListener('click', e => { e.stopPropagation(); onPick(c.id, null); });
      }
      el.setAttribute('aria-label', c.label);
      el.title = c.label;
      el.addEventListener('click', e => e.stopPropagation());
      wrap.appendChild(el);
      frameEl.appendChild(wrap);
    });
  }
  /* Turns a control pick into the next view of that slide. */
  function pickCalc(deck, uenObj, view, id, value){
    const v = Object.assign({}, view || {});
    if (id === 'calcCourse'){ v.cKey = value; delete v.pax; delete v.mk; }
    else if (id === 'calcPax' || id === 'calcMinus' || id === 'calcPlus'){
      if (id === 'calcPax' && value === 'mix') return v;
      if (id === 'calcPax' && (value === '' || value == null)){ delete v.mk; delete v.pax; delete v.rate; return v; }
      const ctx = deck.ctx;
      const plan = calcView(ctx, v, uenObj).plan;
      const step = id === 'calcPlus' ? 1 : id === 'calcMinus' ? -1 : 0;
      // A cohort the client has mixed (or set per course) keeps its mix; otherwise everyone moves together
      if (planMixed(ctx, plan) || (!plan.uniform && (step || v.mk))){
        const mk = Object.assign({}, v.mk || {});
        plan.lines.forEach(l => { mk[l.c.cKey] = resizeMakeup(l.mk, step ? Math.max(1, l.qty + step) : +value, v.rate != null ? v.rate : defaultRate(ctx)); });
        v.mk = mk; delete v.pax;
      } else {
        v.pax = step ? Math.max(1, plan.lines[0].qty + step) : +value;
        delete v.mk;
      }
    }
    return v;
  }
  function applyPick(deck, idx, view, id, value){
    const base = deck.slides[idx] || {};
    if (base.sched){
      // Training schedule: a new course starts from its own headcount and default number of days; class hours stay
      const v = Object.assign({}, view || {});
      if (id === 'schedCourse' || id.indexOf('schedK:') === 0){ v.k = id === 'schedCourse' ? value : id.slice(7); delete v.n; delete v.pax; delete v.dates; }
      else if (id === 'schedPax') v.pax = Math.max(1, Math.round(+value) || 1);
      else if (id === 'schedSessions') v.n = +value;
      else if (/^schedN\d+$/.test(id)) v.n = +id.slice(6);
      return v;
    }
    if (id === 'fundCourse' || id === 'fundGroup'){
      const v = Object.assign({}, view || {});
      if (id === 'fundCourse') v.cKey = value; else v.gIdx = +value;
      return v;
    }
    // Switching entity keeps every entity's own figures in view.byUen
    if (id === 'calcUen') return Object.assign({}, view || {}, {uen:value});
    if (base.uenSwitch){
      const sc = calcScope(deck.ctx, base, view);
      if (sc.all) return view || {};   // the combined view has nothing to change but the entity
      return calcWithSub(base, view, sc.id, pickCalc(deck, sc.uenObj, sc.sub, id, value));
    }
    return pickCalc(deck, base.uenObj || null, view, id, value);
  }

  /* ---------- Links and slide jumps as real HTML elements over the slide (slide.hotspots, in inches) ----------
     Sites that embed the deck can ignore or intercept clicks on links drawn inside an SVG, so every web view draws the
     slide without them and lays these over it: buttons for jumps within the deck, and ordinary links for course pages,
     email and the website (web pages open in a new tab). */
  const HOT_CSS = [
    '.vi-hot{position:absolute;z-index:5;display:block;margin:0;padding:0;min-height:0;border:0;background:transparent;cursor:pointer;border-radius:6px;-webkit-tap-highlight-color:rgba(34,84,246,.18)}',
    '.vi-hot:hover{background:rgba(34,84,246,.07);box-shadow:0 0 0 2px rgba(34,84,246,.35)}',
    '.vi-hot:focus-visible{outline:3px solid #2254F6;outline-offset:2px}',
    '@media print{.vi-hot{display:none!important}}'
  ].join('\n');
  let hotCssOn = false;
  function mountLinks(frameEl, slide, onGo, deck){
    frameEl.querySelectorAll('.vi-hot').forEach(el => el.remove());
    const spots = slide ? (slide.hotspots || extractHotspots(slide)) : [];
    if (!spots.length) return;
    if (!hotCssOn){ hotCssOn = true; const st = document.createElement('style'); st.textContent = HOT_CSS; document.head.appendChild(st); }
    spots.forEach(sp => {
      let el;
      if (sp.t === 'go'){
        if (!(sp.to >= 0) || !onGo) return;
        el = document.createElement('button');
        el.type = 'button';
        if (sp.toc && deck){
          // Live decks: the Contents button opens a side panel, so the reader stays on this slide
          el.setAttribute('aria-haspopup', 'dialog');
          el.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openToc(deck, (slide.num || 1) - 1, onGo, el); });
        } else el.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); onGo(sp.to); });
      } else if (sp.t === 'href' && sp.url){
        el = document.createElement('a');
        el.href = sp.url;
        if (/^https?:/i.test(sp.url)){ el.target = '_blank'; el.rel = 'noopener noreferrer'; }
        // the browser follows the link itself; nothing else on the page should handle this click
        el.addEventListener('click', e => e.stopPropagation());
      } else return;
      el.className = 'vi-hot vi-hot-' + sp.t;
      el.setAttribute('aria-label', sp.toc && deck ? 'Open contents' : (sp.tip || (sp.t === 'go' ? 'Go to slide ' + (sp.to + 1) : sp.url)));
      Object.assign(el.style, {left:(sp.x / SW * 100) + '%', top:(sp.y / SH * 100) + '%', width:(sp.w / SW * 100) + '%', height:(sp.h / SH * 100) + '%'});
      frameEl.appendChild(el);
    });
  }


  /* ---------- Contents side panel (live decks): every slide, grouped as on the Contents slide; pick one to jump there ---------- */
  const TOC_CSS = [
    '.vi-toc-back{position:fixed;inset:0;z-index:95;background:rgba(16,22,48,.28)}',
    '.vi-toc{position:fixed;z-index:96;top:0;right:0;bottom:0;width:min(380px,calc(100vw - 32px));display:flex;flex-direction:column;background:#FFFFFF;color:#1A2240;box-shadow:-18px 0 44px rgba(12,16,32,.28);font-family:inherit;animation:viTocIn .18s ease-out}',
    '@keyframes viTocIn{from{transform:translateX(24px);opacity:0}to{transform:none;opacity:1}}',
    '@media (prefers-reduced-motion:reduce){.vi-toc{animation:none}}',
    '.vi-toc *{box-sizing:border-box}',
    '.vi-toc-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 16px 12px 20px;border-bottom:1px solid #DDE2F0}',
    '.vi-toc-head h3{margin:0;font:700 19px/1.2 VIHead,Georgia,serif;color:#1A2240}',
    '.vi-toc-head p{margin:2px 0 0;font-size:12.5px;color:#5A6384}',
    '.vi-toc-x{flex:none;width:36px;height:36px;min-height:0;border:0;border-radius:9px;background:#EEF1FD;color:#1A2A6C;cursor:pointer;display:grid;place-items:center;padding:0}',
    '.vi-toc-x:hover{background:#DCE3FA}',
    '.vi-toc-x svg{width:15px;height:15px}',
    '.vi-toc-body{flex:1;overflow:auto;overscroll-behavior:contain;padding:6px 12px 16px}',
    '.vi-toc-g{margin:14px 8px 6px;font-size:11px;font-weight:700;letter-spacing:.12em;color:#0055FF}',
    '.vi-toc-i{display:flex;align-items:center;gap:12px;width:100%;min-height:0;margin:0 0 4px;padding:9px 10px;border:1px solid transparent;border-radius:10px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}',
    '.vi-toc-i:hover{background:#F6F7FB;border-color:#DDE2F0}',
    '.vi-toc-i:focus-visible{outline:3px solid #2254F6;outline-offset:1px}',
    '.vi-toc-i .n{flex:none;width:26px;height:26px;border-radius:50%;background:#0055FF;color:#FFFFFF;font-size:12px;font-weight:700;display:grid;place-items:center}',
    '.vi-toc-i b{display:block;font-size:14px;line-height:1.3;color:#1A2240}',
    '.vi-toc-i small{display:block;font-size:12px;line-height:1.35;color:#5A6384;margin-top:1px}',
    '.vi-toc-i.is-cur{background:#E7EBFC;border-color:#C9D2F2}',
    '.vi-toc-i.is-cur .n{background:#1A2A6C}',
    '.vi-toc-i .here{flex:none;margin-left:auto;font-size:11px;font-weight:700;color:#1A2A6C;letter-spacing:.04em}',
    '.vi-toc-foot{padding:10px 20px 14px;border-top:1px solid #DDE2F0}',
    '.vi-toc-foot button{min-height:0;border:0;background:none;padding:4px 0;color:#2F4DC4;font:inherit;font-size:13px;font-weight:700;text-decoration:underline;text-underline-offset:2px;cursor:pointer}',
    '@media print{.vi-toc,.vi-toc-back{display:none!important}}'
  ].join('\n');
  let tocCssOn = false, tocReturn = null;
  function closeToc(){
    document.querySelectorAll('.vi-toc,.vi-toc-back').forEach(el => el.remove());
    document.removeEventListener('keydown', tocKey, true);
    if (tocReturn && document.contains(tocReturn)) { try { tocReturn.focus(); } catch (e) {} }
    tocReturn = null;
  }
  function tocKey(e){ if (e.key === 'Escape'){ e.preventDefault(); closeToc(); } }
  function openToc(deck, cur, onGo, returnEl){
    closeToc();
    if (!tocCssOn){ tocCssOn = true; const st = document.createElement('style'); st.textContent = TOC_CSS; document.head.appendChild(st); }
    tocReturn = returnEl || null;
    const escH = x => String(x == null ? '' : x).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    const main = deck.slides.slice(0, deck.main);
    const row = i => {
      const sl = main[i], t = sl.toc || {}, d = [].concat(t.d || '')[0];
      return '<button type="button" class="vi-toc-i' + (i === cur ? ' is-cur' : '') + '" data-to="' + i + '"' + (i === cur ? ' aria-current="true"' : '') + '><span class="n">' + (i + 1) + '</span><span><b>' + escH(t.t || sl.name) + '</b>' + (d ? '<small>' + escH(d) + '</small>' : '') + '</span>' + (i === cur ? '<span class="here">YOU ARE HERE</span>' : '') + '</button>';
    };
    let h = '';
    const loose = main.map((sl, i) => i).filter(i => !(main[i].toc && TOC_GROUPS.some(g => g[0] === main[i].toc.g)) && i !== deck.tocAt);
    if (loose.length) h += loose.map(row).join('');
    TOC_GROUPS.forEach(([k, label]) => {
      const idx = main.map((sl, i) => i).filter(i => i !== deck.tocAt && main[i].toc && main[i].toc.g === k);
      if (idx.length) h += '<p class="vi-toc-g">' + escH(label) + '</p>' + idx.map(row).join('');
    });
    const back = document.createElement('div'); back.className = 'vi-toc-back';
    const panel = document.createElement('aside');
    panel.className = 'vi-toc'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-labelledby', 'vi-toc-h');
    panel.innerHTML = '<div class="vi-toc-head"><div><h3 id="vi-toc-h">Contents</h3><p>Select a slide to go straight to it.</p></div><button type="button" class="vi-toc-x" aria-label="Close contents"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div>' +
      '<div class="vi-toc-body">' + h + '</div>' +
      (deck.tocAt >= 0 ? '<div class="vi-toc-foot"><button type="button" data-to="' + deck.tocAt + '">Open the full contents slide</button></div>' : '');
    back.addEventListener('click', closeToc);
    panel.querySelector('.vi-toc-x').addEventListener('click', closeToc);
    panel.querySelectorAll('[data-to]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      const to = +b.dataset.to;
      tocReturn = null; closeToc();
      if (to !== cur) onGo(to);
    }));
    panel.addEventListener('click', e => e.stopPropagation());
    document.body.appendChild(back); document.body.appendChild(panel);
    document.addEventListener('keydown', tocKey, true);
    const first = panel.querySelector('.vi-toc-i.is-cur') || panel.querySelector('.vi-toc-i');
    if (first){ first.scrollIntoView({block:'center'}); first.focus({preventScroll:true}); }
  }

  /* ---------- Course overviews: a card beside the course, opened by resting the pointer on it,
     tapping it, or pressing its Overview marker (keyboard). Closed by moving away, Escape or the close button. ---------- */
  const PEEK_CSS = [
    '.vi-peek-spot{position:absolute;z-index:7;display:block;border-radius:999px}',
    '.vi-peek-spot button{position:absolute;inset:0;width:100%;height:100%;min-height:0;opacity:0;cursor:pointer;border:0;margin:0;padding:0;background:transparent}',
    '.vi-peek-spot:hover{box-shadow:0 0 0 2px rgba(34,84,246,.4)}',
    '.vi-peek-spot:focus-within{outline:3px solid #2254F6;outline-offset:2px}',
    '.vi-peek{position:fixed;z-index:90;width:min(360px,calc(100vw - 16px));max-height:calc(100vh - 16px);overflow:auto;overscroll-behavior:contain;background:#FFFFFF;color:#1A2240;border:1px solid #C9D2F2;border-radius:14px;box-shadow:0 18px 44px rgba(12,16,32,.28);font:400 13.5px/1.45 VIBody,Lato,"Segoe UI",system-ui,sans-serif;text-align:left;color-scheme:light}',
    '.vi-peek *{box-sizing:border-box}',
    '.vi-peek-head{position:relative;background:#1A2A6C;color:#FFFFFF;padding:12px 46px 13px 16px}',
    '.vi-peek-tag{display:inline-block;padding:2px 9px;border-radius:999px;background:#A9B8F2;color:#1A2A6C;font-weight:700;font-size:11px;line-height:1.5;letter-spacing:.06em;text-transform:uppercase}',
    '.vi-peek-tag.is-pilot{background:#FFF1C2;color:#8A5A00}',
    '.vi-peek-head h3{margin:7px 0 3px;font:700 17px/1.25 VIHead,Georgia,serif;color:#FFFFFF}',
    '.vi-peek-head p{margin:0;color:#E4E9FB;font-size:13px}',
    '.vi-peek-x{position:absolute;top:8px;right:8px;width:30px;height:30px;min-height:0;border-radius:8px;border:0;background:rgba(255,255,255,.14);color:#FFFFFF;cursor:pointer;display:grid;place-items:center;padding:0}',
    '.vi-peek-x:hover{background:rgba(255,255,255,.26)}',
    '.vi-peek-x svg{width:14px;height:14px}',
    '.vi-peek-body{padding:12px 16px 2px}',
    '.vi-peek-body section{margin:0 0 11px}',
    '.vi-peek-body h4{margin:0 0 3px;font-size:12.5px;font-weight:700;color:#0055FF}',
    '.vi-peek-body p{margin:0}',
    '.vi-peek-body b{font-weight:700}',
    '.vi-peek-body ul{margin:0;padding-left:18px}',
    '.vi-peek-body li{margin:2px 0}',
    '.vi-peek-body li::marker{color:#0055FF}',
    '.vi-peek-body dl{display:grid;grid-template-columns:minmax(0,7.4em) minmax(0,1fr);gap:5px 12px;margin:0 0 12px;padding:10px 12px;background:#EEF1FD;border-radius:10px;font-size:12.5px;line-height:1.4}',
    '.vi-peek-body dt{font-weight:700;color:#5A6384}',
    '.vi-peek-body dd{margin:0;color:#1A2240;font-variant-numeric:tabular-nums}',
    '.vi-peek-foot{padding:0 16px 14px}',
    '.vi-peek-link{display:flex;align-items:center;justify-content:center;gap:8px;min-height:40px;padding:8px 12px;border-radius:9px;background:#2340B8;color:#FFFFFF!important;font-weight:700;font-size:14px;text-decoration:none}',
    '.vi-peek-link:hover{background:#2254F6}',
    'button.vi-peek-link{width:100%;border:0;cursor:pointer;font-family:inherit}',
    '.vi-peek-link.is-quiet{background:#EEF1FD;color:#2340B8!important}',
    '.vi-peek-link.is-quiet:hover{background:#DDE3FB}',
    '.vi-peek-go + .vi-peek-foot,.vi-peek-foot + .vi-peek-foot{padding-top:0}',
    '.vi-peek-link:focus-visible,.vi-peek-x:focus-visible{outline:3px solid #2254F6;outline-offset:2px}',
    '.vi-peek-link svg{width:15px;height:15px;flex:none}',
    '.vi-peek-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
    '.vi-peek-body dl > div{display:contents}',
    '.vi-peek.is-wide{width:min(720px,calc(100vw - 16px))}',
    '.vi-peek.is-wide .vi-peek-head{padding:12px 48px 12px 18px}',
    '.vi-peek.is-wide .vi-peek-body{padding:13px 18px 2px}',
    '.vi-peek-cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 24px}',
    '.vi-peek.is-wide .vi-peek-body dl{grid-template-columns:minmax(0,1fr) minmax(0,1.35fr) minmax(0,1fr) minmax(0,1.3fr) minmax(0,1fr);gap:4px 14px;margin-top:2px}',
    '.vi-peek.is-wide .vi-peek-body dl > div{display:block;min-width:0}',
    '.vi-peek.is-wide .vi-peek-body dt{margin:0 0 2px}',
    '.vi-peek.is-wide .vi-peek-foot{display:flex;justify-content:flex-end;padding:0 18px 14px}',
    '.vi-peek.is-wide .vi-peek-link{padding:8px 20px}',
    '@media (max-width:640px){.vi-peek-cols{grid-template-columns:minmax(0,1fr)}.vi-peek.is-wide .vi-peek-body dl{grid-template-columns:minmax(0,7.4em) minmax(0,1fr);gap:5px 12px}.vi-peek.is-wide .vi-peek-body dl > div{display:contents}.vi-peek.is-wide .vi-peek-foot{display:block}}',
    '@media (prefers-reduced-motion: no-preference){.vi-peek{animation:viPeekIn .14s ease-out}@keyframes viPeekIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}}',
    '@media print{.vi-peek,.vi-peek-spot{display:none!important}}'
  ].join('\n');
  const PEEK_EXT = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M7 3.5H4.3c-.7 0-1.3.6-1.3 1.3v6.9c0 .7.6 1.3 1.3 1.3h6.9c.7 0 1.3-.6 1.3-1.3V9M9.5 2.5h4v4M13.5 2.5 7.5 8.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const PEEK_X = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
  const escH = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let peekCssOn = false, peekOpen = null, peekShowT = 0, peekHideT = 0, peekSeq = 0;
  function peekCss(){
    if (peekCssOn) return;
    peekCssOn = true;
    const st = document.createElement('style');
    st.textContent = PEEK_CSS;
    document.head.appendChild(st);
  }
  function peekHtml(card, id){
    let h = '<div class="vi-peek-head">' + (card.tag ? '<span class="vi-peek-tag' + (card.pilot ? ' is-pilot' : '') + '">' + escH(card.tag) + '</span>' : '') +
      '<button type="button" class="vi-peek-x" aria-label="Close the overview">' + PEEK_X + '</button>' +
      '<h3 id="' + id + '-t">' + escH(card.title) + '</h3>' + (card.lead ? '<p>' + escH(card.lead) + '</p>' : '') + '</div><div class="vi-peek-body">';
    const sec = s => '<section><h4>' + escH(s.h) + '</h4>' + (s.list ? '<ul>' + s.list.map(x => '<li>' + escH(x) + '</li>').join('') + '</ul>'
      : '<p>' + (s.b ? '<b>' + escH(s.b) + '</b> ' : '') + escH(s.p) + '</p>') + '</section>';
    const secs = card.secs || [];
    if (card.wide) h += '<div class="vi-peek-cols"><div>' + secs.filter(s => s.col !== 2).map(sec).join('') + '</div><div>' + secs.filter(s => s.col === 2).map(sec).join('') + '</div></div>';
    else h += secs.map(sec).join('');
    if (card.facts && card.facts.length) h += '<dl>' + card.facts.map(f => '<div><dt>' + escH(f[0]) + '</dt><dd>' + escH(f[1]) + '</dd></div>').join('') + '</dl>';
    h += '</div>';
    if (card.go && card.go.to >= 0) h += '<div class="vi-peek-foot"><button type="button" class="vi-peek-link vi-peek-go" data-go="' + card.go.to + '">' + escH(card.go.label) + '</button></div>';
    if (card.link && card.link.url) h += '<div class="vi-peek-foot"><a class="vi-peek-link' + (card.go && card.go.to >= 0 ? ' is-quiet' : '') + '" href="' + escH(card.link.url) + '" target="_blank" rel="noopener noreferrer">' +
      escH(card.link.label) + PEEK_EXT + '<span class="vi-peek-sr"> (opens in a new tab)</span></a></div>';
    return h;
  }
  function closePeek(returnFocus){
    clearTimeout(peekShowT); clearTimeout(peekHideT);
    if (!peekOpen) return;
    const o = peekOpen;
    peekOpen = null;
    o.el.remove();
    if (o.btn){ o.btn.setAttribute('aria-expanded', 'false'); if (returnFocus && document.contains(o.btn)) o.btn.focus(); }
  }
  /* Narrow cards sit beside the course (right first, then left), otherwise below or above it. Wide cards are centred on
     the slide, starting just under the course's title so the card it belongs to stays recognisable. */
  function placePeek(el, frameEl, p){
    const r = frameEl.getBoundingClientRect();
    const sx = r.width / SW, sy = r.height / SH;
    const cl = r.left + p.x * sx, ct = r.top + p.y * sy, cr = cl + p.w * sx, cb = ct + p.h * sy;
    const vw = document.documentElement.clientWidth || window.innerWidth, vh = window.innerHeight;
    const pw = el.offsetWidth, ph = el.offsetHeight, g = 10, m = 8;
    let left, top = Math.min(Math.max(m, ct), Math.max(m, vh - ph - m));
    if (p.card && p.card.wide){
      left = Math.min(Math.max(m, r.left + r.width / 2 - pw / 2), Math.max(m, vw - pw - m));
      top = Math.min(Math.max(m, ct + Math.min(1.3, p.h * 0.4) * sy), Math.max(m, vh - ph - m));
    } else if (cr + g + pw <= vw - m) left = cr + g;
    else if (cl - g - pw >= m) left = cl - g - pw;
    else {
      left = Math.min(Math.max(m, (cl + cr) / 2 - pw / 2), Math.max(m, vw - pw - m));
      if (cb + g + ph <= vh - m) top = cb + g;
      else if (ct - g - ph >= m) top = ct - g - ph;
    }
    el.style.left = Math.round(left) + 'px';
    el.style.top = Math.round(top) + 'px';
  }
  function showPeek(frameEl, p, focusIn){
    clearTimeout(peekShowT); clearTimeout(peekHideT);
    if (peekOpen && peekOpen.p === p){ if (focusIn){ const a = peekOpen.el.querySelector('.vi-peek-link'); if (a) a.focus(); } return; }
    closePeek(false);
    if (!document.contains(frameEl)) return;
    peekCss();
    const id = 'vi-peek-' + (++peekSeq);
    const el = document.createElement('div');
    el.className = 'vi-peek' + (p.card && p.card.wide ? ' is-wide' : '');
    el.id = id;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-labelledby', id + '-t');
    el.innerHTML = peekHtml(p.card, id);
    el.style.visibility = 'hidden';
    document.body.appendChild(el);
    placePeek(el, frameEl, p);
    el.style.visibility = '';
    const btn = p._btn || null;
    if (btn) btn.setAttribute('aria-expanded', 'true');
    peekOpen = {el, p, frameEl, btn};
    el.addEventListener('pointerenter', () => { clearTimeout(peekHideT); clearTimeout(peekShowT); });
    el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') schedHide(); });
    el.querySelector('.vi-peek-x').addEventListener('click', e => { e.stopPropagation(); closePeek(true); });
    const gb = el.querySelector('.vi-peek-go');
    if (gb) gb.addEventListener('click', e => { e.stopPropagation(); const to = +gb.dataset.go; closePeek(false); if (typeof frameEl._onGo === 'function') frameEl._onGo(to); });
    el.addEventListener('keydown', e => { if (e.key === 'Escape'){ e.stopPropagation(); closePeek(true); } });
    if (focusIn){ const a = el.querySelector('.vi-peek-link') || el.querySelector('.vi-peek-x'); if (a) a.focus(); }
  }
  function schedHide(){ clearTimeout(peekHideT); peekHideT = setTimeout(() => closePeek(false), 280); }
  function hitPeek(frameEl, e){
    const r = frameEl.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    const x = (e.clientX - r.left) / r.width * SW, y = (e.clientY - r.top) / r.height * SH;
    return (frameEl._peeks || []).find(p => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) || null;
  }
  function mountPeeks(frameEl, slide, onGo){
    frameEl._onGo = onGo || null;
    frameEl.querySelectorAll('.vi-peek-spot').forEach(el => el.remove());
    if (peekOpen && peekOpen.frameEl === frameEl) closePeek(false);
    frameEl._peeks = (slide && slide.peeks) || [];
    if (!frameEl._peeks.length) return;
    peekCss();
    if (!frameEl._peekWired){
      frameEl._peekWired = true;
      frameEl.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        const p = hitPeek(frameEl, e);
        if (p){
          clearTimeout(peekHideT);
          if (peekOpen && peekOpen.p === p) return;
          clearTimeout(peekShowT);
          peekShowT = setTimeout(() => showPeek(frameEl, p, false), peekOpen ? 140 : 280);
        } else {
          clearTimeout(peekShowT);
          if (peekOpen) schedHide();
        }
      });
      frameEl.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse'){ clearTimeout(peekShowT); if (peekOpen) schedHide(); } });
      frameEl.addEventListener('click', e => {
        if (e.target.closest && e.target.closest('a, button, select, input, .vi-ctl, .vi-peek-spot')) return;
        const p = hitPeek(frameEl, e);
        if (!p){ if (peekOpen && peekOpen.frameEl === frameEl) closePeek(false); return; }
        if (peekOpen && peekOpen.p === p){ if (e.pointerType && e.pointerType !== 'mouse') closePeek(false); }
        else showPeek(frameEl, p, false);
      });
    }
    frameEl._peeks.forEach(p => {
      if (!p.spot) return;
      const wrap = document.createElement('span');
      wrap.className = 'vi-peek-spot';
      Object.assign(wrap.style, {left:(p.spot.x / SW * 100) + '%', top:(p.spot.y / SH * 100) + '%', width:(p.spot.w / SW * 100) + '%', height:(p.spot.h / SH * 100) + '%'});
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Overview of ' + p.card.title);
      b.setAttribute('aria-haspopup', 'dialog');
      b.setAttribute('aria-expanded', 'false');
      b.addEventListener('click', e => {
        e.stopPropagation();
        p._btn = b;
        const key = e.detail === 0;   // Enter or Space: open and move focus into the card
        if (peekOpen && peekOpen.p === p && !key && e.pointerType !== 'mouse') closePeek(false);
        else showPeek(frameEl, p, key);
      });
      p._btn = b;
      wrap.appendChild(b);
      frameEl.appendChild(wrap);
    });
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && peekOpen) closePeek(true); });
  document.addEventListener('pointerdown', e => {
    if (!peekOpen || peekOpen.el.contains(e.target) || peekOpen.frameEl.contains(e.target)) return;
    closePeek(false);
  }, true);
  window.addEventListener('scroll', e => { if (peekOpen && !(e.target && e.target.nodeType === 1 && peekOpen.el.contains(e.target))) closePeek(false); }, true);
  window.addEventListener('resize', () => closePeek(false));

  /* CDN libraries for the exports (several mirrors, first that loads wins) */
  const LIBS = {
    pptx: {ok: () => typeof window.PptxGenJS === 'function', urls: [
      'https://cdn.jsdelivr.net/npm/pptxgenjs@4.0.1/dist/pptxgen.bundle.js',
      'https://unpkg.com/pptxgenjs@4.0.1/dist/pptxgen.bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundle.js']},
    pdf: {ok: () => !!(window.jspdf && window.jspdf.jsPDF), urls: [
      'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',
      'https://unpkg.com/jspdf@2.5.2/dist/jspdf.umd.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js']}
  };
  const pending = {};
  function loadScript(url){
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = url; s.async = true; s.crossOrigin = 'anonymous';
      s.onload = () => resolve();
      s.onerror = () => { s.remove(); reject(new Error('load')); };
      document.head.appendChild(s);
    });
  }
  function loadLib(name){
    const L = LIBS[name];
    if (L.ok()) return Promise.resolve();
    if (!pending[name]){
      pending[name] = (async () => {
        for (const u of L.urls){ try { await loadScript(u); if (L.ok()) return; } catch (e) {} }
        throw new Error('The ' + (name === 'pdf' ? 'PDF' : 'PowerPoint') + ' builder could not be loaded. Check the internet connection and try again.');
      })().catch(e => { pending[name] = null; throw e; });
    }
    return pending[name];
  }
  /* Saving a file. In the claude.ai artifact viewer the page may not download by itself, so the viewer's own save
     prompt (the `downloads` capability) is used; anywhere else, an ordinary link download.
     Resolves 'saved', 'declined', 'busy' or 'failed'. */
  let dlNs;
  function downloadsCap(){
    if (dlNs !== undefined) return Promise.resolve(dlNs);
    let p;
    try {
      p = window.claude && typeof window.claude.use === 'function'
        ? Promise.race([Promise.resolve(window.claude.use('downloads')), new Promise(r => setTimeout(() => r(null), 10000))]).catch(() => null)
        : Promise.resolve(null);
    } catch (e) { p = Promise.resolve(null); }
    return p.then(ns => { dlNs = ns || null; return dlNs; });
  }
  setTimeout(() => { downloadsCap(); }, 0);   // look it up early, so a save starts without delay
  async function deliver(blob, filename){
    const dl = await downloadsCap();
    if (dl){
      try { await dl.save({filename, data:blob}); return 'saved'; }
      catch (e){
        const c = e && e.code;
        return c === 'declined' ? 'declined' : c === 'rate_limited' ? 'busy' : 'failed';
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return 'saved';
  }
  const deliverMsg = r => r === 'declined' ? 'Download cancelled.' : r === 'busy' ? 'A save prompt is already open. Finish it, then try again.' : 'The file could not be saved here.';
  /* PDF: the main slides drawn as vectors, with selectors shown as plain labels, then (v6) the detail slides as appendix
     pages, linked both ways. S.detailsPdf === false leaves the detail slides, and the buttons that open them, out. */
  async function exportPdf(S, onProgress){
    await loadLib('pdf');
    // v6.1: the PDF always shows the Simple lesson detail, whatever the builder's level
    const d = buildDeck(Object.assign({}, S, {detailLevel:'simple'}), {mode:'static', details: S.detailsPdf !== false});
    const meta = deckMeta(d.ctx);
    const n = d.main + (d.details || 0);
    const blob = await buildVectorPdf(d.slides.slice(0, n), meta, onProgress);
    return {blob, filename: meta.base + '.pdf', pages: n, main: d.main, details: d.details || 0};
  }
  /* PowerPoint: image slides; withViews adds the hidden slides that keep the selectors clickable */
  async function exportPptx(S, withViews, onProgress){
    await loadLib('pptx');
    const d = buildDeck(S, withViews ? {variants:true} : {mode:'static'});
    const meta = deckMeta(d.ctx);
    const blob = await buildImagePptx(d.slides, meta, onProgress);
    return {blob, filename: meta.base + '.pptx', slides: d.slides.length, main: d.main, details: d.details || 0};
  }
  function inFrame(){ try { return window.self !== window.top; } catch (e) { return true; } }
  return {deliverMsg, initAssets, mountControls, mountLinks, mountPeeks, closePeek, openToc, closeToc, applyPick, loadLib, deliver, exportPdf, exportPptx, inFrame};
})();

