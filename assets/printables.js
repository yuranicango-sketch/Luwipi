(()=>{
'use strict';
const $=id=>document.getElementById(id),form=$('printableUploadForm'),status=$('printableStatus'),list=$('printablesList');
const client=()=>LuwipiProductionAccess.getClient(),admin=()=>LuwipiProductionAccess.getProfile()?.role==='admin';
function check(result){if(result.error)throw result.error;return result.data}
async function load(){
 list.replaceChildren();form.hidden=!admin();const api=client();if(!api){status.textContent='Entra na tua conta para ver os imprimíveis.';return}
 status.textContent='A carregar…';
 try{const rows=check(await api.from('printables').select('*').order('created_at',{ascending:false}));
 status.textContent=rows.length?'':'Ainda não há imprimíveis publicados.';
 for(const row of rows){const card=document.createElement('article');card.className='song-card';const content=document.createElement('div'),title=document.createElement('h3'),description=document.createElement('p');title.textContent=row.title;description.textContent=row.description;content.append(title,description);card.append(content);const files=document.createElement('div');files.className='printable-files';
 for(const file of row.files){for(const action of file.type==='application/pdf'?['Abrir','Descarregar']:['Descarregar']){const btn=document.createElement('button');btn.type='button';btn.textContent=action+' · '+file.name;btn.onclick=async()=>{const popup=window.open('about:blank','_blank');if(popup)popup.opener=null;btn.disabled=true;try{const result=check(await api.storage.from('printables').createSignedUrl(file.path,120,action==='Descarregar'?{download:file.name}:{}));if(popup)popup.location.href=result.signedUrl;else location.href=result.signedUrl}catch(error){popup?.close();status.textContent='Não foi possível abrir o ficheiro: '+error.message}finally{btn.disabled=false}};files.append(btn)}}
 card.append(files);
 if(admin()){const remove=document.createElement('button');remove.textContent='Remover';remove.onclick=async()=>{remove.disabled=true;try{check(await api.from('printables').delete().eq('id',row.id));const result=await api.storage.from('printables').remove(row.files.map(f=>f.path));await load();if(result.error)status.textContent='Material removido. Não foi possível limpar todos os ficheiros guardados.'}catch(error){status.textContent='Não foi possível remover: '+error.message;remove.disabled=false}};card.append(remove)}list.append(card)}
 }catch(error){status.textContent='Não foi possível carregar os imprimíveis. Tenta novamente.';const retry=document.createElement('button');retry.textContent='Tentar novamente';retry.onclick=load;list.append(retry)}
}
form.onsubmit=async event=>{
 event.preventDefault();if(!admin()||!client())return;const button=form.querySelector('button');button.disabled=true;const api=client(),uploaded=[];
 try{const selected=[...$('printableFiles').files];if(!selected.length||selected.length>20)throw Error('Escolhe entre 1 e 20 ficheiros.');
 const checked=[];
 for(const file of selected){const zip=/\.zip$/i.test(file.name),pdf=/\.pdf$/i.test(file.name);if(!zip&&!pdf)throw Error('Usa ficheiros PDF ou ZIP.');if(file.size>30*1024*1024)throw Error('Cada ficheiro deve ter até 30 MB.');const sig=new Uint8Array(await file.slice(0,5).arrayBuffer());if(pdf&&new TextDecoder().decode(sig)!=='%PDF-')throw Error('O ficheiro não é um PDF válido.');if(zip&&!(sig[0]===80&&sig[1]===75&&[3,5,7].includes(sig[2])))throw Error('O ficheiro não é um ZIP válido.');checked.push({file,type:pdf?'application/pdf':'application/zip',extension:pdf?'pdf':'zip'})}
 status.textContent='A enviar os ficheiros…';const packageId=crypto.randomUUID(),files=[];
 for(const [i,item] of checked.entries()){const path=packageId+'/'+i+'.'+item.extension;check(await api.storage.from('printables').upload(path,item.file,{contentType:item.type,upsert:false}));uploaded.push(path);files.push({name:item.file.name,path,size:item.file.size,type:item.type})}
 const user=check(await api.auth.getUser()).user;
 check(await api.from('printables').insert({title:$('printableTitle').value.trim(),description:$('printableDescription').value.trim(),files,created_by:user.id}));form.reset();await load();status.textContent='Imprimível publicado.';
 }catch(error){if(uploaded.length)await api.storage.from('printables').remove(uploaded);status.textContent='Não foi possível publicar: '+error.message}finally{button.disabled=false}
};
window.addEventListener('luwipi:access-ready',load);window.addEventListener('luwipi:access-signed-out',()=>{form.hidden=true;list.replaceChildren();status.textContent='Entra na tua conta para ver os imprimíveis.'});document.addEventListener('luwipi:navigate',e=>{if(e.detail.name==='printables')void load()});
})();
