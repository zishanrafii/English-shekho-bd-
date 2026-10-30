/* ═══════════════════════════════════════════════════════════
   Writing analyzer — pure, deterministic, no imports.
   1) metrics     words, sentences, variety, repeated words …
   2) rule checks HIGH-PRECISION patterns only (a/an, he go, discuss about …)
   Every rule is conservative on purpose: a wrong "correction" teaches the
   wrong thing. Anything subtle (prepositions in general, tense, style, word
   choice) is left to the optional AI coach, which must quote the learner's
   own words so it can be verified.
   ═══════════════════════════════════════════════════════════ */

export const CATEGORIES = {
  article:        { bn: "Articles (a/an/the)" },
  preposition:    { bn: "Prepositions" },
  tense:          { bn: "Tenses / verb form" },
  agreement:      { bn: "Subject–verb agreement" },
  "word-choice":  { bn: "Word choice" },
  "word-form":    { bn: "Word form (singular/plural)" },
  "word-order":   { bn: "Word order" },
  spelling:       { bn: "Spelling" },
  capitalization: { bn: "Capital letters" },
  punctuation:    { bn: "Punctuation" },
  repetition:     { bn: "Repeated words" },
  other:          { bn: "Other" },
};
export const CATEGORY_IDS = Object.keys(CATEGORIES);

const ABBR = new Set(["mr", "mrs", "ms", "dr", "prof", "sr", "jr", "st", "vs", "etc", "eg", "ie", "no", "approx"]);
const STOP = new Set(`the and for are but not you all can had her was one our out has have this that with they will from your what when where which their there been were said each she how its who did get may him his than then them these some would about after again also because before could every first into just like make many more most much must only other over such take those very well while white why yes i a an to of in on at is it he we my me do so if or as be by up am no`.split(/\s+/));

/* ───────────────────────── text → sentences ───────────────────────── */
/** Split into sentences with their offsets. Keeps "3.5", "e.g.", "Mr." inside a sentence. */
export function sentences(text) {
  const out = []; const t = String(text || "");
  let start = 0; const re = /[.!?]+(?=\s|$)|\n{2,}/g; let m;
  const push = (s, e) => { const raw = t.slice(s, e); const lead = raw.length - raw.trimStart().length; const body = raw.trim(); if (body) out.push({ start: s + lead, end: s + lead + body.length, text: body }); };
  while ((m = re.exec(t))) {
    const before = t.slice(start, m.index).match(/([A-Za-z]+)$/);
    const prevWord = before ? before[1].toLowerCase() : "";
    const pre = t.slice(Math.max(0, m.index - 8), m.index);
    if (m[0][0] === "." && (ABBR.has(prevWord) || /(^|[^A-Za-z])[A-Za-z](\.[A-Za-z])+$/.test(pre))) continue;   // Mr. / e.g. / i.e. / U.S. / a.m.
    push(start, m.index + m[0].length); start = m.index + m[0].length;
  }
  push(start, t.length);
  return out;
}

