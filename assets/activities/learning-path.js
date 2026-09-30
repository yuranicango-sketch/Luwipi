(()=>{
  'use strict';
  const view=document.getElementById('courseView'),modal=document.getElementById('courseOnboarding');
  if(!view||!modal)return;
  const KEY='luwipi:learning-path:v1';
  const ageNames={'5-8':'5–8 anos','9-12':'9–12 anos','13-17':'13–17 anos','18+':'Adulto'};
  const tracks={
    '5-8':[
      {title:'Conhece o Dó',hint:'Ouve a nota e encontra a tecla.',kind:'exercise',index:0},
      {title:'Pinta e toca',hint:'As cores mostram os sons.',kind:'link',href:'/pintar-teclas.html'},
      {title:'Dó e Ré',hint:'Duas posições vizinhas.',kind:'exercise',index:1},
      {title:'Bolhas do som',hint:'Escuta, toca e descobre.',kind:'button',selector:'#soundBubblesCard'},
      {title:'Um pequeno ritmo',hint:'Sente o pulso com o corpo.',kind:'button',selector:'#rhythmView .rhythm-menu-card:nth-child(2)'},
      {title:'Dó, Ré e Mi',hint:'Toca a primeira frase.',kind:'exercise',index:2},
      {title:'Brilha, brilha',hint:'Uma música que já conheces.',kind:'song',id:'twinkle'}
    ],
    '9-12':[
      {title:'Primeira nota na pauta',hint:'Liga o som ao desenho.',kind:'exercise',index:0},
      {title:'Dó, Ré e Mi',hint:'Lê e toca três alturas.',kind:'exercise',index:2},
      {title:'Segue a melodia',hint:'Toca junto das notas.',kind:'button',selector:'[data-game="tinyFollow"]'},
      {title:'Pulso e compasso',hint:'Conta e sente quatro tempos.',kind:'button',selector:'#rhythmView .rhythm-menu-card:nth-child(2)'},
      {title:'Ode à Alegria',hint:'Uma frase com pulso regular.',kind:'song',id:'ode'},
      {title:'Mão esquerda',hint:'Uma nova clave, os mesmos sons.',kind:'exercise',hand:'left',index:0},
      {title:'Jingle Bells',hint:'Repetição e colcheias.',kind:'song',id:'jingle'}
    ],
    '13-17':[
      {title:'Encontra o Dó',hint:'A tecla e a posição na pauta.',kind:'exercise',index:0},
      {title:'Lê três notas',hint:'Dó, Ré e Mi sem adivinhar.',kind:'exercise',index:2},
      {title:'Caça às notas',hint:'Reconhece alturas em movimento.',kind:'button',selector:'[data-game="noteHunt"]'},
      {title:'Ode à Alegria',hint:'Frases de quatro compassos.',kind:'song',id:'ode'},
      {title:'Ritmo em ação',hint:'Toca ataques rítmicos.',kind:'button',selector:'#rhythmView .rhythm-menu-card:nth-child(3)'},
      {title:'Mão esquerda',hint:'Lê também a clave de Fá.',kind:'exercise',hand:'left',index:0},
      {title:'Minueto em Sol',hint:'Fá sustenido e duas mãos.',kind:'song',id:'minuet',version:'both'}
    ],
    '18+':[
      {title:'Do teclado à pauta',hint:'O Dó em som, tecla e nota.',kind:'exercise',index:0},
      {title:'Passo a passo',hint:'Lê Dó, Ré e Mi.',kind:'exercise',index:2},
      {title:'Pulso de quatro tempos',hint:'Sente o tempo antes da teoria.',kind:'button',selector:'#rhythmView .rhythm-menu-card:nth-child(2)'},
      {title:'Ode à Alegria',hint:'Uma frase completa de Beethoven.',kind:'song',id:'ode'},
      {title:'Clave de Fá',hint:'Aprende a pauta da mão esquerda.',kind:'exercise',hand:'left',index:0},
      {title:'Duas mãos em Sol',hint:'Minueto de Petzold.',kind:'song',id:'minuet',version:'both'},
      {title:'Leitura contínua',hint:'Lê sem interromper o pulso.',kind:'button',selector:'#readingView .reading-flow-entry'}
    ]
  };
  const introCount=3;
  let profile=null,step=0,answers={},activeIndex=-1,launching=false;
  const lessonIdeas={
    'Conhece o Dó':['A tecla branca antes das duas pretas é o Dó.','Qual tecla vem antes das duas pretas?',['Dó','Sol','Si'],0,'C4','Encontra o Dó e toca quatro vezes.'],
    'Primeira nota na pauta':['O Dó central aparece numa pequena linha abaixo da pauta de Sol.','Onde fica o Dó central?',['Numa linha abaixo','Na linha de cima','Fora do teclado'],0,'C4','Segue o Dó na pauta e no piano.'],
    'Encontra o Dó':['O Dó central une a posição no teclado à linha suplementar da pauta.','O que liga o som ao símbolo?',['A posição da nota','A cor do ecrã','O tamanho da tecla'],0,'C4','Localiza e toca o Dó ao ler.'],
    'Do teclado à pauta':['A tecla Dó central fica antes do grupo de duas pretas; na pauta de Sol usa uma linha suplementar.','Qual grupo ajuda a encontrar o Dó?',['Duas teclas pretas','Três teclas brancas','Uma tecla preta'],0,'C4','Ouve, identifica e toca o Dó na partitura.'],
    'Pinta e toca':['Cada tecla tem um som. Tocar revela a sua cor, sem mudar a altura.','O que acontece ao tocar uma tecla?',['Ouve-se uma nota','Muda a música','Fica em silêncio'],0,'C4','Pinta teclas diferentes e escuta cada som.'],
    'Dó e Ré':['Ré é a tecla branca logo a seguir ao Dó. Na pauta sobe um passo.','Qual nota vem depois do Dó?',['Mi','Ré','Sol'],1,'D4','Alterna Dó e Ré sem perder a ordem.'],
    'Dó, Ré e Mi':['Cada passo para a tecla branca vizinha faz a melodia subir: Dó, Ré, Mi.','Qual sequência sobe passo a passo?',['Dó, Ré, Mi','Mi, Dó, Sol','Ré, Dó, Si'],0,'E4','Lê as três alturas e toca a frase.'],
    'Lê três notas':['Dó, Ré e Mi avançam um degrau de cada vez no teclado e na pauta.','Qual é a nota entre Dó e Mi?',['Sol','Ré','Lá'],1,'D4','Lê primeiro; depois executa no piano.'],
    'Passo a passo':['No teclado e na pauta, Dó, Ré e Mi formam três graus conjuntos.','Qual nota está entre Dó e Mi?',['Ré','Fá','Sol'],0,'D4','Lê e toca uma nota de cada vez.'],
    'Bolhas do som':['Escuta uma altura antes de escolher. Compara o que ouves com o piano.','O que fazes primeiro?',['Escuto','Adivinho pela cor','Toco sem ouvir'],0,'G4','Escuta e escolhe a bolha correspondente.'],
    'Segue a melodia':['Ouve a direção da frase: quando a nota sobe, a próxima tecla fica à direita.','Se a melodia sobe, onde fica a tecla seguinte?',['À direita','À esquerda','Na mesma tecla'],0,'E4','Segue a melodia sem correr.'],
    'Caça às notas':['Uma nota na pauta indica uma altura; encontra a mesma altura no teclado.','O que deves comparar?',['Altura da nota e tecla','Apenas a cor','O tamanho do botão'],0,'G4','Reconhece as notas em movimento.'],
    'Um pequeno ritmo':['O pulso é a batida regular. Conta 1, 2, 3, 4 sem acelerar.','Qual contagem mantém o pulso?',['1, 2, 3, 4','1, 3, 2, 4','Cada vez mais rápido'],0,'C4','Marca os quatro tempos com a mão.'],
    'Pulso e compasso':['Quatro pulsos regulares formam um compasso de 4/4.','Quantos pulsos há neste compasso?',['Dois','Três','Quatro'],2,'C4','Conta em voz alta e acompanha o jogo.'],
    'Pulso de quatro tempos':['Em 4/4, cada compasso reúne quatro tempos regulares.','Quantos tempos contas até recomeçar?',['Quatro','Cinco','Dois'],0,'C4','Mantém a contagem enquanto tocas.'],
    'Ritmo em ação':['O ritmo diz quando tocar; a altura diz qual nota tocar.','O que o ritmo indica?',['Quando tocar','Qual cor usar','O nome da tecla'],0,'C4','Experimenta os ataques no pulso.'],
    'Ode à Alegria':['A frase de Beethoven começa com notas vizinhas. Escuta o pulso e toca sem interromper.','O que mantém a frase unida?',['Pulso regular','Tocar cada vez mais rápido','Parar em cada nota'],0,'E4','Ouve a frase e toca os primeiros compassos.'],
    'Brilha, brilha':['Esta melodia conhecida alterna repetição, passos e um salto de Dó para Sol.','Dó para Sol é um…',['Salto','Passo vizinho','Silêncio'],0,'G4','Encontra o salto e segue a melodia.'],
    'Jingle Bells':['Um motivo é um pequeno desenho musical que se repete.','Quando ouves o mesmo desenho outra vez, é…',['Repetição','Uma clave','Um silêncio'],0,'E4','Toca o motivo e reconhece quando volta.'],
    'Clave de Fá':['A clave de Fá orienta a pauta grave, normalmente tocada pela mão esquerda.','Qual mão vais explorar agora?',['Esquerda','Direita','Nenhuma'],0,'C3','Encontra o Dó grave e toca a sequência.'],
    'Mão esquerda':['A mão esquerda pode tocar sons mais graves. A clave de Fá ajuda a lê-los.','Que registo vais tocar?',['Grave','Agudo','Silêncio'],0,'C3','Lê a clave de Fá e toca com a esquerda.'],
    'Minueto em Sol':['Sol maior tem Fá sustenido. As duas mãos seguem pautas diferentes.','Qual nota é alterada em Sol maior?',['Fá','Dó','Si'],0,'G4','Lê as duas pautas e começa devagar.'],
    'Duas mãos em Sol':['No Minueto em Sol, cada mão tem a sua pauta; o Fá é sustenido.','Quantas pautas acompanhas?',['Uma','Duas','Três'],1,'G4','Experimenta uma mão de cada vez.'],
    'Leitura contínua':['Olha um pouco à frente da nota que tocas. Mantém o pulso mesmo se errares.','O que fazes após um erro?',['Continuo no pulso','Recomeço sempre','Paro a música'],0,'C4','Segue a pauta sem parar.']
  };
  const lessonView=document.createElement('section');lessonView.id='courseLesson';lessonView.className='view course-lesson';lessonView.setAttribute('aria-label','Aula interativa');
  lessonView.innerHTML='<main class="course-lesson-page"><header class="course-lesson-head"><button type="button" id="lessonBack" aria-label="Voltar à trilha">←</button><div><small id="lessonProgress">AULA · 1 DE 3</small><h1 id="lessonTitle"></h1></div><span>✦ +10</span></header><div class="lesson-bar"><i></i><i></i><i></i></div><section class="lesson-stage" aria-live="polite"><span class="lesson-kicker" id="lessonKicker"></span><h2 id="lessonHeading"></h2><p id="lessonBody"></p><div class="lesson-visual" id="lessonVisual"><div class="lesson-keys"></div><button type="button" id="lessonListen">▶ Ouvir de novo</button></div><div id="lessonChoices" class="lesson-choices"></div><p id="lessonFeedback" class="lesson-feedback" role="status"></p></section><footer class="lesson-actions"><button type="button" id="lessonNext" disabled>Continuar</button></footer></main>';
  view.after(lessonView);
  const lessonState={index:-1,phase:0,answered:false};
  const lessonEl=id=>document.getElementById(id);
  function sound(note){const bridge=window.LuwipiAudioBridge;if(bridge?.play)bridge.play(note,1,480,.9);else window.pianoSample?.(note,1,480,.9)}
  function renderLesson(){
    const item=track()[lessonState.index],idea=lessonIdeas[item.title]||lessonIdeas['Do teclado à pauta'],phase=lessonState.phase;
    lessonEl('lessonTitle').textContent=item.title;lessonEl('lessonProgress').textContent=`AULA ${lessonState.index+1} · ${phase+1} DE 3`;
    lessonView.querySelectorAll('.lesson-bar i').forEach((el,i)=>el.classList.toggle('active',i<=phase));
    lessonEl('lessonKicker').textContent=['DESCOBRE','AGORA TU','TOCA A SÉRIO'][phase];
    lessonEl('lessonHeading').textContent=[item.title,idea[1],'Leva isto ao piano'][phase];
    lessonEl('lessonBody').textContent=[idea[0],'Escolhe uma resposta para avançar.',idea[5]][phase];
    lessonEl('lessonFeedback').textContent='';lessonEl('lessonChoices').replaceChildren();
    lessonEl('lessonVisual').hidden=phase===1;
    const keys=lessonView.querySelector('.lesson-keys');keys.replaceChildren();
    if(phase!==1){['C4','D4','E4','F4','G4'].forEach(note=>{const key=document.createElement('button');key.type='button';key.className=`lesson-key ${['C','D','F'].includes(note[0])?'black-after':''}`;key.textContent={C:'Dó',D:'Ré',E:'Mi',F:'Fá',G:'Sol'}[note[0]];key.setAttribute('aria-label',`Tocar ${key.textContent}`);key.addEventListener('click',()=>{sound(note);key.classList.add('playing');setTimeout(()=>key.classList.remove('playing'),450);lessonEl('lessonNext').disabled=false});keys.append(key)})}
    if(phase===1)idea[2].forEach((label,i)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>{if(lessonState.answered)return;if(i===idea[3]){lessonState.answered=true;button.classList.add('correct');lessonEl('lessonFeedback').textContent='Isso mesmo! Agora vamos aplicar.';lessonEl('lessonNext').disabled=false}else{button.classList.add('incorrect');lessonEl('lessonFeedback').textContent='Experimenta outra opção.'}});lessonEl('lessonChoices').append(button)});
    lessonEl('lessonNext').textContent=phase===2?'Ir para a prática →':'Continuar →';lessonEl('lessonNext').disabled=phase===1||phase===0;
  }
  function openLesson(index){activeIndex=-1;lessonState.index=index;lessonState.phase=0;lessonState.answered=false;document.querySelectorAll('.view').forEach(el=>el.classList.remove('active'));lessonView.classList.add('active');renderLesson()}
  lessonEl('lessonListen').addEventListener('click',()=>{sound((lessonIdeas[track()[lessonState.index].title]||lessonIdeas['Do teclado à pauta'])[4]);lessonEl('lessonNext').disabled=false});
  lessonEl('lessonBack').addEventListener('click',show);
  lessonEl('lessonNext').addEventListener('click',()=>{if(lessonState.phase<2){lessonState.phase++;lessonState.answered=false;renderLesson()}else launchPractice(lessonState.index)});
  const coach=document.createElement('div');coach.className='course-coach';coach.hidden=true;
  coach.innerHTML='<span><small>PRÁTICA DA AULA</small><strong id="courseCoachHint"></strong></span><button type="button" id="courseCoachDone" disabled>Concluir prática ✓</button>';
  document.body.append(coach);
  const coachDone=lessonEl('courseCoachDone');coachDone.addEventListener('click',complete);
  document.addEventListener('click',event=>{
    if(activeIndex<0||!document.body.classList.contains('course-in-activity')||event.target.closest('.course-coach,#experienceMenu'))return;
    const item=track()[activeIndex];if(item.kind==='exercise')return;
    if(event.target.closest('button,[role="button"],.activity-piano-key,.piano-white,.piano-black'))coachDone.disabled=false;
  });
  function track(){
    const list=tracks[profile.age].map(item=>({...item}));
    if(profile.goal==='reading'){
      const slot=list.findIndex((item,i)=>i>0&&['link','game'].includes(item.kind));
      const fallback=slot<0?list.findIndex((item,i)=>i>0&&item.kind==='button'):slot;
      if(fallback>=0)list[fallback]={title:'Leitura contínua',hint:'Segue as notas na pauta sem parar.',kind:'button',selector:'#readingView .reading-flow-entry'};
    }
    return list;
  }
  const startingPoint=()=>profile.experience==='some'?2:0;
  function load(){try{const value=JSON.parse(localStorage.getItem(KEY)||'null');if(value&&ageNames[value.age])return {...value,done:Array.isArray(value.done)?value.done:[]}}catch{}return null}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(profile))}catch{}}
  function current(){const list=track(),index=list.findIndex((_,i)=>i>=startingPoint()&&!profile.done.includes(i));return index<0?list.length-1:index}
  function show(){
    document.querySelectorAll('.view').forEach(item=>item.classList.remove('active'));
    view.classList.add('active');lessonView.classList.remove('active');document.body.classList.remove('course-in-activity');activeIndex=-1;coach.hidden=true;
    if(!profile){onboard(0);return}
    modal.classList.add('hidden');render();
  }
  function onboard(index){
    step=index;modal.classList.remove('hidden');
    const prompts=[['Qual é a tua idade?','Escolhe uma faixa. As atividades mudam contigo.',Object.entries(ageNames)],['Já tocaste piano?','Vamos ajustar o ponto de partida.',[['new','Estou a começar'],['some','Já conheço algumas notas']]],['O que queres explorar primeiro?','Podes mudar de caminho a qualquer momento.',[['piano','Tocar piano'],['reading','Ler partituras'],['both','Os dois']]]];
    const [title,hint,choices]=prompts[index];document.getElementById('onboardingTitle').textContent=title;document.getElementById('onboardingPrompt').textContent=hint;
    modal.querySelectorAll('.onboarding-progress i').forEach((el,i)=>el.classList.toggle('active',i<=index));
    document.getElementById('onboardingBack').hidden=index===0;
    const options=document.getElementById('onboardingOptions');options.replaceChildren();
    choices.forEach(([value,label])=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>{
      answers[['age','experience','goal'][index]]=value;
      if(index<2){onboard(index+1);return}
      profile={...answers,done:profile?.age===answers.age?profile.done:[],createdAt:profile?.createdAt||Date.now()};save();modal.classList.add('hidden');render();
    });options.append(button)});
  }
  function render(){
    if(!profile)return;
    const list=track(),next=current(),count=profile.done.filter(i=>i>=startingPoint()).length,total=list.length-startingPoint();
    const name=profile.age==='18+'?'A tua trilha':`Trilha · ${ageNames[profile.age]}`;
    document.getElementById('courseGreeting').textContent=name;
    document.getElementById('coursePoints').textContent=String(profile.done.length*10);
    document.getElementById('courseLevel').textContent=next<introCount?'INTRODUÇÃO · 1º NÍVEL':'BÁSICO · 2º NÍVEL';
    document.getElementById('courseCurrentTitle').textContent=count===total?'Trilha concluída!':list[next].title;
    document.getElementById('courseCurrentHint').textContent=count===total?'Podes repetir qualquer etapa ou explorar livremente.':list[next].hint;
    document.getElementById('courseContinue').textContent=count===total?'Repetir ↗':'Continuar →';
    document.getElementById('courseProgressText').textContent=`${count} de ${total} etapas · ${Math.round(count/total*100)}%`;
    const map=document.getElementById('courseMap');map.replaceChildren();
    list.forEach((item,i)=>{
      if(i===introCount){const divide=document.createElement('div');divide.className='course-divider';divide.innerHTML='<span>BÁSICO</span><small>Um passo de cada vez</small>';map.append(divide)}
      const done=profile.done.includes(i),available=done||i===next||i<startingPoint();
      const button=document.createElement('button');button.type='button';button.className=`course-node ${done?'done':available?'current':'locked'} ${i%2?'offset':''}`;
      button.disabled=!available;button.setAttribute('aria-label',`${item.title} · ${done?'concluída':available?'disponível':'por desbloquear'}`);
      button.innerHTML=`<span class="course-ring"><span>${done?'✓':i+1}</span></span><span class="course-node-copy"><strong></strong><small></small></span>`;
      button.querySelector('strong').textContent=item.title;button.querySelector('small').textContent=item.hint;
      button.addEventListener('click',()=>launch(i));map.append(button);
    });
  }
  function launch(index){openLesson(index)}
  function launchPractice(index){
    const item=track()[index];activeIndex=index;
    if(item.kind==='link'){
      const url=new URL(item.href,location.href);url.searchParams.set('course',String(index));
      location.assign(url);return;
    }
    document.body.classList.add('course-in-activity');lessonView.classList.remove('active');view.classList.remove('active');
    const selector=item.kind==='exercise'?`#readingView [data-ex="${item.index}"]`:item.kind==='song'?`#readingView [data-song="${item.id}"][data-version="${item.version||'right'}"]`:item.selector;
    if(item.kind==='exercise')document.querySelector(`#readingView [data-hand="${item.hand||'right'}"]`)?.click();
    const target=document.querySelector(selector);
    if(!target){document.body.classList.remove('course-in-activity');show();return}
    launching=true;try{target.click()}finally{launching=false}
    coach.hidden=false;coachDone.disabled=true;
    lessonEl('courseCoachHint').textContent=(lessonIdeas[item.title]||lessonIdeas['Do teclado à pauta'])[5];
    if(item.kind==='exercise')coachDone.hidden=true;else coachDone.hidden=false;
    document.getElementById('experienceMenuButton')?.setAttribute('aria-label','Abrir menu e concluir etapa');
  }
  function complete(){
    if(activeIndex<0||!profile)return;
    const play=document.getElementById('playBtn');if(play?.textContent.includes('Parar'))play.click();
    if(!profile.done.includes(activeIndex))profile.done.push(activeIndex);
    save();show();
  }
  const home=document.getElementById('homeStart');
  const homeLabel=document.getElementById('homeStartLabel');
  if(homeLabel){const label=()=>{if(document.body.dataset.mode==='aprenda'&&homeLabel.textContent!=='Minha trilha')homeLabel.textContent='Minha trilha'};new MutationObserver(label).observe(homeLabel,{childList:true});setTimeout(label,0)}
  home?.addEventListener('click',event=>{if(document.body.dataset.mode!=='aprenda')return;event.preventDefault();event.stopImmediatePropagation();show()},true);
  document.querySelector('[data-menu-course]')?.addEventListener('click',()=>{document.querySelector('#experienceMenu .experience-menu-close')?.click();show()});
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-nav],[data-experience-nav],[data-menu-catalog]')){
      if(view.classList.contains('active'))view.classList.remove('active');
      if(!launching&&document.body.classList.contains('course-in-activity')){activeIndex=-1;coach.hidden=true;document.body.classList.remove('course-in-activity')}
    }
  },true);
  document.getElementById('courseBack')?.addEventListener('click',()=>document.querySelector('[data-nav="home"]')?.click());
  document.getElementById('courseContinue')?.addEventListener('click',()=>launch(current()));
  document.getElementById('courseExplore')?.addEventListener('click',()=>document.querySelector('#readingView .journey-stage')&&document.querySelector('[data-nav="reading"]')?.click());
  const settings=document.createElement('button');settings.type='button';settings.textContent='Ajustar trilha';settings.addEventListener('click',()=>{answers={age:profile?.age,experience:profile?.experience,goal:profile?.goal};onboard(0)});
  document.querySelector('.course-footer')?.append(settings);
  document.getElementById('onboardingBack')?.addEventListener('click',()=>onboard(Math.max(0,step-1)));
  const taskMenu=document.querySelector('.experience-menu-context-actions');
  const finish=document.createElement('button');finish.type='button';finish.id='courseFinish';finish.innerHTML='<span>✓</span><b>Terminei a prática</b>';finish.hidden=true;finish.addEventListener('click',()=>{document.querySelector('#experienceMenu .experience-menu-close')?.click();complete()});taskMenu?.prepend(finish);
  new MutationObserver(()=>{
    finish.hidden=activeIndex<0||track()[activeIndex]?.kind==='exercise'||!document.body.classList.contains('course-in-activity');
    const ex=document.getElementById('exerciseView');
    if(activeIndex>=0&&ex?.classList.contains('active')&&ex.dataset.exerciseAttempt==='done'){
      const item=track()[activeIndex];if(item.kind==='exercise')complete();
    }
  }).observe(document.body,{attributes:true,subtree:true,attributeFilter:['class','data-exercise-attempt']});
  window.LuwipiLearningPath=Object.freeze({show,complete,profile:()=>profile});
  profile=load();
  const courseDone=new URLSearchParams(location.search).get('courseDone');
  if(profile&&courseDone!==null&&/^\d+$/.test(courseDone)){const index=Number(courseDone);if(index<tracks[profile.age].length&&!profile.done.includes(index)){profile.done.push(index);save()}history.replaceState({},'',location.pathname);setTimeout(show,250)}
  const parent=new URLSearchParams(location.search).get('parent')==='1';
  let welcomed=false;
  function welcome(){if(welcomed||parent||profile||document.body.dataset.mode!=='aprenda'||!document.getElementById('accessOverlay')?.classList.contains('hidden'))return;welcomed=true;show()}
  window.addEventListener('luwipi:access-ready',()=>setTimeout(welcome,120));
  const access=document.getElementById('accessOverlay');if(access)new MutationObserver(welcome).observe(access,{attributes:true,attributeFilter:['class']});
  setTimeout(welcome,1500);
})();
