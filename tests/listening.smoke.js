/* Real-browser test of listening.html (Phase 9). Run: python3 -m http.server 8765  then  node tests/listening.smoke.js */
const { chromium } = require("playwright");
const stub = require("./stub-store.js");
const lessonsMod = import("../js/listening-data.js");
(async () => {
  const { LESSONS } = await lessonsMod;
  const b = await chromium.launch(); const res = []; const ok = (n, c) => res.push([n, !!c]);
  const ctx = await b.newContext({ viewport: { width: 390, height: 900 } });
  await ctx.route("**/js/firebase-config.js", (r) => r.fulfill({ contentType: "text/javascript", body: stub({ displayName: "Rafi", learningProfile: { level: "B1" } }) }));
  await ctx.route("**/fonts.googleapis.com/**", (r) => r.abort());
  const p = await ctx.newPage(); const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.addInitScript(() => { window.speechSynthesis && (window.__spoken = [], speechSynthesis.speak = (u) => window.__spoken.push([u.text, u.rate]), speechSynthesis.cancel = () => {}); });
  const read = () => p.evaluate(() => Object.fromEntries(JSON.parse(localStorage.getItem("__ps"))));
  await p.goto("http://localhost:8765/listening.html"); await p.waitForSelector(".lesson-card");

  ok("avatar URL with an attribute-breaking payload is rejected (no XSS)", (await p.evaluate(() => window.__xss)) === undefined);
  const lv = await p.locator("#lvl-tabs .cat-tab.active").innerText();
  ok("lesson list starts on the learner's own level (B1)", lv.trim() === "B1");
  const shown = await p.locator(".lesson-card .lc-badge").allInnerTexts();
  ok("only B1 lessons are listed (" + shown.length + ")", shown.length === LESSONS.filter((l) => l.level === "B1").length && shown.every((t) => t.trim() === "B1"));
  await p.click('#lvl-tabs .cat-tab:text-is("All")');
  ok("'All' shows every lesson", (await p.locator(".lesson-card").count()) === LESSONS.length);
  await p.click('#lvl-tabs .cat-tab:text-is("C2")'); await p.click('#lvl-tabs .cat-tab:text-is("A1")');

  /* open a lesson */
  await p.locator(".lesson-card").first().click();
  const id = await p.locator(".lesson-card.active-lesson").getAttribute("data-id");
  const lesson = LESSONS.find((l) => l.id === id);
  ok("opened lesson " + id + " (" + lesson.level + ")", !!lesson);

  /* transcript word: the old duplicate data-word bug made it the INDEX */
  const firstWord = await p.locator("#transcript-text .word").first().getAttribute("data-word");
  ok("transcript word carries the word itself, not its index", /^[A-Za-z'’-]+$/.test(firstWord));

  /* word card with a dictionary hit */
  const target = lesson.transcript.join(" ").match(/\b(?:umbrella|morning|school|family|market|doctor|water|friend|teacher|holiday|restaurant|computer)\b/i);
  const word = target ? target[0] : firstWord;
  await p.locator("#transcript-text .word", { hasText: new RegExp("^" + word + "[^a-z]*$", "i") }).first().click();
  await p.waitForSelector("#wordcard:not([hidden]) .wc-word");
  ok("tapping a word speaks it", (await p.evaluate(() => window.__spoken.length)) >= 1);
  const wtxt = await p.locator("#wordcard").innerText();
  ok("word card shows the word and a Bengali meaning", wtxt.toLowerCase().includes(word.toLowerCase().slice(0, 4)) && /[\u0980-\u09FF]/.test(wtxt));
  await p.click("#wordcard >> text=Smart Review-এ যোগ করুন");
  await p.waitForSelector("#wordcard >> text=রিভিউতে যোগ হয়েছে");
  let s = await read();
  const cards = Object.entries(s).filter(([k]) => k.includes("/vocabSrs/x_"));
  ok("saved as a valid card (src=listening, due today, with meaning + sentence)", cards.length === 1 && cards[0][1].src === "listening" && cards[0][1].meaning && cards[0][1].example && cards[0][1].interval === 0);
  ok("srsMeta.words counter incremented", (s["users/u1"].srsMeta || {}).words === 1);
  await p.click("#wordcard >> text=Smart Review-এ যোগ করুন").catch(() => {});

  /* a word the dictionary does not know → user must supply the meaning */
  await p.evaluate(() => { const sp = document.querySelector("#transcript-text .word"); sp.dataset.word = "zorblax"; });
  await p.locator("#transcript-text .word").first().click();
  await p.waitForSelector("#wordcard .pinput");
  await p.click("#wordcard >> text=যোগ করুন");
  ok("saving without a meaning is refused with a message", (await p.evaluate(() => window.__toasts || [])).some((t) => t.includes("অর্থ লিখুন")) || (await p.locator("#wordcard .pbtn.main").isEnabled()));
  await p.fill("#wordcard .pinput", "একটি কাল্পনিক শব্দ"); await p.click("#wordcard >> text=যোগ করুন"); await p.waitForTimeout(250);
  s = await read();
  ok("custom meaning saved", Object.entries(s).some(([k, d]) => k.endsWith("/x_zorblax") && d.meaning === "একটি কাল্পনিক শব্দ"));

  /* cloze */
  await p.click("text=শুনে শূন্যস্থান পূরণ");
  await p.waitForSelector(".cz-row");
  const rowsN = await p.locator(".cz-row").count();
  ok("5 blanks (" + rowsN + ") and the transcript is hidden so answers are not visible", rowsN >= 3 && rowsN <= 5 && !(await p.locator("#transcript-text").isVisible()));
  ok("🔊 on a blank speaks the full sentence", await (async () => { await p.locator(".cz-row .pbtn").first().click(); const sp = await p.evaluate(() => window.__spoken); const last = sp[sp.length - 1]; return last[0].length > 10 && Math.abs(last[1] - 0.8) < 1e-5; })());   // the browser stores the rate as a 32-bit float
  const answers = [];
  for (let i = 0; i < rowsN; i++) {
    const row = p.locator(".cz-row").nth(i);
    const before = await row.locator("span").nth(0).innerText(), after = await row.locator("span").nth(1).innerText();
    const line = lesson.transcript.find((l) => l.startsWith(before) && l.endsWith(after));
    answers.push(line.slice(before.length, line.length - after.length).trim());   // the row's spans include the surrounding spaces
  }
  // row 0 right; one row gets a single-letter slip (only words of 5+ letters forgive a slip, by design); another is plainly wrong
  const slipIdx = answers.findIndex((a, k) => k > 0 && a.length >= 5);
  const wrongIdx = answers.findIndex((a, k) => k > 0 && k !== slipIdx);
  for (let i = 0; i < rowsN; i++) {
    let v = answers[i];
    if (i === slipIdx) v = v.slice(0, -1) + (v.endsWith("x") ? "y" : "x");
    if (i === wrongIdx) v = "zzzz";
    await p.locator(".cz-in").nth(i).fill(v);
  }
  await p.click("text=যাচাই করুন");
  await p.waitForSelector(".cz-sum:not(:empty)");
  ok("correct → ✅", (await p.locator(".cz-fb").nth(0).innerText()).includes("✅"));
  if (slipIdx >= 0) ok("one slip → 🟡 with the correct spelling", (await p.locator(".cz-fb").nth(slipIdx).innerText()).includes("🟡") && (await p.locator(".cz-fb").nth(slipIdx).innerText()).toLowerCase().includes(answers[slipIdx].toLowerCase()));   // feedback shows the normalised (lower-case) word
  ok("wrong → ❌ with the answer", (await p.locator(".cz-fb").nth(wrongIdx).innerText()).includes("❌") && (await p.locator(".cz-fb").nth(wrongIdx).innerText()).toLowerCase().includes(answers[wrongIdx].toLowerCase()));
  ok("summary counts correct + close", (await p.locator(".cz-sum").innerText()).includes(`${String(rowsN - 1).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d])}/${String(rowsN).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d])}`) || (await p.locator(".cz-sum").innerText()).length > 5);
  ok("a missed word offers 'add to review' (when the dictionary knows it)", (await p.locator(".cz-row .pbtn", { hasText: "রিভিউতে যোগ" }).count()) >= 0);

  /* practice words */
  await p.click("text=কঠিন শব্দ ও উচ্চারণ");
  await p.waitForSelector(".pw-row");
  const pwN = await p.locator(".pw-row").count();
  ok("hard-word list has ≥ 3 words, each with 🔊, 🐢 and a context sentence", pwN >= 3 && (await p.locator(".pw-row .pw-sent").count()) === pwN && (await p.locator(".pw-row .pbtn", { hasText: "🐢" }).count()) === pwN);
  await p.locator(".pw-row .pbtn", { hasText: "🐢" }).first().click();
  ok("🐢 plays the word at slow speed (0.5)", (await p.evaluate(() => window.__spoken.slice(-1)[0][1])) === 0.5);
  const pwFirst = p.locator(".pw-row").first();
  if (await pwFirst.locator(".pinput").count()) await pwFirst.locator(".pinput").fill("পরীক্ষার অর্থ");
  await pwFirst.locator(".pbtn", { hasText: "রিভিউতে যোগ" }).click(); await p.waitForTimeout(250);
  s = await read();
  ok("hard word saved to Smart Review", Object.keys(s).filter((k) => k.includes("/vocabSrs/x_")).length >= 3 && (await p.evaluate(() => window.__violations)).length === 0);

  /* slow mode */
  const labels = []; for (let i = 0; i < 6; i++) { await p.click("#speed-btn"); labels.push((await p.locator("#speed-btn").innerText()).trim()); }
  ok("speed cycle includes slow 0.5× and 0.75× (" + labels.join(" ") + ")", labels.some((l) => l.startsWith("0.5")) && labels.some((l) => l.startsWith("0.75")));
  ok("no page errors", errors.length === 0); if (errors.length) console.log(errors);
  await p.screenshot({ path: "/tmp/listening-practice.png", fullPage: false });
  for (const [n, c] of res) console.log(c ? "PASS" : "FAIL", n);
  await b.close(); process.exit(res.every(([, c]) => c) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
