import React from 'react';
import { usePlayAudio } from './audioUtils';

const AudioTest: React.FC = () => {
  const playAudio = usePlayAudio();
  return (
    <div style={{ padding: 32 }}>
      <button onClick={() => playAudio('/audio/prompts/this-is-the-letter.wav')}>Play Test Audio</button>
    </div>
  );
};

export default AudioTest;
