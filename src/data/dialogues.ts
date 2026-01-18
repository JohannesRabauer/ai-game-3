export interface DialogueChoice {
  text: string;
  next: string; // ID of next dialogue or 'end'
  action?: string; // Optional action to trigger
}

export interface DialogueNode {
  text: string;
  choices: DialogueChoice[];
}

export interface NPCDialogue {
  name: string;
  initialDialogue: string;
  dialogues: Record<string, DialogueNode>;
}

export interface DialogueDatabase {
  npcs: Record<string, NPCDialogue>;
}

// Sample dialogue data
export const DIALOGUE_DATA: DialogueDatabase = {
  npcs: {
    guard_01: {
      name: 'City Guard',
      initialDialogue: 'greet',
      dialogues: {
        greet: {
          text: "Halt! What's your business here?",
          choices: [
            { text: 'Just passing through', next: 'friendly' },
            { text: "None of your business", next: 'hostile' },
            { text: 'I\'m looking for supplies', next: 'quest' }
          ]
        },
        friendly: {
          text: 'Alright, stay out of trouble.',
          choices: [
            { text: 'Thanks', next: 'end' }
          ]
        },
        hostile: {
          text: 'Watch your tone! Move along before I lose my patience.',
          choices: [
            { text: 'Fine...', next: 'end' },
            { text: 'Sorry, I meant no offense', next: 'friendly' }
          ]
        },
        quest: {
          text: 'Supplies? Try the market district to the east. Be careful though, there have been reports of trouble.',
          choices: [
            { text: 'Thanks for the tip', next: 'end' },
            { text: 'What kind of trouble?', next: 'quest_detail' }
          ]
        },
        quest_detail: {
          text: 'Armed gangs. They\'ve been causing problems. Stay alert.',
          choices: [
            { text: 'I\'ll be careful', next: 'end' }
          ]
        }
      }
    },
    merchant_01: {
      name: 'Merchant',
      initialDialogue: 'greet',
      dialogues: {
        greet: {
          text: 'Welcome! Looking for something specific?',
          choices: [
            { text: 'What do you sell?', next: 'inventory' },
            { text: 'Just browsing', next: 'browse' },
            { text: 'Goodbye', next: 'end' }
          ]
        },
        inventory: {
          text: 'I have weapons, armor, and supplies. What interests you?',
          choices: [
            { text: 'Show me weapons', next: 'weapons', action: 'open_shop_weapons' },
            { text: 'Show me supplies', next: 'supplies', action: 'open_shop_supplies' },
            { text: 'Nothing right now', next: 'end' }
          ]
        },
        browse: {
          text: 'Take your time! Let me know if you need anything.',
          choices: [
            { text: 'Actually, what do you have?', next: 'inventory' },
            { text: 'Thanks', next: 'end' }
          ]
        },
        weapons: {
          text: 'Fine weapons, all of them. Tested and reliable.',
          choices: [
            { text: 'I\'ll take a look', next: 'end', action: 'open_shop_weapons' },
            { text: 'Maybe later', next: 'end' }
          ]
        },
        supplies: {
          text: 'Medical kits, ammunition, and other essentials.',
          choices: [
            { text: 'Show me', next: 'end', action: 'open_shop_supplies' },
            { text: 'Not now', next: 'end' }
          ]
        }
      }
    }
  }
};
