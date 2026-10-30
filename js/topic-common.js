/* =============================================
   SHARED TOPIC LESSON PAGE LOGIC
   Used by /topics/<level>/<topic>.html

   Phase 8 flow on every topic page:
     Learn → Example → Practice → Mistake analysis → Mini challenge → Mastery
   The lesson content of each page is untouched; this script adds the
   practice loop around the existing .practice-q questions.
============================================= */
import {
  auth, db, doc, getDoc, setDoc, updateDoc, getDocs, collection, query, where, limit,
  increment, arrayUnion, requireAuth, signOut, toast
} from "./firebase-config.js";
import {
  STAGES, pct, masteryLevel, resultMessage, questionKey, topicKey, buildMistake, mistakeIsValid,
  mergeMastery, shuffled, stageFor
} from "../learning/grammar-practice.js";
import { isoDay } from "../learning/srs.js";

/* ── shared state for the page ── */
const S = {
  cfg: null, uid: null, ref: null,
  total: 0, answered: 0, results: [],
  finished: false, challengeOpen: false, challengeDone: false,
  mastery: {}, mistakes: {},          // mistakes: questionKey → { fixed }
  attempt: 0,
};

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const bn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const isHttp = (u) => /^https?:\/\//i.test(String(u || ""));

/**
 * Initialize a topic lesson page.
 * @param {Object} cfg
 * @param {string} cfg.id     - topic id, e.g. "a1-t1"
 * @param {number} cfg.xp     - XP reward for completing this topic
 */
export function initTopic(cfg) {
  S.cfg = cfg;
  S.total = document.querySelectorAll(".practice-q").length;

  /*  scroll progress bar  */
  const bar = document.getElementById("prog");
  if (bar) {
    window.addEventListener("scroll", () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pctScroll = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, pctScroll)) + "%";
    });
  }

  injectStyles();
  buildStepper();
  rememberOriginals();

  requireAuth(async (user) => {
    S.uid = user.uid;
    const ref = doc(db, "users", user.uid);
    S.ref = ref;
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};

    /*  avatar / name in topbar (DOM only — no HTML injection)  */
    const av = document.getElementById("nav-av");
    if (av) {
      const photo = data.photoURL || user.photoURL || "";
      const name = data.displayName || user.displayName || "Learner";
      av.textContent = "";
      if (isHttp(photo)) {
        const img = document.createElement("img");
        img.src = photo; img.alt = "";
        av.appendChild(img);
      } else {
        av.textContent = (name[0] || "?").toUpperCase();
      }
      av.onclick = () => (location.href = "../../profile.html");
    }

    /*  logout  */
    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
      logoutBtn.onclick = async () => {
        await signOut(auth);
        location.href = "../../index.html";
      };
    }

    const gp = data.grammarProgress || {};
    S.mastery = gp.mastery || {};
    loadMistakes().catch((e) => console.warn("mistakes not loaded", e));
    showPreviousResult();

    /*  mark-complete button  */
    const done = gp.done || [];
    const btn = document.getElementById("complete-btn");
    if (btn) {
      btn.dataset.label = btn.textContent;
      if (done.includes(cfg.id)) {
        setBtnDone(btn);
      } else {
        // XP only after the practice has been worked through (no more one-click XP)
        if (S.total > 0 && !S.finished) lockComplete(btn);
        btn.addEventListener("click", async () => {
          if (btn.disabled) return;
          btn.disabled = true;
          btn.textContent = "⏳ Saving...";
          try {
            await updateDoc(ref, {
              xp: increment(cfg.xp),
              "grammarProgress.done": arrayUnion(cfg.id),
            });
            setBtnDone(btn);
            toast(`🎉 অভিনন্দন! +${cfg.xp} XP পেয়েছেন।`);
          } catch (e) {
            console.error(e);
            btn.disabled = false;
            btn.textContent = btn.dataset.label || "✅ সম্পন্ন করুন";
            toast("কিছু ভুল হয়েছে, আবার চেষ্টা করুন।", "error");
          }
        });
      }
    }
  });
}

