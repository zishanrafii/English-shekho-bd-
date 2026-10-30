import { pct, masteryLevel, resultMessage, questionKey, topicKey, buildMistake, mistakeIsValid, mergeMastery, shuffled, weakTopics, stageFor, STAGES } from "../learning/grammar-practice.js";
import { readFileSync } from "node:fs";
const catalog = JSON.parse(readFileSync(new URL("../data/plan-catalog.json", import.meta.url)));
const out = []; const ok = (n, c) => out.push([n, !!c]);

ok("pct", pct(3, 4) === 75 && pct(0, 0) === 0 && pct(4, 4) === 100);
ok("mastery thresholds 80 / 60", masteryLevel(80).id === "mastered" && masteryLevel(79).id === "progress" && masteryLevel(60).id === "progress" && masteryLevel(59).id === "practice");
ok("messages are encouraging, never shaming", [0, 1, 2, 3, 4].every((c) => !/ব্যর্থ|খারাপ|দুর্বল|ফেল|হারি/.test(resultMessage(c, 4))));
ok("perfect score gets the celebration", resultMessage(4, 4).includes("🎉"));

/* question keys */
const k1 = questionKey("b1-t1", "1. I ___ (finish) my homework already.");
ok("key ignores the leading number", k1 === questionKey("b1-t1", "3.  I ___ (finish) my   homework already."));
ok("key differs by topic and by text", k1 !== questionKey("b1-t2", "1. I ___ (finish) my homework already.") && k1 !== questionKey("b1-t1", "1. She ___ (live) here."));
ok("key is a safe Firestore id (no slash, ≤ 40 chars)", /^[A-Za-z0-9_]+$/.test(k1) && k1.length <= 40);
ok("topicKey replaces hyphens", topicKey("a1-t1") === "a1_t1");

/* mistake documents */
const m = buildMistake({ topicId: "b1-t1", text: "1. I ___ (finish) my homework already.", opts: ["finish", "have finished", "finished"], picked: "finish", correct: "have finished", why: "Already → Present Perfect" }, "2026-10-02");
ok("mistake doc shape", m.topic === "b1-t1" && m.q.startsWith("I ___") && m.opts.length === 3 && m.fixed === false && m.last === "2026-10-02" && m.why);
ok("mistake doc is valid and keeps the correct option", mistakeIsValid(m));
const long = buildMistake({ topicId: "x".repeat(40), text: "q".repeat(500), opts: ["a".repeat(300), "b", "c", "d", "e"], picked: "p".repeat(300), correct: "b", why: "w".repeat(900) }, "2026-10-02");
ok("oversize input is clipped to the rule limits", long.topic.length <= 12 && long.q.length <= 200 && long.opts.length <= 4 && long.opts[0].length <= 80 && long.picked.length <= 80 && long.why.length <= 200);
ok("a 'mistake' where picked === correct is rejected", !mistakeIsValid({ ...m, picked: m.correct }));
ok("no 'why' key when there is no explanation", !("why" in buildMistake({ topicId: "t", text: "q", opts: ["a", "b"], picked: "a", correct: "b" }, "2026-10-02")));

/* mastery merge */
let r = mergeMastery(null, 50, "2026-10-01");
ok("first attempt", r.best === 50 && r.last === 50 && r.attempts === 1);
r = mergeMastery(r, 100, "2026-10-02");
ok("best rises, attempts count", r.best === 100 && r.last === 100 && r.attempts === 2);
r = mergeMastery(r, 25, "2026-10-03");
ok("a worse retry never lowers 'best' but updates 'last'", r.best === 100 && r.last === 25 && r.attempts === 3);

/* shuffle */
const orig = ["a", "b", "c", "d"]; const sh = shuffled(orig, () => 0.3);
ok("shuffle keeps the same items and does not mutate", sh.slice().sort().join() === "a,b,c,d" && orig.join() === "a,b,c,d");

/* weak topics feed the daily plan */
const mast = { a1_t1: { best: 100, last: 100, attempts: 2 }, a1_t2: { best: 50, last: 25, attempts: 1 }, a1_t3: { best: 60, last: 50, attempts: 1 }, a2_t1: { best: 90, last: 90, attempts: 1 }, b1_t1: { best: 20, last: 20, attempts: 1 } };
const weak = weakTopics(mast, catalog, "A2");
ok("weak = attempted and last < 60, weakest first", weak.map((t) => t.id).join() === "a1-t2,a1-t3");
ok("topics above the learner's level are not pushed", !weak.some((t) => t.id === "b1-t1"));
ok("never-attempted topics are not 'weak'", weakTopics({}, catalog, "C2").length === 0 && weakTopics(null, catalog, "C2").length === 0);

/* stage indicator */
const S = (o) => stageFor({ answered: 0, total: 4, wrong: 0, challengeOpen: false, challengeDone: false, ...o });
ok("stages follow the learner", S({}) === "learn" && S({ answered: 2 }) === "practice" && S({ answered: 4, wrong: 1 }) === "review" && S({ answered: 4, wrong: 1, challengeOpen: true }) === "challenge" && S({ answered: 4, wrong: 1, challengeOpen: true, challengeDone: true }) === "mastery" && S({ answered: 4, wrong: 0 }) === "mastery");
ok("pages without practice stay on 'learn'", stageFor({ answered: 0, total: 0, wrong: 0 }) === "learn");
ok("six stages in roadmap order", STAGES.map((s) => s.id).join() === "learn,example,practice,review,challenge,mastery");

for (const [n, c] of out) console.log(c ? "PASS" : "FAIL", n);
process.exit(out.every(([, c]) => c) ? 0 : 1);
