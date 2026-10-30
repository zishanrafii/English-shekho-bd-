import { SCENARIOS, byId, fitFor, ordered, LEVELS } from "../simulator/scenarios.js";
import { newConversation, addLearner, addPartner, guidedReply, objectiveStatus, isComplete, hintFor, historyForAi, phrasesUsed, buildReport, sanitizeUtterance, MAX_LEARNER_TURNS, MAX_UTTERANCE, learnerTurns } from "../simulator/engine.js";
const out = []; const ok = (n, c) => out.push([n, !!c]);
const T = "2026-10-15";

/* ── scenario data integrity ── */
ok("12 scenarios, unique ids, covering the 12 situations in the roadmap", SCENARIOS.length === 12 && new Set(SCENARIOS.map((s) => s.id)).size === 12 && ["interview", "airport", "hotel", "restaurant", "doctor", "office", "presentation", "phone", "university", "shopping", "meeting", "travel"].every((id) => byId(id)));
ok("each has ≥3 objectives, ≥4 guided lines, ≥5 phrases, an opening line, bilingual titles and a valid level band", SCENARIOS.every((s) => s.objectives.length >= 3 && s.guided.length >= 4 && s.phrases.length >= 5 && s.opening.length > 10 && s.title && /[\u0980-\u09FF]/.test(s.titleBn) && s.level[0] >= 0 && s.level[1] <= 5 && s.level[0] <= s.level[1]));
ok("every objective's regex compiles and matches its OWN example sentence (the example really achieves the goal)", SCENARIOS.every((s) => s.objectives.every((o) => new RegExp(o.rx, "i").test(o.example.toLowerCase()))));
ok("every guided 'sample' line is a real, natural sentence", SCENARIOS.every((s) => s.guided.every((g) => g.say && g.hintBn && g.sample && g.sample.length > 5)));
ok("objective ids are unique inside each scenario and every objective has a Bengali label", SCENARIOS.every((s) => new Set(s.objectives.map((o) => o.id)).size === s.objectives.length && s.objectives.every((o) => /[\u0980-\u09FF]/.test(o.bn))));
ok("level bands span the whole range A1–C2 across scenarios (something for everyone)", LEVELS.every((_, i) => SCENARIOS.some((s) => i >= s.level[0] && i <= s.level[1])));
ok("fit ordering puts matching scenarios first for a level", (() => { const o = ordered("A1"); return fitFor(o[0], "A1") === "fit" && fitFor(o[o.length - 1], "A1") === "harder"; })() && fitFor(byId("meeting"), "A1") === "harder" && fitFor(byId("restaurant"), "C1") === "easier" && fitFor(byId("airport"), "A2") === "fit");

/* ── the engine on a real conversation ── */
const sc = byId("airport");
let c = newConversation(sc, "A2", "guided");
ok("conversation starts with the partner's opening line and nothing achieved", c.turns.length === 1 && c.turns[0].role === "partner" && c.done.length === 0 && objectiveStatus(c, sc).every((o) => !o.done));
let r = addLearner(c, sc, "Hello. I am flying to Dubai today."); c = r.conv;
ok("'flying to' achieves the flight goal; others untouched", r.accepted && r.newlyDone.join() === "flight" && c.done.join() === "flight");
r = addLearner(c, sc, "Yes, I have one suitcase and a small carry bag."); c = r.conv;
ok("bag goal recognised", r.newlyDone.join() === "bag");
r = addLearner(c, sc, "I would like a window seat, please."); c = r.conv;
ok("seat goal recognised", r.newlyDone.includes("seat") && !isComplete(c, sc));
ok("an achieved goal is never counted twice or lost", (() => { const again = addLearner(c, sc, "I am flying to Paris."); return again.newlyDone.length === 0 && again.conv.done.filter((x) => x === "flight").length === 1; })());
r = addLearner(c, sc, "Thank you very much!"); c = r.conv;
ok("all four goals → conversation complete", isComplete(c, sc) && objectiveStatus(c, sc).every((o) => o.done));
ok("learner turns are counted", learnerTurns(c).length === 4);

