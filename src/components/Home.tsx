import { useNavigate } from 'react-router-dom';
import { curriculum } from '../content/curriculum';
import { useProgress } from '../store/progress';
import { toRoman } from '../utils/roman';
import type { Difficulty } from '../types';

const diffClass: Record<Difficulty, string> = {
  beginner: 'diff-beginner',
  intermediate: 'diff-intermediate',
  advanced: 'diff-advanced',
  expert: 'diff-expert',
};

export function Home() {
  const navigate = useNavigate();
  const progress = useProgress();

  const totalLessons = curriculum.reduce((s, m) => s + m.lessons.length, 0);
  const totalPuzzles = curriculum.reduce((s, m) => s + m.puzzles.length, 0);

  return (
    <div className="min-h-screen">
      {/* Masthead hero */}
      <section className="relative border-b border-wine-glow/40 px-12 pb-24 pt-24">
        {/* Top meta bar */}
        <div className="mx-auto mb-20 flex max-w-[1100px] items-center justify-between">
          <div className="eyebrow">Vol. I &nbsp;·&nbsp; MMXXVI</div>
          <div className="eyebrow">Written for the curious engineer</div>
        </div>

        <div className="mx-auto max-w-[1100px]">
          {/* Hero title */}
          <h1
            className="font-display text-[96px] font-semibold leading-[0.92] text-parchment-ink sm:text-[120px] lg:text-[150px]"
            style={{
              fontVariationSettings: "'opsz' 144, 'SOFT' 100",
              letterSpacing: '-0.02em',
            }}
          >
            Kernel
            <br />
            <span className="font-ital font-normal text-gold italic">Academy</span>
            <span className="text-copper">.</span>
          </h1>

          <div className="mt-10 grid grid-cols-12 gap-x-8">
            <div className="col-span-12 md:col-span-4">
              <div className="eyebrow mb-3">The Subject</div>
              <p className="font-display text-[15px] leading-relaxed text-parchment/80">
                A field guide to writing GPU kernels in OpenAI&rsquo;s{' '}
                <em className="italic text-gold">Triton</em>, from first principles to
                production patterns used inside modern inference engines.
              </p>
            </div>

            <div className="col-span-12 md:col-span-4 md:col-start-6">
              <div className="eyebrow mb-3">The Method</div>
              <p className="font-display text-[15px] leading-relaxed text-parchment/80">
                Seven chapters, forty-odd lessons, a handful of puzzles, and a laboratory
                in which every kernel you write runs directly in the margin,{' '}
                <em className="italic">sans</em> graphics card.
              </p>
            </div>

            <div className="col-span-12 md:col-span-3 md:col-start-10">
              <div className="eyebrow mb-3">Begin</div>
              <button
                onClick={() => {
                  const first = curriculum[0];
                  if (first?.lessons[0]) {
                    navigate(`/module/${first.id}/lesson/${first.lessons[0].id}`);
                  }
                }}
                className="group flex items-baseline gap-3 font-display text-[28px] font-semibold
                           text-parchment transition-colors hover:text-gold"
                style={{ fontVariationSettings: "'opsz' 36, 'SOFT' 80" }}
              >
                <span className="font-ital text-[22px] font-normal italic text-copper
                                  transition-transform group-hover:-translate-x-1">
                  →
                </span>
                Chapter the First
              </button>
            </div>
          </div>
        </div>

        {/* Counts line */}
        <div className="mx-auto mt-24 max-w-[1100px]">
          <div className="rule-ornate mb-6">
            <span className="font-ital text-[14px] italic">◆</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-3 font-display text-[13px] text-parchment-dim">
            <Stat label="Chapters" value={curriculum.length} />
            <Stat label="Lessons" value={totalLessons} />
            <Stat label="Puzzles" value={totalPuzzles} />
            <Stat label="Examinations" value={curriculum.length} />
          </div>
        </div>
      </section>

      {/* Table of contents */}
      <section className="relative px-12 py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-[56px] font-semibold leading-none text-parchment-ink"
                style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 100", letterSpacing: '-0.015em' }}>
              Contents<span className="text-copper">.</span>
            </h2>
            <div className="eyebrow">In {toRoman(curriculum.length)} Parts</div>
          </div>
          <div className="mb-14 h-px w-full bg-gradient-to-r from-copper via-wine-glow to-transparent" />

          <ol className="space-y-0">
            {curriculum.map((mod, idx) => {
              const totalItems = mod.lessons.length + mod.puzzles.length + 1;
              const pct = Math.round(progress.getModuleProgress(mod.id, totalItems) * 100);

              return (
                <li key={mod.id}>
                  <button
                    onClick={() =>
                      navigate(`/module/${mod.id}/lesson/${mod.lessons[0]?.id}`)
                    }
                    className="group grid w-full grid-cols-12 items-start gap-6 border-t border-wine-glow/30
                               py-9 text-left transition-colors hover:bg-wine-glow/[0.08] last:border-b"
                  >
                    {/* Roman numeral */}
                    <div className="col-span-2 md:col-span-1">
                      <div className="font-display text-[44px] font-medium leading-none text-copper
                                      transition-colors group-hover:text-gold"
                           style={{ fontVariationSettings: "'opsz' 72, 'SOFT' 20" }}>
                        {toRoman(idx + 1)}
                      </div>
                    </div>

                    {/* Title & description */}
                    <div className="col-span-10 md:col-span-6">
                      <h3 className="font-display text-[28px] font-semibold leading-[1.1] text-parchment-ink
                                     transition-colors group-hover:text-gold"
                          style={{ fontVariationSettings: "'opsz' 36, 'SOFT' 80", letterSpacing: '-0.01em' }}>
                        {mod.title}
                      </h3>
                      <p className="mt-2 max-w-md font-display text-[14.5px] leading-relaxed text-parchment/70">
                        {mod.description}
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="col-span-6 md:col-span-3 md:pt-2">
                      <div className="space-y-1.5 font-sans text-[11px] text-parchment-dim">
                        <div className="flex items-baseline gap-2">
                          <span className="uppercase tracking-caps text-parchment-mute">Lessons</span>
                          <span className="flex-1 border-b border-dotted border-wine-glow/50" />
                          <span className="font-display text-parchment numeral-lining">
                            {toRoman(mod.lessons.length)}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="uppercase tracking-caps text-parchment-mute">Puzzles</span>
                          <span className="flex-1 border-b border-dotted border-wine-glow/50" />
                          <span className="font-display text-parchment numeral-lining">
                            {toRoman(Math.max(mod.puzzles.length, 1))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Difficulty + progress */}
                    <div className="col-span-6 md:col-span-2 md:pt-2 text-right">
                      <span className={diffClass[mod.difficulty]}>
                        {mod.difficulty}
                      </span>
                      {pct > 0 && (
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <div className="h-px w-14 bg-wine-glow/60">
                            <div className="h-full bg-gold transition-all"
                                 style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-sans text-[10px] tracking-caps text-gold">
                            {pct}%
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Colophon */}
      <section className="border-t border-wine-glow/40 px-12 py-16">
        <div className="mx-auto max-w-[1100px]">
          <div className="grid grid-cols-12 gap-x-8">
            <div className="col-span-12 md:col-span-3">
              <div className="eyebrow mb-3">Colophon</div>
            </div>
            <div className="col-span-12 md:col-span-9 font-display text-[15px] leading-relaxed text-parchment/75">
              <p>
                Set in <em className="italic">Fraunces</em> and{' '}
                <em className="italic">Instrument Serif</em>, with code
                specimens in <span className="font-mono text-[13px] text-gold">IBM Plex Mono</span>.
                Executed in the browser by way of Pyodide &amp; NumPy. Inspired by{' '}
                <em className="italic">Triton-Puzzles</em> (GPU MODE) and the kernels
                of <em className="italic">vLLM</em>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="font-display text-[26px] font-semibold text-parchment numeral-lining"
            style={{ fontVariationSettings: "'opsz' 36, 'SOFT' 80" }}>
        {value}
      </span>
      <span className="font-sans text-[10.5px] uppercase tracking-widest-caps text-parchment-mute">
        {label}
      </span>
    </div>
  );
}
