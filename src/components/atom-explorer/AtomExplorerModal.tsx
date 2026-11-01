import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Atom,
  Layers,
  Maximize2,
  Minimize2,
  Orbit,
} from 'lucide-react';
import { type ElementData, ELEMENTS_DATA } from '../../data/elements';
import { getElementIsotopes, type IsotopeData } from '../../data/isotopes';
import { AtomCanvas, type VisualMode, type OrbitalType } from './AtomCanvas';
import { ElementSelectorBar } from './ElementSelectorBar';
import { AtomicInfoPanel } from './AtomicInfoPanel';
import { ShellExplorerPanel } from './ShellExplorerPanel';
import { OrbitalViewerPanel } from './OrbitalViewerPanel';
import { LearningModePanel } from './LearningModePanel';

interface AtomExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialElement?: ElementData | null;
}

type MobileTab = '3d' | 'nucleus' | 'shells' | 'learn';

export const AtomExplorerModal: React.FC<AtomExplorerModalProps> = ({
  isOpen,
  onClose,
  initialElement,
}) => {
  // Current element state (default to Carbon Z=6 or initialElement)
  const [currentElement, setCurrentElement] = useState<ElementData>(
    initialElement || ELEMENTS_DATA[5] // Carbon
  );

  // Sync when initialElement changes and modal is open
  useEffect(() => {
    if (initialElement && isOpen) {
      setCurrentElement(initialElement);
    }
  }, [initialElement, isOpen]);

  // Derived verified isotopes
  const isotopes = useMemo(() => {
    return getElementIsotopes(currentElement.number, currentElement.atomicMassValue);
  }, [currentElement]);

  // Selected isotope (default to first/most stable)
  const [selectedIsotope, setSelectedIsotope] = useState<IsotopeData>(isotopes[0]);

  // Sync selected isotope when element changes
  useEffect(() => {
    if (isotopes.length > 0) {
      setSelectedIsotope(isotopes[0]);
    }
  }, [isotopes]);

  // 3D Canvas visual states
  const [activeShellIndex, setActiveShellIndex] = useState<number | null>(null);
  const [visualMode, setVisualMode] = useState<VisualMode>('bohr');
  const [selectedOrbital, setSelectedOrbital] = useState<OrbitalType>('all');
  const [isModalFullscreen, setIsModalFullscreen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('3d');
  const [rightTab, setRightTab] = useState<'shells' | 'orbitals'>('shells');

  // Reset active shell selection when element changes
  useEffect(() => {
    setActiveShellIndex(null);
  }, [currentElement]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className={`relative w-full rounded-2xl sm:rounded-3xl bg-[#050814] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden transition-all duration-300 font-sans ${
          isModalFullscreen
            ? 'h-full max-h-none rounded-none'
            : 'h-[94vh] max-h-[960px] max-w-7xl'
        }`}
      >
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3 shrink-0 select-none">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
              <Atom className="w-5 h-5 animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2 truncate">
                  3D Atom Explorer
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hidden sm:inline-block">
                  v3.0 Interactive Laboratory
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Interactive atomic structure, Bohr electron shells & quantum orbitals
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Visual Mode Quick Toggle */}
            <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setVisualMode('bohr')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  visualMode === 'bohr'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Bohr Model</span>
              </button>
              <button
                type="button"
                onClick={() => setVisualMode('orbitals')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  visualMode === 'orbitals'
                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Orbit className="w-3.5 h-3.5" />
                <span>Orbitals (s,p,d,f)</span>
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsModalFullscreen(!isModalFullscreen)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer hidden sm:block"
              title={isModalFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isModalFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-500/50 transition-all cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Element Selector Quick Bar */}
        <div className="px-4 sm:px-6 py-2 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
          <ElementSelectorBar
            currentElement={currentElement}
            onSelectElement={(el) => setCurrentElement(el)}
          />
        </div>

        {/* Mobile / Tablet Tab Switcher */}
        <div className="lg:hidden px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-1 overflow-x-auto text-xs shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab('3d')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center whitespace-nowrap transition-colors ${
              mobileTab === '3d'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            3D Viewport
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('nucleus')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center whitespace-nowrap transition-colors ${
              mobileTab === 'nucleus'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Nuclear & Isotopes
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('shells')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center whitespace-nowrap transition-colors ${
              mobileTab === 'shells'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Shells & Orbitals
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('learn')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center whitespace-nowrap transition-colors ${
              mobileTab === 'learn'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Guide
          </button>
        </div>

        {/* Main Workspace Body (Scrollable) */}
        <div
          className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4"
          style={{ scrollbarWidth: 'thin' }}
        >
          {/* Desktop 3-Column Studio Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left Column: Nuclear Info & Verified Isotopes (3 cols) */}
            <div
              className={`lg:col-span-3 space-y-4 ${
                mobileTab === 'nucleus' ? 'block' : 'hidden lg:block'
              }`}
            >
              <AtomicInfoPanel
                element={currentElement}
                isotopes={isotopes}
                selectedIsotope={selectedIsotope}
                onSelectIsotope={setSelectedIsotope}
              />
            </div>

            {/* Center Column: 3D Interactive WebGL Atom Canvas (6 cols) */}
            <div
              className={`lg:col-span-6 flex flex-col space-y-2 ${
                mobileTab === '3d' ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="relative rounded-2xl bg-gradient-to-b from-slate-950 via-[#070b19] to-slate-950 border border-cyan-500/30 overflow-hidden shadow-2xl h-[440px] sm:h-[520px]">
                <AtomCanvas
                  element={currentElement}
                  isotope={selectedIsotope}
                  activeShellIndex={activeShellIndex}
                  onSelectShell={setActiveShellIndex}
                  visualMode={visualMode}
                  onToggleVisualMode={setVisualMode}
                  selectedOrbital={selectedOrbital}
                  onSelectOrbital={setSelectedOrbital}
                />
              </div>

              {/* Status Bar Beneath Viewport */}
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300 font-semibold">{currentElement.name} Atom</span>
                  <span>(Z={currentElement.number}, A={selectedIsotope.massNumber})</span>
                </div>
                <div className="text-slate-500 hidden sm:block">
                  Drag to rotate • Scroll to zoom • Double-click to reset
                </div>
              </div>
            </div>

            {/* Right Column: Shells & Orbitals (3 cols) */}
            <div
              className={`lg:col-span-3 space-y-4 ${
                mobileTab === 'shells' ? 'block' : 'hidden lg:block'
              }`}
            >
              {/* Right Panel Tab Switcher */}
              <div className="p-1 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setRightTab('shells')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    rightTab === 'shells'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Bohr Shells
                </button>
                <button
                  type="button"
                  onClick={() => setRightTab('orbitals')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    rightTab === 'orbitals'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Quantum Orbitals
                </button>
              </div>

              {rightTab === 'shells' ? (
                <ShellExplorerPanel
                  element={currentElement}
                  activeShellIndex={activeShellIndex}
                  onSelectShell={setActiveShellIndex}
                />
              ) : (
                <OrbitalViewerPanel
                  element={currentElement}
                  visualMode={visualMode}
                  onToggleVisualMode={setVisualMode}
                  selectedOrbital={selectedOrbital}
                  onSelectOrbital={setSelectedOrbital}
                />
              )}
            </div>
          </div>

          {/* Bottom Educational / Learning Mode Panel */}
          <div className={mobileTab === 'learn' ? 'block' : 'hidden lg:block'}>
            <LearningModePanel
              element={currentElement}
              isotope={selectedIsotope}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
