/**
 * Generates a 'leaf' texture using Phaser.GameObjects.Graphics.
 * The texture is 64x64, filled green, with a pointed top and optional center vein.
 * @param scene The Phaser.Scene to generate the texture in.
 */
export function createLeafTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists('leaf')) return;

  const g = scene.add.graphics();

  g.fillStyle(0x4f9a3d, 1);
  g.lineStyle(1.5, 0x2f5f2a, 0.8);

  const path = new Phaser.Curves.Path(32, 2);

  // right side (sharper tip, wider lower body)
  path.quadraticBezierTo(56, 14, 50, 34);
  path.quadraticBezierTo(44, 54, 32, 62);

  // left side (slightly different for asymmetry)
  path.quadraticBezierTo(18, 54, 14, 36);
  path.quadraticBezierTo(8, 16, 32, 2);

  path.closePath();

  path.draw(g);
  g.fillPath();
  g.strokePath();

  // vein (slightly curved, not straight)
  g.lineStyle(1, 0x2f5f2a, 0.6);
  const vein = new Phaser.Curves.Path(32, 6);
  vein.quadraticBezierTo(30, 34, 32, 58);
  vein.draw(g);

  g.generateTexture('leaf', 64, 64);
  g.destroy();
}

import Phaser from 'phaser';
import { playQuizAudioSequence } from '../helpers/quizAudioOrchestrator';
import { ActivityType, LeafParadeActivityType } from '../data/activities';
import { antSprite, leafSprite } from '../assets/spriteUrls';

export interface LeafParadeSceneData {
  activity: LeafParadeActivityType;
  playAudio: (src: string, waitForEnd?: boolean) => Promise<any>;
  onQuestionComplete?: () => void;
}

export class AntLeafScene extends Phaser.Scene {
  private sceneData!: LeafParadeSceneData;
  marchingAnts: Phaser.GameObjects.Container[] = [];
  antLeafGroups: Phaser.GameObjects.Container[] = [];
  frameWidth: number = 100;
  antSpacing: number = 100;
  antStartX: number = 0;
  antEndX: number = 0;
  antSpeed: number = 60;
  targetLetter: string = '';
  distractorLetters: string[] = [];
  sinceLastCorrect: number = 0;
  promptFile: string = '';
  phonemeFile: string = '';
  playAudio!: (src: string, waitForEnd?: boolean) => Promise<any>;
  feedbackMarks: { mark: Phaser.GameObjects.Text; x: number; y: number }[] = [];
  correctCount: number = 0;
  numberToComplete: number = 5;
  questionComplete: boolean = false;

  constructor() {
    super('AntLeafScene');
  }

  preload() {
    // Load ant sprite (3 frames, 100x100px) only if not already loaded
    if (!this.textures.exists('ant')) {
      this.load.spritesheet('ant', antSprite, {
        frameWidth: 100,
        frameHeight: 100,
      });
    }
    // Load leaf image only if not already loaded
    if (!this.textures.exists('leaf')) {
      this.load.image('leaf', leafSprite);
    }
  }

  // Receive data from React via game.scene.start(sceneKey, data)
  init(data: LeafParadeSceneData) {
    this.sceneData = data;
    if (data && typeof data.playAudio === 'function') {
      this.playAudio = data.playAudio;
    }
    if (data && typeof data.onQuestionComplete === 'function') {
      (this.sceneData as any).onQuestionComplete = data.onQuestionComplete;
    }
  }

