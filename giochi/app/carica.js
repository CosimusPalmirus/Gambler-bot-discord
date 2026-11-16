/* DISCORD fase 2 — carica la mini app ONLINE (URL mapping /app -> cosimuspalmirus.github.io/gambler-bot-app) e la apre
   con lo strato Discord applicato AL VOLO: niente copia da 12 MB nel repo Discord, il gioco e' sempre quello online.

   PERCHE' COSI' (CSP vera di discordsays.com, letta il 16/11/2026):
     script-src 'self' 'unsafe-eval' 'nonce-<a caso>' blob:   -> NIENTE script in linea, NIENTE onclick="..." in linea.
   L'index della mini app e' fatto tutto di script in linea (52) e ~850 onclick. Quindi:
     1) ogni <script> in linea diventa <script src="blob:..."> (stesso testo, stesso ordine, stesso scope globale:
        sono script classici veri, let/const di testa condivisi come prima);
     2) gli on*="..." in linea li compila shell.js con new Function (permesso da 'unsafe-eval') e li mette come
        proprieta' (el.onclick = f), con la stessa catena di scope del browser (elemento, form, document).
   Toppe CONTATE sul testo (se un'ancora manca la toppa si salta e lo si scrive in console: mai una pagina rotta
   per una toppa di comodo). Lo strato vero sta in shell.js (gira PRIMA di ogni script dell'index) e shell.css. */
