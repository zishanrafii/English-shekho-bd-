/* Build data/dictionary.json — a small word → [Bengali meaning, level, phonetic] lookup used by the
   listening/reading "save word" features (so no 600 KB of vocab files has to be downloaded).
   Run: node tools/build-dictionary.mjs */
import { writeFileSync } from "node:fs";
import { VOCAB_A1 } from "../js/vocab-a1.js";
import { VOCAB_A2 } from "../js/vocab-a2.js";
import { VOCAB_B1 } from "../js/vocab-b1.js";
import { VOCAB_B2 } from "../js/vocab-b2.js";
import { PASSAGES } from "../js/reading-data.js";

const words = {};
const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
const okWord = (w) => /^[a-z][a-z'-]{1,23}$/.test(w);

for (const [lvl, set] of [["A1", VOCAB_A1], ["A2", VOCAB_A2], ["B1", VOCAB_B1], ["B2", VOCAB_B2]]) {
  for (const e of set) {
    const w = clean(e.word).toLowerCase();
    const m = clean(e.meaning);
    if (!okWord(w) || !m || m.length > 60 || words[w]) continue;           // first (= lowest level) entry wins
    words[w] = [m, lvl, clean(e.phonetic)];
  }
}
let fromReading = 0;
for (const p of PASSAGES) {
  for (const [w0, info] of Object.entries(p.vocab || {})) {
    const w = clean(w0).toLowerCase(); const m = clean(info.meaning_bn);
    if (!okWord(w) || !m || m.length > 60 || words[w]) continue;
    words[w] = [m, p.level, ""]; fromReading++;
  }
}
writeFileSync(new URL("../data/dictionary.json", import.meta.url), JSON.stringify({ version: 1, words }));
console.log("entries:", Object.keys(words).length, "(from reading passages:", fromReading + ")");
