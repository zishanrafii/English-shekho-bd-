import { sentences, wordsOf, metrics, lengthTarget, check, applyFix, issueRate, CATEGORY_IDS, CATEGORIES } from "../writing/analyzer.js";
const out = []; const ok = (n, c) => out.push([n, !!c]);
const rules = (t) => check(t).map((i) => i.rule + ":" + i.text + "→" + i.suggestion);
const has = (t, rule, fix) => check(t).some((i) => i.rule.startsWith(rule) && (fix === undefined || i.suggestion === fix));
const none = (t) => check(t).length === 0;

/* sentences & metrics */
ok("sentence split keeps decimals and abbreviations together", sentences("It costs 3.5 dollars. Mr. Rahim came. We left.").map((s) => s.text).join("|") === "It costs 3.5 dollars.|Mr. Rahim came.|We left.");
ok("offsets point at the sentence in the original text", (() => { const t = "  Hello there.  How are you?"; return sentences(t).every((s) => t.slice(s.start, s.end) === s.text); })());
const m = metrics("I like tea. I like tea very much. Tea is good, tea is hot, and tea is cheap.\n\nMy friend likes coffee.");
ok("metrics: words, sentences, paragraphs, average sentence length", m.words === 22 && m.sentences === 4 && m.paragraphs === 2 && m.avgSentence > 5 && m.longestSentence >= 8);
ok("an over-used content word is reported ('tea' ×5)", m.repeatedWords.some((r) => r.word === "tea" && r.count >= 4));
ok("metrics are safe on empty/garbage input", [null, undefined, "", "   ", 42, "!!!"].every((x) => { try { return metrics(x).words === 0; } catch { return false; } }));
ok("length target from the task label ('50–80') or the level", (() => { const a = lengthTarget("50–80"), b = lengthTarget("", "B1"); return a.min === 50 && a.max === 80 && b.min === 80 && b.max === 120; })());

/* ── capitals ── */
ok("lowercase sentence start flagged with the capitalised fix", has("it was late. we went home.", "cap-start", "It") && has("it was late. we went home.", "cap-start", "We"));
ok("'i' alone and i'm/i've flagged → I", has("yesterday i went home", "cap-i", "I") && check("i'm happy").some((x) => x.suggestion === "I'm") && has("I think i've seen it.", "cap-i", "I've"));
ok("capital rules: NO false alarms on correct text, abbreviations, URLs, quotes", none("Hello. I'm Rahim, e.g. a student. Mr. Khan is here. Visit https://example.com today. It is 5 p.m. now. He lives in the U.S. with us.") && none('He said, "Come here." Then he left.') && !has("The iPhone is nice.", "cap-start"));
ok("'in' / 'is' (words that merely contain i) are not mistaken for the pronoun", none("It is in the bin. The pin is thin."));

/* ── punctuation ── */
ok("space before comma/period flagged", has("Hello , world .", "space-before-punct"));
ok("missing space after comma flagged", has("apples,oranges and pears.", "space-after-punct"));
ok("repeated !!! or ,, flagged but '...' is allowed", has("Wow!!!! Great", "repeat-punct") && !has("Well... maybe.", "repeat-punct"));
ok("missing full stop at the end of a paragraph flagged, with the fix at the end", (() => { const t = "I went to the market and bought some fruit"; const i = check(t).find((x) => x.rule === "end-punct"); return i && applyFix(t, i) === t + "."; })());
ok("email greetings / sign-offs / subject lines / short lines do not need a full stop", none("Subject: Leave request\n\nDear Sir,\n\nI need leave tomorrow because I am ill.\n\nRegards,\nRahim"));
ok("a paragraph already ending with . ? ! or a quote is fine", none("Do you like it?") && none('She said "yes."') && none("What a day!"));

/* ── repeated words ── */
ok("'the the' flagged; 'had had', 'that that', 'very very' are legitimate/emphatic and left alone", has("I saw the the dog.", "dup-word") && none("She had had enough. I know that that is true. It is very very good."));

/* ── a / an ── */
ok("a before a vowel sound → an", has("She ate a apple.", "a-an", "an") && has("It is a easy test.", "a-an", "an"));
ok("an before a consonant sound → a", has("He is an teacher.", "a-an", "a") && has("an book", "a-an", "a"));
ok("exceptions: a university / a user / a European / a one-time (vowel LETTER, consonant SOUND)", none("He goes to a university. She is a user. It is a European city. A unit of time. It was a one-time offer."));
ok("exceptions: an hour / an honest man / an heir (consonant LETTER, vowel SOUND)", none("Wait an hour. He is an honest man. She is an heir."));
ok("hour with 'a' is flagged", has("Wait a hour.", "a-an", "an"));
ok("acronyms are never judged (an MBA, a UN, an FBI)", none("He has an MBA. She works at a UN office. An FBI agent came."));
ok("capital A at the start keeps its case", has("A apple fell.", "a-an", "An"));
ok("fix is applied exactly in place", (() => { const t = "She ate a apple today."; return applyFix(t, check(t).find((i) => i.rule === "a-an")) === "She ate an apple today."; })());

