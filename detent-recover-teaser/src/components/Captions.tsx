import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import film from '../config/film.config';
import { captionCues } from '../lib/captions';
import { aspectOf } from '../lib/crop';
import { colours, fonts, unit } from '../lib/theme';

export const Captions: React.FC<{ force?: boolean }> = ({ force }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  if (!force && !film.captions.burnIn[aspectOf(W, H)]) return null;
  const t = frame / fps;
  const u = unit(W, H);
  const cue = captionCues().find((c) => t >= c.start && t < c.end);
  if (!cue) return null;
  const o = interpolate(t, [cue.start, cue.start + 0.12, cue.end - 0.12, cue.end], [0, 1, 1, 0]);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: H * 0.065 }}>
      <div style={{
        opacity: o, maxWidth: W * 0.84, padding: `${8 * u}px ${16 * u}px`, background: 'rgba(5,6,7,0.62)', borderRadius: 4 * u,
        fontFamily: fonts.sans, fontWeight: 400, fontSize: 30 * u, lineHeight: 1.3, color: colours.paper,
        textAlign: 'center', whiteSpace: 'pre-line',
      }}>
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};
