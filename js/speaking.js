/* ══════════════════════════════════════════════════
   speaking.js — English Shekho  (fully fixed)
   Fixes:
   1. Word Scorer + Shadowing: continuous=true + manual stop → reliable transcript
   2. XP daily limit: query speaking_sessions (not scores) — correct collection
   3. Streak: tracked via lastSessionDate in Firestore, updated on submit
   4. Challenges: auto-tracked by ACTUAL activity, not button clicks
      - ch_7day  → streak >= 7 days auto-completes
      - ch_2min  → session wordCount >= 120 words (≈2 min)
      - ch_30sess → total speakSessions count
      - ch_10words → scorer pct >= 60 (10 times)
      - ch_shadow5 → shadow match pct >= 60 (5 times)
      - ch_twister → twister listen (6 times)
══════════════════════════════════════════════════ */

import { freeFluency } from "../speaking/scoring.js";
import { freeFeedback } from "../speaking/feedback.js";
import { safeImageUrl } from "../learning/reading-tools.js";
import {
  requireAuth, auth, db,
  doc, getDoc, updateDoc, setDoc,
  collection, addDoc, getDocs,
  query, orderBy, limit, where,
  serverTimestamp, increment, signOut, toast, esc
} from "./firebase-config.js";

import {
  PROMPTS, DAILY_TASKS_DEF, PRONUN_WORDS,
  SCORER_SENTENCES, TONGUE_TWISTERS,
  SHADOWING_PHRASES, TOPICS, CHALLENGES_DEF
} from "./speaking-data.js";

/* ══ STATE ══ */
let currentUser        = null;
let isRecording        = false;
let mediaRecorder      = null;
let audioChunks        = [];
let audioBlob          = null;
let recStartedAt       = 0;      // performance.now() when recording began (real duration for the fluency estimate)
let recDurationMs      = 0;
let audioUrl           = null;
let recognition        = null;
let currentPromptIdx   = 0;
let transcript         = "";
let sessionCount       = 0;
let streakCount        = 0;
let xpTotal            = 0;
let completedChallenges = 0;

let scorerIdx          = 0;
let scorerRecognition  = null;
let scorerTranscript   = "";
let scorerActive       = false;  // true = currently listening

let twisterSpeeds      = {};
let shadowStep         = {};
let shadowRecognitions = {};     // idx → SpeechRecognition instance

const todayStr = new Date().toISOString().slice(0, 10);

/* ══════════════════════════════════════════════════
   SHARED TTS HELPER
══════════════════════════════════════════════════ */
let _ttsVoices = [];
function _loadVoices() { _ttsVoices = speechSynthesis.getVoices(); }
if (window.speechSynthesis) {
  _loadVoices();
  speechSynthesis.addEventListener("voiceschanged", _loadVoices);
}
function _bestEnVoice() {
  return _ttsVoices.find(v => v.lang === "en-US" && /google/i.test(v.name))
      || _ttsVoices.find(v => v.lang === "en-US")
      || _ttsVoices.find(v => v.lang.startsWith("en"))
      || null;
}
function speakText(text, rate = 0.85) {
  if (!window.speechSynthesis) { toast("⚠️ Chrome ব্যবহার করুন।", "error"); return; }
  if (!text?.trim()) return;
  speechSynthesis.cancel();
  const go = () => {
    const u = new SpeechSynthesisUtterance(text.trim());
    u.lang = "en-US"; u.rate = rate; u.pitch = 1;
    const v = _bestEnVoice(); if (v) u.voice = v;
    u.onerror = e => { if (e.error !== "interrupted") toast("⚠️ TTS error।", "error"); };
    speechSynthesis.speak(u);
  };
  _ttsVoices.length === 0
    ? speechSynthesis.addEventListener("voiceschanged", () => setTimeout(go, 80), { once: true })
    : setTimeout(go, 80);
}

/* ══════════════════════════════════════════════════
   STREAK — update on every speaking session submit
══════════════════════════════════════════════════ */
async function updateStreak() {
  if (!currentUser) return;
  const ref  = doc(db, "users", currentUser.uid);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const last = data.lastSessionDate || "";
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let newStreak;
  if (last === todayStr) {
    // already practiced today — keep streak
    newStreak = data.streak || 1;
  } else if (last === yesterday) {
    // practiced yesterday — increment streak
    newStreak = (data.streak || 0) + 1;
  } else {
    // streak broken — reset to 1
    newStreak = 1;
  }

  await updateDoc(ref, { streak: newStreak, lastSessionDate: todayStr });
  streakCount = newStreak;
  updateHeroStats();
  updateFluencyTracker();

  // Auto-complete 7-day streak challenge
  if (newStreak >= 7) await _completeChallengeIfNot("ch_7day", newStreak);
}

