import film from '../../src/config/film.config';
import { argv, cached, client } from './client';

const { force, only, dry } = argv();
const el = dry ? null : client();
for (const [key, item] of Object.entries(film.sfxLibrary)) {
  if (only && !only.includes(key)) continue;
  const req = { text: item.prompt, durationSeconds: item.durationSeconds, loop: item.loop, promptInfluence: item.promptInfluence ?? 0.6, outputFormat: 'mp3_44100_192' };
  if (dry) { console.log(`  [dry] ${key}: ${item.prompt}`); continue; }
  await cached(`audio/sfx/${key}.mp3`, req, force || !!only, () => el!.textToSoundEffects.convert(req as never));
}
console.log('Done. Run `npm run scan`.');
