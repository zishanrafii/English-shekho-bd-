/* ═══════════════════════════════════════════════════════════
   Conversation engine — pure, deterministic, no imports from Firebase.
   Everything that decides "did the learner achieve the goal?" is a regex on the
   learner's own words, so the result never depends on an AI guess.
   The AI (optional) only writes the PARTNER's next line.
   ═══════════════════════════════════════════════════════════ */
import { check, wordsOf, CATEGORIES } from "../writing/analyzer.js";
import { collect, summarize } from "../writing/mistakes.js";

export const MAX_LEARNER_TURNS = 12;
export const MAX_UTTERANCE = 300;

const clean = (s) => String(s == null ? "" : s).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_UTTERANCE);
export const sanitizeUtterance = clean;
const norm = (s) => String(s || "").toLowerCase().replace(/[’‘`]/g, "'");

/** @param mode "guided" (offline script) | "ai" (partner lines come from the server) */
export function newConversation(scenario, level, mode = "guided") {
  return { scenarioId: scenario.id, level, mode, turns: [{ role: "partner", text: scenario.opening }], done: [], guidedIdx: 0, ended: false };
}

const rxOf = (o) => new RegExp(o.rx, "i");

/** Which objectives the learner has achieved so far (never un-done). */
export function objectiveStatus(conv, scenario) {
  return scenario.objectives.map((o) => ({ id: o.id, bn: o.bn, example: o.example, done: conv.done.includes(o.id) }));
}

/**
 * Record what the learner said. Returns what changed. Immutable-ish: returns a NEW conversation.
 * @returns {{conv, accepted:boolean, newlyDone:string[], issues:Array, reason?:string}}
 */
export function addLearner(conv, scenario, text) {
  const t = clean(text);
  if (conv.ended) return { conv, accepted: false, newlyDone: [], issues: [], reason: "ended" };
  if (wordsOf(t).length < 1) return { conv, accepted: false, newlyDone: [], issues: [], reason: "empty" };
  if (conv.turns.filter((x) => x.role === "learner").length >= MAX_LEARNER_TURNS) return { conv, accepted: false, newlyDone: [], issues: [], reason: "limit" };
  const n = norm(t);
  const newlyDone = scenario.objectives.filter((o) => !conv.done.includes(o.id) && rxOf(o).test(n)).map((o) => o.id);
  const issues = check(t);
  return { conv: { ...conv, turns: [...conv.turns, { role: "learner", text: t }], done: [...conv.done, ...newlyDone] }, accepted: true, newlyDone, issues };
}

export function addPartner(conv, text) {
  const t = clean(text); if (!t) return conv;
  return { ...conv, turns: [...conv.turns, { role: "partner", text: t }] };
}

/** Next scripted partner line (Guided mode). After the script ends, a short closing line. null when nothing more to say. */
export function guidedReply(conv, scenario) {
  // A scripted line is aimed at one objective (the one its sample answer achieves). If the learner has already achieved it,
  // skip that line so the partner never asks something the learner has just answered.
  const aimed = (g) => scenario.objectives.find((o) => rxOf(o).test(norm(g.sample)));
  let i = conv.guidedIdx;
  while (i < scenario.guided.length - 1 && (() => { const o = aimed(scenario.guided[i]); return o && conv.done.includes(o.id); })()) i++;
  const g = scenario.guided[i];
  if (g) return { say: g.say, conv: { ...conv, guidedIdx: i + 1 } };
  return null;
}

export function learnerTurns(conv) { return conv.turns.filter((x) => x.role === "learner"); }
export function isComplete(conv, scenario) {
  return conv.done.length >= scenario.objectives.length || learnerTurns(conv).length >= MAX_LEARNER_TURNS;
}

/** A hint for what to say next: the first objective not yet achieved (and, in guided mode, the scripted line's hint). */
export function hintFor(conv, scenario) {
  const next = scenario.objectives.find((o) => !conv.done.includes(o.id));
  if (!next) return { bn: "সবগুলো লক্ষ্য পূরণ হয়েছে! চাইলে কথোপকথন শেষ করুন।", example: "" };
  const gi = Math.max(0, conv.guidedIdx - 1); const g = conv.mode === "guided" ? scenario.guided[gi] : null;
  return { bn: next.bn, example: (g && g.sample && !conv.done.includes(next.id) && new RegExp(next.rx, "i").test(norm(g.sample)) ? g.sample : next.example) };
}

/** Last turns, shaped for the AI route (capped). */
export function historyForAi(conv, n = 8) {
  return conv.turns.slice(-n).map((t) => ({ role: t.role, text: clean(t.text) }));
}

/** Useful phrases of the scenario that the learner actually used (loose, by their opening words). */
export function phrasesUsed(conv, scenario) {
  const said = norm(learnerTurns(conv).map((t) => t.text).join(" . "));
  return scenario.phrases.filter((p) => {
    const frag = norm(p).replace(/[….?!,]/g, " ").trim().split(/\s+/).slice(0, 3).join(" ");
    return frag.length >= 6 && said.includes(frag);
  });
}

/** End-of-conversation report. Deterministic; friendly; never scolding. */
export function buildReport(conv, scenario, today) {
  const L = learnerTurns(conv), all = L.map((t) => t.text).join(" ");
  const words = wordsOf(all).length;
  const status = objectiveStatus(conv, scenario);
  const doneN = status.filter((s) => s.done).length;
  const issues = check(all.split(/(?<=[.!?])\s+/).join("\n\n"));                // sentence-wise so capital/punctuation rules see each turn
  const perTurn = L.flatMap((t) => check(t.text));
  const mem = collect({ text: L.map((t) => t.text).join("\n\n"), issues: [], today });
  const mistakes = L.flatMap((t) => collect({ text: t.text, issues: check(t.text), today }));
  const dedup = new Map(); mistakes.forEach((m) => dedup.set(m.key, m));
  const stored = [...dedup.values()].slice(0, 10);
  const next = [];
  const missing = status.filter((s) => !s.done);
  if (missing.length) next.push(`আরেকবার চেষ্টা করুন: ${missing[0].bn} (যেমন: “${missing[0].example}”)`);
  const cats = summarize(stored.map((m) => ({ ...m.doc })));
  if (cats.length) next.push(`“${cats[0].label}”-এর ভুলগুলো ‘লেখার ভুল থেকে শেখা’-য় অনুশীলন করুন`);
  if (L.length && words / L.length < 4) next.push("উত্তর একটু বড় করুন: একটি বাক্যের বদলে দুটি বাক্যে বলুন");
  const used = phrasesUsed(conv, scenario);
  if (!used.length) next.push(`এই বাক্যাংশগুলো ব্যবহার করে দেখুন: ${scenario.phrases.slice(0, 2).join(" · ")}`);
  if (!next.length) next.push("চমৎকার! এবার একটি কঠিন দৃশ্য বেছে নিন");
  return {
    scenarioId: scenario.id, objectivesDone: doneN, objectivesTotal: status.length, status,
    learnerTurns: L.length, words, avgWords: L.length ? Math.round((words / L.length) * 10) / 10 : 0,
    issueCount: perTurn.length, issueRate: words ? Math.round((perTurn.length / words) * 1000) / 10 : 0,
    mistakes: stored, phrasesUsed: used, next,
    headline: doneN === status.length ? "🎉 সবগুলো লক্ষ্য পূরণ হয়েছে!" : doneN >= Math.ceil(status.length / 2) ? "👏 ভালো কথোপকথন! বেশিরভাগ লক্ষ্য পূরণ হয়েছে" : "ভালো শুরু! পরেরবার আরও কয়েকটি লক্ষ্য ছুঁতে পারবেন",
  };
}
