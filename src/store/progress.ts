import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgressState {
  completedLessons: string[];
  solvedPuzzles: string[];
  quizScores: Record<string, number>;
  codeEdits: Record<string, string>;
  sidebarOpen: boolean;

  completeLesson: (id: string) => void;
  solvePuzzle: (id: string) => void;
  setQuizScore: (moduleId: string, score: number) => void;
  setCodeEdit: (key: string, code: string) => void;
  getCodeEdit: (key: string) => string | undefined;
  clearCodeEdit: (key: string) => void;
  toggleSidebar: () => void;
  getModuleProgress: (moduleId: string, totalItems: number) => number;
  isLessonComplete: (id: string) => boolean;
  isPuzzleSolved: (id: string) => boolean;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessons: [],
      solvedPuzzles: [],
      quizScores: {},
      codeEdits: {},
      sidebarOpen: true,

      completeLesson: (id) =>
        set((s) => ({
          completedLessons: s.completedLessons.includes(id)
            ? s.completedLessons
            : [...s.completedLessons, id],
        })),

      solvePuzzle: (id) =>
        set((s) => ({
          solvedPuzzles: s.solvedPuzzles.includes(id)
            ? s.solvedPuzzles
            : [...s.solvedPuzzles, id],
        })),

      setQuizScore: (moduleId, score) =>
        set((s) => ({
          quizScores: {
            ...s.quizScores,
            [moduleId]: Math.max(s.quizScores[moduleId] ?? 0, score),
          },
        })),

      setCodeEdit: (key, code) =>
        set((s) => ({ codeEdits: { ...s.codeEdits, [key]: code } })),

      getCodeEdit: (key) => get().codeEdits[key],

      clearCodeEdit: (key) =>
        set((s) => {
          const { [key]: _, ...rest } = s.codeEdits;
          return { codeEdits: rest };
        }),

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      getModuleProgress: (moduleId, totalItems) => {
        const state = get();
        const lessons = state.completedLessons.filter((id) =>
          id.startsWith(moduleId),
        ).length;
        const puzzles = state.solvedPuzzles.filter((id) =>
          id.startsWith(moduleId),
        ).length;
        const quiz = state.quizScores[moduleId] !== undefined ? 1 : 0;
        const completed = lessons + puzzles + quiz;
        return totalItems > 0 ? completed / totalItems : 0;
      },

      isLessonComplete: (id) => get().completedLessons.includes(id),
      isPuzzleSolved: (id) => get().solvedPuzzles.includes(id),
    }),
    { name: 'triton-teacher-progress' },
  ),
);
