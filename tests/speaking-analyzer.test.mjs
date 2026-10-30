import { normalize, numberWords, collapseRepeats, align, compare, wordStates, isClose, editDistance } from "../speaking/analyzer.js";
const out = []; const ok = (n, c) => out.push([n, !!c]);

/* normalisation */
ok("lowercase, punctuation, extra spaces", normalize("  Hello,   World!! ").join() === "hello,world");
ok("digits become words (recognisers say '7')", normalize("I wake up at 7").join(" ") === "i wake up at seven" && normalize("21").join(" ") === "twenty one" && normalize("40").join() === "forty");
ok("numbers beyond 99 are ignored rather than mis-compared", normalize("in 2024 I").join(" ") === "in i");
ok("contractions expand the same way on both sides", normalize("I'm fine").join(" ") === "i am fine" && normalize("I am fine").join(" ") === "i am fine" && normalize("Don’t go").join(" ") === "do not go");
ok("hyphens split compound words", normalize("well-known").join(" ") === "well known");
ok("malformed input never throws", [null, undefined, 42, {}, [], "", "   ", "!!!", "😀😀", "123456"].every((x) => { try { return Array.isArray(normalize(x)); } catch { return false; } }));
ok("numberWords range", numberWords(0)[0] === "zero" && numberWords(99).join(" ") === "ninety nine" && numberWords(100) === null && numberWords(-1) === null && numberWords(1.5) === null);

/* repeats */
ok("single repeats collapse", (() => { const r = collapseRepeats(normalize("I I want to go")); return r.words.join(" ") === "i want to go" && r.repeats.join() === "i"; })());
ok("two-word phrase repeats collapse", (() => { const r = collapseRepeats(normalize("I want I want to eat")); return r.words.join(" ") === "i want to eat" && r.repeats[0] === "i want"; })());
ok("legitimate double words are not mistaken for phrase repeats ('that that' stays a repeat, 'very good very good' is a phrase repeat)", collapseRepeats(["very", "good", "very", "good"]).repeats.length === 1);

/* alignment & comparison */
const T = "I usually wake up at seven";
let c = compare(T, "I usually wake up at seven");
ok("perfect match → 100%, nothing missed", c.wordAccuracy === 100 && c.completion === 100 && c.missed.length === 0 && c.extra.length === 0 && !c.empty);
c = compare(T, "I usually wake up at 7");
ok("'7' counts as 'seven'", c.wordAccuracy === 100);
c = compare(T, "I usually make up at seven");
ok("one substitution: 5/6 = 83%, 'wake' is the problem word and the substitution is flagged 'close'", c.wordAccuracy === 83 && c.problemWords.join() === "wake" && c.substituted[0].heard === "make" && c.substituted[0].close === true);
c = compare(T, "I wake up at seven");
ok("omission detected ('usually' missed), others still match", c.missed.join() === "usually" && c.matched === 5 && c.wordAccuracy === 83);
c = compare(T, "I usually wake up at seven o'clock please");
ok("extra words ('o\'clock please') are reported but do not lower accuracy of the target words", c.extra.join() === "o'clock,please" && c.wordAccuracy === 100);
c = compare(T, "I usually wake wake wake up at seven");
ok("saying 'wake' three times = two repeats, reported but not counted as extra words", c.repeated.length === 2 && c.repeated.every((w) => w === "wake") && c.extra.length === 0 && c.wordAccuracy === 100);
c = compare(T, "I usually wake");
ok("stopping early → completion 50% (3 of 6 reached)", c.completion === 50 && c.missed.join() === "up,at,seven");
c = compare(T, "banana pizza guitar");
ok("nothing in common → 0% but not 'empty'", c.wordAccuracy === 0 && !c.empty);
c = compare(T, "");
ok("empty transcript is flagged", c.empty && c.wordAccuracy === 0 && c.completion === 0);
c = compare("", "hello");
ok("empty target never divides by zero", c.wordAccuracy === 0 && c.targetWords === 0);
ok("order matters: swapped words are not all 'matches'", compare("one two three", "three two one").wordAccuracy < 100);

/* near-miss logic */
ok("close = one letter off in a word of 4+ letters", isClose("wake", "make") && isClose("seven", "sevin") && !isClose("at", "it") && !isClose("wake", "week"));
ok("edit distance", editDistance("kitten", "sitting") === 3);

/* word-by-word states (for the ✓ ⚠ chips) */
const st = wordStates(T, "I usually make up seven");
ok("states: ok / close / missed in target order", st.map((s) => s.word + ":" + s.state).join(" ") === "i:ok usually:ok wake:close up:ok at:missed seven:ok");
ok("a substituted word keeps what was heard", st.find((s) => s.word === "wake").heard === "make");

/* score boundaries & robustness */
let bad = 0;
for (let i = 0; i < 400; i++) {
  const words = ["i", "usually", "wake", "up", "at", "seven", "and", "drink", "tea", "7", "I'm", "don't"];
  const pick = (n) => Array.from({ length: n }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
  const r = compare(pick(1 + (i % 9)), pick(i % 12));
  if (!(r.wordAccuracy >= 0 && r.wordAccuracy <= 100 && r.completion >= 0 && r.completion <= 100 && r.matched <= r.targetWords)) bad++;
  if (r.ops.filter((o) => o.op !== "ins").length !== r.targetWords) bad++;          // every target word is accounted for exactly once
}
ok("400 random comparisons: scores stay within 0–100 and every target word is accounted for once", bad === 0);

for (const [n, cnd] of out) console.log(cnd ? "PASS" : "FAIL", n);
process.exit(out.every(([, x]) => x) ? 0 : 1);
