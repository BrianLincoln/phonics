// src/data/quizzes.ts
export interface Quiz {
  id: string;
  name: string;
  questions: Array<{
    id: string;
    text: string;
    words: string[];
    correctAnswer: string;
    phonemeFile: string;
    promptFile?: string;
  }>;
}

export const quizzes: Quiz[] = [
  {
    id: 'quiz-m',
    name: 'M m',
    questions: [
      {
        id: 'm1',
        text: 'Which word starts with the "m" sound?',
        words: ['cat', 'map', 'sun'],
        correctAnswer: 'map',
        phonemeFile: '/audio/sounds/mmm.wav',
        promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav',
      },
      {
        id: 'm2',
        text: 'Which word starts with the "m" sound?',
        words: ['mud', 'dog', 'sun'],
        correctAnswer: 'mud',
        phonemeFile: '/audio/sounds/mmm.wav',
        promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav',
      },
    ],
  },
  {
    id: 'quiz-s',
    name: 'Spot the S Sound',
    questions: [
      {
        id: 's1',
        text: 'Which word starts with the "s" sound?',
        words: ['sun', 'cat', 'dog'],
        correctAnswer: 'sun',
        phonemeFile: '/audio/sounds/sss.wav',
        promptFile: '/audio/prompts/which-word-starts-with-the-sound.wav',
      },
    ],
  },
];
