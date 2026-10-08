# Plate brief: for the 3D / VFX artist

**Project:** Detent Recover, "The Leaky Bucket". 60s enterprise technology teaser.
**Benchmark:** It has to stand next to a premium automotive or fintech launch film. Photoreal, restrained, dark and atmospheric. Not explainer animation.
**Deliverables:** 16 plates (S01–S16) plus hole-track JSON. The timed animatic (`out/animatic-16x9-1080p.mp4`) and `SHOT_LIST.md` are the timing and framing reference. Match the shot durations exactly.

---

## Technical spec

| | |
|---|---|
| Resolution | 3840×2160, plus native 2160×3840 (9:16) for S01, S02, S06, S09, S10, S14, S15, S16 |
| Frame rate | 24fps (high-speed shots: simulate at 48/96fps and retime, rather than blending frames) |
| Handles | 12 frames head and tail on every shot. Dissolve-in shots (S11, S17) need ≥15 frames of head handle |
| Delivery | ProRes 4444 or DNxHR HQX, Rec.709 graded **plus** the ungraded ACEScg EXR beauty, Z-depth and cryptomatte passes for finishing |
| File names | `S06.mov`, `S06@9x16.mov` → into `public/plates/` |
| Hole tracking | One Empty per opening named `HOLE_<id>` (ids below). Run `scripts/blender/export_tracks.py -- S06` for each shot camera → `tracks/S06.json` |
| Leave clear | Left third of frame in S01–S02 and S09 (supers sit there). Bottom 16% (captions) |

## Hero asset: the bucket

- A premium industrial bucket in brushed stainless steel. It should feel *engineered*, not like a garden pail: a rolled rim, a riveted vertical seam, a subtle anisotropic brushing, fingerprints at 2% visibility, and micro-scratches.
- Ten openings, each a *different* kind of failure: hairline split, lifted rivet seam, punched slot, corroded pinhole cluster, a split along a fold. Positions match `holes[].pos` in `film.config.ts` for the wide master framing.

| Hole id | Category (label) | Opens | Seals | Money type |
|---|---|---|---|---|
| H-users | Additional Users | 8.0 | 41.5 | £20 note through a hairline seam |
| H-companies | Additional Companies | 10.3 | 42.2 | £1 coins one at a time |
| H-storage | Additional Storage | 12.7 | 44.2 | small coin cluster from the rim seam |
| H-nongroup | Non-Group Entities | 15.5 | 44.7 | mixed |
| H-ma | Mergers & Acquisitions | 16.5 | 45.2 | £50 trapped half-through, then tears free |
| H-sites | Additional Sites | 17.5 | 45.6 | £20 notes |
| H-billing | Missed Billing | 18.5 | 42.9 | £20 notes, larger opening |
| H-equity | Contract Equity | 21.2 | 43.5 | mixed |
| R1 | rotating secondary leaks | 22.2 | 45.85 | coins |
| R2 | rotating secondary leaks | 25.0 | 46.0 | coins |

## Currency (read this before modelling)

- **Bank of England consent is being sought.** Use only reference artwork that the production supplies. Never use scraped images, and never render a note full-face, sharp and at near life-size for more than a few frames.
- Notes are **polymer** (£20 Turner, £50 Turing, in one consistent series). Polymer is stiffer and slicker than paper: it *slides and springs*, it doesn't crumple or float like tissue. Cloth sim needs high bending stiffness and low friction.
- Coins: £1 (12-sided, bimetallic) and £2 (bimetallic). Correct thickness, milled edges, and the right ring when they settle.
- No invented text, serials or denominations. If a note can't be accurate in a given shot, it goes out of focus.

## Look

- Dark concrete studio floor with a slight sheen; one overhead softbox key and a thin rim light; light haze so the cone reads.
- Lens: real optics. Physical defocus, gentle breathing on focus pulls, no CG-perfect bokeh. A touch of chromatic aberration at the frame edges.
- Grade: near-neutral blacks, slightly warm highlights before 38s. **From 38s the key cools** toward the Detent Recover palette (`#BFE3F2` / `#6FC3E8` accents). It warms back about 300K at S16.

## Detent Recover band (S11–S16)

- **Not a rubber band. Not a sci-fi ring.** It's a precision-machined collar in dark anodised alloy, built from articulated segments like a watch bracelet crossed with a magnetic mechanism. A hairline illuminated channel (`#6FC3E8`) runs along its length. `DETENT RECOVER` is laser-etched small, readable only in the macro shots.
- It travels around the bucket. At each opening a segment drops and locks flush (we hit a click SFX on the frame listed under *Seals*). The flow stops dead at each one: no dribble afterwards.
- **S15 money shot:** an *interior* macro. A £20 slides down the inside wall toward a former opening, presses against the sealed band, can't pass, and falls back into the money. Hold 0.8s on the sealed surface afterwards. This is the shot the whole film builds to, so give it the most render time.

## Do not

Cartoon physics, money explosions, glowing holograms, floating UI, lens flares, colour outside the palette, or any recognisable real-world logo other than Detent.

## Process

1. Look-dev frame of the bucket plus one note (paid test). 2. Grey-shaded animatic of all 16 shots, timed to `out/animatic-16x9-1080p.mp4`. 3. Simulation pass. 4. Final renders plus tracks. Review at each stage.

---

## Appendix: generative-video prompts (look-development and previs only, not for final plates)

> Use for mood boards in Veo, Kling or Runway. Expect wrong banknote detail; never ship these frames.

- **S01:** *Dark photography studio, single overhead softbox, light haze, a brushed stainless-steel industrial bucket on a dark concrete plinth, slow push-in, 35mm, shallow depth of field, cinematic, photorealistic, premium automotive commercial lighting, no text.*
- **S03:** *Extreme macro, 100mm, side wall of a brushed-steel bucket, a hairline seam slowly parts and the corner of a British polymer banknote pushes through, catches, slips free and falls, rack focus, dark studio, photoreal, shallow depth of field.*
- **S09:** *Camera 2cm off a dark polished concrete floor tracking slowly sideways through scattered British pound coins and polymer banknotes, shallow depth of field, single top light, cinematic, photoreal, quiet.*
- **S11:** *Macro of a precision-machined dark anodised alloy collar with a hairline cyan illuminated channel sliding around a brushed-steel bucket, premium product film, cool light, photoreal.*
