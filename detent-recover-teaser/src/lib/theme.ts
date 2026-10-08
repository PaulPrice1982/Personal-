import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import film from '../config/film.config';

// Fonts are local files (public/brand/fonts) so renders never depend on the network.
for (const f of [film.brand.font, film.brand.monoFont]) {
  for (const [weight, file] of Object.entries(f.files)) {
    loadFont({ family: f.family, url: staticFile(file), weight, format: 'woff2' });
  }
}

export const fonts = {
  sans: `"${film.brand.font.family}", system-ui, sans-serif`,
  mono: `"${film.brand.monoFont.family}", ui-monospace, monospace`,
};
export const colours = film.brand.colours;

/** Resolution-independent unit: 1u = 1px at 1080 on the short edge. */
export const unit = (w: number, h: number) => Math.min(w, h) / 1080;
