import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import MenuView from '../views/MenuView';
import QuizView from '../views/QuizView';
import AudioTest from './AudioTest';
import QuizIndexView from '../views/QuizIndexView';
import ProgressView from '../views/ProgressView';
import { stopAllAudio } from '../utils/audioUtils';
// ...existing code...
// import ProgressView from './ProgressView';
// import CrowDemoView from './CrowDemoView';



const App: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    stopAllAudio();
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<MenuView />} />
      <Route path="/quiz" element={<QuizView />} />
      <Route path="/audiotest" element={<AudioTest />} />
      <Route path="/quizzes" element={<QuizIndexView />} />
      <Route path="/progress" element={<ProgressView />} />
      {/* <Route path="/crow-demo" element={<CrowDemoView />} /> */}
    </Routes>
  );
};

export default App;
