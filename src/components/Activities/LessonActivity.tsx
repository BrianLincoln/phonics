import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../../components/PhaserGame';
import {
  LessonActivity as LessonActivityData,
  LessonStep,
  BlendQuestion,
  ScrambledBlendQuestion,
  LetterIntroStep,
  BlendIntroStep,
  HideLetterStep,
  BlendLessonPass,
} from '../../data/activities';
import { units } from '../../data/units';
import { BlendIntroDisplay } from './BlendIntroDisplay';
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
  and: ['/audio/prompts/and.wav', '/audio/prompts/and2.wav', '/audio/prompts/and3.wav'],
};

const BLEND_LESSON_PROMPTS: Record<BlendLessonPass, string> = {
  model:       '/audio/prompts/listen.wav',
  choral:      '/audio/prompts/now-you-say-it-with-me.wav',
  independent: '/audio/prompts/your-turn-read-it.wav',
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

function isBlendLike(q: LessonStep): q is BlendLike {
  return q.kind === 'blend' || q.kind === 'scrambled-blend';
}

function isIntroStep(q: LessonStep): q is LetterIntroStep | BlendIntroStep | HideLetterStep {
  return q.kind === 'letter-intro' || q.kind === 'blend-intro' || q.kind === 'hide-letter';
}

export const LessonActivity: React.FC<LessonActivityProps> = ({
  activity,
  onComplete,
  onBack,
}) => {
  const navigate = useNavigate();

  // ── Question queue ────────────────────────────────────────────────────────
  const queueRef = useRef([...activity.steps]);
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
  const [answersReady, setAnswersReady] = useState(() => !isIntroStep(activity.steps[0]));
  const answersReadyRef = useRef(!isIntroStep(activity.steps[0]));

  // ── Blend-intro display state ─────────────────────────────────────────────
  // Word index is state (drives re-render when word changes); letters are derived
  // from the question directly so they're available on the first render with no timing race.
  const [blendIntroWordIndex, setBlendIntroWordIndex] = useState(0);
  const [blendIntroHighlight, setBlendIntroHighlight] = useState<number | null>(null);
  const [blendIntroSweeping, setBlendIntroSweeping] = useState(false);
  const [blendIntroTransition, setBlendIntroTransition] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const [blendIntroIsIndependentPass, setBlendIntroIsIndependentPass] = useState(false);
  const introCallbackRef = useRef<(() => void) | null>(null);
  const independentPassCompleteRef = useRef<(() => void) | null>(null);

  // ── Advance ───────────────────────────────────────────────────────────────
  const advance = (wasCorrect: boolean) => {
    // Blend and intro steps never re-queue
    if (!wasCorrect && !isBlendLike(question) && !isIntroStep(question)) {
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
    // For letter-sound: only play the sound on wrong answers (correct is redundant — it was just played as the prompt)
    if (question.kind === 'letter-sound' && !isCorrect) {
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

  // ── Blend tap handler (covers blend, scrambled-blend, and blend-intro independent) ─
  const handleLetterTap = async (displayIndex: number) => {
    // Allow taps for: blend questions, scrambled-blend questions, or blend-intro independent pass
    const isIndependentPass = question.kind === 'blend-intro' && blendIntroIsIndependentPass;
    if (promptPlaying || (!isBlendLike(question) && !isIndependentPass)) return;
    if (tileStates[displayIndex] === 'tapped') return;

    const q = question as BlendLike;
    const isScrambled = q.kind === 'scrambled-blend';
    const wordDef = isIndependentPass ? (question as any).words[blendIntroWordIndex] : null;
    const letterCount = isIndependentPass ? wordDef.letters.length : q.letters.length;

    // For ordered blend: displayIndex === originalIndex.
    // For scrambled: map display position back to original word position.
    const originalIndex = isScrambled ? shuffledIndices[displayIndex] : displayIndex;
    const isCorrectTap = originalIndex === nextTapIndex;

    if (isCorrectTap) {
      const isLastLetter = nextTapIndex === letterCount - 1;

      if (isLastLetter) {
        await playAudio(isIndependentPass ? wordDef.phonemeFiles[nextTapIndex] : q.phonemeFiles[nextTapIndex], true).catch(() => {});
      } else {
        playAudio(isIndependentPass ? wordDef.phonemeFiles[nextTapIndex] : q.phonemeFiles[nextTapIndex]).catch(() => {});
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

        // For blend exercises (not independent pass), play word audio here
        // For independent pass, the blend-intro handler will play it after showing the sweep
        if (!isIndependentPass) {
          const audioFile = q.wordAudioFile;
          await playAudio(audioFile, true).catch(() => {});
          await delay(200);
          doAdvanceQuestion(true);
        } else {
          // Independent pass: just resolve so the blend-intro handler can continue
          if (independentPassCompleteRef.current) {
            const cb = independentPassCompleteRef.current;
            independentPassCompleteRef.current = null;
            cb();
          }
        }
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
    } else if (question.kind === 'blend-intro') {
      setBlendIntroWordIndex(0);
      setBlendIntroHighlight(null);
      setBlendIntroSweeping(false);
      setBlendIntroTransition('idle');
    }

    let alive = true;

    async function playQuestionPrompt() {
      if (!alive) return;

      if (!answersReadyRef.current) {
        answersReadyRef.current = true;
        setAnswersReady(true);
        if (question.kind === 'scrambled-blend') {
          // Skip the slide-in animation — the scramble sequence IS the reveal.
          // Tiles appear instantly so the crow can push them without fighting the
          // tileEnter CSS animation (which also animates `transform`).
          setTransition('idle');
          // Two rAFs: first commits React state, second ensures layout is complete
          // so getBoundingClientRect() returns real tile positions.
          await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          if (!alive) return;
          // Brief pause so the student sees the word in correct order first.
          await delay(500);
          if (!alive) return;
        } else {
          setTransition('entering');
          setTimeout(() => { if (alive) setTransition('idle'); }, 350);
          // Wait one rAF so React commits the render.
          await new Promise<void>(resolve => requestAnimationFrame(resolve));
          if (!alive) return;
        }
      } else if (question.kind === 'scrambled-blend') {
        // Tiles were already visible (prior question). Wait for any exit/enter
        // transition to settle, then pause so student can see the word.
        await delay(500);
        if (!alive) return;
      }

      if (question.kind === 'blend') {
        await playAudio(question.promptFile, true).catch(() => {});
        if (!alive) return;
        await playAudio(question.wordAudioFile, true).catch(() => {});
      } else if (question.kind === 'scrambled-blend') {
        const shuffled = shuffleIndices(question.letters.length);
        const scene = phaserRef.current;
        const btns = tileRowRef.current
          ? Array.from(tileRowRef.current.querySelectorAll<HTMLButtonElement>('button.letter-tile'))
          : [];

        let ohNoPromise: Promise<void> = Promise.resolve();

        if (btns.length >= 3 && scene?.placeCrow) {
          const rects = btns.map(b => b.getBoundingClientRect());

          // X coordinates: CSS px === Phaser px in RESIZE mode (no canvas scaling).
          const leftX   = rects[0].left + rects[0].width  / 2;
          const centerX = rects[1].left + rects[1].width  / 2;
          const rightX  = rects[2].left + rects[2].width  / 2;
          const spacing = centerX - leftX;

          // Y: clamp to the Phaser camera height — the canvas may have been initialised
          // at a different window.innerHeight than the current CSS viewport
          // (browser chrome show/hide), so rects[0].bottom could exceed camH.
          const camH  = scene.cameras.main.height;
          const crowY = Math.min(rects[0].bottom, camH - 10);

          // Crow is 200px frame × 0.5 scale = 100px display, origin(0.5, 1).
          // gap = distance from crow centre to tile centre while "pushing".
          // Clamped so the crow's full 100px-wide body stays on screen.
          const CROW_HALF_W = 50;
          const desiredGap  = rects[0].width / 2 + CROW_HALF_W;
          const gap = Math.max(
            0,
            Math.min(
              desiredGap,
              leftX  - CROW_HALF_W - 5,                     // crow left  edge ≥ 5 px
              window.innerWidth - rightX - CROW_HALF_W - 5, // crow right edge ≥ 5 px
            ),
          );

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

          const D = 250; // carry duration ms

          // ── GATHER: left tile first, then right tile ───────────────────────
          // Crow is always to the side it's pushing FROM, facing the tile.
          // Moving a tile rightward → crow is LEFT of tile, faces RIGHT.
          // Moving a tile leftward  → crow is RIGHT of tile, faces LEFT.

          // Step 1 — push left tile rightward to centre
          scene.placeCrow(leftX - gap, crowY, 'right');
          await Promise.all([moveTile(0, +spacing, D), driveCrow(centerX - gap, D)]);

          // Step 2 — reposition to right of right tile, then push it leftward to centre
          await repoCrow(rightX + gap);
          await Promise.all([moveTile(2, -spacing, D), driveCrow(centerX + gap, D)]);
          // Crow is now at centerX + gap, facing left (walkInDuration auto-sets facing).

          // All tiles are now stacked at centre — play audio while we scatter
          ohNoPromise = playAudio(SCRAMBLE_PROMPTS.combined, true).then(() => {}, () => {});

          // ── SCATTER ────────────────────────────────────────────────────────
          // Step 3 — push dest-left tile from centre leftward to left position
          // Crow stays at centerX + gap (right of pile), drives left to leftX + gap
          const leftFinalOffset = -shuffled[0] * spacing;
          await Promise.all([
            moveTile(shuffled[0], leftFinalOffset, D),
            driveCrow(leftX + gap, D),
          ]);

          // Step 4 — push dest-right tile from centre rightward to right position
          // Reposition crow to left of centre pile, then drive right to rightX - gap
          await repoCrow(centerX - gap);
          const rightFinalOffset = (2 - shuffled[2]) * spacing;
          await Promise.all([
            moveTile(shuffled[2], rightFinalOffset, D),
            driveCrow(rightX - gap, D),
          ]);
          await delay(20);

          // Commit React state + reset WAAPI transforms before next paint
          setShuffledIndices(shuffled);
          setDisplayLetters(shuffled.map(i => (question as ScrambledBlendQuestion).letters[i]));
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

    if (question.kind === 'letter-intro') {
      const unit = units.find(u => u.id === activity.unit);
      const withLetterIntro = async () => {
        if (!alive) return;
        await playAudio(INTRO_PROMPTS.thisIs, true).catch(() => {});
        if (!alive) return;
        if (unit?.nameAudio) await playAudio(unit.nameAudio, true).catch(() => {});
        if (!alive) return;
        await playAudio(INTRO_PROMPTS.makesSound, true).catch(() => {});
        if (!alive) return;
        if (unit?.soundAudio) await playAudio(unit.soundAudio, true).catch(() => {});
        if (!alive) return;
        if (unit?.likeInWords?.length) await delay(700);
        if (!alive) return;
        if (unit?.likeInWords?.length) {
          await playAudio(INTRO_PROMPTS.likeIn, true).catch(() => {});
          if (!alive) return;
          for (let i = 0; i < unit.likeInWords.length; i++) {
            await playAudio(unit.likeInWords[i], true).catch(() => {});
            if (!alive) return;
            if (i < unit.likeInWords.length - 1) {
              const andFile = INTRO_PROMPTS.and[Math.min(i, INTRO_PROMPTS.and.length - 1)];
              await playAudio(andFile, true).catch(() => {});
              if (!alive) return;
            }
          }
        }
        if (alive) advance(true);
      };
      // Start audio immediately, let carry-in animation play in background
      withLetterIntro();
      introCallbackRef.current = null;
    } else if (question.kind === 'hide-letter') {
      // Non-interactive: crow steals the card, then auto-advance.
      const scene = phaserRef.current;
      if (scene?.crowTakeLetter) {
        scene.crowTakeLetter(() => { if (alive) advance(true); });
      } else {
        advance(true);
      }
    } else if (question.kind === 'blend-intro') {
      const withBlendIntro = async () => {
        // One rAF so React commits the initial render (tiles visible) before audio starts
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
        if (!alive) return;

        for (let wi = 0; wi < question.words.length; wi++) {
          const wordDef = question.words[wi];
          if (!alive) return;
          if (wi > 0) {
            // Slide old word out, swap, slide new word in
            setBlendIntroHighlight(null);
            setBlendIntroSweeping(false);
            setBlendIntroTransition('exiting');
            await delay(280);
            if (!alive) return;
            setBlendIntroWordIndex(wi);
            setBlendIntroTransition('entering');
            await delay(350);
            if (!alive) return;
            setBlendIntroTransition('idle');
            await delay(1650); // 280 + 350 + 1650 ≈ 2 s total between words
            if (!alive) return;
          }

          for (const pass of wordDef.passes) {
            if (!alive) return;

            // Prompt audio
            // For independent pass, use the blend prompt instead of "your turn read it"
            const promptFile = pass === 'independent' ? '/audio/prompts/tap-the-letters-to-build-the-word.wav' : BLEND_LESSON_PROMPTS[pass];
            await playAudio(promptFile, true).catch(() => {});
            if (!alive) return;

            if (pass === 'independent') {
              // Interactive independent pass: exactly like a blend exercise (user taps letters)
              setPromptPlaying(false);  // Allow taps now that prompt is done
              setBlendIntroIsIndependentPass(true);
              setNextTapIndex(0);
              setTileStates(makeInitialTileStates(wordDef.letters.length));
              setDisplayLetters([...wordDef.letters]);
              setShuffledIndices(wordDef.letters.map((_, i) => i));

              // Two rAFs to ensure React commits state AND layout is complete
              await new Promise<void>(resolve => {
                requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
              });
              if (!alive) return;

              // Wait for user to complete tapping all letters
              await new Promise<void>(resolve => {
                independentPassCompleteRef.current = resolve;
              });
              if (!alive) return;

              // User finished tapping - play word audio to confirm
              await playAudio(wordDef.wordAudioFile, true).catch(err => {
                console.error('Failed to play word audio:', wordDef.wordAudioFile, err);
              });
              if (!alive) return;

              setBlendIntroIsIndependentPass(false);
              setPromptPlaying(true);
              await delay(2000);
            } else {
              // Model/Choral passes: teacher-paced with visual highlighting and audio
              // Step through letters with increased pause between phonemes
              for (let i = 0; i < wordDef.letters.length; i++) {
                if (!alive) return;
                setBlendIntroHighlight(i);
                await playAudio(wordDef.phonemeFiles[i], true).catch(() => {});
                if (!alive) return;
                await delay(300);  // Increased from 80ms
              }

              // Sweep all letters → say the whole word
              setBlendIntroHighlight(null);
              setBlendIntroSweeping(true);
              await playAudio(wordDef.wordAudioFile, true).catch(() => {});
              if (!alive) return;
              setBlendIntroSweeping(false);
              setBlendIntroHighlight(null);

              await delay(2000);
            }
          }
        }
        if (alive) advance(true);
      };
      introCallbackRef.current = withBlendIntro;
      if (phaserRef.current) {
        introCallbackRef.current = null;
        withBlendIntro();
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
  const showBlendIntro = question.kind === 'blend-intro' && !blendIntroIsIndependentPass;
  const showBlendIntroTiles = question.kind === 'blend-intro' && blendIntroIsIndependentPass;
  const showTiles = (answersReady && isBlendLike(question) && !isIntroStep(question)) || showBlendIntroTiles;
  const showMCQ = answersReady && !isBlendLike(question) && !isIntroStep(question);

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
          sceneData={{ unitName: activity.unit, questionIndex: queueIdx, showFirstCard: !!(activity.steps.find(s => !isIntroStep(s)) as any)?.showLetter }}
          onSceneReady={scene => {
            phaserRef.current = scene;
            if (introCallbackRef.current) {
              const cb = introCallbackRef.current;
              introCallbackRef.current = null;
              cb();
            }
          }}
        />
        {showBlendIntro && !blendIntroIsIndependentPass && (
          <BlendIntroDisplay
            letters={(question as BlendIntroStep).words[blendIntroWordIndex]?.letters ?? []}
            highlightedIndex={blendIntroHighlight}
            sweeping={blendIntroSweeping}
            transition={blendIntroTransition}
          />
        )}
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
