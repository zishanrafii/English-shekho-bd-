import { readFileSync } from "node:fs";
import { PACE_BAND, speechSeconds, wpmOf, paceScore, pauseStats, countFillers, fluencyEstimate, freeMetrics, varietyLabel, freeFluency, WEIGHTS } from "../speaking/scoring.js";
import { targetFeedback, freeFeedback, SHAMING } from "../speaking/feedback.js";
import { compare, normalize } from "../speaking/analyzer.js";
import { REPEAT, SHADOW, FREE, LEVELS, repeatSet, shadowSet, freeTopics, pick, segmentPassage, levelOf } from "../speaking/content.js";
import { update, needsPractice, trackable, THRESHOLD, MAX_TRACKED } from "../speaking/difficult.js";
import { reduce, initial, S, ERRORS } from "../speaking/state.js";
import { PASSAGES } from "../js/reading-data.js";
const out = []; const ok = (n, c) => out.push([n, !!c]);

/* ── timing + wpm ── */
ok("speech window uses first→last result when long enough, else whole recording", speechSeconds({ durationMs: 9000, speechStartMs: 2000, speechEndMs: 8000 }) === 6 && speechSeconds({ durationMs: 9000, speechStartMs: 2000, speechEndMs: 2400 }) === 9 && speechSeconds({ durationMs: 5000 }) === 5);
ok("wpm: 30 words in 20 s = 90", wpmOf(30, 20) === 90);
ok("wpm refuses to guess on tiny samples (< 3 words or < 1.5 s) or impossible values", wpmOf(2, 10) === 0 && wpmOf(10, 1) === 0 && wpmOf(500, 10) === 0 && wpmOf(3, 600) === 0);
ok("pace bands rise with level", LEVELS.every((l, i) => PACE_BAND[l][0] < PACE_BAND[l][1] && (i === 0 || PACE_BAND[l][0] > PACE_BAND[LEVELS[i - 1]][0])));
ok("paceScore: 100 inside the band, falls outside, 0 when ≥ 60% away, null when unmeasured", paceScore(80, "A1") === 100 && paceScore(40, "A1") < 100 && paceScore(40, "A1") > 0 && paceScore(10, "A1") === 0 && paceScore(0, "A1") === null);
ok("unknown level falls back to A1", paceScore(80, "Z9") === paceScore(80, "A1"));

/* ── pauses ── */
ok("pauses are NOT measurable from a single recogniser result", pauseStats([{ startMs: 0, endMs: 3000 }]).measurable === false && pauseStats([]).measurable === false && pauseStats(null).measurable === false);
const ps = pauseStats([{ startMs: 0, endMs: 2000 }, { startMs: 2300, endMs: 4000 }, { startMs: 5500, endMs: 7000 }, { startMs: 10000, endMs: 11000 }]);
ok("pauses: gaps ≥ 1 s counted, ≥ 2 s long (0.3 s ignored, 1.5 s short, 3 s long)", ps.measurable && ps.count === 2 && ps.longCount === 1 && ps.totalMs === 4500 && ps.longestMs === 3000);

/* ── fillers ── */
ok("fillers: words and phrases, honest about what the recogniser returned", (() => { const f = countFillers("Well I like, you know, basically football, um, and actually tennis"); return f.count === 4 && f.found.includes("you know") && f.found.includes("basically"); })());
ok("no fillers in clean speech", countFillers("I play football every Sunday with my friends").count === 0);

