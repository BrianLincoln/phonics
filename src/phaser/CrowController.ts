import Phaser from 'phaser';
import { Crow } from './Crow';

export class CrowController {
  private putzBounds?: Phaser.Geom.Rectangle;

  private scene: Phaser.Scene;
  private crow: Crow;

  private margin = 30;
  private walkSpeed = 100;

  private walkAnimTimer = 0;
  private walkFrame: 1 | 2 | 3 = 1;

  constructor(scene: Phaser.Scene, crow: Crow) {
    this.scene = scene;
    this.crow = crow;
  }

  private createPutzBounds() {
    const cam = this.scene.cameras.main;

    this.putzBounds = new Phaser.Geom.Rectangle(
      cam.width * 0.7,                  // left edge (halfway)
      this.margin,                 // top edge (lower portion)
      cam.width * 0.3 - this.margin,    // width
      cam.height - this.margin * 2    // height
    );
  }


  startPutzing() {
    this.crow.setVisible(true);
    this.crow.setDepth(2);
    this.walkToRandomPoint();
  }

  public playIntroThenPutz() {
    const cam = this.scene.cameras.main;

    // Start off-screen bottom-left
    this.crow.setVisible(true);
    this.crow.setDepth(2);
    this.crow.setFacing('right');

    this.crow.setPosition(-100, cam.height - 20);

    this.startWalking();

    this.scene.tweens.add({
      targets: this.crow,
      x: cam.width - 100,
      y: cam.height - 20,
      duration: 3000,
      ease: 'Sine.easeOut',

      onUpdate: () => {
        this.advanceWalkAnimation(16);
      },

      onComplete: () => {
        this.crow.setIdle();

        this.scene.time.delayedCall(3000, () => {
          this.createPutzBounds(); // ensure bounds exist + drawn
          this.walkToRandomPoint();
        });
      },
    });
  }


  private walkToRandomPoint() {
    if (!this.putzBounds) {
      this.createPutzBounds();
    }

    const b = this.putzBounds!;

    const tx = Phaser.Math.Between(b.left, b.right);
    const ty = Phaser.Math.Between(b.top, b.bottom);

    const dx = tx - this.crow.x;
    const dy = ty - this.crow.y;
    const distance = Math.hypot(dx, dy);
    const duration = (distance / this.walkSpeed) * 1000;

    this.crow.setFacing(dx >= 0 ? 'right' : 'left');
    this.startWalking();

    this.scene.tweens.add({
      targets: this.crow,
      x: tx,
      y: ty,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: () => this.advanceWalkAnimation(16),
      onComplete: () => {
        this.crow.setIdle();
        this.scene.time.delayedCall(3000, () => this.walkToRandomPoint());
      },
    });
  }


  private startWalking() {
    this.walkFrame = 1;
    this.walkAnimTimer = 0;
    this.crow.setFrame(this.walkFrame);
  }

  private advanceWalkAnimation(deltaMs: number) {
    this.walkAnimTimer += deltaMs;

    if (this.walkAnimTimer >= 150) {
      this.walkFrame = this.walkFrame === 3 ? 1 : ((this.walkFrame + 1) as 1 | 2 | 3);
      this.crow.setFrame(this.walkFrame);
      this.walkAnimTimer = 0;
    }
  }

  /**
   * Walks the crow to the left of the given word, then idles.
   */
  walkToLeftOfWordAndLook(
    wordX: number,
    wordY: number,
    onDone: () => void
  ) {
    const targetX = wordX - 100;
    const targetY = wordY + 80;

    const dx = targetX - this.crow.x;

    this.crow.setVisible(true);
    this.crow.setDepth(2);
    this.crow.setFacing(dx >= 0 ? 'right' : 'left');
    this.startWalking();

    this.scene.tweens.add({
      targets: this.crow,
      x: targetX,
      y: targetY,
      duration: 900,
      ease: 'Sine.easeInOut',

      onUpdate: () => {
        this.advanceWalkAnimation(16);
      },

      onComplete: () => {
        this.crow.setIdle();
        onDone();
      },
    });
  }

  /**
   * Walks the crow and the word off to the right together.
   */
  walkWordOffRight(
    word: Phaser.GameObjects.Text,
    onDone: () => void
  ) {
    this.crow.setFacing('right');
    this.startWalking();

    this.scene.tweens.add({
      targets: [this.crow, word],
      x: '+=600',
      duration: 1200,
      ease: 'Quad.easeIn',

      onUpdate: () => {
        this.advanceWalkAnimation(16);
      },

      onComplete: () => {
        this.crow.setVisible(false);
        word.setVisible(false);
        onDone();
      },
    });
  }

  stopPutzing() {
    this.scene.tweens.killTweensOf(this.crow);
    this.crow.setIdle();
  }
}
