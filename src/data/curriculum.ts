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
  { id: 'section-1', color: 'blue',   displayName: 'Zone 1', nodeIds: ['node-m', 'node-a', 'node-s', 'node-t', 'node-cp1'] },
  { id: 'section-2', color: 'green',  displayName: 'Zone 2', nodeIds: ['node-i', 'node-n', 'node-p', 'node-cp2'] },
  { id: 'section-3', color: 'yellow', displayName: 'Zone 3', nodeIds: ['node-b', 'node-o', 'node-c', 'node-cp3'] },
  { id: 'section-4', color: 'orange', displayName: 'Zone 4', nodeIds: ['node-r', 'node-u', 'node-f', 'node-cp4'] },
  { id: 'section-5', color: 'purple', displayName: 'Zone 5', nodeIds: ['node-d', 'node-l', 'node-g', 'node-h', 'node-cp5'] },
  { id: 'section-6', color: 'pink',   displayName: 'Zone 6', nodeIds: ['node-e', 'node-w', 'node-j', 'node-v', 'node-cp6'] },
  { id: 'section-7', color: 'gray',   displayName: 'Zone 7', nodeIds: ['node-y', 'node-z', 'node-x', 'node-qu', 'node-cp7'] },
  { id: 'section-8', color: 'teal',   displayName: 'Zone 8', nodeIds: ['node-sh', 'node-ch', 'node-th', 'node-wh', 'node-ck', 'node-cp8'] },
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
  { id: 'node-i',   order: 5,  label: 'Ii', type: 'grapheme',   focus: 'i',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },
  { id: 'node-n',   order: 6,  label: 'Nn', type: 'grapheme',   focus: 'n',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-n'] },
  { id: 'node-p',   order: 7,  label: 'Pp', type: 'grapheme',   focus: 'p',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },
  { id: 'node-cp2', order: 8,  label: '★',  type: 'checkpoint', focus: 'inp',      exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 3 — Yellow ────────────────────────────────────────────────────
  { id: 'node-b',   order: 9,  label: 'Bb', type: 'grapheme',   focus: 'b',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },
  { id: 'node-o',   order: 10, label: 'Oo', type: 'grapheme',   focus: 'o',        exerciseTypes: ['letter-sound', 'word-start'],              activityIds: [] },
  { id: 'node-c',   order: 11, label: 'Cc', type: 'grapheme',   focus: 'c',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },
  { id: 'node-cp3', order: 12, label: '★',  type: 'checkpoint', focus: 'boc',      exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 4 — Orange ────────────────────────────────────────────────────
  { id: 'node-r',   order: 13, label: 'Rr', type: 'grapheme',   focus: 'r',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-r'] },
  { id: 'node-u',   order: 14, label: 'Uu', type: 'grapheme',   focus: 'u',        exerciseTypes: ['letter-sound', 'word-start'],              activityIds: [] },
  { id: 'node-f',   order: 15, label: 'Ff', type: 'grapheme',   focus: 'f',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-f'] },
  { id: 'node-cp4', order: 16, label: '★',  type: 'checkpoint', focus: 'ruf',      exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

  // ── Section 5 — Purple ────────────────────────────────────────────────────
  { id: 'node-d',   order: 17, label: 'Dd', type: 'grapheme',   focus: 'd',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },
  { id: 'node-l',   order: 18, label: 'Ll', type: 'grapheme',   focus: 'l',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-l'] },
  { id: 'node-g',   order: 19, label: 'Gg', type: 'grapheme',   focus: 'g',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },
  { id: 'node-h',   order: 20, label: 'Hh', type: 'grapheme',   focus: 'h',        exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: ['quiz-h'] },
  { id: 'node-cp5', order: 21, label: '★',  type: 'checkpoint', focus: 'dlgh',     exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'], activityIds: [] },

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
];
