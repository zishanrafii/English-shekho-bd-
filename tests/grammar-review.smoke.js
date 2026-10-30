/* Real-browser test of grammar-review.html. Run: python3 -m http.server 8765  then  node tests/grammar-review.smoke.js */
const { chromium } = require("playwright");
const STUB = `
const KEY = "__grv"; const store = new Map(JSON.parse(localStorage.getItem(KEY) || "[]"));
const save = () => localStorage.setItem(KEY, JSON.stringify([...store]));
const clone = (x) => JSON.parse(JSON.stringify(x));
export const db = {}; export const doc = (_d, ...p) => ({ path: p.join("/"), id: p[p.length - 1] });
export const collection = (_d, ...p) => ({ path: p.join("/") });
export const where = (f, op, v) => ({ t: "where", f, op, v }); export const limit = (n) => ({ t: "limit", n });
export const query = (col, ...cs) => ({ col, cs }); export const increment = (n) => ({ __inc: n });
const apply = (cur, data) => { for (const [k, v] of Object.entries(data)) { const parts = k.split("."); let o = cur; for (let i = 0; i < parts.length - 1; i++) o = (o[parts[i]] ||= {}); const l = parts[parts.length - 1]; o[l] = v && v.__inc !== undefined ? (o[l] || 0) + v.__inc : v; } return cur; };
export const setDoc = async (ref, data, opts) => { store.set(ref.path, apply(opts && opts.merge ? clone(store.get(ref.path) || {}) : {}, data)); save(); };
export const updateDoc = async (ref, data) => { store.set(ref.path, apply(clone(store.get(ref.path) || {}), data)); save(); };
export const getDocs = async (q) => { let rows = [...store.entries()].filter(([p]) => p.startsWith(q.col.path + "/")).map(([p, d]) => ({ id: p.split("/").pop(), d }));
  for (const c of q.cs) if (c.t === "where") rows = rows.filter(({ d }) => d[c.f] === c.v);
  return { docs: rows.map(({ id, d }) => ({ id, data: () => clone(d) })) }; };
export function requireAuth(cb) { cb({ uid: "u1", isAnonymous: true }, {}); }
`;
const mk = (q, correct, wrong, why, fixed = false) => ({ topic: "a1-t2", q, opts: [correct, ...wrong], picked: wrong[0], correct, why, last: "2026-10-01", fixed, count: 1 });
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c) => res.push([n, !!c]);
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 } });
  await ctx.route("**/js/firebase-config.js", (r) => r.fulfill({ contentType: "text/javascript", body: STUB }));
  await ctx.route("**/fonts.googleapis.com/**", (r) => r.abort());
  const seed = [["users/u1", { grammarProgress: { openMistakes: 2 } }],
    ["users/u1/grammarMistakes/m1", mk("I ___ a student.", "am", ["is", "are"], "I → am")],
    ["users/u1/grammarMistakes/m2", mk("She ___ tea.", "drinks", ["drink", "drinking"], "She → drinks")],
    ["users/u1/grammarMistakes/m3", mk("old one", "x", ["y", "z"], "", true)]];
  await ctx.addInitScript((s) => { if (!localStorage.getItem("__grv")) localStorage.setItem("__grv", JSON.stringify(s)); }, seed);
  const p = await ctx.newPage(); const errors = []; p.on("pageerror", (e) => errors.push(e.message));
  const read = () => p.evaluate(() => Object.fromEntries(JSON.parse(localStorage.getItem("__grv"))));
  await p.goto("http://localhost:8765/grammar-review.html");
  await p.waitForSelector(".q");
  ok("only unresolved mistakes are asked (2, not the fixed one)", (await p.locator(".es-badge").first().innerText()).includes("১ / ২"));
  let seen = [];
  for (let i = 0; i < 2; i++) {
    const q = (await p.locator(".q").innerText()).trim(); seen.push(q);
    const right = q.startsWith("I ") ? "am" : "drinks", wrong = q.startsWith("I ") ? "is" : "drink";
    if (i === 0) await p.locator(".opt", { hasText: new RegExp("^" + right + "$") }).click();   // right
    else await p.locator(".opt", { hasText: new RegExp("^" + wrong + "$") }).click();           // wrong
    await p.waitForSelector(".why:not([hidden])");
    if (i === 1) ok("a wrong answer reveals the right one and explanation", (await p.locator(".why").innerText()).includes("সঠিক উত্তর") && (await p.locator(".opt.correct").count()) === 1);
    await p.click(".why button");
  }
  ok("each question asked once", new Set(seen).size === 2);
  const t = await p.locator("#view").innerText();
  ok("summary is kind and counts 1 of 2", t.includes("২টির মধ্যে ১টি") && t.includes("কোনো তাড়া নেই"));
  await p.waitForTimeout(250);
  const s = await read();
  const m = Object.entries(s).filter(([k]) => k.includes("/grammarMistakes/m1") || k.includes("/grammarMistakes/m2"));
  const fixedOnes = m.filter(([, d]) => d.fixed === true).length, openOnes = m.filter(([, d]) => d.fixed === false);
  ok("the right answer closed its mistake; the wrong one stays open with count+1", fixedOnes === 1 && openOnes.length === 1 && openOnes[0][1].count === 2);
  ok("open-mistake counter went 2 → 1", s["users/u1"].grammarProgress.openMistakes === 1);
  await p.click("text=আরও কিছু করি");
  await p.waitForSelector(".q");
  ok("'আরও কিছু করি' brings back the one still open", (await p.locator(".es-badge").first().innerText()).includes("১ / ১"));
  ok("no page errors", errors.length === 0);

  const empty = await ctx.newPage(); await empty.addInitScript(() => localStorage.setItem("__grv", JSON.stringify([["users/u1", {}]])));
  await empty.goto("http://localhost:8765/grammar-review.html"); await empty.waitForSelector("h1");
  ok("nothing to review → friendly empty state", (await empty.locator("h1").innerText()).includes("কোনো ভুল জমে নেই"));
  for (const [n, c] of res) console.log(c ? "PASS" : "FAIL", n);
  await b.close(); process.exit(res.every(([, c]) => c) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
