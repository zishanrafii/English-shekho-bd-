/* Shared in-memory Firestore stub for browser tests (mirrors the relevant rules). Used via ctx.route(...firebase-config.js...). */
module.exports = (userDoc = {}) => `
const KEY = "__ps"; const store = new Map(JSON.parse(localStorage.getItem(KEY) || "null") || [["users/u1", ${JSON.stringify(userDoc)}]]);
const save = () => localStorage.setItem(KEY, JSON.stringify([...store]));
const clone = (x) => JSON.parse(JSON.stringify(x));
window.__violations = window.__violations || [];
const LV = ["A1","A2","B1","B2","C1","C2"];
function cardOk(d) {   // mirror of srsCardOk()
  const all = ["word","level","ease","interval","reps","lapses","due","last"], opt = ["saved","known","src","meaning","example"];
  return all.every((k) => k in d) && Object.keys(d).every((k) => all.includes(k) || opt.includes(k)) &&
    typeof d.word === "string" && d.word.length > 0 && d.word.length <= 40 && LV.includes(d.level) &&
    typeof d.ease === "number" && d.ease >= 1.3 && d.ease <= 3 && Number.isInteger(d.interval) && d.interval >= 0 && d.interval <= 365 &&
    Number.isInteger(d.reps) && d.reps >= 0 && Number.isInteger(d.lapses) && d.lapses >= 0 &&
    typeof d.due === "string" && d.due.length === 10 && typeof d.last === "string" && d.last.length === 10 &&
    (!("meaning" in d) || (typeof d.meaning === "string" && d.meaning.length <= 80)) && (!("example" in d) || (typeof d.example === "string" && d.example.length <= 200));
}

const SESSION_KEYS = ["uid","displayName","prompt","transcript","wordCount","scores","xpEarned","dateStr","recordedAt","mode","level","activityId","durationSec","attempts","wordAccuracy","completion","fluency","wpm","difficultWords","version","provider","scenarioId","objectivesDone","objectivesTotal","turns"];
const intIn = (v, lo, hi, d = 0) => { const x = v === undefined ? d : v; return Number.isInteger(x) && x >= lo && x <= hi; };
function sessionOk(d) {   // mirror of speakingSessionOk()
  return d.uid === "u1" && ["uid","prompt","dateStr","recordedAt"].every((k) => k in d) && Object.keys(d).every((k) => SESSION_KEYS.includes(k)) &&
    typeof d.prompt === "string" && d.prompt.length <= 300 && typeof d.dateStr === "string" && d.dateStr.length === 10 && d.recordedAt === "TS" &&
    (d.transcript === undefined || (typeof d.transcript === "string" && d.transcript.length <= 3000)) && intIn(d.wordCount, 0, 5000) &&
    typeof (d.durationSec ?? 0) === "number" && (d.durationSec ?? 0) >= 0 && (d.durationSec ?? 0) <= 1800 && intIn(d.attempts, 1, 100, 1) && intIn(d.xpEarned, 0, 50) &&
    ["repeat","shadow","read","free","sim"].includes(d.mode ?? "free") && LV.includes(d.level ?? "A1") && (d.scenarioId === undefined || d.scenarioId.length <= 20) && intIn(d.objectivesDone, 0, 10) && intIn(d.objectivesTotal, 0, 10) && intIn(d.turns, 0, 30) && (d.activityId === undefined || d.activityId.length <= 40) &&
    intIn(d.wordAccuracy, 0, 100) && intIn(d.completion, 0, 100) && intIn(d.fluency, 0, 100) && intIn(d.wpm, 0, 400) && (d.difficultWords === undefined || (Array.isArray(d.difficultWords) && d.difficultWords.length <= 8));
}
function statsOk(u) {     // mirror of speakingStatsOk() + planProgress shape
  const s = u.speakingStats;
  if (s !== undefined && !(Object.keys(s).every((k) => ["sessions","seconds","accSum","accN","modes","day","dayCount","last","difficult"].includes(k)) && intIn(s.sessions, 0, 1e5) && intIn(s.seconds, 0, 1e7) && intIn(s.dayCount, 0, 1000) && (s.modes === undefined || Object.keys(s.modes).every((k) => ["repeat","shadow","read","free","sim"].includes(k))) && Object.keys(s.difficult || {}).length <= 80)) return false;
  const p = u.planProgress; if (p !== undefined && !(Object.keys(p).every((k) => ["date","done","skills"].includes(k)) && (p.done || []).length <= 12 && (p.skills || []).length <= 12)) return false;
  return true;
}

function writingOk(d) {   // mirror of writingOk()
  const keys = ["uid","displayName","photoURL","type","taskId","taskLabel","content","wordCount","xpEarned","score","isPublic","reviewCount","submittedAt","issueCount","sentences","level","version"];
  return d.uid === "u1" && ["uid","type","content"].every((k) => k in d) && Object.keys(d).every((k) => keys.includes(k)) &&
    ["paragraph","essay","email","story"].includes(d.type) && typeof d.content === "string" && d.content.length <= 6000 &&
    (d.photoURL === undefined || d.photoURL === "" || (d.photoURL.startsWith("https://") && d.photoURL.length <= 500 && !/[\\s"'<>]/.test(d.photoURL) && d.photoURL.indexOf(String.fromCharCode(92)) < 0)) && (d.taskId === undefined || d.taskId.length <= 40) && (d.taskLabel === undefined || d.taskLabel.length <= 200) &&
    intIn(d.wordCount, 0, 1500) && intIn(d.xpEarned, 0, 150) && (!("score" in d) || d.score === null || typeof d.score === "number") && typeof (d.isPublic ?? false) === "boolean" &&
    (d.isPublic !== true || !window.__isAnonymous) && (d.reviewCount ?? 0) === 0 && (d.submittedAt === undefined || d.submittedAt === "TS") && intIn(d.issueCount, 0, 500) && intIn(d.sentences, 0, 500) && LV.includes(d.level ?? "A1");
}
function wMistakeOk(d) {  // mirror of writingMistakeOk()
  const all = ["category","original","corrected","last","fixed"], opt = ["why","context","count"];
  return all.every((k) => k in d) && Object.keys(d).every((k) => all.includes(k) || opt.includes(k)) && ["article","preposition","tense","agreement","word-choice","word-form","word-order","spelling","other"].includes(d.category) &&
    typeof d.original === "string" && d.original.length > 0 && d.original.length <= 160 && typeof d.corrected === "string" && d.corrected.length > 0 && d.corrected.length <= 160 &&
    (d.why === undefined || d.why.length <= 220) && (d.context === undefined || d.context.length <= 240) && typeof d.last === "string" && d.last.length === 10 && typeof d.fixed === "boolean" && intIn(d.count, 0, 1000);
}
function wStatsOk(u) { const w = u.writingStats; return w === undefined || (Object.keys(w).every((k) => ["xpDate","xpTasks"].includes(k)) && (w.xpDate || "").length <= 10 && (w.xpTasks || []).length <= 12); }
window.__failWrites = false;
function planOk(u) { const h = u.planHistory; return h === undefined || Object.keys(h).every((k) => ["vocabulary","listening","grammar","reading","quiz","speaking","writing"].includes(k)); }
function metaOk(u) { const m = u.srsMeta; return m === undefined || (Object.keys(m).every((k) => ["newDate","newCount","words","mastered","syncDate"].includes(k)) && ["newCount","words","mastered"].every((k) => !(k in m) || (Number.isInteger(m[k]) && m[k] >= 0))); }
export const auth = { currentUser: { uid: "u1", displayName: "Rafi", photoURL: 'x" onerror="window.__xss=1', getIdToken: async () => "tok", get isAnonymous() { return !!window.__isAnonymous; } } };
export const db = {};
export const doc = (_d, ...p) => ({ path: p.join("/"), id: p[p.length - 1] });
export const collection = (_d, ...p) => ({ path: p.join("/") });
export const where = (f, op, v) => ({ t: "where", f, op, v }); export const limit = (n) => ({ t: "limit", n }); export const orderBy = (f) => ({ t: "orderBy", f });
export const query = (col, ...cs) => ({ col, cs });
export const increment = (n) => ({ __inc: n }); export const arrayUnion = (...v) => ({ __u: v }); export const arrayRemove = (...v) => ({ __r: v });
export const serverTimestamp = () => "TS"; export const signOut = async () => {};
export const toast = (m, t) => { (window.__toasts ||= []).push(m); };
const apply = (cur, data) => { for (const [k, v] of Object.entries(data)) { const parts = k.split("."); let o = cur; for (let i = 0; i < parts.length - 1; i++) o = (o[parts[i]] ||= {}); const l = parts[parts.length - 1];
  if (v && v.__inc !== undefined) o[l] = (o[l] || 0) + v.__inc; else if (v && v.__u) o[l] = [...new Set([...(o[l] || []), ...v.__u])]; else if (v && v.__r) o[l] = (o[l] || []).filter((x) => !v.__r.includes(x)); else o[l] = v; } return cur; };
const check = (path, next) => {
  if (path.includes("/vocabSrs/") && !cardOk(next)) { window.__violations.push("card:" + JSON.stringify(next)); throw new Error("rules denied"); }
  if (window.__failWrites) throw new Error("offline");
  if (path.startsWith("writings/") && !writingOk(next)) { window.__violations.push("writing:" + JSON.stringify(Object.keys(next))); throw new Error("rules denied"); }
  if (path.includes("/writingMistakes/") && !wMistakeOk(next)) { window.__violations.push("wmistake:" + JSON.stringify(next)); throw new Error("rules denied"); }
  if (path.startsWith("speaking_sessions/") && !sessionOk(next)) { window.__violations.push("session:" + JSON.stringify(next)); throw new Error("rules denied"); }
  if (/^users\\/[^/]+$/.test(path) && (!planOk(next) || !metaOk(next) || !statsOk(next) || !wStatsOk(next))) { window.__violations.push("user:" + JSON.stringify([next.planHistory, next.srsMeta])); throw new Error("rules denied"); }
};
export const getDoc = async (ref) => ({ id: ref.id, exists: () => store.has(ref.path), data: () => clone(store.get(ref.path)) });
export const setDoc = async (ref, data, opts) => { const next = apply(opts && opts.merge ? clone(store.get(ref.path) || {}) : {}, data); check(ref.path, next); store.set(ref.path, next); save(); };
export const updateDoc = async (ref, data) => { const next = apply(clone(store.get(ref.path) || {}), data); check(ref.path, next); store.set(ref.path, next); save(); };
export const addDoc = async (col, data) => { const k = col.path + "/" + Math.random().toString(36).slice(2); check(k, data); store.set(k, clone(data)); save(); return {}; };
export const getDocs = async (q) => { let rows = [...store.entries()].filter(([p]) => p.startsWith(q.col.path + "/") && !p.slice(q.col.path.length + 1).includes("/")).map(([p, d]) => ({ id: p.split("/").pop(), d }));
  for (const c of q.cs) if (c.t === "where") rows = rows.filter(({ d }) => c.op === "<=" ? d[c.f] <= c.v : c.op === "==" ? d[c.f] === c.v : true);
  const lim = q.cs.find((c) => c.t === "limit"); if (lim) rows = rows.slice(0, lim.n);
  return { docs: rows.map(({ id, d }) => ({ id, data: () => clone(d) })), empty: !rows.length, forEach(fn) { this.docs.forEach(fn); } }; };
export function requireAuth(cb) { cb(auth.currentUser, clone(store.get("users/u1") || {})); }
`;
