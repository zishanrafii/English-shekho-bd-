/* ═══════════════════════════════════════════════════════════
   SpeakingEngine — the reusable core.
     engine
       ├─ provider      (BrowserSpeechProvider today; any PronunciationProvider later)
       ├─ mic           (permission, local playback)
       ├─ analyzer      (word-by-word comparison — deterministic)
       ├─ scoring       (metrics + documented fluency estimate)
       └─ feedback      (friendly Bengali text)
   The UI only calls prepare() / start() / stop() / reset() and listens to events.
   Phase 12 (conversation / role-play) can reuse the same engine: it only needs a
   different `mode` in analyzeAttempt() and its own UI.
   ═══════════════════════════════════════════════════════════ */
import { compare, wordStates } from "./analyzer.js";
import { speechSeconds, wpmOf, pauseStats, fluencyEstimate, countFillers, freeFluency } from "./scoring.js";
import { targetFeedback, freeFeedback } from "./feedback.js";
import { needsPractice, update as updateDifficult } from "./difficult.js";
import { reduce, initial, S } from "./state.js";
import { detectSupport } from "./provider.js";
import { micPermission, requestMic, releaseStream, LocalRecorder } from "./mic.js";

export const MODES = ["repeat", "shadow", "read", "free"];
export const MIN_RECORDING_MS = 700;

/**
 * Turn one raw recogniser result into everything the UI and persistence need. PURE.
 * @param {object} a { mode, level, target?, topic?, recommendedSec?, raw, difficultCounts? }
 */
export function analyzeAttempt({ mode, level, target = "", recommendedSec = 60, raw, difficultCounts = {} }) {
  if (!MODES.includes(mode)) throw new Error("bad_mode");
  const durationSec = Math.round((raw.durationMs || 0) / 100) / 10;
  const base = { mode, level, durationSec, transcript: String(raw.transcript || ""), confidence: raw.confidence || 0 };

  if (mode === "free") {
    const f = freeFluency({ transcript: raw.transcript, durationMs: raw.durationMs, speechStartMs: raw.speechStartMs, speechEndMs: raw.speechEndMs, segments: raw.segments, level, recommendedSec });
    const fb = freeFeedback({ level, f, recommendedSec });
    return { ...base, free: f, fluency: f.measurable ? f.score : null, wpm: f.wpm, wordCount: f.metrics.words, feedback: fb, difficult: [], problemWords: [] };
  }

  const cmp = compare(target, raw.transcript);
  const sec = speechSeconds(raw);
  const wpm = mode === "repeat" ? 0 : wpmOf(cmp.heardWords, sec);
  const pauses = pauseStats(raw.segments);
  const fl = mode === "repeat" ? null : fluencyEstimate({
    wpm, level, completion: cmp.completion, repeats: cmp.repeated.length, fillers: countFillers(raw.transcript).count,
    words: cmp.heardWords, pauses, speechSec: sec,
  });
  const upd = updateDifficult(difficultCounts, cmp);
  const flagged = needsPractice({ ...upd.next }).filter((d) => cmp.problemWords.includes(d.word));
  const fb = targetFeedback({ mode, level, cmp, wpm, fluency: fl, difficult: flagged });
  return {
    ...base, target, cmp, states: wordStates(target, raw.transcript), wordAccuracy: cmp.wordAccuracy, completion: cmp.completion,
    wpm, pauses, fluency: fl && fl.measurable ? fl.score : null, fluencyParts: fl ? fl.parts : null,
    wordCount: cmp.heardWords, problemWords: cmp.problemWords, difficultNext: upd.next, difficultChanged: upd.changed,
    difficult: flagged, feedback: fb,
  };
}

export class SpeakingEngine {
  /**
   * @param {object} o { provider, win?, level?, now? }
   */
  constructor({ provider, win = window, level = "A1", now = () => performance.now() }) {
    this.provider = provider; this.win = win; this.level = level; this.now = now;
    this.state = initial(); this.listeners = {}; this.stream = null; this.local = new LocalRecorder(win);
    this.support = detectSupport(win); this.context = null; this.startedAt = 0;
  }
  on(evt, fn) { (this.listeners[evt] ||= []).push(fn); return () => { this.listeners[evt] = this.listeners[evt].filter((f) => f !== fn); }; }
  emit(evt, data) { (this.listeners[evt] || []).forEach((f) => { try { f(data); } catch (e) { console.error(e); } }); }
  _go(type, extra = {}) { const prev = this.state; this.state = reduce(this.state, { type, ...extra }); if (this.state !== prev) this.emit("state", this.state); return this.state; }

  /** Check support and (without prompting) the microphone permission. */
  async prepare() {
    if (!this.provider.isSupported()) { this._go("prepare"); this._go("fail", { error: "unsupported" }); return { ok: false, error: "unsupported" }; }
    const perm = await micPermission(this.win);
    this._go("prepare");
    if (perm === "denied") { this._go("fail", { error: "mic-denied" }); return { ok: false, error: "mic-denied", permission: perm }; }
    return { ok: true, permission: perm };
  }

  /** Begin recording. Call from a user click. */
  async start({ mode, target = "", recommendedSec = 60, difficultCounts = {} }) {
    if (this.state.name === S.IDLE) this._go("prepare");
    if (this.state.name === S.ERROR) this._go("retry");
    if (this.state.name !== S.READY) return { ok: false, error: "busy" };
    this.context = { mode, target, recommendedSec, difficultCounts };
    try {
      this.stream = await requestMic(this.win);
    } catch (e) { this._go("fail", { error: e.code || "mic-unavailable" }); return { ok: false, error: this.state.error }; }
    try {
      await this.provider.start({ continuous: mode === "free", onInterim: (t) => this.emit("interim", t) });
      this.local.start(this.stream);
      this.startedAt = this.now();
      this._go("start");
      return { ok: true };
    } catch (e) {
      releaseStream(this.stream); this.stream = null;
      this._go("fail", { error: e.code === "unsupported" ? "unsupported" : "recognition" });
      return { ok: false, error: this.state.error };
    }
  }

  /** Stop recording and analyse. */
  async stop() {
    if (this.state.name !== S.RECORDING) return { ok: false, error: "not-recording" };
    this._go("stop");
    let raw;
    try { raw = await this.provider.stop(); } catch (e) { raw = { error: "recognition", transcript: "", durationMs: 0 }; }
    const audioUrl = await this.local.stop();
    releaseStream(this.stream); this.stream = null;
    if ((raw.durationMs || 0) < MIN_RECORDING_MS) { this._go("fail", { error: "too-short" }); return { ok: false, error: "too-short" }; }
    if (raw.error && !raw.transcript) { this._go("fail", { error: raw.error }); return { ok: false, error: raw.error }; }
    const c = this.context;
    let analysis;
    try { analysis = analyzeAttempt({ mode: c.mode, level: this.level, target: c.target, recommendedSec: c.recommendedSec, raw, difficultCounts: c.difficultCounts }); }
    catch (e) { this._go("fail", { error: "recognition" }); return { ok: false, error: "recognition" }; }
    analysis.audioUrl = audioUrl; analysis.warning = raw.warning || null;
    this._go("done");
    this.emit("result", analysis);
    return { ok: true, analysis };
  }

  /** Back to ready for another attempt (learner's choice). */
  retry() { this.local.revoke(); this._go("retry"); }
  /** Done with this item. */
  next() { this.local.revoke(); this._go("next"); }
  cancel() { this.provider.cancel(); releaseStream(this.stream); this.stream = null; this._go("cancel"); }
  destroy() { this.provider.cancel(); releaseStream(this.stream); this.local.revoke(); }
}
