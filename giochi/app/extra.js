/* DISCORD: giochi dei lotti 4,5,6,7,pong_fix,8 (costruito da strumenti/integra_lotti.py) */
/* ── lotto 4 · calcio.js ── */
/* DISCORD lotto 4 — Derby (calcio): il campo 3D vive in derby3d.html (pagina a parte, via figlia). */
GXDC_EXTRA('calcio', {
  pagina: 'derby3d.html'
});


/* ── lotto 4 · glad.js ── */
/* DISCORD lotto 4 — Colosseo (glad). Client suo (GLD, schermata «glad»): entra col biglietto come l'allenamento della mini app
   (GLD_TICKET + go('glad')); scheda di fine propria senza piatto/fee, nome vero del vincitore, Rivincita/Ancora = catalogo.
   Su PC aperto gia' largo l'arena era NERA: la toppa T2 (toppe_index.js, condivisa) da' all'OZ il verticale di riferimento. */
GXDC_EXTRA('glad', {
  schermo: 'glad',
  testi: [[/⚔️\s*PvP ARENA/g, 'TORNA AI GIOCHI']],
  entra: function (D) {
    if (typeof window.initGlad !== 'function') return false;
    window.GLD_TICKET = D.ticket; window.GLD_PRACTICE = !!D.pratica; window.GLD_TOUR = false;
    go('glad');
    return true;
  },
  dopo: function (D) {
    if (window.GXDC_FIGLIA) return;   // gli extra girano anche nelle pagine a parte (gcr3d.html): li' niente da fare
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
    function via(cosa) { clearTimeout(D.tAncora); D.tAncora = setTimeout(function () { if (!D.chiuso) { D.chiuso = true; D.alCatalogo(cosa); } }, 0); }
    function scheda(m) {
      var won = !!m.you_won, pr = !!(m.practice || GLD.practice || D.pratica);
      var vn = (m.winner != null && typeof gldNm === 'function' ? gldNm(m.winner) : '') || m.winner_name || '';
      var tit = won ? (pr ? 'ALLENAMENTO VINTO' : 'SEI L’ULTIMO IN PIEDI') : (pr ? 'ALLENAMENTO FINITO' : 'CADUTO NELL’ARENA');
      var sub = won ? (pr ? 'Hai battuto i bot.' : 'L’arena è tua.') : (vn ? '<b>' + esc(vn) + '</b> resta in piedi.' : 'Sei stato eliminato.');
      if (m.annullata) { tit = 'PARTITA INTERROTTA'; sub = 'La partita si è fermata per un guasto. Non ha vinto nessuno.'; }
      var h = '<div class="gxdc-fine"><div style="font-size:46px;"' + (won ? ' class="twr-trophy"' : '') + '>' + (won ? '🏆' : (pr ? '🤖' : '💀')) + '</div>'
        + '<div class="' + (won ? 'tw-win-t' : 'tw-lose-t') + '">' + tit + '</div><div class="tw-ov-sub">' + sub + '</div>'
        + '<div class="tw-ov-btns"><button class="action-btn gold" data-gx="ancora">🔁 ' + (pr ? 'ANCORA' : 'RIVINCITA') + '</button>'
        + '<button class="action-btn" data-gx="fine">TORNA AI GIOCHI</button></div></div>';
      gldOv(h, true);
      Array.prototype.forEach.call(document.querySelectorAll('#gld-modal [data-gx]'), function (b) {
        b.addEventListener('click', function (e) { e.preventDefault(); via(b.getAttribute('data-gx')); });
      });
    }
    var over0 = window.gldShowOver;
    window.gldShowOver = function (m) {
      if (!m || m.tour || GLD.tour) return over0.apply(this, arguments);
      GLD.ui = 'over';
      try { gldStopRaf(); TWS.play(m.you_won ? 'win' : 'lose'); } catch (e) {}
      scheda(m);
    };
    // le porte della mini app verso lobby/home: dentro Discord sono «di nuovo» o «fuori»
    window.gldAgain = function () { via('ancora'); };
    window.gldPracAgain = function () { via('ancora'); };
    window.gldPracToReal = function () { via('fine'); };
    window.gldShowLobby = function () {};
    addEventListener('pagehide', function () {
      try { if (GLD.ws && GLD.ws.readyState === 1 && (GLD.ui === 'match' || GLD.ui === 'search')) GLD.ws.send(JSON.stringify({t: GLD.practice ? 'leave' : 'abbandona'})); } catch (e) {}
    });
  }
});


/* ── lotto 4 · scalata.js ── */
/* DISCORD lotto 4 — Dead Peak (scalata). La torre vive in deadpeak.html (gia' in FIGLIE dello strato), dentro #dprt-wrap.
   La mini app da' a #dprt-wrap l'altezza di Telegram (viewportStableHeight, letta all'avvio e poi a ogni «viewportChanged»):
   nel Telegram finto e' un numero fisso, quindi in finestrella (225 px) la torre restava alta 720 e se ne vedeva un pezzo.
   Qui l'altezza di Telegram e' quella vera della finestra, e a ogni ridimensionamento la torre si rimisura. */
GXDC_EXTRA('scalata', {
  prima: function (D) {
    if (window.GXDC_FIGLIA) return;   // anche la pagina della torre carica gli extra: l'altezza e' quella della finestra di fuori
    var fin = window;
    try {
      var W = window.Telegram && Telegram.WebApp;
      if (W) {
        Object.defineProperty(W, 'viewportHeight', {configurable: true, get: function () { return fin.innerHeight; }});
        Object.defineProperty(W, 'viewportStableHeight', {configurable: true, get: function () { return fin.innerHeight; }});
      }
    } catch (e) {}
  },
  dopo: function (D) {
    var t = 0;
    addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () { try { if (typeof dprtAltezza === 'function') dprtAltezza(); } catch (e) {} }, 120);
    });
  }
});


/* ── lotto 4 · tank.js ── */
/* DISCORD lotto 4 — Tank Duel (tank). Client suo (TKD, schermata «tank»): entra col biglietto come l'allenamento della mini app
   (TKD_TICKET + go('tank')); scheda di fine propria senza piatto/fee, nome vero del vincitore, Rivincita/Ancora = catalogo.
   Su PC aperto gia' largo l'arena era di 160 px: la toppa T2 (toppe_index.js, condivisa) da' all'OZ il verticale di riferimento. */
GXDC_EXTRA('tank', {
  schermo: 'tank',
  testi: [[/⚔️\s*PvP ARENA/g, 'TORNA AI GIOCHI']],
  entra: function (D) {
    if (typeof window.initTank !== 'function') return false;
    window.TKD_TICKET = D.ticket; window.TKD_PRACTICE = !!D.pratica; window.TKD_TOUR = false;
    go('tank');
    return true;
  },
  dopo: function (D) {
    if (window.GXDC_FIGLIA) return;   // gli extra girano anche nelle pagine a parte (gcr3d.html): li' niente da fare
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
    function via(cosa) { clearTimeout(D.tAncora); D.tAncora = setTimeout(function () { if (!D.chiuso) { D.chiuso = true; D.alCatalogo(cosa); } }, 0); }
    function scheda(m) {
      var won = !!m.you_won, pr = !!(m.practice || TKD.practice || D.pratica);
      var vn = (m.winner != null && TKD.names && TKD.names[m.winner]) || m.winner_name || '';
      var tit = won ? (pr ? 'ALLENAMENTO VINTO' : 'CARRO VINCENTE') : (pr ? 'ALLENAMENTO FINITO' : 'CARRO DISTRUTTO');
      var sub = won ? (pr ? 'Hai battuto i bot.' : 'Hai vinto il duello.') : (vn ? '<b>' + esc(vn) + '</b> vince il duello.' : 'Sei stato eliminato.');
      if (m.annullata) { tit = 'PARTITA INTERROTTA'; sub = 'La partita si è fermata per un guasto. Non ha vinto nessuno.'; }
      var h = '<div class="gxdc-fine"><div style="font-size:46px;"' + (won ? ' class="twr-trophy"' : '') + '>' + (won ? '🏆' : (pr ? '🤖' : '💀')) + '</div>'
        + '<div class="' + (won ? 'tw-win-t' : 'tw-lose-t') + '">' + tit + '</div><div class="tw-ov-sub">' + sub + '</div>'
        + '<div class="tw-ov-btns"><button class="action-btn gold" data-gx="ancora">🔁 ' + (pr ? 'ANCORA' : 'RIVINCITA') + '</button>'
        + '<button class="action-btn" data-gx="fine">TORNA AI GIOCHI</button></div></div>';
      tkOv(h, true);
      Array.prototype.forEach.call(document.querySelectorAll('#tk-modal [data-gx]'), function (b) {
        b.addEventListener('click', function (e) { e.preventDefault(); via(b.getAttribute('data-gx')); });
      });
    }
    var over0 = window.tkShowOver;
    window.tkShowOver = function (m) {
      if (!m || m.tour || TKD.tour) return over0.apply(this, arguments);
      TKD.ui = 'over';
      try { tkStopRaf(); TWS.play(m.you_won ? 'win' : 'lose'); } catch (e) {}
      scheda(m);
    };
    // le porte della mini app verso lobby/home: dentro Discord sono «di nuovo» o «fuori»
    window.tkAgain = function () { via('ancora'); };
    window.tkPracAgain = function () { via('ancora'); };
    window.tkPracToReal = function () { via('fine'); };
    window.tkShowLobby = function () {};
    addEventListener('pagehide', function () {
      try { if (TKD.ws && TKD.ws.readyState === 1 && (TKD.ui === 'match' || TKD.ui === 'search')) TKD.ws.send(JSON.stringify({t: TKD.practice ? 'leave' : 'abbandona'})); } catch (e) {}
    });
  }
});


/* ── lotto 4 · turf.js ── */
/* DISCORD lotto 4 — City Royale (turf). Client suo (TWR, schermata «turf») + la citta' 3D in gcr3d.html (pagina a parte).
   - si entra col biglietto come fa la mini app dall'allenamento: TWR_TICKET + go('turf') (aggancio «entra»/«schermo»);
   - scheda di fine propria (niente piatto/rake/«+€»): vincitore col nome vero, «Rivincita»/«Ancora» = di nuovo la sala
     del canale / la coda / l'allenamento (catalogo), «Torna ai giochi» = catalogo;
   - le insegne della citta' (CASINÒ, BISCA, PEGNI, PRESTITI, GAMBLER, gli occhi Bitcoin/Ethereum della mascotte al neon)
     le ridipinge toppe_index.js su gcr3d.html. */
GXDC_EXTRA('turf', {
  pagina: 'gcr3d.html',
  schermo: 'turf',
  testi: [[/🏠\s*HOME/g, 'TORNA AI GIOCHI']],
  entra: function (D) {
    if (typeof window.initTurf !== 'function') return false;
    window.TWR_TICKET = D.ticket; window.TWR_PRACTICE = !!D.pratica;
    go('turf');
    return true;
  },
  dopo: function (D) {
    if (window.GXDC_FIGLIA) return;   // gli extra girano anche nelle pagine a parte (gcr3d.html): li' niente da fare
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
    function via(cosa) { clearTimeout(D.tAncora); D.tAncora = setTimeout(function () { if (!D.chiuso) { D.chiuso = true; D.alCatalogo(cosa); } }, 0); }
    function scheda(m) {
      var won = !!m.you_won, pr = !!(m.practice || TWR.practice || D.pratica);
      var vn = (m.winner != null && TWR.names && TWR.names[m.winner]) || m.winner_name || '';
      var tit = won ? (pr ? 'ALLENAMENTO VINTO' : 'ULTIMO IN PIEDI') : (pr ? 'ALLENAMENTO FINITO' : 'RESA DEI CONTI FINITA');
      var sub = won ? (pr ? 'Hai battuto i bot.' : 'La città è tua.') : (vn ? '<b>' + esc(vn) + '</b> è l’ultimo in piedi.' : 'Sei stato eliminato.');
      if (m.annullata) { tit = 'PARTITA INTERROTTA'; sub = 'La partita si è fermata per un guasto. Non ha vinto nessuno.'; }
      var h = '<div class="gxdc-fine"><div style="font-size:46px;"' + (won ? ' class="twr-trophy"' : '') + '>' + (won ? '🏆' : (pr ? '🤖' : '💀')) + '</div>'
        + '<div class="' + (won ? 'tw-win-t' : 'tw-lose-t') + '">' + tit + '</div><div class="tw-ov-sub">' + sub + '</div>'
        + '<div class="tw-ov-btns"><button class="action-btn gold" data-gx="ancora">🔁 ' + (pr ? 'ANCORA' : 'RIVINCITA') + '</button>'
        + '<button class="action-btn" data-gx="fine">TORNA AI GIOCHI</button></div></div>';
      twrOv(h, true);
      Array.prototype.forEach.call(document.querySelectorAll('#tw-modal [data-gx]'), function (b) {
        b.addEventListener('click', function (e) { e.preventDefault(); via(b.getAttribute('data-gx')); });
      });
    }
    var over0 = window.twrShowOver;
    window.twrShowOver = function (m) {
      if (!m || m.tour || TWR.tour) return over0.apply(this, arguments);
      TWR.ui = 'over';
      try { twrStopRaf(); TWS.engine(false); TWS.heart(false); TWS.play(m.you_won ? 'win' : 'lose'); } catch (e) {}
      scheda(m);
    };
    // le porte della mini app verso lobby/home: dentro Discord sono «di nuovo» o «fuori»
    window.twrAgain = function () { via('ancora'); };
    window.twrPracAgain = function () { via('ancora'); };
    window.twrPracToReal = function () { via('fine'); };
    window.twrShowLobby = function () {};
    addEventListener('pagehide', function () {
      try { if (TWR.ws && TWR.ws.readyState === 1 && (TWR.ui === 'match' || TWR.ui === 'search')) TWR.ws.send(JSON.stringify({t: TWR.practice ? 'leave' : 'abbandona'})); } catch (e) {}
    });
  }
});


/* ── lotto 5 · golf.js ── */
/* DISCORD fase 2 LOTTO 5 — MINIGOLF (golf).
   La mini app lo disegna in 3D (golf3d.html, pagina a parte nello STESSO iframe-ospite di #arc-wrap) e ripiega sul 2D.
   1) golf3d.html va aperta attraverso figlia.html (script e gestori in linea con la CSP di Discord): pagina:'golf3d.html'.
   2) I mondi del 3D: cinque sono di casino' (CASINO' DI NOTTE, tavolo da POKER, GAMBLER CITY, CAVEAU d'oro, SALA SLOT).
      Dentro Discord quelle buche si vestono da GIARDINO o da ISOLA DEI PIRATI (stesso campo del server, cambia solo la
      scenografia FUORI dal campo). Le scritte «GAMBLER ...» delle insegne le toglie gia' shell.js (fillText). */
(function () {
  var VIA = {casino: 'giardino', poker: 'giardino', slot: 'giardino', city: 'pirati', caveau: 'pirati'};
  function temi() {
    if (!window.GXDC_FIGLIA || !/golf3d\.html/.test(location.pathname) || window.G3) return;
    var G3 = {}, tp;
    // la pagina fa «var G3 = window.G3 = window.G3 || {}» e poi G3.temaPer = function...: la avvolgiamo appena nasce
    Object.defineProperty(G3, 'temaPer', {configurable: true, enumerable: true,
      get: function () { return tp; },
      set: function (f) {
        tp = typeof f !== 'function' ? f : function () {
          var t = f.apply(this, arguments);
          try { var id = t && t.id, nuovo = id && VIA[id]; if (nuovo && G3.TEMI && G3.TEMI[nuovo]) return G3.TEMI[nuovo]; } catch (e) {}
          return t;
        };
      }});
    window.G3 = G3;
  }
  // 3) PC / finestrella: col 3D acceso la tela #arc (trasparente, prende il mouse sopra il 3D) si allarga a tutta la zona
  //    di gioco come il 3D che le sta sotto: si mira trascinando da qualunque punto. Se il 3D cade (ripiego al 2D) la tela
  //    torna subito alla buca verticale di sempre (rtdCanvasInit di nuovo), cosi' il 2D non si stira mai.
  function largo(wrap) {
    if (innerWidth < innerHeight * 1.15) return null;
    try { if (typeof gf3dVuole !== 'function' || !gf3dVuole()) return null; } catch (e) { return null; }
    var r = wrap.getBoundingClientRect(), W = r.width || innerWidth, H = r.height;
    if (!H || H < 120) H = Math.max(150, innerHeight - 200);
    return Math.max(0.3, Math.min(1.5, H / W));
  }
  function dopo() {
    if (window.GXDC_FIGLIA || window.__gxGolf || typeof window.gf3dCade !== 'function') return;
    window.__gxGolf = true;
    var cade0 = window.gf3dCade;
    window.gf3dCade = function () {
      var r = cade0.apply(this, arguments);
      setTimeout(function () { try { if (RTD.ui === 'match' && RTD.game === 'golf' && typeof rtdCanvasInit === 'function') rtdCanvasInit(); } catch (e) {} }, 0);
      return r;
    };
  }
  GXDC_EXTRA('golf', {pagina: 'golf3d.html', rapporto: largo, testi: [], prima: temi, dopo: dopo});
})();


/* ── lotto 5 · pool8.js ── */
/* DISCORD fase 2 LOTTO 5 — BILIARDO (pool8 = 8-ball, pool15 = 8-15 rapido: due giochi sul server, uno nel catalogo).
   Il tavolo nuovo (POOL2, snapshot v:2) e' gia' largo 2:1 su PC: nessun cambio di misura.
   Solo il marchio: lo stemma al centro del panno (bakeTable) scrive «GB» e «GAMBLER» (questa la toglie gia' shell.js):
   al posto di «GB» una «8». */
(function () {
  function stemma() {
    if (window.GXDC_FIGLIA || window.__gxPoolStemma) return;
    window.__gxPoolStemma = true;
    var P = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
    if (!P) return;
    var o = P.fillText;
    P.fillText = function (t) {
      if (t === 'GB' && (window.RTD && (RTD.game === 'pool8' || RTD.game === 'pool15'))) {
        var a = Array.prototype.slice.call(arguments); a[0] = '8';
        return o.apply(this, a);
      }
      return o.apply(this, arguments);
    };
  }
  var X = {pagina: null, rapporto: null, testi: [], prima: stemma, dopo: function () {}};
  GXDC_EXTRA('pool8', X);
  GXDC_EXTRA('pool15', X);
})();


/* ── lotto 5 · shove.js ── */
/* DISCORD fase 2 LOTTO 5 — SHOVE (curling di strada) nello strato Discord.
   1) PC / finestrella (schermo orizzontale): la corsia, verticale nella mini app, si gira di 90° — chi tira sta a SINISTRA e
      tira verso DESTRA. Niente cambio di motore: la tela #arc diventa larga (rapporto MW/MH), il disegno di sempre
      (visShove, o rtdDrawShove se il nuovo cade) gira dentro una trasformazione, i testi restano dritti, e il tiro mandato
      al server si rigira nel sistema della corsia (rtdSend). La mira disegnata usa la stessa conversione.
      Il telefono in verticale resta com'e'.
   2) Niente aria da casino': i dischi diventano pietre da curling (granito + maniglia del colore del giocatore) invece dei
      gettoni col numero; le fasce dicono «5 pt / 3 pt / 2 pt / 1 pt» invece di «×5». Il punteggio resta nel tabellone. */
