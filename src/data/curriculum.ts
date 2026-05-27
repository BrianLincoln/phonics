export type NodeType = 'grapheme' | 'blend' | 'checkpoint';

export type ExerciseType = 'letter-sound' | 'word-start' | 'cvc-blend';

export interface CurriculumSection {
  id: string;
  color: string;       // key into SECTION_COLORS map in MapView
  displayName: string; // shown to kids
  nodeIds: string[];   // ordered; last entry is always the checkpoint node
}

export interface CurriculumNode {
  id: string;
  order: number;
  label: string;
  type: NodeType;
  focus: string;
  exerciseTypes: ExerciseType[];
  activityIds: string[];
}

export const sections: CurriculumSection[] = [
  // ── Basic code: short vowels + consonants ──────────────────────────────────
  { id: 'section-1',  color: 'blue',    displayName: 'Zone 1',  nodeIds: ['node-m', 'node-a', 'node-s', 'node-t', 'node-cp1'] },
  { id: 'section-2',  color: 'green',   displayName: 'Zone 2',  nodeIds: ['node-i', 'node-n', 'node-p', 'node-cp2'] },
  { id: 'section-3',  color: 'yellow',  displayName: 'Zone 3',  nodeIds: ['node-b', 'node-o', 'node-c', 'node-cp3'] },
  { id: 'section-4',  color: 'orange',  displayName: 'Zone 4',  nodeIds: ['node-r', 'node-u', 'node-f', 'node-cp4'] },
  { id: 'section-5',  color: 'purple',  displayName: 'Zone 5',  nodeIds: ['node-d', 'node-l', 'node-g', 'node-h', 'node-cp5'] },
  { id: 'section-6',  color: 'pink',    displayName: 'Zone 6',  nodeIds: ['node-e', 'node-w', 'node-j', 'node-v', 'node-cp6'] },
  { id: 'section-7',  color: 'gray',    displayName: 'Zone 7',  nodeIds: ['node-y', 'node-z', 'node-x', 'node-qu', 'node-cp7'] },
  // ── Digraphs ───────────────────────────────────────────────────────────────
  { id: 'section-8',  color: 'teal',    displayName: 'Zone 8',  nodeIds: ['node-sh', 'node-ch', 'node-th', 'node-wh', 'node-ck', 'node-cp8'] },
  // ── Initial blends ─────────────────────────────────────────────────────────
  { id: 'section-9',  color: 'red',     displayName: 'Zone 9',  nodeIds: ['node-bl', 'node-cl', 'node-fl', 'node-gl', 'node-pl', 'node-sl', 'node-cp9'] },
  { id: 'section-10', color: 'crimson', displayName: 'Zone 10', nodeIds: ['node-br', 'node-cr', 'node-dr', 'node-fr', 'node-gr', 'node-pr', 'node-tr', 'node-cp10'] },
  { id: 'section-11', color: 'amber',   displayName: 'Zone 11', nodeIds: ['node-sc', 'node-sk', 'node-sm', 'node-sn', 'node-sp', 'node-sw', 'node-cp11'] },
  // ── Final blends & 3-letter blends ─────────────────────────────────────────
  { id: 'section-12', color: 'gold',    displayName: 'Zone 12', nodeIds: ['node-nd', 'node-nt', 'node-nk', 'node-mp', 'node-ft', 'node-lk', 'node-cp12'] },
  { id: 'section-13', color: 'lime',    displayName: 'Zone 13', nodeIds: ['node-str', 'node-scr', 'node-spr', 'node-spl', 'node-squ', 'node-cp13'] },
  // ── CVCe long vowels ───────────────────────────────────────────────────────
  { id: 'section-14', color: 'emerald', displayName: 'Zone 14', nodeIds: ['node-ae', 'node-ie', 'node-oe-vce', 'node-ue', 'node-cp14'] },
  // ── Vowel teams ────────────────────────────────────────────────────────────
  { id: 'section-15', color: 'cyan',    displayName: 'Zone 15', nodeIds: ['node-ai', 'node-ay', 'node-ee', 'node-ea', 'node-cp15'] },
  { id: 'section-16', color: 'sky',     displayName: 'Zone 16', nodeIds: ['node-oa', 'node-ow-long', 'node-ue-team', 'node-ew', 'node-cp16'] },
  { id: 'section-17', color: 'indigo',  displayName: 'Zone 17', nodeIds: ['node-ie-team', 'node-igh', 'node-oe-team', 'node-cp17'] },
  { id: 'section-18', color: 'violet',  displayName: 'Zone 18', nodeIds: ['node-oo-long', 'node-oo-short', 'node-ou', 'node-ow-dip', 'node-cp18'] },
  { id: 'section-19', color: 'rose',    displayName: 'Zone 19', nodeIds: ['node-oi', 'node-oy', 'node-aw', 'node-au', 'node-cp19'] },
  // ── R-controlled vowels ────────────────────────────────────────────────────
  { id: 'section-20', color: 'maroon',  displayName: 'Zone 20', nodeIds: ['node-ar', 'node-or', 'node-er', 'node-ir', 'node-ur', 'node-cp20'] },
  // ── Advanced consonant patterns ────────────────────────────────────────────
  { id: 'section-21', color: 'brown',   displayName: 'Zone 21', nodeIds: ['node-ng', 'node-nk-adv', 'node-soft-c', 'node-soft-g', 'node-tch', 'node-dge', 'node-cp21'] },
  { id: 'section-22', color: 'olive',   displayName: 'Zone 22', nodeIds: ['node-kn', 'node-wr', 'node-gn', 'node-mb', 'node-ph', 'node-cp22'] },
  // ── Syllable types ─────────────────────────────────────────────────────────
  { id: 'section-23', color: 'navy',    displayName: 'Zone 23', nodeIds: ['node-compound', 'node-vccv', 'node-open-syl', 'node-cp23'] },
  { id: 'section-24', color: 'forest',  displayName: 'Zone 24', nodeIds: ['node-vce-syl', 'node-vowel-team-syl', 'node-r-syl', 'node-cle-syl', 'node-cp24'] },
  // ── Suffixes & prefixes ────────────────────────────────────────────────────
  { id: 'section-25', color: 'slate',   displayName: 'Zone 25', nodeIds: ['node-suf-s', 'node-suf-ed', 'node-suf-ing', 'node-cp25'] },
  { id: 'section-26', color: 'coral',   displayName: 'Zone 26', nodeIds: ['node-suf-er', 'node-suf-ly', 'node-suf-ful', 'node-suf-less', 'node-cp26'] },
  { id: 'section-27', color: 'magenta', displayName: 'Zone 27', nodeIds: ['node-pre-un', 'node-pre-re', 'node-pre-pre', 'node-suf-tion', 'node-suf-ment', 'node-cp27'] },
];

