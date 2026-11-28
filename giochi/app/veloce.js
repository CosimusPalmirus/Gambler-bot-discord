/* PRESTAZIONI (28/11/2026) — gira nel CATALOGO dell'Activity Discord (index.html, in testa). Niente cambi di aspetto o di regole.
   1) GXDC_VELOCE: la memoria dei documenti della mini app preparati da giochi/app/carica.js (index della mini app e pagine
      a parte). Prima, a OGNI apertura di un gioco, carica.js rimetteva in linea ~6 MB di script (56 file ml/), ci passava
      sopra le toppe e ne faceva ~70 blob; ora i blob li crea il catalogo (restano validi quando l'iframe del gioco si
      chiude) e dalla seconda apertura il documento preparato si riusa, ma SOLO se l'index online (riletto ogni volta,
      cache:'no-cache') e i file dello strato Discord sono identici, testo per testo. Se l'index online cambia, si rifa'.
   2) Appena si apre la scheda di un gioco della mini app, il documento si prepara in anticipo in un iframe nascosto
      (app.html?gxprepara=1: la stessa carica.js, si ferma prima di scrivere il documento): quando il catalogo ha il
      biglietto, l'index e' gia' scaricato e pronto. Chi apre il gioco mentre la preparazione e' in corso la aspetta
      (al massimo 20 s) invece di rifare gli stessi scaricamenti.
   3) Dentro Discord l'SDK (vendor/discord-sdk.js) si scarica subito, in parallelo agli altri file del catalogo, invece
      che dopo app.js (un giro di rete in meno prima del login).
   Senza questo file carica.js lavora come prima (compatibile nei due sensi). */
(function () {
  'use strict';
  if (window.GXDC_VELOCE) return;
  var MEMO = {}, ORDINE = [], ATTESE = {}, TETTO = 4;
  function lotto() {
    var L = {urls: [], blob: function (js) {
      var u = URL.createObjectURL(new Blob([js], {type: 'text/javascript'}));
      L.urls.push(u);
      return u;
    }};
    return L;
  }
  function uguali(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
  // un blob si butta solo dopo 2 minuti: un documento che lo sta ancora caricando non resta mai senza
  function butta(L) {
    if (!L || !L.urls.length) return;
    setTimeout(function () { L.urls.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (e) {} }); }, 120000);
  }
  var V = window.GXDC_VELOCE = {
    lotto: lotto,
    prendi: function (pag, crudi) { var m = MEMO[pag]; return (m && uguali(m.crudi, crudi)) ? m : null; },
    metti: function (pag, crudi, dati, L) {
      var m = MEMO[pag];
      if (m && uguali(m.crudi, crudi)) { butta(L); V.fatto(pag); return; }   // preparato due volte insieme: resta il primo
      if (m) butta(m.lotto);
      dati.crudi = crudi; dati.lotto = L; dati.t = Date.now();
      MEMO[pag] = dati;
      ORDINE = ORDINE.filter(function (k) { return k !== pag; }); ORDINE.push(pag);
      while (ORDINE.length > TETTO) { var k = ORDINE.shift(); if (MEMO[k]) { butta(MEMO[k].lotto); delete MEMO[k]; } }
      V.fatto(pag);
    },
    // una preparazione in corso per la stessa pagina: chi arriva dopo la aspetta (massimo 20 s)
    dopo: function (pag) {
      var a = ATTESE[pag];
      if (!a) return Promise.resolve();
      return Promise.race([a.p, new Promise(function (ok) { setTimeout(ok, 20000); })]);
    },
    fatto: function (pag) { var a = ATTESE[pag]; if (a) { delete ATTESE[pag]; a.ok(); } },
    scalda: function () {
      var pag = 'index.html';
      if (MEMO[pag] || ATTESE[pag] || !document.body) return;
      if (document.documentElement.classList.contains('in-gioco')) return;
      var a = {}; a.p = new Promise(function (ok) { a.ok = ok; }); ATTESE[pag] = a;
      var fr = document.createElement('iframe');
      fr.tabIndex = -1; fr.title = ''; fr.setAttribute('aria-hidden', 'true');
      fr.style.cssText = 'position:fixed;left:-20px;top:-20px;width:1px;height:1px;border:0;opacity:0;pointer-events:none';
      fr.src = 'app.html?gxprepara=1';
      document.body.appendChild(fr);
      a.p.then(function () { setTimeout(function () { try { fr.src = 'about:blank'; fr.remove(); } catch (e) {} }, 0); });
      setTimeout(function () { V.fatto(pag); }, 30000);   // mai appesi: dopo 30 s la si lascia perdere
    },
    _memo: MEMO
  };

  // 2) la scheda di un gioco della mini app si apre (una riga del catalogo o una lastra del carosello): si prepara l'index
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('.riga[data-id],.slide[data-id]') : null;
    if (!t) return;
    var app = (window.GX_CONFIG && GX_CONFIG.giochiApp) || [];
    if (app.indexOf(t.getAttribute('data-id')) < 0) return;
    setTimeout(V.scalda, 450);   // dopo l'animazione della scheda
  }, true);

  // 3) l'SDK di Discord subito (solo dentro Discord: fuori non si usa)
  try {
    var q = new URLSearchParams(location.search);
    if (q.has('frame_id') && q.has('instance_id')) {
      var l = document.createElement('link');
      l.rel = 'preload'; l.as = 'script'; l.href = 'vendor/discord-sdk.js';
      (document.head || document.documentElement).appendChild(l);
    }
  } catch (e) {}
})();
