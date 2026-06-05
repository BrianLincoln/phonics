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
    this.buildCompanion();
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

  private buildCompanion() {
    const cam = this.cameras.main;
    this.setupCompanion(-100);
    const showCard = this.sceneData.showFirstCard !== false;
    if (showCard) {
      this.companionController!.carryCardInFromLeft(
        this.letterCard!,
        cam.centerX,
        cam.centerY + 10,
        () => { this.cardIsOnScreen = true; this.onCarryInComplete?.(); },
      );
    } else {
      this.companionController!.walkInFromLeft(() => { this.onCarryInComplete?.(); });
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
      this.companionBringCardIn(onReady);
    } else {
      onReady();
    }
  }

  /** Crow hops or shakes in response to a correct/wrong answer. */
  onQuestionAnswered(isCorrect: boolean, onDone?: () => void) {
    if (isCorrect) {
      this.companionController?.hop(onDone);
    } else {
      this.companionController?.shake(onDone);
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  crowTakeLetter(onDone?: () => void) {
    if (!this.companion || !this.letterCard || !this.companionController) {
      onDone?.();
      return;
    }

    this.companionController.walkToLeftOfWordAndLook(this.letterCard.x, this.letterCard.y, () => {
      this.companionController!.walkWordOffRight(this.letterCard!, () => {
        this.cardIsOnScreen = false;
        onDone?.();
        // Crow re-enters after a short pause (for hop/shake reactions on later questions)
        this.reEnterTimeout = setTimeout(() => {
          this.companionController?.playReEnterFromRightWithCallback();
        }, 600);
      });
    });
  }

  private companionBringCardIn(onReady: () => void) {
    if (!this.letterCard || !this.companionController) {
      onReady();
      return;
    }
    const cam = this.cameras.main;
    this.companionController.carryCardInFromLeft(
      this.letterCard,
      cam.centerX,
      cam.centerY + 10,
      () => { this.cardIsOnScreen = true; onReady(); },
    );
  }

  // Place the crow at (x, y) instantly, facing the given direction.
  placeCrow(x: number, y: number, facing: 'left' | 'right' = 'left') {
    if (!this.companion || !this.companionController) return;
    this.tweens.killTweensOf(this.companion);
    this.companionController.stopIdleBob();
    this.companion.setPosition(x, y);
    this.companion.setVisible(true);
    this.companion.setDepth(9);
    this.companion.setFacing(facing);
  }

  // Walk crow to (x, y) over exactly `duration` ms — for syncing with CSS tile animations.
  driveCrow(x: number, y: number, duration: number, onDone?: () => void) {
    this.companionController?.walkInDuration(x, y, duration, onDone);
  }

  // Walk crow to x quickly between steps (speed-based reposition, no squish).
  reposCrow(x: number, y: number, onDone?: () => void) {
    this.companionController?.quickWalkTo(x, y, 900, onDone);
  }

  // Walk crow back to its idle position.
  returnCrowToIdle(onDone?: () => void) {
    if (!this.companionController) { onDone?.(); return; }
    const cam = this.cameras.main;
    this.companionController.hopTo(cam.width - 100, this.companionController.groundY, onDone);
  }

  crowReturnWordAfterQuiz(onDone?: () => void) {
    if (!this.companion || !this.letterCard || !this.companionController) {
      onDone?.();
      return;
    }

    const cam = this.cameras.main;
    const targetX = cam.centerX;
    const cardY = this.letterCard.y;
    const crowY = this.companionController.groundY;

    this.companionController.walkOffRightFast(cam.width + 120, crowY, () => {
      this.companionController!.walkWordOnFromRight(this.letterCard!, targetX, cardY, () => {
        this.companionController!.hopTo(cam.width - 100, this.companionController!.groundY, () => {
          this.companionController!.startHoppingInPlace();
          onDone?.();
        });
      });
    });
  }
}
