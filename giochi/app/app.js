/* DISCORD fase 2 — il guscio dei giochi della mini app nel catalogo.
   Apre app.html (la mini app online + strato Discord) in un iframe, gia' dentro la partita col biglietto preso dal
   catalogo; l'iframe dice quando si esce ({gx:'fine'|'ancora'|'esci'|'errore'}).
   API: GXApp.avvia({gioco, ticket, pratica, onFine}) -> {chiudi()} */
(function () {
  'use strict';
  function avvia(o) {
    var root = document.createElement('div');
    root.className = 'ap-root';
    root.innerHTML = '<iframe class="ap-fr" title="Gioco" allow="autoplay; fullscreen; gamepad"></iframe>';
    document.body.appendChild(root);
    document.documentElement.classList.add('in-gioco');
    var fr = root.querySelector('.ap-fr'), chiuso = false;
    // la tastiera va al gioco: via il fuoco dai tasti del catalogo (Spazio/Invio su un tasto nascosto lo ripremerebbe)
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {}
    function fuoco() { try { fr.focus(); fr.contentWindow.focus(); } catch (e) {} }
    fr.addEventListener('load', fuoco);
    setTimeout(fuoco, 300);
    fr.src = 'app.html?gioco=' + encodeURIComponent(o.gioco) + '&t=' + encodeURIComponent(o.ticket || '') + (o.pratica ? '&p=1' : '');
    function suMsg(ev) {
      if (ev.origin !== location.origin || ev.source !== fr.contentWindow) return;
      var d = ev.data; if (!d || typeof d !== 'object' || !d.gx) return;
      if (d.gx === 'fine' || d.gx === 'esci' || d.gx === 'ancora' || d.gx === 'errore') {
        chiudi();
        if (d.gx === 'errore' && window.GXD && GXD.toast) GXD.toast('Il gioco non si apre, riprova.');
        if (o.onFine) o.onFine({ancora: d.gx === 'ancora'});
      }
    }
    addEventListener('message', suMsg);
    function chiudi() {
      if (chiuso) return;
      chiuso = true;
      removeEventListener('message', suMsg);
      try { fr.src = 'about:blank'; } catch (e) {}
      root.remove();
      document.documentElement.classList.remove('in-gioco');
    }
    window.GXApp._fr = fr;   // per le prove
    return {chiudi: chiudi};
  }
  window.GXApp = {avvia: avvia};
})();
