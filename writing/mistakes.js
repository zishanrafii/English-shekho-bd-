/* ═══════════════════════════════════════════════════════════
   Personal Mistake Memory — pure.
   A "mistake" is a small phrase the learner wrote wrongly, with its
   correction and a Bengali reason. They are kept (users/{uid}/writingMistakes)
   so the learner can practise them again (writing-review.html) and the
   page can show "Articles 7 · Prepositions 5 · Tenses 3".
   Mechanical issues (capital letters, spacing, repeated words) are shown
   inline but are NOT stored: they are habits to proof-read, not knowledge gaps.
   ═══════════════════════════════════════════════════════════ */
import { CATEGORY_IDS, CATEGORIES, check, sentences, wordsOf } from "./analyzer.js";

export const STORED = ["article", "preposition", "tense", "agreement", "word-choice", "word-form", "word-order", "spelling", "other"];
export const MAX_PER_CHECK = 10;
const clip = (s, n) => String(s == null ? "" : s).replace(/\s+/g, " ").replace(/[<>]/g, "").trim().slice(0, n);
export const norm = (s) => String(s || "").toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();

/** Stable Firestore-safe id: the same mistake in the same words always maps to the same document. */
export function mistakeKey(category, original) {
  let h = 2166136261; const n = norm(original);
  for (let i = 0; i < n.length; i++) { h ^= n.charCodeAt(i); h = Math.imul(h, 16777619); }
  return "w_" + String(category).replace(/[^a-z]/g, "").slice(0, 12) + "_" + (h >>> 0).toString(36);
}

/** The sentence of `text` that contains offset `at` (clipped), used as the context line in review. */
export function contextOf(text, at) {
  const s = sentences(text).find((x) => at >= x.start && at <= x.end);
  return clip(s ? s.text : text.slice(Math.max(0, at - 60), at + 100), 240);
}

/** Turn a one-word rule hit into a phrase that makes a meaningful exercise ("a apple" → "an apple", "He go" → "He goes"). */
export function expandIssue(text, it) {
  let s = it.start, e = it.end;
  if (/^(sva|didnt|doesnt|plural)/.test(it.rule)) { const m = text.slice(0, s).match(/([A-Za-z'’]+)\s+$/); if (m) s = s - m[0].length; }
  if (it.rule === "a-an") { const m = text.slice(e).match(/^\s+[A-Za-z'’-]+/); if (m) e = e + m[0].length; }
  const original = text.slice(s, e);
  const corrected = text.slice(s, it.start) + it.suggestion + text.slice(it.end, e);
  return { original, corrected, at: it.start };
}

/**
 * Merge rule-based issues and VERIFIED AI corrections into the memory list.
 * @returns [{ key, doc }] at most MAX_PER_CHECK, no duplicates, only meaningful categories
 */
export function collect({ text, issues = [], ai = [], today }) {
  const seen = new Set(); const out = [];
  const add = (category, original, corrected, why, at) => {
    if (!STORED.includes(category)) return;
    const o = clip(original, 160), c = clip(corrected, 160);
    if (!o || !c || norm(o) === norm(c) || !String(text).includes(original.trim() ? original : "\u0000")) return;
    const key = mistakeKey(category, o); if (seen.has(key)) return; seen.add(key);
    out.push({ key, doc: { category, original: o, corrected: c, why: clip(why, 220), context: contextOf(text, at), last: today, fixed: false } });
  };
  for (const it of issues) { const x = expandIssue(text, it); add(it.category, x.original, x.corrected, it.explainBn, x.at); }
  for (const a of ai) { const at = String(text).indexOf(a.original); add(a.category, a.original, a.corrected, a.explanationBn, Math.max(0, at)); }
  return out.slice(0, MAX_PER_CHECK);
}

/** Group stored mistakes for the summary ("Articles 7, Prepositions 5 …"), biggest first. Counts only unresolved ones. */
export function summarize(mistakes) {
  const by = {};
  for (const m of mistakes || []) if (m && !m.fixed && CATEGORY_IDS.includes(m.category)) by[m.category] = (by[m.category] || 0) + 1;
  return Object.entries(by).sort((a, b) => b[1] - a[1]).map(([category, count]) => ({ category, count, label: CATEGORIES[category].bn }));
}

/** Review answer check: the learner types the corrected phrase. */
export function checkAnswer(input, mistake) {
  const a = norm(input), c = norm(mistake.corrected), o = norm(mistake.original);
  if (!a) return "empty";
  if (a === c) return "correct";
  if (a === o) return "same";             // typed the wrong version again
  return "wrong";
}

/** AI corrections that are safe to show (defence in depth: the server already verified them). */
export function acceptAi(text, list) {
  const hay = String(text).replace(/\s+/g, " ");
  return (Array.isArray(list) ? list : []).filter((c) => c && typeof c.original === "string" && typeof c.corrected === "string" && c.original !== c.corrected && c.original.length <= 160 && c.corrected.length <= 160 && hay.includes(c.original.replace(/\s+/g, " "))).slice(0, 8)
    .map((c) => ({ original: c.original, corrected: c.corrected, category: CATEGORY_IDS.includes(c.category) ? c.category : "other", explanationBn: clip(c.explanationBn, 240) }));
}
