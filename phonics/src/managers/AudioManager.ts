import Phaser from 'phaser';

export class AudioManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  playPromptSequence(phonemeFile: string): void {
    const promptSound = this.scene.sound.add('prompt');
    promptSound.play();
    promptSound.once('complete', () => {
      this.scene.sound.play('phoneme');
    });
  }

  playSuccess(): void {
    this.scene.sound.play('success');
  }

  playFailure(): void {
    this.scene.sound.play('failure');
  }
}
