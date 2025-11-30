
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Cone, Icosahedron, Stars, Environment, Box, Cylinder, Line } from '@react-three/drei';
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
      line_: any; 
    }
  }
}

// --- Theme Colors ---
const THEME_COLORS: Record<PaperTheme, { primary: string; secondary: string; bg: string }> = {
  quantum: { primary: '#C5A059', secondary: '#4F46E5', bg: '#000' },
  ai: { primary: '#10B981', secondary: '#EC4899', bg: '#111' },
  biology: { primary: '#84CC16', secondary: '#06B6D4', bg: '#0f172a' },
  cosmos: { primary: '#F59E0B', secondary: '#6366F1', bg: '#000' },
  material: { primary: '#EF4444', secondary: '#64748B', bg: '#1c1917' },
  general: { primary: '#78716C', secondary: '#1C1917', bg: '#1c1917' }
};

// --- 1. QUANTUM LAYER (Waves & Particles) ---
const QuantumLayer = ({ primary, secondary }: { primary: string, secondary: string }) => {
  const waveRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (waveRef.current) {
      const t = state.clock.getElapsedTime();
      waveRef.current.rotation.x = Math.sin(t * 0.2) * 0.2 + 1.57;
      waveRef.current.rotation.y = t * 0.1;
    }
  });

  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <Sphere args={[1, 32, 32]} position={[0, 0, 0]} scale={1.2}>
           <MeshDistortMaterial color={secondary} speed={2} distort={0.4} metalness={0.5} roughness={0.2} />
        </Sphere>
        <Torus ref={waveRef} args={[3.5, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
           <meshStandardMaterial color={primary} emissive={primary} emissiveIntensity={0.5} transparent opacity={0.4} wireframe />
        </Torus>
      </Float>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere args={[0.5, 32, 32]} position={[-3, 1, -2]}>
             <meshStandardMaterial color={primary} metalness={0.8} roughness={0.2} />
        </Sphere>
        <Sphere args={[0.6, 32, 32]} position={[3, -1, -3]}>
             <meshStandardMaterial color={secondary} metalness={0.8} roughness={0.2} />
        </Sphere>
      </Float>
    </group>
  );
};

// --- 2. AI LAYER (Neural Grid / Cubes) ---
const AILayer = ({ primary, secondary }: { primary: string, secondary: string }) => {
  // Generate random positions for "nodes"
  const nodes = useMemo(() => {
    return Array.from({ length: 12 }).map(() => ({
      pos: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4
      ] as [number, number, number],
      scale: Math.random() * 0.5 + 0.2
    }));
  }, []);

  return (
    <group>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {nodes.map((node, i) => (
          <Box key={i} args={[1, 1, 1]} position={node.pos} scale={node.scale}>
            <meshStandardMaterial 
              color={i % 2 === 0 ? primary : secondary} 
              transparent 
              opacity={0.8}
              wireframe={i % 3 === 0} 
            />
          </Box>
        ))}
      </Float>
      {/* Decorative center piece */}
      <Float speed={1} rotationIntensity={1}>
         <Icosahedron args={[1.5, 0]} position={[0,0,-2]}>
             <meshStandardMaterial color="#333" wireframe emissive={secondary} emissiveIntensity={0.2} />
         </Icosahedron>
      </Float>
    </group>
  );
};

// --- 3. BIOLOGY LAYER (Organic Cells) ---
const BiologyLayer = ({ primary, secondary }: { primary: string, secondary: string }) => {
  return (
    <group>
       {/* Large central cell */}
       <Float speed={1} rotationIntensity={0.4} floatIntensity={0.5}>
         <Sphere args={[1.8, 64, 64]} position={[0, 0, 0]}>
            <MeshDistortMaterial 
              color={primary} 
              speed={1.5} 
              distort={0.6} 
              radius={1}
              transparent
              opacity={0.6}
              roughness={0.2}
              metalness={0.1}
            />
         </Sphere>
       </Float>

       {/* Floating helper cells */}
       <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <Sphere args={[0.8, 32, 32]} position={[2.5, 1.5, -1]}>
              <MeshDistortMaterial color={secondary} speed={3} distort={0.5} transparent opacity={0.5} />
          </Sphere>
          <Sphere args={[0.6, 32, 32]} position={[-2.5, -1.5, 1]}>
              <MeshDistortMaterial color={secondary} speed={3} distort={0.5} transparent opacity={0.5} />
          </Sphere>
       </Float>
    </group>
  );
};

