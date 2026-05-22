import * as React from "react";
const { createContext, useContext, useRef } = React;

// ---------- user-interaction unlock ----------
// Chrome blocks audio.play() until the user has interacted with the page.
// We listen in capture phase to catch the very first click/key/touch.

let userHasInteracted = false;
const interactionListeners: (() => void)[] = [];

function onFirstInteraction(cb: () => void) {
  if (userHasInteracted) { cb(); return; }
  interactionListeners.push(cb);
}

function markInteracted() {
  if (userHasInteracted) return;
  userHasInteracted = true;
  interactionListeners.splice(0).forEach(cb => cb());
}

if (typeof document !== 'undefined') {
  document.addEventListener('click',      markInteracted, { capture: true, once: true });
  document.addEventListener('keydown',    markInteracted, { capture: true, once: true });
  document.addEventListener('touchstart', markInteracted, { capture: true, once: true });
}
// --------------------------------------------

class AudioManager {
  private playing = new Set<HTMLAudioElement>();
  private pendingResolvers = new Map<HTMLAudioElement, () => void>();
  // Cancellers for playAndWait calls that are suspended waiting for user interaction
  private interactionWaiters: (() => void)[] = [];

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
    // If no user interaction yet, park here until one happens or stopAll() cancels us.
    // This prevents Chrome from silently failing (or worse, auto-muting the tab).
    if (!userHasInteracted) {
      await new Promise<void>((resolve, reject) => {
        const cancel = () => reject(new Error('audio-cancelled'));
        this.interactionWaiters.push(cancel);
        onFirstInteraction(() => {
          const idx = this.interactionWaiters.indexOf(cancel);
          if (idx >= 0) this.interactionWaiters.splice(idx, 1);
          resolve();
        });
      });
      // If the promise above rejected (stopAll called before interaction), the
      // async function throws here, rejecting the returned promise. The
      // `.catch(() => {})` at the call site swallows it and execution continues.
    }

    return new Promise((resolve, reject) => {
      const audio = this.track(new Audio(src));
      const cleanup = () => {
        this.pendingResolvers.delete(audio);
        resolve(audio);
      };
      this.pendingResolvers.set(audio, cleanup);
      audio.addEventListener('ended', cleanup, { once: true });
      audio.addEventListener('error', (e) => {
        this.pendingResolvers.delete(audio);
        reject(e);
      }, { once: true });
      audio.play().catch((e) => {
        this.pendingResolvers.delete(audio);
        reject(e);
      });
    });
  }

  stopAll() {
    // Cancel any playAndWait calls waiting for first user interaction
    this.interactionWaiters.splice(0).forEach(cancel => cancel());

    // Stop and resolve any in-flight audio
    this.playing.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      const resolve = this.pendingResolvers.get(audio);
      if (resolve) {
        this.pendingResolvers.delete(audio);
        resolve();
      }
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
