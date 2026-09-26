(function animalPianoBootstrap(){
  "use strict";
  const card=document.getElementById("animalPianoCard");
  const view=document.getElementById("animalPianoView");
  const gamesView=document.getElementById("gamesView");
  const back=document.getElementById("animalPianoBack");
  const world=document.getElementById("animalPianoWorld");
  const keys=Array.from(document.querySelectorAll("#animalPianoView .ap-key"));
  const stars=Array.from(document.querySelectorAll("#animalPianoStars span"));
  const start=document.getElementById("animalPianoStart");
  const finish=document.getElementById("animalPianoFinish");
  const play=document.getElementById("animalPianoPlay");
  const replay=document.getElementById("animalPianoReplay");
  if(!card||!view||!gamesView||!back||!world||!keys.length||!start||!finish||!play||!replay)return;

  const SONGS=[
    {id:"mary",rounds:[[2,1,0,1,2,2,2],[1,1,1,2,4,4],[2,1,0,1,2,2,2,2,1,1,2,1,0]]},
    {id:"frere",rounds:[[0,1,2,0,0,1,2,0],[2,3,4,2,3,4],[4,3,2,0,4,3,2,0]]},
    {id:"ode",rounds:[[2,2,3,4,4,3,2,1],[0,0,1,2,2,1,1],[2,2,3,4,4,3,2,1,0,0,1,2,1,0,0]]},
    {id:"row",rounds:[[0,0,0,1,2],[2,1,2,3,4],[4,4,4,2,2,2,0,0,0,4,3,2,1,0]]},
    {id:"twinkle-five-note",rounds:[[0,0,4,4,3,3,4],[2,2,1,1,0,0,4],[4,4,2,2,1,1,0]]}
  ];
  const semitones=[0,2,4,5,7];
  let ctx=null,baseBuffer=null,song=null,round=0,step=0,running=false,previousTarget=null;

  function audioContext(){
    if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();
    if(ctx.state==="suspended")ctx.resume().catch(function(){});
    return ctx;
  }
  function makePianoBuffer(){
    const ac=audioContext();
    if(baseBuffer)return baseBuffer;
    const duration=1.18,sampleRate=ac.sampleRate,length=Math.floor(sampleRate*duration);
    const buffer=ac.createBuffer(1,length,sampleRate),data=buffer.getChannelData(0),base=261.63;
    for(let i=0;i<length;i+=1){
      const t=i/sampleRate,attack=Math.min(t/.008,1);
      const v=Math.sin(2*Math.PI*base*t)*Math.exp(-3*t)+.34*Math.sin(2*Math.PI*base*2.01*t)*Math.exp(-6.2*t)+.16*Math.sin(2*Math.PI*base*3.02*t)*Math.exp(-8.8*t)+.07*Math.sin(2*Math.PI*base*4.04*t)*Math.exp(-11.2*t);
      data[i]=v*attack*.43;
    }
    baseBuffer=buffer;
    return buffer;
  }
  function playPiano(index){
    try{
      const ac=audioContext(),source=ac.createBufferSource(),filter=ac.createBiquadFilter(),gain=ac.createGain();
      source.buffer=makePianoBuffer();
      source.playbackRate.value=Math.pow(2,semitones[index]/12);
      filter.type="lowpass";filter.frequency.value=5200;filter.Q.value=.45;gain.gain.value=.96;
      source.connect(filter);filter.connect(gain);gain.connect(ac.destination);source.start();
    }catch(_){}
  }
  function chooseSong(){
    const bagKey="luwipi:piano-bichinhos:bag",lastKey="luwipi:piano-bichinhos:last",ids=SONGS.map(function(s){return s.id}),copy=ids.slice();
    let bag=[],last=null;
    try{bag=JSON.parse(localStorage.getItem(bagKey)||"[]");if(!Array.isArray(bag)||bag.some(function(id){return !ids.includes(id)}))bag=[];last=localStorage.getItem(lastKey)}catch(_){bag=[]}
    if(!bag.length){
      bag=copy;
      for(let i=bag.length-1;i>0;i-=1){const j=Math.floor(Math.random()*(i+1)),tmp=bag[i];bag[i]=bag[j];bag[j]=tmp}
      if(bag.length>1&&bag[0]===last){const tmp=bag[0];bag[0]=bag[1];bag[1]=tmp}
    }
    const next=bag.shift();
    try{localStorage.setItem(bagKey,JSON.stringify(bag));localStorage.setItem(lastKey,next)}catch(_){}
    return SONGS.find(function(s){return s.id===next})||SONGS[0];
  }
  function showView(target){
    document.querySelectorAll(".view").forEach(function(el){el.classList.remove("active")});
    target.classList.add("active");window.scrollTo({top:0,behavior:"auto"});
  }
  function currentTarget(){return song.rounds[round][step]}
  function setTarget(){
    const target=currentTarget(),isRepeat=previousTarget===target;
    keys.forEach(function(key,index){key.classList.toggle("target",index===target&&!isRepeat);key.classList.toggle("repeat-target",index===target&&isRepeat)});
  }
  function clearTransient(){world.querySelectorAll(".ap-spark,.ap-balloon").forEach(function(el){el.remove()})}
  function burst(key,bigger){
    const kr=key.getBoundingClientRect(),wr=world.getBoundingClientRect(),cx=kr.left-wr.left+kr.width/2,cy=kr.top-wr.top+kr.height*.32;
    const glyphs=bigger?["✨","🌟","🎵","💫","⭐","🫧"]:["✨","⭐","🎵","💫"],count=bigger?14:9;
    for(let i=0;i<count;i+=1){const s=document.createElement("span");s.className="ap-spark";s.textContent=glyphs[i%glyphs.length];s.style.left=cx+"px";s.style.top=cy+"px";s.style.setProperty("--ap-x",((Math.random()-.5)*(bigger?180:140))+"px");s.style.setProperty("--ap-y",(-35-Math.random()*(bigger?130:100))+"px");world.appendChild(s);setTimeout(function(){s.remove()},680)}
    if(Math.random()>.3){const b=document.createElement("span");b.className="ap-balloon";b.textContent=["🎈","🌟","🫧","🦋"][Math.floor(Math.random()*4)];b.style.left=(7+Math.random()*86)+"%";b.style.bottom="29%";world.appendChild(b);setTimeout(function(){b.remove()},5200)}
  }
  function completeHit(key,index){
    const repeated=previousTarget===index;
    playPiano(index);key.classList.remove("correct");void key.offsetWidth;key.classList.add("correct");burst(key,repeated);setTimeout(function(){key.classList.remove("correct")},340);
    previousTarget=index;step+=1;
    if(step>=song.rounds[round].length){
      round+=1;stars.forEach(function(s,i){s.classList.toggle("on",i<round)});
      if(round>=song.rounds.length){running=false;keys.forEach(function(k){k.classList.remove("target","repeat-target","correct","wrong")});setTimeout(function(){finish.classList.remove("hidden")},700);return}
      step=0;previousTarget=null;keys.forEach(function(k){k.classList.remove("target","repeat-target","correct","wrong")});setTimeout(setTarget,650);return;
    }
    setTimeout(setTarget,380);
  }
  function begin(){
    audioContext();song=chooseSong();round=0;step=0;previousTarget=null;running=true;clearTransient();stars.forEach(function(s){s.classList.remove("on")});finish.classList.add("hidden");start.classList.add("hidden");keys.forEach(function(k){k.classList.remove("target","repeat-target","correct","wrong")});setTarget();
  }
  function stop(){running=false;clearTransient();keys.forEach(function(k){k.classList.remove("target","repeat-target","correct","wrong")})}
  keys.forEach(function(key,index){key.addEventListener("pointerdown",function(e){e.preventDefault();if(!running)return;if(index===currentTarget())completeHit(key,index);else{key.classList.remove("wrong");void key.offsetWidth;key.classList.add("wrong")}}, {passive:false})});
  card.addEventListener("click",function(){stop();showView(view);start.classList.remove("hidden");finish.classList.add("hidden");document.title="Piano dos Bichinhos | Luwipi"});
  back.addEventListener("click",function(){stop();showView(gamesView);document.title="Jogos | Luwipi"});
  play.addEventListener("click",begin);replay.addEventListener("click",begin);window.addEventListener("pagehide",stop);
})();