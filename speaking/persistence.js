/* ═══════════════════════════════════════════════════════════
   What gets saved after speaking practice — PURE builders.
   (speaking/save.js does the actual Firestore calls.)

   • one document per practised item in the EXISTING `speaking_sessions`
     collection (same collection the old speaking page uses, so history stays together)
   • aggregate counters on users/{uid}.speakingStats (batched into ONE update)
   • difficult-word counts (words themselves go to the existing Smart Review)
   • daily-plan bookkeeping (planHistory.speaking, planProgress)
   Audio is never uploaded or stored.
   ═══════════════════════════════════════════════════════════ */
import { buildPlan } from "../learning/daily-plan.js";

export const SESSION_VERSION = 1;
const clip = (s, n) => String(s == null ? "" : s).replace(/\s+/g, " ").replace(/[<>]/g, "").trim().slice(0, n);
const int = (x, lo, hi) => Math.min(hi, Math.max(lo, Math.round(Number(x) || 0)));
export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

/** Document for `speaking_sessions`. Only the learner's own uid is ever used (the server rules re-check it). */
export function buildSessionDoc({ uid, mode, level, activityId, prompt, analysis, attempts = 1, today, serverTimestamp }) {
  if (!uid) throw new Error("no_uid");
  const free = mode === "free" || mode === "sim";                       // no target text to compare with
  const overall = mode === "sim" ? (analysis.sim && analysis.sim.total ? Math.round((analysis.sim.done / analysis.sim.total) * 100) : 0)
                : free ? (analysis.fluency ?? 0) : (analysis.wordAccuracy ?? 0);
  const doc = {
    uid, mode, level: LEVELS.includes(level) ? level : "A1",
    activityId: clip(activityId, 40), prompt: clip(prompt, 300) || "Speaking practice",
    transcript: clip(analysis.transcript, 1500),
    wordCount: int(analysis.wordCount, 0, 2000), durationSec: Math.round(Math.min(900, Math.max(0, Number(analysis.durationSec) || 0)) * 10) / 10, attempts: int(attempts, 1, 50),
    scores: { overall: int(overall, 0, 100) },                 // `scores.overall` keeps the old history list working
    dateStr: today, recordedAt: serverTimestamp, version: SESSION_VERSION, provider: "browser-speech",
  };
  if (analysis.fluency !== null && analysis.fluency !== undefined) { doc.fluency = int(analysis.fluency, 0, 100); doc.scores.fluency = doc.fluency; }
  if (!free) { doc.wordAccuracy = int(analysis.wordAccuracy, 0, 100); doc.completion = int(analysis.completion, 0, 100); }
  if (analysis.wpm) doc.wpm = int(analysis.wpm, 0, 400);
  if (mode === "sim" && analysis.sim) {                                 // real-life simulator: scenario + deterministic goal progress
    doc.scenarioId = clip(analysis.sim.scenarioId, 20);
    doc.objectivesDone = int(analysis.sim.done, 0, 10); doc.objectivesTotal = int(analysis.sim.total, 0, 10); doc.turns = int(analysis.turns, 0, 30);
  }
  const dw = (analysis.problemWords || []).filter((w) => /^[a-z]{2,20}$/.test(w)).slice(0, 8);
  if (dw.length) doc.difficultWords = dw;
  return doc;
}

/** The speaking goal for a day: ≥ 3 practised items, or one free-speaking answer of 45 s or more. */
export const GOAL = { items: 3, freeSeconds: 45, simTurns: 4 };      // a role-play with ≥ 4 learner turns also completes the day's speaking goal
export const goalReached = ({ dayCount, mode, durationSec, turns = 0 }) => dayCount >= GOAL.items || (mode === "free" && durationSec >= GOAL.freeSeconds) || (mode === "sim" && turns >= GOAL.simTurns);

/** Mini-summary the UI shows after saving ("Speaking goal completed" etc.). */
export function dayMessage({ dayCount, reached }) {
  const bn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
  if (reached) return "🎯 আজকের Speaking লক্ষ্য পূরণ হয়েছে!";
  return `আজ ${bn(dayCount)}টি অনুশীলন হয়েছে। ${bn(Math.max(0, GOAL.items - dayCount))}টি করলেই আজকের Speaking লক্ষ্য পূরণ।`;
}

