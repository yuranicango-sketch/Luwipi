const colors={C:'#ef7f87',D:'#f0a85c',E:'#e2c44e',F:'#64b994',G:'#5aa7d9',A:'#8778d8',B:'#cb79b7'};
const names={C:'Dó',D:'Ré',E:'Mi',F:'Fá',G:'Sol',A:'Lá',B:'Si'};
const chars={C:'Dori',D:'Reni',E:'Mini',F:'Fali',G:'Soli',A:'Lala',B:'Sibi'};
const views=Object.fromEntries(['reading','song','games','tasks','printables','readingImported'].map(name=>[name,document.getElementById(name+'View')]));
const luwipiMode='aprenda';
function nav(name){
 stopPlay();window.LuwipiReadingLibrary?.stop?.();
 Object.values(views).forEach(v=>v.classList.remove('active'));document.getElementById('soundBubblesView').classList.remove('active');
 (views[name]||views.reading).classList.add('active');syncReadingPiano(name);scrollTo(0,0);
 document.dispatchEvent(new CustomEvent('luwipi:navigate',{detail:{name}}));
}
document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>nav(b.dataset.nav));
function legendHtml(){return Object.keys(names).map(k=>`<div class="chip"><span class="dot" style="background:${colors[k]}"></span>${chars[k]}</div>`).join('')}

