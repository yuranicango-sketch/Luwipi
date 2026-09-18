import { notFound } from "next/navigation";
import { LessonRunner } from "@/components/lesson-runner";
import {
  findLesson,
  getEnhancedCurriculum,
  getVariant,
} from "@/lib/curriculum-v3";

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ age: string; lesson: string }>;
  searchParams: Promise<{ variant?: string; student?: string }>;
}) {
  const path = await params;
  const query = await searchParams;
  const program = getEnhancedCurriculum(path.age);
  const lessonNumber = Number(path.lesson);

  if (!Number.isInteger(lessonNumber) || lessonNumber < 1 || lessonNumber > 48) {
    notFound();
  }

  const found = findLesson(program, lessonNumber);
  if (!found) notFound();

  const variant = getVariant(program, query.variant);
  const studentId = query.student?.trim() || "default";

  return (
    <main className="dashboard-page">
      <LessonRunner
        age={program.age}
        module={found.module}
        lesson={found.lesson}
        variant={variant}
        studentId={studentId}
      />
    </main>
  );
}
