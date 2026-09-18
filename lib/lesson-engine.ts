import type {
  CurriculumVariant,
  EnhancedLesson,
  EnhancedModule,
} from "@/lib/curriculum-v3";
import type { AgeGroup } from "@/lib/curriculum";
import { lessonResourceSummary } from "@/lib/curriculum-resources";

export type LessonStep = {
  id: string;
  icon: string;
  title: string;
  duration: string;
  instruction: string;
  teacherCue?: string;
  actionLabel?: string;
  actionHref?: string;
};

function warmup(age: AgeGroup, lesson: EnhancedLesson) {
  if (age === "2-4") {
    return lesson.number <= 18
      ? "Comece em pé: 4 pulsações com o corpo, depois leve a ideia do dia imediatamente para o piano."
      : "Faça um eco curto com palmas ou voz e leve a resposta para o piano.";
  }

  return lesson.number <= 12
    ? "30 segundos de postura e respiração, 8 pulsações estáveis e uma pequena resposta no piano."
    : "Toque uma frase de 3–5 notas. O aluno identifica se repetiu, subiu ou desceu e responde no piano.";
}

function guidedActivity(age: AgeGroup, lesson: EnhancedLesson) {
  if (age === "2-4") {
    return `Transforme “${lesson.focus}” numa brincadeira física de 2–4 minutos e leve a mesma ideia para duas ou três teclas.`;
  }

  return `Demonstre “${lesson.focus}” num exemplo curto, peça ao aluno para repetir e aplique o mesmo conceito numa frase musical.`;
}

function creationInstruction(age: AgeGroup, lesson: EnhancedLesson) {
  if (lesson.checkpoint) {
    return age === "2-4"
      ? "Missão Luwipi: 1 desafio de ouvido, 1 de ritmo, 1 de teclado e uma mini música. Sem nota, ranking ou pressão."
      : "Missão Luwipi: 1 desafio rítmico, 1 de leitura/teclado, 1 de ouvido e um trecho de repertório. Registre apenas o que precisa de reforço.";
  }

  return age === "2-4"
    ? "Dê uma escolha: mudar o final, trocar a região do piano ou inventar uma resposta de 2–3 sons."
    : "Peça uma variação curta: mudar dinâmica, ritmo, final ou criar uma resposta de um compasso.";
}

export function buildLessonSteps(args: {
  age: AgeGroup;
  module: EnhancedModule;
  lesson: EnhancedLesson;
  variant: CurriculumVariant;
}): LessonStep[] {
  const { age, lesson, variant } = args;
  const resources = lessonResourceSummary(age, lesson.number, lesson.repertoire);
  const activityHref = resources.gameHref ?? lesson.activityRoute;

  return [
    {
      id: "warmup",
      icon: "👋",
      title: "Aquecimento",
      duration: age === "2-4" ? "2–3 min" : "3–5 min",
      instruction: warmup(age, lesson),
      teacherCue:
        "Comece antes de explicar. A criança deve fazer música nos primeiros minutos.",
    },
    {
      id: "discover",
      icon: age === "2-4" ? "🔎" : "🎯",
      title: "Descobrir a habilidade",
      duration: age === "2-4" ? "4–5 min" : "6–8 min",
      instruction: lesson.objective,
      teacherCue:
        variant.id === "2-3" || variant.id === "5-6"
          ? lesson.adaptation.younger
          : lesson.adaptation.older,
    },
    {
      id: "activity",
      icon: resources.game ? "🎮" : "🧩",
      title: resources.game
        ? resources.game.title
        : activityHref
          ? "Atividade Luwipi"
          : "Atividade guiada",
      duration: age === "2-4" ? "3–5 min" : "5–7 min",
      instruction: resources.game
        ? `${resources.game.goal} Faça uma sessão curta de ${resources.game.session}.`
        : guidedActivity(age, lesson),
      actionLabel: activityHref ? "ABRIR ATIVIDADE" : undefined,
      actionHref: activityHref,
    },
    {
      id: "repertoire",
      icon: "🎹",
      title: "Música no piano",
      duration: age === "2-4" ? "5–8 min" : "10–15 min",
      instruction: `Repertório: ${lesson.repertoire}. Trabalhe por frases curtas e termine tocando a maior parte possível da música sem repetição mecânica.`,
      teacherCue:
        "Se houver erro, isole apenas o ponto necessário e volte logo à música completa.",
      actionLabel: resources.songHref ? "ABRIR MÚSICA" : "ABRIR REPERTÓRIO",
      actionHref: resources.songHref ?? "/musicas",
    },
    {
      id: lesson.checkpoint ? "checkpoint" : "create",
      icon: lesson.checkpoint ? "🏁" : "✨",
      title: lesson.checkpoint ? "Missão Luwipi" : "Criar e responder",
      duration: age === "2-4" ? "2–4 min" : "4–6 min",
      instruction: creationInstruction(age, lesson),
      teacherCue:
        "Não há resposta única aqui. O objetivo é verificar compreensão e manter iniciativa musical.",
    },
    {
      id: "close",
      icon: "🌟",
      title: "Fechar a aula",
      duration: "2–3 min",
      instruction: `Critério de domínio: ${lesson.mastery}`,
      teacherCue: `Tarefa curta: ${lesson.homePractice}`,
      actionLabel: "PREPARAR TAREFA",
      actionHref: resources.homeworkHref,
    },
  ];
}
