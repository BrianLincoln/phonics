import Phaser from 'phaser';
import { Companion } from './Companion';

export class CompanionController {
  private scene: Phaser.Scene;
  private companion: Companion;

  get groundY(): number {
    return this.scene.cameras.main.height * 0.82;
  }

  private margin = 30;
  private walkSpeed = 100;
  private walkAnimTimer = 0;
  private walkFrame: 1 | 2 | 3 = 1;

  private idleBobTimer?: Phaser.Time.TimerEvent;
  private idleBobActiveTween?: Phaser.Tweens.Tween;
  private hoppingInPlace = false;
  private putzBounds?: Phaser.Geom.Rectangle;

  constructor(scene: Phaser.Scene, companion: Companion) {
    this.scene = scene;
    this.companion = companion;
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
      const baseY = this.companion.y;
      this.idleBobActiveTween = this.scene.tweens.add({
        targets: this.companion,
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

  squishOnLand(cb: () => void) {
    this.scene.tweens.add({
      targets: this.companion,
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
    this.companion.setAnimalFrame(this.walkFrame);
  }

  private advanceWalkAnimation(deltaMs: number) {
    this.walkAnimTimer += deltaMs;
    if (this.walkAnimTimer >= 150) {
      this.walkFrame = this.walkFrame === 3 ? 1 : ((this.walkFrame + 1) as 1 | 2 | 3);
      this.companion.setAnimalFrame(this.walkFrame);
      this.walkAnimTimer = 0;
    }
  }

  // ── Public movement API ──────────────────────────────────────────────────────

  walkWordOnFromRight(
    card: Phaser.GameObjects.Container,
    targetX: number,
    cardY: number,
    onDone: () => void
  ) {
    const cam = this.scene.cameras.main;
    const companionOffset = 90;
    const companionY = Math.max(cardY + 80, cam.height * 0.65);
    this.companion.setVisible(true);
    this.companion.setDepth(9);
    this.companion.setFacing('left');
    this.companion.setPosition(cam.width + 100, companionY);
    card.setVisible(true);
    card.setPosition(cam.width + 100 - companionOffset, cardY);
    this.startWalking();
    this.scene.tweens.add({
      targets: this.companion,
      x: targetX + companionOffset,
      y: companionY,
      duration: 1200,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        this.advanceWalkAnimation(16);
        card.x = this.companion.x - companionOffset;
        card.y = cardY;
      },
      onComplete: () => {
        this.companion.setX(targetX + companionOffset);
        this.companion.setY(companionY);
        card.setX(targetX);
        card.setY(cardY);
        this.companion.setIdle();
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
    const companionOffset = 200;
    const dropX = cardCX - companionOffset;
    // Stay close to the card (pushing it), but never above the visual ground horizon.
    const companionY = Math.max(cardCY + 80, cam.height * 0.65);

    this.companion.setVisible(true);
    this.companion.setDepth(9);
    this.companion.setFacing('right');
    this.companion.setPosition(-400, companionY);
    card.setVisible(true);
    card.setPosition(-400 + companionOffset, cardCY);

    this.startWalking();

    this.scene.tweens.add({
      targets: this.companion,
      x: dropX,
      duration: 1400,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        this.advanceWalkAnimation(16);
        card.x = this.companion.x + companionOffset;
      },
      onComplete: () => {
        card.x = cardCX;

        if (onDone) onDone();

        this.scene.tweens.add({
          targets: this.companion,
          x: cam.width - 100,
          y: this.groundY,
          duration: 1800,
          ease: 'Sine.easeOut',
          onUpdate: () => { this.advanceWalkAnimation(16); },
          onComplete: () => {
            this.companion.setFacing('left');
            this.companion.setIdle();
            this.startIdleBob();
          },
        });
      },
    });
  }

  playReEnterFromRightWithCallback(onDone?: () => void) {
    const cam = this.scene.cameras.main;
    this.companion.setVisible(true);
    this.companion.setDepth(9);
    this.companion.setFacing('left');
    this.companion.setPosition(cam.width + 100, this.groundY);
    this.startWalking();
    this.scene.tweens.add({
      targets: this.companion,
      x: cam.width - 100,
      y: this.groundY,
      duration: 3000,
      ease: 'Sine.easeOut',
      onUpdate: () => { this.advanceWalkAnimation(16); },
      onComplete: () => {
        this.companion.setIdle();
        this.startIdleBob();
        if (onDone) onDone();
      },
    });
  }

  public playReEnterFromRight() {
    const cam = this.scene.cameras.main;
    this.companion.setVisible(true);
    this.companion.setDepth(9);
    this.companion.setFacing('left');
    this.companion.setPosition(cam.width + 100, this.groundY);
    this.startWalking();
    this.scene.tweens.add({
      targets: this.companion,
      x: cam.width - 100,
      y: this.groundY,
      duration: 3000,
      ease: 'Sine.easeOut',
      onUpdate: () => { this.advanceWalkAnimation(16); },
      onComplete: () => {
        this.companion.setIdle();
        this.startIdleBob();
      },
    });
  }

  public playIntroWalkIn() {
    this.walkInFromLeft();
  }

  public walkInFromLeft(onDone?: () => void) {
    const cam = this.scene.cameras.main;
    this.companion.setVisible(true);
    this.companion.setDepth(9);
    this.companion.setFacing('right');
    this.companion.setPosition(-100, this.groundY);
    this.startWalking();
    this.scene.tweens.add({
      targets: this.companion,
      x: cam.width - 100,
      y: this.groundY,
      duration: 3000,
      ease: 'Sine.easeOut',
      onUpdate: () => { this.advanceWalkAnimation(16); },
      onComplete: () => {
        this.companion.setFacing('left');
        this.companion.setIdle();
        this.startIdleBob();
        onDone?.();
      },
    });
  }

  hop(onDone?: () => void) {
    if (!this.companion.visible) {
      if (onDone) onDone();
      return;
    }
    this.stopIdleBob();

    this.scene.tweens.add({
      targets: this.companion,
      y: '-=25',
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.squishOnLand(() => {
          this.scene.tweens.add({
            targets: this.companion,
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
    if (!this.companion.visible) {
      onDone?.();
      return;
    }
    this.stopIdleBob();
    this.scene.time.delayedCall(300, () => {
      this.companion.setAnimalFrame(5);
      this.scene.time.delayedCall(1000, () => {
        this.companion.setIdle();
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
      this.companion.setFacing('left');
    } else {
      this.companion.setFacing(x >= this.companion.x ? 'right' : 'left');
    }
    this.scene.tweens.add({
      targets: this.companion,
      x,
      y,
      duration: 500,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.hop(() => {
          if (x === idleX && y === idleY) this.companion.setFacing('left');
          this.companion.setIdle();
          this.startIdleBob();
          if (onDone) onDone();
        });
      },
    });
  }

  startHoppingInPlace() {
    if (this.hoppingInPlace) return;
    this.hoppingInPlace = true;
    this.companion.setFacing('left');
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
    const targetX = wordX - 200;
    const targetY = wordY + 80;
    const dx = targetX - this.companion.x;
    this.companion.setVisible(true);
    this.companion.setDepth(9);
    this.companion.setFacing(dx >= 0 ? 'right' : 'left');
    this.startWalking();
    this.scene.tweens.add({
      targets: this.companion,
      x: targetX,
      y: targetY,
      duration: 900,
      ease: 'Sine.easeInOut',
      onUpdate: () => { this.advanceWalkAnimation(16); },
      onComplete: () => {
        this.companion.setIdle();
        this.startIdleBob();
        onDone();
      },
    });
  }

  walkWordOffRight(card: Phaser.GameObjects.Container, onDone: () => void) {
    const cam = this.scene.cameras.main;
    const companionOffset = 200;
    const targetCompanionX = cam.width + companionOffset + 80;
    this.stopIdleBob();
    this.companion.setFacing('right');
    this.startWalking();
    this.scene.tweens.add({
      targets: this.companion,
      x: targetCompanionX,
      duration: 1200,
      ease: 'Quad.easeIn',
      onUpdate: () => {
        this.advanceWalkAnimation(16);
        card.x = this.companion.x + companionOffset;
      },
      onComplete: () => {
        this.companion.setVisible(false);
        card.setVisible(false);
        onDone();
      },
    });
  }

  walkOffRightFast(targetX: number, y: number, onDone?: () => void) {
    this.stopIdleBob();
    this.companion.setFacing('right');
    this.startWalking();
    this.scene.tweens.add({
      targets: this.companion,
      x: targetX,
      y: y,
      duration: 350,
      ease: 'Quad.easeIn',
      onUpdate: () => { this.advanceWalkAnimation(16); },
      onComplete: () => {
        this.companion.setVisible(false);
        if (onDone) onDone();
      },
    });
  }

  quickWalkTo(x: number, y: number, speed: number, onDone?: () => void) {
    this.stopIdleBob();
    this.scene.tweens.killTweensOf(this.companion);
    const dx = x - this.companion.x;
    const distance = Math.abs(dx);
    if (distance < 5) { onDone?.(); return; }
    const duration = (distance / speed) * 1000;
    this.companion.setFacing(dx >= 0 ? 'right' : 'left');
    this.startWalking();
    this.scene.tweens.add({
      targets: this.companion,
      x, y,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: () => { this.advanceWalkAnimation(16); },
      onComplete: () => { this.companion.setIdle(); onDone?.(); },
    });
  }

  walkInDuration(x: number, y: number, duration: number, onDone?: () => void) {
    this.stopIdleBob();
    this.scene.tweens.killTweensOf(this.companion);
    const dx = x - this.companion.x;
    if (Math.abs(dx) < 2) { this.squishOnLand(() => onDone?.()); return; }
    this.companion.setFacing(dx >= 0 ? 'right' : 'left');
    this.startWalking();
    this.scene.tweens.add({
      targets: this.companion,
      x, y,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: () => { this.advanceWalkAnimation(16); },
      onComplete: () => { this.companion.setIdle(); this.squishOnLand(() => onDone?.()); },
    });
  }

  playMischiefFlap(onDone?: () => void) {
    this.stopIdleBob();
    this.scene.tweens.killTweensOf(this.companion);

    const cam = this.scene.cameras.main;
    const idleX = cam.width - 100;
    if (!this.companion.visible || Math.abs(this.companion.x - idleX) > cam.width * 0.25) {
      this.companion.setPosition(idleX, this.groundY);
    }
    this.companion.setVisible(true);
    this.companion.setFacing('left');
    this.companion.setDepth(9);

    const flapSeq: Array<1 | 2 | 3> = [1, 2, 3, 2, 1, 2, 3, 2, 1, 2];
    let flapIdx = 0;
    const frameTimer = this.scene.time.addEvent({
      delay: 65,
      repeat: flapSeq.length - 1,
      callback: () => {
        this.companion.setAnimalFrame(flapSeq[flapIdx % flapSeq.length]);
        flapIdx++;
      },
    });

    this.scene.tweens.add({
      targets: this.companion,
      y: '-=20',
      duration: 80,
      yoyo: true,
      repeat: 3,
      ease: 'Quad.easeOut',
      onComplete: () => {
        frameTimer.remove();
        this.companion.setIdle();
        this.startIdleBob();
        onDone?.();
      },
    });
  }

  stopPutzing() {
    this.scene.tweens.killTweensOf(this.companion);
    this.companion.setIdle();
  }

  // Deprecated — kept for potential future use
  startPutzing() {
    this.companion.setVisible(true);
    this.companion.setDepth(9);
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
    const dx = tx - this.companion.x;
    const dy = ty - this.companion.y;
    const distance = Math.hypot(dx, dy);
    const duration = (distance / this.walkSpeed) * 1000;
    this.companion.setFacing(dx >= 0 ? 'right' : 'left');
    this.startWalking();
    this.scene.tweens.add({
      targets: this.companion,
      x: tx,
      y: ty,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: () => this.advanceWalkAnimation(16),
      onComplete: () => {
        this.companion.setIdle();
        this.startIdleBob();
        this.scene.time.delayedCall(3000, () => this.walkToRandomPoint());
      },
    });
  }
}
