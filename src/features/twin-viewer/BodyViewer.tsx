import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useTwinStore } from '../../store/useTwinStore';

// Glassy Holographic Body Outline
const BodyHologram: React.FC = () => {
  const { scene } = useGLTF('/models/human_anatomy.glb');
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#22d3ee'),
          roughness: 0.15,
          metalness: 0.1,
          transparent: true,
          opacity: 0.035, // Translucent grid outline
          wireframe: true,
          side: THREE.DoubleSide
        });
      }
    });
    return clone;
  }, [scene]);

  return <primitive object={clonedScene} />;
};

// Configurable Organ Loader mapping NIH glb models with auto-centering
interface OrganModelProps {
  url: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  color: string;
  score: number;
  active: boolean;
  devMode: boolean;
  transformMode: 'translate' | 'scale' | 'rotate';
  onUpdate: (pos: [number, number, number], scale: [number, number, number], rot: [number, number, number]) => void;
  type: string;
  mirrorZ?: boolean;
}

const OrganModel: React.FC<OrganModelProps> = ({
  url,
  position,
  scale,
  rotation,
  color,
  score,
  active,
  devMode,
  transformMode,
  onUpdate,
  type,
  mirrorZ = false
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const controlRef = useRef<any>(null);
  
  const { scene } = useGLTF(url);

  // Auto-center and normalize size to 1.0 unit on load
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // 1. Compute bounding box
    const box = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    // 2. Scale model so the largest dimension is exactly 1.0 unit
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1.0;
    const scaleFactor = 1.0 / maxDim;
    clone.scale.setScalar(scaleFactor);

    // 3. Center model meshes at local [0, 0, 0] taking scale into account
    clone.position.copy(center).multiplyScalar(-scaleFactor);

    // Apply mirror scaling if required
    if (mirrorZ) {
      clone.scale.z *= -1;
    }
    
    // 4. Set dynamic emissive health ranges
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          emissive: new THREE.Color(color),
          emissiveIntensity: active ? 1.5 : 0.5,
          roughness: 0.2,
          metalness: 0.1,
          transparent: true,
          opacity: active ? 0.95 : 0.6
        });
      }
    });

    const pivot = new THREE.Group();
    pivot.add(clone);
    return pivot;
  }, [scene, color, active, mirrorZ]);

  // Breathing or heartbeat animation (Bypassed during dev transformations)
  useFrame((state) => {
    if (!groupRef.current || devMode) return;
    const time = state.clock.getElapsedTime();
    
    if (type === 'heart') {
      const heartRate = score < 60 ? 3.0 : 1.25;
      const beat = Math.sin(time * Math.PI * 2 * heartRate);
      const pulse = 1 + (beat > 0.75 ? 0.05 : (beat < -0.75 ? -0.035 : 0));
      groupRef.current.scale.set(scale[0] * pulse, scale[1] * pulse, scale[2] * pulse);
    } else if (type.includes('lung')) {
      const breath = 1 + Math.sin(time * 1.4) * 0.04;
      groupRef.current.scale.set(scale[0] * breath, scale[1] * breath, scale[2] * (breath * 0.85));
    } else {
      const micro = 1 + Math.sin(time * 0.7) * 0.01;
      groupRef.current.scale.set(scale[0] * micro, scale[1] * micro, scale[2] * micro);
    }
  });

  // Track coordinates changes
  useEffect(() => {
    if (devMode && active && controlRef.current && groupRef.current) {
      const controls = controlRef.current;
      const handleTransform = () => {
        if (groupRef.current) {
          const pos = groupRef.current.position;
          const scl = groupRef.current.scale;
          const rot = groupRef.current.rotation;
          onUpdate(
            [pos.x, pos.y, pos.z],
            [scl.x, scl.y, scl.z],
            [rot.x, rot.y, rot.z]
          );
        }
      };
      controls.addEventListener('objectChange', handleTransform);
      return () => controls.removeEventListener('objectChange', handleTransform);
    }
  }, [devMode, active, transformMode]);

  return (
    <group>
      <group
        ref={groupRef}
        position={position}
        scale={scale}
        rotation={rotation}
      >
        <primitive object={clonedScene} />
      </group>
      
      {active && devMode && (
        <TransformControls
          ref={controlRef}
          object={groupRef as any}
          mode={transformMode}
        />
      )}
    </group>
  );
};

