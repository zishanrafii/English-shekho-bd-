/* ═══════════════════════════════════════════════════════════
   Daily plan engine (Phase 6) — "What should I learn today?"
   Pure functions, no imports, deterministic for a given day,
   so the plan is stable across refreshes and easy to test.

   Inputs  : learning profile (level, skills, minutes, style, reasons),
             history   ({skill: "YYYY-MM-DD" last practised}),
             grammarDone (topic ids), catalog (grammar topics per level)
   Output  : { date, minutes, items[ {id, skill, minutes, title, why, href} ] }
   ═══════════════════════════════════════════════════════════ */

import { weakTopics } from "./grammar-practice.js";

export const SKILLS = ["vocabulary", "listening", "grammar", "reading", "quiz", "speaking", "writing"]; // also the order shown (easy → active)
export const SKILL_META = {
  vocabulary: { icon: "📚", label: "Vocabulary" },
  listening:  { icon: "👂", label: "Listening" },
  grammar:    { icon: "📘", label: "Grammar" },
  reading:    { icon: "📖", label: "Reading" },
  quiz:       { icon: "📝", label: "Quiz" },
  speaking:   { icon: "🗣️", label: "Speaking" },
  writing:    { icon: "✍️", label: "Writing" },
};
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

/** How a daily goal splits into blocks of minutes. */
export function blocksFor(minutes) {
  if (minutes <= 10) return [5, 5];
  if (minutes <= 20) return [5, 5, 5, 5];
  if (minutes <= 30) return [10, 10, 10];
  if (minutes <= 45) return [15, 15, 15];
  return [15, 15, 15, 15];
}

const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
export const isoDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function daysBetween(a, b) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a || "")) return null;
  const [y1, m1, d1] = a.split("-").map(Number), [y2, m2, d2] = b.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

const REASON_BOOST = {
  exam: { writing: 0.5, speaking: 0.5, listening: 0.5, reading: 0.5 },
  job: { speaking: 0.5, writing: 0.5 },
  study_abroad: { writing: 0.4, listening: 0.4 },
  school: { grammar: 0.5, vocabulary: 0.3 },
  travel: { speaking: 0.5, listening: 0.4 },
  confidence: { speaking: 0.7 },
};
const STYLE_BOOST = {
  games: { quiz: 1.0, vocabulary: 0.3 },
  structured: { grammar: 0.6, reading: 0.2 },
  conversation: { speaking: 0.8, listening: 0.3 },
  media: { listening: 0.7, reading: 0.5 },
};

/** Score every skill; higher = more useful today. Also returns the main reason (Bengali). */
export function scoreSkills(profile, history, today, opts = {}) {
  const p = profile || {};
  const focus = new Set((p.skills || []).map((s) => (s === "pronunciation" ? "speaking" : s)));
  const scores = {};
  for (const s of SKILLS) {
    let score = 1, why = "আপনার স্তরের জন্য উপযোগী";
    const last = history ? history[s] : null;
    const gap = last ? daysBetween(last, today) : null;
    if (focus.has(s)) { score += 1.5; why = "আপনার লক্ষ্যের skill"; }
    if (gap === null) { score += 0.9; if (!focus.has(s)) why = "নতুন কিছু চেষ্টা করুন"; }
    else if (gap >= 3) { score += Math.min(gap, 10) * 0.25; why = `${String(gap).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d])} দিন অনুশীলন হয়নি`; }
    else if (gap <= 0) score -= 1.5;                       // already done today in another session
    for (const r of p.reasons || []) score += (REASON_BOOST[r] || {})[s] || 0;
    score += (STYLE_BOOST[p.style] || {})[s] || 0;
    if (s === "quiz" && p.style !== "games") score -= 0.6; // quizzes are a treat unless the learner likes games
    if (s === "grammar" && opts.weakGrammar) score += 1.2;              // unresolved weak topics deserve a visit
    score += hash(today + s) * 0.3;                        // gentle daily variety, stable within a day
    scores[s] = { score, why };
  }
  return scores;
}

