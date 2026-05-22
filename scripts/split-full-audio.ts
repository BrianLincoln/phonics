/**
 * Splits *-full.wav files into *-name.wav and *-sound.wav.
 *
 * Expects each full file to follow the sentence structure:
 *   "This is the letter/spelling: [pause] NAME [pause] It makes the sound: [pause] SOUND [pause] Like in EXAMPLE."
 *
 * The script detects silence gaps and extracts:
 *   - Voiced segment at index 1 → {id}-name.wav
 *   - Voiced segment at index 3 → {id}-sound.wav
 *
 * Usage:
 *   npx tsx scripts/split-full-audio.ts <file-or-folder>
 *
 * Examples:
 *   npx tsx scripts/split-full-audio.ts public/audio/phonics-units-new/s-full.wav
 *   npx tsx scripts/split-full-audio.ts public/audio/phonics-units-new/
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { execSync } from 'child_process';

const target = process.argv[2];
if (!target) {
  console.error('Usage: npx tsx scripts/split-full-audio.ts <file-or-folder>');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Find voiced segments (gaps between silence periods)
// ---------------------------------------------------------------------------

function findVoicedSegments(wavPath: string): Array<[number, number]> {
  const totalDur = parseFloat(
    execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${wavPath}"`)
      .toString().trim(),
  );

  // -45dB catches quiet sounds like fricatives; 0.15s catches brief natural pauses
  const raw = execSync(
    `ffmpeg -i "${wavPath}" -af "silencedetect=noise=-45dB:duration=0.15" -f null - 2>&1`,
  ).toString();

  const silenceStarts = [...raw.matchAll(/silence_start: ([\d.]+)/g)].map(m => parseFloat(m[1]));
  const silenceEnds   = [...raw.matchAll(/silence_end: ([\d.]+)/g)].map(m => parseFloat(m[1]));

  const voiced: Array<[number, number]> = [];
  let cursor = 0;

  for (let i = 0; i < silenceStarts.length; i++) {
    if (silenceStarts[i] - cursor > 0.08) voiced.push([cursor, silenceStarts[i]]);
    cursor = silenceEnds[i] ?? totalDur;
  }
  if (totalDur - cursor > 0.08) voiced.push([cursor, totalDur]);

  return voiced;
}

// ---------------------------------------------------------------------------
// Extract a segment with a small pad on each side
// ---------------------------------------------------------------------------

function extractSegment(src: string, start: number, end: number, out: string): void {
  const totalDur = parseFloat(
    execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${src}"`)
      .toString().trim(),
  );
  const s = Math.max(0, start - 0.04);
  const e = Math.min(totalDur, end + 0.04);
  execSync(
    `ffmpeg -y -i "${src}" -ss ${s} -to ${e} -ar 44100 -ac 1 -sample_fmt s16 "${out}" 2>/dev/null`,
  );
}

// ---------------------------------------------------------------------------
// Split one full file
// ---------------------------------------------------------------------------

function splitFile(fullPath: string): void {
  const dir = dirname(fullPath);
  const name = basename(fullPath); // e.g. "s-full.wav" or "s-full.mp3"

  const isWav = name.endsWith('-full.wav');
  const isMp3 = name.endsWith('-full.mp3');
  if (!isWav && !isMp3) {
    console.log(`  skip: ${name} (doesn't match *-full.wav/mp3 pattern)`);
    return;
  }

  const unitId = name.replace('-full.wav', '').replace('-full.mp3', '');
  const nameOut  = join(dir, `${unitId}-name.wav`);
  const soundOut = join(dir, `${unitId}-sound.wav`);

  process.stdout.write(`  ${unitId.padEnd(6)} `);

  const segments = findVoicedSegments(fullPath);

  if (segments.length < 4) {
    console.log(`⚠  only ${segments.length} voiced segments detected (need ≥4).`);
    console.log(`         Make sure you pause clearly between each part of the sentence.`);
    console.log(`         Segments found: ${segments.map(([s,e]) => `${s.toFixed(2)}–${e.toFixed(2)}s`).join(', ')}`);
    return;
  }

  if (segments.length > 5) {
    console.log(`⚠  ${segments.length} segments found — more than expected. Using indices 1 and 3.`);
  }

  extractSegment(fullPath, segments[1][0], segments[1][1], nameOut);
  extractSegment(fullPath, segments[3][0], segments[3][1], soundOut);

  const kb = (p: string) => Math.round(readFileSync(p).length / 1024);
  const dur = (s: number, e: number) => `${(e - s).toFixed(2)}s`;
  console.log(
    `✓  name (${dur(...segments[1])}, ${kb(nameOut)}KB)  ` +
    `sound (${dur(...segments[3])}, ${kb(soundOut)}KB)`
  );
}

// ---------------------------------------------------------------------------
// Main — handle file or directory
// ---------------------------------------------------------------------------

if (existsSync(target)) {
  const stat = execSync(`stat -f "%HT" "${target}"`).toString().trim();

  if (stat === 'Directory') {
    const files = readdirSync(target)
      .filter(f => f.endsWith('-full.wav') || f.endsWith('-full.mp3'))
      .sort();

    if (files.length === 0) {
      console.log('No *-full.wav or *-full.mp3 files found in that folder.');
      process.exit(0);
    }

    console.log(`\nSplitting ${files.length} file(s) in ${target}\n`);
    for (const f of files) splitFile(join(target, f));
    console.log('\nDone.');

  } else {
    console.log(`\nSplitting ${target}\n`);
    splitFile(target);
  }

} else {
  console.error(`Not found: ${target}`);
  process.exit(1);
}
