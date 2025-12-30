import './MultipleChoice.css'

interface MultipleChoiceProps {
  question: any
  selected?: string | null
  feedback?: 'correct' | 'wrong' | null
  onAnswer: (word: string) => void
}

import React, { useEffect, useState } from 'react';

const MultipleChoice: React.FC<MultipleChoiceProps> = ({ question, selected, feedback, onAnswer }) => {
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
    <div className="multiple-choice-answers">
      {question.options.map(option => {
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
            className={`quiz-answer${isCorrect ? ' correct' : ''}${isWrong ? ' wrong' : ''}${animClass}`}
            onClick={() => onAnswer(option)}
            disabled={!!selected}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};

export default MultipleChoice