function setBtnDone(btn) {
  btn.textContent = "✅ সম্পন্ন হয়েছে";
  btn.disabled = true;
  btn.classList.add("done");
}
function lockComplete(btn) {
  btn.disabled = true;
  btn.textContent = "🔒 আগে অনুশীলন শেষ করুন";
  btn.title = "উপরের সবগুলো প্রশ্নের উত্তর দিলে এই বাটন চালু হবে";
}
function unlockComplete() {
  const btn = document.getElementById("complete-btn");
  if (!btn || btn.classList.contains("done")) return;
  btn.disabled = false;
  btn.textContent = btn.dataset.label || "✅ সম্পন্ন করুন";
  btn.title = "";
}

/* ───────────────────────── styles + stepper ───────────────────────── */
function injectStyles() {
  if (document.getElementById("gp-style")) return;
  const st = document.createElement("style");
  st.id = "gp-style";
  st.textContent = `
  .gp-steps{display:flex;gap:6px;flex-wrap:wrap;list-style:none;margin:0 0 16px;padding:0;font-size:12.5px}
  .gp-steps li{padding:5px 11px;border-radius:99px;border:1px solid var(--es-border-strong,rgba(255,255,255,.16));color:var(--es-muted,#737aa3);background:var(--es-surface-1,transparent)}
  .gp-steps li.done{color:var(--es-success,#34d399);border-color:rgba(52,211,153,.4)}
  .gp-steps li[aria-current="step"]{color:#fff;background:linear-gradient(135deg,#5b5bff,#8b5cf6);border-color:transparent;font-weight:700}
  #gp-panel{margin-top:18px;padding:18px;border-radius:16px;border:1px solid var(--es-border-strong,rgba(255,255,255,.16));background:var(--es-surface-2,rgba(255,255,255,.04))}
  #gp-panel h3{margin:0 0 6px;font-size:18px}
  #gp-panel h4{margin:16px 0 8px;font-size:15px;color:var(--es-indigo-300,#a5abff)}
  .gp-score{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .gp-score b{font-size:30px;line-height:1}
  .gp-badge{padding:3px 11px;border-radius:99px;font-size:12.5px;font-weight:700;background:rgba(124,131,255,.16);border:1px solid rgba(124,131,255,.35)}
  .gp-badge.mastered{background:rgba(52,211,153,.16);border-color:rgba(52,211,153,.4);color:#34d399}
  .gp-msg{margin:8px 0 0;color:var(--es-sub,#aab1d6)}
  .gp-miss{padding:10px 12px;margin-bottom:8px;border-radius:12px;background:rgba(251,113,133,.07);border:1px solid rgba(251,113,133,.25)}
  .gp-miss .q{font-weight:600;margin-bottom:4px}
  .gp-miss .a{font-size:14px}
  .gp-miss .a .bad{color:#fb7185} .gp-miss .a .good{color:#34d399}
  .gp-miss .why{margin-top:4px;font-size:13.5px;color:var(--es-sub,#aab1d6)}
  .gp-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
  .gp-btn{padding:10px 16px;border-radius:12px;cursor:pointer;font:600 14px/1.2 inherit;color:#fff;border:0;background:linear-gradient(135deg,#5b5bff,#8b5cf6)}
  .gp-btn.alt{background:transparent;border:1px solid var(--es-border-strong,rgba(255,255,255,.2));color:var(--es-text,#eef0ff)}
  .gp-ch-opts{display:grid;gap:8px;margin:10px 0}
  .gp-ch-opt{text-align:left;padding:11px 14px;border-radius:12px;cursor:pointer;font:inherit;color:var(--es-text,#eef0ff);background:var(--es-surface-1,transparent);border:1px solid var(--es-border-strong,rgba(255,255,255,.16))}
  .gp-ch-opt.correct{border-color:#34d399;background:rgba(52,211,153,.14)} .gp-ch-opt.wrong{border-color:#fb7185;background:rgba(251,113,133,.14)}
  .gp-prev{margin:0 0 14px;font-size:13.5px;color:var(--es-sub,#aab1d6)}
  `;
  document.head.appendChild(st);
}

