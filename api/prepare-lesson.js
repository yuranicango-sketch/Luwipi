function json(body,status=200){
  return Response.json(body,{status,headers:{"cache-control":"private, no-store"}});
}

function cfg(){
  const requestedModel=String(process.env.OPENAI_MODEL||"").trim();
  const model=!requestedModel||requestedModel==="gpt-6-sol"?"gpt-5.6-sol":requestedModel;
  return {
    url:process.env.SUPABASE_URL||"",
    pub:process.env.SUPABASE_PUBLISHABLE_KEY||"",
    openai:process.env.OPENAI_API_KEY||"",
    model
  };
}

async function authenticated(request){
  const c=cfg();
  const auth=request.headers.get("authorization")||"";
  const token=auth.startsWith("Bearer ")?auth.slice(7):"";
  if(!token||!c.url||!c.pub)return null;
  const userResponse=await fetch(c.url+"/auth/v1/user",{headers:{apikey:c.pub,authorization:"Bearer "+token}});
  if(!userResponse.ok)return null;
  const user=await userResponse.json();
  const profileResponse=await fetch(
    c.url+"/rest/v1/profiles?id=eq."+encodeURIComponent(user.id)+"&select=role,access_status,trial_ends_at,access_until&limit=1",
    {headers:{apikey:c.pub,authorization:"Bearer "+token}}
  );
  if(!profileResponse.ok)return null;
  const profile=(await profileResponse.json())[0];
  if(!profile)return null;
  const now=Date.now();
  const allowed=
    profile.role==="admin"||
    (profile.access_status==="active"&&(!profile.access_until||new Date(profile.access_until).getTime()>now))||
    (profile.access_status==="trial"&&profile.trial_ends_at&&new Date(profile.trial_ends_at).getTime()>now);
  return allowed?{user,profile}:null;
}

const METHODS=["Dalcroze","Gordon","Orff","Suzuki","Kodály","Luwipi"];
const RESOURCES=[
  "",
  "Toca a luz","Segue a luz","Toca e segura","Bate com a luz","Sobe a luz","Desce a luz","Toca livre",
  "Caça à Nota","Sobe ou Desce?","Eco do Piano","Copia o Tambor","Fecha o Compasso","Leitura","Duração","Músicas"
];

const PLAN_SCHEMA={
  type:"object",
  additionalProperties:false,
  properties:{
    longGoal:{type:"string"},
    longWhy:{type:"string"},
    cycleName:{type:"string"},
    cycleRule:{type:"string"},
    holdRule:{type:"string"},
    monthGoal:{type:"string"},
    methods:{
      type:"array",
      items:{type:"string",enum:METHODS}
    },
    lessons:{
      type:"array",
      items:{
        type:"object",
        additionalProperties:false,
        properties:{
          intention:{type:"string"},
          observe:{type:"string"},
          easyHint:{type:"string"},
          hardHint:{type:"string"},
          blocks:{
            type:"array",
            items:{
              type:"object",
              additionalProperties:false,
              properties:{
                min:{type:"integer"},
                title:{type:"string"},
                description:{type:"string"},
                method:{type:"string",enum:METHODS},
                resource:{type:"string",enum:RESOURCES}
              },
              required:["min","title","description","method","resource"]
            }
          }
        },
        required:["intention","observe","easyHint","hardHint","blocks"]
      }
    }
  },
  required:["longGoal","longWhy","cycleName","cycleRule","holdRule","monthGoal","methods","lessons"]
};

function text(value,max){
  return String(value??"").trim().slice(0,max);
}
function int(value,min,max,fallback){
  const n=Number(value);
  if(!Number.isFinite(n))return fallback;
  return Math.min(max,Math.max(min,Math.round(n)));
}
function safeInput(raw){
  const approachAllowed=new Set(["luwipi","gordon","dalcroze","orff","suzuki","kodaly"]);
  const experienceAllowed=new Set(["first","exploring","songs","reading"]);
  const durationAllowed=new Set([30,35,40,45]);
  const frequencyAllowed=new Set([1,2,3]);
  const age=int(raw.age,2,9,NaN);
  const duration=Number(raw.duration);
  const frequency=Number(raw.frequency);
  const experience=text(raw.experience,24);
  const approach=text(raw.approach,24);
  if(!Number.isFinite(age)||!durationAllowed.has(duration)||!frequencyAllowed.has(frequency))return null;
  if(!experienceAllowed.has(experience)||!approachAllowed.has(approach))return null;
  return {
    age,
    duration,
    frequency,
    experience,
    approach,
    profile:text(raw.profile,500),
    priority:text(raw.priority,120),
    isGroup:Boolean(raw.isGroup),
    groupSize:int(raw.groupSize,2,20,5),
    instruments:int(raw.instruments,1,10,1)
  };
}

