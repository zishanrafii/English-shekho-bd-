/* Friendly Bengali feedback — pure. Never shames; always names ONE concrete next step. */
import { PACE_BAND } from "./scoring.js";

const bn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const q = (w) => `“${w}”`;

/** Feedback for Repeat / Shadowing / Read Aloud. */
export function targetFeedback({ mode, level, cmp, wpm, fluency, difficult = [] }) {
  const lines = []; const next = [];
  if (!cmp || cmp.empty) {
    return { headline: "আমরা আপনার কথা শুনতে পাইনি", lines: ["মাইক্রোফোনের কাছে একটু জোরে ও স্পষ্ট করে বলে আবার চেষ্টা করুন।"], next: ["আবার চেষ্টা করুন"], tone: "gentle" };
  }
  const acc = cmp.wordAccuracy;
  let headline;
  if (acc >= 95) headline = "চমৎকার! প্রায় সব শব্দই ঠিকমতো শোনা গেছে 🎉";
  else if (acc >= 80) headline = "ভালো হচ্ছে! বেশিরভাগ শব্দ ঠিক আছে 👏";
  else if (acc >= 50) headline = "ভালো শুরু! কয়েকটা শব্দ আরেকবার অনুশীলন করি";
  else headline = "ঠিক আছে, ধীরে ধীরে করি। প্রথমে শুনে নিন, তারপর বলুন";
  if (acc >= 50 && acc < 100 && cmp.problemWords.length) {
    const w = cmp.problemWords.slice(0, 2).map(q).join(" ও ");
    lines.push(`আপনি বেশিরভাগ শব্দ ঠিক বলেছেন। এবার ${w} আরেকবার অনুশীলন করি।`);
    next.push(`${q(cmp.problemWords[0])} শব্দটি আলাদা করে বলুন`);
  }
  if (acc < 50 && cmp.targetWords > 3) next.push("প্রথমে ধীরগতিতে (০.৭৫×) শুনুন, তারপর বলুন");
  if (cmp.completion < 100 && cmp.completion >= 30 && acc >= 50) lines.push("বাক্যটা শেষ পর্যন্ত বললে আরও ভালো হবে।");
  if (cmp.extra.length >= 3) lines.push("কয়েকটা বাড়তি শব্দ শোনা গেছে। শুধু বাক্যটাই বলুন, তাহলেই চলবে।");
  if (cmp.repeated.length) lines.push("কিছু শব্দ দুবার এসেছে। ঘাবড়াবেন না, ধীরে বললে এটা কমে যায়।");
  if (mode !== "repeat" && wpm) {
    const [lo, hi] = PACE_BAND[level] || PACE_BAND.A1;
    if (wpm < lo) lines.push(`আপনার গতি ${bn(wpm)} শব্দ/মিনিট। একটু সাবলীল করতে চাইলে বাক্যগুলো থামা ছাড়া বলার চেষ্টা করুন।`);
    else if (wpm > hi * 1.25) lines.push(`গতি ${bn(wpm)} শব্দ/মিনিট, বেশ দ্রুত। একটু ধীরে বললে শব্দগুলো আরও পরিষ্কার শোনাবে।`);
    else lines.push(`আপনার গতি ${bn(wpm)} শব্দ/মিনিট, এই স্তরের জন্য ভালো।`);
  }
  if (fluency && fluency.measurable && fluency.parts.continuity !== undefined && fluency.parts.continuity < 70) next.push("বাক্যের মাঝে লম্বা থামা কমানোর চেষ্টা করুন");
  for (const d of difficult) lines.push(`${q(d.word)} শব্দটি ${bn(d.count)} বার সমস্যা করেছে। আলাদা করে অনুশীলন করে নিন।`);
  if (!next.length) next.push(acc >= 95 ? "পরের বাক্যে যান" : "আরেকবার চেষ্টা করুন");
  return { headline, lines, next, tone: acc >= 80 ? "positive" : "gentle" };
}

/** Feedback for Free Speaking (no word-for-word matching). */
export function freeFeedback({ level, f, recommendedSec }) {
  const m = f.metrics; const lines = []; const next = [];
  if (m.words < 5) {
    return { headline: "আমরা খুব কম শব্দ শুনতে পেয়েছি", lines: ["আরেকটু বিস্তারিত বলার চেষ্টা করুন; ছোট ছোট বাক্যে ভাবনা এগোলেও চলবে।"], next: ["আবার চেষ্টা করুন"], tone: "gentle" };
  }
  const headline = m.words >= 40 ? "আপনার ভাবনাগুলো বেশ পরিষ্কারভাবে এসেছে 👏" : "ভালো শুরু! আরও একটু বললে আপনার ভাবনা পূর্ণ হবে";
  lines.push(`আপনি ${bn(f.speechSec)} সেকেন্ডে প্রায় ${bn(m.words)}টি শব্দ বলেছেন।`);
  if (f.wpm) {
    const [lo, hi] = PACE_BAND[level] || PACE_BAND.A1;
    if (f.wpm < lo) next.push("থেমে থেমে ভাবার বদলে ছোট বাক্যে বলে এগিয়ে যান");
    else if (f.wpm > hi * 1.25) next.push("একটু ধীরে বললে শ্রোতার বুঝতে সুবিধা হয়");
  }
  if (m.fillers >= 3) lines.push("কিছু ফাঁক-পূরণ শব্দ (like, you know) এসেছে। এগুলো স্বাভাবিক, তবে একটু থেমে ভাবলেই চলে।");
  if (m.repeats >= 3) lines.push("কিছু শব্দ বারবার এসেছে। নতুন শব্দ দিয়ে একই কথা বলার চেষ্টা করুন।");
  if (m.words >= 30 && m.connectors === 0) next.push("because, but বা so দিয়ে বাক্য জুড়ে ভাবনাকে আরও বিস্তারিত করুন");
  if (f.speechSec < recommendedSec * 0.5) next.push(`পরেরবার প্রায় ${bn(recommendedSec)} সেকেন্ড বলার চেষ্টা করুন`);
  if (f.pauses && f.pauses.measurable && f.pauses.longCount >= 2) next.push("বাক্যের মাঝের লম্বা থামা কমানোর চেষ্টা করুন");
  if (!next.length) next.push("নতুন একটি বিষয়ে বলে দেখুন");
  return { headline, lines, next, tone: "positive" };
}

/** Words that must never appear in feedback (used by the test-suite). */
export const SHAMING = /ব্যর্থ|খারাপ|দুর্বল|লজ্জা|ফেল|অক্ষম|poor|fail|bad|terrible|wrong/i;
