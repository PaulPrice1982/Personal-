// Shared types for the film configuration. Content lives in film.config.ts;
// scene logic only ever reads from these shapes.

export type AspectKey = '16:9' | '1:1' | '9:16';
export type Point = [x: number, y: number]; // normalised 0..1 in 16:9 plate space

export type LeakTier = 'primary' | 'secondary';
export type LeakForm = 'note' | 'coins' | 'mixed' | 'trapped-note';

export interface LeakCategory {
  id: string;
  label: string; // EXACT terminology — QC checks this against the canonical list
  tier: LeakTier;
  form: LeakForm;
  showOnScreen: boolean;
}

/** A physical hole tied to one leak category. */
export interface LeakEvent {
  kind: 'leak';
  id: string; // anchor key used in shots
  leak: string; // LeakCategory.id
  opensAt: number; // s — hole appears, money starts escaping
  labelAt: number; // s — annotation appears
  sealsAt: number; // s — Detent Recover closes it
  /** position on the hero bucket in the wide master framing (plate space) */
  pos: Point;
}

/** A hole whose annotation cycles through several secondary categories. */
export interface RotationSlot {
  kind: 'rotation';
  id: string;
  cycle: string[]; // LeakCategory ids
  cycleEvery: number; // s per label
  opensAt: number;
  labelAt: number;
  sealsAt: number;
  pos: Point;
}

export type HoleEvent = LeakEvent | RotationSlot;

export interface Shot {
  id: string;
  scene: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  start: number;
  end: number;
  title: string;
  lens: string;
  camera: string;
  action: string;
  plate: string; // path under public/, e.g. plates/S01.mp4
  /** object-position focal point of the 16:9 plate when cropped to each aspect */
  focal: Record<AspectKey, Point>;
  /** hole ids visible (and labelled) in this shot */
  visible: string[];
  /** explicit plate-space anchors. If omitted, derived from the animatic framing.
   *  Superseded at render time by tracks/<shot>.json exported from the 3D scene. */
  anchors?: Record<string, Point>;
  /** animatic only: how the placeholder bucket is framed */
  animatic: { zoom: number; cx: number; cy: number; topDown?: boolean; endCard?: boolean };
  transitionIn?: 'cut' | 'fade-from-black' | 'dissolve';
}

export interface Super {
  id: string;
  text: string;
  start: number;
  end: number;
  style: 'statement' | 'question' | 'understated';
}

export interface VoSegment {
  id: string;
  text: string;
  start: number; // s on the film timeline
  /** latest acceptable end — QC fails if the generated take overruns */
  mustEndBy: number;
  enabled: boolean;
  note?: string;
}

export interface SfxCue {
  id: string;
  file: string; // key in sfxLibrary
  at: number;
  gainDb: number;
  /** optional — trims playback */
  duration?: number;
  loop?: boolean;
}

export interface SfxLibraryItem {
  prompt: string;
  durationSeconds: number;
  loop?: boolean;
  promptInfluence?: number;
}

export interface MusicSection {
  name: string;
  start: number;
  end: number;
  positive: string[];
  negative: string[];
}
