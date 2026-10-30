/* Reading helpers (Phase 9) — pure, no imports. */

/** Comfortable silent-reading speed (words per minute) for second-language learners, by CEFR level.
    Rough teaching guidelines, NOT a test: used only for friendly feedback. */
export const WPM_BAND = { A1: [40, 90], A2: [70, 120], B1: [100, 150], B2: [130, 190], C1: [160, 230], C2: [190, 260] };

const bn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

/** Words per minute, or 0 when the timing is not believable (tab left open, instant skip). */
export function wpmOf(wordCount, seconds) {
  if (!(wordCount > 0) || !(seconds >= 5)) return 0;
  const w = Math.round((wordCount / seconds) * 60);
  return w >= 20 && w <= 500 ? w : 0;
}

/** Friendly, never-judging feedback line about the speed. Empty string when there is nothing sensible to say. */
export function wpmFeedback(wpm, level) {
  const band = WPM_BAND[level];
  if (!wpm || !band) return "";
  const [lo, hi] = band;
  if (wpm < lo) return `⏱ আপনার গতি ${bn(wpm)} শব্দ/মিনিট। ধীরে ও বুঝে পড়া ভালো অভ্যাস; এই স্তরে সাধারণত ${bn(lo)}–${bn(hi)} হয়।`;
  if (wpm <= hi) return `⏱ ${bn(wpm)} শব্দ/মিনিট: এই স্তরের জন্য একদম ঠিক গতি (${bn(lo)}–${bn(hi)})।`;
  if (wpm <= hi * 1.6) return `⏱ ${bn(wpm)} শব্দ/মিনিট: বেশ দ্রুত! শুধু নিশ্চিত হোন যেন বুঝে পড়ছেন।`;
  return "";   // implausibly fast for comprehension → say nothing rather than praise skimming
}

/** The learner's level as one of the levels the reading library has (C2 → C1). */
export function readingLevelFor(profileLevel, available = ["A1", "A2", "B1", "B2", "C1"]) {
  if (available.includes(profileLevel)) return profileLevel;
  if (profileLevel === "C2" && available.includes("C1")) return "C1";
  return null;
}

/** Only https image URLs may be used as a CSS background / <img>. */
export const safeImageUrl = (u) => (/^https:\/\/[^\s"'()<>\\]+$/i.test(String(u || "")) ? String(u) : "");
