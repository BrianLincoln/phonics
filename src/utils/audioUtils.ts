import { useAudioManager } from '../context/AudioManagerContext';

export function usePlayAudio() {
  const audioManager = useAudioManager();
  return (src: string, waitForEnd = false) =>
    waitForEnd ? audioManager.playAndWait(src) : audioManager.play(src);
}

export function useStopAllAudio() {
  const audioManager = useAudioManager();
  return () => audioManager.stopAll();
}