/* ══════════════════════════════════════════════════
   CHALLENGES — Firebase (auto-tracked by activity)
══════════════════════════════════════════════════ */
async function loadAndBuildChallenges() {
  if (!currentUser) return;
  const grid = document.getElementById("challenge-grid");
  grid.innerHTML = `<div style="color:var(--muted);font-size:13px;padding:.5rem;font-family:'Noto Sans Bengali',sans-serif;">Loading...</div>`;

  let progressMap = {};
  try {
    const snap = await getDocs(collection(db, "users", currentUser.uid, "challengeProgress"));
    snap.forEach(d => { progressMap[d.id] = d.data(); });
  } catch (e) {}

  completedChallenges = Object.values(progressMap).filter(p => p.completed).length;
  document.getElementById("h-challenges").textContent = completedChallenges;

  grid.innerHTML = CHALLENGES_DEF.map(ch => {
    const prog   = progressMap[ch.id] || { count: 0, completed: false };
    const done   = !!prog.completed;
    const count  = prog.count || 0;
    const pct    = Math.min(100, Math.round((count / ch.target) * 100));
    const bg     = done ? "rgba(52,211,153,.04)" : ch.color;
    const border = done ? "rgba(52,211,153,.25)" : ch.border;
    return `<div class="ch-card ${done ? "completed" : ""}" id="ch-${ch.id}"
         data-ch-id="${ch.id}" data-done="${done}"
         style="background:${bg};border-color:${border};">
      <div class="ch-top"><span class="ch-icon">${ch.icon}</span><span class="ch-xp">+${ch.xpReward} XP</span></div>
      <div class="ch-title">${ch.title}</div>
      <div class="ch-desc">${ch.desc}</div>
      <div class="ch-progress-track"><div class="ch-progress-fill" style="width:${pct}%"></div></div>
      <div class="ch-progress-label">${done ? "✅ Completed!" : `${count} / ${ch.target} ${ch.unit}`}</div>
    </div>`;
  }).join("");

  // re-attach listener after DOM replace
  grid.replaceWith(grid.cloneNode(true));
  // (no click action needed — all auto-tracked)
}

/* core helper: increment a challenge by 1, complete if target reached */
async function incrementChallenge(chId) {
  if (!currentUser) return;
  const ch   = CHALLENGES_DEF.find(c => c.id === chId);
  if (!ch) return;
  const ref  = doc(db, "users", currentUser.uid, "challengeProgress", chId);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().completed) return; // already done

  const data = snap.exists()
    ? snap.data()
    : { count: 0, completed: false, startedAt: serverTimestamp() };
  data.count = (data.count || 0) + 1;
  data.lastUpdated = serverTimestamp();

  if (data.count >= ch.target) {
    data.completed = true;
    data.completedAt = serverTimestamp();
    await setDoc(ref, data);
    await updateDoc(doc(db, "users", currentUser.uid), { xp: increment(ch.xpReward) });
    xpTotal += ch.xpReward;
    completedChallenges++;
    updateHeroStats();
    toast(`🏆 Challenge complete: ${ch.title}! +${ch.xpReward} XP`, "success");
  } else {
    await setDoc(ref, data);
  }
  // silently refresh challenge UI
  await loadAndBuildChallenges();
}

/* complete a challenge directly (for streak — count = streak value) */
async function _completeChallengeIfNot(chId, count) {
  if (!currentUser) return;
  const ch   = CHALLENGES_DEF.find(c => c.id === chId);
  if (!ch) return;
  const ref  = doc(db, "users", currentUser.uid, "challengeProgress", chId);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().completed) return;
  const data = snap.exists() ? snap.data() : { startedAt: serverTimestamp() };
  data.count = count;
  data.lastUpdated = serverTimestamp();
  if (count >= ch.target) {
    data.completed = true; data.completedAt = serverTimestamp();
    await setDoc(ref, data);
    await updateDoc(doc(db, "users", currentUser.uid), { xp: increment(ch.xpReward) });
    xpTotal += ch.xpReward; completedChallenges++;
    updateHeroStats();
    toast(`🏆 ${ch.title} complete! +${ch.xpReward} XP 🔥`, "success");
  } else {
    await setDoc(ref, data);
  }
  await loadAndBuildChallenges();
}

/* ══════════════════════════════════════════════════
   DAILY TASKS — Firebase
══════════════════════════════════════════════════ */
async function loadDailyTasks() {
  if (!currentUser) return;
  const ref = doc(db, "users", currentUser.uid, "dailyTasks", todayStr);
  let data = {};
  try { const snap = await getDoc(ref); if (snap.exists()) data = snap.data(); } catch (e) {}
  renderDailyTasks(data);
}

function renderDailyTasks(saved) {
  document.getElementById("daily-tasks").innerHTML = DAILY_TASKS_DEF.map(t => {
    const done = !!saved[t.id];
    return `<div class="dt-card ${done ? "done" : ""}" id="dtc-${t.id}" data-task-id="${t.id}">
      <div class="dt-check">${done ? "✓" : ""}</div>
      <div class="dt-info">
        <div class="dt-name">${t.name}</div>
        <div class="dt-sub">${t.sub}</div>
      </div>
    </div>`;
  }).join("");
  const doneCount = DAILY_TASKS_DEF.filter(t => saved[t.id]).length;
  document.getElementById("daily-progress").textContent = `${doneCount} / ${DAILY_TASKS_DEF.length} done`;
}

async function toggleDailyTask(id) {
  if (!currentUser) return;
  const ref  = doc(db, "users", currentUser.uid, "dailyTasks", todayStr);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  data[id] = !data[id];
  await setDoc(ref, data, { merge: true });
  renderDailyTasks(data);
  if (data[id]) toast("✅ Task completed! +5 XP 💪", "success");
}

