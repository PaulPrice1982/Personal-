// Bespoke score via ElevenLabs Music using a composition plan whose sections are
// locked to the film timeline. Replace by setting audio.music.overrideFile.
import film from '../../src/config/film.config';
import { argv, cached, client } from './client';

const { force, dry } = argv();
const m = film.audio.music;
if (m.overrideFile) { console.log(`Music override in use (${m.overrideFile}); nothing to generate.`); process.exit(0); }

const compositionPlan = {
  positiveGlobalStyles: m.globalPositive,
  negativeGlobalStyles: m.globalNegative,
  sections: m.sections.map((s) => ({
    sectionName: s.name,
    positiveLocalStyles: s.positive,
    negativeLocalStyles: s.negative,
    durationMs: Math.round((s.end - s.start) * 1000),
    lines: [], // instrumental
  })),
};
const total = compositionPlan.sections.reduce((n, s) => n + s.durationMs, 0);
if (total !== film.output.durationSeconds * 1000) throw new Error(`Music sections sum to ${total}ms, film is ${film.output.durationSeconds * 1000}ms`);

if (dry) { console.log(JSON.stringify(compositionPlan, null, 2)); process.exit(0); }
const el = client();
await cached(m.file, { modelId: m.modelId, compositionPlan }, force, () =>
  el.music.compose({ compositionPlan, modelId: m.modelId as never, outputFormat: 'mp3_44100_192' as never }),
);
console.log('Done. Run `npm run scan`.');
