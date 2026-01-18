import { Scene, DefaultRenderingPipeline, ImageProcessingConfiguration, Color4 } from '@babylonjs/core';
import { CONFIG } from '../config';

export interface QualityLevel {
  name: 'low' | 'medium' | 'high';
  msaa: number;
  shadowMapSize: number;
  bloomEnabled: boolean;
  chromaticAberrationEnabled: boolean;
  sharpenEnabled: boolean;
}

export const QUALITY_PRESETS: Record<string, QualityLevel> = {
  low: {
    name: 'low',
    msaa: 1,
    shadowMapSize: 512,
    bloomEnabled: false,
    chromaticAberrationEnabled: false,
    sharpenEnabled: false,
  },
  medium: {
    name: 'medium',
    msaa: 2,
    shadowMapSize: 1024,
    bloomEnabled: true,
    chromaticAberrationEnabled: false,
    sharpenEnabled: false,
  },
  high: {
    name: 'high',
    msaa: 4,
    shadowMapSize: 2048,
    bloomEnabled: true,
    chromaticAberrationEnabled: true,
    sharpenEnabled: true,
  },
};

export class QualitySettings {
  private pipeline: DefaultRenderingPipeline;
  private currentQuality: QualityLevel;
  
  constructor(private scene: Scene) {
    // Create rendering pipeline
    this.pipeline = new DefaultRenderingPipeline(
      'defaultPipeline',
      true, // HDR enabled
      scene,
      scene.cameras
    );
    
    // Set initial quality
    this.currentQuality = QUALITY_PRESETS[CONFIG.DEFAULT_QUALITY];
    this.applyQualitySettings();
    this.setupImageProcessing();
  }
  
  private setupImageProcessing(): void {
    // Configure HDR tone mapping
    this.scene.imageProcessingConfiguration.exposure = 1.0;
    this.scene.imageProcessingConfiguration.contrast = 1.6;
    this.scene.imageProcessingConfiguration.toneMappingEnabled = true;
    this.scene.imageProcessingConfiguration.toneMappingType = 
      ImageProcessingConfiguration.TONEMAPPING_ACES;
    
    // Set background color
    this.scene.clearColor = new Color4(0.5, 0.7, 1.0, 1.0);
  }
  
  private applyQualitySettings(): void {
    const quality = this.currentQuality;
    
    // MSAA
    this.pipeline.samples = quality.msaa;
    
    // Note: SSAO properties have been removed from DefaultRenderingPipeline in newer versions
    // If SSAO is needed, use SSAORenderingPipeline separately
    
    // Bloom
    this.pipeline.bloomEnabled = quality.bloomEnabled;
    if (quality.bloomEnabled) {
      this.pipeline.bloomThreshold = 0.8;
      this.pipeline.bloomWeight = 0.3;
      this.pipeline.bloomKernel = 64;
    }
    
    // Chromatic Aberration
    this.pipeline.chromaticAberrationEnabled = quality.chromaticAberrationEnabled;
    if (quality.chromaticAberrationEnabled) {
      this.pipeline.chromaticAberration.aberrationAmount = 10;
    }
    
    // Sharpen
    this.pipeline.sharpenEnabled = quality.sharpenEnabled;
    if (quality.sharpenEnabled) {
      this.pipeline.sharpen.edgeAmount = 0.3;
      this.pipeline.sharpen.colorAmount = 0.3;
    }
    
    console.log(`Quality set to: ${quality.name}`);
  }
  
  setQuality(level: 'low' | 'medium' | 'high'): void {
    this.currentQuality = QUALITY_PRESETS[level];
    this.applyQualitySettings();
  }
  
  getCurrentQuality(): QualityLevel {
    return this.currentQuality;
  }
  
  getPipeline(): DefaultRenderingPipeline {
    return this.pipeline;
  }
}
