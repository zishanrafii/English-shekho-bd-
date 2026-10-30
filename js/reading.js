/* =====================================================
   ENGLISH SHEKHO — READING CENTER LOGIC
   ===================================================== */
import {
  requireAuth, auth, db,
  doc, getDoc, updateDoc, setDoc,
  collection, addDoc, getDocs,
  query, orderBy, limit, where,
  serverTimestamp, increment, arrayUnion, arrayRemove,
  signOut
} from "./firebase-config.js";

import { PASSAGES, CATEGORIES } from "./reading-data.js";
import { saveWord } from "../learning/word-save.js";
import { findSentence } from "../learning/word-bank.js";
import { wpmOf, wpmFeedback, readingLevelFor, safeImageUrl } from "../learning/reading-tools.js";
import { isoDay } from "../learning/srs.js";

/* ══════════════════════════════════════
   STATE
══════════════════════════════════════ */
let currentUser       = null;
let currentPassage    = null;
let activeCat         = "All";
let activeLevel       = "All";
let searchQuery       = "";
let showBookmarkedOnly = false;
let completedReadings = new Set();   // passage ids done (persisted in Firestore)
let bookmarkedPassages = new Set();  // passage ids bookmarked (persisted in Firestore)
let totalXP           = 0;
let totalReadCount    = 0;

let quizIdx       = 0;
let quizScore     = 0;
let quizAnswered  = false;

let readStartTime = null;            // for reading-speed calculation
let measuredWpm   = 0;               // words/minute measured when the learner pressed "finished reading" (quiz time excluded)

/* TTS narration state */
let ttsSentences   = [];   // flat array of sentence strings for current passage
let ttsIdx         = 0;
let ttsPlaying     = false;
let ttsPaused      = false;
let ttsRate        = 1;
let ttsUtterance    = null;

const LEVELS = ["All","A1","A2","B1","B2","C1"];

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function toast(msg, type = "success") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.style.borderLeftColor = type === "error" ? "#fb7185" : type === "info" ? "#818cf8" : "#fb923c";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

/* ══════════════════════════════════════
   HERO STATS
══════════════════════════════════════ */
function updateHeroStats() {
  document.getElementById("h-total").textContent     = PASSAGES.length;
  document.getElementById("h-completed").textContent = completedReadings.size;
  document.getElementById("h-xp").textContent         = totalXP;
}

/* ══════════════════════════════════════
   BUILD CATEGORY + LEVEL TABS
══════════════════════════════════════ */
function buildTabs() {
  const catTabs = document.getElementById("cat-tabs");
  catTabs.innerHTML = CATEGORIES.map(c =>
    `<div class="cat-tab ${c === activeCat ? "active" : ""}" data-cat="${c}">${c}</div>`
  ).join("");

  const lvlTabs = document.getElementById("level-tabs");
  lvlTabs.innerHTML = LEVELS.map(l =>
    `<div class="lvl-tab ${l === activeLevel ? "active" : ""}" data-lvl="${l}">${l}</div>`
  ).join("");
}

/* ══════════════════════════════════════
   BUILD PASSAGE GRID
══════════════════════════════════════ */
function buildPassageGrid() {
  const grid = document.getElementById("passage-grid");

  let list = PASSAGES;
  if (activeCat !== "All")   list = list.filter(p => p.category === activeCat);
  if (activeLevel !== "All") list = list.filter(p => p.level === activeLevel);
  if (searchQuery)            list = list.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  if (showBookmarkedOnly)     list = list.filter(p => bookmarkedPassages.has(p.id));

  grid.innerHTML = list.map(p => {
    const done = completedReadings.has(p.id);
    const bookmarked = bookmarkedPassages.has(p.id);
    return `
    <div class="passage-card ${done ? "completed" : ""}" data-id="${p.id}" style="--pc-color:${p.border};--pc-soft:${p.color};--pc-border:${p.border};">
      <div class="pc-bookmark-btn ${bookmarked ? "active" : ""}" data-bookmark-id="${p.id}" title="${bookmarked ? "Bookmark সরান" : "Bookmark করুন"}">${bookmarked ? "🔖" : "🏷️"}</div>
      <div class="pc-top">
        <div class="pc-icon-box">${p.icon}</div>
        ${done ? `<div class="pc-check">✓</div>` : `<span class="pc-level-badge">${p.level}</span>`}
      </div>
      <div class="pc-title">${p.title}</div>
      <div class="pc-cat">${p.category} · ${p.level}</div>
      <div class="pc-foot">
        <span>⏱ ${p.readMinutes} min</span>
        <span class="pc-xp">+${p.xp} XP</span>
      </div>
    </div>`;
  }).join("") || `<div style="color:var(--muted);font-size:13px;grid-column:1/-1;text-align:center;padding:2rem;">${showBookmarkedOnly ? "এখনও কোনো passage bookmark করা হয়নি।" : "কোনো passage পাওয়া যায়নি।"}</div>`;

  document.getElementById("rt-count").textContent = `${list.length} Passages`;
}

