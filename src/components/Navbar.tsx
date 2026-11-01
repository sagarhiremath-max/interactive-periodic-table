import React, { useState, useRef, useEffect } from 'react';
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
  Menu,
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
  onOpenAtomExplorer?: () => void;
  onOpenElectronExplorer?: () => void;
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
  onOpenAtomExplorer,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-300 bg-[#070b19]/90 border-cyan-500/20 text-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* LEFT: Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group cursor-pointer select-none">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-slate-900 to-violet-600/30 border border-cyan-400/40 shadow-[0_0_16px_rgba(6,182,212,0.3)] group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.45)] transition-all">
            <Atom className="w-5 h-5 text-cyan-400 animate-[spin_16s_linear_infinite]" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent group-hover:to-cyan-300 transition-colors">
                ELEMENTS
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 shadow-sm">
                LAB v3.0
              </span>
            </div>
            <span className="text-[10px] text-slate-400 tracking-tight font-mono hidden md:inline">
              INTERACTIVE PERIODIC TABLE & EXPLORER
            </span>
          </div>
        </Link>

        {/* CENTER: Flexible Global Instant Search Bar */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-cyan-400/70 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, symbol, or #..."
              className="w-full h-9 pl-9 pr-14 text-xs font-mono rounded-xl bg-slate-900/80 border border-cyan-500/30 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all"
            />

            <div className="absolute right-2 flex items-center gap-1.5">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
              <span className="text-[10px] text-slate-400">Esc to clear</span>
            </div>
          )}
        </div>

        {/* RIGHT: Action Controls & Tools with Unified h-9 (36px) Heights */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Reset All */}
          {onResetAll && (
            <button
              type="button"
              onClick={onResetAll}
              className={`h-9 inline-flex items-center gap-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
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

          {/* 3D Atom Explorer Button */}
          {onOpenAtomExplorer && (
            <button
              type="button"
              onClick={onOpenAtomExplorer}
              className="h-9 hidden md:inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold text-cyan-200 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-purple-950/80 hover:from-cyan-900/90 hover:to-purple-900/90 border border-cyan-500/40 hover:border-cyan-300 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.2)]"
              title="Launch Interactive 3D Atom Explorer (Bohr Shells & Quantum Orbitals)"
            >
              <Atom className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
              <span>3D Atom</span>
            </button>
          )}

          {/* Compare Button */}
          <button
            type="button"
            onClick={onOpenCompare}
            className="h-9 hidden md:inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium text-slate-200 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 hover:border-cyan-400/40 transition-all cursor-pointer shadow-sm"
            title="Compare 2 or 3 elements side-by-side"
          >
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>Compare</span>
          </button>

          {/* Trends Button */}
          <button
            type="button"
            onClick={onOpenTrends}
            className="h-9 hidden lg:inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium text-slate-200 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 hover:border-violet-400/40 transition-all cursor-pointer shadow-sm"
            title="View Periodic Trends & Heatmap"
          >
            <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
            <span>Trends</span>
          </button>

          {/* Full Table Pill Button */}
          {onOpenFitView && (
            <button
              type="button"
              onClick={onOpenFitView}
              className="h-9 inline-flex items-center gap-1.5 px-3 sm:px-3.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 border border-cyan-200/80 shadow-[0_0_16px_rgba(6,182,212,0.5)] hover:shadow-[0_0_22px_rgba(6,182,212,0.7)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0"
              title="Show complete periodic table without scrolling"
            >
              <Maximize2 className="w-3.5 h-3.5 text-slate-950" strokeWidth={2.5} />
              <span className="tracking-tight uppercase">Full Table</span>
            </button>
          )}

          {/* Quiz Mode Button */}
          <button
            type="button"
            onClick={onOpenQuiz}
            className="h-9 hidden xl:inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-medium text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
            title="Test your chemistry knowledge with Quiz Mode"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quiz Mode</span>
          </button>

          {/* Random Element */}
          <button
            type="button"
            onClick={onPickRandomElement}
            className="w-9 h-9 hidden sm:inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 hover:border-cyan-500/40 transition-all cursor-pointer"
            title="Discover Random Element"
          >
            <Dice5 className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Bookmarks / Favorites Filter */}
          <button
            type="button"
            onClick={onToggleOnlyFavorites}
            className={`w-9 h-9 relative inline-flex items-center justify-center rounded-lg transition-all cursor-pointer border ${
              onlyFavorites
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                : 'text-slate-300 hover:text-amber-300 bg-slate-800/50 hover:bg-slate-700/60 border-slate-700/50'
            }`}
            title="Toggle Favorites Only"
          >
            <Bookmark className="w-4 h-4" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold text-[9px] flex items-center justify-center font-mono shadow">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Info / About Modal */}
          <button
            type="button"
            onClick={onOpenAbout}
            className="w-9 h-9 hidden md:inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-cyan-300 bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 hover:border-cyan-500/40 transition-all cursor-pointer"
            title="About Elements Lab"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Help Modal */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="w-9 h-9 hidden md:inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-cyan-300 bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 hover:border-cyan-500/40 transition-all cursor-pointer"
            title="Periodic Table & Navigation Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-cyan-300 bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 hover:border-cyan-500/40 transition-all cursor-pointer"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-violet-300" />}
          </button>

          {/* Mobile Overflow Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 md:hidden inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 transition-all cursor-pointer"
            title="More Options"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Responsive Mobile / Tablet Overflow Dropdown */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-3 shadow-2xl space-y-2 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            {onOpenAtomExplorer && (
              <button
                type="button"
                onClick={() => {
                  onOpenAtomExplorer();
                  setMobileMenuOpen(false);
                }}
                className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-gradient-to-r from-cyan-950/90 to-purple-950/90 border border-cyan-500/40 text-cyan-200 font-bold hover:border-cyan-400"
              >
                <Atom className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                <span>Launch 3D Atom Explorer</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onOpenCompare();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-cyan-300 hover:border-cyan-500/30"
            >
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Compare</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenTrends();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-violet-300 hover:border-violet-500/30"
            >
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <span>Trends</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenQuiz();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-cyan-300 hover:border-cyan-500/30"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Quiz Mode</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onPickRandomElement();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-amber-300 hover:border-amber-500/30"
            >
              <Dice5 className="w-4 h-4 text-amber-400" />
              <span>Random Element</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenAbout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-cyan-300 hover:border-cyan-500/30"
            >
              <Info className="w-4 h-4 text-cyan-400" />
              <span>About</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenHelp();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-cyan-300 hover:border-cyan-500/30"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Help & Keys</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