function approachName(value){
  return {
    luwipi:"Luwipi — combinar cada método apenas no seu ponto forte",
    gordon:"Gordon MLT",
    dalcroze:"Dalcroze",
    orff:"Orff",
    suzuki:"Suzuki",
    kodaly:"Kodály"
  }[value]||"Luwipi";
}
function experienceName(value){
  return {
    first:"primeiras aulas",
    exploring:"já explora o piano",
    songs:"já toca pequenas melodias",
    reading:"já começou a ler partitura"
  }[value]||"primeiras aulas";
}

function developerPrompt(input){
  const lessonCount=Math.min(12,Math.max(4,input.frequency*4));
  return `És o motor pedagógico do Luwipi Ensine. Cria um plano mensal de piano pronto para um professor aplicar em aula.

Princípio central do Luwipi:
OUVIR → SENTIR/MOVER → IMITAR → TOCAR → ASSOCIAR/NOMEAR → LER → CRIAR.
O calendário nunca obriga o avanço. A evidência musical determina o avanço.

Usa os métodos com precisão:
- Dalcroze: movimento, pulso, coordenação e experiência corporal.
- Gordon: audição, padrões, audiação e aprendizagem auditiva antes do símbolo.
- Orff: jogo, exploração, improvisação, criação e atividade de grupo.
- Suzuki: escuta, imitação, repetição de qualidade e repertório progressivo.
- Kodály: canto, ouvido interno e literacia preparada musicalmente.
- Luwipi: ligação funcional entre ferramentas e atividades próprias da plataforma.

Regras obrigatórias:
1. Gera exatamente ${lessonCount} aulas, correspondentes a ${input.frequency} aula(s) por semana durante quatro semanas.
2. Cada aula tem exatamente ${input.duration} minutos. A soma dos blocos de cada aula deve ser exatamente ${input.duration}.
3. Não repitas a mesma aula. Mantém continuidade, revisão e progressão.
4. Respeita a idade. Para 2–5 anos usa blocos curtos, experiência, movimento, ouvido, imitação e jogo; não antecipes leitura formal. Para 6–9 anos podes aumentar leitura e independência, sempre sustentadas por ouvido e pulso.
5. Se a abordagem for um método específico, constrói o plano principalmente a partir desse método sem caricaturá-lo. Se for Luwipi, combina os métodos pelos seus pontos fortes.
6. Usa a prioridade do professor quando existir. Caso contrário, decide o foco a partir da idade, experiência e perfil.
7. Não inventes diagnósticos nem linguagem clínica.
8. Escreve em português claro e profissional. Cada descrição deve dizer ao professor exatamente o que fazer.
9. Só podes indicar como recurso interno um destes nomes, exatamente como escrito: Toca a luz; Segue a luz; Toca e segura; Bate com a luz; Sobe a luz; Desce a luz; Toca livre; Caça à Nota; Sobe ou Desce?; Eco do Piano; Copia o Tambor; Fecha o Compasso; Leitura; Duração; Músicas. Quando não houver recurso adequado, usa string vazia.
10. O nome do aluno nunca é enviado para ti. Não peças nem inventes nomes.
11. O foco mensal deve ser observável. A regra de não avanço deve explicar qual evidência ainda falta.
12. Evita texto decorativo. Produz um plano aplicável, específico e musicalmente coerente.
13. Mantém cada descrição objetiva, normalmente em uma ou duas frases curtas, para o plano ficar rápido de gerar e fácil de usar em aula.

Dados da aula:
- Idade: ${input.age} anos
- Experiência: ${experienceName(input.experience)}
- Frequência: ${input.frequency}x por semana
- Duração: ${input.duration} minutos
- Formato: ${input.isGroup?`grupo de ${input.groupSize}, com ${input.instruments} piano(s)/teclado(s)`:"individual"}
- Abordagem: ${approachName(input.approach)}
- Perfil pedagógico: ${input.profile||"não informado"}
- Prioridade do professor: ${input.priority||"não informada"}`;
}

function outputText(response){
  const out=[];
  for(const item of response&&Array.isArray(response.output)?response.output:[]){
    if(item&&item.type==="message"&&Array.isArray(item.content)){
      for(const part of item.content){
        if(part&&part.type==="output_text"&&typeof part.text==="string")out.push(part.text);
      }
    }
  }
  return out.join("");
}

