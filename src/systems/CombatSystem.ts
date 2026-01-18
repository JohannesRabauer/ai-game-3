import {
  Scene,
  Vector3,
  Ray,
  ParticleSystem,
  Color4,
  AbstractMesh
} from '@babylonjs/core';
import { Player } from '../entities/Player';
import { AudioManager } from '../core/AudioManager';
import { CONFIG } from '../config';

export class CombatSystem {
  private scene: Scene;
  private player: Player;
  private audioManager: AudioManager;
  private lastShootTime = 0;
  private muzzleFlash: ParticleSystem | null = null;
  
  constructor(scene: Scene, player: Player, audioManager: AudioManager) {
    this.scene = scene;
    this.player = player;
    this.audioManager = audioManager;
    
    // Create muzzle flash particle system
    this.setupMuzzleFlash();
  }
  
  private setupMuzzleFlash(): void {
    this.muzzleFlash = new ParticleSystem('muzzleFlash', 50, this.scene);
    
    // For now, use a simple texture (will be replaced with actual texture later)
    // this.muzzleFlash.particleTexture = new Texture('assets/particles/flash.png', this.scene);
    
    this.muzzleFlash.minSize = 0.1;
    this.muzzleFlash.maxSize = 0.3;
    this.muzzleFlash.minLifeTime = 0.05;
    this.muzzleFlash.maxLifeTime = 0.1;
    this.muzzleFlash.emitRate = 100;
    this.muzzleFlash.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    
    this.muzzleFlash.direction1 = new Vector3(0, 0, 1);
    this.muzzleFlash.direction2 = new Vector3(0, 0, 1.2);
    this.muzzleFlash.minEmitPower = 1;
    this.muzzleFlash.maxEmitPower = 2;
    this.muzzleFlash.updateSpeed = 0.01;
    
    this.muzzleFlash.color1 = new Color4(1, 0.8, 0.4, 1);
    this.muzzleFlash.color2 = new Color4(1, 0.5, 0, 1);
    this.muzzleFlash.colorDead = new Color4(0.5, 0.3, 0, 0);
  }
  
  update(): void {
    // This is called every frame from main game loop
  }
  
  shoot(): void {
    const now = Date.now();
    
    // Check cooldown
    if (now - this.lastShootTime < CONFIG.SHOOT_COOLDOWN) {
      return;
    }
    
    this.lastShootTime = now;
    
    // Get player position and direction
    const playerPos = this.player.getPosition();
    const direction = this.player.getForwardDirection();
    
    // Create ray from player forward
    const ray = new Ray(
      playerPos.add(new Vector3(0, 1.5, 0)), // Shoot from chest height
      direction,
      CONFIG.SHOOT_RANGE
    );
    
    // Perform raycast
    const hit = this.scene.pickWithRay(ray, (mesh) => {
      // Don't hit the player's own mesh
      return mesh.name !== 'player' && mesh.name !== 'playerRoot';
    });
    
    if (hit && hit.hit) {
      console.log(`Hit: ${hit.pickedMesh?.name} at distance ${hit.distance?.toFixed(2)}`);
      
      // Visual feedback on hit
      this.createHitEffect(hit.pickedPoint!);
      
      // Play impact sound at hit position
      this.audioManager.playSoundAtPosition('impact', hit.pickedPoint!);
      
      // TODO: Apply damage to NPCs/enemies
      if (hit.pickedMesh) {
        this.applyDamage(hit.pickedMesh, CONFIG.SHOOT_DAMAGE);
      }
    }
    
    // Trigger muzzle flash
    this.triggerMuzzleFlash(playerPos.add(direction.scale(0.5)));
    
    // Play gunshot sound
    this.audioManager.playSound('gunshot');
  }
  
  private triggerMuzzleFlash(position: Vector3): void {
    if (!this.muzzleFlash) return;
    
    this.muzzleFlash.emitter = position;
    this.muzzleFlash.start();
    
    setTimeout(() => {
      this.muzzleFlash?.stop();
    }, 50);
  }
  
  private createHitEffect(position: Vector3): void {
    // Create impact particle effect
    const impact = new ParticleSystem('impact', 30, this.scene);
    impact.emitter = position;
    
    impact.minSize = 0.05;
    impact.maxSize = 0.15;
    impact.minLifeTime = 0.2;
    impact.maxLifeTime = 0.5;
    impact.emitRate = 100;
    
    impact.direction1 = new Vector3(-1, -1, -1);
    impact.direction2 = new Vector3(1, 1, 1);
    impact.minEmitPower = 0.5;
    impact.maxEmitPower = 2;
    
    impact.color1 = new Color4(0.7, 0.7, 0.7, 1);
    impact.color2 = new Color4(0.3, 0.3, 0.3, 1);
    impact.colorDead = new Color4(0, 0, 0, 0);
    
    impact.start();
    
    // Dispose after a short time
    setTimeout(() => {
      impact.stop();
      setTimeout(() => impact.dispose(), 500);
    }, 200);
  }
  
  private applyDamage(mesh: AbstractMesh, damage: number): void {
    // Store hit count on mesh metadata for visual feedback
    if (!mesh.metadata) {
      mesh.metadata = { hits: 0 };
    }
    mesh.metadata.hits = (mesh.metadata.hits || 0) + 1;
    
    // Visual feedback: make mesh flash red briefly
    // TODO: Create a red material and swap briefly
    
    console.log(`Dealt ${damage} damage to ${mesh.name} (${mesh.metadata.hits} hits total)`);
  }
}