let stepEls = {};
function buildStepper() {
  const first = document.querySelector(".card");
  if (!first || document.getElementById("gp-steps") || S.total === 0) return;
  const ol = el("ol", "gp-steps"); ol.id = "gp-steps"; ol.setAttribute("aria-label", "শেখার ধাপ");
  STAGES.forEach((s, i) => { const li = el("li", null, `${bn(i + 1)}. ${s.label}`); li.dataset.stage = s.id; stepEls[s.id] = li; ol.appendChild(li); });
  first.before(ol);
  setStage("learn");
}
function setStage(id) {
  const order = STAGES.map((s) => s.id), at = order.indexOf(id);
  order.forEach((sid, i) => {
    const li = stepEls[sid]; if (!li) return;
    li.classList.toggle("done", i < at || (id === "mastery" && i <= at));
    if (i === at && id !== "mastery") li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
  });
  if (id === "mastery" && stepEls.mastery) stepEls.mastery.setAttribute("aria-current", "step");
}
function refreshStage() {
  const wrong = S.results.filter((r) => !r.correct).length;
  setStage(stageFor({ answered: S.answered, total: S.total, wrong, challengeOpen: S.challengeOpen, challengeDone: S.challengeDone }));
}

/* ───────────────────────── page ↔ question helpers ───────────────────────── */
function rememberOriginals() {
  document.querySelectorAll(".practice-q").forEach((q) => {
    q.querySelectorAll(".pq-opt").forEach((o) => { o.dataset.origClass = o.className; });
    const f = q.querySelector(".pq-feedback"); if (f) f.dataset.origClass = f.className;
  });
}

function infoOf(wrap, picked) {
  const optEls = [...wrap.querySelectorAll(".pq-opt")];
  const correctEl = wrap.querySelector("[data-correct='1']");
  const fb = wrap.querySelector(".pq-feedback");
  return {
    text: (wrap.querySelector(".pq-text")?.textContent || "").replace(/\s+/g, " ").trim(),
    opts: optEls.map((o) => o.textContent.replace(/\s+/g, " ").trim()),
    picked: picked.textContent.replace(/\s+/g, " ").trim(),
    answer: correctEl ? correctEl.textContent.replace(/\s+/g, " ").trim() : "",   // the right option's text (r.correct is the boolean "was it right")
    // the page text is written for the "right answer" state ("✅ ঠিক! …"); drop that praise prefix so it also reads well beside a wrong answer
    why: (fb?.textContent || "").replace(/\s+/g, " ").trim().replace(/^(?:✅|✔️?|☑️)?\s*(?:ঠিক|সঠিক)\s*[!।]?\s*/u, ""),
  };
}

/**
 * Handle a click on a practice-quiz option (.pq-opt).
 * Usage: onclick="pq(this, true)"  /  onclick="pq(this, false)"
 * Marks the clicked option correct/wrong, reveals the right answer,
 * shows the feedback box, and disables the rest of the options.
 * When the LAST question is answered the mistake analysis opens.
 */
window.pq = function (elOpt, isCorrect) {
  const wrap = elOpt.closest(".practice-q");
  const opts = wrap.querySelectorAll(".pq-opt");
  const feedback = wrap.querySelector(".pq-feedback");

  if (wrap.dataset.answered === "1") return; // already answered
  wrap.dataset.answered = "1";

  opts.forEach((o) => (o.style.pointerEvents = "none"));

  if (isCorrect) {
    elOpt.classList.add("correct");
  } else {
    elOpt.classList.add("wrong");
    const correctOpt = wrap.querySelector("[data-correct='1']");
    if (correctOpt) correctOpt.classList.add("correct");
  }

  if (feedback) {
    feedback.classList.add("show", isCorrect ? "correct" : "wrong");
  }

  // score line on the page (kept from the original behaviour)
  window.__pqTotal = (window.__pqTotal || 0) + 1;
  if (isCorrect) window.__pqCorrect = (window.__pqCorrect || 0) + 1;
  const scoreEl = document.getElementById("pq-score");
  if (scoreEl) {
    scoreEl.textContent = "";
    scoreEl.append("Score: ", Object.assign(document.createElement("b"), { textContent: `${window.__pqCorrect || 0} / ${window.__pqTotal}` }));
  }

  S.results.push({ ...infoOf(wrap, elOpt), correct: !!isCorrect });
  S.answered++;
  refreshStage();
  if (S.answered >= S.total && !S.finished) finishPractice();
};

/* ───────────────────────── results + mistake analysis ───────────────────────── */
function panelHost() {
  const score = document.getElementById("pq-score");
  const lastQ = [...document.querySelectorAll(".practice-q")].pop();
  return score || lastQ;
}
function removePanel() { document.getElementById("gp-panel")?.remove(); }

