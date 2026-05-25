import Phaser from 'phaser';
import { Crow } from './Crow';
import { CrowController } from './CrowController';

export interface MultipleChoiceSceneData {
  unitName: string;
  questionIndex: number;
}

const CLOUD_CONFIGS = [
  { xFrac: 0.12, yFrac: 0.08, scale: 0.85, speed: 18 },
  { xFrac: 0.48, yFrac: 0.13, scale: 1.1,  speed: 12 },
  { xFrac: 0.82, yFrac: 0.06, scale: 0.72, speed: 22 },
];

export class MultipleChoiceScene extends Phaser.Scene {
  static readonly CROW_TAKE_LETTER_QUESTION = 2;

  private sceneData!: MultipleChoiceSceneData;
  private unitName = '';

  questionCount = 0;
  crowActive = true;
  crowTakingLetter = false;

  crow?: Crow;
  crowController?: CrowController;
  letterText?: Phaser.GameObjects.Text;

  _afterCrowReEnter?: () => void;
  private reEnterTimeout?: ReturnType<typeof setTimeout>;

  private clouds: Phaser.GameObjects.Image[] = [];
  private cloudSpeeds: number[] = [];

  private sky?: Phaser.GameObjects.Graphics;
  private hillsImage?: Phaser.GameObjects.Image;
  private ground?: Phaser.GameObjects.Graphics;
  private sun?: Phaser.GameObjects.Graphics;

  private resizeTimer?: ReturnType<typeof setTimeout>;
  private boundResizeHandler?: () => void;

  constructor() {
    super('MultipleChoiceScene');
  }

  preload() {
    this.load.spritesheet('crow', '/src/assets/crow_sprite.png', {
      frameWidth: 200,
      frameHeight: 200,
    });
  }

  // Receive data from React via game.scene.start(sceneKey, data)
  init(data: MultipleChoiceSceneData) {
    this.sceneData = data;
    this.unitName = data.unitName;
  }

  create() {
    this.buildEnvironment();
    this.buildCrow();
    this.buildSign();

    this.applySceneData();
  }

  // Called automatically when scene is stopped/destroyed
  shutdown() {
    if (this.reEnterTimeout) {
      clearTimeout(this.reEnterTimeout);
      this.reEnterTimeout = undefined;
    }
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = undefined;
    }
    if (this.boundResizeHandler) {
      this.scale.off('resize', this.boundResizeHandler);
      this.boundResizeHandler = undefined;
    }
  }

  private applySceneData() {
    if (!this.sceneData || !this.letterText) return;
    this.letterText.setText(
      this.sceneData.unitName
    );
  }

  private buildEnvironment() {
    this.cameras.main.setRoundPixels(true);

    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.redrawEnvironment(w, h);
    this.spawnClouds(w, h);

    this.boundResizeHandler = () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        const nw = this.cameras.main.width;
        const nh = this.cameras.main.height;
        this.redrawEnvironment(nw, nh);
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

    // --- Hills ---
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

    // Depth ordering: background below clouds (1), sign (6), crow (9)
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
    if (this.crow && this.crowController) {
      const h = this.cameras.main.height;
      this.crow.updateShadow(this.crowController.groundY, w * 0.92, h * 0.12);
    }
  }

  private buildSign() {
    const signWidth = 340;
    const signHeight = 200;
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY + 10;

    const sign = this.add.graphics();
    sign.setDepth(6);
    sign.fillStyle(0xf7e6b2, 1);
    sign.fillRoundedRect(cx - signWidth / 2, cy - signHeight / 2, signWidth, signHeight, 32);

    sign.lineStyle(6, 0x9e7b4f, 1);
    sign.strokeRoundedRect(cx - signWidth / 2, cy - signHeight / 2, signWidth, signHeight, 32);

    sign.fillStyle(0x9e7b4f, 1);
    sign.fillRect(cx - signWidth / 2 + 30, cy + signHeight / 2 - 10, 18, 60);
    sign.fillRect(cx + signWidth / 2 - 48, cy + signHeight / 2 - 10, 18, 60);

    this.letterText = this.add
      .text(cx, cy, '', {
        font: '160px Arial',
        color: '#1e1e2f',
        align: 'center',
        wordWrap: { width: this.cameras.main.width - 40 },
      })
      .setOrigin(0.5)
      .setDepth(10);
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
    this.questionCount++;

    const isCrowTakeLetterQuestion =
      this.questionCount === MultipleChoiceScene.CROW_TAKE_LETTER_QUESTION && this.crowActive;

    if (isCrowTakeLetterQuestion) {
      this.crowActive = false;
      this.crowTakeLetter(onDone);
    } else if (isCorrect) {
      this.crowController?.hop(onDone);
    } else {
      this.crowController?.shake(onDone);
    }
  }

  private crowTakeLetter(onDone?: () => void) {
    if (!this.crow || !this.letterText || !this.crowController) return;

    this.crowTakingLetter = true;

    this.crowController.walkToLeftOfWordAndLook(this.letterText.x, this.letterText.y, () => {
      this.crowController!.walkWordOffRight(this.letterText!, () => {
        this.crowTakingLetter = false;
        onDone?.();
        this._afterCrowReEnter?.();
        this._afterCrowReEnter = undefined;

        this.reEnterTimeout = setTimeout(() => {
          this.crowController?.playReEnterFromRightWithCallback();
        }, 600);
      });
    });
  }

  crowReturnWordAfterQuiz(onDone?: () => void) {
    if (!this.crow || !this.letterText || !this.crowController) {
      onDone?.();
      return;
    }

    const cam = this.cameras.main;
    const targetX = cam.centerX;
    const textY = this.letterText.y;
    const crowY = textY + 80;

    this.crowController.walkOffRightFast(cam.width + 120, crowY, () => {
      this.crowController!.walkWordOnFromRight(this.letterText!, targetX, textY, crowY, () => {
        this.crowController!.hopTo(cam.width - 100, this.crowController!.groundY, () => {
          this.crowController!.startHoppingInPlace();
          onDone?.();
        });
      });
    });
  }
}
