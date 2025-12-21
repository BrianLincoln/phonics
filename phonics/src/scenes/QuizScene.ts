import Phaser from 'phaser';
import { Crow } from '../entities/Crow';
import { quizzes, type Quiz } from '../data/quizzes';
import { createButton } from '../helpers/createButton';
import { updatePhonicsUnitProgress } from '../helpers/quizProgress';
import { phonicsUnits } from '../data/phonicsUnits';

interface SceneData {
  quizId: string;
}

export class QuizScene extends Phaser.Scene {
  private crow!: Crow;
  private crowTalkTimer?: Phaser.Time.TimerEvent;
  private quiz?: Quiz;
  private currentQuestionIndex: number = 0;
  private wordButtons: ReturnType<typeof createButton>[] = [];
  private dynamicObjects: Phaser.GameObjects.GameObject[] = [];
  private answerSelected: boolean = false;
  // Removed questionTextObj: no question text shown
  private fadeDuration: number = 250;
  private introPlayed: boolean = false;

  constructor() {
    super('Quiz');
  }

  private startCrowTalking() {
    if (this.crowTalkTimer) this.crowTalkTimer.remove(false);
    let frame = 4;
    this.crowTalkTimer = this.time.addEvent({
      delay: 150, // slower talking
      loop: true,
      callback: () => {
        // Only use frames 4 (closed) and 4 (open) if only 5 frames (0-4)
        frame = frame === 4 ? 0 : 4;
        this.crow.setFrame(frame);
      }
    });
  }

  private stopCrowTalking() {
    if (this.crowTalkTimer) this.crowTalkTimer.remove(false);
    this.crow.setIdle();
  }

  init(data: SceneData) {
    this.quiz = quizzes.find(q => q.id === data.quizId);
    this.currentQuestionIndex = 0;
    // Removed introShown: no intro shown
  }

  preload() {
    this.load.audio('correct', '/audio/system/correct.wav');
    this.load.audio('incorrect', '/audio/system/incorrect.wav');
    this.load.audio('success', '/audio/system/success.wav');
  }

