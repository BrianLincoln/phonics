import { BaseGameScene } from './BaseGameScene';

export interface BuildTheWordSceneData {
  unitName: string;
}

export class BuildTheWordScene extends BaseGameScene {
  // Unique key prevents conflict with EndlessScene / MultipleChoiceScene
  // when scenes run back-to-back and share the same Phaser texture cache.
  protected override get hillsTextureKey() { return 'hills-btw'; }

  constructor() {
    super('BuildTheWordScene');
  }

  create() {
    this.buildEnvironment();
    this.buildCrow();
  }

  private buildCrow() {
    const cam = this.cameras.main;
    this.setupCrow(cam.centerX - 100);
    this.crowController!.playIntroWalkIn();
  }

  onCorrectTap(onDone?: () => void) {
    this.crowController?.hop(onDone);
  }

  onWrongTap(onDone?: () => void) {
    this.crowController?.shake(onDone);
  }

  // Convenience alias so mixed-mode can drive MCQ feedback with the same API
  onQuestionAnswered(isCorrect: boolean, onDone?: () => void) {
    if (isCorrect) this.crowController?.hop(onDone);
    else this.crowController?.shake(onDone);
  }
}