function normalizePlan(plan,input){
  if(!plan||typeof plan!=="object"||!Array.isArray(plan.lessons))throw new Error("invalid_plan");
  const expected=Math.min(12,Math.max(4,input.frequency*4));
  if(plan.lessons.length!==expected)throw new Error("invalid_lesson_count");
  const cleanText=(v,max=700)=>text(v,max);
  const lessons=plan.lessons.map((lesson)=>{
    if(!lesson||!Array.isArray(lesson.blocks)||lesson.blocks.length<3||lesson.blocks.length>9)throw new Error("invalid_blocks");
    const blocks=lesson.blocks.map(block=>({
      min:int(block.min,1,input.duration,1),
      title:cleanText(block.title,90),
      description:cleanText(block.description,420),
      method:METHODS.includes(block.method)?block.method:"Luwipi",
      resource:RESOURCES.includes(block.resource)?block.resource:""
    }));
    let sum=blocks.reduce((s,b)=>s+b.min,0);
    let diff=input.duration-sum;
    if(diff!==0){
      for(let i=blocks.length-1;i>=0&&diff!==0;i--){
        const room=diff>0?input.duration-blocks[i].min:blocks[i].min-1;
        const delta=Math.sign(diff)*Math.min(Math.abs(diff),Math.max(0,room));
        blocks[i].min+=delta;
        diff-=delta;
      }
    }
    if(blocks.reduce((s,b)=>s+b.min,0)!==input.duration)throw new Error("invalid_duration");
    return {
      intention:cleanText(lesson.intention,420),
      observe:cleanText(lesson.observe,420),
      easyHint:cleanText(lesson.easyHint,320),
      hardHint:cleanText(lesson.hardHint,320),
      blocks
    };
  });
  const methods=[...new Set((Array.isArray(plan.methods)?plan.methods:[]).filter(x=>METHODS.includes(x)))];
  return {
    longGoal:cleanText(plan.longGoal,500),
    longWhy:cleanText(plan.longWhy,700),
    cycleName:cleanText(plan.cycleName,140),
    cycleRule:cleanText(plan.cycleRule,420),
    holdRule:cleanText(plan.holdRule,420),
    monthGoal:cleanText(plan.monthGoal,700),
    methods:methods.length?methods:["Luwipi"],
    lessons
  };
}

export async function POST(request){
  if(!(await authenticated(request)))return json({error:"unauthorized"},401);
  const c=cfg();
  if(!c.openai)return json({error:"planner_not_configured"},503);

  let raw;
  try{
    raw=await request.json();
  }catch{
    return json({error:"invalid_request"},400);
  }
  const input=safeInput(raw||{});
  if(!input)return json({error:"invalid_request"},400);

  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),95000);
  try{
    const response=await fetch("https://api.openai.com/v1/responses",{
      method:"POST",
      headers:{
        "content-type":"application/json",
        "authorization":"Bearer "+c.openai
      },
      body:JSON.stringify({
        model:c.model,
        store:false,
        reasoning:{effort:"low"},
        max_output_tokens:12000,
        input:[
          {role:"developer",content:developerPrompt(input)},
          {role:"user",content:"Gera agora o plano mensal seguindo exatamente o esquema pedido."}
        ],
        text:{
          verbosity:"low",
          format:{
            type:"json_schema",
            name:"luwipi_lesson_plan",
            strict:true,
            schema:PLAN_SCHEMA
          }
        }
      }),
      signal:controller.signal
    });
    const body=await response.json().catch(()=>null);
    if(!response.ok){
      console.error("OpenAI planner failed",response.status,body&&body.error&&body.error.type,body&&body.error&&body.error.code,c.model);
      if(response.status===429)return json({error:"planner_busy"},503);
      throw new Error("openai_"+response.status);
    }
    if(body&&body.status==="incomplete")throw new Error("openai_incomplete");
    const rawText=outputText(body);
    if(!rawText)throw new Error("openai_empty");
    const parsed=JSON.parse(rawText);
    const plan=normalizePlan(parsed,input);
    return json({plan});
  }catch(error){
    if(error&&error.name==="AbortError"){
      console.error("OpenAI planner timed out");
      return json({error:"planner_timeout"},504);
    }
    console.error("Lesson planner failed",error);
    return json({error:"planner_unavailable"},503);
  }finally{
    clearTimeout(timer);
  }
}
