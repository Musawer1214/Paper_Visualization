
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Cone, Icosahedron, Stars, Environment, Box, Cylinder, Line, Sparkles } from '@react-three/drei';
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
      meshBasicMaterial: any;
      group: any;
      line_: any; 
      dodecahedronGeometry: any;
      instancedMesh: any;
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

// Camera Rig for Mouse Parallax
function Rig() {
  useFrame((state) => {
    // Lerp camera position based on mouse pointer (parallax effect)
    state.camera.position.lerp({ 
        x: state.pointer.x * 0.2, 
        y: state.pointer.y * 0.2, 
        z: 7 
    } as any, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

// --- 1. QUANTUM LAYER (Waves, Particles & Interference) ---
const QuantumParticles = ({ color }: { color: string }) => {
  const count = 40;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Initialize particle data
  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      t: Math.random() * 100,
      factor: Math.random() * 20 + 10,
      speed: Math.random() * 0.01 + 0.005,
      xFactor: Math.random() * 20 - 10,
      yFactor: Math.random() * 20 - 10,
      zFactor: Math.random() * 20 - 10,
      mx: 0, my: 0
    }))
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t) * 0.5 + 0.5;
      
      // Gentle mouse attraction
      particle.mx += (state.pointer.x * 5 - particle.mx) * 0.05;
      particle.my += (-state.pointer.y * 5 - particle.my) * 0.05;

      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.05, 0]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </instancedMesh>
  );
}

const QuantumLayer = ({ primary, secondary }: { primary: string, secondary: string }) => {
  const waveRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (waveRef.current) {
      const t = state.clock.getElapsedTime();
      waveRef.current.rotation.x = Math.sin(t * 0.2) * 0.2 + 1.57;
      waveRef.current.rotation.y = t * 0.1;
      // Slight scale pulse
      const s = 1 + Math.sin(t * 1.5) * 0.02;
      waveRef.current.scale.set(s, s, s);
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
      
      <QuantumParticles color={primary} />

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

// --- 2. AI LAYER (Neural Grid / Pulsing Connections) ---
const PulsingNode = ({ position, color, delay }: { position: [number, number, number], color: string, delay: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if(meshRef.current) {
            const t = state.clock.getElapsedTime();
            // Pulse scale
            const scale = 0.8 + Math.sin(t * 2 + delay) * 0.2;
            meshRef.current.scale.set(scale, scale, scale);
            // Pulse opacity/emissive
            const intensity = 0.2 + Math.max(0, Math.sin(t * 2 + delay)) * 0.5;
            (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
        }
    });

    return (
        <Box ref={meshRef} args={[0.5, 0.5, 0.5]} position={position}>
            <meshStandardMaterial 
                color={color} 
                emissive={color}
                emissiveIntensity={0.2}
                transparent 
                opacity={0.8}
                wireframe
            />
        </Box>
    );
};

const ConnectionLines = ({ nodes, color }: { nodes: any[], color: string }) => {
    const lineGeo = useMemo(() => {
        const points = [];
        // Connect nodes that are close enough
        for(let i=0; i<nodes.length; i++) {
            for(let j=i+1; j<nodes.length; j++) {
                const v1 = new THREE.Vector3(...nodes[i].pos);
                const v2 = new THREE.Vector3(...nodes[j].pos);
                if(v1.distanceTo(v2) < 4.5) {
                    points.push(v1);
                    points.push(v2);
                }
            }
        }
        return points;
    }, [nodes]);

    // Animate opacity of lines (simulating data flow)? 
    // Simplified: Just render clean lines.
    return (
        <Line 
            points={lineGeo} 
            color={color} 
            lineWidth={1} 
            transparent 
            opacity={0.15} 
        />
    )
}

const AILayer = ({ primary, secondary }: { primary: string, secondary: string }) => {
  const nodes = useMemo(() => {
    return Array.from({ length: 15 }).map(() => ({
      pos: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4
      ] as [number, number, number],
      delay: Math.random() * Math.PI
    }));
  }, []);

  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        {nodes.map((node, i) => (
          <PulsingNode 
            key={i} 
            position={node.pos} 
            color={i % 2 === 0 ? primary : secondary} 
            delay={node.delay} 
          />
        ))}
        <ConnectionLines nodes={nodes} color={primary} />
      </Float>
      
      {/* Central Core */}
      <Float speed={1} rotationIntensity={1}>
         <Icosahedron args={[1.2, 0]} position={[0,0,-2]}>
             <meshStandardMaterial color="#222" wireframe emissive={secondary} emissiveIntensity={0.2} />
         </Icosahedron>
      </Float>
    </group>
  );
};

// --- 3. BIOLOGY LAYER (Organic Breathing Cells) ---
const BreathingCell = ({ position, color, size, speed }: { position: [number, number, number], color: string, size: number, speed: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if(meshRef.current) {
            const t = state.clock.getElapsedTime();
            // Breathing scale
            const s = size + Math.sin(t * speed) * (size * 0.1);
            meshRef.current.scale.set(s, s, s);
        }
    });

    return (
         <Sphere ref={meshRef} args={[1, 32, 32]} position={position}>
              <MeshDistortMaterial 
                color={color} 
                speed={speed * 1.5} 
                distort={0.4} 
                radius={1}
                transparent
                opacity={0.6}
                roughness={0.2}
                metalness={0.1}
              />
         </Sphere>
    );
};

