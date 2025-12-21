import { quizzes } from '../data/quizzes';
import { createButton } from '../helpers/createButton';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }


  crowBtn?: Phaser.GameObjects.Sprite;
  playBtn?: Phaser.GameObjects.Graphics;
  playHit?: Phaser.GameObjects.Zone;
  quizIndexBtn?: Phaser.GameObjects.Container;
  progressBtn?: Phaser.GameObjects.Container;

  create() {
    this.cameras.main.setBackgroundColor('#f0f4fa');

    // Crow Demo Button (small square, top right)
    const createCrowBtn = () => {
      const crowBtnSize = 48;
      this.crowBtn = this.add.sprite(0, 0, 'crow', 0)
        .setOrigin(0.5)
        .setDisplaySize(crowBtnSize, crowBtnSize)
        .setInteractive();
      this.crowBtn.setName('crowBtn');
      this.crowBtn.on('pointerdown', () => {
        if (this.sound) this.sound.stopAll();
        this.scene.start('CrowDemoScene');
      });
      this.crowBtn.setDepth(10);
    };
    if (!this.textures.exists('crow')) {
      this.load.spritesheet('crow', '/crow_sprite.png', { frameWidth: 200, frameHeight: 200 });
      this.load.once('complete', () => {
        createCrowBtn();
        this.layout(this.scale.gameSize);
      });
      this.load.start();
    } else {
      createCrowBtn();
    }

    // Large centered Play button with triangle icon
    this.playBtn = this.add.graphics();
    // Make play button interactive
    this.playHit = this.add.zone(0, 0, 180, 180);
    this.playHit.setOrigin(0.5);
    this.playHit.setInteractive();
    this.playHit.on('pointerover', () => this.playBtn?.setAlpha(0.85));
    this.playHit.on('pointerout', () => this.playBtn?.setAlpha(1));
    this.playHit.on('pointerdown', () => {
      if (this.sound) this.sound.stopAll();
      // Pick a quiz at random
      const targetQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
      if (targetQuiz) {
        this.scene.start('Quiz', { quizId: targetQuiz.id });
      }
    });

    // Quiz Index and Progress buttons using createButton (always available)
    const quizIndexBtnResult = createButton({
      scene: this,
      x: 0,
      y: 0,
      width: 260,
      height: 64,
      label: 'All Quizzes',
      fontSize: 22,
      bgColor: 0xf4f4f4,
      borderColor: 0xd0d0d0,
      textColor: '#666',
      onClick: () => this.scene.start('QuizIndex'),
    });
    this.quizIndexBtn = quizIndexBtnResult?.container;
    if (this.quizIndexBtn) this.add.existing(this.quizIndexBtn);

    const progressBtnResult = createButton({
      scene: this,
      x: 0,
      y: 0,
      width: 260,
      height: 64,
      label: 'Progress',
      fontSize: 22,
      bgColor: 0xf4f4f4,
      borderColor: 0xd0d0d0,
      textColor: '#666',
      onClick: () => this.scene.start('PhonicsProgress'),
    });
    this.progressBtn = progressBtnResult?.container;
    if (this.progressBtn) this.add.existing(this.progressBtn);

    // Initial layout
    this.layout(this.scale.gameSize);

    // Listen for resize events
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.layout(gameSize);
    }, this);
  }

  layout(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;

    // Responsive sizes
    const crowBtnSize = Math.max(32, Math.min(64, Math.floor(Math.min(width, height) * 0.06)));
    const playBtnSize = Math.max(100, Math.min(240, Math.floor(Math.min(width, height) * 0.22)));
    const menuBtnWidth = Math.max(120, Math.min(340, Math.floor(width * 0.28)));
    const menuBtnHeight = Math.max(40, Math.min(90, Math.floor(height * 0.08)));
    const menuBtnFont = Math.max(16, Math.min(32, Math.floor(menuBtnHeight * 0.45)));
    const menuBtnSpacing = Math.max(16, Math.floor(menuBtnHeight * 0.6));

    // Crow button (top right)
    if (this.crowBtn) {
      this.crowBtn.setDisplaySize(crowBtnSize, crowBtnSize);
      this.crowBtn.x = width - crowBtnSize - 16;
      this.crowBtn.y = 16 + crowBtnSize / 2;
    }

    // Play button (center)
    if (this.playBtn && this.playHit) {
      const playBtnY = height / 2 - playBtnSize / 2 - menuBtnHeight;
      this.playBtn.clear();
      this.playBtn.fillStyle(0x4a90e2, 1);
      this.playBtn.lineStyle(Math.max(3, Math.floor(playBtnSize * 0.035)), 0x2c5aa0, 1);
      this.playBtn.fillCircle(width / 2, playBtnY + playBtnSize / 2, playBtnSize / 2);
      this.playBtn.strokeCircle(width / 2, playBtnY + playBtnSize / 2, playBtnSize / 2);
      // Triangle play symbol
      const triangleSize = Math.max(32, Math.floor(playBtnSize * 0.39));
      const triangleX = width / 2 - triangleSize / 2 + Math.floor(playBtnSize * 0.1);
      const triangleY = playBtnY + playBtnSize / 2 - triangleSize / 2;
      this.playBtn.fillStyle(0xffffff, 1);
      this.playBtn.beginPath();
      this.playBtn.moveTo(triangleX, triangleY);
      this.playBtn.lineTo(triangleX, triangleY + triangleSize);
      this.playBtn.lineTo(triangleX + triangleSize, triangleY + triangleSize / 2);
      this.playBtn.closePath();
      this.playBtn.fillPath();
      // Move the hit zone
      this.playHit.setPosition(width / 2, playBtnY + playBtnSize / 2);
      this.playHit.setSize(playBtnSize, playBtnSize);
    }

    // Quiz Index and Progress buttons (bottom center, stacked)
    if (this.quizIndexBtn) {
      this.quizIndexBtn.x = width / 2;
      this.quizIndexBtn.y = height - menuBtnHeight - menuBtnSpacing;
      this.quizIndexBtn.setSize(menuBtnWidth, menuBtnHeight);
      // Update background and text/font size
      const bgObj = this.quizIndexBtn.list.find(obj => obj instanceof Phaser.GameObjects.Graphics) as Phaser.GameObjects.Graphics | undefined;
      if (bgObj) {
        bgObj.clear();
        bgObj.fillStyle(0xf4f4f4, 1);
        bgObj.lineStyle(2, 0xd0d0d0, 1);
        bgObj.fillRoundedRect(-menuBtnWidth / 2, -menuBtnHeight / 2, menuBtnWidth, menuBtnHeight, 8);
        bgObj.strokeRoundedRect(-menuBtnWidth / 2, -menuBtnHeight / 2, menuBtnWidth, menuBtnHeight, 8);
      }
      const textObj = this.quizIndexBtn.list.find(obj => obj instanceof Phaser.GameObjects.Text) as Phaser.GameObjects.Text | undefined;
      if (textObj) {
        textObj.setFontSize(menuBtnFont);
        textObj.setWordWrapWidth(menuBtnWidth - 24, true);
        textObj.setOrigin(0.5, 0.5);
        textObj.x = 0;
        // Dynamically shrink font if text overflows horizontally or vertically
        let fittedFont = menuBtnFont;
        while ((textObj.width > menuBtnWidth - 24 || textObj.height > menuBtnHeight - 8) && fittedFont > 10) {
          fittedFont -= 1;
          textObj.setFontSize(fittedFont);
          textObj.setWordWrapWidth(menuBtnWidth - 24, true);
        }
        textObj.y = 0;
      }
    }
    if (this.progressBtn) {
      this.progressBtn.x = width / 2;
      this.progressBtn.y = height - 2 * (menuBtnHeight + menuBtnSpacing);
      this.progressBtn.setSize(menuBtnWidth, menuBtnHeight);
      const bgObj = this.progressBtn.list.find(obj => obj instanceof Phaser.GameObjects.Graphics) as Phaser.GameObjects.Graphics | undefined;
      if (bgObj) {
        bgObj.clear();
        bgObj.fillStyle(0xf4f4f4, 1);
        bgObj.lineStyle(2, 0xd0d0d0, 1);
        bgObj.fillRoundedRect(-menuBtnWidth / 2, -menuBtnHeight / 2, menuBtnWidth, menuBtnHeight, 8);
        bgObj.strokeRoundedRect(-menuBtnWidth / 2, -menuBtnHeight / 2, menuBtnWidth, menuBtnHeight, 8);
      }
      const textObj = this.progressBtn.list.find(obj => obj instanceof Phaser.GameObjects.Text) as Phaser.GameObjects.Text | undefined;
      if (textObj) {
        textObj.setFontSize(menuBtnFont);
        textObj.setWordWrapWidth(menuBtnWidth - 24, true);
        textObj.setOrigin(0.5, 0.5);
        textObj.x = 0;
        let fittedFont = menuBtnFont;
        while ((textObj.width > menuBtnWidth - 24 || textObj.height > menuBtnHeight - 8) && fittedFont > 10) {
          fittedFont -= 1;
          textObj.setFontSize(fittedFont);
          textObj.setWordWrapWidth(menuBtnWidth - 24, true);
        }
        textObj.y = 0;
      }
    }
  }
  handleResize(): void {
    // Reposition Crow button if it exists
    const crowBtn = (this.children.getByName && this.children.getByName('crowBtn')) as Phaser.GameObjects.Sprite | undefined;
    if (crowBtn) {
      const crowBtnSize = 48;
      crowBtn.x = this.scale?.width ? this.scale.width - crowBtnSize - 16 : crowBtn.x;
      crowBtn.y = this.scale?.height ? 16 + crowBtnSize / 2 : crowBtn.y;
    }

    // Reposition Play button (graphics and hit zone)
    // Find the play button graphics (assume it's the first Graphics object)
    const playBtn = this.children.list.find(
      (obj) => obj instanceof Phaser.GameObjects.Graphics
    ) as Phaser.GameObjects.Graphics | undefined;
    const playHit = this.children.list.find(
      (obj) => obj instanceof Phaser.GameObjects.Zone
    ) as Phaser.GameObjects.Zone | undefined;
    if (playBtn && playHit) {
      // Clear and redraw the play button at new center
      playBtn.clear();
      const playBtnSize = 180;
      const playBtnY = this.scale.height / 2 - playBtnSize / 2;
      playBtn.fillStyle(0x4a90e2, 1);
      playBtn.lineStyle(6, 0x2c5aa0, 1);
      playBtn.fillCircle(this.scale.width / 2, playBtnY + playBtnSize / 2, playBtnSize / 2);
      playBtn.strokeCircle(this.scale.width / 2, playBtnY + playBtnSize / 2, playBtnSize / 2);
      // Triangle play symbol
      const triangleSize = 70;
      const triangleX = this.scale.width / 2 - triangleSize / 2 + 18;
      const triangleY = playBtnY + playBtnSize / 2 - triangleSize / 2;
      playBtn.fillStyle(0xffffff, 1);
      playBtn.beginPath();
      playBtn.moveTo(triangleX, triangleY);
      playBtn.lineTo(triangleX, triangleY + triangleSize);
      playBtn.lineTo(triangleX + triangleSize, triangleY + triangleSize / 2);
      playBtn.closePath();
      playBtn.fillPath();
      // Move the hit zone
      playHit.setPosition(this.scale.width / 2, playBtnY + playBtnSize / 2);
    }

    // Reposition Quiz Index and Progress buttons (created with createButton)
    // They are containers, so find by label text
    const quizIndexBtn = this.children.list.find(
      (obj) =>
        obj instanceof Phaser.GameObjects.Container &&
        obj.list.some(
          (child) =>
            child instanceof Phaser.GameObjects.Text &&
            child.text === 'All Quizzes'
        )
    ) as Phaser.GameObjects.Container | undefined;
    const progressBtn = this.children.list.find(
      (obj) =>
        obj instanceof Phaser.GameObjects.Container &&
        obj.list.some(
          (child) =>
            child instanceof Phaser.GameObjects.Text &&
            child.text === 'Progress'
        )
    ) as Phaser.GameObjects.Container | undefined;
    if (quizIndexBtn) {
      quizIndexBtn.x = this.scale.width / 2;
      quizIndexBtn.y = this.scale.height - 100;
    }
    if (progressBtn) {
      progressBtn.x = this.scale.width / 2;
      progressBtn.y = this.scale.height - 180;
    }
  }
}

