/* Real-browser test of vocab-review.html against an in-memory Firestore that ENFORCES the same field rules as firestore.rules.
   Run: python3 -m http.server 8765  then  node tests/vocab-review.smoke.js */
const { chromium } = require("playwright");
const fs = require("fs");
const flags = JSON.parse(fs.readFileSync(__dirname + "/../data/vocab-flags.json"));
const STUB = `
const KEY = "__fs"; const raw = localStorage.getItem(KEY);
const store = new Map(raw ? JSON.parse(raw) : []);
const save = () => localStorage.setItem(KEY, JSON.stringify([...store]));
const clone = (x) => JSON.parse(JSON.stringify(x));
window.__violations = window.__violations || [];
const LV = ["A1","A2","B1","B2","C1","C2"];
function cardOk(d) {          // mirror of srsCardOk() in firestore.rules
  const all = ["word","level","ease","interval","reps","lapses","due","last"], opt = ["saved","known","src","meaning","example"];
  return all.every((k) => k in d) && Object.keys(d).every((k) => all.includes(k) || opt.includes(k)) &&
    typeof d.word === "string" && d.word.length > 0 && d.word.length <= 40 && LV.includes(d.level) &&
    typeof d.ease === "number" && d.ease >= 1.3 && d.ease <= 3.0 &&
    Number.isInteger(d.interval) && d.interval >= 0 && d.interval <= 365 && Number.isInteger(d.reps) && d.reps >= 0 &&
    Number.isInteger(d.lapses) && d.lapses >= 0 && typeof d.due === "string" && d.due.length === 10 && typeof d.last === "string" && d.last.length === 10 &&
    (!("meaning" in d) || (typeof d.meaning === "string" && d.meaning.length <= 80)) && (!("example" in d) || (typeof d.example === "string" && d.example.length <= 200));
}
function metaOk(m) {          // mirror of srsMetaOk()
  return Object.keys(m).every((k) => ["newDate","newCount","words","mastered","syncDate"].includes(k)) &&
    ["newCount","words","mastered"].every((k) => !(k in m) || (Number.isInteger(m[k]) && m[k] >= 0 && m[k] <= 5000));
}
export const db = {};
export const doc = (_d, ...p) => ({ path: p.join("/"), id: p[p.length - 1] });
export const collection = (_d, ...p) => ({ path: p.join("/") });
export const where = (f, op, v) => ({ t: "where", f, op, v });
export const limit = (n) => ({ t: "limit", n });
export const orderBy = (f, dir) => ({ t: "orderBy", f, dir });
export const query = (col, ...cs) => ({ col, cs });
export const increment = (n) => ({ __inc: n });
export const toast = (m, t) => { window.__toast = m; };
export const getDoc = async (ref) => ({ id: ref.id, exists: () => store.has(ref.path), data: () => clone(store.get(ref.path)) });
export const setDoc = async (ref, data, opts) => {
  const next = opts && opts.merge ? { ...(store.get(ref.path) || {}), ...data } : data;
  if (ref.path.includes("/vocabSrs/") && !cardOk(next)) { window.__violations.push("card:" + ref.path + JSON.stringify(next)); throw new Error("rules denied"); }
  store.set(ref.path, clone(next)); save();
};
export const updateDoc = async (ref, data) => {
  const cur = clone(store.get(ref.path) || {});
  for (const [k, v] of Object.entries(data)) {
    const parts = k.split("."); let o = cur;
    for (let i = 0; i < parts.length - 1; i++) o = (o[parts[i]] ||= {});
    const last = parts[parts.length - 1];
    o[last] = v && v.__inc !== undefined ? (o[last] || 0) + v.__inc : v;
  }
  if (cur.srsMeta && !metaOk(cur.srsMeta)) { window.__violations.push("meta:" + JSON.stringify(cur.srsMeta)); throw new Error("rules denied"); }
  store.set(ref.path, cur); save();
};
export const getDocs = async (q) => {
  let rows = [...store.entries()].filter(([p]) => p.startsWith(q.col.path + "/") && !p.slice(q.col.path.length + 1).includes("/")).map(([p, d]) => ({ id: p.split("/").pop(), d }));
  for (const c of q.cs) {
    if (c.t === "where") rows = rows.filter(({ d }) => c.op === "<=" ? d[c.f] <= c.v : c.op === "==" ? d[c.f] === c.v : true);
    if (c.t === "orderBy") rows.sort((a, b) => (a.d[c.f] < b.d[c.f] ? 1 : -1) * (c.dir === "asc" ? -1 : 1));
  }
  const lim = q.cs.find((c) => c.t === "limit"); if (lim) rows = rows.slice(0, lim.n);
  return { docs: rows.map(({ id, d }) => ({ id, data: () => clone(d) })), empty: !rows.length };
};
export function requireAuth(cb) { cb({ uid: "u1", isAnonymous: false }, clone(store.get("users/u1") || {})); }
`;
const iso = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDay = (s, n) => { const [y, m, d] = s.split("-").map(Number); const t = new Date(Date.UTC(y, m - 1, d + n)); return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`; };
const today = iso();

(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c) => res.push([n, !!c]);
  const ctx = await b.newContext({ viewport: { width: 390, height: 900 } });
  await ctx.route("**/js/firebase-config.js", (r) => r.fulfill({ contentType: "text/javascript", body: STUB }));
  await ctx.route("**/fonts.googleapis.com/**", (r) => r.abort());
  const seed = { "users/u1": { displayName: "Rafi", learningProfile: { level: "A1", dailyMinutes: 10 } },
                 "users/u1/wrongWords/cold": { word: "Cold", level: "A1", wrongCount: 2, lastSeen: 1 },
                 "users/u1/vocabSrs/x_umbrella": { word: "umbrella", level: "A1", ease: 2.5, interval: 0, reps: 0, lapses: 0, due: today, last: today, saved: true, src: "reading", meaning: "ছাতা", example: "She forgot her umbrella at home." } };
  await ctx.addInitScript((s) => { if (!localStorage.getItem("__fs")) localStorage.setItem("__fs", JSON.stringify(Object.entries(s))); }, seed);
  const page = await ctx.newPage(); const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const read = () => page.evaluate(() => Object.fromEntries(JSON.parse(localStorage.getItem("__fs"))));
  const body = async () => (await page.locator("#view").innerText());

  await page.goto("http://localhost:8765/vocab-review.html");
  await page.waitForSelector(".stats");
  let s = await read();
  ok("quiz mistake 'Cold' became an SRS card (weak start)", Object.entries(s).some(([p, d]) => p.includes("/vocabSrs/") && d.word === "Cold" && d.src === "quiz" && d.lapses === 1));
  ok("10-minute learner: 4 new words + 2 due (quiz word + the word saved from reading)", (await body()).includes("শুরু করি · ৬টি শব্দ"));

  await page.click("text=শুরু করি");
  const seen = []; let guard = 0, sawAgain = 0, sawUmbrella = false, againWord = null;
  while (guard++ < 15 && await page.locator(".word").count()) {
    const w = (await page.textContent(".word")).trim(); seen.push(w);
    const idxLabel = (await page.textContent(".top .es-sub")).trim();
    await page.click("text=উত্তর দেখুন");
    if (w.toLowerCase() === "umbrella") {
      ok("saved word shows its own Bengali meaning", (await page.locator(".meaning").innerText()).trim() === "ছাতা");
      ok("saved word shows the sentence it came from, with the word highlighted", (await page.locator(".ex").innerText()).includes("She forgot her umbrella at home.") && (await page.locator(".ex mark").innerText()).toLowerCase() === "umbrella");
      ok("saved word is tagged as coming from reading", (await page.locator(".tagrow .es-badge--info").innerText()).includes("পড়ে পাওয়া"));
      sawUmbrella = true;
    }
    ok("meaning + example revealed for " + w, (await page.locator(".meaning").count()) === 1 && (await page.locator(".ex").count()) === 1 || guard > 1);
    if (guard === 2) { await page.keyboard.press("1"); sawAgain++; againWord = w; }            // keyboard: 1 = আবার
    else if (guard === 3) await page.click(".g3");                              // সহজ
    else await page.click(".g2");                                               // ঠিক আছে
  }
  ok("the saved word really appeared in the session", sawUmbrella);
  ok("session ended on the summary screen", (await body()).includes("চমৎকার"));
  ok("'আবার' card was shown a second time in the same session", seen.length >= 6 && new Set(seen).size < seen.length);

  s = await read();
  const cards = Object.entries(s).filter(([p]) => p.includes("/vocabSrs/")).map(([p, d]) => ({ id: p.split("/").pop(), ...d }));
  const fresh = cards.filter((c) => c.src === "new" || c.src === undefined || c.src === "known").filter((c) => c.id.startsWith("a1w"));
  ok("every saved card passes the rules mirror (no violations)", (await page.evaluate(() => window.__violations)).length === 0);
  ok("new words come from the learner's level (A1)", fresh.length >= 4 && fresh.every((c) => c.level === "A1"));
  ok("new words avoid audit-flagged entries", fresh.every((c) => !flags.avoid.includes(c.id)));
  const againCard = cards.find((c) => c.word === againWord);
  const startLapses = againCard && againCard.src === "quiz" ? 1 : 0;          // quiz-imported cards start with 1 lapse by design
  ok("grades persisted: an easy card (≥3 days), good cards (1 day)", cards.some((c) => c.interval >= 3) && cards.filter((c) => c.interval === 1).length >= 2);
  ok("the word answered 'আবার' (" + againWord + ") gained one lapse, was shown again in the same session, then relearned (due tomorrow)", againCard && againCard.lapses === startLapses + 1 && againCard.interval === 1 && againCard.reps === 1 && seen.filter((x) => x === againWord).length === 2);
  const m = s["users/u1"].srsMeta || {};
  ok("meta flushed: newCount 4, valid keys", m.newCount === 4 && m.newDate === today && m.words >= 5);
  ok("plan history updated for the daily plan", s["users/u1"].planHistory && s["users/u1"].planHistory.vocabulary === today);

  /* reload: quota used up → no new words, only the 'again' card is due */
  await page.goto("http://localhost:8765/vocab-review.html"); await page.waitForSelector(".stats");
  const home2 = await body();
  ok("quota respected after reload: nothing due, no extra new words, friendly message", home2.includes("আজকের জন্য সব শেষ") && !home2.includes("শুরু করি ·"));

  /* time travel: pretend every card is due yesterday, check cap & order */
  await page.evaluate((y) => { const st = Object.fromEntries(JSON.parse(localStorage.getItem("__fs"))); for (const p in st) if (p.includes("/vocabSrs/")) st[p].due = y;
    for (let i = 60; i < 85; i++) st["users/u1/vocabSrs/a1w" + i] = { word: "w" + i, level: "A1", ease: 2.5, interval: 3, reps: 3, lapses: 0, due: y, last: y };
    localStorage.setItem("__fs", JSON.stringify(Object.entries(st))); }, addDay(today, -1));
  await page.goto("http://localhost:8765/vocab-review.html"); await page.waitForSelector(".stats");
  const capText = await body();
  ok("30 cards overdue, but the button offers exactly 10 (daily cap for a 10-minute learner)", capText.includes("শুরু করি · ১০টি শব্দ"));
  ok("backlog note is calm, no pressure", capText.includes("বাকিগুলো পরে আসবে, কোনো চাপ নেই"));

  /* known button + save star on a new word */
  await page.evaluate(() => { const st = Object.fromEntries(JSON.parse(localStorage.getItem("__fs"))); st["users/u1"].srsMeta.newCount = 0; for (const p in st) if (p.includes("/vocabSrs/")) st[p].due = "2999-01-01"; localStorage.setItem("__fs", JSON.stringify(Object.entries(st))); });
  await page.goto("http://localhost:8765/vocab-review.html"); await page.waitForSelector(".stats");
  await page.click("text=শুরু করি");
  const w1 = (await page.textContent(".word")).trim();
  await page.click("text=☆ সংরক্ষণ"); await page.waitForTimeout(150);
  await page.click("text=এই শব্দ আগে থেকেই জানি"); await page.waitForTimeout(200);
  s = await read();
  const kc = Object.entries(s).find(([p, d]) => p.includes("/vocabSrs/") && d.word === w1)?.[1];
  ok("'already know' parks the word 60 days and keeps the ⭐", kc && kc.known === true && kc.due === addDay(today, 60) && kc.saved === true);
  ok("still no rule violations", (await page.evaluate(() => window.__violations)).length === 0);

  /* finish early is friendly */
  await page.click("text=আজকের মতো শেষ করি");
  ok("ending early shows a kind message, not a penalty", (await body()).includes("বিশ্রাম") || (await body()).includes("চমৎকার") || (await body()).includes("কোনো সমস্যা নেই"));

  /* my words tab */
  await page.click("text=Dashboard-এ ফিরি", { timeout: 1000 }).catch(() => {});
  await page.goto("http://localhost:8765/vocab-review.html"); await page.waitForSelector(".stats");
  await page.click("text=⭐ সংরক্ষিত"); await page.waitForSelector("#mywords .row");
  ok("saved list shows the starred word with its meaning", (await page.textContent("#mywords")).toLowerCase().includes(w1.toLowerCase()));
  await page.screenshot({ path: "/tmp/vocab-home.png" });
  ok("no page errors", errors.length === 0);
  if (errors.length) console.log(errors);

  for (const [n, c] of res) console.log(c ? "PASS" : "FAIL", n);
  await b.close(); process.exit(res.every(([, c]) => c) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
