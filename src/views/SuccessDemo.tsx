import React, { useRef } from 'react';
import { PhaserGame } from '../components/PhaserGame';

const SuccessDemo: React.FC = () => {
  const phaserRef = useRef<any>(null);

  // Handler for when the SuccessScene completes
  const handleSuccessComplete = () => {
    // Optionally do something after animation
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#eee' }}>
      <PhaserGame
        sceneType="success"
        sceneData={{ onComplete: handleSuccessComplete }}
        onSceneReady={scene => { phaserRef.current = scene; }}
      />
    </div>
  );
};

export default SuccessDemo;
