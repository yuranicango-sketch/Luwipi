import { createDecipheriv } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type DriveStudent={id:string;name:string;age_group:"2-4"|"5-8"|"adult";guardian_name:string|null;notes:string|null;created_at:string};
export type DriveGroup={id:string;name:string;studentIds:string[];created_at:string};
type Roster={version:1;students:DriveStudent[];groups:DriveGroup[]};

function decrypt(value:string){
 const key=Buffer.from(process.env.GOOGLE_TOKEN_ENCRYPTION_KEY||"","base64");
 if(key.length!==32) throw new Error("drive_encryption_not_configured");
 const [ivB64,tagB64,dataB64]=value.split(".");
 const decipher=createDecipheriv("aes-256-gcm",key,Buffer.from(ivB64,"base64"));
 decipher.setAuthTag(Buffer.from(tagB64,"base64"));
 return Buffer.concat([decipher.update(Buffer.from(dataB64,"base64")),decipher.final()]).toString("utf8");
}
async function accessToken(userId:string){
 const admin=createAdminSupabaseClient();if(!admin)throw new Error("server_not_configured");
 const {data}=await admin.from("profiles").select("google_drive_refresh_token_enc").eq("id",userId).maybeSingle();
 if(!data?.google_drive_refresh_token_enc)throw new Error("drive_not_connected");
 const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:process.env.GOOGLE_CLIENT_ID||"",client_secret:process.env.GOOGLE_CLIENT_SECRET||"",refresh_token:decrypt(data.google_drive_refresh_token_enc),grant_type:"refresh_token"})});
 const j=await r.json();if(!r.ok||!j.access_token)throw new Error("drive_token_failed");return String(j.access_token);
}
async function drive(token:string,path:string,init:RequestInit={}){
 const r=await fetch("https://www.googleapis.com/drive/v3"+path,{...init,headers:{Authorization:`Bearer ${token}`,...(init.headers||{})}});
 if(!r.ok)throw new Error("drive_request_failed");return r;
}
async function fileId(token:string){
 const q=encodeURIComponent("name='luwipi-dados.json' and trashed=false");
 const list=await (await drive(token,`/files?q=${q}&spaces=drive&fields=files(id,name)&pageSize=1`)).json();
 if(list.files?.[0]?.id)return list.files[0].id as string;
 const meta=await fetch("https://www.googleapis.com/drive/v3/files",{method:"POST",headers:{Authorization:`Bearer ${token}`,"content-type":"application/json"},body:JSON.stringify({name:"luwipi-dados.json",mimeType:"application/json",appProperties:{app:"luwipi",kind:"teacher-roster"}})});
 const created=await meta.json();if(!meta.ok||!created.id)throw new Error("drive_create_failed");
 await saveById(token,created.id,{version:1,students:[],groups:[]});return created.id as string;
}
async function saveById(token:string,id:string,data:Roster){
 const r=await fetch(`https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=media`,{method:"PATCH",headers:{Authorization:`Bearer ${token}`,"content-type":"application/json"},body:JSON.stringify(data)});
 if(!r.ok)throw new Error("drive_save_failed");
}
export async function readRoster(userId:string):Promise<Roster>{const token=await accessToken(userId),id=await fileId(token);const r=await drive(token,`/files/${id}?alt=media`);const data=await r.json();return {version:1,students:Array.isArray(data.students)?data.students:[],groups:Array.isArray(data.groups)?data.groups:[]};}
export async function writeRoster(userId:string,data:Roster){const token=await accessToken(userId),id=await fileId(token);await saveById(token,id,data);}
