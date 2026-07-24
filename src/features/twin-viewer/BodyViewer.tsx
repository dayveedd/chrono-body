import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useTwinStore } from '../../store/useTwinStore';

// High-fidelity Translucent Skeleton Mesh
const SkeletonBones: React.FC = () => {
  const { scene } = useGLTF('/models/human_anatomy.glb');
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Render detailed skeleton in bone-white with custom opacity to view organs inside
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#f3efe6'),
          roughness: 0.95,
          metalness: 0.02,
          transparent: true,
          opacity: 0.55,
          side: THREE.DoubleSide
        });
      }
    });
    return clone;
  }, [scene]);

  return <primitive object={clonedScene} />;
};

// Pulsing organ component inside the skeleton group (Procedural)
interface OrganMeshProps {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  name: string;
  score: number;
  onClick: () => void;
  type?: 'heart' | 'lungs' | 'kidney' | 'brain' | 'liver';
}

const OrganMesh: React.FC<OrganMeshProps> = ({ position, scale, color, name: _name, onClick, score, type = 'heart' }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const secondaryMeshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    if (type === 'heart') {
      const heartRate = score < 60 ? 3.2 : 1.25;
      const beat = Math.sin(time * Math.PI * 2 * heartRate);
      const pulse = 1 + (beat > 0.75 ? 0.08 : (beat < -0.75 ? -0.04 : 0));
      meshRef.current.scale.set(scale[0] * pulse, scale[1] * pulse, scale[2] * pulse);
    } else if (type === 'lungs') {
      const breath = 1 + Math.sin(time * 1.4) * 0.05;
      meshRef.current.scale.set(scale[0] * breath, scale[1] * breath, scale[2] * (breath * 0.9));
    } else {
      const micro = 1 + Math.sin(time * 0.7) * 0.015;
      meshRef.current.scale.set(scale[0] * micro, scale[1] * micro, scale[2] * micro);
    }
  });

  const getGeometry = () => {
    switch (type) {
      case 'lungs':
        return <capsuleGeometry args={[0.018, 0.045, 8, 16]} />;
      case 'kidney':
        return <sphereGeometry args={[0.009, 16, 16]} />; // Bean shape
      case 'liver':
        return <coneGeometry args={[0.022, 0.035, 4]} />; // Wedge
      case 'brain':
        return <sphereGeometry args={[0.028, 32, 32]} />;
      default: // heart
        return <dodecahedronGeometry args={[0.016]} />;
    }
  };

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh ref={meshRef}>
        {getGeometry()}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.4}
          roughness={0.15}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Glowing boundary mesh */}
      <mesh ref={secondaryMeshRef} scale={[1.2, 1.2, 1.2]}>
        {getGeometry()}
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.12}
          wireframe
        />
      </mesh>
    </group>
  );
};

// Main Arterial Network overlays (Red/Blue tubes routing down limbs)
const CirculatorySystem: React.FC = () => {
  return (
    <group>
      {/* Aorta Trunk (Red) */}
      <mesh position={[0.005, 0.08, -0.006]}>
        <cylinderGeometry args={[0.002, 0.002, 0.3, 8]} />
        <meshBasicMaterial color="#ef4444" opacity={0.3} transparent />
      </mesh>
      
      {/* Vena Cava Trunk (Blue) */}
      <mesh position={[-0.005, 0.08, -0.006]}>
        <cylinderGeometry args={[0.002, 0.002, 0.3, 8]} />
        <meshBasicMaterial color="#3b82f6" opacity={0.3} transparent />
      </mesh>

      {/* Arm arterial lines */}
      <mesh position={[0.02, 0.22, -0.06]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[0.001, 0.001, 0.15, 8]} />
        <meshBasicMaterial color="#ef4444" opacity={0.25} transparent />
      </mesh>
      <mesh position={[-0.02, 0.22, 0.06]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.001, 0.001, 0.15, 8]} />
        <meshBasicMaterial color="#3b82f6" opacity={0.25} transparent />
      </mesh>
    </group>
  );
};

