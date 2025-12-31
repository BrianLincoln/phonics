import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhaserGame } from '../../../components/PhaserGame';
import { LeafParadeActivityType } from '../../../data/activities';
import { usePlayAudio } from '../../../utils/audioUtils';
import './LeafParadeActivity.css';

interface LeafParadeActivityProps {
  activity: LeafParadeActivityType;
  onComplete: (result?: any) => void;
}

export const LeafParadeActivity: React.FC<LeafParadeActivityProps> = ({ activity, onComplete }) => {
  const navigate = useNavigate();
  const phaserRef = useRef<any>(null);
  const playAudio = usePlayAudio();

  // Called by Phaser scene when the activity is complete
  const handleComplete = () => {
    onComplete(true);
  };


  useEffect(() => {
    const scene = phaserRef.current;
    if (!scene) return;
    const handleComplete = () => {
      // Optionally call onComplete(true) if you want to notify parent
      onComplete(true);
      navigate('/');
    };
    scene.events?.on && scene.events.on('question-complete', handleComplete);
    return () => {
      scene.events?.off && scene.events.off('question-complete', handleComplete);
      if (scene.scene?.stop) {
        scene.scene.stop();
      }
    };
  }, [phaserRef.current]);

  return (
    <div className="activity-root">
      <div className="activity-header">
        <button className="activity-back-btn" onClick={() => navigate('/')}>⬅ Back</button>
      </div>
      <div className="activity-stacked-layout">
        <PhaserGame
          sceneType="leaf-parade"
          sceneData={{ activity: activity, playAudio, onQuestionComplete: handleComplete }}
          onSceneReady={scene => { phaserRef.current = scene; }}
        />
      </div>
    </div>
  );
};

export default LeafParadeActivity;
