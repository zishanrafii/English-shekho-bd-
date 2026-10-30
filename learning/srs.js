/* ═══════════════════════════════════════════════════════════
   Spaced-repetition engine for vocabulary (Phase 7).
   Pure functions — no imports, no Firebase — so it is easy to test.
   A modified SM-2:
     grades: 0 আবার · 1 কঠিন · 2 ঠিক আছে · 3 সহজ
   Card: { word, level, ease, interval, reps, lapses, due, last, saved?, known?, src? }
   Dates are local "YYYY-MM-DD" strings.
   ═══════════════════════════════════════════════════════════ */

export const GRADE = { AGAIN: 0, HARD: 1, GOOD: 2, EASY: 3 };
export const LIMITS = { easeMin: 1.3, easeMax: 3.0, easeStart: 2.5, maxInterval: 180, masteredInterval: 21, knownDays: 60 };

export const isoDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function addDays(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`;
}
export function daysBetween(a, b) {
  const p = (s) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((p(b) - p(a)) / 86400000);
}
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

export function newCard(word, level, today, extra = {}) {
  return { word, level, ease: LIMITS.easeStart, interval: 0, reps: 0, lapses: 0, due: today, last: today, ...extra };
}

/** Next state of a card after a review. Returns a NEW object. */
export function review(card, grade, today) {
  const c = { ...card };
  const wasInterval = c.interval;
  if (grade === GRADE.AGAIN) {
    c.lapses += 1; c.reps = 0; c.interval = 0;
    c.ease = clamp(c.ease - 0.2, LIMITS.easeMin, LIMITS.easeMax);
  } else if (grade === GRADE.HARD) {
    c.interval = Math.max(1, Math.round(Math.max(wasInterval, 1) * 1.2));
    c.ease = clamp(c.ease - 0.15, LIMITS.easeMin, LIMITS.easeMax);
    c.reps = Math.max(c.reps, 1);
  } else {
    c.reps += 1;
    const easy = grade === GRADE.EASY;
    if (c.reps === 1) c.interval = easy ? 3 : 1;
    else if (c.reps === 2) c.interval = easy ? 7 : 3;
    else c.interval = Math.round(Math.max(wasInterval, 1) * c.ease * (easy ? 1.3 : 1));
    if (easy) c.ease = clamp(c.ease + 0.15, LIMITS.easeMin, LIMITS.easeMax);
  }
  c.interval = clamp(Math.round(c.interval), 0, LIMITS.maxInterval);
  c.due = addDays(today, c.interval);
  c.last = today;
  delete c.known;
  return c;
}

/** "I already know this" — parked far in the future instead of cluttering reviews. */
export function markKnown(word, level, today) {
  return { ...newCard(word, level, today, { src: "known" }), known: true, reps: 3, interval: LIMITS.knownDays, due: addDays(today, LIMITS.knownDays) };
}

/** What the next interval would be for each grade (shown on the buttons). */
export function previewIntervals(card, today) {
  return [0, 1, 2, 3].map((g) => review(card, g, today).interval);
}

/* ── status buckets: New / Learning / Weak / Due / Mastered / Known ── */
export function statusOf(card, today) {
  if (!card) return "new";
  if (card.known) return "known";
  if ((card.lapses >= 2 && card.interval < 14) || card.ease <= 1.7) return "weak";
  if (card.interval >= LIMITS.masteredInterval) return "mastered";
  return card.reps < 3 ? "learning" : "review";
}
export const isDue = (card, today) => !!card && !card.known && card.due <= today;

/** 0–100: how securely the word is remembered. */
export function masteryScore(card) {
  if (!card) return 0;
  if (card.known) return 100;
  const base = Math.min(card.interval, 60) / 60 * 80;
  const reps = Math.min(card.reps, 5) * 4;
  return clamp(Math.round(base + reps - card.lapses * 8), 0, 100);
}

/** Healthy daily limits: depend on the learner's daily time, never on a backlog. */
export function sessionLimits(dailyMinutes) {
  const m = Number(dailyMinutes) || 20;
  if (m <= 10) return { review: 10, newWords: 4 };
  if (m <= 20) return { review: 15, newWords: 6 };
  if (m <= 30) return { review: 20, newWords: 8 };
  return { review: 30, newWords: 10 };
}

/**
 * Pick today's session.
 * @param due        due cards (any order)
 * @param candidates unseen words of the learner's level (already filtered for quality)
 * @param opts       { review, newWords, newLeftToday, today }
 * Weak and most-overdue cards first; new words only after reviews, and never beyond today's new-word quota.
 */
export function buildSession(due, candidates, { review: reviewCap, newWords, newLeftToday = newWords, today }) {
  const rank = (c) => (statusOf(c, today) === "weak" ? 0 : 1);
  const reviews = [...due].sort((a, b) => rank(a) - rank(b) || a.due.localeCompare(b.due)).slice(0, reviewCap);
  const quota = Math.max(0, Math.min(newWords, newLeftToday));
  return { reviews, newWords: candidates.slice(0, quota), backlog: Math.max(0, due.length - reviews.length) };
}

/** Deterministic daily shuffle so "new words" stay the same if the learner refreshes. */
export function dailyShuffle(items, today) {
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  return [...items].sort((a, b) => hash(today + (a.id || a)) - hash(today + (b.id || b)));
}

export function intervalLabel(days) {
  const bn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
  if (days <= 0) return "এখনই";
  if (days === 1) return "১ দিন";
  if (days < 30) return `${bn(days)} দিন`;
  if (days < 365) return `${bn(Math.round(days / 30))} মাস`;
  return "১ বছর";
}
