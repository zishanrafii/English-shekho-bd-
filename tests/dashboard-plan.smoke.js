/* Real-browser test of the dashboard daily plan (Firebase stubbed).
   Run: python3 -m http.server 8765  then  node tests/dashboard-plan.smoke.js */
const { chromium } = require("playwright");
const STUB = (userDoc, failSave, isGuest) => `
export const auth = { currentUser: { uid: "u1" } };
export const db = {};
export const doc = (...a) => ({ path: a.slice(1).join("/") });
export const collection = () => ({}); export const query = () => ({}); export const orderBy = () => ({});
export const limit = () => ({}); export const where = () => ({});
export const getDocs = async () => ({ empty: true, forEach() {} });
export const signOut = async () => {};
export const toast = (m) => { window.__toast = m; };
export const updateDoc = async (ref, data) => { await window.__record(JSON.stringify({ ref, data })); if (${failSave}) throw new Error("offline"); };
export function requireAuth(cb) { cb({ uid: "u1", displayName: "Rafi", isAnonymous: ${isGuest} }, ${JSON.stringify(userDoc)}); }
`;
async function open(browser, userDoc, { failSave = false, guest = false } = {}) {
  const p = await browser.newPage({ viewport: { width: 390, height: 900 } });
  const calls = []; const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.exposeFunction("__record", (j) => calls.push(JSON.parse(j)));
  await p.route("**/js/firebase-config.js", (r) => r.fulfill({ contentType: "text/javascript", body: STUB(userDoc, failSave, guest) }));
  await p.route("**/fonts.googleapis.com/**", (r) => r.abort());
  await p.addInitScript(() => { Date.prototype.getFullYear = function () { return 2026; }; });
  await p.goto("http://localhost:8765/dashboard.html");
  return { p, calls, errors };
}
const profile = { level: "B1", levelPending: false, skills: ["speaking", "grammar"], dailyMinutes: 10, style: "conversation", reasons: ["job"], ageGroup: "adult" };
(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c) => res.push([n, !!c]);

  let { p, calls, errors } = await open(b, { displayName: "Rafi", xp: 120, learningProfile: profile, grammarProgress: { done: ["b1-t1"] } });
  await p.waitForSelector("#plan-card .es-card");
  const rows = await p.locator("#plan-card [role=checkbox]").count();
  ok("10-minute goal → 2 plan items", rows === 2);
  ok("plan card mentions the 10 minutes", (await p.textContent("#plan-card")).includes("১০ মিনিট"));
  const text = await p.textContent("#plan-card");
  ok("focus skills chosen (speaking + grammar)", text.includes("Speaking") && text.includes("Grammar"));
  ok("grammar item skips the completed B1 topic (not Present Perfect)", !text.includes("Present Perfect") && text.includes("Passive Voice"));
  ok("starts with an encouraging, guilt-free message", (await p.textContent("#plan-card [aria-live]")).includes("যথেষ্ট"));
  ok("topics-done stat reads grammarProgress (1)", (await p.textContent("#s-topics")).trim() === "1");
  await p.screenshot({ path: "/tmp/dash-plan.png", clip: { x: 0, y: 330, width: 390, height: 520 } });

  await p.locator("#plan-card [role=checkbox]").first().click();
  await p.waitForTimeout(150);
  const c = calls[0];
  ok("check → saves to users/u1", c && c.ref.path === "users/u1");
  ok("payload: planProgress{date,done,skills} + planHistory.<skill>", c && Object.keys(c.data.planProgress).sort().join() === "date,done,skills" && Object.keys(c.data).some((k) => k.startsWith("planHistory.")));
  ok("planProgress.date is a YYYY-MM-DD string", /^\d{4}-\d{2}-\d{2}$/.test(c.data.planProgress.date));
  ok("progress shows 1/2", (await p.textContent("#plan-card [aria-live]")).includes("১/২"));
  await p.locator("#plan-card [role=checkbox]").nth(1).click();
  await p.waitForTimeout(150);
  ok("all done → celebration", (await p.textContent("#plan-card [aria-live]")).includes("🎉"));
  await p.locator("#plan-card [role=checkbox]").first().click();   // un-check
  await p.waitForTimeout(150);
  ok("un-check works and does not write planHistory", calls[calls.length - 1] && !Object.keys(calls[calls.length - 1].data).some((k) => k.startsWith("planHistory.")));
  ok("no page errors", errors.length === 0);
  await p.close();

  // reload with saved progress: plan must stay identical and show the done items
  const day = new Date(); const iso = `2026-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
  ({ p, calls, errors } = await open(b, { displayName: "Rafi", learningProfile: profile, planProgress: { date: iso, done: ["speaking"], skills: ["grammar", "speaking"] }, planHistory: { speaking: iso } }));
  await p.waitForSelector("#plan-card .es-card");
  ok("locked plan restored from saved skills", (await p.locator("#plan-card [role=checkbox][aria-checked=true]").count()) === 1);
  await p.close();

  // save failure → rolls back and tells the learner
  ({ p, calls, errors } = await open(b, { displayName: "Rafi", learningProfile: profile }, { failSave: true }));
  await p.waitForSelector("#plan-card .es-card");
  await p.locator("#plan-card [role=checkbox]").first().click();
  await p.waitForTimeout(250);
  ok("failed save → checkbox rolls back", (await p.locator("#plan-card [role=checkbox][aria-checked=true]").count()) === 0);
  ok("failed save → learner is told", !!(await p.evaluate(() => window.__toast)));
  await p.close();

  // guest still gets a plan, social cards stay locked
  ({ p, calls, errors } = await open(b, { displayName: "Guest", learningProfile: profile }, { guest: true }));
  await p.waitForSelector("#plan-card .es-card");
  ok("guest sees the plan", (await p.locator("#plan-card [role=checkbox]").count()) === 2);
  ok("guest: chat card is locked", (await p.getAttribute('a[data-social][href*="chat.html"]', "href")).startsWith("upgrade.html"));
  await p.close();

  // no profile: redirected to onboarding (stub has no onboarding deps → just check the URL)
  ({ p } = await open(b, { displayName: "New" }));
  await p.waitForURL("**/onboarding.html", { timeout: 4000 }).catch(() => {});
  ok("no profile → onboarding", p.url().includes("onboarding.html"));
  await p.close();

  for (const [n, c] of res) console.log(c ? "PASS" : "FAIL", n);
  await b.close(); process.exit(res.every(([, c]) => c) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
