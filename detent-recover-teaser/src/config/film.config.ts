// =============================================================================
// DETENT RECOVER — "THE LEAKY BUCKET"
// Single source of truth for the film. Change copy, timings, leaks, audio and
// branding here; scene components never hard-code content.
// All times are in seconds on the master timeline.
// =============================================================================
import type {
  AspectKey,
  HoleEvent,
  LeakCategory,
  MusicSection,
  SfxCue,
  SfxLibraryItem,
  Shot,
  Super,
  VoSegment,
} from './types';

// Works in Node scripts and is undefined-safe inside the Remotion browser bundle.
const env = (k: string): string | undefined =>
  typeof process !== 'undefined' && process.env ? process.env[k] || undefined : undefined;

// -----------------------------------------------------------------------------
// OUTPUT
// -----------------------------------------------------------------------------
export const output = {
  fps: 24,
  durationSeconds: 60,
  // Master is 4K UHD. Previews render with --scale=0.5 (1080p).
  formats: {
    '16:9': { width: 3840, height: 2160 },
    '1:1': { width: 2160, height: 2160 },
    '9:16': { width: 2160, height: 3840 },
  } satisfies Record<AspectKey, { width: number; height: number }>,
  /** Title-safe inset as a fraction of each dimension (EBU R95 ≈ 5–10%). */
  titleSafe: { x: 0.08, y: 0.08 },
  /** Bottom band kept clear of leak labels so captions never collide. */
  captionBand: 0.16,
};

// -----------------------------------------------------------------------------
// BRAND — placeholders until supplied assets arrive. Nothing here is a final asset.
// -----------------------------------------------------------------------------
export const brand = {
  productName: 'DETENT RECOVER',
  parentName: 'DETENT',
  /** SVG/PNG under public/brand/. null = typographic placeholder wordmark. */
  detentLogo: null as string | null,
  recoverLogo: null as string | null,
  /** Placeholder fonts (OFL) bundled locally. Swap for Detent brand font files in public/brand/fonts. */
  font: {
    family: 'Detent Sans',
    files: { '300': 'brand/fonts/inter-tight-latin-300-normal.woff2', '400': 'brand/fonts/inter-tight-latin-400-normal.woff2', '500': 'brand/fonts/inter-tight-latin-500-normal.woff2', '600': 'brand/fonts/inter-tight-latin-600-normal.woff2' } as Record<string, string>,
  },
  monoFont: {
    family: 'Detent Mono',
    files: { '400': 'brand/fonts/ibm-plex-mono-latin-400-normal.woff2', '500': 'brand/fonts/ibm-plex-mono-latin-500-normal.woff2' } as Record<string, string>,
  },
  colours: {
    ink: '#050607',
    paper: '#E9ECEF',
    muted: '#8B939C',
    leak: '#D9A441', // restrained amber — "value escaping"
    sealed: '#BFE3F2', // cool precision white-blue — Detent Recover
    accent: '#6FC3E8', // illuminated detailing on the band
  },
  websiteUrl: '{{WEBSITE_URL}}',
  registrationUrl: '{{REGISTRATION_URL}}', // e.g. detent.ai/recover — NOT invented; supply it
  cta: 'REGISTER YOUR INTEREST',
  legalFooter: '' as string, // e.g. '© 2026 Detent Ltd. All rights reserved.'
};

