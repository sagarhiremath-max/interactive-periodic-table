import React, { useRef, useEffect } from 'react';
import {
  Search,
  X,
  Sun,
  Moon,
  Columns,
  Grid,
  Award,
  ArrowRightLeft,
  RotateCcw,
  Atom,
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchMatchCount: number;
  layoutMode: 'standard' | 'extended';
  onToggleLayout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenQuiz: () => void;
  onOpenCompare: () => void;
  onResetAll: () => void;
  hasActiveFiltersOrSearch: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  searchMatchCount,
  layoutMode,
  onToggleLayout,
  darkMode,
  onToggleDarkMode,
  onOpenQuiz,
  onOpenCompare,
  onResetAll,
  hasActiveFiltersOrSearch,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Press '/' to quickly focus the search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors px-4 sm:px-6 py-3.5 ${
        darkMode
          ? 'bg-slate-950/85 border-slate-800 text-white'
          : 'bg-white/85 border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Branding & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Atom size={24} className="animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-none bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Periodic Table
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                118 Elements
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive Chemical Explorer & Atomic Reference
            </p>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-md relative">
          <div className="relative flex items-center">
            <Search
              size={18}
              className="absolute left-3.5 text-slate-400 pointer-events-none"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, symbol, or atomic number... (Press '/')"
              className={`w-full pl-10 pr-20 py-2 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 border ${
                darkMode
                  ? 'bg-slate-900/90 border-slate-700/80 text-white placeholder-slate-400'
                  : 'bg-slate-100/90 border-slate-300 text-slate-900 placeholder-slate-500'
              }`}
            />
            {searchQuery ? (
              <div className="absolute right-2.5 flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                  {searchMatchCount} found
                </span>
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <kbd className="absolute right-3 hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Layout switch: Standard vs Extended */}
          <button
            onClick={onToggleLayout}
            title={
              layoutMode === 'standard'
                ? 'Switch to Extended 32-Column Layout'
                : 'Switch to Standard 18-Column Layout'
            }
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              layoutMode === 'extended'
                ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-sm'
                : darkMode
                ? 'bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {layoutMode === 'standard' ? <Grid size={15} /> : <Columns size={15} />}
            <span className="hidden sm:inline">
              {layoutMode === 'standard' ? 'Extended (32-Col)' : 'Standard (18-Col)'}
            </span>
          </button>

          {/* Side-by-side compare button */}
          <button
            onClick={onOpenCompare}
            title="Compare two elements side-by-side"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              darkMode
                ? 'bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-800 hover:text-cyan-400'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ArrowRightLeft size={15} />
            <span className="hidden lg:inline">Compare</span>
          </button>

          {/* Chemistry Quiz */}
          <button
            onClick={onOpenQuiz}
            title="Test your periodic table knowledge"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-orange-500/20 transition-all font-bold"
          >
            <Award size={15} />
            <span>Quiz</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`p-2 rounded-xl border transition-colors ${
              darkMode
                ? 'bg-slate-900 border-slate-750 text-amber-400 hover:bg-slate-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Reset Filters */}
          {hasActiveFiltersOrSearch && (
            <button
              onClick={onResetAll}
              title="Reset all filters and search"
              className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 transition-colors"
            >
              <RotateCcw size={17} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
