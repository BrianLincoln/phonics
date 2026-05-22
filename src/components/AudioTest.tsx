import * as React from 'react';
import { useEffect } from 'react';
import { usePlayAudio } from '../utils/audioUtils';

const FILE = '/audio/prompts/which-letter-makes-the-sound.wav';

const AudioTest: React.FC = () => {
  const playAudio = usePlayAudio();

  useEffect(() => {
    playAudio(FILE, true);
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <p>Playing: <code>{FILE}</code></p>
      <button onClick={() => playAudio(FILE, true)}>Play again</button>
    </div>
  );
};

export default AudioTest;
