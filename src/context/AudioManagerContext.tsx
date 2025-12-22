import * as React from "react";
const { createContext, useContext, useRef } = React;

class AudioManager {
  private unlocked = false;
  private persistentAudio: HTMLAudioElement;
  private silentSrc = "/audio/system/click.wav"; // Use a short, silent or near-silent wav

  constructor() {
    this.persistentAudio = new Audio();
    this.persistentAudio.preload = "auto";
    this.persistentAudio.src = this.silentSrc;
  }

  async unlock() {
    // Play a silent sound to unlock audio for HTMLAudioElement
    try {
      this.persistentAudio.currentTime = 0;
      await this.persistentAudio.play();
    } catch (e) {
      // ignore
    }
    this.unlocked = true;
  }

  isUnlocked() {
    return this.unlocked;
  }

  async play(src: string) {
    // Use a new HTMLAudioElement for each sound (allows overlap)
    const audio = new Audio(src);
    try {
      await audio.play();
      this.unlocked = true;
    } catch (e) {
      // fallback: try to unlock again and retry
      try {
        await this.unlock();
        await audio.play();
        this.unlocked = true;
      } catch (err) {
        // still failed
      }
    }
    return audio;
  }

  async playAndWait(src: string) {
    return new Promise<HTMLAudioElement>((resolve, reject) => {
      const audio = new Audio(src);
      audio.onended = () => {
        this.unlocked = true;
        resolve(audio);
      };
      audio.onerror = (e) => reject(e);
      audio.play().then(() => {
        this.unlocked = true;
      }).catch(async (err) => {
        try {
          await this.unlock();
          await audio.play();
          this.unlocked = true;
        } catch (e2) {
          reject(e2);
        }
      });
    });
  }

  stopAll() {
    // Stop all <audio> elements in DOM
    document.querySelectorAll('audio').forEach((el) => {
      (el as HTMLAudioElement).pause();
      (el as HTMLAudioElement).currentTime = 0;
    });
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
