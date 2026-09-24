export type AgeBand = "2-3" | "4-5" | "6-8";
export type StudentState = "electric" | "steady" | "tired" | "sensitive";
export type MasteryLevel = "emergente" | "desenvolvimento" | "consolidado" | "independente";
export type BlockKind = "arrival" | "movement" | "ear" | "piano" | "repertoire" | "closing";
export type ScreenMode = "visual" | "minimal" | "off";

export const competencyLabels = {
  listening: "Escuta e imitação",
  pulse: "Pulso constante",
  rhythm: "Reprodução rítmica",
  pitch: "Grave, agudo e direção",
  dynamics: "Forte, suave e controlo do som",
  keyboard: "Orientação no teclado",
  posture: "Postura corporal",
  hand: "Forma e relaxamento da mão",
  fingers: "Controlo dos dedos",
  coordination: "Coordenação das duas mãos",
  memory: "Memória e repertório",
  reading: "Leitura musical progressiva",
} as const;

export type CompetencyId = keyof typeof competencyLabels;

export type LessonBlock = {
  id: string;
  kind: BlockKind;
  title: string;
  minutes: number;
  durationLabel?: string;
  objective: string;
  teacherCue: string;
  childCue: string;
  parentCue?: string;
  screenMode: ScreenMode;
  competencies: CompetencyId[];
};

export type LessonTemplate = {
  id: string;
  ageBand: AgeBand;
  level: "iniciante" | "em-progresso" | "avancado";
  title: string;
  shortTitle: string;
  repertoire: string;
  focus: CompetencyId[];
  blocks: LessonBlock[];
};

const b = (
  id: string,
  kind: BlockKind,
  title: string,
  minutes: number,
  objective: string,
  teacherCue: string,
  childCue: string,
  screenMode: ScreenMode,
  competencies: CompetencyId[],
  parentCue?: string,
): LessonBlock => ({ id, kind, title, minutes, objective, teacherCue, childCue, screenMode, competencies, ...(parentCue ? { parentCue } : {}) });

const close = (id: string, age: AgeBand) =>
  b(id + "-close", "closing", "Fechar com algo que conseguiu", age === "2-3" ? 2 : 3,
    "Terminar com segurança e vontade de voltar.",
    "Repita uma coisa que correu bem. Não introduza conteúdo novo no último minuto.",
    "Escolhe a tua parte favorita 🌱", "visual", ["memory"],
    "Observe o que foi repetido; será a base da prática em casa.");

const lesson = (
  id: string, ageBand: AgeBand, level: LessonTemplate["level"], title: string, repertoire: string,
  focus: CompetencyId[], movementTitle: string, movementCue: string, earTitle: string, earCue: string,
  pianoTitle: string, pianoCue: string, repCue: string,
): LessonTemplate => ({
  id, ageBand, level, title, shortTitle: title, repertoire, focus,
  blocks: [
    b(id + "-arrival", "arrival", "Chegada musical", 2, "Criar previsibilidade e escuta.", "Faça uma saudação curta e espere uma resposta livre.", "Olá 👋🎵", "visual", ["listening"], "Repita o mesmo ritual de chegada em casa apenas se a criança pedir. A previsibilidade vale mais do que a quantidade."),
    b(id + "-move", "movement", movementTitle, ageBand === "6-8" ? 3 : 4, "Levar o conceito para o corpo antes do instrumento.", movementCue, "Move o corpo com a música", "off", ["pulse","rhythm"], "Faça junto em vez de corrigir de fora. Pare enquanto ainda está divertido."),
    b(id + "-ear", "ear", earTitle, ageBand === "2-3" ? 4 : 5, "Ouvir, guardar e responder sem pressão.", earCue, "Escuta primeiro 👂", "minimal", ["listening", focus.includes("pitch") ? "pitch" : "memory"], "Dê tempo para a criança responder. Não revele a resposta depressa nem transforme a escuta em teste."),
    b(id + "-piano", "piano", pianoTitle, ageBand === "2-3" ? 8 : 10, "Transferir a experiência para o teclado com conforto.", pianoCue, "Agora no piano 🎹", "off", focus.filter((item) => ["keyboard","posture","hand","fingers","coordination","dynamics","reading","memory"].includes(item)).slice(0,3) as CompetencyId[], "Observe o gesto do professor e repita em casa sem forçar."),
    b(id + "-rep", "repertoire", repertoire, ageBand === "2-3" ? 6 : 7, "Dar nome e significado musical à competência.", repCue, "Esta é a tua música 🎵", "minimal", ["memory", focus.includes("pulse") ? "pulse" : "listening"], "Ouçam ou cantem a peça familiarmente. Em casa, repetir pouco e com som bonito é melhor do que repetir até cansar."),
    close(id, ageBand),
  ],
});