/* ══════════════════════════════════════
   OPEN PASSAGE READER
══════════════════════════════════════ */
function highlightVocab(text, vocab) {
  let result = text;
  Object.keys(vocab).forEach(word => {
    const re = new RegExp(`\\b(${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "i");
    result = result.replace(re, `<span class="vocab-word" data-word="${word}">$1</span>`);
  });
  return result;
}

/* Split a paragraph into sentences (simple punctuation-based split,
   good enough for our passage texts which use standard punctuation). */
function splitSentences(text) {
  const matches = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);
  return matches ? matches.map(s => s.trim()).filter(Boolean) : [text];
}

/* Build the full passage HTML: each paragraph -> sentences wrapped in
   <span class="tts-sentence" data-sidx="N"> with vocab highlighting inside. */
function buildPassageHTML(passage) {
  let sIdx = 0;
  const flatSentences = [];
  const html = passage.text.map(para => {
    const sentences = splitSentences(para);
    const spanned = sentences.map(s => {
      const withVocab = highlightVocab(s, passage.vocab);
      const span = `<span class="tts-sentence" data-sidx="${sIdx}">${withVocab}</span>`;
      flatSentences.push(s.replace(/<[^>]+>/g, "")); // plain text for TTS
      sIdx++;
      return span;
    }).join(" ");
    return `<p>${spanned}</p>`;
  }).join("");
  return { html, sentences: flatSentences };
}

function openPassage(id) {
  const p = PASSAGES.find(p => p.id === id);
  if (!p) return;
  currentPassage = p;
  { const ra = document.getElementById("read-aloud-link"); if (ra) ra.href = "speaking-practice.html?mode=read&passage=" + encodeURIComponent(p.id); }   // Read Aloud reuses this very passage
  readStartTime  = Date.now();
  measuredWpm    = 0;
  quizIdx        = 0;
  quizScore      = 0;
  quizAnswered   = false;

  stopTTS(); // reset any ongoing narration from a previous passage

  document.getElementById("reader-icon").textContent  = p.icon;
  document.getElementById("reader-title").textContent = p.title;
  document.getElementById("reader-meta").innerHTML = `
    <span class="rm-pill">${p.category}</span>
    <span class="rm-pill">${p.level}</span>
    <span class="rm-pill">⏱ ${p.readMinutes} min</span>
    <span class="rm-pill">⭐ ${p.xp} XP</span>
  `;

  const readerBookmarkBtn = document.getElementById("reader-bookmark-btn");
  const isBookmarked = bookmarkedPassages.has(p.id);
  readerBookmarkBtn.classList.toggle("active", isBookmarked);
  readerBookmarkBtn.textContent = isBookmarked ? "🔖" : "🏷️";

  const built = buildPassageHTML(p);
  document.getElementById("passage-text").innerHTML = built.html;
  ttsSentences = built.sentences;
  ttsIdx = 0;
  document.getElementById("tts-total-sentence").textContent = ttsSentences.length;
  document.getElementById("tts-current-sentence").textContent = "0";
  document.getElementById("audio-bar-fill").style.width = "0%";

  document.getElementById("quiz-panel").classList.remove("show");
  document.getElementById("quiz-result").classList.remove("show");
  document.getElementById("reading-progress-fill").style.width = "0%";
  document.getElementById("btn-finish-reading").disabled = false;
  document.getElementById("btn-finish-reading").textContent = "✅ Reading শেষ করুন";

  document.querySelector(".list-screen").classList.add("hide");
  document.getElementById("reader-screen").classList.add("show");
  window.scrollTo({ top: 0, behavior: "smooth" });

  trackScrollProgress();
}

function closeReader() {
  stopTTS();
  document.querySelector(".list-screen").classList.remove("hide");
  document.getElementById("reader-screen").classList.remove("show");
  buildPassageGrid();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ══════════════════════════════════════
   SCROLL PROGRESS (inside reader card)
══════════════════════════════════════ */
function trackScrollProgress() {
  const card = document.getElementById("reader-card-inner");
  if (!card) return;
  function onScroll() {
    const rect      = card.getBoundingClientRect();
    const totalH    = card.scrollHeight;
    const viewportH = window.innerHeight;
    const scrolled  = Math.min(Math.max(0, viewportH - rect.top), totalH);
    const pct       = Math.min(100, Math.round((scrolled / totalH) * 100));
    document.getElementById("reading-progress-fill").style.width = pct + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ══════════════════════════════════════
   TTS NARRATION (browser SpeechSynthesis)
══════════════════════════════════════ */
function ttsSupported() {
  if (!window.speechSynthesis) { toast("⚠️ আপনার browser TTS support করে না।", "error"); return false; }
  return true;
}

function pickEnglishVoice() {
  const voices = speechSynthesis.getVoices();
  return voices.find(v => v.lang === "en-US" && v.name.toLowerCase().includes("google"))
      || voices.find(v => v.lang === "en-US")
      || voices.find(v => v.lang && v.lang.startsWith("en"))
      || null;
}

function highlightSentence(idx) {
  document.querySelectorAll(".tts-sentence").forEach(el => {
    el.classList.toggle("tts-active", parseInt(el.dataset.sidx) === idx);
  });
  const el = document.querySelector(`.tts-sentence[data-sidx="${idx}"]`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });

  document.getElementById("tts-current-sentence").textContent = Math.min(idx + 1, ttsSentences.length);
  const pct = ttsSentences.length ? Math.round(((idx + 1) / ttsSentences.length) * 100) : 0;
  document.getElementById("audio-bar-fill").style.width = pct + "%";
}

function speakSentence(idx) {
  if (idx >= ttsSentences.length) { onTTSEnd(); return; }
  ttsIdx = idx;
  highlightSentence(idx);

  ttsUtterance = new SpeechSynthesisUtterance(ttsSentences[idx]);
  ttsUtterance.lang   = "en-US";
  ttsUtterance.rate   = ttsRate;
  const voice = pickEnglishVoice();
  if (voice) ttsUtterance.voice = voice;

  ttsUtterance.onend = () => { if (!ttsPaused) speakSentence(idx + 1); };
  ttsUtterance.onerror = (e) => { if (e.error !== "interrupted" && !ttsPaused) speakSentence(idx + 1); };

  speechSynthesis.speak(ttsUtterance);
}

function toggleTTS() {
  if (!ttsSupported()) return;
  if (!ttsSentences.length) return;

  const btn = document.getElementById("tts-play-btn");

  if (!ttsPlaying && !ttsPaused) {
    // fresh start
    ttsPlaying = true;
    ttsPaused = false;
    btn.textContent = "⏸";
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener("voiceschanged", () => speakSentence(0), { once: true });
    } else {
      speakSentence(0);
    }
  } else if (ttsPlaying && !ttsPaused) {
    // pause
    speechSynthesis.pause();
    ttsPaused = true;
    ttsPlaying = false;
    btn.textContent = "▶";
  } else if (ttsPaused) {
    // resume
    speechSynthesis.resume();
    ttsPaused = false;
    ttsPlaying = true;
    btn.textContent = "⏸";
  }
}

function stopTTS() {
  if (window.speechSynthesis) speechSynthesis.cancel();
  ttsPlaying = false;
  ttsPaused = false;
  ttsIdx = 0;
  const btn = document.getElementById("tts-play-btn");
  if (btn) btn.textContent = "▶";
  document.querySelectorAll(".tts-sentence").forEach(el => el.classList.remove("tts-active"));
  const fill = document.getElementById("audio-bar-fill");
  if (fill) fill.style.width = "0%";
  const cur = document.getElementById("tts-current-sentence");
  if (cur) cur.textContent = "0";
}

function onTTSEnd() {
  ttsPlaying = false;
  ttsPaused = false;
  const btn = document.getElementById("tts-play-btn");
  if (btn) btn.textContent = "▶";
  document.querySelectorAll(".tts-sentence").forEach(el => el.classList.remove("tts-active"));
  document.getElementById("audio-bar-fill").style.width = "100%";
  toast("🎧 Narration শেষ হয়েছে।", "info");
}

function setTTSRate(rate) {
  ttsRate = rate;
  document.querySelectorAll(".speed-btn").forEach(b => {
    b.classList.toggle("active", parseFloat(b.dataset.speed) === rate);
  });
  // If currently speaking, restart current sentence at new rate
  if (ttsPlaying && !ttsPaused) {
    speechSynthesis.cancel();
    speakSentence(ttsIdx);
  }
}

/* Clicking a sentence directly jumps narration there */
function jumpToSentence(idx) {
  if (!ttsSupported() || !ttsSentences.length) return;
  speechSynthesis.cancel();
  ttsPlaying = true;
  ttsPaused = false;
  document.getElementById("tts-play-btn").textContent = "⏸";
  speakSentence(idx);
}

/* ══════════════════════════════════════
   VOCAB TOOLTIP
══════════════════════════════════════ */
function showVocabTooltip(el) {
  closeAllTooltips();
  const word = el.dataset.word;
  const info = currentPassage.vocab[word];
  if (!info) return;

  const tip = document.createElement("div");
  tip.className = "vocab-tooltip show";
  const pos = document.createElement("span"); pos.className = "vt-pos"; pos.textContent = info.pos || "";
  const mean = document.createElement("span"); mean.textContent = info.meaning_bn;
  const save = document.createElement("button");
  save.type = "button"; save.className = "vt-save"; save.dataset.saveWord = word;
  save.textContent = "➕ রিভিউতে যোগ করুন";
  tip.append(pos, mean, document.createElement("br"), save);
  el.appendChild(tip);
}

/* Save the tapped word (with its meaning and the sentence it appeared in) to Smart Review */
async function saveVocabWord(btn) {
  const word = btn.dataset.saveWord;
  const info = currentPassage && currentPassage.vocab[word];
  if (!info) return;
  btn.disabled = true;
  try {
    const res = await saveWord({
      word, meaning: info.meaning_bn,
      example: findSentence(currentPassage.text, word),
      level: currentPassage.level, src: "reading",
    });
    btn.textContent = res === "exists" ? "✓ আগে থেকেই আছে" : "✓ যোগ হয়েছে";
    toast(res === "exists" ? `"${word}" আগে থেকেই আপনার রিভিউতে আছে।` : `"${word}" Smart Review-এ যোগ হয়েছে।`, "info");
  } catch (e) {
    console.warn("save word failed", e);
    btn.disabled = false;
    toast("শব্দটি সেভ করা যায়নি, আবার চেষ্টা করুন।", "error");
  }
}
function closeAllTooltips() {
  document.querySelectorAll(".vocab-tooltip").forEach(t => t.remove());
}

/* ══════════════════════════════════════
   FINISH READING → SHOW QUIZ
══════════════════════════════════════ */
function finishReading() {
  stopTTS();
  const secs = Math.round((Date.now() - readStartTime) / 1000);
  measuredWpm = wpmOf(currentPassage.text.join(" ").split(/\s+/).length, secs);
  document.getElementById("btn-finish-reading").disabled = true;
  document.getElementById("btn-finish-reading").textContent = "✓ সম্পন্ন";
  document.getElementById("quiz-panel").classList.add("show");
  document.getElementById("quiz-result").classList.remove("show");
  loadQuestion(0);
  document.getElementById("quiz-panel").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ══════════════════════════════════════
   QUIZ LOGIC
══════════════════════════════════════ */
function loadQuestion(idx) {
  quizIdx      = idx;
  quizAnswered = false;
  const quiz   = currentPassage.quiz;
  const q      = quiz[idx];

  document.getElementById("quiz-progress-dots").innerHTML = quiz.map((_, i) =>
    `<div class="qpd ${i < idx ? "done" : i === idx ? "current" : ""}"></div>`
  ).join("");

  document.getElementById("quiz-q-num").textContent = `প্রশ্ন ${idx + 1}/${quiz.length}`;
  document.getElementById("quiz-q").textContent = q.q;

  const letters = ["A", "B", "C", "D"];
  document.getElementById("quiz-opts").innerHTML = q.opts.map((opt, i) => `
    <div class="quiz-opt" data-idx="${i}">
      <span class="opt-letter">${letters[i]}</span>
      <span>${opt}</span>
    </div>`).join("");

  document.getElementById("quiz-exp").classList.remove("show");
  document.getElementById("btn-next-q").style.display = "none";
}

function answerQuestion(idx) {
  if (quizAnswered) return;
  quizAnswered = true;
  const q = currentPassage.quiz[quizIdx];
  const opts = document.querySelectorAll(".quiz-opt");

  opts.forEach((opt, i) => {
    opt.classList.add("disabled");
    if (i === q.ans) opt.classList.add("correct");
    else if (i === idx) opt.classList.add("wrong");
  });

  if (idx === q.ans) quizScore++;

  const expEl = document.getElementById("quiz-exp");
  expEl.textContent = "💡 " + q.exp;
  expEl.classList.add("show");

  document.getElementById("btn-next-q").style.display = "inline-flex";
  document.getElementById("btn-next-q").textContent =
    quizIdx < currentPassage.quiz.length - 1 ? "পরের প্রশ্ন →" : "ফলাফল দেখুন 🎉";
}

function nextQuestion() {
  if (quizIdx < currentPassage.quiz.length - 1) {
    loadQuestion(quizIdx + 1);
  } else {
    showQuizResult();
  }
}

async function showQuizResult() {
  document.getElementById("quiz-progress-dots").parentElement.style.display = "none";
  document.querySelector(".quiz-body").style.display = "none";
  const result = document.getElementById("quiz-result");
  result.classList.add("show");

  const total = currentPassage.quiz.length;
  const pct   = Math.round((quizScore / total) * 100);
  const emoji = pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "📖";

  document.getElementById("qr-emoji").textContent = emoji;
  document.getElementById("qr-score").textContent  = `${quizScore}/${total} সঠিক`;
  document.getElementById("qr-sub").textContent =
    pct >= 80 ? "অসাধারণ! তুমি passage টা খুব ভালো বুঝেছো।" :
    pct >= 50 ? "ভালো করেছো! আরেকটু practice করলে আরও ভালো হবে।" :
    "আরেকবার passage টা পড়ে দেখো, তুমি পারবে!";

  const wpmEl = document.getElementById("qr-wpm");
  if (wpmEl) wpmEl.textContent = wpmFeedback(measuredWpm, currentPassage.level);
  await saveCompletion();
  markPracticed();
}

/* tell the daily plan that reading was practised today (works even for re-reads) */
async function markPracticed() {
  if (!currentUser) return;
  try { await updateDoc(doc(db, "users", currentUser.uid), { "planHistory.reading": isoDay() }); }
  catch (e) { console.warn("plan history not saved", e); }
}

/* ══════════════════════════════════════
   BOOKMARK TOGGLE
══════════════════════════════════════ */
async function toggleBookmark(passageId) {
  if (!currentUser) return;
  const isBookmarked = bookmarkedPassages.has(passageId);

  // optimistic UI update
  if (isBookmarked) bookmarkedPassages.delete(passageId);
  else bookmarkedPassages.add(passageId);
  refreshBookmarkUI(passageId);

  try {
    await updateDoc(doc(db, "users", currentUser.uid), {
      "readingProgress.bookmarks": isBookmarked ? arrayRemove(passageId) : arrayUnion(passageId)
    });
    toast(isBookmarked ? "🏷️ Bookmark সরানো হয়েছে।" : "🔖 Bookmark করা হয়েছে।", "info");
  } catch (e) {
    // revert on failure
    if (isBookmarked) bookmarkedPassages.add(passageId);
    else bookmarkedPassages.delete(passageId);
    refreshBookmarkUI(passageId);
    toast("❌ Bookmark save failed: " + e.message, "error");
  }
}

function refreshBookmarkUI(passageId) {
  const bookmarked = bookmarkedPassages.has(passageId);

  // card icon (only present if this passage is currently rendered in the grid)
  const cardBtn = document.querySelector(`.pc-bookmark-btn[data-bookmark-id="${passageId}"]`);
  if (cardBtn) {
    cardBtn.classList.toggle("active", bookmarked);
    cardBtn.textContent = bookmarked ? "🔖" : "🏷️";
    cardBtn.title = bookmarked ? "Bookmark সরান" : "Bookmark করুন";
  }

  // reader screen icon (only relevant if this is the currently open passage)
  if (currentPassage && currentPassage.id === passageId) {
    const readerBtn = document.getElementById("reader-bookmark-btn");
    if (readerBtn) {
      readerBtn.classList.toggle("active", bookmarked);
      readerBtn.textContent = bookmarked ? "🔖" : "🏷️";
    }
  }

  // if the "bookmarked only" filter is active and we just unbookmarked, refresh grid
  if (showBookmarkedOnly) buildPassageGrid();
}

/* ══════════════════════════════════════
   SAVE COMPLETION → FIRESTORE
══════════════════════════════════════ */
async function saveCompletion() {
  if (!currentUser || completedReadings.has(currentPassage.id)) return;

  const xp = currentPassage.xp;
  const wpm = measuredWpm;   // measured when reading finished; 0 when the timing was not believable

  completedReadings.add(currentPassage.id);

  try {
    await addDoc(collection(db, "reading_sessions"), {
      uid:          currentUser.uid,
      displayName:  currentUser.displayName || "",
      passageId:    currentPassage.id,
      passageTitle: currentPassage.title,
      category:     currentPassage.category,
      level:        currentPassage.level,
      quizScore:    quizScore,
      quizTotal:    currentPassage.quiz.length,
      wpm:          wpm,
      xpEarned:     xp,
      completedAt:  serverTimestamp()
    });

    await updateDoc(doc(db, "users", currentUser.uid), {
      xp:                       increment(xp),
      readCount:                increment(1),
      "readingProgress.done":   arrayUnion(currentPassage.id)
    });

    totalXP += xp;
    totalReadCount++;
    updateHeroStats();
    updateLastWpm(wpm);
    toast(`✅ Passage complete! +${xp} XP 🎉`);
  } catch (e) {
    toast("❌ Save failed: " + e.message, "error");
  }
}

function updateLastWpm(wpm) {
  const el = document.getElementById("st-wpm");
  if (el && wpm > 0) el.textContent = wpm;
}

/* ══════════════════════════════════════
   EVENT DELEGATION
══════════════════════════════════════ */
document.addEventListener("click", function (e) {
  // bookmark icon on a passage card (must check before passage-card click so it doesn't also open the reader)
  const bookmarkIcon = e.target.closest(".pc-bookmark-btn");
  if (bookmarkIcon) {
    e.stopPropagation();
    toggleBookmark(bookmarkIcon.dataset.bookmarkId);
    return;
  }

  // bookmark icon inside the reader screen
  const readerBookmarkBtn = e.target.closest("#reader-bookmark-btn");
  if (readerBookmarkBtn && currentPassage) {
    toggleBookmark(currentPassage.id);
    return;
  }

  // passage card click
  const card = e.target.closest(".passage-card");
  if (card) { openPassage(card.dataset.id); return; }

  // bookmark filter toggle
  const bookmarkFilterBtn = e.target.closest("#bookmark-filter-btn");
  if (bookmarkFilterBtn) {
    showBookmarkedOnly = !showBookmarkedOnly;
    bookmarkFilterBtn.classList.toggle("active", showBookmarkedOnly);
    buildPassageGrid();
    return;
  }

  // category tab
  const catTab = e.target.closest(".cat-tab");
  if (catTab) {
    activeCat = catTab.dataset.cat;
    buildTabs(); buildPassageGrid();
    return;
  }

  // level tab
  const lvlTab = e.target.closest(".lvl-tab");
  if (lvlTab) {
    activeLevel = lvlTab.dataset.lvl;
    buildTabs(); buildPassageGrid();
    return;
  }

  // "save to review" button inside a vocab tooltip
  const saveBtn = e.target.closest(".vt-save");
  if (saveBtn) { e.stopPropagation(); saveVocabWord(saveBtn); return; }

  // vocab word
  const vocabWord = e.target.closest(".vocab-word");
  if (vocabWord) { showVocabTooltip(vocabWord); e.stopPropagation(); return; }
  if (!e.target.closest(".vocab-tooltip")) closeAllTooltips();

  // click a sentence to jump narration there (ignore if clicking inside vocab word, handled above)
  const sentenceEl = e.target.closest(".tts-sentence");
  if (sentenceEl && document.getElementById("reader-screen").classList.contains("show")) {
    jumpToSentence(parseInt(sentenceEl.dataset.sidx));
  }

  // audio progress track click → seek
  const track = e.target.closest("#audio-bar-track");
  if (track && ttsSentences.length) {
    const rect = track.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const idx = Math.min(ttsSentences.length - 1, Math.floor(pct * ttsSentences.length));
    jumpToSentence(idx);
    return;
  }

  // speed buttons
  const speedBtn = e.target.closest(".speed-btn");
  if (speedBtn) { setTTSRate(parseFloat(speedBtn.dataset.speed)); return; }

  // quiz option
  const quizOpt = e.target.closest(".quiz-opt");
  if (quizOpt && !quizOpt.classList.contains("disabled")) {
    answerQuestion(parseInt(quizOpt.dataset.idx));
    return;
  }

  // data-action buttons
  const actionEl = e.target.closest("[data-action]");
  if (actionEl) {
    switch (actionEl.dataset.action) {
      case "back-to-list":  closeReader(); break;
      case "finish-reading": finishReading(); break;
      case "next-q":         nextQuestion(); break;
      case "go-profile":     window.location.href = "profile.html"; break;
      case "logout":         signOut(auth).then(() => window.location.href = "index.html"); break;
      case "tts-toggle":     toggleTTS(); break;
      case "tts-stop":       stopTTS(); break;
    }
  }
});

document.getElementById("search-input").addEventListener("input", e => {
  searchQuery = e.target.value.trim();
  buildPassageGrid();
});

/* ══════════════════════════════════════
   FOOTER YEAR
══════════════════════════════════════ */
const y = new Date().getFullYear();
document.getElementById("footer-year").textContent  = y;
document.getElementById("footer-year2").textContent = y;

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
requireAuth(async user => {
  currentUser = user;
  document.getElementById("nav-name").textContent = user.displayName || (user.email ? user.email.split("@")[0] : "Guest");
  const av = document.getElementById("nav-avatar");
  const safePhoto = safeImageUrl(user.photoURL);
  if (safePhoto) { av.style.backgroundImage = `url("${safePhoto}")`; av.style.backgroundSize = "cover"; av.textContent = ""; }

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const d = snap.data();
      totalXP        = d.xp || 0;
      totalReadCount = d.readCount || 0;
      const rp = d.readingProgress || {};
      (rp.done || []).forEach(id => completedReadings.add(id));
      (rp.bookmarks || []).forEach(id => bookmarkedPassages.add(id));
      const myLevel = readingLevelFor(d.learningProfile && d.learningProfile.level);   // start on the learner's own level
      if (myLevel) activeLevel = myLevel;
    }
  } catch (e) { console.warn(e); }

  updateHeroStats();
  buildTabs();
  buildPassageGrid();
});
