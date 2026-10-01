import assert from 'node:assert/strict';
import '../assets/pedagogy/sightreading-foundation-v1.js';
const C=globalThis.LuwipiPedagogyV1;
const expected=[8,8,6,8,6,8,5,7],identities=new Set();
function voices(abc,v){
 const line=abc.split('\n').find(x=>x.startsWith('[V:'+v+'] '));
 assert.ok(line,'Partitura sem voz '+v);
 return line.slice(7).replace(/\s*\|\]$/,'').split(/\s*\|\s*/);
}
function beats(bar){
 const tokens=bar.match(/!\w+!|"[^"]+"|\[[^\]]+\](?:\d+|\/\d+)?|[\^_=:]?[A-Ga-gz][',]*(?:\d+|\/\d+)?/g)||[];
 return tokens.reduce((s,t)=>{
  if(t.startsWith('!')||t.startsWith('"'))return s;
  const dur=t.match(/(\d+|\/\d+)$/);
  return s+(dur?(dur[1].startsWith('/')?1/Number(dur[1].slice(1)):Number(dur[1])):1);
 },0);
}
let count=0;
for(const track of C.trackIds){
 assert.equal(C.tracks[track].levels.length,8,'Trilha incompleta: '+track);
 for(let level=0;level<8;level++){
  const module=C.moduleFor(track,level);
  assert.ok(module.objective&&module.proof,'Falta intenção ou evidência: '+module.id);
  const signatures=new Set();
  for(let variant=0;variant<C.availableVariants(track,level);variant++){
   const e=C.makeSeed(track,level,variant);
   const rh=voices(e.abc,'RH'),lh=voices(e.abc,'LH');
   assert.equal(rh.length,8);
   assert.equal(lh.length,8);
   for(const bar of rh.concat(lh))assert.equal(beats(bar),expected[level],e.id+' compasso inválido: '+bar);
   const signature=rh.join('|')+'//'+lh.join('|');
   assert.ok(!signatures.has(signature),'Repetição dentro do módulo: '+e.id);
   signatures.add(signature);identities.add(e.id);count++;
  }
 }
}
assert.equal(C.trackIds.length,10);
assert.equal(C.trackIds.length*C.levels.length,80);
assert.equal(count,identities.size);
assert.equal(C.makeSeed('F',4).abc.split('\n')[4],'Q:3/8=72');
assert.ok(C.makeSeed('F',0).abc.includes('z2'));
assert.ok(C.makeSeed('C',0).abc.includes('^F'));
const start=C.placementFromDiagnostic({tests:{0:0,1:1,2:1,3:2,4:2}});
for(const t of ['A','B','D','E','F'])assert.equal(start[t].status,'reconhecimento elementar observado');
for(const t of ['C','G','H','I','J'])assert.equal(start[t].status,'não avaliado');
assert.equal(C.dueDates('2026-10-01').join(','),'2026-10-02,2026-10-04,2026-10-08,2026-10-15');
let p=C.newProfile();
for(let i=0;i<3;i++){
 const r=C.record(p,{track:'A',level:0,sessionId:'s'+i,exerciseId:'A'+i,date:'2026-10-01',kind:'first_sight',
 notes:.95,rhythm:.93,stops:0,bpm:60,stablePulse:true,evidence:'verified_midi',
 errors:i?[ ]:[{pattern:'Sol2 na clave de Fá'}]});
 assert.equal(r.eligibleForGate,i===2);p=r.profile;
}
assert.equal(p.mistakes[0].due.length,4);
assert.throws(()=>C.passGate(p,'A',{}),/prova original/);
const full={score:1,stops:0,verified:true};
const passed=C.passGate(p,'A',{trackCompetency:{score:1,verified:true,materialKind:'curated'},
 recognition:full,rhythm:full,leftHand:full,continuousReading:full,preReading:full});
assert.equal(passed.levels.A.level,1);
assert.equal(passed.levels.B.level,0);
assert.throws(()=>C.record(p,{track:'A',level:0,sessionId:'s9',exerciseId:'A1',date:'2026-10-01',
 kind:'first_sight',notes:1,rhythm:1,stops:0,bpm:60,stablePulse:true,evidence:'verified_midi'}),/já vista/);
let poor=C.record(C.newProfile(),{track:'E',level:0,sessionId:'fail',exerciseId:'E0',date:'2026-10-01',
 kind:'practice',notes:.65,rhythm:.98,stops:2,bpm:56,stablePulse:false,evidence:'self_report'});
assert.equal(poor.profile.levels.E.recommendation,'decompor exercício');
console.log('Pedagogy check: 80 modules; '+count+' unique seed variants; all have two eight-bar voices and valid rhythmic totals.');
console.log('Placement, 3-session rule, verified specialist gate, error dates, low-score retreat and no-repeat checks passed.');