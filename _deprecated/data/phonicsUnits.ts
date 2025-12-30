


export type Unit = {
  id: string;
  name: string;
  nameAudio?: string;
  soundAudio?: string;
};


export const units: Unit[] = [
  // Single consonants
  { id: 'm', name: 'Mm', nameAudio: '/audio/phonics-units/m-name.wav', soundAudio: '/audio/phonics-units/m-sound.wav' },
  { id: 's', name: 'Ss', nameAudio: '/audio/phonics-units/s-name.wav', soundAudio: '/audio/phonics-units/s-sound.wav' },
  { id: 'f', name: 'Ff', nameAudio: '/audio/phonics-units/f-name.wav', soundAudio: '/audio/phonics-units/f-sound.wav' },
  { id: 'n', name: 'Nn', nameAudio: '/audio/phonics-units/n-name.wav', soundAudio: '/audio/phonics-units/n-sound.wav' },
  { id: 'l', name: 'Ll', nameAudio: '/audio/phonics-units/l-name.wav', soundAudio: '/audio/phonics-units/l-sound.wav' },
  { id: 'r', name: 'Rr', nameAudio: '/audio/phonics-units/r-name.wav', soundAudio: '/audio/phonics-units/r-sound.wav' },
  { id: 't', name: 'Tt', nameAudio: '/audio/phonics-units/t-name.wav', soundAudio: '/audio/phonics-units/t-sound.wav' },
  { id: 'p', name: 'Pp', nameAudio: '/audio/phonics-units/p-name.wav', soundAudio: '/audio/phonics-units/p-sound.wav' },
  { id: 'b', name: 'Bb', nameAudio: '/audio/phonics-units/b-name.wav', soundAudio: '/audio/phonics-units/b-sound.wav' },
  { id: 'd', name: 'Dd', nameAudio: '/audio/phonics-units/d-name.wav', soundAudio: '/audio/phonics-units/d-sound.wav' },
  { id: 'c', name: 'Cc', nameAudio: '/audio/phonics-units/c-name.wav', soundAudio: '/audio/phonics-units/c-sound.wav' },
  { id: 'k', name: 'Kk', nameAudio: '/audio/phonics-units/k-name.wav', soundAudio: '/audio/phonics-units/k-sound.wav' },
  { id: 'h', name: 'Hh', nameAudio: '/audio/phonics-units/h-name.wav', soundAudio: '/audio/phonics-units/h-sound.wav' },
  { id: 'w', name: 'Ww', nameAudio: '/audio/phonics-units/w-name.wav', soundAudio: '/audio/phonics-units/w-sound.wav' },
  { id: 'g', name: 'Gg', nameAudio: '/audio/phonics-units/g-name.wav', soundAudio: '/audio/phonics-units/g-sound.wav' },
  { id: 'j', name: 'Jj', nameAudio: '/audio/phonics-units/j-name.wav', soundAudio: '/audio/phonics-units/j-sound.wav' },
  { id: 'v', name: 'Vv', nameAudio: '/audio/phonics-units/v-name.wav', soundAudio: '/audio/phonics-units/v-sound.wav' },
  { id: 'y', name: 'Yy', nameAudio: '/audio/phonics-units/y-name.wav', soundAudio: '/audio/phonics-units/y-sound.wav' },
  { id: 'z', name: 'Zz', nameAudio: '/audio/phonics-units/z-name.wav', soundAudio: '/audio/phonics-units/z-sound.wav' },
  { id: 'x', name: 'Xx', nameAudio: '/audio/phonics-units/x-name.wav', soundAudio: '/audio/phonics-units/x-sound.wav' },
  { id: 'q', name: 'Qq', nameAudio: '/audio/phonics-units/q-name.wav', soundAudio: '/audio/phonics-units/q-sound.wav' },
  // Short vowels
  { id: 'a', name: 'Aa', nameAudio: '/audio/phonics-units/a-name.wav', soundAudio: '/audio/phonics-units/a-sound.wav' },
  { id: 'i', name: 'Ii', nameAudio: '/audio/phonics-units/i-name.wav', soundAudio: '/audio/phonics-units/i-sound.wav' },
  { id: 'o', name: 'Oo', nameAudio: '/audio/phonics-units/o-name.wav', soundAudio: '/audio/phonics-units/o-sound.wav' },
  { id: 'u', name: 'Uu', nameAudio: '/audio/phonics-units/u-name.wav', soundAudio: '/audio/phonics-units/u-sound.wav' },
  { id: 'e', name: 'Ee', nameAudio: '/audio/phonics-units/e-name.wav', soundAudio: '/audio/phonics-units/e-sound.wav' },
  // Consonant digraphs
  { id: 'sh', name: 'sh' },
  { id: 'ch', name: 'ch' },
  { id: 'th', name: 'th' },
  { id: 'wh', name: 'wh' },
  { id: 'ph', name: 'ph' },
  { id: 'ck', name: 'ck' },
  { id: 'ng', name: 'ng' },
  // Silent-e patterns
  { id: 'a_e', name: 'a_e' },
  { id: 'i_e', name: 'i_e' },
  { id: 'o_e', name: 'o_e' },
  { id: 'u_e', name: 'u_e' },
  { id: 'e_e', name: 'e_e' },
  // Vowel teams
  { id: 'ai', name: 'ai' },
  { id: 'ay', name: 'ay' },
  { id: 'ee', name: 'ee' },
  { id: 'ea', name: 'ea' },
  { id: 'oa', name: 'oa' },
  { id: 'oe', name: 'oe' },
  // R-controlled vowels
  { id: 'ar', name: 'ar' },
  { id: 'or', name: 'or' },
  { id: 'er', name: 'er' },
  { id: 'ir', name: 'ir' },
  { id: 'ur', name: 'ur' },
  // Complex/variable vowels
  { id: 'oo', name: 'oo' },
  { id: 'ou', name: 'ou' },
  { id: 'ow', name: 'ow' },
  { id: 'ie', name: 'ie' },
  { id: 'igh', name: 'igh' },
];
