/* SMASH — il «guscio» Discord (fase 1d, 15/11/2026).
   La pagina del gioco e' arena.html (copia di smash.html della mini app, stessa cartella smash/ letta attraverso la
   URL mapping /smash -> cosimuspalmirus.github.io/gambler-bot-app/smash). Qui sta solo quello che nella mini app fa
   index.html (GSRT, rtdShowSmashRT): l'iframe, la socket col server real-time, il relay dei messaggi, l'uscita.
   Niente soldi: nessun GSSOLDI (il menu della pagina resta quello senza soldi), stanze solo gratis.
   API: GXSmash.avvia({pratica, ticket, sessione, wsUrl, io, onFine}) -> {chiudi()}
     pratica: true = il menu del gioco con l'allenamento coi bot (tutto nella pagina, nessun server). */
(function () {
  'use strict';
  var ORIGINE = location.origin;
  var CODA_MAX = 4000, TETTO_FINE = 11000;
  // nella mini app il diario va al backend: qui non serve (la pagina lo chiama se c'e')
  if (!window.tonUiDiario) window.tonUiDiario = function () {};

  // ── la lista bianca di cio' che sale (copiata da index.html, gsrtSu) ──
  function intero(x, lo, hi) { return typeof x === 'number' && isFinite(x) && Math.floor(x) === x && x >= lo && x <= hi; }
  function testo(x, max, re) { return typeof x === 'string' && x.length > 0 && x.length <= max && (!re || re.test(x)); }
  var RE_ID = /^[a-z0-9_]+$/, RE_B64 = /^[A-Za-z0-9+\/=]+$/, RE_HEX = /^[0-9a-f]+$/;
  function su(o) {
    if (!o || typeof o !== 'object' || o.t !== 'gs') return null;
    switch (o.o) {
      case 'ver': return testo(o.v, 40, null) ? {t: 'gs', o: 'ver', v: o.v} : null;
      case 'sc': return testo(o.f, 16, RE_ID) ? (o.ok === 1 ? {t: 'gs', o: 'sc', f: o.f, ok: 1} : {t: 'gs', o: 'sc', f: o.f}) : null;
      case 'ok': return {t: 'gs', o: 'ok'};
      case 'i': return (intero(o.f, 0, 2147483647) && testo(o.d, 160, RE_B64)) ? {t: 'gs', o: 'i', f: o.f, d: o.d} : null;
      case 'p': return (typeof o.c === 'number' && isFinite(o.c)) ? {t: 'gs', o: 'p', c: o.c} : null;
      case 'h': return (intero(o.f, 0, 2147483647) && testo(o.h, 8, RE_HEX)) ? {t: 'gs', o: 'h', f: o.f, h: o.h} : null;
      case 'fine': return (intero(o.f, 0, 2147483647) && testo(o.h, 8, RE_HEX)) ? {t: 'gs', o: 'fine', f: o.f, h: o.h} : null;
      case 'q': return (intero(o.p, 0, 3) && intero(o.f, 0, 2147483647)) ? {t: 'gs', o: 'q', p: o.p, f: o.f} : null;
      case 'rs': return {t: 'gs', o: 'rs'};
      case 'bg': return {t: 'gs', o: 'bg'};
    }
    return null;
  }
  function soloRelay(m) { return !!(m && m.t === 'gs' && (m.o === 'i' || m.o === 'a' || m.o === 'pp')); }
  function senzaEventi(m) { return !!(m && m.t === 's' && !(m.feed && m.feed.length)); }

  function avvia(o) {
    var S = {ws: null, pronto: false, coda: [], start: null, over: null, fine: false, chiuso: false, tent: 0, tFine: 0, me: ''};
    // l'audio nasce sul tocco del genitore (come in index.html): la pagina usa GSRT_AC se c'e'
    try { var AC = window.AudioContext || window.webkitAudioContext; if (AC) { if (!window.GSRT_AC) window.GSRT_AC = new AC(); if (window.GSRT_AC.state === 'suspended') window.GSRT_AC.resume(); } } catch (e) {}
    var root = document.createElement('div');
    root.className = 'sm-root' + (o.pratica ? ' sm-pratica' : '');
    root.innerHTML = '<iframe class="sm-fr" title="Smash" allow="autoplay; fullscreen; gamepad"></iframe>' +
      '<button class="sm-esci" type="button" aria-label="Esci">Esci</button>' +
      '<div class="sm-stato" aria-live="polite"></div>' +
      '<div class="sm-fine" hidden><div class="sm-fine-box"><h3></h3><p></p><div class="sm-fine-tasti">' +
      '<button class="t1 sm-ancora" type="button">Gioca ancora</button><button class="t2 sm-torna" type="button">Torna ai giochi</button></div></div></div>';
    document.body.appendChild(root);
    document.documentElement.classList.add('in-gioco');
    var fr = root.querySelector('.sm-fr');
    var $ = function (s) { return root.querySelector(s); };
    function stato(t) { var s = $('.sm-stato'); s.textContent = t || ''; s.style.display = t ? '' : 'none'; }
    stato(o.pratica ? '' : 'Mi collego al tavolo…');
    fr.src = 'arena.html?' + (o.pratica ? '' : 'guscio=1&') + 'lang=it&v=1611c';
    // 16/11 diagnosi: la cartella del gioco arriva dalla URL mapping /smash? e l'arena risponde?
    (function () {
      var G = window.GXD || {}, d = function (t) { (G.avvisi = G.avvisi || []).push('smash: ' + t); if (window.GXDiagnosi) window.GXDiagnosi(); };
      try {
        fetch('smash/roster.js?v=ec4e2a7b64d4', {cache: 'no-store'}).then(function (r) {
          if (!r.ok) d('file del gioco ' + r.status + ' (URL mapping /smash?)');
        }, function (e) { d('file del gioco non raggiungibili: ' + (e && e.message)); });
      } catch (e) { d('fetch: ' + e.message); }
      setTimeout(function () { if (!S.chiuso && !S.pronto) d('arena ferma dopo 25 s'); }, 25000);
    })();

    function posta(m) { try { fr.contentWindow.postMessage({gs: 'giu', m: m}, ORIGINE); } catch (e) {} }
    function giu(m) {
      if (S.chiuso) return;
      if (S.pronto) { posta(m); return; }
      if (soloRelay(m)) return;
      var c = S.coda, i;
      if (senzaEventi(m)) for (i = c.length - 1; i >= 0; i--) if (senzaEventi(c[i])) { c.splice(i, 1); break; }
      c.push(m);
      if (c.length > CODA_MAX) c.splice(0, 1);
    }
    // i bordi del telefono: dentro l'iframe env(safe-area-inset-*) vale 0, li passa il genitore
    function bordi() {
      try {
        var cs = getComputedStyle(document.documentElement);
        var q = function (v) { var n = parseFloat(cs.getPropertyValue(v)) || 0; return Math.max(0, Math.min(200, Math.round(n))); };
        posta({t: 'bordi', hudTop: q('--discord-safe-area-inset-top'), top: q('--discord-safe-area-inset-top'),
               bottom: q('--discord-safe-area-inset-bottom'), left: q('--discord-safe-area-inset-left'), right: q('--discord-safe-area-inset-right')});
      } catch (e) {}
    }
    function manda(m) { if (S.ws && S.ws.readyState === 1) try { S.ws.send(JSON.stringify(m)); } catch (e) {} }

    function suMessaggio(ev) {
      if (ev.origin !== ORIGINE || ev.source !== fr.contentWindow) return;
      var d = ev.data; if (!d || typeof d !== 'object' || d.gs === undefined) return;
      if (d.gs === 'su') { if (o.pratica || S.fine) return; var x = su(d.m); if (x) manda(x); return; }
      if (d.gs === 'pronto') {
        S.pronto = true; bordi();
        if (o.pratica) { posta({t: 'menu'}); return; }
        var c = S.coda; S.coda = [];
        for (var i = 0; i < c.length; i++) posta(c[i]);
        return;
      }
      if (d.gs === 'fine_scena') { if (S.over) mostraFine(S.over); return; }
      if (d.gs === 'esci') { esci(); return; }
      if (d.gs === 'err') { console.warn('[smash]', d.msg); }
    }
    addEventListener('message', suMessaggio);

    /* ── la socket (solo in rete) ── */
    function collega() {
      if (S.chiuso || o.pratica) return;
      var ws; try { ws = new WebSocket(o.wsUrl); } catch (e) { mostraFine({errore: true}); return; }
      S.ws = ws;
      ws.onopen = function () { ws.send(JSON.stringify({t: 'hello', dc: o.sessione})); };
      ws.onmessage = function (e) { var m; try { m = JSON.parse(e.data); } catch (x) { return; } ricevi(m); };
      ws.onclose = function () {
        if (S.chiuso || S.fine) return;
        if (S.tent++ < 6) { stato('Riconnessione…'); setTimeout(collega, 600 * S.tent); } else mostraFine({errore: true});
      };
    }
    var tPing = o.pratica ? 0 : setInterval(function () { manda({t: 'ping', ts: Date.now()}); }, 4000);
    function ricevi(m) {
      var t = m.t;
      if (t === 'gs') { giu(m); return; }   // il relay degli input: per primo
      if (t === 's') { if (m.g === 'smash') giu(m); return; }
      if (t === 'hello_ok') {
        S.me = String(m.uid || '');
        if (S.start && !S.over) manda({t: 'rientra'}); else if (!S.start) manda({t: 'join_ticket', ticket: o.ticket, game: 'smash'});
        return;
      }
      if (t === 'start') { S.start = m; S.tent = 0; stato(''); giu(m); return; }
      if (t === 'over') {
        S.over = m; giu(m);
        clearTimeout(S.tFine); S.tFine = setTimeout(function () { mostraFine(m); }, TETTO_FINE);
        return;
      }
      if (t === 'esce' && m.game === 'smash') { giu(m); return; }
      if (t === 'err') {
        if (/^gs_/.test(String(m.code || ''))) { giu(m); return; }
        if (!S.start) {
          var testi = {discord_pieno: 'Tutti i tavoli gratis sono occupati: riprova tra poco.', 'ticket scaduto': 'La partita è scaduta prima di cominciare.',
                       'auth failed': 'Accesso non riuscito: riapri l’attività.'};
          mostraFine({errore: true, testo: testi[m.msg] || 'Partita non disponibile.'});
        }
      }
    }

    /* ── fine e uscita ── */
    function nome(uid) {
      var p = S.start && S.start.profiles && S.start.profiles[uid];
      return (p && p.name) || (S.start && S.start.names && S.start.names[uid]) || '';
    }
    function mostraFine(m) {
      if (S.chiuso || S.fine) return;
      S.fine = true; clearTimeout(S.tFine);
      var box = $('.sm-fine'), h = box.querySelector('h3'), p = box.querySelector('p');
      if (m.errore) { h.textContent = 'Partita non partita'; p.textContent = m.testo || 'La connessione si è interrotta.'; }
      else if (m.annullata) { h.textContent = 'Partita annullata'; p.textContent = m.motivo === 'versione' ? 'Una pagina del gioco era vecchia: riapri l’attività.' : 'La partita non è arrivata in fondo.'; }
      else if (m.abbandono) { h.textContent = 'Hai lasciato l’arena'; p.textContent = 'Si gioca gratis: non hai perso niente.'; }
      else if (m.motivo === 'pari' && m.winner == null) { h.textContent = 'Pareggio'; p.textContent = 'Tempo scaduto alla pari.'; }
      else if (m.you_won) { h.textContent = 'Hai vinto'; p.textContent = 'L’arena è tua.'; }
      else { var w = m.winner_name || nome(m.winner); h.textContent = w ? 'Vince ' + w : 'Partita finita'; p.textContent = 'Si gioca ancora?'; }
      box.querySelector('.sm-ancora').onclick = function () { chiudi(); if (o.onFine) o.onFine({ancora: true, esito: m}); };
      box.querySelector('.sm-torna').onclick = function () { chiudi(); if (o.onFine) o.onFine({ancora: false, esito: m}); };
      box.hidden = false;
      setTimeout(function () { try { box.querySelector('.sm-ancora').focus({preventScroll: true}); } catch (e) {} }, 50);
    }
    function esci() {
      if (o.pratica || S.fine || !S.start) {
        if (!o.pratica && !S.start && !S.fine) manda({t: 'leave'});
        chiudi(); if (o.onFine) o.onFine({ancora: false}); return;
      }
      if (S.over) { mostraFine(S.over); return; }
      manda({t: 'abbandona'});
      setTimeout(function () { if (!S.fine) mostraFine(S.over || {abbandono: true}); }, 2500);
    }
    $('.sm-esci').addEventListener('click', esci);

    function chiudi() {
      if (S.chiuso) return;
      S.chiuso = true;
      clearInterval(tPing); clearTimeout(S.tFine);
      removeEventListener('message', suMessaggio);
      try { if (S.ws) S.ws.close(); } catch (e) {}
      try { fr.src = 'about:blank'; } catch (e) {}
      root.remove();
      document.documentElement.classList.remove('in-gioco');
    }
    collega();
    window.GXSmash._S = S;   // per le prove
    return {chiudi: chiudi};
  }
  window.GXSmash = {avvia: avvia};
})();
