import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../../PhaserGame';
import { BuildTheWordActivity as BuildTheWordActivityData } from '../../../data/activities';
import { BuildTheWordTiles, TileState } from './BuildTheWordTiles';
import { usePlayAudio, useStopAllAudio } from '../../../utils/audioUtils';
import { useAudioUnlocked } from '../../../context/AudioManagerContext';
import { AudioStartOverlay } from '../../AudioStartOverlay';
import '../MultipleChoice/MultipleChoiceActivity.css';

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

interface BuildTheWordExerciseProps {
  activity: BuildTheWordActivityData;
  onComplete: () => void;
  onBack?: () => void;
}

function makeInitialTileStates(count: number): TileState[] {
  return Array.from({ length: count }, (_, i) => (i === 0 ? 'active' : 'untapped'));
}

export const BuildTheWordExercise: React.FC<BuildTheWordExerciseProps> = ({ activity, onComplete, onBack }) => {
  const navigate = useNavigate();
  const audioUnlocked = useAudioUnlocked();
  const playAudio = usePlayAudio();
  const stopAll = useStopAllAudio();
  const phaserRef = useRef<any>(null);

  const [wordIndex, setWordIndex] = useState(0);
  const [nextTapIndex, setNextTapIndex] = useState(0);
  const [tileStates, setTileStates] = useState<TileState[]>(() =>
    makeInitialTileStates(activity.words[0].letters.length)
  );
  const [promptPlaying, setPromptPlaying] = useState(true);

  const item = activity.words[wordIndex];

  // Play intro sequence whenever wordIndex changes
  useEffect(() => {
    stopAll();
    setPromptPlaying(true);
    let alive = true;

    async function runIntro() {
      await playAudio(activity.promptFile, true).catch(() => {});
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
  }, [wordIndex]);

  const advanceWord = useCallback(async () => {
    const nextWord = wordIndex + 1;
    if (nextWord < activity.words.length) {
      setWordIndex(nextWord);
      setNextTapIndex(0);
      setTileStates(makeInitialTileStates(activity.words[nextWord].letters.length));
    } else {
      onComplete();
    }
  }, [wordIndex, activity.words, onComplete]);

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
        await delay(200);
        await playAudio(item.wordAudioFile, true).catch(() => {});
        await delay(800);
        advanceWord();
      } else {
        setNextTapIndex(index + 1);
      }
    } else {
      // Wrong tap — play the phoneme they tapped so they can hear it
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
  }, [promptPlaying, tileStates, nextTapIndex, item, advanceWord, playAudio]);

  useEffect(() => {
    return () => {
      phaserRef.current?.scene?.stop?.();
    };
  }, []);

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
