# Detent Recover — "The Leaky Bucket": production plan

**Format:** 60s "Coming Soon" teaser · 16:9 4K master · 1:1 and 9:16 cut-downs
**Audience:** CFO, CEO, CRO, CCO, RevOps and finance leaders in B2B SaaS, IoT and usage-based technology businesses
**The one reaction it has to provoke:** *"How much revenue is our existing customer base leaking — and who owns finding it?"*

---

## 0. Bottom line

1. **This repository can't make the photoreal footage, and no code-only pipeline can.** What it does is everything around the footage: a timed animatic, leak labels that follow the holes, supers, captions, the end card, the ElevenLabs voiceover, music and sound effects, the mix, the three aspect ratios, QC and the registration page. The photoreal shots have to be made outside the repo.
2. **Recommended route: a CG film made by one specialist product-visualisation artist (Blender or Houdini).** It comes in under an agency budget (est. £8–18k). Generative video fails this brief, for the reasons in §2.
3. **Three issues need your decision before anything is spent on footage:** (a) Bank of England consent to show banknotes, (b) whether you accept the tightened narration, (c) where Detent Recover sits in the brand architecture. See §9.

---

## 1. Review of the brief — where I'd push back

| Issue | Why it matters | What I've done |
|---|---|---|
| **"Leaky bucket" is the most-used metaphor in SaaS retention.** CFOs have seen it on churn slides for a decade. | If the film reads as "churn", it's wallpaper. Your edge is that the leaks sit inside **growing** customers: under-billing, not churn. | The story is built on *"Your customers grow"*. Money keeps pouring in throughout, so the leak is clearly expansion you aren't capturing, not customers walking out. |
| **Insolvency, Early Terminations and GRR are churn-type losses**, not "usage outgrew the contract". GRR is a *metric*, not a leak source. | They dilute the one idea that makes Detent Recover distinctive and pull it back toward generic retention tooling. A CFO who sees "GRR" on a hole will ask what it means. | All three are secondary, rotating labels only. **GRR is stored but hidden** (`showOnScreen:false`). One flag turns it back on. |
| **The VO_04 line in the brief runs ~14s at a calm read.** | It would talk over the money shot, which is the payoff, and leave no air before the brand. | Tightened to ~9s: *"Detent Recover identifies the leakage, quantifies it, and gives your teams the workflows to recover it — with the customer relationship intact."* The original is kept in config (disabled). "Turning hidden leakage…" is also disabled because it duplicates the end line. |
| **VO_01 "Your customers grow" repeats the super on screen.** | Reading and hearing the same words at once is a cheap-ad tell. | Kept at 2.0s so the voice lands with the super rather than echoing it. My preference: open on music and supers only, and let the voice enter at 7.6s. That's a one-flag change. |
| **"Register your interest" is a weak response to the success criterion.** The intended final thought is "how much are *we* leaking?" | Interest lists convert poorly with CFOs. A *number* converts. | The film CTA stays as briefed. The landing page headline asks the question and offers a leakage estimate in exchange (see `landing/`). |
| **Brand architecture.** Detent Recover is a third named product alongside Ask Detent and Detent GTM OS. | "Coming soon" commits you publicly to a timeline and to a CFO-sold product. That's a different buyer, sales cycle and price point from Ask Detent's rep-led freemium, and it will be read as a preview of GTM OS's contract-monetisation pillar. | Branding is fully configurable. **Decide** whether Recover is (a) a GTM OS module shipping early or (b) a standalone product, before the end card goes public. |

---

## 2. Route to genuinely photoreal results

### Recommendation: **Route A, CG-first.** One specialist artist; Blender with Cycles, or Houdini with Karma/Redshift.

| Route | What it is | Est. cost | Time | Agency benchmark? | Verdict |
|---|---|---|---|---|---|
| **A. CG-first** | Modelled bucket, notes simulated as cloth, coins as rigid bodies, CG Detent Recover band, path-traced renders | £8–18k freelance | 3–4 wks | **Yes**, if the artist's reel shows photoreal cloth and metal | **Recommended** |
| B. Practical tabletop + CG band | Studio shoot with a Phantom high-speed camera and a motion-control rig, fabricated bucket, real money; band added in VFX | £25–45k | 4–6 wks | Yes, the most real | Best result, but the 17-hole sealing sequence is very hard to shoot practically. Worth it only for 2–3 macro inserts (S02, S09, S15) if budget allows |
| C. Generative video (Veo, Kling, Runway, Sora) | Prompted clips stitched together | £0.3–1.5k credits | 1–2 wks | **No** | Use for look-development and previs only |

