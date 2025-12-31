// MCQActivity.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../../../components/PhaserGame';
import { MultipleChoiceActivity } from '../../../data/activities';
import MultipleChoice from './MultipleChoice';
import './MultipleChoiceActivity.css';
import { usePlayAudio } from '../../../utils/audioUtils';
import { playFeedbackAudio } from '../../../helpers/feedbackAudio';

interface MCQActivityProps {
  activity: MultipleChoiceActivity;
  onComplete: (result?: any) => void;
}

export const MCQActivity: React.FC<MCQActivityProps> = ({ activity, onComplete }) => {
  const navigate = useNavigate();
  const [questionIdx, setQuestionIdx] = useState(0);
  const question = activity.questions![questionIdx];
  const phaserRef = useRef<any>(null);
  const playAudio = usePlayAudio();

  // Adapter to match playFeedbackAudio's expected signature
  const playAudioVoid = async (src: string, force?: boolean): Promise<void> => {
    await playAudio(src, force);
    // Ignore the returned HTMLAudioElement, just resolve void
  };

  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handleAnswer = async (word: string) => {
    if (selected) return; // Prevent double answer
    const isCorrect = word === question.correctAnswer;

    // Show selection and visual feedback
    setSelected(word);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    // Play audio feedback
    if (isCorrect) {
      await playFeedbackAudio('correct', playAudioVoid);
    } else {
      await playFeedbackAudio('wrong', playAudioVoid);
    }

    // Notify Phaser scene
    if (phaserRef.current?.onQuestionAnswered) {
      phaserRef.current.onQuestionAnswered(isCorrect, () => {
        // Reset for next question or finish
        setSelected(null);
        setFeedback(null);
        if (questionIdx < activity.questions!.length - 1) {
          setQuestionIdx(q => q + 1);
        } else {
          onComplete(isCorrect);
        }
      });
    }
  };

  useEffect(() => {
    async function playPrompt() {
      await playAudio(question.promptFile, true);
      await playAudioVoid(question.phonemeFile, true);
    }
    playPrompt();
  }, [questionIdx]);

  useEffect(() => {
    return () => {
      if (phaserRef.current) {
        phaserRef.current?.scene.stop();
      }
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
          sceneData={{ unitName: activity.unit, questionIndex: questionIdx }}
          onSceneReady={scene => { phaserRef.current = scene; }}
        />
        <MultipleChoice
          question={question}
          selected={selected}
          feedback={feedback}
          onAnswer={handleAnswer}
        />
      </div>
    </div>
  );
};
