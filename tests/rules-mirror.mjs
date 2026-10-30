/* JS mirror of the Phase-10 Firestore rules, used by unit/integration tests (the real rules cannot be executed here: no emulator).
   Keep in sync with firestore.rules → speakingSessionOk(), speakingStatsOk(). */
const isInt = Number.isInteger, isNum = (x) => typeof x === "number" && Number.isFinite(x);
const inRange = (v, lo, hi, d = 0) => { const x = v === undefined ? d : v; return isNum(x) && x >= lo && x <= hi; };
const intIn = (v, lo, hi, d = 0) => { const x = v === undefined ? d : v; return isInt(x) && x >= lo && x <= hi; };
const SESSION_KEYS = ["uid","displayName","prompt","transcript","wordCount","scores","xpEarned","dateStr","recordedAt","mode","level","activityId","durationSec","attempts","wordAccuracy","completion","fluency","wpm","difficultWords","version","provider","scenarioId","objectivesDone","objectivesTotal","turns"];

export function speakingSessionOk(d, authUid, requestTime = "NOW") {
  if (!d || typeof d !== "object") return false;
  const keys = Object.keys(d);
  return d.uid === authUid && ["uid","prompt","dateStr","recordedAt"].every((k) => k in d) && keys.every((k) => SESSION_KEYS.includes(k)) &&
    typeof d.prompt === "string" && d.prompt.length <= 300 && typeof d.dateStr === "string" && d.dateStr.length === 10 && d.recordedAt === requestTime &&
    (d.transcript === undefined || (typeof d.transcript === "string" && d.transcript.length <= 3000)) &&
    (d.displayName === undefined || (typeof d.displayName === "string" && d.displayName.length <= 80)) &&
    intIn(d.wordCount, 0, 5000) && inRange(d.durationSec, 0, 1800) && intIn(d.attempts, 1, 100, 1) && intIn(d.xpEarned, 0, 50) &&
    ["repeat","shadow","read","free","sim"].includes(d.mode === undefined ? "free" : d.mode) &&
    (d.scenarioId === undefined || (typeof d.scenarioId === "string" && d.scenarioId.length <= 20)) && intIn(d.objectivesDone, 0, 10) && intIn(d.objectivesTotal, 0, 10) && intIn(d.turns, 0, 30) && ["A1","A2","B1","B2","C1","C2"].includes(d.level === undefined ? "A1" : d.level) &&
    (d.activityId === undefined || (typeof d.activityId === "string" && d.activityId.length <= 40)) &&
    intIn(d.wordAccuracy, 0, 100) && intIn(d.completion, 0, 100) && intIn(d.fluency, 0, 100) && intIn(d.wpm, 0, 400) &&
    (d.difficultWords === undefined || (Array.isArray(d.difficultWords) && d.difficultWords.length <= 8)) &&
    (d.scores === undefined || (d.scores && typeof d.scores === "object" && Object.keys(d.scores).every((k) => ["overall","fluency","pronunciation","confidence"].includes(k)))) &&
    intIn(d.version, 1, 1e9, 1) && (d.provider === undefined || typeof d.provider === "string");
}

export function speakingStatsOk(user) {
  const s = user.speakingStats; if (s === undefined) return true;
  if (!s || typeof s !== "object") return false;
  return Object.keys(s).every((k) => ["sessions","seconds","accSum","accN","modes","day","dayCount","last","difficult"].includes(k)) &&
    intIn(s.sessions, 0, 100000) && intIn(s.seconds, 0, 10000000) && intIn(s.accSum, 0, Infinity) && intIn(s.accN, 0, Infinity) && intIn(s.dayCount, 0, 1000) &&
    (s.modes === undefined || (typeof s.modes === "object" && Object.keys(s.modes).every((k) => ["repeat","shadow","read","free","sim"].includes(k)))) &&
    (s.difficult === undefined || (typeof s.difficult === "object" && Object.keys(s.difficult).length <= 80));
}
export function planProgressOk(user) {
  const p = user.planProgress; if (p === undefined) return true;
  return p && Object.keys(p).every((k) => ["date","done","skills"].includes(k)) && typeof (p.date ?? "") === "string" && (p.date ?? "").length <= 10 && (p.done || []).length <= 12 && (p.skills || []).length <= 12;
}
export function planHistoryOk(user) { const h = user.planHistory; return h === undefined || Object.keys(h).every((k) => ["vocabulary","listening","grammar","reading","quiz","speaking","writing"].includes(k)); }

export { applyUpdate, localOps as ops } from "../speaking/persistence.js";
