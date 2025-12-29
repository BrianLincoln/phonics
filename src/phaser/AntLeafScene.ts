import Phaser from 'phaser';

export class AntLeafScene extends Phaser.Scene {
  marchingAnts: Phaser.GameObjects.Sprite[] = [];
  frameWidth = 100;
  antSpacing = 100;
  antStartX = this.frameWidth - this.antSpacing; // start just off left edge
  antEndX = this.antSpacing
  antSpeed = 200;

  constructor() {
    super('AntLeafScene');
  }

  preload() {
    this.load.spritesheet('ant', '/src/assets/ant_sprite.png', {
      frameWidth: this.frameWidth,
      frameHeight: 100,
    });
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.cameras.main.setBackgroundColor('#e0f7fa'); // light blue, different from MainScene
    this.cameras.main.setRoundPixels(true);

    // --- Marching Ants ---
    const antCount = 8;
    this.antEndX = w + this.antSpacing;
    const antY = h * 0.7; // slightly lower than before
    if (!this.anims.exists('ant-walk')) {
      this.anims.create({
        key: 'ant-walk',
        frames: this.anims.generateFrameNumbers('ant', { start: 0, end: 2 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    this.marchingAnts = [];
    for (let i = 0; i < antCount; i++) {
      const ant = this.add.sprite(
        this.antStartX - i * this.antSpacing,
        antY,
        'ant',
        0
      );
      ant.setScale(0.7);
      ant.setDepth(2);
      ant.play('ant-walk');
      this.marchingAnts.push(ant);
    }
  }

  update(time: number, delta: number) {
    if (this.marchingAnts && this.marchingAnts.length > 0) {
      // Move all ants
      for (let i = 0; i < this.marchingAnts.length; i++) {
        this.marchingAnts[i].x += (this.antSpeed * delta) / 1000;
      }
      // Reset ants that go off screen to just before the leftmost, preserving spacing
      for (let i = 0; i < this.marchingAnts.length; i++) {
        if (this.marchingAnts[i].x > this.antEndX) {
          // Find leftmost ant
          let leftmost = this.marchingAnts[0];
          for (let j = 1; j < this.marchingAnts.length; j++) {
            if (this.marchingAnts[j].x < leftmost.x) leftmost = this.marchingAnts[j];
          }
          this.marchingAnts[i].x = leftmost.x - this.antSpacing;
        }
      }
    }
  }
}
