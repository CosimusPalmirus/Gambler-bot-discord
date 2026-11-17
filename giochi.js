/* Catalogo dei giochi GRATIS per l'Activity di Discord (prototipo 15/11/2026).
   Fonte: _levelup/restyle_1311/arena_giochi.json + gbx_arena.js (nomi e categorie dell'Arena),
   bot = tabella _PRACTICE_GAMES di backend.py (copia locale, da riconfermare sul VPS).
   Testi riscritti SENZA soldi: niente piatto, posta, premio, commissione.
   Esclusi apposta (vedi PIANO.md): giochi contro la casa, Roulette russa, Dadi, Sasso carta forbice.
   15/11 sera, decisione del proprietario: anche i cinque giochi di carte (Poker 1v1, Poker a 5, Blackjack 1v1,
   Sette e mezzo, Mano sul mazzo) entrano, solo gratis. Nomi visibili neutri.
   min/max = giocatori; durata = minuti indicativi (stime dove il catalogo non la dice);
   bot = esiste l'allenamento coi bot; ban = c'e' il banner 16:9 per il carosello. */
window.GX_CATEGORIE = [
  ['tutti', 'Tutti'],
  ['live',  'Tempo reale'],
  ['carte', 'Carte'],
  ['party', 'Party'],
  ['tavolo','Tavolo'],
  ['sport', 'Sport']
];

