import type { AspectKey, Point } from '../config/types';

/**
 * Every plate is authored 16:9. Alternate aspects are "cover" crops anchored on
 * a per-shot focal point — this maps plate-space points into output pixels so
 * leak annotations stay locked to their holes in every aspect.
 */
export function coverRect(outW: number, outH: number, focal: Point, plateAspect = 16 / 9) {
  const dispW = Math.max(outW, outH * plateAspect);
  const dispH = dispW / plateAspect;
  const left = (outW - dispW) * focal[0];
  const top = (outH - dispH) * focal[1];
  return { left, top, width: dispW, height: dispH };
}

export function plateToScreen(p: Point, outW: number, outH: number, focal: Point): Point {
  const r = coverRect(outW, outH, focal);
  return [r.left + p[0] * r.width, r.top + p[1] * r.height];
}

/** Animatic framing: zoom about (cx,cy) in plate space. */
export function frameAnimatic(p: Point, zoom: number, cx: number, cy: number): Point {
  return [(p[0] - cx) * zoom + 0.5, (p[1] - cy) * zoom + 0.5];
}

export const aspectOf = (w: number, h: number): AspectKey => {
  const r = w / h;
  if (r > 1.3) return '16:9';
  if (r < 0.8) return '9:16';
  return '1:1';
};

export type PlacementMode = 'native' | 'cover' | 'fit-width';
export interface Placement { mode: PlacementMode; left: number; top: number; width: number; height: number; trackKey: string }

/**
 * How a shot's picture sits in the output frame:
 *  - native:    a plate rendered for this aspect exists (preferred for 1:1 / 9:16 — CG cameras re-render cheaply)
 *  - cover:     only the 16:9 plate exists, cropped around the focal point
 *  - fit-width: animatic only — the procedural frame extends vertically instead of cropping
 */
export function placementFor(
  shotId: string, focal: Point, outW: number, outH: number,
  plates: Record<string, string>,
): Placement {
  const aspect = aspectOf(outW, outH);
  const nativeKey = `${shotId}@${aspect}`;
  if (aspect !== '16:9' && plates[nativeKey]) return { mode: 'native', left: 0, top: 0, width: outW, height: outH, trackKey: nativeKey };
  if (plates[shotId] || aspect === '16:9') return { mode: 'cover', ...coverRect(outW, outH, focal), trackKey: shotId };
  const h = outW * (9 / 16);
  return { mode: 'fit-width', left: 0, top: (outH - h) / 2, width: outW, height: h, trackKey: shotId };
}

/** Overhead shots: holes are spaced evenly around the rim in hole order (labels never collide). */
export function topDownPos(index: number, count: number): Point {
  const ang = -Math.PI / 2 + Math.PI / count + (index * 2 * Math.PI) / count;
  const r = 0.22 * (9 / 16) + 0.004;
  return [0.5 + Math.cos(ang) * r, 0.5 + Math.sin(ang) * r * (16 / 9)];
}
