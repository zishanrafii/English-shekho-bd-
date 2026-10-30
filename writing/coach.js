/* Optional AI writing coach (server-side key; only text + type + level + task title are sent — never scores or ids). */
import { auth } from "../js/firebase-config.js";
import { acceptAi } from "./mistakes.js";

/** @returns {{ok:true,data}|{ok:false,error:'auth'|'rate'|'network'|'failed'}} — never throws */
export async function askWritingCoach({ text, type, level, task }) {
  try {
    const user = auth.currentUser; if (!user) return { ok: false, error: "auth" };
    const res = await fetch("/api/writing-coach", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + (await user.getIdToken()) },
      body: JSON.stringify({ text: String(text).slice(0, 2500), type, level, task }),
    });
    if (res.status === 401) return { ok: false, error: "auth" };
    if (res.status === 429) return { ok: false, error: "rate" };
    if (!res.ok) return { ok: false, error: "failed" };
    const d = await res.json();
    // defence in depth: the server already verified the quotes; verify again before anything is shown or stored
    return { ok: true, data: { ...d, corrections: acceptAi(text, d.corrections) } };
  } catch (_) { return { ok: false, error: "network" }; }
}