/* ── fluency estimate ── */
const good = fluencyEstimate({ wpm: 100, level: "B1", completion: 100, repeats: 0, fillers: 0, words: 40, pauses: { measurable: true, totalMs: 0 }, speechSec: 24 });
ok("good speech → 100 with medium confidence", good.score === 100 && good.confidence === "medium");
const slow = fluencyEstimate({ wpm: 40, level: "B1", completion: 100, repeats: 0, fillers: 0, words: 40, pauses: { measurable: true, totalMs: 12000 }, speechSec: 60 });
ok("slow + pauses → clearly lower", slow.score < good.score - 20 && slow.parts.continuity === 80);
ok("repeats/fillers lower the cleanliness part", fluencyEstimate({ wpm: 100, level: "B1", completion: 100, repeats: 6, fillers: 4, words: 40 }).parts.cleanliness < 60);
ok("missing signals are dropped and the rest re-weighted (not scored as zero)", (() => { const f = fluencyEstimate({ wpm: 100, level: "B1", completion: 100, words: 0 }); return f.score === 100 && !("continuity" in f.parts); })());
ok("no signals at all → not measurable (score 0, confidence none)", (() => { const f = fluencyEstimate({}); return !f.measurable && f.confidence === "none"; })());
ok("weights add to 1", Math.abs(Object.values(WEIGHTS).reduce((a, b) => a + b, 0) - 1) < 1e-9);
let bounds = true; for (let i = 0; i < 500; i++) { const f = fluencyEstimate({ wpm: Math.random() * 400, level: LEVELS[i % 6], completion: Math.random() * 150 - 20, repeats: Math.random() * 30, fillers: Math.random() * 30, words: Math.random() * 100, pauses: { measurable: true, totalMs: Math.random() * 200000 }, speechSec: Math.random() * 100 }); if (f.score < 0 || f.score > 100) bounds = false; }
ok("500 random inputs: score always within 0–100", bounds);

/* ── free speaking never compares with a target ── */
const long = "Last weekend I went to my grandmother's house because she was feeling lonely. We cooked together and she told me stories about her childhood, which I really enjoyed. Although it was a long journey, I think it was worth it, so I want to visit her more often.";
const fm = freeMetrics(long);
ok("free metrics: words, unique words, connectors detected", fm.words > 45 && fm.uniqueWords > 25 && fm.connectors >= 4 && fm.variety > 4);
ok("variety label needs ≥ 30 words, else null", varietyLabel({ words: 12, variety: 6 }) === null && ["high", "medium", "basic"].includes(varietyLabel(fm)));
const ff = freeFluency({ transcript: long, durationMs: 30000, speechStartMs: 1000, speechEndMs: 29000, segments: [{ startMs: 1000, endMs: 12000 }, { startMs: 12400, endMs: 29000 }], level: "B1", recommendedSec: 30 });
ok("free fluency: measurable, wpm sane, completion from time spoken (28 s ≈ 93%)", ff.measurable && ff.wpm > 90 && ff.wpm < 130 && ff.parts.completion >= 90 && ff.parts.completion <= 95);
ok("free fluency does NOT depend on any target text (same words in a different order score the same)", (() => { const shuffled = long.split(" ").reverse().join(" "); const a = freeFluency({ transcript: shuffled, durationMs: 30000, level: "B1", recommendedSec: 30 }); const b = freeFluency({ transcript: long, durationMs: 30000, level: "B1", recommendedSec: 30 }); return a.score === b.score; })());
ok("free speaking never calls the target comparison (no wordAccuracy anywhere in its result)", !("wordAccuracy" in ff) && !("wordAccuracy" in ff.metrics));
ok("empty / garbage free speech does not crash", [null, "", "   ", "😀", 42].every((t) => { try { return freeFluency({ transcript: t, durationMs: 1000, level: "A1" }).metrics.words === 0; } catch { return false; } }));

