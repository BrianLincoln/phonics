import Phaser from 'phaser';
import { Companion } from './Companion';
import { CompanionController } from './CompanionController';
import { type CompanionAnimalId, getActiveCompanion } from '../store/profiles';

type LandscapeId = 'mountain' | 'forest' | 'backyard' | 'arctic' | 'pond';

const COMPANION_LANDSCAPE: Record<CompanionAnimalId, LandscapeId> = {
  crow: 'forest',
  frog: 'pond',
  cat: 'backyard',
  penguin: 'arctic',
};
import { CLOUD_CONFIGS, spawnClouds } from './sceneUtils';
import { ANIMAL_SPRITE_URLS } from '../assets/spriteUrls';

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
    this.load.spritesheet('companion', ANIMAL_SPRITE_URLS[animal], {
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
    return getActiveCompanion();
  }

  private getActiveLandscape(): LandscapeId {
    return COMPANION_LANDSCAPE[this.getActiveAnimalId()];
  }

  // ── Private environment drawing ─────────────────────────────────────────────

  private redrawEnvironment(w: number, h: number) {
    const landscape = this.getActiveLandscape();
    const groundY = h * 0.60;

    if (this.sky) { this.sky.destroy(); }
    this.sky = this.add.graphics();

    const key = this.hillsTextureKey;
    if (this.hillsImage) { this.hillsImage.destroy(); this.hillsImage = undefined; }
    if (this.textures.exists(key)) { this.textures.remove(key); }
    if (this.ground) { this.ground.destroy(); this.ground = undefined; }
    if (this.sun) { this.sun.destroy(); this.sun = undefined; }

    const ct = this.textures.createCanvas(key, w, h);
    const ctx = ct.getContext();

    if (landscape === 'forest') {
      this.drawForestLandscape(ctx, w, h, groundY);
      this.sky.fillGradientStyle(0x8fbcd4, 0x8fbcd4, 0xc8dfca, 0xc8dfca, 1);
    } else if (landscape === 'backyard') {
      this.drawBackyardLandscape(ctx, w, h, groundY);
      this.sky.fillGradientStyle(0xa0c4e0, 0xa0c4e0, 0xd8eaf0, 0xd8eaf0, 1);
    } else if (landscape === 'arctic') {
      this.drawArcticLandscape(ctx, w, h, groundY);
      this.sky.fillGradientStyle(0x8898c8, 0x8898c8, 0xc8d8f0, 0xc8d8f0, 1);
    } else if (landscape === 'pond') {
      this.drawPondLandscape(ctx, w, h, groundY);
      this.sky.fillGradientStyle(0x90c4d8, 0x90c4d8, 0xc8e4d8, 0xc8e4d8, 1);
    } else {
      this.drawMountainLandscape(ctx, w, h, groundY);
      this.sky.fillGradientStyle(0xede0cc, 0xede0cc, 0xf8f0e2, 0xf8f0e2, 1);
    }
    this.sky.fillRect(0, 0, w, h);

    ct.refresh();
    this.hillsImage = this.add.image(0, 0, key).setOrigin(0, 0);

    this.sky.setDepth(0);
    this.hillsImage.setDepth(1);
  }

  private drawMountainLandscape(ctx: CanvasRenderingContext2D, w: number, h: number, groundY: number) {
    // Fill sky area so transparent gaps between mountains blend in
    const skyBg = ctx.createLinearGradient(0, 0, 0, groundY);
    skyBg.addColorStop(0, '#ede0cc');
    skyBg.addColorStop(1, '#f8f0e2');
    ctx.fillStyle = skyBg;
    ctx.fillRect(0, 0, w, groundY);

    const mtnBase = groundY + h * 0.005;

    const applySnow = (
      px: number, peakY: number,
      lcpx: number, lcpFrac: number, left: number,
      rcpx: number, rcpFrac: number, right: number,
      snowFrac: number, color: string
    ) => {
      const mtnH = mtnBase - peakY;
      const snowH = mtnH * snowFrac;
      ctx.save();
      ctx.beginPath();
      ctx.rect(-1, peakY - 1, w + 2, snowH);
      ctx.clip();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(px, peakY);
      ctx.quadraticCurveTo(lcpx, peakY + mtnH * lcpFrac, left, mtnBase);
      ctx.lineTo(px, mtnBase);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px, peakY);
      ctx.lineTo(px, mtnBase);
      ctx.lineTo(right, mtnBase);
      ctx.quadraticCurveTo(rcpx, peakY + mtnH * rcpFrac, px, peakY);
      ctx.fill();
      ctx.restore();
    };

    // Far mountain
    {
      const px = w * 0.36;
      const peakY = groundY - h * 0.21;
      const left = px - w * 0.16;
      const right = px + w * 0.19;
      const lcpx = px - w * 0.07;
      const rcpx = px + w * 0.08;

      ctx.fillStyle = '#d8c4a2';
      ctx.beginPath();
      ctx.moveTo(px, peakY);
      ctx.quadraticCurveTo(lcpx, peakY + (mtnBase - peakY) * 0.52, left, mtnBase);
      ctx.lineTo(px, mtnBase);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#beaa84';
      ctx.beginPath();
      ctx.moveTo(px, peakY);
      ctx.lineTo(px, mtnBase);
      ctx.lineTo(right, mtnBase);
      ctx.quadraticCurveTo(rcpx, peakY + (mtnBase - peakY) * 0.48, px, peakY);
      ctx.fill();

      const farHaze = ctx.createLinearGradient(0, peakY, 0, mtnBase);
      farHaze.addColorStop(0, 'rgba(248, 240, 226, 0.38)');
      farHaze.addColorStop(1, 'rgba(248, 240, 226, 0.06)');
      ctx.fillStyle = farHaze;
      ctx.beginPath();
      ctx.moveTo(px, peakY);
      ctx.quadraticCurveTo(lcpx, peakY + (mtnBase - peakY) * 0.52, left, mtnBase);
      ctx.lineTo(right, mtnBase);
      ctx.quadraticCurveTo(rcpx, peakY + (mtnBase - peakY) * 0.48, px, peakY);
      ctx.closePath();
      ctx.fill();

      applySnow(px, peakY, lcpx, 0.52, left, rcpx, 0.48, right, 0.28, 'rgba(242, 238, 234, 0.60)');
    }

    // Near mountain
    {
      const px = w * 0.20;
      const peakY = groundY - h * 0.35;
      const left = px - w * 0.20;
      const right = px + w * 0.16;
      const lcpx = px - w * 0.08;
      const rcpx = px + w * 0.06;

      ctx.fillStyle = '#c4a06a';
      ctx.beginPath();
      ctx.moveTo(px, peakY);
      ctx.quadraticCurveTo(lcpx, peakY + (mtnBase - peakY) * 0.55, left, mtnBase);
      ctx.lineTo(px, mtnBase);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#96724a';
      ctx.beginPath();
      ctx.moveTo(px, peakY);
      ctx.lineTo(px, mtnBase);
      ctx.lineTo(right, mtnBase);
      ctx.quadraticCurveTo(rcpx, peakY + (mtnBase - peakY) * 0.45, px, peakY);
      ctx.fill();

      applySnow(px, peakY, lcpx, 0.55, left, rcpx, 0.45, right, 0.22, '#f0ece8');
    }

    // Pine silhouettes along horizon
    const drawPine = (tx: number, th: number) => {
      ctx.fillStyle = '#b89a72';
      for (let i = 0; i < 3; i++) {
        const layerBase = groundY - th * 0.04 - th * (i / 3) * 0.72;
        const layerTop = groundY - th * 0.04 - th * ((i + 1) / 3) * 0.72 - th * 0.08;
        const hw = th * 0.28 * (1 - i * 0.10);
        ctx.beginPath();
        ctx.moveTo(tx, layerTop);
        ctx.lineTo(tx - hw, layerBase);
        ctx.lineTo(tx + hw, layerBase);
        ctx.closePath();
        ctx.fill();
      }
    };

    const trees = [
      { x: w * 0.03, h: h * 0.12 }, { x: w * 0.07, h: h * 0.16 }, { x: w * 0.11, h: h * 0.11 },
      { x: w * 0.15, h: h * 0.14 }, { x: w * 0.29, h: h * 0.13 }, { x: w * 0.33, h: h * 0.10 },
      { x: w * 0.37, h: h * 0.15 }, { x: w * 0.42, h: h * 0.12 }, { x: w * 0.63, h: h * 0.13 },
      { x: w * 0.67, h: h * 0.16 }, { x: w * 0.71, h: h * 0.11 }, { x: w * 0.75, h: h * 0.14 },
      { x: w * 0.90, h: h * 0.12 }, { x: w * 0.94, h: h * 0.15 }, { x: w * 0.98, h: h * 0.10 },
    ];
    for (const t of trees) drawPine(t.x, t.h);

    // Atmospheric haze at horizon
    const hazeGrad = ctx.createLinearGradient(0, groundY - h * 0.22, 0, groundY);
    hazeGrad.addColorStop(0, 'rgba(248, 240, 226, 0)');
    hazeGrad.addColorStop(1, 'rgba(248, 240, 226, 0.72)');
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, groundY - h * 0.22, w, h * 0.22);

    this.drawGround(ctx, w, h, groundY, '#ceae5d', '#c49c55', '#bf8d4d', 'rgba(55, 28, 6,');
  }

  private drawForestLandscape(ctx: CanvasRenderingContext2D, w: number, h: number, groundY: number) {
    // Sky gradient
    const skyBg = ctx.createLinearGradient(0, 0, 0, groundY);
    skyBg.addColorStop(0, '#8fbcd4');
    skyBg.addColorStop(1, '#c8dfca');
    ctx.fillStyle = skyBg;
    ctx.fillRect(0, 0, w, groundY);

    // Far rolling hill
    ctx.fillStyle = '#5a8a46';
    ctx.beginPath();
    ctx.moveTo(-2, groundY);
    ctx.quadraticCurveTo(w * 0.15, groundY - h * 0.14, w * 0.38, groundY - h * 0.10);
    ctx.quadraticCurveTo(w * 0.58, groundY - h * 0.06, w * 0.72, groundY - h * 0.12);
    ctx.quadraticCurveTo(w * 0.88, groundY - h * 0.17, w + 2, groundY - h * 0.08);
    ctx.lineTo(w + 2, groundY);
    ctx.closePath();
    ctx.fill();

    // Near rolling hill (slightly darker, overlaps)
    ctx.fillStyle = '#4a7a36';
    ctx.beginPath();
    ctx.moveTo(-2, groundY);
    ctx.quadraticCurveTo(w * 0.10, groundY - h * 0.08, w * 0.25, groundY - h * 0.05);
    ctx.quadraticCurveTo(w * 0.45, groundY - h * 0.02, w * 0.60, groundY - h * 0.07);
    ctx.quadraticCurveTo(w * 0.78, groundY - h * 0.11, w + 2, groundY - h * 0.04);
    ctx.lineTo(w + 2, groundY);
    ctx.closePath();
    ctx.fill();

    // Dense deciduous tree canopy along the horizon — drawn as rounded blobs
    const drawDeciduous = (tx: number, th: number, color: string) =>
      this.drawDeciduousTree(ctx, groundY, tx, th, color);

    const forestTrees = [
      { x: w * 0.01, h: h * 0.20, c: '#2e5e1e' }, { x: w * 0.05, h: h * 0.26, c: '#3a7228' },
      { x: w * 0.10, h: h * 0.22, c: '#2e5e1e' }, { x: w * 0.14, h: h * 0.18, c: '#4a8232' },
      { x: w * 0.19, h: h * 0.24, c: '#366620' }, { x: w * 0.28, h: h * 0.21, c: '#3a7228' },
      { x: w * 0.34, h: h * 0.17, c: '#2e5e1e' }, { x: w * 0.40, h: h * 0.23, c: '#4a8232' },
      { x: w * 0.47, h: h * 0.19, c: '#366620' }, { x: w * 0.54, h: h * 0.22, c: '#2e5e1e' },
      { x: w * 0.61, h: h * 0.25, c: '#3a7228' }, { x: w * 0.67, h: h * 0.18, c: '#4a8232' },
      { x: w * 0.73, h: h * 0.21, c: '#366620' }, { x: w * 0.79, h: h * 0.24, c: '#2e5e1e' },
      { x: w * 0.85, h: h * 0.20, c: '#3a7228' }, { x: w * 0.91, h: h * 0.23, c: '#4a8232' },
      { x: w * 0.96, h: h * 0.17, c: '#366620' }, { x: w * 1.00, h: h * 0.22, c: '#2e5e1e' },
    ];
    for (const t of forestTrees) drawDeciduous(t.x, t.h, t.c);

    // Atmospheric haze at horizon (green-tinted)
    const hazeGrad = ctx.createLinearGradient(0, groundY - h * 0.18, 0, groundY);
    hazeGrad.addColorStop(0, 'rgba(200, 223, 202, 0)');
    hazeGrad.addColorStop(1, 'rgba(200, 223, 202, 0.55)');
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, groundY - h * 0.18, w, h * 0.18);

    this.drawGround(ctx, w, h, groundY, '#6aaa46', '#5a9838', '#4a882e', 'rgba(20, 48, 10,');
  }

  private drawBackyardLandscape(ctx: CanvasRenderingContext2D, w: number, h: number, groundY: number) {
    // Sky
    const skyBg = ctx.createLinearGradient(0, 0, 0, groundY);
    skyBg.addColorStop(0, '#a0c4e0');
    skyBg.addColorStop(1, '#d8eaf0');
    ctx.fillStyle = skyBg;
    ctx.fillRect(0, 0, w, groundY);

    // House on far left — partially cropped off screen
    const houseRight = w * 0.22;
    const houseLeft = -w * 0.06; // cut off left edge
    const wallTop = groundY - h * 0.38;
    const wallBot = groundY;
    const roofPeakX = (houseLeft + houseRight) / 2;
    const roofPeakY = wallTop - h * 0.18;
    const roofOverhangL = houseLeft - w * 0.01;
    const roofOverhangR = houseRight + w * 0.015;

    // Wall (siding — warm cream)
    ctx.fillStyle = '#e8dcc8';
    ctx.fillRect(houseLeft, wallTop, houseRight - houseLeft, wallBot - wallTop);

    // Wall shadow on right edge
    ctx.fillStyle = '#c8b89a';
    ctx.fillRect(houseRight - w * 0.018, wallTop, w * 0.018, wallBot - wallTop);

    // Horizontal siding lines
    ctx.strokeStyle = '#d4c4a8';
    ctx.lineWidth = 1;
    for (let sy = wallTop + h * 0.04; sy < wallBot; sy += h * 0.04) {
      ctx.beginPath();
      ctx.moveTo(houseLeft, sy);
      ctx.lineTo(houseRight, sy);
      ctx.stroke();
    }

    // Windows — two on the same level
    const winY = wallTop + h * 0.10;
    const winW = w * 0.065;
    const winH = h * 0.10;
    const winX = houseRight - w * 0.10;
    const win2X = 2 * roofPeakX - winX - winW; // mirror of winX across roof peak

    const drawHouseWindow = (wx: number) => {
      ctx.fillStyle = '#a0b8c8';
      ctx.fillRect(wx, winY, winW, winH);
      ctx.fillStyle = '#d8e8f0';
      ctx.fillRect(wx, winY, winW, winH * 0.45);
      ctx.fillStyle = '#7898a8';
      ctx.fillRect(wx, winY + winH * 0.47, winW, winH * 0.06);
      ctx.fillRect(wx + winW * 0.46, winY, winW * 0.08, winH);
      ctx.strokeStyle = '#8a7060';
      ctx.lineWidth = 2;
      ctx.strokeRect(wx, winY, winW, winH);
    };

    drawHouseWindow(win2X);
    drawHouseWindow(winX);

    // Roof — left face (lighter, sun-facing): left overhang → peak → peak base
    ctx.fillStyle = '#c05030';
    ctx.beginPath();
    ctx.moveTo(roofOverhangL, wallTop);
    ctx.lineTo(roofPeakX, roofPeakY);
    ctx.lineTo(roofPeakX, wallTop);
    ctx.closePath();
    ctx.fill();

    // Roof — right face (darker, shadow side): peak → right overhang → peak base
    ctx.fillStyle = '#982818';
    ctx.beginPath();
    ctx.moveTo(roofPeakX, wallTop);
    ctx.lineTo(roofPeakX, roofPeakY);
    ctx.lineTo(roofOverhangR, wallTop);
    ctx.closePath();
    ctx.fill();

    // Roof fascia (overhang edge strip)
    ctx.fillStyle = '#e0c8a0';
    ctx.fillRect(roofOverhangL, wallTop - h * 0.008, roofOverhangR - roofOverhangL, h * 0.012);

    // Garden trees — round apple-tree shapes, warmer greens
    const drawGardenTree = (tx: number, th: number, canopyColor: string) => {
      const trunkH = th * 0.32;
      const crownR = th * 0.34;
      const crownY = groundY - trunkH - crownR * 0.8;
      ctx.fillStyle = '#8a6240';
      ctx.fillRect(tx - th * 0.06, groundY - trunkH, th * 0.12, trunkH);
      ctx.fillStyle = canopyColor;
      ctx.beginPath();
      ctx.arc(tx, crownY, crownR, 0, Math.PI * 2);
      ctx.arc(tx - crownR * 0.5, crownY + crownR * 0.3, crownR * 0.68, 0, Math.PI * 2);
      ctx.arc(tx + crownR * 0.5, crownY + crownR * 0.3, crownR * 0.68, 0, Math.PI * 2);
      ctx.fill();
    };

    const gardenTrees = [
      { x: w * 0.06, h: h * 0.20, c: '#5a9a2e' }, { x: w * 0.12, h: h * 0.25, c: '#4a8a22' },
      { x: w * 0.82, h: h * 0.22, c: '#4a8a22' }, { x: w * 0.88, h: h * 0.18, c: '#5a9a2e' },
      { x: w * 0.94, h: h * 0.24, c: '#3d7a1a' },
    ];
    for (const t of gardenTrees) drawGardenTree(t.x, t.h, t.c);

    // Wooden fence — horizontal rails + pickets along horizon
    const fenceTop = groundY - h * 0.115;
    const fenceBot = groundY + h * 0.005;
    const railH = h * 0.018;
    const picketW = w * 0.018;
    const picketGap = w * 0.026;
    const picketColor = '#c8a870';
    const picketShadow = '#a08850';
    const railColor = '#b89860';

    // Draw pickets
    let px = w * 0.0;
    while (px < w + picketW) {
      // Face
      ctx.fillStyle = picketColor;
      ctx.fillRect(px, fenceTop, picketW * 0.74, fenceBot - fenceTop);
      // Shadow on right portion of face (clamped to face width)
      ctx.fillStyle = picketShadow;
      ctx.fillRect(px + picketW * 0.55, fenceTop, picketW * 0.19, fenceBot - fenceTop);
      // Pointed top — left (light) half
      ctx.fillStyle = picketColor;
      ctx.beginPath();
      ctx.moveTo(px, fenceTop);
      ctx.lineTo(px + picketW * 0.37, fenceTop - h * 0.028);
      ctx.lineTo(px + picketW * 0.74, fenceTop);
      ctx.closePath();
      ctx.fill();
      // Pointed top — right (shadow) half
      ctx.fillStyle = picketShadow;
      ctx.beginPath();
      ctx.moveTo(px + picketW * 0.37, fenceTop - h * 0.028);
      ctx.lineTo(px + picketW * 0.37, fenceTop);
      ctx.lineTo(px + picketW * 0.74, fenceTop);
      ctx.closePath();
      ctx.fill();
      px += picketW + picketGap;
    }

    // Horizontal rails on top of pickets
    ctx.fillStyle = railColor;
    ctx.fillRect(0, fenceTop + (fenceBot - fenceTop) * 0.15, w, railH);
    ctx.fillRect(0, fenceTop + (fenceBot - fenceTop) * 0.65, w, railH);

    // Flower clusters near fence base
    const drawFlowers = (fx: number, count: number, color: string) => {
      for (let i = 0; i < count; i++) {
        const ox = fx + i * w * 0.018;
        const oy = groundY - h * 0.01 - (i % 2) * h * 0.012;
        ctx.fillStyle = '#6a9a30';
        ctx.fillRect(ox - 1, oy, 2, h * 0.025);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(ox, oy, h * 0.012, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawFlowers(w * 0.22, 4, '#e85a6a');
    drawFlowers(w * 0.38, 3, '#f0c030');
    drawFlowers(w * 0.74, 5, '#e85a6a');
    drawFlowers(w * 0.44, 3, '#d060d0');

    // Haze at horizon
    const hazeGrad = ctx.createLinearGradient(0, groundY - h * 0.15, 0, groundY);
    hazeGrad.addColorStop(0, 'rgba(216, 234, 240, 0)');
    hazeGrad.addColorStop(1, 'rgba(216, 234, 240, 0.50)');
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, groundY - h * 0.15, w, h * 0.15);

    this.drawGround(ctx, w, h, groundY, '#7cb84a', '#6aaa3a', '#5a9830', 'rgba(20, 50, 10,');
  }

  private drawPondLandscape(ctx: CanvasRenderingContext2D, w: number, h: number, groundY: number) {
    // Sky — warm humid haze, like a summer morning near water
    const skyBg = ctx.createLinearGradient(0, 0, 0, groundY);
    skyBg.addColorStop(0, '#90c4d8');
    skyBg.addColorStop(1, '#c8e4d8');
    ctx.fillStyle = skyBg;
    ctx.fillRect(0, 0, w, groundY);

    // Distant bank — left side is a large plateau that levels off and exits off-screen left;
    // only its right slope is visible, descending to meet the rolling right bank
    ctx.fillStyle = '#5e9a52';
    ctx.beginPath();
    ctx.moveTo(-w * 0.15, groundY);                                                     // bottom-left off screen
    ctx.lineTo(-w * 0.15, groundY - h * 0.28);                                          // up left wall (off screen)
    ctx.lineTo(w * 0.08, groundY - h * 0.28);                                           // flat plateau top
    ctx.quadraticCurveTo(w * 0.20, groundY - h * 0.26, w * 0.32, groundY - h * 0.20); // slope down right
    ctx.quadraticCurveTo(w * 0.44, groundY - h * 0.20, w * 0.55, groundY - h * 0.18);
    ctx.quadraticCurveTo(w * 0.70, groundY - h * 0.21, w * 0.86, groundY - h * 0.24);
    ctx.quadraticCurveTo(w * 0.93, groundY - h * 0.20, w + 2, groundY - h * 0.17);
    ctx.lineTo(w + 2, groundY);
    ctx.closePath();
    ctx.fill();

    // Far tree layer — right side only; y = base of trunk matched to distant bank height at that x
    const farTrees = [
      { x: w * 0.82, h: h * 0.12, c: '#4a7862', y: groundY - h * 0.21 },
      { x: w * 0.80, h: h * 0.10, c: '#3e6858', y: groundY - h * 0.20 },
      { x: w * 0.70, h: h * 0.10, c: '#3e6858', y: groundY - h * 0.19 },
    ];
    for (const t of farTrees) this.drawDeciduousTree(ctx, t.y, t.x, t.h, t.c);

    // Distance haze over far trees — softens depth
    const farHaze = ctx.createLinearGradient(0, groundY - h * 0.48, 0, groundY - h * 0.14);
    farHaze.addColorStop(0, 'rgba(180, 218, 212, 0)');
    farHaze.addColorStop(1, 'rgba(180, 218, 212, 0.5)');
    ctx.fillStyle = farHaze;
    ctx.fillRect(0, groundY - h * 0.48, w, h * 0.34);

    // Ground layer
    this.drawGround(ctx, w, h, groundY, '#6aaa46', '#5a9838', '#4a882e', 'rgba(20, 48, 10,');

    // Atmospheric haze — green-tinted moisture at horizon
    const hazeGrad = ctx.createLinearGradient(0, groundY - h * 0.20, 0, groundY);
    hazeGrad.addColorStop(0, 'rgba(200, 228, 216, 0)');
    hazeGrad.addColorStop(1, 'rgba(200, 228, 216, 0.58)');
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, groundY - h * 0.20, w, h * 0.20);

    // Raised bank mounds — drawn after haze so they aren't washed out by it
    const bankPeak = groundY - h * 0.14;
    ctx.fillStyle = '#6aaa46';
    // Left bank — extends well off the left edge so it reads as a continuous bank, not a bump
    ctx.beginPath();
    ctx.moveTo(-w * 0.15, groundY);
    ctx.lineTo(-w * 0.15, groundY - h * 0.22);
    ctx.quadraticCurveTo(w * 0.12, groundY - h * 0.20, w * 0.36, groundY);
    ctx.closePath();
    ctx.fill();
    // Right bank
    ctx.beginPath();
    ctx.moveTo(w + 2, groundY);
    ctx.lineTo(w + 2, bankPeak);
    ctx.quadraticCurveTo(w * 0.90, bankPeak - h * 0.02, w * 0.78, groundY);
    ctx.closePath();
    ctx.fill();

    // Pond water — drawn after ground/banks so it sits on top
    const cx = w * 0.50;
    const cy = groundY;
    const pondRx = w * 0.43;
    const pondRy = h * 0.13;

    const waterGrad = ctx.createLinearGradient(0, cy - pondRy, 0, cy + pondRy);
    waterGrad.addColorStop(0, '#5aaac8');
    waterGrad.addColorStop(0.5, '#3d8aaa');
    waterGrad.addColorStop(1, '#2e6e8e');
    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, pondRx, pondRy, 0, 0, Math.PI * 2);
    ctx.fill();

    // Water shimmer lines — clipped to the oval
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, pondRx, pondRy, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = 'rgba(180, 220, 240, 0.30)';
    ctx.lineWidth = 1.2;
    for (let i = 1; i < 7; i++) {
      const wy = (cy - pondRy) + (pondRy * 2) * (i / 7);
      const segW = pondRx * 0.25;
      const ox = cx - pondRx * 0.3 + (pondRx * 0.6) * ((i % 3) * 0.4);
      ctx.beginPath();
      ctx.moveTo(ox, wy);
      ctx.lineTo(ox + segW, wy);
      ctx.stroke();
    }
    ctx.restore();

    // Lily pads — flat ellipses with a notch cut in
    const drawLilyPad = (lx: number, ly: number, prx: number, pry: number, angle: number) => {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle);
      ctx.fillStyle = '#2e6e22';
      ctx.beginPath();
      ctx.ellipse(0, 0, prx, pry, 0, 0.35, Math.PI * 2 - 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(80,160,60,0.5)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -pry * 0.9);
      ctx.stroke();
      ctx.restore();
    };

    drawLilyPad(w * 0.28, groundY - h * 0.03, w * 0.034, h * 0.020, 0.3);
    drawLilyPad(w * 0.40, groundY - h * 0.07, w * 0.028, h * 0.017, -0.5);
    drawLilyPad(w * 0.52, groundY - h * 0.05, w * 0.040, h * 0.024, 0.8);
    drawLilyPad(w * 0.64, groundY - h * 0.02, w * 0.030, h * 0.018, -0.2);
    drawLilyPad(w * 0.44, groundY - h * 0.09, w * 0.022, h * 0.013, -0.7);

    // Lily pad flowers
    const drawFlower = (fx: number, fy: number) => {
      ctx.fillStyle = '#f0d040';
      ctx.beginPath();
      ctx.arc(fx, fy, h * 0.007, 0, Math.PI * 2);
      ctx.fill();
    };
    drawFlower(w * 0.28, groundY - h * 0.04);
    drawFlower(w * 0.52, groundY - h * 0.06);

    // Near-distance trees — right side only, drawn after pond so they appear in front of water
    const nearTrees = [
      // behind pond
      { x: w * 0.5, h: h * 0.31, c: '#3e6858', y: groundY - h * 0.17 },
      { x: w * 0.72, h: h * 0.25, c: '#4a7862', y: groundY - h * 0.18 },
      { x: w * 0.6, h: h * 0.28, c: '#335f45', y: groundY - h * 0.16 },

      // right of pond
      { x: w * 1.03, h: h * 0.5, c: '#335f45', y: groundY - h * 0.2 },
      { x: w * 0.90, h: h * 0.31, c: '#4a7862', y: groundY - h * 0.13 },
      { x: w * 0.98, h: h * 0.41, c: '#3e6858', y: groundY - h * 0.08 },
    ];

    for (const t of nearTrees) this.drawDeciduousTree(ctx, t.y, t.x, t.h, t.c);

    // Cattails — at the bottom edge of the pond, drawn last so they appear in front of water
    const drawReed = (rrx: number, rrh: number) => {
      // Leaves — long blade-like strokes fanning up from the base
      ctx.strokeStyle = '#5a9030';
      ctx.lineWidth = 2.5;
      // Inner left — nearly vertical with slight lean
      ctx.beginPath();
      ctx.moveTo(rrx, groundY);
      ctx.quadraticCurveTo(rrx - rrh * 0.08, groundY - rrh * 0.55, rrx - rrh * 0.12, groundY - rrh * 0.80);
      ctx.stroke();
      // Inner right
      ctx.beginPath();
      ctx.moveTo(rrx, groundY);
      ctx.quadraticCurveTo(rrx + rrh * 0.08, groundY - rrh * 0.55, rrx + rrh * 0.12, groundY - rrh * 0.80);
      ctx.stroke();
      // Outer left — arcs wider
      ctx.beginPath();
      ctx.moveTo(rrx, groundY);
      ctx.quadraticCurveTo(rrx - rrh * 0.22, groundY - rrh * 0.40, rrx - rrh * 0.38, groundY - rrh * 0.60);
      ctx.stroke();
      // Outer right
      ctx.beginPath();
      ctx.moveTo(rrx, groundY);
      ctx.quadraticCurveTo(rrx + rrh * 0.22, groundY - rrh * 0.40, rrx + rrh * 0.38, groundY - rrh * 0.60);
      ctx.stroke();
      // Stem — green, drawn over leaf bases
      ctx.strokeStyle = '#6a9a38';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rrx, groundY);
      ctx.lineTo(rrx, groundY - rrh);
      ctx.stroke();
      // Cattail head — brown
      ctx.fillStyle = '#6a4820';
      ctx.beginPath();
      ctx.ellipse(rrx, groundY - rrh + rrh * 0.12, 3, h * 0.028, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const reeds = [
      { x: w * 0.09, h: h * 0.14 }, { x: w * 0.12, h: h * 0.18 },
      { x: w * 0.15, h: h * 0.13 }, { x: w * 0.18, h: h * 0.16 },
      { x: w * 0.82, h: h * 0.16 }, { x: w * 0.85, h: h * 0.13 },
      { x: w * 0.88, h: h * 0.18 }, { x: w * 0.91, h: h * 0.14 },
    ];
    for (const r of reeds) drawReed(r.x, r.h);
  }

  private drawDeciduousTree(
    ctx: CanvasRenderingContext2D, groundY: number,
    tx: number, th: number, color: string
  ) {
    const trunkH = th * 0.28;
    const crownR = th * 0.38;
    const crownY = groundY - trunkH - crownR * 0.7;
    ctx.fillStyle = '#6b3e1e';
    ctx.fillRect(tx - th * 0.05, groundY - trunkH, th * 0.10, trunkH);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(tx + crownR, crownY);
    ctx.arc(tx, crownY, crownR, 0, Math.PI * 2);
    ctx.moveTo(tx - crownR * 0.55 + crownR * 0.72, crownY + crownR * 0.25);
    ctx.arc(tx - crownR * 0.55, crownY + crownR * 0.25, crownR * 0.72, 0, Math.PI * 2);
    ctx.moveTo(tx + crownR * 0.55 + crownR * 0.72, crownY + crownR * 0.25);
    ctx.arc(tx + crownR * 0.55, crownY + crownR * 0.25, crownR * 0.72, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawArcticLandscape(ctx: CanvasRenderingContext2D, w: number, h: number, groundY: number) {
    // Cold sky
    const skyBg = ctx.createLinearGradient(0, 0, 0, groundY);
    skyBg.addColorStop(0, '#8898c8');
    skyBg.addColorStop(1, '#c8d8f0');
    ctx.fillStyle = skyBg;
    ctx.fillRect(0, 0, w, groundY);

    // Distant glacier/ice shelf — far, pale, hazy
    ctx.fillStyle = '#d8ecf8';
    ctx.beginPath();
    ctx.moveTo(-2, groundY);
    ctx.quadraticCurveTo(w * 0.12, groundY - h * 0.22, w * 0.25, groundY - h * 0.18);
    ctx.quadraticCurveTo(w * 0.38, groundY - h * 0.14, w * 0.50, groundY - h * 0.26);
    ctx.quadraticCurveTo(w * 0.63, groundY - h * 0.32, w * 0.72, groundY - h * 0.20);
    ctx.quadraticCurveTo(w * 0.86, groundY - h * 0.12, w + 2, groundY - h * 0.17);
    ctx.lineTo(w + 2, groundY);
    ctx.closePath();
    ctx.fill();

    // Glacier shadow/depth faces — right side of each peak slightly darker
    ctx.fillStyle = '#b8d4ee';
    ctx.beginPath();
    ctx.moveTo(w * 0.50, groundY - h * 0.26);
    ctx.quadraticCurveTo(w * 0.63, groundY - h * 0.32, w * 0.72, groundY - h * 0.20);
    ctx.lineTo(w * 0.72, groundY);
    ctx.lineTo(w * 0.50, groundY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#b8d4ee';
    ctx.beginPath();
    ctx.moveTo(w * 0.12, groundY - h * 0.22);
    ctx.quadraticCurveTo(w * 0.19, groundY - h * 0.16, w * 0.25, groundY - h * 0.18);
    ctx.lineTo(w * 0.25, groundY);
    ctx.lineTo(w * 0.12, groundY);
    ctx.closePath();
    ctx.fill();

    // Haze over glaciers
    const glacierHaze = ctx.createLinearGradient(0, groundY - h * 0.34, 0, groundY);
    glacierHaze.addColorStop(0, 'rgba(200, 216, 240, 0.40)');
    glacierHaze.addColorStop(1, 'rgba(200, 216, 240, 0.08)');
    ctx.fillStyle = glacierHaze;
    ctx.beginPath();
    ctx.moveTo(-2, groundY);
    ctx.quadraticCurveTo(w * 0.12, groundY - h * 0.22, w * 0.25, groundY - h * 0.18);
    ctx.quadraticCurveTo(w * 0.38, groundY - h * 0.14, w * 0.50, groundY - h * 0.26);
    ctx.quadraticCurveTo(w * 0.63, groundY - h * 0.32, w * 0.72, groundY - h * 0.20);
    ctx.quadraticCurveTo(w * 0.86, groundY - h * 0.12, w + 2, groundY - h * 0.17);
    ctx.lineTo(w + 2, groundY);
    ctx.closePath();
    ctx.fill();

    // Ice chunks along the horizon foreground
    const drawIceChunk = (ix: number, iw: number, ih: number) => {
      ctx.fillStyle = '#d0e8f8';
      ctx.beginPath();
      ctx.moveTo(ix, groundY);
      ctx.lineTo(ix + iw * 0.12, groundY - ih);
      ctx.quadraticCurveTo(ix + iw * 0.5, groundY - ih * 1.15, ix + iw * 0.85, groundY - ih * 0.8);
      ctx.lineTo(ix + iw, groundY);
      ctx.closePath();
      ctx.fill();
      // Shadow face
      ctx.fillStyle = '#a8c8e8';
      ctx.beginPath();
      ctx.moveTo(ix + iw * 0.5, groundY - ih * 1.15);
      ctx.lineTo(ix + iw * 0.85, groundY - ih * 0.8);
      ctx.lineTo(ix + iw, groundY);
      ctx.lineTo(ix + iw * 0.6, groundY);
      ctx.closePath();
      ctx.fill();
    };

    drawIceChunk(w * 0.03, w * 0.08, h * 0.055);
    drawIceChunk(w * 0.30, w * 0.06, h * 0.042);
    drawIceChunk(w * 0.55, w * 0.10, h * 0.065);
    drawIceChunk(w * 0.78, w * 0.07, h * 0.048);
    drawIceChunk(w * 0.91, w * 0.09, h * 0.058);

    // Horizon haze (cold tint)
    const hazeGrad = ctx.createLinearGradient(0, groundY - h * 0.18, 0, groundY);
    hazeGrad.addColorStop(0, 'rgba(200, 216, 240, 0)');
    hazeGrad.addColorStop(1, 'rgba(200, 216, 240, 0.60)');
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, groundY - h * 0.18, w, h * 0.18);

    // Snow ground — same wave structure but icy palette
    this.drawGround(ctx, w, h, groundY, '#deeef8', '#cce2f4', '#b8d4ee', 'rgba(80, 110, 160,');
  }

  private drawGround(
    ctx: CanvasRenderingContext2D, w: number, h: number, groundY: number,
    gColor1: string, gColor2: string, gColor3: string, squiggleRgb: string
  ) {
    const groundH = h - groundY;
    const div1Y = groundY + groundH * 0.33;
    const div2Y = groundY + groundH * 0.66;

    const waveRight = (baseY: number, amp: number, waves: number) => {
      ctx.moveTo(-2, baseY);
      const segW = (w + 4) / waves;
      for (let i = 0; i < waves; i++) {
        const dir = i % 2 === 0 ? 1 : -1;
        ctx.quadraticCurveTo(
          -2 + segW * (i + 0.5), baseY + amp * dir,
          -2 + segW * (i + 1), baseY,
        );
      }
    };

    ctx.fillStyle = gColor1;
    ctx.fillRect(0, groundY, w, groundH);

    ctx.fillStyle = gColor2;
    ctx.beginPath();
    waveRight(div1Y, 9, 4);
    ctx.lineTo(w + 2, h + 2);
    ctx.lineTo(-2, h + 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = gColor3;
    ctx.beginPath();
    waveRight(div2Y, 11, 3);
    ctx.lineTo(w + 2, h + 2);
    ctx.lineTo(-2, h + 2);
    ctx.closePath();
    ctx.fill();

    const drawSquiggle = (sx: number, sy: number, width: number, amp: number, alpha: number) => {
      ctx.strokeStyle = `${squiggleRgb} ${alpha})`;
      ctx.lineWidth = 1.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      const segs = 5;
      const segW = width / segs;
      for (let i = 0; i < segs; i++) {
        const dir = i % 2 === 0 ? 1 : -1;
        ctx.quadraticCurveTo(sx + segW * (i + 0.5), sy + amp * dir, sx + segW * (i + 1), sy);
      }
      ctx.stroke();
    };

    const squiggles: Array<{ x: number; yFrac: number }> = [
      { x: w * 0.06, yFrac: 0.10 }, { x: w * 0.18, yFrac: 0.07 },
      { x: w * 0.30, yFrac: 0.18 }, { x: w * 0.45, yFrac: 0.09 },
      { x: w * 0.55, yFrac: 0.24 }, { x: w * 0.68, yFrac: 0.13 },
      { x: w * 0.78, yFrac: 0.07 }, { x: w * 0.88, yFrac: 0.20 },
      { x: w * 0.10, yFrac: 0.44 }, { x: w * 0.24, yFrac: 0.52 },
      { x: w * 0.37, yFrac: 0.60 }, { x: w * 0.50, yFrac: 0.38 },
      { x: w * 0.63, yFrac: 0.56 }, { x: w * 0.76, yFrac: 0.68 },
      { x: w * 0.04, yFrac: 0.70 }, { x: w * 0.86, yFrac: 0.48 },
      { x: w * 0.44, yFrac: 0.78 }, { x: w * 0.92, yFrac: 0.30 },
    ];

    for (const { x, yFrac } of squiggles) {
      const gy = groundY + groundH * yFrac;
      const width = w * (0.022 + yFrac * 0.030);
      const amp = 2.5 + yFrac * 3.0;
      const alpha = 0.20 + yFrac * 0.32;
      drawSquiggle(x, gy, width, amp, alpha);
    }
  }

  private spawnCloudsLayer(w: number, h: number) {
    const { images, speeds } = spawnClouds(this, w, h);
    this.clouds = images;
    this.cloudSpeeds = speeds;
  }
}
