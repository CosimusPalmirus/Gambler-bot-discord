/* DISCORD: giochi dei lotti 4,5,6,7,pong_fix (costruito da strumenti/integra_lotti.py) */
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
