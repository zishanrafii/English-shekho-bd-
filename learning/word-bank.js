/* ═══════════════════════════════════════════════════════════
   Personal word bank helpers (Phase 9) — pure, no imports.
   Lets a learner save ANY word met while reading or listening
   into Smart Review, with its meaning and the sentence it came from.
   ═══════════════════════════════════════════════════════════ */

/* letters (incl. accented ones such as in "résumé"), apostrophe, hyphen and single spaces (for 2–3 word phrases like "sore throat") */
export const normalizeWord = (w) => String(w || "").toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z\u00e0-\u024f'\- ]/g, "").replace(/\s+/g, " ").replace(/^['\- ]+|['\- ]+$/g, "");

/** Firestore-safe card id for a saved word (distinct from the dataset ids like a1w12). */
export const wordCardId = (w) => "x_" + normalizeWord(w).replace(/[^a-z0-9]/g, "_").slice(0, 30);

const clip = (s, n) => String(s == null ? "" : s).replace(/\s+/g, " ").replace(/[<>]/g, "").trim().slice(0, n);

export const cleanMeaning = (m) => clip(m, 80);
export const cleanExample = (e) => clip(e, 200);

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

/** The card stored for a saved word (shape enforced by firestore.rules → srsCardOk). */
export function buildWordCard({ word, meaning, example, level, src }, today) {
  const w = normalizeWord(word);
  const m = cleanMeaning(meaning);
  if (!w || w.length < 2 || w.length > 30) throw new Error("invalid_word");
  if (!m) throw new Error("meaning_required");
  const card = {
    word: w, level: LEVELS.includes(level) ? level : "A1",
    ease: 2.5, interval: 0, reps: 0, lapses: 0, due: today, last: today,
    saved: true, src: ["listening", "speaking"].includes(src) ? src : "reading", meaning: m,
  };
  const ex = cleanExample(example);
  if (ex) card.example = ex;
  return card;
}

/** First sentence of the given paragraphs/lines that contains the word (the "context" shown in review). */
export function findSentence(texts, word) {
  const w = normalizeWord(word);
  if (!w) return "";
  const re = new RegExp("(^|[^a-z\\u00e0-\\u024f])" + w.replace(/[-']/g, "\\$&").replace(/ /g, "\\s+") + "([^a-z\\u00e0-\\u024f]|$)", "i");
  for (const t of [].concat(texts || [])) {
    const parts = String(t).match(/[^.!?]+[.!?]*/g) || [String(t)];
    const hit = parts.map((s) => s.trim()).find((s) => re.test(s));
    if (hit) return hit;
  }
  return "";
}

/** Look a word up in the compact dictionary ({word: [meaning, level, phonetic]}), trying simple endings. */
export function lookup(dict, raw) {
  const w = normalizeWord(raw);
  if (!w || !dict) return null;
  const tries = [w];
  if (w.endsWith("ies") || w.endsWith("ied")) tries.push(w.slice(0, -3) + "y");
  if (w.endsWith("es")) tries.push(w.slice(0, -2));
  if (w.endsWith("s")) tries.push(w.slice(0, -1));
  if (w.endsWith("ed")) tries.push(w.slice(0, -2), w.slice(0, -1));
  if (w.endsWith("ing")) tries.push(w.slice(0, -3), w.slice(0, -3) + "e");
  for (const t of tries) {
    const e = Object.prototype.hasOwnProperty.call(dict, t) ? dict[t] : null;
    if (e) return { word: t, meaning: e[0], level: e[1], phonetic: e[2] || "" };
  }
  return null;
}
