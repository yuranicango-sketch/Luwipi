import type { AgeBand, CompetencyId } from "@/lib/suzuki-lessons";

export type SpiralMilestone = { competency: CompetencyId; ageBand: AgeBand; title: string; readyWhen: string };

export const spiralMilestones: SpiralMilestone[] = [
  { competency:"listening", ageBand:"2-3", title:"Escuta e imita contrastes", readyWhen:"Responde a modelos sonoros curtos em vários dias, mesmo com ajuda." },
  { competency:"listening", ageBand:"4-5", title:"Reproduz ecos curtos", readyWhen:"Guarda 2–3 sons ou pulsos e tenta responder sem demonstração contínua." },
  { competency:"listening", ageBand:"6-8", title:"Usa o ouvido para ajustar", readyWhen:"Compara o que tocou com o som interno e faz uma correção consciente." },

  { competency:"pulse", ageBand:"2-3", title:"Move-se num pulso comum", readyWhen:"Mantém alguns ciclos de marcha ou balanço sem acelerar continuamente." },
  { competency:"pulse", ageBand:"4-5", title:"Mantém pulso em corpo e tecla", readyWhen:"Sustenta uma sequência curta com o professor presente." },
  { competency:"pulse", ageBand:"6-8", title:"Mantém pulso dentro da frase", readyWhen:"A música continua apesar de um pequeno erro de nota." },

  { competency:"rhythm", ageBand:"2-3", title:"Imita padrões corporais simples", readyWhen:"Responde a 2–3 palmas ou passos com aproximação estável." },
  { competency:"rhythm", ageBand:"4-5", title:"Combina pulso e padrão", readyWhen:"Consegue manter o pulso enquanto reproduz um padrão curto." },
  { competency:"rhythm", ageBand:"6-8", title:"Lê e executa padrões conhecidos", readyWhen:"Transforma padrões ouvidos e vistos em execução sem perder continuidade." },

  { competency:"pitch", ageBand:"2-3", title:"Reconhece grave e agudo", readyWhen:"Distingue regiões sonoras por gesto, corpo ou escolha, sem depender da visão." },
  { competency:"pitch", ageBand:"4-5", title:"Percebe direção melódica", readyWhen:"Identifica quando um pequeno caminho sobe, desce ou repete." },
  { competency:"pitch", ageBand:"6-8", title:"Compara alturas relativas", readyWhen:"Encontra notas acima/abaixo de uma referência e transfere isso ao teclado." },

  { competency:"dynamics", ageBand:"2-3", title:"Distingue forte e suave", readyWhen:"Muda a intensidade sem confundir forte com bater." },
  { competency:"dynamics", ageBand:"4-5", title:"Controla intensidade em frases curtas", readyWhen:"Repete forte/suave mantendo o gesto confortável." },
  { competency:"dynamics", ageBand:"6-8", title:"Usa dinâmica com intenção", readyWhen:"Consegue escolher e repetir uma direção dinâmica numa peça." },

  { competency:"keyboard", ageBand:"2-3", title:"Distingue regiões do teclado", readyWhen:"Encontra grave/agudo e explora o instrumento sem medo." },
  { competency:"keyboard", ageBand:"4-5", title:"Reconhece grupos de 2 e 3", readyWhen:"Localiza grupos pretos em várias regiões sem etiquetas." },
  { competency:"keyboard", ageBand:"6-8", title:"Usa referências para se orientar", readyWhen:"Encontra notas-alvo a partir de padrões e pontos de referência." },

  { competency:"posture", ageBand:"2-3", title:"Habita o banco e o instrumento com conforto", readyWhen:"Aceita pequenos ajustes de posição sem transformar postura em tensão." },
  { competency:"posture", ageBand:"4-5", title:"Reconhece posição funcional", readyWhen:"Senta-se com apoio, braços livres e consegue voltar à posição depois de se mover." },
  { competency:"posture", ageBand:"6-8", title:"Ajusta a própria posição", readyWhen:"Percebe banco, pés e distância e faz pequenas correções com pouca ajuda." },

  { competency:"hand", ageBand:"2-3", title:"Toca sem apertar", readyWhen:"Pousa a mão e produz som sem rigidez persistente." },
  { competency:"hand", ageBand:"4-5", title:"Mantém forma funcional", readyWhen:"A mão conserva conforto durante pequenos padrões." },
  { competency:"hand", ageBand:"6-8", title:"Ajusta gesto à sonoridade", readyWhen:"Percebe tensão e recupera um movimento mais livre durante a música." },

  { competency:"fingers", ageBand:"2-3", title:"Descobre dedos sem isolamento forçado", readyWhen:"Move alguns dedos naturalmente sem exigir independência completa." },
  { competency:"fingers", ageBand:"4-5", title:"Usa dedos em pequenos caminhos", readyWhen:"Executa 2–4 notas com dedilhado simples sem colapsar a mão." },
  { competency:"fingers", ageBand:"6-8", title:"Controla dedilhado funcional", readyWhen:"Repete um padrão de cinco dedos ou dedilhado curto mantendo conforto e som." },

  { competency:"coordination", ageBand:"2-3", title:"Alterna ações entre as mãos", readyWhen:"Espera a vez de cada mão em jogos simples, sem exigência simultânea." },
  { competency:"coordination", ageBand:"4-5", title:"Coordena mãos por turnos", readyWhen:"Alterna pequenas respostas entre direita e esquerda mantendo o fluxo." },
  { competency:"coordination", ageBand:"6-8", title:"Combina funções das duas mãos", readyWhen:"Mantém uma função simples numa mão enquanto a outra toca uma frase curta." },

  { competency:"memory", ageBand:"2-3", title:"Reconhece e repete algo familiar", readyWhen:"Antecipar uma música ou gesto conhecido já faz parte da aula." },
  { competency:"memory", ageBand:"4-5", title:"Guarda pequenas sequências", readyWhen:"Repete um motivo curto depois de ouvir, com ajuda decrescente." },
  { competency:"memory", ageBand:"6-8", title:"Sustenta repertório aprendido", readyWhen:"Toca uma peça ou secção conhecida com pontos de referência claros e continuidade." },

  { competency:"reading", ageBand:"2-3", title:"Som antes de símbolo", readyWhen:"Não é objetivo formal; direção, sequência e memória estão a ser preparadas." },
  { competency:"reading", ageBand:"4-5", title:"Símbolos depois da experiência", readyWhen:"Relaciona padrões visuais simples a algo que já canta, move ou toca." },
  { competency:"reading", ageBand:"6-8", title:"Lê por referência e padrão", readyWhen:"Usa direção, repetição, passos e pontos de referência sem soletrar tudo." },
];
