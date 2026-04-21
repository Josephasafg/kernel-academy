import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { LessonView } from './components/LessonView';
import { PuzzleView } from './components/PuzzleView';
import { QuizView } from './components/QuizView';
import { About } from './components/About';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="module/:moduleId/lesson/:lessonId"
          element={<LessonView />}
        />
        <Route
          path="module/:moduleId/puzzle/:puzzleId"
          element={<PuzzleView />}
        />
        <Route path="module/:moduleId/quiz" element={<QuizView />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  );
}
