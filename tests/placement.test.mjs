import { readFileSync } from "node:fs";
import { LEVELS, createState, nextItem, record, isDone, result, CONFIG } from "../learning/placement-engine.js";

const bank = JSON.parse(readFileSync(new URL("../data/placement-bank.json", import.meta.url))).items;
const out = [];
const ok = (name, cond) => out.push([name, !!cond]);

/* ── bank integrity ── */
const ids = new Set(bank.map((q) => q.id));
ok("unique ids", ids.size === bank.length);
ok("every level has ≥14 items", LEVELS.every((l) => bank.filter((q) => q.level === l).length >= 14));
ok("4 distinct options, correct not among wrong", bank.every((q) => q.wrong.length === 3 && new Set([q.correct, ...q.wrong]).size === 4));
ok("no empty strings", bank.every((q) => [q.stem, q.correct, ...q.wrong].every((s) => typeof s === "string" && s.trim())));
ok("grammar stems contain a blank", bank.filter((q) => q.type === "grammar").every((q) => q.stem.includes("___")));

/* ── simulation ── */
let seed = 7;
const rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

function run(trueTheta, model, startLevel) {
  const st = createState(startLevel);
  let guard = 0;
  while (!isDone(st) && guard++ < 50) {
    const q = nextItem(st, bank, rand);
    if (!q) break;
    const i = LEVELS.indexOf(q.level);
    let p;
    if (model === "irt") p = CONFIG.guess + (1 - CONFIG.guess) / (1 + Math.exp(-CONFIG.slope * (trueTheta - i)));
    else p = i <= trueTheta ? 0.92 : 0.25 * (i - trueTheta > 1 ? 0.6 : 1);        // step learner: knows everything at/below level, guesses above
    record(st, q, rand() < p);
  }
  return result(st);
}

for (const model of ["irt", "step"]) {
  for (const start of ["self-right", "unsure"]) {
    let within1 = 0, exact = 0, total = 0, qs = 0, maxErr = 0;
    for (let trueLevel = 0; trueLevel <= 5; trueLevel++) {
      for (let r = 0; r < 60; r++) {
        const s = start === "unsure" ? "unsure" : LEVELS[trueLevel];
        const res = run(trueLevel, model, s);
        const err = Math.abs(LEVELS.indexOf(res.level) - trueLevel);
        total++; qs += res.answered; if (err <= 1) within1++; if (err === 0) exact++; maxErr = Math.max(maxErr, err);
      }
    }
    const pct = (within1 / total * 100).toFixed(0), ex = (exact / total * 100).toFixed(0);
    console.log(`sim model=${model.padEnd(4)} start=${start.padEnd(10)} exact=${ex}%  within±1=${pct}%  avgQuestions=${(qs / total).toFixed(1)}  maxErr=${maxErr}`);
    ok(`within ±1 level ≥ 90% (${model}/${start})`, within1 / total >= 0.9);
    ok(`never off by more than 2 (${model}/${start})`, maxErr <= 2);
    ok(`question count within limits (${model}/${start})`, qs / total >= CONFIG.minQuestions && qs / total <= CONFIG.maxQuestions);
  }
}

/* ── extremes ── */
const allWrong = createState("unsure"); while (!isDone(allWrong)) record(allWrong, nextItem(allWrong, bank, rand), false);
ok("all wrong → A1", result(allWrong).level === "A1");
const allRight = createState("unsure"); while (!isDone(allRight)) record(allRight, nextItem(allRight, bank, rand), true);
ok("all right → C1 or C2", ["C1", "C2"].includes(result(allRight).level));
const noRepeat = createState("B1"); const seen = new Set(); let dup = false;
while (!isDone(noRepeat)) { const q = nextItem(noRepeat, bank, rand); if (seen.has(q.id)) dup = true; seen.add(q.id); record(noRepeat, q, rand() > 0.4); }
ok("never repeats a question", !dup);

for (const [n, c] of out) console.log(c ? "PASS" : "FAIL", n);
process.exit(out.every(([, c]) => c) ? 0 : 1);
