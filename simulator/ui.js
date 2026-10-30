/* ═══════════════════════════════════════════════════════════
   Real-life English simulator — page controller (DOM only; nothing from the learner or the AI is injected as HTML).
   picker → briefing → conversation (typed or spoken, Guided or AI partner) → report
   ═══════════════════════════════════════════════════════════ */
import { requireAuth, toast } from "../js/firebase-config.js";
import { SCENARIOS, byId, fitFor, ordered, LEVELS, levelIdx } from "./scenarios.js";
import { newConversation, addLearner, addPartner, guidedReply, objectiveStatus, isComplete, hintFor, historyForAi, buildReport, learnerTurns, MAX_LEARNER_TURNS, MAX_UTTERANCE } from "./engine.js";
import { askPartner } from "./client.js";
import { saveSimulation } from "./save.js";
import { SpeakingEngine } from "../speaking/engine.js";
import { BrowserSpeechProvider, detectSupport } from "../speaking/provider.js";
import { explain } from "../speaking/mic.js";
import { CATEGORIES } from "../writing/analyzer.js";
import { isoDay } from "../learning/srs.js";

const $ = (id) => document.getElementById(id);
const bn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const btn = (t, fn, cls = "es-btn es-btn--secondary") => { const b = el("button", cls, t); b.type = "button"; if (fn) b.onclick = fn; return b; };
const say = (m) => { $("sr").textContent = m; };
const canSpeak = detectSupport(window).speechSynthesis;
function speak(text, rate = 0.95) { if (!canSpeak) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; u.rate = rate; speechSynthesis.speak(u); } catch (_) {} }

const app = { uid: null, user: null, userDoc: {}, level: "A1", catalog: null, mode: "guided", sc: null, conv: null, spoken: 0, busy: false, saved: null, fellBack: false, report: null };
const engine = new SpeakingEngine({ provider: new BrowserSpeechProvider(), win: window, level: "A1" });

/* ───────────── start-up ───────────── */
async function init(user, d) {
  app.uid = user.uid; app.user = user; app.userDoc = d || {};
  const lp = (d || {}).learningProfile; app.level = LEVELS.includes(lp && lp.level) ? lp.level : "A1"; engine.level = app.level;
  app.mode = user.isAnonymous ? "guided" : "ai";
  const sel = $("lvl"); sel.textContent = "";
  LEVELS.forEach((l) => { const o = el("option", null, l); o.value = l; if (l === app.level) o.selected = true; sel.appendChild(o); });
  sel.onchange = () => { app.level = sel.value; engine.level = app.level; if (!app.conv) showPicker(); };
  try { const r = await fetch("data/plan-catalog.json", { cache: "force-cache" }); if (r.ok) app.catalog = await r.json(); } catch (_) {}
  const qs = new URLSearchParams(location.search);
  const qm = qs.get("mode"); if (qm === "guided" || (qm === "ai" && !user.isAnonymous)) app.mode = qm;   // deep links: simulator.html?scenario=airport&mode=guided
  const want = byId(qs.get("scenario"));
  if (want) { app.sc = want; return showBriefing(); }
  showPicker();
}
const view = (...n) => { const v = $("view"); v.textContent = ""; v.append(...n); window.scrollTo({ top: 0 }); };

