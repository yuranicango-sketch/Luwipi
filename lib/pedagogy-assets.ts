export type PedagogyVisualKind="posture"|"hands"|"highlow"|"dynamics"|"rhythm"|"tempo"|"direction"|"listen"|"story"|"create"|"celebrate";
export type PedagogyAsset={src:string;alt:string;source:string;license:string;focus:string};
const local=(name:string,alt:string,focus:string):PedagogyAsset=>({src:"/assets/lessons/"+name+".svg",alt,focus,source:"Luwipi",license:"Original"});
export const actionFallbacks:Record<string,PedagogyAsset[]>={
"posture-center":[local("posture-center","Aluno alinhado com o centro do teclado.","ALINHAR AO CENTRO")],
"posture-distance":[local("posture-distance","Vista lateral mostrando banco, tronco, cotovelo e teclado.","DISTÂNCIA E COTOVELO")],
"posture-feet":[local("posture-feet","Pés apoiados enquanto o aluno está sentado ao piano.","APOIO DOS PÉS")],
"posture-relax":[local("posture-relax","Comparação entre ombros tensos e relaxados.","SOLTAR OMBROS E BRAÇOS")],
"hand-shape":[local("hand-shape","Sequência da mão relaxada até pousar no teclado.","FORMA NATURAL DA MÃO")],
"finger-numbering":[local("finger-numbering","Duas mãos com os dedos numerados de 1 a 5.","DEDOS 1–5")],
"keyboard-groups":[local("keyboard-groups","Teclado destacando grupos de duas e três teclas pretas.","GRUPOS DE 2 E 3")],
"middle-c":[local("middle-c","Teclado com o Dó central destacado.","DÓ CENTRAL")]};
export const pedagogyAssets:Partial<Record<PedagogyVisualKind,PedagogyAsset[]>>={
hands:[local("finger-numbering","Duas mãos com dedos numerados.","DEDOS 1–5")],highlow:[local("highlow","Teclado mostrando grave e agudo.","GRAVE · AGUDO")],dynamics:[local("dynamics","Comparação entre forte e suave.","FORTE · SUAVE")],rhythm:[local("rhythm","Batidas regulares para sentir pulsação.","PULSO E BATIDA")],tempo:[local("tempo","Comparação entre devagar e rápido.","DEVAGAR · RÁPIDO")],direction:[local("direction","Notas subindo e descendo.","SUBIR · DESCER")],listen:[local("listen","Escuta atenta.","OUVIR COM ATENÇÃO")],story:[local("story","História musical no teclado.","HISTÓRIA MUSICAL")],create:[local("create","Criação musical.","CRIAR")],celebrate:[local("celebrate","Celebração musical.","CONSEGUIU!")]};
