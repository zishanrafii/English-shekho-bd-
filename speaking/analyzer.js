/* ═══════════════════════════════════════════════════════════
   Speaking transcript analyzer — pure, deterministic, no imports.
   Compares what the learner was ASKED to say with what the
   speech recogniser HEARD, word by word.

   IMPORTANT (honesty): this measures *recognised words*, not
   sounds. A word that the recogniser did not hear as the target
   may be mis-pronounced, or just mis-recognised. Nothing here is
   phoneme-level pronunciation analysis.
   ═══════════════════════════════════════════════════════════ */

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

/** 0–99 → words ("7" → "seven"). Recognisers often return digits for spoken numbers. */
export function numberWords(n) {
  if (!Number.isInteger(n) || n < 0 || n > 99) return null;
  if (n < 20) return [ONES[n]];
  const t = TENS[Math.floor(n / 10)], o = n % 10;
  return o ? [t, ONES[o]] : [t];
}

/* contractions that expand the same way on both sides (so "I'm" == "I am") */
const CONTRACTIONS = {
  "i'm": ["i", "am"], "you're": ["you", "are"], "we're": ["we", "are"], "they're": ["they", "are"],
  "he's": ["he", "is"], "she's": ["she", "is"], "it's": ["it", "is"], "that's": ["that", "is"], "what's": ["what", "is"], "there's": ["there", "is"],
  "i've": ["i", "have"], "you've": ["you", "have"], "we've": ["we", "have"], "they've": ["they", "have"],
  "i'll": ["i", "will"], "you'll": ["you", "will"], "we'll": ["we", "will"], "they'll": ["they", "will"], "he'll": ["he", "will"], "she'll": ["she", "will"],
  "i'd": ["i", "would"], "don't": ["do", "not"], "doesn't": ["does", "not"], "didn't": ["did", "not"], "isn't": ["is", "not"], "aren't": ["are", "not"],
  "wasn't": ["was", "not"], "weren't": ["were", "not"], "can't": ["can", "not"], "cannot": ["can", "not"], "won't": ["will", "not"], "wouldn't": ["would", "not"],
  "couldn't": ["could", "not"], "shouldn't": ["should", "not"], "haven't": ["have", "not"], "hasn't": ["has", "not"], "let's": ["let", "us"],
};

/** Text → list of comparable words. Never throws; garbage in → []. */
export function normalize(text) {
  if (typeof text !== "string") return [];
  const raw = text.toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9'\s-]/g, " ").replace(/-/g, " ").split(/\s+/);
  const out = [];
  for (let w of raw) {
    w = w.replace(/^'+|'+$/g, "");
    if (!w) continue;
    if (/^\d{1,2}$/.test(w)) { out.push(...numberWords(Number(w))); continue; }
    if (/^\d+$/.test(w)) continue;                       // long numbers: cannot be compared reliably
    if (CONTRACTIONS[w]) { out.push(...CONTRACTIONS[w]); continue; }
    if (/[a-z]/.test(w)) out.push(w);
  }
  return out;
}

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

/** A substitution that is "nearly" the target (one letter off in a word of 4+ letters): likely a slight mis-hearing. */
export const isClose = (target, heard) => target.length >= 4 && heard.length >= 3 && editDistance(target, heard) <= 1;

/**
 * Immediate repetitions in what was heard ("I I want", "I want I want to").
 * Returns the heard words WITHOUT the repeats plus how many repeats were removed.
 */
export function collapseRepeats(words) {
  const out = []; const repeats = [];
  let i = 0;
  while (i < words.length) {
    // two-word phrase repeated ("i want i want")
    if (i + 3 < words.length && words[i] === words[i + 2] && words[i + 1] === words[i + 3] && words[i] !== words[i + 1]) {
      repeats.push(words[i] + " " + words[i + 1]); out.push(words[i], words[i + 1]); i += 4; continue;
    }
    if (out.length && words[i] === out[out.length - 1]) { repeats.push(words[i]); i++; continue; }
    out.push(words[i]); i++;
  }
  return { words: out, repeats };
}

