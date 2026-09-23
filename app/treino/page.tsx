import { redirect } from "next/navigation";
import { AdaptiveWorkout } from "@/components/adaptive-workout";
import { contextRedirectHref, resolveLearningContext } from "@/lib/learning-context";

export default async function WorkoutPage({searchParams}:{searchParams:Promise<{age?:string;student?:string}>}){
 const params=await searchParams;
 if(params.student||params.age)redirect(contextRedirectHref({studentId:params.student,ageGroup:params.age,next:"/treino"}));
 const context=await resolveLearningContext();
 return <AdaptiveWorkout age={context.ageGroup} studentId={context.studentId}/>;
}
