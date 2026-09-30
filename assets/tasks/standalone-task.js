(()=>{
  const params=new URLSearchParams(location.search);
  const course=params.get('course');
  const controls=document.createElement('div');controls.className='luwipi-task-tools';
  controls.style.cssText='position:fixed;z-index:99;right:max(10px,env(safe-area-inset-right));top:max(9px,env(safe-area-inset-top));display:flex;gap:6px;max-width:calc(100vw - 20px)';
  if(course!==null&&/^\d+$/.test(course)){
    const done=document.createElement('button');done.type='button';done.textContent='✓ Concluir etapa';
    done.addEventListener('click',()=>location.assign('/aprenda/?courseDone='+course));controls.append(done);
  }
  if(params.get('parent')!=='1'){
    const share=document.createElement('button');share.type='button';share.textContent='↗ Tarefa';
    share.addEventListener('click',async()=>{
      const url=new URL(location.href);url.searchParams.delete('course');url.searchParams.set('parent','1');
      try{await navigator.clipboard.writeText(url.toString());share.textContent='Link copiado ✓'}catch{prompt('Copia o link da tarefa',url.toString())}
    });controls.append(share);
  }
  controls.querySelectorAll('button').forEach(b=>b.style.cssText='min-height:34px;padding:5px 10px;border:1px solid #aabce3;border-radius:10px;background:#eaf1ff;color:#17366d;font:800 11px system-ui;box-shadow:0 4px 12px #15284b25');
  document.body.append(controls);
})();
