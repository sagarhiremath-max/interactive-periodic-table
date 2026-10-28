import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Atom,
  Thermometer,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
  Scale,
  Copy,
  Check,
  Bookmark,
  Share2,
  X,
  Info,
} from 'lucide-react';
import { type ElementData, CATEGORIES, ELEMENTS_DATA } from '../data/elements';
import { BohrModel } from './BohrModel';
import { formatTemp, kelvinToCelsius, getStateAtTemperature, getStateColor } from '../utils/helpers';
import { ATOMIC_RADII_PM } from '../data/trends';
import { ElectronShellDiagram } from './ElectronShellDiagram';

interface ElementDetailPanelProps {
  element: ElementData | null;
  darkMode: boolean;
  temperatureKelvin: number;
  isFavorite?: boolean;
  onToggleFavorite?: (atomicNumber: number) => void;
  onSelectElement: (element: ElementData) => void;
  onAddToCompare?: (element: ElementData) => void;
  onClose?: () => void;
}

export const ElementDetailPanel: React.FC<ElementDetailPanelProps> = ({
  element,
  darkMode,
  temperatureKelvin,
  isFavorite = false,
  onToggleFavorite,
  onSelectElement,
  onAddToCompare,
  onClose,
}) => {
  const currentElement = element || ELEMENTS_DATA[0];

  const [activeTab, setActiveTab] = useState<'overview' | 'bohr' | 'orbitals' | 'thermal' | 'history'>('overview');
  const [tempUnit, setTempUnit] = useState<'C' | 'K' | 'F'>('C');
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Reset to overview when element changes
  useEffect(() => {
    setActiveTab('overview');
  }, [currentElement.number]);

  // Keyboard navigation: Left/Right arrow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT') return;

      if (e.key === 'ArrowLeft') {
        const prevIdx = currentElement.number > 1 ? currentElement.number - 2 : ELEMENTS_DATA.length - 1;
        onSelectElement(ELEMENTS_DATA[prevIdx]);
      } else if (e.key === 'ArrowRight') {
        const nextIdx = currentElement.number < 118 ? currentElement.number : 0;
        onSelectElement(ELEMENTS_DATA[nextIdx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentElement, onSelectElement]);

  const cat = CATEGORIES[currentElement.category] || CATEGORIES['unknown'];
  const currentState = getStateAtTemperature(currentElement, temperatureKelvin);
  const stateColor = getStateColor(currentState);

  const prevElement = currentElement.number > 1 ? ELEMENTS_DATA[currentElement.number - 2] : ELEMENTS_DATA[117];
  const nextElement = currentElement.number < 118 ? ELEMENTS_DATA[currentElement.number] : ELEMENTS_DATA[0];

  const atomicRadius = ATOMIC_RADII_PM[currentElement.number];
  const isSuperheavy = currentElement.number >= 104;
  const isSynthetic = currentElement.number > 94 || currentElement.number === 43 || currentElement.number === 61;

  // Subatomic counts
  const protons = currentElement.number;
  const electrons = currentElement.number;
  const neutrons = Math.round(currentElement.atomicMassValue) - protons;

  const handleCopy = () => {
    const text = `${currentElement.name} (${currentElement.symbol})\nAtomic Number: ${currentElement.number}\nAtomic Mass: ${currentElement.atomicMass} u\nCategory: ${currentElement.categoryName}\nPeriod: ${currentElement.period}, Group: ${currentElement.group}, Block: ${currentElement.block.toUpperCase()}\nElectrons: ${electrons}, Protons: ${protons}, Neutrons: ${neutrons}\nElectron Configuration: ${currentElement.electronConfiguration}\nDensity: ${currentElement.density ?? 'N/A'} g/cm³\nMelting Point: ${currentElement.meltingPointKelvin ? `${Math.round(currentElement.meltingPointKelvin)} K` : 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?element=${currentElement.symbol}`;
    navigator.clipboard.writeText(url);
    window.history.replaceState(null, '', `?element=${currentElement.symbol}`);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BookOpen },
    { id: 'bohr' as const, label: 'Bohr Model', icon: Atom },
    { id: 'orbitals' as const, label: 'Orbitals', icon: Layers },
    { id: 'thermal' as const, label: 'Thermal & State', icon: Thermometer },
    { id: 'history' as const, label: 'History & Facts', icon: Sparkles },
  ];

  return (
    <div className="w-full h-full max-h-[85vh] lg:max-h-full flex flex-col rounded-2xl bg-slate-950/95 border border-cyan-500/30 text-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl overflow-hidden font-sans select-none">
      {/* Top Category Accent Line */}
      <div className="h-1.5 w-full shrink-0 shadow-sm" style={{ backgroundColor: cat.color }} />

      {/* Header Banner */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/60">
        {/* Left: Chemical Symbol Box & Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center font-black relative overflow-hidden shrink-0 border border-white/20 shadow-lg"
            style={{ backgroundColor: `${cat.color}25` }}
          >
            <span className="text-[10px] font-mono leading-none text-slate-400">
              {currentElement.number}
            </span>
            <span
              className="text-2xl sm:text-3xl font-black leading-none my-0.5 tracking-tight"
              style={{ color: cat.color }}
            >
              {currentElement.symbol}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {currentElement.name}
              </h2>
              <span
                className="px-2.5 py-0.5 text-[10px] font-medium rounded-full border border-white/10"
                style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
              >
                {currentElement.categoryName}
              </span>

              {isSuperheavy ? (
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300">
                  Superheavy
                </span>
              ) : isSynthetic ? (
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300">
                  Synthetic
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  Natural
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs mt-1 text-slate-300 flex-wrap font-mono">
              <span className="font-bold text-cyan-300">
                {currentElement.atomicMass} u
              </span>
              <span>•</span>
              <span className="capitalize flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stateColor }} />
                {currentState}
              </span>
              <span>•</span>
              <span className="text-slate-400">
                Period {currentElement.period} · Group {currentElement.group} · {currentElement.block.toUpperCase()}-block
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Favorite */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(currentElement.number)}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                isFavorite
                  ? 'bg-amber-500/20 text-amber-400 border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700'
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          )}

          {/* Compare */}
          {onAddToCompare && (
            <button
              type="button"
              onClick={() => onAddToCompare(currentElement)}
              title="Compare in side-by-side matrix"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-all cursor-pointer"
            >
              <Scale className="w-4 h-4" />
            </button>
          )}

          {/* Copy Details */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy element properties to clipboard"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Share URL */}
          <button
            type="button"
            onClick={handleShare}
            title="Copy shareable link to this element"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-all cursor-pointer"
          >
            {shareCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Close Panel */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Close element details"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Element Navigator (Prev / Next) */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-slate-800/80 bg-slate-950/60 text-xs shrink-0 font-mono">
        <button
          type="button"
          onClick={() => onSelectElement(prevElement)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
          title={`Previous: #${prevElement.number} ${prevElement.name}`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>#{prevElement.number} {prevElement.symbol} ({prevElement.name})</span>
        </button>

        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">
          Element {currentElement.number} of 118
        </span>

        <button
          type="button"
          onClick={() => onSelectElement(nextElement)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
          title={`Next: #${nextElement.number} ${nextElement.name}`}
        >
          <span>#{nextElement.number} {nextElement.symbol} ({nextElement.name})</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 border-b border-slate-800/80 bg-slate-900/40 overflow-x-auto shrink-0">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5"
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Scientific Summary */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase mb-2">
                <BookOpen className="w-4 h-4" />
                <span>Chemical Profile</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {currentElement.summary}
              </p>
            </div>

            {/* Subatomic Particle Distribution */}
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Atom className="w-4 h-4 text-cyan-400" />
                <span>Subatomic Particles (Neutral Atom)</span>
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                    Protons (p⁺)
                  </span>
                  <span className="text-2xl font-black font-mono text-cyan-400">
                    {protons}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    Nuclear Charge +{protons}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                    Neutrons (n⁰)
                  </span>
                  <span className="text-2xl font-black font-mono text-violet-400">
                    {neutrons >= 0 ? neutrons : '—'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    A - Z (Dominant Isotope)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                    Electrons (e⁻)
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    {electrons}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    {currentElement.shells.length} Quantized Shells
                  </span>
                </div>
              </div>
            </div>

            {/* Atomic & Physical Properties Grid */}
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>Atomic & Physical Properties</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">Atomic Radius</span>
                  <strong className="text-base text-white block">
                    {atomicRadius ? `${atomicRadius} pm` : 'N/A'}
                  </strong>
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    {atomicRadius ? 'Empirical / Covalent' : 'Unmeasured'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">Electronegativity</span>
                  <strong className="text-base text-cyan-300 block">
                    {currentElement.electronegativity !== null ? currentElement.electronegativity.toFixed(2) : 'N/A'}
                  </strong>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Pauling Scale</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">1st Ionization Energy</span>
                  <strong className="text-base text-violet-300 block">
                    {currentElement.ionizationEnergy ? `${currentElement.ionizationEnergy} kJ/mol` : 'N/A'}
                  </strong>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Valence Shell Removal</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">Density (at STP)</span>
                  <strong className="text-base text-white block">
                    {currentElement.density ? `${currentElement.density} g/cm³` : 'N/A'}
                  </strong>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Standard Conditions</span>
                </div>
              </div>
            </div>

            {/* Electron Configuration Box */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 font-mono">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-300 uppercase">Electron Configuration</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs">
                  {currentElement.electronConfigurationSemantic || currentElement.electronConfiguration}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-cyan-300 font-bold text-xs tracking-wide">
                {currentElement.electronConfiguration}
              </div>
              <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Shell distribution (K to Q): {currentElement.shells.join(' · ')}</span>
                <span>Valence Electrons: {currentElement.shells[currentElement.shells.length - 1]}</span>
              </div>
            </div>

            {/* Provenance & Measurement Accuracy Banner */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-2.5 text-xs">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-300 space-y-1">
                <span className="font-semibold text-white block">Data Provenance & Reliability</span>
                <p>
                  {isSuperheavy
                    ? 'Superheavy elements (Z ≥ 104) are short-lived synthetic radionuclides produced in particle accelerators. High-temperature and bulk solid-state constants represent relativistic Dirac-Fock quantum chemical calculations.'
                    : 'Standard atomic weights and ionization energies reflect IUPAC Commission on Isotopic Abundances and Atomic Weights (CIAAW) experimental measurements.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOHR MODEL */}
        {activeTab === 'bohr' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="text-center font-mono">
              <h3 className="text-base font-bold text-white uppercase">
                Bohr Atomic Model // {currentElement.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Quantized electron shells (n=1 to {currentElement.shells.length}) with dynamic orbital rotation
              </p>
            </div>

            <div className="w-full p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center">
              <BohrModel
                shells={currentElement.shells}
                symbol={currentElement.symbol}
                atomicNumber={currentElement.number}
                categoryColor={cat.color}
                size={220}
                darkMode={darkMode}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="block text-[10px] uppercase text-slate-400 mb-0.5">
                  Total Principal Shells
                </span>
                <strong className="text-2xl font-black text-white">
                  {currentElement.shells.length}
                </strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">Period {currentElement.period} Ground State</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="block text-[10px] uppercase text-slate-400 mb-0.5">
                  Valence Electrons
                </span>
                <strong className="text-2xl font-black text-rose-400">
                  {currentElement.shells[currentElement.shells.length - 1] || 0}
                </strong>
                <span className="text-[10px] text-slate-400 block mt-0.5">Outermost Energy Level</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORBITALS & CONFIGURATION */}
        {activeTab === 'orbitals' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <ElectronShellDiagram
              shells={currentElement.shells}
              electronConfiguration={currentElement.electronConfiguration}
              symbol={currentElement.symbol}
              atomicNumber={currentElement.number}
              darkMode={darkMode}
            />
          </div>
        )}

        {/* TAB 4: THERMAL & STATE */}
        {activeTab === 'thermal' && (
          <div className="space-y-5 animate-in fade-in duration-200 font-mono">
            {/* Unit Switcher */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase text-white">Thermodynamic Phase Points</h3>
                <span className="text-xs text-slate-400">
                  Current Table Temp: <strong className="text-cyan-400">{Math.round(temperatureKelvin)} K</strong>
                </span>
              </div>

              <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5">
                {(['C', 'K', 'F'] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setTempUnit(unit)}
                    className={`px-3 py-1 font-bold text-xs rounded-lg transition-all cursor-pointer ${
                      tempUnit === unit
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    °{unit === 'K' ? 'K' : unit}
                  </button>
                ))}
              </div>
            </div>

            {/* Melting & Boiling Points */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">
                  Melting Point
                </span>
                <div className="text-2xl font-black text-white">
                  {currentElement.meltingPointKelvin !== null ? (
                    formatTemp(currentElement.meltingPointKelvin, tempUnit)
                  ) : (
                    <span className="text-slate-500 text-sm font-normal">Unmeasured</span>
                  )}
                </div>
                {currentElement.meltingPointKelvin && (
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {kelvinToCelsius(currentElement.meltingPointKelvin)} °C / {currentElement.meltingPointKelvin} K
                  </span>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                  Boiling Point
                </span>
                <div className="text-2xl font-black text-white">
                  {currentElement.boilingPointKelvin !== null ? (
                    formatTemp(currentElement.boilingPointKelvin, tempUnit)
                  ) : (
                    <span className="text-slate-500 text-sm font-normal">Unmeasured</span>
                  )}
                </div>
                {currentElement.boilingPointKelvin && (
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {kelvinToCelsius(currentElement.boilingPointKelvin)} °C / {currentElement.boilingPointKelvin} K
                  </span>
                )}
              </div>
            </div>

            {/* Current Phase Description */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-300 uppercase">
                  Phase at {Math.round(temperatureKelvin)} K ({Math.round(kelvinToCelsius(temperatureKelvin) ?? 0)}°C):
                </span>
                <span
                  className="font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-xs text-white"
                  style={{ backgroundColor: `${stateColor}40`, border: `1px solid ${stateColor}` }}
                >
                  {currentState}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-300 font-sans">
                {currentState === 'solid'
                  ? `${currentElement.name} is in a solid state with high lattice binding stability below its melting transition point.`
                  : currentState === 'liquid'
                  ? `${currentElement.name} is in fluid molten liquid phase between its melting and boiling points.`
                  : currentState === 'gas'
                  ? `${currentElement.name} is in a gaseous phase with energetic, free atomic or molecular motion.`
                  : 'Synthetic radioactive element; experimental macroscopic bulk phase points have not yet been observed directly.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: HISTORY, USES & FACTS */}
        {activeTab === 'history' && (
          <div className="space-y-5 animate-in fade-in duration-200 font-sans">
            {/* Discovery & Chronology */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase font-bold text-violet-400 block mb-1">
                Discovery & History
              </span>
              <p className="text-sm font-bold text-white">{currentElement.discoveredBy}</p>
              <div className="mt-1.5 text-xs text-slate-400 font-mono">
                Appearance: <strong className="text-slate-200">{currentElement.appearance || 'Not directly observed'}</strong>
              </div>
            </div>

            {/* Common Practical Applications */}
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-cyan-400">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Practical & Industrial Uses</span>
              </h3>

              <div className="space-y-2">
                {currentElement.commonUses && currentElement.commonUses.length > 0 ? (
                  currentElement.commonUses.map((use, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs"
                    >
                      <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-500/30">
                        {idx + 1}
                      </span>
                      <span className="text-slate-200 leading-relaxed font-medium">{use}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Currently limited primarily to nuclear physics research, heavy ion bombardment experiments, and nuclear synthesis.
                  </p>
                )}
              </div>
            </div>

            {/* Wikipedia Dossier Link */}
            <div className="pt-2">
              <a
                href={`https://en.wikipedia.org/wiki/${encodeURIComponent(currentElement.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all cursor-pointer shadow-sm"
              >
                <span>View Full Academic Literature & Wikipedia Entry</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
