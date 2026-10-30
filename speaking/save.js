/* Firestore side of speaking persistence (thin wrapper around the pure builders). */
import { db, collection, doc, runTransaction, serverTimestamp, increment, arrayUnion } from "../js/firebase-config.js";
import { buildSessionDoc, buildUserUpdate, applyUpdate, localOps } from "./persistence.js";
import { isoDay } from "../learning/srs.js";

/**
 * Save one finished item: 1 session document + 1 user update. Throws on failure (the UI shows 'save-failed').
 * @returns {{dayCount:number, reached:boolean, planSynced:boolean}}
 */
export async function saveActivity({ uid, userDoc, catalog, mode, level, activityId, prompt, analysis, attempts, seconds }) {
  const today = isoDay();
  const sessionDoc = buildSessionDoc({ uid, mode, level, activityId, prompt, analysis, attempts, today, serverTimestamp: serverTimestamp() });
  const { update, dayCount, reached, planSynced } = buildUserUpdate({
    analysis, mode, seconds, today, userDoc, difficultChanged: analysis.difficultChanged || {}, catalog, ops: { increment, arrayUnion },
  });
  // Stable reference is created before the transaction. Both writes either commit together or neither does.
  const sessionRef = doc(collection(db, "speaking_sessions"));
  const userRef = doc(db, "users", uid);
  await runTransaction(db, async (tx) => {
    tx.set(sessionRef, sessionDoc);
    tx.update(userRef, update);
  });
  // the same update, applied to the cached copy the page keeps (so counters and today's count stay right between saves)
  const local = buildUserUpdate({ analysis, mode, seconds, today, userDoc, difficultChanged: analysis.difficultChanged || {}, catalog, ops: localOps }).update;
  return { dayCount, reached, planSynced, today, userDoc: applyUpdate(userDoc, local) };
}
