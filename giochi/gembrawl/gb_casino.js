/* GEM BRAWL in Discord SENZA il tema casino' (28/11/2026, decisione del proprietario). Gira dentro gembrawl.html, dopo gb_dc.js
   e PRIMA di ogni script del gioco. Solo strato Discord: la mini app e i file del gioco su gambler-bot-app non cambiano.
   1) eroi: via dalla scelta (e dai bot avversari) Gambler Bot (la slot machine) e Croupier; nomi, motti e racconti degli altri
      riscritti senza casino', slot, fiche, puntate («Samurai Jackpot» -> «Samurai»); la super del Samurai senza «777»;
      via i mini video delle abilita' (girati sul pavimento a roulette): resta la scheda a testo;
   2) mappe: «Sala Slot» -> «Cortile Neon», «Sala Roulette» -> «La Terrazza», «Il Caveau» -> «Il Chiostro», «Canyon del Jackpot» ->
      «Canyon Rosso» (il LOOK lo cambia render3d_dc.js: nessuna mappa usa piu' il tema «slot» con le slot machine e il velluto);
   3) immagini: le carte dei modi, la cassa delle arene (senza la fiche), l'icona della super del Samurai (senza 777) da arte/;
      il titolo e la lobby (slot sfocate, pedana a fiche ridipinta come palco) con un foglio di stile;
   4) disegni del 3D: render3d_dc.js chiama GBDC_SPRITE per fiche, sette, ciliegie e rulli (al loro posto gemme e stelle).
   Niente variabili globali libere a parte GBDC_SPRITE (usata da render3d_dc.js) e GXDC_CASINO (per le prove). */
