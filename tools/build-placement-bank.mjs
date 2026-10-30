/* Build data/placement-bank.json from the hand-calibrated items in placement-handwritten.mjs.
   Run:  node tools/build-placement-bank.mjs   (deterministic — same output every time) */
import { writeFileSync } from "node:fs";
import { GRAMMAR, VOCAB } from "./placement-handwritten.mjs";

let seed = 20260930;                       // tiny deterministic PRNG (mulberry32)
const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const bank = [];
for (const [level, items] of Object.entries(VOCAB)) {
  items.forEach(([word, meaning], i) => {
    const wrong = shuffle(items.filter((x) => x[0] !== word).map((x) => x[1])).slice(0, 3);
    bank.push({ id: `${level.toLowerCase()}v${i + 1}`, level, type: "vocab", stem: word, correct: meaning, wrong });
  });
}
for (const [level, rows] of Object.entries(GRAMMAR)) {
  rows.forEach(([stem, correct, ...wrong], i) => bank.push({ id: `${level.toLowerCase()}g${i + 1}`, level, type: "grammar", stem, correct, wrong }));
}
writeFileSync(new URL("../data/placement-bank.json", import.meta.url), JSON.stringify({ version: 1, items: bank }));
console.log("questions:", bank.length);