**Why CG-first wins for this film specifically:**

- **Continuity.** The same bucket and the same ten holes appear in 17 shots. Generative video can't hold that layout from shot to shot. CG holds it by definition.
- **A deterministic seal sequence.** The holes close one by one, in a set order, on set frames, timed to the audio. This is a mechanism story, and only CG (or VFX on a practical plate) can choreograph it.
- **Labels lock to holes.** `scripts/blender/export_tracks.py` exports each hole's on-screen position for every frame. The film reads those files, so annotations stay attached to their holes through camera moves with no manual tracking.
- **Native 9:16 and 1:1.** A CG camera re-renders in vertical for little extra cost. Cropping a 16:9 plate to 9:16 throws away about two-thirds of the width (the animatic shows this clearly).
- **Currency accuracy.** The artist builds note and coin materials from approved reference artwork. Generative models produce garbled serials, wrong portraits and impossible denominations, which a finance audience will spot immediately.

**Where generative video does help:** mood frames for the brief, previs of camera moves, and possibly the S09 floor-track texture or the end-card background. Never the hero shots.

---

## 3. Who makes what

| Component | Method | Made by | Lives in |
|---|---|---|---|
| Hero plates (S01–S16) | **Rendered:** CG, multi-pass EXR → graded ProRes 4444 / H.264 | 3D artist (+ colourist in DaVinci Resolve, optional) | `public/plates/S01.mp4`, `S01@9x16.mp4` … |
| Hole tracking data | **Exported** from the 3D scene | 3D artist runs `export_tracks.py` | `tracks/S06.json` … |
| Leak annotations, supers, captions, end card, film grain, vignette | **Composited** in Remotion from config | This repo | `src/components/` |
| Narration | **Generated:** ElevenLabs TTS, one file per line, cached | This repo (`npm run vo`) | `public/audio/vo/` |
| Music | **Generated:** ElevenLabs Music v2.5 with a 7-section composition plan locked to picture, *or* a licensed or composed track via `overrideFile` | This repo (`npm run music`) | `public/audio/music/` |
| Sound effects | **Generated:** ElevenLabs Sound Effects (14 sounds) + procedural placement | This repo (`npm run sfx`) | `public/audio/sfx/` |
| Mix + master | **Automated:** music ducking, post-seal silence dip, two-pass EBU R128 loudness to −14 LUFS / −1 dBTP | This repo | `scripts/master-audio.sh` |
| Registration page | **Created:** static, accessible HTML form | This repo, wired to HubSpot or similar | `landing/` |

---

## 4. Project architecture

```
detent-recover-teaser/
├─ src/config/film.config.ts     ← ALL content: timings, shots, leaks, copy, VO, music, SFX, brand, output
├─ src/config/types.ts
├─ src/lib/                      timeline maths, crop/aspect placement, audio ducking, captions, fonts
├─ src/components/               Plate · PlaceholderPlate (animatic) · LeakLabels · Supers · Captions · EndCard · Grade · Soundtrack
├─ src/Film.tsx / Root.tsx       16:9, 1:1, 9:16 and captioned 16:9 compositions
├─ src/generated/assets.json     what exists on disk (written by `npm run scan`)
├─ scripts/elevenlabs/           generate-vo · audition-voices · generate-music · generate-sfx (cached, per-segment)
├─ scripts/blender/export_tracks.py
├─ scripts/qc.ts                 automated QC gate (runs before every render)
├─ scripts/build-docs.ts         regenerates SHOT_LIST.md and CUE_SHEET.md from config
├─ scripts/master-audio.sh       loudness mastering
├─ public/plates · public/audio · public/brand
├─ tracks/                       per-shot hole positions from the 3D scene
├─ landing/                      Register Your Interest page
└─ docs/                         this plan · SHOT_LIST · CUE_SHEET · PLATE_BRIEF
```

**Principles:**

- **Content is separate from presentation.** Changing copy, timings, labels, the voice or the URL means editing one file, not scene logic.
- **The final picture drops in.** Put `S06.mp4` in `public/plates/`, run `npm run scan`, and the animatic stand-in for that shot is replaced automatically.
- **Text is never cropped.** Supers, labels and captions are laid out natively for each aspect ratio. Only the picture is cropped, or re-rendered natively for that aspect.
- **The API key stays server-side.** `ELEVENLABS_API_KEY` lives only in `.env` (git-ignored) and is read only by Node scripts. It never enters the video bundle or the landing page.

---

## 5. Shot list

17 shots, 60.0s, 24fps. The full table (camera, action, labels, narration and supers per shot) is generated in **[SHOT_LIST.md](SHOT_LIST.md)**.

