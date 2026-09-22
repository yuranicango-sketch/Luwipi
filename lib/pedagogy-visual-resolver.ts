import type { PedagogyVisualKind } from "@/lib/pedagogy-assets";

export type ActionVisualKey = "posture-center"|"posture-distance"|"posture-feet"|"posture-relax"|"hand-shape"|"finger-numbering"|"keyboard-groups"|"middle-c"|"note-values"|"staff-map"|"treble-clef"|"bass-clef"|"steps-skips"|"legato"|"staccato"|"intervals"|"chords"|PedagogyVisualKind;

export function resolveActionVisual(text:string,stepId:string):ActionVisualKey|null {
 const w=text.toLowerCase();
 if(/meio do teclado|centro do teclado/.test(w)) return "posture-center";
 if(/distância|distancia|cotovelo/.test(w)) return "posture-distance";
 if(/apoio dos pés|apoio dos pes|pés|pes/.test(w)) return "posture-feet";
 if(/ombros|braços|bracos/.test(w)) return "posture-relax";
 if(/mão cair|mao cair|mão pousa|mao pousa|forma.*teclado|posição da mão|posicao da mao/.test(w)) return "hand-shape";
 if(/dedo|1–2–3|1-2-3|polegar|indicador/.test(w)) return "finger-numbering";
 if(/2.*pretas|duas.*pretas|3.*pretas|três.*pretas|tres.*pretas|grupo.*pretas|casinhas/.test(w)) return "keyboard-groups";
 if(/dó central|do central|middle c/.test(w)) return "middle-c";
 if(/semínima|seminima|mínima|minima|semibreve|colcheia|pausa|valor/.test(w)) return "note-values";
 if(/grande pauta|linhas e espaços|linhas e espacos|pauta.*mapa/.test(w)) return "staff-map";
 if(/clave de sol/.test(w)) return "treble-clef";
 if(/clave de fá|clave de fa/.test(w)) return "bass-clef";
 if(/passo|salto|repetiç|repete.*sobe|repete.*desce/.test(w)) return "steps-skips";
 if(/legato|som ligado|ligar notas/.test(w)) return "legato";
 if(/staccato|som saltitante|sons curtos/.test(w)) return "staccato";
 if(/intervalo|2ª|3ª|4ª|5ª/.test(w)) return "intervals";
 if(/acorde|tríade|triade/.test(w)) return "chords";
 if(/ritmo|batid|palma|tambor|pulsaç/.test(w)) return "rhythm";
 if(/grave|agudo|grandão|pequenino|elefante|passarinho/.test(w)) return "highlow";
 if(/ouvi|escut|som escondido/.test(w)) return "listen";
 if(/rápid|rapido|devagar|trem/.test(w)) return "tempo";
 if(/forte|suave|leão|leao|coelh/.test(w)) return "dynamics";
 if(/subir|descer|escada/.test(w)) return "direction";
 if(stepId==="close") return "celebrate"; if(stepId==="create") return "create"; return null;
}
