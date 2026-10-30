/* Engine tests with a scriptable provider and a fake window (no browser needed). */
import { SpeakingEngine, analyzeAttempt, MIN_RECORDING_MS } from "../speaking/engine.js";
import { PronunciationProvider, BrowserSpeechProvider, detectSupport, mapRecognitionError } from "../speaking/provider.js";
import { explain } from "../speaking/mic.js";
import { S, ERRORS } from "../speaking/state.js";
const out = []; const ok = (n, c) => out.push([n, !!c]);

/* fake window: mediaDevices + permissions, all scriptable */
function fakeWin({ perm = "prompt", gum = "ok", recognition = true, recorder = false } = {}) {
  let stopped = 0;
  const stream = { getTracks: () => [{ stop: () => { stopped++; } }] };
  const w = {
    navigator: {
      permissions: { query: async () => ({ state: perm }) },
      mediaDevices: { getUserMedia: async () => { if (gum === "ok") return stream; const e = new Error(gum); e.name = gum; throw e; } },
    },
    __stopped: () => stopped,
  };
  if (recognition) w.SpeechRecognition = function () {};
  if (recorder) w.MediaRecorder = function () { this.state = "inactive"; this.start = () => { this.state = "recording"; }; this.stop = () => { this.state = "inactive"; setTimeout(() => this.onstop && this.onstop(), 0); }; };
  return w;
}
class FakeProvider extends PronunciationProvider {
  constructor(result, { fail = null, supported = true } = {}) { super(); this.result = result; this.failStart = fail; this.supported = supported; this.started = 0; }
  get name() { return "fake"; }
  isSupported() { return this.supported; }
  async start() { if (this.failStart) { const e = new Error(this.failStart); e.code = this.failStart; throw e; } this.started++; }
  async stop() { return this.result; }
}
const raw = (transcript, extra = {}) => ({ transcript, confidence: 0.9, durationMs: 3200, speechStartMs: 400, speechEndMs: 3000, segments: [{ startMs: 400, endMs: 3000, text: transcript }], error: null, ...extra });
const T = "I usually wake up at seven";

