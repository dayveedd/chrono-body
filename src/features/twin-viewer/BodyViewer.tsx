import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useTwinStore } from '../../store/useTwinStore';

// Pulsing organ component inside the 3D canvas
interface OrganMeshProps {
  position: [number, number, number];
  scale: number;
  color: string;
  name: string;
  score: number;
  onClick: () => void;
}

const OrganMesh: React.FC<OrganMeshProps> = ({ position, scale, color, onClick, score }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Custom pulsing animation using useFrame
  useFrame((state) => {
    if (!meshRef.current) return;
    const pulseFactor = score < 60 ? 3.0 : 1.0; // Pulse faster if at risk
    const time = state.clock.getElapsedTime() * pulseFactor;
    const s = scale * (1 + Math.sin(time * 3) * 0.08);
    meshRef.current.scale.set(s, s, s);
  });

  return (
    <mesh ref={meshRef} position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <sphereGeometry args={[0.09, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.2}
        roughness={0.1}
        metalness={0.1}
      />
    </mesh>
  );
};

// Procedural wireframe human model representation
const WireframeMannequin: React.FC = () => {
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#3b82f6" wireframe opacity={0.15} transparent />
      </mesh>
      
      {/* Torso */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.22, 0.15, 0.8, 16]} />
        <meshBasicMaterial color="#3b82f6" wireframe opacity={0.15} transparent />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.32, 0.4, 0]} rotation={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.06, 0.05, 0.7, 8]} />
        <meshBasicMaterial color="#3b82f6" wireframe opacity={0.12} transparent />
      </mesh>
      <mesh position={[0.32, 0.4, 0]} rotation={[0, 0, -0.1]}>
        <cylinderGeometry args={[0.06, 0.05, 0.7, 8]} />
        <meshBasicMaterial color="#3b82f6" wireframe opacity={0.12} transparent />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.12, -0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.06, 0.8, 8]} />
        <meshBasicMaterial color="#3b82f6" wireframe opacity={0.12} transparent />
      </mesh>
      <mesh position={[0.12, -0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.06, 0.8, 8]} />
        <meshBasicMaterial color="#3b82f6" wireframe opacity={0.12} transparent />
      </mesh>
    </group>
  );
};

export const BodyViewer: React.FC = () => {
  const { activeSystem, setActiveSystem, timelineYear, simulationResultsA } = useTwinStore();

  // Helper to determine organ health colors based on timeline simulation outputs
  const getOrganColorAndScore = (organ: string) => {
    let score = 90; // Default Optimal
    
    const ldl = simulationResultsA['ldl_trajectory']?.scalarOutputs[`year_${timelineYear}`] as number || 115;
    const a1c = simulationResultsA['hba1c_trajectory']?.scalarOutputs[`year_${timelineYear}`] as number || 5.5;

    if (organ === 'Heart' || organ === 'Cardiovascular') {
      score = Math.max(30, Math.min(100, Math.round(100 - (ldl - 100) * 0.6)));
    } else if (organ === 'Metabolic' || organ === 'Pancreas') {
      score = Math.max(30, Math.min(100, Math.round(100 - (a1c - 5.0) * 12)));
    } else if (organ === 'Lungs') {
      score = 85;
    } else if (organ === 'Kidneys') {
      score = 92;
    } else if (organ === 'Brain') {
      score = 95;
    }

    let color = '#10b981'; // Optimal: Green
    if (score < 60) {
      color = '#f43f5e'; // Critical: Red
    } else if (score < 80) {
      color = '#f59e0b'; // Elevated: Amber
    }

    return { color, score };
  };

  const organs = [
    { name: 'Brain', pos: [0, 1.2, 0.02] as [number, number, number], scale: 1.0 },
    { name: 'Heart', pos: [-0.06, 0.52, 0.08] as [number, number, number], scale: 0.95 },
    { name: 'Lungs', pos: [0.06, 0.52, 0.08] as [number, number, number], scale: 0.9 },
    { name: 'Liver', pos: [0.06, 0.28, 0.08] as [number, number, number], scale: 0.85 },
    { name: 'Kidneys', pos: [-0.07, 0.12, -0.06] as [number, number, number], scale: 0.8 }
  ];

  return (
    <div className="relative w-full h-[500px] md:h-full glass-card rounded-lg overflow-hidden flex flex-col justify-between">
      {/* 3D Canvas rendering */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0.4, 2.5], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1.0} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <WireframeMannequin />
          
          {organs.map((org) => {
            const { color, score } = getOrganColorAndScore(org.name);
            return (
              <OrganMesh
                key={org.name}
                position={org.pos}
                scale={org.scale}
                color={color}
                name={org.name}
                score={score}
                onClick={() => setActiveSystem(org.name.toLowerCase())}
              />
            );
          })}

          <OrbitControls enableZoom={true} minDistance={1.0} maxDistance={5.0} />
        </Canvas>
      </div>

      {/* Floating HUD controls overlays */}
      <div className="relative z-10 p-4 w-full flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1 text-[10px] font-mono text-text-muted bg-bg-surface/80 p-2 rounded border border-border-subtle/50 backdrop-blur-sm pointer-events-auto">
          <span className="font-bold text-text-primary">3D GRAPHIC ENGINE</span>
          <span>Camera: Orbital v1.0</span>
          <span>Timeline Year: {timelineYear}Y</span>
        </div>

        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {organs.map((org) => {
            const { color, score } = getOrganColorAndScore(org.name);
            const active = activeSystem === org.name.toLowerCase();
            return (
              <button
                key={org.name}
                onClick={() => setActiveSystem(org.name.toLowerCase())}
                className={`text-xs px-2.5 py-1.5 rounded flex items-center justify-between gap-4 font-mono font-bold transition-all border ${active ? 'bg-primary-blue/10 border-primary-blue text-primary-blue shadow-sm' : 'bg-bg-surface/80 border-border-subtle text-text-muted hover:border-text-primary'}`}
              >
                <span>{org.name.toUpperCase()}</span>
                <span style={{ color }}>{score}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 p-4 text-center text-[10px] font-mono text-text-muted border-t border-border-subtle/40 bg-bg-surface/30">
        Drag to rotate. Scroll to zoom. Click organ node to analyze.
      </div>
    </div>
  );
};