export const BodyViewer: React.FC = () => {
  const { activeSystem, setActiveSystem, timelineYear, simulationResultsA } = useTwinStore();
  
  const [useGltfModel, setUseGltfModel] = useState(false);

  useEffect(() => {
    // Check if the skeleton GLB exists and is not the index.html SPA redirect page
    fetch('/models/human_anatomy.glb', { method: 'HEAD' })
      .then((res) => {
        const contentType = res.headers.get('content-type') || '';
        if (res.status === 200 && !contentType.includes('text/html')) {
          setUseGltfModel(true);
        } else {
          setUseGltfModel(false);
        }
      })
      .catch(() => {
        setUseGltfModel(false);
      });
  }, []);

  const getOrganColorAndScore = (organ: string) => {
    let score = 90;
    const ldl = simulationResultsA['ldl_trajectory']?.scalarOutputs[`year_${timelineYear}`] as number || 115;
    const a1c = simulationResultsA['hba1c_trajectory']?.scalarOutputs[`year_${timelineYear}`] as number || 5.5;

    const lowerName = organ.toLowerCase();

    if (lowerName.includes('heart') || lowerName.includes('cardio')) {
      score = Math.max(30, Math.min(100, Math.round(100 - (ldl - 100) * 0.6)));
    } else if (lowerName.includes('metabolic') || lowerName.includes('pancreas') || lowerName.includes('liver')) {
      score = Math.max(30, Math.min(100, Math.round(100 - (a1c - 5.0) * 12)));
    } else if (lowerName.includes('lung')) {
      score = 85;
    } else if (lowerName.includes('kidney')) {
      score = 92;
    } else if (lowerName.includes('brain')) {
      score = 95;
    }

    let color = '#10b981'; // Green
    if (score < 60) {
      color = '#f43f5e'; // Red
    } else if (score < 80) {
      color = '#f59e0b'; // Amber
    }

    return { color, score };
  };

  // Coordinated Local Organ mapping coordinates matching the skeleton's layout frame
  const organsList = [
    { name: 'Brain', pos: [0, 0.38, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number], type: 'brain' as const },
    { name: 'Heart', pos: [0.025, 0.22, -0.015] as [number, number, number], scale: [1, 1, 1] as [number, number, number], type: 'heart' as const },
    { name: 'Lungs', pos: [0.01, 0.22, -0.05] as [number, number, number], scale: [1, 1, 1] as [number, number, number], type: 'lungs' as const },
    { name: 'Liver', pos: [0.02, 0.05, 0.045] as [number, number, number], scale: [1, 1, 1] as [number, number, number], type: 'liver' as const },
    { name: 'Kidneys', pos: [-0.035, -0.02, -0.028] as [number, number, number], scale: [1, 1.2, 0.85] as [number, number, number], type: 'kidney' as const }
  ];

  return (
    <div className="relative w-full h-[500px] md:h-full glass-card rounded-lg overflow-hidden flex flex-col justify-between">
      {/* 3D Canvas rendering */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-bg-surface/20 to-bg-main/95">
        <Canvas camera={{ position: [0, 0.4, 2.1], fov: 45 }}>
          <ambientLight intensity={0.45} />
          <directionalLight position={[10, 10, 5]} intensity={1.3} />
          <directionalLight position={[-10, 10, -5]} intensity={0.5} />
          <pointLight position={[0, -5, 5]} intensity={0.4} />
          
          <Suspense fallback={null}>
            {useGltfModel ? (
              // Stands standing mannequin scaled by 4.2 and rotated to face forward
              <group scale={[4.2, 4.2, 4.2]} position={[0, -0.65, 0]} rotation={[0, -Math.PI / 2, 0]}>
                
                {/* 1. Translucent detailed skeleton bones */}
                <SkeletonBones />

                {/* 2. Arteries & Veins wraps */}
                <CirculatorySystem />

                {/* 3. Interactive glowing organ simulations inside */}
                {organsList.map((org) => {
                  const { color, score } = getOrganColorAndScore(org.name);
                  return (
                    <OrganMesh
                      key={org.name}
                      position={org.pos}
                      scale={org.scale}
                      color={color}
                      name={org.name}
                      score={score}
                      type={org.type}
                      onClick={() => setActiveSystem(org.name.toLowerCase())}
                    />
                  );
                })}

                {/* 4. Translucent holographic skin outlines */}
                <mesh position={[0, 0.02, 0]}>
                  <capsuleGeometry args={[0.13, 0.88, 8, 16]} />
                  <meshPhysicalMaterial
                    color="#06b6d4"
                    transparent
                    opacity={0.06}
                    roughness={0.25}
                    transmission={0.85}
                    thickness={0.8}
                    wireframe
                  />
                </mesh>
              </group>
            ) : (
              // Fallback simple capsule if file missing
              <group position={[0, -0.4, 0]}>
                <mesh>
                  <capsuleGeometry args={[0.2, 0.8, 8, 16]} />
                  <meshBasicMaterial color="#3b82f6" wireframe opacity={0.1} transparent />
                </mesh>
              </group>
            )}
          </Suspense>

          <OrbitControls enableZoom={true} minDistance={0.7} maxDistance={4.0} target={[0, 0.2, 0]} />
        </Canvas>
      </div>

      {/* Floating HUD controls overlays */}
      <div className="relative z-10 p-4 w-full flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1 text-[10px] font-mono text-text-muted bg-bg-surface/85 p-2.5 rounded border border-border-subtle/50 backdrop-blur-sm pointer-events-auto">
          <span className="font-bold text-text-primary uppercase tracking-wide">3D Anatomical Syncer HUD</span>
          <span>Graphic Mode: Translucent Skeleton</span>
          <span>Telemetry Step: {timelineYear} Year</span>
        </div>

        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {organsList.map((org) => {
            const { color, score } = getOrganColorAndScore(org.name);
            const active = activeSystem === org.name.toLowerCase();
            return (
              <button
                key={org.name}
                onClick={() => setActiveSystem(org.name.toLowerCase())}
                className={`text-xs px-2.5 py-1.5 rounded flex items-center justify-between gap-4 font-mono font-bold transition-all border ${active ? 'bg-primary-blue/10 border-primary-blue text-primary-blue shadow-sm' : 'bg-bg-surface/85 border-border-subtle text-text-muted hover:border-text-primary'}`}
              >
                <span>{org.name.toUpperCase()}</span>
                <span style={{ color }}>{score}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 p-4 text-center text-[10px] font-mono text-text-muted border-t border-border-subtle/40 bg-bg-surface/30">
        Drag to orbit body. Scroll to zoom. Click elements to inspect.
      </div>
    </div>
  );
};
