import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useTwinStore } from '../../store/useTwinStore';

// Glassy Holographic Body Outline (Obscuring gender details)
const BodyHologram: React.FC = () => {
  const { scene } = useGLTF('/models/human_anatomy.glb');
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // High-end cyan digital grid wireframe to obscure gender features and focus on organs
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#22d3ee'),
          roughness: 0.1,
          metalness: 0.1,
          transparent: true,
          opacity: 0.03, // Extremely faint skin outline
          wireframe: true,
          side: THREE.DoubleSide
        });
      }
    });
    return clone;
  }, [scene]);

  return <primitive object={clonedScene} />;
};

// Pulsing organ component inside the hologram group (Realistic Shapes)
interface OrganMeshProps {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  name: string;
  score: number;
  onClick: () => void;
  type: 'heart' | 'lungs' | 'left-lung' | 'right-lung' | 'kidney' | 'brain' | 'liver';
}

const OrganMesh: React.FC<OrganMeshProps> = ({ position, scale, color, onClick, score, type }) => {
  const meshRef = useRef<THREE.Group>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    if (type === 'heart') {
      const heartRate = score < 60 ? 3.2 : 1.25;
      const beat = Math.sin(time * Math.PI * 2 * heartRate);
      const pulse = 1 + (beat > 0.75 ? 0.08 : (beat < -0.75 ? -0.04 : 0));
      meshRef.current.scale.set(scale[0] * pulse, scale[1] * pulse, scale[2] * pulse);
    } else if (type === 'left-lung' || type === 'right-lung') {
      const breath = 1 + Math.sin(time * 1.4) * 0.05;
      meshRef.current.scale.set(scale[0] * breath, scale[1] * breath, scale[2] * (breath * 0.9));
    } else {
      const micro = 1 + Math.sin(time * 0.7) * 0.015;
      meshRef.current.scale.set(scale[0] * micro, scale[1] * micro, scale[2] * micro);
    }
  });

  return (
    <group ref={meshRef} position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Brain Folds (Torus Knot) */}
      {type === 'brain' && (
        <mesh ref={coreMeshRef}>
          <torusKnotGeometry args={[0.018, 0.007, 48, 8, 3, 4]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.3}
            roughness={0.15}
            metalness={0.1}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}

      {/* Heart Core with Aortic Loop */}
      {type === 'heart' && (
        <group>
          {/* Main Heart Muscle */}
          <mesh ref={coreMeshRef}>
            <dodecahedronGeometry args={[0.016]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.4}
              roughness={0.2}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Aorta Arch */}
          <mesh position={[0.004, 0.012, 0]} rotation={[0, 0, -0.4]}>
            <torusGeometry args={[0.008, 0.003, 8, 16, Math.PI * 1.2]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
          </mesh>
        </group>
      )}

      {/* Left Lung Lobe */}
      {type === 'left-lung' && (
        <mesh ref={coreMeshRef} rotation={[0.05, 0, -0.05]}>
          <capsuleGeometry args={[0.014, 0.038, 8, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            roughness={0.3}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* Right Lung Lobe */}
      {type === 'right-lung' && (
        <mesh ref={coreMeshRef} rotation={[-0.05, 0, 0.05]}>
          <capsuleGeometry args={[0.014, 0.038, 8, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            roughness={0.3}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* Kidney Bean Shape */}
      {type === 'kidney' && (
        <mesh ref={coreMeshRef} rotation={[0.2, 0.1, 0.1]}>
          <sphereGeometry args={[0.009, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            roughness={0.2}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}

      {/* Liver Wedge shape */}
      {type === 'liver' && (
        <mesh ref={coreMeshRef} rotation={[0, 0, -0.2]}>
          <coneGeometry args={[0.024, 0.038, 4]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            roughness={0.3}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* Glowing aura */}
      <mesh scale={[1.25, 1.25, 1.25]}>
        {type === 'brain' && <torusKnotGeometry args={[0.018, 0.007, 48, 8, 3, 4]} />}
        {type === 'heart' && <dodecahedronGeometry args={[0.016]} />}
        {(type === 'left-lung' || type === 'right-lung') && <capsuleGeometry args={[0.014, 0.038, 8, 12]} />}
        {type === 'kidney' && <sphereGeometry args={[0.009, 16, 16]} />}
        {type === 'liver' && <coneGeometry args={[0.024, 0.038, 4]} />}
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
      <mesh position={[0.005, 0.18, -0.006]}>
        <cylinderGeometry args={[0.002, 0.002, 0.28, 8]} />
        <meshBasicMaterial color="#ef4444" opacity={0.25} transparent />
      </mesh>
      
      {/* Vena Cava Trunk (Blue) */}
      <mesh position={[-0.005, 0.18, -0.006]}>
        <cylinderGeometry args={[0.002, 0.002, 0.28, 8]} />
        <meshBasicMaterial color="#3b82f6" opacity={0.25} transparent />
      </mesh>

      {/* Arm arterial lines */}
      <mesh position={[0.02, 0.26, -0.05]} rotation={[0, 0, 0.45]}>
        <cylinderGeometry args={[0.001, 0.001, 0.12, 8]} />
        <meshBasicMaterial color="#ef4444" opacity={0.2} transparent />
      </mesh>
      <mesh position={[-0.02, 0.26, 0.05]} rotation={[0, 0, -0.45]}>
        <cylinderGeometry args={[0.001, 0.001, 0.12, 8]} />
        <meshBasicMaterial color="#3b82f6" opacity={0.2} transparent />
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
    { name: 'Brain', pos: [0, 0.53, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number], type: 'brain' as const },
    { name: 'Heart', pos: [0.02, 0.34, -0.015] as [number, number, number], scale: [1, 1, 1] as [number, number, number], type: 'heart' as const },
    { name: 'Lungs', pos: [0.01, 0.34, -0.04] as [number, number, number], scale: [1, 1, 1] as [number, number, number], type: 'left-lung' as const },
    { name: 'Lungs', pos: [0.01, 0.34, 0.04] as [number, number, number], scale: [1, 1, 1] as [number, number, number], type: 'right-lung' as const },
    { name: 'Liver', pos: [0.02, 0.16, 0.038] as [number, number, number], scale: [1.2, 0.8, 1.2] as [number, number, number], type: 'liver' as const },
    { name: 'Kidneys', pos: [-0.03, 0.08, -0.026] as [number, number, number], scale: [0.6, 1.0, 0.6] as [number, number, number], type: 'kidney' as const },
    { name: 'Kidneys', pos: [-0.03, 0.08, 0.026] as [number, number, number], scale: [0.6, 1.0, 0.6] as [number, number, number], type: 'kidney' as const }
  ];

  const organsHUD = [
    { name: 'Brain' },
    { name: 'Heart' },
    { name: 'Lungs' },
    { name: 'Liver' },
    { name: 'Kidneys' }
  ];

  return (
    <div className="relative w-full h-[500px] md:h-full glass-card rounded-lg overflow-hidden flex flex-col justify-between">
      {/* 3D Canvas rendering */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-bg-surface/20 to-bg-main/95">
        <Canvas camera={{ position: [0, 0.2, 2.7], fov: 45 }}>
          <ambientLight intensity={0.45} />
          <directionalLight position={[10, 10, 5]} intensity={1.3} />
          <directionalLight position={[-10, 10, -5]} intensity={0.5} />
          <pointLight position={[0, -5, 5]} intensity={0.4} />
          
          <Suspense fallback={null}>
            {useGltfModel ? (
              // Model scaled to 3.0 (pinch-to-minimize UX correction) and shifted to fit frame perfectly
              <group scale={[3.0, 3.0, 3.0]} position={[0, -0.85, 0]} rotation={[0, -Math.PI / 2, 0]}>
                
                {/* 1. Transparent Body Hologram Grid */}
                <BodyHologram />

                {/* 2. Vascular lines */}
                <CirculatorySystem />

                {/* 3. High-fidelity positioned organs */}
                {organsList.map((org, index) => {
                  const { color, score } = getOrganColorAndScore(org.name);
                  return (
                    <OrganMesh
                      key={`${org.name}_${index}`}
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

          {/* orbit camera setup supporting wide zooming out (minimize) */}
          <OrbitControls enableZoom={true} minDistance={0.5} maxDistance={8.0} target={[0, 0.05, 0]} />
        </Canvas>
      </div>

      {/* Floating HUD controls overlays */}
      <div className="relative z-10 p-4 w-full flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1 text-[10px] font-mono text-text-muted bg-bg-surface/85 p-2.5 rounded border border-border-subtle/50 backdrop-blur-sm pointer-events-auto">
          <span className="font-bold text-text-primary uppercase tracking-wide">3D Anatomical Syncer HUD</span>
          <span>Graphic Mode: Glass Hologram</span>
          <span>Telemetry Step: {timelineYear} Year</span>
        </div>

        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {organsHUD.map((org) => {
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
        Pinch / Scroll to zoom (minimize/maximize). Drag to orbit. Click organs to inspect.
      </div>
    </div>
  );
};
