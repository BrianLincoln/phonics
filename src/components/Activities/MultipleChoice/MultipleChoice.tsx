import './MultipleChoice.css'

interface MultipleChoiceProps {
  question: any
  selected?: string | null
  feedback?: 'correct' | 'wrong' | null
  revealCorrect?: boolean
  transition?: 'idle' | 'exiting' | 'entering'
  promptPlaying?: boolean
  onAnswer: (word: string) => void
}

import React, { useEffect, useState } from 'react';

const MultipleChoice: React.FC<MultipleChoiceProps> = ({ question, selected, feedback, revealCorrect, transition, promptPlaying, onAnswer }) => {
  const [animating, setAnimating] = useState<string | null>(null);

  useEffect(() => {
    if (!selected || !feedback) {
      setAnimating(null);
      return;
    }
    // Animate only the selected button
    setAnimating(selected);
    const timeout = setTimeout(() => setAnimating(null), 500);
    return () => clearTimeout(timeout);
  }, [selected, feedback]);

  return (
    <div className={`multiple-choice-answers${transition === 'exiting' ? ' exiting' : transition === 'entering' ? ' entering' : ''}`}>
      {question.options.map((option: string, idx: number) => {
        const total = question.options.length;
        const center = (total - 1) / 2;
        const fanX = `${((idx - center) * 22).toFixed(1)}vw`;

        const isSelected = selected === option;
        const isCorrect = (feedback === 'correct' && option === question.correctAnswer)
          || (feedback === 'wrong' && revealCorrect && option === question.correctAnswer);
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
            className={`quiz-answer${isCorrect ? ' correct' : ''}${isWrong ? ' wrong' : ''}${animClass}${promptPlaying ? ' prompt-playing' : ''}`}
            onClick={() => onAnswer(option)}
            disabled={!!selected || !!promptPlaying}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};

export default MultipleChoice
