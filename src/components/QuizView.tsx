import { useParams, useNavigate } from 'react-router-dom';
import { curriculum } from '../content/curriculum';
import { useProgress } from '../store/progress';
import { useState } from 'react';
import {
  ChevronRight,
  Check,
  X,
  ArrowRight,
  RotateCcw,
  Trophy,
} from 'lucide-react';

export function QuizView() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { setQuizScore, quizScores } = useProgress();

  const mod = curriculum.find((m) => m.id === moduleId);
  const quiz = mod?.quiz;

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!mod || !quiz) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">Quiz not found.</p>
      </div>
    );
  }

  const modIdx = curriculum.findIndex((m) => m.id === moduleId);
  const nextMod = modIdx < curriculum.length - 1 ? curriculum[modIdx + 1] : null;
  const bestScore = quizScores[mod.id];

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    const correct = quiz.questions.filter(
      (q) => answers[q.id] === q.correctIndex,
    ).length;
    const score = Math.round((correct / quiz.questions.length) * 100);
    setQuizScore(mod.id, score);
    setSubmitted(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const correctCount = submitted
    ? quiz.questions.filter((q) => answers[q.id] === q.correctIndex).length
    : 0;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/[0.04] bg-surface/40 px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-white transition-colors"
          >
            Home
          </button>
          <ChevronRight size={12} className="text-slate-700" />
          <span className="text-slate-400">{mod.title}</span>
          <ChevronRight size={12} className="text-slate-700" />
          <span className="text-white font-medium">Quiz</span>
        </div>

        {bestScore !== undefined && !submitted && (
          <span className="badge badge-beginner text-[10px]">
            Best: {bestScore}%
          </span>
        )}
      </header>

      {/* Questions */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 text-2xl font-bold text-white">
            {mod.title} Quiz
          </h1>
          <p className="mb-8 text-sm text-slate-500">
            {quiz.questions.length} questions &middot; Test your understanding
          </p>

          <div className="space-y-6">
            {quiz.questions.map((q, qi) => {
              const selected = answers[q.id];
              const isCorrect = submitted && selected === q.correctIndex;
              const isWrong =
                submitted &&
                selected !== undefined &&
                selected !== q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-5 transition-all ${
                    submitted
                      ? isCorrect
                        ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
                        : isWrong
                          ? 'border-rose-500/20 bg-rose-500/[0.03]'
                          : 'border-white/[0.06] bg-surface/40'
                      : 'border-white/[0.06] bg-surface/40'
                  }`}
                >
                  <p className="mb-4 text-sm font-medium text-white">
                    <span className="mr-2 text-slate-600">{qi + 1}.</span>
                    {q.question}
                  </p>

                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = selected === oi;
                      const isAnswer = q.correctIndex === oi;

                      let style =
                        'border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05]';
                      if (submitted && isAnswer) {
                        style =
                          'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
                      } else if (submitted && isSelected && !isAnswer) {
                        style =
                          'border-rose-500/30 bg-rose-500/10 text-rose-300';
                      } else if (!submitted && isSelected) {
                        style =
                          'border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan';
                      }

                      return (
                        <button
                          key={oi}
                          onClick={() => handleSelect(q.id, oi)}
                          disabled={submitted}
                          className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-all ${style}`}
                        >
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-medium ${
                              isSelected && !submitted
                                ? 'border-accent-cyan/50 bg-accent-cyan/20 text-accent-cyan'
                                : submitted && isAnswer
                                  ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
                                  : submitted && isSelected
                                    ? 'border-rose-500/50 bg-rose-500/20 text-rose-400'
                                    : 'border-white/10 text-slate-500'
                            }`}
                          >
                            {submitted && isAnswer ? (
                              <Check size={12} />
                            ) : submitted && isSelected ? (
                              <X size={12} />
                            ) : (
                              String.fromCharCode(65 + oi)
                            )}
                          </span>
                          <span className="text-slate-300">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {submitted && (
                    <div className="mt-3 rounded-lg bg-white/[0.02] p-3 text-xs text-slate-400">
                      <strong className="text-slate-300">Explanation:</strong>{' '}
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={
                  Object.keys(answers).length < quiz.questions.length
                }
                className="btn-primary disabled:opacity-30"
              >
                Submit Answers
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Trophy
                    size={18}
                    className={
                      correctCount === quiz.questions.length
                        ? 'text-amber-400'
                        : 'text-slate-500'
                    }
                  />
                  <span className="text-lg font-bold text-white">
                    {correctCount}/{quiz.questions.length}
                  </span>
                  <span className="text-sm text-slate-500">correct</span>
                </div>
                <button onClick={handleRetry} className="btn-ghost">
                  <RotateCcw size={14} />
                  Retry
                </button>
              </div>
            )}

            {submitted && nextMod && (
              <button
                onClick={() =>
                  navigate(
                    `/module/${nextMod.id}/lesson/${nextMod.lessons[0]?.id}`,
                  )
                }
                className="btn-primary"
              >
                Next Module: {nextMod.title}
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
