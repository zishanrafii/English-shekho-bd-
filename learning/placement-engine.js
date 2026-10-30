/* ═══════════════════════════════════════════════════════════
   Placement engine (Phase 5) — adaptive, pure, no imports.
   Model: 1-parameter IRT with a guessing floor (4 options → 25%).
     P(correct | ability θ, item level i) = g + (1-g) · sigmoid(k·(θ − i))
   θ is on the CEFR index scale: A1=0 … C2=5.
   We keep a posterior over θ on a grid, always ask the item whose
   level is closest to the current estimate, and stop when the
   estimate is stable (or at the maximum length).
   ═══════════════════════════════════════════════════════════ */
export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const CONFIG = { guess: 0.25, slope: 1.7, minQuestions: 10, maxQuestions: 18, stopSd: 0.5, bias: 0.25 };   // bias: recommend slightly conservatively (easier start is kinder than a hard one)

const GRID = Array.from({ length: 61 }, (_, i) => -0.5 + i * 0.1);   // −0.5 … 5.5
const sigmoid = (x) => 1 / (1 + Math.exp(-x));
const pCorrect = (theta, itemIdx) => CONFIG.guess + (1 - CONFIG.guess) * sigmoid(CONFIG.slope * (theta - itemIdx));
const levelIdx = (l) => LEVELS.indexOf(l);

/** startLevel: self-chosen level id (A1..C2) or "unsure"/undefined. */
export function createState(startLevel) {
  const start = levelIdx(startLevel);
  const mean = start >= 0 ? start : 2.0;
  const sd = start >= 0 ? 1.3 : 2.6;      // unsure → very flat prior, let the answers decide
  const logPost = GRID.map((t) => -0.5 * ((t - mean) / sd) ** 2);       // Gaussian prior (log-space)
  return { logPost, answers: [], asked: [] };
}

function posterior(state) {
  const m = Math.max(...state.logPost);
  const w = state.logPost.map((l) => Math.exp(l - m));
  const z = w.reduce((a, b) => a + b, 0);
  return w.map((x) => x / z);
}
export function summary(state) {
  const p = posterior(state);
  const mean = GRID.reduce((a, t, i) => a + t * p[i], 0);
  const sd = Math.sqrt(GRID.reduce((a, t, i) => a + (t - mean) ** 2 * p[i], 0));
  return { theta: mean, sd };
}

/** Record an answer. choice = index of chosen option, or null for "I don't know". */
export function record(state, item, isCorrect) {
  const i = levelIdx(item.level);
  state.logPost = state.logPost.map((l, g) => {
    const p = pCorrect(GRID[g], i);
    return l + Math.log(isCorrect ? p : 1 - p);
  });
  state.answers.push({ id: item.id, level: item.level, type: item.type, correct: !!isCorrect });
  state.asked.push(item.id);
  return state;
}

/** Choose the next unasked item: level closest to current estimate, alternate vocab/grammar. */
export function nextItem(state, items, rand = Math.random) {
  const { theta } = summary(state);
  const a = state.answers;
  const lastType = a.length ? a[a.length - 1].type : null;
  // probing: a streak means the estimate is probably too timid, so look beyond it
  let aim = theta;
  if (a.length >= 2 && a[a.length - 1].correct && a[a.length - 2].correct) aim += 1;
  else if (a.length >= 2 && !a[a.length - 1].correct && !a[a.length - 2].correct) aim -= 1;
  aim = Math.min(5, Math.max(0, aim));
  const free = items.filter((q) => !state.asked.includes(q.id));
  if (!free.length) return null;
  const scored = free.map((q) => ({
    q,
    d: Math.abs(levelIdx(q.level) - aim) + (q.type === lastType ? 0.35 : 0) + rand() * 0.2,   // small jitter for variety
  }));
  scored.sort((a, b) => a.d - b.d);
  return scored[0].q;
}

export function isDone(state) {
  const n = state.answers.length;
  if (n >= CONFIG.maxQuestions) return true;
  if (n < CONFIG.minQuestions) return false;
  const tail = state.answers.slice(-3);
  const streak = tail.length === 3 && tail.every((x) => x.correct === tail[0].correct);
  if (streak) return false;                   // still moving — keep probing (bounded by maxQuestions)
  return summary(state).sd <= CONFIG.stopSd;
}

/** Final result. */
export function result(state) {
  const { theta, sd } = summary(state);
  const idx = Math.min(5, Math.max(0, Math.round(theta - CONFIG.bias)));
  const n = state.answers.length;
  const correct = state.answers.filter((a) => a.correct).length;
  const confidence = sd <= 0.45 ? "high" : sd <= 0.7 ? "medium" : "low";
  const byType = {};
  for (const a of state.answers) {
    const t = (byType[a.type] ||= { n: 0, c: 0 });
    t.n++; if (a.correct) t.c++;
  }
  return { level: LEVELS[idx], theta: Math.round(theta * 100) / 100, sd: Math.round(sd * 100) / 100, confidence, answered: n, correct, byType };
}
