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
  Check
} from 'lucide-react';
import { type ElementData, CATEGORIES, ELEMENTS_DATA } from '../data/elements';
import { BohrModel } from './BohrModel';
import { formatTemp, kelvinToCelsius, kelvinToFahrenheit, getStateAtTemperature, getStateColor } from '../utils/helpers';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'bohr' | 'thermal' | 'applications'>('overview');
  const [tempUnit, setTempUnit] = useState<'C' | 'K' | 'F'>('C');
  const [copied, setCopied] = useState(false);

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

  const handleCopy = () => {
    const text = `${element.name} (${element.symbol}) - Atomic Number: ${element.number}, Mass: ${element.atomicMass} u, Category: ${element.categoryName}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto backdrop-blur-md bg-black/60 transition-opacity">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div
        className={`
          relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border
          ${
            darkMode
              ? 'bg-slate-900 border-slate-700/80 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }
        `}
      >
        {/* Top Header Banner with Category Accent */}
        <div
          className="relative px-5 py-4 sm:px-6 sm:py-5 border-b flex items-center justify-between"
          style={{
            background: darkMode
              ? `linear-gradient(135deg, ${cat.color}22 0%, rgba(15,23,42,0.9) 100%)`
              : `linear-gradient(135deg, ${cat.color}15 0%, rgba(255,255,255,0.9) 100%)`,
            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          }}
        >
          {/* Left: Atomic Number, Symbol, Name */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center font-bold shadow-md border"
              style={{
                backgroundColor: `${cat.color}25`,
                borderColor: cat.color,
                color: cat.color,
              }}
            >
              <span className="text-[11px] font-mono leading-none opacity-80">{element.number}</span>
              <span className="text-2xl sm:text-3xl font-extrabold leading-none my-0.5">
                {element.symbol}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{element.name}</h2>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border"
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
                    backgroundColor: `${stateColor}20`,
                    color: stateColor,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stateColor }} />
                  {currentState}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 text-xs text-slate-400 mt-1 flex-wrap">
                <span>Standard Mass: <strong className="text-slate-200">{element.atomicMass} u</strong></span>
                <span>•</span>
                <span>Period <strong className="text-slate-200">{element.period}</strong></span>
                <span>•</span>
                <span>Group <strong className="text-slate-200">{element.group}</strong></span>
                <span>•</span>
                <span><strong className="text-slate-200 uppercase">{element.block}</strong>-block</span>
              </div>
            </div>
          </div>

          {/* Right: Actions & Close */}
          <div className="flex items-center gap-2">
            {onAddToCompare && (
              <button
                onClick={() => onAddToCompare(element)}
                title="Compare this element"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-slate-200 transition-colors border border-white/10"
              >
                <ArrowRightLeft size={14} />
                <span>Compare</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              title="Copy element info"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors border border-white/10"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Share2 size={16} />}
            </button>

            <button
              onClick={onClose}
              title="Close (Esc)"
              className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-colors border border-white/10 ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation bar: Prev / Next Element */}
        <div
          className={`flex items-center justify-between px-6 py-2 text-xs border-b ${
            darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            onClick={() => onSelectElement(prevElement)}
            className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>#{prevElement.number} {prevElement.name} ({prevElement.symbol})</span>
          </button>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Use keyboard <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">←</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">→</kbd> to browse
          </span>

          <button
            onClick={() => onSelectElement(nextElement)}
            className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <span>#{nextElement.number} {nextElement.name} ({nextElement.symbol})</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className={`flex items-center px-6 border-b overflow-x-auto gap-4 sm:gap-6 ${
            darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-100/50'
          }`}
        >
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={16} />
            <span>Overview & Properties</span>
          </button>

          <button
            onClick={() => setActiveTab('bohr')}
            className={`py-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'bohr'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Atom size={16} />
            <span>Bohr Atomic Model</span>
          </button>

          <button
            onClick={() => setActiveTab('thermal')}
            className={`py-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'thermal'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Thermometer size={16} />
            <span>Thermal & Phase</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'applications'
                ? 'border-cyan-400 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={16} />
            <span>Applications & Uses</span>
          </button>
        </div>

        {/* Tab Body Content with Smooth Scroll */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary quote */}
              <div
                className={`p-4 rounded-xl border leading-relaxed text-sm ${
                  darkMode
                    ? 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <h4 className="text-xs uppercase font-bold tracking-wider text-cyan-400 mb-1">
                  Chemical Description
                </h4>
                <p>{element.summary}</p>
              </div>

              {/* Key properties grid */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Layers size={16} />
                  <span>Fundamental Properties</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
                  <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-xs text-slate-400 block">Atomic Number</span>
                    <span className="font-semibold text-base">{element.number}</span>
                  </div>

                  <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-xs text-slate-400 block">Relative Atomic Mass</span>
                    <span className="font-semibold text-base">{element.atomicMass} u</span>
                  </div>

                  <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-xs text-slate-400 block">Block</span>
                    <span className="font-semibold text-base uppercase">{element.block}-block</span>
                  </div>

                  <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-xs text-slate-400 block">Period / Group</span>
                    <span className="font-semibold text-base">P {element.period} / G {element.group}</span>
                  </div>

                  <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-xs text-slate-400 block">Standard State (STP)</span>
                    <span className="font-semibold text-base capitalize">{element.standardState}</span>
                  </div>

                  <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-xs text-slate-400 block">Density</span>
                    <span className="font-semibold text-base">
                      {element.density !== null ? `${element.density} g/cm³` : 'Unknown'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-xs text-slate-400 block">Electronegativity (Pauling)</span>
                    <span className="font-semibold text-base">
                      {element.electronegativity !== null ? element.electronegativity : 'N/A'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-xs text-slate-400 block">First Ionization Energy</span>
                    <span className="font-semibold text-base">
                      {element.ionizationEnergy !== null ? `${element.ionizationEnergy} kJ/mol` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Electron Configuration Box */}
              <div
                className={`p-4 rounded-xl border ${
                  darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                    Electron Configuration
                  </span>
                  <span className="text-xs font-mono text-cyan-400">
                    {element.electronConfigurationSemantic || element.electronConfiguration}
                  </span>
                </div>
                <div className="font-mono text-sm sm:text-base p-2.5 rounded-lg bg-black/30 border border-white/5 text-purple-300">
                  {element.electronConfiguration}
                </div>
              </div>

              {/* Discovery & Appearance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Discovery
                  </span>
                  <p className="font-medium text-slate-200">{element.discoveredBy}</p>
                </div>

                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Appearance
                  </span>
                  <p className="font-medium text-slate-200 capitalize">
                    {element.appearance || 'Not observed directly / theoretical'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOHR MODEL */}
          {activeTab === 'bohr' && (
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="text-center max-w-lg">
                <h3 className="text-base font-bold text-slate-200 mb-1">
                  Bohr Orbital Atomic Model
                </h3>
                <p className="text-xs text-slate-400">
                  Visual representation of concentric electron shells (K, L, M, N, O, P, Q) with orbiting electrons.
                </p>
              </div>

              <div
                className={`p-6 rounded-2xl border flex flex-col items-center justify-center ${
                  darkMode ? 'bg-slate-950/60 border-slate-800 shadow-inner' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <BohrModel
                  shells={element.shells}
                  symbol={element.symbol}
                  atomicNumber={element.number}
                  categoryColor={cat.color}
                  size={300}
                />
              </div>

              <div className="w-full max-w-md grid grid-cols-2 gap-3 text-xs">
                <div className={`p-3 rounded-xl border text-center ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block mb-0.5">Total Shells</span>
                  <strong className="text-sm text-cyan-400">{element.shells.length}</strong>
                </div>

                <div className={`p-3 rounded-xl border text-center ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block mb-0.5">Valence (Outer) Electrons</span>
                  <strong className="text-sm text-purple-400">
                    {element.shells[element.shells.length - 1] || 0}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THERMAL & PHASE */}
          {activeTab === 'thermal' && (
            <div className="space-y-6">
              {/* Unit Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Phase Transition Points
                  </h3>
                  <span className="text-xs text-slate-400">
                    Current simulated temperature: <strong className="text-cyan-400">{Math.round(temperatureKelvin)} K ({Math.round(temperatureKelvin - 273.15)}°C)</strong>
                  </span>
                </div>

                <div className="flex items-center rounded-lg bg-white/10 p-0.5 text-xs">
                  <button
                    onClick={() => setTempUnit('C')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      tempUnit === 'C' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    °C
                  </button>
                  <button
                    onClick={() => setTempUnit('K')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      tempUnit === 'K' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    K
                  </button>
                  <button
                    onClick={() => setTempUnit('F')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                      tempUnit === 'F' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    °F
                  </button>
                </div>
              </div>

              {/* Thermal Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-blue-400 flex items-center gap-1.5">
                      <Thermometer size={14} />
                      Melting Point
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Solid ➔ Liquid</span>
                  </div>
                  <div className="text-2xl font-bold font-mono">
                    {formatTemp(element.meltingPointKelvin, tempUnit)}
                  </div>
                  {element.meltingPointKelvin && (
                    <div className="text-xs text-slate-400 mt-1 font-mono">
                      {element.meltingPointKelvin} K / {kelvinToCelsius(element.meltingPointKelvin)} °C / {kelvinToFahrenheit(element.meltingPointKelvin)} °F
                    </div>
                  )}
                </div>

                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1.5">
                      <Thermometer size={14} />
                      Boiling Point
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Liquid ➔ Gas</span>
                  </div>
                  <div className="text-2xl font-bold font-mono">
                    {formatTemp(element.boilingPointKelvin, tempUnit)}
                  </div>
                  {element.boilingPointKelvin && (
                    <div className="text-xs text-slate-400 mt-1 font-mono">
                      {element.boilingPointKelvin} K / {kelvinToCelsius(element.boilingPointKelvin)} °C / {kelvinToFahrenheit(element.boilingPointKelvin)} °F
                    </div>
                  )}
                </div>
              </div>

              {/* Phase progress line */}
              <div
                className={`p-4 rounded-xl border ${
                  darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300">Phase at Current Temperature ({Math.round(temperatureKelvin)} K):</span>
                  <span
                    className="font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${stateColor}30`, color: stateColor }}
                  >
                    {currentState}
                  </span>
                </div>

                {element.meltingPointKelvin && element.boilingPointKelvin ? (
                  <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden flex relative mt-2">
                    {/* Melting and Boiling zones */}
                    <div
                      className="bg-slate-500 h-full"
                      style={{
                        width: `${Math.min(100, Math.max(0, (element.meltingPointKelvin / 4000) * 100))}%`,
                      }}
                      title="Solid phase"
                    />
                    <div
                      className="bg-sky-400 h-full"
                      style={{
                        width: `${Math.min(100, Math.max(0, ((element.boilingPointKelvin - element.meltingPointKelvin) / 4000) * 100))}%`,
                      }}
                      title="Liquid phase"
                    />
                    <div
                      className="bg-rose-400 flex-1 h-full"
                      title="Gas phase"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">
                    Superheavy or highly unstable radioactive element; precise bulk thermal points are not directly measured.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: COMMON USES & APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <span>Real-World Common Uses & Applications</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Where {element.name} is utilized in modern industry, science, medicine, and consumer technologies.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {element.commonUses.map((use, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                        darkMode
                          ? 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium leading-relaxed">{use}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wikipedia Link */}
              <div className="pt-2">
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
