import './style.css';
import { GameEngine } from './core/GameEngine';
import { InputManager } from './core/InputManager';
import { AudioManager } from './core/AudioManager';
import { Player } from './entities/Player';
import { CombatSystem } from './systems/CombatSystem';
import { InteractionSystem } from './systems/InteractionSystem';
import { NPC } from './entities/NPC';
import { 
  ArcRotateCamera, 
  Vector3, 
  MeshBuilder, 
  StandardMaterial, 
  Color3,
  PhysicsAggregate,
  PhysicsShapeType
} from '@babylonjs/core';

class Game {
  private engine: GameEngine | null = null;
  private inputManager: InputManager | null = null;
  private audioManager: AudioManager | null = null;
  private player: Player | null = null;
  private combatSystem: CombatSystem | null = null;
  private interactionSystem: InteractionSystem | null = null;
  
  async init() {
    this.showLoadingProgress('Initializing engine...', 10);
    
    const canvas = document.getElementById('renderCanvas');
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      console.error('Canvas not found or is not an HTMLCanvasElement');
      return;
    }
    
    // Create game engine
    this.engine = new GameEngine(canvas);
    
    this.showLoadingProgress('Loading physics...', 30);
    await this.engine.initialize();
    
    const scene = this.engine.getScene();
    if (!scene) {
      console.error('Scene not created');
      return;
    }
    
    this.showLoadingProgress('Setting up controls...', 50);
    
    // Setup input
    this.inputManager = new InputManager(scene, canvas);
    
    // Setup audio manager
    this.audioManager = new AudioManager(scene);
    
    // Setup camera (temporary, will be replaced by player camera)
    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 3,
      10,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 20;
    
    this.showLoadingProgress('Creating world...', 70);
    
    // Create ground
    this.createGround(scene);
    
    this.showLoadingProgress('Loading player...', 85);
    
    // Create player
    this.player = new Player(scene, this.inputManager, this.audioManager!, new Vector3(0, 2, 0));
    
    // Create combat system
    this.combatSystem = new CombatSystem(scene, this.player, this.audioManager!);
    
    // Create interaction system
    this.interactionSystem = new InteractionSystem(scene, this.player, this.inputManager, this.audioManager!);
    
    // Add some test NPCs
    this.createTestNPCs(scene);
    
    // Handle shooting and interaction input
    scene.onBeforeRenderObservable.add(() => {
      if (this.inputManager?.isShooting() && this.combatSystem) {
        this.combatSystem.shoot();
      }
      
      if (this.inputManager?.isInteracting() && this.interactionSystem) {
        this.interactionSystem.triggerInteraction();
      }
    });
    
    // Add crosshair to UI
    this.addCrosshair();
    
    this.showLoadingProgress('Ready!', 100);
    
    // Hide loading screen after a brief moment
    setTimeout(() => {
      this.hideLoadingScreen();
      this.engine?.start();
    }, 500);
  }
  
  private createGround(scene: any): void {
    const ground = MeshBuilder.CreateGround(
      'ground',
      { width: 50, height: 50 },
      scene
    );
    
    const groundMaterial = new StandardMaterial('groundMat', scene);
    groundMaterial.diffuseColor = new Color3(0.4, 0.6, 0.4);
    groundMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
    ground.material = groundMaterial;
    
    // Add physics to ground (static, mass 0)
    new PhysicsAggregate(
      ground,
      PhysicsShapeType.BOX,
      { mass: 0 },
      scene
    );
    
    ground.receiveShadows = true;
    
    // Add some test boxes
    for (let i = 0; i < 5; i++) {
      const box = MeshBuilder.CreateBox(
        `box${i}`,
        { size: 2 },
        scene
      );
      box.position = new Vector3(
        Math.random() * 20 - 10,
        1,
        Math.random() * 20 - 10
      );
      
      // Add physics to box (static)
      new PhysicsAggregate(
        box,
        PhysicsShapeType.BOX,
        { mass: 0 },
        scene
      );
      
      const boxMaterial = new StandardMaterial(`boxMat${i}`, scene);
      boxMaterial.diffuseColor = new Color3(
        Math.random(),
        Math.random(),
        Math.random()
      );
      box.material = boxMaterial;
    }
  }
  
  private createTestNPCs(scene: any): void {
    // Create a guard NPC
    const guard = new NPC(scene, {
      id: 'guard_01',
      name: 'City Guard',
      position: new Vector3(5, 0, 5),
      dialogueId: 'guard_01'
    });
    this.interactionSystem?.addNPC(guard);
    
    // Create a merchant NPC
    const merchant = new NPC(scene, {
      id: 'merchant_01',
      name: 'Merchant',
      position: new Vector3(-5, 0, 5),
      dialogueId: 'merchant_01'
    });
    this.interactionSystem?.addNPC(merchant);
  }
  
  private addCrosshair(): void {
    const overlay = document.getElementById('ui-overlay');
    if (!overlay) return;
    
    const crosshair = document.createElement('div');
    crosshair.className = 'crosshair';
    overlay.appendChild(crosshair);
  }
  
  private showLoadingProgress(text: string, percent: number): void {
    const progressFill = document.getElementById('progress-fill');
    const loadingText = document.getElementById('loading-text');
    
    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }
    
    if (loadingText) {
      loadingText.textContent = text;
    }
  }
  
  private hideLoadingScreen(): void {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.remove('active');
    }
  }
}

// Start the game
const game = new Game();
game.init().catch(console.error);
