/* ═══════════════════════════════════════════════════════════
   Speaking practice page controller (Phase 10).
   Four modes on one engine:  repeat · shadow · read · free
   ═══════════════════════════════════════════════════════════ */
import { requireAuth, toast } from "../js/firebase-config.js";
import { SpeakingEngine } from "./engine.js";
import { BrowserSpeechProvider, detectSupport } from "./provider.js";
import { S } from "./state.js";
import { explain, micPermission } from "./mic.js";
import { repeatSet, shadowSet, freeTopics, pick, segmentPassage, LEVELS, levelOf } from "./content.js";
import { saveActivity } from "./save.js";
import { askCoach, COACH_SECTIONS } from "./coach.js";
import { dayMessage } from "./persistence.js";
import { saveWord } from "../learning/word-save.js";
import { lookup, normalizeWord } from "../learning/word-bank.js";
import { isoDay } from "../learning/srs.js";
import { bn, el, btn, fmtTime, renderWordChips, targetTiles, freeTiles, listLine } from "./ui-parts.js";

const $ = (id) => document.getElementById(id);
const MODE_LABEL = { repeat: "🔁 Repeat", shadow: "👥 Shadowing", read: "📖 Read Aloud", free: "💬 Free Speaking" };
const MAX_MS = { repeat: 15000, shadow: 20000, read: 45000 };
const params = new URLSearchParams(location.search);

const app = {
  mode: "repeat", level: "A1", items: [], idx: 0, uid: null, userDoc: {}, catalog: null, dict: null,
  activity: null, passage: null, segResults: [], timer: null, ttsRate: 1, shown: false, singleWord: null,
};

/* ───────────── speech synthesis (listen) ───────────── */
const canSpeak = detectSupport(window).speechSynthesis;
function speak(text, rate = 1) {
  if (!canSpeak) { toast("এই ব্রাউজারে শোনানোর সুবিধা নেই।", "error"); return; }
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = rate; speechSynthesis.speak(u); } catch (_) {}
}

/* ───────────── engine ───────────── */
const engine = new SpeakingEngine({ provider: new BrowserSpeechProvider(), win: window, level: "A1" });
const say = (msg) => { $("sr").textContent = msg; };   // screen-reader announcements

engine.on("state", (st) => { paintMic(st); });
engine.on("interim", (t) => { const e = $("live"); if (e) e.textContent = t; });
engine.on("result", (a) => onResult(a));

const difficultCounts = () => ((app.userDoc.speakingStats || {}).difficult) || {};

/* ───────────── start-up ───────────── */
async function init(user, d) {
  app.uid = user.uid; app.userDoc = d || {};
  const lp = (d || {}).learningProfile; app.level = levelOf(lp && lp.level);
  engine.level = app.level;
  const sel = $("lvl"); sel.textContent = "";
  LEVELS.forEach((l) => { const o = el("option", null, l); o.value = l; if (l === app.level) o.selected = true; sel.appendChild(o); });
  sel.onchange = async () => { await flush(); app.level = sel.value; engine.level = app.level; loadMode(); };

  const tabs = $("tabs"); tabs.textContent = "";
  Object.entries(MODE_LABEL).forEach(([m, label]) => {
    const t = el("button", "sp-tab", label); t.type = "button"; t.setAttribute("role", "tab"); t.dataset.mode = m;
    t.onclick = async () => { await flush(); app.mode = m; app.singleWord = null; loadMode(); };
    tabs.appendChild(t);
  });
  try { const r = await fetch("data/plan-catalog.json", { cache: "force-cache" }); if (r.ok) app.catalog = await r.json(); } catch (_) {}
  try { const r = await fetch("data/dictionary.json", { cache: "force-cache" }); app.dict = r.ok ? (await r.json()).words : {}; } catch (_) { app.dict = {}; }

  const m = params.get("mode"); if (["repeat", "shadow", "read", "free"].includes(m)) app.mode = m;
  const w = normalizeWord(params.get("word") || ""); if (/^[a-z]{2,20}$/.test(w)) { app.mode = "repeat"; app.singleWord = w; }
  showPermissionNote();
  await loadMode();
}

