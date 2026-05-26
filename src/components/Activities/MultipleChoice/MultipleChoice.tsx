import './MultipleChoice.css'

interface MultipleChoiceProps {
  question: any
  selected?: string | null
  feedback?: 'correct' | 'wrong' | null
  eliminated?: string[]
  transition?: 'idle' | 'exiting' | 'entering'
  promptPlaying?: boolean
  onAnswer: (word: string) => void
}

import React, { useEffect, useState } from 'react';

const MultipleChoice: React.FC<MultipleChoiceProps> = ({ question, selected, feedback, eliminated = [], transition, promptPlaying, onAnswer }) => {
  const [animating, setAnimating] = useState<string | null>(null);

  useEffect(() => {
    if (!selected || !feedback) {
      setAnimating(null);
      return;
    }
    setAnimating(selected);
    const timeout = setTimeout(() => setAnimating(null), 500);
    return () => clearTimeout(timeout);
  }, [selected, feedback]);

  const total = question.options.length;
  const center = (total - 1) / 2;

  return (
    <div className={`multiple-choice-answers${transition === 'exiting' ? ' exiting' : transition === 'entering' ? ' entering' : ''}`}>
      {question.options.map((option: string, idx: number) => {
        const isEliminated = eliminated.includes(option);
        const fanX = `${((idx - center) * 22).toFixed(1)}vw`;

        const isCorrect = feedback === 'correct' && option === question.correctAnswer;
        const isWrong = feedback === 'wrong' && option === selected;
        let animClass = '';
        if (animating === option) {
          animClass = isCorrect ? ' animate-scale' : isWrong ? ' animate-shake' : '';
        }
        return (
          <button
            key={option}
            style={{
              '--fan-x': fanX,
              '--enter-delay': `${idx * 25}ms`,
            } as React.CSSProperties}
            className={`quiz-answer${isEliminated ? ' eliminated' : ''}${isCorrect ? ' correct' : ''}${isWrong ? ' wrong' : ''}${animClass}${promptPlaying ? ' prompt-playing' : ''}${selected && !isCorrect && !isWrong ? ' answer-locked' : ''}`}
            onClick={() => onAnswer(option)}
            disabled={!!promptPlaying || isEliminated}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};

export default MultipleChoice
