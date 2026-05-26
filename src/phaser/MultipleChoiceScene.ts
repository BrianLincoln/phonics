import Phaser from 'phaser';
import { BaseGameScene } from './BaseGameScene';

export interface MultipleChoiceSceneData {
  unitName: string;
  questionIndex: number;
}

export class MultipleChoiceScene extends BaseGameScene {
  private sceneData!: MultipleChoiceSceneData;
  private unitName = '';

  letterCard?: Phaser.GameObjects.Container;
  letterText?: Phaser.GameObjects.Text;
  onCarryInComplete?: () => void;

  private reEnterTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    super('MultipleChoiceScene');
  }

  init(data: MultipleChoiceSceneData) {
    this.sceneData = data;
    this.unitName = data.unitName;
  }

  create() {
    this.buildEnvironment();
    this.buildCard();
    this.buildCrow();
    this.applySceneData();
  }

  override shutdown() {
    if (this.reEnterTimeout) {
      clearTimeout(this.reEnterTimeout);
      this.reEnterTimeout = undefined;
    }
    super.shutdown();
  }

  private applySceneData() {
    if (!this.sceneData || !this.letterText) return;
    this.letterText.setText(this.sceneData.unitName);
  }

  private buildCard() {
    const cardW = 300;
    const cardH = 190;
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY + 10;

    const cardGfx = this.add.graphics();
    cardGfx.fillStyle(0xffffff, 1);
    cardGfx.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 22);
    cardGfx.lineStyle(5, 0x1a1a1a, 1);
    cardGfx.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 22);

    this.letterText = this.add.text(0, -6, '', {
      font: '140px Arial',
      color: '#1e1e2f',
      align: 'center',
    }).setOrigin(0.5);

    // Starts off-screen left; carryCardInFromLeft will bring it in
    this.letterCard = this.add.container(-cardW - 100, cy, [cardGfx, this.letterText]);
    this.letterCard.setDepth(6);
  }

  private buildCrow() {
    const cam = this.cameras.main;
    this.setupCrow(-100);
    this.crowController!.carryCardInFromLeft(
      this.letterCard!,
      cam.centerX,
      cam.centerY + 10,
      () => { this.onCarryInComplete?.(); },
    );
  }

  // ── Public API called by React ────────────────────────────────────────────

  /**
   * Called at the start of each question.
   * Animates the card in or out based on hideLetter vs current visibility,
   * then calls onReady (which plays the audio prompt and unlocks answers).
   */
  prepareForQuestion(hideLetter: boolean | undefined, onReady: () => void) {
    const cardVisible = this.letterCard?.visible ?? false;

    if (hideLetter === true && cardVisible) {
      // Card is showing but this question wants it hidden — crow takes it
      this.crowTakeLetter(onReady);
    } else if (hideLetter === false && !cardVisible) {
      // Card is hidden but this question explicitly wants it shown — crow brings it back
      this.crowBringCardIn(onReady);
    } else {
      // Already in the right state, or hideLetter is undefined (no preference)
      onReady();
    }
  }

  /** Crow hops or shakes in response to a correct/wrong answer. */
  onQuestionAnswered(isCorrect: boolean, onDone?: () => void) {
    if (isCorrect) {
      this.crowController?.hop(onDone);
    } else {
      this.crowController?.shake(onDone);
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private crowTakeLetter(onDone?: () => void) {
    if (!this.crow || !this.letterCard || !this.crowController) {
      onDone?.();
      return;
    }

    this.crowController.walkToLeftOfWordAndLook(this.letterCard.x, this.letterCard.y, () => {
      this.crowController!.walkWordOffRight(this.letterCard!, () => {
        onDone?.();
        // Crow re-enters after a short pause (for hop/shake reactions on later questions)
        this.reEnterTimeout = setTimeout(() => {
          this.crowController?.playReEnterFromRightWithCallback();
        }, 600);
      });
    });
  }

  private crowBringCardIn(onReady: () => void) {
    if (!this.letterCard || !this.crowController) {
      onReady();
      return;
    }
    const cam = this.cameras.main;
    this.crowController.carryCardInFromLeft(
      this.letterCard,
      cam.centerX,
      cam.centerY + 10,
      onReady,
    );
  }

  crowReturnWordAfterQuiz(onDone?: () => void) {
    if (!this.crow || !this.letterCard || !this.crowController) {
      onDone?.();
      return;
    }

    const cam = this.cameras.main;
    const targetX = cam.centerX;
    const cardY = this.letterCard.y;
    const crowY = cardY + 80;

    this.crowController.walkOffRightFast(cam.width + 120, crowY, () => {
      this.crowController!.walkWordOnFromRight(this.letterCard!, targetX, cardY, crowY, () => {
        this.crowController!.hopTo(cam.width - 100, this.crowController!.groundY, () => {
          this.crowController!.startHoppingInPlace();
          onDone?.();
        });
      });
    });
  }
}