/**
 * Everything to write on the USER document, in ONE update (dotted paths).
 * @param ops { increment(n), arrayUnion(...v) }  Firestore helpers injected so this stays pure/testable
 */
export function buildUserUpdate({ analysis, mode, seconds, today, userDoc = {}, difficultChanged = {}, catalog = null, ops }) {
  const prev = (userDoc.speakingStats || {});
  const dayCount = (prev.day === today ? (prev.dayCount || 0) : 0) + 1;
  const reached = goalReached({ dayCount, mode, durationSec: analysis.durationSec, turns: analysis.turns });
  const u = {
    "speakingStats.sessions": ops.increment(1),
    "speakingStats.seconds": ops.increment(int(seconds, 0, 900)),
    ["speakingStats.modes." + mode]: ops.increment(1),
    "speakingStats.day": today, "speakingStats.dayCount": dayCount, "speakingStats.last": today,
    "planHistory.speaking": today,
  };
  if (mode !== "free" && mode !== "sim" && Number.isFinite(analysis.wordAccuracy)) {
    u["speakingStats.accSum"] = ops.increment(int(analysis.wordAccuracy, 0, 100));
    u["speakingStats.accN"] = ops.increment(1);
  }
  for (const [w, n] of Object.entries(difficultChanged)) if (/^[a-z]{3,20}$/.test(w)) u["speakingStats.difficult." + w] = int(n, 0, 99);

  // daily plan: tick "speaking" when the goal is reached AND speaking is part of today's plan
  let planSynced = false;
  if (reached) {
    const saved = userDoc.planProgress && userDoc.planProgress.date === today ? userDoc.planProgress : null;
    const plan = buildPlan({
      profile: userDoc.learningProfile, history: userDoc.planHistory || {},           // history BEFORE today's write, so the plan is the one the learner saw
      grammarDone: (userDoc.grammarProgress && userDoc.grammarProgress.done) || [], grammarMastery: (userDoc.grammarProgress && userDoc.grammarProgress.mastery) || null,
      catalog, today, lockedSkills: saved && Array.isArray(saved.skills) ? saved.skills : null,
    });
    const skills = plan.items.map((i) => i.skill);
    if (skills.includes("speaking")) {
      const done = new Set((saved && saved.done) || []); done.add("speaking");
      u.planProgress = { date: today, done: [...done], skills }; planSynced = true;
    }
  }
  return { update: u, dayCount, reached, planSynced };
}

/** Counters the rules allow (kept in one place so the test can mirror them). */
export const STATS_KEYS = ["sessions", "seconds", "accSum", "accN", "modes", "day", "dayCount", "last", "difficult"];
export const MODE_KEYS = ["repeat", "shadow", "read", "free", "sim"];

/** Average word accuracy from the stored sums (null until a target-mode attempt exists). */
export const averageAccuracy = (stats) => (stats && stats.accN > 0 ? Math.round(stats.accSum / stats.accN) : null);

/* ── local mirror of an update (so the page's cached copy of the user document stays correct without re-reading) ── */
export const localOps = { increment: (n) => ({ __inc: n }), arrayUnion: (...v) => ({ __union: v }) };
export function applyUpdate(doc, update) {
  const cur = JSON.parse(JSON.stringify(doc || {}));
  for (const [k, v] of Object.entries(update)) {
    const parts = k.split("."); let o = cur;
    for (let i = 0; i < parts.length - 1; i++) { if (typeof o[parts[i]] !== "object" || o[parts[i]] === null) o[parts[i]] = {}; o = o[parts[i]]; }
    const last = parts[parts.length - 1];
    if (v && v.__inc !== undefined) o[last] = (o[last] || 0) + v.__inc;
    else if (v && v.__union) o[last] = [...new Set([...(o[last] || []), ...v.__union])];
    else o[last] = v;
  }
  return cur;
}
