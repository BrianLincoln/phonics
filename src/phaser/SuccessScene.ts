import Phaser from 'phaser';

export class SuccessScene extends Phaser.Scene {
  constructor() {
    super('SuccessScene');
  }

  preload() {
    this.load.audio('success', '/audio/system/success.wav');
  }

  create(data: { onComplete?: () => void }) {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.cameras.main.setBackgroundColor('#fff');
    // Fade out any previous content
    this.cameras.main.fadeOut(400, 255, 255, 255);
    this.time.delayedCall(400, () => {
      // Play success sound
      const sound = this.sound.add('success');
      sound.play();
      // Fade in emoji
      const emoji = this.add.text(w / 2, h / 2, '🎉', {
        fontSize: '180px',
        fontFamily: 'Arial',
        color: '#222',
      }).setOrigin(0.5);
      emoji.alpha = 0;
      this.tweens.add({
        targets: emoji,
        alpha: 1,
        duration: 250,
        onComplete: () => {
          // Fade out after sound duration or 1s min
          const outDelay = sound.duration ? Math.max(sound.duration * 1000, 1000) : 1000;
          this.time.delayedCall(outDelay, () => {
            this.tweens.add({
              targets: emoji,
              alpha: 0,
              duration: 400,
              onComplete: () => {
                emoji.destroy();
                if (typeof data.onComplete === 'function') {
                  data.onComplete();
                }
              }
            });
          });
        }
      });
    });
  }
}
