import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateParticles, PARTICLE_COUNT } from '../constants';
import { ParticleShape } from '../types';

interface ParticleSystemProps {
  shape: ParticleShape;
  color: string;
  scale: number;
  rotationSpeed: number;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ shape, color, scale, rotationSpeed }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  // Generate geometry data based on shape
  // We use useMemo to avoid regenerating on every frame, only when shape changes
  const { positions } = useMemo(() => generateParticles(shape, PARTICLE_COUNT), [shape]);

  // Create BufferAttribute
  const bufferGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  // Animation Loop
  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Rotation
      pointsRef.current.rotation.y += rotationSpeed * delta * 0.5;
      pointsRef.current.rotation.x += rotationSpeed * delta * 0.1;
      
      // Floating effect
      pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
    }

    // Smooth color transition
    if (materialRef.current) {
        materialRef.current.color.lerp(new THREE.Color(color), delta * 2);
    }
  });

  return (
    <points ref={pointsRef} geometry={bufferGeometry} scale={[scale, scale, scale]}>
      <pointsMaterial
        ref={materialRef}
        size={0.15}
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
};

export default ParticleSystem;