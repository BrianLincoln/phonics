import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { curriculum } from '../data/curriculum';
import { activities, ActivityType, type Activity, type LessonActivity, type BuildTheWordActivity } from '../data/activities';
import { units } from '../data/units';
import { LessonActivity as LessonActivityComponent } from '../components/Activities/LessonActivity';
import { BuildTheWordExercise } from '../components/Activities/BuildTheWord/BuildTheWordActivity';
import './LessonStubView.css';

export function LessonView() {
  const { nodeId } = useParams<{ nodeId: string }>();
  const navigate   = useNavigate();

  const node = curriculum.find(n => n.id === nodeId);
  const unit = node ? units.find(u => u.id === node.focus) : undefined;

  const nodeActivities = (node?.activityIds ?? [])
    .map(id => activities.find(a => a.id === id))
    .filter((a): a is Activity => !!a);

  const [activityIndex, setActivityIndex] = useState(0);

  if (!node) {
    return (
      <div className="lesson-stub-root">
        <p>Node not found.</p>
        <button className="lesson-stub-btn" onClick={() => navigate('/map')}>Back to Map</button>
      </div>
    );
  }

  if (nodeActivities.length === 0) {
    return (
      <div className="lesson-stub-root">
        <div className="lesson-stub-card">
          <div className="lesson-stub-focus">{node.label}</div>
          <p className="lesson-stub-notice">🚧 Exercises coming soon.</p>
          <button className="lesson-stub-btn lesson-stub-btn--complete" onClick={() => navigate('/map', { state: { completedNodeId: nodeId } })}>
            Mark Complete (stub)
          </button>
          <button className="lesson-stub-btn lesson-stub-btn--back" onClick={() => navigate('/map')}>
            Back (no progress)
          </button>
        </div>
      </div>
    );
  }

  function handleComplete() {
    if (activityIndex < nodeActivities.length - 1) {
      setActivityIndex(activityIndex + 1);
    } else {
      navigate('/map', { state: { completedNodeId: nodeId } });
    }
  }

  const current = nodeActivities[activityIndex];

  // Unified lesson activity (word-start + letter-sound + blend in one sequence)
  if (current.activityType === ActivityType.LESSON) {
    const introUnit = (current.showIntro && activityIndex === 0 && unit)
      ? { nameAudio: unit.nameAudio, soundAudio: unit.soundAudio }
      : undefined;

    return (
      <LessonActivityComponent
        activity={current as LessonActivity}
        introUnit={introUnit}
        onComplete={handleComplete}
        onBack={() => navigate('/map')}
      />
    );
  }

  // Standalone build-the-word (used when a node explicitly chains a BTW activity)
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
