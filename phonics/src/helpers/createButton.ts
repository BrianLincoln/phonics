type ButtonOpts = {
  scene: Phaser.Scene
  x: number
  y: number
  width: number
  height: number
  label: string
  onClick: () => void
}

export function createButton({
  scene,
  x,
  y,
  width,
  height,
  label,
  onClick
}: ButtonOpts) {
  // VISUAL: match QuizIndexScene button color and outline
  const bg = scene.add.graphics();
  bg.fillStyle(0x4a90e2, 1); // blue fill
  bg.lineStyle(2, 0x2c5aa0, 1); // blue outline
  bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
  bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);

  // TEXT: center relative to button
  const text = scene.add.text(0, 0, label, { color: '#fff', fontSize: '32px' }).setOrigin(0.5);

  // CONTAINER: holds bg and text, centered at (x, y)
  const container = scene.add.container(x, y, [bg, text]);

  // INPUT: Zone exactly same size as visual, centered
  const hit = scene.add.zone(0, 0, width, height);
  hit.setOrigin(0.5, 0.5);
  hit.setInteractive();
  container.add(hit);

  // DEBUG: optional, shows hit area
  // scene.input.enableDebug(hit, 0xff0000)

  // HOVER / CLICK FEEDBACK
  hit.on('pointerover', () => bg.setAlpha(0.85));
  hit.on('pointerout', () => bg.setAlpha(1));
  hit.on('pointerdown', () => container.setScale(0.95));
  hit.on('pointerup', () => {
    container.setScale(1);
    onClick();
  });

  function animate(type: 'shake' | 'bounce') {
    if (!scene || !container) return;
    if (type === 'bounce') {
      scene.tweens.add({
        targets: container,
        scaleX: 1.12,
        scaleY: 1.12,
        duration: 120,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    } else if (type === 'shake') {
      scene.tweens.add({
        targets: container,
        x: x + 10,
        duration: 50,
        yoyo: true,
        repeat: 2,
        onComplete: () => { container.x = x; },
        ease: 'Sine.easeInOut',
      });
    }
  }
  return { bg, text, hit, container, animate };
}
