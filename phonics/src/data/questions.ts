export interface Question {
  id: string;
  text: string;
  words: string[];
  correctAnswer: string;
  phonemeFile: string;
}

export const questions: Question[] = [
  {
    id: 'question-1',
    text: 'Which word starts with the "m" sound?',
    words: ['cat', 'map', 'sun'],
    correctAnswer: 'map',
    phonemeFile: '/phonemes/mmm.wav',
  },
  {
    id: 'question-2',
    text: 'Which word starts with the "m" sound?',
    words: ['mud', 'dog', 'sun'],
    correctAnswer: 'mud',
    phonemeFile: '/phonemes/mmm.wav',
  },
  {
    id: 'question-3',
    text: 'Which word starts with the "m" sound?',
    words: ['milk', 'hat', 'pig'],
    correctAnswer: 'milk',
    phonemeFile: '/phonemes/mmm.wav',
  },

];
