// Renders flywheel.html frame by frame and pipes PNGs to ffmpeg.
// Usage: node render.js out.mp4 [--stills 0,4,8,12,16,21]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const FPS = 30, DURATION = 29;
(async () => {
  const out = process.argv[2];
  const stillsArg = process.argv.indexOf('--stills');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, 'flywheel.html'));
  await page.evaluate(() => document.fonts.ready);
  if (stillsArg > 0) {
    for (const s of process.argv[stillsArg + 1].split(',').map(Number)) {
      await page.evaluate(t => window.render(t), s);
      await page.screenshot({ path: path.join(__dirname, `still_${String(s).padStart(4, '0')}.png`) });
    }
    await browser.close(); return;
  }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-crf', '17', '-preset', 'slow', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < FPS * DURATION; f++) {
    await page.evaluate(t => window.render(t), f / FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
})();
