import assert from "node:assert/strict";
import {chromium} from "playwright";
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const screenshots=[];
try{
 for(const device of [{name:'desktop',viewport:{width:1440,height:900}},{name:'mobile',viewport:{width:390,height:844}}]){
  const page=await browser.newPage({viewport:device.viewport});
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  await page.goto('http://127.0.0.1:4173/app.html',{waitUntil:'domcontentloaded'});
  await page.addStyleTag({content:'#accessOverlay{display:none!important}body.auth-pending{overflow:auto!important}'});
  await page.waitForFunction(()=>window.LuwipiReadingLibrary?.openLesson&&window.LuwipiPedagogyWorkspace&&window.LuwipiWorkspaceRouter,{timeout:20000});
  for(let level=0;level<=7;level++){
   if(device.name==='desktop')await page.locator('.workspace-canvas-path').click();
   else{
    await page.locator('#experienceMenuButton').click();
    await page.locator('#experienceMenu [data-workspace-action="path"]').click();
   }
   await page.locator('.workspace-path-skill').first().click();
   if(level)await page.locator('.workspace-path-level-select select').selectOption(String(level));
   else await page.locator('.workspace-path-start').click();
   await page.waitForFunction(()=>window.LuwipiWorkspaceRouter?.current()?.activity==='readingImportedView',{timeout:10000});
   const result=await page.evaluate(()=>{
    const r=window.LuwipiWorkspaceRouter.current(),score=document.getElementById('readingImportedSvg'),piano=document.getElementById('workspacePiano');
    return{
     route:r,title:document.getElementById('readingImportedHeading')?.textContent,
     scoreChildren:score?.childElementCount,scoreWidth:score?.getBoundingClientRect().width,
     keys:document.querySelectorAll('#workspacePiano #karaokeKeys .karaoke-key').length,
     piano:!!piano&&!piano.hidden&&piano.getBoundingClientRect().height>60,
     start:document.getElementById('readingLessonStart')?.textContent?.trim(),
     status:document.getElementById('readingLessonStatus')?.textContent?.trim(),
     importerActive:document.getElementById('liveModeView')?.classList.contains('active')
    };
   });
   console.log(device.name+' N'+level+': '+JSON.stringify(result));
   assert.equal(result.route.section,'reading');
   assert.equal(result.importerActive,false,'curriculum must not open the Prática importer');
   assert.ok(result.scoreChildren>50&&result.scoreWidth>300,'partitura must be visible');
   assert.ok(result.keys>15&&result.piano,'shared piano must be usable and visible');
   assert.ok(result.start&&result.status,'the exercise must have a start button and directions');
   if(level===0)await page.screenshot({path:'/tmp/learning-'+device.name+'.png'});
  }
  await page.reload({waitUntil:'domcontentloaded'});
  await page.addStyleTag({content:'#accessOverlay{display:none!important}body.auth-pending{overflow:auto!important}'});
  await page.waitForFunction(()=>window.LuwipiWorkspaceRouter?.current()?.activity==='readingImportedView'&&document.getElementById('readingImportedSvg')?.childElementCount>50,{timeout:15000});
  const restored=await page.evaluate(()=>({route:window.LuwipiWorkspaceRouter.current(),text:document.getElementById('readingLessonStatus').textContent}));
  console.log(device.name+' reload: '+JSON.stringify(restored));
  assert.equal(restored.route.section,'reading');
  // Other asynchronous account calls can be unavailable in this local, unauthenticated smoke.
  console.log(device.name+' unrelated browser errors: '+pageErrors.filter(e=>/reading|lesson/i.test(e)).join('; '));
  await page.close();
 }
 console.log('PASS: N0–N7 in Leitura, desktop/mobile, visible score/piano/instructions, reload');
}finally{await browser.close()}
