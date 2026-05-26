
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { activities, ActivityType, LeafParadeActivity, LessonActivity, BuildTheWordActivity } from '../data/activities';
import { LeafParade } from '../components/Activities/LeafParade/LeafParade';
import { LessonActivity as LessonActivityComponent } from '../components/Activities/LessonActivity';
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
    case ActivityType.LESSON:
      return (
        <LessonActivityComponent
          activity={activity as LessonActivity}
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