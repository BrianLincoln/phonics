import Phaser from 'phaser';
import { Companion } from './Companion';
import { CompanionController } from './CompanionController';
import { type CompanionAnimalId } from '../store/profiles';
import { CLOUD_CONFIGS, spawnClouds } from './sceneUtils';

/**
 * Abstract base for all outdoor game scenes.
 * Owns: sky/hills/ground/sun environment, clouds, companion + controller,
 * resize handling, and the shared update loop.
 *
 * Subclasses provide:
 *   - constructor(key)
 *   - create()  — call buildEnvironment(), then their own companion/card setup
 *   - Any extra public API (prepareForQuestion, onQuestionAnswered, etc.)
 *
 * Override hillsTextureKey if the scene needs a unique canvas texture key
 * (required when multiple scenes share the same Phaser texture cache).
 */
export abstract class BaseGameScene extends Phaser.Scene {
  // Shared companion references — accessible by subclasses
  protected companion?: Companion;
  protected companionController?: CompanionController;

  // Cloud state
  protected clouds: Phaser.GameObjects.Image[] = [];
  protected cloudSpeeds: number[] = [];

  // Environment drawables — managed entirely by this base class
  private sky?: Phaser.GameObjects.Graphics;
  private hillsImage?: Phaser.GameObjects.Image;
  private ground?: Phaser.GameObjects.Graphics;
  private sun?: Phaser.GameObjects.Graphics;

  // Resize debounce
  private resizeTimer?: ReturnType<typeof setTimeout>;
  private boundResizeHandler?: () => void;

  // ── Texture key hook ────────────────────────────────────────────────────────

  /**
   * Canvas texture key used for the hills layer.
   * Override in subclasses that need a unique key to avoid cross-scene conflicts.
   */
  protected get hillsTextureKey(): string {
    return 'hills';
  }

  // ── Phaser lifecycle ────────────────────────────────────────────────────────

  preload() {
    const animal = this.getActiveAnimalId();
    this.load.spritesheet('companion', `/src/assets/${animal}_sprite.png`, {
      frameWidth: 200,
      frameHeight: 200,
    });
  }

  shutdown() {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = undefined;
    }
    if (this.boundResizeHandler) {
      this.scale.off('resize', this.boundResizeHandler);
      this.boundResizeHandler = undefined;
    }
  }

  update(_time: number, delta: number) {
    const w = this.cameras.main.width;
    this.clouds.forEach((cloud, i) => {
      cloud.x -= this.cloudSpeeds[i] * (delta / 1000);
      if (cloud.x < -130) cloud.x = w + 130;
    });
    if (this.companion && this.companionController) {
      const h = this.cameras.main.height;
      this.companion.updateShadow(this.companionController.groundY, w * 0.92, h * 0.12);
    }
  }

  // ── Shared setup helpers (called from subclass create()) ────────────────────

  protected buildEnvironment() {
    this.cameras.main.setRoundPixels(true);

    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.redrawEnvironment(w, h);
    this.spawnCloudsLayer(w, h);

    this.boundResizeHandler = () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        const nw = this.cameras.main.width;
        const nh = this.cameras.main.height;
        this.redrawEnvironment(nw, nh);
        CLOUD_CONFIGS.forEach(({ yFrac }, i) => {
          if (this.clouds[i]) this.clouds[i].y = nh * yFrac;
        });
      }, 250);
    };
    this.scale.on('resize', this.boundResizeHandler);
  }

  /**
   * Creates a Companion + CompanionController at (x, cam.height * 0.78).
   * Subclass calls this, then triggers whatever intro animation it needs.
   */
  protected setupCompanion(x: number) {
    const cam = this.cameras.main;
    this.companion = new Companion({
      scene: this,
      x,
      y: cam.height * 0.82,
    });
    this.companion.setScale(0.5);
    this.companion.setDepth(9);
    this.companion.setIdle();

    this.companionController = new CompanionController(this, this.companion);
  }

  private getActiveAnimalId(): CompanionAnimalId {
    try {
      const profileId = sessionStorage.getItem('phonics_active_profile_id');
      if (!profileId) return 'crow';
      const raw = localStorage.getItem('phonics_profiles');
      if (!raw) return 'crow';
      const profiles: Array<{ id: string; companionAnimal?: string }> = JSON.parse(raw);
      const profile = profiles.find(p => p.id === profileId);
      return (profile?.companionAnimal as CompanionAnimalId) ?? 'crow';
    } catch {
      return 'crow';
    }
  }

  // ── Private environment drawing ─────────────────────────────────────────────

  private redrawEnvironment(w: number, h: number) {
    const groundY = h * 0.62;
    const sunX = w * 0.92;
    const sunY = h * 0.12;

    // Sky
    if (this.sky) { this.sky.destroy(); }
    this.sky = this.add.graphics();
    this.sky.fillGradientStyle(0x3a8fd4, 0x3a8fd4, 0xb8dff0, 0xb8dff0, 1);
    this.sky.fillRect(0, 0, w, h);

    // Hills (canvas texture; must be removed + recreated on resize)
    const key = this.hillsTextureKey;
    if (this.hillsImage) { this.hillsImage.destroy(); this.hillsImage = undefined; }
    if (this.textures.exists(key)) { this.textures.remove(key); }

    const ct = this.textures.createCanvas(key, w, h);
    const ctx = ct.getContext();
    const defs = [
      { cx: w * 0.20, rx: w * 0.275, ry: h * 0.09 },
      { cx: w * 0.72, rx: w * 0.25,  ry: h * 0.075 },
      { cx: w * 0.95, rx: w * 0.175, ry: h * 0.06 },
    ];
    for (const { cx, rx, ry } of defs) {
      const dx = sunX - cx;
      const dy = sunY - groundY;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / len;
      const ny = dy / len;
      const r = Math.max(rx, ry);
      const grad = ctx.createLinearGradient(
        cx + nx * r, groundY + ny * r,
        cx - nx * r * 0.6, groundY - ny * r * 0.6,
      );
      grad.addColorStop(0, '#92c9b8');
      grad.addColorStop(1, '#4a8872');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, groundY, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ct.refresh();
    this.hillsImage = this.add.image(0, 0, key).setOrigin(0, 0);

    // Ground
    if (this.ground) { this.ground.destroy(); }
    this.ground = this.add.graphics();
    this.ground.fillGradientStyle(0x5aad72, 0x5aad72, 0x4ea832, 0x4ea832, 1);
    this.ground.fillRect(0, groundY, w, h - groundY);

    // Sun
    if (this.sun) { this.sun.destroy(); }
    this.sun = this.add.graphics();
    this.sun.fillStyle(0xffe066, 1);
    this.sun.fillCircle(sunX, sunY, w * 0.055);

    this.sky.setDepth(0);
    this.hillsImage.setDepth(0);
    this.ground.setDepth(0);
    this.sun.setDepth(0);
  }

  private spawnCloudsLayer(w: number, h: number) {
    const { images, speeds } = spawnClouds(this, w, h);
    this.clouds = images;
    this.cloudSpeeds = speeds;
  }
}
