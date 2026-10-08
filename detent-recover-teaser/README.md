# Detent Recover — "The Leaky Bucket" teaser

Production pipeline for the 60s Detent Recover launch teaser. **Start with [docs/PRODUCTION_PLAN.md](docs/PRODUCTION_PLAN.md).**

What's here: a config-driven Remotion film that renders a timed animatic today and swaps in final CG plates as they arrive; ElevenLabs voice/music/SFX generation with caching; automated QC; 16:9 / 1:1 / 9:16 outputs; and the Register Your Interest landing page.

## Quick start
```bash
npm install
cp .env.example .env            # add ELEVENLABS_API_KEY — never commit .env
npm run studio                  # live preview in the browser
npm run qc                      # terminology, timing, label density, VO fit, placeholders
npm run render:preview          # 1080p 16:9
```
In a container without a downloadable Chrome, add `--browser-executable=<path to chrome-headless-shell>`.

## Change anything
Everything lives in **`src/config/film.config.ts`** — shots, timings, leak categories and which are shown, holes and seal order, supers, end card, narration, voice, music sections, SFX, brand, URLs, output sizes. After editing: `npm run docs` regenerates `docs/SHOT_LIST.md` and `docs/CUE_SHEET.md`.

## Audio (ElevenLabs)
| Command | Does |
|---|---|
| `npm run vo:audition` | One line in each shortlisted British voice → `public/audio/vo/audition/` |
| `npm run vo` | All enabled narration segments (cached — only changed lines call the API) |
| `npm run vo -- --only=VO_04_RECOVER` | Regenerate one segment |
| `npm run music` | Score from the 7-section composition plan (`--dry-run` prints the plan) |
| `npm run sfx` | Sound-effects library |
| `npm run scan` | Register generated audio/plates/tracks with the film |

Swap in a licensed track or a human VO by dropping files in `public/audio/` with the same names (or `audio.music.overrideFile`).

## Final picture
Drop `S06.mov`/`S06.mp4` (and optionally `S06@9x16.mp4`) into `public/plates/`, hole tracks into `tracks/`, run `npm run scan`. The animatic stand-in for that shot is replaced automatically. Artist brief: [docs/PLATE_BRIEF.md](docs/PLATE_BRIEF.md).

## Landing page
`landing/index.html` — static, accessible, HubSpot Forms API or JSON endpoint. Set the `CONFIG` block (portal ID/form GUID, privacy URL, footer). Copy `public/brand/fonts` alongside it when deploying.