| # | Time | Shot | What the CFO takes away |
|---|---|---|---|
| S01 | 0.0–3.5 | Reveal: bucket in a single light cone; coins begin | — |
| S02 | 3.5–7.0 | Low 3/4, notes and coins flowing in (slow motion) | Revenue is coming in |
| S03 | 7.0–10.0 | Macro: a £20 pushes through a seam → **ADDITIONAL USERS** | Something is wrong |
| S04 | 10.0–12.5 | Macro: coins escape → **ADDITIONAL COMPANIES** | |
| S05 | 12.5–15.0 | Rim seam → **ADDITIONAL STORAGE** | |
| S06 | 15.0–21.0 | Pull back: leaks everywhere → **NON-GROUP ENTITIES, M&A, SITES, MISSED BILLING** | It's bigger than I thought |
| S07 | 21.0–25.0 | Orbit, trapped £50 → **CONTRACT EQUITY**, plus a rotating hole for secondary leaks | |
| S08 | 25.0–30.0 | Many leaks at once, still restrained | |
| S09 | 30.0–34.0 | Floor track through escaped money. Super: REVENUE YOU SHOULD ALREADY BE COLLECTING. | *How much are we losing?* |
| S10 | 34.0–38.0 | Overhead: in vs out, a ring of loss on the floor. Music peaks, then cuts | |
| S11 | 38.0–41.0 | Light cools; the Detent Recover band arrives | |
| S12 | 41.0–43.8 | Seals: Users → Companies → Missed Billing → Contract Equity | It identifies and stops it |
| S13 | 43.8–46.2 | Remaining seals; final deep lock at 46.0, then silence | |
| S14 | 46.2–48.0 | Wide: money in, nothing out | Value retained |
| **S15** | **48.0–51.5** | **Money shot:** a £20 presses against the sealed hole and falls back in. Hold 0.8s | **The payoff** |
| S16 | 51.5–53.0 | Retained, light warms | |
| S17 | 53.0–60.0 | End card: DETENT RECOVER → STOP THE LEAK. RECOVER THE REVENUE. → COMING SOON → REGISTER YOUR INTEREST → | Action |

**Label density:** QC checks every frame. Peak is 8 labels at once (overhead shot), 18 of 19 categories appear, and all 8 prominent categories are labelled. Seal order follows the brief.

---

## 6. Narration mapped to shots

| Segment | In | Must end by | Over shots | Line |
|---|---|---|---|---|
| VO_01_OPENING | 2.0 | 4.8 | S01–S02 | Your customers grow. |
| VO_02_LEAKAGE | 7.6 | 15.2 | S03–S05 | They add users, entities, locations, services and consumption. But contracts and billing don't always keep up. |
| VO_03_SCALE | 16.4 | 23.4 | S06–S07 | And when what customers use no longer matches what they pay for… revenue leaks. |
| VO_03B_HIDDEN | 24.4 | 28.0 | S08 | Often hidden inside the customers you already have. |
| *(no voice)* | 28–38.6 | | S09–S10 | The realisation lands on picture and music alone |
| VO_04_RECOVER | 38.6 | 47.8 | S11–S13 | Detent Recover identifies the leakage, quantifies it, and gives your teams the workflows to recover it — with the customer relationship intact. |
| *(no voice)* | 47.8–53.5 | | S14–S16 | Money shot plays in near-silence |
| VO_05A_BRAND | 53.5 | 54.9 | S17 | Detent Recover. |
| VO_05B_LINE | 55.1 | 57.9 | S17 | Stop the leak. Recover the revenue. |
| VO_05C_CTA | 58.0 | 59.6 | S17 | Register your interest. |

Each segment is its own file. `npm run vo -- --only=VO_04_RECOVER` regenerates one line. Neighbouring lines are passed as context so separate takes sound like one continuous read. QC fails the build if a generated take overruns its "must end by" time.

---

## 7. Music and sound design on the timeline

Full detail is in **[CUE_SHEET.md](CUE_SHEET.md)**.

| Time | Music (ElevenLabs composition plan section) | Sound design |
|---|---|---|
| 0–7 | **Air:** near silence, one low tone, sparse felt piano | Room tone, steel resonance, first coin hits, note flutter |
| 7–15 | **Seep:** quiet 70 bpm pulse emerges, minor key | Note slipping through a slit, first coins hitting the floor |
| 15–30 | **Spread:** ostinato, low end grows | Escape impacts get denser as more holes open (capped so it never gets busy) |
| 30–38 | **Weight:** maximum tension, string cluster, **hard cut to silence at 37.8** | Floor ring-outs |
| 38–46 | **Control:** precise ticking pulse, harmony turns major | Engineered servo-and-magnet arrival at 38.2; a **seal click on every hole**; deep final lock at 46.0 |
| 46–53 | **Retain:** dip, then one warm resolving chord | Music −16 dB and SFX bus dipped for 1.6s: *the audience hears the leak stop*; note-against-steel at 49.2 |
| 53–60 | **Sting:** restrained sonic logo, decays to silence | Glass shimmer at 53.3 |

