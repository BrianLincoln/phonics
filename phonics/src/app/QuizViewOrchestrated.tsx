import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { quizzes } from '../data/quizzes';
import { phonicsUnits } from '../data/phonicsUnits';
import { usePlayAudio, stopAllAudio } from './audioUtils';
import { updatePhonicsUnitProgress } from '../helpers/quizProgress';
import './QuizView.css';

type Phase = 'intro' | 'prompt' | 'answers' | 'feedback' | 'done';


function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const getQuizById = (id: string | null) => quizzes.find(q => q.id === id) || quizzes[0];


const QuizViewOrchestrated: React.FC = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const quizId = query.get('quizId');
  const quiz = getQuizById(quizId);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
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
  let unitName: string;
  if (quiz.unit) {
    unitName = phonicsUnits.find(u => u.id === quiz.unit)?.name || quiz.unit;
  } else {
    // If no unit, try to match quiz.id to a phonics unit
    unitName = phonicsUnits.find(u => u.id === quiz.id.replace(/^quiz-/, ''))?.name || quiz.id;
  }

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
        const unitId = quiz.unit || quiz.id.replace(/^quiz-/, '');
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
    const isCorrect = word === question.correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    // Track progress for this quiz's unit or id
    const unitId = quiz.unit || quiz.id.replace(/^quiz-/, '');
    updatePhonicsUnitProgress(unitId, isCorrect);
    // Play feedback audio
    const feedbackAudio = isCorrect ? '/audio/system/correct.wav' : '/audio/system/incorrect.wav';
    try {
      await playAudio(feedbackAudio);
    } catch { }
    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      if (isCorrect) {
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
      {phase === 'intro' && <div className="quiz-question">Listen to the letter introduction…</div>}
      {phase === 'prompt' && <div className="quiz-question">Listen to the question…</div>}
      {(phase === 'answers' || phase === 'feedback') && (
        <>
          <div className="quiz-question">{question.promptFile.includes('which-word') ? 'Which word starts with the sound?' : 'Which letter makes the sound?'}</div>
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
          {phase === 'feedback' && (
            <div className="quiz-question">
              {feedback === 'correct' ? 'Correct!' : 'Try again!'}
            </div>
          )}
        </>
      )}
      {phase === 'done' && <div className="quiz-question">Quiz complete!</div>}
    </div>
  );
};

export default QuizViewOrchestrated;
