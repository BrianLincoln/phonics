export enum ActivityType {
  LESSON = 'lesson',              // unified quiz: word-start + letter-sound + blend in one sequence
  MULTIPLE_CHOICE = 'multiple-choice', // legacy alias — prefer LESSON for new activities
  LEAF_PARADE = 'leaf-parade',
  BUILD_THE_WORD = 'build-the-word',
}

interface BaseQuestion {
  id: string;
  phonemeFile: string;
  promptFile: string;
  skills: Skill[];
}

interface WordStartQuestion extends BaseQuestion {
  kind: 'word-start';
  options: string[];
  correctAnswer: string;
}

interface LetterSoundQuestion extends BaseQuestion {
  kind: 'letter-sound';
  options: string[];
  correctAnswer: string;
  showLetter?: boolean;
}

// Blend question — letters shown in order with active-tile hint; tap in sequence
export interface BlendQuestion {
  kind: 'blend';
  id: string;
  word: string;
  letters: string[];        // e.g. ['s','a','t']
  wordAudioFile: string;    // played at start and on completion
  phonemeFiles: string[];   // one per letter, played on each tap
  promptFile: string;       // e.g. "tap the letters to build the word"
  skills: Skill[];
}

// Scrambled blend — letters preview in order while audio plays, then shuffle;
// no active-tile hint. Student must recall the order themselves.
export type ScrambledBlendQuestion = Omit<BlendQuestion, 'kind'> & { kind: 'scrambled-blend' };

// All question kinds that can appear in a LessonActivity
export type LessonQuestion = WordStartQuestion | LetterSoundQuestion | BlendQuestion | ScrambledBlendQuestion;

/** Legacy alias — MCQuestion still works for any code using it */
type MCQuestion = WordStartQuestion | LetterSoundQuestion;

/** Unified lesson: any mix of word-start, letter-sound, and blend questions */
export interface LessonActivity {
  id: string;
  unit: string;
  activityType: ActivityType.LESSON;
  showIntro?: boolean;
  questions: LessonQuestion[];
}

/** @deprecated Use LessonActivity instead */
export interface MultipleChoiceActivity {
  id: string;
  unit: string;
  activityType: ActivityType.MULTIPLE_CHOICE;
  showIntro?: boolean;
  questions: MCQuestion[];
}

export interface LeafParadeActivityType {
  id: string;
  unit: string;
  activityType: ActivityType.LEAF_PARADE;
  phonemeFile: string;
  promptFile: string;
  skills: Skill[];
  showIntro?: boolean;
  targetLetter: string;
  numberToComplete: number;
}

export type LeafParadeActivity = LeafParadeActivityType;

export interface BuildTheWordItem {
  word: string;
  letters: string[];
  wordAudioFile: string;
  phonemeFiles: string[];
}

export interface BuildTheWordActivity {
  id: string;
  unit: string;
  activityType: ActivityType.BUILD_THE_WORD;
  promptFile: string;
  words: BuildTheWordItem[];
  showIntro?: boolean;
  skills: Skill[];
}

export type Activity = LessonActivity | MultipleChoiceActivity | LeafParadeActivityType | BuildTheWordActivity;

// Skills union type and constants
export const SKILL_PHONEME_IDENTIFICATION = 'phoneme-identification' as const; // identifying the sound in a word
export const SKILL_LETTER_SOUND_MAPPING = 'letter-sound' as const;              // mapping a sound to a letter

export type Skill = typeof SKILL_PHONEME_IDENTIFICATION | typeof SKILL_LETTER_SOUND_MAPPING;

// Mapping question type 2 skill(s)
export const activityTypeToSkills: Record<ActivityType, Skill[]> = {
  [ActivityType.LESSON]: [SKILL_PHONEME_IDENTIFICATION, SKILL_LETTER_SOUND_MAPPING],
  [ActivityType.MULTIPLE_CHOICE]: [SKILL_PHONEME_IDENTIFICATION, SKILL_LETTER_SOUND_MAPPING],
  [ActivityType.LEAF_PARADE]: [SKILL_LETTER_SOUND_MAPPING],
  [ActivityType.BUILD_THE_WORD]: [SKILL_LETTER_SOUND_MAPPING],
};

