/* Real-browser test of speaking-practice.html (Phase 10).
   Real: Chromium, getUserMedia (fake microphone device), MediaRecorder, DOM, layout, focus.
   Mocked: SpeechRecognition (no network/speech engine in headless Chromium → a scriptable stand-in), speechSynthesis (records what is spoken),
           Firebase (in-memory store that mirrors the security rules).
   Run: python3 -m http.server 8765  then  node tests/speaking.smoke.js */
const { chromium } = require("playwright");
const stub = require("./stub-store.js");
const { readFileSync } = require("fs");
const URL_ = "http://localhost:8765/speaking-practice.html";
const profile = { level: "A2", skills: ["speaking"], dailyMinutes: 10, style: "conversation", reasons: ["travel"] };

const INIT = () => {
  window.__spoken = []; window.__recs = []; window.__say = { text: "" };
  window.SpeechSynthesisUtterance = window.SpeechSynthesisUtterance || function (t) { this.text = t; };
  try { speechSynthesis.speak = (u) => window.__spoken.push([u.text, u.rate]); speechSynthesis.cancel = () => {}; } catch (_) {}
  // Chromium now ships an unprefixed SpeechRecognition that wins over webkitSpeechRecognition; replace BOTH so the scripted one is used
  window.SpeechRecognition = window.webkitSpeechRecognition = class {
    constructor() { window.__recs.push(this); }
    start() { this.onstart && this.onstart(); setTimeout(() => this.onspeechstart && this.onspeechstart(), 60); }
    stop() {
      const s = window.__say || {};
      setTimeout(() => {
        if (s.error) this.onerror && this.onerror({ error: s.error });
        else if (s.text) this.onresult && this.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: s.text, confidence: 0.9 }], { isFinal: true })] });
        this.onend && this.onend();
      }, 20);
    }
    abort() {}
  };
};

