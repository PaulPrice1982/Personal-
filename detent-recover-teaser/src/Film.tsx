import React from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import film from './config/film.config';
import type { Shot } from './config/types';
import { Plate } from './components/Plate';
import { LeakLabels } from './components/LeakLabels';
import { Supers } from './components/Supers';
import { Captions } from './components/Captions';
import { EndCard } from './components/EndCard';
import { Grade } from './components/Grade';
import { Soundtrack } from './components/Soundtrack';
import { f } from './lib/timeline';
import { colours } from './lib/theme';

const DISSOLVE = 0.6; // s

const ShotLayer: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let opacity = 1;
  if (shot.transitionIn === 'fade-from-black') opacity = interpolate(t, [0, 1.6], [0, 1], { extrapolateRight: 'clamp' });
  if (shot.transitionIn === 'dissolve') opacity = interpolate(t, [0, DISSOLVE], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ opacity }}>
      {shot.animatic.endCard ? <EndCard /> : <Plate shot={shot} />}
      {/* Labels are rendered relative to the shot's own clock */}
      {!shot.animatic.endCard && <LeakLabels shot={shot} />}
    </AbsoluteFill>
  );
};

export const Film: React.FC<{ captionsOverride?: boolean; withAudio?: boolean }> = ({ captionsOverride, withAudio = true }) => (
  <AbsoluteFill style={{ background: colours.ink }}>
    {film.shots.map((shot) => {
      // Dissolves overlap the previous shot: the incoming shot starts early and fades in on top.
      const lead = shot.transitionIn === 'dissolve' ? DISSOLVE : 0;
      const shifted = { ...shot, start: shot.start - lead };
      return (
        <Sequence key={shot.id} from={f(shifted.start)} durationInFrames={f(shot.end) - f(shifted.start)} name={`${shot.id} ${shot.title}`}>
          <ShotLayer shot={shifted} />
        </Sequence>
      );
    })}
    <Grade />
    <Supers />
    <Captions force={captionsOverride} />
    {withAudio && <Soundtrack />}
  </AbsoluteFill>
);
