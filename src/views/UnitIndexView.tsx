import React from 'react';
import { useNavigate } from 'react-router-dom';


import { units } from '../data/units';
import { activities } from '../data/activities';
import './UnitIndexView.css';


export const UnitIndexView: React.FC = () => {
  const navigate = useNavigate();

  // Group activities by unit
  const activitiesByUnit: Record<string, typeof activities> = {};
  activities.forEach((activity) => {
    if (!activitiesByUnit[activity.unit]) activitiesByUnit[activity.unit] = [];
    activitiesByUnit[activity.unit].push(activity);
  });

  // Only show units that have activities
  const filteredUnits = units.filter((unit) => activitiesByUnit[unit.id]);

  return (
    <div className="unit-index-root">
      <button className="unit-index-back" onClick={() => navigate('/')}>⬅ Back</button>
      <h2 className="unit-index-title">Select a Unit Activity</h2>
      <div className="unit-index-list">
        {filteredUnits.map((unit) => (
          <div key={unit.id} className="unit-index-unit-block">
            <h3 className="unit-index-unit-heading">{unit.name}</h3>
            <div className="unit-index-activity-list">
              {activitiesByUnit[unit.id].map((activity) => (
                <button
                  key={activity.id}
                  className="unit-index-activity-btn"
                  onClick={() => navigate(`/activity/${activity.id}`)}
                >
                  <span className="unit-index-activity-label">
                    {activity.id.replace(/^quiz-/, '').replace(/-/g, ' ')}
                  </span>
                  <span className="unit-index-activity-type">
                    {activity.activityType.replace(/-/g, ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <h3 className="unit-index-intro-title">Select a letter or letter team</h3>
    </div>
  );
};
