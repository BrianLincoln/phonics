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
  const [eliminated, setEliminated] = useState<string[]>([]);
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
    playAudio(FEEDBACK_AUDIO[isCorrect ? 'correct' : 'wrong'], true).catch(() => {});

    if (isCorrect) {
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
      const doAdvance = async () => {
        await delay(1500);
        setTransition('exiting');
        await delay(280);
        setSelected(null);
        setFeedback(null);
        setEliminated([]);
        setGenerated(generateQuestion());
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
      setScore(s => ({ ...s, total: s.total + 1 }));
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
          eliminated={eliminated}
          transition={transition}
          promptPlaying={promptPlaying}
          onAnswer={handleAnswer}
        />
      </div>
    </div>
  );
};
