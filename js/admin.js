/* =====================================================
   ENGLISH SHEKHO — ADMIN PANEL LOGIC
   ===================================================== */
import {
  requireAdmin, auth, db, ADMIN_EMAILS,
  doc, getDoc, updateDoc, setDoc, deleteDoc,
  collection, addDoc, getDocs, query, orderBy, limit, where,
  serverTimestamp, signOut
} from "./firebase-config.js";

/* ══════════════════════════════════════
   STATE
══════════════════════════════════════ */
let allUsers        = [];   // cached user list for client-side filter/search
let userSearchQuery = "";
let userFilter       = "all";

let allPassages = [];
let allLessons  = [];

let pendingDeleteAction = null; // function to run when confirm modal is confirmed

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function toast(msg, type = "success") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.style.borderLeftColor = type === "error" ? "#fb7185" : type === "info" ? "#818cf8" : "#34d399";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

function fmtDateShort(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("bn-BD", { year: "numeric", month: "short", day: "numeric" });
}

function esc(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

/* ══════════════════════════════════════
   TAB SWITCHING
══════════════════════════════════════ */
function switchTab(tabName) {
  document.querySelectorAll(".admin-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tabName));
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === `tab-${tabName}`));

  if (tabName === "overview" && !allUsers.length) loadOverview();
  if (tabName === "users" && !allUsers.length) loadUsers();
  if (tabName === "content" && !allPassages.length && !allLessons.length) loadContent();
}

function switchContentSubtab(subTab) {
  document.querySelectorAll(".csub-tab").forEach(t => t.classList.toggle("active", t.dataset.csub === subTab));
  document.querySelectorAll(".csub-panel").forEach(p => p.classList.toggle("active", p.id === `csub-${subTab}`));
}

/* ══════════════════════════════════════
   OVERVIEW TAB — ANALYTICS
══════════════════════════════════════ */
async function loadOverview() {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const users = [];
    usersSnap.forEach(d => users.push({ uid: d.id, ...d.data() }));
    allUsers = users;

    document.getElementById("stat-total-users").textContent = users.length;

    const totalXP = users.reduce((sum, u) => sum + (u.xp || 0), 0);
    document.getElementById("stat-total-xp").textContent = totalXP.toLocaleString("en-US");

    // "active today" — heuristic: lastActive field within last 24h, if such a field exists
    const now = Date.now();
    const activeToday = users.filter(u => {
      if (!u.lastActive) return false;
      const t = u.lastActive.toDate ? u.lastActive.toDate().getTime() : new Date(u.lastActive).getTime();
      return (now - t) < 24 * 60 * 60 * 1000;
    }).length;
    document.getElementById("stat-active-today").textContent = activeToday;

    // session/content counts (best-effort; collections may be large, so just count via getDocs)
    const [readingSnap, listeningSnap, writingsSnap] = await Promise.all([
      getDocs(collection(db, "reading_sessions")).catch(() => ({ size: 0 })),
      getDocs(collection(db, "listening_sessions")).catch(() => ({ size: 0 })),
      getDocs(collection(db, "writings")).catch(() => ({ size: 0 })),
    ]);
    document.getElementById("stat-reading-sessions").textContent   = readingSnap.size ?? readingSnap.docs?.length ?? 0;
    document.getElementById("stat-listening-sessions").textContent = listeningSnap.size ?? listeningSnap.docs?.length ?? 0;
    document.getElementById("stat-writings").textContent           = writingsSnap.size ?? writingsSnap.docs?.length ?? 0;

    renderTopLearners(users);
    renderRecentSignups(users);
  } catch (e) {
    toast("❌ Overview load failed: " + e.message, "error");
  }
}