// UFLI-loosely-ordered scope & sequence for PreK-2.
// Stub nodes (activityIds: []) will show "coming soon" until activities are built.
export const curriculum: CurriculumNode[] = [
  // ── Section 1 — Blue ──────────────────────────────────────────────────────
  { id: 'node-m',   order: 0,  label: 'Mm', type: 'grapheme',   focus: 'm',        exerciseTypes: ['letter-sound', 'word-start'],              activityIds: ['quiz-m'] },
  { id: 'node-a',   order: 1,  label: 'Aa', type: 'grapheme',   focus: 'a',        exerciseTypes: ['letter-sound', 'word-start'],              activityIds: ['quiz-a'] },
  { id: 'node-s',   order: 2,  label: 'Ss', type: 'grapheme',   focus: 's',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-s'] },
  { id: 'node-t',   order: 3,  label: 'Tt', type: 'grapheme',   focus: 't',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-t'] },
  { id: 'node-cp1', order: 4,  label: '★',  type: 'checkpoint', focus: 'mast',     exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-cp1'] },

  // ── Section 2 — Green ─────────────────────────────────────────────────────
  { id: 'node-i',   order: 5,  label: 'Ii', type: 'grapheme',   focus: 'i',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-i'] },
  { id: 'node-n',   order: 6,  label: 'Nn', type: 'grapheme',   focus: 'n',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-n'] },
  { id: 'node-p',   order: 7,  label: 'Pp', type: 'grapheme',   focus: 'p',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-p'] },
  { id: 'node-cp2', order: 8,  label: '★',  type: 'checkpoint', focus: 'inp',      exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-cp2'] },

  // ── Section 3 — Yellow ────────────────────────────────────────────────────
  { id: 'node-b',   order: 9,  label: 'Bb', type: 'grapheme',   focus: 'b',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-b'] },
  { id: 'node-o',   order: 10, label: 'Oo', type: 'grapheme',   focus: 'o',        exerciseTypes: ['letter-sound', 'word-start'],              activityIds: ['quiz-o'] },
  { id: 'node-c',   order: 11, label: 'Cc', type: 'grapheme',   focus: 'c',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-c'] },
  { id: 'node-cp3', order: 12, label: '★',  type: 'checkpoint', focus: 'boc',      exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-cp3'] },

  // ── Section 4 — Orange ────────────────────────────────────────────────────
  { id: 'node-r',   order: 13, label: 'Rr', type: 'grapheme',   focus: 'r',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-r'] },
  { id: 'node-u',   order: 14, label: 'Uu', type: 'grapheme',   focus: 'u',        exerciseTypes: ['letter-sound', 'word-start'],              activityIds: ['quiz-u'] },
  { id: 'node-f',   order: 15, label: 'Ff', type: 'grapheme',   focus: 'f',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-f'] },
  { id: 'node-cp4', order: 16, label: '★',  type: 'checkpoint', focus: 'ruf',      exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-cp4'] },

  // ── Section 5 — Purple ────────────────────────────────────────────────────
  { id: 'node-d',   order: 17, label: 'Dd', type: 'grapheme',   focus: 'd',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-d'] },
  { id: 'node-l',   order: 18, label: 'Ll', type: 'grapheme',   focus: 'l',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-l'] },
  { id: 'node-g',   order: 19, label: 'Gg', type: 'grapheme',   focus: 'g',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-g'] },
  { id: 'node-h',   order: 20, label: 'Hh', type: 'grapheme',   focus: 'h',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-h'] },
  { id: 'node-cp5', order: 21, label: '★',  type: 'checkpoint', focus: 'dlgh',     exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-cp5'] },

  // ── Section 6 — Pink ──────────────────────────────────────────────────────
  { id: 'node-e',   order: 22, label: 'Ee', type: 'grapheme',   focus: 'e',        exerciseTypes: ['letter-sound', 'word-start'],              activityIds: [] },
  { id: 'node-w',   order: 23, label: 'Ww', type: 'grapheme',   focus: 'w',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },
  { id: 'node-j',   order: 24, label: 'Jj', type: 'grapheme',   focus: 'j',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },
  { id: 'node-v',   order: 25, label: 'Vv', type: 'grapheme',   focus: 'v',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },
  { id: 'node-cp6', order: 26, label: '★',  type: 'checkpoint', focus: 'ewjv',     exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 7 — Gray ──────────────────────────────────────────────────────
  { id: 'node-y',   order: 27, label: 'Yy', type: 'grapheme',   focus: 'y',        exerciseTypes: ['letter-sound', 'word-start'],              activityIds: [] },
  { id: 'node-z',   order: 28, label: 'Zz', type: 'grapheme',   focus: 'z',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },
  { id: 'node-x',   order: 29, label: 'Xx', type: 'grapheme',   focus: 'x',        exerciseTypes: ['letter-sound', 'word-start'],              activityIds: [] },
  { id: 'node-qu',  order: 30, label: 'Qu', type: 'grapheme',   focus: 'qu',       exerciseTypes: ['letter-sound', 'word-start'],              activityIds: [] },
  { id: 'node-cp7', order: 31, label: '★',  type: 'checkpoint', focus: 'yzxqu',    exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 8 — Teal (digraphs) ───────────────────────────────────────────
  { id: 'node-sh',  order: 32, label: 'Sh', type: 'grapheme',   focus: 'sh',       exerciseTypes: ['letter-sound', 'word-start'],              activityIds: [] },
  { id: 'node-ch',  order: 33, label: 'Ch', type: 'grapheme',   focus: 'ch',       exerciseTypes: ['letter-sound', 'word-start'],              activityIds: [] },
  { id: 'node-th',  order: 34, label: 'Th', type: 'grapheme',   focus: 'th',       exerciseTypes: ['letter-sound', 'word-start'],              activityIds: [] },
  { id: 'node-wh',  order: 35, label: 'Wh', type: 'grapheme',   focus: 'wh',       exerciseTypes: ['letter-sound', 'word-start'],              activityIds: [] },
  { id: 'node-ck',  order: 36, label: 'Ck', type: 'grapheme',   focus: 'ck',       exerciseTypes: ['letter-sound', 'word-start'],              activityIds: [] },
  { id: 'node-cp8', order: 37, label: '★',  type: 'checkpoint', focus: 'digraphs', exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 9 — Red (l-blends) ────────────────────────────────────────────
  { id: 'node-bl',  order: 38, label: 'bl', type: 'blend',      focus: 'bl',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-cl',  order: 39, label: 'cl', type: 'blend',      focus: 'cl',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-fl',  order: 40, label: 'fl', type: 'blend',      focus: 'fl',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-gl',  order: 41, label: 'gl', type: 'blend',      focus: 'gl',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-pl',  order: 42, label: 'pl', type: 'blend',      focus: 'pl',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-sl',  order: 43, label: 'sl', type: 'blend',      focus: 'sl',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-cp9', order: 44, label: '★',  type: 'checkpoint', focus: 'l-blends', exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 10 — Crimson (r-blends) ──────────────────────────────────────
  { id: 'node-br',   order: 45, label: 'br', type: 'blend',      focus: 'br',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-cr',   order: 46, label: 'cr', type: 'blend',      focus: 'cr',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-dr',   order: 47, label: 'dr', type: 'blend',      focus: 'dr',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-fr',   order: 48, label: 'fr', type: 'blend',      focus: 'fr',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-gr',   order: 49, label: 'gr', type: 'blend',      focus: 'gr',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-pr',   order: 50, label: 'pr', type: 'blend',      focus: 'pr',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-tr',   order: 51, label: 'tr', type: 'blend',      focus: 'tr',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-cp10', order: 52, label: '★',  type: 'checkpoint', focus: 'r-blends', exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 11 — Amber (s-blends) ────────────────────────────────────────
  { id: 'node-sc',   order: 53, label: 'sc', type: 'blend',      focus: 'sc',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-sk',   order: 54, label: 'sk', type: 'blend',      focus: 'sk',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-sm',   order: 55, label: 'sm', type: 'blend',      focus: 'sm',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-sn',   order: 56, label: 'sn', type: 'blend',      focus: 'sn',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-sp',   order: 57, label: 'sp', type: 'blend',      focus: 'sp',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-sw',   order: 58, label: 'sw', type: 'blend',      focus: 'sw',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-cp11', order: 59, label: '★',  type: 'checkpoint', focus: 's-blends', exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 12 — Gold (final blends) ─────────────────────────────────────
  { id: 'node-nd',   order: 60, label: '-nd', type: 'blend',      focus: 'nd',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-nt',   order: 61, label: '-nt', type: 'blend',      focus: 'nt',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-nk',   order: 62, label: '-nk', type: 'blend',      focus: 'nk',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-mp',   order: 63, label: '-mp', type: 'blend',      focus: 'mp',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-ft',   order: 64, label: '-ft', type: 'blend',      focus: 'ft',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-lk',   order: 65, label: '-lk', type: 'blend',      focus: 'lk',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-cp12', order: 66, label: '★',   type: 'checkpoint', focus: 'final-blends', exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 13 — Lime (3-letter blends) ──────────────────────────────────
  { id: 'node-str',  order: 67, label: 'str', type: 'blend',      focus: 'str', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-scr',  order: 68, label: 'scr', type: 'blend',      focus: 'scr', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-spr',  order: 69, label: 'spr', type: 'blend',      focus: 'spr', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-spl',  order: 70, label: 'spl', type: 'blend',      focus: 'spl', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-squ',  order: 71, label: 'squ', type: 'blend',      focus: 'squ', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-cp13', order: 72, label: '★',   type: 'checkpoint', focus: '3-letter-blends', exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 14 — Emerald (CVCe long vowels) ───────────────────────────────
  { id: 'node-ae',     order: 73, label: 'a_e', type: 'grapheme',   focus: 'a_e', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-ie',     order: 74, label: 'i_e', type: 'grapheme',   focus: 'i_e', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-oe-vce', order: 75, label: 'o_e', type: 'grapheme',   focus: 'o_e', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-ue',     order: 76, label: 'u_e', type: 'grapheme',   focus: 'u_e', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-cp14',   order: 77, label: '★',   type: 'checkpoint', focus: 'CVCe', exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 15 — Cyan (vowel teams: long e) ───────────────────────────────
  { id: 'node-ai',   order: 78, label: 'ai',  type: 'grapheme',   focus: 'ai', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-ay',   order: 79, label: 'ay',  type: 'grapheme',   focus: 'ay', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-ee',   order: 80, label: 'ee',  type: 'grapheme',   focus: 'ee', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-ea',   order: 81, label: 'ea',  type: 'grapheme',   focus: 'ea', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-cp15', order: 82, label: '★',   type: 'checkpoint', focus: 'ai-ay-ee-ea', exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 16 — Sky (vowel teams: long o/u) ──────────────────────────────
  { id: 'node-oa',      order: 83, label: 'oa',  type: 'grapheme',   focus: 'oa',      exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-ow-long', order: 84, label: 'ow',  type: 'grapheme',   focus: 'ow-long', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-ue-team', order: 85, label: 'ue',  type: 'grapheme',   focus: 'ue',      exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-ew',      order: 86, label: 'ew',  type: 'grapheme',   focus: 'ew',      exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-cp16',    order: 87, label: '★',   type: 'checkpoint', focus: 'oa-ow-ue-ew', exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 17 — Indigo (vowel teams: long i) ─────────────────────────────
  { id: 'node-ie-team', order: 88, label: 'ie',  type: 'grapheme',   focus: 'ie',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-igh',     order: 89, label: 'igh', type: 'grapheme',   focus: 'igh', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-oe-team', order: 90, label: 'oe',  type: 'grapheme',   focus: 'oe',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-cp17',    order: 91, label: '★',   type: 'checkpoint', focus: 'ie-igh-oe', exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 18 — Violet (oo + diphthongs ou/ow) ───────────────────────────
  { id: 'node-oo-long',  order: 92, label: 'oo',  type: 'grapheme',   focus: 'oo-long',  exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-oo-short', order: 93, label: 'oo',  type: 'grapheme',   focus: 'oo-short', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-ou',       order: 94, label: 'ou',  type: 'grapheme',   focus: 'ou',       exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-ow-dip',   order: 95, label: 'ow',  type: 'grapheme',   focus: 'ow-dip',   exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-cp18',     order: 96, label: '★',   type: 'checkpoint', focus: 'oo-ou-ow', exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 19 — Rose (diphthongs oi/oy + aw/au) ──────────────────────────
  { id: 'node-oi',   order: 97,  label: 'oi',  type: 'grapheme',   focus: 'oi', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-oy',   order: 98,  label: 'oy',  type: 'grapheme',   focus: 'oy', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-aw',   order: 99,  label: 'aw',  type: 'grapheme',   focus: 'aw', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-au',   order: 100, label: 'au',  type: 'grapheme',   focus: 'au', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-cp19', order: 101, label: '★',   type: 'checkpoint', focus: 'oi-oy-aw-au', exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 20 — Maroon (r-controlled vowels) ─────────────────────────────
  { id: 'node-ar',   order: 102, label: 'ar',  type: 'grapheme',   focus: 'ar', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-or',   order: 103, label: 'or',  type: 'grapheme',   focus: 'or', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-er',   order: 104, label: 'er',  type: 'grapheme',   focus: 'er', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-ir',   order: 105, label: 'ir',  type: 'grapheme',   focus: 'ir', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-ur',   order: 106, label: 'ur',  type: 'grapheme',   focus: 'ur', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-cp20', order: 107, label: '★',   type: 'checkpoint', focus: 'r-controlled', exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 21 — Brown (advanced consonant patterns) ─────────────────────
  { id: 'node-ng',     order: 108, label: '-ng',  type: 'grapheme',   focus: 'ng',     exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-nk-adv', order: 109, label: '-nk',  type: 'grapheme',   focus: 'nk-adv', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-soft-c', order: 110, label: 'c/s',  type: 'grapheme',   focus: 'soft-c', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-soft-g', order: 111, label: 'g/j',  type: 'grapheme',   focus: 'soft-g', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-tch',    order: 112, label: 'tch',  type: 'grapheme',   focus: 'tch',    exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-dge',    order: 113, label: 'dge',  type: 'grapheme',   focus: 'dge',    exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-cp21',   order: 114, label: '★',    type: 'checkpoint', focus: 'adv-consonants', exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 22 — Olive (silent letters) ──────────────────────────────────
  { id: 'node-kn',   order: 115, label: 'kn',  type: 'grapheme',   focus: 'kn', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-wr',   order: 116, label: 'wr',  type: 'grapheme',   focus: 'wr', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-gn',   order: 117, label: 'gn',  type: 'grapheme',   focus: 'gn', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-mb',   order: 118, label: 'mb',  type: 'grapheme',   focus: 'mb', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-ph',   order: 119, label: 'ph',  type: 'grapheme',   focus: 'ph', exerciseTypes: ['letter-sound', 'word-start'], activityIds: [] },
  { id: 'node-cp22', order: 120, label: '★',   type: 'checkpoint', focus: 'silent-letters', exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 23 — Navy (syllable types: closed + open) ────────────────────
  { id: 'node-compound', order: 121, label: '🔗',  type: 'blend',      focus: 'compound',  exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-vccv',     order: 122, label: 'VCCV', type: 'blend',      focus: 'vccv',      exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-open-syl', order: 123, label: 'V•',   type: 'blend',      focus: 'open-syl',  exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-cp23',     order: 124, label: '★',    type: 'checkpoint', focus: 'syllables-1', exerciseTypes: ['word-start'], activityIds: [] },

  // ── Section 24 — Forest (syllable types: VCe + r + cle) ──────────────────
  { id: 'node-vce-syl',       order: 125, label: 'VCe',  type: 'blend',      focus: 'vce-syl',       exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-vowel-team-syl',order: 126, label: 'V+V',  type: 'blend',      focus: 'vowel-team-syl',exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-r-syl',         order: 127, label: 'Vr',   type: 'blend',      focus: 'r-syl',         exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-cle-syl',       order: 128, label: 'Cle',  type: 'blend',      focus: 'cle-syl',       exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-cp24',          order: 129, label: '★',    type: 'checkpoint', focus: 'syllables-2',   exerciseTypes: ['word-start'], activityIds: [] },

  // ── Section 25 — Slate (suffixes: -s, -ed, -ing) ─────────────────────────
  { id: 'node-suf-s',   order: 130, label: '-s',   type: 'grapheme',   focus: 'suf-s',   exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-suf-ed',  order: 131, label: '-ed',  type: 'grapheme',   focus: 'suf-ed',  exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-suf-ing', order: 132, label: '-ing', type: 'grapheme',   focus: 'suf-ing', exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-cp25',    order: 133, label: '★',    type: 'checkpoint', focus: 'suffixes-1', exerciseTypes: ['word-start'], activityIds: [] },

  // ── Section 26 — Coral (suffixes: -er, -ly, -ful, -less) ─────────────────
  { id: 'node-suf-er',   order: 134, label: '-er',   type: 'grapheme',   focus: 'suf-er',   exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-suf-ly',   order: 135, label: '-ly',   type: 'grapheme',   focus: 'suf-ly',   exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-suf-ful',  order: 136, label: '-ful',  type: 'grapheme',   focus: 'suf-ful',  exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-suf-less', order: 137, label: '-less', type: 'grapheme',   focus: 'suf-less', exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-cp26',     order: 138, label: '★',     type: 'checkpoint', focus: 'suffixes-2', exerciseTypes: ['word-start'], activityIds: [] },

  // ── Section 27 — Magenta (prefixes + -tion/-ment) ─────────────────────────
  { id: 'node-pre-un',  order: 139, label: 'un-',   type: 'grapheme',   focus: 'pre-un',  exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-pre-re',  order: 140, label: 're-',   type: 'grapheme',   focus: 'pre-re',  exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-pre-pre', order: 141, label: 'pre-',  type: 'grapheme',   focus: 'pre-pre', exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-suf-tion',order: 142, label: '-tion', type: 'grapheme',   focus: 'suf-tion',exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-suf-ment',order: 143, label: '-ment', type: 'grapheme',   focus: 'suf-ment',exerciseTypes: ['word-start'], activityIds: [] },
  { id: 'node-cp27',    order: 144, label: '★',     type: 'checkpoint', focus: 'prefixes-suffixes-3', exerciseTypes: ['word-start'], activityIds: [] },
];