/* ══════════════════════════════════════════════════
   WORD-BY-WORD SCORER
   FIX: continuous=true so browser doesn't auto-stop;
        user presses Stop when done → reliable transcript
══════════════════════════════════════════════════ */
function loadScorerSentence(idx) {
  const s = SCORER_SENTENCES[idx % SCORER_SENTENCES.length];
  document.getElementById("scorer-target").textContent    = s.en;
  document.getElementById("scorer-target-bn").textContent = "বাংলা: " + s.bn;
  const words = s.en.replace(/[^a-zA-Z\s]/g, "").split(/\s+/).filter(Boolean);
  document.getElementById("scorer-word-list").innerHTML =
    words.map((w, i) => `<span class="scorer-word" id="sw-${i}">${w}</span>`).join("");
  document.getElementById("scorer-result").classList.remove("show");
  scorerTranscript = "";
}

function listenScorer() {
  const txt = (document.getElementById("scorer-target").textContent || "").trim();
  if (!txt || txt === "Loading...") { toast("⚠️ Sentence লোড হয়নি।", "error"); return; }
  speakText(txt, 0.82);
}

function toggleScorerRec() {
  scorerActive ? stopScorerRec() : startScorerRec();
}

function startScorerRec() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast("⚠️ Chrome ব্যবহার করুন — Speech Recognition নেই।", "error"); return; }
  scorerTranscript = "";
  const btn = document.getElementById("btn-scorer-rec");

  scorerRecognition = new SR();
  scorerRecognition.lang             = "en-US";
  scorerRecognition.continuous       = true;   // ✅ FIX: don't auto-stop
  scorerRecognition.interimResults   = false;
  scorerRecognition.maxAlternatives  = 1;

  scorerRecognition.onstart = () => {
    scorerActive = true;
    btn.textContent = "⏹️ Stop & Analyse";
    btn.classList.add("active");
    toast("🔴 বলুন... বলা শেষ হলে Stop চাপুন", "info");
  };
  scorerRecognition.onresult = e => {
    for (let i = e.resultIndex; i < e.results.length; i++)
      if (e.results[i].isFinal) scorerTranscript += " " + e.results[i][0].transcript;
  };
  scorerRecognition.onerror = e => {
    if (e.error === "no-speech") return; // ignore — user just paused
    const msgs = { "not-allowed": "⚠️ Microphone permission দিন।", "network": "⚠️ Network error।", "audio-capture": "⚠️ Microphone পাওয়া যাচ্ছে না।" };
    toast(msgs[e.error] || `⚠️ ${e.error}`, "error");
    scorerActive = false; btn.textContent = "🎙️ Record & Analyse"; btn.classList.remove("active");
  };
  scorerRecognition.onend = () => {
    // only analyse if we stopped intentionally (scorerActive = false set by stopScorerRec)
    scorerActive = false;
    btn.textContent = "🎙️ Record & Analyse"; btn.classList.remove("active");
    if (scorerTranscript.trim()) analyseScorerResult();
    else toast("⚠️ কিছু detect হয়নি — আবার try করুন।", "error");
  };
  try { scorerRecognition.start(); } catch (e) { toast("⚠️ Microphone start করা যায়নি।", "error"); }
}

function stopScorerRec() {
  scorerActive = false;
  if (scorerRecognition) try { scorerRecognition.stop(); } catch (e) {}
}