export const activities: Activity[] = [
  // ── Zone 3 ───────────────────────────────────────────────────────────────
  {
    id: 'quiz-b',
    unit: 'b',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 'b1', kind: 'letter-sound', options: ['b', 'm', 's'], correctAnswer: 'b', phonemeFile: '/audio/phonics-units/b-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'b2', kind: 'letter-sound', options: ['t', 'b', 'n'], correctAnswer: 'b', phonemeFile: '/audio/phonics-units/b-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'b3', kind: 'letter-sound', options: ['b', 'p', 'f'], correctAnswer: 'b', phonemeFile: '/audio/phonics-units/b-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'b4', kind: 'word-start', options: ['bat', 'cat', 'mat'], correctAnswer: 'bat', phonemeFile: '/audio/phonics-units/b-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'b5', kind: 'word-start', options: ['bus', 'cup', 'sun'], correctAnswer: 'bus', phonemeFile: '/audio/phonics-units/b-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'b6', kind: 'word-start', options: ['big', 'man', 'top'], correctAnswer: 'big', phonemeFile: '/audio/phonics-units/b-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { kind: 'blend', id: 'blend-b-bat', word: 'bat', letters: ['b', 'a', 't'], wordAudioFile: '/audio/words/bat.wav', phonemeFiles: ['/audio/phonics-units/b-sound.wav', '/audio/phonics-units/a-sound.wav', '/audio/phonics-units/t-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'blend', id: 'blend-b-bus', word: 'bus', letters: ['b', 'u', 's'], wordAudioFile: '/audio/words/bus.wav', phonemeFiles: ['/audio/phonics-units/b-sound.wav', '/audio/phonics-units/u-sound.wav', '/audio/phonics-units/s-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'scrambled-blend', id: 'scrambled-b-bit', word: 'bit', letters: ['b', 'i', 't'], wordAudioFile: '/audio/words/bit.wav', phonemeFiles: ['/audio/phonics-units/b-sound.wav', '/audio/phonics-units/i-sound.wav', '/audio/phonics-units/t-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-o',
    unit: 'o',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 'o1', kind: 'letter-sound', options: ['o', 'a', 'm'], correctAnswer: 'o', phonemeFile: '/audio/phonics-units/o-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'o2', kind: 'letter-sound', options: ['s', 'o', 't'], correctAnswer: 'o', phonemeFile: '/audio/phonics-units/o-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'o3', kind: 'letter-sound', options: ['f', 'o', 'n'], correctAnswer: 'o', phonemeFile: '/audio/phonics-units/o-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'o4', kind: 'letter-sound', options: ['o', 'i', 'u'], correctAnswer: 'o', phonemeFile: '/audio/phonics-units/o-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'o5', kind: 'word-start', options: ['octopus', 'ant', 'sun'], correctAnswer: 'octopus', phonemeFile: '/audio/phonics-units/o-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'o6', kind: 'word-start', options: ['otter', 'snake', 'map'], correctAnswer: 'otter', phonemeFile: '/audio/phonics-units/o-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'o7', kind: 'word-start', options: ['cat', 'ox', 'pin'], correctAnswer: 'ox', phonemeFile: '/audio/phonics-units/o-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
    ],
  },
  {
    id: 'quiz-cp3',
    unit: 'b',
    activityType: ActivityType.LESSON,
    showIntro: false,
    questions: [
      { id: 'cp3-ls-b', kind: 'letter-sound', options: ['b', 'p', 'm'], correctAnswer: 'b', phonemeFile: '/audio/phonics-units/b-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'cp3-ls-o', kind: 'letter-sound', options: ['o', 'a', 'i'], correctAnswer: 'o', phonemeFile: '/audio/phonics-units/o-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'cp3-ls-c', kind: 'letter-sound', options: ['c', 's', 't'], correctAnswer: 'c', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'blend', id: 'cp3-blend-top', word: 'top', letters: ['t', 'o', 'p'], wordAudioFile: '/audio/words/top.wav', phonemeFiles: ['/audio/phonics-units/t-sound.wav', '/audio/phonics-units/o-sound.wav', '/audio/phonics-units/p-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'scrambled-blend', id: 'cp3-scrambled-mop', word: 'mop', letters: ['m', 'o', 'p'], wordAudioFile: '/audio/words/mop.wav', phonemeFiles: ['/audio/phonics-units/m-sound.wav', '/audio/phonics-units/o-sound.wav', '/audio/phonics-units/p-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'scrambled-blend', id: 'cp3-scrambled-cot', word: 'cot', letters: ['c', 'o', 't'], wordAudioFile: '/audio/words/cot.wav', phonemeFiles: ['/audio/phonics-units/c-sound.wav', '/audio/phonics-units/o-sound.wav', '/audio/phonics-units/t-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'scrambled-blend', id: 'cp3-scrambled-cob', word: 'cob', letters: ['c', 'o', 'b'], wordAudioFile: '/audio/words/cob.wav', phonemeFiles: ['/audio/phonics-units/c-sound.wav', '/audio/phonics-units/o-sound.wav', '/audio/phonics-units/b-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  // ── Zone 2 ───────────────────────────────────────────────────────────────
  {
    id: 'quiz-i',
    unit: 'i',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 'i1', kind: 'letter-sound', options: ['i', 'a', 'm'], correctAnswer: 'i', phonemeFile: '/audio/phonics-units/i-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'i2', kind: 'letter-sound', options: ['s', 'i', 't'], correctAnswer: 'i', phonemeFile: '/audio/phonics-units/i-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'i3', kind: 'letter-sound', options: ['f', 'i', 'n'], correctAnswer: 'i', phonemeFile: '/audio/phonics-units/i-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'i5', kind: 'word-start', options: ['igloo', 'ant', 'sun'], correctAnswer: 'igloo', phonemeFile: '/audio/phonics-units/i-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'i6', kind: 'word-start', options: ['insect', 'snake', 'top'], correctAnswer: 'insect', phonemeFile: '/audio/phonics-units/i-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'i7', kind: 'word-start', options: ['cat', 'itch', 'mop'], correctAnswer: 'itch', phonemeFile: '/audio/phonics-units/i-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { kind: 'blend', id: 'blend-i-big', word: 'big', letters: ['b', 'i', 'g'], wordAudioFile: '/audio/words/big.wav', phonemeFiles: ['/audio/phonics-units/b-sound.wav', '/audio/phonics-units/i-sound.wav', '/audio/phonics-units/g-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'scrambled-blend', id: 'scrambled-i-sit', word: 'sit', letters: ['s', 'i', 't'], wordAudioFile: '/audio/words/sit.wav', phonemeFiles: ['/audio/phonics-units/s-sound.wav', '/audio/phonics-units/i-sound.wav', '/audio/phonics-units/t-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-p',
    unit: 'p',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 'p1', kind: 'letter-sound', options: ['n', 's', 'p'], correctAnswer: 'p', phonemeFile: '/audio/phonics-units/p-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'p2', kind: 'letter-sound', options: ['t', 'p', 'n'], correctAnswer: 'p', phonemeFile: '/audio/phonics-units/p-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'p3', kind: 'letter-sound', options: ['p', 'r', 'f'], correctAnswer: 'p', phonemeFile: '/audio/phonics-units/p-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'p4', kind: 'word-start', options: ['pig', 'man', 'sun'], correctAnswer: 'pig', phonemeFile: '/audio/phonics-units/p-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'p5', kind: 'word-start', options: ['pan', 'man', 'sat'], correctAnswer: 'pan', phonemeFile: '/audio/phonics-units/p-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'p6', kind: 'word-start', options: ['pot', 'cat', 'rat'], correctAnswer: 'pot', phonemeFile: '/audio/phonics-units/p-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { kind: 'blend', id: 'blend-p-pin', word: 'pin', letters: ['p', 'i', 'n'], wordAudioFile: '/audio/words/pin.wav', phonemeFiles: ['/audio/phonics-units/p-sound.wav', '/audio/phonics-units/i-sound.wav', '/audio/phonics-units/n-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'blend', id: 'blend-p-tip', word: 'tip', letters: ['t', 'i', 'p'], wordAudioFile: '/audio/words/tip.wav', phonemeFiles: ['/audio/phonics-units/t-sound.wav', '/audio/phonics-units/i-sound.wav', '/audio/phonics-units/p-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'scrambled-blend', id: 'scrambled-p-sit', word: 'sit', letters: ['s', 'i', 't'], wordAudioFile: '/audio/words/sit.wav', phonemeFiles: ['/audio/phonics-units/s-sound.wav', '/audio/phonics-units/i-sound.wav', '/audio/phonics-units/t-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-cp2',
    unit: 'i',
    activityType: ActivityType.LESSON,
    showIntro: false,
    questions: [
      { id: 'cp2-ls-i', kind: 'letter-sound', options: ['i', 'a', 'u'], correctAnswer: 'i', phonemeFile: '/audio/phonics-units/i-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'cp2-ls-n', kind: 'letter-sound', options: ['n', 'm', 'r'], correctAnswer: 'n', phonemeFile: '/audio/phonics-units/n-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'cp2-ls-p', kind: 'letter-sound', options: ['p', 't', 's'], correctAnswer: 'p', phonemeFile: '/audio/phonics-units/p-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'blend', id: 'cp2-blend-pin', word: 'pin', letters: ['p', 'i', 'n'], wordAudioFile: '/audio/words/pin.wav', phonemeFiles: ['/audio/phonics-units/p-sound.wav', '/audio/phonics-units/i-sound.wav', '/audio/phonics-units/n-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'scrambled-blend', id: 'cp2-scrambled-tin', word: 'tin', letters: ['t', 'i', 'n'], wordAudioFile: '/audio/words/tin.wav', phonemeFiles: ['/audio/phonics-units/t-sound.wav', '/audio/phonics-units/i-sound.wav', '/audio/phonics-units/n-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'scrambled-blend', id: 'cp2-scrambled-nap', word: 'nap', letters: ['n', 'a', 'p'], wordAudioFile: '/audio/words/nap.wav', phonemeFiles: ['/audio/phonics-units/n-sound.wav', '/audio/phonics-units/a-sound.wav', '/audio/phonics-units/p-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'scrambled-blend', id: 'cp2-scrambled-sit', word: 'sit', letters: ['s', 'i', 't'], wordAudioFile: '/audio/words/sit.wav', phonemeFiles: ['/audio/phonics-units/s-sound.wav', '/audio/phonics-units/i-sound.wav', '/audio/phonics-units/t-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  // ── Zone 1 checkpoint ────────────────────────────────────────────────────
  // One hidden letter-sound per phoneme (recall, not recognition), one unscrambled
  // blend to scaffold flow, then three scrambled blends covering all section letters.
  {
    id: 'quiz-cp1',
    unit: 'm',
    activityType: ActivityType.LESSON,
    showIntro: false,
    questions: [
      { id: 'cp1-ls-m', kind: 'letter-sound', options: ['m', 's', 't'], correctAnswer: 'm', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'cp1-ls-a', kind: 'letter-sound', options: ['a', 'm', 't'], correctAnswer: 'a', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'cp1-ls-s', kind: 'letter-sound', options: ['s', 't', 'a'], correctAnswer: 's', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'cp1-ls-t', kind: 'letter-sound', options: ['t', 'm', 's'], correctAnswer: 't', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'blend', id: 'cp1-blend-sat', word: 'sat', letters: ['s', 'a', 't'], wordAudioFile: '/audio/words/sat.wav', phonemeFiles: ['/audio/phonics-units/s-sound.wav', '/audio/phonics-units/a-sound.wav', '/audio/phonics-units/t-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'scrambled-blend', id: 'cp1-scrambled-am', word: 'am', letters: ['a', 'm'], wordAudioFile: '/audio/words/am.wav', phonemeFiles: ['/audio/phonics-units/a-sound.wav', '/audio/phonics-units/m-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'scrambled-blend', id: 'cp1-scrambled-mat', word: 'mat', letters: ['m', 'a', 't'], wordAudioFile: '/audio/words/mat.wav', phonemeFiles: ['/audio/phonics-units/m-sound.wav', '/audio/phonics-units/a-sound.wav', '/audio/phonics-units/t-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'scrambled-blend', id: 'cp1-scrambled-sat', word: 'sat', letters: ['s', 'a', 't'], wordAudioFile: '/audio/words/sat.wav', phonemeFiles: ['/audio/phonics-units/s-sound.wav', '/audio/phonics-units/a-sound.wav', '/audio/phonics-units/t-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-c',
    unit: 'c',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 'c4', kind: 'letter-sound', options: ['c', 'm', 'a'], correctAnswer: 'c', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'c5', kind: 'letter-sound', options: ['s', 'c', 't'], correctAnswer: 'c', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'c6', kind: 'letter-sound', options: ['b', 'c', 'n'], correctAnswer: 'c', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'c1', kind: 'word-start', options: ['cat', 'mat', 'sat'], correctAnswer: 'cat', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'c2', kind: 'word-start', options: ['cup', 'mop', 'sun'], correctAnswer: 'cup', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'c3', kind: 'word-start', options: ['cap', 'map', 'sat'], correctAnswer: 'cap', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { kind: 'blend', id: 'blend-c-cat', word: 'cat', letters: ['c', 'a', 't'], wordAudioFile: '/audio/words/cat.wav', phonemeFiles: ['/audio/phonics-units/c-sound.wav', '/audio/phonics-units/a-sound.wav', '/audio/phonics-units/t-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'blend', id: 'blend-c-cot', word: 'cot', letters: ['c', 'o', 't'], wordAudioFile: '/audio/words/cot.wav', phonemeFiles: ['/audio/phonics-units/c-sound.wav', '/audio/phonics-units/o-sound.wav', '/audio/phonics-units/t-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'scrambled-blend', id: 'scrambled-c-cab', word: 'cab', letters: ['c', 'a', 'b'], wordAudioFile: '/audio/words/cab.wav', phonemeFiles: ['/audio/phonics-units/c-sound.wav', '/audio/phonics-units/a-sound.wav', '/audio/phonics-units/b-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-t',
    unit: 't',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 't6', kind: 'letter-sound', options: ['t', 'm', 'a'], correctAnswer: 't', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 't7', kind: 'letter-sound', options: ['a', 't', 's'], correctAnswer: 't', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 't8', kind: 'letter-sound', options: ['m', 't', 'd'], correctAnswer: 't', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 't1', kind: 'word-start', options: ['top', 'hop', 'mop'], correctAnswer: 'top', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't2', kind: 'word-start', options: ['tap', 'map', 'nap'], correctAnswer: 'tap', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { kind: 'blend', id: 'blend-t-sat', word: 'sat', letters: ['s', 'a', 't'], wordAudioFile: '/audio/words/sat.wav', phonemeFiles: ['/audio/phonics-units/s-sound.wav', '/audio/phonics-units/a-sound.wav', '/audio/phonics-units/t-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'blend', id: 'blend-t-mat', word: 'mat', letters: ['m', 'a', 't'], wordAudioFile: '/audio/words/mat.wav', phonemeFiles: ['/audio/phonics-units/m-sound.wav', '/audio/phonics-units/a-sound.wav', '/audio/phonics-units/t-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'scrambled-blend', id: 'scrambled-mat', word: 'mat', letters: ['m', 'a', 't'], wordAudioFile: '/audio/words/mat.wav', phonemeFiles: ['/audio/phonics-units/m-sound.wav', '/audio/phonics-units/a-sound.wav', '/audio/phonics-units/t-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-m',
    unit: 'm',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [

      { id: 'm6', kind: 'letter-sound', options: ['c', 's', 'm'], correctAnswer: 'm', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'm7', kind: 'letter-sound', options: ['m', 't', 'a'], correctAnswer: 'm', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'm8', kind: 'letter-sound', options: ['s', 'm', 'd'], correctAnswer: 'm', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'm8b', kind: 'letter-sound', options: ['x', 'r', 'm'], correctAnswer: 'm', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'm1', kind: 'word-start', options: ['cat', 'map', 'sun'], correctAnswer: 'map', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm2', kind: 'word-start', options: ['mud', 'dog', 'sun'], correctAnswer: 'mud', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm3', kind: 'word-start', options: ['hat', 'milk', 'pig'], correctAnswer: 'milk', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
    ],
  },
  {
    id: 'quiz-a',
    unit: 'a',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 'a4', kind: 'letter-sound', options: ['a', 'c', 'm'], correctAnswer: 'a', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'a5', kind: 'letter-sound', options: ['s', 'a', 't'], correctAnswer: 'a', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'a6', kind: 'letter-sound', options: ['f', 'n', 'a'], correctAnswer: 'a', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'a7', kind: 'letter-sound', options: ['a', 's', 't'], correctAnswer: 'a', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'a1', kind: 'word-start', options: ['cat', 'ant', 'sun'], correctAnswer: 'ant', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'a2', kind: 'word-start', options: ['mop', 'top', 'apple'], correctAnswer: 'apple', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'a3', kind: 'word-start', options: ['add', 'big', 'cup'], correctAnswer: 'add', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },

    ],
  },
  {
    id: 'quiz-f',
    unit: 'f',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 'f1', kind: 'word-start', options: ['fan', 'man', 'map'], correctAnswer: 'fan', phonemeFile: '/audio/phonics-units/f-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'f2', kind: 'word-start', options: ['fish', 'cat', 'sun'], correctAnswer: 'fish', phonemeFile: '/audio/phonics-units/f-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'f3', kind: 'word-start', options: ['fun', 'sun', 'map'], correctAnswer: 'fun', phonemeFile: '/audio/phonics-units/f-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'f4', kind: 'word-start', options: ['fog', 'dog', 'top'], correctAnswer: 'fog', phonemeFile: '/audio/phonics-units/f-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'f5', kind: 'letter-sound', options: ['f', 'm', 's'], correctAnswer: 'f', phonemeFile: '/audio/phonics-units/f-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'f6', kind: 'letter-sound', options: ['t', 'f', 'n'], correctAnswer: 'f', phonemeFile: '/audio/phonics-units/f-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'f7', kind: 'letter-sound', options: ['a', 'c', 'f'], correctAnswer: 'f', phonemeFile: '/audio/phonics-units/f-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-l',
    unit: 'l',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 'l1', kind: 'word-start', options: ['lap', 'map', 'sat'], correctAnswer: 'lap', phonemeFile: '/audio/phonics-units/l-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'l2', kind: 'word-start', options: ['log', 'dog', 'top'], correctAnswer: 'log', phonemeFile: '/audio/phonics-units/l-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'l3', kind: 'word-start', options: ['lip', 'tip', 'sat'], correctAnswer: 'lip', phonemeFile: '/audio/phonics-units/l-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'l4', kind: 'word-start', options: ['lamp', 'map', 'top'], correctAnswer: 'lamp', phonemeFile: '/audio/phonics-units/l-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'l5', kind: 'letter-sound', options: ['l', 'r', 'n'], correctAnswer: 'l', phonemeFile: '/audio/phonics-units/l-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'l6', kind: 'letter-sound', options: ['m', 'l', 'f'], correctAnswer: 'l', phonemeFile: '/audio/phonics-units/l-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'l7', kind: 'letter-sound', options: ['s', 'l', 't'], correctAnswer: 'l', phonemeFile: '/audio/phonics-units/l-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-n',
    unit: 'n',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 'n6', kind: 'letter-sound', options: ['n', 'm', 's'], correctAnswer: 'n', phonemeFile: '/audio/phonics-units/n-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'n7', kind: 'letter-sound', options: ['t', 'n', 'a'], correctAnswer: 'n', phonemeFile: '/audio/phonics-units/n-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'n5', kind: 'letter-sound', options: ['m', 'n', 'r'], correctAnswer: 'n', phonemeFile: '/audio/phonics-units/n-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'n1', kind: 'word-start', options: ['nap', 'map', 'sat'], correctAnswer: 'nap', phonemeFile: '/audio/phonics-units/n-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'n2', kind: 'word-start', options: ['net', 'man', 'top'], correctAnswer: 'net', phonemeFile: '/audio/phonics-units/n-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { kind: 'blend', id: 'blend-n-nap', word: 'nap', letters: ['n', 'a', 'p'], wordAudioFile: '/audio/words/nap.wav', phonemeFiles: ['/audio/phonics-units/n-sound.wav', '/audio/phonics-units/a-sound.wav', '/audio/phonics-units/p-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'scrambled-blend', id: 'blend-n-man', word: 'man', letters: ['m', 'a', 'n'], wordAudioFile: '/audio/words/man.wav', phonemeFiles: ['/audio/phonics-units/m-sound.wav', '/audio/phonics-units/a-sound.wav', '/audio/phonics-units/n-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'scrambled-blend', id: 'scrambled-n-tin', word: 'tin', letters: ['t', 'i', 'n'], wordAudioFile: '/audio/words/tin.wav', phonemeFiles: ['/audio/phonics-units/t-sound.wav', '/audio/phonics-units/i-sound.wav', '/audio/phonics-units/n-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-r',
    unit: 'r',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 'r1', kind: 'word-start', options: ['rat', 'cat', 'mat'], correctAnswer: 'rat', phonemeFile: '/audio/phonics-units/r-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'r2', kind: 'word-start', options: ['run', 'sun', 'map'], correctAnswer: 'run', phonemeFile: '/audio/phonics-units/r-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'r3', kind: 'word-start', options: ['rod', 'man', 'cat'], correctAnswer: 'rod', phonemeFile: '/audio/phonics-units/r-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'r4', kind: 'word-start', options: ['rim', 'man', 'sun'], correctAnswer: 'rim', phonemeFile: '/audio/phonics-units/r-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'r5', kind: 'letter-sound', options: ['r', 'l', 'n'], correctAnswer: 'r', phonemeFile: '/audio/phonics-units/r-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'r6', kind: 'letter-sound', options: ['m', 'r', 'f'], correctAnswer: 'r', phonemeFile: '/audio/phonics-units/r-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'r7', kind: 'letter-sound', options: ['s', 'r', 't'], correctAnswer: 'r', phonemeFile: '/audio/phonics-units/r-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-s',
    unit: 's',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 's5', kind: 'letter-sound', options: ['s', 'c', 'm'], correctAnswer: 's', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 's7', kind: 'letter-sound', options: ['f', 's', 'a'], correctAnswer: 's', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 's1', kind: 'word-start', options: ['sat', 'mat', 'cat'], correctAnswer: 'sat', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 's2', kind: 'word-start', options: ['sun', 'cat', 'map'], correctAnswer: 'sun', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { kind: 'blend', id: 'blend-sat', word: 'sat', letters: ['s', 'a', 't'], wordAudioFile: '/audio/words/sat.wav', phonemeFiles: ['/audio/phonics-units/s-sound.wav', '/audio/phonics-units/a-sound.wav', '/audio/phonics-units/t-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { kind: 'blend', id: 'blend-mat', word: 'mat', letters: ['m', 'a', 't'], wordAudioFile: '/audio/words/mat.wav', phonemeFiles: ['/audio/phonics-units/m-sound.wav', '/audio/phonics-units/a-sound.wav', '/audio/phonics-units/t-sound.wav'], promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-h',
    unit: 'h',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 'h1', kind: 'word-start', options: ['hat', 'cat', 'mat'], correctAnswer: 'hat', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h2', kind: 'word-start', options: ['hop', 'top', 'mop'], correctAnswer: 'hop', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h3', kind: 'word-start', options: ['him', 'man', 'top'], correctAnswer: 'him', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h4', kind: 'word-start', options: ['hen', 'ten', 'map'], correctAnswer: 'hen', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h5', kind: 'letter-sound', options: ['h', 'm', 's'], correctAnswer: 'h', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'h6', kind: 'letter-sound', options: ['t', 'h', 'n'], correctAnswer: 'h', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'h7', kind: 'letter-sound', options: ['f', 'r', 'h'], correctAnswer: 'h', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-ant-leaf-demo',
    unit: 'c',
    activityType: ActivityType.LEAF_PARADE,
    phonemeFile: '/audio/phonics-units/c-sound.wav',
    promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',
    skills: [SKILL_LETTER_SOUND_MAPPING],
    targetLetter: 'c',
    numberToComplete: 2,
  },
  // Standalone Build the Word activities (used by blend-endless mode)
  {
    id: 'build-hat',
    unit: 'h',
    activityType: ActivityType.BUILD_THE_WORD,
    skills: [SKILL_LETTER_SOUND_MAPPING],
    promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav',
    words: [
      {
        word: 'hat',
        letters: ['h', 'a', 't'],
        wordAudioFile: '/audio/words/hat.wav',
        phonemeFiles: [
          '/audio/phonics-units/h-sound.wav',
          '/audio/phonics-units/a-sound.wav',
          '/audio/phonics-units/t-sound.wav',
        ],
      },
    ],
  },
  {
    id: 'build-rat',
    unit: 'r',
    activityType: ActivityType.BUILD_THE_WORD,
    skills: [SKILL_LETTER_SOUND_MAPPING],
    promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav',
    words: [
      {
        word: 'rat',
        letters: ['r', 'a', 't'],
        wordAudioFile: '/audio/words/rat.wav',
        phonemeFiles: [
          '/audio/phonics-units/r-sound.wav',
          '/audio/phonics-units/a-sound.wav',
          '/audio/phonics-units/t-sound.wav',
        ],
      },
    ],
  },
  {
    id: 'build-bat',
    unit: 'b',
    activityType: ActivityType.BUILD_THE_WORD,
    skills: [SKILL_LETTER_SOUND_MAPPING],
    promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav',
    words: [
      {
        word: 'bat',
        letters: ['b', 'a', 't'],
        wordAudioFile: '/audio/words/bat.wav',
        phonemeFiles: [
          '/audio/phonics-units/b-sound.wav',
          '/audio/phonics-units/a-sound.wav',
          '/audio/phonics-units/t-sound.wav',
        ],
      },
    ],
  },
  {
    id: 'build-sun',
    unit: 's',
    activityType: ActivityType.BUILD_THE_WORD,
    skills: [SKILL_LETTER_SOUND_MAPPING],
    promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav',
    words: [
      {
        word: 'sun',
        letters: ['s', 'u', 'n'],
        wordAudioFile: '/audio/words/sun.wav',
        phonemeFiles: [
          '/audio/phonics-units/s-sound.wav',
          '/audio/phonics-units/u-sound.wav',
          '/audio/phonics-units/n-sound.wav',
        ],
      },
    ],
  },
  {
    id: 'build-red',
    unit: 'r',
    activityType: ActivityType.BUILD_THE_WORD,
    skills: [SKILL_LETTER_SOUND_MAPPING],
    promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav',
    words: [
      {
        word: 'red',
        letters: ['r', 'e', 'd'],
        wordAudioFile: '/audio/words/red.wav',
        phonemeFiles: [
          '/audio/phonics-units/r-sound.wav',
          '/audio/phonics-units/e-sound.wav',
          '/audio/phonics-units/d-sound.wav',
        ],
      },
    ],
  },
  {
    id: 'build-bed',
    unit: 'b',
    activityType: ActivityType.BUILD_THE_WORD,
    skills: [SKILL_LETTER_SOUND_MAPPING],
    promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav',
    words: [
      {
        word: 'bed',
        letters: ['b', 'e', 'd'],
        wordAudioFile: '/audio/words/bed.wav',
        phonemeFiles: [
          '/audio/phonics-units/b-sound.wav',
          '/audio/phonics-units/e-sound.wav',
          '/audio/phonics-units/d-sound.wav',
        ],
      },
    ],
  },
  {
    id: 'build-bus',
    unit: 'b',
    activityType: ActivityType.BUILD_THE_WORD,
    skills: [SKILL_LETTER_SOUND_MAPPING],
    promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav',
    words: [
      {
        word: 'bus',
        letters: ['b', 'u', 's'],
        wordAudioFile: '/audio/words/bus.wav',
        phonemeFiles: [
          '/audio/phonics-units/b-sound.wav',
          '/audio/phonics-units/u-sound.wav',
          '/audio/phonics-units/s-sound.wav',
        ],
      },
    ],
  },
];
