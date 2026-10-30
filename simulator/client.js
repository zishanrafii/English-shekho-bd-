/* Partner turn from the server (AI mode). The persona is fixed on the server; we send only an id, the level, recent lines and the new line. */
import { auth } from "../js/firebase-config.js";

/** @returns {{ok:true,reply,finished}|{ok:false,error:'auth'|'rate'|'network'|'failed'}} — never throws */
export async function askPartner({ scenario, level, history, text }) {
  try {
    const user = auth.currentUser; if (!user) return { ok: false, error: "auth" };
    const res = await fetch("/api/sim-turn", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + (await user.getIdToken()) },
      body: JSON.stringify({ scenario, level, history, text }),
    });
    if (res.status === 401) return { ok: false, error: "auth" };
    if (res.status === 429) return { ok: false, error: "rate" };
    if (!res.ok) return { ok: false, error: "failed" };
    const d = await res.json();
    if (!d || typeof d.reply !== "string" || !d.reply.trim()) return { ok: false, error: "failed" };
    return { ok: true, reply: d.reply, finished: d.finished === true };
  } catch (_) { return { ok: false, error: "network" }; }
}