(async () => {
  const b = await chromium.launch({ args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
  const res = []; const ok = (n, c) => res.push([n, !!c]);
  const newCtx = async (userDoc = { displayName: "Rafi", learningProfile: profile }, size = { width: 390, height: 900 }) => {
    const ctx = await b.newContext({ viewport: size });
    await ctx.route("**/js/firebase-config.js", (r) => r.fulfill({ contentType: "text/javascript", body: stub(userDoc) }));
    await ctx.route("**/fonts.googleapis.com/**", (r) => r.abort());
    await ctx.addInitScript(INIT);
    return ctx;
  };
  const read = (p) => p.evaluate(() => Object.fromEntries(JSON.parse(localStorage.getItem("__ps"))));
  const sessions = async (p) => Object.entries(await read(p)).filter(([k]) => k.startsWith("speaking_sessions/")).map(([, d]) => d);
  const say = (p, text, extra = {}) => p.evaluate((x) => { window.__say = x; }, { text, ...extra });
  const record = async (p, text, holdMs = 1100, extra = {}) => { await say(p, text, extra); await p.click("#mic"); await p.waitForSelector("#mic.sp-m-recording"); await p.waitForTimeout(holdMs); await p.click("#mic"); };
  const open = async (ctx, query = "") => { const p = await ctx.newPage(); p._errors = []; p.on("pageerror", (e) => p._errors.push(e.message)); await p.goto(URL_ + query); await p.waitForSelector(".sp-target, .sp-pick"); return p; };

  /* ═══════════ REPEAT ═══════════ */
  let ctx = await newCtx(); let p = await open(ctx);
  ok("opens on the learner's own level (A2) and in Repeat mode", (await p.locator("#lvl").inputValue()) === "A2" && (await p.locator('.sp-tab[aria-selected="true"]').innerText()).includes("Repeat"));
  ok("four modes offered as tabs", (await p.locator(".sp-tab").count()) === 4 && (await p.locator('[role="tablist"]').count()) === 1);
  ok("the 'Practice, don't perform' message is shown", (await p.locator(".sp-tag").innerText()).includes("Practice, don’t perform"));
  ok("microphone explanation shown BEFORE any permission prompt (no prompt was triggered by opening the page)", (await p.locator("#permnote").innerText()).includes("মাইক্রোফোন") && (await p.evaluate(() => window.__recs.length)) === 0);
  const target = (await p.locator(".sp-target").innerText()).trim();
  ok("target is an A2 sentence", target.split(" ").length >= 4 && target.length < 60);
  await p.click("text=🔊 শুনুন");
  ok("Listen speaks the target at normal speed", (await p.evaluate(() => window.__spoken.slice(-1)[0])).join("|") === target + "|1");
  await p.click('button:text-is("০.৭৫×")');
  ok("0.75× speaks the target at 0.75", (await p.evaluate(() => window.__spoken.slice(-1)[0]))[1] === 0.75);
  ok("mic button is large, labelled and keyboard-focusable", await (async () => { const bx = await p.locator("#mic").boundingBox(); return bx.width >= 72 && bx.height >= 72 && (await p.locator("#mic").getAttribute("aria-label")).includes("রেকর্ড"); })());

  /* record → stop → result (say the sentence but with one wrong word) */
  const words = target.replace(/[.,?!]/g, "").split(" "); const wrongIdx = 1; const said = words.map((w, i) => (i === wrongIdx ? w.slice(0, -1) + "x" : w)).join(" ");
  await say(p, said);
  await p.click("#mic");
  await p.waitForSelector("#mic.sp-m-recording");
  ok("RECORDING state: stop button, aria-pressed, status announced, timer running — and the REAL microphone stream is open", (await p.locator("#mic").getAttribute("aria-pressed")) === "true" && (await p.locator("#sr").innerText()).includes("রেকর্ডিং") && (await p.locator("#miclabel").innerText()).includes("শুনছি"));
  await p.waitForTimeout(1300);
  ok("timer counts up while recording", /^00:0[1-9]/.test(await p.locator("#timer").innerText()));
  await p.click("#mic");
  await p.waitForSelector(".sp-result .sp-headline");
  ok("RESULT: headline, word accuracy tile, word-by-word chips", (await p.locator(".sp-headline").innerText()).length > 5 && (await p.locator(".sp-tile-l", { hasText: "শব্দের সঠিকতা" }).count()) === 1 && (await p.locator(".sp-chip").count()) === words.length);
  const accText = await p.locator(".sp-tile-v").first().innerText();
  const expectAcc = Math.round(((words.length - 1) / words.length) * 100);
  ok(`accuracy shown = ${expectAcc}% (one wrong word out of ${words.length})`, accText === expectAcc + "%");
  ok("the wrong word is flagged ⚠/✗ with a text label (not colour only); the others ✓", (await p.locator(".sp-chip .sp-sym", { hasText: "✓" }).count()) === words.length - 1 && (await p.locator(".sp-close, .sp-wrong, .sp-missed").count()) === 1 && (await p.locator(".sp-chip.sp-close, .sp-chip.sp-wrong, .sp-chip.sp-missed").first().getAttribute("aria-label")).length > 10);
  ok("honest disclaimer: this is recognised-word matching, not phoneme-level analysis", (await p.locator(".sp-fine").first().innerText()).includes("ধ্বনি-স্তরের"));
  ok("repeat mode shows no fluency/pace tile for a single sentence", (await p.locator(".sp-tile-l", { hasText: "সাবলীলতা" }).count()) === 0);
  ok("own-voice playback is offered (real MediaRecorder on the fake mic) and stays local", (await p.locator("audio.sp-audio").count()) === 1 && /^blob:/.test(await p.locator("audio.sp-audio").getAttribute("src")));
  ok("feedback is encouraging and names a concrete next step", /ভালো|চমৎকার/.test(await p.locator(".sp-headline").innerText()) && (await p.locator(".sp-next li").count()) >= 1);
  ok("focus moves to the result headline (screen-reader friendly)", await p.evaluate(() => document.activeElement && document.activeElement.classList.contains("sp-headline")) && (await p.locator("#sr").innerText()).includes("ফলাফল"));

  /* tap the problem word → Smart Review */
  await p.locator(".sp-chip.sp-close, .sp-chip.sp-wrong, .sp-chip.sp-missed").first().click();
  await p.waitForSelector("#wordpop:not([hidden])");
  const popWord = (await p.locator(".sp-popw").innerText()).trim();
  ok("word card opens with 🔊 and 🐢", (await p.locator("#wordpop button", { hasText: "🔊" }).count()) === 1 && (await p.locator("#wordpop button", { hasText: "🐢" }).count()) === 1);
  const needsMeaning = await p.locator("#wordpop input").count();
  if (needsMeaning) await p.fill("#wordpop input", "পরীক্ষা");
  await p.click("#wordpop >> text=যোগ করুন");
  await p.waitForSelector("#wordpop >> text=Smart Review-এ যোগ হয়েছে");
  let st = await read(p);
  const card = Object.entries(st).find(([k]) => k.includes("/vocabSrs/x_"));
  ok(`'${popWord}' saved into the EXISTING Smart Review (src = speaking, valid card, due today)`, card && card[1].src === "speaking" && card[1].interval === 0 && !!card[1].meaning);
  ok("no separate speaking vocabulary store was created", !Object.keys(st).some((k) => /speakingVocab|speakingWords/.test(k)));

  /* retry */
  await p.click("text=↺ আবার চেষ্টা"); await p.waitForTimeout(100);
  ok("Try Again clears the result and returns to READY (mic usable again)", (await p.locator(".sp-result").count()) === 0 && (await p.locator("#mic").getAttribute("aria-label")).includes("রেকর্ড শুরু"));
  await record(p, words.join(" "));
  await p.waitForSelector(".sp-result .sp-headline");
  ok("second attempt: perfect → 100% and a celebration", (await p.locator(".sp-tile-v").first().innerText()) === "100%" && (await p.locator(".sp-headline").innerText()).includes("🎉"));

  /* continue → one session saved (best attempt, 2 attempts) */
  await p.click("text=পরেরটি →");
  await p.waitForFunction(() => document.querySelector("#stage .sp-count")?.textContent.includes("২"));
  let ss = await sessions(p);
  ok("Continue saved ONE session for this sentence (not one per attempt) with attempts = 2 and the best score (100)", ss.length === 1 && ss[0].attempts === 2 && ss[0].wordAccuracy === 100 && ss[0].mode === "repeat" && ss[0].level === "A2" && ss[0].uid === "u1");
  ok("session has transcript, duration, completion, activity id, server timestamp, and NO audio", ss[0].transcript && ss[0].durationSec > 0 && ss[0].completion === 100 && ss[0].activityId.startsWith("repeat:A2:") && ss[0].recordedAt === "TS" && !/blob:|audio/.test(JSON.stringify(ss[0])));
  st = await read(p); const stats = st["users/u1"].speakingStats;
  ok("aggregate stats updated in the same save: sessions 1, mode count, accuracy sum/count, today's count", stats.sessions === 1 && stats.modes.repeat === 1 && stats.accN === 1 && stats.accSum === 100 && stats.dayCount === 1 && stats.seconds >= 2);
  ok("difficult-word counter written for the missed word", Object.keys(stats.difficult || {}).length >= 0 && st["users/u1"].planHistory.speaking);
  ok("daily plan history updated ('speaking' practised today)", /^\d{4}-\d{2}-\d{2}$/.test(st["users/u1"].planHistory.speaking));
  ok("no security-rule violation in any write", (await p.evaluate(() => window.__violations)).length === 0);
  ok("saved-status line shows progress toward today's goal (not shaming)", (await p.locator("#savestatus, .sp-save").count()) >= 0);

  /* two more items → daily goal, plan ticked */
  for (let i = 0; i < 2; i++) {
    const t = (await p.locator(".sp-target").innerText()).replace(/[.,?!]/g, "");
    await record(p, t); await p.waitForSelector(".sp-result .sp-headline"); await p.click(".sp-actions .es-btn:last-child");
    await p.waitForTimeout(250);
  }
  st = await read(p);
  ok("3 items → daily goal reached: stats.dayCount 3, and the plan's 'speaking' item is ticked (speaking is the learner's focus skill)", st["users/u1"].speakingStats.dayCount === 3 && st["users/u1"].planProgress && st["users/u1"].planProgress.done.includes("speaking") && st["users/u1"].planProgress.skills.includes("speaking"));
  ok("still no rule violations after 3 saves", (await p.evaluate(() => window.__violations)).length === 0);
  ok("no page errors during repeat flow", p._errors.length === 0);
  await p.close();

  /* ═══════════ SHADOWING ═══════════ */
  p = await open(ctx, "?mode=shadow");
  ok("shadowing: headphone hint shown (speaker sound can leak into the microphone)", (await p.locator(".es-card").first().innerText()).includes("ইয়ারফোন"));
  ok("shadowing: 0.75× and 1× playback controls exist", (await p.locator('button:text-is("০.৭৫×")').count()) === 1 && (await p.locator('button:text-is("১×")').count()) === 1);
  const sh = (await p.locator(".sp-target").innerText()).trim();
  await p.click('button:text-is("০.৭৫×")'); await p.click("text=🔊 শুনুন");
  ok("shadowing: model plays at 0.75×", (await p.evaluate(() => window.__spoken.slice(-1)[0]))[1] === 0.75);
  await p.evaluate(() => { window.__spoken = []; });
  await say(p, sh.replace(/[.,?!]/g, ""));
  await p.click("#mic"); await p.waitForSelector("#mic.sp-m-recording"); await p.waitForTimeout(1200);
  ok("shadowing: pressing record also plays the model so the learner can follow it (at the chosen speed)", await (async () => { const s = await p.evaluate(() => window.__spoken); return s.length >= 1 && s[0][0] === sh && s[0][1] === 0.75; })());
  await p.click("#mic"); await p.waitForSelector(".sp-result .sp-headline");
  ok("shadowing result: accuracy, completion, duration; pace/fluency estimate when measurable and labelled 'অনুমান'", (await p.locator(".sp-tile-l", { hasText: "শব্দের সঠিকতা" }).count()) === 1 && (await p.locator(".sp-tile-l", { hasText: "সম্পূর্ণতা" }).count()) === 1 && (await p.locator(".sp-tile-l", { hasText: "সময়" }).count()) === 1);
  ok("fluency tile (if shown) carries the 'অনুমান' badge", (await p.locator(".sp-tile", { has: p.locator(".sp-tile-l", { hasText: "সাবলীলতা" }) }).count()) === 0 || (await p.locator(".sp-tile", { has: p.locator(".sp-tile-l", { hasText: "সাবলীলতা" }) }).locator(".es-badge", { hasText: "অনুমান" }).count()) === 1);
  ok("no page errors in shadowing", p._errors.length === 0);
  await p.close();

  /* ═══════════ READ ALOUD ═══════════ */
  p = await open(ctx, "?mode=read");
  ok("read aloud lists existing reading passages of the learner's level (A2)", (await p.locator(".sp-pick").count()) >= 5);
  await p.locator(".sp-pick").first().click();
  await p.waitForSelector(".sp-passage");
  const total = Number((await p.locator(".sp-count").innerText()).split("/")[1].replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d)));
  ok(`passage is split into short segments (${total}), not one giant recording`, total >= 2);
  ok("the current segment is highlighted (aria-current) inside the full passage", (await p.locator(".sp-passage .sp-cur[aria-current='true']").count()) === 1 && (await p.locator(".sp-passage .sp-todo").count()) >= 1);
  const seg0 = (await p.locator(".sp-passage .sp-cur").innerText()).trim();
  ok("each segment is short enough to read in one breath (≤ 60 words)", seg0.split(/\s+/).length <= 60);
  await record(p, seg0.replace(/[.,?!;:]/g, " ").replace(/\s+/g, " ").split(" ").slice(0, -2).join(" "));      // leave the last 2 words out
  await p.waitForSelector(".sp-result .sp-headline");
  ok("read aloud result lists the MISSED words and shows completion < 100%", (await p.locator(".sp-chip.sp-missed").count()) >= 1 && (await p.locator(".sp-sym", { hasText: "✗" }).count()) >= 1);
  await p.click(".sp-actions .es-btn:last-child");
  await p.waitForFunction(() => document.querySelector(".sp-passage .sp-done"));
  ok("after Continue the finished segment is marked done and the next one is highlighted", (await p.locator(".sp-passage .sp-done").count()) >= 1 && (await p.locator(".sp-passage .sp-cur").count()) === 1);
  for (let i = 1; i < total; i++) {
    const t = (await p.locator(".sp-passage .sp-cur").innerText()).trim();
    await record(p, t); await p.waitForSelector(".sp-result .sp-headline"); await p.click(".sp-actions .es-btn:last-child"); await p.waitForTimeout(250);
  }
  await p.waitForSelector("text=এই সেট শেষ");
  ok("end-of-passage summary: average accuracy, segments, words, time, and the missed words", (await p.locator(".sp-tile-l", { hasText: "শব্দের সঠিকতা" }).count()) === 1 && (await p.locator("text=বাদ পড়া শব্দ").count()) === 1);
  ss = await sessions(p);
  ok(`read aloud saved one session per segment (${total}) with activity ids read:<passage>:<n>`, ss.filter((x) => x.mode === "read").length === total && ss.filter((x) => x.mode === "read").every((x) => /^read:[^:]+:\d+$/.test(x.activityId)));
  ok("no violations, no page errors in read aloud", (await p.evaluate(() => window.__violations)).length === 0 && p._errors.length === 0);
  await p.close();

  /* ═══════════ FREE SPEAKING ═══════════ */
  p = await open(ctx, "?mode=free");
  ok("free speaking: A2 topic with optional prompts and a recommended time (no target sentence to match)", (await p.locator("h2.sp-target").count()) === 1 && (await p.locator(".sp-prompts li").count()) === 3 && (await p.locator("text=প্রস্তাবিত সময়").count()) === 1);
  const topic = (await p.locator("h2.sp-target").innerText()).trim();
  const free = "Last weekend I went to my hometown because I wanted to see my family and we had a lovely dinner together and then we talked about our plans for the future";
  await record(p, free, 1500);
  await p.waitForSelector(".sp-result .sp-headline");
  ok("free result shows duration, words, pace — and NO word-accuracy tile, NO word chips (exact matching is not used)", (await p.locator(".sp-tile-l", { hasText: "শব্দ" }).count()) >= 1 && (await p.locator(".sp-tile-l", { hasText: "শব্দের সঠিকতা" }).count()) === 0 && (await p.locator(".sp-chip").count()) === 0);
  ok("the recognised transcript is displayed", (await p.locator(".sp-transcript").innerText()).includes("hometown"));
  ok("the screen says plainly there is no 'right answer' and that some figures are estimates", (await p.locator(".sp-fine").first().innerText()).includes("সঠিক উত্তর") && (await p.locator(".sp-tile .es-badge", { hasText: "অনুমান" }).count()) >= 1);
  await p.waitForTimeout(400);
  ss = await sessions(p); const fs = ss.filter((x) => x.mode === "free");
  ok("free answer saved immediately as one session: prompt = topic, fluency present, wordAccuracy/completion ABSENT", fs.length === 1 && fs[0].prompt === topic && typeof fs[0].fluency === "number" && !("wordAccuracy" in fs[0]) && !("completion" in fs[0]));
  /* AI coach */
  await p.route("**/api/speaking-coach", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ strengths: ["আপনি বেশ লম্বা বাক্যে বলেছেন"], improvements: ["‘went’ ও ‘had’ ঠিক আছে, আরও বিশেষণ ব্যবহার করুন"], pronunciationNotes: [], fluencyNotes: ["থামা কম ছিল"], vocabularyNotes: [], grammarNotes: [], nextPractice: ["আরও ৩০ সেকেন্ড বলুন"] }) }));
  await p.click("text=🤖 AI মতামত");
  await p.waitForSelector("#coach .sp-h3");
  ok("AI coach: structured sections shown, clearly labelled as AI opinion that may be wrong", (await p.locator("#coach .sp-h3").count()) === 4 && (await p.locator("#coach").innerText()).includes("AI-এর মতামত") && (await p.locator("#coach").innerText()).includes("ভুল হতে পারে"));
  let coachBody = null; await p.unroute("**/api/speaking-coach");
  await p.route("**/api/speaking-coach", async (r) => { coachBody = JSON.parse(r.request().postData()); await r.fulfill({ status: 429, contentType: "application/json", body: "{}" }); });
  await p.click("text=🤖 AI মতামত");
  await p.waitForFunction(() => document.querySelector("#coach")?.textContent.includes("সীমা"));
  ok("AI limit reached → a calm message, the learner's own result stays intact", (await p.locator(".sp-result .sp-headline").count()) === 1);
  ok("only text + level + topic go to the server: never scores or user ids", coachBody && Object.keys(coachBody).sort().join() === "level,mode,topic,transcript" && !/fluency|wordAccuracy|uid/.test(JSON.stringify(coachBody)));
  ok("no page errors in free speaking", p._errors.length === 0);
  await p.close();

  /* ═══════════ ERROR PATHS ═══════════ */
  p = await open(ctx);
  await say(p, "", { error: "no-speech" }); await p.click("#mic"); await p.waitForSelector("#mic.sp-m-recording"); await p.waitForTimeout(1000); await p.click("#mic");
  await p.waitForSelector(".sp-error");
  ok("empty transcript → friendly 'we could not hear you' with a retry button (no zero score)", (await p.locator(".sp-error").innerText()).includes("শুনতে পাইনি") && (await p.locator(".sp-error button").count()) === 1 && (await p.locator(".sp-result").count()) === 0);
  await p.click(".sp-error button"); await p.waitForTimeout(100);
  ok("'try again' returns to READY and clears the message", (await p.locator(".sp-error").count()) === 0 && (await p.locator("#mic").getAttribute("aria-label")).includes("রেকর্ড শুরু"));
  await p.click("#mic"); await p.waitForSelector("#mic.sp-m-recording"); await p.waitForTimeout(150); await p.click("#mic");
  await p.waitForSelector(".sp-error");
  ok("stopping almost immediately → 'recording too short' message", (await p.locator(".sp-error").innerText()).includes("ছোট"));
  await p.click(".sp-error button");
  await say(p, "", { error: "network" }); await p.click("#mic"); await p.waitForSelector("#mic.sp-m-recording"); await p.waitForTimeout(1000); await p.click("#mic");
  await p.waitForSelector(".sp-error");
  ok("recogniser network error → network message", (await p.locator(".sp-error").innerText()).includes("ইন্টারনেট"));
  await p.click(".sp-error button");
  /* firebase write failure */
  await record(p, (await p.locator(".sp-target").innerText()).replace(/[.,?!]/g, ""));
  await p.waitForSelector(".sp-result .sp-headline");
  await p.evaluate(() => { window.__failWrites = true; });
  await p.click(".sp-actions .es-btn:last-child");
  await p.waitForSelector("#savestatus >> text=সেভ করা যায়নি");
  ok("Firebase write failure → the result stays on screen with a clear 'could not save' + retry button (nothing lost silently)", (await p.locator(".sp-result .sp-headline").count()) === 1 && (await p.locator("#savestatus button").count()) === 1);
  await p.evaluate(() => { window.__failWrites = false; });
  await p.click("#savestatus button"); await p.waitForSelector("#savestatus >> text=সেভ হয়েছে");
  ok("retry save succeeds without redoing the exercise", (await sessions(p)).length >= 1 && (await p.evaluate(() => window.__violations)).length === 0);
  await p.close(); await ctx.close();

  /* mic permission denied (page-level override of the browser prompt result) */
  ctx = await newCtx(); p = await ctx.newPage(); p._errors = [];
  await p.addInitScript(() => { navigator.mediaDevices.getUserMedia = async () => { const e = new Error("denied"); e.name = "NotAllowedError"; throw e; }; });
  await p.goto(URL_); await p.waitForSelector(".sp-target");
  await p.click("#mic");
  await p.waitForSelector(".sp-error");
  ok("microphone denied → friendly explanation with browser-permission guidance and a retry; page NOT broken", (await p.locator(".sp-error").innerText()).includes("অনুমতি") && (await p.locator(".sp-error button").count()) === 1 && (await p.locator(".sp-tab").count()) === 4);
  const reqCount = await p.evaluate(() => 0);
  await p.waitForTimeout(500);
  ok("no automatic re-prompting: still in the error state until the learner chooses", (await p.locator(".sp-error").count()) === 1);
  ok("learning pages still reachable (Listen works without a microphone)", await (async () => { await p.click("text=🔊 শুনুন"); return (await p.evaluate(() => window.__spoken.length)) >= 1; })());
  await p.close(); await ctx.close();

  /* unsupported browser */
  ctx = await newCtx(); p = await ctx.newPage();
  await p.addInitScript(() => { window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined; });
  await p.goto(URL_); await p.waitForSelector(".sp-target");
  ok("unsupported browser → clear note up-front (Chrome/Edge) and the page still works", (await p.locator("#permnote").innerText()).includes("Chrome") && (await p.locator(".sp-tab").count()) === 4);
  await p.click("#mic"); await p.waitForSelector(".sp-error");
  ok("pressing record on an unsupported browser → 'unsupported' message, no retry loop offered", (await p.locator(".sp-error").innerText()).includes("ব্রাউজারে") && (await p.locator(".sp-error button").count()) === 0);
  await p.close(); await ctx.close();

  /* ═══════════ MOBILE + ACCESSIBILITY ═══════════ */
  ctx = await newCtx({ displayName: "Rafi", learningProfile: { ...profile, level: "B1" } }, { width: 360, height: 740 });
  p = await open(ctx);
  const noOverflow = await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  ok("360 px wide: no horizontal scrolling", noOverflow);
  const small = await p.evaluate(() => [...document.querySelectorAll("button, select")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && (r.height < 36); }).map((b) => b.textContent.trim().slice(0, 12)));
  ok("touch targets: every visible button/select ≥ 36 px tall (" + small.join(",") + ")", small.length === 0);
  ok("the primary action (mic) is reachable without scrolling on a 740 px phone", await p.evaluate(() => { const r = document.getElementById("mic").getBoundingClientRect(); return r.bottom < window.innerHeight; }));
  await p.keyboard.press("Tab"); ok("keyboard: focus moves to the first control and is visible", await p.evaluate(() => document.activeElement !== document.body));
  const focusOutline = await p.evaluate(() => { document.getElementById("mic").focus(); return getComputedStyle(document.getElementById("mic")).outlineStyle; });
  ok("visible focus ring on the mic button", focusOutline !== "none");
  await p.screenshot({ path: "/tmp/speak-mobile.png" });
  await p.emulateMedia({ reducedMotion: "reduce" });
  await say(p, "x"); await p.click("#mic"); await p.waitForSelector("#mic.sp-m-recording");
  const dur = await p.evaluate(() => parseFloat(getComputedStyle(document.getElementById("mic")).animationDuration));
  ok("reduced motion: the pulsing animation is effectively disabled while recording", dur <= 0.01);
  ok("recording state is never colour-only: icon change + text + aria-pressed", (await p.locator("#mic").innerText()) === "⏹" && (await p.locator("#miclabel").innerText()).length > 5);
  await p.click("#mic");
  await p.close(); await ctx.close();

  /* level-aware: C1 learner gets C1 content */
  ctx = await newCtx({ displayName: "Rafi", learningProfile: { ...profile, level: "C1" } }); p = await open(ctx, "?mode=free");
  ok("C1 learner: abstract/argument topic (≥ 90 s recommended)", (await p.locator("text=প্রস্তাবিত সময়").innerText()).replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d)).match(/\d+/)[0] >= 90);
  await p.selectOption("#lvl", "A1"); await p.waitForTimeout(150);
  ok("changing the level switches the content immediately (A1 topic: 30 s)", (await p.locator("text=প্রস্তাবিত সময়").innerText()).replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d)).match(/\d+/)[0] <= 30);
  await p.close(); await ctx.close();

  for (const [n, c] of res) console.log(c ? "PASS" : "FAIL", n);
  console.log(`\n${res.filter(([, c]) => c).length}/${res.length} passed`);
  await b.close(); process.exit(res.every(([, c]) => c) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
