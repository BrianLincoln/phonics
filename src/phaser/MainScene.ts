import Phaser from 'phaser';
import { Crow } from './Crow';
import { CrowController } from './CrowController';

const CROW_WALK_SPEED = 400;
const CROW_FLIP_OFFSET = 50;

export class MainScene extends Phaser.Scene {
  static readonly CROW_TAKE_LETTER_QUESTION = 3;
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

    // Use CrowController for crow walk-in only (no putzing)
    this.crowController = new CrowController(this, this.crow);
    this.crowController.playIntroWalkIn();
  }

  onQuestionAnswered() {
    this.questionCount++;
    // Only hop for correct answer, except on the crow-take-letter question
    // Use explicit parameters for clarity
    // onQuestionAnswered(isCorrect: boolean, onDone?: () => void)
    // Only hop for correct answer, except on the crow-take-letter question
    // (Caller must use this signature)
    // If called with object (old style), fallback for compatibility
    if (typeof arguments[0] === 'boolean') {
      const isCorrect = arguments[0];
      const onDone = arguments[1];
      if (isCorrect && this.questionCount !== MainScene.CROW_TAKE_LETTER_QUESTION) {
        if (this.crowController) {
          this.crowController.hop(onDone);
        } else if (onDone) {
          onDone();
        }
      } else if (onDone) {
        onDone();
      }
    } else if (typeof arguments[0] === 'object' && arguments[0]?.correct) {
      // Fallback for old call style
      if (this.crowController) {
        this.crowController.hop(arguments[0].onDone);
      } else if (arguments[0].onDone) {
        arguments[0].onDone();
      }
    }
    if (this.questionCount === MainScene.CROW_TAKE_LETTER_QUESTION && this.crowActive) {
      this.crowActive = false;
      // If called with explicit params, pass onDone to crowTakeLetter
      if (typeof arguments[0] === 'boolean') {
        const onDone = arguments[1];
        this.crowTakeLetter(onDone);
      } else if (typeof arguments[0] === 'object' && arguments[0]?.onDone) {
        this.crowTakeLetter(arguments[0].onDone);
      } else {
        this.crowTakeLetter();
      }
    }
  }

  crowTakingLetter: boolean = false;
  crowTakeLetter() {
    if (!this.crow || !this.letterText || !this.crowController) return;
    this.crowTakingLetter = true;

    // Deprecated: putzing is no longer called
    this.letterText.setDepth(1);
    // Sequence: walk to left of word, then walk off right
    let afterCrowDone = undefined;
    if (arguments.length && typeof arguments[0] === 'function') {
      afterCrowDone = arguments[0];
    }
    this.crowController.walkToLeftOfWordAndLook(
      this.letterText.x,
      this.letterText.y,
      () => {
        this.crowController.walkWordOffRight(this.letterText!, () => {
          this.crowTakingLetter = false;
          // Advance to next question immediately after letter is taken
          if (afterCrowDone) afterCrowDone();
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
}
