import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from '../phaser/MainScene';


interface PhaserGameProps {
  width?: number;
  height?: number;
  className?: string;
  unitName?: string;
}


export const PhaserGame: React.FC<PhaserGameProps> = ({ width = 480, height = 320, className, unitName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy any existing game instance before creating a new one
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }


    // Pass unitName via static property (workaround for Phaser scene data)
    (MainScene as any).unitName = unitName;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      parent: containerRef.current,
      backgroundColor: '#1e1e2f',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width,
        height,
      },
      scene: [MainScene],
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [width, height, unitName]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
    />
  );
};
