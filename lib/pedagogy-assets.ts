export type PedagogyVisualKind="posture"|"hands"|"highlow"|"dynamics"|"rhythm"|"tempo"|"direction"|"listen"|"story"|"create"|"celebrate";
export const pedagogyAssets:Partial<Record<PedagogyVisualKind,{src:string;alt:string;source:string;license:string}>>={
posture:{src:"https://openclipart.org/image/800px/326854",alt:"Criança sentada ao piano, usada como referência visual para ajustar banco, corpo e distância do teclado.",source:"OpenClipart · African Kid Playing Piano",license:"Public domain"},
hands:{src:"https://freesvg.org/img/Human_hand_palm_inside_remix.png",alt:"Mão aberta mostrando palma e dedos para trabalhar numeração e consciência dos dedos.",source:"FreeSVG / OpenClipart · Human Hand Palm Inside Remix",license:"Public domain / CC0"},
highlow:{src:"https://openclipart.org/image/800px/298035",alt:"Elefante usado como associação visual para sons graves e pesados.",source:"OpenClipart · Elephant #1",license:"Public domain"},
dynamics:{src:"https://openclipart.org/image/800px/300870",alt:"Coelho usado como associação visual para toque suave.",source:"OpenClipart · Rabbit",license:"Public domain"}
};