// -----------------------------------------------------------------------------
// LEAKAGE CATEGORIES — exact terminology. Order = canonical list in the brief.
// -----------------------------------------------------------------------------
export const leakCategories: LeakCategory[] = [
  { id: 'additional-users', label: 'Additional Users', tier: 'primary', form: 'note', showOnScreen: true },
  { id: 'additional-companies', label: 'Additional Companies', tier: 'primary', form: 'coins', showOnScreen: true },
  { id: 'non-group-entities', label: 'Non-Group Entities', tier: 'primary', form: 'mixed', showOnScreen: true },
  { id: 'additional-storage', label: 'Additional Storage', tier: 'primary', form: 'coins', showOnScreen: true },
  { id: 'additional-sites', label: 'Additional Sites', tier: 'primary', form: 'note', showOnScreen: true },
  { id: 'mergers-acquisitions', label: 'Mergers & Acquisitions', tier: 'primary', form: 'trapped-note', showOnScreen: true },
  { id: 'insolvency', label: 'Insolvency', tier: 'secondary', form: 'coins', showOnScreen: true },
  { id: 'additional-tokens', label: 'Additional Tokens', tier: 'secondary', form: 'coins', showOnScreen: true },
  { id: 'additional-beds', label: 'Additional Beds', tier: 'secondary', form: 'coins', showOnScreen: true },
  { id: 'additional-persons', label: 'Additional Persons', tier: 'secondary', form: 'coins', showOnScreen: true },
  { id: 'additional-payslips', label: 'Additional Payslips', tier: 'secondary', form: 'coins', showOnScreen: true },
  { id: 'additional-databases', label: 'Additional Databases', tier: 'secondary', form: 'coins', showOnScreen: true },
  { id: 'additional-instances', label: 'Additional Instances', tier: 'secondary', form: 'coins', showOnScreen: true },
  { id: 'additional-documents', label: 'Additional Documents', tier: 'secondary', form: 'coins', showOnScreen: true },
  { id: 'missed-billing', label: 'Missed Billing', tier: 'primary', form: 'note', showOnScreen: true },
  { id: 'additional-content', label: 'Additional Content', tier: 'secondary', form: 'coins', showOnScreen: true },
  { id: 'early-terminations', label: 'Early Terminations', tier: 'secondary', form: 'coins', showOnScreen: true },
  { id: 'contract-equity', label: 'Contract Equity', tier: 'primary', form: 'mixed', showOnScreen: true },
  // GRR is a metric (gross revenue retention), not a leak source. Kept per brief;
  // hidden by default; flip to true to show — see docs/PRODUCTION_PLAN.md §9.
  { id: 'grr', label: 'GRR', tier: 'secondary', form: 'coins', showOnScreen: false },
];

/**
 * 'anchored' = annotations pinned to holes (needs tracks/ from a CG scene).
 * 'ledger'   = a restrained corner readout that lists each leak as it opens and
 *              flips it to SEALED. Used with generated plates, which can't be tracked.
 */
export const labelMode = 'ledger' as 'anchored' | 'ledger';
export const ledger = {
  title: 'LEAKAGE DETECTED',
  secondaryPrefix: 'ALSO DETECTED',
  layout: {
    '16:9': { left: 0.705, top: 0.15, width: 0.24 },
    '1:1': { left: 0.56, top: 0.3, width: 0.38 },
    '9:16': { left: 0.1, top: 0.63, width: 0.8 },
  } satisfies Record<AspectKey, { left: number; top: number; width: number }>,
};

/** Labels render uppercase with tracking; the source label stays exact. */
export const labelCase: 'upper' | 'as-written' = 'upper';
export const maxConcurrentLabels = 8;

