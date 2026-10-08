#!/usr/bin/env bash
# Cuts generated source clips (out/look/*.mp4) into per-shot plates in public/plates/.
# Each row: SHOT  SOURCE  IN  OUT  TARGET_DURATION  (speed is stretched to fit; slow-down uses motion interpolation)
set -euo pipefail
SRC=out/look; DST=public/plates; mkdir -p $DST
while read -r shot src in out dur; do
  [[ -z "$shot" || "$shot" == \#* ]] && continue
  len=$(python3 -c "print($out-$in)")
  f=$(python3 -c "print(round($dur/$len,4))")   # >1 = slow down
  vf="setpts=${f}*PTS"
  if python3 -c "import sys; sys.exit(0 if $f>1.08 else 1)"; then vf="$vf,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1"; fi
  at=$(python3 -c "print(round(1/$f,4))")
  ffmpeg -nostdin -hide_banner -loglevel error -y -ss "$in" -to "$out" -i "$SRC/$src.mp4" \
    -vf "$vf,fps=24,scale=1920:1080:flags=lanczos,format=yuv420p" \
    -af "atempo=$at" -t "$dur" -c:v libx264 -crf 16 -preset medium -c:a aac -b:a 192k "$DST/$shot.mp4"
  echo "$shot  $src  [$in-$out] -> ${dur}s (x$f)"
done <<'TABLE'
# shot src            in    out   dur
S01  C01_opening      0.0   2.1   3.5
S02  C01_opening      4.5   8.0   3.5
S03  test_S03_leak    3.0   6.0   3.0
S04  C02_macro        1.5   4.0   2.5
S05  C02_macro        4.0   6.5   2.5
S06  C03_pullback     0.0   6.0   6.0
S07  C04_orbit        0.0   4.0   4.0
S08  C08b_leaking     0.0   5.0   5.0
S09  C05_floor        0.0   4.0   4.0
S10  C06_overhead     0.0   3.6   4.0
S11  C07_seal         0.0   3.0   3.0
S12  C07_seal         3.0   5.8   2.8
S13  C07_seal         5.8   8.0   2.4
S14  C08_sealed       0.0   1.8   1.8
S15  C09_money_gold   1.0   4.5   3.5
S16  C10_retained     1.8   3.3   1.5
TABLE
# Band shots were generated with a cyan accent; recolour to brand gold after cutting.
python3 scripts/regrade-accent.py S11 S12 S13 S14 S16
