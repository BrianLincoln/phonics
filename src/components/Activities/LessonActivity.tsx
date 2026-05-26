import React, { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../../components/PhaserGame';
import {
  LessonActivity as LessonActivityData,
  LessonQuestion,
  BlendQuestion,
  ScrambledBlendQuestion,
} from '../../data/activities';
import MultipleChoice from './MultipleChoice/MultipleChoice';
import { BuildTheWordTiles, TileState } from './BuildTheWord/BuildTheWordTiles';
import './MultipleChoice/MultipleChoiceActivity.css';
import { usePlayAudio, useStopAllAudio } from '../../utils/audioUtils';
import { useAudioUnlocked } from '../../context/AudioManagerContext';
import { AudioStartOverlay } from '../AudioStartOverlay';

const FEEDBACK_AUDIO = {
  correct: '/audio/system/correct.wav',
  wrong: '/audio/system/incorrect.wav',
};

const INTRO_PROMPTS = {
  thisIs: '/audio/prompts/this-is-the-letter.wav',
  makesSound: '/audio/prompts/it-makes-the-sound.wav',
  likeIn: '/audio/prompts/like-in.wav',
  and: '/audio/prompts/and.wav',
};

const SCRAMBLE_PROMPTS = {
  ohNo: '/audio/prompts/oh-no.wav',
  mixedUp: '/audio/prompts/the-letters-got-mixed-up.wav',
  tapInOrder: '/audio/prompts/tap-the-letters-in-the-correct-order-to-build-the-word.wav',
  combined: '/audio/prompts/oh-no-mixed-up-tap-in-order.wav',
};

interface LessonActivityProps {
  activity: LessonActivityData;
  onComplete: (result?: any) => void;
  onBack?: () => void;
  introUnit?: { nameAudio?: string; soundAudio?: string; likeInWords?: string[] };
}

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function makeInitialTileStates(count: number): TileState[] {
  return Array.from({ length: count }, (_, i) => (i === 0 ? 'active' : 'untapped'));
}

// Shuffle [0..n-1] guaranteeing result differs from identity order (for n > 1)
function shuffleIndices(n: number): number[] {
  if (n <= 1) return [0];
  const indices = Array.from({ length: n }, (_, i) => i);
  let result: number[];
  do {
    result = [...indices];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
  } while (result.every((v, i) => v === i));
  return result;
}

type BlendLike = BlendQuestion | ScrambledBlendQuestion;

function isBlendLike(q: LessonQuestion): q is BlendLike {
  return q.kind === 'blend' || q.kind === 'scrambled-blend';
}

export const LessonActivity: React.FC<LessonActivityProps> = ({
  activity,
  onComplete,
  onBack,
  introUnit,
}) => {
  const navigate = useNavigate();

  // ── Question queue ────────────────────────────────────────────────────────
  const queueRef = useRef([...activity.questions]);
  const requeuedIds = useRef(new Set<string>());
  const [queueIdx, setQueueIdx] = useState(0);
  const question = queueRef.current[queueIdx];

  // ── Shared infra ──────────────────────────────────────────────────────────
  const audioUnlocked = useAudioUnlocked();
  const phaserRef = useRef<any>(null);
  const playAudio = usePlayAudio();
  const stopAll = useStopAllAudio();

  // ── MCQ state ─────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const hadWrongRef = useRef(false);

  // ── Blend / scrambled-blend state ─────────────────────────────────────────
  const [nextTapIndex, setNextTapIndex] = useState(0);
  const [tileStates, setTileStates] = useState<TileState[]>([]);
  // For scrambled-blend: displayLetters is the shuffled letter order for rendering;
  // shuffledIndices maps display position → original word position.
  const [displayLetters, setDisplayLetters] = useState<string[]>([]);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const tileRowRef = useRef<HTMLDivElement>(null);

  // ── Shared UI state ───────────────────────────────────────────────────────
  const [transition, setTransition] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const [promptPlaying, setPromptPlaying] = useState(true);
  const [answersReady, setAnswersReady] = useState(() => !introUnit);
  const answersReadyRef = useRef(!introUnit);

  const introCallbackRef = useRef<(() => void) | null>(null);

  // ── Advance ───────────────────────────────────────────────────────────────
  const advance = (wasCorrect: boolean) => {
    // Blend questions never re-queue on wrong (they advance linearly)
    if (!wasCorrect && !isBlendLike(question)) {
      const q = queueRef.current[queueIdx];
      if (!requeuedIds.current.has(q.id)) {
        requeuedIds.current.add(q.id);
        const insertAt = Math.min(queueIdx + 3, queueRef.current.length);
        queueRef.current.splice(insertAt, 0, q);
      }
    }
    const nextIdx = queueIdx + 1;
    if (nextIdx < queueRef.current.length) {
      setQueueIdx(nextIdx);
    } else {
      onComplete(wasCorrect);
    }
  };

  const doAdvanceQuestion = async (wasCorrect: boolean) => {
    await delay(1500);
    setTransition('exiting');
    await delay(280);
    setSelected(null);
    setFeedback(null);
    setEliminated([]);
    hadWrongRef.current = false;
    setNextTapIndex(0);
    setTileStates([]);
    setPromptPlaying(true);
    // Hide answers/tiles — they'll re-appear in playQuestionPrompt once any
    // crow carry-off animation is fully complete.
    answersReadyRef.current = false;
    setAnswersReady(false);
    advance(wasCorrect);
    // No entering transition here — playQuestionPrompt handles it after crow exits
  };

  // ── MCQ answer handler ────────────────────────────────────────────────────
  const handleAnswer = async (word: string) => {
    if (selected || promptPlaying || isBlendLike(question)) return;
    const isCorrect = word === (question as any).correctAnswer;

    // Highlight the tapped button immediately, but hold off on correct/wrong colour
    setSelected(word);

    // Play the option's own audio first (letter sound or word), then feedback
    if (question.kind === 'letter-sound') {
      await playAudio(`/audio/phonics-units/${word}-sound.wav`, true).catch(() => {});
    } else if (question.kind === 'word-start') {
      await playAudio(`/audio/words/${word}.wav`, true).catch(() => {});
    }

    setFeedback(isCorrect ? 'correct' : 'wrong');
    playAudio(FEEDBACK_AUDIO[isCorrect ? 'correct' : 'wrong'], true).catch(() => {});

    if (isCorrect) {
      if (phaserRef.current?.onQuestionAnswered) {
        phaserRef.current.onQuestionAnswered(true, () => doAdvanceQuestion(true));
      } else {
        doAdvanceQuestion(true);
      }
    } else {
      hadWrongRef.current = true;
      if (!requeuedIds.current.has(question.id)) {
        requeuedIds.current.add(question.id);
        const insertAt = Math.min(queueIdx + 3, queueRef.current.length);
        queueRef.current.splice(insertAt, 0, question);
      }
      const doEliminate = async () => {
        setEliminated(prev => [...prev, word]);
        setSelected(null);
        setFeedback(null);
      };
      if (phaserRef.current?.onQuestionAnswered) {
        phaserRef.current.onQuestionAnswered(false, doEliminate);
      } else {
        doEliminate();
      }
    }
  };

  // ── Blend tap handler (covers both blend and scrambled-blend) ─────────────
  const handleLetterTap = async (displayIndex: number) => {
    if (promptPlaying || !isBlendLike(question)) return;
    if (tileStates[displayIndex] === 'tapped') return;

    const q = question as BlendLike;
    const isScrambled = q.kind === 'scrambled-blend';

    // For ordered blend: displayIndex === originalIndex.
    // For scrambled: map display position back to original word position.
    const originalIndex = isScrambled ? shuffledIndices[displayIndex] : displayIndex;
    const isCorrectTap = originalIndex === nextTapIndex;

    if (isCorrectTap) {
      const isLastLetter = nextTapIndex === q.letters.length - 1;

      if (isLastLetter) {
        await playAudio(q.phonemeFiles[nextTapIndex], true).catch(() => {});
      } else {
        playAudio(q.phonemeFiles[nextTapIndex]).catch(() => {});
      }

      const newStates = [...tileStates];
      newStates[displayIndex] = 'tapped';
      // Only advance the active indicator for ordered blend (not scrambled)
      if (!isScrambled && displayIndex + 1 < newStates.length) {
        newStates[displayIndex + 1] = 'active';
      }
      setTileStates(newStates);
      phaserRef.current?.onQuestionAnswered?.(true);

      if (isLastLetter) {
        await delay(50);
        await playAudio(q.wordAudioFile, true).catch(() => {});
        await delay(200);
        doAdvanceQuestion(true);
      } else {
        setNextTapIndex(nextTapIndex + 1);
      }
    } else {
      playAudio(q.phonemeFiles[originalIndex]).catch(() => {});
      const newStates = [...tileStates];
      newStates[displayIndex] = 'wrong';
      setTileStates(newStates);
      phaserRef.current?.onQuestionAnswered?.(false);
      setTimeout(() => {
        setTileStates(prev => {
          const reset = [...prev];
          reset[displayIndex] = 'untapped';
          return reset;
        });
      }, 400);
    }
  };

  // ── Per-question setup effect ─────────────────────────────────────────────
  useEffect(() => {
    stopAll();
    setPromptPlaying(true);

    if (question.kind === 'blend') {
      setNextTapIndex(0);
      setTileStates(makeInitialTileStates(question.letters.length));
      setDisplayLetters([...question.letters]);
      setShuffledIndices(question.letters.map((_, i) => i));
    } else if (question.kind === 'scrambled-blend') {
      // Start in-order so student can preview the word while audio plays
      setNextTapIndex(0);
      setTileStates(Array(question.letters.length).fill('untapped') as TileState[]);
      setDisplayLetters([...question.letters]);
      setShuffledIndices(question.letters.map((_, i) => i));
    }

    let alive = true;

    async function playQuestionPrompt() {
      if (!alive) return;

      if (!answersReadyRef.current) {
        // Short pause only on the very first question when there is an intro sequence
        if (queueIdx === 0 && introUnit) {
          await delay(700);
          if (!alive) return;
        }
        answersReadyRef.current = true;
        setAnswersReady(true);
        setTransition('entering');
        setTimeout(() => { if (alive) setTransition('idle'); }, 350);
      }

      if (question.kind === 'blend') {
        await playAudio(question.promptFile, true).catch(() => {});
        if (!alive) return;
        await playAudio(question.wordAudioFile, true).catch(() => {});
      } else if (question.kind === 'scrambled-blend') {
        // Show the word in correct order and play it so student has a target
        await playAudio(question.wordAudioFile, true).catch(() => {});
        if (!alive) return;

        // Brief pause so the word sinks in before the crow causes chaos
        await delay(400);
        if (!alive) return;

        const shuffled = shuffleIndices(question.letters.length);
        const scene = phaserRef.current;
        const btns = tileRowRef.current
          ? Array.from(tileRowRef.current.querySelectorAll<HTMLButtonElement>('button.letter-tile'))
          : [];

        let ohNoPromise: Promise<void> = Promise.resolve();

        if (btns.length >= 3 && scene?.placeCrow) {
          const rects  = btns.map(b => b.getBoundingClientRect());
          const leftX  = rects[0].left + rects[0].width  / 2;
          const centerX = rects[1].left + rects[1].width / 2;
          const rightX = rects[2].left + rects[2].width  / 2;
          const spacing = centerX - leftX;         // pixels between tile centres
          const gap     = rects[0].width / 2 + 48; // crow centre to tile centre
          const crowY   = rects[0].bottom;          // crow feet at bottom of tiles

          // Per-button translateX offsets (all start at 0).
          const offsets = [0, 0, 0];

          const moveTile = (idx: number, toOffset: number, dur: number) => {
            const from = offsets[idx];
            offsets[idx] = toOffset;
            return btns[idx].animate(
              [{ transform: `translateX(${from}px)` }, { transform: `translateX(${toOffset}px)` }],
              { duration: dur, fill: 'forwards', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
            ).finished.then(() => {}) as Promise<void>;
          };
          const driveCrow = (x: number, dur: number) =>
            new Promise<void>(r => scene.driveCrow(x, crowY, dur, r));
          const repoCrow  = (x: number) =>
            new Promise<void>(r => scene.reposCrow(x, crowY, r));

          const D = 90; // carry duration ms

          // Crow starts right of the right tile, facing left
          scene.placeCrow(rightX + gap, crowY, 'left');

          // Step 1 — carry right tile left to centre
          await Promise.all([moveTile(2, -spacing, D), driveCrow(centerX + gap, D)]);

          // Reposition crow to left of left tile
          await repoCrow(leftX - gap);

          // Step 2 — carry left tile right to centre
          await Promise.all([moveTile(0, spacing, D), driveCrow(centerX - gap, D)]);

          // All tiles are now stacked — start the full prompt sequence while the scatter happens
          ohNoPromise = playAudio(SCRAMBLE_PROMPTS.combined, true).then(() => {}, () => {});

          // Reposition crow to right of centre pile
          await repoCrow(centerX + gap);

          // Step 3 — carry the dest-left tile from centre to left
          const leftFinalOffset  = -shuffled[0] * spacing;
          await Promise.all([
            moveTile(shuffled[0], leftFinalOffset, D),
            driveCrow(leftX + gap, D),
          ]);

          // Reposition crow to left of centre pile
          await repoCrow(centerX - gap);

          // Step 4 — carry the dest-right tile from centre to right
          const rightFinalOffset = (2 - shuffled[2]) * spacing;
          await Promise.all([
            moveTile(shuffled[2], rightFinalOffset, D),
            driveCrow(rightX - gap, D),
          ]);
          await delay(20);

          // Commit React state + reset WAAPI transforms atomically before next paint
          flushSync(() => {
            setShuffledIndices(shuffled);
            setDisplayLetters(shuffled.map(i => (question as ScrambledBlendQuestion).letters[i]));
          });
          btns.forEach(b => { b.getAnimations().forEach(a => a.cancel()); b.style.transform = ''; });

          // Crow hops back to idle
          if (alive) await new Promise<void>(r => scene.returnCrowToIdle(r));
        } else {
          // Fallback — no animation
          setShuffledIndices(shuffled);
          setDisplayLetters(shuffled.map(i => (question as ScrambledBlendQuestion).letters[i]));
        }
        if (!alive) return;

        // Wait for the full prompt sequence to finish (started during the scatter)
        await ohNoPromise;
        if (!alive) return;
        await playAudio(question.wordAudioFile, true).catch(() => {});
        if (!alive) return;
      } else {
        await playAudio((question as any).promptFile, true).catch(() => {});
        if (!alive) return;
        await playAudio((question as any).phonemeFile, true).catch(() => {});
      }
      if (!alive) return;
      setPromptPlaying(false);
    }

    function prepareAndPlay() {
      const showLetter = !isBlendLike(question) && !!(question as any).showLetter;
      if (phaserRef.current?.prepareForQuestion) {
        phaserRef.current.prepareForQuestion(showLetter, playQuestionPrompt);
      } else {
        playQuestionPrompt();
      }
    }

    if (queueIdx === 0 && introUnit) {
      const withIntro = async () => {
        if (!alive) return;
        await playAudio(INTRO_PROMPTS.thisIs, true).catch(() => {});
        if (!alive) return;
        if (introUnit.nameAudio) await playAudio(introUnit.nameAudio, true).catch(() => {});
        if (!alive) return;
        await playAudio(INTRO_PROMPTS.makesSound, true).catch(() => {});
        if (!alive) return;
        if (introUnit.soundAudio) await playAudio(introUnit.soundAudio, true).catch(() => {});
        if (!alive) return;
        if (introUnit.likeInWords?.length) await delay(700);
        if (!alive) return;
        if (introUnit.likeInWords?.length) {
          await playAudio(INTRO_PROMPTS.likeIn, true).catch(() => {});
          if (!alive) return;
          for (let i = 0; i < introUnit.likeInWords.length; i++) {
            await playAudio(introUnit.likeInWords[i], true).catch(() => {});
            if (!alive) return;
            if (i < introUnit.likeInWords.length - 1) {
              await playAudio(INTRO_PROMPTS.and, true).catch(() => {});
              if (!alive) return;
            }
          }
        }
        prepareAndPlay();
      };
      introCallbackRef.current = withIntro;
      // Start intro audio immediately — crow carry-in plays concurrently.
      // If the scene is already mounted, fire now; otherwise onSceneReady will fire it.
      if (phaserRef.current) {
        introCallbackRef.current = null;
        withIntro();
      }
    } else {
      introCallbackRef.current = null;
      prepareAndPlay();
    }

    return () => {
      alive = false;
      stopAll();
    };
  }, [queueIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { phaserRef.current?.scene?.stop?.(); };
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  const showTiles = answersReady && isBlendLike(question);
  const showMCQ = answersReady && !isBlendLike(question);

  return (
    <div className="activity-root">
      {!audioUnlocked && <AudioStartOverlay />}
      <div className="activity-header">
        <button className="activity-back-btn" onClick={() => onBack ? onBack() : navigate('/map')}>
          ⬅ Back
        </button>
      </div>
      <div className="activity-stacked-layout">
        <PhaserGame
          sceneType="multiple-choice"
          sceneData={{ unitName: activity.unit, questionIndex: queueIdx }}
          onSceneReady={scene => {
            phaserRef.current = scene;
            if (introCallbackRef.current) {
              const cb = introCallbackRef.current;
              introCallbackRef.current = null;
              cb();
            }
          }}
        />
        {showTiles && (
          <BuildTheWordTiles
            ref={tileRowRef}
            letters={displayLetters}
            tileStates={tileStates}
            promptPlaying={promptPlaying}
            transition={transition}
            onLetterTap={handleLetterTap}
          />
        )}
        {showMCQ && (
          <MultipleChoice
            question={question}
            selected={selected}
            feedback={feedback}
            eliminated={eliminated}
            transition={transition}
            promptPlaying={promptPlaying}
            onAnswer={handleAnswer}
          />
        )}
      </div>
    </div>
  );
};
