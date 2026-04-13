export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Lesson {
  id: string;
  title: string;
  content: string;
  code: string;
}

export interface Puzzle {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  starterCode: string;
  solution: string;
  testCode: string;
  hints: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: Difficulty;
  lessons: Lesson[];
  puzzles: Puzzle[];
  quiz: Quiz;
}
