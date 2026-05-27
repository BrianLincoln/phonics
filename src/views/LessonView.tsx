import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { curriculum } from '../data/curriculum';
import { activities, ActivityType, type Activity, type LessonActivity, type BuildTheWordActivity } from '../data/activities';
import { LessonActivity as LessonActivityComponent } from '../components/Activities/LessonActivity';
import { BuildTheWordExercise } from '../components/Activities/BuildTheWord/BuildTheWordActivity';
import './LessonStubView.css';

export function LessonView() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const navigate   = useNavigate();

  const node = curriculum.find(n => n.id === nodeId);
  const isCheckpoint = node?.type === 'checkpoint';

  const nodeActivities = (node?.activityIds ?? [])
    .map(id => activities.find(a => a.id === id))
    .filter((a): a is Activity => !!a);

  const [activityIndex, setActivityIndex] = useState(0);

  // Accumulate correct/total for checkpoint nodes
  const checkpointRef = useRef({ correct: 0, total: 0 });

  if (!node) {
    return (
      <div className="lesson-stub-root">
        <p>Node not found.</p>
        <button className="lesson-stub-btn" onClick={() => navigate('/map')}>Back to Map</button>
      </div>
    );
  }

  function finishNode(scoreOverride?: { correct: number; total: number }) {
    if (isCheckpoint) {
      const score = scoreOverride ?? checkpointRef.current;
      navigate('/map', { state: { completedNodeId: nodeId, checkpointScore: score } });
    } else {
      navigate('/map', { state: { completedNodeId: nodeId } });
    }
  }

  if (nodeActivities.length === 0) {
    return (
      <div className="lesson-stub-root">
        <div className="lesson-stub-card">
          <div className="lesson-stub-focus">{node.label}</div>
          {isCheckpoint && (
            <p className="lesson-stub-notice">🏆 Challenge — exercises coming soon.</p>
          )}
          {!isCheckpoint && (
            <p className="lesson-stub-notice">🚧 Exercises coming soon.</p>
          )}
          <button
            className="lesson-stub-btn lesson-stub-btn--complete"
            onClick={() => finishNode(isCheckpoint ? { correct: 4, total: 5 } : undefined)}
          >
            Mark Complete (stub)
          </button>
          <button className="lesson-stub-btn lesson-stub-btn--back" onClick={() => navigate('/map')}>
            Back (no progress)
          </button>
        </div>
      </div>
    );
  }

  function handleComplete(wasCorrect?: boolean) {
    if (isCheckpoint) {
      checkpointRef.current = {
        correct: checkpointRef.current.correct + (wasCorrect ? 1 : 0),
        total:   checkpointRef.current.total + 1,
      };
    }

    if (activityIndex < nodeActivities.length - 1) {
      setActivityIndex(activityIndex + 1);
    } else {
      finishNode();
    }
  }

  const current = nodeActivities[activityIndex];

  if (current.activityType === ActivityType.LESSON) {
    return (
      <LessonActivityComponent
        activity={current as LessonActivity}
        onComplete={handleComplete}
        onBack={() => navigate('/map')}
      />
    );
  }

  if (current.activityType === ActivityType.BUILD_THE_WORD) {
    return (
      <BuildTheWordExercise
        activity={current as BuildTheWordActivity}
        onComplete={handleComplete}
        onBack={() => navigate('/map')}
      />
    );
  }

  return (
    <div className="lesson-stub-root">
      <p>Unknown activity type.</p>
      <button className="lesson-stub-btn" onClick={() => navigate('/map')}>Back to Map</button>
    </div>
  );
}
