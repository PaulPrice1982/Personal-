import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import film from '../config/film.config';

/** Finishing layer: vignette + fine animated grain. Keep subtle — plates carry the look. */
export const Grade: React.FC<{ grain?: number }> = ({ grain = 0.06 }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  // The light end card carries its own ground; fade the vignette out as it dissolves in.
  const endAt = film.shots[film.shots.length - 1].start;
  const vig = film.brand.endCardTheme === 'light' ? interpolate(frame / fps, [endAt - 0.6, endAt], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ opacity: vig, background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)' }} />
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0, opacity: grain, mixBlendMode: 'overlay' }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={frame % 97} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
