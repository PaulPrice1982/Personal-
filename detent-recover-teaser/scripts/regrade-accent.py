"""Recolour the band's cyan accent light to Detent brand gold in already-generated plates.

Only strongly saturated cyan/blue pixels (the light line and its bloom) are touched;
the neutral, cool studio stays as shot. Usage: python3 scripts/regrade-accent.py S11 S12 ...
Originals are kept as public/plates/<shot>.cyan.mp4.
"""
import os, subprocess, sys
import cv2
import numpy as np

GOLD_HUE = 18  # OpenCV hue (0-179) for brand gold #CE8B20 (~37°)

def regrade(frame):
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV).astype(np.float32)
    h, s, v = hsv[..., 0], hsv[..., 1] / 255, hsv[..., 2] / 255
    # cyan..blue band (OpenCV 80..115 ≈ 160°..230°), weighted by saturation so greys are untouched
    hue_w = np.clip(1 - np.abs(h - 95) / 22, 0, 1)
    sat_w = np.clip((s - 0.22) / 0.25, 0, 1)
    val_w = np.clip((v - 0.12) / 0.2, 0, 1)
    m = cv2.GaussianBlur(hue_w * sat_w * val_w, (0, 0), 1.2)[..., None]
    gold = hsv.copy()
    gold[..., 0] = GOLD_HUE
    gold[..., 1] = np.clip(hsv[..., 1] * 1.05, 0, 255)
    gold_bgr = cv2.cvtColor(gold.astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32)
    out = frame.astype(np.float32) * (1 - m) + gold_bgr * m
    return np.clip(out, 0, 255).astype(np.uint8)

for shot in sys.argv[1:]:
    src = f'public/plates/{shot}.mp4'
    keep = f'public/plates/{shot}.cyan.mp4'
    if not os.path.exists(keep):
        os.rename(src, keep)
    cap = cv2.VideoCapture(keep)
    fps = cap.get(cv2.CAP_PROP_FPS); w = int(cap.get(3)); h = int(cap.get(4))
    tmp = f'/tmp/{shot}_gold_noaudio.mp4'
    ff = subprocess.Popen(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{w}x{h}', '-r', str(fps), '-i', '-',
                           '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', tmp], stdin=subprocess.PIPE)
    n = 0
    while True:
        ok, fr = cap.read()
        if not ok: break
        ff.stdin.write(regrade(fr).tobytes()); n += 1
    ff.stdin.close(); ff.wait()
    subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-i', tmp, '-i', keep, '-map', '0:v', '-map', '1:a?', '-c', 'copy', src], check=True)
    print(f'{shot}: {n} frames regraded')
