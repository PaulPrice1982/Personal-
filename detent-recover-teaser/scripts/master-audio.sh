#!/usr/bin/env bash
# Two-pass EBU R128 loudness normalisation of a rendered film, video stream copied.
# Usage: scripts/master-audio.sh out/teaser-16x9.mp4 [-14]   (use -23 for UK broadcast)
set -euo pipefail
IN="$1"; LUFS="${2:--14}"; TP=-1; LRA=7
OUT="${IN%.*}.mastered.mp4"
STATS=$(ffmpeg -hide_banner -i "$IN" -af loudnorm=I=$LUFS:TP=$TP:LRA=$LRA:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
get() { echo "$STATS" | grep "\"$1\"" | sed -E 's/.*: "([^"]+)".*/\1/'; }
ffmpeg -hide_banner -y -i "$IN" -c:v copy -c:a aac -b:a 320k -ar 48000 \
  -af "loudnorm=I=$LUFS:TP=$TP:LRA=$LRA:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
  "$OUT"
echo "Mastered → $OUT ($LUFS LUFS, $TP dBTP)"
