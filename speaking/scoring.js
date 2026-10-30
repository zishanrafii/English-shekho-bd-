/* ═══════════════════════════════════════════════════════════
   Speaking scoring — pure, deterministic, no imports.

   What is MEASURED (deterministic, from timing + transcript):
     words, duration, words-per-minute, pauses between recogniser
     results, repeated words, filler words, completion.
   What is ESTIMATED (a documented formula, shown as an estimate):
     "fluency estimate" (0–100).
   What is NEVER claimed: phoneme-level pronunciation accuracy.
   ═══════════════════════════════════════════════════════════ */
import { normalize, collapseRepeats } from "./analyzer.js";

/** Comfortable speaking pace for learners (words/minute) by CEFR level. Teaching guideline, not a test. */
export const PACE_BAND = { A1: [50, 90], A2: [70, 110], B1: [90, 130], B2: [110, 150], C1: [120, 160], C2: [130, 170] };
export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const WEIGHTS = { pace: 0.35, continuity: 0.25, completion: 0.2, cleanliness: 0.2 };
export const PAUSE_MS = { short: 1000, long: 2000 };

const clamp = (x, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, x));
const lvl = (l) => (LEVELS.includes(l) ? l : "A1");

/** Seconds of actual speech: first speech → last result. Falls back to the whole recording. */
export function speechSeconds({ durationMs, speechStartMs, speechEndMs }) {
  const total = Math.max(0, Number(durationMs) || 0) / 1000;
  if (Number.isFinite(speechStartMs) && Number.isFinite(speechEndMs) && speechEndMs - speechStartMs >= 800) return (speechEndMs - speechStartMs) / 1000;
  return total;
}

/** Words per minute, or 0 when the figure would be meaningless (too short to measure). */
export function wpmOf(words, seconds) {
  if (!(words >= 3) || !(seconds >= 1.5)) return 0;
  const w = Math.round((words / seconds) * 60);
  return w >= 10 && w <= 400 ? w : 0;
}

/** 100 inside the band, falling to 0 when 60% outside it. */
export function paceScore(wpm, level) {
  if (!wpm) return null;
  const [lo, hi] = PACE_BAND[lvl(level)];
  if (wpm >= lo && wpm <= hi) return 100;
  const dist = wpm < lo ? (lo - wpm) / lo : (wpm - hi) / hi;
  return clamp(Math.round(100 - (dist / 0.6) * 100));
}

/**
 * Pauses from the timing of recogniser results.
 * segments: [{startMs, endMs}] in order. Needs ≥ 2 segments, otherwise pauses are NOT measurable.
 */
export function pauseStats(segments) {
  const s = (Array.isArray(segments) ? segments : []).filter((x) => x && Number.isFinite(x.startMs) && Number.isFinite(x.endMs));
  if (s.length < 2) return { measurable: false, count: 0, longCount: 0, totalMs: 0, longestMs: 0 };
  let count = 0, longCount = 0, totalMs = 0, longestMs = 0;
  for (let i = 1; i < s.length; i++) {
    const gap = s[i].startMs - s[i - 1].endMs;
    if (gap >= PAUSE_MS.short) { count++; totalMs += gap; longestMs = Math.max(longestMs, gap); if (gap >= PAUSE_MS.long) longCount++; }
  }
  return { measurable: true, count, longCount, totalMs, longestMs };
}

/* "like" is deliberately NOT here: it is a normal verb ("I like tea") and cannot be told apart from the filler in a transcript. */
const FILLERS = ["um", "uh", "er", "erm", "ah", "hmm", "basically", "actually", "literally"];
const FILLER_PHRASES = ["you know", "i mean", "kind of", "sort of"];
/** Fillers the recogniser actually returned (it often hides "um/uh", so this under-counts). */
export function countFillers(transcript) {
  const w = normalize(transcript); let n = 0; const found = [];
  w.forEach((x, i) => { if (FILLERS.includes(x)) { n++; found.push(x); } });
  const joined = " " + w.join(" ") + " ";
  for (const p of FILLER_PHRASES) { const m = joined.split(" " + p + " ").length - 1; if (m > 0) { n += m; found.push(p); } }
  return { count: n, found: [...new Set(found)] };
}

