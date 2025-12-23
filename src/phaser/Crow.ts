import Phaser from 'phaser';

export interface CrowConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  initialFacing?: 'left' | 'right';
}

export class Crow extends Phaser.GameObjects.Sprite {
  private facing: 'left' | 'right';

  constructor({
    scene,
    x,
    y,
    initialFacing = 'left',
  }: CrowConfig) {
    super(scene, x, y, 'crow', 0);

    this.facing = initialFacing;

    scene.add.existing(this);

    // Stable origin — do NOT change this per direction
    this.setOrigin(0.5, 1);

    // Apply initial facing
    this.applyFacing();
  }

  private applyFacing() {
    // Assumes sprite art faces left by default
    this.setFlipX(this.facing === 'right');
  }

  setFacing(direction: 'left' | 'right') {
    if (this.facing === direction) return;

    this.facing = direction;
    this.applyFacing();
  }

  setIdle() {
    this.setFrame(0);
    this.applyFacing();
  }

  setTalking() {
    this.setFrame(4);
    this.applyFacing();
  }
}