(function () {
  'use strict';
  var radice = location.pathname.replace(/[^\/]*$/, '');      // la cartella di app.html ('/' dentro Discord)
  var APP = radice + 'app/';
  var VER = '20261116f2';
  function testo(u) { return fetch(u, {cache: 'no-cache'}).then(function (r) { if (!r.ok) throw new Error(u + ' ' + r.status); return r.text(); }); }
  function attesa(t) { var e = document.getElementById('gx-attesa'); if (e) e.textContent = t; }
  function toppa(html, nome, re, a) {
    var n = (html.match(new RegExp(re.source, 'g')) || []).length;
    if (n !== 1) { console.warn('[discord] toppa saltata: ' + nome + ' (' + n + ' ancore)'); return html; }
    return html.replace(re, a);
  }
  function blob(js) { return URL.createObjectURL(new Blob([js], {type: 'text/javascript'})); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }

  // gli script in linea -> script blob:. Scorre l'HTML come il parser: salta commenti e <style>, e da <script> salta
  // dritto a </script> (il testo di uno script non si guarda). Verificato sull'index 34f1fe36: 54 script, come html.parser.
  function scriptInBlob(html) {
    var L = html.toLowerCase(), out = [], i = 0, n = 0, fatto = 0;   // i = dove si cerca, fatto = fin dove si e' copiato
    for (;;) {
      var a = L.indexOf('<!--', i), b = L.indexOf('<script', i), c = L.indexOf('<style', i);
      var k = -1;
      [a, b, c].forEach(function (x) { if (x >= 0 && (k < 0 || x < k)) k = x; });
      if (k < 0) break;
      if (k === a) { var fa = L.indexOf('-->', a + 4); if (fa < 0) break; i = fa + 3; continue; }
      if (k === c) { var fc = L.indexOf('</style', c); if (fc < 0) break; i = fc + 7; continue; }
      var e = L.indexOf('>', b), f = L.indexOf('</script', e);
      if (e < 0 || f < 0) break;
      var tag = html.slice(b, e + 1);
      if (!/\ssrc\s*=/i.test(tag)) {
        var corpo = html.slice(e + 1, f);
        var attr = tag.slice(7, -1);
        out.push(html.slice(fatto, b));
        // gli attributi (id) restano uguali; nessuno legge il testo degli script (verificato sull'index)
        out.push('<script' + attr + ' src="' + blob(corpo + '\n//# sourceURL=app/index.html#s' + n) + '"></script>');
        n++;
        i = fatto = L.indexOf('>', f) + 1;
      } else {
        i = e + 1;
      }
    }
    out.push(html.slice(fatto));
    return {html: out.join(''), n: n};
  }

  Promise.all([testo(APP + 'index.html'), testo(radice + 'giochi/app/shell.js?v=' + VER), testo(radice + 'giochi/app/shell.css?v=' + VER)])
    .then(function (r) {
      var html = r[0], shell = r[1], css = r[2];
      // 1) niente script di Telegram (esterno: dentro Discord e' bloccato), niente Google Fonts (esterni), niente TON
      html = html.replace(/<script src="https:\/\/telegram\.org\/js\/telegram-web-app\.js"><\/script>/, '');
      html = html.replace(/<link[^>]+fonts\.(googleapis|gstatic)\.com[^>]*>/g, '');
      // 2) T1 (toppa condivisa con la mini app, vedi fase2/toppe_miniapp/T1): la tela #arc si misura dopo il layout
      html = toppa(html, 'T1 rtdCanvasInit',
        /(RTD\.dpr=RTD\.lite\?1:Math\.min\(2,window\.devicePixelRatio\|\|1\);\s*)var w=wrap\.clientWidth\|\|340;/,
        '$1var w=(window.GXDC_LARGO&&GXDC_LARGO(wrap))||wrap.clientWidth||340;');
      // 2b) T3 (toppa condivisa, fase2/toppe_miniapp/T3): su PC le levette a tocco spariscono gia' al primo movimento del mouse
      html = toppa(html, 'T3 levette via col mouse', /(\n  pc\(fine\);\n)/,
        "$1  addEventListener('pointermove', function(e){ if (e.pointerType === 'mouse' && H.classList.contains('xpc-pc')) tast(); }, true);   /* T3 */\n");
      // 2c) T4 (toppa condivisa, fase2/toppe_miniapp/T4): la guida «Tasti» morbida, una volta chiusa, lasciava il riquadro
      //     invisibile ma cliccabile al centro dello schermo (pointer-events:auto in linea): mangiava i clic del gioco
      html = toppa(html, 'T4 guida chiusa non clicca', /\} else if \(box\) \{ box\.classList\.remove\('xpc-su'\); aperta = false; \}/,
        "} else if (box) { box.classList.remove('xpc-su'); aperta = false; if (box.firstChild && box.firstChild.style) box.firstChild.style.pointerEvents = ''; }   /* T4 */");
      // 3) script in linea -> blob (CSP di Discord)
      var sb = scriptInBlob(html);
      html = sb.html;
      window.GXDC_SCRIPT = sb.n;
      // 4) in testa: <base> verso la mini app + lo strato Discord, prima di ogni altro script (la PRIMA <head>
      //    vera: le altre stanno nei commenti dell'index)
      var testa = '<base href="' + esc(APP) + '">\n<script src="' + blob('window.GXDC_RADICE=' + JSON.stringify(radice) + ';\n' + shell) + '"></script>' +
        // la schermata di caricamento della mini app ha il marchio (scritta e logo): dentro Discord solo la barra
        '\n<style id="gx-discord-testa">#loading .xl-wm,#loading .xl-mk{display:none!important}</style>';
      var h0 = html.indexOf('<head>');
      html = h0 >= 0 ? html.slice(0, h0 + 6) + '\n' + testa + html.slice(h0 + 6) : testa + html;
      // 5) in fondo: il CSS Discord (dopo tutto quello dell'index, cosi' vince)
      var i = html.lastIndexOf('</body>');
      if (i > 0) html = html.slice(0, i) + '<style id="gx-discord-css">' + css + '</style>' + html.slice(i);
      document.open();
      document.write(html);
      document.close();
    })
    .catch(function (e) {
      console.error('[discord] mini app non caricata', e);
      attesa('Il gioco non si apre: riprova tra poco.');
      try { parent.postMessage({gx: 'errore'}, location.origin); } catch (x) {}
    });
})();
