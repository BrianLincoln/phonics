import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../PhaserGame';
import { generateQuestion } from '../../data/endlessMode';
import MultipleChoice from './MultipleChoice/MultipleChoice';
import { usePlayAudio, useStopAllAudio } from '../../utils/audioUtils';
import './MultipleChoice/MultipleChoiceActivity.css';

const FEEDBACK_AUDIO = {
  correct: '/audio/system/correct.wav',
  wrong: '/audio/system/incorrect.wav',
};

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const EndlessActivity: React.FC = () => {
  const navigate = useNavigate();
  const [{ question }, setGenerated] = useState(() => generateQuestion());
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [revealCorrect, setRevealCorrect] = useState(false);
  const [transition, setTransition] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const [promptPlaying, setPromptPlaying] = useState(true);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const phaserRef = useRef<any>(null);
  const playAudio = usePlayAudio();
  const stopAll = useStopAllAudio();

  const handleAnswer = async (word: string) => {
    if (selected || promptPlaying) return;
    const isCorrect = word === question.correctAnswer;

    setSelected(word);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));

    // Fire audio without awaiting — it plays concurrently with the crow animation.
    // The delay below is long enough that the sound finishes before we advance.
    playAudio(FEEDBACK_AUDIO[isCorrect ? 'correct' : 'wrong'], true).catch(() => {});

    const doAdvance = async () => {
      if (isCorrect) {
        await delay(1500);
      } else {
        setRevealCorrect(true);
        await delay(1500);
        setRevealCorrect(false);
      }
      setTransition('exiting');
      await delay(280);
      setSelected(null);
      setFeedback(null);
      setGenerated(generateQuestion());
      setTransition('entering');
      await delay(350);
      setTransition('idle');
    };

    console.log('[EndlessActivity] handleAnswer', { isCorrect, hasScene: !!phaserRef.current, hasMethod: !!phaserRef.current?.onQuestionAnswered });
    if (phaserRef.current?.onQuestionAnswered) {
      phaserRef.current.onQuestionAnswered(isCorrect, doAdvance);
    } else {
      doAdvance();
    }
  };

  useEffect(() => {
    stopAll();
    setPromptPlaying(true);
    let alive = true;

    async function playPrompt() {
      if (!alive) return;
      await playAudio(question.promptFile, true).catch(() => {});
      if (!alive) return;
      await playAudio(question.phonemeFile, true).catch(() => {});
      if (!alive) return;
      setPromptPlaying(false);
    }

    playPrompt();

    return () => {
      alive = false;
      stopAll();
    };
  }, [question.id]);

  useEffect(() => {
    return () => {
      phaserRef.current?.scene?.stop?.();
    };
  }, []);

  return (
    <div className='activity-root'>
      <div className="activity-header">
        <button className="activity-back-btn" onClick={() => navigate('/')}>⬅ Back</button>
        <span className="endless-score">{score.correct} / {score.total}</span>
      </div>
      <div className="activity-stacked-layout">
        <PhaserGame
          sceneType="endless"
          onSceneReady={scene => { phaserRef.current = scene; }}
        />
        <MultipleChoice
          question={question as any}
          selected={selected}
          feedback={feedback}
          revealCorrect={revealCorrect}
          transition={transition}
          promptPlaying={promptPlaying}
          onAnswer={handleAnswer}
        />
      </div>
    </div>
  );
};