async function showPermissionNote() {
  const note = $("permnote"); note.textContent = "";
  const support = detectSupport(window);
  if (!support.recognition) {
    note.append(el("b", null, "এই ব্রাউজারে কথা শনাক্ত করা যায় না। "), document.createTextNode("Chrome বা Edge ব্যবহার করুন। আপনি এখনও শব্দ শুনে অনুশীলন করতে পারেন।")); note.hidden = false; return;
  }
  const perm = await micPermission(window);
  if (perm === "granted") { note.hidden = true; return; }
  note.append(el("b", null, "🎤 আপনার মাইক্রোফোন দরকার। "), document.createTextNode("আপনার অনুশীলন শোনার জন্য মাইক্রোফোন লাগবে। রেকর্ড বাটনে চাপলে ব্রাউজার অনুমতি চাইবে। আপনার কণ্ঠস্বর সংরক্ষণ বা আপলোড করা হয় না, শুধু ফলাফল সেভ হয়।"));
  note.hidden = false;
}

/* ───────────── loading a mode ───────────── */
async function loadMode() {
  app.idx = 0; app.activity = null; app.passage = null; app.segResults = [];
  document.querySelectorAll(".sp-tab").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.mode === app.mode)));
  $("result").textContent = ""; $("wordpop").hidden = true; $("err").textContent = "";
  if (app.mode === "read") return showPassages();
  if (app.singleWord) app.items = [{ id: "word:" + app.singleWord, text: app.singleWord }];
  else if (app.mode === "free") app.items = freeTopics(app.level).map((t) => ({ id: "free:" + t.id, topic: t }));
  else {
    const list = app.mode === "repeat" ? repeatSet(app.level) : shadowSet(app.level);
    const start = list.indexOf(pick(list, isoDay() + app.mode + app.level));
    app.items = list.map((text, i) => ({ id: `${app.mode}:${app.level}:${i}`, text })); app.items = [...app.items.slice(start), ...app.items.slice(0, start)];
  }
  renderStage();
}

async function showPassages() {
  const stage = $("stage"); stage.textContent = "লোড হচ্ছে…";
  let data; try { data = await import("../js/reading-data.js"); } catch (e) { stage.textContent = ""; $("err").textContent = "পাঠ লোড করা যায়নি। Internet পরীক্ষা করে আবার চেষ্টা করুন।"; return; }
  const lvl = app.level === "C2" ? "C1" : app.level;
  const list = data.PASSAGES.filter((p) => p.level === lvl);
  stage.textContent = "";
  const card = el("div", "es-card sp-card");
  card.append(el("h2", "sp-h", "কোন পাঠটি জোরে পড়বেন?"), el("p", "sp-sub", `${app.level} স্তরের পাঠ। পাঠটি ছোট ছোট অংশে ভাগ করা, প্রতিটি আলাদাভাবে পড়বেন।`));
  const wanted = params.get("passage");
  list.forEach((p) => {
    const b = btn("", () => startPassage(p), "sp-pick");
    b.append(el("b", null, p.title), el("span", "sp-sub", ` · ${bn(p.text.join(" ").split(/\s+/).length)} শব্দ`));
    card.appendChild(b);
  });
  stage.appendChild(card);
  if (wanted) { const hit = data.PASSAGES.find((p) => p.id === wanted); if (hit) startPassage(hit); }
}

function startPassage(p) {
  app.passage = p; app.segResults = [];
  const segs = segmentPassage(p.text, 30);
  app.items = segs.map((s) => ({ id: `read:${p.id}:${s.id}`, text: s.text, seg: s.id, total: segs.length }));
  app.idx = 0; renderStage();
}

