

import Phaser from 'phaser';
import { Crow } from './Crow';

export class CrowController {
  /**
   * Walks the crow (facing left) and the word from off-screen right onto the sign, then idles.
   * Calls onDone when finished.
   */
  walkWordOnFromRight(
    word: Phaser.GameObjects.Text,
    targetX: number,
    textY: number,
    crowY: number,
    onDone: () => void
  ) {
    const cam = this.scene.cameras.main;
    const crowOffset = 90; // px between crow and text (crow to right of text)
    this.crow.setVisible(true);
    this.crow.setDepth(9);
    this.crow.setFacing('left');
    this.crow.setPosition(cam.width + 100, crowY);
    word.setVisible(true);
    word.setPosition(cam.width + 100 - crowOffset, textY);
    this.startWalking();
    // Animate both to their final positions, keeping the offset and correct y
    this.scene.tweens.add({
      targets: this.crow,
      x: targetX + crowOffset,
      y: crowY,
      duration: 1200,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        this.advanceWalkAnimation(16);
        // Move the word to stay in front of the crow, but keep y fixed
        word.x = this.crow.x - crowOffset;
        word.y = textY;
      },
      onComplete: () => {
        // Snap to final positions
        this.crow.setX(targetX + crowOffset);
        this.crow.setY(crowY);
        word.setX(targetX);
        word.setY(textY);
        this.crow.setIdle();
        if (onDone) onDone();
      },
    });
  }

  /**
   * Re-enters from the right and calls onDone when finished.
   */
  playReEnterFromRightWithCallback(onDone?: () => void) {
    const cam = this.scene.cameras.main;
    this.crow.setVisible(true);
    this.crow.setDepth(9);
    this.crow.setFacing('left');
    // Start off-screen right
    this.crow.setPosition(cam.width + 100, cam.height - 20);
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
        if (onDone) onDone();
      },
    });
  }
  /**
   * Makes the crow re-enter from the right side of the screen and walk to its idle position.
   */
  public playReEnterFromRight() {
    const cam = this.scene.cameras.main;
    this.crow.setVisible(true);
    this.crow.setDepth(9);
    this.crow.setFacing('left');
    // Start off-screen right
    this.crow.setPosition(cam.width + 100, cam.height - 20);
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
      },
    });
  }
  /**
   * Makes the crow do two quick hops animation.
   */
  hop(onDone?: () => void) {
    if (!this.crow.visible) {
      if (onDone) onDone();
      return;
    }
    // First hop
    this.scene.tweens.add({
      targets: this.crow,
      y: '-=30',
      duration: 120,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // Second hop
        this.scene.tweens.add({
          targets: this.crow,
          y: '-=30',
          duration: 120,
          yoyo: true,
          ease: 'Quad.easeOut',
          onComplete: () => {
            if (onDone) onDone();
          },
        });
      },
    });
  }
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


  // Deprecated: startPutzing is no longer called, but code is kept for future use
  startPutzing() {
    this.crow.setVisible(true);
    this.crow.setDepth(9);
    this.walkToRandomPoint();
  }

  // Renamed: playIntroWalkIn (no putzing after walk-in)
  public playIntroWalkIn() {
    const cam = this.scene.cameras.main;

    // Start off-screen bottom-left
    this.crow.setVisible(true);
    this.crow.setDepth(9);
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
        this.crow.setFacing('left');
        this.crow.setIdle();
        // No putzing after walk-in
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
    this.crow.setDepth(9);
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

  private hoppingInPlace = false;

  /**
   * Hop the crow to a specific (x, y) position, then idle.
   */
  hopTo(x: number, y: number, onDone?: () => void) {
    // Always face left if hopping to idle spot (bottom right)
    const cam = this.scene.cameras.main;
    const idleX = cam.width - 100;
    const idleY = cam.height - 20;
    if (x === idleX && y === idleY) {
      this.crow.setFacing('left');
    } else {
      this.crow.setFacing(x >= this.crow.x ? 'right' : 'left');
    }
    this.scene.tweens.add({
      targets: this.crow,
      x,
      y,
      duration: 500,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.hop(() => {
          // Always face left if at idle
          if (x === idleX && y === idleY) this.crow.setFacing('left');
          this.crow.setIdle();
          if (onDone) onDone();
        });
      },
    });
  }

  /**
   * Start hopping in place repeatedly until stopHoppingInPlace is called.
   */
  startHoppingInPlace() {
    if (this.hoppingInPlace) return;
    this.hoppingInPlace = true;
    // Always face left if in idle spot
    const cam = this.scene.cameras.main;
    const idleX = cam.width - 100;
    const idleY = cam.height - 20;
    this.crow.setFacing('left');
    const hopLoop = () => {
      if (!this.hoppingInPlace) return;
      this.hop(() => {
        // Always face left if at idle
        if (this.crow.x === idleX && this.crow.y === idleY) this.crow.setFacing('left');
        if (this.hoppingInPlace) {
          this.scene.time.delayedCall(300, hopLoop);
        }
      });
    };
    hopLoop();
  }

  /**
   * Stop the repeated hopping in place.
   */
  stopHoppingInPlace() {
    this.hoppingInPlace = false;
  }

  /**
 * Crow walks off screen right quickly, then calls onDone.
 */
  walkOffRightFast(targetX: number, y: number, onDone?: () => void) {
    this.crow.setFacing('right');
    this.startWalking();
    this.scene.tweens.add({
      targets: this.crow,
      x: targetX,
      y: y,
      duration: 350,
      ease: 'Quad.easeIn',
      onUpdate: () => {
        this.advanceWalkAnimation(16);
      },
      onComplete: () => {
        this.crow.setVisible(false);
        if (onDone) onDone();
      },
    });
  }
}
