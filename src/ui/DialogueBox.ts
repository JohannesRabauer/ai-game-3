import { AdvancedDynamicTexture, Rectangle, TextBlock, Button, Control } from '@babylonjs/gui';
import { Scene } from '@babylonjs/core';
import { DialogueNode, DialogueChoice } from '../data/dialogues';

export class DialogueBox {
  private advancedTexture: AdvancedDynamicTexture;
  private container: Rectangle;
  private nameText: TextBlock;
  private dialogueText: TextBlock;
  private choicesContainer: Rectangle;
  private isVisible = false;
  private onChoiceCallback: ((choice: DialogueChoice) => void) | null = null;
  private typewriterInterval: ReturnType<typeof setInterval> | null = null;
  
  constructor(scene: Scene) {
    // Create fullscreen UI
    this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('dialogueUI', true, scene);
    
    // Create main container
    this.container = new Rectangle('dialogueContainer');
    this.container.width = '800px';
    this.container.height = '400px';
    this.container.thickness = 2;
    this.container.background = 'rgba(0, 0, 0, 0.8)';
    this.container.color = 'white';
    this.container.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.container.top = '-50px';
    this.container.isVisible = false;
    this.advancedTexture.addControl(this.container);
    
    // Create NPC name text
    this.nameText = new TextBlock('npcName');
    this.nameText.text = '';
    this.nameText.height = '40px';
    this.nameText.color = '#FFD700';
    this.nameText.fontSize = 24;
    this.nameText.fontWeight = 'bold';
    this.nameText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.nameText.top = '10px';
    this.container.addControl(this.nameText);
    
    // Create dialogue text
    this.dialogueText = new TextBlock('dialogueText');
    this.dialogueText.text = '';
    this.dialogueText.height = '80px';
    this.dialogueText.color = 'white';
    this.dialogueText.fontSize = 18;
    this.dialogueText.textWrapping = true;
    this.dialogueText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.dialogueText.top = '55px';
    this.dialogueText.paddingLeft = '20px';
    this.dialogueText.paddingRight = '20px';
    this.container.addControl(this.dialogueText);
    
    // Create choices container
    this.choicesContainer = new Rectangle('choicesContainer');
    this.choicesContainer.width = '100%';
    this.choicesContainer.height = '260px';
    this.choicesContainer.thickness = 0;
    this.choicesContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.container.addControl(this.choicesContainer);
  }
  
  show(npcName: string, dialogue: DialogueNode, onChoice: (choice: DialogueChoice) => void): void {
    this.isVisible = true;
    this.container.isVisible = true;
    this.onChoiceCallback = onChoice;
    
    // Set NPC name
    this.nameText.text = npcName;
    
    // Set dialogue text with typewriter effect
    this.typewriterEffect(dialogue.text);
    
    // Clear previous choices
    while (this.choicesContainer.children.length > 0) {
      this.choicesContainer.removeControl(this.choicesContainer.children[0]);
    }
    
    // Create choice buttons
    const buttonHeight = 35;
    const buttonSpacing = 10;
    
    // Add 'Close' option if not already present
    const choices = [...dialogue.choices];
    const hasEndOption = choices.some(c => c.next === 'end');
    if (!hasEndOption) {
      choices.push({ text: '[Close]', next: 'end' });
    }
    
    choices.forEach((choice, index) => {
      const button = Button.CreateSimpleButton(`choice${index}`, choice.text);
      button.width = '700px';
      button.height = `${buttonHeight}px`;
      button.color = 'white';
      button.background = 'rgba(50, 100, 200, 0.5)';
      button.thickness = 2;
      button.fontSize = 16;
      button.top = `${index * (buttonHeight + buttonSpacing)}px`;
      button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      
      // Hover effects
      button.onPointerEnterObservable.add(() => {
        button.background = 'rgba(70, 120, 220, 0.8)';
      });
      
      button.onPointerOutObservable.add(() => {
        button.background = 'rgba(50, 100, 200, 0.5)';
      });
      
      // Click handler
      button.onPointerClickObservable.add(() => {
        if (this.onChoiceCallback) {
          this.onChoiceCallback(choice);
        }
      });
      
      this.choicesContainer.addControl(button);
    });
  }
  
  hide(): void {
    this.isVisible = false;
    this.container.isVisible = false;
    this.onChoiceCallback = null;
    
    // Clear any active typewriter effect
    if (this.typewriterInterval !== null) {
      clearInterval(this.typewriterInterval);
      this.typewriterInterval = null;
    }
  }
  
  isOpen(): boolean {
    return this.isVisible;
  }
  
  private typewriterEffect(text: string, speed: number = 30): void {
    // Clear any existing typewriter interval
    if (this.typewriterInterval !== null) {
      clearInterval(this.typewriterInterval);
      this.typewriterInterval = null;
    }
    
    let index = 0;
    this.dialogueText.text = '';
    
    this.typewriterInterval = setInterval(() => {
      if (index < text.length) {
        this.dialogueText.text += text[index];
        index++;
      } else {
        clearInterval(this.typewriterInterval!);
        this.typewriterInterval = null;
      }
    }, speed);
  }
  
  dispose(): void {
    this.advancedTexture.dispose();
  }
}
