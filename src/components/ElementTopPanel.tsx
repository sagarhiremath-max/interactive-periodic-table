import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Bookmark,
  Share2,
  Copy,
  Check,
  Scale,
  Sparkles,
  Layers,
  Atom,
  Compass
} from 'lucide-react';
import { type ElementData, CATEGORIES, ELEMENTS_DATA } from '../data/elements';
import { getStateAtTemperature, getStateColor, kelvinToCelsius } from '../utils/helpers';
import { ATOMIC_RADII_PM } from '../data/trends';
import { BohrModel } from './BohrModel';

interface ElementTopPanelProps {
  element: ElementData;
  temperatureKelvin: number;
  darkMode?: boolean;
  isFavorite: boolean;
  onToggleFavorite: (num: number) => void;
  onSelectElement: (element: ElementData) => void;
  onClose: () => void;
  onOpenCompare?: (element: ElementData) => void;
}

// Concise beginner-friendly facts for popular/notable elements
const SIMPLE_FACTS: Record<number, string> = {
  1: "Hydrogen is the lightest, simplest, and most abundant chemical element in the universe, powering stars like our Sun.",
  2: "Helium is an inert noble gas lighter than air with the lowest boiling point of any element; it never freezes under normal pressure.",
  3: "Lithium is the least dense solid metal—so light it floats on water—and powers modern rechargeable smartphones and electric vehicles.",
  4: "Beryllium is an ultra-light, rigid aerospace metal found in emerald gemstones that is transparent to X-rays.",
  5: "Boron is a resilient metalloid that fortifies heat-resistant Pyrex glass and forms the atomic backbone of super-hard ceramics.",
  6: "Carbon forms the universal chemical backbone of all known life on Earth, from soft graphite to ultra-hard sparkling diamonds.",
  7: "Nitrogen makes up roughly 78% of Earth's breathable atmosphere and is essential in agricultural fertilizers and DNA.",
  8: "Oxygen is the most abundant element in the Earth's crust and makes up 21% of our air, sustaining aerobic respiration and combustion.",
  9: "Fluorine is the single most chemically reactive and electronegative element in the entire periodic table.",
  10: "Neon is an unreactive noble gas that glows with a brilliant red-orange radiance when stimulated by electrical discharge.",
  11: "Sodium is an ultra-soft alkali metal that reacts violently with water and combines with chlorine to make everyday table salt.",
  12: "Magnesium burns with a dazzling white flare and serves as the essential catalytic metallic atom inside plant chlorophyll.",
  13: "Aluminium is the most abundant metal in Earth's crust: lightweight, strong, infinitely recyclable, and rust-resistant.",
  14: "Silicon is the second-most abundant crust element and the premier semiconductor powering modern computer microchips.",
  15: "Phosphorus glows eerily in the dark (chemiluminescence) and forms the high-energy ATP bonds that fuel living cells.",
  16: "Sulfur is a vibrant yellow volcanic element vital for vulcanizing rubber and manufacturing sulfuric acid.",
  17: "Chlorine is a dense, yellow-green halogen gas utilized universally to purify drinking water and sanitize swimming pools.",
  18: "Argon is a completely unreactive noble gas extensively used as an inert shield gas in metal welding and double-glazed windows.",
  19: "Potassium is an essential nutrient for cellular nerve transmission that burns with a delicate lilac-violet flame.",
  20: "Calcium is the primary structural mineral strengthening human bones and teeth, and the building block of limestone and cement.",
  22: "Titanium has the highest strength-to-weight ratio of any pure metal and is completely corrosion-resistant in saltwater and bone.",
  26: "Iron is the most common element on Earth by mass, the principal metal of civilization, and the oxygen carrier in red blood cells.",
  29: "Copper was the first metal manipulated by ancient humans and possesses unmatched electrical and thermal conductivity.",
  30: "Zinc provides rustproof galvanic armor for steel structures and is a vital micronutrient for human immune function.",
  47: "Silver possesses the highest electrical conductivity, thermal conductivity, and optical reflectivity of all known metals.",
  76: "Osmium is one of the densest naturally occurring elements—twice as dense as lead—with a distinctive bluish-white luster.",
  77: "Iridium is the most corrosion-resistant metal known and forms the famous boundary layer marking the dinosaur asteroid extinction.",
  78: "Platinum is an exceptionally unreactive precious noble metal indispensable in vehicle catalytic converters and cancer therapies.",
  79: "Gold is the most malleable and non-reactive precious metal in history, resisting tarnish and oxidation for thousands of years.",
  80: "Mercury is the only metallic element that remains a liquid at standard room temperature and pressure.",
  82: "Lead is an extremely dense, soft metal that effectively absorbs hazardous X-rays and gamma radiation.",
  92: "Uranium is a naturally occurring heavy radioactive metal whose fission powers commercial nuclear reactors.",
  94: "Plutonium is a synthetic actinide that powers deep-space probes like Voyager and Mars Curiosity via radioisotope generators.",
};

