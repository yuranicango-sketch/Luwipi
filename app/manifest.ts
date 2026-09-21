import type {MetadataRoute} from "next";
export default function manifest():MetadataRoute.Manifest{return {name:"Luwipi",short_name:"Luwipi",description:"Currículo e ferramentas para professores de piano infantil.",start_url:"/",display:"standalone",background_color:"#ffffff",theme_color:"#1686f5",icons:[{src:"/icon.svg",sizes:"any",type:"image/svg+xml"}]}}
