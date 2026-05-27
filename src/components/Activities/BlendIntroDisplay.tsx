import React from 'react';
import './BuildTheWord/BuildTheWordTiles.css';

interface Props {
  letters: string[];
  highlightedIndex: number | null;
  sweeping: boolean;
  transition: 'idle' | 'exiting' | 'entering';
}

export const BlendIntroDisplay: React.FC<Props> = ({ letters, highlightedIndex, sweeping, transition }) => (
  <div className={`tile-row${transition !== 'idle' ? ` ${transition}` : ''}`}>
    {letters.map((letter, i) => (
      <div
        key={i}
        className={[
          'letter-tile',
          sweeping ? 'tile-tapped' : highlightedIndex === i ? 'tile-active' : '',
        ].filter(Boolean).join(' ')}
      >
        {letter}
      </div>
    ))}
  </div>
);