export const lessonTemplates: LessonTemplate[] = [
  lesson("23-hello","2-3","iniciante","Olá, Piano","Brilha, Brilha, Estrelinha",["listening","keyboard","pitch"],"Gigante e passarinho","Andem pesado no grave e leves no agudo. Sem ecrã.","Onde mora o som?","Toque grave/agudo fora do campo visual; convide outra tentativa sem dizer errado.","Primeiro encontro com as teclas","Modele um toque suave; deixe a criança explorar por turnos curtos.","Cante e marque o pulso no colo ou numa tecla."),
  lesson("23-bear-bird","2-3","iniciante","O Elefante e o Passarinho","Brilha, Brilha, Estrelinha",["pitch","listening","keyboard"],"Passos do elefante e voo do passarinho","Elefante: passos lentos e pesados no grave. Passarinho: braços leves no agudo. Troque quando o som muda.","Quem cantou?","Toque dois extremos do piano escondendo as mãos. Dê tempo para responder por gesto.","Encontra a casa","Leve o elefante para a região grave e o passarinho para a região aguda. Depois use os grupos de 2 e 3 como mapa.","Cante a mesma música em duas regiões e deixe a criança responder com gesto."),
  lesson("23-walk","2-3","iniciante","Caminha Comigo","Marcha, Soldado",["pulse","rhythm","listening"],"Marcha e congela","Marchem ao pulso. Pare: todos congelam. Retome sem discurso.","Eco de palmas","Faça 2–3 palmas regulares; espere a resposta.","Um passo, um som","Uma tecla confortável por pulso. Se acelerar, volte ao corpo.","Cantem Marcha, Soldado marcando apenas o pulso."),
  lesson("23-dynamics","2-3","em-progresso","Forte como Leão, Suave como Ratinho","Ciranda, Cirandinha",["dynamics","hand","listening"],"Grande e pequenino","Gestos grandes para forte e pequenos para suave; forte nunca é bater.","Leão ou ratinho?","Toque a mesma nota em duas intensidades.","Som bonito","Modele intensidade com braço solto; faça três repetições curtas.","Escolha uma frase forte e outra suave na canção."),
  lesson("23-first-song","2-3","avancado","Minha Primeira Música","Brilha, Brilha, Estrelinha — motivo inicial",["memory","listening","keyboard"],"Desenhar a música no ar","Faça a direção do motivo com braços e deixe a criança imitar.","Igual ou mudou?","Repita o motivo ou mude uma nota; a criança responde com gesto.","Motivo em pequenos pedaços","Mostre 1–2 notas e espere imitação. Repetir é permitido.","A criança toca o pedaço que sabe sem correções durante a pequena apresentação."),

  lesson("45-beautiful-sound","4-5","iniciante","Som Bonito","Brilha, Brilha, Estrelinha",["posture","hand","dynamics"],"Braços pesados, mãos leves","Solte ombros e braços antes de chegar ao piano.","Qual som queres guardar?","Compare um som tenso e um controlado sem transformar em prova.","Mão em concha","Ajuste banco, pés e distância; toque com mão confortável.","Use apenas um trecho já conhecido e procure qualidade antes de quantidade."),
  lesson("45-echo","4-5","iniciante","Eco Musical","Maria Tinha um Cordeirinho",["listening","memory","rhythm"],"Eco com corpo","Palmas, joelhos e passos: um padrão de cada vez.","Eco de 2 e 3 sons","Toque dois sons, depois três; volte a dois se necessário.","Eco no teclado","Use notas próximas. Mostre, retire as mãos e espere.","Construa o início do Cordeirinho por imitação em fragmentos mínimos."),
  lesson("45-keyboard-groups","4-5","iniciante","As Teclas Moram em Grupos","O Sapo Não Lava o Pé",["keyboard","pitch","fingers"],"Duplas e trios","Dois passos, pausa; três passos, pausa.","Sobe ou desce?","Toque pequenos caminhos e peça gesto de direção.","Caça às teclas pretas","Encontre grupos de 2 e 3 sem autocolantes em várias regiões.","Cante O Sapo e marque pulsos em grupos pretos escolhidos."),
  lesson("45-direction","4-5","em-progresso","Subindo e Descendo","Ciranda, Cirandinha",["pitch","keyboard","memory"],"Escada do corpo","Agache e suba com o som; inverta no descendente.","Para onde foi?","Toque três notas por graus conjuntos; a criança aponta direção.","Passos vizinhos","Escolha três teclas vizinhas e faça padrões lentos sem pauta.","Cante um trecho e acompanhe a direção com gesto antes de tocar."),
  lesson("45-first-piece","4-5","avancado","Toco Uma Música!","Maria Tinha um Cordeirinho",["memory","hand","pulse"],"Pulso no corpo","Marquem o pulso andando ou balançando e parem enquanto está fácil.","Começa igual?","Compare o início de duas frases conhecidas.","Juntar os pedaços","Reveja fragmentos e junte dois por vez; se houver tensão, separe.","Toque do início ao fim sem interromper por pequenos erros."),

  lesson("68-body-piano","6-8","iniciante","Meu Corpo Toca Piano","Ode à Alegria — motivo inicial",["posture","hand","fingers"],"Mapa do corpo","Ajuste pés, banco, braços e ombros com movimentos grandes.","Som livre ou som preso?","Compare dois ataques e deixe a criança descrever o que ouviu.","Cinco dedos confortáveis","Toque padrões curtos procurando gesto livre e som estável.","Aplique o gesto confortável a um motivo conhecido."),
  lesson("68-hear-find","6-8","iniciante","Ouço, Encontro, Toco","Brilha, Brilha, Estrelinha",["listening","pitch","keyboard"],"Direção no espaço","Faça gestos de direção para padrões curtos.","Igual, acima ou abaixo?","Dê uma nota de referência e compare a segunda.","Encontrar pelo som","Limite a região e deixe a criança procurar antes de mostrar nomes.","Trabalhe o começo da música pelo ouvido antes de olhar símbolos."),
  lesson("68-rhythm","6-8","em-progresso","Ritmo Vira Música","Marcha, Soldado",["pulse","rhythm","coordination"],"Passos + palmas","Passos no pulso; palmas no padrão. Troquem papéis.","Eco rítmico","Faça um compasso curto e espere a devolução.","Ritmo numa nota, depois frase","Estabilize o padrão numa nota antes de acrescentar alturas.","Toque a marcha mantendo pulso mesmo com pequenos deslizes."),
  lesson("68-reading","6-8","em-progresso","Começo a Ler o Que Já Ouço","Ode à Alegria — frase conhecida",["reading","memory","pitch"],"Linha que sobe e desce","Desenhe o contorno no ar enquanto cantam.","Onde muda?","Aponte no mapa visual onde a frase muda de direção.","Do ouvido para a pauta","Mostre a frase já conhecida; leia por direção, repetição e referência.","Use a pauta como guia de uma frase que já existe no ouvido."),
  lesson("68-performance","6-8","avancado","Minha Primeira Performance","Peça escolhida do repertório atual",["memory","coordination","dynamics"],"Frase no corpo","Faça gestos para começo, caminho e final.","O que queres guardar?","Ouçam um trecho curto e escolham uma qualidade para manter.","Ensaio com um objetivo","Escolha só um foco: pulso, som, final ou transição.","Faça uma performance inteira sem correções no meio."),
];

