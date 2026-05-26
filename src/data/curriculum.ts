export type NodeType = 'grapheme' | 'blend' | 'review';

// Exercise category labels — for display and future lesson routing
export type ExerciseType = 'letter-sound' | 'word-start' | 'cvc-blend';

export interface CurriculumNode {
  id: string;
  order: number;
  label: string;
  type: NodeType;
  focus: string;
  exerciseTypes: ExerciseType[];
  // IDs matching src/data/activities.ts — filled in as activities are built
  activityIds: string[];
}

// UFLI scope & sequence. Edit this array to add or reorder nodes.
// cvc-blend unlocks at index ≥ 2 (once m + a + a third letter are known).
export const curriculum: CurriculumNode[] = [
  {
    id: 'node-m',
    order: 0,
    label: 'Mm',
    type: 'grapheme',
    focus: 'm',
    exerciseTypes: ['letter-sound', 'word-start'],
    activityIds: ['quiz-m'],
  },
  {
    id: 'node-a',
    order: 1,
    label: 'Aa',
    type: 'grapheme',
    focus: 'a',
    exerciseTypes: ['letter-sound', 'word-start'],
    activityIds: ['quiz-a'],
  },
  {
    id: 'node-s',
    order: 2,
    label: 'Ss',
    type: 'grapheme',
    focus: 's',
    exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'],
    activityIds: ['quiz-s'],
  },
  {
    id: 'node-t',
    order: 3,
    label: 'Tt',
    type: 'grapheme',
    focus: 't',
    exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'],
    activityIds: ['quiz-t'], // CVC blending activities to be added
  },
  {
    id: 'node-i',
    order: 4,
    label: 'Ii',
    type: 'grapheme',
    focus: 'i',
    exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'],
    activityIds: [], // quiz-i not yet built
  },
  {
    id: 'node-n',
    order: 5,
    label: 'Nn',
    type: 'grapheme',
    focus: 'n',
    exerciseTypes: ['letter-sound', 'word-start', 'cvc-blend'],
    activityIds: ['quiz-n'], // CVC blending activities to be added
  },
];
