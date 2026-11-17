/* DISCORD lotto 7 — carica il terminale della boxe dal VPS (/api/boxe-rt/_boxe_rt.html, mapping /api) e lo scrive qui, sulla
   stessa origine dell'Activity. La CSP di Discord non ha 'unsafe-inline': i due script in linea del terminale diventano blob:
   (quello classico e quello type=module); in un modulo blob: gli import relativi ('./_boxe_rt_terminale.mjs') non si
   risolvono, quindi diventano assoluti verso /api/boxe-rt/. Il resto (_boxe_art_a.js, i .mjs) arriva da <base href>.
   Niente toppe sul terminale: e' quello del VPS, cosi' com'e'. */
(function () {
  'use strict';
  var api = '/api';
  try { api = (parent.parent && parent.parent.GX_CONFIG && parent.parent.GX_CONFIG.apiBase) || '/api'; } catch (e) {}
  var BASE = api + '/boxe-rt/';
  var ABS = location.origin + BASE;
  function blob(js, mod) { return URL.createObjectURL(new Blob([js], {type: 'text/javascript'})); }
  function assoluti(js) {
    return js.replace(/(\bfrom\s*|\bimport\s*\(?\s*)(['"])\.\/([^'"]+)\2/g, function (m, a, q, p) { return a + q + ABS + p + q; });
  }
  // stesso scorrimento di giochi/app/carica.js: salta commenti e <style>, da <script> dritto a </script>
  function scriptInBlob(html) {
    var L = html.toLowerCase(), out = [], i = 0, n = 0, fatto = 0;
    for (;;) {
      var a = L.indexOf('<!--', i), b = L.indexOf('<script', i), c = L.indexOf('<style', i), k = -1;
      [a, b, c].forEach(function (x) { if (x >= 0 && (k < 0 || x < k)) k = x; });
      if (k < 0) break;
      if (k === a) { var fa = L.indexOf('-->', a + 4); if (fa < 0) break; i = fa + 3; continue; }
      if (k === c) { var fc = L.indexOf('</style', c); if (fc < 0) break; i = fc + 7; continue; }
      var e = L.indexOf('>', b), f = L.indexOf('</script', e);
      if (e < 0 || f < 0) break;
      var tag = html.slice(b, e + 1);
      if (!/\ssrc\s*=/i.test(tag)) {
        var corpo = html.slice(e + 1, f), mod = /type\s*=\s*["']?module/i.test(tag);
        out.push(html.slice(fatto, b));
        out.push('<script' + tag.slice(7, -1) + ' src="' + blob((mod ? assoluti(corpo) : corpo) + '\n//# sourceURL=boxe-rt/_boxe_rt.html#s' + n) + '"></script>');
        n++;
        i = fatto = L.indexOf('>', f) + 1;
      } else {
        i = e + 1;
      }
    }
    out.push(html.slice(fatto));
    return out.join('');
  }
  fetch(BASE + '_boxe_rt.html', {cache: 'no-cache'})
    .then(function (r) { if (!r.ok) throw new Error('boxe-rt ' + r.status); return r.text(); })
    .then(function (html) {
      html = html.replace(/<link[^>]+fonts\.(googleapis|gstatic)\.com[^>]*>/g, '');
      html = scriptInBlob(html);
      var h = /<head[^>]*>/i.exec(html);
      var base = '<base href="' + BASE + '">';
      html = h ? html.slice(0, h.index + h[0].length) + base + html.slice(h.index + h[0].length) : base + html;
      document.open();
      document.write(html);
      document.close();
    })
    .catch(function (e) {
      console.error('[discord] terminale della boxe non caricato', e);
      document.body.textContent = 'Il ring non si apre: riprova tra poco.';
      document.body.style.cssText = 'color:#ccc;font:16px sans-serif;display:flex;align-items:center;justify-content:center';
    });
})();
