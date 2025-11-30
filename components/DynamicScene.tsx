
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Cone, Icosahedron, Stars, Environment, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { PaperTheme } from '../types';

// Augment JSX namespace to include R3F intrinsic elements
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      meshStandardMaterial: any;
      group: any;
    }
  }
}

// --- Theme Configurations ---
const THEMES: Record<PaperTheme, { primary: string; secondary: string; shape: 'sphere' | 'box' | 'cone' | 'icosahedron' }> = {
  quantum: { primary: '#C5A059', secondary: '#4F46E5', shape: 'sphere' }, // Gold & Indigo
  ai: { primary: '#10B981', secondary: '#EC4899', shape: 'box' }, // Emerald & Pink
  biology: { primary: '#84CC16', secondary: '#06B6D4', shape: 'icosahedron' }, // Lime & Cyan
  cosmos: { primary: '#F59E0B', secondary: '#6366F1', shape: 'sphere' }, // Amber & Indigo
  material: { primary: '#EF4444', secondary: '#64748B', shape: 'cone' }, // Red & Slate
  general: { primary: '#78716C', secondary: '#1C1917', shape: 'box' } // Stone
};

const DynamicParticle = ({ position, color, shape, scale = 1 }: { position: [number, number, number]; color: string; shape: string; scale?: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      ref.current.position.y = position[1] + Math.sin(t * 1.5 + position[0]) * 0.2;
      ref.current.rotation.x = t * 0.4;
      ref.current.rotation.z = t * 0.2;
    }
  });

  const Material = (
    <MeshDistortMaterial
      color={color}
      envMapIntensity={1}
      clearcoat={1}
      clearcoatRoughness={0}
      metalness={0.6}
      distort={0.4}
      speed={2}
    />
  );

  return (
    <group position={position} scale={scale}>
        {shape === 'sphere' && <Sphere ref={ref} args={[1, 32, 32]}>{Material}</Sphere>}
        {shape === 'box' && <Box ref={ref} args={[1.5, 1.5, 1.5]}>{Material}</Box>}
        {shape === 'cone' && <Cone ref={ref} args={[1, 2, 32]}>{Material}</Cone>}
        {shape === 'icosahedron' && <Icosahedron ref={ref} args={[1, 0]}>{Material}</Icosahedron>}
    </group>
  );
};

const MacroscopicWave = ({ color }: { color: string }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
       const t = state.clock.getElapsedTime();
       ref.current.rotation.x = Math.sin(t * 0.2) * 0.2 + 1.57;
       ref.current.rotation.y = t * 0.1;
    }
  });

  return (
    <Torus ref={ref} args={[3.5, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.4} wireframe />
    </Torus>
  );
}

interface HeroSceneProps {
    theme: PaperTheme;
}

export const HeroScene: React.FC<HeroSceneProps> = ({ theme }) => {
  const config = THEMES[theme] || THEMES.quantum;

  return (
    <div className="absolute inset-0 z-0 opacity-60 pointer-events-none transition-colors duration-1000">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <DynamicParticle position={[0, 0, 0]} color={config.secondary} shape={config.shape} scale={1.2} />
          <MacroscopicWave color={config.primary} />
        </Float>
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
           <DynamicParticle position={[-3, 1, -2]} color={config.primary} shape={config.shape} scale={0.5} />
           <DynamicParticle position={[3, -1, -3]} color={config.secondary} shape={config.shape} scale={0.6} />
        </Float>

        <Environment preset="city" />
        {theme === 'cosmos' ? (
             <Stars radius={100} depth={50} count={2000} factor={6} saturation={1} fade speed={1} />
        ) : (
             <Stars radius={100} depth={50} count={500} factor={4} saturation={0} fade speed={1} />
        )}
      </Canvas>
    </div>
  );
};

// Kept specifically for the "Quantum" mode or default fallback impact scene
export const HardwareScene: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={1} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={2} color="#C5A059" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        <Environment preset="studio" />
        
        <Float rotationIntensity={0.4} floatIntensity={0.2} speed={1}>
          <group rotation={[0, 0, 0]} position={[0, 0.5, 0]}>
            <Cylinder args={[1.2, 1.2, 0.1, 64]} position={[0, 1, 0]}>
              <meshStandardMaterial color="#C5A059" metalness={1} roughness={0.15} />
            </Cylinder>
            <Cylinder args={[1, 1, 0.1, 64]} position={[0, 0.2, 0]}>
              <meshStandardMaterial color="#C5A059" metalness={1} roughness={0.15} />
            </Cylinder>
            <Cylinder args={[0.6, 0.6, 0.1, 64]} position={[0, -0.6, 0]}>
              <meshStandardMaterial color="#C5A059" metalness={1} roughness={0.15} />
            </Cylinder>
            <Cylinder args={[0.04, 0.04, 0.8, 16]} position={[0.5, 0.6, 0]}><meshStandardMaterial color="#D1D5DB" metalness={0.8} roughness={0.2} /></Cylinder>
            <Cylinder args={[0.04, 0.04, 0.8, 16]} position={[-0.5, 0.6, 0]}><meshStandardMaterial color="#D1D5DB" metalness={0.8} roughness={0.2} /></Cylinder>
            <Torus args={[0.7, 0.015, 16, 64]} position={[0, -0.2, 0]} rotation={[Math.PI/2, 0, 0]}><meshStandardMaterial color="#B87333" metalness={0.8} roughness={0.3} /></Torus>
             <Box args={[0.2, 0.05, 0.2]} position={[0, -0.7, 0]}>
                <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
            </Box>
          </group>
        </Float>
      </Canvas>
    </div>
  );
}
