/* Save a word into the learner's Smart Review deck (Firestore). */
import { auth, db, doc, getDoc, setDoc, updateDoc, increment } from "../js/firebase-config.js";
import { buildWordCard, wordCardId } from "./word-bank.js";
import { isoDay } from "./srs.js";

/** @returns {"saved"|"exists"}  — throws on invalid input or a failed write */
export async function saveWord(info) {
  const user = auth.currentUser;
  if (!user) throw new Error("not_signed_in");
  const today = isoDay();
  const card = buildWordCard(info, today);
  const ref = doc(db, "users", user.uid, "vocabSrs", wordCardId(card.word));
  const existing = await getDoc(ref);
  if (existing.exists()) return "exists";
  await setDoc(ref, card);
  try { await updateDoc(doc(db, "users", user.uid), { "srsMeta.words": increment(1) }); } catch (e) { console.warn("counter not updated", e); }
  return "saved";
}
