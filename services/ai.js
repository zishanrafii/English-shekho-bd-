/* Client for the guarded AI endpoints. Always sends the Firebase ID token. */
import { auth } from "../js/firebase-config.js";

async function post(path, payload) {
  const user = auth.currentUser;
  if (!user) throw new Error("not_signed_in");
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + (await user.getIdToken()) },
    body: JSON.stringify(payload),
  });
  if (res.status === 401) throw new Error("not_signed_in");
  if (res.status === 429) throw new Error("rate_limited");
  if (!res.ok) throw new Error("server_" + res.status);
  return res.json();
}
export const checkWriting  = (text, type = "paragraph") => post("/api/ai-check", { text, type });
export const checkSpeaking = (transcript, prompt = "") => post("/api/speaking-check", { transcript, prompt });
export const checkGrammar  = (text) => post("/api/grammar-check", { text });
export const translateToBn = (text) => post("/api/translate", { text, targetLang: "bn" });
