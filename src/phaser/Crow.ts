import Phaser from 'phaser';

export interface CrowConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  initialFacing?: 'left' | 'right';
}

export class Crow extends Phaser.GameObjects.Sprite {
  private facing: 'left' | 'right';
  private shadow: Phaser.GameObjects.Ellipse;

  constructor({ scene, x, y, initialFacing = 'left' }: CrowConfig) {
    super(scene, x, y, 'crow', 0);
    this.facing = initialFacing;
    scene.add.existing(this);
    this.setOrigin(0.5, 1);
    this.applyFacing();

    this.shadow = scene.add.ellipse(x, y, 70, 14, 0x000000, 0.22).setDepth(8);
  }

  /**
   * Call every frame. Projects a ray from the sun through the crow onto the ground plane,
   * so the shadow slides away from the sun as the crow rises.
   */
  updateShadow(groundY: number, sunX: number, sunY: number) {
    // When crow is at or below the ground plane, shadow sits directly under it
    if (this.y >= groundY) {
      this.shadow.x = this.x;
      this.shadow.y = this.y;
      this.shadow.setScale(1);
      this.shadow.setAlpha(this.visible ? 0.22 : 0);
      return;
    }

    // Ray: sun → crow, extended until it hits y = groundY
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
    this.setFrame(0);
    this.applyFacing();
  }

  setTalking() {
    this.setFrame(4);
    this.applyFacing();
  }
}
