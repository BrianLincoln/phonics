import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../data/quizzes';
import { quizzes } from '../data/quizzes';
import { phonicsUnits } from '../data/phonicsUnits';
import './QuizView.css';

// For now, just use the first quiz as a demo
const quiz = quizzes[0];

const QuizView: React.FC = () => {
  const navigate = useNavigate();
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const question = quiz.questions[questionIdx];
  const unitName = phonicsUnits.find(u => u.id === quiz.unit)?.name || quiz.unit;

  const handleAnswer = (word: string) => {
    setSelected(word);
    setTimeout(() => {
      setSelected(null);
      if (questionIdx < quiz.questions.length - 1) {
        setQuestionIdx(q => q + 1);
      } else {
        navigate('/');
      }
    }, 900);
  };

  return (
    <div className="quiz-root">
      <button className="quiz-back" onClick={() => navigate('/')}>⬅ Back</button>
      <h2 className="quiz-title">{unitName}</h2>
      <div className="quiz-question">{question.promptFile.includes('which-word') ? 'Which word starts with the sound?' : 'Which letter makes the sound?'}</div>
      <div className="quiz-answers">
        {question.words.map(word => (
          <button
            key={word}
            className={`quiz-answer${selected === word ? (word === question.correctAnswer ? ' correct' : ' wrong') : ''}`}
            onClick={() => handleAnswer(word)}
            disabled={!!selected}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizView;
