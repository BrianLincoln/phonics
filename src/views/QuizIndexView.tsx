import React from 'react';
import { useNavigate } from 'react-router-dom';
import { quizzes } from '../data/quizzes';
import { phonicsUnits } from '../data/phonicsUnits';
import './QuizIndexView.css';

const QuizIndexView: React.FC = () => {
  const navigate = useNavigate();

  // Helper to get unit name
  const getUnitName = (quiz: typeof quizzes[number]) => {
    return phonicsUnits.find(u => u.id === quiz.unit)?.name || quiz.unit;
  };

  return (
    <div className="quiz-index-root">
      <button className="quiz-index-back" onClick={() => navigate('/')}>⬅ Back</button>
      <h2 className="quiz-index-title">Select a Quiz</h2>
      <div className="quiz-index-grid">
        {quizzes.map((quiz) => (
          <button
            key={quiz.unit}
            className="quiz-index-btn"
            onClick={() => navigate(`/quiz?quizId=${quiz.unit}`)}
          >
            {getUnitName(quiz)}
          </button>
        ))}
      </div>
      <h3 className="quiz-index-intro-title">Select a letter or letter team</h3>
      {/* Optionally, render phonics units grid here if needed */}
    </div>
  );
};

export default QuizIndexView;