/* ───────────── 1) picker ───────────── */
function showPicker() {
  app.sc = null; app.conv = null; app.report = null; app.saved = null; app.spoken = 0; app.fellBack = false;
  const card = el("div", "es-card card");
  card.append(el("h2", null, "কোন পরিস্থিতিতে অনুশীলন করবেন?"), el("p", "lead", "বাস্তব জীবনের মতো কথোপকথন। আপনি একটি লক্ষ্য নিয়ে শুরু করবেন এবং কথা বলে সেটি পূরণ করবেন। Practice, don’t perform: ভুল করা শেখারই অংশ।"));
  const modes = el("div", "modes"); modes.setAttribute("role", "group"); modes.setAttribute("aria-label", "সঙ্গীর ধরন");
  const mk = (id, t, s) => { const b = el("button", "mode"); b.type = "button"; b.setAttribute("aria-pressed", String(app.mode === id)); b.append(document.createTextNode(t), el("small", null, s));
    b.onclick = () => { if (id === "ai" && app.user.isAnonymous) { toast("AI সঙ্গীর জন্য account লাগে। আপাতত গাইডেড মোড চলবে।", "info"); return; } app.mode = id; showPicker(); }; return b; };
  modes.append(mk("ai", "🤖 AI সঙ্গী", "প্রতিবার নতুন উত্তর (লেখা সার্ভারে যায়)"), mk("guided", "📜 গাইডেড", "AI ছাড়া, অফলাইনেও চলে"));
  card.appendChild(modes);
  if (app.mode === "ai") card.appendChild(el("p", "sub", "ℹ️ AI মোডে শুধু আপনার লেখা বাক্য সার্ভারে যায়, কণ্ঠস্বর কখনো নয়। সীমা শেষ বা সংযোগ না থাকলে নিজে থেকে গাইডেড মোডে চলে যাবে।"));
  const grid = el("div", "grid");
  ordered(app.level).forEach((s) => {
    const fit = fitFor(s, app.level);
    const b = el("button", "sc"); b.type = "button";
    const info = el("span"); info.append(el("b", null, s.title), el("span", "sub", s.titleBn));
    b.append(el("span", "ic", s.icon), info, el("span", "es-badge bd" + (fit === "fit" ? " es-badge--success" : ""), fit === "fit" ? "আপনার স্তরে ✓" : fit === "easier" ? "সহজ" : "একটু কঠিন"));
    b.onclick = () => { app.sc = s; showBriefing(); }; grid.appendChild(b);
  });
  card.appendChild(grid); view(card);
}

/* ───────────── 2) briefing ───────────── */
function showBriefing() {
  const s = app.sc; const card = el("div", "es-card card");
  card.append(el("h2", null, `${s.icon} ${s.title} · ${s.titleBn}`), el("p", "lead", s.settingBn));
  const fit = fitFor(s, app.level);
  if (fit === "harder") card.appendChild(el("div", "notice", "এই দৃশ্যটি আপনার স্তরের চেয়ে একটু কঠিন। সমস্যা নেই, “💡 সাহায্য” বাটন ব্যবহার করুন।"));
  card.appendChild(el("h2", null, "🎯 আপনার লক্ষ্য"));
  const ul = el("ul", "goals"); s.objectives.forEach((o) => { const li = el("li"); li.append(el("span", "mk", "✓"), el("span", null, o.bn)); ul.appendChild(li); }); card.appendChild(ul);
  card.appendChild(el("h2", null, "💬 কাজে লাগবে এমন বাক্য"));
  const ph = el("div", "phr"); s.phrases.forEach((p) => { const b = btn(p, () => speak(p.replace(/…/g, "")), ""); ph.appendChild(b); }); card.appendChild(ph);
  card.appendChild(el("p", "sub", `আপনি: ${s.learner} · সঙ্গী: ${s.partner} · সঙ্গী: ${app.mode === "ai" ? "🤖 AI" : "📜 গাইডেড"} · সর্বোচ্চ ${bn(MAX_LEARNER_TURNS)}টি উত্তর`));
  const act = el("div", "actions"); act.append(btn("শুরু করি →", startConversation, "es-btn"), btn("← অন্য দৃশ্য", showPicker)); card.appendChild(act); view(card);
}

/* ───────────── 3) conversation ───────────── */
function startConversation() {
  app.conv = newConversation(app.sc, app.level, app.mode); app.spoken = 0; app.fellBack = false; app.saved = null; app.report = null;
  drawChat(); say("কথোপকথন শুরু হয়েছে");
}

