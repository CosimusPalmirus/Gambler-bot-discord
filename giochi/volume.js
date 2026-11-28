/* VOLUME DEI GIOCHI (Discord «Pipo's Games», 28/11/2026) — un modulo unico per TUTTI i giochi del catalogo.
   Si carica PRIMA degli script del gioco in ogni documento (catalogo, app.html, figlia.html, arena.html, boxe/rt.html).

   COME FUNZIONA
   1) Web Audio: la proprieta' «destination» di ogni AudioContext (anche webkitAudioContext, anche piu' contesti, anche
      contesti nati prima di questo file) restituisce un GainNode comune del contesto: ingresso -> master -> uscita vera.
      Il gioco non se ne accorge: collega tutto a ctx.destination come sempre. OfflineAudioContext resta intatto.
   2) <audio>/<video>/new Audio(): «volume» resta quello che il gioco chiede (lo legge uguale), quello vero e'
      volume_del_gioco x master. Vale anche per gli elementi creati dopo (play() e l'evento play li registrano).
   3) iOS (il volume degli elementi media non si cambia da JS, resta 1): gli elementi della stessa origine vengono
      instradati nel GainNode (createMediaElementSource) appena il master scende sotto 1; quelli di un'altra origine
      (che passati nel grafo diventerebbero muti) si possono solo zittire: muto/0% -> muted, altrimenti pieno volume.
   4) Il valore e' uno solo per tutti i documenti/iframe: localStorage (ricordato fra le sessioni) + BroadcastChannel
      + postMessage ai riquadri della stessa origine. La levetta la mostra SOLO il documento piu' in alto della nostra
      origine (il catalogo dentro Discord): sta sopra la partita (iframe a tutto schermo) senza doppioni.
   5) document.open()/write() (carica.js, boxe/rt.js riscrivono la pagina): il global resta, quindi restano le toppe
      ai prototipi; gli ascoltatori di window/document invece vengono cancellati: si rimettono subito dopo open().
   Niente script in linea, niente eval: compatibile con la CSP di discordsays.com. Lo stile e' un <style> (style-src
   'unsafe-inline' c'e').

   API (anche per le prove): GXVOL.stato() -> {l, m, g}; GXVOL.imposta(livello 0..1, muto); GXVOL.muto(bool);
   GXVOL.misura(ms) -> Promise({contesti:[{pre, post, rapporto}], media:[...]}) livello RMS del segnale prima e dopo. */
