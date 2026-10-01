import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const read=p=>fs.readFile(new URL('../'+p,import.meta.url),'utf8');
const engineSource=await read('assets/music/score-engine.js');
const engineWindow={};
new Function('window',engineSource)(engineWindow);
const E=engineWindow.LuwipiScoreEngine;
await import('../assets/pedagogy/sightreading-foundation-v1.js');
const P=globalThis.LuwipiPedagogyV1;
const ui=await read('assets/pedagogy/sightreading-workspace.js');
const from=ui.indexOf('function splitABC(seed){'),to=ui.indexOf('\nfunction launch(',from);
assert.ok(from>=0&&to>from,'Two-handed ABC bridge missing');
const parse=new Function('E',ui.slice(from,to)+';return splitABC;')(E);
const expected=[32,32,24,32,24,32,20,28];
let total=0;
for(const track of P.trackIds)for(let level=0;level<8;level++){
 const signatures=new Set();
 for(let variant=0;variant<P.availableVariants(track,level);variant++){
  const exercise=P.makeSeed(track,level,variant),parsed=parse(exercise),events=parsed.events;
  assert.ok(events.some(e=>e.clef==='treble')&&events.some(e=>e.clef==='bass'),'One hand missing in '+exercise.id);
  const end=Math.max(...events.map(e=>e.startBeat+e.durationBeat));
  assert.equal(end,expected[level],'ABC rhythm diverged in '+exercise.id);
  const fingerprint=events.map(e=>[e.clef,e.midi,e.startBeat,e.durationBeat].join(':')).join('|');
  assert.ok(!signatures.has(fingerprint),'Duplicate reading music within module '+exercise.id);
  signatures.add(fingerprint);
  if(exercise.meter==='6/8')assert.equal(parsed.tempoBpm,exercise.bpm*1.5,'Compound meter tempo does not use dotted beat');
  total++;
 }
}
assert.equal(P.trackIds.length*P.levels.length,80);
const css=await read('assets/app.css');
const shell=await read('assets/activities/workspace-shell.js');
const app=await read('app.html');
const roadmap=await read('assets/reading/repertoire-roadmap.js');
const live=await read('assets/live/live-mode.js');
assert.ok(css.includes('body[data-mode="aprenda"] #readingView.workspace-library-open .reading-library'),'Reading library is still hidden by old mode CSS');
assert.ok(css.includes('body.workspace-shell-enabled.workspace-sidebar-closed{padding-left:0!important}'),'Closed sidebar still reserves canvas space');
assert.ok(shell.includes("localStorage.getItem(MENU_KEY)")==true&&shell.includes("sidebar.inert=!sidebarOpen"),'Navigation does not preserve or expose toggle accessibility');
assert.ok(shell.includes("data-workspace-action")&&shell.includes("function togglePath()"),'Path menu action missing');
assert.ok(roadmap.includes('library.after(root)')&&!roadmap.includes('library.hidden=expanded'),'Repertoire hides older playable songs');
assert.ok(app.includes('/assets/pedagogy/sightreading-foundation-v1.js')&&app.includes('/assets/pedagogy/sightreading-workspace.js'),'Pedagogic modules are not mounted');
assert.ok(live.includes('window.LuwipiLiveLoadPedagogy'),'Learning drills do not open in existing practice');
for(const code of [shell,roadmap,live,ui])assert.doesNotThrow(()=>new Function(code));
console.log('Workspace pedagogy gate: '+total+' parsed original two-hand ABC variants in 80 independent modules.');
console.log('Routing UI, repertoire display, compound-meter tempo, navigation toggle and code syntax: OK.');