function renderTopLearners(users) {
  const sorted = [...users].sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 10);
  const body = document.getElementById("top-learners-body");
  if (!sorted.length) { body.innerHTML = `<tr><td colspan="6" class="empty-row">কোনো user নেই।</td></tr>`; return; }

  body.innerHTML = sorted.map((u, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(u.displayName || "—")}</td>
      <td class="cell-muted">${esc(u.email || "—")}</td>
      <td>${(u.xp || 0).toLocaleString("en-US")}</td>
      <td>${esc(u.level || "A1")}</td>
      <td>🔥 ${u.streak || 0}</td>
    </tr>`).join("");
}

function renderRecentSignups(users) {
  const sorted = [...users]
    .filter(u => u.createdAt)
    .sort((a, b) => {
      const ta = a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
      const tb = b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
      return tb - ta;
    })
    .slice(0, 10);

  const body = document.getElementById("recent-signups-body");
  if (!sorted.length) { body.innerHTML = `<tr><td colspan="3" class="empty-row">কোনো signup data নেই।</td></tr>`; return; }

  body.innerHTML = sorted.map(u => `
    <tr>
      <td>${esc(u.displayName || "—")}</td>
      <td class="cell-muted">${esc(u.email || "—")}</td>
      <td>${fmtDateShort(u.createdAt)}</td>
    </tr>`).join("");
}

/* ══════════════════════════════════════
   USERS TAB — MANAGEMENT
══════════════════════════════════════ */
async function loadUsers() {
  try {
    const snap = await getDocs(collection(db, "users"));
    const users = [];
    snap.forEach(d => users.push({ uid: d.id, ...d.data() }));
    allUsers = users;
    renderUsersTable();
  } catch (e) {
    toast("❌ Users load failed: " + e.message, "error");
  }
}

function renderUsersTable() {
  let list = allUsers;

  if (userFilter === "admin")  list = list.filter(u => ADMIN_EMAILS.includes(u.email));
  if (userFilter === "banned") list = list.filter(u => u.banned === true);

  if (userSearchQuery) {
    const q = userSearchQuery.toLowerCase();
    list = list.filter(u =>
      (u.displayName || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  }

  document.getElementById("user-count-badge").textContent = list.length;

  const body = document.getElementById("users-body");
  if (!list.length) { body.innerHTML = `<tr><td colspan="7" class="empty-row">কোনো user পাওয়া যায়নি।</td></tr>`; return; }

  body.innerHTML = list.map(u => {
    const isAdmin  = ADMIN_EMAILS.includes(u.email);
    const isBanned = u.banned === true;
    return `
    <tr>
      <td><div class="cell-user"><div class="cell-avatar">👤</div>${esc(u.displayName || "—")}</div></td>
      <td class="cell-muted">${esc(u.email || "—")}</td>
      <td>${(u.xp || 0).toLocaleString("en-US")}</td>
      <td>🔥 ${u.streak || 0}</td>
      <td>
        ${isAdmin ? `<span class="pill-status pill-admin">Admin</span>` : ""}
        ${isBanned ? `<span class="pill-status pill-banned">Banned</span>` : (!isAdmin ? `<span class="pill-status pill-active">Active</span>` : "")}
      </td>
      <td class="cell-muted">${fmtDateShort(u.createdAt)}</td>
      <td>
        <div class="row-actions">
          ${isAdmin
            ? `<span class="cell-muted">—</span>`
            : isBanned
              ? `<button class="action-btn success" data-action="unban-user" data-uid="${u.uid}">Unban</button>`
              : `<button class="action-btn warn" data-action="ban-user" data-uid="${u.uid}">Ban</button>`
          }
        </div>
      </td>
    </tr>`;
  }).join("");
}

async function banUser(uid) {
  try {
    await updateDoc(doc(db, "users", uid), { banned: true });
    const u = allUsers.find(x => x.uid === uid);
    if (u) u.banned = true;
    renderUsersTable();
    toast("🚫 User ban করা হয়েছে।", "info");
  } catch (e) {
    toast("❌ Ban failed: " + e.message, "error");
  }
}

async function unbanUser(uid) {
  try {
    await updateDoc(doc(db, "users", uid), { banned: false });
    const u = allUsers.find(x => x.uid === uid);
    if (u) u.banned = false;
    renderUsersTable();
    toast("✅ User unban করা হয়েছে।", "info");
  } catch (e) {
    toast("❌ Unban failed: " + e.message, "error");
  }
}

/* ══════════════════════════════════════
   CONTENT TAB — PASSAGES + LESSONS CRUD
══════════════════════════════════════ */
async function loadContent() {
  await Promise.all([loadPassages(), loadLessons()]);
}

async function loadPassages() {
  try {
    const snap = await getDocs(collection(db, "passages"));
    allPassages = [];
    snap.forEach(d => allPassages.push({ id: d.id, ...d.data() }));
    renderPassagesTable();
  } catch (e) {
    toast("❌ Passages load failed: " + e.message, "error");
  }
}

function renderPassagesTable() {
  document.getElementById("passage-count-badge").textContent = allPassages.length;
  const body = document.getElementById("passages-body");
  if (!allPassages.length) { body.innerHTML = `<tr><td colspan="5" class="empty-row">এখনও কোনো passage add করা হয়নি।</td></tr>`; return; }

  body.innerHTML = allPassages.map(p => `
    <tr>
      <td>${p.icon || "📖"} ${esc(p.title || "—")}</td>
      <td class="cell-muted">${esc(p.category || "—")}</td>
      <td>${esc(p.level || "—")}</td>
      <td>${p.xp || 0}</td>
      <td>
        <div class="row-actions">
          <button class="action-btn" data-action="edit-passage" data-id="${p.id}">Edit</button>
          <button class="action-btn danger" data-action="delete-passage" data-id="${p.id}">Delete</button>
        </div>
      </td>
    </tr>`).join("");
}

async function loadLessons() {
  try {
    const snap = await getDocs(collection(db, "grammar_lessons"));
    allLessons = [];
    snap.forEach(d => allLessons.push({ id: d.id, ...d.data() }));
    renderLessonsTable();
  } catch (e) {
    toast("❌ Lessons load failed: " + e.message, "error");
  }
}

function renderLessonsTable() {
  document.getElementById("lesson-count-badge").textContent = allLessons.length;
  const body = document.getElementById("lessons-body");
  if (!allLessons.length) { body.innerHTML = `<tr><td colspan="4" class="empty-row">এখনও কোনো lesson add করা হয়নি।</td></tr>`; return; }

  body.innerHTML = allLessons.map(l => `
    <tr>
      <td>${l.icon || "📘"} ${esc(l.title || "—")}</td>
      <td class="cell-muted">${esc(l.category || "—")}</td>
      <td>${esc(l.level || "—")}</td>
      <td>
        <div class="row-actions">
          <button class="action-btn" data-action="edit-lesson" data-id="${l.id}">Edit</button>
          <button class="action-btn danger" data-action="delete-lesson" data-id="${l.id}">Delete</button>
        </div>
      </td>
    </tr>`).join("");
}

/* ── Passage modal ── */
function openPassageModal(passageId = null) {
  const overlay = document.getElementById("passage-modal-overlay");
  const p = passageId ? allPassages.find(x => x.id === passageId) : null;

  document.getElementById("passage-modal-title").textContent = p ? "Passage Edit করুন" : "Notun Passage";
  document.getElementById("pm-id").value       = p ? p.id : "";
  document.getElementById("pm-title").value    = p ? (p.title || "") : "";
  document.getElementById("pm-category").value = p ? (p.category || "Story") : "Story";
  document.getElementById("pm-level").value    = p ? (p.level || "A1") : "A1";
  document.getElementById("pm-xp").value       = p ? (p.xp || 40) : 40;
  document.getElementById("pm-icon").value     = p ? (p.icon || "") : "";
  document.getElementById("pm-text").value     = p && p.text ? p.text.join("\n") : "";

  const q = p && p.quiz && p.quiz[0] ? p.quiz[0] : null;
  document.getElementById("pm-quiz-q").value    = q ? (q.q || "") : "";
  document.getElementById("pm-quiz-opts").value = q && q.opts ? q.opts.join(", ") : "";
  document.getElementById("pm-quiz-ans").value  = q ? (q.ans ?? 0) : 0;
  document.getElementById("pm-quiz-exp").value  = q ? (q.exp || "") : "";

  overlay.classList.add("show");
}
function closePassageModal() { document.getElementById("passage-modal-overlay").classList.remove("show"); }

async function savePassage() {
  const id       = document.getElementById("pm-id").value;
  const title    = document.getElementById("pm-title").value.trim();
  const category = document.getElementById("pm-category").value;
  const level    = document.getElementById("pm-level").value;
  const xp       = parseInt(document.getElementById("pm-xp").value) || 40;
  const icon     = document.getElementById("pm-icon").value.trim() || "📖";
  const text     = document.getElementById("pm-text").value.split("\n").map(s => s.trim()).filter(Boolean);

  const qText = document.getElementById("pm-quiz-q").value.trim();
  const qOpts = document.getElementById("pm-quiz-opts").value.split(",").map(s => s.trim()).filter(Boolean);
  const qAns  = parseInt(document.getElementById("pm-quiz-ans").value) || 0;
  const qExp  = document.getElementById("pm-quiz-exp").value.trim();

  if (!title || !text.length) { toast("⚠️ Title ও passage text লাগবে।", "error"); return; }

  const data = {
    title, category, level, xp, icon, text,
    quiz: qText ? [{ q: qText, opts: qOpts, ans: qAns, exp: qExp }] : [],
    updatedAt: serverTimestamp()
  };

  try {
    if (id) {
      await updateDoc(doc(db, "passages", id), data);
      toast("✅ Passage update করা হয়েছে।");
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, "passages"), data);
      toast("✅ Notun passage যুক্ত করা হয়েছে।");
    }
    closePassageModal();
    await loadPassages();
  } catch (e) {
    toast("❌ Save failed: " + e.message, "error");
  }
}

async function deletePassage(id) {
  try {
    await deleteDoc(doc(db, "passages", id));
    toast("🗑️ Passage delete করা হয়েছে।", "info");
    await loadPassages();
  } catch (e) {
    toast("❌ Delete failed: " + e.message, "error");
  }
}

/* ── Lesson modal ── */
function openLessonModal(lessonId = null) {
  const overlay = document.getElementById("lesson-modal-overlay");
  const l = lessonId ? allLessons.find(x => x.id === lessonId) : null;

  document.getElementById("lesson-modal-title").textContent = l ? "Lesson Edit করুন" : "Notun Grammar Lesson";
  document.getElementById("lm-id").value          = l ? l.id : "";
  document.getElementById("lm-title").value       = l ? (l.title || "") : "";
  document.getElementById("lm-category").value    = l ? (l.category || "") : "";
  document.getElementById("lm-level").value       = l ? (l.level || "beginner") : "beginner";
  document.getElementById("lm-icon").value        = l ? (l.icon || "") : "";
  document.getElementById("lm-explanation").value = l ? (l.explanation || "") : "";
  document.getElementById("lm-formula").value     = l ? (l.formula || "") : "";
  document.getElementById("lm-examples").value    = l && l.examples ? l.examples.join("\n") : "";

  overlay.classList.add("show");
}
function closeLessonModal() { document.getElementById("lesson-modal-overlay").classList.remove("show"); }

async function saveLesson() {
  const id          = document.getElementById("lm-id").value;
  const title       = document.getElementById("lm-title").value.trim();
  const category    = document.getElementById("lm-category").value.trim();
  const level       = document.getElementById("lm-level").value;
  const icon        = document.getElementById("lm-icon").value.trim() || "📘";
  const explanation = document.getElementById("lm-explanation").value.trim();
  const formula     = document.getElementById("lm-formula").value.trim();
  const examples    = document.getElementById("lm-examples").value.split("\n").map(s => s.trim()).filter(Boolean);

  if (!title || !explanation) { toast("⚠️ Title ও explanation লাগবে।", "error"); return; }

  const data = { title, category, level, icon, explanation, formula, examples, updatedAt: serverTimestamp() };

  try {
    if (id) {
      await updateDoc(doc(db, "grammar_lessons", id), data);
      toast("✅ Lesson update করা হয়েছে।");
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, "grammar_lessons"), data);
      toast("✅ Notun lesson যুক্ত করা হয়েছে।");
    }
    closeLessonModal();
    await loadLessons();
  } catch (e) {
    toast("❌ Save failed: " + e.message, "error");
  }
}

async function deleteLesson(id) {
  try {
    await deleteDoc(doc(db, "grammar_lessons", id));
    toast("🗑️ Lesson delete করা হয়েছে।", "info");
    await loadLessons();
  } catch (e) {
    toast("❌ Delete failed: " + e.message, "error");
  }
}

/* ══════════════════════════════════════
   CONFIRM MODAL (ban / delete)
══════════════════════════════════════ */
function openConfirmModal(title, text, onConfirm) {
  document.getElementById("confirm-modal-title").textContent = title;
  document.getElementById("confirm-modal-text").textContent  = text;
  pendingDeleteAction = onConfirm;
  document.getElementById("confirm-modal-overlay").classList.add("show");
}
function closeConfirmModal() {
  document.getElementById("confirm-modal-overlay").classList.remove("show");
  pendingDeleteAction = null;
}

document.getElementById("confirm-modal-action-btn").addEventListener("click", () => {
  if (pendingDeleteAction) pendingDeleteAction();
  closeConfirmModal();
});

/* ══════════════════════════════════════
   EVENT DELEGATION
══════════════════════════════════════ */
document.addEventListener("click", function (e) {
  // admin tab
  const adminTab = e.target.closest(".admin-tab");
  if (adminTab) { switchTab(adminTab.dataset.tab); return; }

  // content subtab
  const csubTab = e.target.closest(".csub-tab");
  if (csubTab) { switchContentSubtab(csubTab.dataset.csub); return; }

  // user filter tab
  const ftab = e.target.closest(".ftab");
  if (ftab) {
    userFilter = ftab.dataset.filter;
    document.querySelectorAll(".ftab").forEach(t => t.classList.remove("active"));
    ftab.classList.add("active");
    renderUsersTable();
    return;
  }

  // action buttons (data-action)
  const actionEl = e.target.closest("[data-action]");
  if (!actionEl) return;
  const action = actionEl.dataset.action;
  const uid = actionEl.dataset.uid;
  const id  = actionEl.dataset.id;

  switch (action) {
    case "logout": signOut(auth).then(() => window.location.href = "index.html"); break;

    case "ban-user":
      openConfirmModal("User Ban করুন?", "এই user platform-এ login করতে পারবে না যতক্ষণ না unban করা হয়।", () => banUser(uid));
      break;
    case "unban-user": unbanUser(uid); break;

    case "new-passage":   openPassageModal(); break;
    case "edit-passage":  openPassageModal(id); break;
    case "close-passage-modal": closePassageModal(); break;
    case "save-passage":  savePassage(); break;
    case "delete-passage":
      openConfirmModal("Passage Delete করুন?", "এই passage permanently delete হয়ে যাবে, এটা ফিরিয়ে আনা যাবে না।", () => deletePassage(id));
      break;

    case "new-lesson":   openLessonModal(); break;
    case "edit-lesson":  openLessonModal(id); break;
    case "close-lesson-modal": closeLessonModal(); break;
    case "save-lesson":  saveLesson(); break;
    case "delete-lesson":
      openConfirmModal("Lesson Delete করুন?", "এই lesson permanently delete হয়ে যাবে, এটা ফিরিয়ে আনা যাবে না।", () => deleteLesson(id));
      break;

    case "close-confirm-modal": closeConfirmModal(); break;
  }
});

document.getElementById("user-search-input").addEventListener("input", e => {
  userSearchQuery = e.target.value.trim();
  renderUsersTable();
});

/* ══════════════════════════════════════
   INIT — admin-only guard
══════════════════════════════════════ */
requireAdmin(async user => {
  document.getElementById("nav-name").textContent = user.displayName || user.email.split("@")[0];
  loadOverview(); // load overview tab data by default
});
