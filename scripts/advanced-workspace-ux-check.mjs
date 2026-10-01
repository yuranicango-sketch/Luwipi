import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const read=path=>readFile(new URL("../"+path,import.meta.url),"utf8");
const [html,css,shell,router,piano,ui,input,live,equivalence,library]=await Promise.all([
 "app.html","assets/app.css","assets/activities/workspace-shell.js",
 "assets/activities/workspace-router.js","assets/activities/workspace-piano.js",
 "assets/pedagogy/sightreading-workspace.js","assets/music/live-input.js",
 "assets/live/live-mode.js","assets/pedagogy/score-equivalence.js","assets/reading/reading-library.js"
].map(read));
const start=router.indexOf("function canonical(input){"),end=router.indexOf("function parse(fallback)",start);
assert.ok(start>=0&&end>start,"Canonical route helper is missing");
const canonical=new Function(router.slice(start,end)+";return canonical;")();
assert.deepEqual(canonical({section:"reading"}),{section:"reading",library:true},"Músicas should always open the catalogue");
assert.deepEqual(canonical({section:"reading",activity:"songView",song:"mary"}),{section:"reading",activity:"songView",song:"mary"},"Song route must not be replaced with the catalogue");
assert.deepEqual(canonical({section:"practice"}),{section:"practice"},"Practice route should be preserved");
assert.ok(router.includes("window.addEventListener(\"popstate\"")&&router.includes("sessionStorage.getItem(previousStorage)"),"Browser navigation or previous sessions no longer restore");
assert.ok(router.includes('library=sectionName==="reading"?true:false;'),"Reading route can still reach the old blue stage");
assert.ok(html.includes("Mary Had a Little Lamb")&&html.includes("Jingle Bells")&&html.includes("Ode to Joy"),"Legacy playable songs have disappeared");
assert.ok(css.includes("#readingView .journey-stage{display:none!important}")&&
 css.includes(".workspace-piano[hidden]"),"The retired blue stage or collapsed piano still occupies space");
assert.ok(shell.includes('id="workspacePianoToggle"')&&
 shell.includes('id="workspacePianoBody"')&&
 piano.includes("host.hidden=collapsed")&&piano.includes("toggle.hidden=false"),"Piano must hide its entire row and remain recoverable");
assert.ok(shell.includes("function primaryFor(){")&&shell.includes("return null;"),"Duplicate import buttons were reintroduced into the top bar");
assert.ok(shell.includes("setSidebarOpen(sidebarOpen)")&&shell.includes("let sidebarOpen=false"),"The navigation should not be stuck open");
assert.ok(shell.includes("Aprender partitura")&&html.includes("Músicas e atividades"),"The two canonical destinations need explicit labels");
assert.ok(ui.includes("OPEN_KEY='luwipi:learning-journey:open:v1'")&&
 ui.includes("document.addEventListener('keydown'")&&
 ui.includes("event.key!=='Tab'")&&
 ui.includes("open(true)")&&
 ui.includes("panel.setAttribute('aria-modal','true')"),"Learning dialog must restore after refresh, trap keyboard focus and expose modal semantics");
assert.ok(ui.includes("backToSkills.hidden=!viewing")&&ui.includes("map.hidden=viewing")&&
 ui.includes("workspace-path-active")&&ui.includes("Outras atividades")&&
 ui.includes("stage=3")&&ui.includes("const track=assigned?.track||selected"),"The learning journey does not have a simple skill → level → exercise sequence");
const root={};new Function("window",equivalence)(root);
const eq=root.LuwipiScoreEquivalence;
assert.ok(Object.keys(eq).length>=100&&eq["AN0-s0"].includes("IN0-s0"),"Known repeated reading scores are not excluded");
assert.ok(html.indexOf("score-equivalence.js")<html.indexOf("sightreading-workspace.js")&&
 ui.includes("function expandSeen(){")&&ui.includes("window.LuwipiScoreEquivalence?.[seed.id]"),"The first-sight exclusion is not active");
let inputDevice={onmidimessage:null},observed=[];
const midi={inputs:new Map([["1",inputDevice]]),onstatechange:null};
const browser={dispatchEvent(){},LuwipiScoreEngine:{midiToName:x=>"midi"+x}};
class Event{constructor(type,opts){this.type=type;this.detail=opts?.detail}}
new Function("window","navigator","performance","CustomEvent",input)(
 browser,{requestMIDIAccess:async()=>midi},{now:()=>123},Event);
const unbind=browser.LuwipiLiveInput.subscribe(detail=>observed.push(detail));
await browser.LuwipiLiveInput.connectMIDI();
assert.equal(typeof inputDevice.onmidimessage,"function","MIDI input not installed");
inputDevice.onmidimessage({data:[0xB0,64,127]});
inputDevice.onmidimessage({data:[0xB0,64,0]});
inputDevice.onmidimessage({data:[0x90,60,110]});
assert.deepEqual(observed.map(x=>x.type),["sustain","sustain","noteon"]);
assert.deepEqual(observed.filter(x=>x.type==="sustain").map(x=>x.down),[true,false],"CC64 changes must be distinguishable");
unbind();browser.LuwipiLiveInput.disconnect();
assert.ok(live.includes("transposeByVoice")&&live.includes('detail.type==="sustain"')&&
 live.includes("pedalObservations"),"Per-staff transposition and pedal capture need to reach the practice UI");
// A level uses the existing Leitura renderer. The imported-file Prática keeps its own purpose.
assert.ok(ui.includes("LuwipiReadingLibrary.openLesson(score,")&&
 !ui.includes("window.LuwipiLiveLoadPedagogy(score,")&&
 ui.includes("if(explorationLevel!==null)launch(3)"),
 "Choosing a level must start an actual Leitura exercise rather than opening the Prática importer");
assert.ok(library.includes("function openLesson(rawScore,options={},restoring=false)")&&
 library.includes("Engine.render(svg,current.score")&&
 library.includes("window.LuwipiWorkspacePiano?.show()")&&
 library.includes("lessonNote(e.detail.midi)")&&
 library.includes("const LESSON_STORAGE='luwipi:reading:lesson:v1'"),
 "The large Leitura score, shared piano, active exercise and reload recovery must share one workspace");
assert.ok(router.includes("function openLesson(id)")&&
 router.includes("activity:'readingImportedView',readingId:id")&&
 router.includes("window.LuwipiWorkspaceRouter=Object.freeze({go:navigate,openLesson"),
 "Reading lessons require a canonical, refresh-safe Leitura route");
assert.ok(css.includes(".reading-lesson-panel")&&css.includes(".reading-lesson-panel[hidden]"),
 "A real Start control and clear exercise status must be visible above the score");
assert.ok(css.includes("#readingImportedView .reading-imported-reader{")&&
 css.includes("#readingImportedView .reading-imported-score-wrap{")&&
 css.includes("#readingImportedView.reading-curriculum-lesson .secondary-actions"),
 "Long advanced notation must scroll inside the score, not push lesson controls below the screen");
for(const source of [live,ui,library,router])assert.doesNotThrow(()=>new Function(source));
console.log("Reading lesson route: N0–N7 open in the existing score-and-piano Leitura view, never in the importer.");
