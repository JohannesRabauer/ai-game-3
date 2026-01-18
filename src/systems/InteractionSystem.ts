import { Scene, Vector3 } from '@babylonjs/core';
import { NPC } from '../entities/NPC';
import { Player } from '../entities/Player';
import { InputManager } from '../core/InputManager';
import { AudioManager } from '../core/AudioManager';
import { DialogueBox } from '../ui/DialogueBox';
import { DIALOGUE_DATA, DialogueChoice } from '../data/dialogues';
import { CONFIG } from '../config';

export class InteractionSystem {
  private player: Player;
  private inputManager: InputManager;
  private audioManager: AudioManager;
  private npcs: NPC[] = [];
  private dialogueBox: DialogueBox;
  private currentNPC: NPC | null = null;
  private currentDialogueId: string = '';
  private wasInteractPressed = false;
  
  constructor(scene: Scene, player: Player, inputManager: InputManager, audioManager: AudioManager) {
    this.player = player;
    this.inputManager = inputManager;
    this.audioManager = audioManager;
    this.dialogueBox = new DialogueBox(scene);
    
    // Register update loop
    scene.onBeforeRenderObservable.add(() => this.update());
  }
  
  addNPC(npc: NPC): void {
    this.npcs.push(npc);
  }
  
  removeNPC(npc: NPC): void {
    const index = this.npcs.indexOf(npc);
    if (index > -1) {
      this.npcs.splice(index, 1);
    }
  }
  
  private update(): void {
    // Don't process interactions if dialogue is open
    if (this.dialogueBox.isOpen()) {
      return;
    }
    
    // Find nearby NPCs
    const playerPos = this.player.getPosition();
    let nearestNPC: NPC | null = null;
    let nearestDistance = CONFIG.INTERACTION_RANGE;
    
    for (const npc of this.npcs) {
      const distance = Vector3.Distance(playerPos, npc.getPosition());
      if (distance < nearestDistance) {
        nearestNPC = npc;
        nearestDistance = distance;
      }
    }
    
    // Show interaction prompt (TODO: create UI element for this)
    if (nearestNPC) {
      // TODO: Show "Press E to talk" UI
      
      // Check for interaction input
      // We need to track the input manager through the player or pass it here
      // For now, we'll use a simpler approach
      const interactPressed = this.checkInteractInput();
      
      if (interactPressed && !this.wasInteractPressed) {
        this.startInteraction(nearestNPC);
      }
      
      this.wasInteractPressed = interactPressed;
    } else {
      this.wasInteractPressed = false;
    }
  }
  
  private checkInteractInput(): boolean {
    // This is a workaround - ideally we'd have access to InputManager
    // For now, check keyboard directly
    return false; // Will be connected properly when integrated
  }
  
  private startInteraction(npc: NPC): void {
    this.currentNPC = npc;
    const npcData = npc.getData();
    
    // Get dialogue data
    const dialogueData = DIALOGUE_DATA.npcs[npcData.dialogueId];
    if (!dialogueData) {
      console.error(`No dialogue found for NPC: ${npcData.dialogueId}`);
      return;
    }
    
    // Start NPC talking state
    npc.startTalking(this.player.getPosition());
    
    // Disable player movement and show cursor
    this.player.setMovementEnabled(false);
    this.inputManager.releasePointerLock();
    
    // Play dialogue open sound
    this.audioManager.playSound('dialogue_open');
    
    // Show initial dialogue
    this.currentDialogueId = dialogueData.initialDialogue;
    this.showCurrentDialogue(dialogueData.name);
  }
  
  private showCurrentDialogue(npcName: string): void {
    if (!this.currentNPC) return;
    
    const npcData = this.currentNPC.getData();
    const dialogueData = DIALOGUE_DATA.npcs[npcData.dialogueId];
    
    if (!dialogueData) return;
    
    const dialogue = dialogueData.dialogues[this.currentDialogueId];
    if (!dialogue) {
      console.error(`No dialogue node found: ${this.currentDialogueId}`);
      this.endInteraction();
      return;
    }
    
    this.dialogueBox.show(npcName, dialogue, (choice) => this.handleChoice(choice));
  }
  
  private handleChoice(choice: DialogueChoice): void {
    console.log(`Player chose: ${choice.text}`);
    
    // Play selection sound
    this.audioManager.playSound('dialogue_select');
    
    // Handle action if specified
    if (choice.action) {
      this.executeAction(choice.action);
    }
    
    // Move to next dialogue or end
    if (choice.next === 'end') {
      this.endInteraction();
    } else {
      this.currentDialogueId = choice.next;
      
      if (!this.currentNPC) return;
      const npcData = this.currentNPC.getData();
      const dialogueData = DIALOGUE_DATA.npcs[npcData.dialogueId];
      
      this.showCurrentDialogue(dialogueData.name);
    }
  }
  
  private executeAction(action: string): void {
    console.log(`Executing action: ${action}`);
    
    // TODO: Implement actions like opening shop, starting quests, etc.
    switch (action) {
      case 'open_shop_weapons':
        console.log('Opening weapons shop...');
        break;
      case 'open_shop_supplies':
        console.log('Opening supplies shop...');
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  }
  
  private endInteraction(): void {
    if (this.currentNPC) {
      this.currentNPC.stopTalking();
      this.currentNPC = null;
    }
    
    // Play dialogue close sound
    this.audioManager.playSound('dialogue_close');
    
    this.dialogueBox.hide();
    this.currentDialogueId = '';
    
    // Re-enable player movement and hide cursor
    this.player.setMovementEnabled(true);
    this.inputManager.requestPointerLock();
  }
  
  // Public method to trigger interaction (called from input system)
  public triggerInteraction(): void {
    const playerPos = this.player.getPosition();
    let nearestNPC: NPC | null = null;
    let nearestDistance = CONFIG.INTERACTION_RANGE;
    
    for (const npc of this.npcs) {
      const distance = Vector3.Distance(playerPos, npc.getPosition());
      if (distance < nearestDistance) {
        nearestNPC = npc;
        nearestDistance = distance;
      }
    }
    
    if (nearestNPC && !this.dialogueBox.isOpen()) {
      this.startInteraction(nearestNPC);
    }
  }
  
  dispose(): void {
    this.dialogueBox.dispose();
  }
}
