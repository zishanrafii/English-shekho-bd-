/* ═══════════════════════════════════════════════
   Learning DNA — schema, labels, validation (Phase 4)
   Pure module (no imports) so it can be unit-tested anywhere.
   Stored at: users/{uid}.learningProfile
   Privacy: only coarse age BANDS are stored, never a birth date.
   ═══════════════════════════════════════════════ */

export const PROFILE_VERSION = 1;

export const OPTIONS = {
  ageGroup: [
    { id: "kid",   label: "১২ বা কম",  icon: "🧒" },
    { id: "teen",  label: "১৩–১৭",     icon: "🧑‍🎓" },
    { id: "young", label: "১৮–২৪",     icon: "🎓" },
    { id: "adult", label: "২৫ বা বেশি", icon: "💼" },
  ],
  level: [
    { id: "A1", label: "A1 · একদম নতুন",        icon: "🌱" },
    { id: "A2", label: "A2 · সামান্য জানি",      icon: "🌿" },
    { id: "B1", label: "B1 · মোটামুটি চলে",     icon: "🌳" },
    { id: "B2", label: "B2 · ভালো জানি",        icon: "🚀" },
    { id: "C1", label: "C1 · উন্নত",            icon: "⭐" },
    { id: "C2", label: "C2 · প্রায় native",     icon: "👑" },
    { id: "unsure", label: "নিশ্চিত নই",        icon: "🤔" },
  ],
  reasons: [
    { id: "job",         label: "চাকরি / ক্যারিয়ার",     icon: "💼" },
    { id: "study_abroad",label: "বিদেশে পড়াশোনা",        icon: "✈️" },
    { id: "exam",        label: "পরীক্ষার প্রস্তুতি",     icon: "📝" },
    { id: "school",      label: "স্কুল / কলেজের পড়া",    icon: "🏫" },
    { id: "travel",      label: "ভ্রমণ",                  icon: "🧳" },
    { id: "confidence",  label: "কথা বলার আত্মবিশ্বাস",   icon: "🎤" },
    { id: "fun",         label: "শখ / মজার জন্য",         icon: "🎉" },
  ],
  examTarget: [
    { id: "ielts", label: "IELTS" }, { id: "toefl", label: "TOEFL" },
    { id: "pte", label: "PTE" },     { id: "det", label: "Duolingo (DET)" },
    { id: "other", label: "অন্য পরীক্ষা" }, { id: "none", label: "এখনো ঠিক করিনি" },
  ],
  skills: [
    { id: "speaking",      label: "Speaking",      icon: "🗣️" },
    { id: "listening",     label: "Listening",     icon: "👂" },
    { id: "reading",       label: "Reading",       icon: "📖" },
    { id: "writing",       label: "Writing",       icon: "✍️" },
    { id: "grammar",       label: "Grammar",       icon: "📘" },
    { id: "vocabulary",    label: "Vocabulary",    icon: "📚" },
    { id: "pronunciation", label: "Pronunciation", icon: "🔊" },
  ],
  dailyMinutes: [
    { id: 10, label: "১০ মিনিট", sub: "হালকা শুরু" },
    { id: 20, label: "২০ মিনিট", sub: "নিয়মিত" },
    { id: 30, label: "৩০ মিনিট", sub: "দ্রুত উন্নতি" },
    { id: 45, label: "৪৫ মিনিট", sub: "গভীর অনুশীলন" },
    { id: 60, label: "৬০+ মিনিট", sub: "পূর্ণ মনোযোগ" },
  ],
  studyTime: [
    { id: "morning",   label: "সকাল",  icon: "🌅" },
    { id: "afternoon", label: "দুপুর", icon: "☀️" },
    { id: "evening",   label: "সন্ধ্যা", icon: "🌇" },
    { id: "night",     label: "রাত",   icon: "🌙" },
    { id: "anytime",   label: "যেকোনো সময়", icon: "⏰" },
  ],
  style: [
    { id: "games",        label: "গেম ও চ্যালেঞ্জ",     icon: "🎮" },
    { id: "structured",   label: "ধাপে ধাপে পাঠ",        icon: "📚" },
    { id: "conversation", label: "কথোপকথন অনুশীলন",     icon: "💬" },
    { id: "media",        label: "শুনে ও পড়ে শেখা",     icon: "🎧" },
  ],
};

const ids = (key) => OPTIONS[key].map((o) => o.id);
export const labelOf = (key, id) => (OPTIONS[key].find((o) => o.id === id) || {}).label || "";

/** Clean a raw answer set into the object stored in Firestore. Throws Error(reason) when invalid. */
export function sanitizeProfile(raw) {
  const r = raw || {};
  const one = (key) => {
    if (!ids(key).includes(r[key])) throw new Error("invalid_" + key);
    return r[key];
  };
  const many = (key, min, max) => {
    const arr = Array.isArray(r[key]) ? [...new Set(r[key])] : [];
    const ok = arr.filter((v) => ids(key).includes(v));
    if (ok.length < min || ok.length > max) throw new Error("invalid_" + key);
    return ok;
  };

  const ageGroup = one("ageGroup");
  const levelChoice = one("level");
  const reasons = many("reasons", 1, 3);
  const skills = many("skills", 1, 4);
  const dailyMinutes = one("dailyMinutes");
  const studyTime = one("studyTime");
  const style = one("style");
  const examTarget = reasons.includes("exam") && ids("examTarget").includes(r.examTarget) ? r.examTarget : "none";

  const unsure = levelChoice === "unsure";
  return {
    version: PROFILE_VERSION,
    ageGroup,
    level: unsure ? "A1" : levelChoice,   // safe starting point until the placement test (Phase 5)
    levelPending: unsure,                  // true → offer "Find My Level"
    reasons, examTarget, skills, dailyMinutes, studyTime, style,
  };
}

export function cleanName(v) {
  const n = String(v || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
  return n;
}

/** Short Bengali summary used on the dashboard. */
export function summarize(p) {
  if (!p) return null;
  return {
    minutes: p.dailyMinutes,
    level: p.level,
    levelPending: !!p.levelPending,
    focus: (p.skills || []).slice(0, 3).map((s) => labelOf("skills", s)).filter(Boolean),
  };
}
