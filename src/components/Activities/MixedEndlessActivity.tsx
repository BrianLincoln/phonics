import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../PhaserGame';
import MultipleChoice from './MultipleChoice/MultipleChoice';
import { BuildTheWordTiles, TileState } from './BuildTheWord/BuildTheWordTiles';
import { generateQuestion } from '../../data/endlessMode';
import { generateBlendWord } from '../../data/blendEndlessMode';
import { BuildTheWordItem } from '../../data/activities';
import { usePlayAudio, useStopAllAudio } from '../../utils/audioUtils';
import { useAudioUnlocked } from '../../context/AudioManagerContext';
import { AudioStartOverlay } from '../AudioStartOverlay';
import './MultipleChoice/MultipleChoiceActivity.css';
import { BackButton } from '../BackButton';

const PROMPT_FILE = '/audio/prompts/tap-the-letters-to-build-the-word.wav';
const FEEDBACK_AUDIO = {
  correct: '/audio/system/correct.wav',
  wrong: '/audio/system/incorrect.wav',
};

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function makeInitialTileStates(count: number): TileState[] {
  return Array.from({ length: count }, (_, i) => (i === 0 ? 'active' : 'untapped'));
}

function pickMode(): 'mcq' | 'blend' {
  return Math.random() < 0.5 ? 'mcq' : 'blend';
}

export const MixedEndlessActivity: React.FC = () => {
  const navigate = useNavigate();
  const audioUnlocked = useAudioUnlocked();
  const playAudio = usePlayAudio();
  const stopAll = useStopAllAudio();
  const phaserRef = useRef<any>(null);

  // --- shared ---
  const [mode, setMode] = useState<'mcq' | 'blend'>(() => pickMode());
  const [promptPlaying, setPromptPlaying] = useState(true);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // --- MCQ state ---
  const [{ question }, setGenerated] = useState(() => generateQuestion());
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [transition, setTransition] = useState<'idle' | 'exiting' | 'entering'>('idle');

  // --- Blend state ---
  const [blendItem, setBlendItem] = useState<BuildTheWordItem>(() => generateBlendWord());
  const [nextTapIndex, setNextTapIndex] = useState(0);
  const [tileStates, setTileStates] = useState<TileState[]>(() =>
    makeInitialTileStates(generateBlendWord().letters.length)
  );

  // ---------------------------------------------------------------
  // Audio: play intro sequence whenever mode or question/item changes
  // ---------------------------------------------------------------
  const introKey = mode === 'mcq' ? question.id : blendItem.word;

  useEffect(() => {
    stopAll();
    setPromptPlaying(true);
    let alive = true;

    async function runIntro() {
      if (mode === 'mcq') {
        await playAudio(question.promptFile, true).catch(() => {});
        if (!alive) return;
        await playAudio(question.phonemeFile, true).catch(() => {});
      } else {
        await playAudio(PROMPT_FILE, true).catch(() => {});
        if (!alive) return;
        await playAudio(blendItem.wordAudioFile, true).catch(() => {});
      }
      if (!alive) return;
      setPromptPlaying(false);
    }

    runIntro();
    return () => { alive = false; stopAll(); };
  }, [introKey]);

  // ---------------------------------------------------------------
  // Advance to the next exercise (always picks a new random mode)
  // ---------------------------------------------------------------
  const advanceToNext = useCallback(() => {
    const nextMode = pickMode();
    setMode(nextMode);
    setSelected(null);
    setFeedback(null);
    setEliminated([]);
    setTransition('idle');
    if (nextMode === 'mcq') {
      setGenerated(generateQuestion());
    } else {
      const next = generateBlendWord();
      setBlendItem(next);
      setNextTapIndex(0);
      setTileStates(makeInitialTileStates(next.letters.length));
    }
  }, []);

  // ---------------------------------------------------------------
  // MCQ handlers
  // ---------------------------------------------------------------
  const handleMCQAnswer = useCallback(async (word: string) => {
    if (selected || promptPlaying) return;
    const isCorrect = word === question.correctAnswer;

    setSelected(word);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    playAudio(FEEDBACK_AUDIO[isCorrect ? 'correct' : 'wrong'], true).catch(() => {});

    if (isCorrect) {
      setScore(s => ({ correct: s.correct + (eliminated.length === 0 ? 1 : 0), total: s.total + 1 }));
      const doAdvance = async () => {
        await delay(1500);
        setTransition('exiting');
        await delay(280);
        advanceToNext();
        setTransition('entering');
        await delay(350);
        setTransition('idle');
      };
      if (phaserRef.current?.onQuestionAnswered) {
        phaserRef.current.onQuestionAnswered(true, doAdvance);
      } else {
        doAdvance();
      }
    } else {
      setScore(s => ({ ...s, total: s.total + 1 }));
      const doEliminate = () => {
        setEliminated(prev => [...prev, word]);
        setSelected(null);
        setFeedback(null);
      };
      if (phaserRef.current?.onQuestionAnswered) {
        phaserRef.current.onQuestionAnswered(false, doEliminate);
      } else {
        doEliminate();
      }
    }
  }, [selected, promptPlaying, question, eliminated, advanceToNext, playAudio]);

  // ---------------------------------------------------------------
  // Blend (BTW) handlers
  // ---------------------------------------------------------------
  const handleLetterTap = useCallback(async (index: number) => {
    if (promptPlaying || tileStates[index] === 'tapped') return;

    if (index === nextTapIndex) {
      const isLastLetter = index === blendItem.letters.length - 1;

      // Await the phoneme on the last tap so the word doesn't play over it
      if (isLastLetter) {
        await playAudio(blendItem.phonemeFiles[index], true).catch(() => {});
      } else {
        playAudio(blendItem.phonemeFiles[index]).catch(() => {});
      }

      const newStates = [...tileStates];
      newStates[index] = 'tapped';
      if (index + 1 < newStates.length) newStates[index + 1] = 'active';
      setTileStates(newStates);

      phaserRef.current?.onCorrectTap?.();

      if (isLastLetter) {
        // Word complete — counts as a correct answer
        setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
        await delay(200);
        await playAudio(blendItem.wordAudioFile, true).catch(() => {});
        await delay(800);
        advanceToNext();
      } else {
        setNextTapIndex(index + 1);
      }
    } else {
      playAudio(blendItem.phonemeFiles[index]).catch(() => {});

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
  }, [promptPlaying, tileStates, nextTapIndex, blendItem, advanceToNext, playAudio]);

  useEffect(() => {
    return () => { phaserRef.current?.scene?.stop?.(); };
  }, []);

  return (
    <div className="activity-root">
      {!audioUnlocked && <AudioStartOverlay />}
      <div className="activity-header">
        <BackButton onClick={() => navigate('/')} />
        <span className="endless-score">{score.correct} / {score.total}</span>
      </div>
      <div className="activity-stacked-layout">
        <PhaserGame
          sceneType="build-the-word"
          onSceneReady={scene => { phaserRef.current = scene; }}
        />
        {mode === 'mcq' ? (
          <MultipleChoice
            question={question as any}
            selected={selected}
            feedback={feedback}
            eliminated={eliminated}
            transition={transition}
            promptPlaying={promptPlaying}
            onAnswer={handleMCQAnswer}
          />
        ) : (
          <BuildTheWordTiles
            letters={blendItem.letters}
            tileStates={tileStates}
            promptPlaying={promptPlaying}
            onLetterTap={handleLetterTap}
          />
        )}
      </div>
    </div>
  );
};
