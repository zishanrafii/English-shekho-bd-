/* ═══════════════════════════════════════════════
   Guest (anonymous) learning — Phase 3
   Flow:  Start as guest → learn → (optional) create account.
   Linking keeps the SAME uid, so all guest progress is kept.
   ═══════════════════════════════════════════════ */
import {
  auth, db, gProvider, EmailAuthProvider, signInAnonymously,
  linkWithCredential, linkWithPopup, updateProfile, doc, updateDoc, getDoc, setDoc, serverTimestamp
} from "../js/firebase-config.js";

export const isGuest = (u = auth.currentUser) => !!u && u.isAnonymous;

/** Only same-site relative .html paths are allowed as a redirect target. */
export function safeNext(raw) {
  const v = String(raw || "");
  return /^[a-z0-9][a-z0-9_\-\/]*\.html$/i.test(v) && !v.includes("..") ? v : "dashboard.html";
}

export async function startGuest() {
  if (!auth.currentUser) await signInAnonymously(auth);
  return auth.currentUser;
}

async function syncProfile(user, name) {
  await user.getIdToken(true); // make sure the token carries the new email (rules compare against it)
  const ref = doc(db, "users", user.uid);
  const data = {
    isGuest: false,
    email: user.email || "",
    displayName: name || user.displayName || (user.email ? user.email.split("@")[0] : "Learner"),
    photoURL: user.photoURL || "",
  };
  const snap = await getDoc(ref);
  if (snap.exists()) await updateDoc(ref, data);
  else await setDoc(ref, { uid: user.uid, xp: 0, streak: 0, sessions: 0, totalCorrect: 0, ...data, createdAt: serverTimestamp() });
}

export function friendlyError(e) {
  const c = e && e.code;
  if (c === "auth/email-already-in-use" || c === "auth/credential-already-in-use")
    return "এই email/account আগে থেকেই আছে। নিচের “আগে থেকেই account আছে” লিংকে গিয়ে login করুন (Guest progress যুক্ত হবে না)।";
  if (c === "auth/weak-password") return "Password কমপক্ষে ৬ অক্ষরের দিন।";
  if (c === "auth/invalid-email") return "Email সঠিক নয়।";
  if (c === "auth/popup-closed-by-user" || c === "auth/cancelled-popup-request") return "Google window বন্ধ করা হয়েছে।";
  if (c === "auth/network-request-failed") return "Internet সংযোগ পরীক্ষা করুন।";
  return "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।";
}

export async function upgradeWithEmail(name, email, password) {
  const user = auth.currentUser;
  if (!isGuest(user)) throw new Error("not_guest");
  const cred = EmailAuthProvider.credential(email, password);
  const res = await linkWithCredential(user, cred);
  if (name) await updateProfile(res.user, { displayName: name });
  await syncProfile(res.user, name);
  return res.user;
}

export async function upgradeWithGoogle() {
  const user = auth.currentUser;
  if (!isGuest(user)) throw new Error("not_guest");
  const res = await linkWithPopup(user, gProvider);
  await syncProfile(res.user);
  return res.user;
}

/** Small dismissible banner shown on learning pages while in guest mode. */
export function mountGuestBanner() {
  if (document.getElementById("es-guest-banner")) return;
  try { if (sessionStorage.getItem("es-guest-banner-off")) return; } catch (_) {}
  const bar = document.createElement("div");
  bar.id = "es-guest-banner";
  bar.setAttribute("role", "status");
  bar.style.cssText =
    "position:fixed;left:12px;right:12px;bottom:12px;z-index:1050;display:flex;gap:10px;align-items:center;" +
    "justify-content:space-between;flex-wrap:wrap;padding:10px 14px;border-radius:14px;" +
    "background:rgba(19,23,49,.96);border:1px solid rgba(124,131,255,.45);color:#eef0ff;" +
    "font:500 14px/1.5 'Noto Sans Bengali',system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.4)";
  const txt = document.createElement("span");
  txt.textContent = "👋 আপনি Guest হিসেবে শিখছেন। Progress সেভ রাখতে বিনামূল্যে account খুলুন।";
  const actions = document.createElement("span");
  actions.style.cssText = "display:flex;gap:8px;align-items:center";
  const a = document.createElement("a");
  a.href = "upgrade.html?next=" + encodeURIComponent(location.pathname.replace(/^\//, ""));
  a.textContent = "Account খুলুন";
  a.style.cssText = "padding:7px 14px;border-radius:10px;background:linear-gradient(135deg,#5b5bff,#8b5cf6);color:#fff;text-decoration:none;font-weight:700";
  const x = document.createElement("button");
  x.type = "button"; x.setAttribute("aria-label", "বন্ধ করুন"); x.textContent = "✕";
  x.style.cssText = "background:none;border:0;color:#aab1d6;font-size:16px;cursor:pointer;padding:6px";
  x.onclick = () => { bar.remove(); try { sessionStorage.setItem("es-guest-banner-off", "1"); } catch (_) {} };
  actions.append(a, x); bar.append(txt, actions); document.body.appendChild(bar);
}