function destination(skill, level, profile, catalog, grammarDone, grammarMastery) {
  const L = LEVELS.includes(level) ? level : "A1";
  switch (skill) {
    case "vocabulary": return { href: "vocab-review.html", title: `শব্দ শিখুন ও রিভিউ করুন · ${L}` };
    case "grammar": {
      // 1) a topic practised before but not yet secure (< 60%) comes back first
      const weak = weakTopics(grammarMastery, catalog, L)[0];
      if (weak) return { href: weak.href, title: `Grammar আবার: ${weak.title}`, topicId: weak.id, why: `আগের অনুশীলনে ${String(weak.last).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d])}% হয়েছিল, আরেকবার দেখুন` };
      // 2) otherwise the next topic not completed yet
      const done = new Set(grammarDone || []);
      const start = LEVELS.indexOf(L);
      for (let i = start; i < LEVELS.length; i++) {
        const t = ((catalog && catalog.topics && catalog.topics[LEVELS[i]]) || []).find((x) => !done.has(x.id));
        if (t) return { href: t.href, title: `Grammar: ${t.title}`, topicId: t.id };
      }
      return { href: "grammar.html", title: "Grammar পুনরালোচনা" };
    }
    case "listening": return { href: "listening.html", title: "Listening অনুশীলন" };
    case "reading":   return { href: "reading.html", title: "একটি Reading passage পড়ুন" };
    case "speaking":  return { href: "speaking-practice.html", title: "Speaking অনুশীলন" };
    case "writing": {
      const job = (profile.reasons || []).includes("job");
      const f = L === "A1" || L === "A2" ? "paragraph-writing.html" : job ? "email-writing.html" : "essay-writing.html";
      return { href: f, title: "লেখার অনুশীলন (AI feedback সহ)" };
    }
    case "quiz": {
      const f = L === "A1" || L === "A2" ? "quiz-beginner.html" : L === "B1" || L === "B2" ? "quiz-intermediate.html" : "quiz-advanced.html";
      return { href: f, title: "একটি ছোট Quiz" };
    }
  }
  return { href: "dashboard.html", title: skill };
}

/**
 * @param {object} o  { profile, history, grammarDone, catalog, today, lockedSkills }
 *   lockedSkills: skills already chosen earlier today (keeps the plan stable once the learner has started)
 */
export function buildPlan({ profile, history = {}, grammarDone = [], grammarMastery = null, catalog = null, today = isoDay(), lockedSkills = null } = {}) {
  const p = profile || {};
  const minutes = [10, 20, 30, 45, 60].includes(p.dailyMinutes) ? p.dailyMinutes : 20;
  const blocks = blocksFor(minutes);
  let chosen;
  if (Array.isArray(lockedSkills) && lockedSkills.length === blocks.length && lockedSkills.every((s) => SKILLS.includes(s))) {
    chosen = [...lockedSkills];
  } else {
    const sc0 = scoreSkills(p, history, today, { weakGrammar: weakTopics(grammarMastery, catalog, p.level || "A1").length > 0 });
    chosen = [...SKILLS].sort((a, b) => sc0[b].score - sc0[a].score).slice(0, blocks.length);
    chosen.sort((a, b) => SKILLS.indexOf(a) - SKILLS.indexOf(b));
  }
  const sc = scoreSkills(p, history, today, { weakGrammar: weakTopics(grammarMastery, catalog, p.level || "A1").length > 0 });
  const items = chosen.map((skill, i) => {
    const d = destination(skill, p.level, p, catalog, grammarDone, grammarMastery);
    return { id: skill, skill, minutes: blocks[i], title: d.title, why: d.why || sc[skill].why, href: d.href };
  });
  return { date: today, minutes, items };
}

export function progressOf(plan, doneIds) {
  const done = new Set(doneIds || []);
  const n = plan.items.filter((i) => done.has(i.id)).length;
  return { done: n, total: plan.items.length, complete: n === plan.items.length && n > 0 };
}

export function encouragement(done, total, minutes) {
  const bn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
  if (total > 0 && done === total) return "🎉 আজকের লক্ষ্য পূরণ হয়েছে! চাইলে আরও অনুশীলন করতে পারেন, নইলে কাল আবার দেখা হবে।";
  if (done > 0) return `👏 ${bn(done)}/${bn(total)} সম্পন্ন। বাকিগুলো সময় পেলে করবেন।`;
  return `আজ ${bn(minutes)} মিনিটই যথেষ্ট। যেটা ইচ্ছা, সেটা দিয়ে শুরু করুন।`;
}