GXDC_EXTRA('shove', {
  pagina: null,
  rapporto: function (wrap) {
    // la tela larga solo su schermi orizzontali (PC, finestrella): il campo girato e' MH x MW
    if (innerWidth < innerHeight * 1.15) return null;
    var M = window.RTD && RTD.map;
    if (!M || !M.w || !M.h) return null;
    return Math.max(0.4, Math.min(1, M.w / M.h));
  },
  testi: [],
  prima: function (D) {},
  dopo: function (D) {
    'use strict';
    if (window.GXDC_FIGLIA || window.__gxShove) return;
    window.__gxShove = true;
    var NERO_DISCO = 'rgba(4,6,12,.88)';     // il bollo scuro col numero sopra il disco (visShove): via
    var DENTRO = false;                      // vero mentre si disegna nella corsia girata (cssW/cssH sono scambiati)
    // il suggerimento in campo: in orizzontale coprirebbe il tabellone, e lo dice gia' la riga sopra la tela
    var SUGG = /^(Trascina da dove vuoi|Drag from anywhere)/;
    function girato() {
      var w = RTD.cssW || (RTD.cv && RTD.cv.clientWidth) || 0, h = RTD.cssH || (RTD.cv && RTD.cv.clientHeight) || 0;
      return RTD.game === 'shove' && w > h * 1.05;
    }
    // il contesto «visto dalla corsia»: in girato i testi si raddrizzano; sempre, via il bollo col numero dai dischi
    function tela(c, gira) {
      var ultimoFill = null, saltaTesto = false;
      return new Proxy(c, {
        get: function (t, k) {
          if (k === 'fillText' || k === 'strokeText') {
            return function (s, x, y, mw) {
              if (saltaTesto && k === 'fillText') { saltaTesto = false; return; }
              if (gira && typeof s === 'string' && SUGG.test(s)) return;
              if (!gira) return mw == null ? t[k](s, x, y) : t[k](s, x, y, mw);
              t.save(); t.translate(x, y); t.rotate(-Math.PI / 2);
              if (mw == null) t[k](s, 0, 0); else t[k](s, 0, 0, mw);
              t.restore();
            };
          }
          if (k === 'fill') {
            return function () {
              if (ultimoFill === NERO_DISCO) { saltaTesto = true; return; }
              return t.fill.apply(t, arguments);
            };
          }
          var v = t[k];
          return typeof v === 'function' ? v.bind(t) : v;
        },
        set: function (t, k, v) { t[k] = v; if (k === 'fillStyle') ultimoFill = v; return true; }
      });
    }
    // disegno di sempre dentro la corsia girata: (x, y) della corsia -> (W - y, x) sullo schermo
    function dentro(orig) {
      return function (ctx, raw, lp, now, w, hh) {
        var a = Array.prototype.slice.call(arguments);
        if (!girato()) { a[0] = tela(ctx, false); return orig.apply(this, a); }
        var dr = RTD.drag, cw = RTD.cssW, ch = RTD.cssH, r;
        ctx.save();
        ctx.transform(0, 1, -1, 0, w, 0);
        // la mira (visShove la calcola da RTD.drag e da cssW/cssH): nel sistema della corsia
        if (dr) RTD.drag = {sx: dr.sx, sy: dr.sy, dx: dr.dy, dy: -dr.dx, pw: dr.pw};
        RTD.cssW = ch; RTD.cssH = cw;
        DENTRO = true;
        try { a[0] = tela(ctx, true); a[4] = hh; a[5] = w; r = orig.apply(this, a); }
        finally { DENTRO = false; RTD.cssW = cw; RTD.cssH = ch; if (dr && RTD.drag && RTD.drag !== dr) RTD.drag = dr; ctx.restore(); }
        return r;
      };
    }
    var vis0 = window.visFotogramma;
    if (typeof vis0 === 'function') {
      var visG = dentro(function (ctx, raw, lp, now, w, hh) { return vis0('shove', ctx, raw, lp, now, w, hh); });
      window.visFotogramma = function (g, ctx, raw, lp, now, w, hh) {
        if (g !== 'shove') return vis0.apply(this, arguments);
        return visG(ctx, raw, lp, now, w, hh);
      };
    }
    if (typeof window.rtdDrawShove === 'function') window.rtdDrawShove = dentro(window.rtdDrawShove);
    // il tiro: lo strascico e' in pixel dello schermo girato -> direzione nella corsia
    var send0 = window.rtdSend;
    if (typeof send0 === 'function') {
      window.rtdSend = function (m) {
        if (m && m.t === 'act' && m.a === 'shot' && girato() && typeof m.ax === 'number' && typeof m.ay === 'number') {
          var MW = (RTD.map && RTD.map.w) || 7, MH = (RTD.map && RTD.map.h) || 12;
          var wx = m.ay * MW / MH, wy = -m.ax * MH / MW, n = Math.hypot(wx, wy) || 1;
          var c = {}; for (var k in m) c[k] = m[k];
          c.ax = wx / n; c.ay = wy / n;
          return send0.call(this, c);
        }
        return send0.apply(this, arguments);
      };
    }
    // la pietra da curling (stesse misure dello sprite del disco: la partita si disegna uguale)
    if (typeof window.visSpriteDisco === 'function' && typeof window.visTela === 'function') {
      window.visSpriteDisco = function (col, rx, ry, dp) {
        var th = Math.max(2 * dp, ry * 0.22), pad = Math.ceil(rx * 0.7);
        return visTela('gxpietra|' + col + '|' + Math.round(rx) + '|' + Math.round(ry), rx * 2 + pad * 2, ry * 2 + pad * 2 + th, function (c, W, H) {
          var cx = W / 2, cy = pad + ry;
          c.save(); c.filter = 'blur(' + Math.round(rx * 0.18) + 'px)'; c.fillStyle = 'rgba(0,0,0,.5)';
          c.beginPath(); c.ellipse(cx + rx * 0.1, cy + th + ry * 0.16, rx, ry, 0, 0, 6.2832); c.fill(); c.restore();
          // il fianco di granito
          c.fillStyle = '#3d4148'; c.beginPath(); c.ellipse(cx, cy + th, rx * 0.96, ry * 0.96, 0, 0, 6.2832); c.fill();
          c.fillRect(cx - rx * 0.96, cy, rx * 1.92, th);
          // la faccia: granito grigio a puntini
          var g = c.createRadialGradient(cx - rx * 0.3, cy - ry * 0.35, rx * 0.05, cx, cy, rx);
          g.addColorStop(0, '#c9ccd2'); g.addColorStop(0.6, '#8d929b'); g.addColorStop(1, '#5a5f68');
          c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy, rx * 0.96, ry * 0.96, 0, 0, 6.2832); c.fill();
          var n = Math.max(20, Math.round(rx * 3));
          for (var i = 0; i < n; i++) {
            var a = (i * 2.399) % 6.2832, d = Math.sqrt((i * 0.618) % 1) * 0.9;
            c.fillStyle = i % 3 ? 'rgba(40,42,48,.35)' : 'rgba(255,255,255,.3)';
            c.fillRect(cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, Math.max(1, rx * 0.05), Math.max(1, ry * 0.05));
          }
          // la fascia di gomma del colore del giocatore, poi la maniglia
          c.strokeStyle = col; c.lineWidth = Math.max(2 * dp, rx * 0.16);
          c.beginPath(); c.ellipse(cx, cy, rx * 0.66, ry * 0.66, 0, 0, 6.2832); c.stroke();
          var hw = rx * 0.95, hh2 = ry * 0.26;
          c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath();
          if (c.roundRect) c.roundRect(cx - hw / 2, cy - hh2 / 2 + ry * 0.08, hw, hh2, hh2 / 2); else c.rect(cx - hw / 2, cy - hh2 / 2 + ry * 0.08, hw, hh2);
          c.fill();
          var gm = c.createLinearGradient(0, cy - hh2 / 2, 0, cy + hh2 / 2);
          gm.addColorStop(0, '#ffffff'); gm.addColorStop(0.35, col); gm.addColorStop(1, col);
          c.fillStyle = gm; c.beginPath();
          if (c.roundRect) c.roundRect(cx - hw / 2, cy - hh2 / 2, hw, hh2, hh2 / 2); else c.rect(cx - hw / 2, cy - hh2 / 2, hw, hh2);
          c.fill();
          c.globalAlpha = 0.3; c.fillStyle = '#fff'; c.beginPath(); c.ellipse(cx - rx * 0.3, cy - ry * 0.5, rx * 0.3, ry * 0.1, -0.3, 0, 6.2832); c.fill(); c.globalAlpha = 1;
        });
      };
    }
    // le fasce: «5 pt» al posto di «×5» (e, girata, la scritta dritta)
    if (typeof window.visSfondoShove === 'function' && typeof window.visTela === 'function') {
      var sf0 = window.visSfondoShove;
      window.visSfondoShove = function (w, hh, sx, sy, dp) {
        var gira = DENTRO;
        var P = CanvasRenderingContext2D.prototype, ft0 = P.fillText;
        var cv = null;
        P.fillText = function (s, x, y, mw) {
          if (typeof s === 'string') s = s.replace(/^×(\d+)$/, '$1 pt');
          if (!gira) return mw == null ? ft0.call(this, s, x, y) : ft0.call(this, s, x, y, mw);
          if (this.globalAlpha < 0.2) return;   // il numerone in filigrana: girato non sta nella fascia
          this.save(); this.translate(x, y); this.rotate(-Math.PI / 2);
          var r = mw == null ? ft0.call(this, s, 0, 0) : ft0.call(this, s, 0, 0, mw);
          this.restore(); return r;
        };
        try {
          // chiave diversa da quella della mini app: la tela cambia (scritte, verso)
          var VV = window.VIS && VIS.cache, k0 = 'shv|' + w + 'x' + hh, k1 = 'gxshv|' + (gira ? 'g|' : 'd|') + w + 'x' + hh;
          if (VV && VV[k1]) return VV[k1];
          var vecchio = VV ? VV[k0] : null;
          if (VV) delete VV[k0];
          cv = sf0.apply(this, arguments);
          if (VV) { delete VV[k0]; VV[k1] = cv; if (vecchio) VV[k0] = vecchio; }
          return cv;
        } finally { P.fillText = ft0; }
      };
    }
  }
});


/* ── lotto 5 · tavolo.js ── */
/* DISCORD fase 2 LOTTO 5 — DAMA (dama italiana, damaru russa) e BACKGAMMON (backg): il TAVOLO 3D della mini app
   (tavolo3d.html, pagina a parte, gia' in FIGLIE di shell.js) e il 2D di sempre come ripiego.
   Su PC il 3D e' gia' largo (riempie #arc-wrap): nessun cambio di misura.
   Niente aria da casino' nel tavolo 3D (dentro la pagina a parte, PRIMA che parta: gli script del tavolo
   scrivono su window.TV, che qui nasce con tre «trappole» che avvolgono le funzioni appena vengono definite):
     - le pedine non sono gettoni: niente anello colorato largo (era l'«intarsio» che le faceva sembrare fiche),
       al suo posto un bollino piccolo al centro (TU azzurro / LUI rosso, i colori della barra); il backgammon di LUI
       e' in ebano come la dama, non in bachelite rossa;
     - il tavolo: legno chiaro a doghe al posto del panno verde/rosso da casino', fondo scuro senza i neon della sala. */
(function () {
  function legno(TV, T) {
    var N = 1024, c = TV.tela(N, N), x = c.getContext('2d');
    x.fillStyle = '#6b4a2e'; x.fillRect(0, 0, N, N);
    var r = TV.caso ? TV.caso(77) : Math.random;
    for (var d = 0; d < 8; d++) {                                   // otto doghe
      var y0 = d * N / 8, t = 0.85 + r() * 0.3;
      x.fillStyle = 'rgb(' + Math.round(120 * t) + ',' + Math.round(84 * t) + ',' + Math.round(52 * t) + ')';
      x.fillRect(0, y0, N, N / 8);
      for (var i = 0; i < 70; i++) {                               // venature
        var yy = y0 + r() * N / 8;
        x.strokeStyle = 'rgba(' + (r() < 0.5 ? '40,24,12' : '190,150,110') + ',' + (0.08 + r() * 0.12) + ')';
        x.lineWidth = 1 + r() * 2; x.beginPath(); x.moveTo(0, yy);
        x.bezierCurveTo(N * 0.3, yy + (r() - 0.5) * 14, N * 0.7, yy + (r() - 0.5) * 14, N, yy + (r() - 0.5) * 8); x.stroke();
      }
      x.fillStyle = 'rgba(20,12,6,.55)'; x.fillRect(0, y0, N, 3);   // la fuga fra le doghe
    }
    // (niente pozza di luce cotta: la tela si ripete, e la luce la fanno le lampade della scena)
    return TV.tex(c);
  }
  function fondo(TV) {
    var c = TV.tela(256, 512), x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#1b2230'); g.addColorStop(0.5, '#10141c'); g.addColorStop(1, '#07090d');
    x.fillStyle = g; x.fillRect(0, 0, 256, 512);
    return TV.tex(c);
  }
  // window.TV con le trappole: la pagina fa «var TV = window.TV = window.TV || {}» e poi TV.x = function...
  function trappole() {
    if (!window.GXDC_FIGLIA || !/tavolo3d\.html/.test(location.pathname) || window.TV) return;
    var TV = {}, mie = {
      mondo: function (orig) {
        return function (S, o) {
          var res = orig.apply(this, arguments);
          try {
            var T = window.THREE;
            if (res && res.pavimento && res.pavimento.material) {
              var m = res.pavimento.material;
              if (m.map && m.map.dispose) m.map.dispose();
              m.map = legno(TV, T); m.map.wrapS = m.map.wrapT = T.RepeatWrapping; m.map.repeat.set(3, 3);
              if (m.color && m.color.setHex) m.color.setHex(0x8c8c8c);   // un filo piu' scuro: la tavola resta il centro
              m.roughness = 0.7; m.needsUpdate = true;
            }
            if (S && S.scena) S.scena.background = fondo(TV);
          } catch (e) { console.warn('[discord] tavolo: mondo', e); }
          return res;
        };
      },
      matPedina: function (orig) {
        return function (nome, fall) {
          if (nome === 'bachelite') { nome = 'ebano'; fall = 0x2a211c; }   // backgammon: LUI in ebano, non gettone rosso
          return orig.call(this, nome, fall);
        };
      },
      intarsioGeo: function (orig) {
        return function (r0, r1) {
          // al posto dell'anello largo (fiche), un bollino al centro: dice ancora di chi e' la pedina
          var T = window.THREE;
          try { var g = new T.CircleGeometry(Math.max(0.01, r0 * 0.36), 28); g.rotateX(-Math.PI / 2); return g; }
          catch (e) { return orig.apply(this, arguments); }
        };
      }
    };
    Object.keys(mie).forEach(function (k) {
      var v;
      Object.defineProperty(TV, k, {configurable: true, enumerable: true,
        get: function () { return v; },
        set: function (f) { v = typeof f === 'function' ? mie[k](f) : f; }});
    });
    window.TV = TV;
  }
  var X = {pagina: null, rapporto: null, testi: [], prima: trappole, dopo: function () {}};
  GXDC_EXTRA('dama', X);
  GXDC_EXTRA('damaru', X);
  GXDC_EXTRA('backg', X);
})();


/* ── lotto 6 · bj1v1.js ── */
/* DISCORD lotto 6 — Blackjack 1v1 (blackjack.html, guscio BJRT dell'index). Solo gratis.
   I «fiches» del gioco sono il segnapunti della partita (vince chi arriva a 5): dentro Discord sono PUNTI; il «piatto»
   in mezzo e' «al centro». Niente soldi: il server non ha nemmeno la posta (stanza gratis del motore).
   Le regole di testo girano solo dentro la pagina del gioco, DOPO quelle generiche dello strato. */
