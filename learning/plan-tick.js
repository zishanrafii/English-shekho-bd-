/* Mark a skill as practised today in the EXISTING daily plan (pure; Firestore helpers are injected).
   - always records planHistory.<skill> = today
   - ticks the skill in planProgress ONLY when it is part of today's plan (history BEFORE today's write is used,
     so the plan is the one the learner actually saw; an already-locked plan is respected). */
import { buildPlan } from "./daily-plan.js";

export function tickPlan({ userDoc = {}, skill, today, catalog = null }) {
  const update = { ["planHistory." + skill]: today };
  const saved = userDoc.planProgress && userDoc.planProgress.date === today ? userDoc.planProgress : null;
  const plan = buildPlan({
    profile: userDoc.learningProfile, history: userDoc.planHistory || {},
    grammarDone: (userDoc.grammarProgress && userDoc.grammarProgress.done) || [],
    grammarMastery: (userDoc.grammarProgress && userDoc.grammarProgress.mastery) || null,
    catalog, today, lockedSkills: saved && Array.isArray(saved.skills) ? saved.skills : null,
  });
  const skills = plan.items.map((i) => i.skill);
  let ticked = false;
  if (skills.includes(skill)) {
    const done = new Set((saved && saved.done) || []); done.add(skill);
    update.planProgress = { date: today, done: [...done], skills }; ticked = true;
  }
  return { update, ticked };
}
