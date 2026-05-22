import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { AntLeafScene, LeafParadeSceneData } from '../phaser/AntLeafScene';
import { MultipleChoiceScene, MultipleChoiceSceneData } from '../phaser/MultipleChoiceScene';
import { EndlessScene } from '../phaser/EndlessScene';
import { SuccessScene } from '../phaser/SuccessScene';

type SceneType = 'multiple-choice' | 'leaf-parade' | 'success' | 'endless';

interface PhaserGameProps {
  sceneType: SceneType;
  sceneData?: MultipleChoiceSceneData | LeafParadeSceneData;
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

    // Wait for the scene's create() to finish before calling onSceneReady —
    // this guarantees crowController and other scene state are fully initialized.
    const scene = game.scene.getScene(sceneKey);
    if (scene) {
      scene.events.once('create', () => {
        if (sceneType === 'leaf-parade' && sceneData && 'playAudio' in sceneData) {
          (scene as any).playAudio = (sceneData as any).playAudio;
        }
        sceneRef.current = scene;
        onSceneReady?.(scene);
      });
    }
  }, [sceneType, sceneData]);

  return <div ref={containerRef} className="phaser-container" />;
};
