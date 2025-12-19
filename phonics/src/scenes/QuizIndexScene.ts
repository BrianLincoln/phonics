import Phaser from 'phaser';
import { quizzes } from '../data/quizzes';
import { getQuizCompletion } from '../helpers/quizProgress';
import { soundIntroductions } from '../config/soundIntroductions';
import type { SoundIntroduction } from '../config/soundIntroductions';

export class QuizIndexScene extends Phaser.Scene {
  constructor() {
    super('QuizIndex');
  }

  create() {
    this.cameras.main.setBackgroundColor('#f0f4fa');
    this.add.text(this.scale.width / 2, 60, 'Select a Quiz', {
      fontFamily: '"Segoe UI", "Arial", "Helvetica Neue", sans-serif',
      fontSize: '44px',
      color: '#1a1a1a',
      fontStyle: 'bold',
      stroke: '#fff',
      strokeThickness: 2,
      shadow: {
        offsetX: 0,
        offsetY: 2,
        color: '#bbb',
        blur: 4,
        fill: true
      }
    }).setOrigin(0.5, 0);

    const buttonWidth = 220;
    const buttonHeight = 44;
    const spacing = 14;
    const startY = 120;
    // Stack all quizzes vertically
    quizzes.forEach((quiz, i) => {
      const y = startY + i * (buttonHeight + spacing);
      this.createQuizButton(quiz.id, quiz.name, y, buttonWidth, buttonHeight);
    });

    // Sound Introductions Section
    const introSectionY = startY + quizzes.length * (buttonHeight + spacing) + 40;
    this.add.text(this.scale.width / 2, introSectionY, 'Select a letter or letter team', {
      fontFamily: '"Segoe UI", "Arial", "Helvetica Neue", sans-serif',
      fontSize: '32px',
      color: '#222',
      fontStyle: 'bold',
      stroke: '#fff',
      strokeThickness: 1.5,
      shadow: {
        offsetX: 0,
        offsetY: 2,
        color: '#bbb',
        blur: 3,
        fill: true
      }
    }).setOrigin(0.5, 0);

    const introButtonWidth = 140;
    const introButtonHeight = 36;
    const introSpacing = 10;
    soundIntroductions.forEach((intro: SoundIntroduction, i: number) => {
      const y = introSectionY + 40 + i * (introButtonHeight + introSpacing);
      this.createSoundIntroButton(intro, y, introButtonWidth, introButtonHeight);
    });

    // Crow Demo Button (small square, top right)
    this.load.once('complete', () => {
      const crowBtnSize = 48;
      const crowBtnX = this.scale.width - crowBtnSize - 16;
      const crowBtnY = 16 + crowBtnSize / 2;
      const crowBtn = this.add.sprite(crowBtnX, crowBtnY, 'crow', 0)
        .setOrigin(0.5)
        .setDisplaySize(crowBtnSize, crowBtnSize)
        .setInteractive();
      crowBtn.on('pointerdown', () => {
        this.scene.start('CrowDemoScene');
      });
      crowBtn.setDepth(10);
    });
    if (!this.textures.exists('crow')) {
      this.load.spritesheet('crow', 'public/crow_sprite.png', { frameWidth: 200, frameHeight: 200 });
      this.load.start();
    } else {
      // If already loaded, add immediately
      const crowBtnSize = 48;
      const crowBtnX = this.scale.width - crowBtnSize - 16;
      const crowBtnY = 16 + crowBtnSize / 2;
      const crowBtn = this.add.sprite(crowBtnX, crowBtnY, 'crow', 0)
        .setOrigin(0.5)
        .setDisplaySize(crowBtnSize, crowBtnSize)
        .setInteractive();
      crowBtn.on('pointerdown', () => {
        this.scene.start('CrowDemoScene');
      });
      crowBtn.setDepth(10);
    }
  }

  private createQuizButton(quizId: string, quizName: string, y: number, width: number, height: number, xOverride?: number) {
    const x = xOverride !== undefined ? xOverride : this.scale.width / 2;
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(0x4a90e2, 1);
    bg.lineStyle(2, 0x2c5aa0, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    const text = this.add.text(0, 0, quizName, {
      fontSize: '26px',
      color: '#fff',
      align: 'center',
    }).setOrigin(0.5, 0.5);
    container.add([bg, text]);
    container.setSize(width, height);

    // Completion checkmark (outside the button, to the right)
    if (getQuizCompletion(quizId)) {
      const check = this.add.text(x + width / 2 + 56, y, '✔', {
        fontSize: '64px',
        color: '#27ae60', // success green
        fontStyle: '', // not bold
      }).setOrigin(0.5, 0.5);
      check.setDepth(2);
    }

    // Hit area
    const hit = this.add.rectangle(-width / 2, -height / 2, width, height, 0x000000, 0);
    hit.setOrigin(0, 0);
    hit.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    container.add(hit);
    hit.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x357abd, 1);
      bg.lineStyle(2, 0x2c5aa0, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
      this.input.setDefaultCursor('pointer');
    });
    hit.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x4a90e2, 1);
      bg.lineStyle(2, 0x2c5aa0, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
      this.input.setDefaultCursor('default');
    });
    hit.on('pointerdown', () => {
      this.scene.start('Quiz', { quizId });
    });
  }
  private createSoundIntroButton(intro: SoundIntroduction, y: number, width: number, height: number) {
    const x = this.scale.width / 2;
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(0xf5a623, 1);
    bg.lineStyle(2, 0xb9770e, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    const text = this.add.text(0, 0, intro.displayName, {
      fontSize: '24px',
      color: '#fff',
      align: 'center',
    }).setOrigin(0.5, 0.5);
    container.add([bg, text]);
    container.setSize(width, height);

    const hit = this.add.rectangle(-width / 2, -height / 2, width, height, 0x000000, 0);
    hit.setOrigin(0, 0);
    hit.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    container.add(hit);
    hit.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0xf7b94e, 1);
      bg.lineStyle(2, 0xb9770e, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
      this.input.setDefaultCursor('pointer');
    });
    hit.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0xf5a623, 1);
      bg.lineStyle(2, 0xb9770e, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
      this.input.setDefaultCursor('default');
    });
    hit.on('pointerdown', () => {
      this.scene.start('SoundIntroductionScene', { intro });
    });
  }
}
