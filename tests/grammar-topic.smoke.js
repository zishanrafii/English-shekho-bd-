/* Real-browser test of a grammar topic page (topics/b1/present-perfect.html) with the Phase-8 practice loop.
   Firebase is replaced by an in-memory store that mirrors grammarOk() and grammarMistakeOk() from firestore.rules.
   Run: python3 -m http.server 8765  then  node tests/grammar-topic.smoke.js */
const { chromium } = require("playwright");
const STUB = `
const KEY = "__gfs"; const store = new Map(JSON.parse(localStorage.getItem(KEY) || "[]"));
const save = () => localStorage.setItem(KEY, JSON.stringify([...store]));
const clone = (x) => JSON.parse(JSON.stringify(x));
window.__violations = window.__violations || [];
function mistakeOk(d) {                        // mirror of grammarMistakeOk()
  const all = ["topic","q","opts","picked","correct","last","fixed"], opt = ["why","count"];
  return all.every((k) => k in d) && Object.keys(d).every((k) => all.includes(k) || opt.includes(k)) &&
    typeof d.topic === "string" && d.topic.length > 0 && d.topic.length <= 12 && typeof d.q === "string" && d.q.length > 0 && d.q.length <= 220 &&
    Array.isArray(d.opts) && d.opts.length >= 2 && d.opts.length <= 4 && typeof d.picked === "string" && d.picked.length <= 90 &&
    typeof d.correct === "string" && d.correct.length > 0 && d.correct.length <= 90 && (!("why" in d) || (typeof d.why === "string" && d.why.length <= 220)) &&
    typeof d.last === "string" && d.last.length === 10 && typeof d.fixed === "boolean" && (!("count" in d) || (Number.isInteger(d.count) && d.count >= 0 && d.count <= 1000));
}
function grammarOk(u) {                         // mirror of grammarOk()
  const g = u.grammarProgress; if (g === undefined) return true;
  return g && typeof g === "object" && Object.keys(g).every((k) => ["done","mastery","openMistakes"].includes(k)) &&
    (g.done || []).length <= 100 && Object.keys(g.mastery || {}).length <= 60 && (!("openMistakes" in g) || (Number.isInteger(g.openMistakes) && g.openMistakes >= 0 && g.openMistakes <= 1000));
}
export const auth = {}; export const db = {};
export const doc = (_d, ...p) => ({ path: p.join("/"), id: p[p.length - 1] });
export const collection = (_d, ...p) => ({ path: p.join("/") });
export const where = (f, op, v) => ({ t: "where", f, op, v }); export const limit = (n) => ({ t: "limit", n });
export const query = (col, ...cs) => ({ col, cs });
export const increment = (n) => ({ __inc: n }); export const arrayUnion = (...v) => ({ __union: v });
export const toast = (m, t) => { (window.__toasts ||= []).push(m); };
export const signOut = async () => {};
const apply = (cur, data) => {
  for (const [k, v] of Object.entries(data)) {
    const parts = k.split("."); let o = cur;
    for (let i = 0; i < parts.length - 1; i++) o = (o[parts[i]] ||= {});
    const last = parts[parts.length - 1];
    if (v && v.__inc !== undefined) o[last] = (o[last] || 0) + v.__inc;
    else if (v && v.__union) o[last] = [...new Set([...(o[last] || []), ...v.__union])];
    else o[last] = v;
  }
  return cur;
};
const check = (path, next) => {
  if (path.includes("/grammarMistakes/") && !mistakeOk(next)) { window.__violations.push("mistake:" + JSON.stringify(next)); throw new Error("rules denied"); }
  if (path.startsWith("users/") && !path.includes("/", 7) && !grammarOk(next)) { window.__violations.push("grammar:" + JSON.stringify(next.grammarProgress)); throw new Error("rules denied"); }
};
export const getDoc = async (ref) => ({ id: ref.id, exists: () => store.has(ref.path), data: () => clone(store.get(ref.path)) });
export const setDoc = async (ref, data, opts) => { const next = apply(opts && opts.merge ? clone(store.get(ref.path) || {}) : {}, data); check(ref.path, next); store.set(ref.path, next); save(); };
export const updateDoc = async (ref, data) => { const next = apply(clone(store.get(ref.path) || {}), data); check(ref.path, next); store.set(ref.path, next); save(); };
export const getDocs = async (q) => {
  let rows = [...store.entries()].filter(([p]) => p.startsWith(q.col.path + "/")).map(([p, d]) => ({ id: p.split("/").pop(), d }));
  for (const c of q.cs) if (c.t === "where") rows = rows.filter(({ d }) => c.op === "==" ? d[c.f] === c.v : true);
  return { docs: rows.map(({ id, d }) => ({ id, data: () => clone(d) })), empty: !rows.length };
};
export function requireAuth(cb) { cb({ uid: "u1", displayName: "Rafi", isAnonymous: false }); }
`;
const run = async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c) => res.push([n, !!c]);
  const ctx = await b.newContext({ viewport: { width: 390, height: 900 } });
  await ctx.route("**/js/firebase-config.js", (r) => r.fulfill({ contentType: "text/javascript", body: STUB }));
  await ctx.route("**/fonts.googleapis.com/**", (r) => r.abort());
  await ctx.addInitScript(() => { if (!localStorage.getItem("__gfs")) localStorage.setItem("__gfs", JSON.stringify([["users/u1", { displayName: "Rafi", xp: 100, photoURL: '"><img src=x onerror="window.__xss=1">' }]])); });
  const p = await ctx.newPage(); const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  const read = () => p.evaluate(() => Object.fromEntries(JSON.parse(localStorage.getItem("__gfs"))));
  const URL_ = "http://localhost:8765/topics/b1/present-perfect.html";
  await p.goto(URL_);
  await p.waitForSelector("#gp-steps");
  const total = await p.locator(".practice-q").count();
  ok(`page has practice questions (${total})`, total >= 4);
  ok("6-step stepper shown, 'পড়ুন' current", (await p.locator("#gp-steps li").count()) === 6 && (await p.locator('#gp-steps li[aria-current="step"]').textContent()).includes("পড়ুন"));
  ok("avatar photo with markup is NOT injected as HTML", (await p.evaluate(() => window.__xss)) === undefined && (await p.locator("#nav-av img").count()) === 0);
  const btn = p.locator("#complete-btn");
  ok("XP button locked until practice is done", (await btn.isDisabled()) && (await btn.textContent()).includes("আগে অনুশীলন"));
  await btn.click({ force: true }).catch(() => {});
  ok("clicking the locked button gives no XP", ((await read())["users/u1"].xp) === 100);

  /* answer: Q1 and Q3 wrong, others right */
  const wrongIdx = new Set([0, 2]);
  for (let i = 0; i < total; i++) {
    const q = p.locator(".practice-q").nth(i);
    const sel = wrongIdx.has(i) ? ".pq-opt:not([data-correct])" : ".pq-opt[data-correct]";
    await q.locator(sel).first().click();
    if (i === 0) ok("stage moves to 'অনুশীলন' after the first answer", (await p.locator('#gp-steps li[aria-current="step"]').textContent()).includes("অনুশীলন"));
  }
  await p.waitForSelector("#gp-panel");
  const correctN = total - wrongIdx.size, pc = Math.round(correctN / total * 100);
  const bnum = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
  const panelText = await p.locator("#gp-panel").innerText();
  ok(`result panel: ${correctN}/${total} (${pc}%)`, panelText.includes(`${bnum(correctN)} / ${bnum(total)}`) && panelText.includes(`${bnum(pc)}%`));
  ok("mistake analysis lists both wrong questions", (await p.locator("#gp-panel .gp-miss").count()) === 2);
  const correctTexts = await p.locator(".practice-q [data-correct]").evaluateAll((els) => els.map((e) => e.textContent.trim()));
  const shownCorrect = await p.locator("#gp-panel .gp-miss .good").allTextContents();
  ok("analysis shows the real correct answers (not 'false')", shownCorrect.every((t) => correctTexts.includes(t.trim())) && !shownCorrect.includes("false"));
  ok("analysis includes the explanation text", (await p.locator("#gp-panel .gp-miss .why").count()) === 2);
  ok("explanations do not start with '✅ ঠিক!' next to a WRONG answer", (await p.locator("#gp-panel .gp-miss .why").allTextContents()).every((t) => !/^\s*(✅|ঠিক|সঠিক)/.test(t) && t.trim().length > 5));
  ok("stage = ভুল বিশ্লেষণ", (await p.locator('#gp-steps li[aria-current="step"]').textContent()).includes("ভুল বিশ্লেষণ"));
  ok("XP button unlocked", !(await btn.isDisabled()));
  await p.waitForTimeout(300);
  let s = await read();
  const gp = s["users/u1"].grammarProgress || {};
  ok("mastery saved (best=last=score, attempts=1)", gp.mastery && gp.mastery.b1_t1 && gp.mastery.b1_t1.best === pc && gp.mastery.b1_t1.last === pc && gp.mastery.b1_t1.attempts === 1);
  const mistakes = Object.entries(s).filter(([k]) => k.includes("/grammarMistakes/"));
  ok("2 mistake docs saved, unresolved, count=1, topic b1-t1", mistakes.length === 2 && mistakes.every(([, d]) => d.fixed === false && d.count === 1 && d.topic === "b1-t1"));
  ok("openMistakes = 2", gp.openMistakes === 2);
  ok("no rule violations so far", (await p.evaluate(() => window.__violations)).length === 0);

  /* complete → XP once */
  await btn.click(); await p.waitForTimeout(250);
  s = await read();
  ok("complete → XP added and topic marked done", s["users/u1"].xp > 100 && s["users/u1"].grammarProgress.done.includes("b1-t1"));
  ok("button shows done state", (await btn.isDisabled()) && (await btn.getAttribute("class")).includes("done"));

  /* mini challenge: first right, second wrong */
  await p.click("text=মিনি চ্যালেঞ্জ: ভুলগুলো আবার করি");
  ok("stage = মিনি চ্যালেঞ্জ", (await p.locator('#gp-steps li[aria-current="step"]').textContent()).includes("মিনি চ্যালেঞ্জ"));
  for (let i = 0; i < 2; i++) {
    const qText = (await p.locator("#gp-challenge .q").textContent()).trim();
    const right = await p.evaluate((t) => { const q = [...document.querySelectorAll(".practice-q")].find((x) => x.querySelector(".pq-text").textContent.trim() === t); return q.querySelector("[data-correct]").textContent.trim(); }, qText);
    const opt = i === 0 ? p.locator("#gp-challenge .gp-ch-opt", { hasText: new RegExp("^" + right.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$") }) : p.locator("#gp-challenge .gp-ch-opt").filter({ hasNotText: right });
    await opt.first().click();
    await p.click("#gp-challenge .gp-miss .gp-btn");
  }
  ok("challenge summary says 1 of 2 fixed", (await p.locator("#gp-challenge").innerText()).includes("২টির মধ্যে ১টি"));
  await p.waitForTimeout(300);
  s = await read();
  const open1 = Object.entries(s).filter(([k, d]) => k.includes("/grammarMistakes/") && d.fixed === false).length;
  ok("one mistake marked fixed, one still open", open1 === 1 && s["users/u1"].grammarProgress.openMistakes === 1);

  /* retry all: everything right → perfect, remaining mistake closes */
  await p.click("text=সব প্রশ্ন আবার");
  ok("retry resets the questions and removes the panel", (await p.locator("#gp-panel").count()) === 0 && (await p.locator(".practice-q[data-answered]").count()) === 0);
  for (let i = 0; i < total; i++) await p.locator(".practice-q").nth(i).locator(".pq-opt[data-correct]").first().click();
  await p.waitForSelector("#gp-panel");
  ok("perfect score celebrated", (await p.locator("#gp-panel").innerText()).includes("🎉 নিখুঁত"));
  ok("stage = আয়ত্ত", (await p.locator('#gp-steps li[aria-current="step"]').textContent()).includes("আয়ত্ত"));
  await p.waitForTimeout(400);
  s = await read();
  const g2 = s["users/u1"].grammarProgress;
  ok("mastery: best 100, last 100, attempts 2", g2.mastery.b1_t1.best === 100 && g2.mastery.b1_t1.last === 100 && g2.mastery.b1_t1.attempts === 2);
  ok("answering the old mistake correctly closes it (openMistakes 0)", g2.openMistakes === 0 && Object.entries(s).filter(([k, d]) => k.includes("/grammarMistakes/") && d.fixed === false).length === 0);
  ok("no rule violations at all", (await p.evaluate(() => window.__violations)).length === 0);
  ok("no page errors", errors.length === 0);
  if (errors.length) console.log(errors);

  /* reload shows previous best */
  await p.goto(URL_); await p.waitForSelector("#gp-steps");
  ok("previous best shown after reload", (await p.locator("#gp-prev").innerText()).includes("১০০%"));
  await p.screenshot({ path: "/tmp/topic-top.png" });
  for (const [n, c] of res) console.log(c ? "PASS" : "FAIL", n);
  await b.close(); process.exit(res.every(([, c]) => c) ? 0 : 1);
};
run().catch((e) => { console.error(e); process.exit(1); });
