/* GEM BRAWL dentro Discord (28/11/2026) — gira DENTRO gembrawl.html, PRIMA di ogni script del gioco.
   gembrawl.html = copia dell'index online di Gem Brawl (strumenti/aggiorna_gembrawl.py) con <base href="./app/gembrawl/gioco/">:
   tutti i file del gioco arrivano dalle Pages della mini app attraverso la URL mapping /app GIA' esistente.
   Al posto dello script di Telegram e dello <script> in linea (la CSP di discordsays.com non li permette) c'e' questo file:
     1) l'indirizzo: ?rete=0 (niente server: si gioca contro i bot, tutto nella pagina; spegne anche il menu online con
        Gratis/A soldi), ?lobbyv=0 (lobby leggera, senza i video dei piedistalli), ?lang=it; il nome arriva da ?nome=
        (lo legge gioco.js), la foto da ?foto= (percorso /avatar/... della URL mapping di Discord);
     2) niente soldi e niente marchio: via le fiche (contatore, VS, sipario, «+N fiches» a fine partita), via «nessuna puntata»;
     3) il giocatore Discord: la sua foto nel profilo della lobby, sulla sua carta del VS, sul suo posto a fine partita e in
        un cartellino in partita (nome + foto), al posto di «TU».
   Niente variabili globali libere (solo window.GXDC_GB per le prove); niente Telegram finto: il gioco resta in modo «browser». */
