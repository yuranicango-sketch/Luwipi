"use client";
import{useEffect,useRef,useState,type CSSProperties}from"react";
import styles from"./lesson-visual.module.css";
import type{AgeGroup}from"@/lib/curriculum";
import{pedagogyAssets,type PedagogyVisualKind,type PedagogyAsset}from"@/lib/pedagogy-assets";
import{resolveActionVisual}from"@/lib/pedagogy-visual-resolver";

type Props={stepId:string;icon:string;title:string;age:AgeGroup;accent:string;instruction?:string};
type StoredAsset={id:string;visual_key:string;source_url:string;storage_path:string|null;alt_text:string;focus:string;status:"candidate"|"approved"|"rejected";public_url?:string|null};
function SafeImage({asset}:{asset:PedagogyAsset}){const[e,setE]=useState(false);useEffect(()=>setE(false),[asset.src]);if(e)return <div className={styles.imageFallback}><b>Imagem indisponível</b></div>;return <img className={styles.realAsset} src={asset.src} alt={asset.alt} loading="eager" onError={()=>setE(true)}/>;}
function CandidateImage({asset}:{asset:StoredAsset}){const[e,setE]=useState(false);useEffect(()=>setE(false),[asset.source_url]);if(e)return <div className={styles.imageFallback}><b>Fonte da imagem indisponível</b><span>Reprove para procurar outra opção.</span></div>;return <img className={styles.realAsset} src={`/api/pedagogy-assets/${asset.id}/preview`} alt={asset.alt_text||"Imagem pedagógica candidata"} loading="eager" onError={()=>setE(true)}/>;}
export function LessonVisual({stepId,title,age,accent,instruction=""}:Props){
 const young=age==="2-4",resolved=resolveActionVisual(instruction,stepId);
 const kind:PedagogyVisualKind=resolved?.startsWith("posture-")?"posture":resolved==="hand-shape"||resolved==="finger-numbering"?"hands":(resolved??"story") as PedagogyVisualKind;
 const fallback=(resolved?.startsWith("posture-")||resolved==="hand-shape"||resolved==="finger-numbering")?[]:(pedagogyAssets[kind]??[]);
 const[stored,setStored]=useState<StoredAsset[]>([]),[busy,setBusy]=useState<string|null>(null),[error,setError]=useState(""),ref=useRef<HTMLDivElement>(null),[active,setActive]=useState(0);
 async function reload(){if(!resolved){setStored([]);return}try{const r=await fetch(`/api/pedagogy-assets?visual_key=${encodeURIComponent(resolved)}`,{cache:"no-store"});const j=r.ok?await r.json():null;setStored(j?.assets??[])}catch{setStored([])}}
 useEffect(()=>{setActive(0);setError("");void reload()},[resolved,instruction]);
 const approved=stored.filter(x=>x.status==="approved"&&x.public_url).map(x=>({src:x.public_url!,alt:x.alt_text,focus:x.focus,source:"Luwipi",license:"approved"}));
 const candidate=stored.find(x=>x.status==="candidate");
 const assets:PedagogyAsset[]=approved.length?approved:fallback;
 async function decide(decision:"approved"|"rejected"){if(!candidate)return;setBusy(candidate.id);setError("");try{const r=await fetch(`/api/pedagogy-assets/${candidate.id}/decision`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({decision})});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"Não foi possível guardar a decisão.");await reload()}catch(e){setError(e instanceof Error?e.message:"Não foi possível guardar a decisão.")}finally{setBusy(null)}}
 const go=(i:number)=>{if(!assets.length)return;const n=(i+assets.length)%assets.length;setActive(n);ref.current?.scrollTo({left:n*ref.current.clientWidth,behavior:"smooth"})};
 const empty=!candidate&&!assets.length;
 return <div className={`${styles.visual} ${empty?styles.visualEmpty:""}`} style={{"--accent":accent}as CSSProperties}><div className={styles.sceneLabel}>CENA DA AULA</div>
 {candidate?<div className={styles.reviewCard}><CandidateImage asset={candidate}/><b>{candidate.focus||"Imagem sugerida para esta ação"}</b><div className={styles.reviewActions}><button disabled={!!busy} onClick={()=>decide("approved")}>{busy?"A guardar…":"Aprovar e guardar"}</button><button disabled={!!busy} onClick={()=>decide("rejected")}>Reprovar</button></div>{error&&<p className={styles.reviewError}>{error}</p>}</div>
 :assets.length?<><div className={styles.sliderWrap}>{assets.length>1&&<button className={styles.arrow} onClick={()=>go(active-1)} aria-label="Imagem anterior">‹</button>}<div className={styles.assetGallery} ref={ref} onScroll={e=>{const el=e.currentTarget;if(el.clientWidth)setActive(Math.round(el.scrollLeft/el.clientWidth))}}>{assets.map(a=><figure className={styles.assetCard} key={a.src}><SafeImage asset={a}/>{a.focus&&<figcaption><b>{a.focus}</b></figcaption>}</figure>)}</div>{assets.length>1&&<button className={styles.arrow} onClick={()=>go(active+1)} aria-label="Próxima imagem">›</button>}</div>{assets.length>1&&<div className={styles.dots}>{assets.map((_,i)=><button key={i} aria-label={`Ver imagem ${i+1}`} className={i===active?styles.dotActive:styles.dot} onClick={()=>go(i)}/>)}</div>}</>
 :<div className={styles.noVisual}><strong>Imagem ainda não selecionada</strong><span>Continue a aula normalmente. Quando houver uma sugestão, poderá aprovar ou reprovar aqui.</span></div>}
 {assets.length>0&&<b className={styles.caption}>{kind==="highlow"?(young?"SOM GRANDÃO · SOM PEQUENINO":"GRAVE · AGUDO"):title.toUpperCase()}</b>}</div>
}