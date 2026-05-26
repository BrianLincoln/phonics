import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../../../components/PhaserGame';
import { MultipleChoiceActivity } from '../../../data/activities';
import MultipleChoice from './MultipleChoice';
import './MultipleChoiceActivity.css';
import { usePlayAudio, useStopAllAudio } from '../../../utils/audioUtils';
import { useAudioUnlocked } from '../../../context/AudioManagerContext';
import { AudioStartOverlay } from '../../AudioStartOverlay';

const FEEDBACK_AUDIO = {
  correct: '/audio/system/correct.wav',
  wrong: '/audio/system/incorrect.wav',
};

const INTRO_PROMPTS = {
  thisIs:     '/audio/prompts/this-is-the-letter.wav',
  makesSound: '/audio/prompts/it-makes-the-sound.wav',
};

interface MCQActivityProps {
  activity: MultipleChoiceActivity;
  onComplete: (result?: any) => void;
  onBack?: () => void;
  /** If set, plays "This is the letter / It makes the sound" after the crow carry-in animation */
  introUnit?: { nameAudio?: string; soundAudio?: string };
}

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const MCQActivity: React.FC<MCQActivityProps> = ({ activity, onComplete, onBack, introUnit }) => {
  const navigate = useNavigate();

  const queueRef = useRef([...activity.questions!]);
  const requeuedIds = useRef(new Set<string>());
  const [queueIdx, setQueueIdx] = useState(0);
  const question = queueRef.current[queueIdx];

  const audioUnlocked = useAudioUnlocked();
  const phaserRef = useRef<any>(null);
  const playAudio = usePlayAudio();
  const stopAll = useStopAllAudio();

  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const hadWrongRef = useRef(false);
  const [transition, setTransition] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const [promptPlaying, setPromptPlaying] = useState(true);

  // When there's an intro, answers are hidden until the first question prompt starts.
  // A ref mirrors the state so playQuestionPrompt (inside the effect) can read it
  // without going stale.
  const [answersReady, setAnswersReady] = useState(() => !introUnit);
  const answersReadyRef = useRef(!introUnit);

  // Holds the carry-in callback until onSceneReady fires (intro path only)
  const introCallbackRef = useRef<(() => void) | null>(null);

  const advance = (wasCorrect: boolean) => {
    if (!wasCorrect) {
      const q = queueRef.current[queueIdx];
      const id = q.correctAnswer;
      if (!requeuedIds.current.has(id)) {
        requeuedIds.current.add(id);
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

  const handleAnswer = async (word: string) => {
    if (selected || promptPlaying) return;
    const isCorrect = word === question.correctAnswer;

    setSelected(word);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    playAudio(FEEDBACK_AUDIO[isCorrect ? 'correct' : 'wrong'], true).catch(() => {});

    if (isCorrect) {
      const doAdvance = async () => {
        await delay(1500);
        setTransition('exiting');
        await delay(280);
        setSelected(null);
        setFeedback(null);
        setEliminated([]);
        hadWrongRef.current = false;
        // Reset promptPlaying=true in the same React 18 batch as the index
        // advance so the new question's buttons never render in an enabled state.
        setPromptPlaying(true);
        advance(true);
        setTransition('entering');
        await delay(350);
        setTransition('idle');
      };
      if (phaserRef.current?.onQuestionAnswered) {
        phaserRef.current.onQuestionAnswered(true, doAdvance);
      } else {
        doAdvance();
      }
    } else {
      hadWrongRef.current = true;
      const q = queueRef.current[queueIdx];
      const id = q.correctAnswer;
      if (!requeuedIds.current.has(id)) {
        requeuedIds.current.add(id);
        const insertAt = Math.min(queueIdx + 3, queueRef.current.length);
        queueRef.current.splice(insertAt, 0, q);
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

  useEffect(() => {
    stopAll();
    setPromptPlaying(true);
    let alive = true;

    // Plays the actual question prompt audio, then unlocks answers.
    // If answers are still hidden (intro path), animates them in first.
    async function playQuestionPrompt() {
      if (!alive) return;

      if (!answersReadyRef.current) {
        // Brief pause after the intro audio before the first question starts.
        await delay(700);
        if (!alive) return;

        // Reveal answers with the enter animation in the same render that
        // sets promptPlaying=true, so they slide in already dimmed/disabled.
        answersReadyRef.current = true;
        setAnswersReady(true);
        setTransition('entering');
        // Let the 220 ms enter animation play before marking transition idle.
        // Audio starts in parallel — intentional, it accompanies the slide-in.
        setTimeout(() => { if (alive) setTransition('idle'); }, 350);
      }

      await playAudio(question.promptFile, true).catch(() => {});
      if (!alive) return;
      await playAudio(question.phonemeFile, true).catch(() => {});
      if (!alive) return;
      setPromptPlaying(false);
    }

    function prepareAndPlay() {
      const showLetter = !!(question as any).showLetter;
      if (phaserRef.current?.prepareForQuestion) {
        phaserRef.current.prepareForQuestion(showLetter, playQuestionPrompt);
      } else {
        playQuestionPrompt();
      }
    }

    if (queueIdx === 0 && introUnit) {
      // Q1 with intro: play "This is the letter / It makes the sound" audio after the
      // crow carry-in, then let prepareForQuestion handle card visibility before Q1 prompt
      const withIntro = async () => {
        if (!alive) return;
        await playAudio(INTRO_PROMPTS.thisIs, true).catch(() => {});
        if (!alive) return;
        if (introUnit.nameAudio)  await playAudio(introUnit.nameAudio,  true).catch(() => {});
        if (!alive) return;
        await playAudio(INTRO_PROMPTS.makesSound, true).catch(() => {});
        if (!alive) return;
        if (introUnit.soundAudio) await playAudio(introUnit.soundAudio, true).catch(() => {});
        if (!alive) return;
        prepareAndPlay();
      };

      introCallbackRef.current = withIntro;

      if (phaserRef.current) {
        phaserRef.current.onCarryInComplete = withIntro;
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
    return () => {
      phaserRef.current?.scene?.stop?.();
    };
  }, []);

  return (
    <div className='activity-root'>
      {!audioUnlocked && <AudioStartOverlay />}
      <div className="activity-header">
        <button className="activity-back-btn" onClick={() => onBack ? onBack() : navigate('/')}>⬅ Back</button>
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
        {answersReady && (
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
