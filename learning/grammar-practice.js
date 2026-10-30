/* ═══════════════════════════════════════════════════════════
   Grammar practice helpers (Phase 8) — pure, no imports.
   Flow on every topic page:
     Learn → Example → Practice → Mistake analysis → Mini challenge → Mastery
   ═══════════════════════════════════════════════════════════ */

export const STAGES = [
  { id: "learn",     label: "পড়ুন" },
  { id: "example",   label: "উদাহরণ" },
  { id: "practice",  label: "অনুশীলন" },
  { id: "review",    label: "ভুল বিশ্লেষণ" },
  { id: "challenge", label: "মিনি চ্যালেঞ্জ" },
  { id: "mastery",   label: "আয়ত্ত" },
];

export const MASTERY = { mastered: 80, progress: 60 };

export const pct = (correct, total) => (total > 0 ? Math.round((correct / total) * 100) : 0);

export function masteryLevel(p) {
  if (p >= MASTERY.mastered) return { id: "mastered", icon: "🏆", label: "আয়ত্ত হয়েছে" };
  if (p >= MASTERY.progress) return { id: "progress", icon: "📈", label: "ভালো অগ্রগতি" };
  return { id: "practice", icon: "🌱", label: "আরও একটু অনুশীলন দরকার" };
}

/** Encouraging, guilt-free message for a result. */
export function resultMessage(correct, total) {
  const bn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
  const p = pct(correct, total);
  if (total > 0 && correct === total) return "🎉 নিখুঁত! সবগুলো ঠিক হয়েছে।";
  if (p >= MASTERY.mastered) return `👏 দারুণ! ${bn(total)}টির মধ্যে ${bn(correct)}টি ঠিক।`;
  if (p >= MASTERY.progress) return `👍 ভালো হচ্ছে। ভুলগুলো দেখে নিলেই আরও পাকা হবে।`;
  return "ভুল করাই শেখার অংশ। নিচের বিশ্লেষণটা দেখে নিন, তারপর আবার চেষ্টা করুন।";
}

/** Stable, Firestore-safe id for a question (does not depend on its position on the page). */
export function questionKey(topicId, text) {
  const norm = String(text || "").toLowerCase().replace(/^\s*\d+[.)]\s*/, "").replace(/\s+/g, " ").trim();
  let h = 2166136261;
  for (let i = 0; i < norm.length; i++) { h ^= norm.charCodeAt(i); h = Math.imul(h, 16777619); }
  return `${String(topicId).replace(/[^a-z0-9]/gi, "_")}_${(h >>> 0).toString(36)}`;
}
export const topicKey = (id) => String(id).replace(/[^a-z0-9]/gi, "_");

const clip = (s, n) => String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, n);

/** Build the document stored for a wrong answer (shape enforced by firestore.rules). */
export function buildMistake({ topicId, text, opts, picked, correct, why }, today) {
  const o = (opts || []).map((x) => clip(x, 80)).filter(Boolean).slice(0, 4);
  const doc = {
    topic: clip(topicId, 12),
    q: clip(String(text || "").replace(/^\s*\d+[.)]\s*/, ""), 200),
    opts: o,
    picked: clip(picked, 80),
    correct: clip(correct, 80),
    last: today,
    fixed: false,
  };
  const w = clip(why, 200);
  if (w) doc.why = w;
  return doc;
}
export const mistakeIsValid = (m) => !!m && m.q && m.opts.length >= 2 && m.opts.includes(m.correct) && m.picked !== m.correct;

/** Merge a finished attempt into the stored mastery record of a topic. */
export function mergeMastery(prev, percent, today) {
  const p = prev || {};
  return { best: Math.max(Number(p.best) || 0, percent), last: percent, attempts: (Number(p.attempts) || 0) + 1, date: today };
}

/** Fisher–Yates with an injectable RNG. */
export function shuffled(arr, rand = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Topics (at or below the learner's level) that were attempted but not yet secure. Weakest first. */
export function weakTopics(mastery, catalog, level) {
  const LV = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const max = Math.max(0, LV.indexOf(level));
  const out = [];
  for (let i = 0; i <= max; i++) for (const t of ((catalog && catalog.topics && catalog.topics[LV[i]]) || [])) {
    const m = mastery && mastery[topicKey(t.id)];
    if (m && Number(m.attempts) >= 1 && Number(m.last) < MASTERY.progress) out.push({ topic: t, last: Number(m.last) });
  }
  return out.sort((a, b) => a.last - b.last).map((x) => ({ ...x.topic, last: x.last }));
}

/** Which stage chip is current, given where the learner is on the page. */
export function stageFor({ answered, total, wrong, challengeOpen, challengeDone }) {
  if (!total) return "learn";
  if (answered === 0) return "learn";
  if (answered < total) return "practice";
  if (challengeDone || wrong === 0) return "mastery";
  return challengeOpen ? "challenge" : "review";
}
