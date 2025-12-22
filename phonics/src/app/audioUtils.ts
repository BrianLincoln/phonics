// audioUtils.ts
// Simple audio utility for React quiz orchestration


// Use AudioManager from context for all audio playback

import { useAudioManager } from './AudioManagerContext';

export function usePlayAudio() {
  const audioManager = useAudioManager();
  return (src: string, waitForEnd = false) =>
    waitForEnd ? audioManager.playAndWait(src) : audioManager.play(src);
}

export function stopAllAudio() {
  // Optionally implement stopAll in AudioManager and call here
  document.querySelectorAll('audio').forEach((el) => {
    (el as HTMLAudioElement).pause();
    (el as HTMLAudioElement).currentTime = 0;
  });
}
