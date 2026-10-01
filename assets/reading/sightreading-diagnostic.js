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
const extra=[
 ['C','Qual sinal anula um sustenido escrito anteriormente?',['Outro sustenido','Bequadro','Ligadura','Ponto de aumento'],1,'O bequadro anula uma alteração anterior; lê-o mantendo o pulso.'],
 ['I','O que deves observar durante 30 segundos antes de ler pela primeira vez?',['Só a primeira nota','Claves, armadura, compasso e extremos','As teclas brancas apenas','O último acorde'],1,'Preparar o olhar evita paragens por surpresas previsíveis.'],
 ['G','O ponto de staccato sobre uma semínima indica:',['Acelerar o ataque','Encurtar a duração, sem mover o ataque','Dobrar a duração','Mudar de tonalidade'],1,'Staccato modifica articulação, não o lugar do ataque no pulso.'],
 ['H','Uma mínima superior ocorre enquanto a voz inferior toca duas semínimas. A mão superior deve:',['Soltar ao segundo ataque','Sustentar a mínima inteira','Repetir a nota superior','Parar ambas as vozes'],1,'As vozes têm durações independentes dentro do mesmo compasso.'],
 ['J','A cifra G7 indica:',['Um acorde de Sol com sétima','Sete compassos na tonalidade de Sol','Sol tocado em sete oitavas','A sétima tecla da escala'],0,'A cifra resume a estrutura harmónica Sol–Si–Ré–Fá.']
];
const abc='X:1\nT:Leitura inicial · 8 compassos\nM:4/4\nL:1/4\nQ:1/4=60\nK:C\n%%score {RH LH}\nV:RH clef=treble\nV:LH clef=bass\n[V:RH] C D E G | G F E D | E E F G | G2 E2 | F E D C | E G F D | C D E F | E2 C2 |]\n[V:LH] C,2 G,,2 | G,,2 D,2 | C,2 G,,2 | C,4 | F,2 C,2 | G,,2 D,2 | C,2 G,,2 | C,4 |';
let data;try{data=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}
if(!data||data.version!==1)data={version:1,step:0,answers:{},tests:{},performance:{}};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}};
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function choices(opts,selected,onChange){
 const wrap=el('div','diagnostic-choices');
 opts.forEach((name,i)=>{const button=el('button','diagnostic-choice'+(selected===i?' selected':''),name);button.type='button';button.setAttribute('aria-pressed',String(selected===i));button.onclick=()=>{onChange(i);save();render()};wrap.append(button)});
 return wrap;
}
/* Engrave the eight-bar sight-reading test using the same deterministic music engine as Practice. */
function drawScore(host){
 const E=window.LuwipiScoreEngine;
 if(!E?.render){host.textContent='Partitura indisponível. Usa a notação ABC abaixo.';return}
 const rh=[
  [['C4',1],['D4',1],['E4',1],['G4',1]],
  [['G4',1],['F4',1],['E4',1],['D4',1]],
  [['E4',1],['E4',1],['F4',1],['G4',1]],
  [['G4',2],['E4',2]],
  [['F4',1],['E4',1],['D4',1],['C4',1]],
  [['E4',1],['G4',1],['F4',1],['D4',1]],
  [['C4',1],['D4',1],['E4',1],['F4',1]],
  [['E4',2],['C4',2]]
 ];
 const lh=[
  [['C3',2],['G2',2]],
  [['G2',2],['D3',2]],
  [['C3',2],['G2',2]],
  [['C3',4]],
  [['F3',2],['C3',2]],
  [['G2',2],['D3',2]],
  [['C3',2],['G2',2]],
  [['C3',4]]
 ];
 const events=[];
 for(const [clef,measures] of [['treble',rh],['bass',lh]]){
  measures.forEach((measure,index)=>{
   let beat=index*4;
   for(const [note,durationBeat] of measure){
    const midi=E.nameToMidi(note);
    events.push({id:'diag-'+clef+'-'+events.length,midi,note,clef,startBeat:beat,durationBeat,velocity:78});
    beat+=durationBeat;
   }
  });
 }
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('aria-label','Leitura inicial: oito compassos nas claves de Sol e Fá');
 host.replaceChildren(svg);
 const score=E.normalizeScore({title:'Leitura inicial · 8 compassos',source:'diagnostic',tempoBpm:60,meter:[4,4],keyFifths:0,events,durationBeats:32});
 E.render(svg,score,{showNoteNames:false,currentGroupIndex:-1});
}
function chooseMetric(name,heading,labels){const box=el('div','diagnostic-metric');box.append(el('strong','',heading));box.append(choices(labels,data.performance[name],n=>data.performance[name]=n));return box}
function results(){
 const first=['A','B','D','E','F'];
 const results=[...tests.map((test,i)=>({key:first[i],name:test[0],done:data.tests[i]===test[3]})),
   ...extra.map(test=>({key:test[0],name:test[1],done:data.tests[test[0]]===test[4]}))];
 const mistakes=results.filter(test=>!test.done).map(test=>test.key+' · '+test.name);
 const report=el('div','diagnostic-results');
 report.append(el('h3','','Diagnóstico inicial concluído'));
 report.append(el('p','','As respostas mostram pontos para começar a estudar. Os níveis N0–N7 só serão definidos após exercícios observados e repetidos.'));
 results.sort((a,b)=>a.key.localeCompare(b.key)).forEach(result=>report.append(el('div','diagnostic-result-row',result.key+' · '+(result.done?'Reconhecimento inicial correto':'Revisão necessária'))));
 report.append(el('p','','Leitura corrida: '+(data.performance.pauses===0?'sem paragens':'pausas declaradas: '+['0','1','2','3 ou mais'][data.performance.pauses])+'. As outras trilhas continuam em avaliação.'));
 const copy=el('button','diagnostic-copy','Copiar cartão de diagnóstico');copy.onclick=async()=>{
  const card=['LUWIPI · CARTÃO DE DIAGNÓSTICO','Trilhas: '+results.map(r=>r.key+': '+(r.done?'acerto inicial':'revisar')).join(' | '),'Leitura corrida: BPM '+['50','60','72','90','100+'][data.performance.bpm]+', pausas '+['0','1','2','3+'][data.performance.pauses]+', notas '+data.performance.notes+'/3, ritmo '+data.performance.rhythm+'/3','Erros para rever após 1, 3, 7 e 14 dias: '+(mistakes.join(', ')||'sem falhas nos dez itens iniciais'),'Níveis A–J: por certificar; fazer sessões observadas com pulso estável.'].join('\n');
  try{await navigator.clipboard.writeText(card);copy.textContent='Copiado ✓'}catch{copy.textContent='Cópia indisponível'}
 };report.append(copy);
 const again=el('button','diagnostic-again','Repetir diagnóstico');again.onclick=()=>{data={version:1,step:0,answers:{},tests:{},performance:{}};save();render()};report.append(again);return report;
}
function render(){
 const n=data.step;content.replaceChildren();stepLabel.textContent=n<8?'Questionário · '+(n+1)+'/8':n<13?'Teste · '+(n-7)+'/6':n===13?'Leitura corrida · 6/6':'Conclusão';
 bar.style.width=Math.min(100,Math.round((n+1)/15*100))+'%';
 prev.disabled=n===0;next.hidden=n>=14;prev.hidden=n>=14;
 if(n<8){content.append(el('h3','',survey[n][0]));content.append(choices(survey[n][1],data.answers[n],i=>data.answers[n]=i));next.disabled=data.answers[n]===undefined;next.textContent=n===7?'Começar os testes →':'Continuar →';return}
 if(n<13){
  const test=tests[n-8],supplement=extra[n-8];
  content.append(el('small','diagnostic-tag','Bloco '+(n-7)+' de 6 · duas competências'));
  content.append(el('h3','',test[1]));
  content.append(choices(test[2],data.tests[n-8],i=>data.tests[n-8]=i));
  content.append(el('h3','diagnostic-second-question',supplement[1]));
  content.append(choices(supplement[2],data.tests[supplement[0]],i=>data.tests[supplement[0]]=i));
  next.disabled=data.tests[n-8]===undefined||data.tests[supplement[0]]===undefined;
  next.textContent=n===12?'Leitura corrida →':'Continuar →';return
 }
 if(n===13){
  content.append(el('h3','','Toca estes oito compassos sem voltar atrás'));
  content.append(el('p','','Usa o metrónomo a 60 BPM. Não pares perante erros; mantém o pulso.'));
  const sheet=el('div','diagnostic-score');content.append(sheet);drawScore(sheet);
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