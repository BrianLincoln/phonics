import Phaser from 'phaser';

export interface CompanionConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  initialFacing?: 'left' | 'right';
}

export class Companion extends Phaser.GameObjects.Sprite {
  private facing: 'left' | 'right';
  private shadow: Phaser.GameObjects.Ellipse;

  constructor({ scene, x, y, initialFacing = 'left' }: CompanionConfig) {
    super(scene, x, y, 'companion', 0);
    this.facing = initialFacing;
    scene.add.existing(this);
    this.setOrigin(0.5, 1);
    this.applyFacing();

    this.shadow = scene.add.ellipse(x, y, 70, 14, 0x000000, 0.22).setDepth(8);
  }

  setAnimalFrame(n: number) {
    this.setFrame(n);
  }

  /**
   * Projects a ray from the sun through the companion onto the ground plane,
   * so the shadow slides away from the sun as the companion rises.
   */
  updateShadow(groundY: number, sunX: number, sunY: number) {
    if (this.y >= groundY) {
      this.shadow.x = this.x;
      this.shadow.y = this.y;
      this.shadow.setScale(1);
      this.shadow.setAlpha(this.visible ? 0.22 : 0);
      return;
    }

    const t = (groundY - sunY) / (this.y - sunY);
    this.shadow.x = sunX + (this.x - sunX) * t;
    this.shadow.y = groundY;

    const lift = Math.max(0, groundY - this.y);
    const liftT = Math.min(lift / 28, 1);
    this.shadow.setScale(1 - liftT * 0.5);
    this.shadow.setAlpha(this.visible ? 0.25 - liftT * 0.18 : 0);
  }

  setVisible(value: boolean): this {
    super.setVisible(value);
    this.shadow?.setVisible(value);
    return this;
  }

  private applyFacing() {
    this.setFlipX(this.facing === 'right');
  }

  setFacing(direction: 'left' | 'right') {
    if (this.facing === direction) return;
    this.facing = direction;
    this.applyFacing();
  }

  setIdle() {
    this.setAnimalFrame(0);
    this.applyFacing();
  }

  setTalking() {
    this.setAnimalFrame(4);
    this.applyFacing();
  }
}
