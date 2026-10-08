import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import film from '../config/film.config';
import { aspectOf } from '../lib/crop';
import { colours, fonts, unit } from '../lib/theme';

// Text is laid out natively per aspect (never cropped from the 16:9 master).
const layout = {
  '16:9': { left: 0.08, top: 0.2, align: 'left' as const, maxW: 0.32 },
  '1:1': { left: 0.08, top: 0.13, align: 'left' as const, maxW: 0.84 },
  '9:16': { left: 0.1, top: 0.16, align: 'left' as const, maxW: 0.8 },
};

export const Supers: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const t = frame / fps;
  const u = unit(W, H);
  const L = layout[aspectOf(W, H)];
  return (
    <AbsoluteFill>
      {film.supers.map((sp) => {
        if (t < sp.start - 0.1 || t > sp.end + 0.1) return null;
        const o = interpolate(t, [sp.start, sp.start + 0.6, sp.end - 0.45, sp.end], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const blur = interpolate(t, [sp.start, sp.start + 0.6], [6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const rise = interpolate(t, [sp.start, sp.start + 0.8], [8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const size = (sp.style === 'understated' ? 30 : 38) * u;
        return (
          <React.Fragment key={sp.id}>
          {/* soft scrim so supers stay legible over bright steel */}
          <div style={{ position: 'absolute', inset: 0, opacity: o * 0.85, background: L.align === 'left' && W > H
            ? 'linear-gradient(90deg, rgba(5,6,7,0.78) 0%, rgba(5,6,7,0.45) 30%, rgba(5,6,7,0) 52%)'
            : 'linear-gradient(180deg, rgba(5,6,7,0.75) 0%, rgba(5,6,7,0.35) 26%, rgba(5,6,7,0) 40%)' }} />
          <div
            style={{
              position: 'absolute', left: W * L.left, top: H * L.top, width: W * L.maxW,
              transform: `translateY(calc(-50% + ${rise * u}px))`, opacity: o, filter: `blur(${blur * u}px)`,
              fontFamily: fonts.sans, fontWeight: sp.style === 'question' ? 500 : 300, fontSize: size,
              lineHeight: 1.25, letterSpacing: `${0.14 * size}px`, color: colours.paper, textAlign: L.align,
              textShadow: `0 0 ${24 * u}px rgba(0,0,0,0.6)`, whiteSpace: 'pre-line',
            }}
          >
            {sp.text}
          </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
