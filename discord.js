/* Strato Discord del catalogo (fase 1, 15/11/2026).
   Due modi:
   - VERO  (dentro Discord: la pagina arriva con ?frame_id=...&instance_id=...): Embedded App SDK
           impacchettato in vendor/discord-sdk.js, login vero (authorize -> /api/discord/token ->
           authenticate), partecipanti dell'istanza, finestrella, partite gratis sul nostro server.
   - FINTO (aperto fuori da Discord): partecipanti e utente inventati, nessuna chiamata al server.
   Il resto della pagina parla SOLO con window.GXD.

   Indirizzi (URL mapping sul Developer Portal; Discord TOGLIE il prefisso):
     /api/discord/*  -> 62-238-17-24.sslip.io/discord/*   (backend)
     /api/turfws     -> 62-238-17-24.sslip.io/turfws      (server real-time, WebSocket)
     /avatar/*       -> cdn.discordapp.com/*              (foto profilo)
   Tutto relativo alla pagina: nessun CDN, nessun indirizzo esterno. */
(function () {
  'use strict';

  var CFG = window.GX_CONFIG || {};
  var CLIENT_ID = CFG.clientId || '';
  var API = CFG.apiBase || '/api';
  var AVATAR_PREFIX = CFG.avatarPrefix || '/avatar';
  var GIOCHI_ATTIVI = CFG.giochiAttivi || ['pong'];
  // fase 2: i giochi che si aprono dalla MINI APP online (app.html, mapping /app) invece che da un client nostro
  var GIOCHI_APP = CFG.giochiApp || [];
  // lotto 2: nel catalogo c'e' un solo «UNO»; sul server sono due giochi (classico «unoc», No Mercy «uno»).
  // La scheda del gioco sceglie la variante (GXD.unoVariante); sale, code e biglietti sono per variante.
  function srv(g) { return g === 'uno' ? ((window.GXD && GXD.unoVariante) || 'unoc') : varianteDi(g); }
  // lotto 5: Biliardo (pool8/pool15) e Dama (dama/damaru) come UNO: la variante scelta nella scheda, di serie la prima
  function varianteDi(g) {
    if (g === 'uno') return (window.GXD && GXD.unoVariante) || 'unoc';
    var VV = (window.GX_VARIANTI || {})[g], v = window.GXD && GXD.variante && GXD.variante[g];
    if (!VV) return g;
    for (var i = 0; i < VV.length; i++) if (VV[i][0] === v) return v;
    return VV[0][0];
  }

  var q = new URLSearchParams(location.search);
  var dentroDiscord = q.has('frame_id') && q.has('instance_id');

  var ascoltaPart = [], ascoltaLayout = [];
  function avvisa(lista, x) { lista.forEach(function (f) { try { f(x); } catch (e) { console.error(e); } }); }

  /* ───────────── modo FINTO ───────────── */
  var FINTI = [
    {id: '1', nome: 'Marta',   colore: '#8b83f0'}, {id: '2', nome: 'Davide',  colore: '#5ac8fa'},
    {id: '3', nome: 'Giulia',  colore: '#ff9f0a'}, {id: '4', nome: 'Kevin',   colore: '#30d158'},
    {id: '5', nome: 'Sara',    colore: '#ff6482'}, {id: '6', nome: 'Luca',    colore: '#64d2ff'},
    {id: '7', nome: 'Anna',    colore: '#bf5af2'}, {id: '8', nome: 'Pietro',  colore: '#ffd60a'}
  ];
  function finto() {
    var n = Math.max(1, Math.min(8, parseInt(q.get('n') || '5', 10) || 5));
    var parte = FINTI.slice(0, n);
    if (q.get('pip') === '1') setTimeout(function () { avvisa(ascoltaLayout, 'pip'); }, 0);
    return Promise.resolve({modo: 'finto', io: parte[0], partecipanti: parte, instanceId: 'prova-' + n, canale: 'Vocale · Serata giochi'});
  }

  /* ───────────── modo VERO ───────────── */
  function caricaSdk() {
    if (window.DiscordEmbedded) return Promise.resolve(window.DiscordEmbedded);
    return new Promise(function (ok, ko) {
      var s = document.createElement('script');
      s.src = 'vendor/discord-sdk.js';
      s.onload = function () { window.DiscordEmbedded ? ok(window.DiscordEmbedded) : ko(new Error('SDK assente')); };
      s.onerror = function () { ko(new Error('vendor/discord-sdk.js non trovato')); };
      document.head.appendChild(s);
    });
  }
  function foto(id, hash) {
    if (!hash) return '';
    var did = String(id).replace(/^dc:/, '');
    return AVATAR_PREFIX + '/avatars/' + encodeURIComponent(did) + '/' + encodeURIComponent(hash) + '.png?size=64';
  }
  var COLORI = ['#8b83f0', '#5ac8fa', '#ff9f0a', '#30d158', '#ff6482', '#64d2ff', '#bf5af2', '#ffd60a'];
  function colore(id) { var s = 0, t = String(id); for (var i = 0; i < t.length; i++) s += t.charCodeAt(i); return COLORI[s % COLORI.length]; }
  function dalDiscord(u) {
    var user = u.user || u;
    var nome = u.nickname || user.global_name || user.username || 'Giocatore';
    return {id: 'dc:' + user.id, nome: nome, foto: foto(user.id, user.avatar), colore: colore(user.id)};
  }
  function dalServer(p) {   // {id:'dc:..', nome, avatar}
    return {id: p.id, nome: p.nome || 'Giocatore', foto: foto(p.id, p.avatar), colore: colore(p.id)};
  }
  function api(metodo, path, corpo) {
    var h = {'Content-Type': 'application/json'};
    if (GXD.sessione) h.Authorization = 'Bearer ' + GXD.sessione;
    return fetch(API + path, {method: metodo, headers: h, body: corpo ? JSON.stringify(corpo) : undefined})
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._codice = r.status; return j; }); });
  }
  function vero() {
    var sdk, ev;
    return caricaSdk().then(function (lib) {
      ev = lib.Events;
      sdk = new lib.DiscordSDK(CLIENT_ID);
      GXD.sdk = sdk;
      return sdk.ready();
    }).then(function () {
      return sdk.commands.authorize({client_id: CLIENT_ID, response_type: 'code', state: '', prompt: 'none', scope: ['identify', 'guilds']});
    }).then(function (r) {
      // il nostro server scambia il code col token (client_secret solo lato server) e apre la sessione GRATIS
      return api('POST', '/discord/token', {code: r.code, instance_id: sdk.instanceId}).then(function (t) {
        if (!t.ok) throw new Error('token ' + t._codice);
        return t;
      });
    }).then(function (t) {
      GXD.sessione = t.sessione || null;
      // lotto 2: un gioco e' acceso solo se lo e' ANCHE sul server (le Pages possono arrivare prima del backend)
      api('GET', '/discord/me').then(function (m) {
        if (m && m.ok && m.giochi && m.giochi.length) GIOCHI_ATTIVI = GIOCHI_ATTIVI.filter(function (g) { return m.giochi.indexOf(g) >= 0 || g === 'gembrawl'; });   // GEMBRAWL_2811: allenamento solo nella pagina
      }, function () {});
      // 16/11: dopo il login col NOSTRO server non si torna MAI al finto; ogni passo dopo e' facoltativo
      var ioSrv = t.io ? dalServer(t.io) : null;
      return Promise.resolve().then(function () { return sdk.commands.authenticate({access_token: t.access_token}); })
        .then(function (auth) { return (auth && auth.user) ? dalDiscord(auth.user) : ioSrv; },
              function (e) { GXD.avvisi.push('authenticate: ' + (e && e.message)); return ioSrv; });
    }).then(function (io) {
      if (!io) throw new Error('utente sconosciuto');
      try {
        Promise.resolve(sdk.subscribe(ev.ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE, function (d) {
          avvisa(ascoltaPart, (d.participants || []).map(dalDiscord));
        })).catch(function (e) { GXD.avvisi.push('partecipanti: ' + (e && e.message)); });
      } catch (e) { GXD.avvisi.push('partecipanti: ' + (e && e.message)); }
      // 0 = a tutto schermo, 1 = finestrella (PIP), 2 = griglia
      var suLayout = function (d) { avvisa(ascoltaLayout, d.layout_mode === 1 ? 'pip' : (d.layout_mode === 2 ? 'griglia' : 'pieno')); };
      try { if (sdk.subscribeToLayoutModeUpdatesCompat) sdk.subscribeToLayoutModeUpdatesCompat(suLayout); } catch (e) { console.warn(e); }
      var esito = function (parte) {
        if (!parte.some(function (p) { return p.id === io.id; })) parte.unshift(io);
        return {modo: 'vero', io: io, partecipanti: parte, instanceId: sdk.instanceId, canale: 'Canale vocale'};
      };
      return Promise.resolve().then(function () { return sdk.commands.getActivityInstanceConnectedParticipants(); })
        .then(function (r) { return esito(((r && r.participants) || []).map(dalDiscord)); },
              function (e) { GXD.avvisi.push('elenco canale: ' + (e && e.message)); return esito([]); });
    });
  }

  /* poll: chiama fn ogni `ms` finche' non torna true; {ferma()} */
  function giro(fn, ms) {
    var t = null, fermo = false;
    function passo() { if (fermo) return; Promise.resolve(fn()).then(function (fine) { if (!fine && !fermo) t = setTimeout(passo, ms); }, function () { if (!fermo) t = setTimeout(passo, ms * 2); }); }
    passo();
    return {ferma: function () { fermo = true; clearTimeout(t); }};
  }

  var GXD = window.GXD = {
    dentroDiscord: dentroDiscord, vero: false, avvisi: [], erroreAvvio: '',
    sdk: null, sessione: null, io: null,
    avvia: function () {
      var p = (dentroDiscord && CLIENT_ID) ? vero().then(function (r) { GXD.vero = true; return r; }, function (e) {
        console.warn('[GXD] Discord non pronto:', e && e.message);
        GXD.erroreAvvio = String((e && e.message) || e || 'errore');
        if (GXD.sessione) { GXD.vero = true; return {modo: 'vero', io: {id: 'dc:?', nome: 'Tu', foto: '', colore: '#8b83f0'}, partecipanti: [], instanceId: (GXD.sdk && GXD.sdk.instanceId) || '', canale: 'Canale vocale'}; }
        return finto();
      }) : finto();
      return p.then(function (r) { GXD.io = r.io; return r; });
    },
    onPartecipanti: function (f) { ascoltaPart.push(f); },
    onLayout: function (f) { ascoltaLayout.push(f); },
    /* nel modo vero solo i giochi accesi sul server (fase 1: Neon Pong); nel finto tutti, come nel prototipo */
    varianteDi: varianteDi,
    attivo: function (gioco) { return !GXD.vero || GIOCHI_ATTIVI.indexOf(gioco) >= 0; },
    avatar: foto,

    /* PARTITA: modo 'bot' (allenamento) o 'canale' (stanza dc:<instanceId>:<gioco>).
       onStato riceve {stato:'attesa', in_sala:[persone], posti} poi {stato:'via', ticket, avversari, pratica}
       oppure {stato:'errore', errore}. Torna {annulla()}. */
    avviaPartita: function (gioco, modo, instanceId, onStato) {
      if (!GXD.vero) {
        var t = setTimeout(function () { onStato({stato: 'finto'}); }, 400);
        return {annulla: function () { clearTimeout(t); }};
      }
      if (modo === 'bot') {
        var annullato = false;
        api('POST', '/discord/partita', {gioco: srv(gioco), modo: 'bot'}).then(function (r) {
          if (annullato) return;
          if (r.ok && r.ticket) onStato({stato: 'via', ticket: r.ticket, avversari: [], pratica: true});
          else onStato({stato: 'errore', errore: r.errore || ('http ' + r._codice)});
        }, function () { if (!annullato) onStato({stato: 'errore', errore: 'rete'}); });
        return {annulla: function () { annullato = true; }};
      }
      var primo = true, finito = false;
      var g = giro(function () {
        var p = primo ? api('POST', '/discord/partita', {gioco: srv(gioco), modo: 'canale', instance_id: instanceId})
                      : api('GET', '/discord/partita?gioco=' + encodeURIComponent(srv(gioco)));
        primo = false;
        return p.then(function (r) {
          if (finito) return true;
          if (!r.ok) { onStato({stato: 'errore', errore: r.errore || ('http ' + r._codice)}); return true; }
          if (r.stato === 'via') {
            finito = true;
            onStato({stato: 'via', ticket: r.ticket, avversari: (r.avversari || []).map(dalServer), stanza: r.stanza});
            return true;
          }
          onStato({stato: 'attesa', in_sala: (r.in_sala || []).map(dalServer), posti: r.posti, min: r.min || r.posti, bot: !!r.bot,
                   pieno: r.pieno, stanza: r.stanza});
          return false;
        });
      }, 1200);
      return {annulla: function () {
        if (finito) return;
        finito = true; g.ferma();
        api('DELETE', '/discord/partita', {gioco: srv(gioco)});
      }, avvia: function (bot) {
        // «Inizia la partita» (giochi da 2 a 4): parte con chi c'e'; bot=true i posti vuoti ai bot del motore
        if (finito) return;
        api('POST', '/discord/partita', {gioco: srv(gioco), modo: 'canale', instance_id: instanceId, avvia: 1, bot: bot ? 1 : 0});
      }};
    },

    /* CODA GRATIS PUBBLICA: avversari sconosciuti (non del canale). Solo gratis.
       POST /api/discord/coda {gioco} -> {ticket}; poi GET /api/discord/coda/<ticket> ogni 1,2 s;
       DELETE per uscire. (Il poll al posto di un WebSocket: nessuna URL mapping in piu', e la coda
       resta tutta nel backend, in un registro separato da quelle a soldi.) */
    cercaAvversari: function (gioco, posti, onStato) {
      if (GXD.vero) return codaVera(gioco, onStato);
      return codaFinta(gioco, posti, onStato);
    },

    /* apre il gioco dentro questa pagina (la sessione dell'SDK resta viva) */
    apriGioco: function (gioco, ticket, opz) {
      return caricaGioco(gioco).then(function () {
        var proto = location.protocol === 'https:' ? 'wss://' : 'ws://';
        var wsUrl = CFG.wsUrl || (proto + location.host + API + '/turfws');
        if (GIOCHI_APP.indexOf(gioco) >= 0 && window.GXApp) {
          return window.GXApp.avvia({gioco: srv(gioco), ticket: ticket, pratica: !!opz.pratica, guarda: opz.guarda || '', onFine: opz.onFine});
        }
        if (gioco === 'gembrawl' && window.GXGemBrawl) {   // GEMBRAWL_2811: gembrawl.html in un iframe, coi bot tutto nella pagina
          return window.GXGemBrawl.avvia({pratica: true, io: GXD.io, onFine: opz.onFine});
        }
        if (gioco === 'smash' && window.GXSmash) {
          // Smash: la pagina del gioco (arena.html) in un iframe; l'allenamento coi bot gira tutto li' dentro
          return window.GXSmash.avvia({pratica: !!opz.pratica, ticket: ticket, sessione: GXD.sessione, wsUrl: wsUrl,
                                       io: GXD.io, onFine: opz.onFine});
        }
        if (gioco !== 'pong' || !window.GXPong) throw new Error('gioco non disponibile');
        var fotoMap = {};
        (opz.persone || []).forEach(function (p) { if (p.foto) fotoMap[p.id] = p.foto; });
        if (GXD.io && GXD.io.foto) fotoMap[GXD.io.id] = GXD.io.foto;
        return window.GXPong.avvia({
          ticket: ticket, sessione: GXD.sessione, wsUrl: wsUrl,
          io: GXD.io, foto: fotoMap, pratica: !!opz.pratica, onFine: opz.onFine
        });
      });
    },
    /* i giochi il cui allenamento coi bot gira tutto nella pagina (niente server, anche fuori da Discord) */
    praticaLocale: function (gioco) { return gioco === 'smash' || gioco === 'gembrawl'; }
  };

  var caricati = {};
  function caricaGioco(gioco) {
    if (GIOCHI_APP.indexOf(gioco) >= 0) gioco = 'app';
    if (caricati[gioco]) return caricati[gioco];
    caricati[gioco] = new Promise(function (ok, ko) {
      var c = document.createElement('link'); c.rel = 'stylesheet'; c.href = 'giochi/' + gioco + '/' + gioco + '.css?v=2811gb';
      document.head.appendChild(c);
      var s = document.createElement('script'); s.src = 'giochi/' + gioco + '/' + gioco + '.js?v=2811gb';
      s.onload = ok; s.onerror = function () { caricati[gioco] = null; ko(new Error('gioco non trovato')); };
      document.head.appendChild(s);
    });
    return caricati[gioco];
  }

  function codaVera(gioco, onStato) {
    var ticket = null, chiusa = false, g = null;
    api('POST', '/discord/coda', {gioco: srv(gioco)}).then(function (r) {
      if (!r.ok || !r.ticket) { onStato({stato: 'errore', errore: r.errore}); return; }
      ticket = r.ticket;
      if (chiusa) return esci();
      var primo = r;
      g = giro(function () {
        var p = primo ? Promise.resolve(primo) : api('GET', '/discord/coda/' + encodeURIComponent(ticket));
        primo = null;
        return p.then(function (m) {
          if (chiusa) return true;
          if (!m.ok) { onStato({stato: 'errore', errore: m.errore}); return true; }
          if (m.stato === 'trovato') {
            onStato({stato: 'trovato', avversari: (m.avversari || []).map(dalServer), stanza: m.stanza, ticket: m.stanza});   // il biglietto della PARTITA (m.ticket e' quello della coda)
            return true;
          }
          onStato({stato: 'in_coda', in_coda: m.in_coda || 1, avversari: [], pieno: m.pieno});
          return false;
        });
      }, 1200);
    }, function () { onStato({stato: 'errore', errore: 'rete'}); });
    function esci() { if (ticket) api('DELETE', '/discord/coda/' + encodeURIComponent(ticket)); }
    return {annulla: function (trovata) { if (chiusa) return; chiusa = true; if (g) g.ferma(); if (!trovata) esci(); }};
  }

  var SCONOSCIUTI = [
    {id: 'x1', nome: 'Nova_88', colore: '#5e5ce6'}, {id: 'x2', nome: 'kaze', colore: '#ff9f0a'},
    {id: 'x3', nome: 'Pietro.R', colore: '#64d2ff'}, {id: 'x4', nome: 'luna', colore: '#ff375f'},
    {id: 'x5', nome: 'Tommi', colore: '#32d74b'}, {id: 'x6', nome: 'ElRojo', colore: '#ffd60a'},
    {id: 'x7', nome: 'Mirta', colore: '#bf5af2'}, {id: 'x8', nome: 'Gabo', colore: '#ac8e68'},
    {id: 'x9', nome: 'Ines', colore: '#30b0c7'}
  ];
  function codaFinta(gioco, posti, onStato) {
    var lenta = q.get('coda') === 'lenta';
    var seme = 0; for (var i = 0; i < gioco.length; i++) seme += gioco.charCodeAt(i);
    var inCoda = 3 + seme % 11, t = [], trovati = [];
    t.push(setInterval(function () {
      inCoda = Math.max(1, inCoda + ((Date.now() / 1000 | 0) % 3) - 1);
      onStato({stato: 'in_coda', in_coda: inCoda, avversari: trovati.slice()});
    }, 1000));
    onStato({stato: 'in_coda', in_coda: inCoda, avversari: []});
    if (!lenta) {
      var serve = Math.max(1, posti - 1);
      for (var k = 0; k < serve; k++) (function (k) {
        t.push(setTimeout(function () {
          trovati.push(SCONOSCIUTI[(seme + k) % SCONOSCIUTI.length]);
          if (trovati.length === serve) {
            t.forEach(function (x) { clearInterval(x); clearTimeout(x); });
            onStato({stato: 'trovato', avversari: trovati.slice(), stanza: 'gratis:discord:' + gioco + ':prova'});
          } else onStato({stato: 'in_coda', in_coda: inCoda, avversari: trovati.slice()});
        }, 3200 + k * 900));
      })(k);
    }
    return {annulla: function () { t.forEach(function (x) { clearInterval(x); clearTimeout(x); }); }};
  }
})();