// -----------------------------------------------------------------------------
// HOLES — physical leak points on the hero bucket. pos = wide master framing.
// Primary seal order follows the brief: Users → Companies → Missed Billing → Contract Equity → rest.
// -----------------------------------------------------------------------------
export const holes: HoleEvent[] = [
  { kind: 'leak', id: 'H-users', leak: 'additional-users', opensAt: 8.0, labelAt: 8.7, sealsAt: 41.5, pos: [0.445, 0.47] },
  { kind: 'leak', id: 'H-companies', leak: 'additional-companies', opensAt: 10.3, labelAt: 10.8, sealsAt: 42.2, pos: [0.565, 0.62] },
  { kind: 'leak', id: 'H-storage', leak: 'additional-storage', opensAt: 12.7, labelAt: 13.1, sealsAt: 44.2, pos: [0.585, 0.37] },
  { kind: 'leak', id: 'H-nongroup', leak: 'non-group-entities', opensAt: 15.5, labelAt: 15.9, sealsAt: 44.7, pos: [0.405, 0.64] },
  { kind: 'leak', id: 'H-ma', leak: 'mergers-acquisitions', opensAt: 16.5, labelAt: 16.9, sealsAt: 45.2, pos: [0.515, 0.72] },
  { kind: 'leak', id: 'H-sites', leak: 'additional-sites', opensAt: 17.5, labelAt: 17.9, sealsAt: 45.6, pos: [0.495, 0.56] },
  { kind: 'leak', id: 'H-billing', leak: 'missed-billing', opensAt: 18.5, labelAt: 18.9, sealsAt: 42.9, pos: [0.61, 0.5] },
  { kind: 'leak', id: 'H-equity', leak: 'contract-equity', opensAt: 21.2, labelAt: 21.6, sealsAt: 43.5, pos: [0.415, 0.36] },
  {
    kind: 'rotation', id: 'R1', opensAt: 22.2, labelAt: 22.6, sealsAt: 45.85, cycleEvery: 1.3, pos: [0.535, 0.43],
    cycle: ['additional-tokens', 'additional-instances', 'additional-databases', 'early-terminations', 'additional-documents', 'additional-content', 'grr'],
  },
  {
    kind: 'rotation', id: 'R2', opensAt: 25.0, labelAt: 25.4, sealsAt: 46.0, cycleEvery: 1.3, pos: [0.455, 0.73],
    cycle: ['additional-payslips', 'additional-beds', 'additional-persons', 'insolvency'],
  },
];

/** The last seal — triggers the soundscape drop and the deep lock SFX. */
export const finalSealAt = 46.0;

// -----------------------------------------------------------------------------
// SHOT LIST — see docs/SHOT_LIST.md (generated by `npm run docs`).
// focal: where the 16:9 plate is anchored when cropped for 1:1 / 9:16.
// -----------------------------------------------------------------------------
const C: Record<AspectKey, [number, number]> = { '16:9': [0.5, 0.5], '1:1': [0.5, 0.5], '9:16': [0.5, 0.5] };