window.GX_GIOCHI = [
  // ── tempo reale
  {id:'turf',    cat:'live',  nome:'City Royale', sotto:'Battle royale in città', min:2, max:10, durata:'~6 min', bot:true, ban:true /* banner nuovo, adatto a Discord (16/11) */,
   descr:'Battle royale dall\'alto: armi, auto, covi e una zona che brucia e si stringe. Vince l\'ultimo in piedi.'},
  {id:'race',    cat:'live',  nome:'Street Race', sotto:'Piste sempre nuove, derapate e boost', min:2, max:10, durata:'~3 min', bot:true, ban:true,
   descr:'Corse su piste generate ogni volta: derapate, boost e scie. Ognuno personalizza la sua auto.'},
  {id:'glad',    cat:'live',  nome:'Colosseo', sotto:'Tutti contro tutti, spada e scudo', min:2, max:8, durata:'~3 min', bot:true, ban:true,
   descr:'Tutti contro tutti nell\'arena con spada, scudo e parata al momento giusto. L\'ultimo in piedi vince.'},
  {id:'scalata', cat:'live',  nome:'Dead Peak', sotto:'Scalata con trappole e lava', min:2, max:10, durata:'~3 min', bot:true, ban:true,
   descr:'Corsa verso la vetta: trappole a ritmo, spinte agli avversari e lava che sale. Il primo in cima vince.'},
  {id:'smash',   cat:'live',  nome:'Smash', sotto:'Picchiaduro: buttali fuori', min:2, max:4, durata:'~4 min', bot:true, ban:true,
   descr:'Il picchiaduro: tanti lottatori, arene diverse, tre vite a testa. Buttali fuori dal ring.'},
  {id:'tank',    cat:'live',  nome:'Tank Duel', sotto:'Carri armati, uno contro uno', min:2, max:2, durata:'~2 min', bot:true,
   descr:'Due carri armati, sponde e missili. Chi colpisce per primo l\'altro tre volte vince.'},
  {id:'alley',   cat:'live',  nome:'Vicoli', sotto:'Dinamite nel cantiere, una vita', min:2, max:2, durata:'~90 s', bot:true,
   descr:'Un cantiere, la dinamite e una vita sola. Chiudi l\'avversario prima che lui chiuda te.'},
  {id:'snake',   cat:'live',  nome:'Snake Arena', sotto:'Cresci e taglia la strada', min:2, max:2, durata:'~2 min', bot:true,
   descr:'Il serpente classico, ma contro un altro: cresci e tagliagli la strada.'},
  {id:'draw',    cat:'live',  nome:'Quick Draw', sotto:'Riflessi western, con le finte', min:2, max:2, durata:'~1 min', bot:true,
   descr:'Duello western: spara al segnale, non prima. Attento alle finte.'},
  // ── carte
  {id:'uno',     cat:'carte', nome:'UNO', sotto:'Classico o No Mercy', min:2, max:10, durata:'~8 min', bot:true, ban:true,
   descr:'Classico o No Mercy, da 2 a 10 al tavolo. Si sceglie il mazzo prima di sedersi.'},
  {id:'cucu',    cat:'carte', nome:'Cucù', sotto:'Una carta a testa: tienila o passala', min:2, max:10, durata:'~5 min', bot:true, ban:true /* banner nuovo, adatto a Discord (16/11) */,
   descr:'Una carta a testa: la tieni o la passi al vicino. Chi resta con la più bassa perde una vita.'},
  {id:'uomonero',cat:'carte', nome:'Uomo Nero', sotto:'Scarta le coppie, non restare col nero', min:3, max:8, durata:'~3 min', bot:true, ban:true,
   descr:'Si scartano le coppie e si pesca dal vicino. Chi resta con l\'Uomo Nero in mano ha perso.'},
  {id:'burraco', cat:'carte', nome:'Burraco', sotto:'A coppie o tutti contro tutti', min:2, max:4, durata:'~20 min', bot:true, ban:true,
   descr:'Scale e tris fino al burraco: pozzetti, matte e pinelle. A coppie o tutti contro tutti.'},
  {id:'scopa',   cat:'carte', nome:'Scopa', sotto:'Carte, denari e primiera', min:2, max:2, durata:'~3 min', bot:true,
   descr:'La classica con le napoletane: carte, denari, settebello e primiera.'},
  {id:'briscola',cat:'carte', nome:'Briscola', sotto:'Le napoletane: 61 per vincere', min:2, max:2, durata:'~3 min', bot:true,
   descr:'Briscola a due con le napoletane. Servono 61 punti per vincere la mano.'},
  {id:'pk1v1',   cat:'carte', nome:'Poker 1v1', sotto:'Testa a testa, Texas hold’em', min:2, max:2, durata:'~6 min', bot:true,
   descr:'Texas hold’em a due. Si parte pari con lo stesso numero di punti: vince chi li prende tutti.'},
  {id:'pk5',     cat:'carte', nome:'Poker a 5', sotto:'Tavolo da cinque, ti siedi quando vuoi', min:2, max:5, durata:'~15 min', bot:false,
   descr:'Poker all’italiana fino a cinque al tavolo. Si gioca per il gusto della mano: niente in palio.'},
  {id:'bj1v1',   cat:'carte', nome:'Blackjack 1v1', sotto:'Chi si avvicina di più a 21', min:2, max:2, durata:'~4 min', bot:true,
   descr:'Due giocatori, un mazzo: carta o stai. Chi arriva più vicino a 21 senza sballare vince la mano.'},
  {id:'settemezzo',cat:'carte',nome:'Sette e mezzo', sotto:'Carta o sto? Senza banco', min:2, max:6, durata:'~5 min', bot:true,
   descr:'Il classico con le napoletane, senza banco: carta o sto, e chi sballa oltre sette e mezzo è fuori dalla mano.'},
  {id:'tappo',   cat:'carte', nome:'Mano sul mazzo', sotto:'Quattro uguali, poi la mano sul mazzo', min:2, max:7, durata:'~4 min', bot:true,
   descr:'Si passano le carte in giro finché qualcuno fa quattro uguali: allora tutti giù con la mano sul mazzo, l’ultimo perde.'},
  // ── party
  {id:'lupus',   cat:'party', nome:'Lupus', sotto:'Lupi contro villaggio', min:5, max:10, durata:'~15 min', bot:true, ban:true /* banner nuovo, adatto a Discord (16/11) */,
   descr:'Di notte il lupo sbrana, di giorno il villaggio processa. Bugie, accuse e voti: perfetto col vocale aperto.'},
  {id:'lastcall',cat:'party', nome:'Last Call', sotto:'Peschi finché non ti becca il buttafuori', min:2, max:7, durata:'~5 min', bot:true, ban:true /* banner nuovo, adatto a Discord (16/11) */,
   descr:'Peschi finché non ti becca il buttafuori; la mazzetta lo ferma. Chi resta in piedi vince.'},
  {id:'geo',     cat:'party', nome:'Geo', sotto:'Indovina dove sei', min:2, max:8, durata:'~5 min', bot:true, ban:true /* banner nuovo, adatto a Discord (16/11) */,
   descr:'Una foto da un posto del mondo: indovina dove sei. Il più vicino fa più punti.'},
  {id:'deadmoney',cat:'party',nome:'Dead Quiz', sotto:'Il quiz dove chi sbaglia muore', min:3, max:8, durata:'~15 min', bot:true, ban:true /* banner nuovo, adatto a Discord (16/11) */,
   descr:'Un quiz in un hotel maledetto: chi sbaglia muore, i fantasmi continuano a giocare. Chi scappa vince.'},
  // ── tavolo
  {id:'kaiju',   cat:'tavolo',nome:'Kaiju Battle', sotto:'Dadi, mostri e una città da prendere', min:2, max:5, durata:'~10 min', bot:true, ban:true,
   descr:'Tiri i dadi, picchi chi sta in città e compri poteri. Vince chi arriva a 20 stelle o resta l\'ultimo in piedi.'},
  {id:'pool8',   cat:'tavolo',nome:'Biliardo', sotto:'8-ball vero o 15 rapido', min:2, max:2, durata:'~3 min', bot:true,
   descr:'Biliardo all\'americana: 8-ball vero oppure la versione rapida a 15.'},
  {id:'shove',   cat:'tavolo',nome:'Shove', sotto:'Curling di strada', min:2, max:2, durata:'~2 min', bot:true,
   descr:'Curling di strada: lancia il disco nelle zone giuste e sgancia quelli dell\'altro.'},
  {id:'dama',    cat:'tavolo',nome:'Dama', sotto:'Italiana o russa', min:2, max:2, durata:'~4 min', bot:true,
   descr:'Dama italiana o russa, scegli tu le regole prima di iniziare.'},
  {id:'backg',   cat:'tavolo',nome:'Backgammon', sotto:'Dadi, punte e bear-off', min:2, max:2, durata:'~5 min', bot:true,
   descr:'Il backgammon classico: dadi, punte e bear-off.'},
  {id:'chess',   cat:'tavolo',nome:'Scacchi', sotto:'Scacchi veri, orologio blitz', min:2, max:2, durata:'~10 min', bot:true,
   descr:'Scacchi con le regole vere e l\'orologio blitz.'},
  {id:'bs',      cat:'tavolo',nome:'Battaglia navale', sotto:'Schiera la flotta, affonda la loro', min:2, max:2, durata:'~5 min', bot:false,
   descr:'Schiera la flotta di nascosto e affonda quella dell\'altro, colpo dopo colpo.'},
  // ── sport
  {id:'calcio',  cat:'sport', nome:'Derby', sotto:'Calcio a squadre', min:4, max:8, durata:'~4 min', bot:true, ban:true,
   descr:'Calcio dall\'alto a squadre: passaggi, bolidi, cross e scivolate. Perfetto per un canale pieno.'},
  {id:'pong',    cat:'sport', nome:'Neon Pong', sotto:'Effetti e power-up', min:2, max:2, durata:'~2 min', bot:true,
   descr:'Pong al neon con effetti, trattini e power-up.'},
  {id:'sumo',    cat:'sport', nome:'Sumo', sotto:'Buttalo giù dal dohyo', min:2, max:2, durata:'~1 min', bot:true,
   descr:'Due lottatori, un cerchio. Buttalo fuori dal dohyo.'},
  {id:'basket',  cat:'sport', nome:'Basket', sotto:'Tiri ad arco, ferro vero', min:2, max:2, durata:'60 s', bot:true,
   descr:'Sessanta secondi di tiri ad arco con il ferro vero. Chi segna di più vince.'},
  {id:'archery', cat:'sport', nome:'Arco', sotto:'5 frecce, vento variabile', min:2, max:2, durata:'~2 min', bot:true,
   descr:'Cinque frecce a testa e un vento che cambia. Vince il punteggio più alto.'},
  {id:'golf',    cat:'sport', nome:'Minigolf', sotto:'3 buche sempre nuove', min:2, max:2, durata:'~3 min', bot:true,
   descr:'Tre buche generate ogni volta. Meno colpi, meglio è.'},
  {id:'boxe',    cat:'sport', nome:'Boxe', sotto:'Carica il colpo, 3 atterramenti', min:2, max:2, durata:'~5 min', bot:true,
   descr:'Carica il colpo e mira bene: tre atterramenti e l\'incontro è finito.'}
];

/* lotto 5: le varianti (un gioco nel catalogo, due giochi sul server). Il primo e' quello di serie. */
window.GX_VARIANTI = {
  uno:   [['unoc', 'Classico'], ['uno', 'No Mercy']],
  pool8: [['pool8', '8-ball'], ['pool15', '8-15 rapido']],
  dama:  [['dama', 'Italiana'], ['damaru', 'Russa']]
};

/* ordine del carosello in alto: i giochi che stanno bene con tutto il canale */
window.GX_CAROSELLO = ['smash','uno','calcio','glad','race','kaiju','burraco','scalata','uomonero'];
