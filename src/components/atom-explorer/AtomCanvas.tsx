import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { type ElementData } from '../../data/elements';
import { type IsotopeData } from '../../data/isotopes';

export type VisualMode = 'bohr' | 'orbitals';
export type OrbitalType = 'all' | 's' | 'p' | 'd' | 'f';

interface AtomCanvasProps {
  element: ElementData;
  isotope: IsotopeData;
  activeShellIndex: number | null; // 0 for K, 1 for L, etc.
  onSelectShell: (shellIdx: number | null) => void;
  visualMode: VisualMode;
  onToggleVisualMode: (mode: VisualMode) => void;
  selectedOrbital: OrbitalType;
  onSelectOrbital: (orbital: OrbitalType) => void;
  containerClassName?: string;
}

export const AtomCanvas: React.FC<AtomCanvasProps> = ({
  element,
  isotope,
  activeShellIndex,
  onSelectShell: _onSelectShell,
  visualMode,
  onToggleVisualMode,
  selectedOrbital,
  onSelectOrbital,
  containerClassName = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const atomGroupRef = useRef<THREE.Group | null>(null);
  const orbitalGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Animation and interactivity state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [animSpeed, setAnimSpeed] = useState<number>(1.0);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const animSpeedRef = useRef(animSpeed);
  animSpeedRef.current = animSpeed;
  const [showElectrons, setShowElectrons] = useState<boolean>(true);
  const [showShellRings, setShowShellRings] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);

  // References for dragging/rotating
  const isDraggingRef = useRef<boolean>(false);
  const previousPointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const angularVelocity = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraDistance = useRef<number>(16);

  // State for electron angle tracking across frames
  const electronStateRef = useRef<Array<{ shellIdx: number; angle: number; speed: number; mesh: THREE.Mesh }>>([]);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebGlSupported(false);
    } catch {
      setWebGlSupported(false);
    }
  }, []);

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    if (atomGroupRef.current) {
      atomGroupRef.current.rotation.set(0.3, 0.4, 0);
      angularVelocity.current = { x: 0, y: 0 };
    }
    if (cameraRef.current) {
      cameraDistance.current = 16;
      cameraRef.current.position.set(0, 0, 16);
      cameraRef.current.lookAt(0, 0, 0);
    }
  }, []);

  // Zoom In / Out
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const delta = direction === 'in' ? -2.5 : 2.5;
    cameraDistance.current = Math.min(32, Math.max(7, cameraDistance.current + delta));
    cameraRef.current.position.set(0, 0, cameraDistance.current);
  }, []);

  // Toggle Fullscreen on container
  const handleToggleFullscreen = () => {
    if (!mountRef.current?.parentElement) return;
    if (!document.fullscreenElement) {
      mountRef.current.parentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Build Nucleus Cluster (Protons & Neutrons)
  const buildNucleusCluster = useCallback(
    (group: THREE.Group, protons: number, neutrons: number) => {
      // Clear previous nucleus
      const existingNucleus = group.getObjectByName('nucleusCluster');
      if (existingNucleus) group.remove(existingNucleus);

      const nucleusGroup = new THREE.Group();
      nucleusGroup.name = 'nucleusCluster';

      // Shared nucleon geometries and materials
      const nucleonRadius = 0.22;
      const protonGeo = new THREE.SphereGeometry(nucleonRadius, 16, 16);
      const neutronGeo = new THREE.SphereGeometry(nucleonRadius, 16, 16);

      const protonMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e, // Vibrant Red/Rose
        emissive: 0xe11d48,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.2,
      });

      const neutronMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8, // Vibrant Cyan/Sky
        emissive: 0x0284c7,
        emissiveIntensity: 0.35,
        roughness: 0.35,
        metalness: 0.2,
      });

      const totalParticles = protons + neutrons;
      // Cap visual particles rendered in 3D to 64 for optimal 60 FPS while keeping realistic packing density
      const displayCount = Math.min(64, totalParticles);
      const protonRatio = totalParticles > 0 ? protons / totalParticles : 0.5;

      // Pack nucleons using spherical phyllotaxis / golden spiral
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      const packingRadius = Math.max(0.45, Math.pow(displayCount, 1 / 3) * 0.35);

      for (let i = 0; i < displayCount; i++) {
        const isProton = Math.random() < protonRatio;
        const mesh = new THREE.Mesh(isProton ? protonGeo : neutronGeo, isProton ? protonMat : neutronMat);

        // Fibonacci sphere distribution
        const theta = (2 * Math.PI * i) / goldenRatio;
        const phi = Math.acos(1 - (2 * (i + 0.5)) / displayCount);
        const r = packingRadius * (0.4 + 0.6 * Math.cbrt(i / displayCount));

        mesh.position.set(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        );

        nucleusGroup.add(mesh);
      }

      // Add central energy core glow
      const coreLight = new THREE.PointLight(0x06b6d4, 1.2, 5);
      nucleusGroup.add(coreLight);

      // Core pulsating halo mesh
      const haloGeo = new THREE.SphereGeometry(packingRadius * 1.15, 24, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.18,
        wireframe: true,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.name = 'nucleusHalo';
      nucleusGroup.add(haloMesh);

      group.add(nucleusGroup);
    },
    []
  );

  // Build Bohr Electron Shells & Orbiting Electrons
  const buildBohrShells = useCallback(
    (group: THREE.Group, shells: number[], activeIdx: number | null, showShells: boolean, showElec: boolean) => {
      // Clear previous shells
      const existingShells = group.getObjectByName('shellsGroup');
      if (existingShells) group.remove(existingShells);

      electronStateRef.current = [];

      const shellsGroup = new THREE.Group();
      shellsGroup.name = 'shellsGroup';

      const electronGeo = new THREE.SphereGeometry(0.12, 14, 14);
      const electronMat = new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });

      const activeElectronMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15, // Golden active glow
        emissive: 0xeab308,
        emissiveIntensity: 1.0,
        roughness: 0.1,
      });

      shells.forEach((electronCount, sIdx) => {
        const n = sIdx + 1; // 1=K, 2=L, etc.
        const radius = 1.6 + n * 1.15;
        const isShellActive = activeIdx === sIdx;

        // Subtle 3D inclination angle for each shell to give volumetric gyroscope look
        const inclination = ((sIdx * 28) % 75) * (Math.PI / 180);
        const precession = (sIdx * 45) * (Math.PI / 180);

        const shellRingGroup = new THREE.Group();
        shellRingGroup.rotation.x = inclination;
        shellRingGroup.rotation.y = precession;

        // 1. Shell Orbital Ring
        if (showShells) {
          const ringGeo = new THREE.RingGeometry(radius - 0.02, radius + 0.02, 64);
          const ringMat = new THREE.MeshBasicMaterial({
            color: isShellActive ? 0x22d3ee : 0x475569,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: isShellActive ? 0.75 : 0.28,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          shellRingGroup.add(ringMesh);
        }

        // 2. Electrons on this shell
        if (showElec) {
          // Speed decreases with shell distance (Bohr/Kepler rule)
          const baseSpeed = (1.8 / Math.sqrt(n)) * 0.015;

          for (let e = 0; e < electronCount; e++) {
            const initialAngle = (2 * Math.PI * e) / electronCount;
            const elecMesh = new THREE.Mesh(electronGeo, isShellActive ? activeElectronMat : electronMat);

            elecMesh.position.set(radius * Math.cos(initialAngle), radius * Math.sin(initialAngle), 0);

            shellRingGroup.add(elecMesh);

            electronStateRef.current.push({
              shellIdx: sIdx,
              angle: initialAngle,
              speed: baseSpeed,
              mesh: elecMesh,
            });
          }
        }

        shellsGroup.add(shellRingGroup);
      });

      group.add(shellsGroup);
    },
    []
  );

  // Build 3D Quantum Orbitals (s, p, d, f)
  const buildQuantumOrbitals = useCallback((group: THREE.Group, orbitalType: OrbitalType) => {
    const existing = group.getObjectByName('quantumOrbitals');
    if (existing) group.remove(existing);

    const qGroup = new THREE.Group();
    qGroup.name = 'quantumOrbitals';

    // 1. s Orbital (Spherical symmetric cloud)
    if (orbitalType === 'all' || orbitalType === 's') {
      const sGeo = new THREE.SphereGeometry(2.4, 32, 32);
      const sMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.35,
        wireframe: false,
        roughness: 0.2,
      });
      const sMesh = new THREE.Mesh(sGeo, sMat);
      qGroup.add(sMesh);

      // Wireframe guide
      const sWireGeo = new THREE.SphereGeometry(2.42, 16, 16);
      const sWireMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
      });
      qGroup.add(new THREE.Mesh(sWireGeo, sWireMat));
    }

    // 2. p Orbitals (Dumbbell lobes along X, Y, Z axes)
    if (orbitalType === 'all' || orbitalType === 'p') {
      const pColorPos = 0x8b5cf6; // Purple (positive phase)
      const pColorNeg = 0x06b6d4; // Cyan (negative phase)

      const createLobe = (dir: THREE.Vector3, color: number) => {
        // Parametric droplet / dumbbell lobe
        const lobeGeo = new THREE.ConeGeometry(1.2, 2.6, 24);
        const lobeMat = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.35,
          transparent: true,
          opacity: 0.42,
          roughness: 0.3,
        });
        const lobeMesh = new THREE.Mesh(lobeGeo, lobeMat);
        lobeMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        lobeMesh.position.copy(dir.clone().multiplyScalar(1.4));
        return lobeMesh;
      };

      // px
      qGroup.add(createLobe(new THREE.Vector3(1, 0, 0), pColorPos));
      qGroup.add(createLobe(new THREE.Vector3(-1, 0, 0), pColorNeg));

      // py
      qGroup.add(createLobe(new THREE.Vector3(0, 1, 0), pColorPos));
      qGroup.add(createLobe(new THREE.Vector3(0, -1, 0), pColorNeg));

      // pz
      qGroup.add(createLobe(new THREE.Vector3(0, 0, 1), pColorPos));
      qGroup.add(createLobe(new THREE.Vector3(0, 0, -1), pColorNeg));
    }

    // 3. d Orbitals (Cloverleaf 4-lobed structures & donut collar)
    if (orbitalType === 'all' || orbitalType === 'd') {
      const dColor = 0x10b981; // Emerald green
      const dGroup = new THREE.Group();

      // Donut torus for dz^2
      const torusGeo = new THREE.TorusGeometry(1.8, 0.4, 16, 40);
      const torusMat = new THREE.MeshStandardMaterial({
        color: dColor,
        emissive: 0x059669,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.4,
      });
      const torusMesh = new THREE.Mesh(torusGeo, torusMat);
      torusMesh.rotation.x = Math.PI / 2;
      dGroup.add(torusMesh);

      qGroup.add(dGroup);
    }

    // 4. f Orbitals (Multi-lobed complex geometry)
    if (orbitalType === 'all' || orbitalType === 'f') {
      const fColor = 0xf59e0b; // Amber
      const fGeo = new THREE.IcosahedronGeometry(3.6, 1);
      const fMat = new THREE.MeshStandardMaterial({
        color: fColor,
        emissive: 0xd97706,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.3,
        wireframe: true,
      });
      qGroup.add(new THREE.Mesh(fGeo, fMat));
    }

    group.add(qGroup);
  }, []);

  // Initialize Three.js Scene, Camera, Lights, and Renderer
  useEffect(() => {
    if (!mountRef.current || !webGlSupported) return;

    const width = mountRef.current.clientWidth || 600;
    const height = mountRef.current.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, cameraDistance.current);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    mountRef.current.replaceChildren(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const cyanLight = new THREE.DirectionalLight(0x22d3ee, 2.2);
    cyanLight.position.set(8, 12, 10);
    scene.add(cyanLight);

    const purpleLight = new THREE.DirectionalLight(0xa855f7, 1.8);
    purpleLight.position.set(-8, -10, -6);
    scene.add(purpleLight);

    // 5. Master Atom Group
    const atomGroup = new THREE.Group();
    atomGroup.rotation.set(0.3, 0.4, 0);
    atomGroupRef.current = atomGroup;
    scene.add(atomGroup);

    // 6. Quantum Orbital Group
    const orbitalGroup = new THREE.Group();
    orbitalGroupRef.current = orbitalGroup;
    scene.add(orbitalGroup);

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let lastTime = performance.now();
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      const currentTime = performance.now();
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Inertial rotation when not dragging
      if (!isDraggingRef.current && atomGroupRef.current) {
        atomGroupRef.current.rotation.y += angularVelocity.current.y;
        atomGroupRef.current.rotation.x += angularVelocity.current.x;

        // Apply friction
        angularVelocity.current.x *= 0.94;
        angularVelocity.current.y *= 0.94;

        // Gentle ambient rotation
        if (isPlayingRef.current) {
          atomGroupRef.current.rotation.y += 0.002 * animSpeedRef.current;
        }
      }

      // Rotate Quantum Orbitals Group as well
      if (orbitalGroupRef.current && isPlayingRef.current) {
        orbitalGroupRef.current.rotation.y += 0.003 * animSpeedRef.current;
      }

      // Update electron orbits
      if (isPlayingRef.current && electronStateRef.current.length > 0) {
        electronStateRef.current.forEach((item) => {
          item.angle += item.speed * animSpeedRef.current * 60 * delta;
          const r = 1.6 + (item.shellIdx + 1) * 1.15;
          item.mesh.position.x = r * Math.cos(item.angle);
          item.mesh.position.y = r * Math.sin(item.angle);
        });
      }

      // Pulse nucleus halo
      const halo = atomGroupRef.current?.getObjectByName('nucleusHalo') as THREE.Mesh | undefined;
      if (halo) {
        const pulse = 1 + Math.sin(currentTime * 0.003) * 0.06;
        halo.scale.set(pulse, pulse, pulse);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [webGlSupported]);

  // Re-build 3D Model when element, isotope, shells, or visualMode changes
  useEffect(() => {
    if (!atomGroupRef.current || !orbitalGroupRef.current) return;

    if (visualMode === 'bohr') {
      orbitalGroupRef.current.visible = false;
      atomGroupRef.current.visible = true;

      buildNucleusCluster(atomGroupRef.current, element.number, isotope.neutrons);
      buildBohrShells(
        atomGroupRef.current,
        element.shells,
        activeShellIndex,
        showShellRings,
        showElectrons
      );
    } else {
      atomGroupRef.current.visible = false;
      orbitalGroupRef.current.visible = true;

      buildQuantumOrbitals(orbitalGroupRef.current, selectedOrbital);
    }
  }, [
    element,
    isotope,
    activeShellIndex,
    visualMode,
    selectedOrbital,
    showElectrons,
    showShellRings,
    buildNucleusCluster,
    buildBohrShells,
    buildQuantumOrbitals,
  ]);

  // Mouse & Touch Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousPointerPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !atomGroupRef.current) return;

    const deltaX = e.clientX - previousPointerPos.current.x;
    const deltaY = e.clientY - previousPointerPos.current.y;

    previousPointerPos.current = { x: e.clientX, y: e.clientY };

    const sensitivity = 0.006;
    atomGroupRef.current.rotation.y += deltaX * sensitivity;
    atomGroupRef.current.rotation.x += deltaY * sensitivity;

    if (orbitalGroupRef.current) {
      orbitalGroupRef.current.rotation.y += deltaX * sensitivity;
      orbitalGroupRef.current.rotation.x += deltaY * sensitivity;
    }

    angularVelocity.current = {
      x: deltaY * 0.0015,
      y: deltaX * 0.0015,
    };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    const zoomFactor = e.deltaY * 0.015;
    cameraDistance.current = Math.min(34, Math.max(6, cameraDistance.current + zoomFactor));
    cameraRef.current.position.set(0, 0, cameraDistance.current);
  };

  return (
    <div
      className={`relative w-full h-full min-h-[380px] sm:min-h-[460px] md:min-h-[520px] rounded-2xl bg-gradient-to-b from-[#080d22] via-[#050816] to-[#02040b] border border-cyan-500/25 overflow-hidden shadow-[inset_0_0_40px_rgba(6,182,212,0.1)] flex flex-col ${containerClassName}`}
    >
      {/* 1. Top Overlay: View Mode Switcher + Educational Disclaimer */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none flex-wrap">
        {/* Mode Switcher Tabs */}
        <div className="pointer-events-auto flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-md shadow-lg">
          <button
            type="button"
            onClick={() => onToggleVisualMode('bohr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              visualMode === 'bohr'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D Bohr Shells</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleVisualMode('orbitals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              visualMode === 'orbitals'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Quantum Orbitals (s, p, d, f)</span>
          </button>
        </div>

        {/* Educational Note Pill */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 backdrop-blur-md">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Simplified Educational Atomic Model</span>
        </div>
      </div>

      {/* 2. Sub-orbital Selector when in Quantum Orbitals Mode */}
      {visualMode === 'orbitals' && (
        <div className="absolute top-16 left-3 z-20 pointer-events-auto flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-violet-500/30 backdrop-blur-md shadow-lg">
          {(['all', 's', 'p', 'd', 'f'] as const).map((orb) => (
            <button
              key={orb}
              type="button"
              onClick={() => onSelectOrbital(orb)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                selectedOrbital === orb
                  ? 'bg-violet-500/25 text-violet-300 border border-violet-400/50 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {orb === 'all' ? 'All Orbitals' : `${orb} Orbital`}
            </button>
          ))}
        </div>
      )}

      {/* 3. Three.js Canvas Mount Container */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full flex-1 cursor-grab active:cursor-grabbing touch-none select-none"
      />

      {/* WebGL Fallback if device unsupported */}
      {!webGlSupported && (
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-slate-950/90 text-center">
          <div className="max-w-md p-6 rounded-2xl bg-slate-900 border border-rose-500/40 text-slate-200 space-y-2">
            <h4 className="text-base font-bold text-rose-400">WebGL Required</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              3D WebGL acceleration is not supported or disabled on your current browser. Please enable hardware acceleration in browser settings to inspect 3D atoms.
            </p>
          </div>
        </div>
      )}

      {/* 4. Bottom Floating Camera & Animation Controls Dock */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-3 pointer-events-none flex-wrap">
        {/* Playback Controls */}
        <div className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-md shadow-xl">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center transition-all cursor-pointer"
            title={isPlaying ? 'Pause atomic simulation' : 'Play simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Speed Slider */}
          <div className="flex items-center gap-1.5 px-2 text-[11px] font-mono text-slate-300">
            <span className="text-slate-400">Speed:</span>
            <input
              type="range"
              min="0.25"
              max="3"
              step="0.25"
              value={animSpeed}
              onChange={(e) => setAnimSpeed(Number(e.target.value))}
              className="w-16 accent-cyan-400 cursor-pointer"
            />
            <span className="w-7 text-cyan-300 font-bold">{animSpeed}x</span>
          </div>

          <button
            type="button"
            onClick={handleResetCamera}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all cursor-pointer"
            title="Reset 3D camera orientation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Viewport Toggles & Zoom */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-md shadow-xl">
          {visualMode === 'bohr' && (
            <>
              {/* Toggle Electrons */}
              <button
                type="button"
                onClick={() => setShowElectrons(!showElectrons)}
                className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  showElectrons
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800/60 text-slate-500 border-slate-800'
                }`}
                title={showElectrons ? 'Hide electrons' : 'Show electrons'}
              >
                {showElectrons ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              {/* Toggle Shell Rings */}
              <button
                type="button"
                onClick={() => setShowShellRings(!showShellRings)}
                className={`p-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                  showShellRings
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800/60 text-slate-500 border-slate-800'
                }`}
                title={showShellRings ? 'Hide orbital shell rings' : 'Show orbital shell rings'}
              >
                Rings
              </button>
            </>
          )}

          {/* Zoom Buttons */}
          <button
            type="button"
            onClick={() => handleZoom('in')}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleZoom('out')}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
