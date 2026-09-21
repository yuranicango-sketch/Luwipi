import type {MetadataRoute} from "next";
export default function robots():MetadataRoute.Robots{return {rules:[{userAgent:"*",allow:["/","/privacidade","/termos"],disallow:["/admin","/dashboard","/professor","/api","/auth","/onboarding","/tarefa/"]}],sitemap:"https://luwipi.vercel.app/sitemap.xml",host:"https://luwipi.vercel.app"}}
