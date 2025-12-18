import Phaser from 'phaser';

export default class CrowDemoScene extends Phaser.Scene {
  private crow!: Phaser.GameObjects.Sprite;
  private crowFlipOffset: number = 50; // px to offset when flipped (adjust as needed)
  private mmmSound?: Phaser.Sound.BaseSound;
  private targetX: number | null = null;
  private targetY: number | null = null;
  private isWalking: boolean = false;
  private walkAnimTimer: number = 0;
  private walkFrame: number = 1;
  private lastDirection: 'left' | 'right' = 'left';
  private talkTimeout?: number;

  constructor() {
    super({ key: 'CrowDemoScene' });
  }

  preload() {
    this.load.spritesheet('crow', 'public/crow_sprite.png', {
      frameWidth: 200,
      frameHeight: 200,
    });
    this.load.audio('mmm', 'public/audio/sounds/mmm.wav');
  }

  create() {
    this.cameras.main.setBackgroundColor('#e8f4fa');
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    this.crow = this.add.sprite(centerX, centerY, 'crow', 0);
    this.crow.setOrigin(0.5, 1);
    this.mmmSound = this.sound.add('mmm');

    // Back button
    const backBtn = this.add.text(centerX, 40, 'Back', {
      fontSize: '28px',
      color: '#007acc',
      backgroundColor: '#eee',
      padding: { left: 16, right: 16, top: 8, bottom: 8 },
    }).setOrigin(0.5).setInteractive();
    backBtn.on('pointerdown', () => {
      this.scene.start('QuizIndex');
    });

    // Phoneme button
    const phonemeBtn = this.add.text(centerX, 80, 'Say "mmm"', {
      fontSize: '28px',
      color: '#fff',
      backgroundColor: '#4a90e2',
      padding: { left: 16, right: 16, top: 8, bottom: 8 },
    }).setOrigin(0.5).setInteractive();
    phonemeBtn.on('pointerdown', () => {
      this.crow.setFrame(4); // talking frame (new index)
      if (this.mmmSound) {
        this.mmmSound.play();
      }
      if (this.talkTimeout) clearTimeout(this.talkTimeout);
      this.talkTimeout = window.setTimeout(() => {
        this.crow.setFrame(0); // idle
      }, 700);
    });

    // Click to move crow
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Ignore clicks on buttons
      if (pointer.y < 120) return;
      this.targetX = pointer.x;
      this.targetY = pointer.y;
      this.isWalking = true;
      this.walkAnimTimer = 0;
      this.walkFrame = 1;
    });
  }

  update(time: number, delta: number) {
    if (this.isWalking && this.targetX !== null && this.targetY !== null) {
      const speed = 200 * (delta / 1000); // px/sec
      const dx = this.targetX - this.crow.x;
      const dy = this.targetY - this.crow.y;
      // Flip sprite based on direction and compensate for left-aligned frames
      if (dx > 0) {
        if (!this.crow.flipX) {
          this.crow.setFlipX(true);
          this.crow.x -= this.crowFlipOffset;
        }
        this.lastDirection = 'right';
      } else if (dx < 0) {
        if (this.crow.flipX) {
          this.crow.setFlipX(false);
          this.crow.x += this.crowFlipOffset;
        }
        this.lastDirection = 'left';
      }
      // Move crow towards target
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 5) {
        const moveX = (dx / dist) * Math.min(dist, speed);
        const moveY = (dy / dist) * Math.min(dist, speed);
        this.crow.x += moveX;
        this.crow.y += moveY;
        // Animate walking frames
        this.walkAnimTimer += delta;
        if (this.walkAnimTimer > 150) {
          // Cycle through walking frames 1,2,3 (indices 1,2,3)
          this.walkFrame = this.walkFrame === 3 ? 1 : this.walkFrame + 1;
          this.crow.setFrame(this.walkFrame);
          this.walkAnimTimer = 0;
        }
      } else {
        this.crow.x = this.targetX;
        this.crow.y = this.targetY;
        this.isWalking = false;
        this.targetX = null;
        this.targetY = null;
        this.crow.setFrame(0); // idle
        // Keep crow facing last direction
        if (this.lastDirection === 'right' && !this.crow.flipX) {
          this.crow.setFlipX(true);
          this.crow.x -= this.crowFlipOffset;
        } else if (this.lastDirection === 'left' && this.crow.flipX) {
          this.crow.setFlipX(false);
          this.crow.x += this.crowFlipOffset;
        }
      }
    }
  }
}
