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
  {
    id: 'quiz-c',
    unit: 'c',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 'c1', kind: 'word-start', options: ['cat', 'mat', 'sat'], correctAnswer: 'cat', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'c2', kind: 'word-start', options: ['cup', 'mop', 'sun'], correctAnswer: 'cup', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'c3', kind: 'word-start', options: ['cap', 'map', 'tap'], correctAnswer: 'cap', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'c4', kind: 'letter-sound', options: ['c', 'm', 'a'], correctAnswer: 'c', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
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
      { id: 't8', kind: 'letter-sound', options: ['m', 't', 'd'], correctAnswer: 't', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
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
      { id: 'm8', kind: 'letter-sound', options: ['s', 'm', 'd'], correctAnswer: 'm', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'm8b', kind: 'letter-sound', options: ['x', 'r', 'm'], correctAnswer: 'm', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
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
      { id: 'a6', kind: 'letter-sound', options: ['f', 'n', 'a'], correctAnswer: 'a', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'a7', kind: 'letter-sound', options: ['a', 's', 't'], correctAnswer: 'a', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
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
      { id: 'f1', kind: 'word-start', options: ['fan', 'man', 'ran'], correctAnswer: 'fan', phonemeFile: '/audio/phonics-units/f-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'f2', kind: 'word-start', options: ['fish', 'dish', 'wish'], correctAnswer: 'fish', phonemeFile: '/audio/phonics-units/f-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'f3', kind: 'word-start', options: ['fun', 'run', 'sun'], correctAnswer: 'fun', phonemeFile: '/audio/phonics-units/f-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'f4', kind: 'word-start', options: ['fog', 'log', 'dog'], correctAnswer: 'fog', phonemeFile: '/audio/phonics-units/f-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'f5', kind: 'letter-sound', options: ['f', 'm', 's'], correctAnswer: 'f', phonemeFile: '/audio/phonics-units/f-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'f6', kind: 'letter-sound', options: ['t', 'f', 'n'], correctAnswer: 'f', phonemeFile: '/audio/phonics-units/f-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'f7', kind: 'letter-sound', options: ['a', 'c', 'f'], correctAnswer: 'f', phonemeFile: '/audio/phonics-units/f-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-l',
    unit: 'l',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 'l1', kind: 'word-start', options: ['lap', 'map', 'tap'], correctAnswer: 'lap', phonemeFile: '/audio/phonics-units/l-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'l2', kind: 'word-start', options: ['log', 'fog', 'dog'], correctAnswer: 'log', phonemeFile: '/audio/phonics-units/l-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'l3', kind: 'word-start', options: ['lip', 'tip', 'sip'], correctAnswer: 'lip', phonemeFile: '/audio/phonics-units/l-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'l4', kind: 'word-start', options: ['lamp', 'ramp', 'camp'], correctAnswer: 'lamp', phonemeFile: '/audio/phonics-units/l-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'l5', kind: 'letter-sound', options: ['l', 'r', 'n'], correctAnswer: 'l', phonemeFile: '/audio/phonics-units/l-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'l6', kind: 'letter-sound', options: ['m', 'l', 'f'], correctAnswer: 'l', phonemeFile: '/audio/phonics-units/l-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'l7', kind: 'letter-sound', options: ['s', 'l', 't'], correctAnswer: 'l', phonemeFile: '/audio/phonics-units/l-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-n',
    unit: 'n',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 'n1', kind: 'word-start', options: ['nap', 'map', 'tap'], correctAnswer: 'nap', phonemeFile: '/audio/phonics-units/n-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'n2', kind: 'word-start', options: ['net', 'set', 'met'], correctAnswer: 'net', phonemeFile: '/audio/phonics-units/n-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'n3', kind: 'word-start', options: ['nod', 'rod', 'cod'], correctAnswer: 'nod', phonemeFile: '/audio/phonics-units/n-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'n4', kind: 'word-start', options: ['nut', 'cut', 'but'], correctAnswer: 'nut', phonemeFile: '/audio/phonics-units/n-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'n5', kind: 'letter-sound', options: ['n', 'm', 'r'], correctAnswer: 'n', phonemeFile: '/audio/phonics-units/n-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'n6', kind: 'letter-sound', options: ['t', 'n', 's'], correctAnswer: 'n', phonemeFile: '/audio/phonics-units/n-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'n7', kind: 'letter-sound', options: ['f', 'n', 'l'], correctAnswer: 'n', phonemeFile: '/audio/phonics-units/n-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-r',
    unit: 'r',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 'r1', kind: 'word-start', options: ['rat', 'cat', 'mat'], correctAnswer: 'rat', phonemeFile: '/audio/phonics-units/r-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'r2', kind: 'word-start', options: ['run', 'fun', 'sun'], correctAnswer: 'run', phonemeFile: '/audio/phonics-units/r-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'r3', kind: 'word-start', options: ['rod', 'cod', 'nod'], correctAnswer: 'rod', phonemeFile: '/audio/phonics-units/r-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'r4', kind: 'word-start', options: ['rim', 'him', 'dim'], correctAnswer: 'rim', phonemeFile: '/audio/phonics-units/r-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'r5', kind: 'letter-sound', options: ['r', 'l', 'n'], correctAnswer: 'r', phonemeFile: '/audio/phonics-units/r-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'r6', kind: 'letter-sound', options: ['m', 'r', 'f'], correctAnswer: 'r', phonemeFile: '/audio/phonics-units/r-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'r7', kind: 'letter-sound', options: ['s', 'r', 't'], correctAnswer: 'r', phonemeFile: '/audio/phonics-units/r-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-s',
    unit: 's',
    showIntro: true,
    activityType: ActivityType.LESSON,
    questions: [
      { id: 's5', kind: 'letter-sound', options: ['s', 'c', 'm'], correctAnswer: 's', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', showLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 's7', kind: 'letter-sound', options: ['f', 's', 'a'], correctAnswer: 's', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 's1', kind: 'word-start', options: ['sat', 'mat', 'cat'], correctAnswer: 'sat', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 's2', kind: 'word-start', options: ['sun', 'fun', 'run'], correctAnswer: 'sun', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
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
      { id: 'h3', kind: 'word-start', options: ['him', 'rim', 'dim'], correctAnswer: 'him', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h4', kind: 'word-start', options: ['hen', 'ten', 'men'], correctAnswer: 'hen', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h5', kind: 'letter-sound', options: ['h', 'm', 's'], correctAnswer: 'h', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'h6', kind: 'letter-sound', options: ['t', 'h', 'n'], correctAnswer: 'h', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'h7', kind: 'letter-sound', options: ['f', 'r', 'h'], correctAnswer: 'h', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',  skills: [SKILL_LETTER_SOUND_MAPPING] },
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
