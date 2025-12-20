// scenes/PhonicsProgressScene.ts
// Scene to display phonics unit progress
import Phaser from 'phaser';
import { getPhonicsProgress } from '../helpers/quizProgress';
import { createButton } from '../helpers/createButton';

export class PhonicsProgressScene extends Phaser.Scene {
  constructor() {
    super('PhonicsProgress');
  }

  create() {
    this.cameras.main.setBackgroundColor('#f0f4fa');
    this.add.text(this.scale.width / 2, 80, 'Phonics Progress', {
      fontFamily: 'Segoe UI, Arial, Helvetica Neue, sans-serif',
      fontSize: '44px',
      color: '#1a1a1a',
      fontStyle: 'bold',
      stroke: '#fff',
      strokeThickness: 2,
    }).setOrigin(0.5, 0);

    const progress = getPhonicsProgress();
    const startY = 160;
    const colX = [120, 260, 400, 600, 800, 1000];
    this.add.text(colX[0], startY, 'Unit', { fontSize: '22px', color: '#333' });
    this.add.text(colX[1], startY, 'Correct', { fontSize: '22px', color: '#333' });
    this.add.text(colX[2], startY, 'Incorrect', { fontSize: '22px', color: '#333' });
    this.add.text(colX[3], startY, 'Recent', { fontSize: '22px', color: '#333' });
    this.add.text(colX[4], startY, 'Total', { fontSize: '22px', color: '#333' });
    this.add.text(colX[5], startY, 'Last Seen', { fontSize: '22px', color: '#333' });

    let i = 0;
    Object.entries(progress.phonicsUnits).forEach(([unit, data]) => {
      const y = startY + 40 + i * 36;
      this.add.text(colX[0], y, unit, { fontSize: '20px', color: '#222' });
      this.add.text(colX[1], y, String(data.correct), { fontSize: '20px', color: '#222' });
      this.add.text(colX[2], y, String(data.incorrect), { fontSize: '20px', color: '#222' });
      this.add.text(colX[3], y, data.recent.map(r => r ? '✔️' : '❌').join(' '), { fontSize: '20px', color: '#222' });
      this.add.text(colX[4], y, String(data.sampleSize), { fontSize: '20px', color: '#222' });
      this.add.text(colX[5], y, data.lastSeen ? new Date(data.lastSeen).toLocaleString() : '-', { fontSize: '20px', color: '#222' });
      i++;
    });

    const backBtn = createButton({
      scene: this,
      x: this.scale.width / 2,
      y: this.scale.height - 80,
      width: 220,
      height: 64,
      label: '⬅ Back to Menu',
      fontSize: 22,
      bgColor: 0xf4f4f4,
      borderColor: 0xd0d0d0,
      textColor: '#666',
      onClick: () => this.scene.start('Menu'),
    });
    this.add.existing(backBtn.container);
  }
}
