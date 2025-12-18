import Phaser from 'phaser';
import { quizzes } from '../data/quizzes';
import type { Quiz } from '../data/quizzes';
import { getQuizCompletion } from '../helpers/quizProgress';

export class QuizIndexScene extends Phaser.Scene {
  constructor() {
    super('QuizIndex');
  }

  create() {
    this.cameras.main.setBackgroundColor('#f0f4fa');
    this.add.text(this.scale.width / 2, 60, 'Select a Quiz', {
      fontSize: '40px',
      color: '#222',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    const buttonWidth = 340;
    const buttonHeight = 70;
    const spacing = 24;
    const startY = 160;
    quizzes.forEach((quiz: Quiz, i: number) => {
      const y = startY + i * (buttonHeight + spacing);
      this.createQuizButton(quiz.id, quiz.name, y, buttonWidth, buttonHeight);
    });
  }

  private createQuizButton(quizId: string, quizName: string, y: number, width: number, height: number) {
    const x = this.scale.width / 2;
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
}
