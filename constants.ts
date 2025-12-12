import * as THREE from 'three';
import { ParticleShape, ParticleData } from './types';

export const PARTICLE_COUNT = 8000;

// Helper to generate random point in sphere
const randomInSphere = (radius: number) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

export const generateParticles = (shape: ParticleShape, count: number): ParticleData => {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    let x = 0, y = 0, z = 0;

    switch (shape) {
      case ParticleShape.HEART: {
        // Parametric Heart Equation
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        // z = varied depth
        const t = Math.random() * Math.PI * 2;
        const scale = 0.5;
        // Add some random fuzziness
        const fuzz = 0.5; 
        x = (16 * Math.pow(Math.sin(t), 3)) * scale + (Math.random() - 0.5) * fuzz;
        y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale + (Math.random() - 0.5) * fuzz;
        z = (Math.random() - 0.5) * 4; 
        break;
      }

      case ParticleShape.GALAXY: {
        // Spiral Galaxy
        const branches = 3;
        const radius = Math.random() * 10;
        const spinAngle = radius * 0.8;
        const branchAngle = ((i % branches) / branches) * Math.PI * 2;
        
        const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
        const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
        const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;

        x = Math.cos(branchAngle + spinAngle) * radius + randomX;
        y = randomY * 2; // Flat galaxy
        z = Math.sin(branchAngle + spinAngle) * radius + randomZ;
        break;
      }

      case ParticleShape.SATURN: {
        // Sphere + Ring
        const isRing = Math.random() > 0.3;
        if (isRing) {
            // Ring
            const innerR = 6;
            const outerR = 12;
            const r = innerR + Math.random() * (outerR - innerR);
            const theta = Math.random() * Math.PI * 2;
            x = r * Math.cos(theta);
            z = r * Math.sin(theta);
            y = (Math.random() - 0.5) * 0.2;
        } else {
            // Planet
            const p = randomInSphere(4);
            x = p.x; y = p.y; z = p.z;
        }
        break;
      }

      case ParticleShape.FLOWER: {
        // Rose curve / Spherical harmonics hint
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        // Rose curve radius logic
        const k = 4; // number of petals
        const r = 8 * Math.cos(k * theta) * Math.sin(phi);
        
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.cos(phi);
        z = r * Math.sin(phi) * Math.sin(theta);
        
        // Add noise
        x += (Math.random() - 0.5);
        y += (Math.random() - 0.5);
        z += (Math.random() - 0.5);
        break;
      }

      case ParticleShape.FIREWORKS: {
        // Explosion sphere
        const p = randomInSphere(10);
        x = p.x; y = p.y; z = p.z;
        break;
      }
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }

  return { positions };
};

export const COLORS = {
  [ParticleShape.HEART]: '#ff0055',
  [ParticleShape.GALAXY]: '#00ffff',
  [ParticleShape.FLOWER]: '#ff69b4',
  [ParticleShape.SATURN]: '#ffa500',
  [ParticleShape.FIREWORKS]: '#ffffff',
};