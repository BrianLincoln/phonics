
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { activities, Activity, ActivityType, LeafParadeActivity, MultipleChoiceActivity, BuildTheWordActivity } from '../data/activities';
import { LeafParade } from '../components/Activities/LeafParade/LeafParade';
import { MCQActivity } from '../components/Activities/MultipleChoice/MultipleChoiceActivity';
import { BuildTheWordExercise } from '../components/Activities/BuildTheWord/BuildTheWordActivity';


export const ActivityView: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const activity = activities.find(a => a.id === activityId);

  const navigateToHomeScreen = () => navigate('/');

  if (!activity) {
    return <div>Activity not found 😬</div>;
  }

  switch (activity.activityType) {
    case ActivityType.MULTIPLE_CHOICE:
      return (
        <MCQActivity
          activity={activity as MultipleChoiceActivity}
          onComplete={navigateToHomeScreen}
        />
      );

    case ActivityType.LEAF_PARADE:
      return <LeafParade
        activity={activity as LeafParadeActivity}
        onComplete={navigateToHomeScreen}
      />;

    case ActivityType.BUILD_THE_WORD:
      return (
        <BuildTheWordExercise
          activity={activity as BuildTheWordActivity}
          onComplete={navigateToHomeScreen}
        />
      );

    default:
      return <div>Unsupported activity type 😬</div>;
  }
};