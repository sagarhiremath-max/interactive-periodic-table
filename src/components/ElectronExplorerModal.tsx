import React, { useState } from 'react';
import { X, Layers } from 'lucide-react';
import { type ElementData, ELEMENTS_DATA, CATEGORIES } from '../data/elements';
import { BohrModel } from './BohrModel';
import { ElectronShellDiagram } from './ElectronShellDiagram';

interface ElectronExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialElement?: ElementData | null;
  darkMode?: boolean;
}

export const ElectronExplorerModal: React.FC<ElectronExplorerModalProps> = ({
  isOpen,
  onClose,
  initialElement,
  darkMode = true,
}) => {
  const [selectedNum, setSelectedNum] = useState<number>(initialElement?.number || 26); // Default to Iron (#26)
  const currentElement = ELEMENTS_DATA.find((e) => e.number === selectedNum) || ELEMENTS_DATA[25];
  const cat = CATEGORIES[currentElement.category] || CATEGORIES['unknown'];

  if (!isOpen) return null;

  const valenceElectrons = currentElement.shells[currentElement.shells.length - 1] || 0;
  const totalElectrons = currentElement.number;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto font-sans select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-950 border border-cyan-500/30 text-slate-100 shadow-[0_16px_48px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Quantum Electron Explorer & Orbital Analyzer
              </h2>
              <p className="text-xs text-slate-400">
                Visualize quantized Bohr shells, Aufbau orbital configurations, and valence electrons
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Element Selector */}
            <select
              value={currentElement.number}
              onChange={(e) => setSelectedNum(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {ELEMENTS_DATA.map((elem) => (
                <option key={elem.number} value={elem.number}>
                  #{elem.number} {elem.symbol} — {elem.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6" style={{ scrollbarWidth: 'thin' }}>
          {/* Top Banner: Bohr Model + Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            {/* SVG Bohr Model */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center">
              <BohrModel
                shells={currentElement.shells}
                symbol={currentElement.symbol}
                atomicNumber={currentElement.number}
                categoryColor={cat.color}
                size={230}
                darkMode={darkMode}
              />
              <span className="text-[11px] font-mono text-slate-400 mt-2">
                Dynamic 2D Bohr projection with relativistic shell radii
              </span>
            </div>

            {/* Electronic Profile Cards */}
            <div className="space-y-3.5">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                  Ground State Configuration
                </span>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-cyan-300 font-bold text-xs">
                  {currentElement.electronConfiguration}
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 pt-1">
                  <span>Noble Gas Core:</span>
                  <span className="text-amber-400 font-bold">
                    {currentElement.electronConfigurationSemantic || currentElement.electronConfiguration}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Total e⁻</span>
                  <span className="text-xl font-bold text-white">{totalElectrons}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Shells</span>
                  <span className="text-xl font-bold text-violet-400">{currentElement.shells.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Valence e⁻</span>
                  <span className="text-xl font-bold text-rose-400">{valenceElectrons}</span>
                </div>
              </div>

              {/* Quantum Principles Primer */}
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                <span className="font-semibold text-white block">Aufbau Principle & Hund's Rule:</span>
                <p className="leading-relaxed">
                  Electrons populate the lowest available energy orbital before filling higher states (1s → 2s → 2p → 3s → 3p → 4s → 3d). Single electrons occupy degenerate orbitals with parallel spins before pairing up.
                </p>
              </div>
            </div>
          </div>

          {/* Subshell Breakdown */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <ElectronShellDiagram
              shells={currentElement.shells}
              electronConfiguration={currentElement.electronConfiguration}
              symbol={currentElement.symbol}
              atomicNumber={currentElement.number}
              darkMode={darkMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
