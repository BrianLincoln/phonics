import Phaser from 'phaser';

// Shared cloud positions / speeds used by all outdoor scenes
export const CLOUD_CONFIGS = [
  { xFrac: 0.12, yFrac: 0.08, scale: 0.85, speed: 18 },
  { xFrac: 0.48, yFrac: 0.13, scale: 1.1,  speed: 12 },
  { xFrac: 0.82, yFrac: 0.06, scale: 0.72, speed: 22 },
];

/**
 * Generates the shared 'cloud' texture once per Phaser texture cache.
 * Uses overlapping circles arranged so the cloud is fully rounded on all sides —
 * no flat tops or bottoms.
 */
export function ensureCloudTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists('cloud')) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false } as any);
  gfx.fillStyle(0xffffff, 1);
  gfx.fillCircle(40,  80, 28);  // far left
  gfx.fillCircle(78,  62, 38);  // left
  gfx.fillCircle(122, 52, 46);  // centre (tallest)
  gfx.fillCircle(168, 62, 38);  // right
  gfx.fillCircle(208, 78, 28);  // far right
  gfx.fillCircle(100, 78, 34);  // bottom fill left
  gfx.fillCircle(148, 78, 34);  // bottom fill right
  gfx.generateTexture('cloud', 240, 120);
  gfx.destroy();
}

/**
 * Spawns cloud images using CLOUD_CONFIGS and returns them together with
 * their per-cloud drift speeds.  Call ensureCloudTexture first (or pass
 * ensureTexture = true to do it automatically).
 */
export function spawnClouds(
  scene: Phaser.Scene,
  w: number,
  h: number,
): { images: Phaser.GameObjects.Image[]; speeds: number[] } {
  ensureCloudTexture(scene);
  const images = CLOUD_CONFIGS.map(({ xFrac, yFrac, scale }) =>
    scene.add.image(w * xFrac, h * yFrac, 'cloud')
      .setScale(scale)
      .setAlpha(0.88)
      .setDepth(2),
  );
  const speeds = CLOUD_CONFIGS.map(c => c.speed);
  return { images, speeds };
}
