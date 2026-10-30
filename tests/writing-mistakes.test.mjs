import { mistakeKey, contextOf, expandIssue, collect, summarize, checkAnswer, acceptAi, STORED, MAX_PER_CHECK, norm } from "../writing/mistakes.js";
import { check } from "../writing/analyzer.js";
const out = []; const ok = (n, c) => out.push([n, !!c]);
const T = "2026-10-08";

ok("key is stable, safe and depends on category + wording only", mistakeKey("article", "a apple") === mistakeKey("article", "A  apple!") && mistakeKey("article", "a apple") !== mistakeKey("tense", "a apple") && /^w_[a-z]+_[a-z0-9]+$/.test(mistakeKey("word-choice", "x")) && mistakeKey("article", "a apple").length <= 40);
const text = "I went to school. She ate a apple at lunch. He go home late.";
ok("context is the sentence that contains the mistake", contextOf(text, text.indexOf("a apple")) === "She ate a apple at lunch.");
const issues = check(text);
const art = issues.find((i) => i.rule === "a-an"), sva = issues.find((i) => i.rule === "sva-3sg");
ok("a/an issue expands to the pair: 'a apple' → 'an apple'", (() => { const x = expandIssue(text, art); return x.original === "a apple" && x.corrected === "an apple"; })());
ok("agreement issue expands to the subject too: 'He go' → 'He goes'", (() => { const x = expandIssue(text, sva); return x.original === "He go" && x.corrected === "He goes"; })());

const docs = collect({ text, issues, today: T });
ok("memory keeps the knowledge-gap categories only (article, agreement) — not capitals/punctuation", docs.length === 2 && docs.every((d) => STORED.includes(d.doc.category)));
ok("each stored mistake: original/corrected differ, in the text, Bengali reason, context sentence, unresolved", docs.every((d) => d.doc.original !== d.doc.corrected && text.includes(d.doc.original) && /[\u0980-\u09FF]/.test(d.doc.why) && d.doc.context && d.doc.fixed === false && d.doc.last === T));
ok("the same text checked twice gives the same keys (no duplicates in memory)", JSON.stringify(collect({ text, issues, today: T }).map((d) => d.key)) === JSON.stringify(docs.map((d) => d.key)));
ok("rule + AI finding the SAME mistake is stored once", collect({ text, issues, ai: [{ original: "a apple", corrected: "an apple", category: "article", explanationBn: "x" }], today: T }).length === 2);
ok("AI-only findings are added", collect({ text, issues: [], ai: [{ original: "at lunch", corrected: "during lunch", category: "preposition", explanationBn: "পছন্দ" }], today: T }).length === 1);
ok("an AI 'correction' whose quote is not in the text is never stored", collect({ text, issues: [], ai: [{ original: "this was never written", corrected: "x", category: "tense", explanationBn: "x" }], today: T }).length === 0);
ok("no-change 'corrections' are ignored", collect({ text, issues: [], ai: [{ original: "at lunch", corrected: "At  lunch.", category: "other", explanationBn: "" }], today: T }).length === 0);
ok(`never more than ${MAX_PER_CHECK} per check`, collect({ text: "x", issues: [], ai: Array.from({ length: 30 }, (_, i) => ({ original: "w" + i, corrected: "z" + i, category: "other" })), today: T }).length === 0 && (() => { const big = Array.from({ length: 30 }, (_, i) => "word" + i).join(" "); return collect({ text: big, issues: [], ai: Array.from({ length: 30 }, (_, i) => ({ original: "word" + i, corrected: "fixed" + i, category: "other" })), today: T }).length === MAX_PER_CHECK; })());
ok("stored text is clipped and markup-free (rule limits: 160/220/240)", (() => { const t = "I " + "very ".repeat(60) + "<b>x</b>"; const d = collect({ text: t, issues: [], ai: [{ original: t.trim(), corrected: t.trim() + " y", category: "other", explanationBn: "e".repeat(500) }], today: T })[0]?.doc; return !d || (d.original.length <= 160 && d.corrected.length <= 160 && d.why.length <= 220 && d.context.length <= 240 && !/[<>]/.test(JSON.stringify(d))); })());

const sample = [{ category: "article", fixed: false }, { category: "article", fixed: false }, { category: "preposition", fixed: false }, { category: "tense", fixed: true }, { category: "tense", fixed: false }, { category: "article", fixed: true }, { category: "bogus", fixed: false }];
const sm = summarize(sample);
ok("summary groups unresolved mistakes, biggest first, ignores fixed and unknown categories", sm.map((x) => x.category + ":" + x.count).join() === "article:2,preposition:1,tense:1" && sm[0].label.includes("Articles"));
ok("summary of nothing is empty", summarize([]).length === 0 && summarize(null).length === 0);

const mk = { original: "a apple", corrected: "an apple" };
ok("review answer: exact (case/punctuation-insensitive) → correct; the wrong version again → 'same'; other → wrong; blank → empty", checkAnswer("An Apple.", mk) === "correct" && checkAnswer("a apple", mk) === "same" && checkAnswer("one apple", mk) === "wrong" && checkAnswer("  ", mk) === "empty");
ok("acceptAi (client-side defence): drops non-strings, no-ops, unquoted, oversize; fixes unknown categories", (() => { const r = acceptAi("She ate a apple.", [{ original: "a apple", corrected: "an apple", category: "article", explanationBn: "ok" }, { original: "nope", corrected: "x", category: "tense" }, { original: 5, corrected: "x" }, { original: "a apple", corrected: "a apple" }, { original: "ate", corrected: "eats", category: "<x>" }, null]); return r.length === 2 && r[1].category === "other" && r.every((c) => "She ate a apple.".includes(c.original)); })());
ok("acceptAi on garbage input is safe", acceptAi("x", "nope").length === 0 && acceptAi("x", null).length === 0 && acceptAi("x", [1, "a", {}]).length === 0);
ok("norm helper", norm("  Hello,   WORLD! ") === "hello world");

for (const [n, c] of out) console.log(c ? "PASS" : "FAIL", n);
process.exit(out.every(([, c]) => c) ? 0 : 1);
