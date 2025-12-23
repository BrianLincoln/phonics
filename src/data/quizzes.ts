// Skills union type and constants
export const SKILL_PHONEME_IDENTIFICATION = 'phoneme-identification' as const; // identifying the sound in a word
export const SKILL_LETTER_SOUND_MAPPING = 'letter-sound' as const;              // mapping a sound to a letter

export type Skill = typeof SKILL_PHONEME_IDENTIFICATION | typeof SKILL_LETTER_SOUND_MAPPING;

// Question types
export type QuestionType = 'word' | 'phoneme'; // select the word or letter representing the target sound

export const QUESTION_TYPE_WORD: QuestionType = 'word';
export const QUESTION_TYPE_PHONEME: QuestionType = 'phoneme';

// Mapping question type 2 skill(s)
export const questionTypeToSkills: Record<QuestionType, Skill[]> = {
  [QUESTION_TYPE_WORD]: [SKILL_PHONEME_IDENTIFICATION],
  [QUESTION_TYPE_PHONEME]: [SKILL_LETTER_SOUND_MAPPING]
};

export interface QuizQuestion {
  id: string;
  words: string[];
  correctAnswer: string;
  phonemeFile: string;
  promptFile: string;
  hideLetter?: boolean;
  questionType: QuestionType;
  skills: Skill[];
}


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
      { id: 'c1', words: ['cat', 'mat', 'sat'], correctAnswer: 'cat', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'c2', words: ['cup', 'mop', 'sun'], correctAnswer: 'cup', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'c3', words: ['cap', 'map', 'tap'], correctAnswer: 'cap', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'c4', words: ['c', 'm', 'a'], correctAnswer: 'c', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      // { id: 'c5', words: ['a', 'c', 's'], correctAnswer: 'c', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      // { id: 'c6', words: ['m', 'c', 'd'], correctAnswer: 'c', phonemeFile: '/audio/phonics-units/c-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-t',
    unit: 't',
    showLetterIntro: true,
    questions: [
      { id: 't1', words: ['top', 'hop', 'mop'], correctAnswer: 'top', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't2', words: ['tap', 'map', 'nap'], correctAnswer: 'tap', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't3', words: ['ten', 'men', 'hen'], correctAnswer: 'ten', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't4', words: ['tin', 'win', 'pin'], correctAnswer: 'tin', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't5', words: ['tag', 'bag', 'rag'], correctAnswer: 'tag', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't6', words: ['t', 'm', 'a'], correctAnswer: 't', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 't7', words: ['a', 't', 's'], correctAnswer: 't', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 't8', words: ['m', 't', 'd'], correctAnswer: 't', phonemeFile: '/audio/phonics-units/t-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-m',
    unit: 'm',
    questions: [
      { id: 'm1', words: ['cat', 'map', 'sun'], correctAnswer: 'map', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm2', words: ['mud', 'dog', 'sun'], correctAnswer: 'mud', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm3', words: ['milk', 'hat', 'pig'], correctAnswer: 'milk', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm4', words: ['man', 'dog', 'sun'], correctAnswer: 'man', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm5', words: ['mat', 'cat', 'bat'], correctAnswer: 'mat', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm6', words: ['c', 's', 'm'], correctAnswer: 'm', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'm7', words: ['m', 't', 'a'], correctAnswer: 'm', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'm8', words: ['s', 'm', 'd'], correctAnswer: 'm', phonemeFile: '/audio/phonics-units/m-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-s',
    unit: 's',
    questions: [
      // 5 word questions
      { id: 's1', words: ['sun', 'cat', 'dog'], correctAnswer: 'sun', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 's2', words: ['sock', 'rock', 'clock'], correctAnswer: 'sock', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 's3', words: ['sit', 'kit', 'hit'], correctAnswer: 'sit', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 's4', words: ['sand', 'hand', 'band'], correctAnswer: 'sand', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 's5', words: ['sip', 'tip', 'lip'], correctAnswer: 'sip', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      // 3 letter questions
      { id: 's6', words: ['s', 'm', 'a'], correctAnswer: 's', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 's7', words: ['t', 's', 'm'], correctAnswer: 's', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 's8', words: ['a', 's', 'd'], correctAnswer: 's', phonemeFile: '/audio/phonics-units/s-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-h',
    unit: 'h',
    questions: [
      // 5 word questions
      { id: 'h1', words: ['hat', 'cat', 'bat'], correctAnswer: 'hat', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h2', words: ['hop', 'mop', 'top'], correctAnswer: 'hop', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h3', words: ['hen', 'pen', 'ten'], correctAnswer: 'hen', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h4', words: ['hill', 'pill', 'fill'], correctAnswer: 'hill', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h5', words: ['hug', 'bug', 'rug'], correctAnswer: 'hug', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      // 3 letter questions
      { id: 'h6', words: ['h', 'm', 'a'], correctAnswer: 'h', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'h7', words: ['a', 'h', 's'], correctAnswer: 'h', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'h8', words: ['m', 'h', 'd'], correctAnswer: 'h', phonemeFile: '/audio/phonics-units/h-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-a',
    unit: 'a',
    questions: [
      // 5 word questions
      { id: 'a1', words: ['ant', 'dog', 'sun'], correctAnswer: 'ant', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'a2', words: ['apple', 'cat', 'pig'], correctAnswer: 'apple', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'a3', words: ['ax', 'dog', 'sun'], correctAnswer: 'ax', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'a4', words: ['alligator', 'cat', 'bat'], correctAnswer: 'alligator', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'a5', words: ['an', 'man', 'fan'], correctAnswer: 'an', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      // 3 letter questions
      { id: 'a6', words: ['a', 'm', 't'], correctAnswer: 'a', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'a7', words: ['m', 'a', 's'], correctAnswer: 'a', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'a8', words: ['t', 'a', 'd'], correctAnswer: 'a', phonemeFile: '/audio/phonics-units/a-sound.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
];
