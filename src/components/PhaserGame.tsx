import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { AntLeafScene, LeafParadeSceneData } from '../phaser/AntLeafScene';
import { MultipleChoiceScene, MultipleChoiceSceneData } from '../phaser/MultipleChoiceScene';
import { BuildTheWordScene, BuildTheWordSceneData } from '../phaser/BuildTheWordScene';
import { EndlessScene } from '../phaser/EndlessScene';
import { SuccessScene } from '../phaser/SuccessScene';

type SceneType = 'multiple-choice' | 'leaf-parade' | 'success' | 'endless' | 'build-the-word';

interface PhaserGameProps {
  sceneType: SceneType;
  sceneData?: MultipleChoiceSceneData | LeafParadeSceneData | BuildTheWordSceneData;
  onSceneReady?: (scene: Phaser.Scene) => void;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({
  sceneType,
  sceneData,
  onSceneReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<Phaser.Scene | null>(null);

  // 1. Create game once
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: containerRef.current,
      backgroundColor: '#ffffff',
      audio: { noAudio: true },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.NO_CENTER,
      },
    });

    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  // 2. Switch scenes without recreating the game
  useEffect(() => {
    const game = gameRef.current;
    if (!game) return;

    let sceneClass: typeof Phaser.Scene;
    let sceneKey: string;

    switch (sceneType) {
      case 'leaf-parade':
        sceneClass = AntLeafScene;
        sceneKey = 'AntLeafScene';
        break;
      case 'multiple-choice':
        sceneClass = MultipleChoiceScene;
        sceneKey = 'MultipleChoiceScene';
        break;
      case 'endless':
        sceneClass = EndlessScene;
        sceneKey = 'EndlessScene';
        break;
      case 'success':
        sceneClass = SuccessScene;
        sceneKey = 'SuccessScene';
        break;
      case 'build-the-word':
        sceneClass = BuildTheWordScene;
        sceneKey = 'BuildTheWordScene';
        break;
      default:
        throw new Error(`Unsupported scene type: ${sceneType}`);
    }

    if (game.scene.isActive(sceneKey)) {
      sceneRef.current = game.scene.getScene(sceneKey);
      onSceneReady?.(sceneRef.current);
      return;
    }

    game.scene.stop(sceneKey);
    game.scene.add(sceneKey, sceneClass, true, sceneData);

    // After add(), the scene may still be in Phaser's _pending queue (the game
    // hasn't booted yet), so getScene() returns null until bootQueue runs.
    // For scenes with no preload(), create() fires synchronously inside bootQueue,
    // so by the time our 'ready' listener fires, the scene may already be active.
    // We handle both cases: attach once('create') if not yet created, or call
    // onSceneReady directly if create() already completed.
    const attachCreateListener = () => {
      const scene = game.scene.getScene(sceneKey);
      if (!scene) return; // defensive guard

      const init = () => {
        if (sceneType === 'leaf-parade' && sceneData && 'playAudio' in sceneData) {
          (scene as any).playAudio = (sceneData as any).playAudio;
        }
        sceneRef.current = scene;
        onSceneReady?.(scene);
      };

      if (game.scene.isActive(sceneKey)) {
        // create() already fired (e.g. scene had no preload)
        init();
      } else {
        scene.events.once('create', init);
      }
    };

    if (game.scene.isBooted) {
      // Game already running — add() registered the scene in keys[] immediately
      attachCreateListener();
    } else {
      // Game still booting — scene is in _pending queue.
      // SceneManager's bootQueue listener (registered first) runs on 'ready' and
      // moves the scene into keys[] before our listener fires.
      game.events.once('ready', attachCreateListener);
    }
  }, [sceneType, sceneData]);

  return <div ref={containerRef} className="phaser-container" />;
};
