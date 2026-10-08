// Leak annotations: a ring on the hole, a thin elbow leader, and a mono label.
// Designed to read as precise instrumentation, not PowerPoint call-outs.
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import film from '../config/film.config';
import type { HoleEvent, Point, Shot } from '../config/types';
import { assets } from '../lib/assets';
import { aspectOf, frameAnimatic, placementFor, topDownPos, type Placement } from '../lib/crop';
import { formatLabel, holeCategory, holeState, labelLive, holeById, s, SEALED_HOLD } from '../lib/timeline';
import { colours, fonts, unit } from '../lib/theme';

function anchorFor(shot: Shot, h: HoleEvent, localFrame: number, trackKey: string): Point {
  const track = assets.tracks[trackKey]?.[h.id];
  if (track?.length) return track[Math.min(track.length - 1, localFrame)];
  if (shot.anchors?.[h.id]) return shot.anchors[h.id];
  const a = shot.animatic;
  const progress = (s(localFrame)) / (shot.end - shot.start);
  return frameAnimatic(a.topDown ? topDownPos(film.holes.indexOf(h), film.holes.length) : h.pos, a.zoom * (1 + 0.035 * progress), a.cx, a.cy);
}

export const LeakLabels: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const t = shot.start + frame / fps;
  const u = unit(W, H);
  const aspect = aspectOf(W, H);
  const place: Placement = placementFor(shot.id, shot.focal[aspect], W, H, assets.plates);
  const toScreen = (p: Point): Point => [place.left + p[0] * place.width, place.top + p[1] * place.height];
  const safeX = W * film.output.titleSafe.x;
  const maxY = H * (1 - film.output.captionBand);

  const items = shot.visible
    .map((id) => holeById.get(id))
    .filter((h): h is HoleEvent => !!h && labelLive(h, t));

  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {items.map((h) => {
          const [x, y] = toScreen(anchorFor(shot, h, frame, place.trackKey));
          if (x < 0 || x > W || y < 0 || y > H) return null;
          const state = holeState(h, t);
          const sealed = state === 'sealing' || state === 'sealed';
          const sinceLabel = t - Math.max(h.labelAt, shot.start - 0.5);
          const draw = interpolate(sinceLabel, [0, 0.45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
          const retire = interpolate(t, [h.sealsAt + SEALED_HOLD - 0.4, h.sealsAt + SEALED_HOLD], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const sealK = interpolate(t, [h.sealsAt, h.sealsAt + 0.25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const col = sealed ? colours.sealed : colours.leak;
          const side = x < W / 2 ? -1 : 1;
          const elbow = 26 * u, run = 70 * u;
          // keep text out of caption band and inside title-safe
          const ly = Math.min(maxY, Math.max(H * film.output.titleSafe.y + 20 * u, y - elbow));
          let lx = x + side * (elbow + run);
          lx = side < 0 ? Math.max(safeX + 200 * u, lx) : Math.min(W - safeX - 200 * u, lx);
          const pulse = sealed ? 0 : (Math.sin(t * 5 + h.pos[0] * 20) + 1) / 2;
          const cat = holeCategory(h, t);
          const textOpacity = interpolate(sinceLabel, [0.25, 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * retire;
          const pathLen = elbow * 1.5 + run;
          // rotation slots: crossfade between names
          let swap = 1;
          if (h.kind === 'rotation' && t < h.sealsAt) {
            const p = ((t - h.labelAt) % h.cycleEvery) / h.cycleEvery;
            swap = interpolate(p, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);
          }
          return (
            <g key={h.id} opacity={retire}>
              <circle cx={x} cy={y} r={(9 + pulse * 3) * u} fill="none" stroke={col} strokeWidth={1.4 * u} strokeOpacity={0.55 + 0.35 * (1 - pulse)} />
              {sealed && <circle cx={x} cy={y} r={3.2 * u * sealK} fill={col} />}
              <polyline
                points={`${x + side * 9 * u},${y - 6 * u} ${x + side * elbow},${ly} ${lx},${ly}`}
                fill="none" stroke={col} strokeOpacity={0.75} strokeWidth={1.1 * u}
                strokeDasharray={pathLen} strokeDashoffset={pathLen * (1 - draw)}
              />
              <text
                x={lx + side * 10 * u} y={ly - 8 * u}
                textAnchor={side < 0 ? 'end' : 'start'}
                fontFamily={fonts.mono} fontWeight={500} fontSize={15 * u} letterSpacing={2.2 * u}
                fill={colours.paper} opacity={textOpacity * swap}
              >
                {formatLabel(cat.label)}
              </text>
              <text
                x={lx + side * 10 * u} y={ly + 16 * u}
                textAnchor={side < 0 ? 'end' : 'start'}
                fontFamily={fonts.mono} fontSize={10 * u} letterSpacing={2.6 * u}
                fill={col} opacity={textOpacity * 0.85}
              >
                {sealed ? '■ SEALED' : '● LEAKING'}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
