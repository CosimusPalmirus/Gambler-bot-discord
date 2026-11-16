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
  var q = new URLSearchParams(location.search);
  var P = null;
  try { if (parent && parent !== window && parent.GXD) P = parent.GXD; } catch (e) { P = null; }
  var CFG = {};
  try { CFG = (parent && parent.GX_CONFIG) || {}; } catch (e) { CFG = {}; }
  var io = (P && P.io) || {id: 'dc:0', nome: 'Giocatore', foto: ''};
  var D = window.GXDC = {
    gioco: q.get('gioco') || '', ticket: q.get('t') || '', pratica: q.get('p') === '1',
    sessione: (P && P.sessione) || '', io: io, partito: false, chiuso: false
  };
  function alCatalogo(cosa) {
    try { parent.postMessage({gx: cosa, gioco: D.gioco}, location.origin); } catch (e) {}
  }
  D.alCatalogo = alCatalogo;

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

  // ── il server real-time: indirizzo via la mapping /api, hello con la sessione Discord ──
  var api = CFG.apiBase || '/api';
  window.TW_WS_URL = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + api + '/turfws';
  // i nomi: il motore chiama i posti «Ace»/«Duke»; la pagina li usa nella scheda di fine. Dentro Discord ci sono persone
  // vere: al posto dei nomi del motore i nomi dei profili (gli stessi che la pagina mostra in partita)
  var NOMI = {};
  function sistema(ev) {
    var d = ev && ev.data;
    if (typeof d !== 'string' || (d.indexOf('"start"') < 0 && d.indexOf('"over"') < 0)) return ev;
    try {
      var m = JSON.parse(d), cambiato = false;
      if (m.t === 'start' && m.names && m.profiles) {
        Object.keys(m.names).forEach(function (u) {
          var n = m.profiles[u] && m.profiles[u].name;
          if (n && String(u).indexOf('dc:') === 0) { NOMI[u] = n; m.names[u] = n; cambiato = true; }
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
    if (D.ticket && RTD_G[D.gioco]) {
      window.RTD_TICKET = D.ticket; window.RTD_TICKET_GAME = D.gioco; window.RTD_GAME = D.gioco; window.RTD_PRACTICE = D.pratica;
      go('arc');
    } else {
      alCatalogo('errore');
      return;
    }
    // da qui in poi ogni uscita dalla partita torna al catalogo
    var go0 = window.go;
    window.go = function (id) {
      if (id === 'arc') return go0.apply(this, arguments);
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
      try { if (RTD.ws && RTD.ws.readyState === 1 && (RTD.ui === 'match' || RTD.ui === 'search')) RTD.ws.send(JSON.stringify({t: RTD.practice ? 'leave' : 'abbandona'})); } catch (e) {}
    });
    window.rtdPracAgain = function () { D.chiuso = true; alCatalogo('ancora'); };
    // dopo la partita la mini app rimette la lobby (posta, tavoli a soldi) sotto la scheda di fine: qui niente lobby,
    // sotto resta il campo dell'ultima partita
    window.rtdShowLobby = function () {};
    // la «rivincita vera» della mini app (XQ: {t:'riv_chiedi'} al server) non vale per Discord (verbo non permesso a un
    // dc:): spenta, cosi' «Rivincita» chiama rtdAgain qui sopra e il catalogo riapre la sala
    try { if (window.XQ) XQ.on = false; } catch (e) {}
    window.rtdPracToReal = function () { D.chiuso = true; alCatalogo('fine'); };
  }
  if (document.readyState === 'complete') setTimeout(entra, 0);
  else addEventListener('load', function () { setTimeout(entra, 0); });

  // ── i testi: niente soldi, niente marchio (come in Smash) ──
  var VIA = [
    [/\s*·?\s*gioca vera\b/gi, ''], [/\bgambler bot\b/gi, 'Mister Bot'], [/\bgambler\s+/gi, ''],
    [/\bfiche\b/gi, 'gettone'], [/\bpiatto\b/gi, 'partita'],
    [/\s*[·,-]?\s*nessuna posta,?\s*(e\s+)?nessun premio\.?/gi, ''], [/\s*[·,-]?\s*no stake,?\s*(and\s+)?no prize\.?/gi, ''],
    [/nessun premio:\s*è allenamento/gi, 'Solo allenamento'], [/no prize:\s*(it'?s )?practice/gi, 'Just practice'],
    [/\s*[·,-]?\s*nessun premio\.?/gi, ''], [/nessun euro in gioco/gi, ''], [/no euros? (at stake|in play)/gi, ''],
    [/(piatto|partita|pot)\s*€\s*[\d.,]+/gi, ''], [/[+-]?€\s?0[.,]00(?![\d])/g, ''],
    [/\bgambler\b/gi, ''], [/torna all[’']arena/gi, 'Torna ai giochi'], [/back to the arena/gi, 'Back to the games']
  ];
  function pulisci(n) {
    if (n.nodeType === 3) {
      var t = n.nodeValue, x = t;
      if (!t || t.length > 20000) return;
      for (var i = 0; i < VIA.length; i++) x = x.replace(VIA[i][0], VIA[i][1]);
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
})();
