export type PedagogyVisualKind="posture"|"hands"|"highlow"|"dynamics"|"rhythm"|"tempo"|"direction"|"listen"|"story"|"create"|"celebrate";
export type PedagogyAsset={src:string;alt:string;source:string;license:string;focus:string};
export const pedagogyAssets:Partial<Record<PedagogyVisualKind,PedagogyAsset[]>>={
posture:[
{src:"https://openclipart.org/image/800px/301207",alt:"Criança ao teclado para observar posição geral do corpo em relação ao instrumento.",source:"OpenClipart · Playing keyboard #1",license:"Public domain",focus:"CORPO E DISTÂNCIA"},
{src:"https://openclipart.org/image/800px/317141",alt:"Criança ao teclado vista numa posição útil para conversar sobre braços e aproximação ao piano.",source:"OpenClipart · Playing keyboard #2",license:"Public domain",focus:"BRAÇOS E TECLADO"},
{src:"https://openclipart.org/image/800px/317669",alt:"Criança e professora ao teclado para observar preparação antes de tocar.",source:"OpenClipart · Playing keyboard #3",license:"Public domain",focus:"PREPARAR PARA TOCAR"}
],
hands:[{src:"https://freesvg.org/img/Human_hand_palm_inside_remix.png",alt:"Mão aberta mostrando os cinco dedos.",source:"FreeSVG / OpenClipart",license:"Public domain / CC0",focus:"DEDOS 1–5"}],
listen:[
{src:"https://openclipart.org/image/800px/318254",alt:"Criança com auscultadores representando escuta atenta.",source:"OpenClipart · Headphones",license:"Public domain",focus:"OUVIR COM ATENÇÃO"},
{src:"https://openclipart.org/image/800px/334621",alt:"Criança ouvindo música.",source:"OpenClipart · Girl Listening to Music",license:"Public domain",focus:"DESCOBRIR O SOM"}
],
rhythm:[
{src:"https://openclipart.org/image/800px/279772",alt:"Tambor de caixa para representar pulsação e ritmo.",source:"OpenClipart · Snare drum",license:"Public domain",focus:"PULSO E BATIDA"},
{src:"https://openclipart.org/image/800px/317725",alt:"Criança regendo música para representar pulsação corporal.",source:"OpenClipart · Conducting Music",license:"Public domain",focus:"SENTIR O PULSO"}
],
tempo:[
{src:"https://openclipart.org/image/800px/325110",alt:"Tartaruga alegre associada ao andamento devagar.",source:"OpenClipart · Happy turtle",license:"Public domain",focus:"DEVAGAR"},
{src:"https://openclipart.org/image/800px/321311",alt:"Comboio associado ao movimento e mudança de velocidade.",source:"OpenClipart · Steam Train",license:"Public domain",focus:"ANDAMENTO"}
],
highlow:[{src:"https://openclipart.org/image/800px/298035",alt:"Elefante associado ao som grave.",source:"OpenClipart · Elephant",license:"Public domain",focus:"GRAVE"}],
dynamics:[{src:"https://openclipart.org/image/800px/300870",alt:"Coelho associado ao toque suave.",source:"OpenClipart · Rabbit",license:"Public domain",focus:"SUAVE"}],
celebrate:[{src:"https://openclipart.org/image/800px/317183",alt:"Crianças celebrando uma conquista.",source:"OpenClipart · Students Can Do",license:"Public domain",focus:"CONSEGUIU!"}],
story:[{src:"https://openclipart.org/image/800px/317750",alt:"Crianças com teclado e notas musicais.",source:"OpenClipart · Flowing Notes",license:"Public domain",focus:"HISTÓRIA MUSICAL"}]
};