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

// Example usage (inside a Phaser.Scene):
// createLeafTexture(this);
// this.add.image(x, y, 'leaf');


import Phaser from 'phaser';
import { playQuizAudioSequence } from '../helpers/quizAudioOrchestrator';
import { QuizQuestion } from '../data/quizzes';


export class AntLeafScene extends Phaser.Scene {
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
  unitName?: string;

  constructor() {
    super('AntLeafScene');
  }

  preload() {
    // Load ant sprite (3 frames, 100x100px) only if not already loaded
    if (!this.textures.exists('ant')) {
      this.load.spritesheet('ant', '/src/assets/ant_sprite.png', {
        frameWidth: 100,
        frameHeight: 100,
      });
    }
    // Load leaf image only if not already loaded
    if (!this.textures.exists('leaf')) {
      this.load.image('leaf', '/src/assets/leaf.png');
    }
  }

  create(data: {
    question: QuizQuestion;
    playAudio: (src: string, waitForEnd?: boolean) => Promise<any>;
    unitName?: string;
  }) {
    // Validate and extract ant-leaf question data
    const { question, playAudio, unitName } = data;
    if (!question || question.questionType !== 'leaf-phoneme') {
      throw new Error('AntLeafScene requires a question of type leaf-phoneme');
    }
    // Now TypeScript knows this is a LeafPhonemeQuestion
    this.targetLetter = question.targetLetter;
    if (!this.targetLetter || this.targetLetter.length !== 1) {
      throw new Error('AntLeafScene requires a valid targetLetter');
    }
    this.promptFile = question.promptFile || '';
    this.phonemeFile = question.phonemeFile || '';
    this.playAudio = playAudio;
    this.unitName = unitName;
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.cameras.main.setBackgroundColor('#e0f7fa');
    this.cameras.main.setRoundPixels(true);

    // Use distractorLetters from question if present, else default
    if ('distractorLetters' in question && Array.isArray((question as any).distractorLetters) && (question as any).distractorLetters.length > 0) {
      this.distractorLetters = (question as any).distractorLetters.map((l: string) => l.toLowerCase()).filter((l: string) => l !== this.targetLetter);
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
      // Add click handler for letter
      letter.setInteractive({ useHandCursor: true });
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
        // Play correct/incorrect sound
        const isCorrect = letter.text === this.targetLetter;
        const feedbackPath = isCorrect ? '/audio/system/correct.wav' : '/audio/system/incorrect.wav';
        try {
          await this.playAudio(feedbackPath, true);
        } catch (e) {
          // ignore
        }
      });
      group.add([leaf, ant, letter]);
      group.x = this.antStartX - i * this.antSpacing;
      group.y = antY;
      this.add.existing(group);
      this.marchingAnts.push(group);
      this.antLeafGroups.push(group);
    }

    // Play audio sequence if playAudio is provided
    if (this.playAudio && (this.promptFile || this.phonemeFile)) {
      playQuizAudioSequence({
        promptFile: this.promptFile,
        phonemeFile: this.phonemeFile,
        playAudio: this.playAudio,
      });
    }
  }

  update(time: number, delta: number) {
    if (this.marchingAnts && this.marchingAnts.length > 0) {
      // Move all ant+leaf+letter containers
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
