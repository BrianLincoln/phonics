import { NavigateFunction } from 'react-router-dom';

/**
 * Handles quiz completion: switches to SuccessScene, then cleans up Phaser and redirects home.
 * @param phaserScene The current Phaser scene instance
 * @param navigate The react-router navigate function
 * @param onComplete Optional callback to notify parent
 */
export function handleQuizCompletion(phaserScene: any, navigate: NavigateFunction, onComplete?: (result?: any) => void) {
  if (!phaserScene || !phaserScene.scene) {
    if (typeof onComplete === 'function') onComplete(true);
    navigate('/');
    return;
  }
  phaserScene.scene.start('SuccessScene', {
    onComplete: () => {
      if (typeof onComplete === 'function') onComplete(true);
      // Clean up Phaser instance if needed
      if (phaserScene.game && phaserScene.game.destroy) {
        phaserScene.game.destroy(true);
      }
      navigate('/');
    }
  });
}
