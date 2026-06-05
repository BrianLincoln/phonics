import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../../PhaserGame';
import { BuildTheWordActivity as BuildTheWordActivityData } from '../../../data/activities';
import { BuildTheWordTiles } from './BuildTheWordTiles';
import { useAudioUnlocked } from '../../../context/AudioManagerContext';
import { AudioStartOverlay } from '../../AudioStartOverlay';
import { useBlendTapHandler } from '../../../hooks/useBlendTapHandler';
import '../MultipleChoice/MultipleChoiceActivity.css';

interface BuildTheWordExerciseProps {
  activity: BuildTheWordActivityData;
  onComplete: () => void;
  onBack?: () => void;
  // When true, skip the full-page layout and PhaserGame (tiles are fixed-positioned
  // and will overlay the parent's existing Phaser canvas — prevents double-canvas flash).
  embedded?: boolean;
}

export const BuildTheWordExercise: React.FC<BuildTheWordExerciseProps> = ({ activity, onComplete, onBack, embedded }) => {
  const navigate = useNavigate();
  const audioUnlocked = useAudioUnlocked();
  const phaserRef = useRef<any>(null);

  const [wordIndex, setWordIndex] = useState(0);
  const item = activity.words[wordIndex];

  const advanceWord = useCallback(() => {
    const nextWord = wordIndex + 1;
    if (nextWord < activity.words.length) {
      setWordIndex(nextWord);
      // hook's useEffect resets tiles and plays intro when item changes
    } else {
      onComplete();
    }
  }, [wordIndex, activity.words, onComplete]);

  const { tileStates, promptPlaying, handleLetterTap } = useBlendTapHandler({
    item,
    onComplete: advanceWord,
    onCorrectTap: () => phaserRef.current?.onCorrectTap?.(),
    onWrongTap:   () => phaserRef.current?.onWrongTap?.(),
  });

  useEffect(() => {
    return () => {
      phaserRef.current?.scene?.stop?.();
    };
  }, []);

  if (embedded) {
    return (
      <BuildTheWordTiles
        letters={item.letters}
        tileStates={tileStates}
        promptPlaying={promptPlaying}
        onLetterTap={handleLetterTap}
      />
    );
  }

  return (
    <div className="activity-root">
      {!audioUnlocked && <AudioStartOverlay />}
      <div className="activity-header">
        <button className="activity-back-btn" onClick={() => onBack ? onBack() : navigate('/map')}>⬅ Back</button>
      </div>
      <div className="activity-stacked-layout">
        <PhaserGame
          sceneType="build-the-word"
          sceneData={{ unitName: activity.unit }}
          onSceneReady={scene => { phaserRef.current = scene; }}
        />
        <BuildTheWordTiles
          letters={item.letters}
          tileStates={tileStates}
          promptPlaying={promptPlaying}
          onLetterTap={handleLetterTap}
        />
      </div>
    </div>
  );
};