function analyseScorerResult() {
  const s = SCORER_SENTENCES[scorerIdx % SCORER_SENTENCES.length];
  const targetWords = s.en.replace(/[^a-zA-Z\s]/g, "").toLowerCase().split(/\s+/).filter(Boolean);
  const spokenWords = scorerTranscript.toLowerCase().replace(/[^a-zA-Z\s]/g, "").split(/\s+/).filter(Boolean);
  let correct = 0, missed = 0;
  targetWords.forEach((tw, i) => {
    const chip  = document.getElementById("sw-" + i);
    if (!chip) return;
    const found = spokenWords.some(sw => sw === tw || levenshtein(sw, tw) <= 1);
    chip.className = "scorer-word " + (found ? "correct" : "missed");
    found ? correct++ : missed++;
  });
  const pct = Math.round((correct / targetWords.length) * 100);
  const res = document.getElementById("scorer-result");
  res.innerHTML = `
    <div style="font-weight:800;margin-bottom:.5rem;">📊 Result: ${pct}% Accuracy</div>
    <div style="font-size:12px;color:var(--sub);font-family:'Noto Sans Bengali',sans-serif;line-height:1.7;">
      ✅ Correct: <b style="color:var(--emerald)">${correct}</b> &nbsp;|&nbsp;
      ❌ Missed: <b style="color:var(--rose)">${missed}</b> &nbsp;|&nbsp;
      🔤 Spoken: "${scorerTranscript.trim() || "(nothing detected)"}"
    </div>
    <div style="margin-top:.5rem;font-size:12px;color:var(--muted);font-family:'Noto Sans Bengali',sans-serif;">
      ${pct >= 90 ? "🌟 Excellent! প্রায় perfect!" : pct >= 70 ? "👍 Good! আরো একবার try করুন।" : "💪 Keep practicing! ধীরে ধীরে বলুন।"}
    </div>`;
  res.classList.add("show");
  // ✅ challenge auto-track: only if user actually scored well
  if (currentUser && pct >= 60) incrementChallenge("ch_10words");
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

/* ══════════════════════════════════════════════════
   PRONUNCIATION PRACTICE
══════════════════════════════════════════════════ */
function buildPronunGrid() {
  const grid = document.getElementById("pronun-grid");
  grid.innerHTML = PRONUN_WORDS.map(w => `
    <div class="pronun-card">
      <div class="pc-top">
        <div><div class="pc-word">${w.word}</div><div class="pc-phonetic">${w.phonetic}</div></div>
        <div class="diff-dot" style="background:${w.diff==="easy"?"#34d399":w.diff==="medium"?"#f5c842":"#fb7185"};"></div>
      </div>
      <div class="pc-meaning">${w.meaning}</div>
      <div class="pc-tips">${w.tips.map(tip => `<div class="pc-tip"><span class="pc-tip-dot"></span>${tip}</div>`).join("")}</div>
      <div class="pc-actions">
        <button class="btn-listen"   data-speak="${w.word}" data-rate="0.78">🔊 Listen</button>
        <button class="btn-practice" data-practice="${w.word}">🎙️ Practice</button>
      </div>
    </div>`).join("");
  grid.addEventListener("click", e => {
    const lb = e.target.closest("[data-speak]");
    const pb = e.target.closest("[data-practice]");
    if (lb) speakText(lb.dataset.speak, parseFloat(lb.dataset.rate) || 0.78);
    if (pb) practiceWord(pb.dataset.practice);
  });
}

/* ══════════════════════════════════════════════════
   TONGUE TWISTERS
══════════════════════════════════════════════════ */
function buildTwisterGrid() {
  const grid = document.getElementById("twister-grid");
  grid.innerHTML = TONGUE_TWISTERS.map((t, i) => {
    const [bg, bd, cl] = t.level === "Easy"
      ? ["rgba(52,211,153,.12)", "rgba(52,211,153,.3)", "#34d399"]
      : t.level === "Medium"
      ? ["rgba(245,200,66,.12)", "rgba(245,200,66,.3)", "#f5c842"]
      : ["rgba(251,113,133,.12)", "rgba(251,113,133,.3)", "#fb7185"];
    if (twisterSpeeds[i] === undefined) twisterSpeeds[i] = 0.8;
    const spd = twisterSpeeds[i];
    return `<div class="twister-card" data-twister-idx="${i}">
      <span class="tw-level" style="background:${bg};border:1px solid ${bd};color:${cl};">${t.level} · +${t.xp} XP</span>
      <div class="tw-text">"${t.text}"</div>
      <div class="tw-tip">💡 ${t.tip}</div>
      <div class="tw-actions">
        <button class="btn-tw btn-tw-listen" data-tw-listen="${i}">🔊 Listen</button>
        <button class="btn-tw btn-tw-try"    data-tw-try="${i}">🎙️ Try It</button>
      </div>
      <div class="tw-speed">
        <span style="font-size:10px;color:var(--muted);font-family:'JetBrains Mono',monospace;">Speed:</span>
        <button class="speed-btn ${spd===0.6?"active":""}" data-tw-speed="${i}" data-speed="0.6">0.6×</button>
        <button class="speed-btn ${spd===0.8?"active":""}" data-tw-speed="${i}" data-speed="0.8">0.8×</button>
        <button class="speed-btn ${spd===1.0?"active":""}" data-tw-speed="${i}" data-speed="1.0">1.0×</button>
      </div>
    </div>`;
  }).join("");
  grid.replaceWith(grid.cloneNode(true));
  document.getElementById("twister-grid").addEventListener("click", e => {
    const lb = e.target.closest("[data-tw-listen]");
    const tb = e.target.closest("[data-tw-try]");
    const sb = e.target.closest("[data-tw-speed]");
    if (lb) {
      const i = +lb.dataset.twListen;
      speakText(TONGUE_TWISTERS[i].text, twisterSpeeds[i] || 0.8);
      incrementChallenge("ch_twister"); // ✅ auto-track: listening counts
    }
    if (tb) {
      const i = +tb.dataset.twTry;
      document.getElementById("rec-prompt").textContent    = TONGUE_TWISTERS[i].text;
      document.getElementById("rec-prompt-bn").textContent = "Tongue twister — দ্রুত ও স্পষ্টভাবে বলুন!";
      document.querySelector(".recorder-section").scrollIntoView({ behavior: "smooth" });
      toast(`Twister loaded! 👅`, "info");
    }
    if (sb) {
      const i = +sb.dataset.twSpeed;
      twisterSpeeds[i] = parseFloat(sb.dataset.speed);
      buildTwisterGrid();
      toast(`Speed: ${twisterSpeeds[i]}× 🔊`, "info");
    }
  });
}

/* ══════════════════════════════════════════════════
   SHADOWING PRACTICE
   FIX: continuous=true, transcript accumulates until Stop
══════════════════════════════════════════════════ */
function buildShadowGrid() {
  const grid = document.getElementById("shadow-grid");
  grid.innerHTML = SHADOWING_PHRASES.map((s, i) => {
    shadowStep[i] = "listen";
    return `<div class="shadow-card" id="shcard-${i}">
      <div class="sh-meta">
        <span class="sh-level" style="background:${s.levelColor};border:1px solid ${s.levelBorder};color:#f0f4f8;">${s.level}</span>
        <span class="sh-topic">${s.topic}</span>
      </div>
      <div class="sh-text">${s.text}</div>
      <div class="sh-bn">${s.bn}</div>
      <div class="sh-steps" id="sh-steps-${i}">
        <span class="sh-step active">1. Listen</span>
        <span class="sh-step">2. Repeat</span>
        <span class="sh-step">3. Done ✓</span>
      </div>
      <div class="sh-actions">
        <button class="btn-sh btn-sh-play" data-sh-listen="${i}">🔊 Listen First</button>
        <button class="btn-sh btn-sh-rec"  data-sh-rec="${i}" id="sh-rec-btn-${i}">🎙️ Shadow It</button>
      </div>
      <div class="sh-match" id="sh-match-${i}"></div>
    </div>`;
  }).join("");
  grid.addEventListener("click", e => {
    const lb = e.target.closest("[data-sh-listen]");
    const rb = e.target.closest("[data-sh-rec]");
    if (lb) shadowListen(+lb.dataset.shListen);
    if (rb) shadowRecord(+rb.dataset.shRec);
  });
}

function shadowListen(i) {
  speakText(SHADOWING_PHRASES[i].text, 0.85);
  if (shadowStep[i] === "listen") { shadowStep[i] = "record"; updateShadowSteps(i, 1); }
}

function shadowRecord(i) {
  // already recording → stop
  if (shadowRecognitions[i]) {
    try { shadowRecognitions[i].stop(); } catch (e) {}
    // onend will handle cleanup + analysis
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast("⚠️ Chrome ব্যবহার করুন।", "error"); return; }

  let accumulated = "";
  const rec = new SR();
  rec.lang            = "en-US";
  rec.continuous      = true;   // ✅ FIX: don't auto-stop
  rec.interimResults  = false;

  const btn = document.getElementById("sh-rec-btn-" + i);

  rec.onstart = () => {
    shadowRecognitions[i] = rec;
    if (btn) { btn.textContent = "⏹️ Stop"; btn.classList.add("active"); }
    toast("🔴 বলুন... শেষ হলে Stop চাপুন", "info");
  };
  rec.onresult = e => {
    for (let r = e.resultIndex; r < e.results.length; r++)
      if (e.results[r].isFinal) accumulated += " " + e.results[r][0].transcript;
  };
  rec.onerror = e => {
    if (e.error === "no-speech") return;
    toast(`⚠️ ${e.error}`, "error");
  };
  rec.onend = () => {
    delete shadowRecognitions[i];
    if (btn) { btn.textContent = "🎙️ Shadow It"; btn.classList.remove("active"); }
    if (!accumulated.trim()) { toast("⚠️ কিছু detect হয়নি।", "error"); return; }

    const spoken  = accumulated.toLowerCase().replace(/[^a-zA-Z\s]/g, "");
    const target  = SHADOWING_PHRASES[i].text.toLowerCase().replace(/[^a-zA-Z\s]/g, "");
    const tWords  = target.split(/\s+/).filter(Boolean);
    const sWords  = spoken.split(/\s+/).filter(Boolean);
    const matched = tWords.filter(tw => sWords.some(sw => sw === tw || levenshtein(sw, tw) <= 1));
    const pct     = Math.round((matched.length / tWords.length) * 100);

    const box = document.getElementById("sh-match-" + i);
    const emoji = pct >= 80 ? "🌟" : pct >= 60 ? "👍" : "💪";
    box.innerHTML = `${emoji} Match: <b style="color:${pct>=80?"#34d399":pct>=60?"#f5c842":"#fb7185"}">${pct}%</b>
      &nbsp;·&nbsp; <span style="font-size:11px;color:var(--muted);">"${accumulated.trim()}"</span>`;
    box.classList.add("show");

    if (pct >= 60) {
      shadowStep[i] = "done";
      updateShadowSteps(i, 2);
      incrementChallenge("ch_shadow5"); // ✅ auto-track on success
    }
  };
  rec.start();
}

function updateShadowSteps(i, activeStep) {
  document.getElementById("sh-steps-" + i)?.querySelectorAll(".sh-step")
    .forEach((el, si) => el.classList.toggle("active", si === activeStep));
}

/* ══════════════════════════════════════════════════
   TOPICS GRID
══════════════════════════════════════════════════ */
function buildTopicsGrid() {
  const grid = document.getElementById("topics-grid");
  grid.innerHTML = TOPICS.map((t, i) => `
    <div class="topic-card" data-topic-idx="${i}" style="background:linear-gradient(135deg,${t.color},rgba(8,14,26,.8));border-color:${t.border};">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,${t.border.replace(".25",".8")},transparent);"></div>
      <div class="tc-icon">${t.icon}</div>
      <div class="tc-title">${t.title}</div>
      <div class="tc-desc">${t.desc}</div>
      <div class="tc-footer">
        <span class="tc-level" style="background:${t.color};border:1px solid ${t.border};color:#fff;">${t.level}</span>
        <span class="tc-xp">+${t.xp} XP</span>
      </div>
    </div>`).join("");
  grid.addEventListener("click", e => {
    const card = e.target.closest("[data-topic-idx]");
    if (card) { const t = TOPICS[+card.dataset.topicIdx]; if (t) loadPromptFromTopic(t.title, t.desc); }
  });
}

/* ══════════════════════════════════════════════════
   FLUENCY TRACKER & HERO STATS
══════════════════════════════════════════════════ */
function updateFluencyTracker() {
  const pct = Math.min(100, Math.round(sessionCount * 3.33));
  document.getElementById("fluency-bar").style.width   = pct + "%";
  document.getElementById("fluency-label").textContent = `${sessionCount} sessions completed`;
  document.getElementById("fluency-pct").textContent   = pct + "% fluency score";
  document.getElementById("fluency-next").textContent  =
    pct >= 100 ? "🏆 Expert speaker!" : pct >= 75 ? "Almost fluent! 🔥" : pct >= 50 ? "Good progress! 💪" : "Keep speaking daily! 🎙️";
  document.getElementById("ft-grid").innerHTML = [
    { val: sessionCount,          label: "Total Sessions" },
    { val: streakCount + " days", label: "Current Streak" },
    { val: xpTotal + " XP",       label: "XP Earned" },
    { val: Math.round(pct) + "%", label: "Fluency Score" },
  ].map(s => `<div class="ft-item"><div class="ft-val">${s.val}</div><div class="ft-label">${s.label}</div></div>`).join("");
}

function updateHeroStats() {
  document.getElementById("h-sessions").textContent    = sessionCount;
  document.getElementById("h-streak").textContent      = streakCount;
  document.getElementById("h-xp").textContent          = xpTotal;
  document.getElementById("h-challenges").textContent  = completedChallenges;
}

/* ══════════════════════════════════════════════════
   PROMPT SYSTEM
══════════════════════════════════════════════════ */
function loadPrompt(idx) {
  const p = PROMPTS[idx % PROMPTS.length];
  document.getElementById("rec-prompt").textContent    = p.en;
  document.getElementById("rec-prompt-bn").textContent = p.bn;
  resetRecorder();
}
function nextPrompt() {
  currentPromptIdx = (currentPromptIdx + 1) % PROMPTS.length;
  loadPrompt(currentPromptIdx);
  toast("Next prompt loaded! 🎙️", "info");
}
function loadPromptFromTopic(title, desc) {
  document.getElementById("rec-prompt").textContent    = `Talk about: ${title}`;
  document.getElementById("rec-prompt-bn").textContent = desc;
  resetRecorder();
  document.querySelector(".recorder-section").scrollIntoView({ behavior: "smooth" });
  toast(`Topic loaded: ${title} 🎤`, "info");
}
function resetRecorder() {
  isRecording = false; audioBlob = null; audioUrl = null; transcript = "";
  document.getElementById("mic-btn").classList.remove("recording");
  document.getElementById("mic-btn").textContent = "🎙️";
  document.getElementById("mic-status").textContent = "🎙️ Tap to start recording";
  document.getElementById("mic-status").classList.remove("active");
  document.getElementById("btn-start").style.display      = "inline-flex";
  document.getElementById("btn-stop").style.display       = "none";
  document.getElementById("btn-replay").style.display     = "none";
  document.getElementById("btn-submit-rec").style.display = "none";
  document.getElementById("transcript-box").className = "transcript-box";
  document.getElementById("speak-score").className    = "speak-score";
  document.querySelectorAll(".wave-bar").forEach(b => b.classList.remove("active"));
}

/* ══════════════════════════════════════════════════
   RECORDING (main mic)
══════════════════════════════════════════════════ */
async function toggleRecording() {
  isRecording ? stopRecording() : await startRecording();
}
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
      recDurationMs = Math.max(0, performance.now() - recStartedAt);
      audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      audioUrl  = URL.createObjectURL(audioBlob);
      document.getElementById("btn-replay").style.display     = "inline-flex";
      document.getElementById("btn-submit-rec").style.display = "inline-flex";
    };
    recStartedAt = performance.now();
    mediaRecorder.start();
    isRecording = true;
    document.getElementById("mic-btn").classList.add("recording");
    document.getElementById("mic-btn").textContent = "⏹️";
    document.getElementById("mic-status").textContent = "🔴 Recording...";
    document.getElementById("mic-status").classList.add("active");
    document.getElementById("btn-start").style.display = "none";
    document.getElementById("btn-stop").style.display  = "inline-flex";
    document.querySelectorAll(".wave-bar").forEach(b => b.classList.add("active"));
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      recognition = new SR();
      recognition.lang = "en-US"; recognition.continuous = true; recognition.interimResults = true;
      recognition.onresult = e => {
        let interim = "", final = "";
        for (let i = e.resultIndex; i < e.results.length; i++)
          e.results[i].isFinal ? (final += e.results[i][0].transcript) : (interim += e.results[i][0].transcript);
        transcript += final;
        const box = document.getElementById("transcript-box");
        box.textContent = transcript + (interim ? " " + interim : "");
        box.className = "transcript-box show" + (box.textContent.trim() ? " has-text" : "");
      };
      recognition.onerror = e => { if (e.error !== "no-speech") console.warn("STT:", e.error); };
      recognition.start();
    }
  } catch (e) { toast("⚠️ Microphone access denied.", "error"); }
}
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
  mediaRecorder?.stream?.getTracks().forEach(t => t.stop());
  if (recognition) try { recognition.stop(); } catch (e) {}
  isRecording = false;
  document.getElementById("mic-btn").classList.remove("recording");
  document.getElementById("mic-btn").textContent = "🎙️";
  document.getElementById("mic-status").textContent = "✅ Recording saved!";
  document.getElementById("mic-status").classList.remove("active");
  document.getElementById("btn-stop").style.display  = "none";
  document.getElementById("btn-start").style.display = "inline-flex";
  document.querySelectorAll(".wave-bar").forEach(b => b.classList.remove("active"));
}
function replayAudio() {
  if (!audioUrl) { toast("⚠️ No recording yet.", "error"); return; }
  new Audio(audioUrl).play();
}
function practiceWord(word) {
  document.getElementById("rec-prompt").textContent    = `Say this word clearly: "${word}"`;
  document.getElementById("rec-prompt-bn").textContent = "এই word-টি স্পষ্টভাবে বলুন।";
  document.querySelector(".recorder-section").scrollIntoView({ behavior: "smooth" });
  toast(`Practice: ${word} 🔊`, "info");
}

