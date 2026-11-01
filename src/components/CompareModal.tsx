import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Scale,
  ArrowRightLeft,
  Plus,
  Trash2,
  Shuffle,
  RotateCcw,
  Copy,
  Download,
  Share2,
  Bookmark,
  Check,
  Sparkles,
  BarChart3,
  Table as TableIcon,
  Flame,
  LayoutGrid
} from 'lucide-react';
import { type ElementData, ELEMENTS_DATA } from '../data/elements';
import { ElementSelectorCard } from './compare/ElementSelectorCard';
import { VisualMetricBars } from './compare/VisualMetricBars';
import { AdvancedVisualAnalytics } from './compare/AdvancedVisualAnalytics';
import { DetailedComparisonTable } from './compare/DetailedComparisonTable';
import { ComparisonInsights } from './compare/ComparisonInsights';
import {
  generateComparisonSummary,
  exportComparisonToCSV,
  copyComparisonToClipboard,
} from './compare/compareUtils';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  element1: ElementData | null;
  element2: ElementData | null;
  darkMode: boolean;
  onSelectElement1: (element: ElementData | null) => void;
  onSelectElement2: (element: ElementData | null) => void;
}

type TabView = 'all' | 'metrics' | 'analytics' | 'table' | 'insights';

const PRESET_COMPARISONS = [
  { name: 'Hydrogen vs Carbon (Organic Baseline)', numbers: [1, 6] },
  { name: 'Sodium vs Chlorine (Ionic Bonding)', numbers: [11, 17] },
  { name: 'Carbon vs Silicon (Group 14 Analogues)', numbers: [6, 14] },
  { name: 'Iron vs Gold (Transition Metals)', numbers: [26, 79] },
  { name: 'Oxygen vs Nitrogen (Atmospheric Life)', numbers: [8, 7] },
  { name: 'Lithium vs Sodium vs Potassium (Alkali Group)', numbers: [3, 11, 19] },
];

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  element1,
  element2,
  onSelectElement1,
  onSelectElement2,
}) => {
  // Elements state: support 2 or 3 elements (starts empty unless passed by user)
  const [element3, setElement3] = useState<ElementData | null>(null);
  const [showThird, setShowThird] = useState<boolean>(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<TabView>('all');

  // Copy / Share feedback state
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [sharedFeedback, setSharedFeedback] = useState(false);

  // Saved favorites (persisted in localStorage)
  const [favorites, setFavorites] = useState<Array<{ name: string; numbers: number[] }>>(() => {
    try {
      const saved = localStorage.getItem('elements_compare_favorites');
      return saved ? JSON.parse(saved) : PRESET_COMPARISONS;
    } catch {
      return PRESET_COMPARISONS;
    }
  });
  const [showFavoritesMenu, setShowFavoritesMenu] = useState(false);

  const activeElements = useMemo(() => {
    const list: ElementData[] = [];
    if (element1) list.push(element1);
    if (element2) list.push(element2);
    if (showThird && element3) list.push(element3);
    return list;
  }, [element1, element2, element3, showThird]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Dynamic summary sentences derived from actual data
  const comparisonSummary = useMemo(() => {
    return generateComparisonSummary(activeElements);
  }, [activeElements]);

  // Swap elements 1 and 2
  const handleSwap = () => {
    onSelectElement1(element2);
    onSelectElement2(element1);
  };

  // Reset: clear all selections and leave user to select
  const handleReset = () => {
    onSelectElement1(null);
    onSelectElement2(null);
    setElement3(null);
    setShowThird(false);
  };

  // Compare with Hydrogen shortcut
  const handleCompareWithHydrogen = () => {
    onSelectElement1(ELEMENTS_DATA[0]);
  };

  // Random comparison
  const handleRandom = () => {
    const pickRandom = (exclude: number[] = []) => {
      const available = ELEMENTS_DATA.filter((el) => !exclude.includes(el.number));
      return available[Math.floor(Math.random() * available.length)];
    };

    const r1 = pickRandom();
    const r2 = pickRandom([r1.number]);
    onSelectElement1(r1);
    onSelectElement2(r2);

    if (showThird) {
      const r3 = pickRandom([r1.number, r2.number]);
      setElement3(r3);
    }
  };

  // Save current comparison as favorite
  const handleSaveFavorite = () => {
    const numbers = activeElements.map((e) => e.number);
    const name = activeElements.map((e) => e.symbol).join(' vs ');
    const exists = favorites.some((f) => f.numbers.join(',') === numbers.join(','));

    let updated: Array<{ name: string; numbers: number[] }>;
    if (exists) {
      updated = favorites.filter((f) => f.numbers.join(',') !== numbers.join(','));
    } else {
      updated = [{ name, numbers }, ...favorites];
    }

    setFavorites(updated);
    try {
      localStorage.setItem('elements_compare_favorites', JSON.stringify(updated));
    } catch {}
  };

  const isCurrentFavorite = useMemo(() => {
    const currentKey = activeElements.map((e) => e.number).join(',');
    return favorites.some((f) => f.numbers.join(',') === currentKey);
  }, [activeElements, favorites]);

  // Load a preset comparison
  const handleLoadFavorite = (item: { numbers: number[] }) => {
    const el1 = ELEMENTS_DATA.find((e) => e.number === item.numbers[0]);
    const el2 = ELEMENTS_DATA.find((e) => e.number === item.numbers[1]);
    const el3 = item.numbers[2] ? ELEMENTS_DATA.find((e) => e.number === item.numbers[2]) : null;

    if (el1) onSelectElement1(el1);
    if (el2) onSelectElement2(el2);
    if (el3) {
      setElement3(el3);
      setShowThird(true);
    } else {
      setShowThird(false);
    }
    setShowFavoritesMenu(false);
  };

  // Copy results to clipboard
  const handleCopy = async () => {
    const success = await copyComparisonToClipboard(activeElements);
    if (success) {
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2000);
    }
  };

  // Export results as CSV
  const handleExport = () => {
    exportComparisonToCSV(activeElements);
  };

  // Generate shareable link
  const handleShare = () => {
    const nums = activeElements.map((e) => e.number).join(',');
    const url = new URL(window.location.href);
    url.searchParams.set('compare', nums);
    navigator.clipboard.writeText(url.toString());
    setSharedFeedback(true);
    setTimeout(() => setSharedFeedback(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-matrix-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto font-sans select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-6xl max-h-[94vh] flex flex-col rounded-3xl bg-slate-950 border border-cyan-500/30 text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_30px_rgba(6,182,212,0.15)] overflow-hidden my-auto">
        {/* 1. Header with Gradient Accent & Scientific Actions */}
        <div className="px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/25 to-violet-500/25 text-cyan-400 border border-cyan-500/40 shadow-inner">
              <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="compare-matrix-title" className="text-base sm:text-lg font-black text-white tracking-tight">
                  Element Property Comparison Matrix
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hidden sm:inline-block">
                  Scientific Analyzer v3.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Explore and compare chemical properties interactively across {showThird ? '3 elements' : '2 elements'}
              </p>
            </div>
          </div>

          {/* Quick Toolbar Actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Toggle 3rd Element */}
            {!showThird ? (
              <button
                type="button"
                onClick={() => setShowThird(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all cursor-pointer"
                title="Add 3rd element for three-way comparison"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add 3rd Element</span>
                <span className="sm:hidden">+ 3rd</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowThird(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/60 transition-all cursor-pointer"
                title="Remove 3rd element"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Remove 3rd</span>
              </button>
            )}

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwap}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
              title="Quick Swap: Exchange Element 1 and Element 2"
              aria-label="Swap elements"
            >
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Random Comparison Button */}
            <button
              type="button"
              onClick={handleRandom}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
              title="Random Comparison: Pick exciting random atoms"
              aria-label="Random comparison"
            >
              <Shuffle className="w-4 h-4 text-violet-400" />
            </button>

            {/* Compare with Hydrogen Shortcut */}
            <button
              type="button"
              onClick={handleCompareWithHydrogen}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-mono transition-colors cursor-pointer"
              title="Compare current element with Hydrogen"
            >
              <span>+ H (Z=1)</span>
            </button>

            {/* Favorite Bookmark */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFavoritesMenu(!showFavoritesMenu)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isCurrentFavorite
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 text-slate-300 hover:text-amber-400 border-slate-700/80'
                }`}
                title="Favorite & Preset Comparisons"
              >
                <Bookmark className="w-4 h-4" />
              </button>

              {/* Favorites Popover */}
              {showFavoritesMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-2xl p-3 z-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <span className="font-bold text-white uppercase text-[10px] tracking-wider">Presets & Favorites</span>
                    <button
                      type="button"
                      onClick={handleSaveFavorite}
                      className="text-[10px] font-semibold text-cyan-400 hover:underline cursor-pointer"
                    >
                      {isCurrentFavorite ? 'Remove Current' : '+ Bookmark Current'}
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1" style={{ scrollbarWidth: 'thin' }}>
                    {favorites.map((fav, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleLoadFavorite(fav)}
                        className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <span className="font-medium truncate">{fav.name}</span>
                        <span className="text-[10px] font-mono text-cyan-400 shrink-0 ml-2">Load</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Copy Table */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer relative"
              title="Copy comparison summary to clipboard"
            >
              {copiedFeedback ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExport}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
              title="Download comparison matrix as CSV file"
            >
              <Download className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Share Link */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
              title="Copy shareable link to this comparison"
            >
              {sharedFeedback ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
              title="Reset to default (Hydrogen vs Carbon)"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 transition-all cursor-pointer ml-1"
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Section Navigation Tabs */}
        <div className="px-5 py-2.5 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between gap-2 overflow-x-auto shrink-0 select-none">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_2px_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Full Analytics Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('metrics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'metrics'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_2px_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Metric Bars</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-violet-500 text-white font-bold shadow-[0_2px_10px_rgba(139,92,246,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Radar & Charts</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_2px_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Detailed Table</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('insights')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'insights'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_2px_10px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Insights & Facts</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-500 hidden lg:inline">
            Comparing: {activeElements.map((e) => `${e.symbol} (#${e.number})`).join(' vs ')}
          </span>
        </div>

        {/* 3. Scrollable Content Area - Scroll anywhere here and the whole page content flows naturally */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5" style={{ scrollbarWidth: 'thin' }}>
          {/* Streamlined Compact Element Selection Cards */}
          <div
            className={`grid grid-cols-1 ${
              showThird ? 'md:grid-cols-3' : 'md:grid-cols-2'
            } gap-2.5 sm:gap-3`}
          >
            <ElementSelectorCard
              slotIndex={0}
              element={element1}
              onSelectElement={onSelectElement1}
            />
            <ElementSelectorCard
              slotIndex={1}
              element={element2}
              onSelectElement={onSelectElement2}
            />
            {showThird && (
              <ElementSelectorCard
                slotIndex={2}
                element={element3}
                onSelectElement={setElement3}
                canRemove
                onRemoveSlot={() => setShowThird(false)}
              />
            )}
          </div>

          {/* Empty / Incomplete Selection Guidance */}
          {activeElements.length < 2 ? (
            <div className="py-12 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto">
                <Scale className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {activeElements.length === 1
                    ? `1 of 2 Elements Selected (${activeElements[0].name})`
                    : 'Choose Elements to Compare'}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeElements.length === 1
                    ? 'Now select a second element in the search slot above to generate comparative charts, metric bars, and chemical insights.'
                    : 'Search and select elements in the slots above, or launch a curated scientific comparison below:'}
                </p>
              </div>

              {/* Quick Launch Preset Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
                {PRESET_COMPARISONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLoadFavorite(preset)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>{preset.name}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleRandom}
                  className="px-3 py-1.5 rounded-xl bg-violet-950/40 border border-violet-500/40 hover:bg-violet-900/50 text-xs font-semibold text-violet-300 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Pick 2 Random Elements</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Dynamic Automatic Comparison Summary */}
              {comparisonSummary.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 shadow-lg space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider font-mono">
                    <Sparkles className="w-4 h-4" />
                    <span>Chemical Synthesis & Comparative Summary</span>
                  </div>
                  <div className="space-y-1.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {comparisonSummary.map((sentence, idx) => (
                      <p key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold select-none">•</span>
                        <span>{sentence}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Section: Visual Metric Bars */}
              {(activeTab === 'all' || activeTab === 'metrics') && (
                <VisualMetricBars elements={activeElements} />
              )}

              {/* Section: Advanced Visual Analytics (Radar, Grouped Bar, Difference Delta) */}
              {(activeTab === 'all' || activeTab === 'analytics') && (
                <AdvancedVisualAnalytics elements={activeElements} />
              )}

              {/* Section: Comparison Insights */}
              {(activeTab === 'all' || activeTab === 'insights') && (
                <ComparisonInsights elements={activeElements} />
              )}

              {/* Section: Detailed Comparison Table */}
              {(activeTab === 'all' || activeTab === 'table') && (
                <DetailedComparisonTable elements={activeElements} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
