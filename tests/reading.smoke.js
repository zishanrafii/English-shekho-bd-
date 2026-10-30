/* Real-browser test of reading.html (Phase 9). Run: python3 -m http.server 8765  then  node tests/reading.smoke.js */
const { chromium } = require("playwright");
const stub = require("./stub-store.js");
(async () => {
  const { PASSAGES } = await import("../js/reading-data.js");
  const b = await chromium.launch(); const res = []; const ok = (n, c) => res.push([n, !!c]);
  const ctx = await b.newContext({ viewport: { width: 390, height: 900 } });
  await ctx.route("**/js/firebase-config.js", (r) => r.fulfill({ contentType: "text/javascript", body: stub({ displayName: "Rafi", learningProfile: { level: "B1" } }) }));
  await ctx.route("**/fonts.googleapis.com/**", (r) => r.abort());
  await ctx.addInitScript(() => { window.__skew = 0; const n = Date.now.bind(Date); Date.now = () => n() + window.__skew; });
  const p = await ctx.newPage(); const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  const read = () => p.evaluate(() => Object.fromEntries(JSON.parse(localStorage.getItem("__ps"))));
  await p.goto("http://localhost:8765/reading.html"); await p.waitForSelector(".passage-card");

  ok("avatar payload does not execute (safe image URL only)", (await p.evaluate(() => window.__xss)) === undefined);
  const active = await p.locator(".lvl-tab.active").innerText();
  ok("library opens on the learner's level (B1)", active.trim() === "B1");
  const badges = await p.locator(".passage-card").count();
  ok("only B1 passages listed (" + badges + ")", badges === PASSAGES.filter((x) => x.level === "B1").length);

  const passage = PASSAGES.find((x) => x.level === "B1");
  await p.locator(`.passage-card[data-id="${passage.id}"]`).click();
  await p.waitForSelector("#passage-text .vocab-word");
  const vw = p.locator("#passage-text .vocab-word").first();
  const key = await vw.getAttribute("data-word");
  await vw.click();
  await p.waitForSelector(".vocab-tooltip .vt-save");
  ok("tooltip shows the Bengali meaning and a save button", (await p.locator(".vocab-tooltip").innerText()).includes(passage.vocab[key].meaning_bn) && (await p.locator(".vt-save").count()) === 1);
  await p.click(".vt-save");
  await p.waitForFunction(() => document.querySelector(".vt-save")?.textContent.includes("যোগ হয়েছে"));
  let s = await read();
  const cardEntry = Object.entries(s).find(([k]) => k.includes("/vocabSrs/x_"));
  const card = cardEntry && cardEntry[1];
  ok("saved a valid card: reading source, level, meaning", card && card.src === "reading" && card.level === "B1" && card.meaning === passage.vocab[key].meaning_bn && card.word === key.toLowerCase().replace(/[^a-z\u00e0-\u024f' -]/g, ""));
  ok("the example is the real sentence from the passage that contains the word", card && card.example && card.example.toLowerCase().includes(key.toLowerCase().split(" ")[0].slice(0, 4)) && passage.text.join(" ").includes(card.example.slice(0, 20)));
  ok("due today as a fresh card (interval 0)", card && card.interval === 0 && card.reps === 0);
  ok("counter incremented", (s["users/u1"].srsMeta || {}).words === 1);
  ok("tooltip stays open after saving (clicking Save must not toggle it away)", (await p.locator(".vocab-tooltip").count()) === 1);

  /* second save of the same word → friendly 'already there' */
  await p.mouse.click(5, 5); await vw.click(); await p.waitForSelector(".vocab-tooltip .vt-save");
  await p.click(".vt-save");
  await p.waitForFunction(() => document.querySelector(".vt-save")?.textContent.includes("আগে থেকেই"));
  s = await read();
  ok("saving twice does not create a duplicate or double-count", Object.keys(s).filter((k) => k.includes("/vocabSrs/x_")).length === 1 && (s["users/u1"].srsMeta || {}).words === 1);

  /* finish reading after ~90 s → honest speed, measured BEFORE the quiz */
  await p.evaluate(() => { window.__skew = 90000; });
  await p.click('[data-action="finish-reading"]');
  await p.evaluate(() => { window.__skew = 90000 + 600000; });             // 10 more minutes spent on the quiz must NOT affect speed
  for (let i = 0; i < passage.quiz.length; i++) {
    await p.locator(".quiz-opt").nth(passage.quiz[i].ans).click();
    await p.waitForSelector('[data-action="next-q"]:visible', { timeout: 2000 }).catch(() => {});
    await p.click('[data-action="next-q"]').catch(() => {});
  }
  await p.waitForSelector("#quiz-result.show");
  const words = passage.text.join(" ").split(/\s+/).length;
  const hi = Math.round(words / 90 * 60), lo = Math.round(words / 95 * 60);          // 90 s of skew + a few real seconds of test time
  const fb = await p.locator("#qr-wpm").innerText();
  const shown = Number(fb.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d)).match(/\d+/)?.[0]);
  ok(`speed feedback shows ${lo}–${hi} wpm (got ${shown}); the 10 minutes spent on the quiz do not dilute it`, shown >= lo && shown <= hi);
  ok("feedback never scolds", !/খারাপ|দুর্বল|ব্যর্থ|লজ্জা/.test(fb));
  await p.waitForTimeout(300);
  s = await read();
  ok("the stored session holds the same measured wpm as the feedback", Object.entries(s).some(([k, d]) => k.includes("reading_sessions/") && d.wpm === shown));
  ok("daily plan history updated for reading", (s["users/u1"].planHistory || {}).reading && /^\d{4}-\d{2}-\d{2}$/.test(s["users/u1"].planHistory.reading));
  ok("no rule violations", (await p.evaluate(() => window.__violations)).length === 0);
  ok("no page errors", errors.length === 0); if (errors.length) console.log(errors);
  for (const [n, c] of res) console.log(c ? "PASS" : "FAIL", n);
  await b.close(); process.exit(res.every(([, c]) => c) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
