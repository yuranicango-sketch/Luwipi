"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AgeGroup } from "@/lib/curriculum";
import { competencyLabels, competencySnapshot, type CompetencyId } from "@/lib/competency-progress";
import styles from "./adaptive-workout.module.css";

type Mission = { competency: CompetencyId; title: string; description: string; href: string; icon: string; minutes: number };

const MISSIONS: Record<AgeGroup, Record<CompetencyId, Mission>> = {
  "2-4": {
    ouvido:{competency:"ouvido",title:"Ouvir e escolher",description:"Distinguir dois sons sem transformar em prova.",href:"/jogos/elefante-passarinho",icon:"👂",minutes:2},
    ritmo:{competency:"ritmo",title:"Pulso do trem",description:"Quatro respostas rápidas de pulso e velocidade.",href:"/jogos/trem-ritmo",icon:"🚂",minutes:2},
    teclado:{competency:"teclado",title:"Caça às teclas",description:"Encontrar lugares no piano com uma missão curta.",href:"/jogos/caca-teclas",icon:"🎹",minutes:2},
    tecnica:{competency:"tecnica",title:"Dedinhos acordados",description:"Coordenação leve, sem exigir independência precoce.",href:"/jogos/mestre-dedos",icon:"🖐️",minutes:2},
    leitura:{competency:"leitura",title:"Ver e encontrar",description:"Ligar símbolo, direção e teclado de forma visual.",href:"/jogos/pauta-tecla",icon:"🎼",minutes:2},
    criatividade:{competency:"criatividade",title:"Completa a ideia",description:"Escolher um final musical e ouvir o resultado.",href:"/jogos/complete-melodia",icon:"✨",minutes:2},
    repertorio:{competency:"repertorio",title:"Uma música conhecida",description:"Tocar um pequeno trecho no modo piano.",href:"/musicas",icon:"🎵",minutes:2},
  },
  "5-8": {
    ouvido:{competency:"ouvido",title:"Ouça e encontre",description:"Reconhecer notas e regiões pelo ouvido.",href:"/jogos/ouca-encontre",icon:"👂",minutes:2},
    ritmo:{competency:"ritmo",title:"Construa o compasso",description:"Completar 4/4 com figuras rítmicas.",href:"/jogos/construa-compasso",icon:"⏱️",minutes:2},
    teclado:{competency:"teclado",title:"Encontre o Dó",description:"Orientação rápida pelos grupos de teclas pretas.",href:"/jogos/encontre-do",icon:"🎹",minutes:2},
    tecnica:{competency:"tecnica",title:"Mestre dos dedos",description:"Mãos, dedos e localização sem excesso de repetição.",href:"/jogos/mestre-dedos",icon:"🖐️",minutes:2},
    leitura:{competency:"leitura",title:"Pauta → tecla",description:"Transformar leitura em ação imediata no piano.",href:"/jogos/pauta-tecla",icon:"🎼",minutes:2},
    criatividade:{competency:"criatividade",title:"Complete a melodia",description:"Ouvir uma frase e escolher um final musical.",href:"/jogos/complete-melodia",icon:"🧩",minutes:2},
    repertorio:{competency:"repertorio",title:"Partitura do dia",description:"Praticar uma música com o cursor a esperar pela nota.",href:"/musicas",icon:"🎵",minutes:2},
  },
  adult: {
    ouvido:{competency:"ouvido",title:"Ouvido aplicado",description:"Reconhecer direção e pequenos padrões pelo ouvido.",href:"/jogos/ouca-encontre",icon:"👂",minutes:2},
    ritmo:{competency:"ritmo",title:"Ritmo em foco",description:"Consolidar pulsação e organização do compasso.",href:"/jogos/construa-compasso",icon:"⏱️",minutes:2},
    teclado:{competency:"teclado",title:"Mapa do teclado",description:"Orientação rápida e segura antes do repertório.",href:"/jogos/encontre-do",icon:"🎹",minutes:2},
    tecnica:{competency:"tecnica",title:"Coordenação curta",description:"Um bloco curto de dedos e coordenação consciente.",href:"/jogos/mestre-dedos",icon:"🖐️",minutes:2},
    leitura:{competency:"leitura",title:"Leitura imediata",description:"Transformar a pauta em ação no teclado.",href:"/jogos/pauta-tecla",icon:"🎼",minutes:2},
    criatividade:{competency:"criatividade",title:"Completar a frase",description:"Ouvir, prever e escolher um final musical.",href:"/jogos/complete-melodia",icon:"🧩",minutes:2},
    repertorio:{competency:"repertorio",title:"Partitura do dia",description:"Praticar um trecho com cursor e feedback nota a nota.",href:"/musicas",icon:"🎵",minutes:2},
  },
};

export function AdaptiveWorkout({ age, studentId = "default" }: { age: AgeGroup; studentId?: string }) {
  const [ready, setReady] = useState(false);
  const [snapshot, setSnapshot] = useState<ReturnType<typeof competencySnapshot> | null>(null);
  useEffect(() => { setSnapshot(competencySnapshot(studentId, age)); setReady(true); }, [studentId, age]);

  const plan = useMemo(() => {
    const ids = Object.keys(competencyLabels) as CompetencyId[];
    const ranked = ids.map((id) => {
      const value = snapshot?.[id];
      const score = !value?.total ? .45 : value.mastered / Math.max(1, value.total) - value.reinforce * .08;
      return { id, score };
    }).sort((a,b) => a.score - b.score);
    const selected = [ranked[0]?.id ?? "ouvido", ranked[1]?.id ?? "ritmo", ranked[2]?.id ?? "teclado"];
    return selected.map((id) => MISSIONS[age][id]);
  }, [snapshot, age]);

  const focus = plan[0]?.competency ?? "ouvido";
  return <div className={styles.wrap}>
    <header className={styles.hero}><div><small>TREINO ADAPTATIVO · ~5 MIN</small><h1>Hoje vamos fortalecer <em>{competencyLabels[focus].toLowerCase()}.</em></h1><p>O LuwiPi usa o progresso das aulas para escolher três missões curtas. Não substitui a aula; resolve pontos que precisam de repetição.</p></div><div className={styles.ring}><b>5</b><span>MIN</span></div></header>
    <section className={styles.plan}>
      {plan.map((mission,index) => <article key={`${mission.competency}-${index}`} className={styles.mission}><span className={styles.number}>0{index+1}</span><div className={styles.icon}>{mission.icon}</div><div className={styles.copy}><small>{competencyLabels[mission.competency]} · {mission.minutes} min</small><h2>{mission.title}</h2><p>{mission.description}</p></div><Link href={mission.href}>COMEÇAR →</Link></article>)}
    </section>
    <footer className={styles.footer}><span>{ready ? "Plano calculado a partir do progresso guardado neste dispositivo." : "A preparar o treino…"}</span><Link href={`/curriculo?age=${age}`}>Ver mapa de competências</Link></footer>
  </div>;
}
