/* NEON PONG — modo Discord (fase 1, 15/11/2026).
   Client leggero dello stesso motore della mini app (arcade_rt.Pong sul server real-time): stesso filo
   (hello -> join_ticket -> snapshot `s` a 20 Hz -> `over`), stesso comando {t:'in', mx, my}.
   Differenze dalla mini app: niente Telegram (c'e' tg-shim.js), niente soldi a schermo, tastiera
   (W/S, frecce, A/D) + mouse/tocco, campo orizzontale su PC e verticale sul telefono, niente suoni
   (in vocale si parla). Si apre DENTRO la pagina del catalogo: la sessione dell'SDK resta viva.
   API: GXPong.avvia({ticket, sessione, wsUrl, io:{id,nome,foto}, foto:{uid:url}, pratica, onFine(esito)}) -> {chiudi()} */
(function () {
  'use strict';
  var W = 7, H = 11, PAD_Y = 0.6, BALL_R = 0.22, PAD_H = 0.16;
  var PIP = {W: 'Racchetta larga', S: 'Racchetta stretta', G: 'Nebbia', C: 'Cannone', M: 'Multipalla',
             V: 'Palla a effetto', F: 'Tutto veloce', D: 'Scudo', P: 'Palla divisa'};
  var COL = {io: '#8b83f0', lui: '#5ac8fa', palla: '#f2f2f4', pip: '#ffd60a', filo: 'rgba(255,255,255,.14)'};

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

  function avvia(o) {
    var S = {ws: null, me: '', seat: 0, nomi: {}, buf: [], fine: false, chiuso: false, tentativi: 0, start: null,
             tasti: {piu: false, meno: false}, punta: null, ultimoMx: 9, ultimoInvio: 0, flash: 0, avviso: '', tAvviso: 0,
             sc: {}, mods: {}, freeze: 0, ftot: 1};
    var root = el('div', 'pg-root');
    root.setAttribute('role', 'application');
    root.setAttribute('aria-label', 'Neon Pong');
    root.innerHTML =
      '<div class="pg-hud">' +
        '<div class="pg-gioc pg-io"><span class="pg-av"></span><b class="pg-nome">Tu</b><span class="pg-mods"></span></div>' +
        '<div class="pg-punti"><b class="pg-sm">0</b><i>–</i><b class="pg-sl">0</b><small>al 7</small></div>' +
        '<div class="pg-gioc pg-lui"><span class="pg-av"></span><b class="pg-nome">Avversario</b><span class="pg-mods"></span></div>' +
      '</div>' +
      '<canvas class="pg-cv"></canvas>' +
      '<div class="pg-conta" aria-live="polite"></div>' +
      '<div class="pg-avviso" aria-live="polite"></div>' +
      '<div class="pg-stato">Mi collego al tavolo…</div>' +
      '<div class="pg-tasti-guida"><span class="pg-k">W</span><span class="pg-k">S</span> o <span class="pg-k">↑</span><span class="pg-k">↓</span> · oppure trascina</div>' +
      '<button class="pg-esci" type="button" aria-label="Esci dalla partita">Esci</button>' +
      '<div class="pg-fine" hidden><div class="pg-fine-box"><h3></h3><p></p><div class="pg-fine-tasti">' +
        '<button class="t1 pg-ancora" type="button"></button><button class="t2 pg-torna" type="button">Torna ai giochi</button></div></div></div>';
    document.body.appendChild(root);
    document.documentElement.classList.add('in-gioco');
    var cv = root.querySelector('.pg-cv'), ctx = cv.getContext('2d');
    var $ = function (s) { return root.querySelector(s); };

    /* ── geometria: (u,v) = il campo visto da me. u lungo la mia racchetta, v dalla mia linea.
       Orizzontale (PC, PIP): la mia racchetta a SINISTRA, si muove su/giu'. Verticale (telefono): in BASSO. */
    var vista = {orizz: true, s: 1, ox: 0, oy: 0, cw: 0, ch: 0};
    function misura() {
      var r = root.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      var hud = $('.pg-hud').getBoundingClientRect().height || 0;
      var piccolo = r.height < 300;
      var cw = r.width, ch = Math.max(80, r.height - (piccolo ? 0 : hud) - (piccolo ? 0 : 10));
      cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
      cv.style.top = (piccolo ? 0 : hud) + 'px';
      cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      vista.orizz = cw >= ch;
      var lu = vista.orizz ? H : W, la = vista.orizz ? W : H;     // lato lungo/alto del campo sullo schermo
      vista.s = Math.min((cw - 16) / lu, (ch - 16) / la);
      vista.cw = cw; vista.ch = ch;
      vista.ox = (cw - lu * vista.s) / 2; vista.oy = (ch - la * vista.s) / 2;
      root.classList.toggle('pg-piccolo', piccolo);
      root.classList.toggle('pg-verticale', !vista.orizz);
    }
    function uv(x, y) { return S.seat === 0 ? [x, H - y] : [W - x, y]; }
    function schermo(u, v) {
      return vista.orizz ? [vista.ox + v * vista.s, vista.oy + (W - u) * vista.s]
                         : [vista.ox + u * vista.s, vista.oy + (H - v) * vista.s];
    }
    function daSchermo(px, py) {   // -> u
      return vista.orizz ? W - (py - vista.oy) / vista.s : (px - vista.ox) / vista.s;
    }

    /* ── rete ── */
    function collega() {
      if (S.chiuso) return;
      var ws;
      try { ws = new WebSocket(o.wsUrl); } catch (e) { stato('Rete non disponibile'); return; }
      S.ws = ws;
      ws.onopen = function () {
        ws.send(JSON.stringify({t: 'hello', dc: o.sessione}));
        if (S.start) ws.send(JSON.stringify({t: 'rientra'}));
        else ws.send(JSON.stringify({t: 'join_ticket', ticket: o.ticket, game: 'pong'}));
      };
      ws.onmessage = function (e) { var m; try { m = JSON.parse(e.data); } catch (x) { return; } ricevi(m); };
      ws.onclose = function () {
        if (S.chiuso || S.fine) return;
        if (S.tentativi++ < 6) { stato('Riconnessione…'); setTimeout(collega, 600 * S.tentativi); }
        else finePartita({errore: true});
      };
    }
    var tPing = setInterval(function () { manda({t: 'ping', ts: Date.now()}); }, 4000);
    function manda(m) { if (S.ws && S.ws.readyState === 1) try { S.ws.send(JSON.stringify(m)); } catch (e) {} }
    function stato(t) { var s = $('.pg-stato'); s.textContent = t || ''; s.style.display = t ? '' : 'none'; }

    function ricevi(m) {
      if (m.t === 'hello_ok') { S.me = String(m.uid); return; }
      if (m.t === 'err') {
        var testi = {discord_pieno: 'Tutti i tavoli gratis sono occupati: riprova tra poco.',
                     'ticket scaduto': 'La partita è scaduta prima di cominciare.', 'auth failed': 'Accesso non riuscito: riapri l’attività.'};
        if (!S.start) finePartita({errore: true, testo: testi[m.msg] || 'Partita non disponibile.'});
        return;
      }
      if (m.t === 'start') {
        S.start = m; S.me = String(m.you || S.me); S.tentativi = 0;
        S.nomi = {}; var pr = m.profiles || {};
        Object.keys(m.names || {}).forEach(function (k) { S.nomi[k] = (pr[k] && pr[k].name) || m.names[k]; });
        stato('');
        disegnaGiocatori();
        return;
      }
      if (m.t === 's') {
        (m.p || []).forEach(function (r) { if (String(r[0]) === S.me) S.seat = r[2]; });
        m._arr = performance.now();
        S.buf.push(m); if (S.buf.length > 6) S.buf.shift();
        S.sc = m.sc || S.sc; S.mods = m.mods || {}; S.freeze = m.freeze || 0; S.ftot = m.ftot || 1;
        (m.feed || []).forEach(evento);
        disegnaPunti();
        return;
      }
      if (m.t === 'over') { finePartita(m); }
    }
    function evento(e) {
      if (e.k === 'goal') { S.flash = performance.now(); S.flashMio = String(e.who) === S.me; }
      if (e.k === 'pip' && PIP[e.c]) avviso('In campo: ' + PIP[e.c]);
      if (e.k === 'spareggio') avviso('Punto d’oro: il prossimo vince');
    }
    function avviso(t) { var a = $('.pg-avviso'); a.textContent = t; a.classList.add('su'); clearTimeout(S.tAvviso); S.tAvviso = setTimeout(function () { a.classList.remove('su'); }, 1800); }

    function lui() { var k = Object.keys(S.nomi).filter(function (x) { return x !== S.me; }); return k[0] || ''; }
    function faccia(span, uid, nome) {
      var f = (o.foto || {})[uid];
      span.style.backgroundImage = f ? 'url("' + f + '")' : '';
      span.textContent = f ? '' : String(nome || '?').charAt(0).toUpperCase();
    }
    function disegnaGiocatori() {
      var l = lui();
      var nl = l.indexOf('bot:') === 0 ? 'Bot' : (S.nomi[l] || 'Avversario');
      $('.pg-lui .pg-nome').textContent = nl;
      $('.pg-io .pg-nome').textContent = (o.io && o.io.nome) || S.nomi[S.me] || 'Tu';
      faccia($('.pg-lui .pg-av'), l, nl);
      faccia($('.pg-io .pg-av'), S.me, (o.io && o.io.nome) || 'Tu');
    }
    function disegnaPunti() {
      var l = lui();
      $('.pg-sm').textContent = S.sc[S.me] || 0;
      $('.pg-sl').textContent = S.sc[l] || 0;
      function mods(uid) {
        return (S.mods[uid] || []).map(function (x) { return '<em>' + esc(PIP[x[0]] || x[0]) + (x[1] > 0 ? ' ' + Math.ceil(x[1]) + 's' : '') + '</em>'; }).join('');
      }
      $('.pg-io .pg-mods').innerHTML = mods(S.me);
      $('.pg-lui .pg-mods').innerHTML = mods(l);
      var c = $('.pg-conta');
      if (S.freeze > 0.05) { c.textContent = Math.ceil(S.freeze); c.classList.add('su'); } else c.classList.remove('su');
    }

    /* ── comandi: tastiera, mouse, tocco ── */
    var PIU = {ArrowUp: 1, KeyW: 1, ArrowRight: 1, KeyD: 1}, MENO = {ArrowDown: 1, KeyS: 1, ArrowLeft: 1, KeyA: 1};
    function giu(e) {
      if (S.fine) return;
      if (PIU[e.code]) { S.tasti.piu = true; S.punta = null; e.preventDefault(); }
      else if (MENO[e.code]) { S.tasti.meno = true; S.punta = null; e.preventDefault(); }
      else if (e.code === 'Escape') { e.preventDefault(); esci(); }
    }
    function su(e) { if (PIU[e.code]) S.tasti.piu = false; else if (MENO[e.code]) S.tasti.meno = false; }
    function punta(e) {
      if (S.fine) return;
      var r = cv.getBoundingClientRect();
      S.punta = daSchermo(e.clientX - r.left, e.clientY - r.top);
    }
    var trascina = false;
    cv.addEventListener('pointerdown', function (e) { trascina = true; try { cv.setPointerCapture(e.pointerId); } catch (x) {} punta(e); });
    cv.addEventListener('pointermove', function (e) { if (trascina || e.pointerType === 'mouse') punta(e); });
    cv.addEventListener('pointerup', function () { trascina = false; });
    cv.addEventListener('pointercancel', function () { trascina = false; S.punta = null; });
    cv.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && !trascina) S.punta = null; });
    addEventListener('keydown', giu, true);
    addEventListener('keyup', su, true);
    addEventListener('blur', function () { S.tasti.piu = S.tasti.meno = false; });

    function mioU() {
      var s = S.buf[S.buf.length - 1]; if (!s) return W / 2;
      for (var i = 0; i < (s.p || []).length; i++) if (String(s.p[i][0]) === S.me) return uv(s.p[i][1], 0)[0];
      return W / 2;
    }
    function comando(now) {
      if (!S.start || S.fine) return;
      var du = (S.tasti.piu ? 1 : 0) - (S.tasti.meno ? 1 : 0);
      if (!du && S.punta != null) du = clamp((S.punta - mioU()) * 3, -1, 1);
      if (Math.abs(du) < 0.04) du = 0;
      var mx = Math.round(du * (S.seat === 0 ? 1 : -1) * 100) / 100;
      if (mx !== S.ultimoMx || now - S.ultimoInvio > 250) {
        manda({t: 'in', mx: mx, my: 0}); S.ultimoMx = mx; S.ultimoInvio = now;
      }
    }

    /* ── disegno ── */
    function interp(now) {
      var b = S.buf; if (!b.length) return null;
      var ult = b[b.length - 1];
      if (b.length < 2) return ult;
      var dt = 0.05, tv = ult.time - 0.1 + Math.min(0.15, (now - ult._arr) / 1000);
      var a = null, c = null;
      for (var i = b.length - 1; i > 0; i--) { if (b[i - 1].time <= tv) { a = b[i - 1]; c = b[i]; break; } }
      if (!a) return b[0];
      var k = clamp((tv - a.time) / Math.max(dt, c.time - a.time), 0, 1);
      var out = {p: [], balls: [], pip: c.pip, ghosted: c.ghosted};
      (c.p || []).forEach(function (r) {
        var ra = (a.p || []).filter(function (q) { return q[0] === r[0]; })[0] || r;
        out.p.push([r[0], ra[1] + (r[1] - ra[1]) * k, r[2], ra[3] + (r[3] - ra[3]) * k, r[4], r[5], r[6]]);
      });
      (c.balls || []).forEach(function (bb, j) {
        var ba = (a.balls || [])[j];
        if (!ba || Math.abs(ba[0] - bb[0]) + Math.abs(ba[1] - bb[1]) > 3) { out.balls.push(bb); return; }
        out.balls.push([ba[0] + (bb[0] - ba[0]) * k, ba[1] + (bb[1] - ba[1]) * k, bb[2], bb[3], bb[4]]);
      });
      return out;
    }
    function linea(x0, y0, x1, y1) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
    function disegna(now) {
      var cw = vista.cw, ch = vista.ch, s = vista.s;
      ctx.clearRect(0, 0, cw, ch);
      var a = schermo(0, 0), b = schermo(W, H);
      var x0 = Math.min(a[0], b[0]), y0 = Math.min(a[1], b[1]), fw = Math.abs(b[0] - a[0]), fh = Math.abs(b[1] - a[1]);
      // campo
      var g = ctx.createLinearGradient(x0, y0, x0 + fw, y0 + fh);
      g.addColorStop(0, 'rgba(139,131,240,.10)'); g.addColorStop(1, 'rgba(90,200,250,.07)');
      ctx.fillStyle = g; ctx.fillRect(x0, y0, fw, fh);
      ctx.strokeStyle = COL.filo; ctx.lineWidth = 1.5; ctx.strokeRect(x0 + .5, y0 + .5, fw - 1, fh - 1);
      ctx.setLineDash([6, 8]);
      var m0 = schermo(0, H / 2), m1 = schermo(W, H / 2); linea(m0[0], m0[1], m1[0], m1[1]);
      ctx.setLineDash([]);
      var f = interp(now);
      if (S.flash && now - S.flash < 450) {
        ctx.fillStyle = 'rgba(' + (S.flashMio ? '48,209,88' : '255,69,58') + ',' + (0.22 * (1 - (now - S.flash) / 450)) + ')';
        ctx.fillRect(x0, y0, fw, fh);
      }
      if (!f) return;
      if (f.ghosted) {   // nebbia: la palla non si vede al centro
        var n0 = schermo(0, H * 0.3), n1 = schermo(W, H * 0.7);
        ctx.fillStyle = 'rgba(20,20,28,.85)';
        ctx.fillRect(Math.min(n0[0], n1[0]), Math.min(n0[1], n1[1]), Math.abs(n1[0] - n0[0]), Math.abs(n1[1] - n0[1]));
      }
      if (f.pip) {
        var pp = uv(f.pip[0], f.pip[1]), ps = schermo(pp[0], pp[1]);
        ctx.save(); ctx.shadowColor = COL.pip; ctx.shadowBlur = 16; ctx.fillStyle = COL.pip;
        ctx.beginPath(); ctx.arc(ps[0], ps[1], 0.32 * s, 0, 7); ctx.fill(); ctx.restore();
        ctx.fillStyle = '#000'; ctx.font = '700 ' + Math.round(0.36 * s) + 'px system-ui,sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.pip[2], ps[0], ps[1] + 1);
      }
      f.p.forEach(function (r) {
        var mio = String(r[0]) === S.me, c = mio ? COL.io : COL.lui;
        var q = uv(r[1], r[2] === 0 ? H - PAD_Y : PAD_Y), half = r[3] / 2;
        var e0 = schermo(q[0] - half, q[1]), e1 = schermo(q[0] + half, q[1]);
        ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 18; ctx.strokeStyle = c; ctx.lineCap = 'round';
        ctx.lineWidth = Math.max(4, PAD_H * s * (r[4] ? 1.6 : 1));
        linea(e0[0], e0[1], e1[0], e1[1]); ctx.restore();
        if (r[5]) {   // scudo dietro la racchetta
          var bv = q[1] < H / 2 ? 0.12 : H - 0.12, z0 = schermo(0, bv), z1 = schermo(W, bv);
          ctx.save(); ctx.strokeStyle = c; ctx.globalAlpha = .55; ctx.lineWidth = 3; linea(z0[0], z0[1], z1[0], z1[1]); ctx.restore();
        }
      });
      f.balls.forEach(function (bb) {
        var q = uv(bb[0], bb[1]), p = schermo(q[0], q[1]);
        ctx.save(); ctx.shadowColor = bb[4] ? COL.pip : '#fff'; ctx.shadowBlur = 20; ctx.fillStyle = COL.palla;
        ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(4, BALL_R * s), 0, 7); ctx.fill(); ctx.restore();
      });
    }
    var raf = 0;
    function giro() {
      if (S.chiuso) return;
      var now = performance.now();
      comando(now); disegna(now);
      raf = requestAnimationFrame(giro);
    }

    /* ── fine ── */
    function finePartita(m) {
      if (S.fine) return;
      S.fine = true;
      manda({t: 'in', mx: 0, my: 0});
      var box = $('.pg-fine'), h = box.querySelector('h3'), p = box.querySelector('p');
      var l = lui(), nl = l.indexOf('bot:') === 0 ? 'il bot' : (S.nomi[l] || 'l’avversario');
      if (m.errore) { h.textContent = 'Partita non partita'; p.textContent = m.testo || 'La connessione si è interrotta.'; }
      else if (m.you_won) { h.textContent = 'Hai vinto'; p.textContent = (S.sc[S.me] || 0) + ' a ' + (S.sc[l] || 0) + ' contro ' + nl + '.'; }
      else if (m.winner == null) { h.textContent = 'Pari'; p.textContent = 'Nessun vincitore questa volta.'; }
      else { h.textContent = 'Ha vinto ' + (l.indexOf('bot:') === 0 ? 'il bot' : (S.nomi[l] || 'l’avversario')); p.textContent = (S.sc[S.me] || 0) + ' a ' + (S.sc[l] || 0) + '.'; }
      var an = box.querySelector('.pg-ancora');
      an.textContent = o.pratica ? 'Ancora coi bot' : 'Gioca ancora';
      an.onclick = function () { chiudi(); if (o.onFine) o.onFine({ancora: true, esito: m}); };
      box.querySelector('.pg-torna').onclick = function () { chiudi(); if (o.onFine) o.onFine({ancora: false, esito: m}); };
      box.hidden = false;
      setTimeout(function () { an.focus({preventScroll: true}); }, 50);
    }
    function esci() {
      if (S.fine) { chiudi(); if (o.onFine) o.onFine({ancora: false}); return; }
      manda({t: 'abbandona'});
      setTimeout(function () { if (!S.fine) { finePartita({errore: true, testo: 'Sei uscito dalla partita.'}); } }, 1500);
    }
    $('.pg-esci').addEventListener('click', esci);

    function chiudi() {
      if (S.chiuso) return;
      S.chiuso = true;
      cancelAnimationFrame(raf); clearInterval(tPing);
      removeEventListener('keydown', giu, true); removeEventListener('keyup', su, true);
      removeEventListener('resize', misura);
      try { if (S.ws) S.ws.close(); } catch (e) {}
      root.remove();
      document.documentElement.classList.remove('in-gioco');
    }

    addEventListener('resize', misura);
    misura();
    collega();
    raf = requestAnimationFrame(giro);
    window.GXPong._S = S;   // per le prove
    return {chiudi: chiudi};
  }

  window.GXPong = {avvia: avvia};
})();
