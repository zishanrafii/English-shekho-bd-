/* ══════════════════════════════════════════════════════════
   WRITING LAB — SHARED MODULE
   Common logic used by every writing module page:
   sentence-builder.html, paragraph-writing.html,
   essay-writing.html, email-writing.html, story-writing.html
   ══════════════════════════════════════════════════════════ */
import {
  requireAuth, auth, db,
  doc, setDoc, getDoc, updateDoc,
  collection, addDoc,
  serverTimestamp, increment, arrayUnion,
  signOut
} from "./firebase-config.js";
import { renderCheck } from "../writing/ui.js";
import { saveMistakes } from "../writing/save.js";
import { check as ruleCheck, metrics as textMetrics, lengthTarget } from "../writing/analyzer.js";
import { tickPlan } from "../learning/plan-tick.js";
import { isoDay } from "../learning/srs.js";
import { safeImageUrl } from "./reading-tools-compat.js";

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
export function toast(msg, type="success"){
  if(window._fbToast){ window._fbToast(msg, type); return; }
  const t = document.getElementById("toast");
  if(!t) return;
  t.textContent = msg; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 2800);
}

/* ══════════════════════════════════════
   PAGE SETUP — topbar avatar/name, logout, footer year
   Call once per page. onUserReady(user) runs after auth check.
══════════════════════════════════════ */
export function setupCommonPage(onUserReady){
  const yr = new Date().getFullYear();
  const fy1 = document.getElementById("footer-year");
  const fy2 = document.getElementById("footer-year2");
  if(fy1) fy1.textContent = yr;
  if(fy2) fy2.textContent = yr;

  const logoutBtn = document.getElementById("btn-logout");
  if(logoutBtn){
    logoutBtn.onclick = async () => {
      await signOut(auth);
      window.location.href = "index.html";
    };
  }

  requireAuth(async (user, d) => {
    window._currentUser = user;
    window._userDoc = d || {};                                        // learning profile, writing stats …
    { const pc = document.getElementById("public-checkbox"); if (pc && user.isAnonymous) { const lab = pc.closest("label"); if (lab) lab.hidden = true; pc.checked = false; } }   // guests cannot publish to the community
    const nameEl = document.getElementById("nav-name");
    if(nameEl) nameEl.textContent = user.displayName || (user.email ? user.email.split("@")[0] : "Guest");
    const avatar = document.getElementById("nav-avatar");
    if(avatar && safeImageUrl(user.photoURL)){
      avatar.style.backgroundImage = `url("${safeImageUrl(user.photoURL)}")`;
      avatar.style.backgroundSize  = "cover";
      avatar.textContent = "";
    }
    if(onUserReady) await onUserReady(user);
  });
}

/* ══════════════════════════════════════
   EDITOR STATE
══════════════════════════════════════ */
let currentTask = null;
export function getCurrentTask(){ return currentTask; }

/* ══════════════════════════════════════
   GENERIC EDITOR — tabs + prompt + hints
   Every editor-based page (paragraph/essay/email/story)
   uses fixed element IDs: #task-tabs, #prompt, #hints,
   #main-editor, #word-count, #feedback-panel
══════════════════════════════════════ */
export function initEditor(tasks){
  const tabsEl = document.getElementById("task-tabs");
  tabsEl.innerHTML = tasks.map((t,i)=>`<div class="task-tab ${i===0?'active':''}" data-idx="${i}">${t.label}</div>`).join("");
  tabsEl.querySelectorAll(".task-tab").forEach(tab=>{
    tab.addEventListener("click",()=>{
      tabsEl.querySelectorAll(".task-tab").forEach(t=>t.classList.remove("active"));
      tab.classList.add("active");
      loadEditorTask(tasks, parseInt(tab.dataset.idx));
    });
  });
  loadEditorTask(tasks, 0);
}

export function loadEditorTask(tasks, idx){
  currentTask = tasks[idx];
  const t = currentTask;
  const promptEl = document.getElementById("prompt");
  const hintsEl  = document.getElementById("hints");

  promptEl.innerHTML = `
    <div class="prompt-card">
      <div class="prompt-eyebrow">✍️ Writing Prompt</div>
      <div class="prompt-title">${t.label}</div>
      <div class="prompt-desc">${t.prompt}</div>
      <div class="prompt-meta">
        <span class="pmeta-tag pt-level">${t.level}</span>
        <span class="pmeta-tag pt-words">📝 ${t.words} words</span>
        <span class="pmeta-tag pt-xp">⚡ +${t.xp} XP</span>
      </div>
    </div>`;

  if(hintsEl && t.hints){
    hintsEl.innerHTML = t.hints.map(h=>`
      <div class="hint-item"><span class="hint-icon">${h.icon}</span><div class="hint-text">${h.text}</div></div>
    `).join("");
    if(t.usefulWords){
      hintsEl.innerHTML += `
        <div class="useful-words">
          <div class="uw-title">Useful Words</div>
          <div class="uw-chips">${t.usefulWords.map(w=>`<span class="uw-chip" data-action="insert-word" data-word="${w}">${w}</span>`).join("")}</div>
        </div>`;
    }
  }

  // clear editor
  const editorEl = document.getElementById("main-editor");
  if(editorEl) editorEl.value = "";
  const wcEl = document.getElementById("word-count");
  if(wcEl) wcEl.textContent = "0";

  // hide feedback
  const fp = document.getElementById("feedback-panel");
  if(fp) fp.classList.remove("show");
}

