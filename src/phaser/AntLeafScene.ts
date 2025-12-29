/**
 * Generates a 'leaf' texture using Phaser.GameObjects.Graphics.
 * The texture is 64x64, filled green, with a pointed top and optional center vein.
 * @param scene The Phaser.Scene to generate the texture in.
 */
export function createLeafTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists('leaf')) return;

  const g = scene.add.graphics();

  g.fillStyle(0x4f9a3d, 1);
  g.lineStyle(1.5, 0x2f5f2a, 0.8);

  const path = new Phaser.Curves.Path(32, 2);

  // right side (sharper tip, wider lower body)
  path.quadraticBezierTo(56, 14, 50, 34);
  path.quadraticBezierTo(44, 54, 32, 62);

  // left side (slightly different for asymmetry)
  path.quadraticBezierTo(18, 54, 14, 36);
  path.quadraticBezierTo(8, 16, 32, 2);

  path.closePath();

  path.draw(g);
  g.fillPath();
  g.strokePath();

  // vein (slightly curved, not straight)
  g.lineStyle(1, 0x2f5f2a, 0.6);
  const vein = new Phaser.Curves.Path(32, 6);
  vein.quadraticBezierTo(30, 34, 32, 58);
  vein.draw(g);

  g.generateTexture('leaf', 64, 64);
  g.destroy();
}

// Example usage (inside a Phaser.Scene):
// createLeafTexture(this);
// this.add.image(x, y, 'leaf');
import Phaser from 'phaser';

export class AntLeafScene extends Phaser.Scene {
  marchingAnts: Phaser.GameObjects.Container[] = [];
  antLeafGroups: Phaser.GameObjects.Container[] = [];
  frameWidth = 100;
  antSpacing = 100;
  antStartX = this.frameWidth - this.antSpacing; // start just off left edge
  antEndX = this.antSpacing
  antSpeed = 60;

  constructor() {
    super('AntLeafScene');
  }

  preload() {
    this.load.spritesheet('ant', '/src/assets/ant_sprite.png', {
      frameWidth: this.frameWidth,
      frameHeight: 100,
    });
    // Load the leaf image (single 300x300 PNG)
    this.load.image('leaf', '/src/assets/leaf.png');
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.cameras.main.setBackgroundColor('#e0f7fa'); // light blue, different from MainScene
    this.cameras.main.setRoundPixels(true);

    // --- Ants Carrying Leaves with Letters ---
    // Example options for demo; replace with quiz data as needed
    const options = ['c', 'a', 't', 'm'];
    this.antLeafGroups = [];

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
      // Create a container for ant, leaf, and letter
      const group = this.add.container();
      // Ant sprite
      const ant = this.add.sprite(0, 0, 'ant', 0);
      ant.setScale(0.7);
      ant.setDepth(2);
      ant.play('ant-walk');
      // Leaf image (positioned above ant, so ant appears to carry it)
      const leaf = this.add.image(0, -40, 'leaf');
      leaf.setDisplaySize(75, 75);
      leaf.setDepth(1);
      // Letter text (centered on leaf)
      const letter = this.add.text(0, -40, options[i % options.length] || '?', {
        fontFamily: 'Arial',
        fontSize: '40px',
        color: '#fff',
        fontStyle: 'bold',
        stroke: '#222',
        strokeThickness: 3,
        align: 'center',
      }).setOrigin(0.5);
      letter.setDepth(3);
      // Add to container
      group.add([leaf, ant, letter]);
      // Position container
      group.x = this.antStartX - i * this.antSpacing;
      group.y = antY;
      this.add.existing(group);
      this.marchingAnts.push(group);
      this.antLeafGroups.push(group);
    }
  }

  update(time: number, delta: number) {
    if (this.marchingAnts && this.marchingAnts.length > 0) {
      // Move all ant+leaf+letter containers
      for (let i = 0; i < this.marchingAnts.length; i++) {
        this.marchingAnts[i].x += (this.antSpeed * delta) / 1000;
      }
      // Reset containers that go off screen to just before the leftmost, preserving spacing
      for (let i = 0; i < this.marchingAnts.length; i++) {
        if (this.marchingAnts[i].x > this.antEndX) {
          // Find leftmost
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