export const fallbackBlocks: Record<BlockKind, LessonBlock[]> = {
  arrival: [b("alt-arrival","arrival","Saudação em eco",2,"Chegar com previsibilidade.","Faça uma pequena saudação musical e espere resposta livre.","Olá em música 👋","visual",["listening"])],
  movement: [
    b("alt-move-1","movement","Marcha e congela",3,"Recuperar pulso e atenção.","Marchem oito pulsos e congelem no silêncio.","🚶 → 🧊","off",["pulse","rhythm"]),
    b("alt-move-2","movement","Espelho",3,"Regular atenção pela imitação.","Faça movimentos lentos; depois troquem papéis.","Eu espelho-te","off",["listening"]),
  ],
  ear: [
    b("alt-ear-1","ear","Igual ou diferente?",4,"Escutar sem pressão.","Toque dois padrões e convide resposta por gesto.","Igual… ou mudou?","minimal",["listening","memory"]),
    b("alt-ear-2","ear","Acima ou abaixo?",4,"Ouvir direção relativa.","Compare duas alturas e deixe apontar para cima/baixo.","⬆️ ou ⬇️","minimal",["pitch","listening"]),
  ],
  piano: [b("alt-piano","piano","Som bonito por turnos",6,"Voltar ao instrumento com baixa exigência.","Professor toca um som; criança responde com um som.","Um som de cada vez 🎹","off",["hand","listening"])],
  repertoire: [b("alt-rep","repertoire","Música favorita",5,"Reforçar vínculo com repertório.","Escolha uma peça conhecida para cantar, marcar pulso ou tocar trecho.","Escolhe uma música 🎵","minimal",["memory"])],
  closing: [close("alt","4-5")],
};

