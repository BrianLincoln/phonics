import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import MenuView from '../views/MenuView';
// import QuizView from '../views/_dep_QuizView.xx';
import AudioTest from './AudioTest';
import { UnitIndexView } from '../views/UnitIndexView';
import ProgressView from '../views/ProgressView';
import { stopAllAudio } from '../utils/audioUtils';
import { ActivityView } from '../views/ActivityView';
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
      <Route path="/activity/:activityId" element={<ActivityView />} />
      <Route path="/audiotest" element={<AudioTest />} />
      <Route path="/units" element={<UnitIndexView />} />
      <Route path="/progress" element={<ProgressView />} />
    </Routes>
  );
};

export default App;
