// Writes src/generated/assets.json so the render knows which plates/audio exist.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import film from '../src/config/film.config';

const ROOT = join(import.meta.dirname, '..');
const PUB = join(ROOT, 'public');
const dur = (abs: string) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', abs]).toString().trim());

const plates: Record<string, string> = {};
for (const sh of film.shots) {
  for (const ext of ['mp4', 'mov', 'webm']) {
    const rel = sh.plate.replace(/\.\w+$/, `.${ext}`);
    if (existsSync(join(PUB, rel))) { plates[sh.id] = rel; break; }
  }
  // native alternate-aspect renders: plates/S06@9x16.mp4, plates/S06@1x1.mp4
  for (const [aspect, tag] of [['9:16', '9x16'], ['1:1', '1x1']]) {
    for (const ext of ['mp4', 'mov', 'webm']) {
      const rel = sh.plate.replace(/\.\w+$/, `@${tag}.${ext}`);
      if (existsSync(join(PUB, rel))) { plates[`${sh.id}@${aspect}`] = rel; break; }
    }
  }
}
const vo: Record<string, { file: string; duration: number }> = {};
for (const seg of film.narration) {
  const rel = `audio/vo/${seg.id}.mp3`;
  if (existsSync(join(PUB, rel))) vo[seg.id] = { file: rel, duration: dur(join(PUB, rel)) };
}
const sfx: Record<string, { file: string; duration: number }> = {};
for (const key of Object.keys(film.sfxLibrary)) {
  const rel = `audio/sfx/${key}.mp3`;
  if (existsSync(join(PUB, rel))) sfx[key] = { file: rel, duration: dur(join(PUB, rel)) };
}
const musicRel = film.audio.music.overrideFile ?? film.audio.music.file;
const music = existsSync(join(PUB, musicRel)) ? { file: musicRel, duration: dur(join(PUB, musicRel)) } : null;

const tracks: Record<string, unknown> = {};
const tdir = join(ROOT, 'tracks');
if (existsSync(tdir)) for (const fn of readdirSync(tdir).filter((x) => x.endsWith('.json'))) tracks[fn.replace('.json', '').replace('@9x16', '@9:16').replace('@1x1', '@1:1')] = JSON.parse(readFileSync(join(tdir, fn), 'utf8'));

const manifest = { generatedAt: new Date().toISOString(), plates, vo, music, sfx, tracks, brand: {} };
writeFileSync(join(ROOT, 'src/generated/assets.json'), JSON.stringify(manifest, null, 2));
console.log(`plates ${Object.keys(plates).filter((k) => !k.includes('@')).length}/${film.shots.length - 1} · vo ${Object.keys(vo).length}/${film.narration.filter((n) => n.enabled).length} · sfx ${Object.keys(sfx).length}/${Object.keys(film.sfxLibrary).length} · music ${music ? 'yes' : 'no'} · tracks ${Object.keys(tracks).length}`);
