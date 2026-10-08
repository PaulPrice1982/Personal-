// Automated pre-render QC. Exit code 1 on any FAIL.
import film from '../src/config/film.config';
import { assets } from '../src/lib/assets';
import { visibleLabels, holeCategory, f, s, totalFrames } from '../src/lib/timeline';
import { voWindows } from '../src/lib/audioTimeline';

const CANON = [
  'Additional Users', 'Additional Companies', 'Non-Group Entities', 'Additional Storage', 'Additional Sites',
  'Mergers & Acquisitions', 'Insolvency', 'Additional Tokens', 'Additional Beds', 'Additional Persons',
  'Additional Payslips', 'Additional Databases', 'Additional Instances', 'Additional Documents', 'Missed Billing',
  'Additional Content', 'Early Terminations', 'Contract Equity', 'GRR',
];
const MUST_FEATURE = ['additional-users', 'additional-companies', 'non-group-entities', 'mergers-acquisitions', 'additional-storage', 'additional-sites', 'missed-billing', 'contract-equity'];

let fails = 0, warns = 0;
const fail = (m: string) => { fails++; console.log(`FAIL  ${m}`); };
const warn = (m: string) => { warns++; console.log(`WARN  ${m}`); };
const pass = (m: string) => console.log(`PASS  ${m}`);

// 1. Terminology
const labels = film.leakCategories.map((c) => c.label);
const missing = CANON.filter((c) => !labels.includes(c));
const extra = labels.filter((l) => !CANON.includes(l));
missing.length || extra.length ? fail(`terminology — missing [${missing}] unexpected [${extra}]`) : pass('terminology matches the canonical 19 exactly');

// 2. Shot continuity
let ok = true;
for (let i = 1; i < film.shots.length; i++) if (Math.abs(film.shots[i].start - film.shots[i - 1].end) > 1e-6) { ok = false; fail(`gap/overlap between ${film.shots[i - 1].id} and ${film.shots[i].id}`); }
if (film.shots.at(-1)!.end !== film.output.durationSeconds) { ok = false; fail('last shot does not end at film duration'); }
ok && pass(`${film.shots.length} shots contiguous 0–${film.output.durationSeconds}s`);

// 3. Label density + coverage, frame by frame
let peak = 0, peakT = 0;
const shown = new Set<string>();
for (let fr = 0; fr < totalFrames; fr++) {
  const t = s(fr);
  const v = visibleLabels(t);
  if (v.length > peak) { peak = v.length; peakT = t; }
  v.forEach((h) => shown.add(holeCategory(h, t).id));
}
peak > film.maxConcurrentLabels ? fail(`peak ${peak} labels at ${peakT.toFixed(2)}s (max ${film.maxConcurrentLabels})`) : pass(`peak concurrent labels ${peak} (max ${film.maxConcurrentLabels})`);
const notFeatured = MUST_FEATURE.filter((id) => !shown.has(id));
notFeatured.length ? fail(`primary leaks never labelled: ${notFeatured}`) : pass('all 8 prominent leaks are labelled');
pass(`${shown.size}/19 categories appear on screen`);
const hidden = film.leakCategories.filter((c) => !shown.has(c.id)).map((c) => c.label);
if (hidden.length) warn(`not shown: ${hidden.join(', ')}`);

// 4. Every hole seals before the money shot
const late = film.holes.filter((h) => h.sealsAt > film.finalSealAt);
late.length ? fail(`holes sealing after final seal: ${late.map((h) => h.id)}`) : pass(`every leak sealed by ${film.finalSealAt}s`);
const moneyShot = film.shots.find((x) => x.scene === 6)!;
film.finalSealAt >= moneyShot.start ? fail('final seal lands inside the money shot') : pass('all leaks sealed before money shot');

// 5. Narration timing
const wins = voWindows();
for (const w of wins) {
  const real = !!assets.vo[w.id];
  if (w.end > w.mustEndBy) (real ? fail : warn)(`${w.id} ends ${w.end.toFixed(2)}s > mustEndBy ${w.mustEndBy}s ${real ? '' : '(estimated — no take yet)'}`);
}
for (let i = 1; i < wins.length; i++) if (wins[i].start < wins[i - 1].end) fail(`${wins[i].id} overlaps ${wins[i - 1].id}`);
const silent = wins.some((w) => w.start < moneyShot.end && w.end > moneyShot.start);
silent ? fail('narration plays over the money shot') : pass('money shot is free of narration');
pass(`${wins.length} narration segments, ${wins.filter((w) => assets.vo[w.id]).length} generated`);

// 6. Copy sanity
for (const sp of film.supers) if (sp.end > film.output.durationSeconds || sp.start >= sp.end) fail(`super ${sp.id} timing invalid`);
const usSpell = /\b(color|realize|organization|analyze)\b/i;
[...film.supers.map((x) => x.text), ...film.narration.map((x) => x.text)].forEach((txt) => usSpell.test(txt) && fail(`US spelling: "${txt}"`));
pass('supers timed within film; no US spellings in copy');

// 7. Config placeholders that must be resolved before release
if (film.brand.registrationUrl.startsWith('{{')) warn('brand.registrationUrl is still a placeholder');
if (!film.brand.recoverLogo) warn('brand.recoverLogo not supplied — typographic placeholder in use');
const cats = film.leakCategories.find((c) => c.id === 'grr');
if (cats?.showOnScreen) warn('GRR is a metric, not a leak source — recommend showOnScreen:false');
const eligible = film.leakCategories.filter((c) => c.showOnScreen).length;
if (eligible < 19) warn(`${19 - eligible} category hidden by config (showOnScreen:false)`);

// 8. Assets
const plateCount = Object.keys(assets.plates).length;
plateCount < film.shots.length - 1 ? warn(`plates ${plateCount}/${film.shots.length - 1} — animatic placeholders will render`) : pass('all plates present');
if (!assets.music && !film.audio.music.overrideFile) warn('no music generated yet');
const sfxMissing = Object.keys(film.sfxLibrary).filter((k) => !assets.sfx[k]);
if (sfxMissing.length) warn(`SFX missing: ${sfxMissing.length}/${Object.keys(film.sfxLibrary).length}`);

console.log(`\n${fails} fail, ${warns} warn`);
process.exit(fails ? 1 : 0);
