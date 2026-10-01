(()=>{
'use strict';
const root=document.getElementById('diagnosticView');if(!root)return;
const content=document.getElementById('diagnosticStage'),prev=document.getElementById('diagnosticPrev'),next=document.getElementById('diagnosticNext'),stepLabel=document.getElementById('diagnosticStepLabel'),bar=document.getElementById('diagnosticProgress');
const KEY='luwipi:sightreading:diagnostic:v1';
const survey=[
 ['Como costumas tocar?', ['Ainda não toco','Principalmente de ouvido ou cifras','Leio algumas partituras','Leio repertório complexo']],
 ['Como lês as duas claves?', ['Ainda não as conheço','Clave de Sol; Fá com dificuldade','As duas lentamente','As duas à primeira vista']],
 ['Consegues coordenar as mãos numa partitura nova?', ['Ainda não','Uma de cada vez','Duas mãos em peças simples','Duas mãos sem preparação']],
 ['Reconheces padrões visuais?', ['Nota por nota','Alguns intervalos','Tríades e inversões','Acordes e acompanhamentos complexos']],
 ['Consegues manter o pulso a ler?', ['Paro muitas vezes','Com ritmos simples','Também com síncopas e 6/8','Com figuras complexas sem parar']],
 ['Quanto tempo tens diariamente?', ['10–15 minutos','20–30 minutos','35–60 minutos','Mais de uma hora']],
 ['Qual é a tua maior dificuldade?', ['Notas nas pautas','Ler à frente e ver padrões','Mão esquerda e coordenação','Pulso e continuidade']],
 ['Qual é o objetivo?', ['Começar a ler','Tocar peças pela pauta','Acompanhar cantores / igreja','Leitura profissional à primeira vista']]
];
const tests=[
 ['Notas nas duas claves','Qual a nota na linha inferior da clave de Sol e da clave de Fá?',['Mi / Sol','Sol / Mi','Fá / Lá','Dó / Sol'],0,'Mi4 é âncora da clave de Sol; Sol2 é âncora da clave de Fá.'],
 ['Intervalos','Dó até Mi é que intervalo?',['2.ª maior','3.ª maior','4.ª perfeita','5.ª perfeita'],1,'Dó–Ré–Mi cobre três posições, com quatro semitons.'],
 ['Tríades e inversões','A tríade de Dó maior com Mi no baixo está em:',['Posição fundamental','Primeira inversão','Segunda inversão','Nenhuma'],1,'Na primeira inversão, a terça do acorde é a nota mais grave.'],
 ['Padrões de mão esquerda','Dó–Sol–Mi–Sol tocados separadamente formam:',['Quinta oca','Oom-pah','Acorde quebrado','Walking bass'],2,'As notas de uma tríade são tocadas sucessivamente.'],
 ['Ritmo e métrica','Em 4/4, semínima pontuada + colcheia + mínima duram:',['3 tempos','3½ tempos','4 tempos','4½ tempos'],2,'1,5 + 0,5 + 2 = 4 tempos.']
];
const abc='X:1\nT:Leitura inicial · 8 compassos\nM:4/4\nL:1/4\nQ:1/4=60\nK:C\n%%score {RH LH}\nV:RH clef=treble\nV:LH clef=bass\n[V:RH] C D E G | G F E D | E E F G | G2 E2 | F E D C | E G F D | C D E F | E2 C2 |]\n[V:LH] C,2 G,2 | G,2 D2 | C,2 G,2 | C,4 | F,2 C2 | G,2 D2 | C,2 G,2 | C,4 |';
let data;try{data=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}
if(!data||data.version!==1)data={version:1,step:0,answers:{},tests:{},performance:{}};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}};
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function choices(opts,selected,onChange){
 const wrap=el('div','diagnostic-choices');
 opts.forEach((name,i)=>{const button=el('button','diagnostic-choice'+(selected===i?' selected':''),name);button.type='button';button.setAttribute('aria-pressed',String(selected===i));button.onclick=()=>{onChange(i);save();render()};wrap.append(button)});
 return wrap;
}
function score(){
 const notes=[['C4','D4','E4','G4'],['G4','F4','E4','D4'],['E4','E4','F4','G4'],['G4','E4'],['F4','E4','D4','C4'],['E4','G4','F4','D4'],['C4','D4','E4','F4'],['E4','C4']];
 const pitch={C4:117,D4:107,E4:97,F4:87,G4:77};
 let s='<svg viewBox="0 0 760 380" role="img" aria-label="Exercício de oito compassos em clave de Sol e Fá">';
 for(let row=0;row<2;row++){
  const shift=row*182;
  for(const y of [47,59,71,83,95,132,144,156,168,180])s+='<line x1="36" x2="740" y1="'+(y+shift)+'" y2="'+(y+shift)+'" stroke="#8798b2"/>';
  s+='<text x="38" y="'+(90+shift)+'" font-size="49">𝄞</text><text x="38" y="'+(173+shift)+'" font-size="40">𝄢</text>';
  for(let m=0;m<4;m++){
   const idx=row*4+m,x=110+m*155,arr=notes[idx],dx=arr.length===2?67:33;
   s+='<text x="'+x+'" y="'+(30+shift)+'" font-size="10" fill="#647897">'+(idx+1)+'</text>';
   if(m)s+='<line x1="'+(x-17)+'" x2="'+(x-17)+'" y1="'+(47+shift)+'" y2="'+(180+shift)+'" stroke="#8798b2"/>';
   arr.forEach((note,j)=>{const nx=x+j*dx,ny=pitch[note]+shift,hollow=arr.length===2;
    s+='<ellipse cx="'+nx+'" cy="'+ny+'" rx="6.5" ry="4.5" transform="rotate(-19 '+nx+' '+ny+')" fill="'+(hollow?'white':'#203863')+'" stroke="#203863" stroke-width="1.5"/><line x1="'+(nx+6)+'" x2="'+(nx+6)+'" y1="'+ny+'" y2="'+(ny-29)+'" stroke="#203863"/>';
    if(note==='C4')s+='<line x1="'+(nx-11)+'" x2="'+(nx+12)+'" y1="'+(117+shift)+'" y2="'+(117+shift)+'" stroke="#8798b2"/>';
   });
   const bass=idx===4?['F3','C3']:idx===1||idx===5?['G2','D3']:['C3','G2'];
   for(let k=0;k<(idx===3||idx===7?1:2);k++){
    const nx=x+k*67,ny=({C3:156,F3:138,D3:149,G2:180})[bass[k]]+shift;
    s+='<ellipse cx="'+nx+'" cy="'+ny+'" rx="7" ry="4.5" fill="white" stroke="#203863" stroke-width="1.5"/><line x1="'+(nx+6)+'" x2="'+(nx+6)+'" y1="'+ny+'" y2="'+(ny-27)+'" stroke="#203863"/>';
   }
  }
 }
 return s+'</svg>';
}
function chooseMetric(name,heading,labels){const box=el('div','diagnostic-metric');box.append(el('strong','',heading));box.append(choices(labels,data.performance[name],n=>data.performance[name]=n));return box}
function results(){
 const done=tests.map((test,i)=>data.tests[i]===test[3]);
 const labels=['A · Pentagrama','B · Intervalos','D · Acordes','E · Mão esquerda','F · Ritmo'];
 const mistakes=tests.filter((test,i)=>!done[i]).map(t=>t[0]);
 const report=el('div','diagnostic-results');
 report.append(el('h3','','Diagnóstico inicial concluído'));
 report.append(el('p','','As respostas mostram pontos para começar a estudar. Os níveis N0–N7 só serão definidos após exercícios observados e repetidos.'));
 labels.forEach((label,i)=>report.append(el('div','diagnostic-result-row',label+' · '+(done[i]?'Reconhecimento correto':'Revisão necessária'))));
 report.append(el('p','','Leitura corrida: '+(data.performance.pauses===0?'sem paragens':'pausas declaradas: '+['0','1','2','3 ou mais'][data.performance.pauses])+'. As outras trilhas continuam em avaliação.'));
 const copy=el('button','diagnostic-copy','Copiar cartão de diagnóstico');copy.onclick=async()=>{
  const card=['LUWIPI · CARTÃO DE DIAGNÓSTICO','Blocos: '+labels.map((l,i)=>l+': '+(done[i]?'acerto':'revisar')).join(' | '),'Leitura corrida: BPM '+['50','60','72','90','100+'][data.performance.bpm]+', pausas '+['0','1','2','3+'][data.performance.pauses]+', notas '+data.performance.notes+'/3, ritmo '+data.performance.rhythm+'/3','Erros para rever após 1, 3, 7 e 14 dias: '+(mistakes.join(', ')||'sem falhas nestes cinco itens'),'Níveis A–J: por certificar; fazer sessões observadas com pulso estável.'].join('\n');
  try{await navigator.clipboard.writeText(card);copy.textContent='Copiado ✓'}catch{copy.textContent='Cópia indisponível'}
 };report.append(copy);
 const again=el('button','diagnostic-again','Repetir diagnóstico');again.onclick=()=>{data={version:1,step:0,answers:{},tests:{},performance:{}};save();render()};report.append(again);return report;
}
function render(){
 const n=data.step;content.replaceChildren();stepLabel.textContent=n<8?'Questionário · '+(n+1)+'/8':n<13?'Teste · '+(n-7)+'/6':n===13?'Leitura corrida · 6/6':'Conclusão';
 bar.style.width=Math.min(100,Math.round((n+1)/15*100))+'%';
 prev.disabled=n===0;next.hidden=n>=14;prev.hidden=n>=14;
 if(n<8){content.append(el('h3','',survey[n][0]));content.append(choices(survey[n][1],data.answers[n],i=>data.answers[n]=i));next.disabled=data.answers[n]===undefined;next.textContent=n===7?'Começar os testes →':'Continuar →';return}
 if(n<13){const test=tests[n-8];content.append(el('small','diagnostic-tag',test[0]));content.append(el('h3','',test[1]));content.append(choices(test[2],data.tests[n-8],i=>data.tests[n-8]=i));next.disabled=data.tests[n-8]===undefined;next.textContent=n===12?'Leitura corrida →':'Continuar →';return}
 if(n===13){
  content.append(el('h3','','Toca estes oito compassos sem voltar atrás'));
  content.append(el('p','','Usa o metrónomo a 60 BPM. Não pares perante erros; mantém o pulso.'));
  const sheet=el('div','diagnostic-score');sheet.innerHTML=score();content.append(sheet);
  const abcBox=el('details','diagnostic-abc');abcBox.append(el('summary','','Notação ABC acessível'));abcBox.append(el('pre','',abc));content.append(abcBox);
  content.append(chooseMetric('bpm','Andamento real',['50 BPM','60 BPM','72 BPM','90 BPM','100 BPM ou mais']));
  content.append(chooseMetric('pauses','Quantas vezes paraste?',['Nenhuma','Uma','Duas','Três ou mais']));
  content.append(chooseMetric('notes','Precisão das notas (0–3)',['0 · Muitas falhas','1 · Poucas corretas','2 · Maioria correta','3 · Sem erros']));
  content.append(chooseMetric('rhythm','Precisão rítmica (0–3)',['0 · Pulso perdido','1 · Várias falhas','2 · Ritmo maioritariamente certo','3 · Pulso e ritmo corretos']));
  next.disabled=!['bpm','pauses','notes','rhythm'].every(k=>data.performance[k]!==undefined);
  next.textContent='Concluir diagnóstico →';return;
 }
 content.append(results());
}
prev.onclick=()=>{data.step=Math.max(0,data.step-1);save();render()};
next.onclick=()=>{if(next.disabled)return;data.step=Math.min(14,data.step+1);save();render()};
document.getElementById('diagnosticExit')?.addEventListener('click',()=>window.LuwipiWorkspaceRouter?.go('reading'));
data.step=Math.max(0,Math.min(14,Number(data.step)||0));render();
})();