(function () {
  'use strict';
  var PAGINA = 'blackjack.html';
  var REGOLE = [
    [/^\s*partita\s*$/, 'al centro'],                         // l'etichetta del piatto (#pot-w)
    [/\+1 gettone, 1 carta/g, '+1 punto, 1 carta'],           // RADDOPPIA
    [/\bil partita resta in mezzo\b/g, 'il punto resta al centro'],
    [/\b(tutte )?le gettone\b/g, function (m, a) { return a ? 'tutti i punti' : 'i punti'; }],
    [/\bgettone\b/g, 'punti'], [/\bfiches?\b/g, 'punti'], [/\bFiches?\b/g, 'Punti'], [/\bFICHES?\b/g, 'PUNTI'],
    [/tavolo annullato: posta rimborsata/gi, 'partita annullata'], [/\bposta\b/gi, 'partita'],
    [/\bpiu' punti\b/g, 'più punti'],
    [/\ble punti in mezzo\b/g, 'i punti al centro'], [/\+1 punti nel partita\b/g, '+1 punto al centro'], [/\+1 punti\b/g, '+1 punto']
  ];
  // ── comune ai giochi del lotto 6 (copiato in ogni file da fai_app.py: niente globali) ──
  function rinomina(doc, regole) {
    // gira DOPO la pulizia generica dello strato (VIA: fiche -> gettone, piatto -> partita, € -> pt): parte da quel testo
    function nodo(n) {
      if (n.nodeType === 3) {
        var t = n.nodeValue, x = t;
        if (!t || t.length > 4000) return;
        for (var i = 0; i < regole.length; i++) x = x.replace(regole[i][0], regole[i][1]);
        if (x !== t) n.nodeValue = x;
        return;
      }
      if (n.nodeType !== 1 || n.tagName === 'SCRIPT' || n.tagName === 'STYLE') return;
      for (var c = n.firstChild; c; c = c.nextSibling) nodo(c);
    }
    new MutationObserver(function (rec) {
      for (var i = 0; i < rec.length; i++) {
        if (rec[i].type === 'characterData') nodo(rec[i].target);
        else for (var j = 0; j < rec[i].addedNodes.length; j++) nodo(rec[i].addedNodes[j]);
      }
    }).observe(doc.documentElement, {childList: true, subtree: true, characterData: true});
    doc.addEventListener('DOMContentLoaded', function () { if (doc.body) nodo(doc.body); });
  }
  function tieniSrc(pagina) {
    // Il guscio dell'index confronta iframe.getAttribute('src') col SUO indirizzo («se diverso, ricarica»: bjrtMonta,
    // pkrtMonta, smrtMonta...). Lo strato ha girato src su figlia.html, quindi senza questo il guscio ricaricava la
    // pagina a ogni apertura (precarica -> partita -> rientro). Qui getAttribute ridà l'indirizzo che l'index ha scritto.
    var sA = Element.prototype.setAttribute, gA = Element.prototype.getAttribute;
    var P = {};                       // (prima() gira solo per il gioco aperto: una pagina sola)
    P[pagina] = 1;
    if (sA._gxL6) return;
    Element.prototype.setAttribute = function (n, v) {
      if (this instanceof HTMLIFrameElement && String(n).toLowerCase() === 'src') this._gxSrc = P[String(v).split('?')[0]] ? String(v) : null;
      return sA.apply(this, arguments);
    };
    Element.prototype.setAttribute._gxL6 = 1;
    Element.prototype.getAttribute = function (n) {
      var r = gA.apply(this, arguments);
      if (this._gxSrc && r && String(n).toLowerCase() === 'src' && r.indexOf('figlia.html') >= 0) return this._gxSrc;
      return r;
    };
  }
  GXDC_EXTRA('bj1v1', {
    pagina: PAGINA,
    testi: [[/\bFiches\b/g, 'Punti'], [/\bfiches\b/g, 'punti']],
    prima: function (D) {
      // nella pagina a parte manca la classe gxdc (la mette entra() solo nell'index): serve ai selettori del .css
      if (window.GXDC_FIGLIA) { document.documentElement.classList.add('gxdc'); rinomina(document, REGOLE); }
      else tieniSrc(PAGINA);
    }
  });
})();


/* ── lotto 6 · briscola.js ── */
/* DISCORD lotto 6 — Briscola (briscola.html, guscio BRRT dell'index). Solo gratis.
   Nelle regole: niente frase del piatto e del «banco» (qui e' il tempo che gioca la carta per te).
   Le regole di testo girano solo dentro la pagina del gioco, DOPO quelle generiche dello strato. */
(function () {
  'use strict';
  var PAGINA = 'briscola.html';
  var REGOLE = [
    [/[^.]*\b(il )?partita va tutto al vincitore[^.]*\.?/gi, ''],
    [/la carta la gioca il banco al posto tuo/g, 'la carta si gioca da sola'],
    [/In palio ci sono 120 punti/g, 'In tutto ci sono 120 punti'], [/^PARI E partita$/, 'PARI'],
    [/le poste tornano ai giocatori\.?/g, 'nessuno vince.'], [/\s*In torneo a 60 pari[^.]*\./g, ''],
    [/\bposte?\b/gi, 'partita']
  ];
  // ── comune ai giochi del lotto 6 (copiato in ogni file da fai_app.py: niente globali) ──
  function rinomina(doc, regole) {
    // gira DOPO la pulizia generica dello strato (VIA: fiche -> gettone, piatto -> partita, € -> pt): parte da quel testo
    function nodo(n) {
      if (n.nodeType === 3) {
        var t = n.nodeValue, x = t;
        if (!t || t.length > 4000) return;
        for (var i = 0; i < regole.length; i++) x = x.replace(regole[i][0], regole[i][1]);
        if (x !== t) n.nodeValue = x;
        return;
      }
      if (n.nodeType !== 1 || n.tagName === 'SCRIPT' || n.tagName === 'STYLE') return;
      for (var c = n.firstChild; c; c = c.nextSibling) nodo(c);
    }
    new MutationObserver(function (rec) {
      for (var i = 0; i < rec.length; i++) {
        if (rec[i].type === 'characterData') nodo(rec[i].target);
        else for (var j = 0; j < rec[i].addedNodes.length; j++) nodo(rec[i].addedNodes[j]);
      }
    }).observe(doc.documentElement, {childList: true, subtree: true, characterData: true});
    doc.addEventListener('DOMContentLoaded', function () { if (doc.body) nodo(doc.body); });
  }
  function tieniSrc(pagina) {
    // Il guscio dell'index confronta iframe.getAttribute('src') col SUO indirizzo («se diverso, ricarica»: bjrtMonta,
    // pkrtMonta, smrtMonta...). Lo strato ha girato src su figlia.html, quindi senza questo il guscio ricaricava la
    // pagina a ogni apertura (precarica -> partita -> rientro). Qui getAttribute ridà l'indirizzo che l'index ha scritto.
    var sA = Element.prototype.setAttribute, gA = Element.prototype.getAttribute;
    var P = {};                       // (prima() gira solo per il gioco aperto: una pagina sola)
    P[pagina] = 1;
    if (sA._gxL6) return;
    Element.prototype.setAttribute = function (n, v) {
      if (this instanceof HTMLIFrameElement && String(n).toLowerCase() === 'src') this._gxSrc = P[String(v).split('?')[0]] ? String(v) : null;
      return sA.apply(this, arguments);
    };
    Element.prototype.setAttribute._gxL6 = 1;
    Element.prototype.getAttribute = function (n) {
      var r = gA.apply(this, arguments);
      if (this._gxSrc && r && String(n).toLowerCase() === 'src' && r.indexOf('figlia.html') >= 0) return this._gxSrc;
      return r;
    };
  }
  GXDC_EXTRA('briscola', {
    pagina: PAGINA,
    testi: [],
    prima: function (D) {
      // nella pagina a parte manca la classe gxdc (la mette entra() solo nell'index): serve ai selettori del .css
      if (window.GXDC_FIGLIA) { document.documentElement.classList.add('gxdc'); rinomina(document, REGOLE); }
      else tieniSrc(PAGINA);
    }
  });
})();


/* ── lotto 6 · pk1v1.js ── */
/* DISCORD lotto 6 — Poker 1v1 (poker.html, guscio PKRT dell'index). Solo gratis.
   Texas hold'em a due con 500 punti a testa (le «fiche» del gioco: segnapunti, mai soldi). Dentro Discord: PUNTI al
   posto di fiche, MONTE al posto di piatto, APRI/APRE al posto di PUNTA (la puntata). Bui e rilancio restano: sono
   le regole del gioco.
   Le regole di testo girano solo dentro la pagina del gioco, DOPO quelle generiche dello strato. */
(function () {
  'use strict';
  var PAGINA = 'poker.html';
  var REGOLE = [
    [/^\s*partita\s*$/, 'MONTE'],                             // etichetta del piatto e tasto «PIATTO»
    [/^½ partita$/, '½ MONTE'], [/^partita DIVISO$/, 'MONTE DIVISO'], [/\bpartita diviso\b/gi, 'monte diviso'],
    [/^PUNTA$/, 'APRI'], [/\bPUNTA (\d)/g, 'APRE $1'], [/^PUNTA A\b/, 'APRI A'],
    [/PUNTA\/RILANCIA \(MIN, ½ partita, partita, cursore\)/g, 'APRI/RILANCIA (MIN, ½ MONTE, MONTE, cursore)'],
    [/\b(tutte )?le gettone\b/g, function (m, a) { return a ? 'tutti i punti' : 'i punti'; }],
    [/\bgettone\b/g, 'punti'], [/\bfiches?\b/g, 'punti'], [/\bFiches?\b/g, 'Punti'], [/\bFICHES?\b/g, 'PUNTI'],
    [/tavolo annullato: posta rimborsata/gi, 'partita annullata'], [/\bposta\b/gi, 'partita'],
    [/\bpiu' punti\b/g, 'più punti']
  ];
  // ── comune ai giochi del lotto 6 (copiato in ogni file da fai_app.py: niente globali) ──
  function rinomina(doc, regole) {
    // gira DOPO la pulizia generica dello strato (VIA: fiche -> gettone, piatto -> partita, € -> pt): parte da quel testo
    function nodo(n) {
      if (n.nodeType === 3) {
        var t = n.nodeValue, x = t;
        if (!t || t.length > 4000) return;
        for (var i = 0; i < regole.length; i++) x = x.replace(regole[i][0], regole[i][1]);
        if (x !== t) n.nodeValue = x;
        return;
      }
      if (n.nodeType !== 1 || n.tagName === 'SCRIPT' || n.tagName === 'STYLE') return;
      for (var c = n.firstChild; c; c = c.nextSibling) nodo(c);
    }
    new MutationObserver(function (rec) {
      for (var i = 0; i < rec.length; i++) {
        if (rec[i].type === 'characterData') nodo(rec[i].target);
        else for (var j = 0; j < rec[i].addedNodes.length; j++) nodo(rec[i].addedNodes[j]);
      }
    }).observe(doc.documentElement, {childList: true, subtree: true, characterData: true});
    doc.addEventListener('DOMContentLoaded', function () { if (doc.body) nodo(doc.body); });
  }
  function tieniSrc(pagina) {
    // Il guscio dell'index confronta iframe.getAttribute('src') col SUO indirizzo («se diverso, ricarica»: bjrtMonta,
    // pkrtMonta, smrtMonta...). Lo strato ha girato src su figlia.html, quindi senza questo il guscio ricaricava la
    // pagina a ogni apertura (precarica -> partita -> rientro). Qui getAttribute ridà l'indirizzo che l'index ha scritto.
    var sA = Element.prototype.setAttribute, gA = Element.prototype.getAttribute;
    var P = {};                       // (prima() gira solo per il gioco aperto: una pagina sola)
    P[pagina] = 1;
    if (sA._gxL6) return;
    Element.prototype.setAttribute = function (n, v) {
      if (this instanceof HTMLIFrameElement && String(n).toLowerCase() === 'src') this._gxSrc = P[String(v).split('?')[0]] ? String(v) : null;
      return sA.apply(this, arguments);
    };
    Element.prototype.setAttribute._gxL6 = 1;
    Element.prototype.getAttribute = function (n) {
      var r = gA.apply(this, arguments);
      if (this._gxSrc && r && String(n).toLowerCase() === 'src' && r.indexOf('figlia.html') >= 0) return this._gxSrc;
      return r;
    };
  }
  GXDC_EXTRA('pk1v1', {
    pagina: PAGINA,
    testi: [[/\bFiches\b/g, 'Punti'], [/\bfiches\b/g, 'punti']],
    prima: function (D) {
      // nella pagina a parte manca la classe gxdc (la mette entra() solo nell'index): serve ai selettori del .css
      if (window.GXDC_FIGLIA) { document.documentElement.classList.add('gxdc'); rinomina(document, REGOLE); }
      else tieniSrc(PAGINA);
    }
  });
})();


/* ── lotto 6 · settemezzo.js ── */
/* DISCORD lotto 6 — Sette e mezzo (settemezzo.html, guscio SMRT dell'index). Solo gratis, senza banco.
   Il piatto si vede solo quando c'e' una posta (mai qui: pot 0). Il panno verde da bisca diventa un tavolo blu notte
   (settemezzo.css).
   Le regole di testo girano solo dentro la pagina del gioco, DOPO quelle generiche dello strato. */
(function () {
  'use strict';
  var PAGINA = 'settemezzo.html';
  var REGOLE = [
    [/[^.]*\b(il )?partita va a uno solo\.?/g, ''], [/\bposta\b/gi, 'partita']
  ];
  // ── comune ai giochi del lotto 6 (copiato in ogni file da fai_app.py: niente globali) ──
  function rinomina(doc, regole) {
    // gira DOPO la pulizia generica dello strato (VIA: fiche -> gettone, piatto -> partita, € -> pt): parte da quel testo
    function nodo(n) {
      if (n.nodeType === 3) {
        var t = n.nodeValue, x = t;
        if (!t || t.length > 4000) return;
        for (var i = 0; i < regole.length; i++) x = x.replace(regole[i][0], regole[i][1]);
        if (x !== t) n.nodeValue = x;
        return;
      }
      if (n.nodeType !== 1 || n.tagName === 'SCRIPT' || n.tagName === 'STYLE') return;
      for (var c = n.firstChild; c; c = c.nextSibling) nodo(c);
    }
    new MutationObserver(function (rec) {
      for (var i = 0; i < rec.length; i++) {
        if (rec[i].type === 'characterData') nodo(rec[i].target);
        else for (var j = 0; j < rec[i].addedNodes.length; j++) nodo(rec[i].addedNodes[j]);
      }
    }).observe(doc.documentElement, {childList: true, subtree: true, characterData: true});
    doc.addEventListener('DOMContentLoaded', function () { if (doc.body) nodo(doc.body); });
  }
  function tieniSrc(pagina) {
    // Il guscio dell'index confronta iframe.getAttribute('src') col SUO indirizzo («se diverso, ricarica»: bjrtMonta,
    // pkrtMonta, smrtMonta...). Lo strato ha girato src su figlia.html, quindi senza questo il guscio ricaricava la
    // pagina a ogni apertura (precarica -> partita -> rientro). Qui getAttribute ridà l'indirizzo che l'index ha scritto.
    var sA = Element.prototype.setAttribute, gA = Element.prototype.getAttribute;
    var P = {};                       // (prima() gira solo per il gioco aperto: una pagina sola)
    P[pagina] = 1;
    if (sA._gxL6) return;
    Element.prototype.setAttribute = function (n, v) {
      if (this instanceof HTMLIFrameElement && String(n).toLowerCase() === 'src') this._gxSrc = P[String(v).split('?')[0]] ? String(v) : null;
      return sA.apply(this, arguments);
    };
    Element.prototype.setAttribute._gxL6 = 1;
    Element.prototype.getAttribute = function (n) {
      var r = gA.apply(this, arguments);
      if (this._gxSrc && r && String(n).toLowerCase() === 'src' && r.indexOf('figlia.html') >= 0) return this._gxSrc;
      return r;
    };
  }
  GXDC_EXTRA('settemezzo', {
    pagina: PAGINA,
    testi: [],
    prima: function (D) {
      // nella pagina a parte manca la classe gxdc (la mette entra() solo nell'index): serve ai selettori del .css
      if (window.GXDC_FIGLIA) { document.documentElement.classList.add('gxdc'); rinomina(document, REGOLE); }
      else tieniSrc(PAGINA);
    }
  });
})();


/* ── lotto 6 · tappo.js ── */
/* DISCORD lotto 6 — Mano sul mazzo (tappo.html, guscio TPRT dell'index). Solo gratis.
   Nelle regole: niente «prende tutto il piatto» e niente «banco» (il tavolo passa le carte da solo).
   Le regole di testo girano solo dentro la pagina del gioco, DOPO quelle generiche dello strato. */
(function () {
  'use strict';
  var PAGINA = 'tappo.html';
  var REGOLE = [
    [/L’ultimo che resta al tavolo prende tutto il partita\./g, 'L’ultimo che resta al tavolo vince.'],
    [/\bprende tutto il partita\b/g, 'vince'], [/il banco passa una carta a caso/g, 'passa una carta a caso il tavolo'],
    [/le carte le passa il banco/g, 'le carte le passa il tavolo'], [/\bposta\b/gi, 'partita']
  ];
  // ── comune ai giochi del lotto 6 (copiato in ogni file da fai_app.py: niente globali) ──
  function rinomina(doc, regole) {
    // gira DOPO la pulizia generica dello strato (VIA: fiche -> gettone, piatto -> partita, € -> pt): parte da quel testo
    function nodo(n) {
      if (n.nodeType === 3) {
        var t = n.nodeValue, x = t;
        if (!t || t.length > 4000) return;
        for (var i = 0; i < regole.length; i++) x = x.replace(regole[i][0], regole[i][1]);
        if (x !== t) n.nodeValue = x;
        return;
      }
      if (n.nodeType !== 1 || n.tagName === 'SCRIPT' || n.tagName === 'STYLE') return;
      for (var c = n.firstChild; c; c = c.nextSibling) nodo(c);
    }
    new MutationObserver(function (rec) {
      for (var i = 0; i < rec.length; i++) {
        if (rec[i].type === 'characterData') nodo(rec[i].target);
        else for (var j = 0; j < rec[i].addedNodes.length; j++) nodo(rec[i].addedNodes[j]);
      }
    }).observe(doc.documentElement, {childList: true, subtree: true, characterData: true});
    doc.addEventListener('DOMContentLoaded', function () { if (doc.body) nodo(doc.body); });
  }
  function tieniSrc(pagina) {
    // Il guscio dell'index confronta iframe.getAttribute('src') col SUO indirizzo («se diverso, ricarica»: bjrtMonta,
    // pkrtMonta, smrtMonta...). Lo strato ha girato src su figlia.html, quindi senza questo il guscio ricaricava la
    // pagina a ogni apertura (precarica -> partita -> rientro). Qui getAttribute ridà l'indirizzo che l'index ha scritto.
    var sA = Element.prototype.setAttribute, gA = Element.prototype.getAttribute;
    var P = {};                       // (prima() gira solo per il gioco aperto: una pagina sola)
    P[pagina] = 1;
    if (sA._gxL6) return;
    Element.prototype.setAttribute = function (n, v) {
      if (this instanceof HTMLIFrameElement && String(n).toLowerCase() === 'src') this._gxSrc = P[String(v).split('?')[0]] ? String(v) : null;
      return sA.apply(this, arguments);
    };
    Element.prototype.setAttribute._gxL6 = 1;
    Element.prototype.getAttribute = function (n) {
      var r = gA.apply(this, arguments);
      if (this._gxSrc && r && String(n).toLowerCase() === 'src' && r.indexOf('figlia.html') >= 0) return this._gxSrc;
      return r;
    };
  }
  GXDC_EXTRA('tappo', {
    pagina: PAGINA,
    testi: [[/\bBISCA\b/g, 'MANO SUL MAZZO'], [/\bBisca\b/g, 'Mano sul mazzo'], [/\bbisca\b/g, 'mano sul mazzo'], [/\bTappo\b/g, 'Mano sul mazzo']],
    prima: function (D) {
      // nella pagina a parte manca la classe gxdc (la mette entra() solo nell'index): serve ai selettori del .css
      if (window.GXDC_FIGLIA) { document.documentElement.classList.add('gxdc'); rinomina(document, REGOLE); }
      else tieniSrc(PAGINA);
    }
  });
})();


/* ── lotto 7 · boxe.js ── */
/* DISCORD lotto 7 — Boxe dentro Discord (gratis). La partita e' del server real-time (biglietto Discord di sempre, come i
   duelli del lotto 1): qui cambia solo il TERMINALE che disegna il ring. Nella mini app e' un iframe sul VPS
   (https://62-238-17-24.sslip.io/boxe-rt/?guscio=1), che dentro Discord non si puo' aprire: indirizzo esterno (CSP frame-src)
   e pagina con script in linea (CSP senza 'unsafe-inline'). Al suo posto giochi/boxe/rt.html del repo Discord: stessa
   origine dell'Activity, scarica il terminale VERO del VPS via la mapping /api (/api/boxe-rt/...), ne fa script blob: e lo
   scrive. Il terminale accetta i messaggi dalla propria origine, che qui e' la stessa dell'index: BXRT_ORIGIN = location.origin.
   L'index dichiara `var BXRT_URL = '...'` e `var BXRT_ORIGIN = '...'`: le due proprieta' si fissano PRIMA dei suoi script
   (getter senza setter efficace), cosi' la sua assegnazione non le cambia. */
GXDC_EXTRA('boxe', {
  pagina: null,
  testi: [],
  prima: function (D) {
    var url = location.origin + (window.GXDC_RADICE || '/') + 'giochi/boxe/rt.html?guscio=1';
    try {
      Object.defineProperty(window, 'BXRT_URL', {configurable: true, get: function () { return url; }, set: function () {}});
      Object.defineProperty(window, 'BXRT_ORIGIN', {configurable: true, get: function () { return location.origin; }, set: function () {}});
    } catch (e) { console.warn('[discord] boxe: indirizzo del terminale non fissato', e); }
  }
});


/* ── lotto 7 · bs.js ── */
/* DISCORD lotto 7 — Battaglia navale dentro Discord (gratis). FILE GENERATO da _duello.tpl.js con costruisci.py: non modificarlo a mano.
   E' un duello HTTP del backend (non passa dal server real-time): il catalogo prende il biglietto Discord gratis come per tutti i
   giochi (sala del canale, coda, allenamento), questa pagina lo riscatta su /discord/duel/apri e apre il tavolo della mini app
   (#pvp-modal dentro #duel). Le chiamate della mini app a /duel/<verbo> vanno su /discord/duel/<verbo> con la sessione Discord
   (mai user_id, mai poste). Uscita, rivincita e «Torna ai giochi» passano dal catalogo. */
GXDC_EXTRA('bs', (function () {
  'use strict';
  var K = 'bs';                         // la sigla del duello nel backend (ch | bs)
  var STORE = 'DLBS', ENTRA = 'dlBsEnter', START = 'dlBsStart';
  var VERBI = /\/duel\/(ch_state|ch_move|ch_resign|ch_cancel|ch_join|bs_state|bs_place|bs_fire|bs_cancel|bs_join|abbandona|match_vs|practice_start)(?:\?|$)/;
  var D0 = null, f0 = null, finito = false, vivo = false;

  function api() { try { return (parent.GX_CONFIG && parent.GX_CONFIG.apiBase) || '/api'; } catch (e) { return '/api'; } }
  function intest() { return {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (D0 && D0.sessione || '')}; }
  function alCat(cosa) {
    if (finito) return;
    finito = true;
    try { var st = window[STORE]; if (st && st.poll) { clearInterval(st.poll); st.poll = null; } } catch (e) {}
    D0.alCatalogo(cosa);
  }

  // i testi del tavolo: niente piatto, percentuali, euro; «gratis» non serve (qui non c'e' altro)
  function ripulisci(h) {
    if (typeof h !== 'string') return h;
    h = h.replace(/(<div class="dlbs-pot">)([\s\S]*?)(<\/div>)/g, function (m, a, t, c) {
      var x = 'Amichevole';
      if (/ALLENAMENTO/i.test(t)) x = '🤖 Allenamento con Pixel · senza orologio';
      else if (/checkmate/i.test(t)) x = 'Amichevole · vince lo scacco matto';
      else if (/sink the enemy fleet/i.test(t)) x = 'Amichevole · affonda la flotta nemica';
      else if (/winner takes/i.test(t)) x = 'Amichevole · vince chi affonda tutte le navi';
      else if (!/POT|€/.test(t)) return m;
      return a + x + c;
    });
    h = h.replace(/<div style="text-align:center;font-weight:800;color:[^"]*;">(?:[+−-]€[\d.,]+|€[\d.,]+ returned)<\/div>/g, '');
    h = h.replace(/\s*·\s*GRATIS\b/g, '');
    h = h.replace(/>CLOSE<\/button>/g, '>TORNA AI GIOCHI</button>');
    h = h.replace(/dlCloseOverlay\(\);practiceStart\(/g, 'practiceStart(');   // «Ancora» dell'allenamento: torna al catalogo come ANCORA, non come FINE
    return h;
  }

  // la testata del restyle (.xz-hd) sopra il tavolo dice «piatto · al vincitore il 95%»: dentro Discord dice che partita e'
  function testata() {
    try {
      var el = document.querySelector('#pvp-modal .xz-hd-s');
      if (!el) return;
      var st = window[STORE], v = st && (st.view || st.lastView) || {};
      var t = v.pratica ? 'Allenamento con Pixel' : 'Amichevole · ' + (v.opp_name ? 'contro ' + v.opp_name : 'nel canale');
      if (el.textContent !== t) el.textContent = t;
    } catch (e) {}
  }

  function ritocca() {
    var g0 = window.go;
    window.go = function (id) { if (id === 'duel') return g0.apply(this, arguments); alCat('fine'); };
    var c0 = window.dlCloseOverlay;
    window.dlCloseOverlay = function () { try { c0.apply(this, arguments); } catch (e) {} alCat('fine'); };
    var m0 = window.dlModalHTML;
    window.dlModalHTML = function (h) {
      var r = m0.call(this, ripulisci(h));
      testata();
      return r;
    };
    // «Rivincita» / «Ancora»: dentro Discord e' il catalogo a riaprire la stessa sala, coda o allenamento
    window[START] = function () { alCat('ancora'); };
    window.practiceStart = function () { alCat('ancora'); };
    var e0 = window.gbEsciConferma;
    if (typeof e0 === 'function') {
      window.gbEsciConferma = function (o, ok) {
        o = o || {};
        if (o.tipo !== 'allenamento') { o.tit = '🏳️ ESCI DALLA PARTITA?'; o.txt = 'Se esci adesso, la partita la vince l’avversario.'; o.si = 'ESCI'; o.col = '#38bdf8'; }
        return e0.call(this, o, ok);
      };
    }
    // chi chiude il gioco senza «Esci» (catalogo, Activity chiusa) lascia il tavolo: l'altro vince subito
    addEventListener('pagehide', function () {
      if (!vivo) return;
      try {
        var v = window[STORE] && (window[STORE].view || window[STORE].lastView);
        if (v && (v.status === 'done' || v.result || v.over)) return;
        f0(api() + '/discord/duel/abbandona', {method: 'POST', keepalive: true, headers: intest(), body: JSON.stringify({gioco: K})});
      } catch (e) {}
    });
  }

  function entra() {
    if (typeof window.go !== 'function' || typeof window.S === 'undefined' || typeof window[ENTRA] !== 'function' ||
        typeof window.dlModalHTML !== 'function' || !window[STORE]) { setTimeout(entra, 80); return; }
    document.documentElement.classList.add('gxdc', 'gx-duello-http');
    try { if (!S.userId) S.userId = String(D0.io.id); S.name = D0.io.nome || S.name; } catch (e) {}
    if (!D0.ticket) { alCat('errore'); return; }
    f0(api() + '/discord/duel/apri', {method: 'POST', headers: intest(), body: JSON.stringify({ticket: D0.ticket})})
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok || !j.vista) { console.warn('[discord] duello non aperto', j); alCat('errore'); return; }
        ritocca();
        window.go('duel');
        var st = window[STORE];
        st.bet = 0; st.shown = false; st.vsShown = true; st.sig = '';
        st.lastSeq = 0; st.ships = []; st.horiz = true; st.ui = ''; st.gara = '';
        vivo = true;
        setInterval(testata, 700);       // la testata del restyle si riscrive da sola: la si ricorregge
        window[ENTRA](j.vista);
        try { window.focus(); } catch (e) {}
      }, function (e) { console.warn('[discord] duello: rete', e); alCat('errore'); });
  }

  return {
    pagina: null,
    testi: [],
    prima: function (D) {
      D0 = D;
      D.partito = true;                    // niente ingresso RT di shell.js: questo gioco non ha un biglietto del server real-time
      f0 = window.fetch;
      window.fetch = function (input, init) {
        var u = (typeof input === 'string') ? input : (input && input.url) || '';
        var m = u.indexOf('62-238-17-24.sslip.io') >= 0 ? VERBI.exec(u) : null;
        if (m) {
          var b = (init && init.body) || '{}';
          try { var o = JSON.parse(b); delete o.user_id; delete o.username; delete o.photo_url; b = JSON.stringify(o); } catch (e) { b = '{}'; }
          return f0.call(this, api() + '/discord/duel/' + m[1], {method: 'POST', headers: intest(), body: b});
        }
        return f0.apply(this, arguments);
      };
      if (document.readyState === 'complete') setTimeout(entra, 0);
      else addEventListener('load', function () { setTimeout(entra, 0); });
    }
  };
})());


