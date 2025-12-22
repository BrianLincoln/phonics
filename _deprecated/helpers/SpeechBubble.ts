import Phaser from 'phaser';

export interface SpeechBubbleConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text: string;
  duration?: number;
  onComplete?: () => void;
}

export class SpeechBubble extends Phaser.GameObjects.Container {
  constructor({ scene, x, y, width = 260, height = 80, text, duration = 2000, onComplete }: SpeechBubbleConfig) {
    super(scene, x, y);
    scene.add.existing(this);
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.lineStyle(2, 0x222222, 1);
    graphics.beginPath();
    graphics.moveTo(18, 0);
    graphics.lineTo(width - 18, 0);
    graphics.arc(width - 18, 18, 18, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(360), false);
    graphics.lineTo(width, height - 18);
    graphics.arc(width - 18, height - 18, 18, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(90), false);
    const tailBaseX = 36;
    graphics.lineTo(tailBaseX + 24, height);
    graphics.lineTo(tailBaseX + 12, height + 24);
    graphics.lineTo(tailBaseX, height);
    graphics.lineTo(18, height);
    graphics.arc(18, height - 18, 18, Phaser.Math.DegToRad(90), Phaser.Math.DegToRad(180), false);
    graphics.lineTo(0, 18);
    graphics.arc(18, 18, 18, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(270), false);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    this.add(graphics);
    const txt = scene.add.text(width / 2, height / 2, text, {
      fontSize: '24px',
      color: '#222',
      wordWrap: { width: width - 24 },
      align: 'center',
    }).setOrigin(0.5);
    this.add(txt);
    scene.time.delayedCall(duration, () => {
      this.destroy();
      if (onComplete) onComplete();
    });
  }
}
