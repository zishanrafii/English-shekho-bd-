import { readFileSync } from "node:fs";
import { buildPlan, blocksFor, progressOf, encouragement, scoreSkills, SKILLS, daysBetween } from "../learning/daily-plan.js";
const catalog = JSON.parse(readFileSync(new URL("../data/plan-catalog.json", import.meta.url)));
const out = []; const ok = (n, c) => out.push([n, !!c]);
const base = { level: "B1", skills: ["speaking", "grammar"], dailyMinutes: 20, style: "conversation", reasons: ["job"] };
const day = "2026-10-01";

/* time budget */
for (const m of [10, 20, 30, 45, 60]) {
  const p = buildPlan({ profile: { ...base, dailyMinutes: m }, catalog, today: day });
  ok(`${m} min: blocks add up to the goal (±0)`, p.items.reduce((s, i) => s + i.minutes, 0) === (m === 10 ? 10 : m === 20 ? 20 : m === 30 ? 30 : m === 45 ? 45 : 60));
  ok(`${m} min: every skill appears at most once`, new Set(p.items.map((i) => i.skill)).size === p.items.length);
}
ok("blocksFor never empty", [5, 10, 20, 30, 45, 60, 90].every((m) => blocksFor(m).length >= 2));

/* determinism + stability */
const a = buildPlan({ profile: base, catalog, today: day }), b = buildPlan({ profile: base, catalog, today: day });
ok("same inputs → same plan", JSON.stringify(a) === JSON.stringify(b));
const locked = buildPlan({ profile: base, catalog, today: day, history: { speaking: day, grammar: day }, lockedSkills: a.items.map((i) => i.skill) });
ok("locked skills keep the plan stable after progress", locked.items.map((i) => i.skill).join() === a.items.map((i) => i.skill).join());
ok("variety: plan changes across days", new Set(Array.from({ length: 14 }, (_, d) => buildPlan({ profile: { ...base, skills: [], style: undefined, reasons: [] }, catalog, today: `2026-10-${String(d + 1).padStart(2, "0")}` }).items.map((i) => i.skill).join())).size > 3);

/* personalisation */
const focused = buildPlan({ profile: { ...base, dailyMinutes: 10 }, catalog, today: day });
ok("focus skills are chosen (10 min → speaking + grammar)", focused.items.map((i) => i.skill).sort().join() === "grammar,speaking");
const stale = buildPlan({ profile: { level: "A2", skills: [], dailyMinutes: 10 }, catalog, today: day, history: { vocabulary: day, listening: day, grammar: day, reading: day, quiz: day, speaking: "2026-09-20", writing: "2026-09-25" } });
ok("long-neglected skills come back (speaking, writing)", stale.items.map((i) => i.skill).sort().join() === "speaking,writing");
ok("neglected skill explains itself", stale.items.find((i) => i.skill === "speaking").why.includes("দিন"));
const gamer = scoreSkills({ style: "games", skills: [] }, {}, day), notGamer = scoreSkills({ style: "structured", skills: [] }, {}, day);
ok("quiz ranks higher for game-lovers", gamer.quiz.score > notGamer.quiz.score);
ok("brand-new learner (no profile) still gets a plan", buildPlan({ profile: null, catalog, today: day }).items.length === 4);

