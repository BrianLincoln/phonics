import React from 'react';
import { LeafParadeActivity as LeafParadeActivityType } from '../../../data/activities';
import LeafParadeActivity from './LeafParadeActivity';

interface LeafParadeProps {
  activity: LeafParadeActivityType;
  onComplete: (result?: any) => void;
}

export const LeafParade: React.FC<LeafParadeProps> = ({ activity, onComplete }) => {
  return <LeafParadeActivity activity={activity} onComplete={onComplete} />;
};
