import Phaser from 'phaser';
import { BaseGameScene } from './BaseGameScene';

export interface MultipleChoiceSceneData {
  unitName: string;
  questionIndex: number;
  /** When false, the card stays invisible during the initial carry-in (first question hides letter). Default true. */
  showFirstCard?: boolean;
}

export class MultipleChoiceScene extends BaseGameScene {
  private sceneData!: MultipleChoiceSceneData;
  private unitName = '';

  letterCard?: Phaser.GameObjects.Container;
  letterText?: Phaser.GameObjects.Text;
  onCarryInComplete?: () => void;
  private cardIsOnScreen = false; // true once carry-in completes, false after take-away
  get isCardOnScreen() { return this.cardIsOnScreen; }

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
    const showCard = this.sceneData.showFirstCard !== false;
    if (showCard) {
      this.crowController!.carryCardInFromLeft(
        this.letterCard!,
        cam.centerX,
        cam.centerY + 10,
        () => { this.cardIsOnScreen = true; this.onCarryInComplete?.(); },
      );
    } else {
      this.crowController!.walkInFromLeft(() => { this.onCarryInComplete?.(); });
    }
  }

  // ── Public API called by React ────────────────────────────────────────────

  /**
   * Called at the start of each question.
   * Animates the card in or out based on showLetter vs current visibility,
   * then calls onReady (which plays the audio prompt and unlocks answers).
   */
  prepareForQuestion(showLetter: boolean | undefined, onReady: () => void) {
    if (!showLetter) {
      // Hide instantly — no animation needed; calling crowTakeLetter risks timing issues
      // if the carry-in just completed and the crow hasn't settled yet.
      this.letterCard?.setVisible(false);
      this.cardIsOnScreen = false;
      onReady();
    } else if (!this.cardIsOnScreen) {
      // Card is hidden but this question wants it shown — crow brings it back
      this.crowBringCardIn(onReady);
    } else {
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

  crowTakeLetter(onDone?: () => void) {
    if (!this.crow || !this.letterCard || !this.crowController) {
      onDone?.();
      return;
    }

    this.crowController.walkToLeftOfWordAndLook(this.letterCard.x, this.letterCard.y, () => {
      this.crowController!.walkWordOffRight(this.letterCard!, () => {
        this.cardIsOnScreen = false;
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
      () => { this.cardIsOnScreen = true; onReady(); },
    );
  }

  // Place the crow at (x, y) instantly, facing the given direction.
  placeCrow(x: number, y: number, facing: 'left' | 'right' = 'left') {
    if (!this.crow || !this.crowController) return;
    this.tweens.killTweensOf(this.crow);
    this.crowController.stopIdleBob();
    this.crow.setPosition(x, y);
    this.crow.setVisible(true);
    this.crow.setDepth(9);
    this.crow.setFacing(facing);
  }

  // Walk crow to (x, y) over exactly `duration` ms — for syncing with CSS tile animations.
  driveCrow(x: number, y: number, duration: number, onDone?: () => void) {
    this.crowController?.walkInDuration(x, y, duration, onDone);
  }

  // Walk crow to x quickly between steps (speed-based reposition, no squish).
  reposCrow(x: number, y: number, onDone?: () => void) {
    this.crowController?.quickWalkTo(x, y, 900, onDone);
  }

  // Walk crow back to its idle position.
  returnCrowToIdle(onDone?: () => void) {
    if (!this.crowController) { onDone?.(); return; }
    const cam = this.cameras.main;
    this.crowController.hopTo(cam.width - 100, this.crowController.groundY, onDone);
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
