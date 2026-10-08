// Typed view of src/generated/assets.json, written by `npm run scan`.
// The Remotion bundle can't stat files, so the scan step tells scenes what exists.
import manifest from '../generated/assets.json';
import type { Point } from '../config/types';

export interface AudioAsset { file: string; duration: number }
export interface Manifest {
  generatedAt: string | null;
  plates: Record<string, string>; // shotId -> public path
  vo: Record<string, AudioAsset>;
  music: AudioAsset | null;
  sfx: Record<string, AudioAsset>;
  /** shotId -> holeId -> per-frame plate-space positions (frame index local to the shot) */
  tracks: Record<string, Record<string, Point[]>>;
  brand: Record<string, string>;
}

export const assets = manifest as unknown as Manifest;
