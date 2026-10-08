// Renders one line in each shortlisted voice so the narrator can be chosen by ear.
import film from '../../src/config/film.config';
import { argv, cached, client } from './client';

const { force } = argv();
const line = film.narration.find((s) => s.id === 'VO_03_SCALE')!.text;
const el = client();
for (const voice of film.audio.voice.shortlist) {
  const req = { text: line, modelId: film.audio.voice.modelId, outputFormat: film.audio.voice.outputFormat, voiceSettings: film.audio.voice.settings };
  await cached(`audio/vo/audition/${voice.id}.mp3`, { voice: voice.id, ...req }, force, () => el.textToSpeech.convert(voice.id, req as never));
  console.log(`    ${voice.name}`);
}