/* ───────────── the practice card ───────────── */
function renderStage() {
  const it = app.items[app.idx]; const stage = $("stage"); stage.textContent = "";
  $("result").textContent = ""; $("wordpop").hidden = true; $("err").textContent = ""; stopTimer();
  if (!it) return finishSet();
  app.activity = { id: it.id, prompt: it.topic ? it.topic.title : it.text, attempts: 0, best: null, seconds: 0, mode: app.mode, recommendedSec: it.topic ? it.topic.sec : 60 };
  const card = el("div", "es-card sp-card");
  const head = el("div", "sp-head");
  head.append(el("span", "es-badge", `${MODE_LABEL[app.mode]} · ${app.level}`));
  if (app.mode !== "free" && !app.singleWord) head.append(el("span", "sp-count", `${bn(app.idx + 1)} / ${bn(app.items.length)}`));
  card.appendChild(head);
  card.appendChild(el("p", "sp-tag", "Practice, don’t perform. অনুশীলন করছেন, পরীক্ষা দিচ্ছেন না।"));

  if (app.mode === "free") {
    const t = it.topic;
    card.appendChild(Object.assign(el("h2", "sp-target", t.title), { lang: "en" }));
    card.appendChild(el("p", "sp-sub", `⏱ প্রস্তাবিত সময়: প্রায় ${bn(t.sec)} সেকেন্ড (এর কম বা বেশিও চলবে)`));
    const ul = el("ul", "sp-prompts"); ul.setAttribute("aria-label", "ঐচ্ছিক সহায়ক প্রশ্ন"); t.prompts.forEach((q) => ul.appendChild(Object.assign(el("li", null, q), { lang: "en" }))); card.appendChild(ul);
    card.appendChild(btn("↻ অন্য বিষয়", () => { app.idx = (app.idx + 1) % app.items.length; renderStage(); }, "es-btn es-btn--ghost es-btn--sm"));
  } else {
    if (app.mode === "read" && app.passage) card.appendChild(passageView(it.seg));
    else card.appendChild(Object.assign(el("p", "sp-target", it.text), { lang: "en" }));
    const row = el("div", "sp-row");
    if (canSpeak) {
      row.appendChild(btn("🔊 শুনুন", () => speak(it.text, app.ttsRate)));
      if (app.mode === "repeat" || app.mode === "shadow") {
        const slow = btn("০.৭৫×", null, "es-btn es-btn--ghost es-btn--sm"); slow.setAttribute("aria-pressed", "false");
        const norm = btn("১×", null, "es-btn es-btn--ghost es-btn--sm"); norm.setAttribute("aria-pressed", "true");
        slow.onclick = () => { app.ttsRate = 0.75; slow.setAttribute("aria-pressed", "true"); norm.setAttribute("aria-pressed", "false"); speak(it.text, 0.75); };
        norm.onclick = () => { app.ttsRate = 1; norm.setAttribute("aria-pressed", "true"); slow.setAttribute("aria-pressed", "false"); speak(it.text, 1); };
        row.append(slow, norm);
      }
    } else row.appendChild(el("p", "sp-sub", "এই ব্রাউজারে শোনানোর সুবিধা নেই।"));
    card.appendChild(row);
    if (app.mode === "shadow") card.appendChild(el("p", "sp-sub", "💡 শ্যাডোইং: বক্তার সাথে সাথে বলুন। ইয়ারফোন ব্যবহার করুন, নইলে স্পিকারের শব্দ রেকর্ডে ঢুকে যেতে পারে।"));
  }

  const mic = el("div", "sp-mic");
  const b = el("button", "sp-micbtn"); b.type = "button"; b.id = "mic"; b.onclick = onMicClick;
  const lab = el("div", "sp-miclabel"); lab.id = "miclabel";
  const tm = el("div", "sp-timer"); tm.id = "timer"; tm.setAttribute("aria-hidden", "true");
  const live = el("p", "sp-live"); live.id = "live"; live.setAttribute("aria-hidden", "true");
  mic.append(b, lab, tm, live); card.appendChild(mic);
  stage.appendChild(card);
  paintMic(engine.state.name === S.IDLE || engine.state.name === S.RESULT ? { name: S.READY } : engine.state);
}

