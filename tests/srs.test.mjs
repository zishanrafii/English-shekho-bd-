import { GRADE, LIMITS, newCard, review, markKnown, previewIntervals, statusOf, isDue, masteryScore, sessionLimits, buildSession, dailyShuffle, addDays, daysBetween, isoDay, intervalLabel } from "../learning/srs.js";
const out = []; const ok = (n, c) => out.push([n, !!c]);
const T = "2026-10-01";
let c = newCard("tenacious", "B2", T);

/* date helpers */
ok("addDays crosses month/year", addDays("2026-12-30", 3) === "2027-01-02" && addDays("2026-02-27", 2) === "2026-03-01");
ok("daysBetween", daysBetween("2026-10-01", "2026-10-11") === 10 && daysBetween("2026-10-11", "2026-10-01") === -10);
ok("isoDay is local YYYY-MM-DD", /^\d{4}-\d{2}-\d{2}$/.test(isoDay()));

/* growth with consistently good answers */
let d = T, ints = [];
for (let i = 0; i < 6; i++) { c = review(c, GRADE.GOOD, d); ints.push(c.interval); d = c.due; }
ok("good ×6 intervals grow: " + ints.join(","), ints.every((x, i) => i === 0 || x > ints[i - 1]) && ints[0] === 1 && ints[1] === 3);
ok("interval never exceeds cap", ints.every((x) => x <= LIMITS.maxInterval));
ok("mastered after 5 good reviews", statusOf(review(review(review(review(review(newCard("a", "A1", T), 2, T), 2, T), 2, T), 2, T), 2, T), T) === "mastered");

/* again / hard / easy */
const a = review(c, GRADE.AGAIN, T);
ok("again → interval 0, due today, lapse counted, reps reset", a.interval === 0 && a.due === T && a.lapses === c.lapses + 1 && a.reps === 0);
ok("again lowers ease but not below the floor", a.ease < c.ease && a.ease >= LIMITS.easeMin);
let low = newCard("x", "A1", T); for (let i = 0; i < 20; i++) low = review(low, GRADE.AGAIN, T);
ok("ease floor holds after many failures", low.ease === LIMITS.easeMin);
let hi = newCard("y", "A1", T); for (let i = 0; i < 20; i++) hi = review(hi, GRADE.EASY, T);
ok("ease ceiling holds after many easy answers", hi.ease <= LIMITS.easeMax && hi.interval <= LIMITS.maxInterval);
const hard = review(review(newCard("h", "A1", T), 2, T), GRADE.HARD, T);
ok("hard keeps the word coming back (interval ≥1, ease down)", hard.interval >= 1 && hard.ease < LIMITS.easeStart);
ok("easy beats good on a fresh card", review(newCard("e", "A1", T), 3, T).interval > review(newCard("e", "A1", T), 2, T).interval);
ok("review() does not mutate its input", (() => { const x = newCard("m", "A1", T); const s = JSON.stringify(x); review(x, 2, T); return JSON.stringify(x) === s; })());
const pv = previewIntervals(newCard("p", "A1", T), T);
ok("preview: again<hard≤good<easy ordering", pv[0] === 0 && pv[1] >= 1 && pv[2] >= pv[1] && pv[3] > pv[2] - 0);

/* status buckets */
ok("no card → new", statusOf(null, T) === "new");
ok("fresh card → learning", statusOf(newCard("l", "A1", T), T) === "learning");
let w = newCard("w", "A1", T); w = review(review(w, 0, T), 0, T);
ok("two lapses → weak", statusOf(w, T) === "weak");
const kn = markKnown("k", "A1", T);
ok("known: parked 60 days, never due", statusOf(kn, T) === "known" && kn.due === addDays(T, 60) && !isDue(kn, addDays(T, 59)));
ok("isDue true on/after the due date, false before", isDue({ ...c, due: T }, T) && isDue({ ...c, due: "2026-09-30" }, T) && !isDue({ ...c, due: "2026-10-02" }, T));
ok("mastery score rises with practice and falls with lapses", masteryScore(c) > masteryScore(newCard("n", "A1", T)) && masteryScore({ ...c, lapses: 5 }) < masteryScore(c));
ok("mastery score stays within 0..100", [c, a, low, hi, kn].every((x) => { const s = masteryScore(x); return s >= 0 && s <= 100; }));

/* retention simulation: forgetting curve p = exp(-t/ (3*ease^reps)) — SRS should beat reviewing at a fixed gap */
function sim(policy, days = 120) {
  let rnd = 12345; const rand = () => { rnd = (rnd * 1664525 + 1013904223) % 4294967296; return rnd / 4294967296; };
  let card = newCard("s", "A1", T), today = T, stability = 2, reviews = 0, recalled = 0, lastSeen = T;
  for (let i = 0; i < days; i++) {
    today = addDays(T, i);
    const dueNow = policy === "srs" ? isDue(card, today) : i % 3 === 0;
    if (!dueNow) continue;
    const gap = daysBetween(lastSeen, today);
    const p = Math.exp(-gap / stability);
    const right = rand() < p; reviews++; if (right) { recalled++; stability *= 1.9; } else stability = Math.max(1.5, stability * 0.6);
    lastSeen = today;
    if (policy === "srs") card = review(card, right ? (p > 0.95 ? 3 : 2) : 0, today);
  }
  return { reviews, recalled };
}
const s = sim("srs"), f = sim("fixed");
ok(`SRS uses far fewer reviews than every-3-days (${s.reviews} vs ${f.reviews}) for the same 120 days`, s.reviews < f.reviews * 0.6);

/* session builder */
const dueCards = [
  { ...newCard("late", "A1", T), due: "2026-09-20", reps: 3, interval: 5 },
  { ...w, due: T, word: "weakone" },
  { ...newCard("today", "A1", T), due: T, reps: 3, interval: 4 },
  ...Array.from({ length: 30 }, (_, i) => ({ ...newCard("f" + i, "A1", T), due: T, reps: 3, interval: 5 })),
];
const cand = Array.from({ length: 20 }, (_, i) => ({ id: "a1w" + i }));
const ses = buildSession(dueCards, cand, { review: 15, newWords: 6, newLeftToday: 6, today: T });
ok("caps reviews, reports backlog without nagging", ses.reviews.length === 15 && ses.backlog === dueCards.length - 15);
ok("weak words are reviewed first", ses.reviews[0].word === "weakone");
ok("new-word quota respected", ses.newWords.length === 6);
ok("no new words once today's quota is used", buildSession(dueCards, cand, { review: 15, newWords: 6, newLeftToday: 0, today: T }).newWords.length === 0);
ok("limits scale with daily time", sessionLimits(10).review < sessionLimits(30).review && sessionLimits(10).newWords < sessionLimits(60).newWords && sessionLimits(undefined).review > 0);
const sh1 = dailyShuffle(cand, T).map((x) => x.id).join(), sh2 = dailyShuffle(cand, T).map((x) => x.id).join(), sh3 = dailyShuffle(cand, "2026-10-02").map((x) => x.id).join();
ok("daily shuffle: stable within a day, different tomorrow", sh1 === sh2 && sh1 !== sh3);
ok("interval labels in Bengali", intervalLabel(0) === "এখনই" && intervalLabel(1) === "১ দিন" && intervalLabel(7) === "৭ দিন" && intervalLabel(60) === "২ মাস");

for (const [n, cnd] of out) console.log(cnd ? "PASS" : "FAIL", n);
process.exit(out.every(([, x]) => x) ? 0 : 1);
