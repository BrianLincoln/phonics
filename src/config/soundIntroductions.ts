// soundIntroductions.ts
// Config for letter and letter team introductions

export interface SoundIntroduction {
  id: string;
  displayName: string;
  description: string;
}

export const soundIntroductions: SoundIntroduction[] = [
  {
    id: 'm',
    displayName: 'm',
    description: 'This is the letter m. It makes the sound mmm.',
  },
  {
    id: 'a',
    displayName: 'a',
    description: 'This is the letter a. It makes the sound aaa.',
  },
  {
    id: 't',
    displayName: 't',
    description: 'This is the letter t. It makes the sound ttt.',
  },
  {
    id: 'sh',
    displayName: 'sh',
    description: 'This is the letter team sh. It makes the sound shhh.',
  },
  {
    id: 'th',
    displayName: 'th',
    description: 'This is the letter team th. It makes the sound thhh.',
  },
];
