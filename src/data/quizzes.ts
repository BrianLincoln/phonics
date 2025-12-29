// ...existing code...
// Skills union type and constants
export const SKILL_PHONEME_IDENTIFICATION = 'phoneme-identification' as const; // identifying the sound in a word
export const SKILL_LETTER_SOUND_MAPPING = 'letter-sound' as const;              // mapping a sound to a letter

export type Skill = typeof SKILL_PHONEME_IDENTIFICATION | typeof SKILL_LETTER_SOUND_MAPPING;

// Question types
export const QuestionType = {
  MULTIPLE_CHOICE_WORD_START: 'multiple-choice-word-start',
  MULTIPLE_CHOICE_PHONEME: 'multiple-choice-phoneme',
  LEAF_PHONEME: 'leaf-phoneme',
} as const;
export type QuestionType = typeof QuestionType[keyof typeof QuestionType];

// Mapping question type 2 skill(s)
export const questionTypeToSkills: Record<QuestionType, Skill[]> = {
  [QuestionType.MULTIPLE_CHOICE_WORD_START]: [SKILL_PHONEME_IDENTIFICATION],
  [QuestionType.MULTIPLE_CHOICE_PHONEME]: [SKILL_LETTER_SOUND_MAPPING],
  [QuestionType.LEAF_PHONEME]: [SKILL_LETTER_SOUND_MAPPING],
};



// Discriminated union for question types
interface BaseQuestion {
  id: string;
  questionType: QuestionType;
  skills: Skill[];
}

export interface LeafPhonemeQuestion extends BaseQuestion {
  questionType: typeof QuestionType.LEAF_PHONEME;
  targetLetter: string; // always required for this type
  phonemeFile: string;
  promptFile: string;
}

export interface MultipleChoiceWordStartQuestion extends BaseQuestion {
  questionType: typeof QuestionType.MULTIPLE_CHOICE_WORD_START;
  options: string[];
  correctAnswer: string;
  phonemeFile: string;
  promptFile: string;
}

export interface MultipleChoicePhonemeQuestion extends BaseQuestion {
  questionType: typeof QuestionType.MULTIPLE_CHOICE_PHONEME;
  options: string[];
  correctAnswer: string;
  phonemeFile: string;
  promptFile: string;
  hideLetter?: boolean;
}

export type QuizQuestion = LeafPhonemeQuestion | MultipleChoiceWordStartQuestion | MultipleChoicePhonemeQuestion;


export interface Quiz {
  id: string;
  unit: string;
  questions: QuizQuestion[];
  showLetterIntro?: boolean;
}