(function () {
  'use strict';
  var Q = new URLSearchParams(location.search), cambia = false;
  function metti(k, v) { if (!Q.has(k)) { Q.set(k, v); cambia = true; } }
  metti('rete', '0');
  metti('lobbyv', '0');
  metti('lang', 'it');
  metti('menu', '0');
  if (cambia) history.replaceState(null, '', location.pathname + '?' + Q.toString() + location.hash);
  var NOME = String(Q.get('nome') || '').trim().slice(0, 32);
  var FOTO = String(Q.get('foto') || '');
  if (!/^\/avatar\/[A-Za-z0-9_\/.\-?=&%]+$/.test(FOTO)) FOTO = '';   // solo la URL mapping /avatar (CSP: niente indirizzi esterni)
  var COLORE = /^#[0-9a-fA-F]{6}$/.test(Q.get('col') || '') ? Q.get('col') : '#8b83f0';
  var EN = Q.get('lang') === 'en';
  // nella pagina di prima l'iPhone scriveva un diario al genitore: qui il genitore e' il catalogo
  try { if (window.parent !== window && !window.parent.tonUiDiario) window.parent.tonUiDiario = function () {}; } catch (e) {}

  /* ── 2) stile: fiche via, foto del giocatore ── */
  var css = [
    '#h-fiche,.ris:has(#h-fiche),.vs-fiche,#sip .f{display:none!important}',
    '.gbdc-av{display:block;width:100%;height:100%;object-fit:cover;border-radius:inherit}',
    '.gbdc-ini{display:grid;place-items:center;width:100%;height:100%;font:700 22px/1 system-ui,sans-serif;color:#fff}',
    '#h-profilo .pf-avatar.gbdc-si>img:not(.gbdc-av){display:none!important}',
    '#h-profilo .pf-avatar.gbdc-si{background:#170d26}',
    '.vs-carta.io .gbdc-vs{position:absolute;z-index:3;left:50%;bottom:22%;transform:translateX(-50%);width:34%;max-width:46px;aspect-ratio:1;',
    'border-radius:50%;overflow:hidden;box-shadow:0 0 0 2px #120420,0 0 0 4px var(--verde,#3bff8b)}',
    '.fs-g.io .gbdc-fs{width:22px;height:22px;border-radius:50%;object-fit:cover;vertical-align:-6px;margin-right:5px;box-shadow:0 0 0 1.5px #fff}',
    '#gbdc-chip{position:fixed;z-index:40;left:50%;transform:translateX(-50%);bottom:calc(8px + var(--sa-b,0px));display:none;align-items:center;gap:7px;',
    'padding:3px 11px 3px 3px;border-radius:99px;background:rgba(12,7,24,.62);box-shadow:0 0 0 1.5px rgba(59,255,139,.85);pointer-events:none;',
    'font:700 13px/1 system-ui,-apple-system,"Segoe UI",sans-serif;color:#fff;max-width:46vw;white-space:nowrap}',
    '#gbdc-chip.su{display:flex}',
    '#gbdc-chip .gbdc-c{width:24px;height:24px;flex:none;border-radius:50%;overflow:hidden;background:' + COLORE + '}',
    '#gbdc-chip .gbdc-c .gbdc-ini{font-size:12px}',
    '#gbdc-chip span{overflow:hidden;text-overflow:ellipsis}',
    '@media (max-height:300px){#gbdc-chip{bottom:4px;padding:2px 8px 2px 2px;font-size:10px}#gbdc-chip .gbdc-c{width:16px;height:16px}}'
  ].join('');
  var st = document.createElement('style'); st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  function faccia(cls) {      // la foto Discord, o l'iniziale sul colore se non c'e'
    if (FOTO) { var im = document.createElement('img'); im.className = cls || 'gbdc-av'; im.alt = ''; im.draggable = false; im.src = FOTO; return im; }
    var d = document.createElement('span'); d.className = 'gbdc-ini'; d.style.background = COLORE; d.textContent = (NOME.charAt(0) || '?').toUpperCase(); return d;
  }

  /* ── testi: niente puntate, niente fiche ── */
  var VIA = [
    [/\s*·\s*nessuna puntata/gi, ''], [/\s*·\s*no stakes/gi, ''], [/nessuna puntata/gi, ''],
    [/\s*·\s*\+\d+\s*(fiches|chips)\b/gi, ''], [/\+\d+\s*(fiches|chips)\b/gi, ''], [/\bfiches?\b/gi, 'punti'],
    [/\bgambler\s*bot\b/gi, 'Mister Bot'], [/\bgambler\b/gi, '']
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

  /* ── 3) il giocatore Discord nella pagina ── */
  function profilo() {
    var a = document.querySelector('#h-profilo .pf-avatar');
    if (!a || a.classList.contains('gbdc-si')) return;
    a.classList.add('gbdc-si'); a.appendChild(faccia());
  }
  function versus() {       // la carta del giocatore nel VS: il suo nome al posto di «TU», la sua foto sopra l'eroe
    var c = document.querySelector('#c-blu .vs-carta.io');
    if (!c || c.querySelector('.gbdc-vs')) return;
    if (NOME) c.dataset.tu = NOME.slice(0, 14);
    var f = document.createElement('div'); f.className = 'gbdc-vs'; f.appendChild(faccia()); c.appendChild(f);
  }
  function fine() {         // a fine partita: «TU» -> foto + nome
    var g = document.querySelector('#f-squadre .fs-g.io > div');
    if (!g || g.querySelector('.gbdc-fs')) return;
    var em = g.querySelector('em'); if (!em) return;
    var testa = g.firstChild;
    if (testa && testa.nodeType === 3 && NOME) testa.nodeValue = NOME.slice(0, 12);
    var im = faccia('gbdc-fs'); if (im.tagName !== 'IMG') { im.className = 'gbdc-ini gbdc-fs'; im.style.display = 'inline-grid'; im.style.fontSize = '11px'; }
    g.insertBefore(im, g.firstChild);
    var mv = document.getElementById('f-mvp-nome');
    if (mv && NOME) mv.textContent = mv.textContent.replace(/^(TU|YOU) · /, NOME.slice(0, 14) + ' · ');
  }
  var chip = null;
  function cartellino() {   // in partita: nome + foto del giocatore, in basso al centro (fuori dalle levette e dal HUD)
    var B = window.__brawl, su = !!(B && (B.fase === 'partita' || B.fase === 'via') && NOME && !document.querySelector('.foglio.on, .tut-foglio.on'));
    if (su && !chip) {
      chip = document.createElement('div'); chip.id = 'gbdc-chip';
      var c = document.createElement('i'); c.className = 'gbdc-c'; c.appendChild(faccia());
      var s = document.createElement('span'); s.textContent = NOME;
      chip.appendChild(c); chip.appendChild(s); document.body.appendChild(chip);
    }
    if (chip) chip.classList.toggle('su', su);
  }
  function giro() {
    try { profilo(); versus(); fine(); cartellino(); } catch (e) { console.warn('[gbdc]', e && e.message); }
  }
  function via() {
    pulisci(document.body);
    new MutationObserver(function (rec) {
      for (var i = 0; i < rec.length; i++) {
        if (rec[i].type === 'characterData') pulisci(rec[i].target);
        else for (var j = 0; j < rec[i].addedNodes.length; j++) pulisci(rec[i].addedNodes[j]);
      }
      giro();
    }).observe(document.body, {childList: true, subtree: true, characterData: true});
    setInterval(giro, 400);
    giro();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', via); else via();
  window.GXDC_GB = {nome: NOME, foto: FOTO, en: EN};
})();