**Mix:** music ducks 9 dB under narration (0.25s attack, 0.6s release). Priority is narration, then key sound effects, then music. The master is normalised to **−14 LUFS / −1 dBTP** for web and social, or −23 LUFS for UK broadcast if this ever goes through Clearcast.

---

## 8. What I need from you

| # | Item | Why | Blocking? |
|---|---|---|---|
| 1 | **ElevenLabs API key** with TTS, Music and Sound Effects access, in `.env` (never paste it into chat or commit it) | Voice, music and SFX generation. The connected ElevenLabs connector can search voices, but this session lacks the scope to generate. | Blocks audio |
| 2 | **Narrator choice.** Run `npm run vo:audition` and pick one | Shortlisted: Jim Executive (default), Peter (ex-BBC, RP), Alex Bennett, Sterling | No (default set) |
| 3 | **Route decision (A, B or C) and budget** | Determines who makes the plates | **Blocks final picture** |
| 4 | **Detent and Detent Recover logos** (SVG), **brand fonts** with a video/web embedding licence, palette | Replace placeholders | Blocks release |
| 5 | **Registration URL** and **website URL** | End card and CTA. Placeholder until supplied; nothing is invented | Blocks release |
| 6 | **Form backend:** HubSpot portal ID and form GUID (HubSpot is connected to this workspace), or another endpoint | Landing page submissions | Blocks release |
| 7 | **Legal entity name** for the footer, and **privacy notice URL** | UK GDPR / PECR transparency on the form | Blocks release |
| 8 | **Bank of England consent** (see §9) | Showing banknotes | **Blocks final picture** |
| 9 | Decision on the §1 pushbacks (GRR, VO_04, VO_01, brand architecture) | | No |

---

## 9. What could stop this reaching premium commercial quality

**Ranked by risk:**

1. **The plates (critical).** The film is only as good as the 3D artist. Hire on reel, not price. The test is photoreal *cloth sim* (notes) and *anisotropic brushed metal*. Ask for a 3-second look-dev test of shot S03 before committing the full fee.
2. **Banknote reproduction (legal; critical).** Reproducing Bank of England notes without the Bank's consent is an offence under s.18 of the Forgery and Counterfeiting Act 1981. The Bank runs a reproduction approval process. **Apply now**, as approval can take weeks, and design to its conditions (e.g. notes not shown full-face, sharp and at size for long). Coin designs are Crown copyright: check the Royal Mint's reproduction terms. Accuracy details a finance audience will notice: current notes are **polymer**, so they're stiffer and slicker than paper and slide rather than flutter; the £1 coin is 12-sided and bimetallic; King Charles III and Queen Elizabeth II notes are both legal tender, so pick one and stay consistent.
3. **Synthetic narration.** The best ElevenLabs voices get about 90% of the way to a human read. For an agency-grade finish, budget for a professional British voice artist (roughly £400–1,200 for 60s online usage with buyout). The ElevenLabs track then serves as the timing guide and the voice artist reads to it. Same pipeline, same timings.
4. **AI music and SFX.** Fine for a teaser. For tight hit points (the seal clicks and the 37.8s cut), a composer working to picture, or a licensed track edited to the cue sheet, is noticeably better. A one-day mix with a sound engineer (~£500–800) is the cheapest quality gain available.
5. **Labels tipping into "HUD".** The annotation style is deliberately restrained (mono font, thin lines, ring markers), but test it on two real CFOs. If they read it as a dashboard, cut the "● LEAKING" status line.
6. **Placeholder typography.** Inter Tight and IBM Plex Mono (both OFL-licensed) stand in for the brand fonts. They're competent, but they aren't a brand.
7. **The cliché risk** (see §1). Execution has to carry a metaphor the audience has seen before. That's another reason not to compromise on the plates.

---

## Single highest-impact next action

**Apply to the Bank of England for banknote reproduction consent today, and in parallel shortlist three Blender/Houdini product-viz artists, each asked for a paid 3-second look-dev test of S03 (the £20 slipping through the seam).** Every other part of the film is already built and waiting for that footage.
