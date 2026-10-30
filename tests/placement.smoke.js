/* Real-browser test of placement.html (Firebase stubbed).  Run: python3 -m http.server 8765  then  node tests/placement.smoke.js */
const { chromium } = require("playwright");
const fs = require("fs");
const bank = JSON.parse(fs.readFileSync(__dirname + "/../data/placement-bank.json")).items;
const byStem = Object.fromEntries(bank.map((q) => [q.stem, q]));
const STUB = (profile) => `
export const db = {};
export const doc = (...a) => ({ path: a.slice(1).join("/") });
export const serverTimestamp = () => "TS";
export const updateDoc = async (ref, data) => { await window.__record(JSON.stringify({ ref, data })); };
export function requireAuth(cb) { cb({ uid: "u1", isAnonymous: true }, { learningProfile: ${JSON.stringify(profile)} }); }
`;
async function session(browser, profile, strategy) {
  const p = await browser.newPage({ viewport: { width: 390, height: 820 } });
  const errors = []; let saved = null;
  p.on("pageerror", (e) => errors.push(e.message));
  await p.exposeFunction("__record", (j) => { saved = JSON.parse(j); });
  await p.route("**/js/firebase-config.js", (r) => r.fulfill({ contentType: "text/javascript", body: STUB(profile) }));
  await p.route("**/fonts.googleapis.com/**", (r) => r.abort());
  await p.goto("http://localhost:8765/placement.html");
  if (!profile) { await p.waitForURL("**/onboarding.html", { timeout: 4000 }).catch(() => {}); return { p, errors, saved, url: p.url() }; }
  await p.waitForSelector("text=শুরু করি");
  await p.click("text=শুরু করি");
  let n = 0;
  while (n++ < 25) {
    if (await p.locator(".big").count()) break;
    const stem = (await p.locator(".stem").first().textContent()).trim();
    const q = byStem[stem] || bank.find((x) => x.type === "grammar" && x.stem === stem);
    if (!q) throw new Error("unknown stem " + stem);
    if (strategy === "allRight") await p.locator(".opt", { hasText: new RegExp("^" + q.correct.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$") }).first().click();
    else await p.click("text=জানি না");
  }
  return { p, errors, saved: () => saved, n };
}
(async () => {
  const b = await chromium.launch(); const res = [];
  const ok = (n, c) => res.push([n, !!c]);

  let s = await session(b, { level: "A1", levelPending: true, ageGroup: "teen" }, "allRight");
  const lvl = (await s.p.locator(".big").textContent()).trim();
  ok("all-correct learner gets C1/C2 (got " + lvl + ")", ["C1", "C2"].includes(lvl));
  ok("asked a sensible number of questions", s.n >= 10 && s.n <= 19);
  ok("recommended badge shown", await s.p.locator(".rec").count() === 1);
  await s.p.screenshot({ path: "/tmp/placement-result.png" });
  await s.p.click('.pick .opt[data-id="B2"]');
  await s.p.click("text=এই level-এ শুরু করি");
  await s.p.waitForTimeout(400);
  const d = s.saved() && s.saved().data;
  ok("saved to users/u1", s.saved() && s.saved().ref.path === "users/u1");
  ok("user's own choice (B2) wins over recommendation", d && d["learningProfile.level"] === "B2" && d["learningProfile.levelSource"] === "placement-adjusted");
  ok("levelPending cleared", d && d["learningProfile.levelPending"] === false);
  ok("placement keys match rules", d && Object.keys(d.placement).every((k) => ["version","recommended","chosen","answered","correct","confidence","takenAt"].includes(k)));
  ok("recommended recorded separately", d && ["C1","C2"].includes(d.placement.recommended) && d.placement.chosen === "B2");
  console.log("page errors:", JSON.stringify(s.errors)); ok("no page errors before leaving the page", s.errors.filter((e) => !/does not provide an export/.test(e)).length === 0);

  s = await session(b, { level: "B1", levelPending: false }, "dontKnow");
  const lvl2 = (await s.p.locator(".big").textContent()).trim();
  ok("all “জানি না” → A1 (got " + lvl2 + ")", lvl2 === "A1");

  s = await session(b, null, "x");
  ok("no profile → sent to onboarding", s.url.includes("onboarding.html"));

  for (const [n, c] of res) console.log(c ? "PASS" : "FAIL", n);
  await b.close(); process.exit(res.every(([, c]) => c) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