(async () => {
  /* ── pure analysis per mode ── */
  const rep = analyzeAttempt({ mode: "repeat", level: "A2", target: T, raw: raw("I usually make up at seven") });
  ok("repeat: word accuracy, completion, per-word states, feedback — but no fluency/wpm (one short sentence)", rep.wordAccuracy === 83 && rep.completion === 100 && rep.states.length === 6 && rep.fluency === null && rep.wpm === 0 && rep.feedback.headline);
  ok("repeat: 'wake' is the problem word and appears in the difficult-word update", rep.problemWords.join() === "wake" && rep.difficultChanged.wake === 1);
  const sh = analyzeAttempt({ mode: "shadow", level: "A2", target: T, raw: raw("I usually wake up at seven", { durationMs: 4000, speechStartMs: 500, speechEndMs: 3500 }) });
  ok("shadowing: accuracy 100, wpm measured from the speech window (6 words / 3 s = 120), fluency estimate present", sh.wordAccuracy === 100 && sh.wpm === 120 && typeof sh.fluency === "number");
  const rd = analyzeAttempt({ mode: "read", level: "B1", target: "She suggested going to the market together.", raw: raw("She suggested going to the market") });
  ok("read aloud: completion reflects stopping early; missed word listed", rd.completion < 100 && rd.cmp.missed.join() === "together");
  const fr = analyzeAttempt({ mode: "free", level: "B1", recommendedSec: 60, raw: raw("I want to be a teacher because I like children and I think education is very important for our country", { durationMs: 12000, speechStartMs: 500, speechEndMs: 11500 }) });
  ok("free speaking: duration, words, wpm and fluency estimate — and NO target comparison at all", fr.mode === "free" && fr.durationSec === 12 && fr.wordCount > 15 && fr.wpm > 0 && fr.fluency !== null && !("cmp" in fr) && !("wordAccuracy" in fr));
  ok("free speaking is scored the same whatever 'target' is passed (target ignored)", analyzeAttempt({ mode: "free", level: "B1", target: "COMPLETELY DIFFERENT TEXT", raw: raw("I want to be a teacher because I like children", { durationMs: 8000 }) }).fluency === analyzeAttempt({ mode: "free", level: "B1", target: "", raw: raw("I want to be a teacher because I like children", { durationMs: 8000 }) }).fluency);
  ok("unknown mode throws", (() => { try { analyzeAttempt({ mode: "karaoke", level: "A1", raw: raw("x") }); return false; } catch { return true; } })());
  ok("malformed raw results never crash the analysis", [{}, { transcript: null }, { transcript: 42, durationMs: -5 }, { transcript: "!!!", segments: "x" }].every((r) => { try { return !!analyzeAttempt({ mode: "repeat", level: "A1", target: T, raw: r }); } catch { return false; } }));
  ok("score boundaries: accuracy & completion within 0–100 for 300 random attempts", (() => { const ws = "i usually wake up at seven and drink some tea".split(" "); for (let i = 0; i < 300; i++) { const s = Array.from({ length: i % 10 }, () => ws[Math.floor(Math.random() * ws.length)]).join(" "); const a = analyzeAttempt({ mode: ["repeat", "shadow", "read"][i % 3], level: "B1", target: T, raw: raw(s, { durationMs: 1000 + (i % 7) * 900 }) }); if (a.wordAccuracy < 0 || a.wordAccuracy > 100 || a.completion < 0 || a.completion > 100 || (a.fluency !== null && (a.fluency < 0 || a.fluency > 100))) return false; } return true; })());
  ok("a word that already caused 2 problems is flagged 'needs practice' on the 3rd", analyzeAttempt({ mode: "repeat", level: "A2", target: T, raw: raw("I usually make up at seven"), difficultCounts: { wake: 2 } }).difficult.some((d) => d.word === "wake" && d.count === 3));

  /* ── engine happy path ── */
  let w = fakeWin({ recorder: true });
  let e = new SpeakingEngine({ provider: new FakeProvider(raw(T)), win: w, level: "A2" });
  const states = []; e.on("state", (s) => states.push(s.name));
  ok("prepare: supported + permission 'prompt' → ready (no prompt shown yet)", (await e.prepare()).ok && e.state.name === S.READY);
  const st = await e.start({ mode: "repeat", target: T });
  ok("start → recording; microphone really requested (stream held)", st.ok && e.state.name === S.RECORDING && e.stream !== null);
  let result = null; e.on("result", (r) => { result = r; });
  const sp = await e.stop();
  ok("stop → processing → result with analysis; microphone released", sp.ok && e.state.name === S.RESULT && result.wordAccuracy === 100 && w.__stopped() >= 1 && e.stream === null);
  ok("states visited in order: ready → recording → processing → result", states.join(">") === "ready>recording>processing>result");
  e.retry(); ok("retry → ready", e.state.name === S.READY);
  const again = await e.start({ mode: "repeat", target: T }); await e.stop(); ok("a second attempt works", again.ok && e.state.name === S.RESULT);
  e.next(); ok("next → idle", e.state.name === S.IDLE);
  ok("stop while not recording does nothing", (await e.stop()).error === "not-recording");

  /* ── error paths: every one gives a state AND a message ── */
  w = fakeWin({ perm: "denied" }); e = new SpeakingEngine({ provider: new FakeProvider(raw(T)), win: w });
  let p = await e.prepare();
  ok("permission already denied → friendly error state, nothing requested", !p.ok && e.state.error === "mic-denied");
  e.retry(); ok("…and the learner can come back with 'try again' (never automatic)", e.state.name === S.READY);

  w = fakeWin({ gum: "NotAllowedError" }); e = new SpeakingEngine({ provider: new FakeProvider(raw(T)), win: w }); await e.prepare();
  let r = await e.start({ mode: "repeat", target: T });
  ok("user clicks 'deny' in the prompt → mic-denied", !r.ok && e.state.error === "mic-denied");
  w = fakeWin({ gum: "NotFoundError" }); e = new SpeakingEngine({ provider: new FakeProvider(raw(T)), win: w }); await e.prepare(); r = await e.start({ mode: "repeat", target: T });
  ok("no microphone device → mic-unavailable", e.state.error === "mic-unavailable");
  w = fakeWin({ recognition: false }); e = new SpeakingEngine({ provider: new FakeProvider(raw(T), { supported: false }), win: w });
  ok("unsupported browser → 'unsupported' state, no crash", !(await e.prepare()).ok && e.state.error === "unsupported");
  w = fakeWin(); e = new SpeakingEngine({ provider: new FakeProvider(raw(T), { fail: "recognition" }), win: w }); await e.prepare(); await e.start({ mode: "repeat", target: T });
  ok("recogniser fails to start → error state and the microphone is released again", e.state.error === "recognition" && w.__stopped() >= 1 && e.stream === null);
  w = fakeWin(); e = new SpeakingEngine({ provider: new FakeProvider(raw("", { error: "no-speech" })), win: w }); await e.prepare(); await e.start({ mode: "repeat", target: T }); r = await e.stop();
  ok("empty transcript → 'no-speech' (a retry prompt), NOT a score of zero", !r.ok && e.state.error === "no-speech");
  w = fakeWin(); e = new SpeakingEngine({ provider: new FakeProvider(raw("hi", { durationMs: MIN_RECORDING_MS - 100 })), win: w }); await e.prepare(); await e.start({ mode: "repeat", target: T }); r = await e.stop();
  ok("stopping almost immediately → 'too-short'", !r.ok && e.state.error === "too-short");
  w = fakeWin(); e = new SpeakingEngine({ provider: new FakeProvider(raw("", { error: "network" })), win: w }); await e.prepare(); await e.start({ mode: "repeat", target: T }); r = await e.stop();
  ok("network failure from the recogniser → 'network'", e.state.error === "network");
  w = fakeWin(); e = new SpeakingEngine({ provider: new FakeProvider(raw(T)), win: w }); await e.prepare(); await e.start({ mode: "repeat", target: T });
  e.cancel(); ok("cancel while recording → ready, microphone released", e.state.name === S.READY && w.__stopped() >= 1);
  ok("double start is refused while recording", (await (async () => { w = fakeWin(); e = new SpeakingEngine({ provider: new FakeProvider(raw(T)), win: w }); await e.prepare(); await e.start({ mode: "repeat", target: T }); return e.start({ mode: "repeat", target: T }); })()).error === "busy");
  ok("every error code has a Bengali explanation with a title and body", ERRORS.every((c) => { const x = explain(c); return x.title && x.body && /[\u0980-\u09FF]/.test(x.body); }));
  ok("explanations never blame the learner", ERRORS.every((c) => !/আপনার ভুল|আপনি ব্যর্থ|দোষ/.test(explain(c).body)));
  ok("only 'unsupported' offers no retry button", ERRORS.filter((c) => !explain(c).retry).join() === "unsupported");

  /* ── provider details ── */
  ok("detectSupport reads the window without prompting", (() => { const d = detectSupport(fakeWin({ recorder: true })); return d.recognition && d.getUserMedia && d.mediaRecorder; })() && detectSupport({ navigator: {} }).recognition === false);
  ok("recognition error codes map to ours", mapRecognitionError("no-speech") === "no-speech" && mapRecognitionError("not-allowed") === "mic-denied" && mapRecognitionError("network") === "network" && mapRecognitionError("audio-capture") === "mic-unavailable" && mapRecognitionError("zzz") === "recognition");

  /* BrowserSpeechProvider against a scripted SpeechRecognition */
  let clock = 0; const now = () => clock;
  class Rec { constructor() { Rec.last = this; } start() { Rec.starts = (Rec.starts || 0) + 1; this.onstart && this.onstart(); } stop() { setTimeout(() => this.onend && this.onend(), 0); } abort() {} }
  const win = { SpeechRecognition: Rec, navigator: {} };
  const prov = new BrowserSpeechProvider({ win, now, stopTimeoutMs: 200 });
  await prov.start({ continuous: true });
  const R = Rec.last; const res = (arr, idx = 0) => ({ resultIndex: idx, results: arr });
  const mkr = (text, final, conf = 0.9) => Object.assign([{ transcript: text, confidence: conf }], { isFinal: final });
  clock = 500; R.onspeechstart();
  clock = 900; R.onresult(res([mkr("hello", false)]));
  clock = 2000; R.onresult(res([mkr("hello my name", true)]));
  clock = 5000; R.onresult(res([mkr("hello my name", true), mkr("is Rahim", true)], 1));
  clock = 6000; R.onend();            // Chrome ends after silence in continuous mode → provider restarts
  ok("continuous mode restarts when the browser ends the session early", Rec.starts === 2);
  clock = 7000; const rawOut = await prov.stop();
  ok("transcript = all final segments joined; duration, speech window and 2 segments recorded", rawOut.transcript === "hello my name is Rahim" && rawOut.durationMs === 7000 && rawOut.speechStartMs === 500 && rawOut.speechEndMs === 5000 && rawOut.segments.length === 2 && rawOut.error === null);
  ok("segment timing allows pause measurement (3 s gap between the two results)", rawOut.segments[1].startMs - rawOut.segments[0].endMs >= 2900);
  ok("confidence is averaged", rawOut.confidence === 0.9);
  const prov2 = new BrowserSpeechProvider({ win: { SpeechRecognition: Rec, navigator: {} }, now, stopTimeoutMs: 100 });
  await prov2.start({}); Rec.last.onerror({ error: "no-speech" }); const r2 = await prov2.stop();
  ok("recogniser reported no-speech and nothing was heard → error 'no-speech'", r2.error === "no-speech" && r2.transcript === "");
  const prov3 = new BrowserSpeechProvider({ win: { SpeechRecognition: Rec, navigator: {} }, now, stopTimeoutMs: 100 });
  await prov3.start({}); Rec.last.onresult(res([mkr("only interim words", false)])); const r3 = await prov3.stop();
  ok("browsers that only deliver interim text still give a transcript", r3.transcript === "only interim words");
  const prov4 = new BrowserSpeechProvider({ win: { navigator: {} } });
  ok("no SpeechRecognition → isSupported false and start() rejects with 'unsupported'", !prov4.isSupported() && await prov4.start({}).then(() => false, (e) => e.code === "unsupported"));

  for (const [n, c] of out) console.log(c ? "PASS" : "FAIL", n);
  process.exit(out.every(([, c]) => c) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