export const shots: Shot[] = [
  // SCENE 1 — EVERYTHING LOOKS HEALTHY
  {
    id: 'S01', scene: 1, start: 0, end: 3.5, transitionIn: 'fade-from-black',
    title: 'Reveal', lens: '35mm', camera: 'Slow push-in, 5cm/s on slider, 0.5° tilt down',
    action: 'Black. A single overhead softbox fades up on a brushed-steel bucket on a dark concrete plinth. Haze catches the light cone. First coins begin to fall at 2.0s.',
    plate: 'plates/S01.mp4', focal: C, visible: [], animatic: { zoom: 0.85, cx: 0.5, cy: 0.52 },
  },
  {
    id: 'S02', scene: 1, start: 3.5, end: 7.0,
    title: 'Revenue flowing', lens: '50mm', camera: 'Low 3/4, locked-off, 48fps conformed to 24 (half speed)',
    action: '£20 and £50 notes flutter and £1/£2 coins drop into the bucket; specular hits on the rim. Steady, healthy flow.',
    plate: 'plates/S02.mp4', focal: C, visible: [], animatic: { zoom: 1.15, cx: 0.5, cy: 0.42 },
  },
  // SCENE 2 — THE FIRST LEAK
  {
    id: 'S03', scene: 2, start: 7.0, end: 10.0,
    title: 'First leak — macro', lens: '100mm macro', camera: 'Slow lateral track, rack focus from rim to side wall',
    action: 'A hairline seam parts in the side wall. The corner of a £20 note pushes through, catches, then slips free and falls out of frame.',
    plate: 'plates/S03.mp4', focal: { '16:9': [0.5, 0.5], '1:1': [0.45, 0.5], '9:16': [0.42, 0.5] },
    visible: ['H-users'], animatic: { zoom: 3.0, cx: 0.47, cy: 0.5 },
  },
  {
    id: 'S04', scene: 2, start: 10.0, end: 12.5,
    title: 'Second leak — coins', lens: '100mm macro', camera: 'Continue track down and right',
    action: 'A second, smaller opening lower on the wall. Coins escape one at a time, ringing off the steel lip.',
    plate: 'plates/S04.mp4', focal: { '16:9': [0.5, 0.5], '1:1': [0.55, 0.5], '9:16': [0.58, 0.5] },
    visible: ['H-users', 'H-companies'], animatic: { zoom: 2.3, cx: 0.51, cy: 0.55 },
  },
  {
    id: 'S05', scene: 2, start: 12.5, end: 15.0,
    title: 'Third leak — rim seam', lens: '85mm', camera: 'Tilt up toward the rim',
    action: 'Near the rim a riveted seam has lifted. A small cluster of coins tumbles out together.',
    plate: 'plates/S05.mp4', focal: { '16:9': [0.5, 0.5], '1:1': [0.55, 0.45], '9:16': [0.56, 0.45] },
    visible: ['H-users', 'H-companies', 'H-storage'], animatic: { zoom: 1.7, cx: 0.52, cy: 0.48 },
  },
  // SCENE 3 — THE SCALE OF THE PROBLEM
  {
    id: 'S06', scene: 3, start: 15.0, end: 21.0,
    title: 'Pull back — scale reveal', lens: '50mm → 35mm', camera: 'Slow dolly back + crane up 30cm',
    action: 'The frame widens: leaks on every face of the bucket. Notes slip through larger openings, coins from smaller ones. Money still pours in from above.',
    plate: 'plates/S06.mp4', focal: C,
    visible: ['H-users', 'H-companies', 'H-storage', 'H-nongroup', 'H-ma', 'H-sites', 'H-billing'],
    animatic: { zoom: 1.05, cx: 0.5, cy: 0.52 },
  },
  {
    id: 'S07', scene: 3, start: 21.0, end: 25.0,
    title: 'Orbit — trapped note', lens: '50mm', camera: '90° orbit left on track, constant speed',
    action: 'A £50 note is caught half-through a slit, flutters, then tears free. New openings appear on the far side.',
    plate: 'plates/S07.mp4', focal: C,
    visible: ['H-users', 'H-companies', 'H-billing', 'H-equity', 'H-ma', 'R1'],
    animatic: { zoom: 1.25, cx: 0.5, cy: 0.5 },
  },
  {
    id: 'S08', scene: 3, start: 25.0, end: 30.0,
    title: 'Everywhere at once', lens: '35mm', camera: 'Continue orbit, slight push',
    action: 'Steady escape from many points at once — never chaotic. The bucket still looks full from above.',
    plate: 'plates/S08.mp4', focal: C,
    visible: ['H-storage', 'H-nongroup', 'H-sites', 'H-equity', 'R1', 'R2'],
    animatic: { zoom: 1.1, cx: 0.5, cy: 0.54 },
  },
  // SCENE 4 — THE REALISATION
  {
    id: 'S09', scene: 4, start: 30.0, end: 34.0,
    title: 'Floor track — what escaped', lens: '35mm, 2cm off the floor', camera: 'Low slider track left→right, focus pull through the money',
    action: 'A drift of escaped notes and coins across dark concrete. Meaningful, not absurd. A coin rolls into frame and settles.',
    plate: 'plates/S09.mp4', focal: C, visible: [], animatic: { zoom: 1.0, cx: 0.5, cy: 0.85 },
  },
  {
    id: 'S10', scene: 4, start: 34.0, end: 38.0,
    title: 'Overhead — in vs out', lens: '24mm', camera: 'Top-down, very slow rise',
    action: 'Money enters at the centre, escapes from all sides, and a ring of lost value has gathered on the floor around the bucket.',
    plate: 'plates/S10.mp4', focal: C,
    visible: ['H-users', 'H-companies', 'H-storage', 'H-nongroup', 'H-ma', 'H-sites', 'H-billing', 'H-equity'],
    animatic: { zoom: 1.0, cx: 0.5, cy: 0.5, topDown: true },
  },
  // SCENE 5 — DETENT RECOVER
  {
    id: 'S11', scene: 5, start: 38.0, end: 41.0, transitionIn: 'cut',
    title: 'Arrival', lens: '100mm macro', camera: 'Slow lateral glide following the band',
    action: 'Key light cools. A precision-machined band — dark anodised alloy with a hairline illuminated channel and engraved DETENT RECOVER — slides into frame and wraps the bucket.',
    plate: 'plates/S11.mp4', focal: C, visible: [], animatic: { zoom: 2.4, cx: 0.5, cy: 0.5 },
  },
  {
    id: 'S12', scene: 5, start: 41.0, end: 43.8,
    title: 'Seal pass I', lens: '65mm', camera: 'Orbit right, matching the band’s travel',
    action: 'The band travels across each opening; segments click into place and the flow stops dead at each: Users, Companies, Missed Billing, Contract Equity.',
    plate: 'plates/S12.mp4', focal: C,
    visible: ['H-users', 'H-companies', 'H-billing', 'H-equity'],
    animatic: { zoom: 1.45, cx: 0.51, cy: 0.47 },
  },
  {
    id: 'S13', scene: 5, start: 43.8, end: 46.2,
    title: 'Seal pass II', lens: '50mm', camera: 'Continue orbit, pull back slightly',
    action: 'The remaining openings seal in quick succession. On the final seal, everything goes still.',
    plate: 'plates/S13.mp4', focal: C,
    visible: ['H-storage', 'H-nongroup', 'H-ma', 'H-sites', 'R1', 'R2'],
    animatic: { zoom: 1.2, cx: 0.5, cy: 0.54 },
  },
  {
    id: 'S14', scene: 5, start: 46.2, end: 48.0,
    title: 'Sealed', lens: '35mm', camera: 'Locked-off wide',
    action: 'Wide: money still falls in from above. Nothing escapes. Silence except the coins landing inside.',
    plate: 'plates/S14.mp4', focal: C, visible: [], animatic: { zoom: 1.0, cx: 0.5, cy: 0.52 },
  },
  // SCENE 6 — THE MONEY SHOT
  {
    id: 'S15', scene: 6, start: 48.0, end: 51.5,
    title: 'Money shot — the note that stays', lens: '100mm macro, internal view', camera: 'Locked-off, 96fps conformed to 24',
    action: 'Inside the bucket wall: a £20 note slides toward a former leak, presses against the sealed band, cannot pass, and falls back into the bucket. Hold 0.8s.',
    plate: 'plates/S15.mp4', focal: { '16:9': [0.5, 0.5], '1:1': [0.5, 0.5], '9:16': [0.5, 0.5] },
    visible: [], animatic: { zoom: 3.2, cx: 0.445, cy: 0.47 },
  },
  {
    id: 'S16', scene: 6, start: 51.5, end: 53.0,
    title: 'Retained', lens: '50mm', camera: 'Slow push, light warms 300K',
    action: 'Hero three-quarter: the bucket retaining everything. Fade down.',
    plate: 'plates/S16.mp4', focal: C, visible: [], animatic: { zoom: 1.1, cx: 0.5, cy: 0.5 },
  },
  // SCENE 7 — END REVEAL
  {
    id: 'S17', scene: 7, start: 53.0, end: 60.0, transitionIn: 'dissolve',
    title: 'End card', lens: '—', camera: 'Typographic / brand',
    action: 'Premium dark field, faint echo of the band’s illuminated channel. Brand, line, Coming Soon, CTA.',
    plate: 'plates/S17.mp4', focal: C, visible: [], animatic: { zoom: 1, cx: 0.5, cy: 0.5, endCard: true },
  },
];

