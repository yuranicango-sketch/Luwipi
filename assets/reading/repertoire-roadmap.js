(()=>{
  "use strict";
  const root=document.getElementById("repertoireRoadmap");if(!root)return;
  // Comparison: original piano score when one exists; songs/transcriptions use a simple piano arrangement.
  // An available excerpt is explicitly labelled. Other titles are study references, not advertised as playable.
  const works=[
    ["Brilha, brilha, estrelinha","P","Graus conjuntos · salto de 5.ª","twinkle","public"],
    ["Ode à Alegria · Beethoven","C","Pulso · frases de 4 compassos","ode","public"],
    ["Jingle Bells · Pierpont","P","Repetição de motivo · colcheias no refrão","jingle","public"],
    ["Parabéns pra você","P","Anacruse · 3/4",null,"public"],
    ["Amazing Grace","P","Anacruse · frase em 3/4",null,"public"],
    ["When the Saints Go Marching In","P","Anacruse · articulação swing no arranjo",null,"public"],
    ["Noite Feliz · Gruber","P","6/8 · semínima pontuada",null,"public"],
    ["Greensleeves","P","Modo menor · 6/8 nesta versão",null,"public"],
    ["Minueto em Sol · Petzold, BWV Anh. 114","C","3/4 · duas mãos · Fá♯","minuet","public"],
    ["Melodia · Schumann, Op. 68 nº 1","C","Melodia e acompanhamento · duas mãos",null,"public"],
    ["Canção de Ninar · Brahms, Op. 49 nº 4","C","3/4 · arranjo de piano com arpejo",null,"public"],
    ["Marcha dos Soldados · Schumann, Op. 68 nº 2","C","Acentos · articulação curta",null,"public"],
    ["Stand By Me · Ben E. King","P","I–vi–IV–V · padrão de baixo",null,"protected"],
    ["Let It Be · Beatles","P","I–V–vi–IV · ritmo pontuado",null,"protected"],
    ["Arabesque · Burgmüller, Op. 100 nº 2","C","Semicolcheias · articulação rápida",null,"public"],
    ["Prelúdio em Dó · Bach, BWV 846","C","Arpejos contínuos · harmonia",null,"public"],
    ["Gymnopédie nº 1 · Satie","C","3/4 · saltos no baixo · acordes",null,"public"],
    ["Imagine · Lennon","P","Acompanhamento em arpejos",null,"protected"],
    ["Asa Branca · Gonzaga e Teixeira","P","Baião · síncope no arranjo",null,"protected"],
    ["Sonatina · Clementi, Op. 36 nº 1","C","Escalas · forma clássica",null,"public"],
    ["Prelúdio · Chopin, Op. 28 nº 7","C","Fraseado · ritmo pontuado",null,"public"],
    ["Für Elise · Beethoven, WoO 59","C","Peça completa · ornamentos · contrastes",null,"public"],
    ["Hallelujah · Cohen","P","6/8 · melodia e cifras",null,"protected"],
    ["Yesterday · Beatles","P","Frases irregulares · acordes com 7.ª",null,"protected"],
    ["Autumn Leaves · Kosma e Prévert","P","ii–V–I · leitura de lead sheet",null,"protected"],
    ["Garota de Ipanema · Jobim e Vinicius","P","Bossa nova · acordes alterados",null,"protected"],
    ["Sonata em Dó · Mozart, K. 545 · 1º mov.","C","Escalas · clareza das duas mãos",null,"public"],
    ["Prelúdio · Chopin, Op. 28 nº 4","C","Voz superior · harmonia cromática",null,"public"],
    ["Sonata ao Luar · Beethoven, Op. 27 nº 2 · 1º mov.","C","Tercinas contínuas · vozes simultâneas",null,"public"],
    ["Sonata Patética · Beethoven, Op. 13 · 2º mov.","C","Melodia cantabile · acompanhamento",null,"public"],
    ["Fly Me to the Moon · Howard","P","Ciclo de quintas · swing",null,"protected"],
    ["Wave · Jobim","P","Harmonia de jazz · modulações",null,"protected"],
    ["Invenção nº 8 · Bach, BWV 779","C","Duas linhas independentes",null,"public"],
    ["Noturno · Chopin, Op. 9 nº 2","C","12/8 · ornamentos · rubato",null,"public"],
    ["Superstition · Stevie Wonder","P","Semicolcheias · groove funk",null,"protected"],
    ["Clair de Lune · Debussy","C","Mudança de compasso · textura · pedal",null,"public"],
    ["Águas de Março · Jobim","P","Fraseado sincopado · baixo descendente",null,"protected"],
    ["Take Five · Paul Desmond","P","5/4 · swing e independência",null,"protected"],
    ["Bohemian Rhapsody · Queen","P","Forma extensa · mudanças de tonalidade",null,"protected"],
    ["Fantasia-Improviso · Chopin, Op. 66","C","Polirritmia 4 contra 3 · velocidade",null,"public"]
  ];
  const names=["Primeiras melodias","Frase e compasso","Duas mãos","Coordenação","Expressão","Harmonia e forma","Independência","Avançado"];
  const escape=value=>String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
  root.innerHTML=`<button class="repertoire-open" type="button" aria-expanded="false" aria-controls="repertoireLevels"><span><strong>40 peças por dificuldade</strong><small>8 níveis · clássico e popular</small></span><b aria-hidden="true">⌄</b></button><div id="repertoireLevels" hidden><p class="repertoire-rule">Clássicos: partitura original de piano, quando existe. Canções: melodia com acompanhamento simples. A dificuldade muda com o arranjo; dentro do nível, a ordem é uma sugestão de progressão.</p>${names.map((name,level)=>`<details class="repertoire-level" ${level===0?"open":""}><summary><span>Nível ${level+1} <strong>${name}</strong></span><small>${level*5+1}–${level*5+5} / 40</small></summary><ol start="${level*5+1}">${works.slice(level*5,level*5+5).map(([title,kind,focus,songId,rights])=>`<li><div class="repertoire-item"><span class="repertoire-kind" aria-label="${kind==="C"?"Clássico":"Popular"}">${kind}</span><div><strong>${escape(title)}</strong><small>${escape(focus)}</small><em>${songId?"Trecho disponível":rights==="protected"?"Referência · partitura não incluída":"Referência · partitura ainda não incluída"}</em></div>${songId?`<button type="button" data-repertoire-song="${songId}">Tocar trecho</button>`:""}</div></li>`).join("")}</ol></details>`).join("")}</div>`;
  const open=root.querySelector(".repertoire-open"),levels=root.querySelector("#repertoireLevels"),library=root.nextElementSibling;
  open.addEventListener("click",()=>{const expanded=open.getAttribute("aria-expanded")!=="true";open.setAttribute("aria-expanded",String(expanded));levels.hidden=!expanded;if(library?.classList.contains("song-list"))library.hidden=expanded});
  root.addEventListener("click",event=>{const button=event.target.closest("[data-repertoire-song]");if(!button)return;document.querySelector(`.song-list [data-song="${button.dataset.repertoireSong}"][data-version="right"]`)?.click()});
})();
