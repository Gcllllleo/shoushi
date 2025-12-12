export enum ParticleShape {
  GALAXY = 'GALAXY',
  HEART = 'HEART',
  FLOWER = 'FLOWER',
  SATURN = 'SATURN',
  FIREWORKS = 'FIREWORKS'
}

export interface ParticleState {
  shape: ParticleShape;
  color: string;
  scale: number;
  rotationSpeed: number;
  count: number;
}

export interface GeminiControlPayload {
  scaleDelta?: number; // Positive to expand, negative to shrink
  rotationDelta?: number; // Increase rotation speed
  detectedShape?: string; // If the model sees a shape gesture
}

// Internal types for Three.js geometry
export interface ParticleData {
  positions: Float32Array;
  colors?: Float32Array;
}