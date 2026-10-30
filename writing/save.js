/* Firestore side of the Personal Mistake Memory (thin). */
import { db, doc, getDoc, setDoc, increment } from "../js/firebase-config.js";

/**
 * Store new mistakes; a repeat of an unresolved one only bumps its counter once per day;
 * a mistake that was fixed before and happens AGAIN is re-opened.
 * @returns {{added:number, reopened:number, seen:number}}
 */
export async function saveMistakes(uid, list, today) {
  let added = 0, reopened = 0, seen = 0;
  for (const { key, doc: m } of list) {
    const ref = doc(db, "users", uid, "writingMistakes", key);
    const ex = await getDoc(ref);
    if (!ex.exists()) { await setDoc(ref, { ...m, count: 1 }); added++; }
    else if (ex.data().fixed) { await setDoc(ref, { ...m, count: increment(1) }, { merge: true }); reopened++; }
    else { seen++; if (ex.data().last !== today) await setDoc(ref, { last: today, count: increment(1) }, { merge: true }); }
  }
  return { added, reopened, seen };
}
