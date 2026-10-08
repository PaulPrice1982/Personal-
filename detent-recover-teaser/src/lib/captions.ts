import film from '../config/film.config';
import { voWindows } from './audioTimeline';

export interface CaptionCue { text: string; start: number; end: number }

/** Split each narration segment into ≤ maxChars lines, timed proportionally by characters. */
export function captionCues(): CaptionCue[] {
  const max = film.captions.maxCharsPerLine;
  const cues: CaptionCue[] = [];
  for (const w of voWindows()) {
    const words = w.text.split(/\s+/);
    const lines: string[] = [];
    let cur = '';
    for (const word of words) {
      if ((cur + ' ' + word).trim().length > max && cur) { lines.push(cur); cur = word; }
      else cur = (cur + ' ' + word).trim();
    }
    if (cur) lines.push(cur);
    // pair lines into two-line caption blocks
    const blocks: string[] = [];
    for (let i = 0; i < lines.length; i += 2) blocks.push(lines.slice(i, i + 2).join('\n'));
    const total = blocks.reduce((n, b) => n + b.length, 0);
    let t = w.start;
    for (const b of blocks) {
      const d = ((w.end - w.start) * b.length) / total;
      cues.push({ text: b, start: t, end: t + d + 0.25 });
      t += d;
    }
  }
  return cues;
}
