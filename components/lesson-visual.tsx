"use client";
import{useEffect,useRef,useState,type CSSProperties}from"react";
import styles from"./lesson-visual.module.css";
import type{AgeGroup}from"@/lib/curriculum";
import{pedagogyAssets,type PedagogyVisualKind,type PedagogyAsset}from"@/lib/pedagogy-assets";
import{resolveActionVisual,type ActionVisualKey}from"@/lib/pedagogy-visual-resolver";

type Props={stepId:string;icon:string;title:string;age:AgeGroup;accent:string;instruction?:string};
type StoredAsset={id:string;visual_key:string;source_url:string;storage_path:string|null;alt_text:string;focus:string;status:"candidate"|"approved"|"rejected";public_url?:string|null};
function SafeImage({asset}: {asset:PedagogyAsset}){const[e,setE]=useState(false);if(e)return <div className={styles.imageFallback}><b>Imagem indisponível</b></div>;return <img className={styles.realAsset} src={asset.src} alt={asset.alt} loading="eager" onError={()=>setE(true)}/>;}
export function LessonVisual({stepId,title,age,accent,instruction=""}:Props){
 const young=age==="2-4",resolved=resolveActionVisual(instruction,stepId);
 const kind:PedagogyVisualKind=resolved?.startsWith("posture-")?"posture":resolved==="hand-shape"||resolved==="finger-numbering"?"hands":(resolved??"story") as PedagogyVisualKind;
 const fallback=(resolved?.startsWith("posture-")||resolved==="hand-shape"||resolved==="finger-numbering")?[]:(pedagogyAssets[kind]??[]);
 const[stored,setStored]=useState<StoredAsset[]>([]),[busy,setBusy]=useState<string|null>(null),ref=useRef<HTMLDivElement>(null),[active,setActive]=useState(0);
 useEffect(()=>{setActive(0);if(!resolved){setStored([]);return}fetch(`/api/pedagogy-assets?visual_key=${encodeURIComponent(resolved)}`).then(r=>r.ok?r.json():null).then(j=>setStored(j?.assets??[])).catch(()=>setStored([]))},[resolved,instruction]);
 const approved=stored.filter(x=>x.status==="approved"&&x.public_url).map(x=>({src:x.public_url!,alt:x.alt_text,focus:x.focus,source:"Luwipi",license:"approved"}));
 const candidate=stored.find(x=>x.status==="candidate");
 const assets:PedagogyAsset[]=approved.length?approved:fallback;
 async function decide(decision:"approved"|"rejected"){if(!candidate)return;setBusy(candidate.id);const r=await fetch(`/api/pedagogy-assets/${candidate.id}/decision`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({decision})});setBusy(null);if(r.ok){const q=await fetch(`/api/pedagogy-assets?visual_key=${encodeURIComponent(resolved!)}`);if(q.ok)setStored((await q.json()).assets??[])}}
 const go=(i:number)=>{if(!assets.length)return;const n=(i+assets.length)%assets.length;setActive(n);ref.current?.scrollTo({left:n*ref.current.clientWidth,behavior:"smooth"})};
 return <div className={styles.visual} style={{"--accent":accent}as CSSProperties}><div className={styles.sceneLabel}>CENA DA AULA</div>
 {candidate?<div className={styles.reviewCard}><img className={styles.realAsset} src={candidate.source_url} alt={candidate.alt_text}/><b>{candidate.focus||"Imagem sugerida"}</b><div className={styles.reviewActions}><button disabled={!!busy} onClick={()=>decide("approved")}>Aprovar e guardar</button><button disabled={!!busy} onClick={()=>decide("rejected")}>Reprovar</button></div></div>
 :assets.length?<><div className={styles.sliderWrap}>{assets.length>1&&<button className={styles.arrow} onClick={()=>go(active-1)}>‹</button>}<div className={styles.assetGallery} ref={ref} onScroll={e=>{const el=e.currentTarget;if(el.clientWidth)setActive(Math.round(el.scrollLeft/el.clientWidth))}}>{assets.map(a=><figure className={styles.assetCard} key={a.src}><SafeImage asset={a}/><figcaption><b>{a.focus}</b></figcaption></figure>)}</div>{assets.length>1&&<button className={styles.arrow} onClick={()=>go(active+1)}>›</button>}</div>{assets.length>1&&<div className={styles.dots}>{assets.map((_,i)=><button key={i} className={i===active?styles.dotActive:styles.dot} onClick={()=>go(i)}/>)}</div>}</>
 :<div className={styles.noVisual}><strong>Sem imagem aprovada para esta ação.</strong><span>A aula continua normalmente até uma imagem ser aprovada.</span></div>}
 <b className={styles.caption}>{kind==="highlow"?(young?"SOM GRANDÃO · SOM PEQUENINO":"GRAVE · AGUDO"):title.toUpperCase()}</b></div>
}