// Main Arterial Network overlays
const CirculatorySystem: React.FC = () => {
  return (
    <group>
      <mesh position={[0.005, 0.18, -0.006]}>
        <cylinderGeometry args={[0.002, 0.002, 0.28, 8]} />
        <meshBasicMaterial color="#ef4444" opacity={0.25} transparent />
      </mesh>
      <mesh position={[-0.005, 0.18, -0.006]}>
        <cylinderGeometry args={[0.002, 0.002, 0.28, 8]} />
        <meshBasicMaterial color="#3b82f6" opacity={0.25} transparent />
      </mesh>
    </group>
  );
};

export const BodyViewer: React.FC = () => {
  const { activeSystem, setActiveSystem, timelineYear, simulationResultsA } = useTwinStore();
  
  const [useGltfModel, setUseGltfModel] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [transformMode, setTransformMode] = useState<'translate' | 'scale' | 'rotate'>('translate');

  // Interactive normalized configs. Initialized with realistic ratios inside the scaled standing skeleton:
  const [organConfigs, setOrganConfigs] = useState<Record<string, { pos: [number, number, number]; scale: [number, number, number]; rot: [number, number, number] }>>({
    brain: { pos: [0.0, 0.465, 0.0], scale: [0.08, 0.08, 0.08], rot: [0, Math.PI / 2, 0] },
    heart: { pos: [0.02, 0.22, -0.015], scale: [0.065, 0.065, 0.065], rot: [0, Math.PI / 2, 0] },
    lungs: { pos: [0.0, 0.22, 0.0], scale: [0.11, 0.11, 0.11], rot: [0, Math.PI / 2, 0] },
    liver: { pos: [0.01, 0.12, 0.02], scale: [0.085, 0.085, 0.085], rot: [0, Math.PI / 2, 0] },
    kidney_l: { pos: [-0.02, 0.08, -0.025], scale: [0.045, 0.045, 0.045], rot: [0, Math.PI / 2, 0] },
    kidney_r: { pos: [-0.02, 0.08, 0.025], scale: [0.045, 0.045, 0.045], rot: [0, -Math.PI / 2, 0] }
  });

  useEffect(() => {
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

  const handleConfigUpdate = (key: string, pos: [number, number, number], scale: [number, number, number], rot: [number, number, number]) => {
    setOrganConfigs((prev) => ({
      ...prev,
      [key]: { pos, scale, rot }
    }));
  };

  const organsHUD = [
    { name: 'Brain' },
    { name: 'Heart' },
    { name: 'Lungs' },
    { name: 'Liver' },
    { name: 'Kidneys' }
  ];

  const getActiveDevCoords = () => {
    const key = activeSystem === 'lungs' ? 'lungs' : (activeSystem === 'kidneys' ? 'kidney_l' : activeSystem);
    const config = organConfigs[key];
    if (!config) return null;
    return {
      pos: config.pos.map((v) => v.toFixed(4)),
      scl: config.scale.map((v) => v.toFixed(4)),
      rot: config.rot.map((v) => v.toFixed(4))
    };
  };

  const devCoords = getActiveDevCoords();

  return (
    <div className="relative w-full h-[500px] md:h-full glass-card rounded-lg overflow-hidden flex flex-col justify-between">
      {/* 3D Canvas rendering */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-bg-surface/20 to-bg-main/95">
        <Canvas camera={{ position: [0, 0.2, 2.7], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.3} />
          <directionalLight position={[-10, 10, -5]} intensity={0.5} />
          <pointLight position={[0, -5, 5]} intensity={0.4} />
          
          <Suspense fallback={null}>
            {useGltfModel ? (
              <group scale={[3.0, 3.0, 3.0]} position={[0, -0.85, 0]} rotation={[0, -Math.PI / 2, 0]}>
                
                {/* 1. Transparent Body Hologram Grid */}
                <BodyHologram />

                {/* 2. Circulatory lines */}
                <CirculatorySystem />

                {/* 3. Auto-Centered and Normalized NIH Organ Models */}
                <OrganModel
                  url="/models/organ_brain.glb"
                  position={organConfigs.brain.pos}
                  scale={organConfigs.brain.scale}
                  rotation={organConfigs.brain.rot}
                  color={getOrganColorAndScore('Brain').color}
                  score={getOrganColorAndScore('Brain').score}
                  active={activeSystem === 'brain'}
                  devMode={devMode}
                  transformMode={transformMode}
                  onUpdate={(pos, scale, rot) => handleConfigUpdate('brain', pos, scale, rot)}
                  type="brain"
                />

                <OrganModel
                  url="/models/organ_heart.glb"
                  position={organConfigs.heart.pos}
                  scale={organConfigs.heart.scale}
                  rotation={organConfigs.heart.rot}
                  color={getOrganColorAndScore('Heart').color}
                  score={getOrganColorAndScore('Heart').score}
                  active={activeSystem === 'heart'}
                  devMode={devMode}
                  transformMode={transformMode}
                  onUpdate={(pos, scale, rot) => handleConfigUpdate('heart', pos, scale, rot)}
                  type="heart"
                />

                <OrganModel
                  url="/models/organ_lung.glb"
                  position={organConfigs.lungs.pos}
                  scale={organConfigs.lungs.scale}
                  rotation={organConfigs.lungs.rot}
                  color={getOrganColorAndScore('Lungs').color}
                  score={getOrganColorAndScore('Lungs').score}
                  active={activeSystem === 'lungs'}
                  devMode={devMode}
                  transformMode={transformMode}
                  onUpdate={(pos, scale, rot) => handleConfigUpdate('lungs', pos, scale, rot)}
                  type="lungs"
                />

                <OrganModel
                  url="/models/organ_liver.glb"
                  position={organConfigs.liver.pos}
                  scale={organConfigs.liver.scale}
                  rotation={organConfigs.liver.rot}
                  color={getOrganColorAndScore('Liver').color}
                  score={getOrganColorAndScore('Liver').score}
                  active={activeSystem === 'liver'}
                  devMode={devMode}
                  transformMode={transformMode}
                  onUpdate={(pos, scale, rot) => handleConfigUpdate('liver', pos, scale, rot)}
                  type="liver"
                />

                {/* Left Kidney */}
                <OrganModel
                  url="/models/organ_kidney.glb"
                  position={organConfigs.kidney_l.pos}
                  scale={organConfigs.kidney_l.scale}
                  rotation={organConfigs.kidney_l.rot}
                  color={getOrganColorAndScore('Kidneys').color}
                  score={getOrganColorAndScore('Kidneys').score}
                  active={activeSystem === 'kidneys'}
                  devMode={devMode}
                  transformMode={transformMode}
                  onUpdate={(pos, scale, rot) => handleConfigUpdate('kidney_l', pos, scale, rot)}
                  type="kidney"
                />

                {/* Right Kidney (Mirrored on Z-axis since Z is Left/Right) */}
                <OrganModel
                  url="/models/organ_kidney.glb"
                  position={organConfigs.kidney_r.pos}
                  scale={organConfigs.kidney_r.scale}
                  rotation={organConfigs.kidney_r.rot}
                  color={getOrganColorAndScore('Kidneys').color}
                  score={getOrganColorAndScore('Kidneys').score}
                  active={activeSystem === 'kidneys'}
                  devMode={devMode}
                  transformMode={transformMode}
                  onUpdate={(pos, scale, rot) => handleConfigUpdate('kidney_r', pos, scale, rot)}
                  type="kidney"
                  mirrorZ
                />

                {/* Glassy capsule outer shell */}
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

          {/* orbit camera setup supporting wide zooming out, disabled if active dragging is in place */}
          <OrbitControls enableZoom={!devMode} minDistance={0.5} maxDistance={8.0} target={[0, 0.05, 0]} />
        </Canvas>
      </div>

      {/* Floating HUD controls overlays */}
      <div className="relative z-10 p-4 w-full flex flex-col md:flex-row justify-between items-start pointer-events-none gap-4">
        
        {/* Left Side Info Panel + Dev Panel */}
        <div className="flex flex-col gap-2.5 pointer-events-auto max-w-xs">
          <div className="flex flex-col gap-1 text-[10px] font-mono text-text-muted bg-bg-surface/85 p-2.5 rounded border border-border-subtle/50 backdrop-blur-sm shadow-md">
            <span className="font-bold text-text-primary uppercase tracking-wide">3D Anatomical Syncer HUD</span>
            <span>Graphic Mode: Glass Hologram</span>
            <span>Telemetry Step: {timelineYear} Year</span>
          </div>

          {/* Dev Coordinate Positioner Panel */}
          <div className="flex flex-col gap-2 text-[10px] font-mono text-text-muted bg-bg-surface/90 p-3 rounded border border-accent-cyan/40 backdrop-blur-sm shadow-md">
            <div className="flex items-center justify-between border-b border-border-subtle pb-1">
              <span className="font-bold text-accent-cyan uppercase">Dev Position Editor</span>
              <button
                onClick={() => setDevMode(!devMode)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${devMode ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan' : 'bg-bg-main text-text-muted border border-border-subtle'}`}
              >
                {devMode ? 'DEV MODE: ON' : 'DEV MODE: OFF'}
              </button>
            </div>

            {devMode && devCoords && (
              <div className="flex flex-col gap-1.5 text-[9px]">
                <span className="text-text-primary uppercase font-bold">Selected: {activeSystem?.toUpperCase()}</span>
                <div>Pos: <span className="text-text-primary font-bold">[{devCoords.pos.join(', ')}]</span></div>
                <div>Scale: <span className="text-text-primary font-bold">[{devCoords.scl.join(', ')}]</span></div>
                <div>Rot: <span className="text-text-primary font-bold">[{devCoords.rot.join(', ')}]</span></div>
                
                {/* Transform Mode selection toggles */}
                <div className="flex gap-1.5 mt-1 border-t border-border-subtle/40 pt-1.5">
                  <button
                    onClick={() => setTransformMode('translate')}
                    className={`px-1 py-0.5 rounded text-[8px] font-bold ${transformMode === 'translate' ? 'bg-primary-blue text-white' : 'bg-bg-main text-text-muted border border-border-subtle'}`}
                  >
                    TRANS
                  </button>
                  <button
                    onClick={() => setTransformMode('scale')}
                    className={`px-1 py-0.5 rounded text-[8px] font-bold ${transformMode === 'scale' ? 'bg-primary-blue text-white' : 'bg-bg-main text-text-muted border border-border-subtle'}`}
                  >
                    SCALE
                  </button>
                  <button
                    onClick={() => setTransformMode('rotate')}
                    className={`px-1 py-0.5 rounded text-[8px] font-bold ${transformMode === 'rotate' ? 'bg-primary-blue text-white' : 'bg-bg-main text-text-muted border border-border-subtle'}`}
                  >
                    ROTATE
                  </button>
                </div>
              </div>
            )}
            {!devMode && (
              <span className="text-[9px] text-text-muted/65 italic leading-snug">Toggle ON to visually drag, rotate, and scale organs inside the canvas.</span>
            )}
          </div>
        </div>

        {/* Right Side checklist */}
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
        {devMode ? 'Dev Mode Active: Drag Gizmo handles to move organs. Switch mode to Translate/Scale/Rotate.' : 'Pinch / Scroll to zoom. Drag to orbit body. Click elements to inspect.'}
      </div>
    </div>
  );
};
