/* Strato Discord del catalogo (prototipo 15/11/2026).
   Due modi:
   - FINTO  (aperto da file o da un server locale): partecipanti, utente e layout inventati.
   - VERO   (aperto dentro Discord, con il client_id messo in GX_CONFIG): usa l'Embedded App SDK.
   Il resto della pagina parla SOLO con window.GXD, quindi passare dal finto al vero non tocca la grafica.

   Per il modo vero serve (vedi PIANO.md):
   1) vendor/discord-sdk.js = il pacchetto npm @discord/embedded-app-sdk impacchettato come script
      classico che espone window.DiscordEmbedded = {DiscordSDK, Events, patchUrlMappings}
      (es. esbuild entry.js --bundle --format=iife --outfile=vendor/discord-sdk.js).
      Va servito dal NOSTRO dominio: dentro Discord i CDN esterni sono bloccati dal CSP.
   2) una rotta del nostro server che scambia il "code" con il token (il client_secret NON sta mai nella pagina).
   3) URL mapping sul portale: "/" -> Pages del catalogo, "/api" -> backend, "/avatar" -> cdn.discordapp.com. */
(function () {
  'use strict';

  var CFG = window.GX_CONFIG || {};
  var CLIENT_ID = CFG.clientId || '';              // vuoto = modo finto
  var TOKEN_URL = CFG.tokenUrl || '/api/discord/token';
  var AVATAR_PREFIX = CFG.avatarPrefix || '/avatar'; // URL mapping verso cdn.discordapp.com

  var q = new URLSearchParams(location.search);
  // Discord apre l'Activity con ?frame_id=...&instance_id=...&platform=...
  var dentroDiscord = q.has('frame_id') && q.has('instance_id');

  var ascoltaPart = [], ascoltaLayout = [];
  function avvisa(lista, x) { lista.forEach(function (f) { try { f(x); } catch (e) { console.error(e); } }); }

  /* ───────────── modo FINTO ───────────── */
  var FINTI = [
    {id: '1', nome: 'Marta',   colore: '#8b83f0'},
    {id: '2', nome: 'Davide',  colore: '#5ac8fa'},
    {id: '3', nome: 'Giulia',  colore: '#ff9f0a'},
    {id: '4', nome: 'Kevin',   colore: '#30d158'},
    {id: '5', nome: 'Sara',    colore: '#ff6482'},
    {id: '6', nome: 'Luca',    colore: '#64d2ff'},
    {id: '7', nome: 'Anna',    colore: '#bf5af2'},
    {id: '8', nome: 'Pietro',  colore: '#ffd60a'}
  ];
  function finto() {
    // ?n=3 per provare con meno persone nel vocale (1..8), ?pip=1 per la finestrella
    var n = Math.max(1, Math.min(8, parseInt(q.get('n') || '5', 10) || 5));
    var parte = FINTI.slice(0, n);
    var io = parte[0];
    if (q.get('pip') === '1') setTimeout(function () { avvisa(ascoltaLayout, 'pip'); }, 0);
    return Promise.resolve({
      modo: 'finto', io: io, partecipanti: parte,
      instanceId: 'prova-' + n, canale: 'Vocale · Serata giochi'
    });
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
  function dalDiscord(u) {
    var user = u.user || u;
    var nome = u.nickname || user.global_name || user.username || 'Giocatore';
    var foto = user.avatar ? (AVATAR_PREFIX + '/avatars/' + user.id + '/' + user.avatar + '.png?size=64') : '';
    return {id: user.id, nome: nome, foto: foto, colore: '#8b83f0'};
  }
  function vero() {
    var sdk, ev;
    return caricaSdk().then(function (lib) {
      ev = lib.Events;
      sdk = new lib.DiscordSDK(CLIENT_ID);
      GXD.sdk = sdk;
      return sdk.ready();
    }).then(function () {
      return sdk.commands.authorize({
        client_id: CLIENT_ID, response_type: 'code', state: '', prompt: 'none',
        scope: ['identify', 'guilds', 'applications.commands']
      });
    }).then(function (r) {
      // il nostro server scambia il code col token (client_secret solo lato server) e apre la sessione GRATIS
      return fetch(TOKEN_URL, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({code: r.code, instance_id: sdk.instanceId})
      }).then(function (x) { if (!x.ok) throw new Error('token ' + x.status); return x.json(); });
    }).then(function (t) {
      GXD.sessione = t.sessione || null;              // gettone NOSTRO per le partite gratis
      return sdk.commands.authenticate({access_token: t.access_token});
    }).then(function (auth) {
      if (!auth) throw new Error('authenticate fallito');
      var io = dalDiscord(auth.user);
      sdk.subscribe(ev.ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE, function (d) {
        avvisa(ascoltaPart, (d.participants || []).map(dalDiscord));
      });
      // 0 = a tutto schermo, 1 = finestrella (PIP), 2 = griglia
      var suLayout = function (d) { avvisa(ascoltaLayout, d.layout_mode === 1 ? 'pip' : (d.layout_mode === 2 ? 'griglia' : 'pieno')); };
      if (sdk.subscribeToLayoutModeUpdatesCompat) sdk.subscribeToLayoutModeUpdatesCompat(suLayout);
      return sdk.commands.getActivityInstanceConnectedParticipants().then(function (r) {
        return {
          modo: 'vero', io: io, partecipanti: (r.participants || []).map(dalDiscord),
          instanceId: sdk.instanceId, canale: 'Canale vocale'
        };
      });
    });
  }

  var GXD = window.GXD = {
    dentroDiscord: dentroDiscord,
    sdk: null, sessione: null,
    avvia: function () {
      if (dentroDiscord && CLIENT_ID) {
        return vero().catch(function (e) {
          console.warn('[GXD] Discord non pronto, uso i dati finti:', e && e.message);
          return finto();
        });
      }
      return finto();
    },
    onPartecipanti: function (f) { ascoltaPart.push(f); },
    onLayout: function (f) { ascoltaLayout.push(f); },
    /* Avvia un gioco per il canale o da soli coi bot.
       Nel modo vero chiamera' il NOSTRO server: POST /api/discord/partita {gioco, modo:'canale'|'bot', instance_id}
       e il server, legando la stanza all'instanceId, mette nella stessa lobby chi e' nel vocale. Nessun soldo. */
    avviaPartita: function (gioco, modo, instanceId) {
      if (GXD.sdk && GXD.sessione) {
        return fetch('/api/discord/partita', {
          method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GXD.sessione},
          body: JSON.stringify({gioco: gioco, modo: modo, instance_id: instanceId})
        }).then(function (x) { return x.json(); });
      }
      return new Promise(function (ok) { setTimeout(function () { ok({finto: true, stanza: instanceId + ':' + gioco}); }, 400); });
    },

    /* CODA GRATIS PUBBLICA: avversari sconosciuti (non del canale). Solo gratis: nessuna posta, nessun premio.
       Deciso dal proprietario: le code a soldi restano SOLO su Telegram.
       Modo vero (da costruire sul server, separato dalle code a soldi):
         POST   /api/discord/coda {gioco, posti}        -> {ticket}          (Authorization: Bearer <sessione Discord>)
         WS     /rt/discord/coda?ticket=...             -> messaggi {stato:'in_coda', in_coda:N, avversari:[...]}
                                                           {stato:'trovato', avversari:[{id,nome,foto}], stanza}
         DELETE /api/discord/coda/<ticket>              -> esce dalla coda (tasto Annulla, o pagina chiusa)
       Sul server: una coda per gioco con chiave 'gratis:discord:<gioco>', in un registro DIVERSO da quello delle code
       a soldi (stake/buy-in/escrow non esistono qui); la stanza nasce con origine='discord', gratis=True, posta 0.
       Chiamata: GXD.cercaAvversari(gioco, posti, onStato) -> {annulla()}; onStato riceve gli stessi messaggi del WS. */
    cercaAvversari: function (gioco, posti, onStato) {
      if (GXD.sdk && GXD.sessione) return codaVera(gioco, posti, onStato);
      return codaFinta(gioco, posti, onStato);
    }
  };

  function codaVera(gioco, posti, onStato) {
    var ws = null, ticket = null, chiusa = false;
    var h = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GXD.sessione};
    fetch('/api/discord/coda', {method: 'POST', headers: h, body: JSON.stringify({gioco: gioco, posti: posti})})
      .then(function (x) { return x.json(); })
      .then(function (r) {
        ticket = r.ticket; if (chiusa) return annulla();
        ws = new WebSocket('wss://' + location.host + '/rt/discord/coda?ticket=' + encodeURIComponent(ticket));
        ws.onmessage = function (e) { try { onStato(JSON.parse(e.data)); } catch (x) { console.error(x); } };
      }).catch(function (e) { onStato({stato: 'errore', messaggio: e && e.message}); });
    function annulla() {
      chiusa = true;
      if (ws) try { ws.close(); } catch (e) {}
      if (ticket) fetch('/api/discord/coda/' + encodeURIComponent(ticket), {method: 'DELETE', headers: h});
    }
    return {annulla: annulla};
  }

  var SCONOSCIUTI = [
    {id: 'x1', nome: 'Nova_88', colore: '#5e5ce6'}, {id: 'x2', nome: 'kaze', colore: '#ff9f0a'},
    {id: 'x3', nome: 'Pietro.R', colore: '#64d2ff'}, {id: 'x4', nome: 'luna', colore: '#ff375f'},
    {id: 'x5', nome: 'Tommi', colore: '#32d74b'}, {id: 'x6', nome: 'ElRojo', colore: '#ffd60a'},
    {id: 'x7', nome: 'Mirta', colore: '#bf5af2'}, {id: 'x8', nome: 'Gabo', colore: '#ac8e68'},
    {id: 'x9', nome: 'Ines', colore: '#30b0c7'}
  ];
  function codaFinta(gioco, posti, onStato) {
    // ?coda=lenta: non trova mai nessuno (per vedere la ricerca); di base trova dopo ~4 s
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
