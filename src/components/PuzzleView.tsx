import { useParams, useNavigate } from 'react-router-dom';
import { curriculum } from '../content/curriculum';
import { useProgress } from '../store/progress';
import { CodePlayground } from './CodePlayground';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useCallback } from 'react';
import {
  ChevronRight,
  Lightbulb,
  Eye,
  EyeOff,
  Trophy,
  ArrowRight,
} from 'lucide-react';

export function PuzzleView() {
  const { moduleId, puzzleId } = useParams();
  const navigate = useNavigate();
  const { solvePuzzle, isPuzzleSolved } = useProgress();

  const [showHints, setShowHints] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [solved, setSolved] = useState(false);

  const mod = curriculum.find((m) => m.id === moduleId);
  const puzzle = mod?.puzzles.find((p) => p.id === puzzleId);

  const handleSuccess = useCallback(() => {
    setSolved(true);
    if (puzzle) solvePuzzle(puzzle.id);
  }, [puzzle, solvePuzzle]);

  if (!mod || !puzzle) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">Puzzle not found.</p>
      </div>
    );
  }

  const puzzleIdx = mod.puzzles.findIndex((p) => p.id === puzzleId);
  const alreadySolved = isPuzzleSolved(puzzle.id);
  const nextPuzzle = puzzleIdx < mod.puzzles.length - 1 ? mod.puzzles[puzzleIdx + 1] : null;

  const diffColor: Record<string, string> = {
    easy: 'text-emerald-400 bg-emerald-500/10',
    medium: 'text-amber-400 bg-amber-500/10',
    hard: 'text-rose-400 bg-rose-500/10',
  };

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
          <span className="text-white font-medium">{puzzle.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`badge ${diffColor[puzzle.difficulty]}`}>
            {puzzle.difficulty}
          </span>
          {(solved || alreadySolved) && (
            <span className="badge badge-beginner gap-1">
              <Trophy size={10} /> Solved
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Description + Hints */}
        <div className="w-2/5 overflow-y-auto border-r border-white/[0.04] p-8">
          <div className="mx-auto max-w-lg">
            <h1 className="mb-4 text-xl font-bold text-white">
              {puzzle.title}
            </h1>

            <div className="lesson-content mb-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {puzzle.description}
              </ReactMarkdown>
            </div>

            {/* Hints */}
            {puzzle.hints.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="btn-ghost !px-0 text-amber-400"
                >
                  <Lightbulb size={14} />
                  {showHints ? 'Hide Hints' : 'Show Hints'}
                </button>

                {showHints && (
                  <div className="mt-3 space-y-2">
                    {puzzle.hints.slice(0, hintLevel + 1).map((hint, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-amber-500/10 bg-amber-500/5 p-3 text-sm text-amber-200/80"
                      >
                        <strong className="text-amber-400">Hint {i + 1}:</strong>{' '}
                        {hint}
                      </div>
                    ))}
                    {hintLevel < puzzle.hints.length - 1 && (
                      <button
                        onClick={() => setHintLevel((h) => h + 1)}
                        className="text-xs text-amber-500/60 hover:text-amber-400"
                      >
                        Show next hint...
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Solution toggle */}
            <div>
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="btn-ghost !px-0 text-rose-400"
              >
                {showSolution ? <EyeOff size={14} /> : <Eye size={14} />}
                {showSolution ? 'Hide Solution' : 'Reveal Solution'}
              </button>

              {showSolution && (
                <pre className="mt-3 overflow-x-auto rounded-lg border border-rose-500/10 bg-rose-500/5 p-4 font-mono text-xs text-slate-300">
                  {puzzle.solution}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Right: Code editor */}
        <div className="w-3/5 p-4">
          <CodePlayground
            initialCode={puzzle.starterCode}
            storageKey={puzzle.id}
            testCode={puzzle.testCode}
            onSuccess={handleSuccess}
          />
        </div>
      </div>

      {/* Success banner */}
      {(solved || alreadySolved) && (
        <div className="border-t border-emerald-500/20 bg-emerald-500/5 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <Trophy size={16} />
              <span className="text-sm font-medium">
                Puzzle solved! Great work.
              </span>
            </div>
            {nextPuzzle ? (
              <button
                onClick={() =>
                  navigate(`/module/${mod.id}/puzzle/${nextPuzzle.id}`)
                }
                className="btn-primary !py-1.5 !text-xs"
              >
                Next Puzzle
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => navigate(`/module/${mod.id}/quiz`)}
                className="btn-primary !py-1.5 !text-xs"
              >
                Take the Quiz
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
