
import Phaser from 'phaser';

import { quizzes } from '../data/quizzes';
import { units } from '../data/units';

import { createButton } from '../helpers/createButton';

export class QuizIndexScene extends Phaser.Scene {
  handleResize() {
    // Example: reposition title text if it exists
    const title = this.children.getByName && this.children.getByName('quizTitle');
    if (title && 'x' in title) {
      (title as Phaser.GameObjects.Text).x = this.scale.width / 2;
    }
  }
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
    }).setOrigin(0.5, 0).setName('quizTitle');

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
      let unitName = quiz.unit ? (units.find(u => u.id === quiz.unit)?.name || quiz.unit) : quiz.id;
      const btn = createButton({
        scene: this,
        x,
        y,
        width: buttonSize,
        height: buttonSize,
        label: unitName,
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
  }

  shutdown() {
    if (this.sound) this.sound.stopAll();
  }

}
