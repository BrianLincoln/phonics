import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { AntLeafScene } from '../phaser/AntLeafScene';
import { MultipleChoiceScene } from '../phaser/MultipleChoiceScene';
import { SuccessScene } from '../phaser/SuccessScene';
import { QuizQuestion } from '../data/quizzes';

type SceneType = 'multiple-choice' | 'ant-leaf' | 'success';
interface PhaserGameProps {
  className?: string;
  unitName?: string;
  onSceneReady?: (scene: Phaser.Scene) => void;
  sceneType: SceneType;
  question?: QuizQuestion;
  onSuccessComplete?: () => void;
  playAudio?: (src: string, waitForEnd?: boolean) => Promise<any>;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ className, unitName, onSceneReady, sceneType, question, playAudio, onSuccessComplete }) => {
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

    // Prepare data to inject into the scene
    const sceneData = {
      unitName,
      question,
      playAudio,
      onSuccessComplete,
    };

    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    let sceneClass, sceneKey;
    if (sceneType === 'ant-leaf') {
      sceneClass = AntLeafScene;
      sceneKey = 'AntLeafScene';
    } else if (sceneType === 'multiple-choice') {
      sceneClass = MultipleChoiceScene;
      sceneKey = 'MultipleChoiceScene';
    } else if (sceneType === 'success') {
      sceneClass = SuccessScene;
      sceneKey = 'SuccessScene';
    }
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width,
      height,
      parent: containerRef.current,
      backgroundColor: '#ffffff',
      scale: {
        mode: Phaser.Scale.NONE,
      },
      // Do NOT include scene here; we'll add it after game creation
    };

    gameRef.current = new Phaser.Game({
      ...config,
      callbacks: {
        postBoot: (game) => {
          // Add and start the scene with data (best practice)
          game.scene.add(sceneKey, sceneClass, true, sceneData);
          const sceneInstance = game.scene.getScene(sceneKey);
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
  }, [unitName, sceneType, question]);

  return (
    <div
      ref={containerRef}
      className="phaser-container"
    />
  );
};
