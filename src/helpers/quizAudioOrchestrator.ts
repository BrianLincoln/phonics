// quizAudioOrchestrator.ts
// Shared audio orchestration for quiz scenes (React/Phaser)

export interface QuizAudioSequence {
  promptFile: string;
  phonemeFile: string;
  playAudio: (src: string, waitForEnd?: boolean) => Promise<void>;
}

/**
 * Plays the standard quiz audio sequence: prompt, then phoneme.
 * Returns a promise that resolves when both are done.
 */
export async function playQuizAudioSequence({ promptFile, phonemeFile, playAudio }: QuizAudioSequence): Promise<void> {
  if (promptFile) {
    await playAudio(promptFile, true).catch(() => { });
  }
  if (phonemeFile) {
    await playAudio(phonemeFile, true).catch(() => { });
  }
}