function finishPractice() {
  S.finished = true; S.attempt++;
  const correct = S.results.filter((r) => r.correct).length;
  const p = pct(correct, S.total);
  const wrong = S.results.filter((r) => !r.correct);
  refreshStage();
  unlockComplete();

  removePanel();
  const panel = el("div"); panel.id = "gp-panel"; panel.setAttribute("aria-live", "polite");
  panel.appendChild(el("h3", null, "📊 অনুশীলনের ফল"));
  const sc = el("div", "gp-score");
  const lv = masteryLevel(p);
  sc.append(el("b", null, `${bn(correct)} / ${bn(S.total)}`), el("span", null, `${bn(p)}%`), el("span", "gp-badge " + lv.id, `${lv.icon} ${lv.label}`));
  panel.append(sc, el("p", "gp-msg", resultMessage(correct, S.total)));

  if (wrong.length) {
    panel.appendChild(el("h4", null, "🔎 ভুল বিশ্লেষণ"));
    wrong.forEach((r) => {
      const box = el("div", "gp-miss");
      box.appendChild(el("div", "q", r.text));
      const a = el("div", "a");
      a.append("আপনি বেছেছিলেন: ", el("span", "bad", r.picked), " · সঠিক উত্তর: ", el("span", "good", r.answer));
      box.appendChild(a);
      if (r.why) box.appendChild(el("div", "why", r.why));
      panel.appendChild(box);
    });
  }

  const actions = el("div", "gp-actions");
  if (wrong.length) {
    const ch = el("button", "gp-btn", "🎯 মিনি চ্যালেঞ্জ: ভুলগুলো আবার করি"); ch.type = "button";
    ch.onclick = () => startChallenge(panel, wrong);
    actions.appendChild(ch);
  }
  const again = el("button", "gp-btn alt", "↺ সব প্রশ্ন আবার"); again.type = "button";
  again.onclick = retryAll;
  actions.appendChild(again);
  panel.appendChild(actions);
  panelHost().after(panel);
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });

  persistAttempt(p, S.results).catch((e) => console.warn("persist failed", e));
}

/* ───────────────────────── mini challenge ───────────────────────── */
function startChallenge(panel, wrong) {
  S.challengeOpen = true; refreshStage();
  const items = shuffled(wrong);
  let i = 0, fixed = 0;
  const fixedList = [];
  const stage = el("div"); stage.id = "gp-challenge";
  panel.querySelector("#gp-challenge")?.remove();
  panel.appendChild(stage);

  const next = () => {
    stage.textContent = "";
    if (i >= items.length) {
      S.challengeDone = true; refreshStage();
      stage.append(el("h4", null, "🎯 মিনি চ্যালেঞ্জ শেষ"),
        el("p", "gp-msg", fixed === items.length
          ? `🎉 দারুণ! ${bn(fixed)}টি ভুলই এবার ঠিক হয়েছে।`
          : `${bn(items.length)}টির মধ্যে ${bn(fixed)}টি এবার ঠিক হয়েছে। বাকিগুলো "ভুল থেকে শেখা" পেজে আবার আসবে।`));
      persistFixed(fixedList).catch((e) => console.warn(e));
      return;
    }
    const r = items[i];
    stage.append(el("h4", null, `🎯 মিনি চ্যালেঞ্জ · ${bn(i + 1)} / ${bn(items.length)}`));
    const q = el("div", "q", r.text); q.style.fontWeight = "600"; stage.appendChild(q);
    const box = el("div", "gp-ch-opts");
    const info = el("div", "gp-miss"); info.hidden = true;
    shuffled(r.opts).forEach((o) => {
      const b = el("button", "gp-ch-opt", o); b.type = "button";
      b.onclick = () => {
        box.querySelectorAll("button").forEach((x) => (x.disabled = true));
        const right = o === r.answer;
        b.classList.add(right ? "correct" : "wrong");
        if (!right) [...box.children].find((x) => x.textContent === r.answer)?.classList.add("correct");
        if (right) { fixed++; fixedList.push(r); }
        info.textContent = ""; info.hidden = false;
        info.appendChild(el("div", "a", right ? "✅ ঠিক!" : "❌ সঠিক উত্তরটি সবুজ দাগ দেওয়া।"));
        if (r.why) info.appendChild(el("div", "why", r.why));
        const nx = el("button", "gp-btn", i + 1 < items.length ? "পরের প্রশ্ন →" : "শেষ করি"); nx.type = "button"; nx.style.marginTop = "8px";
        nx.onclick = () => { i++; next(); };
        info.appendChild(nx);
      };
      box.appendChild(b);
    });
    stage.append(box, info);
  };
  next();
}

