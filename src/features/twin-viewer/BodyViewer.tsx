import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useTwinStore } from '../../store/useTwinStore';

// Dynamic GLTF Loader component with parameter highlight overlays
interface GltfModelProps {
  url: string;
  activeSystem: string;
  getOrganColorAndScore: (name: string) => { color: string; score: number };
}

const GltfModel: React.FC<GltfModelProps> = ({ url, activeSystem, getOrganColorAndScore }) => {
  const { scene } = useGLTF(url);
  const clonedScene = scene.clone(); // Clone scene to prevent caching conflicts

  clonedScene.traverse((child: any) => {
    if (child.isMesh) {
      const name = child.name; // Expect meshes named Heart, Brain, Liver, Lungs, Kidneys
      const { color, score } = getOrganColorAndScore(name);
      
      const isActive = activeSystem === name.toLowerCase();
      
      child.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        emissive: new THREE.Color(color),
        emissiveIntensity: isActive ? 1.8 : 0.7,
        transparent: true,
        opacity: isActive ? 1.0 : 0.6,
        roughness: 0.2,
        metalness: 0.1
      });

      // Add a simple pulse factor in traverse mapping
      if (isActive) {
        const pulse = 1 + Math.sin(Date.now() * 0.003 * (score < 60 ? 3 : 1)) * 0.03;
        child.scale.set(pulse, pulse, pulse);
      }
    }
  });

  return <primitive object={clonedScene} />;
};

// Pulsing organ component inside the 3D canvas (Procedural)
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
  
  // Advanced breathing & heartbeat sinusoidal animations
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    if (type === 'heart') {
      // Pulse beats (Lub-Dub rhythm)
      const heartRate = score < 60 ? 3.0 : 1.2;
      const beat = Math.sin(time * Math.PI * 2 * heartRate);
      const pulse = 1 + (beat > 0.7 ? 0.08 : (beat < -0.7 ? -0.04 : 0));
      meshRef.current.scale.set(scale[0] * pulse, scale[1] * pulse, scale[2] * pulse);
    } else if (type === 'lungs') {
      // Slow rhythmic respiration (expand and contract)
      const breath = 1 + Math.sin(time * 1.5) * 0.06;
      meshRef.current.scale.set(scale[0] * breath, scale[1] * breath, scale[2] * (breath * 0.9));
    } else {
      // Default minor micro-pulsing to signify living state
      const micro = 1 + Math.sin(time * 0.8) * 0.015;
      meshRef.current.scale.set(scale[0] * micro, scale[1] * micro, scale[2] * micro);
    }
  });

  // Render organs using anatomically adjusted shapes
  const getGeometry = () => {
    switch (type) {
      case 'lungs':
        return <capsuleGeometry args={[0.07, 0.16, 8, 16]} />;
      case 'kidney':
        return <sphereGeometry args={[0.04, 16, 16]} />; // Ellipsoid bean
      case 'liver':
        return <coneGeometry args={[0.09, 0.14, 4]} />; // Wedge-like shape
      case 'brain':
        return <sphereGeometry args={[0.11, 32, 32]} />;
      default: // heart
        return <dodecahedronGeometry args={[0.06]} />;
    }
  };

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <mesh ref={meshRef}>
        {getGeometry()}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.3}
          roughness={0.1}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Visual glowing aura around active organ */}
      <mesh ref={secondaryMeshRef} scale={[1.2, 1.2, 1.2]}>
        {getGeometry()}
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>
    </group>
  );
};

