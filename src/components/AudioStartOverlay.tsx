import React from 'react';
import { triggerAudioUnlock } from '../context/AudioManagerContext';
import './AudioStartOverlay.css';

interface Props {
  /** Called after audio is unlocked (for any extra side-effects). */
  onStart?: () => void;
}

/**
 * Full-screen overlay shown until audio is unlocked.
 * Only the play button triggers audio unlock — tapping the dark backdrop
 * or the Phaser scene beneath does nothing, so audio starts intentionally.
 */
export const AudioStartOverlay: React.FC<Props> = ({ onStart }) => {
  function handlePlay() {
    triggerAudioUnlock();
    onStart?.();
  }

  return (
    <div className="audio-start-overlay">
      <div className="audio-start-card">
        <button
          className="audio-start-play-btn"
          onClick={handlePlay}
          aria-label="Start audio"
        >
          ▶
        </button>
        <p className="audio-start-label">Tap to start</p>
      </div>
    </div>
  );
};
