/* ═══════════════════════════════════════════════════════════
   Pronunciation / recognition providers.

   The UI and the engine talk ONLY to this interface, never to
   window.SpeechRecognition directly. To use a professional
   pronunciation service later, add another class with the same
   methods (see PronunciationProvider) and hand it to the engine.
   There is deliberately NO placeholder for an external provider
   here: nothing fake is shipped.

   A provider's stop() resolves to:
   { transcript, confidence, durationMs, speechStartMs, speechEndMs,
     segments:[{startMs,endMs,text}], error? }      error ∈ ERRORS (state.js)
   ═══════════════════════════════════════════════════════════ */

export class PronunciationProvider {
  get name() { throw new Error("not implemented"); }
  isSupported() { return false; }
  /** begin listening (must be called from a user gesture) */
  async start(/* { continuous, onInterim } */) { throw new Error("not implemented"); }
  /** stop listening; resolves with the result described above */
  async stop() { throw new Error("not implemented"); }
  /** abort without producing a result */
  cancel() {}
}

/** Which browser APIs exist (no permission prompt, no side effects). */
export function detectSupport(win = window) {
  const nav = win.navigator || {};
  return {
    recognition: !!(win.SpeechRecognition || win.webkitSpeechRecognition),
    getUserMedia: !!(nav.mediaDevices && nav.mediaDevices.getUserMedia),
    mediaRecorder: typeof win.MediaRecorder === "function",
    speechSynthesis: "speechSynthesis" in win && typeof win.SpeechSynthesisUtterance === "function",
  };
}

/** Map a SpeechRecognition error code to our error vocabulary. */
export function mapRecognitionError(code) {
  switch (code) {
    case "no-speech": return "no-speech";
    case "not-allowed": case "service-not-allowed": return "mic-denied";
    case "audio-capture": return "mic-unavailable";
    case "network": return "network";
    case "language-not-supported": return "unsupported";
    default: return "recognition";
  }
}

export class BrowserSpeechProvider extends PronunciationProvider {
  constructor({ win = window, lang = "en-US", now = () => performance.now(), stopTimeoutMs = 4000 } = {}) {
    super();
    this.win = win; this.lang = lang; this.now = now; this.stopTimeoutMs = stopTimeoutMs;
    this.rec = null; this.running = false;
  }
  get name() { return "browser-speech"; }
  isSupported() { return detectSupport(this.win).recognition; }

  async start({ continuous = false, onInterim = null } = {}) {
    if (!this.isSupported()) { const e = new Error("unsupported"); e.code = "unsupported"; throw e; }
    const Ctor = this.win.SpeechRecognition || this.win.webkitSpeechRecognition;
    const rec = new Ctor();
    rec.lang = this.lang; rec.continuous = !!continuous; rec.interimResults = true; rec.maxAlternatives = 1;
    this.rec = rec; this.running = true; this.stopping = false; this.restarts = 0;
    this.t0 = this.now(); this.speechStartMs = null; this.lastResultMs = null;
    this.finals = []; this.segments = []; this.interim = ""; this.confidences = []; this.error = null; this.segStart = {};
    this._ended = new Promise((res) => { this._resolveEnded = res; });

    rec.onspeechstart = () => { if (this.speechStartMs === null) this.speechStartMs = this.now() - this.t0; };
    rec.onresult = (ev) => {
      const t = this.now() - this.t0;
      if (this.speechStartMs === null) this.speechStartMs = t;
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i], alt = r[0] || {};
        const key = this.segments.length + "_" + i;
        if (this.segStart[key] === undefined) this.segStart[key] = t;
        if (r.isFinal) {
          const text = String(alt.transcript || "").trim();
          if (text) {
            this.finals.push(text); this.segments.push({ startMs: this.segStart[key], endMs: t, text });
            if (Number.isFinite(alt.confidence) && alt.confidence > 0) this.confidences.push(alt.confidence);
            this.lastResultMs = t;
          }
          this.interim = "";
        } else { this.interim = String(alt.transcript || ""); this.lastResultMs = t; if (onInterim) onInterim((this.finals.join(" ") + " " + this.interim).trim()); }
      }
    };
    rec.onerror = (ev) => { const code = mapRecognitionError(ev && ev.error); if (!(ev && ev.error === "aborted")) this.error = this.error || code; };
    rec.onend = () => {
      // Chrome ends a "continuous" session after a silence: keep going until the learner presses stop
      if (this.running && !this.stopping && continuous && !this.error && this.restarts < 20) {
        this.restarts++; try { rec.start(); return; } catch (_) { /* fall through to resolve */ }
      }
      this.running = false; this._resolveEnded();
    };
    try { rec.start(); }
    catch (e) { this.running = false; const err = new Error("recognition"); err.code = "recognition"; throw err; }
  }

  async stop() {
    if (!this.rec) return { transcript: "", confidence: 0, durationMs: 0, segments: [], error: "recognition" };
    this.stopping = true;
    try { this.rec.stop(); } catch (_) {}
    await Promise.race([this._ended, new Promise((res) => setTimeout(res, this.stopTimeoutMs))]);
    const end = this.now() - this.t0;
    const transcript = (this.finals.join(" ") + (this.finals.length ? "" : " " + this.interim)).trim();   // some browsers only deliver interim text before end
    const conf = this.confidences.length ? this.confidences.reduce((a, b) => a + b, 0) / this.confidences.length : 0;
    this.running = false; this.rec = null;
    return {
      transcript, confidence: Math.round(conf * 100) / 100, durationMs: Math.round(end),
      speechStartMs: this.speechStartMs, speechEndMs: this.lastResultMs, segments: this.segments.slice(),
      error: transcript ? null : (this.error || "no-speech"),
      ...(transcript && this.error && this.error !== "no-speech" ? { warning: this.error } : {}),
    };
  }

  cancel() { try { this.rec && this.rec.abort(); } catch (_) {} this.running = false; this.stopping = true; this.rec = null; }
}
