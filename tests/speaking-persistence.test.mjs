import { readFileSync } from "node:fs";
import { buildSessionDoc, buildUserUpdate, goalReached, dayMessage, GOAL, averageAccuracy } from "../speaking/persistence.js";
import { analyzeAttempt } from "../speaking/engine.js";
import { speakingSessionOk, speakingStatsOk, planProgressOk, planHistoryOk, applyUpdate, ops } from "./rules-mirror.mjs";
const catalog = JSON.parse(readFileSync(new URL("../data/plan-catalog.json", import.meta.url)));
const out = []; const ok = (n, c) => out.push([n, !!c]);
const T = "2026-10-04", UID = "alice";
const raw = (t, extra = {}) => ({ transcript: t, confidence: 0.9, durationMs: 3500, speechStartMs: 300, speechEndMs: 3200, segments: [{ startMs: 300, endMs: 3200 }], error: null, ...extra });
const SENT = "I usually wake up at seven";
const a1 = analyzeAttempt({ mode: "repeat", level: "A2", target: SENT, raw: raw("I usually make up at seven") });
const sess = (over = {}) => buildSessionDoc({ uid: UID, mode: "repeat", level: "A2", activityId: "repeat:A2:0", prompt: SENT, analysis: a1, attempts: 2, today: T, serverTimestamp: "NOW", ...over });

/* ── session document ── */
const d = sess();
ok("session doc passes the rules mirror", speakingSessionOk(d, UID));
ok("it carries the structured result (mode, level, activity, transcript, duration, accuracy, difficult words)", d.mode === "repeat" && d.level === "A2" && d.activityId === "repeat:A2:0" && d.transcript && d.durationSec === 3.5 && d.wordAccuracy === 83 && d.difficultWords.join() === "wake" && d.attempts === 2);
ok("history compatibility: scores.overall exists (the old history list reads it)", d.scores.overall === 83);
ok("free speaking: no wordAccuracy/completion, overall = fluency estimate", (() => { const fa = analyzeAttempt({ mode: "free", level: "B1", recommendedSec: 60, raw: raw("I want to be a teacher because I like children and education is important", { durationMs: 12000 }) }); const f = buildSessionDoc({ uid: UID, mode: "free", level: "B1", activityId: "free:b1-career", prompt: "My Future Career", analysis: fa, today: T, serverTimestamp: "NOW" }); return speakingSessionOk(f, UID) && !("wordAccuracy" in f) && f.scores.overall === f.fluency; })());
ok("no audio, no blob, no URL anywhere in the document", !/blob:|data:audio|audioUrl/.test(JSON.stringify(d)));
ok("oversize text is clipped to the rule limits", (() => { const big = buildSessionDoc({ uid: UID, mode: "free", level: "B1", activityId: "x".repeat(100), prompt: "p".repeat(900), analysis: { ...a1, transcript: "w ".repeat(2000), problemWords: [] }, today: T, serverTimestamp: "NOW" }); return speakingSessionOk(big, UID) && big.transcript.length <= 1500 && big.prompt.length <= 300 && big.activityId.length <= 40; })());
ok("markup is stripped from stored text", !/[<>]/.test(buildSessionDoc({ uid: UID, mode: "free", level: "B1", activityId: "a", prompt: "<b>x</b>", analysis: { ...a1, transcript: "<script>1</script> hello" }, today: T, serverTimestamp: "NOW" }).transcript));
ok("a missing uid is refused before anything is written", (() => { try { sess({ uid: "" }); return false; } catch { return true; } })());
ok("unknown level falls back to A1 (and never writes a bad level)", speakingSessionOk(sess({ level: "Z9" }), UID) && sess({ level: "Z9" }).level === "A1");

/* ── authorization (mirror of the rule) ── */
ok("writing another learner's uid is rejected", !speakingSessionOk({ ...d, uid: "bob" }, UID));
ok("a document with no uid is rejected", !speakingSessionOk((({ uid, ...r }) => r)(d), UID));
ok("client-chosen recordedAt (backdating) is rejected — only the server time passes", !speakingSessionOk({ ...d, recordedAt: "2020-01-01" }, UID) && speakingSessionOk(d, UID, "NOW"));
ok("impossible values are rejected (accuracy 150, fluency -1, xp 500, wpm 9000, 40 difficult words, bad mode, extra field)", [{ wordAccuracy: 150 }, { fluency: -1 }, { xpEarned: 500 }, { wpm: 9000 }, { difficultWords: Array(40).fill("aaa") }, { mode: "karaoke" }, { isAdmin: true }, { durationSec: 99999 }].every((bad) => !speakingSessionOk({ ...d, ...bad }, UID)));
ok("the OLD speaking page's documents still pass (compatibility)", speakingSessionOk({ uid: UID, displayName: "Rafi", prompt: "Describe your day", transcript: "I wake up at seven", wordCount: 5, scores: { fluency: 60, pronunciation: 70, confidence: 55, overall: 62 }, xpEarned: 20, dateStr: "2026-10-04", recordedAt: "NOW" }, UID));

