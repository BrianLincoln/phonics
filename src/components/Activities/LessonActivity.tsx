import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../../components/PhaserGame';
import { LessonActivity as LessonActivityData, LessonQuestion, BlendQuestion } from '../../data/activities';
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
};

interface LessonActivityProps {
  activity: LessonActivityData;
  onComplete: (result?: any) => void;
  onBack?: () => void;
  introUnit?: { nameAudio?: string; soundAudio?: string };
}

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function makeInitialTileStates(count: number): TileState[] {
  return Array.from({ length: count }, (_, i) => (i === 0 ? 'active' : 'untapped'));
}

function isBlend(q: LessonQuestion): q is BlendQuestion {
  return q.kind === 'blend';
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

  // ── Blend state ───────────────────────────────────────────────────────────
  const [nextTapIndex, setNextTapIndex] = useState(0);
  const [tileStates, setTileStates] = useState<TileState[]>([]);

  // ── Shared UI state ───────────────────────────────────────────────────────
  const [transition, setTransition] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const [promptPlaying, setPromptPlaying] = useState(true);
  const [answersReady, setAnswersReady] = useState(() => !introUnit);
  const answersReadyRef = useRef(!introUnit);

  const introCallbackRef = useRef<(() => void) | null>(null);

  // ── Advance ───────────────────────────────────────────────────────────────
  const advance = (wasCorrect: boolean) => {
    // Only re-queue MCQ wrong answers (blend questions advance linearly)
    if (!wasCorrect && !isBlend(question)) {
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

  // Shared transition out → reset → transition in
  const doAdvanceQuestion = async (wasCorrect: boolean) => {
    await delay(1500);
    setTransition('exiting');
    await delay(280);
    // Reset all question state
    setSelected(null);
    setFeedback(null);
    setEliminated([]);
    hadWrongRef.current = false;
    setNextTapIndex(0);
    setTileStates([]);
    setPromptPlaying(true);
    advance(wasCorrect);
    setTransition('entering');
    await delay(350);
    setTransition('idle');
  };

  // ── MCQ answer handler ────────────────────────────────────────────────────
  const handleAnswer = async (word: string) => {
    if (selected || promptPlaying || isBlend(question)) return;
    const isCorrect = word === (question as any).correctAnswer;

    setSelected(word);
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
      // Pre-insert re-queue before shake animation
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

  // ── Blend tap handler ─────────────────────────────────────────────────────
  const handleLetterTap = async (index: number) => {
    if (promptPlaying || !isBlend(question)) return;
    if (tileStates[index] === 'tapped') return;

    if (index === nextTapIndex) {
      // Correct tap
      const isLastLetter = index === question.letters.length - 1;

      if (isLastLetter) {
        await playAudio(question.phonemeFiles[index], true).catch(() => {});
      } else {
        playAudio(question.phonemeFiles[index]).catch(() => {});
      }

      const newStates = [...tileStates];
      newStates[index] = 'tapped';
      if (index + 1 < newStates.length) newStates[index + 1] = 'active';
      setTileStates(newStates);

      phaserRef.current?.onQuestionAnswered?.(true);

      if (isLastLetter) {
        await delay(200);
        await playAudio(question.wordAudioFile, true).catch(() => {});
        await delay(800);
        if (phaserRef.current?.onQuestionAnswered) {
          // crow already hopped on last letter tap — just advance
        }
        doAdvanceQuestion(true);
      } else {
        setNextTapIndex(index + 1);
      }
    } else {
      // Wrong tap
      playAudio(question.phonemeFiles[index]).catch(() => {});
      const newStates = [...tileStates];
      newStates[index] = 'wrong';
      setTileStates(newStates);
      phaserRef.current?.onQuestionAnswered?.(false);
      setTimeout(() => {
        setTileStates(prev => {
          const reset = [...prev];
          reset[index] = 'untapped';
          return reset;
        });
      }, 400);
    }
  };

  // ── Per-question setup effect ─────────────────────────────────────────────
  useEffect(() => {
    stopAll();
    setPromptPlaying(true);

    // Initialise tile state when landing on a blend question
    if (isBlend(question)) {
      setNextTapIndex(0);
      setTileStates(makeInitialTileStates(question.letters.length));
    }

    let alive = true;

    async function playQuestionPrompt() {
      if (!alive) return;

      if (!answersReadyRef.current) {
        await delay(700);
        if (!alive) return;
        answersReadyRef.current = true;
        setAnswersReady(true);
        setTransition('entering');
        setTimeout(() => { if (alive) setTransition('idle'); }, 350);
      }

      if (isBlend(question)) {
        await playAudio(question.promptFile, true).catch(() => {});
        if (!alive) return;
        await playAudio(question.wordAudioFile, true).catch(() => {});
      } else {
        await playAudio(question.promptFile, true).catch(() => {});
        if (!alive) return;
        await playAudio((question as any).phonemeFile, true).catch(() => {});
      }
      if (!alive) return;
      setPromptPlaying(false);
    }

    function prepareAndPlay() {
      // Blend questions always hide the letter card (it's not relevant to blending)
      const hideLetter = isBlend(question) ? true : (question as any).hideLetter as boolean | undefined;
      if (phaserRef.current?.prepareForQuestion) {
        phaserRef.current.prepareForQuestion(hideLetter, playQuestionPrompt);
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
        prepareAndPlay();
      };
      introCallbackRef.current = withIntro;
      if (phaserRef.current) phaserRef.current.onCarryInComplete = withIntro;
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
  const showBlend = answersReady && isBlend(question);
  const showMCQ = answersReady && !isBlend(question);

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
              phaserRef.current.onCarryInComplete = introCallbackRef.current;
            }
          }}
        />
        {showBlend && (
          <BuildTheWordTiles
            letters={(question as BlendQuestion).letters}
            tileStates={tileStates}
            promptPlaying={promptPlaying}
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
