import React from 'react';
import './AudioStartOverlay.css';

interface Props {
  /** Called when the user taps the overlay (for any extra side-effects). */
  onStart?: () => void;
}

/**
 * Full-screen overlay shown until the user has interacted with the page.
 * The document-level capture listener in AudioManagerContext fires on the
 * same click, unlocking audio. This component just makes that requirement
 * visible and explains what to do.
 */
export const AudioStartOverlay: React.FC<Props> = ({ onStart }) => (
  <div className="audio-start-overlay" onClick={onStart}>
    <div className="audio-start-card">
      <div className="audio-start-play-btn">▶</div>
      <p className="audio-start-label">Tap to start</p>
    </div>
  </div>
);
