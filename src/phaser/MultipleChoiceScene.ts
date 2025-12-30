import Phaser from 'phaser';
import { Crow } from './Crow';
import { CrowController } from './CrowController';

export interface MultipleChoiceSceneData {
  unitName: string;
  questionIndex: number;
  promptText?: string;
}

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
  }

  private applySceneData() {
    if (!this.sceneData || !this.letterText) return;
    this.letterText.setText(
      this.sceneData.promptText ?? this.sceneData.unitName
    );
  }

  private buildEnvironment() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.cameras.main.setBackgroundColor('#87ceeb');
    this.cameras.main.setRoundPixels(true);

    const ground = this.add.graphics();
    ground.fillStyle(0x6bc04b, 1);
    ground.fillRect(0, h * 0.6, w, h * 0.4);

    const sun = this.add.graphics();
    sun.fillStyle(0xffe066, 1);
    sun.fillCircle(w - 80, 80, 48);

    const hills = this.add.graphics();
    hills.fillStyle(0x4ea24e, 1);
    hills.fillEllipse(w * 0.25, h * 0.85, 180, 60);
    hills.fillEllipse(w * 0.55, h * 0.8, 140, 50);
    hills.fillEllipse(w * 0.8, h * 0.9, 120, 40);
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
    this.crow = new Crow({
      scene: this,
      x: this.cameras.main.centerX - 100,
      y: this.cameras.main.centerY + 80,
    });

    this.crow.setScale(0.5);
    this.crow.setDepth(9);
    this.crow.setIdle();

    this.crowController = new CrowController(this, this.crow);
    this.crowController.playIntroWalkIn();
  }

  onQuestionAnswered(isCorrect: boolean, onDone?: () => void) {
    this.questionCount++;

    if (isCorrect && this.questionCount !== MultipleChoiceScene.CROW_TAKE_LETTER_QUESTION) {
      this.crowController?.hop(onDone);
    } else {
      onDone?.();
    }

    if (this.questionCount === MultipleChoiceScene.CROW_TAKE_LETTER_QUESTION && this.crowActive) {
      this.crowActive = false;
      this.crowTakeLetter(onDone);
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
        this.crowController!.hopTo(cam.width - 100, cam.height - 20, () => {
          this.crowController!.startHoppingInPlace();
          onDone?.();
        });
      });
    });
  }
}