/* ── lotto 7 · chess.js ── */
/* DISCORD lotto 7 — Scacchi dentro Discord (gratis). FILE GENERATO da _duello.tpl.js con costruisci.py: non modificarlo a mano.
   E' un duello HTTP del backend (non passa dal server real-time): il catalogo prende il biglietto Discord gratis come per tutti i
   giochi (sala del canale, coda, allenamento), questa pagina lo riscatta su /discord/duel/apri e apre il tavolo della mini app
   (#pvp-modal dentro #duel). Le chiamate della mini app a /duel/<verbo> vanno su /discord/duel/<verbo> con la sessione Discord
   (mai user_id, mai poste). Uscita, rivincita e «Torna ai giochi» passano dal catalogo. */
GXDC_EXTRA('chess', (function () {
  'use strict';
  var K = 'ch';                         // la sigla del duello nel backend (ch | bs)
  var STORE = 'DLCH', ENTRA = 'dlChEnter', START = 'dlChStart';
  var VERBI = /\/duel\/(ch_state|ch_move|ch_resign|ch_cancel|ch_join|bs_state|bs_place|bs_fire|bs_cancel|bs_join|abbandona|match_vs|practice_start)(?:\?|$)/;
  var D0 = null, f0 = null, finito = false, vivo = false;

  function api() { try { return (parent.GX_CONFIG && parent.GX_CONFIG.apiBase) || '/api'; } catch (e) { return '/api'; } }
  function intest() { return {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (D0 && D0.sessione || '')}; }
  function alCat(cosa) {
    if (finito) return;
    finito = true;
    try { var st = window[STORE]; if (st && st.poll) { clearInterval(st.poll); st.poll = null; } } catch (e) {}
    D0.alCatalogo(cosa);
  }

  // i testi del tavolo: niente piatto, percentuali, euro; «gratis» non serve (qui non c'e' altro)
  function ripulisci(h) {
    if (typeof h !== 'string') return h;
    h = h.replace(/(<div class="dlbs-pot">)([\s\S]*?)(<\/div>)/g, function (m, a, t, c) {
      var x = 'Amichevole';
      if (/ALLENAMENTO/i.test(t)) x = '🤖 Allenamento con Pixel · senza orologio';
      else if (/checkmate/i.test(t)) x = 'Amichevole · vince lo scacco matto';
      else if (/sink the enemy fleet/i.test(t)) x = 'Amichevole · affonda la flotta nemica';
      else if (/winner takes/i.test(t)) x = 'Amichevole · vince chi affonda tutte le navi';
      else if (!/POT|€/.test(t)) return m;
      return a + x + c;
    });
    h = h.replace(/<div style="text-align:center;font-weight:800;color:[^"]*;">(?:[+−-]€[\d.,]+|€[\d.,]+ returned)<\/div>/g, '');
    h = h.replace(/\s*·\s*GRATIS\b/g, '');
    h = h.replace(/>CLOSE<\/button>/g, '>TORNA AI GIOCHI</button>');
    h = h.replace(/dlCloseOverlay\(\);practiceStart\(/g, 'practiceStart(');   // «Ancora» dell'allenamento: torna al catalogo come ANCORA, non come FINE
    return h;
  }

  // la testata del restyle (.xz-hd) sopra il tavolo dice «piatto · al vincitore il 95%»: dentro Discord dice che partita e'
  function testata() {
    try {
      var el = document.querySelector('#pvp-modal .xz-hd-s');
      if (!el) return;
      var st = window[STORE], v = st && (st.view || st.lastView) || {};
      var t = v.pratica ? 'Allenamento con Pixel' : 'Amichevole · ' + (v.opp_name ? 'contro ' + v.opp_name : 'nel canale');
      if (el.textContent !== t) el.textContent = t;
    } catch (e) {}
  }

  function ritocca() {
    var g0 = window.go;
    window.go = function (id) { if (id === 'duel') return g0.apply(this, arguments); alCat('fine'); };
    var c0 = window.dlCloseOverlay;
    window.dlCloseOverlay = function () { try { c0.apply(this, arguments); } catch (e) {} alCat('fine'); };
    var m0 = window.dlModalHTML;
    window.dlModalHTML = function (h) {
      var r = m0.call(this, ripulisci(h));
      testata();
      return r;
    };
    // «Rivincita» / «Ancora»: dentro Discord e' il catalogo a riaprire la stessa sala, coda o allenamento
    window[START] = function () { alCat('ancora'); };
    window.practiceStart = function () { alCat('ancora'); };
    var e0 = window.gbEsciConferma;
    if (typeof e0 === 'function') {
      window.gbEsciConferma = function (o, ok) {
        o = o || {};
        if (o.tipo !== 'allenamento') { o.tit = '🏳️ ESCI DALLA PARTITA?'; o.txt = 'Se esci adesso, la partita la vince l’avversario.'; o.si = 'ESCI'; o.col = '#38bdf8'; }
        return e0.call(this, o, ok);
      };
    }
    // chi chiude il gioco senza «Esci» (catalogo, Activity chiusa) lascia il tavolo: l'altro vince subito
    addEventListener('pagehide', function () {
      if (!vivo) return;
      try {
        var v = window[STORE] && (window[STORE].view || window[STORE].lastView);
        if (v && (v.status === 'done' || v.result || v.over)) return;
        f0(api() + '/discord/duel/abbandona', {method: 'POST', keepalive: true, headers: intest(), body: JSON.stringify({gioco: K})});
      } catch (e) {}
    });
  }

  function entra() {
    if (typeof window.go !== 'function' || typeof window.S === 'undefined' || typeof window[ENTRA] !== 'function' ||
        typeof window.dlModalHTML !== 'function' || !window[STORE]) { setTimeout(entra, 80); return; }
    document.documentElement.classList.add('gxdc', 'gx-duello-http');
    try { if (!S.userId) S.userId = String(D0.io.id); S.name = D0.io.nome || S.name; } catch (e) {}
    if (!D0.ticket) { alCat('errore'); return; }
    f0(api() + '/discord/duel/apri', {method: 'POST', headers: intest(), body: JSON.stringify({ticket: D0.ticket})})
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok || !j.vista) { console.warn('[discord] duello non aperto', j); alCat('errore'); return; }
        ritocca();
        window.go('duel');
        var st = window[STORE];
        st.bet = 0; st.shown = false; st.vsShown = true; st.sig = '';
        st.sel = -1; st.promo = null;
        vivo = true;
        setInterval(testata, 700);       // la testata del restyle si riscrive da sola: la si ricorregge
        window[ENTRA](j.vista);
        try { window.focus(); } catch (e) {}
      }, function (e) { console.warn('[discord] duello: rete', e); alCat('errore'); });
  }

  return {
    pagina: null,
    testi: [],
    prima: function (D) {
      D0 = D;
      D.partito = true;                    // niente ingresso RT di shell.js: questo gioco non ha un biglietto del server real-time
      f0 = window.fetch;
      window.fetch = function (input, init) {
        var u = (typeof input === 'string') ? input : (input && input.url) || '';
        var m = u.indexOf('62-238-17-24.sslip.io') >= 0 ? VERBI.exec(u) : null;
        if (m) {
          var b = (init && init.body) || '{}';
          try { var o = JSON.parse(b); delete o.user_id; delete o.username; delete o.photo_url; b = JSON.stringify(o); } catch (e) { b = '{}'; }
          return f0.call(this, api() + '/discord/duel/' + m[1], {method: 'POST', headers: intest(), body: b});
        }
        return f0.apply(this, arguments);
      };
      if (document.readyState === 'complete') setTimeout(entra, 0);
      else addEventListener('load', function () { setTimeout(entra, 0); });
    }
  };
})());


/* ── lotto pong_fix · pong.js ── */
/* DISCORD · Neon Pong (pong_fix, 17/11/2026) — il Pong VERO della mini app (via /app), con quello che serve su PC.
   Il client leggero della fase 1 (pages/giochi/pong/) va in pensione: ritardo tasto -> racchetta ~200 ms (nessuna
   predizione), mouse che «caccia» (comando proporzionale col giro di rete in mezzo), nebbia disegnata come un
   rettangolo che si accende solo quando la palla e' nascosta. Qui tutto viene dalla mini app: predizione della
   racchetta, orologio adattivo della palla (pgClk), i 9 poteri con il loro disegno (anche la nebbia), suoni e arte.
   Cosa aggiunge questo strato, SOLO dentro Discord e SOLO col mouse:
   1) il mouse sopra il campo porta la racchetta SOTTO il cursore, senza clic (prima: trascinare la barra sotto);
   2) su PC la barra da trascinare sparisce (CSS) e il campo prende la sua altezza; col tocco torna tutto com'era;
   3) la guida «Tasti» e la scritta nella tela dicono il gesto nuovo. Tastiera invariata (frecce / A D, gia' nella mini app). */
GXDC_EXTRA('pong', {
  pagina: null,
  rapporto: null,
  // (niente `testi`: la lista e' di tutta la pagina e «Trascina la barra» e' anche del Biliardo; qui sotto, solo nel Pong)
  testi: [],
  prima: function (D) {
    var H = document.documentElement;
    // la scritta DENTRO la tela («↔ TRASCINA LA BARRA SOTTO»): su PC la barra non c'e' piu'
    var P2 = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
    if (P2 && !P2.fillText._gxPong) {
      var f0 = P2.fillText;
      P2.fillText = function (t) {
        if (typeof t === 'string' && t.charAt(0) === '↔' && H.classList.contains('xpc-pc')) {
          var a = Array.prototype.slice.call(arguments);
          if (/TRASCINA LA BARRA SOTTO/.test(t)) a[0] = '↔ MUOVI IL MOUSE SUL CAMPO';
          else if (/DRAG THE BAR BELOW/.test(t)) a[0] = '↔ MOVE THE MOUSE OVER THE FIELD';
          return f0.apply(this, a);
        }
        return f0.apply(this, arguments);
      };
      P2.fillText._gxPong = 1;
    }
    // la guida «Tasti» del Pong: il gesto del mouse nuovo
    function testo(n) {
      if (n.nodeType === 3) {
        var v = n.nodeValue;
        if (v && v.indexOf('Trascina la barra') >= 0) n.nodeValue = v.replace('Trascina la barra', 'Muovi il mouse sul campo');
        else if (v && v.indexOf('Drag the bar') >= 0) n.nodeValue = v.replace('Drag the bar', 'Move the mouse over the field');
        return;
      }
      if (n.nodeType !== 1 || n.tagName === 'SCRIPT' || n.tagName === 'STYLE') return;
      for (var c = n.firstChild; c; c = c.nextSibling) testo(c);
    }
    new MutationObserver(function (rec) {
      for (var i = 0; i < rec.length; i++) for (var j = 0; j < rec[i].addedNodes.length; j++) {
        var n = rec[i].addedNodes[j];
        if (n.nodeType === 3 || (n.closest && n.closest('.xpc-guida')) || (n.querySelector && n.querySelector('.xpc-guida'))) testo(n);
      }
    }).observe(H, {childList: true, subtree: true});
  },
  dopo: function (D) {
    var H = document.documentElement;
    function inPartita() { return window.RTD && RTD.game === 'pong' && RTD.ui === 'match' && RTD.pgBar && !RTD.spec && RTD.cv; }
    // ── 1) il mouse sopra il campo: bersaglio = la x del cursore, nelle stesse unita' della barra (0..MW sulla
    //    larghezza della tela, come pgBarMount). Il pump della mini app (pgBarAxis a ogni fotogramma) fa il resto:
    //    stesso comando {t:'in'}, stessa frenata e isteresi tarate sul motore.
    function bersaglio(ev) {
      if (ev.pointerType && ev.pointerType !== 'mouse') return;
      if (!inPartita()) return;
      if (RTD.pgBar.on) return;                                  // sta trascinando la barra: comanda la barra
      var t = ev.target;
      if (t && t.closest && t.closest('button,a,input,.xpc-guida,.gb-esci-box,#gb-esci,[role="dialog"]')) return;
      var w = document.getElementById('arc-wrap');
      var r = RTD.cv.getBoundingClientRect(), rw = w ? w.getBoundingClientRect() : r;
      if (!r.width || ev.clientY < rw.top - 8 || ev.clientY > rw.bottom + 120) return;   // sopra il campo (e sotto)
      var MW = (RTD.map && RTD.map.w) || 7;
      var f = (ev.clientX - r.left) / r.width;
      RTD.pgBar.tx = Math.max(0, Math.min(1, f)) * MW;
      try { pgBarAxis(); } catch (e) {}
    }
    addEventListener('pointermove', bersaglio, {passive: true});
    // ── 2) la barra sparisce su PC (CSS: html.xpc-pc): la tela va rimisurata quando lo spazio cambia
    var tm = 0, ultimo = '';
    function rimisura() {
      clearTimeout(tm);
      tm = setTimeout(function () {
        if (!inPartita()) return;
        var w = document.getElementById('arc-wrap'); if (!w) return;
        var k = w.clientWidth + 'x' + w.clientHeight;
        if (k === ultimo) return;
        ultimo = k;
        try { rtdCanvasInit(); } catch (e) {}
      }, 60);
    }
    try {
      var w0 = document.getElementById('arc-wrap');
      if (w0 && window.ResizeObserver) new ResizeObserver(rimisura).observe(w0);
      new MutationObserver(rimisura).observe(H, {attributes: true, attributeFilter: ['class']});
    } catch (e) {}
    rimisura();
  }
});



/* ── geo · geo.js ── */
/* DISCORD · Geo (17/11/2026) — Street View VERO dentro l'Activity, gratis.
   La pagina del gioco e' geo.html della mini app (guscio GEORT dell'index -> figlia.html?pg=geo.html?...), invariata.
   Il problema: la CSP di discordsays.com ammette solo la propria origine. Google Maps JS chiede script (caricatore,
   main.js, JSONP AuthenticationService/QuotaService), XHR/fetch ($rpc GetMetadata/SingleImageSearch/GetViewportInfo),
   immagini (riquadri della mappa /maps/vt, riquadri del panorama streetviewpixels-pa, cursori, lh3 per le foto-sfere).
   Qui OGNI indirizzo assoluto di quegli host diventa la stessa origine + una URL mapping nuova del portale Discord:
       maps.googleapis.com                 -> /gmaps
       maps.gstatic.com                    -> /gstatic
       streetviewpixels-pa.googleapis.com  -> /gsvpx
       lh3..lh6.googleusercontent.com      -> /glh      (tutti su lh3: stessi contenuti)
   I punti dove passano gli indirizzi: src di <script>/<img> (proprieta' e setAttribute), fetch, XMLHttpRequest,
   sendBeacon, Worker, url(...) negli stili in linea (cursori). I font di Google (fonts.googleapis.com) NON si caricano
   (il loro CSS punta a fonts.gstatic.com, che la CSP blocca comunque): un foglio vuoto, si usano i font di sistema.
   Il resto e' come gli altri giochi a pagina a parte (lotto 3): biglietto Discord gratis, seggi ai bot del motore,
   testi senza soldi. Gira SOLO nella pagina geo.html (window.GXDC_FIGLIA); nell'index non tocca niente. */