// -----------------------------------------------------------------------------
// ON-SCREEN COPY
// -----------------------------------------------------------------------------
export const supers: Super[] = [
  { id: 'T1', text: 'YOUR CUSTOMERS ARE GROWING.', start: 1.6, end: 4.6, style: 'statement' },
  { id: 'T2', text: 'IS YOUR REVENUE GROWING WITH THEM?', start: 4.9, end: 7.2, style: 'question' },
  { id: 'T3', text: 'REVENUE YOU SHOULD ALREADY BE COLLECTING.', start: 31.4, end: 34.6, style: 'understated' },
];

export const endCard = {
  wordmarkAt: 53.4,
  lineAt: 55.0,
  lines: ['STOP THE LEAK.', 'RECOVER THE REVENUE.'],
  comingSoonAt: 57.0,
  comingSoon: 'COMING SOON',
  ctaAt: 58.0,
};

// -----------------------------------------------------------------------------
// NARRATION — one segment per file, regenerated individually.
// mustEndBy is enforced by `npm run qc` against the generated take's duration.
// -----------------------------------------------------------------------------
export const narration: VoSegment[] = [
  { id: 'VO_01_OPENING', start: 2.0, mustEndBy: 4.8, enabled: true, text: 'Your customers grow.' },
  {
    id: 'VO_02_LEAKAGE', start: 7.6, mustEndBy: 15.2, enabled: true,
    text: 'They add users, entities, locations, services and consumption. But contracts and billing don’t always keep up.',
  },
  {
    id: 'VO_03_SCALE', start: 16.4, mustEndBy: 23.4, enabled: true,
    text: 'And when what customers use no longer matches what they pay for… revenue leaks.',
  },
  { id: 'VO_03B_HIDDEN', start: 24.4, mustEndBy: 28.0, enabled: true, text: 'Often hidden inside the customers you already have.' },
  // 28–38s is deliberately unscored by voice: the realisation needs to land in silence.
  {
    id: 'VO_04_RECOVER', start: 38.6, mustEndBy: 47.8, enabled: true,
    text: 'Detent Recover identifies the leakage, quantifies it, and gives your teams the workflows to recover it — with the customer relationship intact.',
    note: 'Tightened from the brief to protect the money-shot silence (48–51.5s). Original kept below, disabled.',
  },
  {
    id: 'VO_04_RECOVER_LONG', start: 38.6, mustEndBy: 47.8, enabled: false,
    text: 'Detent Recover identifies that leakage, quantifies the commercial opportunity, and gives your teams the workflows and tools to recover it — commercially, consistently, and with the customer relationship in mind.',
    note: 'Brief original. ~14s at a calm read — overruns into the money shot. Enable only if the film is extended to ~66s.',
  },
  {
    id: 'VO_04B_TURNING', start: 47.0, mustEndBy: 49.6, enabled: false,
    text: 'Turning hidden leakage into recoverable revenue.',
    note: 'Disabled: duplicates the end line and steps on the money shot.',
  },
  { id: 'VO_05A_BRAND', start: 53.4, mustEndBy: 54.8, enabled: true, text: 'Detent Recover.' },
  { id: 'VO_05B_LINE', start: 54.9, mustEndBy: 58.1, enabled: true, text: 'Stop the leak. Recover the revenue.' },
  { id: 'VO_05C_CTA', start: 58.2, mustEndBy: 59.95, enabled: true, text: 'Register your interest.' },
];

