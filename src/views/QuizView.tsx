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

type Phase = 'intro' | 'prompt' | 'answers' | 'feedback' | 'done' | 'crow-taking-letter' | 'success';

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
  // Fade out overlay state (must be before any use)
  const [fadeOut, setFadeOut] = useState(false);
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

  // Ref to Phaser scene instance (MultipleChoice or AntLeaf)
  const sceneRef = useRef<any>(null);
  const [questionComplete, setQuestionComplete] = useState(false);

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
  // Use type guard to access options safely
  const shuffledOptions = useMemo(() => {
    if ('options' in question && Array.isArray(question.options)) {
      return shuffle(question.options);
    }
    return [];
  }, [question, questionIdx, shuffleKey]);

  const playAudio = usePlayAudio();
  // Orchestrate the quiz sequence
  useEffect(() => {
    let cancelled = false;
    stopAllAudio();
    async function runSequence() {
      // 1. Letter intro (only if showLetterIntro is true for this quiz)
      if (questionIdx === 0 && quiz.showLetterIntro) {
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
    // Listen for question-complete event from AntLeafScene
    useEffect(() => {
      if (sceneRef.current && sceneType === 'ant-leaf') {
        const scene = sceneRef.current;
        const handler = () => setQuestionComplete(true);
        scene.events?.on('question-complete', handler);
        return () => scene.events?.off('question-complete', handler);
      }
    }, [sceneType, questionIdx]);
    setSelected(word);
    setPhase('feedback');
    setAttempts(a => a + 1);
    let isCorrect = false;
    if (question.questionType === 'multiple-choice-word-start' || question.questionType === 'multiple-choice-phoneme') {
      isCorrect = word === question.correctAnswer;
    } else if (question.questionType === 'leaf-phoneme') {
      isCorrect = word === question.targetLetter;
    }
    setFeedback(isCorrect ? 'correct' : 'wrong');
    // Record recent result only on first attempt
    if (!progressRecorded && attempts === 0) {
      const unitId = quiz.unit;
      updatePhonicsUnitProgress(unitId, isCorrect, isCorrect); // only first attempt, true if correct, false if not
      setProgressRecorded(true);
    }
    // Play feedback audio
    const feedbackAudio = isCorrect ? '/audio/system/correct.wav' : '/audio/system/incorrect.wav';
    await playAudio(feedbackAudio, true).catch(() => { });
    // Optionally, add a delay before moving to next question or phase
    if (isCorrect) {
      setTimeout(() => {
        if (questionIdx < quiz.questions.length - 1) {
          setQuestionIdx(q => q + 1);
          setSelected(null);
          setFeedback(null);
          setAttempts(0);
          setProgressRecorded(false);
        } else {
          setPhase('success');
        }
      }, 1000);
    } else {
      setTimeout(() => {
        setPhase('answers');
        setSelected(null);
        setFeedback(null);
      }, 1000);
    }
  };

  // Determine sceneType based on question.questionType
  let sceneType: 'multiple-choice' | 'ant-leaf';
  switch (question.questionType) {
    case 'leaf-phoneme':
      sceneType = 'ant-leaf';
      break;
    case 'multiple-choice-word-start':
    case 'multiple-choice-phoneme':
    default:
      sceneType = 'multiple-choice';
      break;
  }
  // Runtime assertion: never allow AntLeafScene with wrong question type
  if (sceneType === 'ant-leaf' && question.questionType !== 'leaf-phoneme') {
    throw new Error('sceneType ant-leaf requires questionType leaf-phoneme');
  }
  if (sceneType === 'multiple-choice' && question.questionType === 'leaf-phoneme') {
    throw new Error('sceneType multiple-choice cannot be used with questionType leaf-phoneme');
  }

  return (
    <div className="quiz-root">
      <div className={"quiz-fade-overlay" + (fadeOut ? " visible" : "")}></div>
      <div className="quiz-header">
        <button className="quiz-back" onClick={() => navigate('/')}>⬅ Back</button>
        <div className="quiz-progress-score">{recentConfidence}%</div>
      </div>
      <div className="quiz-stacked-layout">
        <div className="phaser-container">
          <PhaserGame
            unitName={unitName}
            onSceneReady={scene => { sceneRef.current = scene; }}
            sceneType={phase === 'success' ? 'success' : sceneType}
            question={phase === 'success' ? undefined : question}
            playAudio={playAudio}
            onSuccessComplete={() => navigate('/')}
          />
        </div>
        <div className="quiz-content">
          {/* <h2 className="quiz-title">{unitName}</h2> */}
          {phase === 'intro' && <></>}
          {phase === 'prompt' && <></>}
          {(phase === 'answers' || phase === 'feedback') && (
            <div className="quiz-answers-fixed">
              {(() => {
                switch (question.questionType) {
                  case 'multiple-choice-word-start':
                  case 'multiple-choice-phoneme':
                    return shuffledOptions.map(option => {
                      const isSelected = selected === option;
                      const isCorrect = feedback === 'correct' && option === question.correctAnswer;
                      const isWrong = feedback === 'wrong' && option === selected;
                      let animateClass = '';
                      if (isSelected && feedback === 'correct') animateClass = ' animate-scale';
                      if (isSelected && feedback === 'wrong') animateClass = ' animate-shake';
                      return (
                        <button
                          key={String(option)}
                          className={`quiz-answer${isCorrect ? ' correct' : ''}${isWrong ? ' wrong' : ''}${animateClass}`}
                          onClick={() => handleAnswer(String(option))}
                          disabled={!!selected}
                        >
                          {String(option)}
                        </button>
                      );
                    });
                  case 'leaf-phoneme':
                    // No answers UI for ant-leaf, handled in Phaser
                    return null;
                  default:
                    return null;
                }
              })()}
            </div>
          )}
          {phase === 'crow-taking-letter' && (
            <div className="quiz-answers-fixed" style={{ opacity: 0, pointerEvents: 'none' }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizView;