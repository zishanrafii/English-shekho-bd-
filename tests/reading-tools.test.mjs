import { WPM_BAND, wpmOf, wpmFeedback, readingLevelFor, safeImageUrl } from "../learning/reading-tools.js";
import { PASSAGES } from "../js/reading-data.js";
import * as wordBank from "../learning/word-bank.js";
globalThis.__wb = wordBank;
const out = []; const ok = (n, c) => out.push([n, !!c]);

ok("wpm basic maths", wpmOf(200, 120) === 100 && wpmOf(300, 60) === 300);
ok("untrustworthy timing → 0 (instant skip / tab left open for an hour)", wpmOf(200, 2) === 0 && wpmOf(200, 7200) === 0 && wpmOf(0, 60) === 0 && wpmOf(200, 0) === 0);
ok("bands are ordered and rise with level", ["A1", "A2", "B1", "B2", "C1", "C2"].every((l, i, a) => WPM_BAND[l][0] < WPM_BAND[l][1] && (i === 0 || WPM_BAND[l][0] > WPM_BAND[a[i - 1]][0])));
ok("slow reader is encouraged, not scolded", (() => { const m = wpmFeedback(40, "B1"); return m.includes("ভালো অভ্যাস") && !/ধীর গতি খারাপ|কম|দুর্বল|ব্যর্থ/.test(m); })());
ok("in-band speed gets a positive message", wpmFeedback(120, "B1").includes("একদম ঠিক"));
ok("fast reader is reminded about understanding", wpmFeedback(200, "B1").includes("বুঝে"));
ok("absurdly fast → silence, never praise for skimming", wpmFeedback(480, "A1") === "");
ok("unknown level or zero → silence", wpmFeedback(100, "Z9") === "" && wpmFeedback(0, "B1") === "");

ok("profile level maps into the reading library (C2 → C1, unknown → null)", readingLevelFor("B1") === "B1" && readingLevelFor("C2") === "C1" && readingLevelFor("X") === null && readingLevelFor(undefined) === null);

ok("only https image URLs are allowed", safeImageUrl("https://lh3.googleusercontent.com/a/x=s96") !== "" && safeImageUrl("javascript:alert(1)") === "" && safeImageUrl("http://x.com/a.png") === "" && safeImageUrl('https://x.com/a.png");background:url(//evil') === "" && safeImageUrl("https://x.com/a b.png") === "");

/* all 63 real passages have usable vocab + questions for the new features */
const levels = new Set(PASSAGES.map((p) => p.level));
ok("passages cover A1–C1", ["A1", "A2", "B1", "B2", "C1"].every((l) => levels.has(l)));
ok("every passage has vocab with Bengali meanings", PASSAGES.every((p) => Object.keys(p.vocab).length >= 1 && Object.values(p.vocab).every((v) => v.meaning_bn && v.meaning_bn.length <= 80)));
ok("every vocab word of every passage actually occurs in its text (so a context sentence exists)", (() => {
  const { findSentence } = globalThis.__wb; let miss = [];
  for (const p of PASSAGES) for (const w of Object.keys(p.vocab)) if (!findSentence(p.text, w)) miss.push(p.id + ":" + w);
  globalThis.__miss = miss; return miss.length === 0;
})());
if (globalThis.__miss && globalThis.__miss.length) console.log("  words without a context sentence:", globalThis.__miss.slice(0, 8).join(", "), "… total", globalThis.__miss.length);

for (const [n, c] of out) console.log(c ? "PASS" : "FAIL", n);
process.exit(out.every(([, c]) => c) ? 0 : 1);
