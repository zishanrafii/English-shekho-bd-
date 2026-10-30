/* =============================================
   FIREBASE CONFIG — shared across all pages
============================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  linkWithCredential,
  linkWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as sdkSignOut,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, query, orderBy, limit, getDocs,
  addDoc, serverTimestamp, onSnapshot,
  where, increment, arrayUnion, arrayRemove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPS0TkQ-9_SO5C0WcYkT459lXFDPaTPXM",
  authDomain: "english-shekho-bd.firebaseapp.com",
  projectId: "english-shekho-bd",
  storageBucket: "english-shekho-bd.firebasestorage.app",
  messagingSenderId: "896374430898",
  appId: "1:896374430898:web:c9b3e2c0ad6bee54393dab",
  measurementId: "G-NVSRP1KFXR"
};

const CLOUDINARY_CLOUD  = "di2zvmckz";
const CLOUDINARY_PRESET = "MyQuiz_App";

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const gProvider = new GoogleAuthProvider();

/* ── Cloudinary upload ── */
async function uploadToCloud(file, resourceType = "auto") {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/${resourceType}/upload`,
    { method: "POST", body: fd }
  );
  if (!res.ok) throw new Error("Upload failed");
  return (await res.json()).secure_url;
}

/* ── Toast notification ── */
function toast(msg, type = "success") {
  document.querySelectorAll(".app-toast").forEach(t => t.remove());
  const t = document.createElement("div");
  t.className = `app-toast ${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2800);
}

/* ── Inject toast CSS once ── */
if (!document.getElementById("app-toast-style")) {
  const s = document.createElement("style");
  s.id = "app-toast-style";
  s.textContent = `
    .app-toast{position:fixed;top:20px;right:20px;background:#111827;color:#fff;
      padding:.9rem 1.2rem;border-radius:16px;border:1px solid rgba(255,255,255,.08);
      z-index:99999;opacity:0;transform:translateY(-16px);transition:.3s;
      font-family:'Noto Sans Bengali',sans-serif;font-size:14px;max-width:320px;}
    .app-toast.show{opacity:1;transform:translateY(0);}
    .app-toast.success{border-left:4px solid #22c55e;}
    .app-toast.error{border-left:4px solid #ef4444;}
    .app-toast.info{border-left:4px solid #38bdf8;}
  `;
  document.head.appendChild(s);
}

/* ── Avatar element builder ── */
function makeAvatar(url, name, size = 36) {
  const wrap = document.createElement("div");
  wrap.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;
    background:#1e293b;border:1.5px solid rgba(255,255,255,.08);
    overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0;`;
  if (url) {
    const img = document.createElement("img");
    img.src = url;
    img.style.cssText = "width:100%;height:100%;object-fit:cover;";
    wrap.appendChild(img);
  } else {
    wrap.innerHTML = `<span style="font-size:${size*.4}px;color:#818cf8;font-weight:700">${name?name[0].toUpperCase():"?"}</span>`;
  }
  return wrap;
}

/* signOut with a safety net: signing out of a guest account loses its progress forever. */
function signOut(a) {
  const u = a && a.currentUser;
  if (u && u.isAnonymous &&
      !window.confirm("আপনি Guest হিসেবে আছেন। Logout করলে আপনার progress চিরতরে হারিয়ে যাবে।\nআগে account খুলে progress সেভ করুন।\n\nতবুও logout করবেন?")) {
    return Promise.resolve();
  }
  return sdkSignOut(a);
}

/* ── Auth guard: redirect to index if not logged in ──
   callback receives (user, userData) — userData is the already-fetched
   users/{uid} document (object, or {} if somehow still missing after sync).
   Pages can ignore the second argument (back-compat) or use it to skip
   a duplicate getDoc(users/uid) call right after requireAuth resolves. */
function requireAuth(callback) {
  onAuthStateChanged(auth, async user => {
    if (!user) { window.location.href = "index.html"; return; }
    /* Guest (anonymous) accounts may only use pages that opt in with
       <meta name="es-guest" content="allowed">. Everything else (chat,
       friends, profile...) needs a registered account. */
    if (user.isAnonymous) {
      if (!document.querySelector('meta[name="es-guest"]')) {
        const here = window.location.pathname.replace(/^\//, "");
        window.location.href = "upgrade.html?reason=locked&next=" + encodeURIComponent(here);
        return;
      }
      import("../auth/guest.js").then(m => m.mountGuestBanner()).catch(() => {});
    }
    // Auto-create or update user document — fixes PWA/Google login users missing from friends list
    let userData = {};
    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        userData = {
          uid: user.uid,
          displayName: user.displayName || (user.email ? user.email.split("@")[0] : "Guest"),
          ...(user.email ? { email: user.email } : {}),
          photoURL: user.photoURL || "",
          isGuest: !!user.isAnonymous,
          xp: 0, streak: 0, sessions: 0, totalCorrect: 0
        };
        await setDoc(userRef, { ...userData, createdAt: serverTimestamp() });
      } else {
        userData = snap.data();
        const updates = {};
        if (user.displayName && userData.displayName !== user.displayName)
          updates.displayName = user.displayName;
        if (user.photoURL && userData.photoURL !== user.photoURL)
          updates.photoURL = user.photoURL;
        if (Object.keys(updates).length) {
          await updateDoc(userRef, updates);
          userData = { ...userData, ...updates };
        }
      }
    } catch(e) { console.warn("User doc sync failed:", e); }
    callback(user, userData);
  });
}

/* ── Admin check ──
   IMPORTANT: this list must exactly match the isAdmin() email list
   inside firestore.rules. Client-side check is for UI/UX (hiding the
   admin panel link, redirecting non-admins) — the real security
   boundary is always Firestore Rules, not this list. */
const ADMIN_EMAILS = ["zishanrafii@gmail.com"];

function isAdminUser(user) {
  return !!user && !!user.email && ADMIN_EMAILS.includes(user.email);
}

/* ── Auth guard for admin-only pages: redirect non-admins to dashboard ── */
function requireAdmin(callback) {
  requireAuth(user => {
    if (!isAdminUser(user)) {
      window.location.href = "dashboard.html";
      return;
    }
    callback(user);
  });
}

/* ── Get full user data from Firestore ── */
async function getUserData(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
}

/* ── DM conversation ID ── */
function dmId(uid1, uid2) { return [uid1, uid2].sort().join("_"); }

/* ── Escape HTML ── */
function esc(s) {
  // Escapes text AND attribute contexts (quotes included).
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* ── Safe URL for <img src> / <a href>: http(s) or data:image only ── */
function safeUrl(u) {
  const v = String(u ?? "").trim();
  if (/^https?:\/\//i.test(v) || /^data:image\/(png|jpe?g|gif|webp);base64,/i.test(v)) return esc(v);
  return "";
}

/* ── Format timestamp ── */
function fmtTime(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("bn-BD");
}

export {
  safeUrl,
  app, auth, db, gProvider,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, signInAnonymously, linkWithCredential, linkWithPopup,
  onAuthStateChanged, signOut, updateProfile,
  EmailAuthProvider, reauthenticateWithCredential, updatePassword,
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, query, orderBy, limit, getDocs,
  addDoc, serverTimestamp, onSnapshot,
  where, increment, arrayUnion, arrayRemove,
  uploadToCloud, toast, makeAvatar,
  requireAuth, requireAdmin, isAdminUser, ADMIN_EMAILS,
  getUserData, dmId, esc, fmtTime, fmtDate
};
