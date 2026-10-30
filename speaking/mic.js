/* Microphone permission + optional local playback of the learner's own voice.
   Nothing here uploads audio anywhere: the recording lives in memory as a Blob URL and is revoked on retry/leave. */

/** 'granted' | 'denied' | 'prompt' | 'unknown' — does NOT trigger the permission prompt. */
export async function micPermission(win = window) {
  try {
    if (!win.navigator.permissions || !win.navigator.permissions.query) return "unknown";
    const r = await win.navigator.permissions.query({ name: "microphone" });
    return r.state === "granted" || r.state === "denied" || r.state === "prompt" ? r.state : "unknown";
  } catch (_) { return "unknown"; }
}

/** Ask for the microphone. MUST be called from a click/tap (never automatically, never in a loop). */
export async function requestMic(win = window) {
  const md = win.navigator && win.navigator.mediaDevices;
  if (!md || !md.getUserMedia) { const e = new Error("unsupported"); e.code = "unsupported"; throw e; }
  try { return await md.getUserMedia({ audio: true }); }
  catch (err) {
    const n = err && err.name; const e = new Error(n || "mic");
    e.code = (n === "NotAllowedError" || n === "SecurityError" || n === "PermissionDeniedError") ? "mic-denied" : "mic-unavailable";
    throw e;
  }
}

/** Local-only recorder for "listen to yourself". Safe to ignore if MediaRecorder is missing. */
export class LocalRecorder {
  constructor(win = window) { this.win = win; this.rec = null; this.chunks = []; this.url = null; }
  static supported(win = window) { return typeof win.MediaRecorder === "function"; }
  start(stream) {
    this.revoke();
    if (!LocalRecorder.supported(this.win) || !stream) return false;
    try {
      this.chunks = [];
      this.rec = new this.win.MediaRecorder(stream);
      this.rec.ondataavailable = (e) => { if (e.data && e.data.size) this.chunks.push(e.data); };
      this.rec.start();
      return true;
    } catch (_) { this.rec = null; return false; }
  }
  stop() {
    return new Promise((resolve) => {
      if (!this.rec || this.rec.state === "inactive") return resolve(null);
      this.rec.onstop = () => {
        try {
          const blob = new this.win.Blob(this.chunks, { type: this.rec.mimeType || "audio/webm" });
          this.url = blob.size ? this.win.URL.createObjectURL(blob) : null;
        } catch (_) { this.url = null; }
        resolve(this.url);
      };
      try { this.rec.stop(); } catch (_) { resolve(null); }
    });
  }
  revoke() { if (this.url) { try { this.win.URL.revokeObjectURL(this.url); } catch (_) {} this.url = null; } this.chunks = []; }
}

/** Stop every track of a stream (releases the microphone indicator). */
export function releaseStream(stream) { try { stream && stream.getTracks().forEach((t) => t.stop()); } catch (_) {} }

/** Friendly Bengali explanation + what to do, per error. Never blames the learner. */
export function explain(error) {
  const M = {
    "mic-denied": { title: "মাইক্রোফোনের অনুমতি দেওয়া হয়নি", body: "আপনার কথা শোনার জন্য মাইক্রোফোন দরকার। ব্রাউজারের ঠিকানা-বারের পাশের 🔒 বা মাইক্রোফোন আইকনে চেপে “অনুমতি দিন (Allow)” বেছে নিন, তারপর “আবার চেষ্টা করুন” চাপুন।", retry: true },
    "mic-unavailable": { title: "মাইক্রোফোন পাওয়া যাচ্ছে না", body: "ডিভাইসে মাইক্রোফোন যুক্ত আছে কি না, আর অন্য কোনো অ্যাপ সেটি ব্যবহার করছে কি না দেখুন। তারপর আবার চেষ্টা করুন।", retry: true },
    "unsupported": { title: "এই ব্রাউজারে কথা শনাক্ত করা যায় না", body: "Chrome (Android বা কম্পিউটার) বা Edge-এ খুললে এই অনুশীলন কাজ করবে। ততক্ষণ শুনে শোনার অনুশীলন ও অন্য পাঠ ব্যবহার করতে পারেন।", retry: false },
    "no-speech": { title: "আমরা আপনার কথা শুনতে পাইনি", body: "মাইক্রোফোনের কাছে একটু জোরে ও স্পষ্ট করে বলুন, তারপর আবার চেষ্টা করুন।", retry: true },
    "too-short": { title: "রেকর্ডিং খুব ছোট হয়ে গেছে", body: "বলা শেষ হলে তবেই থামান। আবার চেষ্টা করুন।", retry: true },
    "network": { title: "ইন্টারনেট সংযোগে সমস্যা", body: "কথা শনাক্ত করতে অনেক ব্রাউজার ইন্টারনেট ব্যবহার করে। সংযোগ দেখে আবার চেষ্টা করুন।", retry: true },
    "recognition": { title: "কথা শনাক্ত করা যায়নি", body: "একটু পরে আবার চেষ্টা করুন। সমস্যা থাকলে পেজটি রিফ্রেশ করে দেখুন।", retry: true },
    "save-failed": { title: "ফলাফল সেভ করা যায়নি", body: "আপনার অনুশীলন ঠিকই হয়েছে, কিন্তু সেভ হয়নি। ইন্টারনেট দেখে আবার চেষ্টা করতে পারেন।", retry: true },
  };
  return M[error] || M.recognition;
}
