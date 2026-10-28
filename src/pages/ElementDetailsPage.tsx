import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
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
  ShieldAlert,
  Flame,
  Radio,
  FileText,
  Activity,
  Compass,
  Zap,
  Globe,
  Database
} from 'lucide-react';
import { type ElementData, CATEGORIES, ELEMENTS_DATA } from '../data/elements';
import { BohrModel } from '../components/BohrModel';
import { ElectronShellDiagram } from '../components/ElectronShellDiagram';
import { formatTemp, kelvinToCelsius, getStateAtTemperature, getStateColor } from '../utils/helpers';
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

interface ElementDetailsPageProps {
  darkMode?: boolean;
  onOpenCompare?: (el1: ElementData, el2: ElementData) => void;
}

export const ElementDetailsPage: React.FC<ElementDetailsPageProps> = ({
  darkMode = true,
  onOpenCompare
}) => {
  const { atomicNumber } = useParams<{ atomicNumber: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Find element by atomic number, symbol, or name/slug
  const currentElement = ELEMENTS_DATA.find((el) => {
    if (!atomicNumber) return false;
    const cleanParam = atomicNumber.trim().toLowerCase();
    return (
      String(el.number) === cleanParam ||
      el.symbol.toLowerCase() === cleanParam ||
      el.name.toLowerCase() === cleanParam
    );
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'bohr' | 'orbitals' | 'thermal' | 'additional'>('overview');
  const [tempUnit, setTempUnit] = useState<'C' | 'K' | 'F'>('C');
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [temperatureKelvin, setTemperatureKelvin] = useState<number>(293.15);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [atomicNumber]);

  // Keyboard navigation: Left/Right arrows for neighbor elements, Escape for Back
  useEffect(() => {
    if (!currentElement) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT') return;

      if (e.key === 'ArrowLeft') {
        const prevNum = currentElement.number > 1 ? currentElement.number - 1 : 118;
        navigate(`/element/${prevNum}`);
      } else if (e.key === 'ArrowRight') {
        const nextNum = currentElement.number < 118 ? currentElement.number + 1 : 1;
        navigate(`/element/${nextNum}`);
      } else if (e.key === 'Escape') {
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentElement, navigate]);

  if (!currentElement) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6 shadow-[0_0_24px_rgba(244,63,94,0.2)]">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
          Element Not Found
        </h1>
        <p className="text-slate-400 max-w-md text-sm mb-6 leading-relaxed">
          No chemical element with identification "{atomicNumber}" exists in the standard IUPAC periodic table (valid atomic numbers are 1 through 118).
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400 transition-all shadow-[0_0_16px_rgba(6,182,212,0.3)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Periodic Table</span>
          </Link>
          <Link
            to="/element/1"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:bg-slate-700 font-bold text-sm transition-all"
          >
            <span>Explore #1 Hydrogen</span>
          </Link>
        </div>
      </div>
    );
  }

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

  // Enriched scientific metadata
  const casNumber = getElementCAS(currentElement.number);
  const etymology = getElementEtymology(currentElement.number);
  const abundance = getElementAbundance(currentElement.number);
  const oxidationStates = getElementOxidationStates(currentElement.number);
  const thermalCond = getElementThermalConductivity(currentElement.number);
  const electricalCond = getElementElectricalConductivity(currentElement.number);
  const isotopes = getElementIsotopes(currentElement.number, currentElement.symbol);
  const safety = getElementSafety(currentElement.number, currentElement.category, isSuperheavy);
  const orbitalBoxes = getAufbauOrbitalDiagram(currentElement.number);

  const handleCopy = () => {
    const text = `${currentElement.name} (${currentElement.symbol})\nAtomic Number: ${currentElement.number}\nAtomic Mass: ${currentElement.atomicMass} u\nCategory: ${currentElement.categoryName}\nPeriod: ${currentElement.period}, Group: ${currentElement.group}, Block: ${currentElement.block.toUpperCase()}-block\nCAS Registry: ${casNumber ?? 'Not assigned'}\nStandard State: ${currentElement.standardState}\nDensity: ${currentElement.density ? `${currentElement.density} g/cm³` : 'N/A'}\nMelting Point: ${currentElement.meltingPointKelvin ? `${Math.round(currentElement.meltingPointKelvin)} K` : 'N/A'}\nBoiling Point: ${currentElement.boilingPointKelvin ? `${Math.round(currentElement.boilingPointKelvin)} K` : 'N/A'}\nElectron Configuration: ${currentElement.electronConfiguration}\nOxidation States: ${oxidationStates.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BookOpen },
    { id: 'bohr' as const, label: 'Bohr Model', icon: Atom },
    { id: 'orbitals' as const, label: 'Electron Orbitals', icon: Layers },
    { id: 'thermal' as const, label: 'Thermal & Physical', icon: Thermometer },
    { id: 'additional' as const, label: 'Isotopes & Safety', icon: ShieldAlert },
  ];

  return (
    <div className="w-full max-w-[1580px] mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6 font-sans select-none animate-in fade-in duration-300">
      {/* 1. Top Navigation Bar: Back button, Quick Breadcrumbs, and Prev/Next Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-cyan-400 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-xs font-bold transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Periodic Table</span>
          </Link>

          <span className="text-slate-600 hidden sm:inline">|</span>

          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Element <strong className="text-white">#{currentElement.number}</strong> of 118
          </span>
        </div>

        {/* Previous & Next Element Shortcuts */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => navigate(`/element/${prevElement.number}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/30 transition-all cursor-pointer"
            title={`Previous: #${prevElement.number} ${prevElement.name}`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>#{prevElement.number} {prevElement.symbol}</span>
            <span className="text-slate-500 hidden md:inline">({prevElement.name})</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/element/${nextElement.number}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/30 transition-all cursor-pointer"
            title={`Next: #${nextElement.number} ${nextElement.name}`}
          >
            <span>#{nextElement.number} {nextElement.symbol}</span>
            <span className="text-slate-500 hidden md:inline">({nextElement.name})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Primary Element Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950/80 border border-cyan-500/30 text-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        {/* Top category accent stripe */}
        <div className="h-2 w-full" style={{ backgroundColor: cat.color }} />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Huge Chemical Element Identity Badge */}
            <div className="flex items-start sm:items-center gap-5 sm:gap-7">
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex flex-col items-center justify-center font-black relative overflow-hidden shrink-0 border-2 shadow-2xl transition-transform hover:scale-105"
                style={{
                  backgroundColor: `${cat.color}20`,
                  borderColor: cat.color,
                  boxShadow: `0 0 30px ${cat.color}25`
                }}
              >
                <span className="text-xs font-mono font-bold leading-none text-slate-300 mb-1">
                  {currentElement.number}
                </span>
                <span
                  className="text-4xl sm:text-5xl font-black leading-none my-0.5 tracking-tight"
                  style={{ color: cat.color }}
                >
                  {currentElement.symbol}
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1 truncate max-w-[90%]">
                  {currentElement.atomicMass}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    {currentElement.name}
                  </h1>
                  <span
                    className="px-3 py-1 text-xs font-bold rounded-full border"
                    style={{
                      backgroundColor: `${cat.color}25`,
                      color: cat.color,
                      borderColor: `${cat.color}50`
                    }}
                  >
                    {currentElement.categoryName}
                  </span>

                  {isSuperheavy ? (
                    <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300">
                      Superheavy
                    </span>
                  ) : isSynthetic ? (
                    <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300">
                      Synthetic
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                      Natural
                    </span>
                  )}
                </div>

                {/* Subtitle properties line */}
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 flex-wrap font-mono">
                  <span className="font-bold text-cyan-300">
                    Standard Weight: {currentElement.atomicMass} u
                  </span>
                  <span>•</span>
                  <span className="capitalize flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stateColor }} />
                    State at STP: <strong className="text-white">{currentElement.standardState}</strong>
                  </span>
                  <span>•</span>
                  <span className="text-slate-400">
                    Period <strong className="text-white">{currentElement.period}</strong> · Group <strong className="text-white">{currentElement.group}</strong> · <strong className="text-cyan-400">{currentElement.block.toUpperCase()}</strong>-block
                  </span>
                </div>

                {/* CAS registry & Discovery snippet */}
                <div className="flex items-center gap-4 text-xs text-slate-400 font-mono pt-1">
                  <span>CAS: <strong className="text-slate-200">{casNumber || 'None / Not assigned'}</strong></span>
                  <span>•</span>
                  <span>Discovered: <strong className="text-slate-200">{currentElement.discoveredBy}</strong></span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex items-center gap-2 self-start lg:self-center">
              <button
                type="button"
                onClick={() => toggleFavorite(currentElement.number)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2 text-xs font-bold ${
                  isFavorite(currentElement.number)
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_16px_rgba(251,191,36,0.3)]'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
                title="Toggle Favorite Element"
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">{isFavorite(currentElement.number) ? 'Favorited' : 'Favorite'}</span>
              </button>

              {onOpenCompare && (
                <button
                  type="button"
                  onClick={() => onOpenCompare(currentElement, ELEMENTS_DATA[5])}
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
                  title="Compare with another element"
                >
                  <Scale className="w-4 h-4" />
                  <span className="hidden sm:inline">Compare</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopy}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
                title="Copy element data"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
                title="Share link to this element page"
              >
                {shareCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{shareCopied ? 'Link Copied' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Navigation Tabs Bar */}
        <div className="flex items-center gap-2 px-6 py-3 border-t border-slate-800/80 bg-slate-900/40 overflow-x-auto scrollbar-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_16px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/70'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tab Contents */}
      <div className="space-y-6">
        {/* TAB A: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Grid: Chemical Description & Subatomic Particle Composition */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Chemical Description */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase mb-3">
                    <BookOpen className="w-4 h-4" />
                    <span>Chemical Description & Profile</span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                    {currentElement.summary}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Physical Appearance: <strong className="text-slate-200">{currentElement.appearance || 'Colorless / Metallic'}</strong></span>
                  <span>Crystal Structure: <strong className="text-slate-200">{currentElement.block === 's' ? 'BCC' : currentElement.block === 'd' ? 'HCP / FCC' : 'Various'}</strong></span>
                </div>
              </div>

              {/* Subatomic Particle Distribution */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
                  <Atom className="w-4 h-4" />
                  <span>Subatomic Particles (Neutral Atom)</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                      Protons (p⁺)
                    </span>
                    <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
                      {protons}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                      Charge +{protons}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                      Neutrons (n⁰)
                    </span>
                    <span className="text-2xl sm:text-3xl font-black font-mono text-violet-400">
                      {neutrons >= 0 ? neutrons : '—'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                      A − Z
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                      Electrons (e⁻)
                    </span>
                    <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                      {electrons}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                      {currentElement.shells.length} Shells
                    </span>
                  </div>
                </div>

                {/* Valence and Shells quick bar */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono flex items-center justify-between text-slate-300">
                  <span>Valence Electrons: <strong className="text-rose-400">{currentElement.shells[currentElement.shells.length - 1]}</strong></span>
                  <span>Shells: <strong className="text-cyan-300">{currentElement.shells.join(' · ')}</strong></span>
                </div>
              </div>
            </div>

            {/* Middle Grid: Name Origin & Etymology + Natural Abundance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Etymology / Name Origin */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-violet-400 font-bold uppercase">
                  <Compass className="w-4 h-4" />
                  <span>Name Origin & Etymology</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {etymology}
                </p>
                <div className="pt-2 text-xs font-mono text-slate-400 flex items-center gap-2">
                  <span>Symbol: <strong className="text-cyan-300">{currentElement.symbol}</strong></span>
                  <span>•</span>
                  <span>Discovered by: <strong className="text-slate-200">{currentElement.discoveredBy}</strong></span>
                </div>
              </div>

              {/* Natural Occurrence & Abundance */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
                  <Globe className="w-4 h-4" />
                  <span>Natural Occurrence & Abundance</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block mb-0.5">Universe</span>
                    <strong className="text-white text-xs block">{abundance.universe}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block mb-0.5">Earth's Crust</span>
                    <strong className="text-cyan-300 text-xs block">{abundance.crust}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block mb-0.5">Oceans</span>
                    <strong className="text-white text-xs block">{abundance.ocean}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block mb-0.5">Human Body</span>
                    <strong className="text-emerald-300 text-xs block">{abundance.human}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Practical Applications and Common Uses */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Common Industrial & Scientific Applications</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {currentElement.commonUses && currentElement.commonUses.length > 0 ? (
                  currentElement.commonUses.map((use, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3 text-xs"
                    >
                      <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-500/30">
                        {idx + 1}
                      </span>
                      <span className="text-slate-200 leading-snug font-medium pt-0.5">{use}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic col-span-full">
                    Currently limited primarily to nuclear physics research, heavy ion bombardment experiments, and nuclear synthesis.
                  </p>
                )}
              </div>
            </div>

            {/* Quick Properties Matrix Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">Atomic Radius</span>
                <strong className="text-lg text-white block">
                  {atomicRadius ? `${atomicRadius} pm` : 'Unknown'}
                </strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">Empirical radius</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">Electronegativity</span>
                <strong className="text-lg text-cyan-300 block">
                  {currentElement.electronegativity !== null ? currentElement.electronegativity.toFixed(2) : 'Not available'}
                </strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">Pauling scale</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">1st Ionization Energy</span>
                <strong className="text-lg text-violet-300 block">
                  {currentElement.ionizationEnergy ? `${currentElement.ionizationEnergy} kJ/mol` : 'Unknown'}
                </strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">Valence electron removal</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">Density at STP</span>
                <strong className="text-lg text-emerald-300 block">
                  {currentElement.density ? `${currentElement.density} g/cm³` : 'Not available'}
                </strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">Standard conditions</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: BOHR MODEL */}
        {activeTab === 'bohr' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
              <div className="flex flex-col lg:flex-row items-center gap-8 justify-around">
                {/* Interactive Animated Bohr Model */}
                <div className="flex flex-col items-center">
                  <div className="p-8 rounded-3xl bg-slate-950/80 border border-slate-800/80 shadow-[0_0_50px_rgba(6,182,212,0.1)] flex items-center justify-center">
                    <BohrModel
                      shells={currentElement.shells}
                      symbol={currentElement.symbol}
                      atomicNumber={currentElement.number}
                      categoryColor={cat.color}
                      size={320}
                      darkMode={darkMode}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-400 mt-3 text-center">
                    Interactive Bohr model for {currentElement.name} (Z={currentElement.number})
                  </span>
                </div>

                {/* Bohr Shells Explanation & Table */}
                <div className="max-w-xl w-full space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <Atom className="w-5 h-5 text-cyan-400" />
                      <span>Quantized Electron Shell Occupancies</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      In the Bohr model, electrons occupy quantized orbital rings labeled K through Q corresponding to principal quantum numbers n=1 through {currentElement.shells.length}.
                    </p>
                  </div>

                  <div className="space-y-2 font-mono">
                    {currentElement.shells.map((count, idx) => {
                      const shellNames = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
                      const shellLetter = shellNames[idx] || `S${idx + 1}`;
                      const maxCapacity = 2 * Math.pow(idx + 1, 2);
                      const isValence = idx === currentElement.shells.length - 1;

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                            isValence
                              ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                              : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-slate-800 font-bold flex items-center justify-center text-white text-xs border border-slate-700">
                              {shellLetter}
                            </span>
                            <div>
                              <strong className="text-white block">Shell {idx + 1} ({shellLetter}-shell)</strong>
                              <span className="text-[10px] text-slate-400">Principal Quantum Number n = {idx + 1}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-sm text-white">
                              {count} <span className="text-[10px] text-slate-400 font-normal">/ {maxCapacity} e⁻</span>
                            </span>
                            {isValence && (
                              <span className="block text-[9px] uppercase tracking-wider text-rose-400 font-bold">
                                Valence Shell
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="font-bold text-white block">Total Electrons: {electrons}</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Valence electrons in outermost shell: <strong className="text-rose-400">{currentElement.shells[currentElement.shells.length - 1]}</strong>. These outermost electrons govern chemical valence, electronegativity, and bonding geometries.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB C: ELECTRON CONFIGURATION & ORBITALS */}
        {activeTab === 'orbitals' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Electron Configuration Banner */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl font-mono space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-cyan-400">
                  <Layers className="w-4 h-4" />
                  <span>Electron Configuration</span>
                </div>
                <span className="px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold self-start sm:self-auto">
                  Noble Gas Shorthand: {currentElement.electronConfigurationSemantic || currentElement.electronConfiguration}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-black text-sm sm:text-base tracking-wide overflow-x-auto">
                {currentElement.electronConfiguration}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Valence Shell Count: <strong className="text-white">{currentElement.shells[currentElement.shells.length - 1]}</strong> electrons</span>
                <span>Block classification: <strong className="text-cyan-300">{currentElement.block.toUpperCase()}-block</strong></span>
              </div>
            </div>

            {/* Visual Orbital Occupancy Diagram (Aufbau & Hund's Rule Box Representation) */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-violet-400" />
                    <span>Aufbau Subshell Orbital Diagram & Spin Alignment</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Depicting degenerate orbitals and electron spins (↑ spin-up +½, ↓ spin-down −½) according to Hund's rule and Pauli exclusion.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-cyan-400" /> Full (2 e⁻)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-400" /> Half-filled (1 e⁻)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700" /> Empty</span>
                </div>
              </div>

              {/* Subshell boxes grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 font-mono">
                {orbitalBoxes.map((sub, sIdx) => {
                  return (
                    <div
                      key={sIdx}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white text-sm">{sub.name}</span>
                        <span className="text-[11px] text-cyan-300 font-bold">
                          {sub.electrons} / {sub.capacity} e⁻
                        </span>
                      </div>

                      {/* Boxes */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {sub.boxes.map((box, bIdx) => {
                          const isFull = box.electrons === 2;
                          const isHalf = box.electrons === 1;
                          return (
                            <div
                              key={bIdx}
                              className={`h-9 flex-1 rounded-lg border flex items-center justify-center font-bold text-xs gap-0.5 shadow-sm ${
                                isFull
                                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                                  : isHalf
                                  ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-600'
                              }`}
                              title={`Orbital box ${bIdx + 1}: ${box.electrons} electrons`}
                            >
                              {box.spinUp && <span>↑</span>}
                              {box.spinDown && <span>↓</span>}
                              {box.electrons === 0 && <span className="text-slate-700">•</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Electron Shell Diagram Component */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
              <ElectronShellDiagram
                shells={currentElement.shells}
                electronConfiguration={currentElement.electronConfiguration}
                symbol={currentElement.symbol}
                atomicNumber={currentElement.number}
                darkMode={darkMode}
              />
            </div>
          </div>
        )}

        {/* TAB D: THERMAL & PHYSICAL PROPERTIES */}
        {activeTab === 'thermal' && (
          <div className="space-y-6 animate-in fade-in duration-200 font-mono">
            {/* Unit Switcher & Temperature Overview Bar */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-rose-400" />
                  <span>Thermodynamic Phase Points & Physical Properties</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Standard state at 293.15 K (20 °C): <strong className="text-cyan-300 capitalize">{currentElement.standardState}</strong>
                </span>
              </div>

              {/* Unit Toggle Buttons */}
              <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1 self-start sm:self-auto">
                {(['C', 'K', 'F'] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setTempUnit(unit)}
                    className={`px-3.5 py-1.5 font-bold text-xs rounded-lg transition-all cursor-pointer ${
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

            {/* Interactive Temperature Simulation Bar */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Simulate Temp:</span>
                <strong className="text-cyan-300 text-sm">
                  {Math.round(temperatureKelvin)} K ({Math.round(kelvinToCelsius(temperatureKelvin) ?? 0)} °C)
                </strong>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: `${stateColor}40`, border: `1px solid ${stateColor}` }}
                >
                  {currentState}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-72">
                <span className="text-[10px] text-slate-500">0 K</span>
                <input
                  type="range"
                  min="0"
                  max="6000"
                  step="10"
                  value={temperatureKelvin}
                  onChange={(e) => setTemperatureKelvin(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                  title="Adjust temperature to observe state transitions"
                />
                <span className="text-[10px] text-slate-500">6000 K</span>
                <button
                  type="button"
                  onClick={() => setTemperatureKelvin(293.15)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 hover:text-white shrink-0 cursor-pointer"
                  title="Reset to room temperature (20 °C)"
                >
                  20°C
                </button>
              </div>
            </div>

            {/* Melting Point & Boiling Point Big Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-cyan-400 uppercase tracking-wider">
                    Melting Point
                  </span>
                  <Flame className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white my-2">
                  {currentElement.meltingPointKelvin !== null ? (
                    formatTemp(currentElement.meltingPointKelvin, tempUnit)
                  ) : (
                    <span className="text-slate-500 text-xl font-normal">Not available</span>
                  )}
                </div>
                {currentElement.meltingPointKelvin ? (
                  <span className="text-xs text-slate-400 block">
                    {kelvinToCelsius(currentElement.meltingPointKelvin)} °C / {currentElement.meltingPointKelvin} K
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 block">
                    {isSuperheavy ? 'Synthetic short-lived nuclide' : 'Unknown / Not experimentally observed'}
                  </span>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-rose-400 uppercase tracking-wider">
                    Boiling Point
                  </span>
                  <Zap className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white my-2">
                  {currentElement.boilingPointKelvin !== null ? (
                    formatTemp(currentElement.boilingPointKelvin, tempUnit)
                  ) : (
                    <span className="text-slate-500 text-xl font-normal">Not available</span>
                  )}
                </div>
                {currentElement.boilingPointKelvin ? (
                  <span className="text-xs text-slate-400 block">
                    {kelvinToCelsius(currentElement.boilingPointKelvin)} °C / {currentElement.boilingPointKelvin} K
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 block">
                    {isSuperheavy ? 'Synthetic short-lived nuclide' : 'Unknown / Not experimentally observed'}
                  </span>
                )}
              </div>
            </div>

            {/* Comprehensive Thermal & Physical Properties Table */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Physical, Thermal & Electrical Constants
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">Density</span>
                  <strong className="text-base text-white block">
                    {currentElement.density !== null ? `${currentElement.density} g/cm³` : 'Unknown / Not available'}
                  </strong>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Bulk density at STP</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">Atomic Radius</span>
                  <strong className="text-base text-cyan-300 block">
                    {atomicRadius ? `${atomicRadius} pm` : 'Not available'}
                  </strong>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Empirical covalent radius</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">Electronegativity</span>
                  <strong className="text-base text-violet-300 block">
                    {currentElement.electronegativity !== null ? currentElement.electronegativity.toFixed(2) : 'Not available'}
                  </strong>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Pauling scale</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">1st Ionization Energy</span>
                  <strong className="text-base text-emerald-300 block">
                    {currentElement.ionizationEnergy ? `${currentElement.ionizationEnergy} kJ/mol` : 'Not available'}
                  </strong>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Energy to remove 1st electron</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">Thermal Conductivity</span>
                  <strong className="text-base text-white block">
                    {thermalCond !== null ? `${thermalCond} W/(m·K)` : 'Not available'}
                  </strong>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Heat transfer rate at 300 K</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">Electrical Conductivity</span>
                  <strong className="text-base text-cyan-300 block">
                    {electricalCond || 'Not available'}
                  </strong>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Conductivity / Resistivity</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB E: ADDITIONAL INFO (ISOTOPES, CAS, SAFETY, REFERENCES) */}
        {activeTab === 'additional' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Grid: Common Oxidation States & CAS Registry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
              {/* Oxidation States */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-cyan-400">
                  <Activity className="w-4 h-4" />
                  <span>Common Oxidation States</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {oxidationStates.map((st, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-cyan-300 font-bold text-sm shadow-sm"
                    >
                      {st}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 pt-2 font-sans leading-relaxed">
                  Oxidation states reflect the degree of oxidation (loss of electrons) in known chemical compounds.
                </p>
              </div>

              {/* Chemical Identification & Registry */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-violet-400">
                  <Database className="w-4 h-4" />
                  <span>Chemical Identification & Taxonomy</span>
                </div>

                <div className="space-y-2 text-xs pt-2">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">CAS Registry Number:</span>
                    <strong className="text-white">{casNumber || 'Not available / Unassigned'}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Standard Atomic Weight:</span>
                    <strong className="text-cyan-300">{currentElement.atomicMass} u</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">PubChem CID:</span>
                    <strong className="text-white">{currentElement.number <= 118 ? `CID ${23924 + currentElement.number}` : 'N/A'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Isotopes Table */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-white">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <span>Key Isotopes of {currentElement.name}</span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Dominant naturally occurring & notable radionuclides
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3">Nuclide</th>
                      <th className="py-2.5 px-3">Mass (u)</th>
                      <th className="py-2.5 px-3">Natural Abundance / Half-life</th>
                      <th className="py-2.5 px-3">Decay Mode</th>
                      <th className="py-2.5 px-3 text-right">Stability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {isotopes.map((iso, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white">
                          {iso.symbol} <span className="text-slate-400 font-normal">({iso.name})</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{iso.massNumber}</td>
                        <td className="py-2.5 px-3 text-cyan-300">
                          {iso.abundance || iso.halfLife || 'Trace'}
                        </td>
                        <td className="py-2.5 px-3 text-violet-300">
                          {iso.decayMode || (iso.isStable ? 'Stable' : 'Unknown')}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {iso.isStable ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                              Stable
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[10px] font-bold">
                              Radioactive
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chemical Safety & Handling Precautions */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-rose-400">
                <ShieldAlert className="w-4 h-4" />
                <span>Chemical Safety & Handling Precautions</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-3 font-sans">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-white block">Hazard Profile Summary:</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {safety.hazardSummary}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-white block">Handling & Storage Protocol:</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      {safety.handling}
                    </p>
                  </div>
                </div>

                {/* NFPA Fire Diamond Card */}
                {safety.nfpa && (
                  <div className="lg:col-span-4 p-5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col items-center justify-center font-mono text-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase mb-3">
                      NFPA 704 Standard Rating
                    </span>

                    <div className="relative w-28 h-28 my-1 flex items-center justify-center">
                      {/* Top: Flammability (Red) */}
                      <div className="absolute top-0 w-11 h-11 bg-red-600/90 text-white font-black text-sm flex items-center justify-center rounded-sm shadow rotate-45">
                        <span className="-rotate-45">{safety.nfpa.flammability}</span>
                      </div>
                      {/* Left: Health (Blue) */}
                      <div className="absolute left-0 w-11 h-11 bg-blue-600/90 text-white font-black text-sm flex items-center justify-center rounded-sm shadow rotate-45">
                        <span className="-rotate-45">{safety.nfpa.health}</span>
                      </div>
                      {/* Right: Instability (Yellow) */}
                      <div className="absolute right-0 w-11 h-11 bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center rounded-sm shadow rotate-45">
                        <span className="-rotate-45">{safety.nfpa.instability}</span>
                      </div>
                      {/* Bottom: Special (White) */}
                      <div className="absolute bottom-0 w-11 h-11 bg-slate-200 text-slate-950 font-black text-xs flex items-center justify-center rounded-sm shadow rotate-45">
                        <span className="-rotate-45">{safety.nfpa.special || '—'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mt-4 w-full">
                      <span>Health: <strong className="text-blue-400">{safety.nfpa.health}</strong></span>
                      <span>Flammability: <strong className="text-red-400">{safety.nfpa.flammability}</strong></span>
                      <span>Instability: <strong className="text-amber-400">{safety.nfpa.instability}</strong></span>
                      <span>Special: <strong className="text-slate-200">{safety.nfpa.special || 'None'}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scientific References & External Authority Sources */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-slate-300">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Scientific References & Trusted Authority Sources</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <a
                  href={`https://en.wikipedia.org/wiki/${encodeURIComponent(currentElement.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 flex items-center justify-between transition-all"
                >
                  <div>
                    <strong className="block text-white">Wikipedia Comprehensive Dossier</strong>
                    <span className="text-[10px] text-slate-500 font-mono">Academic literature & history</span>
                  </div>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>

                <a
                  href={`https://www.webelements.com/${encodeURIComponent(currentElement.name.toLowerCase())}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 flex items-center justify-between transition-all"
                >
                  <div>
                    <strong className="block text-white">WebElements Periodic Table</strong>
                    <span className="text-[10px] text-slate-500 font-mono">Mark Winter, Sheffield Univ.</span>
                  </div>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>

                <a
                  href="https://www.ciaaw.org/atomic-weights.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 flex items-center justify-between transition-all"
                >
                  <div>
                    <strong className="block text-white">IUPAC CIAAW Authority</strong>
                    <span className="text-[10px] text-slate-500 font-mono">Official standard atomic weights</span>
                  </div>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