/**
 * Align target words with heard words (edit-distance alignment).
 * op: "match" | "sub" (target said as another word) | "del" (target word omitted) | "ins" (extra heard word)
 */
export function align(target, heard) {
  const n = target.length, m = heard.length;
  const D = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) D[i][0] = i;
  for (let j = 0; j <= m; j++) D[0][j] = j;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const same = target[i - 1] === heard[j - 1];
    const subCost = same ? 0 : (isClose(target[i - 1], heard[j - 1]) ? 0.6 : 1);   // prefer pairing a near-miss over del+ins
    D[i][j] = Math.min(D[i - 1][j - 1] + subCost, D[i - 1][j] + 1, D[i][j - 1] + 1);
  }
  const ops = []; let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const same = target[i - 1] === heard[j - 1];
      const subCost = same ? 0 : (isClose(target[i - 1], heard[j - 1]) ? 0.6 : 1);
      if (Math.abs(D[i][j] - (D[i - 1][j - 1] + subCost)) < 1e-9) {
        ops.push(same ? { op: "match", target: target[i - 1], heard: heard[j - 1] }
                      : { op: "sub", target: target[i - 1], heard: heard[j - 1], close: isClose(target[i - 1], heard[j - 1]) });
        i--; j--; continue;
      }
    }
    if (i > 0 && Math.abs(D[i][j] - (D[i - 1][j] + 1)) < 1e-9) { ops.push({ op: "del", target: target[i - 1] }); i--; continue; }
    ops.push({ op: "ins", heard: heard[j - 1] }); j--;
  }
  return ops.reverse();
}

/**
 * Full comparison of a target text with a transcript.
 * @returns {{
 *   targetWords:number, heardWords:number, matched:number, wordAccuracy:number, completion:number,
 *   ops:Array, missed:string[], substituted:{target:string,heard:string,close:boolean}[], extra:string[], repeated:string[],
 *   problemWords:string[], empty:boolean }}
 */
export function compare(targetText, transcript) {
  const target = normalize(targetText);
  const heardAll = normalize(transcript);
  const { words: heard, repeats } = collapseRepeats(heardAll);
  const empty = heard.length === 0;
  const ops = align(target, heard);
  const matched = ops.filter((o) => o.op === "match").length;
  const missed = ops.filter((o) => o.op === "del").map((o) => o.target);
  const substituted = ops.filter((o) => o.op === "sub").map((o) => ({ target: o.target, heard: o.heard, close: o.close }));
  const extra = ops.filter((o) => o.op === "ins").map((o) => o.heard);
  // completion: how far through the target did the learner get? (trailing omissions count as not reached)
  let trailing = 0;
  for (let k = ops.length - 1; k >= 0; k--) { if (ops[k].op === "del") trailing++; else if (ops[k].op === "ins") continue; else break; }
  const T = target.length;
  return {
    targetWords: T, heardWords: heardAll.length, matched,
    wordAccuracy: T ? Math.round((matched / T) * 100) : 0,
    completion: T ? Math.round(((T - trailing) / T) * 100) : 0,
    ops, missed, substituted, extra, repeated: repeats,
    problemWords: [...new Set([...missed, ...substituted.map((s) => s.target)])],
    empty,
  };
}

/** Words per word-state for the word-by-word display: ok | close | wrong | missed, in TARGET order. */
export function wordStates(targetText, transcript) {
  const cmp = compare(targetText, transcript);
  const states = [];
  for (const o of cmp.ops) {
    if (o.op === "match") states.push({ word: o.target, state: "ok" });
    else if (o.op === "sub") states.push({ word: o.target, state: o.close ? "close" : "wrong", heard: o.heard });
    else if (o.op === "del") states.push({ word: o.target, state: "missed" });
  }
  return states;
}
