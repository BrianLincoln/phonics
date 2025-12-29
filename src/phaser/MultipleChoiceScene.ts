import Phaser from 'phaser';
import { Crow } from './Crow';
import { CrowController } from './CrowController';

const CROW_WALK_SPEED = 400;
const CROW_FLIP_OFFSET = 50;

export class MultipleChoiceScene extends Phaser.Scene {
  /**
   * Used by React to advance the question after crow re-enters (set as a function ref)
   */
  _afterCrowReEnter?: () => void;
  static readonly CROW_TAKE_LETTER_QUESTION = 2;
  private unitName: string = '';

  constructor() {
    super('MultipleChoiceScene');
  }

  preload() {
    // Use the public path for Phaser asset loading
    this.load.spritesheet('crow', '/src/assets/crow_sprite.png', {
      frameWidth: 200, // match deprecated working version
      frameHeight: 200,
    });
  }



  crow?: Crow;
  crowController?: CrowController;
  letterText?: Phaser.GameObjects.Text;
  questionCount: number = 0;
  crowActive: boolean = true;
  crowTarget?: { x: number; y: number };
  crowIsWalking: boolean = false;
  crowWalkAnimTimer: number = 0;
  crowWalkFrame: number = 1;
  crowLastDirection: 'left' | 'right' = 'left';

  create(data?: { unitName?: string; question?: any }) {
    // --- Simple landscape background ---
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // --- Single complex-shape moving clouds ---
    function drawCloud(g: Phaser.GameObjects.Graphics, scale: number = 1) {
      g.save();
      g.lineStyle(2, 0xe0e0e0, 0.5);
      g.fillStyle(0xffffff, 1);
      // Draw a horizontally stretched oval with sine bumps
      const bumps = 12;
      const width = 80 * scale;
      const height = 40 * scale;
      const cx = 0, cy = 0;
      const rX = width * 0.5;
      const rY = height * 0.5;
      const bumpAmp = 0.18 * height;
      const bumpFreq = 3;
      const points = [];
      // Top half (left to right)
      for (let i = 0; i <= bumps; i++) {
        const t = i / bumps;
        const angle = Math.PI * (1 - t); // pi to 0
        const x = cx + Math.cos(angle) * rX;
        const y = cy - Math.sin(angle) * rY - Math.sin(t * Math.PI) * bumpAmp * (0.7 + 0.3 * Math.sin(bumpFreq * Math.PI * t));
        points.push({ x, y });
      }
      // Bottom half (right to left)
      for (let i = bumps; i >= 0; i--) {
        const t = i / bumps;
        const angle = Math.PI * (1 - t); // pi to 0
        const x = cx + Math.cos(angle) * rX;
        const y = cy + Math.sin(angle) * rY + Math.sin(t * Math.PI) * bumpAmp * (0.7 + 0.3 * Math.sin(bumpFreq * Math.PI * t));
        points.push({ x, y });
      }
      // Draw path
      g.beginPath();
      g.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        g.lineTo(points[i].x, points[i].y);
      }
      g.closePath();
      g.fillPath();
      g.strokePath();
      g.restore();
    }

