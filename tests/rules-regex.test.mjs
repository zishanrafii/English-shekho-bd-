/* Decodes every regular expression used in firestore.rules (rules string-literal escapes → real regex) and runs it against
   known-good and known-bad inputs. Caught a real bug once: a mis-escaped pattern rejected every URL containing the letter "s". */
import { readFileSync } from "node:fs";
const rules = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
const out = []; const ok = (n, c) => out.push([n, !!c]);
const literals = [...rules.matchAll(/\.matches\('((?:[^'\\]|\\.)*)'\)/g)].map((m) => m[1]);
const decode = (lit) => lit.replace(/\\(['"\\])/g, "$1");
const photoLits = literals.filter((l) => l.startsWith("^https://"));
ok("both https-photo patterns are present (profile photoURL + writings photoURL)", photoLits.length === 2);
const good = ["https://lh3.googleusercontent.com/a/ACg8ocK=s96-c", "https://example.com/a.png", "https://x.y/z?x=1&y=2"];
const bad = ['https://x.com/a"onerror=1', "https://x.com/a'b", "https://x.com/a<b", "https://x.com/a>b", "https://x.com/a\\b", "https://x.com/a b", "http://x.com/a", "javascript:alert(1)", "https://", "data:text/html,x"];
for (const lit of photoLits) {
  const rx = new RegExp(decode(lit));
  ok("pattern accepts normal https image URLs (incl. any letter 's')", good.every((u) => rx.test(u)));
  ok("pattern rejects quotes, angle brackets, backslash, spaces, http:, javascript:, data:", bad.every((u) => !rx.test(u)));
}
ok("every regex in the rules compiles", literals.every((l) => { try { new RegExp(decode(l)); return true; } catch { return false; } }));
for (const [n, c] of out) console.log(c ? "PASS" : "FAIL", n);
process.exit(out.every(([, c]) => c) ? 0 : 1);
