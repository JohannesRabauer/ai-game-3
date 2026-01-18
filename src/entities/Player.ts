import {
  Scene,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  PhysicsShapeType,
  TransformNode,
  Mesh,
  PhysicsBody,
  ArcRotateCamera,
  Ray,
  PhysicsAggregate
} from '@babylonjs/core';
import { InputManager } from '../core/InputManager';
import { AudioManager } from '../core/AudioManager';
import { CONFIG } from '../config';

export class Player {
  private scene: Scene;
  private inputManager: InputManager;
  private audioManager: AudioManager;
  private root: TransformNode;
  private mesh: Mesh;
  private physicsBody: PhysicsBody | null = null;
  private camera: ArcRotateCamera;
  private isOnGround = false;
  private wasOnGround = false;
  private velocity = Vector3.Zero();
  private isMovementEnabled = true;
  private lastFootstepTime = 0;
  private footstepInterval = 400; // ms between footsteps
  
  constructor(scene: Scene, inputManager: InputManager, audioManager: AudioManager, position: Vector3) {
    this.scene = scene;
    this.inputManager = inputManager;
    this.audioManager = audioManager;
    
    // Create player mesh (capsule representation)
    this.mesh = this.createPlayerMesh();
    this.mesh.position = position;
    
    // Create root transform node for rotation control
    this.root = new TransformNode('playerRoot', scene);
    this.root.position = position;
    
    // Setup physics on the mesh
    this.setupPhysics();
    
    // Setup camera
    this.camera = this.setupCamera();
    
    // Register update loop
    scene.onBeforeRenderObservable.add(() => this.update());
  }
  
  private createPlayerMesh(): Mesh {
    // Create a capsule to represent the player
    const capsule = MeshBuilder.CreateCapsule(
      'player',
      {
        radius: CONFIG.PLAYER_RADIUS,
        height: CONFIG.PLAYER_HEIGHT,
        subdivisions: 16
      },
      this.scene
    );
    
    const material = new StandardMaterial('playerMat', this.scene);
    material.diffuseColor = new Color3(0.2, 0.4, 0.8);
    material.specularColor = new Color3(0.2, 0.2, 0.2);
    capsule.material = material;
    
    return capsule;
  }
  
  private setupPhysics(): void {
    // Create physics aggregate for the player using Havok v2 API
    const physicsAggregate = new PhysicsAggregate(
      this.mesh,
      PhysicsShapeType.CAPSULE,
      { mass: CONFIG.PLAYER_MASS, restitution: 0.0 },
      this.scene
    );
    
    this.physicsBody = physicsAggregate.body;
    
    // Lock rotation to prevent tipping over
    this.physicsBody.setMassProperties({
      inertia: Vector3.Zero()
    });
    
    // Set damping
    this.physicsBody.setAngularDamping(1.0);
    this.physicsBody.setLinearDamping(0.1);
  }
  
  private setupCamera(): ArcRotateCamera {
    // Create third-person camera
    const camera = new ArcRotateCamera(
      'playerCamera',
      -Math.PI / 2, // Start behind player
      Math.PI / 3,
      CONFIG.CAMERA_RADIUS,
      Vector3.Zero(),
      this.scene
    );
    
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 10;
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = Math.PI / 2.1;
    
    // Disable default controls - we'll handle it manually
    camera.inputs.clear();
    
    // Set as active camera
    this.scene.activeCamera = camera;
    
    return camera;
  }
  
  private update(): void {
    if (!this.physicsBody) return;
    
    // Sync root position with physics mesh
    this.root.position = this.mesh.position.clone();
    
    // Update camera position to follow player
    this.camera.target = this.mesh.position.add(new Vector3(0, CONFIG.PLAYER_HEIGHT / 2, 0));
    
    // Handle camera rotation with mouse
    if (this.inputManager.isPointerLocked()) {
      const mouseDelta = this.inputManager.getMouseDelta();
      this.camera.alpha -= mouseDelta.x * CONFIG.CAMERA_SENSITIVITY;
      this.camera.beta -= mouseDelta.y * CONFIG.CAMERA_SENSITIVITY;
    }
    
    // Skip movement if disabled (e.g., during dialogue)
    if (!this.isMovementEnabled) {
      return;
    }
    
    // Get movement input
    const movement = this.inputManager.getMovementInput();
    const isRunning = this.inputManager.isRunning();
    const speed = isRunning ? CONFIG.RUN_SPEED : CONFIG.MOVE_SPEED;
    
    // Calculate movement direction based on camera's alpha (horizontal rotation)
    // Alpha = 0 is facing +X, increases counter-clockwise
    const cameraAngle = this.camera.alpha + Math.PI; // Add PI to face the right direction
    
    // Forward direction based on camera angle
    const forward = new Vector3(
      Math.cos(cameraAngle),
      0,
      Math.sin(cameraAngle)
    ).normalize();
    
    // Right direction (perpendicular to forward)
    const right = new Vector3(
      Math.cos(cameraAngle - Math.PI / 2),
      0,
      Math.sin(cameraAngle - Math.PI / 2)
    ).normalize();
    
    // Calculate velocity based on input
    const moveDirection = forward.scale(movement.forward).add(right.scale(movement.right));
    
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      this.velocity.x = moveDirection.x * speed;
      this.velocity.z = moveDirection.z * speed;
      
      // Rotate player mesh to face movement direction
      const angle = Math.atan2(moveDirection.x, moveDirection.z);
      this.mesh.rotation.y = angle;
      
      // Play footstep sounds while moving on ground
      if (this.isOnGround) {
        const now = Date.now();
        const interval = isRunning ? this.footstepInterval * 0.7 : this.footstepInterval;
        if (now - this.lastFootstepTime > interval) {
          this.audioManager.playSound('footstep', 0.3);
          this.lastFootstepTime = now;
        }
      }
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }
    
    // Apply velocity
    const currentVelocity = this.physicsBody.getLinearVelocity();
    this.physicsBody.setLinearVelocity(
      new Vector3(this.velocity.x, currentVelocity.y, this.velocity.z)
    );
    
    // Check if on ground (simple raycast down)
    this.checkGroundContact();
    
    // Play landing sound when touching ground after being in air
    if (this.isOnGround && !this.wasOnGround) {
      this.audioManager.playSound('land', 0.4);
    }
    this.wasOnGround = this.isOnGround;
    
    // Handle jump
    if (this.inputManager.isJumping() && this.isOnGround) {
      const currentVel = this.physicsBody.getLinearVelocity();
      this.physicsBody.setLinearVelocity(
        new Vector3(currentVel.x, CONFIG.JUMP_FORCE, currentVel.z)
      );
      this.audioManager.playSound('jump', 0.5);
    }
  }
  
  private checkGroundContact(): void {
    // Simple ground check using raycast
    const ray = new Ray(
      this.mesh.position,
      new Vector3(0, -1, 0),
      CONFIG.PLAYER_HEIGHT / 2 + 0.1
    );
    
    const hit = this.scene.pickWithRay(ray, (mesh) => mesh !== this.mesh);
    this.isOnGround = hit?.hit || false;
  }
  
  getPosition(): Vector3 {
    return this.root.position.clone();
  }
  
  getForwardDirection(): Vector3 {
    return this.camera.target.subtract(this.camera.position).normalize();
  }
  
  getCamera(): ArcRotateCamera {
    return this.camera;
  }
  
  getMesh(): Mesh {
    return this.mesh;
  }
  
  setMovementEnabled(enabled: boolean): void {
    this.isMovementEnabled = enabled;
  }
}
