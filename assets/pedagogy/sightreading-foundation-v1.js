
(function(root){
'use strict';
const TRACKS={"A":{"name":"Geografia do pentagrama","levels":[["Âncoras Sol/Fá e Dó central","Encontrar Mi4, Sol2 e Dó4 sem contar linhas."],["Linhas e espaços nas duas claves","Ler notas vizinhas em posição fixa ao pulso."],["Mudanças de posição e 2 linhas suplementares","Antecipar deslocamentos sem procurar teclas."],["3–4 linhas suplementares e cruzamento de mãos","Manter a continuidade em tessituras móveis."],["Registos extremos e mudança de clave","Identificar novo referencial antes da entrada."],["8va/15ma e partitura condensada","Transportar visualmente a oitava sem alterar o ritmo."],["Mudanças frequentes de clave e leitura vertical","Preparar várias pautas numa pré-leitura de 30 s."],["Notação profissional, claves e registos mistos","Ler excertos novos com trocas sem perda de pulso."]]},"B":{"name":"Intervalos","levels":[["Repetição, 2ª ascendente/descendente","Ver passo visual e direção num só olhar."],["3ªs melódicas e harmónicas","Reconhecer o salto linha-linha / espaço-espaço."],["4ªs e 5ªs, direções e ambas as mãos","Distinguir contorno e distância em tempo real."],["6ªs e 7ªs em melodias/acordes","Ler intervalos grandes sem enumerar notas."],["8ªs, 9ªs e 10ªs","Antecipar abertura e deslocamento da mão."],["Qualidade: maior, menor, justo e cromatismo","Relacionar desenho e armadura."],["Aumentados/diminutos e inversão intervalar","Identificar alteração e função no contexto."],["Intervalos mistos em textura densa","Agrupar simultaneidades e saltos à vista."]]},"C":{"name":"Armaduras e alterações","levels":[["Dó maior/Lá menor; sustenido, bemol e bequadro","Observar símbolo antes de começar."],["Armaduras de 1–2 acidentes","Aplicar a alteração a todas as oitavas."],["3–4 acidentes; menores naturais/harmónicas","Reconhecer sensible e padrão de escala."],["5–7 acidentes e menor melódica","Ler sem refazer cálculo nota a nota."],["Mudanças de tonalidade e dominantes secundárias","Antecipar acidentes da próxima frase."],["Cromatismo e tonicizações rápidas","Seguir intervalos alterados sobre pulso."],["Enarmonia e modulação distante","Reconhecer grafia funcional em ambas as mãos."],["Notação enharmónica complexa e politonalidade","Manter leitura coerente sob mudança harmónica."]]},"D":{"name":"Acordes nas duas mãos","levels":[["Notas simultâneas e díades","Ver alinhamento vertical com duração comum."],["Tríades maiores/menores em posição fundamental","Ler contorno e qualidade sem soletrar notas."],["Primeira/segunda inversão nas duas mãos","Reconhecer nota grave e forma visual."],["Sétimas diatónicas e inversões","Identificar guia de 3ª e 7ª."],["Extensões 9ª, 11ª, 13ª e cifras","Distinguir estrutura da tensão acrescentada."],["Voicings fechados/abertos e condução de vozes","Procurar movimento mínimo entre acordes."],["Dominantes alteradas e rearmonização escrita","Executar tensões preservando vozes comuns."],["Voicings de acompanhamento complexos à vista","Conciliar cifra, grafia e articulação."]]},"E":{"name":"Padrões de mão esquerda","levels":[["Pedal de baixo e notas longas","Ler o pulso do baixo junto da melodia."],["Quintas ocas e baixo–quinta","Reconhecer forma constante sem olhar para a mão."],["Bloco, oom-pah e baixo de valsa","Identificar desenho pelo primeiro compasso."],["Alberti e arpejos regulares","Agrupar 4 notas como uma unidade."],["Oitavas quebradas, balada e bossa simples","Antecipar saltos e contratempos."],["Stride, walking bass e ostinato","Ler deslocamentos amplos sem interromper."],["Gospel, bossa complexa e baixo cromático","Conduzir harmonia com independência."],["Baixo cifrado, estilos mistos e redução","Escolher padrão a partir do contexto escrito."]]},"F":{"name":"Ritmo e métrica","levels":[["Pulso, semínimas, mínimas e pausas em 4/4","Contar e continuar após um erro."],["Colcheias e 3/4, ataques e pausas","Agrupar pulsos e subdivisões."],["Pontuações e 6/8","Sentir dois pulsos compostos, não seis pesados."],["Síncopa e semicolcheias simples","Manter subdivisão silenciosa."],["Tercinas/quiálteras e mudanças de compasso","Reconhecer células rítmicas recorrentes."],["Swing e sobreposição binário/ternário","Preservar a pulsação sem rigidez artificial."],["5/8, 7/8 e polirritmia 3:2","Agrupar em 2+3 / 2+2+3 conforme sinalização."],["Métrica mista e polirritmia complexa","Acompanhar mudanças sem parar."]]},"G":{"name":"Articulação, dinâmica, pedal e ornamentos","levels":[["Legato, staccato e piano/forte","Associar símbolo a ataque e duração."],["Acentos e frases simples","Ler articulação antes da execução."],["Crescendo, diminuendo e ligaduras entre mãos","Combinar frase e pulso sem alterar andamento."],["Pedal de sustentação e mudanças harmónicas","Trocar pedal onde a harmonia pede."],["Mordentes, apogiaturas e trinados lentos","Executar ornamentos sem quebrar o compasso."],["Contrastes de planos sonoros","Destacar melodia e conter acompanhamento."],["Pedal sincopado, ornamentos rápidos, rubato escrito","Preservar estrutura métrica nos efeitos."],["Notação expressiva contemporânea","Decidir gesto após pré-leitura objetiva."]]},"H":{"name":"Textura e polifonia","levels":[["Melodia e nota sustentada","Ouvir duas funções sem perder a pulsação."],["Melodia com acompanhamento simples","Ler verticalmente ambas as pautas."],["Duas vozes com hastes separadas","Sustentar uma voz durante movimento da outra."],["Imitação simples a 2 vozes","Reconhecer entrada e resposta."],["Coral a 4 vozes","Seguir condução por linhas, não por blocos isolados."],["Invenções a 2–3 vozes","Antecipar cruzamentos e motivos."],["Excertos de fuga e camadas contrapontísticas","Priorizar vozes sem perder a leitura global."],["Polifonia densa e redução à primeira vista","Manter hierarquia num excerto desconhecido."]]},"I":{"name":"Competências do olhar","levels":[["Pré-leitura de clave, compasso e extremos","Olhar antes de começar e evitar retorno."],["Agrupar 2–4 notas visualmente","Não decodificar cada nota separadamente."],["Olhar um pulso à frente","Continuar sem voltar atrás após erros."],["Olhar um compasso à frente, mãos independentes","Usar visão periférica e âncoras."],["Pré-leitura cronometrada de 30 s","Identificar dificuldades e padrões centrais."],["Antecipar modulação e textura","Preparar olhos para a próxima frase."],["Ler 2–4 pautas e ignorar distrações","Reduzir olhares para teclado sob pressão."],["Leitura corrida extensiva à primeira vista","Não reutilizar repertório já memorizado."]]},"J":{"name":"Nível profissional","levels":[["Cifras básicas e localização do tom","Relacionar cifra, baixo e melodia simples."],["Acompanhamento a partir de cifra simples","Manter pulsação com inversões fáceis."],["Transposição de 2ª em melodias curtas","Ler por graus e contornos."],["Lead sheet, transposição de 4ª/5ª e cantor","Antecipar harmonia em tempo real."],["Claves de dó e acompanhamento com alterações","Ler grafias diferentes sem interromper."],["Redução simples de coro/ensemble","Selecionar vozes essenciais sem ocultar ritmo."],["Transposição e leitura orquestral simultâneas","Adaptar textura respeitando harmonia."],["Teatro/estúdio: redução e música contemporânea","Ler material inédito com integridade rítmica."]]}};
const STAGES=[{"meter":"4/4","q":60,"d":[2,2,2,2],"key":"C","bass":"C,"},{"meter":"4/4","q":64,"d":[1,1,2,2,2],"key":"C","bass":"C,"},{"meter":"3/4","q":68,"d":[1,1,2,2],"key":"G","bass":"G,,"},{"meter":"4/4","q":72,"d":[1,1,1,1,2,2],"key":"F","bass":"F,"},{"meter":"6/8","q":72,"d":[1,1,1,3],"key":"Dm","bass":"D,"},{"meter":"4/4","q":76,"d":[0.5,0.5,1,1,1,2,2],"key":"A","bass":"A,,"},{"meter":"5/8","q":80,"d":[1,1,1,2],"key":"E","bass":"E,"},{"meter":"7/8","q":84,"d":[1,1,1,1,1,2],"key":"B","bass":"B,,"}];
const POOLS={"A":["C","D","E","F","G","A","B","c","d","e","f","g","a"],"B":["C","E","D","G","F","B","A","c","d","g","e","a"],"C":["C","D","E","G","A","B","c","d","^F","_B","=B","^C"],"D":["[CE]","[EG]","[CEG]","[EGc]","[Gce]","[CEGB]","[GBdf]","[CEGBd]","[GBdfa]"],"E":["E","G","F","A","D","c","B","e","d","g","a"],"F":["C","D","E","G","F","A","B","c","d","e"],"G":["G","A","B","c","d","e","f","g","a"],"H":["E","G","F","A","D","B","c","e","d","g"],"I":["C","D","E","F","G","A","B","c","d","e","g"],"J":["E","G","A","B","c","d","e","f","g","a"]};
const IDS=Object.keys(TRACKS), LEVELS=['N0','N1','N2','N3','N4','N5','N6','N7'];
const PREFIX='luwipi:pedagogy:v1';
function moduleFor(track,level){
 if(!TRACKS[track]||!Number.isInteger(level)||level<0||level>7)throw Error('Módulo inválido');
 const [objective,proof]=TRACKS[track].levels[level];
 return {id:track+'-N'+level,track,level,name:TRACKS[track].name,objective,proof};
}
function availableVariants(track){if(!POOLS[track])throw Error('Trilha inválida');return POOLS[track].length*2}
function duration(v){return v===1?'':v===.5?'/2':String(v)}
function initialBass(track,level,bar){
 const s=STAGES[level],r=s.bass,dom={C:'G,,',G:'D,',F:'C,',Dm:'A,,',A:'E,',E:'B,,',B:'^F,,'}[s.key]||'G,,';
 const b=bar%2===0?r:dom;
 const chord=(level>=4?'['+b+'E,'+'G,'+']':'['+b+'E,'+']');
 if(track==='E'){
  switch(level){
   case 0:return b+'8';
   case 1:return b+'2 '+dom+'2 '+b+'2 '+dom+'2';
   case 2:return b+'2 '+chord+'2 '+dom+'2';
   case 3:return b+'2 '+dom+'2 E,2 '+dom+'2';
   case 4:return b+'1 '+dom+'1 '+chord+'1 '+dom+'1 '+chord+'1 '+dom+'1';
   case 5:return b+'2 '+chord+'2 '+dom+'2 '+chord+'2';
   case 6:return b+'1 '+dom+'1 E,1 '+chord+'2';
   default:return b+'1 '+dom+'1 E,1 '+chord+'1 '+dom+'1 '+chord+'2';
  }
 }
 switch(level){
  case 0:return b+'4 '+dom+'4';
  case 1:return b+'2 '+dom+'2 '+b+'2 '+dom+'2';
  case 2:return b+'2 '+chord+'2 '+dom+'2';
  case 3:return b+'2 '+dom+'2 '+chord+'2 '+dom+'2';
  case 4:return b+'3 '+dom+'3';
  case 5:return b+'2 '+chord+'2 '+dom+'2 '+chord+'2';
  case 6:return b+'1 '+dom+'1 '+chord+'1 '+dom+'2';
  default:return b+'1 '+dom+'1 '+chord+'1 '+b+'1 '+dom+'1 '+chord+'2';
 }
}
function makeSeed(track,level,variant=0){
 const mod=moduleFor(track,level),s=STAGES[level],p=POOLS[track];
 if(!Number.isInteger(variant)||variant<0||variant>=availableVariants(track))throw Error('Banco de variantes esgotado: exige novas composições');
 const reverse=variant>=p.length,shift=variant%p.length,barShift=[0,3,1,5,2,7,4,6],rh=[],lh=[];
 for(let bar=0;bar<8;bar++){
  const notes=s.d.map((v,i)=>{
   let n=(i+barShift[bar]+shift)%p.length;
   if(reverse)n=p.length-1-n;
   const note=p[n];
   let prefix='';
   if(track==='G')prefix=level<2?'!staccato!':level<4?'!accent!':level<6?'!p!':'!f!';
   if(track==='J'&&i===0)prefix='"'+['C','G','F','Dm','Am','E7','B7','F#7'][bar]+'"';
   return prefix+note+duration(v);
  });
  // Módulos avançados exigem posteriormente uma partitura especializada; a semente não certifica competência.
  rh.push(notes.join(' '));lh.push(initialBass(track,level,bar));
 }
 const title=track+' · N'+level+' · Estudo original '+(variant+1);
 const abc=['X:1','T:'+title,'M:'+s.meter,'L:1/8','Q:1/4='+s.q,'K:'+((track==='C')?['C','G','D','A','E','B','F#','C#'][level]:s.key),'%%score { RH LH }','V:RH clef=treble','V:LH clef=bass','[V:RH] '+rh.join(' | ')+' |]','[V:LH] '+lh.join(' | ')+' |]'].join('\n');
 return {id:track+'N'+level+'-s'+variant,track,level,variant,title,abc,key:(track==='C')?['C','G','D','A','E','B','F#','C#'][level]:s.key,meter:s.meter,bpm:s.q,hands:['direita','esquerda'],intent:mod.objective,proof:mod.proof,coverage:level>=4?'base_de_leitura_nao_certifica_topico_avancado':'semente_de_leitura_sujeita_a_revisao',previewAllowed:false};
}
function placementFromDiagnostic(diagnostic){
 const names=['A','B','D','E','F'],result=Object.fromEntries(IDS.map(k=>[k,{level:0,status:'não avaliado',candidate:0}]));
 (diagnostic?.tests||[]).forEach((answer,i)=>{
  if(i>=names.length)return;
  result[names[i]]={level:0,status:answer===true?'reconhecimento elementar observado':'necessita reforço inicial',candidate:0};
 });
 // Um item de escolha múltipla nunca certifica uma trilha nem autoriza pular níveis.
 return result;
}
function dueDates(isoDate){const d=new Date(isoDate+'T12:00:00Z');if(Number.isNaN(+d))throw Error('Data inválida');return [1,3,7,14].map(days=>new Date(+d+days*86400000).toISOString().slice(0,10))}
function newProfile(){
 return {version:1,levels:Object.fromEntries(IDS.map(k=>[k,{level:0,certified:false,streak:[],sessions:[]}])),mistakes:[],seen:[],lastGeneralReview:null};
}
function record(profile,attempt){
 const p=structuredClone(profile),m=moduleFor(attempt.track,attempt.level),s=p.levels[m.track];
 if(s.level!==m.level)throw Error('A tentativa pertence a outro nível');
 if(!attempt.sessionId||!attempt.exerciseId||!attempt.date)throw Error('Tentativa incompleta');
 if(p.seen.includes(attempt.exerciseId)&&attempt.kind==='first_sight')throw Error('Leitura à primeira vista já vista: gerar material inédito');
 if(s.sessions.some(x=>x.sessionId===attempt.sessionId))throw Error('Sessão duplicada');
 const note=Number(attempt.notes),rhythm=Number(attempt.rhythm),stops=Number(attempt.stops),bpm=Number(attempt.bpm);
 if(![note,rhythm].every(x=>Number.isFinite(x)&&x>=0&&x<=1)||!Number.isInteger(stops)||stops<0||!Number.isFinite(bpm)||bpm<=0)throw Error('Métricas inválidas');
 const min=Math.min(note,rhythm),objective=['verified_midi','teacher_verified'].includes(attempt.evidence);
 const stable=stops===0&&attempt.stablePulse===true,bpmOk=bpm>=STAGES[m.level].q*.85;
 const success=min>=.9&&stable&&bpmOk&&objective;
 const entry={sessionId:attempt.sessionId,exerciseId:attempt.exerciseId,date:attempt.date,notes:note,rhythm,stops,bpm,verified:objective,success};
 s.sessions.push(entry);
 if(attempt.kind==='first_sight')p.seen.push(attempt.exerciseId);
 s.streak=success?[...s.streak,attempt.sessionId].slice(-3):[];
 if(min<.7)s.recommendation=m.level===0?'decompor exercício':'recuar um passo temporariamente';
 else s.recommendation=objective?'continuar no módulo':'progresso provisório: verificar presencialmente ou por MIDI';
 for(const error of attempt.errors||[]){
  if(!error?.pattern)continue;
  const found=p.mistakes.find(x=>x.pattern===error.pattern&&x.track===m.track&&x.level===m.level);
  const dates=dueDates(attempt.date);
  if(found){found.lastSeen=attempt.date;found.due=dates}
  else p.mistakes.push({track:m.track,level:m.level,pattern:String(error.pattern),lastSeen:attempt.date,due:dates});
 }
 return {profile:p,eligibleForGate:s.streak.length===3,provisional:!objective,recommendation:s.recommendation};
}
function passGate(profile,track,parts){
 const p=structuredClone(profile),m=p.levels[track];if(!m||m.streak.length<3)throw Error('É necessário 90% e pulso estável em 3 sessões verificadas');
 const names=['recognition','rhythm','leftHand','continuousReading','preReading'];
 for(const k of names){
  const x=parts?.[k];
  if(!x||x.score<.9||x.stops>0||!x.verified)throw Error('Portão não concluído: '+k);
 }
 if(m.level>=7){m.certified=true;return p}
 m.level++;m.certified=false;m.streak=[];return p;
}
root.LuwipiPedagogyV1=Object.freeze({tracks:TRACKS,stages:STAGES,levels:LEVELS,trackIds:IDS,moduleFor,makeSeed,availableVariants,placementFromDiagnostic,newProfile,record,passGate,dueDates});
})(typeof window!=='undefined'?window:globalThis);
