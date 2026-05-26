import { useParams, useNavigate } from 'react-router-dom';
import { curriculum } from '../data/curriculum';
import './LessonStubView.css';

export function LessonStubView() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const navigate   = useNavigate();
  const node       = curriculum.find(n => n.id === nodeId);

  if (!node) {
    return (
      <div className="lesson-stub-root">
        <p>Node not found.</p>
        <button className="lesson-stub-btn" onClick={() => navigate('/map')}>
          Back to Map
        </button>
      </div>
    );
  }

  return (
    <div className="lesson-stub-root">
      <div className="lesson-stub-card">
        <div className="lesson-stub-focus">{node.label}</div>
        <p className="lesson-stub-sound">/{node.focus}/</p>
        <p className="lesson-stub-types">{node.exerciseTypes.join(' · ')}</p>

        <p className="lesson-stub-notice">
          🚧 Lesson coming soon — tap Complete to advance on the map.
        </p>

        <button
          className="lesson-stub-btn lesson-stub-btn--complete"
          onClick={() => navigate('/map', { state: { completedNodeId: nodeId } })}
        >
          Complete Lesson ✓
        </button>
        <button
          className="lesson-stub-btn lesson-stub-btn--back"
          onClick={() => navigate('/map')}
        >
          Back (no progress saved)
        </button>
      </div>
    </div>
  );
}
