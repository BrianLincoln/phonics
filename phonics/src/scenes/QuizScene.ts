import Phaser from 'phaser';
import { quizzes } from '../data/quizzes';

import { setQuizCompletion } from '../helpers/quizProgress';
import { createButton } from '../helpers/createButton';

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
  private wordButtons: ReturnType<typeof createButton>[] = [];
  private dynamicObjects: Phaser.GameObjects.GameObject[] = [];
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
    this.showQuestion();
  }


  private createBackButton() {
    const btn = createButton({
      scene: this,
      x: 100,
      y: 80,
      width: 180,
      height: 80,
      label: '⬅ Back',
      onClick: () => {
        this.scene.start('QuizIndex');
      },
    });
    this.dynamicObjects.push(btn.bg, btn.text, btn.hit);
  }



  private showQuestion(delayMs: number = 500) {
    if (!this.quiz) return;
    // Remove only dynamic objects (buttons/text) from previous question
    this.dynamicObjects.forEach(obj => obj.destroy());
    this.dynamicObjects = [];
    this.wordButtons = [];
    const question = this.quiz.questions[this.currentQuestionIndex];
    this.answerSelected = false;
    this.cameras.main.setBackgroundColor('#fff');
    this.createBackButton();
    const quizTitle = this.add.text(this.scale.width / 2, 60, this.quiz.name, {
      fontSize: '32px',
      color: '#222',
    }).setOrigin(0.5, 0);
    this.dynamicObjects.push(quizTitle);
    const questionText = this.add.text(this.scale.width / 2, 140, question.text, {
      fontSize: '24px',
      color: '#333',
      wordWrap: { width: this.scale.width * 0.8 },
    }).setOrigin(0.5, 0);
    this.dynamicObjects.push(questionText);
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
    const buttonWidth = 220;
    const buttonHeight = 60;
    const spacing = 30;
    // Shuffle words array for random order
    const words = [...question.words];
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    const totalWidth = words.length * buttonWidth + (words.length - 1) * spacing;
    const startX = (this.scale.width - totalWidth) / 2;
    const yPos = 260;
    words.forEach((word, i) => {
      const xPos = startX + i * (buttonWidth + spacing) + buttonWidth / 2;
      const btn = createButton({
        scene: this,
        x: xPos,
        y: yPos,
        width: buttonWidth,
        height: buttonHeight,
        label: word,
        onClick: () => this.handleAnswer(word, question.correctAnswer),
      });
      this.wordButtons.push(btn);
      this.dynamicObjects.push(btn.bg, btn.text, btn.hit);
    });
  }

  private handleAnswer(selected: string, correct: string) {
    if (this.answerSelected) return;
    this.answerSelected = true;
    const isCorrect = selected === correct;
    // Disable all button input
    this.wordButtons.forEach(btn => btn.hit.disableInteractive());
    // Animate feedback on the selected button
    const selectedBtn = this.wordButtons.find(btn => btn.text.text === selected);
    if (selectedBtn) {
      if (isCorrect) {
        selectedBtn.bg.clear();
        selectedBtn.bg.fillStyle(0x27ae60, 1); // vivid success green
        selectedBtn.bg.fillRoundedRect(-110, -30, 220, 60, 8);
        selectedBtn.bg.setAlpha(1);
        if (selectedBtn.animate) selectedBtn.animate('bounce');
      } else {
        selectedBtn.bg.clear();
        selectedBtn.bg.fillStyle(0xe74c3c, 1); // vivid fail red
        selectedBtn.bg.fillRoundedRect(-110, -30, 220, 60, 8);
        selectedBtn.bg.setAlpha(1);
        if (selectedBtn.animate) selectedBtn.animate('shake');
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
