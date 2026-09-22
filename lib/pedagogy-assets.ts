export type PedagogyVisualKind="posture"|"hands"|"highlow"|"dynamics"|"rhythm"|"tempo"|"direction"|"listen"|"story"|"create"|"celebrate";
export type PedagogyAsset={src:string;alt:string;source:string;license:string;focus:string};
export const pedagogyAssets:Partial<Record<PedagogyVisualKind,PedagogyAsset[]>>={
posture:[
{src:"https://upload.wikimedia.org/wikipedia/commons/7/73/The_posture_of_school_children%2C_with_its_home_hygiene_and_new_efficiency_methods_for_school_training_%281913%29_%2814592050670%29.jpg",alt:"Vista lateral histórica de uma criança ao piano mostrando postura incorreta quando os pés ficam sem apoio.",source:"Wikimedia Commons · The Posture of School Children (1913)",license:"No known copyright restrictions",focus:"PÉS SEM APOIO · O QUE EVITAR"},
{src:"https://1.bp.blogspot.com/-keszKKJYEvw/W9egs_rHBqI/AAAAAAAADeE/t9D11pZnnEoDsswSX9ytpSp9BuD0JbM3wCLcBGAs/s1600/piano%2Bbench.JPG",alt:"Criança vista de lado ao piano com banco ajustável e apoio para os pés, útil para observar altura, distância e estabilidade.",source:"Cecil Messer · bench-height reference",license:"Reference only",focus:"ALTURA · DISTÂNCIA · APOIO DOS PÉS"}
],
hands:[
{src:"https://freesvg.org/img/Human_hand_palm_inside_remix.png",alt:"Mão aberta mostrando claramente os cinco dedos para aprender a numeração 1 a 5.",source:"FreeSVG / OpenClipart · Human Hand Palm Inside Remix",license:"Public domain / CC0",focus:"DEDOS 1–5"},
{src:"https://miro.medium.com/0%2AgqQL9rm3s23jY0yc",alt:"Mão apoiada no teclado com dedos naturalmente curvos, usada como referência de forma da mão.",source:"Paul Poon Piano Studio · hand-position reference",license:"Reference only",focus:"FORMA DA MÃO NO TECLADO"}
],
highlow:[{src:"https://openclipart.org/image/800px/298035",alt:"Elefante como associação visual para um som grande e grave.",source:"OpenClipart · Elephant",license:"Public domain",focus:"SOM GRANDÃO · GRAVE"}],
dynamics:[{src:"https://openclipart.org/image/800px/300870",alt:"Coelho como associação visual para um toque leve e suave.",source:"OpenClipart · Rabbit",license:"Public domain",focus:"SUAVE"}]
};
export const distributablePedagogyAssets=(kind:PedagogyVisualKind)=>(pedagogyAssets[kind]??[]).filter(a=>!a.license.toLowerCase().includes("reference only"));