/* ── user update: stats + difficult words + plan ── */
const profile = { level: "A2", skills: ["speaking"], dailyMinutes: 10, style: "conversation", reasons: ["travel"] };
let user = { displayName: "Rafi", learningProfile: profile };
const upd1 = buildUserUpdate({ analysis: a1, mode: "repeat", seconds: 8, today: T, userDoc: user, difficultChanged: a1.difficultChanged, catalog, ops });
let after = applyUpdate(user, upd1.update);
ok("first practice: counters, mode count, difficult word, today's marker — and the result still passes every rule", after.speakingStats.sessions === 1 && after.speakingStats.seconds === 8 && after.speakingStats.modes.repeat === 1 && after.speakingStats.difficult.wake === 1 && after.speakingStats.dayCount === 1 && speakingStatsOk(after) && planHistoryOk(after) && planProgressOk(after));
ok("accuracy is stored as sum + count (so an average needs no per-attempt writes)", after.speakingStats.accSum === 83 && after.speakingStats.accN === 1 && averageAccuracy(after.speakingStats) === 83);
ok("daily plan history records speaking", after.planHistory.speaking === T);
ok("ONE update writes everything (no per-second / per-keystroke writes)", Object.keys(upd1.update).length < 15);
ok("goal not yet reached after one item → message counts down", !upd1.reached && dayMessage({ dayCount: 1, reached: false }).includes("২টি"));
user = after;
/* each real attempt is analysed with the counts stored so far — exactly what the page does */
const again = () => analyzeAttempt({ mode: "repeat", level: "A2", target: SENT, raw: raw("I usually make up at seven"), difficultCounts: (user.speakingStats || {}).difficult || {} });
let a2 = again();
const upd2 = buildUserUpdate({ analysis: a2, mode: "repeat", seconds: 7, today: T, userDoc: user, difficultChanged: a2.difficultChanged, catalog, ops }); user = applyUpdate(user, upd2.update);
let a3 = again();
const upd3 = buildUserUpdate({ analysis: a3, mode: "repeat", seconds: 6, today: T, userDoc: user, difficultChanged: a3.difficultChanged, catalog, ops }); user = applyUpdate(user, upd3.update);
ok(`${GOAL.items} items in a day reach the goal ('Speaking goal completed')`, upd3.reached && upd3.dayCount === 3 && dayMessage({ dayCount: 3, reached: true }).includes("লক্ষ্য পূরণ"));
ok("the learner's plan (speaking is their focus skill) gets 'speaking' ticked, and the written plan shape passes the rules", upd3.planSynced && user.planProgress.done.includes("speaking") && user.planProgress.skills.includes("speaking") && user.planProgress.date === T && planProgressOk(user));
ok("difficult word count accumulates (3 problems)", user.speakingStats.difficult.wake === 3);
ok("a new day restarts the daily counter", buildUserUpdate({ analysis: a1, mode: "repeat", seconds: 5, today: "2026-10-05", userDoc: user, difficultChanged: {}, catalog, ops }).dayCount === 1);
const freeA = analyzeAttempt({ mode: "free", level: "A2", recommendedSec: 45, raw: raw("I went to my hometown last weekend and I met my family and we had a nice dinner together at home", { durationMs: 50000, speechStartMs: 500, speechEndMs: 49000 }) });
const upF = buildUserUpdate({ analysis: freeA, mode: "free", seconds: 50, today: "2026-10-06", userDoc: { learningProfile: profile }, catalog, ops });
ok("one free-speaking answer of ≥ 45 s reaches the goal on its own", upF.reached && goalReached({ dayCount: 1, mode: "free", durationSec: 45 }) && !goalReached({ dayCount: 1, mode: "free", durationSec: 20 }) && !goalReached({ dayCount: 2, mode: "repeat", durationSec: 99 }));
ok("free speaking adds no accuracy counters", !("speakingStats.accSum" in upF.update));
const noSpeak = buildUserUpdate({ analysis: a1, mode: "repeat", seconds: 5, today: "2026-10-07", userDoc: { learningProfile: { level: "A2", skills: ["grammar", "reading"], dailyMinutes: 10 }, speakingStats: { day: "2026-10-07", dayCount: 2 } }, difficultChanged: {}, catalog, ops });
ok("if speaking is NOT in today's plan the plan is left alone (but history still records the practice)", noSpeak.reached && !noSpeak.planSynced && !("planProgress" in noSpeak.update) && noSpeak.update["planHistory.speaking"] === "2026-10-07");
const locked = buildUserUpdate({ analysis: a1, mode: "repeat", seconds: 5, today: T, userDoc: { learningProfile: profile, planProgress: { date: T, done: ["vocabulary"], skills: ["vocabulary", "speaking"] }, speakingStats: { day: T, dayCount: 2 } }, difficultChanged: {}, catalog, ops });
ok("an already-locked plan is respected: existing ticks are kept, speaking added, skills unchanged", locked.update.planProgress.skills.join() === "vocabulary,speaking" && locked.update.planProgress.done.sort().join() === "speaking,vocabulary");
ok("difficult-word field names are only plain a–z words (safe dotted paths)", Object.keys(buildUserUpdate({ analysis: a1, mode: "repeat", seconds: 1, today: T, userDoc: {}, difficultChanged: { wake: 2, "don't": 1, "sore throat": 1, "7": 1, ok: 1 }, catalog, ops }).update).filter((k) => k.startsWith("speakingStats.difficult.")).join() === "speakingStats.difficult.wake");
ok("the stats map stays within its rule even with 80 difficult words", speakingStatsOk({ speakingStats: { difficult: Object.fromEntries(Array.from({ length: 80 }, (_, i) => ["w" + i, 1])) } }) && !speakingStatsOk({ speakingStats: { difficult: Object.fromEntries(Array.from({ length: 81 }, (_, i) => ["w" + i, 1])) } }));
ok("unknown stats keys or modes are rejected by the rule", !speakingStatsOk({ speakingStats: { admin: 1 } }) && !speakingStatsOk({ speakingStats: { modes: { hack: 1 } } }));