const wildcard = (block: LessonBlock): LessonBlock => ({ ...block, minutes: 1.25, durationLabel: "60–90 s · sem cronómetro" });

export const wildcardActivities: Record<AgeBand, LessonBlock[]> = {
  "2-3": [
    wildcard(b("wild-23-a","movement","Estátua Musical",1,"Mudar o estado de atenção.","Cante/toque; a criança move-se. Pare: todos congelam.","Move… para! 🧊","off",["pulse"])),
    wildcard(b("wild-23-b","ear","Quem fez o som?",1,"Redirecionar atenção para escuta.","Faça um som escondido e convide a descobrir.","Onde está o som? 👂","minimal",["listening"])),
  ],
  "4-5": [
    wildcard(b("wild-45-a","movement","Maestro por 60 segundos",1,"Trocar controlo e recuperar envolvimento.","A criança decide quando todos mexem e param.","Tu és o maestro 🎼","off",["pulse","listening"])),
    wildcard(b("wild-45-b","ear","Eco Surpresa",1,"Recuperar foco por imitação curta.","Faça três ecos muito simples.","Copia o eco 👂","minimal",["rhythm","listening"])),
  ],
  "6-8": [
    wildcard(b("wild-68-a","piano","Desafio de 3 sons",1,"Reiniciar foco com meta pequena.","Toque três sons; a criança procura/repite.","3 sons. Só isso. 🎹","minimal",["listening","memory"])),
    wildcard(b("wild-68-b","movement","Troca de papéis",1,"Quebrar fadiga cognitiva.","A criança inventa um padrão corporal; o professor copia.","Agora tu ensinas","off",["rhythm"])),
  ],
};

export function lessonsForAge(ageBand: AgeBand) {
  return lessonTemplates.filter((item) => item.ageBand === ageBand);
}

export function stateLabel(state: StudentState) {
  return ({ electric: "Elétrica", steady: "Normal", tired: "Cansada", sensitive: "Sensível" } as const)[state];
}

export function totalMinutes(blocks: LessonBlock[]) {
  return blocks.reduce((sum, item) => sum + item.minutes, 0);
}

export function applySafeRepeatVariation(blocks: LessonBlock[], repetitionCount: number) {
  if (repetitionCount <= 0) return { blocks, applied: false };
  const preferred: BlockKind[] = repetitionCount % 2 === 0 ? ["movement","arrival"] : ["ear","movement"];
  const index = blocks.findIndex((item) => preferred.includes(item.kind) && item.kind !== "piano" && item.kind !== "repertoire");
  if (index < 0) return { blocks, applied: false };
  const target = blocks[index];
  const varied: LessonBlock = {
    ...target,
    id: target.id + "-variation-" + repetitionCount,
    teacherCue: target.teacherCue + " Nesta repetição, mude apenas quem lidera ou a ordem de duas ações; mantenha objetivo e dificuldade.",
    childCue: target.kind === "movement" ? target.childCue + " · Agora tu escolhes quem começa" : target.childCue,
  };
  return { blocks: blocks.map((item, i) => i === index ? varied : item), applied: true };
}
