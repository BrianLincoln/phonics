import Phaser from 'phaser';

export interface CrowConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  flipOffset?: number;
}

export class Crow extends Phaser.GameObjects.Sprite {
  constructor({ scene, x, y }: CrowConfig) {
    super(scene, x, y, 'crow', 0);
    scene.add.existing(this);
    this.setOrigin(0.5, 1);
  }
  setIdle() {
    this.setFrame(0);
  }
  setTalking() {
    this.setFrame(4);
  }
}
