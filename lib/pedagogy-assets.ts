export type PedagogyVisualKind="posture"|"hands"|"highlow"|"dynamics"|"rhythm"|"tempo"|"direction"|"listen"|"story"|"create"|"celebrate";
export type PedagogyAsset={src:string;alt:string;source:string;license:string;focus:string;role?:"good"|"bad"|"detail"};
export const pedagogyAssets:Partial<Record<PedagogyVisualKind,PedagogyAsset[]>>={
posture:[
{src:"https://images.squarespace-cdn.com/content/v1/60f721304b43371202e967dd/1629662576636-RPTZE5QIMZ0LT5VU4IK9/IMG_4511.jpg",alt:"Criança vista de lado ao piano com banco e apoio dos pés.",source:"Edmonton Suzuki Piano · referência de postura",license:"Reference only",focus:"CORPO · BRAÇOS · APOIO",role:"good"},
{src:"https://1.bp.blogspot.com/-keszKKJYEvw/W9egs_rHBqI/AAAAAAAADeE/t9D11pZnnEoDsswSX9ytpSp9BuD0JbM3wCLcBGAs/s1600/piano%2Bbench.JPG",alt:"Comparação lateral de alturas de banco e apoio dos pés ao piano.",source:"Cecil Messer · referência de altura do banco",license:"Reference only",focus:"ALTURA DO BANCO · PÉS",role:"detail"},
{src:"https://static.wixstatic.com/media/a27d24_04cb4b381831495faf65f181071cef78~mv2.jpg/v1/fill/w_934,h_852,al_c,q_85,enc_avif,quality_auto/a27d24_04cb4b381831495faf65f181071cef78~mv2.jpg",alt:"Guia lateral mostrando cabeça, costas, cotovelos, banco, joelhos e pés.",source:"MJ Piano Lessons · referência de alinhamento",license:"Reference only",focus:"ALINHAMENTO DO CORPO",role:"detail"}
],
hands:[
{src:"https://freesvg.org/img/Human_hand_palm_inside_remix.png",alt:"Mão aberta mostrando claramente os cinco dedos.",source:"FreeSVG / OpenClipart",license:"Public domain / CC0",focus:"DEDOS 1–5",role:"detail"},
{src:"https://sneakymusic.com.au/cdn/shop/files/Ladybug-Piano-Hand-Position-Toy-Sneaky-Music-66469588074569.jpg?v=1771304557",alt:"Comparação visual entre dedos arredondados com pulso alinhado e dedos achatados com pulso caído.",source:"Sneaky Music · referência de posição da mão",license:"Reference only",focus:"CURVAR DEDOS · ALINHAR PULSO",role:"good"}
],
highlow:[{src:"https://openclipart.org/image/800px/298035",alt:"Elefante associado ao som grave.",source:"OpenClipart",license:"Public domain",focus:"SOM GRANDÃO · GRAVE",role:"detail"}],
dynamics:[{src:"https://openclipart.org/image/800px/300870",alt:"Coelho associado ao toque suave.",source:"OpenClipart",license:"Public domain",focus:"SUAVE",role:"detail"}]
};