import type { PedagogyVisualKind } from "@/lib/pedagogy-assets";

export type ActionVisualKey =
  | "posture-center" | "posture-distance" | "posture-feet" | "posture-relax"
  | "hand-shape" | "finger-numbering"
  | PedagogyVisualKind;

export function resolveActionVisual(text:string,stepId:string):ActionVisualKey|null {
 const w=text.toLowerCase();
 if(/meio do teclado|centro do teclado/.test(w)) return "posture-center";
 if(/distância|distancia|cotovelo/.test(w)) return "posture-distance";
 if(/apoio dos pés|apoio dos pes|pés|pes/.test(w)) return "posture-feet";
 if(/ombros|braços|bracos/.test(w)) return "posture-relax";
 if(/mão cair|mao cair|mão pousa|mao pousa|forma.*teclado|pulso/.test(w)) return "hand-shape";
 if(/dedo|1–2–3|1-2-3|polegar|indicador/.test(w)) return "finger-numbering";
 if(/ritmo|batid|palma|pulso|tambor/.test(w)) return "rhythm";
 if(/grave|agudo|grandão|pequenino|elefante|passarinho/.test(w)) return "highlow";
 if(/ouvi|escut|som escondido/.test(w)) return "listen";
 if(/rápid|rapido|devagar|trem/.test(w)) return "tempo";
 if(/forte|suave|leão|leao|coelh/.test(w)) return "dynamics";
 if(/subir|descer|escada/.test(w)) return "direction";
 if(stepId==="close") return "celebrate";
 if(stepId==="create") return "create";
 return null;
}