function passageView(segId) {
  const box = el("div", "sp-passage"); box.setAttribute("aria-label", "পাঠ: " + app.passage.title);
  const segs = segmentPassage(app.passage.text, 30);
  segs.forEach((s) => { const sp = el("span", s.id === segId ? "sp-cur" : s.id < segId ? "sp-done" : "sp-todo", s.text + " "); sp.lang = "en"; if (s.id === segId) sp.setAttribute("aria-current", "true"); box.appendChild(sp); });
  return box;
}

/* ───────────── mic button ───────────── */
function paintMic(st) {
  const b = $("mic"); if (!b) return;
  const lab = $("miclabel");
  const name = st.name;
  b.className = "sp-micbtn sp-m-" + name; b.disabled = false; b.removeAttribute("aria-pressed");
  if (name === S.RECORDING) { b.textContent = "⏹"; b.setAttribute("aria-label", "রেকর্ডিং থামান"); b.setAttribute("aria-pressed", "true"); lab.textContent = "শুনছি… বলা শেষ হলে থামান"; say("রেকর্ডিং চলছে"); }
  else if (name === S.PROCESSING) { b.textContent = "…"; b.disabled = true; b.setAttribute("aria-label", "বিশ্লেষণ চলছে"); lab.textContent = "বিশ্লেষণ চলছে…"; say("বিশ্লেষণ চলছে"); }
  else if (name === S.ERROR) { b.textContent = "🎤"; b.setAttribute("aria-label", "আবার চেষ্টা করুন"); lab.textContent = "আবার চেষ্টা করুন"; showError(st.error); }
  else { b.textContent = "🎤"; b.setAttribute("aria-label", "রেকর্ড শুরু করুন"); lab.textContent = app.mode === "free" ? "চাপুন ও বলুন" : "চাপুন ও বলুন"; }
}

function showError(code) {
  const x = explain(code); const box = $("err"); box.textContent = "";
  const card = el("div", "sp-error"); card.setAttribute("role", "alert");
  card.append(el("b", null, x.title), el("p", null, x.body));
  if (x.retry) card.appendChild(btn("আবার চেষ্টা করুন", () => { engine.retry(); box.textContent = ""; }, "es-btn es-btn--sm"));
  box.appendChild(card); say(x.title);
}

async function onMicClick() {
  $("err").textContent = "";
  if (engine.state.name === S.RECORDING) return stopRecording();
  if (engine.state.name === S.ERROR) engine.retry();
  const it = app.items[app.idx]; if (!it) return;
  $("result").textContent = ""; $("wordpop").hidden = true;
  const free = app.mode === "free";
  const r = await engine.start({ mode: app.mode, target: free ? "" : it.text, recommendedSec: it.topic ? it.topic.sec : 60, difficultCounts: difficultCounts() });
  if (!r.ok) return;                       // the error state paints itself
  if (app.mode === "shadow") setTimeout(() => speak(it.text, app.ttsRate), 500);   // model speaks while the learner follows
  startTimer(free ? Math.min(180000, (it.topic.sec * 2) * 1000) : MAX_MS[app.mode]);
}

function startTimer(maxMs) {
  stopTimer(); const t0 = performance.now(); const tm = $("timer");
  app.timer = setInterval(() => { const ms = performance.now() - t0; if (tm) tm.textContent = fmtTime(ms); if (ms >= maxMs) stopRecording(); }, 250);
}
function stopTimer() { if (app.timer) clearInterval(app.timer); app.timer = null; const tm = $("timer"); if (tm) tm.textContent = ""; }
async function stopRecording() { stopTimer(); try { speechSynthesis.cancel(); } catch (_) {} await engine.stop(); }

