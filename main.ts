// gta6-clipper-01 entry: "GTA 6 Explosion in Slow Motion" — a vertical Short cut by an AI agent
// from Rockstar's official Grand Theft Auto VI Trailer 2. The clip slows down the one-second
// highway explosion in which a police cruiser flips through a fireball in front of Lucia, replays
// it at real speed, and closes with the make.fun pitch card. This program's whole job is to hand
// the video's YouTube address to the grader: it copies VIDEO.json from the repository root into
// the output directory, byte for byte. Before copying, it sanity-checks the file the same way the
// gate will: VIDEO.json must parse, stay within the gate's 16384-byte cap, and actually carry a
// string `url`, so a malformed file fails loudly here instead of silently at the gate.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate refuses a VIDEO.json larger than this, so the entry refuses it first.
const MAX_VIDEO_JSON_BYTES = 16384;

const sourcePath = join(BOT_DIR, 'VIDEO.json');

let parsed: unknown;
try {
  const size = statSync(sourcePath).size;
  if (size > MAX_VIDEO_JSON_BYTES) {
    console.error(`VIDEO.json is ${size} bytes, over the ${MAX_VIDEO_JSON_BYTES}-byte gate cap.`);
    process.exit(1);
  }
  parsed = JSON.parse(readFileSync(sourcePath, 'utf8'));
} catch (err) {
  if ((err as { code?: string }).code === 'ENOENT' || err instanceof SyntaxError) {
    console.error(`VIDEO.json could not be read or parsed in ${BOT_DIR}: ${(err as Error).message}`);
    process.exit(1);
  }
  throw err;
}

const url = (parsed as { url?: unknown } | null)?.url;
if (typeof url !== 'string' || url.length === 0) {
  console.error('VIDEO.json must be a JSON object with a non-empty string "url".');
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(sourcePath, join(OUTPUT_DIR, 'VIDEO.json'));
} catch (err) {
  console.error(`VIDEO.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