  create() {
    const { activity } = this.sceneData;

    this.targetLetter = activity.targetLetter;
    this.promptFile = activity.promptFile || '';
    this.phonemeFile = activity.phonemeFile || '';
    this.correctCount = 0;
    this.questionComplete = false;
    if ('numberToComplete' in activity && typeof activity.numberToComplete === 'number') {
      this.numberToComplete = activity.numberToComplete;
    } else {
      throw new Error('LeafParadeActivity requires numberToComplete');
    }
    // Remove all listeners and re-add for robust communication
    this.events.removeAllListeners('question-complete');
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.cameras.main.setBackgroundColor('#e0f7fa');
    this.cameras.main.setRoundPixels(true);

    // Use distractorLetters from activity if present, else default
    if ('distractorLetters' in activity && Array.isArray((activity as any).distractorLetters) && (activity as any).distractorLetters.length > 0) {
      this.distractorLetters = (activity as any).distractorLetters.map((l: string) => l.toLowerCase()).filter((l: string) => l !== this.targetLetter);
    } else {
      this.distractorLetters = Array.from('abcdefghijklmnopqrstuvwxyz').filter(l => l !== this.targetLetter);
    }
    this.antLeafGroups = [];

    // --- Marching Ants ---
    const antCount = 8;
    this.antEndX = w + this.antSpacing;
    const antY = h * 0.7;
    if (!this.anims.exists('ant-walk')) {
      this.anims.create({
        key: 'ant-walk',
        frames: this.anims.generateFrameNumbers('ant', { start: 0, end: 2 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    this.marchingAnts = [];
    for (let i = 0; i < antCount; i++) {
      const group = this.createAntLeafGroup(this.sceneData);
      group.x = this.antStartX - i * this.antSpacing;
      group.y = antY;
      this.add.existing(group);
      this.marchingAnts.push(group);
      this.antLeafGroups.push(group);
    }
  }
  /**
   * Creates an ant+leaf+letter group with the correct click handler logic.
   */
  createAntLeafGroup(data: any): Phaser.GameObjects.Container {
    const group = this.add.container();
    const ant = this.add.sprite(0, 0, 'ant', 0);
    ant.setScale(0.7);
    ant.setDepth(2);
    ant.play('ant-walk');
    const leaf = this.add.image(0, -40, 'leaf');
    leaf.setDisplaySize(75, 75);
    leaf.setDepth(1);
    const letterChar = this.getNextAntLetter();
    const letter = this.add.text(0, -40, letterChar, {
      fontFamily: 'Arial',
      fontSize: '40px',
      color: '#fff',
      fontStyle: 'bold',
      align: 'center',
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000',
        blur: 2,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);
    letter.setDepth(3);
    // Add click handler for letter with padded hit area
    const padding = 32;
    letter.setInteractive(new Phaser.Geom.Rectangle(
      -letter.displayWidth / 2 - padding,
      -letter.displayHeight / 2 - padding,
      letter.displayWidth + padding * 2,
      letter.displayHeight + padding * 2
    ), Phaser.Geom.Rectangle.Contains);
    letter.input.cursor = 'pointer';
    letter.on('pointerdown', async () => {
      if (!this.playAudio) return;
      // Try to play phoneme file for this letter if it exists
      const phonemePath = `/audio/phonics-units/${letter.text}-sound.wav`;
      let phonemePlayed = false;
      try {
        await this.playAudio(phonemePath, true);
        phonemePlayed = true;
      } catch (e) {
        // File may not exist, ignore
      }
      // Play correct/incorrect sound AND animate transition at the same time
      const isCorrect = letter.text === this.targetLetter;
      if (this.questionComplete) return;
      if (isCorrect) {
        this.correctCount++;
        if (this.correctCount >= this.numberToComplete) {
          this.questionComplete = true;
          // Notify parent/bridge via event and callback
          this.events.emit('question-complete');
          if (typeof (data as any).onQuestionComplete === 'function') {
            (data as any).onQuestionComplete();
          }
        }
      }
      const feedbackPath = isCorrect ? '/audio/system/correct.wav' : '/audio/system/incorrect.wav';
      this.playAudio(feedbackPath, true).catch(() => { }); // fire and forget
      this.tweens.add({
        targets: group,
        scale: 0,
        alpha: 0,
        duration: 120,
        ease: 'Back.easeIn',
        onComplete: () => {
          group.removeAll(true);
          // Draw feedback mark (✓ or ✗) as text and animate it in
          const mark = this.add.text(
            group.x,
            group.y - 20,
            isCorrect ? '✓' : 'x',
            {
              fontFamily: 'Arial',
              fontSize: '64px',
              fontStyle: 'bold',
              color: isCorrect ? '#50bc37' : '#e74c3c',
              align: 'center',
              stroke: '#000',
              strokeThickness: 2,
            }
          ).setOrigin(0.5);
          mark.setDepth(10);
          mark.setScale(0.5);
          mark.setAlpha(0);
          this.add.existing(mark);
          this.tweens.add({
            targets: mark,
            scale: 1,
            alpha: 1,
            duration: 120,
            ease: 'Back.easeOut',
            onComplete: () => {
              // Track the mark for animation
              this.feedbackMarks.push({ mark, x: group.x, y: group.y - 20 });
            }
          });
        }
      });
    });
    group.add([leaf, ant, letter]);
    return group;



    // Play audio sequence only if explicitly requested
    if (data.playIntroAudio && this.playAudio && (this.promptFile || this.phonemeFile)) {
      playQuizAudioSequence({
        promptFile: this.promptFile,
        phonemeFile: this.phonemeFile,
        playAudio: this.playAudio,
      });
    }
  }
  update(time: number, delta: number) {
    // Move all ant+leaf+letter containers
    if (this.marchingAnts && this.marchingAnts.length > 0) {
      for (let i = 0; i < this.marchingAnts.length; i++) {
        this.marchingAnts[i].x += (this.antSpeed * delta) / 1000;
      }
      // Reset containers that go off screen to just before the leftmost, preserving spacing
      for (let i = 0; i < this.marchingAnts.length; i++) {
        if (this.marchingAnts[i].x > this.antEndX) {
          // Find leftmost
          let leftmost = this.marchingAnts[0];
          for (let j = 1; j < this.marchingAnts.length; j++) {
            if (this.marchingAnts[j].x < leftmost.x) leftmost = this.marchingAnts[j];
          }
          this.marchingAnts[i].x = leftmost.x - this.antSpacing;
          // Re-assign letter on reset
          const group = this.marchingAnts[i];
          const letterText = group.list.find(obj => obj instanceof Phaser.GameObjects.Text) as Phaser.GameObjects.Text;
          if (letterText && typeof this.getNextAntLetter === 'function') {
            letterText.setText(this.getNextAntLetter());
          }
        }
      }
    }

    // Animate feedback marks (X/check) rightward, and reset with new ant+leaf+letter
    if (this.feedbackMarks && this.feedbackMarks.length > 0) {
      for (let i = this.feedbackMarks.length - 1; i >= 0; i--) {
        const markObj = this.feedbackMarks[i];
        markObj.x += (this.antSpeed * delta) / 1000;
        markObj.mark.setPosition(markObj.x, markObj.y);
        if (markObj.x > this.antEndX) {
          // Remove mark
          markObj.mark.destroy();
          this.feedbackMarks.splice(i, 1);
          // Spawn new ant+leaf+letter group at leftmost position
          let leftmost = this.marchingAnts[0];
          for (let j = 1; j < this.marchingAnts.length; j++) {
            if (this.marchingAnts[j].x < leftmost.x) leftmost = this.marchingAnts[j];
          }
          const group = this.createAntLeafGroup(this.sceneData);
          group.x = leftmost.x - this.antSpacing;
          group.y = this.cameras.main.height * 0.7;
          this.add.existing(group);
          this.marchingAnts.push(group);
          this.antLeafGroups.push(group);
        }
      }
    }
  }
  /**
   * Returns the next letter for an ant, ensuring the correct letter appears every 2-5 ants.
   */
  getNextAntLetter(): string {
    // If we've gone 5 ants without a correct, force correct
    if (this.sinceLastCorrect >= 5) {
      this.sinceLastCorrect = 0;
      return this.targetLetter;
    }
    // If last correct was <2 ants ago, force distractor
    if (this.sinceLastCorrect < 2) {
      this.sinceLastCorrect++;
      return Phaser.Utils.Array.GetRandom(this.distractorLetters);
    }
    // Otherwise, random: 1 in 3 chance for correct
    if (Phaser.Math.Between(1, 3) === 1) {
      this.sinceLastCorrect = 0;
      return this.targetLetter;
    } else {
      this.sinceLastCorrect++;
      return Phaser.Utils.Array.GetRandom(this.distractorLetters);
    }
  }
}
