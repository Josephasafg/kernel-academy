import { useNavigate } from 'react-router-dom';
import { curriculum } from '../content/curriculum';
import { useProgress } from '../store/progress';
import {
  Cpu,
  Zap,
  Globe,
  BookOpen,
  ArrowRight,
  Puzzle,
  GraduationCap,
} from 'lucide-react';
import type { Difficulty } from '../types';

const difficultyBadge: Record<Difficulty, string> = {
  beginner: 'badge-beginner',
  intermediate: 'badge-intermediate',
  advanced: 'badge-advanced',
  expert: 'badge-expert',
};

const moduleIcons: Record<string, React.ReactNode> = {
  'mod-1': <span className="text-2xl">01</span>,
  'mod-2': <span className="text-2xl">02</span>,
  'mod-3': <span className="text-2xl">03</span>,
  'mod-4': <span className="text-2xl">04</span>,
  'mod-5': <span className="text-2xl">05</span>,
  'mod-6': <span className="text-2xl">06</span>,
};

export function Home() {
  const navigate = useNavigate();
  const progress = useProgress();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.04] px-6 py-20">
        {/* Background effects */}
        <div className="bg-grid-pattern absolute inset-0" />
        <div
          className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              'radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-cyan/20 bg-accent-cyan/5 px-4 py-1.5">
            <Cpu size={14} className="text-accent-cyan" />
            <span className="text-xs font-medium text-accent-cyan">
              Interactive GPU Programming Course
            </span>
          </div>

          <h1 className="mb-4 text-5xl font-extrabold tracking-tight sm:text-6xl">
            <span className="text-white">Master </span>
            <span className="text-gradient">Triton</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400">
            Learn GPU kernel programming from zero to expert. Write real Triton
            code, solve puzzles, and run everything directly in your browser
            &mdash; no GPU required.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                const first = curriculum[0];
                if (first?.lessons[0]) {
                  navigate(
                    `/module/${first.id}/lesson/${first.lessons[0].id}`,
                  );
                }
              }}
              className="btn-primary text-base"
            >
              Start Learning
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Feature pills */}
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {[
              { icon: <Globe size={14} />, text: 'Browser-Based' },
              { icon: <Zap size={14} />, text: 'No GPU Required' },
              { icon: <Puzzle size={14} />, text: 'Interactive Puzzles' },
              {
                icon: <GraduationCap size={14} />,
                text: 'Beginner to Expert',
              },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 rounded-full border border-white/[0.06]
                           bg-surface/60 px-4 py-2 text-xs text-slate-400"
              >
                {icon}
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module Grid */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Curriculum</h2>
            <p className="mt-1 text-sm text-slate-500">
              6 modules &middot; {curriculum.reduce((s, m) => s + m.lessons.length, 0)} lessons
              &middot; {curriculum.reduce((s, m) => s + m.puzzles.length, 0)} puzzles
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {curriculum.map((mod) => {
            const totalItems =
              mod.lessons.length + mod.puzzles.length + 1;
            const pct = Math.round(
              progress.getModuleProgress(mod.id, totalItems) * 100,
            );

            return (
              <button
                key={mod.id}
                onClick={() =>
                  navigate(
                    `/module/${mod.id}/lesson/${mod.lessons[0]?.id}`,
                  )
                }
                className="glass-card-hover group relative p-6 text-left"
              >
                {/* Module number */}
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl
                               bg-gradient-to-br from-cyan-500/10 to-purple-600/10
                               font-mono text-lg font-bold text-accent-cyan
                               transition-colors group-hover:from-cyan-500/20 group-hover:to-purple-600/20"
                  >
                    {moduleIcons[mod.id] ?? mod.id.slice(-1)}
                  </div>
                  <span className={difficultyBadge[mod.difficulty]}>
                    {mod.difficulty}
                  </span>
                </div>

                <h3 className="mb-1.5 text-base font-semibold text-white">
                  {mod.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-slate-500">
                  {mod.description}
                </p>

                {/* Item counts */}
                <div className="mb-3 flex gap-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <BookOpen size={11} />
                    {mod.lessons.length} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Puzzle size={11} />
                    {mod.puzzles.length} puzzle{mod.puzzles.length !== 1 && 's'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1 overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {pct > 0 && (
                  <p className="mt-1.5 text-[10px] text-slate-600">
                    {pct}% complete
                  </p>
                )}

                {/* Hover arrow */}
                <ArrowRight
                  size={16}
                  className="absolute bottom-6 right-6 text-slate-600 transition-all
                             group-hover:translate-x-1 group-hover:text-accent-cyan"
                />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