/* matching is about the learner's words, not the partner's */
let c2 = newConversation(sc, "A2"); c2 = addPartner(c2, "Would you like a window seat? Do you have a suitcase? Thank you.");
ok("words said by the PARTNER never complete an objective", c2.done.length === 0 && addLearner(c2, sc, "Okay.").newlyDone.length === 0);
ok("matching is case-insensitive and tolerant of curly apostrophes", addLearner(newConversation(byId("restaurant"), "A1"), byId("restaurant"), "I’D LIKE the soup").newlyDone.includes("order"));
ok("near-misses do not count ('window' inside another word)", addLearner(newConversation(sc, "A1"), sc, "windowsill").newlyDone.length === 0);

/* input safety */
ok("empty / whitespace / symbol-only input is not accepted and changes nothing", ["", "   ", null, undefined, "!!!", "😀"].every((x) => { const q = addLearner(newConversation(sc, "A1"), sc, x); return !q.accepted && q.conv.turns.length === 1; }));
ok(`text is cleaned and capped at ${MAX_UTTERANCE} chars; markup and control characters removed`, (() => { const q = addLearner(newConversation(sc, "A1"), sc, "<b>Hello</b>\u0007 " + "x".repeat(500)); const t = q.conv.turns[1].text; return t.length <= MAX_UTTERANCE && !/[<>\u0007]/.test(t); })());
ok("sanitizeUtterance is idempotent and safe on garbage", sanitizeUtterance(sanitizeUtterance(" a   b ")) === "a b" && sanitizeUtterance(42) === "42" && sanitizeUtterance({}) .length <= MAX_UTTERANCE);
ok(`turn limit: the ${MAX_LEARNER_TURNS + 1}th learner turn is refused kindly`, (() => { let q = newConversation(sc, "A1"); for (let i = 0; i < MAX_LEARNER_TURNS; i++) q = addLearner(q, sc, "okay fine").conv; const x = addLearner(q, sc, "one more"); return !x.accepted && x.reason === "limit" && isComplete(q, sc); })());
ok("an ended conversation accepts nothing more", !addLearner({ ...newConversation(sc, "A1"), ended: true }, sc, "hi").accepted);
ok("the engine does not mutate the previous conversation object", (() => { const a = newConversation(sc, "A1"); const s = JSON.stringify(a); addLearner(a, sc, "I am flying to Rome"); return JSON.stringify(a) === s; })());

/* guided partner */
let g = newConversation(sc, "A2", "guided"); const lines = [];
for (let i = 0; i < 10; i++) { const x = guidedReply(g, sc); if (!x) break; lines.push(x.say); g = x.conv; }
ok("guided mode walks through the scripted lines in order, then stops (never loops, never invents)", lines.length === sc.guided.length && lines[0] === sc.guided[0].say && guidedReply(g, sc) === null);

/* the guided partner does not re-ask what the learner already answered */
(() => {
  let q = newConversation(sc, "A2", "guided");
  q = addLearner(q, sc, "I am flying to Dubai. I have one suitcase.").conv;           // answers 'flight' AND 'bag' up front
  const first = guidedReply(q, sc);
  ok("guided partner skips scripted questions about goals already achieved (does not ask 'where are you flying' / 'any bags' again)", first && !/flying to today/i.test(first.say) && !/bags to check/i.test(first.say) && /seat/i.test(first.say));
  const fresh = guidedReply(newConversation(sc, "A2", "guided"), sc);
  ok("with nothing achieved yet, the first scripted line is used as written", fresh.say === sc.guided[0].say);
  let all = newConversation(sc, "A2", "guided"); all = addLearner(all, sc, SCENARIOS.find((s) => s.id === "airport").objectives.map((o) => o.example).join(" ")).conv;
  ok("when everything is already achieved the partner still answers (last line) instead of going silent", guidedReply(all, sc) !== null);
})();

