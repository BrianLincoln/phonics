

import Phaser from 'phaser';
import { Crow } from './Crow';

export class CrowController {
  private scene: Phaser.Scene;
  private crow: Crow;
  readonly groundY: number;

  private margin = 30;
  private walkSpeed = 100;
  private walkAnimTimer = 0;
  private walkFrame: 1 | 2 | 3 = 1;

  private idleBobTimer?: Phaser.Time.TimerEvent;
  private idleBobActiveTween?: Phaser.Tweens.Tween;
  private hoppingInPlace = false;
  private putzBounds?: Phaser.Geom.Rectangle;

  constructor(scene: Phaser.Scene, crow: Crow) {
    this.scene = scene;
    this.crow = crow;
    this.groundY = scene.cameras.main.height * 0.78;
  }

  // ── Idle bob ────────────────────────────────────────────────────────────────

  startIdleBob() {
    this.stopIdleBob();
    this.scheduleNextBob();
  }

  private scheduleNextBob() {
    const delay = Phaser.Math.Between(3000, 5000);
    this.idleBobTimer = this.scene.time.delayedCall(delay, () => {
      this.idleBobTimer = undefined;
      const baseY = this.crow.y;
      this.idleBobActiveTween = this.scene.tweens.add({
        targets: this.crow,
        y: baseY - 9,
        duration: 70,
        yoyo: true,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.idleBobActiveTween = undefined;
          this.scheduleNextBob();
        },
      });
    });
  }

  stopIdleBob() {
    if (this.idleBobTimer) {
      this.idleBobTimer.remove();
      this.idleBobTimer = undefined;
    }
    if (this.idleBobActiveTween) {
      this.idleBobActiveTween.stop();
      this.idleBobActiveTween = undefined;
    }
  }

  // ── Squish helper ────────────────────────────────────────────────────────────

  private squishOnLand(cb: () => void) {
    this.scene.tweens.add({
      targets: this.crow,
      scaleX: 0.57,
      scaleY: 0.44,
      duration: 35,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: cb,
    });
  }

  // ── Walk helpers ─────────────────────────────────────────────────────────────

  private startWalking() {
    this.stopIdleBob();
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

  // ── Public movement API ──────────────────────────────────────────────────────

  walkWordOnFromRight(
    card: Phaser.GameObjects.Container,
    targetX: number,
    cardY: number,
    crowY: number,
    onDone: () => void
  ) {
    const cam = this.scene.cameras.main;
    const crowOffset = 90;
    this.crow.setVisible(true);
    this.crow.setDepth(9);
    this.crow.setFacing('left');
    this.crow.setPosition(cam.width + 100, crowY);
    card.setVisible(true);
    card.setPosition(cam.width + 100 - crowOffset, cardY);
    this.startWalking();
    this.scene.tweens.add({
      targets: this.crow,
      x: targetX + crowOffset,
      y: crowY,
      duration: 1200,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        this.advanceWalkAnimation(16);
        card.x = this.crow.x - crowOffset;
        card.y = cardY;
      },
      onComplete: () => {
        this.crow.setX(targetX + crowOffset);
        this.crow.setY(crowY);
        card.setX(targetX);
        card.setY(cardY);
        this.crow.setIdle();
        this.startIdleBob();
        if (onDone) onDone();
      },
    });
  }

  carryCardInFromLeft(
    card: Phaser.GameObjects.Container,
    cardCX: number,
    cardCY: number,
    onDone?: () => void
  ) {
    const cam = this.scene.cameras.main;
    // Crow's right edge touches card's left edge:
    // card half-width (150) + crow half-width at scale 0.5 (50) = 200px offset
    const crowOffset = 200; // card is 200px to crow's right
    const dropX = cardCX - crowOffset; // crow x when card reaches center

    // Crow y: sit just below the card
    const crowY = cardCY + 80;

    this.crow.setVisible(true);
    this.crow.setDepth(9);
    this.crow.setFacing('right');
    this.crow.setPosition(-400, crowY);
    card.setVisible(true);
    card.setPosition(-400 + crowOffset, cardCY);

    this.startWalking();

    this.scene.tweens.add({
      targets: this.crow,
      x: dropX,
      duration: 1400,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        this.advanceWalkAnimation(16);
        card.x = this.crow.x + crowOffset;
      },
      onComplete: () => {
        card.x = cardCX;

        // Card is placed — fire callback immediately so audio can start
        if (onDone) onDone();

        // Crow walks away to idle position (bottom-right), drifting down to groundY
        this.scene.tweens.add({
          targets: this.crow,
          x: cam.width - 100,
          y: this.groundY,
          duration: 1800,
          ease: 'Sine.easeOut',
          onUpdate: () => { this.advanceWalkAnimation(16); },
          onComplete: () => {
            this.crow.setFacing('left');
            this.crow.setIdle();
            this.startIdleBob();
          },
        });
      },
    });
  }

  playReEnterFromRightWithCallback(onDone?: () => void) {
    const cam = this.scene.cameras.main;
    this.crow.setVisible(true);
    this.crow.setDepth(9);
    this.crow.setFacing('left');
    this.crow.setPosition(cam.width + 100, this.groundY);
    this.startWalking();
    this.scene.tweens.add({
      targets: this.crow,
      x: cam.width - 100,
      y: this.groundY,
      duration: 3000,
      ease: 'Sine.easeOut',
      onUpdate: () => { this.advanceWalkAnimation(16); },
      onComplete: () => {
        this.crow.setIdle();
        this.startIdleBob();
        if (onDone) onDone();
      },
    });
  }

  public playReEnterFromRight() {
    const cam = this.scene.cameras.main;
    this.crow.setVisible(true);
    this.crow.setDepth(9);
    this.crow.setFacing('left');
    this.crow.setPosition(cam.width + 100, this.groundY);
    this.startWalking();
    this.scene.tweens.add({
      targets: this.crow,
      x: cam.width - 100,
      y: this.groundY,
      duration: 3000,
      ease: 'Sine.easeOut',
      onUpdate: () => { this.advanceWalkAnimation(16); },
      onComplete: () => {
        this.crow.setIdle();
        this.startIdleBob();
      },
    });
  }

  public playIntroWalkIn() {
    const cam = this.scene.cameras.main;
    this.crow.setVisible(true);
    this.crow.setDepth(9);
    this.crow.setFacing('right');
    this.crow.setPosition(-100, this.groundY);
    this.startWalking();
    this.scene.tweens.add({
      targets: this.crow,
      x: cam.width - 100,
      y: this.groundY,
      duration: 3000,
      ease: 'Sine.easeOut',
      onUpdate: () => { this.advanceWalkAnimation(16); },
      onComplete: () => {
        this.crow.setFacing('left');
        this.crow.setIdle();
        this.startIdleBob();
      },
    });
  }

  hop(onDone?: () => void) {
    if (!this.crow.visible) {
      if (onDone) onDone();
      return;
    }
    this.stopIdleBob();

    this.scene.tweens.add({
      targets: this.crow,
      y: '-=25',
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.squishOnLand(() => {
          this.scene.tweens.add({
            targets: this.crow,
            y: '-=25',
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => {
              this.squishOnLand(() => {
                if (onDone) onDone();
              });
            },
          });
        });
      },
    });
  }

  shake(onDone?: () => void) {
    if (!this.crow.visible) {
      onDone?.();
      return;
    }
    this.stopIdleBob();
    this.scene.time.delayedCall(300, () => {
      this.crow.setFrame(5);
      this.scene.time.delayedCall(1000, () => {
        this.crow.setIdle();
        this.startIdleBob();
        onDone?.();
      });
    });
  }

  hopTo(x: number, y: number, onDone?: () => void) {
    this.stopIdleBob();
    const cam = this.scene.cameras.main;
    const idleX = cam.width - 100;
    const idleY = this.groundY;
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
          if (x === idleX && y === idleY) this.crow.setFacing('left');
          this.crow.setIdle();
          this.startIdleBob();
          if (onDone) onDone();
        });
      },
    });
  }

  startHoppingInPlace() {
    if (this.hoppingInPlace) return;
    this.hoppingInPlace = true;
    this.crow.setFacing('left');
    const hopLoop = () => {
      if (!this.hoppingInPlace) return;
      this.hop(() => {
        if (this.hoppingInPlace) {
          this.scene.time.delayedCall(300, hopLoop);
        }
      });
    };
    hopLoop();
  }

  stopHoppingInPlace() {
    this.hoppingInPlace = false;
  }

  walkToLeftOfWordAndLook(wordX: number, wordY: number, onDone: () => void) {
    const targetX = wordX - 200; // crow right edge flush with card left edge
    const targetY = wordY + 80;  // sit just below card centre, matching carry-in posture
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
      onUpdate: () => { this.advanceWalkAnimation(16); },
      onComplete: () => {
        this.crow.setIdle();
        this.startIdleBob();
        onDone();
      },
    });
  }

  walkWordOffRight(card: Phaser.GameObjects.Container, onDone: () => void) {
    this.stopIdleBob();
    this.crow.setFacing('right');
    this.startWalking();
    this.scene.tweens.add({
      targets: [this.crow, card],
      x: '+=600',
      duration: 1200,
      ease: 'Quad.easeIn',
      onUpdate: () => { this.advanceWalkAnimation(16); },
      onComplete: () => {
        this.crow.setVisible(false);
        card.setVisible(false);
        onDone();
      },
    });
  }

  walkOffRightFast(targetX: number, y: number, onDone?: () => void) {
    this.stopIdleBob();
    this.crow.setFacing('right');
    this.startWalking();
    this.scene.tweens.add({
      targets: this.crow,
      x: targetX,
      y: y,
      duration: 350,
      ease: 'Quad.easeIn',
      onUpdate: () => { this.advanceWalkAnimation(16); },
      onComplete: () => {
        this.crow.setVisible(false);
        if (onDone) onDone();
      },
    });
  }

  stopPutzing() {
    this.scene.tweens.killTweensOf(this.crow);
    this.crow.setIdle();
  }

  // Deprecated — kept for potential future use
  startPutzing() {
    this.crow.setVisible(true);
    this.crow.setDepth(9);
    this.walkToRandomPoint();
  }

  private createPutzBounds() {
    const cam = this.scene.cameras.main;
    this.putzBounds = new Phaser.Geom.Rectangle(
      cam.width * 0.7,
      this.margin,
      cam.width * 0.3 - this.margin,
      cam.height - this.margin * 2
    );
  }

  private walkToRandomPoint() {
    if (!this.putzBounds) this.createPutzBounds();
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
        this.startIdleBob();
        this.scene.time.delayedCall(3000, () => this.walkToRandomPoint());
      },
    });
  }
}
