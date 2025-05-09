import {
  Animation,
  ArcRotateCamera,
  Color3,
  CubicEase,
  DynamicTexture,
  EasingFunction,
  GlowLayer,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  Scene,
  StandardMaterial,
  Vector3,
} from 'babylonjs';

import { getGameSoundManager } from '@game/utils';

import { GameStatus } from '@shared/types';

export class GameTextManager {
  private scene: Scene;
  private textMesh: Mesh | null = null;
  private textTexture: DynamicTexture | null = null;
  private fontName: string = "'joystix monospace', monospace";
  private fontSize: number = 200;
  private textColor: Color3;
  private fontLoaded: boolean = false;
  private soundManager = getGameSoundManager();
  private glowLayer: GlowLayer | null = null;
  private camera: ArcRotateCamera;
  private fadeOutTimeoutId: number | null = null;

  constructor(scene: Scene, textColor: Color3, camera: ArcRotateCamera) {
    this.scene = scene;
    this.textColor = textColor;
    this.camera = camera;
    this.loadFont();

    this.glowLayer = new GlowLayer('textGlowLayer', this.scene);
    this.glowLayer.intensity = 0.4;
    this.glowLayer.blurKernelSize = 32;

    this.createTextMesh();
  }

  private loadFont(): void {
    const fontFace = new FontFace('joystix monospace', 'url(/fonts/joystix_monospace.otf)');

    fontFace
      .load()
      .then((loadedFace) => {
        document.fonts.add(loadedFace);
        this.fontLoaded = true;
      })
      .catch((error) => {
        console.error('Error loading font:', error);
        console.error('Falling back to Arial...');
        this.fontName = 'Arial';
        this.fontLoaded = true;
      });
  }

  private createTextMesh(): void {
    this.textMesh = MeshBuilder.CreatePlane(
      'textPlane',
      { width: 28, height: 14, sideOrientation: Mesh.DOUBLESIDE },
      this.scene
    );

    this.textMesh.position = new Vector3(0, 0, -15);
    this.textMesh.isPickable = false;

    this.textTexture = new DynamicTexture(
      'textTexture',
      { width: 2048, height: 1024 },
      this.scene,
      true
    );
    const textMaterial = new StandardMaterial('textMaterial', this.scene);

    textMaterial.diffuseTexture = this.textTexture;
    textMaterial.emissiveTexture = this.textTexture;
    textMaterial.emissiveColor = this.textColor;
    textMaterial.specularColor = new Color3(0.2, 0.2, 0.2);
    textMaterial.disableLighting = true;

    textMaterial.useAlphaFromDiffuseTexture = true;
    textMaterial.diffuseTexture.hasAlpha = true;
    textMaterial.backFaceCulling = false;

    this.textMesh.material = textMaterial;
    this.textMesh.visibility = 0;

    if (this.glowLayer) {
      this.glowLayer.intensity = 0.4;
      this.glowLayer.addIncludedOnlyMesh(this.textMesh);
    }
  }

  // Update the text color
  public updateTextColor(color: Color3): void {
    this.textColor = color;

    if (this.textMesh && this.textMesh.material) {
      const material = this.textMesh.material as PBRMaterial;
      material.emissiveColor = this.textColor;
      material.albedoColor = this.textColor;
    }
  }

  private drawText(text: string, fontSize: number = this.fontSize): void {
    if (!this.textTexture || !this.fontLoaded) return;

    this.textTexture.clear();

    const ctx = this.textTexture.getContext() as unknown as CanvasRenderingContext2D;

    ctx.clearRect(0, 0, 2048, 1024); // Clear with transparency

    const fontString = `${fontSize}px ${this.fontName}`;
    ctx.font = fontString;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const colorString = `rgb(${Math.floor(this.textColor.r * 255)}, ${Math.floor(this.textColor.g * 255)}, ${Math.floor(this.textColor.b * 255)})`;

    // Clear previous shadow state
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Base glow
    ctx.shadowColor = colorString;
    ctx.shadowBlur = 20;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillText(text, 1024, 512);

    // Text outline
    ctx.shadowColor = colorString;
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(text, 1024, 512);

    // Main text
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = colorString;
    ctx.fillText(text, 1024, 512);

    // Highlight
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(text, 1024, 511);

    this.textTexture.update();
  }

