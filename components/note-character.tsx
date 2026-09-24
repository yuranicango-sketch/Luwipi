import Image from "next/image";
import { noteCharacters, type NaturalNote } from "@/lib/visual-learning";
import styles from "./note-character.module.css";

export function NoteCharacter({ note, active=false, compact=false }: { note: NaturalNote; active?: boolean; compact?: boolean }) {
  const character=noteCharacters[note];

  if(character.imageSrc){
    return <div className={styles.wrap} data-active={active||undefined} data-compact={compact||undefined}>
      <Image src={character.imageSrc} alt={`${character.name}, personagem da nota ${character.label}`} width={compact?72:126} height={compact?88:150} className={styles.raster}/>
      <strong>{character.name}</strong><small>{character.label} · {character.note}</small>
    </div>;
  }

  return <div className={styles.wrap} data-active={active||undefined} data-compact={compact||undefined}>
    <svg viewBox="0 0 120 145" className={styles.art} role="img" aria-label={`${character.name}, personagem da nota ${character.label}`}>
      <defs>
        <filter id={`paper-${note}`}>
          <feTurbulence type="fractalNoise" baseFrequency=".78" numOctaves="2" seed={String(note.charCodeAt(0))} result="noise"/>
          <feComposite in="noise" in2="SourceGraphic" operator="in" result="texture"/>
          <feBlend in="SourceGraphic" in2="texture" mode="multiply"/>
        </filter>
      </defs>
      <g filter={`url(#paper-${note})`}>
        {character.kind==="sun"&&<>
          {[0,45,90,135,180,225,270,315].map((angle)=><path key={angle} transform={`rotate(${angle} 60 61)`} d="M60 7 67 28 53 28Z" fill={character.color} className={styles.edge}/>)}
          <circle cx="60" cy="61" r="37" fill={character.color} className={styles.edge}/>
        </>}
        {character.kind==="bird"&&<>
          <ellipse cx="59" cy="68" rx="37" ry="42" fill={character.color} className={styles.edge}/>
          <path d="M27 67Q5 75 18 96Q34 91 42 80Z" fill="#a8ddef" className={styles.edge}/>
          <path d="M91 67Q113 75 100 96Q84 91 77 80Z" fill="#a8ddef" className={styles.edge}/>
          <path d="M54 28Q61 12 70 27" className={styles.detail}/>
        </>}
        {character.kind==="leaf"&&<>
          <path d="M60 18Q101 25 99 68Q96 103 60 108Q24 102 20 68Q19 28 60 18Z" fill={character.color} className={styles.edge}/>
          <path d="M61 18Q66 7 79 10Q80 22 68 29Z" fill="#4f9d68" className={styles.edge}/>
          <path d="M60 30V99" className={styles.softDetail}/>
        </>}
        {character.kind==="cat"&&<>
          <path d="M27 42 31 15 50 34Q60 29 70 34L90 15 94 43Q101 54 99 72Q96 104 61 108Q25 104 21 72Q19 54 27 42Z" fill={character.color} className={styles.edge}/>
          <path d="M32 78H14M34 84H18M88 78h18M86 84h16" className={styles.whisker}/>
        </>}
        {character.kind==="lion"&&<>
          <circle cx="60" cy="63" r="48" fill="#d77d3f" className={styles.edge}/>
          <circle cx="60" cy="64" r="35" fill={character.color} className={styles.edge}/>
        </>}
        {character.kind==="fox"&&<>
          <path d="M24 44 22 15 49 35Q60 29 72 35L99 15 95 46Q102 58 98 77Q92 104 60 108Q28 104 22 77Q18 58 24 44Z" fill={character.color} className={styles.edge}/>
          <path d="M36 45Q60 60 84 45Q80 91 60 98Q40 91 36 45Z" fill="#f7dfc8" opacity=".9"/>
        </>}
        {character.kind==="whale"&&<>
          <path d="M19 65Q21 31 57 28Q86 25 96 48Q103 42 110 48Q106 60 97 66Q96 100 61 106Q24 105 19 65Z" fill={character.color} className={styles.edge}/>
          <path d="M21 66Q10 55 6 68Q12 81 23 78Z" fill="#82b6e8" className={styles.edge}/>
          <path d="M86 38Q92 19 102 23Q108 34 96 46Z" fill="#82b6e8" className={styles.edge}/>
        </>}
      </g>
      <ellipse cx="46" cy="61" rx="5.5" ry="7.5" className={styles.eye}/><ellipse cx="74" cy="61" rx="5.5" ry="7.5" className={styles.eye}/>
      <circle cx="44" cy="58" r="1.8" className={styles.glint}/><circle cx="72" cy="58" r="1.8" className={styles.glint}/>
      {character.kind==="bird"?<path d="M55 76 65 76 60 84Z" fill="#f4a557"/>:<path d="M49 79Q60 88 72 78" className={styles.smile}/>}
      <circle cx="60" cy="116" r="18" className={styles.letterDisc}/>
      <text x="60" y="122" textAnchor="middle" className={styles.letter}>{note}</text>
    </svg>
    <strong>{character.name}</strong><small>{character.label} · {character.note}</small>
  </div>;
}
