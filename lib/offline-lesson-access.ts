const KEY = "luwipi:v3:offline-lesson-until";
const EIGHT_HOURS = 8 * 60 * 60 * 1000;

export function markOfflineLessonWindow() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, String(Date.now() + EIGHT_HOURS));
}

export function canUseOfflineLessonWindow() {
  if (typeof window === "undefined") return false;
  const until = Number(window.localStorage.getItem(KEY) || 0);
  return Number.isFinite(until) && until > Date.now();
}

export function clearOfflineLessonWindow() {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}