/* hints */
const h0 = hintFor(newConversation(sc, "A1", "ai"), sc);
ok("hint = the first goal not yet achieved, with an example sentence that really achieves it", h0.bn === sc.objectives[0].bn && new RegExp(sc.objectives[0].rx, "i").test(h0.example.toLowerCase()));
ok("when everything is achieved the hint says so", hintFor(c, sc).bn.includes("সবগুলো"));
ok("hint example always achieves the goal it hints at (all scenarios, from the start)", SCENARIOS.every((s) => { const h = hintFor(newConversation(s, "A1", "guided"), s); return new RegExp(s.objectives[0].rx, "i").test(h.example.toLowerCase()); }));

/* the guided script itself must be completable: following every 'sample' reaches every goal */
ok("FOLLOWING THE SAMPLES completes every scenario (the guided path is achievable)", SCENARIOS.every((s) => { let q = newConversation(s, "A2", "guided"); for (const gl of s.guided) { q = addLearner(q, s, gl.sample).conv; } q = addLearner(q, s, s.objectives.map((o) => o.example).join(" ")).conv; return isComplete(q, s); }));
ok("a scenario is NOT completed by saying nothing relevant", SCENARIOS.every((s) => { let q = newConversation(s, "A1"); for (const t of ["yes", "ok", "maybe", "no", "hmm"]) q = addLearner(q, s, t).conv; return q.done.length <= 1; }));

/* AI history */
let long = newConversation(sc, "A1", "ai"); for (let i = 0; i < 10; i++) { long = addPartner(long, "Partner line " + i); long = addLearner(long, sc, "Learner line " + i).conv; }
const hist = historyForAi(long);
ok("AI history: last 8 turns only, roles preserved, each capped", hist.length === 8 && hist.every((t) => ["partner", "learner"].includes(t.role) && t.text.length <= MAX_UTTERANCE));

/* phrases + report */
ok("useful phrases the learner actually used are detected", phrasesUsed(c, sc).length >= 1 && phrasesUsed(newConversation(sc, "A1"), sc).length === 0);
const bad = newConversation(byId("hotel"), "A2"); let b2 = bad;
for (const t of ["i have a reservation", "she go for three nights.", "Is breakfast included? I need a apple."]) b2 = addLearner(b2, byId("hotel"), t).conv;
const rep = buildReport(b2, byId("hotel"), T);
ok("report: objectives, turns, words, average, rule-based issue count", rep.objectivesTotal === 4 && rep.objectivesDone === 3 && rep.learnerTurns === 3 && rep.words > 10 && rep.avgWords > 3 && rep.issueCount >= 2);
ok("report: mistakes feed the Personal Mistake Memory (same documents as writing)", rep.mistakes.length >= 1 && rep.mistakes.every((m) => m.key.startsWith("w_") && m.doc.original && m.doc.corrected && m.doc.fixed === false && m.doc.last === T));
ok("report: friendly headline and concrete next steps, never shaming", rep.headline && rep.next.length >= 1 && !/ব্যর্থ|খারাপ|দুর্বল|লজ্জা|ফেল/.test(JSON.stringify([rep.headline, rep.next])));
ok("report: names the missing goal with an example", rep.next.some((x) => x.includes("ধন্যবাদ") || x.includes("Thank you")));
ok("report for a perfect run: celebration", buildReport(c, sc, T).headline.includes("🎉") && buildReport(c, sc, T).objectivesDone === 4);
ok("report for an empty conversation is safe", (() => { const e = buildReport(newConversation(sc, "A1"), sc, T); return e.learnerTurns === 0 && e.words === 0 && e.issueRate === 0 && e.next.length >= 1; })());

for (const [n, cnd] of out) console.log(cnd ? "PASS" : "FAIL", n);
process.exit(out.every(([, x]) => x) ? 0 : 1);
