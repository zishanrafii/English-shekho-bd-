/* Small DOM helpers + result rendering for the speaking page (DOM only: nothing is injected as HTML). */
import { varietyLabel } from "./scoring.js";

export const bn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
export const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
export const btn = (text, fn, cls = "es-btn es-btn--secondary") => { const b = el("button", cls, text); b.type = "button"; if (fn) b.onclick = fn; return b; };
export const fmtTime = (ms) => { const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };

function tile(label, value, sub, estimate) {
  const t = el("div", "sp-tile");
  const v = el("div", "sp-tile-v", value); const l = el("div", "sp-tile-l", label);
  t.append(v, l);
  if (estimate) t.appendChild(el("span", "es-badge", "অনুমান"));
  if (sub) t.appendChild(el("div", "sp-tile-s", sub));
  return t;
}

const CHIP = { ok: ["✓", "ঠিক"], close: ["⚠", "কাছাকাছি"], wrong: ["⚠", "অন্যরকম শোনা গেছে"], missed: ["✗", "বাদ পড়েছে"] };

/** Word-by-word chips: symbol + word (+ text label for screen readers), never colour alone. */
export function renderWordChips(states, onTap) {
  const box = el("div", "sp-chips"); box.setAttribute("role", "list");
  states.forEach((s) => {
    const [sym, label] = CHIP[s.state];
    const b = el("button", "sp-chip sp-" + s.state); b.type = "button"; b.setAttribute("role", "listitem");
    b.setAttribute("aria-label", `${s.word}: ${label}${s.heard ? ", শোনা গেছে " + s.heard : ""}. চাপলে শব্দটি শুনতে ও সংরক্ষণ করতে পারবেন`);
    b.append(el("span", "sp-sym", sym), document.createTextNode(" " + s.word));
    b.onclick = () => onTap(s.word);
    box.appendChild(b);
  });
  return box;
}

/** Metric tiles for Repeat / Shadowing / Read Aloud. Anything not measurable is simply not shown. */
export function targetTiles(a) {
  const g = el("div", "sp-tiles");
  g.appendChild(tile("শব্দের সঠিকতা", a.wordAccuracy + "%", `${bn(a.cmp.matched)}/${bn(a.cmp.targetWords)}টি শব্দ ঠিক শোনা গেছে`));
  if (a.mode !== "repeat") g.appendChild(tile("সম্পূর্ণতা", a.completion + "%"));
  if (a.wpm) g.appendChild(tile("গতি", bn(a.wpm), "শব্দ/মিনিট"));
  if (a.fluency !== null && a.fluency !== undefined) g.appendChild(tile("সাবলীলতা", bn(a.fluency), "/১০০", true));
  g.appendChild(tile("সময়", bn(a.durationSec) + "s"));
  return g;
}

export function freeTiles(a) {
  const f = a.free, m = f.metrics, g = el("div", "sp-tiles");
  g.appendChild(tile("সময়", bn(f.speechSec) + "s", "কথা বলার সময়"));
  g.appendChild(tile("শব্দ", bn(m.words)));
  if (f.wpm) g.appendChild(tile("গতি", bn(f.wpm), "শব্দ/মিনিট"));
  if (a.fluency !== null && a.fluency !== undefined) g.appendChild(tile("সাবলীলতা", bn(a.fluency), "/১০০", true));
  const vl = varietyLabel(m);
  if (vl) g.appendChild(tile("শব্দের বৈচিত্র্য", { high: "বেশি", medium: "মাঝারি", basic: "সরল" }[vl], null, true));
  if (m.words >= 30) g.appendChild(tile("যুক্ত বাক্য", bn(m.connectors), "because, but, so…", true));
  return g;
}

export function listLine(label, items) {
  if (!items || !items.length) return null;
  const p = el("p", "sp-note"); p.append(el("b", null, label + " "), document.createTextNode(items.map((x) => (typeof x === "string" ? x : x.target + "→" + x.heard)).join(", ")));
  return p;
}
