import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
function loadWords(level) {
  const src = read(`js/vocab-${level}.js`).replace(/export\s*\{[^}]+\};?/, '');
  const sandbox = {};
  vm.runInNewContext(src + `\nglobalThis.result = VOCAB_${level.toUpperCase()};`, sandbox);
  return sandbox.result;
}

test('C1 and C2 vocabulary datasets have unique IDs and complete core fields', () => {
  for (const level of ['c1', 'c2']) {
    const words = loadWords(level);
    assert.ok(words.length >= 50, `${level} should have a useful starter bank`);
    assert.equal(new Set(words.map(w => w.id)).size, words.length, `${level} IDs unique`);
    for (const w of words) {
      assert.ok(w.word && w.meaning && w.example && w.category, `${level} entry fields present: ${w.id}`);
      assert.equal(w.level, level.toUpperCase());
    }
  }
});

test('C1/C2 are linked from the vocabulary dashboard and precached', () => {
  const dashboard = read('vocab-dashboard.html');
  const sw = read('sw.js');
  for (const level of ['c1', 'c2']) {
    assert.match(dashboard, new RegExp(`href="vocab-${level}\\.html"`));
    assert.match(sw, new RegExp(`"/vocab-${level}\\.html"`));
    assert.match(sw, new RegExp(`"/js/vocab-${level}\\.js"`));
    assert.match(read(`vocab-${level}.html`), new RegExp(`VOCAB_${level.toUpperCase()}`));
  }
});

test('new C1/C2 banks do not duplicate A1–B2 or each other', () => {
  const all = {};
  for (const level of ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']) {
    all[level] = new Set(loadWords(level).map(w => w.word.trim().toLowerCase()));
  }
  for (const newer of ['c1', 'c2']) {
    for (const older of ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']) {
      if (newer === older) continue;
      const overlaps = [...all[newer]].filter(w => all[older].has(w));
      assert.deepEqual(overlaps, [], `${newer} overlaps ${older}: ${overlaps.join(', ')}`);
    }
  }
});
