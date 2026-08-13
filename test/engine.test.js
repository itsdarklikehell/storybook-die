// Engine tests for The Storybook Die — pure functions, no DOM.
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error('NO SCRIPT FOUND'); process.exit(1); }

fs.writeFileSync(path.join(__dirname, 'engine.js'),
  m[1] + '\nmodule.exports = { SIDES, NARRATIONS, TIER_ORDER, tierFor, narrationFor, rollDie };'
);

const E = require('./engine.js');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ FAIL: ' + name); }
}

function seededRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

console.log('— constants —');
ok(E.SIDES.join(',') === '4,6,8,10,12,20', 'six standard dice');
ok(['crit','good','mid','poor','fumble'].every(t => Array.isArray(E.NARRATIONS[t]) && E.NARRATIONS[t].length >= 4), 'every tier has narration lines');
ok(E.NARRATIONS.crit.length >= 5 && E.NARRATIONS.fumble.length >= 5, 'crit and fumble are the richest pools');

console.log('— tierFor —');
ok(E.tierFor(20, 20) === 'crit', 'nat 20 is crit');
ok(E.tierFor(1, 20) === 'fumble', 'nat 1 is fumble');
ok(E.tierFor(4, 4) === 'crit', 'max on d4 is crit');
ok(E.tierFor(1, 4) === 'fumble', 'min on d4 is fumble');
ok(E.tierFor(15, 20) === 'good', '15 on d20 is good (0.75)');
ok(E.tierFor(10, 20) === 'mid', '10 on d20 is mid (0.5)');
ok(E.tierFor(6, 20) === 'poor', '6 on d20 is poor');
ok(E.tierFor(3, 6) === 'mid', '3 on d6 is mid (0.5)');
ok(E.tierFor(5, 6) === 'good', '5 on d6 is good');
ok(E.tierFor(2, 6) === 'poor', '2 on d6 is poor');
ok(E.tierFor('abc', 20) === null, 'garbage input → null');
ok(E.tierFor(undefined, 20) === null, 'undefined → null');

console.log('— narrationFor —');
const n1 = E.narrationFor(20, 20, seededRng(1));
ok(n1.tier === 'crit' && E.NARRATIONS.crit.includes(n1.line), 'crit roll gets a crit line');
const n2 = E.narrationFor(1, 20, seededRng(2));
ok(n2.tier === 'fumble' && E.NARRATIONS.fumble.includes(n2.line), 'fumble roll gets a fumble line');
ok(E.narrationFor(99, 20) === null, 'invalid roll → null');
const a = E.narrationFor(20, 20, seededRng(7));
const b = E.narrationFor(20, 20, seededRng(7));
ok(a.line === b.line, 'same seed → same line');

console.log('— rollDie —');
ok(E.rollDie(20, seededRng(3)) >= 1 && E.rollDie(20, seededRng(3)) <= 20, 'd20 in range');
ok(E.rollDie(4, seededRng(3)) <= 4, 'd4 in range');
ok(E.rollDie(7, seededRng(3)) === null, 'invalid sides → null');
const d1 = E.rollDie(20, seededRng(5));
const d2 = E.rollDie(20, seededRng(5));
ok(d1 === d2, 'same seed → same roll');

console.log('— engine is DOM-free —');
ok(!m[1].includes('module.exports'), 'no pre-existing exports in source');

console.log('');
console.log(`RESULT: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
