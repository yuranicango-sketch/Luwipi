import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
const issues=[];
async function inspect(page,label){
 return page.evaluate(label=>({
  label,route:window.LuwipiWorkspaceRouter?.current(),
  active:[...document.querySelectorAll('.workspace-canvas-viewport>.view.active')].map(x=>x.id),
  title:document.querySelector('#liveStageTitle')?.textContent,
  emptyVisible:!!document.querySelector('#liveScoreEmpty')&&!document.querySelector('#liveScoreEmpty').classList.contains('hidden'),
  svgChildren:document.querySelector('#liveScoreSvg')?.childElementCount||0,
  svgSize:document.querySelector('#liveScoreSvg')?.getBoundingClientRect().toJSON(),
  lesson:document.querySelector('#workspacePathPanel')?.textContent?.slice(0,220),
  visibleAction:[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length&&!x.disabled).map(x=>x.textContent.trim()).filter(Boolean).slice(-12),
  pianoVisible:!!document.querySelector('#workspacePiano')&&document.querySelector('#workspacePiano').getClientRects().length>0,
  score:window.LuwipiLiveTaskSource?.score()?.score?.events?.length||0
 }),label);
}
try{
 for(const device of [{name:'desktop',viewport:{width:1440,height:900}},{name:'mobile',viewport:{width:390,height:844}}]){
  const page=await browser.newPage({viewport:device.viewport});
  page.on('pageerror',e=>issues.push(device.name+': '+e.message));
  await page.goto('http://localhost:4173/app.html',{waitUntil:'domcontentloaded'});
  await page.addStyleTag({content:'#accessOverlay{display:none!important} body.auth-pending{overflow:auto!important}'});
  await page.waitForFunction(()=>window.LuwipiPedagogyWorkspace&&window.LuwipiLiveLoadPedagogy&&window.LuwipiWorkspaceRouter,{timeout:15000});
  // The browser exercise tests client-side pedagogy only, never bypasses a production account.
  for(let level=0;level<=7;level++){
   if(device.name==='desktop')await page.locator('.workspace-canvas-path').click();
   else {
    await page.locator('#experienceMenuButton').click();
    await page.locator('.experience-menu-nav [data-workspace-action="path"]').click();
   }
   await page.locator('.workspace-path-skill').first().click();
   if(level)await page.locator('.workspace-path-level-select select').selectOption(String(level));
   await page.locator('.workspace-path-start').click();
   const result=await inspect(page,device.name+' N'+level);
   console.log(JSON.stringify(result));
   assert.equal(result.route?.section,'practice',device.name+' N'+level+' must enter a playable lesson');
   assert.ok(result.score>0&&result.svgChildren>0&&!result.emptyVisible,device.name+' N'+level+' must have an actual score');
   assert.ok(result.pianoVisible,device.name+' N'+level+' must show piano');
  }
  await page.reload({waitUntil:'domcontentloaded'});
  await page.addStyleTag({content:'#accessOverlay{display:none!important} body.auth-pending{overflow:auto!important}'});
  await page.waitForFunction(()=>window.LuwipiLiveLoadPedagogy&&window.LuwipiWorkspaceRouter,{timeout:15000});
  await page.waitForTimeout(450);
  const recovered=await inspect(page,device.name+' reload');
  console.log(JSON.stringify(recovered));
  assert.ok(recovered.score>0&&recovered.svgChildren>0,device.name+' reload lost lesson');
  await page.screenshot({path:'/tmp/luwipi-'+device.name+'.png',fullPage:true});
  await page.close();
 }
 assert.equal(issues.length,0,'Uncaught browser errors: '+issues.join('; '));
 console.log('Browser test passed: N0–N7 desktop/mobile, level score/piano and refresh.');
}finally{await browser.close();}
