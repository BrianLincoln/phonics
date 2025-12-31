import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { AntLeafScene, LeafParadeSceneData } from '../phaser/AntLeafScene';
import { MultipleChoiceScene, MultipleChoiceSceneData } from '../phaser/MultipleChoiceScene';
import { SuccessScene } from '../phaser/SuccessScene';

type SceneType = 'multiple-choice' | 'leaf-parade' | 'success';

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

    const { width, height } = containerRef.current.getBoundingClientRect();

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: Math.floor(width),
      height: Math.floor(height),
      parent: containerRef.current,
      backgroundColor: '#ffffff',
      scale: { mode: Phaser.Scale.NONE },
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
    sceneRef.current = game.scene.getScene(sceneKey);
    onSceneReady?.(sceneRef.current);
  }, [sceneType, sceneData]);

  return <div ref={containerRef} className="phaser-container" />;
};
