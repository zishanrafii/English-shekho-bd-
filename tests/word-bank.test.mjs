import { readFileSync } from "node:fs";
import { normalizeWord, wordCardId, buildWordCard, findSentence, lookup, cleanMeaning } from "../learning/word-bank.js";
const dict = JSON.parse(readFileSync(new URL("../data/dictionary.json", import.meta.url))).words;
const out = []; const ok = (n, c) => out.push([n, !!c]);
const T = "2026-10-03";

ok("normalize: case, punctuation, curly apostrophes", normalizeWord("  Umbrella, ") === "umbrella" && normalizeWord("Don’t!") === "don't" && normalizeWord("123") === "");
ok("card id is a safe, stable Firestore id distinct from dataset ids", wordCardId("Umbrella!") === "x_umbrella" && wordCardId("well-known") === "x_well_known" && !/^[ab][12]w\d+$/.test(wordCardId("a1w1")));
ok("card id length is bounded", wordCardId("x".repeat(80)).length <= 32);

const c = buildWordCard({ word: "Umbrella", meaning: "ছাতা", example: "She took an <b>umbrella</b>.", level: "A1", src: "listening" }, T);
ok("card fields match the rules (required + optional only)", ["word","level","ease","interval","reps","lapses","due","last"].every((k) => k in c) && Object.keys(c).every((k) => ["word","level","ease","interval","reps","lapses","due","last","saved","known","src","meaning","example"].includes(k)));
ok("card is due today and flagged saved", c.due === T && c.saved === true && c.interval === 0 && c.reps === 0);
ok("source is recorded; unknown sources fall back to 'reading'", c.src === "listening" && buildWordCard({ word: "cat", meaning: "বিড়াল", src: "x" }, T).src === "reading");
ok("a word saved while speaking is tagged src=speaking", buildWordCard({ word: "wake", meaning: "জাগা", src: "speaking" }, T).src === "speaking");
ok("markup characters are removed from the example", !/[<>]/.test(c.example));
ok("meaning/example are clipped to the rule limits", cleanMeaning("ক".repeat(300)).length <= 80 && buildWordCard({ word: "cat", meaning: "m", example: "e".repeat(900) }, T).example.length <= 200);
ok("a word without a meaning is rejected (review would be useless)", (() => { try { buildWordCard({ word: "cat", meaning: "  " }, T); return false; } catch (e) { return e.message === "meaning_required"; } })());
ok("invalid words are rejected", ["", "a", "123", "x".repeat(40)].every((w) => { try { buildWordCard({ word: w, meaning: "m" }, T); return false; } catch { return true; } }));
ok("unknown level falls back to A1", buildWordCard({ word: "cat", meaning: "m", level: "Z9" }, T).level === "A1");

const text = ["It was a rainy morning. She forgot her umbrella at home.", "Despite the rain, he walked to school."];
ok("finds the sentence containing the word", findSentence(text, "umbrella") === "She forgot her umbrella at home.");
ok("finds it in a later paragraph, whole-word only", findSentence(text, "despite") === "Despite the rain, he walked to school." && findSentence(text, "rain") === "Despite the rain, he walked to school.");
ok("no partial matches ('rain' must not match 'train')", findSentence(["The train arrived."], "rain") === "");
ok("missing word → empty string", findSentence(text, "zebra") === "");

/* phrases and accents (a few reading-passage vocab entries are 2-word phrases or have accents) */
ok("phrases keep their single space", normalizeWord("  Sore   Throat! ") === "sore throat" && wordCardId("Sore Throat") === "x_sore_throat");
ok("accented letters survive ('résumé')", normalizeWord("Résumé") === "résumé");
ok("a phrase becomes a valid card", buildWordCard({ word: "identity card", meaning: "পরিচয়পত্র" }, T).word === "identity card");
ok("phrase context sentence is found across spacing", findSentence(["She showed her identity  card at the gate."], "identity card").includes("identity"));

ok("dictionary has thousands of entries", Object.keys(dict).length > 2000);
ok("lookup: exact", lookup(dict, "Umbrella").meaning === "ছাতা");
ok("lookup: plural / -ed / -ing / -ies forms resolve to the base word", lookup(dict, "umbrellas")?.word === "umbrella" && lookup(dict, "walked")?.word === "walk" && lookup(dict, "borrowing")?.word === "borrow" && lookup(dict, "studies")?.word === "study" && lookup(dict, "cried")?.word === "cry" && lookup(dict, "books")?.word === "book");
ok("lookup: unknown word → null", lookup(dict, "qwertyuiop") === null && lookup(null, "cat") === null && lookup(dict, "") === null);
ok("lookup: no prototype leaks ('constructor')", lookup(dict, "constructor") === null && lookup(dict, "toString") === null);

for (const [n, cnd] of out) console.log(cnd ? "PASS" : "FAIL", n);
process.exit(out.every(([, x]) => x) ? 0 : 1);
