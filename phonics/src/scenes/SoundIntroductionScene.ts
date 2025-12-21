// SoundIntroductionScene.ts
// Scene to introduce a letter or letter team with text (audio to be added later)

import Phaser from 'phaser';
import type { SoundIntroduction } from '../config/soundIntroductions';

export default class SoundIntroductionScene extends Phaser.Scene {
  private introData!: SoundIntroduction;

  constructor() {
    super({ key: 'SoundIntroductionScene' });
  }

  init(data: { intro: SoundIntroduction }) {
    this.introData = data.intro;
  }

  create() {
    const { displayName, description, id } = this.introData;

    this.add.text(this.cameras.main.centerX, 100, displayName, {
      fontSize: '64px',
      color: '#222',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(this.cameras.main.centerX, 200, description, {
      fontSize: '32px',
      color: '#444',
      wordWrap: { width: 600 },
      align: 'center',
    }).setOrigin(0.5);

    // Add a back button
    const backBtn = this.add.text(this.cameras.main.centerX, 400, 'Back', {
      fontSize: '28px',
      color: '#007acc',
      backgroundColor: '#eee',
      padding: { left: 16, right: 16, top: 8, bottom: 8 },
    }).setOrigin(0.5).setInteractive();
    backBtn.on('pointerdown', () => {
      if (this.sound) this.sound.stopAll();
      this.scene.start('Menu');
    });

    // Play audio sequence for letter 'c' introduction
    if (id === 'c') {
      this.load.audio('intro1', '/audio/prompts/this-is-the-letter.wav');
      this.load.audio('intro2', '/audio/phonics-units/c-name.wav');
      this.load.audio('intro3', '/audio/prompts/it-makes-the-sound.wav');
      this.load.audio('intro4', '/audio/phonics-units/c-sound.wav');
      this.load.once('complete', () => {
        const playNext = (key: string, next?: () => void) => {
          const sound = this.sound.add(key);
          sound.play();
          sound.once('complete', () => {
            sound.destroy();
            if (next) next();
          });
        };
        playNext('intro1', () => {
          playNext('intro2', () => {
            playNext('intro3', () => {
              playNext('intro4');
            });
          });
        });
      });
      this.load.start();
    }
  }

  shutdown() {
    if (this.sound) this.sound.stopAll();
  }
}
