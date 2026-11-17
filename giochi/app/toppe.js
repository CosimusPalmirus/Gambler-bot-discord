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
   con: "im.src=(c!=='dorso'&&c<10?(window.GXDC_RADICE||'/')+'giochi/carte_dc/0'+c:'carte/'+c)+'.webp';   /* DISCORD L6 */"}
]
