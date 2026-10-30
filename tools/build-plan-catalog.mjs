/* Build data/plan-catalog.json (grammar topic list per level) from topics/<level>/*.html.
   Run:  node tools/build-plan-catalog.mjs */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const out = { version: 1, topics: {} };
for (const level of ["a1", "a2", "b1", "b2", "c1", "c2"]) {
  const dir = new URL(`topics/${level}/`, root);
  const list = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".html"))) {
    const html = readFileSync(new URL(f, dir), "utf8");
    const id = (html.match(/initTopic\(\{\s*id:\s*"([^"]+)"/) || [])[1];
    const xp = Number((html.match(/initTopic\(\{[^}]*xp:\s*(\d+)/) || [])[1]) || 0;
    let title = ((html.match(/<title>([^<]*)<\/title>/) || [])[1] || f).trim();
    title = title.replace(/\s*[—–-]?\s*English Shekho\s*$/i, "").replace(/[^\p{L}\p{N}&' ,\-:()]/gu, "").replace(/\s+/g, " ").trim();
    if (!id) { console.warn("no id in", level, f); continue; }
    list.push({ id, title: title || f.replace(".html", ""), href: `topics/${level}/${f}`, xp });
  }
  // order by the numeric part of the id (a1-t1, a1-t2 …)
  list.sort((a, b) => Number(a.id.split("-t")[1]) - Number(b.id.split("-t")[1]));
  out.topics[level.toUpperCase()] = list;
}
writeFileSync(new URL("data/plan-catalog.json", root), JSON.stringify(out));
const n = Object.values(out.topics).reduce((s, l) => s + l.length, 0);
console.log("topics:", n, Object.fromEntries(Object.entries(out.topics).map(([k, v]) => [k, v.length])));
console.log(out.topics.A1.slice(0, 3).map((t) => `${t.id} | ${t.title}`).join("\n"));
