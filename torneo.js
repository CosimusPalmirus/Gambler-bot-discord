/* LOTTO 10 (17/11/2026) — TORNEI NEL CANALE VOCALE, solo gratis.
   Il server decide tutto (sorteggio, esiti, tempi): qui si mostra e si mandano solo le azioni
   (crea, entra, esci, avvia, annulla, ritirati). Le partite si aprono con GXD.apriGioco e il biglietto del server.
   Parla col backend su /api/discord/torneo (stessa sessione del catalogo). Niente soldi, niente premi: si gioca per gioco.
   Dipende da discord.js (window.GXD) e da app.js (window.GXCat). Spec: fase2/lotto10/SPEC.md */
(function () {
  'use strict';
  var GXD = window.GXD, CAT = function () { return window.GXCat || {}; };
  var CFG = window.GX_CONFIG || {}, API = CFG.apiBase || '/api';
  var q = new URLSearchParams(location.search);
  var LINGUA = (q.get('lang') || navigator.language || 'it').toLowerCase().indexOf('it') === 0 ? 'it' : 'en';
  var TX = {
    it: {
      torneo: 'Torneo', torneo_canale: 'Torneo nel canale', crea_sotto: 'Un tabellone per chi è nel vocale: scegli il gioco, gli altri entrano.',
      crea: 'Crea un torneo', apri: 'Apri', entra: 'Entra', esci: 'Esci', inizia: 'Inizia ora', annulla: 'Annulla il torneo',
      ritirati: 'Ritirati', chiudi: 'Chiudi', gioca_ora: 'Gioca ora', torna_gioco: 'Torna in partita', torna_torneo: 'Torna al torneo',
      nuovo: 'Nuovo torneo', scegli_gioco: 'Scegli il gioco', posti: 'Posti', bot: 'Posti vuoti ai bot', bot_si: 'I posti vuoti li prendono i bot',
      bot_no: 'Solo persone: i buchi passano il turno', apri_iscr: 'Apri le iscrizioni', iscrizioni: 'Iscrizioni', chiude_tra: 'si parte tra',
      iscritti: '{n} di {m} iscritti', posto_libero: 'Posto libero', sei_dentro: 'Sei dentro', creatore: 'ha creato il torneo',
      aspetta_crea: 'Aspetta che {c} faccia partire il torneo (o che si riempia).', serve_uno: 'Serve almeno un altro iscritto (o i bot).',
      in_diretta: 'In diretta', finito: 'Finito', annullato: 'Annullato', tu: 'tu',
      finale: 'Finale', semi: 'Semifinali', quarti: 'Quarti', ottavi: 'Ottavi', turno: 'Turno {n}',
      in_corso: 'in corso {t}', simulata: 'bot contro bot · {t}', attesa: 'in attesa', pronta: 'si entra', passa: 'passa il turno',
      tavolo: 'in attesa di un tavolo libero', m_gioco: '', m_assente: 'a tavolino', m_assenti: 'a sorte, assenti', m_ritiro: 'ritirato',
      m_sorte: 'a sorte', m_pari: 'pari, a sorte', m_usciti: 'usciti, a sorte', m_interrotta: 'interrotta, a sorte', m_simulata: 'simulata',
      m_passa: 'passa il turno', m_vuota: '', spareggio: 'pari: si rigioca',
      tocca: 'Tocca a te', contro: 'contro', si_parte: 'Si parte tra {n}', presentati: 'Presentati entro {t} o la partita va a {a}',
      tavolo_attesa: 'Aspetto un tavolo libero, riprovo da solo.', tocca_esci: 'tocca a te: esci da questa partita per giocare (entro {t})', bot_tu: 'Contro il bot dell’allenamento: conta solo per il tabellone.',
      hai_vinto: 'Hai vinto! Passi al turno dopo', hai_vinto_torneo: 'Hai vinto il torneo!', hai_perso: 'Fuori dal torneo: guardi il tabellone',
      vinto_tavolino: 'L’avversario non si è presentato: passi il turno', eliminato: 'Sei fuori: il torneo continua in diretta',
      ritirato: 'Ti sei ritirato', campione: 'Campione', vince: 'vince il torneo', finalista: 'Finale', semifinalista: 'Semifinale',
      riepilogo: 'Riepilogo', batte: 'batte', durata: 'in {t}', sparisce: 'Il riepilogo si chiude tra {t}',
      annullato_da: 'Torneo annullato da chi l’ha creato', annullato_pochi: 'Torneo annullato: non c’erano abbastanza iscritti',
      annullato_tempo: 'Torneo annullato: è durato troppo', piede: 'Gratis, solo per divertirsi: i risultati non si salvano.',
      conferma_ritiro: 'Tocca ancora per ritirarti', conferma_annulla: 'Tocca ancora: annulla per tutti',
      gia: 'C’è già un torneo in questo canale', limite: 'Tanti tornei di fila: riprova più tardi', pieno: 'Posti finiti',
      chiuso: 'Le iscrizioni sono chiuse', altro: 'Sei già in un altro torneo', errore: 'Non riesco, riprova tra poco',
      fuori_discord: 'I tornei si fanno dentro Discord, da un canale vocale.', nuovo_torneo: '{c} ha aperto un torneo di {g}',
      guarda: 'Guarda', guardi: 'Guardi', torna_tab: 'Torna al tabellone', spett_vince: '{w} vince: seguo la sua prossima partita',
      spett_fine: '{w} vince', offerta: 'Sei fuori: vuoi guardare?', offerta_di: 'Guarda {n} dal vivo',
      offerta_sotto: 'La partita di chi ti ha eliminato, in diretta. Esci quando vuoi.', offerta_altra: 'Una partita del torneo in diretta.',
      resta: 'Resta sul tabellone', pip_guardi: 'Guardi · {a} contro {b}', in_diretta_ora: 'in diretta',
      giocatori: 'giocatori', bot_corto: 'bot', persone: 'persone', in_gioco: 'Torneo · {g}', pip_iscr: 'Iscrizioni · {n}/{m}',
      pip_turno: '{r} in diretta', pip_tocca: 'Tocca a te', ti_sei: 'La tua partita: {r}', la_tua: 'La tua partita', et_creatore: 'organizza'
    },
    en: {
      torneo: 'Tournament', torneo_canale: 'Channel tournament', crea_sotto: 'A bracket for everyone in the voice channel: pick a game, the others join.',
      crea: 'Create a tournament', apri: 'Open', entra: 'Join', esci: 'Leave', inizia: 'Start now', annulla: 'Cancel tournament',
      ritirati: 'Withdraw', chiudi: 'Close', gioca_ora: 'Play now', torna_gioco: 'Back to the match', torna_torneo: 'Back to the bracket',
      nuovo: 'New tournament', scegli_gioco: 'Pick the game', posti: 'Seats', bot: 'Fill empty seats with bots', bot_si: 'Bots take the empty seats',
      bot_no: 'People only: empty seats are byes', apri_iscr: 'Open sign-ups', iscrizioni: 'Sign-ups', chiude_tra: 'starts in',
      iscritti: '{n} of {m} joined', posto_libero: 'Open seat', sei_dentro: 'You’re in', creatore: 'created the tournament',
      aspetta_crea: 'Waiting for {c} to start (or for the seats to fill).', serve_uno: 'Needs at least one more player (or bots).',
      in_diretta: 'Live', finito: 'Finished', annullato: 'Cancelled', tu: 'you',
      finale: 'Final', semi: 'Semifinals', quarti: 'Quarterfinals', ottavi: 'Round of 16', turno: 'Round {n}',
      in_corso: 'live {t}', simulata: 'bot vs bot · {t}', attesa: 'waiting', pronta: 'joining', passa: 'bye',
      tavolo: 'waiting for a free table', m_gioco: '', m_assente: 'no-show', m_assenti: 'no-shows, coin flip', m_ritiro: 'withdrew',
      m_sorte: 'coin flip', m_pari: 'tied, coin flip', m_usciti: 'both left, coin flip', m_interrotta: 'interrupted, coin flip', m_simulata: 'simulated',
      m_passa: 'bye', m_vuota: '', spareggio: 'tied: replaying',
      tocca: 'Your match', contro: 'vs', si_parte: 'Starting in {n}', presentati: 'Join within {t} or the match goes to {a}',
      tavolo_attesa: 'Waiting for a free table, retrying on my own.', tocca_esci: 'your match is up: leave this game to play (within {t})', bot_tu: 'Against the practice bot: it only counts for the bracket.',
      hai_vinto: 'You won! On to the next round', hai_vinto_torneo: 'You won the tournament!', hai_perso: 'You’re out: watching the bracket',
      vinto_tavolino: 'Your opponent didn’t show up: you advance', eliminato: 'You’re out: the tournament goes on live',
      ritirato: 'You withdrew', campione: 'Champion', vince: 'wins the tournament', finalista: 'Final', semifinalista: 'Semifinal',
      riepilogo: 'Recap', batte: 'beats', durata: 'in {t}', sparisce: 'The recap closes in {t}',
      annullato_da: 'Cancelled by the creator', annullato_pochi: 'Cancelled: not enough players joined',
      annullato_tempo: 'Cancelled: it ran too long', piede: 'Free, just for fun: results aren’t saved.',
      conferma_ritiro: 'Tap again to withdraw', conferma_annulla: 'Tap again: cancel for everyone',
      gia: 'There’s already a tournament in this channel', limite: 'Too many tournaments in a row: try later', pieno: 'No seats left',
      chiuso: 'Sign-ups are closed', altro: 'You’re already in another tournament', errore: 'Something went wrong, try again',
      fuori_discord: 'Tournaments run inside Discord, from a voice channel.', nuovo_torneo: '{c} opened a {g} tournament',
      guarda: 'Watch', guardi: 'Watching', torna_tab: 'Back to the bracket', spett_vince: '{w} wins: following their next match',
      spett_fine: '{w} wins', offerta: 'You’re out: want to watch?', offerta_di: 'Watch {n} live',
      offerta_sotto: 'The match of whoever knocked you out, live. Leave whenever you like.', offerta_altra: 'A tournament match, live.',
      resta: 'Stay on the bracket', pip_guardi: 'Watching · {a} vs {b}', in_diretta_ora: 'live',
      giocatori: 'players', bot_corto: 'bots', persone: 'people', in_gioco: 'Tournament · {g}', pip_iscr: 'Sign-ups · {n}/{m}',
      pip_turno: '{r} live', pip_tocca: 'Your match', ti_sei: 'Your match: {r}', la_tua: 'Your match', et_creatore: 'host'
    }
  };
  function t(k, v) {
    var s = (TX[LINGUA][k] != null ? TX[LINGUA][k] : TX.it[k]) || '';
    if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]);
    return s;
  }
  var NOMI_EN = {pool8: 'Pool', dama: 'Checkers', chess: 'Chess', rps: 'Rock Paper Scissors', archery: 'Archery', alley: 'Alleys',
                 draw: 'Quick Draw', golf: 'Minigolf', backg: 'Backgammon'};
  function nomeGioco(id) {
    if (LINGUA === 'en' && NOMI_EN[id]) return NOMI_EN[id];
    var g = (window.GX_GIOCHI || []).filter(function (x) { return x.id === id; })[0];
    return g ? g.nome : id;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); }
  function mmss(s) { s = Math.max(0, s | 0); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  var COLORI = ['#8b83f0', '#5ac8fa', '#ff9f0a', '#30d158', '#ff6482', '#64d2ff', '#bf5af2', '#ffd60a'];
  function colore(id) { var s = 0, x = String(id); for (var i = 0; i < x.length; i++) s += x.charCodeAt(i); return COLORI[s % COLORI.length]; }
  var BOT_SVG = '<svg viewBox="0 0 24 24" width="62%" height="62%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 8V4.5"/><circle cx="12" cy="3.5" r="1"/><circle cx="9" cy="13" r="1.3" fill="currentColor"/><circle cx="15" cy="13" r="1.3" fill="currentColor"/></svg>';
  function av(p, cls) {
    cls = 'av tn-av' + (cls ? ' ' + cls : '');
    if (!p) return '<span class="' + cls + ' tn-vuoto">?</span>';
    if (p.bot) return '<span class="' + cls + ' bot">' + BOT_SVG + '</span>';
    var foto = p.avatar && GXD.avatar ? GXD.avatar(p.id, p.avatar) : '';
    var st = foto ? ' style="background-image:url(\'' + esc(foto) + '\')"' : ' style="background:' + colore(p.id) + '"';
    return '<span class="' + cls + '"' + st + '>' + (foto ? '' : esc((p.nome || '?').charAt(0).toUpperCase())) + '</span>';
  }
  function ico(id) { return '<img src="asset/gbx_pv_' + esc(id) + '.webp" alt="" decoding="async">'; }
  function io() { return GXD.io || {}; }
  function nomeP(p) { return !p ? '' : (p.id === io().id ? p.nome + ' (' + t('tu') + ')' : p.nome); }
  function toast(s) { var c = CAT(); if (c.toast) c.toast(s); }
  function nomeTurno(tn, R) {
    if (tn === R) return t('finale');
    if (tn === R - 1) return t('semi');
    if (tn === R - 2) return t('quarti');
    if (tn === R - 3) return t('ottavi');
    return t('turno', {n: tn});
  }

  /* ───────── stato ───────── */
  var S = {torneo: null, giochi: [], posti: [4, 8, 16], aperto: false, vista: null, crea: {gioco: null, posti: 8, bot: true},
           ver: 0, ultimoId: null, partita: null, lanciate: {}, tab: null, notiz: {}, visti: {}, nastroT: null, conto: null,
           ultimaVista: null, tPoll: null, busy: false};
  var $ = function (id) { return document.getElementById(id); };

  function api(metodo, corpo) {
    var h = {'Content-Type': 'application/json'};
    if (GXD.sessione) h.Authorization = 'Bearer ' + GXD.sessione;
    return fetch(API + '/discord/torneo', {method: metodo, headers: h, body: corpo ? JSON.stringify(corpo) : undefined})
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._codice = r.status; return j; }); });
  }

  /* ───────── poll ───────── */
  function prossimo() {
    clearTimeout(S.tPoll);
    var T = S.torneo, ms = 6000;
    if (S.partita || S.spett) ms = 4000;
    else if (T && (T.stato === 'iscrizioni' || T.stato === 'in_corso')) ms = 2000;
    else if (S.aperto || T) ms = 3000;
    if (document.hidden && !S.partita) ms = Math.max(ms, 8000);
    S.tPoll = setTimeout(poll, ms);
  }
  function poll() {
    if (!GXD.vero || !GXD.sessione) { prossimo(); return; }
    api('GET').then(function (j) {
      if (j && j.ok) {
        S.giochi = j.giochi || [];
        S.letto = true;
        S.posti = j.posti || S.posti;
        S.iscrS = j.iscrizioni_s || S.iscrS;
        nuovo(j.torneo);
      }
    }, function () {}).then(prossimo, prossimo);
  }
  function azione(a, extra) {
    if (S.busy) return Promise.resolve();
    S.busy = true;
    var c = extra || {}; c.azione = a; if (S.torneo && a !== 'crea') c.id = S.torneo.id;
    return api('POST', c).then(function (j) {
      S.busy = false;
      if (j && j.torneo !== undefined) nuovo(j.torneo);
      if (!j || !j.ok) {
        var E = {gia_torneo: 'gia', limite: 'limite', pieno: 'pieno', chiuso: 'chiuso', altro_torneo: 'altro', troppe: 'limite', pochi: 'serve_uno'};
        toast(t(E[j && j.errore] || 'errore'));
      }
      return j;
    }, function () { S.busy = false; toast(t('errore')); });
  }

  /* ───────── un torneo nuovo dal server ───────── */
  function nuovo(T) {
    var prima = S.torneo;
    S.torneo = T || null;
    if (T && (!prima || prima.id !== T.id)) {
      S.visti = {}; S.lanciate = {}; S.tab = null;
      if (T.stato === 'iscrizioni' && !T.sono_creatore && T.creatore) toast(t('nuovo_torneo', {c: T.creatore.nome, g: nomeGioco(T.gioco)}));
    }
    if (T && prima && prima.id === T.id && prima.stato === 'iscrizioni' && T.stato === 'in_corso' && T.iscritto && !S.partita) apri();
    if (T && prima && prima.id === T.id && prima.stato !== 'annullato' && T.stato === 'annullato' && !T.sono_creatore) {
      toast(T.motivo === 'creatore' ? t('annullato_da') : T.motivo === 'pochi' ? t('annullato_pochi') : t('annullato_tempo'));
    }
    controllaPartita(prima);
    controllaSpett();
    offri();
    disegna();
  }

  /* ───────── la MIA partita: «tocca a te», apertura, ritorno ───────── */
  function chiave(m) { return m.id + ':' + (m.ticket || ''); }
  function controllaPartita(prima) {
    var T = S.torneo, m = T && T.mia;
    // in partita: la partita del torneo e' finita (o il torneo e' stato chiuso)
    if (S.partita) {
      var P = S.partita, ancora = m && m.id === P.id && (m.stato === 'pronta' || m.stato === 'in_corso');
      if (!T || T.id !== P.tid) { nastro(t('annullato'), true, 2500); return; }
      if (!ancora && !P.nastro) {
        P.nastro = true;
        var u = T.ultima || {}, fin = T.stato === 'finito';
        var vinta = u.id === P.id && u.vinta, tavolino = u.id === P.id && u.motivo !== 'gioco';
        var msg = vinta ? (fin ? t('hai_vinto_torneo') : (tavolino ? t('vinto_tavolino') : t('hai_vinto'))) : (T.stato === 'annullato' ? t('annullato') : t('hai_perso'));
        nastro(msg, vinta, tavolino ? 2200 : 8000);
      }
      return;
    }
    if (!m || !m.ticket || T.stato !== 'in_corso') { if (!(S.conto && S.conto.offerta)) chiudiConto(); avvisoAltro(''); return; }
    if (m.stato !== 'pronta' && m.stato !== 'in_corso') return;
    if (S.lanciate[chiave(m)]) return;
    if (m.presente && m.stato === 'in_corso') return;      // e' gia' in gioco da un'altra finestra
    if (S.spett) chiudiSpett(true);                          // tocca a me: si smette di guardare
    if (S.conto && S.conto.offerta) chiudiConto();
    var c = CAT();
    if (c.stato && c.stato.inGioco) {                       // e' in un'altra partita del catalogo: niente seconda finestra
      avvisoAltro(t('tocca_esci', {t: mmss(m.scade_tra || 0)}));
      return;
    }
    avvisoAltro('');
    if (!S.conto || S.conto.k !== chiave(m)) apriConto(m);
  }
  function avvisoAltro(msg) {
    var el = $('tn-nastro'); if (!el || S.partita) return;
    if (!msg) { if (el.classList.contains('altro')) el.className = 'tn-nastro'; return; }
    el.className = 'tn-nastro su altro';
    el.innerHTML = '<span class="tn-n-tx"><b>' + esc(t('torneo')) + '</b> · ' + esc(msg) + '</span>';
  }
  function apriConto(m) {
    chiudiConto();
    apri();
    var n = 5, C = S.conto = {k: chiave(m), m: m, t: null, n: 5};
    disegnaConto(n);
    C.t = setInterval(function () {
      if (S.conferma && S.conferma.a === 'ritirati') return;     // ferma il conto mentre si conferma il ritiro
      n--; C.n = n;
      if (n <= 0) { lancia(m); return; }
      disegnaConto(n);
    }, 1000);
  }
  function chiudiConto() {
    if (S.conto) { clearInterval(S.conto.t); S.conto = null; }
    var el = $('tn-conto'); if (el) el.classList.remove('su');
  }
  function disegnaConto(n) {
    var el = $('tn-conto'), m = S.conto && S.conto.m; if (!el || !m) return;
    var T = S.torneo;
    el.innerHTML = '<div class="tn-conto-box x-lastra">' +
      '<div class="tn-c-gioco">' + esc(nomeGioco(T.gioco)) + ' · ' + esc(nomeTurno(m.turno, T.turni)) + '</div>' +
      '<h3>' + t('tocca') + '</h3>' +
      '<div class="tn-vs"><div class="tn-vs-p">' + av(io(), 'grande') + '<b>' + esc(io().nome || '') + '</b></div>' +
      '<span class="tn-vs-x">' + t('contro') + '</span>' +
      '<div class="tn-vs-p">' + av(m.avversario, 'grande') + '<b>' + esc(m.avversario ? m.avversario.nome : '') + '</b></div></div>' +
      '<div class="tn-c-num">' + t('si_parte', {n: n}) + '</div>' +
      '<p class="tn-c-info">' + (m.pratica ? t('bot_tu') : t('presentati', {t: mmss(m.scade_tra || 0), a: esc(m.avversario ? m.avversario.nome : '')})) + '</p>' +
      '<div class="tn-tasti"><button class="t1" type="button" data-tn="gioca">' + t('gioca_ora') + '</button>' +
      '<button class="t2" type="button" data-tn="ritirati">' + t('ritirati') + '</button></div></div>';
    el.classList.add('su');
  }
  function lancia(m) {
    chiudiConto();
    var T = S.torneo; if (!T || !m || !m.ticket) return;
    S.lanciate[chiave(m)] = true;
    var c = CAT(), g = (c.PER_ID || {})[T.gioco] || {id: T.gioco, nome: nomeGioco(T.gioco)};
    // le varianti (Biliardo, Dama): il torneo e' sempre la prima, quella del biglietto
    GXD.variante = GXD.variante || {}; GXD.variante[T.gioco] = T.gioco;
    S.partita = {id: m.id, tid: T.id, ticket: m.ticket, h: null, nastro: false};
    if (c.stato) { c.stato.inGioco = g; if (c.disegnaPip) c.disegnaPip(); }
    chiudiOverlay(true);
    var P = S.partita;
    Promise.resolve(GXD.apriGioco(T.gioco, m.ticket, {pratica: !!m.pratica, persone: [], onFine: function () { fineGioco(P); }}))
      .then(function (h) { P.h = h; }, function () { fineGioco(P); toast(t('errore')); });
    prossimo();
  }
  function fineGioco(P) {
    if (S.partita !== P) return;
    S.partita = null;
    clearTimeout(S.nastroT);
    var nb = $('tn-nastro'); if (nb) nb.classList.remove('su');
    var c = CAT(); if (c.stato) { c.stato.inGioco = null; if (c.disegnaPip) c.disegnaPip(); }
    if (S.torneo) apri();
    poll();
  }
  function nastro(msg, buono, dopo) {
    var el = $('tn-nastro'); if (!el) return;
    el.className = 'tn-nastro su ' + (buono ? 'buono' : '');
    el.innerHTML = '<span class="tn-n-tx"><b>' + esc(t('torneo')) + '</b> · ' + esc(msg) + '</span><button type="button" data-tn="torna">' + t('torna_torneo') + '</button>';
    clearTimeout(S.nastroT);
    S.nastroT = setTimeout(chiudiGioco, dopo);
  }
  function chiudiGioco() {
    var P = S.partita; if (!P) return;
    try { if (P.h && P.h.chiudi) P.h.chiudi(); } catch (e) {}
    fineGioco(P);
  }


  /* ───────── SPETTATORE (lotto 10, giro 2): guardare dal vivo una partita del torneo ─────────
     Il backend da' un biglietto firmato per UNA partita (solo a chi e' nel canale e non la gioca); la pagina del gioco si
     apre in modo spettatore (app.html?...&w=<biglietto>, shell.js -> RTD_WATCH / TKD_WATCH). Finita la partita si segue
     il vincitore nella sua partita dopo, se si puo' guardare; altrimenti si torna al tabellone. */
  var OCCHIO_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  function guarda(mid) {
    var T = S.torneo; if (!T || !mid || S.partita) return;
    azione('guarda', {partita: mid}).then(function (j) {
      if (!j || !j.ok || !j.guarda) return;
      if (S.spett) chiudiSpett(true);
      var c = CAT(), g = (c.PER_ID || {})[T.gioco] || {id: T.gioco, nome: nomeGioco(T.gioco)};
      GXD.variante = GXD.variante || {}; GXD.variante[T.gioco] = T.gioco;
      var V = S.spett = {id: mid, tid: T.id, gioco: T.gioco, a: j.a, b: j.b, h: null, finita: false, segui: null, t0: Date.now()};
      if (c.stato) { c.stato.inGioco = g; if (c.disegnaPip) c.disegnaPip(); }
      chiudiOverlay(true);
      barraSpett();
      Promise.resolve(GXD.apriGioco(T.gioco, '', {guarda: j.guarda, onFine: function () { fineSpett(V); }}))
        .then(function (h) { V.h = h; if (S.spett !== V && h && h.chiudi) h.chiudi(); }, function () { fineSpett(V); toast(t('errore')); });
      prossimo();
    });
  }
  function barraSpett(msg) {
    var el = $('tn-spett'), V = S.spett; if (!el) return;
    if (!V) { el.className = 'tn-spett'; el.innerHTML = ''; return; }
    el.className = 'tn-spett su' + (msg ? ' fine' : '');
    el.innerHTML = '<span class="tn-sp-ico">' + OCCHIO_SVG + '</span>' +
      '<span class="tn-sp-p">' + av(V.a, 'mini') + '<b>' + esc(V.a ? V.a.nome : '') + '</b></span><span class="tn-sp-vs">' + t('contro') + '</span>' +
      '<span class="tn-sp-p">' + av(V.b, 'mini') + '<b>' + esc(V.b ? V.b.nome : '') + '</b></span>' +
      (msg ? '<span class="tn-sp-msg">' + esc(msg) + '</span>' : '') +
      '<button type="button" data-tn="spett_esci">' + t('torna_tab') + '</button>';
  }
  function chiudiSpett(senzaTabellone) {
    var V = S.spett; if (!V) return;
    try { if (V.h && V.h.chiudi) V.h.chiudi(); } catch (e) {}
    fineSpett(V, senzaTabellone);
  }
  function fineSpett(V, senzaTabellone) {
    if (S.spett !== V) return;
    S.spett = null;
    barraSpett();
    var c = CAT(); if (c.stato) { c.stato.inGioco = null; if (c.disegnaPip) c.disegnaPip(); }
    if (!senzaTabellone && S.torneo) apri();
    poll();
  }
  function persona(p, lato) { return p ? p[lato] : null; }
  function controllaSpett() {
    var V = S.spett, T = S.torneo; if (!V) return;
    if (!T || T.id !== V.tid || T.stato === 'annullato') { chiudiSpett(); return; }
    var P = (T.partite || []).filter(function (x) { return x.id === V.id; })[0];
    if (P && P.stato !== 'finita') return;
    if (!V.finita) {
      V.finita = true;
      var w = P && P.vince ? persona(P, P.vince) : null;
      V.segui = w ? w.id : null;
      barraSpett(T.stato === 'finito' ? t('spett_fine', {w: w ? w.nome : ''}) : t('spett_vince', {w: w ? w.nome : ''}));
      V.tFine = Date.now();
    }
    // il vincitore nella sua partita dopo, appena si puo' guardare (dopo che si e' visto l'esito qualche secondo)
    if (Date.now() - V.tFine < 4000) return;
    var dopo = (T.partite || []).filter(function (x) {
      return x.guardabile && x.id !== V.id && ((x.a && x.a.id === V.segui) || (x.b && x.b.id === V.segui));
    })[0];
    if (dopo) { var mid = dopo.id; chiudiSpett(true); guarda(mid); return; }
    if (T.stato !== 'in_corso' || Date.now() - V.tFine > 25000) chiudiSpett();
  }
  // a chi e' appena uscito dal torneo si propone di guardare: prima la partita di chi l'ha eliminato
  function offri() {
    var T = S.torneo;
    if (!T || T.stato !== 'in_corso' || !T.eliminato || S.partita || S.spett || S.conto) return;
    S.offerte = S.offerte || {};
    if (S.offerte[T.id]) return;
    var c = CAT(); if (c.stato && c.stato.inGioco) return;
    var elim = null;
    if (T.ultima) {
      var U = (T.partite || []).filter(function (x) { return x.id === T.ultima.id; })[0];
      if (U && U.vince) elim = persona(U, U.vince);
    }
    var vive = (T.partite || []).filter(function (x) { return x.guardabile; });
    if (!vive.length) return;
    var sua = elim && vive.filter(function (x) { return (x.a && x.a.id === elim.id) || (x.b && x.b.id === elim.id); })[0];
    var scelta = sua || vive[0];
    S.offerte[T.id] = true;
    S.offerta = {id: scelta.id};
    apri();
    var el = $('tn-conto'); if (!el) return;
    el.innerHTML = '<div class="tn-conto-box x-lastra">' +
      '<div class="tn-c-gioco">' + esc(nomeGioco(T.gioco)) + ' · ' + esc(nomeTurno(scelta.turno, T.turni)) + '</div>' +
      '<h3>' + t('offerta') + '</h3>' +
      '<div class="tn-vs"><div class="tn-vs-p">' + av(scelta.a, 'grande') + '<b>' + esc(scelta.a ? scelta.a.nome : '') + '</b></div>' +
      '<span class="tn-vs-x">' + t('contro') + '</span>' +
      '<div class="tn-vs-p">' + av(scelta.b, 'grande') + '<b>' + esc(scelta.b ? scelta.b.nome : '') + '</b></div></div>' +
      '<p class="tn-c-info">' + (sua ? t('offerta_sotto') : t('offerta_altra')) + '</p>' +
      '<div class="tn-tasti"><button class="t1" type="button" data-tn="offri_si">' + OCCHIO_SVG + ' ' + (sua ? t('offerta_di', {n: esc(elim.nome)}) : t('guarda')) + '</button>' +
      '<button class="t2" type="button" data-tn="offri_no">' + t('resta') + '</button></div></div>';
    el.classList.add('su');
    S.conto = {k: 'offerta', m: null, t: null, offerta: true};
  }

  /* ───────── overlay ───────── */
  function apri(vista) {
    S.aperto = true; if (vista) S.vista = vista;
    var el = $('tn'); if (!el) return;
    el.classList.add('su'); el.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('tn-aperto');
    disegna();
    prossimo();
  }
  function chiudiOverlay(perGioco) {
    S.aperto = false; S.vista = null;
    var el = $('tn'); if (!el) return;
    el.classList.remove('su'); el.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('tn-aperto');
    if (!perGioco) chiudiConto();
    disegnaStriscia();
  }

  function disegna() {
    disegnaStriscia();
    var c = CAT(); if (c.disegnaPip) try { c.disegnaPip(); } catch (e) {}
    if (!S.aperto) return;
    var T = S.torneo, corpo = $('tn-corpo'); if (!corpo) return;
    var v = (T && (T.stato === 'iscrizioni' || T.stato === 'in_corso')) ? T.stato : ((S.vista === 'crea' || !T) ? 'crea' : T.stato);
    $('tn').setAttribute('data-vista', v);
    if (v === 'crea') corpo.innerHTML = vistaCrea();
    else if (v === 'iscrizioni') corpo.innerHTML = vistaIscrizioni(T);
    else if (v === 'in_corso') { corpo.innerHTML = vistaTabellone(T); dopoTabellone(T); }
    else corpo.innerHTML = vistaFine(T);
    if (v === 'in_corso' || v === 'finito') {
      (T.partite || []).forEach(function (p) { if (p.stato === 'finita') S.visti[p.id] = true; });
    }
  }

  /* ── crea ── */
  function vistaCrea() {
    var C = S.crea, giochi = S.giochi.filter(function (g) { return !GXD.attivo || GXD.attivo(g); });
    if (!C.gioco || giochi.indexOf(C.gioco) < 0) C.gioco = giochi[0] || null;
    var h = '<header class="tn-testa"><div><small>' + t('torneo_canale') + '</small><h2>' + t('crea') + '</h2></div>' +
      '<button class="tn-x" type="button" data-tn="chiudi" aria-label="' + t('chiudi') + '">' + X_SVG + '</button></header>';
    h += '<div class="tn-scroll"><h3 class="tn-sez">' + t('scegli_gioco') + '</h3><div class="tn-giochi" role="radiogroup">';
    giochi.forEach(function (g) {
      h += '<button type="button" class="tn-g' + (g === C.gioco ? ' su' : '') + '" data-gioco="' + esc(g) + '" role="radio" aria-checked="' + (g === C.gioco) + '">' +
        '<span class="ico">' + ico(g) + '</span><b>' + esc(nomeGioco(g)) + '</b></button>';
    });
    h += '</div><div class="tn-opz"><div class="tn-riga-opz"><span>' + t('posti') + '</span><div class="tn-seg" role="radiogroup">';
    S.posti.forEach(function (n) { h += '<button type="button" data-posti="' + n + '" class="' + (n === C.posti ? 'su' : '') + '">' + n + '</button>'; });
    h += '</div></div><button type="button" class="tn-riga-opz tn-int' + (C.bot ? ' on' : '') + '" data-tn="bot" aria-pressed="' + C.bot + '">' +
      '<span>' + t('bot') + '<small>' + (C.bot ? t('bot_si') : t('bot_no')) + '</small></span><i></i></button></div>' +
      '<p class="tn-piede">' + t('piede') + '</p></div>' +
      '<div class="tn-tasti fondo"><button class="t1" type="button" data-tn="crea"' + (C.gioco ? '' : ' disabled') + '>' + t('apri_iscr') + '</button></div>';
    return h;
  }

  /* ── iscrizioni ── */
  function vistaIscrizioni(T) {
    var n = T.iscritti.length, m = T.posti, tot = S.iscrS || 60, rest = T.chiude_tra || 0;
    var h = testata(T, '<span class="tn-pill viva">' + t('iscrizioni') + '</span>');
    h += '<div class="tn-scroll"><div class="tn-iscr">' +
      '<div class="tn-anello" style="--p:' + Math.max(0, Math.min(1, rest / tot)).toFixed(3) + '"><div><b>' + mmss(rest) + '</b><small>' + t('chiude_tra') + '</small></div></div>' +
      '<div class="tn-iscr-tx"><p class="tn-conta">' + t('iscritti', {n: n, m: m}) + '</p>' +
      '<p class="tn-sotto">' + av(T.creatore, 'mini') + ' <b>' + esc(T.creatore.nome) + '</b> ' + t('creatore') + ' · ' +
      (T.bot ? t('bot_si') : t('bot_no')) + '</p></div></div><ul class="tn-lista">';
    T.iscritti.forEach(function (p, i) {
      h += '<li class="' + (S.visti['i:' + p.id] ? '' : 'nuovo') + '">' + av(p) + '<b>' + esc(nomeP(p)) + '</b>' + (p.id === T.creatore.id ? '<span class="tn-et">' + t('et_creatore') + '</span>' : '') + '</li>';
      S.visti['i:' + p.id] = true;
    });
    for (var k = n; k < m; k++) h += '<li class="libero">' + av(T.bot ? {bot: true} : null) + '<b>' + (T.bot ? 'Bot' : t('posto_libero')) + '</b></li>';
    h += '</ul><p class="tn-piede">' + (T.sono_creatore ? (n < 2 && !T.bot ? t('serve_uno') : '') : (T.iscritto ? t('aspetta_crea', {c: esc(T.creatore.nome)}) : '')) + '</p></div>';
    h += '<div class="tn-tasti fondo">';
    if (T.sono_creatore) {
      h += '<button class="t1" type="button" data-tn="avvia"' + (n >= 2 || (T.bot && n >= 1) ? '' : ' disabled') + '>' + t('inizia') + '</button>' +
        '<button class="t2" type="button" data-tn="annulla">' + t('annulla') + '</button>';
    } else if (T.iscritto) {
      h += '<button class="t1 ok" type="button" disabled>' + CHECK_SVG + t('sei_dentro') + '</button><button class="t2" type="button" data-tn="esci">' + t('esci') + '</button>';
    } else {
      h += '<button class="t1" type="button" data-tn="entra"' + (n >= m ? ' disabled' : '') + '>' + t('entra') + '</button>';
    }
    return h + '</div>';
  }
  function testata(T, destra) {
    return '<header class="tn-testa"><span class="ico">' + ico(T.gioco) + '</span><div><small>' + t('torneo_canale') + ' · ' + T.posti + ' ' + t('giocatori') + '</small>' +
      '<h2>' + esc(nomeGioco(T.gioco)) + '</h2></div>' + (destra || '') +
      '<button class="tn-x" type="button" data-tn="chiudi" aria-label="' + t('chiudi') + '">' + X_SVG + '</button></header>';
  }

  /* ── tabellone ── */
  function statoPartita(p) {
    if (p.stato === 'in_corso') return '<span class="tn-st viva">' + (p.simulata ? t('simulata', {t: mmss(p.da)}) : t('in_corso', {t: mmss(p.da)})) + '</span>';
    if (p.stato === 'pronta') return '<span class="tn-st viva">' + t('pronta') + '</span>';
    if (p.stato === 'attesa') return '<span class="tn-st">' + (p.pieno ? t('tavolo') : (p.prove ? t('spareggio') : t('attesa'))) + '</span>';
    var mt = t('m_' + p.motivo);
    return mt ? '<span class="tn-st">' + esc(mt) + '</span>' : (p.durata ? '<span class="tn-st">' + t('durata', {t: mmss(p.durata)}) + '</span>' : '');
  }
  function rigaP(p, lato) {
    var x = p[lato], noto = p['noto_' + lato], vince = p.stato === 'finita' && p.vince === lato, perde = p.stato === 'finita' && p.vince && p.vince !== lato;
    var mio = x && x.id === io().id;
    if (!noto) return '<div class="tn-pr ignoto"><span class="av tn-av tn-vuoto"></span><b>&nbsp;</b></div>';
    if (!x) return '<div class="tn-pr bye"><span class="av tn-av tn-vuoto">–</span><b>' + t('m_passa') + '</b></div>';
    return '<div class="tn-pr' + (vince ? ' vince' : '') + (perde ? ' perde' : '') + (mio ? ' mio' : '') + '">' + av(x) +
      '<b>' + esc(nomeP(x)) + '</b>' + (vince ? '<i class="tn-ok">' + CHECK_SVG + '</i>' : '') + '</div>';
  }
  function carta(p) {
    var mia = (p.a && p.a.id === io().id) || (p.b && p.b.id === io().id);
    var nuova = p.stato === 'finita' && !S.visti[p.id];
    return '<div class="tn-m x-lastra s-' + p.stato + (mia ? ' mia' : '') + (nuova ? ' appena' : '') + '" data-p="' + p.id + '">' +
      rigaP(p, 'a') + rigaP(p, 'b') + '<div class="tn-m-pie">' + statoPartita(p) +
      (p.guardabile && !S.partita ? '<button class="tn-guarda" type="button" data-tn="guarda" data-p="' + esc(p.id) + '">' + OCCHIO_SVG + t('guarda') + '</button>' : '') +
      '</div></div>';
  }
  function vistaTabellone(T) {
    var R = T.turni || 1, per = {}, mioT = null, attivo = R;
    (T.partite || []).forEach(function (p) {
      (per[p.turno] = per[p.turno] || []).push(p);
      if ((p.a && p.a.id === io().id) || (p.b && p.b.id === io().id)) mioT = p.turno;
    });
    for (var r = R; r >= 1; r--) if ((per[r] || []).some(function (p) { return p.stato !== 'finita' && p.noto_a && p.noto_b; })) attivo = r;
    if (!S.tab) S.tab = T.eliminato ? attivo : (mioT || attivo);
    if (S.tab > R) S.tab = R;
    var destra = '<span class="tn-pill viva"><i class="tn-punto"></i>' + t('in_diretta') + '</span>';
    var h = testata(T, destra);
    var m = T.mia, banda = '';
    if (T.ritirato) banda = t('ritirato');
    else if (T.eliminato) banda = t('eliminato');
    else if (m) banda = (m.pieno ? t('tavolo_attesa') : t('ti_sei', {r: nomeTurno(m.turno, R)}));
    h += '<div class="tn-banda' + (T.eliminato ? ' fuori' : '') + '"><span>' + esc(banda) + '</span>' +
      (m && m.ticket && S.lanciate[chiave(m)] && !S.partita ? '<button class="tn-mini" type="button" data-tn="rigioca">' + t('torna_gioco') + '</button>' : '') + '</div>';
    h += '<div class="tn-tabs" role="tablist">';
    for (r = 1; r <= R; r++) h += '<button type="button" role="tab" data-tab="' + r + '" class="' + (r === S.tab ? 'su' : '') + '">' + esc(nomeTurno(r, R)) + '</button>';
    h += '</div><div class="tn-albero" style="--turni:' + R + ';--n1:' + ((per[1] || []).length || 1) + '">';
    for (r = 1; r <= R; r++) {
      var L = per[r] || [];
      h += '<section class="tn-col' + (r === S.tab ? ' su' : '') + '" data-col="' + r + '"><h4>' + esc(nomeTurno(r, R)) + '</h4><div class="tn-col-c">';
      if (r === R) h += '<div class="tn-coppia solo">' + L.map(carta).join('') + '</div>';
      else for (var i = 0; i < L.length; i += 2) h += '<div class="tn-coppia">' + carta(L[i]) + (L[i + 1] ? carta(L[i + 1]) : '') + '</div>';
      h += '</div></section>';
    }
    h += '</div><div class="tn-tasti fondo riga">';
    if (T.iscritto && !T.ritirato && !T.eliminato) h += '<button class="t2" type="button" data-tn="ritirati">' + t('ritirati') + '</button>';
    if (T.sono_creatore) h += '<button class="t2" type="button" data-tn="annulla">' + t('annulla') + '</button>';
    return h + '</div>';
  }
  function dopoTabellone(T) {
    // la mia partita in vista (anche sul telefono, dentro la sua colonna)
    var el = document.querySelector('.tn-m.mia:not(.s-finita)') || document.querySelector('.tn-m.appena');
    if (el && !S.scrollato) { S.scrollato = true; try { el.scrollIntoView({block: 'center', inline: 'center'}); } catch (e) {} }
  }

  /* ── fine ── */
  function vistaFine(T) {
    var h = testata(T, '<span class="tn-pill">' + (T.stato === 'finito' ? t('finito') : t('annullato')) + '</span>');
    h += '<div class="tn-scroll">';
    if (T.stato === 'annullato') {
      h += '<div class="tn-annullato"><p>' + (T.motivo === 'creatore' ? t('annullato_da') : T.motivo === 'pochi' ? t('annullato_pochi') : t('annullato_tempo')) + '</p></div>';
    } else {
      var W = T.vincitore, R = T.turni, fin = (T.partite || []).filter(function (p) { return p.turno === R; })[0];
      var sec = fin && fin.vince ? fin[fin.vince === 'a' ? 'b' : 'a'] : null;
      var semi = (T.partite || []).filter(function (p) { return p.turno === R - 1 && p.vince; }).map(function (p) { return p[p.vince === 'a' ? 'b' : 'a']; });
      h += '<div class="tn-campione">' + coriandoli() + '<div class="tn-corona">' + CORONA_SVG + '</div>' + av(W, 'enorme') +
        '<small>' + t('campione') + '</small><h3>' + esc(W ? W.nome : '') + '</h3><p>' + esc(nomeGioco(T.gioco)) + ' · ' + t('vince') + (T.durata ? ' · ' + t('durata', {t: mmss(T.durata)}) : '') + '</p></div>';
      h += '<div class="tn-podio">';
      if (sec) h += '<div>' + av(sec) + '<b>' + esc(sec.nome) + '</b><small>' + t('finalista') + '</small></div>';
      semi.forEach(function (x) { if (x) h += '<div>' + av(x) + '<b>' + esc(x.nome) + '</b><small>' + t('semifinalista') + '</small></div>'; });
      h += '</div><h3 class="tn-sez">' + t('riepilogo') + '</h3><div class="tn-recap x-lastra">';
      for (var r = R; r >= 1; r--) {
        h += '<div class="tn-rc-t">' + esc(nomeTurno(r, R)) + '</div>';
        (T.partite || []).filter(function (p) { return p.turno === r; }).forEach(function (p) {
          if (!p.vince) return;
          var w = p[p.vince], l = p[p.vince === 'a' ? 'b' : 'a'], mt = t('m_' + p.motivo);
          h += '<div class="tn-rc">' + av(w, 'mini') + '<span><b>' + esc(w ? w.nome : '') + '</b>' + (l ? ' ' + t('batte') + ' ' + esc(l.nome) : ' · ' + t('m_passa')) + '</span>' +
            '<em>' + esc(mt || (p.durata ? mmss(p.durata) : '')) + '</em></div>';
        });
      }
      h += '</div>';
    }
    h += '<p class="tn-piede">' + t('sparisce', {t: mmss(T.sparisce_tra || 0)}) + ' · ' + t('piede') + '</p></div>';
    h += '<div class="tn-tasti fondo riga"><button class="t1" type="button" data-tn="nuovo">' + t('nuovo') + '</button><button class="t2" type="button" data-tn="chiudi">' + t('chiudi') + '</button></div>';
    return h;
  }
  function coriandoli() {
    if (S.cor) return S.cor;
    var C = ['#8b83f0', '#30d158', '#5ac8fa', '#ff9f0a', '#ff6482', '#ffd60a', '#fff'], h = '<div class="tn-cor" aria-hidden="true">';
    for (var i = 0; i < 42; i++) {
      h += '<i class="f' + (i % 3) + '" style="left:' + ((i * 37) % 100) + '%;background:' + C[i % C.length] + ';animation-delay:' + ((i * 0.13) % 2.4).toFixed(2) + 's;animation-duration:' + (2.6 + (i % 5) * 0.35).toFixed(2) + 's;--r:' + ((i * 47) % 360) + 'deg"></i>';
    }
    return (S.cor = h + '</div>');
  }

  /* ───────── striscia nel catalogo ───────── */
  function disegnaStriscia() {
    var el = $('tn-striscia'); if (!el) return;
    var T = S.torneo, h;
    if (!T || T.stato === 'annullato') {
      h = '<span class="tn-s-ico">' + ALBERO_SVG + '</span><span class="tn-s-tx"><b>' + t('torneo_canale') + '</b><span>' + t('crea_sotto') + '</span></span>' +
        '<button class="tn-s-b" type="button" data-tn="nuovo">' + t('crea') + '</button>';
    } else if (T.stato === 'iscrizioni') {
      h = '<span class="tn-s-ico ico">' + ico(T.gioco) + '</span><span class="tn-s-tx"><b>' + esc(nomeGioco(T.gioco)) + ' · ' + t('iscrizioni') + ' ' + mmss(T.chiude_tra) + '</b>' +
        '<span>' + t('iscritti', {n: T.iscritti.length, m: T.posti}) + ' · ' + esc(T.creatore.nome) + '</span></span>' +
        '<button class="tn-s-b" type="button" data-tn="' + (T.iscritto ? 'apri' : 'entra_apri') + '">' + (T.iscritto ? t('apri') : t('entra')) + '</button>';
    } else if (T.stato === 'in_corso') {
      var att = T.turni || 1; (T.partite || []).forEach(function (p) { if (p.stato !== 'finita' && p.noto_a && p.noto_b) att = Math.min(att, p.turno); });
      h = '<span class="tn-s-ico ico">' + ico(T.gioco) + '</span><span class="tn-s-tx"><b>' + esc(nomeGioco(T.gioco)) + ' · <i class="tn-punto"></i>' + t('in_diretta') + '</b>' +
        '<span>' + (T.mia && T.mia.ticket ? t('pip_tocca') : esc(nomeTurno(att, T.turni))) + '</span></span>' +
        '<button class="tn-s-b" type="button" data-tn="apri">' + t('apri') + '</button>';
    } else {
      h = '<span class="tn-s-ico">' + CORONA_SVG + '</span><span class="tn-s-tx"><b>' + esc(nomeGioco(T.gioco)) + ' · ' + esc(T.vincitore ? T.vincitore.nome : '') + '</b>' +
        '<span>' + t('vince') + '</span></span><button class="tn-s-b" type="button" data-tn="apri">' + t('riepilogo') + '</button>';
    }
    el.innerHTML = h;
    // tornei spenti sul server (DISCORD_TORNEI=0 o nessun gioco acceso): niente striscia
    el.hidden = !!(GXD.vero && S.letto && !S.giochi.length && !T);
    el.classList.toggle('vivo', !!T && (T.stato === 'iscrizioni' || T.stato === 'in_corso'));
  }

  /* ───────── finestrella ───────── */
  function pip() {
    if (S.spett && S.spett.a) return {nome: t('pip_guardi', {a: S.spett.a.nome, b: S.spett.b ? S.spett.b.nome : ''}), stato: t('in_diretta_ora'), ico: ico(S.spett.gioco)};
    var T = S.torneo; if (!T || (T.stato !== 'iscrizioni' && T.stato !== 'in_corso')) return null;
    var st = T.stato === 'iscrizioni' ? t('pip_iscr', {n: T.iscritti.length, m: T.posti}) + ' · ' + mmss(T.chiude_tra)
      : (S.partita ? t('la_tua') : (T.mia && T.mia.ticket ? t('pip_tocca') : t('in_diretta')));
    return {nome: t('in_gioco', {g: nomeGioco(T.gioco)}), stato: st, ico: ico(T.gioco)};
  }

  /* ───────── eventi ───────── */
  var X_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var CHECK_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var CORONA_SVG = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" aria-hidden="true"><path d="M3 8.5l4.5 3.5L12 5l4.5 7L21 8.5 19.2 18H4.8z"/><rect x="4.8" y="19.2" width="14.4" height="2" rx="1"/></svg>';
  var ALBERO_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h5v4H3zM3 15h5v4H3zM8 7h3v10H8M11 12h4M15 10h6v4h-6z"/></svg>';

  function clic(e) {
    var b = e.target.closest && e.target.closest('[data-tn],[data-gioco],[data-posti],[data-tab]');
    if (!b || b.disabled) return;
    if (b.hasAttribute('data-gioco')) { S.crea.gioco = b.getAttribute('data-gioco'); disegna(); return; }
    if (b.hasAttribute('data-posti')) { S.crea.posti = +b.getAttribute('data-posti'); disegna(); return; }
    if (b.hasAttribute('data-tab')) { S.tab = +b.getAttribute('data-tab'); S.scrollato = true; disegna(); return; }
    var a = b.getAttribute('data-tn');
    if (a === 'chiudi') { chiudiOverlay(); return; }
    if (a === 'bot') { S.crea.bot = !S.crea.bot; disegna(); return; }
    if (a === 'apri') { apri(); return; }
    if (!GXD.vero) { toast(t('fuori_discord')); return; }
    if (a === 'nuovo') { S.vista = 'crea'; apri('crea'); poll(); return; }
    if (a === 'crea') { azione('crea', {gioco: S.crea.gioco, posti: S.crea.posti, bot: S.crea.bot ? 1 : 0}).then(function (j) { if (j && j.ok) { S.vista = null; disegna(); } }); return; }
    if (a === 'entra' || a === 'entra_apri') { azione('entra').then(function () { apri(); }); return; }
    if (a === 'esci') { azione('esci'); return; }
    if (a === 'avvia') { azione('avvia'); return; }
    // conferma in due tocchi, dentro la pagina (l'iframe di Discord puo' bloccare window.confirm)
    if (a === 'annulla' || a === 'ritirati') {
      if (!(S.conferma && S.conferma.a === a && Date.now() - S.conferma.t < 4000)) {
        S.conferma = {a: a, t: Date.now()};
        b.classList.add('tn-conferma'); b.textContent = t(a === 'annulla' ? 'conferma_annulla' : 'conferma_ritiro');
        setTimeout(function () { if (S.conferma && S.conferma.a === a) { S.conferma = null; if (S.conto) disegnaConto(S.conto.n || 1); else disegna(); } }, 4000);
        return;
      }
      S.conferma = null;
      if (a === 'annulla') azione('annulla'); else { chiudiConto(); azione('ritirati'); }
      return;
    }
    if (a === 'gioca') { if (S.conto) lancia(S.conto.m); return; }
    if (a === 'rigioca') { var m = S.torneo && S.torneo.mia; if (m && m.ticket) { delete S.lanciate[chiave(m)]; lancia(m); } return; }
    if (a === 'torna') { chiudiGioco(); return; }
    if (a === 'guarda') { chiudiConto(); guarda(b.getAttribute('data-p')); return; }
    if (a === 'spett_esci') { chiudiSpett(); return; }
    if (a === 'offri_si') { var o = S.offerta; chiudiConto(); if (o) guarda(o.id); return; }
    if (a === 'offri_no') { chiudiConto(); return; }
  }

  function monta() {
    var st = document.createElement('section');
    st.id = 'tn-striscia'; st.className = 'tn-striscia x-lastra'; st.setAttribute('aria-label', t('torneo'));
    var testa = document.querySelector('.testa');
    if (testa && testa.parentNode) testa.parentNode.insertBefore(st, testa.nextSibling);
    var ov = document.createElement('div');
    ov.id = 'tn'; ov.className = 'tn'; ov.setAttribute('aria-hidden', 'true'); ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = '<div class="tn-pannello" id="tn-corpo"></div><div class="tn-conto" id="tn-conto"></div>';
    document.body.appendChild(ov);
    var sb = document.createElement('div'); sb.id = 'tn-spett'; sb.className = 'tn-spett'; sb.setAttribute('role', 'status');
    document.body.appendChild(sb);
    var nb = document.createElement('div'); nb.id = 'tn-nastro'; nb.className = 'tn-nastro'; nb.setAttribute('role', 'status');
    document.body.appendChild(nb);
    document.addEventListener('click', clic);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (S.conto && S.conto.offerta) { chiudiConto(); return; }
      if (S.aperto && !S.conto) chiudiOverlay();
    });
    ov.addEventListener('click', function (e) { if (e.target === ov) chiudiOverlay(); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) poll(); });
    disegnaStriscia();
    // il primo poll quando la sessione c'e' (dopo il login col nostro server)
    var prova = 0, tt = setInterval(function () {
      prova++;
      if (GXD.sessione || prova > 60) { clearInterval(tt); poll(); }
    }, 500);
    // conto alla rovescia a schermo fra un poll e l'altro (iscrizioni, presenza, partite in corso)
    setInterval(function () {
      var T = S.torneo; if (!T) return;
      var cambia = false;
      if (T.stato === 'iscrizioni' && T.chiude_tra > 0) { T.chiude_tra--; cambia = true; }
      if (T.stato === 'in_corso') (T.partite || []).forEach(function (p) { if (p.stato === 'in_corso') { p.da++; cambia = true; } });
      if (T.mia && T.mia.scade_tra > 0) T.mia.scade_tra--;
      if ((T.stato === 'finito' || T.stato === 'annullato') && T.sparisce_tra > 0) { T.sparisce_tra--; cambia = true; }
      if (cambia && !S.partita && !S.conferma) { if (S.aperto && document.activeElement && document.activeElement.closest && document.activeElement.closest('#tn')) aggiornaSoft(); else disegna(); }
    }, 1000);
  }
  // un ridisegno che non perde il fuoco della tastiera (si rimette sul tasto con la stessa azione)
  function aggiornaSoft() {
    var a = document.activeElement, k = a && (a.getAttribute('data-tn') || a.getAttribute('data-tab') || a.getAttribute('data-gioco'));
    disegna();
    if (k) { var b = document.querySelector('#tn [data-tn="' + k + '"],#tn [data-tab="' + k + '"],#tn [data-gioco="' + k + '"]'); if (b) b.focus({preventScroll: true}); }
  }

  window.GXTorneo = {
    pip: pip, aperto: function () { return S.aperto || !!S.conto; }, inPartita: function () { return !!S.partita; },
    guarda: function () { return S.spett; },
    _S: S, _poll: poll, lingua: LINGUA
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', monta); else monta();
})();
