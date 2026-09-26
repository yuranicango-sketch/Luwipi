(function(){
"use strict";
const q=new URLSearchParams(location.search);
if(q.get("parent")!=="1")return;
let dismissed=false,shown=false;
const dock=document.getElementById("pianoDock");
const board=document.getElementById("pianoBoard");
const close=document.getElementById("closePiano");
if(!dock||!board)return;
if(close)close.addEventListener("click",()=>{dismissed=true},{capture:true});

function activeTask(){
  return Boolean(
    document.getElementById("exerciseView")?.classList.contains("active")||
    document.getElementById("songView")?.classList.contains("active")
  );
}
function show(){
  if(shown||dismissed||!activeTask()||!board.children.length)return false;
  dock.classList.remove("hidden");
  document.body.classList.add("piano-open","task-piano-visible");
  shown=true;
  return true;
}
if(!show()){
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(show()||tries>120)clearInterval(timer);
  },50);
}
})();