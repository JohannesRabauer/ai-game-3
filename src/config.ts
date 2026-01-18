export const CONFIG = {
  // Game settings
  GAME_NAME: 'AI Game 3',
  
  // Physics settings
  GRAVITY: -9.81,
  PLAYER_MASS: 75,
  PLAYER_HEIGHT: 1.8,
  PLAYER_RADIUS: 0.4,
  
  // Movement settings
  MOVE_SPEED: 5,
  RUN_SPEED: 8,
  JUMP_FORCE: 8,
  
  // Camera settings
  CAMERA_RADIUS: 5,
  CAMERA_HEIGHT: 2,
  CAMERA_SENSITIVITY: 0.001,
  
  // Combat settings
  SHOOT_RANGE: 100,
  SHOOT_DAMAGE: 10,
  SHOOT_COOLDOWN: 100, // ms
  
  // NPC settings
  INTERACTION_RANGE: 3,
  
  // Quality settings
  DEFAULT_QUALITY: 'high' as 'low' | 'medium' | 'high',
  SHADOW_MAP_SIZE: 2048,
  MSAA_SAMPLES: 4,
  
  // Audio settings
  AUDIO_ENABLED: true,
  MUSIC_VOLUME: 0.5,
  SFX_VOLUME: 0.7,
  SPATIAL_AUDIO_MAX_DISTANCE: 50,
  FOOTSTEP_INTERVAL: 400, // ms between footsteps while walking
  FOOTSTEP_RUN_MULTIPLIER: 0.7, // Faster footsteps when running
};
