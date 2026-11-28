/* DISCORD fase 2 — lo strato Discord della mini app (iniettato da carica.js IN TESTA all'index, prima di ogni script).
   - Telegram finto: initData VUOTA (il backend non la vedra' mai), l'utente e' il giocatore Discord (dc:<id>).
   - L'hello del server real-time porta la sessione Discord (dc) al posto dell'initData: un solo aggancio su
     WebSocket.send, cosi' valgono tutti i sette punti dell'index che mandano l'hello.
   - Le chiamate al backend della mini app (saldo, missioni, presenza...) NON partono: rispondono {} da qui.
     Comunque il server le rifiuterebbe (403 alla sessione Discord).
   - Si entra DIRETTAMENTE nella partita col biglietto che il catalogo ha preso da /discord/partita|coda;
     uscire dalla partita (qualunque «go» fuori da #arc, ESCI, ANCORA) lo si dice al catalogo (postMessage).
   NON contiene segreti. Non tocca soldi: la mini app qui non ha un saldo. */
(function () {
  'use strict';
  var FIGLIA = !!window.GXDC_FIGLIA;   // lotto 3: una pagina a parte (Lupus, Last Call...) dentro l'index
  // ── FOTO_VERE_1711 (17/11): le foto dei giocatori. L'avatar Discord (cdn.discordapp.com) e la copia del backend
  //    (62-238-17-24.sslip.io/foto/) dentro l'Activity passano SOLO dal proxy (URL mapping /avatar e /api): si riscrive
  //    l'indirizzo di ogni immagine, per l'index e per le pagine a parte. Solo questi due indirizzi, nient'altro.
  (function () {
    function rif(u) {
      if (typeof u !== 'string') return u;
      var m = /^https:\/\/cdn\.discordapp\.com\/(avatars\/.+)$/.exec(u);
      if (m) return '/.proxy/avatar/' + m[1];
      m = /^https:\/\/62-238-17-24\.sslip\.io\/(foto\/\d{3,20}\.jpg.*)$/.exec(u);
      if (m) return '/.proxy/api/' + m[1];
      return u;
    }
    window.GXDC_FOTO = rif;
    try {
      var IP = HTMLImageElement.prototype, d = Object.getOwnPropertyDescriptor(IP, 'src');
      if (d && d.set) Object.defineProperty(IP, 'src', {configurable: true, enumerable: d.enumerable, get: d.get,
        set: function (v) { d.set.call(this, rif(v)); }});
      var sa0 = Element.prototype.setAttribute;
      // PRESTAZIONI P10: solo sulle <img> (prima: OGNI setAttribute della pagina passava di qui)
      HTMLImageElement.prototype.setAttribute = function (k, v) {
        if (this instanceof HTMLImageElement && String(k).toLowerCase() === 'src') v = rif(String(v));
        return sa0.call(this, k, v);
      };
      // le <img> scritte con innerHTML non passano dal setter: le si corregge appena entrano (microtask, prima
      // che l'errore della CSP arrivi come evento)
      var ritocca = function (im) { var s = im.getAttribute('src'); if (s) { var t = rif(s); if (t !== s) sa0.call(im, 'src', t); } };
      new MutationObserver(function (lista) {
        for (var i = 0; i < lista.length; i++) {
          var r = lista[i];
          if (r.type === 'attributes') { if (r.target instanceof HTMLImageElement) ritocca(r.target); continue; }
          for (var j = 0; j < r.addedNodes.length; j++) {
            var n = r.addedNodes[j];
            if (n.nodeType !== 1) continue;
            if (n.tagName === 'IMG') ritocca(n);
            else if (n.getElementsByTagName) { var c = n.getElementsByTagName('img'); for (var k = 0; k < c.length; k++) ritocca(c[k]); }
          }
        }
      }).observe(document, {subtree: true, childList: true, attributes: true, attributeFilter: ['src']});
    } catch (e) { console.warn('[discord] foto', e); }
  })();
  var q = new URLSearchParams(location.search);
  var P = null;
  try { if (parent && parent !== window && parent.GXD) P = parent.GXD; } catch (e) { P = null; }
  var CFG = {};
  try { CFG = (parent && parent.GX_CONFIG) || {}; } catch (e) { CFG = {}; }
  var io = (P && P.io) || {id: 'dc:0', nome: 'Giocatore', foto: ''};
  var D = window.GXDC = {
    gioco: q.get('gioco') || '', ticket: q.get('t') || '', pratica: q.get('p') === '1', guarda: q.get('w') || '',
    sessione: (P && P.sessione) || '', io: io, partito: false, chiuso: false
  };
  function alCatalogo(cosa) {
    try { parent.postMessage({gx: cosa, gioco: D.gioco}, location.origin); } catch (e) {}
  }
  D.alCatalogo = alCatalogo;
  var EXTRA = {};                     // integrazione dei lotti 4-7: GXDC_EXTRA(id, {...}) (vedi fase2/INTEGRAZIONE.md)
  D.extra = EXTRA;
  function chiama(id, k, arg) { var X = EXTRA[id]; if (X && typeof X[k] === 'function') { try { X[k](arg); } catch (e) { console.warn('[discord] extra ' + id + '.' + k, e); } } }
  if (D.gioco) document.documentElement.classList.add('gx-' + D.gioco);
  if (FIGLIA) {
    try { var PD = parent.GXDC; if (PD) { D.io = PD.io; D.sessione = PD.sessione; D.gioco = PD.gioco; } } catch (e) {}
  }

  // ── Telegram finto (lo legge l'index all'avvio: S.userId, nome, foto) ──
  function nulla() {}
  var bot = {show: nulla, hide: nulla, onClick: nulla, offClick: nulla, setText: nulla, setParams: nulla, enable: nulla, disable: nulla, isVisible: false};
  window.Telegram = {WebApp: {
    __discord: true, initData: '', platform: 'discord', version: '8.0', colorScheme: 'dark',
    initDataUnsafe: {user: {id: String(io.id), first_name: String(io.nome || 'Giocatore'), username: '', photo_url: String(io.foto || ''), language_code: 'it'}},
    themeParams: {bg_color: '#000000', text_color: '#f2f2f4', button_color: '#8b83f0'},
    isExpanded: true, isFullscreen: false, viewportHeight: innerHeight, viewportStableHeight: innerHeight,
    safeAreaInset: {top: 0, bottom: 0, left: 0, right: 0}, contentSafeAreaInset: {top: 0, bottom: 0, left: 0, right: 0},
    ready: nulla, expand: nulla, close: function () { alCatalogo('esci'); }, requestFullscreen: nulla, exitFullscreen: nulla,
    lockOrientation: nulla, unlockOrientation: nulla, enableClosingConfirmation: nulla, disableClosingConfirmation: nulla,
    enableVerticalSwipes: nulla, disableVerticalSwipes: nulla, isVerticalSwipesEnabled: false,
    setHeaderColor: nulla, setBackgroundColor: nulla, setBottomBarColor: nulla, onEvent: nulla, offEvent: nulla,
    openLink: nulla, openTelegramLink: nulla, openInvoice: nulla, sendData: nulla, switchInlineQuery: nulla, shareToStory: nulla,
    showAlert: function (t, cb) { if (cb) cb(); }, showConfirm: function (t, cb) { if (cb) cb(true); }, showPopup: function (p, cb) { if (cb) cb('ok'); },
    HapticFeedback: {impactOccurred: nulla, notificationOccurred: nulla, selectionChanged: nulla},
    BackButton: bot, MainButton: bot, SecondaryButton: bot, SettingsButton: bot,
    CloudStorage: {getItem: function (k, cb) { if (cb) cb(null, ''); }, setItem: function (k, v, cb) { if (cb) cb(null, true); },
                   getItems: function (k, cb) { if (cb) cb(null, {}); }, removeItem: function (k, cb) { if (cb) cb(null, true); }},
    DeviceStorage: null, SecureStorage: null
  }};

  // ── gli on*="..." in linea (CSP di Discord: niente 'unsafe-inline') ──
  // Ogni attributo on* diventa la proprieta' el.on* compilata con new Function ('unsafe-eval' c'e'), con la stessa
  // catena di scope di un gestore in linea del browser: elemento -> form -> document -> globale. Tre reti:
  // MutationObserver (nodi nuovi e attributi cambiati), un ascoltatore in CATTURA sugli eventi (se un nodo e' nato e
  // ha ricevuto un evento nello stesso giro, prima che l'observer passi) e un passaggio sull'intero documento.
  var ON = ['onclick', 'onerror', 'onload', 'onmousedown', 'onmouseup', 'onmouseleave', 'onmouseenter', 'onmouseover',
            'onmouseout', 'ontouchstart', 'ontouchend', 'ontouchmove', 'ontouchcancel', 'oninput', 'onchange', 'onkeydown',
            'onkeyup', 'oncontextmenu', 'onscroll', 'onsubmit', 'onpointerdown', 'onpointerup', 'ondblclick', 'onfocus',
            'onblur', 'onanimationend', 'ontransitionend', 'onended', 'onplay', 'oncanplay', 'onloadeddata', 'onwheel'];
  var SEL_ON = ON.map(function (a) { return '[' + a + ']'; }).join(',');
  var cache = Object.create(null);
  D.gestori = 0; D.gestoriKo = 0;
  function compila(el, a) {
    var codice = el.getAttribute(a);
    var k = '_gx' + a;
    if (codice == null || el[k] === codice) return;
    el[k] = codice;
    var f = cache[codice];
    if (!f) {
      try {
        f = cache[codice] = new Function('event', 'with(this.ownerDocument||document){with(this.form||{}){with(this){' + codice + '\n}}}');
      } catch (e) { D.gestoriKo++; console.warn('[discord] gestore in linea non compilato', a, codice.slice(0, 80)); return; }
    }
    el[a] = function (ev) { return f.call(this, ev); };
    D.gestori++;
  }
  function converti(n) {
    if (!n || n.nodeType !== 1) return;
    if (n.attributes && n.attributes.length) for (var i = 0; i < ON.length; i++) if (n.hasAttribute(ON[i])) compila(n, ON[i]);
    if (n.firstElementChild) {
      var l = n.querySelectorAll(SEL_ON);
      for (var j = 0; j < l.length; j++) for (var q = 0; q < ON.length; q++) if (l[j].hasAttribute(ON[q])) compila(l[j], ON[q]);
    }
  }
  D.converti = converti;
  new MutationObserver(function (rec) {
    for (var i = 0; i < rec.length; i++) {
      var r = rec[i];
      if (r.type === 'attributes') compila(r.target, r.attributeName);
      else for (var j = 0; j < r.addedNodes.length; j++) converti(r.addedNodes[j]);
    }
  }).observe(document, {childList: true, subtree: true, attributes: true, attributeFilter: ON});
  ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'pointerdown', 'input', 'change', 'keydown', 'contextmenu']
    .forEach(function (t) {
      addEventListener(t, function (ev) {
        for (var el = ev.target; el && el.nodeType === 1; el = el.parentNode) {
          if (el.hasAttribute('on' + t)) compila(el, 'on' + t);
        }
      }, true);
    });
  document.addEventListener('DOMContentLoaded', function () { converti(document.documentElement); });

  // ── il marchio disegnato nelle tele (es. «GAMBLER» sul parquet del Basket): via anche lì ──
  (function () {
    var P2 = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
    if (!P2) return;
    ['fillText', 'strokeText'].forEach(function (k) {
      var o = P2[k];
      P2[k] = function (t) {
        // la moneta col «€» (cibo di Snake): una stella
        if (t === '€') { var b = Array.prototype.slice.call(arguments); b[0] = '★'; return o.apply(this, b); }
        if (typeof t === 'string' && t.indexOf('€') >= 0) {
          var e2 = Array.prototype.slice.call(arguments);
          e2[0] = t.replace(/€\s?(\d[\d.,]*)/g, '$1 pt').replace(/(\d[\d.,]*)\s?€/g, '$1 pt').replace(/€/g, '');
          return o.apply(this, e2);
        }
        if (typeof t === 'string' && /gambler|casin[oò]/i.test(t)) {
          var a = Array.prototype.slice.call(arguments);
          a[0] = t.replace(/\bgambler'?s?\s*/gi, '').replace(/\bcasin[oò]\s*/gi, '').trim();
          if (!a[0]) return;
          return o.apply(this, a);
        }
        return o.apply(this, arguments);
      };
    });
  })();

  if (FIGLIA) { try { if (parent.Telegram) window.Telegram = parent.Telegram; } catch (e) {} }

  // lotto 3: le pagine a parte della mini app (Lupus, Last Call, Kaiju, Dead Quiz...) hanno anche loro script e
  // gestori in linea: l'iframe che l'index apre su «lupus3d.html?...» si apre invece su figlia.html, che carica la
  // pagina vera attraverso /app e applica lo stesso strato (blob, gestori, testi) prima di scriverla.
  var FIGLIE = /^(lupus3d|lastcall|kaiju|deadmoney|geo|settemezzo|briscola|tappo|poker|poker5|blackjack|deadpeak|tavolo3d)\.html(\?|$)/;
  var PAGINE_EXTRA = [];             // integrazione: pagine a parte dichiarate dai lotti (GXDC_EXTRA ... pagina)
  function figlia(u) {
    var v = String(u == null ? '' : u);
    var pag = v.split('?')[0];
    if (!FIGLIE.test(v) && PAGINE_EXTRA.indexOf(pag) < 0) return v;
    return (window.GXDC_RADICE || '/') + 'giochi/app/figlia.html?pg=' + encodeURIComponent(v);
  }
  D.figlia = figlia;
  if (!FIGLIA) {
    var dSrc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'src');
    if (dSrc && dSrc.set) {
      // chi legge src (i gusci confrontano il loro indirizzo per non ricaricare) vede l'indirizzo ORIGINALE
      Object.defineProperty(HTMLIFrameElement.prototype, 'src', {configurable: true, enumerable: dSrc.enumerable,
        get: function () {
          var vero = dSrc.get.call(this);
          if (this.__gxsrc != null && this.__gxfig === vero) { try { return new URL(this.__gxsrc, document.baseURI).href; } catch (e) {} }
          return vero;
        },
        set: function (v) {
          var f = figlia(v);
          if (f !== String(v)) { this.__gxsrc = String(v); dSrc.set.call(this, f); this.__gxfig = dSrc.get.call(this); return; }
          this.__gxsrc = null;
          return dSrc.set.call(this, v);
        }});
    }
    var setA0 = Element.prototype.setAttribute, getA0 = Element.prototype.getAttribute;
    // PRESTAZIONI P10: valgono solo per gli <iframe> (prima: ogni getAttribute/setAttribute di ogni elemento ci passava)
    HTMLIFrameElement.prototype.setAttribute = function (n, v) {
      if (this instanceof HTMLIFrameElement && String(n).toLowerCase() === 'src') {
        var f = figlia(v);
        if (f !== String(v)) { this.__gxsrc = String(v); setA0.call(this, n, f); this.__gxfig = dSrc && dSrc.get ? dSrc.get.call(this) : f; this.__gxattr = f; return; }
        this.__gxsrc = null;
      }
      return setA0.call(this, n, v);
    };
    HTMLIFrameElement.prototype.getAttribute = function (n) {
      var v = getA0.call(this, n);
      if (this instanceof HTMLIFrameElement && this.__gxsrc != null && String(n).toLowerCase() === 'src' && v != null && v.indexOf('figlia.html?pg=') >= 0) return this.__gxsrc;
      return v;
    };
  }

  // ── il server real-time: indirizzo via la mapping /api, hello con la sessione Discord ──
  var api = CFG.apiBase || '/api';
  window.TW_WS_URL = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + api + '/turfws';
  // i nomi: il motore chiama i posti «Ace»/«Duke»; la pagina li usa nella scheda di fine. Dentro Discord ci sono persone
  // vere: al posto dei nomi del motore i nomi dei profili (gli stessi che la pagina mostra in partita)
  var NOMI = {};
  function sistema(ev) {
    var d = ev && ev.data;
    // PRESTAZIONI P7: si decodifica solo un messaggio di tipo start/over (prima: ogni messaggio che conteneva la parola)
    if (typeof d !== 'string' || !/"t"\s*:\s*"(?:start|over)"/.test(d)) return ev;
    try {
      var m = JSON.parse(d), cambiato = false;
      if (m.t === 'start' && m.names && m.profiles) {
        Object.keys(m.names).forEach(function (u) {
          var n = m.profiles[u] && m.profiles[u].name;
          if (n && String(u).indexOf('dc:') === 0) { NOMI[u] = n; m.names[u] = n; cambiato = true; }
          // il bot «Duke» (nome del motore) dentro Discord si chiama «Pixel»
          if (String(u).indexOf('bot:') === 0 && /^duke$/i.test(String(m.names[u] || ''))) {
            NOMI[u] = 'Pixel'; m.names[u] = 'Pixel'; if (m.profiles[u]) m.profiles[u].name = 'Pixel'; cambiato = true;
          }
        });
      } else if (m.t === 'start' && m.names) {
        Object.keys(m.names).forEach(function (u) {
          if (String(u).indexOf('bot:') === 0 && /^duke$/i.test(String(m.names[u] || ''))) { NOMI[u] = 'Pixel'; m.names[u] = 'Pixel'; cambiato = true; }
        });
      } else if (m.t === 'over' && m.winner && NOMI[m.winner]) { m.winner_name = NOMI[m.winner]; cambiato = true; }
      if (!cambiato) return ev;
      return new MessageEvent('message', {data: JSON.stringify(m), origin: ev.origin});
    } catch (e) { return ev; }
  }
  var dOnMsg = Object.getOwnPropertyDescriptor(WebSocket.prototype, 'onmessage');
  if (dOnMsg && dOnMsg.set) {
    Object.defineProperty(WebSocket.prototype, 'onmessage', {configurable: true, enumerable: dOnMsg.enumerable, get: dOnMsg.get,
      set: function (f) { dOnMsg.set.call(this, typeof f === 'function' ? function (ev) { return f.call(this, sistema(ev)); } : f); }});
  }
  var send0 = WebSocket.prototype.send;
  WebSocket.prototype.send = function (d) {
    if (typeof d === 'string' && d.indexOf('"hello"') >= 0 && D.sessione) {
      try {
        var m = JSON.parse(d);
        if (m && m.t === 'hello') {
          var n = {t: 'hello', dc: D.sessione};
          if (m.dl) n.dl = m.dl;
          if (m.rebind) n.rebind = m.rebind;
          d = JSON.stringify(n);
        }
      } catch (e) {}
    }
    return send0.call(this, d);
  };

  // ── il backend della mini app: niente chiamate (saldo, missioni, presenza, foto...) ──
  var fetch0 = window.fetch;
  window.fetch = function (input, init) {
    var u = (typeof input === 'string') ? input : (input && input.url) || '';
    if (u.indexOf('62-238-17-24.sslip.io') >= 0 || /^https?:\/\/(t\.me|tonapi\.io|toncenter\.com|tonviewer\.com)/.test(u)) {
      return Promise.resolve(new Response('{}', {status: 200, headers: {'Content-Type': 'application/json'}}));
    }
    return fetch0.apply(this, arguments);
  };
  var open0 = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (m, u) {
    var a = Array.prototype.slice.call(arguments);
    if (typeof u === 'string' && u.indexOf('62-238-17-24.sslip.io') >= 0) { a[0] = 'GET'; a[1] = 'data:application/json,%7B%7D'; }
    return open0.apply(this, a);
  };
  // niente benvenuto/onboarding: si entra da un collegamento diretto (la mini app lo salta con GB_DEEP)
  window.GB_DEEP = true;
  try { localStorage.setItem('gb_onboarded', '1'); } catch (e) {}
  // lotto 2: le tele delle carte su PC orizzontale prendono la forma della zona di gioco (larghe), invece della
  // colonna 1,5 del telefono. Solo i giochi in CARTE_LARGHE (provati uno per uno); il telefono non cambia.
  var CARTE_LARGHE = {uno: 1.25, unoc: 1.25, cucu: 1.25, uomonero: 1.0};   // rapporto alto/largo minimo per gioco
  window.GXDC_CARTE_LARGHE = CARTE_LARGHE;
  window.GXDC_RAPPORTO = function (g, wrap) {
    var X = EXTRA[g];
    if (X && typeof X.rapporto === 'function') { try { var rx = X.rapporto(wrap); if (rx) return rx; } catch (e) {} }
    if (!CARTE_LARGHE[g] || innerWidth < innerHeight * 1.15 || innerHeight < 320) return null;
    try {
      var r = wrap.getBoundingClientRect(), W = r.width || innerWidth, H = r.height || (innerHeight - 160);
      if (W < 500 || H < 240) return null;
      return Math.max(CARTE_LARGHE[g], Math.min(1.5, H / W));
    } catch (e) { return null; }
  };
  window.GXDC_LARGO = function (wrap) {
    // T1: la larghezza vera della zona di gioco (il 340 di riserva era la misura presa prima del layout)
    try {
      var r = wrap.getBoundingClientRect();
      var w = Math.round(r.width || (wrap.parentNode && wrap.parentNode.getBoundingClientRect().width) || innerWidth);
      return w > 0 ? w : 0;
    } catch (e) { return 0; }
  };

  // ── l'ingresso: dritti nella partita col biglietto del catalogo ──
  function entra() {
    if (D.partito) return;
    if (typeof window.go !== 'function' || typeof window.RTD_G === 'undefined' || typeof window.S === 'undefined') { setTimeout(entra, 80); return; }
    D.partito = true;
    try { if (!S.userId) S.userId = String(io.id); S.name = io.nome || S.name; } catch (e) {}
    document.documentElement.classList.add('gxdc');
    try { window.focus(); } catch (e) {}
    var XE = EXTRA[D.gioco];   // lotto 4: giochi col client loro (turf/glad/tank): entra(D) e schermo
    if (D.guarda && !D.ticket) {
      // lotto 10: SPETTATORE di una partita di un torneo del canale. Il biglietto firmato dal backend («lid:dct...») va al
      // ramo `watch` del server RT come il lid di una lobby aperta: la vista spettatore della mini app (RTD / Tank).
      document.documentElement.classList.add('gx-guarda');
      // la chat della mini app non vale dentro Discord (i verbi della chat non sono di un uid dc:) e la scheda di fine dello
      // spettatore non ha tasti: tornare al tabellone o seguire il vincitore lo fa il catalogo (torneo.js)
      try { var stg = document.createElement('style'); stg.textContent = 'html.gx-guarda .ut-chat{display:none!important}html.gx-guarda #arc-modal .tw-ov-btns{display:none!important}'; (document.head || document.documentElement).appendChild(stg); } catch (e) {}
      if (D.gioco === 'tank') { window.TKD_WATCH = D.guarda; go('tank'); }
      else if (RTD_G[D.gioco]) { window.RTD_GAME = D.gioco; window.RTD_WATCH = D.guarda; go('arc'); }
      else { alCatalogo('errore'); return; }
      setTimeout(function () { chiama(D.gioco, 'dopo', D); }, 0);
    } else if (D.ticket && XE && typeof XE.entra === 'function') {
      var aperto = false;
      try { aperto = !!XE.entra(D); } catch (e) { console.warn('[discord] extra ' + D.gioco + '.entra', e); }
      if (!aperto) { alCatalogo('errore'); return; }
      setTimeout(function () { chiama(D.gioco, 'dopo', D); }, 0);
    } else if (D.ticket && RTD_G[D.gioco]) {
      window.RTD_TICKET = D.ticket; window.RTD_TICKET_GAME = D.gioco; window.RTD_GAME = D.gioco; window.RTD_PRACTICE = D.pratica;
      go('arc');
      setTimeout(function () { chiama(D.gioco, 'dopo', D); }, 0);
    } else {
      alCatalogo('errore');
      return;
    }
    // da qui in poi ogni uscita dalla partita torna al catalogo
    var go0 = window.go;
    window.go = function (id) {
      if (id === 'arc' || (XE && XE.schermo && id === XE.schermo)) return go0.apply(this, arguments);
      clearTimeout(D.tAncora);
      if (!D.chiuso) { D.chiuso = true; alCatalogo('fine'); }
    };
    // «Rivincita» (rtdAgain) nella scheda di fine: dentro Discord torna al catalogo, che riapre la stessa sala / coda /
    // allenamento. «Torna all'Arena» e' rtdAgain();go('duel'): il go nello stesso giro vince e si esce e basta.
    window.rtdAgain = function () {
      clearTimeout(D.tAncora);
      D.tAncora = setTimeout(function () { if (!D.chiuso) { D.chiuso = true; alCatalogo('ancora'); } }, 0);
    };
    // chi chiude il gioco senza «Esci» (catalogo, finestra dell'Activity chiusa) lascia la partita: senza questo il
    // server lo rimetterebbe nella stessa stanza al gioco dopo (rientro), anche se sceglie un altro gioco
    addEventListener('pagehide', function () {
      try { if (RTD.ws && RTD.ws.readyState === 1 && (RTD.ui === 'match' || RTD.ui === 'search')) RTD.ws.send(JSON.stringify({t: (RTD.spec || RTD.specRid || D.guarda) ? 'unwatch' : (RTD.practice ? 'leave' : 'abbandona')})); } catch (e) {}
    });
    window.rtdPracAgain = function () { D.chiuso = true; alCatalogo('ancora'); };
    // dopo la partita la mini app rimette la lobby (posta, tavoli a soldi) sotto la scheda di fine: qui niente lobby,
    // sotto resta il campo dell'ultima partita
    window.rtdShowLobby = function () {};
    // Snake dentro Discord: niente fiche, dadi e monete da casino. Il corpo dei serpenti diventa a perle lucide,
    // il cibo frutta e gemme (stesse misure degli sprite originali, cosi' il disegno della partita non cambia)
    if (typeof window.snwSprite === 'function' && !window.snwSprite._gx) {
      var spr0 = window.snwSprite;
      var tela = function (s) { var c = document.createElement('canvas'); c.width = c.height = Math.max(2, Math.ceil(s)); return c; };
      var perla = function (c, col, scuro) {
        var s = Math.ceil(c * 1.1), cv = tela(s), x = cv.getContext('2d'), r = s / 2 - 1;
        x.translate(s / 2, s / 2);
        var g = x.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
        g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, col); g.addColorStop(1, scuro);
        x.fillStyle = g; x.beginPath(); x.arc(0, 0, r, 0, 6.283); x.fill();
        return cv;
      };
      var gemma = function (c, col, scuro, k) {
        var s = Math.ceil(c * (k || 1.0)), cv = tela(s), x = cv.getContext('2d'), r = s / 2 - 1;
        x.translate(s / 2, s / 2);
        x.fillStyle = scuro; x.beginPath(); x.moveTo(0, -r); x.lineTo(r * 0.9, -r * 0.2); x.lineTo(0, r); x.lineTo(-r * 0.9, -r * 0.2); x.closePath(); x.fill();
        x.fillStyle = col; x.beginPath(); x.moveTo(0, -r * 0.8); x.lineTo(r * 0.62, -r * 0.18); x.lineTo(0, r * 0.72); x.lineTo(-r * 0.62, -r * 0.18); x.closePath(); x.fill();
        x.fillStyle = 'rgba(255,255,255,.75)'; x.beginPath(); x.moveTo(0, -r * 0.8); x.lineTo(r * 0.3, -r * 0.2); x.lineTo(-r * 0.3, -r * 0.2); x.closePath(); x.fill();
        return cv;
      };
      var mela = function (c) {
        var s = Math.ceil(c * 0.9), cv = tela(s), x = cv.getContext('2d'), r = s / 2 - 1;
        x.translate(s / 2, s / 2 + r * 0.08);
        var g = x.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
        g.addColorStop(0, '#ff9a8a'); g.addColorStop(0.5, '#e8263a'); g.addColorStop(1, '#7a0a16');
        x.fillStyle = g; x.beginPath(); x.arc(0, r * 0.05, r * 0.82, 0, 6.283); x.fill();
        x.strokeStyle = '#5a3a1a'; x.lineWidth = Math.max(1, r * 0.12); x.beginPath(); x.moveTo(0, -r * 0.6); x.lineTo(r * 0.1, -r * 0.95); x.stroke();
        x.fillStyle = '#3ecf5a'; x.beginPath(); x.ellipse(r * 0.35, -r * 0.8, r * 0.3, r * 0.14, -0.5, 0, 6.283); x.fill();
        return cv;
      };
      window.snwSprite = function (c) {
        var R = spr0(c);
        if (R && !R._gx) {
          try {
            R.me = perla(c, '#38e1ff', '#0b5d78'); R.lui = perla(c, '#ff4d6d', '#7a1430');
            R.oro = gemma(c * 1.1, '#ffd75a', '#8a5a00'); R.rossa = gemma(c * 1.1, '#ff5a6e', '#5a0a16'); R.blu = gemma(c * 1.1, '#5b8cff', '#10225a');
            R.moneta = mela(c); R.dado = gemma(c * 0.82, '#7df3ff', '#0b5d78');
            R._gx = 1;
          } catch (e) {}
        }
        return R;
      };
      window.snwSprite._gx = 1;
    }
    // la «rivincita vera» della mini app (XQ: {t:'riv_chiedi'} al server) non vale per Discord (verbo non permesso a un
    // dc:): spenta, cosi' «Rivincita» chiama rtdAgain qui sopra e il catalogo riapre la sala
    try { if (window.XQ) XQ.on = false; } catch (e) {}
    window.rtdPracToReal = function () { D.chiuso = true; alCatalogo('fine'); };
  }
  if (!FIGLIA) {
    if (document.readyState === 'complete') setTimeout(entra, 0);
    else addEventListener('load', function () { setTimeout(entra, 0); });
  }

  // ── i testi: niente soldi, niente marchio (come in Smash) ──
  var VIA = [
    [/\s*·?\s*gioca vera\b/gi, ''], [/\bgambler bot\b/gi, 'Mister Bot'], [/\bgambler\s+/gi, ''],
    [/\bfiche\b/gi, 'gettone'], [/\bpiatto\b/gi, 'partita'],
    [/\s*[·,-]?\s*nessuna posta,?\s*(e\s+)?nessun premio\.?/gi, ''], [/\s*[·,-]?\s*no stake,?\s*(and\s+)?no prize\.?/gi, ''],
    [/nessun premio:\s*è allenamento/gi, 'Solo allenamento'], [/no prize:\s*(it'?s )?practice/gi, 'Just practice'],
    [/\s*[·,-]?\s*nessun premio\.?/gi, ''], [/nessun euro in gioco/gi, ''],
    [/\s*[:·,-]?\s*nessuna puntata\.?/gi, ''], [/\s*[:·,-]?\s*niente soldi in palio\.?/gi, ''], [/\s*[:·,-]?\s*no money at stake\.?/gi, ''], [/verifica della posta/gi, 'Preparo il tavolo'], [/checking (the )?stake/gi, 'Setting up the table'], [/no euros? (at stake|in play)/gi, ''],
    [/(piatto|partita|pot)\s*€\s*[\d.,]+/gi, ''], [/[+-]?€\s?0[.,]00(?![\d])/g, ''],
    [/€\s?(\d[\d.,]*)/g, '$1 pt'], [/(\d[\d.,]*)\s?€/g, '$1 pt'],   // cifre del gioco (es. l'asta di Lupus): punti, non euro
    [/\bbisca\b/gi, 'Mano sul mazzo'],   // nome neutro deciso in fase 1
    [/\bgambler\b/gi, ''], [/torna all[’']arena/gi, 'Torna ai giochi'], [/back to the arena/gi, 'Back to the games']
  ];
  // PRESTAZIONI P6: le 25 regole di base si provano solo se nel testo c'e' una delle loro parole (ognuna delle regole ne
  // contiene almeno una: senza parola-spia nessuna puo' cambiare niente). Le regole aggiunte dai giochi si provano sempre.
  var VIA_BASE = VIA.length, VIA_SPIA = /gioca vera|gambler|fiche|piatto|posta|stake|premio|prize|euro|puntata|soldi|money|€|bisca|arena/i;
  function pulisci(n) {
    if (n.nodeType === 3) {
      var t = n.nodeValue, x = t;
      if (!t || t.length > 20000) return;
      for (var i = VIA_SPIA.test(t) ? 0 : VIA_BASE; i < VIA.length; i++) x = x.replace(VIA[i][0], VIA[i][1]);
      if (x !== t) n.nodeValue = x;
      return;
    }
    if (n.nodeType !== 1 || n.tagName === 'SCRIPT' || n.tagName === 'STYLE' || n.tagName === 'CANVAS') return;
    for (var c = n.firstChild; c; c = c.nextSibling) pulisci(c);
  }
  new MutationObserver(function (rec) {
    for (var i = 0; i < rec.length; i++) {
      if (rec[i].type === 'characterData') pulisci(rec[i].target);
      else for (var j = 0; j < rec[i].addedNodes.length; j++) pulisci(rec[i].addedNodes[j]);
    }
  }).observe(document.documentElement, {childList: true, subtree: true, characterData: true});

  // ── integrazione dei lotti: ogni gioco si registra (giochi/app/extra.js, costruito dall'integratore) ──
  window.GXDC_EXTRA = function (id, o) {
    o = o || {};
    EXTRA[id] = o;
    if (o.pagina && PAGINE_EXTRA.indexOf(o.pagina) < 0) PAGINE_EXTRA.push(o.pagina);
    if (id !== D.gioco) return;
    // i testi di un gioco valgono solo quando e' aperto QUEL gioco
    if (o.testi && o.testi.length) for (var i = 0; i < o.testi.length; i++) VIA.push(o.testi[i]);
    chiama(id, 'prima', D);
    if (FIGLIA) addEventListener('load', function () { chiama(id, 'dopo', D); chiama(id, 'figlia', window); });
  };
  if (FIGLIA) { document.documentElement.classList.add('gxdc'); if (D.gioco) document.documentElement.classList.add('gx-' + D.gioco); }
})();
