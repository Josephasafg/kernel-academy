import { useParams, useNavigate } from 'react-router-dom';
import { curriculum } from '../content/curriculum';
import { useProgress } from '../store/progress';
import { CodePlayground } from './CodePlayground';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

export function LessonView() {
  const { moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { completeLesson, isLessonComplete } = useProgress();

  const mod = curriculum.find((m) => m.id === moduleId);
  const lesson = mod?.lessons.find((l) => l.id === lessonId);

  if (!mod || !lesson) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">Lesson not found.</p>
      </div>
    );
  }

  const lessonIdx = mod.lessons.findIndex((l) => l.id === lessonId);
  const completed = isLessonComplete(lesson.id);

  // Navigation helpers
  const prev = lessonIdx > 0 ? mod.lessons[lessonIdx - 1] : null;
  const next = lessonIdx < mod.lessons.length - 1 ? mod.lessons[lessonIdx + 1] : null;
  const nextIsPuzzle = !next && mod.puzzles.length > 0;

  const handleMarkComplete = () => {
    completeLesson(lesson.id);
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
          <span className="text-white font-medium">{lesson.title}</span>
        </div>

        <button
          onClick={handleMarkComplete}
          className={completed ? 'btn-success !py-1.5 !text-xs' : 'btn-primary !py-1.5 !text-xs'}
        >
          {completed ? (
            <>
              <Check size={14} /> Completed
            </>
          ) : (
            <>
              <BookOpen size={14} /> Mark Complete
            </>
          )}
        </button>
      </header>

      {/* Content */}
      <div className="flex flex-1 min-h-0">
        {/* Lesson text */}
        <div className="w-1/2 overflow-y-auto border-r border-white/[0.04] p-8">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6">
              <span className="badge-beginner mb-2 inline-block text-[10px]">
                Lesson {lessonIdx + 1} of {mod.lessons.length}
              </span>
              <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
            </div>

            <div className="lesson-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {lesson.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Code playground */}
        <div className="w-1/2 p-4">
          <CodePlayground initialCode={lesson.code} readOnly={false} />
        </div>
      </div>

      {/* Navigation footer */}
      <footer className="flex items-center justify-between border-t border-white/[0.04] bg-surface/40 px-6 py-3">
        {prev ? (
          <button
            onClick={() => navigate(`/module/${mod.id}/lesson/${prev.id}`)}
            className="btn-ghost"
          >
            <ArrowLeft size={14} />
            {prev.title}
          </button>
        ) : (
          <div />
        )}

        {next ? (
          <button
            onClick={() => navigate(`/module/${mod.id}/lesson/${next.id}`)}
            className="btn-primary !py-1.5 !text-xs"
          >
            Next: {next.title}
            <ArrowRight size={14} />
          </button>
        ) : nextIsPuzzle ? (
          <button
            onClick={() =>
              navigate(`/module/${mod.id}/puzzle/${mod.puzzles[0].id}`)
            }
            className="btn-primary !py-1.5 !text-xs"
          >
            Try the Puzzle
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
      </footer>
    </div>
  );
}
