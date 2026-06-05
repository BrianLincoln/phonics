import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../PhaserGame';
import { BuildTheWordTiles } from './BuildTheWord/BuildTheWordTiles';
import { generateBlendWordForLetters } from '../../data/blendEndlessMode';
import type { BuildTheWordItem } from '../../data/activities';
import { useAudioUnlocked } from '../../context/AudioManagerContext';
import { AudioStartOverlay } from '../AudioStartOverlay';
import { useProfile } from '../../context/ProfileContext';
import { storageAdapter } from '../../store/storage';
import { curriculum } from '../../data/curriculum';
import { useBlendTapHandler } from '../../hooks/useBlendTapHandler';
import './MultipleChoice/MultipleChoiceActivity.css';

export const BlendEndlessActivity: React.FC = () => {
  const navigate = useNavigate();
  const audioUnlocked = useAudioUnlocked();
  const phaserRef = useRef<any>(null);
  const { activeProfile } = useProfile();

  const [availableLetters, setAvailableLetters] = useState<Set<string> | null>(null);
  const [item, setItem] = useState<BuildTheWordItem | null>(null);
  const [wordsBuilt, setWordsBuilt] = useState(0);

  // Load map progress and derive the set of letters the user has completed
  useEffect(() => {
    if (!activeProfile) return;
    storageAdapter.getMapProgress(activeProfile.id).then(progress => {
      const completed = new Set<string>();
      for (const node of curriculum) {
        if (node.type === 'grapheme' && progress[node.id]?.status === 'complete') {
          completed.add(node.focus);
        }
      }
      setAvailableLetters(completed);
    });
  }, [activeProfile]);

  // Pick the first word once letters are loaded
  useEffect(() => {
    if (availableLetters === null) return;
    setItem(generateBlendWordForLetters(availableLetters));
  }, [availableLetters]);

  const loadNextWord = () => {
    if (!availableLetters) return;
    setWordsBuilt(n => n + 1);
    setItem(generateBlendWordForLetters(availableLetters));
  };

  const { tileStates, promptPlaying, handleLetterTap } = useBlendTapHandler({
    item,
    onComplete: loadNextWord,
    onCorrectTap: () => phaserRef.current?.onCorrectTap?.(),
    onWrongTap:   () => phaserRef.current?.onWrongTap?.(),
  });

  useEffect(() => {
    return () => { phaserRef.current?.scene?.stop?.(); };
  }, []);

  if (!item) {
    return (
      <div className="activity-root">
        <div className="activity-header">
          <button className="activity-back-btn" onClick={() => navigate('/menu')}>⬅ Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-root">
      {!audioUnlocked && <AudioStartOverlay />}
      <div className="activity-header">
        <button className="activity-back-btn" onClick={() => navigate('/menu')}>⬅ Back</button>
        <span className="endless-score">{wordsBuilt} built</span>
      </div>
      <div className="activity-stacked-layout">
        <PhaserGame
          sceneType="build-the-word"
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
