// helpers/audio.ts
// Utility for getting the AudioContext from a Phaser sound manager, if available.

export function getAudioContext(sound: Phaser.Sound.BaseSoundManager): AudioContext | null {
  const sm: any = sound as any;
  if (sm.context && typeof sm.context.state === 'string') {
    return sm.context as AudioContext;
  }
  return null;
}