    // --- Cloud layers: back, middle, front ---
    const cloudLayers = [
      {
        count: 1,
        scale: 3.0, // at least 2x previous largest
        y: 70,
        speed: 60, // slowest
        alpha: 0.5,
        depth: 2,
        xSpread: [w * 0.15, w * 0.85],
      },
      {
        count: 2,
        scale: 1.2,
        y: 110,
        speed: 40, // medium
        alpha: 0.7,
        depth: 3,
        xSpread: [w * 0.2, w * 0.8],
      },
      {
        count: 2,
        scale: 0.7,
        y: 150,
        speed: 28, // fastest (but still slow)
        alpha: 0.85,
        depth: 4,
        xSpread: [w * 0.1, w * 0.9],
      },
    ];
    cloudLayers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        const cloud = this.add.graphics();
        drawCloud(cloud, layer.scale * (0.95 + 0.1 * Math.random()));
        // Initial placement: random in spread, but allow some to start off-screen left
        let x;
        if (Math.random() < 0.5) {
          // Start off-screen left
          x = -180 - Math.random() * 120;
        } else {
          // Start in visible spread
          x = layer.xSpread[0] + Math.random() * (layer.xSpread[1] - layer.xSpread[0]);
        }
        const yRange = 16;
        let y = layer.y + Phaser.Math.Between(-yRange / 2, yRange / 2);
        cloud.x = x;
        cloud.y = y;
        cloud.alpha = layer.alpha * (0.9 + 0.2 * Math.random());
        cloud.setDepth(layer.depth);
        // Animate cloud drifting to the right, then reset to left (always off-screen)
        this.tweens.add({
          targets: cloud,
          x: w + 120,
          duration: 1000 * layer.speed * (0.95 + 0.1 * Math.random()),
          ease: 'Linear',
          repeat: -1,
          delay: Math.random() * 2000,
          onRepeat: () => {
            cloud.x = -180 - Math.random() * 120;
            // Pick a new y value for each re-entry
            cloud.y = layer.y + Phaser.Math.Between(-yRange / 2, yRange / 2);
          },
        });
      }
    });
    // Set unitName from data, fallback to static if needed
    this.unitName = (data && data.unitName) || (this.constructor as any).unitName || '';
    this.cameras.main.setBackgroundColor('#87ceeb'); // sky blue
    this.cameras.main.setRoundPixels(true);

    // Sky is already set by background color
    const ground = this.add.graphics();
    ground.fillStyle(0x6bc04b, 1); // green
    ground.fillRect(0, h * 0.6, w, h * 0.4); // raise ground higher
    // Draw a sun
    const sun = this.add.graphics();
    sun.fillStyle(0xffe066, 1);
    sun.fillCircle(w - 80, 80, 48);
    // Draw some hills
    const hills = this.add.graphics();
    hills.fillStyle(0x4ea24e, 1);
    hills.fillEllipse(w * 0.25, h * 0.85, 180, 60);
    hills.fillEllipse(w * 0.55, h * 0.8, 140, 50);
    hills.fillEllipse(w * 0.8, h * 0.9, 120, 40);


    // Add a "sign" behind the letter text
    const signWidth = 340;
    const signHeight = 200;
    const signX = this.cameras.main.centerX;
    const signY = this.cameras.main.centerY + 10;
    const sign = this.add.graphics();
    sign.setDepth(6); // in front of clouds, behind crow and text
    // Draw sign background (rounded rectangle)
    sign.fillStyle(0xf7e6b2, 1); // light wood color
    sign.fillRoundedRect(signX - signWidth / 2, signY - signHeight / 2, signWidth, signHeight, 32);
    // Draw sign border
    sign.lineStyle(6, 0x9e7b4f, 1); // darker brown
    sign.strokeRoundedRect(signX - signWidth / 2, signY - signHeight / 2, signWidth, signHeight, 32);
    // Draw sign posts
    sign.fillStyle(0x9e7b4f, 1);
    sign.fillRect(signX - signWidth / 2 + 30, signY + signHeight / 2 - 10, 18, 60);
    sign.fillRect(signX + signWidth / 2 - 48, signY + signHeight / 2 - 10, 18, 60);

    // Add crow, scaled down and behind the letter
    this.crow = new Crow({
      scene: this,
      x: this.cameras.main.centerX - 100,
      y: this.cameras.main.centerY + 80,
    });
    this.crow.setScale(0.5);
    this.crow.setDepth(9); // in front of sign (6), behind letter (10)
    this.crow.setIdle();

    // Add letter text (after clouds and sign, in front)
    // Determine what to show on the sign: show the current letter/word if available, else unitName
    let signText = this.unitName;
    this.letterText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      signText,
      {
        font: '160px Arial',
        color: '#1e1e2f',
        align: 'center',
        wordWrap: { width: this.cameras.main.width - 40 },
      }
    ).setOrigin(0.5);
    this.letterText.setDepth(10); // ensure in front of sign and clouds

    this.crowController = new CrowController(this, this.crow);
    this.crowController.playIntroWalkIn();


  }
  update(time: number, delta: number) {
    // Call crow update if needed
    if (super.update) super.update(time, delta);
  }

  /**
 * Called by React: onQuestionAnswered(isCorrect: boolean, onDone?: () => void)
 */
  onQuestionAnswered(isCorrect: boolean, onDone?: () => void) {
    this.questionCount++;
    // Only hop for correct answer, except on the crow-take-letter question
    if (isCorrect && this.questionCount !== MultipleChoiceScene.CROW_TAKE_LETTER_QUESTION) {
      if (this.crowController) {
        this.crowController.hop(onDone);
      } else if (onDone) {
        onDone();
      }
    } else if (onDone) {
      onDone();
    }
    if (this.questionCount === MultipleChoiceScene.CROW_TAKE_LETTER_QUESTION && this.crowActive) {
      this.crowActive = false;
      this.crowTakeLetter(onDone);
    }
  }

  crowTakingLetter: boolean = false;
  crowTakeLetter(onDone?: () => void) {
    if (!this.crow || !this.letterText || !this.crowController) return;
    this.crowTakingLetter = true;

    // Sequence: walk to left of word, then walk off right
    this.crowController.walkToLeftOfWordAndLook(
      this.letterText.x,
      this.letterText.y,
      () => {
        this.crowController.walkWordOffRight(this.letterText!, () => {
          this.crowTakingLetter = false;
          // Advance to next question immediately after letter is taken
          if (onDone) onDone();
          if (this._afterCrowReEnter) {
            this._afterCrowReEnter();
            this._afterCrowReEnter = null;
          }
          // Make crow re-enter from the right after taking the letter
          setTimeout(() => {
            if (this.crowController) {
              this.crowController.playReEnterFromRightWithCallback();
            }
          }, 600); // delay for effect before re-enter
        });
      }
    );
  }

  /**
 * After quiz complete: crow pushes word from right onto sign, then idles. Calls onDone when finished.
 */
  crowReturnWordAfterQuiz(onDone?: () => void) {
    if (!this.crow || !this.letterText || !this.crowController) {
      if (onDone) onDone();
      return;
    }
    const cam = this.cameras.main;
    const targetX = this.cameras.main.centerX;
    const textY = this.letterText.y; // keep text centered on sign
    const crowY = this.letterText.y + 80; // crow is lower, as in letter-taking
    const crowIdleX = cam.width - 100;
    const crowIdleY = cam.height - 20;

    // Step 0: Crow walks off screen right quickly, then brings text back
    const fastOffX = cam.width + 120;
    this.crowController.walkOffRightFast(fastOffX, crowY, () => {
      // Step 1: Crow pushes text on
      this.crowController.walkWordOnFromRight(
        this.letterText,
        targetX,
        textY,
        crowY,
        () => {
          // Step 2: Crow hops down to idle spot
          this.crowController.hopTo(crowIdleX, crowIdleY, () => {
            // Step 3: Crow hops in place repeatedly until told to stop
            this.crowController.startHoppingInPlace();
            if (onDone) onDone();
          });
        }
      );
    });
  }
}
