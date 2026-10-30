/* Difficult-word tracking — pure. Counts live in users/{uid}.speakingStats.difficult (word → count); the words themselves go to the
   EXISTING Smart Review (no separate speaking vocabulary database). */

export const THRESHOLD = 3;          // "needs practice N times"
export const MAX_TRACKED = 60;       // matches the Firestore rule
const SKIP = new Set(["a", "i", "an", "the", "to", "of", "in", "on", "at", "is", "am", "it", "he", "or", "so", "no", "my", "we", "do", "be", "by", "up"]);
/** Only plain a–z words are tracked: they are safe as Firestore field names. */
export const trackable = (w) => /^[a-z]{3,20}$/.test(w) && !SKIP.has(w);

/**
 * Update the counts after one attempt.
 * - each problem word (missed/substituted) +1
 * - each target word said correctly −1 (a word you now say well fades away)
 * @returns {{ next: Object<string,number>, changed: Object<string,number> }}  `changed` = only the entries to write
 */
export function update(counts, cmp) {
  const next = { ...(counts || {}) }; const changed = {};
  const problem = new Set((cmp.problemWords || []).filter(trackable));
  const good = new Set(cmp.ops.filter((o) => o.op === "match" && trackable(o.target)).map((o) => o.target));
  for (const w of problem) { next[w] = (next[w] || 0) + 1; changed[w] = next[w]; }
  for (const w of good) if (!problem.has(w) && next[w] > 0) { next[w] -= 1; changed[w] = next[w]; }
  // keep the map small: forget zero entries, and cap the number of words (drop the lowest counts first)
  // zero entries leave the local map; `changed` still carries the 0 so the stored value is overwritten (Firestore field is not deleted)
  for (const w of Object.keys(next)) if (next[w] <= 0) delete next[w];
  const keys = Object.keys(next);
  if (keys.length > MAX_TRACKED) {
    keys.sort((a, b) => next[a] - next[b]).slice(0, keys.length - MAX_TRACKED).forEach((w) => { delete next[w]; delete changed[w]; });
  }
  return { next, changed };
}

/** Words that have caused trouble at least THRESHOLD times, worst first. */
export function needsPractice(counts, threshold = THRESHOLD) {
  return Object.entries(counts || {}).filter(([, n]) => n >= threshold).sort((a, b) => b[1] - a[1]).map(([word, count]) => ({ word, count }));
}
