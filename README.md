# AI Game 3 - Third Person Shooter

A browser-based 3D third-person shooter game built with Babylon.js 6.x and Havok physics, featuring character movement, NPC interactions, and combat mechanics.

## 🎮 Features

- **Third-person character movement** with WASD controls
- **Havok physics** for realistic character physics
- **Shooting mechanics** with raycasting and particle effects
- **NPC interaction system** with dialogue trees
- **Audio system** with sound effects for shooting, footsteps, jumping, and interactions
- **High-quality visuals** with SSAO, bloom, and post-processing effects
- **Quality settings** toggle for different performance levels
- **GitHub Pages hosting** for easy deployment

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/JohannesRabauer/ai-game-3.git
cd ai-game-3

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open at `http://localhost:3000/ai-game-3/`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploying to GitHub Pages

The repository is configured for automatic deployment to GitHub Pages via GitHub Actions.

**⚠️ Important:** Before the first deployment, you must enable GitHub Pages in the repository settings:

1. Go to [Repository Settings > Pages](https://github.com/JohannesRabauer/ai-game-3/settings/pages)
2. Under "Build and deployment", set **Source** to "GitHub Actions"
3. Save the settings

Once enabled, every push to the `main` branch will automatically deploy to: `https://JohannesRabauer.github.io/ai-game-3/`

For detailed setup instructions, see [SETUP.md](SETUP.md).

## 🎯 Controls

- **WASD** - Move character
- **Mouse** - Look around (click canvas to lock pointer)
- **Shift** - Run
- **Space** - Jump
- **Left Click** - Shoot
- **E** - Interact with NPCs

## 🏗️ Project Structure

```
ai-game-3/
├── src/
│   ├── core/           # Core engine systems
│   │   ├── GameEngine.ts
│   │   ├── InputManager.ts
│   │   ├── AudioManager.ts
│   │   └── QualitySettings.ts
│   ├── entities/       # Game entities
│   │   ├── Player.ts
│   │   └── NPC.ts
│   ├── systems/        # Game systems
│   │   ├── CombatSystem.ts
│   │   └── InteractionSystem.ts
│   ├── ui/            # User interface
│   │   └── DialogueBox.ts
│   ├── data/          # Game data
│   │   └── dialogues.ts
│   ├── config.ts      # Configuration
│   └── main.ts        # Entry point
├── assets/            # Game assets (models, textures, sounds)
├── public/            # Static files
└── index.html         # HTML entry point
```

## 🛠️ Technology Stack

- **Babylon.js 6.x** - 3D game engine
- **Havok Physics** - Physics simulation
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **GitHub Pages** - Static hosting

## 📦 Asset Credits

This game uses free assets from:
- **Mixamo** - Character models and animations
- **Kenney / Quaternius** - Environment props
- **Poly Haven** - Textures and HDR skyboxes
- **Freesound** - Sound effects

## 🎨 Adding Dialogue

Dialogues are defined in `src/data/dialogues.ts` using JSON structure:

```typescript
{
  "npc_id": {
    "name": "NPC Name",
    "initialDialogue": "greet",
    "dialogues": {
      "greet": {
        "text": "Hello!",
        "choices": [
          { "text": "Hi there", "next": "friendly" }
        ]
      }
    }
  }
}
```

## 🔧 Configuration

Game settings can be adjusted in `src/config.ts`:
- Movement speed
- Camera settings
- Combat parameters
- Audio settings (volume levels)
- Quality presets

### Audio System

The game includes a comprehensive audio system (`src/core/AudioManager.ts`) that provides:
- **Sound effects**: Gunshots, impacts, footsteps, jumps, and UI interactions
- **Spatial audio**: 3D positional sound for immersive gameplay
- **Volume control**: Separate controls for music and sound effects
- **Mute functionality**: Toggle audio on/off

Currently, the game uses procedurally generated placeholder sounds. To use custom audio files:
1. Add audio files (MP3, WAV, OGG) to a `public/sounds/` directory
2. Update the `loadSounds()` method in `AudioManager.ts` to load your audio files
3. Adjust volume levels in `src/config.ts`

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🎯 Roadmap

- [x] Implement audio system with sound effects
- [ ] Add custom audio files (replace placeholder sounds)
- [ ] Add background music
- [ ] Add audio settings UI panel
- [ ] Acquire and integrate free 3D assets
- [ ] Add character animations (idle, walk, run, shoot)
- [ ] Add more NPCs with varied dialogues
- [ ] Create larger game world
- [ ] Add inventory system
- [ ] Implement quest system
- [ ] Mobile touch controls support