/* destinations */
const gram = (lvl, done) => buildPlan({ profile: { level: lvl, skills: ["grammar"], dailyMinutes: 10 }, catalog, today: day, grammarDone: done }).items.find((i) => i.skill === "grammar");
ok("grammar → first topic of the level", gram("A1", []).href === "topics/a1/alphabet-phonics.html");
ok("grammar skips completed topics (t1,t2 done → t3)", gram("A1", ["a1-t1", "a1-t2"]).href === catalog.topics.A1[2].href);
ok("grammar rolls to next level when all done", gram("A1", catalog.topics.A1.map((t) => t.id)).href.startsWith("topics/a2/"));
ok("grammar falls back when everything is done", gram("C2", Object.values(catalog.topics).flat().map((t) => t.id)).href === "grammar.html");
const writing = (lvl, reasons) => buildPlan({ profile: { level: lvl, skills: ["writing"], dailyMinutes: 10, reasons }, catalog, today: day }).items.find((i) => i.skill === "writing").href;
ok("writing: A1 → paragraph, B1+job → email, B2 → essay", writing("A1", []) === "paragraph-writing.html" && writing("B1", ["job"]) === "email-writing.html" && writing("B2", ["travel"]) === "essay-writing.html");
ok("vocabulary item opens Smart Review and names the level", (() => { const v = buildPlan({ profile: { level: "C1", skills: ["vocabulary"], dailyMinutes: 10 }, catalog, today: day }).items.find((i) => i.skill === "vocabulary"); return v.href === "vocab-review.html" && v.title.includes("C1"); })());

/* Phase 8: weak grammar topics come back first */
const mast = { a1_t1: { best: 100, last: 100, attempts: 2 }, a1_t2: { best: 40, last: 40, attempts: 1 } };
const gWeak = buildPlan({ profile: { level: "A2", skills: ["grammar"], dailyMinutes: 10 }, catalog, today: day, grammarDone: ["a1-t1", "a1-t2"], grammarMastery: mast }).items.find((i) => i.skill === "grammar");
ok("a weak (40%) topic is offered again before new topics", gWeak.href === catalog.topics.A1[1].href && gWeak.title.includes("আবার"));
ok("the reason names the earlier score", gWeak.why.includes("৪০%"));
const gOk = buildPlan({ profile: { level: "A2", skills: ["grammar"], dailyMinutes: 10 }, catalog, today: day, grammarDone: ["a1-t1"], grammarMastery: { a1_t1: { best: 100, last: 100, attempts: 2 } } }).items.find((i) => i.skill === "grammar");
ok("secure topics are not repeated — the next new topic of the learner's level is offered", gOk.href === catalog.topics.A2[0].href && !gOk.title.includes("আবার"));
const boost = scoreSkills({ skills: [] }, {}, day, { weakGrammar: true }).grammar.score > scoreSkills({ skills: [] }, {}, day, {}).grammar.score;
ok("unresolved weak grammar raises grammar's priority", boost);

/* every link points at a real file */
import { existsSync } from "node:fs";
const hrefs = new Set();
for (const lvl of ["A1", "A2", "B1", "B2", "C1", "C2"]) for (const sk of SKILLS) for (const job of [[], ["job"]]) {
  const p = buildPlan({ profile: { level: lvl, skills: [sk], dailyMinutes: 60, reasons: job, style: "games" }, catalog, today: day });
  p.items.forEach((i) => hrefs.add(i.href));
}
const missing = [...hrefs].filter((h) => !existsSync(new URL("../" + h, import.meta.url)));
ok("all plan links exist (" + hrefs.size + " distinct)" + (missing.length ? " MISSING " + missing : ""), missing.length === 0);

/* progress + tone */
ok("progress counts", progressOf(a, [a.items[0].id]).done === 1 && !progressOf(a, [a.items[0].id]).complete);
ok("complete when all done", progressOf(a, a.items.map((i) => i.id)).complete);
ok("completion message is positive", encouragement(4, 4, 20).includes("🎉"));
ok("no guilt language anywhere", ![encouragement(0, 4, 20), encouragement(2, 4, 20), encouragement(4, 4, 20)].some((m) => /মিস|ব্যর্থ|হারি|পিছিয়ে|streak/i.test(m)));
ok("daysBetween", daysBetween("2026-09-28", "2026-10-01") === 3 && daysBetween("bad", day) === null);

for (const [n, c] of out) console.log(c ? "PASS" : "FAIL", n);
process.exit(out.every(([, c]) => c) ? 0 : 1);