(function () {
  'use strict';
  var W = window;
  if (W.GXVOL && W.GXVOL._ok) { try { W.GXVOL._riaggancia(); } catch (e) {} return; }

  var CHIAVE = 'gx_volume_v1';
  var CANALE = 'gx-volume';
  var ID = Math.random().toString(36).slice(2);
  var st = {l: 1, m: false};

  function fra(x) { x = +x; return isFinite(x) ? Math.max(0, Math.min(1, x)) : 1; }
  // la levetta va da 0 a 100; il guadagno segue l'orecchio (quadratica): 50% -> 0,25, 30% -> 0,09
  function guadagno() { return st.m ? 0 : st.l * st.l; }
  function leggi() {
    try { var s = JSON.parse(W.localStorage.getItem(CHIAVE) || 'null'); if (s && typeof s.l === 'number') return {l: fra(s.l), m: !!s.m}; } catch (e) {}
    return null;
  }
  function salva() { try { W.localStorage.setItem(CHIAVE, JSON.stringify({l: Math.round(st.l * 100) / 100, m: st.m})); } catch (e) {} }
  function sopra() {   // il GXVOL del riquadro di sopra (stessa origine), se c'e'
    try { var p = W.parent; if (p && p !== W && p.GXVOL && p.GXVOL._ok) return p.GXVOL; } catch (e) {}
    return null;
  }
  (function () {
    var p = sopra(), s = null;
    try { s = p ? p.stato() : null; } catch (e) {}
    s = s || leggi();
    if (s) st = {l: fra(s.l), m: !!s.m};
  })();
  var RADICE = !sopra();
  var PROVA_IOS = false;
  try { PROVA_IOS = W.GXVOL_PROVA_IOS === true || W.localStorage.getItem('gx_volume_prova_ios') === '1'; } catch (e) {}

  /* ───────────── 1) Web Audio ───────────── */
  var CTX = [];                 // [{c, ing, mas, vera, an}]
  var PER = new WeakMap();      // contesto -> voce di CTX
  var OFF = W.OfflineAudioContext || W.webkitOfflineAudioContext;
  function voce(ctx, getVera) {
    var n = PER.get(ctx);
    if (n) return n;
    if (OFF && ctx instanceof OFF) return null;
    var vera = getVera.call(ctx);
    if (!vera || typeof ctx.createGain !== 'function') return null;
    var ing = ctx.createGain(), mas = ctx.createGain();
    ing.connect(mas); mas.connect(vera);
    mas.gain.value = guadagno();
    // chi legge ctx.destination.maxChannelCount (Howler, qualche motore) trova quello vero
    try { Object.defineProperty(ing, 'maxChannelCount', {configurable: true, get: function () { return vera.maxChannelCount; }}); } catch (e) {}
    n = {c: ctx, ing: ing, mas: mas, vera: vera, an: null};
    PER.set(ctx, n);
    CTX.push(n);
    return n;
  }
  ['BaseAudioContext', 'AudioContext', 'webkitAudioContext'].forEach(function (nome) {
    var C = W[nome];
    if (!C || !C.prototype) return;
    var d = Object.getOwnPropertyDescriptor(C.prototype, 'destination');
    if (!d || !d.get || d.get.__gxvol) return;
    var g = function () {
      try { var n = voce(this, d.get); if (n) return n.ing; } catch (e) {}
      return d.get.call(this);
    };
    g.__gxvol = true;
    Object.defineProperty(C.prototype, 'destination', {configurable: true, enumerable: d.enumerable, get: g});
  });
  function regolaContesti() {
    var g = guadagno();
    for (var i = CTX.length - 1; i >= 0; i--) {
      var n = CTX[i];
      if (n.c.state === 'closed') { CTX.splice(i, 1); continue; }
      try {
        var p = n.mas.gain;
        if (n.c.state === 'running') { p.cancelScheduledValues(n.c.currentTime); p.setTargetAtTime(g, n.c.currentTime, 0.015); }
        else p.value = g;
      } catch (e) { try { n.mas.gain.value = g; } catch (x) {} }
    }
  }

  /* ───────────── 2) e 3) elementi media ───────────── */
  var MP = W.HTMLMediaElement && W.HTMLMediaElement.prototype;
  var DV = MP && Object.getOwnPropertyDescriptor(MP, 'volume');
  var DMU = MP && Object.getOwnPropertyDescriptor(MP, 'muted');
  var LOG = new WeakMap();      // elemento -> volume chiesto dal gioco
  var LOGM = new WeakMap();     // elemento -> muted chiesto dal gioco (solo iOS)
  var INSTR = new WeakMap();    // elemento -> MediaElementSource (iOS)
  var MEDIA = new Set();
  var IOS = PROVA_IOS;
  if (!IOS && DV) {
    try { var a = document.createElement('audio'); DV.set.call(a, 0.5); IOS = Math.abs(DV.get.call(a) - 0.5) > 0.01; } catch (e) {}
  }
  var ctxMedia = null;
  function contestoMedia() {
    if (ctxMedia && ctxMedia.state !== 'closed') return ctxMedia;
    var C = W.AudioContext || W.webkitAudioContext;
    if (!C) return null;
    try { ctxMedia = new C(); } catch (e) { ctxMedia = null; }
    return ctxMedia;
  }
  function stessaOrigine(el) {
    var u = el.currentSrc || el.src || '';
    if (!u) { var s = el.querySelector && el.querySelector('source[src]'); u = s ? s.src : ''; }
    if (!u) return false;
    if (/^(blob|data):/i.test(u)) return true;
    try { return new URL(u, location.href).origin === location.origin; } catch (e) { return false; }
  }
  function instrada(el) {
    if (!IOS || INSTR.has(el)) return;
    if (guadagno() >= 1) return;                       // a pieno volume non serve: niente rischi
    if (!stessaOrigine(el)) return;                    // un'altra origine nel grafo diventa muta
    var c = contestoMedia();
    if (!c) return;
    if (c.state !== 'running') { try { c.resume(); } catch (e) {} if (c.state !== 'running') return; }   // sospeso = muto: si aspetta un tocco
    try { var s = c.createMediaElementSource(el); s.connect(c.destination); INSTR.set(el, s); } catch (e) {}
  }
  function applica(el) {
    if (!DV) return;
    var v = LOG.has(el) ? LOG.get(el) : null;
    try {
      if (IOS) {
        instrada(el);
        if (v != null) DV.set.call(el, v);
        if (DMU) DMU.set.call(el, !!LOGM.get(el) || (!INSTR.has(el) && guadagno() === 0));
      } else {
        if (v == null) { v = DV.get.call(el); if (!LOG.has(el)) { LOG.set(el, v); } }
        DV.set.call(el, Math.max(0, Math.min(1, v * guadagno())));
      }
    } catch (e) {}
  }
  function segna(el) { if (el && !MEDIA.has(el)) MEDIA.add(el); }
  if (MP && DV && DV.set && !DV.set.__gxvol) {
    var sv = function (v) {
      var x = +v;
      if (!(x >= 0 && x <= 1)) { DV.set.call(this, v); return; }   // fuori scala: lo stesso errore del browser
      LOG.set(this, x); segna(this); applica(this);
    };
    sv.__gxvol = true;
    Object.defineProperty(MP, 'volume', {configurable: true, enumerable: DV.enumerable,
      get: function () { return LOG.has(this) ? LOG.get(this) : DV.get.call(this); }, set: sv});
    if (IOS && DMU && DMU.set) {
      Object.defineProperty(MP, 'muted', {configurable: true, enumerable: DMU.enumerable,
        get: function () { return LOGM.has(this) ? LOGM.get(this) : DMU.get.call(this); },
        set: function (v) { LOGM.set(this, !!v); segna(this); applica(this); }});
    }
    var PL = MP.play;
    MP.play = function () { segna(this); applica(this); return PL.apply(this, arguments); };
  }
  function regolaMedia() {
    if (!DV) return;
    try { var q = document.querySelectorAll('audio,video'); for (var i = 0; i < q.length; i++) segna(q[i]); } catch (e) {}
    MEDIA.forEach(function (el) {
      if (!el.isConnected && el.paused && !INSTR.has(el)) { MEDIA.delete(el); return; }
      applica(el);
    });
  }

  /* ───────────── 4) un valore per tutti i documenti ───────────── */
  var bc = null;
  try { bc = new BroadcastChannel(CANALE); bc.onmessage = function (e) { var d = e.data; if (d && d.id !== ID) ricevi(d); }; } catch (e) { bc = null; }
  function aiFigli(msg) {
    try { for (var i = 0; i < W.frames.length; i++) { try { W.frames[i].postMessage(msg, location.origin); } catch (e) {} } } catch (e) {}
  }
  var ASCOLTA = [];
  function cambiato() {
    regolaContesti(); regolaMedia(); disegna();
    for (var i = 0; i < ASCOLTA.length; i++) { try { ASCOLTA[i](stato()); } catch (e) {} }
  }
  function ricevi(d) {
    if (!d || typeof d.l !== 'number') return;
    var l = fra(d.l), m = !!d.m;
    if (Math.abs(l - st.l) < 0.001 && m === st.m) return;
    st = {l: l, m: m};
    cambiato();
    aiFigli({gxvol: 1, l: l, m: m, id: ID});
  }
  function imposta(l, m) {
    l = l == null ? st.l : fra(l); m = m == null ? st.m : !!m;
    if (Math.abs(l - st.l) < 0.001 && m === st.m) return;
    st = {l: l, m: m};
    salva(); cambiato();
    var msg = {gxvol: 1, l: l, m: m, id: ID};
    if (bc) try { bc.postMessage(msg); } catch (e) {}
    aiFigli(msg);
    try { if (W.parent !== W) W.parent.postMessage(msg, location.origin); } catch (e) {}
  }
  function stato() { return {l: st.l, m: st.m, g: guadagno()}; }

  /* misura per le prove: RMS del segnale all'ingresso (il gioco) e all'uscita (dopo il master) di ogni contesto */
  function rms(an, buf) { an.getFloatTimeDomainData(buf); var s = 0; for (var i = 0; i < buf.length; i++) s += buf[i] * buf[i]; return Math.sqrt(s / buf.length); }
  function misura(ms) {
    ms = ms || 600;
    CTX.forEach(function (n) {
      if (n.an || n.c.state === 'closed') return;
      try {
        var a1 = n.c.createAnalyser(), a2 = n.c.createAnalyser(); a1.fftSize = a2.fftSize = 2048;
        n.ing.connect(a1); n.mas.connect(a2); n.an = [a1, a2, new Float32Array(2048)];
      } catch (e) {}
    });
    return new Promise(function (ok) {
      var acc = CTX.map(function () { return {pre: 0, post: 0, k: 0}; }), t0 = Date.now();
      (function giro() {
        CTX.forEach(function (n, i) {
          if (!n.an || !acc[i]) return;
          var p = rms(n.an[0], n.an[2]), q = rms(n.an[1], n.an[2]);
          if (p > acc[i].pre) { acc[i].pre = p; acc[i].post = q; }
          acc[i].k++;
        });
        if (Date.now() - t0 < ms) return setTimeout(giro, 25);
        ok({stato: stato(), ios: IOS,
            contesti: CTX.map(function (n, i) {
              var a = acc[i] || {pre: 0, post: 0};
              return {stato: n.c.state, mio: n.c === ctxMedia, pre: +a.pre.toFixed(5), post: +a.post.toFixed(5),
                      rapporto: a.pre > 1e-4 ? +(a.post / a.pre).toFixed(4) : null, gain: +n.mas.gain.value.toFixed(4)};
            }),
            media: Array.from(MEDIA).slice(0, 12).map(function (el) {
              return {tag: el.tagName, src: String(el.currentSrc || el.src || '').slice(-40), paused: el.paused,
                      chiesto: LOG.has(el) ? LOG.get(el) : null, vero: DV ? +DV.get.call(el).toFixed(4) : null,
                      mutoVero: DMU ? DMU.get.call(el) : null, instradato: INSTR.has(el)};
            })});
      })();
    });
  }

  /* ───────────── la levetta (solo nel documento piu' in alto) ───────────── */
  var UI = null, chiudiT = 0, primaFuoco = null;
  var SVG = {
    alto: '<path d="M4 9.5h3.2L12 5.2v13.6l-4.8-4.3H4z" fill="currentColor" stroke="none"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6"/><path d="M18.2 6.4a8 8 0 0 1 0 11.2"/>',
    medio: '<path d="M4 9.5h3.2L12 5.2v13.6l-4.8-4.3H4z" fill="currentColor" stroke="none"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6"/>',
    basso: '<path d="M4 9.5h3.2L12 5.2v13.6l-4.8-4.3H4z" fill="currentColor" stroke="none"/>',
    muto: '<path d="M4 9.5h3.2L12 5.2v13.6l-4.8-4.3H4z" fill="currentColor" stroke="none"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>'
  };
  function icona() {
    var k = (st.m || st.l <= 0.001) ? 'muto' : (st.l < 0.34 ? 'basso' : (st.l < 0.67 ? 'medio' : 'alto'));
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + SVG[k] + '</svg>';
  }
  var CSS = [
    '.gxvol{position:fixed;z-index:2147483000;left:0;top:50%;transform:translateY(-50%);display:flex;align-items:center;',
    'font:500 13px -apple-system,BlinkMacSystemFont,"SF Pro Text","Inter","Segoe UI",system-ui,sans-serif;color:#f2f2f4;',
    'pointer-events:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}',
    '.gxvol *{box-sizing:border-box}',
    '.gxvol-tab{pointer-events:auto;width:30px;height:46px;margin-left:max(var(--discord-safe-area-inset-left,0px),env(safe-area-inset-left,0px));',
    'display:grid;place-items:center;padding:0 0 0 2px;border:0;border-radius:0 14px 14px 0;color:#f2f2f4;cursor:pointer;',
    'background:rgba(28,28,32,.62);-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);',
    'box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset -1px 0 0 rgba(255,255,255,.08),0 6px 18px -6px rgba(0,0,0,.8);',
    'opacity:.72;transition:opacity .18s,width .18s cubic-bezier(.2,.8,.2,1)}',
    '.gxvol-tab:hover,.gxvol.su .gxvol-tab,.gxvol-tab:focus-visible{opacity:1}',
    '.gxvol-tab:focus-visible{outline:2px solid #8b83f0;outline-offset:2px}',
    '.gxvol.muto .gxvol-tab{color:#ff9f0a}',
    '.gxvol-lastra{pointer-events:auto;display:flex;align-items:center;gap:10px;margin-left:8px;padding:8px 14px 8px 8px;border-radius:18px;',
    'background:linear-gradient(165deg,rgba(255,255,255,.1),rgba(255,255,255,.045) 55%,rgba(255,255,255,.06)),rgba(22,22,26,.78);',
    '-webkit-backdrop-filter:blur(18px) saturate(1.5);backdrop-filter:blur(18px) saturate(1.5);border:.5px solid rgba(255,255,255,.14);',
    'box-shadow:inset 0 1px 0 rgba(255,255,255,.2),inset 0 -1.5px 0 rgba(0,0,0,.45),0 18px 40px -16px rgba(0,0,0,.95);',
    'opacity:0;transform:translateX(-8px) scale(.97);transform-origin:left center;visibility:hidden;',
    'transition:opacity .16s,transform .22s cubic-bezier(.2,.8,.2,1),visibility 0s .22s}',
    '.gxvol.su .gxvol-lastra{opacity:1;transform:none;visibility:visible;transition:opacity .16s,transform .22s cubic-bezier(.2,.8,.2,1)}',
    '.gxvol-muto{flex:none;width:34px;height:34px;border-radius:50%;border:0;display:grid;place-items:center;cursor:pointer;color:#f2f2f4;background:rgba(255,255,255,.1)}',
    '.gxvol-muto:hover{background:rgba(255,255,255,.16)}',
    '.gxvol.muto .gxvol-muto{background:rgba(255,159,10,.2);color:#ff9f0a}',
    '.gxvol-muto:focus-visible,.gxvol-liv:focus-visible{outline:2px solid #8b83f0;outline-offset:2px}',
    '.gxvol-liv{-webkit-appearance:none;appearance:none;width:150px;height:28px;margin:0;background:transparent;cursor:pointer;touch-action:none;--p:100%}',
    '.gxvol-liv::-webkit-slider-runnable-track{height:5px;border-radius:3px;background:linear-gradient(90deg,#8b83f0 var(--p),rgba(255,255,255,.16) var(--p))}',
    '.gxvol-liv::-moz-range-track{height:5px;border-radius:3px;background:linear-gradient(90deg,#8b83f0 var(--p),rgba(255,255,255,.16) var(--p))}',
    '.gxvol-liv::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;margin-top:-7.5px;border-radius:50%;background:#f2f2f4;border:0;box-shadow:0 1px 4px rgba(0,0,0,.5)}',
    '.gxvol-liv::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#f2f2f4;border:0;box-shadow:0 1px 4px rgba(0,0,0,.5)}',
    '.gxvol.muto .gxvol-liv{--c:.45}.gxvol.muto .gxvol-liv::-webkit-slider-runnable-track{background:linear-gradient(90deg,#636366 var(--p),rgba(255,255,255,.12) var(--p))}',
    '.gxvol-val{min-width:38px;text-align:right;font-variant-numeric:tabular-nums;color:#c7c7cc}',
    // il catalogo nella finestrella (scheda del canale) non ha niente da far suonare: via
    'html.modo-pip:not(.in-gioco) .gxvol{display:none}',
    '@media (max-height:300px){.gxvol-tab{width:22px;height:34px;border-radius:0 10px 10px 0}.gxvol-tab svg{width:14px;height:14px}',
    '.gxvol-lastra{gap:6px;padding:4px 10px 4px 4px;border-radius:14px;margin-left:6px}.gxvol-muto{width:28px;height:28px}.gxvol-liv{width:110px;height:24px}.gxvol-val{min-width:32px;font-size:12px}}',
    '@media (prefers-reduced-motion:reduce){.gxvol-lastra,.gxvol-tab{transition:none}}'
  ].join('');
  function disegna() {
    if (!UI) return;
    var pc = Math.round(st.l * 100);
    UI.box.classList.toggle('muto', st.m || pc === 0);
    UI.tab.innerHTML = icona();
    UI.mu.innerHTML = icona();
    UI.tab.setAttribute('aria-label', 'Volume dei giochi: ' + (st.m ? 'muto' : pc + '%'));
    UI.mu.setAttribute('aria-label', st.m ? 'Riattiva il suono' : 'Muto');
    UI.mu.setAttribute('aria-pressed', st.m ? 'true' : 'false');
    if (document.activeElement !== UI.liv || +UI.liv.value !== pc) UI.liv.value = pc;
    UI.liv.style.setProperty('--p', pc + '%');
    UI.val.textContent = st.m ? 'Muto' : pc + '%';
  }
  function aperta() { return !!(UI && UI.box.classList.contains('su')); }
  function apri() {
    if (!UI) return;
    if (!aperta() && !(document.activeElement && UI.box.contains(document.activeElement))) primaFuoco = document.activeElement;
    UI.box.classList.add('su');
    UI.tab.setAttribute('aria-expanded', 'true');
    rinvia();
  }
  function chiudi() {
    if (!aperta()) return;
    UI.box.classList.remove('su');
    UI.tab.setAttribute('aria-expanded', 'false');
    clearTimeout(chiudiT);
    // la tastiera torna al gioco (le frecce sulla levetta non devono restare a lei)
    var a = document.activeElement;
    if (a && UI.box.contains(a)) {
      try { a.blur(); } catch (e) {}
      var f = primaFuoco && primaFuoco.isConnected && !UI.box.contains(primaFuoco) && primaFuoco !== document.body ? primaFuoco : grandeRiquadro();
      if (f && f.tagName === 'IFRAME') { try { f.focus(); f.contentWindow.focus(); } catch (e) {} }
      else if (f && f.focus) { try { f.focus({preventScroll: true}); } catch (e) {} }
    }
  }
  // il riquadro del gioco a tutto schermo (dove deve tornare la tastiera)
  function grandeRiquadro() {
    var q = document.getElementsByTagName('iframe');
    for (var i = q.length - 1; i >= 0; i--) { var r = q[i].getBoundingClientRect(); if (r.width >= innerWidth * 0.8 && r.height >= innerHeight * 0.8) return q[i]; }
    return null;
  }
  function rinvia() { clearTimeout(chiudiT); chiudiT = setTimeout(chiudi, 4500); }
  function montaUI() {
    if (!RADICE || !document.body) return;
    if (UI && UI.box.isConnected) return;
    if (!document.getElementById('gxvol-css')) {
      var s = document.createElement('style'); s.id = 'gxvol-css'; s.textContent = CSS;
      (document.head || document.documentElement).appendChild(s);
    }
    var box = document.createElement('div');
    box.className = 'gxvol'; box.id = 'gxvol';
    box.innerHTML = '<button class="gxvol-tab" type="button" aria-expanded="false" aria-controls="gxvol-lastra"></button>' +
      '<div class="gxvol-lastra" id="gxvol-lastra" role="group" aria-label="Volume dei giochi">' +
      '<button class="gxvol-muto" type="button"></button>' +
      '<input class="gxvol-liv" type="range" min="0" max="100" step="1" aria-label="Volume">' +
      '<span class="gxvol-val" aria-hidden="true"></span></div>';
    document.body.appendChild(box);
    UI = {box: box, tab: box.querySelector('.gxvol-tab'), mu: box.querySelector('.gxvol-muto'), liv: box.querySelector('.gxvol-liv'), val: box.querySelector('.gxvol-val')};
    // chi aveva la tastiera PRIMA del tocco (il clic sposta il fuoco sul tasto prima del gestore di click)
    UI.tab.addEventListener('pointerdown', function () { if (!aperta()) primaFuoco = document.activeElement; }, true);
    UI.tab.addEventListener('click', function () { if (aperta()) chiudi(); else apri(); });
    UI.mu.addEventListener('click', function () {
      // muto rapido; se il livello era 0, «riattiva» lo riporta a meta'
      if (st.m) imposta(st.l > 0.001 ? st.l : 0.5, false); else if (st.l <= 0.001) imposta(0.5, false); else imposta(null, true);
      rinvia();
    });
    UI.liv.addEventListener('input', function () { imposta(+UI.liv.value / 100, false); rinvia(); });
    UI.liv.addEventListener('change', rinvia);
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); chiudi(); } });
    // i tocchi non arrivano al catalogo sotto (ne' ai suoi gestori di trascinamento/carosello)
    ['pointerdown', 'touchstart', 'mousedown', 'wheel'].forEach(function (t) { box.addEventListener(t, function (e) { e.stopPropagation(); rinvia(); }, {passive: true}); });
    disegna();
  }

  /* ───────────── ascoltatori (si rimettono dopo document.open) ───────────── */
  function suMessaggio(e) {
    if (e.origin !== location.origin) return;
    var d = e.data;
    if (d && d.gxvol === 1 && d.id !== ID) ricevi(d);
  }
  function suStorage(e) { if (e.key === CHIAVE) { var s = leggi(); if (s) ricevi(s); } }
  function suPlay(e) { var t = e.target; if (t && (t.tagName === 'AUDIO' || t.tagName === 'VIDEO')) { segna(t); applica(t); } }
  function suTocco() {
    // iOS: il contesto dei media si sblocca solo con un gesto
    if (IOS && ctxMedia && ctxMedia.state === 'suspended') { try { ctxMedia.resume(); } catch (e) {} }
    if (IOS && guadagno() < 1) regolaMedia();
  }
  function suFuori(e) { if (aperta() && UI && !UI.box.contains(e.target)) chiudi(); }
  // rete di sicurezza: un riquadro della stessa origine che non ha caricato questo file (una pagina nuova, non ancora
  // in applica_volume.py) lo riceve quando ha finito di caricarsi; «destination» e' pigra, quindi i suoni che il gioco
  // collega da li' in poi passano dal master. Le pagine elencate lo caricano gia' PRIMA del gioco: per loro non scatta.
  var MIO_SRC = (document.currentScript && document.currentScript.src) || '';
  function curaFiglio(f) {
    if (!MIO_SRC) return;
    try {
      var w = f.contentWindow;
      if (!w || w.GXVOL || !w.document || w.location.href === 'about:blank') return;
      var d = w.document, s = d.createElement('script');
      s.src = MIO_SRC;
      (d.head || d.documentElement).appendChild(s);
    } catch (e) {}   // un'altra origine: non e' roba nostra
  }
  function suCarica(e) { var t = e.target; if (t && t.tagName === 'IFRAME') curaFiglio(t); }
  function aggancia() {
    document.addEventListener('load', suCarica, true);
    W.addEventListener('message', suMessaggio);
    W.addEventListener('storage', suStorage);
    document.addEventListener('play', suPlay, true);
    document.addEventListener('pointerdown', suTocco, true);
    document.addEventListener('touchend', suTocco, true);
    if (RADICE) {
      document.addEventListener('pointerdown', suFuori, true);
      // (niente chiusura sul blur della finestra: i giochi si riprendono il fuoco da soli e la chiuderebbero sotto il dito;
      //  un tocco dentro il gioco non arriva qui: la chiude il timer di 4,5 s)
      if (document.body) montaUI(); else document.addEventListener('DOMContentLoaded', montaUI);
    }
    // se il riquadro di sopra e' cambiato mentre questo documento si riscriveva, ci si rimette in pari
    var p = sopra(); if (p) { try { ricevi(p.stato()); } catch (e) {} }
  }
  var DO = W.Document && Document.prototype.open;
  if (DO && !DO.__gxvol) {
    var nuovoOpen = function () {
      var r = DO.apply(this, arguments);
      if (this === document && arguments.length < 3) { UI = null; try { aggancia(); } catch (e) {} }
      return r;
    };
    nuovoOpen.__gxvol = true;
    Document.prototype.open = nuovoOpen;
  }
  aggancia();

  W.GXVOL = {_ok: true, stato: stato, imposta: imposta, muto: function (m) { imposta(null, m == null ? !st.m : !!m); },
             ascolta: function (f) { if (typeof f === 'function') ASCOLTA.push(f); }, misura: misura, ios: IOS,
             apri: apri, chiudi: chiudi, _ctx: CTX, _riaggancia: function () { if (RADICE) montaUI(); }};
})();
