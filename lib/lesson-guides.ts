import type { AgeGroup } from "@/lib/curriculum";

export type ManualLessonGuide = {
  teach: string[];
  say: string;
  practice: string[];
  childDoes: string;
};

import { guides24_2_12 } from "@/lib/lesson-guides-2-4-2-12";
import { guides24_13_24 } from "@/lib/lesson-guides-2-4-13-24";
import { guides24_25_36 } from "@/lib/lesson-guides-2-4-25-36";
import { guides24_37_48 } from "@/lib/lesson-guides-2-4-37-48";
import { guides58_2_12 } from "@/lib/lesson-guides-5-8-2-12";
import { guides58_13_24 } from "@/lib/lesson-guides-5-8-13-24";
import { guides58_25_36 } from "@/lib/lesson-guides-5-8-25-36";
import { guides58_37_48 } from "@/lib/lesson-guides-5-8-37-48";

export const manualLessonGuides: Record<string, ManualLessonGuide> = {
  ...guides24_2_12,
  ...guides24_13_24,
  ...guides24_25_36,
  ...guides24_37_48,
  ...guides58_2_12,
  ...guides58_13_24,
  ...guides58_25_36,
  ...guides58_37_48
};

export function getManualLessonGuide(age: AgeGroup, lessonNumber: number) {
  return manualLessonGuides[`${age}:${lessonNumber}`];
}