/* ───────────── result ───────────── */
function onResult(a) {
  const act = app.activity; act.attempts++; act.seconds += a.durationSec;
  const score = (x) => (x.mode === "free" ? (x.fluency ?? 0) : x.wordAccuracy);
  if (!act.best || score(a) >= score(act.best)) act.best = a;
  const box = $("result"); box.textContent = "";
  const card = el("div", "es-card sp-card sp-result");
  const h = el("h2", "sp-headline sp-" + a.feedback.tone, a.feedback.headline); h.tabIndex = -1; card.appendChild(h);

  if (a.mode === "free") {
    card.appendChild(freeTiles(a));
    const tr = el("div", "sp-transcript"); tr.append(el("b", null, "আপনি যা বলেছেন (শনাক্ত করা লেখা): "), Object.assign(el("span", null, a.transcript), { lang: "en" })); card.appendChild(tr);
    card.appendChild(el("p", "sp-fine", "ℹ️ এখানে কোনো “সঠিক উত্তর” নেই। সংখ্যাগুলো সময়, শব্দসংখ্যা ও গতি থেকে হিসাব করা; “অনুমান” চিহ্নিতগুলো আনুমানিক।"));
  } else {
    card.appendChild(targetTiles(a));
    card.appendChild(renderWordChips(a.states, openWord));
    card.appendChild(el("p", "sp-fine", "ℹ️ এটি শনাক্ত করা শব্দের মিল, ধ্বনি-স্তরের উচ্চারণ বিশ্লেষণ নয়। কখনো কখনো ঠিক বললেও শনাক্তকারী ভিন্ন শব্দ শুনতে পারে। চেপে শব্দ শুনুন।"));
    [listLine("বাড়তি শব্দ:", a.cmp.extra), listLine("দুবার বলা শব্দ:", a.cmp.repeated)].forEach((x) => x && card.appendChild(x));
  }
  a.feedback.lines.forEach((t) => card.appendChild(el("p", "sp-fb", t)));
  const nx = el("ul", "sp-next"); a.feedback.next.forEach((t) => nx.appendChild(el("li", null, "➡️ " + t))); card.appendChild(nx);
  if (a.warning) card.appendChild(el("p", "sp-fine", "⚠️ শনাক্তকরণে একটু সমস্যা হয়েছিল, ফলাফল কিছুটা অসম্পূর্ণ হতে পারে।"));

  if (a.difficult && a.difficult.length) {
    const dbox = el("div", "sp-diff"); dbox.appendChild(el("b", null, "বারবার সমস্যা হচ্ছে:"));
    a.difficult.forEach((d) => {
      const row = el("div", "sp-diffrow"); row.append(Object.assign(el("span", "sp-diffw", d.word), { lang: "en" }), el("span", "sp-sub", ` ${bn(d.count)} বার`));
      row.appendChild(btn("এই শব্দ অনুশীলন", async () => { await flush(); app.singleWord = d.word; app.mode = "repeat"; loadMode(); }, "es-btn es-btn--sm"));
      row.appendChild(btn("➕ Smart Review", () => openWord(d.word), "es-btn es-btn--sm es-btn--ghost"));
      dbox.appendChild(row);
    });
    card.appendChild(dbox);
  }

  const act2 = el("div", "sp-actions");
  act2.appendChild(btn("↺ আবার চেষ্টা", () => { engine.retry(); box.textContent = ""; $("wordpop").hidden = true; }, "es-btn"));
  if (a.mode !== "free" && canSpeak) act2.appendChild(btn("🔊 আবার শুনুন", () => speak(app.items[app.idx].text, app.ttsRate)));
  if (a.audioUrl) { const au = el("audio"); au.controls = true; au.src = a.audioUrl; au.setAttribute("aria-label", "আপনার নিজের কণ্ঠ"); au.className = "sp-audio"; card.appendChild(el("p", "sp-sub", "🎧 নিজের কণ্ঠ শুনুন (শুধু আপনার ডিভাইসে, কোথাও পাঠানো হয় না):")); card.appendChild(au); }
  if (a.mode === "free") act2.appendChild(btn("🤖 AI মতামত (ঐচ্ছিক)", () => runCoach(a, card)));
  act2.appendChild(btn(app.idx + 1 >= app.items.length ? "শেষ করি →" : "পরেরটি →", continueNext, "es-btn es-btn--secondary"));
  card.appendChild(act2);
  const status = el("p", "sp-save"); status.id = "savestatus"; status.setAttribute("aria-live", "polite"); card.appendChild(status);
  box.appendChild(card); h.focus({ preventScroll: false }); say("ফলাফল প্রস্তুত");
  if (a.mode === "free") flush();          // every free answer is its own item: save right away
}