// -----------------------------------------------------------------------------
// CAPTIONS (burned in). Built from enabled narration. Off by default for the
// master; on for the social cut-downs where autoplay is muted.
// -----------------------------------------------------------------------------
export const captions = {
  burnIn: { '16:9': false, '1:1': true, '9:16': true } satisfies Record<AspectKey, boolean>,
  /** used when no generated VO exists yet, so captions still time correctly */
  fallbackWordsPerSecond: 2.5,
  maxCharsPerLine: 42,
};

// -----------------------------------------------------------------------------
// AUDIO — ElevenLabs settings. Env vars in .env override these.
// -----------------------------------------------------------------------------
export const audio = {
  voice: {
    // Shortlist from the ElevenLabs library (British, male, 35–50, documentary/corporate).
    // Not locked: audition all three with `npm run vo:audition` and set voiceId.
    voiceId: env('ELEVENLABS_VOICE_ID') ?? 'tXxkePQsw0G69D8VeDzp', // "Jim Executive" — calm C-suite baritone
    shortlist: [
      { id: 'tXxkePQsw0G69D8VeDzp', name: 'Jim Executive — authoritative, warm baritone' },
      { id: 'v1Oa3bMmaLK6LwTzVkOy', name: 'Peter — ex-BBC News presenter, neutral RP' },
      { id: 'tw43HEeA0n5kOjSqCFT9', name: 'Alex Bennett — calm southern UK, mid-30s/40s' },
      { id: 'jhBzyKbsdeM6F66SZCaK', name: 'Sterling — deep, resonant, cinematic' },
    ],
    modelId: env('ELEVENLABS_TTS_MODEL') ?? 'eleven_multilingual_v2',
    outputFormat: env('ELEVENLABS_OUTPUT_FORMAT') ?? 'mp3_44100_192',
    settings: { stability: 0.62, similarityBoost: 0.8, style: 0.12, useSpeakerBoost: true, speed: 0.94 },
    seed: 4127,
    /** pass neighbouring lines as context so separately generated segments sound like one read */
    useContinuityContext: true,
  },
  music: {
    modelId: env('ELEVENLABS_MUSIC_MODEL') ?? 'music_v2_5',
    /** drop a licensed track here to bypass generation entirely */
    overrideFile: null as string | null,
    file: 'audio/music/score.mp3',
    globalPositive: [
      'minimal cinematic score', 'premium technology commercial', 'instrumental', 'felt piano',
      'low sustained strings', 'soft analogue synth pulse', 'restrained', 'precise', 'spacious reverb',
    ],
    globalNegative: [
      'vocals', 'choir', 'EDM', 'epic trailer drums', 'taiko', 'ukulele', 'uplifting corporate',
      'bass drop', 'brass fanfare', 'guitar', 'lo-fi', 'hip hop beat',
    ],
    sections: [
      { name: 'Air', start: 0, end: 7, positive: ['near silence', 'single sustained low tone', 'sparse felt piano notes', 'mysterious'], negative: ['rhythm', 'drums'] },
      { name: 'Seep', start: 7, end: 15, positive: ['quiet low pulse at 70 bpm emerges', 'subtle unease', 'minor key'], negative: ['drums', 'melody'] },
      { name: 'Spread', start: 15, end: 30, positive: ['pulse intensifies', 'string ostinato', 'growing low end', 'tension builds steadily'], negative: ['drum kit', 'climax'] },
      { name: 'Weight', start: 30, end: 38, positive: ['maximum tension', 'sustained dissonant string cluster', 'deep sub swell', 'abrupt cut to silence at the end'], negative: ['drums', 'resolution'] },
      { name: 'Control', start: 38, end: 46, positive: ['precise ticking pulse', 'harmony shifts towards major', 'confident', 'clean synth arpeggio', 'controlled'], negative: ['drums', 'epic'] },
      { name: 'Retain', start: 46, end: 53, positive: ['near silence then a single warm resolving chord blooms', 'calm', 'resolved'], negative: ['rhythm'] },
      { name: 'Sting', start: 53, end: 60, positive: ['restrained sonic logo', 'single resonant tone with soft shimmer', 'elegant finish', 'decays to silence'], negative: ['fanfare', 'drums'] },
    ] satisfies MusicSection[],
  },
  mix: {
    /** level of the generated plates' own sound (coins, paper, room) */
    plateAudioDb: -9,
    voDb: 0,
    musicDb: -14,
    /** extra music attenuation while narration plays */
    duckDb: -9,
    duckAttack: 0.25,
    duckRelease: 0.6,
    sfxMasterDb: -6,
    /** the "silence" after the final seal */
    finalSealDipDb: -16,
    finalSealDipDuration: 1.6,
    targetLufs: -14, // web/social. Use -23 for UK broadcast (EBU R128 / Clearcast).
    truePeakDb: -1,
  },
};

