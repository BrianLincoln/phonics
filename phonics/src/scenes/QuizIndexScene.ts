import Phaser from 'phaser';
import { quizzes } from '../data/quizzes';
import { getQuizCompletion } from '../helpers/quizProgress';
import { soundIntroductions } from '../config/soundIntroductions';
import type { SoundIntroduction } from '../config/soundIntroductions';
import { createButton } from '../helpers/createButton';

export class QuizIndexScene extends Phaser.Scene {
  constructor() {
    super('QuizIndex');
  }

  create() {
    // Back button (top left) using createButton
    const backBtn = createButton({
      scene: this,
      x: 100,
      y: 80,
      width: 180,
      height: 80,
      label: '⬅ Back',
      onClick: () => {
        if (this.sound) this.sound.stopAll();
        this.scene.start('Menu');
      },
    });
    // Add to display list
    this.add.existing(backBtn.container);
    this.cameras.main.setBackgroundColor('#f0f4fa');

    // Quiz index title
    this.add.text(this.scale.width / 2, 200, 'Select a Quiz', {
      fontFamily: '"Segoe UI", "Arial", "Helvetica Neue", sans-serif',
      fontSize: '44px',
      color: '#1a1a1a',
      fontStyle: 'bold',
      stroke: '#fff',
      strokeThickness: 2,
    }).setOrigin(0.5, 0);

    // Grid layout for quiz buttons
    const gridCols = 10;
    const buttonSize = 80;
    const gridSpacing = 24;
    const gridStartY = 350;
    const gridStartX = (this.scale.width - (gridCols * buttonSize + (gridCols - 1) * gridSpacing)) / 2 + buttonSize / 2;
    quizzes.forEach((quiz, i) => {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      const x = gridStartX + col * (buttonSize + gridSpacing);
      const y = gridStartY + row * (buttonSize + gridSpacing);
      const btn = createButton({
        scene: this,
        x,
        y,
        width: buttonSize,
        height: buttonSize,
        label: quiz.name,
        fontSize: 18,
        bgColor: 0xeeeeee,
        borderColor: 0xcccccc,
        textColor: '#444',
        onClick: () => {
          if (this.sound) this.sound.stopAll();
          this.scene.start('Quiz', { quizId: quiz.id });
        },
      });
      this.add.existing(btn.container);
      // Completion checkmark (small, top right, overflow)
      if (getQuizCompletion(quiz.id)) {
        const check = this.add.text(x + buttonSize / 2, y - buttonSize / 2 + 12, '✔', {
          fontSize: '60px',
          color: '#27ae60',
          fontStyle: '',
        }).setOrigin(0.5, 0.5);
        check.setDepth(2);
      }
    });

    // Sound Introductions Section - match quiz grid style
    const introSectionY = gridStartY + Math.ceil(quizzes.length / gridCols) * (buttonSize + gridSpacing) + 40;
    this.add.text(this.scale.width / 2, introSectionY, 'Select a letter or letter team', {
      fontFamily: '"Segoe UI", "Arial", "Helvetica Neue", sans-serif',
      fontSize: '44px',
      color: '#1a1a1a',
      fontStyle: 'bold',
      stroke: '#fff',
      strokeThickness: 2,
    }).setOrigin(0.5, 0);

    // Grid for sound introduction buttons
    const introGridCols = 10;
    const introButtonSize = 80;
    const introGridSpacing = 24;
    const introGridStartY = introSectionY + 120;
    const introGridStartX = (this.scale.width - (introGridCols * introButtonSize + (introGridCols - 1) * introGridSpacing)) / 2 + introButtonSize / 2;
    soundIntroductions.forEach((intro, i) => {
      const col = i % introGridCols;
      const row = Math.floor(i / introGridCols);
      const x = introGridStartX + col * (introButtonSize + introGridSpacing);
      const y = introGridStartY + row * (introButtonSize + introGridSpacing);
      const btn = createButton({
        scene: this,
        x,
        y,
        width: introButtonSize,
        height: introButtonSize,
        label: intro.displayName,
        fontSize: 18,
        bgColor: 0xeeeeee,
        borderColor: 0xcccccc,
        textColor: '#444',
        onClick: () => {
          if (this.sound) this.sound.stopAll();
          this.scene.start('SoundIntroductionScene', { intro });
        },
      });
      this.add.existing(btn.container);
    });

  }

  shutdown() {
    if (this.sound) this.sound.stopAll();
  }

}