/* ══════════════════════════════════════════════════
   SUBMIT SPEAKING — Firebase
   FIX: XP daily limit now queries speaking_sessions
        (correct collection, not scores)
        Streak updated on every submit
        ch_2min auto-tracked if wordCount >= 120
        ch_30sess auto-tracked on every session
══════════════════════════════════════════════════ */
async function submitSpeaking() {
  if (!audioBlob) { toast("⚠️ Please record first!", "error"); return; }
  if (!currentUser) { toast("⚠️ Login করুন।", "error"); return; }
  const prompt = document.getElementById("rec-prompt").textContent;
  const words  = transcript.trim().split(/\s+/).filter(Boolean).length;
  if (words < 3) { toast("⚠️ কমপক্ষে কিছু কথা বলুন।", "error"); return; }

  const sc = document.getElementById("speak-score");
  sc.innerHTML = `<div style="text-align:center;padding:1.5rem;color:var(--muted);">
    <div style="font-size:2rem;margin-bottom:.6rem;display:inline-block;animation:spin 1s linear infinite;">⚙️</div>
    <div style="font-family:'Noto Sans Bengali',sans-serif;font-size:13px;">Speaking বিশ্লেষণ করছি...</div>
  </div>`;
  sc.classList.add("show");

  // Honest metrics (Phase 10): measured duration + words, and a documented fluency ESTIMATE.
  // The earlier "pronunciation" (average word length) and "confidence" (word count) numbers were not real measurements and were removed.
  const lp = (window.__esLevel || "A1");
  const fl = freeFluency({ transcript, durationMs: recDurationMs, level: lp, recommendedSec: 45 });
  const fluencyScore = fl.measurable ? fl.score : 0;
  const overallScore = fluencyScore;
  const fb = freeFeedback({ level: lp, f: fl, recommendedSec: 45 });
  const aiFeedback = [fb.headline, ...fb.lines, ...fb.next.map((x) => "➡️ " + x)].join(" ");


  try {
    // ✅ FIX: query speaking_sessions for today's XP (correct collection)
    const todaySessions = await getDocs(
      query(collection(db, "speaking_sessions"),
        where("uid",      "==", currentUser.uid),
        where("dateStr",  "==", todayStr))
    );
    const xpEarnedToday = todaySessions.docs.reduce((sum, d) => sum + (d.data().xpEarned || 0), 0);
    const xpGained      = Math.min(50, Math.max(0, 200 - xpEarnedToday));

    // Save session
    await addDoc(collection(db, "speaking_sessions"), {
      uid: currentUser.uid, displayName: currentUser.displayName || "",
      prompt, transcript, wordCount: words,
      scores: { fluency: fluencyScore, overall: overallScore }, durationSec: Math.round(recDurationMs / 100) / 10, mode: "free", level: ["A1","A2","B1","B2","C1","C2"].includes(lp) ? lp : "A1",
      xpEarned: xpGained, dateStr: todayStr, recordedAt: serverTimestamp()
    });

    // Update user stats
    const upd = { speakSessions: increment(1) };
    if (xpGained > 0) { upd.xp = increment(xpGained); upd.speakingXP = increment(xpGained); }
    await updateDoc(doc(db, "users", currentUser.uid), upd);
    sessionCount++; xpTotal += xpGained;

    // ✅ FIX: update streak on every session
    await updateStreak();

    // ✅ Challenge auto-tracking
    await incrementChallenge("ch_30sess"); // every session
    if (words >= 120) await incrementChallenge("ch_2min"); // ≈2 min speech

    updateHeroStats();
    updateFluencyTracker();
    await loadHistory();
    await loadAndBuildChallenges();

    sc.innerHTML = `
      <div style="font-weight:800;font-size:14px;margin-bottom:.8rem;">📊 Your Score</div>
      <div class="ss-row">
        ${fl.measurable ? `<div class="ss-item"><div class="ss-val" style="color:#2dd4bf;">${fluencyScore}</div><div class="ss-label">Fluency (estimate /100)</div></div>` : ""}
        <div class="ss-item"><div class="ss-val" style="color:#818cf8;">${words}</div><div class="ss-label">Words</div></div>
        <div class="ss-item"><div class="ss-val" style="color:#fb923c;">${Math.round(recDurationMs / 1000)}s</div><div class="ss-label">Duration</div></div>
      </div>
      <div class="ss-feedback"></div><div style="font-size:11px;color:var(--muted);margin-top:.5rem;">ℹ️ Fluency is an estimate from pace, pauses and length. Pronunciation is not scored on this page: use the new <a href="speaking-practice.html" style="color:#818cf8">Speaking Practice</a> for word-by-word feedback.</div>
      <div style="margin-top:.7rem;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--gold);">
        ${xpGained > 0 ? `+${xpGained} XP earned! 🎉` : "⚠️ আজকের XP limit (200) শেষ — কাল আবার পাবে।"}
        &nbsp;·&nbsp; 🔥 Streak: ${streakCount} day${streakCount !== 1 ? "s" : ""}
      </div>`;
    sc.classList.add("show");
    { const fbEl = sc.querySelector(".ss-feedback"); if (fbEl) fbEl.textContent = aiFeedback; }
    toast(`Submitted! Streak: ${streakCount} day(s)`);
  } catch (e) { toast("❌ Submit failed: " + e.message, "error"); console.error(e); }
}

