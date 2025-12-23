import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { quizzes } from '../data/quizzes';
import { phonicsUnits } from '../data/phonicsUnits';
import { usePlayAudio, stopAllAudio } from '../utils/audioUtils';
import { updatePhonicsUnitProgress, getPhonicsProgress, getRecentConfidence } from '../helpers/quizProgress';
import './QuizView.css';
import '../styles/phaser.css';
import { PhaserGame } from '../components/PhaserGame';
import { useRef } from 'react';

type Phase = 'intro' | 'prompt' | 'answers' | 'feedback' | 'done' | 'crow-taking-letter';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const getQuizById = (quizId: string | null) => {
  // Try to find by id first (for URLs like ?quizId=quiz-t)
  let quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) {
    // Fallback: try to find by unit (for URLs like ?quizId=t)
    quiz = quizzes.find(q => q.unit === quizId);
  }
  return quiz || quizzes[0];
};

const QuizView: React.FC = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const quizId = query.get('quizId');
  const quiz = getQuizById(quizId);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [progressRecorded, setProgressRecorded] = useState(false);
  const question = quiz.questions[questionIdx];
  const unitId = quiz.unit;
  const unitName = phonicsUnits.find(u => u.id === unitId)?.name || unitId;
  const progress = getPhonicsProgress();
  const unitProgress = progress.phonicsUnits[unitId];
  const recentConfidence = unitProgress ? getRecentConfidence(unitProgress) : 0;

  // Ref to MainScene instance
  const mainSceneRef = useRef<any>(null);

  // Shuffle utility
  function shuffle<T>(array: T[]): T[] {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Memoized shuffled answers, changes on questionIdx or every time shuffleKey changes
  const [shuffleKey, setShuffleKey] = useState(0);
  useEffect(() => {
    setShuffleKey(k => k + 1);
  }, [questionIdx]);
  const shuffledWords = useMemo(() => shuffle(question.words), [questionIdx, shuffleKey]);

  const playAudio = usePlayAudio();
  // Orchestrate the quiz sequence
  useEffect(() => {
    let cancelled = false;
    stopAllAudio();
    async function runSequence() {
      // 1. Letter intro (always, for every quiz, on first question)
      if (questionIdx === 0) {
        setPhase('intro');
        await playAudio('/audio/prompts/this-is-the-letter.wav', true).catch(() => { });
        if (cancelled) return;
        const unitId = quiz.unit;
        const unit = phonicsUnits.find(u => u.id === unitId);
        if (unit?.nameAudio) {
          await playAudio(unit.nameAudio, true).catch(() => { });
          if (cancelled) return;
        }
        await playAudio('/audio/prompts/it-makes-the-sound.wav', true).catch(() => { });
        if (cancelled) return;
        if (unit?.soundAudio) {
          await playAudio(unit.soundAudio, true).catch(() => { });
          if (cancelled) return;
        }
        // Add 1 second delay after letter intro
        await new Promise(res => setTimeout(res, 800));
      }
      setPhase('prompt');
      await playAudio(question.promptFile, true).catch(() => { });
      if (cancelled) return;
      await playAudio(question.phonemeFile, true).catch(() => { });
      if (cancelled) return;
      setPhase('answers');
    }
    runSequence();
    return () => { cancelled = true; stopAllAudio(); };
    // eslint-disable-next-line
  }, [questionIdx]);

  // Handle answer selection and feedback
  const handleAnswer = async (word: string) => {
    setSelected(word);
    setPhase('feedback');
    setAttempts(a => a + 1);
    const isCorrect = word === question.correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    // Record recent result only on first attempt
    if (!progressRecorded && attempts === 0) {
      const unitId = quiz.unit;
      updatePhonicsUnitProgress(unitId, isCorrect, isCorrect); // only first attempt, true if correct, false if not
      setProgressRecorded(true);
    }
    // Play feedback audio
    const feedbackAudio = isCorrect ? '/audio/system/correct.wav' : '/audio/system/incorrect.wav';
    try {
      await playAudio(feedbackAudio);
    } catch { }
    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      // If we're on the crow-take-letter question, set a special phase to hide answers
      const isCrowTakeLetter = (questionIdx + 1 === mainSceneRef.current?.constructor?.CROW_TAKE_LETTER_QUESTION);
      if (isCorrect) {
        if (mainSceneRef.current && typeof mainSceneRef.current.onQuestionAnswered === 'function') {
          // Wait for crow hop or crow-take-letter animation before advancing
          mainSceneRef.current.onQuestionAnswered(true, async () => {
            setAttempts(0); // reset for next question
            setProgressRecorded(false);
            if (!isCrowTakeLetter) {
              if (questionIdx < quiz.questions.length - 1) {
                setQuestionIdx(q => q + 1);
              } else {
                setPhase('done');
                await playAudio('/audio/system/success.wav');
                setTimeout(() => navigate('/'), 1200);
              }
            } else {
              // For crow-take-letter question, hide answers until callback
              setPhase('crow-taking-letter');
              // The callback from crowTakeLetter should advance the question
              // So we need a way for Phaser to notify React to advance
              // We'll use a ref to store a function to call after crow re-enters
              mainSceneRef.current._afterCrowReEnter = async () => {
                if (questionIdx < quiz.questions.length - 1) {
                  setQuestionIdx(q => q + 1);
                  setPhase('answers');
                } else {
                  setPhase('done');
                  await playAudio('/audio/system/success.wav');
                  setTimeout(() => navigate('/'), 1200);
                }
              };
            }
          });
        }
      } else {
        setPhase('answers');
        setShuffleKey(k => k + 1); // re-shuffle on wrong answer
      }
    }, 400);
  };

  return (
    <div className="quiz-root">
      <div className="quiz-header">
        <button className="quiz-back" onClick={() => navigate('/')}>⬅ Back</button>
        <div className="quiz-progress-score">{recentConfidence}%</div>
      </div>
      <div className="quiz-stacked-layout">
        <div className="phaser-container">
          <PhaserGame
            unitName={unitName}
            onSceneReady={scene => { mainSceneRef.current = scene; }}
          />
        </div>
        <div className="quiz-content">
          {/* <h2 className="quiz-title">{unitName}</h2> */}
          {phase === 'intro' && (
            // <div style={{ marginTop: 48, fontSize: '2rem', color: '#444', textAlign: 'center' }}>
            //   Listen to the letter introduction...
            // </div>
            <></>
          )}
          {phase === 'prompt' && (
            // <div style={{ marginTop: 48, fontSize: '2rem', color: '#444', textAlign: 'center' }}>
            //   Listen to the prompt...
            // </div>
            <></>
          )}
          {(phase === 'answers' || phase === 'feedback') && (
            <div className="quiz-answers-fixed">
              {shuffledWords.map(word => {
                const isSelected = selected === word;
                const isCorrect = feedback === 'correct' && word === question.correctAnswer;
                const isWrong = feedback === 'wrong' && word === selected;
                let animateClass = '';
                if (isSelected && feedback === 'correct') animateClass = ' animate-scale';
                if (isSelected && feedback === 'wrong') animateClass = ' animate-shake';
                return (
                  <button
                    key={word}
                    className={`quiz-answer${isCorrect ? ' correct' : ''}${isWrong ? ' wrong' : ''}${animateClass}`}
                    onClick={() => handleAnswer(word)}
                    disabled={!!selected}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          )}
          {phase === 'crow-taking-letter' && (
            <div className="quiz-answers-fixed" style={{ opacity: 0, pointerEvents: 'none' }} />
          )}
          {phase === 'done' && (
            <div style={{ marginTop: 48, fontSize: '2rem', color: '#50bc37', textAlign: 'center' }}>
              Quiz complete!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizView;