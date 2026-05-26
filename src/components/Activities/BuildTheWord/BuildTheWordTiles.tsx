import React from 'react';
import './BuildTheWordTiles.css';

export type TileState = 'untapped' | 'active' | 'tapped' | 'wrong';

interface BuildTheWordTilesProps {
  letters: string[];
  tileStates: TileState[];
  promptPlaying: boolean;
  transition?: 'idle' | 'exiting' | 'entering';
  onLetterTap: (index: number) => void;
}

export const BuildTheWordTiles = React.forwardRef<HTMLDivElement, BuildTheWordTilesProps>(
  ({ letters, tileStates, promptPlaying, transition, onLetterTap }, ref) => {
    const transClass =
      transition === 'exiting' ? ' exiting'
      : transition === 'entering' ? ' entering'
      : '';

    return (
      <div ref={ref} className={`tile-row${transClass}`}>
        {letters.map((letter, idx) => {
          const state = tileStates[idx];
          const isDisabled = promptPlaying || state === 'tapped';
          return (
            <button
              key={idx}
              style={{ '--enter-delay': `${idx * 25}ms` } as React.CSSProperties}
              className={`letter-tile tile-${state}${promptPlaying ? ' prompt-playing' : ''}`}
              onClick={() => onLetterTap(idx)}
              disabled={isDisabled}
            >
              {letter}
            </button>
          );
        })}
      </div>
    );
  },
);

BuildTheWordTiles.displayName = 'BuildTheWordTiles';