(function () {
  'use strict';
  var PAGINA = 'geo.html';
  var MAPPA = {
    'maps.googleapis.com': 'gmaps',
    'maps.gstatic.com': 'gstatic',
    'streetviewpixels-pa.googleapis.com': 'gsvpx'
  };
  function prefisso(h) {
    h = String(h || '').toLowerCase();
    if (MAPPA[h]) return MAPPA[h];
    if (/^lh[3-6]\.googleusercontent\.com$/.test(h)) return 'glh';
    return null;
  }
  var CSS_VUOTO = null;
  function cssVuoto() {
    if (!CSS_VUOTO) CSS_VUOTO = URL.createObjectURL(new Blob(['/* gxdc: font di Google non caricati */'], {type: 'text/css'}));
    return CSS_VUOTO;
  }
  var CONTI = {riscritti: 0, font: 0};
  // un indirizzo -> quello della mapping (stessa origine). Tutto il resto torna tale e quale (anche gli oggetti Trusted Types)
  function rw(u) {
    if (u == null) return u;
    var s = String(u);
    var m = /^(?:https?:)?\/\/([A-Za-z0-9.-]+)(?::\d+)?([\/?#][\s\S]*)?$/.exec(s);
    if (!m) return u;
    var p = prefisso(m[1]);
    if (!p) return u;
    var resto = m[2] || '/';
    if (resto.charAt(0) !== '/') resto = '/' + resto;
    CONTI.riscritti++;
    return location.origin + '/' + p + resto;
  }
  function font(u) { return /^(?:https?:)?\/\/fonts\.(googleapis|gstatic)\.com\//i.test(String(u == null ? '' : u)); }
  // url(...) dentro un valore di stile (i cursori «openhand» di Maps)
  function rwCss(v) {
    if (typeof v !== 'string' || v.indexOf('url(') < 0) return v;
    return v.replace(/url\((['"]?)((?:https?:)?\/\/[^'")]+)\1\)/g, function (t, q, u) { var r = rw(u); return r === u ? t : 'url(' + q + r + q + ')'; });
  }

  function installa(w) {
    if (w.__gxGeoRete) return;
    w.__gxGeoRete = CONTI;
    var E = w.Element.prototype;
    // 1) le proprieta' src/href
    function avvolgi(Proto, prop, fn) {
      var d = Object.getOwnPropertyDescriptor(Proto, prop);
      if (!d || !d.set) return;
      Object.defineProperty(Proto, prop, {configurable: true, enumerable: d.enumerable, get: d.get,
        set: function (v) { return d.set.call(this, fn(v, this)); }});
    }
    avvolgi(w.HTMLScriptElement.prototype, 'src', function (v) { return rw(v); });
    avvolgi(w.HTMLImageElement.prototype, 'src', function (v) { return rw(v); });
    avvolgi(w.HTMLSourceElement.prototype, 'src', function (v) { return rw(v); });
    avvolgi(w.HTMLLinkElement.prototype, 'href', function (v) { if (font(v)) { CONTI.font++; return cssVuoto(); } return rw(v); });
    // 2) setAttribute (qualche libreria passa da li')
    var sA = E.setAttribute;
    E.setAttribute = function (n, v) {
      var k = String(n).toLowerCase();
      if ((k === 'src' || k === 'href') && (this instanceof w.HTMLScriptElement || this instanceof w.HTMLImageElement ||
          this instanceof w.HTMLLinkElement || this instanceof w.HTMLSourceElement)) {
        if (k === 'href' && font(v)) { CONTI.font++; v = cssVuoto(); } else v = rw(v);
      } else if (k === 'style') v = rwCss(String(v));
      return sA.call(this, n, v);
    };
    // 3) fetch / XHR / sendBeacon / Worker
    var f0 = w.fetch;
    if (f0) w.fetch = function (input, init) {
      try {
        if (typeof input === 'string' || input instanceof w.URL) { var r = rw(String(input)); if (r !== String(input)) input = r; }
        else if (input && input.url) { var r2 = rw(input.url); if (r2 !== input.url) input = new w.Request(r2, input); }
      } catch (e) {}
      return f0.call(this, input, init);
    };
    var o0 = w.XMLHttpRequest.prototype.open;
    w.XMLHttpRequest.prototype.open = function (m, u) {
      var a = Array.prototype.slice.call(arguments);
      a[1] = rw(u);
      return o0.apply(this, a);
    };
    if (w.navigator && w.navigator.sendBeacon) {
      var b0 = w.navigator.sendBeacon.bind(w.navigator);
      w.navigator.sendBeacon = function (u, d) { return b0(rw(u), d); };
    }
    if (w.Worker) {
      var W0 = w.Worker;
      w.Worker = function (u, o) { return new W0(rw(u), o); };
      w.Worker.prototype = W0.prototype;
    }
    // 4) gli stili in linea con url(https://maps.gstatic.com/...) (cursori): proprieta' e setProperty/cssText
    //    (Chrome recente: le proprieta' CSS stanno su CSSStyleProperties.prototype, cssText su CSSStyleDeclaration:
    //     si cerca il prototipo giusto risalendo la catena di uno style vero)
    var CS = w.CSSStyleDeclaration.prototype;
    var st = w.document.createElement('div').style;
    ['cursor', 'backgroundImage', 'background', 'cssText'].forEach(function (p) {
      for (var o = Object.getPrototypeOf(st); o; o = Object.getPrototypeOf(o)) {
        if (Object.getOwnPropertyDescriptor(o, p)) { avvolgi(o, p, rwCss); break; }
      }
    });
    var sp0 = CS.setProperty;
    CS.setProperty = function (n, v, pr) { return sp0.call(this, n, rwCss(v), pr); };
    // 5) rete di sicurezza: ogni attributo style che cambia (Maps mette i cursori anche per altre vie) si riscrive prima
    //    del ricalcolo degli stili (l'observer gira in microtask, il cursore si carica solo al disegno)
    var RE_H = /url\((['"]?)(?:https?:)?\/\/(maps\.googleapis\.com|maps\.gstatic\.com|streetviewpixels-pa\.googleapis\.com|lh[3-6]\.googleusercontent\.com)\//;
    new w.MutationObserver(function (rec) {
      for (var i = 0; i < rec.length; i++) {
        var el = rec[i].target, v = el.getAttribute && el.getAttribute('style');
        if (v && RE_H.test(v)) sA.call(el, 'style', rwCss(v));
      }
    }).observe(w.document, {subtree: true, attributes: true, attributeFilter: ['style']});
  }

  if (typeof window.GXDC_EXTRA !== 'function') {
    // fuori dallo strato Discord (solo la pagina di prova del banco, geo/sonda): la stessa rete a mano
    window.GXDC_GEO_RETE = function (w) { installa(w || window); return CONTI; };
    return;
  }
  GXDC_EXTRA('geo', {
    pagina: null,            // geo.html e' gia' nella lista FIGLIE di shell.js
    testi: [
      [/\bGEO\s*BET\b/g, 'GEO'], [/\bGeo\s*Bet\b/g, 'Geo'], [/\bgeo\s*bet\b/gi, 'Geo'],
      [/\bchi vince prende tutto\b/gi, 'vince chi fa più punti'], [/\bwinner takes all\b/gi, 'most points wins'],
      [/\bposta\b/gi, 'partita'], [/\bstake\b/gi, 'game'], [/\bpot\b/gi, 'game']
    ],
    prima: function (D) {
      if (!window.GXDC_FIGLIA) return;           // nell'index niente: la rete serve solo nella pagina del gioco
      document.documentElement.classList.add('gxdc');
      installa(window);
    },
    dopo: function (D) {
      if (window.GXDC_FIGLIA) return;
      // la scheda di fine di geo.html ha ESCI e RIGIOCA (messaggi {geo:'esci'|'rigioca'} al guscio GEORT dell'index).
      // Nella mini app ESCI torna alla scelta con rtdAgain() (che dentro Discord vuol dire «ancora»: si riapriva un
      // allenamento) e RIGIOCA rifa' l'allenamento con practiceStart (rotta Telegram). Qui: ESCI = catalogo,
      // RIGIOCA = il catalogo riapre la stessa sala / coda / allenamento (come «Rivincita» negli altri giochi).
      function via(cosa) {               // (il catalogo toglie l'iframe: niente da chiudere qui)
        clearTimeout(D.tAncora);
        if (!D.chiuso) { D.chiuso = true; D.alCatalogo(cosa); }
      }
      window.geortFineEsci = function () { via('fine'); };
      window.geortRigioca = function () { via('ancora'); };
    }
  });
})();

/* ── lotto 8 · rps.js ── */
/* DISCORD lotto 8 — Morra (sasso carta forbice) dentro Discord, gratis. Stesso schema dei duelli HTTP del lotto 7:
   il catalogo prende il biglietto Discord gratis (sala del canale, coda, allenamento con Pixel), questa pagina lo
   riscatta su /discord/duel/apri e apre il tavolo della mini app (#pvp-modal dentro #duel). Le chiamate della mini app
   a /duel/rps_* vanno su /discord/duel/rps_* con la sessione Discord (mai user_id, mai poste). Uscita, rivincita e
   «Torna ai giochi» passano dal catalogo. */
GXDC_EXTRA('rps', (function () {
  'use strict';
  var K = 'rps', STORE = 'DLRPS', ENTRA = 'dlRpsEnter', START = 'dlRpsStart';
  var VERBI = /\/duel\/(rps_state|rps_pick|rps_cancel|rps_join|abbandona|match_vs|practice_start)(?:\?|$)/;
  var D0 = null, f0 = null, finito = false, vivo = false, ultimo = null, pratica = false;

  function api() { try { return (parent.GX_CONFIG && parent.GX_CONFIG.apiBase) || '/api'; } catch (e) { return '/api'; } }
  function intest() { return {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (D0 && D0.sessione || '')}; }
  function alCat(cosa) {
    if (finito) return;
    finito = true;
    try { var st = window[STORE]; if (st && st.poll) { clearInterval(st.poll); st.poll = null; } } catch (e) {}
    D0.alCatalogo(cosa);
  }

  // i testi del tavolo: niente piatto, percentuali, euro
  function ripulisci(h) {
    if (typeof h !== 'string') return h;
    h = h.replace(/(<div class="dlbj-pot">)([\s\S]*?)(<\/div>)/g, function (m, a, t, c) {
      if (!/POT|€|winner/i.test(t)) return m;
      return a + (pratica ? '🤖 Allenamento con Pixel · al meglio di 3' : 'Amichevole · al meglio di 3') + c;
    });
    h = h.replace(/<div style="text-align:center;font-weight:800;[^"]*">\s*(?:[+−-]\s*€\s*[\d.,]+|€[\d.,]+ returned)\s*<\/div>/g, '');
    h = h.replace(/\s*·\s*GRATIS\b/g, '');
    h = h.replace(/>CLOSE<\/button>/g, '>TORNA AI GIOCHI</button>');
    h = h.replace(/💀 YOU LOSE/g, '😅 YOU LOSE');
    return h;
  }

  function testata() {
    try {
      var el = document.querySelector('#pvp-modal .xz-hd-s');
      if (!el) return;
      var v = ultimo || {};
      var t = pratica ? 'Allenamento con Pixel' : 'Amichevole · ' + (v.opp_name ? 'contro ' + v.opp_name : 'nel canale');
      if (el.textContent !== t) el.textContent = t;
    } catch (e) {}
  }

  function ritocca() {
    var g0 = window.go;
    window.go = function (id) { if (id === 'duel') return g0.apply(this, arguments); alCat('fine'); };
    var c0 = window.dlCloseOverlay;
    window.dlCloseOverlay = function () { try { c0.apply(this, arguments); } catch (e) {} alCat('fine'); };
    var m0 = window.dlModalHTML;
    window.dlModalHTML = function (h) { var r = m0.call(this, ripulisci(h)); testata(); return r; };
    window[START] = function () { alCat('ancora'); };
    window.practiceStart = function () { alCat('ancora'); };
    var e0 = window.gbEsciConferma;
    if (typeof e0 === 'function') {
      window.gbEsciConferma = function (o, ok) {
        o = o || {};
        if (pratica) { o.tipo = 'allenamento'; }
        else { o.tit = '🏳️ ESCI DALLA PARTITA?'; o.txt = 'Se esci adesso, la partita la vince l’avversario.'; o.si = 'ESCI'; o.col = '#38bdf8'; }
        return e0.call(this, o, ok);
      };
    }
    addEventListener('pagehide', function () {
      if (!vivo) return;
      try {
        if (ultimo && (ultimo.status === 'done' || ultimo.state === 'done')) return;
        f0(api() + '/discord/duel/abbandona', {method: 'POST', keepalive: true, headers: intest(), body: JSON.stringify({gioco: K})});
      } catch (e) {}
    });
  }

  function entra() {
    if (typeof window.go !== 'function' || typeof window.S === 'undefined' || typeof window[ENTRA] !== 'function' ||
        typeof window.dlModalHTML !== 'function' || !window[STORE]) { setTimeout(entra, 80); return; }
    document.documentElement.classList.add('gxdc', 'gx-duello-http');
    try { if (!S.userId) S.userId = String(D0.io.id); S.name = D0.io.nome || S.name; } catch (e) {}
    if (!D0.ticket) { alCat('errore'); return; }
    f0(api() + '/discord/duel/apri', {method: 'POST', headers: intest(), body: JSON.stringify({ticket: D0.ticket})})
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok || !j.vista) { console.warn('[discord] morra non aperta', j); alCat('errore'); return; }
        ultimo = j.vista; pratica = !!j.vista.pratica;
        ritocca();
        window.go('duel');
        var st = window[STORE];
        st.bet = 0; st.shown = false; st.vsShown = true; st.sig = '';
        vivo = true;
        setInterval(testata, 700);
        window[ENTRA](j.vista);
        try { window.focus(); } catch (e) {}
      }, function (e) { console.warn('[discord] morra: rete', e); alCat('errore'); });
  }

  return {
    pagina: null,
    testi: [[/winner takes \d+%/gi, ''], [/best of 3/gi, 'al meglio di 3']],
    prima: function (D) {
      D0 = D;
      D.partito = true;                    // niente ingresso RT di shell.js: la morra non ha un biglietto del server real-time
      f0 = window.fetch;
      window.fetch = function (input, init) {
        var u = (typeof input === 'string') ? input : (input && input.url) || '';
        var m = u.indexOf('62-238-17-24.sslip.io') >= 0 ? VERBI.exec(u) : null;
        if (m) {
          var b = (init && init.body) || '{}';
          try { var o = JSON.parse(b); delete o.user_id; delete o.username; delete o.photo_url; b = JSON.stringify(o); } catch (e) { b = '{}'; }
          return f0.call(this, api() + '/discord/duel/' + m[1], {method: 'POST', headers: intest(), body: b}).then(function (r) {
            try { r.clone().json().then(function (j) { if (j && (j.status === 'playing' || j.status === 'done')) ultimo = j; }, function () {}); } catch (e) {}
            return r;
          });
        }
        return f0.apply(this, arguments);
      };
      if (document.readyState === 'complete') setTimeout(entra, 0);
      else addEventListener('load', function () { setTimeout(entra, 0); });
    }
  };
})());


/* ── lotto 8 · rr.js ── */
/* DISCORD lotto 8 — Roulette russa dentro Discord, gratis e SENZA ARMI VERE: una pistola AD ACQUA giocattolo
   (giochi/app/rr_acqua.svg), lo SPLASH al posto dello sparo, «fradicio» al posto di «morto». Le regole sono quelle del
   motore (russian_roulette.py): serbatoio con colpi pieni e vuoti, spruzzi l'avversario o te stesso (a vuoto tieni il
   turno), due cuori a testa. Stesso schema dei duelli HTTP del lotto 7: biglietto Discord gratis riscattato su
   /discord/duel/apri, poi /discord/duel/rr_* con la sessione Discord (mai user_id, mai poste). */
GXDC_EXTRA('rr', (function () {
  'use strict';
  var K = 'rr', STORE = 'DLRR', ENTRA = 'dlRrEnter', START = 'dlRrStart';
  var VERBI = /\/duel\/(rr_state|rr_action|rr_cancel|rr_join|rr_tour_enter|abbandona|match_vs|practice_start)(?:\?|$)/;
  var D0 = null, f0 = null, finito = false, vivo = false, ultimo = null, pratica = false;

  function api() { try { return (parent.GX_CONFIG && parent.GX_CONFIG.apiBase) || '/api'; } catch (e) { return '/api'; } }
  function intest() { return {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (D0 && D0.sessione || '')}; }
  function alCat(cosa) {
    if (finito) return;
    finito = true;
    try { var st = window[STORE]; if (st && st.poll) { clearInterval(st.poll); st.poll = null; } } catch (e) {}
    D0.alCatalogo(cosa);
  }

  function ripulisci(h) {
    if (typeof h !== 'string') return h;
    h = h.replace(/(<div class="dlrr2-pot">)([\s\S]*?)(<\/div>)/g, function (m, a, t, c) {
      return a + (pratica ? '🤖 ALLENAMENTO CON <b>PIXEL</b>' : '💦 AMICHEVOLE') + c;
    });
    h = h.replace(/<div style="text-align:center;font-weight:800;[^"]*">\s*(?:[+−-]\s*€\s*[\d.,]+|€[\d.,]+ returned)\s*<\/div>/g, '');
    h = h.replace(/\s*·\s*GRATIS\b/g, '');
    h = h.replace(/>CLOSE<\/button>/g, '>TORNA AI GIOCHI</button>');
    h = h.replace(/dlCloseOverlay\(\);practiceStart\(/g, 'practiceStart(');
    h = h.replace(/💀/g, '💦');
    h = h.replace(/🏆 YOU SURVIVE/g, '🏆 RESTI ASCIUTTO').replace(/💦 YOU'RE OUT|💀 YOU'RE OUT/g, '💦 SEI FRADICIO');
    return h;
  }

  function T(re, con) {
    return [re, function (m) { return m === m.toUpperCase() ? con.toUpperCase() : (m.charAt(0) === m.charAt(0).toUpperCase() ? con.charAt(0).toUpperCase() + con.slice(1) : con); }];
  }

  function testata() {
    try {
      var ic = document.querySelector('#pvp-modal .xz-hd-ic img');   // l'icona del gioco nella testata: la nostra (niente revolver)
      var mia = (window.GXDC_RADICE || '/') + 'asset/gbx_pv_rr.webp';
      if (ic && ic.getAttribute('src') !== mia) ic.setAttribute('src', mia);
      var el = document.querySelector('#pvp-modal .xz-hd-s');
      if (!el) return;
      var v = ultimo || {};
      var t = pratica ? 'Allenamento con Pixel' : 'Amichevole · ' + (v.opp_name ? 'contro ' + v.opp_name : 'nel canale');
      if (el.textContent !== t) el.textContent = t;
    } catch (e) {}
  }

  // lo SPLASH al posto dello sparo: un getto d'acqua e le gocce che ricadono (stessa catena audio, rispetta il muto)
  function splash() {
    try {
      var ctx = window.dlRrAudio && window.dlRrAudio(); if (!ctx) return;
      var dest = window.slv2AudioDest ? window.slv2AudioDest() : ctx.destination, t0 = ctx.currentTime;
      window.dlRrNoise(ctx, dest, t0, 0.32, 0.55, 'bandpass', 1800, 700, 1.2);      // il getto
      window.dlRrNoise(ctx, dest, t0 + 0.05, 0.45, 0.35, 'lowpass', 1200, 300, 1.8);  // lo splash
      for (var i = 0; i < 5; i++) window.dlRrTone(ctx, dest, t0 + 0.28 + i * 0.07, 0.06, 0.07, 'sine', 900 + Math.random() * 700, 1800 + Math.random() * 600);   // le gocce
    } catch (e) {}
  }

  function ritocca() {
    var g0 = window.go;
    window.go = function (id) { if (id === 'duel') return g0.apply(this, arguments); alCat('fine'); };
    var c0 = window.dlCloseOverlay;
    window.dlCloseOverlay = function () { try { c0.apply(this, arguments); } catch (e) {} alCat('fine'); };
    var m0 = window.dlModalHTML;
    window.dlModalHTML = function (h) { var r = m0.call(this, ripulisci(h)); testata(); return r; };
    window[START] = function () { alCat('ancora'); };
    window.practiceStart = function () { alCat('ancora'); };
    // la pistola ad acqua al posto del revolver (la bocca e' in cima, al centro dell'ugello)
    var radice = window.GXDC_RADICE || '/';
    window.dlRrGunSVG = function () {
      return '<img class="dlrr2-gun gx-acqua" id="dlrr-gun" src="' + radice + 'giochi/app/rr_acqua.svg" alt="pistola ad acqua" draggable="false">';
    };
    window.DLRR_BOCCA_X = 0.5; window.DLRR_BOCCA_Y = 0.08;
    window.dlRrGunshot = splash;
    window.dlRrHearts = function (n, full) { n = Math.max(0, n | 0); return n > 0 ? ('💙'.repeat(n) + (full > n ? '💧'.repeat(full - n) : '')) : '💦'; };
    var e0 = window.gbEsciConferma;
    if (typeof e0 === 'function') {
      window.gbEsciConferma = function (o, ok) {
        o = o || {};
        if (pratica) { o.tipo = 'allenamento'; }
        else { o.tit = '🏳️ ESCI DALLA PARTITA?'; o.txt = 'Se esci adesso, la partita la vince l’avversario.'; o.si = 'ESCI'; o.col = '#38bdf8'; }
        return e0.call(this, o, ok);
      };
    }
    addEventListener('pagehide', function () {
      if (!vivo) return;
      try {
        if (ultimo && (ultimo.status === 'done' || ultimo.state === 'done')) return;
        f0(api() + '/discord/duel/abbandona', {method: 'POST', keepalive: true, headers: intest(), body: JSON.stringify({gioco: K})});
      } catch (e) {}
    });
  }

  function entra() {
    if (typeof window.go !== 'function' || typeof window.S === 'undefined' || typeof window[ENTRA] !== 'function' ||
        typeof window.dlModalHTML !== 'function' || !window[STORE]) { setTimeout(entra, 80); return; }
    document.documentElement.classList.add('gxdc', 'gx-duello-http');
    try { if (!S.userId) S.userId = String(D0.io.id); S.name = D0.io.nome || S.name; } catch (e) {}
    if (!D0.ticket) { alCat('errore'); return; }
    f0(api() + '/discord/duel/apri', {method: 'POST', headers: intest(), body: JSON.stringify({ticket: D0.ticket})})
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok || !j.vista) { console.warn('[discord] roulette non aperta', j); alCat('errore'); return; }
        ultimo = j.vista; pratica = !!j.vista.pratica;
        ritocca();
        window.go('duel');
        var st = window[STORE];
        st.bet = 0; st.shown = false; st.vsShown = true; st.sig = ''; st.lastSeq = 0; st.aim = 'opp';
        vivo = true;
        setInterval(testata, 700);
        window[ENTRA](j.vista);
        try { window.focus(); } catch (e) {}
      }, function (e) { console.warn('[discord] roulette: rete', e); alCat('errore'); });
  }

  return {
    pagina: null,
    // i testi del tavolo, per la pistola ad acqua (italiano e inglese: il motore della lingua traduce dopo)
    // i testi del tavolo per la pistola ad acqua: maiuscole o minuscole come l'originale (il restyle scrive «Spara all'avversario»)
    testi: [
      T(/spara all['’]avversario/gi, 'spruzza l’avversario'), T(/sp[aà]rati/gi, 'spruzzati'), T(/\bspara\b/gi, 'spruzza'),
      T(/fire at (the )?opponent/gi, 'squirt the opponent'), T(/shoot yourself/gi, 'squirt yourself'),
      T(/a salve tieni il turno/gi, 'a vuoto tieni il turno'), T(/trascina la pistola per mirare/gi, 'trascina la pistola ad acqua per mirare'),
      T(/gira il tamburo/gi, 'mescola il serbatoio'), T(/spin the (cylinder|drum)/gi, 'shake the tank'), T(/ricarica da capo/gi, 'si rimescola'),
      T(/\bin canna\b/gi, 'nel serbatoio'), T(/\bvere\b/gi, 'piene'), T(/\bvive\b/gi, 'piene'), T(/\ba salve\b/gi, 'a vuoto'),
      T(/\bshot\b/gi, 'squirted'), [/💥\s*/g, '💦 '], T(/\bbang\b/gi, 'splash'), T(/self-shot live/gi, 'si è inzuppato'),
      T(/a live round hit/gi, 'centrato in pieno'), T(/click… blank/gi, 'pfff… vuoto'), T(/click… a salve/gi, 'pfff… a vuoto'),
      T(/\blive\b/gi, 'pieno'), T(/\bblank\b/gi, 'vuoto'), T(/colpo vero/gi, 'spruzzo pieno'), T(/\bcolpit[oa]\b/gi, 'inzuppato'),
      T(/chamber reloaded/gi, 'serbatoio riempito'), T(/tamburo ricaricato/gi, 'serbatoio riempito'), T(/\breloaded\b/gi, 'riempito'),
      T(/you survive/gi, 'resti asciutto'), T(/you're out/gi, 'sei fradicio'), T(/\brevolver\b/gi, 'pistola ad acqua'),
      T(/\bproiettil[ei]\b/gi, 'spruzzi'), T(/\bcolp[oi] viv[oi]\b/gi, 'spruzzi pieni'), T(/\bmort[oa]\b/gi, 'fradicio'),
      T(/\bun colpo alla volta\b/gi, 'uno spruzzo alla volta'), T(/\btamburo\b/gi, 'serbatoio')
    ],
    prima: function (D) {
      D0 = D;
      D.partito = true;
      f0 = window.fetch;
      window.fetch = function (input, init) {
        var u = (typeof input === 'string') ? input : (input && input.url) || '';
        var m = u.indexOf('62-238-17-24.sslip.io') >= 0 ? VERBI.exec(u) : null;
        if (m) {
          var b = (init && init.body) || '{}';
          try { var o = JSON.parse(b); delete o.user_id; delete o.username; delete o.photo_url; b = JSON.stringify(o); } catch (e) { b = '{}'; }
          return f0.call(this, api() + '/discord/duel/' + m[1], {method: 'POST', headers: intest(), body: b}).then(function (r) {
            try { r.clone().json().then(function (j) { if (j && (j.status === 'playing' || j.status === 'done')) ultimo = j; }, function () {}); } catch (e) {}
            return r;
          });
        }
        return f0.apply(this, arguments);
      };
      if (document.readyState === 'complete') setTimeout(entra, 0);
      else addEventListener('load', function () { setTimeout(entra, 0); });
    }
  };
})());


/* ── lotto 8 · dice.js ── */
/* DISCORD lotto 8 — Dadi dentro Discord, gratis. Nella mini app e' un tiro secco a soldi: qui e' un DUELLO A ROUND
   (sessioni solo Discord del backend, /discord/duel/dice_*): tirano tutti e due, il dado piu' alto fa un punto, pari =
   si ritira, chi arriva a 3 vince. Il tavolo e' disegnato qui (dadi colorati, niente panno verde ne' fiches), dentro
   il #pvp-modal della mini app come gli altri duelli. Sala del canale, coda e allenamento (Pixel) dal catalogo. */
GXDC_EXTRA('dice', (function () {
  'use strict';
  var VERBI = /\/duel\/(abbandona)(?:\?|$)/;
  var D0 = null, f0 = null, finito = false, vivo = false, ultimo = null, pratica = false;
  var poll = null, tick = null, fermo = 0, inAttesa = null, visto = 0, busy = false, deadline = 0;
  var PIP = {1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]};

  function api() { try { return (parent.GX_CONFIG && parent.GX_CONFIG.apiBase) || '/api'; } catch (e) { return '/api'; } }
  function intest() { return {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (D0 && D0.sessione || '')}; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); }
  function alCat(cosa) {
    if (finito) return;
    finito = true;
    if (poll) { clearInterval(poll); poll = null; }
    if (tick) { clearInterval(tick); tick = null; }
    D0.alCatalogo(cosa);
  }
  function chiedi(verbo, corpo) {
    return f0(api() + '/discord/duel/' + verbo, {method: 'POST', headers: intest(), body: JSON.stringify(corpo || {})})
      .then(function (r) { return r.json(); });
  }
  function suono(k) { try { if (typeof window.dd3Suono === 'function') window.dd3Suono(k, 0.8); } catch (e) {} }

  function dado(n, cls) {
    var p = PIP[n] || [], h = '';
    for (var i = 0; i < 9; i++) h += '<i' + (p.indexOf(i) >= 0 ? ' class="on"' : '') + '></i>';
    return '<div class="gxd-dado ' + (cls || '') + '" data-n="' + (n || 0) + '">' + (n ? h : '<b>?</b>') + '</div>';
  }

  function disegna(v, mostra) {
    // `mostra` = il round appena chiuso da far vedere (i due dadi che rotolano e si fermano)
    var gioca = v.status !== 'done';
    var opp = esc(v.opp_name || 'Avversario');
    var h = '<div class="pvp-m-title gxd-tit">🎲 DADI</div>' +
      '<div class="dlbj-pot">' + (pratica ? '🤖 Allenamento con Pixel' : 'Amichevole') + ' · chi arriva a ' + (v.meta || 3) + ' vince</div>' +
      '<div class="dlrps-score"><span class="dlrps-sc you">TU ' + (v.you_score | 0) + '</span><span class="dlrps-vs">—</span>' +
      '<span class="dlrps-sc opp">' + (v.opp_score | 0) + ' ' + opp + '</span></div>';
    var dy, dop, esito = '';
    if (mostra) {
      dy = dado(mostra.you, 'rolla tu'); dop = dado(mostra.opp, 'rolla lui');
      esito = mostra.result === 'win' ? '<span class="vinto">ROUND TUO</span>' : (mostra.result === 'tie' ? '<span class="pari">PARI · si ritira</span>' : '<span class="perso">ROUND A ' + opp + '</span>');
    } else if (gioca) {
      dy = v.you_rolled ? dado(v.your_roll, 'tu fermo') : dado(0, 'tu vuoto');
      dop = dado(0, 'lui ' + (v.opp_rolled ? 'pronto' : 'vuoto'));
      esito = 'ROUND ' + (v.round | 0);
    } else {
      var L = v.last || {};
      dy = dado(L.you || 0, 'tu fermo'); dop = dado(L.opp || 0, 'lui fermo');
    }
    h += '<div class="gxd-tavolo"><div class="gxd-lato"><div class="gxd-nm">TU</div>' + dy + '</div><div class="gxd-vs">VS</div>' +
      '<div class="gxd-lato"><div class="gxd-nm">' + opp + '</div>' + dop + (gioca && !mostra && v.opp_rolled ? '<div class="gxd-ok">✓ ha tirato</div>' : '') + '</div></div>' +
      '<div class="gxd-esito">' + esito + '</div>';
    if (gioca && !mostra) {
      if (!v.you_rolled) h += '<button class="pvp-m-btn gold gxd-tira" id="gxd-tira">🎲 TIRA IL DADO <span class="dlbj-timer" id="gxd-timer"></span></button>';
      else h += '<div class="dlrps-waiting">Hai tirato · ' + (v.opp_rolled ? 'si scopre…' : 'aspetti ' + opp + '…') + '</div>';
      h += window.dlEsciBtn ? window.dlEsciBtn('dice', v) : '';
    } else if (!gioca && !mostra) {
      var win = !!v.you_win;
      var tit = v.abbandono ? '🏳️ SEI USCITO' : (win ? (v.opp_abbandono ? '🏳️ Hai vinto: l’avversario è uscito' : '🏆 HAI VINTO') : '😅 HAI PERSO');
      h += '<div class="pvp-result ' + (win ? 'win' : 'lose') + '" style="color:' + (win ? '#39ff14' : '#ff8a98') + ';">' + tit + '</div>' +
        '<button class="pvp-m-btn gold" id="gxd-ancora">🔁 ' + (pratica ? 'ANCORA' : 'RIVINCITA') + '</button>' +
        '<button class="pvp-m-btn" id="gxd-fine">TORNA AI GIOCHI</button>';
    }
    window.dlModalHTML(h);
    var b = document.getElementById('gxd-tira'); if (b) b.onclick = tira;
    var a = document.getElementById('gxd-ancora'); if (a) a.onclick = function () { alCat('ancora'); };
    var f = document.getElementById('gxd-fine'); if (f) f.onclick = function () { alCat('fine'); };
    deadline = v.deadline_ms || 0;
    try { var t = document.querySelector('#pvp-modal .xz-hd-s'); if (t) t.textContent = pratica ? 'Allenamento con Pixel' : 'Amichevole · contro ' + (v.opp_name || ''); } catch (e) {}
  }

  function firma(v) { return [v.status, v.round, v.you_rolled, v.opp_rolled, v.you_score, v.opp_score, v.last && v.last.round].join('|'); }

  function arriva(v) {
    if (!v || v.status === 'none' || v.error) return;
    ultimo = v;
    if (busy) { inAttesa = v; return; }
    var L = v.last;
    if (L && L.round > visto) {
      visto = L.round;
      busy = true;
      suono('versa');
      disegna(v, L);
      setTimeout(function () { suono('panno'); }, 520);
      setTimeout(function () {
        busy = false;
        var x = inAttesa || ultimo; inAttesa = null;
        disegna(x, null); fermo = firma(x);
        if (x.status === 'done') fine(x);
      }, 1700);
      return;
    }
    var f = firma(v);
    if (f === fermo) return;
    fermo = f;
    disegna(v, null);
    if (v.status === 'done') fine(v);
  }

  function fine(v) {
    if (poll) { clearInterval(poll); poll = null; }
    vivo = false;
    try { if (typeof window.gSound === 'function') window.gSound(v.you_win ? 'win-big' : 'lose'); } catch (e) {}
  }

  function tira() {
    var b = document.getElementById('gxd-tira'); if (b) { b.disabled = true; b.style.opacity = '.5'; }
    suono('bussolotto');
    chiedi('dice_roll').then(arriva, function () { if (b) { b.disabled = false; b.style.opacity = ''; } });
  }

  function ritocca() {
    var g0 = window.go;
    window.go = function (id) { if (id === 'duel') return g0.apply(this, arguments); alCat('fine'); };
    var c0 = window.dlCloseOverlay;
    window.dlCloseOverlay = function () { try { c0.apply(this, arguments); } catch (e) {} alCat('fine'); };
    var e0 = window.gbEsciConferma;
    if (typeof e0 === 'function') {
      window.gbEsciConferma = function (o, ok) {
        o = o || {};
        if (pratica) { o.tipo = 'allenamento'; }
        else { o.tit = '🏳️ ESCI DALLA PARTITA?'; o.txt = 'Se esci adesso, la partita la vince l’avversario.'; o.si = 'ESCI'; o.col = '#38bdf8'; }
        return e0.call(this, o, ok);
      };
    }
    try { if (window.DLESCI_FINE) window.DLESCI_FINE.dice = function () { alCat('fine'); }; } catch (e) {}
    addEventListener('keydown', function (e) {
      if ((e.key === ' ' || e.key === 'Enter') && document.getElementById('gxd-tira') && !document.getElementById('gb-esci-ov')) { e.preventDefault(); tira(); }
    });
    addEventListener('pagehide', function () {
      if (!vivo) return;
      try { f0(api() + '/discord/duel/abbandona', {method: 'POST', keepalive: true, headers: intest(), body: JSON.stringify({gioco: 'dice'})}); } catch (e) {}
    });
  }

  function entra() {
    if (typeof window.go !== 'function' || typeof window.S === 'undefined' || typeof window.dlModalHTML !== 'function') { setTimeout(entra, 80); return; }
    document.documentElement.classList.add('gxdc', 'gx-duello-http');
    try { if (!S.userId) S.userId = String(D0.io.id); S.name = D0.io.nome || S.name; } catch (e) {}
    if (!D0.ticket) { alCat('errore'); return; }
    chiedi('apri', {ticket: D0.ticket}).then(function (j) {
      if (!j || !j.ok || !j.vista) { console.warn('[discord] dadi non aperti', j); alCat('errore'); return; }
      pratica = !!j.vista.pratica;
      ritocca();
      window.go('duel');
      vivo = true;
      visto = (j.vista.last && j.vista.last.round) || 0;
      arriva(j.vista);
      poll = setInterval(function () { if (!busy) chiedi('dice_state').then(arriva, function () {}); }, 900);
      tick = setInterval(function () {
        var el = document.getElementById('gxd-timer'); if (!el || !deadline) return;
        var r = Math.max(0, Math.ceil((deadline - Date.now()) / 1000)); el.textContent = r + 's'; el.style.color = r <= 5 ? '#ff5b5b' : '';
      }, 300);
      try { window.focus(); } catch (e) {}
    }, function (e) { console.warn('[discord] dadi: rete', e); alCat('errore'); });
  }

  return {
    pagina: null,
    testi: [],
    prima: function (D) {
      D0 = D;
      D.partito = true;                    // niente ingresso RT: i dadi sono un duello del backend
      f0 = window.fetch;
      window.fetch = function (input, init) {
        var u = (typeof input === 'string') ? input : (input && input.url) || '';
        var m = u.indexOf('62-238-17-24.sslip.io') >= 0 ? VERBI.exec(u) : null;
        if (m) {                           // ESCI della mini app (dlEsciDuello): sulla rotta Discord, gioco «dice»
          return f0.call(this, api() + '/discord/duel/abbandona', {method: 'POST', headers: intest(), body: JSON.stringify({gioco: 'dice'})});
        }
        return f0.apply(this, arguments);
      };
      if (document.readyState === 'complete') setTimeout(entra, 0);
      else addEventListener('load', function () { setTimeout(entra, 0); });
    }
  };
})());


/* ── lotto 8 · pk5.js ── */
/* DISCORD lotto 8 — Poker a 5 dentro Discord, gratis (punti, mai soldi). Il tavolo e' quello della mini app (guscio PK5RT
   dell'index + iframe poker5.html, girato su figlia.html dallo strato). Si entra SENZA la lista dei tavoli a soldi:
   la pagina riscatta il biglietto del catalogo su /discord/pk5/apri, il backend da' un gettone firmato e il RT fa
   sedere al tavolo del canale («dc<...>») o a un allenamento coi bot. Ti alzi (ESCI) = torni ai giochi.
   (Serve il RT del lotto 8: i verbi pk5_* per gli uid dc: e la verifica del gettone.) */
(function () {
  'use strict';
  // le parole del tavolo: PUNTI al posto di fiche, MONTE al posto di piatto (come il Poker 1v1 del lotto 6)
  var REGOLE = [
    [/^\s*partita\s*$/i, 'MONTE'], [/^MEZZO partita$/i, 'MEZZO MONTE'], [/^partita \(MAX\)$/i, 'MONTE (MAX)'],
    [/^partita DIVISO$/i, 'MONTE DIVISO'], [/^partita LATERALE$/i, 'MONTE LATERALE'], [/\bpartita (diviso|laterale)\b/gi, 'monte $1'],
    [/Ti stai alzando: le tue (gettone|fiche) tornano sul saldo/gi, 'Ti stai alzando'],
    [/SENZA (GETTONE|FICHE)/g, 'SENZA PUNTI'], [/Senza (gettone|fiche): ricarica entro 60 s o ti alzi/gi, 'Senza punti: ricarica entro 60 s o ti alzi'],
    [/GRATIS · (gettone|fiche) finte/gi, 'AMICHEVOLE · punti'], [/\b(gettone|fiche) finte\b/gi, 'punti'],
    [/\bgettone\b/g, 'punti'], [/\bfiches?\b/g, 'punti'], [/\bFICHES?\b/g, 'PUNTI'], [/\bsaldo\b/g, 'conto'],
    [/^partita (\d)/i, 'MONTE $1'], [/\bpartita (\d)/g, 'monte $1'], [/\bposta di (\d+) da tutti/gi, 'tutti mettono $1 nel monte'],
    [/\bposta\b/gi, 'apertura'], [/^PUNTA$/, 'APRI'], [/^PUNTA (\d)/, 'APRE $1'], [/^PUNTA A\b/, 'APRI A'],
    // il diario del server scrive le cifre come euro («rilancia a 0,40»): qui sono punti interi
    [/(\d+),(\d\d)(?!\d)/g, function (m, a, b) { return String(parseInt(a, 10) * 100 + parseInt(b, 10)); }]
  ];
  // il tavolo 3D senza l'aria da casino': feltro blu notte invece del verde, e i segnapunti senza le tacche delle fiche
  // (la tavolozza D5.PAL la scrive 00_nucleo.js: la si ritocca nel momento in cui viene assegnata, prima che 10_tavolo e
  // 20_fiche la usino). I gruzzoli si scrivono in punti interi (D5.euro). Gira solo dentro poker5.html in Discord.
  function tavolozza(P) {
    try {
      P.feltroA = '#141a3d'; P.feltroB = '#27347a'; P.filo = '#9fb4ff'; P.riga = '#c7d2fe'; P.gnd = [0.05, 0.06, 0.11];
      var col = [['#e9eef2', '#c3ced6'], ['#38bdf8', '#0369a1'], ['#facc15', '#a16207'], ['#a78bfa', '#5b21b6'], ['#f472b6', '#9d174d']];
      for (var i = 0; i < (P.fiche || []).length && i < col.length; i++) {
        P.fiche[i].base = col[i][0]; P.fiche[i].anello = col[i][1]; P.fiche[i].tacca = col[i][1];
      }
    } catch (e) {}
    return P;
  }
  function trappola() {
    var d5;
    try {
      Object.defineProperty(window, 'D5', {configurable: true, enumerable: true, get: function () { return d5; }, set: function (v) {
        d5 = v;
        // ogni modulo fa «window.D5 = window.D5 || {}»: lo stesso oggetto torna qui piu' volte, la trappola si mette UNA volta
        if (!v || typeof v !== 'object' || v.__gxPal) return;
        try { Object.defineProperty(v, '__gxPal', {value: 1}); } catch (e) { return; }
        var pal;
        Object.defineProperty(v, 'PAL', {configurable: true, enumerable: true, get: function () { return pal; }, set: function (p) { pal = tavolozza(p); }});
        Object.defineProperty(v, 'euro', {configurable: true, enumerable: true, get: function () { return punti; }, set: function () {}});
      }});
    } catch (e) {}
  }
  function rinomina(doc, regole) {
    function nodo(n) {
      if (n.nodeType === 3) {
        var t = n.nodeValue, x = t;
        if (!t || t.length > 4000) return;
        for (var i = 0; i < regole.length; i++) x = x.replace(regole[i][0], regole[i][1]);
        if (x !== t) n.nodeValue = x;
        return;
      }
      if (n.nodeType !== 1 || n.tagName === 'SCRIPT' || n.tagName === 'STYLE') return;
      for (var c = n.firstChild; c; c = c.nextSibling) nodo(c);
    }
    new MutationObserver(function (rec) {
      for (var i = 0; i < rec.length; i++) {
        if (rec[i].type === 'characterData') nodo(rec[i].target);
        else for (var j = 0; j < rec[i].addedNodes.length; j++) nodo(rec[i].addedNodes[j]);
      }
    }).observe(doc.documentElement, {childList: true, subtree: true, characterData: true});
    doc.addEventListener('DOMContentLoaded', function () { if (doc.body) nodo(doc.body); });
  }
  function punti(c) { return String(Math.round(Number(c) || 0)); }

  var D0 = null, finito = false, firma = '', pratica = false, inviato = 0, guardia = null;
  function api() { try { return (parent.GX_CONFIG && parent.GX_CONFIG.apiBase) || '/api'; } catch (e) { return '/api'; } }
  function alCat(cosa) {
    if (finito) return;
    finito = true;
    if (guardia) { clearInterval(guardia); guardia = null; }
    D0.alCatalogo(cosa);
  }
  function seduto() { return typeof PK5 !== 'undefined' && PK5.modo === 'seduto'; }
  function manda() {
    if (!firma || seduto() || finito) return;
    if (typeof RTD === 'undefined' || !RTD.wsOk || !RTD.ws || RTD.ws.readyState !== 1) return;
    if (Date.now() - inviato < 6000) return;
    inviato = Date.now();
    PK5.attesaSiedi = Date.now();
    rtdSend(pratica ? {t: 'pk5_siedi', tipo: 'pratica', bot: 3, livello: 'medio', firma: firma}
                    : {t: 'pk5_siedi', tipo: 'dc', firma: firma});
  }

  function ritocca() {
    window.pk5E = punti;
    window.pk5Apri = function () {};                       // niente lista dei tavoli (quelli a soldi)
    window.pk5Esito = function () { alCat('fine'); };      // ti sei alzato (o il tavolo ha chiuso): si torna ai giochi
    var n0 = window.pk5Nascondi;
    window.pk5Nascondi = function (sp) { PK5.lista = false; try { n0.call(this, sp); } catch (e) {} if (!seduto()) alCat('fine'); };
    window.pk5Chiudi = function () { if (seduto()) { window.pk5Mostra(); return; } alCat('fine'); };
    var r0 = window.pk5Ricevi;
    window.pk5Ricevi = function (m) {
      try {
        if (m && m.t === 'err' && m.msg === 'discord_pieno') { alCat('errore'); return true; }
        if (m && m.t === 'pk5_err' && !seduto() && /^(tavolo|pieno|altrove|gia_seduto)$/.test(String(m.code || ''))) {
          console.warn('[discord] poker a 5: non seduto', m);
          setTimeout(function () { alCat('errore'); }, 1500);
        }
      } catch (e) {}
      var r = r0.apply(this, arguments);
      if (m && m.t === 'pk5_seduto') { try { PK5.lista = false; } catch (e) {} }
      return r;
    };
    var e0 = window.gbEsciConferma;
    if (typeof e0 === 'function') {
      window.gbEsciConferma = function (o, ok) {
        o = o || {};
        o.tit = '🏳️ TI ALZI DAL TAVOLO?';
        o.txt = pratica ? 'È un allenamento coi bot: non perdi niente.' : 'Torni ai giochi. Al tavolo continuano gli altri.';
        o.si = 'MI ALZO'; o.col = '#38bdf8';
        return e0.call(this, o, ok);
      };
    }
    // chi chiude il gioco senza «Esci» si alza subito (il posto non resta occupato per due minuti)
    addEventListener('pagehide', function () {
      try { if (seduto() && RTD.ws && RTD.ws.readyState === 1) RTD.ws.send(JSON.stringify({t: 'pk5_alzati'})); } catch (e) {}
    });
  }

  GXDC_EXTRA('pk5', {
    pagina: null,                                          // poker5.html e' gia' fra le FIGLIE dello strato
    schermo: 'pk5',
    testi: [[/\bFiches\b/g, 'Punti'], [/\bfiches\b/g, 'punti']],
    prima: function (D) {
      D0 = D;
      if (window.GXDC_FIGLIA) {
        document.documentElement.classList.add('gxdc');
        var reg = REGOLE.slice();
        try { if (!(parent.GXDC && parent.GXDC.pratica)) reg.push([/ALLENAMENTO · bot/g, 'AMICHEVOLE']); } catch (e) {}
        rinomina(document, reg);
        trappola();
        // dentro Discord il tavolo e' quello in 2D della pagina (piano2d): carte e MONTE, NESSUNA pila di fiche.
        // Il 3D (fiche impilate sul feltro) la pagina lo sceglie solo se c'e' WebGL: qui WebGL non c'e'.
        try {
          var gc0 = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (t) { if (/webgl/i.test(String(t))) return null; return gc0.apply(this, arguments); };
        } catch (e) {}
      }
    },
    figlia: function (w) {
      // dentro poker5.html: i gruzzoli in PUNTI interi (D5.euro scriveva «10,00»)
      try { if (w.D5) w.D5.euro = punti; } catch (e) {}
    },
    entra: function (D) {
      if (typeof window.pk5Ricevi !== 'function' || typeof window.pk5Monta !== 'function' || typeof window.rtdSend !== 'function'
          || typeof PK5 === 'undefined') return false;
      D0 = D;
      ritocca();
      try { window.pk5Css(); } catch (e) {}
      PK5.lista = false; PK5.attesaSiedi = Date.now();
      try { window.pk5Rete(); } catch (e) {}
      fetch(api() + '/discord/pk5/apri', {method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (D.sessione || '')},
                                          body: JSON.stringify({ticket: D.ticket})})
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j || !j.ok || !j.firma) { console.warn('[discord] poker a 5: biglietto', j); alCat('errore'); return; }
          firma = j.firma; pratica = !!j.pratica;
          guardia = setInterval(function () {
            if (seduto()) return;
            if (!RTD.ws || RTD.ws.readyState > 1) { try { window.pk5Rete(); } catch (e) {} }
            PK5.attesaSiedi = PK5.attesaSiedi || Date.now();
            manda();
          }, 400);
        }, function (e) { console.warn('[discord] poker a 5: rete', e); alCat('errore'); });
      return true;
    }
  });
})();

/* ── pc_fix (17/11) · PC e finestrelle di Discord ── */
/* LE PAGINE A PARTE (Lupus, Last Call, Kaiju, Dead Quiz, Geo, carte, Dead Peak, tavolo 3D) nella finestrella di Discord
   (PIP ~400x225, finestra agganciata ~960x540): sono pagine pensate per un minimo di spazio e sotto quel minimo si
   tagliano (html min-height 480, colonne che scorrono, testi giganti). Qui l'iframe della pagina NON si stringe sotto il
   minimo: si disegna alla misura minima e si RIMPICCIOLISCE intero con una trasformazione (i clic restano giusti, il
   gioco non sa niente). Si rifa' a ogni cambio di misura, anche a partita in corso. Telefono in verticale: niente. */
(function () {
  if (window.GXDC_FIGLIA || !window.GXDC) return;
  // minimo per pagina: [larghezza, altezza] sotto cui si rimpicciolisce. Le pagine «da telefono» in colonna ne vogliono
  // 480 d'altezza; quelle larghe (tavolo di Last Call, Dead Quiz, Lupus/Kaiju su PC) il 1280x720 su cui sono provate.
  var MIN = {lastcall: [1280, 720], deadmoney: [1280, 720], lupus3d: [1100, 620], kaiju: [1000, 600], geo: [960, 540],
             deadpeak: [960, 540], tavolo3d: [960, 540], poker5: [1280, 720], poker: [1280, 720], blackjack: [1280, 720]};
  var BASE = [420, 480];
  // pagine che su uno schermo grande restano un riquadro fisso con testi piccoli: si INGRANDISCONO fino a questo fattore
  // (DOM e testo restano nitidi: e' una scala vettoriale)
  var SU = {deadmoney: 1.6, poker5: 1.5, poker: 1.3, blackjack: 1.3};
  function minimo(src) {
    var p = String(src || '').split('?')[0].replace(/^.*\//, '').replace(/\.html$/, '');
    return MIN[p] || BASE;
  }
  function sistema() {
    var l = document.querySelectorAll('iframe');
    for (var i = 0; i < l.length; i++) {
      var f = l[i];
      if (f.__gxsrc == null) continue;              // solo le pagine a parte girate su figlia.html
      var p = f.parentElement;
      if (!p) continue;
      var r = p.getBoundingClientRect(), W = r.width, H = r.height;
      if (W < 2 || H < 2) continue;
      var m = minimo(f.__gxsrc);
      // in verticale (telefono) la pagina e' gia' a casa sua: si guarda solo il minimo di base (320 x 480)
      if (W < H) m = [320, BASE[1]];
      var pag = String(f.__gxsrc).split('?')[0].replace(/^.*\//, '').replace(/\.html$/, '');
      var z = Math.min(W >= H ? (SU[pag] || 1) : 1, W / m[0], H / m[1]);
      var k = Math.abs(z - 1) > 0.005 ? z : 1;
      if (f.__gxz === k && f.__gxw === W && f.__gxh === H) continue;
      f.__gxz = k; f.__gxw = W; f.__gxh = H;
      var s = f.style;
      var PROP = ['width', 'height', 'transform', 'transform-origin', 'max-width', 'max-height', 'min-width', 'min-height'];
      if (k === 1) {
        // si rimette lo stile in linea che la pagina aveva prima (solo se l'avevamo cambiato noi)
        if (f.__gxprima) PROP.forEach(function (x) { var v = f.__gxprima[x]; if (v[0]) s.setProperty(x, v[0], v[1]); else s.removeProperty(x); });
        f.__gxprima = null;
      } else {
        if (!f.__gxprima) { f.__gxprima = {}; PROP.forEach(function (x) { f.__gxprima[x] = [s.getPropertyValue(x), s.getPropertyPriority(x)]; }); }
        s.setProperty('min-width', '0', 'important'); s.setProperty('min-height', '0', 'important');
        s.setProperty('max-width', 'none', 'important'); s.setProperty('max-height', 'none', 'important');
        s.setProperty('width', (W / k) + 'px', 'important');
        s.setProperty('height', (H / k) + 'px', 'important');
        s.setProperty('transform', 'scale(' + k + ')', 'important');
        s.setProperty('transform-origin', '0 0', 'important');
      }
    }
  }
  var t = 0;
  function presto() { clearTimeout(t); t = setTimeout(sistema, 30); }
  addEventListener('resize', presto);
  setInterval(sistema, 700);                         // iframe nati dopo, wrap che cambiano misura senza resize
  window.GXDC_SCALA_FIGLIE = sistema;
})();

/* I NOMI DEI BOT con parole da casino' (Lupus: «Fiche», «DrSlot», «Ghinea») arrivano dal server real-time: dentro Discord
   si rinominano nei messaggi, come fa gia' shell.js con «Duke» -> «Pixel». Gira nell'index e nelle pagine a parte. */
(function () {
  if (!window.GXDC) return;
  var NOMI = [['"Fiche"', '"Fico"'], ['"DrSlot"', '"DrSpot"'], ['"Ghinea"', '"Gina"']];
  function rinomina(ev) {
    var d = ev && ev.data;
    if (typeof d !== 'string' || (d.indexOf('"Fiche"') < 0 && d.indexOf('"DrSlot"') < 0 && d.indexOf('"Ghinea"') < 0)) return ev;
    for (var i = 0; i < NOMI.length; i++) d = d.split(NOMI[i][0]).join(NOMI[i][1]);
    return new MessageEvent('message', {data: d, origin: ev.origin});
  }
  var dm = Object.getOwnPropertyDescriptor(WebSocket.prototype, 'onmessage');
  if (!dm || !dm.set || dm.set._gxNomi) return;
  var setN = function (f) { dm.set.call(this, typeof f === 'function' ? function (ev) { return f.call(this, rinomina(ev)); } : f); };
  setN._gxNomi = true;
  Object.defineProperty(WebSocket.prototype, 'onmessage', {configurable: true, enumerable: dm.enumerable, get: dm.get, set: setN});
  window.GXDC_RINOMINA = rinomina;
})();

/* L'ALTEZZA DELLA FINESTRA PER I GUSCI. Le pagine a parte (Last Call, Lupus, Kaiju, Dead Quiz, Geo, carte...) stanno in un
   guscio alto Telegram.WebApp.viewportStableHeight; il Telegram finto di shell.js la fissava all'apertura e non diceva mai
   «viewportChanged»: rimpicciolendo la finestra di Discord a partita in corso il guscio restava alto come prima (tagliato
   sotto). Qui l'altezza e' quella vera e il cambio si annuncia, come fa Telegram. */
(function () {
  if (window.GXDC_FIGLIA || !window.GXDC) return;
  var TW = window.Telegram && Telegram.WebApp;
  if (!TW || !TW.__discord || TW.__gxVivo) return;
  TW.__gxVivo = true;
  try {
    Object.defineProperty(TW, 'viewportHeight', {configurable: true, enumerable: true, get: function () { return innerHeight; }});
    Object.defineProperty(TW, 'viewportStableHeight', {configurable: true, enumerable: true, get: function () { return innerHeight; }});
  } catch (e) {}
  var EV = {};
  TW.onEvent = function (n, f) { if (typeof f === 'function') (EV[n] = EV[n] || []).push(f); };
  TW.offEvent = function (n, f) { var l = EV[n] || []; var i = l.indexOf(f); if (i >= 0) l.splice(i, 1); };
  var t = 0;
  addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(function () {
      (EV.viewportChanged || []).slice().forEach(function (f) { try { f.call(TW, {isStateStable: true}); } catch (e) {} });
    }, 60);
  });
})();

/* SCOPA su PC orizzontale: la tela del tavolo prende la forma della zona di gioco (larga) invece della colonna 1,5 del
   telefono; le misure delle carte le ferma all'altezza la toppa «PC scopa carte in orizzontale». Telefono: null. */
(function () {
  if (window.GXDC_FIGLIA || typeof window.GXDC_EXTRA !== 'function') return;
  if (window.GXDC && GXDC.extra && GXDC.extra.scopa) return;   // un lotto l'ha gia' registrata: non si sovrascrive
  GXDC_EXTRA('scopa', {
    rapporto: function (wrap) {
      if (innerWidth < innerHeight * 1.15 || innerWidth < 700 || innerHeight < 320) return null;
      try {
        var r = wrap.getBoundingClientRect(), W = r.width || innerWidth, H = innerHeight - 150;
        return Math.max(0.5, Math.min(0.9, H / W));
      } catch (e) { return null; }
    }
  });
})();

/* MORRA, ROULETTE RUSSA, DADI (lotto 8): il duello vive nel riquadro #pvp-modal (colonna da telefono, ~700 px di
   contenuto). Su PC restava un francobollo al centro, nella finestrella si tagliava sotto. Qui il riquadro si ingrandisce o
   si rimpicciolisce INTERO (CSS zoom: i clic restano giusti) per stare nella finestra: fino a 1,6 su PC (come i gradini
   del lotto 8), giu' fino a 0,3
   nella finestrella. Si rimisura a ogni cambio di misura e di contenuto. Telefono in verticale: niente. */
(function () {
  if (window.GXDC_FIGLIA || !window.GXDC) return;
  var G = {rps: 1, rr: 1, dice: 1};
  if (!G[GXDC.gioco]) return;
  function misura() {
    var m = document.getElementById('pvp-modal');
    if (!m || !m.offsetParent) return;
    // il riquadro e, per la Morra, il palco delle mani sopra (#xmr-stage): stesso fattore per tutti e due
    var L = [m], st = document.getElementById('xmr-stage');
    if (st && st.offsetParent && st.parentNode === m.parentNode) L.unshift(st);
    var W = innerWidth, H = innerHeight;
    if (W < H) { L.forEach(function (e) { if (e.style.zoom) e.style.zoom = ''; }); return; }
    var nat = 0, natW = 0;
    // l'altezza VERA del contenuto (i figli), non quella del riquadro: il riquadro puo' essere alto quanto la finestra
    // (in proporzione allo zoom) e misurarlo porterebbe lo zoom a scendere da solo
    L.forEach(function (e) {
      var z0 = parseFloat(e.style.zoom || getComputedStyle(e).zoom) || 1, a = 1e9, b = -1e9;
      for (var c = e.firstElementChild; c; c = c.nextElementSibling) {
        if (!c.offsetParent && getComputedStyle(c).position !== 'fixed') continue;
        var r = c.getBoundingClientRect(); if (r.height < 1) continue;
        a = Math.min(a, r.top); b = Math.max(b, r.bottom);
      }
      if (b > a) nat += (b - a) / z0 + 28;
      natW = Math.max(natW, e.offsetWidth);
    });
    if (!nat || !natW) return;
    var z = Math.max(0.3, Math.min(1.6, (H * 0.94) / nat, (W * 0.96) / natW));
    z = Math.round(z * 100) / 100;
    L.forEach(function (e) { var s2 = String(z); if (e.style.zoom !== s2) e.style.zoom = s2; });
  }
  addEventListener('resize', misura);
  setInterval(misura, 400);
})();

/* ── lotto 9 · sbanca.js ── */
/* DISCORD lotto 9 (17/11) — SBANCA! (artiglieria a turni). SOLO GRATIS, senza immagini ne' parole da casino'.
   Il gioco vive in una pagina a parte: l'index (guscio SBRT del rilascio Telegram) apre l'iframe
   «sbanca/sbanca.html?rt=1&modo=rt&piatt=tg&...»; shell.js lo gira su figlia.html (pagina in PAGINE_EXTRA) e carica.js
   (lotto 9: pagine anche in una sottocartella) la scrive con lo stesso strato Discord.
   Nella pagina a parte, PRIMA degli script del gioco:
     1) ?piatt=tg -> ?piatt=dc: la pagina usa i suoi alias Discord (armi, squadre, mappe, grida, tutorial) e non mostra
        mai posta/lobby (ITERAZIONE 8 di artiglieria_1611/fase2);
     2) le squadre «fiche» e «slot» (fiche e macchinette) diventano squadre senza casino' nei messaggi del server
        (il RT del lotto 9 sceglie gia' dadi/jolly/cilindri; a 4 il quarto seggio ricade qui e ripete una squadra,
        il colore resta quello del seggio);
     3) le icone da casino' dell'atlante (fiche, gettoni, monete, slot, ciliegie) si ridisegnano a codice sopra lo stesso
        atlante prima che il gioco lo usi (stesse misure, nessun file nuovo).
   Niente globali libere, niente eval. */
GXDC_EXTRA('sbanca', {
  pagina: 'sbanca/sbanca.html',
  testi: [
    [/\s*\(rimborso\)/gi, ''], [/\s*\(refund\)/gi, ''],
    [/\bsbanca a soldi[^.]*\.?/gi, ''],
    [/\bcasin[oò]\b/gi, 'colpo grosso']
  ],
  // nell'index (dopo entra()): la fine della partita non deve mai lasciare il giocatore sulla schermata di attesa.
  // Il guardiano della pagina chiede un «rientra» se per 3 s non arriva niente; a partita finita (o a stanza
  // d'allenamento sparita) il server risponde «nessuna partita da riprendere» e il guscio SBRT chiude l'iframe e
  // rimette la lobby (che dentro Discord non c'e'): restava la schermata «Allenamento · arriva il bot».
  //  - a partita finita il «rientra» non parte (non c'e' niente da riprendere);
  //  - se quella risposta arriva lo stesso: con l'esito in mano si mostra la scheda di fine, senza si torna al catalogo.
  dopo: function (D) {
    if (window.GXDC_FIGLIA || window.__GX9I) return;
    window.__GX9I = {rientra_saltati: 0, nessuna: 0};
    var W = window;
    if (typeof W.rtdSend === 'function') {
      var s0 = W.rtdSend;
      W.rtdSend = function (m) {
        try {
          if (m && m.t === 'rientra' && W.RTD && RTD.game === 'sbanca' && RTD.over && RTD.over.game === 'sbanca') { W.__GX9I.rientra_saltati++; return; }
        } catch (e) {}
        return s0.apply(this, arguments);
      };
    }
    // scheda di fine: il tasto «Tasti» dell'index (.xpc-btn, fisso in basso al centro) copriva «Torna ai giochi» a 1280x720.
    // Sulla scheda di fine non serve: classe gx9-fine su <html> (sbanca.css lo nasconde), tolta quando riparte la partita.
    var H = document.documentElement;
    if (typeof W.rtdShowOver === 'function') {
      var o0 = W.rtdShowOver;
      W.rtdShowOver = function () { try { H.classList.add('gx9-fine'); } catch (e) {} return o0.apply(this, arguments); };
    }
    if (typeof W.rtdShowSbancaRT === 'function') {
      var m0 = W.rtdShowSbancaRT;
      W.rtdShowSbancaRT = function () { try { H.classList.remove('gx9-fine'); } catch (e) {} return m0.apply(this, arguments); };
    }
    if (typeof W.rtdOnMsg === 'function') {
      var r0 = W.rtdOnMsg;
      W.rtdOnMsg = function (m) {
        try {
          // i seggi dei bot (bot:prsbanca:0, bot:dcsbanca:..): il motore li chiama col loro uid; dentro Discord sono «Pixel»
          if (m && (m.t === 'start' || m.t === 'over') && (m.game === 'sbanca' || (W.RTD && RTD.game === 'sbanca'))) {
            var nb = 0;
            [m.names, m.profiles].forEach(function (o) {
              if (!o || typeof o !== 'object') return;
              nb = 0;
              Object.keys(o).forEach(function (u) {
                if (String(u).indexOf('bot:') !== 0) return;
                nb++;
                var n = nb > 1 ? 'Pixel ' + nb : 'Pixel';
                if (o === m.names) o[u] = n; else if (o[u] && typeof o[u] === 'object') o[u].name = n; else o[u] = {name: n};
              });
            });
            if (m.t === 'over' && m.winner && String(m.winner).indexOf('bot:') === 0 && m.names && m.names[m.winner]) m.winner_name = m.names[m.winner];
          }
          if (m && m.t === 'err' && m.msg === 'nessuna partita da riprendere' && W.RTD && RTD.game === 'sbanca' &&
              typeof SBRT !== 'undefined' && SBRT.aperto && !SBRT.spec) {
            W.__GX9I.nessuna++;
            if (RTD.over && typeof W.rtdShowOver === 'function') {
              if (typeof W.rtdChiudiSbancaRT === 'function') rtdChiudiSbancaRT(true);
              RTD.ui = 'match';
              rtdShowOver(RTD.over);
            } else if (D && D.alCatalogo && !D.chiuso) { D.chiuso = true; D.alCatalogo('fine'); }
            return;
          }
        } catch (e) {}
        return r0.apply(this, arguments);
      };
    }
  },
  prima: function (D) {
    if (!window.GXDC_FIGLIA || !/\/sbanca\/sbanca\.html$/.test(location.pathname)) return;
    var W = window;
    W.__GX9 = {sq: 0, icone: 0, mat: 0};
    // 1) piatt=dc (e via i testi di posta/lobby: in dc non esistono)
    try {
      var u = new URL(location.href);
      u.searchParams.set('piatt', 'dc');
      u.searchParams.delete('posta'); u.searchParams.delete('lobby');
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    } catch (e) {}
    // 2) le squadre: listener registrato PRIMA del ponte del gioco (stesso oggetto dati: lo vede gia' cambiato)
    var VIA_SQ = {fiche: 1, slot: 1}, SICURE = ['dadi', 'jolly', 'cilindri'];
    function squadre(map) {
      if (!map || !map.squadre) return;
      var usate = {}, k;
      for (k in map.squadre) { var s = map.squadre[k]; if (s && !VIA_SQ[s.sq]) usate[s.sq] = 1; }
      for (k in map.squadre) {
        var q = map.squadre[k];
        if (!q || !VIA_SQ[q.sq]) continue;
        var libera = null;
        for (var i = 0; i < SICURE.length; i++) if (!usate[SICURE[i]]) { libera = SICURE[i]; break; }
        q.sq = libera || SICURE[(Number(q.seat) || 0) % SICURE.length];
        usate[q.sq] = 1;
        W.__GX9.sq++;
      }
    }
    W.addEventListener('message', function (ev) {
      var d = ev && ev.data;
      if (!d || typeof d !== 'object' || d.sm !== 'giu' || !d.m || typeof d.m !== 'object') return;
      if (d.m.t === 'start' && d.m.map) { try { squadre(d.m.map); } catch (e) {} }
    }, true);
    // 3) l'atlante degli oggetti (e, per sicurezza, le strisce «fiche»/«roulette» dei materiali)
    var F = {   // cornici di arte/atlante.json (oggetti.png 936x312)
      fiche_calda: [110, 4, 92, 96], cercatrice: [420, 13, 96, 77], mina: [836, 25, 96, 53], gettone_carica: [25, 108, 54, 96],
      jackpot: [122, 108, 67, 96], moneta: [215, 108, 90, 96], lapide: [852, 108, 64, 96], cura: [4, 214, 96, 91],
      coriandoli: [524, 214, 96, 92], cassa: [628, 212, 95, 96]
    };
    function rg(x, cx, cy, r, a, b, c) {
      var g = x.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.08, cx, cy, r);
      g.addColorStop(0, a); g.addColorStop(0.45, b); g.addColorStop(1, c); return g;
    }
    function bordo(x, w) { x.lineWidth = w; x.strokeStyle = 'rgba(20,12,30,.85)'; x.stroke(); }
    var DIS = {
      fiche_calda: function (x, w, h) {   // Biglia Calda: biglia di vetro arancio con fiamma
        var r = Math.min(w, h) * 0.36, cx = w / 2, cy = h * 0.58;
        x.fillStyle = 'rgba(255,140,40,.35)'; x.beginPath(); x.arc(cx, cy, r * 1.25, 0, 7); x.fill();
        x.fillStyle = '#ffb02e'; x.beginPath(); x.moveTo(cx - r * 0.5, cy - r * 0.6); x.quadraticCurveTo(cx - r * 0.2, cy - r * 1.7, cx + r * 0.1, cy - r * 1.05);
        x.quadraticCurveTo(cx + r * 0.35, cy - r * 1.6, cx + r * 0.55, cy - r * 0.6); x.closePath(); x.fill();
        x.fillStyle = rg(x, cx, cy, r, '#fff6d0', '#ff7a1a', '#8a1d00'); x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); bordo(x, 3);
        x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, r * 0.62, 3.6, 4.6); x.stroke();
      },
      cercatrice: function (x, w, h) {    // Razzo Cercatore
        x.save(); x.translate(w / 2, h / 2); x.rotate(-0.5);
        var L = w * 0.42, R = h * 0.16;
        x.fillStyle = '#ff9a2e'; x.beginPath(); x.moveTo(-L, -R * 0.6); x.lineTo(-L - R * 1.6, 0); x.lineTo(-L, R * 0.6); x.fill();
        x.fillStyle = '#c62b3a'; x.beginPath(); x.moveTo(-L + 6, -R); x.lineTo(-L - 8, -R * 2.1); x.lineTo(-L + R * 1.6, -R); x.closePath(); x.fill(); bordo(x, 2);
        x.beginPath(); x.moveTo(-L + 6, R); x.lineTo(-L - 8, R * 2.1); x.lineTo(-L + R * 1.6, R); x.closePath(); x.fill(); bordo(x, 2);
        var g = x.createLinearGradient(0, -R, 0, R); g.addColorStop(0, '#f4f6ff'); g.addColorStop(0.5, '#b9c3dc'); g.addColorStop(1, '#5d6684');
        x.fillStyle = g; x.beginPath(); x.moveTo(-L, -R); x.lineTo(L * 0.55, -R); x.quadraticCurveTo(L * 1.1, 0, L * 0.55, R); x.lineTo(-L, R); x.closePath(); x.fill(); bordo(x, 3);
        x.fillStyle = '#c62b3a'; x.beginPath(); x.moveTo(L * 0.5, -R); x.quadraticCurveTo(L * 1.1, 0, L * 0.5, R); x.closePath(); x.fill();
        x.fillStyle = '#5ad1ff'; x.beginPath(); x.arc(0, 0, R * 0.45, 0, 7); x.fill(); bordo(x, 2);
        x.restore();
      },
      mina: function (x, w, h) {          // Mina a Bottone: cupola di metallo col bottone rosso
        var cx = w / 2, by = h * 0.86, r = w * 0.38;
        x.fillStyle = '#3a3f4f'; x.fillRect(cx - r * 1.1, by - 6, r * 2.2, 8);
        x.fillStyle = rg(x, cx, by, r, '#e3e8f5', '#8f97ad', '#3a3f4f'); x.beginPath(); x.arc(cx, by, r, Math.PI, 0); x.closePath(); x.fill(); bordo(x, 3);
        x.fillStyle = '#ff3b3b'; x.beginPath(); x.arc(cx, by - r * 0.9, r * 0.22, 0, 7); x.fill(); bordo(x, 2);
        x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.arc(cx - r * 0.06, by - r * 0.96, r * 0.07, 0, 7); x.fill();
      },
      gettone_carica: function (x, w, h) { // Carica a Molla: giocattolo a carica con la chiave
        var cx = w / 2, cy = h * 0.55, r = w * 0.38;
        x.strokeStyle = '#c99a2e'; x.lineWidth = 5; x.beginPath(); x.moveTo(cx, cy - r); x.lineTo(cx, cy - r * 1.7); x.stroke();
        x.fillStyle = '#e6b84a'; x.beginPath(); x.ellipse(cx - r * 0.45, cy - r * 1.75, r * 0.42, r * 0.25, 0, 0, 7); x.fill(); bordo(x, 2);
        x.beginPath(); x.ellipse(cx + r * 0.45, cy - r * 1.75, r * 0.42, r * 0.25, 0, 0, 7); x.fill(); bordo(x, 2);
        x.fillStyle = rg(x, cx, cy, r, '#bff3ff', '#2eb7e6', '#0c4d75'); x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); bordo(x, 3);
        x.fillStyle = '#fff'; x.beginPath(); x.arc(cx - r * 0.35, cy - r * 0.15, r * 0.22, 0, 7); x.arc(cx + r * 0.35, cy - r * 0.15, r * 0.22, 0, 7); x.fill();
        x.fillStyle = '#111'; x.beginPath(); x.arc(cx - r * 0.3, cy - r * 0.12, r * 0.1, 0, 7); x.arc(cx + r * 0.4, cy - r * 0.12, r * 0.1, 0, 7); x.fill();
        x.fillStyle = '#e8334a'; x.fillRect(cx - r * 0.75, cy + r * 0.85, r * 0.5, r * 0.35); x.fillRect(cx + r * 0.25, cy + r * 0.85, r * 0.5, r * 0.35);
      },
      jackpot: function (x, w, h) {       // Palla Demolitrice
        var cx = w / 2, cy = h * 0.66, r = Math.min(w, h) * 0.32;
        x.strokeStyle = '#9aa1b5'; x.lineWidth = 4;
        for (var i = 0; i < 4; i++) { x.beginPath(); x.ellipse(cx, 6 + i * (cy - r - 6) / 4 + 5, 4, 6, 0, 0, 7); x.stroke(); }
        x.fillStyle = rg(x, cx, cy, r, '#9da3b8', '#3b3f4d', '#0e0f15'); x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); bordo(x, 3);
        x.fillStyle = '#2a2d38'; x.fillRect(cx - 6, cy - r - 6, 12, 10);
      },
      moneta: function (x, w, h) {        // Pioggia di Biglie: tre biglie colorate
        var r = Math.min(w, h) * 0.2, P = [[0.32, 0.62, '#ff5a7a', '#7a0d2a'], [0.66, 0.6, '#5ab4ff', '#0d3a7a'], [0.5, 0.32, '#6cff9a', '#0d6a2a']];
        for (var i = 0; i < P.length; i++) {
          var cx = w * P[i][0], cy = h * P[i][1];
          x.fillStyle = rg(x, cx, cy, r, '#ffffff', P[i][2], P[i][3]); x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); bordo(x, 2);
        }
      },
      lapide: function (x, w, h) {        // Lapide su una base di pietra
        var cx = w / 2, top = h * 0.12, bw = w * 0.8;
        x.fillStyle = '#5c5f6b'; x.fillRect(cx - bw / 2, h * 0.8, bw, h * 0.16);
        var g = x.createLinearGradient(0, top, 0, h * 0.8); g.addColorStop(0, '#b9bdc8'); g.addColorStop(1, '#6d717d');
        x.fillStyle = g; x.beginPath(); x.moveTo(cx - bw * 0.38, h * 0.82); x.lineTo(cx - bw * 0.38, top + bw * 0.38);
        x.arc(cx, top + bw * 0.38, bw * 0.38, Math.PI, 0); x.lineTo(cx + bw * 0.38, h * 0.82); x.closePath(); x.fill(); bordo(x, 3);
        x.strokeStyle = '#3d404b'; x.lineWidth = 4; x.beginPath(); x.moveTo(cx, top + bw * 0.25); x.lineTo(cx, top + bw * 0.75);
        x.moveTo(cx - bw * 0.16, top + bw * 0.42); x.lineTo(cx + bw * 0.16, top + bw * 0.42); x.stroke();
      },
      cura: function (x, w, h) {          // Cassetta del pronto soccorso
        var bx = w * 0.08, by = h * 0.22, bw = w * 0.84, bh = h * 0.66;
        x.fillStyle = '#d8dbe4'; x.fillRect(w / 2 - w * 0.16, by - h * 0.12, w * 0.32, h * 0.14);
        x.fillStyle = '#f6f7fb'; x.beginPath(); x.rect(bx, by, bw, bh); x.fill(); bordo(x, 3);
        x.fillStyle = '#e8334a'; var c = Math.min(bw, bh) * 0.22;
        x.fillRect(w / 2 - c / 2, by + bh / 2 - c * 1.5, c, c * 3); x.fillRect(w / 2 - c * 1.5, by + bh / 2 - c / 2, c * 3, c);
      },
      coriandoli: function (x, w, h) {    // Coriandoli colorati (al posto delle monete)
        var C = ['#ff5a7a', '#ffd23f', '#5ab4ff', '#6cff9a', '#c58bff'];
        for (var i = 0; i < 34; i++) {
          var a = i * 2.39996, rr = Math.sqrt(i / 34) * Math.min(w, h) * 0.46;
          x.save(); x.translate(w / 2 + Math.cos(a) * rr, h / 2 + Math.sin(a) * rr); x.rotate(a * 1.7);
          x.fillStyle = C[i % C.length]; x.fillRect(-5, -2.5, 10, 5); x.restore();
        }
      },
      cassa: function (x, w, h) {         // Cassa di legno (senza l'emblema)
        var b = 6;
        x.fillStyle = '#a8692f'; x.fillRect(b, b, w - 2 * b, h - 2 * b);
        x.strokeStyle = '#5b3414'; x.lineWidth = 6; x.strokeRect(b + 3, b + 3, w - 2 * b - 6, h - 2 * b - 6);
        x.lineWidth = 7; x.beginPath(); x.moveTo(b + 6, b + 6); x.lineTo(w - b - 6, h - b - 6); x.moveTo(w - b - 6, b + 6); x.lineTo(b + 6, h - b - 6); x.stroke();
        x.strokeStyle = 'rgba(255,220,160,.35)'; x.lineWidth = 2;
        for (var i = 1; i < 4; i++) { x.beginPath(); x.moveTo(b + 4, b + i * (h - 2 * b) / 4); x.lineTo(w - b - 4, b + i * (h - 2 * b) / 4); x.stroke(); }
      }
    };
    function oggetti(im) {
      var c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
      var x = c.getContext('2d'); x.drawImage(im, 0, 0);
      for (var k in F) {
        var f = F[k]; x.clearRect(f[0], f[1], f[2], f[3]);
        x.save(); x.beginPath(); x.rect(f[0], f[1], f[2], f[3]); x.clip(); x.translate(f[0], f[1]);
        try { DIS[k](x, f[2], f[3]); W.__GX9.icone++; } catch (e) {}
        x.restore();
      }
      return c.toDataURL('image/png');
    }
    function materiali(im) {      // 12 strisce da 256: «fiche» (6) e «roulette» (10) prendono «legno» (1) e «cemento» (8)
      var c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
      var x = c.getContext('2d'); x.drawImage(im, 0, 0);
      if (c.width >= 12 * 256) { x.drawImage(im, 256, 0, 256, 256, 6 * 256, 0, 256, 256); x.drawImage(im, 8 * 256, 0, 256, 256, 10 * 256, 0, 256, 256); W.__GX9.mat = 1; }
      return c.toDataURL('image/png');
    }
    var dS = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (!dS || !dS.set) return;
    Object.defineProperty(HTMLImageElement.prototype, 'src', {configurable: true, enumerable: dS.enumerable, get: dS.get,
      set: function (v) {
        var s = String(v), fn = /(^|\/)arte\/oggetti\.png(\?|$)/.test(s) ? oggetti : (/(^|\/)arte\/materiali\.png(\?|$)/.test(s) ? materiali : null);
        if (!fn || this.__gx9) return dS.set.call(this, v);
        var me = this, o = new Image();
        me.__gx9 = 1;
        o.onload = function () { var r = s; try { r = fn(o); } catch (e) {} dS.set.call(me, r); };
        o.onerror = function () { dS.set.call(me, s); };
        dS.set.call(o, s);
      }});
  }
});

