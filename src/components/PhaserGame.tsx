import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from '../phaser/MainScene';

interface PhaserGameProps {
  className?: string;
  unitName?: string;
  onSceneReady?: (scene: Phaser.Scene) => void;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ className, unitName, onSceneReady }) => {
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

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width,
      height,
      parent: containerRef.current,
      backgroundColor: '#ffffff',
      scale: {
        mode: Phaser.Scale.NONE, // don't auto-scale, canvas is exact size
      },
      scene: [MainScene],
    };

    gameRef.current = new Phaser.Game({
      ...config,
      callbacks: {
        postBoot: (game) => {
          // Get the MainScene instance and pass to parent
          const mainScene = game.scene.getScene('MainScene');
          sceneRef.current = mainScene;
          if (onSceneReady && mainScene) onSceneReady(mainScene);
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
