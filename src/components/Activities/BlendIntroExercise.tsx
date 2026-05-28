import React, { useState, useRef, useEffect } from 'react';
import { BlendIntroStep, BlendLessonPass, BlendLessonWord, ActivityType } from '../../data/activities';
import { BlendIntroDisplay } from './BlendIntroDisplay';
import { BuildTheWordExercise } from './BuildTheWord/BuildTheWordActivity';
import { usePlayAudio, useStopAllAudio } from '../../utils/audioUtils';

const BLEND_LESSON_PROMPTS: Record<BlendLessonPass, string> = {
  model:       '/audio/prompts/listen.wav',
  choral:      '/audio/prompts/now-you-say-it-with-me.wav',
  independent: '/audio/prompts/tap-the-letters-to-build-the-word.wav',
};

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

interface BlendIntroExerciseProps {
  question: BlendIntroStep;
  onComplete: () => void;
  onBack?: () => void;
}

export const BlendIntroExercise: React.FC<BlendIntroExerciseProps> = ({
  question,
  onComplete,
  onBack,
}) => {
  const playAudio = usePlayAudio();
  const stopAll = useStopAllAudio();
  console.log('[BlendIntroExercise] Rendering with question:', { id: question.id, wordCount: question.words.length, words: question.words.map(w => ({ word: w.word, passes: w.passes })) });

  // Track which word and pass we're on
  const [wordIndex, setWordIndex] = useState(0);
  const [showIndependentPass, setShowIndependentPass] = useState(false);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [sweeping, setSweeping] = useState(false);
  const [transition, setTransition] = useState<'idle' | 'exiting' | 'entering'>('idle');

  const aliveRef = useRef(true);
  const sequenceStartedRef = useRef(false);

  // Cleanup on unmount or when dependencies change
  useEffect(() => {
    return () => {
      aliveRef.current = false;
      stopAll();
    };
  }, [stopAll]);

  // Main orchestration effect - only runs once
  useEffect(() => {
    if (showIndependentPass || sequenceStartedRef.current) {
      return;
    }

    sequenceStartedRef.current = true;
    aliveRef.current = true;

    const runSequence = async () => {
      const alive = () => aliveRef.current;

      // Wait one rAF so React commits the initial render
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      if (!alive()) return;

      for (let wi = 0; wi < question.words.length; wi++) {
        const wordDef = question.words[wi];
        if (!alive()) return;

        if (wi > 0) {
          // Slide old word out, swap, slide new word in
          setHighlight(null);
          setSweeping(false);
          setTransition('exiting');
          await delay(280);
          if (!alive()) return;
          setWordIndex(wi);
          setTransition('entering');
          await delay(350);
          if (!alive()) return;
          setTransition('idle');
          await delay(1650);
          if (!alive()) return;
        }

        // Process each pass (model, choral, independent)
        for (let pi = 0; pi < wordDef.passes.length; pi++) {
          const pass = wordDef.passes[pi];
          if (!alive()) return;

          if (pass === 'independent') {
            // Switch to BuildTheWordExercise component
            setShowIndependentPass(true);
            return;
          }

          // Model/Choral passes: play prompt and show visual highlighting
          const promptFile = BLEND_LESSON_PROMPTS[pass];
          console.log(`[BlendIntro] Starting ${pass} pass, prompt:`, promptFile);
          await playAudio(promptFile, true).catch((err) => {
            console.error(`[BlendIntro] Failed to play ${pass} prompt:`, promptFile, err);
          });
          if (!alive()) return;

          // Step through letters with visual highlighting
          for (let i = 0; i < wordDef.letters.length; i++) {
            if (!alive()) return;
            setHighlight(i);
            console.log(`[BlendIntro] Playing phoneme ${i}:`, wordDef.phonemeFiles[i]);
            await playAudio(wordDef.phonemeFiles[i], true).catch((err) => {
              console.error(`[BlendIntro] Failed to play phoneme ${i}:`, wordDef.phonemeFiles[i], err);
            });
            if (!alive()) return;
            await delay(300);
          }

          // Sweep and say whole word
          setHighlight(null);
          setSweeping(true);
          console.log(`[BlendIntro] Playing whole word:`, wordDef.wordAudioFile);
          await playAudio(wordDef.wordAudioFile, true).catch((err) => {
            console.error(`[BlendIntro] Failed to play word audio:`, wordDef.wordAudioFile, err);
          });
          if (!alive()) return;
          setSweeping(false);
          setHighlight(null);

          await delay(2000);
        }
      }

      // All words and passes done
      if (alive()) {
        sequenceStartedRef.current = false;
        onComplete();
      }
    };

    runSequence();
  }, [question, showIndependentPass]);

  // ── Render ────────────────────────────────────────────────────────────────

  const currentWord = question.words[wordIndex];

  // Show BuildTheWordExercise during independent pass
  if (showIndependentPass) {
    return (
      <BuildTheWordExercise
        activity={{
          id: question.id,
          unit: 'blend-intro',
          activityType: ActivityType.BUILD_THE_WORD,
          promptFile: '/audio/prompts/tap-the-letters-to-build-the-word.wav',
          words: question.words.slice(wordIndex),
          skills: [],
        }}
        onComplete={() => {
          // All independent passes complete
          onComplete();
        }}
        onBack={onBack}
      />
    );
  }

  // Show BlendIntroDisplay for model/choral passes
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <BlendIntroDisplay
        letters={currentWord.letters}
        highlightedIndex={highlight}
        sweeping={sweeping}
        transition={transition}
      />
    </div>
  );
};
