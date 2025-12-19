import Phaser from 'phaser';

export interface ShinyConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  onCollect: () => void;
}

export class Shiny extends Phaser.GameObjects.Sprite {
  private animTimer: number = 0;
  constructor({ scene, x, y, onCollect }: ShinyConfig) {
    super(scene, x, y, 'shiny', 0);
    scene.add.existing(this);
    this.setOrigin(0.5, 1);
    this.setInteractive({ useHandCursor: true });
    this.on('pointerover', () => scene.input.setDefaultCursor('pointer'));
    this.on('pointerout', () => scene.input.setDefaultCursor('default'));
    this.on('pointerdown', () => {
      onCollect();
      this.setVisible(false);
    });
  }
  animate(delta: number) {
    this.animTimer += delta;
    if (this.animTimer > 80) {
      // Use getFrame/setFrame, avoid shadowing Sprite.frame
      const current = this.frame.name ? parseInt(this.frame.name as string, 10) : (this.frame as any)?.index || 0;
      const next = (current + 1) % 4;
      this.setFrame(next);
      this.animTimer = 0;
    }
  }
}
