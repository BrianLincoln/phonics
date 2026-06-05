import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { getNextActivityId } from '../utils/getNextActivityId';
import { usePlayAudio } from '../utils/audioUtils';
import { CLICK_SOUND } from '../utils/clickSound';
import { useProfile } from '../context/ProfileContext';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { storageAdapter } from '../store/storage';
import './MenuView.css';

const MenuView: React.FC = () => {
  const navigate = useNavigate();
  const playAudio = usePlayAudio();
  const { activeProfile, switchLearner } = useProfile();
  const [blendingUnlocked, setBlendingUnlocked] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!activeProfile) return;
    storageAdapter.getMapProgress(activeProfile.id).then(progress => {
      setBlendingUnlocked(progress['node-cp1']?.status === 'complete');
    });
  }, [activeProfile]);

  const click = () => playAudio(CLICK_SOUND).catch(() => {});

  function handleSwitch() {
    switchLearner();
    navigate('/');
  }

  async function go(path: string) {
    await click();
    setMenuOpen(false);
    navigate(path);
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

      <button
        className="menu-btn play"
        onClick={async () => { await click(); navigate('/map'); }}
      >
        ▶ Play
      </button>

      {/* Overlay to close the menu when clicking outside */}
      {menuOpen && (
        <div className="menu-fab-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* Expandable menu items */}
      <div className={`menu-fab-items${menuOpen ? ' menu-fab-items--open' : ''}`}>
        <button className="menu-fab-item" onClick={() => go('/endless')}>🔤 Letter Sounds</button>
        {blendingUnlocked && (
          <button className="menu-fab-item" onClick={() => go('/endless-blend')}>🧩 Blending</button>
        )}
        <button className="menu-fab-item" onClick={() => go('/endless-mixed')}>✨ All Skills</button>
        <button className="menu-fab-item" onClick={() => go('/units')}>Units</button>
        <button className="menu-fab-item" onClick={() => go('/progress')}>Progress</button>
        <button className="menu-fab-item" onClick={() => go('/crow-demo')}>Crow Demo</button>
        <button className="menu-fab-item menu-fab-item--muted" onClick={async () => { await click(); setMenuOpen(false); navigate(`/activity/${getNextActivityId()}`); }}>Play (legacy)</button>
      </div>

      {/* FAB trigger */}
      <button
        className={`menu-fab${menuOpen ? ' menu-fab--open' : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="More options"
      >
        {menuOpen ? '×' : '+'}
      </button>
    </div>
  );
};

export default MenuView;
