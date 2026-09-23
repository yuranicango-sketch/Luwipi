import { AdaptiveWorkout } from "@/components/adaptive-workout";

export default async function WorkoutPage({searchParams}:{searchParams:Promise<{age?:string;student?:string}>}){
 const params=await searchParams;
 const age=params.age==="2-4"?"2-4":params.age==="adult"?"adult":"5-8";
 return <AdaptiveWorkout age={age} studentId={params.student?.trim()||"default"}/>;
}
