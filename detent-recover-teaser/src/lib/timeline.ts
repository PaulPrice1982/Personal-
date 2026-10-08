import film from '../config/film.config';
import type { HoleEvent, LeakCategory, Shot } from '../config/types';

export const fps = film.output.fps;
export const totalFrames = Math.round(film.output.durationSeconds * fps);
export const f = (seconds: number) => Math.round(seconds * fps);
export const s = (frame: number) => frame / fps;

const byId = new Map<string, LeakCategory>(film.leakCategories.map((c) => [c.id, c]));
export const category = (id: string) => {
  const c = byId.get(id);
  if (!c) throw new Error(`Unknown leak category "${id}"`);
  return c;
};
export const holeById = new Map<string, HoleEvent>(film.holes.map((h) => [h.id, h]));

export const formatLabel = (label: string) => (film.labelCase === 'upper' ? label.toUpperCase() : label);

export type HoleState = 'closed' | 'leaking' | 'sealing' | 'sealed';

/** How long the "sealed" confirmation stays visible before the label retires. */
export const SEALED_HOLD = 1.1;

export function holeState(h: HoleEvent, t: number): HoleState {
  if (t < h.opensAt) return 'closed';
  if (t < h.sealsAt) return 'leaking';
  if (t < h.sealsAt + 0.25) return 'sealing';
  return 'sealed';
}

/** The category currently named by a hole — rotation slots cycle through theirs. */
export function holeCategory(h: HoleEvent, t: number): LeakCategory {
  if (h.kind === 'leak') return category(h.leak);
  const visibleCycle = h.cycle.map(category).filter((c) => c.showOnScreen);
  const list = visibleCycle.length ? visibleCycle : h.cycle.map(category);
  const elapsed = Math.max(0, Math.min(t, h.sealsAt) - h.labelAt);
  return list[Math.floor(elapsed / h.cycleEvery) % list.length];
}

/** Is the label for this hole on screen at time t (ignoring shot visibility)? */
export function labelLive(h: HoleEvent, t: number): boolean {
  if (h.kind === 'leak' && !category(h.leak).showOnScreen) return false;
  return t >= h.labelAt && t < h.sealsAt + SEALED_HOLD;
}

export function shotAt(t: number): Shot {
  return film.shots.find((sh) => t >= sh.start && t < sh.end) ?? film.shots[film.shots.length - 1];
}

/** Labels visible in a given frame — used by the renderer and by QC. */
export function visibleLabels(t: number) {
  const shot = shotAt(t);
  return shot.visible
    .map((id) => holeById.get(id))
    .filter((h): h is HoleEvent => !!h && labelLive(h, t));
}

export function openHoleCount(t: number) {
  return film.holes.filter((h) => holeState(h, t) === 'leaking').length;
}
