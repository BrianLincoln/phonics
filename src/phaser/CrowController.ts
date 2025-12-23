import Phaser from 'phaser';
import { Crow } from './Crow';

export class CrowController {
  private scene: Phaser.Scene;
  private crow: Crow;
  private putzArea: { w: number; h: number };
  private margin: number = 60;
  private centerPadX: number = 180;
  private centerPadY: number = 120;
  private crowHeight: number = 200 * 0.5;
  private walkSpeed: number = 400 * 0.35;
  private walkAnimTimer: number = 0;
  private walkFrame: number = 1;
  private lastDirection: 'left' | 'right' = 'left';
  private isWalking: boolean = false;
  private target?: { x: number; y: number };

  constructor(scene: Phaser.Scene, crow: Crow) {
    this.scene = scene;
    this.crow = crow;
    this.putzArea = { w: scene.cameras.main.width, h: scene.cameras.main.height };
  }

  startPutzing() {
    // Start crow off screen at bottom left
    const w = this.putzArea.w;
    const h = this.putzArea.h;
    this.crow.x = -100;
    this.crow.y = h - 20;
    this.crow.setVisible(true);
    this.crow.setDepth(2);
    this.crow.setFrame(1);
    // Always face direction of movement
    this.crow.setFlipX(true); // right
    this.crow.setOrigin(1, 1);
    // Tween to bottom right in a straight line, slower
    this.scene.tweens.add({
      targets: this.crow,
      x: w - 100,
      y: h - 20,
      duration: 2500,
      ease: 'Linear',
      onStart: () => {
        this.crow.setFrame(1);
        this.crow.setFlipX(true);
        this.crow.setOrigin(1, 1);
      },
      onUpdate: (tween, target) => {
        // Always face direction of movement
        if (tween.data[0].end > tween.data[0].start) {
          this.crow.setFlipX(true);
          this.crow.setOrigin(1, 1);
        } else {
          this.crow.setFlipX(false);
          this.crow.setOrigin(0, 1);
        }
        // Animate walking frames
        this.walkAnimTimer += 16;
        if (this.walkAnimTimer > 200) {
          this.walkFrame = this.walkFrame === 3 ? 1 : this.walkFrame + 1;
          this.crow.setFrame(this.walkFrame);
          this.walkAnimTimer = 0;
        }
      },
      onComplete: () => {
        this.crow.setIdle();
        this._putzPauseAndLoop();
      },
    });
  }

  // Helper for the putzing loop
  private _putzPauseAndLoop() {
    // Pause 3 seconds, then putz for 2 seconds, then repeat
    this.crow.setIdle();
    this.scene.time.delayedCall(3000, () => {
      this._putzInBottomRight(2000, () => {
        this.scene.time.delayedCall(3000, () => {
          this._putzInBottomRight(2000, () => {
            this._putzPauseAndLoop();
          });
        });
      });
    });
  }

  // Putz around a small area in the bottom right for a given duration
  private _putzInBottomRight(duration: number, onDone: () => void) {
    const w = this.putzArea.w;
    const h = this.putzArea.h;
    const area = {
      left: w - 180,
      right: w - 40,
      top: h - 120,
      bottom: h - 20,
    };
    let elapsed = 0;
    const moveCrow = () => {
      if (elapsed >= duration) {
        this.crow.setIdle();
        onDone();
        return;
      }
      // Pick a random point in the area
      const tx = Phaser.Math.Between(area.left, area.right);
      const ty = Phaser.Math.Between(area.top, area.bottom);
      // Face direction
      if (tx > this.crow.x) {
        this.crow.setFlipX(true);
        this.crow.setOrigin(1, 1);
      } else {
        this.crow.setFlipX(false);
        this.crow.setOrigin(0, 1);
      }
      this.scene.tweens.add({
        targets: this.crow,
        x: tx,
        y: ty,
        duration: 600,
        ease: 'Sine.easeInOut',
        onStart: () => {
          this.crow.setFrame(1);
        },
        onUpdate: (tween, target) => {
          // Always face direction of movement
          if (tween.data[0].end > tween.data[0].start) {
            this.crow.setFlipX(true);
            this.crow.setOrigin(1, 1);
          } else {
            this.crow.setFlipX(false);
            this.crow.setOrigin(0, 1);
          }
          this.walkAnimTimer += 16;
          if (this.walkAnimTimer > 200) {
            this.walkFrame = this.walkFrame === 3 ? 1 : this.walkFrame + 1;
            this.crow.setFrame(this.walkFrame);
            this.walkAnimTimer = 0;
          }
        },
        onComplete: () => {
          this.crow.setIdle();
          elapsed += 600;
          this.scene.time.delayedCall(120, moveCrow);
        },
      });
    };
    moveCrow();
  }

  stopPutzing() {
    this.isWalking = false;
  }

