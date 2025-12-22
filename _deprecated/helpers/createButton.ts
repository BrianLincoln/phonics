type ButtonOpts = {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width?: number;
  height?: number;
  label: string;
  onClick: () => void;
  fontSize?: number;
  bgColor?: number;
  borderColor?: number;
  textColor?: string;
};

export function createButton({
  scene,
  x,
  y,
  width,
  height,
  label,
  onClick,
  fontSize,
  bgColor = 0x4a90e2,
  borderColor = 0x2c5aa0,
  textColor = '#fff'
}: ButtonOpts) {
  // Responsive sizing if not provided
  const gameWidth = scene.scale.gameSize.width;
  const gameHeight = scene.scale.gameSize.height;
  const btnWidth = width ?? Math.max(90, Math.min(220, Math.floor(gameWidth * 0.17)));
  const btnHeight = height ?? Math.max(32, Math.min(60, Math.floor(gameHeight * 0.055)));
  let btnFont = fontSize ?? Math.max(12, Math.min(22, Math.floor(btnHeight * 0.44)));
  // VISUAL: use provided or default colors
  const bg = scene.add.graphics();
  bg.fillStyle(bgColor, 1);
  bg.lineStyle(2, borderColor, 1);
  bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
  bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);

  // TEXT: center relative to button
  const text = scene.add.text(0, 0, label, {
    color: textColor,
    fontSize: btnFont,
    wordWrap: { width: btnWidth - 24, useAdvancedWrap: true },
    align: 'center',
  }).setOrigin(0.5);
  // Dynamically shrink font if text overflows
  while ((text.width > btnWidth - 24 || text.height > btnHeight - 8) && btnFont > 10) {
    btnFont -= 1;
    text.setFontSize(btnFont);
  }

  // CONTAINER: holds bg and text, centered at (x, y)
  const container = scene.add.container(x, y, [bg, text]);

  // INPUT: Zone exactly same size as visual, centered
  const hit = scene.add.zone(0, 0, btnWidth, btnHeight);
  hit.setOrigin(0.5, 0.5);
  hit.setInteractive();
  container.add(hit);

  // HOVER / CLICK FEEDBACK
  hit.on('pointerover', () => {
    bg.setAlpha(0.85);
    scene.input.setDefaultCursor('pointer');
  });
  hit.on('pointerout', () => {
    bg.setAlpha(1);
    scene.input.setDefaultCursor('default');
  });
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
