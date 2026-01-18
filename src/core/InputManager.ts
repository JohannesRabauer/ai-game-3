import { Scene } from '@babylonjs/core';

export class InputManager {
  private keys: Map<string, boolean> = new Map();
  private mouseButtons: Map<number, boolean> = new Map();
  private mouseDelta: { x: number; y: number } = { x: 0, y: 0 };
  private pointerLocked = false;
  private allowPointerLockRequest = true;
  
  constructor(private scene: Scene, private canvas: HTMLCanvasElement) {
    this.setupKeyboardListeners();
    this.setupMouseListeners();
  }
  
  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.set(e.code, true);
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys.set(e.code, false);
    });
  }
  
  private setupMouseListeners(): void {
    // Pointer lock
    this.canvas.addEventListener('click', () => {
      if (!this.pointerLocked && this.allowPointerLockRequest) {
        this.canvas.requestPointerLock();
      }
    });
    
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
    });
    
    // Mouse movement
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.pointerLocked) {
        this.mouseDelta.x = e.movementX;
        this.mouseDelta.y = e.movementY;
      }
    });
    
    // Mouse buttons
    this.canvas.addEventListener('mousedown', (e) => {
      this.mouseButtons.set(e.button, true);
    });
    
    this.canvas.addEventListener('mouseup', (e) => {
      this.mouseButtons.set(e.button, false);
    });
  }
  
  isKeyPressed(code: string): boolean {
    return this.keys.get(code) || false;
  }
  
  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.get(button) || false;
  }
  
  getMouseDelta(): { x: number; y: number } {
    const delta = { ...this.mouseDelta };
    this.mouseDelta = { x: 0, y: 0 }; // Reset after reading
    return delta;
  }
  
  isPointerLocked(): boolean {
    return this.pointerLocked;
  }
  
  // Helper methods for common controls
  getMovementInput(): { forward: number; right: number } {
    let forward = 0;
    let right = 0;
    
    if (this.isKeyPressed('KeyW')) forward += 1;
    if (this.isKeyPressed('KeyS')) forward -= 1;
    if (this.isKeyPressed('KeyD')) right += 1;
    if (this.isKeyPressed('KeyA')) right -= 1;
    
    return { forward, right };
  }
  
  isRunning(): boolean {
    return this.isKeyPressed('ShiftLeft') || this.isKeyPressed('ShiftRight');
  }
  
  isJumping(): boolean {
    return this.isKeyPressed('Space');
  }
  
  isShooting(): boolean {
    return this.isMouseButtonPressed(0); // Left mouse button
  }
  
  isInteracting(): boolean {
    return this.isKeyPressed('KeyE');
  }
  
  releasePointerLock(): void {
    this.allowPointerLockRequest = false;
    if (this.pointerLocked) {
      document.exitPointerLock();
    }
  }
  
  requestPointerLock(): void {
    this.allowPointerLockRequest = true;
    if (!this.pointerLocked) {
      this.canvas.requestPointerLock();
    }
  }
}