let logEl, goalsEl, inputEl, sendBtn, micBtn, hintBox, errBox, doneBar;
function drawChat() {
  const s = app.sc; const head = el("div", "es-card card");
  head.append(el("h2", null, `${s.icon} ${s.title}`));
  goalsEl = el("ul", "goals"); goalsEl.setAttribute("aria-label", "আপনার লক্ষ্য"); head.appendChild(goalsEl);
  logEl = el("div"); logEl.id = "log"; logEl.setAttribute("role", "log"); logEl.setAttribute("aria-live", "polite"); logEl.setAttribute("aria-label", "কথোপকথন");
  doneBar = el("div"); hintBox = el("div"); errBox = el("div");
  const dock = el("div", "dock");
  inputEl = el("textarea"); inputEl.maxLength = MAX_UTTERANCE; inputEl.lang = "en"; inputEl.placeholder = "English-এ লিখুন বা 🎤 চেপে বলুন…"; inputEl.setAttribute("aria-label", "আপনার উত্তর");
  inputEl.onkeydown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };
  const row = el("div", "row");
  micBtn = el("button", "mic", "🎤"); micBtn.type = "button"; micBtn.setAttribute("aria-label", "বলে উত্তর দিন"); micBtn.onclick = toggleMic; if (!detectSupport(window).recognition) micBtn.hidden = true;
  sendBtn = btn("পাঠান ➤", send, "es-btn grow"); sendBtn.id = "send";
  row.append(micBtn, btn("💡 সাহায্য", showHint, "es-btn es-btn--ghost es-btn--sm"), sendBtn, btn("শেষ করুন", finish, "es-btn es-btn--ghost es-btn--sm"));
  dock.append(inputEl, row, errBox);
  view(head, logEl, doneBar, hintBox, dock);
  paintGoals(); app.conv.turns.forEach((t) => bubble(t.role, t.text)); inputEl.focus();
}

function paintGoals(newly = []) {
  goalsEl.textContent = "";
  objectiveStatus(app.conv, app.sc).forEach((o) => { const li = el("li", o.done ? "done" : ""); li.append(el("span", "mk", "✓"), el("span", null, o.bn + (o.done ? " ✓" : ""))); goalsEl.appendChild(li); });
  if (newly.length) say("লক্ষ্য পূরণ হয়েছে: " + newly.map((id) => app.sc.objectives.find((o) => o.id === id).bn).join(", "));
}

function bubble(role, text, tips = []) {
  const b = el("div", "b " + (role === "partner" ? "p" : "l")); b.lang = "en";
  b.appendChild(el("span", "who", role === "partner" ? app.sc.partner : "আপনি"));
  b.appendChild(document.createTextNode(text));
  if (role === "partner" && canSpeak) { const s = el("button", "say", "🔊"); s.type = "button"; s.setAttribute("aria-label", "শুনুন"); s.onclick = () => speak(text); b.appendChild(s); }
  tips.forEach((t) => b.appendChild(el("span", "tip", `💡 ${(CATEGORIES[t.category] || CATEGORIES.other).bn}: ${t.explainBn}`)));
  logEl.appendChild(b); logEl.scrollTop = logEl.scrollHeight; return b;
}

function showHint() {
  const h = hintFor(app.conv, app.sc); hintBox.textContent = "";
  const box = el("div", "notice"); box.append(el("b", null, "💡 এখন করুন: "), document.createTextNode(h.bn));
  if (h.example) { box.appendChild(document.createElement("br")); box.append(Object.assign(el("i"), { textContent: "“" + h.example + "”", lang: "en" }), document.createTextNode(" "), btn("বসান", () => { inputEl.value = h.example; inputEl.focus(); }, "es-btn es-btn--sm es-btn--ghost"), btn("🔊", () => speak(h.example), "es-btn es-btn--sm es-btn--ghost")); }
  hintBox.appendChild(box);
}

