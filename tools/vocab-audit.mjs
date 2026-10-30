/* Vocabulary dataset audit. Run: node tools/vocab-audit.mjs
   Writes docs/VOCAB_AUDIT.md (human report) and data/vocab-flags.json (id → flag codes used by the SRS word picker).
   It NEVER edits the vocab files: level labels need a human/teacher decision, so we flag instead of deleting. */
import { writeFileSync } from "node:fs";
import { VOCAB_A1 } from "../js/vocab-a1.js";
import { VOCAB_A2 } from "../js/vocab-a2.js";
import { VOCAB_B1 } from "../js/vocab-b1.js";
import { VOCAB_B2 } from "../js/vocab-b2.js";

const SETS = { A1: VOCAB_A1, A2: VOCAB_A2, B1: VOCAB_B1, B2: VOCAB_B2 };
const ORDER = ["A1", "A2", "B1", "B2"];

/* Everyday words a beginner meets in the first weeks. If one of these sits in B1/B2 the label is almost surely wrong. */
const BASIC = new Set(`a about after again all also always am an and any apple are ask at baby back bad bag be because bed before big bird black blue
body book boy bread breakfast brother brown but buy by call can car cat chair child city class clean close clothes cold color come cook cool
cup dad day dinner do dog door down drink eat egg eight english evening eye face family fast father fish five floor food foot four friend from fruit
game girl give go good green hair hand happy have he head hello help her here him his home horse hot house how hungry i ice if in is it job juice
keep key kind kitchen know lamp late learn left leg like listen little live long look love lunch make man many market may me milk mix money month
morning mother much music my name near new next nice night nine no nose not now number of off old on one open or orange other our out over paper
parent park pen people phone pink play please pocket put rain read red rice right room run sad salt same say school see sell seven she shirt shoe
shop short sing sister sit six sleep slow small snow so some son sorry speak spring stand star start stop street student sugar summer sun swim table
take talk tall tea teacher ten thank that the their then there these they thing think this three time tired to today tomorrow too town train tree
try two under up use very walk want warm wash water we week well what when where which white who why will window winter with woman work write
year yellow yes yesterday you young`.split(/\s+/));

/* Words that are almost the same in Bengali (loan words / internationalisms): easy for Bengali learners even if "B2" in English-only lists. */
const LOAN = new Set(`balcony marathon protein vitamin backup camera computer internet mobile taxi hotel bus radio television video audio doctor engineer
hospital university college school station ticket menu bank police ambulance football cricket tennis hockey gas oil petrol diesel battery
online email website software hardware password laptop tablet printer scanner pizza burger sandwich coffee chocolate biscuit sauce soup salad
passport visa airport platform terminal cinema theatre museum stadium gallery restaurant cafe cabin garage engine machine motor pump tractor
robot virus bacteria oxygen carbon calcium plastic metal cement steel nylon rubber tank team captain coach manager marketing brand logo
photo selfie poster banner tour training workshop seminar forum campus lab laboratory formula tablet capsule injection vaccine`.split(/\s+/));

const norm = (w) => String(w || "").trim().toLowerCase();
const flags = {};
const add = (id, f) => ((flags[id] ||= []).includes(f) || flags[id].push(f));
const firstSeen = {};      // word → first level it appears in
const stats = { total: 0, byLevel: {}, codes: {} };
const examples = {};

