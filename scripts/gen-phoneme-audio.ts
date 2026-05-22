/**
 * ElevenLabs phoneme audio generator.
 *
 * Strategy: one API call per phoneme using a full natural sentence with SSML
 * <break> tags as split points. ffmpeg silence detection extracts the name
 * and sound segments from each recording.
 *
 * Usage:
 *   npx tsx scripts/gen-phoneme-audio.ts --unit s               # single phoneme
 *   npx tsx scripts/gen-phoneme-audio.ts --preview              # 7 sample phonemes
 *   npx tsx scripts/gen-phoneme-audio.ts --all                  # all 54 phonemes
 *
 * Options:
 *   --voice       ElevenLabs voice ID
 *   --stability   0–1, default 0.5
 *   --similarity  0–1, default 0.75
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { phonemeTextMap, previewUnits } from './phoneme-text-map.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const OUTPUT_DIR = join(projectRoot, 'public/audio/phonics-units-new');

// Simple .env loader
try {
  const envLines = readFileSync(join(projectRoot, '.env'), 'utf-8').split('\n');
  for (const line of envLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch { /* rely on shell env */ }

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(`--${name}`);
const opt = (name: string, fallback?: string) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
};

const mode = flag('all') ? 'all' : flag('preview') ? 'preview' : 'single';
const unitArg = opt('unit');
const voiceId = opt('voice', '64likKt4bveCECTYzApI');
const stability = parseFloat(opt('stability', '0.5')!);
const similarityBoost = parseFloat(opt('similarity', '0.75')!);

// ---------------------------------------------------------------------------
// Build the SSML prompt
// STRUCTURE: intro [BREAK] name [BREAK] bridge [BREAK] sound [BREAK] outro
// We extract voiced segment index 1 (name) and index 3 (sound).
// ---------------------------------------------------------------------------

const BREAK = '<break time="1.0s"/>';

function buildSsml(unitId: string): string {
  const { nameText, soundText, example, category } = phonemeTextMap[unitId];
  const intro =
    category === 'consonant' || category === 'vowel'
      ? 'This is the letter'
      : 'This is the spelling';

  return (
    `<speak>` +
    `${intro}: ${BREAK} ${nameText}. ${BREAK} ` +
    `It makes the sound: ${BREAK} ${soundText}. ${BREAK} ` +
    `Like in ${example}.` +
    `</speak>`
  );
}

// ---------------------------------------------------------------------------
// ElevenLabs API — returns MP3 buffer
// ---------------------------------------------------------------------------

async function fetchMp3(ssml: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('❌  ELEVENLABS_API_KEY is not set.');
    process.exit(1);
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: ssml,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: { stability, similarity_boost: similarityBoost },
    }),
  });

  if (!res.ok) throw new Error(`ElevenLabs API ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

// ---------------------------------------------------------------------------
// Silence detection — returns [start, end] pairs for each VOICED segment
// ---------------------------------------------------------------------------

function findVoicedSegments(wavPath: string): Array<[number, number]> {
  const totalDur = parseFloat(
    execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${wavPath}"`)
      .toString().trim(),
  );

  const raw = execSync(
    `ffmpeg -i "${wavPath}" -af "silencedetect=noise=-35dB:duration=0.4" -f null - 2>&1`,
  ).toString();

  const silenceStarts = [...raw.matchAll(/silence_start: ([\d.]+)/g)].map(m => parseFloat(m[1]));
  const silenceEnds   = [...raw.matchAll(/silence_end: ([\d.]+)/g)].map(m => parseFloat(m[1]));

  const voiced: Array<[number, number]> = [];
  let cursor = 0;

  for (let i = 0; i < silenceStarts.length; i++) {
    if (silenceStarts[i] - cursor > 0.1) voiced.push([cursor, silenceStarts[i]]);
    cursor = silenceEnds[i] ?? totalDur;
  }
  if (totalDur - cursor > 0.1) voiced.push([cursor, totalDur]);

  return voiced;
}

// ---------------------------------------------------------------------------
// Extract one segment from a WAV file
// ---------------------------------------------------------------------------

function extractSegment(src: string, start: number, end: number, out: string): void {
  const totalDur = parseFloat(
    execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${src}"`)
      .toString().trim(),
  );
  const s = Math.max(0, start - 0.05);
  const e = Math.min(totalDur, end + 0.05);
  execSync(
    `ffmpeg -y -i "${src}" -ss ${s} -to ${e} -ar 44100 -ac 1 -sample_fmt s16 "${out}" 2>/dev/null`,
  );
}

// ---------------------------------------------------------------------------
// Process one phoneme: API call → WAV → split → name + sound files
// ---------------------------------------------------------------------------

async function processUnit(unitId: string): Promise<void> {
  const { nameText, soundText } = phonemeTextMap[unitId];
  const tmpMp3  = join(OUTPUT_DIR, `_tmp_${unitId}.mp3`);
  const fullWav  = join(OUTPUT_DIR, `${unitId}-full.wav`);
  const nameOut  = join(OUTPUT_DIR, `${unitId}-name.wav`);
  const soundOut = join(OUTPUT_DIR, `${unitId}-sound.wav`);

  process.stdout.write(`  ${unitId.padEnd(6)} `);

  const mp3 = await fetchMp3(buildSsml(unitId));
  writeFileSync(tmpMp3, mp3);
  execSync(`ffmpeg -y -i "${tmpMp3}" -ar 44100 -ac 1 -sample_fmt s16 "${fullWav}" 2>/dev/null`);
  unlinkSync(tmpMp3);

  const segments = findVoicedSegments(fullWav);

  // Expected structure: [intro, NAME, bridge, SOUND, outro?]
  if (segments.length < 4) {
    process.stdout.write(`⚠  ${segments.length} segments found (need 4) — SSML breaks may not have fired\n`);
    return;
  }

  extractSegment(fullWav, segments[1][0], segments[1][1], nameOut);
  extractSegment(fullWav, segments[3][0], segments[3][1], soundOut);

  const kb = (p: string) => Math.round(readFileSync(p).length / 1024);
  process.stdout.write(`name="${nameText}" (${kb(nameOut)}KB)  sound="${soundText}" (${kb(soundOut)}KB)  full=(${kb(fullWav)}KB)\n`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`\n🎙  ElevenLabs Phoneme Generator — sentence+split mode`);
  console.log(`   voice: ${voiceId}   stability: ${stability}   similarity: ${similarityBoost}\n`);

  if (mode === 'single') {
    if (!unitArg) { console.error('Usage: --unit <id>'); process.exit(1); }
    await processUnit(unitArg);

  } else {
    const units = mode === 'preview' ? previewUnits : Object.keys(phonemeTextMap);
    for (let i = 0; i < units.length; i++) {
      await processUnit(units[i]);
      if (i < units.length - 1) await delay(500);
    }
    console.log(`\n✅  Done — ${units.length * 2} clips in public/audio/phonics-units-new/`);
  }
}

main().catch(err => {
  console.error('\n❌ ', err.message);
  process.exit(1);
});