async function runCoach(a, card) {
  const holder = card.querySelector("#coach") || card.appendChild(Object.assign(el("div", "sp-coach"), { id: "coach" }));
  holder.textContent = "AI মতামত তৈরি হচ্ছে…";
  const r = await askCoach({ transcript: a.transcript, topic: app.activity.prompt, level: app.level });
  holder.textContent = "";
  if (!r.ok) { holder.appendChild(el("p", "sp-fine", { auth: "AI মতামতের জন্য আবার login করুন।", rate: "আজকের AI মতামতের সীমা শেষ। পরে আবার চেষ্টা করুন।", network: "ইন্টারনেট সংযোগ নেই। পরে চেষ্টা করুন।", failed: "AI মতামত এখন পাওয়া যাচ্ছে না। আপনার ফলাফল ঠিকই আছে।" }[r.error])); return; }
  holder.appendChild(el("p", "sp-fine", "🤖 নিচের লেখা AI-এর মতামত। এটি অনুমান-ভিত্তিক এবং ভুল হতে পারে; ওপরের সংখ্যাগুলো আলাদাভাবে হিসাব করা।"));
  COACH_SECTIONS.forEach(([k, title]) => { const items = r.data[k] || []; if (!items.length) return; holder.appendChild(el("h3", "sp-h3", title)); const ul = el("ul", "sp-list"); items.forEach((t) => ul.appendChild(el("li", null, t))); holder.appendChild(ul); });
}

/* ───────────── save (one document per practised item) ───────────── */
async function flush() {
  const act = app.activity; if (!act || !act.best || act.saving) return;
  act.saving = true; const st = $("savestatus");
  try {
    const r = await saveActivity({
      uid: app.uid, userDoc: app.userDoc, catalog: app.catalog, mode: act.mode, level: app.level, activityId: act.id, prompt: act.prompt,
      analysis: act.best, attempts: act.attempts, seconds: act.seconds,
    });
    app.userDoc = r.userDoc;
    if (act.mode === "read") app.segResults.push(act.best);
    act.best = null; act.attempts = 0; act.seconds = 0;          // next attempt on this card starts a new record
    if (st) st.textContent = "✅ সেভ হয়েছে। " + dayMessage({ dayCount: r.dayCount, reached: r.reached });
    if (r.reached) say("আজকের Speaking লক্ষ্য পূরণ হয়েছে");
  } catch (e) {
    console.warn("speaking save failed", e);
    if (st) { st.textContent = ""; st.append("⚠️ ফলাফল সেভ করা যায়নি। আপনার অনুশীলন ঠিকই হয়েছে। "); st.appendChild(btn("আবার সেভ করুন", () => { act.saving = false; flush(); }, "es-btn es-btn--sm")); }
    say("ফলাফল সেভ করা যায়নি");
  } finally { act.saving = false; }
}

async function continueNext() {
  await flush();
  if (app.activity && app.activity.best) return;            // save failed: stay so the learner can retry
  engine.next(); app.idx++; renderStage();
}

