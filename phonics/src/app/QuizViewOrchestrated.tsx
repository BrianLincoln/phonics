import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { quizzes } from '../data/quizzes';
import { phonicsUnits } from '../data/phonicsUnits';
import { usePlayAudio, stopAllAudio } from './audioUtils';
import { updatePhonicsUnitProgress, getPhonicsProgress, getRecentConfidence } from '../helpers/quizProgress';
import './QuizView.css';

type Phase = 'intro' | 'prompt' | 'answers' | 'feedback' | 'done';


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


const QuizViewOrchestrated: React.FC = () => {
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
  const unitId = quiz.unit;
  const unitName = phonicsUnits.find(u => u.id === unitId)?.name || unitId;

  // Confidence score for current unit
  const progress = getPhonicsProgress();
  const unitProgress = progress.phonicsUnits[unitId];
  const recentConfidence = unitProgress ? getRecentConfidence(unitProgress) : 0;

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
      if (isCorrect) {
        setAttempts(0); // reset for next question
        setProgressRecorded(false);
        if (questionIdx < quiz.questions.length - 1) {
          setQuestionIdx(q => q + 1);
        } else {
          setPhase('done');
          setTimeout(() => navigate('/'), 1200);
        }
      } else {
        setPhase('answers');
        setShuffleKey(k => k + 1); // re-shuffle on wrong answer
      }
    }, 400);
  };

  return (
    <div className="quiz-root">
      <button className="quiz-back" onClick={() => navigate('/')}>⬅ Back</button>
      <h2 className="quiz-title">{unitName}</h2>
      {/* Recent confidence score at top right, no label */}
      <div style={{ position: 'absolute', top: 24, right: 32, fontSize: '2rem', color: '#7aa7e9', fontWeight: 700, zIndex: 10 }}>{recentConfidence}%</div>
      {(phase === 'answers' || phase === 'feedback') && (
        <>
          <div className="quiz-answers">
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
        </>
      )}
    </div>
  );
};

export default QuizViewOrchestrated;