  setRandomTarget() {
    const w = this.putzArea.w;
    const h = this.putzArea.h;
    let x, y, tries = 0;
    do {
      x = Phaser.Math.Between(this.margin, w - this.margin);
      y = Phaser.Math.Between(this.margin + this.crowHeight, h - this.margin);
      tries++;
    } while (
      Math.abs(x - w / 2) < this.centerPadX &&
      Math.abs(y - h / 2) < this.centerPadY &&
      tries < 10
    );
    this.target = { x, y };
    this.isWalking = true;
  }

  update(delta: number) {
    if (!this.isWalking || !this.target) return;
    const speed = this.walkSpeed * (delta / 1000);
    const dx = this.target.x - this.crow.x;
    const dy = this.target.y - this.crow.y;
    if (dx > 0) {
      if (!this.crow.flipX) {
        this.crow.setFlipX(true);
        this.crow.x -= 50;
        this.crow.setOrigin(1, 1);
      }
      this.lastDirection = 'right';
    } else if (dx < 0) {
      if (this.crow.flipX) {
        this.crow.setFlipX(false);
        this.crow.x += 50;
        this.crow.setOrigin(0, 1);
      }
      this.lastDirection = 'left';
    }
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 5) {
      const moveX = (dx / dist) * Math.min(dist, speed);
      const moveY = (dy / dist) * Math.min(dist, speed);
      this.crow.x += moveX;
      this.crow.y += moveY;
      this.walkAnimTimer += delta;
      if (this.walkAnimTimer > 150) {
        this.walkFrame = this.walkFrame === 3 ? 1 : this.walkFrame + 1;
        this.crow.setFrame(this.walkFrame);
        this.walkAnimTimer = 0;
      }
    } else {
      this.crow.x = this.target.x;
      this.crow.y = this.target.y;
      this.crow.setIdle();
      this.isWalking = false;
      if (this.lastDirection === 'right' && !this.crow.flipX) {
        this.crow.setFlipX(true);
        this.crow.x -= 50;
        this.crow.setOrigin(1, 1);
      } else if (this.lastDirection === 'left' && this.crow.flipX) {
        this.crow.setFlipX(false);
        this.crow.x += 50;
        this.crow.setOrigin(0, 1);
      }
      this.scene.time.delayedCall(Phaser.Math.Between(600, 1200), () => {
        this.setRandomTarget();
      });
    }
  }

  /**
   * Walks the crow to the left of the given (x, y), then performs a look left/right sequence,
   * then calls the provided callback.
   */
  public walkToLeftOfWordAndLook(wordX: number, wordY: number, onDone: () => void) {
    // Target is to the left of the word
    const crowTargetX = wordX - 100;
    const crowTargetY = wordY + 80;
    this.crow.setDepth(2);
    this.crow.setVisible(true);
    this.crow.setFrame(1);
    // Face the direction of movement
    if (this.crow.x > crowTargetX) {
      this.crow.setFlipX(false);
      this.crow.setOrigin(0, 1);
    } else {
      this.crow.setFlipX(true);
      this.crow.setOrigin(1, 1);
    }
    this.scene.tweens.add({
      targets: this.crow,
      x: crowTargetX,
      y: crowTargetY,
      duration: 900,
      ease: 'Sine.easeInOut',
      onStart: () => {
        this.crow.setFrame(1);
      },
      onUpdate: () => {
        // Animate walking frames
        this.walkAnimTimer += 16; // approx per frame
        if (this.walkAnimTimer > 150) {
          this.walkFrame = this.walkFrame === 3 ? 1 : this.walkFrame + 1;
          this.crow.setFrame(this.walkFrame);
          this.walkAnimTimer = 0;
        }
      },
      onComplete: () => {
        this.crow.setIdle();
        onDone();
      },
    });
  }

  // lookLeftRightSequence removed (no longer used)

  /**
   * Walks the crow and the word off to the right together.
   */
  public walkWordOffRight(word: Phaser.GameObjects.Text, onDone: () => void) {
    // Face right
    this.crow.setFlipX(true);
    this.crow.setOrigin(1, 1);
    this.crow.setFrame(1);
    this.scene.tweens.add({
      targets: [this.crow, word],
      x: '+=600',
      duration: 1200,
      ease: 'Quad.easeIn',
      onStart: () => {
        this.crow.setFrame(1);
        this.crow.setFlipX(true);
        this.crow.setOrigin(1, 1);
      },
      onUpdate: () => {
        // Ensure crow always faces right during tween
        this.crow.setFlipX(true);
        this.crow.setOrigin(1, 1);
        // Animate walking frames
        this.walkAnimTimer += 16;
        if (this.walkAnimTimer > 150) {
          this.walkFrame = this.walkFrame === 3 ? 1 : this.walkFrame + 1;
          this.crow.setFrame(this.walkFrame);
          this.walkAnimTimer = 0;
        }
      },
      onComplete: () => {
        this.crow.setVisible(false);
        word.setVisible(false);
        onDone();
      },
    });
  }
}