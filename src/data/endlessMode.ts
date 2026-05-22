import { SKILL_LETTER_SOUND_MAPPING, SKILL_PHONEME_IDENTIFICATION, Skill } from './activities';

const WORD_BANK: Record<string, string[]> = {
  a: ['ant', 'apple', 'add', 'ax', 'arm'],
  c: ['cat', 'cup', 'cap', 'cod', 'cot'],
  f: ['fan', 'fish', 'fun', 'fog', 'fig'],
  h: ['hat', 'hop', 'him', 'hen', 'hit'],
  l: ['lap', 'log', 'lip', 'lamp', 'lid'],
  m: ['map', 'mud', 'milk', 'man', 'mat'],
  n: ['nap', 'net', 'nod', 'nut', 'nib'],
  r: ['rat', 'run', 'rod', 'rim', 'rip'],
  s: ['sat', 'sun', 'sip', 'sock', 'set'],
  t: ['top', 'tap', 'ten', 'tin', 'tag'],
};

const LETTERS = Object.keys(WORD_BANK);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function otherLetters(unit: string, count: number): string[] {
  const pool = LETTERS.filter(l => l !== unit);
  const result: string[] = [];
  const used = new Set<string>();
  while (result.length < count) {
    const l = pick(pool);
    if (!used.has(l)) { used.add(l); result.push(l); }
  }
  return result;
}

export interface EndlessQuestion {
  id: string;
  kind: 'word-start' | 'letter-sound';
  options: string[];
  correctAnswer: string;
  phonemeFile: string;
  promptFile: string;
  hideLetter?: boolean;
  skills: Skill[];
}

export function generateQuestion(): { question: EndlessQuestion; unit: string } {
  const unit = pick(LETTERS);
  const kind = Math.random() < 0.6 ? 'word-start' : 'letter-sound';
  const id = `endless-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const phonemeFile = `/audio/phonics-units/${unit}-sound.wav`;

  if (kind === 'word-start') {
    const correctAnswer = pick(WORD_BANK[unit]);
    const distractorLetters = otherLetters(unit, 2);
    const distractors = distractorLetters.map(l => pick(WORD_BANK[l]));
    const options = shuffle([correctAnswer, ...distractors]);
    return {
      unit,
      question: {
        id,
        kind: 'word-start',
        options,
        correctAnswer,
        phonemeFile,
        promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav',
        skills: [SKILL_PHONEME_IDENTIFICATION],
      },
    };
  } else {
    const distractors = otherLetters(unit, 2);
    const options = shuffle([unit, ...distractors]);
    return {
      unit,
      question: {
        id,
        kind: 'letter-sound',
        options,
        correctAnswer: unit,
        phonemeFile,
        promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',
        hideLetter: true,
        skills: [SKILL_LETTER_SOUND_MAPPING],
      },
    };
  }
}
