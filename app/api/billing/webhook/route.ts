import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function validSignature(raw:string,header:string,secret:string){
 const parts=Object.fromEntries(header.split(";").map(p=>p.split("=")));const ts=parts.ts,h1=parts.h1;if(!ts||!h1)return false;
 const expected=createHmac("sha256",secret).update(`${ts}:${raw}`).digest("hex");
 try{return timingSafeEqual(Buffer.from(expected,"hex"),Buffer.from(h1,"hex"));}catch{return false}
}
export async function POST(request:Request){
 const secret=process.env.PADDLE_WEBHOOK_SECRET;if(!secret)return NextResponse.json({error:"not_configured"},{status:503});
 const raw=await request.text(),sig=request.headers.get("paddle-signature")||"";
 if(!validSignature(raw,sig,secret))return NextResponse.json({error:"invalid_signature"},{status:401});
 const event=JSON.parse(raw),admin=createAdminSupabaseClient();if(!admin)return NextResponse.json({error:"server_not_configured"},{status:503});
 const eventId=String(event.event_id||"");if(!eventId)return NextResponse.json({error:"invalid_event"},{status:400});
 const {data:seen}=await admin.from("billing_webhook_events").select("event_id").eq("event_id",eventId).maybeSingle();if(seen)return NextResponse.json({ok:true,duplicate:true});
 const d=event.data||{},userId=d.custom_data?.user_id as string|undefined;
 if(userId){
  const type=String(event.event_type||"");const subscriptionId=d.id?.startsWith?.("sub_")?d.id:d.subscription_id;const priceId=d.items?.[0]?.price?.id||d.items?.[0]?.price_id||null;
  if(["subscription.created","subscription.activated","subscription.updated","transaction.completed"].includes(type)){
   const until=d.current_billing_period?.ends_at||null;
   await admin.from("profiles").update({billing_provider:"paddle",paddle_customer_id:d.customer_id||null,paddle_subscription_id:subscriptionId||null,paddle_price_id:priceId,subscription_status:d.status||"active",access_status:"active",activated_at:new Date().toISOString(),access_until:until}).eq("id",userId).neq("role","admin");
  }
  if(["subscription.canceled","subscription.paused"].includes(type)){
   const until=d.current_billing_period?.ends_at||d.canceled_at||new Date().toISOString();
   await admin.from("profiles").update({billing_provider:"paddle",paddle_subscription_id:subscriptionId||null,subscription_status:d.status||"canceled",access_until:until}).eq("id",userId).neq("role","admin");
  }
 }
 await admin.from("billing_webhook_events").insert({event_id:eventId,event_type:String(event.event_type||"unknown")});
 return NextResponse.json({ok:true});
}
