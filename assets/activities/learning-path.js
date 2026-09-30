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
    view.classList.add('active');document.body.classList.remove('course-in-activity');activeIndex=-1;
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
  function launch(index){
    const item=track()[index];activeIndex=index;
    if(item.kind==='link'){
      const url=new URL(item.href,location.href);url.searchParams.set('course',String(index));
      location.assign(url);return;
    }
    document.body.classList.add('course-in-activity');view.classList.remove('active');
    const selector=item.kind==='exercise'?`#readingView [data-ex="${item.index}"]`:item.kind==='song'?`#readingView [data-song="${item.id}"][data-version="${item.version||'right'}"]`:item.selector;
    if(item.kind==='exercise')document.querySelector(`#readingView [data-hand="${item.hand||'right'}"]`)?.click();
    const target=document.querySelector(selector);
    if(!target){document.body.classList.remove('course-in-activity');show();return}
    launching=true;try{target.click()}finally{launching=false}
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
      if(!launching&&document.body.classList.contains('course-in-activity')){activeIndex=-1;document.body.classList.remove('course-in-activity')}
    }
  },true);
  document.getElementById('courseBack')?.addEventListener('click',()=>document.querySelector('[data-nav="home"]')?.click());
  document.getElementById('courseContinue')?.addEventListener('click',()=>launch(current()));
  document.getElementById('courseExplore')?.addEventListener('click',()=>document.querySelector('#readingView .journey-stage')&&document.querySelector('[data-nav="reading"]')?.click());
  const settings=document.createElement('button');settings.type='button';settings.textContent='Ajustar trilha';settings.addEventListener('click',()=>{answers={age:profile?.age,experience:profile?.experience,goal:profile?.goal};onboard(0)});
  document.querySelector('.course-footer')?.append(settings);
  document.getElementById('onboardingBack')?.addEventListener('click',()=>onboard(Math.max(0,step-1)));
  const taskMenu=document.querySelector('.experience-menu-context-actions');
  const finish=document.createElement('button');finish.type='button';finish.id='courseFinish';finish.innerHTML='<span>✓</span><b>Concluir etapa e continuar</b>';finish.hidden=true;finish.addEventListener('click',()=>{document.querySelector('#experienceMenu .experience-menu-close')?.click();complete()});taskMenu?.prepend(finish);
  new MutationObserver(()=>{
    finish.hidden=activeIndex<0||!document.body.classList.contains('course-in-activity');
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
