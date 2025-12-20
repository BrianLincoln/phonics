import Phaser from 'phaser';
import { createButton } from '../helpers/createButton';
import { SpeechBubble } from '../helpers/SpeechBubble';
import { Crow } from '../entities/Crow';
import { Shiny } from '../entities/Shiny';
import * as CONST from '../config/constants';


export default class CrowDemoScene extends Phaser.Scene {
  private crow!: Crow;
  private shiny!: Shiny;
  private sparkleCount: number = 0;
  private sparkleCounterText!: Phaser.GameObjects.Text;
  private mmmSound?: Phaser.Sound.BaseSound;
  private targetX: number | null = null;
  private targetY: number | null = null;
  private isWalking: boolean = false;
  private walkAnimTimer: number = 0;
  private walkFrame: number = 1;
  private lastDirection: 'left' | 'right' = 'left';
  private talkTimeout?: number;
  private speechBubble?: SpeechBubble;

  constructor() {
    super({ key: 'CrowDemoScene' });
  }


  preload() {
    this.load.spritesheet('crow', '/crow_sprite.png', {
      frameWidth: 200,
      frameHeight: 200,
    });
    this.load.spritesheet('shiny', '/shiny_sprite.png', {
      frameWidth: 50,
      frameHeight: 50,
    });
    this.load.audio('mmm', '/audio/sounds/mmm.wav');
  }

  create() {
    this.cameras.main.setBackgroundColor('#e8f4fa');
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    // Crow starts at bottom left
    this.crow = new Crow({
      scene: this,
      x: 60,
      y: this.cameras.main.height - 20,
      flipOffset: CONST.CROW_FLIP_OFFSET
    });

    // Sparkle counter (top right)
    this.sparkleCounterText = this.add.text(
      this.cameras.main.width - CONST.SPARKLE_COUNTER_X_OFFSET,
      CONST.SPARKLE_COUNTER_Y,
      '0 ✨',
      {
        fontSize: CONST.SPARKLE_COUNTER_FONT,
        color: CONST.SPARKLE_COUNTER_COLOR,
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
      }
    ).setOrigin(1, 0);

    // Add shiny sprite, stationary for now
    this.shiny = new Shiny({
      scene: this,
      x: centerX + 200,
      y: centerY,
      onCollect: () => {
        // Animate sparkle to counter
        const endX = this.cameras.main.width - 60;
        const endY = 56;
        this.tweens.add({
          targets: this.shiny,
          x: endX,
          y: endY,
          scale: CONST.SHINY_COLLECT_SCALE,
          duration: CONST.SHINY_COLLECT_DURATION,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            this.shiny.setVisible(false);
            this.sparkleCount++;
            this.sparkleCounterText.setText(this.sparkleCount + ' ✨');
          }
        });
      }
    });
    this.mmmSound = this.sound.add('mmm');


    // Back button
    createButton({
      scene: this,
      x: centerX,
      y: 40,
      width: 160,
      height: 48,
      label: 'Back',
      onClick: () => {
        if (this.sound) this.sound.stopAll();
        this.scene.start('Menu');
      }
    });

    // Phoneme button
    createButton({
      scene: this,
      x: centerX,
      y: 100,
      width: 200,
      height: 48,
      label: 'Say "mmm"',
      onClick: () => {
        this.crow.setTalking();
        if (this.mmmSound) {
          this.mmmSound.play();
        }
        if (this.talkTimeout) clearTimeout(this.talkTimeout);
        this.talkTimeout = window.setTimeout(() => {
          this.crow.setIdle();
        }, 700);
      }
    });

    // Crow walks to bottom center, then triggers speech bubble sequence
    this.targetX = centerX;
    this.targetY = this.cameras.main.height * 0.5;
    this.isWalking = true;
    this.walkAnimTimer = 0;
    this.walkFrame = 1;
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
        this.crow.setIdle();
        this.crow.setFlipX(false);
        afterWalk();
      }
    };
    checkArrival();


    // Crow is locked for the entire scene (no-op pointerdown)
    this.input.on('pointerdown', () => { });


    // Clean up speech bubble if present
    this.events.on('shutdown', () => {
      if (this.speechBubble) this.speechBubble.destroy();
    });

  }

  // Speech bubble routine with callback
  showSpeechBubble(text: string, onComplete?: () => void) {
    if (this.speechBubble) this.speechBubble.destroy();
    // Place bubble above crow's head
    const bubbleX = this.crow.x - CONST.BUBBLE_WIDTH / 2;
    const bubbleY = this.crow.y - 300;
    this.speechBubble = new SpeechBubble({
      scene: this,
      x: bubbleX,
      y: bubbleY,
      width: CONST.BUBBLE_WIDTH,
      height: CONST.BUBBLE_HEIGHT,
      text,
      duration: CONST.BUBBLE_DURATION,
      onComplete
    });
  }


  update(_time: number, delta: number) {
    // Animate shiny sprite
    if (this.shiny) {
      this.shiny.animate(delta);
    }
    if (this.isWalking && this.targetX !== null && this.targetY !== null) {
      const speed = CONST.CROW_WALK_SPEED * (delta / 1000);
      const dx = this.targetX - this.crow.x;
      const dy = this.targetY - this.crow.y;
      // Flip sprite based on direction and compensate for left-aligned frames
      if (dx > 0) {
        if (!this.crow.flipX) {
          this.crow.setFlipX(true);
          this.crow.x -= CONST.CROW_FLIP_OFFSET;
        }
        this.lastDirection = 'right';
      } else if (dx < 0) {
        if (this.crow.flipX) {
          this.crow.setFlipX(false);
          this.crow.x += CONST.CROW_FLIP_OFFSET;
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
        this.crow.setIdle();
        // Keep crow facing last direction
        if (this.lastDirection === 'right' && !this.crow.flipX) {
          this.crow.setFlipX(true);
          this.crow.x -= CONST.CROW_FLIP_OFFSET;
        } else if (this.lastDirection === 'left' && this.crow.flipX) {
          this.crow.setFlipX(false);
          this.crow.x += CONST.CROW_FLIP_OFFSET;
        }
      }
    }
  }

  shutdown() {
    if (this.sound) this.sound.stopAll();
  }
}
