import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  private unitName: string = '';

  constructor() {
    super('MainScene');
  }

  create() {
    // Get unitName from static property (set by PhaserGame)
    this.unitName = (this.constructor as any).unitName || '';
    this.cameras.main.setBackgroundColor('#1e1e2f');
    this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.unitName || 'Phaser Ready',
      {
        font: '48px Arial',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: this.cameras.main.width - 40 },
      }
    ).setOrigin(0.5);
  }
}