async function send() {
  if (app.busy) return;
  const text = inputEl.value.trim();
  errBox.textContent = ""; hintBox.textContent = "";
  if (!text) { errBox.appendChild(el("div", "err", "আগে English-এ কিছু লিখুন বা 🎤 চেপে বলুন।")); inputEl.focus(); return; }
  const r = addLearner(app.conv, app.sc, text);
  if (!r.accepted) { errBox.appendChild(el("div", "err", r.reason === "limit" ? "উত্তরের সীমা শেষ। রিপোর্ট দেখুন।" : "আগে English-এ কিছু লিখুন।")); return; }
  app.conv = r.conv; inputEl.value = "";
  bubble("learner", r.conv.turns[r.conv.turns.length - 1].text, r.issues.slice(0, 2));
  paintGoals(r.newlyDone);
  app.busy = true; sendBtn.disabled = true;
  const typing = el("div", "typing", "সঙ্গী লিখছে…"); logEl.appendChild(typing); logEl.scrollTop = logEl.scrollHeight;
  let reply = null;
  if (app.conv.mode === "ai") {
    // history excludes the new learner line, which travels separately as `text`
    const ai = await askPartner({ scenario: app.sc.id, level: app.level, history: historyForAi({ ...app.conv, turns: app.conv.turns.slice(0, -1) }), text: r.conv.turns[r.conv.turns.length - 1].text });
    if (ai.ok) reply = ai.reply;
    else {
      app.conv = { ...app.conv, mode: "guided", guidedIdx: Math.min(app.sc.guided.length, Math.max(0, learnerTurns(app.conv).length - 1)) };       // continue with the script, never leave the learner stuck
      if (!app.fellBack) { app.fellBack = true; const why = { rate: "আজকের AI-র সীমা শেষ", auth: "AI-র জন্য আবার login দরকার", network: "ইন্টারনেট সংযোগ নেই", failed: "AI এখন পাওয়া যাচ্ছে না" }[ai.error]; logEl.appendChild(el("div", "notice", `${why}। কথোপকথন গাইডেড মোডে চলছে, আপনার অগ্রগতি অক্ষুণ্ণ।`)); }
    }
  }
  if (reply === null) { const g = guidedReply(app.conv, app.sc); if (g) { reply = g.say; app.conv = g.conv; } else reply = "Thank you. It was nice talking to you. Goodbye!"; }
  typing.remove(); app.conv = addPartner(app.conv, reply); bubble("partner", reply);
  app.busy = false; sendBtn.disabled = false; inputEl.focus();
  if (isComplete(app.conv, app.sc)) {
    doneBar.textContent = ""; const n = el("div", "notice"); n.append(el("b", null, "🎉 সবগুলো লক্ষ্য পূরণ হয়েছে! "), document.createTextNode("চাইলে আরও কথা বলতে পারেন, নয়তো রিপোর্ট দেখুন। "), btn("রিপোর্ট দেখুন →", finish, "es-btn es-btn--sm")); doneBar.appendChild(n); say("সবগুলো লক্ষ্য পূরণ হয়েছে");
  }
}

/* ───────────── speaking into the text box (the learner can edit before sending) ───────────── */
engine.on("result", (a) => { app.spoken += a.durationSec || 0; inputEl.value = (a.transcript || "").slice(0, MAX_UTTERANCE); inputEl.focus(); micBtn.setAttribute("aria-pressed", "false"); engine.next(); say("শোনা কথা লেখা হয়েছে, দরকারে ঠিক করে পাঠান"); });
engine.on("state", (st) => { if (st.name === "error") { micBtn.setAttribute("aria-pressed", "false"); const x = explain(st.error); errBox.textContent = ""; const e = el("div", "err"); e.setAttribute("role", "alert"); e.append(el("b", null, x.title + ". "), document.createTextNode(x.body + " লিখে উত্তর দিতেও পারেন।")); errBox.appendChild(e); engine.retry(); engine.next(); } });
async function toggleMic() {
  if (micBtn.getAttribute("aria-pressed") === "true") { await engine.stop(); return; }
  errBox.textContent = "";
  const r = await engine.start({ mode: "free", recommendedSec: 15 });
  if (r.ok) { micBtn.setAttribute("aria-pressed", "true"); say("শুনছি। বলা শেষ হলে আবার মাইক্রোফোন বাটন চাপুন।"); }
}

/* ───────────── 4) report ───────────── */
async function finish() {
  try { await engine.destroy(); } catch (_) {}
  if (!learnerTurns(app.conv).length) { toast("আগে অন্তত একটি উত্তর দিন।", "info"); return; }
  app.conv = { ...app.conv, ended: true };
  app.report = buildReport(app.conv, app.sc, isoDay());
  drawReport(); saveOnce();
}