/**
 * Fluency ESTIMATE, 0–100, from up to four signals (weights in WEIGHTS; missing signals are dropped and the rest re-weighted):
 *   pace         wpm vs the comfortable band for the level
 *   continuity   1 − (time lost to long pauses ÷ speaking time)   [only when pauses are measurable]
 *   completion   share of the target reached (read/shadow) or of the recommended time spoken (free)
 *   cleanliness  1 − repeats and fillers per word (×5, capped)
 */
export function fluencyEstimate({ wpm, level, completion, repeats = 0, fillers = 0, words = 0, pauses, speechSec }) {
  const parts = {};
  const p = paceScore(wpm, level); if (p !== null) parts.pace = p;
  if (pauses && pauses.measurable && speechSec > 0) parts.continuity = clamp(Math.round(100 - ((pauses.totalMs / 1000) / speechSec) * 100));
  if (Number.isFinite(completion)) parts.completion = clamp(Math.round(completion));
  if (words > 0) parts.cleanliness = clamp(Math.round(100 - Math.min(1, ((repeats + fillers) / words) * 5) * 100));
  const keys = Object.keys(parts);
  if (!keys.length) return { score: 0, parts, measurable: false, confidence: "none" };
  const wsum = keys.reduce((a, k) => a + WEIGHTS[k], 0);
  const score = Math.round(keys.reduce((a, k) => a + parts[k] * WEIGHTS[k], 0) / wsum);
  return { score: clamp(score), parts, measurable: true, confidence: keys.length >= 3 ? "medium" : "low" };
}

/* ───────────── free speaking: no target text, so nothing is compared word-for-word ───────────── */
const CONNECTORS = ["because", "but", "although", "however", "while", "which", "when", "if", "so", "and then", "therefore", "unless", "whereas", "since", "after", "before", "also"];

/** Metrics of an open answer. `variety` is Root-TTR (unique ÷ √words): less biased by length than plain type/token. */
export function freeMetrics(transcript) {
  const all = normalize(transcript);
  const { words, repeats } = collapseRepeats(all);
  const content = words.filter((w) => w.length > 2);
  const unique = new Set(content).size;
  const joined = " " + words.join(" ") + " ";
  let connectors = 0;
  for (const c of CONNECTORS) connectors += joined.split(" " + c + " ").length - 1;
  const fill = countFillers(transcript);
  return {
    words: all.length, uniqueWords: unique, repeats: repeats.length,
    variety: content.length ? Math.round((unique / Math.sqrt(content.length)) * 10) / 10 : 0,
    connectors, connectorsPer100: all.length ? Math.round((connectors / all.length) * 1000) / 10 : 0,
    fillers: fill.count, fillerWords: fill.found,
  };
}

/** Label for the vocabulary-variety figure (rough guideline; only meaningful from ~30 words). */
export function varietyLabel(m) {
  if (m.words < 30) return null;
  if (m.variety >= 6) return "high";
  if (m.variety >= 4) return "medium";
  return "basic";
}

/** Free-speaking fluency estimate: pace + continuity + how much of the recommended time was spoken + cleanliness. */
export function freeFluency({ transcript, durationMs, speechStartMs, speechEndMs, segments, level, recommendedSec = 60 }) {
  const m = freeMetrics(transcript);
  const sec = speechSeconds({ durationMs, speechStartMs, speechEndMs });
  const wpm = wpmOf(m.words, sec);
  const pauses = pauseStats(segments);
  const completion = clamp((sec / recommendedSec) * 100);
  const f = fluencyEstimate({ wpm, level, completion, repeats: m.repeats, fillers: m.fillers, words: m.words, pauses, speechSec: sec });
  return { ...f, metrics: m, wpm, speechSec: Math.round(sec), pauses };
}
