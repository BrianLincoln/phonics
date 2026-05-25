import React from 'react';
import './BuildTheWordTiles.css';

export type TileState = 'untapped' | 'active' | 'tapped' | 'wrong';

interface BuildTheWordTilesProps {
  letters: string[];
  tileStates: TileState[];
  promptPlaying: boolean;
  onLetterTap: (index: number) => void;
}

export const BuildTheWordTiles: React.FC<BuildTheWordTilesProps> = ({
  letters,
  tileStates,
  promptPlaying,
  onLetterTap,
}) => {
  return (
    <div className="tile-row">
      {letters.map((letter, idx) => {
        const state = tileStates[idx];
        const isDisabled = promptPlaying || state === 'tapped';
        return (
          <button
            key={idx}
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
};
