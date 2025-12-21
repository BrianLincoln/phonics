


export type Unit = {
  id: string;
  name: string;
  nameAudio?: string;
  soundAudio?: string;
};


export const phonicsUnits: Unit[] = [
  // Single consonants
  { id: 'm', name: 'Mm' },
  { id: 's', name: 'Ss' },
  { id: 'f', name: 'Ff' },
  { id: 'n', name: 'Nn' },
  { id: 'l', name: 'Ll' },
  { id: 'r', name: 'Rr' },
  { id: 't', name: 'Tt' },
  { id: 'p', name: 'Pp' },
  { id: 'b', name: 'Bb' },
  { id: 'd', name: 'Dd' },
  { id: 'c', name: 'Cc', nameAudio: '/audio/phonics-units/c-name.wav', soundAudio: '/audio/phonics-units/c-sound.wav' },
  { id: 'k', name: 'Kk' },
  { id: 'h', name: 'Hh' },
  { id: 'w', name: 'Ww' },
  { id: 'g', name: 'Gg' },
  { id: 'j', name: 'Jj' },
  { id: 'v', name: 'Vv' },
  { id: 'y', name: 'Yy' },
  { id: 'z', name: 'Zz' },
  { id: 'x', name: 'Xx' },
  { id: 'q', name: 'Qq' },
  // Short vowels
  { id: 'a', name: 'Aa' },
  { id: 'i', name: 'Ii' },
  { id: 'o', name: 'Oo' },
  { id: 'u', name: 'Uu' },
  { id: 'e', name: 'Ee' },
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
