(function(root){
"use strict";
/* Composition factory for N5–N7. Original eight/sixteen-bar pedagogic material,
   plus a different, diatonically transposed phrase-order variant for fresh reading.
   These are training studies, not human-validated professional examinations. */
const BASS=Object.freeze({
pedal:"C,8|F,8|G,,8|C,8|A,,8|D,8|G,,8|C,8",
fifths:"C,4 G,,4|F,4 C,4|G,,4 D,4|C,8|A,,4 E,4|D,4 A,,4|G,,4 D,4|C,8",
chords:"C,4 [C,E,G,]4|F,4 [F,A,C]4|G,,4 [G,,B,D]4|C,8|A,,4 [A,,C,E,]4|D,4 [D,F,A,]4|G,,4 [G,,B,D]4|C,8",
walk:"C,2 E,2 G,2 B,2|F,2 A,2 C2 E2|G,,2 B,,2 D,2 F,2|C,2 G,,2 E,2 G,,2|A,,2 C,2 E,2 G,2|D,2 F,2 A,2 C2|G,,2 B,,2 D,2 F,2|C,2 G,,2 E,2 C,2",
stride:"C,,2 [C,E,G,]2 G,,2 [C,E,G,]2|F,,2 [F,A,C]2 C,2 [F,A,C]2|G,,2 [G,,B,D]2 D,2 [G,,B,D]2|C,,2 [C,E,G,]2 G,,2 [C,E,G,]2|A,,,2 [A,,C,E,]2 E,,2 [A,,C,E,]2|D,,2 [D,F,A,]2 A,,2 [D,F,A,]2|G,,2 [G,,B,D]2 D,2 [G,,B,D]2|C,,2 [C,E,G,]2 G,,2 [C,E,G,]2",
alberti:"C, G, E, G, C, G, E, G,|F, C A, C F, C A, C|G,, D, B,, D, G,, D, B,, D,|C, G, E, G, C, G, E, G,|A,, E, C, E, A,, E, C, E,|D, A, F, A, D, A, F, A,|G,, D, B,, D, G,, D, B,, D,|C, G, E, G, C, G, E, G,",
bossa:"C,2 z G,2 E, z G,|F,2 z C2 A, z C|G,,2 z D,2 B,, z D,|C,2 z G,2 E, z G,|A,,2 z E,2 C, z E,|D,2 z A,2 F, z A,|G,,2 z D,2 B,, z D,|C,2 z G,2 E, z C,",
sustained:"[C,E,G,]8|[F,A,C]8|[G,,B,D]8|[C,E,G,]8|[A,,C,E,]8|[D,F,A,]8|[G,,B,D]8|[C,E,G,]8",
counter:"C,2 D,2 E,2 G,2|A,2 G,2 F,2 E,2|D,2 E,2 F,2 A,2|G,2 F,2 E,2 D,2|E,2 G,2 A,2 G,2|F,2 E,2 D,2 C,2|D,2 F,2 E,2 D,2|C,8",
bass5:"C,2 G,,3|F,3 C,2|G,,2 D,3|C,3 G,,2|A,,2 E,3|D,3 A,,2|G,,2 D,3|C,5",
bass7:"C,2 G,,2 E,3|F,3 C2 A,2|G,,2 D,2 B,,3|C,3 E,2 G,2|A,,2 E,2 C,3|D,3 A,2 F,2|G,,2 D,2 B,,3|C,7",
bass3:"C,3 G,,3|F,3 C,3|G,,3 D,3|C,6|A,,3 E,3|D,3 A,,3|G,,3 D,3|C,6",
satb:"C,,8|F,,8|G,,8|C,,8|A,,,8|D,,8|G,,8|C,,8"
});
function upOne(source){
 return String(source).replace(/[\^_=]*[A-Ga-g][,']*/g,token=>{
  const match=/^([\^_=]*)([A-Ga-g])([,']*)$/.exec(token);
  if(!match)return token;
  const order="CDEFGAB",orig=match[2],i=order.indexOf(orig.toUpperCase());
  let octave=orig===orig.toLowerCase()?5:4;
  for(const mark of match[3])octave+=mark==="'"?1:-1;
  let next=(i+1)%7;
  if(next===0)octave++;
  const letter=octave>=5?order[next].toLowerCase():order[next];
  const suffix=octave>=5?"'".repeat(octave-5):",".repeat(4-octave);
  return match[1]+letter+suffix;
 });
}
function bars(input){
 const data=BASS[input]||input;
 if(!data||typeof data!=="string")throw Error("missing authored voice");
 return data.split("|").map(x=>x.trim());
}
function make(track,level,def,index){
 if(!def||!Number.isInteger(index)||index<0||index>=(Array.isArray(def.additional)&&def.additional.length?def.additional.length+1:2))return null;
 const alternate=Array.isArray(def.additional)&&index>0?def.additional[index-1]:null;
 const transform=index>0&&!alternate;
 def=alternate?{...def,...alternate,additional:undefined}:def;
 const names=["rh","rh2","lh","lh2"],parts={};
 const count=bars(def.rh).length;
 if(![8,16].includes(count))throw Error(track+"N"+level+" must contain 8 or 16 actual composed bars");
 const grouping=count===16
  ?[0,1,4,5,2,3,6,7,8,9,12,13,10,11,14,15]:[0,1,4,5,2,3,6,7];
 for(const name of names){
  if(!def[name])continue;
  const original=bars(def[name]);
  if(original.length!==count)throw Error(track+"N"+level+" "+name+" inconsistent bar count");
  parts[name]=transform?grouping.map(i=>upOne(original[i])):original;
 }
 const meter=def.meter||"4/4",unit=def.unit||"1/8",bpm=(def.bpm||60)+(index?3:0),
  meters=Array.isArray(def.meterSequence)?def.meterSequence:null,
  keys=Array.isArray(def.keySequence)?def.keySequence:null;
 if(meters&&(meters.length!==count||meters[0]!==meter))throw Error("Invalid per-bar meter plan");
 if(keys&&(keys.length!==count||keys[0]!==def.key))throw Error("Invalid per-bar key plan");
 const title=track+" · N"+level+" · Estudo "+String(index+1),
  abc=["X:1","T:"+title,"M:"+meter,"L:"+unit,"Q:1/4="+bpm,"K:"+(def.key||"C"),
   "%%score { RH"+(parts.rh2?" RH2":"")+" LH"+(parts.lh2?" LH2":"")+" }",
   "V:RH clef=treble","V:LH clef=bass"];
 if(parts.rh2)abc.push("V:RH2 clef=treble");
 if(parts.lh2)abc.push("V:LH2 clef=bass");
 for(const name of names)if(parts[name])abc.push("[V:"+name.toUpperCase()+"] "+parts[name].join(" | ")+" |]");
 const limit=String(def.limit||"Treino dirigido; a certificação requer provas novas verificadas por professor."),
   partial=/^Parcial:/.test(limit);
 return Object.freeze({id:"special-"+track+"N"+level+"-"+String(index+1).padStart(2,"0"),
  track,level,title,abc:abc.join("\n"),composer:"Luwipi / estudo de treino",intent:def.focus,proof:def.focus,
  meter,key:def.key||"C",bpm,unit,bars:count,hands:["direita","esquerda"],
  specialized:true,certification:false,partialCoverage:partial,limitations:limit,
  secondTrebleVoice:Boolean(parts.rh2),secondBassVoice:Boolean(parts.lh2),
  transposeSemitones:def.transposeSemitones||0,transposeByVoice:def.transposeByVoice||null,expression:def.expression||null,
  rhythmFeel:def.rhythmFeel||null,cues:def.cues||null,staffHints:def.staffHints||null,
  meterSequence:meters?meters.slice():null,keySequence:keys?keys.slice():null,
  staffLayout:Array.isArray(def.staffLayout)?def.staffLayout.map(x=>({...x})):null,
  clefChanges:Array.isArray(def.clefChanges)?def.clefChanges.map(x=>({...x})):null,
  octaveMarks:Array.isArray(def.octaveMarks)?def.octaveMarks.map(x=>({...x})):null,
  notationLegend:Array.isArray(def.notationLegend)?def.notationLegend.slice():null,
  staffKeys:def.staffKeys||null,
  ornaments:Array.isArray(def.ornaments)?def.ornaments.map(x=>({...x})):null,
  tempoSequence:Array.isArray(def.tempoSequence)?def.tempoSequence.slice():null});
}
function install(name,level,data){
 if(!/^[A-Z][A-Z0-9]*$/.test(name)||![5,6,7].includes(level))throw Error("invalid study group");
 for(const track of "ABCDEFGHIJ")if(!data[track])throw Error("missing track "+track);
 const api=Object.freeze({get:(track,requested,index=0)=>requested===level?make(track,level,data[track],index):null,
  count:track=>data[track]?(Array.isArray(data[track].additional)&&data[track].additional.length?data[track].additional.length+1:2):0,trackIds:Object.freeze(Object.keys(data)),
  supportedLevels:[level],registeredLevel:level});
 root["LuwipiSpecialized"+name]=api;
 return api;
}
root.LuwipiAdvancedStudyFactory=Object.freeze({install,make,bars,upOne});
})(typeof window!=="undefined"?window:globalThis);
