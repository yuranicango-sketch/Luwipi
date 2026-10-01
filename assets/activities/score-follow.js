/* A score follows the played note in either scroll direction, never with overlays. */
(()=>{
'use strict';
const entries=[
 ['songSvg','#songView .score-wrap','.note-current'],
 ['exerciseSvg','#exerciseView .score-wrap','.note-current'],
 ['readingImportedSvg','#readingImportedView .score-wrap','.note-current'],
 ['liveScoreSvg','#liveModeView .live-svg-wrap','.live-score-halo']
];
function follow(note,area){
 if(!note||!area||!area.clientWidth||!area.clientHeight)return;
 const n=note.getBoundingClientRect(),a=area.getBoundingClientRect();
 const x=area.scrollWidth>area.clientWidth+3&&(n.left<a.left+a.width*.18||n.right>a.right-a.width*.18);
 const y=area.scrollHeight>area.clientHeight+3&&(n.top<a.top+a.height*.17||n.bottom>a.bottom-a.height*.2);
 if(x)area.scrollLeft=Math.max(0,area.scrollLeft+n.left-(a.left+a.width*.38));
 if(y)area.scrollTop=Math.max(0,area.scrollTop+n.top-(a.top+a.height*.35));
}
for(const [id,containerSelector,markSelector] of entries){
 const svg=document.getElementById(id);if(!svg)continue;
 let scheduled=false;
 const update=()=>{
  scheduled=false;
  if(!svg.closest('.view.active'))return;
  follow(svg.querySelector(markSelector),document.querySelector(containerSelector));
 };
 const queue=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(update)};
 new MutationObserver(queue).observe(svg,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
}
const mode=document.getElementById('songScoreMode');
function syncMode(){
 if(!mode)return;
 const vertical=mode.getAttribute('aria-pressed')==='true';
 mode.setAttribute('aria-label',vertical?'Partitura horizontal':'Partitura vertical');
 mode.setAttribute('title',vertical?'Partitura horizontal':'Partitura vertical');
}
if(mode){new MutationObserver(syncMode).observe(mode,{attributes:true,attributeFilter:['aria-pressed']});syncMode()}
window.LuwipiScoreFollower=Object.freeze({follow});
})();