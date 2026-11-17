[
/* lotto 4 */
/* LOTTO 4 · City Royale: le insegne della citta' 3D (gcr3d.html) senza casino'/soldi/marchio. Solo testi e due tratti
     della mascotte al neon (gli occhi Bitcoin/Ethereum diventano pupille); geometria, mappa e gioco invariati. */
  {nome: 'L4 turf insegne neon', pagina: 'gcr3d.html',
   re: /const INSEGNE = \['HOTEL', 'BAR', 'CASINÒ', 'BISCA', 'DANCING', 'GAMBLER', 'PIZZA', 'PRESTITI'\];/,
   con: "const INSEGNE = ['HOTEL', 'BAR', 'ARCADE', 'CLUB', 'DANCING', 'PIXEL', 'PIZZA', 'CINEMA'];   /* DISCORD L4 */"},
  {nome: 'L4 turf negozio pegni', pagina: 'gcr3d.html',
   re: /negozio\(TILE\.NEG_PEGNI, '#34343c', '#1f2a1a', '#d9ff9a', 'PEGNI', '#1d5c2e'\);/,
   con: "negozio(TILE.NEG_PEGNI, '#34343c', '#1f2a1a', '#d9ff9a', 'DINER', '#1d5c2e');"},
  {nome: 'L4 turf negozio casino', pagina: 'gcr3d.html',
   re: /negozio\(TILE\.NEG_CASINO, '#15121c', '#3a1020', '#ffd36b', 'CASINÒ', '#6b1030'\);/,
   con: "negozio(TILE.NEG_CASINO, '#15121c', '#3a1020', '#ffd36b', 'ARCADE', '#6b1030');"},
  {nome: 'L4 turf cartellone', pagina: 'gcr3d.html',
   re: /gg\.fillText\('GAMBLER', AT \/ 2, 44\); gg\.fillStyle = '#fff'; gg\.font = 'bold 13px sans-serif'; gg\.fillText\('CITY CASINÒ', AT \/ 2, 66\);/,
   con: "gg.fillText('CITY', AT / 2, 44); gg.fillStyle = '#fff'; gg.font = 'bold 13px sans-serif'; gg.fillText('ROYALE', AT / 2, 66);"},
  {nome: 'L4 turf insegna tetto', pagina: 'gcr3d.html',
   re: /scritta\('GAMBLER', 735, 118, 118, '#ffcf3a', SEZ\.GAMBLER, 4\);\s*scritta\('BOT', 735, 236, 112, '#25e36b', SEZ\.BOT, 14\);\s*scritta\('CASINÒ', 735, 372, 120, '#ff2d95', SEZ\.CASINO, 6\);\s*scritta\('7 7 7', 735, 460, 44, '#ff4d4d', SEZ\.SETTE, 0\);/,
   con: "scritta('CITY', 735, 118, 118, '#ffcf3a', SEZ.GAMBLER, 4);\n    scritta('ROYALE', 735, 236, 112, '#25e36b', SEZ.BOT, 6);\n    scritta('ARCADE', 735, 372, 120, '#ff2d95', SEZ.CASINO, 6);\n    scritta('★ ★ ★', 735, 460, 44, '#ff4d4d', SEZ.SETTE, 0);"},
  {nome: 'L4 turf mascotte G del cappello', pagina: 'gcr3d.html',
   re: /tubo\(p => \{ p\.arc\(cx, cy - 128, 11, -0\.3, Math\.PI \* 1\.55\); p\.moveTo\(cx \+ 2, cy - 128\); p\.lineTo\(cx \+ 11, cy - 128\); \}, '#ffcf3a', 4, SEZ\.G\);/,
   con: "tubo(p => { p.moveTo(cx, cy - 141); p.lineTo(cx + 4, cy - 132); p.lineTo(cx + 13, cy - 131); p.lineTo(cx + 6, cy - 124); p.lineTo(cx + 8, cy - 115); p.lineTo(cx, cy - 120); p.lineTo(cx - 8, cy - 115); p.lineTo(cx - 6, cy - 124); p.lineTo(cx - 13, cy - 131); p.lineTo(cx - 4, cy - 132); p.closePath(); }, '#ffcf3a', 3, SEZ.G);"},
  {nome: 'L4 turf mascotte occhio sx', pagina: 'gcr3d.html',
   re: /tubo\(p => \{ p\.moveTo\(cx - 52, cy - 22\); p\.lineTo\(cx - 52, cy \+ 12\);[^\n]*SEZ\.BTC\);/,
   con: "tubo(p => { p.arc(cx - 45, cy - 5, 11, 0, Math.PI * 2); }, '#39ff6e', 3.5, SEZ.BTC);"},
  {nome: 'L4 turf mascotte occhio dx', pagina: 'gcr3d.html',
   re: /tubo\(p => \{ p\.moveTo\(cx \+ 45, cy - 27\); p\.lineTo\(cx \+ 60, cy - 3\);[^\n]*SEZ\.ETH\);/,
   con: "tubo(p => { p.arc(cx + 45, cy - 5, 11, 0, Math.PI * 2); }, '#3aa8ff', 3.5, SEZ.ETH);"},
/* lotto 6 */
/* DISCORD lotto 6 — le DENARI delle napoletane della mini app hanno il simbolo del Bitcoin sulle monete (carte/00-09.webp).
     Dentro Discord le carte 0-9 si prendono da giochi/carte_dc/ (stesse carte, monete con una rosa al posto del ₿:
     lotto6/strumenti/denari_senza_btc.py). Le altre carte e il dorso restano quelli della mini app (/app/carte/). */
  {nome: 'L6 denari senza bitcoin (sette e mezzo)', pagina: 'settemezzo.html',
   re: /const nomeFile = c => 'carte\/' \+ \(c < 10 \? '0' : ''\) \+ c \+ '\.webp';/,
   con: "const nomeFile = c => (c < 10 ? (window.GXDC_RADICE || '/') + 'giochi/carte_dc/0' + c : 'carte/' + c) + '.webp';   /* DISCORD L6 */"},
  /* le regole di Sette e mezzo mostrano il 7 e il re di denari (la MATTA) scritti nel testo della guida */
  {nome: 'L6 denari senza bitcoin (sette e mezzo, guida 7)', pagina: 'settemezzo.html',
   re: /<img src="carte\/06\.webp" alt="">/,
   con: "<img src=\"' + (window.GXDC_RADICE || '/') + 'giochi/carte_dc/06.webp\" alt=\"\">"},
  {nome: 'L6 denari senza bitcoin (sette e mezzo, guida matta)', pagina: 'settemezzo.html',
   re: /<img src="carte\/09\.webp" alt="">/,
   con: "<img src=\"' + (window.GXDC_RADICE || '/') + 'giochi/carte_dc/09.webp\" alt=\"\">"},
  {nome: 'L6 denari senza bitcoin (mano sul mazzo)', pagina: 'tappo.html',
   re: /const fileCarta = c => 'carte\/' \+ \(c < 10 \? '0' : ''\) \+ c \+ '\.webp';/,
   con: "const fileCarta = c => (c < 10 ? (window.GXDC_RADICE || '/') + 'giochi/carte_dc/0' + c : 'carte/' + c) + '.webp';   /* DISCORD L6 */"},
  {nome: 'L6 denari senza bitcoin (briscola)', pagina: 'briscola.html',
   re: /const file = c => 'carte\/' \+ \(c === 'dorso' \? 'dorso' : \(c < 10 \? '0' \+ c : '' \+ c\)\) \+ '\.webp';/,
   con: "const file = c => (c !== 'dorso' && c < 10 ? (window.GXDC_RADICE || '/') + 'giochi/carte_dc/0' + c : 'carte/' + c) + '.webp';   /* DISCORD L6 */"},
  /* PER IL LOTTO 2 (Scopa, nell'index): stesso mazzo, stesse monete col ₿. Proposta: l'integratore decide se tenerla. */
  {nome: 'L6 denari senza bitcoin (scopa, lotto 2)', pagina: 'index.html',
   re: /im\.src='carte\/'\+\(c==='dorso'\?'dorso':\(c<10\?'0'\+c:''\+c\)\)\+'\.webp';/,
   con: "im.src=(c!=='dorso'&&c<10?(window.GXDC_RADICE||'/')+'giochi/carte_dc/0'+c:'carte/'+c)+'.webp';   /* DISCORD L6 */"},
/* pc_fix (17/11) */
/* LUPUS su PC: la tela 3D si misura sul suo riquadro (#scena) invece che su #app. Sul telefono #scena e' #app
     (inset:0): stessa misura di prima. Su PC (extra.css pc_fix) #scena e' il borgo a sinistra e #app la colonna a destra. */
  {nome: 'PC lupus ridimensiona', pagina: 'lupus3d.html',
   re: /var app = \$\("#app"\), w = app\.clientWidth, h = app\.clientHeight;/,
   con: 'var app = $("#scena") || $("#app"), w = app.clientWidth, h = app.clientHeight;   /* DISCORD pc_fix */'},
/* LAST CALL: le illustrazioni con fiche, monete, banconote, occhi a Bitcoin/Ethereum e la G del marchio sul cilindro
     -> ridisegnate neutre (stessa mano, stessa inquadratura) in giochi/lastcall_dc/; le icone d'angolo a fiche/banconota
     in giochi/lastcall_dc/ic/. Le altre carte restano quelle della mini app. Due caricatori (pagina sola / guscio). */
  {nome: 'PC lastcall arte neutra 1', pagina: 'lastcall.html',
   re: /carica\(LC_DIR \+ id \+ '\.webp', function \(im\) \{ lcArte\(id, im\); \}\);\n(\s*)carica\(LC_DIR \+ 'ic\/' \+ id \+ '\.png', function \(im\) \{ lcIcona\(id, im\); \}\);/,
   con: "carica((/^(bancarotta|buttafuori|conto_aperto|contromano|dal_fondo|impila_due|jolly|mazzetta|occhi_chiusi|paga_tu|pago_io|passo|primo_ultimo|raddoppio|rimescola|sangue_freddo|sbircia|sbircia_due|segnato|sottobanco|tok_bandiera|tok_caveau|tok_citta|tok_colosseo|tok_ring|ultimo_ordine)$/.test(id) ? (window.GXDC_RADICE || '/') + 'giochi/lastcall_dc/' : LC_DIR) + id + '.webp', function (im) { lcArte(id, im); });   /* DISCORD pc_fix */\n$1carica((/^(jolly|mazzetta|tok_bandiera|tok_caveau|tok_citta|tok_colosseo|tok_ring)$/.test(id) ? (window.GXDC_RADICE || '/') + 'giochi/lastcall_dc/' : LC_DIR) + 'ic/' + id + '.png', function (im) { lcIcona(id, im); });"},
  {nome: 'PC lastcall arte neutra 2', pagina: 'lastcall.html',
   re: /carica\(LC_DIR \+ id \+ "\.webp" \+ V, function \(im\) \{ lcArte\(id, im\); \}\);\n(\s*)carica\(LC_DIR \+ "ic\/" \+ id \+ "\.png" \+ V, function \(im\) \{ lcIcona\(id, im\); \}\);/,
   con: "carica((/^(bancarotta|buttafuori|conto_aperto|contromano|dal_fondo|impila_due|jolly|mazzetta|occhi_chiusi|paga_tu|pago_io|passo|primo_ultimo|raddoppio|rimescola|sangue_freddo|sbircia|sbircia_due|segnato|sottobanco|tok_bandiera|tok_caveau|tok_citta|tok_colosseo|tok_ring|ultimo_ordine)$/.test(id) ? (window.GXDC_RADICE || '/') + 'giochi/lastcall_dc/' : LC_DIR) + id + '.webp' + V, function (im) { lcArte(id, im); });   /* DISCORD pc_fix */\n$1carica((/^(jolly|mazzetta|tok_bandiera|tok_caveau|tok_citta|tok_colosseo|tok_ring)$/.test(id) ? (window.GXDC_RADICE || '/') + 'giochi/lastcall_dc/' : LC_DIR) + 'ic/' + id + '.png' + V, function (im) { lcIcona(id, im); });"},
/* DEAD QUIZ: avatar e stanze con slot, dadi, fiche, monete e banconote, il logo DEAD MONEY con la fiche -> versioni neutre
     (stessa mano) in giochi/deadmoney_dc/. Tutte le immagini della pagina passano da dmUrl. */
  {nome: 'PC deadmoney arte neutra', pagina: 'deadmoney.html',
   re: /const dmUrl = rel => DM_LOTTI\[rel\] \|\| \("dm_asset\/" \+ rel\);/,
   con: "const dmUrl = rel => (/^img\\/(bg_sala|bg_salone|bot_03|bot_06|bot_10|bot_12|host_soldi|logo|sala_avidita|sala_bj|sala_conta|sala_dadi|sala_duello|sala_gratta|sala_memoria|sala_plinko|sala_prendi)\\.webp$/.test(rel) ? (window.GXDC_RADICE || '/') + 'giochi/deadmoney_dc/' + rel.slice(4) : (DM_LOTTI[rel] || (\"dm_asset/\" + rel)));   /* DISCORD pc_fix */"},
/* LUPUS: la faccia dei robot (medaglioni sopra le case, robot del borgo) aveva gli occhi a moneta Bitcoin/Ethereum:
     dentro Discord due occhi luminosi verdi con la pupilla (stessa misura, stesso alone). */
  {nome: 'PC lupus occhi senza cripto', pagina: 'lupus3d.html',
   re: /\/\* occhio sinistro: Bitcoin oro \*\/[\s\S]*?\/\* riflesso vetro \(ellipse/,
   con: "/* DISCORD pc_fix: occhi luminosi (niente Bitcoin/Ethereum) */\n    [exL, exR].forEach(function (ox) {\n        alone(ox, ey, er, \"rgba(80,230,150,0.75)\");\n        var mg = g.createRadialGradient(ox - 9, ey - 9, 4, ox, ey, er);\n        mg.addColorStop(0, \"#d8ffe9\"); mg.addColorStop(0.55, \"#5fe39a\"); mg.addColorStop(1, \"#1b7a48\");\n        g.fillStyle = mg; g.beginPath(); g.arc(ox, ey, er, 0, Math.PI * 2); g.fill();\n        g.lineWidth = 4; g.strokeStyle = \"#dffbea\"; g.stroke();\n        g.fillStyle = \"#0c1a14\"; g.beginPath(); g.arc(ox + 3, ey + 3, er * 0.42, 0, Math.PI * 2); g.fill();\n    });\n\n    /* riflesso vetro (ellipse"},
/* LUPUS: il ruolo del borgo senza poteri si chiamava «Gambler» (il marchio): dentro Discord «Paesano» */
  {nome: 'PC lupus ruolo paesano 1', pagina: 'lupus3d.html',
   re: /nome: "Gambler", squadra: "borgo", posti: 1, min: 5,/, con: 'nome: "Paesano", squadra: "borgo", posti: 1, min: 5,'},
  {nome: 'PC lupus ruolo paesano 2', pagina: 'lupus3d.html',
   re: /t: "IL GAMBLER", i: "B", c: "#4a3f68"/, con: 't: "IL PAESANO", i: "P", c: "#4a3f68"'},
  {nome: 'PC lupus ruolo paesano 3', pagina: 'lupus3d.html',
   re: /id="sRuolo">sei un <b>GAMBLER<\/b>/, con: 'id="sRuolo">sei un <b>PAESANO</b>'},
  {nome: 'PC lupus ruolo paesano 4', pagina: 'lupus3d.html',
   re: /n === "Gambler"\) \{ return ecoL\("sei un <b>GAMBLER<\/b>"\); \}/, con: 'n === "Gambler" || n === "Paesano") { return ecoL("sei un <b>PAESANO</b>"); }'},
/* SCOPA su PC orizzontale (solo Discord): il tavolo prende la forma dello schermo (rapporto in extra.js pc_fix) e le misure
     delle carte, che nascevano dalla LARGHEZZA di una tela verticale, si fermano all'altezza. Solo se la tela e' piu'
     larga che alta: sul telefono (tela verticale) nessuna misura cambia. */
  {nome: 'PC scopa carte in orizzontale 1', pagina: 'index.html',
   re: /var cw=Math\.min\(w\*0\.205,\(w-2\*gap-w\*0\.04\)\/Math\.max\(3,handN\)\)\*0\.98,chh=cw\*1\.5;/,
   con: "var cw=Math.min(w*0.205,(w-2*gap-w*0.04)/Math.max(3,handN))*0.98,chh=cw*1.5;\n  if(w>hh){cw=Math.min(cw,hh*0.2);chh=cw*1.5;}   /* DISCORD pc_fix */"},
  {nome: 'PC scopa carte in orizzontale 2', pagina: 'index.html',
   re: /var rgap=Math\.max\(8,hh\*0\.011\),TWMAX=w\*0\.185;/,
   con: "var rgap=Math.max(8,hh*0.011),TWMAX=w*0.185;\n  if(w>hh)TWMAX=Math.min(TWMAX,hh*0.17);   /* DISCORD pc_fix */"},
  {nome: 'PC scopa carte in orizzontale 3', pagina: 'index.html',
   re: /var dw=Math\.max\(26,w\*0\.088\),dh=dw\*1\.5,margin=Math\.max\(8,w\*0\.025\);\n(\s*)var ow=Math\.max\(24,w\*0\.072\),oh=ow\*1\.5;/,
   con: "var dw=Math.max(26,w*0.088),dh=dw*1.5,margin=Math.max(8,w*0.025);\n$1var ow=Math.max(24,w*0.072),oh=ow*1.5;\n$1if(w>hh){dw=Math.max(26,hh*0.085);dh=dw*1.5;ow=Math.max(24,hh*0.07);oh=ow*1.5;margin=Math.max(8,hh*0.03);}   /* DISCORD pc_fix */"},
  {nome: 'PC scopa cornice in orizzontale', pagina: 'index.html',
   re: /var rail=Math\.max\(6,w\*0\.028\);/,
   con: "var rail=Math.max(6,(w>hh?hh:w)*0.028);   /* DISCORD pc_fix */"},
  {nome: 'PC scopa mano sopra la cornice', pagina: 'index.html',
   re: /var hy=hh-chh-Math\.max\(10,hh\*0\.024\),hx0=w\/2-\(handN\*\(cw\+gap\)-gap\)\/2;/,
   con: "var hy=hh-chh-Math.max(10,hh*(w>hh?0.045:0.024)),hx0=w/2-(handN*(cw+gap)-gap)/2;   /* DISCORD pc_fix */"}
]
