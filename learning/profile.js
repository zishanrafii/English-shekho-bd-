/* Save / load the Learning DNA profile (Firestore + Auth display name). */
import { auth, db, doc, setDoc, serverTimestamp, updateProfile } from "../js/firebase-config.js";
import { sanitizeProfile, cleanName } from "./profile-schema.js";

export async function saveLearningProfile(uid, answers, rawName) {
  const profile = sanitizeProfile(answers);            // throws on invalid data
  const name = cleanName(rawName);
  const data = { learningProfile: { ...profile, completedAt: serverTimestamp() } };
  if (name) data.displayName = name;
  await setDoc(doc(db, "users", uid), data, { merge: true });
  if (name && auth.currentUser && auth.currentUser.uid === uid) {
    try { await updateProfile(auth.currentUser, { displayName: name }); } catch (_) { /* non-fatal */ }
  }
  return profile;
}
