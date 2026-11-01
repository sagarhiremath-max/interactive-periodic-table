import React from 'react';
import { Orbit, Sparkles, Layers, Compass } from 'lucide-react';
import { type ElementData } from '../../data/elements';
import { type VisualMode, type OrbitalType } from './AtomCanvas';

interface OrbitalViewerPanelProps {
  element: ElementData;
  visualMode: VisualMode;
  onToggleVisualMode: (mode: VisualMode) => void;
  selectedOrbital: OrbitalType;
  onSelectOrbital: (orbital: OrbitalType) => void;
}

const ORBITAL_DETAILS: Record<
  's' | 'p' | 'd' | 'f',
  { name: string; l: number; shape: string; maxElectrons: number; color: string; bg: string }
> = {
  s: {
    name: 's-Orbital',
    l: 0,
    shape: 'Spherical symmetry',
    maxElectrons: 2,
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.15)',
  },
  p: {
    name: 'p-Orbital',
    l: 1,
    shape: 'Dumbbell / 2-lobed (px, py, pz)',
    maxElectrons: 6,
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
  },
  d: {
    name: 'd-Orbital',
    l: 2,
    shape: '4-lobed cloverleaf & torus (dz²)',
    maxElectrons: 10,
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
  },
  f: {
    name: 'f-Orbital',
    l: 3,
    shape: 'Complex 8-lobed geometries',
    maxElectrons: 14,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
  },
};

export const OrbitalViewerPanel: React.FC<OrbitalViewerPanelProps> = ({
  element,
  visualMode,
  onToggleVisualMode,
  selectedOrbital,
  onSelectOrbital,
}) => {
  // Determine available orbital blocks for this element
  const hasS = element.number >= 1;
  const hasP = element.number >= 5;
  const hasD = element.number >= 21;
  const hasF = element.number >= 57;

  return (
    <div className="w-full space-y-3.5 font-sans">
      {/* Header & Mode Switcher */}
      <div className="pb-2 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Orbit className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              3D Quantum Orbitals
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/30">
            Block: {element.block.toUpperCase()}-Block
          </span>
        </div>

        {/* 3D Visual Representation Toggle Pill */}
        <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleVisualMode('bohr')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              visualMode === 'bohr'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bohr Shells</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleVisualMode('orbitals')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              visualMode === 'orbitals'
                ? 'bg-purple-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quantum Shapes</span>
          </button>
        </div>
      </div>

      {/* Orbital Subshell Filters */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
          Orbital Filter ({visualMode === 'orbitals' ? 'Active in 3D' : 'Select to isolate'})
        </span>
        <div className="grid grid-cols-5 gap-1">
          {(['all', 's', 'p', 'd', 'f'] as OrbitalType[]).map((type) => {
            const isSelected = selectedOrbital === type;
            const isAvailable =
              type === 'all'
                ? true
                : type === 's'
                ? hasS
                : type === 'p'
                ? hasP
                : type === 'd'
                ? hasD
                : hasF;

            return (
              <button
                key={type}
                type="button"
                disabled={!isAvailable}
                onClick={() => {
                  onSelectOrbital(type);
                  if (visualMode !== 'orbitals') {
                    onToggleVisualMode('orbitals');
                  }
                }}
                className={`py-1.5 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : isAvailable
                    ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed opacity-50'
                }`}
                title={!isAvailable ? `${type.toUpperCase()}-orbitals not yet occupied in ${element.name}` : undefined}
              >
                {type === 'all' ? 'All' : `${type}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Orbital Physics Card */}
      {selectedOrbital !== 'all' && ORBITAL_DETAILS[selectedOrbital] && (
        <div
          className="p-3 rounded-xl border space-y-2 transition-all"
          style={{
            borderColor: `${ORBITAL_DETAILS[selectedOrbital].color}60`,
            backgroundColor: ORBITAL_DETAILS[selectedOrbital].bg,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-bold uppercase font-mono tracking-wider"
              style={{ color: ORBITAL_DETAILS[selectedOrbital].color }}
            >
              {ORBITAL_DETAILS[selectedOrbital].name}
            </span>
            <span className="text-[10px] font-mono text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800">
              l = {ORBITAL_DETAILS[selectedOrbital].l}
            </span>
          </div>
          <p className="text-[11px] text-slate-200 leading-relaxed">
            <span className="font-semibold text-white">Geometry:</span> {ORBITAL_DETAILS[selectedOrbital].shape}
          </p>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 pt-1 border-t border-slate-800/60">
            <span>Subshell Capacity:</span>
            <span className="font-bold text-white">
              {ORBITAL_DETAILS[selectedOrbital].maxElectrons} electrons
            </span>
          </div>
        </div>
      )}

      {/* Quantum Numbers Summary Reference */}
      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
            Four Quantum Numbers Guide
          </span>
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <span className="font-mono font-bold text-cyan-400">n</span>
            <span className="text-slate-400 text-[10px] ml-1">Principal (1, 2, 3...)</span>
            <div className="text-[9.5px] text-slate-500 mt-0.5">Energy level & shell radius</div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <span className="font-mono font-bold text-purple-400">l</span>
            <span className="text-slate-400 text-[10px] ml-1">Azimuthal (0 to n-1)</span>
            <div className="text-[9.5px] text-slate-500 mt-0.5">Subshell angular shape (s,p,d,f)</div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <span className="font-mono font-bold text-blue-400">mₗ</span>
            <span className="text-slate-400 text-[10px] ml-1">Magnetic (-l to +l)</span>
            <div className="text-[9.5px] text-slate-500 mt-0.5">Spatial lobe orientation in 3D</div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <span className="font-mono font-bold text-amber-400">mₛ</span>
            <span className="text-slate-400 text-[10px] ml-1">Spin (±1/2)</span>
            <div className="text-[9.5px] text-slate-500 mt-0.5">Intrinsic electron spin magnetic</div>
          </div>
        </div>
      </div>

      {/* Aufbau Filling Order Principle */}
      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] space-y-1">
        <span className="font-mono font-bold text-slate-400 uppercase tracking-wider block">
          Aufbau Energy Filling Sequence:
        </span>
        <div className="font-mono text-cyan-400/90 text-[10.5px] leading-relaxed break-words">
          1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p → 5s → 4d → 5p → 6s → 4f → 5d → 6p → 7s
        </div>
      </div>
    </div>
  );
};
