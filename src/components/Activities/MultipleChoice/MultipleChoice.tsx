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

  const visibleOptions = question.options.filter((o: string) => !eliminated.includes(o));
  const total = visibleOptions.length;
  const center = (total - 1) / 2;

  return (
    <div className={`multiple-choice-answers${transition === 'exiting' ? ' exiting' : transition === 'entering' ? ' entering' : ''}`}>
      {visibleOptions.map((option: string, idx: number) => {
        const fanX = `${((idx - center) * 22).toFixed(1)}vw`;

        const isSelected = selected === option;
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
