import React from 'react';
import { Link } from 'react-router-dom';
import {
  Atom,
  Search,
  X,
  Sun,
  Moon,
  HelpCircle,
  Info,
  Scale,
  Sparkles,
  Dice5,
  Bookmark,
  TrendingUp,
  Maximize2,
  RotateCcw,
} from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onOpenCompare: () => void;
  onOpenQuiz: () => void;
  onOpenTrends: () => void;
  onOpenElectronExplorer: () => void;
  onPickRandomElement: () => void;
  onOpenAbout: () => void;
  onOpenHelp: () => void;
  favoritesCount: number;
  onlyFavorites: boolean;
  onToggleOnlyFavorites: () => void;
  searchMatchCount: number;
  onOpenFitView?: () => void;
  onResetAll?: () => void;
  hasActiveSelections?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  onClearSearch,
  searchInputRef,
  onOpenCompare,
  onOpenQuiz,
  onOpenTrends,
  onPickRandomElement,
  onOpenAbout,
  onOpenHelp,
  favoritesCount,
  onlyFavorites,
  onToggleOnlyFavorites,
  searchMatchCount,
  onOpenFitView,
  onResetAll,
  hasActiveSelections = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-300 bg-[#070b19]/80 border-cyan-500/20 text-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group cursor-pointer">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-600/30 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:border-cyan-400 transition-colors">
            <Atom className="w-5 h-5 text-cyan-400 animate-[spin_12s_linear_infinite]" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent group-hover:to-cyan-300 transition-colors">
                ELEMENTS
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
                LAB v3.0
              </span>
            </div>
            <span className="text-[10px] text-slate-400 tracking-tight font-mono hidden sm:inline">
              INTERACTIVE PERIODIC TABLE & EXPLORER
            </span>
          </div>
        </Link>

        {/* Global Instant Search Bar */}
        <div className="flex-1 max-w-md mx-2 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-cyan-400/70 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, symbol, or #..."
              className="w-full pl-10 pr-20 py-2 text-xs font-mono rounded-xl bg-slate-900/60 border border-cyan-500/30 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all"
            />

            <div className="absolute right-2.5 flex items-center gap-1.5">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold text-cyan-400/80 bg-slate-800/80 border border-cyan-500/20 rounded shadow">
                  /
                </kbd>
              )}
            </div>
          </div>

          {searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1.5 px-3 py-1.5 rounded-lg bg-slate-900/95 border border-cyan-500/30 shadow-xl flex items-center justify-between text-[11px] font-mono text-cyan-300 z-50">
              <span>{searchMatchCount} matching {searchMatchCount === 1 ? 'element' : 'elements'}</span>
              <span className="text-[10px] text-slate-400">Press Esc to clear</span>
            </div>
          )}
        </div>

        {/* Action Controls & Navigation Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Reset Every Selection Button */}
          {onResetAll && (
            <button
              type="button"
              onClick={onResetAll}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                hasActiveSelections
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                  : 'bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white border-slate-700/60'
              }`}
              title="Reset every selection, filter, search, and element choice"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${hasActiveSelections ? 'text-rose-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Reset All</span>
              <span className="sm:hidden">Reset</span>
            </button>
          )}

          {/* Compare Elements */}
          <button
            type="button"
            onClick={onOpenCompare}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 hover:border-cyan-400/40 transition-all cursor-pointer shadow-sm"
            title="Compare 2 or 3 elements side-by-side"
          >
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>Compare</span>
          </button>

          {/* Periodic Trends */}
          <button
            type="button"
            onClick={onOpenTrends}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 hover:border-violet-400/40 transition-all cursor-pointer shadow-sm"
            title="View Periodic Trends & Heatmap"
          >
            <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
            <span>Trends</span>
          </button>

          {/* Complete Table (No Scroll) View */}
          {onOpenFitView && (
            <button
              type="button"
              onClick={onOpenFitView}
              className="relative inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 hover:from-cyan-300 hover:to-teal-200 border-2 border-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.7)] hover:shadow-[0_0_30px_rgba(34,211,238,0.9)] ring-2 ring-cyan-400/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0 animate-pulse"
              title="Show complete periodic table without scrolling"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
              </span>
              <Maximize2 className="w-3.5 h-3.5 text-slate-950" strokeWidth={2.8} />
              <span className="tracking-tight uppercase">Full Table (No Scroll)</span>
            </button>
          )}

          {/* Science Quiz */}
          <button
            type="button"
            onClick={onOpenQuiz}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
            title="Test your chemistry knowledge with Quiz Mode"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Quiz Mode</span>
          </button>

          {/* Random Element */}
          <button
            type="button"
            onClick={onPickRandomElement}
            className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 hover:border-cyan-500/40 transition-all cursor-pointer"
            title="Discover Random Element"
          >
            <Dice5 className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Bookmarked Favorites filter */}
          <button
            type="button"
            onClick={onToggleOnlyFavorites}
            className={`relative p-2 rounded-lg transition-all cursor-pointer border ${
              onlyFavorites
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                : 'text-slate-300 hover:text-amber-300 bg-slate-800/50 hover:bg-slate-700/60 border-slate-700/50'
            }`}
            title="Toggle Favorites Only"
          >
            <Bookmark className="w-4 h-4" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold text-[9px] flex items-center justify-center font-mono">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* About Modal */}
          <button
            type="button"
            onClick={onOpenAbout}
            className="p-2 rounded-lg text-slate-300 hover:text-cyan-300 bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 hover:border-cyan-500/40 transition-all cursor-pointer"
            title="About Elements Lab"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Help Modal */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="p-2 rounded-lg text-slate-300 hover:text-cyan-300 bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 hover:border-cyan-500/40 transition-all cursor-pointer"
            title="Periodic Table & Navigation Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-300 hover:text-cyan-300 bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 hover:border-cyan-500/40 transition-all cursor-pointer"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-violet-300" />}
          </button>
        </div>
      </div>
    </header>
  );
};
