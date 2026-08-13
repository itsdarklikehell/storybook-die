// UI tests for The Storybook Die — jsdom-driven.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ FAIL: ' + name); }
}

function makeDom(seedState) {
  const consoleErrors = [];
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'http://localhost/',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.matchMedia = window.matchMedia || function () {
        return { matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return false; } };
      };
      window.addEventListener('error', e => consoleErrors.push(String(e.message || e.error)));
      if (seedState) window.localStorage.setItem('storybook-die:v1', JSON.stringify(seedState));
    },
  });
  return { dom, consoleErrors };
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('— initial state —');
  let { dom, consoleErrors } = makeDom();
  let { document } = dom.window;
  ok(document.getElementById('rollBtn') !== null, 'roll button exists');
  ok(document.querySelectorAll('.die-opt').length === 6, 'six die options');
  ok(document.querySelector('.die-opt.selected').dataset.sides === '20', 'd20 selected by default');
  ok(!document.getElementById('narration').classList.contains('shown'), 'narration hidden initially');
  ok(document.getElementById('historyList').textContent.includes('no rolls witnessed'), 'empty history');

  console.log('— rolling —');
  document.getElementById('rollBtn').click();
  await sleep(700);
  const face = document.getElementById('dieFace').textContent;
  const num = Number(face);
  ok(num >= 1 && num <= 20, 'die face shows a valid d20 roll: ' + face);
  ok(document.getElementById('narration').classList.contains('shown'), 'narration appears after roll');
  ok(document.getElementById('narrationText').textContent.length > 10, 'narration has text');
  const tierText = document.getElementById('narrationTier').textContent;
  ok(['critical','favourable','uncertain','unfortunate','fumbled'].includes(tierText), 'tier label is one of the five');
  const stored = JSON.parse(dom.window.localStorage.getItem('storybook-die:v1'));
  ok(stored.length === 1, 'roll persisted to history');
  ok(stored[0].sides === 20, 'history records the die');

  console.log('— die switching —');
  document.querySelector('.die-opt[data-sides="6"]').click();
  await sleep(40);
  ok(document.querySelector('.die-opt.selected').dataset.sides === '6', 'd6 becomes selected');
  document.getElementById('rollBtn').click();
  await sleep(700);
  const num2 = Number(document.getElementById('dieFace').textContent);
  ok(num2 >= 1 && num2 <= 6, 'd6 roll in range: ' + num2);

  console.log('— manual narration —');
  document.querySelector('.die-opt[data-sides="20"]').click();
  await sleep(40);
  const input = document.getElementById('manualInput');
  input.value = '20';
  document.getElementById('manualBtn').click();
  await sleep(80);
  ok(document.getElementById('narrationTier').textContent === 'critical', 'manual nat 20 → critical');
  ok(document.getElementById('dieFace').textContent === '20', 'die face shows the manual roll');

  console.log('— manual validation —');
  input.value = '99';
  document.getElementById('manualBtn').click();
  await sleep(80);
  ok(document.getElementById('note').textContent.includes('between 1 and'), 'out-of-range manual roll rejected');
  input.value = '';
  document.getElementById('manualBtn').click();
  await sleep(80);
  ok(document.getElementById('note').textContent.includes('between 1 and'), 'empty manual roll rejected');

  console.log('— persistence across reload —');
  const saved = JSON.parse(dom.window.localStorage.getItem('storybook-die:v1'));
  ok(saved.length >= 2, 'history has multiple rolls');
  let domB = makeDom(saved);
  await sleep(80);
  ok(domB.dom.window.document.getElementById('historyList').textContent.includes('falls'), 'history restores after reload');

  console.log('— zero console errors —');
  ok(consoleErrors.length === 0, 'no console errors: ' + (consoleErrors.length ? consoleErrors.join(' | ') : 'clean'));

  console.log('');
  console.log(`RESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => {
  console.error('TEST CRASH:', e);
  process.exit(2);
});
