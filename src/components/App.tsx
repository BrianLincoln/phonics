import { Routes, Route } from 'react-router-dom';
import MenuView from '../views/MenuView';
// import QuizView from '../views/_dep_QuizView.xx';
import AudioTest from './AudioTest';
import { UnitIndexView } from '../views/UnitIndexView';
import ProgressView from '../views/ProgressView';
import { ActivityView } from '../views/ActivityView';
import { EndlessActivity } from './Activities/EndlessActivity';
import SuccessDemo from '../views/SuccessDemo';
// ...existing code...
// import ProgressView from './ProgressView';
// import CrowDemoView from './CrowDemoView';



const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MenuView />} />
      <Route path="/activity/:activityId" element={<ActivityView />} />
      <Route path="/endless" element={<EndlessActivity />} />
      <Route path="/audiotest" element={<AudioTest />} />
      <Route path="/units" element={<UnitIndexView />} />
      <Route path="/progress" element={<ProgressView />} />
      <Route path="/success-demo" element={<SuccessDemo />} />
    </Routes>
  );
};

export default App;
