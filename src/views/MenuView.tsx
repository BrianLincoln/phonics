import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { getNextActivityId } from '../utils/getNextActivityId';
import { usePlayAudio } from '../utils/audioUtils';
import { CLICK_SOUND } from '../utils/clickSound';
import { useProfile } from '../context/ProfileContext';
import { ProfileAvatar } from '../components/ProfileAvatar';
import './MenuView.css';

const MenuView: React.FC = () => {
  const navigate = useNavigate();
  const playAudio = usePlayAudio();
  const { activeProfile, switchLearner } = useProfile();

  const click = () => playAudio(CLICK_SOUND).catch(() => {});

  function handleSwitch() {
    switchLearner();
    navigate('/');
  }

  return (
    <div className="menu-root">
      <div className="menu-learner">
        {activeProfile && <ProfileAvatar profile={activeProfile} />}
        <span className="menu-learner__name">{activeProfile?.name}</span>
        <button className="menu-learner__switch" onClick={handleSwitch}>
          Switch
        </button>
      </div>

      <h1 className="menu-title">Phonics App</h1>

      <div className="menu-buttons">
        <button
          className="menu-btn play"
          onClick={async () => { await click(); navigate('/map'); }}
        >
          ▶ Play
        </button>
        <button className="menu-btn" onClick={async () => { await click(); navigate('/endless'); }}>🔤 Letter Sounds</button>
        <button className="menu-btn" onClick={async () => { await click(); navigate('/endless-blend'); }}>🧩 Blending</button>
        <button className="menu-btn" onClick={async () => { await click(); navigate('/endless-mixed'); }}>✨ All Skills</button>
        <button className="menu-btn" onClick={async () => { await click(); navigate('/units'); }}>Units</button>
        <button className="menu-btn" onClick={async () => { await click(); navigate('/progress'); }}>Progress</button>
        <button className="menu-btn" onClick={async () => { await click(); navigate('/crow-demo'); }}>Crow Demo</button>
        <hr className="menu-divider" />
        <button
          className="menu-btn menu-btn--deprecated"
          onClick={async () => {
            await click();
            const nextActivityId = getNextActivityId();
            navigate(`/activity/${nextActivityId}`);
          }}
        >
          Play (legacy)
        </button>
      </div>
    </div>
  );
};

export default MenuView;