/* ───────────────────────── retry ───────────────────────── */
function retryAll() {
  removePanel();
  document.querySelectorAll(".practice-q").forEach((q) => {
    delete q.dataset.answered;
    const optsWrap = q.querySelector(".pq-options");
    const optEls = [...q.querySelectorAll(".pq-opt")];
    optEls.forEach((o) => { o.className = o.dataset.origClass || "pq-opt"; o.style.pointerEvents = ""; });
    if (optsWrap) shuffled(optEls).forEach((o) => optsWrap.appendChild(o));   // new order so positions can't be memorised
    const f = q.querySelector(".pq-feedback"); if (f) f.className = f.dataset.origClass || "pq-feedback";
  });
  window.__pqTotal = 0; window.__pqCorrect = 0;
  const scoreEl = document.getElementById("pq-score");
  if (scoreEl) { scoreEl.textContent = ""; scoreEl.append("Score: ", Object.assign(document.createElement("b"), { textContent: "0 / 0" })); }
  S.results = []; S.answered = 0; S.finished = false; S.challengeOpen = false; S.challengeDone = false;
  refreshStage();
  document.querySelector(".practice-q")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ───────────────────────── persistence ───────────────────────── */
const mistakeRef = (key) => doc(db, "users", S.uid, "grammarMistakes", key);

async function loadMistakes() {
  const snap = await getDocs(query(collection(db, "users", S.uid, "grammarMistakes"), where("topic", "==", S.cfg.id), limit(40)));
  snap.docs.forEach((d) => { S.mistakes[d.id] = { fixed: !!d.data().fixed }; });
}

function showPreviousResult() {
  const m = S.mastery[topicKey(S.cfg.id)];
  const first = document.querySelector(".practice-q");
  if (!m || !first || document.getElementById("gp-prev")) return;
  const lv = masteryLevel(Number(m.best) || 0);
  const p = el("div", "gp-prev", `আপনার সর্বোচ্চ ফল: ${bn(m.best)}% · ${lv.icon} ${lv.label} · ${bn(m.attempts)}বার চেষ্টা`);
  p.id = "gp-prev";
  first.before(p);
}

async function persistAttempt(percent, results) {
  if (!S.uid) return;
  const today = isoDay();
  const mk = topicKey(S.cfg.id);
  try {
    const merged = mergeMastery(S.mastery[mk], percent, today);
    await updateDoc(S.ref, { ["grammarProgress.mastery." + mk]: merged });
    S.mastery[mk] = merged;
  } catch (e) { console.warn("mastery save failed", e); toast("অগ্রগতি সেভ করা যায়নি।", "error"); }

  let opened = 0, closed = 0;
  for (const r of results) {
    const key = questionKey(S.cfg.id, r.text);
    const known = S.mistakes[key];
    try {
      if (!r.correct) {
        const m = buildMistake({ topicId: S.cfg.id, text: r.text, opts: r.opts, picked: r.picked, correct: r.answer, why: r.why }, today);
        if (!mistakeIsValid(m)) continue;
        await setDoc(mistakeRef(key), { ...m, count: increment(1) }, { merge: true });
        if (!known || known.fixed) opened++;
        S.mistakes[key] = { fixed: false };
      } else if (known && !known.fixed) {
        await setDoc(mistakeRef(key), { fixed: true, last: today }, { merge: true });
        S.mistakes[key] = { fixed: true }; closed++;
      }
    } catch (e) { console.warn("mistake save failed", key, e); }
  }
  await adjustOpen(opened - closed);
}

async function persistFixed(list) {
  if (!S.uid || !list.length) return;
  const today = isoDay();
  let closed = 0;
  for (const r of list) {
    const key = questionKey(S.cfg.id, r.text);
    if (S.mistakes[key] && !S.mistakes[key].fixed) {
      try { await setDoc(mistakeRef(key), { fixed: true, last: today }, { merge: true }); S.mistakes[key] = { fixed: true }; closed++; }
      catch (e) { console.warn(e); }
    }
  }
  await adjustOpen(-closed);
}

async function adjustOpen(delta) {
  if (!delta) return;
  try { await updateDoc(S.ref, { "grammarProgress.openMistakes": increment(delta) }); }
  catch (e) { console.warn("open-mistake counter not saved", e); }
}
