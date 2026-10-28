import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Atom,
  Thermometer,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
  ArrowRightLeft,
  Share2,
  Copy,
  Check,
  ShieldAlert,
  Flame,
  Zap,
  Bookmark
} from 'lucide-react';
import { type ElementData, CATEGORIES, ELEMENTS_DATA } from '../data/elements';
import { BohrModel } from './BohrModel';
import { formatTemp, kelvinToCelsius, kelvinToFahrenheit, getStateAtTemperature, getStateColor } from '../utils/helpers';
import { ATOMIC_RADII_PM } from '../data/trends';
import {
  getElementCAS,
  getElementEtymology,
  getElementAbundance,
  getElementOxidationStates,
  getElementThermalConductivity,
  getElementElectricalConductivity,
  getElementIsotopes,
  getElementSafety,
  getAufbauOrbitalDiagram
} from '../data/elementDetails';
import { useFavorites } from '../utils/useFavorites';

interface ElementModalProps {
  element: ElementData | null;
  isOpen: boolean;
  darkMode: boolean;
  temperatureKelvin: number;
  onClose: () => void;
  onSelectElement: (element: ElementData) => void;
  onAddToCompare?: (element: ElementData) => void;
}

export const ElementModal: React.FC<ElementModalProps> = ({
  element,
  isOpen,
  darkMode,
  temperatureKelvin,
  onClose,
  onSelectElement,
  onAddToCompare,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bohr' | 'orbitals' | 'thermal' | 'applications'>('overview');
  const [tempUnit, setTempUnit] = useState<'C' | 'K' | 'F'>('C');
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Reset to overview tab when element changes
  useEffect(() => {
    setActiveTab('overview');
  }, [element?.number]);

  // Keyboard navigation: Left/Right to browse, Escape to close
  useEffect(() => {
    if (!isOpen || !element) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        const prevIdx = element.number > 1 ? element.number - 2 : ELEMENTS_DATA.length - 1;
        onSelectElement(ELEMENTS_DATA[prevIdx]);
      } else if (e.key === 'ArrowRight') {
        const nextIdx = element.number < 118 ? element.number : 0;
        onSelectElement(ELEMENTS_DATA[nextIdx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, element, onClose, onSelectElement]);

  if (!isOpen || !element) return null;

  const cat = CATEGORIES[element.category] || CATEGORIES['unknown'];
  const currentState = getStateAtTemperature(element, temperatureKelvin);
  const stateColor = getStateColor(currentState);

  const prevElement = element.number > 1 ? ELEMENTS_DATA[element.number - 2] : ELEMENTS_DATA[117];
  const nextElement = element.number < 118 ? ELEMENTS_DATA[element.number] : ELEMENTS_DATA[0];

  const atomicRadius = ATOMIC_RADII_PM[element.number];
  const isSuperheavy = element.number >= 104;
  const isSynthetic = element.number > 94 || element.number === 43 || element.number === 61;

  // Subatomic counts
  const protons = element.number;
  const electrons = element.number;
  const neutrons = Math.round(element.atomicMassValue) - protons;

  // Enriched metadata
  const casNumber = getElementCAS(element.number);
  const etymology = getElementEtymology(element.number);
  const abundance = getElementAbundance(element.number);
  const oxidationStates = getElementOxidationStates(element.number);
  const thermalCond = getElementThermalConductivity(element.number);
  const electricalCond = getElementElectricalConductivity(element.number);
  const isotopes = getElementIsotopes(element.number, element.symbol);
  const safety = getElementSafety(element.number, element.category, isSuperheavy);
  const orbitalBoxes = getAufbauOrbitalDiagram(element.number);

  const handleCopy = () => {
    const text = `${element.name} (${element.symbol}) - Atomic Number: ${element.number}, Mass: ${element.atomicMass} u, Category: ${element.categoryName}\nState: ${element.standardState}, Period: ${element.period}, Group: ${element.group}, Block: ${element.block.toUpperCase()}\nConfiguration: ${element.electronConfiguration}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto backdrop-blur-md bg-black/75 transition-opacity select-none font-sans animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Small Page Modal Container */}
      <div
        className={`
          relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden border
          ${
            darkMode
              ? 'bg-[#090d20] border-cyan-500/40 text-slate-100'
              : 'bg-white border-slate-300 text-slate-900'
          }
        `}
      >
        {/* Top Category Line */}
        <div className="h-1.5 w-full shrink-0 shadow-sm" style={{ backgroundColor: cat.color }} />

        {/* Header Banner */}
        <div
          className="relative px-5 py-4 sm:px-6 sm:py-5 border-b flex items-center justify-between shrink-0"
          style={{
            background: darkMode
              ? `linear-gradient(135deg, ${cat.color}25 0%, rgba(10,15,35,0.95) 100%)`
              : `linear-gradient(135deg, ${cat.color}15 0%, rgba(255,255,255,0.95) 100%)`,
            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          }}
        >
          {/* Left: Atomic Number, Symbol, Name */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg border-2 shrink-0 transition-transform hover:scale-105"
              style={{
                backgroundColor: `${cat.color}25`,
                borderColor: cat.color,
                boxShadow: `0 0 20px ${cat.color}35`
              }}
            >
              <span className="text-[11px] font-mono leading-none opacity-80 text-slate-300 mb-0.5">{element.number}</span>
              <span
                className="text-3xl sm:text-4xl font-black leading-none my-0.5 tracking-tight"
                style={{ color: cat.color }}
              >
                {element.symbol}
              </span>
              <span className="text-[9px] font-mono text-slate-400 truncate max-w-[90%]">{element.atomicMass}</span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">{element.name}</h2>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide border"
                  style={{
                    backgroundColor: `${cat.color}20`,
                    borderColor: `${cat.color}60`,
                    color: cat.color,
                  }}
                >
                  {element.categoryName}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider flex items-center gap-1.5"
                  style={{
                    backgroundColor: `${stateColor}25`,
                    color: stateColor,
                    border: `1px solid ${stateColor}40`
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stateColor }} />
                  {currentState}
                </span>

                {isSuperheavy ? (
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300">
                    Superheavy
                  </span>
                ) : isSynthetic ? (
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300">
                    Synthetic
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                    Natural
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-4 text-xs text-slate-300 mt-1.5 flex-wrap font-mono">
                <span>Atomic Mass: <strong className="text-cyan-300">{element.atomicMass} u</strong></span>
                <span>•</span>
                <span>Period <strong className="text-white">{element.period}</strong></span>
                <span>•</span>
                <span>Group <strong className="text-white">{element.group}</strong></span>
                <span>•</span>
                <span><strong className="text-cyan-300 uppercase">{element.block}</strong>-block</span>
                {casNumber && (
                  <>
                    <span>•</span>
                    <span>CAS: <strong className="text-slate-300">{casNumber}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions & Close */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Favorite */}
            <button
              onClick={() => toggleFavorite(element.number)}
              title={isFavorite(element.number) ? 'Remove favorite' : 'Add favorite'}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isFavorite(element.number)
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/10'
              }`}
            >
              <Bookmark size={16} />
            </button>

            {onAddToCompare && (
              <button
                onClick={() => onAddToCompare(element)}
                title="Compare this element"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors border border-white/10 cursor-pointer"
              >
                <ArrowRightLeft size={14} />
                <span>Compare</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              title="Copy element info"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors border border-white/10 cursor-pointer"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>

            <button
              onClick={handleShare}
              title="Share link to this element"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors border border-white/10 cursor-pointer"
            >
              {shareCopied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
            </button>

            <button
              onClick={onClose}
              title="Close (Esc)"
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors border border-white/10 ml-1 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation bar: Prev / Next Element */}
        <div
          className={`flex items-center justify-between px-6 py-2 text-xs border-b shrink-0 font-mono ${
            darkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            onClick={() => onSelectElement(prevElement)}
            className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            title={`Previous: #${prevElement.number} ${prevElement.name}`}
          >
            <ChevronLeft size={16} />
            <span>#{prevElement.number} {prevElement.symbol} ({prevElement.name})</span>
          </button>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Element {element.number} of 118 (Use <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">←</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">→</kbd> keys)
          </span>

          <button
            onClick={() => onSelectElement(nextElement)}
            className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            title={`Next: #${nextElement.number} ${nextElement.name}`}
          >
            <span>#{nextElement.number} {nextElement.symbol} ({nextElement.name})</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className={`flex items-center px-6 border-b overflow-x-auto gap-4 sm:gap-6 shrink-0 ${
            darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-100/50'
          }`}
        >
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={16} />
            <span>Overview & Properties</span>
          </button>

          <button
            onClick={() => setActiveTab('bohr')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'bohr'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Atom size={16} />
            <span>Bohr Atomic Model</span>
          </button>

          <button
            onClick={() => setActiveTab('orbitals')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'orbitals'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={16} />
            <span>Electron Orbitals</span>
          </button>

          <button
            onClick={() => setActiveTab('thermal')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'thermal'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Thermometer size={16} />
            <span>Thermal & Phase</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'applications'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={16} />
            <span>Uses, Isotopes & Safety</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className={`flex-1 p-4 sm:p-5 ${activeTab === 'bohr' ? 'overflow-hidden' : 'overflow-y-auto space-y-6'}`}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Summary Description */}
              <div className="p-4 rounded-2xl border leading-relaxed text-sm bg-slate-900/60 border-slate-800">
                <h4 className="text-xs uppercase font-bold tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5 font-mono">
                  <BookOpen size={14} />
                  <span>Chemical Description & Profile</span>
                </h4>
                <p className="text-slate-200">{element.summary}</p>
              </div>

              {/* Subatomic Particle Distribution */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                  <Atom size={14} className="text-cyan-400" />
                  <span>Subatomic Particles (Neutral Atom)</span>
                </h3>

                <div className="grid grid-cols-3 gap-3 font-mono text-center">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Protons (p⁺)</span>
                    <strong className="text-2xl font-black text-cyan-400">{protons}</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Charge +{protons}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Neutrons (n⁰)</span>
                    <strong className="text-2xl font-black text-violet-400">{neutrons >= 0 ? neutrons : '—'}</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">A − Z</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Electrons (e⁻)</span>
                    <strong className="text-2xl font-black text-emerald-400">{electrons}</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{element.shells.length} Shells</span>
                  </div>
                </div>
              </div>

              {/* Key fundamental properties grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 font-mono">
                  <Layers size={14} className="text-cyan-400" />
                  <span>Fundamental Physical & Chemical Properties</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block mb-0.5">Density</span>
                    <strong className="text-sm text-white block">
                      {element.density !== null ? `${element.density} g/cm³` : 'Unknown'}
                    </strong>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Bulk STP density</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block mb-0.5">Atomic Radius</span>
                    <strong className="text-sm text-cyan-300 block">
                      {atomicRadius ? `${atomicRadius} pm` : 'Not available'}
                    </strong>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Empirical covalent</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block mb-0.5">Electronegativity</span>
                    <strong className="text-sm text-violet-300 block">
                      {element.electronegativity !== null ? element.electronegativity.toFixed(2) : 'Not available'}
                    </strong>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Pauling scale</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block mb-0.5">1st Ionization Energy</span>
                    <strong className="text-sm text-emerald-300 block">
                      {element.ionizationEnergy ? `${element.ionizationEnergy} kJ/mol` : 'Unknown'}
                    </strong>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Valence electron loss</span>
                  </div>
                </div>
              </div>

              {/* Etymology & Abundance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-violet-400 block">
                    Name Origin & Etymology
                  </span>
                  <p className="text-slate-300 leading-relaxed font-sans">{etymology}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 font-mono">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                    Natural Abundance
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div><span className="text-slate-500">Universe:</span> <strong className="text-white block">{abundance.universe}</strong></div>
                    <div><span className="text-slate-500">Earth's Crust:</span> <strong className="text-cyan-300 block">{abundance.crust}</strong></div>
                    <div><span className="text-slate-500">Oceans:</span> <strong className="text-white block">{abundance.ocean}</strong></div>
                    <div><span className="text-slate-500">Human Body:</span> <strong className="text-emerald-300 block">{abundance.human}</strong></div>
                  </div>
                </div>
              </div>

              {/* Common Oxidation States */}
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 font-mono text-xs">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block">
                  Common Oxidation States
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {oxidationStates.map((st, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-bold text-xs">
                      {st}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOHR MODEL */}
          {activeTab === 'bohr' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="text-left font-mono">
                <h3 className="text-sm sm:text-base font-bold text-white mb-0.5">
                  Bohr Orbital Atomic Model // {element.name} (Z={element.number})
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  {element.shells.length} Quantized electron shells (K through Q) with real-time orbital electron animation.
                </p>
              </div>

              {/* Side-by-Side: Left Orbit, Right Shell & Outer Electrons */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* LEFT SIDE: Orbit */}
                <div className="md:col-span-7 flex flex-col items-center justify-center p-3 sm:p-4 rounded-3xl border bg-slate-950/80 border-slate-800 shadow-[0_0_30px_rgba(6,182,212,0.12)]">
                  <BohrModel
                    shells={element.shells}
                    symbol={element.symbol}
                    atomicNumber={element.number}
                    categoryColor={cat.color}
                    size={240}
                    darkMode={darkMode}
                    hideBreakdown={true}
                  />
                </div>

                {/* RIGHT SIDE: Shell Number & Outer Electrons Cards */}
                <div className="md:col-span-5 flex flex-col justify-center space-y-2.5 font-mono text-xs">
                  {/* Principal Shells Card */}
                  <div className="p-3 sm:p-3.5 rounded-2xl border bg-slate-900/70 border-slate-800 space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-bold">
                      Principal Shells
                    </span>
                    <div className="flex items-baseline gap-2">
                      <strong className="text-2xl sm:text-3xl font-black text-cyan-400">
                        {element.shells.length}
                      </strong>
                      <span className="text-slate-400 text-xs">
                        {element.shells.length === 1 ? 'Shell' : 'Shells'} (K to {['K','L','M','N','O','P','Q'][element.shells.length - 1]})
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Period {element.period} ground-state energy levels
                    </span>
                  </div>

                  {/* Outer (Valence) Electrons Card */}
                  <div className="p-3 sm:p-3.5 rounded-2xl border bg-slate-900/70 border-slate-800 space-y-0.5">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-bold">
                      Outer (Valence) Electrons
                    </span>
                    <div className="flex items-baseline gap-2">
                      <strong className="text-2xl sm:text-3xl font-black text-rose-400">
                        {element.shells[element.shells.length - 1] || 0}
                      </strong>
                      <span className="text-slate-400 text-xs">
                        Valence e⁻ in shell {element.shells.length}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Determines chemical bonding & reactivity
                    </span>
                  </div>

                  {/* Shell-by-Shell Breakdown */}
                  <div className="p-2.5 sm:p-3 rounded-2xl border bg-slate-900/50 border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                      <span>Shell Capacities</span>
                      <span className="text-slate-500">Total: {element.shells.reduce((a, b) => a + b, 0)} e⁻</span>
                    </div>
                    <div className="space-y-1 max-h-[105px] overflow-y-auto pr-0.5">
                      {element.shells.map((count, idx) => {
                        const labels = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
                        const shellLetter = labels[idx] || `S${idx + 1}`;
                        const maxCap = 2 * Math.pow(idx + 1, 2);
                        const isValence = idx === element.shells.length - 1;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between px-2 py-1 rounded-lg border text-[11px] ${
                              isValence
                                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="font-bold flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded bg-slate-800 text-[9px] flex items-center justify-center font-bold text-white">
                                {shellLetter}
                              </span>
                              Shell {idx + 1} ({shellLetter})
                            </span>
                            <span className="font-bold">
                              {count} <span className="text-slate-500 font-normal text-[10px]">/ {maxCap} e⁻</span>
                              {isValence && (
                                <span className="ml-1.5 text-[8px] uppercase px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                                  Outer
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ELECTRON CONFIGURATION & ORBITALS */}
          {activeTab === 'orbitals' && (
            <div className="space-y-6 animate-in fade-in duration-150 font-mono text-xs">
              {/* Configuration banner */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Full Aufbau Configuration</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs">
                    Shorthand: {element.electronConfigurationSemantic || element.electronConfiguration}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-black text-sm tracking-wide">
                  {element.electronConfiguration}
                </div>
              </div>

              {/* Orbital Spin Boxes */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Aufbau Subshell Orbital Diagram & Spin Alignment (↑ +½, ↓ −½)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {orbitalBoxes.map((sub, sIdx) => (
                    <div key={sIdx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{sub.name}</span>
                        <span className="text-[10px] text-cyan-400 font-bold">{sub.electrons}/{sub.capacity} e⁻</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {sub.boxes.map((box, bIdx) => (
                          <div
                            key={bIdx}
                            className={`h-8 flex-1 rounded border flex items-center justify-center font-bold text-xs gap-0.5 ${
                              box.electrons === 2
                                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                                : box.electrons === 1
                                ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                                : 'bg-slate-900 border-slate-800 text-slate-600'
                            }`}
                          >
                            {box.spinUp && <span>↑</span>}
                            {box.spinDown && <span>↓</span>}
                            {box.electrons === 0 && <span className="text-slate-700">•</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: THERMAL & PHASE */}
          {activeTab === 'thermal' && (
            <div className="space-y-6 animate-in fade-in duration-150 font-mono text-xs">
              {/* Unit Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Thermodynamic Transition Points
                  </h3>
                  <span className="text-xs text-slate-400">
                    State at STP: <strong className="text-cyan-400 capitalize">{element.standardState}</strong>
                  </span>
                </div>

                <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1">
                  {(['C', 'K', 'F'] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setTempUnit(unit)}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        tempUnit === unit ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      °{unit === 'K' ? 'K' : unit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thermal Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Flame size={14} />
                      Melting Point
                    </span>
                    <span className="text-[10px] text-slate-400">Solid ➔ Liquid</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {formatTemp(element.meltingPointKelvin, tempUnit)}
                  </div>
                  {element.meltingPointKelvin && (
                    <div className="text-[11px] text-slate-400 mt-1">
                      {element.meltingPointKelvin} K / {kelvinToCelsius(element.meltingPointKelvin)} °C / {kelvinToFahrenheit(element.meltingPointKelvin)} °F
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1.5">
                      <Zap size={14} />
                      Boiling Point
                    </span>
                    <span className="text-[10px] text-slate-400">Liquid ➔ Gas</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {formatTemp(element.boilingPointKelvin, tempUnit)}
                  </div>
                  {element.boilingPointKelvin && (
                    <div className="text-[11px] text-slate-400 mt-1">
                      {element.boilingPointKelvin} K / {kelvinToCelsius(element.boilingPointKelvin)} °C / {kelvinToFahrenheit(element.boilingPointKelvin)} °F
                    </div>
                  )}
                </div>
              </div>

              {/* Thermal & Electrical Conductivity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-0.5">Thermal Conductivity</span>
                  <strong className="text-sm text-white block">
                    {thermalCond !== null ? `${thermalCond} W/(m·K)` : 'Not available'}
                  </strong>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-0.5">Electrical Conductivity</span>
                  <strong className="text-sm text-cyan-300 block">
                    {electricalCond || 'Not available'}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: USES, ISOTOPES & SAFETY */}
          {activeTab === 'applications' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Common Practical Applications */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2.5 flex items-center gap-1.5 font-mono">
                  <Sparkles size={14} />
                  <span>Real-World Industrial & Scientific Applications</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {element.commonUses.map((use, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs"
                    >
                      <div className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-cyan-500/30">
                        {idx + 1}
                      </div>
                      <span className="text-slate-200 font-medium leading-relaxed">{use}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Isotopes table */}
              <div className="space-y-2 font-mono text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Key Natural & Notable Isotopes
                </span>

                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs divide-y divide-slate-800">
                    <thead className="bg-slate-950 text-slate-400 text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Isotope</th>
                        <th className="py-2 px-3">Abundance / Half-Life</th>
                        <th className="py-2 px-3">Decay Mode</th>
                        <th className="py-2 px-3 text-right">Stability</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                      {isotopes.map((iso, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3 font-bold text-white">{iso.symbol} ({iso.name})</td>
                          <td className="py-2 px-3 text-cyan-300">{iso.abundance || iso.halfLife || 'Trace'}</td>
                          <td className="py-2 px-3 text-violet-300">{iso.decayMode || (iso.isStable ? 'Stable' : '—')}</td>
                          <td className="py-2 px-3 text-right">
                            {iso.isStable ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">Stable</span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950 border border-rose-500/40 text-rose-300 font-bold">Radioactive</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chemical Safety */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-mono uppercase font-bold text-rose-400 flex items-center gap-1">
                  <ShieldAlert size={14} />
                  <span>Chemical Safety & Handling Precautions</span>
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">{safety.hazardSummary}</p>
                <p className="text-slate-400 text-[11px] font-mono pt-1">Protocol: {safety.handling}</p>
              </div>

              {/* Wikipedia Link */}
              <div className="pt-1">
                <a
                  href={`https://en.wikipedia.org/wiki/${encodeURIComponent(element.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 hover:underline"
                >
                  <span>Read full encyclopedic article on Wikipedia</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