// --- 4. COSMOS LAYER (Planets & Orbit) ---
const CosmosLayer = ({ primary, secondary }: { primary: string, secondary: string }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
     if (ringRef.current) {
         ringRef.current.rotation.z = state.clock.getElapsedTime() * 0.1;
     }
  });

  return (
    <group>
       <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
         {/* Main Planet */}
         <Sphere args={[2, 64, 64]} position={[0, 0, 0]}>
            <meshStandardMaterial color={primary} roughness={0.8} />
         </Sphere>
         {/* Ring */}
         <Torus ref={ringRef} args={[3.2, 0.05, 64, 100]} rotation={[1.2, 0, 0]}>
            <meshStandardMaterial color={secondary} emissive={secondary} emissiveIntensity={0.8} />
         </Torus>
       </Float>
       
       <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
           <Sphere args={[0.3, 32, 32]} position={[3, 1, 0]}>
               <meshStandardMaterial color="#fff" emissive="#fff" />
           </Sphere>
       </Float>
    </group>
  );
};

// --- 5. MATERIAL LAYER (Lattice Structure) ---
const MaterialLayer = ({ primary, secondary }: { primary: string, secondary: string }) => {
  const lattice = useMemo(() => {
    const items = [];
    for(let x=-1; x<=1; x++) {
        for(let y=-1; y<=1; y++) {
             items.push({ pos: [x*1.5, y*1.5, 0] as [number, number, number] });
        }
    }
    return items;
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
      if(groupRef.current) {
          groupRef.current.rotation.z = state.clock.getElapsedTime() * 0.1;
          groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.2;
      }
  });

  return (
     <group ref={groupRef}>
        {lattice.map((item, i) => (
            <group key={i} position={item.pos}>
                <Cone args={[0.5, 1, 4]} rotation={[0, 0, Math.PI]}>
                    <meshStandardMaterial color={i % 2 === 0 ? primary : secondary} metalness={0.8} roughness={0.2} />
                </Cone>
            </group>
        ))}
     </group>
  );
};

// --- MAIN HERO SCENE ---
interface HeroSceneProps {
    theme: PaperTheme;
}

export const HeroScene: React.FC<HeroSceneProps> = ({ theme }) => {
  const colors = THEME_COLORS[theme] || THEME_COLORS.quantum;

  return (
    <div className="absolute inset-0 z-0 opacity-60 pointer-events-none transition-all duration-1000">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 0, 10]} angle={0.5} intensity={0.5} color={colors.secondary} />
        
        {theme === 'quantum' && <QuantumLayer primary={colors.primary} secondary={colors.secondary} />}
        {theme === 'ai' && <AILayer primary={colors.primary} secondary={colors.secondary} />}
        {theme === 'biology' && <BiologyLayer primary={colors.primary} secondary={colors.secondary} />}
        {theme === 'cosmos' && <CosmosLayer primary={colors.primary} secondary={colors.secondary} />}
        {theme === 'material' && <MaterialLayer primary={colors.primary} secondary={colors.secondary} />}
        {theme === 'general' && <AILayer primary={colors.primary} secondary={colors.secondary} />}

        <Environment preset="city" />
        
        {theme === 'cosmos' ? (
             <Stars radius={100} depth={50} count={2000} factor={6} saturation={1} fade speed={1} />
        ) : (
             <Stars radius={100} depth={50} count={400} factor={4} saturation={0} fade speed={1} />
        )}
      </Canvas>
    </div>
  );
};

// --- LEGACY/HARDWARE SCENE (For Impact Section) ---
export const HardwareScene: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={1} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={2} color="#C5A059" />
        <Environment preset="studio" />
        <Float rotationIntensity={0.4} floatIntensity={0.2} speed={1}>
          <group position={[0, 0.5, 0]}>
            <Cylinder args={[1.2, 1.2, 0.1, 64]} position={[0, 1, 0]}><meshStandardMaterial color="#C5A059" metalness={1} roughness={0.15} /></Cylinder>
            <Cylinder args={[1, 1, 0.1, 64]} position={[0, 0.2, 0]}><meshStandardMaterial color="#C5A059" metalness={1} roughness={0.15} /></Cylinder>
            <Cylinder args={[0.6, 0.6, 0.1, 64]} position={[0, -0.6, 0]}><meshStandardMaterial color="#C5A059" metalness={1} roughness={0.15} /></Cylinder>
            <Box args={[0.2, 0.05, 0.2]} position={[0, -0.7, 0]}><meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} /></Box>
          </group>
        </Float>
      </Canvas>
    </div>
  );
}
