export enum ActivityType {
  MULTIPLE_CHOICE = 'multiple-choice',
  LEAF_PARADE = 'leaf-parade',
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
  hideLetter?: boolean;
}

type MCQuestion = WordStartQuestion | LetterSoundQuestion;

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

export type Activity = MultipleChoiceActivity | LeafParadeActivityType;

// Skills union type and constants
export const SKILL_PHONEME_IDENTIFICATION = 'phoneme-identification' as const; // identifying the sound in a word
export const SKILL_LETTER_SOUND_MAPPING = 'letter-sound' as const;              // mapping a sound to a letter

export type Skill = typeof SKILL_PHONEME_IDENTIFICATION | typeof SKILL_LETTER_SOUND_MAPPING;

// Mapping question type 2 skill(s)
export const activityTypeToSkills: Record<ActivityType, Skill[]> = {
  [ActivityType.MULTIPLE_CHOICE]: [SKILL_PHONEME_IDENTIFICATION, SKILL_LETTER_SOUND_MAPPING],
  [ActivityType.LEAF_PARADE]: [SKILL_LETTER_SOUND_MAPPING],
};

export const activities: Activity[] = [
  {
    id: 'quiz-c',
    unit: 'c',
    showIntro: true,
    activityType: ActivityType.MULTIPLE_CHOICE,
    questions: [
      { id: 'c1', kind: 'word-start', options: ['cat', 'mat', 'sat'], correctAnswer: 'cat', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'c2', kind: 'word-start', options: ['cup', 'mop', 'sun'], correctAnswer: 'cup', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'c3', kind: 'word-start', options: ['cap', 'map', 'tap'], correctAnswer: 'cap', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'c4', kind: 'letter-sound', options: ['c', 'm', 'a'], correctAnswer: 'c', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-t',
    unit: 't',
    showIntro: true,
    activityType: ActivityType.MULTIPLE_CHOICE,
    questions: [
      { id: 't1', kind: 'word-start', options: ['top', 'hop', 'mop'], correctAnswer: 'top', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't2', kind: 'word-start', options: ['tap', 'map', 'nap'], correctAnswer: 'tap', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't3', kind: 'word-start', options: ['ten', 'men', 'hen'], correctAnswer: 'ten', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't4', kind: 'word-start', options: ['tin', 'win', 'pin'], correctAnswer: 'tin', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't5', kind: 'word-start', options: ['tag', 'bag', 'rag'], correctAnswer: 'tag', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't6', kind: 'letter-sound', options: ['t', 'm', 'a'], correctAnswer: 't', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 't7', kind: 'letter-sound', options: ['a', 't', 's'], correctAnswer: 't', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 't8', kind: 'letter-sound', options: ['m', 't', 'd'], correctAnswer: 't', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-m',
    unit: 'm',
    activityType: ActivityType.MULTIPLE_CHOICE,
    questions: [
      { id: 'm1', kind: 'word-start', options: ['cat', 'map', 'sun'], correctAnswer: 'map', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm2', kind: 'word-start', options: ['mud', 'dog', 'sun'], correctAnswer: 'mud', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm3', kind: 'word-start', options: ['milk', 'hat', 'pig'], correctAnswer: 'milk', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm4', kind: 'word-start', options: ['man', 'dog', 'sun'], correctAnswer: 'man', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm5', kind: 'word-start', options: ['mat', 'cat', 'bat'], correctAnswer: 'mat', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm6', kind: 'letter-sound', options: ['c', 's', 'm'], correctAnswer: 'm', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'm7', kind: 'letter-sound', options: ['m', 't', 'a'], correctAnswer: 'm', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'm8', kind: 'letter-sound', options: ['s', 'm', 'd'], correctAnswer: 'm', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, skills: [SKILL_LETTER_SOUND_MAPPING] },
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
];
