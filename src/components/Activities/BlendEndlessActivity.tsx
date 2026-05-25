import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../PhaserGame';
import { BuildTheWordTiles, TileState } from './BuildTheWord/BuildTheWordTiles';
import { generateBlendWord } from '../../data/blendEndlessMode';
import { usePlayAudio, useStopAllAudio } from '../../utils/audioUtils';
import { useAudioUnlocked } from '../../context/AudioManagerContext';
import { AudioStartOverlay } from '../AudioStartOverlay';
import './MultipleChoice/MultipleChoiceActivity.css';

const PROMPT_FILE = '/audio/prompts/tap-the-letters-to-build-the-word.wav';

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function makeInitialTileStates(count: number): TileState[] {
  return Array.from({ length: count }, (_, i) => (i === 0 ? 'active' : 'untapped'));
}

export const BlendEndlessActivity: React.FC = () => {
  const navigate = useNavigate();
  const audioUnlocked = useAudioUnlocked();
  const playAudio = usePlayAudio();
  const stopAll = useStopAllAudio();
  const phaserRef = useRef<any>(null);

  const [item, setItem] = useState(() => generateBlendWord());
  const [nextTapIndex, setNextTapIndex] = useState(0);
  const [tileStates, setTileStates] = useState<TileState[]>(() =>
    makeInitialTileStates(generateBlendWord().letters.length)
  );
  const [promptPlaying, setPromptPlaying] = useState(true);
  const [wordsBuilt, setWordsBuilt] = useState(0);

  // Play intro sequence whenever item changes
  useEffect(() => {
    stopAll();
    setPromptPlaying(true);
    let alive = true;

    async function runIntro() {
      await playAudio(PROMPT_FILE, true).catch(() => {});
      if (!alive) return;
      await playAudio(item.wordAudioFile, true).catch(() => {});
      if (!alive) return;
      setPromptPlaying(false);
    }

    runIntro();

    return () => {
      alive = false;
      stopAll();
    };
  }, [item]);

  const loadNextWord = useCallback(() => {
    const next = generateBlendWord();
    setItem(next);
    setNextTapIndex(0);
    setTileStates(makeInitialTileStates(next.letters.length));
  }, []);

  const handleLetterTap = useCallback(async (index: number) => {
    if (promptPlaying || tileStates[index] === 'tapped') return;

    if (index === nextTapIndex) {
      // Correct tap
      const isLastLetter = index === item.letters.length - 1;

      // Await the phoneme on the last tap so the word doesn't play over it
      if (isLastLetter) {
        await playAudio(item.phonemeFiles[index], true).catch(() => {});
      } else {
        playAudio(item.phonemeFiles[index]).catch(() => {});
      }

      const newStates = [...tileStates];
      newStates[index] = 'tapped';
      if (index + 1 < newStates.length) {
        newStates[index + 1] = 'active';
      }
      setTileStates(newStates);

      phaserRef.current?.onCorrectTap?.();

      if (isLastLetter) {
        // Word complete
        setWordsBuilt(n => n + 1);
        await delay(200);
        await playAudio(item.wordAudioFile, true).catch(() => {});
        await delay(800);
        loadNextWord();
      } else {
        setNextTapIndex(index + 1);
      }
    } else {
      // Wrong tap — play the phoneme they tapped
      playAudio(item.phonemeFiles[index]).catch(() => {});

      const newStates = [...tileStates];
      newStates[index] = 'wrong';
      setTileStates(newStates);

      phaserRef.current?.onWrongTap?.();

      setTimeout(() => {
        setTileStates(prev => {
          const reset = [...prev];
          reset[index] = 'untapped';
          return reset;
        });
      }, 400);
    }
  }, [promptPlaying, tileStates, nextTapIndex, item, loadNextWord, playAudio]);

  useEffect(() => {
    return () => {
      phaserRef.current?.scene?.stop?.();
    };
  }, []);

  return (
    <div className="activity-root">
      {!audioUnlocked && <AudioStartOverlay />}
      <div className="activity-header">
        <button className="activity-back-btn" onClick={() => navigate('/')}>⬅ Back</button>
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
