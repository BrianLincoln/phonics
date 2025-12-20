import Phaser from 'phaser';
import { createButton } from '../helpers/createButton';
import { quizzes } from '../data/quizzes';


export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
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
        if (this.sound) this.sound.stopAll();
        this.scene.start('CrowDemoScene');
      });
      crowBtn.setDepth(10);
    });
    if (!this.textures.exists('crow')) {
      this.load.spritesheet('crow', '/crow_sprite.png', { frameWidth: 200, frameHeight: 200 });
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
        if (this.sound) this.sound.stopAll();
        this.scene.start('CrowDemoScene');
      });
      crowBtn.setDepth(10);
    }
    this.cameras.main.setBackgroundColor('#f0f4fa');

    // Large centered Play button with triangle icon
    const playBtnSize = 180;
    const playBtnY = this.scale.height / 2 - playBtnSize / 2;
    const playBtn = this.add.graphics();
    playBtn.fillStyle(0x4a90e2, 1);
    playBtn.lineStyle(6, 0x2c5aa0, 1);
    playBtn.fillCircle(this.scale.width / 2, playBtnY + playBtnSize / 2, playBtnSize / 2);
    playBtn.strokeCircle(this.scale.width / 2, playBtnY + playBtnSize / 2, playBtnSize / 2);
    // Triangle play symbol
    const triangleSize = 70;
    const triangleX = this.scale.width / 2 - triangleSize / 2 + 18;
    const triangleY = playBtnY + playBtnSize / 2 - triangleSize / 2;
    playBtn.fillStyle(0xffffff, 1);
    playBtn.beginPath();
    playBtn.moveTo(triangleX, triangleY);
    playBtn.lineTo(triangleX, triangleY + triangleSize);
    playBtn.lineTo(triangleX + triangleSize, triangleY + triangleSize / 2);
    playBtn.closePath();
    playBtn.fillPath();

    // Make play button interactive
    const playHit = this.add.zone(this.scale.width / 2, playBtnY + playBtnSize / 2, playBtnSize, playBtnSize);
    playHit.setOrigin(0.5);
    playHit.setInteractive();
    playHit.on('pointerover', () => playBtn.setAlpha(0.85));
    playHit.on('pointerout', () => playBtn.setAlpha(1));
    playHit.on('pointerdown', () => {
      if (this.sound) this.sound.stopAll();
      // Pick a quiz at random
      const targetQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
      if (targetQuiz) {
        this.scene.start('Quiz', { quizId: targetQuiz.id });
      }
    });

    // Quiz Index button using createButton
    const quizIndexBtnY = this.scale.height - 100;
    const quizIndexBtn = createButton({
      scene: this,
      x: this.scale.width / 2,
      y: quizIndexBtnY,
      width: 260,
      height: 64,
      label: 'Show All Quizzes',
      fontSize: 22,
      bgColor: 0xf4f4f4,
      borderColor: 0xd0d0d0,
      textColor: '#666',
      onClick: () => this.scene.start('QuizIndex'),
    });
    this.add.existing(quizIndexBtn.container);

    // Phonics Progress button using createButton
    const progressBtnY = quizIndexBtnY - 80;
    const progressBtn = createButton({
      scene: this,
      x: this.scale.width / 2,
      y: progressBtnY,
      width: 260,
      height: 64,
      label: 'Phonics Progress',
      fontSize: 22,
      bgColor: 0xf4f4f4,
      borderColor: 0xd0d0d0,
      textColor: '#666',
      onClick: () => this.scene.start('PhonicsProgress'),
    });
    this.add.existing(progressBtn.container);
  }

  shutdown() {
    if (this.sound) this.sound.stopAll();
  }
}
