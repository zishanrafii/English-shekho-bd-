/* Save one finished role-play. Reuses the speaking persistence (same `speaking_sessions` collection, same daily-plan tick);
   the learner's English mistakes go into the writing Personal Mistake Memory. */
import { saveActivity } from "../speaking/save.js";
import { saveMistakes } from "../writing/save.js";
import { isoDay } from "../learning/srs.js";

export async function saveSimulation({ uid, userDoc, catalog, scenario, level, conv, report, spokenSeconds = 0 }) {
  const transcript = conv.turns.filter((t) => t.role === "learner").map((t) => t.text).join(" ");
  const analysis = {
    mode: "sim", transcript, wordCount: report.words, durationSec: Math.round(spokenSeconds * 10) / 10, fluency: null, wpm: 0,
    turns: report.learnerTurns, problemWords: [], difficultChanged: {}, sim: { scenarioId: scenario.id, done: report.objectivesDone, total: report.objectivesTotal },
  };
  const r = await saveActivity({ uid, userDoc, catalog, mode: "sim", level, activityId: "sim:" + scenario.id, prompt: scenario.title, analysis, attempts: 1, seconds: Math.max(5, Math.round(spokenSeconds)) });
  let mem = { added: 0, reopened: 0, seen: 0 };
  if (report.mistakes.length) { try { mem = await saveMistakes(uid, report.mistakes, isoDay()); } catch (e) { console.warn("mistake memory not saved", e); } }
  return { ...r, memory: mem };
}
