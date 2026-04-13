import { Link, useLocation, useNavigate } from 'react-router-dom';
import { curriculum } from '../content/curriculum';
import { useProgress } from '../store/progress';
import {
  BookOpen,
  Puzzle,
  HelpCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import { useState } from 'react';

const difficultyColor: Record<string, string> = {
  beginner: 'text-emerald-400',
  intermediate: 'text-amber-400',
  advanced: 'text-orange-400',
  expert: 'text-rose-400',
};

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { completedLessons, solvedPuzzles, quizScores } = useProgress();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    curriculum.forEach((m) => (init[m.id] = true));
    return init;
  });

  const toggleModule = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalLessons = curriculum.reduce((s, m) => s + m.lessons.length, 0);
  const totalPuzzles = curriculum.reduce((s, m) => s + m.puzzles.length, 0);
  const totalQuizzes = curriculum.length;
  const completedCount = completedLessons.length;
  const solvedCount = solvedPuzzles.length;
  const quizCount = Object.keys(quizScores).length;

  return (
    <aside className="flex h-full flex-col border-r border-white/[0.06] bg-surface">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4
                   transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600">
          <Cpu size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white">Triton Teacher</h1>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            GPU Programming
          </p>
        </div>
      </Link>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-px border-b border-white/[0.06] bg-white/[0.02]">
        {[
          { label: 'Lessons', done: completedCount, total: totalLessons },
          { label: 'Puzzles', done: solvedCount, total: totalPuzzles },
          { label: 'Quizzes', done: quizCount, total: totalQuizzes },
        ].map(({ label, done, total }) => (
          <div key={label} className="px-3 py-2.5 text-center">
            <div className="text-xs font-semibold text-white">
              {done}
              <span className="text-slate-500">/{total}</span>
            </div>
            <div className="text-[10px] text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {curriculum.map((mod) => {
          const isExpanded = expanded[mod.id];
          const totalItems =
            mod.lessons.length + mod.puzzles.length + 1;
          const doneItems =
            mod.lessons.filter((l) => completedLessons.includes(l.id)).length +
            mod.puzzles.filter((p) => solvedPuzzles.includes(p.id)).length +
            (quizScores[mod.id] !== undefined ? 1 : 0);
          const pct = Math.round((doneItems / totalItems) * 100);

          return (
            <div key={mod.id} className="mb-1">
              {/* Module header */}
              <button
                onClick={() => toggleModule(mod.id)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2
                           text-left transition-colors hover:bg-white/[0.04]"
              >
                {isExpanded ? (
                  <ChevronDown size={14} className="text-slate-500" />
                ) : (
                  <ChevronRight size={14} className="text-slate-500" />
                )}
                <span className="flex-1 text-sm font-medium text-slate-200">
                  {mod.title}
                </span>
                <span
                  className={`text-[10px] font-medium ${difficultyColor[mod.difficulty]}`}
                >
                  {pct}%
                </span>
              </button>

              {/* Module items */}
              {isExpanded && (
                <div className="ml-4 border-l border-white/[0.04] pl-2">
                  {mod.lessons.map((lesson) => {
                    const path = `/module/${mod.id}/lesson/${lesson.id}`;
                    const isActive = location.pathname === path;
                    const isDone = completedLessons.includes(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => navigate(path)}
                        className={`group flex w-full items-center gap-2 rounded-md px-2.5 py-1.5
                                   text-left text-[13px] transition-all ${
                                     isActive
                                       ? 'bg-accent-cyan/10 text-accent-cyan'
                                       : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                                   }`}
                      >
                        {isDone ? (
                          <Check size={12} className="text-emerald-400" />
                        ) : (
                          <BookOpen size={12} className="opacity-50" />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </button>
                    );
                  })}

                  {mod.puzzles.map((puzzle) => {
                    const path = `/module/${mod.id}/puzzle/${puzzle.id}`;
                    const isActive = location.pathname === path;
                    const isDone = solvedPuzzles.includes(puzzle.id);
                    return (
                      <button
                        key={puzzle.id}
                        onClick={() => navigate(path)}
                        className={`group flex w-full items-center gap-2 rounded-md px-2.5 py-1.5
                                   text-left text-[13px] transition-all ${
                                     isActive
                                       ? 'bg-accent-purple/10 text-accent-purple'
                                       : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                                   }`}
                      >
                        {isDone ? (
                          <Check size={12} className="text-emerald-400" />
                        ) : (
                          <Puzzle size={12} className="opacity-50" />
                        )}
                        <span className="truncate">{puzzle.title}</span>
                      </button>
                    );
                  })}

                  <button
                    onClick={() => navigate(`/module/${mod.id}/quiz`)}
                    className={`group flex w-full items-center gap-2 rounded-md px-2.5 py-1.5
                               text-left text-[13px] transition-all ${
                                 location.pathname ===
                                 `/module/${mod.id}/quiz`
                                   ? 'bg-amber-500/10 text-amber-400'
                                   : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                               }`}
                  >
                    {quizScores[mod.id] !== undefined ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <HelpCircle size={12} className="opacity-50" />
                    )}
                    <span>Quiz</span>
                    {quizScores[mod.id] !== undefined && (
                      <span className="ml-auto text-[10px] text-emerald-400">
                        {quizScores[mod.id]}%
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-4 py-3">
        <p className="text-[10px] text-slate-600">
          Runs in-browser via Pyodide. No GPU needed.
        </p>
      </div>
    </aside>
  );
}
