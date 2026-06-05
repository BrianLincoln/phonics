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
    this.buildCompanion();
  }

  private buildCompanion() {
    const cam = this.cameras.main;
    this.setupCompanion(cam.centerX - 100);
    this.companionController!.playIntroWalkIn();
  }

  onCorrectTap(onDone?: () => void) {
    this.companionController?.hop(onDone);
  }

  onWrongTap(onDone?: () => void) {
    this.companionController?.shake(onDone);
  }

  // Convenience alias so mixed-mode can drive MCQ feedback with the same API
  onQuestionAnswered(isCorrect: boolean, onDone?: () => void) {
    if (isCorrect) this.companionController?.hop(onDone);
    else this.companionController?.shake(onDone);
  }
}