export const ElementTopPanel: React.FC<ElementTopPanelProps> = ({
  element,
  temperatureKelvin,
  darkMode = true,
  isFavorite,
  onToggleFavorite,
  onSelectElement,
  onClose,
  onOpenCompare,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [expandedTab, setExpandedTab] = useState<'properties' | 'orbitals' | 'uses' | 'bohr'>('properties');

  const cat = CATEGORIES[element.category] || CATEGORIES['unknown'];
  const currentState = getStateAtTemperature(element, temperatureKelvin);
  const stateColor = getStateColor(currentState);

  const prevElement = element.number > 1 ? ELEMENTS_DATA[element.number - 2] : ELEMENTS_DATA[117];
  const nextElement = element.number < 118 ? ELEMENTS_DATA[element.number] : ELEMENTS_DATA[0];

  const atomicRadius = ATOMIC_RADII_PM[element.number];
  const protons = element.number;
  const electrons = element.number;
  const neutrons = Math.round(element.atomicMassValue) - protons;

  // Simple beginner fact
  const simpleFact =
    SIMPLE_FACTS[element.number] ||
    element.summary.split('. ')[0] + '.';

  const handleCopy = () => {
    const text = `${element.name} (${element.symbol})\nAtomic Number: ${element.number}\nAtomic Mass: ${element.atomicMass} u\nCategory: ${element.categoryName}\nPeriod: ${element.period}, Group: ${element.group}, Block: ${element.block.toUpperCase()}-block\nState at STP: ${element.standardState}\nElectron Configuration: ${element.electronConfiguration}`;
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
    <div
      id="selected-element-top-panel"
      className="w-full max-w-[980px] mx-auto rounded-2xl bg-slate-950/95 border border-cyan-500/35 text-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-2xl overflow-hidden font-sans select-none transition-all duration-300"
    >
      {/* Top Category Accent Line */}
      <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: cat.color }} />

      {/* Main Compact Content Card (Height ~180-260px in default view) */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Chemical Symbol Box */}
          <div className="flex items-center gap-4 shrink-0">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center font-black relative overflow-hidden shrink-0 border-2 shadow-xl transition-transform hover:scale-105"
              style={{
                backgroundColor: `${cat.color}20`,
                borderColor: cat.color,
                boxShadow: `0 0 25px ${cat.color}30`
              }}
            >
              <span className="text-[11px] font-mono font-bold leading-none text-slate-300 mb-0.5">
                {element.number}
              </span>
              <span
                className="text-3xl sm:text-4xl font-black leading-none my-0.5 tracking-tight"
                style={{ color: cat.color }}
              >
                {element.symbol}
              </span>
              <span className="text-[10px] font-mono text-slate-400 mt-0.5 truncate max-w-[90%]">
                {element.atomicMass}
              </span>
            </div>

            {/* Title, Category Badges & Quick Stats */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {element.name}
                </h3>
                <span
                  className="px-2.5 py-0.5 text-xs font-bold rounded-full border"
                  style={{
                    backgroundColor: `${cat.color}25`,
                    color: cat.color,
                    borderColor: `${cat.color}50`
                  }}
                >
                  {element.categoryName}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
                  {element.block.toUpperCase()}-block
                </span>
              </div>

              {/* Standard properties row */}
              <div className="flex items-center gap-2.5 text-xs font-mono text-slate-300 flex-wrap">
                <span>
                  Mass: <strong className="text-cyan-300">{element.atomicMass} u</strong>
                </span>
                <span>•</span>
                <span className="capitalize flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stateColor }} />
                  State: <strong className="text-white">{element.standardState}</strong>
                </span>
                <span>•</span>
                <span className="text-slate-400">
                  Period <strong className="text-white">{element.period}</strong> · Group <strong className="text-white">{element.group}</strong>
                </span>
              </div>

              {/* Simple Fact Highlight */}
              <p className="text-xs sm:text-sm text-slate-300 leading-snug line-clamp-2 pt-1 font-sans">
                <span className="text-cyan-400 font-semibold">Key Fact: </span>
                {simpleFact}
              </p>
            </div>
          </div>

          {/* Right: Actions, Navigation & Expand Button */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2.5 shrink-0 self-stretch sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
            {/* Top row: Prev/Next & Close */}
            <div className="flex items-center gap-1.5">
              {/* Previous Element */}
              <button
                type="button"
                onClick={() => onSelectElement(prevElement)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer"
                title={`Previous: #${prevElement.number} ${prevElement.name}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-[11px] font-mono text-slate-400 px-1 hidden md:inline">
                #{element.number} of 118
              </span>

              {/* Next Element */}
              <button
                type="button"
                onClick={() => onSelectElement(nextElement)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer"
                title={`Next: #${nextElement.number} ${nextElement.name}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Favorite */}
              <button
                type="button"
                onClick={() => onToggleFavorite(element.number)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isFavorite
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Bookmark className="w-4 h-4" />
              </button>

              {/* Compare */}
              {onOpenCompare && (
                <button
                  type="button"
                  onClick={() => onOpenCompare(element)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer"
                  title="Compare with another element"
                >
                  <Scale className="w-4 h-4" />
                </button>
              )}

              {/* Copy */}
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer"
                title="Copy element properties"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Share */}
              <button
                type="button"
                onClick={handleShare}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer"
                title="Share link"
              >
                {shareCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 transition-colors cursor-pointer ml-1"
                title="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* View More Details Toggle Button */}
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              <span>{isExpanded ? 'Hide Details' : 'View More Details'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Inline Information Tray (revealed when 'View More Details' is toggled) */}
      {isExpanded && (
        <div className="border-t border-slate-800/80 bg-slate-950/90 p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
          {/* Sub-tabs for clean organization */}
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setExpandedTab('properties')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                expandedTab === 'properties'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Physical Properties</span>
            </button>

            <button
              type="button"
              onClick={() => setExpandedTab('orbitals')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                expandedTab === 'orbitals'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Electron Configuration</span>
            </button>

            <button
              type="button"
              onClick={() => setExpandedTab('uses')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                expandedTab === 'uses'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Applications & Discovery</span>
            </button>

            <button
              type="button"
              onClick={() => setExpandedTab('bohr')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                expandedTab === 'bohr'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              <span>Bohr Model</span>
            </button>
          </div>

          {/* Expanded Tab 1: Physical & Thermal Properties */}
          {expandedTab === 'properties' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-0.5">Melting Point</span>
                <strong className="text-sm text-cyan-300 block">
                  {element.meltingPointKelvin !== null ? (
                    `${kelvinToCelsius(element.meltingPointKelvin)} °C / ${Math.round(element.meltingPointKelvin)} K`
                  ) : (
                    'Not available'
                  )}
                </strong>
                <span className="text-[9px] text-slate-500 block mt-0.5">Phase change point</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-0.5">Boiling Point</span>
                <strong className="text-sm text-rose-300 block">
                  {element.boilingPointKelvin !== null ? (
                    `${kelvinToCelsius(element.boilingPointKelvin)} °C / ${Math.round(element.boilingPointKelvin)} K`
                  ) : (
                    'Not available'
                  )}
                </strong>
                <span className="text-[9px] text-slate-500 block mt-0.5">Vapor transition</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-0.5">Density</span>
                <strong className="text-sm text-white block">
                  {element.density ? `${element.density} g/cm³` : 'Unknown'}
                </strong>
                <span className="text-[9px] text-slate-500 block mt-0.5">Bulk density at STP</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-0.5">Electronegativity</span>
                <strong className="text-sm text-violet-300 block">
                  {element.electronegativity !== null ? element.electronegativity.toFixed(2) : 'Not available'}
                </strong>
                <span className="text-[9px] text-slate-500 block mt-0.5">Pauling scale</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-0.5">Atomic Radius</span>
                <strong className="text-sm text-white block">
                  {atomicRadius ? `${atomicRadius} pm` : 'Not available'}
                </strong>
                <span className="text-[9px] text-slate-500 block mt-0.5">Empirical covalent</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-0.5">1st Ionization Energy</span>
                <strong className="text-sm text-emerald-300 block">
                  {element.ionizationEnergy ? `${element.ionizationEnergy} kJ/mol` : 'Unknown'}
                </strong>
                <span className="text-[9px] text-slate-500 block mt-0.5">Valence electron loss</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-0.5">Subatomic Composition</span>
                <strong className="text-sm text-cyan-300 block">
                  {protons}p⁺ · {neutrons}n⁰ · {electrons}e⁻
                </strong>
                <span className="text-[9px] text-slate-500 block mt-0.5">Neutral atom count</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] text-slate-500 block mb-0.5">Valence Electrons</span>
                <strong className="text-sm text-rose-300 block">
                  {element.shells[element.shells.length - 1]} valence e⁻
                </strong>
                <span className="text-[9px] text-slate-500 block mt-0.5">Outermost energy level</span>
              </div>
            </div>
          )}

          {/* Expanded Tab 2: Electron Configuration & Orbitals */}
          {expandedTab === 'orbitals' && (
            <div className="space-y-3 font-mono text-xs animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Full Electron Configuration</span>
                  <strong className="text-sm text-cyan-300 tracking-wide font-black block mt-0.5">
                    {element.electronConfiguration}
                  </strong>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs self-start sm:self-auto">
                  Shorthand: {element.electronConfigurationSemantic || element.electronConfiguration}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                <span>Principal Shells (K to Q): <strong className="text-white">{element.shells.join(' · ')}</strong></span>
                <span>Valence shell: <strong className="text-rose-400">{element.shells[element.shells.length - 1]} e⁻</strong></span>
              </div>
            </div>
          )}

          {/* Expanded Tab 3: Applications & Discovery History */}
          {expandedTab === 'uses' && (
            <div className="space-y-3 text-xs animate-in fade-in duration-150 font-sans">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between font-mono">
                <span>Discovered By: <strong className="text-white">{element.discoveredBy}</strong></span>
                <span>Appearance: <strong className="text-slate-300">{element.appearance || 'Colorless / Metallic'}</strong></span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1.5">
                  Common Uses & Industrial Applications:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {element.commonUses.map((use, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-2"
                    >
                      <span className="w-4 h-4 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-slate-200 text-xs">{use}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Expanded Tab 4: Interactive Bohr Model */}
          {expandedTab === 'bohr' && (
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col items-center justify-center animate-in fade-in duration-150">
              <BohrModel
                shells={element.shells}
                symbol={element.symbol}
                atomicNumber={element.number}
                categoryColor={cat.color}
                size={220}
                darkMode={darkMode}
              />
              <span className="text-xs font-mono text-slate-400 mt-2">
                Bohr Atomic Model for {element.name} ({element.shells.length} Quantized Shells)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
