import Phaser from 'phaser';
import { quizzes } from '../data/quizzes';
import { setQuizCompletion } from '../helpers/quizProgress';

interface SceneData {
  quizId: string;
}

export class QuizScene extends Phaser.Scene {
  private quiz?: {
    id: string;
    name: string;
    questions: Array<{
      id: string;
      text: string;
      words: string[];
      correctAnswer: string;
      phonemeFile: string;
      promptFile?: string;
    }>;
  };
  private currentQuestionIndex: number = 0;
  private wordButtons: Phaser.GameObjects.Container[] = [];
  private answerSelected: boolean = false;

  constructor() {
    super('Quiz');
  }

  init(data: SceneData) {
    this.quiz = quizzes.find(q => q.id === data.quizId);
    this.currentQuestionIndex = 0;
  }

  preload() {
    this.load.audio('success', '/audio/system/Success.wav');
    this.load.audio('failure', '/audio/system/Failure.wav');
  }

  create() {
    if (!this.quiz) {
      this.scene.start('QuizIndex');
      return;
    }
    this.createBackButton();
    this.showQuestion();
  }

  private createBackButton() {
    const btn = this.add.text(30, 30, '← Back', {
      fontSize: '22px',
      color: '#4a90e2',
      backgroundColor: '#fff',
      padding: { left: 12, right: 12, top: 6, bottom: 6 },
      // border and borderRadius removed (not supported by Phaser TextStyle)
    }).setOrigin(0, 0).setInteractive();
    btn.on('pointerover', () => {
      btn.setColor('#357abd');
      this.input.setDefaultCursor('pointer');
    });
    btn.on('pointerout', () => {
      btn.setColor('#4a90e2');
      this.input.setDefaultCursor('default');
    });
    btn.on('pointerdown', () => {
      this.showConfirmDialog();
    });
  }

