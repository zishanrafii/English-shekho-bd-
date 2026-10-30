const { chromium } = require("playwright"); const fs = require("fs");
const STUB = fs.readFileSync(""+__dirname+"/stub-min.js", "utf8");
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 800 } });
  await ctx.route("**/js/firebase-config.js", (r) => r.fulfill({ contentType: "text/javascript", body: STUB }));
  await ctx.route("**/fonts.googleapis.com/**", (r) => r.abort());
  const cat = JSON.parse(fs.readFileSync(__dirname + "/../data/plan-catalog.json")).topics; let bad = [], n = 0, qs = 0;
  for (const lvl of Object.keys(cat)) for (const t of cat[lvl]) {
    const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
    await p.goto("http://localhost:8765/" + t.href); await p.waitForSelector("#gp-steps", { timeout: 4000 }).catch(() => {});
    const total = await p.locator(".practice-q").count(); qs += total;
    for (let i = 0; i < total; i++) await p.locator(".practice-q").nth(i).locator(i % 2 ? ".pq-opt[data-correct]" : ".pq-opt:not([data-correct])").first().click();
    const panel = await p.locator("#gp-panel").count(), locked = await p.locator("#complete-btn").isDisabled().catch(() => null);
    const wrongShown = await p.locator("#gp-panel .gp-miss").count();
    const expectWrong = Math.ceil(total / 2);
    if (!total || !panel || locked !== false || wrongShown !== expectWrong || errs.length) bad.push([t.id, total, panel, locked, wrongShown, errs[0]]);
    n++; await p.close();
  }
  console.log("topic pages tested:", n, "| practice questions:", qs, "| problems:", JSON.stringify(bad));
  await b.close(); process.exit(bad.length ? 1 : 0);
})();
