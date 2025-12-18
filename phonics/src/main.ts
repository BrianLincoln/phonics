import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig';
// import { getAudioContext } from './helpers/audio';
import { QuizIndexScene } from './scenes/QuizIndexScene';
import { QuizScene } from './scenes/QuizScene';
import SoundIntroductionScene from '../../src/scenes/SoundIntroductionScene';
import CrowDemoScene from '../../src/scenes/CrowDemoScene';

// Entry point: use QuizIndexScene and QuizScene
new Phaser.Game({
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: gameConfig.canvas.width,
    height: gameConfig.canvas.height
  },
  backgroundColor: gameConfig.canvas.backgroundColor,
  scene: [QuizIndexScene, QuizScene, SoundIntroductionScene, CrowDemoScene],
});
