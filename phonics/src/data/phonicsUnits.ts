
// Early continuous consonants
export const singleLetters: string[] = [
  'm', 's', 'f', 'n', 'l', 'r', // early continuous
  'a', 'i', 'o', 'u', 'e',     // short vowels
  't', 'p', 'b', 'd',         // early stops
  'c', 'k', 'h', 'w', 'g', 'j', 'v', 'y', 'z', 'x', 'q' // remaining
];

// Consonant digraphs (explicit instruction)
export const consonantDigraphs: string[] = [
  'sh', 'ch', 'th', 'wh', 'ph', 'ck', 'ng'
];

// Silent-e (VCe) patterns
export const silentE: string[] = [
  'a_e', 'i_e', 'o_e', 'u_e', 'e_e'
];

// Vowel teams (long vowels)
export const vowelTeams: string[] = [
  'ai', 'ay', 'ee', 'ea', 'oa', 'oe'
];

// R-controlled vowels
export const rControlled: string[] = [
  'ar', 'or', 'er', 'ir', 'ur'
];

// Complex / variable vowels
export const complexVowels: string[] = [
  'oo', 'ou', 'ow', 'ie', 'igh'
];
