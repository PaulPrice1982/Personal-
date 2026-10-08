// Corner readout of detected leakage. Each primary leak appears as it opens and
// flips to SEALED when Detent Recover closes it; secondary categories cycle on
// one "also detected" line so the list never exceeds eight rows.
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import film from '../config/film.config';
import type { HoleEvent, RotationSlot } from '../config/types';
import { aspectOf } from '../lib/crop';
import { category, formatLabel, holeCategory, SEALED_HOLD } from '../lib/timeline';
import { colours, fonts, unit } from '../lib/theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const Ledger: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const t = frame / fps;
  const u = unit(W, H);
  const L = film.ledger.layout[aspectOf(W, H)];

  const primaries = film.holes
    .filter((h): h is Extract<HoleEvent, { kind: 'leak' }> => h.kind === 'leak' && category(h.leak).showOnScreen)
    .sort((a, b) => a.labelAt - b.labelAt);
  const rotations = film.holes.filter((h): h is RotationSlot => h.kind === 'rotation');
  const first = primaries[0]?.labelAt ?? 0;
  const end = film.finalSealAt + SEALED_HOLD + 0.6;
  if (t < first - 0.2 || t > end + 0.6) return null;

  const panel = interpolate(t, [first - 0.2, first + 0.3, end, end + 0.6], [0, 1, 1, 0], clamp);
  const rowH = 30 * u;
  const allSealed = t >= film.finalSealAt;

  // secondary ticker: the active rotation slot that most recently started labelling
  const activeRot = rotations.filter((r) => t >= r.labelAt).sort((a, b) => b.labelAt - a.labelAt)[0];
  const rotLabel = activeRot ? formatLabel(holeCategory(activeRot, t).label) : null;
  const rotPhase = activeRot && t < activeRot.sealsAt ? ((t - activeRot.labelAt) % activeRot.cycleEvery) / activeRot.cycleEvery : 0.5;
  const rotOpacity = interpolate(rotPhase, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ opacity: panel }}>
      <div style={{ position: 'absolute', left: W * L.left, top: H * L.top, width: W * L.width, fontFamily: fonts.mono }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5 * u, letterSpacing: 3 * u, color: allSealed ? colours.sealed : colours.muted, borderBottom: `${1 * u}px solid rgba(233,236,239,0.18)`, paddingBottom: 8 * u, marginBottom: 10 * u }}>
          <span>{allSealed ? 'ALL LEAKS SEALED' : film.ledger.title}</span>
          <span>{String(primaries.filter((h) => t >= h.labelAt).length).padStart(2, '0')}</span>
        </div>
        {primaries.map((h) => {
          const inK = interpolate(t, [h.labelAt, h.labelAt + 0.5], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          if (inK <= 0) return null;
          const sealed = t >= h.sealsAt;
          const sealK = interpolate(t, [h.sealsAt, h.sealsAt + 0.3], [0, 1], clamp);
          const col = sealed ? colours.sealed : colours.leak;
          const pulse = sealed ? 1 : 0.55 + 0.45 * (Math.sin(t * 5 + h.labelAt) + 1) / 2;
          return (
            <div key={h.id} style={{ height: rowH, display: 'flex', alignItems: 'center', gap: 12 * u, opacity: inK, transform: `translateX(${(1 - inK) * 14 * u}px)` }}>
              <span style={{ width: 7 * u, height: 7 * u, borderRadius: sealed ? 1 * u : 7 * u, background: col, opacity: pulse, flex: 'none' }} />
              <span style={{ flex: 1, fontSize: 13.5 * u, fontWeight: 500, letterSpacing: 2 * u, color: colours.paper, opacity: 1 - 0.35 * sealK, whiteSpace: 'nowrap' }}>
                {formatLabel(category(h.leak).label)}
              </span>
              <span style={{ fontSize: 9.5 * u, letterSpacing: 2.4 * u, color: col }}>{sealed ? 'SEALED' : 'LEAKING'}</span>
            </div>
          );
        })}
        {rotLabel && (
          <div style={{ marginTop: 8 * u, fontSize: 9.5 * u, letterSpacing: 2.4 * u, color: colours.muted, whiteSpace: 'nowrap' }}>
            {film.ledger.secondaryPrefix}&nbsp;&nbsp;<span style={{ color: colours.paper, opacity: allSealed ? 0.5 : rotOpacity }}>{allSealed ? 'SEALED' : rotLabel}</span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
