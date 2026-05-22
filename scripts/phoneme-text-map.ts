export type PhonemeClip = {
  nameText: string;   // spoken after "This is the letter/pattern:"
  soundText: string;  // spoken after "It makes the sound:"
  example: string;    // word for "Like in [example]" — gives TTS natural sentence context
  category: 'consonant' | 'vowel' | 'digraph' | 'pattern' | 'team' | 'r-controlled' | 'complex';
};

export const phonemeTextMap: Record<string, PhonemeClip> = {
  // Single consonants
  'm':  { nameText: 'em',       soundText: 'mmmm', example: 'moon',     category: 'consonant' },
  's':  { nameText: 'ess',      soundText: 'ssss', example: 'snake',    category: 'consonant' },
  'f':  { nameText: 'eff',      soundText: 'ffff', example: 'fish',     category: 'consonant' },
  'n':  { nameText: 'en',       soundText: 'nnnn', example: 'nest',     category: 'consonant' },
  'l':  { nameText: 'el',       soundText: 'llll', example: 'lion',     category: 'consonant' },
  'r':  { nameText: 'ar',       soundText: 'rrrr', example: 'rabbit',   category: 'consonant' },
  't':  { nameText: 'tee',      soundText: 't',    example: 'turtle',   category: 'consonant' },
  'p':  { nameText: 'pee',      soundText: 'p',    example: 'pig',      category: 'consonant' },
  'b':  { nameText: 'bee',      soundText: 'b',    example: 'ball',     category: 'consonant' },
  'd':  { nameText: 'dee',      soundText: 'd',    example: 'dog',      category: 'consonant' },
  'c':  { nameText: 'see',      soundText: 'k',    example: 'cat',      category: 'consonant' },
  'k':  { nameText: 'kay',      soundText: 'k',    example: 'kite',     category: 'consonant' },
  'h':  { nameText: 'aitch',    soundText: 'hhhh', example: 'hat',      category: 'consonant' },
  'w':  { nameText: 'double u', soundText: 'wwww', example: 'worm',     category: 'consonant' },
  'g':  { nameText: 'gee',      soundText: 'g',    example: 'goat',     category: 'consonant' },
  'j':  { nameText: 'jay',      soundText: 'j',    example: 'jump',     category: 'consonant' },
  'v':  { nameText: 'vee',      soundText: 'vvvv', example: 'van',      category: 'consonant' },
  'y':  { nameText: 'why',      soundText: 'yyyy', example: 'yak',      category: 'consonant' },
  'z':  { nameText: 'zee',      soundText: 'zzzz', example: 'zebra',    category: 'consonant' },
  'x':  { nameText: 'ex',       soundText: 'ks',   example: 'fox',      category: 'consonant' },
  'q':  { nameText: 'cue',      soundText: 'kw',   example: 'queen',    category: 'consonant' },

  // Short vowels
  'a':  { nameText: 'A',        soundText: 'aah',  example: 'apple',    category: 'vowel' },
  'i':  { nameText: 'I',        soundText: 'ih',   example: 'itch',     category: 'vowel' },
  'o':  { nameText: 'O',        soundText: 'aww',  example: 'otter',    category: 'vowel' },
  'u':  { nameText: 'U',        soundText: 'uh',   example: 'umbrella', category: 'vowel' },
  'e':  { nameText: 'E',        soundText: 'eh',   example: 'egg',      category: 'vowel' },

  // Consonant digraphs
  'sh': { nameText: 'S H',      soundText: 'shhh', example: 'ship',     category: 'digraph' },
  'ch': { nameText: 'C H',      soundText: 'ch',   example: 'chair',    category: 'digraph' },
  'th': { nameText: 'T H',      soundText: 'thhh', example: 'think',    category: 'digraph' },
  'wh': { nameText: 'W H',      soundText: 'wwww', example: 'whale',    category: 'digraph' },
  'ph': { nameText: 'P H',      soundText: 'ffff', example: 'phone',    category: 'digraph' },
  'ck': { nameText: 'C K',      soundText: 'k',    example: 'duck',     category: 'digraph' },
  'ng': { nameText: 'N G',      soundText: 'nng',  example: 'ring',     category: 'digraph' },

  // Silent-e patterns
  'a_e': { nameText: 'A dash E', soundText: 'ayy', example: 'cake',     category: 'pattern' },
  'i_e': { nameText: 'I dash E', soundText: 'eye', example: 'kite',     category: 'pattern' },
  'o_e': { nameText: 'O dash E', soundText: 'oh',  example: 'bone',     category: 'pattern' },
  'u_e': { nameText: 'U dash E', soundText: 'yoo', example: 'cube',     category: 'pattern' },
  'e_e': { nameText: 'E dash E', soundText: 'eee', example: 'these',    category: 'pattern' },

  // Vowel teams
  'ai': { nameText: 'A I',      soundText: 'ayy',  example: 'rain',     category: 'team' },
  'ay': { nameText: 'A Y',      soundText: 'ayy',  example: 'play',     category: 'team' },
  'ee': { nameText: 'E E',      soundText: 'eee',  example: 'tree',     category: 'team' },
  'ea': { nameText: 'E A',      soundText: 'eee',  example: 'leaf',     category: 'team' },
  'oa': { nameText: 'O A',      soundText: 'oh',   example: 'boat',     category: 'team' },
  'oe': { nameText: 'O E',      soundText: 'oh',   example: 'toe',      category: 'team' },

  // R-controlled vowels
  'ar': { nameText: 'A R',      soundText: 'ar',   example: 'star',     category: 'r-controlled' },
  'or': { nameText: 'O R',      soundText: 'or',   example: 'corn',     category: 'r-controlled' },
  'er': { nameText: 'E R',      soundText: 'er',   example: 'her',      category: 'r-controlled' },
  'ir': { nameText: 'I R',      soundText: 'er',   example: 'bird',     category: 'r-controlled' },
  'ur': { nameText: 'U R',      soundText: 'er',   example: 'turn',     category: 'r-controlled' },

  // Complex/variable vowels
  'oo':  { nameText: 'O O',     soundText: 'ooo',  example: 'moon',     category: 'complex' },
  'ou':  { nameText: 'O U',     soundText: 'ow',   example: 'cloud',    category: 'complex' },
  'ow':  { nameText: 'O W',     soundText: 'ow',   example: 'cow',      category: 'complex' },
  'ie':  { nameText: 'I E',     soundText: 'eye',  example: 'pie',      category: 'complex' },
  'igh': { nameText: 'I G H',   soundText: 'eye',  example: 'night',    category: 'complex' },
};

export const previewUnits = ['s', 'm', 'b', 'a', 'sh', 'a_e', 'ar'];
