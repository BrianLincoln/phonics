import { BaseGameScene } from './BaseGameScene';

export class EndlessScene extends BaseGameScene {
  constructor() {
    super('EndlessScene');
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

  onQuestionAnswered(isCorrect: boolean, onDone?: () => void) {
    if (isCorrect) {
      this.companionController?.hop(onDone);
    } else {
      this.companionController?.shake(onDone);
    }
  }
}
