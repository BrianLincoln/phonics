import './style.css';
import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig';
// import { getAudioContext } from './helpers/audio';
import { MenuScene } from './scenes/MenuScene';
import { QuizIndexScene } from './scenes/QuizIndexScene';
import { QuizScene } from './scenes/QuizScene';
import CrowDemoScene from './scenes/CrowDemoScene';
import { PhonicsProgressScene } from './scenes/PhonicsProgressScene';

// Entry point: use QuizIndexScene and QuizScene
new Phaser.Game({
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight
  },
  backgroundColor: gameConfig.canvas.backgroundColor,
  scene: [MenuScene, QuizIndexScene, QuizScene, CrowDemoScene, PhonicsProgressScene],
});
