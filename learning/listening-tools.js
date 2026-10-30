/* ═══════════════════════════════════════════════════════════
   Listening exercises (Phase 9) — pure, no imports.
   • missing-word (cloze) items built from any transcript
   • answer checking that forgives one small typo
   • "words to practise": the hardest words of a lesson
   ═══════════════════════════════════════════════════════════ */
import { normalizeWord } from "./word-bank.js";

const STOP = new Set(`the and for are but not you all can had her was one our out has have this that with they will from your what when where which their there been were said each she how its who did get may him his than then them these some would about after again also because before could every first into just like make many more most much must only other over such take their those very well while white why yes`.split(/\s+/));

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

/** Words of a line with their positions. */
export function tokenize(line) {
  const out = []; const re = /[A-Za-z][A-Za-z'’-]*/g; let m;
  while ((m = re.exec(String(line || "")))) out.push({ raw: m[0], word: normalizeWord(m[0]), start: m.index, end: m.index + m[0].length });
  return out.filter((t) => t.word);
}

const isContent = (w) => w.length >= 4 && !STOP.has(w) && !/'/.test(w);

/**
 * Pick up to n lines and one content word in each to blank out.
 * Lines are spread evenly over the lesson; the longest eligible word wins ties so blanks are meaningful.
 * @returns [{ line: index, text, before, answer, after }]
 */
export function pickBlanks(lines, n = 5, rand = Math.random) {
  const cands = [];
  (lines || []).forEach((text, li) => {
    const toks = tokenize(text).filter((t) => isContent(t.word));
    if (!toks.length) return;
    // prefer longer words, with a little randomness so a retry feels different
    toks.sort((a, b) => (b.word.length + rand() * 2) - (a.word.length + rand() * 2));
    const t = toks[0];
    cands.push({ line: li, text, before: text.slice(0, t.start), answer: t.word, after: text.slice(t.end) });
  });
  if (cands.length <= n) return cands;
  const picked = [];
  for (let i = 0; i < n; i++) picked.push(cands[Math.floor((i * cands.length) / n)]);   // even spread
  return picked;
}

/** Levenshtein distance (small strings). */
export function editDistance(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

/** "correct" | "close" (one slip in a word of 5+ letters) | "wrong" | "empty" */
export function checkAnswer(input, answer) {
  const a = normalizeWord(input), b = normalizeWord(answer);
  if (!a) return "empty";
  if (a === b) return "correct";
  if (b.length >= 5 && editDistance(a, b) === 1) return "close";
  return "wrong";
}

/**
 * The words most worth practising from a lesson: rare or long words first.
 * @param dict  compact dictionary {word:[meaning,level,phonetic]} (optional)
 * @param level learner's CEFR level — words above it rank higher
 */
export function practiceWords(lines, dict, level = "A1", n = 8) {
  const lv = Math.max(0, LEVELS.indexOf(level));
  const seen = new Map();
  for (const line of lines || []) for (const t of tokenize(line)) {
    if (!isContent(t.word) || seen.has(t.word)) continue;
    const e = dict && Object.prototype.hasOwnProperty.call(dict, t.word) ? dict[t.word] : null;
    const wl = e ? LEVELS.indexOf(e[1]) : -1;
    // score: higher dictionary level than the learner, unknown-but-long words, then length
    let score = t.word.length * 0.3;
    if (wl >= 0) score += Math.max(0, wl - lv + 1) * 2 + 1;       // known word above/at level
    else if (t.word.length >= 7) score += 1.5;                    // not in our dictionary but looks hard
    seen.set(t.word, { word: t.word, meaning: e ? e[0] : "", level: e ? e[1] : "", phonetic: e ? e[2] : "", sentence: line, score });
  }
  return [...seen.values()].sort((a, b) => b.score - a.score || b.word.length - a.word.length).slice(0, n);
}