// Realistic procedural internal skeleton and vascular structures
const ProceduralInternals: React.FC = () => {
  return (
    <group>
      {/* 1. Vertebrae Spine Column */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={`vert_${i}`} position={[0, 0.8 - i * 0.08, -0.06]} rotation={[0.05, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.022, 0.04, 8]} />
          <meshBasicMaterial color="#3b82f6" opacity={0.2} transparent wireframe />
        </mesh>
      ))}

      {/* 2. Skeletal Ribcage cage */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`rib_${i}`} position={[0, 0.72 - i * 0.08, 0]} rotation={[0.15, 0, 0]}>
          <torusGeometry args={[0.22 - i * 0.008, 0.007, 8, 24, Math.PI * 1.1]} />
          <meshBasicMaterial color="#3b82f6" opacity={0.12} transparent />
        </mesh>
      ))}

      {/* 3. Main Aorta Artery (Red) */}
      <mesh position={[-0.015, 0.22, -0.02]} rotation={[0, 0, -0.02]}>
        <cylinderGeometry args={[0.007, 0.007, 0.8, 8]} />
        <meshBasicMaterial color="#ef4444" opacity={0.25} transparent />
      </mesh>

      {/* 4. Main Vena Cava Vein (Blue) */}
      <mesh position={[0.015, 0.22, -0.02]} rotation={[0, 0, 0.02]}>
        <cylinderGeometry args={[0.007, 0.007, 0.8, 8]} />
        <meshBasicMaterial color="#3b82f6" opacity={0.25} transparent />
      </mesh>

      {/* 5. Translucent body container outline */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.24, 0.16, 0.9, 16]} />
        <meshBasicMaterial color="#22d3ee" wireframe opacity={0.05} transparent />
      </mesh>
    </group>
  );
};

export const BodyViewer: React.FC = () => {
  const { activeSystem, setActiveSystem, timelineYear, simulationResultsA } = useTwinStore();
  
  // State to track if GLTF file exists locally
  const [useGltfModel, setUseGltfModel] = useState(false);

  useEffect(() => {
    // Perform HEAD request to check if human_anatomy.glb exists in /public/models/
    fetch('/models/human_anatomy.glb', { method: 'HEAD' })
      .then((res) => {
        if (res.status === 200) {
          setUseGltfModel(true);
        }
      })
      .catch(() => {
        // Silent catch: fall back to procedural
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

  const organsList = [
    { name: 'Brain', pos: [0, 1.15, 0.01] as [number, number, number], scale: [1, 1, 1] as [number, number, number], type: 'brain' as const },
    { name: 'Heart', pos: [-0.04, 0.52, 0.05] as [number, number, number], scale: [1, 1, 1] as [number, number, number], type: 'heart' as const },
    { name: 'Lungs', pos: [0.08, 0.52, 0.03] as [number, number, number], scale: [0.85, 1, 0.85] as [number, number, number], type: 'lungs' as const },
    { name: 'Liver', pos: [0.06, 0.28, 0.04] as [number, number, number], scale: [1, 1, 1] as [number, number, number], type: 'liver' as const },
    { name: 'Kidneys', pos: [-0.07, 0.12, -0.06] as [number, number, number], scale: [1, 1.2, 0.8] as [number, number, number], type: 'kidney' as const }
  ];

  return (
    <div className="relative w-full h-[500px] md:h-full glass-card rounded-lg overflow-hidden flex flex-col justify-between">
      {/* 3D Canvas rendering */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-bg-surface/10 to-bg-main/90">
        <Canvas camera={{ position: [0, 0.4, 2.3], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <pointLight position={[-10, -10, -10]} intensity={0.6} />
          
          <Suspense fallback={null}>
            {useGltfModel ? (
              <GltfModel
                url="/models/human_anatomy.glb"
                activeSystem={activeSystem}
                getOrganColorAndScore={getOrganColorAndScore}
              />
            ) : (
              // Procedural anatomical skinless model
              <group>
                <ProceduralInternals />
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
              </group>
            )}
          </Suspense>

          <OrbitControls enableZoom={true} minDistance={0.8} maxDistance={4.5} />
        </Canvas>
      </div>

      {/* Floating HUD overlays */}
      <div className="relative z-10 p-4 w-full flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1 text-[10px] font-mono text-text-muted bg-bg-surface/80 p-2.5 rounded border border-border-subtle/50 backdrop-blur-sm pointer-events-auto">
          <span className="font-bold text-text-primary uppercase">3D Visual Syncer HUD</span>
          <span>Mesh Model: {useGltfModel ? 'GLB File' : 'Procedural Anatomy'}</span>
          <span>Timeline Step: {timelineYear} Year</span>
        </div>

        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {organsList.map((org) => {
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
        Drag to orbit body. Scroll to zoom. Click elements to inspect.
      </div>
    </div>
  );
};
