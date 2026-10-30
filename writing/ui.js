/* ═══════════════════════════════════════════════════════════
   Writing check panel — DOM only (nothing from the learner or the AI is ever injected as HTML).
     1. instant, free, offline check: metrics + rule-based issues with Bengali explanations and "fix" buttons
     2. optional AI coach (verified corrections, natural rewrite, vocabulary, structure, strengths)
     3. note that mistakes were added to the learner's Personal Mistake Memory
   ═══════════════════════════════════════════════════════════ */
import { metrics, check, applyFix, lengthTarget, CATEGORIES, wordsOf } from "./analyzer.js";
import { collect } from "./mistakes.js";
import { askWritingCoach } from "./coach.js";

const bn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const btn = (text, fn, style = "") => { const b = el("button", "wc-btn", text); b.type = "button"; if (style) b.style.cssText = style; b.onclick = fn; return b; };
const BTN = "padding:7px 13px;border-radius:10px;border:1px solid var(--border,rgba(255,255,255,.16));background:rgba(255,255,255,.06);color:var(--text,#eef0ff);font:600 13px/1.2 inherit;cursor:pointer;";
const BTN_MAIN = BTN + "background:linear-gradient(135deg,#5b5bff,#8b5cf6);border-color:transparent;color:#fff;";

function section(title, color) { const s = el("div", "fp-section"); const t = el("div", "fp-section-title", title); if (color) t.style.color = color; s.appendChild(t); return s; }
function tile(label, value, sub) { const t = el("div", "fp-score-item"); const v = el("div", "fps-val", value); v.style.fontSize = "1.3rem"; t.append(v, el("div", "fps-label", label)); if (sub) { const s = el("div", "fps-label", sub); s.style.opacity = ".75"; t.appendChild(s); } return t; }

/** Show the sentence around an issue with the wrong words marked. */
function contextLine(text, it) {
  const from = Math.max(0, text.lastIndexOf("\n", it.start) + 1);
  const rawStart = Math.max(from, text.lastIndexOf(".", it.start - 1) + 1, it.start - 70);
  let end = text.indexOf(".", it.end); if (end < 0 || end - it.end > 70) end = Math.min(text.length, it.end + 70);
  const p = el("div", "fp-item"); p.style.cssText = "flex-wrap:wrap;gap:0;line-height:1.7;";
  p.append(document.createTextNode((rawStart > from ? "…" : "") + text.slice(rawStart, it.start).trimStart()));
  const bad = el("mark", null, it.text || "␣"); bad.style.cssText = "background:rgba(251,113,133,.25);color:inherit;border-radius:4px;padding:0 3px;text-decoration:line-through;";
  p.appendChild(bad);
  if (it.suggestion) { const good = el("mark", null, it.suggestion); good.style.cssText = "background:rgba(52,211,153,.22);color:inherit;border-radius:4px;padding:0 3px;margin:0 3px;"; p.appendChild(good); }
  p.append(document.createTextNode(text.slice(it.end, end + 1)));
  return p;
}

/**
 * @param ctx {{ panel, editor, type, level, task, onChange(), saveMistakes(list):Promise, toast(msg,type) }}
 */
