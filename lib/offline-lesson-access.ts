const KEY = "luwipi:v3:offline-lesson-until";

export function markOfflineLessonWindow(expiresAt: number) {
  if (typeof window === "undefined") return;
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return;
  window.localStorage.setItem(KEY, String(expiresAt));
}

export function canUseOfflineLessonWindow() {
  if (typeof window === "undefined") return false;
  const until = Number(window.localStorage.getItem(KEY) || 0);
  return Number.isFinite(until) && until > Date.now();
}

export function clearOfflineLessonWindow() {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}