function drawReport() {
  const r = app.report, s = app.sc; const card = el("div", "es-card card");
  const h = el("h2", null, r.headline); h.tabIndex = -1; card.append(h, el("p", "sub", `${s.icon} ${s.title}`));
  const tiles = el("div", "tiles");
  [[`${bn(r.objectivesDone)}/${bn(r.objectivesTotal)}`, "লক্ষ্য পূরণ"], [bn(r.learnerTurns), "আপনার উত্তর"], [bn(r.words), "শব্দ"], [bn(r.avgWords), "গড় শব্দ/উত্তর"], [bn(r.issueRate), "সমস্যা প্রতি ১০০ শব্দে"]].forEach(([v, l]) => { const t = el("div", "tile"); t.append(el("b", null, v), el("span", null, l)); tiles.appendChild(t); });
  card.appendChild(tiles);
  card.appendChild(el("h2", null, "🎯 লক্ষ্য"));
  const ul = el("ul", "goals"); r.status.forEach((o) => { const li = el("li", o.done ? "done" : ""); li.append(el("span", "mk", "✓"), el("span", null, o.bn + (o.done ? "" : ` (যেমন: “${o.example}”)`))); ul.appendChild(li); }); card.appendChild(ul);
  if (r.phrasesUsed.length) { card.appendChild(el("h2", null, "👍 ব্যবহার করা ভালো বাক্যাংশ")); card.appendChild(el("p", "lead", r.phrasesUsed.join(" · "))); }
  if (r.mistakes.length) {
    card.appendChild(el("h2", null, "🔎 যে বাক্যগুলো উন্নত করা যায়"));
    r.mistakes.slice(0, 5).forEach((m) => { const b = el("div", "mis"); b.lang = "en"; b.append(el("s", null, m.doc.original), document.createTextNode("  →  "), el("ins", null, m.doc.corrected)); if (m.doc.why) b.appendChild(Object.assign(el("div", "sub", m.doc.why), { lang: "bn" })); card.appendChild(b); });
    card.appendChild(el("p", "sub", "🧠 এগুলো আপনার “লেখার ভুল থেকে শেখা”-য় যোগ হয়, সেখানে অনুশীলন করতে পারবেন।"));
  } else card.appendChild(el("p", "lead", "✅ এই কথোপকথনে নিয়ম-ভিত্তিক কোনো নিশ্চিত ভুল পাওয়া যায়নি। (এটি সীমিত পরীক্ষা; সূক্ষ্ম ভুল ধরতে Writing Coach ব্যবহার করুন।)"));
  card.appendChild(el("h2", null, "➡️ পরের ধাপ")); const nx = el("ul", "goals"); r.next.forEach((t) => nx.appendChild(el("li", null, t))); card.appendChild(nx);
  const st = el("p", "sub"); st.id = "savestat"; st.setAttribute("aria-live", "polite"); card.appendChild(st);
  const act = el("div", "actions");
  act.append(btn("↺ আবার করুন", () => { app.sc = byId(s.id); showBriefing(); }, "es-btn"), btn("অন্য দৃশ্য", showPicker), (() => { const a = el("a", "es-btn es-btn--ghost", "Dashboard"); a.href = "dashboard.html"; return a; })());
  card.appendChild(act); view(card); h.focus(); say("রিপোর্ট প্রস্তুত");
}

let saving = false;
async function saveOnce() {
  if (saving || app.saved) return; saving = true; const st = () => $("savestat");
  try {
    const r = await saveSimulation({ uid: app.uid, userDoc: app.userDoc, catalog: app.catalog, scenario: app.sc, level: app.level, conv: app.conv, report: app.report, spokenSeconds: app.spoken });
    app.saved = r; app.userDoc = r.userDoc;
    const m = r.memory.added + r.memory.reopened;
    if (st()) st().textContent = "✅ সেভ হয়েছে।" + (m ? ` ${bn(m)}টি নতুন ভুল স্মৃতিতে যোগ হয়েছে।` : "") + (r.reached ? " 🎯 আজকের Speaking লক্ষ্য পূরণ!" : "");
  } catch (e) {
    console.warn("simulation save failed", e);
    if (st()) { st().textContent = "⚠️ ফলাফল সেভ করা যায়নি (আপনার কথোপকথন ঠিকই হয়েছে)। "; st().appendChild(btn("আবার সেভ করুন", () => { saving = false; saveOnce(); }, "es-btn es-btn--sm")); }
  } finally { saving = false; }
}

window.addEventListener("pagehide", () => { try { engine.destroy(); speechSynthesis.cancel(); } catch (_) {} });
requireAuth((user, d) => { init(user, d).catch((e) => { console.error(e); $("view").textContent = "পেজ লোড করা যায়নি। রিফ্রেশ করে দেখুন।"; }); });
