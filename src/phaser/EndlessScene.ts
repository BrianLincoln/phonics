import Phaser from 'phaser';
import { Crow } from './Crow';
import { CrowController } from './CrowController';

const CLOUD_CONFIGS = [
  { xFrac: 0.12, yFrac: 0.08, scale: 0.85, speed: 18 },
  { xFrac: 0.48, yFrac: 0.13, scale: 1.1,  speed: 12 },
  { xFrac: 0.82, yFrac: 0.06, scale: 0.72, speed: 22 },
];

export class EndlessScene extends Phaser.Scene {
  private crow?: Crow;
  private crowController?: CrowController;
  private clouds: Phaser.GameObjects.Image[] = [];
  private cloudSpeeds: number[] = [];

  private sky?: Phaser.GameObjects.Graphics;
  private hillsImage?: Phaser.GameObjects.Image;
  private ground?: Phaser.GameObjects.Graphics;
  private sun?: Phaser.GameObjects.Graphics;

  private resizeTimer?: ReturnType<typeof setTimeout>;
  private boundResizeHandler?: () => void;

  constructor() {
    super('EndlessScene');
  }

  preload() {
    this.load.spritesheet('crow', '/src/assets/crow_sprite.png', {
      frameWidth: 200,
      frameHeight: 200,
    });
  }

  create() {
    this.buildEnvironment();
    this.buildCrow();
  }

  shutdown() {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = undefined;
    }
    if (this.boundResizeHandler) {
      this.scale.off('resize', this.boundResizeHandler);
      this.boundResizeHandler = undefined;
    }
  }

  private buildEnvironment() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.cameras.main.setRoundPixels(true);

    this.redrawEnvironment(w, h);
    this.spawnClouds(w, h);

    this.boundResizeHandler = () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        const nw = this.cameras.main.width;
        const nh = this.cameras.main.height;
        this.redrawEnvironment(nw, nh);
        // Update cloud y-positions proportionally; leave x as-is (they're drifting)
        CLOUD_CONFIGS.forEach(({ yFrac }, i) => {
          if (this.clouds[i]) this.clouds[i].y = nh * yFrac;
        });
      }, 250);
    };
    this.scale.on('resize', this.boundResizeHandler);
  }

  private redrawEnvironment(w: number, h: number) {
    const groundY = h * 0.62;
    const sunX = w * 0.92;
    const sunY = h * 0.12;

    // --- Sky ---
    if (this.sky) { this.sky.destroy(); }
    this.sky = this.add.graphics();
    this.sky.fillGradientStyle(0x3a8fd4, 0x3a8fd4, 0xb8dff0, 0xb8dff0, 1);
    this.sky.fillRect(0, 0, w, h);

    // --- Hills (canvas texture must be removed and recreated on resize) ---
    if (this.hillsImage) { this.hillsImage.destroy(); this.hillsImage = undefined; }
    if (this.textures.exists('hills')) { this.textures.remove('hills'); }

    const ct = this.textures.createCanvas('hills', w, h);
    const ctx = ct.getContext();
    const defs = [
      { cx: w * 0.20, rx: w * 0.275, ry: h * 0.09 },
      { cx: w * 0.72, rx: w * 0.25,  ry: h * 0.075 },
      { cx: w * 0.95, rx: w * 0.175, ry: h * 0.06 },
    ];
    for (const { cx, rx, ry } of defs) {
      const dx = sunX - cx;
      const dy = sunY - groundY;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / len;
      const ny = dy / len;
      const r = Math.max(rx, ry);
      const grad = ctx.createLinearGradient(
        cx + nx * r, groundY + ny * r,
        cx - nx * r * 0.6, groundY - ny * r * 0.6
      );
      grad.addColorStop(0, '#92c9b8');
      grad.addColorStop(1, '#4a8872');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, groundY, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ct.refresh();
    this.hillsImage = this.add.image(0, 0, 'hills').setOrigin(0, 0);

    // --- Ground ---
    if (this.ground) { this.ground.destroy(); }
    this.ground = this.add.graphics();
    this.ground.fillGradientStyle(0x5aad72, 0x5aad72, 0x4ea832, 0x4ea832, 1);
    this.ground.fillRect(0, groundY, w, h - groundY);

    // --- Sun ---
    if (this.sun) { this.sun.destroy(); }
    this.sun = this.add.graphics();
    this.sun.fillStyle(0xffe066, 1);
    this.sun.fillCircle(sunX, sunY, w * 0.055);

    // Restore depth ordering (clouds are depth 1, crow is depth 9)
    this.sky.setDepth(0);
    this.hillsImage.setDepth(0);
    this.ground.setDepth(0);
    this.sun.setDepth(0);
  }

  private spawnClouds(w: number, h: number) {
    if (!this.textures.exists('cloud')) {
      const gfx = this.make.graphics({ x: 0, y: 0, add: false });
      gfx.fillStyle(0xffffff, 1);
      gfx.fillCircle(40,  55, 28);
      gfx.fillCircle(75,  40, 38);
      gfx.fillCircle(120, 34, 44);
      gfx.fillCircle(165, 40, 36);
      gfx.fillCircle(195, 52, 26);
      gfx.fillCircle(105, 58, 36);
      gfx.generateTexture('cloud', 220, 90);
      gfx.destroy();
    }

    this.clouds = CLOUD_CONFIGS.map(({ xFrac, yFrac, scale }) =>
      this.add.image(w * xFrac, h * yFrac, 'cloud').setScale(scale).setAlpha(0.88).setDepth(1)
    );
    this.cloudSpeeds = CLOUD_CONFIGS.map(c => c.speed);
  }

  update(_time: number, delta: number) {
    const w = this.cameras.main.width;
    this.clouds.forEach((cloud, i) => {
      cloud.x -= this.cloudSpeeds[i] * (delta / 1000);
      if (cloud.x < -130) cloud.x = w + 130;
    });
  }

  private buildCrow() {
    const cam = this.cameras.main;
    this.crow = new Crow({
      scene: this,
      x: cam.centerX - 100,
      y: cam.height * 0.78,
    });
    this.crow.setScale(0.5);
    this.crow.setDepth(9);
    this.crow.setIdle();

    this.crowController = new CrowController(this, this.crow);
    this.crowController.playIntroWalkIn();
  }

  onQuestionAnswered(isCorrect: boolean, onDone?: () => void) {
    console.log('[EndlessScene] onQuestionAnswered', { isCorrect, hasCrowController: !!this.crowController, crowVisible: this.crow?.visible });
    if (isCorrect) {
      this.crowController?.hop(onDone);
    } else {
      this.crowController?.shake(onDone);
    }
  }
}
