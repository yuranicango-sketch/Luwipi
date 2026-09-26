const PHONE = process.env.LUWIPI_ANGOLA_WHATSAPP;

function json(body,status=200){return new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"private, no-store"}})}

export async function GET(request){
  const country=(request.headers.get("x-vercel-ip-country")||"").toUpperCase();
  return json({angola:country==="AO",payment:country==="AO"?"whatsapp":"paddle"});
}

export async function POST(request){
  const country=(request.headers.get("x-vercel-ip-country")||"").toUpperCase();
  if(country!=="AO")return json({error:"not_available"},404);
  if(!PHONE)return json({error:"payment_contact_unavailable"},503);
  const body=await request.json().catch(()=>({}));
  const product=body.product==="aprenda"?"Aprenda":body.product==="ensine"?"Ensine":null;
  const plan=["monthly","quarterly","semiannual"].includes(body.plan)?body.plan:null;
  if(!product||!plan)return json({error:"invalid_request"},400);
  const labels={monthly:"mensal",quarterly:"trimestral",semiannual:"semestral"};
  const message=`Olá, quero ativar o Luwipi ${product}. Plano ${labels[plan]}.`;
  return json({url:`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`});
}