const FloatingParticle = ({ primary, secondary }: { primary: string, secondary: string }) => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state) => {
        if(ref.current) {
            const t = state.clock.getElapsedTime();
            // Complex orbital path
            ref.current.position.x = Math.sin(t * 0.5) * 3;
            ref.current.position.y = Math.cos(t * 0.3) * 2;
            ref.current.position.z = Math.sin(t * 0.2) * 2;
            ref.current.rotation.z = t * 0.2;
        }
    });

    return (
        <group ref={ref}>
            <Sphere args={[0.2, 16, 16]} position={[1, 0, 0]}>
                 <meshStandardMaterial color={secondary} transparent opacity={0.8} />
            </Sphere>
             <Sphere args={[0.15, 16, 16]} position={[-1, 0.5, 0]}>
                 <meshStandardMaterial color={primary} transparent opacity={0.8} />
            </Sphere>
        </group>
    );
};

const BiologyLayer = ({ primary, secondary }: { primary: string, secondary: string }) => {
  return (
    <group>
       <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
         <BreathingCell position={[0, 0, 0]} color={primary} size={1.8} speed={1.5} />
       </Float>

       <FloatingParticle primary={primary} secondary={secondary} />

       <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <BreathingCell position={[2.5, 1.5, -1]} color={secondary} size={0.6} speed={2} />
          <BreathingCell position={[-2.5, -1.5, 1]} color={secondary} size={0.5} speed={2.5} />
       </Float>
       
       <Sparkles count={20} scale={4} size={4} speed={0.4} opacity={0.5} color={secondary} />
    </group>
  );
};

// --- 4. COSMOS LAYER (Orbits & Twinkling) ---
const OrbitingPlanet = ({ radius, speed, size, color, offset = 0 }: { radius: number, speed: number, size: number, color: string, offset?: number }) => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if(ref.current) {
            const t = state.clock.getElapsedTime();
            ref.current.position.x = Math.sin(t * speed + offset) * radius;
            ref.current.position.z = Math.cos(t * speed + offset) * radius;
            // Axial tilt rotation
            ref.current.rotation.y += 0.01;
        }
    });
    return (
        <Sphere ref={ref} args={[size, 32, 32]}>
            <meshStandardMaterial color={color} roughness={0.7} />
        </Sphere>
    );
}

const CosmosLayer = ({ primary, secondary }: { primary: string, secondary: string }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
     if (ringRef.current) {
         ringRef.current.rotation.z = state.clock.getElapsedTime() * 0.05;
     }
     if (groupRef.current) {
         // Slow sway of entire system
         groupRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
     }
  });

  return (
    <group ref={groupRef}>
       <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
         <Sphere args={[2, 64, 64]} position={[0, 0, 0]}>
            <meshStandardMaterial color={primary} roughness={0.8} />
         </Sphere>
         <Torus ref={ringRef} args={[3.2, 0.05, 64, 100]} rotation={[1.2, 0, 0]}>
            <meshStandardMaterial color={secondary} emissive={secondary} emissiveIntensity={0.8} />
         </Torus>
       </Float>
       
       {/* Orbits */}
       <group rotation={[0.5, 0, 0]}>
           <OrbitingPlanet radius={3.5} speed={0.4} size={0.3} color="#fff" />
           <OrbitingPlanet radius={4.5} speed={0.3} size={0.2} color={secondary} offset={2} />
       </group>

       {/* Enhanced Star Field */}
       <Sparkles count={50} scale={10} size={2} speed={1} opacity={0.8} color="#fff" />
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
  // Ensure we fallback to general if theme is somehow undefined, though App.tsx handles this.
  const safeTheme = THEME_COLORS[theme] ? theme : 'general';
  const colors = THEME_COLORS[safeTheme];

  return (
    <div className="absolute inset-0 z-0 opacity-60 pointer-events-none transition-all duration-1000">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 0, 10]} angle={0.5} intensity={0.5} color={colors.secondary} />
        
        {safeTheme === 'quantum' && <QuantumLayer primary={colors.primary} secondary={colors.secondary} />}
        {safeTheme === 'ai' && <AILayer primary={colors.primary} secondary={colors.secondary} />}
        {safeTheme === 'biology' && <BiologyLayer primary={colors.primary} secondary={colors.secondary} />}
        {safeTheme === 'cosmos' && <CosmosLayer primary={colors.primary} secondary={colors.secondary} />}
        {safeTheme === 'material' && <MaterialLayer primary={colors.primary} secondary={colors.secondary} />}
        {safeTheme === 'general' && <AILayer primary={colors.primary} secondary={colors.secondary} />}

        <Environment preset="city" />
        
        {safeTheme === 'cosmos' ? (
             <Stars radius={100} depth={50} count={2000} factor={6} saturation={1} fade speed={1} />
        ) : (
             <Stars radius={100} depth={50} count={400} factor={4} saturation={0} fade speed={1} />
        )}
        
        {/* Parallax Rig */}
        <Rig />
      </Canvas>
    </div>
  );
};

// --- LEGACY/HARDWARE SCENE ---
export const HardwareScene: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} dpr={[1, 2]}>
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
        <Rig />
      </Canvas>
    </div>
  );
}
