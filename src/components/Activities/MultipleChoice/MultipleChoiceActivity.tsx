import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../../../components/PhaserGame';
import { MultipleChoiceActivity } from '../../../data/activities';
import MultipleChoice from './MultipleChoice';
import './MultipleChoiceActivity.css';
import { usePlayAudio, useStopAllAudio } from '../../../utils/audioUtils';

const FEEDBACK_AUDIO = {
  correct: '/audio/system/correct.wav',
  wrong: '/audio/system/incorrect.wav',
};

interface MCQActivityProps {
  activity: MultipleChoiceActivity;
  onComplete: (result?: any) => void;
}

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export const MCQActivity: React.FC<MCQActivityProps> = ({ activity, onComplete }) => {
  const navigate = useNavigate();

  // Queue stored as a ref so we can splice without triggering extra renders
  const queueRef = useRef([...activity.questions!]);
  const requeuedIds = useRef(new Set<string>());
  const [queueIdx, setQueueIdx] = useState(0);
  const question = queueRef.current[queueIdx];

  const phaserRef = useRef<any>(null);
  const playAudio = usePlayAudio();
  const stopAll = useStopAllAudio();

  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [revealCorrect, setRevealCorrect] = useState(false);
  const [transition, setTransition] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const [promptPlaying, setPromptPlaying] = useState(true);

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
      advance(isCorrect);
      setTransition('entering');
      await delay(350);
      setTransition('idle');
    };

    if (phaserRef.current?.onQuestionAnswered) {
      phaserRef.current.onQuestionAnswered(isCorrect, doAdvance);
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
  }, [queueIdx]);

  useEffect(() => {
    return () => {
      phaserRef.current?.scene?.stop?.();
    };
  }, []);

  return (
    <div className='activity-root'>
      <div className="activity-header">
        <button className="activity-back-btn" onClick={() => navigate('/')}>⬅ Back</button>
      </div>
      <div className="activity-stacked-layout">
        <PhaserGame
          sceneType="multiple-choice"
          sceneData={{ unitName: activity.unit, questionIndex: queueIdx }}
          onSceneReady={scene => { phaserRef.current = scene; }}
        />
        <MultipleChoice
          question={question}
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
