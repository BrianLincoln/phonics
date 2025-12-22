import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { getNextQuizId } from '../utils/quizSelectionUtils';
import { usePlayAudio } from '../utils/audioUtils';
import { CLICK_SOUND } from '../utils/clickSound';
import './MenuView.css';

const MenuView: React.FC = () => {
  const navigate = useNavigate();
  const playAudio = usePlayAudio();

  return (
    <div className="menu-root">
      <h1 className="menu-title">Phonics App</h1>
      <div className="menu-buttons">
        <button
          className="menu-btn play"
          onClick={async () => {
            await playAudio(CLICK_SOUND).catch(() => { });
            const nextQuizId = getNextQuizId();
            navigate(`/quiz?quizId=${nextQuizId}`);
          }}
        >
          ▶ Play
        </button>
        <button className="menu-btn" onClick={async () => { await playAudio(CLICK_SOUND).catch(() => { }); navigate('/quizzes'); }}>All Quizzes</button>
        <button className="menu-btn" onClick={async () => { await playAudio(CLICK_SOUND).catch(() => { }); navigate('/progress'); }}>Progress</button>
        <button className="menu-btn" onClick={async () => { await playAudio(CLICK_SOUND).catch(() => { }); navigate('/crow-demo'); }}>Crow Demo</button>
      </div>
    </div>
  );
};

export default MenuView;
