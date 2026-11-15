/* Dentro arena.html (la pagina di Smash in modo Discord). Gira PRIMA del gioco.
   1) GBR3D_BASE: la cartella degli sprite della versione online (la scrive aggiorna_arena.py nell'indirizzo di
      questo script, ?b=...): nella mini app e' uno <script> in linea, qui un file (niente codice in linea).
   2) Niente soldi e nome neutro: via il tasto «GIOCA A SOLDI», via le fiche come icone, via il logo col marchio
      (al suo posto la scritta SMASH). Il resto del menu e del gioco e' quello della mini app. */
(function () {
  'use strict';
  var s = document.currentScript, m = s && /[?&]b=([^&]+)/.exec(s.src);
  window.GBR3D_BASE = m ? decodeURIComponent(m[1]) : 'sprite_32e9a3781b82/';
  var css = [
    '#gt [data-gt="soldi"],#gt .gt-gfiche,#gt .gt-logo .gt-n3,#gt .gt-logo .gt-fiche,#gt .gt-logo > svg{display:none!important}',
    '#gt .gt-logo{display:flex;align-items:center;justify-content:center}',
    '#gt .gt-logo::after{content:"SMASH";display:block;font:italic 900 clamp(46px,11vw,104px)/.9 GTAnton,"Arial Black",Impact,sans-serif;',
    'letter-spacing:.02em;color:#ffd23b;-webkit-text-stroke:3px #2a0040;paint-order:stroke fill;transform:rotate(-4deg);',
    'text-shadow:0 5px 0 #000,0 0 28px rgba(255,43,214,.75)}'
  ].join('');
  var st = document.createElement('style');
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
  document.title = 'Smash';
  // 3) i testi del menu che parlano di soldi o di fiche (la pagina e' quella della mini app): riscritti al volo
  var VIA = [
    [/\s*(online\s+)?gratis\s+o\s+a\s+soldi\s*·?\s*/gi, ''], [/\s*(online\s+)?free\s+or\s+for\s+money\s*·?\s*/gi, ''],
    [/fiche finisher/gi, 'Colpo finale'], [/\bgambler bot\b/gi, 'Mister Bot'], [/\bgambler smash\b/gi, 'Smash'], [/\bfiche\b/gi, 'colpo finale'], [/\bchip\b/gi, 'finisher']
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
