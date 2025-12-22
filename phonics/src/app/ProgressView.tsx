import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPhonicsProgress } from '../helpers/quizProgress';
import { stopAllAudio } from './audioUtils';
import type { PhonicsUnitProgress } from '../helpers/quizProgress';
import { phonicsUnits } from '../data/phonicsUnits';
import './ProgressView.css';

const ProgressView: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Record<string, PhonicsUnitProgress>>({});

  useEffect(() => {
    const data = getPhonicsProgress();
    setProgress(data.phonicsUnits);
    return () => {
      stopAllAudio();
    };
  }, []);

  return (
    <div className="progress-root">
      <button className="progress-back" onClick={() => navigate('/')}>⬅ Back to Menu</button>
      <h2 className="progress-title">Phonics Progress</h2>
      <div className="progress-table-wrapper">
        <table className="progress-table">
          <thead>
            <tr>
              <th>Unit</th>
              <th>Correct</th>
              <th>Incorrect</th>
              <th>Recent</th>
              <th>Total</th>
              <th>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {phonicsUnits.map(unit => {
              const data = progress[unit.id];
              return (
                <tr key={unit.id}>
                  <td>{unit.name}</td>
                  <td>{data?.correct ?? 0}</td>
                  <td>{data?.incorrect ?? 0}</td>
                  <td>{data?.recent ? data.recent.map(r => r ? '✔️' : '❌').join(' ') : ''}</td>
                  <td>{data?.sampleSize ?? 0}</td>
                  <td>{data?.lastSeen ? new Date(data.lastSeen).toLocaleString() : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgressView;
