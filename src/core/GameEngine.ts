import { Engine, Scene, Vector3, HemisphericLight, DirectionalLight, ShadowGenerator, Color3 } from '@babylonjs/core';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
import HavokPhysics from '@babylonjs/havok';
import { CONFIG } from '../config';
import { QualitySettings } from './QualitySettings';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scene: Scene | null = null;
  private havokPlugin: HavokPlugin | null = null;
  private qualitySettings: QualitySettings | null = null;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }
  
  async initialize(): Promise<void> {
    console.log('Initializing game engine...');
    
    // Initialize Havok physics
    await this.initializePhysics();
    
    // Create the scene
    this.createScene();
    
    console.log('Game engine initialized');
  }
  
  private async initializePhysics(): Promise<void> {
    console.log('Loading Havok physics...');
    try {
      // Let Havok find its own WASM file
      const havokInstance = await HavokPhysics();
      this.havokPlugin = new HavokPlugin(true, havokInstance);
      console.log('Havok physics loaded successfully');
    } catch (error) {
      console.error('Failed to load Havok physics:', error);
      console.error('Error details:', error);
      throw error;
    }
  }
  
  private createScene(): void {
    this.scene = new Scene(this.engine);
    
    // Enable physics
    if (this.havokPlugin) {
      this.scene.enablePhysics(
        new Vector3(0, CONFIG.GRAVITY, 0),
        this.havokPlugin
      );
    }
    
    // Set up basic lighting
    
    // Set up visual quality
    this.qualitySettings = new QualitySettings(this.scene);
    this.setupLighting();
  }
  
  private setupLighting(): void {
    if (!this.scene) return;
    
    // Hemispheric ambient light
    const hemiLight = new HemisphericLight(
      'hemiLight',
      new Vector3(0, 1, 0),
      this.scene
    );
    hemiLight.intensity = 0.6;
    hemiLight.groundColor = new Color3(0.2, 0.2, 0.3);
    
    // Directional sun light
    const sunLight = new DirectionalLight(
      'sunLight',
      new Vector3(-1, -2, -1),
      this.scene
    );
    sunLight.intensity = 1.0;
    sunLight.position = new Vector3(20, 40, 20);
    
    // Shadow generator
    const shadowGenerator = new ShadowGenerator(CONFIG.SHADOW_MAP_SIZE, sunLight);
    shadowGenerator.usePercentageCloserFiltering = true;
    shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;
  }
  
  start(): void {
    if (!this.scene) {
      console.error('Scene not initialized');
      return;
    }
    
    // Start render loop
    this.engine.runRenderLoop(() => {
      if (this.scene) {
        this.scene.render();
      }
    });
    
    console.log('Game started');
  }
  
  getScene(): Scene | null {
    return this.scene;
  }
  
  getEngine(): Engine {
    return this.engine;
  }
  
  dispose(): void {
    this.scene?.dispose();
    this.engine.dispose();
  }
}