/* ══════════════════════════════════════
   EDITOR UTILS
══════════════════════════════════════ */
export function updateWordCount(){
  const el = document.getElementById("main-editor");
  if(!el) return;
  const words = el.value.trim().split(/\s+/).filter(Boolean).length;
  const cEl = document.getElementById("word-count");
  if(cEl) cEl.textContent = words;
}

export function insertText(before, after){
  const el = document.getElementById("main-editor");
  if(!el) return;
  const s = el.selectionStart, e = el.selectionEnd;
  const sel = el.value.substring(s, e);
  el.value = el.value.substring(0,s) + before + sel + after + el.value.substring(e);
  el.focus();
  updateWordCount();
}

export function insertWord(word){
  const el = document.getElementById("main-editor");
  if(!el) return;
  const pos = el.selectionStart;
  el.value = el.value.substring(0,pos) + word + " " + el.value.substring(pos);
  el.focus();
  updateWordCount();
}

export function clearEditor(){
  const el = document.getElementById("main-editor");
  if(el){ el.value = ""; updateWordCount(); }
}

/* ══════════════════════════════════════
   SAVE DRAFT
══════════════════════════════════════ */
export async function saveDraft(type){
  if(!window._currentUser){ toast("⚠️ Login করুন।","error"); return; }
  const editor = document.getElementById("main-editor");
  if(!editor || !editor.value.trim()){ toast("⚠️ কিছু লিখুন আগে।","error"); return; }
  try {
    await setDoc(
      doc(db,"writing_drafts", `${window._currentUser.uid}_${type}_${currentTask?.id||"t0"}`),
      {
        uid: window._currentUser.uid,
        type: type,
        taskId: currentTask?.id||"",
        taskLabel: currentTask?.label||"",
        content: editor.value,
        wordCount: editor.value.trim().split(/\s+/).filter(Boolean).length,
        savedAt: serverTimestamp()
      }
    );
    toast("💾 Draft saved!");
  } catch(e){ toast("❌ Save failed: "+e.message,"error"); }
}

/* ══════════════════════════════════════
   REAL AI CHECK — Claude API
══════════════════════════════════════ */
export const WRITING_TYPE_LABELS = {
  paragraph: "Paragraph",
  essay:     "Essay",
  email:     "Email",
  story:     "Story / Narrative"
};

const levelOfUser = () => { const l = window._userDoc && window._userDoc.learningProfile && window._userDoc.learningProfile.level; return ["A1","A2","B1","B2","C1","C2"].includes(l) ? l : "A1"; };
const minWordsFor = () => Math.max(20, Math.round(lengthTarget(currentTask && currentTask.words, levelOfUser()).min * 0.6));
let planCatalog = null;
async function getCatalog(){ if(planCatalog) return planCatalog; try { const r = await fetch("data/plan-catalog.json",{cache:"force-cache"}); planCatalog = r.ok ? await r.json() : {}; } catch(_) { planCatalog = {}; } return planCatalog; }

/* tell the daily plan that writing was practised today (once per page visit; also ticks the plan item when writing is part of today's plan) */
async function markWritingPracticed(extra = {}){
  const u = window._currentUser; if(!u) return {};
  const { update } = tickPlan({ userDoc: window._userDoc || {}, skill: "writing", today: isoDay(), catalog: await getCatalog() });
  return { ...update, ...extra };
}

/* ═══ Writing Check (Phase 11): instant rule-based check + optional verified AI coach ═══ */
export async function checkWriting(type){
  const editor = document.getElementById("main-editor");
  const words = editor ? editor.value.trim().split(/\s+/).filter(Boolean).length : 0;
  if (!editor || words < 8) { toast("আগে অন্তত ৮টি শব্দ লিখুন, তারপর check করুন", "error"); return; }
  const fp = document.getElementById("feedback-panel");
  const uid = window._currentUser && window._currentUser.uid;
  renderCheck({
    panel: fp, editor, type: type || "paragraph", level: levelOfUser(), task: currentTask, today: isoDay(),
    onChange: () => { updateWordCount(); },
    saveMistakes: (list) => saveMistakes(uid, list, isoDay()),
    toast,
  });
  fp.scrollIntoView({ behavior: "smooth", block: "nearest" });
  if (words >= minWordsFor() && !window._writingTicked && uid) {
    window._writingTicked = true;
    try { await updateDoc(doc(db, "users", uid), await markWritingPracticed()); } catch (e) { window._writingTicked = false; console.warn("plan history not saved", e); }
  }
}

