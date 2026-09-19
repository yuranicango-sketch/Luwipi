import type { LessonStep } from "@/lib/lesson-engine";
import { getPreschoolLessonSteps } from "@/lib/preschool-lessons";
import { preschool13_24 } from "@/lib/preschool-lessons-13-24";
import { preschool25_36 } from "@/lib/preschool-lessons-25-36";
import { preschool37_48 } from "@/lib/preschool-lessons-37-48";

export function getCompletePreschoolLessonSteps(n:number):LessonStep[]|undefined{
  if(n<=12) return getPreschoolLessonSteps(n);
  return preschool13_24[n] ?? preschool25_36[n] ?? preschool37_48[n];
}
