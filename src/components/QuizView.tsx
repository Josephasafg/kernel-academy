import { useParams, useNavigate } from 'react-router-dom';
import { curriculum } from '../content/curriculum';
import { useProgress } from '../store/progress';
import { toRoman } from '../utils/roman';
import { useState } from 'react';
import { Check, X } from 'lucide-react';

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
        <p className="font-display italic text-parchment-mute">
          The examination could not be found.
        </p>
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
      <header className="flex items-center justify-between border-b border-wine-glow/40 bg-wine-deep/40 px-10 py-4">
        <div className="flex items-baseline gap-4 font-sans text-[10.5px] uppercase tracking-widest-caps text-parchment-mute">
          <button onClick={() => navigate('/')} className="hover:text-parchment">
            Kernel Academy
          </button>
          <span className="text-copper">◆</span>
          <span>
            Ch. {toRoman(modIdx + 1)} &nbsp;·&nbsp;{' '}
            <span className="font-serif normal-case tracking-normal text-parchment-dim">
              {mod.title}
            </span>
          </span>
        </div>

        {bestScore !== undefined && !submitted && (
          <span className="diff-pill text-sage">Best · {bestScore}</span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[720px] px-12 py-16">
          <div className="eyebrow mb-4">Examination · Ch. {toRoman(modIdx + 1)}</div>
          <h1 className="font-display text-[56px] font-semibold leading-[1.05] text-parchment-ink"
              style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 100", letterSpacing: '-0.015em' }}>
            {mod.title}
            <span className="text-copper">.</span>
          </h1>
          <p className="mt-4 font-ital text-[18px] italic text-parchment/80">
            {quiz.questions.length} questions to measure your understanding.
          </p>
          <div className="mt-6 h-px w-20 bg-copper" />

          <div className="mt-14 space-y-12">
            {quiz.questions.map((q, qi) => {
              const selected = answers[q.id];
              const isCorrect = submitted && selected === q.correctIndex;
              const isWrong =
                submitted &&
                selected !== undefined &&
                selected !== q.correctIndex;

              return (
                <div key={q.id} className="relative">
                  {/* Question mark in left margin */}
                  <div className="absolute -left-16 top-0 hidden md:block">
                    <span className="font-display text-[28px] font-medium text-copper/70"
                          style={{ fontVariationSettings: "'opsz' 36, 'SOFT' 40" }}>
                      {toRoman(qi + 1)}.
                    </span>
                  </div>

                  <div className={`border-l pl-6 transition-colors ${
                    submitted
                      ? isCorrect
                        ? 'border-sage/60'
                        : isWrong
                          ? 'border-bordeaux/60'
                          : 'border-wine-glow/30'
                      : 'border-wine-glow/30'
                  }`}>
                    <div className="eyebrow mb-2 md:hidden">
                      Question {toRoman(qi + 1)}
                    </div>
                    <h3 className="font-display text-[22px] font-medium leading-snug text-parchment-ink"
                        style={{ fontVariationSettings: "'opsz' 28, 'SOFT' 70" }}>
                      {q.question}
                    </h3>

                    <ol className="mt-6 divide-y divide-wine-glow/30 border-y border-wine-glow/30">
                      {q.options.map((opt, oi) => {
                        const isSelected = selected === oi;
                        const isAnswer = q.correctIndex === oi;

                        let rowStyle = 'text-parchment hover:bg-wine-glow/15';
                        let letterStyle = 'text-copper';
                        let markerBg = 'border-copper/30';

                        if (submitted && isAnswer) {
                          rowStyle = 'bg-sage/[0.08] text-sage';
                          letterStyle = 'text-sage';
                          markerBg = 'border-sage/50 bg-sage/10';
                        } else if (submitted && isSelected && !isAnswer) {
                          rowStyle = 'bg-bordeaux/[0.08] text-bordeaux line-through decoration-bordeaux/40';
                          letterStyle = 'text-bordeaux';
                          markerBg = 'border-bordeaux/50 bg-bordeaux/10';
                        } else if (submitted) {
                          rowStyle = 'text-parchment/55';
                          letterStyle = 'text-parchment-mute';
                        } else if (isSelected) {
                          rowStyle = 'bg-gold/[0.08] text-gold';
                          letterStyle = 'text-gold';
                          markerBg = 'border-gold/60 bg-gold/10';
                        }

                        return (
                          <li key={oi}>
                            <button
                              onClick={() => handleSelect(q.id, oi)}
                              disabled={submitted}
                              className={`flex w-full items-center gap-5 px-1 py-4 text-left
                                          transition-colors duration-150 ${rowStyle}`}
                            >
                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center border font-display text-[13px] font-semibold
                                            ${markerBg} ${letterStyle}`}
                              >
                                {String.fromCharCode(65 + oi)}
                              </span>
                              <span className="font-display text-[16.5px] leading-snug">
                                {opt}
                              </span>
                              {submitted && isAnswer && (
                                <Check size={16} className="ml-auto shrink-0 text-sage" strokeWidth={2.2} />
                              )}
                              {submitted && isSelected && !isAnswer && (
                                <X size={16} className="ml-auto shrink-0 text-bordeaux" strokeWidth={2.2} />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ol>

                    {submitted && (
                      <div className="mt-5 border-t border-wine-glow/30 pt-4">
                        <div className="eyebrow mb-1">Commentary</div>
                        <p className="font-display text-[15px] leading-relaxed text-parchment/80">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-16 border-t border-wine-glow/40 pt-10">
            {!submitted ? (
              <div className="flex items-center justify-between">
                <p className="font-ital text-[15px] italic text-parchment-mute">
                  {Object.keys(answers).length} of {quiz.questions.length} answered
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < quiz.questions.length}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Submit Examination →
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <div className="eyebrow mb-1">Result</div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-[48px] font-semibold leading-none text-gold numeral-lining"
                          style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 100" }}>
                      {correctCount}
                    </span>
                    <span className="font-ital text-[22px] italic text-parchment-mute">
                      of {quiz.questions.length} correct
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button onClick={handleRetry} className="btn-secondary">
                    Sit Again
                  </button>
                  {nextMod && (
                    <button
                      onClick={() =>
                        navigate(
                          `/module/${nextMod.id}/lesson/${nextMod.lessons[0]?.id}`,
                        )
                      }
                      className="btn-primary"
                    >
                      Ch. {toRoman(modIdx + 2)} · {nextMod.title} →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
