import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const prices={monthly:process.env.PADDLE_PRICE_MONTHLY,quarterly:process.env.PADDLE_PRICE_QUARTERLY,semiannual:process.env.PADDLE_PRICE_SEMIANNUAL} as const;
export async function POST(request:Request){
 const supabase=await createServerSupabaseClient();const user=(await supabase.auth.getUser()).data.user;
 if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
 const {plan}=await request.json();const price=prices[plan as keyof typeof prices];
 if(!price||!process.env.PADDLE_API_KEY)return NextResponse.json({error:"billing_not_configured"},{status:503});
 const base=process.env.PADDLE_ENV==="sandbox"?"https://sandbox-api.paddle.com":"https://api.paddle.com";
 const r=await fetch(base+"/transactions",{method:"POST",headers:{Authorization:`Bearer ${process.env.PADDLE_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({items:[{price_id:price,quantity:1}],custom_data:{user_id:user.id,plan},checkout:{url:(process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000")+"/assinar"}})});
 const j=await r.json();if(!r.ok)return NextResponse.json({error:"paddle_error"},{status:502});
 const url=j?.data?.checkout?.url;if(!url)return NextResponse.json({error:"checkout_unavailable"},{status:502});
 return NextResponse.json({url});
}