export const quizzes: Quiz[] = [
  {
    id: 'quiz-c',
    unit: 'c',
    showLetterIntro: true,
    questions: [
      { id: 'c1', options: ['cat', 'mat', 'sat'], correctAnswer: 'cat', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'c2', options: ['cup', 'mop', 'sun'], correctAnswer: 'cup', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'c3', options: ['cap', 'map', 'tap'], correctAnswer: 'cap', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'c4', options: ['c', 'm', 'a'], correctAnswer: 'c', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      // { id: 'c5',options: ['a', 'c', 's'], correctAnswer: 'c', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      // { id: 'c6',options: ['m', 'c', 'd'], correctAnswer: 'c', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-t',
    unit: 't',
    showLetterIntro: true,
    questions: [
      { id: 't1', options: ['top', 'hop', 'mop'], correctAnswer: 'top', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't2', options: ['tap', 'map', 'nap'], correctAnswer: 'tap', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't3', options: ['ten', 'men', 'hen'], correctAnswer: 'ten', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't4', options: ['tin', 'win', 'pin'], correctAnswer: 'tin', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't5', options: ['tag', 'bag', 'rag'], correctAnswer: 'tag', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't6', options: ['t', 'm', 'a'], correctAnswer: 't', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 't7', options: ['a', 't', 's'], correctAnswer: 't', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 't8', options: ['m', 't', 'd'], correctAnswer: 't', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-m',
    unit: 'm',
    questions: [
      { id: 'm1', options: ['cat', 'map', 'sun'], correctAnswer: 'map', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm2', options: ['mud', 'dog', 'sun'], correctAnswer: 'mud', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm3', options: ['milk', 'hat', 'pig'], correctAnswer: 'milk', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm4', options: ['man', 'dog', 'sun'], correctAnswer: 'man', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm5', options: ['mat', 'cat', 'bat'], correctAnswer: 'mat', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm6', options: ['c', 's', 'm'], correctAnswer: 'm', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'm7', options: ['m', 't', 'a'], correctAnswer: 'm', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'm8', options: ['s', 'm', 'd'], correctAnswer: 'm', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-s',
    unit: 's',
    questions: [
      // 5 word questions
      { id: 's1', options: ['sun', 'cat', 'dog'], correctAnswer: 'sun', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 's2', options: ['sock', 'rock', 'clock'], correctAnswer: 'sock', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 's3', options: ['sit', 'kit', 'hit'], correctAnswer: 'sit', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 's4', options: ['sand', 'hand', 'band'], correctAnswer: 'sand', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 's5', options: ['sip', 'tip', 'lip'], correctAnswer: 'sip', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      // 3 letter questions
      { id: 's6', options: ['s', 'm', 'a'], correctAnswer: 's', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 's7', options: ['t', 's', 'm'], correctAnswer: 's', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 's8', options: ['a', 's', 'd'], correctAnswer: 's', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-h',
    unit: 'h',
    questions: [
      // 5 word questions
      { id: 'h1', options: ['hat', 'cat', 'bat'], correctAnswer: 'hat', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h2', options: ['hop', 'mop', 'top'], correctAnswer: 'hop', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h3', options: ['hen', 'pen', 'ten'], correctAnswer: 'hen', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h4', options: ['hill', 'pill', 'fill'], correctAnswer: 'hill', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h5', options: ['hug', 'bug', 'rug'], correctAnswer: 'hug', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      // 3 letter questions
      { id: 'h6', options: ['h', 'm', 'a'], correctAnswer: 'h', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'h7', options: ['a', 'h', 's'], correctAnswer: 'h', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'h8', options: ['m', 'h', 'd'], correctAnswer: 'h', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-a',
    unit: 'a',
    questions: [
      // 5 word questions
      { id: 'a1', options: ['ant', 'dog', 'sun'], correctAnswer: 'ant', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'a2', options: ['apple', 'cat', 'pig'], correctAnswer: 'apple', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'a3', options: ['ax', 'dog', 'sun'], correctAnswer: 'ax', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'a4', options: ['alligator', 'cat', 'bat'], correctAnswer: 'alligator', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'a5', options: ['an', 'man', 'fan'], correctAnswer: 'an', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QuestionType.MULTIPLE_CHOICE_WORD_START, skills: [SKILL_PHONEME_IDENTIFICATION] },
      // 3 letter questions
      { id: 'a6', options: ['a', 'm', 't'], correctAnswer: 'a', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'a7', options: ['m', 'a', 's'], correctAnswer: 'a', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'a8', options: ['t', 'a', 'd'], correctAnswer: 'a', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QuestionType.MULTIPLE_CHOICE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-ant-leaf-demo',
    unit: 'ant-leaf-demo',
    questions: [
      {
        id: 'antLeaf1',
        phonemeFile: '/audio/phonics-units/c-sound.wav',
        // Updated prompt to reflect ants carrying leaves
        promptFile: '/audio/prompts/which-letter-makes-the-sound.wav',
        questionType: QuestionType.LEAF_PHONEME, // Still using LEAF_PHONEME for now
        skills: [SKILL_LETTER_SOUND_MAPPING],
        targetLetter: 'c',
      },
    ],
  },
];
