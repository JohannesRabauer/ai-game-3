import { Scene, Sound, Vector3 } from '@babylonjs/core';

/**
 * AudioManager handles all game audio including sound effects and music
 */
export class AudioManager {
  private scene: Scene;
  private sounds: Map<string, Sound> = new Map();
  private musicVolume = 0.5;
  private sfxVolume = 0.7;
  private isMuted = false;
  
  // Track background music
  private currentMusic: Sound | null = null;
  
  constructor(scene: Scene) {
    this.scene = scene;
    this.loadSounds();
  }
  
  /**
   * Load all game sounds
   * Using Babylon.js Sound API which supports web audio
   */
  private loadSounds(): void {
    // We'll create placeholder sounds using Web Audio API oscillators
    // In production, these would be loaded from actual audio files
    
    // Combat sounds
    this.createPlaceholderSound('gunshot', 200, 0.1);
    this.createPlaceholderSound('impact', 300, 0.05);
    
    // Movement sounds
    this.createPlaceholderSound('footstep', 150, 0.08);
    this.createPlaceholderSound('jump', 180, 0.12);
    this.createPlaceholderSound('land', 140, 0.1);
    
    // Interaction sounds
    this.createPlaceholderSound('dialogue_open', 400, 0.15);
    this.createPlaceholderSound('dialogue_close', 350, 0.12);
    this.createPlaceholderSound('dialogue_select', 450, 0.08);
    
    // UI sounds
    this.createPlaceholderSound('ui_click', 500, 0.05);
    this.createPlaceholderSound('ui_hover', 600, 0.03);
  }
  
  /**
   * Create a placeholder sound using Web Audio API oscillator
   * This generates a simple tone as a placeholder for actual audio files
   */
  private createPlaceholderSound(name: string, frequency: number, duration: number): void {
    // Create a simple beep sound using Web Audio API
    // This is a placeholder - in production you'd load actual audio files
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a buffer for the sound
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channel = buffer.getChannelData(0);
    
    // Generate a simple tone with envelope
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 10); // Decay envelope
      channel[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }
    
    // Create Babylon.js Sound from buffer
    // Note: Babylon.js Sound can be created from URL or ArrayBuffer
    // For now, we'll use a data URL approach
    this.createSoundFromBuffer(name, buffer);
  }
  
  /**
   * Create a Babylon.js Sound from an AudioBuffer
   */
  private async createSoundFromBuffer(name: string, buffer: AudioBuffer): Promise<void> {
    // Convert AudioBuffer to WAV blob and create object URL
    const wav = this.audioBufferToWav(buffer);
    const blob = new Blob([wav], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    
    // Create Babylon.js Sound
    const sound = new Sound(name, url, this.scene, () => {
      // Sound loaded
    }, {
      loop: false,
      autoplay: false,
      volume: this.sfxVolume,
      spatialSound: false
    });
    
    this.sounds.set(name, sound);
  }
  
  /**
   * Convert AudioBuffer to WAV format
   * Based on: https://github.com/Jam3/audiobuffer-to-wav
   */
  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;
    
    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };
    
    // RIFF identifier
    setUint32(0x46464952);
    // File length
    setUint32(length - 8);
    // RIFF type
    setUint32(0x45564157);
    // Format chunk identifier
    setUint32(0x20746d66);
    // Format chunk length
    setUint32(16);
    // Sample format (raw)
    setUint16(1);
    // Channel count
    setUint16(buffer.numberOfChannels);
    // Sample rate
    setUint32(buffer.sampleRate);
    // Byte rate (sample rate * block align)
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
    // Block align (channel count * bytes per sample)
    setUint16(buffer.numberOfChannels * 2);
    // Bits per sample
    setUint16(16);
    // Data chunk identifier
    setUint32(0x61746164);
    // Data chunk length
    setUint32(length - pos - 4);
    
    // Write interleaved data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }
    
    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }
    
    return arrayBuffer;
  }
  
  /**
   * Play a sound effect
   */
  playSound(name: string, volume?: number): void {
    if (this.isMuted) return;
    
    const sound = this.sounds.get(name);
    if (sound) {
      const vol = volume !== undefined ? volume * this.sfxVolume : this.sfxVolume;
      sound.setVolume(vol);
      sound.play();
    } else {
      console.warn(`Sound not found: ${name}`);
    }
  }
  
  /**
   * Play a 3D spatial sound at a specific position
   */
  playSoundAtPosition(name: string, position: Vector3, volume?: number): void {
    if (this.isMuted) return;
    
    const sound = this.sounds.get(name);
    if (sound) {
      const vol = volume !== undefined ? volume * this.sfxVolume : this.sfxVolume;
      sound.setVolume(vol);
      sound.spatialSound = true;
      sound.setPosition(position);
      sound.maxDistance = 50;
      sound.play();
    }
  }
  
  /**
   * Play background music
   */
  playMusic(name: string, loop: boolean = true): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
    }
    
    const music = this.sounds.get(name);
    if (music) {
      music.setVolume(this.isMuted ? 0 : this.musicVolume);
      music.loop = loop;
      this.currentMusic = music;
      music.play();
    }
  }
  
  /**
   * Stop current background music
   */
  stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }
  
  /**
   * Set master volume for sound effects
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    
    // Update all non-music sounds
    this.sounds.forEach((sound) => {
      if (sound !== this.currentMusic) {
        sound.setVolume(this.sfxVolume);
      }
    });
  }
  
  /**
   * Set master volume for music
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.isMuted ? 0 : this.musicVolume);
    }
  }
  
  /**
   * Mute/unmute all audio
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    
    if (muted) {
      this.sounds.forEach(sound => sound.setVolume(0));
    } else {
      this.sounds.forEach((sound) => {
        if (sound === this.currentMusic) {
          sound.setVolume(this.musicVolume);
        } else {
          sound.setVolume(this.sfxVolume);
        }
      });
    }
  }
  
  /**
   * Toggle mute
   */
  toggleMute(): void {
    this.setMuted(!this.isMuted);
  }
  
  /**
   * Check if audio is muted
   */
  isMutedState(): boolean {
    return this.isMuted;
  }
  
  /**
   * Clean up all sounds
   */
  dispose(): void {
    this.sounds.forEach(sound => sound.dispose());
    this.sounds.clear();
    this.currentMusic = null;
  }
}
