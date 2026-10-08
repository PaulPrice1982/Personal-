// Server-side only. The API key is read from .env and never reaches the Remotion bundle.
import 'dotenv/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const ROOT = join(import.meta.dirname, '..', '..');
export const PUBLIC = join(ROOT, 'public');
const CACHE_INDEX = join(ROOT, '.cache', 'elevenlabs-index.json');

export function client() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('ELEVENLABS_API_KEY is not set. Copy .env.example to .env and add your key.');
    process.exit(1);
  }
  return new ElevenLabsClient({ apiKey });
}

export const hashOf = (obj: unknown) => createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16);

type Index = Record<string, string>; // output path -> request hash
const readIndex = (): Index => (existsSync(CACHE_INDEX) ? JSON.parse(readFileSync(CACHE_INDEX, 'utf8')) : {});
const writeIndex = (i: Index) => { mkdirSync(dirname(CACHE_INDEX), { recursive: true }); writeFileSync(CACHE_INDEX, JSON.stringify(i, null, 2)); };

/**
 * Generate-once cache: an output is only regenerated when its request changes
 * (text, voice, settings…) or when --force / --only targets it. Saves API spend.
 */
export async function cached(outRel: string, request: unknown, force: boolean, make: () => Promise<ReadableStream<Uint8Array>>) {
  const out = join(PUBLIC, outRel);
  const h = hashOf(request);
  const idx = readIndex();
  if (!force && existsSync(out) && idx[outRel] === h) {
    console.log(`  cached   ${outRel}`);
    return false;
  }
  console.log(`  generate ${outRel}`);
  const stream = await make();
  const buf = Buffer.from(await new Response(stream).arrayBuffer());
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buf);
  idx[outRel] = h;
  writeIndex(idx);
  return true;
}

export function argv() {
  const a = process.argv.slice(2);
  const only = a.find((x) => x.startsWith('--only='))?.slice(7).split(',');
  return { force: a.includes('--force'), only, dry: a.includes('--dry-run'), rest: a };
}
