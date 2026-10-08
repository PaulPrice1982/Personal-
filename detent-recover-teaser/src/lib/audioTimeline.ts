import film from '../config/film.config';
import { assets } from './assets';
import { random } from 'remotion';

export const dbToGain = (db: number) => Math.pow(10, db / 20);

export interface PlacedSfx { key: string; id: string; at: number; gainDb: number; duration?: number; loop?: boolean }

const enabledVo = () => film.narration.filter((v) => v.enabled);

/** Real duration if the take exists, otherwise an estimate from word count. */
export function voDuration(id: string, text: string) {
  const a = assets.vo[id];
  if (a) return a.duration;
  return text.split(/\s+/).length / film.captions.fallbackWordsPerSecond + 0.3;
}

export const voWindows = () =>
  enabledVo().map((v) => ({ ...v, end: v.start + voDuration(v.id, v.text) }));

/** Full SFX cue list: hand-placed cues + seal clicks + procedural inflow/escape. */
export function buildSfx(): PlacedSfx[] {
  const out: PlacedSfx[] = film.sfxCues.map((c) => ({ key: c.file, id: c.id, at: c.at, gainDb: c.gainDb, duration: c.duration, loop: c.loop }));

  for (const h of film.holes) {
    if (Math.abs(h.sealsAt - film.finalSealAt) < 0.01) continue; // final seal has its own heavier cue
    out.push({ key: 'seal_click', id: `seal-${h.id}`, at: h.sealsAt, gainDb: -8 });
  }

  const { inflow, escape } = film.sfxProcedural;
  for (let t = inflow.from, i = 0; t < inflow.to; i++) {
    const v = inflow.variants[Math.floor(random(`in-v-${i}`) * inflow.variants.length)];
    out.push({ key: v, id: `in-${i}`, at: t, gainDb: inflow.gainDb + (random(`in-g-${i}`) - 0.5) * 6 });
    t += inflow.everySeconds + (random(`in-j-${i}`) - 0.5) * 2 * inflow.jitter;
  }

  // Escapes: denser as more holes open, never denser than minEvery.
  for (let t = 8.4, i = 0; t < film.finalSealAt; i++) {
    const open = film.holes.filter((h) => t >= h.opensAt && t < h.sealsAt).length;
    if (open > 0) {
      const v = escape.variants[Math.floor(random(`es-v-${i}`) * escape.variants.length)];
      out.push({ key: v, id: `es-${i}`, at: t, gainDb: escape.gainDb + (random(`es-g-${i}`) - 0.5) * 6 });
    }
    t += Math.max(escape.minEvery, escape.baseEvery / Math.max(1, open)) * (0.8 + random(`es-j-${i}`) * 0.4);
  }
  return out.sort((a, b) => a.at - b.at);
}

/** Music gain (linear) at time t: base level, ducking under VO, and the post-seal dip. */
export function musicGainAt(t: number) {
  const m = film.audio.mix;
  let db = m.musicDb;
  let duck = 0;
  for (const w of voWindows()) {
    const a = w.start - m.duckAttack, b = w.end + m.duckRelease;
    if (t < a || t > b) continue;
    let k = 1;
    if (t < w.start) k = (t - a) / m.duckAttack;
    else if (t > w.end) k = 1 - (t - w.end) / m.duckRelease;
    duck = Math.min(duck, m.duckDb * k);
  }
  db += duck;
  const dt = t - film.finalSealAt;
  if (dt > 0 && dt < m.finalSealDipDuration) db += m.finalSealDipDb * Math.sin((Math.PI * dt) / m.finalSealDipDuration);
  // fade in / out of the whole bed
  const fadeIn = Math.min(1, t / 1.5);
  const fadeOut = Math.min(1, (film.output.durationSeconds - t) / 1.0);
  return dbToGain(db) * Math.max(0, fadeIn) * Math.max(0, fadeOut);
}

/** SFX bed also dips after the final seal so the audience "hears" the leak stop. */
export function sfxBusGainAt(t: number) {
  const m = film.audio.mix;
  const dt = t - (film.finalSealAt + 0.4);
  let db = m.sfxMasterDb;
  if (dt > 0 && dt < m.finalSealDipDuration) db += (m.finalSealDipDb / 2) * Math.sin((Math.PI * dt) / m.finalSealDipDuration);
  return dbToGain(db);
}