/* ══════════════════════════════════════════════════
   HISTORY
══════════════════════════════════════════════════ */
function fmtAgo(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60)    return "এইমাত্র";
  if (s < 3600)  return Math.floor(s / 60) + " মিনিট আগে";
  if (s < 86400) return Math.floor(s / 3600) + " ঘণ্টা আগে";
  return Math.floor(s / 86400) + " দিন আগে";
}

async function loadHistory() {
  if (!currentUser) return;
  const el = document.getElementById("history-list");
  el.innerHTML = `<div style="color:var(--muted);font-size:13px;padding:1rem;text-align:center;">Loading...</div>`;
  try {
    const snap = await getDocs(query(
      collection(db, "speaking_sessions"),
      where("uid", "==", currentUser.uid),
      orderBy("recordedAt", "desc"),
      limit(8)
    ));
    if (snap.empty) {
      el.innerHTML = `<div style="color:var(--muted);font-size:13px;text-align:center;padding:1.5rem;font-family:'Noto Sans Bengali',sans-serif;">এখনো কোনো speaking session নেই। উপরে record করুন! 🎙️</div>`;
      return;
    }
    el.innerHTML = snap.docs.map(d => {
      const s = d.data();
      const c = (s.scores?.overall || 0) >= 80 ? "#34d399" : (s.scores?.overall || 0) >= 60 ? "#f5c842" : "#fb7185";
      return `<div class="history-item">
        <div class="hi-icon">🎙️</div>
        <div class="hi-info">
          <div class="hi-title">${esc((s.prompt || "Speaking Session").substring(0, 55))}${(s.prompt?.length || 0) > 55 ? "..." : ""}</div>
          <div class="hi-meta">${fmtAgo(s.recordedAt)} · ${s.wordCount || 0} words · ${s.scores?.fluency ? "Fluency est. " + s.scores.fluency : ""}</div>
        </div>
        <div class="hi-score" style="color:${c};">${s.scores?.overall || 0}%</div>
      </div>`;
    }).join("");
  } catch (e) {
    el.innerHTML = `<div style="color:var(--muted);font-size:13px;padding:1rem;">Could not load history.</div>`;
  }
}

