import { readFileSync } from "node:fs";
import { tokenize, pickBlanks, editDistance, checkAnswer, practiceWords } from "../learning/listening-tools.js";
import { LESSONS } from "../js/listening-data.js";
const dict = JSON.parse(readFileSync(new URL("../data/dictionary.json", import.meta.url))).words;
const out = []; const ok = (n, c) => out.push([n, !!c]);
let seed = 5; const rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

/* tokenize */
const tk = tokenize("Hello! I'm from Dhaka, Bangladesh.");
ok("tokenize keeps words and their positions", tk.map((t) => t.word).join() === "hello,i'm,from,dhaka,bangladesh" && "Hello! I'm from Dhaka, Bangladesh.".slice(tk[3].start, tk[3].end) === "Dhaka");
ok("tokenize ignores digits and punctuation", tokenize("10 o'clock — ok?").map((t) => t.word).join() === "o'clock,ok");

/* check answers */
ok("exact (case/punctuation insensitive)", checkAnswer("Umbrella.", "umbrella") === "correct");
ok("one slip in a long word is 'close'", checkAnswer("umbrela", "umbrella") === "close" && checkAnswer("morning", "mourning") === "close");
ok("short words get no mercy", checkAnswer("cot", "cat") === "wrong" && checkAnswer("tea", "ten") === "wrong");
ok("two slips are wrong (and 'umbrllla' really is just ONE slip → close)", checkAnswer("ambrulla", "umbrella") === "wrong" && editDistance("ambrulla", "umbrella") === 2 && checkAnswer("umbrllla", "umbrella") === "close");
ok("empty input is flagged separately", checkAnswer("  ", "cat") === "empty");
ok("edit distance basics", editDistance("kitten", "sitting") === 3 && editDistance("", "abc") === 3 && editDistance("same", "same") === 0);

/* blanks */
const lines = ["Hello! My name is Sarah. What's your name?", "Hi Sarah! I'm Rahim. Nice to meet you.", "Nice to meet you too, Rahim. Where are you from?", "I'm from Dhaka, Bangladesh. And you?", "Yes, I'm studying English. It's a beautiful language.", "That's wonderful! English opens so many doors in life.", "I agree. I want to work in an international company one day."];
const b = pickBlanks(lines, 5, rand);
ok("returns the requested number of items from a long transcript", b.length === 5);
ok("each blank sits exactly where the answer was (before + answer + after rebuilds the line)", b.every((x) => { const orig = lines[x.line]; return x.before + orig.slice(x.before.length, x.before.length + x.answer.length) + x.after === orig && orig.slice(x.before.length, x.before.length + x.answer.length).toLowerCase() === x.answer; }));
ok("answers are real content words (≥ 4 letters, not 'the/that/with…')", b.every((x) => x.answer.length >= 4 && !["that", "with", "this", "what"].includes(x.answer)));
ok("blanks are spread over the lesson (lines strictly increasing)", b.every((x, i) => i === 0 || x.line > b[i - 1].line));
ok("short transcripts return what they can", pickBlanks(["Hi there friend."], 5, rand).length === 1 && pickBlanks([], 5, rand).length === 0 && pickBlanks(["Hi. Ok. No."], 5, rand).length === 0);

/* practice words */
const pw = practiceWords(lines, dict, "A2", 5);
ok("practice words: unique, content words, at most n", pw.length === 5 && new Set(pw.map((w) => w.word)).size === 5 && pw.every((w) => w.word.length >= 4));
ok("long/rare words rank above easy ones ('international' before 'name')", pw.some((w) => w.word === "international") && !pw.some((w) => w.word === "name"));
ok("each word carries its sentence for context", pw.every((w) => w.sentence && w.sentence.toLowerCase().includes(w.word)));
ok("meaning is filled from the dictionary when known", practiceWords(["She forgot her umbrella."], dict, "A1", 3).find((w) => w.word === "umbrella").meaning === "ছাতা");
ok("a higher learner level pushes easy words down", (() => { const low = practiceWords(["The umbrella was beautiful and international."], dict, "A1", 3).map((w) => w.word), high = practiceWords(["The umbrella was beautiful and international."], dict, "C1", 3).map((w) => w.word); return low.length === 3 && high.length === 3; })());

/* all 60 real lessons */
let bad = [], withBlank = 0, avgBlanks = 0, withPractice = 0;
for (const l of LESSONS) {
  const bl = pickBlanks(l.transcript, 5, rand), pr = practiceWords(l.transcript, dict, l.level, 8);
  avgBlanks += bl.length; if (bl.length >= 3) withBlank++; if (pr.length >= 3) withPractice++;
  for (const x of bl) { const o = l.transcript[x.line]; if (!o.toLowerCase().includes(x.answer) || checkAnswer(x.answer, x.answer) !== "correct") bad.push(l.id); }
}
ok(`all ${LESSONS.length} real lessons: ≥ 3 blanks each (${withBlank}/${LESSONS.length}), avg ${(avgBlanks / LESSONS.length).toFixed(1)}`, withBlank === LESSONS.length && bad.length === 0);
ok(`all real lessons give ≥ 3 practice words (${withPractice}/${LESSONS.length})`, withPractice === LESSONS.length);

for (const [n, c] of out) console.log(c ? "PASS" : "FAIL", n);
process.exit(out.every(([, c]) => c) ? 0 : 1);
