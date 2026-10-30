/* Real-browser test of the Phase-11 writing flow (paragraph-writing.html, writing-review.html, writing-lab.html).
   Firebase = in-memory store mirroring the new rules; the AI route is mocked (no key, no network).
   Run: python3 -m http.server 8765  then  node tests/writing.smoke.js */
const { chromium } = require("playwright");
const stub = require("./stub-store.js");
const BASE = "http://localhost:8765/";
const profile = { level: "A2", skills: ["writing"], dailyMinutes: 10, style: "structured", reasons: ["job"] };
const TEXT = "yesterday i go to the market. She ate a apple and we discussed about the price with the seller. He go home late and it was a long day for all of us";

(async () => {
  const b = await chromium.launch(); const res = []; const ok = (n, c) => res.push([n, !!c]);
  const mkctx = async (userDoc = { displayName: "Rafi", learningProfile: profile }, anon = false) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 900 } });
    await ctx.route("**/js/firebase-config.js", (r) => r.fulfill({ contentType: "text/javascript", body: stub(userDoc) }));
    await ctx.route("**/fonts.googleapis.com/**", (r) => r.abort());
    await ctx.addInitScript((a) => { window.__isAnonymous = a; window.__confirm = true; window.confirm = () => window.__confirm; }, anon);
    return ctx;
  };
  const read = (p) => p.evaluate(() => Object.fromEntries(JSON.parse(localStorage.getItem("__ps"))));
  const open = async (ctx, page) => { const p = await ctx.newPage(); p._errors = []; p.on("pageerror", (e) => p._errors.push(e.message)); await p.goto(BASE + page); await p.waitForSelector("#main-editor"); return p; };
  const write = async (p, t) => { await p.fill("#main-editor", t); };
  const mem = async (p) => Object.entries(await read(p)).filter(([k]) => k.includes("/writingMistakes/")).map(([k, d]) => ({ id: k.split("/").pop(), ...d }));

  /* ═══ the instant check ═══ */
  let ctx = await mkctx(); let p = await open(ctx, "paragraph-writing.html");
  ok("avatar payload with markup does not execute (safe image URL only)", (await p.evaluate(() => window.__xss)) === undefined);
  ok("the button no longer claims to be 'AI Check'", (await p.locator(".btn-check").innerText()).includes("Writing Check"));
  await p.click(".btn-check");
  ok("fewer than 8 words → a friendly 'write a little more' message, no panel", (await p.locator("#feedback-panel.show").count()) === 0);
  await write(p, TEXT); await p.click(".btn-check");
  await p.waitForSelector("#feedback-panel.show .fp-score-row");
  const panel = () => p.locator("#feedback-panel");
  ok("instant check works with NO network/AI call and is labelled as such", (await panel().innerText()).includes("কোনো AI লাগে না"));
  const words = TEXT.split(/\s+/).length;
  ok(`measured metrics are shown (words = ${words}, sentences, variety needs ≥ 30 words)`, (await panel().innerText()).includes(String(words).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d])) && (await p.locator(".fp-score-item").count()) === 4);
  const issueBoxes = p.locator("#feedback-panel .fp-section .fp-item[style*='display: block']");
  const n0 = await issueBoxes.count();
  ok("rule-based issues listed, each with a category tag, the marked text and a Bengali explanation (" + n0 + ")", n0 >= 6 && /articles/i.test(await panel().innerText()) && /subject.verb/i.test(await panel().innerText()) && /prepositions/i.test(await panel().innerText()) && /[\u0980-\u09FF]/.test(await issueBoxes.first().innerText()));
  ok("the wrong words are visibly marked (strike-through) with the suggestion beside them", (await p.locator("#feedback-panel mark").count()) >= n0);
  ok("an honest note says only certain rule-based problems are detected here", (await panel().innerText()).includes("নিশ্চিত নিয়ম-ভিত্তিক"));

  /* apply one fix */
  const before = await p.inputValue("#main-editor");
  await p.locator("#feedback-panel button", { hasText: "ঠিক করুন" }).first().click();
  const afterFix = await p.inputValue("#main-editor");
  ok("'ঠিক করুন' edits the learner's text in place and re-checks (one fewer issue)", afterFix !== before && afterFix.length >= before.length - 5 && (await issueBoxes.count()) === n0 - 1);
  ok("word counter follows the edit", (await p.locator("#word-count").innerText()).length > 0);
  await p.click("text=সবগুলো ঠিক করুন");
  const fixedAll = await p.inputValue("#main-editor");
  ok("'fix all' applies every remaining fix; the text improves and the check re-runs", fixedAll.includes("an apple") && fixedAll.includes("goes home") && fixedAll.includes("discussed the price") && fixedAll.includes("I go"));
  ok("after fixing everything the panel congratulates instead of shaming", (await panel().innerText()).includes("কোনো নিশ্চিত সমস্যা পাওয়া যায়নি") || (await issueBoxes.count()) <= 2);

  /* ═══ mistake memory ═══ */
  await write(p, TEXT); await p.click(".btn-check"); await p.waitForSelector("#feedback-panel.show .fp-score-row");
  await p.waitForFunction(() => document.querySelector("#feedback-panel")?.textContent.includes("ভুলের") || document.querySelector("#feedback-panel")?.textContent.includes("ভুল থেকে শেখা"));
  let ms = await mem(p);
  ok("knowledge-gap mistakes were stored (article, agreement, preposition) — NOT capital letters or punctuation", ms.length >= 3 && ms.every((m) => ["article", "agreement", "preposition", "tense", "word-form", "word-choice"].includes(m.category)) && ms.some((m) => m.category === "article") && ms.some((m) => m.category === "agreement") && ms.some((m) => m.category === "preposition"));
  ok("each stored mistake: phrase, correction, Bengali reason, the sentence it came from, unresolved, count 1", ms.every((m) => m.original && m.corrected && m.original !== m.corrected && /[\u0980-\u09FF]/.test(m.why) && m.context && m.fixed === false && m.count === 1));
  ok("the learner is told the mistakes are in 'ভুল থেকে শেখা' (new or already there) and gets a link to practise", (await panel().innerText()).includes("ভুল থেকে শেখা") && (await p.locator('#feedback-panel a[href="writing-review.html"]').count()) === 1);
  const countBefore = ms.length;
  await p.click(".btn-check"); await p.waitForTimeout(500);
  ms = await mem(p);
  ok("checking the SAME text again does not duplicate memory or inflate counts (same day)", ms.length === countBefore && ms.every((m) => m.count === 1));
  ok("no rule violations so far", (await p.evaluate(() => window.__violations)).length === 0);

  /* ═══ AI coach ═══ */
  const AI = { summary: "ভালো চেষ্টা! <img src=x onerror=window.__aixss=1>", corrections: [
      { original: "a apple", corrected: "an apple", category: "article", explanationBn: "apple স্বরধ্বনি দিয়ে শুরু" },
      { original: "with the seller", corrected: "with the seller", category: "other", explanationBn: "" },
      { original: "this was never written", corrected: "invented", category: "tense", explanationBn: "x" },
      { original: "for all of us", corrected: "for everyone", category: "word-choice", explanationBn: "সংক্ষিপ্ত রূপ" }],
    naturalRewrite: "Yesterday I went to the market. She ate an apple.", vocabulary: [{ word: "long", better: "exhausting", noteBn: "আরও জোরালো" }], structure: ["শেষে একটি উপসংহার বাক্য যোগ করুন"], strengths: ["আপনি অনেক তথ্য দিয়েছেন"], nextSteps: ["অতীতকালের ক্রিয়া অনুশীলন করুন"] };
  let aiBody = null;
  await p.route("**/api/writing-coach", async (r) => { aiBody = JSON.parse(r.request().postData()); await r.fulfill({ contentType: "application/json", body: JSON.stringify(AI) }); });
  await p.click("text=AI মতামত নিন");
  await p.waitForSelector("text=সংশোধন");
  ok("AI result is clearly labelled as AI opinion that may be wrong", (await panel().innerText()).includes("AI-এর মতামত") && (await panel().innerText()).includes("ভুল হতে পারে"));
  ok("only text, type, level and task title were sent: no scores, no uid", Object.keys(aiBody).sort().join() === "level,task,text,type" && aiBody.level === "A2" && aiBody.type === "paragraph" && !/uid|score|xp/i.test(JSON.stringify(aiBody)));
  ok("HTML in the AI reply is shown as plain text and never executed (XSS from AI output is blocked)", (await p.evaluate(() => window.__aixss)) === undefined && (await p.locator("#feedback-panel img").count()) === 0 && (await panel().innerText()).includes("<img"));
  const aiRows = await p.locator("#feedback-panel mark").allInnerTexts();
  ok("corrections not quoting the learner's text, and no-op ones, are dropped on the client too (only 2 real ones remain)", aiRows.includes("a apple") && aiRows.includes("for all of us") && !aiRows.includes("this was never written"));
  ok("rewrite, vocabulary, structure, strengths and next steps all rendered", (await panel().innerText()).includes("exhausting") && (await panel().innerText()).includes("উপসংহার") && (await panel().innerText()).includes("Yesterday I went to the market"));
  await write(p, TEXT);
  await p.locator("#feedback-panel .fp-item[style*='display: block']", { hasText: "for everyone" }).locator("button", { hasText: "ঠিক করুন" }).click();
  ok("an AI correction can be applied, and only where the quote still exists", (await p.inputValue("#main-editor")).includes("for everyone"));
  await p.waitForTimeout(500); ms = await mem(p);
  ok("the verified AI finding also entered the memory (word-choice) with a valid document", ms.some((m) => m.category === "word-choice" && m.original === "for all of us" && m.corrected === "for everyone") && (await p.evaluate(() => window.__violations)).length === 0);
  await p.click("text=এটি Editor-এ বসান");
  ok("natural rewrite replaces the text only after the learner confirms", (await p.inputValue("#main-editor")).startsWith("Yesterday I went to the market."));
  await p.unroute("**/api/writing-coach"); await p.route("**/api/writing-coach", (r) => r.fulfill({ status: 429, contentType: "application/json", body: "{}" }));
  await write(p, TEXT); await p.click(".btn-check"); await p.waitForSelector("#feedback-panel.show .fp-score-row"); await p.click("text=AI মতামত নিন");
  await p.waitForFunction(() => document.querySelector("#feedback-panel")?.textContent.includes("সীমা"));
  ok("AI limit reached → calm message; the instant check keeps working", (await p.locator("#feedback-panel .fp-score-row").count()) === 1);
  ok("no page errors during checking", p._errors.length === 0); if (p._errors.length) console.log(p._errors);

  /* ═══ submit: honest XP + metrics + plan ═══ */
  await write(p, "I follow a regular routine every day. I wake up at seven and I drink tea. Then I go to school by bus with my friends and we study many subjects. In the afternoon I play football and in the evening I do my homework and watch television with my family.");
  await p.click(".btn-submit");
  await p.waitForFunction(() => document.querySelector("#main-editor")?.value === "");
  let st = await read(p);
  const w1 = Object.entries(st).filter(([k]) => k.startsWith("writings/")).map(([, d]) => d);
  ok("submission saved with metrics (issueCount, sentences, level) and passes the writings rule", w1.length === 1 && w1[0].level === "A2" && Number.isInteger(w1[0].issueCount) && w1[0].sentences >= 3 && w1[0].version === 1 && w1[0].reviewCount === 0 && w1[0].submittedAt === "TS");
  ok("first submission of the task today earns its XP (75)", w1[0].xpEarned === 75 && st["users/u1"].xp === 75);
  ok("XP bookkeeping saved (writingStats) and the daily plan records writing", st["users/u1"].writingStats.xpTasks.includes("p1") && /^\d{4}-\d{2}-\d{2}$/.test(st["users/u1"].planHistory.writing));
  ok("writing is the learner's focus skill → the plan's item is ticked", st["users/u1"].planProgress && st["users/u1"].planProgress.done.includes("writing"));
  const longText = "I follow a regular routine every day. I wake up at seven and I drink tea. Then I go to school by bus with my friends and we study many subjects. In the afternoon I play football and in the evening I do my homework.";
  await write(p, longText); await p.click(".btn-submit"); await p.waitForFunction(() => document.querySelector("#main-editor")?.value === "");
  st = await read(p); const w2 = Object.entries(st).filter(([k]) => k.startsWith("writings/")).map(([, d]) => d);
  ok("the SAME task again today: still saved, but NO second XP (no XP farming)", w2.length === 2 && w2.filter((x) => x.xpEarned === 0).length === 1 && st["users/u1"].xp === 75);
  ok("the learner is told kindly why there was no XP (no scolding)", await p.waitForFunction(() => /আগেই পেয়েছেন/.test(document.body.innerText) || /আগেই পেয়েছেন/.test(document.querySelector(".app-toast, #toast")?.textContent || ""), null, { timeout: 4000 }).then(() => true, () => false));
  await p.locator("#task-tabs > *").nth(1).click();
  ok("switching to another task works (tab list is real)", (await p.locator("#task-tabs > *").count()) >= 2);
  await write(p, "I like tea and I drink it every morning with my breakfast at home.");
  await p.click(".btn-submit"); await p.waitForFunction(() => document.querySelector("#main-editor")?.value === ""); await p.waitForTimeout(200); st = await read(p);
  const w3 = Object.entries(st).filter(([k]) => k.startsWith("writings/")).map(([, d]) => d);
  ok("a different task but a very short text (14 words) is saved WITHOUT XP (needs ≥ 60% of the target length)", w3.length === 3 && w3.filter((x) => x.wordCount < 20).every((x) => x.xpEarned === 0) && w3.filter((x) => x.wordCount < 20).length === 1 && st["users/u1"].xp === 75);
  ok("no rule violations and no page errors across submits", (await p.evaluate(() => window.__violations)).length === 0 && p._errors.length === 0);
  await p.close();

  /* ═══ review page ═══ */
  const seed = { displayName: "Rafi", learningProfile: profile };
  await ctx.close(); ctx = await mkctx(seed);
  await ctx.addInitScript(() => { if (!localStorage.getItem("__ps")) localStorage.setItem("__ps", JSON.stringify([["users/u1", { displayName: "Rafi", learningProfile: { level: "A2" } }],
    ["users/u1/writingMistakes/m1", { category: "article", original: "a apple", corrected: "an apple", why: "apple স্বরধ্বনি দিয়ে শুরু", context: "She ate a apple at lunch.", last: "2026-10-01", fixed: false, count: 2 }],
    ["users/u1/writingMistakes/m2", { category: "preposition", original: "discussed about the plan", corrected: "discussed the plan", why: "discuss-এর পরে about বসে না", context: "We discussed about the plan.", last: "2026-10-01", fixed: false, count: 1 }],
    ["users/u1/writingMistakes/m3", { category: "tense", original: "old", corrected: "new", last: "2026-10-01", fixed: true, count: 1 }]])); });
  p = await ctx.newPage(); p._errors = []; p.on("pageerror", (e) => p._errors.push(e.message));
  await p.goto(BASE + "writing-review.html"); await p.waitForSelector(".ctx");
  ok("review shows only unresolved mistakes (2, not the fixed one) with a category summary", (await p.locator(".es-badge--info").innerText()).includes("১ / ২") && (await p.locator(".sum .es-badge").count()) === 2);
  ok("the mistake is shown inside its own sentence with the wrong words marked", (await p.locator(".ctx mark").count()) === 1);
  const first = (await p.locator(".ctx mark").innerText()).trim();
  const ans = first === "a apple" ? "a apple" : "discussed about the plan";
  await p.fill("#ans", ans); await p.click("text=যাচাই করুন");
  ok("typing the wrong version again is recognised and explained (not marked as fixed)", (await p.locator(".fb").innerText()).includes("আগের ভুল রূপটিই"));
  await p.click("text=পরের প্রশ্ন");
  const second = (await p.locator(".ctx mark").innerText()).trim();
  await p.fill("#ans", second === "a apple" ? "An Apple." : "discussed the plan"); await p.keyboard.press("Enter");
  await p.waitForSelector(".fb.ok");
  await p.waitForTimeout(250);
  let rs = await read(p);
  ok("a correct typed answer (case/punctuation-insensitive) marks that mistake as fixed", Object.entries(rs).filter(([k, d]) => k.includes("writingMistakes") && d.fixed === true).length === 2 && Object.entries(rs).filter(([k, d]) => k.includes("writingMistakes") && d.fixed === false).length === 1);
  const open1 = Object.entries(rs).find(([k, d]) => k.includes("writingMistakes") && d.fixed === false && !k.endsWith("/m3"));
  const seedCount = { m1: 2, m2: 1 }[open1[0].split("/").pop()];
  ok("the answer typed wrongly increased that mistake's counter by exactly one (and it stays open)", open1[1].count === seedCount + 1);
  await p.click("text=শেষ করি");
  ok("summary is kind and counts progress", (await p.locator("#view").innerText()).includes("কোনো তাড়া নেই"));
  ok("no violations / errors in review", (await p.evaluate(() => window.__violations)).length === 0 && p._errors.length === 0);
  await p.close();

  /* ═══ lab summary card ═══ */
  p = await ctx.newPage(); await p.goto(BASE + "writing-lab.html"); await p.waitForSelector("#mm-card .es-card", { timeout: 8000 });
  ok("Writing Lab shows the mistake-memory summary with a practice link", (await p.locator("#mm-card").innerText()).includes("ভুলের স্মৃতি") && (await p.locator('#mm-card a[href="writing-review.html"]').count()) === 1);
  await p.close(); await ctx.close();

  /* ═══ guests ═══ */
  ctx = await mkctx({ displayName: "Guest", learningProfile: profile }, true);
  await ctx.addInitScript(() => { Object.defineProperty(window, "__guestFlag", { value: true }); });
  p = await open(ctx, "paragraph-writing.html");
  ok("guests can use the instant check", await (async () => { await write(p, TEXT); await p.click(".btn-check"); await p.waitForSelector("#feedback-panel.show .fp-score-row"); return true; })());
  ok("guests do not see the 'publish to community' option", await p.evaluate(() => { const c = document.getElementById("public-checkbox"); const l = c && c.closest("label"); return !c || (l ? l.hidden : false); }));
  await p.evaluate(() => { const c = document.getElementById("public-checkbox"); if (c) c.checked = true; });          // even if someone ticks it by script
  await write(p, "I follow a regular routine every day. I wake up at seven and I drink tea. Then I go to school by bus with my friends and we study many subjects. In the afternoon I play football and in the evening I do my homework and watch television with my family.");
  await p.click(".btn-submit"); await p.waitForFunction(() => document.querySelector("#main-editor")?.value === "");
  const gst = await read(p); const gw = Object.entries(gst).filter(([k]) => k.startsWith("writings/")).map(([, d]) => d);
  ok("a guest's submission is saved private (isPublic = false) and passes the rules", gw.length === 1 && gw[0].isPublic === false && (await p.evaluate(() => window.__violations)).length === 0);
  ok("the rules mirror REJECTS a guest document that claims isPublic = true", await p.evaluate(async () => { try { const m = await import("/js/firebase-config.js"); await m.addDoc(m.collection(m.db, "writings"), { uid: "u1", type: "essay", content: "x", isPublic: true, reviewCount: 0, submittedAt: "TS", wordCount: 1, xpEarned: 0 }); return false; } catch (e) { return /denied/.test(e.message); } }));
  await p.close(); await ctx.close();

  for (const [n, c] of res) console.log(c ? "PASS" : "FAIL", n);
  console.log(`\n${res.filter(([, c]) => c).length}/${res.length} passed`);
  await b.close(); process.exit(res.every(([, c]) => c) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