// SFX — generated with ElevenLabs Sound Effects; each library item is a file.
export const sfxLibrary: Record<string, SfxLibraryItem> = {
  room_tone: { prompt: 'Quiet large empty photography studio room tone, very subtle air, no hum', durationSeconds: 22, loop: true },
  metal_resonance: { prompt: 'Very soft low resonance of a large brushed steel bucket, gentle metallic hum, cinematic', durationSeconds: 8 },
  coin_into_bucket_a: { prompt: 'Single pound coin dropping into a heavy steel bucket half full of coins, realistic, close mic', durationSeconds: 1.5 },
  coin_into_bucket_b: { prompt: 'Several coins landing in a steel bucket full of banknotes and coins, realistic', durationSeconds: 2 },
  notes_flutter: { prompt: 'Soft flutter of paper banknotes falling through air, gentle, close', durationSeconds: 3 },
  note_slip_through: { prompt: 'Polymer banknote sliding slowly through a narrow metal slit, subtle friction, then a soft release', durationSeconds: 2 },
  coin_escape_floor: { prompt: 'Single coin falling a short distance onto a concrete floor, small ring and roll', durationSeconds: 2 },
  coins_cluster_floor: { prompt: 'Small cluster of coins spilling onto concrete floor, realistic, restrained', durationSeconds: 2.5 },
  note_land_floor: { prompt: 'Banknote landing softly on a concrete floor, quiet paper touch', durationSeconds: 1.2 },
  recover_arrival: { prompt: 'Precision engineered mechanism gliding into place, smooth servo and magnetic hum, premium product sound, subtle', durationSeconds: 3 },
  seal_click: { prompt: 'Short precise mechanical lock click, machined metal, satisfying, not cartoon, tight', durationSeconds: 0.6 },
  final_seal: { prompt: 'Deep solid precision lock engaging, heavy machined metal, low thud with fine click, premium', durationSeconds: 1.5 },
  note_press_sealed: { prompt: 'Banknote pressing gently against smooth metal surface then sliding back, very subtle paper friction', durationSeconds: 2 },
  sting_shimmer: { prompt: 'Restrained elegant sonic logo shimmer, soft glassy tone with long decay, premium technology brand', durationSeconds: 4 },
};

