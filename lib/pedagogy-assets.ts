export type PedagogyVisualKind="posture"|"hands"|"highlow"|"dynamics"|"rhythm"|"tempo"|"direction"|"listen"|"story"|"create"|"celebrate";
export type PedagogyAsset={src:string;alt:string;source:string;license:string;focus:string;role?:"good"|"bad"|"detail"};
export const pedagogyAssets:Partial<Record<PedagogyVisualKind,PedagogyAsset[]>>={
hands:[{src:"https://freesvg.org/img/Human_hand_palm_inside_remix.png",alt:"Mão aberta mostrando claramente os cinco dedos.",source:"FreeSVG / OpenClipart",license:"Public domain / CC0",focus:"DEDOS 1–5",role:"detail"}],
highlow:[{src:"https://openclipart.org/image/800px/298035",alt:"Elefante associado ao som grave.",source:"OpenClipart",license:"Public domain",focus:"SOM GRANDÃO · GRAVE",role:"detail"}],
dynamics:[{src:"https://openclipart.org/image/800px/300870",alt:"Coelho associado ao toque suave.",source:"OpenClipart",license:"Public domain",focus:"SUAVE",role:"detail"}]
};