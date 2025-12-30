import React, { useState, useRef } from 'react'
import { PhaserGame } from '../../PhaserGame'
import { LeafParadeActivity } from '../../../data/activities'

interface MCQActivityProps {
  activity: LeafParadeActivity
  onComplete: (result?: any) => void
}

export const LeafParade: React.FC<MCQActivityProps> = ({ activity, onComplete }) => {
  const [questionIdx, setQuestionIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const phaserRef = useRef<any>(null)

  return (
    <div className="mcq-activity">
      <div className="phaser-container">
        <PhaserGame
          sceneType='ant-leaf'
          onSceneReady={scene => { phaserRef.current = scene }}
        />
      </div>
    </div>
  )
}
