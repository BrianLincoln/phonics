// SoundIntroductionScene.ts
// Scene to introduce a letter or letter team with text (audio to be added later)

import Phaser from 'phaser';
import { SoundIntroduction } from '../config/soundIntroductions';

export default class SoundIntroductionScene extends Phaser.Scene {
  private introData: SoundIntroduction;

  constructor() {
    super({ key: 'SoundIntroductionScene' });
  }

  init(data: { intro: SoundIntroduction }) {
    this.introData = data.intro;
  }

  create() {
    const { displayName, description } = this.introData;

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
      this.scene.start('QuizIndex');
    });
  }
}