for (const lvl of ORDER) {
  const seenHere = new Map();
  stats.byLevel[lvl] = SETS[lvl].length;
  for (const w of SETS[lvl]) {
    stats.total++;
    const key = norm(w.word);
    if (!w.meaning || !String(w.meaning).trim()) add(w.id, "missing_meaning");
    if (!w.example || !String(w.example).trim()) add(w.id, "missing_example");
    if (!w.phonetic) add(w.id, "missing_phonetic");
    if (seenHere.has(key)) add(w.id, "dup_in_level"); else seenHere.set(key, w.id);
    if (firstSeen[key] && firstSeen[key] !== lvl) add(w.id, "dup_across_levels");
    else if (!firstSeen[key]) firstSeen[key] = lvl;
    if (ORDER.indexOf(lvl) >= 1 && BASIC.has(key)) add(w.id, "basic_in_higher_level");
    if (ORDER.indexOf(lvl) >= 2 && LOAN.has(key)) add(w.id, "easy_loanword");
    if (/\s/.test(key)) add(w.id, "phrase");
    if (w.example) {
      const stem = key.replace(/(ing|ed|es|s|e|y)$/, "");
      if (stem.length >= 3 && !norm(w.example).includes(stem.slice(0, Math.max(3, stem.length - 1)))) add(w.id, "example_may_not_use_word");
    }
  }
}
const byId = Object.fromEntries(ORDER.flatMap((l) => SETS[l].map((w) => [w.id, { ...w, lvl: l }])));
for (const [id, f] of Object.entries(flags)) f.forEach((c) => { stats.codes[c] = (stats.codes[c] || 0) + 1; (examples[c] ||= []).push(byId[id].lvl + ":" + byId[id].word); });

/* words the SRS picker should avoid when introducing NEW words (they stay available in the dictionary pages) */
const AVOID = new Set(["missing_meaning", "dup_in_level", "dup_across_levels", "basic_in_higher_level", "easy_loanword"]);
const avoid = Object.entries(flags).filter(([, f]) => f.some((c) => AVOID.has(c))).map(([id]) => id);
writeFileSync(new URL("../data/vocab-flags.json", import.meta.url), JSON.stringify({ version: 1, avoid, flags }));

const pct = (n) => ((n / stats.total) * 100).toFixed(1) + "%";
const lines = [];
lines.push("# Vocabulary dataset audit", "", `Generated by \`node tools/vocab-audit.mjs\`. **No vocabulary file was modified.** Findings are flags for a teacher/editor to review.`, "");
lines.push("## Size", "", "| Level | Words |", "|---|---|", ...ORDER.map((l) => `| ${l} | ${stats.byLevel[l]} |`), `| **Total** | **${stats.total}** |`, "");
lines.push("## Findings", "", "| Flag | Count | Share | Meaning |", "|---|---|---|---|");
const DESC = {
  dup_across_levels: "same word already appears in a lower level (e.g. Routine in A2 and B1)",
  dup_in_level: "same word twice inside one level",
  basic_in_higher_level: "very basic everyday word placed in A2/B1/B2 (label probably wrong)",
  easy_loanword: "international/loan word that Bengali speakers already know, placed in B1/B2 (e.g. Protein, Balcony, Marathon)",
  phrase: "multi-word entry (phrasal verb / expression)",
  example_may_not_use_word: "the example sentence may not contain the word (check manually)",
  missing_meaning: "no Bengali meaning", missing_example: "no example sentence", missing_phonetic: "no phonetic",
};
Object.entries(stats.codes).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => lines.push(`| \`${c}\` | ${n} | ${pct(n)} | ${DESC[c] || ""} |`));
lines.push("", `Words the Smart Review will **not introduce as new** (flagged as unreliable for their level): **${avoid.length}** of ${stats.total} (${pct(avoid.length)}). They remain in the vocabulary pages.`, "");
lines.push("## Samples (first 12 per flag)", "");
for (const [c, list] of Object.entries(examples)) lines.push(`- \`${c}\`: ${list.slice(0, 12).join(", ")}${list.length > 12 ? ", …" : ""}`);
lines.push("", "## Recommended next step", "", "Have an English teacher re-label levels using a recognised wordlist (CEFR-J, Oxford 3000/5000 or the English Vocabulary Profile). The heuristics here find obvious errors; they cannot certify the remaining words.");
writeFileSync(new URL("../docs/VOCAB_AUDIT.md", import.meta.url), lines.join("\n") + "\n");
console.log(JSON.stringify(stats), "avoid:", avoid.length);
