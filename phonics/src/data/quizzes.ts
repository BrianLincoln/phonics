// Skills union type and constants
export const SKILL_PHONEME_IDENTIFICATION = 'phoneme-identification' as const; // identifying the sound in a word
export const SKILL_LETTER_SOUND_MAPPING = 'letter-sound' as const;              // mapping a sound to a letter

export type Skill = typeof SKILL_PHONEME_IDENTIFICATION | typeof SKILL_LETTER_SOUND_MAPPING;

// Question types
export type QuestionType = 'word' | 'phoneme'; // select the word or letter representing the target sound

export const QUESTION_TYPE_WORD: QuestionType = 'word';
export const QUESTION_TYPE_PHONEME: QuestionType = 'phoneme';

// Mapping question type → skill(s)
export const questionTypeToSkills: Record<QuestionType, Skill[]> = {
  [QUESTION_TYPE_WORD]: [SKILL_PHONEME_IDENTIFICATION],
  [QUESTION_TYPE_PHONEME]: [SKILL_LETTER_SOUND_MAPPING]
};

export interface QuizQuestion {
  id: string;
  text: string;
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
  name: string;
  unit?: string;
  questions: QuizQuestion[];
}

export const quizzes: Quiz[] = [
  {
    id: 'quiz-m',
    name: 'M m',
    unit: 'm',
    questions: [
      // ...existing questions for 'm'
      { id: 'm1', text: 'Which word starts with the "m" sound?', words: ['cat', 'map', 'sun'], correctAnswer: 'map', phonemeFile: '/audio/sounds/mmm.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm8', text: 'Which letter makes the "m" sound?', words: ['s', 'm', 'd'], correctAnswer: 'm', phonemeFile: '/audio/sounds/mmm.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-t',
    name: 'T t',
    unit: 't',
    questions: [
      // ...existing questions for 't'
      { id: 't1', text: 'Which word starts with the "t" sound?', words: ['top', 'hop', 'mop'], correctAnswer: 'top', phonemeFile: '/audio/sounds/ttt.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't2', text: 'Which word starts with the "t" sound?', words: ['tap', 'map', 'nap'], correctAnswer: 'tap', phonemeFile: '/audio/sounds/ttt.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't3', text: 'Which word starts with the "t" sound?', words: ['ten', 'men', 'hen'], correctAnswer: 'ten', phonemeFile: '/audio/sounds/ttt.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't4', text: 'Which word starts with the "t" sound?', words: ['tin', 'win', 'pin'], correctAnswer: 'tin', phonemeFile: '/audio/sounds/ttt.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't5', text: 'Which word starts with the "t" sound?', words: ['tag', 'bag', 'rag'], correctAnswer: 'tag', phonemeFile: '/audio/sounds/ttt.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't6', text: 'Which letter makes the "t" sound?', words: ['t', 'm', 'a'], correctAnswer: 't', phonemeFile: '/audio/sounds/ttt.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 't7', text: 'Which letter makes the "t" sound?', words: ['a', 't', 's'], correctAnswer: 't', phonemeFile: '/audio/sounds/ttt.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 't8', text: 'Which letter makes the "t" sound?', words: ['m', 't', 'd'], correctAnswer: 't', phonemeFile: '/audio/sounds/ttt.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-m',
    name: 'M m',
    unit: 'm',
    questions: [
      // 5 word questions
      { id: 'm1', text: 'Which word starts with the "m" sound?', words: ['cat', 'map', 'sun'], correctAnswer: 'map', phonemeFile: '/audio/sounds/mmm.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm2', text: 'Which word starts with the "m" sound?', words: ['mud', 'dog', 'sun'], correctAnswer: 'mud', phonemeFile: '/audio/sounds/mmm.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm3', text: 'Which word starts with the "m" sound?', words: ['milk', 'hat', 'pig'], correctAnswer: 'milk', phonemeFile: '/audio/sounds/mmm.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm4', text: 'Which word starts with the "m" sound?', words: ['man', 'dog', 'sun'], correctAnswer: 'man', phonemeFile: '/audio/sounds/mmm.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'm5', text: 'Which word starts with the "m" sound?', words: ['mat', 'cat', 'bat'], correctAnswer: 'mat', phonemeFile: '/audio/sounds/mmm.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      // 3 letter questions
      { id: 'm6', text: 'Which letter makes the "m" sound?', words: ['c', 's', 'm'], correctAnswer: 'm', phonemeFile: '/audio/sounds/mmm.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'm7', text: 'Which letter makes the "m" sound?', words: ['m', 't', 'a'], correctAnswer: 'm', phonemeFile: '/audio/sounds/mmm.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'm8', text: 'Which letter makes the "m" sound?', words: ['s', 'm', 'd'], correctAnswer: 'm', phonemeFile: '/audio/sounds/mmm.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-t',
    name: 'T t',
    unit: 't',
    questions: [
      // 5 word questions
      { id: 't1', text: 'Which word starts with the "t" sound?', words: ['top', 'hop', 'mop'], correctAnswer: 'top', phonemeFile: '/audio/sounds/ttt.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't2', text: 'Which word starts with the "t" sound?', words: ['tap', 'map', 'nap'], correctAnswer: 'tap', phonemeFile: '/audio/sounds/ttt.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't3', text: 'Which word starts with the "t" sound?', words: ['ten', 'men', 'hen'], correctAnswer: 'ten', phonemeFile: '/audio/sounds/ttt.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't4', text: 'Which word starts with the "t" sound?', words: ['tin', 'win', 'pin'], correctAnswer: 'tin', phonemeFile: '/audio/sounds/ttt.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 't5', text: 'Which word starts with the "t" sound?', words: ['tag', 'bag', 'rag'], correctAnswer: 'tag', phonemeFile: '/audio/sounds/ttt.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      // 3 letter questions
      { id: 't6', text: 'Which letter makes the "t" sound?', words: ['t', 'm', 'a'], correctAnswer: 't', phonemeFile: '/audio/sounds/ttt.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 't7', text: 'Which letter makes the "t" sound?', words: ['a', 't', 's'], correctAnswer: 't', phonemeFile: '/audio/sounds/ttt.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 't8', text: 'Which letter makes the "t" sound?', words: ['m', 't', 'd'], correctAnswer: 't', phonemeFile: '/audio/sounds/ttt.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-s',
    name: 'S s',
    questions: [
      // 5 word questions
      { id: 's1', text: 'Which word starts with the "s" sound?', words: ['sun', 'cat', 'dog'], correctAnswer: 'sun', phonemeFile: '/audio/sounds/sss.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 's2', text: 'Which word starts with the "s" sound?', words: ['sock', 'rock', 'clock'], correctAnswer: 'sock', phonemeFile: '/audio/sounds/sss.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 's3', text: 'Which word starts with the "s" sound?', words: ['sit', 'kit', 'hit'], correctAnswer: 'sit', phonemeFile: '/audio/sounds/sss.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 's4', text: 'Which word starts with the "s" sound?', words: ['sand', 'hand', 'band'], correctAnswer: 'sand', phonemeFile: '/audio/sounds/sss.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 's5', text: 'Which word starts with the "s" sound?', words: ['sip', 'tip', 'lip'], correctAnswer: 'sip', phonemeFile: '/audio/sounds/sss.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      // 3 letter questions
      { id: 's6', text: 'Which letter makes the "s" sound?', words: ['s', 'm', 'a'], correctAnswer: 's', phonemeFile: '/audio/sounds/sss.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 's7', text: 'Which letter makes the "s" sound?', words: ['t', 's', 'm'], correctAnswer: 's', phonemeFile: '/audio/sounds/sss.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 's8', text: 'Which letter makes the "s" sound?', words: ['a', 's', 'd'], correctAnswer: 's', phonemeFile: '/audio/sounds/sss.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-h',
    name: 'H h',
    questions: [
      // 5 word questions
      { id: 'h1', text: 'Which word starts with the "h" sound?', words: ['hat', 'cat', 'bat'], correctAnswer: 'hat', phonemeFile: '/audio/sounds/hhh.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h2', text: 'Which word starts with the "h" sound?', words: ['hop', 'mop', 'top'], correctAnswer: 'hop', phonemeFile: '/audio/sounds/hhh.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h3', text: 'Which word starts with the "h" sound?', words: ['hen', 'pen', 'ten'], correctAnswer: 'hen', phonemeFile: '/audio/sounds/hhh.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h4', text: 'Which word starts with the "h" sound?', words: ['hill', 'pill', 'fill'], correctAnswer: 'hill', phonemeFile: '/audio/sounds/hhh.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'h5', text: 'Which word starts with the "h" sound?', words: ['hug', 'bug', 'rug'], correctAnswer: 'hug', phonemeFile: '/audio/sounds/hhh.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      // 3 letter questions
      { id: 'h6', text: 'Which letter makes the "h" sound?', words: ['h', 'm', 'a'], correctAnswer: 'h', phonemeFile: '/audio/sounds/hhh.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'h7', text: 'Which letter makes the "h" sound?', words: ['a', 'h', 's'], correctAnswer: 'h', phonemeFile: '/audio/sounds/hhh.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'h8', text: 'Which letter makes the "h" sound?', words: ['m', 'h', 'd'], correctAnswer: 'h', phonemeFile: '/audio/sounds/hhh.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
  {
    id: 'quiz-a',
    name: 'A a',
    unit: 'a',
    questions: [
      // 5 word questions
      { id: 'a1', text: 'Which word starts with the "a" sound?', words: ['ant', 'dog', 'sun'], correctAnswer: 'ant', phonemeFile: '/audio/sounds/aaa.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'a2', text: 'Which word starts with the "a" sound?', words: ['apple', 'cat', 'pig'], correctAnswer: 'apple', phonemeFile: '/audio/sounds/aaa.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'a3', text: 'Which word starts with the "a" sound?', words: ['ax', 'dog', 'sun'], correctAnswer: 'ax', phonemeFile: '/audio/sounds/aaa.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'a4', text: 'Which word starts with the "a" sound?', words: ['alligator', 'cat', 'bat'], correctAnswer: 'alligator', phonemeFile: '/audio/sounds/aaa.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      { id: 'a5', text: 'Which word starts with the "a" sound?', words: ['an', 'man', 'fan'], correctAnswer: 'an', phonemeFile: '/audio/sounds/aaa.wav', promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav', questionType: QUESTION_TYPE_WORD, skills: [SKILL_PHONEME_IDENTIFICATION] },
      // 3 letter questions
      { id: 'a6', text: 'Which letter makes the "a" sound?', words: ['a', 'm', 't'], correctAnswer: 'a', phonemeFile: '/audio/sounds/aaa.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'a7', text: 'Which letter makes the "a" sound?', words: ['m', 'a', 's'], correctAnswer: 'a', phonemeFile: '/audio/sounds/aaa.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
      { id: 'a8', text: 'Which letter makes the "a" sound?', words: ['t', 'a', 'd'], correctAnswer: 'a', phonemeFile: '/audio/sounds/aaa.wav', promptFile: '/audio/prompts/which-letter-makes-the-sound.wav', hideLetter: true, questionType: QUESTION_TYPE_PHONEME, skills: [SKILL_LETTER_SOUND_MAPPING] },
    ],
  },
];