  private showConfirmDialog() {
    const width = this.scale.width;
    const height = this.scale.height;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.45).setDepth(1000);
    const boxWidth = 380;
    const boxHeight = 180;
    const box = this.add.rectangle(width / 2, height / 2, boxWidth, boxHeight, 0xffffff, 1).setStrokeStyle(2, 0x4a90e2).setDepth(1001);
    const msg = this.add.text(width / 2, height / 2 - 30, 'Exit this quiz and return to the quiz list?', {
      fontSize: '20px',
      color: '#222',
      align: 'center',
      wordWrap: { width: boxWidth - 40 },
    }).setOrigin(0.5, 0.5).setDepth(1001);
    const yesBtn = this.add.text(width / 2 - 60, height / 2 + 40, 'Yes', {
      fontSize: '20px',
      color: '#fff',
      backgroundColor: '#4a90e2',
      padding: { left: 18, right: 18, top: 8, bottom: 8 },
      // borderRadius removed (not supported by Phaser TextStyle)
    }).setOrigin(0.5, 0.5).setInteractive().setDepth(1001);
    const noBtn = this.add.text(width / 2 + 60, height / 2 + 40, 'No', {
      fontSize: '20px',
      color: '#4a90e2',
      backgroundColor: '#eaf1fb',
      padding: { left: 18, right: 18, top: 8, bottom: 8 },
      // borderRadius removed (not supported by Phaser TextStyle)
    }).setOrigin(0.5, 0.5).setInteractive().setDepth(1001);
    yesBtn.on('pointerdown', () => {
      overlay.destroy();
      box.destroy();
      msg.destroy();
      yesBtn.destroy();
      noBtn.destroy();
      this.scene.start('QuizIndex');
    });
    noBtn.on('pointerdown', () => {
      overlay.destroy();
      box.destroy();
      msg.destroy();
      yesBtn.destroy();
      noBtn.destroy();
    });
    [yesBtn, noBtn].forEach(btn => {
      btn.on('pointerover', () => this.input.setDefaultCursor('pointer'));
      btn.on('pointerout', () => this.input.setDefaultCursor('default'));
    });
  }

  private showQuestion(delayMs: number = 500) {
    if (!this.quiz) return;
    const question = this.quiz.questions[this.currentQuestionIndex];
    this.answerSelected = false;
    this.cameras.main.setBackgroundColor('#fff');
    this.children.removeAll();
    this.add.text(this.scale.width / 2, 60, this.quiz.name, {
      fontSize: '32px',
      color: '#222',
    }).setOrigin(0.5, 0);
    this.add.text(this.scale.width / 2, 140, question.text, {
      fontSize: '24px',
      color: '#333',
      wordWrap: { width: this.scale.width * 0.8 },
    }).setOrigin(0.5, 0);
    // Play spoken prompt (if available and different from phoneme), then phoneme
    const spokenPromptFile = question.promptFile || null;
    // Remove old audio from cache
    if (this.cache.audio.has('spokenPrompt')) this.cache.audio.remove('spokenPrompt');
    if (this.cache.audio.has('phoneme')) this.cache.audio.remove('phoneme');
    const shouldPlaySpokenPrompt = spokenPromptFile && spokenPromptFile !== question.phonemeFile;
    if (shouldPlaySpokenPrompt) {
      this.load.audio('spokenPrompt', spokenPromptFile);
    }
    this.load.audio('phoneme', question.phonemeFile);
    this.load.once('complete', () => {
      this.time.delayedCall(delayMs, () => {
        const playPhoneme = () => {
          const phonemeSound = this.sound.add('phoneme');
          phonemeSound.play();
          phonemeSound.once('complete', () => {
            this.createWordButtons(question);
          });
        };
        if (shouldPlaySpokenPrompt) {
          const promptSound = this.sound.add('spokenPrompt');
          promptSound.play();
          promptSound.once('complete', playPhoneme);
        } else {
          playPhoneme();
        }
      });
    });
    this.load.start();
  }

  private createWordButtons(question: { id: string; text: string; words: string[]; correctAnswer: string; phonemeFile: string; }) {
    // Clear previous buttons
    this.wordButtons.forEach(btn => btn.destroy());
    this.wordButtons = [];
    const buttonWidth = 220;
    const buttonHeight = 60;
    const spacing = 30;
    const words = [...question.words];
    const totalWidth = words.length * buttonWidth + (words.length - 1) * spacing;
    const startX = (this.scale.width - totalWidth) / 2;
    const yPos = 260;
    words.forEach((word, i) => {
      const xPos = startX + i * (buttonWidth + spacing) + buttonWidth / 2;
      const container = this.add.container(xPos, yPos);
      const bg = this.add.graphics();
      bg.fillStyle(0x4a90e2, 1);
      bg.lineStyle(2, 0x2c5aa0, 1);
      bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
      bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
      const text = this.add.text(0, 0, word, {
        fontSize: '22px',
        color: '#fff',
      }).setOrigin(0.5, 0.5);
      container.add([bg, text]);
      container.setSize(buttonWidth, buttonHeight);
      // Fix hit area alignment: use (0,0) with origin (0.5,0.5) so it matches container center
      container.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
      // Hover effect: use a lighter blue for contrast
      const hoverColor = 0x6ba8e5; // lighter blue
      container.on('pointerover', () => {
        if (this.answerSelected) return;
        bg.clear();
        bg.fillStyle(hoverColor, 1);
        bg.lineStyle(2, 0x2c5aa0, 1);
        bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
        bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
        this.input.setDefaultCursor('pointer');
      });
      container.on('pointerout', () => {
        if (this.answerSelected) return;
        bg.clear();
        bg.fillStyle(0x4a90e2, 1);
        bg.lineStyle(2, 0x2c5aa0, 1);
        bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
        bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8);
        this.input.setDefaultCursor('default');
      });
      container.on('pointerdown', () => this.handleAnswer(word, question.correctAnswer));
      this.wordButtons.push(container);
    });
  }

  private handleAnswer(selected: string, correct: string) {
    if (this.answerSelected) return;
    this.answerSelected = true;
    const isCorrect = selected === correct;
    this.wordButtons.forEach(btn => btn.disableInteractive());
    // Animate feedback on the selected button
    const selectedBtn = this.wordButtons.find(btn => {
      const textObj = btn.list.find(child => child instanceof Phaser.GameObjects.Text) as Phaser.GameObjects.Text;
      return textObj && textObj.text === selected;
    });
    if (selectedBtn) {
      const bg = selectedBtn.list.find(child => child instanceof Phaser.GameObjects.Graphics) as Phaser.GameObjects.Graphics;
      bg.clear();
      if (isCorrect) {
        bg.fillStyle(0x90EE90, 1); // light green
        bg.lineStyle(3, 0x00aa00, 1);
        bg.fillRoundedRect(-110, -30, 220, 60, 8);
        bg.strokeRoundedRect(-110, -30, 220, 60, 8);
        // Pop animation
        selectedBtn.setScale(1);
        this.tweens.add({
          targets: selectedBtn,
          scaleX: 1.08,
          scaleY: 1.08,
          alpha: 0.95,
          duration: 140,
          yoyo: true,
          ease: 'Quad.easeOut',
        });
      } else {
        bg.fillStyle(0xFF6B6B, 1); // red
        bg.lineStyle(3, 0xff0000, 1);
        bg.fillRoundedRect(-110, -30, 220, 60, 8);
        bg.strokeRoundedRect(-110, -30, 220, 60, 8);
        // Shake animation
        const origX = selectedBtn.x;
        this.tweens.add({
          targets: selectedBtn,
          x: origX + 10,
          duration: 60,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: 2,
        });
      }
    }
    // Play feedback audio
    if (isCorrect) {
      this.sound.play('success');
      this.time.delayedCall(500, () => this.nextQuestion());
    } else {
      this.sound.play('failure');
      // Add a short delay before replaying the prompt after incorrect answer
      this.time.delayedCall(700, () => this.showQuestion(500));
    }
  }

  private nextQuestion() {
    if (!this.quiz) return;
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.quiz.questions.length) {
      this.showQuestion();
    } else {
      setQuizCompletion(this.quiz.id, true);
      this.scene.start('QuizIndex');
    }
  }
}
