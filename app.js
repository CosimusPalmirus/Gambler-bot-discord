/* Catalogo dei giochi gratis per l'Activity di Discord — logica della pagina (prototipo 15/11/2026).
   Parla con Discord solo attraverso window.GXD (discord.js). Nessuna valuta, nessuna cifra in euro. */
(function () {
  'use strict';
  var G = window.GX_GIOCHI, CATS = window.GX_CATEGORIE;
  var PER_ID = {}; G.forEach(function (g) { PER_ID[g.id] = g; });
  var NOME_CAT = {}; CATS.forEach(function (c) { NOME_CAT[c[0]] = c[1]; });
  var $ = function (id) { return document.getElementById(id); };
  var stato = { filtro: 'tutti', testo: '', gente: [], io: null, instanceId: '', aperto: null, sala: null, ultimo: null };

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function giocatori(g) { return g.min === g.max ? String(g.min) : g.min + '–' + g.max; }
  function adatto(g, n) { return n >= g.min && n <= g.max; }
  function icona(g) {
    return '<img src="asset/gbx_pv_' + g.id + '.webp" alt="" loading="lazy" decoding="async">';
  }
  function avatar(p) {
    var st = p.foto ? ' style="background-image:url(\'' + esc(p.foto) + '\')"' : ' style="background:' + (p.colore || '#8b83f0') + '"';
    return '<span class="av"' + st + '>' + (p.foto ? '' : esc(p.nome.charAt(0).toUpperCase())) + '</span>';
  }
  var tToast;
  function toast(t) {
    var el = $('toast'); el.textContent = t; el.classList.add('su');
    clearTimeout(tToast); tToast = setTimeout(function () { el.classList.remove('su'); }, 2600);
  }

  /* ───────── chi è nel canale ───────── */
  function disegnaCanale() {
    var n = stato.gente.length;
    $('n-canale').textContent = n;
    $('facce').innerHTML = stato.gente.map(function (p) {
      var io = stato.io && p.id === stato.io.id;
      return '<div class="faccia' + (io ? ' io' : '') + '">' + avatar(p) + '<i>' + (io ? 'Tu' : esc(p.nome)) + '</i></div>';
    }).join('');
    $('sottotitolo').innerHTML = G.length + ' giochi gratis da fare insieme, qui nel canale. <b>' +
      G.filter(function (g) { return adatto(g, n); }).length + '</b> vanno bene per ' + (n === 1 ? 'te da solo' : 'voi ' + n) + '.';
    disegnaFiltri(); disegnaCatalogo(); disegnaPip();
  }

  /* ───────── carosello ───────── */
  var tCar = null, carFermo = false;
  function disegnaCarosello() {
    var ids = window.GX_CAROSELLO.filter(function (id) { return PER_ID[id] && PER_ID[id].ban; });
    $('carosello').innerHTML = ids.map(function (id) {
      var g = PER_ID[id];
      return '<button class="slide x-lastra" type="button" data-id="' + id + '">' +
        '<img src="asset/gbx_bn_' + id + '.webp" alt="" ' + (ids.indexOf(id) < 3 ? '' : 'loading="lazy" ') + 'decoding="async">' +
        '<span class="tx"><small>' + NOME_CAT[g.cat] + '</small><b>' + esc(g.nome) + '</b><span>' + esc(g.sotto) + '</span>' +
        '<em><strong>' + giocatori(g) + '</strong> giocatori · ' + g.durata + '</em></span></button>';
    }).join('');
    $('puntini').innerHTML = ids.map(function (_, i) { return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('');
    var car = $('carosello');
    car.addEventListener('scroll', function () {
      var w = car.firstElementChild ? car.firstElementChild.offsetWidth + 12 : 1;
      var i = Math.round(car.scrollLeft / w);
      var dots = $('puntini').children;
      for (var k = 0; k < dots.length; k++) dots[k].classList.toggle('on', k === i);
    }, {passive: true});
    ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(function (e) {
      car.addEventListener(e, function () { carFermo = true; clearInterval(tCar); }, {passive: true});
    });
    // avanza da solo ogni 6 s finché nessuno lo tocca (come l'Arena); mai se la pagina non si vede
    tCar = setInterval(function () {
      // PRESTAZIONI P8: sotto l'iframe del gioco (html.in-gioco) il carosello non scorre (prima: scorrimento animato ogni 6 s
      // dietro la partita, con il ricalcolo del layout del catalogo e i banner scaricati)
      if (carFermo || document.hidden || document.documentElement.classList.contains('modo-pip') || document.documentElement.classList.contains('in-gioco')) return;
      var r = car.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      var w = car.firstElementChild.offsetWidth + 12;
      var fine = car.scrollLeft + car.clientWidth >= car.scrollWidth - 4;
      car.scrollTo({left: fine ? 0 : car.scrollLeft + w, behavior: 'smooth'});
    }, 6000);
  }

  /* ───────── trascina col mouse le file che scorrono di lato (carosello, filtri, facce) ───────── */
  (function () {
    var SEL = '.carosello,.filtri,.facce', d = null, blocca = false;
    document.addEventListener('dragstart', function (e) { if (e.target.closest && e.target.closest(SEL)) e.preventDefault(); });
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      var el = e.target.closest && e.target.closest(SEL);
      if (!el || el.scrollWidth <= el.clientWidth) return;
      d = {el: el, x: e.clientX, sl: el.scrollLeft, mosso: false, id: e.pointerId};
    });
    document.addEventListener('pointermove', function (e) {
      if (!d || e.pointerId !== d.id) return;
      var dx = e.clientX - d.x;
      if (!d.mosso && Math.abs(dx) < 6) return;
      if (!d.mosso) { d.mosso = true; d.el.classList.add('trascino'); }
      d.el.scrollLeft = d.sl - dx;
      e.preventDefault();
    });
    function fine() {
      if (!d) return;
      if (d.mosso) {
        blocca = true; setTimeout(function () { blocca = false; }, 0);
        var el = d.el; el.classList.remove('trascino');
        var p = el.firstElementChild;
        if (el.classList.contains('carosello') && p) {          // si ferma sulla lastra piu' vicina
          var w = p.offsetWidth + 12;
          el.scrollTo({left: Math.round(el.scrollLeft / w) * w, behavior: 'smooth'});
        }
      }
      d = null;
    }
    document.addEventListener('pointerup', fine);
    document.addEventListener('pointercancel', fine);
    document.addEventListener('click', function (e) { if (blocca) { e.stopPropagation(); e.preventDefault(); blocca = false; } }, true);
  })();

  /* ───────── filtri e ricerca ───────── */
  function disegnaFiltri() {
    var n = stato.gente.length;
    var conta = function (c) { return G.filter(function (g) { return c === 'tutti' || g.cat === c; }).length; };
    var h = CATS.map(function (c, i) {
      var b = '<button type="button" role="tab" data-f="' + c[0] + '" class="' + (stato.filtro === c[0] ? 'on' : '') + '">' + c[1] + '<span>' + conta(c[0]) + '</span></button>';
      if (i === 0) b += '<button type="button" role="tab" data-f="voi" class="voi' + (stato.filtro === 'voi' ? ' on' : '') + '">Per ' +
        (n === 1 ? 'te' : 'voi ' + n) + '<span>' + G.filter(function (g) { return adatto(g, n); }).length + '</span></button>';
      return b;
    }).join('');
    $('filtri').innerHTML = h;
  }
  function passa(g) {
    var t = stato.testo;
    if (t) {
      var s = (g.nome + ' ' + g.sotto + ' ' + NOME_CAT[g.cat]).toLowerCase();
      if (s.indexOf(t) < 0) return false;
    }
    if (stato.filtro === 'voi') return adatto(g, stato.gente.length);
    return stato.filtro === 'tutti' || g.cat === stato.filtro;
  }

  /* ───────── catalogo a gruppi ───────── */
  function riga(g) {
    var n = stato.gente.length, ok = adatto(g, n);
    return '<button class="riga" type="button" data-id="' + g.id + '">' +
      '<span class="ico">' + icona(g) + '</span>' +
      '<span class="rt"><b>' + esc(g.nome) + '</b><span>' + esc(g.sotto) + '</span>' +
      '<em><strong' + (ok ? ' class="ok"' : '') + '>' + (g.max === 2 ? '1 contro 1' : giocatori(g) + '</strong> giocatori<strong>') + '</strong> · ' + g.durata + '</em></span>' +
      '<span class="dx"><span class="gioca">GIOCA</span>' + (g.bot ? '<span class="etic">BOT</span>' : '') + '</span></button>';
  }
  function disegnaCatalogo() {
    var h = '', tot = 0;
    CATS.slice(1).forEach(function (c) {
      var lista = G.filter(function (g) { return g.cat === c[0] && passa(g); });
      if (!lista.length) return;
      tot += lista.length;
      h += '<h2 class="sez">' + c[1] + '<span>' + lista.length + '</span></h2>' +
        '<div class="gruppo x-lastra"><div class="righe">' + lista.map(riga).join('') + '</div></div>';
    });
    if (!tot) {
      h = '<p class="vuoto">' + (stato.testo ? 'Nessun gioco con «' + esc(stato.testo) + '».' :
        'Nessun gioco tiene ' + stato.gente.length + ' persone insieme: provate un filtro diverso.') + '</p>';
    }
    $('catalogo').innerHTML = h;
  }

  /* ───────── foglio del gioco ───────── */
  function notaCanale(g) {
    var n = stato.gente.length;
    if (n < g.min) {
      return 'Siete in ' + n + ', ne servono almeno ' + g.min + '. ' +
        (g.bot ? 'I posti vuoti li prendono i bot, oppure chiamate qualcuno nel vocale.' : 'Chiamate qualcuno nel vocale.');
    }
    if (n > g.max) {
      return 'Il gioco tiene ' + g.max + ' giocatori: entrano i primi ' + g.max + (n - g.max === 1 ? ', l’altro guarda e fa il turno dopo.' : ', gli altri ' + (n - g.max) + ' guardano e fanno il turno dopo.');
    }
    return n === 1 ? 'Sei solo nel canale: puoi aspettare gli altri o allenarti coi bot.'
      : 'Siete in ' + n + ': entrate tutti nella stessa partita.';
  }
  function apri(id) {
    var g = PER_ID[id]; if (!g) return;
    stato.aperto = g; stato.ultimo = g;
    var arte = $('f-arte'), chiudi = $('chiudi');
    arte.innerHTML = '';
    if (g.ban) arte.insertAdjacentHTML('beforeend', '<img class="bn" src="asset/gbx_bn_' + g.id + '.webp" alt="">');
    else arte.insertAdjacentHTML('beforeend', '<img class="sf" src="asset/gbx_pv_' + g.id + '.webp" alt="">' + '<span class="ico">' + icona(g) + '</span>');
    arte.appendChild(chiudi);
    $('f-cat').textContent = NOME_CAT[g.cat];
    $('f-nome').textContent = g.nome;
    $('f-descr').textContent = g.descr;
    $('f-gioc').textContent = giocatori(g);
    $('f-dur').textContent = g.durata;
    $('f-bot').textContent = g.bot ? 'Sì' : 'No';
    $('f-nota').textContent = notaCanale(g);
    // lotto 2: UNO ha due varianti (due giochi sul server): la scelta vale per sala, coda e allenamento
    // lotto 5: le varianti di ogni gioco (UNO, Biliardo, Dama) da GX_VARIANTI
    var fv = $('f-var'), VV = (window.GX_VARIANTI || {})[g.id];
    fv.hidden = !VV;
    if (VV) {
      var scelta = window.GXD.varianteDi ? window.GXD.varianteDi(g.id) : VV[0][0];
      fv.innerHTML = '';
      VV.forEach(function (v) {
        var b = document.createElement('button');
        b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('data-v', v[0]); b.textContent = v[1];
        b.classList.toggle('su', v[0] === scelta); b.setAttribute('aria-checked', v[0] === scelta ? 'true' : 'false');
        fv.appendChild(b);
      });
    }
    var tb = $('t-bot'), on = window.GXD.attivo(g.id);
    tb.disabled = !g.bot || !on;
    tb.innerHTML = (g.bot && on) ? 'Allenati coi bot' : 'Allenati coi bot <small>· presto</small>';
    // fase 1: dentro Discord si gioca solo ai giochi accesi sul server; gli altri dicono «presto» (mai un tasto muto)
    $('t-canale').disabled = !on; $('t-coda').disabled = !on;
    $('t-canale').lastChild.textContent = on ? ' Gioca con il canale' : ' Gioca con il canale · presto';
    $('t-coda').lastChild.textContent = on ? ' Cerca avversari' : ' Cerca avversari · presto';
    var sb = !!g.soloBot; $('t-canale').style.opacity = $('t-coda').style.opacity = sb ? '.45' : '';   // GEMBRAWL_2811: per ora solo coi bot
    if (sb) { $('t-canale').disabled = $('t-coda').disabled = true; $('t-canale').lastChild.textContent = ' Gioca con il canale · presto'; $('t-coda').lastChild.textContent = ' Cerca avversari · presto'; $('f-nota').textContent = 'Per ora si gioca contro i bot, tutto qui nella pagina: la partita con il canale arriva presto.'; }
    var v = $('velo'); v.classList.add('su'); v.setAttribute('aria-hidden', 'false');
    disegnaPip();
    setTimeout(function () { $('t-canale').focus({preventScroll: true}); }, 60);
  }
  function chiudi() {
    var v = $('velo'); v.classList.remove('su'); v.setAttribute('aria-hidden', 'true'); stato.aperto = null;
  }

  /* ───────── partita vera (dentro Discord) ───────── */
  var ERRORI = {pieno: 'Tutti i tavoli gratis sono occupati: riprova tra poco.', limite: 'Tante partite di fila: riprova tra qualche minuto.',
                gioco_non_attivo: 'Questo gioco arriva presto.', sessione: 'Accesso scaduto: riapri l’attività.', istanza: 'Riapri l’attività dal canale.'};
  function errore(e) { toast(ERRORI[e] || 'Non riesco a partire, riprova tra poco.'); }
  function avviaGioco(g, ticket, opz) {
    opz = opz || {};
    stato.inGioco = g;
    disegnaPip();
    window.GXD.apriGioco(g.id, ticket, {
      pratica: !!opz.pratica, persone: stato.gente.concat(opz.avversari || []),
      onFine: function (r) {
        stato.inGioco = null; disegnaPip();
        // «Ancora»/«Rivincita»: si riparte dallo stesso posto (allenamento, sala del canale, coda pubblica)
        if (r && r.ancora) { if (opz.pratica) apriSala(g, 'bot'); else if (opz.modo === 'canale') apriSala(g, 'canale'); else if (opz.modo === 'coda') apriCoda(g); else apri(g.id); }
      }
    }).catch(function (e) { stato.inGioco = null; toast('Il gioco non si apre, riprova.'); window.GXD.avvisi.push('apriGioco ' + g.id + ': ' + ((e && e.message) || e)); diagnosi(); disegnaPip(); });
  }
  function salaVera(g, modo) {
    if (modo === 'bot' && window.GXD.praticaLocale(g.id)) { avviaGioco(g, null, {pratica: true}); return; }
    if (modo === 'bot') {
      stato.partita = window.GXD.avviaPartita(g.id, 'bot', stato.instanceId, function (m) {
        stato.partita = null;
        if (m.stato === 'via') avviaGioco(g, m.ticket, {pratica: true}); else errore(m.errore);
      });
      return;
    }
    stato.sala = {g: g, modo: modo, posti: [{p: stato.io, st: 'pronto'}], vera: true, attesi: 2, min: 2, bot: false, conBot: true, pieno: false};
    $('s-ico').innerHTML = icona(g);
    $('s-nome').textContent = g.nome;
    $('s-via').style.display = 'none';
    disegnaSala();
    var s = $('sala'); s.classList.add('su'); s.setAttribute('aria-hidden', 'false');
    var S = stato.sala;
    S.h = window.GXD.avviaPartita(g.id, 'canale', stato.instanceId, function (m) {
      if (stato.sala !== S) return;
      if (m.stato === 'attesa') {
        S.attesi = m.posti || 2; S.min = m.min || S.attesi; S.bot = !!m.bot; S.pieno = !!m.pieno;
        S.posti = (m.in_sala || []).map(function (p) { return {p: p, st: 'pronto'}; });
        disegnaSala();
      } else if (m.stato === 'via') {
        S.h = null; chiudiSala();
        avviaGioco(g, m.ticket, {avversari: m.avversari, modo: 'canale'});
      } else if (m.stato === 'errore') {
        S.h = null; chiudiSala(); errore(m.errore);
      }
    });
  }

  /* ───────── sala d'attesa ───────── */
  var tSala = [];
  function apriSala(g, modo) {
    tSala.forEach(clearTimeout); tSala = [];
    if (window.GXD.vero) { salaVera(g, modo); return; }
    $('s-via').style.display = '';
    var posti = [];
    if (modo === 'bot') {
      posti.push({p: stato.io, st: 'pronto'});
      var nb = Math.max(1, Math.min(g.max, Math.max(g.min, 4)) - 1);
      for (var i = 1; i <= nb; i++) posti.push({p: {id: 'b' + i, nome: 'Bot ' + i, colore: '#3a3a3c'}, st: 'pronto', bot: true});
    } else {
      stato.gente.forEach(function (p, i) {
        posti.push({p: p, st: p.id === stato.io.id ? 'pronto' : 'entra', guarda: i >= g.max});
      });
      if (stato.gente.length < g.min && g.bot) {
        for (var k = 1; k <= g.min - stato.gente.length; k++) posti.push({p: {id: 'b' + k, nome: 'Bot ' + k, colore: '#3a3a3c'}, st: 'pronto', bot: true});
      }
    }
    stato.sala = {g: g, modo: modo, posti: posti};
    $('s-ico').innerHTML = icona(g);
    $('s-nome').textContent = g.nome;
    disegnaSala();
    var s = $('sala'); s.classList.add('su'); s.setAttribute('aria-hidden', 'false');
    // nel prototipo gli altri "entrano" uno alla volta; nel vero arriva dal server (stanza legata all'instanceId)
    posti.forEach(function (x, i) {
      if (x.st === 'entra') tSala.push(setTimeout(function () { x.st = 'pronto'; disegnaSala(); }, 500 + i * 450));
    });
    window.GXD.avviaPartita(g.id, modo, stato.instanceId);
  }
  function disegnaSala() {
    var S = stato.sala; if (!S) return;
    if (S.vera) {
      var n = S.posti.length, manca = Math.max(0, S.attesi - n), puo = S.min < S.attesi && n >= S.min;
      var mancaMin = Math.max(0, S.min - n);
      $('s-stato').textContent = S.pieno ? 'Tutti i tavoli gratis sono occupati: aspetto un posto libero'
        : puo ? 'Siete in ' + n + ' (fino a ' + S.attesi + '): si parte quando volete' + (S.conBot && S.bot ? ', i posti vuoti ai bot' : '')
        : (manca ? 'Aspetto ' + (S.min < S.attesi
                     ? (mancaMin === 1 ? 'almeno un altro giocatore del canale' : 'almeno ' + mancaMin + ' giocatori del canale')
                     : (manca === 1 ? 'un altro giocatore del canale' : manca + ' giocatori del canale')) + ' · si parte da soli quando ci siete'
                 : 'Si parte');
      // giochi da 2 a 4 (Smash): «Inizia la partita» con chi c'e', e i posti vuoti ai bot se si vuole
      var via = $('s-via');
      via.style.display = S.min < S.attesi ? '' : 'none';
      via.disabled = !puo || S.pieno || !!S.partito; via.style.opacity = via.disabled ? .45 : 1;
      via.textContent = S.conBot && S.bot && n < S.attesi ? 'Inizia la partita · con i bot' : 'Inizia la partita';
      var tb = $('s-bot');
      tb.style.display = (S.min < S.attesi && S.bot) ? '' : 'none';
      tb.classList.toggle('on', S.conBot); tb.setAttribute('aria-pressed', S.conBot ? 'true' : 'false');
      $('s-posti').innerHTML = S.posti.map(function (x) {
        var io = stato.io && x.p.id === stato.io.id;
        return '<li>' + avatar(x.p) + '<b>' + esc(io ? x.p.nome + ' (tu)' : x.p.nome) + '</b><span class="st ok">pronto</span></li>';
      }).join('') + (manca ? '<li class="guarda"><span class="av" style="background:#3a3a3c">?</span><b>Posto libero</b><span class="st">chi apre ' + esc(S.g.nome) + ' nel canale entra qui</span></li>' : '');
      disegnaPip();
      return;
    }
    var gioca = S.posti.filter(function (x) { return !x.guarda; });
    var pronti = gioca.filter(function (x) { return x.st === 'pronto'; }).length;
    $('s-stato').textContent = S.modo === 'bot' ? 'Allenamento coi bot · non conta per nessuno'
      : pronti + ' di ' + gioca.length + ' pronti · ' + (pronti < S.g.min ? 'ne servono ' + S.g.min : 'si può partire');
    $('s-posti').innerHTML = S.posti.map(function (x) {
      var io = stato.io && x.p.id === stato.io.id;
      return '<li class="' + (x.guarda ? 'guarda' : '') + '">' + avatar(x.p) + '<b>' + esc(io ? x.p.nome + ' (tu)' : x.p.nome) + '</b>' +
        '<span class="st' + (x.st === 'pronto' && !x.guarda && !x.bot ? ' ok' : '') + '">' +
        (x.guarda ? 'guarda' : x.bot ? 'bot' : x.st === 'pronto' ? 'pronto' : 'sta entrando…') + '</span></li>';
    }).join('');
    var via = $('s-via');
    via.disabled = pronti < S.g.min;
    via.style.opacity = via.disabled ? .45 : 1;
    disegnaPip();
  }
  function chiudiSala() {
    tSala.forEach(clearTimeout); tSala = [];
    if (stato.sala && stato.sala.h) stato.sala.h.annulla();
    stato.sala = null;
    var s = $('sala'); s.classList.remove('su'); s.setAttribute('aria-hidden', 'true');
    disegnaPip();
  }

  /* ───────── coda gratis pubblica (avversari sconosciuti) ───────── */
  function mmss(s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function apriCoda(g) {
    chiudiCoda();
    var posti = (g.max === 2 || window.GXD.vero) ? 2 : Math.min(g.max, Math.max(g.min, 4));   // fase 1: la coda vera abbina a due
    var C = stato.coda = {g: g, posti: posti, t0: Date.now(), trovato: false, visti: 0, giro: null, via: null};
    var el = $('coda');
    el.classList.remove('trovato'); el.classList.add('in-ricerca', 'su'); el.setAttribute('aria-hidden', 'false');
    $('c-ico').innerHTML = icona(g);
    $('c-gioco').textContent = g.nome + ' · coda pubblica';
    $('c-titolo').textContent = posti === 2 ? 'Cerco un avversario' : 'Cerco avversari';
    $('c-tempo').textContent = '0:00';
    $('c-info').innerHTML = 'Giocatori da tutta Discord, non del canale.';
    $('c-trovati').innerHTML = '';
    $('c-annulla').textContent = 'Annulla';
    C.giro = setInterval(function () {
      if (C.trovato) return;
      $('c-tempo').textContent = mmss(Math.floor((Date.now() - C.t0) / 1000));
      disegnaPip();
    }, 250);
    C.h = window.GXD.cercaAvversari(g.id, posti, function (m) {
      if (stato.coda !== C) return;
      if (m.stato === 'in_coda') {
        if (m.pieno) { $('c-info').textContent = 'Tutti i tavoli gratis sono occupati: resto in coda.'; return; }
        $('c-info').innerHTML = '<b>' + m.in_coda + '</b> in coda per ' + esc(g.nome) +
          (posti > 2 ? ' · trovati <b>' + (m.avversari || []).length + '</b> di ' + (posti - 1) : '');
        disegnaTrovati(C, m.avversari || []);
      } else if (m.stato === 'trovato') {
        trovato(C, m);
      } else if (m.stato === 'errore') {
        chiudiCoda(ERRORI[m.errore] || 'Coda non disponibile, riprova tra poco');
      }
    });
    disegnaPip();
  }
  function disegnaTrovati(C, avv, finale) {
    var box = $('c-trovati');
    var gx = function (p, i) { return '<div class="gx' + (i >= C.visti ? ' nuovo' : '') + '">' + avatar(p) + '<i>' + esc(p.nome) + '</i></div>'; };
    box.innerHTML = finale
      ? '<div class="gx">' + avatar(stato.io) + '<i>Tu</i></div><span class="vs">VS</span>' + avv.map(gx).join('')
      : avv.map(gx).join('');
    C.visti = avv.length;
  }
  function trovato(C, m) {
    C.trovato = true;
    var el = $('coda'); el.classList.remove('in-ricerca'); el.classList.add('trovato');
    $('c-titolo').textContent = m.avversari.length === 1 ? 'Avversario trovato' : 'Avversari trovati';
    $('c-info').innerHTML = 'Partita gratis · ' + esc(C.g.nome) + ' · ' + C.posti + ' giocatori';
    C.visti = 0;
    disegnaTrovati(C, m.avversari, true);
    var n = 3;
    $('c-tempo').textContent = 'Si parte tra ' + n;
    $('c-annulla').textContent = 'Esci';
    C.via = setInterval(function () {
      n--;
      if (n > 0) { $('c-tempo').textContent = 'Si parte tra ' + n; disegnaPip(); return; }
      if (window.GXD.vero && m.ticket) { C.trovataVera = true; chiudiCoda(); avviaGioco(C.g, m.ticket, {avversari: m.avversari, modo: 'coda'}); return; }
      chiudiCoda('Prototipo: qui parte ' + C.g.nome + ' con ' + m.avversari.map(function (p) { return p.nome; }).join(', ') + '.');
    }, 1000);
    disegnaPip();
  }
  function chiudiCoda(msg) {
    var C = stato.coda; if (!C) return;
    clearInterval(C.giro); clearInterval(C.via);
    if (C.h) C.h.annulla(C.trovataVera);
    stato.coda = null;
    var el = $('coda'); el.classList.remove('su', 'in-ricerca', 'trovato'); el.setAttribute('aria-hidden', 'true');
    if (msg) toast(msg);
    disegnaPip();
  }

  /* ───────── finestrella PIP ───────── */
  var layoutDiscord = 'pieno';
  function controllaPip() {
    var pip = layoutDiscord === 'pip' || (innerHeight < 300 && innerWidth < 560);
    document.documentElement.classList.toggle('modo-pip', pip);
  }
  function disegnaPip() {
    // lotto 10: un torneo del canale in corso si vede anche nella finestrella
    var tn = window.GXTorneo && window.GXTorneo.pip && window.GXTorneo.pip();
    if (tn && !stato.coda && !stato.sala) {
      $('p-ico').innerHTML = tn.ico; $('p-sopra').textContent = stato.gente.length + ' nel canale';
      $('p-nome').textContent = tn.nome; $('p-stato').textContent = tn.stato;
      $('p-facce').innerHTML = stato.gente.slice(0, 5).map(avatar).join('') + (stato.gente.length > 5 ? '<em>+' + (stato.gente.length - 5) + '</em>' : '');
      return;
    }
    var g = stato.inGioco || (stato.coda && stato.coda.g) || (stato.sala && stato.sala.g) || stato.aperto || stato.ultimo, n = stato.gente.length;
    $('p-ico').innerHTML = g ? icona(g) : '<svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/></svg>';
    $('p-sopra').textContent = n + ' nel canale';
    $('p-nome').textContent = g ? g.nome : 'Giochi del canale';
    var st;
    if (stato.inGioco) {
      g = stato.inGioco; st = 'In partita';
    } else if (stato.coda) {
      st = stato.coda.trovato ? 'Avversari trovati · si parte'
        : 'In coda pubblica · ' + mmss(Math.floor((Date.now() - stato.coda.t0) / 1000));
    } else if (stato.sala) {
      var gioca = stato.sala.posti.filter(function (x) { return !x.guarda; });
      st = 'In sala: ' + gioca.filter(function (x) { return x.st === 'pronto'; }).length + ' di ' + gioca.length + ' pronti';
    } else st = g ? 'Scelto · ' + giocatori(g) + ' giocatori · ' + g.durata : 'Ingrandisci per scegliere un gioco';
    $('p-stato').textContent = st;
    var max = 5;
    $('p-facce').innerHTML = stato.gente.slice(0, max).map(avatar).join('') + (n > max ? '<em>+' + (n - max) + '</em>' : '');
  }

  /* ───────── eventi ───────── */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-id]');
    if (t && (t.classList.contains('riga') || t.classList.contains('slide'))) { apri(t.dataset.id); return; }
    var f = e.target.closest('[data-f]');
    if (f) {
      stato.filtro = f.dataset.f; disegnaFiltri(); disegnaCatalogo();
      f = $('filtri').querySelector('[data-f="' + stato.filtro + '"]');
      if (f) f.scrollIntoView({block: 'nearest', inline: 'center', behavior: 'smooth'});
      var st = $('strumenti');
      if (st.getBoundingClientRect().top <= 1) window.scrollTo({top: st.offsetTop, behavior: 'smooth'});
    }
  });
  $('velo').addEventListener('click', function (e) { if (e.target === this) chiudi(); });
  $('f-var').addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('button[data-v]') : null;
    if (!b || !stato.aperto) return;
    var v = b.getAttribute('data-v');
    window.GXD.variante = window.GXD.variante || {};
    window.GXD.variante[stato.aperto.id] = v;
    if (stato.aperto.id === 'uno') window.GXD.unoVariante = v;   // come prima del lotto 5
    [].forEach.call(this.querySelectorAll('button'), function (x) {
      x.classList.toggle('su', x === b); x.setAttribute('aria-checked', x === b ? 'true' : 'false');
    });
  });
  $('chiudi').addEventListener('click', chiudi);
  $('t-canale').addEventListener('click', function () { var g = stato.aperto; if (!g) return; chiudi(); apriSala(g, 'canale'); });
  $('t-bot').addEventListener('click', function () {
    var g = stato.aperto; if (!g || !g.bot) return; chiudi();
    if (window.GXD.praticaLocale(g.id)) { avviaGioco(g, null, {pratica: true}); return; }   // anche fuori da Discord
    apriSala(g, 'bot');
  });
  $('s-esci').addEventListener('click', chiudiSala);
  $('s-bot').addEventListener('click', function () { var S = stato.sala; if (!S || !S.vera) return; S.conBot = !S.conBot; disegnaSala(); });
  $('t-coda').addEventListener('click', function () { var g = stato.aperto; if (!g) return; chiudi(); apriCoda(g); });
  $('c-annulla').addEventListener('click', function () { chiudiCoda(stato.coda && stato.coda.trovato ? '' : 'Ricerca annullata'); });
  $('s-via').addEventListener('click', function () {
    if (this.disabled) return;
    if (stato.sala && stato.sala.vera) { if (stato.sala.h) stato.sala.h.avvia(stato.sala.conBot); stato.sala.partito = true; disegnaSala(); return; }
    toast('Prototipo: qui parte ' + stato.sala.g.nome + ' per tutta la sala.');
    chiudiSala();
  });
  document.addEventListener('keydown', function (e) {
    if (stato.inGioco) return;
    if (window.GXTorneo && window.GXTorneo.aperto()) return;   // lotto 10: Esc chiude il torneo, non il resto
    if (e.key === 'Escape') { if (stato.coda) chiudiCoda('Ricerca annullata'); else if (stato.sala) chiudiSala(); else if (stato.aperto) chiudi(); }
  });
  var inp = $('cerca');
  inp.addEventListener('input', function () {
    stato.testo = inp.value.trim().toLowerCase();
    $('via').classList.toggle('nascosto', !inp.value);
    disegnaCatalogo();
  });
  $('via').addEventListener('click', function () { inp.value = ''; inp.dispatchEvent(new Event('input')); inp.focus(); });
  addEventListener('resize', controllaPip);

  /* lotto 10: quello che serve ai tornei del canale (torneo.js) */
  window.GXCat = {stato: stato, toast: toast, disegnaPip: disegnaPip, PER_ID: PER_ID};
  window.GXD.toast = toast;

  /* ───────── avvio ───────── */
  disegnaCarosello();
  controllaPip();
  window.GXD.onLayout(function (m) { layoutDiscord = m; controllaPip(); });
  window.GXD.onPartecipanti(function (lista) { stato.gente = lista; disegnaCanale(); });
  window.GXD.avvia().then(function (r) {
    stato.io = r.io; stato.gente = r.partecipanti; stato.instanceId = r.instanceId;
    $('nome-canale').textContent = r.canale + (r.modo === 'finto' ? ' · dati di prova' : '');
    disegnaCanale();
    diagnosi();
  });
  /* 16/11 (fase di prova): dentro Discord, ogni errore si VEDE in un riquadro in basso (per la foto da mandare) */
  function diagnosi() {
    var G = window.GXD; if (!G.dentroDiscord) return;
    var righe = [].concat(G.erroreAvvio ? ['avvio: ' + G.erroreAvvio] : [], G.avvisi || []);
    var box = document.getElementById('gx-diag');
    if (!righe.length) { if (box) box.remove(); return; }
    if (!box) {
      box = document.createElement('div'); box.id = 'gx-diag';
      box.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;z-index:99999;background:rgba(40,0,0,.92);color:#ffb4b4;' +
        'font:12px/1.35 ui-monospace,Consolas,monospace;padding:8px 10px;border-radius:10px;max-height:34vh;overflow:auto;white-space:pre-wrap';
      box.title = 'tocca per chiudere'; box.addEventListener('click', function () { box.remove(); });
      document.body.appendChild(box);
    }
    box.textContent = 'DIAGNOSI (manda una foto di questo riquadro)' + String.fromCharCode(10) + righe.slice(-12).join(String.fromCharCode(10));
  }
  window.GXDiagnosi = diagnosi;
  window.addEventListener('error', function (e) {
    (window.GXD.avvisi = window.GXD.avvisi || []).push('js: ' + (e.message || (e.target && (e.target.src || e.target.href)) || 'errore') +
      (e.filename ? ' @' + String(e.filename).split('/').pop() + ':' + e.lineno : ''));
    diagnosi();
  }, true);
  window.addEventListener('unhandledrejection', function (e) {
    window.GXD.avvisi.push('promise: ' + ((e.reason && e.reason.message) || e.reason)); diagnosi();
  });
})();