  create() {
    if (!this.quiz) {
      this.scene.start('QuizIndex');
      return;
    }

    // Add the crow to the scene (top right, half size)
    const crowSize = 100;
    // Lower the crow: top margin 64px for more space
    this.crow = new Crow({ scene: this, x: this.scale.width - crowSize / 2 - 24, y: crowSize / 2 + 64 });
    this.crow.setDisplaySize(crowSize, crowSize);
    this.crow.setIdle();
    // Play letter introduction audio sequence if flag is set and not already played
    // Reposition crow on resize
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      if (this.crow) {
        const crowSize = 100;
        this.crow.x = gameSize.width - crowSize / 2 - 24;
        this.crow.y = crowSize / 2 + 64;
      }
    });
    if (this.quiz.showLetterIntro && !this.introPlayed) {
      this.introPlayed = true;
      // Show quiz unit name and back button while intro audio plays
      this.cameras.main.setBackgroundColor('#fff');
      let unitName = this.quiz.unit ? (phonicsUnits.find(u => u.id === this.quiz!.unit)?.name || this.quiz.unit) : this.quiz.id;
      const quizTitle = this.add.text(this.scale.width / 2, 200, unitName, {
        fontSize: '200px',
        color: '#222',
      }).setOrigin(0.5, 0);
      const backBtn = createButton({
        scene: this,
        x: 100,
        y: 80,
        label: '⬅ Back',
        onClick: () => {
          if (this.sound) this.sound.stopAll();
          this.scene.start('Menu');
        },
      });
      this.add.existing(backBtn.container);
      // Play intro audio if available for this unit
      const { unit } = this.quiz;
      if (unit) {
        const unitObj = phonicsUnits.find(u => u.id === unit);
        if (unitObj && unitObj.nameAudio && unitObj.soundAudio) {
          this.load.audio('intro1', '/audio/prompts/this-is-the-letter.wav');
          this.load.audio('intro2', unitObj.nameAudio);
          this.load.audio('intro3', '/audio/prompts/it-makes-the-sound.wav');
          this.load.audio('intro4', unitObj.soundAudio);
          this.load.once('complete', () => {
            const playNext = (key: string, next?: () => void) => {
              this.startCrowTalking();
              const sound = this.sound.add(key);
              sound.play();
              sound.once('complete', () => {
                sound.destroy();
                if (next) next();
                else this.stopCrowTalking();
              });
            };
            playNext('intro1', () => {
              playNext('intro2', () => {
                playNext('intro3', () => {
                  playNext('intro4', () => {
                    this.time.delayedCall(1000, () => {
                      quizTitle.destroy();
                      backBtn.container.destroy();
                      this.stopCrowTalking();
                      this.showQuestion();
                    });
                  });
                });
              });
            });
          });
          this.load.start();
          return;
        }
      }
      // If no intro audio, just show question
      quizTitle.destroy();
      backBtn.container.destroy();
      this.showQuestion();
      return;
    }
    this.showQuestion();
  }


  private createBackButton() {
    const btn = createButton({
      scene: this,
      x: 100,
      y: 80,
      label: '⬅ Back',
      onClick: () => {
        if (this.sound) this.sound.stopAll();
        this.scene.start('Menu');
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

    // Only show quiz title if hideLetter is not true for this question
    if (!question.hideLetter) {
      let unitName: string | undefined;
      if (this.quiz.unit) {
        unitName = phonicsUnits.find(u => u.id === this.quiz!.unit)?.name || this.quiz.unit;
      } else {
        // Try to infer from first question's correct answer if possible
        const firstWord = question.words.find(w => w.length === 1 && /[a-zA-Z]/.test(w));
        unitName = firstWord || this.quiz.id;
      }
      const quizTitle = this.add.text(this.scale.width / 2, 200, unitName, {
        fontSize: '200px',
        color: '#222',
      }).setOrigin(0.5, 0);
      this.dynamicObjects.push(quizTitle);
    }

    // No question text to display
    this.dynamicObjects.push(
      this.add.text(this.scale.width / 2, this.scale.height - 400, '', {
        fontSize: '30px',
        color: '#333',
        wordWrap: { width: this.scale.width * 0.8 },
      }).setOrigin(0.5, 0)
    );
    // No question text to display

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
          this.startCrowTalking();
          const phonemeSound = this.sound.add('phoneme');
          phonemeSound.play();
          phonemeSound.once('complete', () => {
            this.stopCrowTalking();
            this.createWordButtons(question);
          });
        };
        if (shouldPlaySpokenPrompt) {
          this.startCrowTalking();
          const promptSound = this.sound.add('spokenPrompt');
          promptSound.play();
          promptSound.once('complete', () => {
            playPhoneme();
          });
        } else {
          playPhoneme();
        }
      });
    });
    this.load.start();
  }

  private createWordButtons(question: { id: string; words: string[]; correctAnswer: string; phonemeFile: string; }) {
    const buttonWidth = 220;
    const buttonHeight = 60;
    const gap = 4;
    const words = [...question.words];
    // Shuffle words
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    const isPortrait = this.scale.height > this.scale.width;
    if (isPortrait) {
      // Stack vertically, centered (mobile/portrait)
      const totalHeight = words.length * buttonHeight + (words.length - 1) * gap;
      const baseY = Math.min(this.scale.height * 0.7 - totalHeight / 2, this.scale.height - totalHeight - 60);
      words.forEach((word, i) => {
        const x = this.scale.width / 2;
        const y = baseY + i * (buttonHeight + gap) + buttonHeight / 2;
        const btn = createButton({
          scene: this,
          x,
          y,
          label: word,
          onClick: () => this.handleAnswer(word, question.correctAnswer),
        });
        btn.container.setScale(1); // Always reset scale
        this.wordButtons.push(btn);
        this.dynamicObjects.push(btn.bg, btn.text, btn.hit);
      });
    } else {
      // Side by side, centered (desktop/landscape)
      const totalWidth = words.length * buttonWidth + (words.length - 1) * gap;
      const baseX = (this.scale.width - totalWidth) / 2;
      const y = Math.min(this.scale.height * 0.7, this.scale.height - buttonHeight - 60);
      words.forEach((word, i) => {
        const x = baseX + i * (buttonWidth + gap) + buttonWidth / 2;
        const btn = createButton({
          scene: this,
          x,
          y,
          label: word,
          onClick: () => this.handleAnswer(word, question.correctAnswer),
        });
        btn.container.setScale(1); // Always reset scale
        this.wordButtons.push(btn);
        this.dynamicObjects.push(btn.bg, btn.text, btn.hit);
      });
    }
  }

  private onAnswerComplete() {
    // Feedback animation duration (sync with bounce/shake)
    const feedbackDuration = 300;
    const postFeedbackDelay = 700;
    // Fade out question text and buttons after feedback + delay
    this.time.delayedCall(feedbackDuration + postFeedbackDelay, () => {
      // Fade out buttons after feedback + delay
      this.wordButtons.forEach(btn => {
        this.tweens.add({
          targets: btn.container,
          alpha: 0,
          duration: this.fadeDuration,
        });
      });
      // After fade out, go to next question immediately (no extra delay)
      this.nextQuestion();
    });
  }

  private handleAnswer(selected: string, correct: string) {
    if (this.answerSelected) return;
    this.answerSelected = true;
    const isCorrect = selected === correct;
    // Update phonics progress for this quiz's unit
    if (this.quiz && this.quiz.unit) {
      updatePhonicsUnitProgress(this.quiz.unit, isCorrect);
    }
    // Disable all button input
    this.wordButtons.forEach(btn => btn.hit.disableInteractive());
    // Animate feedback on the selected button
    const selectedBtn = this.wordButtons.find(btn => btn.text.text === selected);
    if (selectedBtn) {
      selectedBtn.container.setScale(1); // Prevent giant scaling
      if (isCorrect) {
        selectedBtn.bg.clear();
        selectedBtn.bg.fillStyle(0x50bc37, 1);
        selectedBtn.bg.fillRoundedRect(-110, -30, 220, 60, 8);
        selectedBtn.bg.setAlpha(1);
        if (selectedBtn.animate) selectedBtn.animate('bounce');
      } else {
        selectedBtn.bg.clear();
        selectedBtn.bg.fillStyle(0xbc3737, 1);
        selectedBtn.bg.fillRoundedRect(-110, -30, 220, 60, 8);
        selectedBtn.bg.setAlpha(1);
        if (selectedBtn.animate) selectedBtn.animate('shake');
      }
    }
    // Play feedback audio
    if (isCorrect) {
      this.sound.play('correct');
      // If this is the last question, play 'success' after 'correct'
      if (this.quiz && this.currentQuestionIndex === this.quiz.questions.length - 1) {
        // Wait for 'correct' sound to finish, then play 'success' and show animation
        const correctSound = this.sound.get('correct');
        const delay = correctSound && correctSound.duration ? correctSound.duration * 1000 : 700;
        this.time.delayedCall(delay, () => {
          this.sound.play('success');
          // Remove all dynamic objects (buttons, text, etc.)
          this.dynamicObjects.forEach(obj => obj.destroy());
          this.dynamicObjects = [];
          // Show success animation (🎉)
          const emoji = this.add.text(this.scale.width / 2, this.scale.height / 2, '🎉', {
            fontSize: '180px',
            fontFamily: 'Arial',
            color: '#222',
          }).setOrigin(0.5);
          emoji.alpha = 0;
          // Fade in quickly
          this.tweens.add({
            targets: emoji,
            alpha: 1,
            duration: 250,
            onComplete: () => {
              // Fade out quickly after a short pause (match success sound duration or 700ms min)
              const successSound = this.sound.get('success');
              const outDelay = successSound && successSound.duration ? Math.max(successSound.duration * 1000, 700) : 700;
              this.time.delayedCall(outDelay, () => {
                this.tweens.add({
                  targets: emoji,
                  alpha: 0,
                  duration: 400,
                  onComplete: () => {
                    emoji.destroy();
                    this.onAnswerComplete();
                  }
                });
              });
            }
          });
        });
      } else {
        this.onAnswerComplete();
      }
    } else {
      this.sound.play('incorrect');
      // Add a short delay before replaying the prompt after incorrect answer
      this.time.delayedCall(700, () => this.showQuestion(500));
    }
  }

  private nextQuestion() {
    if (!this.quiz) return;
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.quiz.questions.length) {
      this.showQuestion(500);
    } else {
      if (this.sound) this.sound.stopAll();
      this.scene.start('Menu');
    }
  }

  shutdown() {
    if (this.sound) this.sound.stopAll();
  }
}
