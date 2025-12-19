import Phaser from 'phaser';

export default class CrowDemoScene extends Phaser.Scene {
  private crowWalkSpeed: number = 200;
  private crow!: Phaser.GameObjects.Sprite;
  private shiny!: Phaser.GameObjects.Sprite;
  private shinyAnimTimer: number = 0;
  private shinyFrame: number = 0;
  private sparkleCount: number = 0;
  private sparkleCounterText!: Phaser.GameObjects.Text;
  private crowFlipOffset: number = 50; // px to offset when flipped (adjust as needed)
  private mmmSound?: Phaser.Sound.BaseSound;
  private targetX: number | null = null;
  private targetY: number | null = null;
  private isWalking: boolean = false;
  private walkAnimTimer: number = 0;
  private walkFrame: number = 1;
  private lastDirection: 'left' | 'right' = 'left';
  private talkTimeout?: number;
  private speechBubble?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'CrowDemoScene' });
  }

  preload() {
    this.load.spritesheet('crow', 'public/crow_sprite.png', {
      frameWidth: 200,
      frameHeight: 200,
    });
    this.load.spritesheet('shiny', 'public/shiny_sprite.png', {
      frameWidth: 50,
      frameHeight: 50,
    });
    this.load.audio('mmm', 'public/audio/sounds/mmm.wav');
  }

  create() {
    this.cameras.main.setBackgroundColor('#e8f4fa');
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    // Crow starts at bottom left
    this.crow = this.add.sprite(60, this.cameras.main.height - 20, 'crow', 0);
    this.crow.setOrigin(0.5, 1);

    // Sparkle counter (top right)
    this.sparkleCounterText = this.add.text(this.cameras.main.width - 40, 32, '0 ✨', {
      fontSize: '32px',
      color: '#f5a623',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#fff',
      strokeThickness: 2,
      shadow: {
        offsetX: 0,
        offsetY: 2,
        color: '#bbb',
        blur: 4,
        fill: true
      }
    }).setOrigin(1, 0);

    // Add shiny sprite, stationary for now
    this.shiny = this.add.sprite(centerX + 200, centerY, 'shiny', 0);
    this.shiny.setOrigin(0.5, 1);
    this.shiny.setInteractive({ useHandCursor: true });
    this.shiny.on('pointerover', () => {
      this.input.setDefaultCursor('pointer');
    });
    this.shiny.on('pointerout', () => {
      this.input.setDefaultCursor('default');
    });
    this.shiny.on('pointerdown', () => {
      // Animate sparkle to counter
      const endX = this.cameras.main.width - 60;
      const endY = 56;
      this.tweens.add({
        targets: this.shiny,
        x: endX,
        y: endY,
        scale: 0.3,
        duration: 400,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          this.shiny.setVisible(false);
          this.sparkleCount++;
          this.sparkleCounterText.setText(this.sparkleCount + ' ✨');
        }
      });
    });
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
    backBtn.on('pointerover', () => {
      this.input.setDefaultCursor('pointer');
    });
    backBtn.on('pointerout', () => {
      this.input.setDefaultCursor('default');
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
    phonemeBtn.on('pointerover', () => {
      this.input.setDefaultCursor('pointer');
    });
    phonemeBtn.on('pointerout', () => {
      this.input.setDefaultCursor('default');
    });

    // Crow walks to bottom center, then triggers speech bubble sequence
    this.targetX = centerX;
    this.targetY = this.cameras.main.height * 0.5;
    this.isWalking = true;
    this.walkAnimTimer = 0;
    this.walkFrame = 1;
    this.crowWalkSpeed = 400; // px/sec, faster walk
    const afterWalk = () => {
      this.showSpeechBubble('Hello!', () => {
        this.showSpeechBubble('Will you help me collect shinies?');
      });
    };
    // Wait until crow arrives, then show bubble
    const checkArrival = () => {
      if (this.isWalking) {
        this.time.delayedCall(50, checkArrival);
      } else {
        this.crow.setFrame(0);
        this.crow.setFlipX(false);
        afterWalk();
      }
    };
    checkArrival();

    // Click to move crow
    // Crow is locked for the entire scene
    this.input.on('pointerdown', () => {
      return;
    });

    // Clean up speech bubble if present
    this.events.on('shutdown', () => {
      if (this.speechBubble) this.speechBubble.destroy();
    });

  }

  // Speech bubble routine with callback
  showSpeechBubble(text: string, onComplete?: () => void) {
    this.createSpeechBubble(text, onComplete);
  }

  createSpeechBubble(text: string, onComplete?: () => void) {
    if (this.speechBubble) this.speechBubble.destroy();
    // Bubble base
    const bubbleWidth = 260;
    const bubbleHeight = 80;
    // Place bubble well above crow's head, tail points to mouth (left side of head)
    const crowMouthOffsetX = 0; // nudge farther left
    const bubbleX = this.crow.x - bubbleWidth / 2 + crowMouthOffsetX;
    const bubbleY = this.crow.y - 300; // nudge higher
    const bubble = this.add.container(bubbleX, bubbleY);
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.lineStyle(2, 0x222222, 1);
    // Draw bubble and tail as one path for seamless border
    graphics.beginPath();
    // Start at top left corner after radius
    graphics.moveTo(18, 0);
    // Top edge
    graphics.lineTo(bubbleWidth - 18, 0);
    // Top-right corner
    graphics.arc(bubbleWidth - 18, 18, 18, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(360), false);
    // Right edge
    graphics.lineTo(bubbleWidth, bubbleHeight - 18);
    // Bottom-right corner
    graphics.arc(bubbleWidth - 18, bubbleHeight - 18, 18, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(90), false);
    // Bottom edge to tail
    const tailBaseX = 36;
    graphics.lineTo(tailBaseX + 24, bubbleHeight);
    graphics.lineTo(tailBaseX + 12, bubbleHeight + 24); // tip of tail
    graphics.lineTo(tailBaseX, bubbleHeight);
    // Continue bottom edge
    graphics.lineTo(18, bubbleHeight);
    // Bottom-left corner
    graphics.arc(18, bubbleHeight - 18, 18, Phaser.Math.DegToRad(90), Phaser.Math.DegToRad(180), false);
    // Left edge
    graphics.lineTo(0, 18);
    // Top-left corner
    graphics.arc(18, 18, 18, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(270), false);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    bubble.add(graphics);
    // Text
    const txt = this.add.text(bubbleWidth / 2, bubbleHeight / 2, text, {
      fontSize: '24px',
      color: '#222',
      wordWrap: { width: bubbleWidth - 24 },
      align: 'center',
    }).setOrigin(0.5);
    bubble.add(txt);
    this.speechBubble = bubble;
    // Dismiss after 2 seconds
    this.time.delayedCall(2000, () => {
      if (this.speechBubble) this.speechBubble.destroy();
      if (onComplete) onComplete();
    });
  }


  update(_time: number, delta: number) {
    // Animate shiny sprite: cycle through 4 frames quickly
    if (this.shiny) {
      this.shinyAnimTimer += delta;
      if (this.shinyAnimTimer > 80) { // ~12.5 fps
        this.shinyFrame = (this.shinyFrame + 1) % 4;
        this.shiny.setFrame(this.shinyFrame);
        this.shinyAnimTimer = 0;
      }
    }
    if (this.isWalking && this.targetX !== null && this.targetY !== null) {
      const speed = (this.crowWalkSpeed || 200) * (delta / 1000); // px/sec
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
