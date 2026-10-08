// npm run vo                         -> generate any missing/changed segments
// npm run vo -- --only=VO_04_RECOVER -> regenerate one segment
// npm run vo -- --force              -> regenerate all enabled segments
import film from '../../src/config/film.config';
import { argv, cached, client } from './client';

const { force, only, dry } = argv();
const v = film.audio.voice;
const segs = film.narration.filter((s) => s.enabled && (!only || only.includes(s.id)));
const enabled = film.narration.filter((s) => s.enabled);

console.log(`Voice ${v.voiceId} · model ${v.modelId} · ${segs.length} segment(s)`);
const el = dry ? null : client();

for (const seg of segs) {
  const i = enabled.findIndex((s) => s.id === seg.id);
  const request = {
    text: seg.text,
    modelId: v.modelId,
    outputFormat: v.outputFormat,
    voiceSettings: v.settings,
    seed: v.seed,
    languageCode: 'en',
    // continuity: neighbouring lines inform prosody so separate takes sound like one read
    ...(v.useContinuityContext && i > 0 ? { previousText: enabled[i - 1].text } : {}),
    ...(v.useContinuityContext && i < enabled.length - 1 ? { nextText: enabled[i + 1].text } : {}),
  };
  if (dry) { console.log(`  [dry] ${seg.id}: "${seg.text}"`); continue; }
  await cached(`audio/vo/${seg.id}.mp3`, { voiceId: v.voiceId, ...request }, force || !!only, () =>
    el!.textToSpeech.convert(v.voiceId, request as never),
  );
}
console.log('Done. Run `npm run scan` to update durations, then `npm run qc`.');
