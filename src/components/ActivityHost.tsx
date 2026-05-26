import React from 'react'
import { LessonActivity } from './Activities/LessonActivity';
import { LeafParade } from './Activities/LeafParade/LeafParade';
import { Activity, ActivityType } from '../data/activities';

interface ActivityHostProps {
  activity: Activity
  onComplete: (result?: any) => void
}

// Map activityType string → React component
const activityRegistry: Record<string, React.FC<{ activity: Activity; onComplete: (result?: any) => void }>> = {
  [ActivityType.LESSON]: LessonActivity,
  [ActivityType.LEAF_PARADE]: LeafParade,
}

export function ActivityHost({ activity, onComplete }: ActivityHostProps) {
  const ActivityComponent = activityRegistry[activity.activityType]

  if (!ActivityComponent) {
    throw new Error(`Unknown activity type: ${activity.activityType}`)
  }

  return (
    <div className="activity-host">
      <div className="activity-surface">
        <ActivityComponent activity={activity} onComplete={onComplete} />
      </div>
    </div>
  )
}
