import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import film from '../config/film.config';
import { assets } from '../lib/assets';
import { buildSfx, dbToGain, musicGainAt, sfxBusGainAt, voWindows } from '../lib/audioTimeline';
import { f, fps } from '../lib/timeline';

// Priority: narration > key SFX > music. Music ducks under VO automatically.
// Final loudness normalisation happens after render: scripts/master-audio.sh.
export const Soundtrack: React.FC = () => {
  const music = film.audio.music.overrideFile ? { file: film.audio.music.overrideFile } : assets.music;
  const sfx = buildSfx();
  return (
    <>
      {music && <Audio src={staticFile(music.file)} volume={(fr) => musicGainAt(fr / fps)} />}
      {voWindows().map((v) => {
        const a = assets.vo[v.id];
        if (!a) return null;
        return (
          <Sequence key={v.id} from={f(v.start)} durationInFrames={Math.ceil(a.duration * fps) + 2} layout="none">
            <Audio src={staticFile(a.file)} volume={dbToGain(film.audio.mix.voDb)} />
          </Sequence>
        );
      })}
      {sfx.map((c) => {
        const a = assets.sfx[c.key];
        if (!a) return null;
        const dur = Math.ceil((c.duration ?? a.duration) * fps);
        return (
          <Sequence key={c.id} from={f(c.at)} durationInFrames={dur} layout="none">
            <Audio src={staticFile(a.file)} loop={c.loop} volume={(fr) => dbToGain(c.gainDb) * sfxBusGainAt(c.at + fr / fps)} />
          </Sequence>
        );
      })}
    </>
  );
};
