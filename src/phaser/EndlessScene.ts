import { BaseGameScene } from './BaseGameScene';

export class EndlessScene extends BaseGameScene {
  constructor() {
    super('EndlessScene');
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

  onQuestionAnswered(isCorrect: boolean, onDone?: () => void) {
    if (isCorrect) {
      this.crowController?.hop(onDone);
    } else {
      this.crowController?.shake(onDone);
    }
  }
}
