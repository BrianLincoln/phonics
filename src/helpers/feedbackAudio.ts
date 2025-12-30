// feedbackAudio.ts
// Helper for playing feedback audio (correct/wrong)

export const FEEDBACK_AUDIO = {
  correct: '/audio/system/correct.wav',
  wrong: '/audio/system/incorrect.wav',
};

export async function playFeedbackAudio(type: 'correct' | 'wrong', playAudio: (src: string, force?: boolean) => Promise<void>) {
  const src = FEEDBACK_AUDIO[type];
  if (src) {
    await playAudio(src, true).catch(() => { });
  }
}