/* ---------- pitch helpers ---------- */
const letters=['C','D','E','F','G','A','B'];
function parsePitch(n){const m=/^([A-G])([#b]?)(-?\d+)$/.exec(n||'');return m?{l:m[1],a:m[2],o:+m[3]}:null}
function dia(n){const p=parsePitch(n);return p?p.o*7+letters.indexOf(p.l):0}
function step(n,clef){return dia(n)-dia(clef==='treble'?'E4':'G2')}
function staffY(n,clef,bottom){return bottom-step(n,clef)*6}

const sharpNames=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const ptKeys=['Dó','Dó♯','Ré','Ré♯','Mi','Fá','Fá♯','Sol','Sol♯','Lá','Lá♯','Si'];
function noteMidi(n){const p=parsePitch(n),base={C:0,D:2,E:4,F:5,G:7,A:9,B:11};if(!p)return 60;return (p.o+1)*12+base[p.l]+(p.a==='#'?1:p.a==='b'?-1:0)}
function midiNote(m){const pc=((m%12)+12)%12,o=Math.floor(m/12)-1;return sharpNames[pc]+o}
function transposeNote(n,semitones){return n?midiNote(noteMidi(n)+semitones):n}
function transposeKeyName(semitones){return ptKeys[((semitones%12)+12)%12]}
function ledger(n,clef,x,bottom){
  const s=step(n,clef);let out='';
  if(s<=-2)for(let q=-2;q>=s;q-=2){const y=bottom-q*6;out+=`<line x1="${x-15}" y1="${y}" x2="${x+15}" y2="${y}" stroke="#555a63" stroke-width="1.7"/>`}
  if(s>=10)for(let q=10;q<=s;q+=2){const y=bottom-q*6;out+=`<line x1="${x-15}" y1="${y}" x2="${x+15}" y2="${y}" stroke="#555a63" stroke-width="1.7"/>`}
  return out
}
function accidental(n,x,y,c,keySignature){const p=parsePitch(n);if(!p||!p.a||(keySignature==='G'&&p.l==='F'&&p.a==='#'))return'';return `<text x="${x-24}" y="${y+7}" font-size="21" fill="${c}">${p.a==='#'?'♯':'♭'}</text>`}
function staffLines(x1,x2,top){let o='';for(let i=0;i<5;i++)o+=`<line x1="${x1}" y1="${top+i*12}" x2="${x2}" y2="${top+i*12}" stroke="#7d8189" stroke-width="1.6"/>`;return o}
function clef(clef,x,top){return clef==='treble'?`<text x="${x}" y="${top+52}" font-size="76" fill="#34373d">𝄞</text>`:`<text x="${x}" y="${top+43}" font-size="64" fill="#34373d">𝄢</text>`}
function timeSig(m,x,top){return `<text x="${x}" y="${top+20}" font-size="20" font-weight="800">${m[0]}</text><text x="${x}" y="${top+43}" font-size="20" font-weight="800">${m[1]}</text>`}
function restGlyphForDuration(d){
  const n=Number(d)||1,eps=.01;
  const base=Math.abs(n-3)<eps?2:Math.abs(n-1.5)<eps?1:Math.abs(n-.75)<eps?.5:Math.abs(n-.375)<eps?.25:n;
  if(base>=4)return'𝄻';
  if(base>=2)return'𝄼';
  if(base>=1)return'𝄽';
  if(base>=.5)return'𝄾';
  if(base>=.25)return'𝄿';
  return'𝅀'
}
function noteSvg(n,d,x,bottom,clef,id,mode,opts={}){
  const dur=Number(d)||1,eps=.01,dotted=[3,1.5,.75,.375].some(v=>Math.abs(dur-v)<eps);
  const base=dotted?dur/1.5:dur;
  if(!n){
    const glyph=restGlyphForDuration(dur),dot=dotted?`<circle cx="${x+19}" cy="${bottom-18}" r="2.3" fill="#292d34"/>`:'';
    return `<g id="${id}" data-rest="${dur}"><text x="${x}" y="${bottom-10}" text-anchor="middle" font-size="34" fill="#292d34" font-family="'Noto Music','Apple Symbols','Segoe UI Symbol',serif">${glyph}</text>${dot}</g>`
  }
  const y=staffY(n,clef,bottom),p=parsePitch(n),c=(mode.colors||mode.characters)?colors[p.l]:'#292d34';
  const open=base>=2,whole=base>=4,flags=base<=.13?3:base<=.26?2:base<=.51?1:0;
  let o=`<g id="${id}" data-note="${n}" data-duration="${dur}">${ledger(n,clef,x,bottom)}${accidental(n,x,y,c,opts.keySignature)}`;
  if(mode.characters){
    o+=`<circle cx="${x}" cy="${y}" r="10.5" fill="${c}" stroke="#30343b" stroke-width="1.4"/><circle cx="${x-3.7}" cy="${y-2}" r="1.2"/><circle cx="${x+3.7}" cy="${y-2}" r="1.2"/><path d="M${x-4} ${y+3} Q${x} ${y+6} ${x+4} ${y+3}" fill="none" stroke="#30343b" stroke-width="1.3"/>`;
  }else{
    o+=`<ellipse cx="${x}" cy="${y}" rx="11" ry="7.2" fill="${open?'#fff':c}" stroke="${open?c:'none'}" stroke-width="${open?2.7:0}" transform="rotate(-18 ${x} ${y})"/>`;
  }
  if(!whole){
    const stemTop=y-(flags?49:45);
    o+=`<line x1="${x+9}" y1="${y-1}" x2="${x+9}" y2="${stemTop}" stroke="${c}" stroke-width="2.7" stroke-linecap="round"/>`;
    if(flags&&!opts.beamed){
      for(let f=0;f<flags;f++){
        const fy=stemTop+f*8;
        o+=`<path d="M ${x+9} ${fy} C ${x+20} ${fy+2}, ${x+27} ${fy+10}, ${x+20} ${fy+20} C ${x+24} ${fy+12}, ${x+17} ${fy+8}, ${x+9} ${fy+7} Z" fill="${c}"/>`;
      }
    }
  }
  if(dotted)o+=`<circle cx="${x+19}" cy="${y}" r="2.5" fill="${c}"/>`;
  if(mode.names)o+=`<text x="${x}" y="${bottom+33}" text-anchor="middle" font-size="9.5" font-weight="800" fill="${c}">${names[p.l]}</text>`;
  if(mode.characters)o+=`<text x="${x}" y="${bottom+33}" text-anchor="middle" font-size="8.5" font-weight="800" fill="${c}">${chars[p.l]}</text>`;
  return o+'</g>'
}
function beamGroup(arr,clef,bottom){if(arr.length<2)return'';const ys=arr.map(a=>staffY(a.n,clef,bottom)),by=Math.min(...ys)-45;let o='';arr.forEach(a=>{const y=staffY(a.n,clef,bottom);o+=`<line x1="${a.x+9}" y1="${y-1}" x2="${a.x+9}" y2="${by}" stroke="#292d34" stroke-width="3"/>`});o+=`<line x1="${arr[0].x+9}" y1="${by}" x2="${arr[arr.length-1].x+9}" y2="${by}" stroke="#292d34" stroke-width="6" stroke-linecap="round"/>`;return o}
/* ---------- songs ---------- */
const songs={
 mary:{title:'Mary Had a Little Lamb',meter:[4,4],tempo:88,
 right:[
  [{n:'E4',d:1},{n:'D4',d:1},{n:'C4',d:1},{n:'D4',d:1}],
  [{n:'E4',d:1},{n:'E4',d:1},{n:'E4',d:2}],
  [{n:'D4',d:1},{n:'D4',d:1},{n:'D4',d:2}],
  [{n:'E4',d:1},{n:'G4',d:1},{n:'G4',d:2}],
  [{n:'E4',d:1},{n:'D4',d:1},{n:'C4',d:1},{n:'D4',d:1}],
  [{n:'E4',d:1},{n:'E4',d:1},{n:'E4',d:1},{n:'E4',d:1}],
  [{n:'D4',d:1},{n:'D4',d:1},{n:'E4',d:1},{n:'D4',d:1}],
  [{n:'C4',d:4}]
 ],
 left:[
  [{n:'C3',d:4}],[{n:'C3',d:4}],[{n:'G2',d:4}],[{n:'C3',d:4}],
  [{n:'C3',d:4}],[{n:'C3',d:4}],[{n:'G2',d:4}],[{n:'C3',d:4}]
 ]},
 ode:{title:'Ode to Joy',meter:[4,4],tempo:92,
 right:[
  [{n:'E4',d:1},{n:'E4',d:1},{n:'F4',d:1},{n:'G4',d:1}],
  [{n:'G4',d:1},{n:'F4',d:1},{n:'E4',d:1},{n:'D4',d:1}],
  [{n:'C4',d:1},{n:'C4',d:1},{n:'D4',d:1},{n:'E4',d:1}],
  [{n:'E4',d:1},{n:'D4',d:1},{n:'D4',d:2}],
  [{n:'E4',d:1},{n:'E4',d:1},{n:'F4',d:1},{n:'G4',d:1}],
  [{n:'G4',d:1},{n:'F4',d:1},{n:'E4',d:1},{n:'D4',d:1}],
  [{n:'C4',d:1},{n:'C4',d:1},{n:'D4',d:1},{n:'E4',d:1}],
  [{n:'D4',d:1},{n:'C4',d:1},{n:'C4',d:2}]
 ],
 left:[
  [{n:'C3',d:4}],[{n:'G2',d:4}],[{n:'C3',d:4}],[{n:'G2',d:4}],
  [{n:'C3',d:4}],[{n:'G2',d:4}],[{n:'C3',d:4}],[{n:'C3',d:4}]
 ]},
 minuet:{title:'Minueto em Sol maior · BWV Anh. 114',meter:[3,4],tempo:100,keyOffset:7,
 right:[
  [{n:'D5',d:1},{n:'G4',d:.5},{n:'A4',d:.5},{n:'B4',d:.5},{n:'C5',d:.5}],
  [{n:'D5',d:1},{n:'G4',d:1},{n:'G4',d:1}],
  [{n:'E5',d:1},{n:'C5',d:.5},{n:'D5',d:.5},{n:'E5',d:.5},{n:'F#5',d:.5}],
  [{n:'G5',d:1},{n:'G4',d:1},{n:'G4',d:1}],
  [{n:'C5',d:1},{n:'D5',d:.5},{n:'C5',d:.5},{n:'B4',d:.5},{n:'A4',d:.5}],
  [{n:'B4',d:1},{n:'C5',d:.5},{n:'B4',d:.5},{n:'A4',d:.5},{n:'G4',d:.5}],
  [{n:'F#4',d:1},{n:'G4',d:.5},{n:'A4',d:.5},{n:'B4',d:.5},{n:'G4',d:.5}],
  [{n:'A4',d:3}],
  [{n:'D5',d:1},{n:'G4',d:.5},{n:'A4',d:.5},{n:'B4',d:.5},{n:'C5',d:.5}],
  [{n:'D5',d:1},{n:'G4',d:1},{n:'G4',d:1}],
  [{n:'E5',d:1},{n:'C5',d:.5},{n:'D5',d:.5},{n:'E5',d:.5},{n:'F#5',d:.5}],
  [{n:'G5',d:1},{n:'G4',d:1},{n:'G4',d:1}],
  [{n:'C5',d:1},{n:'D5',d:.5},{n:'C5',d:.5},{n:'B4',d:.5},{n:'A4',d:.5}],
  [{n:'B4',d:1},{n:'C5',d:.5},{n:'B4',d:.5},{n:'A4',d:.5},{n:'G4',d:.5}],
  [{n:'A4',d:1},{n:'B4',d:.5},{n:'A4',d:.5},{n:'G4',d:.5},{n:'F#4',d:.5}],
  [{n:'G4',d:3}],
  [{n:'B5',d:1},{n:'G5',d:.5},{n:'A5',d:.5},{n:'B5',d:.5},{n:'G5',d:.5}],
  [{n:'A5',d:1},{n:'D5',d:.5},{n:'E5',d:.5},{n:'F#5',d:.5},{n:'D5',d:.5}],
  [{n:'G5',d:1},{n:'E5',d:.5},{n:'F#5',d:.5},{n:'G5',d:.5},{n:'D5',d:.5}],
  [{n:'C#5',d:1},{n:'B4',d:.5},{n:'C#5',d:.5},{n:'A4',d:1}],
  [{n:'A4',d:.5},{n:'B4',d:.5},{n:'C#5',d:.5},{n:'D5',d:.5},{n:'E5',d:.5},{n:'F#5',d:.5}],
  [{n:'G5',d:1},{n:'F#5',d:1},{n:'E5',d:1}],
  [{n:'F#5',d:1},{n:'A4',d:1},{n:'C#5',d:1}],
  [{n:'D5',d:3}],
  [{n:'D5',d:1},{n:'G4',d:.5},{n:'F#4',d:.5},{n:'G4',d:1}],
  [{n:'E5',d:1},{n:'G4',d:.5},{n:'F#4',d:.5},{n:'G4',d:1}],
  [{n:'D5',d:1},{n:'C5',d:1},{n:'B4',d:1}],
  [{n:'A4',d:.5},{n:'G4',d:.5},{n:'F#4',d:.5},{n:'G4',d:.5},{n:'A4',d:1}],
  [{n:'D4',d:.5},{n:'E4',d:.5},{n:'F#4',d:.5},{n:'G4',d:.5},{n:'A4',d:.5},{n:'B4',d:.5}],
  [{n:'C5',d:1},{n:'B4',d:1},{n:'A4',d:1}],
  [{n:'B4',d:.5},{n:'D5',d:.5},{n:'G4',d:1},{n:'F#4',d:1}],
  [{n:'G4',d:3}]
 ],
 left:[
  [{n:'B2',d:2},{n:'A2',d:1}],[{n:'B2',d:3}],[{n:'C3',d:3}],[{n:'B2',d:3}],
  [{n:'A2',d:3}],[{n:'G2',d:3}],[{n:'D3',d:1},{n:'B2',d:1},{n:'G2',d:1}],
  [{n:'D3',d:1},{n:'D2',d:.5},{n:'C3',d:.5},{n:'B2',d:.5},{n:'A2',d:.5}],
  [{n:'B2',d:2},{n:'A2',d:1}],[{n:'G2',d:1},{n:'B2',d:1},{n:'G2',d:1}],
  [{n:'C3',d:3}],[{n:'B2',d:1},{n:'C3',d:.5},{n:'B2',d:.5},{n:'A2',d:.5},{n:'G2',d:.5}],
  [{n:'A2',d:2},{n:'E2',d:1}],[{n:'G2',d:2},{n:'B2',d:1}],[{n:'C3',d:1},{n:'D3',d:1},{n:'D2',d:1}],[{n:'G2',d:2},{n:'G1',d:1}],
  [{n:'G2',d:3}],[{n:'F#2',d:3}],[{n:'E2',d:1},{n:'G2',d:1},{n:'E2',d:1}],[{n:'A2',d:2},{n:'A1',d:1}],
  [{n:'A2',d:3}],[{n:'B2',d:1},{n:'D3',d:1},{n:'C#3',d:1}],[{n:'D3',d:1},{n:'F#2',d:1},{n:'A2',d:1}],[{n:'D3',d:1},{n:'D2',d:1},{n:'C3',d:1}],
  [{r:true,d:1},{n:'D3',d:2}],[{r:true,d:1},{n:'E3',d:2}],[{n:'B2',d:1},{n:'A2',d:1},{n:'G2',d:1}],[{n:'D3',d:2},{r:true,d:1}],
  [{r:true,d:1},{r:true,d:1},{n:'F#2',d:1}],[{n:'E2',d:1},{n:'G2',d:1},{n:'F#2',d:1}],[{n:'G2',d:1},{n:'B1',d:1},{n:'D2',d:1}],[{n:'G2',d:1},{n:'D2',d:1},{n:'G1',d:1}]
 ]}
};

// Traditional melodies in the public domain, entered as simple right-hand scores.
// The left hand supplies only a repeated root for optional two-hand practice.
const publicMelodies={
 frere:{title:'Frère Jacques',meter:[4,4],tempo:84,description:'Canção tradicional francesa · domínio público',right:[
  [{n:'C4',d:1},{n:'D4',d:1},{n:'E4',d:1},{n:'C4',d:1}],
  [{n:'C4',d:1},{n:'D4',d:1},{n:'E4',d:1},{n:'C4',d:1}],
  [{n:'E4',d:1},{n:'F4',d:1},{n:'G4',d:2}],
  [{n:'E4',d:1},{n:'F4',d:1},{n:'G4',d:2}],
  [{n:'G4',d:.5},{n:'A4',d:.5},{n:'G4',d:.5},{n:'F4',d:.5},{n:'E4',d:1},{n:'C4',d:1}],
  [{n:'G4',d:.5},{n:'A4',d:.5},{n:'G4',d:.5},{n:'F4',d:.5},{n:'E4',d:1},{n:'C4',d:1}],
  [{n:'C4',d:1},{n:'G3',d:1},{n:'C4',d:2}],
  [{n:'C4',d:1},{n:'G3',d:1},{n:'C4',d:2}]]},
 twinkle:{title:'Brilha, brilha, estrelinha',meter:[4,4],tempo:84,description:'Melodia tradicional Ah! vous dirai-je, maman · domínio público',right:[
  [{n:'C4',d:1},{n:'C4',d:1},{n:'G4',d:1},{n:'G4',d:1}],
  [{n:'A4',d:1},{n:'A4',d:1},{n:'G4',d:2}],
  [{n:'F4',d:1},{n:'F4',d:1},{n:'E4',d:1},{n:'E4',d:1}],
  [{n:'D4',d:1},{n:'D4',d:1},{n:'C4',d:2}],
  [{n:'G4',d:1},{n:'G4',d:1},{n:'F4',d:1},{n:'F4',d:1}],
  [{n:'E4',d:1},{n:'E4',d:1},{n:'D4',d:2}],
  [{n:'G4',d:1},{n:'G4',d:1},{n:'F4',d:1},{n:'F4',d:1}],
  [{n:'E4',d:1},{n:'E4',d:1},{n:'D4',d:2}],
  [{n:'C4',d:1},{n:'C4',d:1},{n:'G4',d:1},{n:'G4',d:1}],
  [{n:'A4',d:1},{n:'A4',d:1},{n:'G4',d:2}],
  [{n:'F4',d:1},{n:'F4',d:1},{n:'E4',d:1},{n:'E4',d:1}],
  [{n:'D4',d:1},{n:'D4',d:1},{n:'C4',d:2}]]},
 hotcross:{title:'Hot Cross Buns',meter:[4,4],tempo:88,description:'Melodia tradicional inglesa · domínio público',right:[
  [{n:'E4',d:1},{n:'D4',d:1},{n:'C4',d:2}],
  [{n:'E4',d:1},{n:'D4',d:1},{n:'C4',d:2}],
  [{n:'C4',d:.5},{n:'C4',d:.5},{n:'C4',d:.5},{n:'C4',d:.5},{n:'D4',d:.5},{n:'D4',d:.5},{n:'D4',d:.5},{n:'D4',d:.5}],
  [{n:'E4',d:1},{n:'D4',d:1},{n:'C4',d:2}]]},
 jingle:{title:'Jingle Bells · refrão',meter:[4,4],tempo:96,description:'James Lord Pierpont, 1857 · domínio público',right:[
  [{n:'E4',d:1},{n:'E4',d:1},{n:'E4',d:2}],
  [{n:'E4',d:1},{n:'E4',d:1},{n:'E4',d:2}],
  [{n:'E4',d:1},{n:'G4',d:1},{n:'C4',d:1},{n:'D4',d:1}],
  [{n:'E4',d:4}],
  [{n:'F4',d:1},{n:'F4',d:1},{n:'F4',d:1},{n:'F4',d:1}],
  [{n:'F4',d:1},{n:'E4',d:1},{n:'E4',d:1},{n:'E4',d:1}],
  [{n:'E4',d:1},{n:'D4',d:1},{n:'D4',d:1},{n:'E4',d:1}],
  [{n:'D4',d:2},{n:'G4',d:2}]]}
};
for(const [key,piece] of Object.entries(publicMelodies))songs[key]={...piece,left:piece.right.map(()=>[{n:'C3',d:4}])};
// Original beginner songs: one syllable per note, four beats per measure.
const illustratedMelodies={
 'little-sun':{title:'Bom dia, sol',icon:'☀️',lines:[['C4 D4 E4 E4','Bom di- a sol'],['E4 D4 C4:2','Vem bri- lhar'],['C4 D4 E4 G4','Lá no céu azul'],['E4 D4 C4:2','Vou can- tar']]},
 'little-train':{title:'O comboio das notas',icon:'🚂',lines:[['C4 C4 D4 D4','Chu chu lá vai'],['E4 E4 G4:2','O com- boio'],['G4 E4 D4 C4','So- be des- ce'],['D4 D4 C4:2','Sem pa- rar']]},
 'little-rain':{title:'Pinguinhos de chuva',icon:'🌧️',lines:[['E4 D4 C4:2','Pim pam pum'],['E4 D4 C4:2','Pim pam pum'],['C4 D4 E4 G4','Go- tas a cair'],['E4 D4 C4:2','Vou sor- rir']]},
 'little-cat':{title:'O gato e a lua',icon:'🐱',lines:[['C4 E4 G4:2','Mi- au miau'],['G4 E4 C4:2','Mi- au miau'],['D4 E4 F4 E4','Ga- to vê lua'],['D4 D4 C4:2','Vai so- nhar']]},
 'little-butterfly':{title:'Voa, borboleta',icon:'🦋',lines:[['C4 D4 E4 F4','Bor- bo- le- ta'],['G4 E4 G4:2','Vai vo- ar'],['G4 F4 E4 D4','Pe- lo jar- dim'],['E4 D4 C4:2','Vem dan- çar']]}
};
for(const [key,piece] of Object.entries(illustratedMelodies)){
 const right=piece.lines.map(([notes,words])=>{const syllables=words.split(' ');return notes.split(' ').map((token,i)=>{const [n,d]=token.split(':');return {n,d:Number(d)||1,lyric:syllables[i]}})});
 songs[key]={title:piece.title,icon:piece.icon,tempo:80,meter:[4,4],illustrated:true,right,left:[],description:'Canção original Luwipi · uma sílaba por nota'};
}
let songIllustrated=true;
function illustratedMeasure(m,idx,x0,w,top,meter,transpose){
 let out='',beat=0;const usable=w-24;
 m.forEach((item,i)=>{
  const n=transposeNote(item.n,transpose),p=parsePitch(n),y=top+65-(dia(n)-dia(transposeNote('C4',transpose)))*16;
  const x=x0+12+beat/meter[0]*usable,width=item.d/meter[0]*usable-5;
  out+=`<g id="R-${idx}-${i}" class="illustrated-note" data-note="${n}"><rect x="${x}" y="${y}" width="${width}" height="38" rx="3" fill="${colors[p.l]}"/><text x="${x+width/2}" y="${y+24}" text-anchor="middle" font-size="24" font-weight="700" fill="#17243d">${item.lyric}</text></g>`;
  beat+=item.d;
 });return out;
}
let songKey='mary',songVersionKey='right',songPage=0,songMode={colors:false,characters:false,names:false},tempo=88,metro=true,timers=[],audioCtx=null,songTranspose=0;
let songLayoutSize=4;
function songPageSize(){return 2}
let songFullScore=false;
const songScoreWrap=document.querySelector('#songView .score-wrap');
function syncSongPosition(behavior='instant'){
  if(songFullScore||(songs[songKey].illustrated&&songIllustrated))return;
  const width=Number(songSvg.getAttribute('viewBox')?.split(' ')[2])||920;
  const rendered=songSvg.getBoundingClientRect().width;
  const unit=rendered*(362.5/width);
  songScoreWrap.scrollTo({left:Math.max(0,Math.floor(songPage*2)*unit),behavior});
}
function syncSongPositionLabel(){
  if(songFullScore||(songs[songKey].illustrated&&songIllustrated))return;
  const width=Number(songSvg.getAttribute('viewBox')?.split(' ')[2])||920;
  const unit=songSvg.getBoundingClientRect().width*(362.5/width);
  if(!unit)return;
  const count=songs[songKey].right.length;
  songPage=Math.max(0,Math.min(Math.ceil(count/2)-1,Math.floor((songScoreWrap.scrollLeft+unit*.35)/(2*unit))));
  songPageLabel.textContent=`Compassos ${songPage*2+1}–${Math.min(songPage*2+2,count)} de ${count}`;
  syncPianoTargets();
}
songScoreWrap.addEventListener('scroll',syncSongPositionLabel,{passive:true});
document.querySelectorAll('[data-song]').forEach(b=>b.onclick=()=>{songKey=b.dataset.song;songVersionKey=b.dataset.version;songPage=0;tempo=songs[songKey].tempo;songTranspose=0;songIllustrated=true;songFullScore=false;songScoreWrap.classList.remove('whole-score');songScoreModeButton.textContent='▤ Partitura inteira';renderSong();songScoreWrap.scrollLeft=0;nav('song')});
function validMeasure(m,meter){return Math.abs(m.reduce((s,x)=>s+x.d,0)-meter[0])<.001}
function drawMeasure(m,idx,x0,w,top,clefKey,meter,mode,transpose=0,keySignature='C'){
  let o=staffLines(x0,x0+w,top),bottom=top+48,beat=0,eighth=[],groups=[],padL=30,padR=22,usable=w-padL-padR;
  const beamed=new Set();let run=[];
  m.forEach((it,i)=>{if(!it.r&&Math.abs(it.d-.5)<.001)run.push(i);else{if(run.length>=2)run.forEach(j=>beamed.add(j));run=[]}});
  if(run.length>=2)run.forEach(j=>beamed.add(j));
  m.forEach((it,i)=>{
    const x=x0+padL+(beat/meter[0])*usable,id=`${clefKey==='bass'?'L':'R'}-${idx}-${i}`,n=it.r?null:transposeNote(it.n,transpose);
    o+=noteSvg(n,it.d,x,bottom,clefKey,id,mode,{beamed:beamed.has(i),keySignature});
    if(n&&Math.abs(it.d-.5)<.001)eighth.push({x,n});else if(eighth.length){groups.push(eighth);eighth=[]}
    beat+=it.d
  });
  if(eighth.length)groups.push(eighth);groups.forEach(g=>{if(g.length>=2)o+=beamGroup(g,clefKey,bottom)});
  return o+`<line x1="${x0+w}" y1="${top}" x2="${x0+w}" y2="${top+48}" stroke="#454950" stroke-width="2"/>`
}
function renderSong(){
  const s=songs[songKey],both=songVersionKey==='both',count=s.right.length,full=songFullScore||(s.illustrated&&songIllustrated);
  const illustrated=!!s.illustrated&&songIllustrated;
  document.getElementById('songBlocks')?.classList.toggle('hidden',!s.illustrated);
  document.getElementById('songBlocks')?.setAttribute('aria-pressed',String(illustrated));
  songSvg.classList.toggle('illustrated-score',illustrated);
  songScoreWrap.classList.toggle('whole-score',full);
  songScoreModeButton.classList.toggle('hidden',illustrated);
  document.querySelector('#songView .pager').classList.toggle('hidden',illustrated);
  const blocksPerRow=illustrated&&matchMedia('(max-height:500px) and (min-width:650px)').matches?count:1;
  const left=illustrated?20:155,mw=362.5,gap=illustrated?120:both?270:200,systems=full?(illustrated?Math.ceil(count/blocksPerRow):Math.ceil(count/2)):1;
  const W=full?(illustrated?left+mw*blocksPerRow+20:920):left+count*mw+35,H=full?(illustrated?20:90)+systems*gap:(both?300:210);
  songTitle.textContent=s.title;songHeading.textContent=s.title;songVersion.textContent=both?'Duas mãos':'Mão direita';
  songMeta.textContent=`${s.meter[0]}/${s.meter[1]} · ${both?'Clave de Sol + Clave de Fá':'Clave de Sol'}`;
  songHint.textContent=s.description||'Desliza a partitura para avançar.';
  tempoLabel.textContent=`♩ = ${tempo}`;
  transposeLabel.textContent=`Tom: ${transposeKeyName(songTranspose+(s.keyOffset||0))} ${songTranspose===0?'':`(${songTranspose>0?'+':''}${songTranspose})`}`;
  songPageLabel.textContent=illustrated?'Blocos e sílabas · 4 frases':full?`Partitura inteira · ${count} compassos`:`Compassos ${songPage*2+1}–${Math.min(songPage*2+2,count)} de ${count}`;
  let out=`<rect width="${W}" height="${H}" fill="#fff"/>`;
  for(let sys=0;sys<systems;sys++){
    const tt=(illustrated?50:90)+sys*gap,bt=tt+92;
    if(!illustrated)out+=clef('treble',64,tt-4)+(songKey==='minuet'&&songTranspose===0?`<text x="106" y="${tt+8}" font-size="29" fill="#34373d">♯</text>`:'')+timeSig(s.meter,128,tt);
    if(both)out+=clef('bass',68,bt-4)+(songKey==='minuet'&&songTranspose===0?`<text x="106" y="${bt+20}" font-size="29" fill="#34373d">♯</text>`:'')+timeSig(s.meter,128,bt)+`<line x1="58" y1="${tt}" x2="58" y2="${bt+48}" stroke="#34373d" stroke-width="2"/>`;
    const start=full?sys*(illustrated?blocksPerRow:2):0,end=full?Math.min(start+(illustrated?blocksPerRow:2),count):count;
    for(let bi=start;bi<end;bi++){
      const x=left+(full?bi-start:bi)*mw;
      if(!validMeasure(s.right[bi],s.meter))console.warn('Compasso inválido RH',bi+1);
      out+=`<g class="song-measure" data-measure="${bi}" role="button" tabindex="0" aria-label="Ouvir compasso ${bi+1}"><rect class="measure-surface" x="${x}" y="${tt-22}" width="${mw}" height="${both?190:100}" rx="10"/>`;
      out+=`<text x="${x+6}" y="${tt-11}" font-size="10" font-weight="800" fill="#8a8e97">${bi+1}</text>`+(illustrated?illustratedMeasure(s.right[bi],bi,x,mw,tt-40,s.meter,songTranspose):drawMeasure(s.right[bi],bi,x,mw,tt,'treble',s.meter,songMode,songTranspose,songKey==='minuet'&&songTranspose===0?'G':'C'));
      if(both&&s.left[bi]){if(!validMeasure(s.left[bi],s.meter))console.warn('Compasso inválido LH',bi+1);out+=drawMeasure(s.left[bi],bi,x,mw,bt,'bass',s.meter,songMode,songTranspose,songKey==='minuet'&&songTranspose===0?'G':'C')}
      out+='</g>';
    }
  }
  songSvg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  songSvg.style.setProperty('--score-width',`${W}px`);
  songSvg.innerHTML=out;
  songPrev.disabled=songPage===0;songNext.disabled=songPage>=Math.ceil(count/2)-1;
  songLegend.innerHTML=legendHtml();songLegend.classList.toggle('hidden',!songMode.characters);
  document.querySelectorAll('[data-song-aid]').forEach(b=>b.classList.toggle('active',(b.dataset.songAid==='normal'&&!illustrated&&!songMode.colors&&!songMode.characters&&!songMode.names)||songMode[b.dataset.songAid]));
  songLayoutSize=2;syncPianoTargets();
}
const songScoreModeButton=document.getElementById('songScoreMode');
songScoreModeButton.onclick=()=>{
  songFullScore=!songFullScore;
  songScoreWrap.classList.toggle('whole-score',songFullScore);
  songScoreModeButton.textContent=songFullScore?'⇢ Deslizar pauta':'▤ Partitura inteira';
  songScoreModeButton.setAttribute('aria-pressed',String(songFullScore));
  renderSong();if(!songFullScore)requestAnimationFrame(()=>syncSongPosition('instant'));
};
document.querySelectorAll('[data-song-aid]').forEach(b=>b.onclick=()=>{songIllustrated=false;const a=b.dataset.songAid;if(a==='normal')songMode={colors:false,characters:false,names:false};else{songMode[a]=!songMode[a];if(a==='characters'&&songMode[a])songMode.names=false;if(a==='names'&&songMode[a])songMode.characters=false}renderSong()});
songPrev.onclick=()=>{songPage=Math.max(0,songPage-1);syncSongPosition()};songNext.onclick=()=>{songPage=Math.min(Math.ceil(songs[songKey].right.length/2)-1,songPage+1);syncSongPosition()};
tempoDown.onclick=()=>{tempo=Math.max(50,tempo-4);tempoLabel.textContent=`♩ = ${tempo}`};tempoUp.onclick=()=>{tempo=Math.min(160,tempo+4);tempoLabel.textContent=`♩ = ${tempo}`};metroBtn.onclick=()=>{metro=!metro;metroBtn.classList.toggle('active',metro);metroBtn.textContent=`Metrónomo · ${metro?'ON':'OFF'}`};
transposeDown.onclick=()=>{stopPlay();songTranspose=Math.max(-5,songTranspose-1);renderSong()};transposeUp.onclick=()=>{stopPlay();songTranspose=Math.min(5,songTranspose+1);renderSong()};

/* ---------- audio: samples reais do Luwipi + volume limpo ---------- */
const PIANO_STORAGE_BASE='https://sohyyocenodzqypjglix.supabase.co/storage/v1/object/public/piano%20samples/';
const pianoBufferCache=new Map(),pianoPlayableCache=new Map();
let pianoMaster=null,pianoInput=null,pianoCompressor=null,pianoOutput=null;

function ctx(){
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return null;
  audioCtx=audioCtx||new AC({latencyHint:'interactive'});
  if(!pianoMaster){
    const c=audioCtx;
    pianoInput=c.createGain();pianoMaster=c.createGain();
    pianoCompressor=c.createDynamicsCompressor();pianoOutput=c.createGain();
    const highpass=c.createBiquadFilter();highpass.type='highpass';highpass.frequency.value=34;
    pianoMaster.gain.value=.9;
    pianoCompressor.threshold.value=-11;
    pianoCompressor.knee.value=18;
    pianoCompressor.ratio.value=2.4;
    pianoCompressor.attack.value=.022;
    pianoCompressor.release.value=.28;
    pianoOutput.gain.value=.84;
    pianoInput.connect(highpass).connect(pianoMaster);
    // A restrained room tail gives the recorded piano depth without smearing the keys.
    if(c.createConvolver){
      const impulse=c.createBuffer(2,Math.floor(c.sampleRate*1.15),c.sampleRate);
      for(let channel=0;channel<2;channel++){
        const data=impulse.getChannelData(channel);let seed=channel?751:419;
        for(let i=0;i<data.length;i++){
          seed=(Math.imul(seed,1664525)+1013904223)>>>0;
          const t=i/data.length,fade=Math.pow(1-t,3);
          data[i]=i<c.sampleRate*.012?0:((seed/4294967295)*2-1)*fade;
        }
      }
      const send=c.createGain(),room=c.createConvolver(),wet=c.createGain();
      send.gain.value=.11;room.buffer=impulse;wet.gain.value=.12;
      pianoInput.connect(send).connect(room).connect(wet).connect(pianoMaster);
    }
    pianoMaster.connect(pianoCompressor).connect(pianoOutput).connect(c.destination);
  }
  return audioCtx
}
function midi(n){return noteMidi(n)}
function freq(n){return 440*Math.pow(2,(midi(n)-69)/12)}

function pianoFileForNote(n){
  const m=String(n||'').match(/^([A-G])([#b]?)(-?\d+)$/);
  if(!m)return null;
  const letter=m[1],acc=m[2],oct=Number(m[3]);
  let base=null;
  if(oct===0&&(letter==='A'||letter==='B'))base=letter+'_2';
  else if(oct===1)base=letter+'_1';
  else if(oct===2)base=letter;
  else if(oct===3)base=letter.toLowerCase()+letter.toLowerCase();
  else if(oct>=4&&oct<=8)base=letter.toLowerCase()+String(oct-3);
  if(!base)return null;
  if(acc==='#')base+='s';
  else if(acc==='b')base+='f';
  return base+'.mp3'
}
function sampleUrl(n){
  const file=pianoFileForNote(n);
  return file?PIANO_STORAGE_BASE+encodeURIComponent(file):null
}
async function loadPianoBuffer(n){
  if(!n)return null;
  if(pianoBufferCache.has(n))return pianoBufferCache.get(n);
  const promise=(async()=>{
    const c=ctx(),url=sampleUrl(n);
    if(!c||!url)return null;
    const response=await fetch(url,{cache:'force-cache'});
    if(!response.ok)throw new Error('sample_'+response.status);
    return await c.decodeAudioData(await response.arrayBuffer())
  })().catch(error=>{console.warn('Piano sample unavailable',n,error);if(!/sample_404/.test(String(error)))pianoBufferCache.delete(n);return null});
  pianoBufferCache.set(n,promise);
  return promise
}
async function loadPlayableSample(n){
  if(pianoPlayableCache.has(n))return pianoPlayableCache.get(n);
  const promise=(async()=>{
    const exact=await loadPianoBuffer(n);
    if(exact)return {buffer:exact,rate:1};
    // A neighbouring recorded key stays more piano-like than an oscillator.
    const target=noteMidi(n),nearby=[];
    for(const distance of [1,-1,2,-2]){
      const candidate=midiNote(target+distance);
      if(/^[A-G]-?\d+$/.test(candidate))nearby.push(candidate);
    }
    for(const candidate of nearby){
      const buffer=await loadPianoBuffer(candidate);
      if(buffer)return {buffer,rate:Math.pow(2,(target-noteMidi(candidate))/12)};
    }
    return null;
  })();
  pianoPlayableCache.set(n,promise);
  promise.then(sample=>{if(!sample)pianoPlayableCache.delete(n)});
  return promise
}
function preloadPiano(n){void loadPlayableSample(n)}
const pianoHeldKeys=new Set();
let lastPianoTouchAt=-Infinity;
window.LuwipiPianoInteracting=()=>pianoHeldKeys.size>0||performance.now()-lastPianoTouchAt<900;
async function pianoNoteOn(n,level=.98){
  if(!n)return;
  lastPianoTouchAt=performance.now();pianoHeldKeys.add(n);
  // Keep the recorded piano envelope intact.
  // A short tap must never truncate the note into a click.
  return pianoSample(n,1,560,level);
}
function pianoNoteOff(n){
  lastPianoTouchAt=performance.now();pianoHeldKeys.delete(n);
}
function releaseAllPianoKeys(){pianoHeldKeys.clear()}

function pianoSamplePeak(level){return Math.min(.84,Math.max(.12,.78*level))}
function pianoSampleAttack(gain,now,peak){
  gain.gain.setValueAtTime(.0001,now);
  gain.gain.exponentialRampToValueAtTime(peak,now+.006);
}
async function pianoSample(n,d=1,beatMs=650,level=1){
  if(!n)return;
  const c=ctx();
  if(!c)return;
  if(c.state==='suspended')try{await c.resume()}catch{}
  const sample=await loadPlayableSample(n);
  if(!sample){fallbackPiano(n,d,beatMs,.22*level);return}
  const source=c.createBufferSource(),gain=c.createGain();
  source.buffer=sample.buffer;source.playbackRate.value=sample.rate;
  const now=c.currentTime,requested=Math.max(.14,d*beatMs/1000*.94),available=sample.buffer.duration/sample.rate;
  const releaseStart=Math.min(requested,Math.max(.02,available-.14));
  const fadeEnd=Math.min(available-.015,releaseStart+.22);
  const peak=pianoSamplePeak(level);
  pianoSampleAttack(gain,now,peak);
  gain.gain.setValueAtTime(peak,now+Math.max(.008,releaseStart));
  gain.gain.exponentialRampToValueAtTime(.0001,now+Math.max(releaseStart+.01,fadeEnd));
  source.connect(gain).connect(pianoInput);
  source.start(now);
  source.stop(now+Math.max(releaseStart+.02,fadeEnd+.02));
}
function fallbackPiano(n,d,beatMs,v=.22){
  const c=ctx();if(!c||!n)return;
  const now=c.currentTime,dur=Math.max(.12,d*beatMs/1000),f0=freq(n),master=c.createGain();
  master.gain.value=.72;
  master.connect(pianoInput||c.destination);
  [[1,'triangle',1],[2,'sine',.26],[3,'sine',.08]].forEach(([mul,type,amp])=>{
    const o=c.createOscillator(),g=c.createGain();
    o.type=type;o.frequency.value=f0*mul;
    g.gain.setValueAtTime(.0001,now);
    g.gain.exponentialRampToValueAtTime(v*amp,now+.028);
    g.gain.exponentialRampToValueAtTime(v*amp*.36,now+Math.max(.06,Math.min(.16,dur*.5)));
    g.gain.setValueAtTime(v*amp*.36,now+Math.max(.07,dur-.1));
    g.gain.exponentialRampToValueAtTime(.0001,now+dur+.17);
    o.connect(g).connect(master);o.start(now);o.stop(now+dur+.2)
  })
}
function warmPianoSamples(){
  const wanted=new Set();
  try{
    Object.values(songs).slice(0,3).forEach(song=>['right','left'].forEach(hand=>(song[hand]||[]).flat().forEach(it=>{if(it&&it.n)wanted.add(it.n)})));
  }catch{}
  wanted.forEach(preloadPiano)
}
if('requestIdleCallback'in window)requestIdleCallback(warmPianoSamples,{timeout:2200});
else setTimeout(warmPianoSamples,900);

function stopPlay(){timers.forEach(clearTimeout);timers=[];songSvg.querySelectorAll('.note-current,.measure-current').forEach(e=>e.classList.remove('note-current','measure-current'));playBtn.textContent='▶ Tocar até ao fim'}
function hi(id,ms){const e=document.getElementById(id);if(e){songSvg.querySelectorAll('.note-current').forEach(x=>x.classList.remove('note-current'));e.classList.add('note-current');e.closest('.song-measure')?.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});timers.push(setTimeout(()=>e.classList.remove('note-current'),ms*.85))}highlightPianoKeyFromId(id,ms)}
function playSongRange(first,last){
  stopPlay();const score=songs[songKey],both=songVersionKey==='both',bm=60000/tempo,bpm=score.meter[0];ctx()?.resume?.();playBtn.textContent='■ Parar';let elapsed=0;
  for(let measure=first;measure<last;measure++){
    const offset=elapsed;
    timers.push(setTimeout(()=>{
      const page=Math.floor(measure/2);if(songPage!==page){songPage=page;syncPianoTargets()}
      songSvg.querySelectorAll('.measure-current').forEach(x=>x.classList.remove('measure-current'));
      const group=songSvg.querySelector(`[data-measure="${measure}"]`);group?.classList.add('measure-current');group?.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});
    },offset));
    if(metro)for(let beat=0;beat<bpm;beat++)timers.push(setTimeout(()=>click(beat===0),offset+beat*bm));
    let rightBeat=0;score.right[measure].forEach((item,index)=>{const delay=offset+rightBeat*bm;if(!item.r){const note=transposeNote(item.n,songTranspose);timers.push(setTimeout(()=>{pianoSample(note,item.d,bm,1);hi(`R-${measure}-${index}`,item.d*bm)},delay))}rightBeat+=item.d});
    if(both&&score.left[measure]){let leftBeat=0;score.left[measure].forEach(item=>{const delay=offset+leftBeat*bm;if(!item.r){const note=transposeNote(item.n,songTranspose);timers.push(setTimeout(()=>pianoSample(note,item.d,bm,.82),delay))}leftBeat+=item.d})}
    elapsed+=bpm*bm;
  }
  timers.push(setTimeout(stopPlay,elapsed+150));
}
playBtn.onclick=()=>{if(playBtn.textContent.includes('Parar')){stopPlay();return}playSongRange(songs[songKey].illustrated&&songIllustrated?0:songPage*2,songs[songKey].right.length)};
document.addEventListener('keydown',event=>{if(event.code!=='Space'||event.repeat||!views.song.classList.contains('active')||event.target.closest('button,input,textarea,select,[contenteditable],[data-measure]'))return;event.preventDefault();playBtn.click()});
songSvg.addEventListener('click',event=>{const group=event.target.closest('[data-measure]');if(group)playSongRange(+group.dataset.measure,+group.dataset.measure+1)});
songSvg.addEventListener('keydown',event=>{if(event.key!=='Enter'&&event.key!==' ')return;const group=event.target.closest('[data-measure]');if(group){event.preventDefault();playSongRange(+group.dataset.measure,+group.dataset.measure+1)}});
const immersiveButton=document.getElementById('readingImmersive');
function syncSongImmersive(){
  const reader=document.querySelector('#songView .reader');
  const active=document.fullscreenElement===reader||reader?.classList.contains('reading-immersive-fallback');
  immersiveButton.setAttribute('aria-pressed',String(active));
  immersiveButton.textContent=active?'✕ Sair do ecrã inteiro':'⛶ Ecrã inteiro';
}
immersiveButton.onclick=async()=>{
  if(matchMedia('(pointer:coarse)').matches||innerWidth<=1100){await window.LuwipiPianoFullscreen?.open(immersiveButton);return}
  const reader=document.querySelector('#songView .reader');
  if(reader?.classList.contains('reading-immersive-fallback')){reader.classList.remove('reading-immersive-fallback');syncSongImmersive();return}
  if(document.fullscreenElement){await document.exitFullscreen?.();syncSongImmersive();return}
  if(reader?.requestFullscreen){try{await reader.requestFullscreen();await screen.orientation?.lock?.('landscape')?.catch(()=>{})}catch(_){reader.classList.toggle('reading-immersive-fallback')}}
  else reader?.classList.toggle('reading-immersive-fallback');
  syncSongImmersive();
};
document.addEventListener('fullscreenchange',syncSongImmersive);
/* ---------- piano de prática ---------- */
const pianoBoard=document.getElementById('pianoBoard');
const pianoDock=document.getElementById('pianoDock');
const noteColorByLetter=n=>colors[parsePitch(n)?.l||'C'];
function buildPiano(){
  const whites=[];for(let octave=0;octave<=8;octave++)for(const l of ['C','D','E','F','G','A','B']){const n=l+octave,m=noteMidi(n);if(m>=21&&m<=108)whites.push(n)}
  const W=46;pianoBoard.style.width=(whites.length*W)+'px';pianoBoard.style.setProperty('--white-keys',whites.length);
  let h='';whites.forEach((n,i)=>{h+=`<button class="piano-white" data-piano-note="${n}" aria-label="${names[n[0]]} ${n.slice(1)}" style="left:${i*W}px;--key-index:${i};--key-color:${noteColorByLetter(n)}"><span>${names[n[0]]}</span></button>`});
  const blackAfter={C:'C#',D:'D#',F:'F#',G:'G#',A:'A#'};
  whites.forEach((n,i)=>{const l=n[0],o=n.slice(1);if(blackAfter[l]){const bn=blackAfter[l]+o;if(noteMidi(bn)>108)return;h+=`<button class="piano-black" data-piano-note="${bn}" style="left:${i*W+W-14}px;--key-index:${i+1};--key-color:${noteColorByLetter(n)}" aria-label="${bn}"></button>`}});
  pianoBoard.innerHTML=h;
  pianoBoard.querySelectorAll('[data-piano-note]').forEach(k=>{
    let tap=null;
    const play=()=>{k.classList.add('down');pianoNoteOn(k.dataset.pianoNote,.98)};
    const down=e=>{
      if(pianoDock.classList.contains('piano-fullscreen')&&e.pointerType==='touch'){
        // Native horizontal panning wins; a note is played only after a stationary tap.
        tap={id:e.pointerId,x:e.clientX,y:e.clientY};return;
      }
      e.preventDefault();k.setPointerCapture?.(e.pointerId);play();
    };
    const move=e=>{if(tap&&tap.id===e.pointerId&&(Math.abs(e.clientX-tap.x)>10||Math.abs(e.clientY-tap.y)>10))tap=null};
    const release=()=>{k.classList.remove('down');pianoNoteOff(k.dataset.pianoNote)};
    const up=e=>{if(tap&&tap.id===e.pointerId){tap=null;play();setTimeout(release,180)}else release()};
    const cancel=()=>{tap=null;release()};
    k.addEventListener('pointerdown',down);k.addEventListener('pointermove',move);k.addEventListener('pointerup',up);k.addEventListener('pointerleave',cancel);k.addEventListener('pointercancel',cancel);

  });
}
let songPianoVisible=true;
const songPianoToggle=document.getElementById('songPianoToggle');
function updateSongPianoToggle(){
  views.song.classList.toggle('song-piano-hidden',!songPianoVisible);
  songPianoToggle.setAttribute('aria-pressed',String(songPianoVisible));
  songPianoToggle.textContent=songPianoVisible?'⌄ Esconder piano':'⌃ Mostrar piano';
}
songPianoToggle.onclick=()=>{
  songPianoVisible=!songPianoVisible;updateSongPianoToggle();
  if(views.song.classList.contains('active')){
    if(songPianoVisible)openPiano();else closePianoDock();
  }
};
function openPiano(){pianoDock.classList.remove('hidden');document.body.classList.add('piano-open');syncPianoTargets()}
function syncReadingPiano(name){
  const score=name==='song'?document.querySelector('#songView .score-wrap'):name==='readingImported'?document.querySelector('#readingImportedView .score-wrap'):null;
  if(score){score.insertAdjacentElement('afterend',pianoDock);if(name==='song'&&!songPianoVisible)closePianoDock();else openPiano()}
  else{closePianoDock();document.getElementById('accessOverlay')?.insertAdjacentElement('beforebegin',pianoDock)}
}
function closePianoDock(){releaseAllPianoKeys();pianoDock.classList.add('hidden');document.body.classList.remove('piano-open')}
songPianoBtn.onclick=openPiano;closePiano.onclick=closePianoDock;
function currentTargetNotes(){
  if(views.song.classList.contains('active')){const s=songs[songKey],start=songPage*songPageSize(),end=Math.min(start+songPageSize(),s.right.length),arr=[];for(let m=start;m<end;m++)s.right[m].forEach(it=>{if(!it.r)arr.push(transposeNote(it.n,songTranspose))});return arr}
  return []
}
function syncPianoTargets(){if(!pianoBoard.children.length)return;const set=new Set(currentTargetNotes());pianoBoard.querySelectorAll('[data-piano-note]').forEach(k=>k.classList.toggle('target',set.has(k.dataset.pianoNote)));set.forEach(preloadPiano)}
function highlightPianoKeyFromId(id,ms){const el=document.getElementById(id),n=el?.dataset?.note;if(!n)return;const k=pianoBoard.querySelector(`[data-piano-note="${n}"]`);if(k){k.classList.add('down');setTimeout(()=>k.classList.remove('down'),Math.min(ms,700))}}
buildPiano();

/* ---------- tarefa para pais ---------- */
const taskModal=document.getElementById('taskModal'),taskLinkInput=document.getElementById('taskLinkInput');let currentTaskUrl='';
function taskUrl(params){const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('parent','1');Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,String(v)));return u.toString()}
function openTaskModal(url){currentTaskUrl=url;taskLinkInput.value=url;taskModal.classList.remove('hidden');window.LuwipiRememberTask?.(url)}
shareSongBtn.onclick=()=>openTaskModal(taskUrl({type:'song',id:songKey,version:songVersionKey,transpose:songTranspose}));
closeTaskModal.onclick=()=>taskModal.classList.add('hidden');taskModal.addEventListener('click',e=>{if(e.target===taskModal)taskModal.classList.add('hidden')});
copyTaskLink.onclick=async()=>{try{await navigator.clipboard.writeText(currentTaskUrl);copyTaskLink.textContent='Copiado ✓';setTimeout(()=>copyTaskLink.textContent='Copiar link',1200)}catch(e){taskLinkInput.select();document.execCommand('copy')}};
previewTask.onclick=()=>window.open(currentTaskUrl,'_blank','noopener');
renderSong();
const LuwipiProductionAccess=(()=>{
  const overlay=document.getElementById('accessOverlay');
  const closeButton=document.getElementById('accessClose');
  const accountButton=document.getElementById('accountButton');
  const accountButtonText=document.getElementById('accountButtonText');
  const panels={loading:accessLoading,login:accessLogin,billing:accessBilling,account:accessAccount,error:accessError};
  let client=null,session=null,profile=null,forced=true,initialized=false,angolaBilling=false,lastFailure=null,authSubscription=null,accessStage="configuração",supabaseRef="",publicKey="",supabaseUrl="";

  async function withDeadline(promise,ms,reason){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(reason+'_timeout')),ms)})])}finally{clearTimeout(timer)}}
  async function fetchAccessJson(path,ms){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),ms);
    try{const response=await fetch(path,{cache:'no-store',signal:controller.signal});if(!response.ok)throw new Error(path.includes('public-config')?'config':'region');return await response.json()}
    finally{clearTimeout(timer)}
  }
  function parentLink(){return new URLSearchParams(location.search).get('parent')==='1'}
  let loadingTimer=null;
  function show(name,lock=true){clearTimeout(loadingTimer);forced=lock;Object.entries(panels).forEach(([key,node])=>node.classList.toggle('hidden',key!==name));closeButton.classList.toggle('hidden',lock);overlay.classList.remove('hidden');document.body.classList.toggle('auth-pending',lock);if(name==='loading')loadingTimer=setTimeout(()=>{lastFailure='access_timeout';accessErrorText.textContent='A verificação da '+accessStage+' não respondeu. Podes entrar novamente para recuperar o acesso.';show('error',true)},25000);if(name==='error')restartAccessButton.classList.toggle('hidden',!['session_timeout','profile_timeout','access_timeout'].includes(lastFailure))}
  function unlock(){clearTimeout(loadingTimer);loadingTimer=null;forced=false;overlay.classList.add('hidden');closeButton.classList.add('hidden');document.body.classList.remove('auth-pending')}
  function hasAccess(p){if(!p)return false;if(String(session?.user?.email||'').toLowerCase()==='yurdancdan@gmail.com')return true;const now=Date.now();if(p.product_status==='active'&&(!p.product_access_until||new Date(p.product_access_until).getTime()>now))return true;return p.product_status==='trial'&&p.product_trial_ends_at&&new Date(p.product_trial_ends_at).getTime()>now}
  function label(p){if(String(session?.user?.email||'').toLowerCase()==='yurdancdan@gmail.com')return 'Acesso permanente';if(!p)return 'Acesso por verificar';if(p.product_status==='active')return 'Subscrição ativa';if(p.product_status==='trial'&&p.product_trial_ends_at&&new Date(p.product_trial_ends_at).getTime()>Date.now()){const h=Math.max(1,Math.ceil((new Date(p.product_trial_ends_at).getTime()-Date.now())/3600000));return 'Teste ativo · '+h+'h'}return 'Subscrição necessária'}
  function renderAccount(){const u=session&&session.user;const fallback=(u&&u.user_metadata&&(u.user_metadata.full_name||u.user_metadata.name))||(u&&u.email)||'Professor';accountName.textContent=(profile&&profile.full_name)||fallback;accountEmail.textContent=(u&&u.email)||'—';accountAccessState.textContent=label(profile);accountButtonText.textContent='Conta';accountButton.classList.add('ready')}
  async function profileRows(table,query){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
    try{
      const response=await fetch(supabaseUrl+'/rest/v1/'+table+'?'+query,{headers:{apikey:publicKey,authorization:'Bearer '+session.access_token},cache:'no-store',signal:controller.signal});
      if(!response.ok)throw new Error(table+'_http_'+response.status);
      const rows=await response.json();
      if(!Array.isArray(rows))throw new Error(table+'_invalid');
      return rows;
    }finally{clearTimeout(timer)}
  }
  async function readProfile(id,retry=true){
    const uid=encodeURIComponent(id),[profiles,entitlements]=await Promise.all([
      profileRows('profiles','select=full_name,role&id=eq.'+uid+'&limit=1'),
      profileRows('product_entitlements','select=status,trial_ends_at,access_until,subscription_status&user_id=eq.'+uid+'&product=in.(aprenda,ensine)')
    ]);
    if(!profiles[0]&&retry){await new Promise(ok=>setTimeout(ok,650));return readProfile(id,false)}
    const entitlement=entitlements.find(row=>['active','trial'].includes(row.status)&&(!row.access_until||new Date(row.access_until)>new Date())&&(!row.trial_ends_at||row.status!=='trial'||new Date(row.trial_ends_at)>new Date()))||entitlements[0];
    return profiles[0]?{...profiles[0],product_status:entitlement?.status,product_trial_ends_at:entitlement?.trial_ends_at,product_access_until:entitlement?.access_until,subscription_status:entitlement?.subscription_status}:null;
  }
  async function refresh(showLoading=true){if(showLoading)show('loading',true);try{accessStage='sessão';const r=await withDeadline(client.auth.getSession(),8000,'session');if(r.error)throw r.error;lastFailure=null;if(!authSubscription)authSubscription=client.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'){session=null;profile=null;accountEmail.textContent='';window.dispatchEvent(new Event('luwipi:access-signed-out'));show('login',true)}}).data.subscription;session=r.data.session;if(!session){profile=null;accountEmail.textContent='';window.dispatchEvent(new Event('luwipi:access-signed-out'));accountButtonText.textContent='Entrar';accountButton.classList.remove('ready');show('login',true);return}accessStage='perfil';profile=await withDeadline(readProfile(session.user.id),15000,'profile');if(!profile)throw new Error('profile');renderAccount();if(hasAccess(profile)){unlock();window.dispatchEvent(new Event('luwipi:access-ready'));return}billingReason.textContent=profile.product_status==='trial'?'O período de teste terminou. Escolhe a duração da subscrição para continuar.':'Esta conta precisa de uma subscrição ativa para continuar.';show('billing',true)}catch(e){console.error('Access verification:',e);lastFailure=e.message;accessErrorText.textContent=e.message==='session_timeout'?'A sessão guardada não respondeu. Tenta novamente.':e.message==='profile_timeout'?'A ligação ao teu perfil demorou demasiado. Tenta novamente.':'Não foi possível confirmar o acesso. Tenta novamente.';show('error',true)}}
  async function start(){accessStage='configuração';lastFailure=null;if(parentLink()){unlock();accountButton.classList.add('hidden');return}if(location.protocol==='file:'){unlock();accountButtonText.textContent='Local';return}show('loading',true);try{const [geo,cfg]=await Promise.all([fetchAccessJson('/api/billing/angola',4000).catch(()=>({})),fetchAccessJson('/api/public-config',7000)]);angolaBilling=geo.payment==='whatsapp';if(angolaBilling){const prices=luwipiMode==='aprenda'?{monthly:'15.000 Kz',quarterly:'40.000 Kz',semiannual:'75.000 Kz'}:{monthly:'20.000 Kz',quarterly:'55.000 Kz',semiannual:'105.000 Kz'};document.querySelectorAll('[data-billing-plan]').forEach(button=>{const plan=button.dataset.billingPlan,small=button.querySelector('small'),strong=button.querySelector('strong'),action=button.querySelector('span');if(small)small.textContent=prices[plan]||'';if(strong)strong.textContent=plan==='monthly'?'Mensal':plan==='quarterly'?'Trimestral':'Semestral';if(action)action.textContent='WhatsApp →'})};if(!cfg.supabaseUrl||!cfg.supabasePublishableKey||!window.supabase||!window.supabase.createClient)throw new Error('config');authSubscription?.unsubscribe();authSubscription=null;supabaseRef=new URL(cfg.supabaseUrl).hostname.split('.')[0];supabaseUrl=cfg.supabaseUrl;publicKey=cfg.supabasePublishableKey;client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,appendPkceFlowIdToRedirects:true}});initialized=true;await refresh(false)}catch(e){console.error('Access startup:',e);accessErrorText.textContent=e.name==='AbortError'?'A ligação ao serviço demorou demasiado. Confirma a internet e tenta novamente.':'Não foi possível carregar a configuração de acesso. Tenta novamente.';show('error',true)}}
  async function googleLogin(){if(!client)return;googleLoginButton.disabled=true;googleLoginButton.textContent='A abrir Google…';const oauthOptions={redirectTo:location.origin+'/auth/callback',queryParams:{prompt:'select_account'}};const r=await client.auth.signInWithOAuth({provider:'google',options:oauthOptions});if(r.error){googleLoginButton.disabled=false;googleLoginButton.textContent='Continuar com Google';show('error',true)}}
  async function checkout(plan,button){const old=button.innerHTML;button.disabled=true;try{const current=(await client.auth.getSession()).data.session;if(!current)throw new Error('session');const endpoint=angolaBilling?'/api/billing/angola':'/api/billing/checkout';const headers={'content-type':'application/json','authorization':'Bearer '+current.access_token};const r=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify({plan:plan,product:luwipiMode})});const body=await r.json().catch(()=>({}));if(!r.ok||!body.url)throw new Error('checkout');location.href=body.url}catch(e){console.error(e);button.disabled=false;button.innerHTML=old;billingMessage.textContent='Não foi possível abrir o pagamento agora. Tenta novamente.'}}
  async function logout(){if(client)await client.auth.signOut()}
  googleLoginButton.addEventListener('click',googleLogin);
  retryAccessButton.addEventListener('click',()=>lastFailure==='session_timeout'?start():initialized?refresh(true):start());
  restartAccessButton.addEventListener('click',()=>{try{if(supabaseRef)localStorage.removeItem('sb-'+supabaseRef+'-auth-token')}catch(error){console.warn('Stored session cleanup failed',error)}location.reload()});
  refreshAccessButton.addEventListener('click',()=>refresh(true));
  logoutButton.addEventListener('click',logout);
  billingLogoutButton.addEventListener('click',logout);
  document.querySelectorAll('[data-billing-plan]').forEach(button=>button.addEventListener('click',()=>checkout(button.dataset.billingPlan,button)));
  accountButton.addEventListener('click',()=>{if(location.protocol==='file:')return;if(session&&profile){renderAccount();show('account',false)}else show('login',true)});
  closeButton.addEventListener('click',()=>{if(!forced)unlock()});
  openBillingButton.addEventListener('click',()=>show('billing',false));
  overlay.addEventListener('click',event=>{if(event.target===overlay&&!forced)unlock()});
  async function getAccessToken(){if(!client)return null;const current=(await client.auth.getSession()).data.session;return current&&current.access_token?current.access_token:null}
  return {start,refresh,getAccessToken,getClient:()=>client,getProfile:()=>profile};
})();
window.LuwipiGetAccessToken=()=>LuwipiProductionAccess.getAccessToken();
LuwipiProductionAccess.start();
try{window.LuwipiAudioBridge=Object.freeze({play:pianoSample,noteOn:pianoNoteOn,noteOff:pianoNoteOff,noteMidi:noteMidi,midiNote:midiNote});}catch(_){ }
