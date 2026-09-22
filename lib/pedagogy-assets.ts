export type PedagogyVisualKind="posture"|"hands"|"highlow"|"dynamics"|"rhythm"|"tempo"|"direction"|"listen"|"story"|"create"|"celebrate";
export type PedagogyAsset={src:string;alt:string;source:string;license:string;focus:string};
export const pedagogyAssets:Partial<Record<PedagogyVisualKind,PedagogyAsset[]>>={
posture:[
{src:"https://images.squarespace-cdn.com/content/v1/55524b6ce4b02fc9d3e73f42/1610476036071-VDZZIBPF74GQC51XQJ6J/Footstools%2BGraphic",alt:"Vista lateral: costas alinhadas, antebraços ao nível do teclado e pés apoiados.",source:"Chinook School of Music",license:"Reference",focus:"CORPO · BRAÇOS · PÉS"},
{src:"https://upload.wikimedia.org/wikipedia/commons/1/17/Good_and_poor_posture.png",alt:"Comparação visual entre alinhamento corporal equilibrado e postura curvada.",source:"Wikimedia Commons",license:"Public domain",focus:"ALINHAMENTO · EVITAR TENSÃO"}
],
hands:[
{src:"https://freesvg.org/img/Human_hand_palm_inside_remix.png",alt:"Mão aberta para reconhecer e numerar os cinco dedos.",source:"FreeSVG / OpenClipart",license:"Public domain / CC0",focus:"DEDOS 1–5"},
{src:"https://i0.wp.com/rebekah.maxner.ca/wp-content/uploads/2019/01/img_4617-e1552429116930.jpg?fit=1400%2C933&ssl=1",alt:"Mão relaxada sobre o teclado com dedos naturalmente curvos.",source:"Rebekah Maxner · referência",license:"Reference",focus:"DEDOS CURVOS · PULSO LIVRE"}
],
rhythm:[{src:"https://assets01.sdd1.ch/assets/lbwp-cdn/mobilesport/files/1631173859/mobilesport_13.png",alt:"Professor e crianças reproduzindo padrões rítmicos com palmas.",source:"mobilesport.ch · referência",license:"Reference",focus:"OUVIR · BATER · REPETIR"}],
listen:[{src:"https://globalsymbols.com/uploads/production/image/imagefile/22609/17_22610_d6494f03-2c6b-42ec-b71b-1efacb0628c9.png",alt:"Símbolo visual de escuta atenta com mão junto ao ouvido e notas musicais.",source:"ARASAAC / Global Symbols · referência",license:"Reference",focus:"OUVIDOS PRONTOS · ESCUTAR"}],
highlow:[{src:"https://openclipart.org/image/800px/298035",alt:"Elefante associado a um som grande e grave.",source:"OpenClipart",license:"Public domain",focus:"GRAVE · SOM GRANDÃO"}],
dynamics:[{src:"https://openclipart.org/image/800px/300870",alt:"Coelho associado a um toque leve e suave.",source:"OpenClipart",license:"Public domain",focus:"SUAVE · LEVE"}]
};