/* ── Phase 12: role-play sessions ── */
const simA = { mode: "sim", transcript: "I am flying to Dubai. I have one suitcase. A window seat, please. Thank you.", wordCount: 15, durationSec: 0, fluency: null, wpm: 0, turns: 4, problemWords: [], difficultChanged: {}, sim: { scenarioId: "airport", done: 4, total: 4 } };
const simDoc = buildSessionDoc({ uid: UID, mode: "sim", level: "A2", activityId: "sim:airport", prompt: "At the Airport", analysis: simA, attempts: 1, today: T, serverTimestamp: "NOW" });
ok("sim session document passes the rules mirror and carries scenario + deterministic goal progress", speakingSessionOk(simDoc, UID) && simDoc.mode === "sim" && simDoc.scenarioId === "airport" && simDoc.objectivesDone === 4 && simDoc.objectivesTotal === 4 && simDoc.turns === 4);
ok("sim: overall = share of goals achieved (history list compatibility); no accuracy/completion fields", simDoc.scores.overall === 100 && !("wordAccuracy" in simDoc) && !("completion" in simDoc));
ok("sim: 3 of 4 goals → overall 75", buildSessionDoc({ uid: UID, mode: "sim", level: "B1", activityId: "sim:x", prompt: "x", analysis: { ...simA, sim: { scenarioId: "x", done: 3, total: 4 } }, today: T, serverTimestamp: "NOW" }).scores.overall === 75);
ok("sim: impossible values rejected by the rule (11 goals, 99 turns, long scenario id)", [{ objectivesDone: 11 }, { turns: 99 }, { scenarioId: "x".repeat(30) }].every((bad) => !speakingSessionOk({ ...simDoc, ...bad }, UID)));
const upSim = buildUserUpdate({ analysis: simA, mode: "sim", seconds: 60, today: "2026-10-16", userDoc: { learningProfile: profile }, catalog, ops });
const afterSim = applyUpdate({ learningProfile: profile }, upSim.update);
ok("sim counts in the stats (modes.sim), WITHOUT touching the accuracy sum/count, and passes the stats rule", afterSim.speakingStats.modes.sim === 1 && !("accSum" in afterSim.speakingStats) && speakingStatsOk(afterSim) && planProgressOk(afterSim));
ok("one finished role-play (≥ 4 learner turns) completes the day's speaking goal and ticks the plan when speaking is planned", upSim.reached && upSim.planSynced && afterSim.planProgress.done.includes("speaking"));
ok("a very short role-play (2 turns) does not complete the goal on its own", !buildUserUpdate({ analysis: { ...simA, turns: 2 }, mode: "sim", seconds: 20, today: "2026-10-17", userDoc: { learningProfile: profile }, catalog, ops }).reached && goalReached({ dayCount: 1, mode: "sim", durationSec: 0, turns: 4 }) && !goalReached({ dayCount: 1, mode: "sim", durationSec: 0, turns: 3 }));
ok("another learner's uid is still rejected for sim sessions", !speakingSessionOk({ ...simDoc, uid: "bob" }, UID));

for (const [n, c] of out) console.log(c ? "PASS" : "FAIL", n);
process.exit(out.every(([, c]) => c) ? 0 : 1);