(function () {
  'use strict';
  var ARTE = '../../../giochi/gembrawl/arte/';   // dalla <base> della pagina (/app/gembrawl/gioco/) alla cartella del guscio
  var VA = '?v=gb2811c';
  var VIA_EROI = {bot: 1, croupier: 1};
  var TESTI = {
    samurai: {nome: 'SAMURAI', motto_it: 'Un respiro. Un colpo.', motto_en: 'One breath. One strike.',
      sopra_it: 'Lo spadaccino che non sbaglia un fendente', sopra_en: 'The swordsman who never misses a cut',
      lore_it: 'Ha perso il suo signore e la sua casa in una sola notte, e da allora vaga da un\'arena all\'altra. Non parla e non si vanta: estrae, taglia, rinfodera. Il conto lo fa la lama.',
      lore_en: 'He lost his lord and his home in a single night, and since then he has wandered from arena to arena. He does not talk and he does not boast: draw, cut, sheathe. The blade keeps the score.'},
    buttafuori: {lore_it: 'Sta alla porta del club da quando ha aperto. Abito nero, occhiali scuri, auricolare: non ha mai dovuto alzare le mani due volte con la stessa persona. Nell\'arena fa lo stesso lavoro di sempre: decide chi resta e chi esce.',
      lore_en: 'He has stood at the club door since the day it opened. Black suit, dark glasses, earpiece: he has never had to lay hands on the same person twice. In the arena he does the same job as always: he decides who stays and who leaves.'},
    agamennone: {motto_it: 'Re dei re, re dell\'arena.', motto_en: 'King of kings, king of the arena.', sopra_it: 'Re dei re, re dell\'arena', sopra_en: 'King of kings, king of the arena',
      lore_it: 'Conquista ogni arena come si conquista una citta\': con lo scudo davanti e la lancia pronta. I suoi uomini lo seguono in falange, e quando alza la lancia la battaglia e\' gia\' sua.',
      lore_en: 'He takes every arena the way you take a city: shield in front, spear ready. His men follow him in phalanx, and when he raises the spear the battle is already his.'},
    lupo: {sopra_it: 'Il cameriere che non doveva vedere la luna', sopra_en: 'The waiter who should never see the moon',
      lore_it: 'Di giorno serviva ai tavoli con il gilet rosso stirato. Una notte di luna piena il locale rimase aperto fino all\'alba, e lui non torno\' mai piu\' al lavoro. Adesso caccia nell\'arena, e chi lo sente ululare sa che la partita e\' gia\' finita.',
      lore_en: 'By day he waited tables in a pressed red vest. One full-moon night the place stayed open until dawn, and he never went back to work. Now he hunts in the arena, and whoever hears him howl knows the game is already over.'},
    pistolero: {lore_it: 'Sei colpi nel tamburo e il sesto e\' sempre d\'oro. Aspetta col cappello calato sugli occhi: quando suona mezzogiorno, ha gia\' estratto.',
      lore_en: 'Six rounds in the cylinder and the sixth is always gold. He waits with his hat over his eyes: when noon strikes, he has already drawn.'},
    arciere: {motto_it: 'Un colpo, un bersaglio.', motto_en: 'One arrow, one target.', sopra_it: 'Un colpo, un bersaglio', sopra_en: 'One shot, one target',
      lore_it: 'Al tiro a segno del luna park non ha mai mancato un bersaglio, finche\' il padrone non l\'ha cacciato perche\' vinceva troppo. Adesso tira le sue frecce dall\'alto delle mura.',
      lore_en: 'At the fair\'s shooting gallery he never missed a target, until the owner threw him out for winning too much. Now he shoots his arrows from the top of the walls.'},
    pizzaiolo: {lore_it: 'Il suo forno non chiude mai e lui nemmeno: chi gli capita a tiro si prende una pizza bollente, al volo.',
      lore_en: 'His oven never closes and neither does he: whoever gets in range gets a hot pizza, airmail.'},
    dj: {motto_it: 'Alza il volume, abbassa la guardia.', motto_en: 'Pump the volume, drop your guard.', sopra_it: 'Alza il volume, abbassa la guardia', sopra_en: 'Turn the volume up, your guard down',
      lore_it: 'Suona nel club fino all\'alba. Con il basso giusto fa tremare i bicchieri, i muri e anche gli avversari.',
      lore_en: 'He plays the club until dawn. With the right bass he shakes glasses, walls and opponents too.'},
    veggente: {lore_it: 'Legge le carte nella sua tenda e non sbaglia mai una previsione: le previsioni le rende vere lei.',
      lore_en: 'She reads cards in her tent and never gets a prophecy wrong: she makes them come true.'},
    dama: {lore_it: 'Cura un giardino segreto: chi ci entra senza invito resta impigliato nei rovi.',
      lore_en: 'She tends a secret garden: whoever walks in uninvited gets caught in the brambles.'},
    asso: {lore_it: 'Il duellista piu\' paziente dell\'arena: aspetta solo il momento giusto. Quando colpisce, la partita e\' finita.',
      lore_en: 'The most patient duelist in the arena: he just waits for the right moment. When he strikes, the game is over.'},
    fante: {lore_it: 'Il paggio piu\' svelto della corte: colpo dopo colpo si guadagna la corazza e diventa il Cavaliere di Quadri.',
      lore_en: 'The quickest page at court: hit after hit he earns his armor and becomes the Knight of Diamonds.'}
  };
  var ABIL = {samurai: {sup: {nome_it: 'Tre fendenti', nome_en: 'Triple Slash',
    desc_it: 'Tre segni si accendono a terra e tre fendenti giganti cadono li\' uno dopo l\'altro; il terzo e\' il piu\' forte e stordisce.',
    desc_en: 'Three marks light up on the ground and three giant slashes fall there one after another; the third is the strongest and stuns.'}}};
  var MAPPE_NOMI = {slot: ['Cortile Neon', 'Neon Courtyard'], roulette: ['La Terrazza', 'The Terrace'],
    caveau: ['Il Chiostro', 'The Cloister'], canyon: ['Canyon Rosso', 'Red Canyon']};
  var IMG = [
    [/(^|\/)ui\/modo_(duello|sopr|gemme)\.webp(\?[^"')]*)?$/, function (m) { return ARTE + 'modo_' + m[2] + '.webp' + VA; }],
    [/(^|\/)arte_arene\/faccia_cassa\.webp(\?[^"')]*)?$/, function () { return ARTE + 'cassa.webp' + VA; }],
    [/(^|\/)ui\/icone_abilita\/samurai_ulti\.webp(\?[^"')]*)?$/, function () { return ARTE + 'samurai_ulti.webp' + VA; }],
    // il 3D precarica anche il tema «slot» (muri a slot machine, moquette): nessuna mappa lo usa piu', si prende quello del vicolo
    [/(^|\/)arte_arene\/(faccia|pav)_slot\.webp(\?[^"')]*)?$/, function (m) { return (m[1] || '') + 'arte_arene/' + m[2] + '_vicolo.webp'; }]
  ];
  function rimappa(u) {
    if (typeof u !== 'string' || u.indexOf(ARTE) >= 0) return u;
    for (var i = 0; i < IMG.length; i++) { var m = IMG[i][0].exec(u); if (m) return IMG[i][1](m); }
    return u;
  }
  var CONTA = {img: 0, stile: 0};
  window.GXDC_CASINO = {conta: CONTA, rimappa: rimappa};

  /* ── 1) immagini caricate dal codice (img.src = ..., new Image, TextureLoader del 3D) ── */
  try {
    var dsc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (dsc && dsc.set) Object.defineProperty(HTMLImageElement.prototype, 'src', {configurable: true, enumerable: dsc.enumerable,
      get: dsc.get, set: function (v) { var n = rimappa(v); if (n !== v) CONTA.img++; dsc.set.call(this, n); }});
    var sa = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (k, v) {
      if (this instanceof HTMLImageElement && String(k).toLowerCase() === 'src') { var n = rimappa(String(v)); if (n !== v) CONTA.img++; v = n; }
      return sa.call(this, k, v);
    };
  } catch (e) { console.warn('[gbdc casino] immagini', e && e.message); }

  /* ── 2) i dati del gioco, appena gli script li mettono in window ── */
  function trappola(nome, cura) {
    var val;
    try {
      Object.defineProperty(window, nome, {configurable: true, enumerable: true, get: function () { return val; },
        set: function (v) { try { cura(v); } catch (e) { console.warn('[gbdc casino] ' + nome, e && e.message); } val = v; }});
    } catch (e) { console.warn('[gbdc casino] trappola ' + nome, e && e.message); }
  }
  function senza(lista) { return (lista || []).filter(function (id) { return !VIA_EROI[id]; }); }
  trappola('CAST_UI', function (C) {
    if (C.ORDINE) C.ORDINE = senza(C.ORDINE);
    for (var id in TESTI) if (C.E && C.E[id]) for (var k in TESTI[id]) C.E[id][k] = TESTI[id][k];
  });
  trappola('EROI', function (E) {
    var m = senza(E.MOSTRATI || E.ORDINE);
    E.MOSTRATI = m; E.ORDINE = m;            // TUTTI resta (il motore li conosce), ma nessuno li mostra o li fa giocare ai bot
    for (var id in ABIL) for (var k in ABIL[id]) if (E[id] && E[id][k]) for (var f in ABIL[id][k]) E[id][k][f] = ABIL[id][k][f];
  });
  trappola('MAPPE', function (M) {
    for (var id in MAPPE_NOMI) if (M[id]) { M[id].nome_it = MAPPE_NOMI[id][0]; M[id].nome_en = MAPPE_NOMI[id][1]; }
  });
  // i mini video delle abilita' sono girati sul pavimento a roulette: senza ABILITA la scheda mostra il kit a testo (gioco.js)
  try { Object.defineProperty(window, 'ABILITA', {configurable: true, get: function () { return undefined; }, set: function () {}}); } catch (e) {}

  /* ── 3) disegni del 3D (render3d_dc.js): al posto di fiche, 7, ciliegie e rulli, gemme e stelle (bianche: le tinge il 3D) ── */
  function gemma(g, cx, cy, r) {
    g.beginPath();
    g.moveTo(cx - r * .62, cy - r * .5); g.lineTo(cx + r * .62, cy - r * .5); g.lineTo(cx + r, cy - r * .1);
    g.lineTo(cx, cy + r); g.lineTo(cx - r, cy - r * .1); g.closePath();
    g.lineJoin = 'round'; g.lineWidth = Math.max(4, r * .16); g.strokeStyle = 'rgba(0,0,0,.55)'; g.stroke();
    g.fillStyle = '#fff'; g.fill();
    g.beginPath(); g.moveTo(cx - r, cy - r * .1); g.lineTo(cx + r, cy - r * .1);
    g.moveTo(cx - r * .3, cy - r * .5); g.lineTo(cx, cy + r); g.lineTo(cx + r * .3, cy - r * .5);
    g.lineWidth = Math.max(2, r * .07); g.strokeStyle = 'rgba(0,0,0,.28)'; g.stroke();
  }
  function stella(g, cx, cy, r) {
    g.beginPath();
    for (var i = 0; i < 8; i++) { var a = -Math.PI / 2 + i * Math.PI / 4, rr = i % 2 ? r * .38 : r; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    g.closePath(); g.lineJoin = 'round'; g.lineWidth = Math.max(4, r * .14); g.strokeStyle = 'rgba(0,0,0,.5)'; g.stroke();
    g.fillStyle = '#fff'; g.fill();
  }
  window.GBDC_SPRITE = function (g, tipo) {
    try {
      g.save();
      if (tipo === 'fiche') gemma(g, 64, 60, 50);
      else if (tipo === 'sette') stella(g, 64, 64, 56);
      else if (tipo === 'ciliegie') { gemma(g, 40, 70, 28); gemma(g, 88, 70, 28); }
      else if (tipo === 'rulli') { gemma(g, 30, 64, 22); gemma(g, 64, 64, 22); gemma(g, 98, 64, 22); }
      g.restore();
    } catch (e) {}
  };

  // le celle dell'atlante del 3D che erano da sala giochi: X0 (panno verde dei tavoli) -> siepe; j0 (roulette) -> fontanella
  window.GBDC_ATLAS = function (h, d, cella) {
    try {
      if (cella === 'X0') {
        h.fillStyle = '#2d6a33'; h.fillRect(0, 0, d, d);
        for (var i = 0; i < 40; i++) {
          var x = (i * 37) % d, y = (i * 53 + (i % 3) * 11) % d, r = 6 + (i % 4) * 2;
          h.fillStyle = i % 2 ? 'rgba(120,190,90,.55)' : 'rgba(20,70,30,.55)';
          h.beginPath(); h.arc(x, y, r, 0, Math.PI * 2); h.fill();
        }
        h.strokeStyle = 'rgba(15,40,18,.6)'; h.lineWidth = 6; h.strokeRect(3, 3, d - 6, d - 6);
      } else if (cella === 'j0') {
        h.translate(d / 2, d / 2);
        var C = [['#b9b2a6', .5], ['#8e877c', .44], ['#2f7fc4', .4], ['#4aa3e0', .3], ['#8fd2ff', .16], ['#e8f7ff', .06]];
        for (var k = 0; k < C.length; k++) { h.fillStyle = C[k][0]; h.beginPath(); h.arc(0, 0, d * C[k][1], 0, Math.PI * 2); h.fill(); }
      }
    } catch (e) {}
  };

  // il segno per terra della super del Samurai (era un 7 rosso bordato d'oro): una stella dorata con la stessa luce
  window.GBDC_SETTE = function (g, w, h) {
    try {
      g.save(); g.translate(w / 2, h / 2);
      g.beginPath();
      for (var i = 0; i < 8; i++) { var a = -Math.PI / 2 + i * Math.PI / 4, rr = i % 2 ? w * .17 : w * .44; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      g.closePath(); g.lineJoin = 'round'; g.lineWidth = 10; g.strokeStyle = '#ffd23f'; g.stroke(); g.fillStyle = '#e0142f'; g.fill();
      g.restore();
    } catch (e) {}
  };

  /* ── 4) stile: titolo e lobby senza slot e senza pedana a fiche; dove l'HTML porta gia' l'url (innerHTML) si corregge dopo ── */
  var css = [
    '.tit-quadro{background-image:url("' + ARTE + 'titolo_v.webp' + VA + '")!important}',
    '@media (min-aspect-ratio:1/1){.tit-quadro{background-image:url("' + ARTE + 'titolo_o.webp' + VA + '")!important}}',
    '.lob-sfondo{background-image:url("' + ARTE + 'lobby_v.webp' + VA + '"),url("' + ARTE + 'titolo_v.webp' + VA + '")!important}',
    '@media (min-aspect-ratio:1/1){.lob-sfondo{background-image:url("' + ARTE + 'lobby_o.webp' + VA + '"),url("' + ARTE + 'titolo_o.webp' + VA + '")!important}}'
  ].join('');
  var st = document.createElement('style'); st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
  function uno(e) {
    if (e.tagName === 'IMG') { var s = e.getAttribute('src'), n = rimappa(s); if (n !== s) e.setAttribute('src', n); }
    var bs = e.style && e.style.backgroundImage;
    if (bs && /modo_|faccia_cassa|samurai_ulti/.test(bs)) {
      var nb = bs.replace(/url\((["']?)([^"')]+)["']?\)/g, function (t, q, u) { var r = rimappa(u); if (r !== u) CONTA.stile++; return 'url("' + r + '")'; });
      if (nb !== bs) e.style.backgroundImage = nb;
    }
  }
  function correggi(root) {
    if (root.nodeType !== 1) return;
    uno(root);
    var el = root.querySelectorAll('img[src],[style*="url("]');
    for (var i = 0; i < el.length; i++) uno(el[i]);
  }
  function via() {
    correggi(document.documentElement);
    new MutationObserver(function (rec) {
      for (var i = 0; i < rec.length; i++) {
        var r = rec[i];
        if (r.type === 'attributes') { if (r.target.nodeType === 1) uno(r.target); }
        else for (var j = 0; j < r.addedNodes.length; j++) correggi(r.addedNodes[j]);
      }
    }).observe(document.documentElement, {childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'style']});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', via); else via();
})();
