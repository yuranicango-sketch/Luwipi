import assert from "node:assert/strict";
import {chromium} from "playwright";
const browser=await chromium.launch({channel:"chrome",headless:true,args:["--no-sandbox"]});
try{
 for(const device of [{name:"desktop",viewport:{width:1440,height:900}},{name:"mobile",viewport:{width:390,height:844}}]){
  const page=await browser.newPage({viewport:device.viewport});
  await page.goto("http://127.0.0.1:4173/app.html",{waitUntil:"domcontentloaded"});
  await page.addStyleTag({content:"#accessOverlay{display:none!important}body.auth-pending{overflow:auto!important}"});
  await page.waitForFunction(()=>window.LuwipiWorkspaceRouter&&window.LuwipiReadingLibrary?.openLesson,{timeout:15000});
  if(device.name==="desktop")await page.locator(".workspace-canvas-path").click();
  else{
   await page.locator("#experienceMenuButton").click();
   await page.locator('#experienceMenu [data-workspace-action="path"]').click();
  }
  await page.locator(".workspace-path-skill:visible").first().click();
  await page.locator(".workspace-path-extras summary").click();
  await page.locator(".workspace-path-extras select").selectOption("2");
  await page.locator(".workspace-path-start").click();
  await page.waitForFunction(()=>window.LuwipiWorkspaceRouter.current()?.activity==="readingImportedView");
  const result=await page.evaluate(()=>{
   const saved=JSON.parse(sessionStorage.getItem("luwipi:reading:lesson:v1"));
   const score=saved.score,E=window.LuwipiScoreEngine,svg=document.getElementById("readingImportedSvg");
   const notes=[...svg.querySelectorAll("ellipse[data-live-group]")];
   const actualAudio=E.performanceEvents(score);
   return{title:score.title,measures:score.measures,notation:score.events.length,
    performance:actualAudio.length,duration:score.durationBeats,
    audioEnd:Math.max(...actualAudio.map(e=>e.startBeat+e.durationBeat)),
    beyond:actualAudio.filter(e=>e.startBeat>=score.durationBeats).length,
    svgNotes:notes.length,pianoVisible:document.getElementById("workspacePiano").getBoundingClientRect().height>60,
    playbackEnabled:!document.getElementById("readingImportedPlay").disabled,
    excerptLabel:document.getElementById("readingImportedHeading").textContent
   };
  });
  console.log(device.name+" "+JSON.stringify(result));
  assert.equal(result.measures,2,"Short pattern must be exactly two bars");
  assert.ok(result.title.includes("padrão de 2 compassos"));
  assert.equal(result.notation,result.svgNotes,"All written pattern notes must be visible in the SVG");
  assert.ok(result.notation>0&&result.performance>=result.notation);
  assert.equal(result.beyond,0,"Audio may never contain notes from later hidden measures");
  assert.ok(result.audioEnd<=result.duration+0.0001,"Playback must stop at the visible excerpt boundary");
  assert.ok(result.pianoVisible&&result.playbackEnabled);
  const played=await page.evaluate(async()=>{
   const E=window.LuwipiScoreEngine;
   const score=JSON.parse(sessionStorage.getItem("luwipi:reading:lesson:v1")).score;
   const expected=E.performanceEvents(score).length,events=[];
   window.LuwipiAudioBridge={play:(...args)=>{events.push(args)}};
   const orig=window.setTimeout;
   window.setTimeout=(cb,delay,...args)=>orig(cb,Math.min(10,Number(delay)||0),...args);
   try{document.getElementById("readingImportedPlay").click();}
   finally{window.setTimeout=orig;}
   await new Promise(resolve=>orig(resolve,180));
   return{expected,heard:events.length};
  });
  console.log(device.name+" playback "+JSON.stringify(played));
  assert.equal(played.heard,played.expected,"Real Play command must trigger precisely the visible pattern's audio events");
  await page.close();
 }
 console.log("PASS: short-pattern score, scheduled audio and piano match on desktop/mobile");
}finally{await browser.close()}
