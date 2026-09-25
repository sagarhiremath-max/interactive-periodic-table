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
} from 'lucide-react';
import { type ElementData, CATEGORIES, ELEMENTS_DATA } from '../data/elements';
import { BohrModel } from './BohrModel';
import { formatTemp, kelvinToCelsius, getStateAtTemperature, getStateColor } from '../utils/helpers';

interface ElementDetailPanelProps {
  element: ElementData | null;
  darkMode: boolean;
  temperatureKelvin: number;
  onSelectElement: (element: ElementData) => void;
  onAddToCompare?: (element: ElementData) => void;
}

export const ElementDetailPanel: React.FC<ElementDetailPanelProps> = ({
  element,
  darkMode,
  temperatureKelvin,
  onSelectElement,
  onAddToCompare,
}) => {
  // If no element clicked yet, show Hydrogen (#1) by default
  const currentElement = element || ELEMENTS_DATA[0];

  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [tempUnit, setTempUnit] = useState<'C' | 'K' | 'F'>('C');
  const [copied, setCopied] = useState(false);

  const slides = [
    { id: 0, title: 'Overview', icon: BookOpen },
    { id: 1, title: 'Bohr Model', icon: Atom },
    { id: 2, title: 'Thermal', icon: Thermometer },
    { id: 3, title: 'Uses & History', icon: Sparkles },
  ];

  // Reset to overview slide whenever the selected element changes
  useEffect(() => {
    setActiveSlide(0);
  }, [currentElement.number]);

  // Keyboard navigation: Left/Right arrow keys to step through elements
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only navigate if user is not typing in an input
      if (document.activeElement?.tagName === 'INPUT') return;

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

  const handleCopy = () => {
    const text = `${currentElement.name} (${currentElement.symbol}) - Atomic No: ${currentElement.number}, Mass: ${currentElement.atomicMass} u, Category: ${currentElement.categoryName}`;
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

  return (
    <div
      className={`
        w-full rounded-2xl border flex flex-col shadow-xl overflow-hidden transition-all duration-200
        ${
          darkMode
            ? 'bg-slate-900 border-slate-700/80 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }
      `}
      style={{ minHeight: '520px' }}
    >
      {/* Header Banner with Category Accent Gradient */}
      <div
        className="relative px-4 py-2.5 border-b flex items-center justify-between shrink-0"
        style={{
          background: darkMode
            ? `linear-gradient(135deg, ${cat.color}25 0%, rgba(15,23,42,0.95) 100%)`
            : `linear-gradient(135deg, ${cat.color}15 0%, rgba(255,255,255,0.95) 100%)`,
          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        }}
      >
        {/* Left: Atomic Symbol Box & Title */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold shadow-md border relative overflow-hidden shrink-0"
            style={{
              backgroundColor: `${cat.color}25`,
              borderColor: cat.color,
              color: cat.color,
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-[9px] font-mono leading-none opacity-80">{currentElement.number}</span>
            <span className="text-xl font-black leading-none my-0.5">{currentElement.symbol}</span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-base font-bold tracking-tight">{currentElement.name}</h2>
              <span
                className="px-2 py-0.2 rounded-full text-[9px] font-semibold border"
                style={{
                  backgroundColor: `${cat.color}20`,
                  borderColor: `${cat.color}50`,
                  color: cat.color,
                }}
              >
                {currentElement.categoryName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
              <span>{currentElement.atomicMass} u</span>
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
        <div className="flex items-center gap-1.5">
          {onAddToCompare && (
            <button
              onClick={() => onAddToCompare(currentElement)}
              title="Compare this element"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowRightLeft size={16} />
            </button>
          )}

          <button
            onClick={handleCopy}
            title="Copy element info"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
          </button>
        </div>
      </div>

      {/* Quick Element Navigator (Prev / Next) */}
      <div
        className={`flex items-center justify-between px-4 py-2 border-b text-xs shrink-0 ${
          darkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <button
          onClick={() => onSelectElement(prevElement)}
          className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors font-medium"
          title={`Previous: #${prevElement.number} ${prevElement.name}`}
        >
          <ChevronLeft size={16} />
          <span>#{prevElement.number} {prevElement.name}</span>
        </button>

        <span className="text-[11px] text-slate-400 font-mono">
          Element {currentElement.number} of 118
        </span>

        <button
          onClick={() => onSelectElement(nextElement)}
          className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors font-medium"
          title={`Next: #${nextElement.number} ${nextElement.name}`}
        >
          <span>#{nextElement.number} {nextElement.name}</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Slide-wise Navigation Tabs */}
      <div
        className={`flex items-center justify-between px-4 border-b shrink-0 ${
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
                onClick={() => goToSlide(idx)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                    : darkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                }`}
              >
                <Icon size={12} />
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slide Content Area with Smooth Transitions */}
      <div className="flex-1 overflow-y-auto p-3.5 relative min-h-[360px]">
        {/* SLIDE 0: OVERVIEW */}
        {activeSlide === 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
            {/* Chemical Summary */}
            <div
              className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                darkMode ? 'bg-slate-800/40 border-slate-700/60 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[11px] mb-1.5">
                <BookOpen size={14} />
                <span>Chemical Summary</span>
              </div>
              <p>{currentElement.summary}</p>
            </div>

            {/* Fundamental Properties Grid */}
            <div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Layers size={14} />
                <span>Atomic & Physical Properties</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 block">Atomic Number</span>
                  <strong className="text-sm font-bold">{currentElement.number}</strong>
                </div>

                <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 block">Standard Atomic Mass</span>
                  <strong className="text-sm font-bold">{currentElement.atomicMass} u</strong>
                </div>

                <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 block">Block</span>
                  <strong className="text-sm uppercase font-bold">{currentElement.block}-block</strong>
                </div>

                <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 block">Period / Group</span>
                  <strong className="text-sm font-bold">P{currentElement.period} · G{currentElement.group}</strong>
                </div>

                <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 block">Electronegativity (Pauling)</span>
                  <strong className="text-sm font-bold">{currentElement.electronegativity ?? 'N/A'}</strong>
                </div>

                <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 block">Density</span>
                  <strong className="text-sm font-bold">{currentElement.density ? `${currentElement.density} g/cm³` : 'N/A'}</strong>
                </div>

                <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 block">1st Ionization Energy</span>
                  <strong className="text-sm font-bold">{currentElement.ionizationEnergy ? `${currentElement.ionizationEnergy} kJ/mol` : 'N/A'}</strong>
                </div>

                <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] text-slate-400 block">Standard State (STP)</span>
                  <strong className="text-sm capitalize font-bold">{currentElement.standardState}</strong>
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

            {/* Slide forward prompt */}
            <div className="pt-1 flex justify-end">
              <button
                onClick={nextSlide}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>View Bohr Model</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* SLIDE 1: BOHR MODEL */}
        {activeSlide === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200 flex flex-col items-center">
            <div className="text-center w-full">
              <h3 className="text-sm font-bold text-slate-200 mb-0.5">
                Bohr Orbital Atomic Model
              </h3>
              <p className="text-xs text-slate-400">
                Concentric electron shells with orbiting electrons.
              </p>
            </div>

            <div
              className={`w-full p-4 rounded-2xl border flex flex-col items-center justify-center ${
                darkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <BohrModel
                shells={currentElement.shells}
                symbol={currentElement.symbol}
                atomicNumber={currentElement.number}
                categoryColor={cat.color}
                size={195}
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

            <div className="w-full flex items-center justify-between pt-1">
              <button
                onClick={prevSlide}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Overview</span>
              </button>
              <button
                onClick={nextSlide}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Thermal Phase</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* SLIDE 2: THERMAL */}
        {activeSlide === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
            {/* Unit Switcher */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Phase Transition Points
                </h3>
                <span className="text-xs text-slate-400">
                  Simulated: <strong className="text-cyan-400">{Math.round(temperatureKelvin)} K</strong>
                </span>
              </div>

              <div className="flex items-center rounded-lg bg-white/10 p-0.5 text-xs">
                {(['C', 'K', 'F'] as const).map((unit) => (
                  <button
                    key={unit}
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
                  {formatTemp(currentElement.meltingPointKelvin, tempUnit)}
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
                  {formatTemp(currentElement.boilingPointKelvin, tempUnit)}
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
                  ? `${currentElement.name} is in solid crystalline or metallic state below its melting point.`
                  : currentState === 'liquid'
                  ? `${currentElement.name} is molten liquid between its melting and boiling points.`
                  : currentState === 'gas'
                  ? `${currentElement.name} is vaporized into gaseous form above its boiling point.`
                  : 'Radioactive synthetic element with extremely short half-life.'}
              </p>
            </div>

            <div className="w-full flex items-center justify-between pt-1">
              <button
                onClick={prevSlide}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Bohr Model</span>
              </button>
              <button
                onClick={nextSlide}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Uses & History</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* SLIDE 3: USES & HISTORY */}
        {activeSlide === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
            {/* Discovery Info */}
            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block mb-1">
                Discovery & Origin
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
                <span>Real-World Common Uses</span>
              </h3>

              <div className="space-y-2">
                {currentElement.commonUses.map((use, idx) => (
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
                ))}
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
                <span>Read encyclopedic article on Wikipedia</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="w-full flex items-center justify-start pt-1">
              <button
                onClick={prevSlide}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Thermal Phase</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Slide Indicators */}
      <div
        className={`px-5 py-2.5 border-t flex items-center justify-between text-xs shrink-0 ${
          darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-1.5">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => goToSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                activeSlide === idx ? 'w-6 bg-cyan-400' : 'w-1.5 bg-slate-600 hover:bg-slate-400'
              }`}
              title={s.title}
            />
          ))}
        </div>

        <div className="text-[11px] text-slate-400">
          Slide {activeSlide + 1} of {slides.length}: <strong className="text-slate-200">{slides[activeSlide].title}</strong>
        </div>
      </div>
    </div>
  );
};
