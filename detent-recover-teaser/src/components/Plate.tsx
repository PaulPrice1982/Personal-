import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useVideoConfig } from 'remotion';
import type { Shot } from '../config/types';
import { assets } from '../lib/assets';
import { aspectOf } from '../lib/crop';
import { PlaceholderPlate } from './PlaceholderPlate';

/** Final plate if it exists in public/plates, otherwise the animatic stand-in. */
export const Plate: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { width, height } = useVideoConfig();
  const aspect = aspectOf(width, height);
  // prefer a natively rendered plate for this aspect, else crop the 16:9 master
  const src = assets.plates[`${shot.id}@${aspect}`] ?? assets.plates[shot.id];
  if (!src) return <PlaceholderPlate shot={shot} />;
  const [fx, fy] = assets.plates[`${shot.id}@${aspect}`] ? [0.5, 0.5] : shot.focal[aspect];
  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={staticFile(src)}
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${fx * 100}% ${fy * 100}%` }}
      />
    </AbsoluteFill>
  );
};
