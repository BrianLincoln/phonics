import React from 'react'
import { MCQActivity } from './Activities/MultipleChoice/MultipleChoiceActivity';
import { LeafParade } from './Activities/LeafParade/LeafParade';
import { Activity } from '../data/activities';

interface ActivityHostProps {
  activity: Activity
  onComplete: (result?: any) => void
}

// Map string type → React component
const activityRegistry: Record<string, React.FC<{ activity: Activity; onComplete: (result?: any) => void }>> = {
  mcq: MCQActivity,
  findPhoneme: LeafParade,
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