export const wordsOf = (text) => (String(text || "").match(/[A-Za-z][A-Za-z'’-]*/g) || []);

/* ───────────────────────── metrics ───────────────────────── */
export function metrics(text) {
  const t = String(text || ""); const w = wordsOf(t); const s = sentences(t);
  const lower = w.map((x) => x.toLowerCase().replace(/[’]/g, "'"));
  const content = lower.filter((x) => x.length > 2 && !STOP.has(x));
  const counts = {}; content.forEach((x) => { counts[x] = (counts[x] || 0) + 1; });
  const repeatedWords = Object.entries(counts).filter(([, n]) => n >= 4 && n / Math.max(1, w.length) >= 0.04).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([word, count]) => ({ word, count }));
  const sLens = s.map((x) => wordsOf(x.text).length);
  return {
    words: w.length, sentences: s.length, paragraphs: t.split(/\n\s*\n/).filter((p) => p.trim()).length,
    avgSentence: s.length ? Math.round((w.length / s.length) * 10) / 10 : 0, longestSentence: sLens.length ? Math.max(...sLens) : 0,
    uniqueWords: new Set(content).size, variety: content.length ? Math.round((new Set(content).size / Math.sqrt(content.length)) * 10) / 10 : 0,
    repeatedWords,
  };
}

/** Length target from a task's "50–80" string (or a level default). Returns {min,max}. */
export function lengthTarget(wordsLabel, level) {
  const m = String(wordsLabel || "").match(/(\d+)\D+(\d+)/);
  if (m) return { min: +m[1], max: +m[2] };
  const D = { A1: [30, 50], A2: [50, 80], B1: [80, 120], B2: [120, 200], C1: [180, 280], C2: [250, 400] };
  const d = D[level] || D.A1; return { min: d[0], max: d[1] };
}

/* ───────────────────────── rule checks ───────────────────────── */
const VOWEL_SOUND_EXCEPT_A = new Set(["university", "universities", "uniform", "unit", "units", "union", "unique", "universe", "universal", "user", "users", "useful", "usual", "usually", "utensil", "utility", "european", "europe", "one", "once", "ubiquitous", "eulogy", "euro", "ewe", "ukulele", "unicorn", "unified", "unisex", "usage", "used"]);   // start with a vowel LETTER, consonant SOUND → "a"
const AN_BEFORE_CONSONANT = new Set(["hour", "hours", "honest", "honestly", "honor", "honour", "heir", "heirs", "herb", "hourly"]);                                                                                                    // start with a consonant LETTER, vowel SOUND → "an"
const AUX = new Set(["do", "does", "did", "can", "could", "will", "would", "shall", "should", "may", "might", "must", "to", "let", "lets", "not", "never", "and", "or"]);
const SUBJ_THAT = /\b(suggest|suggests|suggested|recommend|recommends|recommended|insist|insists|insisted|demand|demanded|require|required|important|essential|vital|necessary|if|wish|wishes|rather)\b/i;

const IRREG = { went: "go", saw: "see", ate: "eat", came: "come", took: "take", made: "make", gave: "give", got: "get", had: "have", said: "say", knew: "know", found: "find", bought: "buy", wrote: "write", spoke: "speak", ran: "run", began: "begin", did: "do", was: "be", were: "be", told: "tell", felt: "feel", left: "leave", met: "meet", paid: "pay", thought: "think", brought: "bring", lost: "lose", heard: "hear" };
const SG_TO_BASE = { goes: "go", has: "have", does: "do", comes: "come", eats: "eat", likes: "like", wants: "want", needs: "need", knows: "know", takes: "take", makes: "make" };
const UNCOUNTABLE_PLURAL = { informations: "information", advices: "advice", furnitures: "furniture", knowledges: "knowledge", equipments: "equipment", homeworks: "homework", luggages: "luggage", researches: "research", peoples: "people", childs: "children", feets: "feet", mans: "men", womans: "woman" };

const PHRASES = [
  [/\bdiscuss(ed|es|ing)? about\b/gi, (m) => "discuss" + (m[1] || ""), "preposition", "“discuss”-এর পরে about বসে না। সরাসরি বিষয় বলুন: discuss the plan।"],
  [/\bmarry(ing)? with\b/gi, (m) => "marry", "preposition", "“marry”-এর পরে with বসে না: She married him। (married to him / get married to)"],
  [/\b(?:is|am|are|was|were|get|got) married with\b/gi, (m) => m[0].replace(/ with$/i, " to"), "preposition", "“married”-এর সাথে to বসে: married to him।"],
  [/\breach(ed|es|ing)? to\b(?! (?:be|a person|know))/gi, (m) => "reach" + (m[1] || ""), "preposition", "“reach”-এর পরে to বসে না: reach Dhaka। (arrive in/at)"],
  [/\bemphasi[sz]e(d|s)? on\b/gi, (m) => m[0].replace(/ on$/i, ""), "preposition", "“emphasize”-এর পরে on বসে না: emphasize the importance।"],
  [/\bexplain (me|him|her|us|them)\b/gi, (m) => "explain to " + m[1], "preposition", "“explain”-এর পরে ব্যক্তির আগে to লাগে: explain to me।"],
  [/\breturn(ed|s|ing)? back\b/gi, (m) => "return" + (m[1] || ""), "word-choice", "“return”-এর মধ্যেই “ফিরে” অর্থ আছে, তাই back বাড়তি।"],
  [/\bcope(d|s)? up with\b/gi, (m) => "cope" + (m[1] || "") + " with", "preposition", "সঠিক রূপ: cope with।"],
  [/\bdepend(s|ed)? of\b/gi, (m) => "depend" + (m[1] || "") + " on", "preposition", "সঠিক রূপ: depend on।"],
  [/\binterested (on|about|at)\b/gi, () => "interested in", "preposition", "সঠিক রূপ: interested in।"],
  [/\bafraid (from|about of)\b/gi, () => "afraid of", "preposition", "সঠিক রূপ: afraid of।"],
  [/\blisten(ed|s|ing)? (music|songs?|radio|him|her|them|me|you|us)\b/gi, (m) => "listen" + (m[1] || "") + " to " + m[2], "preposition", "“listen”-এর পরে to লাগে: listen to music।"],
  [/\barriv(e|ed|es|ing) to\b/gi, (m) => "arriv" + m[1] + " at/in", "preposition", "“arrive”-এর পরে at বা in বসে (arrive in Dhaka / at the station)।"],
  [/\bpay(s|ing)? attention (on|for)\b/gi, (m) => "pay" + (m[1] || "") + " attention to", "preposition", "সঠিক রূপ: pay attention to।"],
  [/\bI am agree\b/gi, () => "I agree", "tense", "“agree” নিজেই ক্রিয়া, am লাগে না: I agree।"],
  [/\bI have (\d+) years? old\b/gi, (m) => "I am " + m[1] + " years old", "tense", "বয়স বলতে be-ক্রিয়া: I am 20 years old।"],
  [/\bsince (\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten|several) (years?|months?|weeks?|days?|hours?)\b/gi, (m) => "for " + m[1] + " " + m[2], "preposition", "সময়ের দৈর্ঘ্যের (২ বছর) আগে for বসে; since বসে নির্দিষ্ট সময়ের (২০২০ থেকে) আগে।"],
  [/\b(more|most) (better|worse|easier|bigger|smaller|faster|cheaper|taller|best|worst)\b/gi, (m) => m[2], "word-form", "better/easier-এর মধ্যেই “আরও” অর্থ আছে, তাই more লাগে না।"],
];

function issue(rule, cat, start, end, text, suggestion, bn) { return { rule, category: cat, start, end, text, suggestion, explainBn: bn }; }

/** All rule-based issues, sorted by position, non-overlapping. */
export function check(text) {
  const t = String(text || ""); const found = [];

  /* A) capital letters */
  for (const s of sentences(t)) {
    const m = s.text.match(/^["'“‘(]*([a-z])/);
    if (m && !/^(e\.g|i\.e|iPhone|eBay)/.test(s.text)) {
      const idx = s.start + s.text.indexOf(m[1], m[0].length - 1);
      const word = (s.text.slice(idx - s.start).match(/^[A-Za-z'’-]+/) || [""])[0];
      if (!/^(?:https?|www)/i.test(word)) found.push(issue("cap-start", "capitalization", idx, idx + word.length, word, word[0].toUpperCase() + word.slice(1), "বাক্যের প্রথম অক্ষর বড় হাতের (capital) হয়।"));
    }
  }
  for (const m of t.matchAll(/(?<![A-Za-z'’-])i(?=(?:'|’)(?:m|ve|ll|d)\b|\s|[,.!?;:]|$)(?:(?:'|’)(?:m|ve|ll|d))?/g)) {
    const w = m[0]; found.push(issue("cap-i", "capitalization", m.index, m.index + w.length, w, "I" + w.slice(1), "“I” সবসময় বড় হাতের।"));
  }

  /* B) punctuation */
  for (const m of t.matchAll(/ +([,.!?;:])/g)) found.push(issue("space-before-punct", "punctuation", m.index, m.index + m[0].length, m[0], m[1], "বিরামচিহ্নের আগে ফাঁকা জায়গা বসে না।"));
  for (const m of t.matchAll(/([,;:])\1+|([!?])\2{2,}/g)) found.push(issue("repeat-punct", "punctuation", m.index, m.index + m[0].length, m[0], m[0][0], "একই চিহ্ন বারবার না দিয়ে একটিই দিন।"));
  for (const m of t.matchAll(/[,;:](?=[A-Za-z])/g)) found.push(issue("space-after-punct", "punctuation", m.index, m.index + 1, m[0], m[0] + " ", "কমা/সেমিকোলনের পরে একটি ফাঁকা জায়গা দিন।"));
  for (const para of t.split(/\n\s*\n/)) {
    const p = para.trimEnd(); if (!p || /^(subject|dear|hi|hello|regards|best|sincerely|yours|thanks|thank you)\b/i.test(p.trim()) || /,$/.test(p)) continue;
    const lastLine = p.split("\n").pop();
    if (wordsOf(lastLine).length >= 5 && !/[.!?"”'’)]$/.test(lastLine)) {
      const at = t.indexOf(p) + p.length; found.push(issue("end-punct", "punctuation", at, at, "", ".", "বাক্যের শেষে দাঁড়ি (.) বা প্রশ্নচিহ্ন বসান।"));
    }
  }

  /* C) repeated word ("the the") */
  for (const m of t.matchAll(/\b([A-Za-z]+)\s+\1\b/gi)) {
    const w = m[1].toLowerCase();
    if (["that", "had", "is", "very", "bye", "so", "no", "ha", "yeah", "knock", "boo", "go", "really"].includes(w) || w.length < 2) continue;
    found.push(issue("dup-word", "repetition", m.index, m.index + m[0].length, m[0], m[1], "একই শব্দ পরপর দুবার লেখা হয়েছে।"));
  }

  /* D) a / an */
  for (const m of t.matchAll(/\b(a|an|A|An)\s+([A-Za-z][A-Za-z'’-]*)/g)) {
    const art = m[1], next = m[2], lw = next.toLowerCase().split(/[-'’]/)[0];
    if (/^[A-Z]{2,}$/.test(next)) continue;                                   // acronyms (an MBA, a UN …): sound depends on the letter names
    const startsVowel = /^[aeiou]/.test(lw);
    const wantAn = (startsVowel && !VOWEL_SOUND_EXCEPT_A.has(lw) && !/^(uni|use|usu|eu)/.test(lw)) || AN_BEFORE_CONSONANT.has(lw);
    const isAn = /^an$/i.test(art);
    if (wantAn && !isAn) found.push(issue("a-an", "article", m.index, m.index + art.length, art, art[0] === "A" ? "An" : "an", `“${next}” স্বরধ্বনি দিয়ে শুরু, তাই a নয়, an বসে।`));
    else if (!wantAn && isAn) found.push(issue("a-an", "article", m.index, m.index + art.length, art, art[0] === "A" ? "A" : "a", `“${next}” ব্যঞ্জনধ্বনি দিয়ে শুরু, তাই an নয়, a বসে।`));
  }

  /* E) subject–verb agreement and "didn't went" */
  const lowerT = t;
  const prevWord = (idx) => (lowerT.slice(0, idx).match(/([A-Za-z']+)\s*$/) || [, ""])[1].toLowerCase();
  const prevTwo = (idx) => lowerT.slice(Math.max(0, idx - 40), idx).toLowerCase();
  for (const m of t.matchAll(/\b(he|she|it|He|She|It)\s+(go|do|have|don't|don’t|are|were|am)\b/g)) {
    if (AUX.has(prevWord(m.index))) continue;
    if (SUBJ_THAT.test(prevTwo(m.index))) continue;
    const fix = { go: "goes", do: "does", have: "has", "don't": "doesn't", "don’t": "doesn't", are: "is", were: "was", am: "is" }[m[2]];
    const vs = m.index + m[1].length + (m[0].length - m[1].length - m[2].length);
    found.push(issue("sva-3sg", "agreement", vs, vs + m[2].length, m[2], fix, `${m[1]}-এর সাথে ক্রিয়ার রূপ হবে “${fix}” (he/she/it-এর পরে -s/-es বা is/was/has)।`));
  }
  for (const m of t.matchAll(/\b(I)\s+(is|are|has|does|goes)\b/g)) {
    const fix = { is: "am", are: "am", has: "have", does: "do", goes: "go" }[m[2]];
    const vs = m.index + m[0].length - m[2].length; found.push(issue("sva-i", "agreement", vs, vs + m[2].length, m[2], fix, `“I”-এর সাথে “${fix}” বসে।`));
  }
  for (const m of t.matchAll(/\b(you|we|they|You|We|They)\s+(is|has|does|goes|am|was)\b/g)) {
    if (m[2] === "was" && !/^you$/i.test(m[1]) && !/^(we|they)$/i.test(m[1])) continue;
    const fix = { is: "are", has: "have", does: "do", goes: "go", am: "are", was: "were" }[m[2]];
    const vs = m.index + m[0].length - m[2].length; found.push(issue("sva-plural", "agreement", vs, vs + m[2].length, m[2], fix, `${m[1]}-এর সাথে “${fix}” বসে।`));
  }
  for (const m of t.matchAll(/\b(didn't|didn’t|did not)\s+([a-z]+)\b/gi)) {
    const base = IRREG[m[2].toLowerCase()]; if (!base || /^(do|be)$/.test(base) && m[2].toLowerCase() !== "did") continue;
    if (m[2].toLowerCase() === "was" || m[2].toLowerCase() === "were") continue;
    const vs = m.index + m[0].length - m[2].length; found.push(issue("didnt-past", "tense", vs, vs + m[2].length, m[2], base, `didn't-এর পরে ক্রিয়ার মূল রূপ (base form) বসে: didn't ${base}।`));
  }
  for (const m of t.matchAll(/\b(doesn't|doesn’t|does not)\s+([a-z]+)\b/gi)) {
    const base = SG_TO_BASE[m[2].toLowerCase()]; if (!base) continue;
    const vs = m.index + m[0].length - m[2].length; found.push(issue("doesnt-sg", "tense", vs, vs + m[2].length, m[2], base, `doesn't-এর পরে ক্রিয়ার মূল রূপ বসে: doesn't ${base}।`));
  }

  /* F) fixed phrases (very common errors) */
  for (const [re, fn, cat, bn] of PHRASES) for (const m of t.matchAll(re)) found.push(issue("phrase:" + cat, cat, m.index, m.index + m[0].length, m[0], fn(m), bn));
  for (const m of t.matchAll(/\b([A-Za-z]+)\b/g)) {
    const fix = UNCOUNTABLE_PLURAL[m[1].toLowerCase()]; if (!fix) continue;
    found.push(issue("plural-form", "word-form", m.index, m.index + m[1].length, m[1], fix, `“${m[1]}” ঠিক রূপ নয়। সঠিক: ${fix}।`));
  }

  /* sort + drop overlaps (keep the first / longest) */
  const pri = (f) => (f.category === "capitalization" ? 1 : 0);
  found.sort((a, b) => a.start - b.start || pri(a) - pri(b) || b.end - a.end);
  const out = []; let end = -1;
  for (const f of found) { if (f.start >= end || f.start === f.end && f.start > end) { out.push(f); end = Math.max(end, f.end); } }
  return out;
}

/** Apply one suggested fix to the text. */
export function applyFix(text, it) {
  return text.slice(0, it.start) + it.suggestion + text.slice(it.end);
}

/** Issues per 100 words (deterministic quality signal; lower is better). */
export function issueRate(text) {
  const n = wordsOf(text).length; if (!n) return 0;
  return Math.round((check(text).length / n) * 1000) / 10;
}