function finishSet() {
  const stage = $("stage"); stage.textContent = "";
  const card = el("div", "es-card sp-card");
  card.appendChild(el("h2", "sp-headline sp-positive", "🎉 চমৎকার! এই সেট শেষ"));
  if (app.mode === "read" && app.segResults.length) {
    const r = app.segResults; const acc = Math.round(r.reduce((s, x) => s + x.wordAccuracy, 0) / r.length);
    const words = r.reduce((s, x) => s + x.wordCount, 0), secs = r.reduce((s, x) => s + x.durationSec, 0);
    const missed = [...new Set(r.flatMap((x) => x.cmp.missed))].slice(0, 8);
    const g = el("div", "sp-tiles");
    [["শব্দের সঠিকতা", acc + "%"], ["অংশ", bn(r.length)], ["শব্দ", bn(words)], ["সময়", bn(Math.round(secs)) + "s"]].forEach(([l, v]) => { const t = el("div", "sp-tile"); t.append(el("div", "sp-tile-v", v), el("div", "sp-tile-l", l)); g.appendChild(t); });
    card.appendChild(g); const ml = listLine("বাদ পড়া শব্দ:", missed); if (ml) card.appendChild(ml);
  }
  card.appendChild(el("p", "sp-sub", "ইচ্ছে হলে আরও অনুশীলন করুন, বা আজকের মতো এখানেই শেষ করুন।"));
  const row = el("div", "sp-actions");
  row.append(btn("↺ আবার শুরু", () => loadMode(), "es-btn"), btn("Dashboard-এ ফিরি", () => { location.href = "dashboard.html"; }));
  card.appendChild(row); stage.appendChild(card); say("সেট শেষ");
}

/* ───────────── tap a word: hear it, see meaning, add to Smart Review ───────────── */
async function openWord(raw) {
  const w = normalizeWord(raw); if (!w || w.length < 2) return;
  const pop = $("wordpop"); pop.textContent = ""; pop.hidden = false;
  const hit = lookup(app.dict, w);
  const top = el("div", "sp-poptop");
  top.append(Object.assign(el("b", "sp-popw", hit ? hit.word : w), { lang: "en" }));
  if (hit && hit.phonetic) top.appendChild(el("span", "sp-ph", hit.phonetic));
  if (canSpeak) { top.appendChild(btn("🔊", () => speak(w, 1), "es-btn es-btn--sm es-btn--ghost")); top.appendChild(btn("🐢", () => speak(w, 0.5), "es-btn es-btn--sm es-btn--ghost")); }
  const close = btn("✕", () => { pop.hidden = true; }, "es-btn es-btn--sm es-btn--ghost"); close.setAttribute("aria-label", "বন্ধ করুন"); top.appendChild(close);
  pop.appendChild(top);
  const example = (app.items[app.idx] && app.items[app.idx].text) || "";
  const row = el("div", "sp-row");
  const doSave = async (b, meaning, level) => {
    b.disabled = true;
    try { const r = await saveWord({ word: hit ? hit.word : w, meaning, example, level: level || app.level, src: "speaking" }); b.textContent = r === "exists" ? "✓ আগে থেকেই আছে" : "✓ Smart Review-এ যোগ হয়েছে"; }
    catch (e) { b.disabled = false; toast(e.message === "meaning_required" ? "আগে শব্দটির অর্থ লিখুন।" : "সেভ করা যায়নি, আবার চেষ্টা করুন।", "error"); }
  };
  if (hit) {
    pop.appendChild(el("p", "sp-popm", hit.meaning));
    const add = btn("➕ Smart Review-এ যোগ করুন", () => doSave(add, hit.meaning, hit.level), "es-btn es-btn--sm"); row.appendChild(add);
  } else {
    pop.appendChild(el("p", "sp-sub", "এই শব্দের অর্থ আমাদের অভিধানে নেই। নিজে লিখে রাখতে পারেন:"));
    const inp = el("input", "es-input"); inp.placeholder = "বাংলা অর্থ"; inp.maxLength = 60; inp.setAttribute("aria-label", "বাংলা অর্থ");
    const add = btn("➕ যোগ করুন", () => doSave(add, inp.value), "es-btn es-btn--sm"); row.append(inp, add);
  }
  pop.appendChild(row);
}

/* ───────────── leave safely ───────────── */
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
window.addEventListener("pagehide", () => { flush(); engine.destroy(); });

requireAuth((user, d) => { init(user, d).catch((e) => { console.error(e); $("err").textContent = "পেজ লোড করা যায়নি। রিফ্রেশ করে দেখুন।"; }); });