/* ══════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════ */
const yr = new Date().getFullYear();
document.getElementById("footer-year").textContent  = yr;
document.getElementById("footer-year2").textContent = yr;

document.getElementById("btn-logout").addEventListener("click", async () => { await signOut(auth); window.location.href = "index.html"; });

// Recorder
document.getElementById("mic-btn").addEventListener("click",        () => toggleRecording());
document.getElementById("btn-start").addEventListener("click",      () => toggleRecording());
document.getElementById("btn-stop").addEventListener("click",       () => toggleRecording());
document.getElementById("btn-replay").addEventListener("click",     () => replayAudio());
document.getElementById("btn-submit-rec").addEventListener("click", () => submitSpeaking());
document.getElementById("btn-next-prompt").addEventListener("click",() => nextPrompt());

// Daily tasks
document.getElementById("daily-tasks").addEventListener("click", e => {
  const card = e.target.closest("[data-task-id]");
  if (card) toggleDailyTask(card.dataset.taskId);
});

// Scorer
document.getElementById("btn-scorer-rec").addEventListener("click",    () => toggleScorerRec());
document.getElementById("btn-scorer-listen").addEventListener("click", () => listenScorer());
document.getElementById("btn-scorer-next").addEventListener("click",   () => {
  if (scorerActive) stopScorerRec();
  scorerIdx = (scorerIdx + 1) % SCORER_SENTENCES.length;
  loadScorerSentence(scorerIdx);
});

// Load immediately (no auth needed)
loadScorerSentence(0);
loadPrompt(0);

requireAuth(async user => {
  currentUser = user;
  document.getElementById("nav-name").textContent = user.displayName || (user.email ? user.email.split("@")[0] : "Guest");
  const avatar = document.getElementById("nav-avatar");
  if (safeImageUrl(user.photoURL)) { avatar.style.backgroundImage = `url("${safeImageUrl(user.photoURL)}")`; avatar.style.backgroundSize = "cover"; avatar.textContent = ""; }

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const d = snap.data();
      sessionCount = d.speakSessions || 0;
      streakCount  = d.streak        || 0;
      xpTotal      = d.xp            || 0;
      window.__esLevel = d.learningProfile && d.learningProfile.level;   // for the fluency estimate's pace band
    }
  } catch (e) { console.warn(e); }

  updateHeroStats();
  updateFluencyTracker();
  buildPronunGrid();
  buildTopicsGrid();
  buildTwisterGrid();
  buildShadowGrid();
  await loadDailyTasks();
  await loadAndBuildChallenges();
  await loadHistory();
});