export function renderCheck(ctx) {
  const { panel, editor, type, level, task } = ctx;
  const text = editor.value;
  const m = metrics(text), issues = check(text);
  const target = lengthTarget(task && task.words, level);
  panel.textContent = "";

  const head = el("div", "fp-head"); head.append(el("span", "fp-icon", "📝"));
  const title = el("span", "fp-title", "Writing Check "); const badge = el("span", "fp-badge", "নিজে-নিজে যাচাই · কোনো AI লাগে না"); badge.style.cssText = "background:rgba(34,211,238,.15);color:#22d3ee;text-transform:none;"; title.appendChild(badge);
  head.appendChild(title); panel.appendChild(head);
  const body = el("div", "fp-body"); panel.appendChild(body);

  /* metrics (measured, not guessed) */
  const row = el("div", "fp-score-row");
  const lenState = m.words < target.min ? `লক্ষ্য ${bn(target.min)}–${bn(target.max)}, আরেকটু লিখুন` : m.words > target.max ? `লক্ষ্য ${bn(target.min)}–${bn(target.max)}, একটু বেশি` : `লক্ষ্যের মধ্যে (${bn(target.min)}–${bn(target.max)}) ✓`;
  row.append(tile("শব্দ", bn(m.words), lenState), tile("বাক্য", bn(m.sentences), `গড় ${bn(m.avgSentence)} শব্দ`), tile("শব্দ-বৈচিত্র্য", m.words >= 30 ? bn(m.variety) : "—", m.words >= 30 ? "(বেশি = ভালো)" : "৩০+ শব্দে"), tile("পাওয়া সমস্যা", bn(issues.length), "প্রতি ১০০ শব্দে " + bn(m.words ? Math.round((issues.length / m.words) * 1000) / 10 : 0)));
  body.appendChild(row);
  body.appendChild(Object.assign(el("div", "fp-item"), { textContent: "ℹ️ এখানে শুধু নিশ্চিত নিয়ম-ভিত্তিক সমস্যা ধরা হয় (a/an, he goes, discuss about…)। আরও গভীর মতামতের জন্য নিচের AI Coach ঐচ্ছিক।" })).style.cssText = "font-size:12px;opacity:.8;margin:.4rem 0;";

  /* issues */
  const sec = section(issues.length ? "🔎 পাওয়া সমস্যা (" + bn(issues.length) + ")" : "✅ কোনো নিশ্চিত সমস্যা পাওয়া যায়নি", issues.length ? "#fb7185" : "#34d399");
  if (!issues.length) sec.appendChild(el("div", "fp-item", "চমৎকার! নিয়ম-ভিত্তিক পরীক্ষায় কোনো ভুল মেলেনি। ভাবনা, সাজানো ও শব্দ নিয়ে AI Coach-এর মতামত নিতে পারেন।"));
  const apply = (it) => { editor.value = applyFix(editor.value, it); ctx.onChange(); renderCheck(ctx); };
  issues.forEach((it) => {
    const box = el("div", "fp-item"); box.style.cssText = "display:block;padding:.6rem .7rem;margin:.4rem 0;border-radius:10px;background:rgba(251,113,133,.06);border:1px solid rgba(251,113,133,.2);";
    const tag = el("span", "fp-badge", (CATEGORIES[it.category] || CATEGORIES.other).bn); tag.style.cssText = "background:rgba(124,131,255,.18);color:#a5abff;margin-bottom:4px;display:inline-block;text-transform:none;";
    box.append(tag, contextLine(text, it));
    const why = el("div", "fp-item", it.explainBn); why.style.cssText = "font-size:13px;opacity:.9;margin:.2rem 0 .5rem;"; box.appendChild(why);
    box.appendChild(btn("✔ ঠিক করুন", () => apply(it), BTN_MAIN));
    sec.appendChild(box);
  });
  if (issues.length > 1) {
    const all = btn("✔ সবগুলো ঠিক করুন (" + bn(issues.length) + ")", () => { let t = editor.value; [...issues].sort((a, b) => b.start - a.start).forEach((x) => { t = applyFix(t, x); }); editor.value = t; ctx.onChange(); renderCheck(ctx); }, BTN); all.style.marginTop = ".4rem"; sec.appendChild(all);
  }
  body.appendChild(sec);

  if (m.repeatedWords.length) {
    const r = section("🔁 বারবার ব্যবহার করা শব্দ", "#f5c842");
    r.appendChild(el("div", "fp-item", m.repeatedWords.map((w) => `“${w.word}” ${bn(w.count)} বার`).join(" · ") + "। সমার্থক শব্দ ব্যবহার করে দেখুন।"));
    body.appendChild(r);
  }

  /* memory note (filled after the save completes) */
  const memo = el("div", "fp-item"); memo.style.cssText = "font-size:13px;margin:.6rem 0;color:var(--sub,#aab1d6);"; body.appendChild(memo);
  const remember = async (extraAi = []) => {
    const list = collect({ text: editor.value, issues: check(editor.value), ai: extraAi, today: ctx.today });
    if (!list.length) return;
    try {
      const r = await ctx.saveMistakes(list);
      const n = r.added + r.reopened;
      memo.textContent = n ? `🧠 ${bn(n)}টি নতুন ভুল আপনার “ভুল থেকে শেখা”-তে যোগ হয়েছে।` : "🧠 এই ভুলগুলো আগে থেকেই আপনার “ভুল থেকে শেখা”-তে আছে।";
      if (n || r.seen) { const a = el("a", null, " অনুশীলন করুন →"); a.href = "writing-review.html"; a.style.color = "#818cf8"; memo.appendChild(a); }
    } catch (e) { console.warn("mistake memory not saved", e); memo.textContent = "ভুলগুলো এবার সেভ করা যায়নি (আপনার লেখা ঠিকই আছে)।"; }
  };
  remember();

  /* AI coach (optional) */
  const ai = section("🤖 AI Coach (ঐচ্ছিক)", "#818cf8"); const aiBody = el("div"); ai.appendChild(aiBody);
  aiBody.appendChild(el("div", "fp-item", "স্বাভাবিক ভাষায় নতুন করে লেখা, শব্দের পরামর্শ, বাংলায় ব্যাখ্যা ও সাজানোর পরামর্শ পেতে চাপুন। এটি AI-এর মতামত, ভুল হতে পারে; ওপরের সংখ্যাগুলো আলাদাভাবে হিসাব করা।"));
  const go = btn("🤖 AI মতামত নিন", async () => {
    go.disabled = true; aiBody.textContent = "AI Coach ভাবছে…";
    const r = await askWritingCoach({ text: editor.value, type, level, task: task && task.label });
    aiBody.textContent = "";
    if (!r.ok) { aiBody.appendChild(el("div", "fp-item", { auth: "AI মতামতের জন্য আবার login করুন।", rate: "আজকের AI মতামতের সীমা শেষ। ওপরের নিজে-নিজে যাচাই ব্যবহার করতে পারেন।", network: "ইন্টারনেট সংযোগ নেই।", failed: "AI Coach এখন পাওয়া যাচ্ছে না। আপনার লেখা ঠিকই আছে।" }[r.error])); go.disabled = false; aiBody.appendChild(go); return; }
    const d = r.data;
    aiBody.appendChild(el("div", "fp-item", "🤖 নিচের সবকিছু AI-এর মতামত, তাই ভুল হতে পারে। সংশোধনগুলো আপনার লেখা থেকে উদ্ধৃত ও যাচাই করা।")).style.cssText = "font-size:12px;opacity:.8;";
    if (d.summary) aiBody.appendChild(el("div", "fp-item", d.summary)).style.cssText = "background:rgba(129,140,248,.07);padding:.7rem;border-radius:10px;margin:.4rem 0;";
    if (d.corrections.length) {
      aiBody.appendChild(el("div", "fp-section-title", "✏️ সংশোধন")).style.color = "#f5c842";
      d.corrections.forEach((c) => {
        const b = el("div", "fp-item"); b.style.cssText = "display:block;padding:.6rem .7rem;margin:.4rem 0;border-radius:10px;background:rgba(245,200,66,.06);border:1px solid rgba(245,200,66,.2);";
        const line = el("div"); const o = el("mark", null, c.original), g = el("mark", null, c.corrected);
        o.style.cssText = "background:rgba(251,113,133,.25);color:inherit;text-decoration:line-through;padding:0 3px;border-radius:4px;"; g.style.cssText = "background:rgba(52,211,153,.22);color:inherit;padding:0 3px;margin-left:6px;border-radius:4px;";
        line.append(o, g); { const tg = el("span", "fp-badge", (CATEGORIES[c.category] || CATEGORIES.other).bn); tg.style.textTransform = "none"; b.append(tg, line); }
        if (c.explanationBn) b.appendChild(el("div", "fp-item", c.explanationBn)).style.cssText = "font-size:13px;opacity:.9;margin:.2rem 0 .4rem;";
        const ap = btn("✔ ঠিক করুন", () => { const v = editor.value; const i = v.indexOf(c.original); if (i < 0) { ctx.toast("এই অংশটি আর লেখায় নেই।", "error"); return; } editor.value = v.slice(0, i) + c.corrected + v.slice(i + c.original.length); ctx.onChange(); ap.disabled = true; ap.textContent = "✓ করা হয়েছে"; }, BTN_MAIN);
        b.appendChild(ap); aiBody.appendChild(b);
      });
    } else aiBody.appendChild(el("div", "fp-item", "✅ AI কোনো নিশ্চিত ভুল পায়নি।"));
    if (d.naturalRewrite) {
      aiBody.appendChild(el("div", "fp-section-title", "✨ স্বাভাবিকভাবে নতুন করে লেখা")).style.color = "#34d399";
      const rw = el("div", "fp-item", d.naturalRewrite); rw.style.cssText = "font-style:italic;display:block;white-space:pre-wrap;"; aiBody.appendChild(rw);
      aiBody.appendChild(btn("এটি Editor-এ বসান", () => { if (confirm("আপনার বর্তমান লেখা এই লেখা দিয়ে বদলে যাবে। নিশ্চিত?")) { editor.value = d.naturalRewrite; ctx.onChange(); renderCheck(ctx); } }, BTN));
    }
    if (d.vocabulary && d.vocabulary.length) { aiBody.appendChild(el("div", "fp-section-title", "📚 শব্দের পরামর্শ")).style.color = "#2dd4bf"; d.vocabulary.forEach((v) => aiBody.appendChild(el("div", "fp-item", `“${v.word}” → “${v.better}”${v.noteBn ? " · " + v.noteBn : ""}`))); }
    [["structure", "🧱 সাজানো", "#818cf8"], ["strengths", "👍 ভালো যা হয়েছে", "#34d399"], ["nextSteps", "➡️ পরের ধাপ", "#fb923c"]].forEach(([k, t, c]) => { if (d[k] && d[k].length) { aiBody.appendChild(el("div", "fp-section-title", t)).style.color = c; d[k].forEach((x) => aiBody.appendChild(el("div", "fp-item", x))); } });
    remember(d.corrections);                                   // AI-found mistakes join the memory too (already verified)
  }, BTN_MAIN);
  aiBody.appendChild(go); body.appendChild(ai);
  panel.classList.add("show");
}
