/* Optional AI coaching for Free Speaking. The key lives on the server; this only sends the transcript. */
import { auth } from "../js/firebase-config.js";

/** @returns {{ok:true, data}|{ok:false, error:'auth'|'rate'|'network'|'failed'}} — never throws */
export async function askCoach({ transcript, topic, level, mode = "free" }) {
  try {
    const user = auth.currentUser;
    if (!user) return { ok: false, error: "auth" };
    const res = await fetch("/api/speaking-coach", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + (await user.getIdToken()) },
      body: JSON.stringify({ transcript, topic, level, mode }),     // only text and the CEFR label: never scores
    });
    if (res.status === 401) return { ok: false, error: "auth" };
    if (res.status === 429) return { ok: false, error: "rate" };
    if (!res.ok) return { ok: false, error: "failed" };
    return { ok: true, data: await res.json() };
  } catch (_) { return { ok: false, error: "network" }; }
}

export const COACH_SECTIONS = [
  ["strengths", "👍 ভালো যা হয়েছে"], ["improvements", "🌱 উন্নতির জায়গা"], ["pronunciationNotes", "🔊 উচ্চারণ সম্পর্কে"],
  ["fluencyNotes", "🎵 সাবলীলতা"], ["vocabularyNotes", "📚 শব্দভান্ডার"], ["grammarNotes", "✏️ ব্যাকরণ"], ["nextPractice", "➡️ পরের অনুশীলন"],
];
