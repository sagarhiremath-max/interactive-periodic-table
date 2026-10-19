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
  ArrowRightLeft,
  Share2,
  Check,
  Star,
  GraduationCap,
  AlertCircle,
  X,
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
  // If no element clicked yet, show Hydrogen (#1) by default
  const currentElement = element || ELEMENTS_DATA[0];

  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [tempUnit, setTempUnit] = useState<'C' | 'K' | 'F'>('C');
  const [copied, setCopied] = useState(false);

  const slides = [
    { id: 0, title: 'Overview', icon: BookOpen },
    { id: 1, title: 'Bohr Model', icon: Atom },
    { id: 2, title: 'Thermal & State', icon: Thermometer },
    { id: 3, title: 'Uses & Discovery', icon: Sparkles },
  ];

  // Reset to overview slide whenever the selected element changes
  useEffect(() => {
    setActiveSlide(0);
  }, [currentElement.number]);

  // Keyboard navigation: Left/Right arrow keys to step through elements
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only navigate if user is not typing in an input
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

  const handleCopy = () => {
    const text = `${currentElement.name} (${currentElement.symbol}) - Atomic No: ${currentElement.number}, Mass: ${currentElement.atomicMass} u, Category: ${currentElement.categoryName}, Group: ${currentElement.group}, Period: ${currentElement.period}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goToSlide = (newIndex: number) => {
    setActiveSlide(newIndex);
  };

  const nextSlide = () => {
    if (activeSlide < slides.length - 1) {
      setActiveSlide((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (activeSlide > 0) {
      setActiveSlide((prev) => prev - 1);
    }
  };

  // Generate concise educational insight based on chemical family
  const getEducationalInsight = (): string => {
    if (currentElement.number === 1) {
      return 'Hydrogen is unique: with a single proton and electron, it can lose an electron (H⁺) like alkali metals or gain one (H⁻) like halogens. It makes up ~75% of the observable baryonic mass in the universe.';
    }
    if (currentElement.number === 6) {
      return 'Carbon possesses exceptional catenation ability (forming stable C-C covalent bonds in linear, branched, and ring structures), serving as the chemical basis for all known organic chemistry and biological life.';
    }
    if (currentElement.category === 'alkali-metal') {
      return `${currentElement.name} is an alkali metal with 1 valence electron (ns¹). It readily ionizes to form a +1 cation and reacts vigorously with water to produce hydrogen gas and a strongly basic alkaline hydroxide.`;
    }
    if (currentElement.category === 'alkaline-earth') {
      return `${currentElement.name} has 2 valence electrons (ns²) and typically exhibits a +2 oxidation state, forming divalent ionic salts and basic oxides.`;
    }
    if (currentElement.category === 'noble-gas') {
      return `${currentElement.name} possesses a completely filled valence electron shell, conferring extraordinary thermodynamic stability, low chemical reactivity, and an absence of standard electronegativity values.`;
    }
    if (currentElement.category === 'halogen') {
      return `${currentElement.name} is a halogen with 7 valence electrons (ns² np⁵). It is highly electronegative and avidly gains 1 electron to achieve noble-gas configuration, forming halide salts (e.g., fluorides, chlorides).`;
    }
    if (currentElement.category === 'transition-metal') {
      return `${currentElement.name} is a d-block transition metal exhibiting multiple oxidation states, colored coordinate complexes, and catalytic properties due to partially filled (n-1)d subshells.`;
    }
    if (currentElement.category === 'lanthanide') {
      return `${currentElement.name} is a 4f-series lanthanide. Due to lanthanide contraction (poor 4f shielding), ionic radii decrease steadily across the series, resulting in uniquely similar chemical behavior.`;
    }
    if (currentElement.category === 'actinide') {
      return `${currentElement.name} is an actinide element. All actinides are radioactive; the earlier members (Th, U) exist naturally in the Earth's crust, while transuranic members are synthesized artificially.`;
    }
    if (isSuperheavy) {
      return `${currentElement.name} is a synthetic transactinide element synthesized via heavy-ion nuclear fusion. Relativistic electron effects strongly alter expected periodicity in group ${currentElement.group}.`;
    }
    return `${currentElement.name} is a ${currentElement.categoryName.toLowerCase()} in Period ${currentElement.period}, Group ${currentElement.group}, with ${currentElement.shells.length} electron shells and a standard atomic weight of ${currentElement.atomicMass} u.`;
  };

  return (
    <div
      className={`
        w-full h-full max-h-full rounded-2xl border flex flex-col shadow-lg overflow-hidden transition-all duration-200 select-none
        ${
          darkMode
            ? 'bg-slate-900/95 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }
      `}
    >
      {/* Top Category Accent Line */}
      <div className="h-[2.5px] w-full shrink-0" style={{ backgroundColor: cat.color }} />

      {/* Header Banner */}
      <div
        className={`px-3.5 py-2.5 border-b flex items-center justify-between shrink-0 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50/80 border-slate-200'
        }`}
      >
        {/* Left: Prominent Atomic Symbol Box & Title */}
        <div className="flex items-center gap-3">
          <div
            className="w-13 h-13 rounded-xl flex flex-col items-center justify-center font-bold border-2 relative overflow-hidden shrink-0 shadow-sm"
            style={{
              backgroundColor: darkMode ? `${cat.color}20` : `${cat.color}15`,
              borderColor: cat.color,
              color: cat.color,
            }}
          >
            <span className="text-[9px] font-mono leading-none opacity-80">{currentElement.number}</span>
            <span className="text-2xl font-black leading-none my-0.5">{currentElement.symbol}</span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold tracking-tight leading-none text-white">{currentElement.name}</h2>
              <span
                className="px-1.5 py-0.2 rounded-md text-[9px] font-semibold border"
                style={{
                  backgroundColor: `${cat.color}18`,
                  borderColor: `${cat.color}40`,
                  color: cat.color,
                }}
              >
                {currentElement.categoryName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 flex-wrap">
              <span className="font-mono text-slate-300 font-semibold">{currentElement.atomicMass} u</span>
              <span>•</span>
              <span className="capitalize font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stateColor }} />
                {currentState}
              </span>
              <span>•</span>
              <span>P{currentElement.period} · G{currentElement.group}</span>
            </div>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-1">
          {/* Favorite Toggle Button */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(currentElement.number)}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-1.5 rounded-lg transition-colors border ${
                isFavorite
                  ? 'bg-amber-400/20 border-amber-400/40 text-amber-400'
                  : 'bg-white/10 hover:bg-white/20 border-white/5 text-slate-300 hover:text-white'
              }`}
            >
              <Star size={14} className={isFavorite ? 'fill-amber-400' : ''} />
            </button>
          )}

          {/* Compare Button */}
          {onAddToCompare && (
            <button
              type="button"
              onClick={() => onAddToCompare(currentElement)}
              title="Compare this element side-by-side"
              aria-label="Compare this element"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/5 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowRightLeft size={14} />
            </button>
          )}

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy element details to clipboard"
            aria-label="Copy element details"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/5 text-slate-300 hover:text-white transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
          </button>

          {/* Close Panel Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Close element details"
              aria-label="Close element details"
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 hover:text-rose-200 transition-colors ml-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Quick Element Navigator (Prev / Next) */}
      <div
        className={`flex items-center justify-between px-3 py-1 border-b text-xs shrink-0 ${
          darkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <button
          type="button"
          onClick={() => onSelectElement(prevElement)}
          className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors font-medium text-[11px]"
          title={`Previous: #${prevElement.number} ${prevElement.name}`}
        >
          <ChevronLeft size={13} />
          <span>#{prevElement.number} {prevElement.name}</span>
        </button>

        <span className="text-[10px] text-slate-400 font-mono">
          {currentElement.number} / 118
        </span>

        <button
          type="button"
          onClick={() => onSelectElement(nextElement)}
          className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors font-medium text-[11px]"
          title={`Next: #${nextElement.number} ${nextElement.name}`}
        >
          <span>#{nextElement.number} {nextElement.name}</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Slide Navigation Tabs */}
      <div
        className={`flex items-center justify-between px-3 border-b shrink-0 ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/60 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-1 overflow-x-auto py-1 w-full justify-between">
          {slides.map((s, idx) => {
            const Icon = s.icon;
            const isActive = activeSlide === idx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-xs font-bold'
                    : darkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                }`}
              >
                <Icon size={11} />
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slide Content Area with Smooth Transitions */}
      <div
        key={`${currentElement.number}-${activeSlide}`}
        className="flex-1 min-h-0 overflow-y-auto p-3 relative animate-in fade-in duration-200"
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* SLIDE 0: OVERVIEW */}
        {activeSlide === 0 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Educational Insight Highlight Box */}
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                darkMode ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-200' : 'bg-cyan-50 border-cyan-200 text-cyan-950'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-cyan-400 mb-1">
                <GraduationCap size={13} />
                <span>Educational Chemistry Insight</span>
              </div>
              <p className="text-[11px]">{getEducationalInsight()}</p>
            </div>

            {/* Chemical Summary */}
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                darkMode ? 'bg-slate-800/40 border-slate-700/60 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                <BookOpen size={13} />
                <span>IUPAC Chemical Summary</span>
              </div>
              <p className="text-[11px]">{currentElement.summary}</p>
            </div>

            {/* Group 1: Atomic & Electronic Structure */}
            <div>
              <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Layers size={12} className="text-cyan-400" />
                <span>Atomic & Electronic Structure</span>
              </h3>

              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[9.5px] text-slate-400 block leading-tight">Atomic Number (Z)</span>
                  <strong className="text-sm font-bold font-mono">{currentElement.number}</strong>
                </div>

                <div className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[9.5px] text-slate-400 block leading-tight">Standard Atomic Weight</span>
                  <strong className="text-sm font-bold font-mono">{currentElement.atomicMass} u</strong>
                </div>

                <div className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[9.5px] text-slate-400 block leading-tight">Orbital Block</span>
                  <strong className="text-xs uppercase font-bold text-indigo-400">{currentElement.block}-block</strong>
                </div>

                <div className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[9.5px] text-slate-400 block leading-tight">Period & Group</span>
                  <strong className="text-xs font-bold">Period {currentElement.period} · Group {currentElement.group}</strong>
                </div>
              </div>
            </div>

            {/* Group 2: Physical & Periodic Metrics */}
            <div>
              <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Sparkles size={12} className="text-indigo-400" />
                <span>Physical & Periodic Metrics</span>
              </h3>

              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[9.5px] text-slate-400 block leading-tight">Atomic Radius</span>
                  <strong className="text-xs font-bold font-mono">
                    {atomicRadius ? `${atomicRadius} pm` : <span className="text-slate-500 font-normal">N/A</span>}
                  </strong>
                </div>

                <div className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[9.5px] text-slate-400 block leading-tight">Electronegativity</span>
                  <strong className="text-xs font-bold font-mono">
                    {currentElement.electronegativity ?? <span className="text-slate-500 font-normal">N/A</span>}
                  </strong>
                </div>

                <div className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[9.5px] text-slate-400 block leading-tight">1st Ionization Energy</span>
                  <strong className="text-xs font-bold font-mono">
                    {currentElement.ionizationEnergy ? `${currentElement.ionizationEnergy} kJ/mol` : <span className="text-slate-500 font-normal">N/A</span>}
                  </strong>
                </div>

                <div className={`p-2 rounded-lg border ${darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[9.5px] text-slate-400 block leading-tight">Density (at STP)</span>
                  <strong className="text-xs font-bold font-mono">
                    {currentElement.density ? `${currentElement.density} g/cm³` : <span className="text-slate-500 font-normal">N/A</span>}
                  </strong>
                </div>
              </div>
            </div>

            {/* Electron Configuration */}
            <div
              className={`p-3 rounded-xl border ${
                darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Electron Configuration
                </span>
                <span className="font-mono text-cyan-400 font-semibold text-xs">
                  {currentElement.electronConfigurationSemantic || currentElement.electronConfiguration}
                </span>
              </div>
              <div className="font-mono text-xs p-2 rounded-lg bg-black/30 border border-white/5 text-purple-300">
                {currentElement.electronConfiguration}
              </div>
            </div>

            {/* Superheavy warning note if element 104+ */}
            {isSuperheavy && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-400" />
                <span>
                  Synthetic superheavy radionuclide. Produced in particle accelerators; half-life is typically under a few minutes. Bulk physical constants have not been measured experimentally.
                </span>
              </div>
            )}

            {/* Slide forward prompt */}
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={nextSlide}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>View Bohr Model</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* SLIDE 1: BOHR MODEL & ELECTRON SHELL DIAGRAM */}
        {activeSlide === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150 flex flex-col items-center">
            <div className="text-center w-full">
              <h3 className="text-sm font-bold text-slate-200 mb-0.5">
                Bohr Atomic Model: {currentElement.name}
              </h3>
              <p className="text-xs text-slate-400">
                Concentric electron shells showing distributed orbiting electrons.
              </p>
            </div>

            <div
              className={`w-full p-2 rounded-xl border flex flex-col items-center justify-center ${
                darkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <BohrModel
                shells={currentElement.shells}
                symbol={currentElement.symbol}
                atomicNumber={currentElement.number}
                categoryColor={cat.color}
                size={160}
              />
            </div>

            <div className="w-full grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2.5 rounded-xl border text-center ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-slate-400 block text-[10px] mb-0.5">Total Shells</span>
                <strong className="text-base text-cyan-400">{currentElement.shells.length}</strong>
              </div>

              <div className={`p-2.5 rounded-xl border text-center ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-slate-400 block text-[10px] mb-0.5">Valence Electrons</span>
                <strong className="text-base text-purple-400">
                  {currentElement.shells[currentElement.shells.length - 1] || 0}
                </strong>
              </div>
            </div>

            {/* Visual Electron Shell Capacity and Subshell Orbital Diagram */}
            <div className="w-full pt-2 border-t border-white/10">
              <ElectronShellDiagram
                shells={currentElement.shells}
                electronConfiguration={currentElement.electronConfiguration}
                symbol={currentElement.symbol}
                atomicNumber={currentElement.number}
                darkMode={darkMode}
              />
            </div>

            <div className="w-full flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={prevSlide}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Overview</span>
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Thermal & State</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* SLIDE 2: THERMAL & STATE */}
        {activeSlide === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Unit Switcher */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Thermal Phase Points
                </h3>
                <span className="text-xs text-slate-400">
                  Simulation: <strong className="text-cyan-400">{Math.round(temperatureKelvin)} K</strong>
                </span>
              </div>

              <div className="flex items-center rounded-lg bg-white/10 p-0.5 text-xs">
                {(['C', 'K', 'F'] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setTempUnit(unit)}
                    className={`px-2 py-0.5 rounded font-bold text-[11px] transition-colors ${
                      tempUnit === unit ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    °{unit === 'K' ? 'K' : unit}
                  </button>
                ))}
              </div>
            </div>

            {/* Melting and Boiling Cards */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 block mb-1">
                  Melting Point
                </span>
                <div className="text-base font-bold font-mono">
                  {currentElement.meltingPointKelvin !== null ? (
                    formatTemp(currentElement.meltingPointKelvin, tempUnit)
                  ) : (
                    <span className="text-slate-500 text-xs font-normal">Unmeasured</span>
                  )}
                </div>
                {currentElement.meltingPointKelvin && (
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">
                    {kelvinToCelsius(currentElement.meltingPointKelvin)} °C / {currentElement.meltingPointKelvin} K
                  </span>
                )}
              </div>

              <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 block mb-1">
                  Boiling Point
                </span>
                <div className="text-base font-bold font-mono">
                  {currentElement.boilingPointKelvin !== null ? (
                    formatTemp(currentElement.boilingPointKelvin, tempUnit)
                  ) : (
                    <span className="text-slate-500 text-xs font-normal">Unmeasured</span>
                  )}
                </div>
                {currentElement.boilingPointKelvin && (
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">
                    {kelvinToCelsius(currentElement.boilingPointKelvin)} °C / {currentElement.boilingPointKelvin} K
                  </span>
                )}
              </div>
            </div>

            {/* Current Phase Badge */}
            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">State at {Math.round(temperatureKelvin)} K:</span>
                <span
                  className="font-bold uppercase tracking-wider px-2 py-0.5 rounded text-[11px]"
                  style={{ backgroundColor: `${stateColor}30`, color: stateColor }}
                >
                  {currentState}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {currentState === 'solid'
                  ? `${currentElement.name} exists in a solid metallic or crystalline lattice structure below its melting point.`
                  : currentState === 'liquid'
                  ? `${currentElement.name} is molten liquid between its melting and boiling points.`
                  : currentState === 'gas'
                  ? `${currentElement.name} is in vaporized gaseous form with free atoms or molecules.`
                  : 'Synthetic radioactive element; standard macroscopic phase properties have not been experimentally measured.'}
              </p>
            </div>

            <div className="w-full flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={prevSlide}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Bohr Model</span>
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Uses & Discovery</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* SLIDE 3: USES & DISCOVERY */}
        {activeSlide === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Discovery Info */}
            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block mb-1">
                Discovery & History
              </span>
              <p className="text-xs font-medium text-slate-200">{currentElement.discoveredBy}</p>
              <div className="mt-1.5 text-[11px] text-slate-400">
                <span>Appearance: <strong className="text-slate-300 capitalize">{currentElement.appearance || 'Not observed directly'}</strong></span>
              </div>
            </div>

            {/* Common Uses */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" />
                <span>Practical Applications</span>
              </h3>

              <div className="space-y-2">
                {currentElement.commonUses && currentElement.commonUses.length > 0 ? (
                  currentElement.commonUses.map((use, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                        darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-slate-200 leading-relaxed">{use}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Currently limited strictly to scientific research in nuclear physics and synthesis of heavier nuclei.
                  </p>
                )}
              </div>
            </div>

            {/* External Wikipedia Link */}
            <div className="pt-1">
              <a
                href={`https://en.wikipedia.org/wiki/${encodeURIComponent(currentElement.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 hover:underline"
              >
                <span>Read detailed peer-reviewed IUPAC page on Wikipedia</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="w-full flex items-center justify-start pt-1">
              <button
                type="button"
                onClick={prevSlide}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Thermal & State</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Slide Indicators */}
      <div
        className={`px-3.5 py-1.5 border-t flex items-center justify-between text-xs shrink-0 ${
          darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-1.5">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goToSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                activeSlide === idx ? 'w-5 bg-cyan-400' : 'w-1.5 bg-slate-600 hover:bg-slate-400'
              }`}
              title={s.title}
            />
          ))}
        </div>

        <div className="text-[10px] text-slate-400">
          Slide {activeSlide + 1}/{slides.length}: <strong className="text-slate-200">{slides[activeSlide].title}</strong>
        </div>
      </div>
    </div>
  );
};
