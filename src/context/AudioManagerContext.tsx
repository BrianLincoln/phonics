import * as React from "react";
const { createContext, useContext, useRef } = React;

class AudioManager {
  private playing = new Set<HTMLAudioElement>();

  private track(audio: HTMLAudioElement): HTMLAudioElement {
    this.playing.add(audio);
    const release = () => this.playing.delete(audio);
    audio.addEventListener('ended', release, { once: true });
    audio.addEventListener('error', release, { once: true });
    return audio;
  }

  async play(src: string): Promise<HTMLAudioElement> {
    const audio = this.track(new Audio(src));
    await audio.play().catch(() => this.playing.delete(audio));
    return audio;
  }

  async playAndWait(src: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = this.track(new Audio(src));
      audio.addEventListener('ended', () => resolve(audio), { once: true });
      audio.addEventListener('error', (e) => reject(e), { once: true });
      audio.play().catch(reject);
    });
  }

  stopAll() {
    this.playing.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.playing.clear();
  }
}

const AudioManagerContext = createContext<AudioManager | null>(null);

export const useAudioManager = () => {
  const ctx = useContext(AudioManagerContext);
  if (!ctx) throw new Error("useAudioManager must be used within AudioManagerProvider");
  return ctx;
};

export const AudioManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const managerRef = useRef<AudioManager | null>(null);
  if (!managerRef.current) {
    managerRef.current = new AudioManager();
  }
  return (
    <AudioManagerContext.Provider value={managerRef.current}>
      {children}
    </AudioManagerContext.Provider>
  );
};
