import {
  Scene,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  PhysicsShapeType,
  Mesh,
  PhysicsAggregate
} from '@babylonjs/core';

export enum NPCState {
  Idle = 'idle',
  Talking = 'talking',
  Alerted = 'alerted'
}

export interface NPCData {
  id: string;
  name: string;
  position: Vector3;
  dialogueId: string;
}

export class NPC {
  private scene: Scene;
  private mesh: Mesh;
  private currentState: NPCState = NPCState.Idle;
  private data: NPCData;
  private rotationTarget: Vector3 | null = null;
  
  constructor(scene: Scene, data: NPCData) {
    this.scene = scene;
    this.data = data;
    
    // Create NPC mesh
    this.mesh = this.createNPCMesh();
    this.mesh.position = data.position;
    
    // Setup physics
    this.setupPhysics();
    
    // Register update loop
    scene.onBeforeRenderObservable.add(() => this.update());
  }
  
  private createNPCMesh(): Mesh {
    // Create a simple capsule for NPC (will be replaced with actual model later)
    const npc = MeshBuilder.CreateCapsule(
      this.data.id,
      {
        radius: 0.4,
        height: 1.8,
        subdivisions: 16
      },
      this.scene
    );
    
    const material = new StandardMaterial(`${this.data.id}Mat`, this.scene);
    material.diffuseColor = new Color3(0.8, 0.4, 0.2); // Orange to distinguish from player
    material.specularColor = new Color3(0.2, 0.2, 0.2);
    npc.material = material;
    
    return npc;
  }
  
  private setupPhysics(): void {
    // Static NPC for now (doesn't move) using Havok v2 API
    new PhysicsAggregate(
      this.mesh,
      PhysicsShapeType.CAPSULE,
      { mass: 0 }, // Static
      this.scene
    );
  }
  
  private update(): void {
    // Handle state-based behavior
    switch (this.currentState) {
      case NPCState.Idle:
        this.updateIdle();
        break;
      case NPCState.Talking:
        this.updateTalking();
        break;
      case NPCState.Alerted:
        this.updateAlerted();
        break;
    }
  }
  
  private updateIdle(): void {
    // Idle animation or behavior
    // TODO: Play idle animation when animations are loaded
  }
  
  private updateTalking(): void {
    // Look at the player while talking
    if (this.rotationTarget) {
      const direction = this.rotationTarget.subtract(this.mesh.position);
      const angle = Math.atan2(direction.x, direction.z);
      
      // Smoothly rotate towards target
      const currentRotation = this.mesh.rotation.y;
      const rotationDiff = angle - currentRotation;
      this.mesh.rotation.y += rotationDiff * 0.1; // Smooth rotation
    }
  }
  
  private updateAlerted(): void {
    // Alerted behavior (could look around, etc.)
    // TODO: Implement alerted behavior
  }
  
  setState(state: NPCState): void {
    if (this.currentState !== state) {
      console.log(`NPC ${this.data.name} state: ${this.currentState} -> ${state}`);
      this.currentState = state;
    }
  }
  
  getState(): NPCState {
    return this.currentState;
  }
  
  startTalking(playerPosition: Vector3): void {
    this.setState(NPCState.Talking);
    this.rotationTarget = playerPosition;
  }
  
  stopTalking(): void {
    this.setState(NPCState.Idle);
    this.rotationTarget = null;
  }
  
  getPosition(): Vector3 {
    return this.mesh.position.clone();
  }
  
  getMesh(): Mesh {
    return this.mesh;
  }
  
  getData(): NPCData {
    return this.data;
  }
  
  dispose(): void {
    this.mesh.dispose();
  }
}
