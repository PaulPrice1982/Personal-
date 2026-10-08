// ANIMATIC ONLY. Stands in for a plate until the CG/live-action render for the
// shot is dropped into public/plates/. It exists to lock timing, framing and
// label positions — it is not, and must never ship as, final picture.
import React from 'react';
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from 'remotion';
import film from '../config/film.config';
import type { Shot } from '../config/types';
import { aspectOf, placementFor, topDownPos } from '../lib/crop';
import { assets } from '../lib/assets';
import { holeState, s } from '../lib/timeline';
import { colours, fonts, unit } from '../lib/theme';

const VB_W = 1600, VB_H = 900;
// Bucket geometry in plate space (matches holes[].pos)
const RIM_Y = 0.29, BASE_Y = 0.78, RIM_L = 0.36, RIM_R = 0.64, BASE_L = 0.375, BASE_R = 0.625;
const X = (n: number) => n * VB_W, Y = (n: number) => n * VB_H;

export const PlaceholderPlate: React.FC<{ shot: Shot; drift?: number }> = ({ shot }) => {
  const frame = useCurrentFrame(); // local to the shot sequence
  const { width, height } = useVideoConfig();
  const t = shot.start + s(frame);
  const progress = (t - shot.start) / (shot.end - shot.start);
  const aspect = aspectOf(width, height);
  const rect = placementFor(shot.id, shot.focal[aspect], width, height, assets.plates);
  const u = unit(width, height);
  const a = shot.animatic;
  const zoom = a.zoom * (1 + 0.035 * progress); // slow camera drift
  const transform = `translate(${VB_W / 2} ${VB_H / 2}) scale(${zoom}) translate(${-X(a.cx)} ${-Y(a.cy)})`;
  const recoverOn = t >= 38.4;
  const bandProgress = Math.min(1, Math.max(0, (t - 38.6) / 7.4));

  if (a.endCard) return <AbsoluteFill style={{ background: colours.ink }} />;

  // inflow particles
  const inflow = t >= 2 && t < 52 ? Array.from({ length: 26 }, (_, i) => {
    const period = 1.6 + random(`p${i}`) * 0.8;
    const ph = ((t + random(`o${i}`) * period) % period) / period;
    const x = 0.44 + random(`x${i}`) * 0.12;
    const y = -0.05 + ph * (RIM_Y + 0.05);
    const note = random(`n${i}`) > 0.72;
    return { x, y, note, r: random(`r${i}`) };
  }) : [];

  // escaping particles per open hole
  const escapes = film.holes.flatMap((h) => {
    if (holeState(h, t) !== 'leaking') return [];
    return Array.from({ length: 4 }, (_, i) => {
      const period = 1.2 + random(`${h.id}p${i}`) * 0.6;
      const ph = ((t - h.opensAt + random(`${h.id}o${i}`) * period) % period) / period;
      const side = h.pos[0] < 0.5 ? -1 : 1;
      return { x: h.pos[0] + side * ph * 0.025, y: h.pos[1] + ph * ph * (BASE_Y + 0.08 - h.pos[1]), op: 1 - ph * 0.3 };
    });
  });

  // floor accumulation grows with total open-hole-seconds
  const lost = film.holes.reduce((acc, h) => acc + Math.max(0, Math.min(t, h.sealsAt) - h.opensAt), 0);
  const pile = Math.min(90, Math.floor(lost * 0.55));

  const cool = recoverOn ? Math.min(1, (t - 38.4) / 1.2) : 0;
  const keyColour = `rgba(${235 - cool * 40},${232 - cool * 10},${222 + cool * 25},`;

  return (
    <AbsoluteFill style={{ background: colours.ink }}>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        style={{ position: 'absolute', left: rect.left, top: rect.top, width: rect.width, height: rect.height, overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="key" cx="50%" cy="10%" r="70%">
            <stop offset="0%" stopColor={`${keyColour}0.22)`} />
            <stop offset="60%" stopColor={`${keyColour}0.04)`} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <linearGradient id="steel" x1="0" x2="1">
            <stop offset="0%" stopColor="#1b1e21" />
            <stop offset="28%" stopColor="#5c636a" />
            <stop offset="45%" stopColor="#9aa1a8" />
            <stop offset="62%" stopColor="#4a5056" />
            <stop offset="100%" stopColor="#121416" />
          </linearGradient>
          <linearGradient id="band" x1="0" x2="1">
            <stop offset="0%" stopColor="#0d1013" />
            <stop offset="45%" stopColor="#30373d" />
            <stop offset="100%" stopColor="#0b0d0f" />
          </linearGradient>
        </defs>
        <rect x={-VB_W} y={-VB_H * 2} width={VB_W * 3} height={VB_H * 5} fill="url(#key)" />
        <g transform={transform}>
          {a.topDown ? (
            <g>
              <circle cx={X(0.5)} cy={Y(0.5)} r={Y(0.36)} fill="none" stroke="#2b2f33" strokeWidth={2} />
              <circle cx={X(0.5)} cy={Y(0.5)} r={Y(0.22)} fill="url(#steel)" opacity={0.85} />
              <circle cx={X(0.5)} cy={Y(0.5)} r={Y(0.19)} fill="#0c0d0f" />
              {film.holes.map((h, i) => {
                const st = holeState(h, t);
                if (st === 'closed') return null;
                const [hx, hy] = topDownPos(i, film.holes.length);
                return <circle key={h.id} cx={X(hx)} cy={Y(hy)} r={5} fill={st === 'leaking' ? '#020202' : colours.accent} />;
              })}
              {Array.from({ length: Math.min(140, pile * 1.5) }, (_, i) => {
                const ang = random(`ta${i}`) * Math.PI * 2;
                const rr = Y(0.25) + random(`tr${i}`) * Y(0.1);
                return <rect key={i} x={X(0.5) + Math.cos(ang) * rr} y={Y(0.5) + Math.sin(ang) * rr} width={random(`tn${i}`) > 0.7 ? 22 : 8} height={random(`tn${i}`) > 0.7 ? 11 : 8} rx={random(`tn${i}`) > 0.7 ? 1 : 4} fill={random(`tn${i}`) > 0.7 ? '#6d7a6b' : '#a88d4f'} opacity={0.75} transform={`rotate(${random(`tt${i}`) * 180} ${X(0.5) + Math.cos(ang) * rr} ${Y(0.5) + Math.sin(ang) * rr})`} />;
              })}
            </g>
          ) : (
            <g>
              {/* floor + plinth */}
              <ellipse cx={X(0.5)} cy={Y(BASE_Y) + 6} rx={X(0.26)} ry={Y(0.045)} fill="#0e1012" />
              {/* escaped money on the floor */}
              {Array.from({ length: pile }, (_, i) => {
                const px = 0.2 + random(`fx${i}`) * 0.6;
                const py = BASE_Y + 0.01 + random(`fy${i}`) * 0.14;
                if (px > BASE_L && px < BASE_R && py < BASE_Y + 0.03) return null;
                const note = random(`fn${i}`) > 0.65;
                return <rect key={i} x={X(px)} y={Y(py)} width={note ? 34 : 10} height={note ? 16 : 6} rx={note ? 1 : 3} fill={note ? '#5f6d5c' : '#a88d4f'} opacity={0.7} transform={`rotate(${(random(`fr${i}`) - 0.5) * 60} ${X(px)} ${Y(py)})`} />;
              })}
              {/* bucket body */}
              <path d={`M${X(RIM_L)},${Y(RIM_Y)} L${X(RIM_R)},${Y(RIM_Y)} L${X(BASE_R)},${Y(BASE_Y)} Q${X(0.5)},${Y(BASE_Y + 0.035)} ${X(BASE_L)},${Y(BASE_Y)} Z`} fill="url(#steel)" />
              {/* brushed lines */}
              {Array.from({ length: 34 }, (_, i) => (
                <line key={i} x1={X(RIM_L + 0.003 + i * 0.0082)} y1={Y(RIM_Y + 0.01)} x2={X(BASE_L + 0.003 + i * 0.0074)} y2={Y(BASE_Y - 0.01)} stroke="#ffffff" strokeOpacity={0.025 + random(`b${i}`) * 0.03} strokeWidth={1} />
              ))}
              {/* rim */}
              <ellipse cx={X(0.5)} cy={Y(RIM_Y)} rx={X(0.142)} ry={Y(0.03)} fill="#0b0c0d" stroke="#b8bec4" strokeOpacity={0.7} strokeWidth={3} />
              {/* holes */}
              {film.holes.map((h) => {
                const st = holeState(h, t);
                if (st === 'closed') return null;
                const sealed = st === 'sealed' || st === 'sealing';
                return <rect key={h.id} x={X(h.pos[0]) - 9} y={Y(h.pos[1]) - 3} width={18} height={6} rx={2} fill={sealed ? colours.accent : '#020202'} opacity={sealed ? 0.55 : 0.95} />;
              })}
              {/* Detent Recover band — engineered collar travelling around the bucket */}
              {recoverOn && (
                <g opacity={Math.min(1, (t - 38.4) / 0.8)}>
                  <path d={`M${X(0.362)},${Y(0.33)} L${X(0.362 + 0.276 * bandProgress)},${Y(0.33)} L${X(0.374 + 0.25 * bandProgress)},${Y(0.76)} L${X(0.374)},${Y(0.76)} Z`} fill="url(#band)" opacity={0.55} />
                  <line x1={X(0.364)} y1={Y(0.545)} x2={X(0.364 + 0.268 * bandProgress)} y2={Y(0.545)} stroke={colours.accent} strokeWidth={2} strokeOpacity={0.9} />
                  {bandProgress > 0.15 && (
                    <text x={X(0.5)} y={Y(0.535)} fill="#c9d3da" fillOpacity={Math.min(0.8, bandProgress)} fontFamily={fonts.sans} fontSize={11} letterSpacing={5} textAnchor="middle">DETENT RECOVER</text>
                  )}
                </g>
              )}
              {/* escaping money */}
              {escapes.map((p, i) => <rect key={i} x={X(p.x)} y={Y(p.y)} width={7} height={5} rx={2} fill="#b39552" opacity={p.op} />)}
            </g>
          )}
          {/* inflow */}
          {inflow.map((p, i) => (
            <rect key={i} x={X(p.x)} y={Y(p.y)} width={p.note ? 26 : 8} height={p.note ? 12 : 8} rx={p.note ? 1 : 4} fill={p.note ? '#6b7a69' : '#b39552'} opacity={0.85} transform={`rotate(${p.r * 90 + t * 40 * (p.note ? 1 : 0)} ${X(p.x)} ${Y(p.y)})`} />
          ))}
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 18 * u, top: 14 * u, fontFamily: fonts.mono, fontSize: 11 * u, letterSpacing: 1.5 * u, color: '#5d656d' }}>
        ANIMATIC · {shot.id} · {shot.lens} · {shot.title.toUpperCase()} · PLATE PENDING
      </div>
    </AbsoluteFill>
  );
};