/* ── agreement ── */
ok("he/she/it + base form → -s form", has("He go to school.", "sva-3sg", "goes") && has("She have a car.", "sva-3sg", "has") && has("It don't work.", "sva-3sg", "doesn't") && has("He are tired.", "sva-3sg", "is"));
ok("I is / I has / you is / they has / we was", has("I is happy.", "sva-i", "am") && has("I has a pen.", "sva-i", "have") && has("You is late.", "sva-plural", "are") && has("They has money.", "sva-plural", "have"));
ok("NO false alarms: correct agreement", none("He goes to school. She has a car. It doesn't work. He is tired. I am happy. I have a pen. You are late. They have money. We were there."));
ok("NO false alarm after auxiliaries/questions ('Would he have gone?', 'Does she do it?', 'to have', 'let him go')", none("Would he have gone? Does she do it? I told her not to go. Let him go home. Can he have it?"));
ok("NO false alarm for the subjunctive ('I suggest that he go', 'It is important that she have time')", none("I suggest that he go home. It is important that she have enough time. If he were here, I would ask."));
ok("didn't + past form → base", has("I didn't went there.", "didnt-past", "go") && has("She didn't saw it.", "didnt-past", "see") && has("He did not took it.", "didnt-past", "take"));
ok("didn't + base form is fine, 'didn't was' is not rewritten", none("I didn't go there. She didn't see it.") && !has("It didn't was good.", "didnt-past"));
ok("doesn't + -s form → base", has("He doesn't likes tea.", "doesnt-sg", "like") && none("He doesn't like tea."));

/* ── fixed phrases ── */
ok("discuss about → discuss (Bengali-learner classic)", has("We discussed about the plan.", "phrase", "discussed") && has("Let us discuss about it.", "phrase", "discuss"));
ok("married with / marry with, reach to, emphasize on, explain me, cope up with, depend of, interested on, listen music, arrive to, pay attention on", ["He is married with her.", "She will marry with him.", "We reached to Dhaka.", "He emphasized on safety.", "Please explain me this.", "I cope up with stress.", "It depend of the weather.", "I am interested on art.", "I listen music daily.", "We arrived to the station.", "Pay attention on the road."].every((t) => check(t).some((i) => i.category === "preposition")));
ok("suggestions read correctly", (() => { const f = (t) => { const i = check(t).find((x) => x.category === "preposition"); return applyFix(t, i); }; return f("Please explain me this.") === "Please explain to me this." && f("I listen music daily.") === "I listen to music daily." && f("It depend of the weather.") === "It depend on the weather." && f("He is married with her.") === "He is married to her." && f("We discussed about the plan.") === "We discussed the plan."; })());
ok("return back, I am agree, I have 20 years old, since 2 years, more better", has("Please return back soon.", "phrase", "return") && has("I am agree with you.", "phrase", "I agree") && has("I have 20 years old.", "phrase", "I am 20 years old") && has("I have lived here since two years.", "phrase", "for two years") && has("It is more better now.", "phrase", "better"));
ok("'since 2020' and 'for two years' are correct and untouched", none("I have lived here since 2020. I have lived here for two years."));
ok("uncountable/irregular plurals: informations, advices, peoples", has("I need informations.", "plural-form", "information") && has("Many peoples came.", "plural-form", "people") && has("Give me advices.", "plural-form", "advice"));
ok("correct words that merely look similar are untouched ('informative', 'peopled', 'reached Dhaka', 'listen to music')", none("It is informative. We reached Dhaka. I listen to music. She married him."));

/* ── overall behaviour ── */
const sample = "yesterday i go to the market , i didn't bought a apple. He don't like it and we discussed about the the price";
const found = check(sample);
ok("a realistic paragraph: many categories found, sorted by position, none overlapping", found.length >= 8 && found.every((f, i) => i === 0 || f.start >= found[i - 1].end - 0) && new Set(found.map((f) => f.category)).size >= 4);
ok("applying every fix from the END of the text keeps positions valid and gives a better text", (() => { let t = sample; [...found].sort((a, b) => b.start - a.start).forEach((f) => { t = applyFix(t, f); }); return check(t).length < found.length && t.includes("an apple") && t.includes("doesn't like"); })());
ok("issue rate per 100 words: clean text 0, messy text clearly higher", issueRate("I like tea. It is hot.") === 0 && issueRate(sample) > 20);
ok("every issue has an id, a valid category, a Bengali explanation and a suggestion", found.every((f) => f.rule && CATEGORY_IDS.includes(f.category) && /[\u0980-\u09FF]/.test(f.explainBn) && typeof f.suggestion === "string"));
ok("categories have Bengali/English labels", CATEGORY_IDS.every((c) => CATEGORIES[c].bn));
ok("clean paragraph (A2 style) produces ZERO issues — false-positive guard", none("Last weekend I went to my grandmother's house. She lives in a small village near the river. We cooked rice and fish together, and she told me stories about her childhood. It was an interesting day, and I want to visit her again."));
ok("clean B2 text with subordinate clauses, contractions and questions: zero issues", none("If he had known about the traffic, he would have left earlier. Doesn't she think it's a good idea? They've lived here for ten years, haven't they? Not only is it cheaper, but it is also more reliable."));
ok("malformed input never throws", [null, undefined, 42, {}, "", "   ", "😀😀", "\n\n\n"].every((x) => { try { return Array.isArray(check(x)); } catch { return false; } }));
let bad = 0; for (let i = 0; i < 300; i++) { const chunks = ["He go", "a apple", "the the", "i am", "discuss about", "I am agree", "hello , there", "It is fine.", "She have", "didn't went"]; const t = Array.from({ length: 1 + (i % 8) }, (_, k) => chunks[(i * 7 + k * 3) % chunks.length]).join(" "); const f = check(t); if (f.some((x) => x.start < 0 || x.end > t.length || x.start > x.end)) bad++; }
ok("300 random texts: every issue range lies inside the text", bad === 0);

for (const [n, c] of out) console.log(c ? "PASS" : "FAIL", n);
process.exit(out.every(([, c]) => c) ? 0 : 1);
