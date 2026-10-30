/* Recording-screen state machine — pure.
   IDLE → READY → RECORDING → PROCESSING → RESULT → (RETRY → READY | CONTINUE → IDLE)
   Any state may drop into ERROR, from which the learner returns to READY by choice (never automatically). */

export const S = { IDLE: "idle", READY: "ready", RECORDING: "recording", PROCESSING: "processing", RESULT: "result", ERROR: "error" };

export const ERRORS = ["mic-denied", "mic-unavailable", "unsupported", "no-speech", "too-short", "network", "recognition", "save-failed"];

const T = {
  [S.IDLE]:       { prepare: S.READY, fail: S.ERROR },
  [S.READY]:      { start: S.RECORDING, fail: S.ERROR, reset: S.IDLE },
  [S.RECORDING]:  { stop: S.PROCESSING, fail: S.ERROR, cancel: S.READY },
  [S.PROCESSING]: { done: S.RESULT, fail: S.ERROR },
  [S.RESULT]:     { retry: S.READY, next: S.IDLE, fail: S.ERROR },
  [S.ERROR]:      { retry: S.READY, reset: S.IDLE },
};

/** @returns the new state object; an impossible transition returns the SAME object (nothing happens). */
export function reduce(state, event) {
  const to = (T[state.name] || {})[event.type];
  if (!to) return state;
  if (event.type === "fail" && !ERRORS.includes(event.error)) return { name: S.ERROR, error: "recognition" };
  return to === S.ERROR ? { name: S.ERROR, error: event.error } : { name: to };
}
export const initial = () => ({ name: S.IDLE });
