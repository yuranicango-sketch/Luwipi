import assert from "node:assert/strict";
import {chromium} from "playwright";

// Real desktop/mobile rendering: deliberately include multiple ledger notes
// above and below both hands, across adjacent systems.
const browser=await chromium.launch({channel:"chrome",headless:true,args:["--no-sandbox"]});
try{
 for(const device of [{name:"desktop",viewport:{width:1440,height:900}},{name:"mobile",viewport:{width:390,height:844}}]){
  const page=await browser.newPage({viewport:device.viewport});
  await page.goto("http://127.0.0.1:4173/app.html",{waitUntil:"domcontentloaded"});
  await page.addStyleTag({content:"#accessOverlay{display:none!important}body.auth-pending{overflow:auto!important}"});
  await page.waitForFunction(()=>window.LuwipiScoreEngine&&window.LuwipiReadingLibrary?.openLesson,{timeout:15000});
  if(device.name==="desktop")await page.locator(".workspace-canvas-path").click();
  else{
   await page.locator("#experienceMenuButton").click();
   await page.locator('#experienceMenu [data-workspace-action="path"]').click();
  }
  await page.locator(".workspace-path-skill:visible").first().click();
  await page.locator(".workspace-path-start").click();
  await page.waitForFunction(()=>window.LuwipiWorkspaceRouter?.current()?.activity==="readingImportedView");
  const result=await page.evaluate(()=>{
   const E=window.LuwipiScoreEngine;
   const saved=JSON.parse(sessionStorage.getItem("luwipi:reading:lesson:v1"));
   if(!saved?.score?.events?.length)throw Error("The real curriculum did not generate a score");
   const original=saved.score,source=original.events[0];
   const notes=[
    ["RH","treble","C7",96,0],["LH","bass","C1",24,1],
    ["RH","treble","C3",48,2],["LH","bass","C5",72,3],
    ["RH","treble","C7",96,4],["LH","bass","C1",24,5],
    ["RH","treble","C3",48,6],["LH","bass","C5",72,7]
   ];
   const score=E.normalizeScore({...original,title:"Linhas suplementares — teste",
    meter:[4,4],meterMap:[],tempoMap:[],keyMap:[],clefMap:[],octaveMarks:[],durationBeats:8,
    staffLayout:[{id:"RH",clef:"treble"},{id:"LH",clef:"bass"}],
    rests:[],notationLegend:[],
    events:notes.map(([voice,clef,note,midi,startBeat],i)=>({
     ...source,id:voice+"-ledger-"+i,clef,note,midi,startBeat,durationBeat:1,
     ornament:null,articulations:[],pedal:false,voiceDirection:null,dynamic:""
    }))
   });
   const wrap=document.querySelector("#readingImportedView .reading-imported-score-wrap");
   const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
   svg.id="ledgerVisualTest";svg.setAttribute("aria-label","Teste de linhas suplementares");wrap.append(svg);
   E.render(svg,score);
   const height=svg.viewBox.baseVal.height;
   const ledgers=[...svg.querySelectorAll('line[stroke="#555a63"]')].map(l=>Number(l.getAttribute("y1")));
   const heads=[...svg.querySelectorAll('ellipse[data-live-group]')].sort((a,b)=>
    Number(a.getAttribute("data-live-group"))-Number(b.getAttribute("data-live-group"))
   ).map(el=>({x:+el.getAttribute("cx"),y:+el.getAttribute("cy")}));
   const staves=[...svg.querySelectorAll('line[stroke="#777c85"]')].filter((_,i)=>i%5===0)
    .map(l=>Number(l.getAttribute("y1")));
   const wrapBox=wrap.getBoundingClientRect(),svgBox=svg.getBoundingClientRect();
   return{
    height,ledgerCount:ledgers.length,heads,staves,
    ledgerWithinCanvas:ledgers.every(y=>y>=12&&y<=height-12),
    headsWithinCanvas:heads.every(p=>p.y>=12&&p.y<=height-12),
    neighboringStavesSeparated:heads[2].y+14<heads[3].y-14&&heads[1].y+14<heads[4].y-14,
    naturalScroll:wrap.scrollHeight>=wrap.clientHeight&&getComputedStyle(wrap).overflowY==="auto",
    svgRatio:Math.round(svgBox.width),
    viewportVisible:wrapBox.width>250&&wrapBox.height>50
   };
  });
  console.log(device.name+" "+JSON.stringify(result));
  assert.ok(result.ledgerCount>=24,"Expected plenty of actual high and low ledger lines");
  assert.equal(result.heads.length,8,"Expected all 8 noteheads to be drawn");
  assert.equal(result.staves.length,4,"Expected two hands on each of 2 systems");
  assert.equal(result.ledgerWithinCanvas,true,"Ledger lines cropped outside the SVG viewBox");
  assert.equal(result.headsWithinCanvas,true,"High or low notes cropped outside the SVG viewBox");
  assert.equal(result.neighboringStavesSeparated,true,"Staff/system layout overlaps ledger notes");
  assert.equal(result.naturalScroll,true,"Reading canvas must scroll instead of clipping oversized scores");
  assert.equal(result.viewportVisible,true,"Reading score canvas must be visible");
  await page.screenshot({path:"/tmp/ledger-"+device.name+".png"});
  await page.close();
 }
 console.log("PASS: supplementary ledger lines remain inside a scrollable score on desktop and mobile.");
}finally{await browser.close()}