/** Inflow coins are scattered procedurally between these times (see lib/sfx.ts). */
export const sfxProcedural = {
  inflow: { from: 2.0, to: 51.5, everySeconds: 0.55, jitter: 0.25, gainDb: -14, variants: ['coin_into_bucket_a', 'coin_into_bucket_b'] },
  /** escapes scale with the number of open holes, capped so it never gets busy */
  escape: { baseEvery: 2.2, minEvery: 0.7, gainDb: -16, variants: ['coin_escape_floor', 'coins_cluster_floor', 'note_land_floor'] },
};

export const sfxCues: SfxCue[] = [
  { id: 'room', file: 'room_tone', at: 0, gainDb: -26, loop: true, duration: 60 },
  { id: 'reso', file: 'metal_resonance', at: 0.6, gainDb: -22 },
  { id: 'flutter1', file: 'notes_flutter', at: 3.6, gainDb: -18 },
  { id: 'slip1', file: 'note_slip_through', at: 8.0, gainDb: -12 },
  { id: 'slip2', file: 'note_slip_through', at: 21.4, gainDb: -14 },
  { id: 'arrival', file: 'recover_arrival', at: 38.2, gainDb: -10 },
  // seal clicks are generated from holes[].sealsAt — see lib/sfx.ts
  { id: 'final', file: 'final_seal', at: finalSealAt, gainDb: -6 },
  { id: 'press', file: 'note_press_sealed', at: 49.2, gainDb: -10 },
  { id: 'sting', file: 'sting_shimmer', at: 53.3, gainDb: -12 },
];

export const film = {
  title: 'Detent Recover — The Leaky Bucket',
  output, brand, leakCategories, holes, shots, supers, endCard, narration, captions, audio,
  sfxLibrary, sfxCues, sfxProcedural, finalSealAt, maxConcurrentLabels, labelCase, labelMode, ledger,
};
export default film;
