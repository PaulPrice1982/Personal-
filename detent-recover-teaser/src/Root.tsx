import React from 'react';
import { Composition, Still } from 'remotion';
import film from './config/film.config';
import { Film } from './Film';
import { totalFrames } from './lib/timeline';

export const Root: React.FC = () => (
  <>
    <Composition id="Teaser-16x9" component={Film} durationInFrames={totalFrames} fps={film.output.fps} {...film.output.formats['16:9']} />
    <Composition id="Teaser-1x1" component={Film} durationInFrames={totalFrames} fps={film.output.fps} {...film.output.formats['1:1']} />
    <Composition id="Teaser-9x16" component={Film} durationInFrames={totalFrames} fps={film.output.fps} {...film.output.formats['9:16']} />
    {/* Accessibility master: captions forced on in 16:9 */}
    <Composition id="Teaser-16x9-Captioned" component={Film} durationInFrames={totalFrames} fps={film.output.fps} {...film.output.formats['16:9']} defaultProps={{ captionsOverride: true }} />
    <Still id="Frame" component={Film} {...film.output.formats['16:9']} />
  </>
);