/* ── feedback tone ── */
const T = "I usually wake up at seven";
const mk = (said, mode = "repeat", wpm = 0) => targetFeedback({ mode, level: "A2", cmp: compare(T, said), wpm, fluency: null, difficult: [] });
const samples = [mk("I usually wake up at seven"), mk("I usually make up at seven"), mk("I wake up"), mk("banana"), mk(""), mk("I usually wake up at seven", "shadow", 30), mk("I usually wake up at seven", "shadow", 190), mk("I usually wake up at seven", "read", 90)];
ok("feedback never shames (8 situations)", samples.every((f) => !SHAMING.test([f.headline, ...f.lines, ...f.next].join(" "))));
ok("an almost-right answer names the exact word to practise", /“wake”/.test(mk("I usually make up at seven").lines.join(" ")));
ok("a perfect answer is celebrated", mk("I usually wake up at seven").headline.includes("🎉"));
ok("empty transcript gets a gentle 'we could not hear you' message with a next step", (() => { const f = mk(""); return f.tone === "gentle" && f.next.length >= 1 && f.headline.includes("শুনতে পাইনি"); })());
ok("every feedback has a headline and at least one next step", samples.every((f) => f.headline && f.next.length >= 1));
ok("repeat mode does not comment on pace (one short sentence)", !/শব্দ\/মিনিট/.test(mk("I usually wake up at seven", "repeat", 150).lines.join(" ")));
ok("repeated difficult word is mentioned with its count", targetFeedback({ mode: "repeat", level: "A1", cmp: compare(T, "I usually make up at seven"), difficult: [{ word: "wake", count: 3 }] }).lines.join(" ").includes("৩ বার"));
const fr = freeFeedback({ level: "B1", f: ff, recommendedSec: 60 });
ok("free feedback: positive tone, concrete next step, no shaming", fr.tone === "positive" && fr.next.length >= 1 && !SHAMING.test([fr.headline, ...fr.lines, ...fr.next].join(" ")));
ok("free feedback for a near-empty answer is gentle", freeFeedback({ level: "A1", f: freeFluency({ transcript: "hello", durationMs: 2000, level: "A1" }), recommendedSec: 30 }).tone === "gentle");

/* ── content ── */
ok("6 levels × 8 repeat sentences, 6 shadowing, 5 free topics", LEVELS.every((l) => REPEAT[l].length === 8 && SHADOW[l].length === 6 && FREE[l].length === 5));
ok("sentences get longer with level (average words)", (() => { const avg = (a) => a.reduce((s, x) => s + x.split(" ").length, 0) / a.length; return LEVELS.every((l, i) => i === 0 || avg(REPEAT[l]) >= avg(REPEAT[LEVELS[i - 1]]) - 0.5) && avg(REPEAT.C2) > avg(REPEAT.A1) * 2; })());
ok("A1 sentences are very short (≤ 6 words)", REPEAT.A1.every((s) => s.split(" ").length <= 6));
ok("every free topic has 3 prompts and a recommended time that grows with level", LEVELS.every((l, i) => FREE[l].every((t) => t.prompts.length === 3 && t.sec >= 30) && (i === 0 || FREE[l][0].sec >= FREE[LEVELS[i - 1]][0].sec)));
ok("the topics named in the brief exist (My Family, My Hometown, A Difficult Decision, Remote Work)", [["A1", "My Family"], ["A2", "My Hometown"], ["B1", "A Difficult Decision"], ["B2", "Remote Work"]].every(([l, t]) => FREE[l].some((x) => x.title === t)));
ok("ids are unique", new Set(LEVELS.flatMap((l) => FREE[l].map((t) => t.id))).size === 30);
ok("unknown level → A1 content", repeatSet("zz") === REPEAT.A1 && shadowSet(undefined) === SHADOW.A1 && freeTopics(null) === FREE.A1 && levelOf("B2") === "B2");
ok("daily pick is stable for a seed and varies across seeds", pick(REPEAT.A1, "2026-10-04") === pick(REPEAT.A1, "2026-10-04") && new Set(Array.from({ length: 20 }, (_, i) => pick(REPEAT.A1, "d" + i))).size > 3);
ok("all content is normalisable (no empty targets)", LEVELS.every((l) => [...REPEAT[l], ...SHADOW[l]].every((s) => normalize(s).length >= 3)));

/* ── read aloud segmentation on ALL real passages ── */
let segBad = [], maxW = 0, total = 0, lossy = 0;
for (const p of PASSAGES) {
  const segs = segmentPassage(p.text, 30);
  total += segs.length;
  const joined = normalize(segs.map((s) => s.text).join(" ")).join(" "), orig = normalize(p.text.join(" ")).join(" ");
  if (joined !== orig) lossy++;
  for (const s of segs) { maxW = Math.max(maxW, s.words); if (s.words > 60 || s.words < 1) segBad.push(p.id); }
}
ok(`all ${PASSAGES.length} passages split into short segments (${total} total, longest ${maxW} words, none lost or duplicated)`, segBad.length === 0 && lossy === 0 && maxW <= 60);
ok("a long passage is never one giant recording", PASSAGES.every((p) => segmentPassage(p.text, 30).length >= 2 || p.text.join(" ").split(/\s+/).length <= 35));
ok("segmenting junk is safe", [null, [], "", ["   "], [42]].every((x) => { try { return Array.isArray(segmentPassage(x)); } catch { return false; } }));

