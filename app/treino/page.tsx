import { AdaptiveWorkout } from "@/components/adaptive-workout";
import { ProductShell } from "@/components/product-shell";

export default async function WorkoutPage({ searchParams }: { searchParams: Promise<{ age?: string; student?: string }> }) {
  const params = await searchParams;
  const age = params.age === "2-4" ? "2-4" : params.age === "adult" ? "adult" : "5-8";
  return <ProductShell backHref={`/dashboard?age=${age}`} backLabel="Aulas"><div className="container"><AdaptiveWorkout age={age} studentId={params.student?.trim() || "default"}/></div></ProductShell>;
}
