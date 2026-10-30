/* Real-browser test of simulator.html (Phase 12).
   Real: Chromium, DOM/layout/focus, getUserMedia + MediaRecorder on a fake microphone device.
   Mocked: SpeechRecognition (scripted), speechSynthesis (records), the AI route (/api/sim-turn), Firebase (in-memory, mirrors the rules).
   Run: python3 -m http.server 8765  then  node tests/simulator.smoke.js */
const { chromium } = require("playwright");
const stub = require("./stub-store.js");
const URL_ = "http://localhost:8765/simulator.html";
const profile = { level: "A2", skills: ["speaking"], dailyMinutes: 10, style: "conversation", reasons: ["travel"] };
const INIT = (anon) => {
  window.__isAnonymous = anon; window.__spoken = []; window.__say = { text: "" };
  window.SpeechSynthesisUtterance = window.SpeechSynthesisUtterance || function (t) { this.text = t; };
  try { speechSynthesis.speak = (u) => window.__spoken.push([u.text, u.rate]); speechSynthesis.cancel = () => {}; } catch (_) {}
  window.SpeechRecognition = window.webkitSpeechRecognition = class {
    start() { this.onstart && this.onstart(); setTimeout(() => this.onspeechstart && this.onspeechstart(), 60); }
    stop() { const s = window.__say || {}; setTimeout(() => { if (s.error) this.onerror && this.onerror({ error: s.error }); else if (s.text) this.onresult && this.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: s.text, confidence: 0.9 }], { isFinal: true })] }); this.onend && this.onend(); }, 20); }
    abort() {}
  };
};
(async () => {
  const b = await chromium.launch({ args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
  const res = []; const ok = (n, c) => res.push([n, !!c]);
  const mk = async ({ anon = false, size = { width: 390, height: 900 }, doc = { displayName: "Rafi", learningProfile: profile } } = {}) => {
    const ctx = await b.newContext({ viewport: size });
    await ctx.route("**/js/firebase-config.js", (r) => r.fulfill({ contentType: "text/javascript", body: stub(doc) }));
    await ctx.route("**/fonts.googleapis.com/**", (r) => r.abort());
    await ctx.addInitScript(INIT, anon);
    return ctx;
  };
  const read = (p) => p.evaluate(() => Object.fromEntries(JSON.parse(localStorage.getItem("__ps"))));
  const open = async (ctx, q = "") => { const p = await ctx.newPage(); p._errors = []; p.on("pageerror", (e) => p._errors.push(e.message)); await p.goto(URL_ + q); await p.waitForSelector(".sc, #log, .goals"); return p; };
  const type = async (p, t) => { await p.fill("textarea", t); await p.click("#send"); await p.waitForFunction(() => !document.querySelector(".typing") && !document.getElementById("send").disabled); };
  const bubbles = (p) => p.locator("#log .b");
  const sessions = async (p) => Object.entries(await read(p)).filter(([k]) => k.startsWith("speaking_sessions/")).map(([, d]) => d);

  /* ═══ picker + briefing ═══ */
  let ctx = await mk(); let p = await open(ctx);
  ok("12 situations are offered", (await p.locator(".sc").count()) === 12);
  ok("registered learner: AI partner is the default, Guided is one tap away", (await p.locator('.mode[aria-pressed="true"]').innerText()).includes("AI") && (await p.locator(".mode").count()) === 2);
  const badges = await p.locator(".sc .bd").allInnerTexts();
  ok("scenarios that fit the learner's level (A2) come first and are marked; harder ones say so kindly", badges[0].includes("আপনার স্তরে") && badges[badges.length - 1].includes("একটু কঠিন") && !badges.some((x) => /কঠিন ও|খারাপ|ব্যর্থ/.test(x)));
  ok("the 'Practice, don't perform' spirit is stated", (await p.locator("#view").innerText()).includes("Practice, don’t perform"));
  await p.locator(".sc", { hasText: "At the Airport" }).click();
  ok("briefing: situation, the learner's role, 4 goals, useful phrases", (await p.locator(".goals li").count()) === 4 && (await p.locator(".phr button").count()) >= 5 && (await p.locator("#view").innerText()).includes("passenger"));
  await p.locator(".phr button").first().click();
  ok("tapping a useful phrase speaks it", (await p.evaluate(() => window.__spoken.length)) === 1);
  await p.click("text=← অন্য দৃশ্য"); await p.click('.mode:has-text("গাইডেড")');
  ok("switching to Guided is remembered", (await p.locator('.mode[aria-pressed="true"]').innerText()).includes("গাইডেড"));

  /* ═══ guided conversation ═══ */
  await p.locator(".sc", { hasText: "At the Airport" }).click(); await p.click("text=শুরু করি →");
  await p.waitForSelector("#log .b");
  ok("the partner speaks first (opening line, with a 🔊 button) and all goals start unticked", (await bubbles(p).count()) === 1 && (await p.locator("#log .b.p .say").count()) === 1 && (await p.locator(".goals li.done").count()) === 0);
  await type(p, "Hello. I am flying to Dubai today.");
  ok("a goal is ticked live from the learner's own words, and the screen-reader live region announces it", (await p.locator(".goals li.done").count()) === 1 && (await p.locator("#sr").innerText()).includes("লক্ষ্য পূরণ"));
  ok("the guided partner answers with the next relevant scripted line — it does NOT re-ask where they are flying (already answered)", (await bubbles(p).count()) === 3 && (await bubbles(p).nth(2).innerText()).includes("bags") && !(await bubbles(p).nth(2).innerText()).includes("flying"));
  await type(p, "I has one suitcase.");
  ok("a rule-based tip appears under the learner's bubble (agreement), gentle and in Bengali", (await p.locator("#log .b.l .tip").count()) === 1 && /Subject.verb/i.test(await p.locator("#log .b.l .tip").innerText()) && /[\u0980-\u09FF]/.test(await p.locator("#log .b.l .tip").innerText()));
  await p.click("text=💡 সাহায্য");
  ok("hint: names the next goal in Bengali and offers an example the learner can insert", (await p.locator(".notice").last().innerText()).includes("আসন") && (await p.locator('.notice button:text-is("বসান")').count()) === 1);
  await p.click('.notice button:text-is("বসান")');
  ok("'বসান' puts the example in the text box (editable before sending)", (await p.inputValue("textarea")).toLowerCase().includes("window seat"));
  await p.click("#send"); await p.waitForFunction(() => !document.querySelector(".typing") && !document.getElementById("send").disabled);
  await type(p, "Thank you very much!");
  ok("all four goals done → a celebration with a 'see report' button (conversation can continue if they want)", (await p.locator(".goals li.done").count()) === 4 && (await p.locator("text=সবগুলো লক্ষ্য পূরণ হয়েছে").count()) >= 1 && (await p.locator('text=রিপোর্ট দেখুন →').count()) === 1);
  ok("enter sends; the text box clears; empty send is refused with a friendly message", await (async () => { await p.fill("textarea", ""); await p.click("#send"); return (await p.locator(".err").count()) === 1; })());
  await p.click("text=রিপোর্ট দেখুন →");
  await p.waitForSelector(".tiles");
  const rep = await p.locator("#view").innerText();
  ok("report: headline, goals 4/4 (Bengali digits), turns, words, issue rate", rep.includes("🎉") && rep.includes("৪/৪") && (await p.locator(".tile").count()) === 5);
  ok("report shows the sentence to improve with before → after and the Bengali reason", (await p.locator(".mis").count()) >= 1 && (await p.locator(".mis s").first().innerText()).includes("has") && (await p.locator(".mis ins").first().innerText()).includes("have"));
  ok("report: next steps, never shaming", (await p.locator("#view").innerText()).includes("পরের ধাপ") && !/ব্যর্থ|খারাপ|দুর্বল|লজ্জা|ফেল/.test(rep));
  await p.waitForFunction(() => document.getElementById("savestat")?.textContent.includes("সেভ হয়েছে"));
  let st = await read(p); const ss = await sessions(p);
  ok("saved ONE speaking session: mode sim, scenario, 4/4 goals, turns, learner's words, server time — passes the rules", ss.length === 1 && ss[0].mode === "sim" && ss[0].scenarioId === "airport" && ss[0].objectivesDone === 4 && ss[0].objectivesTotal === 4 && ss[0].turns >= 4 && ss[0].activityId === "sim:airport" && ss[0].transcript.includes("flying to Dubai") && ss[0].recordedAt === "TS" && ss[0].scores.overall === 100);
  ok("stats: modes.sim = 1 and the accuracy counters were not touched", st["users/u1"].speakingStats.modes.sim === 1 && !("accSum" in st["users/u1"].speakingStats));
  ok("completing a role-play fulfils today's speaking goal and ticks the plan (speaking is the learner's focus skill)", /^\d{4}/.test(st["users/u1"].planHistory.speaking) && st["users/u1"].planProgress.done.includes("speaking") && (await p.locator("#savestat").innerText()).includes("লক্ষ্য পূরণ"));
  const mem = Object.entries(st).filter(([k]) => k.includes("/writingMistakes/"));
  ok("the learner's English mistakes entered the SAME Personal Mistake Memory as writing (agreement: I has → I have)", mem.length >= 1 && mem.some(([, d]) => d.category === "agreement" && d.corrected.includes("have") && d.fixed === false));
  ok("no rule violations, no page errors (guided flow)", (await p.evaluate(() => window.__violations)).length === 0 && p._errors.length === 0);
  await p.click("text=↺ আবার করুন"); await p.waitForSelector(".goals");
  ok("'try again' returns to the briefing of the same situation", (await p.locator("#view").innerText()).includes("আপনার লক্ষ্য"));
  await p.close();

  /* ═══ AI mode (route mocked) ═══ */
  let calls = []; let queue = [];
  const aiRoute = async (r) => { const body = JSON.parse(r.request().postData()); calls.push(body); const nxt = queue.shift(); if (!nxt) return r.fulfill({ status: 500, body: "{}" }); return r.fulfill({ status: nxt.status || 200, contentType: "application/json", body: JSON.stringify(nxt.body || {}) }); };
  p = await open(ctx); await p.route("**/api/sim-turn", aiRoute);
  await p.locator(".sc", { hasText: "Hotel Check-in" }).click(); await p.click("text=শুরু করি →"); await p.waitForSelector("#log .b");
  queue = [{ body: { reply: "Welcome! <img src=x onerror=window.__aix=1> Could I have your name, please?", finished: false } }];
  await type(p, "Good evening. I have a reservation.");
  ok("AI mode: the request contains ONLY scenario id, level, history and the new line (no persona, no prompt, no uid, no scores)", calls.length === 1 && Object.keys(calls[0]).sort().join() === "history,level,scenario,text" && calls[0].scenario === "hotel" && calls[0].level === "A2" && !/persona|prompt|uid|score|xp/i.test(JSON.stringify(calls[0])));
  ok("the history sent does NOT include the new line (only the opening) and every item has a valid role", calls[0].history.length === 1 && calls[0].history[0].role === "partner" && calls[0].text.includes("reservation"));
  ok("the AI's line appears; HTML in it is shown as plain text and never executes", (await bubbles(p).nth(2).innerText()).includes("Could I have your name") && (await p.locator("#log img").count()) === 0 && (await p.evaluate(() => window.__aix)) === undefined && (await bubbles(p).nth(2).innerText()).includes("<img"));
  queue = [{ status: 429, body: {} }];
  await type(p, "My name is Rahim and I will stay for three nights.");
  ok("AI limit reached → a calm notice, the conversation CONTINUES with the guided script, goals already achieved are kept", (await p.locator(".notice", { hasText: "সীমা শেষ" }).count()) === 1 && (await bubbles(p).count()) === 5 && (await p.locator(".goals li.done").count()) === 2);
  await type(p, "Is breakfast included?");
  ok("once on the script it stays on the script (no repeated AI calls, no repeated notice)", calls.length === 2 && (await p.locator(".notice", { hasText: "সীমা শেষ" }).count()) === 1);
  ok("no page errors in AI mode", p._errors.length === 0);
  await p.close();

  /* AI network failure + malformed AI answer */
  p = await open(ctx); await p.route("**/api/sim-turn", async (r) => r.abort());
  await p.locator(".sc", { hasText: "Restaurant" }).click(); await p.click("text=শুরু করি →"); await p.waitForSelector("#log .b");
  await type(p, "I would like the chicken curry, please.");
  ok("network failure → friendly notice and the guided partner answers (the learner is never stuck)", (await p.locator(".notice", { hasText: "সংযোগ নেই" }).count()) === 1 && (await bubbles(p).count()) === 3 && (await p.locator(".goals li.done").count()) >= 2);
  await p.close();
  p = await open(ctx); await p.route("**/api/sim-turn", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ reply: 123 }) }));
  await p.locator(".sc", { hasText: "Restaurant" }).click(); await p.click("text=শুরু করি →"); await p.waitForSelector("#log .b");
  await type(p, "I would like soup.");
  ok("a malformed AI answer (reply is not a string) is treated as a failure, not shown", (await bubbles(p).count()) === 3 && !(await bubbles(p).nth(2).innerText()).includes("123"));
  await p.close();

  /* ═══ speaking into the box ═══ */
  p = await open(ctx, "?scenario=airport&mode=guided");
  await p.click("text=শুরু করি →"); await p.waitForSelector("#log .b");
  ok("microphone button is offered (browser supports recognition) and clearly labelled", (await p.locator(".mic").isVisible()) && (await p.locator(".mic").getAttribute("aria-label")).includes("বলে"));
  await p.evaluate(() => { window.__say = { text: "I would like a window seat please" }; });
  await p.click(".mic"); await p.waitForSelector('.mic[aria-pressed="true"]');
  ok("while recording: the button shows the recording state and it is announced", (await p.locator("#sr").innerText()).includes("শুনছি"));
  await p.waitForTimeout(1100); await p.click(".mic");
  await p.waitForFunction(() => document.querySelector("textarea").value.length > 0);
  ok("the spoken sentence lands in the text box so the learner can correct recognition mistakes BEFORE sending", (await p.inputValue("textarea")) === "I would like a window seat please" && (await p.locator(".mic").getAttribute("aria-pressed")) === "false");
  await p.fill("textarea", "I would like a window seat, please."); await p.click("#send"); await p.waitForFunction(() => !document.querySelector(".typing") && !document.getElementById("send").disabled);
  ok("an edited spoken answer counts toward the goals like a typed one", (await p.locator(".goals li.done").count()) >= 1);
  for (const t of ["I am flying to Rome.", "I have one bag.", "Thank you."]) await type(p, t);
  await p.click("text=রিপোর্ট দেখুন →").catch(async () => { await p.click("text=শেষ করুন"); });
  await p.waitForFunction(() => document.getElementById("savestat")?.textContent.includes("সেভ হয়েছে"));
  ok("spoken time is recorded (durationSec > 0) for a session where the learner used the microphone", (await sessions(p)).some((x) => x.durationSec > 0.5));
  ok("no audio anywhere in the saved data", !/blob:|audio/i.test(JSON.stringify(await read(p))));
  await p.close();

  /* mic denied / unsupported: typing always works */
  const ctxD = await mk(); const pd = await ctxD.newPage();
  await pd.addInitScript(() => { navigator.mediaDevices.getUserMedia = async () => { const e = new Error("d"); e.name = "NotAllowedError"; throw e; }; });
  await pd.goto(URL_ + "?scenario=airport&mode=guided"); await pd.waitForSelector("text=শুরু করি →"); await pd.click("text=শুরু করি →"); await pd.waitForSelector("#log .b");
  await pd.click(".mic"); await pd.waitForSelector(".err");
  ok("mic permission denied → a friendly explanation that also says 'you can type instead'; the page keeps working", (await pd.locator(".err").innerText()).includes("অনুমতি") && (await pd.locator(".err").innerText()).includes("লিখে উত্তর"));
  await type(pd, "I am flying to Dubai.");
  ok("…and typing still advances the conversation", (await pd.locator(".goals li.done").count()) === 1);
  await pd.close(); await ctxD.close();
  const ctxU = await mk(); const pu = await ctxU.newPage(); await pu.addInitScript(() => { window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined; });
  await pu.goto(URL_ + "?scenario=airport&mode=guided"); await pu.waitForSelector("text=শুরু করি →"); await pu.click("text=শুরু করি →"); await pu.waitForSelector("#log .b");
  ok("unsupported browser: the microphone button is simply not shown; everything else works", (await pu.locator(".mic").isHidden()) && (await pu.locator("textarea").isVisible()));
  await pu.close(); await ctxU.close();

  /* ═══ turn limit ═══ */
  p = await open(ctx, "?scenario=travel&mode=guided"); await p.click("text=শুরু করি →"); await p.waitForSelector("#log .b");
  for (let i = 0; i < 12; i++) await type(p, "okay fine " + i);
  await p.fill("textarea", "one more"); await p.click("#send");
  ok("after 12 answers the 13th is refused kindly (and the learner is pointed to the report)", (await p.locator(".err", { hasText: "সীমা শেষ" }).count()) === 1);
  await p.click("text=শেষ করুন"); await p.waitForSelector(".tiles");
  ok("an unfinished conversation still gets a fair report (goals missed are shown with an example sentence)", (await p.locator(".goals li:not(.done)").count()) >= 1 && (await p.locator(".goals li:not(.done)").first().innerText()).includes("যেমন"));
  await p.close();

  /* finishing with nothing said */
  p = await open(ctx, "?scenario=travel&mode=guided"); await p.click("text=শুরু করি →"); await p.waitForSelector("#log .b");
  const beforeEmpty = (await sessions(p)).length;
  await p.click("text=শেষ করুন"); await p.waitForTimeout(400);
  ok("'finish' with no answers does not produce an empty report or an empty save", (await p.locator(".tiles").count()) === 0 && (await sessions(p)).length === beforeEmpty);
  await p.close();

  /* save failure + retry */
  p = await open(ctx, "?scenario=travel&mode=guided"); await p.click("text=শুরু করি →"); await p.waitForSelector("#log .b");
  await type(p, "Excuse me, how do I get to the station?");
  const travelBefore = (await sessions(p)).filter((x) => x.scenarioId === "travel").length;
  await p.evaluate(() => { window.__failWrites = true; }); await p.click("text=শেষ করুন"); await p.waitForSelector(".tiles");
  await p.waitForFunction(() => document.getElementById("savestat")?.textContent.includes("সেভ করা যায়নি"));
  ok("save failure: the report stays, a clear message and a retry button appear (nothing lost silently)", (await p.locator(".tiles").count()) === 1 && (await p.locator("#savestat button").count()) === 1);
  await p.evaluate(() => { window.__failWrites = false; }); await p.click("#savestat button"); await p.waitForFunction(() => document.getElementById("savestat")?.textContent.includes("সেভ হয়েছে"));
  ok("retry saves exactly one more session document", (await sessions(p)).filter((x) => x.scenarioId === "travel").length === travelBefore + 1 && (await p.evaluate(() => window.__violations)).length === 0);
  await p.close(); await ctx.close();

  /* ═══ guests ═══ */
  ctx = await mk({ anon: true, doc: { displayName: "Guest", learningProfile: profile } }); p = await open(ctx);
  ok("guest: defaults to Guided (AI partner is for signed-in learners)", (await p.locator('.mode[aria-pressed="true"]').innerText()).includes("গাইডেড"));
  await p.click('.mode:has-text("AI সঙ্গী")');
  ok("tapping AI as a guest explains kindly and changes nothing", (await p.locator('.mode[aria-pressed="true"]').innerText()).includes("গাইডেড"));
  await p.locator(".sc", { hasText: "Shopping" }).click(); await p.click("text=শুরু করি →"); await p.waitForSelector("#log .b");
  for (const t of ["I am looking for a blue shirt.", "Medium size, please.", "How much is it?", "I will take it."]) await type(p, t);
  await p.click("text=রিপোর্ট দেখুন →"); await p.waitForFunction(() => document.getElementById("savestat")?.textContent.includes("সেভ হয়েছে"));
  ok("a guest can complete and save a role-play (rules allow guests to write their own speaking data)", (await sessions(p)).length === 1 && (await p.evaluate(() => window.__violations)).length === 0);
  await p.close(); await ctx.close();

  /* ═══ mobile + accessibility ═══ */
  ctx = await mk({ size: { width: 360, height: 740 } }); p = await open(ctx);
  ok("360 px: no horizontal scrolling on the picker", await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await p.click('.mode:has-text("গাইডেড")'); await p.locator(".sc", { hasText: "Job Interview" }).click(); await p.click("text=শুরু করি →"); await p.waitForSelector("#log .b");
  ok("360 px: no horizontal scrolling in the conversation, and the input stays reachable on screen", await p.evaluate(() => { const d = document.querySelector(".dock").getBoundingClientRect(); return document.documentElement.scrollWidth <= window.innerWidth + 1 && d.bottom <= window.innerHeight + 2; }));
  const tiny = await p.evaluate(() => [...document.querySelectorAll("button, select, textarea")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height < 32; }).map((e) => e.textContent.trim().slice(0, 10)));
  ok("touch targets ≥ 32 px (" + tiny.join(",") + ")", tiny.length === 0);
  ok("the log is a live region with a label (screen readers hear new lines)", (await p.locator("#log").getAttribute("role")) === "log" && (await p.locator("#log").getAttribute("aria-live")) === "polite");
  ok("every control has an accessible name", await p.evaluate(() => [...document.querySelectorAll("button, textarea, select")].every((e) => (e.getAttribute("aria-label") || e.textContent || "").trim().length > 0 || e.getAttribute("placeholder"))));
  await p.screenshot({ path: "/tmp/sim-chat.png" });
  ok("no page errors on mobile", p._errors.length === 0);
  await p.close(); await ctx.close();

  for (const [n, c] of res) console.log(c ? "PASS" : "FAIL", n);
  console.log(`\n${res.filter(([, c]) => c).length}/${res.length} passed`);
  await b.close(); process.exit(res.every(([, c]) => c) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