/* ── difficult words ── */
const c1 = compare(T, "I usually make up at seven");
let { next, changed } = update({}, c1);
ok("problem word +1; correctly-said words stay absent", next.wake === 1 && changed.wake === 1 && !("usually" in next));
({ next } = update(next, c1)); ({ next } = update(next, c1));
ok(`after ${THRESHOLD} problems the word 'needs practice'`, needsPractice(next).length === 1 && needsPractice(next)[0].word === "wake" && needsPractice(next)[0].count === 3);
({ next, changed } = update(next, compare(T, "I usually wake up at seven")));
ok("saying it correctly lowers the count (fades away)", next.wake === 2 && changed.wake === 2);
ok("count reaching zero removes the word locally and writes 0 over the stored value", (() => { const r = update({ wake: 1 }, compare(T, "I usually wake up at seven")); return !("wake" in r.next) && r.changed.wake === 0; })());
ok("'like' is a verb, not a filler (no false positives on 'I like tea')", countFillers("I like tea and I like football").count === 0);
ok("only plain a–z words ≥ 3 letters are tracked (safe Firestore field names, no 'a', 'I', 'at')", trackable("wake") && !trackable("at") && !trackable("i") && !trackable("don't") && !trackable("sore throat") && !trackable("7"));
ok("map is capped at 60 words (Firestore rule)", (() => { const big = {}; for (let i = 0; i < 70; i++) big["w" + String.fromCharCode(97 + (i % 26)) + String.fromCharCode(97 + Math.floor(i / 26)) + "x"] = 1 + (i % 5); const { next: n } = update(big, compare("hello", "hello")); return Object.keys(n).length <= MAX_TRACKED; })());

/* ── state machine ── */
let st = initial();
ok("idle → prepare → ready → start → recording → stop → processing → done → result", (() => { let s = initial(); for (const e of ["prepare", "start", "stop", "done"]) s = reduce(s, { type: e }); return s.name === S.RESULT; })());
ok("impossible transitions are ignored (cannot record from idle, cannot stop when not recording)", reduce(initial(), { type: "start" }) === initial() || reduce(initial(), { type: "start" }).name === S.IDLE);
ok("retry returns to ready; next returns to idle", reduce({ name: S.RESULT }, { type: "retry" }).name === S.READY && reduce({ name: S.RESULT }, { type: "next" }).name === S.IDLE);
ok("failure from any active state lands in ERROR with the reason", [S.READY, S.RECORDING, S.PROCESSING].every((n) => { const s = reduce({ name: n }, { type: "fail", error: "mic-denied" }); return s.name === S.ERROR && s.error === "mic-denied"; }));
ok("unknown error codes are normalised, never undefined", reduce({ name: S.RECORDING }, { type: "fail", error: "weird" }).error === "recognition");
ok("from ERROR the learner chooses: retry → ready (never automatic)", reduce({ name: S.ERROR, error: "network" }, { type: "retry" }).name === S.READY && reduce({ name: S.ERROR, error: "network" }, { type: "start" }).name === S.ERROR);
ok("cancel while recording goes back to ready", reduce({ name: S.RECORDING }, { type: "cancel" }).name === S.READY);
ok("all eight error codes exist", ["mic-denied", "mic-unavailable", "unsupported", "no-speech", "too-short", "network", "recognition", "save-failed"].every((e) => ERRORS.includes(e)));

for (const [n, c] of out) console.log(c ? "PASS" : "FAIL", n);
process.exit(out.every(([, c]) => c) ? 0 : 1);
