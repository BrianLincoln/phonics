import Phaser from 'phaser';
import { Crow } from './Crow';
import { CrowController } from './CrowController';

const CROW_WALK_SPEED = 400;
const CROW_FLIP_OFFSET = 50;

export class MainScene extends Phaser.Scene {
  private unitName: string = '';

  constructor() {
    super('MainScene');
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

  create() {
    this.unitName = (this.constructor as any).unitName || '';
    this.cameras.main.setBackgroundColor('#fff');
    this.cameras.main.setRoundPixels(true);

    // Add letter text
    this.letterText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.unitName || 'Phaser Ready',
      {
        font: '160px Arial',
        color: '#1e1e2f',
        align: 'center',
        wordWrap: { width: this.cameras.main.width - 40 },
      }
    ).setOrigin(0.5);

    // Add crow, scaled down and behind the letter
    this.crow = new Crow({
      scene: this,
      x: this.cameras.main.centerX - 100,
      y: this.cameras.main.centerY + 80,
    });
    this.crow.setScale(0.5);
    this.crow.setDepth(0);
    this.letterText.setDepth(1);
    this.crow.setIdle();

    // Use CrowController for putzing
    this.crowController = new CrowController(this, this.crow);
    this.crowController.playIntroThenPutz();
  }

  // putzCrow removed; handled by update loop

  onQuestionAnswered() {
    this.questionCount++;
    if (this.questionCount === 1 && this.crowActive) {
      this.crowActive = false;
      this.crowTakeLetter();
    }
  }

  crowTakingLetter: boolean = false;
  crowTakeLetter() {
    if (!this.crow || !this.letterText || !this.crowController) return;
    this.crowTakingLetter = true;

    // Stop putzing immediately
    this.crowController.stopPutzing();
    this.letterText.setDepth(1);
    // Sequence: walk to left of word, then walk off right
    this.crowController.walkToLeftOfWordAndLook(
      this.letterText.x,
      this.letterText.y,
      () => {
        this.crowController.walkWordOffRight(this.letterText!, () => {
          this.crowTakingLetter = false;
        });
      }
    );
  }
}
