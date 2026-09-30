(()=>{
  const toolbar=document.querySelector('#songView .song-score-toolbar');
  const transport=document.querySelector('#songView .transport');
  if(toolbar&&transport)toolbar.append(transport);
  document.getElementById('songShareQuick')?.addEventListener('click',()=>document.getElementById('shareSongBtn')?.click());
  const panel=document.querySelector('#experienceMenu .experience-menu-panel');
  if(!panel)return;
  const actions=document.createElement('div');actions.className='experience-score-actions';actions.setAttribute('aria-label','Opções da atividade');
  panel.querySelector('.experience-menu-context-actions')?.before(actions);
  const options={songView:[['▶ Ouvir ou parar','#playBtn'],['▤ Partitura inteira / deslizar','#songScoreMode'],['◉ Metrónomo','#metroBtn'],['− Andamento','#tempoDown'],['+ Andamento','#tempoUp'],['⛶ Ecrã inteiro','#readingImmersive'],['🎹 Mostrar ou esconder piano','#songPianoToggle'],['Notas','[data-song-aid="normal"]'],['Cores','[data-song-aid="colors"]'],['Personagens','[data-song-aid="characters"]'],['Nomes','[data-song-aid="names"]']],exerciseView:[['▶ Tentar no piano','#exercisePracticeStart'],['← Exercício anterior','#exPrev'],['→ Próximo exercício','#exNext']]};
  function render(){
    actions.replaceChildren();
    const id=document.querySelector('.view.active')?.id;
    for(const [label,selector] of options[id]||[]){
      const button=document.createElement('button');button.type='button';button.textContent=label;
      button.addEventListener('click',()=>{document.querySelector('#experienceMenu .experience-menu-close')?.click();document.querySelector(selector)?.click()});actions.append(button)
    }
    actions.hidden=!actions.childElementCount;
  }
  document.getElementById('experienceMenuButton')?.addEventListener('click',()=>setTimeout(render,0));
})();
