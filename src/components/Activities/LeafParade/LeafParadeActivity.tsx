import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../../../components/PhaserGame';
import { LeafParadeActivityType } from '../../../data/activities';
import { usePlayAudio } from '../../../utils/audioUtils';
import './LeafParadeActivity.css';

// import { handleQuizCompletion } from '../../../helpers/handleQuizCompletion';

interface LeafParadeActivityProps {
  activity: LeafParadeActivityType;
  onComplete: (result?: any) => void;
}

export const LeafParadeActivity: React.FC<LeafParadeActivityProps> = ({ activity, onComplete }) => {
  const navigate = useNavigate();
  const phaserRef = useRef<any>(null);
  const playAudio = usePlayAudio();

  // State to control which scene is shown
  const [sceneType, setSceneType] = useState<'leaf-parade' | 'success'>('leaf-parade');

  // Called by Phaser scene when the activity is complete
  const handleComplete = () => {
    setSceneType('success');
  };


  useEffect(() => {
    const scene = phaserRef.current;
    if (!scene) return;
    const completeHandler = () => setSceneType('success');
    scene.events?.on && scene.events.on('question-complete', completeHandler);
    return () => {
      scene.events?.off && scene.events.off('question-complete', completeHandler);
      if (scene.scene?.stop) {
        scene.scene.stop();
      }
    };
  }, [phaserRef.current]);

  // When SuccessScene finishes, call onComplete and navigate
  const handleSuccessComplete = () => {
    if (typeof onComplete === 'function') onComplete(true);
    navigate('/');
  };

  return (
    <div className="activity-root">
      <div className="activity-header">
        <button className="activity-back-btn" onClick={() => navigate('/')}>⬅ Back</button>
      </div>
      <div className="activity-stacked-layout">
        <PhaserGame
          sceneType={sceneType}
          sceneData={
            sceneType === 'leaf-parade'
              ? { activity: activity, playAudio, onQuestionComplete: handleComplete }
              : undefined
          }
          onSceneReady={scene => { phaserRef.current = scene; }}
        />
      </div>
    </div>
  );
};

export default LeafParadeActivity;
