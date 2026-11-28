/* GEM BRAWL — il «guscio» Discord (28/11/2026, _levelup/discord_gembrawl_2811).
   La pagina del gioco e' gembrawl.html (copia dell'index di Gem Brawl della mini app, strumenti/aggiorna_gembrawl.py) in un
   iframe a tutto schermo: <base href="./app/gembrawl/gioco/"> -> tutti i file arrivano dalla URL mapping /app gia' esistente.
   Allenamento coi bot = il gioco di sempre, TUTTO nella pagina (nessun server, nessun soldo), anche fuori da Discord.
   Nome e foto Discord del giocatore passano nell'indirizzo (?nome=, ?foto=, ?col=): li mette in pagina giochi/gembrawl/gb_dc.js.
   API: GXGemBrawl.avvia({pratica, io, onFine}) -> {chiudi()}   (oggi solo pratica: la partita fra persone del canale vuole il
   server, vedi NOTE.md, sezione PvP) */
(function () {
  'use strict';
  var VER = 'gb2811a';
  function avvia(o) {
    o = o || {};
    var S = {chiuso: false, t: 0};
    // l'audio nasce sul tocco del genitore (come per Smash)
    try { var AC = window.AudioContext || window.webkitAudioContext; if (AC) { if (!window.GSRT_AC) window.GSRT_AC = new AC(); if (window.GSRT_AC.state === 'suspended') window.GSRT_AC.resume(); } } catch (e) {}
    if (!window.tonUiDiario) window.tonUiDiario = function () {};
    var io = o.io || (window.GXD && window.GXD.io) || {};
    var q = new URLSearchParams();
    q.set('lang', 'it'); q.set('lobbyv', '0'); q.set('rete', '0'); q.set('menu', '0');
    if (io.nome) q.set('nome', String(io.nome).slice(0, 32));
    if (io.foto && /^\/avatar\//.test(io.foto)) q.set('foto', io.foto);
    if (io.colore && /^#[0-9a-fA-F]{6}$/.test(io.colore)) q.set('col', io.colore);
    q.set('v', VER);
    var root = document.createElement('div');
    root.className = 'gb-root';
    root.innerHTML = '<iframe class="gb-fr" title="Gem Brawl" allow="autoplay; gamepad"></iframe>' +
      '<button class="gb-esci" type="button" aria-label="Esci">Esci</button>' +
      '<div class="gb-stato" aria-live="polite">Carico Gem Brawl…</div>';
    document.body.appendChild(root);
    document.documentElement.classList.add('in-gioco'); document.documentElement.classList.add('gb-aperto');
    var fr = root.querySelector('.gb-fr'), esciB = root.querySelector('.gb-esci'), stato = root.querySelector('.gb-stato');
    fr.src = 'gembrawl.html?' + q.toString();
    fr.addEventListener('load', function () { stato.style.display = 'none'; try { fr.contentWindow.focus(); } catch (e) {} });
    // il tasto Esci c'e' solo sul titolo, nella lobby e a fine partita (fra il profilo e i trofei): in partita c'e' la pausa
    // del gioco con «Esci dalla partita», nelle altre schermate il «‹» del gioco. Mai sopra il HUD o le testate.
    var DOVE = {'s-titolo': 1, 's-home': 1, 's-fine': 1};
    S.t = setInterval(function () {
      var B = null, sc = null, fo = null;
      try { var w = fr.contentWindow; B = w && w.__brawl; sc = w && w.document.querySelector('.schermo.on'); fo = w && w.document.querySelector('.foglio.on, .tut-foglio.on'); } catch (e) {}
      var f = B && B.fase, si = !B || (!fo && sc && DOVE[sc.id] && !(f === 'partita' || f === 'finale' || f === 'carica' || f === 'via'));
      esciB.classList.toggle('gb-via', !si);
    }, 300);
    // diagnosi: la cartella del gioco arriva dalla URL mapping /app?
    try {
      fetch('app/gembrawl/gioco/taratura.js?v=fin2311b', {cache: 'no-store'}).then(function (r) {
        if (!r.ok && window.GXD) { (GXD.avvisi = GXD.avvisi || []).push('gembrawl: file del gioco ' + r.status + ' (URL mapping /app?)'); if (window.GXDiagnosi) window.GXDiagnosi(); }
      }, function () {});
    } catch (e) {}
    function chiudi() {
      if (S.chiuso) return;
      S.chiuso = true; clearInterval(S.t);
      try { fr.src = 'about:blank'; } catch (e) {}
      root.remove();
      document.documentElement.classList.remove('in-gioco'); document.documentElement.classList.remove('gb-aperto');
    }
    esciB.addEventListener('click', function () { chiudi(); if (o.onFine) o.onFine({ancora: false}); });
    window.GXGemBrawl._S = S;   // per le prove
    return {chiudi: chiudi};
  }
  window.GXGemBrawl = {avvia: avvia};
})();
