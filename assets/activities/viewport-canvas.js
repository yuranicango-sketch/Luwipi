(()=>{
  'use strict';
  const shell=document.getElementById('experienceMenu'),panel=shell?.querySelector('.experience-menu-panel');
  const catalog=document.getElementById('experienceCatalog'),filters=document.getElementById('experienceCatalogFilters'),items=document.getElementById('experienceCatalogItems'),title=document.getElementById('experienceCatalogTitle');
  if(!shell||!panel||!catalog)return;
  let category='reading';
  const close=()=>shell.querySelector('.experience-menu-close')?.click();
  const add=(host,label,action,meta='')=>{
    const button=document.createElement('button');button.type='button';button.className='experience-catalog-item';
    const name=document.createElement('strong');name.textContent=label;button.append(name);
    if(meta){const small=document.createElement('small');small.textContent=meta;button.append(small)}
    button.addEventListener('click',action);host.append(button);return button;
  };
  const launch=original=>{close();original?.click()};
  function reading(){
    title.textContent='Atividades e músicas';
    const hand=document.querySelector('#readingView [data-hand].active')?.dataset.hand||'right';
    const level=document.querySelector('#readingView [data-reading-level].active')?.dataset.readingLevel||'sounds';
    const handRow=document.createElement('div');handRow.className='experience-catalog-filters';filters.append(handRow);
    for(const [key,label] of [['right','Clave de Sol'],['left','Clave de Fá']]){
      const b=add(handRow,label,()=>{document.querySelector(`#readingView [data-hand="${key}"]`)?.click();render()});b.classList.toggle('selected',hand===key);
    }
    const levelRow=document.createElement('div');levelRow.className='experience-catalog-filters';filters.append(levelRow);
    for(const [key,label] of [['sounds','Primeiros sons'],['phrases','Frases'],['fluency','Leitura ágil']]){
      const b=add(levelRow,label,()=>{document.querySelector(`#readingView [data-reading-level="${key}"]`)?.click();render()});b.classList.toggle('selected',level===key);
    }
    add(items,'Próximo exercício',()=>{close();document.querySelector('#readingView [data-journey-start]')?.click()},'Continuar a jornada');
    add(items,'Leitura contínua',()=>launch(document.querySelector('#readingView .reading-flow-entry')),'Ler notas sem parar');
    const heading=document.createElement('h4');heading.textContent='Exercícios';items.append(heading);
    document.querySelectorAll('#exerciseList .exercise-row').forEach(row=>{
      const target=row.querySelector('[data-ex]');if(target)add(items,row.querySelector('h3')?.textContent||'Exercício',()=>launch(target),row.querySelector('p')?.textContent||'');
    });
    document.querySelectorAll('#importedExerciseList .exercise-row').forEach(row=>{
      const b=row.querySelector('button');if(b)add(items,row.querySelector('strong')?.textContent?.trim()||'Exercício',()=>launch(b),'Da Prática');
    });
    const songs=document.createElement('h4');songs.textContent='Músicas';items.append(songs);
    document.querySelectorAll('#readingView .song-card').forEach(card=>{
      const name=card.querySelector('h3')?.textContent?.trim();if(!name)return;
      card.querySelectorAll('[data-song]').forEach(b=>add(items,name,()=>launch(b),b.textContent.trim()));
    });
    document.querySelectorAll('#importedReadingList .song-card').forEach(card=>{
      const b=card.querySelector('button');if(b)add(items,card.querySelector('h3')?.textContent?.trim()||'Música',()=>launch(b),'Da Prática');
    });
  }
  function games(){
    title.textContent='Todos os jogos';
    document.querySelectorAll('#gamesView #gamesPathGrid .game-card,#gamesView .games-library .tiny-card,#gamesView .games-library .game-card').forEach(card=>{
      const label=card.querySelector('strong')?.textContent?.trim();if(label)add(items,label,()=>launch(card),card.querySelector('span')?.textContent?.trim()||'');
    });
  }
  function rhythm(){
    title.textContent='Atividades de ritmo';
    document.querySelectorAll('#rhythmView .rhythm-menu-card,#rhythmView .rhythm-song-card').forEach(card=>{
      const label=card.querySelector('strong')?.textContent?.trim()||card.textContent.trim();
      add(items,label,()=>launch(card),card.querySelector('span')?.textContent?.trim()||'');
    });
  }
  function render(){filters.replaceChildren();items.replaceChildren();({reading,games,rhythm})[category]?.()}
  function show(key){category=key;panel.classList.add('catalog-open');catalog.classList.remove('hidden');render();catalog.querySelector('.experience-catalog-back')?.focus()}
  function back(){panel.classList.remove('catalog-open');catalog.classList.add('hidden')}
  panel.querySelectorAll('[data-menu-catalog]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.menuCatalog)));
  catalog.querySelector('.experience-catalog-back')?.addEventListener('click',back);
  const observer=new MutationObserver(()=>{if(shell.classList.contains('hidden'))back()});observer.observe(shell,{attributes:true,attributeFilter:['class']});
})();
