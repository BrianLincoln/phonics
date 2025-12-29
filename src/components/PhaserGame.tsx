import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from '../phaser/MainScene';
import { AntLeafScene } from '../phaser/AntLeafScene';

interface PhaserGameProps {
  className?: string;
  unitName?: string;
  onSceneReady?: (scene: Phaser.Scene) => void;
  sceneType?: 'main' | 'ant-leaf';
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ className, unitName, onSceneReady, sceneType = 'main' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<Phaser.Scene | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;


    // Destroy existing game if present
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    // Pass unitName to the scene
    (MainScene as any).unitName = unitName;

    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    const sceneClass = sceneType === 'ant-leaf' ? AntLeafScene : MainScene;
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width,
      height,
      parent: containerRef.current,
      backgroundColor: '#ffffff',
      scale: {
        mode: Phaser.Scale.NONE,
      },
      scene: [sceneClass],
    };

    gameRef.current = new Phaser.Game({
      ...config,
      callbacks: {
        postBoot: (game) => {
          const sceneInstance = game.scene.getScene(sceneType === 'ant-leaf' ? 'AntLeafScene' : 'MainScene');
          sceneRef.current = sceneInstance;
          if (onSceneReady && sceneInstance) onSceneReady(sceneInstance);
        },
      },
    });

    // Return cleanup
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, [unitName]);

  return (
    <div
      ref={containerRef}
      className="phaser-container"
    />
  );
};