  private createDropAnimation(): Animation[] {
    const animations: Animation[] = [];
    const frameRate = 30;

    const cameraZ = this.camera.position.z;

    const startY = 5;
    const startZ = cameraZ + 5;
    const middleY = 0;
    const middleZ = -15;
    const endY = -5;
    const endZ = 5;

    const posAnim = new Animation(
      'textPositionAnim',
      'position',
      frameRate,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const posKeys: Array<{ frame: number; value: Vector3 }> = [
      { frame: 0, value: new Vector3(0, startY, startZ) },
      { frame: frameRate * 0.3, value: new Vector3(0, middleY, middleZ) },
      { frame: frameRate * 0.7, value: new Vector3(0, middleY, middleZ) },
      { frame: frameRate, value: new Vector3(0, endY, endZ) },
    ];

    posAnim.setKeys(posKeys);

    const scaleAnim = new Animation(
      'textScaleAnim',
      'scaling',
      frameRate,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const scaleKeys: Array<{ frame: number; value: Vector3 }> = [
      { frame: 0, value: new Vector3(0.6, 0.6, 0.6) },
      { frame: frameRate * 0.15, value: new Vector3(1.1, 1.1, 1.1) },
      { frame: frameRate * 0.3, value: new Vector3(1.4, 1.4, 1.4) },
      { frame: frameRate * 0.7, value: new Vector3(1, 1, 1) },
      { frame: frameRate * 0.9, value: new Vector3(0.2, 0.2, 0.2) },
      { frame: frameRate, value: new Vector3(0, 0, 0) },
    ];

    scaleAnim.setKeys(scaleKeys);

    const easeInOut = new CubicEase();
    easeInOut.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    posAnim.setEasingFunction(easeInOut);
    scaleAnim.setEasingFunction(easeInOut);

    animations.push(posAnim);
    animations.push(scaleAnim);

    return animations;
  }

  private createFadeOutAnimation(): Animation {
    const frameRate = 30;

    const fadeOut = new Animation(
      'fadeOut',
      'visibility',
      frameRate,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keyFrames: Array<{ frame: number; value: number }> = [];
    keyFrames.push({ frame: 0, value: 1 });
    keyFrames.push({ frame: 20, value: 0 });

    fadeOut.setKeys(keyFrames);
    return fadeOut;
  }

  public showText(
    text: string,
    duration: number = 800,
    fontSize: number = this.fontSize,
    playSound: boolean = false
  ): void {
    if (!this.textMesh || !this.textTexture) return;

    // Stop and clear any current animation
    this.scene.stopAnimation(this.textMesh);
    if (this.fadeOutTimeoutId) {
      clearTimeout(this.fadeOutTimeoutId);
      this.fadeOutTimeoutId = null;
    }

    this.drawText(text, fontSize);

    const cameraZ = this.camera.position.z;

    this.textMesh.position = new Vector3(0, 8, cameraZ + 2);
    this.textMesh.rotation = new Vector3(Math.PI * 0.1, 0, 0);
    this.textMesh.scaling = new Vector3(0.6, 0.6, 0.6);
    this.textMesh.visibility = 1;

    const dropAnimations = this.createDropAnimation();

    if (playSound) {
      switch (text) {
        case '3':
          this.soundManager.playCountDown3Sound();
          break;
        case '2':
          this.soundManager.playCountDown2Sound();
          break;
        case '1':
          this.soundManager.playCountDown1Sound();
          break;
        case 'PLAY':
          this.soundManager.playGameStartSound();
          break;
        case 'SCORE':
          this.soundManager.playGameOverSound();
          break;
      }
    }

    this.scene.beginDirectAnimation(this.textMesh, dropAnimations, 0, 30, false, 1, () => {
      this.fadeOutTimeoutId = window.setTimeout(() => {
        if (!this.textMesh) return;

        this.fadeOutTimeoutId = null;

        // When animation completes, wait, then fade out
        const fadeOut = this.createFadeOutAnimation();
        this.scene.beginDirectAnimation(this.textMesh, [fadeOut], 0, 20, false);
      }, duration);
    });
  }

  public handleGameStatus(
    gameStatus: GameStatus,
    prevStatus: GameStatus | null,
    countdown?: number
  ): void {
    if (prevStatus === 'countdown' && gameStatus === 'playing') {
      this.showText('PLAY', 800, this.fontSize, true);
    } else if (prevStatus === 'playing' && gameStatus === 'waiting') {
      this.showText('SCORE', 800, this.fontSize, true);
    } else if (
      gameStatus === 'countdown' &&
      countdown !== undefined &&
      countdown <= 3 &&
      countdown >= 1
    ) {
      this.showText(countdown.toString(), 800, this.fontSize, true);
    }
  }

  public dispose(): void {
    if (this.fadeOutTimeoutId) {
      clearTimeout(this.fadeOutTimeoutId);
      this.fadeOutTimeoutId = null;
    }

    if (this.textMesh) {
      this.textMesh.dispose();
      this.textMesh = null;
    }

    if (this.textTexture) {
      this.textTexture.dispose();
      this.textTexture = null;
    }

    if (this.glowLayer) {
      this.glowLayer.dispose();
      this.glowLayer = null;
    }
  }
}

export function createGameTextManager(
  scene: Scene,
  textColor: Color3,
  camera: ArcRotateCamera
): GameTextManager {
  return new GameTextManager(scene, textColor, camera);
}
