import { useState, useEffect, useCallback } from 'react';
import { TileState } from '../components/Activities/BuildTheWord/BuildTheWordTiles';
import { usePlayAudio, useStopAllAudio } from '../utils/audioUtils';

const PROMPT_FILE = '/audio/prompts/tap-the-letters-to-build-the-word.wav';

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function makeInitialTileStates(count: number): TileState[] {
  return Array.from({ length: count }, (_, i) => (i === 0 ? 'active' : 'untapped'));
}

export interface BlendItem {
  letters: string[];
  wordAudioFile: string;
  phonemeFiles: string[];
}

interface UseBlendTapHandlerOptions {
  item: BlendItem | null;
  onComplete: () => void;
  onCorrectTap?: () => void;
  onWrongTap?: () => void;
}

interface UseBlendTapHandlerResult {
  tileStates: TileState[];
  promptPlaying: boolean;
  handleLetterTap: (index: number) => void;
}

/**
 * Centralised tap-sequence handler for all blend-building exercises.
 *
 * Handles:
 *  - intro playback (prompt → word) whenever `item` changes
 *  - correct tap progression (phoneme → next tile active → word audio → onComplete)
 *  - wrong tap: negative feedback → 600 ms pause → full tile reset → replay intro
 */
export function useBlendTapHandler({
  item,
  onComplete,
  onCorrectTap,
  onWrongTap,
}: UseBlendTapHandlerOptions): UseBlendTapHandlerResult {
  const playAudio = usePlayAudio();
  const stopAll = useStopAllAudio();

  const [nextTapIndex, setNextTapIndex] = useState(0);
  const [tileStates, setTileStates] = useState<TileState[]>([]);
  const [promptPlaying, setPromptPlaying] = useState(false);

  // Reset tiles and play the intro sequence whenever the item changes.
  useEffect(() => {
    if (!item) return;
    setNextTapIndex(0);
    setTileStates(makeInitialTileStates(item.letters.length));
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
  }, [item]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLetterTap = useCallback(async (index: number) => {
    if (!item || promptPlaying || tileStates[index] === 'tapped') return;

    if (index === nextTapIndex) {
      // ── Correct tap ──────────────────────────────────────────────────────
      const isLastLetter = index === item.letters.length - 1;

      if (isLastLetter) {
        await playAudio(item.phonemeFiles[index], true).catch(() => {});
      } else {
        playAudio(item.phonemeFiles[index]).catch(() => {});
      }

      const newStates = [...tileStates];
      newStates[index] = 'tapped';
      if (index + 1 < newStates.length) newStates[index + 1] = 'active';
      setTileStates(newStates);
      onCorrectTap?.();

      if (isLastLetter) {
        await delay(200);
        await playAudio(item.wordAudioFile, true).catch(() => {});
        await delay(800);
        onComplete();
      } else {
        setNextTapIndex(index + 1);
      }
    } else {
      // ── Wrong tap: flash red → reset tiles → replay intro ────────────────
      playAudio(item.phonemeFiles[index]).catch(() => {});

      const newStates = [...tileStates];
      newStates[index] = 'wrong';
      setTileStates(newStates);
      setPromptPlaying(true); // block further taps immediately
      onWrongTap?.();

      await delay(600);

      setNextTapIndex(0);
      setTileStates(makeInitialTileStates(item.letters.length));

      stopAll();
      await playAudio(PROMPT_FILE, true).catch(() => {});
      await playAudio(item.wordAudioFile, true).catch(() => {});
      setPromptPlaying(false);
    }
  }, [promptPlaying, tileStates, nextTapIndex, item, onComplete, onCorrectTap, onWrongTap, playAudio, stopAll]);

  return { tileStates, promptPlaying, handleLetterTap };
}