/* ══════════════════════════════════════
   SUBMIT WRITING
══════════════════════════════════════ */
export async function submitWriting(type){
  if(!window._currentUser){ toast(" Login ","error"); return; }
  const editor = document.getElementById("main-editor");
  if(!editor || editor.value.trim().length < 20){
    toast("আগে কিছু লিখুন (অন্তত ২০ অক্ষর), তারপর submit করুন","error"); return;
  }
  const level  = levelOfUser();
  const words  = editor.value.trim().split(/\s+/).filter(Boolean).length;
  const today  = isoDay();
  const taskId = (currentTask && currentTask.id) || "";
  const ws     = (window._userDoc && window._userDoc.writingStats) || {};
  const already = ws.xpDate === today && (ws.xpTasks || []).includes(taskId);
  const enough  = words >= minWordsFor();
  const xp     = (!already && enough && taskId) ? Math.min(150, (currentTask && currentTask.xp) || 75) : 0;   // XP: once per task per day, and only for a real attempt
  const pubCheckbox = document.getElementById("public-checkbox");
  const isPublic = !!(pubCheckbox && pubCheckbox.checked) && !window._currentUser.isAnonymous;              // guests cannot publish to the community
  const m = textMetrics(editor.value);
  try {
    await addDoc(collection(db,"writings"),{
      uid:         window._currentUser.uid,
      displayName: window._currentUser.displayName || "",
      photoURL:    safeImageUrl(window._currentUser.photoURL),
      type:        type,
      taskId:      taskId,
      taskLabel:   (currentTask && currentTask.label) || "",
      content:     editor.value,
      wordCount:   words,
      xpEarned:    xp,
      score:       null,
      isPublic:    isPublic,
      reviewCount: 0,
      issueCount:  Math.min(500, ruleCheck(editor.value).length),
      sentences:   Math.min(500, m.sentences),
      level:       level,
      version:     1,
      submittedAt: serverTimestamp()
    });
    const upd = { writingCount: increment(1), totalWords: increment(words) };
    if (xp > 0) {
      upd.xp = increment(xp);
      if (ws.xpDate === today) upd["writingStats.xpTasks"] = arrayUnion(taskId);
      else { upd["writingStats.xpDate"] = today; upd["writingStats.xpTasks"] = [taskId]; }
    }
    Object.assign(upd, await markWritingPracticed());
    await updateDoc(doc(db,"users", window._currentUser.uid), upd);
    window._userDoc = { ...(window._userDoc || {}), writingStats: xp > 0 ? { xpDate: today, xpTasks: ws.xpDate === today ? [...(ws.xpTasks || []), taskId] : [taskId] } : ws };
    toast(xp > 0 ? `জমা হয়েছে! +${xp} XP (${words} শব্দ)` : `জমা হয়েছে! (${words} শব্দ)`);
    if (xp === 0) toast(already ? "এই টাস্কের XP আজ আগেই পেয়েছেন। নতুন টাস্ক চেষ্টা করুন।" : "XP পেতে টাস্কের লক্ষ্য-শব্দের কাছাকাছি লিখুন।", "info");
    if(isPublic) toast("Community-তে public হয়েছে, peer review পাবেন!");
    if(pubCheckbox) pubCheckbox.checked = false;
    editor.value = "";
    const wc = document.getElementById("word-count"); if(wc) wc.textContent="0";
  } catch(e){ toast("Submit করা যায়নি, আবার চেষ্টা করুন","error"); console.warn(e); }
}

/* ══════════════════════════════════════
   EDITOR TOOLBAR EVENT DELEGATION
   Attach once per page. `type` = paragraph/essay/email/story
══════════════════════════════════════ */
export function setupEditorToolbar(type){
  document.addEventListener("click", function(e){
    const el = e.target.closest("[data-action]");
    if(!el) return;
    const action = el.dataset.action;
    switch(action){
      case "insert-word": insertWord(el.dataset.word||""); break;
      case "bold":    insertText("**","**"); break;
      case "italic":  insertText("_","_");   break;
      case "quote":   insertText('"','"');   break;
      case "para":    insertText("\n\n","");   break;
      case "subject-email": insertText("Subject: ",""); break;
      case "dear-email":    insertText("Dear ","");    break;
      case "regards-email": insertText("Regards,\n",""); break;
      case "clear":   clearEditor(); break;
      case "save":    saveDraft(type); break;
      case "check":   checkWriting(type); break;
      case "submit":  submitWriting(type); break;
    }
  });
  const editor = document.getElementById("main-editor");
  if(editor) editor.addEventListener("input", updateWordCount);
}
